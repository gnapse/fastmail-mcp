import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { jsonContent } from "../helpers/mcp-content.js";
import { createJmapClient } from "../jmap-client.js";

export function registerMoveThreadsToMailboxTool(server: McpServer) {
	server.tool(
		"move-threads-to-mailbox",
		"Move all emails in one or more threads to a target mailbox",
		{
			threadIds: z
				.array(z.string())
				.min(1)
				.max(10)
				.describe("Array of thread IDs to move"),
			mailboxId: z.string().describe("Target mailbox ID"),
		},
		async ({ threadIds, mailboxId }) => {
			const client = createJmapClient();
			const accountId = await client.getPrimaryAccount();
			const summary: {
				threadId: string;
				emailsMoved?: number;
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

				// Move all emails in the thread to the target mailbox
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
					emailsMoved: thread.emailIds.length,
					mailboxId,
				});
			}
			return jsonContent({ summary });
		},
	);
}
