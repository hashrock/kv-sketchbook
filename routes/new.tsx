import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { getUserBySession } from "🛠️/db.ts";
import { State, User } from "🛠️/types.ts";

import { Header } from "🧱/Header.tsx";
import Canvas from "../islands/canvas.tsx";
import { redirect } from "./util.ts";

interface Data {
  user: User | null;
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
  const yyyymmdd = new Date().toISOString().slice(0, 10);

  if (!user) return redirect("/");

  return (
    <>
      <Head>
        <title>
          New | KvMemo
        </title>
      </Head>
      <body class="bg-gray-100">
        <div class="px-4 py-8 mx-auto max-w-screen-md">
          <Header user={user} />
          <div class="mt-8">
            <Canvas uid={user?.id} />
          </div>
        </div>
      </body>
    </>
  );
}
