const prisma = require('../utils/prisma');

async function main() {
    console.log('Seeding landing page content...');

    // 1. FAQ
    const faqs = [
        {
            question: "What are the themes for this hackathon?",
            answer: "Social Impact, Fintech & Business, Future Tech, and Creative Design",
            order: 1
        },
        {
            question: "Who can participate?",
            answer: "Students, professionals, and tech enthusiasts above 17 years old.",
            order: 2
        },
        {
            question: "Is there a registration fee?",
            answer: "Please check the guidebook for details regarding registration.",
            order: 3
        }
    ];

    for (const f of faqs) {
        await prisma.faq.upsert({
            where: { id: `faq-${f.order}` },
            update: f,
            create: { id: `faq-${f.order}`, ...f }
        });
    }

    // 2. Mentors and Jury
    const mentors = [
        { name: "Mentor I", title: "King of Spain", type: "Mentor", order: 1 },
        { name: "Mentor II", title: "King Haakon VII of Norway", type: "Mentor", order: 2 },
        { name: "Jury I", title: "Alexander the Great", type: "Jury", order: 3 },
        { name: "Jury II", title: "Holy Roman Emperor Charles V", type: "Jury", order: 4 }
    ];

    for (const m of mentors) {
        await prisma.mentor.upsert({
            where: { id: `mentor-${m.order}` },
            update: m,
            create: { id: `mentor-${m.order}`, ...m }
        });
    }

    // 3. Prizes
    const prizes = [
        { rank: "1st", reward: "Rp 8 million", order: 1 },
        { rank: "2nd", reward: "Rp 2 million", order: 2 },
        { rank: "3rd", reward: "Rp 0.8 million", order: 3 }
    ];

    for (const p of prizes) {
        await prisma.prize.upsert({
            where: { id: `prize-${p.order}` },
            update: p,
            create: { id: `prize-${p.order}`, ...p }
        });
    }

    // 4. Timeline
    const timeline = [
        { event: "Registration Close", date: "8 February 2026", order: 1 },
        { event: "Technical Meeting", date: "9 February 2026", order: 2 },
        { event: "Hacking Session", date: "10-17 February 2026", order: 3 },
        { event: "Final Submission", date: "18 February 2026", order: 4 }
    ];

    for (const t of timeline) {
        await prisma.timeline.upsert({
            where: { id: `timeline-${t.order}` },
            update: t,
            create: { id: `timeline-${t.order}`, ...t }
        });
    }

    // 5. Socials
    const socials = [
        { name: "instagram", account: "@technoscapebncc", url: "https://instagram.com/technoscapebncc", order: 1 },
        { name: "gmail", account: "technoscape@bncc.net", url: "mailto:technoscape@bncc.net", order: 2 },
        { name: "instagram", account: "@BNCC_Binus", url: "https://instagram.com/BNCC_Binus", order: 3 },
        { name: "linkedin", account: "@bina.nusantara.computer.club", url: "https://linkedin.com/company/bina.nusantara.computer.club", order: 4 },
        { name: "twitter", account: "@bnccbinus", url: "https://twitter.com/bnccbinus", order: 5 }
    ];

    for (const s of socials) {
        await prisma.social.upsert({
            where: { id: `social-${s.order}` },
            update: s,
            create: { id: `social-${s.order}`, ...s }
        });
    }

    // 6. Admin Account
    const adminPassword = await require('bcryptjs').hash('Admin123!', 10);
    await prisma.team.upsert({
        where: { groupName: 'Admin' },
        update: {
            password: adminPassword,
            role: 'ADMIN'
        },
        create: {
            groupName: 'Admin',
            password: adminPassword,
            status: 'NON_BINUSIAN', // Dummy status
            role: 'ADMIN'
        }
    });

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
