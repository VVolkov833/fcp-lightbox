'use strict';

// wait for DOM
(function(){let i=setInterval(function(){let r=document.readyState;if(r!=='complete'&&r!=='interactive'){return}clearInterval(i);i=null;r=null;

    const { selector, loader, dev, ver } = window.fcp_lightbox;

    // no images found
    if ( !document.querySelector( selector ) ) { return }
    
    // get the url of the main script
    const self = document.getElementById( loader ),
          self_url = new URL( self.src ),
          load_url = new URL( 'assets/script'+(dev ? '' : '.min')+'.js'+'?'+ver, self_url ).href;

    // load the main script
    const script = document.createElement( 'script' );
    Object.assign( script, {
            id: loader.replace( '-loader', '' ),
            type: 'text/javascript',
            defer: true, 
            src: load_url
    });
    self.parentElement.insertBefore( script, self );

},100)})();