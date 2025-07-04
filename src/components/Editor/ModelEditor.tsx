"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

import { createClient } from "@/lib/supabase/client";

type ModelEditorProps = {
  modelUrl: string | undefined;
  onModelImport?: (file: File) => void;
};

async function convertToGLB(file: File): Promise<Blob> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/convert-to-glb', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'model/gltf-binary'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `Conversion failed: ${response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Conversion error:', error);
    throw new Error(`Failed to convert model: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function ModelEditor({ modelUrl, onModelImport }: ModelEditorProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>(null);
  const orbitControlsRef = useRef<OrbitControls>(null);
  const transformControlsRef = useRef<TransformControls>(null);
  const currentModelRef = useRef<THREE.Group>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'translate' | 'rotate' | 'scale' | null>(null);
  const [showWireframe, setShowWireframe] = useState(false);
  const [materialColor, setMaterialColor] = useState('#ffffff');
  const [materialType, setMaterialType] = useState<'standard' | 'phong' | 'basic' | 'physical'>('standard');
  const [metalness, setMetalness] = useState(0.5);
  const [roughness, setRoughness] = useState(0.5);
  const [envMapIntensity, setEnvMapIntensity] = useState(1);
  const [showHelpers, setShowHelpers] = useState(true);
  const [availableSkins, setAvailableSkins] = useState<string[]>([]);
  const [currentSkin, setCurrentSkin] = useState<string | null>(null);

  const supabase = createClient();

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = sceneRef.current;
    scene.background = new THREE.Color(0x222222);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer with tone mapping for better colors
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Orbit Controls
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.25;
    orbitControls.screenSpacePanning = false;
    orbitControlsRef.current = orbitControls;

    // Transform Controls
    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.addEventListener('dragging-changed', (event) => {
      orbitControls.enabled = !event.value;
    });
    transformControlsRef.current = transformControls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Helpers
    const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x333333);
    gridHelper.visible = showHelpers;
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(5);
    axesHelper.visible = showHelpers;
    scene.add(axesHelper);

    // Environment map
    new RGBELoader()
      .load('/environments/industrial_sunset_02_1k.hdr', (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        scene.background = texture;
      });

    mountRef.current.appendChild(renderer.domElement);

    const animate = () => {
      requestAnimationFrame(animate);
      orbitControls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    const loadModel = async () => {
      if (!modelUrl) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        if (currentModelRef.current) {
          sceneRef.current.remove(currentModelRef.current);
          currentModelRef.current = null;
        }
        console.log(modelUrl);

        const url = new URL(modelUrl);
        const pathParts = url.pathname.split('/');
        const bucket = pathParts[5];
        console.log(bucket);

        const filePath = pathParts.slice(6).join('/');
        console.log(filePath);

        const { data: fileBlob, error: downloadError } = await supabase.storage
          .from(bucket)
          .download(filePath);

        if (downloadError || !fileBlob) {
          console.log(downloadError);

          throw new Error("Failed to download file");
        }

        const objectUrl = URL.createObjectURL(fileBlob);
        const model = await loadModelFile(objectUrl);
        URL.revokeObjectURL(objectUrl);

        centerAndScaleModel(model);

        sceneRef.current.add(model);
        currentModelRef.current = model;

        updateMaterialSettings();

        loadAvailableSkins(model);

      } catch (err) {
        console.error("Error loading model:", err);
        setError(`Failed to load model: ${err instanceof Error ? err.message : 'Unknown error'}`);
        showErrorCube();
      } finally {
        setLoading(false);
      }
    };

    loadModel();
  }, [modelUrl]);

  // Load available skins from model
  const loadAvailableSkins = (model: THREE.Group) => {
    const skins = new Set<string>();

    model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => {
            if (mat.name) skins.add(mat.name);
          });
        } else if (child.material.name) {
          skins.add(child.material.name);
        }
      }
    });

    setAvailableSkins(Array.from(skins));
    if (skins.size > 0) {
      setCurrentSkin(Array.from(skins)[0]);
    }
  };

  // Helper function to load model files (now only handles GLTF/GLB)
  const loadModelFile = (url: string): Promise<THREE.Group> => {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(url,
        (gltf) => resolve(gltf.scene),
        undefined,
        (error) => reject(error)
      );
    });
  };

  // Center and scale model to view
  const centerAndScaleModel = (model: THREE.Group) => {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 5 / maxDim;

    model.position.sub(center);
    model.scale.set(scale, scale, scale);
  };

  // Show error indicator
  const showErrorCube = () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      wireframe: true
    });
    const cube = new THREE.Mesh(geometry, material);
    sceneRef.current.add(cube);
    currentModelRef.current?.add(cube);
  };

  // Toggle edit mode
  useEffect(() => {
    if (!transformControlsRef.current || !currentModelRef.current) return;

    if (editMode) {
      transformControlsRef.current.setMode(editMode);
      transformControlsRef.current.attach(currentModelRef.current);
    } else {
      transformControlsRef.current.detach();
    }
  }, [editMode]);

  // Update material settings when changed
  const updateMaterialSettings = useCallback(() => {
    if (!currentModelRef.current) return;

    currentModelRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Apply wireframe setting
        child.material.wireframe = showWireframe;

        // Handle material type change
        if (child.material.type.toLowerCase() !== materialType) {
          let newMaterial;

          switch (materialType) {
            case 'phong':
              newMaterial = new THREE.MeshPhongMaterial();
              break;
            case 'basic':
              newMaterial = new THREE.MeshBasicMaterial();
              break;
            case 'physical':
              newMaterial = new THREE.MeshPhysicalMaterial();
              break;
            default:
              newMaterial = new THREE.MeshStandardMaterial();
          }

          // Copy properties from old material
          newMaterial.copy(child.material);
          child.material = newMaterial;
        }

        // Apply color and other properties
        if (child.material instanceof THREE.MeshStandardMaterial ||
          child.material instanceof THREE.MeshPhysicalMaterial) {
          child.material.color.set(materialColor);
          child.material.metalness = metalness;
          child.material.roughness = roughness;
          child.material.envMapIntensity = envMapIntensity;
          child.material.needsUpdate = true;
        }
      }
    });
  }, [showWireframe, materialColor, materialType, metalness, roughness, envMapIntensity]);

  // Handle material changes
  useEffect(() => {
    updateMaterialSettings();
  }, [showWireframe, materialColor, materialType, metalness, roughness, envMapIntensity, updateMaterialSettings]);

  // Handle skin change
  const changeSkin = useCallback((skinName: string) => {
    if (!currentModelRef.current) return;

    currentModelRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => {
            if (mat.name === skinName) {
              mat.visible = true;
            } else {
              mat.visible = false;
            }
          });
        } else if (child.material.name === skinName) {
          child.material.visible = true;
        } else {
          child.material.visible = false;
        }
      }
    });

    setCurrentSkin(skinName);
  }, []);

  useEffect(() => {
    sceneRef.current.children.forEach(child => {
      if (child instanceof THREE.GridHelper || child instanceof THREE.AxesHelper) {
        child.visible = showHelpers;
      }
    });
  }, [showHelpers]);

  useEffect(() => {
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;

      cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(
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
      setLoading(true);
      setError(null);

      if (currentModelRef.current) {
        sceneRef.current.remove(currentModelRef.current);
        currentModelRef.current = null;
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

      sceneRef.current.add(model);
      currentModelRef.current = model;

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
      setLoading(false);
    }
  };

  const exportModel = () => {
    if (!currentModelRef.current) return;

    const exporter = new GLTFExporter();
    exporter.parse(
      currentModelRef.current,
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
                onChange={(e) => setMaterialType(e.target.value as any)}
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
                onChange={(e) => setMaterialColor(e.target.value)}
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
                onChange={(e) => setMetalness(parseFloat(e.target.value))}
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
                onChange={(e) => setRoughness(parseFloat(e.target.value))}
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
                onChange={(e) => setEnvMapIntensity(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Skin selection */}
            {availableSkins.length > 0 && (
              <div className="space-y-1">
                <span className="text-sm text-gray-300">Skin</span>
                <select
                  value={currentSkin || ''}
                  onChange={(e) => changeSkin(e.target.value)}
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
