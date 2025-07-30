document.addEventListener('DOMContentLoaded', function() {
    const ramos = document.querySelectorAll('.ramo');
    let totalCreditos = 0;
    const creditosElement = document.getElementById('total-creditos');

    function verificarRequisitos(ramo) {
        const requisitos = ramo.dataset.requisitos.split(',').map(item => item.trim());
        
        if (requisitos.length === 0 || requisitos[0] === '') return true;
        
        if (requisitos.includes('Todos')) {
            const totalRamos = document.querySelectorAll('.ramo:not([data-requisitos="Todos"])').length;
            const ramosCompletados = document.querySelectorAll('.ramo.completado').length;
            return ramosCompletados === totalRamos;
        }
        
        const creditosRequisitos = requisitos.filter(req => !isNaN(req));
        if (creditosRequisitos.length > 0) {
            const creditosNecesarios = Math.max(...creditosRequisitos.map(cr => parseInt(cr)));
            if (totalCreditos < creditosNecesarios) return false;
        }
        
        for (const req of requisitos) {
            if (isNaN(req) && req !== '') {
                const ramosRequisitos = Array.from(document.querySelectorAll('.ramo h4'))
                    .filter(h4 => h4.textContent === req)
                    .map(h4 => h4.closest('.ramo'));
                
                if (!ramosRequisitos.some(r => r.classList.contains('completado'))) {
                    return false;
                }
            }
        }
        
        return true;
    }

    function manejarClickRamo(ramo) {
        if (ramo.classList.contains('completado') || ramo.classList.contains('bloqueado')) return;
        
        const onda = document.createElement('div');
        onda.classList.add('onda');
        const rect = ramo.getBoundingClientRect();
        onda.style.width = rect.height + 'px';
        onda.style.height = rect.height + 'px';
        onda.style.left = (rect.width / 2 - rect.height / 2) + 'px';
        onda.style.top = '0';
        ramo.appendChild(onda);
        
        setTimeout(() => onda.remove(), 500);
        
        ramo.classList.add('completado');
        const creditos = parseInt(ramo.dataset.creditos);
        totalCreditos += creditos;
        creditosElement.textContent = totalCreditos;
        
        const nombreRamo = ramo.querySelector('h4').textContent;
        actualizarEstadoRamos();
    }

    function actualizarEstadoRamos() {
        ramos.forEach(ramo => {
            if (ramo.classList.contains('completado')) return;
            
            if (verificarRequisitos(ramo)) {
                ramo.classList.remove('bloqueado');
            } else {
                ramo.classList.add('bloqueado');
            }
        });
    }

    ramos.forEach(ramo => {
        if (verificarRequisitos(ramo)) {
            ramo.classList.remove('bloqueado');
        } else {
            ramo.classList.add('bloqueado');
        }
        
        ramo.addEventListener('click', () => manejarClickRamo(ramo));
    });
});
