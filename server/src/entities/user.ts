export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  avatarColor: string;
  providers: string[];
}
