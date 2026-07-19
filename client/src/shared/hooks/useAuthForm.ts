// features/shared/hooks/useAuthForm.ts (или внутри одной из папок фич)
import { AxiosError } from 'axios';
import { type SubmitEvent, useState } from 'react';
import z from 'zod';

import { useAuthContext } from '@/app/providers/AuthProvider/hooks/useAuthContext';
import { TokenService } from '@/entities/user';
import type { login, register } from '@/entities/user/api';
import { getDeviceId } from '@/shared/utils/getDeviceId';

interface UseAuthFormProps<
	T extends Record<string, unknown>,
	R extends typeof register | typeof login,
> {
	defaultValues: T;
	schema: z.ZodSchema<T>;
	apiSubmitAction: R;
}

export function useAuthForm<
	T extends Record<string, unknown>,
	R extends typeof register | typeof login,
>({ defaultValues, schema, apiSubmitAction }: UseAuthFormProps<T, R>) {
	const { login: authorize } = useAuthContext();
	const [responseError, setResponseError] = useState<string | null>(null);
	const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
	const [showErrors, setShowErrors] = useState(false);
	const [userFormData, setUserFormData] = useState<Partial<T>>({});

	const formData = {
		...defaultValues,
		...userFormData,
	} as T;

	const validate = () => {
		const res = schema.safeParse(formData);
		if (res.success) return undefined;
		return z.treeifyError(res.error);
	};

	const errors = showErrors ? validate() : undefined;

	const handleChange = (field: keyof T, value: string) => {
		setUserFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		setShowErrors(true);
		setResponseError(null);

		const currentErrors = validate();
		if (currentErrors) return;

		try {
			setSubmitButtonDisabled(true);

			const result = await apiSubmitAction({
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				...(formData as any),
				deviceId: getDeviceId(),
			});

			const token = result.token;
			if (token) {
				TokenService.setToken(token);
				const user = TokenService.decodeSafe();
				if (token && user !== null) authorize(user);
			}
		} catch (err) {
			if (err instanceof AxiosError) {
				const message = err.response?.data?.message || 'Что-то пошло не так.';
				return setResponseError(message);
			}
			setResponseError('Что-то пошло не так.');
		} finally {
			setSubmitButtonDisabled(false);
		}
	};

	return {
		formData,
		errors,
		responseError,
		submitButtonDisabled,
		handleChange,
		handleSubmit,
	};
}
