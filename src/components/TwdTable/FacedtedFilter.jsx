/* eslint-disable react-hooks/exhaustive-deps */
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

import { Badge, Button, Checkbox, Input } from "components/ui";
import { useDidUpdate, useFuse } from "hooks";
import { ResponsiveFilter } from "./ResponsiveFilter";
import { useBreakpointsContext } from "app/contexts/breakpoint/context";

export function FacedtedFilter({
  title,
  options = [],
  labelField = "label",
  valueField = "value",
  Icon,
  renderPrefix,
  searchField = ["label"],
  showCheckbox = true,
  onChange,
  defaultValues = [],
  table,
  name,
  multiple = false,
}) {
  const [selectedValues, setSelectedValues] = useState(null);

  const [selectedItems, setSelectedItems] = useState(null);

  useEffect(() => {
    handleDefaultValues();
  }, [options]);

  useDidUpdate(() => {
    const data = { ...table.filters };
    if (multiple ? selectedValues?.length > 0 : selectedValues !== null) {
      data[name] = selectedValues;
    } else {
      delete data[name];
    }

    if (JSON.stringify(table.filters) !== JSON.stringify(data)) {
      table.setFilters(data);
    }
  }, [selectedValues, options]);

  useDidUpdate(() => {
    if (!(name in table.filters)) {
      if (multiple ? selectedValues?.length > 0 : selectedValues !== null) {
        setSelectedValues(multiple ? [] : null);
        setSelectedItems(multiple ? [] : null);
        onChange?.(multiple ? [] : null, multiple ? [] : null);
      }
    }
  }, [table.filters]);

  const handleDefaultValues = () => {
    setSelectedValues(multiple ? defaultValues : defaultValues[0]);
    setSelectedItems(
      multiple
        ? options.filter((opt) => defaultValues.includes(opt[valueField]))
        : (options.find((opt) => opt[valueField] === defaultValues[0]) ?? null),
    );
  };

  return (
    <ResponsiveFilter
      buttonContent={
        <>
          {Icon && <Icon className="size-4" />}
          <span>{title}</span>

          {multiple && selectedItems?.length > 0 && (
            <>
              <div className="dark:bg-dark-450 h-full w-px bg-gray-300" />
              <Badge className="lg:hidden">{selectedItems.length}</Badge>

              {selectedItems.length > 2 ? (
                <Badge className="max-lg:hidden">
                  {selectedItems.length} selected
                </Badge>
              ) : (
                <div className="hidden gap-1 lg:flex">
                  {selectedItems.map((val) => (
                    <Badge key={val[valueField]} className="gap-1">
                      {val.icon && <val.icon className="size-4 stroke-1" />}
                      <span>{val[labelField]}</span>
                    </Badge>
                  ))}
                </div>
              )}
            </>
          )}

          {!multiple && selectedItems && (
            <>
              <div className="dark:bg-dark-450 h-full w-px bg-gray-300" />
              <Badge className="gap-1">
                {selectedItems.icon && (
                  <selectedItems.icon className="size-4 stroke-1" />
                )}
                <span>{selectedItems[labelField]}</span>
              </Badge>
            </>
          )}
        </>
      }
    >
      <ComboboxFilter
        {...{
          selectedValues,
          selectedItems,
          setSelectedValues,
          setSelectedItems,
          title,
          options,
          searchField,
          labelField,
          valueField,
          renderPrefix,
          showCheckbox,
          onChange,
          multiple,
        }}
      />
    </ResponsiveFilter>
  );
}

function ComboboxFilter({
  selectedValues,
  selectedItems,
  setSelectedValues,
  setSelectedItems,
  onChange,
  searchField = ["label"],
  title,
  options,
  labelField,
  valueField,
  renderPrefix,
  showCheckbox,
  multiple = true,
}) {
  const inputRef = useRef();
  const {
    result: filteredItems,
    query,
    setQuery,
  } = useFuse(options, {
    keys: searchField,
    threshold: 0.2,
    matchAllOnEmptyQuery: true,
  });

  const { smAndUp } = useBreakpointsContext();

  useEffect(() => {
    smAndUp && inputRef.current?.focus();
  }, [smAndUp]);

  const handleSelectionChange = (value) => {
    if (multiple) {
      const newValues = value.map((item) => item[valueField]);
      setSelectedValues(newValues);
      setSelectedItems(value);
      onChange?.(newValues, value);
    } else {
      setSelectedValues(value?.[valueField] ?? null);
      setSelectedItems(value ?? null);
      onChange?.(value?.[valueField] ?? null, value ?? null);
    }
  };

  return (
    <Combobox
      value={selectedItems}
      onChange={handleSelectionChange}
      multiple={multiple}
      className="h-[366px] sm:h-auto sm:max-h-80 sm:w-56"
    >
      <div className="relative flex flex-col">
        <div className="dark:bg-dark-900 relative bg-gray-100 py-1">
          <ComboboxInput
            as={Input}
            className="border-none"
            ref={inputRef}
            autoComplete="new"
            placeholder={title}
            onChange={(event) => setQuery(event.target.value)}
            prefix={<MagnifyingGlassIcon className="size-4" />}
          />
        </div>

        <ComboboxOptions
          static
          className="h-auto w-full overflow-y-auto py-1 outline-hidden"
        >
          {filteredItems.length === 0 && query !== "" ? (
            <div className="dark:text-dark-100 relative cursor-default px-2.5 py-2 text-gray-800 select-none">
              Nothing found for {query}
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
                {({ selected }) => (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      {showCheckbox && multiple && (
                        <Checkbox checked={selected} readOnly />
                      )}
                      {item.icon && <item.icon className="size-4.5 stroke-1" />}
                      {renderPrefix && renderPrefix(item, selected)}
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

        {(multiple ? selectedValues?.length > 0 : selectedValues !== null) && (
          <Button
            onClick={() => {
              setSelectedValues(multiple ? [] : null);
              setSelectedItems(multiple ? [] : null);
              onChange?.(multiple ? [] : null, multiple ? [] : null);
            }}
            className="w-full shrink-0 rounded-none"
          >
            Clear Filter
          </Button>
        )}
      </div>
    </Combobox>
  );
}

FacedtedFilter.propTypes = {
  title: PropTypes.string,
  labelField: PropTypes.string,
  valueField: PropTypes.string,
  options: PropTypes.array,
  Icon: PropTypes.elementType,
  renderPrefix: PropTypes.func,
  showCheckbox: PropTypes.bool,
  onChange: PropTypes.func,
  defaultValues: PropTypes.array,
  table: PropTypes.object,
  name: PropTypes.string,
  multiple: PropTypes.bool,
};

ComboboxFilter.propTypes = {
  title: PropTypes.string,
  labelField: PropTypes.string,
  valueField: PropTypes.string,
  options: PropTypes.array,
  renderPrefix: PropTypes.func,
  showCheckbox: PropTypes.bool,
  onChange: PropTypes.func,
  multiple: PropTypes.bool,
};
