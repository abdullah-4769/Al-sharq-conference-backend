import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtService } from '../../lib/jwt/jwt.service';
import { randomBytes } from 'crypto';
@Injectable()
export class EventService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService, // Inject custom JWT service
  ) {}

async create(createEventDto: CreateEventDto) {
  // Create the conference
  const event = await this.prisma.event.create({
    data: createEventDto,
  });

  // Calculate expiry in seconds based on conference start and end
  const start = new Date(event.startTime).getTime();
  const end = new Date(event.endTime).getTime();
  const now = Date.now();

  // If conference has already started, token expires at end
  const expiresInSeconds = Math.max(Math.floor((end - now) / 1000), 0);

  // Generate JWT token valid only until end of conference
  const token = this.jwtService.sign(
    { eventId: event.id },
    { expiresIn: expiresInSeconds }
  );

  return {
    ...event,
    joinToken: token, // return token to admin
  };
}


  async findAll() {
    return this.prisma.event.findMany();
  }

  async findOne(id: number) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    await this.findOne(id);
    return this.prisma.event.update({
      where: { id },
      data: updateEventDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.event.delete({ where: { id } });
  }

  async findPublished() {
    const events = await this.prisma.event.findMany({
      where: { status: 'published' },
    });

    return events.map(event => {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      const totalTimeInMinutes = Math.round((end.getTime() - start.getTime()) / 60000);

      return { ...event, totalTimeInMinutes };
    });
  }
}
