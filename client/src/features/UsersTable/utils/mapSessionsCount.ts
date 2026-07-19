export function mapSessionsCount(sessionsCount: number) {
	const dict: Record<number, string> = {
		0: 'сессий',
		1: 'сессия',
		2: 'сессии',
		3: 'сессии',
		4: 'сессии',
		5: 'сессий',
	};
	return dict[sessionsCount] || 'сессий';
}
