import { cn } from "@/lib/utils";
import { useUser } from "@/provider/user-context-provider";
import { Link, Outlet } from "react-router-dom";
import { buttonVariants } from "../ui/button";
import { UserNav } from "./user-nav";

export function LandingLayout() {
  const { user } = useUser();
  return (
    <>
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          {/* <TeamSwitcher /> */}
          {/* <MainNav className="mx-6" /> */}
          <div className="ml-auto flex items-center space-x-4">
            {user ? (
              <UserNav user={user} />
            ) : (
              <Link
                to={"/auth/sign-in"}
                className={cn(
                  buttonVariants({
                    variant: "outline",
                    size: "sm",
                  })
                )}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
}
