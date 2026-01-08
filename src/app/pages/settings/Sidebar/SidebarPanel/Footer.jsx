// Import Dependencies
import { Radio, RadioGroup } from "@headlessui/react";
import {
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

// Local Imports
import { Button } from "components/ui";
import { useThemeContext } from "app/contexts/theme/context";
import Copyright from "app/layouts/Copyright";

// ----------------------------------------------------------------------

export function Footer() {
  const { themeMode, setThemeMode } = useThemeContext();

  return (
    <div className="flex flex-col px-4 py-3">
      <Copyright icon={true} />

      <RadioGroup
        value={themeMode}
        onChange={setThemeMode}
        className="dark:bg-dark-700 dark:text-dark-200 mt-4 flex w-max min-w-full rounded-lg bg-gray-200 px-1.5 py-1 text-gray-600"
      >
        <Radio
          value="system"
          className={({ checked }) =>
            clsx(
              "flex-1 shrink-0 rounded-lg px-3 py-1.5 font-medium whitespace-nowrap",
              checked
                ? "dark:bg-dark-500 dark:text-dark-100 bg-white shadow-sm"
                : "dark:hover:text-dark-100 dark:focus:text-dark-100 hover:text-gray-800 focus:text-gray-800",
            )
          }
          as={Button}
          unstyled
        >
          <ComputerDesktopIcon className="size-5" />
        </Radio>
        <Radio
          value="light"
          className={({ checked }) =>
            clsx(
              "flex-1 shrink-0 rounded-lg px-3 py-1.5 font-medium whitespace-nowrap",
              checked
                ? "dark:bg-dark-500 dark:text-dark-100 bg-white shadow-sm"
                : "dark:hover:text-dark-100 dark:focus:text-dark-100 hover:text-gray-800 focus:text-gray-800",
            )
          }
          as={Button}
          unstyled
        >
          <SunIcon className="size-5" />
        </Radio>
        <Radio
          value="dark"
          className={({ checked }) =>
            clsx(
              "flex-1 shrink-0 rounded-lg px-3 py-1.5 font-medium whitespace-nowrap",
              checked
                ? "dark:bg-dark-500 dark:text-dark-100 bg-white shadow-sm"
                : "dark:hover:text-dark-100 dark:focus:text-dark-100 hover:text-gray-800 focus:text-gray-800",
            )
          }
          as={Button}
          unstyled
        >
          <MoonIcon className="size-5" />
        </Radio>
      </RadioGroup>
    </div>
  );
}
