export function redirect(location = "/") {
  const headers = new Headers();
  headers.set("location", location);
  return new Response(null, {
    status: 303,
    headers,
  });
}
export function isAdmin(userId: string) {
  return Deno.env.get("ADMIN_USER_ID") === userId;
}
