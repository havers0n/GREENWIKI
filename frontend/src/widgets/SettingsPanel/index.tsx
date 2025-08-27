import React from 'react';
import type { Database } from '@my-forum/db-types';
import { Card, Typography, Button } from 'shared/ui/atoms';
import { blockRegistry } from 'shared/config/blockRegistry';

// Тип строки таблицы layout_blocks
// Используется для строгой типизации пропсов и обновления блока

type LayoutBlock = Database['public']['Tables']['layout_blocks']['Row'];

interface SettingsPanelProps {
	blocks: LayoutBlock[];
	selectedBlockId: string | null;
	onSelectBlock: (id: string | null) => void;
	onBlockChange: (updatedBlock: LayoutBlock) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ blocks, selectedBlockId, onSelectBlock, onBlockChange }) => {
	// Режим списка блоков
	if (selectedBlockId === null) {
		return (
			<Card className="p-4">
				<Typography as="h2" variant="h2" className="mb-3">Блоки страницы</Typography>
				{blocks.length === 0 ? (
					<Typography className="text-gray-500 dark:text-gray-400">Список блоков пуст.</Typography>
				) : (
					<ul className="divide-y divide-gray-200 dark:divide-gray-700">
						{blocks
							.slice()
							.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
							.map((b) => {
								const spec = blockRegistry[b.block_type];
								const name = spec?.name ?? b.block_type;
								return (
									<li key={b.id} className="py-2">
										<button
												type="button"
												className="w-full text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-2 py-1"
												onClick={() => onSelectBlock(b.id)}
												aria-label={`Редактировать блок ${name}`}
											>
											<div className="min-w-0">
												<Typography as="h3" variant="h3" className="truncate">
													#{b.position} — {name}
												</Typography>
												{b.status && (
													<span className="text-xs text-gray-500 dark:text-gray-400">{b.status}</span>
												)}
											</div>
										</button>
									</li>
								);
							})}
						</ul>
					)}
			</Card>
		);
	}

	// Режим редактирования конкретного блока
	const selected = blocks.find((b) => b.id === selectedBlockId);
	if (!selected) {
		return (
			<Card className="p-4">
				<Typography as="h2" variant="h2" className="mb-3">Блок не найден</Typography>
				<Button onClick={() => onSelectBlock(null)} size="sm" variant="secondary">Назад к списку</Button>
			</Card>
		);
	}

	const spec = blockRegistry[selected.block_type];
	if (!spec) {
		return (
			<Card className="p-4">
				<Typography as="h2" variant="h2" className="mb-3">Неизвестный тип блока</Typography>
				<Typography className="text-gray-500 dark:text-gray-400 mb-3">Тип: {selected.block_type}</Typography>
				<Button onClick={() => onSelectBlock(null)} size="sm" variant="secondary">Назад к списку</Button>
			</Card>
		);
	}

	const Editor = spec.Editor as React.FC<{ data: unknown; onChange: (d: unknown) => void }>;
	const data = (selected.content ?? spec.defaultData()) as unknown;

	return (
		<Card className="p-4 space-y-4">
			<div className="flex items-center justify-between">
				<Typography as="h2" variant="h2">Редактирование: {spec.name}</Typography>
				<Button onClick={() => onSelectBlock(null)} size="sm" variant="secondary">Назад к списку</Button>
			</div>
			<div>
				<Editor
					data={data}
					onChange={(newData) => {
						const updated: LayoutBlock = { ...selected, content: newData as object } as LayoutBlock;
						onBlockChange(updated);
					}}
				/>
			</div>
		</Card>
	);
};

export default SettingsPanel;


