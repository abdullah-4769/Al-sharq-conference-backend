import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtService } from '../../lib/jwt/jwt.service';

@Injectable()
export class EventService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

async create(createEventDto: CreateEventDto) {
  const sponsorConnect = createEventDto.sponsors?.map(s => ({ id: s.id })) || [];
  const exhibitorConnect = createEventDto.exhibitors?.map(e => ({ id: e.id })) || [];

  // Step 1: Create event first (without token)
  const event = await this.prisma.event.create({
    data: {
      title: createEventDto.title,
      description: createEventDto.description,
      startTime: new Date(createEventDto.startTime),
      endTime: new Date(createEventDto.endTime),
      location: createEventDto.location,
      status: createEventDto.status,
      sponsors: { connect: sponsorConnect },
      exhibitors: { connect: exhibitorConnect },
    },
    include: { sponsors: true, exhibitors: true },
  });

  // Step 2: Generate token
  const start = new Date(event.startTime).getTime();
  const end = new Date(event.endTime).getTime();
  const now = Date.now();
  const expiresInSeconds = Math.max(Math.floor((end - now) / 1000), 0);

  const token = this.jwtService.sign(
    { eventId: event.id },
    { expiresIn: expiresInSeconds }
  );

  // Step 3: Save token into DB
  const updatedEvent = await this.prisma.event.update({
    where: { id: event.id },
    data: { joinToken: token },
    include: { sponsors: true, exhibitors: true },
  });

  // Step 4: Return updated event with token
  return updatedEvent;
}


  async findAll() {
    return this.prisma.event.findMany({
      include: { sponsors: true, exhibitors: true },
    });
  }

  async findOne(id: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { sponsors: true, exhibitors: true },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    await this.findOne(id);

    // Map relations for update
    const sponsorConnect = updateEventDto.sponsors?.map(s => ({ id: s.id })) || [];
    const exhibitorConnect = updateEventDto.exhibitors?.map(e => ({ id: e.id })) || [];

    const data: any = {
      ...updateEventDto,
      sponsors: sponsorConnect.length ? { set: sponsorConnect } : undefined,
      exhibitors: exhibitorConnect.length ? { set: exhibitorConnect } : undefined,
    };

    return this.prisma.event.update({
      where: { id },
      data,
      include: { sponsors: true, exhibitors: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.event.delete({ where: { id } });
  }

  async findPublished() {
    const events = await this.prisma.event.findMany({
      where: { status: 'published' },
      include: { sponsors: true, exhibitors: true },
    });

    return events.map(event => {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      const totalTimeInMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
      return { ...event, totalTimeInMinutes };
    });
  }
}
