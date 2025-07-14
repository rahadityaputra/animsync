// src/app/dashboard/components/RenderHistory.tsx
"use client";

type Project = {
  id: string;
  name: string;
};

export default function RenderHistory({
  projects,
  onDownload
}: {
  projects: Project[];
  onDownload: (projectId: string) => void;
}) {
  return (
    <section className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Render History</h2>
      <ul className="space-y-3 text-gray-700">
        {projects.length > 0 ? (
          projects.map((project) => (
            <li key={project.id} className="p-3 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span>{project.name}</span>
                <div className="space-x-2">
                  <span className="text-green-600 text-sm">Completed</span>
                  <button 
                    onClick={() => onDownload(project.id)}
                    className="text-blue-600 text-sm hover:text-blue-800"
                  >
                    Download
                  </button>
                </div>
              </div>
            </li>
          ))
        ) : (
          <li className="text-gray-500">No completed renders</li>
        )}
      </ul>
    </section>
  );
}