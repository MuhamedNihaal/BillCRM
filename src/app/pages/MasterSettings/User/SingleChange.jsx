/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import Inputs from "components/Inputs";
import { Button } from "components/ui";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { GET_OPTIONS } from "../config";
import { singleChangeSchema } from "./schema";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { put } from "utility";

const SingleChange = ({ data, setRefresh, close }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(singleChangeSchema),
    defaultValues: {
      type: data.type,
      id: data?.id,
      privilege: data?.privilege?.value || "",
    },
  });

  let [options, setOptions] = useState({});

  useEffect(() => {
    if (data.type == 1 && !options.privilege) {
      GET_OPTIONS(setOptions, { privilege: true }, "privilege", {});
    }
  }, []);

  let onSubmit = async (data) => {
    try {
      const url = data.type === 1 ? "user/privilege" : "user/password";
      let res = await put(url, data);

      toast.success(res?.message);
      reset();
      setRefresh(Date.now());
      close();
    } catch (error) {
      toast.error(error?.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col overflow-y-auto px-4 py-4 sm:px-5"
    >
      {data.type == 1 ? (
        <Inputs
          control={control}
          placeholder="Select the privilege"
          label="Change Privilege"
          name="privilege"
          type="select"
          inline
          options={options?.privilege ?? []}
          error={errors?.privilege?.message}
        />
      ) : (
        <Inputs
          control={control}
          placeholder="Enter the password"
          label="Change Password"
          name="password"
          type="text"
          error={errors?.password?.message}
        />
      )}

      <div className="mt-4 space-x-3 text-end">
        <Button
          onClick={close}
          type="button"
          variant="outlined"
          className="min-w-[7rem] rounded-full"
        >
          Cancel
        </Button>
        <Button
          color="primary"
          type="submit"
          className="min-w-[7rem] rounded-full"
        >
          Change
        </Button>
      </div>
    </form>
  );
};

export default SingleChange;
