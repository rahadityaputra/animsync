"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ModelEditor } from "../Editor/ModelEditor";
import { SceneList } from "./SceneList";
import { CommentSection } from "./CommentSection";
import { CollaboratorList } from "./CollaboratorList";
import { createClient } from "@/lib/supabase/server";

type Project = {
  id: string;
  name: string;
  status: "pending" | "rendering" | "completed";
  file_url?: string;
  description?: string;
  created_at?: string;
};

type Scene = {
  id: string;
  name: string;
};

type Collaborator = {
  id: string;
  name: string;
  email: string;
  status: "online" | "offline";
  avatar?: string;
};

export default function ProjectDetail({ project }: { project: Project }) {
  const [showProjectTabs, setShowProjectTabs] = useState(false);
  const [showToolsPanel, setShowToolsPanel] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  const [scenes, setScenes] = useState<Scene[]>(
    project.scenes || [
      { id: "1", name: "Scene 1" },
      { id: "2", name: "Scene 2" },
      { id: "3", name: "Scene 3" },
    ]
  );
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      }
    };
    checkAuth();
  }, [router, supabase]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>(
    project.collaborators || [
      { id: "1", name: "User 1", email: "user1@example.com", status: "online" },
      {
        id: "2",
        name: "User 2",
        email: "user2@example.com",
        status: "offline",
      },
    ]
  );

  const [newSceneName, setNewSceneName] = useState("");
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState("");
  const [comment, setComment] = useState("");
  const [activeTab, setActiveTab] = useState<
    "scenes" | "comments" | "collaborators"
  >("scenes");

  if (!project) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Project data is not available</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const addScene = () => {
    if (!newSceneName.trim()) return;
    setScenes([...scenes, { id: Date.now().toString(), name: newSceneName }]);
    setNewSceneName("");
  };

  const inviteCollaborator = () => {
    if (!newCollaboratorEmail.trim()) return;
    setCollaborators([
      ...collaborators,
      {
        id: Date.now().toString(),
        name: newCollaboratorEmail.split("@")[0],
        email: newCollaboratorEmail,
        status: "offline",
      },
    ]);
    setNewCollaboratorEmail("");
    alert(`Invitation sent to ${newCollaboratorEmail}`);
  };

  const addComment = () => {
    if (!comment.trim()) return;
    alert(`Comment added: ${comment}`);
    setComment("");
  };

  const startRender = () => {
    alert("Render process started!");
    router.push(`/projecttabs/${project.id}?status=rendering`);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 overflow-hidden">
      {" "}
      {/* Background gelap */}
      {/* Main Editor Area */}
      <div className="flex-1 relative bg-gray-800 w-full h-full">
        {" "}
        {/* Warna editor area lebih gelap */}
        <button
          onClick={() => router.push("/dashboard")} // Sesuaikan dengan route dashboard Anda
          className="absolute top-4 left-4 z-50 bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg shadow-lg transition-colors flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Kembali ke Dashboard
        </button>
        <ModelEditor modelUrl={project.file_url} />
        {/* Floating Toggle Button for Tools Panel (Left) */}
        <button
          onClick={() => setShowToolsPanel(!showToolsPanel)}
          className={`absolute top-1/2 left-0 z-50 bg-gray-700 hover:bg-gray-600 text-gray-200 p-2 rounded-r-lg shadow-lg transition-colors transform -translate-y-1/2 ${
            showToolsPanel ? "translate-x-0" : "translate-x-0"
          }`}
        >
          {showToolsPanel ? "◀" : "▶"}
        </button>
        {/* Floating Toggle Button for Project Tabs (Right) */}
        <button
          onClick={() => setShowProjectTabs(!showProjectTabs)}
          className={`absolute top-1/2 right-0 z-50 bg-gray-700 hover:bg-gray-600 text-gray-200 p-2 rounded-l-lg shadow-lg transition-colors transform -translate-y-1/2 ${
            showProjectTabs ? "translate-x-0" : "translate-x-0"
          }`}
        >
          {showProjectTabs ? "▶" : "◀"}
        </button>
      </div>
      {/* Tools Panel (Left Side) - Dark Theme */}
      <div
        className={`
        fixed top-0 left-0 h-full w-64 bg-gray-800 shadow-xl z-40
        transform transition-transform duration-300 ease-in-out
        ${showToolsPanel ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="p-4 h-full text-gray-200">
          {" "}
          {/* Text warna terang */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Editor Tools</h2>
            <button
              onClick={() => setShowToolsPanel(false)}
              className="text-gray-400 hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-gray-700 rounded-lg">
              <h3 className="font-medium">Transform Tools</h3>
              <div className="flex space-x-2 mt-2">
                <button className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-gray-200">
                  Move
                </button>
                <button className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-gray-200">
                  Rotate
                </button>
                <button className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-gray-200">
                  Scale
                </button>
              </div>
            </div>

            <div className="p-3 bg-gray-700 rounded-lg">
              <h3 className="font-medium">Objects</h3>
              <div className="mt-2 space-y-2">
                <button className="w-full p-2 bg-gray-600 hover:bg-gray-500 rounded text-left text-gray-200">
                  Add Cube
                </button>
                <button className="w-full p-2 bg-gray-600 hover:bg-gray-500 rounded text-left text-gray-200">
                  Add Sphere
                </button>
                <button className="w-full p-2 bg-gray-600 hover:bg-gray-500 rounded text-left text-gray-200">
                  Add Light
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Project Tabs Panel (Right Side) - Dark Theme */}
      <div
        className={`
        fixed top-0 right-0 h-full w-96 bg-gray-800 shadow-xl z-40
        transform transition-transform duration-300 ease-in-out
        ${showProjectTabs ? "translate-x-0" : "translate-x-full"}
      `}
      >
        <div className="p-4 h-full flex flex-col text-gray-200">
          {" "}
          {/* Text warna terang */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Project Tools</h2>
            <button
              onClick={() => setShowProjectTabs(false)}
              className="text-gray-400 hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          {/* Tabs Navigation - Dark Theme */}
          <div className="border-b border-gray-700 mb-4">
            {" "}
            {/* Border lebih gelap */}
            <nav className="flex space-x-4">
              <button
                className={`pb-2 px-1 font-medium text-sm border-b-2 ${
                  activeTab === "scenes"
                    ? "border-blue-400 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
                onClick={() => setActiveTab("scenes")}
              >
                Scenes
              </button>
              <button
                className={`pb-2 px-1 font-medium text-sm border-b-2 ${
                  activeTab === "comments"
                    ? "border-blue-400 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
                onClick={() => setActiveTab("comments")}
              >
                Comments
              </button>
              <button
                className={`pb-2 px-1 font-medium text-sm border-b-2 ${
                  activeTab === "collaborators"
                    ? "border-blue-400 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
                onClick={() => setActiveTab("collaborators")}
              >
                Collaborators
              </button>
            </nav>
          </div>
          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "scenes" && (
              <SceneList
                scenes={scenes}
                newSceneName={newSceneName}
                onSceneNameChange={setNewSceneName}
                onAddScene={addScene}
              />
            )}

            {activeTab === "comments" && (
              <CommentSection
                comment={comment}
                onCommentChange={setComment}
                onAddComment={addComment}
              />
            )}

            {activeTab === "collaborators" && (
              <CollaboratorList
                collaborators={collaborators}
                newCollaboratorEmail={newCollaboratorEmail}
                onCollaboratorEmailChange={setNewCollaboratorEmail}
                onInvite={inviteCollaborator}
              />
            )}
          </div>
          {/* Render Button - Dark Theme */}
          <div className="pt-4 border-t border-gray-700">
            {" "}
            {/* Border lebih gelap */}
            <button
              onClick={startRender}
              className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
            >
              START RENDER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
