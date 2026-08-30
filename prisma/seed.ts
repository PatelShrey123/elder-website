import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultTrainers = [
  { name: "[EGD]Fabin#KB4ACS", region: "GLOBAL" },
  { name: "Carson / CertifiedLoser#V90LM3", region: "ASIA" },
  { name: "Elena#VRVXZT", region: "ASIA" },
  { name: "Ghoul#OM2Z2I", region: "ASIA" },
  { name: "ElderGoonerDih#GNCCHM", region: "ASIA" },
  { name: "NEKKI#FUYR7K", region: "ASIA" },
  { name: "Sylkie#7FRZOY", region: "ASIA" },
  { name: "Intrepidus#T2D70P", region: "ASIA" },
  { name: "S_A_N_T_I#69I3DV", region: "EU" },
  { name: "LuigiToan#ZSCKH5", region: "ASIA" },
];

async function main() {
  const trainersJson = JSON.stringify(defaultTrainers);
  
  await prisma.systemSettings.upsert({
    where: { id: "config" },
    update: {},
    create: {
      id: "config",
      slotsLimit: 15,
      trainers: trainersJson,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
