import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getMailboxByRole } from "../helpers/mailbox-helpers.js";
import { errorContent, jsonContent } from "../helpers/mcp-content.js";
import { createJmapClient } from "../jmap-client.js";

export function registerDeleteThreadsTool(server: McpServer) {
	server.tool(
		"delete-threads",
		"Move all emails in one or more threads to the Trash mailbox (soft delete)",
		{
			threadIds: z
				.array(z.string())
				.min(1)
				.max(10)
				.describe("Array of thread IDs to delete (move to Trash)"),
		},
		async ({ threadIds }) => {
			const client = createJmapClient();
			const accountId = await client.getPrimaryAccount();

			const trashMailbox = await getMailboxByRole({
				client,
				accountId,
				role: "trash",
			});
			if (!trashMailbox) {
				return errorContent("No Trash mailbox found");
			}
			const mailboxId = trashMailbox.id;

			const summary: {
				threadId: string;
				emailsDeleted?: number;
				error?: string;
				mailboxId?: string;
			}[] = [];

			for (const threadId of threadIds) {
				const [threads] = await client.api.Thread.get({
					accountId,
					ids: [threadId],
				});
				const thread = threads.list[0];
				if (
					!thread ||
					!thread.emailIds ||
					thread.emailIds.length === 0
				) {
					summary.push({
						threadId,
						error: "Thread not found or empty",
					});
					continue;
				}
				const update: Record<
					string,
					{ mailboxIds: { [key: string]: boolean } }
				> = {};
				for (const emailId of thread.emailIds) {
					update[emailId] = { mailboxIds: { [mailboxId]: true } };
				}
				await client.api.Email.set({ accountId, update });
				summary.push({
					threadId,
					emailsDeleted: thread.emailIds.length,
					mailboxId,
				});
			}

			return jsonContent({ summary });
		},
	);
}
