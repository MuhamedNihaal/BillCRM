import { Avatar, Badge, Circlebar, Tag } from "components/ui";
import moment from "moment";
import { useConfirm } from "components/ConfirmModal";

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";

import { Button } from "components/ui";

import { ensureString } from "utils/ensureString";
import { Highlight } from "components/shared/Highlight";
import clsx from "clsx";
import { BadgeInfo, CheckIcon, ClockIcon, TrashIcon } from "lucide-react";
import {
  CalendarDateRangeIcon,
  DocumentDuplicateIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { Fragment } from "react";
import {
  amountCellSchema,
  badgeCellSchema,
  bundleCellSchema,
  collaboratorCellSchema,
  dropdownCellSchema,
} from "./schema.yup";
import { useClipboard, useDisclosure } from "hooks";
import Drawer from "components/Drawer";
import Inputs from "components/Inputs";

export const InputColumns = ({ row, col, ...props }) => {
  let data = row.getValue(col?.field);

  const handleChange = async ({ value }) => {
    row.original.inputValue = value;
  };

  if (data.disabled) {
    return <DefaultColumns {...props} row={row} col={col} />;
  }
  return <Inputs {...data} handleOnChange={(e) => handleChange(e)} />;
};

export const Actions = ({ row, table, col }) => {
  const [isDrawerOpen, { close: closeDrawer, open: openDrawer }] =
    useDisclosure(false);

  const confirm = useConfirm();
  let dropdown = col.dropdown;
  let actions = col?.actions || [];

  let lineList = [];
  let dropdownList = [];

  if (col.field) {
    let extra_actions = row.getValue(col.field);

    if (Array.isArray(extra_actions) && extra_actions.length > 0) {
      if (col?.isFieldDropdown) {
        dropdownList = [...extra_actions];
      } else {
        lineList = [...extra_actions];
      }
    }
  }

  if (!dropdown) {
    lineList = [...lineList, ...actions];
  } else {
    dropdownList = [...dropdownList, ...actions];
  }

  let data = row.original;
  let _id = data?._id ?? data.id ?? row.id ?? "";

  let handleClick = async (action) => {
    if (!action.onClick) return;

    if (typeof action.onClick !== "function") {
      console.log(
        `%cExpected a function for 'onClick', but received an invalid value. Please provide a valid function reference.`,
        "color: red; font-weight: bold;",
      );
      return;
    }

    table.options.meta.setTableSettings((prev) => ({
      ...prev,
      enableFullScreen: false,
    }));

    if (action.dialog) {
      let result = await confirm(action.dialog);
      if (result.status) {
        action.onClick({ id: _id, doc: data, action: result });
      }
    } else {
      action.onClick({ id: _id, doc: data });
    }
  };

  let onClickActions = (action) => {
    if (action?.drawer) {
      if (action?.subRow) {
        row.getToggleExpandedHandler()();
        table.getState().setExpandedRowActions((prev) => ({
          ...prev,
          [row.id]: action.children({
            isOpen: isDrawerOpen,
            close: () => row.getToggleExpandedHandler()(),
            doc: data,
          }),
        }));
      } else {
        openDrawer();
      }
    }
    handleClick(action);
  };

  return (
    <div
      className={clsx(
        "flex w-full justify-center gap-2",
        dropdownList?.length > 0 && "flex-row-reverse",
      )}
    >
      {dropdownList.length > 0 && (
        <Menu as="div" className="relative inline-block text-left">
          <MenuButton as={Button} isIcon className="size-5 rounded-full">
            <EllipsisHorizontalIcon className="size-4.5" />
          </MenuButton>
          <Transition
            as={Fragment}
            enter="transition ease-out"
            enterFrom="opacity-0 translate-y-2"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-2"
          >
            <MenuItems
              anchor={{ to: "bottom end", gap: 12 }}
              className="dark:border-dark-500 dark:bg-dark-750 absolute z-100 w-[14rem] rounded-lg border border-gray-300 bg-white py-0.5 shadow-sm shadow-gray-200/50 outline-hidden focus-visible:outline-hidden ltr:right-0 rtl:left-0 dark:shadow-none"
            >
              {dropdownList.map((action, idx) =>
                String(action?.label ?? "").toLowerCase() === "delete" ? (
                  <Fragment key={idx}>
                    <hr className="border-gray-150 dark:border-dark-500 mx-3 my-1.5 h-px" />
                    <MenuItem>
                      {({ focus }) => (
                        <button
                          onClick={() => onClickActions(action)}
                          className={clsx(
                            "this:error text-this dark:text-this-light flex h-7 w-full items-center space-x-3 px-3 tracking-wide transition-colors outline-none",
                            focus && "bg-this/10 dark:bg-this-light/10",
                          )}
                        >
                          {action?.icon || (
                            <TrashIcon className="size-4.5 stroke-1" />
                          )}
                          <span>Delete</span>
                        </button>
                      )}
                    </MenuItem>
                  </Fragment>
                ) : (
                  <MenuItem key={idx}>
                    {({ focus }) => (
                      <Button
                        isIcon
                        variant="outline"
                        {...(action?.tooltip &&
                          action?.tooltipContent && {
                            "data-tooltip": true,
                            "data-tooltip-content": action?.tooltipContent,
                          })}
                        onClick={() => onClickActions(action)}
                        className={clsx(
                          "text-this dark:text-this-light flex h-7 w-full items-center justify-start space-x-3 px-3 tracking-wide transition-colors outline-none",
                          focus &&
                            "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800",
                        )}
                      >
                        {action?.icon || <BadgeInfo />}
                        <span className="text-nowrap">
                          {action?.label ?? "Unknown"}
                        </span>
                      </Button>
                    )}
                  </MenuItem>
                ),
              )}
            </MenuItems>
          </Transition>
        </Menu>
      )}

      {lineList.length > 0 && (
        <div className="flex items-center justify-start gap-1">
          {lineList.map((action, idx) => (
            <Fragment key={idx}>
              <Button
                isIcon
                variant="outline"
                {...(action?.tooltip &&
                  action?.tooltipContent && {
                    "data-tooltip": true,
                    "data-tooltip-content": action?.tooltipContent,
                  })}
                onClick={() => {
                  onClickActions(action);
                }}
                key={idx}
                className={clsx(
                  "cursor-pointer",
                  action?.className,
                  row.getIsExpanded() && action?.drawer ? "rotate-180" : "",
                )}
              >
                {action?.icon || <BadgeInfo />}
              </Button>

              {typeof action.children === "function" && (
                <Drawer
                  position={action.position || "right"}
                  show={isDrawerOpen}
                  onClose={closeDrawer}
                >
                  {action.children({
                    isOpen: isDrawerOpen,
                    close: closeDrawer,
                    doc: data,
                  })}
                </Drawer>
              )}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export const DropDown = ({ row, column, table, col }) => {
  let data = row.getValue(col?.field);

  if (!dropdownCellSchema.isValidSync(data)) {
    console.log(
      `%cExpected an objects for 'dropdown', but received an invalid value. Please provide an object { value, options: [{label, value}]}`,
      "color: red; font-weight: bold;",
    );
    return null;
  }

  let value = {};
  let options = null;

  if (data.options) {
    value = data?.options.find(
      (item) =>
        String(item.value).toLowerCase() === String(data?.value).toLowerCase(),
    );

    options = data?.options;
  }

  const handleChangeStatus = (status) => {
    table.options.meta?.updateData({
      type: "dropdown",
      value: status,
      row,
      column,
    });
  };

  return (
    <Listbox value={value?.value} onChange={handleChangeStatus}>
      <ListboxButton
        as={Tag}
        component="button"
        disabled={data?.disabled}
        color={data?.value?.color || value?.color || "info"}
        className="cursor-pointer gap-1.5"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          if (!options || options.length === 0) {
            handleChangeStatus(data?.value?.value);
          }
        }}
      >
        {data?.value?.icon ? (
          <data.value.icon className="h-4 w-4" />
        ) : value?.icon ? (
          <value.icon className="h-4 w-4" />
        ) : null}
        <span>{data?.value?.label || value?.label}</span>
      </ListboxButton>

      {options?.length > 0 && (
        <Transition
          as={ListboxOptions}
          enter="transition ease-out"
          enterFrom="opacity-0 translate-y-2"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-2"
          anchor={{ to: "bottom start", gap: "8px" }}
          className="text-xs-plus shadow-soft dark:border-dark-500 dark:bg-dark-750 z-100 max-h-60 w-44 overflow-auto rounded-lg border border-gray-300 bg-white py-1 capitalize outline-hidden focus-visible:outline-hidden dark:shadow-none"
        >
          {options?.length > 0 &&
            options.map((item, idx) => (
              <ListboxOption
                key={idx}
                value={item.value}
                className={({ focus }) =>
                  clsx(
                    "dark:text-dark-100 relative flex cursor-pointer items-center justify-between space-x-2 px-3 py-2 text-gray-800 outline-hidden transition-colors select-none",
                    focus && "dark:bg-dark-600 bg-gray-100",
                  )
                }
              >
                {({ selected }) => {
                  return (
                    <div className="flex h-3 w-full items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        {item.icon && <item.icon className="size-4" />}
                        <span className="block max-w-[99px] truncate">
                          {item.label}
                        </span>
                      </div>
                      {selected ||
                        (item?.value === data?.value?.value && (
                          <CheckIcon className="-mr-1 size-4.5 stroke-1" />
                        ))}
                    </div>
                  );
                }}
              </ListboxOption>
            ))}
        </Transition>
      )}
    </Listbox>
  );
};

export const Amount = ({ row, col }) => {
  let data = row.getValue(col?.field);
  let amount = 0;
  let profit = null;
  let currency = col?.currency ?? "INR";

  if (!amountCellSchema.isValidSync(data)) {
    console.log(
      `%cExpected a string or an object for 'Amount', but received an invalid value. Please provide a valid string or object with { amount, profit, currency - optional }`,
      "color: red; font-weight: bold;",
    );
    return null;
  }

  if (typeof data === "number") {
    amount = detectNumbers(data, currency);
  } else if (typeof data === "string") {
    amount = detectNumbers(data, currency);
  } else {
    if (data?.currency) {
      currency = data.currency;
    }

    amount = detectNumbers(data.amount, currency);
    profit = data?.profit;
  }
  return (
    <div className="flex items-center justify-end space-x-2">
      <p className="dark:text-dark-100 text-gray-800">{amount}</p>
      {profit && (
        <Badge className="rounded-lg" color="success" variant="soft">
          {profit}%
        </Badge>
      )}
    </div>
  );
};

export const DateAndTime = ({ row, col }) => {
  let data = row.getValue(col?.field);
  let first = null;
  let second = null;

  if (typeof data === "string") {
    let timeValidate = moment(data, ["HH:mm", "HH:mm:ss"], true).isValid();
    if (timeValidate) {
      first = moment(data, "HH:mm").format("hh:mm A");
    } else {
      first = moment(data, "YYYY/MM/DD").format("DD/MM/YYYY");
    }
  } else {
    first = moment(data?.date, "YYYY/MM/DD").format("DD/MM/YYYY");
    second = moment(data?.time, "HH:mm").format("hh:mm A");
  }

  if (col.order == -1) {
    let temp = second;
    second = first;
    first = temp;
  }

  return (
    <>
      <p className="font-normal">{first !== "Invalid date" ? first : "----"}</p>
      {second && second !== "Invalid date" && (
        <p className="dark:text-dark-300 mt-0.5 text-xs text-gray-400">
          {second}
        </p>
      )}
    </>
  );
};

export const Profile = ({ row, col, column, table }) => {
  let data = row.getValue(col.field);
  const globalQuery = ensureString(table.getState().globalFilter);
  const columnQuery = ensureString(column.getFilterValue());

  let name = data?.name ?? "";
  let img = data?.img ?? "";

  return (
    <div className="flex items-center space-x-4">
      <Avatar
        size={9}
        name={name}
        src={img}
        classNames={{
          display: "mask is-squircle rounded-none text-sm",
        }}
        // initialColor={"auto"}
      />
      <span className="dark:text-dark-100 font-medium text-gray-800">
        <Highlight query={[globalQuery, columnQuery]}>{name}</Highlight>
      </span>
    </div>
  );
};

export const Id = ({ row, col, table, highlight }) => {
  let value = String(row.getValue(col.field));

  const { copied, copy } = useClipboard({ timeout: 2000 });
  const query = ensureString(table.getState()?.globalFilter);

  return (
    <div className="flex justify-center space-x-1">
      <span className="text-primary-600 dark:text-primary-400 font-medium">
        {highlight ? <Highlight query={query}>{value}</Highlight> : value}
      </span>

      {col?.copy && (
        <Button
          data-tooltip
          data-tooltip-content={copied ? "Copied" : "Copy"}
          onClick={() => copy(value)}
          isIcon
          variant="flat"
          className="size-5 rounded-full opacity-0 group-hover/td:opacity-100"
          aria-label="Copy Button"
        >
          <DocumentDuplicateIcon className="size-3.5" />
        </Button>
      )}
    </div>
  );
};

export const Address = ({ table, column, row, col }) => {
  const globalQuery = ensureString(table.getState().globalFilter);
  const columnQuery = ensureString(column.getFilterValue());

  const { copied, copy } = useClipboard({ timeout: 2000 });

  let value = String(row.getValue(col?.field) ?? "");

  return (
    <p className="text-xs-plus w-48 truncate xl:w-56 2xl:w-64">
      <Highlight query={[globalQuery, columnQuery]}>{value}</Highlight>
      {col?.copy && (
        <Button
          data-tooltip
          data-tooltip-content={copied ? "Copied" : "Copy"}
          onClick={() => copy(value)}
          isIcon
          variant="flat"
          className="size-5 rounded-full opacity-0 group-hover/td:opacity-100"
          aria-label="Copy Button"
        >
          <DocumentDuplicateIcon className="size-3.5" />
        </Button>
      )}
    </p>
  );
};

export const BadgeCell = ({ row, col }) => {
  const data = row.getValue(col?.field);
  let color = "neutral";
  let value = "";

  if (data == null || data == undefined) return null;

  if (!badgeCellSchema.isValidSync(data)) {
    console.log(
      `%cExpected a string or object for 'BadgeCell', but received an invalid value. Please provide a valid string or object.`,
      "color: red; font-weight: bold;",
    );

    return null;
  }

  if (typeof data === "object" && data !== null) {
    if (
      data.color &&
      [
        "success",
        "info",
        "error",
        "neutral",
        "warning",
        "secondary",
        "primary",
      ].includes(data.color)
    ) {
      color = data.color;
    }

    value = data.label ?? "";
  } else {
    value = data;
  }

  return (
    <div className="w-full h-full flex justify-center items-center">
      <Badge
        {...(data?.tooltip &&
          data?.tooltipContent && {
            "data-tooltip": true,
            "data-tooltip-content": data.tooltipContent,
          })}
        className="cursor-default gap-1.5 rounded-sm font-normal"
        color={color}
        variant={col?.variant ?? "outlined"}
      >
        {data?.icon && <data.icon className="h-4 w-4" />}
        {value}
      </Badge>
    </div>
  );
};

export const BundleCell = ({ row, col }) => {
  const data = row.getValue(col?.field);

  if (!bundleCellSchema.isValidSync(data)) {
    console.log(
      `%cExpected an object for 'bundle', but received an invalid value. Please provide a valid object. \nExpected an object with { img, title, time, count : { label, value }  }`,
      "color: red; font-weight: bold;",
    );
    return null;
  }

  let date = null;
  let time = null;
  if (data.date) {
    date = moment(data?.date, "YYYY/MM/DD").format("DD MMM YYYY");
  }

  if (date.time) time = data.time;

  return (
    <div className="flex max-w-xs items-center space-x-4 2xl:max-w-sm">
      <Avatar
        size={9}
        name={data?.title ?? ""}
        src={data?.img ?? ""}
        classNames={{
          display: "mask is-squircle rounded-none text-sm",
        }}
      />
      <div className="min-w-0">
        <p className="truncate">
          <a
            href={data?.link || "#"}
            className="hover:text-primary-600 dark:text-dark-100 dark:hover:text-primary-400 font-medium text-gray-700 transition-colors"
          >
            {data?.title ?? ""}
          </a>
        </p>
        <div className="mt-2 flex items-center space-x-2 text-xs">
          {date || time ? (
            <>
              <div className="flex shrink-0 items-center space-x-1">
                {date ? (
                  <>
                    <CalendarDateRangeIcon className="dark:text-dark-300 size-4 text-gray-400" />
                    <p className="opacity-80">{date}</p>
                  </>
                ) : (
                  <>
                    <ClockIcon className="dark:text-dark-300 size-4 text-gray-400" />
                    <p className="opacity-80">{time}</p>
                  </>
                )}
              </div>
              <div className="dark:bg-dark-500 mx-2 my-0.5 w-px self-stretch bg-gray-200"></div>
            </>
          ) : null}

          <p>
            <span>{data?.count?.value ?? 0}</span>
            <span className="opacity-80"> {data?.count?.label ?? ""}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export const CollaboratorCell = ({ row, col }) => {
  let data = row.getValue(col?.field);

  if (!collaboratorCellSchema.isValidSync(data)) {
    console.log(
      `%cExpected an array of objects for 'Collaborator', but received an invalid value. Please provide a valid array of objects [{ img, name }]`,
      "color: red; font-weight: bold;",
    );
    return null;
  }

  let visibleCount = col?.visibleCount || 5;
  let collaborators = data.slice(0, visibleCount);
  let extraCount = data.length - visibleCount;

  if (extraCount > 0) {
    collaborators.push({
      img: null,
      tooltip: `+${extraCount} more`,
      name: "+M",
    });
  }

  return (
    <div className="flex -space-x-2">
      {collaborators.map((item, idx) => (
        <Avatar
          key={idx}
          data-tooltip
          data-tooltip-content={item?.tooltip ?? item?.name ?? "Unknown"}
          size={8}
          name={item?.name ?? "Unknown"}
          src={item.img ?? ""}
          initialColor="auto"
          classNames={{
            root: "origin-bottom transition-transform hover:z-10 hover:scale-125",
            display: "dark:ring-dark-700 text-xs ring-3 ring-white",
          }}
        />
      ))}
    </div>
  );
};

export const ProgressColumns = ({ row, col }) => {
  let value = Number(row.getValue(col?.field));
  if (isNaN(value) || value < 0 || value > 100) {
    console.log(
      `%cExpected a number between 0 and 100 for 'progress', but received an invalid value. Please provide a valid number.`,
      "color: red; font-weight: bold;",
    );
    return null;
  }

  function getColorProgress(val) {
    if (val === 0) return "neutral";
    if (val === 100) return "success";
    if (val < 10) return "warning";
    if (val < 50) return "info";
    return "primary";
  }

  return (
    <Circlebar
      size={13}
      strokeWidth={9}
      value={value}
      color={getColorProgress(value)}
    >
      <div className="text-tiny-plus dark:text-dark-100 font-semibold text-gray-800">
        {value}%
      </div>
    </Circlebar>
  );
};

export const DefaultColumns = ({ row, table, col, highlight }) => {
  const query = ensureString(table.getState()?.globalFilter);
  const { copied, copy } = useClipboard({ timeout: 2000 });

  let value = "";
  if (typeof value !== "string") {
    console.log(
      `%cExpected a function for 'onClick', but received an invalid value. Please provide a valid function reference.`,
      "color: red; font-weight: bold;",
    );
    return null;
  }

  if (
    row.getValue(col?.field) !== null ||
    row.getValue(col?.field) !== undefined
  ) {
    value = row.getValue(col?.field);
  }
  if (value?.defaultValue) value = value.defaultValue;

  value = detectNumbers(value);

  return (
    <>
      <span>
        {highlight ? <Highlight query={query}>{value}</Highlight> : value}
      </span>

      {col?.copy && value ? (
        <Button
          data-tooltip
          data-tooltip-content={copied ? "Copied" : "Copy"}
          onClick={() => copy(value)}
          isIcon
          variant="flat"
          className="size-5 rounded-full opacity-0 group-hover/td:opacity-100"
          aria-label="Copy Button"
        >
          <DocumentDuplicateIcon className="size-3.5" />
        </Button>
      ) : null}
    </>
  );
};

const detectNumbers = (input, currency = null) => {
  const formatNumber = (num) => {
    const options = currency
      ? {
          style: "currency",
          currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }
      : {};
    return num.toLocaleString("en-IN", options);
  };

  if (typeof input === "number") {
    return formatNumber(input);
  }

  // if (typeof input === "string") {
  //   return input.replace(
  //     /\b\d{1,3}(?:\d{2})+(?:\.\d+)?|\b\d+(?:\.\d+)?/g,
  //     (match) => {
  //       const num = Number(match);
  //       return isNaN(num) ? match : formatNumber(num);
  //     },
  //   );
  // }

  return input;
};
