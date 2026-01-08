// Import Dependencies
import { Link } from "react-router";

// Local Imports
import Error404Magnify from "assets/illustrations/error-404-magnify.svg?react";
import { Button } from "components/ui";
import { useThemeContext } from "app/contexts/theme/context";
import { useHover } from "hooks";
import { Header } from "app/layouts/MainLayout/Header";
import { Sidebar } from "app/layouts/MainLayout/Sidebar";
import clsx from "clsx";
import { useAuthContext } from "app/contexts/auth/context";

// ----------------------------------------------------------------------

export default function Error404() {
  const { primaryColorScheme: primary, isDark } = useThemeContext();
  const [btnRef, btnHovered] = useHover();
  const [backRef, backHovered] = useHover();

  const { isAuthenticated } = useAuthContext();

  return (
    <>
      {isAuthenticated && <Header />}
      <main
        className={clsx("main-content transition-content grid grid-cols-1")}
      >
        <div
          className={clsx(
            "transition-content grid w-full grid-cols-1 place-content-center px-[var(--margin-x)]",
            !isAuthenticated && "min-h-100vh grow place-items-center",
          )}
        >
          <div className="flex flex-col items-center p-6 text-center">
            <Error404Magnify
              className="w-full"
              style={{
                "--primary": isDark ? primary[500] : primary[600],
                "--primary-light": primary[300],
              }}
            />
            <p className="dark:text-dark-50 pt-4 text-xl font-semibold text-gray-800">
              Oops. This Page Not Found.
            </p>
            <p className="dark:text-dark-200 pt-2 text-gray-500">
              This page you are looking not available. Please back to home
            </p>
            <div className="mt-8">
              <Button
                component={Link}
                to="/"
                ref={btnRef}
                isGlow={btnHovered}
                color="primary"
                className="h-11 text-base"
              >
                Back To Home
              </Button>
              <Button
                component={Link}
                onClick={() => {
                  window.history.back();
                }}
                ref={backRef}
                isGlow={backHovered}
                color="primary"
                className="ml-2 h-11 text-base"
              >
                Go To Back
              </Button>
            </div>
          </div>
        </div>
      </main>
      {isAuthenticated && <Sidebar />}
    </>
  );
}
