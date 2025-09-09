export class CreateBoothDto {
  exhibitorId: number;
  boothNumber: string;
  boothLocation: string;
  mapLink?: string;
  distance?: number;
  openTime?: string;
}
