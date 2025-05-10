import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createJmapClient } from "./jmap-client.js";

export function registerGetEmailDetailsTool(server: McpServer) {
    server.tool(
        "get-email-details",
        {
            emailId: z
                .string()
                .describe("The ID of the email to fetch details for"),
        },
        async ({ emailId }) => {
            const client = createJmapClient();
            const accountId = await client.getPrimaryAccount();
            const [emails] = await client.api.Email.get({
                accountId,
                ids: [emailId],
                properties: [
                    "subject",
                    "from",
                    "to",
                    "receivedAt",
                    "preview",
                    "textBody",
                    "bodyValues",
                ],
            });

            const email = emails.list[0];
            if (!email) {
                return {
                    content: [{ type: "text", text: "Email not found." }],
                };
            }

            const from = email.from?.map((a: any) => a.email).join(", ") || "";
            const to = email.to?.map((a: any) => a.email).join(", ") || "";
            const date = email.receivedAt || "";
            const subject = email.subject || "(no subject)";
            const preview = email.preview || "";
            let body = "(no plain text body)";
            if (
                email.textBody &&
                email.textBody[0]?.partId &&
                email.bodyValues
            ) {
                const partId = email.textBody[0].partId;
                body = email.bodyValues[partId]?.value || body;
            }
            const details = `Subject: ${subject}\nFrom: ${from}\nTo: ${to}\nDate: ${date}\nPreview: ${preview}\n\nBody:\n${body}`;
            return {
                content: [{ type: "text", text: details }],
            };
        }
    );
}
