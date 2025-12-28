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

  // Seed Organization + Membership
  const organizationsSeed = [
    { name: "Warehouse", slug: "warehouse" },
    { name: "Tacloban", slug: "tacloban" },
    { name: "Catbalogan", slug: "catbalogan" },
    { name: "Guiuan", slug: "guiuan" },
    { name: "Borongan", slug: "borongan" },
  ] as const;

  const organizationSeedDefaults = {
    logo: "https://example.com/logo.png",
    userId: "some_user_id",
    keepCurrentActiveOrganization: false,
  } as const;

  const fallbackAdminUser = await prisma.user.findUnique({
    where: { email: "admin@example.com" },
    select: { id: true },
  });

  const requestedUser = await prisma.user.findUnique({
    where: { id: organizationSeedDefaults.userId },
    select: { id: true },
  });

  const organizationOwnerUserId = requestedUser?.id ?? fallbackAdminUser?.id;
  if (!organizationOwnerUserId) {
    console.warn(
      "⚠️ Skipping organization seed: no matching user found (requested userId not present and admin@example.com missing)."
    );
  } else {
    for (const org of organizationsSeed) {
      const metadata = {
        isAdminOrganization: org.slug === "warehouse",
      } as const

      const existingOrganization = await prisma.organization.findUnique({
        where: { slug: org.slug },
        select: { id: true, slug: true },
      });

      if (existingOrganization) {
        await prisma.organization.update({
          where: { slug: org.slug },
          data: {
            metadata: JSON.stringify(metadata),
          },
        })
        console.log(`↩️ Organization already exists: ${existingOrganization.slug}`);
        continue;
      }

      await auth.api.createOrganization({
        body: {
          name: org.name,
          slug: org.slug,
          logo: organizationSeedDefaults.logo,
          metadata,
          userId: organizationOwnerUserId,
          keepCurrentActiveOrganization:
            organizationSeedDefaults.keepCurrentActiveOrganization,
        },
      });

      console.log(`✅ Created organization: ${org.slug}`);
    }
  }

  // Seed Product Types + Models
  const uniqueModels = (items: string[]) => Array.from(new Set(items));

  const iphoneModels: string[] = [
    "iPhone 6",
    "iPhone 6 Plus",
    "iPhone 6s",
    "iPhone 6s Plus",
    "iPhone SE (1st Gen)",
    "iPhone 7",
    "iPhone 7 Plus",
    "iPhone 8",
    "iPhone 8 Plus",
    "iPhone X",
    "iPhone XR",
    "iPhone XS",
    "iPhone XS Max",
    "iPhone 11",
    "iPhone 11 Pro",
    "iPhone 11 Pro Max",
    "iPhone SE (2nd Gen)",
    "iPhone 12 mini",
    "iPhone 12",
    "iPhone 12 Pro",
    "iPhone 12 Pro Max",
    "iPhone 13 mini",
    "iPhone 13",
    "iPhone 13 Pro",
    "iPhone 13 Pro Max",
    "iPhone SE (3rd Gen)",
    "iPhone 14",
    "iPhone 14 Plus",
    "iPhone 14 Pro",
    "iPhone 14 Pro Max",
    "iPhone 15",
    "iPhone 15 Plus",
    "iPhone 15 Pro",
    "iPhone 15 Pro Max",
    "iPhone 16",
    "iPhone 16 Plus",
    "iPhone 16 Pro",
    "iPhone 16 Pro Max",
  ];

  const ipadModels: string[] = [
    "iPad (9th Gen)",
    "iPad (10th Gen)",
    "iPad Air (4th Gen)",
    "iPad Air (5th Gen)",
    "iPad Air 11-inch (M2)",
    "iPad Air 13-inch (M2)",
    "iPad mini (5th Gen)",
    "iPad mini (6th Gen)",
    // Keep existing seed model names as-is (used by productsSeed below)
    "iPad Pro 11",
    // Additional common naming variants
    "iPad Pro 11-inch (1st Gen)",
    "iPad Pro 11-inch (2nd Gen)",
    "iPad Pro 11-inch (3rd Gen)",
    "iPad Pro 11-inch (4th Gen)",
    "iPad Pro 12.9-inch (3rd Gen)",
    "iPad Pro 12.9-inch (4th Gen)",
    "iPad Pro 12.9-inch (5th Gen)",
    "iPad Pro 12.9-inch (6th Gen)",
    "iPad Pro 11-inch (M4)",
    "iPad Pro 13-inch (M4)",
  ];

  const macModels: string[] = [
    // MacBook Air
    "MacBook Air M1",
    "MacBook Air M2",
    "MacBook Air M3",
    // MacBook Pro
    "MacBook Pro 13 (M1)",
    // Keep existing seed model names as-is (used by productsSeed below)
    "MacBook Pro 14",
    "MacBook Pro 16",
    "MacBook Pro 14 (M1 Pro)",
    "MacBook Pro 14 (M1 Max)",
    "MacBook Pro 14 (M2 Pro)",
    "MacBook Pro 14 (M2 Max)",
    "MacBook Pro 14 (M3 Pro)",
    "MacBook Pro 14 (M3 Max)",
    "MacBook Pro 16 (M1 Pro)",
    "MacBook Pro 16 (M1 Max)",
    "MacBook Pro 16 (M2 Pro)",
    "MacBook Pro 16 (M2 Max)",
    "MacBook Pro 16 (M3 Pro)",
    "MacBook Pro 16 (M3 Max)",
    // Desktop Macs
    "iMac 24-inch (M1)",
    "iMac 24-inch (M3)",
    "Mac mini (M1)",
    "Mac mini (M2)",
    "Mac mini (M2 Pro)",
    "Mac Studio (M1 Max)",
    "Mac Studio (M1 Ultra)",
    "Mac Studio (M2 Max)",
    "Mac Studio (M2 Ultra)",
    "Mac Pro (M2 Ultra)",
  ];

  const productTypeSeed: Array<{ name: string; models: string[] }> = [
    {
      name: 'Phone',
      models: uniqueModels([
        ...iphoneModels,
        // Keep existing non-Apple examples
        "Samsung Galaxy S24 Ultra",
        "Google Pixel 8 Pro",
      ]),
    },
    {
      name: 'Laptop',
      models: uniqueModels([...macModels]),
    },
    {
      name: 'Tablet',
      models: uniqueModels([
        ...ipadModels,
        // Keep existing non-Apple examples
        "Samsung Galaxy Tab S9",
      ]),
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

  const warehouseOrg = await prisma.organization.findUnique({
    where: { slug: "warehouse" },
    select: { id: true },
  })

  if (!warehouseOrg?.id) {
    throw new Error("Missing organization with slug 'warehouse' (required for product seeding)")
  }

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
        branchId: warehouseOrg.id,
        color: p.color,
        ram: p.ram,
        condition: p.condition,
        availability: p.availability,
        status: p.status,
      },
      create: {
        imei: p.imei,
        productModelId: modelIdByName.get(p.productModelName)!,
        branchId: warehouseOrg.id,
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
