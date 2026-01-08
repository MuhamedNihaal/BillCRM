import clsx from "clsx";
import { Card } from "components/ui";

const GridView = ({ table, ...props }) => {
  const rows = table.getRowModel().rows;

  const enableFullScreen = table.getState().tableSettings.enableFullScreen;

  return (
    <div
      className={clsx(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4",
        enableFullScreen && "overflow-y-auto px-4 sm:px-5",
      )}
    >
      {rows.length ? (
        rows.map((row) => (
          <Item key={row.id} row={row} table={table} {...props} />
        ))
      ) : (
        <div className="col-span-12 p-3 text-center">No results.</div>
      )}
    </div>
  );
};

export default GridView;

function Item({ row, children, flexRender }) {
  const columnData = row.getAllCells().reduce((acc, cell) => {
    const { column } = cell;
    // const value = cell?.getValue() || null;

    const context = cell.getContext();

    acc[column.id] = flexRender(column.columnDef.cell, context);
    return acc;
  }, {});

  let doc = row.original;
  return (
    <Card
      className={clsx(
        "px-3 py-2.5 text-center",
        row.getIsSelected() && "ring-primary-500/50 ring-3",
      )}
    >
      {typeof children === "function"
        ? children({ doc, column: columnData })
        : children}
    </Card>
  );
}
