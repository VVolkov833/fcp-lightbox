'use strict';
(function() {
    const d = document,
        body = d.querySelector( 'body' ),
        p = window.fcp_lightbox; // preferences

    // create & apply the lightbox. the gallery options are applied later

    // create the holder & navigation
    const holder = d.createElement( 'div' );
    holder.id = 'fcplb';
    holder.style = 'display:none'; //++remove on style.css onload??
    body.prepend( holder );

    button( close, 'Close', 'close' );

    // append styles
    const style = d.createElement( 'link' );
    Object.assign( style, {
            'rel':'stylesheet', 'id':'fcp-lightbox-css', 'type':'text/css', 'media':'all',
            'href':p.path + 'assets/style' + (p.dev ? '' : '.min') + '.css?' + p.ver
    });
    body.append( style );

    // go through links
    d.querySelectorAll( p.selector ).forEach( function(a) {
        a.addEventListener( 'click', function(e) {
            e.preventDefault();
            open( a );
        });
    });

    let open = function(a) { // decorated by navigation later
        if ( !a || !a.href ) { return }
        
        const old = holder.querySelector( 'img' );
        if ( old ) { old.remove() }
        
        const img = d.createElement( 'img' );
        img.src = a.href;
        holder.prepend( img );

        holder.classList.add( 'active' );
        d.querySelector( 'body' ).style.overflow = 'hidden';
        d.addEventListener( 'keydown', keyboard );
        
        return img;
    };

    let keyboard = function(e) { // decorated by navigation later
        if ( e.code === 'Escape' ) {
            e.preventDefault();
            close();
        }
    };

    function close() {
        holder.classList.remove( 'active' );
        d.querySelector( 'body' ).style.overflow = null;
        d.removeEventListener( 'keydown', keyboard );
    }

    function button(func, name='', class_name='') { // I tried to take it all from the function name, but minification..
        const el = d.createElement( 'button' );
        el.title = __( name );
        el.type = 'button';
        el.className = 'fcplb-' + class_name;
        el.addEventListener( 'click', func );
        holder.append( el );
        return el;
    }
    
    // translatiions
    function __(a) {
        return fcp_lightbox.translations[ a ] || a;
    }


    // track galleries, add left-right navigation
    let current = d.createElement( 'a' );

    const bprev = button( prev, 'Previous', 'prev' );
    bprev.show = _show; bprev.hide = _hide;
    const bnext = button( next, 'Next', 'next' );
    bnext.show = _show; bnext.hide = _hide;

    const open_gallery = open;
    open = function(a) {
        nav( a );
        return open_gallery( a );
    };

    const keyboard_gallery = keyboard;
    keyboard = function(e) {
        keyboard_gallery( e );
        if ( e.code === 'ArrowLeft' ) {
            e.preventDefault();
            prev();
        }
        if ( e.code === 'ArrowRight' ) {
            e.preventDefault();
            next();
        }
    };

    function is_gallery(a) {
        const li = sibling( a );
        if ( li === false ) { return false }
        // compare the signature to it's sibling's
        if ( li.sign !== sibling( li.lisa ).sign ) { return false }
        return li;
    }

    function sibling(a, pos = '') {
        //  a
        let li = a, // a or an ancestor
            lis, // sibling
            lisa, // a inside the sibling
            sign = []; // signature (dom path for now)

        while ( li.parentNode ) {

            li = sign[0] ? li.parentNode : li; // use self on the first round
            if ( li === d ) { return false }
            
            sign.push( li.tagName );

            if ( pos ) {
                lis = pos === 'prev' ? li.previousElementSibling : li.nextElementSibling;
            } else {
                lis = li.previousElementSibling || li.nextElementSibling;
            }
            if ( !lis ) { continue }
            if ( !li.tagName || !lis.tagName || li.tagName !== lis.tagName ) { continue }
            
            // check the link of sibling // ++get && compare the signatures here? or improve the full get-sybming algs
            lisa = lis.querySelector( p.selector ) || !sign[1] && lis;
            if ( !lisa ) { return false }

            return {
                a : a,
                li : li,
                lis : lis,
                lisa : lisa,
                sign : sign.join( '>' ).toLowerCase()
            };
        }
        return false;
    }

    function prev() { return pn( 'prev' ) }
    function next() { return pn( 'next' ) }
    function pn(a) {
        const li = sibling( current, a );
        if ( li === false ) { return false }
        open( li.lisa );
        nav( li.lisa );
        return true;
    }

    function nav(a) {
        current = a;
        bprev.hide(); bnext.hide();
        const li = is_gallery( a );
        if ( li !== false ) {
            if ( li.li.previousElementSibling ) { bprev.show() }
            if ( li.li.nextElementSibling ) { bnext.show() }
        }
    }

    function _show() {
        this.classList.remove( 'hide' );
    }
    function _hide() {
        this.classList.add( 'hide' );
    }
    
    // swipe support

    const open_swiping = open_gallery;
    open = function(a) {
        nav( a );
        const img = open_swiping( a );

        img.setAttribute( 'unselectable', 'on' );
        img.setAttribute( 'draggable', 'false' );

        const catchEvents = {
            "touchstart"    : ["touchmove", "touchend"],
            //"mousedown"     : ["mousemove", "mouseup"] // ++enable with an option to cancel
        };
        for ( let i in catchEvents ) {
            img.addEventListener( i, start, false );
        }
        
        function start(e) {

            const moveEvent = catchEvents[e.type][0],
                  upEvent   = catchEvents[e.type][1],
                  initPos   = { x : e.clientX, y : e.clientY },
                  startTime = new Date().getTime();

            // handling pointer events
            window.addEventListener( moveEvent, followPointer );
            window.addEventListener( upEvent, function fB(e) {
                this.removeEventListener( moveEvent, followPointer, false );
                this.removeEventListener( upEvent, fB, false );

                const lasts = new Date().getTime() - startTime;
                
                // swipe
                if ( lasts < 400 ) {
                    const x = e.clientX - initPos.x,
                          y = e.clientY - initPos.y,
                          h = Math.abs( x ) > Math.abs( y ); // horisontal movement
                    if ( h ) {
                        if ( x > 0 ? prev() : next() ) { // ++delay the changing for better transition animation, MAYBE add the transition to arrows too and add delay to changing directly, to close too OR add a separate function to track if prev-next exist
                            //img.style = 'transition:transform 0.2s ease-out;transform:translate('+Math.sign(x)+'00vw,0)';
                            return;
                        }
                    } else { // vertical movement
                        img.style = 'transition:transform 0.2s ease-out;transform:translate(0,'+Math.sign(y)+'00vh)';
                        close();
                        return;
                    }
                }// ++else count the movement width > half? half of what?
                
                // ++add 2 fingers to zoom
                
                // default behavior
                //img.removeAttribute( 'style' );
                img.style = 'transition:transform 0.4s ease-out';
            });

            function followPointer(e) {
                const lasts = new Date().getTime() - startTime;
                if ( lasts < 200 ) { return }

                let x = e.clientX - initPos.x,
                    y = e.clientY - initPos.y;
                if ( Math.abs( x ) > Math.abs( y ) ) { y = 0 } else { x = 0 } // no diagonal movement

                img.style = 'transform:translate('+x+'px,'+y+'px)';
                
                // ++slop the loading spinner while dragging
            }
        }
    };

    d.querySelector( '.wp-block-image > a' ).dispatchEvent( new Event( 'click' ) ); //++--
})();