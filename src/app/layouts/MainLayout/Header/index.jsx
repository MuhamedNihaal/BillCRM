// Import Dependencies
import clsx from "clsx";
import { useEffect, lazy, useState } from "react";
import { useDisclosure } from "hooks";

// Local Imports

import { SidebarToggleBtn } from "components/shared/SidebarToggleBtn";
import { Button } from "components/ui";
import { Notifications } from "components/template/Notifications";
import { Loadable } from "components/shared/Loadable";

import { useThemeContext } from "app/contexts/theme/context";
import { useAuthContext } from "app/contexts/auth/context";

import { toggleFullscreen } from "./config";
import Modules from "./Modules";

import Search from "./Search";

import FullScreenIcon from "assets/header-icon/fullScreen.svg?react";
import ExitFullScreenIcon from "assets/header-icon/exitFullScreen.svg?react";
import PowerIcon from "assets/header-icon/powerIcon.svg?react";
import SettingsIcon from "assets/header-icon/settings.svg?react";

const Customizer = Loadable(
  lazy(() => import("components/template/Customizer")),
);

export function Header() {
  const { cardSkin } = useThemeContext();

  const [isOpen, { open, close }] = useDisclosure();

  const auth = useAuthContext();

  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    function handleFullScreenChange() {
      const fsElement =
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement;

      setIsFullScreen(!!fsElement);
    }

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("mozfullscreenchange", handleFullScreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
    document.addEventListener("MSFullscreenChange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullScreenChange,
      );
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullScreenChange,
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullScreenChange,
      );
    };
  }, []);

  return (
    <>
      <header
        className={clsx(
          "app-header transition-content dark:border-dark-600 sticky top-0 z-20 flex h-[63px] shrink-0 items-center justify-between border-b border-gray-200 bg-white/80 px-(--margin-x) backdrop-blur-sm backdrop-saturate-150",
          cardSkin === "shadow-sm"
            ? "dark:bg-dark-750/80"
            : "dark:bg-dark-900/80",
        )}
      >
        <div className="mr-4 flex items-center space-x-2">
          <SidebarToggleBtn />
        </div>

        <div className="flex items-center gap-x-4 ltr:-mr-1.5 rtl:-ml-1.5">
          <Search menus={auth?.modules || []} />

          <Modules />

          <Button
            className="relative size-5 rounded-full"
            variant="flat"
            isIcon
            onClick={toggleFullscreen}
          >
            {!isFullScreen ? (
              <FullScreenIcon className="size-5 text-[#a3a9b5]" />
            ) : (
              <ExitFullScreenIcon className="size-5 text-[#a3a9b5]" />
            )}
          </Button>

          <Notifications />
          {/* <RightSidebar /> */}
          {/* <LanguageSelector /> */}

          <Button
            onClick={open}
            className="relative size-5 rounded-full"
            variant="flat"
            isIcon
          >
            <span className="settings">
              <SettingsIcon className="size-5" />
            </span>
          </Button>

          <Button
            className="relative size-5 rounded-full mr-2"
            variant="flat"
            isIcon
            onClick={() => auth.logout()}
          >
            <span className="logout">
              <PowerIcon className="size-5" />
            </span>
          </Button>
        </div>
      </header>
      <Customizer isOpen={isOpen} close={close} />
    </>
  );
}
