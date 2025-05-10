import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createJmapClient } from "../jmap-client.js";
import { mapEmailListItem } from "../helpers/email-list-mapper.js";

export function registerListEmailsTool(server: McpServer) {
    server.tool(
        "list-emails",
        {
            limit: z.coerce
                .number()
                .int()
                .min(1)
                .max(50)
                .default(10)
                .optional()
                .describe("The maximum number of emails to return"),
            mailboxId: z
                .string()
                .optional()
                .describe("If provided, only list emails from this mailbox ID"),
            status: z
                .enum(["all", "read", "unread"])
                .default("all")
                .optional()
                .describe(
                    'Filter by read status: "read", "unread", or "all" (default)'
                ),
        },
        async ({ limit, mailboxId, status }) => {
            const client = createJmapClient();
            const accountId = await client.getPrimaryAccount();

            // Build filter for mailbox and status
            let filter: any = undefined;
            if (mailboxId && status === "unread") {
                filter = {
                    inMailbox: mailboxId,
                    notKeyword: "$seen",
                };
            } else if (mailboxId && status === "read") {
                filter = {
                    inMailbox: mailboxId,
                    hasKeyword: "$seen",
                };
            } else if (mailboxId) {
                filter = { inMailbox: mailboxId };
            } else if (status === "unread") {
                filter = { notKeyword: "$seen" };
            } else if (status === "read") {
                filter = { hasKeyword: "$seen" };
            }

            const [query] = await client.api.Email.query({
                accountId,
                sort: [{ property: "receivedAt", isAscending: false }],
                limit: limit ?? 10,
                filter,
            });

            if (!query.ids.length) {
                return {
                    content: [{ type: "text", text: "No emails found." }],
                };
            }

            const [emails] = await client.api.Email.get({
                accountId,
                ids: query.ids,
                properties: ["id", "subject", "from", "receivedAt"],
            });

            const emailsList = emails.list.map(mapEmailListItem);

            return {
                content: [
                    {
                        type: "text",
                        mimeType: "application/json",
                        text: JSON.stringify(emailsList),
                    },
                ],
            };
        }
    );
}
