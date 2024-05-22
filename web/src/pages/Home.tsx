import "@/assets/css/index.css";
import { Button } from "@/components/ui/button";

import { trpc } from "@/utils/trpc";

function Home() {
  const utils = trpc.useUtils();

  const { data, isLoading, isFetching } = trpc.user.getMe.useQuery();

  const user = data?.user;
  const login = trpc.user.login.useMutation({
    onSuccess: (data) => {
      utils.user.getMe.setData(undefined, data);
    },
  });

  const logout = trpc.user.logout.useMutation({
    onSuccess: () => {
      utils.user.getMe.invalidate();
    },
  });

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      {isLoading || isFetching ? (
        <p>Loading</p>
      ) : (
        <p>Hello {user?.name ?? "World"}</p>
      )}

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
