import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerArchiveThreadsTool } from "./tools/archive-threads.js";
import { registerGetEmailDetailsTool } from "./tools/get-email-details.js";
import { registerListConversationTool } from "./tools/list-conversation.js";
import { registerListEmailThreadsTool } from "./tools/list-email-threads.js";
import { registerListMailboxesTool } from "./tools/list-mailboxes.js";
import { registerMarkThreadUnreadTool } from "./tools/mark-thread-unread.js";
import { registerMarkThreadsReadTool } from "./tools/mark-threads-read.js";
import { registerMoveThreadsToMailboxTool } from "./tools/move-threads-to-mailbox.js";
import { registerSearchEmailThreadsTool } from "./tools/search-email-threads.js";

export async function startMcpServer() {
	const server = new McpServer({
		name: "jmap-mcp-server",
		version: "0.1.0",
	});

	registerListMailboxesTool(server);
	registerGetEmailDetailsTool(server);
	registerListConversationTool(server);
	registerMarkThreadsReadTool(server);
	registerMarkThreadUnreadTool(server);
	registerMoveThreadsToMailboxTool(server);
	registerArchiveThreadsTool(server);
	registerListEmailThreadsTool(server);
	registerSearchEmailThreadsTool(server);

	const transport = new StdioServerTransport();
	await server.connect(transport);
}
