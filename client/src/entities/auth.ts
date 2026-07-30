export interface AuthUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface AuthSession {
  user: AuthUser;
  expires: string;
}

export interface CredentialsPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends CredentialsPayload {
  name: string;
}
