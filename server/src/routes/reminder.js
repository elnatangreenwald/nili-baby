const express = require('express');
const { body, query, validationResult } = require('express-validator');
const prisma = require('../services/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/', [
  body('babyId').isUUID(),
  body('title').trim().notEmpty(),
  body('dailyTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { babyId, title, dailyTime } = req.body;

    const babyAccess = await prisma.babyUser.findFirst({
      where: { babyId, userId: req.user.userId }
    });

    if (!babyAccess) {
      return res.status(404).json({ error: 'Baby not found' });
    }

    const reminder = await prisma.reminder.create({
      data: { babyId, title, dailyTime }
    });

    res.status(201).json({ reminder });
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

router.get('/', [
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

    const reminders = await prisma.reminder.findMany({
      where: { babyId },
      orderBy: { dailyTime: 'asc' }
    });

    res.json({ reminders });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ error: 'Failed to get reminders' });
  }
});

router.put('/:id', [
  body('title').optional().trim().notEmpty(),
  body('dailyTime').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reminder = await prisma.reminder.findUnique({
      where: { id: req.params.id },
      include: { baby: { include: { users: true } } }
    });

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    const hasAccess = reminder.baby.users.some(u => u.userId === req.user.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { title, dailyTime, isActive } = req.body;

    const updatedReminder = await prisma.reminder.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(dailyTime !== undefined && { dailyTime }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json({ reminder: updatedReminder });
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const reminder = await prisma.reminder.findUnique({
      where: { id: req.params.id },
      include: { baby: { include: { users: true } } }
    });

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    const hasAccess = reminder.baby.users.some(u => u.userId === req.user.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.reminder.delete({ where: { id: req.params.id } });

    res.json({ message: 'Reminder deleted' });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});

module.exports = router;
