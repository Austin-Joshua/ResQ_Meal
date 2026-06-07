import { z } from 'zod';

const emailField = z.string().email('Please enter a valid email address');
const passwordField = z.string().min(8, 'Password must be at least 8 characters');

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(true),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: emailField,
    password: passwordField,
    confirmPassword: z.string(),
    role: z.enum(['restaurant', 'ngo', 'volunteer']),
    phone_number: z.string().max(20).optional(),
    address: z.string().max(500).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const foodPostSchema = z.object({
  food_name: z.string().min(1, 'Food name is required').max(200),
  food_type: z.enum(['meals', 'vegetables', 'baked', 'dairy', 'fruits', 'others']).optional(),
  quantity_servings: z.coerce.number().int().min(1, 'At least 1 serving required').max(10000),
  description: z.string().max(1000).optional(),
  address: z.string().min(1, 'Pickup address is required').max(500),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  safety_window_minutes: z.coerce.number().int().min(1).max(1440).optional(),
  min_storage_temp_celsius: z.coerce.number().optional(),
  max_storage_temp_celsius: z.coerce.number().optional(),
  availability_time_hours: z.coerce.number().min(0).max(168).optional(),
  freshness_score: z.coerce.number().min(0).max(100).nullable().optional(),
  quality_score: z.coerce.number().min(0).max(100).nullable().optional(),
});

export type FoodPostFormValues = z.infer<typeof foodPostSchema>;
