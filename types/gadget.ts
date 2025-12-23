import { z } from "zod"

// Condition enum
export const GadgetCondition = {
  BRAND_NEW: "BrandNew",
  SECOND_HAND: "SecondHand",
} as const

export type GadgetConditionValue = typeof GadgetCondition[keyof typeof GadgetCondition]

// Availability enum
export const GadgetAvailability = {
  AVAILABLE: "Available",
  SOLD: "Sold",
} as const

export type GadgetAvailabilityValue = typeof GadgetAvailability[keyof typeof GadgetAvailability]

// Zod schema for gadget form
export const gadgetFormSchema = z.object({
  productTypeId: z.string().min(1, {
    message: "Please select a product type",
  }),
  productModelId: z.string().min(1, {
    message: "Please select a product model",
  }),
  color: z.string().min(1, {
    message: "Color is required",
  }),
  ram: z.coerce.number().int().min(1, {
    message: "RAM is required",
  }),
  imei: z.string().regex(/^\d{15}$/, {
    message: "IMEI must be exactly 15 digits",
  }),
  condition: z.enum([GadgetCondition.BRAND_NEW, GadgetCondition.SECOND_HAND] as const, {
    message: "Please select a condition",
  }),
  availability: z.enum([GadgetAvailability.AVAILABLE, GadgetAvailability.SOLD] as const, {
    message: "Please select availability",
  }),
  status: z.string().min(1, {
    message: "Status is required",
  }),
})

export type GadgetFormValues = z.infer<typeof gadgetFormSchema>

export type GadgetFormSubmission = GadgetFormValues & {
  productTypeName: string
  productModelName: string
}

export const GadgetSchema = gadgetFormSchema.extend({
  id: z.string(),
})

export type Gadget = z.infer<typeof GadgetSchema>
