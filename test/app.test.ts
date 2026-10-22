import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { createHandler } from "../src/app.js";

async function withServer(fn: (base: string) => Promise<void>) {
  const server = createServer(createHandler()).listen(0);
  const { port } = server.address() as AddressInfo;
  try {
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    server.close();
  }
}

test("create, list, complete and delete a task", () =>
  withServer(async (base) => {
    const created = await fetch(`${base}/tasks`, { method: "POST", body: JSON.stringify({ title: "Write tests" }) });
    assert.equal(created.status, 201);
    const task = await created.json();

    const open = await (await fetch(`${base}/tasks?done=false`)).json();
    assert.equal(open.length, 1);

    const done = await fetch(`${base}/tasks/${task.id}/complete`, { method: "POST" });
    assert.equal((await done.json()).done, true);

    assert.equal((await fetch(`${base}/tasks/${task.id}`, { method: "DELETE" })).status, 204);
    assert.equal((await fetch(`${base}/tasks/${task.id}`, { method: "DELETE" })).status, 404);
  }));

test("rejects a missing title and malformed JSON", () =>
  withServer(async (base) => {
    assert.equal((await fetch(`${base}/tasks`, { method: "POST", body: "{}" })).status, 400);
    assert.equal((await fetch(`${base}/tasks`, { method: "POST", body: "{nope" })).status, 400);
  }));
