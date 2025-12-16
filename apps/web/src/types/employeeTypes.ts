import { type RequestStatus } from './sharedTypes';

export interface AssignRoomRequest {
  roomId: number;
}

export interface ServiceRequestStatusUpdateRequest {
  status: RequestStatus;
}
