export class CreateEventRegistrationDto {
  userId?: number; // optional for guest registration
  name: string;
  email: string;
  eventId: number;
}
