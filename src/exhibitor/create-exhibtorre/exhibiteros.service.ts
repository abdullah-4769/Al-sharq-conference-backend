import { Injectable ,NotFoundException} from '@nestjs/common';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { Prisma, Exhibitor } from '@prisma/client';
interface SocialMedia {
  name: string;
  website: string;
}

interface Contact {
  name: string;
  email: string | null;
  phone: string | null;
}

@Injectable()
export class ExhibiterosService {
  constructor(private prisma: PrismaService) {}

  async createExhibitor(data: Prisma.ExhibitorCreateInput): Promise<Exhibitor> {
    return this.prisma.exhibitor.create({ data });
  }


  async getAllExhibitors(): Promise<Exhibitor[]> {
    return this.prisma.exhibitor.findMany({
      include: {
        products: true,
        representatives: true,
        booths: true,
      },
    });
  }


  async getExhibitorById(id: number): Promise<Exhibitor | null> {
    return this.prisma.exhibitor.findUnique({
      where: { id },
      include: {
        products: false,
        representatives: false,
        booths: false,
      },
    });
  }

async updateExhibitor(id: number, data: Prisma.ExhibitorUpdateInput): Promise<Exhibitor> {
    return this.prisma.exhibitor.update({
      where: { id },
      data,
    });
  }


  async deleteExhibitor(id: number): Promise<Exhibitor> {
    return this.prisma.exhibitor.delete({
      where: { id },
    });
  }


async getExhibitorWithDetails(id: number) {
  const exhibitor = await this.prisma.exhibitor.findUnique({
    where: { id },
    include: {
      products: true,
      representatives: { include: { user: true } },
      booths: true,
    },
  });

  if (!exhibitor) throw new NotFoundException('Exhibitor not found');

  // Explicitly type arrays
  const socialMedia: { name: string; website: string }[] = [];
  const contacts: { name: string; email: string | null; phone: string | null }[] = [];

  if (exhibitor.linkedin) socialMedia.push({ name: 'LinkedIn', website: exhibitor.linkedin });
  if (exhibitor.twitter) socialMedia.push({ name: 'Twitter', website: exhibitor.twitter });
  if (exhibitor.youtube) socialMedia.push({ name: 'YouTube', website: exhibitor.youtube });

  if (exhibitor.website) {
    contacts.push({
      name: exhibitor.website,
      email: exhibitor.email || null,
      phone: exhibitor.phone || null,
    });
  }

  return {
    id: exhibitor.id,
    name: exhibitor.name,
    picUrl: exhibitor.picUrl,
    description: exhibitor.description,
    location: exhibitor.location,
    website: exhibitor.website,
    email: exhibitor.email,
    phone: exhibitor.phone,
    socialMedia,
    contacts,
    products: exhibitor.products.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
    })),
    representatives: exhibitor.representatives.map(rep => ({
      id: rep.id,
      displayTitle: rep.displayTitle,
      user: {
        id: rep.user.id,
        name: rep.user.name,
        email: rep.user.email,
        phone: rep.user.phone,
        organization: rep.user.organization,
        photo: rep.user.photo,
      },
    })),
    booths: exhibitor.booths.map(b => ({
      id: b.id,
      boothNumber: b.boothNumber,
      boothLocation: b.boothLocation,
      mapLink: b.mapLink,
      distance: b.distance,
      openTime: b.openTime,
    })),
  };
}

async findSessionsByExhibitor(exhibitorId: number) {
  const now = new Date()

  const sessions = await this.prisma.session.findMany({
    where: {
      event: {
        exhibitors: {
          some: { id: exhibitorId }
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

 async getExhibitorsShortInfo() {
    const exhibitors = await this.prisma.exhibitor.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        picUrl: true,
      },
    });

    return exhibitors;
  }

}
