import React, { useState, useEffect } from 'react';
import { X, Activity, Clock } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';

interface ActivityItem {
  _id: string;
  action: string;
  details: string;
  createdAt: string;
  userId: {
    _id: string;
    username: string;
    email: string;
  };
}

interface ActivityPanelProps {
  onClose: () => void;
}

const ActivityPanel: React.FC<ActivityPanelProps> = ({ onClose }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('activity-logged', (activity) => {
        setActivities(prev => [activity, ...prev.slice(0, 19)]);
      });

      return () => {
        socket.off('activity-logged');
      };
    }
  }, [socket]);

  const fetchActivities = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/activity');
      setActivities(response.data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-3">
            <Activity className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Activity Feed</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No activities yet</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {activities.map((activity) => (
                <div key={activity._id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {activity.userId.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{activity.userId.username}</span>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {activity.action}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">{activity.details}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formatTime(activity.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityPanel;