import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router";
import { ArrowLeft, CheckCircle, Mail } from "lucide-react";

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

import { forgotPasswordAPI } from "@/apiservices/common/commonAPI";

const ForgotPassword = () => {
  const [email, setEmail] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    mutateAsync: sendResetLink,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationKey: ["forgot-password"],
    mutationFn: forgotPasswordAPI,
    onSuccess: () => {
      setIsSubmitted(true);
    },
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && email) {
      sendResetLink(email);
    }
  };

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
            <CardTitle className="text-xl">Reset Password</CardTitle>
            <CardDescription>
              {!isSubmitted
                ? "Enter your email address and we'll send you a link to reset your password."
                : "Check your email for the reset link."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {/* Success State */}
            {isSubmitted ? (
              <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Email Sent
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    We have sent a password reset link to{" "}
                    <strong>{email}</strong>.
                  </p>
                </div>
                <Button variant="outline" asChild className="w-full mt-2">
                  <Link to="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                  </Link>
                </Button>
              </div>
            ) : (
              /* Input Form State */
              <>
                {/* Error Message */}
                {isError && (
                  <div className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-200">
                    {error?.message ||
                      "Failed to send reset link. Please try again."}
                  </div>
                )}
                {isError && console.log(error)}

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoFocus
                      disabled={isPending}
                      onKeyDown={handleKeyDown}
                      className="pl-9 focus-visible:ring-green-600"
                    />
                  </div>
                </div>

                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={!email || isPending}
                  onClick={() => sendResetLink(email)}
                >
                  {isPending ? "Sending Link..." : "Send Reset Link"}
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

export default ForgotPassword;
