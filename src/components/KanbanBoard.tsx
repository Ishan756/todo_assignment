import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, Activity, LogOut, Brain } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import ActivityPanel from './ActivityPanel';
import ConflictModal from './ConflictModal';
import axios from 'axios';

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

interface User {
  _id: string;
  username: string;
  email: string;
}

const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showActivityPanel, setShowActivityPanel] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [conflictTask, setConflictTask] = useState<any>(null);
  const [newTaskStatus, setNewTaskStatus] = useState<'Todo' | 'In Progress' | 'Done'>('Todo');
  const { user, logout } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('task-created', (task) => setTasks(prev => [...prev, task]));
      socket.on('task-updated', (task) => setTasks(prev => prev.map(t => t._id === task._id ? task : t)));
      socket.on('task-deleted', (taskId) => setTasks(prev => prev.filter(t => t._id !== taskId)));
      
      return () => {
        socket.off('task-created');
        socket.off('task-updated');
        socket.off('task-deleted');
      };
    }
  }, [socket]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/auth/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const task = tasks.find(t => t._id === result.draggableId);
    if (!task) return;

    const newStatus = result.destination.droppableId as 'Todo' | 'In Progress' | 'Done';
    const updatedTask = { ...task, status: newStatus };

    setTasks(prev => prev.map(t => t._id === result.draggableId ? updatedTask : t));

    try {
      await axios.put(`http://localhost:3001/api/tasks/${result.draggableId}`, {
        status: newStatus,
        lastModified: task.lastModified
      });

      if (socket) {
        socket.emit('task-updated', { ...updatedTask, boardId: 'main' });
      }
    } catch (error: any) {
      setTasks(prev => prev.map(t => t._id === result.draggableId ? task : t));
      
      if (error.response?.status === 409) {
        setConflictTask({
          current: task,
          server: error.response.data.currentTask
        });
      }
    }
  };

  const handleSmartAssign = async (taskId: string) => {
    try {
      const response = await axios.post(`http://localhost:3001/api/tasks/${taskId}/smart-assign`);
      setTasks(prev => prev.map(t => t._id === taskId ? response.data : t));
      
      if (socket) {
        socket.emit('task-updated', { ...response.data, boardId: 'main' });
      }
    } catch (error) {
      console.error('Failed to smart assign task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await axios.delete(`http://localhost:3001/api/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      
      if (socket) {
        socket.emit('task-deleted', { taskId, boardId: 'main' });
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const openTaskModal = (status?: 'Todo' | 'In Progress' | 'Done') => {
    if (status) setNewTaskStatus(status);
    setShowTaskModal(true);
  };

  const columns = [
    { id: 'Todo', title: 'To Do', color: 'bg-red-100 border-red-200' },
    { id: 'In Progress', title: 'In Progress', color: 'bg-yellow-100 border-yellow-200' },
    { id: 'Done', title: 'Done', color: 'bg-green-100 border-green-200' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowActivityPanel(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Activity className="h-4 w-4" />
                <span>Activity</span>
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{user?.username}</span>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Add Task Button */}
        <div className="mb-6">
          <button
            onClick={() => openTaskModal()}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map(column => (
              <div key={column.id} className="flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg text-gray-800">{column.title}</h3>
                  <button
                    onClick={() => openTaskModal(column.id as 'Todo' | 'In Progress' | 'Done')}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`${column.color} border-2 border-dashed rounded-lg p-4 min-h-96 space-y-3`}
                    >
                      {getTasksByStatus(column.id).map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <TaskCard
                                task={task}
                                onEdit={(task) => {
                                  setEditingTask(task);
                                  setShowTaskModal(true);
                                }}
                                onSmartAssign={() => handleSmartAssign(task._id)}
                                onDelete={() => handleDeleteTask(task._id)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Modals */}
      {showTaskModal && (
        <TaskModal
          task={editingTask}
          users={users}
          initialStatus={editingTask?.status || newTaskStatus}
          onClose={() => {
            setShowTaskModal(false);
            setEditingTask(null);
          }}
          onSave={(task) => {
            if (editingTask) {
              setTasks(prev => prev.map(t => t._id === task._id ? task : t));
            } else {
              setTasks(prev => [...prev, task]);
            }
            setShowTaskModal(false);
            setEditingTask(null);
          }}
        />
      )}

      {showActivityPanel && (
        <ActivityPanel onClose={() => setShowActivityPanel(false)} />
      )}

      {conflictTask && (
        <ConflictModal
          conflict={conflictTask}
          onResolve={(resolution) => {
            if (resolution === 'merge') {
              setTasks(prev => prev.map(t => 
                t._id === conflictTask.current._id ? conflictTask.server : t
              ));
            }
            setConflictTask(null);
          }}
          onClose={() => setConflictTask(null)}
        />
      )}
    </div>
  );
};

export default KanbanBoard;