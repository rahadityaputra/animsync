"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Project = {
  id: string;
  name: string;
  status: "pending" | "rendering" | "completed";
  file_url?: string;
  description?: string;
};

export default function ProjectList({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    file: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createClient();

  const navigateToProject = (projectId: string) => {
    router.push(`/projecttabs/${projectId}`);
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name || !newProject.file) return;

    setIsSubmitting(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("User not authenticated");

      const fileExt = newProject.file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `projects/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("3d-models")
        .upload(filePath, newProject.file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("3d-models").getPublicUrl(filePath);

      const { error } = await supabase
        .from("projects")
        .insert({
          name: newProject.name,
          description: newProject.description,
          file_url: publicUrl,
          status: "pending",
          user_id: user.id,
        })
        .select();

      if (error) throw error;

      window.location.reload();
    } catch (err) {
      console.error("Error creating project:", err);
      alert(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
      setShowAddForm(false);
    }
  };

  return (
    <section className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Projects</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? "Cancel" : "+ New Project"}
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAddProject}
          className="mb-8 p-6 bg-gray-50 rounded-lg border"
        >
          <div className="space-y-4">
            {/* Project Name Input */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                {" "}
                {/* Lebih tebal */}
                Project Name
              </label>
              <input
                type="text"
                value={newProject.name}
                onChange={(e) =>
                  setNewProject({ ...newProject, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md 
                  text-gray-900 font-medium focus:ring-2 focus:ring-blue-500"
                /* Tambahkan text-gray-900 dan font-medium */
                required
              />
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={newProject.description}
                onChange={(e) =>
                  setNewProject({ ...newProject, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md 
                  text-gray-900 font-medium focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            {/* File Input */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                3D Model File (.fbx, .obj, .gltf, etc.)
              </label>
              <input
                type="file"
                accept=".fbx,.obj,.gltf,.glb,.dae,.stl"
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    file: e.target.files?.[0] || null,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md
                  file:mr-4 file:py-2 file:px-4 file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100 text-gray-900"
                /* Tambahkan text-gray-900 */
                required
              />
            </div>

            {/* Buttons (tetap sama) */}
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-900 border border-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isSubmitting ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length > 0 ? (
          projects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigateToProject(project.id)}
              className="border rounded-lg p-5 hover:shadow-lg transition-shadow cursor-pointer bg-white"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg text-gray-800">
                  {project.name}
                </h3>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    project.status === "completed"
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
                  <span>3D Model Attached</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500 mb-4">No projects yet</div>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Your First Project
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
