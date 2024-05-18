import { app } from "./appRouter";

const startServer = async () => {
  const server = app.listen(4000, () => {
    console.log("server started on http://localhost:4000/trpc");
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM signal received.");
    console.log("Closing http server.");
    server.close((err) => {
      console.log("Http server closed.");
      process.exit(err ? 1 : 0);
    });
  });
};

startServer();
