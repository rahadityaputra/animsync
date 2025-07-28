import * as THREE from 'three';

const useRayCaster = () => {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const setMousePosition = (x: number, y: number) => {
    mouse.x = (x / window.innerWidth) * 2 - 1;
    mouse.y = -(y / window.innerHeight) * 2 + 1;
  };
  
  const setRaycasterFromCamera = (camera: THREE.PerspectiveCamera) => {
    if (!camera) {
      console.error("Camera is not defined");
      return;
    }
    if (!mouse) {
      console.error("Mouse position is not set");
      return;
    }
    // Update the raycaster with the current mouse position and camera
    if (!raycaster) {
      console.error("Raycaster is not initialized");
      return;
    }
    if (!(mouse instanceof THREE.Vector2)) {
      console.error("Mouse is not a valid THREE.Vector2 instance");
      return;
    }
    if (!(camera instanceof THREE.PerspectiveCamera)) {
      console.error("Camera is not a valid THREE.PerspectiveCamera instance");
      return;
    }
    raycaster.setFromCamera(mouse, camera);
  };

  const getObjectsIntersected = (objects: THREE.Object3D[]) => {
    return raycaster.intersectObjects(objects);
  };

  return {
    raycaster,
    mouse,
    setMousePosition,
    getObjectsIntersected,
    setRaycasterFromCamera,
  }
}

export default useRayCaster;
