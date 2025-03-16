const { Client } = require('pg');

async function listTables() {
  const connectionString = 'postgresql://postgres.mkmvxrgfjzogxhbzvgxk:PacoHera94747@aws-0-eu-central-1.pooler.supabase.com:5432/postgres';
  
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log('Connected to Supabase database');
    
    const query = `
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema') 
      ORDER BY table_schema, table_name;
    `;
    
    const result = await client.query(query);
    
    console.log('Tables in your Supabase database:');
    console.log('--------------------------------');
    
    if (result.rows.length === 0) {
      console.log('No tables found');
    } else {
      result.rows.forEach(row => {
        console.log(`${row.table_schema}.${row.table_name}`);
      });
    }
  } catch (error) {
    console.error('Error connecting to database:', error.message);
  } finally {
    await client.end();
    console.log('Connection closed');
  }
}

listTables(); 