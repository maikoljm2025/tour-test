// PARTE B — Comentarios: formulario, validación y persistencia local.
// Sin backend: los comentarios nuevos se guardan solo en localStorage de este navegador.
// Contrato con resenas.js: tras insertar o quitar una tarjeta en #lista-testimonios se dispara
// el evento 'testimonios:cambio' para que los filtros se vuelvan a aplicar.
(function () {
    'use strict';

    var CLAVE = 'tour-test:comentarios';
    var ESPERA_MS = 30000; // anti-spam: un comentario cada 30 segundos

    var lista = document.getElementById('lista-testimonios');
    var form = document.getElementById('form-comentario');
    var mensajeEnvio = document.getElementById('mensaje-envio');
    var contador = document.getElementById('contador-comentario');

    if (!lista || !form) return;

    // ---------- almacenamiento ----------

    function leerGuardados() {
        try {
            var datos = JSON.parse(localStorage.getItem(CLAVE) || '[]');
            return Array.isArray(datos) ? datos.filter(esValido) : [];
        } catch (e) {
            return [];
        }
    }

    // Devuelve false si no se pudo escribir (modo privado, almacenamiento lleno o bloqueado).
    function escribir(datos) {
        try {
            localStorage.setItem(CLAVE, JSON.stringify(datos));
            return true;
        } catch (e) {
            return false;
        }
    }

    function guardar(comentario) {
        var datos = leerGuardados();
        datos.unshift(comentario);
        return escribir(datos.slice(0, 50));
    }

    function borrarGuardado(id) {
        escribir(leerGuardados().filter(function (c) { return c.id !== id; }));
    }

    // Lo guardado puede venir alterado a mano: solo se aceptan datos con la forma esperada.
    function esValido(c) {
        return !!c && typeof c.nombre === 'string' && c.nombre.trim() !== '' &&
            typeof c.destino === 'string' && typeof c.texto === 'string' &&
            typeof c.fecha === 'string' &&
            Number.isInteger(c.valoracion) && c.valoracion >= 1 && c.valoracion <= 5;
    }

    function nuevoId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }

    // ---------- tarjetas ----------

    function iniciales(nombre) {
        // Array.from separa por caracteres reales, así un emoji no queda partido a la mitad.
        var partes = nombre.trim().split(/\s+/).filter(Boolean).map(function (p) { return Array.from(p); });
        var texto = partes.length > 1
            ? partes[0][0] + partes[partes.length - 1][0]
            : (partes[0] || ['?']).slice(0, 2).join('');
        return texto.toUpperCase();
    }

    function textoEstrellas(n) {
        return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n);
    }

    function el(etiqueta, clase, texto) {
        var nodo = document.createElement(etiqueta);
        if (clase) nodo.className = clase;
        if (texto !== undefined) nodo.textContent = texto;
        return nodo;
    }

    // Todo el contenido del usuario entra con textContent: nunca como HTML.
    function crearTarjeta(c, esNueva) {
        var li = el('li', 'testimonio' + (esNueva ? ' nuevo' : ''));
        li.dataset.origen = 'cliente';
        li.tabIndex = -1; // permite mover el foco a la tarjeta al publicarla

        var cab = el('div', 'testimonio-cabecera');
        var ini = el('span', 'iniciales', iniciales(c.nombre));
        ini.setAttribute('aria-hidden', 'true');
        var quien = el('div');
        quien.appendChild(el('p', 'testimonio-autor', c.nombre));
        quien.appendChild(el('p', 'testimonio-viaje', c.destino));
        cab.appendChild(ini);
        cab.appendChild(quien);

        var meta = el('div', 'testimonio-meta');
        var est = el('span', 'estrellas', textoEstrellas(c.valoracion));
        est.setAttribute('role', 'img');
        est.setAttribute('aria-label', c.valoracion + ' de 5 estrellas');
        meta.appendChild(est);
        meta.appendChild(el('span', 'testimonio-fecha', c.fecha));
        meta.appendChild(el('span', 'etiqueta-origen', 'Cliente'));

        li.appendChild(cab);
        li.appendChild(meta);
        li.appendChild(el('blockquote', null, c.texto));

        // Solo las tarjetas creadas desde este navegador llevan botón de eliminar.
        var borrar = el('button', 'boton-eliminar', 'Eliminar');
        borrar.type = 'button';
        borrar.appendChild(el('span', 'solo-lectores', ' mi comentario sobre ' + c.destino));
        borrar.addEventListener('click', function () {
            if (!window.confirm('¿Eliminar tu comentario? Esta acción no se puede deshacer.')) return;
            borrarGuardado(c.id);
            li.remove();
            avisarCambio();
            anunciar('Tu comentario se eliminó.', true);
        });
        li.appendChild(borrar);

        return li;
    }

    function avisarCambio() {
        document.dispatchEvent(new CustomEvent('testimonios:cambio'));
    }

    // Escribe en la región role="status" (la anuncia el lector) y, si se pide, le pasa el foco.
    function anunciar(texto, enfocar) {
        mensajeEnvio.textContent = texto;
        if (enfocar) mensajeEnvio.focus();
    }

    // ---------- formulario ----------

    var radios = Array.prototype.slice.call(form.elements.valoracion);

    var campos = {
        nombre: { entradas: [form.elements.nombre], error: document.getElementById('error-nombre') },
        destino: { entradas: [form.elements.destino], error: document.getElementById('error-destino') },
        valoracion: { entradas: radios, error: document.getElementById('error-valoracion') },
        comentario: { entradas: [form.elements.comentario], error: document.getElementById('error-comentario') }
    };

    function validar() {
        var errores = {};
        var nombre = form.elements.nombre.value.trim();
        var texto = form.elements.comentario.value.trim();

        if (nombre.length < 2) errores.nombre = 'Escribe tu nombre (mínimo 2 caracteres).';
        if (!form.elements.destino.value) errores.destino = 'Selecciona el viaje que realizaste.';
        if (!form.elements.valoracion.value) errores.valoracion = 'Elige una valoración de 1 a 5 estrellas.';
        if (texto.length < 10) errores.comentario = 'Cuéntanos un poco más (mínimo 10 caracteres).';

        return errores;
    }

    function mostrarErrores(errores) {
        var primero = null;
        Object.keys(campos).forEach(function (clave) {
            var campo = campos[clave];
            var msg = errores[clave];
            campo.error.hidden = !msg;
            campo.error.textContent = msg || '';
            campo.entradas.forEach(function (entrada) {
                if (msg) entrada.setAttribute('aria-invalid', 'true');
                else entrada.removeAttribute('aria-invalid');
            });
            if (msg && !primero) primero = campo.entradas[0];
        });
        return primero;
    }

    var ultimoEnvio = leerGuardados().reduce(function (max, c) {
        return Math.max(max, c.creado || 0);
    }, 0);

    form.elements.comentario.addEventListener('input', function () {
        contador.textContent = this.value.length + ' / 500';
    });

    // Un error ya mostrado se quita en cuanto se corrige su campo (no aparecen errores nuevos al escribir).
    function revisarCampo(e) {
        var errores = validar();
        Object.keys(campos).forEach(function (clave) {
            var campo = campos[clave];
            if (campo.entradas.indexOf(e.target) === -1 || campo.error.hidden || errores[clave]) return;
            campo.error.hidden = true;
            campo.error.textContent = '';
            campo.entradas.forEach(function (entrada) { entrada.removeAttribute('aria-invalid'); });
        });
    }
    form.addEventListener('input', revisarCampo);
    form.addEventListener('change', revisarCampo);

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        mensajeEnvio.textContent = '';

        var errores = validar();
        var primerError = mostrarErrores(errores);
        if (primerError) {
            var n = Object.keys(errores).length;
            // El lector lee el error del campo enfocado; el resumen avisa si hay más.
            anunciar(n === 1 ? 'Revisa el campo marcado.' : 'Revisa los ' + n + ' campos marcados.');
            primerError.focus();
            return;
        }

        // Campo trampa lleno = bot: se finge éxito y no se publica nada.
        if (form.elements.sitio_web.value) {
            form.reset();
            anunciar('¡Gracias! Tu comentario se recibió.');
            return;
        }

        var espera = ultimoEnvio + ESPERA_MS - Date.now();
        if (espera > 0) {
            anunciar('Espera ' + Math.ceil(espera / 1000) + ' segundos antes de publicar otro comentario.');
            return;
        }

        var comentario = {
            id: nuevoId(),
            creado: Date.now(),
            nombre: form.elements.nombre.value.trim(),
            destino: form.elements.destino.value,
            valoracion: Number(form.elements.valoracion.value),
            texto: form.elements.comentario.value.trim(),
            fecha: new Date().toLocaleDateString('es', { month: 'long', year: 'numeric' })
        };

        ultimoEnvio = comentario.creado;
        var guardado = guardar(comentario);
        var tarjeta = crearTarjeta(comentario, true);
        lista.insertBefore(tarjeta, lista.firstChild);
        avisarCambio();

        form.reset();
        contador.textContent = '0 / 500';

        var aviso = guardado ? '' : ' No se pudo guardar en este navegador: desaparecerá al recargar la página.';

        // Si el filtro activo es "Google", resenas.js la oculta: se avisa y el foco va al mensaje.
        if (tarjeta.hidden) {
            anunciar('¡Gracias, ' + comentario.nombre + '! Tu comentario se publicó, pero el filtro actual lo oculta: ' +
                'elige "Todas" o "Comentarios de clientes" para verlo.' + aviso, true);
        } else {
            anunciar('¡Gracias, ' + comentario.nombre + '! Tu comentario ya aparece primero en la lista.' + aviso);
            tarjeta.focus();
        }
    });

    // ---------- arranque ----------

    var guardados = leerGuardados();
    // Comentarios guardados antes de existir el botón Eliminar no tienen id: se les asigna uno.
    if (guardados.some(function (c) { return !c.id; })) {
        guardados.forEach(function (c) { if (!c.id) c.id = nuevoId(); });
        escribir(guardados);
    }
    guardados.slice().reverse().forEach(function (c) {
        lista.insertBefore(crearTarjeta(c, false), lista.firstChild);
    });
    avisarCambio();
})();
