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
    <div className="collaborator-section">
      <h3>Collaborators</h3>
      
      <ul className="collaborator-list">
        {collaborators.map(collab => (
          <li key={collab.id} className="collaborator-item">
            <span className={`status-dot ${collab.status}`}></span>
            {collab.name} ({collab.status})
          </li>
        ))}
      </ul>
      
      <div className="invite-collaborator">
        <input
          type="email"
          value={newCollaboratorEmail}
          onChange={(e) => onCollaboratorEmailChange(e.target.value)}
          placeholder="Enter email to invite"
          className="email-input"
        />
        <button onClick={onInvite} className="invite-button">
          + Invite User
        </button>
      </div>
    </div>
  );
}