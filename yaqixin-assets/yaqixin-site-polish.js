(function(){
  var form=document.getElementById('site-search');
  if(!form){return}
  form.addEventListener('submit',function(event){
    event.preventDefault();
    var input=document.getElementById('site-search-input');
    var query=input?input.value.trim().toLowerCase():'';
    if(!query){return}
    var map={
      cotton:'/plain-cotton-fabric',
      canvas:'/canvas-fabric',
      poplin:'/poplin-fabric',
      twill:'/twill-fabric',
      denim:'/yx277-460gsm-cotton-denim-fabric',
      tulle:'/tulle-mesh-fabric',
      mesh:'/tulle-mesh-fabric',
      illusion:'/zp-7-skin-tone-nylon-illusion-tulle-fabric',
      'plain tulle':'/plain-tulle-fabric',
      yx1046:'/yx1046-soft-white-20d-nylon-plain-tulle-fabric',
      'white tulle':'/yx1046-soft-white-20d-nylon-plain-tulle-fabric',
      holiday:'/holiday-tulle-fabric',
      glitter:'/glitter-tulle-fabric',
      'glitter tulle':'/glitter-tulle-fabric',
      'glitter mesh':'/sgt001-glitter-mesh-tulle-fabric',
      sparkle:'/sgt001-glitter-mesh-tulle-fabric',
      'wedding tulle':'/sgt001-glitter-mesh-tulle-fabric',
      sgt001:'/sgt001-glitter-mesh-tulle-fabric',
      rainbow:'/rainbow-tulle-fabric',
      'rainbow tulle':'/rainbow-tulle-fabric',
      gradient:'/yx479-rainbow-ombre-glitter-tulle-fabric',
      ombre:'/yx479-rainbow-ombre-glitter-tulle-fabric',
      yx479:'/yx479-rainbow-ombre-glitter-tulle-fabric',
      yx2178:'/yx2178-rainbow-tulle-mesh-fabric-with-silver-dots',
      'silver dot':'/yx2178-rainbow-tulle-mesh-fabric-with-silver-dots',
      'silver dots':'/yx2178-rainbow-tulle-mesh-fabric-with-silver-dots',
      shimmering:'/yx2178-rainbow-tulle-mesh-fabric-with-silver-dots',
      'rainbow dots':'/yx2178-rainbow-tulle-mesh-fabric-with-silver-dots',
      organza:'/organza-fabric',
      'organza fabric':'/organza-fabric',
      yx309:'/yx309-100-polyester-sheer-organza-fabric',
      yx1386:'/yx1386-1-water-glossy-transparent-liquid-organza-fabric',
      'yx1386-1':'/yx1386-1-water-glossy-transparent-liquid-organza-fabric',
      'liquid organza':'/yx1386-1-water-glossy-transparent-liquid-organza-fabric',
      'glossy organza':'/yx1386-1-water-glossy-transparent-liquid-organza-fabric',
      'transparent organza':'/yx1386-1-water-glossy-transparent-liquid-organza-fabric',
      halloween:'/holiday-tulle-fabric',
      bat:'/holiday-tulle-fabric',
      flocked:'/yx2267-flocked-bat-holiday-tulle-fabric',
      yx2267:'/yx2267-flocked-bat-holiday-tulle-fabric',
      spider:'/kt38-3-printing-spider-web-holiday-tulle-fabric',
      spiderweb:'/kt38-3-printing-spider-web-holiday-tulle-fabric',
      kt38:'/kt38-3-printing-spider-web-holiday-tulle-fabric',
      yx956:'/yx956-1-blood-splatter-foil-holiday-tulle-fabric',
      yx2117:'/yx2117-patriotic-star-print-4th-of-july-tulle-fabric',
      patriotic:'/yx2117-patriotic-star-print-4th-of-july-tulle-fabric',
      '4th of july':'/yx2117-patriotic-star-print-4th-of-july-tulle-fabric',
      'independence day':'/yx2117-patriotic-star-print-4th-of-july-tulle-fabric',
      blood:'/yx956-1-blood-splatter-foil-holiday-tulle-fabric',
      splatter:'/yx956-1-blood-splatter-foil-holiday-tulle-fabric',
      foil:'/yx956-1-blood-splatter-foil-holiday-tulle-fabric',
            pleated:'/pleated-fabric',
      'pleated fabric':'/pleated-fabric',
      yzt001:'/yzt001-ivory-pleated-mesh-tulle-fabric',
      yx198:'/yx198-7mm-pleated-polyester-satin-fabric',
      yx936:'/yx936-1cm-pleated-white-polyester-satin-fabric',
      yx796:'/yx796-accordion-pleated-chiffon-fabric',
      'pleated satin':'/yx198-7mm-pleated-polyester-satin-fabric',
      'pleated chiffon':'/yx796-accordion-pleated-chiffon-fabric',
      lace:'/lace-fabric',
      satin:'/satin-fabric',
      about:'/custom-capability',
      'about us':'/custom-capability',
      custom:'/custom-capability#custom',
      certification:'/custom-capability#certification',
      shipment:'/custom-capability#shipment'
    };
    if(map[query]){
      window.location.href=map[query];
      return;
    }
    var links=[].slice.call(document.querySelectorAll('.menu a,.sidebar-list a,.catalog-products a,.hero-actions a'));
    var best=links.find(function(link){
      return (link.textContent||'').toLowerCase().indexOf(query)>-1;
    })||links.find(function(link){
      return (link.getAttribute('href')||'').toLowerCase().indexOf(query.replace(/\s+/g,'-'))>-1;
    });
    window.location.href=best&&best.getAttribute('href')?best.getAttribute('href'):'/all-products';
  });
})();







