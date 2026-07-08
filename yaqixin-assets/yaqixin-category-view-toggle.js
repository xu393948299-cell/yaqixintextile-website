(function(){
  var catalogs=document.querySelectorAll('.catalog-products');
  if(!catalogs.length){return}

  function saveView(view){
    try{localStorage.setItem('yaqixinCatalogView',view)}catch(e){}
  }

  function readView(){
    try{return localStorage.getItem('yaqixinCatalogView')}catch(e){return null}
  }

  function setView(productGrid,toggles,view){
    var isList=view==='list';
    productGrid.classList.toggle('is-list-view',isList);
    toggles.forEach(function(button){
      var active=button.getAttribute('data-view')===view;
      button.classList.toggle('is-active',active);
      button.setAttribute('aria-pressed',active?'true':'false');
    });
    saveView(view);
  }

  catalogs.forEach(function(productGrid){
    var scope=productGrid.closest('.catalog-main')||document;
    var toggles=scope.querySelectorAll('.view-toggle');
    if(!toggles.length){return}

    toggles.forEach(function(button){
      button.addEventListener('click',function(){
        setView(productGrid,toggles,button.getAttribute('data-view')==='list'?'list':'grid');
      });
    });

    setView(productGrid,toggles,readView()==='list'?'list':'grid');
  });
})();
