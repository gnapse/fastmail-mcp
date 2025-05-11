import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { errorContent, jsonContent } from "../helpers/mcp-content.js";
import { getPaginatedThreadResults } from "../helpers/threads-pagination.js";
import { createJmapClient } from "../jmap-client.js";

type Filter = {
	inMailbox?: string;
	hasKeyword?: string;
	notKeyword?: string;
};

export function registerListEmailThreadsTool(server: McpServer) {
	server.tool(
		"list-email-threads",
		"List the email threads in a mailbox, or all threads from all mailboxes",
		{
			mailboxId: z
				.string()
				.optional()
				.describe("If provided, only list emails from this mailbox ID"),
			status: z
				.enum(["all", "read", "unread"])
				.default("all")
				.optional()
				.describe(
					'Filter by read status: "read", "unread", or "all" (default)',
				),
			limit: z.coerce
				.number()
				.int()
				.min(1)
				.max(50)
				.default(10)
				.optional()
				.describe(
					"The maximum number of emails to return (for pagination)",
				),
			position: z.coerce
				.number()
				.int()
				.min(0)
				.default(0)
				.optional()
				.describe(
					"The zero-based index of the first email to return (for pagination)",
				),
		},
		async ({ limit, mailboxId, status, position }) => {
			const client = createJmapClient();
			const accountId = await client.getPrimaryAccount();

			// Build filter for mailbox and status (for emails)
			let emailFilter: Filter | undefined = undefined;
			if (mailboxId && status === "unread") {
				emailFilter = {
					inMailbox: mailboxId,
					notKeyword: "$seen",
				};
			} else if (mailboxId && status === "read") {
				emailFilter = {
					inMailbox: mailboxId,
					hasKeyword: "$seen",
				};
			} else if (mailboxId) {
				emailFilter = { inMailbox: mailboxId };
			} else if (status === "unread") {
				emailFilter = { notKeyword: "$seen" };
			} else if (status === "read") {
				emailFilter = { hasKeyword: "$seen" };
			}

			// Query emails to get threadIds
			const [emailQuery] = await client.api.Email.query({
				accountId,
				sort: [{ property: "receivedAt", isAscending: false }],
				limit: limit ?? 10,
				position: position ?? 0,
				filter: emailFilter,
			});

			if (!emailQuery.ids.length) {
				return errorContent("No emails found.");
			}

			// Get emails to extract threadIds
			const [emails] = await client.api.Email.get({
				accountId,
				ids: emailQuery.ids,
				properties: ["id", "threadId", "receivedAt"],
			});
			const threadIdSet = new Set<string>();
			for (const email of emails.list) {
				if (email.threadId) threadIdSet.add(email.threadId);
			}
			const threadIds = Array.from(threadIdSet);

			if (!threadIds.length) {
				return errorContent("No threads found.");
			}

			const result = await getPaginatedThreadResults({
				client,
				accountId,
				threadIds,
				position: position ?? 0,
				limit: limit ?? 10,
				total: threadIds.length,
			});
			return jsonContent(result);
		},
	);
}
