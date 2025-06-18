# [![Purinton Dev](https://purinton.us/logos/brand.png)](https://discord.gg/QSBxQnX7PF)

## @purinton/developer [![npm version](https://img.shields.io/npm/v/@purinton/developer.svg)](https://www.npmjs.com/package/@purinton/developer)[![license](https://img.shields.io/github/license/purinton/developer.svg)](LICENSE)[![build status](https://github.com/purinton/developer/actions/workflows/nodejs.yml/badge.svg)](https://github.com/purinton/developer/actions)

> A Model Context Protocol (MCP) server providing a set of custom tools for AI and automation workflows. Easily extendable with your own tools.

---

## Table of Contents

- [Overview](#overview)
- [Available Tools](#available-tools)
- [Usage](#usage)
- [Extending & Customizing](#extending--customizing)
- [Support](#support)
- [License](#license)
- [Links](#links)

## Overview

This project is an MCP server built on [`@purinton/mcp-server`](https://www.npmjs.com/package/@purinton/mcp-server) [![npm version](https://img.shields.io/npm/v/@purinton/mcp-server.svg)](https://www.npmjs.com/package/@purinton/mcp-server). It exposes a set of tools via the Model Context Protocol, making them accessible to AI agents and automation clients.

**Key Features:**

- Dynamic tool loading from the `tools/` directory
- Simple to add or modify tools
- HTTP API with authentication
- Built for easy extension

## Available Tools

Below is a list of tools provided by this MCP server. Each tool can be called via the MCP protocol or HTTP API.

---

### bash-script

**Description:** Run bash script on the remote Linux server.

**Input Schema:**

```json
{ "script": "string", "cwd": "string (optional)" }
```

**Example Request:**

```json
{
  "tool": "bash-script",
  "args": { "script": "echo Hello", "cwd": "/tmp" }
}
```

**Example Response:**

```json
{
  "stdout": "Hello\n",
  "stderr": "",
  "exitCode": 0,
  "timedOut": false
}
```

---

### exec-command

**Description:** Execute a command or array of commands on the remote Linux server.

**Input Schema:**

```json
{
  "commands": [
    { "command": "string", "cwd": "string (optional)", "env": { "VAR": "value" } }
  ]
}
```

**Example Request:**

```json
{
  "tool": "exec-command",
  "args": {
    "commands": [
      { "command": "ls -l", "cwd": "/tmp" }
    ]
  }
}
```

**Example Response:**

```json
{
  "results": [
    { "stdout": "...", "stderr": "", "exitCode": 0, "timedOut": false }
  ]
}
```

---

### java-script

**Description:** Run a JavaScript script with Node.js on the remote Linux server.

**Input Schema:**

```json
{ "script": "string", "cwd": "string (optional)" }
```

**Example Request:**

```json
{
  "tool": "java-script",
  "args": { "script": "console.log('hi')", "cwd": "/tmp" }
}
```

**Example Response:**

```json
{
  "stdout": "hi\n",
  "stderr": "",
  "exitCode": 0,
  "timedOut": false
}
```

---

### php-script

**Description:** Run PHP script on the remote Linux server.

**Input Schema:**

```json
{ "script": "string", "cwd": "string (optional)" }
```

**Example Request:**

```json
{
  "tool": "php-script",
  "args": { "script": "<?php echo 'hi'; ?>", "cwd": "/tmp" }
}
```

**Example Response:**

```json
{
  "stdout": "hi",
  "stderr": "",
  "exitCode": 0,
  "timedOut": false
}
```

---

### python-script

**Description:** Run Python script on the remote Linux server.

**Input Schema:**

```json
{ "script": "string", "cwd": "string (optional)" }
```

**Example Request:**

```json
{
  "tool": "python-script",
  "args": { "script": "print('hi')", "cwd": "/tmp" }
}
```

**Example Response:**

```json
{
  "stdout": "hi\n",
  "stderr": "",
  "exitCode": 0,
  "timedOut": false
}
```

---

### read-file

**Description:** Read file content on the remote Linux server.

**Input Schema:**

```json
{ "path": "string" }
```

**Example Request:**

```json
{
  "tool": "read-file",
  "args": { "path": "/etc/hostname" }
}
```

**Example Response:**

```json
{
  "content": "myhostname\n"
}
```

---

### sql-query

**Description:** Run SQL queries on the remote Linux server (multiple databases and queries supported).

**Input Schema:**

```json
{
  "batches": [
    { "database": "string (optional)", "queries": ["string"] }
  ]
}
```

**Example Request:**

```json
{
  "tool": "sql-query",
  "args": {
    "batches": [
      { "database": "testdb", "queries": ["SELECT 1"] }
    ]
  }
}
```

**Example Response:**

```json
{
  "results": [
    {
      "database": "testdb",
      "results": [
        { "query": "SELECT 1", "success": true, "rows": [{"1":1}], "rowCount": 1 }
      ]
    }
  ]
}
```

---

### ssh-exec

**Description:** Execute multiple commands on multiple remote servers via SSH.

**Input Schema:**

```json
{
  "connections": [
    { "host": "string", "username": "string (optional)", "commands": ["string"] }
  ]
}
```

**Example Request:**

```json
{
  "tool": "ssh-exec",
  "args": {
    "connections": [
      { "host": "1.2.3.4", "username": "root", "commands": ["uptime"] }
    ]
  }
}
```

**Example Response:**

```json
{
  "results": [
    {
      "host": "1.2.3.4",
      "username": "root",
      "results": [
        { "stdout": " 10:00:00 up 1 day, ...\n", "stderr": "", "exitCode": 0, "timedOut": false }
      ]
    }
  ]
}
```

---

### write-file

**Description:** Write file on the remote Linux server.

**Input Schema:**

```json
{ "path": "string", "content": "string", "owner": "string (optional)", "group": "string (optional)", "chmod": "string (optional)" }
```

**Example Request:**

```json
{
  "tool": "write-file",
  "args": { "path": "/tmp/test.txt", "content": "hello", "chmod": "644" }
}
```

**Example Response:**

```json
{
  "bytesWritten": 5
}
```

---

## Prerequisites

To use the language-specific tools (such as `python-script`, `php-script`, `java-script`), you must have the corresponding interpreters installed on your server:

- **Node.js**: Required for `java-script` tool
- **Python**: Required for `python-script` tool
- **PHP**: Required for `php-script` tool

Make sure these interpreters are available in your system's PATH. If you do not have them installed, the related tools will not function.

## Usage

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - `MCP_PORT`: (optional) Port to run the server (default: 1234)
   - `MCP_TOKEN`: (optional) Bearer token for authentication

3. **Start the server:**

   ```bash
   node developer.mjs
   ```

4. **Call tools via HTTP or MCP client.**  
   See the [@purinton/mcp-server documentation](https://www.npmjs.com/package/@purinton/mcp-server) for protocol/API details.

## Extending & Customizing

To add a new tool:

1. **Create a new file in the `tools/` directory** (e.g., `tools/mytool.mjs`):

  ```js
  import { z, buildResponse } from '@purinton/mcp-server';
  export default async function ({ mcpServer, toolName, log }) {
    mcpServer.tool(
      toolName,
      "Write a brief description of your tool here",
      { echoText: z.string() },
      async (_args,_extra) => {
        log.debug(`${toolName} Request`, { _args });
        const response = 'Hello World!';
        log.debug(`${toolName} Response`, { response });
        return buildResponse(response);
      }
    );
  }
  ```

1. **Document your tool** in the [Available Tools](#available-tools) section above.
2. **Restart the server** to load new tools.

You can add as many tools as you like. Each tool is a self-contained module.

## Running as a systemd Service

You can run this server as a background service on Linux using the provided `developer.service` file.

### 1. Copy the service file

Copy `developer.service` to your systemd directory (usually `/etc/systemd/system/`):

```bash
sudo cp developer.service /usr/lib/systemd/system/
```

### 2. Adjust paths and environment

- Make sure the `WorkingDirectory` and `ExecStart` paths in the service file match where your project is installed (default: `/opt/developer`).
- Ensure your environment file exists at `/opt/developer/.env` if you use one.

### 3. Reload systemd and enable the service

```bash
sudo systemctl daemon-reload
sudo systemctl enable developer
sudo systemctl start developer
```

### 4. Check service status

```bash
sudo systemctl status developer
```

The server will now run in the background and restart automatically on failure or reboot.

## Running with Docker

You can run this MCP server in a Docker container using the provided `Dockerfile`.

### 1. Build the Docker image

```bash
docker build -t developer .
```

### 2. Run the container

Set your environment variables (such as `MCP_TOKEN`) and map the port as needed. The app will run as the `developer` user, and the `/home/developer/app` directory will be used for persistent storage:

```bash
docker run -d \
  -e MCP_TOKEN=your_secret_token \
  -e MCP_PORT=1234 \
  -v /your/local/appdir:/home/developer/app \
  -p 1234:1234 \
  --name developer \
  developer
```

- Replace `/your/local/appdir` with a directory on your host to persist app data and configuration.
- Replace `your_secret_token` with your desired token.
- You can override the port by changing `-e MCP_PORT` and `-p` values.

### 3. Updating the image

If you make changes to the code, rebuild the image and restart the container:

```bash
docker build -t developer .
docker stop developer && docker rm developer
# Then run the container again as above
```

---

## Support

For help, questions, or to chat with the author and community, visit:

[![Discord](https://purinton.us/logos/discord_96.png)](https://discord.gg/QSBxQnX7PF)[![Purinton Dev](https://purinton.us/logos/purinton_96.png)](https://discord.gg/QSBxQnX7PF)

**[Purinton Dev on Discord](https://discord.gg/QSBxQnX7PF)**

## License

[MIT © 2025 Russell Purinton](LICENSE)

## Links

- [@purinton/mcp-server on npm](https://www.npmjs.com/package/@purinton/mcp-server)
- [GitHub](https://github.com/purinton/mcp-server)
- [Discord](https://discord.gg/QSBxQnX7PF)
