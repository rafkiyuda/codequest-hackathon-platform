const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log("Testing Admin Login...");

    // 1. Fetch Admin
    const admin = await prisma.team.findFirst({
        where: { groupName: 'Admin' }
    });

    if (!admin) {
        console.log("❌ Admin user 'Admin' not found!");
        // Try lowercase 'admin'
        const adminLower = await prisma.team.findFirst({
            where: { groupName: 'admin' }
        });
        if (adminLower) {
            console.log("⚠️ Found 'admin' (lowercase) instead.");
        }
        return;
    }

    console.log("✅ Admin user found:", admin.groupName);
    console.log("Stored Hash:", admin.password);

    // 2. Test Password
    const password = 'Admin123!';
    const isMatch = await bcrypt.compare(password, admin.password);

    if (isMatch) {
        console.log("✅ Password 'Admin123!' is CORRECT.");
    } else {
        console.log("❌ Password 'Admin123!' is INCORRECT.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
