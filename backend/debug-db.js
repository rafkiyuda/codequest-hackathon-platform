const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const admin = await prisma.team.findFirst({
        where: {
            groupName: {
                equals: 'Admin',
                mode: 'insensitive', // Try case insensitive
            }
        }
    });
    console.log('Admin Data:', JSON.stringify(admin, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
