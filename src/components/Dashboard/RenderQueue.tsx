"use client";
import { useState } from "react";
import AddProjectForm from "./AddProjectForm";

interface BasicRenderTask {
  id: string;
  name: string;
  progress: number;
  status: 'queued' | 'rendering' | 'completed' | 'failed';
}

interface BasicProject {
  id: string;
  name: string;
  file_path: string;
  status: 'pending' | 'rendering' | 'completed';
}

interface RenderQueueProps {
  queue: BasicRenderTask[];
  onAddProject: (project: BasicProject, task: BasicRenderTask) => void;
  onCancelRender: (taskId: string) => void;
}

export default function RenderQueue({
  queue,
  onAddProject,
  onCancelRender
}: RenderQueueProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <section className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Render Queue</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? 'Hide Form' : 'Add Project'}
        </button>
      </div>

      {showAddForm && (
        <AddProjectForm 
          onSuccess={onAddProject}
          onCancel={() => {
            setShowAddForm(false);
          }}
        />
      )}

      <ul className="space-y-3 text-gray-700">
        {queue.length > 0 ? (
          queue.map((task) => (
            <li key={task.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center">
                <span className="font-medium">Rendering {task.name}</span>
                <button 
                  onClick={() => onCancelRender(task.id)}
                  className="text-red-600 text-sm hover:text-red-800 transition-colors"
                  aria-label={`Cancel rendering ${task.name}`}
                >
                  Cancel
                </button>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${task.progress}%` }}
                  aria-valuenow={task.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  {task.progress}% Complete
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  task.status === 'failed' ? 'bg-red-100 text-red-800' : 
                  task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                  'bg-blue-100 text-blue-800'
                }`}>
                  {task.status}
                </span>
              </div>
            </li>
          ))
        ) : (
          <li className="text-gray-500 py-4 text-center">
            No render tasks in queue
          </li>
        )}
      </ul>
    </section>
  );
}