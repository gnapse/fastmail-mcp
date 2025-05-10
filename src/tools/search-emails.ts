import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createJmapClient } from "../jmap-client.js";
import { getPaginatedEmailResults } from "../helpers/email-list-helpers.js";

export function registerSearchEmailsTool(server: McpServer) {
    server.tool(
        "search-emails",
        {
            text: z
                .string()
                .optional()
                .describe("Search in subject, sender, recipients, and body"),
            from: z
                .string()
                .optional()
                .describe("Filter by sender email address"),
            to: z
                .string()
                .optional()
                .describe("Filter by recipient email address"),
            subject: z.string().optional().describe("Filter by subject"),
            mailboxId: z
                .string()
                .optional()
                .describe("If provided, only search in this mailbox ID"),
            limit: z.coerce
                .number()
                .int()
                .min(1)
                .max(50)
                .default(10)
                .optional()
                .describe(
                    "The maximum number of results to return (for pagination)"
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
        async ({ text, from, to, subject, mailboxId, limit, position }) => {
            const client = createJmapClient();
            const accountId = await client.getPrimaryAccount();

            const filter: Record<string, any> = {};
            if (text) filter.text = text;
            if (from) filter.from = from;
            if (to) filter.to = to;
            if (subject) filter.subject = subject;
            if (mailboxId) filter.inMailbox = mailboxId;

            const [query] = await client.api.Email.query({
                accountId,
                filter: Object.keys(filter).length ? filter : undefined,
                sort: [{ property: "receivedAt", isAscending: false }],
                limit: limit ?? 10,
                position: position ?? 0,
            });

            if (!query.ids.length) {
                return {
                    content: [
                        { type: "text", text: "No matching emails found." },
                    ],
                };
            }

            const result = await getPaginatedEmailResults({
                client,
                accountId,
                ids: query.ids,
                position: position ?? 0,
                limit: limit ?? 10,
                total: query.total ?? 0,
            });

            return {
                content: [
                    {
                        type: "text",
                        mimeType: "application/json",
                        text: JSON.stringify(result),
                    },
                ],
            };
        }
    );
}
