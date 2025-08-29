import React, { useState } from 'react';
import type { Database } from '@my-forum/db-types';
import { Typography, Button } from 'shared/ui/atoms';
import { blockRegistry } from 'shared/config/blockRegistry';

type LayoutBlock = Database['public']['Tables']['layout_blocks']['Row'];

interface SettingsFormProps {
	block: LayoutBlock | null;
	onBlockChange: (updatedBlock: LayoutBlock) => void;
	onClose: () => void;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ block, onBlockChange, onClose }) => {
	const [validationError, setValidationError] = useState<string | null>(null);

	if (!block) {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<Typography as="h3" variant="h3">Настройки блока</Typography>
				</div>
				<div className="text-center py-12">
					<div className="text-4xl mb-3">🔧</div>
					<Typography className="text-gray-500 dark:text-gray-400 mb-2">
						Блок не выбран
					</Typography>
					<Typography className="text-sm text-gray-400 dark:text-gray-500">
						Выберите блок в превью или во вкладке "Структура" для редактирования его настроек.
					</Typography>
				</div>
			</div>
		);
	}

	const spec = blockRegistry[block.block_type];
	if (!spec) {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<Typography as="h3" variant="h3">Неизвестный тип блока</Typography>
					<Button onClick={onClose} size="sm" variant="secondary">
						Закрыть
					</Button>
				</div>
				<div className="text-center py-8">
					<div className="text-4xl mb-3">❓</div>
					<Typography className="text-gray-500 dark:text-gray-400 mb-2">
						Тип блока не распознан
					</Typography>
					<Typography className="text-sm text-gray-400 dark:text-gray-500">
						Тип: {block.block_type}
					</Typography>
				</div>
			</div>
		);
	}

	const Editor = spec.Editor as React.FC<{ data: unknown; onChange: (d: unknown) => void }>;
	const data = (block.content ?? spec.defaultData()) as unknown;

	// Получаем иконку блока
	const getBlockIcon = (blockType: string) => {
		switch (blockType) {
			case 'header': return '🏠';
			case 'container_section': return '📦';
			case 'button_group': return '🔘';
			case 'categories_section': return '📁';
			case 'controls_section': return '⚙️';
			case 'properties_section': return '🏢';
			case 'animations_section': return '🎬';
			case 'changelog_section': return '📝';
			default: return '📄';
		}
	};

	const getStatusInfo = (status: string) => {
		switch (status) {
			case 'published':
				return { text: 'Опубликован', color: 'text-green-600 dark:text-green-400', icon: '✓' };
			case 'draft':
				return { text: 'Черновик', color: 'text-yellow-600 dark:text-yellow-400', icon: '○' };
			default:
				return { text: status, color: 'text-gray-500 dark:text-gray-400', icon: '○' };
		}
	};

	const statusInfo = getStatusInfo(block.status);

	return (
		<div className="space-y-4">
			{/* Заголовок с информацией о блоке */}
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className="text-lg">{getBlockIcon(block.block_type)}</span>
						<Typography as="h3" variant="h3">
							{spec.name}
						</Typography>
					</div>
					<Button onClick={onClose} size="sm" variant="secondary">
						Закрыть
					</Button>
				</div>
				
				{/* Метаинформация о блоке */}
				<div className="flex items-center gap-4 text-sm">
					<span className="text-gray-500 dark:text-gray-400">
						Позиция: #{block.position}
					</span>
					<span className={statusInfo.color}>
						{statusInfo.icon} {statusInfo.text}
					</span>
					{block.parent_block_id && block.slot && (
						<span className="text-purple-600 dark:text-purple-400">
							Слот: {block.slot}
						</span>
					)}
				</div>
				
				{spec.description && (
					<div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
						{spec.description}
					</div>
				)}
			</div>

			{/* Форма редактирования */}
			<div className="border-t border-gray-200 dark:border-gray-700 pt-4">
				<Typography as="h4" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
					Настройки блока
				</Typography>
				
				<div className="space-y-4">
					<Editor
						data={data}
						onChange={(newData) => {
							try {
								if (spec.schema) {
									// eslint-disable-next-line @typescript-eslint/no-explicit-any
									const result = (spec.schema as any).safeParse(newData);
									if (!result.success) {
										setValidationError(result.error?.errors?.[0]?.message ?? 'Данные не прошли валидацию');
										return;
									}
								}
								setValidationError(null);
								const updated: LayoutBlock = { ...block, content: newData as object } as LayoutBlock;
								onBlockChange(updated);
							} catch {
								setValidationError('Ошибка валидации данных');
							}
						}}
					/>
					
					{validationError && (
						<div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
							<div className="flex items-center gap-2">
								<span className="text-red-500">⚠️</span>
								<span className="text-sm text-red-700 dark:text-red-300">{validationError}</span>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default SettingsForm;
