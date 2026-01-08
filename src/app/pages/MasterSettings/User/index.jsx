/* eslint-disable react-hooks/exhaustive-deps */
import Breadcrumb from "components/Breadcrumb";
import { Page } from "components/shared/Page";
import { Avatar, Collapse } from "components/ui";
import { useDidUpdate, useDisclosure } from "hooks";
import { Minus, Plus, User2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { del, get, put, queryString, toTop } from "utility";
import {
  CheckIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PencilIcon,
  PhoneIcon,
  ShieldCheckIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import TwdTable from "components/TwdTable";
import { API_URL } from "constants/app.constant";
import clsx from "clsx";
import { Switch } from "@headlessui/react";
import Modal from "components/Modal";
import SingleChange from "./SingleChange";
import AddUser from "./AddUser";
import { GET_OPTIONS } from "../config";
const User = () => {
  const [isExpanded, { toggle, open: collapseOpen }] = useDisclosure();
  const [isOpen, { open, close }] = useDisclosure();

  let [update, setUpdate] = useState(null);
  let [singleChange, setSingleChange] = useState({ id: null, type: null });
  let [refresh, setRefresh] = useState(0);

  let [privilegeOptions, setPrivilegeOptions] = useState([]);

  let [tableData, setTableData] = useState([]);
  const [filter, setFilter] = useState({});
  const [limit, setLimit] = useState(50);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(1);

  useEffect(() => {
    GET_OPTIONS(setPrivilegeOptions, { privilege: true });
  }, []);

  const handlePrivilege = async (
    e,
    id,
    { filterProps, pageCount, limitCount },
  ) => {
    try {
      await put("user/two-auth", { status: e, staffId: id });
      fetchTableList(filterProps, pageCount, limitCount);
    } catch (error) {
      console.log(error?.message);
    }
  };

  let genderMap = useMemo(
    () => ({
      1: { label: "Male", color: "info" },
      2: { label: "Female", color: "secondary" },
      3: { label: "Non-Binary", color: "neutral" },
    }),
    [],
  );

  const fetchTableList = useCallback(
    async (filterProps = filter, pageCount = page, limitCount = limit) => {
      try {
        let { data, count: countRes } = await get(
          `user/list?page=${pageCount}&limit=${limitCount}&${queryString(filterProps)}`,
        );

        let dataFormatted = data?.map((doc) => {
          let status = doc?.twoFactor?.enabled ?? false;
          return {
            ...doc,
            dateDisplay: doc?.date,
            nameDisplay: {
              img: `${API_URL}${doc?.image}`,
              name: `${doc?.firstName || ""} ${doc?.lastName || ""}`,
            },
            genderDisplay: genderMap[doc?.gender] || "",
            privilegeDisplay: doc?.privilege?.label || "",
            twoAuth: (
              <Switch
                checked={status}
                onChange={(e) => {
                  handlePrivilege(e, doc?._id, {
                    filterProps,
                    pageCount,
                    limitCount,
                  });
                }}
                className={clsx(
                  "relative inline-flex h-6 w-12 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors duration-200 ease-in-out outline-none focus:outline-none",
                  status
                    ? "this:primary bg-this dark:bg-this-light"
                    : "dark:bg-surface-1 bg-gray-300",
                )}
              >
                <span className="sr-only">Use setting</span>
                <span
                  aria-hidden="true"
                  className={`${
                    status
                      ? "translate-x-6 bg-white rtl:-translate-x-6"
                      : "dark:bg-dark-50 translate-x-0 bg-white"
                  } pointer-events-none flex size-4 transform items-center justify-center rounded-full shadow-lg ring-0 transition duration-200 ease-in-out`}
                >
                  {status ? (
                    <CheckIcon
                      className="text-primary-500 size-3"
                      style={{ strokeWidth: "3" }}
                    />
                  ) : (
                    <XMarkIcon
                      className="dark:text-dark-400 size-3 text-gray-500"
                      style={{ strokeWidth: "3" }}
                    />
                  )}
                </span>
              </Switch>
            ),
          };
        });

        setTableData(dataFormatted);
        setCount(countRes);
      } catch (error) {
        console.log("user fetching error occur", error?.message);
      }
    },
    [filter, page, limit],
  );

  useDidUpdate(() => {
    fetchTableList(filter, page, limit);
  }, [refresh]);

  const handleUpdate = useCallback((data) => {
    setUpdate(data);
    collapseOpen();
    toTop();
  }, []);

  const handleSingleUpdate = (data) => {
    setSingleChange(data);
    open();
  };

  const handelDelete = useCallback(
    async (id, action) => {
      try {
        await del(`user?other=${id}`);
        action?.setConfirmLoading(false);
        action?.setSuccess(true);
        setRefresh(Date.now());
      } catch (error) {
        action?.setConfirmLoading(false);
        action?.setError(true);
        console.log("Error deleting corporative:", error?.message);
      }
    },
    [filter, page, limit, fetchTableList],
  );

  const tableConfig = useMemo(() => {
    return {
      columns: [
        {
          field: "dateDisplay",
          label: "Date",
          type: "date",
          enableSorting: true,
          enableHiding: false,
        },
        {
          field: "nameDisplay",
          label: "Name",
          type: "profile",
          enableSorting: true,
          enableHiding: false,
        },
        {
          field: "username",
          label: "Username",
          enableSorting: true,
          enableHiding: true,
        },
        {
          field: "mobile",
          label: "Mobile",

          enableSorting: true,
          enableHiding: true,
        },
        {
          field: "email",
          label: "Email",

          enableSorting: true,
          enableHiding: true,
          defaultHiding: true,
        },
        {
          field: "privilegeDisplay",
          label: "Privilege",

          type: "badge",
          enableSorting: true,
          enableHiding: true,
        },
        {
          field: "genderDisplay",
          label: "Gender",
          type: "badge",
          enableSorting: true,
          enableHiding: true,
        },
        {
          field: "twoAuth",
          label: "Two Auth",
          enableSorting: true,
          enableHiding: true,
        },
        {
          label: "actions",
          field: "extra_actions",
          dropdown: false,
          actions: [
            {
              label: "Change Privilege",
              icon: <ShieldCheckIcon className="size-4.5 stroke-1" />,
              onClick: ({ doc }) => {
                handleSingleUpdate({
                  id: doc?._id,
                  type: 1,
                  privilege: doc?.privilege,
                });
              },
            },
            {
              label: "Change Password",
              icon: <LockClosedIcon className="size-4.5 stroke-1" />,
              onClick: ({ doc }) => {
                handleSingleUpdate({ id: doc?._id, type: 2 });
              },
            },
            {
              label: "Edit",
              icon: <PencilIcon className="size-4.5 stroke-1" />,
              onClick: ({ doc }) => {
                handleUpdate(doc);
              },
            },
            {
              label: "Delete",
              icon: <TrashIcon className="size-4.5 stroke-1" />,
              onClick: ({ id, action }) => handelDelete(id, action),
              dialog: {
                pending: {
                  title: "Are you sure?",
                  description: "Are you sure you want to delete this user?",
                  actionText: "Delete",
                },
                success: {
                  title: "User deleted",
                  description: "The user has been successfully deleted.",
                },
                error: {
                  title: "Error deleting user",
                  description:
                    "An error occurred while deleting the user. Please try again later.",
                },
              },
            },
          ],
        },
      ],
      rows: tableData,
    };
  }, [tableData, handleUpdate, handelDelete]);

  return (
    <Page title="Users">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
        <Breadcrumb
          title={"Users"}
          options={[
            {
              label: "Add User",
              SwapOn: Minus,
              SwapOff: Plus,
              onClick: toggle,
              active: isExpanded,
            },
          ]}
        />
        <Collapse in={isExpanded}>
          <AddUser data={update} setData={setUpdate} setRefresh={setRefresh} />
        </Collapse>

        <Modal
          isOpen={isOpen}
          close={() => {
            close();
          }}
          title={`Change ${singleChange.type == 1 ? "Privilege" : singleChange.type == 2 ? "Password" : ""} `}
        >
          <SingleChange
            data={singleChange}
            setRefresh={setRefresh}
            close={close}
          />
        </Modal>

        <TwdTable
          data={tableConfig}
          count={count}
          facedFilter={[
            {
              type: "text",
              icon: User2,
              placeholder: "Search...",
              name: "search",
            },
          ]}
          selectable={false}
          tabs={{
            filter: "privilege",
            options: [
              {
                label: "All",
                value: "",
              },
              ...privilegeOptions,
            ],
          }}
          handleFilterChange={(filterProps, pageCount, limitCount) => {
            fetchTableList(filterProps, pageCount, limitCount);
            setFilter(filterProps);
            setPage(pageCount);
            setLimit(limitCount);
          }}
        >
          {({ column, doc }) => {
            let name = `${doc?.firstName || ""} ${doc?.lastName || ""}`;
            return (
              <>
                <div className="flex w-full items-center justify-between pb-5">
                  {column?.privilegeDisplay}

                  <div data-tooltip data-tooltip-content="Two Auth">
                    {column.twoAuth}
                  </div>
                </div>

                <Avatar
                  {...{
                    "data-tooltip": true,
                    "data-tooltip-content": name,

                    size: 18,
                    classNames: {
                      display: "text-xl",
                    },
                    component: "button",
                    src: doc.image || "",
                    name: name,
                    initialColor: "auto",
                  }}
                />

                <h3 className="dark:text-dark-100 mt-2 text-base font-medium text-gray-800 capitalize">
                  {name}
                </h3>

                <div className="mx-auto mt-4 inline-grid grid-cols-1 gap-3">
                  {doc?.mobile && (
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="bg-primary-600/10 text-primary-600 dark:bg-primary-400/10 dark:text-primary-400 flex size-6 items-center justify-center rounded-lg">
                        <PhoneIcon className="size-3.5" />
                      </div>
                      <p className="truncate"> {doc?.mobile}</p>
                    </div>
                  )}
                  {doc?.email && (
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="bg-primary-600/10 text-primary-600 dark:bg-primary-400/10 dark:text-primary-400 flex size-6 items-center justify-center rounded-lg">
                        <EnvelopeIcon className="size-3.5" />
                      </div>
                      <p className="truncate"> {doc?.email}</p>
                    </div>
                  )}

                  <div className="flex justify-center items-center gap-1 py-2 w-full">
                    {column?.extra_actions}
                  </div>
                </div>
              </>
            );
          }}
        </TwdTable>
      </div>
    </Page>
  );
};

export default User;
