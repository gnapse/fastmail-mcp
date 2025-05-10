function mapEmailListItem(email: {
    from: { name?: string; email: string }[] | undefined;
    subject: string | undefined;
    id: string;
    receivedAt: string;
}) {
    return {
        id: email.id,
        subject: email.subject || "(no subject)",
        from: email.from?.map((a) => a.name || a.email).join(", ") || "",
        receivedAt: email.receivedAt || "",
    };
}

export async function getPaginatedEmailResults({
    client,
    accountId,
    ids,
    position,
    limit,
    total,
}: {
    client: any;
    accountId: string;
    ids: string[];
    position: number;
    limit: number;
    total: number;
}) {
    const [emails] = await client.api.Email.get({
        accountId,
        ids,
        properties: ["id", "subject", "from", "receivedAt"],
    });

    const emailsList = emails.list.map(mapEmailListItem);

    return {
        emails: emailsList,
        position,
        limit,
        total,
        hasMore: position + limit < total,
    };
}
