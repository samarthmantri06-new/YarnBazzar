const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const counts = [
  '20s','24s','30s','34s','40s','50s','60s','80s','100s','120s',
  '2/20s','2/30s','2/40s','2/60s'
];

const types = [
  'Carded','Combed','Compact','OE (Open End)',
  'Vortex','Siro','Slub','Melange','Gassed & Mercerized'
];

const categories = [
  '100% Cotton','Polyester','Viscose','Blended (PC)','Blended (PV)',
  'Linen','Bamboo','Modal','Acrylic','Wool'
];

async function main() {
  console.log('🌱 Starting YarnBazaar database seeding...');

  // 1. Clear database
  console.log('🧹 Clearing existing database data...');
  await prisma.listing.deleteMany();
  await prisma.buyerReport.deleteMany();
  await prisma.dropdownOption.deleteMany();
  await prisma.seller.deleteMany();
  await prisma.buyer.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.blockedNumber.deleteMany();
  console.log('✅ Existing database cleared');

  // 2. Seed dropdown options
  for (const value of counts) {
    await prisma.dropdownOption.create({
      data: { fieldType: 'COUNT', value }
    });
  }
  console.log(`✅ Seeded ${counts.length} COUNT options`);

  for (const value of types) {
    await prisma.dropdownOption.create({
      data: { fieldType: 'TYPE', value }
    });
  }
  console.log(`✅ Seeded ${types.length} TYPE options`);

  for (const value of categories) {
    await prisma.dropdownOption.create({
      data: { fieldType: 'CATEGORY', value }
    });
  }
  console.log(`✅ Seeded ${categories.length} CATEGORY options`);

  // 3. Seed admin account
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  await prisma.admin.create({
    data: {
      email: 'admin@yarnbazaar.com',
      password: adminPassword,
      name: 'Super Admin'
    }
  });
  console.log('✅ Admin account created: admin@yarnbazaar.com | Admin@123');

  // 4. Seed test sellers
  const seller1Password = await bcrypt.hash('Seller@123', 10);
  const seller1 = await prisma.seller.create({
    data: {
      gstNumber: '27AAAAA1111A1Z1',
      firmName: 'Apex Textiles',
      proprietorName: 'Amit Sharma',
      email: 'seller1@test.com',
      password: seller1Password,
      whatsappNumber: '9876543210',
      state: 'Maharashtra',
      district: 'Mumbai',
      city: 'Mumbai',
      exactAddress: '101, Apex Towers, Mumbai Main Road',
      status: 'APPROVED'
    }
  });
  console.log('✅ Test Seller 1 created: seller1@test.com | Seller@123');

  const seller2Password = await bcrypt.hash('Seller@456', 10);
  const seller2 = await prisma.seller.create({
    data: {
      gstNumber: '24BBBBB2222B2Z2',
      firmName: 'Bharti Yarns',
      proprietorName: 'Bhavesh Patel',
      email: 'seller2@test.com',
      password: seller2Password,
      whatsappNumber: '9898989898',
      state: 'Gujarat',
      district: 'Surat',
      city: 'Surat',
      exactAddress: 'G-5, Textile Plaza, Ring Road, Surat',
      status: 'APPROVED'
    }
  });
  console.log('✅ Test Seller 2 created: seller2@test.com | Seller@456');

  // 5. Seed test buyers
  const buyer1Password = await bcrypt.hash('Buyer@123', 10);
  await prisma.buyer.create({
    data: {
      fullName: 'Rajesh Kumar',
      email: 'buyer1@test.com',
      password: buyer1Password,
      whatsappNumber: '9123456789'
    }
  });
  console.log('✅ Test Buyer 1 created: buyer1@test.com | Buyer@123');

  const buyer2Password = await bcrypt.hash('Buyer@456', 10);
  await prisma.buyer.create({
    data: {
      fullName: 'Suresh Sen',
      email: 'buyer2@test.com',
      password: buyer2Password,
      whatsappNumber: '9223456789'
    }
  });
  console.log('✅ Test Buyer 2 created: buyer2@test.com | Buyer@456');

  // 6. Seed sample listings
  await prisma.listing.createMany({
    data: [
      {
        sellerId: seller1.id,
        count: '30s',
        type: 'Combed',
        category: '100% Cotton',
        name: 'Apex Combed Warp',
        rate: 262.50,
        availability: 'AVAILABLE',
        packaging: '50kg bags',
        csp: '2800'
      },
      {
        sellerId: seller1.id,
        count: '40s',
        type: 'Compact',
        category: '100% Cotton',
        name: 'Apex Compact Hosiery',
        rate: 284.00,
        availability: 'AVAILABLE',
        packaging: '50kg bags',
        csp: '3100'
      },
      {
        sellerId: seller2.id,
        count: '30s',
        type: 'Carded',
        category: '100% Cotton',
        name: 'Bharti Carded Weft',
        rate: 248.00,
        availability: 'BOOKING',
        packaging: '60kg bags',
        csp: '2500'
      }
    ]
  });
  console.log('✅ Seeded sample listings for active sellers');

  console.log('\n🎉 YarnBazaar database seeded successfully!');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

