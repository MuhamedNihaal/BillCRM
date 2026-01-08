import AuthGuard from "middleware/AuthGuard";
import { DynamicLayout } from "app/layouts/DynamicLayout";

const protectedGhost = {
  id: "protectedGhost",
  Component: AuthGuard,
  children: [
    {
      Component: DynamicLayout,
      children: [
        {
          path: "/notifications",
          lazy: async () => ({
            Component: (await import("app/pages/ProtectedGhost/Notification"))
              .default,
          }),
        },
      ],
    },
  ],
};

export { protectedGhost };
