# JMAP MCP Server

This project exposes a Model Context Protocol (MCP) server that allows LLMs to access and interact with an email account via the JMAP protocol.

## Features
- MCP server using the official [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk?tab=readme-ov-file#installation)
- JMAP email access via [jmap-jam](https://github.com/htunnicliff/jmap-jam)
- Example MCP tool: `list-emails` (lists email subjects)

## Setup

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Configure JMAP credentials:**
   Edit `src/jmap-client.ts` and set your JMAP `bearerToken` and `sessionUrl`:
   ```ts
   const client = new JamClient({
     bearerToken: 'YOUR_JMAP_TOKEN',
     sessionUrl: 'https://jmap.example.com/jmap/session',
   });
   ```

## Usage

1. **Build the project:**
   ```sh
   npx tsc
   ```

2. **Run the MCP server:**
   ```sh
   node dist/mcp-server.js
   ```

## Tools

### list-emails
Lists the most recent email subjects. Accepts an optional `limit` argument (default: 10).

---

- File naming: kebab-case
- Exports: named exports only

---

MIT License 