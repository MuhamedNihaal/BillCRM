import { Badge } from "components/ui";
import { APP_NAME } from "constants/app.constant";
import { cn } from "lib/utils";
import { memo } from "react";
import { Link } from "react-router";
import Logo from "assets/srv.svg?react";

const copyright = ({ icon = false }) => {
  return icon ? <WithIcon /> : <NoIcon />;
};

export default memo(copyright);

const NoIcon = memo(() => {
  return (
    <footer>
      <div className="dark:bg-dark-500 my-4 h-px bg-gray-200"></div>
      <div className="flex flex-wrap justify-between space-y-2 space-x-2 pt-3">
        <div>
          <RightsReserved />
        </div>

        <div className="flex w-full items-center justify-between gap-3">
          <PowerBy />

          <Version />
        </div>
      </div>
    </footer>
  );
});

NoIcon.displayName = "NoIcon";

const WithIcon = memo(() => {
  return (
    <footer>
      <div className="dark:bg-dark-500 my-4 h-px bg-gray-200"></div>
      <div className="flex flex-col items-center justify-center space-y-2 space-x-2">
        <RightsReserved className="text-center text-xs" />
        <PowerBy className="text-center text-xs mb-3" />

        <Logo />
        <Version className="mt-1" />
      </div>
    </footer>
  );
});

WithIcon.displayName = "WithIcon";

const Version = memo(({ className }) => {
  return <Badge className={className}>V{__APP_VERSION__}</Badge>;
});

Version.displayName = "Version";

const RightsReserved = memo(({ className }) => {
  return (
    <p className={cn("cursor-default text-sm", className)}>
      © {__YEAR__} {APP_NAME} All Rights Reserved.
    </p>
  );
});

RightsReserved.displayName = "RightsReserved";

const PowerBy = memo(({ className }) => {
  return (
    <p className={cn("cursor-default text-sm", className)}>
      Powered by{" "}
      <Link
        to={"https://srvinfotech.com/"}
        className="hover:underline"
        target="_blank"
      >
        SRV InfoTech
      </Link>
      .
    </p>
  );
});

PowerBy.displayName = "PowerBy";
