import { memo, useEffect, useMemo, useState } from "react";
import { useTimer } from "react-timer-hook";
import { cn } from "lib/utils";
import DynamicIcon from "./DynamicIcon";
import clsx from "clsx";
import { useDidUpdate } from "hooks";

/**
 * @typedef ClassNames
 * @property {string} [root]
 * @property {string} [title]
 * @property {string} [container]
 * @property {string} [icon]
 * @property {string} [info]
 * @property {string} [digit]
 * @property {string} [leftDigit]
 * @property {string} [rightDigit]
 */

/**
 * @param {Object} props
 * @param {number} [props.expirySeconds]
 * @param {string} [props.title]
 * @param {boolean} [props.info=false]
 * @param {boolean} [props.join=false]
 * @param {function} [props.onExpire]
 * @param {ClassNames} [props.classNames]
 * @param {React.ReactElement|boolean} [props.icon]
 * @param {string} [props.tooltip]
 * @param {"dark"|"error"|"info"|"light"|"success"|"warning"} [props.tooltipVariant="dark"]
 */
const Deadline = ({
  expirySeconds = 0,
  classNames,
  title,
  info = false,
  join = false,
  restartNow = 0,
  onExpire = null,
  ...props
}) => {
  let [isCalled, setIsCalled] = useState(false);

  useEffect(() => {
    setIsCalled(false);
  }, []);

  const expiryTimestamp = useMemo(() => {
    const t = new Date();
    t.setSeconds(t.getSeconds() + expirySeconds);
    return t;
  }, [expirySeconds]);

  const { seconds, minutes, hours, restart } = useTimer({ expiryTimestamp });

  useDidUpdate(() => {
    const newExpiry = new Date();
    newExpiry.setSeconds(newExpiry.getSeconds() + expirySeconds);
    restart(newExpiry);
  }, [restartNow]);

  const isExpired = hours === 0 && minutes === 0 && seconds === 0;

  useEffect(() => {
    if (isExpired && !isCalled) {
      setIsCalled(true);
      onExpire?.();
    }
  }, [isExpired, isCalled, onExpire]);

  const duration =
    [hours > 0 && `${hours}h`, minutes > 0 && `${minutes}m`]
      .filter(Boolean)
      .join(" ") || `${seconds}s`;

  const tooltipMessage =
    props.tooltip?.replace("{{duration}}", duration) ??
    `Chat expires in ${duration}. After that, only template messages can be sent on WhatsApp.`;

  return (
    <div className={cn("w-fit", classNames?.root)}>
      {title && <p className={cn("font-medium", classNames?.title)}>{title}</p>}

      <div
        className={cn(
          "text-primary-600 dark:text-primary-400 text-center text-4xl font-semibold",
          join ? "flex gap-1" : "grid grid-cols-3 gap-3",
          props?.tooltip && "cursor-pointer",
          classNames?.container,
          hours == 0 && minutes < 8 && "text-error-lighter!",
        )}
        {...(props.tooltip && {
          ["data-tooltip"]: true,
          ["data-tooltip-content"]: tooltipMessage,
          "data-tooltip-variant": props?.tooltipVariant ?? "dark",
        })}
      >
        <DynamicIcon
          name={"timer"}
          className={clsx("mr-0.5", cn("size-4.5", classNames?.icon))}
        />
        <Digit value={hours} classNames={classNames} join={join} split />
        <Digit value={minutes} classNames={classNames} join={join} split />
        <Digit value={seconds} classNames={classNames} join={join} />
      </div>

      {info && (
        <div
          className={cn(
            "text-xs-plus mt-2 text-center",
            join ? "flex justify-center gap-1" : "grid grid-cols-3 gap-3",
            classNames?.info,
          )}
        >
          <p>hours</p>
          <p>minutes</p>
          <p>seconds</p>
        </div>
      )}
    </div>
  );
};

export default memo(Deadline);

const Digit = memo(function Digit({ value, classNames, join, split }) {
  const padded = String(value).padStart(2, "0");
  const [leftDigit, rightDigit] = padded;

  const baseDigit = cn("rounded-lg py-1", classNames?.digit);

  if (join) {
    return (
      <div className={baseDigit}>
        {padded}
        {split && ":"}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-1">
      <div className={cn(baseDigit, classNames?.leftDigit)}>{leftDigit}</div>
      <div className={cn(baseDigit, classNames?.rightDigit)}>{rightDigit}</div>
    </div>
  );
});
