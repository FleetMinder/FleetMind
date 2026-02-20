import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("FleetMind - Nessun dato di seed necessario.");
  console.log("Gli utenti creeranno i propri dati attraverso l'onboarding.");

  // Conta le risorse esistenti
  const companies = await prisma.company.count();
  const users = await prisma.user.count();
  console.log(`Database attuale: ${companies} aziende, ${users} utenti.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
