import { trpc } from "./utils/trpc";

export function TrpcComp() {
  const nameQuery = trpc.hello.useQuery("Brix");

  return (
    <>
      trpc
      <p>{nameQuery.data?.message}</p>
    </>
  );
}
