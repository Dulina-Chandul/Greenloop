import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router";

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

import { loginAPI } from "@/apiservices/seller/sellerAPI";

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const redirectUrl = location.state?.redirectUrl || "/dashboard";

  const {
    mutateAsync: sellerLogin,
    isPending,
    isError,
  } = useMutation({
    mutationKey: ["login-seller"],
    mutationFn: loginAPI,
    onSuccess: () => {
      navigate(redirectUrl, {
        replace: true,
      });
    },
  });

  //* Handle "Enter" key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sellerLogin({ email, password });
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
            Sign in to manage your waste marketplace
          </p>
        </div>

        <Card className="border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {/* Error Message */}
            {isError && (
              <div className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-200">
                Invalid email or password. Please try again.
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/password/forgot"
                  className="text-sm font-medium text-green-600 hover:text-green-500 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isPending}
                className="focus-visible:ring-green-600"
              />
            </div>

            {/* Submit Button */}
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={!email || password.length < 6 || isPending}
              onClick={() => sellerLogin({ email, password })}
            >
              {isPending ? "Signing in..." : "Sign in"}
            </Button>

            {/* Sign Up Link */}
            <div className="text-center text-sm text-gray-500 mt-4">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-green-600 hover:text-green-500 hover:underline"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
