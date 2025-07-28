"use client";

import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import loadModelFile from "../lib/helper/helperEditor";
import centerAndScaleModel from "../lib/centerAndScaleModel";
import convertToGLB from "../lib/convertToGLB";
import useSetupEditor from "../hooks/useSetupEditor";
import useLoadModel from "../hooks/useLoadModel";
import useRayCaster from "../hooks/useRayCaster";
import useOutline from "../hooks/useOutline";
import { RGBELoader } from "three/examples/jsm/Addons.js";

type ModelEditorProps = {
  modelUrl: string | undefined;
  onModelImport?: (file: File) => void;
};

export function ModelEditor({ modelUrl, onModelImport }: ModelEditorProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'translate' | 'rotate' | 'scale' | null>(null);
  const [showWireframe, setShowWireframe] = useState<boolean>(false);
  const [showHelpers, setShowHelpers] = useState<boolean>(true);
  const [availableSkins, setAvailableSkins] = useState<string[]>([]);
  console.log(mountRef);

  const { scene, camera, renderer, orbitControls, transformControls } = useSetupEditor({ mountRef, showHelpers });
  const { loading, currentModel, setCurrentModel, setCurrentModelNull, materialType, materialColor, metalness, updateMaterialSettings, loadAvailableSkins, roughness, envMapIntensity, currentSkin } = useLoadModel({ modelUrl, scene })

  const { raycaster, getObjectsIntersected, mouse, setMousePosition, setRaycasterFromCamera} = useRayCaster();

  // const {} = useOutline(renderer, camera, scene, new THREE.Vector2(window.innerWidth, window.innerHeight));


  useEffect(() => {
    if (!mountRef.current || !renderer || !camera) return;

    mountRef.current.appendChild(renderer.domElement);
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
      orbitControls?.update();
    });

    // Load environment map
    const rgbeLoader = new RGBELoader();
    rgbeLoader.load('/hdr/royal_esplanade_1k.hdr', (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      scene.background = texture;
    });

    return () => {
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [mountRef, renderer, camera, scene]);

  useEffect(() => {
    if (!transformControls || !currentModel) return;

    if (editMode) {
      transformControls.setMode(editMode);
      transformControls.attach(currentModel);
    } else {
      transformControls.detach();
    }
  }, [editMode]);

  mountRef.current?.addEventListener('pointermove', (event) => {
    setMousePosition(event.clientX, event.clientY);
    // console.log("Mouse position set:", mouse);
    if (orbitControls) {
      orbitControls.enabled = !editMode;
    }
  });

mountRef.current?.addEventListener('pointerdown', (event) => {
    setMousePosition(event.clientX, event.clientY);
    if (orbitControls) {
      orbitControls.enabled = !editMode;
    }
    if (!camera || !scene) return;
    
    setRaycasterFromCamera(camera);
    
    const intersects = getObjectsIntersected(scene.children);
    if (intersects.length > 0) {
      console.log("Intersected objects:", intersects);
      const intersectedObject = intersects[0].object;
      console.log("First intersected object:", intersectedObject);
      if (editMode) {
        transformControls?.attach(intersectedObject);
      }
      
      intersectedObject.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material.wireframe = showWireframe;
          child.material.needsUpdate = true;
          child.material.transparent = true;
          child.material.color.set("#ffffff"); // Set to white for visibility
          child.material.metalness = metalness;
          child.material.opacity = 0.8; // Adjust opacity as needed
        }
      })
    }
  });


  useEffect(() => {
    scene.children.forEach(child => {
      if (child instanceof THREE.GridHelper || child instanceof THREE.AxesHelper) {
        child.visible = showHelpers;
      }
    });
  }, [showHelpers]);

  useEffect(() => {
    const handleResize = () => {
      console.log(mountRef);

      if (!mountRef.current || !renderer || !camera) return;

      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight
      );
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // setLoading(true);
      // setError(null);

      if (currentModel) {
        scene.remove(currentModel);
        setCurrentModelNull();
      }

      let modelBlob: Blob;
      const fileExt = file.name.split('.').pop()?.toLowerCase();

      if (fileExt !== 'glb' && fileExt !== 'gltf') {
        setConverting(true);
        try {
          modelBlob = await convertToGLB(file);
        } finally {
          setConverting(false);
        }
      } else {
        modelBlob = file;
      }

      const objectUrl = URL.createObjectURL(modelBlob);
      const model = await loadModelFile(objectUrl);
      URL.revokeObjectURL(objectUrl);

      centerAndScaleModel(model);

      scene.add(model);
      setCurrentModel(model)

      updateMaterialSettings();
      loadAvailableSkins(model);

      if (onModelImport) {
        const convertedFile = new File([modelBlob], `${file.name.split('.')[0]}.glb`, {
          type: 'model/gltf-binary'
        });
        onModelImport(convertedFile);
      }

    } catch (err) {
      console.error("Error importing model:", err);
      setError(`Failed to import model: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
    }
  };

  const exportModel = () => {
    if (!currentModel) return;

    const exporter = new GLTFExporter();
    exporter.parse(
      currentModel,
      (gltf) => {
        const blob = new Blob([JSON.stringify(gltf)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'edited-model.gltf';
        link.click();
      },
      (error) => {
        console.error('Export error:', error);
        setError('Failed to export model');
      },
      {
        binary: false,
        trs: false,
        onlyVisible: true,
        truncateDrawRange: true
      }
    );
  };

  return (
    <div className="relative h-full w-full bg-gray-800">
      <div ref={mountRef} className="h-full w-full" />

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        accept=".gltf,.glb,.fbx,.obj,.dae,.stl,.ply,.3ds"
        className="hidden"
      />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="text-white text-lg">Loading model...</div>
        </div>
      )}

      {converting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="text-white text-lg">
            Converting to GLB format...
            <div className="text-sm mt-1">This may take a while for large files</div>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute bottom-4 left-4 bg-red-500 text-white p-3 rounded-lg max-w-md z-50">
          <div className="font-bold mb-1">Error</div>
          <div className="text-sm">{error}</div>
          {modelUrl && (
            <div className="text-xs mt-2 opacity-75">URL: {modelUrl}</div>
          )}
        </div>
      )}

      <div className="absolute top-4 right-4 bg-gray-800/80 backdrop-blur-sm p-3 rounded-lg shadow-lg z-50">
        <div className="space-y-3">
          {/* Transform controls */}
          <div className="flex space-x-2">
            <button
              onClick={() => setEditMode(editMode === 'translate' ? null : 'translate')}
              className={`px-3 py-1 rounded-md text-sm ${editMode === 'translate' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'
                }`}
            >
              Move
            </button>
            <button
              onClick={() => setEditMode(editMode === 'rotate' ? null : 'rotate')}
              className={`px-3 py-1 rounded-md text-sm ${editMode === 'rotate' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'
                }`}
            >
              Rotate
            </button>
            <button
              onClick={() => setEditMode(editMode === 'scale' ? null : 'scale')}
              className={`px-3 py-1 rounded-md text-sm ${editMode === 'scale' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'
                }`}
            >
              Scale
            </button>
          </div>

          {/* Import button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-md text-sm"
          >
            Import Model
          </button>

          {/* Material settings */}
          <div className="pt-2 border-t border-gray-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Wireframe</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showWireframe}
                  onChange={(e) => setShowWireframe(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Helpers</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showHelpers}
                  onChange={(e) => setShowHelpers(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Material</span>
              <select
                value={materialType}
                onChange={(e) => {
                  // setMaterialType(e.target.value as any)
                }}
                className="bg-gray-700 text-gray-200 text-sm rounded px-2 py-1"
              >
                <option value="standard">Standard</option>
                <option value="phong">Phong</option>
                <option value="basic">Basic</option>
                <option value="physical">Physical</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Color</span>
              <input
                type="color"
                value={materialColor}
                onChange={(e) => {
                  // setMaterialColor(e.target.value)
                }}
                className="w-6 h-6 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <span className="text-sm text-gray-300">Metalness</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={metalness}
                // onChange={(e) => setMetalness(parseFloat(e.target.value))}
                onChange={() => { }}
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <span className="text-sm text-gray-300">Roughness</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={roughness}
                // onChange={(e) => setRoughness(parseFloat(e.target.value))}
                onChange={() => { }}
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <span className="text-sm text-gray-300">Env. Intensity</span>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={envMapIntensity}
                // onChange={(e) => setEnvMapIntensity(parseFloat(e.target.value))}
                onChange={() => { }}
                className="w-full"
              />
            </div>

            {/* Skin selection */}
            {availableSkins.length > 0 && (
              <div className="space-y-1">
                <span className="text-sm text-gray-300">Skin</span>
                <select
                  value={currentSkin || ''}
                  // onChange={(e) => changeSkin(e.target.value)}
                  className="w-full bg-gray-700 text-gray-200 text-sm rounded px-2 py-1"
                >
                  {availableSkins.map(skin => (
                    <option key={skin} value={skin}>{skin}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Export button */}
          <button
            onClick={exportModel}
            className="w-full mt-3 px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md text-sm"
          >
            Export Model
          </button>
        </div>
      </div>
    </div>
  );
}
