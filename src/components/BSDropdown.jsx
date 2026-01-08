import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import { useUncontrolled } from "hooks";
import { memo } from "react";
import { Tag } from "./ui";
import { cn } from "lib/utils";
import clsx from "clsx";
import { CheckIcon } from "lucide-react";

/**
 * @typedef ClassNames
 * @property {string} [label]
 * @property {string} [labelIcon]
 * @property {string} [transition]
 * @property {string} [options]
 * @property {string} [optionItem]
 * @property {string} [optionItemIcon]
 * @property {string} [optionItemIcon]
 */

/**
 * @param {Object} props
 * @param {object|object[]} [props.defaultValue]
 * @param {object|object[]} [props.value]
 * @param {Option[]} props.options
 * @param {ClassNames} [props.classNames]
 */
const BSDropdown = ({ defaultValue, value, options, classNames, ...props }) => {
  const [_value, onChange] = useUncontrolled({
    defaultValue,
    value,
  });

  let inputRender = (field) => {
    let { value, onChange, ...rest } = field;

    return (
      <Listbox
        value={value}
        onChange={(e) => {
          onChange(e);
        }}
        {...rest}
      >
        <ListboxButton
          as={Tag}
          component="button"
          disabled={props?.disabled}
          color={props?.color || value?.color || "info"}
          className={clsx("cursor-pointer justify-start items-center space-x-2", classNames?.label)}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          {value?.icon ? (
            <value.icon className={cn("h-4 w-4", classNames?.labelIcon)} />
          ) : null}
          <span>{value?.label || ""}</span>
        </ListboxButton>

        {options?.length > 0 && (
          <Transition
            as={ListboxOptions}
            enter="transition ease-out"
            enterFrom="opacity-0 translate-y-2"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-2"
            anchor={{ to: "bottom end", gap: "8px" }}
            className={cn(
              "text-xs-plus shadow-soft dark:border-dark-500 dark:bg-dark-750 z-100 max-h-60 w-44 overflow-auto rounded-lg border border-gray-300 bg-white py-1 capitalize outline-hidden focus-visible:outline-hidden dark:shadow-none",
              classNames?.transition,
            )}
          >
            {options.map((item, idx) => (
              <ListboxOption
                key={idx}
                value={item}
                className={({ focus }) =>
                  cn(
                    clsx(
                      "dark:text-dark-100 relative flex cursor-pointer items-center justify-between space-x-2 px-3 py-2 text-gray-800 outline-hidden transition-colors select-none",
                      focus && "dark:bg-dark-600 bg-gray-100",
                    ),
                    classNames?.options,
                  )
                }
              >
                <div
                  className={cn(
                    "flex h-3 w-full items-center justify-between gap-4",
                    classNames?.optionItem,
                  )}
                >
                  <div className="flex items-center gap-2">
                    {item?.icon && (
                      <item.icon
                        className={cn("size-4", classNames?.optionItemIcon)}
                      />
                    )}
                    <span className="block max-w-[99px] truncate">
                      {item?.label}
                    </span>
                  </div>
                  {item?.value === value?.value && (
                    <CheckIcon className="-mr-1 size-4.5 stroke-1" />
                  )}
                </div>
              </ListboxOption>
            ))}
          </Transition>
        )}
      </Listbox>
    );
  };

  return inputRender({
    value: _value,
    onChange,
  });
};

export default memo(BSDropdown);
