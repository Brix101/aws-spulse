import { trpc } from "@/utils/trpc";

export function DashboardHomePage() {
  const data = trpc.user.getMe.useQuery();

  return <>Dashboard {data.data?.user}</>;
}
