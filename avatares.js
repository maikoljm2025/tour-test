// PARTE A — Avatares: foto de perfil de cada persona (todas ficticias).
// Si la persona trae `foto` (ruta de una imagen) se usa esa imagen; si no existe o falla al cargar,
// se dibuja un avatar ilustrado en SVG que es siempre el mismo para el mismo nombre.
// No se pide nada a servicios externos.
//
// Uso: window.crearAvatar({ nombre: 'Laura Méndez', genero: 'f', foto: 'resource/images/laura.jpg' })
// devuelve un <div class="avatar"> listo para insertar. `genero` ('f' | 'm') y `foto` son opcionales.
(function () {
    'use strict';

    var NS = 'http://www.w3.org/2000/svg';

    var PIEL = ['#f6d3b8', '#eec09a', '#d9a074', '#b97a57', '#8d5a3c', '#6b3f2a'];
    var PELO = ['#2b1b12', '#4a2c1a', '#7a4a22', '#a5682b', '#1d1d1d', '#8f8f93', '#c8963e'];
    var ESTILOS = {
        f: ['larga', 'chongo', 'rizado', 'bob', 'corta'],
        m: ['corta', 'raya', 'rapado', 'rizado', 'corta'],
        n: ['corta', 'larga', 'rizado', 'bob', 'raya', 'chongo', 'rapado']
    };

    function hash(texto) {
        var h = 2166136261;
        for (var i = 0; i < texto.length; i++) {
            h ^= texto.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    }

    function nodo(etiqueta, atributos) {
        var n = document.createElementNS(NS, etiqueta);
        Object.keys(atributos).forEach(function (k) { n.setAttribute(k, atributos[k]); });
        return n;
    }

    // Devuelve las capas del peinado: lo que va detrás de la cabeza y lo que va delante.
    function peinado(estilo, color) {
        var atras = [];
        var frente = [];
        var flequillo = 'M20 27 C20 13 44 13 44 27 C40 19 28 17 22 29 Z';

        if (estilo === 'larga') {
            atras.push(nodo('path', { d: 'M18 30 C16 10 48 10 46 30 L49 54 L15 54 Z', fill: color }));
            frente.push(nodo('path', { d: flequillo, fill: color }));
        } else if (estilo === 'bob') {
            atras.push(nodo('path', { d: 'M18 30 C16 10 48 10 46 30 L47 43 C40 46 24 46 17 43 Z', fill: color }));
            frente.push(nodo('path', { d: flequillo, fill: color }));
        } else if (estilo === 'chongo') {
            atras.push(nodo('circle', { cx: 32, cy: 11, r: 6, fill: color }));
            frente.push(nodo('path', { d: 'M20 27 C20 13 44 13 44 27 C41 20 36 18 32 18 C28 18 23 20 20 27 Z', fill: color }));
        } else if (estilo === 'rizado') {
            [[21, 24], [25, 17], [32, 14], [39, 17], [43, 24], [32, 19]].forEach(function (p) {
                frente.push(nodo('circle', { cx: p[0], cy: p[1], r: 5.5, fill: color }));
            });
        } else if (estilo === 'raya') {
            frente.push(nodo('path', { d: 'M20 28 C18 13 45 10 44 27 C38 21 29 20 24 24 Z', fill: color }));
        } else if (estilo === 'rapado') {
            frente.push(nodo('path', { d: 'M21 25 C22 15 42 15 43 25 C40 20 24 20 21 25 Z', fill: color }));
        } else {
            frente.push(nodo('path', { d: 'M20 27 C20 13 44 13 44 27 C41 20 36 18 32 18 C28 18 23 20 20 27 Z', fill: color }));
        }
        return { atras: atras, frente: frente };
    }

    function dibujar(nombre, genero) {
        var h = hash(nombre.toLowerCase());
        var piel = PIEL[h % PIEL.length];
        var pelo = PELO[(h >>> 4) % PELO.length];
        var estilos = ESTILOS[genero] || ESTILOS.n;
        var estilo = estilos[(h >>> 8) % estilos.length];
        var tono = (h >>> 12) % 360;
        var gafas = ((h >>> 20) % 4) === 0;
        var barba = genero === 'm' && ((h >>> 22) % 3) === 0;
        var pelos = peinado(estilo, pelo);

        var svg = nodo('svg', { viewBox: '0 0 64 64', 'aria-hidden': 'true', focusable: 'false' });
        svg.appendChild(nodo('rect', { width: 64, height: 64, fill: 'hsl(' + tono + ' 55% 80%)' }));
        pelos.atras.forEach(function (n) { svg.appendChild(n); });
        svg.appendChild(nodo('path', { d: 'M8 64 C8 50 20 44 32 44 C44 44 56 50 56 64 Z', fill: 'hsl(' + ((tono + 150) % 360) + ' 50% 38%)' }));
        svg.appendChild(nodo('rect', { x: 27, y: 36, width: 10, height: 11, rx: 3, fill: piel }));
        svg.appendChild(nodo('rect', { x: 27, y: 36, width: 10, height: 5, fill: 'rgba(0,0,0,0.14)' }));
        svg.appendChild(nodo('circle', { cx: 21, cy: 30, r: 2.6, fill: piel }));
        svg.appendChild(nodo('circle', { cx: 43, cy: 30, r: 2.6, fill: piel }));
        svg.appendChild(nodo('ellipse', { cx: 32, cy: 29, rx: 11, ry: 13, fill: piel }));
        if (barba) {
            svg.appendChild(nodo('path', { d: 'M21 30 C21 46 43 46 43 30 C41 41 23 41 21 30 Z', fill: pelo }));
        }
        pelos.frente.forEach(function (n) { svg.appendChild(n); });

        svg.appendChild(nodo('circle', { cx: 27.5, cy: 30, r: 1.4, fill: '#2b2b2b' }));
        svg.appendChild(nodo('circle', { cx: 36.5, cy: 30, r: 1.4, fill: '#2b2b2b' }));
        svg.appendChild(nodo('path', { d: 'M27.5 35 Q32 39 36.5 35', fill: 'none', stroke: '#8a3b3b', 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
        if (gafas) {
            [27.5, 36.5].forEach(function (x) {
                svg.appendChild(nodo('circle', { cx: x, cy: 30, r: 4.3, fill: 'none', stroke: '#2b2b2b', 'stroke-width': 1.2 }));
            });
            svg.appendChild(nodo('path', { d: 'M31.8 29.5 H32.2', stroke: '#2b2b2b', 'stroke-width': 1.2 }));
        }
        return svg;
    }

    window.crearAvatar = function (persona) {
        var cont = document.createElement('div');
        cont.className = 'avatar';
        cont.setAttribute('aria-hidden', 'true');

        var ilustracion = dibujar(persona.nombre || '?', persona.genero);
        if (persona.foto) {
            var img = document.createElement('img');
            img.alt = '';
            img.loading = 'lazy';
            img.src = persona.foto;
            img.addEventListener('error', function () { img.replaceWith(ilustracion); });
            cont.appendChild(img);
        } else {
            cont.appendChild(ilustracion);
        }
        return cont;
    };
})();
