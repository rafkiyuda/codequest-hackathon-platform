const express = require('express');
const prisma = require('../utils/prisma');

const router = express.Router();

// Get all landing page content
router.get('/', async (req, res) => {
    try {
        const [faqs, mentors, prizes, timelines, socials] = await Promise.all([
            prisma.faq.findMany({ orderBy: { order: 'asc' } }),
            prisma.mentor.findMany({ orderBy: { order: 'asc' } }),
            prisma.prize.findMany({ orderBy: { order: 'asc' } }),
            prisma.timeline.findMany({ orderBy: { order: 'asc' } }),
            prisma.social.findMany({ orderBy: { order: 'asc' } })
        ]);

        res.json({
            faqs,
            mentors,
            prizes,
            timelines,
            socials
        });
    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({ message: 'Server error while fetching content' });
    }
});

// Admin-only: Update specific content (example for FAQ)
// This can be expanded for other models as needed
router.post('/faqs', async (req, res) => {
    // Basic implementation for now
    try {
        const { question, answer, order } = req.body;
        const newFaq = await prisma.faq.create({
            data: { question, answer, order }
        });
        res.status(201).json(newFaq);
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
});

module.exports = router;
