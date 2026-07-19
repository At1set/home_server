import jwt from 'jsonwebtoken';
import { type UserDTO } from '../../user/dtos/user.dto.js';
import type { UUID } from 'crypto';

export type Payload = {
	deviceId: string;
	sessionId: UUID;
} & UserDTO;

export const TokenService = {
	generateTokens(payload: Payload) {
		const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
			expiresIn: '5m',
		});

		const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
			expiresIn: '30d',
		});

		return { accessToken, refreshToken };
	},

	validateAccessToken(token: string) {
		try {
			const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
			return userData as Payload;
		} catch (e) {
			return null;
		}
	},

	validateRefreshToken(token: string) {
		try {
			const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
			return userData as Payload;
		} catch (e) {
			return null;
		}
	},
};
