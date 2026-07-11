<?php
/**
 * Aviendha functions and definitions
 *
 * @package Aviendha
 * @since   0.1.0
 */

namespace Aviendha;

/**
 * Set up theme defaults and register various WordPress features.
 */
function aviendha_setup() {
	// Make theme available for translation.
	load_theme_textdomain( 'aviendha', get_template_directory() . '/languages' );

	// Enqueue editor styles.
	add_editor_style( 'style.css' );

	// Remove core block patterns; content is composed from aludra/* blocks directly.
	remove_theme_support( 'core-block-patterns' );

	// WooCommerce.
	add_theme_support( 'woocommerce' );
	add_theme_support( 'wc-product-gallery-zoom' );
	add_theme_support( 'wc-product-gallery-lightbox' );
	add_theme_support( 'wc-product-gallery-slider' );
}
add_action( 'after_setup_theme', __NAMESPACE__ . '\aviendha_setup' );

/**
 * Register the 'menu' template part area, required by the Aludra mega-menu block.
 *
 * @param array $areas Existing template part areas.
 * @return array Modified template part areas.
 */
function aviendha_template_part_areas( $areas ) {
	$areas[] = array(
		'area'        => 'menu',
		'area_tag'    => 'nav',
		'label'       => __( 'Menu', 'aviendha' ),
		'description' => __( 'Template parts for navigation and mega menu content.', 'aviendha' ),
		'icon'        => 'navigation',
	);

	return $areas;
}
add_filter( 'default_wp_template_part_areas', __NAMESPACE__ . '\aviendha_template_part_areas' );

/**
 * Enqueue theme styles.
 */
function aviendha_enqueue_styles() {
	wp_enqueue_style(
		'aviendha-style',
		get_template_directory_uri() . '/style.css',
		array(),
		wp_get_theme()->get( 'Version' )
	);
}
add_action( 'wp_enqueue_scripts', __NAMESPACE__ . '\aviendha_enqueue_styles' );

/**
 * Enqueue WooCommerce-specific styles, if present.
 */
function aviendha_enqueue_woocommerce_styles() {
	if ( ! class_exists( 'WooCommerce' ) ) {
		return;
	}

	if ( file_exists( get_template_directory() . '/assets/css/woocommerce.css' ) ) {
		wp_enqueue_style(
			'aviendha-woocommerce-style',
			get_template_directory_uri() . '/assets/css/woocommerce.css',
			array( 'aviendha-style' ),
			(string) filemtime( get_template_directory() . '/assets/css/woocommerce.css' )
		);
	}
}
add_action( 'wp_enqueue_scripts', __NAMESPACE__ . '\aviendha_enqueue_woocommerce_styles' );
