import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { getUserBySession } from "🛠️/db.ts";
import { State, User } from "🛠️/types.ts";

import { Header } from "🧱/Header.tsx";

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

          <form action={`/memo`} method="POST" class="mt-16 flex flex-col">
            <div>
              <input
                class="w-full  px-3 py-2  border-1 rounded"
                type="text"
                name="title"
                value={yyyymmdd}
              />
            </div>
            <div>
              <textarea
                name="body"
                class="px-3 py-2 h-[32rem] w-full border-1 rounded"
              />
            </div>
            <input
              type="submit"
              value="Create"
              class="mt-1 inline-block cursor-pointer px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
            />
          </form>
        </div>
      </body>
    </>
  );
}
