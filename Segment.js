
$.SE.Segment = function (type, spec, path) {
	
	var methodName = type === SVGPathSeg.PATHSEG_MOVETO_ABS ?
		"createSVGPathSegMovetoAbs" : "createSVGPathSegCurvetoCubicAbs";
	
	this.elm = $.SE.SVGUtil.create("path", {class: "seg"});
	this.start = this.elm.createSVGPathSegMovetoAbs(spec.x, spec.y);
	this.end = this.elm[methodName](spec.x, spec.y, spec.x, spec.y, spec.x, spec.y);
	this.targetSeg = null;
	this.path = path;
	this.ap1 = null;
	this.ap2 = null;
	this.cp1 = new $.SE.ControlPoint(this, 1);
	this.cp2 = new $.SE.ControlPoint(this, 2);
	
	this.elm.pathSegList.appendItem(this.start);
	this.elm.pathSegList.appendItem(this.end);
	$(this.elm).data("wrapper", this);
};

$.SE.Segment.prototype = {
	
	setStart: function (x, y) {
		
		this.start.x = x;
		this.start.y = y;
	},
	
	setPoint: function (pointNumber, x, y) {
		
		this.end["x" + pointNumber] = x;
		this.end["y" + pointNumber] = y;
	},
	
	setEnd: function (x, y) {
		
		this.end.x = x;
		this.end.y = y;
	},
	
	getPoint: function (pointNumber) {
		
		return {
			x: this.end["x" + pointNumber],
			y: this.end["y" + pointNumber]
		};
	},
	
	getEnd: function () {
		
		return {
			x: this.end.x,
			y: this.end.y
		};
	},
	
	getIndex: function () {
		
		var pathSegList = this.path.target.pathSegList,
			i = pathSegList.numberOfItems;
		
		while (i) {
			
			i -= 1;
			
			if (this.targetSeg === pathSegList.getItem(i)) {
				
				return i;
			}
		}
		
		return -1;
	},
	
	getLengthAt: function (x, y) {
		
		var length = 0,
			totalLength = this.elm.getTotalLength(),
			TOLERANCE = 2,
			DELTA = 0.01,
			point;
		
		do {
			point = this.getPointAtLength(length);
			
			if ((x > (point.x - TOLERANCE)) && (x < (point.x + TOLERANCE)) &&
				(y > (point.y - TOLERANCE)) && (y < (point.y + TOLERANCE))) {
				
				return length;
			}
			
			length += DELTA;
		
		} while (length < totalLength);
	},
	
	getPointAtLength: function (length) {
		
		return this.elm.getPointAtLength(length);
	},
	
	isCurve: function () {
		
		return this.cp1.isActive || this.cp2.isActive;
	},
	
	showCP: function () {
		
		this.cp1.show();
		this.cp2.show();
	},
	
	hideCP: function () {
		
		this.cp1.hide();
		this.cp2.hide();
	},
	
	// 編集対象のセグメントを新しいセグメントに置き替える
	replaceTargetSeg: function (newSeg) {
		
		// 置き換えられる要素のインデックスを取得
		var index = this.getIndex();
		
		// リストに存在しなかった場合は何もしない
		if (index === -1) {
			
			return;
		}
		
		this.path.target.pathSegList.replaceItem(newSeg, index);
		this.targetSeg = newSeg;
	},
	
	syncTargetSeg: function (index) {
		
		// まだ編集対象のセグメントが生成されていない場合は生成する
		if (!this.targetSeg) {
			
			// thisが終端のアンカーのseg2の場合は何もしない
			if (this.ap1 === this.path.lastAnchor) {
				
				return;
			}
			
			this.createTargetSeg();
			
			if (index === undefined) {
				
				index = this.ap1 ? this.ap1.seg1.getIndex() + 1 : 1;
			}
				
			this.path.target.pathSegList.insertItemBefore(this.targetSeg, index);
				
		} else {
			
			$.SE.SegmentManager.tryOptimization(this);
		}
	},
	
	createTargetSeg: function () {
		
		this.targetSeg = $.SE.SegmentManager.optimizedClone(this);
	},
	
	deleteTargetSeg: function () {
		
		var index = this.getIndex();
		
		this.path.target.pathSegList.removeItem(index);
	}
};