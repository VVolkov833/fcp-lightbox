'use strict';
(function(){let a=setInterval(function(){if(document.readyState!=='complete'&&document.readyState!=='interactive'){return}clearInterval(a);a=null; // soft wait for dom ready

    // check if the preferences exist & can load the lightbox
    const p = window.fcp_lightbox;
    if ( !p || !p.selector || !document.querySelector( p.selector ) ) { return }
    
    // append the script
    const d = document,
          body = d.querySelector( 'body' );

    const script = d.createElement( 'script' );
    Object.assign( script, {
            'id':'fcp-lightbox-js', 'type':'text/javascript', 'async':true, 
            'src':p.path + 'assets/script' + (p.dev ? '' : '.min') + '.js?' + p.ver
    });
    body.append( script );

},300)})();