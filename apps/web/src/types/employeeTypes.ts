import { type RequestStatus } from './adminTypes';

export interface AssignRoomRequest {
  roomId: number;
}

export interface ServiceRequestStatusUpdateRequest {
  status: RequestStatus;
}
