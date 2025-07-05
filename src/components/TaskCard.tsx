import React from 'react';
import { Edit3, Trash2, Brain } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  assignedTo: {
    _id: string;
    username: string;
    email: string;
  };
  lastModified: string;
}

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onSmartAssign: () => void;
  onDelete: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onSmartAssign, onDelete }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-medium text-gray-900">{task.title}</h4>
        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="Edit"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={onSmartAssign}
            className="p-1 text-gray-400 hover:text-purple-600"
            title="Smart Assign"
          >
            <Brain className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
      )}

      <div className="flex justify-between items-center">
        <span className={`px-2 py-1 text-xs rounded border ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        <span className="text-xs text-gray-500">@{task.assignedTo.username}</span>
      </div>
    </div>
  );
};

export default TaskCard;