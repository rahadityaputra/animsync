// components/projecttabs/SceneList.tsx
import type { Scene } from './types';

type SceneListProps = {
  scenes: Scene[];
  newSceneName: string;
  onSceneNameChange: (name: string) => void;
  onAddScene: () => void;
};

export function SceneList({ 
  scenes, 
  newSceneName, 
  onSceneNameChange, 
  onAddScene 
}: SceneListProps) {
  return (
    <div className="scene-section">
      <h2>Scenes</h2>
      <ul className="scene-list">
        {scenes.map(scene => (
          <li key={scene.id} className="scene-item">
            {scene.name}
          </li>
        ))}
      </ul>
      
      <div className="add-scene">
        <input
          type="text"
          value={newSceneName}
          onChange={(e) => onSceneNameChange(e.target.value)}
          placeholder="New scene name"
          className="scene-input"
        />
        <button onClick={onAddScene} className="add-button">
          + Add Scene
        </button>
      </div>
    </div>
  );
}