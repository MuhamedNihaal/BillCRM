/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { ConfirmModal } from "components/shared/ConfirmModal";
import { useDidUpdate } from "hooks";

const ConfirmDialogContext = createContext();

export const ConfirmDialogProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const resolveRef = useRef(null);

  const [confirmLoading, setConfirmLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [dialogContent, setDialogContent] = useState({});

  useDidUpdate(() => {
    if (success) {
      setConfirmLoading(false);
      const timer = setTimeout(() => {
        close();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [success]);

  const open = () => setIsOpen(true);
  const close = () => {
    setIsOpen(false);
    setConfirmLoading(false);
    setError(false);
    setDialogContent({});
  };

  const confirm = useCallback(
    ({
      pending = {
        title: "Are you sure?",
        description:
          "Are you sure you want to proceed with this action? Once completed, it cannot be undone.",
        actionText: "Confirm",
        actionText2: "Cancel",
      },
      success = { title: "Action Completed" },
      error = {
        description:
          "Something went wrong. Please check your connection and try again. Contact support if the issue continues.",
      },
    } = {}) => {
      return new Promise((resolve) => {
        pending.Icon = ExclamationTriangleIcon;
        setDialogContent({ pending, success, error });
        setSuccess(false);
        setError(false);
        resolveRef.current = resolve;
        open();
      });
    },
    [],
  );

  const handleConfirm = useCallback(() => {
    setConfirmLoading(true);
    if (resolveRef.current) {
      resolveRef.current({
        status: true,
        setSuccess,
        setError,
        setDialogContent,
        setConfirmLoading,
        close,
      });
      resolveRef.current = null;
    }
  }, []);

  const handleCancel = useCallback(() => {
    close();
    setConfirmLoading(false);
    setError(false);
    if (resolveRef.current) {
      resolveRef.current({ status: false });
      resolveRef.current = null;
    }
  }, []);

  const state = useMemo(() => {
    if (error) return "error";
    if (success) return "success";
    return "pending";
  }, [error, success]);

  const DialogBox = (
    <ConfirmModal
      show={isOpen}
      onClose={handleCancel}
      messages={dialogContent}
      onOk={handleConfirm}
      confirmLoading={confirmLoading}
      state={state}
    />
  );

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      {DialogBox}
    </ConfirmDialogContext.Provider>
  );
};

/**
 *
 * @returns {function(): Promise<{
 *   status: boolean,
 *   setSuccess: (success: boolean) => void,
 *   setError: (message: string) => void,
 *   setDialogContent: (content: {
 *     pending?: {
 *       title: string,
 *       description: string,
 *       actionText: string,
 *       actionText2?: string
 *     },
 *     success?: {
 *       title: string,
 *       description: string
 *     },
 *     error?: {
 *       title: string,
 *       description: string
 *     }
 *   }) => void,
 *   setConfirmLoading: (loading: boolean) => void,
 *   close: () => void
 * }>}
 * A promise-based confirm function. When called, it will open the dialog and
 * resolve with an object:
 * - `status`: `true` if the user confirmed, `false` if cancelled.
 * - `setSuccess(success)`: mark the confirmation as successful.
 * - `setError(message)`: display an error state in the dialog.
 * - `setDialogContent(content)`: update dialog content (pending, success, error).
 * - `setConfirmLoading(loading)`: toggle confirm button loading state.
 * - `close()`: close the dialog.
 *
 * @example
 * ```jsx
 * const confirm = useConfirm();
 *
 * try {
 *   const action = await confirm();
 *   if (action.status) {
 *     action.setSuccess(true);
 *   }
 * } catch (error) {
 *   action.setError(error?.message);
 * }
 * ```
 */
export const useConfirm = () => {
  const context = useContext(ConfirmDialogContext);
  if (!context)
    throw new Error("useConfirm must be used within a ConfirmDialogProvider");
  return context.confirm;
};
