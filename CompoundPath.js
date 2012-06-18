
$.SE.CompoundPath = (function () {
	
		// サブパスのセグメントを複合パスに移動させる関数
	var transferSeg = $.browser.safari ?
			function (subPath, cPath) {
				
				while (subPath.target.pathSegList.numberOfItems) {
					
					cPath.target.pathSegList.appendItem(subPath.target.pathSegList.getItem(0));
				}
			} :
			function (subPath, cPath) {
				
				var cPathSegCount = cPath.target.pathSegList.numberOfItems,
					subPathSegCount;
				
				for (subPathSegCount = 0; subPath.target.pathSegList.numberOfItems; subPathSegCount++) {
					
					cPath.target.pathSegList.appendItem(subPath.target.pathSegList.getItem(0));
					subPath.target.pathSegList.removeItem(0);
					if (subPath.segList[subPathSegCount]) subPath.segList[subPathSegCount].targetSeg = cPath.target.pathSegList.getItem(cPathSegCount);
					cPathSegCount++;
				}
			};
	
	return function (pathSelection) {
	
		this.subPaths = pathSelection.slice();
		this.target = $.SE.SVGUtil.create("path", {"fill-rule": "evenodd"});
		
		var cPath = this;
		$.each(this.subPaths, function () {
			
			transferSeg(this, cPath);
			this.target = cPath.target;
		});
		
		$.SE.Property.set(this.target);
		
		$.SE.PathSelector.clear();
		$.SE.PathSelector.addToSelection(this, true);
		
		$(this.target).data("path", this);
		$.SE.Field.$targetLayer.append(this.target);
	};
}());

$.SE.CompoundPath.prototype = {
		
	getAPList: function () {
		
		var apList = [];
		
		$.each(this.subPaths, function () {
			
			apList = apList.concat(this.apList.slice());
		});
		
		return apList;
	}
};
