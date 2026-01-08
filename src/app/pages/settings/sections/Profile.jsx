/* eslint-disable react-hooks/exhaustive-deps */
// Import Dependencies
import { PhoneIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { EnvelopeIcon, UserIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import { HiPencil } from "react-icons/hi";

// Local Imports
import { PreviewImg } from "components/shared/PreviewImg";
import { Avatar, Button, Upload } from "components/ui";
import { useAuthContext } from "app/contexts/auth/context";
import { useDisclosure } from "hooks";
import { useForm } from "react-hook-form";
import Inputs from "components/Inputs";
import { toast } from "sonner";
import { post, put } from "utility";
import { API_URL } from "constants/app.constant";

// ----------------------------------------------------------------------

export default function General() {
  const [avatar, setAvatar] = useState(null);
  let [isEditing, { toggle, close }] = useDisclosure();

  const { user, reCallCheckAllow } = useAuthContext();

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    reset({
      username: user?.username || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      mobile: user?.mobile || "",
    });
  }, []);

  let onSubmit = async (data) => {
    try {
      let res = await put("user/basic", data);
      close();

      toast.success(res?.message);

      if (user?._id && avatar) {
        let formData = new FormData();
        formData.append("file", avatar);

        await post("user/image", formData);
      }

      reCallCheckAllow();
    } catch (error) {
      setAvatar(null);
      toast.error(error?.message);
    }
  };

  const inputs = useMemo(
    () => [
      {
        label: "Username",
        name: "username",
        prefix: UserIcon,
      },
      {
        label: "First Name",
        name: "firstName",
        prefix: UserIcon,
      },
      {
        label: "Last Name",
        name: "lastName",
        prefix: UserIcon,
      },
      {
        label: "Email",
        name: "email",
        prefix: EnvelopeIcon,
      },
      {
        label: "Mobile",
        name: "mobile",
        prefix: PhoneIcon,
      },
    ],
    [],
  );

  return (
    <form
      className="w-full max-w-3xl 2xl:max-w-5xl"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h5 className="dark:text-dark-50 text-lg font-medium text-gray-800">
        Profile
      </h5>
      <p className="dark:text-dark-200 mt-0.5 text-sm text-balance text-gray-500">
        Update your profile.
      </p>
      <div className="dark:bg-dark-500 my-5 h-px bg-gray-200" />
      <div className="mt-4 flex flex-col space-y-1.5">
        <span className="dark:text-dark-100 text-base font-medium text-gray-800">
          Image
        </span>
        <Avatar
          size={20}
          imgComponent={PreviewImg}
          imgProps={{ file: avatar }}
          src={`${API_URL}${user?.image}`}
          classNames={{
            root:
              isEditing &&
              "ring-primary-600 dark:ring-primary-500 dark:ring-offset-dark-700 rounded-xl ring-offset-[3px] ring-offset-white transition-all hover:ring-3",
            display: "rounded-xl",
          }}
          indicator={
            isEditing ? (
              <div className="dark:bg-dark-700 absolute right-0 bottom-0 -m-1 flex items-center justify-center rounded-full bg-white">
                {avatar ? (
                  <Button
                    onClick={() => setAvatar(null)}
                    isIcon
                    className="size-6 rounded-full"
                  >
                    <XMarkIcon className="size-4" />
                  </Button>
                ) : (
                  <Upload
                    name="avatar"
                    onChange={setAvatar}
                    accept="image/jpeg, image/png, image/svg+xml"
                  >
                    {({ ...props }) => (
                      <Button isIcon className="size-6 rounded-full" {...props}>
                        <HiPencil className="size-3.5" />
                      </Button>
                    )}
                  </Upload>
                )}
              </div>
            ) : null
          }
        />
      </div>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 [&_.prefix]:pointer-events-none">
        {inputs.map((input, idx) => (
          <Inputs
            key={idx}
            control={control}
            label={input.label}
            name={input.name}
            placeholder={`Enter the ${input.name?.toLowerCase()}`}
            type="text"
            disabled={!isEditing}
          />
        ))}
      </div>
      <div className="dark:bg-dark-500 my-7 h-px bg-gray-200" />

      <div className="mt-8 flex justify-end space-x-3">
        <Button
          className="min-w-[7rem]"
          type="button"
          onClick={() => {
            toggle();
            setAvatar(null);
          }}
        >
          {isEditing ? "Cancel" : "Edit"}
        </Button>
        {isEditing && (
          <Button className="min-w-[7rem]" color="primary" type="submit">
            Update
          </Button>
        )}
      </div>
    </form>
  );
}
