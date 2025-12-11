import { z } from "zod"

// Gadget type enum
export const GadgetType = {
  APPLE: "Apple",
  ANDROID: "Android",
} as const

export type GadgetTypeValue = typeof GadgetType[keyof typeof GadgetType]

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

// Branch enum
export const Branch = {
  TACLOBAN: "Tacloban",
  CATBALOGAN: "Catbalogan",
  GUIUAN: "Guiuan E.Samar",
  BORONGAN: "Borongan E.Samar",
} as const

export type BranchValue = typeof Branch[keyof typeof Branch]

// Zod schema for gadget form
export const gadgetFormSchema = z.object({
  type: z.enum([GadgetType.APPLE, GadgetType.ANDROID] as const, {
    message: "Please select a gadget type",
  }),
  model: z.string().min(2, {
    message: "Model name must be at least 2 characters",
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
  branch: z.enum([Branch.TACLOBAN, Branch.CATBALOGAN, Branch.GUIUAN, Branch.BORONGAN] as const, {
    message: "Please select a branch",
  }),
  price: z.number().min(0, {
    message: "Price must be a positive number",
  }),
})

export type GadgetFormValues = z.infer<typeof gadgetFormSchema>

// Gadget interface
export interface Gadget {
  id: string
  type: GadgetTypeValue
  model: string
  imei: string
  condition: GadgetConditionValue
  availability: GadgetAvailabilityValue
  status: string
  branch: BranchValue
  price: number
}
