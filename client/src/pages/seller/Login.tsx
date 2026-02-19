import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { loginAPI } from "@/apiservices/seller/sellerAPI";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import { selectUserRole } from "@/redux/slices/authSlice";

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userRole = useAppSelector(selectUserRole);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    mutateAsync: login,
    isPending,
    isError,
  } = useMutation({
    mutationKey: ["login"],
    mutationFn: (data: { email: string; password: string }) =>
      loginAPI(data, dispatch),
    onSuccess: () => {
      const rolePath =
        userRole === "collector" ? "/collector/dashboard" : "/seller/dashboard";
      const target = location.state?.redirectUrl || rolePath;
      navigate(target, { replace: true });
      return;
    },
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && email && password.length >= 6) {
      login({ email, password });
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Left panel: branding (hidden on mobile, shows on lg+) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-green-500 via-brand-800 to-brand-700 flex-col items-center justify-center p-12">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-green-600/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-700/10 rounded-full blur-2xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center shadow-xl border border-white/20">
              <svg className="w-8 h-8 text-brand-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">GreenLoop</span>
          </div>

          {/* Tagline */}
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Turn Waste<br />
              <span className="text-brand-300">Into Worth</span>
            </h2>
            <p className="text-brand-200/80 text-base leading-relaxed">
              Sri Lanka's smartest AI-powered marketplace connecting waste sellers with competitive collectors.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 w-full pt-4">
            {[
              { value: "7K+", label: "Tons/Day" },
              { value: "AI", label: "Powered" },
              { value: "3×", label: "Faster Pickup" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10">
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-brand-300 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 justify-center">
            {["ScrapLens AI", "Live Bidding", "Geo Matching", "EcoMate Chat"].map((f) => (
              <span key={f} className="px-3 py-1 text-xs bg-white/10 text-brand-200 rounded-full border border-white/15 backdrop-blur">
                {f}
              </span>
            ))}
          </div>

          <a href="/" className="flex items-center gap-1.5 text-sm text-brand-300 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </a>
        </div>
      </div>

      {/* ── Right panel: login form ── */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-10 sm:px-8">

        {/* Mobile header (visible only on mobile) */}
        <div className="flex lg:hidden items-center justify-between w-full mb-8">
          <a href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Home
          </a>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">GreenLoop</span>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-6">

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-gray-500">
              Sign in to manage your waste marketplace
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-5">

            {/* Error banner */}
            {isError && (
              <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-3.5">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-600 font-medium">
                  Invalid email or password. Please try again.
                </p>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email address
              </Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  disabled={isPending}
                  className="pl-10 h-11 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus-visible:ring-green-500 focus-visible:ring-2 focus-visible:border-green-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Link
                  to="/password/forgot"
                  className="text-xs font-medium text-green-600 hover:text-green-700 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isPending}
                  className="pl-10 pr-10 h-11 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus-visible:ring-green-500 focus-visible:ring-2 focus-visible:border-green-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              className="w-full h-11 rounded-xl bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold text-sm shadow-sm shadow-green-200 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!email || password.length < 6 || isPending}
              onClick={() => login({ email, password })}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-400">New to GreenLoop?</span>
              </div>
            </div>

            {/* Register links */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/seller/register"
                className="flex items-center justify-center gap-1.5 h-10 rounded-xl border border-green-200 text-green-700 text-xs font-medium hover:bg-green-50 hover:border-green-300 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Seller
              </Link>
              <Link
                to="/collector/register"
                className="flex items-center justify-center gap-1.5 h-10 rounded-xl border border-green-200 text-green-700 text-xs font-medium hover:bg-green-50 hover:border-green-300 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Collector
              </Link>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-400">
            Built with 💚 for a greener Sri Lanka
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;