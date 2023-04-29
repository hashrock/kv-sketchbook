export interface State {
  session: string | undefined;
}

export interface User {
  id: string;
  login: string;
  name: string;
  avatarUrl: string;
  memos?: string[];
}

export interface Memo {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Image {
  id: string;
  uid: string;
  data: Uint8Array;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimelineImage {
  id: string;
  uid: string;
  userName: string;
  createdAt: Date;
  avatarUrl: string;
}

export interface OauthSession {
  state: string;
  codeVerifier: string;
}
