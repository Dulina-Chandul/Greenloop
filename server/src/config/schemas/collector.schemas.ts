import z from "zod";

export const CollectorKycStatusEnum = z.enum([
  "pending",
  "verified",
  "rejected",
]);
export const CollectorAccountStatusEnum = z.enum([
  "active",
  "suspended",
  "banned",
  "pending_verification",
]);
export const CollectorLanguageEnum = z.enum(["en", "si", "ta"]);

const CollectorLicenseSchema = z.object({
  type: z.string(),
  number: z.string(),
  issuedDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  isValid: z.boolean().optional(),
});

const CollectorNotificationSettingsSchema = z.object({
  email: z.boolean().default(true),
  push: z.boolean().default(true),
  sms: z.boolean().default(false),
});

const CollectorPreferencesSchema = z.object({
  language: CollectorLanguageEnum.default("en"),
  notifications: CollectorNotificationSettingsSchema.optional(),
  autoBidEnabled: z.boolean().default(false),
  maxAutoBidAmount: z.number().optional(),
});

const CollectorAddressSchema = z.object({
  country: z.string().default("Sri Lanka"),
  province: z.string().min(1, "Province is required"),
  district: z.string().min(1, "District is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().optional(),
  street: z.string().optional(),
});

export const collectorRegisterSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    firstName: z
      .string()
      .min(3, "First name must be at least 3 characters long")
      .trim(),
    lastName: z
      .string()
      .min(3, "Last name must be at least 3 characters long")
      .trim(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
    phoneNumber: z
      .string()
      .min(10, "Phone number must be at least 10 digits long"),

    businessName: z.string().optional(),
    businessRegistration: z.string().optional(),

    address: CollectorAddressSchema,

    serviceRadius: z.number().optional(),
    serviceAreas: z.array(z.string()).optional(),
    vehicleType: z.string().optional(),
    vehicleCapacity: z.number().optional(),
    //TODO : Add validation to check if he accept at least one "acceptedMaterials"
    acceptedMaterials: z
      .array(z.string())
      .min(1, "At least one accepted material is required")
      .optional(),
    specializations: z.array(z.string()).optional(),

    workingDays: z.array(z.string()).optional(),
    operatingHours: z
      .object({
        start: z.string().optional(),
        end: z.string().optional(),
      })
      .optional(),

    preferences: CollectorPreferencesSchema.optional(),
    kycDocuments: z.array(z.string()).optional(),
    licenses: z.array(CollectorLicenseSchema).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type CollectorRegisterInput = z.infer<typeof collectorRegisterSchema>;
