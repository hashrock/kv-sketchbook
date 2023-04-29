import { Handlers } from "$fresh/server.ts";
import { addImage, getUserBySession, listImage } from "🛠️/db.ts";
import { Image, State, User } from "🛠️/types.ts";
import { PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { Header } from "🧱/Header.tsx";
import { APP_NAME } from "🛠️/const.ts";
import { CreateOrLogin } from "🧱/Cta.tsx";
import { redirect } from "🛠️/util.ts";
import { Gallery } from "🧱/Gallery.tsx";
import { Breadcrumbs } from "../../../components/Breadcrumbs.tsx";

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

export default function Home(props: PageProps<Data>) {
  return (
    <>
      <Head>
        <title>{props.data?.user?.name} | {APP_NAME}</title>
      </Head>

      <Header user={props.data?.user ?? null} />

      <div class="mt-4">
        <Breadcrumbs
          pages={[
            {
              name: props.data?.user?.name || "",
              href: "#",
              current: true,
            },
          ]}
        />
      </div>
      <CreateOrLogin user={props.data?.user ?? null} />

      <Gallery
        images={props.data?.images ?? []}
        uid={props.data?.user?.id ?? ""}
      />
    </>
  );
}
