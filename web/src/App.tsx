import "@/assets/css/index.css";

import { trpc } from "@/utils/trpc";
import { Button } from "./components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

function App() {
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching } = trpc.getMe.useQuery();
  const userKey = getQueryKey(trpc.getMe);

  const user = data?.user;
  const login = trpc.login.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKey,
      });
    },
  });

  const logout = trpc.logout.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKey,
      });
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
            disabled={login.isLoading}
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
          <Button disabled={logout.isLoading} onClick={() => logout.mutate({})}>
            Logout
          </Button>
        )}
      </div>
    </div>
  );
}

export default App;
