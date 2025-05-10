export function textContent(text: string) {
    return {
        content: [{ type: "text" as const, text }],
    };
}

export function jsonContent(data: any) {
    return {
        content: [
            {
                type: "text" as const,
                mimeType: "application/json",
                text: JSON.stringify(data, null, 2),
            },
        ],
    };
}

export function errorContent(error: string) {
    return {
        ...textContent(error),
        isError: true,
    };
}
