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

class BinaryWriter {
	bytes: number[] = [];

	writeUint8(val: number) {
		this.bytes.push(val & 0xff);
	}
	writeUint16(val: number) {
		this.bytes.push((val >> 8) & 0xff, val & 0xff);
	}
	writeString(str: string) {
		const encoded = new TextEncoder().encode(str || '');
		const len = Math.min(encoded.length, 255);
		this.writeUint8(len);
		for (let i = 0; i < len; i++) {
			this.bytes.push(encoded[i]);
		}
	}
	writeHexColor(hex: string) {
		const { r, g, b } = hexToRgb(hex || '#ffffff');
		this.writeUint8(r);
		this.writeUint8(g);
		this.writeUint8(b);
	}
	toUint8Array(): Uint8Array {
		return new Uint8Array(this.bytes);
	}
}

class BinaryReader {
	view: Uint8Array;
	offset = 0;
	decoder = new TextDecoder();

	constructor(buffer: Uint8Array) {
		this.view = buffer;
	}
	readUint8(): number {
		return this.view[this.offset++];
	}
	readUint16(): number {
		const val = (this.view[this.offset] << 8) | this.view[this.offset + 1];
		this.offset += 2;
		return val;
	}
	readString(): string {
		const len = this.readUint8();
		const slice = this.view.subarray(this.offset, this.offset + len);
		this.offset += len;
		return this.decoder.decode(slice);
	}
	readHexColor(): string {
		const r = this.readUint8();
		const g = this.readUint8();
		const b = this.readUint8();
		return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
	}
}

const PRESET_MAP = ['none', 'ip7', 'ip7p', 'ipX', 'ipXR', 'ipXSMax', 'ip12', 'ip12PM', 'ip14Pro', 'ip14PM'];
const DAY_MAP = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export const packConfigBinaryS4 = (config: any): Uint8Array => {
	const w = new BinaryWriter();
	// Magic header S4
	w.writeUint8(0x53);
	w.writeUint8(0x04);

	const days = config.days || [];
	w.writeUint8(days.length);
	for (const d of days) {
		const nameUpper = (d.name || '').trim().toUpperCase();
		const idx = DAY_MAP.indexOf(nameUpper);
		if (idx !== -1) {
			w.writeUint8(idx);
		} else {
			w.writeUint8(255);
			w.writeString(d.name);
		}
	}

	const slots = config.slots || [];
	w.writeUint8(slots.length);
	for (const s of slots) {
		w.writeString(s.label || '');
	}

	const palette = config.palette || [];
	w.writeUint8(palette.length);
	for (const p of palette) {
		w.writeHexColor(p.color || '#ffffff');
	}

	const blocks = config.blocks || [];
	w.writeUint8(blocks.length);
	for (const b of blocks) {
		const dayIdx = Math.max(0, days.findIndex((d: any) => d.id === b.dayId));
		const slotIdx = Math.max(0, slots.findIndex((s: any) => s.id === b.timeSlotId));
		const colorIdx = Math.max(0, palette.findIndex((p: any) => p.id === b.colorId));
		w.writeUint8(dayIdx);
		w.writeUint8(slotIdx);
		w.writeString(b.title || '');
		w.writeString(b.time || '');
		w.writeString(b.room || '');
		w.writeString(b.section || '');
		w.writeString(b.type || '');
		w.writeUint8(colorIdx);
		w.writeUint8(b.pattern ? 1 : 0);
	}

	const st = config.settings || {};
	const presetIdx = PRESET_MAP.indexOf(st.selectedPresetId || 'none');

	let flag1 = 0;
	if (presetIdx !== 0) flag1 |= 1 << 0;
	if ((st.gridRotationAngle || 0) !== 0) flag1 |= 1 << 1;
	if ((st.customTopGapPercent ?? 30) !== 30) flag1 |= 1 << 2;
	if (st.scaleMode === 'fitBoth') flag1 |= 1 << 3;
	if ((st.gridScaleModifier ?? 100) !== 100) flag1 |= 1 << 4;
	if ((st.slotRowHeight ?? 200) !== 200) flag1 |= 1 << 5;
	if ((st.dayColumnWidth ?? 250) !== 250) flag1 |= 1 << 6;
	if ((st.bgColor || '#121212').toLowerCase() !== '#121212') flag1 |= 1 << 7;

	let flag2 = 0;
	if ((st.gridLineColor || '#333333').toLowerCase() !== '#333333') flag2 |= 1 << 0;
	if ((st.timeBgColor || '#1a1a1a').toLowerCase() !== '#1a1a1a') flag2 |= 1 << 1;
	if ((st.dayHeaderBgColor || '#1a1a1a').toLowerCase() !== '#1a1a1a') flag2 |= 1 << 2;
	if ((st.cellBgColor || '#18181b').toLowerCase() !== '#18181b') flag2 |= 1 << 3;
	if ((st.fontSizeDay ?? 20) !== 20) flag2 |= 1 << 4;
	if ((st.fontSizeTime ?? 16) !== 16) flag2 |= 1 << 5;
	if ((st.fontSizeTitle ?? 20) !== 20) flag2 |= 1 << 6;
	if ((st.fontSizeBadge ?? 11) !== 11) flag2 |= 1 << 7;

	w.writeUint8(flag1);
	w.writeUint8(flag2);

	if (flag1 & (1 << 0)) {
		if (presetIdx !== -1) {
			w.writeUint8(presetIdx);
		} else {
			w.writeUint8(255);
			w.writeString(st.selectedPresetId);
		}
	}
	if (flag1 & (1 << 1)) w.writeUint8(Math.round((st.gridRotationAngle || 0) / 90));
	if (flag1 & (1 << 2)) w.writeUint8(st.customTopGapPercent || 30);
	if (flag1 & (1 << 4)) w.writeUint8(st.gridScaleModifier || 100);
	if (flag1 & (1 << 5)) w.writeUint16(st.slotRowHeight || 200);
	if (flag1 & (1 << 6)) w.writeUint16(st.dayColumnWidth || 250);
	if (flag1 & (1 << 7)) w.writeHexColor(st.bgColor);

	if (flag2 & (1 << 0)) w.writeHexColor(st.gridLineColor);
	if (flag2 & (1 << 1)) w.writeHexColor(st.timeBgColor);
	if (flag2 & (1 << 2)) w.writeHexColor(st.dayHeaderBgColor);
	if (flag2 & (1 << 3)) w.writeHexColor(st.cellBgColor);
	if (flag2 & (1 << 4)) w.writeUint8(st.fontSizeDay);
	if (flag2 & (1 << 5)) w.writeUint8(st.fontSizeTime);
	if (flag2 & (1 << 6)) w.writeUint8(st.fontSizeTitle);
	if (flag2 & (1 << 7)) w.writeUint8(st.fontSizeBadge);

	return w.toUint8Array();
};

export const unpackConfigBinaryS4 = (buf: Uint8Array): any => {
	const r = new BinaryReader(buf);
	const magic = r.readUint8();
	const ver = r.readUint8();
	if (magic !== 0x53 || ver !== 0x04) return null;

	const dayLen = r.readUint8();
	const days = [];
	for (let i = 0; i < dayLen; i++) {
		const code = r.readUint8();
		const name = code < 7 ? DAY_MAP[code] : r.readString();
		days.push({ id: generateUid(), name });
	}

	const slotLen = r.readUint8();
	const slots = [];
	for (let i = 0; i < slotLen; i++) {
		slots.push({ id: generateUid(), label: r.readString() });
	}

	const paletteLen = r.readUint8();
	const palette = [];
	for (let i = 0; i < paletteLen; i++) {
		palette.push({ id: generateUid(), color: r.readHexColor() });
	}

	const blockLen = r.readUint8();
	const blocks = [];
	for (let i = 0; i < blockLen; i++) {
		const dayIdx = r.readUint8();
		const slotIdx = r.readUint8();
		const title = r.readString();
		const time = r.readString();
		const room = r.readString();
		const section = r.readString();
		const type = r.readString();
		const colorIdx = r.readUint8();
		const pattern = r.readUint8() === 1;

		blocks.push({
			id: generateUid(),
			dayId: days[dayIdx]?.id || days[0]?.id,
			timeSlotId: slots[slotIdx]?.id || slots[0]?.id,
			title,
			time,
			room,
			section,
			type,
			colorId: palette[colorIdx]?.id || palette[0]?.id,
			pattern
		});
	}

	const flag1 = r.readUint8();
	const flag2 = r.readUint8();

	let selectedPresetId = 'none';
	if (flag1 & (1 << 0)) {
		const pIdx = r.readUint8();
		selectedPresetId = pIdx < PRESET_MAP.length ? PRESET_MAP[pIdx] : r.readString();
	}
	const rawRot = flag1 & (1 << 1) ? r.readUint8() : 0;
	const gridRotationAngle = rawRot <= 4 ? rawRot * 90 : rawRot;
	const customTopGapPercent = flag1 & (1 << 2) ? r.readUint8() : 30;
	const scaleMode = flag1 & (1 << 3) ? 'fitBoth' : 'fillWidth';
	const gridScaleModifier = flag1 & (1 << 4) ? r.readUint8() : 100;
	const slotRowHeight = flag1 & (1 << 5) ? r.readUint16() : 200;
	const dayColumnWidth = flag1 & (1 << 6) ? r.readUint16() : 250;
	const bgColor = flag1 & (1 << 7) ? r.readHexColor() : '#121212';

	const gridLineColor = flag2 & (1 << 0) ? r.readHexColor() : '#333333';
	const timeBgColor = flag2 & (1 << 1) ? r.readHexColor() : '#1a1a1a';
	const dayHeaderBgColor = flag2 & (1 << 2) ? r.readHexColor() : '#1a1a1a';
	const cellBgColor = flag2 & (1 << 3) ? r.readHexColor() : '#18181b';
	const fontSizeDay = flag2 & (1 << 4) ? r.readUint8() : 20;
	const fontSizeTime = flag2 & (1 << 5) ? r.readUint8() : 16;
	const fontSizeTitle = flag2 & (1 << 6) ? r.readUint8() : 20;
	const fontSizeBadge = flag2 & (1 << 7) ? r.readUint8() : 11;

	return {
		days,
		slots,
		palette,
		blocks,
		settings: {
			selectedPresetId,
			gridRotationAngle,
			customTopGapPercent,
			scaleMode,
			gridScaleModifier,
			slotRowHeight,
			dayColumnWidth,
			bgColor,
			gridLineColor,
			timeBgColor,
			dayHeaderBgColor,
			cellBgColor,
			fontSizeDay,
			fontSizeTime,
			fontSizeTitle,
			fontSizeBadge
		}
	};
};

export const compressConfigCode = async (data: any): Promise<string> => {
	const bytes = packConfigBinaryS4(data);

	if (typeof CompressionStream !== 'undefined') {
		try {
			const stream = new Blob([bytes as unknown as BlobPart]).stream().pipeThrough(new CompressionStream('deflate-raw'));
			const response = new Response(stream);
			const buffer = await response.arrayBuffer();
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
	if (!trimmed.startsWith('schedule:')) {
		throw new Error('Only schedule: format codes are supported');
	}

	const rawBase64 = trimmed.slice(9);
	const binary = atob(rawBase64);
	const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
	let decompressedBytes = bytes;
	if (typeof DecompressionStream !== 'undefined') {
		try {
			const stream = new Blob([bytes as unknown as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
			const response = new Response(stream);
			const buffer = await response.arrayBuffer();
			decompressedBytes = new Uint8Array(buffer);
		} catch {
			// use raw bytes if uncompressed
		}
	}
	return unpackConfigBinaryS4(decompressedBytes);
};
