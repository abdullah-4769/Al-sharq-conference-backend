export class CreateCommentDto {
  forumId: number
  userId: number
  content: string
  parentCommentId?: number
}
