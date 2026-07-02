const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'excel_data.txt');
const seedFile = path.join(__dirname, '../backend/prisma/seed.js');

const rawData = fs.readFileSync(dataFile, 'utf-8');
const lines = rawData.split('\n').map(l => l.trim()).filter(l => l);

const counts = new Set();
const types = new Set();
const categories = new Set();
const listings = [];

for (const line of lines) {
  const parts = line.split('\t');
  if (parts.length < 5) continue;
  
  const count = parts[0]?.trim();
  const category = parts[1]?.trim();
  const type = parts[2]?.trim();
  const millName = parts[3]?.trim();
  const csp = parts[4]?.trim();
  const ww = parts[5]?.trim();
  let rex = parts[6]?.trim() || '';
  let rinc = parts[7]?.trim() || '';
  const avail = parts[8]?.trim();
  const notes = parts[9]?.trim();
  
  if (count) counts.add(count);
  if (category) categories.add(category);
  if (type) types.add(type);
  
  // Clean rate strings (e.g. ?199.00 -> 199.00)
  rex = rex.replace(/[^0-9.]/g, '');
  
  let rate = null;
  if (rex) rate = parseFloat(rex);
  
  let availability = 'AVAILABLE';
  // Attempt to parse availability if present in excel, otherwise default
  // Just use AVAILABLE for all for simplicity unless specified
  
  listings.push({
    count, category, type, name: millName, csp, yarnType: ww || '', rate, availability, packaging: notes || ''
  });
}

const countsArr = Array.from(counts).filter(Boolean);
const typesArr = Array.from(types).filter(Boolean);
const catsArr = Array.from(categories).filter(Boolean);

let seedScript = `const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const counts = ${JSON.stringify(countsArr, null, 2)};
const types = ${JSON.stringify(typesArr, null, 2)};
const categories = ${JSON.stringify(catsArr, null, 2)};

async function main() {
  console.log('🌱 Starting YarnMarket database seeding...');

  console.log('🧹 Clearing existing database data...');
  await prisma.listing.deleteMany();
  await prisma.buyerReport.deleteMany();
  await prisma.dropdownOption.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.buyer.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.blockedNumber.deleteMany();
  console.log('✅ Existing database cleared');

  for (const value of counts) {
    await prisma.dropdownOption.create({ data: { fieldType: 'COUNT', value } });
  }
  console.log(\`✅ Seeded \${counts.length} COUNT options\`);

  for (const value of types) {
    await prisma.dropdownOption.create({ data: { fieldType: 'TYPE', value } });
  }
  console.log(\`✅ Seeded \${types.length} TYPE options\`);

  for (const value of categories) {
    await prisma.dropdownOption.create({ data: { fieldType: 'CATEGORY', value } });
  }
  console.log(\`✅ Seeded \${categories.length} CATEGORY options\`);

  const adminPassword = await bcrypt.hash('Admin@123', 10);
  await prisma.admin.create({
    data: { email: 'admin@yarnmarket.com', password: adminPassword, name: 'Super Admin' }
  });
  console.log('✅ Admin account created: admin@yarnmarket.com');

  const defaultPassword = await bcrypt.hash('123456', 10);
  
  const supplier1 = await prisma.supplier.create({
    data: {
      gstNumber: '27AAAAA1111A1Z1', firmName: 'Apex Textiles', proprietorName: 'Amit Sharma',
      email: 'supplier1@test.com', password: defaultPassword, whatsappNumber: '9876543210',
      state: 'Maharashtra', district: 'Mumbai', city: 'Mumbai', exactAddress: '101, Apex Towers', status: 'APPROVED'
    }
  });
  console.log('✅ Test Supplier 1 created');

  const supplier2 = await prisma.supplier.create({
    data: {
      gstNumber: '24BBBBB2222B2Z2', firmName: 'Bharti Yarns', proprietorName: 'Bhavesh Patel',
      email: 'supplier2@test.com', password: defaultPassword, whatsappNumber: '7894561230',
      state: 'Gujarat', district: 'Surat', city: 'Surat', exactAddress: 'G-5, Textile Plaza', status: 'APPROVED'
    }
  });
  console.log('✅ Test Supplier 2 created');

  await prisma.buyer.create({
    data: { fullName: 'Rajesh Kumar', email: 'buyer1@test.com', password: defaultPassword, whatsappNumber: '9876543211' }
  });
  console.log('✅ Test Buyer 1 created');

  await prisma.buyer.create({
    data: { fullName: 'Suresh Sen', email: 'buyer2@test.com', password: defaultPassword, whatsappNumber: '9876543212' }
  });
  console.log('✅ Test Buyer 2 created');

  const listingsData = ${JSON.stringify(listings, null, 2)};
  
  const targetDate = new Date('2026-06-26T12:00:00Z');
  
  const insertData = listingsData.map((l, index) => {
    // Split evenly between supplier 1 and supplier 2
    const supplierId = index % 2 === 0 ? supplier1.id : supplier2.id;
    return {
      supplierId,
      count: l.count || 'Unknown',
      category: l.category || 'Unknown',
      type: l.type || 'Unknown',
      name: l.name || '',
      yarnType: l.yarnType || '',
      rate: l.rate || 0,
      availability: l.availability || 'AVAILABLE',
      packaging: l.packaging || '',
      csp: l.csp || '',
      createdAt: targetDate,
      updatedAt: targetDate
    };
  });

  // Batch insert
  await prisma.listing.createMany({ data: insertData });
  console.log(\`✅ Seeded \${insertData.length} sample listings\`);

  console.log('\\n🎉 YarnMarket database seeded successfully!');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
`;

fs.writeFileSync(seedFile, seedScript);
console.log('seed.js generated successfully');
