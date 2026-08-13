# Study Schedule

An interactive study schedule editor and phone/desktop wallpaper generator built with Svelte 5, SvelteKit, Tailwind CSS v4, and Cloudflare Pages.

![Svelte 5](https://img.shields.io/badge/Svelte-5-orange) ![SvelteKit](https://img.shields.io/badge/SvelteKit-2-red) ![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-blue) ![Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare_Pages-f38020)

## Features

- **Interactive Schedule Editor**: Custom days (columns), time slots (rows), subjects, colors, and diagonal stripe patterns.
- **Wallpaper Generator**: Export schedule wallpapers for Desktop (1920×1080) and iPhone (1206×2622) with grid rotation (90°, 180°, 270°), custom clock space padding, and scale modes.
- **PNG Export**: High-resolution image export powered by `html-to-image`.
- **Import & Export Configuration**: Share schedules instantly via URL share links or compressed configuration codes.
- **Multilingual Support**: Toggle between English (`EN`) and Thai (`TH`) seamlessly via `@inlang/paraglide-js`.
- **Cloudflare Pages Deployment**: Built-in support using `@sveltejs/adapter-cloudflare` and `wrangler.json` (`nodejs_compat`).

## Tech Stack

- **Framework**: Svelte 5 (Runes mode) & SvelteKit 2
- **Styling**: Tailwind CSS v4
- **Internationalization**: Paraglide.js (`@inlang/paraglide-js`)
- **Exporting**: `html-to-image`
- **Adapter**: `@sveltejs/adapter-cloudflare`
- **Runtime / Package Manager**: Bun / Node.js

## Project Setup

```sh
# Install dependencies
bun install

# Start development server
bun run dev

# Type check
bun run check

# Lint & Format
bun run lint
bun run format
```

## Deployment

Build for Cloudflare Pages:

```sh
bun run build
```

This project includes a `wrangler.json` configuration file with the `nodejs_compat` compatibility flag for seamless deployment to Cloudflare Pages Functions.
