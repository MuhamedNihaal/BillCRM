// Import Dependencies

import { put } from "utility";
import { useAuthContext } from "app/contexts/auth/context";
import { toast } from "sonner";

// Local Imports
import { Avatar, Button, Input, InputErrorMsg } from "components/ui";
import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useDisclosure } from "hooks";
import { useForm } from "react-hook-form";
import { changePassword } from "./schema";
import { yupResolver } from "@hookform/resolvers/yup";
import clsx from "clsx";
import { Fingerprint } from "lucide-react";
import { useConfirm } from "components/ConfirmModal";

// ----------------------------------------------------------------------

export default function Sessions() {
  const { user, forceLogout, reCallCheckAllow } = useAuthContext();
  const [show, { toggle }] = useDisclosure();
  let [resetStatus, setResetStatus] = useState({ status: false, message: "" });

  const confirm = useConfirm();

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(changePassword),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      let { message } = await put("auth/change-password", data);
      toast.success(message ?? "Changed");
      reset();
      setResetStatus({ status: false, message: "" });
    } catch (error) {
      setResetStatus({ status: true, message: error?.message });
    }
  };

  const handleTwoStep = async (user, status) => {
    let result = await confirm({
      pending: {
        description: `Are you sure you want to ${status ? "enable" : "disable"} MFA`,
        actionText: status ? "Enable & Logout" : "Disable",
      },
    });

    if (result.status) {
      try {
        await put("user/mfa/setup", { status, staffId: user._id });
        result.close();
        if (status) forceLogout();
        else reCallCheckAllow();
      } catch (error) {
        result.setDialogContent({
          error: { title: "Something went wrong", description: error.message },
        });
        result.setError(true);
      }
    }
  };

  return (
    <div className="w-full max-w-3xl 2xl:max-w-5xl">
      <h5 className="dark:text-dark-50 text-lg font-medium text-gray-800">
        Password & Security
      </h5>
      <p className="mt-0.5 text-sm text-balance">
        Active sessions and update password section. You can terminate them by
        clicking on the remove button.
      </p>
      <div className="dark:bg-dark-500 my-5 h-px bg-gray-200" />

      <form onSubmit={handleSubmit(onSubmit)}>
        <p className="dark:text-dark-100 text-base font-medium text-gray-800">
          Password Reset
        </p>
        <p className="mt-0.5 text-sm text-balance">
          Update your password here. Enter your current and new password.
        </p>
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3">
            <p className="my-auto font-medium">Current Password:</p>
            <Input
              type="password"
              classNames={{ root: "mt-1.5 flex-1 md:col-span-2 md:mt-0" }}
              placeholder="********"
              {...register("currentPassword")}
              error={errors?.currentPassword?.message}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3">
            <p className="my-auto font-medium">New Password:</p>
            <Input
              type={show ? "text" : "password"}
              classNames={{ root: "mt-1.5 flex-1 md:col-span-2 md:mt-0" }}
              onPaste={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              suffix={
                <Button
                  variant="flat"
                  className="pointer-events-auto size-6 shrink-0 rounded-full p-0"
                  onClick={toggle}
                >
                  {show ? (
                    <EyeSlashIcon className="dark:text-dark-200 size-4.5 text-gray-500" />
                  ) : (
                    <EyeIcon className="dark:text-dark-200 size-4.5 text-gray-500" />
                  )}
                </Button>
              }
              placeholder="********"
              {...register("newPassword")}
              error={errors?.newPassword?.message}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3">
            <p className="my-auto font-medium">Confirm Password:</p>
            <Input
              type="password"
              classNames={{ root: "mt-1.5 flex-1 md:col-span-2 md:mt-0" }}
              placeholder="********"
              {...register("confirmPassword")}
              error={errors?.confirmPassword?.message}
              onPaste={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
            />
          </div>

          <div className="w-full text-end">
            <InputErrorMsg when={resetStatus.status}>
              {resetStatus.message}
            </InputErrorMsg>
          </div>
        </div>
        <div className="mt-4 space-x-2 text-end">
          <Button className="min-w-[7rem]" type="reset" onClick={() => reset()}>
            Cancel
          </Button>
          <Button type="submit" color="primary">
            Update password
          </Button>
        </div>
      </form>

      <div className="dark:bg-dark-500 my-6 h-px bg-gray-200" />

      <div>
        <div>
          <p className="dark:text-dark-100 text-base font-medium text-gray-800">
            Accounts Security
          </p>
          <p className="mt-0.5">
            Manage your linked accounts and their permissions.
          </p>
        </div>
        <div>
          <div className="mt-4 flex items-center justify-between space-x-2">
            <div className="flex min-w-0 items-center space-x-4">
              <Avatar size={10} initialColor="primary">
                <Fingerprint fill="currentColor" className="text" />
              </Avatar>
              <p className="truncate font-medium">
                Multi-factor authentication
              </p>
            </div>
            <Button
              type="button"
              onClick={() => handleTwoStep(user, !user?.twoFactor?.enabled)}
              className={clsx(
                "text-xs-plus h-8 !cursor-pointer rounded-full px-3 opacity-100",
                user?.twoFactor?.enabled
                  ? ""
                  : "border-orange-500 text-orange-500",
              )}
              variant="outlined"
            >
              {user?.twoFactor?.enabled ? "Connected" : "Not Connected"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
