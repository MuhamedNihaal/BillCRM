import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { useUncontrolled } from "hooks";
import { Controller } from "react-hook-form";
import { cn } from "lib/utils";
import clsx from "clsx";
import { useState } from "react";
import { InputErrorMsg } from "components/ui";

const BPhone = ({
  name,
  label,
  suffix,
  prefix,
  error,
  placeholder,
  className,
  classNames,
  handleOnChange = null,
  defaultValue,
  value,
  disabled,
  ...props
}) => {
  const [_value, handleChange] = useUncontrolled({ defaultValue, value });
  const [isFocused, setIsFocused] = useState(false);

  const renderInput = (field) => {
    let { onChange, value } = field;
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
            "relative w-full rounded-lg border px-3 py-2",
            suffix && "ltr:pr-7 rtl:pl-7",
            prefix && "ltr:pl-7 rtl:pr-7",
            cn(
              error
                ? "border-error dark:border-error-lighter"
                : isFocused
                  ? "border-primary-600 dark:border-primary-500"
                  : "dark:border-dark-450 dark:hover:border-dark-400 border-gray-300 hover:border-gray-400",
              classNames?.input,
              disabled &&
                "bg-gray-150 dark:border-dark-500 dark:bg-dark-600! cursor-not-allowed border-gray-300 opacity-60",
            ),
          )}
        >
          <PhoneInput
            ref={props.ref}
            disabled={disabled}
            placeholder={placeholder ?? "Enter..."}
            international
            defaultCountry="IN"
            value={value}
            onChange={(val) => {
              let target = { name, value: val };
              if (typeof handleOnChange === "function") handleOnChange(target);
              onChange(val);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              field.onBlur?.(e);
            }}
            onFocus={(e) => {
              setIsFocused(true);
              field.onFocus?.(e);
            }}
            className={clsx(
              "text-dark-750 w-full dark:text-white [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:focus:outline-none",
              "dark:[&_.PhoneInputCountrySelect]:border-dark-400 [&_.PhoneInputCountrySelect]:rounded-lg [&_.PhoneInputCountrySelect]:border [&_.PhoneInputCountrySelect]:border-gray-400",
              "dark:[&_.PhoneInputCountrySelect]:bg-dark-750 [&_.PhoneInputCountrySelect]:bg-white",
              "[&_.PhoneInputCountrySelect]:shadow-lg [&_.PhoneInputCountrySelect]:shadow-gray-200/50 dark:[&_.PhoneInputCountrySelect]:shadow-none",
              "[&_.PhoneInputCountrySelect]:px-2 [&_.PhoneInputCountrySelect]:py-1 [&_.PhoneInputCountrySelect]:outline-none [&_.PhoneInputCountrySelect]:focus:border-blue-500",
            )}
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
        render={({ field }) => {
          return renderInput(field);
        }}
      />
    );
  }

  return renderInput({
    value: _value,
    onChange: (e) => {
      handleChange(e);
    },
  });
};

export default BPhone;
