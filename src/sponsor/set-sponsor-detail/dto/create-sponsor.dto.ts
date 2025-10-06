// create-sponsor.dto.ts
export class CreateSponsorDto {
  name: string
  category?: string
  Pic_url?: string
  description?: string
  website?: string
  email?: string
  phone?: string
  linkedin?: string
  twitter?: string
  youtube?: string
  password?: string
}

// update-sponsor.dto.ts
export class UpdateSponsorDto {
  name?: string
  category?: string
  Pic_url?: string
  description?: string
  website?: string
  email?: string
  phone?: string
  linkedin?: string
  twitter?: string
  youtube?: string
  password?: string
}
