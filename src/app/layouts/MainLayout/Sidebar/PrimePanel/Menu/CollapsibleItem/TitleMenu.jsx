// Import Dependencies
import { ChevronUpIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

// Local Imports
import { Button, Collapse } from "components/ui";
import { useDisclosure } from "hooks";
import { MenuItem } from "./MenuItem";

const TitleMenu = ({ data }) => {
  const { childs, divider = false, title, defaultOpen = true } = data;

  const [isOpen, { toggle }] = useDisclosure(defaultOpen);

  return (
    <div className={`${!divider && "mb-2.5"}`}>
      <div className="flex min-w-0 items-center justify-between">
        <span className="text-tiny-plus truncate font-medium uppercase">
          {title}
        </span>
        <div className="flex ltr:-mr-1.5 rtl:-ml-1.5">
          <Button
            onClick={toggle}
            variant="flat"
            isIcon
            className="size-6 rounded-full"
          >
            <ChevronUpIcon
              className={clsx(
                "size-3.5 stroke-2 transition-transform",
                isOpen && "rotate-180",
              )}
            />
          </Button>
        </div>
      </div>
      <Collapse in={isOpen}>
        {childs.map((i) => (
          <MenuItem key={i.path} data={i} />
        ))}
      </Collapse>

      {divider && <div className="dark:bg-dark-500 my-2.5 h-px bg-gray-200" />}
    </div>
  );
};

export default TitleMenu;
