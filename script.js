;'use strict';
(function(){let a=setInterval(function(){if(document.readyState!=='complete'&&document.readyState!=='interactive'){return}clearInterval(a);a=null; // soft wait for dom ready

    const body = document.querySelector( 'body' );
    const selector = 'a[href$=".jpg"], a[href$=".jpeg"], a[href$=".png"]';

    // create the holder & navigation
    const holder = document.createElement( 'div' );
    holder.id = 'fcplb';
    body.prepend( holder );

    button( close, 'Close', 'close' );
    
    // go through links
    document.querySelectorAll( selector ).forEach( function(a) {
        a.addEventListener( 'click', function(e) {
			e.preventDefault();
            open( a );
		});
    });

    let open = function(a) { // decored by navigation later
        if ( !a || !a.href ) { return }
        
        const old = holder.querySelector( 'img' );
        if ( old ) { old.remove() }
        
        const img = document.createElement( 'img' );
        img.src = a.href;
        holder.prepend( img );

        holder.classList.add( 'active' );
        document.querySelector( 'body' ).style.overflow = 'hidden';
        document.addEventListener( 'keydown', keyboard );
    };

    let keyboard = function(e) { // decored by navigation later
        if ( e.code === 'Escape' ) {
            e.preventDefault();
            close();
        }
    };

    function close() {
        holder.classList.remove( 'active' );
        document.querySelector( 'body' ).style.overflow = null;
        document.removeEventListener( 'keydown', keyboard );
    }

    function button(func, name='', class_name='') { // I tried to take it all from the function name, but minification..
        const el = document.createElement( 'button' );
        el.title = __( name );
        el.type = 'button';
        el.className = 'fcplb-' + class_name;
        el.addEventListener( 'click', func );
        holder.append( el );
        return el;
    }


    // track galleries, add left-right navigation
    let current = document.createElement( 'a' );

    const bprev = button( prev, 'Previous', 'prev' );
    bprev.show = _show; bprev.hide = _hide;
    const bnext = button( next, 'Next', 'next' );
    bnext.show = _show; bnext.hide = _hide;

    const open_gallery = open;
    open = function(a) {
        open_gallery( a );
        nav( a );
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
            if ( li === document ) { return false }
            
            sign.push( li.tagName );

            if ( pos ) {
                lis = pos === 'prev' ? li.previousElementSibling : li.nextElementSibling;
            } else {
                lis = li.previousElementSibling || li.nextElementSibling;
            }
            if ( !lis ) { continue }
            if ( !li.tagName || !lis.tagName || li.tagName !== lis.tagName ) { continue }
            
            // check the link of sibling // ++get && compare the signatures here? or improve the full get-sybming algs
            lisa = lis.querySelector( selector ) || !sign[1] && lis;
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

    function prev() { pn( 'prev' ) }
    function next() { pn( 'next' ) }
    function pn(a) {
        const li = sibling( current, a );
        if ( li === false ) { return }
        open( li.lisa );
        nav( li.lisa );
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
    function __(a) {
        return fcp_translations_lightbox && fcp_translations_lightbox[ a ] || a;
    }

},300)})();