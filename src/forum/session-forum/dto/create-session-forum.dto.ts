export class CreateSessionForumDto {
  sessionId: number;
  userId: number;
  title: string;
  content: string;
    tag?: string;
}
