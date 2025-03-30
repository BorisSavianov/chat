<!-- src/routes/chat/profile/+page.svelte -->
<script lang="ts">
  import { authStore } from '$lib/stores/store';
</script>

<title>Profile</title>
<div class="p-6">
  <h1 class="text-2xl font-bold mb-6">User Profile</h1>

  {#if $authStore.user}
    <div class="bg-white shadow rounded p-6">
      <div class="mb-4">
        <label class="block text-gray-700 font-bold mb-2">Username</label>
        <p class="bg-gray-100 p-2 rounded">{$authStore.user.username}</p>
      </div>

      <div>
        <label class="block text-gray-700 font-bold mb-2">Member Since</label>
        <p class="bg-gray-100 p-2 rounded">
          {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  {:else}
    <p>Please log in to view your profile</p>
  {/if}
</div>