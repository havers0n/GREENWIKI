import React from 'react';
import { Typography, Button, Spinner, Modal } from '@my-forum/ui';

interface RevisionsModalProps {
	isOpen: boolean;
	onClose: () => void;
	revisions: Array<{ id: string; created_at: string }>;
	loading: boolean;
	reverting: boolean;
	onCreateRevision: () => void;
	onRevertRevision: (revisionId: string) => void;
}

const RevisionsModal: React.FC<RevisionsModalProps> = ({
	isOpen,
	onClose,
	revisions,
	loading,
	reverting,
	onCreateRevision,
	onRevertRevision
}) => {
	return (
		<Modal title="История ревизий" onClose={onClose} isOpen={isOpen}>
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className="text-lg">🕒</span>
						<span className="text-sm text-gray-500">Управление версиями страницы</span>
					</div>
					{loading && <Spinner />}
				</div>
				
				<div className="text-sm text-gray-600 dark:text-gray-300">
					Ревизии позволяют сохранять снимки текущего состояния страницы и откатываться к предыдущим версиям.
				</div>
				
				<div className="flex items-center gap-2">
					<Button onClick={onCreateRevision} disabled={loading}>
						📸 Создать ревизию
					</Button>
				</div>
				
				<div className="border-t border-gray-200 dark:border-gray-700 pt-4">
					<Typography as="h3" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
						Сохраненные ревизии ({revisions.length})
					</Typography>
					
					{revisions.length === 0 ? (
						<div className="text-center py-8">
							<div className="text-4xl mb-3">📝</div>
							<Typography className="text-gray-500 dark:text-gray-400 mb-2">
								Ревизий пока нет
							</Typography>
							<Typography className="text-sm text-gray-400 dark:text-gray-500">
								Создайте первую ревизию, чтобы сохранить текущее состояние страницы.
							</Typography>
						</div>
					) : (
						<div className="space-y-2 max-h-64 overflow-y-auto">
							{revisions.map((revision, index) => (
								<div key={revision.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
											<span className="text-xs font-medium text-blue-700 dark:text-blue-300">
												{revisions.length - index}
											</span>
										</div>
										<div>
											<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
												{new Date(revision.created_at).toLocaleDateString('ru-RU', {
													day: '2-digit',
													month: '2-digit',
													year: 'numeric'
												})}
											</div>
											<div className="text-xs text-gray-500 dark:text-gray-400">
												{new Date(revision.created_at).toLocaleTimeString('ru-RU', {
													hour: '2-digit',
													minute: '2-digit'
												})}
											</div>
										</div>
									</div>
									<Button
										size="sm"
										variant="secondary"
										onClick={() => onRevertRevision(revision.id)}
										disabled={reverting}
									>
										{reverting ? 'Откат...' : 'Откатить'}
									</Button>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</Modal>
	);
};

export default RevisionsModal;
