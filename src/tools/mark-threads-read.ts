import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { jsonContent } from "../helpers/mcp-content.js";
import { createJmapClient } from "../jmap-client.js";

export function registerMarkThreadsReadTool(server: McpServer) {
	server.tool(
		"mark-threads-read",
		"Mark all emails in one or more threads as read",
		{
			threadIds: z
				.array(z.string())
				.min(1)
				.max(10)
				.describe("Array of thread IDs to mark as read"),
		},
		async ({ threadIds }) => {
			const client = createJmapClient();
			const accountId = await client.getPrimaryAccount();
			const summary: {
				threadId: string;
				emailsMarkedRead?: number;
				error?: string;
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
				// Set $seen keyword for all emails in the thread
				const update: Record<string, { keywords: { $seen: boolean } }> =
					{};
				for (const emailId of thread.emailIds) {
					update[emailId] = { keywords: { $seen: true } };
				}
				await client.api.Email.set({ accountId, update });
				summary.push({
					threadId,
					emailsMarkedRead: thread.emailIds.length,
				});
			}
			return jsonContent({ summary });
		},
	);
}
