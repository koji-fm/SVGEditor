"use strict";

/**
 * @namespace
 */
$.SE = {};

$(function () {
	
	var Field = $.SE.Field,
		Path = $.SE.Path,
		AnchorPoint = $.SE.AnchorPoint,
		PathSelector = $.SE.PathSelector,
		APSelector = $.SE.APSelector,
		Segment = $.SE.Segment,
		SegmentManager = $.SE.SegmentManager,
		Tool = $.SE.Tool,
		Property = $.SE.Property;
	
	Field.init();
	Tool.init();
	AnchorPoint.initHover();
	Property.init();
	
	$("button#compoundBtn").click(function () {
		
		new $.SE.CompoundPath(PathSelector.selection);
	});
});



$.fn.extend({
	_addClass: function(name) {
		
		this.each(function() {
			
			var currentClass = $(this).attr("class") || "";
			
			if (-1 !== currentClass.indexOf(name)) {
				
				return;
			}
			
			$(this).attr("class", currentClass + " " + name);
		});
		return this;
	},
	
	_removeClass: function(name) {
		var arg = arguments;
		this.each(function() {
			for (var i=0; i < arg.length; i++) {
				$(this).attr("class", $(this).attr("class").replace(RegExp("\\s?"+ arg[i] +"(\\s|)"), "$1"));
			}
		});
		return this;
	},
	
	_hasClass: function(name) {
		var has = false;
		this.each(function () {
			if ($(this).attr("class") && -1 !== $(this).attr("class").indexOf(name))
				has = true;
		});
		return has;
	}
});

$.SE.SVGUtil = {
	create: function (tagName, attributes) {
		var elm = document.createElementNS("http://www.w3.org/2000/svg", tagName);
		if (attributes) {
			this.setAttributes(elm, attributes);
		}
		return elm;
	},
	
	setAttributes: function (element, attributes) {
		for (var attr in attributes) {
			element.setAttribute(attr, attributes[attr]);
		}
	}
};