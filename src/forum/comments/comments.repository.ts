import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma/prisma.service';

interface CreateCommentDto {
  forumId: number;
  userId: number;
  content: string;
  parentCommentId?: number;
}

@Injectable()
export class CommentsRepository {
  constructor(private prisma: PrismaService) {}

  async createComment(data: CreateCommentDto) {
    try {
      return await this.prisma.forumComment.create({
        data,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create comment');
    }
  }

  async updateComment(id: number, content: string) {
    try {
      const existing = await this.prisma.forumComment.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`Comment with ID ${id} not found`);
      }

      return await this.prisma.forumComment.update({
        where: { id },
        data: { content },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update comment');
    }
  }

  async deleteComment(id: number) {
    try {
      const existing = await this.prisma.forumComment.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`Comment with ID ${id} not found`);
      }

      return await this.prisma.forumComment.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete comment');
    }
  }

async getForumWithComments(forumId: number) {
  try {
    const forum = await this.prisma.sessionForum.findUnique({
      where: { id: forumId },
      include: {
        user: { select: { id: true, name: true, role: true, file: true } },
        comments: {
          where: { parentCommentId: null },
          include: {
            user: { select: { id: true, name: true, role: true, file: true } },
            replies: {
              include: {
                user: { select: { id: true, name: true, role: true, file: true } },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!forum) {
      throw new NotFoundException(`Forum with ID ${forumId} not found`);
    }

    const totalComments = forum.comments.reduce(
      (sum, comment) => sum + 1 + comment.replies.length,
      0
    );

    const totalUsers = new Set(
      forum.comments.flatMap(c => [c.userId, ...c.replies.map(r => r.userId)])
    ).size;

    return {
      id: forum.id,
      sessionId: forum.sessionId,
      user: forum.user,
      title: forum.title,
      content: forum.content,
      tag: forum.tag, // note: `tags` is an array
      totalUsers,
      totalComments,
      comments: forum.comments,
    };
  } catch (error) {
    if (error instanceof NotFoundException) throw error;
    throw new InternalServerErrorException('Failed to fetch forum details');
  }
}


}
