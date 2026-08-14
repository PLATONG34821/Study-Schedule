<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';

	interface Props {
		isOpen: boolean;
		mode: 'export' | 'import';
		code: string;
		onClose: () => void;
		onImport: (codeString: string) => Promise<boolean> | boolean;
	}

	let { isOpen, mode, code, onClose, onImport }: Props = $props();

	let inputCode = $state('');
	let copied = $state(false);
	let errorMsg = $state('');

	$effect(() => {
		if (isOpen) {
			inputCode = mode === 'export' ? code : '';
			copied = false;
			errorMsg = '';
		}
	});

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(code);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch {
			// fallback
		}
	};

	const handleApply = async () => {
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
			aria-label={mode === 'export' ? m.export_code() : m.import_code()}
			class="flex max-h-[90vh] w-full max-w-[500px] animate-popIn flex-col overflow-y-auto rounded-2xl border border-[#3f3f46] bg-[#18181b] text-[#e4e4e7] shadow-none"
		>
			<div class="flex items-center justify-between border-b border-[#27272a] px-5 py-[18px]">
				<h2 class="m-0 text-lg font-bold text-white">
					{mode === 'export' ? m.export_code() : m.import_code()}
				</h2>
				<button
					type="button"
					class="cursor-pointer border-none bg-transparent p-1 text-lg text-[#a1a1aa] hover:text-white"
					onclick={onClose}
					aria-label="Close dialog"
					title="Close dialog">✕</button
				>
			</div>

			<div class="flex flex-col gap-3 p-5">
				{#if mode === 'export'}
					<p class="m-0 text-xs text-[#a1a1aa]">
						{getLocale() === 'th'
							? 'คัดลอกโค้ดการตั้งค่าด้านล่างเพื่อนำไปใช้บนเครื่องหรือเบราว์เซอร์อื่น'
							: 'Copy the configuration code below to transfer your schedule settings.'}
					</p>
					<textarea
						class="box-border h-28 w-full resize-none rounded-lg border border-[#3f3f46] bg-[#27272a] p-3 font-[JetBrains_Mono,monospace] text-xs break-all text-white focus:border-[#2563eb] focus:outline-none"
						readonly
						value={code}
						onclick={(e) => (e.target as HTMLTextAreaElement).select()}></textarea>
				{:else}
					<p class="m-0 text-xs text-[#a1a1aa]">
						{getLocale() === 'th'
							? 'วางโค้ดการตั้งค่าที่ส่งออกไว้ด้านล่างแล้วกดนำเข้า'
							: 'Paste exported configuration code below and click apply.'}
					</p>
					<textarea
						class="box-border h-28 w-full resize-none rounded-lg border border-[#3f3f46] bg-[#27272a] p-3 font-[JetBrains_Mono,monospace] text-xs break-all text-white focus:border-[#2563eb] focus:outline-none"
						placeholder={m.paste_code_here()}
						bind:value={inputCode}></textarea>
					{#if errorMsg}
						<p class="m-0 text-xs font-semibold text-[#ef4444]">{errorMsg}</p>
					{/if}
				{/if}
			</div>

			<div class="flex justify-end gap-2.5 border-t border-[#27272a] bg-[#18181b] px-5 py-4">
				{#if mode === 'export'}
					<button
						type="button"
						class="flex cursor-pointer items-center gap-2 rounded-lg border-none bg-[#2563eb] px-5 py-2.5 font-[inherit] text-sm font-semibold text-white hover:bg-[#1d4ed8]"
						onclick={handleCopy}
					>
						{#if copied}
							✓ {m.copied()}
						{:else}
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
								<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
							</svg>
							{m.copy_code()}
						{/if}
					</button>
				{:else}
					<button
						type="button"
						class="cursor-pointer rounded-lg border border-[#3f3f46] bg-[#27272a] px-4 py-2.5 font-[inherit] text-sm font-semibold text-[#a1a1aa] hover:text-white"
						onclick={onClose}>{m.save_close()}</button
					>
					<button
						type="button"
						class="cursor-pointer rounded-lg border-none bg-[#2563eb] px-5 py-2.5 font-[inherit] text-sm font-semibold text-white hover:bg-[#1d4ed8]"
						onclick={handleApply}>{m.apply_code()}</button
					>
				{/if}
			</div>
		</div>
	</div>
{/if}
