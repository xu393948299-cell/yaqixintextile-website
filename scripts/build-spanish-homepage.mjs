import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const sourcePath = path.join(root, "index.html");
const outputPath = path.join(root, "es", "index.html");

let html = fs.readFileSync(sourcePath, "utf8");

function replaceRequired(from, to) {
  if (!html.includes(from)) throw new Error(`Expected source fragment not found: ${from.slice(0, 80)}`);
  html = html.replace(from, to);
}

replaceRequired('<html lang="en">', '<html lang="es">');
replaceRequired(
  '<meta name="viewport" content="width=device-width, initial-scale=1">',
  '<meta name="viewport" content="width=device-width, initial-scale=1">\n  <base href="/">',
);
replaceRequired(
  '<title>Wholesale Fabric Manufacturer in Guangzhou | YAQIXIN</title>',
  '<title>Proveedor Mayorista de Telas en Guangzhou | YAQIXIN</title>',
);
replaceRequired(
  '<meta name="description" content="Source cotton, tulle, lace, satin, organza and pleated fabrics from Guangzhou. Ask YAQIXIN about stock, custom colors, samples, MOQ and export packing.">',
  '<meta name="description" content="Proveedor mayorista de telas en Guangzhou. YAQIXIN suministra algodón, tul, malla, organza, encaje, satén y tejidos plisados para compradores B2B, muestras y pedidos a medida.">',
);
replaceRequired('    <link rel="canonical" href="https://www.yaqixintextile.com/">', '    <link rel="canonical" href="https://www.yaqixintextile.com/es">');
replaceRequired('<link rel="alternate" hreflang="en" href="https://www.yaqixintextile.com/">\n  <link rel="alternate" hreflang="es" href="https://www.yaqixintextile.com/es">\n  <link rel="alternate" hreflang="x-default" href="https://www.yaqixintextile.com/">', '<link rel="alternate" hreflang="en" href="https://www.yaqixintextile.com/">\n  <link rel="alternate" hreflang="es" href="https://www.yaqixintextile.com/es">\n  <link rel="alternate" hreflang="x-default" href="https://www.yaqixintextile.com/">\n  <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage","name":"Proveedor Mayorista de Telas en Guangzhou | YAQIXIN","url":"https://www.yaqixintextile.com/es","inLanguage":"es"}</script>');

const translations = new Map([
  ["Wholesale fabric sourcing | Stock + custom programs | 7-day design completion and export support", "Abastecimiento mayorista de telas | Stock y programas a medida | Diseño en 7 días y soporte de exportación"],
  ["Wholesale Fabric / Custom / 7-Day Design", "Telas mayoristas / Personalización / Diseño en 7 días"],
  ["Home", "Inicio"], ["Products", "Productos"], ["About Us", "Nosotros"], ["Customize", "Personalizar"], ["Inquiry", "Consulta"],
  ["Search fabrics", "Buscar telas"], ["Search products", "Buscar productos"], ["Choose language", "Elegir idioma"], ["English", "Inglés"], ["Espanol", "Español"],
  ["See all categories", "Ver todas las categorías"], ["View all plain cotton", "Ver todo el algodón liso"], ["View all tulle", "Ver todo el tul"], ["View all organza", "Ver toda la organza"], ["View all pleated", "Ver todos los plisados"], ["View all lace", "Ver todos los encajes"], ["View all satin", "Ver todos los satinados"],
  ["Plain Cotton Fabric", "Tejido de algodón liso"], ["Canvas Fabric", "Tejido de loneta"], ["Poplin Fabric", "Tejido popelín"], ["Twill Fabric", "Tejido de sarga"], ["Tulle Mesh Fabric", "Tul y tejido de malla"], ["Plain Tulle Fabric", "Tul liso"], ["Stretch Knit Mesh Fabric", "Malla de punto elástica"], ["Holiday Tulle Fabric", "Tul temático"], ["Glitter Tulle Fabric", "Tul con brillo"], ["Rainbow Tulle Fabric", "Tul arcoíris"], ["Print Mesh Fabric", "Malla estampada"], ["3D Tulle Mesh Fabric", "Tul y malla 3D"], ["Flocked Mesh Fabric", "Malla flocada"], ["Sequin Fabric", "Tejido de lentejuelas"], ["Organza Fabric", "Tejido de organza"], ["Pleated Fabric", "Tejido plisado"], ["Lace Fabric", "Tejido de encaje"], ["Satin Fabric", "Tejido satinado"], ["Denim Fabric", "Tejido denim"],
  ["Company profile", "Perfil de empresa"], ["Fabric sourcing support from Guangzhou.", "Apoyo para el abastecimiento de telas desde Guangzhou."], ["From our Guangzhou showroom, we help fabric wholesalers, apparel brands and sourcing teams compare stock fabrics, develop custom colors and prepare samples or bulk orders. The range covers cotton, tulle, organza, pleated fabric, lace, satin and denim.", "Desde nuestro showroom en Guangzhou, ayudamos a mayoristas de telas, marcas de moda y equipos de compra a comparar tejidos de stock, desarrollar colores personalizados y preparar muestras o pedidos a granel. La gama incluye algodón, tul, organza, tejidos plisados, encaje, satén y denim."],
  ["B2B positioning", "Enfoque B2B"], ["Fabric manufacturer", "Proveedor de telas"], ["Primary supply for fabric wholesalers, apparel buyers and trading companies.", "Suministro para mayoristas de telas, compradores de confección y empresas comerciales."], ["Factory experience", "Experiencia de fábrica"], ["15+ years", "Más de 15 años"], ["Factory-backed sourcing support for stock fabrics and buyer-specific orders.", "Apoyo de fábrica para tejidos de stock y pedidos específicos del comprador."], ["Supply capacity", "Capacidad de suministro"], ["900,000m+ / month", "Más de 900.000 m/mes"], ["Monthly supply capability for wholesale stock and coordinated bulk orders.", "Capacidad mensual para stock mayorista y pedidos a granel coordinados."], ["Supply advantage", "Ventaja de suministro"], ["Wholesale + OEM", "Mayorista + OEM"], ["Wholesale price logic, quality-focused selection and custom fabric development.", "Lógica de precio mayorista, selección centrada en la calidad y desarrollo de tejidos a medida."],
  ["Fabric collections", "Colecciones de telas"], ["Explore <mark>Fabric Categories</mark>", "Explore <mark>las categorías de telas</mark>"], ["Browse by fabric family, then compare composition, weight, width, color and MOQ on each product page.", "Explore por familia de tejido y compare composición, gramaje, ancho, color y MOQ en cada página de producto."],
  ["Cotton canvas, poplin and twill in lightweight to heavy constructions for shirts, workwear, trousers and bags.", "Loneta, popelín y sarga de algodón, desde construcciones ligeras hasta pesadas, para camisas, ropa de trabajo, pantalones y bolsos."], ["Plain, stretch, glitter, printed and embroidered tulle for bridal, dresses, dancewear and costume collections.", "Tul liso, elástico, brillante, estampado y bordado para novia, vestidos, danza y colecciones de vestuario."], ["Sheer, shimmer, crepe and liquid organza for dresses, skirts, overlays and dancewear.", "Organza transparente, brillante, crepé y líquida para vestidos, faldas, capas y danza."], ["Pleated mesh, satin and chiffon for dresses, skirts and layered occasionwear.", "Malla, satén y gasa plisados para vestidos, faldas y prendas de ceremonia con capas."], ["Eyelash, beaded, embroidered and trim lace for bridal, dresses and occasionwear.", "Encaje de pestañas, con perlas, bordado y ribetes para novia, vestidos y prendas de ceremonia."], ["Matte, glossy, stretch, liquid and mikado satin for dresses, formalwear and sleepwear.", "Satén mate, brillante, elástico, líquido y mikado para vestidos, moda formal y ropa de dormir."], ["Heavy cotton denim for jeans, jackets, skirts and structured apparel.", "Denim de algodón pesado para vaqueros, chaquetas, faldas y prendas estructuradas."],
  ["Hot this week", "Destacados de la semana"], ["Featured fabrics for active buyers", "Telas destacadas para compradores activos"], ["Best Sellers", "Más vendidos"], ["New Arrivals", "Novedades"], ["Quick Add", "Añadir rápido"], ["Quick view", "Vista rápida"],
  ["Client Collaboration", "Colaboración con clientes"], ["An exclusive behind-the-scenes look at YAQIXIN fabrics - filmed on-site by our valued international partner.", "Una mirada exclusiva al trabajo de YAQIXIN y sus telas, filmada en nuestras instalaciones por un valioso socio internacional."], ["Curated Selection", "Selección destacada"], ["Explore Our Bestsellers", "Explore nuestros más vendidos"], ["View All Products", "Ver todos los productos"],
  ["Real factory & stock capacity", "Fábrica real y capacidad de stock"], ["Visible inventory for B2B buyers.", "Inventario visible para compradores B2B."], ["Factory strength", "Capacidad de fábrica"], ["Stock scale, color range and export workflow.", "Escala de stock, gama de colores y flujo de exportación."], ["Real warehouse and fabric roll images help overseas buyers understand available inventory scale before requesting samples or bulk quotations.", "Las imágenes reales de almacén y rollos de tela ayudan a los compradores internacionales a entender el inventario disponible antes de solicitar muestras o cotizaciones a granel."],
  ["Buyer Visit", "Visita de compradores"], ["The Showroom Experience", "La experiencia del showroom"], ["Compare fabric samples, color cards and stock options with our team before confirming MOQ, price and the next sourcing step.", "Compare muestras de tela, cartas de color y opciones de stock con nuestro equipo antes de confirmar MOQ, precio y el siguiente paso de abastecimiento."],
  ["Quick quotation details", "Detalles para una cotización rápida"], ["All fields are optional. Send only what you know.", "Todos los campos son opcionales. Envíe solo la información que tenga."], ["Quick quote", "Cotización rápida"], ["Company information", "Información de empresa"], ["Email / WhatsApp", "Email / WhatsApp"], ["Fabric category", "Categoría de tela"], ["Order route", "Tipo de pedido"], ["Quantity", "Cantidad"], ["Requirement", "Requisito"], ["Optional", "Opcional"], ["Your message opens in WhatsApp first, so you can review it before sending.", "Su mensaje se abre primero en WhatsApp para que pueda revisarlo antes de enviarlo."], ["Choose the main category from the Products navigation. MOQ and delivery are confirmed by item.", "Elija la categoría principal en Productos. El MOQ y la entrega se confirman por artículo."], ["Guangzhou fabric sourcing for apparel buyers.", "Abastecimiento de telas desde Guangzhou para compradores de confección."],
]);

for (const [english, spanish] of translations) html = html.replaceAll(english, spanish);
html = html.replaceAll('languageLabel:"Language"', 'languageLabel:"Idioma"');
// The base element keeps shared assets and English product URLs rooted at /. Keep same-page anchors on /es.
html = html.replaceAll('href="#', 'href="/es#');

const languageBoot = /each\("\[data-lang-option\]",function\(el\)\{el\.addEventListener\("click",function\(\)\{var code=el\.getAttribute\("data-lang-option"\);.*?var initialLanguage="en";/s;
if (!languageBoot.test(html)) throw new Error("Spanish language boot block was not found");
html = html.replace(languageBoot, 'each("[data-lang-option]",function(el){el.addEventListener("click",function(){var code=el.getAttribute("data-lang-option");if(code==="en"){window.location.href="/";return}applyLanguage("es",false);if(switcher){switcher.classList.remove("is-open")}if(languageTrigger){languageTrigger.setAttribute("aria-expanded","false")}})});\n      var initialLanguage="es";');

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${html.replace(/[ \t]+(?=\r?\n)/g, "").replace(/\s*$/, "")}\n`, "utf8");
console.log(`Generated ${path.relative(root, outputPath)} from index.html`);
