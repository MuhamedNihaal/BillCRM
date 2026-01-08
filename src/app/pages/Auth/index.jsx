/* eslint-disable react-hooks/exhaustive-deps */
// Import Dependencies
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";

// Local Imports
import Logo from "assets/noble.svg?react";
import LoginWallpaper from "assets/login_bg_3.png?react";
import { Button, Card, Checkbox, Input, InputErrorMsg } from "components/ui";
import { useAuthContext } from "app/contexts/auth/context";
import { schema } from "./schema";
import { Page } from "components/shared/Page";
import { useDisclosure } from "hooks";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import Otp from "components/ui/OtpInput/OtpInput";
import { post } from "utility";

import Image from "components/Image";
import { APP_NAME } from "constants/app.constant";
import { useEffect } from "react";

import { setAccessToken, setRefreshToken } from "utils/setToken";

// ----------------------------------------------------------------------

export default function SignIn() {
  const {
    login,
    errorMessage,
    twoStep,
    setTwoStep,
    loginAgain,
    reCallCheckAllow,
    setError,
  } = useAuthContext();

  useEffect(() => {
    setError("");
  }, []);

  const [show, { toggle }] = useDisclosure();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = (data) => {
    login(data);
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();

    if (!twoStep?.otp || twoStep?.otp?.length !== 6) {
      setError({ message: "Enter all digits of your MFA code." });
      return;
    }

    try {
      let { data } = await post(
        `auth/mfa/verify`,
        {
          otp: twoStep?.otp,
        },
        {
          headers: {
            "x-temp-token": twoStep.token,
          },
        },
      );

      setRefreshToken(data.refresh, twoStep.rememberMe ?? false);
      setAccessToken(data);

      reCallCheckAllow(true);
      setError("");
    } catch (err) {
      if (err?.removeLogin || err?.data?.removeLogin) {
        loginAgain();
      } else {
        setError(err);
      }
    }
  };

  const handleQrContinue = (e) => {
    e.preventDefault();
    setTwoStep({ ...twoStep, continue: true });
  };

  return (
    <Page>
      <main className="min-h-100vh relative grid w-full grow grid-cols-1 place-items-center">
        <Image
          src={LoginWallpaper}
          classNames={{
            root: "h-full w-full",
            wrapper: "absolute h-full w-full",
            img: "h-full w-full object-cover brightness-50",
            skelton: "h-full w-full",
          }}
        />
        <div className="dark:bg-dark-500 dark:border-dark-400 absolute w-[380px] rounded-lg border bg-white p-4 shadow-lg max-sm:w-11/12 sm:px-5">
          <div className="text-center">
            <Logo className="mx-auto size-20 text-black dark:text-white" />

            <p className="dark:text-dark-300 text-gray-400">
              Please sign in to continue
            </p>
          </div>
          <Card className="mt-1 flex min-h-[250px] items-center justify-center rounded-none border-none px-5 py-3">
            {(twoStep?.enabled && twoStep?.qrCode) ||
            (twoStep?.enabled && twoStep?.used) ? (
              <>
                {twoStep?.used || twoStep?.continue ? (
                  <>
                    <form
                      onSubmit={handleOtpVerify}
                      autoComplete="off"
                      className="min-h-[300px"
                    >
                      <p className="dark:text-dark-300 text-center text-gray-400">
                        Please enter your MFA code
                      </p>

                      <div className="flex items-center justify-center space-y-4">
                        <Otp
                          setOtp={(e) => {
                            setTwoStep({
                              ...twoStep,
                              otp: e,
                            });
                          }}
                        />
                      </div>

                      <InputErrorMsg
                        when={errorMessage && errorMessage?.message !== ""}
                      >
                        {errorMessage?.message}
                      </InputErrorMsg>

                      <Button
                        type="submit"
                        className="mt-5 w-full"
                        color="primary"
                      >
                        Verify
                      </Button>
                    </form>
                  </>
                ) : (
                  <>
                    <form onSubmit={handleQrContinue} autoComplete="off">
                      <Card className="dark:bg-dark-600 flex items-center justify-center space-y-4 bg-gray-100">
                        <img
                          src={twoStep?.qrCode}
                          alt="qr code"
                          className="transition-all dark:brightness-125 dark:contrast-125 dark:invert"
                        />
                      </Card>

                      <Button
                        type="submit"
                        className="mt-5 w-full"
                        color="primary"
                      >
                        Continue
                      </Button>
                    </form>
                  </>
                )}
              </>
            ) : (
              <>
                <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                  <div className="space-y-4">
                    <Input
                      label="Username"
                      placeholder="Enter Username"
                      prefix={
                        <EnvelopeIcon
                          className="size-5 transition-colors duration-200"
                          strokeWidth="1"
                        />
                      }
                      {...register("username")}
                      error={errors?.username?.message}
                    />

                    <Input
                      label="Password"
                      type={show ? "text" : "password"}
                      placeholder="Enter Password"
                      prefix={
                        <LockClosedIcon
                          className="size-5 transition-colors duration-200"
                          strokeWidth="1"
                        />
                      }
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
                      {...register("password")}
                      error={errors?.password?.message}
                    />
                  </div>

                  <div className="mt-2">
                    <InputErrorMsg
                      when={errorMessage && errorMessage?.message !== ""}
                    >
                      {errorMessage?.message}
                    </InputErrorMsg>
                  </div>

                  <div className="mt-4 flex items-center justify-between space-x-2">
                    <Checkbox label="Remember me" {...register("rememberMe")} />
                  </div>

                  <Button
                    type="submit"
                    className="mt-5 w-full"
                    color="primary"
                    disabled={isSubmitting}
                  >
                    Sign In
                  </Button>
                </form>
              </>
            )}
          </Card>

          <p className="text-xs-plus dark:text-dark-300 mt-8 text-center text-gray-400">
            ©{__YEAR__} {APP_NAME}. All Rights Reserved.
          </p>
          <p className="text-xs-plus dark:text-dark-300 mt-2 line-clamp-1 text-center text-gray-400">
            <span>Powered By</span>
            <a
              href="https://srvinfotech.com/"
              data-discover="true"
              className="hover:underline"
              target="_blank"
            >
              {" "}
              SRV InfotTech
            </a>
          </p>
        </div>
      </main>
    </Page>
  );
}
