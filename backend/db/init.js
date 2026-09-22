const fs = require('fs');
const path = require('path');
const pool = require('./connection');

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing Lead CRM database...');

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Execute schema
    await pool.query(schema);
    console.log('✅ Database schema created successfully');

    // Verify tables
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\n📋 Created tables:');
    result.rows.forEach(row => {
      console.log(`   • ${row.table_name}`);
    });

    console.log('\n✨ Database initialization complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    process.exit(1);
  }
}

initializeDatabase();
