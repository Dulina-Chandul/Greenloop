const Unauthorized = () => {
  return (
    <div>
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
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
    </div>
  );
};

export default Unauthorized;
