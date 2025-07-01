// src/app/dashboard/components/AddProjectForm.tsx
"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Project = {
  id: string;
  name: string;
  user_id: string;
  file_path: string;
  status: 'pending' | 'rendering' | 'completed';
};

type RenderTask = {
  id: string;
  name: string;
  progress: number;
  project_id: string;
  status: 'queued' | 'rendering' | 'completed' | 'failed';
};

export default function AddProjectForm({
  onSuccess,
  onCancel
}: {
  onSuccess: (project: Project, task: RenderTask) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !file) return;

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `projects/${fileName}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name,
          user_id: user.id,
          file_path: filePath,
          status: 'pending'
        })
        .select()
        .single()
        .returns<Project>();

      if (projectError) throw projectError;

      // Create render task
      const { data: renderTask, error: renderError } = await supabase
        .from('render_tasks')
        .insert({
          name,
          user_id: user.id,
          project_id: project.id,
          progress: 0,
          status: 'queued'
        })
        .select()
        .single()
        .returns<RenderTask>();

      if (renderError) throw renderError;

      onSuccess(project, renderTask);
      setName('');
      setFile(null);

    } catch (error) {
      console.error('Error adding project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project File
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isSubmitting ? 'Adding...' : 'Add to Queue'}
          </button>
        </div>
      </div>
    </form>
  );
}