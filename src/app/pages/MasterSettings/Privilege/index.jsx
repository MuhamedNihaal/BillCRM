import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { privilegeSchema } from "./schema";
import { yupResolver } from "@hookform/resolvers/yup";
import { ShieldCheckIcon } from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";

//! Local File Import
import Breadcrumb from "components/Breadcrumb";
import Inputs from "components/Inputs";
import { Page } from "components/shared/Page";
import { useDisclosure } from "hooks";
import { Button, Card, Collapse } from "components/ui";
import { del, get, post, put, queryString, toTop } from "utility";
import { EditIcon, TrashIcon } from "configs/global.icons";
import TwdTable from "components/TwdTable";
import Modal from "components/Modal";
import ModuleAllow from "../components/ModuleAllow";

const Privilege = () => {
  const [isExpanded, { toggle, open }] = useDisclosure();

  let [tableData, setTableData] = useState([]);
  const [filter, setFilter] = useState({});
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(1);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(privilegeSchema),
    defaultValues: {
      name: "",
      code: "",
    },
  });

  let [allowedList, setAllowedList] = useState({
    status: false,
    name: "",
    type: 2,
    id: "",
  });

  const handleToggle = ({ status = false, name = "", type = 2, id = "" }) => {
    setAllowedList({ status, name, type, id });
  };

  const fetchTableList = useCallback(
    async (filterProps = filter, pageCount = page, limitCount = limit) => {
      try {
        let { data, count: countRes } = await get(
          `privilege?page=${pageCount}&limit=${limitCount}&${queryString(filterProps)}`,
        );

        let dataFormatted = data?.map((doc) => {
          return {
            ...doc,
            dateDisplay: doc?.date,
          };
        });
        setTableData(dataFormatted);
        setCount(countRes);
      } catch (error) {
        console.log("module fetching error occur", error?.message);
      }
    },
    [filter, page, limit],
  );

  const handleAllowed = useCallback((data) => {
    let { id, doc } = data;
    handleToggle({ status: true, id, name: doc?.name ?? "" });
  }, []);

  let handleUpdate = useCallback(
    (data) => {
      setValue("code", data.code);
      setValue("name", data.name);
      setValue("_id", data?._id || "");
      open();
      toTop();
    },
    [open, setValue],
  );

  const handelDelete = useCallback(
    async (id, action) => {
      try {
        await del(`privilege/${id}`);
        action?.setConfirmLoading(false);
        action?.setSuccess(true);
        fetchTableList(filter, page, limit);
      } catch (error) {
        action?.setConfirmLoading(false);
        action?.setError(true);
        action?.setDialogContent({
          error: {
            title: "Error deleting privilege",
            description: error?.message,
          },
        });
        console.log("Error deleting privilege type:", error?.message);
      }
    },
    [filter, page, limit, fetchTableList],
  );

  const tableConfig = useMemo(
    () => ({
      columns: [
        {
          field: "dateDisplay",
          label: "Date",
          type: "date",
          enableSorting: false,
          enableHiding: false,
        },
        {
          field: "name",
          label: "Name",
          enableSorting: false,
          enableHiding: false,
        },
        {
          field: "code",
          label: "Code",
          type: "badge",
          enableSorting: false,
          enableHiding: false,
        },
        {
          label: "Actions",
          field: "actions",
          dropdown: false,
          actions: [
            {
              label: "Permission",
              icon: <ShieldCheckIcon className="size-4.5 stroke-1" />,
              onClick: handleAllowed,
            },
            {
              label: "Edit",
              icon: <EditIcon className="size-4.5 stroke-1" />,
              onClick: ({ id, doc }) => {
                handleUpdate({
                  _id: id,
                  name: doc?.name ?? "",
                  code: doc?.code ?? "",
                });
              },
            },
            {
              label: "Delete",
              icon: <TrashIcon className="size-4.5 stroke-1" />,
              onClick: ({ id, action }) => handelDelete(id, action),
              dialog: {
                pending: {
                  title: "Are you sure?",
                  description:
                    "Are you sure you want to delete this privilege?",
                  actionText: "Delete",
                },
                success: {
                  title: "Privilege deleted",
                  description: "The privilege has been successfully deleted.",
                },
                error: {
                  title: "Error deleting privilege",
                  description:
                    "An error occurred while deleting the privilege. Please try again later.",
                },
              },
            },
          ],
        },
      ],
      rows: tableData,
    }),
    [tableData, handleAllowed, handelDelete, handleUpdate],
  );

  const onSubmit = async (data) => {
    try {
      let res = null;
      let id = data?._id || null;
      let obj = { ...data };
      if (id) {
        delete obj._id;
        res = await put(`privilege/${id}`, obj);
      } else {
        res = await post("privilege", obj);
      }

      toast.success(res?.message || "Privilege successfully submitted.");
      reset();
      fetchTableList(filter, page, limit);
    } catch (error) {
      toast.error(
        error?.message ?? "An error occurred while submitting the customer,",
      );
    }
  };

  let watchId = watch("_id") || null;

  return (
    <Page title="Privilege">
      <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
        <Breadcrumb
          title="Privilege"
          options={[
            {
              label: "New Privilege",
              SwapOn: "Minus",
              SwapOff: "Plus",
              onClick: toggle,
              active: isExpanded,
            },
          ]}
        />

        <Collapse in={isExpanded}>
          <form
            autoComplete="off"
            onSubmit={handleSubmit(onSubmit)}
            id="new-privilege"
            className="mt-3"
          >
            <Card className="gap-4 p-4 sm:px-5">
              <div className="grid grid-cols-4 place-content-start max-lg:grid-cols-2 max-sm:grid-cols-1 sm:gap-5 lg:gap-6">
                <Inputs
                  type="text"
                  name="name"
                  control={control}
                  label="Name"
                  required={true}
                  placeholder={`Enter the name`}
                  error={errors?.name?.message}
                  {...register("name")}
                />
                <Inputs
                  type="text"
                  name="code"
                  control={control}
                  label="Code"
                  required={true}
                  placeholder={`Enter the code`}
                  error={errors?.code?.message}
                  {...register("code")}
                />

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
                    form="new-privilege"
                  >
                    {watchId ? "Update" : "Create"}
                  </Button>
                  <Button
                    type="reset"
                    onClick={() => reset()}
                    className="min-w-[7rem]"
                    variant="outlined"
                  >
                    {watchId ? "Cancel" : "Reset"}
                  </Button>
                </div>
              </div>
            </Card>
          </form>
        </Collapse>

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
          title={`${allowedList.name} Privilege: Approved Modules`}
          isOpen={allowedList.status}
          close={handleToggle}
        >
          <ModuleAllow
            allowedList={allowedList}
            setAllowedList={setAllowedList}
          />
        </Modal>
      </div>
    </Page>
  );
};

export default Privilege;
