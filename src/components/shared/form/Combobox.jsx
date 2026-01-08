// Import Dependencies
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Label,
  Transition,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { forwardRef, Fragment, useRef, useState } from "react";
import PropTypes from "prop-types";

// Local Imports
import { Input, InputErrorMsg } from "components/ui";
import {
  useFuse,
  useBoxPosition,
  useBoxSize,
  mergeRefs,
  useClickOutside,
  useDidUpdate,
} from "hooks";
import { Highlight } from "../Highlight";

// ----------------------------------------------------------------------

const CustomCombobox = forwardRef(
  (
    {
      data,
      multiple,
      placeholder,
      label,
      error,
      displayField = "label",
      searchFields = ["label"],
      highlight,
      inputProps,
      emptyMessage = null,
      rootProps,
      required,
      className,
      prefix,
      onCreate = () => {},
      isCreatable = false,
      classNames,
      info,
      anchor = { to: "bottom end", gap: 8 },
      AsyncType,
      onSearch,
      ...rest
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);

    const {
      result: filteredData,
      query,
      setQuery,
    } = useFuse(data, {
      keys: searchFields,
      threshold: 0.2,
      matchAllOnEmptyQuery: true,
    });

    const outSideRef = useClickOutside(() => {
      setIsOpen(false);
      setQuery("");
    });

    const boxSizeRef = useRef();

    const { width: inputWidth } = useBoxSize({ ref: boxSizeRef });
    const { left: inputLeft, ref: boxPositionRef } = useBoxPosition();

    useDidUpdate(() => {
      if (AsyncType && filteredData?.length === 0 && query) {
        onSearch(query);
      }
    }, [filteredData?.length, query]);

    return (
      <div
        className={clsx("flex flex-col", classNames?.root)}
        {...rootProps}
        ref={outSideRef}
      >
        <Combobox
          as="div"
          className={clsx(classNames?.root, className)}
          multiple={multiple}
          onChange={(val) => {
            setIsOpen(false);
            rest?.onChange?.(val);
          }}
          ref={ref}
          {...rest}
        >
          {({ value: selectedValue }) => {
            return (
              <>
                {label && (
                  <Label className={"flex items-center"}>
                    {label}
                    {required && (
                      <span className="ml-1 text-red-600">*</span>
                    )}{" "}
                    {info}
                  </Label>
                )}
                <div
                  ref={mergeRefs(boxPositionRef, boxSizeRef)}
                  className={clsx("relative", label && "mt-1.5")}
                >
                  {multiple ? (
                    <div>
                      <ComboboxButton
                        as="div"
                        onClick={() => setIsOpen(!isOpen)}
                        className={clsx(
                          "relative w-full cursor-default overflow-hidden rounded-lg border text-start outline-hidden transition-colors focus:outline-hidden",
                          error
                            ? "border-error dark:border-error-lighter"
                            : "focus-within:border-primary-600! dark:border-dark-450 dark:focus-within:border-primary-500! dark:hover:border-dark-400 border-gray-300 hover:border-gray-400",
                          rest?.disabled &&
                            "bg-gray-150 dark:border-dark-500 dark:bg-dark-600 cursor-not-allowed border-gray-300 opacity-60",
                        )}
                      >
                        <div className="flex justify-start gap-2 px-3 py-2 ltr:pr-9 rtl:pl-9">
                          {selectedValue.length > 0 && (
                            <div className="flex-3 truncate">
                              {selectedValue
                                ?.map((val) => val?.[displayField])
                                .join(", ")}
                            </div>
                          )}
                          <ComboboxInput
                            as={Input}
                            classNames={{
                              root: "flex-1",
                              input:
                                "dark:placeholder:text-dark-200 placeholder:font-light placeholder:text-gray-600 disabled:cursor-not-allowed",
                            }}
                            unstyled
                            displayValue={(val) => val?.item?.[displayField]}
                            autoComplete="new"
                            placeholder={
                              selectedValue.length === 0 && query === ""
                                ? placeholder
                                : undefined
                            }
                            onChange={(event) => {
                              setIsOpen(true);
                              setQuery(event.target.value);
                            }}
                            value={query}
                            {...inputProps}
                          />
                        </div>

                        <div className="absolute inset-y-0 flex items-center ltr:right-0 ltr:pr-2 rtl:left-0 rtl:pl-2">
                          <ChevronDownIcon
                            className={clsx(
                              "dark:text-dark-300 size-5 text-gray-400 transition-transform",
                              isOpen && "rotate-180",
                            )}
                            aria-hidden="true"
                          />
                        </div>
                      </ComboboxButton>
                      <InputErrorMsg when={error && typeof error !== "boolean"}>
                        {error}
                      </InputErrorMsg>
                    </div>
                  ) : (
                    <div>
                      <ComboboxButton
                        onClick={() => setIsOpen(!isOpen)}
                        className="relative w-full overflow-hidden text-start"
                      >
                        <ComboboxInput
                          as={Input}
                          className={clsx(
                            "cursor-pointer",
                            classNames?.input || "",
                          )}
                          autoComplete="new"
                          error={error}
                          displayValue={(val) => val?.[displayField]}
                          onChange={(event) => {
                            setIsOpen(true);
                            setQuery(event.target.value);
                          }}
                          placeholder={placeholder}
                          prefix={prefix}
                          suffix={
                            <ChevronDownIcon
                              className={clsx(
                                "size-5 transition-transform",
                                isOpen && "rotate-180",
                              )}
                              aria-hidden="true"
                            />
                          }
                          {...inputProps}
                          onKeyDown={(e) => {
                            if (e.code === "Enter" && rest?.value?.value) {
                              setIsOpen(false);
                              setQuery("");
                            }
                          }}
                        />
                      </ComboboxButton>
                      {/* <InputErrorMsg when={error && typeof error !== "boolean"}>
                        {error}
                      </InputErrorMsg> */}
                    </div>
                  )}

                  <Transition
                    show={isOpen}
                    as={Fragment}
                    enter="transition ease-out"
                    enterFrom="opacity-0 translate-y-2"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-2"
                    afterLeave={() => setQuery("")}
                  >
                    <ComboboxOptions
                      anchor={anchor}
                      style={{
                        width: inputWidth,
                        "--left-anchor": `${inputLeft}px`,
                      }}
                      className={clsx(
                        "dark:border-dark-500 dark:bg-dark-750 absolute z-[100] !max-h-80 overflow-x-hidden overflow-y-auto rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden focus-visible:outline-hidden dark:shadow-none",

                        classNames?.options
                          ? classNames?.options
                          : multiple
                            ? "mt-2"
                            : "mt-1 max-md:mt-2",
                      )}
                    >
                      {filteredData.length === 0 && query !== "" ? (
                        <div
                          onClick={() => onCreate(query)}
                          className="dark:text-dark-100 relative cursor-default px-4 py-2 text-gray-800 select-none"
                        >
                          {isCreatable ? "Create" : "Nothing found for"}{" "}
                          {`"${query}"`}
                        </div>
                      ) : filteredData.length === 0 ? (
                        <div className="dark:text-dark-100 relative cursor-default px-4 py-2 text-gray-800 select-none">
                          {emptyMessage ? emptyMessage : "No Data"}
                        </div>
                      ) : (
                        filteredData?.slice(0, 60).map(({ item, refIndex }) => (
                          <ComboboxOption
                            onClick={() => {
                              if (!multiple) {
                                setIsOpen(false);
                                setQuery(false);
                              }
                            }}
                            disabled={item?.disabled}
                            key={refIndex}
                            className={({ selected, active }) =>
                              clsx(
                                "relative cursor-pointer px-4 py-2 outline-hidden transition-colors select-none",
                                active &&
                                  !selected &&
                                  "dark:bg-dark-600 bg-gray-100",
                                selected ||
                                  item.selected ||
                                  rest?.value?.value == item?.value
                                  ? "bg-primary-600 dark:bg-primary-500 text-white"
                                  : "dark:text-dark-100 text-gray-800",
                                item?.disabled &&
                                  "!cursor-not-allowed opacity-60",
                              )
                            }
                            value={item}
                          >
                            {({ selected }) => (
                              <span
                                className={`block truncate ${
                                  selected ? "font-medium" : "font-normal"
                                }`}
                              >
                                {highlight ? (
                                  <Highlight query={query}>
                                    {item?.[displayField]}
                                  </Highlight>
                                ) : (
                                  item?.[displayField]
                                )}
                              </span>
                            )}
                          </ComboboxOption>
                        ))
                      )}
                    </ComboboxOptions>
                  </Transition>
                </div>
              </>
            );
          }}
        </Combobox>
      </div>
    );
  },
);

CustomCombobox.displayName = "Combobox";

CustomCombobox.propTypes = {
  data: PropTypes.array,
  multiple: PropTypes.bool,
  placeholder: PropTypes.node,
  label: PropTypes.node,
  error: PropTypes.oneOfType([PropTypes.bool, PropTypes.node]),
  displayField: PropTypes.string,
  searchFields: PropTypes.node,
  highlight: PropTypes.bool,
  inputProps: PropTypes.object,
  rootProps: PropTypes.object,
  classNames: PropTypes.object,
  className: PropTypes.string,
};

export { CustomCombobox as Combobox };
