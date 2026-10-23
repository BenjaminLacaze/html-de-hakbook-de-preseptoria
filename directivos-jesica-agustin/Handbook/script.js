const standardBtn = document.getElementById('standardBtn');
  const pompomBtn = document.getElementById('pompomBtn');
  function setSkin(skin) {
    const isPompom = skin === 'pompom';
    document.body.classList.toggle('pompom', isPompom);
    standardBtn.classList.toggle('active', !isPompom);
    pompomBtn.classList.toggle('active', isPompom);
    standardBtn.setAttribute('aria-pressed', String(!isPompom));
    pompomBtn.setAttribute('aria-pressed', String(isPompom));
    document.querySelectorAll('.pompom-only').forEach(el => el.style.display = isPompom ? 'inline-flex' : 'none');
  }
  standardBtn.addEventListener('click', () => setSkin('standard'));
  pompomBtn.addEventListener('click', () => setSkin('pompom'));
