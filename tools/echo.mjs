import logger from '@purinton/log';
import { z, buildResponse } from '@purinton/mcp-server';

export default async function (server, toolName = 'echo', log = logger) {
  server.tool(
    toolName,
    "Echo Tool",
    { echoText: z.string() },
    async (_args, _extra) => {
      log.debug(toolName, { _args, _extra });
      const pong = {
        message: "echo-reply",
        data: {
          text: _args.echoText
        }
      };
      return buildResponse(pong);
    }
  );
}
