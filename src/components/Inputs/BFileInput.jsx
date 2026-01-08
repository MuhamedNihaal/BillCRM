/* eslint-disable react-hooks/exhaustive-deps */
import { PaperClipIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button, Input, Upload } from "components/ui";
import { useDidUpdate, useUncontrolled } from "hooks";
import { Fragment, useEffect, useRef, useState } from "react";
import { Controller } from "react-hook-form";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";

const BFileInput = ({
  name,
  label,
  error,
  handleOnChange,
  defaultValue,
  value,
  reset: resetTrigger = null,
  accept = "",
  src = null,
  ...props
}) => {
  const uploadRef = useRef();

  const [_value, handleChange] = useUncontrolled({ defaultValue, value });

  let [fileName, setFileName] = useState("Choose File");

  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);

  let isFileSet = useRef(false);
  let isImageReset = useRef(0);

  useEffect(() => {
    if (src) {
      let url = String(src).split("/");
      let file_name = url[url.length - 1] || null;
      if (file_name && !src.startsWith("blob:")) {
        setFileName(file_name);
        setPreviewSrc(src);
      }
    } else if (!isFileSet.current) {
      setPreviewSrc(null);
      setFileName("Choose File");
    }
  }, [src]);

  const reset = () => {
    handleChange(null);
    handleOnChange({ name: name, value: null, file: null });
    setFileName("Choose File");
    isFileSet.current = false;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewSrc(null);
  };

  useDidUpdate(() => {
    if (resetTrigger) reset();
  }, [resetTrigger]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, []);

  const renderInput = (fields) => {
    let { value, onChange } = fields;

    if (!value) {
      isImageReset.current = Date.now();
    }

    return (
      <Upload
        name={name}
        multiple={false}
        onChange={(e) => {
          let target = { name: name, value: e, file: e };

          isFileSet.current = true;

          handleOnChange(target);
          onChange({ target: target });

          if (e) {
            const url = URL.createObjectURL(e);
            setFileName(e?.name ?? "Choose File");
            setPreviewUrl(url);
            setPreviewSrc(null);
          } else {
            setPreviewUrl(null);
          }
        }}
        ref={uploadRef}
        accept={accept}
      >
        {({ ...props }) => (
          <>
            <Input
              {...props}
              component="button"
              type="button"
              prefix={
                <div>
                  <Popover className="relative w-full">
                    <PopoverButton
                      as={Fragment}
                      disabled={!previewSrc && !previewUrl}
                    >
                      <PaperClipIcon
                        className={`size-5 ${previewUrl || previewSrc ? "cursor-pointer" : "cursor-not-allowed"}`}
                      />
                    </PopoverButton>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out"
                      enterFrom="opacity-0 translate-y-2"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-2"
                    >
                      <PopoverPanel
                        anchor={{ to: "bottom start", gap: 8 }}
                        className="ring-primary-500/50 dark:border-dark-500 dark:bg-dark-750 z-[10] mt-1 w-60 overflow-hidden rounded-md border border-gray-300 bg-white shadow-lg shadow-gray-200/50 outline-none focus-visible:ring focus-visible:outline-none dark:shadow-none"
                      >
                        <div className="relative grid h-full w-full gap-8 p-0.5">
                          {previewSrc ||
                          value?.type?.startsWith("image/") ||
                          value?.type?.startsWith("blob:") ? (
                            <img
                              src={previewSrc || previewUrl}
                              alt="img-preview"
                              className="h-full w-full rounded-sm object-fill"
                            />
                          ) : value?.type?.startsWith("video/") ? (
                            <video src={previewUrl} controls />
                          ) : (
                            <iframe src={previewUrl} />
                          )}
                        </div>
                      </PopoverPanel>
                    </Transition>
                  </Popover>
                </div>
              }
              suffix={
                previewSrc || previewUrl ? (
                  <Button
                    type="button"
                    variant="flat"
                    className="pointer-events-auto size-5 shrink-0 rounded-full p-0"
                    onClick={() => {
                      reset();
                    }}
                  >
                    <XMarkIcon className="size-4" />
                  </Button>
                ) : null
              }
              title={fileName}
              className="cursor-pointer truncate text-start"
              label={label}
              value={value ?? ""}
              error={error}
            >
              {fileName}
            </Input>
          </>
        )}
      </Upload>
    );
  };

  if (props.control) {
    return (
      <Controller
        name={name}
        control={props.control}
        defaultValue={defaultValue}
        render={({ field }) => {
          return renderInput(field);
        }}
      />
    );
  }

  return renderInput({
    value: _value,
    onChange: (e) => {
      handleChange(e[0]);
    },
  });
};

export default BFileInput;
