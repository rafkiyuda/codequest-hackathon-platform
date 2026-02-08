const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only images and PDFs are allowed'));
    }
});

// Register Route
router.post('/register', upload.fields([
    { name: 'leaderCv', maxCount: 1 },
    { name: 'flazzCard', maxCount: 1 }
]), async (req, res) => {
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
            cvUrl: cvUrlBody,
            idCardUrl: idCardUrlBody
        } = req.body;

        // Basic validation
        if (!groupName || !password || !email) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Get file paths defensively
        const cvUrl = (req.files && req.files['leaderCv']) ? `/uploads/${req.files['leaderCv'][0].filename}` : (cvUrlBody || '');
        const idCardUrl = (req.files && req.files['flazzCard']) ? `/uploads/${req.files['flazzCard'][0].filename}` : (idCardUrlBody || '');

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create Team and Leader in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const team = await tx.team.create({
                data: {
                    groupName,
                    password: hashedPassword,
                    status: (status || '').toUpperCase() === 'BINUSIAN' ? 'BINUSIAN' : 'NON_BINUSIAN',
                    role: 'USER',
                    leader: {
                        create: {
                            fullName: fullName || '',
                            email: email || '',
                            whatsappNumber: whatsappNumber || '',
                            lineId: lineId || '',
                            githubId: githubId || '',
                            birthPlace: birthPlace || '',
                            birthDate: birthDate ? new Date(birthDate) : new Date(),
                            cvUrl: cvUrl || '',
                            idCardUrl: idCardUrl || ''
                        }
                    }
                },
                include: {
                    leader: true
                }
            });
            return team;
        });

        res.status(201).json({ message: 'Registration successful', teamId: result.id });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Group name, email, or IDs already exist' });
        }
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { groupName, password } = req.body;

        if (!groupName || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

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
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
});

module.exports = router;

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
