import React from "react";

const NotFound404 = () => {
  return (
    <div>
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
    </div>
  );
};

export default NotFound404;
