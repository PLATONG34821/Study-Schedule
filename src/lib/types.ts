export interface Day {
	id: string;
	name: string;
}

export interface Slot {
	id: string;
	label: string;
}

export interface PaletteColor {
	id: string;
	color: string;
}

export interface ClassBlock {
	id: string;
	dayId: string;
	timeSlotId: string;
	title: string;
	time: string;
	room: string;
	section: string;
	type: string;
	colorId: string | null;
	pattern: boolean;
}

export interface PhonePreset {
	id: string;
	name: string;
	width: number;
	height: number;
	topGapRatio: number;
	bottomGapPx: number;
}
