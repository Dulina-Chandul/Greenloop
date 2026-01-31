import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useSearchParams, useNavigate } from "react-router";
import { CheckCircle, Lock, AlertCircle, ArrowLeft } from "lucide-react";

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { resetPasswordAPI } from "@/apiservices/common/commonAPI";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const exp = searchParams.get("exp");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const isExpired = exp && Number(exp) < Date.now();

  const passwordsMatch = password === confirmPassword;
  const isFormValid = password.length >= 6 && passwordsMatch;

  const {
    mutate: resetPassword,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationKey: ["resetPassword"],
    mutationFn: resetPasswordAPI,
    onSuccess: () => {
      setIsSuccess(true);
      setTimeout(() => navigate("/login"), 10000);
    },
  });

  const handleSubmit = () => {
    if (isFormValid && code) {
      resetPassword({ verificationCode: code, password, confirmPassword });
    }
  };

  if (!code || isExpired) {
    return <InvalidLinkView reason={isExpired ? "expired" : "invalid"} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            GreenLoop
          </h1>
        </div>

        <Card className="border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Set New Password</CardTitle>
            <CardDescription>Enter your new password below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {isSuccess ? (
              <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Password Reset!
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Your password has been successfully updated.
                  </p>
                </div>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 mt-2"
                  asChild
                >
                  <Link to="/login">Continue to Login</Link>
                </Button>
              </div>
            ) : (
              <>
                {/* Error Message */}
                {isError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      {/* @ts-expect-error handling unknown error type */}
                      {error?.response?.data?.message ||
                        "Failed to reset password."}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 focus-visible:ring-green-600"
                    />
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`pl-9 focus-visible:ring-green-600 ${
                        confirmPassword && !passwordsMatch
                          ? "border-red-500 ring-red-500"
                          : ""
                      }`}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    />
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-red-500">
                      Passwords do not match
                    </p>
                  )}
                </div>

                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={!isFormValid || isPending}
                  onClick={handleSubmit}
                >
                  {isPending ? "Resetting..." : "Reset Password"}
                </Button>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const InvalidLinkView = ({ reason }: { reason: "expired" | "invalid" }) => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50/50 px-4">
    <Card className="w-full max-w-md border-red-200 shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto rounded-full bg-red-100 p-3 w-fit mb-4">
          <AlertCircle className="h-10 w-10 text-red-600" />
        </div>
        <CardTitle className="text-xl text-red-700">
          Link {reason === "expired" ? "Expired" : "Invalid"}
        </CardTitle>
        <CardDescription>
          This password reset link is{" "}
          {reason === "expired"
            ? "no longer active"
            : "invalid or has already been used"}
          .
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center pb-6">
        <Button variant="outline" asChild>
          <Link to="/password/forgot">Request New Link</Link>
        </Button>
      </CardContent>
    </Card>
  </div>
);

export default ResetPassword;
