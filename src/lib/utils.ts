export const generateUid = (): string =>
	typeof crypto !== 'undefined' && crypto.randomUUID
		? crypto.randomUUID()
		: Math.random().toString(36).substring(2, 9);

export const hexToRgb = (hex: string) => {
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

export const luminance = (hex: string) => {
	const { r, g, b } = hexToRgb(hex);
	const rgbArray = [r, g, b].map((val) => {
		val /= 255;
		return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
	});
	return 0.2126 * rgbArray[0] + 0.7152 * rgbArray[1] + 0.0722 * rgbArray[2];
};

export const textColorFor = (hex: string): string =>
	luminance(hex) > 0.55 ? '#111111' : '#ffffff';
