const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const counts = [
  "6s",
  "7s",
  "8s",
  "9s",
  "10s",
  "12s",
  "14s",
  "16s",
  "20s",
  "21s",
  "30s",
  "32s",
  "34s",
  "40s",
  "41s",
  "42s",
  "50s",
  "51s",
  "60s",
  "61s",
  "62s",
  "64s",
  "69s",
  "70s",
  "80s",
  "84s",
  "92s",
  "100s",
  "15s",
  "20.5s",
  "24s",
  "31s",
  "33s",
  "36s",
  "36.5s",
  "45s",
  "52s",
  "66s",
  "2/30s",
  "2/40s",
  "2/50s",
  "2/60s",
  "2/20s",
  "2/76s",
  "30.5s",
  "55s",
  "300/72"
];
const types = [
  "OE (Open End)",
  "Karded Compact",
  "Combed Compact",
  "Combed Compact High Twist",
  "Karded",
  "Karded 100% Cotton",
  "Combed High Twist",
  "Combed Compact Classic",
  "Combed",
  "Combed Compact Icon",
  "Combed Compact Delux",
  "Combed Auto",
  "Combed Delux",
  "100% Polyester ULTIMA",
  "100% Polyester ABS",
  "P/V",
  "P/V ULTIMA",
  "Vortex",
  "100% Poly ULTIMA PRO Compact",
  "100% Poly",
  "Warp",
  "Reliance Cationic GK",
  "Reliance Cationic HM New",
  "Reliance Cationic HM",
  "100% PSF",
  "100% Poly ULTIMA",
  "Vortex Micro",
  "AGNIVEER",
  "P/V ECO",
  "P/V 8D",
  "Micro",
  "Compact",
  "P/C New",
  "Combed Compact TFO",
  "Combed Compact Weft",
  "TFO",
  "NT",
  "Encounter Slub",
  "Grand Slub",
  "Karded GSL",
  "Rancho Slub",
  "Karded Cotline",
  "Cotline",
  "P/V 40D Lycra",
  "Combed Max Slub",
  "Combed 9% Core Yarn",
  "100% Lyocell Supra",
  "SIM Texturized"
];
const categories = [
  "100% Cotton",
  "Blended (PC)",
  "Polyester",
  "Blended (PV)"
];

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
  console.log(`✅ Seeded ${counts.length} COUNT options`);

  for (const value of types) {
    await prisma.dropdownOption.create({ data: { fieldType: 'TYPE', value } });
  }
  console.log(`✅ Seeded ${types.length} TYPE options`);

  for (const value of categories) {
    await prisma.dropdownOption.create({ data: { fieldType: 'CATEGORY', value } });
  }
  console.log(`✅ Seeded ${categories.length} CATEGORY options`);

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

  const listingsData = [
  {
    "count": "6s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "UMED - MERCURY",
    "csp": "1700",
    "yarnType": "",
    "rate": 199,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "6s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "UMED - MARS",
    "csp": "1900",
    "yarnType": "",
    "rate": 207,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "6s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "PATIALA - GOLD",
    "csp": "1750",
    "yarnType": "",
    "rate": 172,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "6s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "VIRAT SPNRS",
    "csp": "1750",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "7s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "UMED - MERCURY",
    "csp": "1700",
    "yarnType": "",
    "rate": 200,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "7s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "UMED - MARS",
    "csp": "1900",
    "yarnType": "",
    "rate": 208,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "7s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "PATIALA - GOLD",
    "csp": "1750",
    "yarnType": "",
    "rate": 175,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "7s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "VIRAT SPNRS",
    "csp": "1750",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "8s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "PATIALA - GOLD",
    "csp": "1750",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "8s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "UMED - MERCURY",
    "csp": "1700",
    "yarnType": "",
    "rate": 201,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "8s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "UMED - MARS",
    "csp": "1900",
    "yarnType": "",
    "rate": 209,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "8s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "VIRAT SPNRS",
    "csp": "1750",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "9s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "UMED - MERCURY",
    "csp": "1700",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "9s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "VIRAT SPNRS",
    "csp": "1750",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "10s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "UMED - MERCURY",
    "csp": "1700",
    "yarnType": "",
    "rate": 203,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "10s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "UMED - MARS",
    "csp": "1900",
    "yarnType": "",
    "rate": 211,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "10s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "PATIALA - GOLD",
    "csp": "1750",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "10s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "VIRAT SPNRS",
    "csp": "1750",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "12s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "UMED - MERCURY",
    "csp": "1700",
    "yarnType": "",
    "rate": 208,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "12s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "UMED - MARS",
    "csp": "1800",
    "yarnType": "",
    "rate": 216,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "12s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "PATIALA - GOLD",
    "csp": "1750",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "14s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "UMED - MERCURY",
    "csp": "1700",
    "yarnType": "",
    "rate": 212,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "14s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "UMED - MARS",
    "csp": "1800",
    "yarnType": "",
    "rate": 220,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "14s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "PATIALA - GOLD",
    "csp": "1750",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "16s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "RAVALI SPNRS",
    "csp": "1500",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "16s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "UMED - MERCURY",
    "csp": "1700",
    "yarnType": "",
    "rate": 218,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "16s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "UMED - MARS",
    "csp": "1800",
    "yarnType": "",
    "rate": 224,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "16s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "NITIN SPINNERS",
    "csp": "1700",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "16s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "NITIN SPINNERS",
    "csp": "1900",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "20s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "PATIALA",
    "csp": "2100",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "20s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "RAVALI SPNRS",
    "csp": "1600",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "20s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "UMED - MERCURY",
    "csp": "1700",
    "yarnType": "",
    "rate": 228,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "20s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "UMED - MARS",
    "csp": "1800",
    "yarnType": "",
    "rate": 234,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "20s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "NITIN SPINNERS",
    "csp": "1700",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "20s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "NITIN SPINNERS",
    "csp": "1850",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "21s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "RAVALI SPNRS",
    "csp": "1600",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "21s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "UMED - MERCURY",
    "csp": "1700",
    "yarnType": "",
    "rate": 231,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "21s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "UMED - MARS",
    "csp": "1800",
    "yarnType": "",
    "rate": 237,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "21s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "NITIN SPNRS",
    "csp": "1700",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "21s",
    "category": "100% Cotton",
    "type": "OE (Open End)",
    "name": "NITIN SPNRS",
    "csp": "1800",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "30s",
    "category": "100% Cotton",
    "type": "Karded Compact",
    "name": "UMED SPNRS",
    "csp": "",
    "yarnType": "",
    "rate": 298,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "30s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "UMED SPNRS",
    "csp": "",
    "yarnType": "",
    "rate": 321,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "30s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "SARVASTU",
    "csp": "",
    "yarnType": "",
    "rate": 313,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "30s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "SHIVKRUPA",
    "csp": "",
    "yarnType": "",
    "rate": 313,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "30s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "HARIPRIYA",
    "csp": "",
    "yarnType": "",
    "rate": 313,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "30s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "SINTEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "30s",
    "category": "100% Cotton",
    "type": "Combed Compact High Twist",
    "name": "ARUN",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "25% GIZA 37 TPI"
  },
  {
    "count": "32s",
    "category": "100% Cotton",
    "type": "Karded",
    "name": "LOKNETE GOPINATHRAO MUNDHE",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "32s",
    "category": "100% Cotton",
    "type": "Karded",
    "name": "LOKNETE GOPINATHRAO MUNDHE",
    "csp": "",
    "yarnType": "Weft",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "32s",
    "category": "100% Cotton",
    "type": "Karded",
    "name": "THIRUMATHI (TMT)",
    "csp": "",
    "yarnType": "",
    "rate": 282,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "32s",
    "category": "100% Cotton",
    "type": "Karded Compact",
    "name": "THIRUMATHI (TMT)",
    "csp": "",
    "yarnType": "",
    "rate": 287,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "32s",
    "category": "100% Cotton",
    "type": "Karded Compact",
    "name": "PVR SPNG",
    "csp": "",
    "yarnType": "",
    "rate": 310,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "32s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "HARIPRIYA",
    "csp": "",
    "yarnType": "",
    "rate": 317,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "32s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "SINTEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "34s",
    "category": "100% Cotton",
    "type": "Karded 100% Cotton",
    "name": "PARTAP",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "40s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "SHRINIWAS",
    "csp": "",
    "yarnType": "",
    "rate": 350,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "40s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "TRIDENT",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "40s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "ARUN",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "10% GIZA"
  },
  {
    "count": "40s",
    "category": "100% Cotton",
    "type": "Combed Compact High Twist",
    "name": "ARUN",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "42 TPI"
  },
  {
    "count": "40s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "ARUN",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "25% GIZA"
  },
  {
    "count": "41s",
    "category": "100% Cotton",
    "type": "Karded",
    "name": "GOWTHAMI SPINTEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "COTT/LYO 90:10"
  },
  {
    "count": "41s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "GIRNAR SPINTEX",
    "csp": "",
    "yarnType": "",
    "rate": 335,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "41s",
    "category": "100% Cotton",
    "type": "Karded Compact",
    "name": "PVR SPNG",
    "csp": "",
    "yarnType": "",
    "rate": 336,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "41s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "TRIDENT",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "41s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "PVR",
    "csp": "",
    "yarnType": "",
    "rate": 357,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "41s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "UMED SPNRS",
    "csp": "",
    "yarnType": "",
    "rate": 361,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "41s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "SINTEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "42s",
    "category": "100% Cotton",
    "type": "Karded",
    "name": "THIRUMATHI (TMT)",
    "csp": "",
    "yarnType": "",
    "rate": 316,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "42s",
    "category": "100% Cotton",
    "type": "Karded Compact",
    "name": "UMED SPNRS",
    "csp": "",
    "yarnType": "",
    "rate": 336,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "50s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "ARUN",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "10% GIZA / 25% GIZA"
  },
  {
    "count": "50s",
    "category": "100% Cotton",
    "type": "Combed Compact High Twist",
    "name": "ARUN",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "25% GIZA 47 TPI"
  },
  {
    "count": "51s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "TRIDENT",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "51s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "SINTEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "60s",
    "category": "100% Cotton",
    "type": "Combed High Twist",
    "name": "GVG IMPERIAL / SVA",
    "csp": "",
    "yarnType": "",
    "rate": 1990,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "60s",
    "category": "100% Cotton",
    "type": "Combed Compact Classic",
    "name": "GVG ELITE / SVA SYNTEX",
    "csp": "",
    "yarnType": "",
    "rate": 416,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "60s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "SINTEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "60s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "ARUN",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "10% GIZA"
  },
  {
    "count": "60s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "ARUN",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "25% GIZA MIX"
  },
  {
    "count": "60s",
    "category": "100% Cotton",
    "type": "Combed Compact High Twist",
    "name": "ARUN TEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "25% GIZA 42 TPI"
  },
  {
    "count": "60s",
    "category": "100% Cotton",
    "type": "Combed Compact High Twist",
    "name": "ARUN TEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "25% GIZA 52 TPI"
  },
  {
    "count": "61s",
    "category": "100% Cotton",
    "type": "Karded",
    "name": "ANNAMALAI AR SPIN",
    "csp": "",
    "yarnType": "",
    "rate": 1770,
    "availability": "AVAILABLE",
    "packaging": "COTT/LYO 80:20"
  },
  {
    "count": "61s",
    "category": "100% Cotton",
    "type": "Karded Compact",
    "name": "RAGHUL",
    "csp": "",
    "yarnType": "",
    "rate": 377,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "61s",
    "category": "100% Cotton",
    "type": "Karded Compact",
    "name": "GEETHA KRISHNA",
    "csp": "",
    "yarnType": "",
    "rate": 375,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "61s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "SUGUNA",
    "csp": "",
    "yarnType": "",
    "rate": 404,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "61s",
    "category": "100% Cotton",
    "type": "Combed",
    "name": "RAJAPALAYAM SPINTEX",
    "csp": "",
    "yarnType": "",
    "rate": 1970,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "61s",
    "category": "100% Cotton",
    "type": "Combed",
    "name": "RAJAPALAYAM SPINTEX",
    "csp": "",
    "yarnType": "Weft",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "61s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "PRACHIDHI",
    "csp": "",
    "yarnType": "",
    "rate": 397,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "61s",
    "category": "100% Cotton",
    "type": "Combed High Twist",
    "name": "GEETHA KRISHNA",
    "csp": "",
    "yarnType": "",
    "rate": 1960,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "61s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "GVG IMPERIAL / SVA SYNTEX",
    "csp": "",
    "yarnType": "",
    "rate": 413,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "61s",
    "category": "100% Cotton",
    "type": "Combed Compact Icon",
    "name": "SVA / GVG IND",
    "csp": "",
    "yarnType": "",
    "rate": 416,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "61s",
    "category": "100% Cotton",
    "type": "Combed Compact Delux",
    "name": "RJP-SPINTX / SANDHYA / VISHNUSHANKAR",
    "csp": "",
    "yarnType": "",
    "rate": 417,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "61s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "ALOKIND LTD",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "61s",
    "category": "100% Cotton",
    "type": "Combed Compact Classic",
    "name": "SVA / GVG IMPERIAL / GVG ELITE",
    "csp": "",
    "yarnType": "",
    "rate": 419,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "61s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "TRIDENT",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "61s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "SINTEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "62s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "ALOKIND LTD",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "64s",
    "category": "100% Cotton",
    "type": "Combed Auto",
    "name": "SELVARAJA",
    "csp": "",
    "yarnType": "",
    "rate": 2260,
    "availability": "AVAILABLE",
    "packaging": "COTT/LYO 85:15"
  },
  {
    "count": "64s",
    "category": "100% Cotton",
    "type": "Combed Auto",
    "name": "GVG IND / SVA SYN / GVG IMP",
    "csp": "",
    "yarnType": "",
    "rate": 2280,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "69s",
    "category": "100% Cotton",
    "type": "Combed Delux",
    "name": "RAJAPALAYAM",
    "csp": "",
    "yarnType": "",
    "rate": 2380,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "70s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "ARUN",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "25% GIZA MIX"
  },
  {
    "count": "80s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "SATYANARAYAN",
    "csp": "",
    "yarnType": "",
    "rate": 575,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "80s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "SUNDARAM",
    "csp": "2900",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "80s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "SINTEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "84s",
    "category": "100% Cotton",
    "type": "Combed",
    "name": "SUGUNA",
    "csp": "",
    "yarnType": "",
    "rate": 2380,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "84s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "PALANIMUTHU / KUMARAGIRI",
    "csp": "",
    "yarnType": "",
    "rate": 2460,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "92s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "SELVARAJA",
    "csp": "",
    "yarnType": "",
    "rate": 510,
    "availability": "AVAILABLE",
    "packaging": "COTT/LYO 85:15"
  },
  {
    "count": "92s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "PALANIMUTHU / KUMARAGIRI",
    "csp": "",
    "yarnType": "",
    "rate": 512,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "100s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "DATTATRAY",
    "csp": "2900",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "100s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "DATTATRAY",
    "csp": "3300",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "100s",
    "category": "100% Cotton",
    "type": "Combed Compact",
    "name": "SATYANARAYAN",
    "csp": "3500",
    "yarnType": "Warp",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "6s",
    "category": "Blended (PC)",
    "type": "OE (Open End)",
    "name": "SUDIVA SPINNERS",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/C 48:52"
  },
  {
    "count": "6s",
    "category": "Blended (PC)",
    "type": "OE (Open End)",
    "name": "RSWM LTD",
    "csp": "",
    "yarnType": "",
    "rate": 167,
    "availability": "AVAILABLE",
    "packaging": "P/C 40:60"
  },
  {
    "count": "7s",
    "category": "Blended (PC)",
    "type": "OE (Open End)",
    "name": "RSWM LTD",
    "csp": "",
    "yarnType": "",
    "rate": 169,
    "availability": "AVAILABLE",
    "packaging": "P/C 40:60"
  },
  {
    "count": "10s",
    "category": "Polyester",
    "type": "100% Polyester ULTIMA",
    "name": "R.S.W.M.",
    "csp": "",
    "yarnType": "",
    "rate": 169,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "10s",
    "category": "Polyester",
    "type": "100% Polyester ABS",
    "name": "R.S.W.M.",
    "csp": "",
    "yarnType": "",
    "rate": 152,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "10s",
    "category": "Blended (PC)",
    "type": "OE (Open End)",
    "name": "RSWM LTD",
    "csp": "",
    "yarnType": "",
    "rate": 166,
    "availability": "AVAILABLE",
    "packaging": "P/C 65:35"
  },
  {
    "count": "10s",
    "category": "Blended (PC)",
    "type": "OE (Open End)",
    "name": "RSWM LTD",
    "csp": "",
    "yarnType": "",
    "rate": 171,
    "availability": "AVAILABLE",
    "packaging": "P/C 40:60"
  },
  {
    "count": "12s",
    "category": "Blended (PC)",
    "type": "OE (Open End)",
    "name": "SUDIVA SPNRS",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/C 48:52"
  },
  {
    "count": "12s",
    "category": "Blended (PC)",
    "type": "OE (Open End)",
    "name": "DAMODAR",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/C 65:35"
  },
  {
    "count": "12s",
    "category": "Blended (PC)",
    "type": "OE (Open End)",
    "name": "RSWM LTD",
    "csp": "",
    "yarnType": "",
    "rate": 168,
    "availability": "AVAILABLE",
    "packaging": "P/C 65:35"
  },
  {
    "count": "12s",
    "category": "Blended (PC)",
    "type": "OE (Open End)",
    "name": "RSWM LTD",
    "csp": "",
    "yarnType": "",
    "rate": 173,
    "availability": "AVAILABLE",
    "packaging": "P/C 40:60"
  },
  {
    "count": "14s",
    "category": "Blended (PC)",
    "type": "OE (Open End)",
    "name": "SUDIVA SPINNERS",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/C 48:52"
  },
  {
    "count": "14s",
    "category": "Blended (PC)",
    "type": "OE (Open End)",
    "name": "DAMODAR",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/C 65:35"
  },
  {
    "count": "14s",
    "category": "Blended (PC)",
    "type": "OE (Open End)",
    "name": "RSWM LTD",
    "csp": "",
    "yarnType": "",
    "rate": 170,
    "availability": "AVAILABLE",
    "packaging": "P/C 65:35"
  },
  {
    "count": "14s",
    "category": "Blended (PC)",
    "type": "OE (Open End)",
    "name": "RSWM LTD",
    "csp": "",
    "yarnType": "",
    "rate": 175,
    "availability": "AVAILABLE",
    "packaging": "P/C 40:60"
  },
  {
    "count": "15s",
    "category": "Blended (PV)",
    "type": "P/V",
    "name": "PEEVEE TEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "15s",
    "category": "Polyester",
    "type": "100% Polyester ULTIMA",
    "name": "R.S.W.M.",
    "csp": "",
    "yarnType": "",
    "rate": 172,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "15s",
    "category": "Polyester",
    "type": "100% Polyester ABS",
    "name": "R.S.W.M.",
    "csp": "",
    "yarnType": "",
    "rate": 157,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "15s",
    "category": "Blended (PV)",
    "type": "P/V ULTIMA",
    "name": "R. S. W. M. LTD",
    "csp": "",
    "yarnType": "",
    "rate": 193,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "16s",
    "category": "Blended (PC)",
    "type": "OE (Open End)",
    "name": "DAMODAR",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/C 65:35"
  },
  {
    "count": "16s",
    "category": "Blended (PC)",
    "type": "OE (Open End)",
    "name": "SUDIVA SPINNERS",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/C 48:52"
  },
  {
    "count": "16s",
    "category": "Blended (PC)",
    "type": "OE (Open End)",
    "name": "RSWM LTD",
    "csp": "",
    "yarnType": "",
    "rate": 174,
    "availability": "AVAILABLE",
    "packaging": "P/C 65:35"
  },
  {
    "count": "16s",
    "category": "Blended (PC)",
    "type": "OE (Open End)",
    "name": "RSWM LTD",
    "csp": "",
    "yarnType": "",
    "rate": 180,
    "availability": "AVAILABLE",
    "packaging": "P/C 40:60"
  },
  {
    "count": "20s",
    "category": "Blended (PC)",
    "type": "OE (Open End)",
    "name": "RSWM",
    "csp": "",
    "yarnType": "",
    "rate": 169,
    "availability": "AVAILABLE",
    "packaging": "P/C 65:35 Recycled PSF"
  },
  {
    "count": "20s",
    "category": "Blended (PC)",
    "type": "OE (Open End)",
    "name": "RSWM",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/C 40:60 Recycled PSF"
  },
  {
    "count": "20s",
    "category": "Blended (PC)",
    "type": "Vortex",
    "name": "MUTHURMURUGAN",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/C 65:35"
  },
  {
    "count": "20s",
    "category": "Polyester",
    "type": "100% Polyester ULTIMA",
    "name": "R. S. W. M. LTD",
    "csp": "",
    "yarnType": "",
    "rate": 183,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "20s",
    "category": "Blended (PC)",
    "type": "OE (Open End)",
    "name": "NITIN SPNRS",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/C 65:35"
  },
  {
    "count": "20s",
    "category": "Blended (PC)",
    "type": "OE (Open End)",
    "name": "R. S. W. M. LTD",
    "csp": "",
    "yarnType": "",
    "rate": 181,
    "availability": "AVAILABLE",
    "packaging": "P/C 65:35"
  },
  {
    "count": "20s",
    "category": "Blended (PC)",
    "type": "OE (Open End)",
    "name": "R. S. W. M. LTD",
    "csp": "",
    "yarnType": "",
    "rate": 189,
    "availability": "AVAILABLE",
    "packaging": "P/C 40:60"
  },
  {
    "count": "20s",
    "category": "Blended (PC)",
    "type": "Combed",
    "name": "PEEVEE",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/C 65:35"
  },
  {
    "count": "20s",
    "category": "Blended (PV)",
    "type": "P/V",
    "name": "PEEVEE TEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "20s",
    "category": "Blended (PV)",
    "type": "P/V ULTIMA",
    "name": "R. S. W. M. LTD",
    "csp": "",
    "yarnType": "",
    "rate": 202,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "20.5s",
    "category": "Blended (PC)",
    "type": "OE (Open End)",
    "name": "DAMODAR",
    "csp": "",
    "yarnType": "",
    "rate": 169,
    "availability": "AVAILABLE",
    "packaging": "P/C 65:35"
  },
  {
    "count": "24s",
    "category": "Polyester",
    "type": "100% Polyester ULTIMA",
    "name": "R.S.W.M.",
    "csp": "",
    "yarnType": "",
    "rate": 188,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "30s",
    "category": "Polyester",
    "type": "100% Poly ULTIMA PRO Compact",
    "name": "RSWM LTD",
    "csp": "",
    "yarnType": "",
    "rate": 198,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "30s",
    "category": "Polyester",
    "type": "100% Poly",
    "name": "GIMATEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "30s",
    "category": "Polyester",
    "type": "100% Polyester ULTIMA",
    "name": "R.S.W.M. LTD",
    "csp": "",
    "yarnType": "",
    "rate": 194,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "30s",
    "category": "Polyester",
    "type": "100% Polyester ABS",
    "name": "R.S.W.M. LTD",
    "csp": "",
    "yarnType": "",
    "rate": 170,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "30s",
    "category": "Blended (PV)",
    "type": "Vortex",
    "name": "DEVENTHIRA",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 80:20"
  },
  {
    "count": "30s",
    "category": "Blended (PV)",
    "type": "P/V",
    "name": "DEVENTHIRA",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "30s",
    "category": "Blended (PV)",
    "type": "Vortex",
    "name": "DEVENTHIRA",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "30s",
    "category": "Blended (PV)",
    "type": "P/V",
    "name": "PEEVEE TEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "30s",
    "category": "Blended (PC)",
    "type": "Combed",
    "name": "NAHAR TEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/C 48:52"
  },
  {
    "count": "30s",
    "category": "Blended (PC)",
    "type": "Combed",
    "name": "NAHAR TEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/C 40:60"
  },
  {
    "count": "30s",
    "category": "Blended (PV)",
    "type": "P/V",
    "name": "GIMATEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "30s",
    "category": "Blended (PV)",
    "type": "P/V",
    "name": "R. S. W. M. LTD",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "30s",
    "category": "Blended (PV)",
    "type": "P/V ULTIMA",
    "name": "R. S. W. M. LTD",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "30s",
    "category": "Blended (PC)",
    "type": "Vortex",
    "name": "PEE VEE TEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/C 65:35"
  },
  {
    "count": "30s",
    "category": "Blended (PC)",
    "type": "Combed Compact",
    "name": "PEE VEE TEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/C 40:60"
  },
  {
    "count": "30s",
    "category": "Blended (PC)",
    "type": "Combed",
    "name": "SINTEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "C/P 52:48"
  },
  {
    "count": "30s",
    "category": "Blended (PC)",
    "type": "Combed",
    "name": "SINTEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "C/P 60:40"
  },
  {
    "count": "30s",
    "category": "Blended (PC)",
    "type": "Combed",
    "name": "NAHAR TEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/C 40:60"
  },
  {
    "count": "31s",
    "category": "Blended (PC)",
    "type": "Warp",
    "name": "MUTHURMURUGAN",
    "csp": "",
    "yarnType": "",
    "rate": 200,
    "availability": "AVAILABLE",
    "packaging": "P/C 75:25"
  },
  {
    "count": "31s",
    "category": "Blended (PC)",
    "type": "Vortex",
    "name": "MUTHURMURUGAN",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/C 65:35"
  },
  {
    "count": "33s",
    "category": "Blended (PC)",
    "type": "OE (Open End)",
    "name": "SARMANGAL",
    "csp": "",
    "yarnType": "",
    "rate": 188,
    "availability": "AVAILABLE",
    "packaging": "P/C 70:30 Old"
  },
  {
    "count": "33s",
    "category": "Blended (PC)",
    "type": "Warp",
    "name": "MUTHURMURUGAN",
    "csp": "",
    "yarnType": "",
    "rate": 202,
    "availability": "AVAILABLE",
    "packaging": "P/C 75:25"
  },
  {
    "count": "36s",
    "category": "Blended (PV)",
    "type": "Reliance Cationic GK",
    "name": "RSWM LTD",
    "csp": "",
    "yarnType": "",
    "rate": 261,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "36.5s",
    "category": "Blended (PV)",
    "type": "Reliance Cationic HM New",
    "name": "RSWM",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 62:13:25"
  },
  {
    "count": "36.5s",
    "category": "Blended (PV)",
    "type": "Reliance Cationic HM",
    "name": "RSWM LTD",
    "csp": "",
    "yarnType": "",
    "rate": 243,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "40s",
    "category": "Polyester",
    "type": "100% PSF",
    "name": "ALOKIND",
    "csp": "",
    "yarnType": "",
    "rate": 187,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "40s",
    "category": "Polyester",
    "type": "100% Poly ULTIMA",
    "name": "R. S. W. M. LTD",
    "csp": "",
    "yarnType": "",
    "rate": 211,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "40s",
    "category": "Polyester",
    "type": "100% Poly ULTIMA PRO Compact",
    "name": "RSWM LTD",
    "csp": "",
    "yarnType": "",
    "rate": 215,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "40s",
    "category": "Blended (PV)",
    "type": "Vortex Micro",
    "name": "DEVENTHIRA",
    "csp": "",
    "yarnType": "",
    "rate": 237,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "40s",
    "category": "Blended (PV)",
    "type": "P/V",
    "name": "DEVENTHIRA",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "40s",
    "category": "Blended (PV)",
    "type": "P/V",
    "name": "DEVENTHIRA",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 48:52"
  },
  {
    "count": "40s",
    "category": "Blended (PV)",
    "type": "P/V",
    "name": "GIMATEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "40s",
    "category": "Blended (PV)",
    "type": "Vortex",
    "name": "GIMATEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "40s",
    "category": "Blended (PV)",
    "type": "P/V",
    "name": "PEEVEE TEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "40s",
    "category": "Blended (PV)",
    "type": "Vortex",
    "name": "PEEVEE TEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "40s",
    "category": "Blended (PV)",
    "type": "AGNIVEER",
    "name": "R. S. W. M. LTD",
    "csp": "",
    "yarnType": "",
    "rate": 230,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "40s",
    "category": "Blended (PV)",
    "type": "Vortex",
    "name": "DEVENTHIRA",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 80:20"
  },
  {
    "count": "40s",
    "category": "Blended (PC)",
    "type": "Vortex",
    "name": "PEE VEE TEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/C 65:35"
  },
  {
    "count": "40s",
    "category": "Blended (PC)",
    "type": "Combed Compact",
    "name": "PEE VEE TEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/C 40:60"
  },
  {
    "count": "40s",
    "category": "Blended (PC)",
    "type": "Karded",
    "name": "GIMATEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/C 67:33"
  },
  {
    "count": "42s",
    "category": "Blended (PV)",
    "type": "P/V ECO",
    "name": "SUPERTEX MILLS",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 80:20"
  },
  {
    "count": "42s",
    "category": "Blended (PV)",
    "type": "P/V 8D",
    "name": "SUPERTEX MILLS",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 70:30"
  },
  {
    "count": "42s",
    "category": "Blended (PV)",
    "type": "Vortex",
    "name": "DEVENTHIRA",
    "csp": "",
    "yarnType": "",
    "rate": 241,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "42s",
    "category": "Blended (PV)",
    "type": "Vortex",
    "name": "DEVENTHIRA",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 80:20"
  },
  {
    "count": "42s",
    "category": "Blended (PV)",
    "type": "Micro",
    "name": "DEVENTHIRA",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "42s",
    "category": "Blended (PV)",
    "type": "P/V",
    "name": "PEEVEE TEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "42s",
    "category": "Blended (PV)",
    "type": "P/V",
    "name": "SINTEX YARNS",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "42s",
    "category": "Blended (PV)",
    "type": "AGNIVEER",
    "name": "R. S. W. M. LTD",
    "csp": "",
    "yarnType": "",
    "rate": 234,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "45s",
    "category": "Blended (PV)",
    "type": "Micro",
    "name": "DEVENTHIRA",
    "csp": "",
    "yarnType": "",
    "rate": 278,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "45s",
    "category": "Blended (PV)",
    "type": "P/V",
    "name": "DEVENTHIRA",
    "csp": "",
    "yarnType": "",
    "rate": 270,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "45s",
    "category": "Blended (PV)",
    "type": "P/V",
    "name": "R. S. W. M. LTD",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "45s",
    "category": "Blended (PV)",
    "type": "P/V",
    "name": "DEVENTHIRA",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 48:52"
  },
  {
    "count": "45s",
    "category": "Blended (PV)",
    "type": "Compact",
    "name": "DEVENTHIRA",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 48:52"
  },
  {
    "count": "50s",
    "category": "Blended (PV)",
    "type": "P/V",
    "name": "DEVENTHIRA",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 48:52"
  },
  {
    "count": "50s",
    "category": "Blended (PV)",
    "type": "Compact",
    "name": "DEVENTHIRA",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 48:52"
  },
  {
    "count": "52s",
    "category": "Blended (PV)",
    "type": "P/V",
    "name": "DEVENTHIRA",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "52s",
    "category": "Blended (PV)",
    "type": "Compact",
    "name": "DEVENTHIRA",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "60s",
    "category": "Blended (PV)",
    "type": "Vortex",
    "name": "PEEVEE TEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "66s",
    "category": "Blended (PC)",
    "type": "P/C New",
    "name": "SURYAVARADA",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/C 70:30"
  },
  {
    "count": "2/30s",
    "category": "100% Cotton",
    "type": "Combed Compact TFO",
    "name": "ALOK",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "2/30s",
    "category": "100% Cotton",
    "type": "Combed Compact TFO",
    "name": "SINTEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "2/40s",
    "category": "100% Cotton",
    "type": "Combed Compact Weft",
    "name": "GOWTHAMI SOLVENT",
    "csp": "",
    "yarnType": "",
    "rate": 360,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "2/40s",
    "category": "100% Cotton",
    "type": "Combed Compact TFO",
    "name": "ARUN TEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "10% GIZA"
  },
  {
    "count": "2/50s",
    "category": "100% Cotton",
    "type": "Combed Compact TFO",
    "name": "ARUN TEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "10% GIZA"
  },
  {
    "count": "2/60s",
    "category": "100% Cotton",
    "type": "Combed Compact TFO",
    "name": "ARUN TEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "10% GIZA"
  },
  {
    "count": "2/20s",
    "category": "Polyester",
    "type": "100% Polyester ULTIMA",
    "name": "R.S.W.M. LTD",
    "csp": "",
    "yarnType": "",
    "rate": 197,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "2/30s",
    "category": "Polyester",
    "type": "100% Polyester ULTIMA",
    "name": "R.S.W.M. LTD",
    "csp": "",
    "yarnType": "",
    "rate": 219,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "2/30s",
    "category": "Polyester",
    "type": "100% Poly",
    "name": "GIMATEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "2/30s",
    "category": "Blended (PC)",
    "type": "TFO",
    "name": "MUTHURMURUGAN",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/C 80:20"
  },
  {
    "count": "2/30s",
    "category": "Blended (PC)",
    "type": "Karded",
    "name": "GIMATEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/C 67:33"
  },
  {
    "count": "2/30s",
    "category": "Blended (PV)",
    "type": "TFO",
    "name": "GIMATEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "2/30s",
    "category": "Blended (PV)",
    "type": "P/V",
    "name": "R. S. W. M. LTD",
    "csp": "",
    "yarnType": "",
    "rate": 230,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "2/30s",
    "category": "Blended (PV)",
    "type": "P/V ULTIMA",
    "name": "R. S. W. M. LTD",
    "csp": "",
    "yarnType": "",
    "rate": 237,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "2/40s",
    "category": "Blended (PV)",
    "type": "TFO",
    "name": "DEVENTHIRA SPNRS",
    "csp": "",
    "yarnType": "",
    "rate": 259,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "2/40s",
    "category": "Blended (PV)",
    "type": "NT",
    "name": "DEVENTHIRA SPNRS",
    "csp": "",
    "yarnType": "",
    "rate": 255,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "2/40s",
    "category": "Blended (PV)",
    "type": "P/V",
    "name": "R. S. W. M. LTD",
    "csp": "",
    "yarnType": "",
    "rate": 260,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "2/60s",
    "category": "Blended (PV)",
    "type": "P/V",
    "name": "DEVENTHIRA SPINNERS",
    "csp": "",
    "yarnType": "",
    "rate": 329,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "2/76s",
    "category": "Blended (PV)",
    "type": "P/V",
    "name": "DEVENTHIRA SPINNERS",
    "csp": "",
    "yarnType": "",
    "rate": 412,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "16s",
    "category": "100% Cotton",
    "type": "Encounter Slub",
    "name": "GIRNAR SPINTEX",
    "csp": "",
    "yarnType": "",
    "rate": 283,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "16s",
    "category": "100% Cotton",
    "type": "Grand Slub",
    "name": "GIRNAR SPINTEX",
    "csp": "",
    "yarnType": "",
    "rate": 280,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "16s",
    "category": "100% Cotton",
    "type": "Grand Slub",
    "name": "SITARAM",
    "csp": "",
    "yarnType": "",
    "rate": 285,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "20s",
    "category": "100% Cotton",
    "type": "Karded GSL",
    "name": "SIDDHIVINAYAK",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "21s",
    "category": "100% Cotton",
    "type": "Rancho Slub",
    "name": "SIDDHIVINAYAK",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "21s",
    "category": "100% Cotton",
    "type": "Karded Cotline",
    "name": "SIDDHIVINAYAK",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "21s",
    "category": "100% Cotton",
    "type": "Cotline",
    "name": "YOGIRAJ",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "21s",
    "category": "100% Cotton",
    "type": "Rancho Slub",
    "name": "GIRNAR SPINTEX",
    "csp": "",
    "yarnType": "",
    "rate": 287,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "30s",
    "category": "Blended (PV)",
    "type": "P/V 40D Lycra",
    "name": "GIMATEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "30.5s",
    "category": "100% Cotton",
    "type": "Combed Max Slub",
    "name": "SIDDHIVINAYAK",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "40s",
    "category": "Blended (PV)",
    "type": "P/V 40D Lycra",
    "name": "GIMATEX",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "P/V 65:35"
  },
  {
    "count": "42s",
    "category": "100% Cotton",
    "type": "Combed 9% Core Yarn",
    "name": "RJP-SPINTEX",
    "csp": "",
    "yarnType": "",
    "rate": 423,
    "availability": "AVAILABLE",
    "packaging": ""
  },
  {
    "count": "30s",
    "category": "100% Cotton",
    "type": "100% Lyocell Supra",
    "name": "DAMODAR",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "MASKA"
  },
  {
    "count": "40s",
    "category": "100% Cotton",
    "type": "100% Lyocell Supra",
    "name": "DAMODAR",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "MASKA"
  },
  {
    "count": "55s",
    "category": "100% Cotton",
    "type": "100% Lyocell Supra",
    "name": "DAMODAR",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "MASKA"
  },
  {
    "count": "60s",
    "category": "100% Cotton",
    "type": "100% Lyocell Supra",
    "name": "DAMODAR",
    "csp": "",
    "yarnType": "",
    "rate": null,
    "availability": "AVAILABLE",
    "packaging": "MASKA"
  },
  {
    "count": "300/72",
    "category": "Polyester",
    "type": "SIM Texturized",
    "name": "INDORAMA",
    "csp": "",
    "yarnType": "",
    "rate": 35.5,
    "availability": "AVAILABLE",
    "packaging": ""
  }
];
  
  // Seed listings using yesterday's date
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - 1);
  
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
  console.log(`✅ Seeded ${insertData.length} sample listings`);

  console.log('\n🎉 YarnMarket database seeded successfully!');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
