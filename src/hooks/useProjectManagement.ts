"use client"

import { useEffect, useState } from "react";
import router from "next/router";
import Project from "@/types/Project";
import { getContentType } from "@/lib/helper/helper";
import createClient from "@/features/auth/lib/supabase/client";

type NewProject = {
  name: string,
  description: string,
  file: File
}

const useProjectManagement = () => {

  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchUserProjects = async () => {
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
        status: project.state as "pending" | "rendering" | "completed",
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
  }


  useEffect(() => {
    fetchUserProjects();
  }, [])


  const addNewProject = async (newProject: NewProject) => {
    if (!newProject.name || (!newProject.file)) return;
    // if (!newProject.name || (!newProject.file && !editingProject)) return;

    // setIsSubmitting(true);
    // setIsUploading(true);
    // setUploadProgress(0);
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) throw new Error("User not authenticated");

      let fileUrl = editingProject?.file_url;

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

        const {
          data: { publicUrl },
        } = supabase.storage.from("3d-models").getPublicUrl(filePath);

        fileUrl = publicUrl;
      }

      if (editingProject) {

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

        const data__ = data as Project

        const projectsUpdated: Project[] | null = projects?.map((p) =>
          p.id === editingProject.id
            ? {
              ...p,
              name: data__.name,
              description: data__.description,
              file_url: data__.file_url,
              state: data__.status,
            }
            : p
        ) || null


        setProjects(projectsUpdated)

      } else {

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

        const { data: renderTask, error: renderError } = await supabase
          .from('render_tasks')
          .insert({
            name: data.name,
            user_id: user.id,
            project_id: data.id,
            progress: 0,
            status: 'queued'
          })
          .select()
          .single()

        if (renderError) throw renderError;


        if (data) {
          const newProject: Project = {
            id: data.id as string,
            name: data.name as string,
            status: data.state as "pending" | "rendering" | "completed",
            description: data.description as string | undefined,
            file_url: data.file_url as string | undefined,
            user_id: data.user_id as string | undefined,
            created_at: data.created_at as string | undefined,
          };

          setProjects((prevProjects): Project[] => {
            return [...prevProjects, newProject]
          });
        }
      }

      // resetForm();
    } catch (err) {
      console.error("Error:", err);
      alert(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      // setIsSubmitting(false);
      // setIsUploading(false);
    }


  }


  const getDetailProject = async (projectId: string): Promise<Project> => {
    try {

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/login");
        throw authError;
      }

      const { data: project, error: fetchError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single();

      if (fetchError) throw fetchError;
      if (!project) throw new Error("Project not found");

      const typedProject: Project = {
        id: project.id as string,
        name: project.name as string,
        status: project.state as "pending" | "rendering" | "completed",
        file_url: project.file_url as string | undefined,
        description: project.description as string | undefined,
        user_id: project.user_id as string | undefined,
        created_at: project.created_at as string | undefined,
      };

      return typedProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
      router.push("/dashboard");
      throw err
    } finally {
    }
  }


  const deleteProject = async (projectId: string) => {
    try {
      const project = projects.find((p) => p.id === projectId);
      if (project?.file_url) {
        const filePath = project.file_url.split("/").slice(3).join("/");
        await supabase.storage.from("3d-models").remove([filePath]);
      }

      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) throw error;

      setProjects(projects.filter((p) => p.id !== projectId));
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  }


  // useEffect(() => {
  //   const fetchData = async () => {
  //   };
  //
  //   fetchData();
  // }, [projectId, router, supabase]);

  return { projects, error, loading, addNewProject, getDetailProject, deleteProject };

}
export default useProjectManagement;
