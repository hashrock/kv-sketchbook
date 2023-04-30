import { Image, TimelineImage } from "🛠️/types.ts";

export function Gallery(props: { images: Image[]; uid: string }) {
  return (
    <div class="flex flex-wrap gap-8 justify-between">
      {props.images.map((image) => {
        const url = `/api/image/${props.uid}/${image.id}`;
        return (
          <a href={`/user/${props.uid}/image/${image.id}`}>
            <div class="flex flex-col items-end gap-2">
              <img
                class="mt-8 bg-white rounded shadow hover:shadow-lg transition-shadow"
                src={url}
                width="350"
              />
            </div>
          </a>
        );
      })}
    </div>
  );
}

export function Timeline(props: { images: TimelineImage[] }) {
  return (
    <div class="flex flex-wrap gap-8 justify-between">
      {props.images.map((image) => (
        <li class="flex flex-col items-end gap-2">
          <a href={`/user/${image.uid}/image/${image.id}`}>
            <img
              width={220}
              class="mt-8 bg-white rounded shadow hover:shadow-lg transition-shadow"
              src={`/api/image/${image.uid}/${image.id}`}
            />
          </a>
          <div>
            <a class="text-sm hover:underline" href={`/user/${image.uid}`}>
              <img
                src={image.avatarUrl}
                class="w-5 h-5 rounded-full inline-block mr-1"
                alt=""
              />
              {image.userName}
            </a>
          </div>
        </li>
      ))}
    </div>
  );
}
