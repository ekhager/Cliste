/*jslint devel: false, browser: true, maxerr: 50, indent: 4*/
/*global global: false, module: false, $: false, jQuery: false, console: false, document: false, event: false, frames: false, history: false, Image: false, location: false, name: false, navigator: false, Option: false, parent: false, screen: false, setInterval: false, setTimeout: false, window: false, XMLHttpRequest: false */

/**
 *	@description
 *		Ding is a class used to manage elements, events and timers
 *	@author
 *		Brian Martin
 *	@version
 *		1.0.0
 *	@namespace
 *		Cliste
 */
(function() {
	'use strict';
	
	var admin = {};
	
	admin.initialize = function () {
		global.cliste.core.path.addPath({
			'/admin': {
				'type': 'core',
				'name': 'admin',
				'template': 'getHTML'
			}
		});
		
		global.cliste.core.theme.addTheme({
			'admin': {
				'parent': 'page-admin',
				'view': global.cliste.core.file.getSource('core', 'admin', 'template/admin.handlebars'),
				'model': {
					'text': 'admin page'
				}
			}
		});
	};
	
	admin.getHTML = function () {
		return global.cliste.core.theme.process('admin');
	};
	
	admin.config = function () {
		return {
			'weight': 0
		};
	};
		
	module.exports = admin;
	
}());