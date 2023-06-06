import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { State } from "🛠️/types.ts";
import { getSessionId } from "kv_oauth";

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<State>,
) {
  ctx.state.session = getSessionId(req);
  return await ctx.next();
}
