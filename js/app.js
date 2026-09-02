/* =============================================
   PawVille — Pet Shop Application
   Temario JS: tipos de datos, operadores, cadenas,
   objetos, arrays, clases, JSON, Map, eventos
   ============================================= */

// ============================================================
// 1. TIPOS DE DATOS, VARIABLES Y CONSTANTES
// ============================================================
const NOMBRE_TIENDA = 'PawVille';           // string (constante)
const ENVIO_GRATIS_MINIMO = 150.0;          // number — IEEE 754
const IGV_PORCENTAJE = 0.18;                // number
const ID_PEDIDO_BASE = 1000000n;            // BigInt
const STORAGE_KEY = 'pawville-cart';        // string constante
const IMAGEN_RESPALDO = 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=300&fit=crop';

let categoriaActiva = 'todos';              // string (variable let)
let consultaBusqueda = '';                  // string
let ordenActual = 'default';                // string
let numeroPedido = ID_PEDIDO_BASE;          // BigInt — se incrementa al comprar

// Colección Set para categorías únicas visitadas
const categoriasVisitadas = new Set(['todos']);

// ============================================================
// 2. CLASES Y OBJETOS EN JAVASCRIPT
// ============================================================
class Producto {
  constructor(id, nombre, descripcion, precio, categoria, tipo, imagen, precioAnterior = null, badge = null) {
    this.id = id;                           // number
    this.nombre = nombre;                   // string
    this.descripcion = descripcion;
    this.precio = precio;
    this.precioAnterior = precioAnterior;
    this.categoria = categoria;
    this.tipo = tipo;
    this.imagen = imagen;
    this.badge = badge;
    this.disponible = true;                 // boolean
  }

  obtenerPrecioFormateado() {
    return formatearPrecio(this.precio);
  }

  tieneDescuento() {
    return this.precioAnterior !== null && this.precioAnterior > this.precio;
  }

  calcularAhorro() {
    if (!this.tieneDescuento()) return 0;
    return Math.abs(this.precioAnterior - this.precio);
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      precio: this.precio,
      precioAnterior: this.precioAnterior,
      categoria: this.categoria,
      tipo: this.tipo,
      imagen: this.imagen,
      badge: this.badge
    };
  }
}

class ItemCarrito {
  constructor(producto, cantidad = 1) {
    this.producto = producto;
    this.cantidad = cantidad;
  }

  obtenerSubtotal() {
    return this.producto.precio * this.cantidad;
  }

  incrementar() {
    this.cantidad += 1;
  }

  decrementar() {
    this.cantidad -= 1;
  }
}

class CarritoCompras {
  constructor() {
    this.items = [];                      // array lineal
    this.cargarDesdeStorage();
  }

  agregar(producto) {
    const existente = this.items.find((item) => item.producto.id === producto.id);

    if (existente) {
      existente.incrementar();
    } else {
      this.items.push(new ItemCarrito(producto));
    }

    this.guardarEnStorage();
    console.log(`[Carrito] Producto agregado: ${producto.nombre}`);
  }

  eliminar(idProducto) {
    this.items = this.items.filter((item) => item.producto.id !== idProducto);
    this.guardarEnStorage();
  }

  actualizarCantidad(idProducto, delta) {
    const item = this.items.find((i) => i.producto.id === idProducto);
    if (!item) return;

    if (delta > 0) {
      item.incrementar();
    } else {
      item.decrementar();
    }

    if (item.cantidad <= 0) {
      this.eliminar(idProducto);
    } else {
      this.guardarEnStorage();
    }
  }

  vaciar() {
    this.items = [];
    this.guardarEnStorage();
  }

  obtenerTotal() {
    let total = 0;
    for (let i = 0; i < this.items.length; i++) {
      total += this.items[i].obtenerSubtotal();
    }
    return total;
  }

  obtenerCantidadTotal() {
    return this.items.reduce((acum, item) => acum + item.cantidad, 0);
  }

  estaVacio() {
    return this.items.length === 0;
  }

  // JSON: serialización y deserialización con try-catch
  guardarEnStorage() {
    try {
      const datosJSON = JSON.stringify(this.items.map((item) => ({
        id: item.producto.id,
        cantidad: item.cantidad
      })));
      localStorage.setItem(STORAGE_KEY, datosJSON);
    } catch (error) {
      console.error('Error al guardar carrito:', error.message);
      alert('No se pudo guardar el carrito. Intenta de nuevo.');
    }
  }

  cargarDesdeStorage() {
    try {
      const datosGuardados = localStorage.getItem(STORAGE_KEY);
      if (!datosGuardados) return;

      const itemsJSON = JSON.parse(datosGuardados);
      if (!Array.isArray(itemsJSON)) return;

      this.items = [];
      for (const dato of itemsJSON) {
        const producto = mapaProductos.get(dato.id);
        if (producto) {
          this.items.push(new ItemCarrito(producto, dato.cantidad));
        }
      }
    } catch (error) {
      console.error('Error al cargar carrito:', error.message);
      this.items = [];
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

// ============================================================
// 3. ARRAYS (LINEAL Y BIDIMENSIONAL) Y MAP (COLECCIONES)
// ============================================================

// Array bidimensional: matriz de categorías agrupadas por filas
const matrizCategorias = [
  ['perros', 'gatos'],
  ['aves', 'peces'],
  ['accesorios']
];

// Map para etiquetas de categoría
const mapaCategorias = new Map([
  ['perros', 'Perros'],
  ['gatos', 'Gatos'],
  ['aves', 'Aves'],
  ['peces', 'Peces'],
  ['accesorios', 'Accesorios'],
  ['todos', 'Todos']
]);

// Map para badges
const mapaBadges = new Map([
  ['sale', 'Oferta'],
  ['new', 'Nuevo'],
  ['popular', 'Popular']
]);

// Array lineal de datos crudos → instancias de Producto
const datosProductos = [
  [1, 'Royal Canin Adulto', 'Alimento balanceado para perros adultos de razas medianas. Rico en proteínas.', 89.90, 'perros', 'alimento', 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=300&fit=crop', 109.90, 'sale'],
  [2, 'Whiskas Atún', 'Alimento húmedo para gatos con atún real. Pack de 12 unidades.', 34.50, 'gatos', 'alimento', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop', null, 'popular'],
  [3, 'Hueso Dental Premium', 'Hueso masticable que limpia dientes y refresca el aliento de tu perro.', 18.90, 'perros', 'snack', 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=400&h=300&fit=crop', null, 'new'],
  [4, 'Rascador para Gatos', 'Rascador de sisal con plataforma. Ideal para gatos de todas las edades.', 65.00, 'gatos', 'accesorio', 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400&h=300&fit=crop', null, null],
  [5, 'Pelota Interactiva', 'Pelota con sonido interno. Estimula el instinto de caza de tu mascota.', 24.90, 'perros', 'juguete', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop', null, 'new'],
  [6, 'Cama Ortopédica XL', 'Cama memory foam para perros grandes. Funda lavable y antideslizante.', 149.90, 'accesorios', 'accesorio', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop', 189.90, 'sale'],
  [7, 'Alimento para Canarios', 'Mezcla de semillas premium para canarios. Enriquecida con vitaminas.', 12.50, 'aves', 'alimento', 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400&h=300&fit=crop', null, null],
  [8, 'Shampoo Hipoalergénico', 'Shampoo suave para perros y gatos con piel sensible. Sin parabenos.', 28.00, 'accesorios', 'higiene', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop', null, 'popular'],
  [9, 'Pro Plan Gato Indoor', 'Alimento seco para gatos de interior. Control de bolas de pelo.', 95.00, 'gatos', 'alimento', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop', null, null],
  [10, 'Collar Ajustable LED', 'Collar reflectante con luz LED. Seguridad nocturna para paseos.', 35.90, 'accesorios', 'accesorio', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=300&fit=crop', null, 'new'],
  [11, 'Alimento Flakes Tropical', 'Escamas nutritivas para peces tropicales. Fórmula color-enhancing.', 22.00, 'peces', 'alimento', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop', null, null],
  [12, 'Ratón de Peluche', 'Juguete con catnip para gatos. Estimula el juego y ejercicio.', 15.90, 'gatos', 'juguete', 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400&h=300&fit=crop', null, null],
  [13, 'Croquetas Cachorro', 'Alimento para cachorros con DHA para desarrollo cerebral y visual.', 78.50, 'perros', 'alimento', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop', null, 'popular'],
  [14, 'Bebedero Automático', 'Dispensador de agua con filtro. Capacidad de 3 litros.', 55.00, 'accesorios', 'accesorio', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop', null, null],
  [15, 'Semillas para Periquitos', 'Mezcla variada de semillas para periquitos australianos.', 14.90, 'aves', 'alimento', 'https://images.unsplash.com/photo-1459262838948-3e2de6c1ec80?w=400&h=300&fit=crop', null, null],
  [16, 'Acuario Starter Kit', 'Kit completo con acuario de 20L, filtro y decoración incluida.', 189.90, 'peces', 'accesorio', 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=400&h=300&fit=crop', 229.90, 'sale']
];

// Crear instancias de Producto desde array bidimensional de datos
const listaProductos = datosProductos.map((fila) => {
  const [id, nombre, descripcion, precio, categoria, tipo, imagen, precioAnterior, badge] = fila;
  return new Producto(id, nombre, descripcion, precio, categoria, tipo, imagen, precioAnterior, badge);
});

// Map de productos para acceso rápido por ID
const mapaProductos = new Map(listaProductos.map((p) => [p.id, p]));

// Instancia global del carrito
const carrito = new CarritoCompras();

// ============================================================
// 4. EXPRESIONES REGULARES Y MANEJO DE CADENAS
// ============================================================
const REGEX_EMAIL = /^[\w.-]+@[\w.-]+\.\w{2,}$/;
const REGEX_BUSQUEDA = /[a-záéíóúñ0-9]+/gi;
const REGEX_SOLO_NUMEROS = /\d+/;
const REGEX_TARJETA = /^\d{16}$/;
const REGEX_VENCIMIENTO = /^(0[1-9]|1[0-2])\/\d{2}$/;
const REGEX_CVV = /^\d{3,4}$/;
const REGEX_TELEFONO = /^9\d{8}$/;

function formatearPrecio(monto) {
  // Operadores matemáticos + propiedades de Number
  const redondeado = Math.round(monto * 100) / 100;
  const parteEntera = Math.floor(redondeado);
  const parteDecimal = String(Math.round((redondeado - parteEntera) * 100)).padStart(2, '0');

  // Interpolación con backticks (template literals)
  return `S/ ${parteEntera}.${parteDecimal}`;
}

function obtenerEtiquetaCategoria(categoria) {
  // Método Map.get()
  if (mapaCategorias.has(categoria)) {
    return mapaCategorias.get(categoria);
  }
  // Método de cadena: toUpperCase para fallback
  return categoria.charAt(0).toUpperCase() + categoria.slice(1);
}

function obtenerEtiquetaBadge(badge) {
  return mapaBadges.get(badge) || badge;
}

function buscarEnTexto(texto, consulta) {
  // indexOf + includes + expresiones regulares
  const textoMinuscula = texto.toLowerCase();
  const consultaMinuscula = consulta.toLowerCase();

  if (textoMinuscula.includes(consultaMinuscula)) {
    return true;
  }

  const coincidencias = texto.match(REGEX_BUSQUEDA);
  if (coincidencias) {
    for (const palabra of coincidencias) {
      if (palabra.toLowerCase().indexOf(consultaMinuscula) !== -1) {
        return true;
      }
    }
  }

  return false;
}

function validarEmail(correo) {
  // test() de expresión regular
  return REGEX_EMAIL.test(correo.trim());
}

function construirMensajeBienvenida() {
  // Concatenación clásica con +
  const parte1 = 'Bienvenido a ' + NOMBRE_TIENDA;
  // Cadena multilínea con backticks
  const parte2 = `
    Tu tienda de confianza para mascotas.
    Envío gratis en compras mayores a S/ ${ENVIO_GRATIS_MINIMO}`;
  // Método concat()
  return parte1.concat(parte2);
}

// ============================================================
// 5. OPERADORES: MATEMÁTICOS, LÓGICOS, ASIGNACIÓN, BIT A BIT
// ============================================================
function calcularDescuentoEnvio(total) {
  // Operadores lógicos: &&, ||, !
  const aplicaEnvioGratis = total >= ENVIO_GRATIS_MINIMO;
  const costoEnvio = aplicaEnvioGratis ? 0 : 12.50;

  // Operador ternario (estructura condicional)
  return aplicaEnvioGratis ? '¡Envío GRATIS!' : `Envío: S/ ${costoEnvio.toFixed(2)}`;
}

function calcularIGV(subtotal) {
  return subtotal * IGV_PORCENTAJE;
}

function obtenerCodigoCategoria(categoria) {
  // Operadores a nivel de bits (bitwise)
  const codigos = { perros: 1, gatos: 2, aves: 4, peces: 8, accesorios: 16 };
  const codigo = codigos[categoria] || 0;
  // Desplazamiento a la izquierda: multiplicar por 2
  return codigo << 1;
}

function generarIdPedido() {
  // BigInt: incremento con operador +=
  numeroPedido += 1n;
  return numeroPedido.toString();
}

// ============================================================
// 6. REFERENCIAS AL DOM (document)
// ============================================================
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

let productsGrid, productsEmpty, cartPanel, cartOverlay;
let cartItems, cartEmpty, cartFooter, cartBadge;
let cartSubtotal, cartTotal, toast, checkoutModal, paymentModal;
let metodoPagoActivo = 'tarjeta';
let pedidoPendiente = null;

function inicializarReferenciasDOM() {
  productsGrid = document.getElementById('productsGrid');
  productsEmpty = document.getElementById('productsEmpty');
  cartPanel = document.getElementById('cartPanel');
  cartOverlay = document.getElementById('cartOverlay');
  cartItems = document.getElementById('cartItems');
  cartEmpty = document.getElementById('cartEmpty');
  cartFooter = document.getElementById('cartFooter');
  cartBadge = document.getElementById('cartBadge');
  cartSubtotal = document.getElementById('cartSubtotal');
  cartTotal = document.getElementById('cartTotal');
  toast = document.getElementById('toast');
  checkoutModal = document.getElementById('checkoutModal');
  paymentModal = document.getElementById('paymentModal');
}

// ============================================================
// 7. FUNCIONES DE SALIDA: document, console, alert
// ============================================================
function mostrarToast(mensaje) {
  toast.textContent = mensaje;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

function mostrarEnConsola(datos) {
  console.log('--- PawVille Debug ---');
  console.table(datos);
  console.info(`Tienda: ${NOMBRE_TIENDA} | Productos: ${listaProductos.length}`);
}

// ============================================================
// 8. FILTRADO Y ORDENAMIENTO (estructuras de control)
// ============================================================
function obtenerProductosFiltrados() {
  // Spread syntax: copia del array
  let filtrados = [...listaProductos];

  // Estructura condicional if / else if
  if (categoriaActiva !== 'todos') {
    filtrados = filtrados.filter((producto) => producto.categoria === categoriaActiva);
    categoriasVisitadas.add(categoriaActiva);
  }

  // Búsqueda con cadena
  if (consultaBusqueda.length > 0) {
    filtrados = filtrados.filter((producto) => {
      return (
        buscarEnTexto(producto.nombre, consultaBusqueda) ||
        buscarEnTexto(producto.descripcion, consultaBusqueda) ||
        buscarEnTexto(producto.tipo, consultaBusqueda)
      );
    });
  }

  // switch — estructura de control
  switch (ordenActual) {
    case 'price-asc':
      filtrados.sort((a, b) => a.precio - b.precio);
      break;
    case 'price-desc':
      filtrados.sort((a, b) => b.precio - a.precio);
      break;
    case 'name-asc':
      filtrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
      break;
    default:
      break;
  }

  return filtrados;
}

function manejarErrorImagen(imagen) {
  imagen.onerror = null;
  imagen.src = IMAGEN_RESPALDO;
}

function crearHTMLProducto(producto) {
  const badgeHTML = producto.badge
    ? `<span class="product-card__badge product-card__badge--${producto.badge}">${obtenerEtiquetaBadge(producto.badge)}</span>`
    : '';

  const precioAnteriorHTML = producto.tieneDescuento()
    ? `<span class="product-card__price-old">${formatearPrecio(producto.precioAnterior)}</span>`
    : '';

  // Template literal multilínea con interpolación
  return `
    <article class="product-card" data-id="${producto.id}">
      <div class="product-card__image-wrap">
        <img class="product-card__image" src="${producto.imagen}" alt="${producto.nombre}" loading="lazy" onerror="manejarErrorImagen(this)">
        ${badgeHTML}
        <button class="product-card__wishlist" aria-label="Agregar a favoritos">♡</button>
      </div>
      <div class="product-card__body">
        <span class="product-card__category">${obtenerEtiquetaCategoria(producto.categoria)}</span>
        <h3 class="product-card__name">${producto.nombre}</h3>
        <p class="product-card__desc">${producto.descripcion}</p>
        <div class="product-card__footer">
          <div>
            <span class="product-card__price">${formatearPrecio(producto.precio)}</span>
            ${precioAnteriorHTML}
          </div>
          <button class="product-card__add" onclick="agregarAlCarrito(${producto.id})" aria-label="Agregar ${producto.nombre} al carrito">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </div>
    </article>`;
}

function renderizarProductos() {
  const productos = obtenerProductosFiltrados();

  // Estructura condicional
  if (productos.length === 0) {
    productsGrid.innerHTML = '';
    productsEmpty.hidden = false;
    return;
  }

  productsEmpty.hidden = true;

  // Iteración: forEach sobre array
  let htmlAcumulado = '';
  productos.forEach((producto) => {
    htmlAcumulado += crearHTMLProducto(producto);
  });

  productsGrid.innerHTML = htmlAcumulado;
}

// ============================================================
// 9. CARRITO DE COMPRAS
// ============================================================
function agregarAlCarrito(idProducto) {
  const producto = mapaProductos.get(idProducto);

  // Validación con operadores lógicos
  if (!producto || !producto.disponible) {
    alert('Producto no disponible.');
    return;
  }

  carrito.agregar(producto);
  actualizarUICarrito();
  mostrarToast(`✓ ${producto.nombre} agregado al carrito`);
  animarBadge();
}

function eliminarDelCarrito(idProducto) {
  carrito.eliminar(idProducto);
  actualizarUICarrito();
}

function cambiarCantidad(idProducto, delta) {
  carrito.actualizarCantidad(idProducto, delta);
  actualizarUICarrito();
}

function vaciarCarrito() {
  // confirm() como estructura condicional interactiva
  const confirmar = confirm('¿Estás seguro de vaciar el carrito?');
  if (confirmar) {
    carrito.vaciar();
    actualizarUICarrito();
    mostrarToast('Carrito vaciado');
  }
}

function animarBadge() {
  cartBadge.classList.add('bump');
  setTimeout(() => cartBadge.classList.remove('bump'), 400);
}

function actualizarUICarrito() {
  const cantidad = carrito.obtenerCantidadTotal();
  const subtotal = carrito.obtenerTotal();
  const igv = calcularIGV(subtotal);
  const totalConIGV = subtotal + igv;

  cartBadge.textContent = cantidad;
  cartSubtotal.textContent = formatearPrecio(subtotal);
  cartTotal.textContent = formatearPrecio(totalConIGV);

  if (carrito.estaVacio()) {
    cartEmpty.hidden = false;
    cartFooter.hidden = true;
    const itemsExistentes = cartItems.querySelectorAll('.cart-item');
    itemsExistentes.forEach((el) => el.remove());
    return;
  }

  cartEmpty.hidden = true;
  cartFooter.hidden = false;

  // Limpiar items previos
  const itemsPrevios = cartItems.querySelectorAll('.cart-item');
  itemsPrevios.forEach((el) => el.remove());

  // Iteración for...of
  for (const item of carrito.items) {
    const elemento = document.createElement('div');
    elemento.className = 'cart-item';
    elemento.innerHTML = `
      <img class="cart-item__image" src="${item.producto.imagen}" alt="${item.producto.nombre}" onerror="manejarErrorImagen(this)">
      <div class="cart-item__info">
        <div class="cart-item__name">${item.producto.nombre}</div>
        <div class="cart-item__price">${formatearPrecio(item.producto.precio)}</div>
        <div class="cart-item__controls">
          <button class="qty-btn" onclick="cambiarCantidad(${item.producto.id}, -1)" aria-label="Disminuir cantidad">−</button>
          <span class="cart-item__qty">${item.cantidad}</span>
          <button class="qty-btn" onclick="cambiarCantidad(${item.producto.id}, 1)" aria-label="Aumentar cantidad">+</button>
        </div>
      </div>
      <button class="cart-item__remove" onclick="eliminarDelCarrito(${item.producto.id})" aria-label="Eliminar ${item.producto.nombre}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>`;
    cartItems.appendChild(elemento);
  }
}

function abrirCarrito() {
  cartPanel.classList.add('active');
  cartOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function cerrarCarrito() {
  cartPanel.classList.remove('active');
  cartOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ============================================================
// 9b. PANTALLA DE PAGO
// ============================================================
function abrirModalPago() {
  if (carrito.estaVacio()) {
    alert('Tu carrito está vacío. Agrega productos antes de comprar.');
    return;
  }

  const subtotal = carrito.obtenerTotal();
  const igv = calcularIGV(subtotal);
  const total = subtotal + igv;

  pedidoPendiente = {
    subtotal,
    igv,
    total,
    items: carrito.obtenerCantidadTotal(),
    envio: calcularDescuentoEnvio(subtotal)
  };

  document.getElementById('paymentTotal').textContent = formatearPrecio(total);
  cerrarCarrito();
  paymentModal.hidden = false;
  document.body.style.overflow = 'hidden';
  cambiarMetodoPago('tarjeta', document.querySelector('.payment-method[data-method="tarjeta"]'));
}

function cerrarModalPago() {
  paymentModal.hidden = true;
  document.body.style.overflow = '';
}

function cambiarMetodoPago(metodo, boton) {
  metodoPagoActivo = metodo;

  document.querySelectorAll('.payment-method').forEach((btn) => btn.classList.remove('active'));
  if (boton) boton.classList.add('active');

  document.getElementById('formTarjeta').hidden = metodo !== 'tarjeta';
  document.getElementById('formYape').hidden = metodo !== 'yape';
  document.getElementById('formEfectivo').hidden = metodo !== 'efectivo';
}

function formatearNumeroTarjeta(input) {
  let valor = input.value.replace(/\D/g, '').slice(0, 16);
  const grupos = valor.match(/.{1,4}/g);
  input.value = grupos ? grupos.join(' ') : valor;
  actualizarVistaTarjeta();
}

function formatearVencimiento(input) {
  let valor = input.value.replace(/\D/g, '').slice(0, 4);
  if (valor.length >= 2) {
    valor = valor.slice(0, 2) + '/' + valor.slice(2);
  }
  input.value = valor;
  actualizarVistaTarjeta();
}

function formatearTelefono(input) {
  input.value = input.value.replace(/\D/g, '').slice(0, 9);
}

function actualizarVistaTarjeta() {
  const numero = document.getElementById('cardNumber');
  const nombre = document.getElementById('cardName');
  const vence = document.getElementById('cardExpiry');

  const previewNumero = document.getElementById('previewNumero');
  const previewNombre = document.getElementById('previewNombre');
  const previewVence = document.getElementById('previewVence');

  if (numero && previewNumero) {
    previewNumero.textContent = numero.value || '•••• •••• •••• ••••';
  }
  if (nombre && previewNombre) {
    previewNombre.textContent = nombre.value.toUpperCase() || 'TU NOMBRE';
  }
  if (vence && previewVence) {
    previewVence.textContent = vence.value || 'MM/AA';
  }
}

function validarTarjeta(numero) {
  const limpio = numero.replace(/\s/g, '');
  if (!REGEX_TARJETA.test(limpio)) return false;

  // Algoritmo de Luhn
  let suma = 0;
  let alternar = false;
  for (let i = limpio.length - 1; i >= 0; i--) {
    let digito = parseInt(limpio.charAt(i), 10);
    if (alternar) {
      digito *= 2;
      if (digito > 9) digito -= 9;
    }
    suma += digito;
    alternar = !alternar;
  }
  return suma % 10 === 0;
}

function validarFormularioPago() {
  try {
    if (metodoPagoActivo === 'tarjeta') {
      const numero = document.getElementById('cardNumber').value;
      const nombre = document.getElementById('cardName').value.trim();
      const vence = document.getElementById('cardExpiry').value;
      const cvv = document.getElementById('cardCvv').value;
      const email = document.getElementById('cardEmail').value.trim();

      if (!validarTarjeta(numero)) {
        throw new Error('Número de tarjeta inválido. Verifica los 16 dígitos.');
      }
      if (nombre.length < 3) {
        throw new Error('Ingresa el nombre del titular de la tarjeta.');
      }
      if (!REGEX_VENCIMIENTO.test(vence)) {
        throw new Error('Fecha de vencimiento inválida. Usa formato MM/AA.');
      }
      if (!REGEX_CVV.test(cvv)) {
        throw new Error('CVV inválido. Debe tener 3 o 4 dígitos.');
      }
      if (!validarEmail(email)) {
        throw new Error('Correo electrónico inválido.');
      }
      return true;
    }

    if (metodoPagoActivo === 'yape') {
      const telefono = document.getElementById('yapePhone').value;
      const codigo = document.getElementById('yapeCode').value.trim();
      const email = document.getElementById('yapeEmail').value.trim();

      if (!REGEX_TELEFONO.test(telefono)) {
        throw new Error('Ingresa un número de celular válido (9 dígitos, empieza con 9).');
      }
      if (codigo.length < 6) {
        throw new Error('Ingresa el código de operación de Yape o Plin.');
      }
      if (!validarEmail(email)) {
        throw new Error('Correo electrónico inválido.');
      }
      return true;
    }

    if (metodoPagoActivo === 'efectivo') {
      const nombre = document.getElementById('cashName').value.trim();
      const telefono = document.getElementById('cashPhone').value;
      const direccion = document.getElementById('cashAddress').value.trim();

      if (nombre.length < 3) {
        throw new Error('Ingresa tu nombre completo.');
      }
      if (!REGEX_TELEFONO.test(telefono)) {
        throw new Error('Ingresa un teléfono válido (9 dígitos, empieza con 9).');
      }
      if (direccion.length < 10) {
        throw new Error('Ingresa una dirección de entrega válida.');
      }
      return true;
    }

    return false;
  } catch (error) {
    alert('Error: ' + error.message);
    console.error('[Pago]', error.message);
    return false;
  }
}

function procesarPago(evento) {
  evento.preventDefault();

  if (!pedidoPendiente) return;
  if (!validarFormularioPago()) return;

  const btnPagar = evento.target.querySelector('button[type="submit"]');
  if (btnPagar) {
    btnPagar.disabled = true;
    btnPagar.textContent = 'Procesando...';
  }

  // Simular procesamiento de pago
  setTimeout(() => {
    finalizarCompra();
    if (btnPagar) {
      btnPagar.disabled = false;
      const textos = { tarjeta: '🔒 Pagar ahora', yape: 'Confirmar pago', efectivo: 'Confirmar pedido' };
      btnPagar.textContent = textos[metodoPagoActivo];
    }
  }, 1500);
}

function finalizarCompra() {
  if (!pedidoPendiente) return;

  const idPedido = generarIdPedido();
  const metodos = { tarjeta: 'Tarjeta', yape: 'Yape / Plin', efectivo: 'Contra entrega' };

  cerrarModalPago();

  document.getElementById('checkoutMessage').textContent =
    `Tu pago con ${metodos[metodoPagoActivo]} fue procesado correctamente. Tu pedido está en camino.`;
  document.getElementById('checkoutOrderId').textContent =
    `Pedido N° ${idPedido} — Total: ${formatearPrecio(pedidoPendiente.total)}`;

  checkoutModal.hidden = false;

  console.log(`Pedido #${idPedido} | Método: ${metodos[metodoPagoActivo]} | Total: ${formatearPrecio(pedidoPendiente.total)}`);

  carrito.vaciar();
  actualizarUICarrito();
  pedidoPendiente = null;

  // Limpiar formularios de pago
  document.getElementById('formTarjeta').reset();
  document.getElementById('formYape').reset();
  document.getElementById('formEfectivo').reset();
  actualizarVistaTarjeta();
}

function cerrarModal() {
  checkoutModal.hidden = true;
}

// ============================================================
// 10. EVENTOS: onclick, onchange, addEventListener
// ============================================================

// Función global para filtrar por categoría (onclick en HTML)
function filtrarCategoria(categoria, elemento) {
  categoriaActiva = categoria;

  // Quitar clase active de todas las tarjetas
  const tarjetas = document.querySelectorAll('.category-card');
  tarjetas.forEach((tarjeta) => tarjeta.classList.remove('active'));

  // Agregar active a la seleccionada
  if (elemento) {
    elemento.classList.add('active');
  }

  renderizarProductos();
}

// Función global para búsqueda (oninput en HTML)
function buscarProductos(valor) {
  consultaBusqueda = valor.trim();
  renderizarProductos();
}

// Función global para ordenamiento (onchange en HTML)
function ordenarProductos(valor) {
  ordenActual = valor;
  renderizarProductos();
}

// Función global para newsletter (onsubmit en HTML)
function suscribirNewsletter(evento) {
  evento.preventDefault();

  const inputEmail = document.querySelector('#newsletterForm input[type="email"]');
  const correo = inputEmail.value;

  // try-catch para validación
  try {
    if (!validarEmail(correo)) {
      throw new Error('Correo electrónico inválido');
    }

    mostrarToast('🎉 ¡Gracias por suscribirte! Revisa tu correo.');
    console.log('Nuevo suscriptor:', correo);
    evento.target.reset();
  } catch (error) {
    alert('Error: ' + error.message);
    console.error(error);
  }
}

function toggleMenuMovil() {
  const navLinks = document.getElementById('navLinks');
  navLinks.classList.toggle('open');
}

function cerrarMenuMovil() {
  document.getElementById('navLinks').classList.remove('open');
}

function manejarScroll() {
  const header = document.getElementById('header');
  // Operador de asignación con condición
  if (window.scrollY > 20) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

function manejarTeclaEscape(evento) {
  if (evento.key === 'Escape') {
    cerrarCarrito();
    cerrarModalPago();
    cerrarModal();
  }
}

// ============================================================
// 11. INICIALIZACIÓN — DOMContentLoaded
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  inicializarReferenciasDOM();

  console.log(construirMensajeBienvenida());
  console.log('Matriz de categorías:', matrizCategorias);
  console.log('Categorías en Map:', [...mapaCategorias.entries()]);

  // Demostración operadores de asignación
  let contadorProductos = 0;
  contadorProductos += listaProductos.length;  // +=
  contadorProductos *= 1;                       // *=

  renderizarProductos();
  actualizarUICarrito();

  // addEventListener para eventos adicionales
  window.addEventListener('scroll', manejarScroll);
  document.addEventListener('keydown', manejarTeclaEscape);

  // Recorrer matriz bidimensional con bucle while anidado
  let fila = 0;
  const resumenCategorias = [];
  while (fila < matrizCategorias.length) {
    let columna = 0;
    const grupo = [];
    while (columna < matrizCategorias[fila].length) {
      grupo.push(obtenerEtiquetaCategoria(matrizCategorias[fila][columna]));
      columna++;
    }
    resumenCategorias.push(grupo);
    fila++;
  }

  mostrarEnConsola(resumenCategorias);
});

// Exponer funciones globales para onclick/onchange del HTML
window.manejarErrorImagen = manejarErrorImagen;
window.agregarAlCarrito = agregarAlCarrito;
window.eliminarDelCarrito = eliminarDelCarrito;
window.cambiarCantidad = cambiarCantidad;
window.abrirCarrito = abrirCarrito;
window.cerrarCarrito = cerrarCarrito;
window.vaciarCarrito = vaciarCarrito;
window.abrirModalPago = abrirModalPago;
window.cerrarModalPago = cerrarModalPago;
window.cambiarMetodoPago = cambiarMetodoPago;
window.formatearNumeroTarjeta = formatearNumeroTarjeta;
window.formatearVencimiento = formatearVencimiento;
window.formatearTelefono = formatearTelefono;
window.actualizarVistaTarjeta = actualizarVistaTarjeta;
window.procesarPago = procesarPago;
window.finalizarCompra = finalizarCompra;
window.cerrarModal = cerrarModal;
window.filtrarCategoria = filtrarCategoria;
window.buscarProductos = buscarProductos;
window.ordenarProductos = ordenarProductos;
window.suscribirNewsletter = suscribirNewsletter;
window.toggleMenuMovil = toggleMenuMovil;
window.cerrarMenuMovil = cerrarMenuMovil;
