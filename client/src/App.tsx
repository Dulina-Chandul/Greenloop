import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router";
import { Button } from "./components/ui/button";
import Login from "./pages/seller/Login";
import Register from "./pages/seller/Register";
import VerifyEmail from "./pages/common/VerifyEmail";
import ForgotPassword from "./pages/common/ForgotPassword";
import ResetPassword from "./pages/common/ResetPassword";
import AppContainer from "./pages/common/AppContainer";
import Profile from "./pages/common/Profile";
import Settings from "./pages/common/Settings";
import { setNavigate } from "./lib/navigation";
import CollectorRegister from "./pages/collector/CollectorRegister";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import SellerDashboard from "./pages/seller/SellerDashboard";
import CollectorDashboard from "./pages/collector/CollectorDashboard";
import CollectorAuctions from "./pages/collector/CollectorAuctions";
import CollectorLayout from "./components/layout/CollectorLayout";
import SellerLayout from "./components/layout/SellerLayout";
import CreateListing from "./pages/seller/CreateListing";
import AuctionDetails from "./pages/collector/AuctionDetails";
import MyListings from "./pages/seller/MyListings";
import ListingBids from "./pages/seller/ListingBids";
import MyBids from "./pages/collector/MyBids";
// import './App.css'

function App() {
  const navigate = useNavigate();
  setNavigate(navigate);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/seller/register" element={<Register />} />
      <Route path="/collector/register" element={<CollectorRegister />} />
      <Route path="/email/verify/:code" element={<VerifyEmail />} />
      <Route path="/password/forgot" element={<ForgotPassword />} />
      <Route path="/password/reset" element={<ResetPassword />} />

      <Route
        path="/seller/dashboard"
        element={
          <ProtectedRoute allowedRoles={["seller"]}>
            <SellerLayout>
              <SellerDashboard />
            </SellerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/create-listing"
        element={
          <ProtectedRoute allowedRoles={["seller"]}>
            <SellerLayout>
              <CreateListing />
            </SellerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/profile"
        element={
          <ProtectedRoute allowedRoles={["seller"]}>
            <SellerLayout>
              <Profile />
            </SellerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/listings"
        element={
          <ProtectedRoute allowedRoles={["seller"]}>
            <SellerLayout>
              <MyListings />
            </SellerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/settings"
        element={
          <ProtectedRoute allowedRoles={["seller"]}>
            <SellerLayout>
              <Settings />
            </SellerLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/collector/dashboard"
        element={
          <ProtectedRoute allowedRoles={["collector"]}>
            <CollectorLayout>
              <CollectorDashboard />
            </CollectorLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/collector/auctions"
        element={
          <ProtectedRoute allowedRoles={["collector"]}>
            <CollectorLayout>
              <CollectorAuctions />
            </CollectorLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/collector/auctions/:id"
        element={
          <ProtectedRoute allowedRoles={["collector"]}>
            <CollectorLayout>
              <AuctionDetails />
            </CollectorLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/collector/profile"
        element={
          <ProtectedRoute allowedRoles={["collector"]}>
            <CollectorLayout>
              <Profile />
            </CollectorLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/collector/settings"
        element={
          <ProtectedRoute allowedRoles={["collector"]}>
            <CollectorLayout>
              <Settings />
            </CollectorLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/collector/my-bids"
        element={
          <ProtectedRoute allowedRoles={["collector"]}>
            <CollectorLayout>
              <MyBids />
            </CollectorLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/seller/listing/:id/bids"
        element={
          <ProtectedRoute allowedRoles={["seller"]}>
            <SellerLayout>
              <ListingBids />
            </SellerLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppContainer>
              <Profile />
            </AppContainer>
          </ProtectedRoute>
        }
      />

      <Route
        path="/unauthorized"
        element={
          <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Access Denied
              </h1>
              <p className="mt-2 text-gray-600">
                You don't have permission to view this page.
              </p>
              <a
                href="/login"
                className="mt-4 inline-block text-green-600 hover:underline"
              >
                Go to Login
              </a>
            </div>
          </div>
        }
      />

      <Route
        path="/"
        element={
          <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900">GreenLoop</h1>
              <p className="mt-2 text-gray-600">Smart Waste Marketplace</p>
              <div className="mt-6 flex gap-4 justify-center">
                <a
                  href="/login"
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Login
                </a>
                <a
                  href="/seller/register"
                  className="px-6 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50"
                >
                  Register as Seller
                </a>
                <a
                  href="/collector/register"
                  className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
                >
                  Register as Collector
                </a>
              </div>
            </div>
          </div>
        }
      />

      <Route
        path="*"
        element={
          <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">
                404 - Page Not Found
              </h1>
              <p className="mt-2 text-gray-600">
                The page you're looking for doesn't exist.
              </p>
              <a
                href="/login"
                className="mt-4 inline-block text-green-600 hover:underline"
              >
                Go to Login
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
