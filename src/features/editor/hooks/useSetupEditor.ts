import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

type useSetupEditorProps = {
  mountRef: React.RefObject<HTMLDivElement | null>,
  showHelpers: boolean
}

const useSetupEditor = ({ mountRef, showHelpers }: useSetupEditorProps) => {
  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>(null);
  const orbitControlsRef = useRef<OrbitControls>(null);
  const transformControlsRef = useRef<TransformControls>(null);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
  });

  useEffect(() => {
    if (!mountRef.current) return;


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


    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.25;
    orbitControls.screenSpacePanning = false;
    orbitControlsRef.current = orbitControls;

    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.addEventListener('dragging-changed', (event) => {
      orbitControls.enabled = !event.value;
    });
    transformControlsRef.current = transformControls;

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x333333);
    gridHelper.visible = showHelpers;
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(5);
    axesHelper.visible = showHelpers;
    scene.add(axesHelper);

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
      transformControls.removeEventListener('dragging-changed', (event) => {
        orbitControls.enabled = !event.value;
      });

      scene.remove(ambientLight);
      scene.remove(directionalLight);
      scene.remove(gridHelper);
      scene.remove(axesHelper);

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (orbitControlsRef.current) {
        orbitControlsRef.current.dispose();
      }
      if (transformControlsRef.current) {
        transformControlsRef.current.dispose();
      }

      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [mountRef, showHelpers]); // Tambahkan showHelpers sebagai dependency

  return { scene: sceneRef.current, camera: cameraRef.current, renderer: rendererRef.current, orbitControls: orbitControlsRef.current, transformControls: transformControlsRef.current };
};

export default useSetupEditor;
