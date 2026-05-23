const Task = require('../models/Task');

// ─── helpers ───────────────────────────────────────────────────────────────

const buildFilter = (query) => {
  const filter = {};

  // filter by completion status  ?completed=true|false
  if (query.completed !== undefined) {
    filter.completed = query.completed === 'true';
  }

  // filter by category  ?category=<id>
  if (query.category) {
    filter.category = query.category;
  }

  // live search by title  ?search=<text>
  if (query.search && query.search.trim()) {
    filter.title = { $regex: query.search.trim(), $options: 'i' };
  }

  return filter;
};

// ─── GET /api/tasks ─────────────────────────────────────────────────────────
const getAllTasks = async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const tasks = await Task.find(filter).populate('category', 'name color').sort({ createdAt: -1 });

    // counters  (Tier 2 — Task Counter)
    const total = await Task.countDocuments();
    const completed = await Task.countDocuments({ completed: true });
    const pending = total - completed;

    res.status(200).json({
      success: true,
      count: tasks.length,
      stats: { total, completed, pending },
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/tasks/:id ──────────────────────────────────────────────────────
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('category', 'name color');
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── POST /api/tasks ─────────────────────────────────────────────────────────
const createTask = async (req, res) => {
  try {
    const { title, description, category, timerDuration } = req.body;
    const task = await Task.create({
      title,
      description,
      category: category || null,
      timerDuration: timerDuration || 0,
      timerRemaining: timerDuration || 0,
    });

    const populated = await task.populate('category', 'name color');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/tasks/:id ───────────────────────────────────────────────────────
const updateTask = async (req, res) => {
  try {
    const { title, description, category, timerDuration, timerRemaining, timerActive } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category || null;
    if (timerDuration !== undefined) updates.timerDuration = timerDuration;
    if (timerRemaining !== undefined) updates.timerRemaining = timerRemaining;
    if (timerActive !== undefined) updates.timerActive = timerActive;

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('category', 'name color');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── PATCH /api/tasks/:id/toggle ─────────────────────────────────────────────
// Tier 1 — Complete Task toggle
const toggleTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    task.completed = !task.completed;
    await task.save();
    await task.populate('category', 'name color');
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── PATCH /api/tasks/:id/timer ──────────────────────────────────────────────
// Tier 3 — Start / Pause / Reset timer state
const updateTimer = async (req, res) => {
  try {
    const { action, timerDuration } = req.body;
    // action: "start" | "pause" | "reset"

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    switch (action) {
      case 'start':
        task.timerActive = true;
        break;
      case 'pause':
        task.timerActive = false;
        if (req.body.timerRemaining !== undefined) {
          task.timerRemaining = req.body.timerRemaining;
        }
        break;
      case 'reset':
        task.timerActive = false;
        task.timerRemaining = timerDuration !== undefined ? timerDuration : task.timerDuration;
        if (timerDuration !== undefined) task.timerDuration = timerDuration;
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid action. Use start | pause | reset' });
    }

    await task.save();
    await task.populate('category', 'name color');
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────────
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── DELETE /api/tasks  (bulk delete completed) ───────────────────────────────
const deleteCompletedTasks = async (req, res) => {
  try {
    const result = await Task.deleteMany({ completed: true });
    res.status(200).json({
      success: true,
      message: `${result.deletedCount} completed task(s) deleted`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/tasks/stats ─────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const total = await Task.countDocuments();
    const completed = await Task.countDocuments({ completed: true });
    const pending = total - completed;
    const activeTimers = await Task.countDocuments({ timerActive: true });

    // per-category breakdown
    const byCategory = await Task.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, completed: { $sum: { $cond: ['$completed', 1, 0] } } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'categoryInfo' } },
      { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          category: { $ifNull: ['$categoryInfo.name', 'Uncategorized'] },
          color: { $ifNull: ['$categoryInfo.color', '#6c757d'] },
          count: 1,
          completed: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: { total, completed, pending, activeTimers, byCategory },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  toggleTask,
  updateTimer,
  deleteTask,
  deleteCompletedTasks,
  getStats,
};
