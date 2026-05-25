import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking Transactions...');
  const txCount = await prisma.transaction.count();
  console.log(`Total Transactions in DB: ${txCount}`);

  const recentTx = await prisma.transaction.findMany({
    take: 10,
    orderBy: { transactionDate: 'desc' },
    include: { user: true }
  });

  console.log('Recent 10 Transactions:');
  recentTx.forEach(tx => {
    console.log(`- ID: ${tx.id}, User: ${tx.user.email}, Date: ${tx.transactionDate}, Amount: ${tx.amount}, Type: ${tx.type}`);
  });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  console.log(`Current Date: ${now}`);
  console.log(`Start of Month: ${startOfMonth}`);

  const thisMonthTx = await prisma.transaction.findMany({
    where: {
      transactionDate: {
        gte: startOfMonth
      }
    }
  });

  console.log(`Transactions this month: ${thisMonthTx.length}`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
