/*
 * Copyright 2025 EDT&Partners
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
