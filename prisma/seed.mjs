import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(12, 0, 0, 0);
  return d;
}

async function main() {
  console.log("Seeding database...");

  // --- Users ---
  const adminPass = await bcrypt.hash("admin123", 10);
  const viewerPass = await bcrypt.hash("viewer123", 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", name: "Шохрух (Админ)", password: adminPass, role: "admin" },
  });
  await prisma.user.upsert({
    where: { username: "viewer" },
    update: {},
    create: { username: "viewer", name: "Меҳмон", password: viewerPass, role: "viewer" },
  });

  // Avoid duplicating sample data on re-seed
  const existing = await prisma.account.count();
  if (existing > 0) {
    console.log("Sample data already present, skipping.");
    return;
  }

  // --- Accounts ---
  const alif = await prisma.account.create({
    data: { name: "Alif Bank", type: "bank", openingBalance: 0 },
  });
  const cash = await prisma.account.create({
    data: { name: "Хазинаи нақд (Cash)", type: "cash", openingBalance: 500 },
  });
  const wallet = await prisma.account.create({
    data: { name: "DC Wallet", type: "wallet", openingBalance: 0 },
  });

  // --- Targets (cumulative) ---
  await prisma.target.createMany({
    data: [
      { title: "Марҳилаи 1: Шағал (Gravel)", amount: 20000, sequence: 1 },
      { title: "Марҳилаи 2: Асфалт (Paving)", amount: 60000, sequence: 2 },
      { title: "Марҳилаи 3: Рӯшноӣ (Lighting)", amount: 100000, sequence: 3 },
    ],
  });

  // --- Donors + Donations ---
  const families = [
    ["Аҳмад", "Раҳимов", 45],
    ["Фотима", "Раҳимова", 40],
    ["Карим", "Сафаров", 33],
    ["Нодира", "Сафарова", 29],
    ["Бахтиёр", "Сафаров", 52],
    ["Дилшод", "Назаров", 60],
    ["Гулнора", "Назарова", 25],
    ["Фаррух", "Холов", 38],
    ["Зуҳра", "Холова", 41],
    ["Сино", "Раҳимов", 19],
  ];
  // The account itself is the payment method (Alif Bank, DC Wallet, cash).
  const accounts = [alif, wallet, cash];

  let i = 0;
  for (const [firstName, familyName, age] of families) {
    const donor = await prisma.donor.create({
      data: { firstName, familyName, age, isAnonymous: false },
    });
    // each donor gives 1-2 donations
    const gifts = 1 + (i % 2);
    for (let g = 0; g < gifts; g++) {
      const amount = [100, 250, 500, 1000, 1500, 750][(i + g) % 6];
      await prisma.donation.create({
        data: {
          amount,
          date: daysAgo((i * 2 + g) % 30),
          donorId: donor.id,
          accountId: accounts[(i + g) % 3].id,
        },
      });
    }
    i++;
  }

  // one anonymous donation
  const anon = await prisma.donor.create({ data: { isAnonymous: true } });
  await prisma.donation.create({
    data: { amount: 2000, date: daysAgo(3), donorId: anon.id, accountId: cash.id },
  });

  // --- Expenses ---
  await prisma.expense.create({
    data: { amount: 3500, date: daysAgo(10), category: "Маводҳо", payee: "Сангреза ООО", accountId: alif.id },
  });
  await prisma.expense.create({
    data: { amount: 1200, date: daysAgo(5), category: "Нақлиёт", payee: "Камаз", accountId: cash.id },
  });

  // --- A transfer ---
  await prisma.transfer.create({
    data: { amount: 1000, date: daysAgo(7), fromAccountId: alif.id, toAccountId: cash.id, note: "Барои харидҳои майда" },
  });

  console.log("Seed complete. Login: admin / admin123  (viewer / viewer123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
