import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createJmapClient } from "../jmap-client.js";
import { getPaginatedEmailResults } from "../helpers/email-list-helpers.js";
import { errorContent, jsonContent } from "../helpers/mcp-content.js";

export function registerListEmailsTool(server: McpServer) {
    server.tool(
        "list-emails",
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
                    'Filter by read status: "read", "unread", or "all" (default)'
                ),
            limit: z.coerce
                .number()
                .int()
                .min(1)
                .max(50)
                .default(10)
                .optional()
                .describe(
                    "The maximum number of emails to return (for pagination)"
                ),
            position: z.coerce
                .number()
                .int()
                .min(0)
                .default(0)
                .optional()
                .describe(
                    "The zero-based index of the first email to return (for pagination)"
                ),
        },
        async ({ limit, mailboxId, status, position }) => {
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
                position: position ?? 0,
                filter,
            });

            if (!query.ids.length) {
                return errorContent("No emails found.");
            }

            const result = await getPaginatedEmailResults({
                client,
                accountId,
                ids: query.ids,
                position: position ?? 0,
                limit: limit ?? 10,
                total: query.total ?? 0,
            });

            return jsonContent(result);
        }
    );
}
