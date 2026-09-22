const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');
const queries = require('../db/queries');
const { cleanAndParseLead, detectIndustry } = require('../utils/dataProcessing');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Get import history
router.get('/', async (req, res) => {
  try {
    const imports = await queries.getImports();
    res.json(imports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload and process CSV file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    console.log(`\n📥 Processing import: ${req.file.originalname}`);

    // Create import record
    const importRecord = await queries.addImport(req.file.originalname);
    const importId = importRecord.id;

    const results = [];
    const errors = [];
    let processedCount = 0;
    let duplicateCount = 0;

    // Parse CSV from buffer
    return new Promise((resolve, reject) => {
      Readable.from([req.file.buffer.toString()])
        .pipe(csv())
        .on('data', (data) => {
          results.push(data);
        })
        .on('end', async () => {
          try {
            console.log(`📋 Parsed ${results.length} rows from CSV`);

            // Process each row
            for (let i = 0; i < results.length; i++) {
              const row = results[i];

              try {
                // Clean and parse lead data
                const cleanedLead = cleanAndParseLead(row);

                // Check for duplicates
                const isDuplicate = await queries.checkDuplicateEmail(cleanedLead.email);
                if (isDuplicate) {
                  duplicateCount++;
                  continue;
                }

                // Get or create company
                const company = await queries.getOrCreateCompany(
                  cleanedLead.companyName,
                  cleanedLead.companyDomain,
                  cleanedLead.country
                );

                // Detect industry
                const industryData = await detectIndustry(cleanedLead.companyName, cleanedLead.companyDomain);

                // Update company with industry
                if (industryData.industry) {
                  await queries.updateCompanyIndustry(
                    company.id,
                    industryData.industry,
                    industryData.confidence
                  );
                }

                // Add lead
                const lead = await queries.addLead(
                  {
                    ...cleanedLead,
                    companyId: company.id,
                  },
                  importId
                );

                // Score the lead
                const companyLeadCount = await queries.getLeads({ companyId: company.id });
                const score = scoreLeadByFrequency(companyLeadCount.length);

                await queries.addLeadScore(lead.id, company.id, score);

                // Update company contact count
                await queries.updateCompanyContactCount(company.id);

                processedCount++;
                if (processedCount % 10 === 0) {
                  console.log(`  ✓ Processed ${processedCount} leads...`);
                }
              } catch (err) {
                errors.push({
                  row: i + 1,
                  error: err.message,
                  data: row,
                });
                console.error(`  ✗ Row ${i + 1}: ${err.message}`);
              }
            }

            console.log(`\n✨ Import complete!`);
            console.log(`   Processed: ${processedCount}`);
            console.log(`   Duplicates skipped: ${duplicateCount}`);
            console.log(`   Errors: ${errors.length}`);

            res.json({
              success: true,
              import_id: importId,
              file_name: req.file.originalname,
              total_rows: results.length,
              processed: processedCount,
              duplicates: duplicateCount,
              errors: errors.length,
              error_details: errors.slice(0, 10), // Return first 10 errors
            });

            resolve();
          } catch (err) {
            reject(err);
          }
        })
        .on('error', reject);
    });
  } catch (err) {
    console.error('Import error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Helper function to score leads by company frequency
function scoreLeadByFrequency(leadCountInCompany) {
  // Scale: 1 lead = 10 points, 5 leads = 50 points, 10+ leads = 100 points
  const frequencyScore = Math.min(leadCountInCompany * 10, 100);

  return {
    companyFrequencyScore: frequencyScore,
    businessPotentialScore: 50, // Default, to be refined based on industry
    industryScore: 50, // Default, to be set by industry detection
    recencyScore: 100, // New imports get high recency score
    totalScore: (frequencyScore + 50 + 50 + 100) / 4, // Average of all factors
    scoreRank: 0, // Will be calculated later
  };
}

module.exports = router;
