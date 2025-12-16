import { type UserDTO } from './sharedTypes';

export interface AdminUserDTO extends UserDTO {
  firstName?: string;
  lastName?: string;
  email: string;
  activated: boolean;
  langKey?: string;
  authorities: string[];
  createdBy?: string;
  createdDate?: string; // ISO Date
  lastModifiedBy?: string;
  lastModifiedDate?: string; // ISO Date
}
