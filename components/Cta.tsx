import { User } from "../utils/types.ts";
import { ButtonLink } from "🧱/Button.tsx";

export function CreateOrLogin(props: { user: User | null }) {
  return (
    <div class="mt-4 flex justify-end">
      {props.user
        ? (
          <ButtonLink href="/new">
            Start Drawing
          </ButtonLink>
        )
        : (
          <ButtonLink href="/auth/signin">
            Log in with GitHub
          </ButtonLink>
        )}
    </div>
  );
}
