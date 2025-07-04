"use client";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Project = {
  id: string;
  name: string;
  state: "pending" | "rendering" | "completed"; // Diubah dari 'status' ke 'state'
  file_url?: string;
  description?: string;
  user_id?: string;
  created_at?: string; // Diubah dari 'created_id' ke 'created_at'
};

export default function ProjectList() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    file: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk mengambil data proyek
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const typedProjects = data.map((project: any) => ({
        id: project.id as string,
        name: project.name as string,
        state: project.state as "pending" | "rendering" | "completed",
        file_url: project.file_url as string | undefined,
        description: project.description as string | undefined,
        user_id: project.user_id as string | undefined,
        created_at: project.created_at as string | undefined,
      }));

      setProjects(typedProjects);
    } catch (err) {
      console.error("Error fetching projects:", err);
      if (err instanceof Error) {
        alert(`Error: ${err.message}`);
      } else {
        alert("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // Mengambil data proyek saat komponen dimount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchProjects();
      } catch (err) {
        if (err.message === "Failed to fetch") {
          alert("Network error. Please check your connection.");
        }
      }
    };
    fetchData();
  }, []);

  const navigateToProject = (projectId: string) => {
    router.push(`/projecttabs/${projectId}`);
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name || (!newProject.file && !editingProject)) return;

    setIsSubmitting(true);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("User not authenticated");

      let fileUrl = editingProject?.file_url;

      // Handle file upload jika ada file baru
      if (newProject.file) {
        const fileExt = newProject.file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `projects/${user.id}/${fileName}`; // Path dengan user ID

        const { error: uploadError } = await supabase.storage
          .from("3d-models")
          .upload(filePath, newProject.file, {
            contentType: getContentType(fileExt),
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload Error Details:", uploadError);
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // Dapatkan URL publik
        const {
          data: { publicUrl },
        } = supabase.storage.from("3d-models").getPublicUrl(filePath);

        fileUrl = publicUrl;
      }

      if (editingProject) {
        // Update proyek yang ada
        const { data, error } = await supabase
          .from("projects")
          .update({
            name: newProject.name,
            description: newProject.description,
            ...(fileUrl ? { file_url: fileUrl } : {}),
          })
          .eq("id", editingProject.id)
          .select()
          .single();

        if (error) throw error;
        if (!data) throw new Error("No data returned from update");

        setProjects(
          projects.map((p) =>
            p.id === editingProject.id
              ? {
                ...p,
                name: data.name,
                description: data.description,
                file_url: data.file_url,
                state: data.state,
              }
              : p
          )
        );
      } else {
        // Buat proyek baru
        const { data, error } = await supabase
          .from("projects")
          .insert({
            name: newProject.name,
            description: newProject.description,
            file_url: fileUrl,
            state: "pending",
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          const newProject: Project = {
            id: data.id as string,
            name: data.name as string,
            state: data.state as "pending" | "rendering" | "completed",
            description: data.description as string | undefined,
            file_url: data.file_url as string | undefined,
            user_id: data.user_id as string | undefined,
            created_at: data.created_at as string | undefined,
          };
          setProjects([newProject, ...projects]);
        }
      }

      resetForm();
    } catch (err) {
      console.error("Error:", err);
      alert(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus proyek ini?")) return;

    try {
      // Hapus file terkait jika ada
      const project = projects.find((p) => p.id === projectId);
      if (project?.file_url) {
        const filePath = project.file_url.split("/").slice(3).join("/");
        await supabase.storage.from("3d-models").remove([filePath]);
      }

      // Hapus proyek dari database
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) throw error;

      setProjects(projects.filter((p) => p.id !== projectId));
    } catch (err) {
      console.error("Error deleting project:", err);
      alert(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const startEditProject = (project: Project) => {
    setEditingProject(project);
    setNewProject({
      name: project.name,
      description: project.description || "",
      file: null,
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setNewProject({
      name: "",
      description: "",
      file: null,
    });
    setEditingProject(null);
    setShowAddForm(false);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getContentType = (ext?: string) => {
    switch (ext?.toLowerCase()) {
      case "gltf":
        return "model/gltf+json";
      case "glb":
        return "model/gltf-binary";
      case "fbx":
        return "application/octet-stream";
      case "obj":
        return "text/plain";
      default:
        return "application/octet-stream";
    }
  };

  if (loading) {
    return (
      <section className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Proyek Saya</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? "Batal" : "+ Proyek Baru"}
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAddProject}
          className="mb-8 p-6 bg-gray-50 rounded-lg border"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Nama Proyek
              </label>
              <input
                type="text"
                value={newProject.name}
                onChange={(e) =>
                  setNewProject({ ...newProject, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 font-medium focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Deskripsi (Opsional)
              </label>
              <textarea
                value={newProject.description}
                onChange={(e) =>
                  setNewProject({ ...newProject, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 font-medium focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                File Model 3D{" "}
                {editingProject &&
                  "(Kosongkan untuk mempertahankan file saat ini)"}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".fbx,.obj,.gltf,.glb,.dae,.stl"
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    file: e.target.files?.[0] || null,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-gray-900"
                required={!editingProject}
              />
            </div>

            {isUploading && (
              <div className="pt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Mengunggah: {uploadProgress}%
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-900 border border-gray-300 rounded-md"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isSubmitting
                  ? editingProject
                    ? "Menyimpan..."
                    : "Membuat..."
                  : editingProject
                    ? "Update Proyek"
                    : "Buat Proyek"}
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
              className="border rounded-lg p-5 hover:shadow-lg transition-shadow bg-white relative"
            >
              <div className="absolute top-3 right-3 flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditProject(project);
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
                    e.stopPropagation();
                    handleDeleteProject(project.id);
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
                onClick={() => navigateToProject(project.id)}
                className="cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {project.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${project.state === "completed"
                        ? "bg-green-100 text-green-800"
                        : project.state === "rendering"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                  >
                    {project.state}
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
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500 mb-4">Belum ada proyek</div>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Buat Proyek Pertama Anda
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
