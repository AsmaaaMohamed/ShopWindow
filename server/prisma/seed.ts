/**
 * prisma/seed.ts
 *
 * Seeds the database with realistic catalog data: categories and several
 * hundred products, matching this schema:
 *
 *   model Category { id, name (unique), slug (unique), ... products Product[] }
 *   model Product  { id, name (unique), sku (unique), slug (unique),
 *                    categoryId?, description, price, currency, status,
 *                    stock, ... category Category? }
 *
 * Safe to re-run against a fresh (or existing) database — it clears prior
 * catalog data before inserting new rows.
 *
 * Setup:
 *   npm install -D @faker-js/faker tsx
 *
 *   // package.json
 *   "prisma": {
 *     "seed": "tsx prisma/seed.ts"
 *   }
 *
 * Run:
 *   npx prisma db seed
 *   # or, for a totally fresh database:
 *   npx prisma migrate reset
 */


import { faker } from '@faker-js/faker';
import { PrismaClient } from '../src/generated/prisma/client';
import {ProductStatus} from '../src/generated/prisma/enums';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({adapter});

// ---- Config -----------------------------------------------------------

const TOTAL_PRODUCTS = 500;
const ARCHIVED_RATIO = 0.15; // ~15% of products are archived, rest active
const CURRENCIES = ['USD', 'EUR', 'GBP', 'EGP'];

const CATEGORY_NAMES = [
  'Electronics',
  'Home & Kitchen',
  'Sports & Outdoors',
  'Books',
  'Toys & Games',
  'Clothing',
  'Footwear',
  'Beauty & Personal Care',
  'Health & Household',
  'Automotive',
  'Garden & Outdoor',
  'Office Supplies',
  'Pet Supplies',
  'Musical Instruments',
  'Tools & Home Improvement',
  'Grocery & Gourmet',
  'Baby',
  'Jewelry',
];

// Category-flavored product noun banks so names look plausible rather than
// fully random word salad.
const PRODUCT_NOUNS: Record<string, string[]> = {
  Electronics: ['Headphones', 'Bluetooth Speaker', 'Smartwatch', 'USB-C Cable', 'Power Bank', 'Webcam', 'Router', 'Monitor', 'Keyboard', 'Mouse'],
  'Home & Kitchen': ['Blender', 'Cutting Board', 'Cookware Set', 'Coffee Maker', 'Air Fryer', 'Knife Set', 'Toaster', 'Mixing Bowl', 'Dish Rack'],
  'Sports & Outdoors': ['Yoga Mat', 'Resistance Bands', 'Water Bottle', 'Camping Tent', 'Hiking Backpack', 'Dumbbell Set', 'Sleeping Bag'],
  Books: ['Novel', 'Cookbook', 'Journal', 'Planner', 'Biography', 'Field Guide', 'Notebook'],
  'Toys & Games': ['Board Game', 'Puzzle', 'Building Blocks', 'Action Figure', 'Card Game', 'Plush Toy', 'RC Car'],
  Clothing: ['T-Shirt', 'Hoodie', 'Jeans', 'Jacket', 'Sweater', 'Shorts', 'Dress'],
  Footwear: ['Running Shoes', 'Sandals', 'Boots', 'Sneakers', 'Slippers'],
  'Beauty & Personal Care': ['Face Serum', 'Shampoo', 'Moisturizer', 'Lip Balm', 'Hair Dryer', 'Electric Razor'],
  'Health & Household': ['Vitamin Supplement', 'First Aid Kit', 'Air Purifier', 'Humidifier', 'Thermometer'],
  Automotive: ['Car Vacuum', 'Phone Mount', 'Floor Mats', 'Jump Starter', 'Tire Inflator'],
  'Garden & Outdoor': ['Garden Hose', 'Planter Pot', 'Pruning Shears', 'Patio Umbrella', 'Solar Lights'],
  'Office Supplies': ['Desk Organizer', 'Stapler', 'Notebook Set', 'Whiteboard', 'Desk Lamp'],
  'Pet Supplies': ['Dog Leash', 'Cat Scratching Post', 'Pet Bed', 'Chew Toy', 'Feeding Bowl'],
  'Musical Instruments': ['Acoustic Guitar', 'Keyboard Piano', 'Ukulele', 'Drum Sticks', 'Harmonica'],
  'Tools & Home Improvement': ['Cordless Drill', 'Tool Set', 'Tape Measure', 'Hammer', 'Wrench Set'],
  'Grocery & Gourmet': ['Olive Oil', 'Coffee Beans', 'Spice Set', 'Honey Jar', 'Tea Sampler'],
  Baby: ['Baby Monitor', 'Diaper Bag', 'Stroller', 'Bottle Set', 'Crib Sheet'],
  Jewelry: ['Necklace', 'Bracelet', 'Earrings', 'Ring', 'Watch'],
};

const BRAND_PREFIXES = ['Nova', 'Aero', 'Crest', 'Pulse', 'Summit', 'Vivid', 'Urban', 'Nimbus', 'Terra', 'Lumen', 'Cobalt', 'Drift'];
const MODIFIERS = ['Pro', 'Plus', 'Lite', 'Max', 'Mini', '2.0', 'Elite', 'Essential', 'Classic', 'X'];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function randomPrice(): number {
  // Skew toward common retail price bands, with occasional premium items.
  const bands = [
    { min: 4.99, max: 29.99, weight: 0.45 },
    { min: 30, max: 99.99, weight: 0.35 },
    { min: 100, max: 499.99, weight: 0.15 },
    { min: 500, max: 1999.99, weight: 0.05 },
  ];
  const roll = Math.random();
  let cumulative = 0;
  const band = bands.find((b) => {
    cumulative += b.weight;
    return roll <= cumulative;
  }) ?? bands[0];
  const raw = faker.number.float({ min: band.min, max: band.max, fractionDigits: 2 });
  return Math.round(raw * 100) / 100;
}

function randomStock(status: ProductStatus): number {
  // Archived products are more likely to be out of stock or low stock.
  if (status === ProductStatus.ARCHIVED) {
    return faker.number.int({ min: 0, max: 20 });
  }
  return faker.number.int({ min: 0, max: 500 });
}

async function main() {
  console.log('Seeding catalog data...');

  // Clean slate so the script can be re-run against the same database.
  // Products first (FK -> Category).
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // ---- Categories ---------------------------------------------------------

  const categories = await Promise.all(
    CATEGORY_NAMES.map((name) =>
      prisma.category.create({
        data: {
          name,
          slug: slugify(name),
        },
      })
    )
  );

  console.log(`Created ${categories.length} categories.`);

  // ---- Products -------------------------------------------------------------

  const usedNames = new Set<string>();
  const usedSkus = new Set<string>();
  const usedSlugs = new Set<string>();

  function uniqueName(): string {
    let name = '';
    do {
      const category = faker.helpers.arrayElement(categories);
      const nounBank = PRODUCT_NOUNS[category.name] ?? ['Item'];
      const noun = faker.helpers.arrayElement(nounBank);
      const brand = faker.helpers.arrayElement(BRAND_PREFIXES);
      const modifier = faker.helpers.arrayElement(MODIFIERS);
      name = `${brand} ${noun} ${modifier}`;
    } while (usedNames.has(name));
    usedNames.add(name);
    return name;
  }

  function uniqueSku(): string {
    let sku = '';
    do {
      sku = `SKU-${faker.string.alphanumeric({ length: 8, casing: 'upper' })}`;
    } while (usedSkus.has(sku));
    usedSkus.add(sku);
    return sku;
  }

  function uniqueSlug(base: string): string {
    let slug = slugify(base);
    while (usedSlugs.has(slug)) {
      slug = slugify(`${base}-${faker.string.alphanumeric(4)}`);
    }
    usedSlugs.add(slug);
    return slug;
  }

  const productData = Array.from({ length: TOTAL_PRODUCTS }, () => {
    const category = faker.helpers.arrayElement(categories);
    const name = uniqueName();
    const status: ProductStatus = Math.random() < ARCHIVED_RATIO
      ? ProductStatus.ARCHIVED
      : ProductStatus.ACTIVE;

    return {
      name,
      sku: uniqueSku(),
      slug: uniqueSlug(name),
      categoryId: category.id,
      description: faker.commerce.productDescription(),
      price: randomPrice(),
      currency: faker.helpers.arrayElement(CURRENCIES),
      status,
      stock: randomStock(status),
    };
  });

  // Batch insert for speed; createMany is fine since categoryId is a plain
  // scalar FK (no nested relation writes needed per row).
  const BATCH_SIZE = 100;
  let createdCount = 0;
  for (let i = 0; i < productData.length; i += BATCH_SIZE) {
    const batch = productData.slice(i, i + BATCH_SIZE);
    await prisma.product.createMany({ data: batch });
    createdCount += batch.length;
    console.log(`  ...${createdCount}/${productData.length} products created`);
  }

  const activeCount = productData.filter((p) => p.status === ProductStatus.ACTIVE).length;
  const archivedCount = productData.length - activeCount;

  console.log(`Created ${productData.length} products (${activeCount} active, ${archivedCount} archived).`);
  console.log('Seed complete.');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });