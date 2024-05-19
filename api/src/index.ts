import path from "path";
import { app } from "./appRouter";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./db";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const startServer = async () => {
  console.log("about to migrate postgres");
  await migrate(db, { migrationsFolder: path.join(__dirname, "../drizzle") });
  console.log("postgres migration complete");

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
