import { colord } from 'colord';
import lzString from 'lz-string';
import { nanoid } from 'nanoid';

export const generateUid = (): string => nanoid(10);

export const textColorFor = (hexColor: string): string =>
	colord(hexColor).isDark() ? '#ffffff' : '#111111';

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

export const decompressConfigCode = async (codeString: string): Promise<unknown> => {
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
				return JSON.parse(decodedText);
			} catch {
				// Continue
			}
		}
		const decodedText = new TextDecoder().decode(bytes);
		return JSON.parse(decodedText);
	} catch {
		// Continue
	}

	// 2. Try lz-string
	try {
		const decompressedLz = lzString.decompressFromEncodedURIComponent(rawCode);
		if (decompressedLz) {
			return JSON.parse(decompressedLz);
		}
	} catch {
		// Continue
	}

	// 3. Fallback raw JSON
	return JSON.parse(trimmed);
};

