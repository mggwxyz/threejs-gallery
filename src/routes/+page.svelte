<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { galleryItems } from '$lib/gallery-config';

	// Redirect to the first gallery item on mount
	onMount(() => {
		if (galleryItems.length > 0) {
			goto(`/gallery/${galleryItems[0].id}`);
		}
	});
</script>

<div class="h-full flex items-center justify-center bg-gray-900">
	<div class="text-center">
		<p class="text-gray-400">Redirecting to gallery...</p>
	</div>
</div>