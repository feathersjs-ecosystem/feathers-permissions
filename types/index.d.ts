// TypeScript Version: 3.0
import { Hook } from '@feathersjs/feathers';

export interface PermissionOptions {
  error?: boolean;
  entity?: string;
  field?: string;
  roles: string|string[];
}

declare const checkPermissions: ((options?: PermissionOptions) => Hook);
export default checkPermissions;
