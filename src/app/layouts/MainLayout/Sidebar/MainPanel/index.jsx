// Import Dependencies
import PropTypes from "prop-types";
import { Link } from "react-router";
import clsx from "clsx";

// Local Imports
import Logo from "assets/sm_logo.svg?react";
import { Menu } from "./Menu";
// import { Item } from "./Menu/Item";
import { Profile } from "../../Profile";
import { useThemeContext } from "app/contexts/theme/context";
import { useSidebarContext } from "app/contexts/sidebar/context";
// import { settings } from "app/navigation/settings";

// ----------------------------------------------------------------------

export function MainPanel({ nav, setActiveSegment, activeSegment }) {
  const { open } = useSidebarContext();
  const { cardSkin } = useThemeContext();

  return (
    <div
      className="main-panel"
      onMouseEnter={() => {
        open();
      }}
    >
      <div
        // ref={ref}
        // onMouseEnter={isHovered}
        className={clsx(
          "border-gray-150 dark:border-dark-600/80 flex h-full w-[65px] flex-col items-center bg-white ltr:border-r rtl:border-l",
          cardSkin === "shadow-sm" ? "dark:bg-dark-750" : "dark:bg-dark-900",
        )}
      >
        {/* Application Logo */}
        <div className="flex pt-3.5">
          <Link to="/">
            <Logo className="text-dark size-8 dark:text-white" />
          </Link>
        </div>

        <Menu
          nav={nav}
          activeSegment={activeSegment}
          setActiveSegment={setActiveSegment}
        />

        {/* Bottom Links */}
        <div className="flex flex-col items-center space-y-3 py-2.5">
          {/* <Item
            id={settings.id}
            component={Link}
            to="/settings/appearance"
            title={"Settings"}
            isActive={activeSegment === settings.path}
            Icon={settings.Icon}
          /> */}
          <Profile />
        </div>
      </div>
    </div>
  );
}

MainPanel.propTypes = {
  nav: PropTypes.array,
  setActiveSegment: PropTypes.func,
  activeSegment: PropTypes.string,
};
