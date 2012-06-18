
$.SE.Draggable = function () {
	
	this.cachedPos = null;
};

$.SE.Draggable.prototype = {
	
	setPos: function (x, y) {},
	
	getPos: function () {},
	
	prepareDrag: function () {
		
		this.cachePos();
	},
	
	drag: function (deltaX, deltaY) {
		
		var cachedPos = this.getCachedPos();
		
		this.setPos(cachedPos.x + deltaX, cachedPos.y + deltaY);
	},
	
	endDrag: function () {},

	cachePos: function () {
		
		this.cachedPos = this.getPos();
	},
	
	getCachedPos: function () {
		
		return this.cachedPos;
	}
};
