
$.SE.SegmentManager = {
	
	optimizedClone: function (segUI) {
		
		var newSeg, parseResult;
		
		// タイプがMOVETOの場合はクローンを返す
		if (segUI.end.pathSegType === SVGPathSeg.PATHSEG_MOVETO_ABS) {
			
			newSeg = segUI.path.target.createSVGPathSegMovetoAbs(segUI.end.x, segUI.end.y);
			
		} else {
			
			// 最適化されたセグメントの情報を受け取る
			parseResult = this.parseSeg(segUI);
			
			// 受け取った情報を元に新しいセグメントを生成
			newSeg = this.create(parseResult, segUI.path);
		}
		
		return newSeg;
	},
	
	tryOptimization: function (segUI) {
		
		var parseResult = this.parseSeg(segUI);
		
		// 既存のセグメントと同じタイプの場合は座標のみ同期する
		if ((parseResult.type === segUI.targetSeg.pathSegType) ||
			(segUI.targetSeg.pathSegType === SVGPathSeg.PATHSEG_MOVETO_ABS)) {
			
			this.syncVal(segUI.targetSeg, segUI.end);
			
		// タイプの変換がある場合は最適化されたセグメントと入れ替える
		} else {
			
			var newSeg = this.create(parseResult, segUI.path);
			
			segUI.replaceTargetSeg(newSeg);
		}
	},
	
	parseSeg: function (segUI) {
		
		var type,
			numberOfCP = 2,
			spec = this.syncVal({}, segUI.end);
		
		// セグメントの開始点と制御点1の座標が同じ場合、単純化する
		if ((segUI.start.x === segUI.end.x1) && (segUI.start.y === segUI.end.y1)) {
			
			numberOfCP--;
			/* Quadratic変換用のコード、下記　コメントA参照
			 * spec.x1 = spec.x2;
			 * spec.y1 = spec.y2;
			 */
		}
		
		// セグメントの終点と制御点２の座標が同じ場合、単純化する
		if ((segUI.end.x === segUI.end.x2) && (segUI.end.y === segUI.end.y2)) {
			
			numberOfCP--;
		}
		
		switch (numberOfCP) {
		
		case 2:
			
			type = SVGPathSeg.PATHSEG_CURVETO_CUBIC_ABS;
			break;
			
		case 1:
			
			/* A: Quadraticに変換すると15pxほどカーブの外側にずれたので断念
			 * type = SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_ABS;
			 */
			type = SVGPathSeg.PATHSEG_CURVETO_CUBIC_ABS;
			break;
			
		case 0:
			
			type = SVGPathSeg.PATHSEG_LINETO_ABS;
			break;
		}
		
		return {type: type, spec: spec};
	},
	
	create: function (parseResult, path) {
		
		var seg,
			spec = parseResult.spec;
		
		switch (parseResult.type) {
		
		case SVGPathSeg.PATHSEG_LINETO_ABS:
			
			seg = path.target.createSVGPathSegLinetoAbs(spec.x, spec.y);
			break;
			
		case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_ABS:
			
			seg = path.target.createSVGPathSegCurvetoQuadraticAbs(spec.x, spec.y, spec.x1, spec.y1);
			break;
			
		case SVGPathSeg.PATHSEG_CURVETO_CUBIC_ABS:
			
			seg = path.target.createSVGPathSegCurvetoCubicAbs(spec.x, spec.y, spec.x1, spec.y1, spec.x2, spec.y2);
			break;
		}
		
		return seg;
	},
	
	adjustCP: function (seg, anchorPos, prevAnchorPos) {
		
		var t = 0,
			pos,
			TOLERANCE = 1,
			DELTA = 0.001,
			p1 = prevAnchorPos,
			p2 = seg.cp1.getPos(),
			_p2, p3, p4, p5, _p6,
			p6 = seg.cp2.getPos(),
			p7 = seg.ap2.getPos();
		
		while (t < 1) {
			
			p4 = {x: t * p6.x + (1 - t) * p2.x, y: t * p6.y + (1 - t) * p2.y};
			
			_p2 = {x: t * p2.x + (1 - t) * p1.x, y: t * p2.y + (1 - t) * p1.y};
			_p6 = {x: t * p7.x + (1 - t) * p6.x, y: t * p7.y + (1 - t) * p6.y};
			p3 = {x: t * p4.x + (1 - t) * _p2.x, y: t * p4.y + (1 - t) * _p2.y};
			p5 = {x: t * _p6.x + (1 - t) * p4.x, y: t * _p6.y + (1 - t) * p4.y};
			
			pos = {x: t * p5.x + (1 - t) * p3.x, y: t * p5.y + (1 - t) * p3.y};
			
			if (pos.x > (anchorPos.x - TOLERANCE) &&
				pos.x < (anchorPos.x + TOLERANCE) &&
				pos.y > (anchorPos.y - TOLERANCE) &&
				pos.y < (anchorPos.y + TOLERANCE))
			{	
				break;
			}
			
			t += DELTA;
		}
		
		return [_p2, p3, p5, _p6];
	},
	
	syncVal: function (o, source) {
		
		o.x = source.x;
		o.y = source.y;
		o.x1 = source.x1;
		o.y1 = source.y1;
		o.x2 = source.x2;
		o.y2 = source.y2;
		
		return o;
	}
};
