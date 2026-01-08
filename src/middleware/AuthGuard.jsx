// Import Dependencies
import { Navigate, useOutlet } from "react-router";

// Local Imports
import { useAuthContext } from "app/contexts/auth/context";
import { GHOST_ENTRY_PATH } from "../constants/app.constant";

// ----------------------------------------------------------------------

export default function AuthGuard() {
  const outlet = useOutlet();
  const { isAuthenticated } = useAuthContext();

  if (!isAuthenticated) {
    return <Navigate to={`${GHOST_ENTRY_PATH}`} replace />;
  }

  return <>{outlet}</>;
}
