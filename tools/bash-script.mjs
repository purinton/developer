import fs from 'fs/promises';
import { spawn } from 'child_process';
import { z, buildResponse } from '@purinton/mcp-server';

export default async function ({ mcpServer, toolName, log }) {
  mcpServer.tool(
    toolName,
    'Run bash script on the remote Linux server',
    { script: z.string(), cwd: z.string().optional() },
    async (_args, _extra) => {
      try {
        let execOptions = {};
        let cwd = _args.cwd || '/tmp';
        try {
          const stat = await fs.stat(cwd);
          if (!stat.isDirectory()) {
            throw new Error('cwd is not a directory');
          }
        } catch (e) {
          throw new Error('Invalid Linux path for cwd: ' + cwd);
        }
        execOptions.cwd = cwd;
        execOptions.timeout = 50000; // 50 seconds
        execOptions.env = { ...process.env };
        return await new Promise((resolve) => {
          const child = spawn('bash', ['-s'], execOptions);
          let stdout = '';
          let stderr = '';
          let timedOut = false;
          const timeout = setTimeout(() => {
            timedOut = true;
            child.kill('SIGTERM');
          }, 50000);
          child.stdout.on('data', (data) => {
            stdout += data;
          });
          child.stderr.on('data', (data) => {
            stderr += data;
          });
          child.on('close', (exitCode) => {
            clearTimeout(timeout);
            resolve(buildResponse({ stdout, stderr, exitCode, timedOut }));
          });
          child.stdin.write(_args.script);
          child.stdin.end();
        });
      } catch (err) {
        log.error('bash-script', err);
        return buildResponse({ error: err.message });
      }
    }
  );
}
