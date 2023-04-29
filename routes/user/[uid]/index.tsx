import { Handlers } from "$fresh/server.ts";
import { addImage, getUserBySession, listImage } from "🛠️/db.ts";
import { Image, State, User } from "🛠️/types.ts";
import { PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import IconTrash from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/trash.tsx";
import { Header } from "🧱/Header.tsx";
import Canvas from "../../../islands/canvas.tsx";
import { APP_NAME } from "../../const.ts";

type Data = SignedInData | null;
interface SignedInData {
  images: Image[];
  user: User | null;
}

export const handler: Handlers<Data, State> = {
  async GET(req, ctx) {
    const images = await listImage(ctx.params.uid, true);
    if (!ctx.state.session) return ctx.render({ user: null, images });
    const user = await getUserBySession(ctx.state.session);

    if (!user) return ctx.render({ user: null, images });
    return ctx.render({ user, images });
  },

  async POST(req, ctx) {
    const user = await getUserBySession(ctx.state.session ?? "");
    const form = await req.formData();

    const file = form.get("image") as File | null;

    if (user === null) {
      return new Response("Unauthorized", { status: 401 });
    }
    if (user.id !== ctx.params.uid) {
      return new Response("Unauthorized", { status: 401 });
    }
    if (!file) {
      return new Response("Bad Request", { status: 400 });
    }
    const reader = file.stream().getReader();
    const result = await reader.read();
    const bytes = result.value;
    if (!bytes) {
      return new Response("Bad Request", { status: 400 });
    }
    addImage(user.id, file);
    return redirect(`/image/${user.id}`);
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

export default function Home(props: PageProps<Data>) {
  return (
    <>
      <Head>
        <title>{props.data?.user?.name} | {APP_NAME}</title>
      </Head>
      <body class="bg-gray-100">
        <div class="px-4 py-8 mx-auto max-w-screen-md">
          <Header user={props.data?.user ?? null} />
          <div class="mt-8">
            <Canvas />
          </div>

          <div class="flex flex-wrap gap-8 justify-between">
            {props.data?.images.map((image) => {
              const url = `/api/image/${props.data?.user?.id}/${image.id}`;
              return (
                <div class="flex flex-col items-end gap-2">
                  <img
                    class="mt-8 bg-white rounded shadow"
                    src={url}
                    width="200"
                  />
                  <form
                    action={`/user/${props.params.uid}/image/${image.id}`}
                    method="POST"
                  >
                    <input type="hidden" name="_method" value="DELETE" />
                    <button type="submit">
                      <IconTrash
                        class="w-6 h-6 text-gray-500 hover:text-red-500"
                        alt="Remove"
                      />
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        </div>
      </body>
    </>
  );
}
