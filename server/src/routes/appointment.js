const express = require('express');
const { body, query, validationResult } = require('express-validator');
const prisma = require('../services/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/', [
  body('babyId').isUUID(),
  body('title').trim().notEmpty(),
  body('datetime').isISO8601(),
  body('location').optional().trim(),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { babyId, title, datetime, location, notes } = req.body;

    const babyAccess = await prisma.babyUser.findFirst({
      where: { babyId, userId: req.user.userId }
    });

    if (!babyAccess) {
      return res.status(404).json({ error: 'Baby not found' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        babyId,
        title,
        datetime: new Date(datetime),
        location: location || null,
        notes: notes || null
      }
    });

    res.status(201).json({ appointment });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

router.get('/', [
  query('babyId').isUUID(),
  query('upcoming').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { babyId, upcoming } = req.query;

    const babyAccess = await prisma.babyUser.findFirst({
      where: { babyId, userId: req.user.userId }
    });

    if (!babyAccess) {
      return res.status(404).json({ error: 'Baby not found' });
    }

    const whereClause = { babyId };
    if (upcoming === 'true') {
      whereClause.datetime = { gte: new Date() };
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      orderBy: { datetime: 'asc' }
    });

    res.json({ appointments });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to get appointments' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: { baby: { include: { users: true } } }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const hasAccess = appointment.baby.users.some(u => u.userId === req.user.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ appointment });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: 'Failed to get appointment' });
  }
});

router.put('/:id', [
  body('title').optional().trim().notEmpty(),
  body('datetime').optional().isISO8601(),
  body('location').optional().trim(),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: { baby: { include: { users: true } } }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const hasAccess = appointment.baby.users.some(u => u.userId === req.user.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { title, datetime, location, notes } = req.body;

    const updatedAppointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(datetime !== undefined && { datetime: new Date(datetime) }),
        ...(location !== undefined && { location }),
        ...(notes !== undefined && { notes })
      }
    });

    res.json({ appointment: updatedAppointment });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: { baby: { include: { users: true } } }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const hasAccess = appointment.baby.users.some(u => u.userId === req.user.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.appointment.delete({ where: { id: req.params.id } });

    res.json({ message: 'Appointment deleted' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

module.exports = router;
