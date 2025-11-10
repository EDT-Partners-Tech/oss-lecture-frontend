import { Link } from 'react-router-dom';

const RouteError = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-lg text-center bg-white p-8 shadow-lg rounded-lg">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Something went wrong</h1>
        <p className="text-lg text-gray-600 mb-6">We couldn't load this page.</p>
        <p className="text-sm text-gray-500 mb-8">
          Please try refreshing the page or come back later.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 text-white bg-primary rounded-lg hover:bg-primary-foreground transition"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default RouteError;
