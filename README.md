# JMAP MCP Server

This project exposes a Model Context Protocol (MCP) server that allows LLMs to access and interact with an email account via the JMAP protocol.

## Features

-   MCP server using the official [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk?tab=readme-ov-file#installation)
-   JMAP email access via [jmap-jam](https://github.com/htunnicliff/jmap-jam)

## Setup

1. **Install dependencies and set up environment:**

    ```sh
    npm run setup
    ```

2. **Configure environment variables:**
   Update the `.env` file with your JMAP credentials:
    ```env
    JMAP_BEARER_TOKEN=your-jmap-bearer-token-here
    JMAP_SESSION_URL=https://api.fastmail.com/jmap/session
    ```

## Usage

1. **Build the project:**

    ```sh
    npm run build
    ```

2. **Run the MCP server with inspector:**
    ```sh
    npm run inspector
    ```
