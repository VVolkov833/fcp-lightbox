'use strict';
(()=>{
    const d = document,
        body = d.querySelector( 'body' ),
        p = window.fcp_lightbox; // preferences

    // ******* create & apply the lightbox
    // the gallery and swipe options are applied later below

    // create the holder & gallery_navigationigation
    const holder = d.createElement( 'div' );
    holder.id = 'fcplb';
    holder.style = 'display:none'; //++remove on style.css onload?? && remove !important from css
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
    d.querySelectorAll( p.selector ).forEach( a => {
        a.addEventListener( 'click', e => {
            e.preventDefault();
            open( a );
        });
    });

    let open = a => { // decorated by gallery_navigation later
        if ( !a || !a.href ) { return }
        
        const old = holder.querySelector( 'img' );
        if ( old ) { old.remove() }
        
        const img = d.createElement( 'img' );
        img.src = a.href;
        holder.prepend( img );

        holder.classList.add( 'fcplb-active' );
        body.style.overflow = 'hidden';
        body.style.setProperty( 'touch-action', 'none' ); // for safari to not scroll the body
        d.addEventListener( 'keydown', keyboard );
        return img;
    };

    function close() {
        holder.classList.remove( 'fcplb-active' );
        body.style.overflow = null;
        body.style.removeProperty( 'touch-action' );
        d.removeEventListener( 'keydown', keyboard );
    }

    let keyboard = e => { // decorated by gallery_navigationigation later
        if ( e.code === 'Escape' ) {
            e.preventDefault();
            close();
        }
    };

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

    // ******* track gallery
    
    // track links sequence
    function siblings(a) {
        let li = a, // a or an ancestor
            tree = [], // signature
            prev = {}, // link object
            next = {}; // link object

        while ( li.parentNode ) {
            li = tree[0] && li.parentNode || li; // use self on the first round
            if ( li === d ) { return false }
            
            tree.unshift( li.tagName.toLowerCase() );
            
            prev = a_by_tree( li.previousElementSibling );
            next = a_by_tree( li.nextElementSibling );
            
            if ( !prev && !next ) { continue }

            return {
                prev : prev,
                next : next
            }
        }

        return false; // not a gallery
        
        function a_by_tree(sibling) {

            if ( sibling === null || sibling.tagName.toLowerCase() !== tree[0] ) { return false }

            const selector = tree.slice(1).join( '>' ),
                  a = selector ? sibling.querySelector( selector ) : sibling;

            if ( !a || a.parentNode.querySelector( p.selector ) === null ) { return false }
            
            return a;
        }
    }

    // track galleries, add left-right gallery_navigationigation
    let current = d.createElement( 'a' ); // currently opened link

    // create the gallery navigation buttons & functions
    const bprev = button( prev, 'Previous', 'prev' );
    bprev.show = _show; bprev.hide = _hide;
    const bnext = button( next, 'Next', 'next' );
    bnext.show = _show; bnext.hide = _hide;

    const open_gallery = open;
    open = a => {
        gallery_navigation( a );
        return open_gallery( a );
    };

    function prev() { change( 'prev' ) }
    function next() { change( 'next' ) }
    function change(pn) {
        const s = siblings( current );
        if ( !s[pn] ) { return }
        open( s[pn] );
    }

    function gallery_navigation(a) { // ++Y is it hidden in mobiles sometimes?
        current = a;
        bprev.hide(); bnext.hide();
        const s = siblings( a );
        if ( s && s.prev ) { bprev.show() }
        if ( s && s.next ) { bnext.show() }
    }

    function _show() {
        this.classList.remove( 'hide' );
    }
    function _hide() {
        this.classList.add( 'hide' );
    }
    
    // keyboard gallery navigation
    const keyboard_gallery = keyboard;
    keyboard = e => {
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


    // ******* swipe & finger support

    const open_swiping = open;
    open = a => {
        const img = open_swiping( a );
        img.setAttribute( 'unselectable', 'on' );
        img.setAttribute( 'draggable', 'false' );

        const catchEvents = {
            "touchstart"    : ["touchmove", "touchend"],
            "mousedown"     : ["mousemove", "mouseup"]
        };
        for ( let i in catchEvents ) {
            img.addEventListener( i, start, false );
        }
        
        function start(e) {

            const moveEvent = catchEvents[e.type][0],
                  upEvent   = catchEvents[e.type][1],
                  initPos   = pointerPos(e),
                  startTime = new Date().getTime(),
                  w = window;

            holder.classList.add( 'fcplb-hide-loading' );

            // handling pointer events
            w.addEventListener( moveEvent, followPointer );
            w.addEventListener( upEvent, function cancel(e) {
                w.removeEventListener( moveEvent, followPointer, false );
                w.removeEventListener( upEvent, cancel, false );

                const lasts = new Date().getTime() - startTime,
                      pos = pointerPos(e),
                      x = pos.x - initPos.x,
                      y = pos.y - initPos.y,
                      is_horisontal = Math.abs( x ) > Math.abs( y ),
                      s = siblings( current );

                img.style = '';

                if ( lasts < 400 || Math.abs( x ) > 200 || Math.abs( y ) > 200 ) { // swipe fast of slide long
                    //++ simplify, unify if no changes, maybe separate the styling stuff
                    if ( is_horisontal ) {
                        if ( x > 0 && s['prev'] ) {
                            setTimeout( prev, 200 ); // css thansition time
                            img.className = 'fcplb-swipe-right';
                            holder.classList.remove( 'fcplb-hide-loading' );
                            return;
                        }
                        if ( x < 0 && s['next'] ) {
                            setTimeout( next, 200 );
                            img.className = 'fcplb-swipe-left';
                            holder.classList.remove( 'fcplb-hide-loading' );
                            return;
                        }
                    } else {
                        if ( y > 0 ) {
                            img.className = 'fcplb-swipe-down';
                            close(); // closing has a default transition in css, so no Timeout needed
                            return;
                        }
                        if ( y < 0 ) {
                            img.className = 'fcplb-swipe-up';
                            close();
                            return;
                        }
                    }
                }

                holder.classList.add( 'fcplb-swipe-return' ); // return to the center

                // ++prevent changing direction on diagonal move (only prev-next or only close, as started)
                // ++add 2 fingers && 2 buttons to zoom
                // ++doubleclick to restore the zoom lvl
                // ++add more styles
            });

            function followPointer(e) {

                const pos = pointerPos(e);
                let x = pos.x - initPos.x,
                    y = pos.y - initPos.y;
                if ( Math.abs( x ) > Math.abs( y ) ) { y = 0 } else { x = 0 } // no diagonal movement

                holder.classList.remove( 'fcplb-swipe-return' );
                img.style = 'transform:translate('+x+'px,'+y+'px)';
            }
            
            function pointerPos(e) {
                if ( e.changedTouches && e.changedTouches[0] ) {
                    return { x : e.changedTouches[0].clientX, y : e.changedTouches[0].clientY };
                }
                if ( e.clientX !== 'undefined' ) {
                    return { x : e.clientX, y : e.clientY };
                }
            }
        }
    };

})();