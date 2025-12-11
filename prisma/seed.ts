import 'dotenv/config';
import { auth } from "../app/lib/auth";

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

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
