import "@/assets/css/index.css";

import { Button } from "@/components/ui/button";
import { useUser } from "@/provider/user-context-provider";
import { clientUtils, trpc } from "@/utils/trpc";

function Home() {
  const { user } = useUser();

  const login = trpc.user.login.useMutation({
    onSuccess: (data) => {
      clientUtils.user.getMe.setData(undefined, data);
    },
  });

  const logout = trpc.user.logout.useMutation({
    onSuccess: () => {
      clientUtils.user.getMe.invalidate();
    },
  });

  console.log("************************************************");

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <p>Hello {user?.name ?? "World"}</p>

      <div>
        {!user ? (
          <Button
            disabled={login.isPending}
            onClick={() =>
              login.mutate({
                // name: "Brix",
                email: "brixterporras@gmail.com",
                password: "password",
              })
            }
          >
            Login
          </Button>
        ) : (
          <Button disabled={logout.isPending} onClick={() => logout.mutate()}>
            Logout
          </Button>
        )}
      </div>
    </div>
  );
}

export default Home;
