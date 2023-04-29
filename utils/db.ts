/**
 * This module implements the DB layer for the Tic Tac Toe game. It uses Deno's
 * key-value store to store data, and uses BroadcastChannel to perform real-time
 * synchronization between clients.
 */

import { Image, Memo, OauthSession, TimelineImage, User } from "./types.ts";

const kv = await Deno.openKv();

export async function getAndDeleteOauthSession(
  session: string
): Promise<OauthSession | null> {
  const res = await kv.get<OauthSession>(["oauth_sessions", session]);
  if (res.versionstamp === null) return null;
  await kv.delete(["oauth_sessions", session]);
  return res.value;
}

export async function setOauthSession(session: string, value: OauthSession) {
  await kv.set(["oauth_sessions", session], value);
}

export async function setUserWithSession(user: User, session: string) {
  await kv
    .atomic()
    .set(["users", user.id], user)
    .set(["users_by_login", user.login], user)
    .set(["users_by_session", session], user)
    .set(["users_by_last_signin", new Date().toISOString(), user.id], user)
    .commit();
}

export async function getUserBySession(session: string) {
  const res = await kv.get<User>(["users_by_session", session]);
  return res.value;
}

export async function getUserById(id: string) {
  const res = await kv.get<User>(["users", id]);
  return res.value;
}

export async function getUserByLogin(login: string) {
  const res = await kv.get<User>(["users_by_login", login]);
  return res.value;
}

export async function deleteSession(session: string) {
  await kv.delete(["users_by_session", session]);
}

export async function addImage(uid: string, data: File) {
  const myUUID = crypto.randomUUID();
  const id = new Date().getTime() + "-" + myUUID;
  const body = new Uint8Array(await data.arrayBuffer());
  const image: Image = {
    id,
    uid,
    data: body,
    type: data.type,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await kv.set(["images", uid, id], image);
}

export async function listGlobalTimelineImage(reverse = false) {
  const iter = await kv.list<TimelineImage>(
    { prefix: ["timeline"] },
    { reverse }
  );
  const images: TimelineImage[] = [];
  for await (const item of iter) {
    images.push(item.value);
  }
  return images;
}

export async function listImage(uid: string, reverse = false) {
  const iter = await kv.list<Image>({ prefix: ["images", uid] }, { reverse });
  const images: Image[] = [];
  for await (const item of iter) {
    images.push(item.value);
  }
  return images;
}

export async function getImage(uid: string, id: string) {
  const res = await kv.get<Image>(["images", uid, id]);
  return res.value;
}

export async function deleteImage(uid: string, id: string) {
  await kv.delete(["images", uid, id]);
}

export async function addMemo(uid: string, title: string, body: string) {
  const uuid = Math.random().toString(36).slice(2);
  const memo: Memo = {
    id: uuid,
    title,
    body,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await kv.set(["memos", uid, uuid], memo);
}

export async function listMemo(uid: string) {
  const iter = await kv.list<Memo>({ prefix: ["memos", uid] });
  const memos: Memo[] = [];
  for await (const item of iter) {
    memos.push(item.value);
  }
  return memos;
}

export async function getMemo(uid: string, id: string) {
  const res = await kv.get<Memo>(["memos", uid, id]);
  return res.value;
}

export async function updateMemo(
  uid: string,
  id: string,
  title: string,
  body: string
) {
  const memo = await getMemo(uid, id);
  if (!memo) throw new Error("memo not found");
  memo.title = title;
  memo.body = body;
  memo.updatedAt = new Date();
  await kv.set(["memos", uid, id], memo);
}

export async function deleteMemo(uid: string, id: string) {
  await kv.delete(["memos", uid, id]);
}

export async function listRecentlySignedInUsers(): Promise<User[]> {
  const users = [];
  const iter = kv.list<User>(
    { prefix: ["users_by_last_signin"] },
    {
      limit: 10,
      reverse: true,
    }
  );
  for await (const { value } of iter) {
    users.push(value);
  }
  return users;
}
