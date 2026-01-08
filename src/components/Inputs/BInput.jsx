import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import Cleave from "cleave.js/react";
import clsx from "clsx";
import DynamicIcon from "components/DynamicIcon";
import { DatePicker } from "components/shared/form/Datepicker";
import { Button, Input } from "components/ui";
import { mergeRefs, useUncontrolled } from "hooks";
import { Calendar } from "lucide-react";
import moment from "moment";
import { Fragment, useRef } from "react";
import { Controller } from "react-hook-form";

const normalizeDate = (input) => {
  if (!input) return null;

  if (input instanceof Date) {
    return moment(input).format("DD-MM-YYYY");
  }

  if (typeof input === "string") {
    if (input.toLowerCase() === "today") {
      return moment().format("DD-MM-YYYY");
    }
    if (input.toLowerCase() === "yesterday") {
      return moment().subtract(1, "day").format("DD-MM-YYYY");
    }

    return moment(input, "DD-MM-YYYY").format("DD-MM-YYYY");
  }

  return null;
};

/**
 * @typedef {Object} BaseProps
 * @property {"text"|"date"|"amount"|"duration"|"file"|"time"} [type="text"]
 * @property {string} [placeholder=""]
 * @property {string} [label=""]
 * @property {string} [name=""]
 * @property {any} [defaultValue]
 * @property {boolean} [disabled]
 * @property {string} [error]
 * @property {any} [value]
 * @property {(value: object) => void} [handleOnChange]
 */

/**
 * @typedef {Object} DateProps
 * @property {"date"} type
 * @property {string | Date | (() => Date)} [minDate] - Minimum selectable date.
 *   - Format: "YYYY-MM-DD" (e.g., "2023-01-01")
 *   - Keywords: "today", "yesterday"
 *   - Or a Date object (e.g., new Date())
 *
 * @property {string | Date | (() => Date)} [maxDate] - Maximum selectable date.
 *   - Format: "DD-MM-YYYY" (e.g., "31-12-2023")
 *   - Keywords: "today", "yesterday"
 *   - Or a Date object (e.g., new Date())
 * @property {object} [props.options] - Select Options
 */

/**
 * @typedef {Object} AmountProps
 * @property {"amount"} type
 * @property {object} [props.min] - min amount limit
 * @property {object} [props.max] - max amount limit
 */

/**
 * @typedef {BaseProps | DateProps | AmountProps} Props
 */

/**
 * @param {Props} props
 */

const BInput = ({
  type,
  name,
  label,
  placeholder,
  error,
  handleOnChange,
  defaultValue,
  value,
  showCount = false,
  required,
  ...props
}) => {
  const [_value, handleChange] = useUncontrolled({ defaultValue, value });
  const inputRef = useRef(null);

  const minDateFinal = normalizeDate(props?.minDate);
  const maxDateFinal = normalizeDate(props?.maxDate);

  delete props.src;
  delete props.srcType;
  delete props.toolbarOptions;
  delete props.rows;
  delete props.options;
  delete props.id;
  delete props.anchor;
  delete props.isMulti;
  delete props.inline;
  delete props.searchFields;
  delete props.emptyMessage;
  delete props.async;
  delete props.cacheOptions;
  delete props.isClearable;
  delete props.preCall;
  delete props.closeMenuOnSelect;
  delete props.onCreateOption;
  delete props.loadOptionsUrl;
  delete props.minDate;
  delete props.maxDate;

  const renderInput = (fields) => {
    let { value, onChange, ...rest } = fields;

    if (
      type === "date" &&
      value &&
      moment(value, "YYYY-MM-DD", true).isValid()
    ) {
      value = moment(value, "YYYY-MM-DD").format("DD-MM-YYYY");
    }

    let letterCount =
      type === "text" ? value?.replace(/\s+/g, " ")?.trim()?.length || 0 : 0;

    return (
      <Input
        {...props}
        disabled={props.disabled}
        className={props?.className}
        classNames={props?.classNames}
        {...(!["duration", "amount", "date"].includes(type) && {
          ...rest,
          type,
        })}
        required={required}
        suffix={
          showCount ? (
            <div
              {...(letterCount > 9999 && {
                "data-tooltip": true,
                "data-tooltip-content": letterCount,
              })}
              data-tooltip
              className={clsx(
                letterCount > 9999 ? "justify-start" : "justify-center",
                "dark:border-dark-500 z-1 ml-1 h-11/12 w-10 cursor-pointer truncate border-l text-start",
                "text-dark-700 dark:bg-dark-700 mx-px flex items-center rounded-r-lg bg-gray-100 text-xs font-semibold dark:text-gray-200",
              )}
            >
              {letterCount}
            </div>
          ) : (
            props.suffix
          )
        }
        prefix={
          type === "time" ? (
            <Button
              isIcon
              variant="outline"
              className={
                inputRef?.current &&
                inputRef?.current?.showPicker &&
                "cursor-default"
              }
              onClick={() => {
                if (inputRef.current) {
                  inputRef.current.showPicker?.();
                  inputRef.current.focus();
                }
              }}
            >
              <DynamicIcon name={"clock"} className="size-4.5" />
            </Button>
          ) : type === "duration" && !props.prefix ? (
            <DynamicIcon name={"timer"} className="size-4.5" />
          ) : (
            props.prefix
          )
        }
        placeholder={
          type === "date" && !placeholder
            ? "DD-MM-YYYY"
            : type === "duration" && !placeholder
              ? "HH:mm"
              : placeholder
                ? placeholder
                : "Enter..."
        }
        label={label}
        name={name}
        value={value || ""}
        error={error}
        {...(type === "date" && {
          prefix: (
            <Popover className="relative z-1 flex w-full items-center justify-center">
              <PopoverButton as={Button} isIcon variant="outline">
                <Calendar className="size-5" />
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
                  anchor={{ to: "bottom start", gap: 10 }}
                  className="ring-primary-500/50 dark:border-dark-500 dark:bg-dark-750 z-[100] w-80 rounded-md border border-gray-300 bg-white p-2 pl-7 shadow-lg shadow-gray-200/50 outline-none focus-visible:ring focus-visible:outline-none dark:shadow-none"
                >
                  <DatePicker
                    isCalendar
                    options={{
                      disableMobile: true,
                      dateFormat: "d-m-Y",
                      ...props?.options,
                      mode: "single",
                      ...(minDateFinal && { minDate: minDateFinal }),
                      ...(maxDateFinal && { maxDate: maxDateFinal }),
                    }}
                    value={[value]}
                    onChange={(e) => {
                      let f_date = moment(e[0]).format("YYYY-MM-DD");

                      if (typeof handleOnChange === "function")
                        handleOnChange({
                          name,
                          value: f_date,
                        });

                      onChange({
                        target: {
                          name,
                          value: f_date,
                        },
                      });
                    }}
                  />
                </PopoverPanel>
              </Transition>
            </Popover>
          ),
          component: Cleave,
          options: {
            date: true,
            delimiter: "-",
            datePattern: ["d", "m", "Y"],
          },
        })}
        {...(type === "duration" && {
          component: Cleave,
          options: {
            blocks: [2, 2],
            delimiters: [":"],
            numericOnly: true,
          },
        })}
        {...(type === "amount" && {
          component: Cleave,
          options: {
            numeral: true,
            numeralThousandsGroupStyle: "thousand",
            // numeralDecimalScale: 2,
          },
        })}
        ref={mergeRefs(inputRef, props?.ref)}
        onChange={(e) => {
          let e_value = e?.target.value;

          if (type === "amount") {
            e_value = e_value?.replace(/[^0-9.]/g, "") || 0;

            if (
              e_value?.length == props.min?.length &&
              Number(props.min) > Number(e_value)
            ) {
              e_value = props.min;
            }

            if (
              e_value?.length >= props.max?.length &&
              Number(props.max) < Number(e_value)
            ) {
              e_value = props.max;
              inputRef?.current?.setRawValue(e_value);
            }
          }

          if (type === "date") {
            const inputDate = moment(e_value, "DD-MM-YYYY");
            let fullValue = moment(e_value, "DD-MM-YYYY", true).isValid();

            const minDate = minDateFinal
              ? moment(minDateFinal, "DD-MM-YYYY")
              : null;

            const maxDate = maxDateFinal
              ? moment(maxDateFinal, "DD-MM-YYYY")
              : null;

            if (
              fullValue &&
              fullValue &&
              minDate &&
              inputDate.isBefore(minDate, "day")
            ) {
              e_value = minDate.format("DD-MM-YYYY");
            }

            if (fullValue && maxDate && inputDate.isAfter(maxDate, "day")) {
              e_value = maxDate.format("DD-MM-YYYY");
            }

            if (e_value && moment(e_value, "DD-MM-YYYY", true).isValid()) {
              e_value = moment(e_value, "DD-MM-YYYY").format("YYYY-MM-DD");
            }
          }

          let target = { name, value: e_value };

          if (typeof handleOnChange === "function") handleOnChange(target);
          onChange({
            target: {
              name,
              value: e_value,
            },
          });
        }}
      />
    );
  };

  if (props.control) {
    return (
      <Controller
        name={name}
        control={props.control}
        defaultValue={defaultValue}
        render={({ field }) => {
          return renderInput(field);
        }}
      />
    );
  }

  return renderInput({
    value: _value,
    onChange: (e) => {
      handleChange(e.target.value);
    },
  });
};

export default BInput;
