import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['created', 'updated', 'deleted', 'moved', 'assigned', 'reassigned']
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  boardId: {
    type: String,
    required: true,
    default: 'main'
  },
  details: {
    type: String,
    required: true
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

activitySchema.index({ boardId: 1, createdAt: -1 });

export default mongoose.model('Activity', activitySchema);