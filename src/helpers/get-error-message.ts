export function getErrorMessage(error: unknown) {
	if (typeof error === "string") {
		return `Error text: ${error}`;
	}
	if (error instanceof Error) {
		return `Error instance: ${error.message}`;
	}
	if (typeof error === "object" && error !== null && "message" in error) {
		return `Error message: ${String(error.message)}`;
	}
	return `Unknown error: ${JSON.stringify(error)}`;
}
