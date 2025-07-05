import express from 'express';
import Task from '../models/Task.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import { io } from '../index.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const boardId = req.query.boardId || 'main';
    const tasks = await Task.find({ boardId })
      .populate('assignedTo', 'username email avatar')
      .populate('modifiedBy', 'username email avatar')
      .sort({ order: 1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, priority, assignedTo, boardId = 'main' } = req.body;
    
    const existingTask = await Task.findOne({ boardId, title });
    if (existingTask) {
      return res.status(400).json({ error: 'Task title must be unique' });
    }

    const columnNames = ['Todo', 'In Progress', 'Done'];
    if (columnNames.includes(title)) {
      return res.status(400).json({ error: 'Task title cannot match column names' });
    }

    const maxOrder = await Task.findOne({ boardId, status: 'Todo' })
      .sort({ order: -1 })
      .select('order');
    
    const task = new Task({
      title,
      description,
      priority,
      assignedTo,
      boardId,
      order: (maxOrder?.order || 0) + 1,
      modifiedBy: req.user._id
    });

    await task.save();
    await task.populate('assignedTo', 'username email avatar');
    await task.populate('modifiedBy', 'username email avatar');

    const activity = new Activity({
      action: 'created',
      taskId: task._id,
      userId: req.user._id,
      boardId,
      details: `Created task "${title}"`
    });
    await activity.save();

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const boardId = req.query.boardId || 'main';

    
    const currentTask = await Task.findById(id);
    if (!currentTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const lastModified = new Date(req.body.lastModified);
    if (currentTask.lastModified > lastModified) {
      return res.status(409).json({ 
        error: 'Conflict detected',
        currentTask: await Task.findById(id)
          .populate('assignedTo', 'username email avatar')
          .populate('modifiedBy', 'username email avatar')
      });
    }

    
    if (updates.title && updates.title !== currentTask.title) {
      const existingTask = await Task.findOne({ 
        boardId, 
        title: updates.title,
        _id: { $ne: id }
      });
      if (existingTask) {
        return res.status(400).json({ error: 'Task title must be unique' });
      }

      const columnNames = ['Todo', 'In Progress', 'Done'];
      if (columnNames.includes(updates.title)) {
        return res.status(400).json({ error: 'Task title cannot match column names' });
      }
    }

    const task = await Task.findByIdAndUpdate(
      id,
      { 
        ...updates, 
        lastModified: new Date(),
        modifiedBy: req.user._id 
      },
      { new: true }
    ).populate('assignedTo', 'username email avatar')
     .populate('modifiedBy', 'username email avatar');

    
    const activity = new Activity({
      action: 'updated',
      taskId: task._id,
      userId: req.user._id,
      boardId,
      details: `Updated task "${task.title}"`
    });
    await activity.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const boardId = req.query.boardId || 'main';

    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const activity = new Activity({
      action: 'deleted',
      taskId: task._id,
      userId: req.user._id,
      boardId,
      details: `Deleted task "${task.title}"`
    });
    await activity.save();

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/smart-assign', async (req, res) => {
  try {
    const { id } = req.params;
    const boardId = req.query.boardId || 'main';

    const users = await User.find({}, '_id username email avatar');
    const userTaskCounts = await Promise.all(
      users.map(async (user) => {
        const count = await Task.countDocuments({
          assignedTo: user._id,
          boardId,
          status: { $in: ['Todo', 'In Progress'] }
        });
        return { user, count };
      })
    );

    const userWithFewestTasks = userTaskCounts.reduce((min, current) => 
      current.count < min.count ? current : min
    );

    const task = await Task.findByIdAndUpdate(
      id,
      { 
        assignedTo: userWithFewestTasks.user._id,
        lastModified: new Date(),
        modifiedBy: req.user._id 
      },
      { new: true }
    ).populate('assignedTo', 'username email avatar')
     .populate('modifiedBy', 'username email avatar');

    const activity = new Activity({
      action: 'assigned',
      taskId: task._id,
      userId: req.user._id,
      boardId,
      details: `Smart assigned task "${task.title}" to ${userWithFewestTasks.user.username}`
    });
    await activity.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;