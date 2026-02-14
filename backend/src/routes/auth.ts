import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username !== adminUsername || password !== adminPassword) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    res.json({
      token,
      admin: {
        username: adminUsername,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Admin login failed' });
  }
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, experienceYears, level, standardScore, department } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        email,
        experienceYears,
        level,
        standardScore,
        department
      }
    });
    
    // Generate JWT
    const token = jwt.sign({ userId: user.id, role: 'user' }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        experienceYears: user.experienceYears,
        level: user.level,
        standardScore: user.standardScore
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password, experienceYears, level, standardScore } = req.body;
    
    // Find user
    let user = await prisma.user.findUnique({ where: { username } });
    
    // If user doesn't exist, create with default password
    if (!user) {
      const passwordHash = await bcrypt.hash(password || 'default123', 10);
      user = await prisma.user.create({
        data: {
          username,
          passwordHash,
          experienceYears: experienceYears || 0,
          level: level || 1,
          standardScore: standardScore || 1
        }
      });
    } else {
      // Verify password if provided
      if (password) {
        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
      }
      
      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });
    }
    
    // Generate JWT
    const token = jwt.sign({ userId: user.id, role: 'user' }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        experienceYears: user.experienceYears,
        level: user.level,
        standardScore: user.standardScore
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
