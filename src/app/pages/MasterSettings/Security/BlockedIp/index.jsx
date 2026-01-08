/* eslint-disable react-hooks/exhaustive-deps */
import Breadcrumb from "components/Breadcrumb";
import { Page } from "components/shared/Page";
import TwdTable from "components/TwdTable";
import { User2 } from "lucide-react";
import moment from "moment";
import { useCallback, useMemo, useState } from "react";
import { MdLockOpen, MdLockOutline } from "react-icons/md";
import { toast } from "sonner";
import { get, put, queryString } from "utility";

const BlockedIp = () => {
  let [tableData, setTableData] = useState([]);
  const [filter, setFilter] = useState({});
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(1);

  let blockHandler = useCallback(async (username, status) => {
    try {
      let { message } = await put(`blocked`, { username, type: status });
      toast.success(message || "Status updated");
      fetchTableList();
    } catch (error) {
      toast.error(error?.message ?? "Status update failed");
      console.log("Error occur while status updating", error?.message);
    }
  }, []);

  let statusMap = {
    0: {
      statusDisplay: {
        value: {
          label: "Active",
          icon: MdLockOpen,
          value: 0,
          color: "success",
        },
        options: [
          {
            icon: MdLockOutline,
            label: "Block",
            value: 2,
            color: "error",
          },
        ],
      },
    },
    2: {
      statusDisplay: {
        value: {
          label: "Blocked",
          icon: MdLockOutline,
          value: 2,
          color: "error",
        },
        options: [
          {
            label: "Active",
            icon: MdLockOpen,
            value: 0,
            color: "success",
          },
        ],
      },
    },
  };

  const fetchTableList = useCallback(
    async (filterProps = filter, pageCount = page, limitCount = limit) => {
      try {
        let { data, count: countRes } = await get(
          `blocked?page=${pageCount}&limit=${limitCount}&${queryString(filterProps)}`,
        );

        let dataFormatted = data?.map((doc) => {
          let status = doc?.status ?? null;
          let loginOn = doc?.login_on
            ? moment(doc?.login_on).format("DD-MM-YYYY hh:mm:ss a")
            : null;
          let unblockAt = doc?.unblock_at
            ? moment(doc?.unblock_at).format("DD-MM-YYYY hh:mm:ss a")
            : null;
          let blockedAt = moment(`${doc?.date} ${doc?.time}`, "YYYY-MM-DD HH:mm:ss").format("DD-MM-YYYY hh:mm:ss a")
          return {
            ...doc,
            ip: doc?.login_ip ?? "",
            blockedAt,
            loginOn,
            unblockAt,
            statusDisplay: statusMap[status]?.statusDisplay ?? {},
          };
        });
        setTableData(dataFormatted);
        setCount(countRes);
      } catch (error) {
        console.log("blocked ip fetching error occur", error?.message);
      }
    },
    [filter, page, limit],
  );

  const tableConfig = useMemo(
    () => ({
      columns: [
        {
          field: "ip",
          label: "Ip",
          type: "id",
          enableSorting: false,
          enableHiding: false,
        },
        {
          field: "attempts",
          label: "Attempts",
          enableSorting: false,
          enableHiding: false,
        },
        {
          field: "username",
          label: "Username",
          enableSorting: false,
          enableHiding: false,
        },
        {
          field: "loginOn",
          label: "Last Login At",
          enableSorting: false,
          enableHiding: false,
          className: "w-20",
        },
        {
          field: "blockedAt",
          label: "Last blocked At",
          enableSorting: false,
          enableHiding: false,
          className: "w-20",
        },
        {
          field: "unblockAt",
          label: "Unblock On Login",
          enableSorting: false,
          enableHiding: false,
          className: "w-20",
        },
        {
          field: "statusDisplay",
          label: "Status",
          enableSorting: false,
          enableHiding: false,
          type: "dropdown",
        },
      ],
      rows: tableData,
    }),
    [tableData],
  );

  return (
    <Page title="Blocked IPs">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
        <Breadcrumb title={"Blocked IPs"} />
        <TwdTable
          facedFilter={[
            {
              type: "text",
              icon: User2,
              placeholder: "Search...",
              name: "search",
            },
            {
              type: "select",
              isMulti: false,
              icon: User2,
              title: "Status",
              name: "status",
              options: [
                {
                  label: "Active",
                  value: 1,
                },
                {
                  label: "Blocked",
                  value: 2,
                },
              ],
            },
          ]}
          data={tableConfig}
          count={count}
          columnCallBack={({ doc }) => {
            blockHandler(doc?.username, doc.status === 2 ? 2 : 1);
          }}
          selectable={false}
          handleFilterChange={(filterProps, pageCount, limitCount) => {
            fetchTableList(filterProps, pageCount, limitCount);
            setFilter(filterProps);
            setPage(pageCount);
            setLimit(limitCount);
          }}
        />
      </div>
    </Page>
  );
};

export default BlockedIp;
