const getContentType = (ext?: string) => {
  switch (ext?.toLowerCase()) {
    case "gltf":
      return "model/gltf+json";
    case "glb":
      return "model/gltf-binary";
    case "fbx":
      return "application/octet-stream";
    case "obj":
      return "text/plain";
    default:
      return "application/octet-stream";
  }
};

export default getContentType
