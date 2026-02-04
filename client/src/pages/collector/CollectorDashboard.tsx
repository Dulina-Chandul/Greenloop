// src/pages/collector/Dashboard.tsx
import { useAppSelector } from "@/redux/hooks/hooks";
import { selectUser } from "@/redux/slices/authSlice";

const CollectorDashboard = () => {
  const user = useAppSelector(selectUser);

  return (
    <div className="container mx-auto mt-16 max-w-6xl px-4">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900">
        Collector Dashboard
      </h1>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Stats Cards */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Active Bids</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">
            Total Collections
          </h3>
          <p className="mt-2 text-3xl font-bold text-green-600">0</p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Waste Collected</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">0 kg</p>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="mt-8 rounded-lg border bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.firstName || "Collector"}! 🚛
        </h2>
        <p className="mt-2 text-gray-600">
          Browse available listings and place bids to start collecting
          recyclables.
        </p>
        <button className="mt-4 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700">
          Browse Listings
        </button>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">
            Nearby Listings
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            No listings in your area yet. Check back soon!
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Quick Tips</h3>
          <ul className="mt-2 space-y-2 text-sm text-gray-600">
            <li>✓ Place competitive bids</li>
            <li>✓ Respond quickly to sellers</li>
            <li>✓ Build your reputation with good service</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CollectorDashboard;
