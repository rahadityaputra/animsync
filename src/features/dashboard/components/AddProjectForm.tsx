"use client";

import FormInput from "@/shared/components/FormInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddProjectFormValues, addProjectSchema } from "../lib/validationSchema";
import useProjectManagement from "@/features/project/hooks/useProjectManagement";

const AddProjectForm = ({ onCancel }: {
  onCancel: () => void;
}) => {

  const { addNewProject, loading, error } = useProjectManagement();

  const { register, formState: { errors: validationErrors }, handleSubmit } = useForm({
    resolver: zodResolver(addProjectSchema),
    defaultValues: {
      projectFile: undefined,
      projectDescription: "",
      projectName: ""
    }
  })

  const onSubmit = async (data: AddProjectFormValues) => {
    addNewProject(data)
    console.log(error);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="space-y-4">
        <div>
          <FormInput
            label="Project Name"
            type="text"
            placeholder="Enter your project name"
            id="project-name"
            {...register('projectName')}
            errorMessage={validationErrors.projectName?.message}
          />

        </div>
        <div>
          <FormInput
            label="Project description"
            type="text"
            placeholder="A brief description of this project..."
            id="project-description"
            errorMessage={validationErrors.projectName?.message}
            {...register('projectDescription')} />
        </div>
        <div>
          <FormInput
            label="Project file"
            required type="file"
            placeholder="A brief description of this project..."
            id="project-file"
            errorMessage={validationErrors.projectName?.message}
            {...register('projectFile')} />
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
            // disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {/* {isSubmitting ? 'Adding...' : 'Add to Queue'} */}
            Add
          </button>
        </div>
      </div>
    </form>
  );
}

export default AddProjectForm
