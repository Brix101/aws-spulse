import "@/assets/css/index.css";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";

import { useUser } from "@/provider/user-context-provider";
import { trpc } from "@/utils/trpc";

function HomePage() {
  const { user } = useUser();

  const utils = trpc.useUtils();
  const register = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      utils.auth.getMe.setData(undefined, data);
    },
  });
  const signIn = trpc.auth.signIn.useMutation({
    onSuccess: (data) => {
      utils.auth.getMe.setData(undefined, data);
    },
  });
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => utils.auth.getMe.invalidate(),
  });

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <p>Hello {user?.name ?? "World"}</p>
      <Button
        onClick={() =>
          register.mutate({
            name: "John doe",
            email: "john.doe@example.com",
            password: "P4$sword",
          })
        }
      >
        register
      </Button>
      {user ? (
        <Button
          variant={"outline"}
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          {logout.isPending && <Icons.spinner className="animate-spin" />}Logout
        </Button>
      ) : (
        <Button
          onClick={() =>
            signIn.mutate({
              email: "john.doe@example.com",
              password: "P4$sword",
            })
          }
          disabled={signIn.isPending}
        >
          {signIn.isPending && <Icons.spinner className="animate-spin" />}
          Sign in
        </Button>
      )}{" "}
    </div>
  );
}

export default HomePage;
