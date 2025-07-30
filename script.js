document.addEventListener('DOMContentLoaded', function() {
    // Elementos principales
    const ramos = document.querySelectorAll('.ramo');
    let totalCreditos = 0;
    const creditosElement = document.getElementById('total-creditos');
    const porcentajeElement = document.getElementById('porcentaje-completado');
    const barraAvance = document.getElementById('barra-avance');
    const totalRamos = ramos.length;
    
    // Elementos para registro de CFG y electivos
    const listaCFG = document.getElementById('lista-cfg');
    const listaElectivos = document.getElementById('lista-electivos');
    
    // Datos almacenados localmente
    let cfgList = JSON.parse(localStorage.getItem('cfgList')) || [];
    let electivosList = JSON.parse(localStorage.getItem('electivosList')) || [];
    
    // Inicialización
    initMalla();
    actualizarListas();
    actualizarProgreso();
    
    // Función principal de inicialización
    function initMalla() {
        ramos.forEach(ramo => {
            // Verificar estado inicial
            if (verificarRequisitos(ramo)) {
                ramo.classList.remove('bloqueado');
            } else {
                ramo.classList.add('bloqueado');
            }
            
            // Agregar evento click
            ramo.addEventListener('click', function() {
                manejarClickRamo(this);
            });
        });
    }
    
    // Maneja el click en un ramo
    function manejarClickRamo(ramo) {
        if (ramo.classList.contains('completado') || ramo.classList.contains('bloqueado')) return;
        
        // Efecto visual
        crearEfectoOnda(ramo);
        
        // Marcar como completado
        ramo.classList.add('completado');
        
        // Actualizar créditos
        const creditos = parseInt(ramo.dataset.creditos);
        totalCreditos += creditos;
        creditosElement.textContent = totalCreditos;
        
        // Actualizar estado de otros ramos y progreso
        actualizarEstadoRamos();
        actualizarProgreso();
    }
    
    // Crea efecto visual al completar ramo
    function crearEfectoOnda(ramo) {
        const onda = document.createElement('div');
        onda.classList.add('onda');
        const rect = ramo.getBoundingClientRect();
        onda.style.width = rect.height + 'px';
        onda.style.height = rect.height + 'px';
        onda.style.left = (rect.width / 2 - rect.height / 2) + 'px';
        onda.style.top = '0';
        ramo.appendChild(onda);
        
        setTimeout(() => onda.remove(), 500);
    }
    
    // Verifica requisitos de un ramo
    function verificarRequisitos(ramo) {
        const requisitos = ramo.dataset.requisitos.split(',').map(item => item.trim());
        
        // Sin requisitos
        if (requisitos.length === 0 || requisitos[0] === '') return true;
        
        // Requisito "Todos" (para internados)
        if (requisitos.includes('Todos')) {
            const ramosCompletados = document.querySelectorAll('.ramo.completado').length;
            const ramosRequeridos = totalRamos - document.querySelectorAll('[data-requisitos="Todos"]').length;
            return ramosCompletados === ramosRequeridos;
        }
        
        // Requisitos de créditos
        const creditosRequisitos = requisitos.filter(req => !isNaN(req));
        if (creditosRequisitos.length > 0) {
            const creditosNecesarios = Math.max(...creditosRequisitos.map(cr => parseInt(cr)));
            if (totalCreditos < creditosNecesarios) return false;
        }
        
        // Requisitos de ramos específicos
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
    
    // Actualiza estado de todos los ramos
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
    
    // Actualiza barra de progreso
    function actualizarProgreso() {
        const ramosCompletados = document.querySelectorAll('.ramo.completado').length;
        const porcentaje = Math.round((ramosCompletados / totalRamos) * 100);
        porcentajeElement.textContent = porcentaje + '%';
        barraAvance.style.width = porcentaje + '%';
    }
    
    // Actualiza las listas de CFG y electivos
    function actualizarListas() {
        // Limpiar listas
        listaCFG.innerHTML = '';
        listaElectivos.innerHTML = '';
        
        // Agregar items existentes de CFG
        cfgList.forEach((cfg, index) => {
            const item = document.createElement('div');
            item.className = 'item-registro';
            item.innerHTML = `
                <span>${cfg}</span>
                <span class="eliminar-item" data-index="${index}" data-tipo="cfg">×</span>
            `;
            listaCFG.appendChild(item);
        });
        
        // Agregar items existentes de electivos
        electivosList.forEach((electivo, index) => {
            const item = document.createElement('div');
            item.className = 'item-registro';
            item.innerHTML = `
                <span>${electivo}</span>
                <span class="eliminar-item" data-index="${index}" data-tipo="electivo">×</span>
            `;
            listaElectivos.appendChild(item);
        });
        
        // Agregar inputs para nuevos items
        agregarInputRegistro(listaCFG, 'cfg');
        agregarInputRegistro(listaElectivos, 'electivo');
        
        // Configurar eventos para eliminar
        configurarEventosEliminar();
    }
    
    // Agrega input para nuevo registro
    function agregarInputRegistro(contenedor, tipo) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'input-registro';
        input.placeholder = `Escribe tu ${tipo === 'cfg' ? 'CFG' : 'electivo'} y presiona Enter`;
        
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.value.trim() !== '') {
                if (tipo === 'cfg') {
                    cfgList.push(this.value.trim());
                    localStorage.setItem('cfgList', JSON.stringify(cfgList));
                } else {
                    electivosList.push(this.value.trim());
                    localStorage.setItem('electivosList', JSON.stringify(electivosList));
                }
                
                actualizarListas();
                this.value = '';
            }
        });
        
        contenedor.appendChild(input);
    }
    
    // Configura eventos para eliminar items
    function configurarEventosEliminar() {
        document.querySelectorAll('.eliminar-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                const tipo = this.dataset.tipo;
                
                if (tipo === 'cfg') {
                    cfgList.splice(index, 1);
                    localStorage.setItem('cfgList', JSON.stringify(cfgList));
                } else {
                    electivosList.splice(index, 1);
                    localStorage.setItem('electivosList', JSON.stringify(electivosList));
                }
                
                actualizarListas();
            });
        });
    }
});
