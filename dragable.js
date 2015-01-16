(function($){
	var emptyfn = function(){};
	var defaults = {
		/*拖拽释放后事件：
		* backward : 返回原地
		* forward : 停留在目标
		*/
		fillMode:"forward",//or backward
		/**
		* 退拽是否在原地形成虚线
		*/
		dashed:false,
		/*
		* 拖拽时样式
		*/
		style:{},
		//开始拖动
		onStart:emptyfn,
		//正在在拖动
		onDrag:emptyfn,
		//拖动结束
		onStop:emptyfn
	};
	var _fillMode = {
		backward:function(opt,cb){
			this.css(opt.data.startPos,cb);
		},
		forward:function(opt,cb){
			return cb();
		}
	};
	var _onDrag = function(e,opt){
		var 
			mx = e.clientX,//鼠标x轴
			my = e.clientY,//鼠标y轴
			pos = this.offset(),//当前元素位置
			offset=opt.data.mouseOffset//鼠标偏移量
			;
		//移动位置
		this.offset({
			left:mx-offset.left,
			top:my-offset.top
		});
		opt.onDrag.call(this,e,opt);
	};
	var _onDragStart = function(e,opt,relativeTo){
		var t = this;
		var pos = t.position();
		
		//拖拽起始点
		opt.data.startPos = {
			left:pos.left,
			top:pos.top
		};
		//鼠标与被拖拽元素的坐标偏移
		opt.data.mouseOffset = {
			left:e.offsetX,
			top:e.offsetY
		};
		//显示虚线框
		if(opt.data.dashed){
			opt.data.dashed.css(pos).show();
		}

		//保留旧样式
		opt.data.oldStyle = {};
		//设置拖动时样式
		$.each(opt.style,function(key,value){
			opt.data.oldStyle[key] = t.css(key);
		});
		t.css(opt.style);
		
		//拖动开始事件
		opt.onStart.call($(t),e,opt);
	};
	//拖拽结束
	var _onDragStop = function(e,opt){
		var t = this;
		//恢复到拖拽前样式
		t.css(opt.data.oldStyle);
		var mtype = typeof opt.fillMode;
		
		//处理填充模式
		if('string' == mtype){
			var mode = _fillMode[opt.fillMode];
		}else if('function' == mtype){
			var mode = opt.fillMode;
		}
		if(!mode){
			var mode = _fillMode.backward;
		}
		mode.call(t,opt,function(){
			if(opt.data.dashed){
				opt.data.dashed.hide();
			}
		});
		//拖动结束事件
		opt.onStop.call(t,opt);
	};
	//设置元素文本是否可选
	$.fn.selection = function(t){
		var f = function(){return t;};
		return this.each(function(k,v){
			if(typeof v.onselectstart != 'undefined'){
				v.onselectstart=f;
			}else if(v.style && typeof v.style.MozUserSelect != 'undefined'){
				v.style.MozUserSelect = t?'':'none';
			}else{
				v.onmosuedown = f;
			}
		});
	};
	$.fn.dragable = function(opt){
		var len = this.length;
		if(len > 1){
			this.each(function(k,v){
				$(v).dragable(opt);
			});
			return this;
		}else if(len == 0){
			return;
		}
				
		if(false === opt){
			this.unbind("mousedown.dragable");
			var id = this.data("dragable-id");
			$(document)
				.unbind("mousemove.dragable-"+id)
				.unbind("mouseup.dragable-"+id);
			return;
		};
		
		opt = $.extend({},defaults,opt);
		//临时数据
		opt.data = {};
		
		var target = null;
		var $doc = $(document);
		var self = this;
		var started = false;
		var mousedown = false;
		var id = Math.random();
		
		if(opt.dashed){
			var dashed = $("<div>");
			var border = 1;
			dashed.css({
				width:self.height()-border*2,
				height:self.width()-border*2,
				position:"absolute",
				border:border+"px dashed #d3d3d3",
				borderRadius:self.css("border-radius"),
				display:"none",
				"z-index":-2147483648,
			}).appendTo(this.offsetParent());
			if('object' === typeof opt.dashed){
				dashed.css(opt.dashed);
			}
			opt.data.dashed = dashed;
		}
		self.data("dragable-id",id);
		self.bind("mousedown.dragable",function(e){
			target = $(this);
			mousedown = true;
			e.stopPropagation();
			$doc.selection(false);
		});
		$doc.bind("mousemove.dragable-"+id,function(e){
			if(false === mousedown)return
			if(!started){
				_onDragStart.call(self,e,opt);
			}
			started = true;
			_onDrag.call(self,e,opt);
		});
		$doc.bind("mouseup.dragable-"+id,function(e){
			if(false === mousedown)return;
			mousedown = false;
			if(undefined != target && target.is(self)){
				_onDragStop.call(self,e,opt);
				target = null;
				started = false;
			}
			$doc.selection(true);
		});
		return this;
	};
	//暴露默认配置
	$.fn.dragable.defaults = defaults;
	//使用帮助
	$.fn.dragable.help = function(){
		return [
			"fillMode：'backward','forward',function(opt,cb){}",
		"	backward：拖拽结束后返回",
		"	forward：拖拽结束后停留在结束位置（默认动作）",
		"	function(e,opt){}",
		"dashed: false,true，是否在原来的位置留一个虚线框",
		"style: 设置拖拽时的样式",
		"拖拽事件：",
		"	拖拽开始事件：",
		"	onStart(e,option) scope drag element",
		"	正在拖拽事件：",
		"	onDrag(e,option) scope drag element",
		"	拖拽结束事件：",
		"	onStop(e,option) scope drag element",
		].join("\n");
	};
})(jQuery);
