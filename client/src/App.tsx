import { Routes, Route, useNavigate } from "react-router";
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
import Earnings from "./pages/common/Earnings";
import ListingDetails from "./pages/seller/ListingDetails";
import SellerEarnings from "./pages/seller/SellerEarnings";
import Home from "./pages/common/Home";
import NotFound404 from "./pages/common/NotFound404";
import Unauthorized from "./pages/common/Unauthorized";

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
        path="/seller/my-listings"
        element={
          <ProtectedRoute allowedRoles={["seller"]}>
            <SellerLayout>
              <MyListings />
            </SellerLayout>
          </ProtectedRoute>
        }
      />
      {/* <Route
        path="/seller/listing/:id"
        element={
          <ProtectedRoute allowedRoles={["seller"]}>
            <SellerLayout>
              <ListingBids />
            </SellerLayout>
          </ProtectedRoute>
        }
      /> */}
      <Route
        path="/seller/listing/:id"
        element={
          <ProtectedRoute allowedRoles={["seller"]}>
            <SellerLayout>
              <ListingDetails />
            </SellerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/earnings"
        element={
          <ProtectedRoute allowedRoles={["seller"]}>
            <SellerLayout>
              <SellerEarnings />
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
        path="/collector/earnings"
        element={
          <ProtectedRoute allowedRoles={["collector"]}>
            <CollectorLayout>
              <Earnings role="buyer" />
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

      {/* Comman Pages */}

      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound404 />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
    </Routes>
  );
}

export default App;
