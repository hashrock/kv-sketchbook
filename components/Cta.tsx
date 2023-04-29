import { User } from "../utils/types.ts";
import { ButtonLink } from "🧱/Button.tsx";

export function CreateOrLogin(props: { user: User | null }) {
  return (
    <div class="mt-16 flex justify-end">
      {props.user
        ? (
          <ButtonLink href="/new">
            Create New
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
