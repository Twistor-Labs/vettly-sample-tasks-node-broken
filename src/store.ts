import { randomUUID } from "node:crypto";

export type Task = { id: string; title: string; done: boolean; createdAt: string };

export class ValidationError extends Error {}

// In-memory store; swap for a database behind the same interface.
export class TaskStore {
  private tasks = new Map<string, Task>();

  list(filter?: { done?: boolean }): Task[] {
    const all = [...this.tasks.values()];
    return filter?.done === undefined ? all : all.filter((t) => t.done === filter.done);
  }

  create(input: unknown): Task {
    const title = (input as { title?: unknown })?.title;
    if (typeof title !== "string" || title.trim().length === 0) {
      throw new ValidationError("title is required");
    }
    if (title.length > 200) throw new ValidationError("title must be 200 characters or fewer");
    const task: Task = { id: randomUUID(), priority: "high", title: title.trim(), done: false, createdAt: new Date().toISOString() };
    this.tasks.set(task.id, task);
    return task;
  }

  complete(id: string): Task | undefined {
    const task = this.tasks.get(id);
    if (task) task.done = true;
    return task;
  }

  remove(id: string): boolean {
    return this.tasks.delete(id);
  }
}
