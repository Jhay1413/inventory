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

// Base gadget schema (no effects) so it can be extended.
export const gadgetFormBaseSchema = z.object({
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
  storage: z.coerce.number().int().min(0, {
    message: "Storage is required",
  }),
  autoGenerateImei: z.boolean().default(false),
  imei: z
    .string()
    .trim()
    .max(15, {
      message: "IMEI/Serial must be at most 15 characters",
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

// Zod schema for gadget form (with conditional validation).
export const gadgetFormSchema = gadgetFormBaseSchema.superRefine((v, ctx) => {
  const wantsAuto = v.autoGenerateImei === true
  const hasImei = v.imei.trim().length > 0

  if (!wantsAuto && !hasImei) {
    ctx.addIssue({
      code: "custom",
      path: ["imei"],
      message: "IMEI/Serial is required",
    })
  }
})

export type GadgetFormValues = z.infer<typeof gadgetFormSchema>

export type GadgetFormSubmission = GadgetFormValues & {
  productTypeName: string
  productModelName: string
}

export const GadgetSchema = gadgetFormBaseSchema.extend({
  id: z.string(),
})

export type Gadget = z.infer<typeof GadgetSchema>
