import { Injectable } from '@nestjs/common'
import { CommentsRepository } from './comments.repository'
import { CreateCommentDto } from './dto/create-comment.dto'
import { UpdateCommentDto } from './dto/update-comment.dto'

@Injectable()
export class CommentsService {
  constructor(private commentsRepo: CommentsRepository) {}

  createComment(dto: CreateCommentDto) {
    return this.commentsRepo.createComment(dto)
  }

  updateComment(id: number, dto: UpdateCommentDto) {
    return this.commentsRepo.updateComment(id, dto.content)
  }

  deleteComment(id: number) {
    return this.commentsRepo.deleteComment(id)
  }

  getComments(forumId: number) {
    return this.commentsRepo.getForumWithComments(forumId)
  }
}
