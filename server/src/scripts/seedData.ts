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

  await Product.insertMany(seedProducts.map((p) => ({ ...p, slug: slugify(p.name) })));

  if (!(await User.exists({ email: env.adminEmail }))) {
    await User.create({
      name: "NOVA Admin",
      email: env.adminEmail,
      password: env.adminPassword,
      role: "admin",
    });
  }
  if (!(await User.exists({ email: DEMO_CUSTOMER.email }))) {
    await User.create({ name: "Demo Customer", ...DEMO_CUSTOMER });
  }

  console.log(`🌱 Seeded ${seedProducts.length} products`);
  console.log(`   Admin:    ${env.adminEmail} / ${env.adminPassword}`);
  console.log(`   Customer: ${DEMO_CUSTOMER.email} / ${DEMO_CUSTOMER.password}`);
}

export async function seedIfEmpty() {
  if ((await Product.estimatedDocumentCount()) === 0) await seedAll();
}
