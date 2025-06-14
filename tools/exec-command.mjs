import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import log from '../log.mjs';
import { buildResponse } from '../toolHelpers.mjs';
import fs from 'fs/promises';

const execAsync = promisify(exec);

export default async function (server, toolName = 'exec-command') {
  server.tool(
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
            results.push({ command, cwd: execCwd, error: 'Invalid Linux path for cwd: ' + execCwd });
            continue;
          }
          execOptions.cwd = execCwd;
          execOptions.timeout = 50000; // 50 seconds
          execOptions.env = { ...process.env, ...(env || {}) };
          let stdout, stderr, exitCode, timedOut = false;
          try {
            const result = await execAsync(command, { ...execOptions, input: '' });
            stdout = result.stdout;
            stderr = result.stderr;
            exitCode = 0;
            let resObj = { command, cwd: execCwd, env, stdout, stderr, exitCode, timedOut };
            if (exitCode === 0 && !stdout && !stderr) {
              resObj.success = true;
            }
            results.push(resObj);
          } catch (err) {
            stdout = err.stdout;
            stderr = err.stderr;
            exitCode = typeof err.code === 'number' ? err.code : 1;
            if (err.killed && err.signal === 'SIGTERM' && err.killedByTimeout) {
              timedOut = true;
            } else if (err.signal === 'SIGTERM' && err.message && err.message.includes('timed out')) {
              timedOut = true;
            }
            results.push({ command, cwd: execCwd, env, stdout, stderr, exitCode, timedOut, error: err.message });
          }
        }
        return buildResponse({ results });
      } catch (err) {
        log.error('exec-command', err);
        return buildResponse({ error: err.message });
      }
    }
  );
}
