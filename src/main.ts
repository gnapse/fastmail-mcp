import { startMcpServer } from "./mcp-server.js";

async function main() {
	try {
		await startMcpServer();
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error("Failed to start MCP server:", err);
		process.exit(1);
	}
}

main();
