import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../lib/prisma/prisma.service';
import { UpdateBlockDto } from './dto/update-block.dto'

@Injectable()
export class UserManagementService {
  constructor(private prisma: PrismaService) {}

async getAllParticipants() {

  const users = await this.prisma.user.findMany({
    where: { role: "participant" }
  })

  const userIds = users.map(u => u.id)

  const totalParticipants = users.length


  const participants = await this.prisma.participant.findMany({
    where: { userId: { in: userIds } },
    include: { sessions: true }
  })

  const totalBookmarks = participants.reduce(
    (acc, p) => acc + (p.sessions?.length || 0),
    0
  )


  const totalSessionRegistrations = await this.prisma.sessionRegistration.count({
    where: { userId: { in: userIds } }
  })

  return {
    totalParticipants,
    totalBookmarks,
    totalSessionRegistrations,
    users
  }
}






  async blockUnblockParticipant(updateBlockDto: UpdateBlockDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: updateBlockDto.id },
    })

    if (!user) {
      throw new NotFoundException('Participant not found')
    }

    return this.prisma.user.update({
      where: { id: updateBlockDto.id },
      data: { isBlocked: updateBlockDto.isBlocked },
    })
  }

  async deleteParticipant(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new NotFoundException('Participant not found')
    }

    return this.prisma.user.delete({
      where: { id },
    })
  }



  async getDashboardSummary() {
    const now = new Date();
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(now.getDate() - 5);

    const countTotalRegistration = await this.prisma.user.count();
    const totalCheckin = await this.prisma.participant.count();
    const totalActiveSession = await this.prisma.session.count({
      where: { startTime: { lte: now }, endTime: { gte: now } }
    });
    const totalSpeaker = await this.prisma.speaker.count();
    const totalSponsor = await this.prisma.sponsor.count();
    const totalExhibitor = await this.prisma.exhibitor.count();
    const recentUsers = await this.prisma.user.findMany({
      where: { createdAt: { gte: fiveDaysAgo } },
      orderBy: { createdAt: 'desc' }
    });

    return {
      countTotalRegistration,
      totalCheckin,
      totalActiveSession,
      totalSpeaker,
      totalSponsor,
      totalExhibitor,
      recentUsers
    };
  }



  async getWeeklyAttendance() {
    const now = new Date();
    const dailyAttendance: { date: string; count: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(now.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const count = await this.prisma.sessionRegistration.count({
        where: {
          createdAt: { gte: dayStart, lte: dayEnd }
        }
      });

      dailyAttendance.push({
        date: dayStart.toISOString().split('T')[0],
        count
      });
    }

    const topSessions = await this.prisma.session.findMany({
      include: {
        _count: {
          select: { sessionRegistrations: true }
        },
        speakers: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: {
        sessionRegistrations: { _count: 'desc' }
      },
      take: 3
    });

    const topSessionsFormatted = topSessions.map(session => ({
      id: session.id,
      title: session.title,
      totalRegistrations: session._count.sessionRegistrations,
      speakers: session.speakers.map(s => s.user.name)
    }));

    return {
      dailyAttendance,
      topSessions: topSessionsFormatted
    };
  }



  async getUsersOnly() {
  return this.prisma.user.findMany()
}
 async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id }
    })

    if (!user) throw new NotFoundException('User not found')

    return user
  }

}
