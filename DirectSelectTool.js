
$.SE.Tool.DirectSelectTool = (function () {
	
	var Field = $.SE.Field,
		Path = $.SE.Path,
		AnchorPoint = $.SE.AnchorPoint,
		PathSelector = $.SE.PathSelector,
		APSelector = $.SE.APSelector,
		SegSelector = $.SE.SegSelector,
		Segment = $.SE.Segment,
		SegmentManager = $.SE.SegmentManager,
		Tool = $.SE.Tool;
		
	return {
		
		init: function () {
			
			Tool.currentSelectTool = "DirectSelectTool";
			
			// キャンバスをクリックで全ての選択を解除
			// 拡張可能な状態のパスも空にする
			Field.$svg.on("mousedown.direct_select_tool", function (evt) {
				
				if (evt.target === this) {
					
					Field.$document.mouseup(function () {
						
						PathSelector.clear();
						APSelector.clear();
						SegSelector.clear();
						Path.extendiblePath = null;
						
						Field.$document.off("mouseup");
					});
				}
			});
			
			$("g.ui-suit").on("mousedown.direct_select_tool", function (evt) {
				
				var path = $(this).data("path");
				
				// 選択中以外のパスをクリックした場合、拡張可能なパスを空にする
				if (path !== Path.extendiblePath) {
					
					Path.extendiblePath = null;
				}
			});
			
			// セグメントの選択・ドラッグ
			Field.$uiLayer.on("mousedown.direct_select_tool", "g.ui-suit path.seg", function (evt) {
				
				var segUI = $(this).data("wrapper");
				
				SegSelector.judgeSelect(segUI, evt.shiftKey);
			});
			
			// アンカーポイントの選択・ドラッグ
			$("rect.anchorpoint").on("mousedown.direct_select_tool", function (evt) {
				
				var anchor = $(this).data("wrapper"),
					start = Field.getOffsetFromSVG(evt.pageX, evt.pageY); // ドラッグ開始前の座標
				
				// アンカーポイントの選択・選択解除
				if (APSelector.judgeSelect(anchor, evt.shiftKey)) {
					
					// 選択解除した場合はドラッグの準備をしない
					return;
				}
				
				anchor.prepareDrag(start.x, start.y);
			});
			
			// コントロールポイントのドラッグ
			$("circle.controlpoint").on("mousedown.direct_select_tool", function (evt) {
				
				var controlpoint = $(this).data("wrapper"),
					start = Field.getOffsetFromSVG(evt.pageX, evt.pageY);
				
				controlpoint.opposite.show();
				controlpoint.prepareDrag(start.x, start.y);
			});
			
			// パスの塗りをマウスダウン
			$("g#targetLayer path").on("mousedown.direct_select_tool", function (evt) {
				
				var path = $(this).data("path"),
					apList = path.getAPList(),
					start = Field.getOffsetFromSVG(evt.pageX, evt.pageY);
				
				if (!evt.shiftKey) {
					
					if (!APSelector.isSelected(apList)) {
						
						APSelector.clear();
					}
					
				} else if (APSelector.isSelected(apList)) {
					
					PathSelector.removeFromSelection(path, true);
					return;
				}
				
				PathSelector.addToSelection(path, true);
				
				APSelector.selection[0].prepareDrag(start.x, start.y);
			});
			
			Field.$svg._addClass("direct-select-tool");
		},
				
		dispose: function () {
			
			Field.$svg.off("mousedown.direct_select_tool")._removeClass("direct-select-tool");
			$("g.ui-suit").off("mousedown.direct_select_tool");
			Field.$uiLayer.off("mousedown.direct_select_tool");
			$("g#targetLayer path").off("mousedown.direct_select_tool");
			$("rect.anchorpoint").off("mousedown.direct_select_tool");
			$("circle.controlpoint").off("mousedown.direct_select_tool");
		}
	};
}());