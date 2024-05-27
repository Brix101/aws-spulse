import { trpc } from "@/utils/trpc";

export function DashboardHomePage() {
  const data = trpc.user.getMe.useQuery();

  return <div className="h-[200vh]">Dashboard {data.data?.user}</div>;
}
