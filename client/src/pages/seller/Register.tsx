import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { registerAPI } from "@/apiservices/seller/sellerAPI";

const Register = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const passwordsMatch = password === confirmPassword || confirmPassword === "";
  const isFormValid =
    email && password.length >= 6 && password === confirmPassword;

  const {
    mutateAsync: sellerRegister,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationKey: ["register-seller"],
    mutationFn: registerAPI,
    onSuccess: () => {
      navigate("/dashboard", { replace: true });
    },
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isFormValid) {
      sellerRegister({ email, password, confirmPassword });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            GreenLoop
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Join the waste management revolution
          </p>
        </div>

        <Card className="border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Create an account</CardTitle>
            <CardDescription>
              Enter your email and create a password to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {/* API Error Message */}
            {isError && (
              <div className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-200">
                {error?.message || "Registration failed. Please try again."}
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                disabled={isPending}
                className="focus-visible:ring-green-600"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
                className="focus-visible:ring-green-600"
              />
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isPending}
                className={`focus-visible:ring-green-600 ${
                  !passwordsMatch
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
              />
              {!passwordsMatch && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={!isFormValid || isPending}
              onClick={() =>
                sellerRegister({ email, password, confirmPassword })
              }
            >
              {isPending ? "Creating account..." : "Sign up"}
            </Button>

            {/* Login Link */}
            <div className="text-center text-sm text-gray-500 mt-4">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-green-600 hover:text-green-500 hover:underline"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
