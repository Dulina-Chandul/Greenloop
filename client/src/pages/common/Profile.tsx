import { AlertCircle, Calendar, Mail, User } from "lucide-react";

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

const Profile = () => {
  const { user } = userAuth();
  if (!user) return null;

  const { email, verified, createdAt } = user;

  console.log(user);

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
