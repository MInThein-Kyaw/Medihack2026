import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/nurses', authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        department: true,
        experienceYears: true,
        level: true,
        standardScore: true,
        createdAt: true,
        lastLogin: true,
        _count: {
          select: {
            sessions: true,
            results: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const resultAggregates = await prisma.assessmentResult.groupBy({
      by: ['userId'],
      _avg: {
        score: true,
        gap: true,
      },
      _max: {
        createdAt: true,
      },
      _count: {
        _all: true,
      },
    });

    const sessionStats = await prisma.assessmentSession.groupBy({
      by: ['userId', 'status'],
      _count: {
        _all: true,
      },
    });

    const resultByUser = new Map(resultAggregates.map((item) => [item.userId, item]));
    const sessionByUser = new Map<string, { total: number; completed: number }>();

    for (const item of sessionStats) {
      const current = sessionByUser.get(item.userId) || { total: 0, completed: 0 };
      current.total += item._count._all;
      if (item.status === 'completed') {
        current.completed += item._count._all;
      }
      sessionByUser.set(item.userId, current);
    }

    const nurses = users.map((user) => {
      const result = resultByUser.get(user.id);
      const sessions = sessionByUser.get(user.id) || { total: 0, completed: 0 };
      const completionRate = sessions.total > 0 ? (sessions.completed / sessions.total) * 100 : 0;

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        department: user.department,
        experienceYears: user.experienceYears,
        level: user.level,
        standardScore: user.standardScore,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        totalSessions: sessions.total,
        completedSessions: sessions.completed,
        completionRate: Number(completionRate.toFixed(1)),
        assessmentCount: result?._count._all || 0,
        averageScore: Number((result?._avg.score || 0).toFixed(2)),
        averageGap: Number((result?._avg.gap || 0).toFixed(2)),
        lastAssessedAt: result?._max.createdAt || null,
      };
    });

    const activeNurses = nurses.filter((nurse) => {
      if (!nurse.lastLogin) return false;
      const daysSinceLogin = (Date.now() - new Date(nurse.lastLogin).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLogin <= 30;
    }).length;

    res.json({
      summary: {
        totalNurses: nurses.length,
        activeNurses,
      },
      nurses,
    });
  } catch (error) {
    console.error('Admin nurses stats error:', error);
    res.status(500).json({ error: 'Failed to fetch nurse stats' });
  }
});

export default router;
