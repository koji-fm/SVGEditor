
$.SE.Tool.ConvertPointTool = (function () {
	
	var Field  = $.SE.Field;
	
	return {
		
		init: function () {
			
			$("g.ui-suit.selected rect.anchorpoint").on("mousedown.convert_point_tool", function (evt) {
				
				var anchor = $(this).data("wrapper"),
					pos = Field.getOffsetFromSVG(evt.pageX, evt.pageY);
				
				anchor.seg1.cp2.sleep();
				anchor.seg2.cp1.sleep();
				
				Field.$svg.one("mousemove", function (evt) {
					
					anchor.activateCP();
				});
				
				anchor.seg2.cp1.setState("symmetrical");
				anchor.seg2.cp1.prepareDrag(pos.x, pos.y);
			});
			
			$("circle.controlpoint").on("mousedown.convert_point_tool", function (evt) {
				
				var controlpoint = $(this).data("wrapper"),
					pos = Field.getOffsetFromSVG(evt.pageX, evt.pageY);
				
				controlpoint.setState("individual");
				controlpoint.opposite.setState("individual");
				controlpoint.prepareDrag(pos.x, pos.y);
			});
			
			Field.$svg._addClass("convert-point-tool");
		},
		
		dispose: function () {
			
			$("g.ui-suit.selected rect.anchorpoint").off("mousedown.convert_point_tool");
			$("circle.controlpoint").off("mousedown.convert_point_tool");
			Field.$svg._removeClass("convert-point-tool");
		}
	};
}());