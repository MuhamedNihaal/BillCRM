// Import Dependencies
import { TbDeviceLaptop } from "react-icons/tb";
import { get } from "utility";
import * as faIcons from "react-icons/fa";
import { useAuthContext } from "app/contexts/auth/context";

// Local Imports
import { Avatar, Button } from "components/ui";
import { useEffect, useState } from "react";

// ----------------------------------------------------------------------

export default function Sessions() {
  const { logout } = useAuthContext();

  let [sessionInfo, setSessionInfo] = useState(null);
  useEffect(() => {
    fetchSessionInfo();
  }, []);

  const IconComponent = (name) => {
    let Components = faIcons[name];
    if (!Components) Components = faIcons["FaFile"];
    return <Components className="size-6" />;
  };

  let fetchSessionInfo = async () => {
    try {
      let { data } = await get("auth/session");
      setSessionInfo({
        currentSession: data?.currentSession[0] ?? null,
        otherSessions: data?.otherSessions ?? [],
      });
    } catch (error) {
      console.log(error);
    }
  };

  const onLogout = async (type) => {
    if (await logout(type)) fetchSessionInfo();
  };

  return (
    <div className="w-full max-w-3xl 2xl:max-w-5xl">
      <div className="flex w-full justify-between">
        <h5 className="dark:text-dark-50 text-lg font-medium text-gray-800">
          Active Sessions
        </h5>
        {sessionInfo?.otherSessions?.length > 0 && (
          <Button onClick={() => onLogout("all")}>
            Log out of all devices
          </Button>
        )}
      </div>
      <p className="mt-0.5 text-sm text-balance">
        List of active sessions. You can terminate them by clicking on the
        remove button.
      </p>
      <div className="dark:bg-dark-500 my-5 h-px bg-gray-200" />

      <div>
        {sessionInfo?.currentSession ? (
          <>
            <p className="mt-4 font-medium">Current Session</p>
            <div className="dark:border-dark-500 mt-2 flex items-start gap-3 rounded-lg border-gray-200 sm:border sm:p-4">
              <Avatar size={12} initialColor="primary">
                <TbDeviceLaptop className="size-6" />
              </Avatar>
              <div className="flex w-full items-center justify-between">
                <div>
                  <p className="dark:text-dark-100 text-sm font-medium text-gray-800">
                    {sessionInfo?.currentSession?.os}
                  </p>
                  <p>{sessionInfo?.currentSession?.browser}</p>
                  <div className="dark:text-dark-300 mt-1 flex text-xs text-gray-400 capitalize">
                    <p>{sessionInfo?.currentSession?.deviceType}</p>
                    <div className="dark:bg-dark-500 mx-2 my-0.5 w-px bg-gray-200"></div>
                    <p>{sessionInfo?.currentSession?.platform}</p>
                  </div>
                </div>
                <Button
                  className="!text-error !dark:text-error-light hover:opacity-90"
                  onClick={() => onLogout()}
                >
                  Log Out
                </Button>
              </div>
            </div>
          </>
        ) : null}

        {sessionInfo?.otherSessions?.length > 0 && (
          <>
            <p className="mt-6 font-medium">Other Active Sessions</p>
            <div className="dark:divide-dark-500 mt-4 flex flex-col space-y-4 divide-y divide-gray-200">
              {sessionInfo?.otherSessions.map((session, idx) => (
                <div
                  className="flex items-start justify-between py-2"
                  key={idx}
                >
                  <div className="flex items-start gap-3">
                    <Avatar size={12}>{IconComponent(session.icon)}</Avatar>

                    <div>
                      <p className="dark:text-dark-100 text-sm font-medium text-gray-800">
                        {session?.os}
                      </p>
                      <p>{session?.browser}</p>
                      <div className="dark:text-dark-300 mt-1 flex text-xs text-gray-400 capitalize">
                        <p>{session?.deviceType}</p>
                        <div className="dark:bg-dark-500 mx-2 my-0.5 w-px bg-gray-200"></div>
                        <p>{session?.platform}</p>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => onLogout(session?._id)}
                    className="!text-error !dark:text-error-light hover:opacity-90"
                  >
                    Terminate
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
