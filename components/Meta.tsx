export function Metas(
  { name, description, image, image_alt, account }: {
    name: string;
    description: string;
    image: string;
    image_alt: string;
    account: string;
  },
) {
  return (
    <>
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={account} />
      <title>{name}</title>
      <meta
        name="twitter:title"
        content={description}
      />
      <meta
        property="og:title"
        content={description}
      />
      <meta
        property="og:description"
        content={description}
      />
      <meta
        name="twitter:description"
        content={description}
      />
      <meta
        name="description"
        content={description}
      />
      <meta name="twitter:creator" content={account} />
      <meta name="twitter:image" content={image} />
      <meta
        name="twitter:image:alt"
        content={image_alt}
      />
      <meta property="og:image" content={image} />
      <meta
        property="og:image:alt"
        content={image_alt}
      />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={name} />
      <meta property="og:locale" content="en_US" />
    </>
  );
}
