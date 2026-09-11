import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const db = new PrismaClient();

const CATEGORIES = [
  { name: "Electronics", icon: "📱", slug: "electronics", commission: 5, minFee: 50, maxFee: 5000, displayOrder: 1, attributes: ["Brand", "Model", "RAM", "Storage", "Condition", "Warranty"], subs: [["Mobile Phones", "mobile-phones", "📱"], ["Laptops", "laptops", "💻"], ["Cameras", "cameras", "📷"], ["Audio", "audio", "🎧"], ["Televisions", "televisions", "📺"]] },
  { name: "Vehicles", icon: "🚗", slug: "vehicles", commission: 3, minFee: 200, maxFee: 10000, displayOrder: 2, attributes: ["Brand", "Model", "Year", "KM Driven", "Fuel Type"], subs: [["Cars", "cars", "🚗"], ["Motorcycles", "motorcycles", "🏍️"], ["Scooters", "scooters", "🛵"], ["Bicycles", "bicycles", "🚴"]] },
  { name: "Property", icon: "🏠", slug: "property", commission: 2, minFee: 500, maxFee: 20000, displayOrder: 3, attributes: ["Type", "BHK", "Area (sqft)", "Furnishing"], subs: [["Apartments", "apartments", "🏢"], ["Houses", "houses", "🏠"], ["Plots", "plots", "🌳"]] },
  { name: "Fashion", icon: "👗", slug: "fashion", commission: 8, minFee: 20, maxFee: 2000, displayOrder: 4, attributes: ["Brand", "Size", "Colour"], subs: [["Clothing", "clothing", "👕"], ["Footwear", "footwear", "👟"], ["Bags", "bags", "👜"]] },
  { name: "Sports", icon: "⚽", slug: "sports", commission: 6, minFee: 30, maxFee: 3000, displayOrder: 5, attributes: ["Sport Type", "Brand"], subs: [["Fitness Equipment", "fitness", "🏋️"], ["Outdoor Sports", "outdoor", "🏕️"]] },
  { name: "Furniture", icon: "🛋️", slug: "furniture", commission: 7, minFee: 100, maxFee: 5000, displayOrder: 6, attributes: ["Material", "Dimensions", "Colour"], subs: [["Living Room", "living-room", "🛋️"], ["Bedroom", "bedroom", "🛏️"], ["Study", "study", "🪑"]] },
  { name: "Books", icon: "📚", slug: "books", commission: 10, minFee: 10, maxFee: 500, displayOrder: 7, attributes: ["Author", "Publisher", "Language"], subs: [] as string[][] },
  { name: "Other", icon: "📦", slug: "other", commission: 5, minFee: 20, maxFee: 2000, displayOrder: 8, attributes: [], subs: [] as string[][] },
];

async function main() {
  // Admin
  const adminEmail = "admin@test.com";
  const admin = await db.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    await db.user.create({
      data: {
        name: "Super Admin", email: adminEmail, passwordHash: await hash("admin123", 10),
        phone: "+91 9876543210", city: "Lucknow", role: "admin", status: "active",
        avatar: "SA", mode: "seller", canBuy: true, canSell: true,
      },
    });
    console.log("✓ admin@test.com / admin123 created");
  }

  // Categories + subs
  for (const c of CATEGORIES) {
    const existing = await db.category.findUnique({ where: { slug: c.slug } });
    let catId = existing?.id;
    if (!existing) {
      const created = await db.category.create({
        data: { name: c.name, icon: c.icon, slug: c.slug, commission: c.commission, minFee: c.minFee, maxFee: c.maxFee, displayOrder: c.displayOrder, status: "active", active: true, attributes: c.attributes },
      });
      catId = created.id;
    }
    for (const [sname, sslug, sicon] of c.subs) {
      const sExisting = await db.subcategory.findFirst({ where: { categoryId: catId, slug: sslug } });
      if (!sExisting && catId) {
        await db.subcategory.create({ data: { categoryId: catId, name: sname, slug: sslug, icon: sicon, status: "active" } });
      }
    }
  }
  console.log("✓ categories seeded");

  // Commission defaults
  await db.siteSetting.upsert({
    where: { key: "commission" },
    create: { key: "commission", value: { applyGST: true, applyTDS: false, platformFees: { contactReveal: 29, boostFee: 499, featuredFee: 999, badgeGold: 2999, badgeSilver: 1999, badgeBronze: 999 } } },
    update: {},
  });

  // CMS defaults
  const pages = [
    { slug: "terms", title: "Terms & Conditions", published: true, content: "## Terms & Conditions\n\nWelcome to Addies Exchange." },
    { slug: "privacy", title: "Privacy Policy", published: true, content: "## Privacy Policy\n\nWe take your privacy seriously." },
    { slug: "faq", title: "FAQ", published: true, content: "", faqs: [{ q: "How do I sell?", a: "Create an account, verify KYC, and post your listing." }] },
  ];
  for (const p of pages) {
    await db.cmsPage.upsert({ where: { slug: p.slug }, create: p as never, update: {} });
  }
  console.log("✓ cms + settings seeded");
}

main().then(() => db.$disconnect()).catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(1); });
