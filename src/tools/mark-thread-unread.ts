import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { errorContent, jsonContent } from "../helpers/mcp-content.js";
import { createJmapClient } from "../jmap-client.js";

const modeEnum = z.enum(["all", "last"]);

export function registerMarkThreadUnreadTool(server: McpServer) {
	server.tool(
		"mark-thread-unread",
		"Mark emails in a thread as unread (all or just the last)",
		{
			threadId: z.string().describe("Thread ID to mark as unread"),
			mode: modeEnum
				.default("last")
				.describe(
					"'all' to mark all emails, 'last' to mark only the last email (default)",
				),
		},
		async ({ threadId, mode }) => {
			const client = createJmapClient();
			const accountId = await client.getPrimaryAccount();
			const [threads] = await client.api.Thread.get({
				accountId,
				ids: [threadId],
			});

			const thread = threads.list[0];
			if (!thread || !thread.emailIds || thread.emailIds.length === 0) {
				return errorContent("Thread not found or empty");
			}

			let emailIds: string[] = [];
			if (mode === "all") {
				emailIds = thread.emailIds;
			} else {
				// 'last' mode: mark only the most recent email as unread
				// Only add if there is at least one emailId
				if (thread.emailIds.length > 0) {
					emailIds = [
						thread.emailIds[thread.emailIds.length - 1] as string,
					];
				}
			}

			const update: Record<string, { keywords: { $seen: null } }> = {};
			for (const emailId of emailIds) {
				update[emailId] = { keywords: { $seen: null } };
			}

			await client.api.Email.set({ accountId, update });
			return jsonContent({ threadId, emailsMarkedUnread: emailIds });
		},
	);
}
