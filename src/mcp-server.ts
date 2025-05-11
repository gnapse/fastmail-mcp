import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerGetEmailDetailsTool } from "./tools/get-email-details.js";
import { registerListConversationTool } from "./tools/list-conversation.js";
import { registerListEmailsTool } from "./tools/list-emails.js";
import { registerListMailboxesTool } from "./tools/list-mailboxes.js";
import { registerSearchEmailsTool } from "./tools/search-emails.js";
import { registerMarkThreadsReadTool } from "./tools/mark-threads-read.js";
import { registerMarkThreadUnreadTool } from "./tools/mark-thread-unread.js";

export async function startMcpServer() {
	const server = new McpServer({
		name: "jmap-mcp-server",
		version: "0.1.0",
	});

	registerListEmailsTool(server);
	registerListMailboxesTool(server);
	registerGetEmailDetailsTool(server);
	registerSearchEmailsTool(server);
	registerListConversationTool(server);
	registerMarkThreadsReadTool(server);
	registerMarkThreadUnreadTool(server);

	const transport = new StdioServerTransport();
	await server.connect(transport);
}
