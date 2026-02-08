const express = require('express');
const prisma = require('../utils/prisma');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        const team = await prisma.team.findUnique({
            where: { id: req.user.id },
            include: { leader: true }
        });

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const timelines = await prisma.timeline.findMany({ orderBy: { order: 'asc' } });
        const socials = await prisma.social.findMany({ orderBy: { order: 'asc' } });

        // Exclude password
        const { password, ...teamData } = team;
        res.json({
            ...teamData,
            timelines,
            socials
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: 'Server error fetching dashboard data' });
    }
});

module.exports = router;
