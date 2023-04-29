import { AppProps } from "$fresh/server.ts";

export default function App({ Component }: AppProps) {
  return (
    <body class="bg-gray-100">
      <div class="px-4 pt-8 mx-auto max-w-screen-md">
        <Component />
      </div>
      <div class="bg-gray-800 mt-24 py-8 text-white text-center">
        KV Sketch by hashrock
      </div>
    </body>
  );
}
