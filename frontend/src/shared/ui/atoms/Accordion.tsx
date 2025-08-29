import React, { useState } from 'react';
import { Typography } from './Typography';

interface AccordionItem {
	id: string;
	title: string;
	content: React.ReactNode;
}

interface AccordionProps {
	items: AccordionItem[];
	defaultExpanded?: string[];
	allowMultiple?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({
	items,
	defaultExpanded = [],
	allowMultiple = true
}) => {
	const [expandedItems, setExpandedItems] = useState<Set<string>>(
		new Set(defaultExpanded)
	);

	const toggleItem = (itemId: string) => {
		setExpandedItems(prev => {
			const newSet = new Set(prev);
			if (newSet.has(itemId)) {
				newSet.delete(itemId);
			} else {
				if (!allowMultiple) {
					newSet.clear();
				}
				newSet.add(itemId);
			}
			return newSet;
		});
	};

	return (
		<div className="space-y-2">
			{items.map((item) => {
				const isExpanded = expandedItems.has(item.id);
				return (
					<div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
						<button
							type="button"
							className={`
								w-full px-4 py-3 text-left flex items-center justify-between transition-colors duration-200
								hover:bg-gray-50 dark:hover:bg-gray-800
								${isExpanded ? 'bg-gray-50 dark:bg-gray-800' : ''}
							`}
							onClick={() => toggleItem(item.id)}
							aria-expanded={isExpanded}
						>
							<Typography as="h3" variant="h4" className="font-medium">
								{item.title}
							</Typography>
							<div className={`
								transform transition-transform duration-200
								${isExpanded ? 'rotate-180' : ''}
							`}>
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									className="text-gray-500 dark:text-gray-400"
								>
									<path
										d="M4 6L8 10L12 6"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</div>
						</button>
						{isExpanded && (
							<div className="px-4 pb-3">
								{item.content}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default Accordion;
