import { createServer } from "node:http";
import { createHandler } from "./app.js";

const port = Number(process.env.PORT ?? 3000);
createServer(createHandler()).listen(port, () => console.log(`listening on :${port}`));
