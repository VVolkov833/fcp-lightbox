<?php

/*
Plugin Name: FCP Lightest Lightbox
Description: Super lightweight lighbox. It tracks the links to images and makes it open in a popup lightbox. It also adds prev-next navigation to galleries or image sequences.
Version: 1.4.2
Requires at least: 5.7
Tested up to: 6.4
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

    // list of used phrases
    $to_translate = ['Previous', 'Next', 'Close', 'Caption'];
    $translations = array_map( function( $a ) use ( $to_translate ) {
        return __( $to_translate[ $a ] );
    }, array_flip( $to_translate ) );

    // enqueue the loader script
    $loader_name = 'fcp-lightbox-loader';
    $loader_file_url = plugins_url( '/loader'.( FCPLB_DEV ? '' : '.min' ).'.js', __FILE__ );
    wp_enqueue_script( $loader_name, $loader_file_url, [], FCPLB_VER );

    // defer the script loading
    add_filter('script_loader_tag', function ($tag, $handle) use ($loader_name) {
        if ( $handle !== $loader_name ) { return $tag; }
        return str_replace( [' defer', ' src'], [' ', ' defer src'], $tag );
    }, 10, 2);
    
    // global js values // ++ eliminate
    $settings = [
        'loader' => $loader_name.'-js',
        'path' => esc_js( plugin_dir_url(__FILE__) ), // ++almost can remove
        'dev' => FCPLB_DEV,
        'ver' => esc_js( FCPLB_VER ),
        'selector' => 'a[href$=".jpg"], a[href$=".jpeg"], a[href$=".png"]',
        'translations' => $translations,
    ];
    
    wp_add_inline_script( $loader_name, 'window.fcp_lightbox = '.json_encode( $settings ).';' );

}, 10 );