<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { getGalleryItem } from '$lib/gallery-config';

	// Import all gallery modules
	import * as basicCube from '$lib/../gallery/basic-cube';
	import * as cameras from '$lib/../gallery/cameras';
	import * as transformCube from '$lib/../gallery/transform-cube';
	import * as gsapAnimation from '$lib/../gallery/gsap-animation';

	let canvas: HTMLCanvasElement;
	let cleanup: (() => void) | undefined;

	const modules: Record<string, any> = {
		'basic-cube': basicCube,
		'cameras': cameras,
		'transform-cube': transformCube,
		'gsap-animation': gsapAnimation
	};

	$: item = $page.params.slug ? getGalleryItem($page.params.slug) : undefined;

	// Function to initialize the current gallery module
	function initializeGallery(slug: string) {
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
		if (!galleryItem || !canvas) return;

		const module = modules[galleryItem.id];
		if (!module || !module.default) {
			console.error(`Module not found for: ${galleryItem.id}`);
			return;
		}

		// Small delay to ensure canvas is ready and previous GUI is fully cleaned
		setTimeout(() => {
			// Initialize the Three.js scene
			cleanup = module.default(canvas);
		}, 10);
	}

	// Watch for route changes and reinitialize
	$: if (canvas && $page.params.slug) {
		initializeGallery($page.params.slug);
	}

	onMount(() => {
		if ($page.params.slug && canvas) {
			initializeGallery($page.params.slug);
		}
	});

	onDestroy(() => {
		if (cleanup) {
			cleanup();
			cleanup = undefined;
		}
	});
</script>

<style>
	/* Ensure lil-gui is positioned relative to the container */
	:global(#gui-container .lil-gui) {
		position: relative !important;
		top: auto !important;
		right: auto !important;
		left: auto !important;
	}
</style>

{#if item}
	<div class="h-full flex flex-col bg-gray-900">
		<!-- Header -->
		<div class="bg-gray-800 text-white p-6 shadow-lg">
			<h1 class="text-3xl font-bold mb-2">{item.title}</h1>
			<p class="text-gray-300">{item.description}</p>
		</div>

		<!-- Canvas container -->
		<div class="flex-1 relative overflow-hidden">
			{#key $page.params.slug}
				<canvas bind:this={canvas} class="webgl w-full h-full block"></canvas>
				<!-- GUI Container -->
				<div id="gui-container" class="absolute top-4 right-4 z-10"></div>
			{/key}
		</div>
	</div>
{:else}
	<div class="h-full flex items-center justify-center bg-gray-900 text-white">
		<div class="text-center">
			<h1 class="text-4xl font-bold mb-4">Example Not Found</h1>
			<p class="text-gray-400 mb-8">The requested example could not be found.</p>
			<a href="/" class="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors">
				Go Home
			</a>
		</div>
	</div>
{/if}