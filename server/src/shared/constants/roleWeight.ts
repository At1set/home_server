import { Role, type Role as RoleType } from '../../generated/prisma/enums';

export const ROLE_WEIGHT: Record<RoleType, number> = {
	[Role.user]: 1,
	[Role.admin]: 2,
	[Role.owner]: 999,
};
