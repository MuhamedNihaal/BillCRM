// Import Dependencies
import { useState } from "react";
import { CalendarIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import dayjs from "dayjs";
import PropTypes from "prop-types";

// Local Imports
import { Button } from "components/ui";
import { useLocaleContext } from "app/contexts/locale/context";
import { useBreakpointsContext } from "app/contexts/breakpoint/context";
import { ResponsiveFilter } from "./ResponsiveFilter";
import { useDidUpdate } from "hooks";
import { DatePicker } from "components/shared/form/Datepicker";

// ----------------------------------------------------------------------

export function DateFilter({ table, title, config, name }) {
  // useEffect(() => () => column?.setFilterValue(undefined), []);
  const { smAndDown } = useBreakpointsContext();
  const [selectedValues, setSelectedValues] = useState(undefined);
  const { locale } = useLocaleContext();

  const handleDateChange = (date) => {
    setSelectedValues(date);

    table.setFilters((prev) => {
      const next = { ...prev };

      if (Array.isArray(date) && date.length > 0) {
        const from = dayjs(date[0]).locale(locale).format("YYYY-MM-DD");
        const to =
          date.length === 2
            ? dayjs(date[1]).locale(locale).format("YYYY-MM-DD")
            : undefined;

        next[name] = to ? { from, to } : { from };
      } else {
        delete next[name];
      }

      if (JSON.stringify(prev) === JSON.stringify(next)) return prev;

      return next;
    });
  };

  useDidUpdate(() => {
    if (!table.filters[name] && selectedValues !== undefined) {
      setSelectedValues(undefined);
    }
  }, [table.filters]);

  return (
    <ResponsiveFilter
      buttonContent={
        <>
          <CalendarIcon className="size-4" />
          <span> {title}</span>

          {selectedValues && (
            <>
              <div className="dark:bg-dark-450 h-full w-px bg-gray-300" />
              <span>
                {`${dayjs(selectedValues[0]).locale(locale).format("DD MMM YYYY")} ${selectedValues[1] ? `- ${dayjs(selectedValues[1]).locale(locale).format("DD MMM YYYY")}` : ""}`}
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
        {selectedValues && (
          <Button
            onClick={() => handleDateChange(null)}
            className="h-7 px-3 text-xs"
          >
            Clear
          </Button>
        )}
      </div>

      <div className="max-sm:mx-auto max-sm:[&_.is-calendar]:w-80 max-sm:[&_.is-calendar]:max-w-none">
        <DatePicker
          isCalendar
          value={selectedValues ?? ""}
          readOnly
          onChange={handleDateChange}
          options={config}
        />
      </div>
    </ResponsiveFilter>
  );
}

DateFilter.propTypes = {
  column: PropTypes.object,
  config: PropTypes.object,
  title: PropTypes.string,
};
