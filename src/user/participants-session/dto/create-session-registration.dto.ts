export class CreateSessionRegistrationDto {
  userId: number
  eventId?: number
  sessionId: number
  name?: string
  organization?: string
  email?: string
  whyWantToJoin?: string
  relevantExperience?: string
}
