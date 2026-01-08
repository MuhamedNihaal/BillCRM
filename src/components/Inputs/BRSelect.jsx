/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";

import { InputErrorMsg } from "components/ui";
import { get, truncate } from "utility";

// React Select
import ReactSelect, { components } from "react-select";
import CreatableSelect from "react-select/creatable";
import AsyncSelect from "react-select/async";
import AsyncCreatableSelect from "react-select/async-creatable";
import { Controller } from "react-hook-form";
import { cn } from "lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useUncontrolled } from "hooks";
import clsx from "clsx";

const BRSelect = ({
  type,
  name,
  label,
  placeholder,
  error,
  handleOnChange,
  defaultValue,
  value,
  classNames,
  className,
  options: userOptions = null,
  isMulti = false,
  id = true,

  loadOptionsUrl = "",

  cacheOptions = false,
  onCreateOption = null,
  disabled,
  prefix,
  suffix,
  ...props
}) => {
  let [options, setOptions] = useState([]);
  const [_value, onChange] = useUncontrolled({ defaultValue, value });
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (userOptions) {
      setOptions(userOptions);
    }
  }, [userOptions]);

  const timeoutRef = useRef(null);
  const debouncedLoadOptions = useCallback(
    (inputValue, callback) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        try {
          const trimmedUrl = loadOptionsUrl?.trim() || "";
          let url = trimmedUrl.endsWith("?")
            ? `${trimmedUrl}search=${inputValue}`
            : `${trimmedUrl}${trimmedUrl.includes("?") ? "&" : "?"}search=${inputValue}`;

          const { data } = await get(url);
          callback(data);

          setOptions((prev) => {
            const existingValues = new Set(
              prev.map((opt) => String(opt.value).toLowerCase()),
            );
            const newOptions = data.filter(
              (opt) => !existingValues.has(String(opt.value).toLowerCase()),
            );

            return [...prev, ...newOptions];
          });
        } catch (error) {
          console.error("Error loading options from:", loadOptionsUrl, error);
          callback([]);
        }
      }, 300);
    },
    [loadOptionsUrl],
  );

  const getSelected = useCallback(
    (value) => {
      if (!String(value)) return isMulti ? [] : "";
      if (!id) return value;
      if (isMulti) {
        return options.filter((option) => {
          const optionValue = String(option.value).toLowerCase();
          const valueArray = value?.map((v) => String(v).toLowerCase()) ?? [];
          return valueArray.includes(optionValue);
        });
      } else {
        if (typeof value === "object" && value?.label && value?.value) {
          return value;
        }

        let selected =
          options.find(
            (option) =>
              String(option.value).toLowerCase() ===
              String(value).toLowerCase(),
          ) || null;

        return selected;
      }
    },
    [id, isMulti, options],
  );

  let Component = null;
  if (props.async && typeof onCreateOption === "function") {
    Component = AsyncCreatableSelect;
  } else if (props.async) {
    Component = AsyncSelect;
  } else if (typeof onCreateOption === "function") {
    Component = CreatableSelect;
  } else {
    Component = ReactSelect;
  }

  const renderInput = (field) => {
    let { value, onChange, ...rest } = field;

    const affixClass = clsx(
      "absolute top-0 flex h-full w-9 items-center justify-center transition-colors",
      error
        ? "text-error dark:text-error-light"
        : "peer-focus:text-primary-600 dark:text-dark-300 dark:peer-focus:text-primary-500 text-gray-400",
    );

    return (
      <div className={cn("flex w-full flex-col", className, classNames?.root)}>
        {label && (
          <label className={"mb-1.5 flex items-center capitalize"}>
            {label}
            {props?.required && <span className="ml-1 text-red-600">*</span>}
          </label>
        )}

        <div
          className={clsx(
            "relative w-full rounded-lg border",
            suffix && "ltr:pr-7 rtl:pl-7",
            prefix && "ltr:pl-7 rtl:pr-7",
            cn(
              error
                ? "border-error dark:border-error-lighter"
                : isFocused
                  ? "border-primary-600 dark:border-primary-500"
                  : "dark:border-dark-450 dark:hover:border-dark-400 border-gray-300 hover:border-gray-400",
              classNames?.input,
            ),
          )}
        >
          {prefix && (
            <div
              className={clsx(
                "prefix ltr:left-0 rtl:right-0",
                affixClass,
                classNames?.prefix,
              )}
            >
              {prefix}
            </div>
          )}

          {suffix && (
            <div
              className={clsx(
                "suffix ltr:right-0 rtl:left-0",
                affixClass,
                classNames?.suffix,
              )}
              id="dropdown-root"
            >
              {suffix}
            </div>
          )}
          <Component
            {...props}
            {...rest}
            className="react-select-container"
            classNamePrefix="react-select"
            menuPosition="fixed"
            required={false}
            {...(typeof onCreateOption === "function" && { onCreateOption })}
            // closeMenuOnSelect={props?.closeMenuOnSelect}
            menuPortalTarget={document.body}
            // menuPortalTarget={document.getElementById("dropdown-root")}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...(props.async
              ? {
                  defaultOptions: options,
                  loadOptions: debouncedLoadOptions,
                  cacheOptions: cacheOptions,
                }
              : { options })}
            isMulti={isMulti}
            name={name}
            placeholder={placeholder}
            isDisabled={disabled}
            value={getSelected(value)}
            onChange={(val) => {
              let obj = val;

              let target = { name, value: obj };

              if (id) {
                target.value = isMulti
                  ? val?.map((item) => item.value)
                  : val?.value;
                target.obj = val;
              }

              handleOnChange(target);
              onChange(target.value);
            }}
            noOptionsMessage={({ inputValue }) => {
              const msg = !inputValue
                ? props.emptyMessage
                  ? props.emptyMessage
                  : "No options available"
                : `Nothing found for "${truncate(inputValue, 10)}"`;

              return msg;
            }}
            isClearable={props.isClearable}
            components={{ Menu: AnimatedMenu, Option: TooltipOption }}
            classNames={{
              control: ({ isDisabled }) =>
                cn(
                  "min-h-[36px]! !rounded-lg !border-none !bg-transparent !shadow-none !outline-hidden !transition-colors !duration-200 ease-in-out",
                  // "dark:!border-dark-450 !border-gray-300",
                  // isFocused && "border-primary-600! dark:border-primary-500!",
                  classNames?.control,
                  error && "!border-error !dark:border-error-lighter",
                  isDisabled &&
                    "bg-gray-150! dark:border-dark-500! dark:bg-dark-600! cursor-not-allowed! border-gray-300! opacity-60!",
                ),

              placeholder: () =>
                cn(
                  "dark:!text-dark-200 truncate! !font-light text-nowrap! !text-gray-600",
                  classNames?.placeholder,
                ),
              menuPortal: () => "!z-[120]",
              option: ({ isSelected, isFocused }) =>
                cn(
                  "!cursor-pointer !px-4 !py-2 !outline-hidden !transition-colors !select-none",
                  isFocused && "dark:!bg-dark-600 !bg-gray-100",
                  isSelected &&
                    "!bg-primary-600 dark:!bg-primary-500 !text-white",
                ),
              input: () =>
                "transition-color! !text-start !text-black dark:text-white!",
              noOptionsMessage: () => "!text-black dark:text-white!",
              singleValue: () =>
                "transition-color! !text-start !text-black dark:text-white!",
              menu: () =>
                "dark:border-dark-500! dark:bg-dark-750! !absolute !translate-y-0 !rounded-lg border! border-gray-300! bg-white! py-1! !opacity-100 shadow-lg! shadow-gray-200/50! outline-hidden! !transition !duration-300 !ease-out focus-visible:outline-hidden! dark:shadow-none!",
              menuList: () => "overflow-x-hidden!",
              clearIndicator: () => "!text-dark-500 dark:text-white!",
              dropdownIndicator: () => "!text-dark-500 dark:text-white!",
              multiValueRemove: () =>
                "hover:!stroke-primary-900 hover:!fill-primary-500",
              multiValueLabel: () => "text-dark-500! dark:text-white!",
              multiValue: () =>
                "dark:border-dark-500! dark:bg-dark-750! overflow-hidden! rounded-lg! border! border-gray-300! bg-white!",
              loadingIndicator: () => "!text-dark-500 dark:text-white!",
              loadingMessage: () => "!text-dark-500 dark:text-white!",
            }}
          />
        </div>
        <InputErrorMsg when={error}>{error}</InputErrorMsg>
      </div>
    );
  };

  if (props.control) {
    return (
      <Controller
        name={name}
        control={props.control}
        // defaultValue={defaultValue}
        render={({ field }) => {
          return renderInput(field);
        }}
      />
    );
  }

  return renderInput({
    value: _value,
    onChange,
  });
};

export default BRSelect;

const AnimatedMenu = (props) => {
  return (
    <AnimatePresence>
      {props.selectProps.menuIsOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { duration: 0.1, ease: "easeOut" },
          }}
          exit={{
            opacity: 0,
            y: 8,
            transition: { duration: 0.2, ease: "easeIn" },
          }}
        >
          <components.Menu {...props} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const TooltipOption = (props) => {
  return (
    <components.Option {...props}>
      <div
        className="group relative"
        data-tooltip
        data-tooltip-content={props?.data?.label}
      >
        {props.children}
      </div>
    </components.Option>
  );
};
