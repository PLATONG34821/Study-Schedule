<script lang="ts">
	import type { ClassBlock, PaletteColor } from '$lib/types';

	interface Props {
		block: ClassBlock | null;
		palette: PaletteColor[];
		onClose: () => void;
		onDelete: (id: string) => void;
	}

	let { block = $bindable(), palette, onClose, onDelete }: Props = $props();

	const handleBackdropClick = (e: MouseEvent) => {
		if ((e.target as HTMLElement).classList.contains('modalBackdrop')) {
			onClose();
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (block && e.key === 'Escape') {
			onClose();
		}
	};
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if block}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modalBackdrop" onclick={handleBackdropClick}>
		<div class="modalCard">
			<div class="modalHeader">
				<h2>แก้ไขวิชา (Edit Subject)</h2>
				<button type="button" class="closeIconBtn" onclick={onClose}>✕</button>
			</div>

			<div class="modalBody">
				<label class="edLabel" for="blockTitleInput">ชื่อวิชา (Title)</label>
				<input id="blockTitleInput" class="edInput" type="text" bind:value={block.title} />

				<div class="twoColRow">
					<div>
						<label class="edLabel" for="blockTimeInput">เวลา (Time)</label>
						<input
							id="blockTimeInput"
							class="edInput"
							type="text"
							bind:value={block.time}
							placeholder="08:00–09:50"
						/>
					</div>

					<div>
						<label class="edLabel" for="blockRoomInput">ห้อง (Room)</label>
						<input
							id="blockRoomInput"
							class="edInput"
							type="text"
							bind:value={block.room}
							placeholder="S1 206"
						/>
					</div>
				</div>

				<div class="twoColRow">
					<div>
						<label class="edLabel" for="blockSectionInput">Section</label>
						<input
							id="blockSectionInput"
							class="edInput"
							type="text"
							bind:value={block.section}
							placeholder="1"
						/>
					</div>

					<div>
						<label class="edLabel" for="blockTypeInput">ประเภท (Badge)</label>
						<input
							id="blockTypeInput"
							class="edInput"
							type="text"
							bind:value={block.type}
							placeholder="Lecture / Lab"
						/>
					</div>
				</div>

				<span class="edLabel">สี (Color)</span>
				<div class="colorPickGrid">
					{#each palette as colorOption (colorOption.id)}
						<button
							type="button"
							class="colorPick {block.colorId === colorOption.id ? 'active' : ''}"
							style="background: {colorOption.color};"
							onclick={() => {
								if (block) block.colorId = colorOption.id;
							}}
							aria-label="Color option"
						></button>
					{/each}
				</div>

				<label class="checkboxRow">
					<input type="checkbox" bind:checked={block.pattern} />
					<span>มีลาย (Diagonal stripe pattern)</span>
				</label>
			</div>

			<div class="modalFooter">
				<button type="button" class="btnDelete" onclick={() => onDelete(block.id)}>ลบวิชานี้</button>
				<button type="button" class="btnSave" onclick={onClose}>ตกลง / ปิด</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modalBackdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 999;
		padding: 16px;
	}

	.modalCard {
		background: #18181b;
		color: #e4e4e7;
		border: 1px solid #3f3f46;
		border-radius: 16px;
		width: 100%;
		max-width: 440px;
		box-shadow: none;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		animation: popIn 0.15s ease-out;
	}

	@keyframes popIn {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.modalHeader {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 18px 20px;
		border-bottom: 1px solid #27272a;
	}

	.modalHeader h2 {
		margin: 0;
		font-size: 18px;
		font-weight: 700;
		color: #ffffff;
	}

	.closeIconBtn {
		background: transparent;
		border: none;
		color: #a1a1aa;
		font-size: 18px;
		cursor: pointer;
		padding: 4px;
	}

	.closeIconBtn:hover {
		color: #ffffff;
	}

	.modalBody {
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.twoColRow {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	.edLabel {
		font-size: 12px;
		color: #a1a1aa;
		margin-bottom: 4px;
		display: block;
	}

	.edInput {
		width: 100%;
		padding: 10px 12px;
		border-radius: 8px;
		border: 1px solid #3f3f46;
		background: #27272a;
		color: #fff;
		font-size: 14px;
		box-sizing: border-box;
		font-family: inherit;
	}

	.colorPickGrid {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.colorPick {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		border: 2px solid transparent;
		cursor: pointer;
	}

	.colorPick.active {
		border-color: #ffffff;
		box-shadow: 0 0 0 2px #6366f1;
	}

	.checkboxRow {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		opacity: 0.9;
		cursor: pointer;
		margin-top: 4px;
	}

	.modalFooter {
		display: flex;
		gap: 10px;
		padding: 16px 20px;
		border-top: 1px solid #27272a;
		background: #18181b;
	}

	.btnDelete {
		flex: 1;
		padding: 10px;
		border-radius: 8px;
		border: none;
		background: #ef4444;
		color: #fff;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
	}

	.btnSave {
		flex: 1;
		padding: 10px;
		border-radius: 8px;
		border: none;
		background: #6366f1;
		color: #fff;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
	}

	.btnSave:hover {
		background: #4f46e5;
	}
</style>
