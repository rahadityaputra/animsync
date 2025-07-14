import { useEffect } from "react";
import { TransformControls } from "three/examples/jsm/Addons.js";

const useEditMode = (transformControl?: TransformControls | null) => {
  useEffect(() => {
    if (transformControl) {
      transformControl.setMode('translate');
    }
  }, [transformControl])

  const setTranslate = () => {
    if (transformControl) {
      transformControl.setMode('translate');
    }
  }

  const setScale = () => {
    if (transformControl) {
      transformControl.setMode('scale');
    }
  }

  const setRotate = () => {
    if (transformControl) {
      transformControl.setMode('rotate');
    }
  }

  return { setTranslate, setScale, setRotate }
}

export default useEditMode;
