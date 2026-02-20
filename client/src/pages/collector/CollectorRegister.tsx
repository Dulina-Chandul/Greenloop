import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch } from "@/redux/hooks/hooks";
import { registerCollectorAPI } from "@/apiservices/collector/collectorAPI";

const Field = ({
  label,
  htmlFor,
  children,
  optional,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  optional?: boolean;
}) => (
  <div className="space-y-1.5">
    <Label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
      {label}
      {optional && <span className="ml-1 text-xs text-gray-400 font-normal">(Optional)</span>}
    </Label>
    {children}
  </div>
);

const inputCls =
  "h-10 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus-visible:ring-brand-600 focus-visible:ring-2 focus-visible:border-brand-600 transition-all text-sm";

const SectionHeading = ({
  icon,
  title,
  step,
}: {
  icon: React.ReactNode;
  title: string;
  step: number;
}) => (
  <div className="flex items-center gap-3 pb-1 mb-4 border-b border-gray-100">
    <div className="w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
      {step}
    </div>
    <div className="flex items-center gap-2">
      <span className="text-brand-600">{icon}</span>
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    </div>
  </div>
);

const CollectorRegister = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  //* Collector registraition info
  // TODO : use formik later to improve the form validation

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [street, setStreet] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [businessRegistration, setBusinessRegistration] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordsMatch = password === confirmPassword || confirmPassword === "";
  const isFormValid =
    email &&
    password.length >= 6 &&
    password === confirmPassword &&
    firstName &&
    lastName &&
    phoneNumber &&
    province &&
    district &&
    city;

  const {
    mutateAsync: register,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationKey: ["register-collector"],
    mutationFn: () =>
      registerCollectorAPI(
        {
          email,
          password,
          confirmPassword,
          firstName,
          lastName,
          phoneNumber,
          address: { province, district, city, postalCode, street },
          ...(businessName && { businessName }),
          ...(businessRegistration && { businessRegistration }),
        },
        dispatch,
      ),
    onSuccess: () => {
      navigate("/collector/dashboard", { replace: true });
    },
  });

  const EyeIcon = ({ open }: { open: boolean }) =>
    open ? (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">

      {/* ── Left branding panel — half page, matching Login & Register ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-shrink-0 bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-600/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center shadow-xl border border-white/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">GreenLoop</span>
          </div>

          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Become a<br />
              <span className="text-brand-300">Collector</span>
            </h2>
            <p className="text-brand-200/80 text-white leading-relaxed">
              Browse local listings, bid competitively, and build a reliable income from recyclable waste.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 w-full">
            {[
              { value: "1K+", label: "Collectors" },
              { value: "AI", label: "Matched" },
              { value: "35%", label: "More Income" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10">
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 justify-center">
            {["Local Listings", "Live Bids", "Reputation", "Route Optimizer"].map((f) => (
              <span key={f} className="px-3 py-1 text-xs bg-white/10 text-white rounded-full border border-white/15 backdrop-blur">
                {f}
              </span>
            ))}
          </div>

          <a href="/" className="flex items-center gap-1.5 text-sm text-white hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </a>
        </div>
      </div>

      {/* ── Right: form ── */}
      <div className="flex-1 overflow-y-auto py-8 px-4 sm:px-8 flex flex-col items-center">

        {/* Mobile header */}
        <div className="flex lg:hidden items-center justify-between w-full mb-6">
          <a href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Home
          </a>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">GreenLoop</span>
          </div>
        </div>

        <div className="w-full max-w-lg space-y-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Create Collector Account</h1>
            <p className="text-sm text-gray-500 mt-1">Fill in your details to start collecting recyclables</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-8 mt-4">

            {/* Error */}
            {isError && (
              <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-3.5">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-600 font-medium">
                  {(error as Error)?.message || "Registration failed. Please try again."}
                </p>
              </div>
            )}

            {/* ── Section 1: Personal Info ── */}
            <div>
              <SectionHeading step={1} title="Personal Information" icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              } />
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="First Name" htmlFor="firstName">
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                      disabled={isPending} className={inputCls} />
                  </Field>
                  <Field label="Last Name" htmlFor="lastName">
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)}
                      disabled={isPending} className={inputCls} />
                  </Field>
                </div>
                <Field label="Email Address" htmlFor="email">
                  <Input id="email" type="email" placeholder="name@example.com" value={email}
                    onChange={(e) => setEmail(e.target.value)} disabled={isPending} className={inputCls} />
                </Field>
                <Field label="Phone Number" htmlFor="phoneNumber">
                  <Input id="phoneNumber" type="tel" placeholder="0771234567" value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)} disabled={isPending} className={inputCls} />
                </Field>
              </div>
            </div>

            {/* ── Section 2: Business Info (Optional) ── */}
            <div>
              <SectionHeading step={2} title="Business Information" icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              } />
              <div className="rounded-xl bg-brand-50 border border-brand-100 p-4 space-y-4">
                <p className="text-xs text-brand-700 font-medium">
                  If you operate a collection business, add those details below — otherwise leave blank.
                </p>
                <Field label="Business Name" htmlFor="businessName" optional>
                  <Input id="businessName" placeholder="Your collection business name" value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)} disabled={isPending} className={inputCls} />
                </Field>
                <Field label="Business Registration Number" htmlFor="businessRegistration" optional>
                  <Input id="businessRegistration" placeholder="Registration number" value={businessRegistration}
                    onChange={(e) => setBusinessRegistration(e.target.value)} disabled={isPending} className={inputCls} />
                </Field>
              </div>
            </div>

            {/* ── Section 3: Service Area ── */}
            <div>
              <SectionHeading step={3} title="Service Area" icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              } />
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Province" htmlFor="province">
                    <Input id="province" value={province} onChange={(e) => setProvince(e.target.value)}
                      disabled={isPending} className={inputCls} />
                  </Field>
                  <Field label="District" htmlFor="district">
                    <Input id="district" value={district} onChange={(e) => setDistrict(e.target.value)}
                      disabled={isPending} className={inputCls} />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="City" htmlFor="city">
                    <Input id="city" value={city} onChange={(e) => setCity(e.target.value)}
                      disabled={isPending} className={inputCls} />
                  </Field>
                  <Field label="Postal Code" htmlFor="postalCode" optional>
                    <Input id="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)}
                      disabled={isPending} className={inputCls} />
                  </Field>
                </div>
                <Field label="Street Address" htmlFor="street" optional>
                  <Input id="street" value={street} onChange={(e) => setStreet(e.target.value)}
                    disabled={isPending} className={inputCls} />
                </Field>
              </div>
            </div>

            {/* ── Section 4: Security ── */}
            <div>
              <SectionHeading step={4} title="Security" icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              } />
              <div className="space-y-4">
                <Field label="Password" htmlFor="password">
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"}
                      placeholder="Min 6 characters" value={password}
                      onChange={(e) => setPassword(e.target.value)} disabled={isPending}
                      className={`${inputCls} pr-10`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </Field>
                <Field label="Confirm Password" htmlFor="confirmPassword">
                  <div className="relative">
                    <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter password" value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)} disabled={isPending}
                      className={`${inputCls} pr-10 ${!passwordsMatch ? "border-red-400 focus-visible:ring-red-400" : ""}`} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                      <EyeIcon open={showConfirmPassword} />
                    </button>
                  </div>
                  {!passwordsMatch && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Passwords do not match
                    </p>
                  )}
                </Field>
              </div>
            </div>

            {/* ── Submit ── */}
            <div className="space-y-4 pt-2">
              <Button
                className="w-full h-11 rounded-xl bg-green-500 hover:bg-brand-700 active:bg-brand-800 text-gray-900 font-semibold text-sm shadow-sm shadow-brand-200 transition-all disabled:opacity-100 disabled:cursor-not-allowed"
                disabled={!isFormValid || isPending}
                onClick={() => register()}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Creating account…
                  </span>
                ) : "Create Collector Account"}
              </Button>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-gray-500">
                <span>Already have an account?{" "}
                  <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">Sign in</Link>
                </span>
                <span className="hidden sm:inline text-gray-300">·</span>
                <span>Want to sell instead?{" "}
                  <Link to="/seller/register" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">Register as Seller</Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectorRegister;