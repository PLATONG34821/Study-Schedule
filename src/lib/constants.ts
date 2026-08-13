import type { ClassBlock, PhonePreset } from '$lib/types';
import { generateUid } from '$lib/utils';

export const phonePresets: PhonePreset[] = [
	{ id: 'desktop', name: 'Desktop (1,920 × 1,080)', width: 1920, height: 1080 },
	{ id: 'iphone', name: 'iPhone (1,206 × 2,622)', width: 1206, height: 2622 },
	{ id: 'custom', name: 'Custom Size', width: 1920, height: 1080 }
];

export const defaultBlocks: ClassBlock[] = [
	{
		id: generateUid(),
		dayId: 'day1',
		timeSlotId: 'slot1',
		title: 'Fundamentals of Digital Logic and Microcontrollers',
		time: '08:00–09:50',
		room: 'S7 A 402',
		section: '1',
		type: 'Lecture',
		colorId: 'c1',
		pattern: false
	},
	{
		id: generateUid(),
		dayId: 'day1',
		timeSlotId: 'slot2',
		title: 'Fundamentals of Digital Logic and Microcontrollers',
		time: '10:00–11:50',
		room: 'S7 A 202',
		section: '1',
		type: 'Lab',
		colorId: 'c1',
		pattern: true
	},
	{
		id: generateUid(),
		dayId: 'day1',
		timeSlotId: 'slot3',
		title: 'Introduction to Data Science',
		time: '13:00–14:50',
		room: 'C1 313',
		section: '1',
		type: 'Lecture',
		colorId: 'c6',
		pattern: false
	},
	{
		id: generateUid(),
		dayId: 'day1',
		timeSlotId: 'slot4',
		title: 'Introduction to Data Science',
		time: '15:00–16:50',
		room: 'S1 305',
		section: '1',
		type: 'Lab',
		colorId: 'c6',
		pattern: true
	},
	{
		id: generateUid(),
		dayId: 'day2',
		timeSlotId: 'slot1',
		title: 'Database Systems',
		time: '08:00–09:50',
		room: 'C1 313',
		section: '1',
		type: 'Lecture',
		colorId: 'c2',
		pattern: false
	},
	{
		id: generateUid(),
		dayId: 'day2',
		timeSlotId: 'slot2',
		title: 'Database Systems',
		time: '10:00–11:50',
		room: 'S1 206',
		section: '1',
		type: 'Lab',
		colorId: 'c2',
		pattern: true
	},
	{
		id: generateUid(),
		dayId: 'day2',
		timeSlotId: 'slot4',
		title: 'Data Communications and Networks',
		time: '15:00–16:50',
		room: 'S7 A 402',
		section: '2',
		type: 'Lecture',
		colorId: 'c3',
		pattern: false
	},
	{
		id: generateUid(),
		dayId: 'day3',
		timeSlotId: 'slot2',
		title: 'Data Communications and Networks',
		time: '10:00–11:50',
		room: 'S7 A 201',
		section: '2',
		type: 'Lab',
		colorId: 'c3',
		pattern: true
	},
	{
		id: generateUid(),
		dayId: 'day3',
		timeSlotId: 'slot4',
		title: 'Introduction to Digital Technology and Data Science',
		time: '15:00–16:50',
		room: 'S1 101',
		section: '6',
		type: 'Lab',
		colorId: 'c7',
		pattern: true
	},
	{
		id: generateUid(),
		dayId: 'day4',
		timeSlotId: 'slot1',
		title: 'Mathematics for Engineering 2',
		time: '08:00–09:50',
		room: 'C1 314',
		section: '1',
		type: 'Lecture',
		colorId: 'c4',
		pattern: false
	},
	{
		id: generateUid(),
		dayId: 'day4',
		timeSlotId: 'slot2',
		title: 'Mathematics for Engineering 2',
		time: '10:00–11:50',
		room: 'S1 206',
		section: '1',
		type: 'Lab',
		colorId: 'c4',
		pattern: true
	},
	{
		id: generateUid(),
		dayId: 'day5',
		timeSlotId: 'slot2',
		title: 'Engineering Programming',
		time: '10:00–11:50',
		room: 'C1 314',
		section: '2',
		type: 'Lecture',
		colorId: 'c5',
		pattern: false
	},
	{
		id: generateUid(),
		dayId: 'day5',
		timeSlotId: 'slot3',
		title: 'Engineering Programming',
		time: '13:00–14:50',
		room: 'S1 206',
		section: '2',
		type: 'Lab',
		colorId: 'c5',
		pattern: true
	}
];
