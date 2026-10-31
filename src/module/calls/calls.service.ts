import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { PrismaService } from '../../prisma/prisma.service.js';
import { LiveKitService } from './livekit.service.js';
import { CallsGateway } from './calls.gateway.js';

export type CallRecord = {
  id: string;
  callerId: number;
  calleeId: number;
  room: string;
  status: string;
  createdAt: Date;
};

const RINGING = 'ringing';
const ACTIVE = 'active';
const ENDED = 'ended';

/**
 * Стан дзвінків зберігається в БД Gateway (модель Call),
 * realtime-події — через CallsGateway (socket.io),
 * медіа — напряму між клієнтами та LiveKit-сервером.
 */
@Injectable()
export class CallsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly livekit: LiveKitService,
    private readonly callsGateway: CallsGateway,
  ) {}

  public async start(
    callerId: number,
    calleeId: number,
    chatId: number | null = null,
  ): Promise<{ call: CallRecord; token: string; livekitUrl: string }> {
    if (callerId === calleeId) {
      throw new BadRequestException('Не можна дзвонити самому собі');
    }

    if (!this.callsGateway.isOnline(calleeId)) {
      throw new NotFoundException('Користувач не в мережі');
    }

    const ringingCall = await this.prisma.call.findFirst({
      where: { callerId, calleeId, status: RINGING },
      orderBy: { createdAt: 'desc' },
    });

    if (ringingCall) {
      return this.buildStartPayload(ringingCall);
    }

    const room = `call-${randomUUID()}`;

    const call = await this.prisma.call.create({
      data: { callerId, calleeId, room, status: RINGING },
    });

    this.callsGateway.notify(calleeId, 'call:incoming', {
      callId: call.id,
      callerId,
      chatId,
    });

    return this.buildStartPayload(call);
  }

  public async accept(
    callId: string,
    userId: number,
  ): Promise<{ token: string; livekitUrl: string }> {
    const call = await this.mustGetCall(callId);

    if (call.calleeId !== userId) {
      throw new ForbiddenException('Дзвінок не для цього користувача');
    }

    if (call.status === ENDED) {
      throw new BadRequestException('Дзвінок вже завершено');
    }

    if (call.status === ACTIVE) {
      // Повторно приймати не можна — віддаємо токен без оновлення стану
      return this.buildJoinPayload(call.room, userId);
    }

    await this.prisma.call.update({
      where: { id: call.id },
      data: { status: ACTIVE },
    });

    this.callsGateway.notify(call.callerId, 'call:accepted', { callId: call.id });

    return this.buildJoinPayload(call.room, userId);
  }

  public async reject(callId: string, userId: number): Promise<void> {
    const call = await this.mustGetCall(callId);

    if (call.calleeId !== userId) {
      throw new ForbiddenException('Дзвінок не для цього користувача');
    }

    if (call.status === ENDED) {
      return;
    }

    await this.prisma.call.update({
      where: { id: call.id },
      data: { status: ENDED },
    });

    this.callsGateway.notify(call.callerId, 'call:rejected', { callId: call.id });
    await this.livekit.deleteRoom(call.room);
  }

  public async cancel(callId: string, userId: number): Promise<void> {
    const call = await this.mustGetCall(callId);

    if (call.callerId !== userId) {
      throw new ForbiddenException('Завершує тільки ініціатор');
    }

    if (call.status === ENDED) {
      return;
    }

    await this.prisma.call.update({
      where: { id: call.id },
      data: { status: ENDED },
    });

    if (call.status === RINGING) {
      this.callsGateway.notify(call.calleeId, 'call:cancelled', { callId: call.id });
    } else {
      this.callsGateway.notify(call.calleeId, 'call:ended', { callId: call.id });
    }

    await this.livekit.deleteRoom(call.room);
  }

  public async hangUp(callId: string, userId: number): Promise<void> {
    const call = await this.mustGetCall(callId);

    if (call.callerId !== userId && call.calleeId !== userId) {
      throw new ForbiddenException('Ти не учасник цього дзвінка');
    }

    if (call.status === ENDED) {
      return;
    }

    await this.prisma.call.update({
      where: { id: call.id },
      data: { status: ENDED },
    });

    const otherUserId =
      call.callerId === userId ? call.calleeId : call.callerId;

    this.callsGateway.notify(otherUserId, 'call:ended', { callId: call.id });
    await this.livekit.deleteRoom(call.room);
  }

  public async listActive(userId: number) {
    return this.prisma.call.findMany({
      where: {
        OR: [
          { calleeId: userId, status: RINGING },
          { callerId: userId, status: RINGING },
          { calleeId: userId, status: ACTIVE },
          { callerId: userId, status: ACTIVE },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async mustGetCall(callId: string) {
    const call = await this.prisma.call.findUnique({ where: { id: callId } });

    if (!call) {
      throw new NotFoundException('Дзвінок не знайдено');
    }

    return call;
  }

  private async buildStartPayload(call: {
    id: string;
    callerId: number;
    calleeId: number;
    room: string;
    status: string;
    createdAt: Date;
  }) {
    const token = await this.livekit.createJoinToken(call.room, call.callerId);

    return {
      call: {
        id: call.id,
        callerId: call.callerId,
        calleeId: call.calleeId,
        room: call.room,
        status: call.status,
        createdAt: call.createdAt,
      },
      token,
      livekitUrl: this.livekit.getPublicUrl(),
    };
  }

  private async buildJoinPayload(room: string, userId: number) {
    const token = await this.livekit.createJoinToken(room, userId);

    return { token, livekitUrl: this.livekit.getPublicUrl() };
  }
}
