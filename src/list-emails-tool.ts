import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createJmapClient } from "./jmap-client.js";

export function registerListEmailsTool(server: McpServer) {
    server.tool(
        "list-emails",
        {
            limit: z.coerce
                .number()
                .int()
                .min(1)
                .max(50)
                .optional()
                .describe("The maximum number of emails to return"),
        },
        async ({ limit }) => {
            const client = createJmapClient();
            const accountId = await client.getPrimaryAccount();
            // Query for emails, sorted by receivedAt descending
            const [query] = await client.api.Email.query({
                accountId,
                sort: [{ property: "receivedAt", isAscending: false }],
                limit: limit ?? 10,
            });
            if (!query.ids.length) {
                return {
                    content: [{ type: "text", text: "No emails found." }],
                };
            }
            // Fetch email details
            const [emails] = await client.api.Email.get({
                accountId,
                ids: query.ids,
                properties: ["subject", "from", "receivedAt"],
            });
            const lines = emails.list.map(
                (email: any) => `Subject: ${email.subject || "(no subject)"}`
            );
            return {
                content: [{ type: "text", text: lines.join("\n") }],
            };
        }
    );
}
