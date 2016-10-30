sap.ui.define([], function() {
	"use strict";

	var get = function(url) {
		var def = $.ajax({
			url: url,
			type: 'GET',
			dataType: 'json'
		});
		return def.promise();
	};

	var post = function(url, data) {
		var def = $.ajax({
			url: url,
			type: 'POST',
			dataType: 'json',
			data: JSON.stringify(data)
		});
		return def.promise();
	};
	
	return {
		get: get,
		post: post
	};
});