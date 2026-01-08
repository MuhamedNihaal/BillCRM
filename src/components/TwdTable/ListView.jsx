import { Table, THead, TBody, Th, Tr, Td } from "components/ui";
import { TableSortIcon } from "components/shared/table/TableSortIcon";
import { getUserAgentBrowser } from "utils/dom/getUserAgentBrowser";
import { useThemeContext } from "app/contexts/theme/context";
import clsx from "clsx";
import { cn } from "lib/utils";
import { Fragment } from "react";

const isSafari = getUserAgentBrowser() === "Safari";

const ListView = ({ flexRender, table, columns, classNames }) => {
  const tableSettings = table.getState().tableSettings;
  const expandedRowActions = table.getState().expandedRowActions;
  const { cardSkin } = useThemeContext();

  return (
    <div className="table-wrapper min-w-full grow overflow-x-auto">
      <Table
        hoverable
        dense={tableSettings.enableRowDense}
        sticky={tableSettings.enableFullScreen}
        className="w-full text-left rtl:text-right "
      >
        <THead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Tr key={headerGroup.id} className={classNames?.tr}>
              {headerGroup.headers.map((header, idx) => (
                <Th
                  key={header.id}
                  className={cn(
                    clsx(
                      "dark:bg-dark-800 dark:text-dark-100 bg-gray-200 font-semibold text-gray-800 capitalize first:ltr:rounded-tl-lg last:ltr:rounded-tr-lg first:rtl:rounded-tr-lg last:rtl:rounded-tl-lg text-center",
                      "dark:border-dark-500 border-b border-gray-300",
                      idx != headerGroup.headers?.length - 1 && "border-r",
                      header.column.getCanPin() && [
                        header.column.getIsPinned() === "left" &&
                          "sticky z-2 ltr:left-0 rtl:right-0",
                        header.column.getIsPinned() === "right" &&
                          "sticky z-2 ltr:right-0 rtl:left-0",
                      ],
                    ),
                    classNames.th,
                  )}
                >
                  {header.column.getCanSort() ? (
                    <div
                      className="flex cursor-pointer items-center space-x-3 select-none"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <span className="flex-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </span>
                      <TableSortIcon sorted={header.column.getIsSorted()} />
                    </div>
                  ) : header.isPlaceholder ? null : (
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )
                  )}
                </Th>
              ))}
            </Tr>
          ))}
        </THead>
        <TBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows?.map((row) => {
              return (
                <Fragment key={row.id}>
                  <Tr
                    className={clsx(
                      "dark:border-b-dark-500 relative border-y border-transparent border-b-gray-200",
                      row.getIsSelected() &&
                        !isSafari &&
                        "row-selected after:bg-primary-500/10 ltr:after:border-l-primary-500 rtl:after:border-r-primary-500 after:pointer-events-none after:absolute after:inset-0 after:z-2 after:h-full after:w-full after:border-3 after:border-transparent",
                      row.getIsExpanded() && "border-dashed",
                    )}
                  >
                    {row
                      .getVisibleCells()
                      .filter((cell) => !cell.column.columnDef.isHiddenColumn)
                      .map((cell) => {
                        return (
                          <Td
                            key={cell.id}
                            className={clsx(
                              "relative",
                              cardSkin === "shadow-sm"
                                ? "dark:bg-dark-700"
                                : "dark:bg-dark-900",

                              cell.column.getCanPin() && [
                                cell.column.getIsPinned() === "left" &&
                                  "sticky bg-white z-2 ltr:left-0 rtl:right-0",
                                cell.column.getIsPinned() === "right" &&
                                  "sticky bg-white z-2 ltr:right-0 rtl:left-0",
                                cell.column.columnDef.className,
                                "dark:border-dark-500 border-r border-b border-gray-300",
                              ],
                            )}
                          >
                            {cell.column.getIsPinned() && (
                              <div
                                className={clsx(
                                  "dark:border-dark-500 pointer-events-none absolute inset-0 border-gray-200",
                                  cell.column.getIsPinned() === "left"
                                    ? "ltr:border-r rtl:border-l"
                                    : "ltr:border-l rtl:border-r",
                                )}
                              ></div>
                            )}
                            {(() => {
                              const { id, columnDef } = cell.column;
                              const value = cell.getValue?.();
                              const context = cell.getContext();
                              const rendered = flexRender(
                                columnDef.cell,
                                context,
                              );

                              const headerLabel =
                                typeof columnDef.header === "function"
                                  ? flexRender(columnDef.header, context)
                                  : columnDef.header;

                              const skipColumn = [
                                "serialNumber",
                                "select",
                              ].includes(id);
                              const skipHeader = ["actions"].includes(
                                headerLabel,
                              );

                              const isEmpty =
                                value === null ||
                                value === undefined ||
                                value === "";

                              return !skipColumn && !skipHeader && isEmpty
                                ? "----"
                                : rendered;
                            })()}
                          </Td>
                        );
                      })}
                  </Tr>
                  {row.getIsExpanded() && (
                    <tr>
                      <td
                        colSpan={row.getVisibleCells().length}
                        className="p-0"
                      >
                        <div className="dark:border-b-dark-500 dark:bg-dark-750 sticky border-b border-b-gray-200 bg-gray-50 pt-3 pb-4 ltr:left-0 rtl:right-0">
                          {expandedRowActions[row.id]}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })
          ) : (
            <tr>
              <td
                className="table-td group/td text-center"
                colSpan={columns?.length}
              >
                {Object.keys(table.getState().filters).length > 0
                  ? "No results."
                  : null}
              </td>
            </tr>
          )}
        </TBody>
      </Table>
    </div>
  );
};

export default ListView;
