<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { galleryItems } from '../gallery-config';

	// Redirect to the first gallery item on mount
	onMount(() => {
		if (galleryItems.length > 0) {
			goto(`/gallery/${galleryItems[0].id}`);
		}
	});
</script>

<div class="redirect-container">
	<div class="redirect-message">
		<p>Redirecting to gallery...</p>
	</div>
</div>

<style>
	.redirect-container {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--pico-background-color);
	}

	.redirect-message {
		text-align: center;
		color: var(--pico-muted-color);
	}
</style>