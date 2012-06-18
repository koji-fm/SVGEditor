
$.SE.Tool = (function () {
	
	var Field = $.SE.Field,
		Tool = {
		
			DEFAULT_TOOL: "penTool",
			
			currentTool: {dispose: function () {}},
			
			currentSelectTool: "DirectSelectTool",
			
			subTool: "",
			
			
			init: function () {
				
				//ツール変更時の処理を登録
				$(".toolBtn").click(this.change);
				
				// ツールボタンとツールの関連付け
				$("#directSelectToolBtn").data("tool", this.DirectSelectTool);
				$("#penToolBtn").data("tool", this.PenTool);
				$("#convertPointToolBtn").data("tool", this.ConvertPointTool);
				
				
				// ctrl(cmd)キーで選択ツールに切り替え
				var ctrlKey = $.browser.safari ? 91 : 224;
				Field.$document.keydown(function (evt) {
					
					if (evt.which === ctrlKey &&
						Tool[Tool.currentSelectTool] !== Tool.currentTool) {
						
						Tool.currentTool.dispose();
						Tool[Tool.currentSelectTool].init();
					}
				});
				
				Field.$document.keyup(function (evt) {
					
					if (evt.which === ctrlKey) {
						
						Tool[Tool.currentSelectTool].dispose();
						Tool.currentTool.init();
					}
				});	
				
				Field.$document.keydown(function (evt) {
					
					if (evt.which === 18 && Tool.currentTool.subTool) {
						
						Tool.currentTool.dispose();
						Tool[Tool.currentTool.subTool].init();
					}
				});
				
				Field.$document.keyup(function (evt) {
					
					if (evt.which === 18 && Tool.currentTool.subTool) {
						
						Tool[Tool.currentTool.subTool].dispose();
						Tool.currentTool.init();
					}
				});
				
				// デフォルトのツールを初期化
				$("#" + this.DEFAULT_TOOL + "Btn").click();
			},
			
			change: function (evt) {
				
				// 選択したツールのボタンを選択中表示に切り替える
				$(".toolBtn.selected").removeClass("selected");
				$(this).addClass("selected");
				
				// 前のツールのイベントハンドラを除去
				Tool.currentTool.dispose();
				
				// 新しいツールに切り替えて初期化
				Tool.currentTool = $(this).data("tool");
				Tool.currentTool.init();
			}
		};
	
	return Tool;
}());