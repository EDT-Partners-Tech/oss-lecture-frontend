// © [2025] EDT&Partners. Licensed under CC BY 4.0.
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
