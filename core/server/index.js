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
(function () {
	'use strict';
	
	var http = require("http"),
		mime = require('mime'),
		httpStatic = require('node-static'),
		createServer,
		server = {};
	
	/**
	 * Implementation of hook.initialize()
	 * This will be called once when the server starts
	 */
	server.initialize = function () {
		createServer();
	};
	
	/**
	 * Implementation of hook.config()
	 * This will return configuration options for this module
	 */
	server.config = function () {
		return {
			'weight': 10
		};
	};
	
	/**
	 * Create and manage the server connection
	 * @private
	 */
	createServer = function () {
		var headers = global.cliste.core.cliste.getHeaders(),
			paths = global.cliste.core.path.getPaths(),
			aliases = global.cliste.core.alias.getAliases(),
			fileServer = new (httpStatic.Server)('./', {
				'cache': 3600
			}),
			url,
			html,
			data;
		
		http.createServer(function(request, response) {
			
			try {
				
				// if there is a valid path or valid alias
				if (typeof(paths[request.url]) !== 'undefined' || typeof(aliases[request.url]) !== 'undefined') {
					// force the header to be text/html
					global.cliste.core.cliste.setHeader({
						'Content-Type': 'text/html'
					});
					// give a found response
					response.writeHead(200, headers);
					// set the URL from the alias, or use the current URL
					if (typeof(aliases[request.url]) !== 'undefined') {
						url = aliases[request.url];
					} else {
						url = request.url;
					}
					// get the HTML for the page based on the path
					html = global.cliste[paths[url].type][paths[url].name][paths[url].template]();
					
				} else { // there is no path or alias for this URL
					
					// set the URL
					url = request.url;
					
					// if a real file exists at the requested URL
					if (global.cliste.core.file.fileExists(global.cliste.settings.base + url)) {
						
						// if the URL is in the /sites/all/file folder
						if (url.indexOf('/sites/all/file') === 0) {
							
							request.addListener('end', function () {
						        fileServer.serve(request, response);
						    });
							
							return true;
							
						} // the URL is not in the /sites/all/file folder
							
						// since it isn't in the /sites/all/file folder, we don't want to show it
						global.cliste.core.cliste.setHeader({
							'Content-Type': 'text/html'
						});
						response.writeHead(404, headers);
						html = global.cliste.core.theme.get404();
						
					} else { // the file doesn't exist
						
						// show the 404 page
						global.cliste.core.cliste.setHeader({
							'Content-Type': 'text/html'
						});
						response.writeHead(404, headers);
						html = global.cliste.core.theme.get404();
						
					}
					
				}
				
				// write the generated HTML
				response.write(html);
				response.end();
				
			} catch (exception) { // oops something went wrong!
				
				console.log(exception); // log the exception to the server
				
				// set the content type to text
				global.cliste.core.cliste.setHeader({
					'Content-Type': 'text/plain'
				});
				
				// write out the headers
				response.writeHead(404, headers);
				// write the exception to the server and error out gracefully
				html = exception.toString();
				
				response.write(html);
				response.end();
				
			}
			
		}).listen(global.cliste.settings.port);
		
	};
	
	/**
	 * Return the form module to the global scope
	 */
	module.exports = server;
	
}());
