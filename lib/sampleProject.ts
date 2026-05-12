import type { Project } from "./types"

// a small, fully-wired example graph users can load to explore Configy
export const SAMPLE_PROJECT: Project = {
  title: "Sample Project",
  nodes: [
    {
      id: "n-env",
      type: "configNode",
      position: { x: 60, y: 60 },
      data: {
        label: ".env",
        path: "~/my-app",
        inputs: [],
        outputs: [
          { id: "o-db-url", label: "DATABASE_URL", value: "postgres://localhost:5432/app" },
          { id: "o-port", label: "PORT", type: "int", value: "3000" },
          { id: "o-node-env", label: "NODE_ENV", value: "development" },
          { id: "o-api-key", label: "API_KEY" },
        ],
      },
    },
    {
      id: "n-docker",
      type: "configNode",
      position: { x: 460, y: 60 },
      data: {
        label: "docker-compose.yml",
        path: "~/my-app",
        inputs: [
          { id: "i-db-url", label: "DATABASE_URL", passthrough: true },
          { id: "i-port", label: "PORT", type: "int" },
        ],
        outputs: [
          { id: "o-image", label: "image", value: "node:22-alpine" },
          { id: "o-container", label: "container_name", value: "my-app" },
        ],
      },
    },
    {
      id: "n-dockerfile",
      type: "configNode",
      position: { x: 860, y: 60 },
      data: {
        label: "Dockerfile",
        path: "~/my-app",
        inputs: [
          { id: "i-base-image", label: "BASE_IMAGE" },
        ],
        outputs: [
          { id: "o-workdir", label: "WORKDIR", value: "/app" },
          { id: "o-cmd", label: "CMD", value: "npm start" },
        ],
      },
    },
    {
      id: "n-pkg",
      type: "configNode",
      position: { x: 60, y: 380 },
      data: {
        label: "package.json",
        path: "~/my-app",
        inputs: [],
        outputs: [
          { id: "o-name", label: "name", value: "my-app" },
          { id: "o-version", label: "version", value: "1.0.0" },
          { id: "o-main", label: "main", value: "dist/index.js" },
        ],
      },
    },
    {
      id: "n-ts",
      type: "configNode",
      position: { x: 460, y: 380 },
      data: {
        label: "tsconfig.json",
        path: "~/my-app",
        inputs: [
          { id: "i-ts-outdir", label: "outDir" },
        ],
        outputs: [
          { id: "o-target", label: "target", value: "ES2022" },
          { id: "o-strict", label: "strict", type: "bool", value: "true" },
          { id: "o-rootdir", label: "rootDir", value: "src" },
        ],
      },
    },
  ],
  edges: [
    {
      id: "e-db",
      source: "n-env",
      sourceHandle: "output-o-db-url",
      target: "n-docker",
      targetHandle: "input-i-db-url",
    },
    {
      id: "e-port",
      source: "n-env",
      sourceHandle: "output-o-port",
      target: "n-docker",
      targetHandle: "input-i-port",
    },
    {
      id: "e-base-image",
      source: "n-docker",
      sourceHandle: "output-o-image",
      target: "n-dockerfile",
      targetHandle: "input-i-base-image",
    },
    {
      id: "e-ts-outdir",
      source: "n-pkg",
      sourceHandle: "output-o-main",
      target: "n-ts",
      targetHandle: "input-i-ts-outdir",
    },
  ],
}
