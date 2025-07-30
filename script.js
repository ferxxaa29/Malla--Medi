const ramos = document.querySelectorAll('.ramo');
let creditos = 0;

ramos.forEach(ramo => {
  ramo.addEventListener('click', () => {
    if (ramo.classList.contains('aprobado')) return;

    ramo.classList.add('aprobado');
    const c = parseInt(ramo.dataset.creditos);
    creditos += c;
    document.getElementById('creditos').textContent = `Créditos aprobados: ${creditos}`;

    const id = ramo.id;

    ramos.forEach(r => {
      const requisitos = r.dataset.requisitos.split(',').map(s => s.trim()).filter(Boolean);
      if (requisitos.includes(id)) {
        const cumplidos = requisitos.every(req => document.getElementById(req)?.classList.contains('aprobado'));
        if (cumplidos) {
          r.classList.remove('bloqueado');
        }
      }
    });
  });
});
