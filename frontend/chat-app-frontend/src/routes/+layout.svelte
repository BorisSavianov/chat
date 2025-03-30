<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { authService } from '$lib/services/auth';
</script>

<div class="min-h-screen">
	<slot />
</div>
