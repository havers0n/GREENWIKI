import React from 'react';
import { Button } from 'shared/ui/atoms';

interface ButtonItem {
	id: string;
	text: string;
	link: string;
	variant: 'primary' | 'secondary' | 'danger' | 'ghost';
}

interface ButtonGroupProps {
	items: ButtonItem[];
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({ items }) => {
	if (!items || items.length === 0) return null;
	return (
		<div className="flex flex-wrap gap-2">
			{items.map((item) => (
				<a key={item.id} href={item.link || '#'}>
					<Button variant={item.variant as any}>{item.text}</Button>
				</a>
			))}
		</div>
	);
};

export default ButtonGroup;


