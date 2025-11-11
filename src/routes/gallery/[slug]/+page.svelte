<script lang="ts">
	import { onDestroy } from 'svelte';
	import { page } from '$app/state';
	import { getGalleryItem, type GalleryItem } from '../../../gallery/gallery-config';

	const slug = $state(page.params.slug);

	let canvas: HTMLCanvasElement;
	let item: GalleryItem | undefined = $state(slug ? getGalleryItem(slug) : undefined);
	let cleanup: (() => void) | undefined;


	// Function to initialize the current gallery module
	function initializeGallery(slug: string) {
		console.log('initializeGallery', slug);
		// Clean up previous instance
		if (cleanup) {
			cleanup();
			cleanup = undefined;
		}

		// Clean up any remaining GUI elements
		const existingGuis = document.querySelectorAll('.lil-gui');
		existingGuis.forEach(gui => gui.remove());

		// Get the gallery item
		const galleryItem = getGalleryItem(slug);
		item = galleryItem;
		if (!galleryItem || !canvas) return;

		if (!galleryItem.module || !galleryItem.module.default) {
			console.error(`Module not found for: ${galleryItem.id}`);
			return;
		}

		// Small delay to ensure canvas is ready and previous GUI is fully cleaned
		setTimeout(() => {
			// Initialize the Three.js scene
			cleanup = galleryItem.module.default(canvas);
		}, 10);
	}

	// Use $effect to handle both initial mount and route changes
	$effect(() => {
		if (page.params.slug) {
			initializeGallery(page.params.slug);

			// Return cleanup function that runs when dependencies change
			return () => {
				console.log('$effect cleanup');
				if (cleanup) {
					cleanup();
					cleanup = undefined;
				}
			};
		}
	});

	onDestroy(() => {
		if (cleanup) {
			cleanup();
			cleanup = undefined;
		}
	});
</script>

{#if item}
	<div class="gallery-container">
		<!-- Header -->
		<div class="gallery-header pico">
			<h1>{item.title}</h1>
			<p>{item.description}</p>
		</div>

		<!-- Canvas container -->
		<div class="canvas-container">
			{#key page.params.slug}
				<canvas bind:this={canvas} class="webgl"></canvas>
				<!-- GUI Container -->
				<div id="gui-container"></div>
			{/key}
		</div>
	</div>
{:else}
	<div class="not-found pico">
		<div class="not-found-content">
			<h1>Example Not Found</h1>
			<p>The requested example could not be found.</p>
			<a href="/">Go Home</a>
		</div>
	</div>
{/if}

<style>
	.gallery-container {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.gallery-header {
		padding: 1rem;
		& h1 {
			font-size: 1.5rem;
			margin-bottom: 0.5rem;
		}
		& p {
			color: var(--pico-muted-color);
			margin: 0;
		}
	}

	.canvas-container {
		flex: 1;
		position: relative;
		overflow: hidden;
	}

	.webgl {
		width: 100%;
		height: 100%;
		display: block;
	}

	#gui-container {
		position: absolute;
		top: 1rem;
		right: 1rem;
		z-index: 10;
	}

	/* Ensure lil-gui is positioned relative to the container */
	:global(#gui-container .lil-gui) {
		position: relative !important;
		top: auto !important;
		right: auto !important;
		left: auto !important;
	}

	.not-found {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--pico-background-color);
		color: var(--pico-color);
	}

	.not-found-content {
		text-align: center;
		padding: 2rem;
	}

	.not-found h1 {
		font-size: 2.5rem;
		font-weight: bold;
		margin-bottom: 1rem;
	}

	.not-found p {
		color: var(--pico-muted-color);
		margin-bottom: 2rem;
	}

	.not-found a {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background-color: var(--pico-primary);
		color: white;
		border-radius: 0.5rem;
		text-decoration: none;
		transition: background-color 0.2s;
	}

	.not-found a:hover {
		background-color: var(--pico-primary-hover);
	}
</style>