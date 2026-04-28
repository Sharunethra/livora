import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  // For development, we can bypass this if we want, 
  // but let's implement the logic
  if (!token) {
    // return <Navigate to="/login" replace />;
    // Bypass for initial development so we can see the dashboard
    return children; 
  }

  return children;
};

export default ProtectedRoute;
