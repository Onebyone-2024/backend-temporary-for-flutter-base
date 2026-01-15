import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';

/**
 * WebSocket Gateway for Real-time Location Tracking
 *
 * Flow:
 * 1. Frontend (Planner Web) connects to WebSocket
 * 2. Frontend emits 'join_job_tracking' with jobId
 * 3. Frontend joins room: `tracking_{jobId}`
 * 4. Backend (TrackingService) emits 'location_update' to room
 * 5. All clients in room get location update
 *
 * Usage:
 * - Frontend connects: io('http://backend-url')
 * - Subscribe to job: socket.emit('join_job_tracking', {jobId})
 * - Listen: socket.on('location_update', (data) => {...})
 */

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class TrackingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TrackingGateway.name);

  constructor() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`✓ Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`✗ Client disconnected: ${client.id}`);
  }

  /**
   * Event: join_job_tracking
   * Frontend emits this to subscribe to a specific job's location updates
   *
   * @param client Socket client
   * @param data {jobId: string}
   * Example: socket.emit('join_job_tracking', {jobId: '1a8b75e0-2700-4dc8-9716-3c37b8885372'})
   */
  @SubscribeMessage('join_job_tracking')
  handleJoinJobTracking(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { jobId: string },
  ) {
    const roomName = `tracking_${data.jobId}`;
    client.join(roomName);
    this.logger.log(`📍 Client ${client.id} joined room: ${roomName}`);

    // Send confirmation to client
    client.emit('joined_tracking', {
      jobId: data.jobId,
      message: `Successfully subscribed to job tracking: ${data.jobId}`,
    });
  }
}
