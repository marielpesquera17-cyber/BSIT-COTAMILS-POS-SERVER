import { z } from "zod";

export const createMenuValidation = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required"),
  categoryId: z
    .number({ required_error: "Category is required" })
    .int()
    .positive(),
  description: z
    .string({ required_error: "Description is required" })
    .min(1, "Description is required"),
  imageUrl: z
    .string({ required_error: "Image is required" })
    .url("Invalid image URL"),
  variants: z
    .array(
      z.object({
        label: z.string().min(1, "Variant label is required"),
        price: z.number().min(0, "Price must be at least 0"),
      }),
    )
    .min(1, "At least one variant is required"),
});

export const updateMenuValidation = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required"),
  categoryId: z
    .number({ required_error: "Category is required" })
    .int()
    .positive(),
  description: z.string().optional().default(""),
  imageUrl: z
    .string({ required_error: "Image is required" })
    .url("Invalid image URL"),
  isActive: z.enum([true, false]),
  variants: z
    .array(
      z.object({
        label: z.string().min(1, "Variant label is required"),
        price: z.number().min(0, "Price must be at least 0"),
      }),
    )
    .min(1, "At least one variant is required"),
});

export const updateVariantAvailability = z.object({
  variantId: z.number().int().positive(),
  isAvailable: z.boolean(),
});
