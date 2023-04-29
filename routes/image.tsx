import { HandlerContext, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import IconTrash from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/trash.tsx";
import { Image, Memo, State, User } from "🛠️/types.ts";
import {
  getUserBySession,
  listImage,
  listMemo,
  listRecentlySignedInUsers,
} from "🛠️/db.ts";

import { ButtonLink } from "🧱/Button.tsx";
import { Header } from "🧱/Header.tsx";
import { JSX } from "preact";
import Canvas from "../islands/canvas.tsx";

type Data = SignedInData | null;

interface SignedInData {
  user: User;
  users: User[];
  memos: Memo[];
  images: Image[];
}

export async function handler(req: Request, ctx: HandlerContext<Data, State>) {
  if (!ctx.state.session) return ctx.render(null);

  const [user, users] = await Promise.all([
    getUserBySession(ctx.state.session),
    listRecentlySignedInUsers(),
  ]);
  if (!user) return ctx.render(null);

  const memos = await listMemo(user.id);
  const images = await listImage(true);

  return ctx.render({ user, users, memos, images });
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
          <div class="mt-8">
            <Canvas />
          </div>

          <div class="flex flex-wrap gap-8 justify-between">
            {props.data?.images.map((image) => {
              const url = `/image/${image.id}`;
              return (
                <div class="flex flex-col items-end gap-2">
                  <img
                    class="mt-8 bg-white rounded shadow"
                    src={url}
                    alt={image?.name}
                    width="200"
                  />
                  <form action={`/image/${image.id}`} method="POST">
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

function LinkButton(
  props: JSX.HTMLAttributes<HTMLAnchorElement>,
) {
  return (
    <a
      {...props}
      class={`inline-block cursor-pointer px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 ${
        props.class ?? ""
      }`}
    />
  );
}

function SignedIn(props: SignedInData) {
  return (
    <>
      <div class="">
        <div class="mt-16 flex justify-end">
          <LinkButton href="/new">
            Create New
          </LinkButton>
        </div>
        <ul class="space-y-3 mt-8">
          {props.memos.map((memo) => {
            return (
              <li>
                <a
                  class="block bg-white py-6 px-8 shadow rounded hover:shadow-lg transition duration-200 border-l-8 border-gray-400"
                  href={`/memo/${memo?.id}`}
                >
                  <h2 class="text-lg">
                    {memo?.title}
                  </h2>

                  <p class="text-sm text-gray-500">
                    {memo?.body}
                  </p>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

function SignedOut() {
  return (
    <>
      <p class="my-6">
        <ButtonLink href="/auth/signin">
          Log in with GitHub
        </ButtonLink>
      </p>
    </>
  );
}
