import fs from 'fs/promises';
import { promisify } from 'util';
import { exec } from 'child_process';
import { z, buildResponse } from '@purinton/mcp-server';


const execAsync = promisify(exec);

export default async function ({ mcpServer, toolName, log }) {
  mcpServer.tool(
    toolName,
    'Write file on the remote Linux server',
    { path: z.string(), content: z.string(), owner: z.string().optional(), group: z.string().optional(), chmod: z.string().optional() },
    async (_args, _extra) => {
      try {
        await fs.writeFile(_args.path, _args.content, 'utf8');
        if (_args.owner && _args.group) {
          await execAsync(`chown ${_args.owner}:${_args.group} "${_args.path}"`);
        }
        if (_args.chmod) {
          await execAsync(`chmod ${_args.chmod} "${_args.path}"`);
        }
        return buildResponse({ bytesWritten: Buffer.byteLength(_args.content, 'utf8') });
      } catch (err) {
        log.error('write-file', err);
        return buildResponse({ error: err.message });
      }
    }
  );
}
