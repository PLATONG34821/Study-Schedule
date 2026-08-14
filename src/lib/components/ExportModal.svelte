<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';

	interface Props {
		isOpen: boolean;
		initialTab?: 'image' | 'share' | 'code';
		isExporting?: boolean;
		exportPixelRatio: 1 | 2 | 4;
		code: string;
		shareUrl: string;
		linkCopied?: boolean;
		onClose: () => void;
		onExportImage: () => void;
		onShareLink: () => void;
	}

	let {
		isOpen,
		initialTab = 'image',
		isExporting = false,
		exportPixelRatio = $bindable(2),
		code,
		shareUrl,
		linkCopied = false,
		onClose,
		onExportImage,
		onShareLink
	}: Props = $props();

	let activeTab = $state<'image' | 'share' | 'code'>('image');
	let codeCopied = $state(false);

	$effect(() => {
		if (isOpen) {
			activeTab = initialTab === 'code' || initialTab === 'share' ? initialTab : 'image';
			codeCopied = false;
		}
	});

	const handleCopyCode = async () => {
		try {
			await navigator.clipboard.writeText(code);
			codeCopied = true;
			setTimeout(() => {
				codeCopied = false;
			}, 2000);
		} catch {
			// fallback
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
			aria-label="Export & Share Schedule"
			class="flex max-h-[90vh] w-full max-w-[480px] animate-popIn flex-col overflow-y-auto rounded-2xl border border-[#3f3f46] bg-[#18181b] text-[#e4e4e7] shadow-2xl"
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-[#27272a] px-5 py-4">
				<div class="flex items-center gap-2">
					<div class="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563eb]/20 text-[#60a5fa]">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="7 10 12 15 17 10" />
							<line x1="12" y1="15" x2="12" y2="3" />
						</svg>
					</div>
					<h2 class="m-0 text-base font-bold text-white">Export & Share</h2>
				</div>
				<button
					type="button"
					class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-transparent bg-transparent text-sm text-[#a1a1aa] hover:bg-[#27272a] hover:text-white"
					onclick={onClose}
					aria-label="Close dialog"
					title="Close dialog">✕</button
				>
			</div>

			<!-- Navigation Tabs -->
			<div class="flex border-b border-[#27272a] bg-[#121214] p-1.5 gap-1">
				<button
					type="button"
					class="flex-1 rounded-lg py-2 text-xs font-semibold transition-colors {activeTab === 'image'
						? 'bg-[#2563eb] text-white shadow-sm'
						: 'text-[#a1a1aa] hover:text-white'}"
					onclick={() => (activeTab = 'image')}
				>
					{m.export_png()}
				</button>
				<button
					type="button"
					class="flex-1 rounded-lg py-2 text-xs font-semibold transition-colors {activeTab === 'share'
						? 'bg-[#2563eb] text-white shadow-sm'
						: 'text-[#a1a1aa] hover:text-white'}"
					onclick={() => (activeTab = 'share')}
				>
					{m.share_link()}
				</button>
				<button
					type="button"
					class="flex-1 rounded-lg py-2 text-xs font-semibold transition-colors {activeTab === 'code'
						? 'bg-[#2563eb] text-white shadow-sm'
						: 'text-[#a1a1aa] hover:text-white'}"
					onclick={() => (activeTab = 'code')}
				>
					{m.export_code()}
				</button>
			</div>

			<!-- Body Content -->
			<div class="flex flex-col gap-4 p-5">
				{#if activeTab === 'image'}
					<div class="flex flex-col gap-3">
						<div class="flex items-center justify-between rounded-xl border border-[#3f3f46] bg-[#27272a] p-3.5">
							<div class="flex flex-col gap-0.5">
								<span class="text-xs font-semibold text-white">Image Resolution</span>
								<span class="text-[11px] text-[#a1a1aa]">Select PNG render quality</span>
							</div>
							<div class="flex gap-1 rounded-lg border border-[#3f3f46] bg-[#18181b] p-1">
								{#each [1, 2, 4] as ratio (ratio)}
									<button
										type="button"
										class="rounded px-2.5 py-1 text-xs font-bold transition-colors {exportPixelRatio ===
										ratio
											? 'bg-[#2563eb] text-white shadow-sm'
											: 'text-[#a1a1aa] hover:text-white'}"
										onclick={() => (exportPixelRatio = ratio as 1 | 2 | 4)}
									>
										{ratio}x
									</button>
								{/each}
							</div>
						</div>

						<button
							type="button"
							class="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-none bg-[#2563eb] py-3.5 font-[inherit] text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
							onclick={onExportImage}
							disabled={isExporting}
						>
							{#if isExporting}
								<svg
									class="animate-spin"
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
									<path d="M12 2a10 10 0 0 1 10 10" />
								</svg>
								{m.exporting()}
							{:else}
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
									<polyline points="7 10 12 15 17 10" />
									<line x1="12" y1="15" x2="12" y2="3" />
								</svg>
								Download PNG ({exportPixelRatio}x)
							{/if}
						</button>
					</div>
				{:else if activeTab === 'share'}
					<div class="flex flex-col gap-3">
						<p class="m-0 text-xs text-[#a1a1aa]">
							{getLocale() === 'th'
								? 'คัดลอกลิงก์เพื่อแชร์ตารางเรียนให้เพื่อนดู'
								: 'Share your schedule with anyone using this direct link.'}
						</p>
						<div class="flex gap-2">
							<input
								type="text"
								readonly
								value={shareUrl}
								class="flex-1 rounded-lg border border-[#3f3f46] bg-[#27272a] px-3 py-2 font-[JetBrains_Mono,monospace] text-xs text-white focus:outline-none"
								onclick={(e) => (e.target as HTMLInputElement).select()}
							/>
							<button
								type="button"
								class="flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-[#2563eb] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8]"
								onclick={onShareLink}
							>
								{#if linkCopied}
									✓ {m.link_copied()}
								{:else}
									{m.share_link()}
								{/if}
							</button>
						</div>
					</div>
				{:else if activeTab === 'code'}
					<div class="flex flex-col gap-3">
						<p class="m-0 text-xs text-[#a1a1aa]">
							{getLocale() === 'th'
								? 'คัดลอกโค้ดการตั้งค่าด้านล่างเพื่อสำรองข้อมูลหรือนำไปเปิดบนเครื่องอื่น'
								: 'Copy the compressed configuration code below for backup or transfer.'}
						</p>
						<textarea
							class="box-border h-28 w-full resize-none rounded-lg border border-[#3f3f46] bg-[#27272a] p-3 font-[JetBrains_Mono,monospace] text-xs break-all text-white focus:border-[#2563eb] focus:outline-none"
							readonly
							value={code}
							onclick={(e) => (e.target as HTMLTextAreaElement).select()}></textarea>
						<button
							type="button"
							class="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-none bg-[#2563eb] py-2.5 font-[inherit] text-xs font-semibold text-white hover:bg-[#1d4ed8]"
							onclick={handleCopyCode}
						>
							{#if codeCopied}
								✓ {m.copied()}
							{:else}
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
									<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
								</svg>
								{m.copy_code()}
							{/if}
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
