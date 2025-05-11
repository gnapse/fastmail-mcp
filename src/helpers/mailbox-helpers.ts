import type { JamClient } from "jmap-jam";

export async function getMailboxByRole({
	client,
	accountId,
	role,
}: {
	client: JamClient;
	accountId: string;
	role: string;
}) {
	const [mailboxes] = await client.api.Mailbox.get({
		accountId,
		properties: ["id", "role"],
	});
	const mailbox = mailboxes.list.find((mb) => mb.role === role);
	return mailbox ?? null;
}
