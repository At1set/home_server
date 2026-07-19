import type { FormUser } from '../model/types';

export function isFormDataChange(defaultValues: FormUser, userFormData: Partial<FormUser>) {
	const keys = Object.keys(userFormData) as Array<keyof FormUser>;

	for (const key of keys) {
		if (defaultValues[key] !== userFormData[key]) {
			return true;
		}
	}

	return false;
}
