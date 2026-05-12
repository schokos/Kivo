document.getElementById('fn-input')?.addEventListener('input', (event) => {
  const value = event.target.value.trim() || 'f(x)=2x+1';
  document.getElementById('plot-output').textContent = 'Aktive Funktion: ' + value;
});
