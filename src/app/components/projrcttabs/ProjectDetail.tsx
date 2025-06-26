"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ModelEditor } from "../Editor/ModelEditor";

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
  const [show3DEditor, setShow3DEditor] = useState(false);
  const router = useRouter();
  const [scenes, setScenes] = useState<Scene[]>(
    project.scenes || [
      { id: "1", name: "Scene 1" },
      { id: "2", name: "Scene 2" },
      { id: "3", name: "Scene 3" },
    ]
  );

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
    <div className="max-w-6xl  bg-gray-500 mx-auto px-4 py-8">
       {/* Add 3D Editor Toggle Button */}
      <div className="mb-4">
        <button
          onClick={() => setShow3DEditor(!show3DEditor)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          {show3DEditor ? "Hide 3D Editor" : "Show 3D Editor"}
        </button>
      </div>

      {show3DEditor ? (
      <ModelEditor />
      ) : (
        <>
      
      {/* Project Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            {project.name || "Untitled Project"}
          </h1>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                project.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : project.status === "rendering"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {project.status?.toUpperCase() || "UNKNOWN"}
            </span>
            {project.created_at && (
              <span className="text-sm text-gray-500">
                Created: {new Date(project.created_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Projects
        </button>
      </div>
      {/* Project Description */}
      {project.description && (
        <div className="bg-blue-50 p-4 rounded-lg mb-8">
          <h3 className="font-medium text-blue-800 mb-2">Description</h3>
          <p className="text-gray-700">{project.description}</p>
        </div>
      )}
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          <button
            className={`py-4 px-1 font-medium text-sm border-b-2 ${
              activeTab === "scenes"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("scenes")}
          >
            Scenes
          </button>
          <button
            className={`py-4 px-1 font-medium text-sm border-b-2 ${
              activeTab === "comments"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("comments")}
          >
            Comments
          </button>
          <button
            className={`py-4 px-1 font-medium text-sm border-b-2 ${
              activeTab === "collaborators"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("collaborators")}
          >
            Collaborators
          </button>
        </nav>
      </div>
      {/* Tab Content */}
      <div className="mb-8">
        {activeTab === "scenes" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scenes.map((scene) => (
                <div
                  key={scene.id}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900">{scene.name}</h3>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-4 h-40 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                    Scene Preview
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Add New Scene</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSceneName}
                  onChange={(e) => setNewSceneName(e.target.value)}
                  placeholder="Enter scene name"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={addScene}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Add Scene
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "comments" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-4">
                Project Feedback
              </h3>

              {/* Comment input */}
              <div className="mb-6">
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Add your comment
                </label>
                <div className="flex gap-2">
                  <input
                    id="comment"
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Type your feedback here..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={addComment}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Post
                  </button>
                </div>
              </div>

              {/* Comment list placeholder */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-gray-500 text-center py-8">
                  No comments yet. Be the first to share feedback!
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "collaborators" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {collaborators.map((collab) => (
                <div
                  key={collab.id}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4"
                >
                  <div
                    className={`relative ${
                      collab.status === "online"
                        ? "text-green-500"
                        : "text-gray-400"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {collab.name.charAt(0)}
                      </span>
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${
                        collab.status === "online"
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    ></span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{collab.name}</h3>
                    <p className="text-sm text-gray-500">{collab.email}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">
                Invite Collaborators
              </h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newCollaboratorEmail}
                  onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={inviteCollaborator}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                  </svg>
                  Invite
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Render Button */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={startRender}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg hover:from-blue-700 hover:to-blue-900 transition-colors font-medium flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>
          START RENDER
        </button>
      </div>
      </>
      )}
    </div>
  );
}
