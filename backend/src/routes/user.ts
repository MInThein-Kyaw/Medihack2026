import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router: Router = Router();
const prisma = new PrismaClient();

// Get user profile
router.get('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: {
        id: true,
        username: true,
        email: true,
        experienceYears: true,
        level: true,
        standardScore: true,
        department: true,
        createdAt: true,
        lastLogin: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Get user progress
router.get('/progress', authenticate, async (req: AuthRequest, res) => {
  try {
    const progress = await prisma.progressTracking.findMany({
      where: { userId: req.userId! },
      orderBy: { lastAssessedAt: 'desc' }
    });
    
    res.json(progress);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

// Get assessment history
router.get('/history', authenticate, async (req: AuthRequest, res) => {
  try {
    const sessions = await prisma.assessmentSession.findMany({
      where: { userId: req.userId! },
      include: {
        results: {
          include: {
            idpPlan: true
          }
        }
      },
      orderBy: { startedAt: 'desc' },
      take: 10
    });
    
    res.json(sessions);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

export default router;
