// pages/api/blender/execute.ts
import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';
const execAsync = promisify(exec);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const { scriptContent, blendFilePath, outputDir } = req.body;

    // Validasi input
    if (!scriptContent) {
      return res.status(400).json({ error: 'Script content is required' });
    }

    // Buat file script sementara
    const tempScriptPath = path.join('/tmp', `blender_script_${Date.now()}.py`);
    const fs = require('fs');
    fs.writeFileSync(tempScriptPath, scriptContent);

    // Siapkan perintah Blender
    let command = 'blender -b';
    
    if (blendFilePath) {
      command += ` ${blendFilePath}`;
    } else {
      command += ' -P'; // Run script tanpa file .blend
    }

    command += ` -P ${tempScriptPath}`;

    if (outputDir) {
      command += ` -- ${outputDir}`;
    }

    // Eksekusi Blender
    const { stdout, stderr } = await execAsync(command, {
      env: {
        ...process.env,
        BLENDER_INPUT: JSON.stringify(req.body.inputData || {}),
      },
      timeout: 60000 // Timeout 60 detik
    });

    // Bersihkan file sementara
    fs.unlinkSync(tempScriptPath);

    // Parse output Blender
    let output;
    try {
      output = stdout ? JSON.parse(stdout) : {};
    } catch (e) {
      output = { rawOutput: stdout };
    }

    res.status(200).json({
      success: true,
      output,
      logs: stderr
    });

  } catch (error) {
    console.error('Blender execution error:', error);
    res.status(500).json({ 
      error: 'Failed to execute Blender script',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}