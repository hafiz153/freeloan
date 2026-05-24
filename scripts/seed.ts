const { config } = require('dotenv');
config({ path: require('path').resolve(process.cwd(), '.env') });

async function seed() {
  const { connectDB } = require('../src/lib/db/connect');
  const { User } = require('../src/lib/db/models/User');
  const { hashPassword } = require('../src/lib/utils/helpers');

  const users = [
    { name: 'Super Admin', email: 'admin@freeloan.com', password: '123456', role: 'super_admin', phone: '+8801700000001', emailVerified: true, isActive: true, kycStatus: 'verified' },
    { name: 'Demo Admin', email: 'admin2@freeloan.com', password: '123456', role: 'admin', phone: '+8801700000002', emailVerified: true, isActive: true, kycStatus: 'verified' },
    { name: 'Demo Donor', email: 'donor@freeloan.com', password: '123456', role: 'donor', phone: '+8801700000003', emailVerified: true, isActive: true, kycStatus: 'verified' },
    { name: 'Demo Borrower', email: 'borrower@freeloan.com', password: '123456', role: 'borrower', phone: '+8801700000004', emailVerified: true, isActive: true, kycStatus: 'verified' },
  ];

  try {
    await connectDB();
    console.log('Connected to MongoDB');

    for (const user of users) {
      const existing = await User.findOne({ email: user.email });
      if (existing) {
        console.log(`Skipping ${user.email} — already exists`);
        continue;
      }
      const hashedPassword = await hashPassword(user.password);
      await User.create({ ...user, password: hashedPassword });
      console.log(`Created ${user.role}: ${user.email}`);
    }

    console.log('\nSeed complete!');
    console.log('\nDemo credentials:');
    console.log('  Admin:    admin@freeloan.com / 123456');
    console.log('  Admin 2:  admin2@freeloan.com / 123456');
    console.log('  Donor:    donor@freeloan.com / 123456');
    console.log('  Borrower: borrower@freeloan.com / 123456');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
