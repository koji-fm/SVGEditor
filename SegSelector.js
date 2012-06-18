$.SE.SegSelector = (function () {
	
	var _super = $.SE.Selector.prototype,
		PathSelector = $.SE.PathSelector;
	
	return $.extend(new $.SE.Selector(), {
		
		addToSelection: function (seg) {
			
			_super.addToSelection.call(this, seg);
			$(seg.elm)._addClass("selected");
			
			seg.showCP();
			
			PathSelector.addToSelection(seg.path);
		},
		
		clear: function () {
			
			this.each(function () {
				
				this.hideCP();
			});
			
			_super.clear.apply(this);
			$("path.seg.selected")._removeClass("selected");
			
			PathSelector.clear();
		},
		
		removeFromSelection: function (seg) {
			
			// 前後のアンカーポイントのどちらかが選択中の場合なにもしない
			if ((seg.ap1 && $(seg.ap1.elm)._hasClass("selected")) ||
				(seg.ap2 && $(seg.ap2.elm)._hasClass("selected"))) {
				
				return;
			}
			
			var path = seg.path;
			
			_super.removeFromSelection.apply(this, seg);
			seg.hideCP();
			
			// パスの中に選択中のUI要素が無くなればパスの選択を解除する
			if (!$(path.uiSuit).find(".selected")[0]) {
				
				PathSelector.removeFromSelection(path);
			}
		}
	});
} ());