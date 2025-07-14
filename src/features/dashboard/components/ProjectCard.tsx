"use client"
import Project from "@/types/Project";
import { useRouter } from "next/navigation";


type ProjectCardProps = {
  project: Project
}


const ProjectCard = ({ project }: ProjectCardProps) => {
  const router = useRouter();

  const navigateToProject = (projectId: string) => {
    console.log(projectId);
    router.push(`/project/${projectId}`);
  };

  return (
    <div
      className="border rounded-lg p-5 hover:shadow-lg transition-shadow bg-white relative"
      onClick={(e) => {
        e.stopPropagation();
        navigateToProject(project.id)
      }}
    >
      <div className="absolute top-3 right-3 flex space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            // startEditProject(project);
          }}
          className="p-1 text-gray-500 hover:text-blue-600"
          title="Edit"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            // e.stopPropagation();
            // handleDeleteProject(project.id);
          }}
          className="p-1 text-gray-500 hover:text-red-600"
          title="Hapus"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div
        onClick={(e) => {
          // e.preventDefault
          // navigateToProject(project.id)
        }}
        className="cursor-pointer"
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg text-gray-800">
            {project.name}
          </h3>
          <span
            className={`px-2 py-1 text-xs rounded-full ${project.status === "completed"
              ? "bg-green-100 text-green-800"
              : project.status === "rendering"
                ? "bg-blue-100 text-blue-800"
                : "bg-yellow-100 text-yellow-800"
              }`}
          >
            {project.status}
          </span>
        </div>

        {project.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {project.description}
          </p>
        )}

        {project.file_url && (
          <div className="text-xs text-blue-600 flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>File Model 3D Tersedia</span>
          </div>
        )}

        {project.created_at && (
          <div className="text-xs text-gray-500 mt-2">
            Dibuat: {new Date(project.created_at).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectCard;
