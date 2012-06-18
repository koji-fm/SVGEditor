
$.SE.Tool.PenTool = (function () {
	
	var Field = $.SE.Field,
		Path = $.SE.Path,
		AnchorPoint = $.SE.AnchorPoint,
		PathSelector = $.SE.PathSelector,
		APSelector = $.SE.APSelector,
		Segment = $.SE.Segment,
		SegmentManager = $.SE.SegmentManager,
		Tool = $.SE.Tool;
	
	return {
		
		subTool: "ConvertPointTool",
		
		init: function () {
			
			// マウスダウンでアンカーポイントを打つ
			Field.$svg.on("mousedown.pen_tool", this.appendAnchor);
			
			// マウスダウンでセグメント上に新しいアンカーポイントを挿入
			Field.$uiLayer.on("mousedown.pen_tool", "g.ui-suit.selected path.seg", this.insertAnchor);
			
			// 選択中のパスのアンカーポイントをマウスダウンで削除
			Field.$uiLayer.on("mousedown.pen_tool", "g.ui-suit.selected .anchorpoint", this.deleteAnchor);
			
			Field.$uiLayer.on("mousedown.pen_tool", ".anchorpoint.firstAnchor", this.dealFirst);
			
			Field.$uiLayer.on("mousedown.pen_tool", ".anchorpoint.lastAnchor", this.dealLast);
			
			Field.$svg._addClass("pen-tool");
		},
		
		dispose: function () {
			
			Field.$svg.off("mousedown.pen_tool")._removeClass("pen-tool");
			Field.$uiLayer.off("mousedown.pen_tool");
		},
		
		// アンカーポイントの追加
		appendAnchor: function (evt) {
			
			var anchor, seg,
			    down_pos = Field.getOffsetFromSVG(evt.pageX, evt.pageY),
			    path = Path.extendiblePath;
			
			// 拡張可能なパスが無い場合、新規パスと新規セグメント（Moveto）を作成
			if (!path) {
				
				path = Path.extendiblePath = new Path;
				path.addPath();
				seg = new Segment(SVGPathSeg.PATHSEG_MOVETO_ABS, down_pos, path);
				
			// 拡張可能なパスがある場合、直前のアンカーが持っている２つめのセグメントを取得
			} else {
				
				seg = path.lastAnchor.seg2;
			}
			
			// セグメントを渡してアンカーポイントを生成し、アンカー、コントロールポイントにx,y座標をセットする
			anchor = new AnchorPoint(seg);
			anchor.initPos(down_pos.x, down_pos.y);
			
			// アンカーポイントをパスに追加する
			path.appendAnchor(anchor);
						
			// ドラッグするとコントロールポイントを有効にする
			Field.$svg.one("mousemove", function (evt) {
				
				anchor.activateCP(evt.altKey);
			});
			
			anchor.seg2.cp1.prepareDrag(down_pos.x, down_pos.y);
		},
		
		insertAnchor: function (evt) {
			
			var pos = Field.getOffsetFromSVG(evt.pageX, evt.pageY),
				originalSeg = $(this).data("wrapper"),
				path = originalSeg.path,
				newSeg = new Segment(SVGPathSeg.PATHSEG_CURVETO_CUBIC_ABS, pos, path),
				prevAnchor = originalSeg.ap1,
				newAnchor = new AnchorPoint(newSeg),
				index = originalSeg.getIndex(),
				prevAnchorPos = prevAnchor.getPos(),
				lengthInSeg = originalSeg.getLengthAt(pos.x, pos.y);
			
			// 新しいアンカーポイントの位置をセグメントの中央（芯）に修正
			pos = originalSeg.getPointAtLength(lengthInSeg);
			
			prevAnchor.seg2 = newAnchor.seg1;
			prevAnchor.initUI();
			newAnchor.seg2 = originalSeg;
			newAnchor.initUI();

			if (originalSeg.isCurve()) {
				
				var p = SegmentManager.adjustCP(originalSeg, pos, prevAnchorPos);
				
				newAnchor.initPos(pos.x, pos.y);
				newAnchor.seg1.cp1.setPos(p[0].x, p[0].y);
				newAnchor.seg1.cp2.setPos(p[1].x, p[1].y);
				newAnchor.seg2.cp1.setPos(p[2].x, p[2].y);
				newAnchor.seg2.cp2.setPos(p[3].x, p[3].y);
				
				prevAnchor.seg2.cp1.activate();
				newAnchor.activateCP();
				
				newAnchor.seg1.cp1.setState("linked");
				newAnchor.seg1.cp2.setState("linked");
				newAnchor.seg2.cp1.setState("linked");
				newAnchor.seg2.cp2.setState("linked");
				
			} else {
				
				prevAnchor.initPos(prevAnchorPos.x, prevAnchorPos.y);
				newAnchor.initPos(pos.x, pos.y);
			}
			
			newAnchor.seg1.setStart(prevAnchorPos.x, prevAnchorPos.y);			
			newAnchor.seg2.setStart(pos.x, pos.y);
			
			path.insertAnchor(prevAnchor, index - 1);
			path.insertAnchor(newAnchor, index);
			
			newAnchor.seg1.syncTargetSeg(index);
			newAnchor.seg2.syncTargetSeg();
			
			evt.stopPropagation();
		},
		
		deleteAnchor: function (evt) {
			
			// 最初と最後のアンカーポイントでは何もしない
			if ($(this)._hasClass("firstAnchor") || $(this)._hasClass("lastAnchor")) {
				
				return;
			}
			
			var anchor = $(this).data("wrapper");
			anchor.destruct();
			
			evt.stopPropagation();
		},
		
		dealFirst: function (evt) {
			
			var path = $(this).data("wrapper").path,
				downPos = Field.getOffsetFromSVG(evt.pageX, evt.pageY);
			
			if (path === Path.extendiblePath) {

				// パスを閉じる	
				path.close(downPos.x, downPos.y);
			
			} else {
				
				// パスを拡張中でない場合
				if (!Path.extendiblePath) {
					
					// パスを逆さにする処理 ?

					Path.extendiblePath = path;
					
				} else {
					
					// パス同士を連結する
					Path.extendiblePath.connect(path);
				}
			}
			
			evt.stopPropagation();
		},
		
		dealLast: function (evt) {
			
			var path = $(this).data("wrapper").path;
			
			if (path === Path.extendiblePath) {
				
				if (Path.appendMode === "insertItemBefore") {
					
					path.close();
					
				} else return;
				
			} else {
				
				if (!Path.extendiblePath) {
					
					Path.extendiblePath = path;
					
				} else {
					
					Path.extendiblePath.connect(path, true);
				}
				
				PathSelector.select(path);
			}
			
			evt.stopPropagation();
		}
	};
}());