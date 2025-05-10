import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createJmapClient } from "./jmap-client.js";

export function registerListMailboxesTool(server: McpServer) {
    server.tool(
        "list-mailboxes",
        {}, // no arguments
        async () => {
            const client = createJmapClient();
            const accountId = await client.getPrimaryAccount();
            // Query all mailboxes
            const [query] = await client.api.Mailbox.query({ accountId });
            if (!query.ids.length) {
                return {
                    content: [{ type: "text", text: "No mailboxes found." }],
                };
            }
            // Fetch mailbox details
            const [mailboxes] = await client.api.Mailbox.get({
                accountId,
                ids: query.ids,
                properties: ["name", "id", "role"],
            });
            const lines = mailboxes.list.map((mb: any) => {
                return `Name: ${mb.name} | ID: ${mb.id}${
                    mb.role ? ` | Type: ${mb.role}` : ""
                }`;
            });
            return {
                content: [{ type: "text", text: lines.join("\n") }],
            };
        }
    );
}
