<!-- src/routes/register/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { authService } from '$lib/services/auth';
  import { authStore } from '$lib/stores/store';
  
  let username = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let error = '';

  async function handleRegister() {
    // Basic validation
    if (!username || !email || !password) {
      error = 'All fields are required';
      return;
    }

    if (password !== confirmPassword) {
      error = 'Passwords do not match';
      return;
    }

    try {
      const user = await authService.register(username, email, password);
      goto('/chat');
    } catch (err: any) {
      error = err.response?.data?.message || 'Registration failed';
    }
  }
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
  <div class="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold text-center">Register</h2>
    
    {#if error}
      <div class="p-2 text-red-500 bg-red-100 rounded">{error}</div>
    {/if}
    
    <form on:submit|preventDefault={handleRegister} class="space-y-4">
      <div>
        <label for="username" class="block mb-2">Username</label>
        <input 
          type="text" 
          id="username" 
          bind:value={username} 
          required 
          class="w-full p-2 border rounded"
        />
      </div>
      
      <div>
        <label for="email" class="block mb-2">Email</label>
        <input 
          type="email" 
          id="email" 
          bind:value={email} 
          required 
          class="w-full p-2 border rounded"
        />
      </div>
      
      <div>
        <label for="password" class="block mb-2">Password</label>
        <input 
          type="password" 
          id="password" 
          bind:value={password} 
          required 
          class="w-full p-2 border rounded"
        />
      </div>
      
      <div>
        <label for="confirm-password" class="block mb-2">Confirm Password</label>
        <input 
          type="password" 
          id="confirm-password" 
          bind:value={confirmPassword} 
          required 
          class="w-full p-2 border rounded"
        />
      </div>
      
      <button 
        type="submit" 
        class="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600"
      >
        Register
      </button>
    </form>
    
    <p class="text-center">
      Already have an account? <a href="/login" class="text-blue-500">Login</a>
    </p>
  </div>
</div>