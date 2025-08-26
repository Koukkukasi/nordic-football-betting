// Test PostgreSQL Database Connection
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('🔍 Testing PostgreSQL connection...\n');
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in .env.local');
    console.log('\nPlease make sure .env.local exists and contains DATABASE_URL');
    process.exit(1);
  }

  // Hide password in output
  const urlParts = databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@(.+)/);
  if (urlParts) {
    console.log(`📦 Database URL: postgresql://${urlParts[1]}:****@${urlParts[3]}\n`);
  }

  const prisma = new PrismaClient({
    log: ['error'],
  });

  try {
    // Test connection
    console.log('Attempting to connect...');
    await prisma.$connect();
    console.log('✅ Successfully connected to PostgreSQL!\n');

    // Check if database exists
    const result = await prisma.$queryRaw`SELECT current_database() as database, version() as version`;
    console.log('📊 Database Info:');
    console.log(`   Database: ${result[0].database}`);
    console.log(`   Version: ${result[0].version.split(',')[0]}\n`);

    // Check tables
    const tables = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `;
    
    if (tables.length > 0) {
      console.log(`📋 Found ${tables.length} tables:`);
      tables.forEach(t => console.log(`   - ${t.tablename}`));
    } else {
      console.log('⚠️  No tables found. Run migrations with: npm run db:setup');
    }

    console.log('\n🎉 Database connection test successful!');
    
  } catch (error) {
    console.error('❌ Connection failed!\n');
    
    if (error.message.includes('P1001')) {
      console.error('Error: Cannot reach database server');
      console.error('Solutions:');
      console.error('1. Make sure PostgreSQL service is running');
      console.error('2. Check if port 5432 is available');
      console.error('3. Verify localhost connection is allowed');
    } else if (error.message.includes('P1000')) {
      console.error('Error: Authentication failed');
      console.error('Solutions:');
      console.error('1. Check your PostgreSQL password in .env.local');
      console.error('2. Make sure the postgres user exists');
      console.error('3. Run setup-env.bat to update password');
    } else if (error.message.includes('P1002')) {
      console.error('Error: Database does not exist');
      console.error('Solutions:');
      console.error('1. Run create-database.bat to create the database');
      console.error('2. Or use pgAdmin to create "nordic_football_betting" database');
    } else {
      console.error('Error details:', error.message);
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testConnection().catch(console.error);