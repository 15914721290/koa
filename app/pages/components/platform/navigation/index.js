
let navHeight
let fixNav
let duration
let weitiao
let weitiao2
let navBtnUl
let leftPosition
let allLiTag

function dispalyArrow(){
  if(navBtnUl[0].clientWidth < navBtnUl[0].scrollWidth){
    $('.scroll-nav-wrap-relative .icon').show()
  } else {
    $('.scroll-nav-wrap-relative .icon').hide()
  }
}

function animate1 (index) {
  navBtnUl.clearQueue()
    .queue(function() {
      $('.scroll-nav li.actived').removeClass('actived')
      allLiTag[index].$li.addClass('actived')
      navBtnUl.dequeue()
    })
    .animate({
      scrollLeft: allLiTag[index].left
    }, duration, 'linear')
}

function init () {
  // dispalyArrow()
  setTimeout(() => {
    dispalyArrow()
  }, 100)
  $('.scroll-nav-wrap').css('width',$('.detail-main').width())
  $('.scroll-nav').css('width',$('.detail-main').width())
  navHeight = $('.scroll-nav').outerHeight()
  fixNav = $('.scroll-nav-wrap')
  duration = 300
  weitiao =  5
  weitiao2 = window.innerWidth <= 540 ? -10 : 10
  navBtnUl = $('.scroll-nav ul')
  leftPosition =  $('.detail-main').offset().left
  allLiTag = $('.scroll-nav li a')
    .map((index,item)=>{
      const id = $(item).attr('href').slice(0)
      return {
        id: id,
        top: $(id).offset().top - navHeight - weitiao2,
        left: $(item).offset().left - navBtnUl.width()*0.5,
        $li: $(item).parent(),
        li: $(item).parent()[0]
      }
    })
}

function bind() {
  $('.scroll-nav-wrap-relative .icon').on('click',function(){
    navBtnUl.animate({
      scrollLeft: '+=50'
    }, duration, 'linear')
  })

  $(window).on('scroll', function(){
    const mainTop = $('.detail-main').offset().top
    const mainHeight = $('.detail-main').innerHeight()
    const end = mainTop + mainHeight
    var winTop = $(this).scrollTop()

    if(winTop >= mainTop - navHeight && winTop < end ) {

      // $('.scroll-nav').css('height', navHeight)
      if (fixNav.hasClass('move-up')) {
        fixNav.addClass('fixed')
        fixNav.removeClass('move-up')
        fixNav.addClass('move-down')
      } else if (!fixNav.hasClass('fixed') && !fixNav.hasClass('move-up')) {
        fixNav.addClass('fixed')
        fixNav.addClass('move-down')
      }
      for (let index = 0; index < allLiTag.length; index++) {
        const isLast = !(index < allLiTag.length - 1)
        if(!isLast && winTop >= allLiTag[index].top - weitiao && winTop < allLiTag[index+1].top - weitiao){
          animate1(index)
          break
        } else if (isLast && winTop >= allLiTag[index].top - weitiao) {
          animate1(index)
          break
        }
      }
      fixNav.offset({left: leftPosition})
    } else if (winTop >= end) {
      if(!fixNav.hasClass('fixed')){
        return
      }
      $('.scroll-nav li.actived').removeClass('actived')
      fixNav.addClass('fixed')
      fixNav.addClass('move-up')
      fixNav.removeClass('move-down')
    } else {
      $('.scroll-nav li.actived').removeClass('actived')
      // $('.scroll-nav').css('height', 'initial')
      fixNav.removeClass('fixed')
      fixNav.removeClass('move-up')
      fixNav.removeClass('move-down')
    }
  })

  $('.scroll-nav').on('click','li', function(e){
    const findOne =allLiTag.filter((index,item)=>{
      return item.li == $(this)[0]
    })[0]
    e.preventDefault()
    $('html, body').animate({
      scrollTop:findOne.top
    }, 300, 'linear')

  })

  $(window).on('resize',function(){
    init()
    $(window).scroll()
  })
}






setTimeout(() => {
  init()
  bind()
  $(window).scroll()
}, 10)

