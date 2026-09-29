import { env } from "../config/env";
import { seedProducts } from "../data/products";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { slugify } from "../utils/slugify";

export const DEMO_CUSTOMER = { email: "customer@nova.dev", password: "Customer@123" };

export async function seedAll({ reset = false } = {}) {
  if (reset) {
    await Promise.all([Order.deleteMany({}), Product.deleteMany({}), User.deleteMany({})]);
  }

  // Unique indexes must exist before inserting: several serverless instances can
  // cold-start on an empty database at once, and the indexes turn their parallel
  // seeds into duplicate-key errors instead of duplicate documents.
  await Promise.all([Product.createIndexes(), User.createIndexes()]);

  await ignoreDuplicates(
    Product.insertMany(
      seedProducts.map((p) => ({ ...p, slug: slugify(p.name) })),
      { ordered: false },
    ),
  );
  await ignoreDuplicates(
    User.create({
      name: "NOVA Admin",
      email: env.adminEmail,
      password: env.adminPassword,
      role: "admin",
    }),
  );
  await ignoreDuplicates(User.create({ name: "Demo Customer", ...DEMO_CUSTOMER }));

  console.log(`🌱 Seeded ${seedProducts.length} products`);
  if (!env.isProd) {
    console.log(`   Admin:    ${env.adminEmail} / ${env.adminPassword}`);
    console.log(`   Customer: ${DEMO_CUSTOMER.email} / ${DEMO_CUSTOMER.password}`);
  }
}

async function ignoreDuplicates(work: Promise<unknown>) {
  try {
    await work;
  } catch (err) {
    if ((err as { code?: number }).code !== 11000) throw err;
  }
}

export async function seedIfEmpty() {
  if ((await Product.estimatedDocumentCount()) === 0) await seedAll();
}
