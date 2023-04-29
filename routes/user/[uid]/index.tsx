import { Handlers } from "$fresh/server.ts";
import { getUserById, getUserBySession, listImage } from "🛠️/db.ts";
import { Image, State, User } from "🛠️/types.ts";
import { PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { Header } from "🧱/Header.tsx";
import { APP_NAME } from "🛠️/const.ts";
import { Gallery } from "🧱/Gallery.tsx";
import { Breadcrumbs } from "../../../components/Breadcrumbs.tsx";

interface Data {
  images: Image[];
  user: User | null;
  pageUser: User;
}

export const handler: Handlers<Data, State> = {
  async GET(req, ctx) {
    const images = await listImage(ctx.params.uid, true);
    const pageUser = await getUserById(ctx.params.uid);
    if (!pageUser) return new Response("Not Found", { status: 404 });

    if (!ctx.state.session) return ctx.render({ user: null, images, pageUser });
    const user = await getUserBySession(ctx.state.session);

    if (!user) return ctx.render({ user: null, images, pageUser });
    return ctx.render({ user, images, pageUser });
  },
};

export default function Home(props: PageProps<Data>) {
  const loginUser = props.data.user ?? null;
  const pageUser = props.data.pageUser;

  return (
    <>
      <Head>
        <title>{pageUser.name} | {APP_NAME}</title>
      </Head>

      <Header user={loginUser ?? null} />

      <div class="mt-4">
        <Breadcrumbs
          pages={[
            {
              name: pageUser.name || "",
              href: "#",
              current: true,
            },
          ]}
        />
      </div>

      <div class="text-4xl mt-8 flex justify-center items-center gap-x-4">
        <img class="rounded-full w-24 h-24" src={pageUser.avatarUrl} alt="" />
        <div>{pageUser.name}</div>
      </div>

      <Gallery
        images={props.data.images ?? []}
        uid={pageUser.id ?? ""}
      />
    </>
  );
}
