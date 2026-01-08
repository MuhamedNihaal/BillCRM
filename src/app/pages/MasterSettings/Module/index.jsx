import { useCallback, useMemo, useState } from "react";
import clsx from "clsx";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

//! Local Import
import { useDidUpdate, useDisclosure } from "hooks";
import { get, queryString } from "utility";
import Breadcrumb from "components/Breadcrumb";
import { Page } from "components/shared/Page";
import TwdTable from "components/TwdTable";
import Modal from "components/Modal";
import DynamicIcon from "components/DynamicIcon";
import ModuleEdit from "../components/ModuleEdit";
import ModuleAllow from "../components/ModuleAllow";
import { EditIcon } from "configs/global.icons";

const Modules = () => {
  const [isOpen, { open, close }] = useDisclosure(false);

  let [tableData, setTableData] = useState([]);
  const [filter, setFilter] = useState({});
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(1);
  let [refresh, setRefresh] = useState(0);

  let [allowedList, setAllowedList] = useState({
    status: false,
    name: "",
    type: 1,
    id: "",
  });

  let [update, setUpdate] = useState({ _id: null, name: "" });

  const handleToggle = ({ status = false, name = "", type = 1, id = "" }) => {
    setAllowedList({ status, name, type, id });
  };

  const handleAllowed = useCallback((data) => {
    let { id, doc } = data;
    handleToggle({ status: true, id, name: doc?.name ?? "" });
  }, []);

  let handleUpdate = useCallback(
    (obj = {}) => {
      setUpdate(obj);
      open();

      if (obj?._id) open();
      else close();
    },
    [open, close],
  );

  const fetchTableList = useCallback(
    async (filterProps = filter, pageCount = page, limitCount = limit) => {
      try {
        let { data, count: countRes } = await get(
          `module?page=${pageCount}&limit=${limitCount}&${queryString(filterProps)}`,
        );

        let dataFormatted = data?.map((doc) => {
          return {
            ...doc,
            dateDisplay: doc?.date,
            iconDisplay: (
              <button
                className={clsx(
                  "relative flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg outline-hidden transition-colors duration-200",
                  "bg-primary-600/10 text-primary-600 dark:bg-primary-400/15 dark:text-primary-400",
                )}
              >
                <DynamicIcon name={doc?.icon} />
              </button>
            ),
            actions: [
              {
                label: "Edit",
                icon: <EditIcon className="size-4.5 stroke-1" />,
                onClick: ({ id, doc }) => {
                  let obj = {
                    _id: id,
                    name: doc?.name || "",
                    code: doc?.code || "",
                    icon: doc?.icon || "",
                    redirectUrl: doc?.redirectUrl || "",
                  };

                  handleUpdate(obj);
                },
              },
              {
                label: "Permission",
                icon: <ShieldCheckIcon className="size-4.5 stroke-1" />,
                onClick: handleAllowed,
              },
            ].filter(Boolean),
          };
        });
        setTableData(dataFormatted);
        setCount(countRes);
      } catch (error) {
        console.log("module fetching error occur", error?.message);
      }
    },
    [filter, page, limit, handleAllowed, handleUpdate],
  );

  useDidUpdate(() => {
    fetchTableList(filter, page, limit);
  }, [refresh]);

  const tableConfig = useMemo(
    () => ({
      columns: [
        {
          field: "code",
          label: "Code",
          type: "badge",
          enableSorting: false,
          enableHiding: false,
          className: "text-center",
        },
        {
          field: "name",
          label: "Module Name",
          enableSorting: false,
          enableHiding: false,
        },
        {
          field: "iconDisplay",
          label: "Icon",
          enableSorting: false,
          enableHiding: false,
          className: "text-center",
        },
        {
          field: "redirectUrl",
          label: "Redirect Url",
          type: "link",

          enableSorting: false,
          enableHiding: false,
        },
        {
          label: "Actions",
          field: "actions",
          dropdown: false,
          actions: [],
        },
      ],
      rows: tableData,
    }),
    [tableData],
  );

  return (
    <Page title="Modules">
      <div className="transition-content w-full px-(--margin-x) pt-3 lg:pt-3">
        <Breadcrumb title={"Modules"} />

        <TwdTable
          data={tableConfig}
          count={count}
          selectable={false}
          handleFilterChange={(filterProps, pageCount, limitCount) => {
            fetchTableList(filterProps, pageCount, limitCount);
            setFilter(filterProps);
            setPage(pageCount);
            setLimit(limitCount);
          }}
        />

        <Modal
          title={`${allowedList.name} Module: Approved Privileges`}
          isOpen={allowedList.status}
          close={handleToggle}
        >
          <ModuleAllow
            allowedList={allowedList}
            setAllowedList={setAllowedList}
          />
        </Modal>

        <Modal title="Update Module" isOpen={isOpen} close={handleUpdate}>
          <ModuleEdit
            data={update}
            close={close}
            setRefresh={setRefresh}
            isOpen={isOpen}
            DynamicIcon={DynamicIcon}
          />
        </Modal>
      </div>
    </Page>
  );
};

export default Modules;
