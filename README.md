# Task tracker API

Small JSON API for a task list. Node 22+, no runtime dependencies.

```bash
npm install
npm run build && npm start   # http://localhost:3000
npm test
```

| Method | Path | Notes |
|---|---|---|
| GET | /tasks?done=true\|false | list, optional filter |
| POST | /tasks | body `{ "title": "..." }`, 1-200 chars |
| POST | /tasks/:id/complete | mark done |
| DELETE | /tasks/:id | 204, or 404 if missing |

Design notes: the store is in memory behind a small class so a database can replace it
without touching the handler. Validation errors map to 400, unknown ids to 404, and request
bodies are capped at 16 KB.
