const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Clear existing data
  await prisma.pharmacyDrug.deleteMany({});
  await prisma.pharmacy.deleteMany({});
  await prisma.drug.deleteMany({});
  await prisma.user.deleteMany({});

  // Create users
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Demo User',
        email: 'demo@medifind.com',
        password: hashedPassword,
        phone: '+233 20 123 4567',
        role: 'USER'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@medifind.com',
        password: hashedPassword,
        phone: '+233 24 987 6543',
        role: 'ADMIN'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Pharmacy Owner',
        email: 'owner@medifind.com',
        password: hashedPassword,
        phone: '+233 27 555 1234',
        role: 'PHARMACY_OWNER'
      }
    })
    ,
    prisma.user.create({
      data: {
        name: 'Ama Serwaa',
        email: 'ama@medifind.com',
        password: hashedPassword,
        phone: '+233 20 111 2222',
        role: 'USER'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Kofi Mensah',
        email: 'kofi@medifind.com',
        password: hashedPassword,
        phone: '+233 24 333 4444',
        role: 'USER'
      }
    })
  ]);

  console.log(`Created ${users.length} users`);

  // Create a larger set of drugs
  const drugData = [
    { name: 'Paracetamol', genericName: 'Acetaminophen', category: 'Analgesic', description: 'Pain reliever and fever reducer', dosageForm: 'Tablet', strength: '500mg' },
    { name: 'Ibuprofen', genericName: 'Ibuprofen', category: 'Analgesic', description: 'NSAID for pain and inflammation', dosageForm: 'Tablet', strength: '400mg' },
    { name: 'Aspirin', genericName: 'Aspirin', category: 'Analgesic', description: 'Pain relief and antiplatelet', dosageForm: 'Tablet', strength: '75mg' },
    { name: 'Amoxicillin', genericName: 'Amoxicillin', category: 'Antibiotic', description: 'Broad-spectrum antibiotic', dosageForm: 'Capsule', strength: '500mg' },
    { name: 'Azithromycin', genericName: 'Azithromycin', category: 'Antibiotic', description: 'Macrolide antibiotic', dosageForm: 'Tablet', strength: '250mg' },
    { name: 'Ciprofloxacin', genericName: 'Ciprofloxacin', category: 'Antibiotic', description: 'Fluoroquinolone antibiotic', dosageForm: 'Tablet', strength: '500mg' },
    { name: 'Metformin', genericName: 'Metformin', category: 'Diabetic', description: 'Oral diabetes medicine', dosageForm: 'Tablet', strength: '500mg' },
    { name: 'Insulin (Human)', genericName: 'Insulin', category: 'Diabetic', description: 'Insulin for glycemic control', dosageForm: 'Injection', strength: '100IU/ml' },
    { name: 'Losartan', genericName: 'Losartan', category: 'Antihypertensive', description: 'Blood pressure medication', dosageForm: 'Tablet', strength: '50mg' },
    { name: 'Lisinopril', genericName: 'Lisinopril', category: 'Antihypertensive', description: 'ACE inhibitor for hypertension', dosageForm: 'Tablet', strength: '10mg' },
    { name: 'Amlodipine', genericName: 'Amlodipine', category: 'Antihypertensive', description: 'Calcium channel blocker', dosageForm: 'Tablet', strength: '5mg' },
    { name: 'Atorvastatin', genericName: 'Atorvastatin', category: 'Cardiology', description: 'Cholesterol lowering statin', dosageForm: 'Tablet', strength: '20mg' },
    { name: 'Omeprazole', genericName: 'Omeprazole', category: 'Gastro', description: 'Proton pump inhibitor', dosageForm: 'Capsule', strength: '20mg' },
    { name: 'Pantoprazole', genericName: 'Pantoprazole', category: 'Gastro', description: 'Proton pump inhibitor', dosageForm: 'Tablet', strength: '40mg' },
    { name: 'Cetirizine', genericName: 'Cetirizine', category: 'Allergy', description: 'Antihistamine for allergies', dosageForm: 'Tablet', strength: '10mg' },
    { name: 'Loratadine', genericName: 'Loratadine', category: 'Allergy', description: 'Second generation antihistamine', dosageForm: 'Tablet', strength: '10mg' },
    { name: 'Salbutamol', genericName: 'Salbutamol', category: 'Respiratory', description: 'Bronchodilator (inhaler)', dosageForm: 'Inhaler', strength: '100mcg' },
    { name: 'Prednisone', genericName: 'Prednisone', category: 'Steroid', description: 'Oral corticosteroid', dosageForm: 'Tablet', strength: '5mg' },
    { name: 'Hydrocortisone', genericName: 'Hydrocortisone', category: 'Topical', description: 'Topical steroid', dosageForm: 'Cream', strength: '1%' },
    { name: 'Furosemide', genericName: 'Furosemide', category: 'Diuretic', description: 'Loop diuretic', dosageForm: 'Tablet', strength: '40mg' },
    { name: 'Clopidogrel', genericName: 'Clopidogrel', category: 'Cardiology', description: 'Antiplatelet agent', dosageForm: 'Tablet', strength: '75mg' },
    { name: 'Warfarin', genericName: 'Warfarin', category: 'Anticoagulant', description: 'Oral anticoagulant', dosageForm: 'Tablet', strength: '5mg' },
    { name: 'Levothyroxine', genericName: 'Levothyroxine', category: 'Endocrine', description: 'Thyroid hormone replacement', dosageForm: 'Tablet', strength: '50mcg' },
    { name: 'Naproxen', genericName: 'Naproxen', category: 'Analgesic', description: 'NSAID', dosageForm: 'Tablet', strength: '250mg' },
    { name: 'Diclofenac', genericName: 'Diclofenac', category: 'Analgesic', description: 'NSAID', dosageForm: 'Tablet', strength: '50mg' },
    { name: 'Vitamin C', genericName: 'Ascorbic Acid', category: 'Vitamins', description: 'Immune support', dosageForm: 'Tablet', strength: '1000mg' },
    { name: 'Vitamin D', genericName: 'Cholecalciferol', category: 'Vitamins', description: 'Bone health', dosageForm: 'Tablet', strength: '1000IU' },
    { name: 'Zinc', genericName: 'Zinc', category: 'Supplements', description: 'Mineral supplement', dosageForm: 'Tablet', strength: '50mg' },
    { name: 'Co-trimoxazole', genericName: 'Trimethoprim-Sulfamethoxazole', category: 'Antibiotic', description: 'Combination antibiotic', dosageForm: 'Tablet', strength: '960mg' },
    { name: 'Doxycycline', genericName: 'Doxycycline', category: 'Antibiotic', description: 'Tetracycline antibiotic', dosageForm: 'Capsule', strength: '100mg' },
    { name: 'Artemether-Lumefantrine', genericName: 'Coartem', category: 'Antimalarial', description: 'Combination therapy for malaria', dosageForm: 'Tablet', strength: '20mg/120mg' }
  ];

  const drugs = await Promise.all(drugData.map(d => prisma.drug.create({ data: d })));

  console.log(`Created ${drugs.length} drugs`);

  // Create a larger set of pharmacies across Ghana
  const citiesByRegion = {
    'Greater Accra': ['Accra', 'Tema', 'Madina', 'Dansoman', 'Labadi'],
    'Ashanti': ['Kumasi', 'Obuasi', 'Ejisu', 'Mampong', 'Konongo'],
    'Western': ['Takoradi', 'Sekondi', 'Tarkwa', 'Axim', 'Elubo'],
    'Central': ['Cape Coast', 'Kasoa', 'Winneba', 'Mankessim', 'Saltpond'],
    'Volta': ['Ho', 'Hohoe', 'Keta', 'Aflao', 'Sogakope'],
    'Eastern': ['Koforidua', 'Nsawam', 'Akosombo', 'Aburi', 'Suhum'],
    'Northern': ['Tamale', 'Yendi', 'Savelugu', 'Bimbilla', 'Walewale'],
    'Upper East': ['Bolgatanga', 'Navrongo', 'Bawku', 'Zebilla', 'Sandema'],
    'Upper West': ['Wa', 'Lawra', 'Tumu', 'Jirapa', 'Nandom'],
    'Brong-Ahafo': ['Sunyani', 'Techiman', 'Wenchi', 'Bechem', 'Dormaa']
  };

  const pharmaciesToCreate = [];
  let idx = 1;
  for (const [region, cities] of Object.entries(citiesByRegion)) {
    for (const city of cities) {
      pharmaciesToCreate.push({
        name: `${city} Pharmacy ${idx}`,
        address: `${100 + idx} Market Street, ${city}`,
        region,
        city,
        phone: `+233 ${20 + Math.floor(Math.random() * 79)} ${Math.floor(1000000 + Math.random() * 8999999)}`,
        openingHours: 'Mon-Sat: 8:00 AM - 8:00 PM'
      });
      idx++;
      if (pharmaciesToCreate.length >= 24) break;
    }
    if (pharmaciesToCreate.length >= 24) break;
  }

  const pharmacies = await Promise.all(pharmaciesToCreate.map(p => prisma.pharmacy.create({ data: p })));

  console.log(`Created ${pharmacies.length} pharmacies`);

  // Create pharmacy-drug relationships
  // Assign drugs to pharmacies with different availability and prices
  let createdRelations = 0;
  for (const pharmacy of pharmacies) {
    for (const drug of drugs) {
      // Randomly decide if this drug is available at this pharmacy
      const inStock = Math.random() > 0.4; // ~60% chance of being in stock
      const price = inStock ? +(Math.random() * 50 + 5).toFixed(2) : null; // Price between 5-55 GHS
      const quantity = inStock ? Math.floor(Math.random() * 100) + 5 : 0;

      // create sequentially to avoid SQLite write locks
      await prisma.pharmacyDrug.create({
        data: {
          pharmacyId: pharmacy.id,
          drugId: drug.id,
          price: price,
          quantity: quantity,
          inStock: inStock
        }
      });
      createdRelations++;
    }
  }

  console.log(`Created ${createdRelations} pharmacy-drug relationships`);

  // Create announcements (only user-facing announcements)
  const announcements = await Promise.all([
    prisma.announcement.create({
      data: {
        title: 'Welcome to MediFind Ghana',
        body: 'MediFind is live — search for drugs, compare prices, and find nearby pharmacies.',
        authorId: users[1].id
      }
    })
  ]);

  console.log(`Created ${announcements.length} announcements`);

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });