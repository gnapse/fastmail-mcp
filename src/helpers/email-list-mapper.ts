// Helper to map a JMAP email object to the desired output structure
export function mapEmailListItem(email: {
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
