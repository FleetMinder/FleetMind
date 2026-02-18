import { prisma } from "./prisma";

export async function getCompany() {
  const company = await prisma.company.findFirst();
  if (!company) throw new Error("Nessuna azienda trovata. Eseguire il seed del database.");
  return company;
}

export async function getCompanyId() {
  const company = await getCompany();
  return company.id;
}
