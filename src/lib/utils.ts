import { colord } from 'colord';
import lzString from 'lz-string';

export const generateUid = (): string =>
	typeof crypto !== 'undefined' && crypto.randomUUID
		? crypto.randomUUID()
		: Math.random().toString(36).substring(2, 9);

export const textColorFor = (hexColor: string): string =>
	colord(hexColor).isDark() ? '#ffffff' : '#111111';

export const compressConfigCode = async (data: unknown): Promise<string> =>
	'schedule:' + lzString.compressToEncodedURIComponent(JSON.stringify(data));

export const decompressConfigCode = async (codeString: string): Promise<unknown> => {
	const trimmed = codeString.trim();
	const rawCode = trimmed.startsWith('schedule:') ? trimmed.slice(9) : trimmed;

	const decompressedLz = lzString.decompressFromEncodedURIComponent(rawCode);
	if (decompressedLz) {
		try {
			return JSON.parse(decompressedLz);
		} catch {
			// fallback
		}
	}

	let bytes: Uint8Array;
	try {
		const binary = atob(rawCode);
		bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
	} catch {
		return JSON.parse(trimmed);
	}

	let decompressedBytes = bytes;
	if (typeof DecompressionStream !== 'undefined') {
		try {
			const stream = new Blob([bytes as unknown as BlobPart])
				.stream()
				.pipeThrough(new DecompressionStream('deflate-raw'));
			const buffer = await new Response(stream).arrayBuffer();
			decompressedBytes = new Uint8Array(buffer);
		} catch {
			// fallback
		}
	}

	const decodedText = new TextDecoder().decode(decompressedBytes);
	return JSON.parse(decodedText);
};

