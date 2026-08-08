(function(){
  var heroCarousel=document.getElementById('home-hero-carousel');
  if(!heroCarousel){return}
  var heroSlides=[].slice.call(heroCarousel.querySelectorAll('.hero-slide'));
  var heroDots=[].slice.call(heroCarousel.querySelectorAll('.hero-carousel-dot'));
  var heroPrev=heroCarousel.querySelector('[data-hero-prev]');
  var heroNext=heroCarousel.querySelector('[data-hero-next]');
  var heroActive=0;
  var heroTimer=0;
  var heroMotionReduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hydrateHeroSlide=function(index){
    var slide=heroSlides[index];
    if(!slide||slide.getAttribute('data-hydrated')==='true'){return}
    [].slice.call(slide.querySelectorAll('img[data-src]')).forEach(function(image){
      image.src=image.getAttribute('data-src');
      image.removeAttribute('data-src');
    });
    slide.setAttribute('data-hydrated','true');
  };
  var clearHeroTimer=function(){if(heroTimer){window.clearTimeout(heroTimer);heroTimer=0}};
  var queueHeroTimer=function(){
    clearHeroTimer();
    if(heroMotionReduced||document.hidden){return}
    heroTimer=window.setTimeout(function(){setHeroSlide(heroActive+1)},6500);
  };
  var setHeroSlide=function(index){
    if(!heroSlides.length){return}
    var next=(index+heroSlides.length)%heroSlides.length;
    hydrateHeroSlide(next);
    heroSlides.forEach(function(slide,slideIndex){
      var active=slideIndex===next;
      slide.classList.toggle('is-active',active);
      slide.setAttribute('aria-hidden',active?'false':'true');
    });
    heroDots.forEach(function(dot,dotIndex){dot.setAttribute('aria-current',dotIndex===next?'true':'false')});
    heroActive=next;
    queueHeroTimer();
  };
  heroDots.forEach(function(dot,index){dot.addEventListener('click',function(){setHeroSlide(index)})});
  if(heroPrev){heroPrev.addEventListener('click',function(){setHeroSlide(heroActive-1)})}
  if(heroNext){heroNext.addEventListener('click',function(){setHeroSlide(heroActive+1)})}
  heroCarousel.addEventListener('mouseenter',clearHeroTimer);
  heroCarousel.addEventListener('mouseleave',queueHeroTimer);
  heroCarousel.addEventListener('focusin',clearHeroTimer);
  heroCarousel.addEventListener('focusout',function(){window.setTimeout(queueHeroTimer,0)});
  var heroTouchStartX=0;
  heroCarousel.addEventListener('pointerdown',function(event){if(event.pointerType==='touch'){heroTouchStartX=event.clientX}},{passive:true});
  heroCarousel.addEventListener('pointerup',function(event){
    if(event.pointerType!=='touch'||!heroTouchStartX){return}
    var delta=event.clientX-heroTouchStartX;
    heroTouchStartX=0;
    if(Math.abs(delta)>44){setHeroSlide(heroActive+(delta<0?1:-1))}
  },{passive:true});
  document.addEventListener('visibilitychange',function(){if(document.hidden){clearHeroTimer()}else{queueHeroTimer()}});
  window.setTimeout(function(){hydrateHeroSlide(1)},2600);
  window.setTimeout(function(){hydrateHeroSlide(2)},5000);
  queueHeroTimer();
})();
