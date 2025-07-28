"use client"
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import createClient from "../../../../utils/supabase/client";
import centerAndScaleModel from "../lib/centerAndScaleModel";
import loadModelFile from "../lib/helper/helperEditor";

type useLoadModelProps = {
  modelUrl: string | undefined,
  scene: THREE.Scene
}

const useLoadModel = ({ modelUrl, scene }: useLoadModelProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWireframe, setShowWireframe] = useState(true);
  const [materialType, setMaterialType] = useState<'standard' | 'phong' | 'basic' | 'physical'>('standard');
  const [metalness, setMetalness] = useState(0.5);
  const [currentSkin, setCurrentSkin] = useState<string | null>(null);
  const [roughness, setRoughness] = useState(0.5);
  const [availableSkins, setAvailableSkins] = useState<string[]>([]);
  const [envMapIntensity, setEnvMapIntensity] = useState(1);
  const [materialColor, setMaterialColor] = useState('#ffffff');
  const currentModelRef = useRef<THREE.Group | null>(null);
  const supabase = createClient();

  // const changeSkin = useCallback((skinName: string) => {
  //   if (!currentModelRef.current) return;
  //
  //   currentModelRef.current.traverse((child) => {
  //     if (child instanceof THREE.Mesh && child.material) {
  //       if (Array.isArray(child.material)) {
  //         child.material.forEach(mat => {
  //           if (mat.name === skinName) {
  //             mat.visible = true;
  //           } else {
  //             mat.visible = false;
  //           }
  //         });
  //       } else if (child.material.name === skinName) {
  //         child.material.visible = true;
  //       } else {
  //         child.material.visible = false;
  //       }
  //     }
  //   });
  //
  //   setCurrentSkin(skinName);
  // }, []);

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

  const showErrorCube = () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      wireframe: true
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    currentModelRef.current?.add(cube);
  };

  const updateMaterialSettings = useCallback(() => {
    if (!currentModelRef.current) return;

    currentModelRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
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


  // load model from db
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
          scene.remove(currentModelRef.current);
          currentModelRef.current = null;
        }

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
        scene.add(model);
        currentModelRef.current = model;
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

  useEffect(() => {
    updateMaterialSettings();
  }, [showWireframe, materialColor, materialType, metalness, roughness, envMapIntensity, updateMaterialSettings]);

  const setCurrentModelNull = () => {
    currentModelRef.current = null;
  }

  const setCurrentModel = (model: THREE.Group) => {
    currentModelRef.current = model;
  }

  return { loading, error, currentModel: currentModelRef.current, setCurrentModel, setCurrentModelNull, metalness, materialColor, materialType, updateMaterialSettings, loadAvailableSkins, roughness, envMapIntensity, currentSkin }
}

export default useLoadModel;
