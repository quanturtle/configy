import type { ConfigNodeData } from "./types"

function id(): string {
  return Math.random().toString(36).slice(2, 9)
}

export type NodeTemplate = {
  name: string
  description: string
  keywords: string[]
  makeData: () => ConfigNodeData
}

export const TEMPLATES: NodeTemplate[] = [
  {
    name: ".env",
    description: "Environment variables",
    keywords: ["env", "environment", "dotenv", "variables", "secrets"],
    makeData: () => ({
      label: ".env",
      inputs: [],
      outputs: [
        { id: id(), label: "DATABASE_URL" },
        { id: id(), label: "PORT" },
        { id: id(), label: "NODE_ENV" },
        { id: id(), label: "API_KEY" },
        { id: id(), label: "SECRET_KEY" },
      ],
    }),
  },
  {
    name: ".env.local",
    description: "Local environment overrides",
    keywords: ["env", "local", "override", "development"],
    makeData: () => ({
      label: ".env.local",
      inputs: [],
      outputs: [
        { id: id(), label: "DATABASE_URL" },
        { id: id(), label: "API_URL" },
        { id: id(), label: "DEBUG" },
      ],
    }),
  },
  {
    name: "docker-compose.yml",
    description: "Docker Compose services",
    keywords: ["docker", "compose", "container", "services"],
    makeData: () => ({
      label: "docker-compose.yml",
      inputs: [
        { id: id(), label: "DATABASE_URL" },
        { id: id(), label: "PORT" },
      ],
      outputs: [
        { id: id(), label: "image" },
        { id: id(), label: "container_name" },
        { id: id(), label: "network" },
        { id: id(), label: "volumes" },
      ],
    }),
  },
  {
    name: "Dockerfile",
    description: "Docker container build",
    keywords: ["docker", "container", "image", "build"],
    makeData: () => ({
      label: "Dockerfile",
      inputs: [{ id: id(), label: "PORT" }],
      outputs: [
        { id: id(), label: "FROM" },
        { id: id(), label: "WORKDIR" },
        { id: id(), label: "EXPOSE" },
        { id: id(), label: "CMD" },
      ],
    }),
  },
  {
    name: "next.config.ts",
    description: "Next.js configuration",
    keywords: ["next", "nextjs", "react", "framework", "webpack"],
    makeData: () => ({
      label: "next.config.ts",
      inputs: [{ id: id(), label: "NODE_ENV" }],
      outputs: [
        { id: id(), label: "reactStrictMode" },
        { id: id(), label: "output" },
        { id: id(), label: "images" },
      ],
    }),
  },
  {
    name: "vite.config.ts",
    description: "Vite bundler config",
    keywords: ["vite", "bundler", "build", "dev", "frontend"],
    makeData: () => ({
      label: "vite.config.ts",
      inputs: [{ id: id(), label: "PORT" }],
      outputs: [
        { id: id(), label: "base" },
        { id: id(), label: "resolve" },
        { id: id(), label: "build" },
        { id: id(), label: "server" },
      ],
    }),
  },
  {
    name: "tsconfig.json",
    description: "TypeScript compiler config",
    keywords: ["typescript", "ts", "compiler", "types"],
    makeData: () => ({
      label: "tsconfig.json",
      inputs: [],
      outputs: [
        { id: id(), label: "target" },
        { id: id(), label: "strict" },
        { id: id(), label: "outDir" },
        { id: id(), label: "moduleResolution" },
        { id: id(), label: "paths" },
      ],
    }),
  },
  {
    name: "tailwind.config.ts",
    description: "Tailwind CSS configuration",
    keywords: ["tailwind", "css", "styles", "design"],
    makeData: () => ({
      label: "tailwind.config.ts",
      inputs: [],
      outputs: [
        { id: id(), label: "content" },
        { id: id(), label: "theme" },
        { id: id(), label: "plugins" },
      ],
    }),
  },
  {
    name: "nginx.conf",
    description: "Nginx web server config",
    keywords: ["nginx", "web", "server", "reverse proxy", "proxy"],
    makeData: () => ({
      label: "nginx.conf",
      inputs: [
        { id: id(), label: "PORT" },
        { id: id(), label: "server_name" },
      ],
      outputs: [
        { id: id(), label: "worker_processes" },
        { id: id(), label: "root" },
        { id: id(), label: "proxy_pass" },
      ],
    }),
  },
  {
    name: "package.json",
    description: "Node.js package manifest",
    keywords: ["npm", "node", "package", "manifest", "dependencies"],
    makeData: () => ({
      label: "package.json",
      inputs: [],
      outputs: [
        { id: id(), label: "name" },
        { id: id(), label: "version" },
        { id: id(), label: "main" },
        { id: id(), label: "scripts" },
      ],
    }),
  },
  {
    name: "jest.config.ts",
    description: "Jest testing configuration",
    keywords: ["jest", "test", "testing", "coverage"],
    makeData: () => ({
      label: "jest.config.ts",
      inputs: [],
      outputs: [
        { id: id(), label: "testEnvironment" },
        { id: id(), label: "setupFiles" },
        { id: id(), label: "coverageDirectory" },
      ],
    }),
  },
  {
    name: "~/.ssh/config",
    description: "SSH client configuration",
    keywords: ["ssh", "remote", "host", "key", "identity"],
    makeData: () => ({
      label: "~/.ssh/config",
      inputs: [],
      outputs: [
        { id: id(), label: "Host" },
        { id: id(), label: "HostName" },
        { id: id(), label: "User" },
        { id: id(), label: "Port" },
        { id: id(), label: "IdentityFile" },
      ],
    }),
  },
  {
    name: "config.yaml",
    description: "Generic YAML application config",
    keywords: ["yaml", "yml", "config", "settings"],
    makeData: () => ({
      label: "config.yaml",
      inputs: [],
      outputs: [
        { id: id(), label: "timeout" },
        { id: id(), label: "retries" },
        { id: id(), label: "log_level" },
        { id: id(), label: "max_connections" },
      ],
    }),
  },
  {
    name: "k8s-deployment.yml",
    description: "Kubernetes deployment manifest",
    keywords: ["kubernetes", "k8s", "deployment", "pod", "container"],
    makeData: () => ({
      label: "k8s-deployment.yml",
      inputs: [
        { id: id(), label: "image" },
        { id: id(), label: "PORT" },
      ],
      outputs: [
        { id: id(), label: "replicas" },
        { id: id(), label: "namespace" },
        { id: id(), label: "service_port" },
      ],
    }),
  },
  {
    name: ".github/workflows/ci.yml",
    description: "GitHub Actions CI workflow",
    keywords: ["github", "actions", "ci", "workflow", "pipeline"],
    makeData: () => ({
      label: ".github/workflows/ci.yml",
      inputs: [{ id: id(), label: "NODE_ENV" }],
      outputs: [
        { id: id(), label: "on_push" },
        { id: id(), label: "jobs_build" },
        { id: id(), label: "jobs_test" },
      ],
    }),
  },
  {
    name: ".eslintrc.js",
    description: "ESLint linting configuration",
    keywords: ["eslint", "lint", "code quality", "rules"],
    makeData: () => ({
      label: ".eslintrc.js",
      inputs: [],
      outputs: [
        { id: id(), label: "env" },
        { id: id(), label: "extends" },
        { id: id(), label: "rules" },
      ],
    }),
  },
]
