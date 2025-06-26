import bpy
import json
import os
import sys
import argparse

def main():
    # Setup argument parser
    parser = argparse.ArgumentParser()
    parser.add_argument('--output-dir', type=str, default='/tmp')
    args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:])
    
    # Load input data
    input_data = json.loads(os.environ.get('BLENDER_INPUT', '{}'))
    
    # Clear default scene
    bpy.ops.wm.read_factory_settings(use_empty=True)
    
    # Process input data
    if input_data.get('add_cube', False):
        bpy.ops.mesh.primitive_cube_add(
            size=input_data.get('cube_size', 2),
            location=(0, 0, 0)
        )
        bpy.context.object.name = "GeneratedCube"
    
    # Setup render settings
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 64
    
    # Set output path
    output_path = os.path.join(
        args.output_dir,
        f"render_{os.getpid()}.png"
    )
    scene.render.filepath = output_path
    
    # Execute render
    bpy.ops.render.render(write_still=True)
    
    # Return result
    result = {
        "output_path": output_path,
        "render_settings": {
            "resolution": (scene.render.resolution_x, scene.render.resolution_y),
            "samples": scene.cycles.samples
        }
    }
    
    print(json.dumps(result))

if __name__ == "__main__":
    main()