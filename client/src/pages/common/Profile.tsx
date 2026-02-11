import { AlertCircle, Calendar, Mail, DollarSign } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import userAuth from "@/hooks/userAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axiosInstance from "@/config/api/axiosInstance";
import { useState } from "react";

const Profile = () => {
  const { user } = userAuth();
  const queryClient = useQueryClient();
  const [currency, setCurrency] = useState(user?.currency || "LKR");

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: async (data: { currency: string }) => {
      await axiosInstance.put("/user", data);
    },
    onSuccess: (_, variables) => {
      toast.success(`Currency updated to ${variables.currency}`);
      queryClient.invalidateQueries({ queryKey: ["user"] }); // Invalidate user query to refetch
      // Since userAuth hook might not react immediately if it uses a different query key or context,
      // we rely on the backend update and subsequent fetches.
      // Ideally userAuth should use react-query too for seamless updates.
      // Assuming userAuth uses redux or context that needs manual update or re-fetch.
      // For now, let's assume invalidating "user" or "auth" helps if setup correctly.
      // If userAuth is from Redux, we might need to dispatch an action.
      // But let's proceed with just mutation for now.
      window.location.reload(); // Simple reload to ensure all components get fresh data if Redux isn't automatically updated
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  if (!user) return null;

  const { email, verified, createdAt } = user;

  return (
    <div className="flex flex-col items-center pt-16 px-4">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900">
        My Account
      </h1>

      {!verified && (
        <Alert className="mb-6 max-w-md border-yellow-200 bg-yellow-50 text-yellow-800">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-900">Verify your email</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Please check your inbox to verify your email address.
          </AlertDescription>
        </Alert>
      )}

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <Avatar className="h-16 w-16 border-2 border-green-100">
            <AvatarImage src="#" />
            <AvatarFallback className="bg-green-600 text-xl text-white">
              {email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <CardTitle className="text-xl">User Profile</CardTitle>
            <CardDescription>Manage your account info</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4 pt-4">
          {/* Email Row */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <Mail className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium">Email</span>
            </div>
            <span className="text-sm text-gray-500">{email}</span>
          </div>

          {/* Currency Row */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-sm font-medium">Currency</span>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={currency}
                onValueChange={(value) => {
                  setCurrency(value);
                  updateProfile({ currency: value });
                }}
                disabled={isPending}
              >
                <SelectTrigger className="w-25 h-8">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LKR">LKR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="AUD">AUD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Joined Date Row */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-2">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium">Joined</span>
            </div>
            <span className="text-sm text-gray-500">
              {new Date(createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
