import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const config = {
  api: {
    bodyParser: false,
  },
};

interface FormDataFields {
  [key: string]: any;
}

interface FormDataFiles {
  file?: File;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse form data
    const form = new IncomingForm();
    const [fields, files] = await new Promise<[FormDataFields, FormDataFiles]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create temp directory
    const tempDir = path.join(process.cwd(), 'temp');
    await fs.mkdir(tempDir, { recursive: true });

    // Prepare paths
    const inputPath = path.join(tempDir, file.originalFilename || 'input');
    const outputPath = path.join(tempDir, 'output.glb');
    const scriptPath = path.join(tempDir, 'convert.py');

    // Move uploaded file
    await fs.rename(file.filepath, inputPath);

    // Create Blender script
    const blenderScript = `
import bpy
import os

# Clear scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Import file
filepath = r'${inputPath.replace(/\\/g, '\\\\')}'
ext = os.path.splitext(filepath)[1].lower()

if ext == '.fbx':
    bpy.ops.import_scene.fbx(filepath=filepath)
elif ext == '.obj':
    bpy.ops.import_scene.obj(filepath=filepath)
elif ext == '.gltf' or ext == '.glb':
    bpy.ops.import_scene.gltf(filepath=filepath)
else:
    raise Exception("Unsupported file format")

# Export to GLB
bpy.ops.export_scene.gltf(
    filepath=r'${outputPath.replace(/\\/g, '\\\\')}',
    export_format='GLB',
    export_yup=True,
    export_apply=True
)
`;

    await fs.writeFile(scriptPath, blenderScript);

    // Run Blender
    const { stderr } = await execAsync(
      `blender --background --python ${scriptPath}`
    );

    if (stderr) {
      console.error('Blender stderr:', stderr);
    }

    // Read output file
    const outputFile = await fs.readFile(outputPath);

    // Clean up
    await Promise.all([
      fs.unlink(inputPath),
      fs.unlink(scriptPath),
      fs.unlink(outputPath),
    ]);

    // Send response
    res.setHeader('Content-Type', 'model/gltf-binary');
    res.setHeader('Content-Disposition', 'attachment; filename=converted.glb');
    return res.send(outputFile);

  } catch (error) {
    console.error('Conversion error:', error);
    return res.status(500).json({ 
      error: 'Failed to convert model', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}