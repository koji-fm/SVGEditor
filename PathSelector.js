
$.SE.PathSelector = (function () {
	
	var _super = $.SE.Selector.prototype,
		Property = $.SE.Property;
	
	return $.extend(new $.SE.Selector(), {
		
		addToSelection: function (path, dealAP) {
			
			_super.addToSelection.call(this, path);
			$(path.uiSuit)._addClass("selected");
			
			if (dealAP) {
				
				$.each(path.getAPList(), function () {
					
					$.SE.APSelector.addToSelection(this);
				});
			}
			
			Property.display(this);
		},
		
		removeFromSelection: function (path, dealAP) {
			
			_super.removeFromSelection.call(this, path);
			$(path.uiSuit)._removeClass("selected");
			
			if (dealAP) {
				
				$.each(path.getAPList(), function () {
					
					$.SE.APSelector.removeFromSelection(this);
				});
			}
			
			if (this.selection[0]) {
				
				Property.display(this);
			}
		},
		
		clear: function () {
			
			_super.clear.apply(this);
			$("g.ui-suit.selected")._removeClass("selected");
		}
	});
}());
