# Fastmail MCP Server

An MCP server to connect to Fastmail, or other jmap-based email services

## User Setup

1. **Clone this repository**

    ```sh
    git clone https://github.com/gnapse/fastmail-mcp
    ```

2. **Install dependencies and set up environment**

    ```sh
    npm run setup
    ```

3. **Add this `fastmail-mcp` section to your `mcp.json` config in Cursor, Claude, Raycast, etc.**

    ```json
    {
        "mcpServers": {
            "fastmail-mcp": {
                "type": "stdio",
                "command": "node",
                "args": [
                    "/Users/<your_user_name>/code/fastmail-mcp/dist/mcp-server.js"
                ],
                "env": {
                    "JMAP_BEARER_TOKEN": "your-jmap-bearer-token-here",
                    "JMAP_SESSION_URL": "https://api.fastmail.com/jmap/session"
                }
            }
        }
    }
    ```

4. **Update the configuration above as follows**
    - Replace `JMAP_BEARER_TOKEN` with your Fastmail API token (or that of any other JMAP email provider)
    - (Optional) Replace `JMAP_SESSION_URL` if you're using an email provider other than Fastmail
    - Replace the path in the `args` array with the correct path to where you cloned the repository

## Features

This project is in its early stages. Expect more and/or better tools soon.

Nevertheless, our goal is to provide a small set of tools that enable complete workflows, rather than just atomic actions, striking a balance between flexibility and efficiency for LLMs.

### Available Tools

-   **list-mailboxes**: List all mailboxes, with their IDs, names, roles, and total and unread email counts
-   **search-threads**: Search for email threads by subject, sender, recipients, body, and more
-   **list-threads**: List the email threads in a mailbox, or all threads from all mailboxes
-   **list-thread-messages**: List the emails in a thread (conversation)
-   **get-email-details**: Get details about an email
-   **move-threads-to-mailbox**: Move all emails in one or more threads to a target mailbox
-   **mark-threads-read**: Mark all emails in one or more threads as read
-   **mark-thread-unread**: Mark emails in a thread as unread (all or just the last)
-   **archive-threads**: Move all emails in one or more threads to the Archive mailbox
-   **delete-threads**: Move all emails in one or more threads to the Trash mailbox (soft delete)

## Dependencies

-   MCP server using the official [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk?tab=readme-ov-file#installation)
-   JMAP email access via [jmap-jam](https://github.com/htunnicliff/jmap-jam)

## Development Setup

1. **Install dependencies and set up environment**

    ```sh
    npm run setup
    ```

2. **Configure environment variables**
   Update the `.env` file with your JMAP credentials:

    ```env
    JMAP_BEARER_TOKEN=your-jmap-bearer-token-here
    JMAP_SESSION_URL=https://api.fastmail.com/jmap/session
    ```

3. **Run the MCP server with inspector**
    ```sh
    npm run dev
    ```

If you make changes to the code locally, you need to update the build:

```sh
npm run build
```
