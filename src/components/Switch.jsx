import { CheckIcon, ClockIcon, XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Switch } from "@headlessui/react";
import { toast } from "sonner";

const CustomSwitch = ({
  onChange,
  status,
  expired = false,
  error = null,
  disabled,
}) => {
  return (
    <Switch
      disabled={disabled}
      checked={status}
      onChange={(e) => {
        if (expired && error) {
          toast.error(error);
        }

        if (!expired) onChange(e);
      }}
      className={clsx(
        "relative inline-flex h-6 w-12 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors duration-200 ease-in-out outline-none focus:outline-none",
        status
          ? "this:primary bg-this dark:bg-this-light"
          : "dark:bg-surface-1 bg-gray-300",
        expired && "!bg-orange-500",
        disabled && "cursor-not-allowed! opacity-50"
      )}
      {...(expired && {
        "data-tooltip": true,
        "data-tooltip-content": `Expired`,
      })}
    >
      <span className="sr-only">Switch</span>
      <span
        aria-hidden="true"
        className={`${
          status
            ? "translate-x-6 bg-white rtl:-translate-x-6"
            : "dark:bg-dark-50 translate-x-0 bg-white"
        } pointer-events-none flex size-4 transform items-center justify-center rounded-full shadow-lg ring-0 transition duration-200 ease-in-out`}
      >
        {expired ? (
          <ClockIcon
            className="size-3 text-orange-500"
            style={{ strokeWidth: "3" }}
          />
        ) : status ? (
          <CheckIcon
            className="text-primary-500 size-3"
            style={{ strokeWidth: "3" }}
          />
        ) : (
          <XMarkIcon
            className="dark:text-dark-400 size-3 text-gray-500"
            style={{ strokeWidth: "3" }}
          />
        )}
      </span>
    </Switch>
  );
};

export default CustomSwitch;
