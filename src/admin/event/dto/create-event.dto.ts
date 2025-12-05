export class CreateEventDto {
  title: string
  description: string
  location: string
  googleMapLink?: string
  mapstatus?: boolean
    startTime?: Date
  endTime?: Date
  registrationOpen?: boolean
  sponsors?: { id: number }[]
  exhibitors?: { id: number }[]
}
