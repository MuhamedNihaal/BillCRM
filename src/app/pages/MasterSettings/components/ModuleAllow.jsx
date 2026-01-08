import { useCallback, useEffect, useMemo, useState } from "react";
import { Else, If, Then } from "react-if";
import { Switch } from "@headlessui/react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

//! Local Import
import { get, post, queryString } from "utility";
import TwdTable from "components/TwdTable";
import { Spinner } from "components/ui";
import { toast } from "sonner";

const ModuleAllow = ({ allowedList }) => {
  let [tableData, setTableData] = useState([]);
  const [filter, setFilter] = useState({});
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(1);

  const [isLoading, setIsLoading] = useState(false);

  let handleModuleStatus = async (obj, filterProps, pageCount, limitCount) => {
    try {
      await post("module/rules", obj);
      fetchTableList(filterProps, pageCount, limitCount);
    } catch (error) {
      toast.error(error.message);
    }
  };

  let fetchTableList = useCallback(
    async (filterProps = filter, pageCount = page, limitCount = limit) => {
      let url =
        allowedList.type == 1
          ? `module/rules?type=3&module=${allowedList?.id}&`
          : `privilege/${allowedList?.id}?`;

      try {
        let { data, count: resCount } = await get(
          `${url}page=${pageCount}&limit=${limitCount}&${queryString(filterProps)}`,
        );

        let dataFormatted = data?.map((doc) => {
          let status = doc?.status || false;
          return {
            ...doc,
            statusDisplay: (
              <Switch
                checked={status}
                onChange={(e) =>
                  handleModuleStatus(
                    {
                      status: e,
                      moduleId:
                        allowedList.type == 1 ? allowedList?.id : doc?._id,
                      privilegeId:
                        allowedList.type == 1 ? doc?._id : allowedList?.id,
                      type: 1,
                    },
                    filterProps,
                    pageCount,
                    limitCount,
                  )
                }
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
        setCount(resCount);
      } catch (error) {
        console.log("error occur while loading privileges", error?.message);
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filter, page, limit, allowedList],
  );

  useEffect(() => {
    if (allowedList?.status) setIsLoading(true);
    fetchTableList(filter, page, limit);

    return () => setIsLoading(false);
  }, [allowedList]);

  const tableConfig = useMemo(
    () => ({
      columns: [
        {
          field: "name",
          label: "Name",
          enableSorting: false,
          enableHiding: false,
        },
        {
          field: "statusDisplay",
          label: "Status",
          enableSorting: false,
          enableHiding: false,
        },
      ],
      rows: tableData,
    }),
    [tableData],
  );

  return (
    <>
      <If condition={isLoading}>
        <Then>
          <div className="flex h-full min-h-72 items-center justify-center">
            <Spinner />
          </div>
        </Then>
        <Else>
          <TwdTable
            data={tableConfig}
            count={count}
            selectable={false}
            pagination={false}
            settings={false}
            facedFilter={null}
            initialRender={false}
            timeout={0}
            handleFilterChange={(filterProps, pageCount, limitCount) => {
              // if (allowedList.status) {
              fetchTableList(filterProps, pageCount, limitCount);
              setFilter(filterProps);
              setPage(pageCount);
              setLimit(limitCount);
              // }
            }}
          />
        </Else>
      </If>
    </>
  );
};

export default ModuleAllow;
