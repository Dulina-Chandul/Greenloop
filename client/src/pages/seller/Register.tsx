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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch } from "@/redux/hooks/hooks";
import { sellerRegisterAPI } from "@/apiservices/seller/sellerAPI";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  //* Form registraition info
  // TODO : use formik later to improve the form validation

  //* Seller informations
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [accountType, setAccountType] = useState<"household" | "business">(
    "household",
  );

  //* Seller address and buisness details
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [street, setStreet] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessRegistration, setBusinessRegistration] = useState("");

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
    city &&
    (accountType === "household" ||
      (accountType === "business" && businessName));

  const {
    mutateAsync: register,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationKey: ["register-seller"],
    mutationFn: () =>
      sellerRegisterAPI(
        {
          email,
          password,
          confirmPassword,
          firstName,
          lastName,
          phoneNumber,
          accountType,
          address: {
            province,
            district,
            city,
            postalCode,
            street,
          },
          ...(accountType === "business" && {
            businessInfo: {
              businessName,
              businessRegistration,
            },
          }),
        },
        dispatch,
      ),
    onSuccess: () => {
      navigate("/seller/dashboard", { replace: true });
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            GreenLoop
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Join the waste management revolution as a Seller
          </p>
        </div>

        <Card className="border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Create Seller Account</CardTitle>
            <CardDescription>
              Fill in your details to start listing your recyclables
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {/* Error message */}
            {isError && (
              <div className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-200">
                {error?.message || "Registration failed. Please try again."}
              </div>
            )}

            {/* Seller personal information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Personal Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isPending}
                    className="focus-visible:ring-green-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isPending}
                    className="focus-visible:ring-green-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPending}
                  className="focus-visible:ring-green-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="0771234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isPending}
                  className="focus-visible:ring-green-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type</Label>
                <Select
                  value={accountType}
                  onValueChange={(val) =>
                    setAccountType(val as "household" | "business")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="household">Household</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {accountType === "business" && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium text-gray-700">
                    Business Information
                  </h4>

                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      disabled={isPending}
                      className="focus-visible:ring-green-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessRegistration">
                      Business Registration (Optional)
                    </Label>
                    <Input
                      id="businessRegistration"
                      value={businessRegistration}
                      onChange={(e) => setBusinessRegistration(e.target.value)}
                      disabled={isPending}
                      className="focus-visible:ring-green-600"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* seller address information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Address</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Input
                    id="province"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    disabled={isPending}
                    className="focus-visible:ring-green-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    disabled={isPending}
                    className="focus-visible:ring-green-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={isPending}
                    className="focus-visible:ring-green-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code </Label>
                  <Input
                    id="postalCode"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    disabled={isPending}
                    className="focus-visible:ring-green-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Street Address </Label>
                <Input
                  id="street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  disabled={isPending}
                  className="focus-visible:ring-green-600"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Security</h3>

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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
            </div>

            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={!isFormValid || isPending}
              onClick={() => register()}
            >
              {isPending ? "Creating account..." : "Sign up"}
            </Button>

            <div className="text-center text-sm text-gray-500 mt-4">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-green-600 hover:text-green-500 hover:underline"
              >
                Sign in
              </Link>
            </div>

            <div className="text-center text-sm text-gray-500">
              Want to collect instead?{" "}
              <Link
                to="/collector/register"
                className="font-semibold text-green-600 hover:text-green-500 hover:underline"
              >
                Register as Collector
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
