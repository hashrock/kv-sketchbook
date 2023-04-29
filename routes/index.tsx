import { HandlerContext, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

import { State, TimelineImage, User } from "🛠️/types.ts";
import { getUserBySession, listGlobalTimelineImage } from "🛠️/db.ts";
import { CreateOrLogin } from "🧱/Cta.tsx";

import { Header } from "🧱/Header.tsx";
import { APP_NAME } from "./const.ts";
import { Timeline } from "🧱/Gallery.tsx";

interface Data {
  user: User | null;
  images: TimelineImage[];
}

export async function handler(req: Request, ctx: HandlerContext<Data, State>) {
  const images = await listGlobalTimelineImage(true);

  if (!ctx.state.session) {
    return ctx.render({ user: null, images });
  }
  const user = await getUserBySession(ctx.state.session);
  if (!user) {
    return ctx.render({ user: null, images });
  }

  return ctx.render({ user, images });
}

export default function Home(props: PageProps<Data>) {
  return (
    <>
      <Head>
        <title>{APP_NAME}</title>
      </Head>
      <body class="bg-gray-100">
        <div class="px-4 py-8 mx-auto max-w-screen-md">
          <Header user={props.data?.user ?? null} />
          <SignedIn {...props.data} />
        </div>
      </body>
    </>
  );
}

function SignedIn(props: Data) {
  return (
    <>
      <div class="">
        <CreateOrLogin user={props.user} />

        <Timeline images={props.images} />
      </div>
    </>
  );
}
