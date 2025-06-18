import fs from 'fs/promises';
import { z, buildResponse } from '@purinton/mcp-server';

export default async function ({ mcpServer, toolName, log }) {
  mcpServer.tool(
    toolName,
    'Read file content on the remote Linux server',
    { path: z.string() },
    async (_args, _extra) => {
      try {
        const content = await fs.readFile(_args.path, 'utf8');
        return buildResponse({ content });
      } catch (err) {
        log.error('read-file', err);
        return buildResponse({ error: err.message });
      }
    }
  );
}
