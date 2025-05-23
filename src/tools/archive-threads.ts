import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getMailboxByRole } from "../helpers/mailbox-helpers.js";
import { errorContent, jsonContent } from "../helpers/mcp-content.js";
import { createJmapClient } from "../jmap-client.js";

export function registerArchiveThreadsTool(server: McpServer) {
	server.tool(
		"archive-threads",
		"Move all emails in one or more threads to the Archive mailbox",
		{
			threadIds: z
				.array(z.string())
				.min(1)
				.max(10)
				.describe("Array of thread IDs to archive"),
		},
		async ({ threadIds }) => {
			const client = createJmapClient();
			const accountId = await client.getPrimaryAccount();

			const archiveMailbox = await getMailboxByRole({
				client,
				accountId,
				role: "archive",
			});
			if (!archiveMailbox) {
				return errorContent("No archive mailbox found");
			}
			const mailboxId = archiveMailbox.id;

			const summary: {
				threadId: string;
				emailsArchived?: number;
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

				// Move all emails in the thread to the archive mailbox
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
					emailsArchived: thread.emailIds.length,
					mailboxId,
				});
			}
			return jsonContent({ summary });
		},
	);
}
