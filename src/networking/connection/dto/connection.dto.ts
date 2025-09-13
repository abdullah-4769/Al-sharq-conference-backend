import { IsEnum, IsInt } from 'class-validator';
import { ConnectionStatus } from '@prisma/client';

export class SendConnectionRequestDto {
  @IsInt()
  senderId: number;

  @IsInt()
  receiverId: number;
}

export class UpdateConnectionStatusDto {
  @IsEnum(ConnectionStatus)
  status: ConnectionStatus;
}
