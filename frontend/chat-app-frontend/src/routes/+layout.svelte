<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '../../static/app.css';
  import { onMount } from 'svelte';
  import { authService } from '$lib/services/auth';
</script>

<div class="min-h-screen">
  <slot />
</div>