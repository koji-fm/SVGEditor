/**
 * @class
 */
$.SE.AnchorPoint = function (seg) {
		
	this.elm = $.SE.SVGUtil.create("rect", {
  		width: this.SIZE,
  		height: this.SIZE,
  		class: "anchorpoint"
  	});
	this.seg1 = seg;
	this.path = this.seg1.path;
	this.seg2 = new $.SE.Segment(SVGPathSeg.PATHSEG_CURVETO_CUBIC_ABS,
			this.seg1.end, this.path);
	this.cachedPos = null;
  	
	// セグメント間での各UI部品の対応付け
	this.initUI();
	
	this.setElementPos();
	$(this.elm).data("wrapper", this);
};

$.SE.AnchorPoint.initHover = function () {
	
	// hoverでアンカーポイントサイズ拡大（各ツール共通機能）
	$.SE.Field.$uiLayer.on({
		mouseover: function () {
			var anchor = $(this).data("wrapper");
			anchor.resize(true);
		},
		mouseout: function () {
			var anchor = $(this).data("wrapper");
			anchor.resize(false);
		}
	}, "g.ui-suit rect.anchorpoint");
};

$.SE.AnchorPoint.prototype = $.extend(new $.SE.Draggable, {
	
	SIZE: 4,
	HOVER_SIZE: 7,
	
	prepareDrag: function (startX, startY) {
		
		// 選択された全てのアンカーポイントに現在値を記憶させる
		$.SE.APSelector.each(function () {
			
			$.SE.Draggable.prototype.prepareDrag.apply(this);
			$.SE.Draggable.prototype.prepareDrag.apply(this.seg1.cp2);
			$.SE.Draggable.prototype.prepareDrag.apply(this.seg2.cp1);
		});
		
		// ドラッグで、選択された全てのアンカーポイントを移動
		$.SE.Field.$svg.mousemove(function (evt) {
			
			// ドラッグ開始前からの移動距離
			var pos = $.SE.Field.getOffsetFromSVG(evt.pageX, evt.pageY),
				delta = {x: pos.x - startX, y: pos.y - startY};
					
			$.SE.APSelector.each(function () {
				
				this.drag(delta.x, delta.y);
			});
		});
		
		// マウスアップで編集対象のセグメントを同期
		$(document).mouseup(function (evt) {
			
			$.SE.APSelector.each(function () {
				
				this.endDrag();
			});
			
			$.SE.Field.$svg.off("mousemove");
			$(document).off("mouseup");
		});
	},
	
	drag: function (deltaX, deltaY) {
		
		$.SE.Draggable.prototype.drag.apply(this, [deltaX, deltaY]);
		
		var pos = this.getPos();
		this.seg1.cp2.setBasePos(pos.x, pos.y);
		this.seg2.cp1.setBasePos(pos.x, pos.y);
		
		$.SE.Draggable.prototype.drag.apply(this.seg1.cp2, [deltaX, deltaY]);
		$.SE.Draggable.prototype.drag.apply(this.seg2.cp1, [deltaX, deltaY]);
	},
	
	endDrag: function () {
		
		// 編集対象のセグメントを同期する
		this.seg1.syncTargetSeg();
		this.seg2.syncTargetSeg();
	},
	
	initPos: function (x, y) {
		
		this.setPos(x, y);
		this.seg1.cp2.setPos(x, y);
		this.seg1.cp2.setBasePos(x, y);
		this.seg2.cp1.setPos(x, y);
		this.seg2.cp1.setBasePos(x, y);
	},
	
	setPos: function (x, y) {
		
		x = ~~x, y = ~~y;
		
		this.seg1.setEnd(x, y);
		this.seg2.setStart(x, y);
		
		this.setElementPos();
	},
	
	setElementPos: function () {
		
		var half_size = $(this.elm).attr("width") / 2,
			pos = this.getPos();
		
		$(this.elm).attr({
			x: pos.x - half_size,
			y: pos.y - half_size
		});
	},
	
	initUI: function () {
		
		var pos = this.getPos();
		
		this.seg1.ap2 = this.seg2.ap1 = this;
		this.seg1.cp2.baseAnchor = this.seg2.cp1.baseAnchor = this;
		this.seg1.cp2.pairOff(this.seg2.cp1);
		this.seg1.cp2.setBasePos(pos.x, pos.y);
		this.seg2.cp1.setBasePos(pos.x, pos.y);
	},
	
	getPos: function () {
		
		return this.seg1.getEnd();
	},
	
	resize: function (isover) {
		
		var size = isover ? this.HOVER_SIZE : this.SIZE;
		
		$(this.elm).attr({
			width: size,
			height: size
		});
		
		this.setElementPos();
	},
	
	showAdjacentCP: function () {
		
		this.seg1.cp1.show();
		this.seg1.cp2.show();
		this.seg2.cp1.show();
		this.seg2.cp2.show();		
	},
	
	hideAdjacentCP: function () {
		
		this.seg1.cp1.hide();
		this.seg1.cp2.hide();
		this.seg2.cp1.hide();
		this.seg2.cp2.hide();
	},
	
	activateCP: function (isSingle) {
		
		this.seg2.cp1.activate();
		
		// altKeyが押されていれば１つだけ引き出す
		if (isSingle) {
			
			this.seg2.cp1.setState("individual");
			
		// 押されていなければ一対のコントロールポイントを
		// アンカーポイントに点対称になるように引き出す
		} else {
			
			this.seg1.cp2.activate();
			this.seg2.cp1.setState("symmetrical");
		}
		
		// anchorpointへの参照を確保
		var ap = this;
		
		$(document).mouseup(function (evt) {
			
			ap.seg1.cp2.setState("linked");
			ap.seg2.cp1.setState("linked");
		});
	},
	
	destruct: function () {
		
		var prevAnchor = this.seg1.ap1,
			prevAnchorPos = prevAnchor.getPos(),
			cp1Pos = this.seg1.cp1.getPos();
		
		this.seg1.deleteTargetSeg();
		this.path.deleteAnchor(this);
		
		prevAnchor.seg2 = this.seg2;
		prevAnchor.initUI();
		
		prevAnchor.seg2.setStart(prevAnchorPos.x, prevAnchorPos.y);
		prevAnchor.seg2.cp1.setPos(cp1Pos.x, cp1Pos.y);
		this.seg1.cp1.isActive ? prevAnchor.seg2.cp1.activate()
							   : prevAnchor.seg2.cp1.sleep();
		prevAnchor.seg2.syncTargetSeg();
	}
});

$.SE.JointAnchor = function (lastAnchor, firstAnchor) {
	
	this.elm = $.SE.SVGUtil.create("rect", {
  		width: this.SIZE,
  		height: this.SIZE,
  		class: "anchorpoint"
  	});
	this.seg1 = lastAnchor.seg1;
	this.moveSeg = firstAnchor.moveSeg || firstAnchor.seg1;
	this.seg2 = firstAnchor.seg2;
	this.path = this.seg1.path;
	this.cachedPos = null;
  	
	// セグメント間での各UI部品の対応付け
	this.initUI();
	
	this.path.apList.erase(firstAnchor);
	
	this.setElementPos();
	$(this.elm).data("wrapper", this);
};

// AnchorPoint.prototypeをコピーしたものを拡張する
$.SE.JointAnchor.prototype = $.extend($.extend(true, {}, $.SE.AnchorPoint.prototype), {
	
	setPos: function (x, y) {
		
		$.SE.AnchorPoint.prototype.setPos.call(this, x, y);
		this.moveSeg.setEnd(x, y);
	},
	
	endDrag: function () {
		
		$.SE.AnchorPoint.prototype.endDrag.apply(this);
		this.moveSeg.syncTargetSeg();
	},
	
	destruct: function () {
		
		var newJA,
			prevAnchor = this.seg1.ap1,
			prevAnchorPos = prevAnchor.getPos();
		
		$.SE.AnchorPoint.prototype.destruct.apply(this);
		
		this.path.apList.erase(prevAnchor);
		
		newJA = new $.SE.JointAnchor(prevAnchor, this);
		this.path.appendAnchor(newJA);
		this.path.lastAnchor = null;
		$(newJA.elm)._removeClass("lastAnchor");
		
		newJA.moveSeg.setEnd(prevAnchorPos.x, prevAnchorPos.y);
		newJA.moveSeg.syncTargetSeg();
	}
});
