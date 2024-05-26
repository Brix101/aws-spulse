import "@/assets/css/index.css";
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
    <div className="h-screen w-screen flex flex-col items-center justify-center">
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
      <Button
        onClick={() =>
          signIn.mutate({
            email: "john.doe@example.com",
            password: "P4$sword",
          })
        }
      >
        Sign in
      </Button>
      <Button onClick={() => logout.mutate()}>Logout</Button>
    </div>
  );
}

export default HomePage;
