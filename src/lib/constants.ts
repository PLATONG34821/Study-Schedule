import type { PhonePreset } from '$lib/types';

export const phonePresets: PhonePreset[] = [
	{ id: 'desktop', name: 'Desktop (1,920 × 1,080)', width: 1920, height: 1080 },
	{ id: 'iphone', name: 'iPhone (1,206 × 2,622)', width: 1206, height: 2622 },
	{ id: 'custom', name: 'Custom Size', width: 1920, height: 1080 }
];
