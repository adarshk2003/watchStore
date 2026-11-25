import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

const ROLE_MAP = {
  // Semantic role strings
  admin: 'admin',
  seller: 'seller',
  buyer: 'buyer',
  customer: 'buyer',
  // Backward-compatible Mongo ObjectIds
  '675870dbae9c6b1dffa1a7ed': 'admin',
  '675870f3ae9c6b1dffa1a7ee': 'seller',
  '67587113ae9c6b1dffa1a7ef': 'buyer',
};

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('authToken');
  const rawRole = localStorage.getItem('role') || localStorage.getItem('userType');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const normalizedRole = ROLE_MAP[rawRole] || rawRole || 'buyer';

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const isAllowed = allowedRoles.some((r) => ROLE_MAP[r] === normalizedRole || r === normalizedRole);
    if (!isAllowed) {
      if (normalizedRole === 'admin') return <Navigate to="/admin-home" replace />;
      if (normalizedRole === 'seller') return <Navigate to="/seller-home" replace />;
      return <Navigate to="/home" replace />;
    }
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};
