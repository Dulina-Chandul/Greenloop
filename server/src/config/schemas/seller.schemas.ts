import z from "zod";

export const SellerAccountTypeEnum = z.enum(["household", "business"]);
export const SellerAccountStatusEnum = z.enum([
  "active",
  "suspended",
  "banned",
  "pending_verification",
]);
export const SellerLanguageEnum = z.enum(["en", "si", "ta"]);
export const SellerPreferredPickupTimeEnum = z.enum([
  "morning",
  "afternoon",
  "evening",
  "anytime",
]);

//*
export const SellerKycStatusEnum = z.enum(["pending", "verified", "rejected"]);

const SellerBusinessInfoSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessRegistration: z.string().optional(),
  businessType: z.string().optional(),
});

const SellerAddressSchema = z.object({
  country: z.string().default("Sri Lanka"),
  province: z.string().min(1, "Province is required"),
  district: z.string().min(1, "District is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().optional(),
  street: z.string().optional(),
});

const SellerNotificationSettingsSchema = z.object({
  email: z.boolean().default(true),
  push: z.boolean().default(true),
  sms: z.boolean().default(false),
});

const SellerPreferencesSchema = z.object({
  language: SellerLanguageEnum.default("en"),
  notifications: SellerNotificationSettingsSchema.optional(),
  autoAcceptBids: z.boolean().default(false),
  preferredPickupTime: SellerPreferredPickupTimeEnum.optional(),
});

export const sellerRegisterSchema = z
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

    accountType: SellerAccountTypeEnum.default("household"),
    address: SellerAddressSchema,

    businessInfo: SellerBusinessInfoSchema.optional(),
    preferences: SellerPreferencesSchema.optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.accountType === "business") {
        return !!data.businessInfo?.businessName;
      }
      return true;
    },
    {
      message: "Business name is required for business accounts",
      path: ["businessInfo"],
    },
  );

export const sellerLoginSchema = z
  .object({
    email: z.string().optional(),
    phoneNumber: z.string().optional(),
    password: z.string().min(6, "Password is required"),
  })
  .refine((data) => data.email || data.phoneNumber, {
    message: "Please provide either email or phone number",
    path: ["email"],
  })
  .refine(
    (data) => {
      if (data.email) {
        return z.string().email().safeParse(data.email).success;
      }
      // If phone number is provided, check length
      if (data.phoneNumber) {
        return data.phoneNumber.length >= 10;
      }
      return true;
    },
    {
      message: "Invalid email format or phone number too short",
      path: ["email"],
    },
  );

export const updateSellerProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phoneNumber: z.string().min(10).optional(),
  avatar: z.string().url().optional(),
  address: SellerAddressSchema.partial().optional(),
  preferences: SellerPreferencesSchema.partial().optional(),
});

export const updateBusinessInfoSchema = z.object({
  businessInfo: SellerBusinessInfoSchema.partial(),
});
export type SellerRegisterInput = z.infer<typeof sellerRegisterSchema>;
export type SellerLoginInput = z.infer<typeof sellerLoginSchema>;
export type UpdateSellerProfileInput = z.infer<
  typeof updateSellerProfileSchema
>;
