const express = require('express');
const prisma = require('../utils/prisma');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth and admin middleware to all routes in this file
router.use(authMiddleware);
router.use(adminMiddleware);

// Get all participants
router.get('/participants', async (req, res) => {
    try {
        const { search, sort, order } = req.query;

        const queryOptions = {
            include: { leader: true },
            where: {}
        };

        if (search) {
            queryOptions.where = {
                groupName: { contains: search, mode: 'insensitive' }
            };
        }

        if (sort) {
            queryOptions.orderBy = {
                [sort]: order === 'desc' ? 'desc' : 'asc'
            };
        } else {
            queryOptions.orderBy = { createdAt: 'desc' };
        }

        const participants = await prisma.team.findMany(queryOptions);

        // Filter out passwords
        const filtered = participants.map(p => {
            const { password, ...data } = p;
            return data;
        });

        res.json(filtered);
    } catch (error) {
        console.error('Admin participants error:', error);
        res.status(500).json({ message: 'Server error fetching participants' });
    }
});

// Get single participant detail
router.get('/participants/:id', async (req, res) => {
    try {
        const team = await prisma.team.findUnique({
            where: { id: req.params.id },
            include: { leader: true }
        });

        if (!team) return res.status(404).json({ message: 'Team not found' });

        const { password, ...data } = team;
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update participant
router.put('/participants/:id', async (req, res) => {
    try {
        const { groupName, status, leader } = req.body;

        const updated = await prisma.team.update({
            where: { id: req.params.id },
            data: {
                groupName,
                status: status === 'BINUSIAN' ? 'BINUSIAN' : 'NON_BINUSIAN',
                leader: {
                    update: {
                        ...leader,
                        birthDate: leader.birthDate ? new Date(leader.birthDate) : undefined
                    }
                }
            },
            include: { leader: true }
        });

        const { password, ...data } = updated;
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating participant' });
    }
});

// Delete participant
router.delete('/participants/:id', async (req, res) => {
    try {
        await prisma.team.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Team deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting participant' });
    }
});

module.exports = router;
