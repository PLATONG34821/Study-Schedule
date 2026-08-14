<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		onImport: (codeString: string) => Promise<boolean> | boolean;
	}

	let { isOpen, onClose, onImport }: Props = $props();

	let inputCode = $state('');
	let errorMsg = $state('');

	$effect(() => {
		if (isOpen) {
			inputCode = '';
			errorMsg = '';
		}
	});

	const handleApplyImport = async () => {
		if (!inputCode.trim()) return;
		const success = await onImport(inputCode);
		if (success) {
			onClose();
		} else {
			errorMsg = m.invalid_code();
		}
	};

	let modalEl = $state<HTMLDivElement | null>(null);

	const handleBackdropClick = (e: MouseEvent) => {
		if ((e.target as HTMLElement).classList.contains('modalBackdrop')) {
			onClose();
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (!isOpen) return;
		if (e.key === 'Escape') {
			onClose();
		} else if (e.key === 'Tab' && modalEl) {
			const focusables = modalEl.querySelectorAll<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			if (focusables.length === 0) return;
			const first = focusables[0];
			const last = focusables[focusables.length - 1];
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}
	};
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if isOpen}
	<div
		class="modalBackdrop fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[4px]"
		onclick={handleBackdropClick}
		role="presentation"
	>
		<div
			bind:this={modalEl}
			role="dialog"
			aria-modal="true"
			aria-label={m.import_code()}
			class="flex max-h-[90vh] w-full max-w-[460px] animate-popIn flex-col overflow-y-auto rounded-2xl border border-[#3f3f46] bg-[#18181b] text-[#e4e4e7] shadow-2xl"
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-[#27272a] px-5 py-4">
				<div class="flex items-center gap-2">
					<div class="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563eb]/20 text-[#60a5fa]">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
							<path d="M14 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7" />
							<polyline points="13 8 9 12 13 16" />
							<line x1="20" y1="12" x2="9" y2="12" />
						</svg>
					</div>
					<h2 class="m-0 text-base font-bold text-white">{m.import_code()}</h2>
				</div>
				<button
					type="button"
					class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-transparent bg-transparent text-sm text-[#a1a1aa] hover:bg-[#27272a] hover:text-white"
					onclick={onClose}
					aria-label="Close dialog"
					title="Close dialog">✕</button
				>
			</div>

			<!-- Body -->
			<div class="flex flex-col gap-3 p-5">
				<p class="m-0 text-xs text-[#a1a1aa]">
					{getLocale() === 'th'
						? 'วางโค้ดการตั้งค่าที่ส่งออกไว้ด้านล่างแล้วกดนำเข้า'
						: 'Paste exported configuration code below and click apply.'}
				</p>
				<textarea
					class="box-border h-32 w-full resize-none rounded-lg border border-[#3f3f46] bg-[#27272a] p-3 font-[JetBrains_Mono,monospace] text-xs break-all text-white focus:border-[#2563eb] focus:outline-none"
					placeholder={m.paste_code_here()}
					bind:value={inputCode}></textarea>
				{#if errorMsg}
					<p class="m-0 text-xs font-semibold text-[#ef4444]">{errorMsg}</p>
				{/if}
			</div>

			<!-- Footer -->
			<div class="flex justify-end gap-2.5 border-t border-[#27272a] bg-[#18181b] px-5 py-4">
				<button
					type="button"
					class="cursor-pointer rounded-lg border border-[#3f3f46] bg-[#27272a] px-4 py-2 text-xs font-semibold text-[#a1a1aa] hover:text-white"
					onclick={onClose}>Cancel</button
				>
				<button
					type="button"
					class="flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-[#2563eb] px-5 py-2 font-[inherit] text-xs font-semibold text-white hover:bg-[#1d4ed8]"
					onclick={handleApplyImport}
				>
					{m.apply_code()}
				</button>
			</div>
		</div>
	</div>
{/if}
