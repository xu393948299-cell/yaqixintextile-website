(function(){
  var STYLE_ID='yaqixin-mobile-menu-unified-style';
  var SHEET_ID='mobileCategoryLayer';
  var BUTTON_ID='mobileCategoriesBtn';

  var productsHtml=[
    '<a href="all-products.html">All Products</a>',
    '<details class="mobile-nav-subgroup"><summary>Plain Cotton Fabric</summary><div class="mobile-nav-depth">',
      '<a href="plain-cotton-fabric.html">View all plain cotton</a>',
      '<a href="canvas-fabric.html">Canvas Fabric</a>',
      '<a href="poplin-fabric.html">Poplin Fabric</a>',
      '<a href="twill-fabric.html">Twill Fabric</a>',
    '</div></details>',
    '<details class="mobile-nav-subgroup"><summary>Tulle Mesh Fabric</summary><div class="mobile-nav-depth">',
      '<a href="tulle-mesh-fabric.html">View all tulle mesh</a>',
      '<a href="plain-tulle-fabric.html">Plain Tulle Fabric</a>',
      '<a href="stretch-knit-mesh-fabric.html">Stretch Knit Mesh Fabric</a>',
      '<a href="holiday-tulle-fabric.html">Holiday Tulle Fabric</a>',
      '<a href="glitter-tulle-fabric.html">Glitter Tulle Fabric</a>',
      '<a href="rainbow-tulle-fabric.html">Rainbow Tulle Fabric</a>',
      '<a href="print-mesh-fabric.html">Print Mesh Fabric</a>',
      '<a href="3d-tulle-mesh-fabric.html">3D Tulle Mesh Fabric</a>',
      '<a href="flocked-mesh-fabric.html">Flocked Mesh Fabric</a>',
      '<a href="sequin-fabric.html">Sequin Fabric</a>',
    '</div></details>',
    '<a href="organza-fabric.html">Organza Fabric</a>',
    '<a href="pleated-fabric.html">Pleated Fabric</a>',
    '<details class="mobile-nav-subgroup"><summary>Lace Fabric</summary><div class="mobile-nav-depth">',
      '<a href="lace-fabric.html">View all lace</a>',
      '<a href="eyelash-lace-fabric.html">Eyelash Lace Fabric</a>',
      '<a href="glitter-lace-fabric.html">Glitter Lace Fabric</a>',
      '<a href="3d-beads-lace-fabric.html">3D Beads Lace Fabric</a>',
      '<a href="water-soluble-lace-fabric.html">Water Soluble Lace Fabric</a>',
      '<a href="lace-trim.html">Lace Trim</a>',
    '</div></details>',
    '<details class="mobile-nav-subgroup"><summary>Satin Fabric</summary><div class="mobile-nav-depth">',
      '<a href="satin-fabric.html">View all satin</a>',
      '<a href="mikado-satin-fabric.html">Mikado Satin Fabric</a>',
      '<a href="stretch-satin-fabric.html">Stretch Satin Fabric</a>',
    '</div></details>',
    '<a href="yx277-460gsm-cotton-denim-fabric.html">Denim Fabric</a>'
  ].join('');

  function inquiryHref(){
    return document.getElementById('inquiry')?'#inquiry':'index.html#inquiry';
  }

  function injectStyle(){
    if(document.getElementById(STYLE_ID)){return}
    var style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=[
      '@media(max-width:760px){',
      'body{padding-bottom:calc(78px + env(safe-area-inset-bottom))}',
      'body.mobile-category-open{overflow:hidden}',
      '.mobile-action-bar{position:fixed!important;left:0!important;right:0!important;bottom:0!important;z-index:120!important;width:auto!important;max-width:none!important;box-sizing:border-box!important;display:grid!important;grid-template-columns:74px minmax(0,1fr) minmax(0,1fr)!important;gap:10px!important;padding:10px 12px calc(10px + env(safe-area-inset-bottom))!important;background:rgba(255,255,255,.98)!important;border-top:1px solid rgba(16,21,31,.1)!important;box-shadow:0 -8px 24px rgba(16,21,31,.08)!important;backdrop-filter:blur(14px)!important;overflow:visible!important}',
      '.mobile-action-bar a,.mobile-action-bar button{min-width:0!important;min-height:52px!important;border-radius:999px!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:0 12px!important;font:inherit!important;font-size:15px!important;font-weight:800!important;letter-spacing:0!important;text-transform:none!important;white-space:nowrap!important;box-shadow:none!important;text-decoration:none!important}',
      '.mobile-action-bar button{border:0!important;margin:0!important;cursor:pointer!important}',
      '.mobile-action-bar .categories{flex-direction:column!important;gap:5px!important;border-radius:12px!important;background:transparent!important;color:#202124!important;font-weight:700!important}',
      '.mobile-action-bar .cat-icon{position:relative!important;width:28px!important;height:19px!important;display:block!important}',
      '.mobile-action-bar .cat-icon:before,.mobile-action-bar .cat-icon:after,.mobile-action-bar .cat-icon span{content:""!important;position:absolute!important;left:0!important;right:0!important;height:2.5px!important;border-radius:999px!important;background:#202124!important}',
      '.mobile-action-bar .cat-icon:before{top:0!important}.mobile-action-bar .cat-icon span{top:8px!important}.mobile-action-bar .cat-icon:after{bottom:0!important}',
      '.mobile-action-bar .cat-label{font-size:13px!important;font-weight:700!important;line-height:1.05!important}',
      '.mobile-action-bar .chat{border:1.5px solid rgba(32,33,36,.62)!important;background:#fff!important;color:#10151f!important}',
      '.mobile-action-bar .quote,.mobile-action-bar .sample{border:1px solid #ff6500!important;background:#ff6500!important;color:#fff!important;font-weight:850!important;box-shadow:0 8px 18px rgba(255,101,0,.18)!important}',
      '.mobile-action-bar a:active,.mobile-action-bar button:active{transform:translateY(1px)!important}',
      '.mobile-category-layer{position:fixed!important;inset:0!important;z-index:130!important;display:block!important;pointer-events:none!important}',
      '.mobile-category-layer[hidden]{display:none!important}',
      '.mobile-category-layer.is-open{pointer-events:auto!important}',
      '.mobile-category-backdrop{position:absolute!important;inset:0!important;background:rgba(5,7,11,.34)!important;opacity:0!important;transition:opacity .22s ease!important}',
      '.mobile-category-layer.is-open .mobile-category-backdrop{opacity:1!important}',
      '.mobile-category-sheet{position:absolute!important;left:10px!important;right:10px!important;bottom:calc(82px + env(safe-area-inset-bottom))!important;max-height:min(70svh,580px)!important;overflow:auto!important;padding:10px 14px 16px!important;border:1px solid rgba(228,219,209,.9)!important;border-radius:22px 22px 16px 16px!important;background:#fff!important;color:#10151f!important;box-shadow:0 -18px 58px rgba(16,21,31,.22)!important;transform:translateY(18px)!important;opacity:0!important;transition:transform .22s ease,opacity .22s ease!important;-webkit-overflow-scrolling:touch!important}',
      '.mobile-category-layer.is-open .mobile-category-sheet{transform:translateY(0)!important;opacity:1!important}',
      '.mobile-category-handle{width:42px!important;height:4px!important;margin:2px auto 12px!important;border-radius:999px!important;background:#d9d5cf!important}',
      '.mobile-category-head{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;padding:0 2px 12px!important;border-bottom:1px solid #e6ddd4!important}',
      '.mobile-category-head strong{display:block!important;color:#071c38!important;font-size:18px!important;line-height:1.1!important}',
      '.mobile-category-head span{display:block!important;margin-top:4px!important;color:#747d8a!important;font-size:12px!important;line-height:1.35!important}',
      '.mobile-category-close{min-width:62px!important;min-height:36px!important;border:0!important;border-radius:999px!important;background:#f0f0ef!important;color:#10151f!important;font:inherit!important;font-size:12px!important;font-weight:900!important}',
      '.mobile-nav-main{display:grid!important;gap:0!important;padding-top:8px!important}',
      '.mobile-nav-row{display:block!important;padding:18px 2px!important;border-bottom:1px solid #e6ddd4!important;color:#10151f!important;font-size:15px!important;font-weight:900!important;text-decoration:none!important}',
      '.mobile-nav-group{border-bottom:1px solid #e6ddd4!important}',
      '.mobile-nav-group>summary{list-style:none!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:14px!important;padding:18px 2px!important;color:#10151f!important;font-size:15px!important;font-weight:900!important;cursor:pointer!important}',
      '.mobile-nav-group>summary::-webkit-details-marker,.mobile-nav-subgroup>summary::-webkit-details-marker{display:none!important}',
      '.mobile-nav-group>summary:after,.mobile-nav-subgroup>summary:after{content:""!important;width:9px!important;height:9px!important;border-right:2px solid currentColor!important;border-bottom:2px solid currentColor!important;transform:rotate(45deg)!important;transition:transform .18s ease!important;flex:0 0 auto!important}',
      '.mobile-nav-group[open]>summary:after,.mobile-nav-subgroup[open]>summary:after{transform:rotate(225deg)!important}',
      '.mobile-nav-sub{display:grid!important;gap:0!important;padding:0 0 12px 14px!important}',
      '.mobile-nav-sub a{display:block!important;padding:11px 2px!important;color:#4f5968!important;font-size:14px!important;font-weight:760!important;text-decoration:none!important}',
      '.mobile-nav-sub>a:first-child{color:#10151f!important;font-weight:900!important}',
      '.mobile-nav-subgroup{border-top:1px solid rgba(16,21,31,.06)!important}',
      '.mobile-nav-subgroup>summary{list-style:none!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;padding:13px 2px!important;color:#233044!important;font-size:14px!important;font-weight:850!important;cursor:pointer!important}',
      '.mobile-nav-depth{display:grid!important;gap:0!important;padding:0 0 8px 12px!important}',
      '.mobile-nav-depth a{font-size:13px!important;line-height:1.35!important}',
      '}',
      '@media(max-width:360px){.mobile-action-bar{grid-template-columns:66px minmax(0,1fr) minmax(0,1fr)!important;gap:8px!important;padding-left:8px!important;padding-right:8px!important}.mobile-action-bar a,.mobile-action-bar button{min-height:50px!important;padding:0 8px!important;font-size:13px!important}.mobile-action-bar .cat-label{font-size:12px!important}}'
    ].join('');
    document.head.appendChild(style);
  }

  function ensureActionBar(){
    var bar=document.querySelector('.mobile-action-bar');
    if(!bar){
      bar=document.createElement('div');
      bar.className='mobile-action-bar';
      bar.setAttribute('aria-label','Mobile quick actions');
      document.body.appendChild(bar);
    }
    bar.innerHTML='<button class="categories" id="'+BUTTON_ID+'" type="button" aria-label="Menu" aria-controls="mobileCategorySheet" aria-expanded="false"><span class="cat-icon" aria-hidden="true"><span></span></span><span class="cat-label">Menu</span></button><a class="chat" href="'+inquiryHref()+'">WhatsApp</a><a class="quote" href="'+inquiryHref()+'">Get Sample</a>';
    return bar;
  }

  function ensureLayer(){
    var layer=document.getElementById(SHEET_ID);
    if(!layer){
      layer=document.createElement('div');
      layer.className='mobile-category-layer';
      layer.id=SHEET_ID;
      document.body.appendChild(layer);
    }
    layer.hidden=true;
    layer.innerHTML='<div class="mobile-category-backdrop" data-close-category></div><section class="mobile-category-sheet" id="mobileCategorySheet" role="dialog" aria-modal="true" aria-labelledby="mobileCategoryTitle"><div class="mobile-category-handle" aria-hidden="true"></div><div class="mobile-category-head"><div><strong id="mobileCategoryTitle">Menu</strong><span>Navigate YAQIXIN.</span></div><button class="mobile-category-close" type="button" data-close-category>Close</button></div><nav class="mobile-nav-main" aria-label="Mobile navigation"><a class="mobile-nav-row" href="index.html#top">Home</a><details class="mobile-nav-group"><summary>Products</summary><div class="mobile-nav-sub">'+productsHtml+'</div></details><a class="mobile-nav-row" href="custom-capability.html">Customize</a></nav></section>';
    layer.setAttribute('data-product-menu-synced','true');
    return layer;
  }

  function wireInteractions(bar,layer){
    var btn=document.getElementById(BUTTON_ID);
    if(!btn||!layer){return}
    var closeTimer;
    function setOpen(open){
      window.clearTimeout(closeTimer);
      if(open){
        layer.hidden=false;
        document.body.classList.add('mobile-category-open');
        window.requestAnimationFrame(function(){layer.classList.add('is-open')});
      }else{
        layer.classList.remove('is-open');
        document.body.classList.remove('mobile-category-open');
        closeTimer=window.setTimeout(function(){layer.hidden=true},220);
      }
      btn.setAttribute('aria-expanded',open?'true':'false');
    }
    btn.addEventListener('click',function(event){
      event.preventDefault();
      setOpen(!layer.classList.contains('is-open'));
    });
    layer.addEventListener('click',function(event){
      if(event.target===layer||event.target.closest('[data-close-category]')||event.target.closest('a')){setOpen(false)}
    });
    bar.querySelectorAll('.chat,.quote,.sample').forEach(function(link){
      link.addEventListener('click',function(){setOpen(false)});
    });
    document.addEventListener('keydown',function(event){
      if(event.key==='Escape'&&layer.classList.contains('is-open')){setOpen(false)}
    });
  }

  function syncMobileNavigation(){
    injectStyle();
    var bar=ensureActionBar();
    var layer=ensureLayer();
    wireInteractions(bar,layer);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',syncMobileNavigation);
  }else{
    syncMobileNavigation();
  }
})();
