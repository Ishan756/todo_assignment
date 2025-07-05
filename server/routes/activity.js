import express from 'express';
import Activity from '../models/Activity.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const boardId = req.query.boardId || 'main';
    const activities = await Activity.find({ boardId })
      .populate('userId', 'username email avatar')
      .populate('taskId', 'title')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;