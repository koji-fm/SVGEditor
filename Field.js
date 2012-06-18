
$.SE.Field = {

	$svg: null,
    $svgContainer: null,
    $targetLayer: null,
    $uiLayer: null,
    
    getOffsetFromSVG: function () {},
    
    init: function () {
    	
    	this.$document = $(document);
    	this.$svg = $("#svg");
    	this.$targetLayer = $("g#targetLayer");
    	this.$uiLayer = $("g#uiLayer");
    	this.$svgContainer = $("#svgContainer");
    	
    	var offset = this.$svgContainer.offset();
    	
    	this.getOffsetFromSVG = function (pageX, pageY) {
    		
    		return {x: pageX - offset.top, y: pageY - offset.left};
    	};
    	
		// svg要素上のマウスダウンではデフォルトの動作をキャンセル
		this.$svg.mousedown(function (evt) {
			
			evt.preventDefault();
		});
    }
};