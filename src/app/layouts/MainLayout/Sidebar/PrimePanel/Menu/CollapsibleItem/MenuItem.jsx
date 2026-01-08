// Import Dependencies
import PropTypes from "prop-types";
import clsx from "clsx";
import { NavLink, useRouteLoaderData } from "react-router";

// Local Imports
import { Badge } from "components/ui";
import { useBreakpointsContext } from "app/contexts/breakpoint/context";
import { useSidebarContext } from "app/contexts/sidebar/context";
import { useTranslation } from "react-i18next";
import DynamicIcon from "components/DynamicIcon";

export function MenuItem({ data }) {
  const { transKey, path, id } = data;

  const { lgAndDown } = useBreakpointsContext();
  const { close } = useSidebarContext();
  const { t } = useTranslation();

  const title = t(transKey) || data.title;
  const info = useRouteLoaderData("root")?.[id]?.info;

  const handleMenuItemClick = () => lgAndDown && close();

  return (
    <NavLink
      to={path}
      onClick={handleMenuItemClick}
      id={id}
      className={({ isActive }) =>
        clsx(
          "text-xs-plus flex cursor-pointer items-center justify-between px-2 tracking-wide outline-hidden transition-[color,padding-left,padding-right] duration-300 ease-in-out hover:ltr:pl-4 hover:rtl:pr-4",
          isActive
            ? "text-primary-600 dark:text-primary-400 font-medium"
            : "dark:text-dark-200 dark:hover:text-dark-50 dark:focus:text-dark-50 text-gray-600 hover:text-gray-900 focus:text-gray-900",
        )
      }
    >
      {({ isActive }) => (
        <div
          data-menu-active={isActive}
          className="flex min-w-0 items-center justify-between"
          style={{ height: "34px" }}
        >
          <div className="flex min-w-0 items-center space-x-2">
            <DynamicIcon
              name={data.icon}
              className={clsx(
                open
                  ? "text-this dark:text-this-light"
                  : "dark:text-dark-300 dark:group-hover:text-dark-200 dark:group-focus:text-dark-200 text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500",
                "size-4.5 transition-colors",
              )}
            />
            <span className="truncate">{title}</span>
          </div>
          {info && info.val && (
            <Badge
              color={info.color}
              className="h-5 min-w-[1.25rem] shrink-0 rounded-full p-[5px]"
            >
              {info.val}
            </Badge>
          )}
        </div>
      )}
    </NavLink>
  );
}

MenuItem.propTypes = {
  data: PropTypes.object,
};
