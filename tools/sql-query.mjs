import { z, buildResponse } from '@purinton/mcp-server';

export default async function ({ mcpServer, toolName, log, db }) {
  mcpServer.tool(
    toolName,
    'Run SQL queries on the remote Linux server (multiple databases and queries supported)',
    {
      batches: z.array(z.object({
        database: z.string().optional(),
        queries: z.array(z.string())
      })).min(1, 'At least one batch is required')
    },
    async (_args, _extra) => {
      try {
        const batches = _args.batches;
        const allResults = [];
        for (const batch of batches) {
          const { database, queries } = batch;
          if (database) await db.query(`USE \`${database}\``);
          let expandedQueries = [];
          for (const q of queries) {
            // Split by semicolon, ignore empty/whitespace
            expandedQueries.push(...q.split(';').map(x => x.trim()).filter(x => x.length > 0));
          }
          if (expandedQueries.length === 0) {
            allResults.push({ database, error: 'No queries provided' });
            continue;
          }
          const results = [];
          for (const q of expandedQueries) {
            try {
              const [rows] = await db.query(q);
              results.push({
                query: q,
                success: true,
                rows: rows,
                rowCount: Array.isArray(rows) ? rows.length : undefined
              });
            } catch (err) {
              log.error('sql-query', err);
              results.push({
                query: q,
                success: false,
                error: err.message
              });
            }
          }
          allResults.push({ database, results });
        }
        return buildResponse({ results: allResults });
      } catch (err) {
        log.error('sql-query', err);
        return buildResponse({ error: err.message });
      }
    }
  );
}
