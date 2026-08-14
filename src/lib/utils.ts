import { colord, extend } from 'colord';
import harmoniesPlugin from 'colord/plugins/harmonies';
import a11yPlugin from 'colord/plugins/a11y';
import lzString from 'lz-string';
import { nanoid } from 'nanoid';

extend([harmoniesPlugin, a11yPlugin]);

export const generateHarmoniousPalette = (baseHexColor: string): string[] => {
	return colord(baseHexColor)
		.harmonies('split-complementary')
		.map((c) => c.toHex());
};

export const getContrastRatio = (colorA: string, colorB: string): number => {
	return colord(colorA).contrast(colorB);
};



export const textColorFor = (hexColor: string): string => {
	const colorObj = colord(hexColor);
	return colorObj.contrast('#ffffff') >= colorObj.contrast('#111111') ? '#ffffff' : '#111111';
};
import { type as structType, array, string, boolean, nullable, optional, any, is, type Infer } from 'superstruct';

export const daySchema = structType({
	id: string(),
	name: string()
});

export const slotSchema = structType({
	id: string(),
	label: string()
});

export const paletteColorSchema = structType({
	id: string(),
	color: string()
});

export const classBlockSchema = structType({
	id: string(),
	dayId: string(),
	timeSlotId: string(),
	title: string(),
	time: optional(string()),
	room: optional(string()),
	section: optional(string()),
	type: optional(string()),
	colorId: nullable(string()),
	pattern: optional(boolean())
});

export const scheduleConfigSchema = structType({
	days: array(daySchema),
	slots: array(slotSchema),
	palette: array(paletteColorSchema),
	blocks: array(classBlockSchema),
	settings: optional(any())
});

export type ScheduleConfigData = Infer<typeof scheduleConfigSchema>;

export const validateScheduleConfig = (data: unknown): ScheduleConfigData | null => {
	if (is(data, scheduleConfigSchema)) {
		return data as ScheduleConfigData;
	}
	return null;
};

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export const formatTimeRange = (timeString: string, use24Hour = true): string => {
	if (!timeString) return '';
	const parts = timeString.split(/[-–—]/).map((s) => s.trim());
	const formatPattern = use24Hour ? 'HH:mm' : 'h:mm A';

	const formattedParts = parts.map((part) => {
		const parsed = dayjs(part, ['HH:mm', 'H:mm', 'HH:mm:ss', 'h:mm A', 'h:mm a'], true);
		return parsed.isValid() ? parsed.format(formatPattern) : part;
	});

	return formattedParts.join(' – ');
};

export const generateUid = (): string => nanoid(10);

const bytesToBase64 = (bytes: Uint8Array): string => {
	let binary = '';
	const chunk = 8192;
	for (let i = 0; i < bytes.length; i += chunk) {
		binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
	}
	return btoa(binary);
};

export const compressConfigCode = async (data: unknown): Promise<string> => {
	const jsonStr = JSON.stringify(data);
	const bytes = new TextEncoder().encode(jsonStr);

	if (typeof CompressionStream !== 'undefined') {
		try {
			const stream = new Blob([bytes as unknown as BlobPart])
				.stream()
				.pipeThrough(new CompressionStream('deflate-raw'));
			const buffer = await new Response(stream).arrayBuffer();
			return 'schedule:' + bytesToBase64(new Uint8Array(buffer));
		} catch {
			// fallback
		}
	}
	return 'schedule:' + lzString.compressToEncodedURIComponent(jsonStr);
};

export const decompressConfigCode = async (codeString: string): Promise<ScheduleConfigData | null> => {
	let parsedData: unknown = null;
	const trimmed = codeString.trim();
	const rawCode = trimmed.startsWith('schedule:') ? trimmed.slice(9) : trimmed;

	// 1. Try Base64 + DecompressionStream (default format)
	try {
		const binary = atob(rawCode);
		const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));

		if (typeof DecompressionStream !== 'undefined') {
			try {
				const stream = new Blob([bytes as unknown as BlobPart])
					.stream()
					.pipeThrough(new DecompressionStream('deflate-raw'));
				const buffer = await new Response(stream).arrayBuffer();
				const decodedText = new TextDecoder().decode(new Uint8Array(buffer));
				parsedData = JSON.parse(decodedText);
			} catch {
				// Continue
			}
		}
		if (!parsedData) {
			const decodedText = new TextDecoder().decode(bytes);
			parsedData = JSON.parse(decodedText);
		}
	} catch {
		// Continue
	}

	// 2. Try lz-string
	if (!parsedData) {
		try {
			const decompressedLz = lzString.decompressFromEncodedURIComponent(rawCode);
			if (decompressedLz) {
				parsedData = JSON.parse(decompressedLz);
			}
		} catch {
			// Continue
		}
	}

	// 3. Fallback raw JSON
	if (!parsedData) {
		try {
			parsedData = JSON.parse(trimmed);
		} catch {
			return null;
		}
	}

	return validateScheduleConfig(parsedData);
};


