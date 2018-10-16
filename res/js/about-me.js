// Lateral on scroll sliding - Animation
// the row elements
$(function (){

let $sidescroll= (function(){
let $rows			= $('#ss-container > div.ss-row'),
	// we will cache the inviewport 
	// rows and the outside viewport rows
	$rowsViewport, $rowsOutViewport,
	// navigation menu links
	$links			= $('#ss-links > a'),
	// the window element
	$win			= $(window),
	// we will store the window sizes here
	winSize			= {},
	// used in the scroll setTimeout function
	anim			= false,
	// page scroll speed
	scollPageSpeed	= 1000 ,
	// page scroll easing
	scollPageEasing = 'easeInOutExpo',
    // perspective?
    hasPerspective	= true,
    perspective	= hasPerspective && Modernizr.csstransforms3d,

    // following functions

    // initialize function
    init			= function() {		
	// get window sizes
	getWinSize();
	// initialize events
	initEvents();
	// define the inviewport selector
	defineViewport();
	// gets the elements that match the previous selector
	setViewportRows();
	// if perspective add css
	if( perspective ) {
		$rows.css({
			'-webkit-perspective'		: 600,
			'-webkit-perspective-origin'	: '50% 0%'
		});				
	}
	// show the pointers for the inviewport rows
	$rowsViewport.find('a.ss-circle').addClass('ss-circle-deco');
	// set positions for each row
	placeRows();	
    },

    defineViewport	= function() {

        $.extend( $.expr[':'], {
        
            inviewport	: function ( el ) {
                if ( $(el).offset().top < winSize.height ) {
                    return true;
                }
                return false;
            }
        
        });
    
    },

    setViewportRows	= function() {
	
        $rowsViewport 		= $rows.filter(':inviewport');
        $rowsOutViewport	= $rows.not( $rowsViewport )
        
    },

    getWinSize		= function() {

        winSize.width	= $win.width();
        winSize.height	= $win.height();
    
    },

    initEvents		= function() {
		
		// navigation menu links.
		// scroll to the respective section.
		$links.on( 'click.Scrolling', function( event ) {
			
			// scroll to the element that has id = menu's href
			$('html, body').stop().animate({
				scrollTop: $( $(this).attr('href') ).offset().top
			}, scollPageSpeed, scollPageEasing );
			
			return false;
		
		});
		
		$(window).on({
			// on window resize we need to redefine 
			// which rows are initially visible 
			// (this ones we will not animate).
			'resize.Scrolling' : function( event ) {
				
				// get the window sizes again
				getWinSize();
				// redefine which rows are initially 
				// visible (:inviewport)
				setViewportRows();
				// remove pointers for every row
				$rows.find('a.ss-circle').removeClass('ss-circle-deco');
				// show inviewport rows and respective pointers
				$rowsViewport.each( function() {
				
					$(this).find('div.ss-left')
						   .css({ left   : '0%' })
						   .end()
						   .find('div.ss-right')
						   .css({ right  : '0%' })
						   .end()
						   .find('a.ss-circle')
						   .addClass('ss-circle-deco');
				
				});
			
			},
			// when scrolling the page change 
			// the position of each row	
			'scroll.Scrolling' : function( event ) {
				
				// set a timeout to avoid that the 
				// placeRows function gets called on 
				// every scroll trigger
				if( anim ) return false;
				anim = true;
				setTimeout( function() {
					
					placeRows();
					anim = false;
					
				}, 10 );
			
			}
		});
	
    },
    
    // PlacesRows

    placeRows		= function() {		
		// how much we scrolled so far
	var winscroll	= $win.scrollTop(),
		// the y value for the center of the screen
	winCenter	= winSize.height / 1.3+ winscroll;
	
	// for every row that is not inviewport
	$rowsOutViewport.each( function(i) {
		
		var $row	= $(this),
			// the left side element
			$rowL	= $row.find('div.ss-left'),
			// the right side element
			$rowR	= $row.find('div.ss-right'),
			// top value
			rowT	= $row.offset().top;
		
		// hide the row if it is under the viewport
		if( rowT > winSize.height + winscroll ) {

			if( perspective ) {

				$rowL.css({
					'-webkit-transform'	: 'translate3d(-75%, 0, 0) rotateY(-95deg) translate3d(-75%, 0, 0)',
					'opacity'			: 0
				});
				$rowR.css({
					'-webkit-transform'	: 'translate3d(75%, 0, 0) rotateY(90deg) translate3d(75%, 0, 0)',
					'opacity'			: 0
				});

			}
			else {

				$rowL.css({ left 		: '-50%' });
				$rowR.css({ right 		: '-50%' });

			}

		}
		// if not, the row should become visible 
		// (0% of left/right) as it gets closer to 
		// the center of the screen.
		else {
				
				// row's height
			var rowH	= $row.height(),
				// the value on each scrolling step 
				// will be proporcional to the distance 
				// from the center of the screen to its height
				factor 	= ( ( ( rowT + rowH / 2 ) - winCenter ) / ( winSize.height / 2 + rowH / 2 ) ),
				// value for the left / right of each side of the row.
				// 0% is the limit
				val		= Math.max( factor * 50, 0 );
				
			if( val <= 0 ) {
			
				// when 0% is reached show the pointer for that row
				if( !$row.data('pointer') ) {
				
					$row.data( 'pointer', true );
					$row.find('.ss-circle').addClass('ss-circle-deco');
				
				}
			
			}
			else {
				
				// the pointer should not be shown
				if( $row.data('pointer') ) {
					
					$row.data( 'pointer', false );
					$row.find('.ss-circle').removeClass('ss-circle-deco');
				
				}
			
			}
			
			// set calculated values
			if( perspective ) {

				var	t = Math.max( factor * 95, 0 ),
					r = Math.max( factor * 90, 0 ),
					o = Math.min( Math.abs( factor - 1 ), 1 );

				$rowL.css({
					'-webkit-transform'	: 'translate3d(-' + t + '%, 0, 0) rotateY(-' + r + 'deg) translate3d(-' + t + '%, 0, 0)',
					'opacity'           : o
				});
				$rowR.css({
					'-webkit-transform'	: 'translate3d(' + t + '%, 0, 0) rotateY(' + r + 'deg) translate3d(' + t + '%, 0, 0)',
					'opacity'		: o
				});

			}
			else {

				$rowL.css({ left 	: - val + '%' });
				$rowR.css({ right 	: - val + '%' });
	   
			}
			
		}	
	
	});

};

return { init : init };
})();
			
$sidescroll.init();
})
/* Hover and Click Trigger for Circular Elements with jQuery */
$(function() {
				
    $('#circle').circlemouse({
        onMouseEnter	: function( el ) {
        
            el.addClass('ec-circle-hover');
        
        },
        onMouseLeave	: function( el ) {
            
            el.removeClass('ec-circle-hover');
            
		},
		onClick			: function( ) {
		
		location.href='#about-me'
			
		}
       
    });
   

});
