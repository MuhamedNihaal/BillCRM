import { yupResolver } from "@hookform/resolvers/yup";
import { userSchema } from "./schema";
import { useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import Inputs from "components/Inputs";
import { Button, Card } from "components/ui";
import { GET_OPTIONS } from "../config";
import { deepCleanNulls, post, put, valueSetter } from "utility";
import { toast } from "sonner";
import { useDidUpdate } from "hooks";
import moment from "moment";
import Image from "components/Image";
import { API_URL } from "constants/app.constant";

const AddUser = ({ data, setRefresh, setData }) => {
  let [selectOptions, setSelectOptions] = useState({});
  let [image, setImage] = useState(null);
  let [isSignature, setIsSignature] = useState(null);
  let [inputReset, setInputReset] = useState(0);

  useEffect(() => {
    GET_OPTIONS(setSelectOptions, { privilege: true }, "privilege");
    GET_OPTIONS(setSelectOptions, { signature: true }, "signature");
    GET_OPTIONS(setSelectOptions, { company: true }, "company");
    GET_OPTIONS(setSelectOptions, { module: true }, "module");
    GET_OPTIONS(setSelectOptions, { department: true }, "department");
  }, []);

  const {
    handleSubmit,
    setValue,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: {
      firstName: "",
    },
  });

  useDidUpdate(() => {
    if (data) {
      let uType = data.type;
      let uCompany = data?.company?.value;
      let uBranch = data?.uBranch?.value;

      if (data.image) {
        setImage(`${API_URL}${data.image}`);
      } else {
        setImage(null);
      }

      if (data.signature?.img) {
        setIsSignature(data?.signature?.img);
      } else {
        setIsSignature(null);
      }

      if (uCompany) {
        GET_OPTIONS(setSelectOptions, { "main-branch": true }, "branch", {
          company: uCompany,
        });
      }

      if (uType == 2) {
        GET_OPTIONS(setSelectOptions, { "sub-branch": true }, "subBranch", {
          company: uCompany,
          mainBranch: uBranch,
        });
      }
      if (uType == 3) {
        GET_OPTIONS(setSelectOptions, { franchise: true }, "franchise", {
          company: uCompany,
          mainBranch: uBranch,
        });
      }

      if (uType == 4) {
        GET_OPTIONS(
          setSelectOptions,
          { "collection-center": true },
          "collectionCenter",
          {
            company: uCompany,
            mainBranch: uBranch,
          },
        );
      }

      let fields = [
        "_id",
        "firstName",
        "lastName",
        "mobile",
        "email",
        "username",
        "dob",
        "gender",
        {
          field: "privilege",
          path: "privilege.value",
          default: null,
        },
        {
          field: "module",
          path: "module.value",
          default: null,
        },
        {
          field: "company",
          path: "company.value",
          default: null,
        },
        {
          field: "signature",
          path: "value",
          default: null,
        },
        {
          field: "department",
          path: "department.value",
          default: null,
        },
        "type",
        {
          field: "branch",
          path: "branch.value",
          default: null,
        },
        data.type == 2 && {
          field: "subBranch",
          path: "subBranch.value",
          default: null,
        },
        data.type == 3 && {
          field: "franchise",
          path: "franchise.value",
          default: null,
        },
        data.type == 4 && {
          field: "collectionCenter",
          path: "collectionCenter.value",
          default: null,
        },
      ].filter(Boolean);

      valueSetter({ setValue, data, fields, removeNullValue: true });

      setData(null);
    }
  }, [data]);

  let watchId = watch("_id") || null;
  let company = watch("company") || null;
  let type = watch("type") || null;
  let branch = watch("branch") || null;

  const handleOnChange = ({ name, value, obj }) => {
    if (name === "signature") {
      setIsSignature(obj?.img ?? null);
    }

    if (name === "image") {
      setImage(null);
    }

    if (name === "company") {
      setValue("branch", null);
      setValue("franchise", null);
      setValue("subBranch", null);
      setValue("collectionCenter", null);

      GET_OPTIONS(setSelectOptions, { "main-branch": true }, "branch", {
        company: value,
      });
    }

    if (name === "type") {
      setValue("franchise", null);
      setValue("subBranch", null);
      setValue("collectionCenter", null);

      if (value === 2) {
        GET_OPTIONS(setSelectOptions, { "sub-branch": true }, "subBranch", {
          company: company,
          mainBranch: branch,
        });
      }
      if (value === 3) {
        GET_OPTIONS(setSelectOptions, { franchise: true }, "franchise", {
          company: company,
          mainBranch: branch,
        });
      }
      if (value === 4) {
        GET_OPTIONS(
          setSelectOptions,
          { "collection-center": true },
          "collectionCenter",
          {
            company: company,
            mainBranch: branch,
          },
        );
      }
    }

    if (name === "branch") {
      setValue("franchise", null);
      setValue("subBranch", null);
      setValue("collectionCenter", null);

      if (type === 2) {
        GET_OPTIONS(setSelectOptions, { "sub-branch": true }, "subBranch", {
          company: company,
          mainBranch: value,
        });
      }
      if (type === 3) {
        GET_OPTIONS(setSelectOptions, { franchise: true }, "franchise", {
          company: company,
          mainBranch: value,
        });
      }
      if (type === 4) {
        GET_OPTIONS(
          setSelectOptions,
          { "collection-center": true },
          "collectionCenter",
          {
            company: company,
            mainBranch: value,
          },
        );
      }
    }
  };

  const onSubmit = async (data) => {
    try {
      let obj = { ...data };

      let id = obj?._id;
      let file = obj?.image;
      let res = null;

      delete obj.image;
      delete obj._id;

      obj = deepCleanNulls(obj);

      if (id) {
        res = await put(`user?other=${id}`, {
          ...obj,
          imageChanged: image ? false : true,
        });
      } else {
        res = await post("user", obj);
      }

      if (res.data?._id && file) {
        let formData = new FormData();
        formData.append("file", file);
        await post(`user/image?other=${res.data?._id}`, formData);
      }

      toast.success(res.message ?? "User created successfully");

      setRefresh(Date.now());
      handleReset();
    } catch (error) {
      console.log(error);
      toast.error(error?.message);
    }
  };

  const handleReset = () => {
    reset();
    setInputReset(Date.now());
    setData(null);
    setImage(null);
    setIsSignature(null);
  };

  let inputs = useMemo(
    () => [
      {
        label: "First Name",
        name: "firstName",
        type: "text",
        required: true,
      },
      { label: "Last Name", name: "lastName", type: "text" },
      { label: "Mobile", name: "mobile", type: "phone" },
      { label: "Email", name: "email", type: "email" },
      {
        label: "Username",
        name: "username",
        type: "text",
        required: true,
      },
      {
        label: "Password",
        name: "password",
        type: "text",
        required: true,
        hide: watchId,
      },
      {
        label: "DOB",
        name: "dob",
        type: "date",
        maxDate: moment().subtract(15, "years").format("DD-MM-YYYY"),
      },
      {
        label: "Gender",
        name: "gender",
        type: "select",
        options: [
          { label: "Male", value: 1 },
          { label: "Female", value: 2 },
          { label: "Non-Binary", value: 3 },
        ],
      },
      {
        label: "Profile Image",
        name: "image",
        type: "file",
        required: false,
        accept: ".jpg,.jpeg,.png,image/jpeg,image/png",
        src: image,
        reset: inputReset,
      },
      {
        label: "Signature",
        name: "signature",
        type: "select",
        isClearable: true,
        options: selectOptions?.signature ?? [],
      },
      {
        label: "Privilege",
        name: "privilege",
        type: "select",
        required: true,
        options: selectOptions?.privilege ?? [],
      },
      {
        label: "Module",
        name: "module",
        type: "select",
        required: true,
        options: selectOptions?.module ?? [],
      },
      {
        label: "Department",
        name: "department",
        type: "select",
        required: true,
        options: selectOptions?.department ?? [],
      },
      {
        label: "Company",
        name: "company",
        type: "select",
        required: true,
        options: selectOptions?.company ?? [],
      },
      {
        label: "Type",
        name: "type",
        type: "select",
        disabled: !company,
        required: true,
        options: [
          { label: "Main branch", value: 1 },
          { label: "Sub branch", value: 2 },
          { label: "Franchise", value: 3 },
          { label: "Collection center", value: 4 },
        ],
      },
      {
        label: "Branch",
        name: "branch",
        type: "select",
        required: true,
        disabled: !type,
        options: selectOptions?.branch ?? [],
        join: [2, 3, 4].includes(type),
        left: {
          label: "Branch",
          name: "branch",
          type: "select",
          disabled: !type,
          required: true,
          options: selectOptions?.branch ?? [],
        },
        right: {
          ...(type == 2
            ? {
                label: "Sub Branch",
                name: "subBranch",
                type: "select",
                required: true,
                disabled: !type || !branch,
                options: selectOptions?.subBranch ?? [],
                hide: type !== 2,
              }
            : type === 3
              ? {
                  label: "Franchise",
                  name: "franchise",
                  type: "select",
                  disabled: !type || !branch,
                  required: true,
                  options: selectOptions?.franchise ?? [],
                  hide: type !== 3,
                }
              : {
                  label: "Collection Center",
                  name: "collectionCenter",
                  type: "select",
                  disabled: !type || !branch,
                  required: true,
                  options: selectOptions?.collectionCenter ?? [],
                  hide: type !== 4,
                }),
        },
      },
    ],
    [type, selectOptions, branch, company, watchId, image, inputReset],
  );

  return (
    <form
      autoComplete="off"
      onSubmit={handleSubmit(onSubmit)}
      id="new-analysis-type"
      className="mt-3"
    >
      <Card className="gap-4 p-4 sm:px-5">
        <div className="grid grid-cols-4 place-content-start gap-2 max-lg:grid-cols-2 max-sm:grid-cols-1 sm:gap-5 lg:gap-6">
          {inputs.map((input, idx) => {
            if (input.hide) return null;
            else if (input.join) {
              return (
                <div
                  className="col-span-2 flex -space-x-px max-sm:col-auto"
                  key={idx}
                >
                  <Inputs
                    {...input.left}
                    control={control}
                    placeholder={`${input.left.type === "select" ? "Select" : "Enter"} the ${input.left.label?.toLowerCase()}`}
                    handleOnChange={handleOnChange}
                    classNames={{
                      root: "flex-1",
                      input:
                        "relative hover:z-1 focus:z-1 ltr:rounded-r-none rtl:rounded-l-none",
                    }}
                    error={errors[input.left.name]?.message}
                  />
                  <Inputs
                    {...input.right}
                    control={control}
                    placeholder={`${input.right.type === "select" ? "Select" : "Enter"} the ${input.right.label?.toLowerCase()}`}
                    handleOnChange={handleOnChange}
                    classNames={{
                      root: "flex-1",
                      input:
                        "relative hover:z-1 focus:z-1 ltr:rounded-l-none rtl:rounded-r-none",
                      options: "mt-1",
                    }}
                    error={errors[input.right.name]?.message}
                  />
                </div>
              );
            } else {
              return (
                <Inputs
                  key={idx}
                  {...input}
                  control={control}
                  placeholder={`${input.type === "select" ? "Select" : "Enter"} the ${input.label?.toLowerCase()}`}
                  handleOnChange={handleOnChange}
                  classNames={{ options: "mt-1" }}
                  error={errors[input.name]?.message}
                />
              );
            }
          })}
        </div>

        {isSignature && (
          <Image
            src={isSignature}
            classNames={{ wrapper: "w-22", root: "mt-4 h-14" }}
          />
        )}

        <div className="mt-5 flex items-center justify-start gap-2">
          <Button
            className="min-w-[7rem]"
            color="primary"
            type="submit"
            form="new-analysis-type"
          >
            {watchId ? "Update" : "Create"}
          </Button>
          <Button
            type="reset"
            onClick={handleReset}
            className="min-w-[7rem]"
            variant="outlined"
          >
            {watchId ? "Cancel" : "Reset"}
          </Button>
        </div>
      </Card>
    </form>
  );
};

export default AddUser;
