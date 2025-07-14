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


export { convertToGLB, getContentType };
