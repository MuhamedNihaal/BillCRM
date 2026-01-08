/* eslint-disable react-hooks/exhaustive-deps */
import { Input as InputC } from "components/ui";
import { cn } from "lib/utils";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { ResponsiveFilter } from "components/shared/table/ResponsiveFilter";
import { Badge, Button, Checkbox } from "components/ui";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useDidUpdate, useFuse, useUncontrolled } from "hooks";
import { useEffect, useRef } from "react";
import { useBreakpointsContext } from "app/contexts/breakpoint/context";
import clsx from "clsx";
import { useLocaleContext } from "app/contexts/locale/context";
import { CalendarIcon } from "lucide-react";
import dayjs from "dayjs";
import { DatePicker } from "components/shared/form/Datepicker";

// ========> Input
export const Input = ({
  className,
  name,
  defaultValue,
  onChange,
  reset,
  ...props
}) => {
  const [_value, handleChange] = useUncontrolled({
    defaultValue: defaultValue,
  });

  const handleValue = (e) => {
    handleChange(e.target.value);
  };

  useEffect(() => {
    onChange({ name, value: _value });
  }, []);

  useDidUpdate(() => {
    onChange({ name, value: _value });
  }, [_value]);

  useDidUpdate(() => {
    handleChange("");
  }, [reset]);

  return (
    <InputC
      {...props}
      className={cn("h-8 text-xs", className)}
      value={_value || ""}
      onChange={handleValue}
    />
  );
};

// ========> Select Box
export const SelectBox = ({
  title,
  options,
  labelField = "label",
  valueField = "value",
  Icon,
  name,
  defaultValue,
  isMulti = false,
  renderPrefix,
  showCheckbox = true,
  reset,
  onChange = () => {},
}) => {
  const handleValue = (val) => {
    if (isMulti) {
      onChange({
        name,
        value: val.map((v) => v[valueField]),
        obj: val,
      });
    } else {
      onChange({
        name,
        value: val?.[valueField],
        obj: val,
      });
    }
  };

  const [_value, handleChange] = useUncontrolled({
    defaultValue: defaultValue || (isMulti ? [] : {}),
    onChange: handleValue,
  });

  useEffect(() => {
    if (defaultValue) handleValue(defaultValue);
  }, []);

  useDidUpdate(() => {
    if (!_value) return;
    handleValue(_value);
  }, [_value]);

  useDidUpdate(() => {
    handleChange(isMulti ? [] : {});
  }, [reset]);

  const renderBadges = () => {
    if (isMulti && Array.isArray(_value)) {
      if (_value.length > 2) {
        return <Badge>{_value.length}</Badge>;
      }
      return _value.map((item, idx) => (
        <Badge key={idx}>{item?.[labelField]}</Badge>
      ));
    }
    if (!isMulti && _value?.[labelField]) {
      return <Badge>{_value?.[labelField]}</Badge>;
    }
    return null;
  };

  return (
    <ResponsiveFilter
      classNames={{ button: "ring-0" }}
      buttonContent={
        <>
          {Icon && <Icon className="size-4" />}
          <span>{title}</span>

          {_value && (isMulti ? _value.length > 0 : _value?.label) && (
            <>
              <div className="dark:bg-dark-450 h-full w-px bg-gray-300" />
              {renderBadges()}
            </>
          )}
        </>
      }
    >
      <ComboboxFilter
        {...{
          title,
          options,
          labelField,
          valueField,
          renderPrefix,
          showCheckbox,
          _value,
          handleChange,
          isMulti,
        }}
      />
    </ResponsiveFilter>
  );
};
export default SelectBox;
function ComboboxFilter({
  title,
  options,
  labelField,
  valueField,
  renderPrefix,
  showCheckbox,
  _value,
  handleChange,
  isMulti,
}) {
  const inputRef = useRef();
  const {
    result: filteredItems,
    query,
    setQuery,
  } = useFuse(options || [], {
    keys: [labelField],
    threshold: 0.2,
    matchAllOnEmptyQuery: true,
  });

  const { smAndUp } = useBreakpointsContext();

  useEffect(() => {
    smAndUp && inputRef.current.focus();
  }, []);

  const isSelected = (item) => {
    if (isMulti && Array.isArray(_value)) {
      return _value.some((v) => v?.[valueField] === item?.[valueField]);
    }
    return _value?.[valueField] === item?.[valueField];
  };

  return (
    <Combobox
      multiple={isMulti}
      className="h-[366px] sm:h-auto sm:max-h-80 sm:w-56"
      value={_value}
      onChange={handleChange}
    >
      <div className="relative flex flex-col">
        <div className="dark:bg-dark-900 relative bg-gray-100 py-1">
          <ComboboxInput
            as={InputC}
            className="border-none"
            ref={inputRef}
            value={query || ""}
            autoComplete="off"
            placeholder={title}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            prefix={<MagnifyingGlassIcon className="size-4" />}
          />
        </div>

        <ComboboxOptions
          static
          className="h-auto w-full overflow-y-auto py-1 outline-hidden"
        >
          {filteredItems.length === 0 ? (
            <div className="dark:text-dark-100 relative cursor-default px-2.5 py-2 text-gray-800 select-none">
              {query !== "" ? `Nothing found for ${query}` : " No Data"}
            </div>
          ) : (
            filteredItems.map(({ item, refIndex }) => (
              <ComboboxOption
                key={refIndex}
                className={({ focus }) =>
                  clsx(
                    "dark:text-dark-100 relative cursor-pointer px-2.5 py-2 text-gray-800 outline-hidden transition-colors select-none",
                    focus && "dark:bg-dark-600 bg-gray-100",
                  )
                }
                value={item}
              >
                {() => (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      {showCheckbox && (
                        <Checkbox checked={isSelected(item)} readOnly />
                      )}
                      {item.icon && <item.icon className="size-4.5 stroke-1" />}
                      {renderPrefix?.(item, isSelected(item))}
                      <span className="text-xs-plus block truncate">
                        {item[labelField]}
                      </span>
                    </div>
                  </div>
                )}
              </ComboboxOption>
            ))
          )}
        </ComboboxOptions>

        {(isMulti ? _value?.length > 0 : _value?.[labelField]) && (
          <Button
            onClick={() => handleChange(isMulti ? [] : {})}
            className="w-full shrink-0 rounded-none"
          >
            Clear Filter
          </Button>
        )}
      </div>
    </Combobox>
  );
}

// ==========> Range
export const RangeFilter = ({
  title,
  Icon,
  name,
  reset,
  left,
  right,
  onChange = () => {},
}) => {
  let LeftIcon = left?.icon;
  let RightIcon = right?.icon;
  let leftDefault = left.defaultValue || "";
  let rightDefault = right.defaultValue || "";
  delete left.defaultValue;
  delete right.defaultValue;

  const [_value, handleChange] = useUncontrolled({
    defaultValue: {
      from: leftDefault,
      to: rightDefault,
    },
  });

  useEffect(() => {
    onChange({ name, value: _value });
  }, []);

  const handleValue = (e) => {
    handleChange((prev) => {
      let obj = {
        ...prev,
        [e.target.name]: e.target.value,
      };

      return obj;
    });
  };

  useDidUpdate(() => {
    onChange({ name, value: _value, obj: _value });
  }, [_value]);

  useDidUpdate(() => {
    handleChange({});
  }, [reset]);

  return (
    <ResponsiveFilter
      classNames={{ button: "ring-0" }}
      buttonContent={
        <>
          {Icon && <Icon className="size-4" />}
          <span>{title}</span>

          {(_value.from || _value.to) && (
            <div className="dark:bg-dark-450 h-full w-px bg-gray-300" />
          )}
          {_value.from && (
            <>
              <span className="max-w-20 truncate">From {_value.from}</span>
            </>
          )}
          {_value.from && _value.to && " - "}
          {_value.to && (
            <span className="max-w-20 truncate">To {_value.to}</span>
          )}
        </>
      }
    >
      <div className="sm:w-72">
        <div className="bg-gray-150 dark:bg-dark-900 flex items-center justify-between px-2.5 py-2">
          <p className="dark:text-dark-50 truncate py-1 text-start font-medium text-gray-800">
            {title}
          </p>

          {(_value.from || _value.to) && (
            <Button
              className="h-7 px-3 text-xs"
              onClick={() => handleChange({})}
            >
              Clear
            </Button>
          )}
        </div>

        <div className="flex gap-2 p-3">
          <InputC
            type="number"
            className="h-8 text-xs"
            {...left}
            {...(LeftIcon && { prefix: <LeftIcon className="size-4" /> })}
            value={_value.from || ""}
            name="from"
            onChange={handleValue}
          />
          <InputC
            type="number"
            className="h-8 text-xs"
            {...right}
            {...(RightIcon && { prefix: <RightIcon className="size-4" /> })}
            value={_value.to || ""}
            name="to"
            onChange={handleValue}
          />
        </div>
      </div>
    </ResponsiveFilter>
  );
};

// ==========> Date
export function DateFilter({
  name,
  Icon,
  title,
  options,
  reset,
  onChange,
  defaultValue,
}) {
  const { smAndDown } = useBreakpointsContext();
  const { locale } = useLocaleContext();

  const handleValue = (val) => {
    let value = {};
    if (Array.isArray(val) && val.length > 0) {
      value.from = dayjs(val[0]).locale(locale).format("YYYY-MM-DD");
      value.to =
        val.length === 2
          ? dayjs(val[1]).locale(locale).format("YYYY-MM-DD")
          : undefined;
    }

    value =
      options?.mode === "range"
        ? value.to
          ? { from: value.from, to: value.to }
          : { from: value.from }
        : value?.from;

    onChange({
      name,
      value: value,
    });
  };

  useEffect(() => {
    if (defaultValue) handleValue(defaultValue);
  }, []);

  const [_value, handleChange] = useUncontrolled({
    defaultValue: defaultValue,
    onChange: handleValue,
  });

  useDidUpdate(() => {
    handleChange(null);
  }, [reset]);

  return (
    <ResponsiveFilter
      buttonContent={
        <>
          {Icon ? (
            <Icon className="size-4" />
          ) : (
            <CalendarIcon className="size-4" />
          )}

          <span>{title}</span>

          {_value && (
            <>
              <div className="dark:bg-dark-450 h-full w-px bg-gray-300" />
              <span>
                {`${dayjs(_value[0]).locale(locale).format("DD MMM YYYY")} ${_value[1] ? `- ${dayjs(_value[1]).locale(locale).format("DD MMM YYYY")}` : ""}`}
              </span>
            </>
          )}
        </>
      }
    >
      <div
        className={clsx(
          "mx-auto flex w-full items-center justify-between",
          smAndDown
            ? "dark:border-dark-500 mt-1 mb-2 h-10 w-full max-w-xs border-b border-gray-200 py-3"
            : "bg-gray-150 dark:bg-dark-900 px-2.5 py-2",
        )}
      >
        <p className="dark:text-dark-50 truncate text-start text-base font-medium text-gray-800 sm:py-1 sm:text-sm">
          {title}
        </p>
        {_value && (
          <Button
            onClick={() => handleChange(null)}
            className="h-7 px-3 text-xs"
          >
            Clear
          </Button>
        )}
      </div>

      <div className="flex max-sm:mx-auto max-sm:[&_.is-calendar]:w-80 max-sm:[&_.is-calendar]:max-w-none">
        <DatePicker
          isCalendar
          value={_value}
          readOnly
          onChange={handleChange}
          options={options}
        />
      </div>
    </ResponsiveFilter>
  );
}
