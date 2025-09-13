import { Injectable } from '@nestjs/common';

@Injectable()
export class LiveService {
  private sessions: Record<string, Set<string>> = {}; // sessionId -> set of userIds

  addParticipant(sessionId: string, userId: string, socketId: string) {
    if (!this.sessions[sessionId]) this.sessions[sessionId] = new Set();
    this.sessions[sessionId].add(userId);
  }

  removeParticipant(sessionId: string, userId: string) {
    this.sessions[sessionId]?.delete(userId);
  }

  getParticipants(sessionId: string) {
    return Array.from(this.sessions[sessionId] || []);
  }
}
