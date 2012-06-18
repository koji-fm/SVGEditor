/**
 * @constructor
 */
$.SE.ControlPoint = function (seg, assignment) {
	
	this.seg = seg;
	this.assignment = assignment;
	this.state = $.SE.ControlPoint.symmetrical;
	this.opposite = null;
	this.baseAnchor = null;
	this.path = seg.path;
	this.cachedPos = null;
	this.isActive = false;
	this.elm = $.SE.SVGUtil.create("circle", {
		r: this.SIZE,
		class: "controlpoint"
	});
	this.bar = $.SE.SVGUtil.create("line", {class: "cp-bar"});
	
	this.hide();
	$(this.elm).data("wrapper", this);
};

$.SE.ControlPoint.prototype = $.extend(new $.SE.Draggable, {
	
	SIZE: 2.7,
	
	setPos: function (x, y) {
		
		x = ~~x, y = ~~y;
		
		this.seg.setPoint(this.assignment, x, y);
		this.setElementPos();
	},
	
	setElementPos: function () {
		
		var pos = this.getPos();
		
		$(this.elm).attr({
			cx: pos.x,
			cy: pos.y
		});
		
		$(this.bar).attr({
			x2: pos.x,
			y2: pos.y
		});
	},
	
	setBasePos: function (x, y) {
				
		x = ~~x, y = ~~y;
		
		$(this.bar).attr({
			x1: x,
			y1: y
		});
	},
	
	getPos: function () {
		
		return this.seg.getPoint(this.assignment);
	},
	
	appendElements: function () {
		
		this.path.cpContainer.appendChild(this.bar);
		this.path.cpContainer.appendChild(this.elm);
	},
	
	insertElements: function (index) {
		
		this.path.cpContainer.insertBefore(this.elm, $(this.path.cpContainer).children("path").eq(index)[0]);
		this.path.cpContainer.insertBefore(this.bar, this.elm);
	},
	
	removeElements: function () {
		
		this.path.cpContainer.removeChild(this.bar);
		this.path.cpContainer.removeChild(this.elm);
	},
	
	show: function () {
		
		if (this.isActive) {
			
			this.elm.style.display = "block";
			this.bar.style.display = "block";
		}
	},
	
	hide: function () {
		
		this.elm.style.display = "none";
		this.bar.style.display = "none";
	},
	
	pairOff: function (another) {
		
		this.opposite = another;
		another.opposite = this;
	},
	
	activate: function () {
		
		this.isActive = true;
		this.show();
	},
	
	sleep: function () {
		
			var anchorPos = this.baseAnchor.getPos();
			
			this.setPos(anchorPos.x, anchorPos.y);
			this.isActive = false;
	},
	
	prepareDrag: function (startX, startY) {
		
		$.SE.Draggable.prototype.prepareDrag.apply(this);
		this.state.prepareDrag(this);
		
		var cp = this;
		
		$.SE.Field.$svg.mousemove(function (evt) {
			
			var pos = $.SE.Field.getOffsetFromSVG(evt.pageX, evt.pageY),
				delta = {x: pos.x - startX, y: pos.y - startY};
			
			cp.drag(delta.x, delta.y, evt);
		});
		
		$(document).mouseup(function (evt) {
			
			cp.endDrag(evt);
			
			$.SE.Field.$svg.off("mousemove");
			$(document).off("mouseup");
		});
	},
	
	drag: function (deltaX, deltaY, evt) {
		
		$.SE.Draggable.prototype.drag.apply(this, [deltaX, deltaY]);
		this.state.drag(deltaX, deltaY, this, evt);
	},
	
	endDrag: function (upEvt) {
		
		// コントロールポイントの根元のアンカーポイントが選択されていない場合
		// 反対側のコントロールポイントを再び隠す
		if (!$.SE.APSelector.isSelected(this.baseAnchor)) {
			
			this.opposite.hide();
		}
		
		// 根元のアンカーポイントの上でマウスアップすると非アクティブ化
		if (upEvt.target === this.baseAnchor.elm) {
			
			this.sleep();
		}
		
		this.seg.syncTargetSeg();
		this.opposite.seg.syncTargetSeg();
	},
	
	setState: function (stateName) {
		
		this.state = $.SE.ControlPoint[stateName];
	}
});

$.SE.ControlPoint.symmetrical = {
	
	prepareDrag: function (cp) {
		
		$.SE.Draggable.prototype.prepareDrag.apply(cp.opposite);
	},
		
	drag: function (deltaX, deltaY, cp) {
		
		$.SE.Draggable.prototype.drag.apply(cp.opposite, [-deltaX, -deltaY]);
	}
};

$.SE.ControlPoint.linked = {
	
	// ドラッグされていない側のコントロールポイントの、
	// アンカーポイントからの直線距離を保存するプロパティ
	oppositeDistFromAP: 0,
		
	prepareDrag: function (cp) {
		
		// 反対側のコントロールポイントのアンカーポイントを基準とした座標を取得
		var cod = this.getCoordinateFromAP(cp.opposite);
		
		// 反対側のコントロールポイントのアンカーポイントからの直線距離（斜辺）を保存
		this.oppositeDistFromAP = Math.sqrt(cod.x * cod.x + cod.y * cod.y);
		
		$.SE.Draggable.prototype.prepareDrag.apply(cp.opposite);
	},
	
	drag: function (deltaX, deltaY, cp, evt) {
		
		var cod = this.getCoordinateFromAP(cp),
			rad = Math.atan(cod.y / cod.x),
			oppositeRad = cod.x < 0 ? rad : Math.PI + rad;
			anchorPos = cp.baseAnchor.getPos();
			oppositeCod = {
				x: Math.cos(oppositeRad) * this.oppositeDistFromAP + anchorPos.x,
				y: Math.sin(oppositeRad) * this.oppositeDistFromAP + anchorPos.y
			};
			
		if (evt.target !== cp.baseAnchor.elm) {
			
			cp.opposite.setPos(oppositeCod.x, oppositeCod.y);
			
		// 根元のアンカーポイントに乗った場合は反対側のコントロールポイントを元の位置に戻す
		} else {
			
			var startPos = cp.opposite.getCachedPos();
			cp.opposite.setPos(startPos.x, startPos.y);
		}
	},
	
	getCoordinateFromAP: function (cp) {
		
		var pos = cp.getPos(),
			anchorPos = cp.baseAnchor.getPos();
			
		return {x: pos.x - anchorPos.x, y: pos.y - anchorPos.y};
	},
};

$.SE.ControlPoint.individual = {
	
	prepareDrag: function () {},
	drag: function () {}
};
