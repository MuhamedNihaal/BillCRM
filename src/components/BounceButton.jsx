import { Button } from "components/ui";
import { motion } from "framer-motion";
import DynamicIcon from "./DynamicIcon";
import { cn } from "lib/utils";

/**
 * BounceButton Component
 *
 * A reusable animated button that toggles between "Edit" and "Close" states
 * with smooth bounce and rotation effects.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.className - className
 * @param {string} props.icon - The name of the icon to render (passed to DynamicIcon)
 * @param {boolean} props.isOpen - Indicates whether the button is in the "open" state
 * @param {Function} props.close - Function called when closing (if isOpen is true)
 * @param {Function} props.open - Function called when opening (if isOpen is false)
 *
 * @example
 * // Usage Example
 * <BounceButton
 *   icon="Edit3"
 *   isOpen={isEditing}
 *   open={() => setIsEditing(true)}
 *   close={() => setIsEditing(false)}
 * />
 *
 * Features:
 * - Smooth hover and click animations using Framer Motion
 * - Icon rotation (flip) when toggling state
 * - Label transitions between "Edit" and "Close"
 * - Responsive and accessible button design
 */
const BounceButton = ({ icon, isOpen, close, open, className }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className={cn("mt-3 h-10 w-full", className)}
    >
      <Button
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md active:scale-95 sm:px-4"
        color="primary"
        onClick={() => (isOpen ? close() : open())}
      >
        <motion.div
          animate={{ rotateY: isOpen ? 180 : 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center"
        >
          <DynamicIcon name={icon} className="size-4" />
        </motion.div>
        <motion.span
          key={isOpen ? "Close" : "Edit"}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? "Close" : "Edit"}
        </motion.span>
      </Button>
    </motion.div>
  );
};

export default BounceButton;
