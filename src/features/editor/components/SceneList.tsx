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
    <div className="space-y-4 text-gray-200">
      <div className="grid grid-cols-1 gap-2">
        {scenes.map((scene) => (
          <div key={scene.id} className="p-3 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500">
            <div className="flex justify-between">
              <span className="font-medium">{scene.name}</span>
              <button className="text-gray-400 hover:text-gray-200">
                ⋮
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newSceneName}
            onChange={(e) => onSceneNameChange(e.target.value)}
            placeholder="New scene name"
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-400"
          />
          <button 
            onClick={onAddScene}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}