(function(){
  var menu=document.getElementById('menu');
  var menuButton=document.getElementById('menuBtn');
  if(menu&&menuButton){
    menuButton.addEventListener('click',function(){
      var open=!menu.classList.contains('is-open');
      menu.classList.toggle('is-open',open);
      menuButton.setAttribute('aria-expanded',open?'true':'false');
      menuButton.setAttribute('aria-label',open?'Close menu':'Open menu');
    });
  }
  var productMenu=document.querySelector('.product-menu');
  var productTrigger=productMenu&&productMenu.querySelector('.product-trigger');
  function setProductOpen(open){
    if(!productMenu||!productTrigger){return}
    productMenu.classList.toggle('is-open',open);
    productTrigger.setAttribute('aria-expanded',open?'true':'false');
  }
  if(productTrigger){
    productTrigger.addEventListener('click',function(event){
      event.stopPropagation();
      setProductOpen(!productMenu.classList.contains('is-open'));
    });
  }
  var switcher=document.querySelector('[data-language-switcher]');
  if(!switcher){return}
  var trigger=switcher.querySelector('.language-trigger');
  function setOpen(open){
    switcher.classList.toggle('is-open',open);
    if(trigger){trigger.setAttribute('aria-expanded',open?'true':'false')}
  }
  if(trigger){trigger.addEventListener('click',function(){setOpen(!switcher.classList.contains('is-open'))})}
  switcher.querySelectorAll('[data-lang-option]').forEach(function(option){
    option.addEventListener('click',function(){
      var language=option.getAttribute('data-lang-option');
      setOpen(false);
      if(language==='es'){window.location.href='/es'}
    });
  });
  document.addEventListener('click',function(event){
    if(productMenu&&!productMenu.contains(event.target)){setProductOpen(false)}
    if(!switcher.contains(event.target)){setOpen(false)}
  });
  document.addEventListener('keydown',function(event){if(event.key==='Escape'){setProductOpen(false);setOpen(false)}});
})();
