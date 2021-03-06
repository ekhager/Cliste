/*jslint devel: false, browser: true, maxerr: 50, indent: 4*/
/*global cliste: false, module: false, $: false, jQuery: false, console: false, document: false, event: false, frames: false, history: false, Image: false, location: false, name: false, navigator: false, Option: false, parent: false, screen: false, setInterval: false, setTimeout: false, window: false, XMLHttpRequest: false */

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
		httpStatic = require('node-static'),
		querystring = require('querystring'),
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
		var headers = cliste.core.helper.getHeaders(),
			paths = cliste.core.path.getPaths(),
			aliases = cliste.core.alias.getAliases(),
			fileServer = new (httpStatic.Server)('./', {
				'cache': 3600
			}),
			url,
			html,
			data;
		
		http.createServer(function(request, response) {
			var SID;
			
			request.on('data', function (chunk) {
				if (typeof(request.postData) === 'undefined') {
					request.postData = '';
				}
				
				request.postData += chunk;
			});
			
			try {
				
				cliste.emit('onConnect', request.url);
				headers = {};
				// if there is a valid path or valid alias
				if (typeof(paths[request.url]) !== 'undefined' || typeof(aliases[request.url]) !== 'undefined') {
					// force the header to be text/html
					cliste.core.helper.setHeader({
						'Content-Type': 'text/html'
					});
					
					cliste.emit('addHeaders', request.url);
					
					response.stop = true;
					
					// give a found response
					response.writeHead(200, headers);
						
					// set the URL from the alias, or use the current URL
					if (typeof(aliases[request.url]) !== 'undefined') {
						url = aliases[request.url];
					} else {
						url = request.url;
					}
					
					request.on('end', function () {
						cliste.settings.request = request;
						cliste.emit('updateModel', request.url);
					});
					
					request.on('end', function () {
						cliste.settings.request = request;
						cliste.settings.response = response;
						html = cliste[paths[url].type][paths[url].name][paths[url].callback](request, response);
					});
					
					request.on('end', function () {
						if (response.stop === true) {
							response.end();
						}
					});
					
					cliste.emit('onConnectSuccess', request.url);
					
				} else { // there is no path or alias for this URL
					
					// set the URL
					url = request.url;
					
					// if a real file exists at the requested URL
					if (cliste.core.file.fileExists(cliste.settings.base + url)) {
						
						// if the URL is in the /sites/all/file folder
						if (url.indexOf('/sites/default/file') === 0) {
							
							request.addListener('end', function () {
								
						        fileServer.serve(request, response, function (error, result) {
									
									if (error && (error.status === 404)) {
										cliste.core.helper.setHeader({
											'Content-Type': 'text/html'
										});
										response.writeHead(404, headers);
										html = cliste.core.theme.get404();
										cliste.emit('onConnectNotFound', request.url);
										return true;
									}
									
						            if (error) { // There was an error serving the file
						                console.log(error);
						                // Respond to the client
						                cliste.core.helper.setHeader({
											'Content-Type': 'text/plain'
										});
										
										// write out the headers
										response.writeHead(500, headers);
										// write the exception to the server and error out gracefully
										html = error.toString();
										
										cliste.emit('onConnectError', request.url);
										
										response.write(html);
										response.end();
						            }
						            
						        });
						        
						    });
							
							return true;
							
						} // the URL is not in the /sites/all/file folder
							
						// since it isn't in the /sites/all/file folder, we don't want to show it
						cliste.core.helper.setHeader({
							'Content-Type': 'text/html'
						});
						
						response.writeHead(404, headers);
						
						html = cliste.core.theme.get404();
						
						cliste.emit('onConnectNotFound', request.url);
						
					} else { // the file doesn't exist
						
						// show the 404 page
						cliste.core.helper.setHeader({
							'Content-Type': 'text/html'
						});
						
						response.writeHead(404, headers);
						
						response.write(cliste.core.theme.get404());
						response.end();
						
						cliste.emit('onConnectNotFound', request.url);
						
					}
					
				}
				
				cliste.emit('onConnectionEnd', request, response, html);
				
			} catch (exception) { // oops something went wrong!
				
				console.log(exception); // log the exception to the server
				
				// set the content type to text
				cliste.core.helper.setHeader({
					'Content-Type': 'text/plain'
				});
				
				// write out the headers
				response.writeHead(500, headers);
				// write the exception to the server and error out gracefully
				html = exception.toString();
				
				response.write(html);
				response.end();
				
			}
			
		}).listen(cliste.settings.port);
		
	};
	
	/**
	 * Return the form module to the global scope
	 */
	
	server.contains = function contains(a, obj) {
		var i = obj.length;
		
		for (i = 0; i < obj.length; i += 1) {
			if (obj[i] === a) {
				return true;
			}
		}
		
		return false;
	};
	
	cliste.on('initialize', server.initialize);
	
	module.exports = server;
	
}());
