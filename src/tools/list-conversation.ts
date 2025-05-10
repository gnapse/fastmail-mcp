import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { errorContent, jsonContent } from "../helpers/mcp-content.js";
import { createJmapClient } from "../jmap-client.js";

export function registerListConversationTool(server: McpServer) {
	server.tool(
		"list-conversation",
		"List the emails in a conversation (thread)",
		{
			emailId: z
				.string()
				.describe("The ID of the email to fetch the conversation for"),
		},
		async ({ emailId }) => {
			const client = createJmapClient();
			const accountId = await client.getPrimaryAccount();

			const [emails] = await client.api.Email.get({
				accountId,
				ids: [emailId],
				properties: ["threadId"],
			});

			const email = emails.list[0];
			if (!email || !email.threadId) {
				return errorContent("Email or thread not found.");
			}

			const threadId: string = email.threadId;
			const [threads] = await client.api.Thread.get({
				accountId,
				ids: [threadId],
			});

			const thread = threads.list[0];
			if (!thread || !thread.emailIds || thread.emailIds.length === 0) {
				return errorContent("Thread has no emails.");
			}

			const [allEmails] = await client.api.Email.get({
				accountId,
				ids: thread.emailIds,
				properties: [
					"id",
					"subject",
					"from",
					"to",
					"receivedAt",
					"preview",
					"textBody",
					"bodyValues",
					"attachments",
					"keywords",
				],
			});

			const sorted = allEmails.list
				.slice()
				.sort(
					(a, b) =>
						new Date(a.receivedAt).getTime() -
						new Date(b.receivedAt).getTime(),
				);

			let foundFirstUnread = false;
			const messages = sorted.map((msg) => {
				const isRead = !!msg.keywords?.$seen;
				let isNew = false;
				if (!isRead && !foundFirstUnread) {
					foundFirstUnread = true;
					isNew = true;
				} else if (foundFirstUnread) {
					isNew = true;
				}
				return {
					id: msg.id,
					subject: msg.subject,
					from: msg.from?.map((a) => a.email).join(", ") || "",
					to: msg.to?.map((a) => a.email).join(", ") || "",
					date: msg.receivedAt,
					preview: msg.preview,
					isRead,
					isNew,
					attachments: msg.attachments || [],
				};
			});

			return jsonContent({ threadId, messages });
		},
	);
}
