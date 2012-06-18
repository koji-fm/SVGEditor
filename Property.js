
$.SE.Property = {
	
	strokeWidth: {attribute: "stroke-width"},
	fillColor: {attribute: "fill"},
	strokeColor: {attribute: "stroke"},
		
	init: function () {
		
		this.strokeWidth.$input = $("section#stroke-width-controler input").data("attribute", "stroke-width");
		this.fillColor.$input = $("#fill-color").data("attribute", "fill");
		this.strokeColor.$input = $("#stroke-color").data("attribute", "stroke");
		
		$("input").keydown(function (evt) {
			
			if (evt.which === 13) {
				
				$(this).blur();
			}
		});
		
		$("input").change(function () {
			
			var attr = $(this).data("attribute"),
				val = $(this).val();
			
			$.SE.PathSelector.each(function () {
				
				this.target.setAttribute(attr, val);
			});
		});
	},
	
	set: function (pathElm) {
		
		$.SE.SVGUtil.setAttributes(pathElm, {
			"stroke-width": this.strokeWidth.$input.val(),
			"fill": this.fillColor.$input.val(),
			"stroke": this.strokeColor.$input.val()
		});
	},
		
	display: function (pSelector) {
		
		var strokeWidth, fillColor, strokeColor;
		
		pSelector.each(function () {
			
			strokeWidth = this.target.getAttribute("stroke-width");
			fillColor = this.target.getAttribute("fill");
			strokeColor = this.target.getAttribute("stroke");
		});
		
		this.strokeWidth.$input.val(strokeWidth);
		this.fillColor.$input.val(fillColor);
		this.strokeColor.$input.val(strokeColor);
	}
};