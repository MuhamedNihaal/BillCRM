import { useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";

//! Local Import
import { moduleSchema } from "./schema";
import { Button } from "components/ui";
import { toast } from "sonner";
import { put } from "utility";
import Inputs from "components/Inputs";

const ModuleEdit = ({ data, close, setRefresh, isOpen, DynamicIcon }) => {
  const {
    handleSubmit,
    setValue,
    getValues,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(moduleSchema),
    defaultValues: {
      name: "",
      code: "",
      icon: "",
      redirectUrl: "",
    },
  });

  useEffect(() => {
    if (isOpen && data) {
      const fields = ["_id", "name", "code", "icon", "redirectUrl"];
      fields.forEach((field) => setValue(field, data[field] || ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  let onSubmit = async (data) => {
    try {
      let res = await put(`module/${data?._id}`, data);
      toast.success(res?.message ?? "Module Updated");
      setRefresh(Date.now());
    } catch (error) {
      toast.error(error?.message);
    }
  };

  let icon = watch(getValues())?.icon;

  return (
    <div>
      <form
        autoComplete="off"
        onSubmit={handleSubmit(onSubmit)}
        id="new-privilege"
        className="mt-3"
      >
        <div className="grid grid-cols-2 place-content-start gap-2 max-md:grid-cols-1">
          <Inputs
            type="text"
            name="name"
            control={control}
            label="Name"
            placeholder={`Enter the name`}
            error={errors?.name?.message}
            required={true}
          />

          <Inputs
            type="text"
            name="code"
            control={control}
            label="Code"
            placeholder={`Enter the code`}
            error={errors?.code?.message}
            required={true}
          />

          <Inputs
            type="text"
            prefix={<DynamicIcon name={icon} />}
            name="icon"
            control={control}
            label="Icon"
            placeholder={`Enter the icon`}
            error={errors?.icon?.message}
            required={true}
          />

          <Inputs
            type="text"
            name="redirectUrl"
            control={control}
            label="Redirect Url"
            placeholder={`Enter the redirect url`}
            error={errors?.redirectUrl?.message}
            required={true}
          />
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button
            type="reset"
            onClick={close}
            className="min-w-[7rem]"
            variant="outlined"
          >
            Close
          </Button>
          <Button
            className="min-w-[7rem]"
            color="primary"
            type="submit"
            form="new-privilege"
          >
            Update
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ModuleEdit;
