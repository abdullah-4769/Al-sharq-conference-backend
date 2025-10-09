import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';
type SocialMedia = { name: string; website: string };
type Contact = { name: string; email: string | null; phone: string | null };

@Injectable()
export class SponsorService {
  constructor(private readonly prisma: PrismaService) {}

async createSponsor(data: CreateSponsorDto) {
  return this.prisma.sponsor.create({ data })
}

  async getAllSponsors() {
    return this.prisma.sponsor.findMany();
  }

  async getSponsorById(id: number) {
    const sponsor = await this.prisma.sponsor.findUnique({ where: { id } });
    if (!sponsor) throw new NotFoundException('Sponsor not found');
    return sponsor;
  }

async updateSponsor(id: number, data: UpdateSponsorDto) {
  await this.getSponsorById(id)
  return this.prisma.sponsor.update({ where: { id }, data })
}

  async deleteSponsor(id: number) {
    await this.getSponsorById(id); 
    return this.prisma.sponsor.delete({ where: { id } });
  }


async getSponsorWithDetails(id: number) {
  const sponsor = await this.prisma.sponsor.findUnique({
    where: { id },
    include: {
      products: true,
      representatives: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!sponsor) throw new NotFoundException('Sponsor not found');


  const socialMedia: SocialMedia[] = [];
  const contacts: Contact[] = [];

  if (sponsor.linkedin) socialMedia.push({ name: 'LinkedIn', website: sponsor.linkedin });
  if (sponsor.twitter) socialMedia.push({ name: 'Twitter', website: sponsor.twitter });
  if (sponsor.youtube) socialMedia.push({ name: 'YouTube', website: sponsor.youtube });

  if (sponsor.website) {
    contacts.push({
      name: sponsor.website,
      email: sponsor.email || null,
      phone: sponsor.phone || null,
    });
  }

  return {
    id: sponsor.id,
    name: sponsor.name,
    
    pic_url: sponsor.Pic_url,
    description: sponsor.description,
    createdAt: sponsor.createdAt,
    updatedAt: sponsor.updatedAt,
    socialMedia,
    contacts,
    products: sponsor.products,
    representatives: sponsor.representatives.map(rep => ({
      id: rep.id,
      userId: rep.userId,
      displayTitle: rep.displayTitle,
      sponsorId: rep.sponsorId,
      createdAt: rep.createdAt,
      updatedAt: rep.updatedAt,
      user: rep.user,
    })),
  };
}

// session.service.ts
async findSessionsBySponsor(sponsorId: number) {
  const now = new Date()

  const sessions = await this.prisma.session.findMany({
    where: {
      event: {
        sponsors: {
          some: { id: sponsorId }
        }
      }
    },
    include: {
      speakers: {
        include: {
          user: {
            select: {
              name: true,
              file: true
            }
          }
        }
      }
    }
  })

  const total = sessions.length
  const ongoing = sessions.filter(s => s.startTime <= now && s.endTime >= now).length
  const scheduled = sessions.filter(s => s.startTime > now).length

  const formattedSessions = sessions.map(session => ({
    ...session,
    speakers: session.speakers.map(sp => sp.user)
  }))

  return { total, ongoing, scheduled, sessions: formattedSessions }
}

async getSponsorsShortInfo() {
  // fetch only needed fields
  const sponsors = await this.prisma.sponsor.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      Pic_url: true
    }
  })

  return sponsors
}


}
