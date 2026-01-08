// Import Dependencies
import clsx from "clsx";
import { Outlet } from "react-router";

// Local Imports
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useEffect } from "react";
import { disconnectSocket, initializeSocket } from "socketManager";
import { useAuthContext } from "app/contexts/auth/context";
// ----------------------------------------------------------------------

export default function MainLayout() {
  const { isAuthenticated } = useAuthContext();

  useEffect(() => {
    if (isAuthenticated) {
      initializeSocket();
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated]);

  return (
    <>
      <Header />
      <main
        className={clsx(
          "main-content transition-content grid grid-cols-1 pb-3",
        )}
      >
        <Outlet />
      </main>

      <Sidebar />
    </>
  );
}
