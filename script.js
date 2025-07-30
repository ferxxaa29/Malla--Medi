document.addEventListener('DOMContentLoaded', function() {
    const ramos = document.querySelectorAll('.ramo');
    let totalCreditos = 0;
    const creditosElement = document.getElementById('total-creditos');
    
    // Inicializar ramos
    ramos.forEach(ramo => {
        const requisitos = ramo.dataset.requisitos.split(',').map(item => item.trim());
        
        // Verificar si es un requisito de créditos
        const creditosRequisitos = requisitos.filter(req => !isNaN(req));
        if (creditosRequisitos.length > 0) {
            ramo.classList.add('bloqueado');
        }
        
        // Verificar otros requisitos
        if (requisitos.some(req => req !== '' && isNaN(req) && req !== 'Todos')) {
            ramo.classList.add('bloqueado');
        }
        
        // Añadir evento click
        ramo.addEventListener('click', function() {
            if (this.classList.contains('bloqueado') || this.classList.contains('completado')) return;
            
            // Efecto visual de onda
            const onda = document.createElement('div');
            onda.classList.add('onda');
            const rect = this.getBoundingClientRect();
            onda.style.width = rect.height + 'px';
            onda.style.height = rect.height + 'px';
            onda.style.left = (rect.width / 2 - rect.height / 2) + 'px';
            onda.style.top = '0';
            this.appendChild(onda);
            
            // Eliminar el elemento después de la animación
            setTimeout(() => {
                onda.remove();
            }, 500);
            
            // Marcar como completado
            this.classList.add('completado');
            
            // Sumar créditos
            const creditos = parseInt(this.dataset.creditos);
            totalCreditos += creditos;
            creditosElement.textContent = totalCreditos;
            
            // Desbloquear ramos que dependen de este
            const nombreRamo = this.querySelector('h4').textContent;
            desbloquearRamos(nombreRamo);
            
            // Verificar requisitos de créditos
            verificarRequisitosCreditos();
            
            // Verificar requisitos "Todos"
            verificarRequisitosTodos();
        });
    });
    
    function desbloquearRamos(nombreRamo) {
        ramos.forEach(ramo => {
            if (ramo.classList.contains('completado')) return;
            
            const requisitos = ramo.dataset.requisitos.split(',').map(item => item.trim());
            if (requisitos.includes(nombreRamo)) {
                // Verificar si todos los requisitos están completados
                const todosRequisitosCompletados = requisitos.every(req => {
                    if (req === '') return true;
                    if (!isNaN(req)) return totalCreditos >= parseInt(req);
                    if (req === 'Todos') return false; // Se maneja en otra función
                    
                    // Buscar si el ramo requisito está completado
                    const ramosRequisitos = Array.from(document.querySelectorAll('.ramo h4'))
                        .filter(h4 => h4.textContent === req)
                        .map(h4 => h4.closest('.ramo'));
                    
                    return ramosRequisitos.some(r => r.classList.contains('completado'));
                });
                
                if (todosRequisitosCompletados) {
                    ramo.classList.remove('bloqueado');
                }
            }
        });
    }
    
    function verificarRequisitosCreditos() {
        ramos.forEach(ramo => {
            if (ramo.classList.contains('completado')) return;
            
            const requisitos = ramo.dataset.requisitos.split(',').map(item => item.trim());
            const creditosRequisitos = requisitos.filter(req => !isNaN(req));
            
            if (creditosRequisitos.length > 0) {
                const creditosNecesarios = Math.max(...creditosRequisitos.map(cr => parseInt(cr)));
                if (totalCreditos >= creditosNecesarios) {
                    // Verificar si hay otros requisitos
                    const otrosRequisitos = requisitos.filter(req => isNaN(req) && req !== 'Todos');
                    if (otrosRequisitos.length === 0 || otrosRequisitos.every(req => {
                        const ramosRequisitos = Array.from(document.querySelectorAll('.ramo h4'))
                            .filter(h4 => h4.textContent === req)
                            .map(h4 => h4.closest('.ramo'));
                        
                        return ramosRequisitos.some(r => r.classList.contains('completado'));
                    })) {
                        ramo.classList.remove('bloqueado');
                    }
                }
            }
        });
    }
    
    function verificarRequisitosTodos() {
        const ramosCompletados = document.querySelectorAll('.ramo.completado').length;
        const totalRamos = document.querySelectorAll('.ramo:not([data-requisitos="Todos"])').length;
        
        if (ramosCompletados === totalRamos) {
            document.querySelectorAll('.ramo[data-requisitos="Todos"]').forEach(ramo => {
                ramo.classList.remove('bloqueado');
            });
        }
    }
    
    // Función para mostrar tooltips con los requisitos
    ramos.forEach(ramo => {
        ramo.addEventListener('mouseenter', function() {
            if (this.classList.contains('bloqueado') {
                const requisitos = this.dataset.requisitos;
                if (requisitos && requisitos !== '') {
                    const tooltip = document.createElement('div');
                    tooltip.className = 'tooltip';
                    tooltip.textContent = `Requisitos: ${requisitos}`;
                    
                    const rect = this.getBoundingClientRect();
                    tooltip.style.position = 'fixed';
                    tooltip.style.left = `${rect.left}px`;
                    tooltip.style.top = `${rect.top - 40}px`;
                    tooltip.style.backgroundColor = 'rgba(0,0,0,0.8)';
                    tooltip.style.color = 'white';
                    tooltip.style.padding = '5px 10px';
                    tooltip.style.borderRadius = '4px';
                    tooltip.style.zIndex = '1000';
                    tooltip.style.fontSize = '0.8rem';
                    
                    document.body.appendChild(tooltip);
                    
                    this._tooltip = tooltip;
                }
            }
        });
        
        ramo.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                this._tooltip.remove();
                delete this._tooltip;
            }
        });
    });
});
