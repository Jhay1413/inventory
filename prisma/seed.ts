import 'dotenv/config';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '../app/generated/prisma/client';
import { auth } from "../app/lib/auth";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  // Seed accounts
  const accounts = [
    {
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password1234",
      image: "https://example.com/image.png",
    },
    {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      password: "password1234",
      image: "https://example.com/jane.png",
    },
    {
      name: "Admin User",
      email: "admin@example.com",
      password: "admin1234",
      image: "https://example.com/admin.png",
    },
  ];

  for (const account of accounts) {
    try {
      const data = await auth.api.signUpEmail({
        body: {
          name: account.name,
          email: account.email,
          password: account.password,
          image: account.image,
          callbackURL: "https://example.com/callback",
        },
      });
      console.log(`✅ Created account: ${account.email}`);
    } catch (error) {
      console.error(`❌ Failed to create account ${account.email}:`, error);
    }
  }

  // Seed Product Types + Models
  const productTypeSeed: Array<{ name: string; models: string[] }> = [
    {
      name: 'Phone',
      models: ['iPhone 15 Pro Max', 'iPhone 14 Pro', 'Samsung Galaxy S24 Ultra', 'Google Pixel 8 Pro'],
    },
    {
      name: 'Laptop',
      models: ['MacBook Air M2', 'MacBook Pro 14'],
    },
    {
      name: 'Tablet',
      models: ['iPad Pro 11', 'Samsung Galaxy Tab S9'],
    },
    {
      name: 'Headset',
      models: ['AirPods Pro 2', 'Sony WH-1000XM5'],
    },
    {
      name: 'Accessory',
      models: ['USB-C Charger 20W', 'USB-C Cable'],
    },
  ];

  for (const type of productTypeSeed) {
    const createdType = await prisma.productType.upsert({
      where: { name: type.name },
      update: {},
      create: { name: type.name },
    });

    for (const modelName of type.models) {
      await prisma.productModel.upsert({
        where: {
          productTypeId_name: {
            productTypeId: createdType.id,
            name: modelName,
          },
        },
        update: {},
        create: {
          name: modelName,
          productTypeId: createdType.id,
        },
      });
    }
  }

  console.log(`✅ Seeded ${productTypeSeed.length} product types (with models)`);

  // Seed Products (idempotent via IMEI)
  const productModelNames = [
    // Phone
    "iPhone 15 Pro Max",
    "iPhone 14 Pro",
    "Samsung Galaxy S24 Ultra",
    "Google Pixel 8 Pro",
    // Laptop
    "MacBook Air M2",
    // Tablet
    "iPad Pro 11",
    // Headset
    "AirPods Pro 2",
    // Accessory
    "USB-C Charger 20W",
  ] as const;

  const models = await prisma.productModel.findMany({
    where: { name: { in: [...productModelNames] } },
    select: { id: true, name: true },
  });

  const modelIdByName = new Map(models.map((m) => [m.name, m.id] as const));
  const missingModels = productModelNames.filter((n) => !modelIdByName.has(n));
  if (missingModels.length > 0) {
    throw new Error(`Missing seeded product models: ${missingModels.join(", ")}`);
  }

  const productsSeed = [
    {
      imei: "490154203237518",
      productModelName: "iPhone 15 Pro Max",
      color: "Natural Titanium",
      ram: 8,
      condition: "BrandNew" as const,
      availability: "Available" as const,
      status: "Sealed box",
    },
    {
      imei: "490154203237519",
      productModelName: "iPhone 14 Pro",
      color: "Deep Purple",
      ram: 6,
      condition: "SecondHand" as const,
      availability: "Available" as const,
      status: "Minor scratches on frame",
    },
    {
      imei: "490154203237520",
      productModelName: "Samsung Galaxy S24 Ultra",
      color: "Titanium Gray",
      ram: 12,
      condition: "BrandNew" as const,
      availability: "Sold" as const,
      status: "Sold - delivered",
    },
    {
      imei: "490154203237521",
      productModelName: "Google Pixel 8 Pro",
      color: "Obsidian",
      ram: 12,
      condition: "BrandNew" as const,
      availability: "Available" as const,
      status: "Ready for sale",
    },
    {
      imei: "490154203237522",
      productModelName: "MacBook Air M2",
      color: "Midnight",
      ram: 8,
      condition: "BrandNew" as const,
      availability: "Available" as const,
      status: "Base model",
    },
    {
      imei: "490154203237523",
      productModelName: "iPad Pro 11",
      color: "Space Gray",
      ram: 8,
      condition: "BrandNew" as const,
      availability: "Available" as const,
      status: "Wi‑Fi",
    },
    {
      imei: "490154203237524",
      productModelName: "AirPods Pro 2",
      color: "White",
      ram: 1,
      condition: "BrandNew" as const,
      availability: "Available" as const,
      status: "Sealed",
    },
    {
      imei: "490154203237525",
      productModelName: "USB-C Charger 20W",
      color: "White",
      ram: 1,
      condition: "BrandNew" as const,
      availability: "Available" as const,
      status: "New stock",
    },
  ];

  for (const p of productsSeed) {
    await prisma.product.upsert({
      where: { imei: p.imei },
      update: {
        productModelId: modelIdByName.get(p.productModelName)!,
        color: p.color,
        ram: p.ram,
        condition: p.condition,
        availability: p.availability,
        status: p.status,
      },
      create: {
        imei: p.imei,
        productModelId: modelIdByName.get(p.productModelName)!,
        color: p.color,
        ram: p.ram,
        condition: p.condition,
        availability: p.availability,
        status: p.status,
      },
    });
  }

  console.log(`✅ Seeded ${productsSeed.length} products`);

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
