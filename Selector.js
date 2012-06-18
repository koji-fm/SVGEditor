
/**
 * @class
 */
$.SE.Selector = function () {
	
	/** @property 選択された要素のラッパーを格納する配列 */
	this.selection = [];
};

$.SE.Selector.prototype = {
	
	// selectionにオブジェクトをプッシュ
	addToSelection: function (obj) {
		
		if (!this.isSelected(obj)) {
		
			this.selection.push(obj);
		}
	},
	
	// selectionから指定されたオブジェクトを取り除く
	removeFromSelection: function (obj) {
		
		var index = $.inArray(obj, this.selection);
		
		this.selection.splice(index, 1);
	},
	
	// selectionを空にする
	clear: function () {
		
		this.selection = [];
	},
	
	// 渡されたオブジェクトが選択中かどうかを返す
	// 配列を渡すと、要素がすべて選択中かどうかを返す
	isSelected: function (obj) {
		
		if (!obj[0]) {
		
			return (-1 === $.inArray(obj, this.selection)) ? false : true;
		}
		
		var selector = this;
		
		try {
			
			$.each(obj, function () {
				
				if (!selector.isSelected(this)) {
					
					throw null;
				}
			});
			
		} catch (o) {
			
			return false;
		}
		
		return true;
	},
	
	// 渡されたオブジェクトのみを選択状態にする
	select: function (obj) {
		
		this.clear();
		this.addToSelection(obj);
	},
	
	/**
	 * 状況に応じてオブジェクトの選択・選択解除を行う。
	 * 
	 * @method judgeSelect
	 * @param {Object} elm 選択・選択解除対象のアンカーポイント
	 * @param {boolean} shiftKey シフトキーが押されているかのフラグ
	 */
	judgeSelect: function (obj, shiftKey) {
		
		// shiftを押しながらマウスダウンした場合
		if (shiftKey) {
			
			// 選択中のものは選択から外す
			if (this.isSelected(obj)) {
				
				this.removeFromSelection(obj);
				// そのままドラッグできないようにフラグを返す
				return true;
			
			// 選択していないものは選択に加える
			} else {
				
				this.addToSelection(obj);
			}
		
		// shiftを押していない場合で、選択されていないオブジェクトの場合
		// そのオブジェクトだけを選択状態にする
		} else if (!this.isSelected(obj)) {
			
			this.select(obj);
		}
	},
	
	// 選択中の全てのオブジェクトにコールバックを適用する
	each: function (callback) {
		
		$.each(this.selection, function () {
			
			callback.call(this);
		});
	}
};