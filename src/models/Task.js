const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    timerDuration: {
      // duration in seconds set by the user
      type: Number,
      default: 0,
      min: [0, 'Timer duration cannot be negative'],
    },
    timerRemaining: {
      // remaining seconds (snapshot when paused/saved)
      type: Number,
      default: 0,
      min: [0, 'Timer remaining cannot be negative'],
    },
    timerActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual: isOverdue — useful if you add a dueDate later
taskSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

taskSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);
