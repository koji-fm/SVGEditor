/**
 * @class
 */
$.SE.APSelector = (function () {
	
	var _super = $.SE.Selector.prototype,
		SegSelector = $.SE.SegSelector,
		PathSelector = $.SE.PathSelector;
	
	return $.extend(new $.SE.Selector(), {
		
		addToSelection: function (anchor) {
			
			_super.addToSelection.call(this, anchor);
			$(anchor.elm)._addClass("selected");
			anchor.showAdjacentCP();

			PathSelector.addToSelection(anchor.path);
		},
		
		clear: function () {
			
			this.each(function () {
				
				$(this.elm)._removeClass("selected");
				this.hideAdjacentCP();
			});
			
			_super.clear.apply(this);
			
			PathSelector.clear();
		},
		
		removeFromSelection: function (anchor) {
			
			var path = anchor.path;
			
			_super.removeFromSelection.call(this, anchor);
			$(anchor.elm)._removeClass("selected");
			
			// パスの中に選択中のUI要素が無くなればパスの選択を解除する
			if (!$(path.uiSuit).find(".selected")[0]) {
				
				PathSelector.removeFromSelection(path);
			}
		}
	});
} ());