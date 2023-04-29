import { HandlerContext, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

import { Memo, State, TimelineImage, User } from "🛠️/types.ts";
import {
  getUserBySession,
  listGlobalTimelineImage,
  listMemo,
  listRecentlySignedInUsers,
} from "🛠️/db.ts";

import { Button, ButtonLink } from "🧱/Button.tsx";
import { Header } from "🧱/Header.tsx";
import { JSX } from "preact";

type Data = SignedInData | null;

interface SignedInData {
  user: User;
  users: User[];
  images: TimelineImage[];
}

export async function handler(req: Request, ctx: HandlerContext<Data, State>) {
  if (!ctx.state.session) return ctx.render(null);

  const [user, users] = await Promise.all([
    getUserBySession(ctx.state.session),
    listRecentlySignedInUsers(),
  ]);
  if (!user) return ctx.render(null);

  const images = await listGlobalTimelineImage(true);

  return ctx.render({ user, users, images });
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
          {props.data ? <SignedIn {...props.data} /> : <SignedOut />}
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
          <LinkButton href={`/user/${props.user.id}`}>
            Create New
          </LinkButton>
        </div>

        <ul class="space-y-3 mt-8">
          {props.images.map((image) => (
            <li class="flex flex-col items-end gap-2">
              <a href={`/user/${image.uid}/image/${image.id}`}>
                <img
                  class="mt-8 bg-white rounded shadow"
                  src={`/api/image/${image.uid}/${image.id}`}
                />
              </a>
              <div>{image.createdAt}</div>
              <div>{image.userName}</div>
            </li>
          ))}
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
