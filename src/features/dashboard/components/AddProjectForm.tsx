"use client";

import { useState } from "react";
import FormInput from "@/shared/components/FormInput";


type RenderTask = {
  id: string;
  name: string;
  progress: number;
  project_id: string;
  status: 'queued' | 'rendering' | 'completed' | 'failed';
};

const AddProjectForm = ({
  onSubmit,
  onCancel
}: {
  onSubmit: ({ name, file }: { name: string, file: File }) => void;
  onCancel: () => void;
}) => {

  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !file) return;
    onSubmit({ name, file });
    setIsSubmitting(true);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="space-y-4">
        <div>
          {/* <label className="block text-sm font-medium text-gray-700 mb-1"> */}
          {/*   Project Name */}
          {/* </label> */}
          {/* <input */}
          {/*   type="text" */}
          {/*   value={name} */}
          {/*   onChange={(e) => setName(e.target.value)} */}
          {/*   className="w-full px-3 py-2 border border-gray-300 rounded-md" */}
          {/*   required */}
          {/* /> */}
          <FormInput label="Project Name" required minLength={5} type="text" placeholder="Enter your project name" id="project-name" />
        </div>
        <div>
          <FormInput label="Project description" required minLength={5} type="text" placeholder="A brief description of this project..." id="project-description" />
        </div>
        <div>
          {/* <label className="block text-sm font-medium text-gray-700 mb-1"> */}
          {/*   Project File */}
          {/* </label> */}
          {/* <input */}
          {/*   type="file" */}
          {/*   onChange={(e) => setFile(e.target.files?.[0] || null)} */}
          {/*   className="w-full px-3 py-2 border border-gray-300 rounded-md" */}
          {/*   required */}
          {/* /> */}
          <FormInput label="Project file" required type="file" placeholder="A brief description of this project..." id="project-file" />
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

export default AddProjectForm
