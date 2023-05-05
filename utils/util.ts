export function redirect(location = "/") {
  const headers = new Headers();
  headers.set("location", location);
  return new Response(null, {
    status: 303,
    headers,
  });
}
export function isAdmin(userId: string) {
  const adminIds = Deno.env.get("ADMIN_USER_ID")?.split(",") ?? [];
  return adminIds.includes(userId);
}
