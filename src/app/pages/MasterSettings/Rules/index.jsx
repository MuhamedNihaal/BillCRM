/* eslint-disable no-unused-vars */
import { Page } from "components/shared/Page";
import Breadcrumb from "components/Breadcrumb";
import { forwardRef, memo, useCallback, useEffect, useState } from "react";
import { Checkbox, Table, TBody, Td, Th, THead, Tr } from "components/ui";
import clsx from "clsx";
import { CornerDownRight, Notebook } from "lucide-react";
import Switch from "components/Switch";
import { cn } from "lib/utils";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import FacedFilter from "components/FacedFilter";
import { get, post, queryString } from "utility";
import { useConfirm } from "components/ConfirmModal";
import { toast } from "sonner";
import { Highlight } from "components/shared/Highlight";
import DynamicIcon from "components/DynamicIcon";
import { isArray } from "utils/isArray";
import { checkAllPermissionStatuses } from "./config";

const Index = () => {
  let [selectOptions, setSelectOptions] = useState({});
  let [filter, setFilter] = useState({});
  let [search, setSearch] = useState("");

  let fetchOptions = async (URL, NAME) => {
    try {
      let res = await get(`options/${URL}`);
      setSelectOptions((prev) => ({ ...prev, [NAME]: res?.data }));
    } catch (err) {
      console.log(`${NAME} option fetching error`, err);
    }
  };

  useEffect(() => {
    fetchOptions("privilege", "privilege");
    fetchOptions("module", "modules");
  }, []);

  return (
    <Page title="Rules">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
        <Breadcrumb title="Rules" />
        <div className="mt-3 flex space-x-2">
          <FacedFilter
            handleFilter={setFilter}
            config={[
              {
                type: "select",
                icon: ShieldCheckIcon,
                title: "Privilege",
                name: "privilege",
                options: selectOptions?.privilege || [],
              },
              {
                type: "select",
                icon: Notebook,
                title: "Module",
                name: "module",
                options: selectOptions?.modules || [],
              },
            ]}
          />
        </div>
        <DataTable filter={filter} search={search} />
      </div>
    </Page>
  );
};

export default Index;

const DataTable = memo(({ filter, search }) => {
  const confirm = useConfirm();

  const [tableData, setTableData] = useState([]);

  const fetchTableData = useCallback(async () => {
    try {
      const { data } = await get(`module/rules?${queryString(filter)}`);
      setTableData(data);
    } catch (error) {
      console.error(error);
    }
  }, [filter]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  const handleAccess = async ({ e, key, item, isSub, moduleId, menuId }) => {
    let checked = e.target.checked;
    let confirmAction = null;

    try {
      let payload = {
        privilegeId: filter?.privilege,
        moduleId: item?._id,
        status: e,
        type: 1,
      };

      if (key === "full") {
        if (item?.subMenus?.length > 0) {
          confirmAction = await confirm({
            pending: {
              title: `Do you want to ${!checked ? "remove" : "give"} full access?`,
              description: !checked
                ? "Removing full access will revoke permissions from all sub menus as well."
                : "Granting full access will automatically include permissions for all sub menus.",
              actionText: !checked ? "Remove Full Access" : "Give Full Access",
              actionText2: "Cancel",
            },
            success: {
              title: "Access granted",
              description: "The permissions have been successfully updated.",
            },
            error: {
              title: "Access failed",
              description:
                "Something went wrong while updating access. Please try again.",
            },
          });

          if (confirmAction.status) {
            payload = {
              privilegeId: filter?.privilege,
              moduleId: moduleId,
              menuId: item?._id,
              type: 2,

              view: checked,
              create: checked,
              edit: checked,
              remv: checked,
              fullEnable: isArray(item?.subMenus).length > 0,
            };
          } else {
            return;
          }
        } else {
          payload = {
            privilegeId: filter?.privilege,
            moduleId: moduleId,
            ...(isSub
              ? { subMenuId: item?._id, type: 3 }
              : { menuId: item?._id, type: 2 }),

            ...(menuId && {
              menuId: menuId,
            }),
            view: checked,
            create: checked,
            edit: checked,
            remv: checked,
          };
        }
      } else if (key === "bulk_enabled") {
        payload = {
          ...item,
          privilegeId: filter?.privilege,
          moduleId: moduleId,
          status: checked,
          type: 4,
        };
      } else {
        payload = {
          privilegeId: filter?.privilege,
          moduleId: moduleId,
          ...(isSub
            ? { subMenuId: item?._id, type: 3 }
            : { menuId: item?._id, type: 2 }),

          ...(menuId && {
            menuId: menuId,
          }),
          view: item?.view || false,
          create: item?.create || false,
          edit: item?.edit || false,
          remv: item?.remv || false,
        };
        payload[key] = checked;
      }

      await post("module/rules", payload);

      if (confirmAction) {
        confirmAction.setConfirmLoading(false);
        confirmAction.setSuccess(true);
      }

      fetchTableData();
    } catch (error) {
      console.log(error);
      if (confirmAction) {
        confirmAction.setConfirmLoading(false);
        confirmAction.setDialogContent({
          error: { title: "Access failed", description: error.message },
        });
        confirmAction.setError(true);
      } else {
        toast.error(error?.message);
      }
    }
  };

  function areAllPermissions(menus, expectedValue = true) {
    const keys = ["enabled", "create", "view", "edit", "remv"];

    return menus.every((menu) => {
      const hasAll = keys.every((key) => menu[key] === expectedValue);

      const subAll = menu.subMenus.every((sub) =>
        keys.every((key) => sub[key] === expectedValue),
      );

      return hasAll && subAll;
    });
  }

  const enableModule = async ({ e, item }) => {
    let result = null;

    try {
      let allTrue = areAllPermissions(item?.mainMenus);
      let allFalse = areAllPermissions(item?.mainMenus, false);

      let payload = {
        privilegeId: filter?.privilege,
        moduleId: item?._id,
        status: e,
        type: 1,
        fullEnable: false,
      };

      if ((!allTrue && e) || (!e && !allFalse)) {
        result = await confirm({
          pending: {
            title: `Do you want to ${e ? "give" : "remove"} full access including Main Menu and Sub Menu?`,
            description: `You can choose to ${e ? "apply" : "remove"} full access to all Main Menu and Sub Menu as well.`,
            actionText: e ? "Give Full Access" : "Remove Full Access",
            actionText2: "Only Main Menu",
          },
          success: {
            title: "Access granted",
            description: "The permissions have been successfully updated.",
          },
          error: {
            title: "Access failed",
            description:
              "Something went wrong while updating access. Please try again.",
          },
        });
      }

      if (result?.status) payload.fullEnable = true;

      await post("module/rules", payload);

      fetchTableData();
      if (result && result.status) {
        result.setConfirmLoading(false);
        result.setSuccess(true);
      }
    } catch (error) {
      if (result) {
        result.setDialogContent({
          error: { title: "Access failed", description: error?.message },
        });
        result.setConfirmLoading(false);
        result.setError(true);
      } else {
        toast.error(error?.message);
      }
    }
  };

  const renderRow = ({
    item,
    isDisabled,
    isSub = false,
    moduleId = "",
    menuId = null,
    isSubMenusHave = false,
  }) => {
    const hasFullAccess =
      item?.view && item?.create && item?.edit && item?.remv;

    return (
      <Tr
        key={item._id || item.name}
        className={cn(
          "dark:border-b-dark-500 border-y border-transparent border-b-gray-200",
          isDisabled && "dark:bg-dark-700 cursor-not-allowed bg-gray-50",
        )}
      >
        <TdC className={clsx("flex items-center gap-1", isSub && "pl-6")}>
          <Checkbox
            color="info"
            className=""
            onChange={(e) => {
              handleAccess({
                e,
                key: "enabled",
                item,
                isSub,
                moduleId,
                menuId,
              });
            }}
            data-tooltip
            data-tooltip-content="Enable/Disable"
            checked={item.enabled}
            disabled={isDisabled}
          />
          {isSub && <CornerDownRight className="ml-1 size-4" />}
          <h3 className="w-80 truncate">
            {item.icon && (
              <DynamicIcon
                name={item.icon}
                className={clsx(
                  "dark:text-dark-200 dark:group-hover:text-dark-100 dark:group-focus:text-dark-100 text-gray-500 group-hover:text-gray-600 group-focus:text-gray-600",
                  "text-this dark:text-this-light",
                  "size-4.5 transition-colors",
                  "mr-1.5 inline-block size-4",
                )}
              />
            )}

            <span
              className={isDisabled ? "cursor-not-allowed" : "cursor-pointer"}
              onClick={(e) => {
                handleAccess({
                  e: { target: { checked: !item.enabled } },
                  key: "enabled",
                  item,
                  isSub,
                  moduleId,
                  menuId,
                });
              }}
            >
              <Highlight query={search}>{item.name}</Highlight>
            </span>
          </h3>
        </TdC>
        {isSubMenusHave ? (
          <TdC colSpan={5}>
            <Switch
              status={item?.view || false}
              disabled={isDisabled}
              onChange={(e) => {
                handleAccess({
                  e: { target: { checked: e } },
                  key: "full",
                  item,
                  isSub,
                  moduleId,
                  menuId,
                });
              }}
            />
          </TdC>
        ) : (
          ["full", "view", "create", "edit", "remv"].map((key, idx) => {
            const checked =
              key === "full" ? hasFullAccess : item?.[key] || false;
            return (
              <TdC key={idx}>
                <button
                  {...(key === "view" &&
                    (item?.create || item?.edit || item?.remv) && {
                      "data-tooltip": true,
                      "data-tooltip-content":
                        "This field has been disabled as all three permissions—Create, Edit, and Delete—are currently enabled",
                    })}
                >
                  <Checkbox
                    color={key === "full" ? "info" : "primary"}
                    onChange={(e) => {
                      handleAccess({ e, key, item, isSub, moduleId, menuId });
                    }}
                    {...(key === "full" &&
                      item?.view && { indeterminate: !checked })}
                    checked={checked}
                    disabled={
                      isDisabled ||
                      (key === "view" &&
                        (item?.create || item?.edit || item?.remv))
                    }
                  />
                </button>
              </TdC>
            );
          })
        )}
      </Tr>
    );
  };

  if (tableData?.length === 0) {
    return (
      <div className="flex h-20 w-full items-center justify-center">
        <h1>No privilege selected. Please choose one.</h1>
      </div>
    );
  }

  return (
    <div>
      {tableData?.map((module, idx) => {
        const isDisabled = !(module?.moduleStatus || false);
        let _status = checkAllPermissionStatuses(isArray(module?.mainMenus));

        return (
          <div
            className="hide-scrollbar dark:border-dark-500 mt-2 min-w-full overflow-x-auto rounded-lg border border-gray-200"
            key={idx}
          >
            <Table className="w-full text-left rtl:text-right">
              <THead>
                <Tr className="dark:border-b-dark-500 border-y border-transparent border-b-gray-200">
                  <ThC className="flex items-center space-x-10">
                    <h1 className="text-base">{module?.name || ""}</h1>
                    <Switch
                      status={module?.moduleStatus || false}
                      onChange={(e) => {
                        enableModule({ e, item: module });
                      }}
                    />
                  </ThC>
                </Tr>
              </THead>
              <TBody>
                <Tr className="dark:border-b-dark-500 border-y border-transparent border-b-gray-200">
                  <TdC />
                  {[
                    { label: "Full Access", value: "enabled" },
                    { label: "View", value: "view" },
                    { label: "Create", value: "create" },
                    { label: "Edit", value: "edit" },
                    { label: "Delete", value: "remv" },
                  ].map((head, idx) => (
                    <TdC key={idx}>
                      <div className="flex flex-col gap-2">
                        <h3 className="font-semibold">{head.label}</h3>

                        {head.label === "Full Access" ? (
                          <div>
                            <span>&nbsp;</span>
                          </div>
                        ) : (
                          <div>
                            <Checkbox
                              color={"primary"}
                              data-tooltip={true}
                              data-tooltip-content={`${head.label} Access`}
                              disabled={
                                isDisabled ||
                                ["remv", "edit", "create"].some(
                                  (key) =>
                                    ["full", "some"].includes(_status[key]) &&
                                    head.value === "view" &&
                                    _status[head.value] === "full",
                                )
                              }
                              indeterminate={_status[head.value] === "some"}
                              checked={_status[head.value] === "full"}
                              onChange={(e) => {
                                handleAccess({
                                  e,
                                  key: "bulk_enabled",
                                  moduleId: module?._id,
                                  item: {
                                    [head.value]: e?.target?.checked ?? false,
                                  },
                                });
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </TdC>
                  ))}
                </Tr>

                {(module.mainMenus || []).flatMap((menu) => [
                  renderRow({
                    item: menu,
                    isDisabled,
                    moduleId: module?._id,
                    isSubMenusHave: isArray(menu.subMenus)?.length > 0,
                  }),
                  ...(menu.subMenus || []).map((sub) =>
                    renderRow({
                      item: sub,
                      isDisabled: isDisabled || !menu?.enabled,
                      isSub: true,
                      moduleId: module?._id,
                      menuId: menu?._id,
                    }),
                  ),
                ])}
              </TBody>
            </Table>
          </div>
        );
      })}
    </div>
  );
});
DataTable.displayName = "DataTable";

const TdC = memo(
  forwardRef(({ children, className, colSpan }, ref) => (
    <Td className={clsx("p-1.5", className)} colSpan={colSpan} ref={ref}>
      {children}
    </Td>
  )),
);
TdC.displayName = "TdC";

const ThC = memo(
  forwardRef(({ className, children }, ref) => (
    <Th
      className={clsx(
        "dark:text-dark-100 p-1.5 font-semibold text-gray-800 capitalize",
        className,
      )}
      ref={ref}
    >
      {children}
    </Th>
  )),
);
ThC.displayName = "ThC";
