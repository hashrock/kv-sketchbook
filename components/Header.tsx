import { User } from "🛠️/types.ts";
import { UserNameHorizontal } from "./User.tsx";
import { CreateOrLogin } from "./Cta.tsx";
import { isAdmin } from "🛠️/util.ts";

const linkClass = "text-sm text-blue-500 hover:underline";

export function Header(props: { user: User | null; hideNew?: boolean }) {
  return (
    <>
      <div class="flex flex-col sm:flex-row justify-between items-center">
        <a href="/" class="hover:text-gray-700">
          <h1 class="text-4xl font-bold">KV SketchBook</h1>
        </a>

        <div class="flex items-center gap-4">
          {props.user
            ? (
              <>
                <a href={`/user/${props.user.id}`}>
                  <img
                    src={props.user.avatarUrl}
                    class="w-10 h-10 rounded-full"
                    alt=""
                  />
                </a>
                <p class="text-sm text-gray-600">
                  <UserNameHorizontal user={props.user} />
                  {isAdmin(props.user?.id || "") && (
                    <span class="text-red-500">(Admin)</span>
                  )}
                </p>

                <a class={linkClass} href="/auth/signout">
                  Log out
                </a>
              </>
            )
            : (
              <>
                <a class={linkClass} href="/auth/signin">
                  Log in
                </a>
              </>
            )}
        </div>
      </div>
      <CreateOrLogin user={props.user} hideNew={props.hideNew} />
    </>
  );
}
