import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { deleteImage, getUserById, getUserBySession } from "🛠️/db.ts";
import { State, User } from "🛠️/types.ts";
import IconTrash from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/trash.tsx";
import { Header } from "🧱/Header.tsx";
import { APP_NAME } from "🛠️/const.ts";
import { Breadcrumbs } from "🧱/Breadcrumbs.tsx";
import { Metas } from "🧱/Meta.tsx";
import { isAdmin } from "🛠️/util.ts";

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
    const pageUser = await getUserById(ctx.params.uid);
    if (!pageUser) {
      return new Response("Not Found", { status: 404 });
    }

    if (!ctx.state.session) {
      return ctx.render({
        loginUser: null,
        pageUser,
        id: ctx.params.id,
        imageUrl,
      });
    }
    const user = await getUserBySession(ctx.state.session);

    return ctx.render({
      loginUser: user,
      pageUser,
      id: ctx.params.id,
      imageUrl,
    });
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const method = form.get("_method")?.toString();
    const user = await getUserBySession(ctx.state.session ?? "");
    const admin = await isAdmin(user?.id ?? "");
    if (user === null) {
      return new Response("Unauthorized", { status: 401 });
    }
    if (!admin && (user.id !== ctx.params.uid)) {
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
interface Data {
  imageUrl: string;
  id: string;
  loginUser: User | null;
  pageUser: User;
}
export default function Home(props: PageProps<Data>) {
  const pageUser = props.data.pageUser;
  const loginUser = props.data.loginUser;
  const admin = isAdmin(props.data.loginUser?.id || "");
  return (
    <>
      <Head>
        <title>{pageUser.name}'s work | {APP_NAME}</title>
        <Metas
          name="KV Sketchbook"
          description="A simple sketchbook app using KV"
          image={"https://hashrock-kv-sketchbook.deno.dev" +
            props.data?.imageUrl}
          image_alt="KV Sketchbook"
          account="@hashedrock"
        />
      </Head>
      <Header user={loginUser ?? null} />
      <div class="mt-4">
        <Breadcrumbs
          pages={[
            {
              name: pageUser.name || "",
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
      <img
        src={props.data?.imageUrl}
        class="w-full bg-white rounded my-4"
        style="image-rendering: pixelated;"
        alt=""
      />
      <div class="text-xl mt-4 ">
        <a
          href="../"
          class="flex justify-end items-center gap-x-4 hover:underline"
        >
          <img class="rounded-full w-12 h-12" src={pageUser.avatarUrl} alt="" />
          <div>{pageUser.name}</div>
        </a>
      </div>
      {(admin || (pageUser.id === loginUser?.id)) &&
        (
          <form
            action={`/user/${props.params.uid}/image/${props.data?.id}`}
            method="POST"
            class="mt-8 flex justify-center"
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
        )}
    </>
  );
}
