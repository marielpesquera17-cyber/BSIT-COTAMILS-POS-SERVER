import { z } from "zod";

export const addStaffValidation = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required"),
  email: z
    .string({ required_error: "Email is required" })
    .email("Please provide a valid email address"),
  role: z.enum(["Manager", "Cashier"]),
  status: z.enum(["Active", "Inactive"]),
  imageUrl: z.string({ required_error: "Image is required" }),
});

export const updateStaffValidation = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required"),
  email: z
    .string({ required_error: "Email is required" })
    .email("Please provide a valid email address"),
  role: z.enum(["Manager", "Cashier"]),
  status: z.enum(["Active", "Inactive"]),
  imageUrl: z.string({ required_error: "Image is required" }),
});

export const updateStaffStatusValidation = z.object({
  status: z.enum(["Active", "Inactive"]),
});
