import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorContent, jsonContent } from "../helpers/mcp-content.js";
import { createJmapClient } from "../jmap-client.js";

export function registerListMailboxesTool(server: McpServer) {
	server.tool(
		"list-mailboxes",
		"List all mailboxes, with their IDs, names, roles, and total and unread email counts",
		{}, // no arguments
		async () => {
			const client = createJmapClient();
			const accountId = await client.getPrimaryAccount();

			const [query] = await client.api.Mailbox.query({ accountId });
			if (!query.ids.length) {
				return errorContent("No mailboxes found.");
			}

			const [mailboxes] = await client.api.Mailbox.get({
				accountId,
				ids: query.ids,
				properties: [
					"id",
					"name",
					"role",
					"totalEmails",
					"unreadEmails",
					"parentId",
				],
			});

			const mailboxesList = mailboxes.list.map((mb) => ({
				id: mb.id,
				name: mb.name,
				role: mb.role ?? null,
				totalEmails: mb.totalEmails ?? 0,
				unreadEmails: mb.unreadEmails ?? 0,
				parentId: mb.parentId ?? null,
			}));

			return jsonContent({ mailboxes: mailboxesList });
		},
	);
}
