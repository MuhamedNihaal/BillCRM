/*eslint-disable*/
import { memo, useState, useMemo, useCallback, useEffect } from "react";
import { productsSchema } from "./productsSchema";
import { Page } from "components/shared/Page";
import TwdTable from "components/TwdTable";
import { yupResolver } from "@hookform/resolvers/yup";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { get, post, put, del, toTop, queryString } from "utility";
import { Plus, Minus } from "lucide-react";
import { Button, Card, Collapse } from "components/ui";
import { useDidUpdate, useDisclosure } from "hooks";
import { useForm } from "react-hook-form";
import InputBundle from "components/Inputs";
import Breadcrumb from "components/Breadcrumb";
import clsx from "clsx";

const Products = () => {
  const gstOptions = [
    { value: 0, label: "0%" },
    { value: 5, label: "5%" },
    { value: 12, label: "12%" },
    { value: 18, label: "18%" },
    { value: 28, label: "28%" },
  ];

  const unitOptions = [
    { value: "1", label: "Litre" },
    { value: "2", label: "Box" },
    { value: "3", label: "Number" },
    { value: "4", label: "Unit" },
    { value: "5", label: "Packet" },
  ];

  let [tableData, setTableData] = useState([]);
  const [limit, setLimit] = useState(50);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [filter, setFilter] = useState({});
  let [update, setUpdate] = useState({ _id: null, name: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, { toggle, open }] = useDisclosure();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(productsSchema),
    defaultValues: {
      name: "",
      mrp: "",
      specialPrice: "",
      gst: "",
      cost: "",
      primaryUnit: "",
    },
  });

  const specialPrice = watch("specialPrice");
  const gst = watch("gst");

  useEffect(() => {
    if (update._id && update.name) {
      setValue("name", update.name);
      setValue("mrp", update.mrp);
      setValue("specialPrice", update.specialPrice);
      setValue("gst", update.gst);
      setValue("cost", update.cost);
      setValue("primaryUnit", update.primaryUnit);
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [update, setValue]);

  useEffect(() => {
    const price = parseFloat(specialPrice);
    const gstVal = parseFloat(gst);
    if (!isNaN(price) && !isNaN(gstVal)) {
      const calculatedCost = price + (price * gstVal) / 100;
      setValue("cost", calculatedCost.toFixed(2));
    } else {
      setValue("cost", "");
    }
  }, [specialPrice, gst, setValue]);

  const handleCancelEdit = useCallback(() => {
    setUpdate({
      _id: null,
      name: "",
      mrp: "",
      specialPrice: "",
      gst: "",
      cost: "",
      primaryUnit: "",
    });
    setIsEditing(false);
    reset({
      name: "",
      mrp: "",
      specialPrice: "",
      gst: "",
      cost: "",
      primaryUnit: "",
    });
  }, [reset]);

  const onSubmit = async (data) => {
    try {
      const submitData = {
        ...data,
      };

      if (isEditing && update._id) {
        await put(`product`, { ...submitData, id: update._id });
        toast.success("Product updated successfully!");
        handleCancelEdit();
      } else {
        await post("product", submitData);
        toast.success("Product created successfully!");
      }

      reset({
        name: "",
        mrp: "",
        specialPrice: "",
        gst: "",
        cost: "",
        primaryUnit: "",
      });
      setRefresh((prev) => prev + 1);
    } catch (error) {
      toast.error(
        error?.message ??
          `An error occurred while ${isEditing ? "updating" : "creating"} the product.`,
      );
    }
  };

  let handleUpdate = useCallback(
    ({
      _id = null,
      name = "",
      mrp = "",
      specialPrice = "",
      gst = "",
      cost = "",
      primaryUnit = "",
    } = {}) => {
      setUpdate({
        _id,
        name,
        mrp,
        specialPrice,
        gst,
        cost,
        primaryUnit,
      });
      open();
      toTop();
    },
    [open],
  );

  const fetchTableList = useCallback(
    async (filterProps = filter, pageCount = page, limitCount = limit) => {
      try {
        let { data, count } = await get(
          `product?page=${pageCount}&limit=${limitCount}&${queryString(filterProps)}`,
        );

        let dataFormatted = data?.map((doc) => {
          let extra_actions = [];

          // Edit Action
          extra_actions.push({
            label: "Edit",
            icon: (
              <PencilIcon className="size-4.5 cursor-pointer transition-transform duration-200 hover:scale-125" />
            ),
            onClick: ({ id, doc }) => {
              handleUpdate({
                _id: id,
                name: doc?.name,
                mrp: doc?.mrp,
                specialPrice: doc?.specialPrice,
                gst: doc?.gst,
                cost: doc?.cost,
                primaryUnit: doc?.primaryUnit,
              });
            },
          });

          // Delete Action
          extra_actions.push({
            label: "Delete",
            icon: (
              <TrashIcon className="size-4.5 cursor-pointer transition-transform duration-200 hover:scale-125" />
            ),
            onClick: ({ id, action }) => handleDelete(id, action),
            dialog: {
              pending: {
                title: "Are you sure?",
                description: "Are you sure you want to delete this product?",
                actionText: "Delete",
              },
              success: {
                title: "Product deleted",
                description: "The product has been successfully deleted.",
              },
              error: {
                title: "Error deleting product",
                description:
                  "An error occurred while deleting the product. Please try again later.",
              },
            },
          });

          return {
            ...doc,
            date: doc?.date,
            addedBy: doc?.addedBy?.name,
            extra_actions,
          };
        });

        setTableData(dataFormatted);
        setCount(count);
      } catch (error) {
        console.log("Product fetching error occurred", error?.message);
        toast.error("Failed to fetch Products");
      }
    },
    [page, limit, filter, handleUpdate],
  );

  useDidUpdate(() => {
    console.log("useDidUpdate called");
    fetchTableList(filter, page, limit);
  }, [refresh]);

  const handleDelete = useCallback(
    async (id, action) => {
      try {
        await del(`product?id=${id}`);
        action?.setConfirmLoading(false);
        action?.setSuccess(true);
        toast.success("Product deleted successfully!");
        fetchTableList(filter, page, limit);
      } catch (error) {
        action?.setConfirmLoading(false);
        action?.setError(true);
        console.log("Error deleting product:", error?.message);
        toast.error("Failed to delete product");
      }
    },
    [filter, page, limit, fetchTableList],
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
          field: "name",
          label: "Product Name",
          enableSorting: true,
          enableHiding: true,
          copy: true,
        },
        {
          field: "mrp",
          label: "MRP",
          type: "amount",
          enableSorting: true,
          enableHiding: true,
        },
        {
          field: "specialPrice",
          label: "Special Price",
          type: "amount",
          enableSorting: true,
          enableHiding: true,
        },
        {
          field: "gst",
          label: "GST%",
          enableSorting: true,
          enableHiding: true,
        },
        {
          field: "cost",
          label: "Cost",
          type: "amount",
          enableSorting: true,
          enableHiding: true,
        },
        {
          field: "addedBy",
          label: "Added By",
          enableSorting: true,
          enableHiding: true,
        },
        {
          label: "Actions",
          field: "extra_actions",
          dropdown: false,
          actions: [],
        },
      ],
      rows: tableData,
    };
  }, [tableData]);

  return (
    <Page title="Product">
      <div className="p-5">
        <Breadcrumb
          title={"Products"}
          options={[
            {
              label: "Add Product",
              SwapOn: Minus,
              SwapOff: Plus,
              onClick: toggle,
              active: isExpanded,
            },
          ]}
        />
        <Collapse in={isExpanded}>
          <form
            autoComplete="off"
            onSubmit={handleSubmit(onSubmit)}
            id="product-form"
            className="mt-4"
          >
            <Card className="gap-4 p-4 sm:px-5">
              <div className="grid grid-cols-4 place-content-start max-lg:grid-cols-2 max-sm:grid-cols-1 sm:gap-5 lg:gap-6">
                {[
                  {
                    name: "Product Name",
                    field: "name",
                    type: "text",
                    required: true,
                  },
                  {
                    name: "MRP",
                    field: "mrp",
                    type: "text",
                    required: true,
                  },
                  {
                    name: "Special Price",
                    field: "specialPrice",
                    type: "text",
                    required: true,
                  },
                  {
                    name: "GST (%)",
                    field: "gst",
                    type: "select",
                    options: gstOptions,
                    required: true,
                  },
                  {
                    name: "Cost",
                    field: "cost",
                    type: "text",
                    required: true,
                    disabled: true,
                  },
                  {
                    name: "Primary Unit",
                    field: "primaryUnit",
                    type: "select",
                    options: unitOptions,
                    required: true,
                  },
                ].map((input, idx) => (
                  <InputBundle
                    type={input.type}
                    name={input.field}
                    key={idx}
                    control={control}
                    label={input.name}
                    defaultValue={input.defaultValue}
                    required={input.required}
                    disabled={input.disabled}
                    placeholder={
                      input.type === "select"
                        ? `Select ${input.name?.toLowerCase()}`
                        : `Enter the ${input.name?.toLowerCase()}`
                    }
                    options={input.options}
                    {...(!["select"].includes(input.type) &&
                      register(input.field))}
                    error={errors[input?.field]?.message}
                  />
                ))}

                <div
                  className={clsx(
                    "mt-6 flex items-center justify-start gap-2",
                    Object.keys(errors)?.length > 0 && "!mb-5",
                  )}
                >
                  <Button
                    className="min-w-[7rem]"
                    color="primary"
                    type="submit"
                    form="product-form"
                  >
                    {isEditing ? "Update" : "Create"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      reset();
                      handleCancelEdit();
                    }}
                    className="min-w-[7rem]"
                    variant="outlined"
                  >
                    {isEditing ? "Cancel" : "Reset"}
                  </Button>
                </div>
              </div>
            </Card>
          </form>
        </Collapse>

        <TwdTable
          data={tableConfig}
          selectable={false}
          count={count}
          page={page}
          limit={limit}
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

export default memo(Products);
