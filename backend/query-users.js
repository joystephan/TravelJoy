const { PrismaClient } = require('@prisma/client');

// Set DATABASE_URL directly from docker-compose.yml
process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/traveljoy';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('\n📊 Fetching all users from the database...\n');
    
    const users = await prisma.user.findMany({
      include: {
        trips: true,
        subscription: true,
        preferences: true,
      }
    });

    if (users.length === 0) {
      console.log('❌ No users found in the database.\n');
    } else {
      console.log(`✅ Found ${users.length} user(s):\n`);
      
      users.forEach((user, index) => {
        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`User #${index + 1}`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`ID:           ${user.id}`);
        console.log(`Email:        ${user.email}`);
        console.log(`First Name:   ${user.firstName || 'N/A'}`);
        console.log(`Last Name:    ${user.lastName || 'N/A'}`);
        console.log(`Trips/Month:  ${user.tripsThisMonth}`);
        console.log(`Created:      ${user.createdAt}`);
        console.log(`Updated:      ${user.updatedAt}`);
        console.log(`Total Trips:  ${user.trips.length}`);
        console.log(`Subscription: ${user.subscription ? 'Yes (' + user.subscription.status + ')' : 'No'}`);
        console.log(`Preferences:  ${user.preferences ? 'Yes' : 'No'}`);
      });
      
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
  } catch (error) {
    console.error('❌ Error querying database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
