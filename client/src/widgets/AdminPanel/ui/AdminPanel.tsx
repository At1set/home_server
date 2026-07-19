import { type FC, useEffect, useState } from 'react';

import { getAllUsers } from '@/entities/admin/api';
import type { FullUser } from '@/entities/admin/model/types';
import { EditUserFrom } from '@/features/EditUserForm';
import { UsersTable } from '@/features/UsersTable/ui/UsersTable';
import { ModalWindow } from '@/shared/ui/ModalWindow';

export const AdminPanel: FC = () => {
	const [users, setUsers] = useState<FullUser[]>([]);
	const [userToEdit, setUserToEdit] = useState<FullUser | null>(null);
	const [isEditMenuOpen, setEditMenuOpen] = useState(false);

	useEffect(() => {
		async function fetchUsers() {
			const { data } = await getAllUsers();
			setUsers(data);
		}

		fetchUsers();
	}, []);

	function closeEditUserModal() {
		setEditMenuOpen(false);
		setTimeout(() => window.location.reload(), 200);
	}

	return (
		<>
			<ModalWindow contentWidth={600} active={isEditMenuOpen} onCloseClick={closeEditUserModal}>
				{userToEdit && (
					<EditUserFrom
						user={userToEdit}
						key={userToEdit.id}
						onCloseBtnClick={closeEditUserModal}
						onDeleted={closeEditUserModal}
					/>
				)}
			</ModalWindow>
			<UsersTable
				users={users}
				onEdit={(user) => {
					setUserToEdit(user);
					setEditMenuOpen(true);
				}}
			/>
		</>
	);
};
