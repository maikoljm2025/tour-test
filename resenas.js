// PARTE A — Reseñas: datos de ejemplo, resumen de Google, filtros, orden y "Ver más".
// Todas las reseñas y clientes son ficticios (proyecto académico).
//
// Contrato con comentarios.js: las tarjetas nuevas se insertan en #lista-testimonios con la
// clase "testimonio", data-origen="cliente" y un .estrellas con aria-label "N de 5 estrellas".
// Después de insertar, comentarios.js dispara el evento 'testimonios:cambio' y aquí se vuelven
// a aplicar filtro, orden y límite. Una tarjeta sin data-fecha cuenta como la más reciente.
(function () {
    'use strict';

    var TAMANO_PAGINA = 6;
    var NS_SVG = 'http://www.w3.org/2000/svg';

    var RESENAS = [
        { origen: 'google', nombre: 'Laura Méndez', genero: 'f', viaje: 'Crucero por el Caribe', valoracion: 5, fecha: '2026-09-12',
          texto: 'Todo estuvo perfectamente organizado: traslados, excursiones y hasta una cena sorpresa por nuestro aniversario. Volveremos a viajar con ellos sin dudarlo.' },
        { origen: 'google', nombre: 'Carlos Ramírez', genero: 'm', viaje: 'Tour por Europa', valoracion: 5, fecha: '2026-08-20',
          texto: 'Recorrimos seis países en dos semanas y nunca sentimos prisa. El guía conocía rincones que ninguna app te recomienda. Totalmente recomendado.',
          respuesta: '¡Gracias, Carlos! Nos alegra que disfrutaras la ruta. ¡Te esperamos en el próximo viaje!' },
        { origen: 'google', nombre: 'Sofía Pérez', genero: 'f', viaje: 'Safari en África', valoracion: 5, fecha: '2026-07-15',
          texto: 'Ver a los elefantes al amanecer fue lo más impresionante que he vivido. El alojamiento superó mis expectativas y el equipo estuvo pendiente de todo.' },
        { origen: 'google', nombre: 'Andrés Gómez', genero: 'm', viaje: 'Aventura en la montaña', valoracion: 4, fecha: '2026-06-08',
          texto: 'Excelente experiencia y guías muy preparados. Solo mejoraría la información previa sobre el equipo que se necesita llevar; por lo demás, muy buen viaje.',
          respuesta: 'Gracias por tu sugerencia, Andrés. Ya enviamos una lista de equipo más detallada a los viajeros.' },
        { origen: 'google', nombre: 'Valeria Castro', genero: 'f', viaje: 'París romántico', valoracion: 5, fecha: '2026-10-03',
          texto: 'Mi pareja y yo celebramos cinco años en París y todo salió de película: hotel con vista a la torre, cena en el río y un fotógrafo que no pedimos. Gracias por los detalles.' },
        { origen: 'google', nombre: 'Mateo Jiménez', genero: 'm', viaje: 'Inglaterra clásica', valoracion: 4, fecha: '2026-05-22',
          texto: 'Castillos, pueblos y té a las cuatro. El itinerario fue completo, aunque algunos días quedaron muy cargados. Aun así, volvería a elegirlos.' },
        { origen: 'google', nombre: 'Camila Rojas', genero: 'f', viaje: 'Crucero por el Caribe', valoracion: 5, fecha: '2026-04-17',
          texto: 'Viajé con mis papás y mis hijos y hubo actividades para todas las edades. La asesora nos ayudó con cada duda antes de salir.' },
        { origen: 'google', nombre: 'Joaquín Vargas', genero: 'm', viaje: 'Escapada de fin de semana', valoracion: 3, fecha: '2026-03-09',
          texto: 'El lugar era precioso, pero el traslado de llegada se retrasó casi una hora y perdimos parte del primer día.',
          respuesta: 'Lamentamos el retraso, Joaquín. Cambiamos de proveedor de traslados y te ofrecimos un descuento para tu próxima escapada.' },
        { origen: 'google', nombre: 'Isabella Soto', genero: 'f', viaje: 'Tour por Europa', valoracion: 5, fecha: '2026-02-26',
          texto: 'Era mi primera vez fuera del país y me sentí acompañada todo el tiempo. Me ayudaron incluso con los trámites de visa y el seguro de viaje.' },
        { origen: 'google', nombre: 'Nicolás Araya', genero: 'm', viaje: 'Safari en África', valoracion: 5, fecha: '2026-02-02',
          texto: 'Los guías conocían a los animales como si fueran vecinos. Las noches de campamento bajo las estrellas valieron cada colón del viaje.' },
        { origen: 'google', nombre: 'Daniela Fonseca', genero: 'f', viaje: 'Tíbet espiritual', valoracion: 4, fecha: '2026-01-18',
          texto: 'Paisajes y monasterios inolvidables. Recomiendo prepararse bien para la altura; el equipo nos dio consejos útiles desde antes de viajar.' },
        { origen: 'google', nombre: 'Emilio Salas', genero: 'm', viaje: 'París romántico', valoracion: 5, fecha: '2025-12-28',
          texto: 'Despedimos el año frente a la torre. Todo puntual, hoteles excelentes y un trato muy cálido de principio a fin.' },

        { origen: 'cliente', nombre: 'María Hernández', genero: 'f', viaje: 'Escapada de fin de semana', valoracion: 5, fecha: '2026-05-30',
          texto: 'Viajo con movilidad reducida y me asesoraron con mucho respeto para elegir hoteles y actividades accesibles. Me sentí cuidada en todo momento.' },
        { origen: 'cliente', nombre: 'Diego Torres', genero: 'm', viaje: 'Tíbet espiritual', valoracion: 4, fecha: '2026-04-25',
          texto: 'Un viaje que cambia la forma de ver las cosas. La altura es exigente, pero el equipo nos acompañó y nos explicó cada paso con paciencia.' },
        { origen: 'cliente', nombre: 'Paula Quesada', genero: 'f', viaje: 'Inglaterra clásica', valoracion: 5, fecha: '2026-09-28',
          texto: 'Mandé mi consulta por la web y en el mismo día ya tenía una propuesta a mi medida. Cero sorpresas en el precio final.' },
        { origen: 'cliente', nombre: 'Fernando Mora', genero: 'm', viaje: 'Aventura en la montaña', valoracion: 5, fecha: '2026-07-30',
          texto: 'Fuimos un grupo de amigos y el equipo adaptó la ruta a nuestro ritmo. Nos dieron seguridad sin quitarle emoción a la aventura.' }
    ];

    var lista = document.getElementById('lista-testimonios');
    var filtros = document.getElementById('filtros');
    var estadoFiltro = document.getElementById('estado-filtro');
    var selectOrden = document.getElementById('orden');
    var botonVerMas = document.getElementById('ver-mas');
    var botonVerTodas = document.getElementById('ver-todas');

    if (!lista || !filtros) return;

    var filtroActual = 'todos';
    var ordenActual = 'recientes';
    var limite = TAMANO_PAGINA;

    // ---------- utilidades ----------

    function el(etiqueta, clase, texto) {
        var nodo = document.createElement(etiqueta);
        if (clase) nodo.className = clase;
        if (texto !== undefined) nodo.textContent = texto;
        return nodo;
    }

    function textoEstrellas(n) {
        return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n);
    }

    function iniciales(nombre) {
        var partes = nombre.trim().split(/\s+/);
        return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
    }

    // Foto de perfil (avatares.js). Si ese archivo no cargó, se usan las iniciales.
    function avatarDe(persona) {
        if (window.crearAvatar) return window.crearAvatar(persona);
        var ini = el('span', 'iniciales', iniciales(persona.nombre));
        ini.setAttribute('aria-hidden', 'true');
        return ini;
    }

    // Los comentarios que publica el formulario (comentarios.js) traen solo las iniciales:
    // aquí se cambian por el avatar de esa persona para que se vean igual que las reseñas.
    function mejorarAvatares() {
        if (!window.crearAvatar) return;
        lista.querySelectorAll('.testimonio-cabecera .iniciales').forEach(function (ini) {
            var autor = ini.parentNode.querySelector('.testimonio-autor');
            if (autor) ini.replaceWith(window.crearAvatar({ nombre: autor.textContent }));
        });
    }

    function mesAnio(iso) {
        return new Date(iso + 'T12:00:00').toLocaleDateString('es', { month: 'long', year: 'numeric' });
    }

    function etiquetaOrigen(origen) {
        var span = el('span', 'etiqueta-origen');
        if (origen === 'google') {
            var svg = document.createElementNS(NS_SVG, 'svg');
            svg.setAttribute('aria-hidden', 'true');
            svg.setAttribute('focusable', 'false');
            var uso = document.createElementNS(NS_SVG, 'use');
            uso.setAttribute('href', '#logo-google');
            svg.appendChild(uso);
            span.appendChild(svg);
            span.appendChild(document.createTextNode('Google'));
        } else {
            span.textContent = 'Cliente';
        }
        return span;
    }

    // ---------- tarjetas ----------

    // Todo entra con textContent: nunca como HTML.
    function crearTarjeta(r) {
        var li = el('li', 'testimonio');
        li.dataset.origen = r.origen;
        li.dataset.fecha = String(Date.parse(r.fecha));

        var cab = el('div', 'testimonio-cabecera');
        var quien = el('div');
        quien.appendChild(el('p', 'testimonio-autor', r.nombre));
        quien.appendChild(el('p', 'testimonio-viaje', r.viaje));
        cab.appendChild(avatarDe(r));
        cab.appendChild(quien);

        var meta = el('div', 'testimonio-meta');
        var est = el('span', 'estrellas', textoEstrellas(r.valoracion));
        est.setAttribute('role', 'img');
        est.setAttribute('aria-label', r.valoracion + ' de 5 estrellas');
        meta.appendChild(est);
        meta.appendChild(el('span', 'testimonio-fecha', mesAnio(r.fecha)));
        meta.appendChild(etiquetaOrigen(r.origen));

        li.appendChild(cab);
        li.appendChild(meta);
        li.appendChild(el('blockquote', null, r.texto));

        if (r.respuesta) {
            var resp = el('p', 'respuesta');
            resp.appendChild(el('strong', null, 'Respuesta de la agencia'));
            resp.appendChild(document.createTextNode(r.respuesta));
            li.appendChild(resp);
        }
        return li;
    }

    // ---------- resumen de Google (calculado con las reseñas de origen Google) ----------

    function pintarResumen() {
        var google = RESENAS.filter(function (r) { return r.origen === 'google'; });
        var total = google.length;
        var cuenta = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        var suma = 0;
        google.forEach(function (r) {
            cuenta[r.valoracion]++;
            suma += r.valoracion;
        });
        var promedio = total ? suma / total : 0;
        var promedioTexto = promedio.toLocaleString('es', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

        document.getElementById('resumen-nota').textContent = promedioTexto;
        var estrellas = document.getElementById('resumen-estrellas');
        estrellas.textContent = textoEstrellas(Math.round(promedio));
        estrellas.setAttribute('aria-label', promedioTexto + ' de 5 estrellas');
        document.getElementById('resumen-total').textContent = total + ' reseñas en Google';

        var distribucion = document.getElementById('distribucion');
        distribucion.textContent = '';
        [5, 4, 3, 2, 1].forEach(function (n) {
            var pct = total ? Math.round(cuenta[n] / total * 100) : 0;
            var nombre = n + (n === 1 ? ' estrella' : ' estrellas');
            var li = el('li');
            li.appendChild(el('span', null, nombre));
            var barra = el('progress');
            barra.max = 100;
            barra.value = pct;
            barra.setAttribute('aria-label', nombre + ': ' + pct + ' %');
            li.appendChild(barra);
            li.appendChild(el('span', null, pct + ' %'));
            distribucion.appendChild(li);
        });
    }

    // ---------- filtro, orden y "Ver más" ----------

    function valoracionDe(tarjeta) {
        var est = tarjeta.querySelector('.estrellas');
        var n = est ? parseInt(est.getAttribute('aria-label'), 10) : 0;
        return isNaN(n) ? 0 : n;
    }

    // Las tarjetas sin fecha (comentarios recién publicados) cuentan como las más recientes.
    function fechaDe(tarjeta) {
        return tarjeta.dataset.fecha ? Number(tarjeta.dataset.fecha) : Infinity;
    }

    function comparar(a, b) {
        return a < b ? 1 : a > b ? -1 : 0; // mayor primero
    }

    function ordenar(tarjetas) {
        tarjetas.sort(function (a, b) {
            if (ordenActual === 'mejores') {
                return comparar(valoracionDe(a), valoracionDe(b)) || comparar(fechaDe(a), fechaDe(b));
            }
            return comparar(fechaDe(a), fechaDe(b));
        });
        // Solo se reordena el DOM si el orden cambió (así no se reinician las animaciones).
        var actuales = Array.prototype.slice.call(lista.children);
        var cambio = tarjetas.some(function (t, i) { return t !== actuales[i]; });
        if (cambio) tarjetas.forEach(function (t) { lista.appendChild(t); });
    }

    function aplicar() {
        mejorarAvatares();
        var tarjetas = Array.prototype.slice.call(lista.querySelectorAll('.testimonio'));
        ordenar(tarjetas);

        var coinciden = 0;
        var visibles = 0;
        tarjetas.forEach(function (t) {
            var coincide = filtroActual === 'todos' || t.dataset.origen === filtroActual;
            if (coincide) coinciden++;
            // Un comentario recién publicado se muestra siempre (si coincide con el filtro).
            var mostrar = coincide && (visibles < limite || t.classList.contains('nuevo'));
            t.hidden = !mostrar;
            if (mostrar) visibles++;
        });

        estadoFiltro.textContent = coinciden === 0
            ? 'No hay opiniones para este filtro.'
            : 'Mostrando ' + visibles + ' de ' + coinciden + (coinciden === 1 ? ' opinión.' : ' opiniones.');

        var faltan = coinciden - visibles;
        botonVerMas.hidden = faltan <= 0;
        botonVerMas.textContent = 'Ver más opiniones (' + faltan + ' restantes)';
        return tarjetas.filter(function (t) { return !t.hidden; });
    }

    function marcarFiltro(valor) {
        filtroActual = valor;
        filtros.querySelectorAll('button[data-filtro]').forEach(function (b) {
            b.setAttribute('aria-pressed', String(b.dataset.filtro === valor));
        });
    }

    function enfocar(tarjeta) {
        if (!tarjeta) return;
        tarjeta.setAttribute('tabindex', '-1');
        tarjeta.focus();
    }

    filtros.addEventListener('click', function (e) {
        var boton = e.target.closest('button[data-filtro]');
        if (!boton) return;
        marcarFiltro(boton.dataset.filtro);
        limite = TAMANO_PAGINA;
        aplicar();
    });

    selectOrden.addEventListener('change', function () {
        ordenActual = this.value;
        limite = TAMANO_PAGINA;
        aplicar();
    });

    botonVerMas.addEventListener('click', function () {
        var antes = lista.querySelectorAll('.testimonio:not([hidden])').length;
        limite += TAMANO_PAGINA;
        // El foco pasa a la primera tarjeta nueva para que el teclado no se pierda.
        enfocar(aplicar()[antes]);
    });

    botonVerTodas.addEventListener('click', function () {
        marcarFiltro('google');
        limite = Infinity;
        var visibles = aplicar();
        lista.scrollIntoView({ behavior: 'smooth', block: 'start' });
        enfocar(visibles[0]);
    });

    document.addEventListener('testimonios:cambio', aplicar);

    // ---------- arranque ----------

    RESENAS.forEach(function (r) { lista.appendChild(crearTarjeta(r)); });
    pintarResumen();
    aplicar();
})();
