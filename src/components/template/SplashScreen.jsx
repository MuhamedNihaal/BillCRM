// Local Imports
import Logo from "assets/srv.svg?react";
import { Progress } from "components/ui";

// ----------------------------------------------------------------------

export function SplashScreen() {
  return (
    <div className="fixed grid h-full w-full place-content-center">
      <Logo className="size-28 text-black dark:text-white" />
      <Progress
        color="primary"
        isIndeterminate
        animationDuration="1s"
        className="mt-2 h-1"
      />
    </div>
  );
}
