require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const orders = await prisma.order.findMany({
    where: { status: 'COMPLETED' },
    select: { id: true, completedAt: true, deliverTime: true, isComplained: true },
    take: 5, orderBy: { createdAt: 'desc' }
  });
  console.log(JSON.stringify(orders.map(o => ({ ...o, id: o.id.toString() })), null, 2));
  await prisma.disconnect();
}
main().catch(console.error);
