const express = require('express');
const router = express.Router();
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  toggleTask,
  updateTimer,
  deleteTask,
  deleteCompletedTasks,
  getStats,
} = require('../controllers/taskController');

// Stats
router.get('/stats', getStats);

// Core CRUD
router.route('/').get(getAllTasks).post(createTask).delete(deleteCompletedTasks);

router.route('/:id').get(getTaskById).put(updateTask).delete(deleteTask);

// Toggle complete
router.patch('/:id/toggle', toggleTask);

// Timer controls
router.patch('/:id/timer', updateTimer);

module.exports = router;
