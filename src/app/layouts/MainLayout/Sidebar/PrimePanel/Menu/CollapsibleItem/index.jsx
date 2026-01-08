// Import Dependencies
import PropTypes from "prop-types";
import clsx from "clsx";
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

// Local Imports
import { AccordionButton, AccordionItem, AccordionPanel } from "components/ui";
import { useLocaleContext } from "app/contexts/locale/context";
import { MenuItem } from "./MenuItem";
import DynamicIcon from "components/DynamicIcon";
import { Divider } from "../Divider";
export function CollapsibleItem({ data }) {
  const { path, childs, transKey, divider = false } = data;

  const { t } = useTranslation();
  const { isRtl } = useLocaleContext();
  const title = t(transKey) || data.title;

  const Icon = isRtl ? ChevronLeftIcon : ChevronRightIcon;

  return (
    <>
      <AccordionItem value={path}>
        {({ open }) => (
          <>
            <AccordionButton
              className={clsx(
                "group text-xs-plus flex w-full min-w-0 cursor-pointer items-center justify-between gap-1 py-2 text-start tracking-wide outline-hidden transition-[color,padding-left,padding-right] duration-300 ease-in-out",
                open
                  ? "dark:text-dark-50 font-semibold text-gray-800"
                  : "dark:text-dark-200 dark:hover:text-dark-50 dark:focus:text-dark-50 text-gray-600 hover:text-gray-800 focus:text-gray-800",
              )}
            >
              <div className="flex items-center gap-2">
                <DynamicIcon
                  name={data.icon}
                  className={clsx(
                    open
                      ? "text-this dark:text-this-light"
                      : "dark:text-dark-200 dark:group-hover:text-dark-100 dark:group-focus:text-dark-100 text-gray-500 group-hover:text-gray-600 group-focus:text-gray-600",
                    "size-4.5 transition-colors",
                  )}
                />
                <span className="truncate capitalize">{title}</span>
              </div>
              <Icon
                className={clsx(
                  "dark:text-dark-200 size-4 text-gray-400 transition-transform ease-in-out",
                  open && [isRtl ? "-rotate-90" : "rotate-90"],
                )}
              />
            </AccordionButton>
            <AccordionPanel>
              {childs.map((i) => (
                <MenuItem key={i.path} data={i} />
              ))}
            </AccordionPanel>
          </>
        )}
      </AccordionItem>
      {divider && <Divider />}
    </>
  );
}

CollapsibleItem.propTypes = {
  data: PropTypes.object,
};
