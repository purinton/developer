import os from 'os';
import path from 'path';
import fs from 'fs/promises';
import { Client } from 'ssh2';
import { z, buildResponse } from '@purinton/mcp-server';

async function getDefaultPrivateKey() {
    const sshDir = path.join(os.homedir(), '.ssh');
    const candidates = ['id_ed25519', 'id_rsa', 'id_ecdsa', 'id_dsa'];
    for (const file of candidates) {
        try {
            const keyPath = path.join(sshDir, file);
            const key = await fs.readFile(keyPath, 'utf8');
            if (key) return key;
        } catch (e) { /* ignore */ }
    }
    return undefined;
}

export default async function ({ mcpServer, toolName, log }) {
    mcpServer.tool(
        toolName,
        'Execute multiple commands on multiple remote servers via SSH',
        {
            connections: z.array(z.object({
                host: z.string(),
                username: z.string().default('root').optional().nullable(),
                commands: z.array(z.string()).min(1, 'At least one command is required')
            })).min(1, 'At least one connection is required')
        },
        async (_args, _extra) => {
            const { connections } = _args;
            if (!Array.isArray(connections) || connections.length === 0) {
                return buildResponse({ error: 'No connections provided' });
            }
            const defaultKey = await getDefaultPrivateKey();
            const allResults = [];
            for (const connInfo of connections) {
                const { host, username, commands } = connInfo;
                if (!host || !username || !Array.isArray(commands) || commands.length === 0) {
                    allResults.push({ host, username, error: 'Missing host, username, or commands' });
                    continue;
                }
                const conn = new Client();
                const results = [];
                const privateKey = defaultKey;
                await new Promise((resolve) => {
                    conn.on('ready', async () => {
                        for (const cmd of commands) {
                            await new Promise((res) => {
                                let stdout = '';
                                let stderr = '';
                                let timedOut = false;
                                let timeout = setTimeout(() => {
                                    timedOut = true;
                                    try { conn.end(); } catch (e) { }
                                    res();
                                }, 50000);
                                conn.exec(cmd, (err, stream) => {
                                    if (err) {
                                        clearTimeout(timeout);
                                        results.push({ stdout, stderr, exitCode: 1, timedOut, error: err.message });
                                        return res();
                                    }
                                    stream.on('close', (code, signal) => {
                                        clearTimeout(timeout);
                                        results.push({ stdout, stderr, exitCode: code, timedOut });
                                        res();
                                    }).on('data', (data) => {
                                        stdout += data;
                                    }).stderr.on('data', (data) => {
                                        stderr += data;
                                    });
                                });
                            });
                        }
                        conn.end();
                        allResults.push({ host, username, results });
                        resolve();
                    }).on('error', (err) => {
                        log.error('ssh-exec', err);
                        allResults.push({ host, username, error: err.message });
                        resolve();
                    }).connect({
                        host,
                        username,
                        privateKey,
                    });
                });
            }
            return buildResponse({ results: allResults });
        }
    );
}
