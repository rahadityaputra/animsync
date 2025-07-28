import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';

const useOutline = (renderer: THREE.WebGLRenderer | null, camera: THREE.PerspectiveCamera | null, scene: THREE.Scene | null, resolution: THREE.Vector2) => {
    const [composer, setComposer] = useState<EffectComposer | null>(null);
    const [outlinePass, setOutlinePass] = useState<OutlinePass | null>(null);
    useEffect(() => {
        if (!renderer || !camera || !scene) {
            console.error("Renderer, camera, or scene is not defined");
            return;
        }

        const composerInstance = new EffectComposer(renderer);
        setComposer(composerInstance);

        const outlinePassInstance = new OutlinePass(resolution, scene, camera);
        setOutlinePass(outlinePassInstance);
    }, [renderer, camera, scene, resolution]);

  const [outlineObjects, setOutlineObjects] = useState<THREE.Object3D[]>([]);
  const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(null);
  const addOutlineObject = (object: THREE.Object3D) => {
    setOutlineObjects((prev) => [...prev, object]);
  };


  useEffect(() => {
    if (outlinePass) {
        if (selectedObject) {
            outlinePass.selectedObjects = [selectedObject];
        } else {
        outlinePass.selectedObjects = [];
        }
    }
    if (composer && outlinePass) {
        composer.addPass(outlinePass);
    }
  }, [outlinePass, composer, selectedObject]);


  const removeOutlineObject = (object: THREE.Object3D) => {
    setOutlineObjects((prev) => prev.filter((obj) => obj !== object));
  };

  const clearOutlines = () => {
    setOutlineObjects([]);
  };



  const configureOutlinePass = () => {
    if (!outlinePass || !composer) {
      console.error("OutlinePass or composer is not initialized");
      return;
    }
    outlinePass.edgeGlow = 0.5;
    outlinePass.edgeThickness = 1.0;
    outlinePass.edgeStrength = 3.0;
    outlinePass.visibleEdgeColor.set('#ffffff');
    outlinePass.hiddenEdgeColor.set('#190a05');
    outlinePass.selectedObjects = outlineObjects;
    composer.addPass(outlinePass);
  };

  return {
    outlineObjects,
    selectedObject,
    setSelectedObject,
    addOutlineObject,
    removeOutlineObject,
    clearOutlines,
  };
}

export default useOutline;