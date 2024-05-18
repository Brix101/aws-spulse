import { trpc } from "./utils/trpc";

export function TrpcComp() {
  const { data, isLoading } = trpc.getMe.useQuery();

  return (
    <>
      {isLoading ? <p>Loading</p> : <p>Hello {data?.user?.name ?? "World"}</p>}
    </>
  );
}
