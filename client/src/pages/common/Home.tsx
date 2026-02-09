import React from "react";

const Home = () => {
  return (
    <div>
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
    </div>
  );
};

export default Home;
