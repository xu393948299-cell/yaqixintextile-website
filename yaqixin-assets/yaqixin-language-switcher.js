(function(){
  var languages={
    en:{label:"English",short:"EN",flag:"us.svg",html:"en"},
    es:{label:"Español",short:"ES",flag:"es.svg",html:"es"}
  };
  var order=["en","es"];
  var storageKey="yaqixin-language";
  var flagBase="yaqixin-assets/flags/";
  var pageId=Math.random().toString(36).slice(2);
  var originalTitle=document.title;
  var exact={
    "Home":"Inicio","Products":"Productos","Inquiry":"Consulta","Product categories":"Categorías de productos",
    "See all categories":"Ver todas las categorías","View all plain cotton":"Ver todo el algodón liso","View all tulle":"Ver todo el tul",
    "View all organza":"Ver toda la organza","View all lace":"Ver todo el encaje","View all satin":"Ver todo el satén",
    "Plain Cotton Fabric":"Tejido de algodón liso","Canvas Fabric":"Tejido de loneta","Poplin Fabric":"Tejido popelín",
    "Twill Fabric":"Tejido de sarga","Tulle Mesh Fabric":"Tul y tejido de malla","Plain Tulle Fabric":"Tul liso",
    "Holiday Tulle Fabric":"Tul temático","Rainbow Tulle Fabric":"Tul arcoíris","Organza Fabric":"Tejido de organza",
    "Lace Fabric":"Tejido de encaje","Eyelash Lace Fabric":"Encaje de pestañas","3D Beads Lace Fabric":"Encaje 3D con perlas",
    "Water Soluble Lace Fabric":"Encaje soluble en agua","Lace Trim":"Ribete de encaje","Satin Fabric":"Tejido satinado",
    "Denim Fabric":"Tejido denim","Search fabrics":"Buscar telas","Search products":"Buscar productos",
    "Choose language":"Elegir idioma","Click to enlarge":"Ampliar imagen","CLICK TO ENLARGE":"AMPLIAR IMAGEN",
    "Applications":"Aplicaciones","FAQ":"Preguntas frecuentes","Company Name":"Empresa","Quantity / Market":"Cantidad / mercado",
    "Quantity / Market / Delivery Target":"Cantidad / mercado / entrega","Requirement / Color / Delivery Target":"Requisito / color / entrega",
    "Get Quote":"Cotizar","Request a quotation":"Solicitar una cotización",
    "Your message opens in WhatsApp first, so you can review it before sending.":"El mensaje se abre primero en WhatsApp para que pueda revisarlo antes de enviarlo."
  };
  var placeholders={
    "Search fabrics":"Buscar telas","Email or WhatsApp number":"Email o número de WhatsApp",
    "e.g. 500yd / USA / delivery date":"ej. 500 yd / EE. UU. / fecha de entrega",
    "Fabric use, target color, packing or sample request":"Uso, color objetivo, embalaje o solicitud de muestra"
  };
  var phrases=[
    ["Champagne Ivory","marfil champán"],["champagne ivory","marfil champán"],["Mikado Satin Fabric","tejido satinado mikado"],
    ["mikado satin fabric","tejido satinado mikado"],["Mikado Satin","satén mikado"],["Satin Fabric","tejido satinado"],
    ["satin fabric","tejido satinado"],["Bridal Dresses","vestidos de novia"],["bridal dresses","vestidos de novia"],
    ["Wedding Gowns","vestidos de boda"],["wedding gowns","vestidos de boda"],["party dresses","vestidos de fiesta"],
    ["Party Dresses","vestidos de fiesta"],["skirts","faldas"],["Skirts","faldas"],["Wholesale","Mayorista"],
    ["wholesale","mayorista"],["fabric manufacturer","fabricante de telas"],["Fabric Manufacturer","Fabricante de telas"],
    ["buyer questions","preguntas de compradores"],["Buyer questions","Preguntas de compradores"],["Request a","Solicitar una"],
    ["quotation","cotización"],["Quote","Cotización"],["delivery","entrega"],["Delivery","Entrega"],
    ["width","ancho"],["Width","Ancho"],["weight","peso"],["Weight","Peso"],["color","color"],
    ["Color","Color"],["price","precio"],["Price","Precio"],["lead time","plazo"],["Lead time","Plazo"],
    ["fabric","tela"],["Fabric","Tela"]
  ];
  function stored(){try{return localStorage.getItem(storageKey)}catch(e){return null}}
  function remember(code){try{localStorage.setItem(storageKey,code)}catch(e){}}
  function requested(){try{return new URLSearchParams(location.search).get("lang")}catch(e){return null}}
  function optionHtml(code){var item=languages[code];return '<button class="language-option" type="button" role="menuitemradio" aria-checked="false" data-lang-option="'+code+'"><span class="language-name"><span class="language-flag" aria-hidden="true"><img src="'+flagBase+item.flag+'" alt=""></span><span>'+item.label+'</span></span><small>'+item.short+'</small></button>'}
  function switcherHtml(){var menuId="languageMenu-"+pageId;return '<div class="language-switcher" data-language-switcher><button class="language-trigger" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="'+menuId+'" aria-label="Choose language"><span class="language-mark" aria-hidden="true"><img src="'+flagBase+'us.svg" alt=""></span><span data-language-current>EN</span></button><div class="language-menu" id="'+menuId+'" role="menu" aria-label="Choose language">'+order.map(optionHtml).join("")+'</div></div>'}
  function ensureSwitcher(){var existing=document.querySelector("[data-language-switcher]");if(existing){return existing}var search=document.querySelector(".nav > .site-search");if(!search){return null}var tools=document.createElement("div");tools.className="nav-tools";search.parentNode.insertBefore(tools,search);tools.appendChild(search);tools.insertAdjacentHTML("beforeend",switcherHtml());return tools.querySelector("[data-language-switcher]")}
  function translate(text,code){if(code==="en"){return text}var leading=(text.match(/^\s*/)||[""])[0],trailing=(text.match(/\s*$/)||[""])[0],core=text.trim();if(!core){return text}if(exact[core]){return leading+exact[core]+trailing}var result=core;phrases.forEach(function(pair){result=result.split(pair[0]).join(pair[1])});return leading+result+trailing}
  function skip(el){return !el||(el.closest&&el.closest(".language-switcher"))||["SCRIPT","STYLE","NOSCRIPT","SVG","CANVAS"].indexOf(el.tagName)>-1}
  function translateText(code){var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:function(node){return skip(node.parentElement)||!node.nodeValue.trim()?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}}),nodes=[];while(walker.nextNode()){nodes.push(walker.currentNode)}nodes.forEach(function(node){if(!node.__yxOriginalText){node.__yxOriginalText=node.nodeValue}node.nodeValue=translate(node.__yxOriginalText,code)})}
  function translateAttributes(code){document.querySelectorAll("[placeholder]").forEach(function(el){if(!el.getAttribute("data-yx-original-placeholder")){el.setAttribute("data-yx-original-placeholder",el.getAttribute("placeholder"))}var original=el.getAttribute("data-yx-original-placeholder");el.setAttribute("placeholder",code==="es"?(placeholders[original]||translate(original,code)):original)});document.querySelectorAll("[aria-label]").forEach(function(el){if(el.closest&&el.closest(".language-switcher")){return}if(!el.getAttribute("data-yx-original-aria")){el.setAttribute("data-yx-original-aria",el.getAttribute("aria-label"))}var original=el.getAttribute("data-yx-original-aria");el.setAttribute("aria-label",translate(original,code))});document.title=translate(originalTitle,code)}
  function apply(code,save){if(!languages[code]){code="en"}var item=languages[code];document.documentElement.setAttribute("lang",item.html);document.querySelectorAll("[data-language-current]").forEach(function(el){el.textContent=item.short});document.querySelectorAll(".language-mark img").forEach(function(el){el.setAttribute("src",flagBase+item.flag);el.setAttribute("alt","")});document.querySelectorAll("[data-lang-option]").forEach(function(el){var active=el.getAttribute("data-lang-option")===code;el.classList.toggle("is-active",active);el.setAttribute("aria-checked",active?"true":"false")});translateText(code);translateAttributes(code);if(save){remember(code)}}
  function init(){var switcher=ensureSwitcher();if(!switcher){return}var trigger=switcher.querySelector(".language-trigger");if(trigger){trigger.addEventListener("click",function(){var open=!switcher.classList.contains("is-open");switcher.classList.toggle("is-open",open);trigger.setAttribute("aria-expanded",open?"true":"false")})}switcher.querySelectorAll("[data-lang-option]").forEach(function(option){option.addEventListener("click",function(){apply(option.getAttribute("data-lang-option"),true);switcher.classList.remove("is-open");if(trigger){trigger.setAttribute("aria-expanded","false")}})});document.addEventListener("click",function(event){if(!switcher.contains(event.target)){switcher.classList.remove("is-open");if(trigger){trigger.setAttribute("aria-expanded","false")}}});document.addEventListener("keydown",function(event){if(event.key==="Escape"){switcher.classList.remove("is-open");if(trigger){trigger.setAttribute("aria-expanded","false")}}});var initial=requested()||stored()||"en";apply(languages[initial]?initial:"en",false)}
  if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",init)}else{init()}
})();
