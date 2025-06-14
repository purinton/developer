import { z } from 'zod';
import fs from 'fs/promises';
import log from '../log.mjs';
import { buildResponse } from '../toolHelpers.mjs';

export default async function (server, toolName = 'read-file') {
  server.tool(
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
