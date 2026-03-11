const express = require('express');
const { body, query, validationResult } = require('express-validator');
const prisma = require('../services/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/', [
  body('babyId').isUUID(),
  body('type').isIn(['BREASTFEEDING', 'FORMULA']),
  body('amountMl').optional().isInt({ min: 0, max: 500 }),
  body('notes').optional().trim(),
  body('time').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { babyId, type, amountMl, notes, time } = req.body;

    const babyAccess = await prisma.babyUser.findFirst({
      where: { babyId, userId: req.user.userId }
    });

    if (!babyAccess) {
      return res.status(404).json({ error: 'Baby not found' });
    }

    const feeding = await prisma.feeding.create({
      data: {
        babyId,
        recordedBy: req.user.userId,
        type,
        amountMl: amountMl || null,
        notes: notes || null,
        time: time ? new Date(time) : new Date()
      },
      include: {
        user: { select: { id: true, name: true } }
      }
    });

    res.status(201).json({ feeding });
  } catch (error) {
    console.error('Create feeding error:', error);
    res.status(500).json({ error: 'Failed to record feeding' });
  }
});

router.get('/', [
  query('babyId').isUUID(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { babyId, limit = 50, offset = 0 } = req.query;

    const babyAccess = await prisma.babyUser.findFirst({
      where: { babyId, userId: req.user.userId }
    });

    if (!babyAccess) {
      return res.status(404).json({ error: 'Baby not found' });
    }

    const feedings = await prisma.feeding.findMany({
      where: { babyId },
      orderBy: { time: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
      include: {
        user: { select: { id: true, name: true } }
      }
    });

    const total = await prisma.feeding.count({ where: { babyId } });

    res.json({ feedings, total });
  } catch (error) {
    console.error('Get feedings error:', error);
    res.status(500).json({ error: 'Failed to get feedings' });
  }
});

router.get('/last', [
  query('babyId').isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { babyId } = req.query;

    const babyAccess = await prisma.babyUser.findFirst({
      where: { babyId, userId: req.user.userId }
    });

    if (!babyAccess) {
      return res.status(404).json({ error: 'Baby not found' });
    }

    const lastFeeding = await prisma.feeding.findFirst({
      where: { babyId },
      orderBy: { time: 'desc' },
      include: {
        user: { select: { id: true, name: true } }
      }
    });

    const baby = await prisma.baby.findUnique({
      where: { id: babyId },
      select: { feedingIntervalMinutes: true, targetAmountMl: true }
    });

    let nextFeedingTime = null;
    if (lastFeeding) {
      nextFeedingTime = new Date(lastFeeding.time.getTime() + baby.feedingIntervalMinutes * 60 * 1000);
    }

    res.json({ lastFeeding, nextFeedingTime, settings: baby });
  } catch (error) {
    console.error('Get last feeding error:', error);
    res.status(500).json({ error: 'Failed to get last feeding' });
  }
});

router.get('/stats', [
  query('babyId').isUUID(),
  query('days').optional().isInt({ min: 1, max: 30 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { babyId, days = 7 } = req.query;

    const babyAccess = await prisma.babyUser.findFirst({
      where: { babyId, userId: req.user.userId }
    });

    if (!babyAccess) {
      return res.status(404).json({ error: 'Baby not found' });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const feedings = await prisma.feeding.findMany({
      where: {
        babyId,
        time: { gte: startDate }
      },
      orderBy: { time: 'asc' }
    });

    const totalFeedings = feedings.length;
    const totalAmount = feedings.reduce((sum, f) => sum + (f.amountMl || 0), 0);
    const avgAmount = totalFeedings > 0 ? Math.round(totalAmount / totalFeedings) : 0;
    
    const breastfeedings = feedings.filter(f => f.type === 'BREASTFEEDING').length;
    const formulaFeedings = feedings.filter(f => f.type === 'FORMULA').length;

    res.json({
      totalFeedings,
      totalAmount,
      avgAmount,
      breastfeedings,
      formulaFeedings,
      days: parseInt(days)
    });
  } catch (error) {
    console.error('Get feeding stats error:', error);
    res.status(500).json({ error: 'Failed to get feeding stats' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const feeding = await prisma.feeding.findUnique({
      where: { id: req.params.id },
      include: { baby: { include: { users: true } } }
    });

    if (!feeding) {
      return res.status(404).json({ error: 'Feeding not found' });
    }

    const hasAccess = feeding.baby.users.some(u => u.userId === req.user.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.feeding.delete({ where: { id: req.params.id } });

    res.json({ message: 'Feeding deleted' });
  } catch (error) {
    console.error('Delete feeding error:', error);
    res.status(500).json({ error: 'Failed to delete feeding' });
  }
});

module.exports = router;
