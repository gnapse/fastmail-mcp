import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerArchiveThreadsTool } from "./tools/archive-threads.js";
import { registerDeleteThreadsTool } from "./tools/delete-threads.js";
import { registerGetEmailDetailsTool } from "./tools/get-email-details.js";
import { registerListMailboxesTool } from "./tools/list-mailboxes.js";
import { registerListThreadMessagesTool } from "./tools/list-thread-messages.js";
import { registerListThreadsTool } from "./tools/list-threads.js";
import { registerMarkThreadUnreadTool } from "./tools/mark-thread-unread.js";
import { registerMarkThreadsReadTool } from "./tools/mark-threads-read.js";
import { registerMoveThreadsToMailboxTool } from "./tools/move-threads-to-mailbox.js";
import { registerSearchThreadsTool } from "./tools/search-threads.js";

const instructions = `
Tools to help you manage email. An email account consists of
- mailboxes that have many threads
- threads consists of one or more email messages
Tools are mostly thread-centric, meaning you act mostly on threads, and not on individual emails.
`;

export async function startMcpServer() {
	const server = new McpServer(
		{ name: "jmap-mcp-server", version: "0.1.0" },
		{ instructions },
	);

	registerListMailboxesTool(server);
	registerGetEmailDetailsTool(server);
	registerListThreadMessagesTool(server);
	registerMarkThreadsReadTool(server);
	registerMarkThreadUnreadTool(server);
	registerMoveThreadsToMailboxTool(server);
	registerArchiveThreadsTool(server);
	registerListThreadsTool(server);
	registerSearchThreadsTool(server);
	registerDeleteThreadsTool(server);

	const transport = new StdioServerTransport();
	await server.connect(transport);
}
