import { Checkbox } from "components/ui";
import {
  Actions,
  Address,
  Amount,
  BadgeCell,
  BundleCell,
  CollaboratorCell,
  DateAndTime,
  DefaultColumns,
  DropDown,
  Id,
  InputColumns,
  Profile,
  ProgressColumns,
} from "./Row";

const componentMap = {
  dropdown: (props) => <DropDown {...props} />,
  amount: (props) => <Amount {...props} />,
  date: (props) => <DateAndTime {...props} />,
  profile: (props) => <Profile {...props} />,
  id: (props) => <Id {...props} />,
  address: (props) => <Address {...props} />,
  badge: (props) => <BadgeCell {...props} />,
  bundle: (props) => <BundleCell {...props} />,
  collaborator: (props) => <CollaboratorCell {...props} />,
  progress: (props) => <ProgressColumns {...props} />,
  input: (props) => <InputColumns {...props} />,
  default: (props) => <DefaultColumns {...props} />,
};

const index = ({ columns: requirement, serialOffset, selectable }) => {
  let columns = [];

  if (selectable) {
    columns.push({
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            className="size-4.5"
            color="error"
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            className="size-4.5"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    });
  }

  columns.push({
    accessorKey: "serialNumber",
    header: "#",
    cell: ({ row }) => {
      return <span>{row.index + 1 + serialOffset}</span>;
    },
    enableSorting: false,
    enableHiding: false,

    className: "w-5",
  });

  for (let col of requirement) {
    let { label, field, type, enableHiding, enableSorting, actions, icon } =
      col;

    if (Array.isArray(actions) && field) {
      columns.push({
        accessorKey: field,
        header: "actions",
        cell: (props) => <Actions {...props} col={col} />,
        enableSorting: false,
        enableHiding: false,
        className: col.className || "w-20",
      });
    }

    if (!label || !field || actions) continue;

    const renderer = componentMap[type] || componentMap.default;

    let header = label;
    let viewLabel = header;
    if (icon) {
      header = (
        <div
          // className="flex items-center justify-center space-x-2"
          className="flex items-center space-x-2"
          data-tooltip
          data-tooltip-content={label}
        >
          {icon}
          {/* {label && <span>{label}</span>} */}
        </div>
      );

      viewLabel = (
        <div className="flex items-center space-x-2">
          {icon}
          {label && <span>{label}</span>}
        </div>
      );
    }
    columns.push({
      accessorKey: field,
      viewLabel,
      header: header,
      cell: (props) => renderer({ ...props, col }),
      enableSorting: enableSorting || false,
      enableHiding: enableHiding || false,
      className: col.className || "",
      sortingKey: col?.sortingKey || null,
    });
  }

  return columns;
};

export default index;
