/* eslint-disable react-hooks/exhaustive-deps */
import React, { memo, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Button, Card } from "components/ui";
import { Page } from "components/shared/Page";
import { CheckCircle } from "lucide-react";
import Inputs from "components/Inputs";
import { get, put } from "utility";
import _ from "lodash";
import TwdTable from "components/TwdTable";
import { useForm } from "react-hook-form";

const Notification = () => {
  const categoryOptions = [
    { label: "Test", value: 1 },
    { label: "Billing", value: 2 },
  ];

  const statusOptions = [
    { label: "Unread", value: 0 },
    { label: "Read", value: 1 },
  ];

  const CATEGORY_VALUES = {
    1: "Test",
    2: "Billing",
  };

  const STATUS_VALUES = {
    0: { text: "Unread", color: "danger" },
    1: { text: "Read", color: "success" },
  };

  const [tableData, setTableData] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterParams, setFilterParams] = useState({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { control, setValue, reset, watch } = useForm({
    defaultValues: {
      fromDate: "",
      toDate: "",
      category: "",
      status: "",
    },
  });

  const watchedValues = watch();

  const fetchNotificationsList = useCallback(
    async (params = {}, page = 1, limit = 10) => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();

        queryParams.append("page", page);
        queryParams.append("limit", limit);

        Object.entries(params).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            queryParams.append(key, value);
          }
        });

        const queryString = queryParams.toString();
        const { data, count: resCount } = await get(
          `notification/list?${queryString}`,
        );

        const transformedData = data.map((item) => {
          const statusInfo = STATUS_VALUES[item.readStatus];

          return {
            ...item,
            _id: item._id,
            category: CATEGORY_VALUES[item.category] || "",
            title: item.title || "",
            message: item.body || "",
            status: (
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  item.readStatus === 1
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {statusInfo.text}
              </span>
            ),
            actions: (
              <div className="flex !min-w-full justify-center gap-2">
                {(item.readStatus === 0 && (
                  <button
                    onClick={() => markAsRead(item._id)}
                    className="p-1 text-blue-600 hover:text-blue-900"
                    title="Mark as Read"
                  >
                    <CheckCircle className="size-4 transition-transform duration-200 hover:scale-125" />
                  </button>
                )) ||
                  "---"}
              </div>
            ),
          };
        });

        setTableData(transformedData);
        setCount(resCount || 0);
      } catch (error) {
        console.error(
          "Error occurred while fetching notifications list:",
          error,
        );
        toast.error("Failed to fetch notifications");
        setTableData([]);
        setCount(0);
      } finally {
        setLoading(false);
      }
    },
    [CATEGORY_VALUES, STATUS_VALUES],
  );

  const markAsRead = useCallback(
    async (id) => {
      try {
        await put("notification/read", { id });
        toast.success("Notification marked as read");
        fetchNotificationsList(filterParams);
      } catch (error) {
        console.error("Error marking notification as read:", error);
        toast.error("Failed to mark notification as read");
      }
    },
    [fetchNotificationsList, filterParams],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await put("notification/read/all");
      toast.success("All notifications marked as read");
      fetchNotificationsList(filterParams);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  }, [fetchNotificationsList, filterParams]);

  const debouncedFetchNotifications = React.useRef(
    _.debounce((params) => {
      fetchNotificationsList(params);
    }, 500),
  ).current;

  const buildParamsFromValues = useCallback((filterValues) => {
    const params = {};

    if (filterValues.fromDate) params.fromDate = filterValues.fromDate;
    if (filterValues.toDate) params.toDate = filterValues.toDate;
    if (filterValues.category !== null) params.category = filterValues.category;
    if (filterValues.status !== null) params.status = filterValues.status;

    return params;
  }, []);

  const handleFilterChange = useCallback(
    (field, value, _obj = null) => {
      setValue(field, value);

      const updatedValues = { ...watchedValues, [field]: value };

      const params = buildParamsFromValues(updatedValues);

      setFilterParams(params);
      setPage(1);
      debouncedFetchNotifications(params, 1, limit);
    },
    [
      watchedValues,
      setValue,
      buildParamsFromValues,
      limit,
      debouncedFetchNotifications,
    ],
  );

  const resetFilters = () => {
    reset();
    setFilterParams({});
    setPage(1);
    fetchNotificationsList({}, 1, limit);
  };

  const handleTableChange = useCallback(
    (filterProps, newPage, newLimit) => {
      setPage(newPage);
      if (newLimit !== limit) {
        setLimit(newLimit);
      }
      fetchNotificationsList(filterParams, newPage, newLimit);
    },
    [filterParams, fetchNotificationsList, limit],
  );

  const tableConfig = useMemo(() => {
    return {
      columns: [
        {
          field: "date",
          label: "Date",
          type: "date",
          enableSorting: true,
          enableHiding: true,
        },
        {
          field: "category",
          label: "Category",
          enableSorting: true,
          enableHiding: true,
        },
        {
          field: "title",
          label: "Title",
          enableSorting: true,
          enableHiding: true,
        },
        {
          field: "message",
          label: "Message",
          enableSorting: true,
          enableHiding: true,
        },
        {
          field: "status",
          label: "Status",
          enableSorting: true,
          enableHiding: true,
        },
        {
          field: "actions",
          label: "Actions",
          dropdown: false,
        },
      ],
      rows: tableData,
    };
  }, [tableData]);

  const filterFields = [
    {
      name: "fromDate",
      label: "From Date",
      type: "date",
      placeholder: "Select from date",
    },
    {
      name: "toDate",
      label: "To Date",
      type: "date",
      placeholder: "Select to date",
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      placeholder: "Select branch",
      options: categoryOptions,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      placeholder: "Select branch",
      options: statusOptions,
    },
  ];

  return (
    <Page title="Homepage">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
        <div className="min-w-0">
          <h2 className="dark:text-dark-50 truncate text-xl font-medium tracking-wide text-gray-800">
            Notification Log
          </h2>
        </div>

        <Card className="mt-2 mb-4 gap-4 p-4 sm:px-5">
          <div className="grid grid-cols-4 place-content-start max-lg:grid-cols-2 max-sm:grid-cols-1 sm:gap-5 lg:gap-6">
            {filterFields.map((field) => (
              <Inputs
                key={field.name}
                name={field.name}
                label={field.label}
                type={field.type}
                placeholder={field.placeholder}
                options={field.options || []}
                control={control}
                handleOnChange={({ name, value, obj }) => {
                  handleFilterChange(name, value, obj);
                }}
              />
            ))}
            <div className="flex items-center gap-2 text-nowrap">
              <Button
                className="mt-2"
                type="button"
                color="primary"
                onClick={resetFilters}
                variant="outlined"
              >
                Reset
              </Button>
              <Button
                className="mt-2"
                type="button"
                color="primary"
                onClick={markAllAsRead}
                // variant="outlined"
              >
                Mark All as Read
              </Button>
            </div>
          </div>
        </Card>

        <TwdTable
          data={tableConfig}
          count={count}
          loading={loading}
          selectable={false}
          page={page}
          limit={limit}
          onPageChange={handleTableChange}
          handleFilterChange={handleTableChange}
        />
      </div>
    </Page>
  );
};

export default memo(Notification);
