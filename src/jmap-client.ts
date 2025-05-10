import dotenv from "dotenv";
import { JamClient } from "jmap-jam";
dotenv.config();

export function createJmapClient() {
	const bearerToken = process.env.JMAP_BEARER_TOKEN;
	const sessionUrl = process.env.JMAP_SESSION_URL;
	if (!bearerToken || !sessionUrl) {
		throw new Error(
			"Missing JMAP_BEARER_TOKEN or JMAP_SESSION_URL environment variable",
		);
	}
	return new JamClient({ bearerToken, sessionUrl });
}
