export const generateUid = (): string =>
	typeof crypto !== 'undefined' && crypto.randomUUID
		? crypto.randomUUID()
		: Math.random().toString(36).substring(2, 9);

const hexToRgb = (hex: string) => {
	const cleanHex = hex.replace('#', '');
	const fullHex =
		cleanHex.length === 3
			? cleanHex
					.split('')
					.map((c) => c + c)
					.join('')
			: cleanHex;
	const bigInt = parseInt(fullHex, 16);
	return { r: (bigInt >> 16) & 255, g: (bigInt >> 8) & 255, b: bigInt & 255 };
};

const luminance = (hex: string) => {
	const { r, g, b } = hexToRgb(hex);
	const rgbArray = [r, g, b].map((val) => {
		val /= 255;
		return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
	});
	return 0.2126 * rgbArray[0] + 0.7152 * rgbArray[1] + 0.0722 * rgbArray[2];
};

export const textColorFor = (hex: string): string =>
	luminance(hex) > 0.55 ? '#111111' : '#ffffff';

export const compressConfigCode = async (data: unknown): Promise<string> => {
	const jsonStr = JSON.stringify(data);
	const bytes = new TextEncoder().encode(jsonStr);

	if (typeof CompressionStream !== 'undefined') {
		try {
			const stream = new Blob([bytes as unknown as BlobPart])
				.stream()
				.pipeThrough(new CompressionStream('deflate-raw'));
			const buffer = await new Response(stream).arrayBuffer();
			const compressedBytes = new Uint8Array(buffer);
			let binary = '';
			for (let i = 0; i < compressedBytes.byteLength; i++) {
				binary += String.fromCharCode(compressedBytes[i]);
			}
			return 'schedule:' + btoa(binary);
		} catch {
			// fallback
		}
	}
	let binary = '';
	for (let i = 0; i < bytes.byteLength; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return 'schedule:' + btoa(binary);
};

export const decompressConfigCode = async (codeString: string): Promise<unknown> => {
	const trimmed = codeString.trim();
	const rawBase64 = trimmed.startsWith('schedule:') ? trimmed.slice(9) : trimmed;

	let bytes: Uint8Array;
	try {
		const binary = atob(rawBase64);
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
