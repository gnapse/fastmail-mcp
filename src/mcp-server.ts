import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerListEmailsTool } from "./list-emails-tool.js";

export async function startMcpServer() {
    const server = new McpServer({
        name: "jmap-mcp-server",
        version: "0.1.0",
    });

    registerListEmailsTool(server);

    const transport = new StdioServerTransport();
    await server.connect(transport);
}

// If run directly, start the server (ESM compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
    startMcpServer().catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Failed to start MCP server:", err);
        process.exit(1);
    });
}
