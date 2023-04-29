import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { deleteImage, getImage, getUserBySession } from "🛠️/db.ts";
import { Memo, State, User } from "🛠️/types.ts";
import IconTrash from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/trash.tsx";
import { Header } from "../../../../components/Header.tsx";
import { APP_NAME } from "🛠️/const.ts";
import { Breadcrumbs } from "../../../../components/Breadcrumbs.tsx";

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
    if (!ctx.state.session) {
      return ctx.render({ user: null, id: ctx.params.id, imageUrl });
    }
    const user = await getUserBySession(ctx.state.session);

    if (!user) return ctx.render({ user: null, id: ctx.params.id, imageUrl });
    return ctx.render({ user, id: ctx.params.id, imageUrl });
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
  id: string;
  user: User | null;
}
export default function Home(props: PageProps<Data>) {
  return (
    <>
      <Head>
        <title>{props.data?.user?.name}'s work | {APP_NAME}</title>
      </Head>
      <body class="bg-gray-100">
        <div class="px-4 py-8 mx-auto max-w-screen-md">
          <Header user={props.data?.user ?? null} />
          <div class="mt-4">
            <Breadcrumbs
              pages={[
                {
                  name: props.data?.user?.name || "",
                  href: "../",
                  current: false,
                },
                {
                  name: "Image",
                  href: "#",
                  current: true,
                },
              ]}
            />
          </div>
          <img src={props.data?.imageUrl} class="w-full" alt="" />

          <form
            action={`/user/${props.params.uid}/image/${props.data?.id}`}
            method="POST"
          >
            <input type="hidden" name="_method" value="DELETE" />
            <button
              type="submit"
              class="flex items-center gap-1  text-gray-500 hover:text-red-500"
            >
              <IconTrash
                class="w-6 h-6"
                alt="Remove"
              />
              Remove this image
            </button>
          </form>
        </div>
      </body>
    </>
  );
}
