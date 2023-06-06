import { Handlers } from "$fresh/server.ts";
import { deleteSession } from "🛠️/db.ts";
import { getSessionId, signOut } from "kv_oauth";

export const handler: Handlers = {
  async GET(req) {
    const session = getSessionId(req);
    await deleteSession(session);

    return await signOut(req);
  },
};
