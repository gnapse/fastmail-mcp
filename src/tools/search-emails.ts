import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createJmapClient } from "../jmap-client.js";
import { mapEmailListItem } from "../helpers/email-list-mapper.js";

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
                .describe("Maximum number of results to return"),
        },
        async ({ text, from, to, subject, mailboxId, limit }) => {
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
            });

            if (!query.ids.length) {
                return {
                    content: [
                        { type: "text", text: "No matching emails found." },
                    ],
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
