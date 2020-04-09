// TypeScript Version: 3.0
import { Hook, HookContext } from '@feathersjs/feathers';

export type RoleList = string|string[];
export interface PermissionOptions {
  error?: boolean;
  entity?: string;
  field?: string;
  roles: RoleList|{(context: HookContext): RoleList}|{(context: HookContext): Promise<RoleList>};
}

declare const checkPermissions: ((options?: PermissionOptions) => Hook);
export default checkPermissions;
