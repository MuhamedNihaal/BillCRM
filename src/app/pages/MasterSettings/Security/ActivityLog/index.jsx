import Breadcrumb from "components/Breadcrumb";
import { Page } from "components/shared/Page";
import TwdTable from "components/TwdTable";
import { PickaxeIcon, User2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { get, queryString } from "utility";
import { GET_OPTIONS } from "../../config";
import { isArray } from "utils/isArray";

const ActivityLog = () => {
  let [tableData, setTableData] = useState([]);
  const [filter, setFilter] = useState({});
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(1);
  let [options, setOptions] = useState({});

  useEffect(() => {
    fetchActivityActions();
    GET_OPTIONS(setOptions, { user: true }, "staff");
  }, []);

  const fetchActivityActions = async () => {
    try {
      let { data = [] } = await get(`activity-actions`);

      data = data.map((item) => ({
        label: item,
        value: item,
      }));

      setOptions((prev) => ({ ...prev, activity: isArray(data) }));
    } catch (error) {
      console.log("activity log fetching error occur", error?.message);
    }
  };

  const fetchTableList = useCallback(
    async (filterProps = filter, pageCount = page, limitCount = limit) => {
      try {
        let { data, count: countRes } = await get(
          `activity-log?page=${pageCount}&limit=${limitCount}&${queryString(filterProps)}`,
        );

        let dataFormatted = data?.map((doc) => {
          return {
            ...doc,
            userDisplay: doc?.user?.name ?? null,
          };
        });
        setTableData(dataFormatted);
        setCount(countRes);
      } catch (error) {
        console.log("activity log fetching error occur", error?.message);
      }
    },
    [filter, page, limit],
  );

  const tableConfig = useMemo(
    () => ({
      columns: [
        {
          field: "date",
          label: "Date",
          type: "date",
          enableSorting: false,
          enableHiding: false,
        },
        {
          field: "ip",
          label: "Ip",
          type: "id",

          enableSorting: false,
          enableHiding: false,
        },
        {
          field: "userDisplay",
          label: "User",
          enableSorting: false,
          enableHiding: false,
        },
        {
          field: "action",
          label: "Action",
          enableSorting: false,
          enableHiding: false,
        },
        {
          field: "description",
          label: "Description",
          enableSorting: false,
          enableHiding: false,
        },
      ],
      rows: tableData,
    }),
    [tableData],
  );

  return (
    <Page title="Activity Log">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
        <Breadcrumb title={"Activity Log"} />

        <TwdTable
          facedFilter={[
            {
              type: "text",
              icon: User2,
              placeholder: "Search...",
              name: "search",
            },
            {
              type: "date",
              title: "Range",
              name: "range",
              defaultValue: [new Date(), new Date()],
              options: {
                mode: "range",
              },
            },
            {
              type: "select",
              isMulti: true,
              icon: User2,
              title: "Staff",
              name: "staff",
              options: isArray(options.staff),
            },
            {
              icon: PickaxeIcon,
              title: "Action",
              type: "select",
              name: "action",
              options: isArray(options.activity),
            },
          ]}
          data={tableConfig}
          count={count}
          selectable={false}
          handleFilterChange={(filterProps, pageCount, limitCount) => {
            let payload = {
              ...filterProps,
              ...(filterProps.range && { ...filterProps.range }),
            };
            delete payload.range;

            fetchTableList(payload, pageCount, limitCount);
            setFilter(payload);

            setPage(pageCount);
            setLimit(limitCount);
          }}
        />
      </div>
    </Page>
  );
};

export default ActivityLog;
