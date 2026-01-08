import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { Button, Input } from "components/ui";
import { ResponsiveFilter } from "./ResponsiveFilter";
import { useDidUpdate } from "hooks";

export function RangeFilter({
  title,
  Icon,
  MinPrefixIcon,
  MaxPrefixIcon,
  buttonText,
  name,
  table,
}) {
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");

  const hasFilter = minValue !== "" || maxValue !== "";

  useDidUpdate(() => {
    table.setFilters((prev) => {
      const next = { ...prev };

      if (minValue !== "" || maxValue !== "") {
        next[name] = { min: minValue, max: maxValue };
      } else {
        delete next[name];
      }

      if (JSON.stringify(prev) === JSON.stringify(next)) return prev;

      return next;
    });
  }, [minValue, maxValue]);

  useDidUpdate(() => {
    if (!table.filters[name] && (minValue !== "" || maxValue !== "")) {
      setMinValue("");
      setMaxValue("");
    }
  }, [table.filters]);

  return (
    <ResponsiveFilter
      buttonContent={
        <>
          {Icon && <Icon className="size-4" />}
          <span>{title}</span>
          {hasFilter && (
            <>
              <div className="dark:bg-dark-450 h-full w-px bg-gray-300" />
              <span>
                {buttonText?.({
                  min: minValue,
                  max: maxValue,
                })}
              </span>
            </>
          )}
        </>
      }
    >
      <FilterContent
        {...{
          title,
          minValue,
          maxValue,
          setMinValue,
          setMaxValue,
          MinPrefixIcon,
          MaxPrefixIcon,
        }}
      />
    </ResponsiveFilter>
  );
}

function FilterContent({
  title,
  minValue,
  maxValue,
  setMinValue,
  setMaxValue,
  MinPrefixIcon,
  MaxPrefixIcon,
}) {
  const minInputRef = useRef();

  useEffect(() => {
    minInputRef.current?.focus();
  }, []);

  const handleClear = () => {
    setMinValue("");
    setMaxValue("");
  };

  return (
    <div className="sm:w-72">
      <div className="bg-gray-150 dark:bg-dark-900 flex items-center justify-between px-2.5 py-2">
        <p className="dark:text-dark-50 truncate py-1 text-start font-medium text-gray-800">
          {title}
        </p>
        {(minValue || maxValue) && (
          <Button onClick={handleClear} className="h-7 px-3 text-xs">
            Clear
          </Button>
        )}
      </div>

      <div className="flex gap-2 p-3">
        <Input
          type="number"
          ref={minInputRef}
          value={minValue}
          onChange={(e) => setMinValue(e.target.value)}
          label="Min"
          placeholder="Min"
          className={clsx(MinPrefixIcon && "ltr:pl-8! rtl:pr-8!")}
          prefix={
            MinPrefixIcon && <MinPrefixIcon className="stroke-1.5 size-4.5" />
          }
        />
        <Input
          type="number"
          value={maxValue}
          onChange={(e) => setMaxValue(e.target.value)}
          placeholder="Max"
          label="Max"
          className={clsx(MaxPrefixIcon && "ltr:pl-8! rtl:pr-8!")}
          prefix={
            MaxPrefixIcon && <MaxPrefixIcon className="stroke-1.5 size-4.5" />
          }
        />
      </div>
    </div>
  );
}

RangeFilter.propTypes = {
  title: PropTypes.string,
  Icon: PropTypes.elementType,
  MinPrefixIcon: PropTypes.elementType,
  MaxPrefixIcon: PropTypes.elementType,
  buttonText: PropTypes.func,
};

FilterContent.propTypes = {
  title: PropTypes.string,
  minValue: PropTypes.string,
  maxValue: PropTypes.string,
  setMinValue: PropTypes.func,
  setMaxValue: PropTypes.func,
  MinPrefixIcon: PropTypes.elementType,
  MaxPrefixIcon: PropTypes.elementType,
};
