// PARTE B — Comentarios: formulario, validación y persistencia local.
// Sin backend: los comentarios nuevos se guardan solo en localStorage de este navegador.
// Contrato con resenas.js: tras insertar una tarjeta en #lista-testimonios se dispara
// el evento 'testimonios:cambio' para que los filtros se vuelvan a aplicar.
(function () {
    'use strict';

    var CLAVE = 'tour-test:comentarios';

    var lista = document.getElementById('lista-testimonios');
    var form = document.getElementById('form-comentario');
    var mensajeEnvio = document.getElementById('mensaje-envio');
    var contador = document.getElementById('contador-comentario');

    if (!lista || !form) return;

    // ---------- almacenamiento ----------

    function leerGuardados() {
        try {
            var datos = JSON.parse(localStorage.getItem(CLAVE) || '[]');
            return Array.isArray(datos) ? datos : [];
        } catch (e) {
            return [];
        }
    }

    function guardar(comentario) {
        try {
            var datos = leerGuardados();
            datos.unshift(comentario);
            localStorage.setItem(CLAVE, JSON.stringify(datos.slice(0, 50)));
        } catch (e) {
            // localStorage no disponible (modo privado, etc.): el comentario se muestra igual.
        }
    }

    // ---------- tarjetas ----------

    function iniciales(nombre) {
        var partes = nombre.trim().split(/\s+/).filter(Boolean);
        var texto = partes.length > 1
            ? partes[0][0] + partes[partes.length - 1][0]
            : (partes[0] || '?').slice(0, 2);
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
        return li;
    }

    function avisarCambio() {
        document.dispatchEvent(new CustomEvent('testimonios:cambio'));
    }

    // ---------- formulario ----------

    var campos = {
        nombre: { entrada: form.elements.nombre, error: document.getElementById('error-nombre') },
        destino: { entrada: form.elements.destino, error: document.getElementById('error-destino') },
        valoracion: { entrada: form.elements.valoracion[0], error: document.getElementById('error-valoracion') },
        comentario: { entrada: form.elements.comentario, error: document.getElementById('error-comentario') }
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
            if (clave !== 'valoracion') {
                if (msg) campo.entrada.setAttribute('aria-invalid', 'true');
                else campo.entrada.removeAttribute('aria-invalid');
            }
            if (msg && !primero) primero = campo.entrada;
        });
        return primero;
    }

    form.elements.comentario.addEventListener('input', function () {
        contador.textContent = this.value.length + ' / 500';
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        mensajeEnvio.textContent = '';

        var primerError = mostrarErrores(validar());
        if (primerError) {
            primerError.focus();
            return;
        }

        var comentario = {
            nombre: form.elements.nombre.value.trim(),
            destino: form.elements.destino.value,
            valoracion: Number(form.elements.valoracion.value),
            texto: form.elements.comentario.value.trim(),
            fecha: new Date().toLocaleDateString('es', { month: 'long', year: 'numeric' })
        };

        guardar(comentario);
        lista.insertBefore(crearTarjeta(comentario, true), lista.firstChild);
        avisarCambio();

        form.reset();
        contador.textContent = '0 / 500';
        mensajeEnvio.textContent = '¡Gracias, ' + comentario.nombre + '! Tu comentario ya aparece en la lista.';
    });

    // ---------- arranque ----------

    leerGuardados().reverse().forEach(function (c) {
        if (c && c.nombre && c.destino && c.texto && c.valoracion >= 1 && c.valoracion <= 5) {
            lista.insertBefore(crearTarjeta(c, false), lista.firstChild);
        }
    });
    avisarCambio();
})();
