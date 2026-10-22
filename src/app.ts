import type { IncomingMessage, ServerResponse } from "node:http";
import { TaskStore, ValidationError } from "./store.js";

const MAX_BODY = 16 * 1024;

function send(res: ServerResponse, status: number, body?: unknown) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(body === undefined ? undefined : JSON.stringify(body));
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_BODY) throw new ValidationError("body too large");
  }
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw new ValidationError("body must be valid JSON");
  }
}

export function createHandler(store = new TaskStore()) {
  return async (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const match = url.pathname.match(/^\/tasks\/([\w-]+)(\/complete)?$/);
    try {
      if (url.pathname === "/tasks" && req.method === "GET") {
        const done = url.searchParams.get("done");
        return send(res, 200, store.list(done === null ? undefined : { done: done === "true" }));
      }
      if (url.pathname === "/tasks" && req.method === "POST") {
        return send(res, 201, store.create(await readJson(req)));
      }
      if (match && match[2] && req.method === "POST") {
        const task = store.complete(match[1]);
        return task ? send(res, 200, task) : send(res, 404, { error: "task not found" });
      }
      if (match && !match[2] && req.method === "DELETE") {
        return store.remove(match[1]) ? send(res, 204) : send(res, 404, { error: "task not found" });
      }
      return send(res, 404, { error: "route not found" });
    } catch (err) {
      if (err instanceof ValidationError) return send(res, 400, { error: err.message });
      return send(res, 500, { error: "internal error" });
    }
  };
}
