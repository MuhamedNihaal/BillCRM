// Import Dependencies
import { Navigate } from "react-router";

// Local Imports
import { AppLayout } from "app/layouts/AppLayout";
import { DynamicLayout } from "app/layouts/DynamicLayout";
import AuthGuard from "middleware/AuthGuard";
// import TitlePage from "app/pages/TitlePage";

// ----------------------------------------------------------------------

const protectedRoutes = {
  id: "protected",
  Component: AuthGuard,
  children: [
    // The dynamic layout supports both the main layout and the sideblock.
    {
      Component: DynamicLayout,
      children: [
        {
          index: true,
          element: <Navigate to="/master-setting/user" />,
        },

        //? ===========> Master Settings Module Routes <============
        {
          path: "/master-setting",
          children: [
            // ===========> User Menus <============
            {
              path: "user",
              lazy: async () => ({
                Component: (await import("app/pages/MasterSettings/User"))
                  .default,
              }),
            },

            // ===========> Security Menus <============
            {
              path: "security",
              children: [
                {
                  path: "blocked-ips",
                  lazy: async () => ({
                    Component: (
                      await import(
                        "app/pages/MasterSettings/Security/BlockedIp"
                      )
                    ).default,
                  }),
                },
                {
                  path: "activity-log",
                  lazy: async () => ({
                    Component: (
                      await import(
                        "app/pages/MasterSettings/Security/ActivityLog"
                      )
                    ).default,
                  }),
                },
              ],
            },

            {
              path: "privilege",
              lazy: async () => ({
                Component: (await import("app/pages/MasterSettings/Privilege"))
                  .default,
              }),
            },

            {
              path: "modules",
              lazy: async () => ({
                Component: (await import("app/pages/MasterSettings/Module"))
                  .default,
              }),
            },
            {
              path: "rules",
              lazy: async () => ({
                Component: (await import("app/pages/MasterSettings/Rules"))
                  .default,
              }),
            },
          ],
        },
      ],
    },
    // The app layout supports only the main layout. Avoid using it for other layouts.
    {
      Component: AppLayout,
      children: [
        {
          path: "settings",
          lazy: async () => ({
            Component: (await import("app/pages/settings/Layout")).default,
          }),
          children: [
            {
              index: true,
              element: <Navigate to="/settings/profile" />,
            },
            {
              path: "profile",
              lazy: async () => ({
                Component: (await import("app/pages/settings/sections/Profile"))
                  .default,
              }),
            },
            {
              path: "security",
              lazy: async () => ({
                Component: (
                  await import("app/pages/settings/sections/Security")
                ).default,
              }),
            },
            {
              path: "appearance",
              lazy: async () => ({
                Component: (
                  await import("app/pages/settings/sections/Appearance")
                ).default,
              }),
            },
            {
              path: "sessions",
              lazy: async () => ({
                Component: (
                  await import("app/pages/settings/sections/Sessions")
                ).default,
              }),
            },
            {
              path: "notifications",
              lazy: async () => ({
                Component: (
                  await import("app/pages/ProtectedGhost/Notification")
                ).default,
              }),
            },
          ],
        },
      ],
    },
  ],
};

export { protectedRoutes };
