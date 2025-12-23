import { type RequestStatus } from './adminTypes';

export interface AssignRoomRequest {
  bookingItemId: number;
  roomId: number;
}

export interface ServiceRequestStatusUpdateRequest {
  status: RequestStatus;
}
