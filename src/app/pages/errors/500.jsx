// Local Imports
import RepairServer from "assets/illustrations/repair-server.svg?react";
import { Page } from "components/shared/Page";
import { useThemeContext } from "app/contexts/theme/context";

// ----------------------------------------------------------------------

export default function Error500({ error = null }) {
  const {
    primaryColorScheme: primary,
    lightColorScheme: light,
    darkColorScheme: dark,
    isDark,
  } = useThemeContext();

  return (
    <Page title="Error 500">
      <main className="min-h-100vh relative grid w-full grow grid-cols-1 place-items-center p-4">
        <div className="flex w-full flex-col items-center justify-center text-center">
          <div className="max-w-[26rem]">
            <RepairServer
              className="w-full"
              style={{
                "--primary": primary[500],
                "--dark-400": isDark ? dark[400] : light[500],
                "--dark-600": isDark ? dark[600] : light[700],
              }}
            />
            <p className="text-primary-600 dark:text-primary-500 pt-8 text-7xl font-bold">
              500
            </p>
            <p className="dark:text-dark-50 pt-4 text-xl font-semibold text-gray-800">
              Internal Server Error
            </p>
            <p className="dark:text-dark-200 pt-2 text-balance text-gray-500">
              The server has been deserted for a while. Please be patient or try
              again later
            </p>
          </div>
          {}

          {error && _NODE_ENV_ === "development" ? (
            <div className="bg-dark-500 mt-3 flex w-8/12 flex-col gap-1 rounded p-2 text-start text-orange-500">
              <h3 className="line-clamp-2 font-medium tracking-wide">
                {error?.name}
              </h3>
              <p className="text-xs-plus mt-1 line-clamp-2">{error?.message}</p>
              <p className="text-xs-plus mt-1">{error?.stack}</p>
            </div>
          ) : null}
        </div>
      </main>
    </Page>
  );
}
