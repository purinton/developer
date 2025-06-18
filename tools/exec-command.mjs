import fs from 'fs/promises';
import { spawn } from 'child_process';
import { z, buildResponse } from '@purinton/mcp-server';

export default async function ({ mcpServer, toolName, log }) {
  mcpServer.tool(
    toolName,
    'Execute a command or array of commands on the remote Linux server',
    {
      commands: z.array(z.object({
        command: z.string(),
        cwd: z.string().optional(),
        env: z.record(z.string()).optional()
      })).min(1, 'At least one command is required')
    },
    async (_args, _extra) => {
      try {
        const commands = _args.commands;
        const results = [];
        for (const cmdObj of commands) {
          const { command, cwd, env } = cmdObj;
          let execOptions = {};
          let execCwd = cwd || '/tmp';
          // Validate cwd is a directory
          try {
            const stat = await fs.stat(execCwd);
            if (!stat.isDirectory()) {
              throw new Error('cwd is not a directory');
            }
          } catch (e) {
            results.push({ stdout: '', stderr: '', exitCode: 1, timedOut: false, error: 'Invalid Linux path for cwd: ' + execCwd });
            continue;
          }
          execOptions.cwd = execCwd;
          execOptions.timeout = 50000; // 50 seconds
          execOptions.env = { ...process.env, ...(env || {}) };
          await new Promise((resolve) => {
            let stdout = '';
            let stderr = '';
            let timedOut = false;
            const child = spawn('bash', ['-c', command], execOptions);
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
              results.push({ stdout, stderr, exitCode, timedOut });
              resolve();
            });
            child.on('error', (err) => {
              clearTimeout(timeout);
              results.push({ stdout, stderr, exitCode: 1, timedOut, error: err.message });
              resolve();
            });
          });
        }
        return buildResponse({ results });
      } catch (err) {
        log.error('exec-command', err);
        return buildResponse({ error: err.message });
      }
    }
  );
}
