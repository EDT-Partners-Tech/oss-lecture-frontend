import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">404 - Not Found</h1>
      <p className="text-lg">The page you are looking for does not exist.</p>
      <Link to="/dashboard">
        <button className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-foreground transition duration-300">
          Go to Dashboard
        </button>
      </Link>
    </div>
  );
};

export default NotFound;
