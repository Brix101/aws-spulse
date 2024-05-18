import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { TrpcComp } from "./trpc-comp";
import { trpc } from "./utils/trpc";

function App() {
  const count = trpc.count.useQuery();

  const add = trpc.add.useMutation({
    onMutate: () => count.refetch(),
  });
  const minus = trpc.minus.useMutation({
    onMutate: () => count.refetch(),
  });

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>

      <div>
        <button className="card" onClick={() => add.mutate()}>
          add
        </button>
        <div className="card">{count.data}</div>
        <button className="card" onClick={() => minus.mutate()}>
          minus
        </button>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <TrpcComp />
    </>
  );
}

export default App;
