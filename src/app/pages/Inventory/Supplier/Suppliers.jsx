import { memo, useState, useMemo, useCallback, useEffect } from "react";
import { supplierSchema } from "./supplierSchema";
import { Page } from "components/shared/Page";
import TwdTable from "components/TwdTable";
import SupplierDetailModal from "./Modal.jsx";
import { yupResolver } from "@hookform/resolvers/yup";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { get, post, put, del, toTop, queryString } from "utility";
import { Button, Card, Collapse } from "components/ui";
import { Plus } from "lucide-react";
import { useDidUpdate, useDisclosure } from "hooks";
import { useForm } from "react-hook-form";
import InputBundle from "components/Inputs";
import Breadcrumb from "components/Breadcrumb";

const Suppliers = () => {
  let [tableData, setTableData] = useState([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [statesList, setStatesList] = useState([]);
  const [count, setCount] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  let [update, setUpdate] = useState({ _id: null, name: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, { toggle, open }] = useDisclosure();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(supplierSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      mobile: "",
      address: "",
      gstIn: "",
      accountNo: "",
      bank: "",
      branch: "",
      state: "",
    },
  });

  const fetchStates = useCallback(async () => {
    try {
      const { data } = await get("/options/states");
      const options = data.map((state) => ({
        value: state._id,
        label: state.name,
      }));
      setStatesList(options);
    } catch (error) {
      console.log("State options fetching error occured", error);
      toast.error("Failed to fetch states");
    }
  }, []);

  useEffect(() => {
    if (update._id && update.name) {
      setValue("name", update.name);
      setValue("company", update.company);
      setValue("email", update.email);
      setValue("mobile", update.mobile);
      setValue("address", update.address);
      setValue("gstIn", update.gstIn);
      setValue("accountNo", update.accountNo);
      setValue("bank", update.bank);
      setValue("branch", update.branch);
      setValue("state", update.state?._id || update.state);
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [update, setValue]);

  const fetchTableList = useCallback(
    async (filterProps = {}, pageCount = page, limitCount = limit) => {
      try {
        let { data, count } = await get(
          `supplier?page=${pageCount}&limit=${limitCount}&${queryString(filterProps)}`,
        );

        let dataFormatted = data?.map((doc) => ({
          ...doc,
          date: doc?.date,
          addedBy: doc?.addedBy?.name,
        }));
        setTableData(dataFormatted);
        setCount(count);
      } catch (error) {
        console.log("suppliers fetching error occurred", error?.message);
        toast.error("Failed to fetch suppliers");
      }
    },
    [page, limit],
  );

  useEffect(() => {
    fetchStates();
  }, [fetchStates]);

  const handleCancelEdit = useCallback(() => {
    setUpdate({
      _id: null,
      name: "",
      company: "",
      address: "",
      phone: "",
      email: "",
      gstIn: "",
      accountNo: "",
      bank: "",
      branch: "",
      state: "",
    });
    setIsEditing(false);
    reset();
  }, [reset]);

  const onSubmit = async (data) => {
    try {
      const cleanedData = Object.keys(data).reduce((acc, key) => {
        const value = data[key];
        acc[key] =
          value === undefined || value === null || value === "" ? "" : value;
        return acc;
      }, {});

      if (isEditing && update._id) {
        console.log("Update Data : ", cleanedData);
        await put(`supplier`, { ...cleanedData, id: update._id });
        toast.success("Supplier updated successfully!");
        handleCancelEdit();
      } else {
        await post("supplier", cleanedData);
        toast.success("Supplier created successfully!");
      }

      reset();
      setRefresh((prev) => prev + 1); // Trigger refresh
    } catch (error) {
      toast.error(
        error?.message ??
          `An error occurred while ${isEditing ? "updating" : "creating"} the supplier.`,
      );
    }
  };

  let handleUpdate = useCallback(
    ({
      _id = null,
      name = "",
      company = "",
      email = "",
      mobile = "",
      address = "",
      gstIn = "",
      accountNo = "",
      bank = "",
      branch = "",
      state = "",
    } = {}) => {
      setUpdate({
        _id,
        name,
        company,
        email,
        mobile,
        address,
        gstIn,
        accountNo,
        bank,
        branch,
        state,
      });
      open();
      toTop();
    },
    [open],
  );

  useDidUpdate(() => {
    console.log("useDidUpdate called");
    fetchTableList({}, page, limit);
  }, [refresh]);

  const handleDelete = useCallback(
    async (id, action) => {
      try {
        await del(`supplier?id=${id}`);
        action?.setConfirmLoading(false);
        action?.setSuccess(true);
        toast.success("Supplier deleted successfully!");
        fetchTableList({}, page, limit);
      } catch (error) {
        action?.setConfirmLoading(false);
        action?.setError(true);
        console.log("Error deleting supplier:", error?.message);
        toast.error("Failed to delete supplier");
      }
    },
    [page, limit, fetchTableList],
  );

  const handleViewDetails = (supplierId) => {
    setSelectedSupplierId(supplierId);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedSupplierId(null);
  };

  const handleTableChange = useCallback(
    (filterProps, newPage, newLimit) => {
      setPage(newPage);
      setLimit(newLimit);
      fetchTableList(filterProps, newPage, newLimit);
    },
    [fetchTableList],
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
          field: "uniqueId",
          label: "Supplier ID",
          enableSorting: true,
          enableHiding: true,
        },
        {
          field: "name",
          label: "Supplier Name",
          enableSorting: true,
          enableHiding: true,
        },
        {
          field: "company",
          label: "Company Name",
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
          actions: [
            {
              label: "View",
              icon: (
                <EyeIcon className="size-4.5 cursor-pointer transition-transform duration-200 hover:scale-125" />
              ),
              onClick: (item) => {
                handleViewDetails(item._id || item.id);
              },
            },
            {
              label: "Edit",
              icon: (
                <PencilIcon className="size-4.5 cursor-pointer transition-transform duration-200 hover:scale-125" />
              ),
              onClick: ({ id, doc }) => {
                handleUpdate({
                  _id: id,
                  name: doc?.name,
                  company: doc?.company,
                  email: doc?.email,
                  mobile: doc?.mobile,
                  address: doc?.address,
                  gstIn: doc?.gstIn,
                  accountNo: doc?.accountNo,
                  bank: doc?.bank,
                  branch: doc?.branch,
                  state: doc?.state?._id || doc?.state,
                });
              },
            },
            {
              label: "Delete",
              icon: (
                <TrashIcon className="size-4.5 cursor-pointer transition-transform duration-200 hover:scale-125" />
              ),
              onClick: ({ id, action }) => handleDelete(id, action),
              dialog: {
                pending: {
                  title: "Are you sure?",
                  description: "Are you sure you want to delete this supplier?",
                  actionText: "Delete",
                },
                success: {
                  title: "Supplier deleted",
                  description: "The supplier has been successfully deleted.",
                },
                error: {
                  title: "Error deleting supplier",
                  description:
                    "An error occurred while deleting the supplier. Please try again later.",
                },
              },
            },
          ],
        },
      ],
      rows: tableData,
    };
  }, [tableData, handleUpdate, handleDelete]);

  return (
    <Page title="Supplier">
      <div className="p-5">
        <Breadcrumb
          title={"Suppliers"}
          options={[{ label: "Add Supplier", icon: Plus, onClick: toggle }]}
        />
        <Collapse in={isExpanded}>
          <form
            autoComplete="off"
            onSubmit={handleSubmit(onSubmit)}
            id="supplier-form"
            className="mt-4"
          >
            {/* <div className="flex justify-between mb-2">
                            <h3 className="dark:text-dark-50 truncate text-lg font-medium text-gray-800">
                                {isEditing ? 'Update Supplier' : 'Add Supplier'}
                            </h3>
                        </div> */}
            <Card className="gap-4 p-4 sm:px-5">
              <div className="grid grid-cols-4 place-content-start max-lg:grid-cols-2 max-sm:grid-cols-1 sm:gap-5 lg:gap-6">
                {[
                  {
                    name: "Company Name",
                    field: "company",
                    type: "text",
                    placeholder: "Enter Company Name",
                    required: true,
                  },
                  {
                    name: "Supplier Name",
                    field: "name",
                    type: "text",
                    placeholder: "Enter Supplier Name",
                    required: true,
                  },
                  {
                    name: "Email",
                    field: "email",
                    type: "text",
                    placeholder: "Enter Email",
                  },
                  {
                    name: "Mobile",
                    field: "mobile",
                    type: "text",
                    placeholder: "Enter Mobile",
                    required: true,
                  },
                  {
                    name: "Address",
                    field: "address",
                    type: "text",
                    placeholder: "Enter Address",
                  },
                  {
                    name: "State",
                    field: "state",
                    type: "select",
                    placeholder: "Select State",
                    required: true,
                    options: statesList,
                  },
                  {
                    name: "GST IN",
                    field: "gstIn",
                    type: "text",
                    placeholder: "Enter GST IN",
                    required: true,
                  },
                  {
                    name: "Account No.",
                    field: "accountNo",
                    type: "text",
                    placeholder: "Enter Account No.",
                  },
                  {
                    name: "Bank",
                    field: "bank",
                    type: "text",
                    placeholder: "Enter Bank",
                  },
                  {
                    name: "Branch",
                    field: "branch",
                    type: "text",
                    placeholder: "Enter Supplier Branch",
                  },
                ].map((input, idx) => (
                  <InputBundle
                    type={input.type}
                    name={input.field}
                    key={idx}
                    control={control}
                    label={input.name}
                    required={input.required}
                    placeholder={input.placeholder}
                    options={input.options}
                    {...(!["select", "date"].includes(input.type) &&
                      register(input.field))}
                    error={errors[input?.field]?.message}
                  />
                ))}

                <div className="mt-6 flex items-center justify-start gap-2">
                  <Button
                    className="min-w-[7rem]"
                    color="primary"
                    type="submit"
                    form="supplier-form"
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
          handleFilterChange={handleTableChange}
        />

        <SupplierDetailModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          supplierId={selectedSupplierId}
        />
      </div>
    </Page>
  );
};

export default memo(Suppliers);
