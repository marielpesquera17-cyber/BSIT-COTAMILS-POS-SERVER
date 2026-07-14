import { z } from "zod";

export const createInventoryItemValidator = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required"),
  categoryId: z
    .number({ required_error: "Category is required" })
    .int()
    .positive(),
  currentStock: z
    .number({ required_error: "Current Stock is required" })
    .int()
    .positive(),
  unit: z
    .string({ required_error: "Unit is required" })
    .min(1, "Unit is required"),
  reorderLevel: z
    .number({ required_error: "Current Stock is required" })
    .int()
    .positive(),
});

export const updateInventoryItemValidator = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required"),
  categoryId: z
    .number({ required_error: "Category is required" })
    .int()
    .positive(),
  currentStock: z
    .number({ required_error: "Current Stock is required" })
    .int()
    .positive(),
  unit: z
    .string({ required_error: "Unit is required" })
    .min(1, "Unit is required"),
  reorderLevel: z
    .number({ required_error: "Current Stock is required" })
    .int()
    .positive(),
});

export const restockInventoryValidation = z.object({
  quantity: z
    .number({ required_error: "Current Stock is required" })
    .int()
    .positive(),
  note: z
    .string({ required_error: "Note is required" })
    .min(1, "Note is required"),
});
