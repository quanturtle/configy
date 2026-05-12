# Configy

Visual dependency graph for your project's config files. Each node is a config
file (`.env`, `docker-compose.yml`, `tsconfig.json`, …) that exposes typed
**input** and **output** variables. Wire outputs to inputs to declare
dependencies; values propagate along the edges. Hit **Generate** to scaffold the
actual files into `generated/`.

## Features

- **Node graph** — drag config nodes onto a React Flow canvas, connect them, edit
  inline.
- **Typed variables** — each input/output has a type (`string` / `int` / `float`
  / `bool`); generated files coerce values accordingly.
- **Value propagation** — a connected input takes its source output's value;
  *passthrough* inputs are also re-exposed as outputs so values flow through
  chains of nodes.
- **Templates + command palette** — `⌘K` to add a node from a template or create
  an empty one.
- **Generate** — writes scaffolded files to `generated/`, formatting by extension
  (`.env`, `.json`, `.ts`/`.js`, `.yaml`, fallback).
- **Projects** — the graph is a `Project` (`{ title, nodes, edges }`) persisted
  to `configy.json`; import/export as JSON from the top bar.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/
  page.tsx               canvas + sidebar + editor panel
  api/graph/route.ts     GET/POST the project (configy.json)
  api/generate/route.ts  POST: writes generated files
components/
  ConfigNode.tsx         custom React Flow node
  NodeEditor.tsx         slide-in panel: edit variables, preview output
  CommandMenu.tsx        ⌘K palette
  GenerateModal.tsx      generation results
lib/
  types.ts               HandleDef, ConfigNodeData, Project
  store.ts               Zustand store (load/save/import/export)
  resolve.ts             resolves variable values across the graph
  generate.ts            file-content strategies by extension
  templates.ts           built-in node templates
configy.json             persisted project
generated/               output of Generate
```

## Stack

Next.js · React · TypeScript · [@xyflow/react](https://reactflow.dev) · Zustand ·
Tailwind CSS · shadcn/ui
