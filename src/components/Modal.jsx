import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment, useRef } from "react";

import { useBreakpointsContext } from "app/contexts/breakpoint/context";

import { Button } from "components/ui";
import { cn } from "lib/utils";
import clsx from "clsx";

const Modal = ({
  title = "",
  description = "",
  isOpen = false,
  close,
  className,
  ...props
}) => {
  const { smAndDown } = useBreakpointsContext();

  let isFunctionChildren = typeof props.children === "function" ? true : false;

  const saveRef = useRef(null);

  const View = smAndDown ? MobileView : DesktopView;

  return (
    <View
      {...{
        title,
        description,
        isOpen,
        close,
        saveRef,
        className,
        isFunctionChildren,
      }}
    >
      {props.children}
    </View>
  );
};

export default Modal;

const MobileView = ({
  title = "Edit pin",
  description = "",
  isOpen,
  close,
  children,
  saveRef,
  isFunctionChildren,
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
        onClose={!isFunctionChildren ? close : () => {}}
        initialFocus={saveRef}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[1px] transition-opacity dark:bg-black/30" />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <TransitionChild
            as={DialogPanel}
            enter="ease-out transform-gpu transition-transform duration-200"
            enterFrom="translate-y-full"
            enterTo="translate-y-0"
            leave="ease-in transform-gpu transition-transform duration-200"
            leaveFrom="translate-y-0"
            leaveTo="translate-y-full"
            className="dark:bg-dark-700 fixed bottom-0 left-0 flex w-full transform-gpu flex-col rounded-t-2xl bg-white transition-transform duration-200"
          >
            <div
              className={clsx(
                "dark:bg-dark-800 flex items-center justify-between rounded-t-lg bg-gray-200 px-4 py-3 sm:px-5",
                isFunctionChildren && "hidden",
              )}
            >
              <DialogTitle
                as="h3"
                className={clsx(
                  "dark:text-dark-100 text-base font-medium text-gray-800",
                  isFunctionChildren && "hidden",
                )}
              >
                {title}
              </DialogTitle>
              <Button
                onClick={close}
                variant="flat"
                isIcon
                className="size-7 rounded-full ltr:-mr-1.5 rtl:-ml-1.5"
              >
                <XMarkIcon className="size-4.5" />
              </Button>
            </div>

            <div
              className={cn(
                "flex max-h-[85vh] flex-col overflow-y-auto px-4 py-4 sm:px-5",
                isFunctionChildren && "p-0!",
              )}
            >
              <p>{description}</p>

              {isFunctionChildren ? children({ close }) : children}
            </div>
          </TransitionChild>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};

const DesktopView = ({
  title = "Edit pin",
  description = "",
  isOpen,
  close,
  children,
  saveRef,
  className,
  isFunctionChildren,
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
        onClose={!isFunctionChildren ? close : () => {}}
        initialFocus={saveRef}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[1px] transition-opacity dark:bg-black/30" />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <DialogPanel
            className={cn(
              "dark:bg-dark-700 relative flex w-full max-w-xl origin-top flex-col overflow-hidden rounded-lg bg-white transition-all duration-300",
              className,
            )}
          >
            <div
              className={clsx(
                "dark:bg-dark-800 flex items-center justify-between rounded-t-lg bg-gray-200 px-4 py-3 sm:px-5",
                isFunctionChildren && "hidden",
              )}
            >
              <DialogTitle
                as="h3"
                className="dark:text-dark-100 text-base font-medium text-gray-800"
              >
                {title}
              </DialogTitle>
              <Button
                onClick={close}
                variant="flat"
                isIcon
                className="size-7 rounded-full ltr:-mr-1.5 rtl:-ml-1.5"
              >
                <XMarkIcon className="size-4.5" />
              </Button>
            </div>

            <div
              className={cn(
                "hide-scrollbar flex h-full w-full flex-col overflow-y-auto px-4 py-4 sm:px-5",
                isFunctionChildren && "p-0!",
              )}
            >
              <p>{description}</p>

              {isFunctionChildren ? children({ close }) : children}
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};
