const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../services/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/', [
  body('name').trim().notEmpty(),
  body('birthDate').isISO8601(),
  body('feedingIntervalMinutes').optional().isInt({ min: 30, max: 480 }),
  body('targetAmountMl').optional().isInt({ min: 10, max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, birthDate, feedingIntervalMinutes, targetAmountMl } = req.body;

    const baby = await prisma.baby.create({
      data: {
        name,
        birthDate: new Date(birthDate),
        feedingIntervalMinutes: feedingIntervalMinutes || 180,
        targetAmountMl: targetAmountMl || 120,
        users: {
          create: {
            userId: req.user.userId,
            role: 'parent'
          }
        }
      },
      include: { users: true }
    });

    res.status(201).json({ baby });
  } catch (error) {
    console.error('Create baby error:', error);
    res.status(500).json({ error: 'Failed to create baby profile' });
  }
});

router.get('/', async (req, res) => {
  try {
    const babies = await prisma.baby.findMany({
      where: {
        users: {
          some: { userId: req.user.userId }
        }
      },
      include: {
        users: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    res.json({ babies });
  } catch (error) {
    console.error('Get babies error:', error);
    res.status(500).json({ error: 'Failed to get babies' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const baby = await prisma.baby.findFirst({
      where: {
        id: req.params.id,
        users: { some: { userId: req.user.userId } }
      },
      include: {
        users: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    if (!baby) {
      return res.status(404).json({ error: 'Baby not found' });
    }

    res.json({ baby });
  } catch (error) {
    console.error('Get baby error:', error);
    res.status(500).json({ error: 'Failed to get baby' });
  }
});

router.put('/:id', [
  body('name').optional().trim().notEmpty(),
  body('feedingIntervalMinutes').optional().isInt({ min: 30, max: 480 }),
  body('targetAmountMl').optional().isInt({ min: 10, max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const babyAccess = await prisma.babyUser.findFirst({
      where: { babyId: req.params.id, userId: req.user.userId }
    });

    if (!babyAccess) {
      return res.status(404).json({ error: 'Baby not found' });
    }

    const { name, feedingIntervalMinutes, targetAmountMl } = req.body;

    const baby = await prisma.baby.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(feedingIntervalMinutes && { feedingIntervalMinutes }),
        ...(targetAmountMl && { targetAmountMl })
      }
    });

    res.json({ baby });
  } catch (error) {
    console.error('Update baby error:', error);
    res.status(500).json({ error: 'Failed to update baby' });
  }
});

router.post('/:id/share', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const babyAccess = await prisma.babyUser.findFirst({
      where: { babyId: req.params.id, userId: req.user.userId }
    });

    if (!babyAccess) {
      return res.status(404).json({ error: 'Baby not found' });
    }

    const { email } = req.body;

    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found with this email' });
    }

    const existingAccess = await prisma.babyUser.findFirst({
      where: { babyId: req.params.id, userId: targetUser.id }
    });

    if (existingAccess) {
      return res.status(400).json({ error: 'User already has access to this baby' });
    }

    await prisma.babyUser.create({
      data: {
        babyId: req.params.id,
        userId: targetUser.id,
        role: 'parent'
      }
    });

    res.json({ message: 'Baby shared successfully' });
  } catch (error) {
    console.error('Share baby error:', error);
    res.status(500).json({ error: 'Failed to share baby' });
  }
});

module.exports = router;
