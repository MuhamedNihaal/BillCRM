/* eslint-disable react-hooks/exhaustive-deps */
// Import Dependencies
import {
  // createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

// Local Imports
import { Card, Box } from "components/ui";
import { useLockScrollbar, useDidUpdate } from "hooks";
import { fuzzyFilter } from "utils/react-table/fuzzyFilter";
// import { useSkipper } from "utils/react-table/useSkipper";
import { Toolbar } from "./Toolbar";
import { PaginationSection } from "components/shared/table/PaginationSection";
import GenerateColumns from "./Columns";
import ListView from "./ListView";
import GridView from "./GridView";
import { User2 } from "lucide-react";
import { SelectedRowsActions } from "./SelectedRowsActions";
import qs from "query-string";
// ----------------------------------------------------------------------

/**
 * @typedef {"date" | "text" | "range" | "select"} ConfigType
 */

/**
 * @typedef {Object} ConfigItem
 * @property {ConfigType} type - Type of config input (e.g., "text", "select").
 * @property {string} name - Key name for the filter/config.
 * @property {string} title - Display title/label.
 * @property {boolean} isMulti - Whether multiple values can be selected.
 * @property {string} [defaultValue] - Optional default value.
 * @property {string} [icon] - Optional icon identifier.
 * @property {string} [placeholder] - Optional placeholder text.
 */

/**
 * @typedef {Object} SelectableOptionsItem
 * @property {"normal" | "delete"} type
 * @property {JSX.Element} icon
 * @property {() => void} onClick
 * @property {string} label
 * @property {string} className
 */

/**
 * @typedef {ConfigItem[]} FacedFilter
 * @typedef {SelectableOptionsItem[]} SelectableOptions
 */

/**
 * @callback HandleFilterChangeCallback
 * @param {object} filterProps - Current filter values
 * @param {number} pageCount - Current page number
 * @param {number} limitCount - Rows per page
 * @param {object} sortProps - Current sort state
 * @returns {void}
 */

/**
 * TWD Table Component
 *
 * @param {Object} props - Component props
 * @param {any[]} props.data - Table data rows
 * @param {Object} [props.classNames] - Optional className overrides
 * @param {Function} [props.onSortChange] - for Sorting
 * @param {Function} [props.columnCallBack] - Callback for column rendering
 * @param {HandleFilterChangeCallback} [props.handleFilterChange] - Callback when filters change
 * @param {number} [props.timeout=400] - Default number of rows per page
 * @param {boolean} [props.initialRender=true] - Intitial render
 * @param {number} [props.defaultLimit=50] - Default number of rows per page
 * @param {number} [props.count=1] - Total row count
 * @param {Object} [props.tabs={}] - Tabs config
 * @param {boolean} [props.settings=true] - Whether settings are enabled
 * @param {boolean} [props.pagination=true] - Whether pagination is enabled
 * @param {boolean} [props.selectable=false] - Whether rows are selectable
 * @param {SelectableOptions} [props.selectableOptions={}] - Whether rows are selectable
 * @param {FacedFilter} [props.facedFilter] - Configurable filter fields
 * @param {Object} [props.filters] - Filter actions
 * @returns {JSX.Element} React table component
 */

const TwdTable = ({
  data,
  initialRender = true,
  timeout = 400,
  classNames = {},
  columnCallBack = () => {},
  handleFilterChange = () => {},
  defaultLimit = 50,
  count = 1,
  tabs = {},
  settings = true,
  pagination = true,
  selectable = false,
  facedFilter = [
    {
      type: "text",
      icon: User2,
      placeholder: "Search...",
      name: "search",
    },
  ],
  filters: filtersActions,
  selectableOptions = [],
  selectedIds = [],
  defaultValues = {},
  onSortChange = false,
  ...props
}) => {
  const [tableSettings, setTableSettings] = useState({
    enableFullScreen: false,
    enableRowDense: true,
    enableSorting: true,
  });

  const [globalFilter, setGlobalFilter] = useState("");

  const [sorting, setSorting] = useState([]);

  const [viewType, setViewType] = useState("list");

  const [columnVisibility, setColumnVisibility] = useState({});

  const useWork = initialRender ? useEffect : useDidUpdate;

  useEffect(() => {
    const visibility = {};
    for (const col of data?.columns || []) {
      if (col.defaultHiding && col?.enableHiding) {
        visibility[col.field] = false;
      }
    }

    if (visibility) {
      setColumnVisibility(visibility);
    }
  }, []);

  const [columnPinning, setColumnPinning] = useState({});

  // const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  let columns = [];

  let [filters, setFilters] = useState({
    ...defaultValues,
  });
  let [sortFilter, setSortFilter] = useState({});
  let [page, setPage] = useState(1);
  let [limit, setLimit] = useState(defaultLimit);
  let [newDataLoaded, setNewDataLoaded] = useState(Date.now());
  const [expandedRowActions, setExpandedRowActions] = useState({});

  const handleReset = () => {
    setFilters({ ...defaultValues });
  };

  const pageCount = useMemo(() => {
    const safeCount = count === 0 ? 1 : count;
    return Math.ceil(safeCount / limit);
  }, [count, limit]);

  useDidUpdate(() => {
    setNewDataLoaded(Date.now());
  }, [data.rows]);

  const serialOffset = useMemo(() => {
    return (page - 1) * limit;
  }, [newDataLoaded]);

  columns = useMemo(
    () =>
      GenerateColumns({
        columns: data?.columns,
        serialOffset,
        selectable,
        selectedIds,
      }),
    [serialOffset, selectable, data?.columns, selectedIds],
  );

  const rows = useMemo(
    () => (Array.isArray(data?.rows) ? data.rows : []),
    [data?.rows],
  );
  const timeoutRef = useRef(null);
  const lastTriggerRef = useRef({
    filters: null,
    page: null,
    limit: null,
    sortBy: null,
    sortByIn: null,
  });

  const handleBouncer = useCallback(
    (filters, page, limit, sortFilter) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        handleFilterChange(filters, page, limit, sortFilter);
        lastTriggerRef.current = { filters, page, limit, ...sortFilter };
      }, timeout);
    },
    [handleFilterChange],
  );

  useDidUpdate(() => {
    const headers = table.getAllColumns();

    const mappedSorting = sorting.map((sortItem) => {
      const header = headers.find((h) => h.id === sortItem.id);

      const sortingKey = header?.columnDef?.sortingKey || sortItem.id;
      return {
        sortBy: sortingKey,
        sortByIn: sortItem.desc ? "desc" : "asc",
      };
    });

    setSortFilter(mappedSorting?.[0] ?? {});

    if (typeof onSortChange === "function") {
      onSortChange(qs.stringify(mappedSorting?.[0]));
    }
    //  else {
    //   console.error("`onSortChange` not valid function");
    // }
  }, [sorting]);

  useWork(() => {
    const hasChanged =
      JSON.stringify(lastTriggerRef.current.filters) !==
        JSON.stringify(filters) ||
      lastTriggerRef.current.page !== page ||
      lastTriggerRef.current.limit !== limit ||
      lastTriggerRef.current.sortBy !== sortFilter?.sortBy ||
      lastTriggerRef.current.sortByIn !== sortFilter?.sortByIn;

    if (!hasChanged) return;

    if (table) {
      table?.resetRowSelection();
    }

    if (page <= pageCount && pageCount >= page) {
      handleBouncer(filters, page, limit, sortFilter);
    } else {
      table.setPageIndex(0);
      setPage(1);
    }
  }, [filters, limit, page, pageCount, sortFilter]);

  const table = useReactTable({
    data: rows,
    columns: columns,
    state: {
      globalFilter,
      sorting,
      columnVisibility,
      columnPinning,
      tableSettings,
      viewType,
      filters,
      expandedRowActions,
      setExpandedRowActions,
    },
    meta: {
      updateData: ({ type, value, row }) => {
        let doc = row.original;
        let data = {
          type,
          id: doc?._id ?? row.index,
          status: value,
          doc,
        };

        columnCallBack(data);
      },
      setTableSettings,
      filtersActions,
      filters,
      sortFilter,
      setFilters,
      setViewType,
      tabs,
      isChildren: props.children ? true : false,
      pageCount,
      settings,
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },

    enableSorting: tableSettings.enableSorting,
    enableColumnFilters: tableSettings.enableColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    globalFilterFn: fuzzyFilter,

    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,

    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,

    pageCount: pageCount,
    manualPagination: true,
    ...(pagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),

    manualSorting: onSortChange ? true : false,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),

    enableRowSelection: (row) => {
      const rowId = row.original._id ?? row.id ?? row.index;
      return !selectedIds.includes(rowId);
    },

    // autoResetPageIndex,
  });

  useDidUpdate(() => table.resetRowSelection(), [pagination]);

  useLockScrollbar(tableSettings.enableFullScreen);

  const WrapComponent = viewType === "list" ? Card : Box;

  if (selectable && selectableOptions.length === 0) {
    console.log(
      "%cInvalid prop: 'selectableOptions' must be an array of objects when 'selectable' is enabled.",
      "color: red; font-weight: bold;",
    );
    return null;
  }

  return (
    <>
      <div
        className={clsx(
          "flex h-auto w-full flex-col",
          tableSettings.enableFullScreen &&
            "dark:bg-dark-900 fixed inset-0 z-61 bg-white pt-3",
        )}
      >
        <Toolbar
          table={table}
          facedFilter={facedFilter}
          filters={filters}
          setFilters={setFilters}
          handleReset={handleReset}
        />

        <div
          className={clsx(
            "transition-content flex flex-col pt-3",
            tableSettings.enableFullScreen ? "overflow-hidden px-3" : "",
          )}
        >
          <WrapComponent
            className={clsx(
              "relative flex grow flex-col",
              tableSettings.enableFullScreen && "overflow-hidden",
            )}
          >
            {viewType === "list" && (
              <ListView
                table={table}
                flexRender={flexRender}
                columns={columns}
                classNames={classNames}
              />
            )}

            {viewType === "grid" && (
              <GridView
                table={table}
                columns={columns}
                flexRender={flexRender}
                {...props}
              />
            )}

            <SelectedRowsActions
              table={table}
              selectableOptions={selectableOptions}
            />
            {pagination &&
            !table.getIsSomeRowsSelected() &&
            !table.getIsAllRowsSelected() ? (
              <div
                className={clsx(
                  "pb-4 sm:pt-4",
                  (viewType === "list" || tableSettings.enableFullScreen) &&
                    "px-4 sm:px-5",
                  tableSettings.enableFullScreen &&
                    "dark:bg-dark-800 bg-gray-50",
                  !(
                    table.getIsSomeRowsSelected() ||
                    table.getIsAllRowsSelected()
                  ) && "pt-4",
                  table.getCoreRowModel().rows?.length === 0 &&
                    "dark:border-t-dark-500 border-y border-transparent border-t-gray-200",
                )}
              >
                <PaginationSection
                  count={count}
                  limit={limit}
                  table={table}
                  setLimit={setLimit}
                  setPage={setPage}
                />
              </div>
            ) : null}
          </WrapComponent>
        </div>
      </div>
    </>
  );
};

export default memo(TwdTable);
