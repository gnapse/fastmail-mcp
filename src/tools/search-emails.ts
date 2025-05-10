import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createJmapClient } from "../jmap-client.js";
import { getPaginatedEmailResults } from "../helpers/email-list-helpers.js";
import { errorContent, jsonContent } from "../helpers/mcp-content.js";

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
            after: z
                .string()
                .optional()
                .describe(
                    "Only include emails received after this ISO date (inclusive)"
                ),
            before: z
                .string()
                .optional()
                .describe(
                    "Only include emails received before this ISO date (exclusive)"
                ),
            hasAttachment: z
                .boolean()
                .optional()
                .describe(
                    "Only include emails that have (or do not have) attachments"
                ),
            minSize: z
                .number()
                .int()
                .optional()
                .describe(
                    "Only include emails with size >= this value (in bytes)"
                ),
            maxSize: z
                .number()
                .int()
                .optional()
                .describe(
                    "Only include emails with size <= this value (in bytes)"
                ),
        },
        async ({
            text,
            from,
            to,
            subject,
            mailboxId,
            limit,
            position,
            after,
            before,
            hasAttachment,
            minSize,
            maxSize,
        }) => {
            const client = createJmapClient();
            const accountId = await client.getPrimaryAccount();

            const filter: Record<string, any> = {};
            if (text) filter.text = text;
            if (from) filter.from = from;
            if (to) filter.to = to;
            if (subject) filter.subject = subject;
            if (mailboxId) filter.inMailbox = mailboxId;
            if (after) filter.after = after;
            if (before) filter.before = before;
            if (hasAttachment !== undefined)
                filter.hasAttachment = hasAttachment;
            if (minSize !== undefined) filter.minSize = minSize;
            if (maxSize !== undefined) filter.maxSize = maxSize;

            const [query] = await client.api.Email.query({
                accountId,
                filter: Object.keys(filter).length ? filter : undefined,
                sort: [{ property: "receivedAt", isAscending: false }],
                limit: limit ?? 10,
                position: position ?? 0,
            });

            if (!query.ids.length) {
                return errorContent("No matching emails found.");
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
