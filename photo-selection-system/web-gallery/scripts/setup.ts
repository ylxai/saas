// scripts/setup.ts
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { initializeSchema, seedAdminUser } = require('../lib/db');

async function main() {
  try {
    console.log('==> Starting database initialization...');
    await initializeSchema();
    console.log('✔ Schema initialized');

    console.log('==> Seeding default admin user (username: nandika) ...');
    await seedAdminUser();
    console.log('✔ Admin user seeded');

    console.log('✅ Setup completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Setup failed:', err);
    process.exit(1);
  }
}

main();
