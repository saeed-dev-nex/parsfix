import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

console.log("Prisma Client Initialized");
// process.on('SIGINT', async () => {
//   await prisma.$disconnect();
//   process.exit(0);
// });

export default prisma;
