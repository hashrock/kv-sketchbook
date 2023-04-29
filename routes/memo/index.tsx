import { Handlers } from "$fresh/server.ts";
import { addMemo, getUserBySession } from "🛠️/db.ts";
import { Memo, State, User } from "🛠️/types.ts";
interface Data {
  memo: Memo;
  user: User | null;
}
export const handler: Handlers<Data, State> = {
  async POST(req, ctx) {
    const form = await req.formData();
    const user = await getUserBySession(ctx.state.session ?? "");
    if (user === null) {
      return new Response("Unauthorized", { status: 401 });
    }

    const title = form.get("title")?.toString();
    if (!title) {
      return new Response("Bad Request", { status: 400 });
    }
    const body = form.get("body")?.toString();
    if (!body) {
      return new Response("Bad Request", { status: 400 });
    }

    await addMemo(user.id, title, body);

    return redirect();
  },
};
function redirect(location = "/") {
  const headers = new Headers();
  headers.set("location", location);
  return new Response(null, {
    status: 303,
    headers,
  });
}
