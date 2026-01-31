import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { verifyEmailAPI } from "@/apiservices/common/commonAPI";

const VerifyEmail = () => {
  const { code } = useParams();

  const { isPending, isSuccess, isError, error } = useQuery({
    queryKey: ["email-verification", code],
    queryFn: () => verifyEmailAPI(code as string),
    retry: false,
    enabled: !!code,
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            GreenLoop
          </h1>
        </div>

        <Card className="border-gray-200 shadow-lg text-center">
          <CardHeader>
            <CardTitle>Email Verification</CardTitle>
            <CardDescription>
              We are verifying your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 pt-4">
            {/* Loading State */}
            {isPending && (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-12 w-12 animate-spin text-green-600" />
                <p className="text-sm text-gray-500">Verifying your code...</p>
              </div>
            )}

            {/* Success State */}
            {isSuccess && (
              <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Verified!
                  </h3>
                  <p className="text-sm text-gray-500">
                    Your email has been successfully verified.
                  </p>
                </div>
                <Button
                  asChild
                  className="w-full bg-green-600 hover:bg-green-700 mt-2"
                >
                  <Link to="/login">Continue to Login</Link>
                </Button>
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                <div className="rounded-full bg-red-100 p-3">
                  <XCircle className="h-12 w-12 text-red-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {error?.message || "Verification Failed"}
                  </h3>
                  <p className="text-sm text-red-500">
                    {"Invalid or expired verification link."}
                  </p>
                </div>

                <div className="flex w-full gap-2 mt-2">
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/login">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;
