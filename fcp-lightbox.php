<?php

/*
Plugin Name: FCP Lightest Lightbox
Description: Super lightweight lighbox. It tracks the links to images and makes it open in a popup lightbox. It also adds prev-next navigation to galleries or image sequences.
Version: 1.1.8
Requires at least: 5.5
Requires PHP: 7.0.0
Author: Firmcatalyst, Vadim Volkov
Author URI: https://firmcatalyst.com
License: GPL v3 or later
License URI: http://www.gnu.org/licenses/gpl-3.0.html
*/

defined( 'ABSPATH' ) || exit;

define( 'FCPLB_DEV', false );
define( 'FCPLB_VER', get_file_data( __FILE__, [ 'ver' => 'Version' ] )[ 'ver' ] . ( FCPLB_DEV ? time() : '' ) );


// a simple translation solution, as there are only 3 words, which have translations by default
add_action( 'wp_footer', function() {
?>
<script type="text/javascript">window.fcp_translations_lightbox = {<?php
    foreach( ['Previous', 'Next', 'Close'] as $v ) { echo '"' . $v . '":"' . __( $v ) . '",'; }
?>}</script>
<?php
});


// returns url to the assets
$fcp_lightbox_asset = function($name, $ext, $ver = '') {
    return plugin_dir_url(__FILE__) . $name . ( FCPLB_DEV ? '' : '.min' ) . '.' . $ext . ( $ver ? '?' . $ver : '' );
};


// enqueue assets
if ( strpos( wp_get_theme()->Name, 'Firmcatslyst' ) === false ) { // for any common wp theme
    add_action( 'wp_enqueue_scripts', function() {
        global $fcp_lightbox_asset;
        wp_enqueue_script( 'fcp-lightbox',
            $fcp_lightbox_asset( 'script', 'js' ),
            [], FCPLB_VER
        );
        wp_enqueue_style( 'fcp-lightbox',
            $fcp_lightbox_asset( 'style', 'css' ),
            [], FCPLB_VER
        );
        unset( $GLOBALS['fcp_lightbox_asset'] );
    });
    return;
}


// exception for Firmcatalyst themes for async assets loading
add_action( 'wp_head', function() {
    global $fcp_lightbox_asset;
    // ++ track first, if there are links to images, then load js & css
    ?><script type="text/javascript">fcLoadScriptVariable(<?php echo "'".$fcp_lightbox_asset( 'script', 'js', FCPLB_VER )."'" ?>,'',()=>{},[],<?php echo "'".$fcp_lightbox_asset( 'style', 'css', FCPLB_VER )."'" ?>)</script>
    <?php
    unset( $GLOBALS['fcp_lightbox_asset'] );
});