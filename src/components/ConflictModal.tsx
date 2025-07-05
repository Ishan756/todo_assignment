import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConflictModalProps {
  conflict: {
    current: any;
    server: any;
  };
  onResolve: (resolution: 'merge' | 'overwrite' | 'cancel') => void;
  onClose: () => void;
}

const ConflictModal: React.FC<ConflictModalProps> = ({ conflict, onResolve, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <h2 className="text-xl font-semibold">Conflict Detected</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Someone else modified this task while you were editing. Choose how to resolve:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Your Version */}
            <div className="border border-red-200 rounded-lg">
              <div className="bg-red-50 p-4 border-b">
                <h3 className="font-semibold text-red-800">Your Version</h3>
              </div>
              <div className="p-4 space-y-2">
                <div><strong>Title:</strong> {conflict.current.title}</div>
                <div><strong>Description:</strong> {conflict.current.description || 'None'}</div>
                <div><strong>Status:</strong> {conflict.current.status}</div>
                <div><strong>Priority:</strong> {conflict.current.priority}</div>
                <div><strong>Assigned:</strong> {conflict.current.assignedTo?.username}</div>
              </div>
            </div>

            {/* Server Version */}
            <div className="border border-green-200 rounded-lg">
              <div className="bg-green-50 p-4 border-b">
                <h3 className="font-semibold text-green-800">Server Version</h3>
              </div>
              <div className="p-4 space-y-2">
                <div><strong>Title:</strong> {conflict.server.title}</div>
                <div><strong>Description:</strong> {conflict.server.description || 'None'}</div>
                <div><strong>Status:</strong> {conflict.server.status}</div>
                <div><strong>Priority:</strong> {conflict.server.priority}</div>
                <div><strong>Assigned:</strong> {conflict.server.assignedTo?.username}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => onResolve('cancel')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onResolve('merge')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Use Server Version
            </button>
            <button
              onClick={() => onResolve('overwrite')}
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
            >
              Keep My Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConflictModal;