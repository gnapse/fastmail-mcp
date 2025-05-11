import type JamClient from "jmap-jam";

export async function getPaginatedThreadResults({
	client,
	accountId,
	threadIds,
	position,
	limit,
	total,
}: {
	client: JamClient;
	accountId: string;
	threadIds: string[];
	position: number;
	limit: number;
	total: number;
}) {
	const pagedThreadIds = threadIds.slice(position, position + limit);
	const [threads] = await client.api.Thread.get({
		accountId,
		ids: pagedThreadIds,
	});

	const threadSummaries = await Promise.all(
		threads.list.map(async (thread) => {
			if (!thread.emailIds || thread.emailIds.length === 0) return null;
			const [threadEmails] = await client.api.Email.get({
				accountId,
				ids: thread.emailIds,
				properties: ["id", "subject", "from", "receivedAt"],
			});
			const sorted = threadEmails.list
				.slice()
				.sort(
					(a, b) =>
						new Date(b.receivedAt).getTime() -
						new Date(a.receivedAt).getTime(),
				);
			const latest = sorted[0];
			return {
				threadId: thread.id,
				emailIds: thread.emailIds,
				summary: latest
					? {
							subject: latest.subject || "(no subject)",
							from:
								latest.from
									?.map((a) => a.name || a.email)
									.join(", ") || "",
							receivedAt: latest.receivedAt || "",
						}
					: null,
			};
		}),
	);

	const filtered = threadSummaries.filter(Boolean);
	return {
		threads: filtered,
		position,
		limit,
		total,
		hasMore: position + limit < total,
	};
}
