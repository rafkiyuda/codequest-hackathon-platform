const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
    try {
        const {
            groupName,
            password,
            status,
            fullName,
            email,
            whatsappNumber,
            lineId,
            githubId,
            birthPlace,
            birthDate,
            cvUrl,
            idCardUrl
        } = req.body;

        // Basic validation (more can be added)
        if (!groupName || !password || !email) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create Team and Leader in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const team = await tx.team.create({
                data: {
                    groupName,
                    password: hashedPassword,
                    status: status === 'binusian' ? 'BINUSIAN' : 'NON_BINUSIAN',
                    role: 'USER',
                    leader: {
                        create: {
                            fullName,
                            email,
                            whatsappNumber,
                            lineId,
                            githubId,
                            birthPlace,
                            birthDate: new Date(birthDate),
                            cvUrl,
                            idCardUrl
                        }
                    }
                },
                include: {
                    leader: true
                }
            });
            return team;
        });

        // Registration success response
        res.status(201).json({ message: 'Registration successful', teamId: result.id });
    } catch (error) {
        // Log the error for debugging
        console.error('Registration error:', error);

        // Handle duplicate key error from Prisma
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Group name, email, or IDs already exist' });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { groupName, password } = req.body;

        const team = await prisma.team.findUnique({
            where: { groupName }
        });

        if (!team) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, team.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: team.id, groupName: team.groupName, role: team.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            team: {
                id: team.id,
                groupName: team.groupName,
                role: team.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

module.exports = router;
