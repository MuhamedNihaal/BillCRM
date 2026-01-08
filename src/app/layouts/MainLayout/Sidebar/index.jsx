// Import Dependencies
import { useMemo, useState } from "react";
import { useLocation } from "react-router";

// Local Imports
import { useBreakpointsContext } from "app/contexts/breakpoint/context";
import { useSidebarContext } from "app/contexts/sidebar/context";
import { useDidUpdate } from "hooks";
import { isRouteActive } from "utils/isRouteActive";
import { MainPanel } from "./MainPanel";
import { PrimePanel } from "./PrimePanel";
import { useAuthContext } from "app/contexts/auth/context";
import { settings } from "app/navigation/settings";

// ----------------------------------------------------------------------

export function Sidebar() {
  const { pathname } = useLocation();
  const { name, lgAndDown } = useBreakpointsContext();
  const { isExpanded, close } = useSidebarContext();
  let params = new URLSearchParams(window.location.search);
  let previousModule = params.get("previous");

  let { modules } = useAuthContext();

  const initialSegment = useMemo(
    () => {
      let initialModule = modules?.find((item) =>
        isRouteActive(item.path, pathname),
      );

      if (!initialModule && previousModule) {
        initialModule = [...modules, settings]?.find((item) =>
          isRouteActive(item.path, previousModule),
        );
      }

      if (!initialModule) {
        initialModule = modules?.[0];
      }

      if (!initialModule) {
        initialModule = [{}];
      }

      return initialModule;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modules],
  );

  const [activeSegmentPath, setActiveSegmentPath] = useState(
    initialSegment?.path,
  );

  const currentSegment = useMemo(() => {
    let currentModule = modules?.find(
      (item) => item.path === activeSegmentPath,
    );

    let flag = false;
    if (!currentModule && previousModule) {
      currentModule = [...modules, settings]?.find((item) =>
        isRouteActive(item.path, previousModule),
      );
      flag = true;
    }

    if (!currentModule) {
      currentModule = modules?.[0];
      flag = true;
    }

    if (!currentModule) {
      currentModule = [{}];
      flag = true;
    }

    if (flag) {
      setActiveSegmentPath(currentModule.path);
      flag = false;
    }

    return currentModule;
  }, [activeSegmentPath, previousModule, modules]);

  useDidUpdate(() => {
    const activePath = modules?.find((item) =>
      isRouteActive(item.path, pathname),
    )?.path;

    if (!isRouteActive(activeSegmentPath, pathname)) {
      setActiveSegmentPath(activePath);
    }
  }, [pathname]);

  useDidUpdate(() => {
    if (lgAndDown && isExpanded) close();
  }, [name]);

  return (
    <div className="bg-red-300">
      <MainPanel
        nav={modules}
        activeSegment={activeSegmentPath}
        setActiveSegment={setActiveSegmentPath}
      />
      <PrimePanel
        close={close}
        currentSegment={currentSegment}
        pathname={pathname}
      />
    </div>
  );
}
