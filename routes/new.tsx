import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { getUserBySession } from "🛠️/db.ts";
import { State, User } from "🛠️/types.ts";

import { Header } from "🧱/Header.tsx";
import Canvas from "../islands/canvas.tsx";
import { Breadcrumbs } from "../components/Breadcrumbs.tsx";
import { APP_NAME } from "../utils/const.ts";

interface Data {
  user: User;
}
export const handler: Handlers<Data, State> = {
  async GET(_, ctx) {
    const user = await getUserBySession(ctx.state.session ?? "");
    if (!user) return ctx.renderNotFound();
    return ctx.render({ user });
  },
};

export default function Home(props: PageProps<Data>) {
  const { user } = props.data;

  return (
    <>
      <Head>
        <title>
          New | {APP_NAME}
        </title>
      </Head>
      <Header user={user} />
      <div class="mt-4">
        <Breadcrumbs
          pages={[
            {
              name: "New",
              href: "/new",
              current: true,
            },
          ]}
        />
      </div>
      <div class="mt-8">
        <Canvas uid={user?.id || ""} />
      </div>
    </>
  );
}
