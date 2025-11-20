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

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import Loading from './components/loading';
import { knowledgebaseServicesData, servicesData } from './data/servicesData';

const ProtectedRoute = () => {
  const { user, isAuthenticated, loading, availableServices } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const allServices = [...servicesData, ...knowledgebaseServicesData];
  const targetService = allServices.find(service => location.pathname.endsWith(service.url));

  if (availableServices.length === 0) {
    return <Outlet />;
  }

  if (targetService && !availableServices.some(service => service.code === targetService.code)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (location.pathname === '/admin' && user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
