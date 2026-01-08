import { Button, Skeleton } from "components/ui";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import {
  ChevronRightIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Link, useLocation } from "react-router";
import { Swap, SwapOff, SwapOn } from "components/ui";
import DynamicIcon from "./DynamicIcon";
import { useEffect, useState } from "react";

/**
 * @typedef {Object} Option
 * @property {boolean} [active] - Whether the option is active (for Swap toggle)
 * @property {React.ComponentType} [SwapOn] - Icon component for active state
 * @property {React.ComponentType} [SwapOff] -  Icon component for inactive state
 * @property {React.ComponentType} [icon] - Fallback icon (if SwapOn/SwapOff not provided)
 * @property {string} label - Label of the button
 * @property {() => void} onClick - Action triggered on click
 */

/**
 * @typedef {Object} MenuItem
 * @property {string} label - Label of the menu item
 * @property {React.ComponentType} [icon] - Icon component for the menu item
 * @property {() => void} [onClick] - Action triggered on click
 */

/**
 * Breadcrumb component
 *
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.breadcrumbName - Its Replace params name
 * @param {Option[]} [props.options] - List of option buttons
 * @param {MenuItem[]} [props.menus] - Dropdown menu items
 * @param {boolean} [props.show=false] - Whether to show breadcrumb segments
 * @returns {JSX.Element}
 */
const Breadcrumb = ({
  title,
  options = [],
  menus = [],
  show = false,
  breadcrumbName = null,
  ...props
}) => {
  let location = useLocation().pathname.split("/");

  let [loading, setLoading] = useState(true);

  let segments = location.slice(2);

  useEffect(() => {
    if (breadcrumbName) {
      setLoading(false);
    }
  }, [breadcrumbName]);

  return (
    <div className="relative flex flex-col items-start justify-between">
      <div className="flex items-center space-x-4 max-sm:flex-col max-sm:items-start max-sm:space-y-2">
        <h2 className="dark:text-dark-50 truncate text-xl font-medium tracking-wide text-gray-800 capitalize max-sm:text-lg">
          {title}
        </h2>

        {show && (
          <>
            <div className="hidden self-stretch py-1 sm:flex">
              <div className="dark:bg-dark-600 h-full w-px bg-gray-300"></div>
            </div>
            <ul className="flex flex-wrap items-center gap-1.5 max-sm:hidden">
              {segments.map((segment, idx) => {
                let finalSegment = segment.replace(/[-_]/g, " ");
                const isLast = idx === segments.length - 1;

                return (
                  <li className="flex items-center gap-1.5" key={idx}>
                    {!isLast ? (
                      <>
                        <Link
                          to={`/${location[1]}/${segments
                            .slice(0, idx + 1)
                            .join("/")}`}
                          className={clsx(
                            idx == 0
                              ? "text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500 active tracking-wide capitalize transition-colors"
                              : "hover:text-primary-700 dark:hover:text-primary-500 tracking-wide text-gray-600 capitalize dark:text-gray-300",
                          )}
                          data-discover="true"
                        >
                          {decodeURIComponent(finalSegment)}
                        </Link>
                        <ChevronRightIcon className="size-4 stroke-1" />
                      </>
                    ) : (
                      <span className="tracking-wide text-gray-600 capitalize dark:text-gray-300">
                        {typeof breadcrumbName === "string" ? (
                          loading ? (
                            <Skeleton className="h-3 w-32" />
                          ) : (
                            breadcrumbName
                          )
                        ) : (
                          decodeURIComponent(finalSegment)
                        )}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {props.children && <div>{props.children}</div>}
      </div>

      <div className="absolute right-0 flex space-x-2">
        {options.length > 0
          ? options.map((option, idx) => (
              <Button
                key={idx}
                variant="outlined"
                onClick={() => {
                  if (typeof option.onClick === "function") {
                    option.onClick();
                  }
                }}
                className="h-8 space-x-2 rounded-md px-3 text-xs"
              >
                {option.SwapOn && option.SwapOff ? (
                  <Swap
                    value={option.active ? "on" : "off"}
                    defaultValue={option.active ? "on" : "off"}
                    effect="rotate"
                  >
                    <SwapOn>
                      {typeof option?.SwapOn === "string" ? (
                        <DynamicIcon
                          name={option?.SwapOn}
                          className="size-4 stroke-1"
                        />
                      ) : (
                        <option.SwapOn className="size-4 stroke-1" />
                      )}
                    </SwapOn>
                    <SwapOff>
                      {typeof option?.SwapOff === "string" ? (
                        <DynamicIcon
                          name={option?.SwapOff}
                          className="size-4 stroke-1"
                        />
                      ) : (
                        <option.SwapOff className="size-4 stroke-1" />
                      )}
                    </SwapOff>
                  </Swap>
                ) : option.icon ? (
                  typeof option?.icon === "string" ? (
                    <DynamicIcon
                      name={option?.icon}
                      className="size-4 stroke-1"
                    />
                  ) : (
                    <option.icon className="size-4 stroke-1" />
                  )
                ) : null}

                <span>{option?.label || ""}</span>
              </Button>
            ))
          : null}

        {menus?.length > 0 ? (
          <Menu
            as="div"
            className="relative inline-block text-left whitespace-nowrap"
          >
            <MenuButton
              as={Button}
              variant="outlined"
              className="h-8 shrink-0 rounded-md px-2.5"
            >
              <EllipsisHorizontalIcon className="size-4.5" />
            </MenuButton>

            <Transition
              as={MenuItems}
              enter="transition ease-out"
              enterFrom="opacity-0 translate-y-2"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-2"
              className="dark:border-dark-500 dark:bg-dark-700 absolute z-100 mt-1.5 min-w-[10rem] rounded-lg border border-gray-300 bg-white py-1 whitespace-nowrap shadow-lg shadow-gray-200/50 outline-hidden focus-visible:outline-hidden ltr:right-0 rtl:left-0 dark:shadow-none"
            >
              {menus.map((menu, idx) => (
                <MenuItem key={idx}>
                  {({ focus }) => (
                    <button
                      className={clsx(
                        "dark:text-dark-50 btn-base flex h-7 w-full items-center gap-2 px-3 text-xs tracking-wide text-gray-900 outline-hidden transition-colors",
                        focus &&
                          "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800",
                      )}
                      onClick={() => {
                        if (typeof menu.onClick === "function") {
                          menu.onClick();
                        }
                      }}
                    >
                      {menu.icon &&
                        (typeof menu.icon === "string" ? (
                          <DynamicIcon
                            name={menu.icon}
                            className="size-4 stroke-1"
                          />
                        ) : (
                          menu.icon
                        ))}
                      <span>{menu?.label || ""}</span>
                    </button>
                  )}
                </MenuItem>
              ))}
            </Transition>
          </Menu>
        ) : null}
      </div>
    </div>
  );
};

export default Breadcrumb;
