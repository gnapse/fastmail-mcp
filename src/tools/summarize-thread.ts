import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createJmapClient } from "../jmap-client.js";
import { errorContent } from "../helpers/mcp-content.js";

const summaryModeEnum = z.enum(["all", "unread", "split"]);

export function registerSummarizeThreadTool(server: McpServer) {
    server.tool(
        "summarize-thread",
        {
            threadId: z.string().describe("The thread ID to summarize"),
            summaryMode: summaryModeEnum
                .default("split")
                .describe(
                    "Summary mode: 'all' (entire thread), 'unread' (only unread), or 'split' (separate sections for read/unread)"
                ),
        },
        async ({ threadId, summaryMode }) => {
            const client = createJmapClient();
            const accountId = await client.getPrimaryAccount();

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
                        new Date(b.receivedAt).getTime()
                );

            let foundFirstUnread = false;
            const read: typeof sorted = [];
            const unread: typeof sorted = [];
            for (const msg of sorted) {
                const isRead = !!(msg.keywords && msg.keywords["$seen"]);
                if (!isRead && !foundFirstUnread) {
                    foundFirstUnread = true;
                }
                if (foundFirstUnread) {
                    unread.push(msg);
                } else {
                    read.push(msg);
                }
            }

            function summarize(messages: typeof sorted): string {
                if (!messages.length) return "(none)";
                return messages
                    .map(
                        (m) =>
                            `- ${m.subject || "(no subject)"} from ${
                                m.from?.map((a: any) => a.email).join(", ") ||
                                ""
                            } on ${m.receivedAt}`
                    )
                    .join("\n");
            }

            let summary: Record<string, string> = {};
            if (summaryMode === "all") {
                summary = { all: summarize(sorted) };
            } else if (summaryMode === "unread") {
                summary = { unread: summarize(unread) };
            } else {
                summary = {
                    previouslyRead: summarize(read),
                    newSinceLastRead: summarize(unread),
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(
                            { threadId, summaryMode, summary },
                            null,
                            2
                        ),
                    },
                ],
            };
        }
    );
}
