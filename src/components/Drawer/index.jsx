import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { cn } from "lib/utils";
import { Fragment, memo } from "react";

/**
 * @typedef {Object} DrawerProps
 *
 * @property {'left' | 'right' | 'top' | 'bottom'} [position='left']
 * @property {boolean} [show=false]
 * @property {() => void} [onClose]
 * @property {string} [className]
 */

/**
 * @param {DrawerProps} props
 */
const Drawer = ({
  position = "left",
  show = false,
  className,
  onClose = () => {},
  ...props
}) => {
  let positions = {
    top: {
      enterFrom: "-translate-y-full",
      enterTo: "translate-y-0",
      leaveFrom: "translate-y-0",
      leaveTo: "-translate-y-full",

      panel: "left-0 top-0 w-full min-h-10",
    },
    right: {
      enterFrom: "translate-x-full",
      enterTo: "translate-x-0",
      leaveFrom: "translate-x-0",
      leaveTo: "translate-x-full",

      panel: "right-0 top-0 h-full min-w-72 overflow-y-auto hide-scrollbar",
    },
    bottom: {
      enterFrom: "translate-y-full",
      enterTo: "translate-y-0",
      leaveFrom: "translate-y-0",
      leaveTo: "translate-y-full",

      panel: "bottom-0 left-0 w-full min-h-10",
    },
    left: {
      enterFrom: "-translate-x-full",
      enterTo: "translate-x-0",
      leaveFrom: "translate-x-0",
      leaveTo: "-translate-x-full",

      panel: "left-0 top-0 h-full min-w-72 overflow-y-auto hide-scrollbar",
    },
  }[position];

  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/40" />
        </TransitionChild>
        <TransitionChild
          as={Fragment}
          enter="ease-out transform-gpu transition-transform duration-200"
          enterFrom={positions.enterFrom}
          leave="ease-in transform-gpu transition-transform duration-200"
          leaveFrom={positions.leaveFrom}
          leaveTo={positions.leaveTo}
        >
          <DialogPanel
            className={cn(
              "dark:bg-dark-700 fixed flex transform-gpu flex-col bg-white transition-transform duration-200",
              positions.panel,
              className,
            )}
          >
            {props.children}
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};

export default memo(Drawer);
