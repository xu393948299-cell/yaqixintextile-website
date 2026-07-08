(function(){
  var form=document.getElementById('site-search');
  if(!form){return}
  form.addEventListener('submit',function(event){
    event.preventDefault();
    var input=document.getElementById('site-search-input');
    var query=input?input.value.trim().toLowerCase():'';
    if(!query){return}
    var map={
      cotton:'plain-cotton-fabric.html',
      canvas:'canvas-fabric.html',
      poplin:'poplin-fabric.html',
      twill:'twill-fabric.html',
      denim:'yx277-460gsm-cotton-denim-fabric.html',
      tulle:'tulle-mesh-fabric.html',
      mesh:'tulle-mesh-fabric.html',
      illusion:'zp-7-skin-tone-nylon-illusion-tulle-fabric.html',
      'plain tulle':'plain-tulle-fabric.html',
      yx1046:'yx1046-soft-white-20d-nylon-plain-tulle-fabric.html',
      'white tulle':'yx1046-soft-white-20d-nylon-plain-tulle-fabric.html',
      holiday:'holiday-tulle-fabric.html',
      glitter:'glitter-tulle-fabric.html',
      'glitter tulle':'glitter-tulle-fabric.html',
      'glitter mesh':'sgt001-glitter-mesh-tulle-fabric.html',
      sparkle:'sgt001-glitter-mesh-tulle-fabric.html',
      'wedding tulle':'sgt001-glitter-mesh-tulle-fabric.html',
      sgt001:'sgt001-glitter-mesh-tulle-fabric.html',
      rainbow:'rainbow-tulle-fabric.html',
      'rainbow tulle':'rainbow-tulle-fabric.html',
      gradient:'yx479-rainbow-ombre-glitter-tulle-fabric.html',
      ombre:'yx479-rainbow-ombre-glitter-tulle-fabric.html',
      yx479:'yx479-rainbow-ombre-glitter-tulle-fabric.html',
      yx2178:'yx2178-rainbow-tulle-mesh-fabric-with-silver-dots.html',
      'silver dot':'yx2178-rainbow-tulle-mesh-fabric-with-silver-dots.html',
      'silver dots':'yx2178-rainbow-tulle-mesh-fabric-with-silver-dots.html',
      shimmering:'yx2178-rainbow-tulle-mesh-fabric-with-silver-dots.html',
      'rainbow dots':'yx2178-rainbow-tulle-mesh-fabric-with-silver-dots.html',
      organza:'organza-fabric.html',
      'organza fabric':'organza-fabric.html',
      yx309:'yx309-100-polyester-sheer-organza-fabric.html',
      yx1386:'yx1386-1-water-glossy-transparent-liquid-organza-fabric.html',
      'yx1386-1':'yx1386-1-water-glossy-transparent-liquid-organza-fabric.html',
      'liquid organza':'yx1386-1-water-glossy-transparent-liquid-organza-fabric.html',
      'glossy organza':'yx1386-1-water-glossy-transparent-liquid-organza-fabric.html',
      'transparent organza':'yx1386-1-water-glossy-transparent-liquid-organza-fabric.html',
      halloween:'holiday-tulle-fabric.html',
      bat:'holiday-tulle-fabric.html',
      flocked:'yx2267-flocked-bat-holiday-tulle-fabric.html',
      yx2267:'yx2267-flocked-bat-holiday-tulle-fabric.html',
      spider:'kt38-3-printing-spider-web-holiday-tulle-fabric.html',
      spiderweb:'kt38-3-printing-spider-web-holiday-tulle-fabric.html',
      kt38:'kt38-3-printing-spider-web-holiday-tulle-fabric.html',
      yx956:'yx956-1-blood-splatter-foil-holiday-tulle-fabric.html',
      yx2117:'yx2117-patriotic-star-print-4th-of-july-tulle-fabric.html',
      patriotic:'yx2117-patriotic-star-print-4th-of-july-tulle-fabric.html',
      '4th of july':'yx2117-patriotic-star-print-4th-of-july-tulle-fabric.html',
      'independence day':'yx2117-patriotic-star-print-4th-of-july-tulle-fabric.html',
      blood:'yx956-1-blood-splatter-foil-holiday-tulle-fabric.html',
      splatter:'yx956-1-blood-splatter-foil-holiday-tulle-fabric.html',
      foil:'yx956-1-blood-splatter-foil-holiday-tulle-fabric.html',
            pleated:'pleated-fabric.html',
      'pleated fabric':'pleated-fabric.html',
      yzt001:'yzt001-ivory-pleated-mesh-tulle-fabric.html',
      yx198:'yx198-7mm-pleated-polyester-satin-fabric.html',
      yx936:'yx936-1cm-pleated-white-polyester-satin-fabric.html',
      yx796:'yx796-accordion-pleated-chiffon-fabric.html',
      'pleated satin':'yx198-7mm-pleated-polyester-satin-fabric.html',
      'pleated chiffon':'yx796-accordion-pleated-chiffon-fabric.html',
      lace:'lace-fabric.html',
      satin:'satin-fabric.html',
      about:'about-us.html',
      'about us':'about-us.html',
      custom:'about-us.html#custom',
      certification:'about-us.html#certification',
      shipment:'about-us.html#shipment'
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
    window.location.href=best&&best.getAttribute('href')?best.getAttribute('href'):'all-products.html';
  });
})();







