<script lang="ts">
	import type { ClassBlock, PaletteColor } from '$lib/types';
	import { textColorFor } from '$lib/utils';

	interface Props {
		block: ClassBlock;
		palette: PaletteColor[];
		isSelected: boolean;
		onSelect: () => void;
	}

	let { block, palette, isSelected, onSelect }: Props = $props();

	let colorObj = $derived(palette.find((c) => c.id === block.colorId));
	let colorVal = $derived(colorObj ? colorObj.color : '#dddddd');
	let textVal = $derived(textColorFor(colorVal));
</script>

<button
	type="button"
	class="classBlock {isSelected ? 'selected' : ''}"
	style="background: {colorVal}; color: {textVal};"
	onclick={onSelect}
>
	{#if block.pattern}
		<div class="cbStripe"></div>
	{/if}
	<div class="cbContent">
		<div class="cbTitle">{block.title}</div>
		<div class="cbTags">
			{#if block.time}<span class="cbPill">{block.time}</span>{/if}
			{#if block.room}<span class="cbPill">{block.room}</span>{/if}
		</div>
		<div class="cbTags">
			{#if block.section}<span class="cbRectWhite">Sec {block.section}</span>{/if}
			{#if block.type}<span class="cbRectBlack">{block.type}</span>{/if}
		</div>
	</div>
</button>

<style>
	.classBlock {
		border-radius: 14px;
		padding: 12px 14px;
		cursor: pointer;
		position: relative;
		overflow: hidden;
		border: 2.5px solid #111111;
		box-shadow: 3px 3px 0px #111111;
		transition: transform 0.1s ease, box-shadow 0.1s ease;
		text-align: left;
		width: 100%;
		box-sizing: border-box;
	}

	.classBlock:hover {
		transform: translate(-1px, -1px);
		box-shadow: 4px 4px 0px #111111;
	}

	.classBlock.selected {
		outline: 3px solid #6366f1;
		outline-offset: 2px;
	}

	.cbStripe {
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			-45deg,
			transparent,
			transparent 10px,
			rgba(255, 255, 255, 0.4) 10px,
			rgba(255, 255, 255, 0.4) 20px
		);
		pointer-events: none;
	}

	.cbContent {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.cbTitle {
		font-weight: 700;
		font-size: 15px;
		line-height: 1.25;
		word-break: break-word;
	}

	.cbTags {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		align-items: center;
	}

	.cbPill {
		background: rgba(255, 255, 255, 0.9);
		color: #111111;
		font-family: 'JetBrains Mono', monospace;
		font-size: 11px;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 12px;
		border: 1.5px solid #111111;
	}

	.cbRectWhite {
		background: #ffffff;
		color: #111111;
		font-family: 'JetBrains Mono', monospace;
		font-size: 11px;
		font-weight: 700;
		padding: 2px 6px;
		border-radius: 4px;
		border: 1.5px solid #111111;
	}

	.cbRectBlack {
		background: #111111;
		color: #ffffff;
		font-family: 'JetBrains Mono', monospace;
		font-size: 11px;
		font-weight: 700;
		padding: 2px 6px;
		border-radius: 4px;
		border: 1.5px solid #111111;
		text-transform: uppercase;
	}
</style>
