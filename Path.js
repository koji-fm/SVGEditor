/**
 * @class 
 * @constructor
 */
$.SE.Path = function() {

	this.uiSuit = $.SE.SVGUtil.create("g", {class: "ui-suit"});
	this.target = $.SE.SVGUtil.create("path");
	this.cpContainer = $.SE.SVGUtil.create("g", {class: "cp-list"});
	this.numOfSeg = 0;
	this.lastAnchor = null;
	
	this.segList = new $.SE.UIList(this, "seg-list");
	$(this.uiSuit).append(this.cpContainer);
	this.apList = new $.SE.UIList(this, "ap-list");
	$.SE.Property.set(this.target);
	
	$(this.uiSuit).data("path", this);
	$(this.target).data("path", this);
};

$.SE.Path.extendiblePath = null;

$.SE.Path.prototype = {
		
	addPath: function () {
		
		$.SE.Field.$targetLayer.append(this.target);
		$.SE.Field.$uiLayer.append(this.uiSuit);
	},	
	
	appendAnchor: function (anchor) {
		
		this.apList.append(anchor);
		this.segList.append(anchor.seg1);
		anchor.seg1.cp2.appendElements();
		anchor.seg2.cp1.appendElements();
		this.numOfSeg++;
		$.SE.APSelector.select(anchor);
		
		if (this.numOfSeg === 1) {
			
			$(anchor.elm)._addClass("firstAnchor");
		}
		
		$(this.uiSuit).find("rect.lastAnchor")._removeClass("lastAnchor");
		$(anchor.elm)._addClass("lastAnchor");
		this.lastAnchor = anchor;
	},
	
	insertAnchor: function (anchor, index) {
		
		this.apList.insert(anchor, index);
		this.segList.insert(anchor.seg1, index);
		anchor.seg1.cp2.insertElements(index);
		anchor.seg2.cp1.insertElements(index);
		this.numOfSeg++;
		$.SE.APSelector.select(anchor);
	},
	
	deleteAnchor: function (anchor) {
		
		this.apList.erase(anchor);
		this.segList.erase(anchor.seg1);
		anchor.seg1.cp1.removeElements();
		anchor.seg1.cp2.removeElements();
		this.numOfSeg--;
	},
	
	close: function (startX, startY) {
		
		var firstPos = this.apList[0].getPos(),
			path = this,
			anchor, jointAnchor;
		
		anchor = new $.SE.AnchorPoint(this.lastAnchor.seg2);
		anchor.initPos(firstPos.x, firstPos.y);
		
		jointAnchor = new $.SE.JointAnchor(anchor, this.apList[0]);
		this.appendAnchor(jointAnchor);
		$(jointAnchor.elm)._removeClass("lastAnchor");
		this.lastAnchor = null;
		
		$.SE.Field.$svg.one("mousemove", function () {
			
			jointAnchor.activateCP(false);
			jointAnchor.seg2.cp1.cachedPos = {x: firstPos.x, y: firstPos.y};
		});
		
		jointAnchor.seg2.cp1.setState("symmetrical");
		jointAnchor.seg2.cp1.prepareDrag(startX, startY);
		
		$(document).mouseup(function (evt) {
	
			path.target.pathSegList.appendItem(
					path.target.createSVGPathSegClosePath());
		});

		$.SE.Path.extendiblePath = null;
	},
	
	getAPList: function () {
		
		return this.apList;
	},
	
	reverse: function () {
		
	},
	
	connect: function (otherpath, reverse) {
		
	}
};

$.SE.UIList = function (path, className) {
	
	this.container = $.SE.SVGUtil.create("g", {class: className});
	path.uiSuit.appendChild(this.container);
};

$.SE.UIList.prototype = $.extend([], {
	
	append: function (ui) {
		
		// すでに同じオブジェクトがある場合は追加しない
		if ($.inArray(ui, this) !== -1) {
			
			return;
		}
		
		this.push(ui);
		this.container.appendChild(ui.elm);
	},
	
	insert: function (ui, index) {
		
		if ($.inArray(ui, this) !== -1) {
			
			return;
		}
		
		this.splice(index, 0, ui);
		this.container.insertBefore(ui.elm, $(this.container).children().eq(index)[0]);		
	},
	
	erase: function (ui) {
		
		var index = $.inArray(ui, this);
		
		if (index === -1) {
			
			return;
		}
		
		this.splice(index, 1);
		$(ui.elm).remove();
	}
});
