import App from './App.svelte';

const target = document.getElementById('app');
if (!target) {
  throw new Error('#app mount point not found');
}

export default new App({ target });
