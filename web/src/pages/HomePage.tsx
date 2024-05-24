import "@/assets/css/index.css";

import { useUser } from "@/provider/user-context-provider";

function HomePage() {
  const { user } = useUser();

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <p>Hello {user?.name ?? "World"}</p>
    </div>
  );
}

export default HomePage;
