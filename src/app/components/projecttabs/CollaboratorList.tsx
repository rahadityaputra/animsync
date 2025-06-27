import type { Collaborator } from './types';

type CollaboratorListProps = {
  collaborators: Collaborator[];
  newCollaboratorEmail: string;
  onCollaboratorEmailChange: (email: string) => void;
  onInvite: () => void;
};

export function CollaboratorList({
  collaborators,
  newCollaboratorEmail,
  onCollaboratorEmailChange,
  onInvite
}: CollaboratorListProps) {
  return (
    <div className="collaborator-section text-gray-200">
      <h3 className="text-lg font-semibold">Collaborators</h3>
      
      <ul className="collaborator-list mt-4 space-y-2">
        {collaborators.map(collab => (
          <li key={collab.id} className="collaborator-item p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center">
              <span className={`status-dot w-3 h-3 rounded-full mr-2 ${
                collab.status === "online" ? "bg-green-400" : "bg-gray-500"
              }`}></span>
              <span>
                {collab.name} <span className="text-gray-400">({collab.status})</span>
              </span>
            </div>
          </li>
        ))}
      </ul>
      
      <div className="invite-collaborator mt-4">
        <input
          type="email"
          value={newCollaboratorEmail}
          onChange={(e) => onCollaboratorEmailChange(e.target.value)}
          placeholder="Enter email to invite"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-400"
        />
        <button 
          onClick={onInvite} 
          className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg w-full"
        >
          + Invite User
        </button>
      </div>
    </div>
  );
}