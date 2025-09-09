import { UpdateProfileDto } from '../dto/update-profile.dto';

export interface IProfileService {
  getProfile(userId: number, requesterId: number, requesterRole: string): Promise<any>;
  updateProfile(userId: number, data: UpdateProfileDto, requesterId: number, requesterRole: string): Promise<any>;

  // Admin-only methods now require requesterRole
  getAllProfiles(requesterRole: string): Promise<any[]>;
  updateAnyProfile(userId: number, data: UpdateProfileDto, requesterRole: string): Promise<any>;
}
