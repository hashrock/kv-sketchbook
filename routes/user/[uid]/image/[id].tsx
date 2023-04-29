import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { deleteImage, getImage, getUserBySession } from "🛠️/db.ts";
import { Memo, State, User } from "🛠️/types.ts";
import IconTrash from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/trash.tsx";
import { Header } from "../../../../components/Header.tsx";

async function remove(
  uid: string,
  id: string,
) {
  await deleteImage(uid, id);
  return redirect("/user/" + uid + "");
}

export const handler: Handlers<Data, State> = {
  async GET(req, ctx) {
    const imageUrl = "/api/image/" + ctx.params.uid + "/" + ctx.params.id;
    if (!ctx.state.session) return ctx.render({ user: null, imageUrl });
    const user = await getUserBySession(ctx.state.session);

    if (!user) return ctx.render({ user: null, imageUrl });
    return ctx.render({ user, imageUrl });
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const method = form.get("_method")?.toString();
    const user = await getUserBySession(ctx.state.session ?? "");
    if (user === null) {
      return new Response("Unauthorized", { status: 401 });
    }
    if (user.id !== ctx.params.uid) {
      return new Response("Unauthorized", { status: 401 });
    }
    if (method === "DELETE") {
      return remove(user.id, ctx.params.id);
    }
    return new Response("Bad Request", { status: 400 });
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
type Data = SignedInData | null;
interface SignedInData {
  imageUrl: string;
  user: User | null;
}
export default function Home(props: PageProps<Data>) {
  return (
    <>
      <Head>
        <title>KV NotePad</title>
      </Head>
      <body class="bg-gray-100">
        <div class="px-4 py-8 mx-auto max-w-screen-md">
          <Header user={props.data?.user ?? null} />

          <img src={props.data?.imageUrl} alt="" />
        </div>
      </body>
    </>
  );
}
