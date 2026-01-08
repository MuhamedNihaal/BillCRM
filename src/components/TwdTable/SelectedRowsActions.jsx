// Import Dependencies
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import { TrashIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Fragment, useState } from "react";
import PropTypes from "prop-types";

// Local Imports
import { Button } from "components/ui";
import { CircleArrowRight } from "lucide-react";
import Inputs from "components/Inputs";

// ----------------------------------------------------------------------

export function SelectedRowsActions({ table, selectableOptions }) {
  const [master, setMaster] = useState({ selected: {} });

  let menus = [];
  let buttons = selectableOptions.slice(0, 3);

  if (selectableOptions.length > 3) {
    menus = selectableOptions.slice(3);
  }

  const selectedRows = table.getSelectedRowModel().rows;

  const handleClick = (btn) => {
    let selectedObj = [];
    let ids = [];
    selectedRows?.forEach(({ original }) => {
      if (original?._id) ids.push(original?._id);
      selectedObj.push(original);
    });

    if (typeof btn.onClick === "function") {
      btn.onClick({ ids, doc: selectedObj, data: master, table });
    }
  };

  return (
    <Transition
      as={Fragment}
      show={table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()}
      enter="transition-all duration-200"
      enterFrom="opacity-0 translate-y-4"
      enterTo="opacity-100 translate-y-0"
      leave="transition-all duration-150"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 translate-y-4"
    >
      <div className="dark:bg-dark-100 dark:text-dark-900 w-full rounded-b-lg bg-gray-800 text-gray-100 capitalize first:ltr:rounded-tl-lg first:rtl:rounded-tr-lg last:rtl:rounded-tl-lg">
        <div className="flex h-12 items-center justify-between rounded-b-lg px-4 sm:px-5">
          <p>
            <span>{selectedRows.length} Selected</span>
            <span className="max-sm:hidden">
              {" "}
              from {table.getCoreRowModel().rows.length}
            </span>
          </p>

          <div className="flex flex-1 justify-end space-x-1.5">
            {buttons.map((btn, idx) => {
              if (btn.type === "select") {
                return (
                  <Inputs
                    key={idx}
                    type="select"
                    name={btn.name || "select-action"}
                    options={btn.options || []}
                    value={master.selected?.[btn.name] || btn.selected || ""}
                    handleOnChange={(selected) => {
                      if (typeof btn.onChange === "function") {
                        btn.onChange(selected);
                      } else {
                        setMaster((prev) => ({
                          ...prev,
                          [selected.name]: selected.value,
                          selected: {
                            ...prev.selected,
                            [selected.name]: selected,
                          },
                        }));
                      }
                    }}
                    disabled={selectedRows.length <= 0}
                    className={clsx(btn.className)}
                    // classNames={clsx(btn.classNames)}
                    classNames={{
                      control: "dark:bg-dark-600! bg-gray-100!",
                      placeholder:
                        "text-dark-900! font-normal! dark:text-gray-50!",
                    }}
                    // classNames={clsx(
                    //   "dark:text-dark-700! focus:ring-primary-500 rounded-md border-none bg-gray-700 text-gray-100 focus:ring-2 dark:bg-gray-300!",
                    //   btn.className,
                    // )}
                  />
                );
              } else {
                let Icon = btn.icon
                  ? btn.icon
                  : btn.type === "delete"
                    ? TrashIcon
                    : CircleArrowRight;

                return (
                  <Button
                    key={idx}
                    onClick={() => handleClick(btn)}
                    // className={clsx(
                    //   "text-xs-plus w-7 space-x-1.5 rounded-full px-3 py-1.5 sm:w-auto sm:rounded-sm",
                    //   // btn.className,
                    // )}
                    className={clsx(
                      "text-xs-plus w-7 space-x-1.5 rounded-full px-3 py-1.5 sm:w-auto sm:rounded-sm",
                      btn.className,
                    )}
                    {...(btn.type === "delete" && { color: "error" })}
                    disabled={selectedRows.length <= 0}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="text-nowrap max-sm:hidden">
                      {btn?.label || ""}
                    </span>
                  </Button>
                );
              }
            })}

            {/* Menus (More actions) */}
            {menus?.length > 0 && (
              <Menu as="div" className="relative inline-block text-left">
                <MenuButton
                  as={Button}
                  className="text-xs-plus w-7 gap-1.5 rounded-full px-3 py-1.5 sm:w-auto sm:rounded-sm"
                >
                  <EllipsisHorizontalIcon className="size-4 shrink-0" />
                  <span className="max-sm:hidden"> More</span>
                </MenuButton>
                <Transition
                  as={MenuItems}
                  enter="transition ease-out"
                  enterFrom="opacity-0 translate-y-2"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-2"
                  className="text-xs-plus shadow-soft dark:border-dark-500 dark:bg-dark-750 dark:text-dark-200 absolute z-100 min-w-[10rem] rounded-lg border border-gray-300 bg-white py-1 text-gray-600 outline-hidden focus-visible:outline-hidden dark:shadow-none"
                  anchor={{ to: "top end", gap: 6 }}
                >
                  {menus.map((menu, idx) => {
                    let Icon = menu?.icon || CircleArrowRight;
                    return (
                      <MenuItem key={idx}>
                        {({ focus }) => (
                          <button
                            className={clsx(
                              "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                              focus &&
                                "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800",
                            )}
                            onClick={() => handleClick(menu)}
                          >
                            <Icon className="size-4.5" />
                            <span>{menu?.label || ""}</span>
                          </button>
                        )}
                      </MenuItem>
                    );
                  })}
                </Transition>
              </Menu>
            )}
          </div>
        </div>
      </div>
    </Transition>
  );
}

SelectedRowsActions.propTypes = {
  table: PropTypes.object,
};
