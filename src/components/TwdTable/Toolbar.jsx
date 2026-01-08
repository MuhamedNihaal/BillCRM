// Import Dependencies
import clsx from "clsx";

import PropTypes from "prop-types";

// Local Imports

import { Button } from "components/ui";
import { TableConfig } from "./TableConfig";
import { useBreakpointsContext } from "app/contexts/breakpoint/context";
import { createScopedKeydownHandler } from "utils/dom/createScopedKeydownHandler";
import { TbGridDots, TbList } from "react-icons/tb";
import { Maximize, Minimize2, Rows3, Rows4 } from "lucide-react";
import { Swap, SwapOff, SwapOn } from "components/ui";
import FacedFilter from "components/FacedFilter";
import { useEffect, useRef } from "react";

// ----------------------------------------------------------------------

export function Toolbar({
  table,
  filters,
  setFilters,
  facedFilter: options,
  handleReset,
}) {
  let tabs = table.options.meta.tabs;

  const { isXs } = useBreakpointsContext();
  const isFullScreenEnabled = table.getState().tableSettings.enableFullScreen;

  return (
    <div className="table-toolbar">
      {isXs ? (
        <>
          <div
            className={clsx(
              "flex space-x-2 pt-4 [&_.input-root]:flex-1",
              isFullScreenEnabled ? "px-4 sm:px-5" : "",
              tabs?.options && "flex-col space-y-2",
            )}
          >
            {tabs?.options && (
              <TabConfig
                tabs={tabs}
                filters={filters}
                setFilters={setFilters}
              />
            )}

            {!tabs?.options && options?.length > 0 && (
              <FacedFilter
                handleReset={handleReset}
                filters={filters}
                handleFilter={setFilters}
                config={options}
              />
            )}

            <div className="flex shrink-0 items-center space-x-2">
              <TableConfig table={table} />
              <Settings table={table} />
              <ViewTypeSelect table={table} />
            </div>
          </div>
        </>
      ) : (
        <div
          className={clsx(
            "custom-scrollbar transition-content flex justify-between space-x-4 overflow-x-auto pt-4 pb-1",
            isFullScreenEnabled ? "px-4 sm:px-5" : "",
          )}
          style={{
            "--margin-scroll": isFullScreenEnabled
              ? "1.25rem"
              : "var(--margin-x)",
          }}
        >
          {tabs?.options && (
            <TabConfig tabs={tabs} filters={filters} setFilters={setFilters} />
          )}

          {!tabs?.options && (
            <div className="flex shrink-0 space-x-2">
              {options?.length > 0 && (
                <FacedFilter
                  handleReset={handleReset}
                  filters={filters}
                  handleFilter={setFilters}
                  config={options}
                />
              )}
            </div>
          )}

          <div className="flex shrink-0 items-center space-x-2">
            {tabs?.options?.length > 0 && options?.length > 0 && (
              <FacedFilter
                handleReset={handleReset}
                filters={filters}
                handleFilter={setFilters}
                config={options}
              />
            )}

            <TableConfig table={table} />
            <Settings table={table} />
            <ViewTypeSelect table={table} />
          </div>
        </div>
      )}
    </div>
  );
}

function TabConfig({ tabs, filters, setFilters }) {
  const containerRef = useRef(null);
  const buttonRefs = useRef([]);

  const selectedValue = String(filters[tabs?.filter] || "").toLowerCase();

  useEffect(() => {
    const selectedIdx = tabs?.options?.findIndex(
      (t) => String(t.value).toLowerCase() === selectedValue,
    );
    if (selectedIdx >= 0 && buttonRefs.current[selectedIdx]) {
      buttonRefs.current[selectedIdx].scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selectedValue, tabs?.options]);

  return (
    <div className="dark:bg-dark-700 dark:text-dark-200 relative rounded-lg bg-gray-200 text-gray-600">
      <div
        ref={containerRef}
        className={clsx(
          "flex w-max max-w-[504px] min-w-full gap-2 overflow-x-auto px-1 py-1 max-xl:max-w-80",
          "custom-scrollbar",
        )}
      >
        {tabs?.options?.map((tab, idx) => {
          const isSelected = String(tab.value).toLowerCase() === selectedValue;

          return (
            <Button
              key={idx}
              ref={(el) => (buttonRefs.current[idx] = el)}
              className={clsx(
                "flex h-7 max-w-[120px] min-w-[120px] justify-between space-x-2 rounded-md px-3 text-xs",
                isSelected &&
                  "dark:bg-dark-500 dark:text-dark-100 btn bg-white text-gray-900 opacity-100 shadow",
              )}
              as={Button}
              unstyled
              variant="outlined"
              onClick={() => {
                setFilters((prev) => ({
                  ...prev,
                  [tabs.filter]: tab.value,
                }));
              }}
            >
              <span className="w-full truncate capitalize">{tab.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function ViewTypeSelect({ table }) {
  const setViewType = table.options.meta.setViewType;
  const viewType = table.getState().viewType;
  let isChildren = table.options.meta.isChildren;

  if (!isChildren) {
    return null;
  }

  return (
    <div
      data-tab
      className="text-xs-plus dark:bg-dark-700 dark:text-dark-200 flex rounded-md bg-gray-200 px-1 py-1 text-gray-800"
    >
      <Button
        data-tooltip
        data-tooltip-content="List View"
        data-tab-item
        className={clsx(
          "shrink-0 rounded-sm px-1.5 py-1 font-medium whitespace-nowrap",
          viewType === "list"
            ? "dark:bg-dark-500 dark:text-dark-100 bg-white shadow-sm"
            : "dark:hover:text-dark-100 dark:focus:text-dark-100 hover:text-gray-900 focus:text-gray-900",
        )}
        unstyled
        onKeyDown={createScopedKeydownHandler({
          siblingSelector: "[data-tab-item]",
          parentSelector: "[data-tab]",
          activateOnFocus: true,
          loop: false,
          orientation: "horizontal",
        })}
        onClick={() => setViewType("list")}
      >
        <TbList className="size-4.5" />
      </Button>

      <Button
        data-tooltip
        data-tooltip-content="Grid View"
        data-tab-item
        className={clsx(
          "shrink-0 rounded-sm px-1.5 py-1 font-medium whitespace-nowrap",
          viewType === "grid"
            ? "dark:bg-dark-500 dark:text-dark-100 bg-white shadow-sm"
            : "dark:hover:text-dark-100 dark:focus:text-dark-100 hover:text-gray-900 focus:text-gray-900",
        )}
        unstyled
        onKeyDown={createScopedKeydownHandler({
          siblingSelector: "[data-tab-item]",
          parentSelector: "[data-tab]",
          activateOnFocus: true,
          loop: false,
          orientation: "horizontal",
        })}
        onClick={() => setViewType("grid")}
      >
        <TbGridDots className="size-4.5" />
      </Button>
    </div>
  );
}

function Settings({ table }) {
  const setTableSettings = table.options.meta.setTableSettings;
  const tableSettings = table.getState().tableSettings;
  const viewType = table.getState().viewType;

  let settings = table.options.meta.settings;

  if (!settings) return null;

  return (
    <div
      data-tab
      className="text-xs-plus dark:bg-dark-700 dark:text-dark-200 flex space-x-1 rounded-md bg-gray-200 px-1 py-1 text-gray-800"
    >
      <Swap
        defaultValue={tableSettings.enableFullScreen ? "on" : "off"}
        effect="rotate"
        component={Button}
        data-tooltip
        data-tooltip-content="Full Screen"
        data-tab-item
        className={clsx(
          "shrink-0 rounded-sm px-1.5 py-1 font-medium whitespace-nowrap",
          tableSettings.enableFullScreen
            ? "dark:bg-dark-500 dark:text-dark-100 bg-white shadow-sm"
            : "dark:hover:text-dark-100 dark:focus:text-dark-100 hover:text-gray-900 focus:text-gray-900",
        )}
        unstyled
        onKeyDown={createScopedKeydownHandler({
          siblingSelector: "[data-tab-item]",
          parentSelector: "[data-tab]",
          activateOnFocus: true,
          loop: false,
          orientation: "horizontal",
        })}
        onClick={() =>
          setTableSettings((prev) => ({
            ...prev,
            enableFullScreen: !prev.enableFullScreen,
          }))
        }
      >
        <SwapOn>
          <Minimize2 className="size-4.5" />
        </SwapOn>
        <SwapOff>
          <Maximize className="size-4.5" />
        </SwapOff>
      </Swap>

      {viewType === "list" && (
        <Swap
          defaultValue={tableSettings.enableRowDense ? "on" : "off"}
          effect="rotate"
          component={Button}
          data-tooltip
          data-tooltip-content="Row Dense"
          data-tab-item
          className={clsx(
            "shrink-0 rounded-sm px-1.5 py-1 font-medium whitespace-nowrap",
            tableSettings.enableRowDense
              ? "dark:bg-dark-500 dark:text-dark-100 bg-white shadow-sm"
              : "dark:hover:text-dark-100 dark:focus:text-dark-100 hover:text-gray-900 focus:text-gray-900",
          )}
          unstyled
          onKeyDown={createScopedKeydownHandler({
            siblingSelector: "[data-tab-item]",
            parentSelector: "[data-tab]",
            activateOnFocus: true,
            loop: false,
            orientation: "horizontal",
          })}
          onClick={() =>
            setTableSettings((prev) => ({
              ...prev,
              enableRowDense: !prev.enableRowDense,
            }))
          }
        >
          <SwapOn>
            <Rows4 className="size-4.5" />
          </SwapOn>
          <SwapOff>
            <Rows3 className="size-4.5" />
          </SwapOff>
        </Swap>
      )}
    </div>
  );
}

Toolbar.propTypes = {
  table: PropTypes.object,
};
