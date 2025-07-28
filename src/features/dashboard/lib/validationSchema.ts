import * as z from 'zod';

export const addProjectSchema = z.object({
  projectName: z.string()
    .min(3, { error: "Project's name must be at least 3 characters long." })
    .max(50, { error: "Project's name cannot exceed 50 characters." })
    .regex(/^[a-zA-Z0-9_]+$/, { error: "Project's name can only contain letters, numbers, and underscores." }),

  projectDescription: z.string()
    .min(10, { error: "Description must be at least 10 characters long." })
    .max(500, { error: "Description cannot exceed 500 characters." })
    .optional() // Make description optional if it's not strictly required
    .or(z.literal('')), // Allow empty string if optional

  projectFile: z.instanceof(File) // Expects a FileList object from input type="file"
    .refine(file => file != null, { error: "Project file is required." }) // Checks if a file was selected
    .refine(file => {
      const allowedExtensions = ['.blend', '.gltf', '.glb'];
      const fileName = file.name.toLowerCase();
      return allowedExtensions.some(ext => fileName.endsWith(ext));
    }, { error: "Unsupported file type. Please upload a .blend, .gltf, or .glb file." }) // Validates file extension

    .refine(file => {
      if (!file) return true; // No file, so valid for size check (already caught by length check)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      return file.size <= MAX_FILE_SIZE;
    }, { error: "File size must be less than 10MB." }),
});

export type AddProjectFormValues = z.infer<typeof addProjectSchema>;
