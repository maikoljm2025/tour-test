// PARTE A — Reseñas: filtros de la lista de testimonios.
// Contrato con comentarios.js: cuando se agrega una tarjeta nueva a #lista-testimonios,
// comentarios.js dispara el evento 'testimonios:cambio' y aquí se vuelve a aplicar el filtro.
(function () {
    'use strict';

    var lista = document.getElementById('lista-testimonios');
    var filtros = document.getElementById('filtros');
    var estadoFiltro = document.getElementById('estado-filtro');

    if (!lista || !filtros) return;

    var filtroActual = 'todos';

    function aplicarFiltro() {
        var visibles = 0;
        lista.querySelectorAll('.testimonio').forEach(function (t) {
            var mostrar = filtroActual === 'todos' || t.dataset.origen === filtroActual;
            t.hidden = !mostrar;
            if (mostrar) visibles++;
        });
        estadoFiltro.textContent = visibles === 1
            ? 'Mostrando 1 opinión.'
            : 'Mostrando ' + visibles + ' opiniones.';
    }

    filtros.addEventListener('click', function (e) {
        var boton = e.target.closest('button[data-filtro]');
        if (!boton) return;
        filtroActual = boton.dataset.filtro;
        filtros.querySelectorAll('button').forEach(function (b) {
            b.setAttribute('aria-pressed', String(b === boton));
        });
        aplicarFiltro();
    });

    document.addEventListener('testimonios:cambio', aplicarFiltro);

    aplicarFiltro();
})();
