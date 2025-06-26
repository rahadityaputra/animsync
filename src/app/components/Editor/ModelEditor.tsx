// components/ModelEditor.tsx
"use client";
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export function ModelEditor() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [materialType, setMaterialType] = useState('standard');
  const [color, setColor] = useState('#ffffff');
  const [outputSize, setOutputSize] = useState('0.5 x 1.5');

  useEffect(() => {
    // Setup Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    // Axes helper
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Example cube
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main 3D View */}
      <div 
        className={`transition-all duration-300 ${isSidebarOpen ? 'w-3/4' : 'w-full'}`}
        ref={mountRef}
      >
        {/* Toolbar */}
        <div className="absolute top-0 left-0 right-0 bg-gray-800 text-white p-2 flex space-x-4 z-10">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-700 rounded"
          >
            {isSidebarOpen ? '◀ Hide Tools' : '▶ Show Tools'}
          </button>
          <button className="p-2 hover:bg-gray-700 rounded">File</button>
          <button className="p-2 hover:bg-gray-700 rounded">Edit</button>
          <button className="p-2 hover:bg-gray-700 rounded">Render</button>
        </div>
      </div>

      {/* Sidebar Tools */}
      {isSidebarOpen && (
        <div className="w-1/4 bg-white border-l border-gray-300 overflow-y-auto p-4">
          <h2 className="text-xl font-bold mb-4">Tools</h2>
          
          {/* File Operations */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">File Operations</h3>
            <div className="space-y-2">
              <button className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 px-4 rounded">
                Choose File
              </button>
              <button className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 px-4 rounded">
                In-Link
              </button>
              <button className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 px-4 rounded">
                In-Insert
              </button>
            </div>
          </div>

          {/* Transform */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Transform</h3>
            <div className="space-y-2">
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded">
                Reset Devices
              </button>
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded">
                Reset Window
              </button>
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded">
                Reset Code
              </button>
            </div>
          </div>

          {/* Material Editor */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Material Editor</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Material Type:</label>
                <select 
                  value={materialType}
                  onChange={(e) => setMaterialType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="standard">Standard</option>
                  <option value="glass">Glass</option>
                  <option value="metal">Metal</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color:</label>
                <div className="flex items-center">
                  <input 
                    type="color" 
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 mr-2"
                  />
                  <span>{color}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Output:</label>
                <input 
                  type="text" 
                  value={outputSize}
                  onChange={(e) => setOutputSize(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="0.5 x 1.5"
                />
              </div>
            </div>
          </div>

          {/* Render Button */}
          <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-medium">
            Render Scene
          </button>
        </div>
      )}
    </div>
  );
}