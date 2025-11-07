import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { CreateSessionForumDto } from './dto/create-session-forum.dto';
import { UpdateSessionForumDto } from './dto/update-session-forum.dto';

@Injectable()
export class SessionForumService {
  constructor(private prisma: PrismaService) {}

async create(createForumDto: CreateSessionForumDto) {
  if (!createForumDto.sessionId || !createForumDto.userId) {
    throw new BadRequestException('sessionId and userId are required');
  }

  const forbiddenWords = [
    'badword1', 'badword2', // replace with actual words
    'politics', 'party',    // political terms
    'attack', 'insult'      // personal attacks
  ];

  const contentToCheck = (createForumDto.title + ' ' + createForumDto.content).toLowerCase();

  const foundWord = forbiddenWords.find(word => contentToCheck.includes(word));
  if (foundWord) {
    throw new BadRequestException('Forum contains inappropriate content');
  }

  try {
    return await this.prisma.sessionForum.create({
      data: createForumDto,
    });
  } catch (error) {
    throw new InternalServerErrorException('Failed to create forum');
  }
}


  async findAll() {
    try {
      return await this.prisma.sessionForum.findMany();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch forums');
    }
  }

  async findOne(id: number) {
    if (!id) throw new BadRequestException('Forum ID is required');
    try {
      const forum = await this.prisma.sessionForum.findUnique({
        where: { id },
      });
      if (!forum) throw new NotFoundException('Forum not found');
      return forum;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch forum');
    }
  }

  async update(id: number, updateForumDto: UpdateSessionForumDto) {
    if (!id) throw new BadRequestException('Forum ID is required');
    try {
      await this.findOne(id);
      return await this.prisma.sessionForum.update({
        where: { id },
        data: updateForumDto,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to update forum');
    }
  }

  async remove(id: number) {
    if (!id) throw new BadRequestException('Forum ID is required');
    try {
      await this.findOne(id);
      await this.prisma.sessionForum.delete({ where: { id } });
      return { message: 'Forum deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete forum');
    }
  }

  async findBySession(sessionId: number) {
    if (!sessionId) throw new BadRequestException('Session ID is required');
    try {
      const session = await this.prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          forums: {
            include: {
              user: { select: { id: true, name: true, file: true } },
              comments: { select: { userId: true, id: true } },
            },
          },
        },
      });

      if (!session) throw new NotFoundException('Session not found');

      return {
        id: session.id,
        title: session.title,
        tags: session.tags,
        forums: session.forums.map(forum => {
          const totalComments = forum.comments.length;
          const totalUsers = new Set(forum.comments.map(c => c.userId)).size;

          return {
            forumId: forum.id,
            title: forum.title,
            content: forum.content,
            status: forum.status,
              tag: forum.tag,
            totalComments,
            totalUsers,
            creator: forum.user,
          };
        }),
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch session forums');
    }
  }

async changeStatus(id: number, status: 'APPROVED' | 'REJECTED') {
  const forum = await this.findOne(id);

  if (status === 'REJECTED') {
    await this.prisma.sessionForum.delete({ where: { id } });
    return { message: 'Forum rejected and deleted successfully' };
  }

  return await this.prisma.sessionForum.update({
    where: { id },
    data: { status },
  });
}



}
