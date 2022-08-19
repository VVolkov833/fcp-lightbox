<?php

/*
Plugin Name: FCP Lightest Lightbox
Description: Super lightweight lighbox. It tracks the links to images and makes it open in a popup lightbox. It also adds prev-next navigation to galleries or image sequences.
Version: 1.4
Requires at least: 5.7
Requires PHP: 7.0.0
Author: Firmcatalyst, Vadim Volkov
Author URI: https://firmcatalyst.com
License: GPL v3 or later
License URI: http://www.gnu.org/licenses/gpl-3.0.html
*/

defined( 'ABSPATH' ) || exit;

define( 'FCPLB_DEV', true );
define( 'FCPLB_VER', get_file_data( __FILE__, [ 'ver' => 'Version' ] )[ 'ver' ] . ( FCPLB_DEV ? time() : '' ) );


// enqueue assets
add_action( 'wp_enqueue_scripts', function() {

    $assets_url = function($name, $ext, $ver = '') {
        return plugin_dir_url(__FILE__) . $name . ( FCPLB_DEV ? '' : '.min' ) . '.' . $ext . ( $ver ? '?' . $ver : '' );
    };
    
    $translations = ['Previous', 'Next', 'Close'];
    $translations = array_map( function( $a ) use ( $translations ) {
        return __( $translations[ $a ] );
    }, array_flip( $translations ) );

    // enqueue the loader script
    wp_enqueue_script( 'fcp-lightbox', $assets_url( 'loader', 'js' ), [], FCPLB_VER );
    add_filter('script_loader_tag', function ($tag, $handle) { // change to async
        if ( $handle !== 'fcp-lightbox' ) { return $tag; }
        return str_replace( ' src', ' async src', $tag );
    }, 10, 2);
    
    // global js values
    $settings = [
        'path' => esc_js( plugin_dir_url(__FILE__) ),
        'dev' => FCPLB_DEV ? true : false,
        'ver' => esc_js( FCPLB_VER ),
        'selector' => 'a[href$=".jpg"], a[href$=".jpeg"], a[href$=".png"]',
        'translations' => $translations,
    ];
    
    wp_add_inline_script( 'fcp-lightbox', 'window.fcp_lightbox = '.json_encode( $settings ).';' );
    
    // wp_enqueue_style( 'fcp-lightbox', $assets_url( 'style', 'css' ), [], FCPLB_VER ); // moved to script.js to eleminate render blocking
});