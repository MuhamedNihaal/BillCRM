// Import Dependencies
import PropTypes from "prop-types";
import { NavLink, useRouteLoaderData } from "react-router";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

// Local Imports
import { useBreakpointsContext } from "app/contexts/breakpoint/context";
import { useSidebarContext } from "app/contexts/sidebar/context";
import { Badge } from "components/ui";
import DynamicIcon from "components/DynamicIcon";
import { Divider } from "./Divider";
// ----------------------------------------------------------------------

export function MenuItem({ data }) {
  const { path, transKey, id } = data;
  const { t } = useTranslation();
  const { lgAndDown } = useBreakpointsContext();
  const { close } = useSidebarContext();
  const title = t(transKey) || data.title;

  const info = useRouteLoaderData("root")?.[id]?.info;

  const handleMenuItemClick = () => lgAndDown && close();

  return (
    <>
      <NavLink
        to={path}
        onClick={handleMenuItemClick}
        className={({ isActive }) =>
          clsx(
            "group outline-hidden transition-colors duration-300 ease-in-out",
            isActive
              ? "text-primary-600 dark:text-primary-400 font-medium"
              : "dark:text-dark-200 dark:hover:text-dark-50 text-gray-600 hover:text-gray-900",
          )
        }
      >
        {({ isActive }) => (
          <div
            data-menu-active={isActive}
            style={{ height: "34px" }}
            className="text-xs-plus flex items-center justify-between tracking-wide"
          >
            <div className="flex space-x-2">
              <DynamicIcon
                name={data?.icon}
                className={clsx(
                  open
                    ? "text-this dark:text-this-light"
                    : "dark:text-dark-200 dark:group-hover:text-dark-100 dark:group-focus:text-dark-100 text-gray-500 group-hover:text-gray-600 group-focus:text-gray-600",
                  "size-4.5 transition-colors",
                )}
              />
              <span className="mr-1 truncate"> {title}</span>
            </div>
            {info && info.val && (
              <Badge
                color={info.color}
                variant="soft"
                className="text-tiny-plus h-4.5 min-w-[1rem] shrink-0 p-[5px]"
              >
                {info.val}
              </Badge>
            )}
          </div>
        )}
      </NavLink>

      {data?.divider && <Divider />}
    </>
  );
}

MenuItem.propTypes = {
  data: PropTypes.object,
};
