import * as z from 'zod';

export const signInSchema = z.object({
  email: z.email({ error: "Please enter a valid email address." }),

  password: z.string()
    .min(1, { error: "Password is required." })
    .min(6, { error: "Password must be at least 6 characters long." }),

  rememberMe: z.boolean().default(false).optional(),
});

export const signUpSchema = z.object({
  name: z.string()
    .min(3, { error: "Username must be at least 3 characters long." })
    .max(50, { error: "Username cannot exceed 50 characters." })
    .regex(/^[a-zA-Z0-9_]+$/, { error: "Username can only contain letters, numbers, and underscores." }), // Contoh: hanya alphanumeric dan underscore
  email: z.email(),

  password: z.string()
    .min(1, { error: "Password is required." })
    .min(6, { error: "Password must be at least 6 characters long." })
    .regex(/[A-Z]/, { error: "Password must contain at least one uppercase letter." }) // Contoh: butuh huruf besar
    .regex(/[a-z]/, { error: "Password must contain at least one lowercase letter." }) // Contoh: butuh huruf kecil
    .regex(/[0-9]/, { error: "Password must contain at least one number." }) // Contoh: butuh angka
    .regex(/[^a-zA-Z0-9]/, { error: "Password must contain at least one special character." }), // Contoh: butuh karakter spesial
  confirmPassword: z.string()
    .min(1, { error: "Confirm Password is required." }),
}).refine((data) => data.password === data.confirmPassword, {
  error: "Passwords do not match.", // Pesan error jika password tidak cocok
  path: ["confirmPassword"], // Tautkan error ke field confirmPassword
});


export const ForgotPasswordSchema = z.object({
  email: z.email({ error: "Please enter a valid email address" })
})

export const ResetPassworsSchema = z.object({
  newPassword: z.string()
    .min(1, { error: "Password is required." })
    .min(6, { error: "Password must be at least 6 characters long." })
    .regex(/[A-Z]/, { error: "Password must contain at least one uppercase letter." }) // Contoh: butuh huruf besar
    .regex(/[a-z]/, { error: "Password must contain at least one lowercase letter." }) // Contoh: butuh huruf kecil
    .regex(/[0-9]/, { error: "Password must contain at least one number." }) // Contoh: butuh angka
    .regex(/[^a-zA-Z0-9]/, { error: "Password must contain at least one special character." }), // Contoh: butuh karakter spesial
  confirmNewPassword: z.string()
    .min(1, { error: "Confirm Password is required." }),
})

export type SignInFormValues = z.infer<typeof signInSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordSchema>;
export type ResetPassworsFormValues = z.infer<typeof ResetPassworsSchema>;
