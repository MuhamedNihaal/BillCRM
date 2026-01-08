// Import Dependencies
import { Fragment } from "react";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";

// Local Imports
import { Button } from "components/ui";
// import { LayoutGrid } from "lucide-react";
import { useAuthContext } from "app/contexts/auth/context";

import { Link, useLocation } from "react-router";
import clsx from "clsx";
import { isRouteActive } from "utils/isRouteActive";

// import ModuleIcon from "assets/module.svg?react";

import { TbBrandWindows } from "react-icons/tb";
import DynamicIcon from "components/DynamicIcon";
import { useSidebarContext } from "app/contexts/sidebar/context";

// ----------------------------------------------------------------------

export default function Modules() {
  const auth = useAuthContext();

  const { open } = useSidebarContext();

  const { pathname } = useLocation();

  return (
    <Popover className="relative">
      <PopoverButton
        as={Button}
        isIcon
        className="relative size-9 rounded-full"
        variant="flat"
      >
        <TbBrandWindows className="size-6 text-[#6b7280]" />
        {/* <ModuleIcon className="size-6 text-[#8f939c]" /> */}
      </PopoverButton>
      <Transition
        as={Fragment}
        enter="transition ease-out"
        enterFrom="opacity-0 translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-2"
      >
        <PopoverPanel
          anchor={{ to: "bottom center", gap: 15 }}
          className="ring-primary-500/50 dark:border-dark-500 dark:bg-dark-750 z-[100] w-fit overflow-hidden rounded-md border border-gray-300 bg-white shadow-lg shadow-gray-200/50 outline-none focus-visible:ring focus-visible:outline-none dark:shadow-none"
        >
          <div className="relative grid grid-cols-3 divide-x divide-y divide-gray-200 rounded-lg">
            {auth.modules.map((item) => (
              <Link
                key={item.title}
                to={item.path}
                className={clsx(
                  "p-1.5 last:border-r",
                  isRouteActive(item.path, pathname) &&
                    "bg-primary-600/10 text-primary-600 dark:bg-primary-400/15 dark:text-primary-400",
                )}
                onClick={open}
              >
                <div className="group hover:bg-primary-600/10 flex h-24 w-28 flex-col items-center justify-center rounded-xl p-1 transition duration-150 ease-in-out focus:outline-none">
                  <div className="group-hover:text-primary-500 flex size-10 items-center justify-center">
                    <DynamicIcon name={item.Icon} />
                  </div>
                  <p className="group-hover:text-primary-500 mt-2 text-center font-medium text-wrap">
                    {item.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </PopoverPanel>
      </Transition>
    </Popover>
  );
}
