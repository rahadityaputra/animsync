import * as z from 'zod';

export const signInSchema = z.object({
  email: z.string()
    .min(1, { message: "Email is required." }),
  // .email({ message: "Please enter a valid email address." }),

  password: z.string()
    .min(1, { message: "Password is required." })
    .min(6, { message: "Password must be at least 6 characters long." }),

  rememberMe: z.boolean().optional().default(false),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters long." })
    .max(50, { message: "Username cannot exceed 50 characters." })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores." }), // Contoh: hanya alphanumeric dan underscore
  email: z.string()
    .min(1, { message: "Email is required." }),
  password: z.string()
    .min(1, { message: "Password is required." })
    .min(6, { message: "Password must be at least 6 characters long." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." }) // Contoh: butuh huruf besar
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." }) // Contoh: butuh huruf kecil
    .regex(/[0-9]/, { message: "Password must contain at least one number." }) // Contoh: butuh angka
    .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character." }), // Contoh: butuh karakter spesial
  confirmPassword: z.string()
    .min(1, { message: "Confirm Password is required." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.", // Pesan error jika password tidak cocok
  path: ["confirmPassword"], // Tautkan error ke field confirmPassword
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;
