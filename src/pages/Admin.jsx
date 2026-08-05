import { Navigate } from 'react-router-dom';

/** Legacy entry — redirects to the new admin dashboard. */
export default function Admin() {
  return <Navigate to="/admin/dashboard" replace />;
}
