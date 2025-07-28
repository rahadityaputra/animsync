"use client";

import { useState, useRef } from "react";
import useProjectManagement from "@/features/project/hooks/useProjectManagement";
import AddProjectForm from "./AddProjectForm";
import ProjectCard from "./ProjectCard";

const ProjectList = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const { projects, error, loading, addNewProject } = useProjectManagement();



  const handleAddProject = async ({ name, file }: { name: string, file: File }) => {
    addNewProject({ name, file });

  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus proyek ini?")) return;

  };

  // const startEditProject = (project: Project) => {
  //   setEditingProject(project);
  //   setNewProject({
  //     name: project.name,
  //     description: project.description || "",
  //     file: null,
  //   });
  //   setShowAddForm(true);
  // };
  const handleSubmitAddProjectForm = ({ name, file }: { name: string, file: File }) => {

  }

  const resetForm = () => {
    // setNewProject({
    //   name: "",
    //   description: "",
    //   file: null,
    // });
    // setEditingProject(null);
    setShowAddForm(false);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
        <h2 className="text-2xl font-bold text-gray-900">My Projects</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? "Batal" : "+ Proyek Baru"}
        </button>
      </div>

      {showAddForm && (
        <AddProjectForm onCancel={() => { }} onSubmit={handleAddProject} />)}

      <div className="grid grid-cols-1 gap-6">
        {projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard project={project} key={project.id} />
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

export default ProjectList;
