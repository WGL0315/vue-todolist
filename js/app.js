(function (Vue) {  //表示依赖了全局的Vue
	'use strict';

	// 初始化任务，定义全局任务数据
	const items = [
		// {
		// 	id: 1,
		// 	content: 'vue.js',
		// 	completed: false //是否完成
		// },
		// {
		// 	id: 2,
		// 	content: 'java',
		// 	completed: true
		// },
		// {
		// 	id: 3,
		// 	content: 'python',
		// 	completed: false
		// }
	];

	// 自定义全局指令，为元素获取焦点
	Vue.directive('app-focus',{
		// 聚集元素
		inserted(el, binding){
			el.focus();
		}
	});

	// 浏览器的localstorage是以"键值对"形式存储数据的，一个key对应一组数据
	// JSON.stringify()将原数据转换为json格式；
	// JSON.parse()将json格式解析为原数据;
	var STORAGE_KEY = 'items-vuejs';
	const itemStorage = {
		fetch: function(){ //通过STORAGE_KEY获取本地数据
			return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
		},
		save: function(items){ //保存数据到本地，对应key为STORAGE_KEY
			localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
		}
	};

	// 创建vue实例
	var app = new Vue({
		el: '#todoapp',
		// 定义数据模型model
		data: {
			// items, //ES6中对象属性的简写，等价于items: items,
			items: itemStorage.fetch(), //调用fetch()方法，获取本地数据，用于初始化
			currentItem: null, //用于接收当前点击的任务项
			filterStatus: 'all', //接收变化的状态值
		},
		// 定义计算属性选项
		computed: {
			// 过滤出所有未完成的任务项
			remaining(){ //不需要在data选项定义remaining
				// ES5写法
				// return this.items.filter(function(item){
				// 	return !item.completed;
				// }).length;

				// ES6箭头函数。注意是'filter'而不是'filters'
				return this.items.filter(item => !item.completed).length;
			},
			// 复选框计算属性（双向绑定）
			toggleAll: {
				get(){  //等价于get: function(){}
					console.log("剩余待办", this.remaining);
					// 当this.remaining发生变化后，会触发该方法运行
					// 当所有未完成任务数为0，表示全部完成，则返回true让复选框选中
					// 反之，false不选中
					return this.remaining === 0; //返回true或者false
				},
				set(newStatus){
					console.log("任务项完成状态", newStatus);
					// 当点击checkbox复选框后，状态发生变化，就会触发该方法运行
					// 迭代出数组每个元素，把当前状态值赋给每个元素的completed
					// 下面箭头函数等价于：this.items.forEach(function(item){...})
					this.items.forEach((item) => {
						item.completed = newStatus;
					});
				}
			},
			// 过滤出不同状态数据
			filterItems(){
				switch(this.filterStatus){
					case 'active': //过滤出未完成的数据
						return this.items.filter(item => !item.completed);
						break;
					case 'completed': //过滤出已完成的数据
						return this.items.filter(item => item.completed);
						break;
					default: //其他，返回所有数据
						return this.items;
				}
			}
		},
		// 定义方法选项
		methods: {
			addItem(event){ //相当于addItem: function(){...}
				// console.log("点击事件", event);
				console.log('添加任务项', event.target.value);
				// 获取文本框输入的数据。.trim()数组方法用于去除字符串首尾的空格
				const content = event.target.value.trim();
				// 若文本框内容为空，则不处理
				if(!content.length){
					return
				}
				// 若文本框内容不为空，则新增待办事项
				const id = this.items.length + 1;
				this.items.push({
					id, //等价于id: id
					content,
					completed: false
				});
				// 清空文本框内容
				event.target.value = '';
				console.log("新增操作后，所有任务最新数据", this.items);
			},
			// 移除索引为index的一条记录
			removeItem(index){
				// index表示从第index开始删除，1表示删除一个
				this.items.splice(index, 1);
				console.log("删除操作后，所有任务最新数据", this.items);
			},
			// 一处所有已完成的任务项
			removeCompleted(){
				// 过滤出所有未完成的任务项，并且重新赋值给数组。由于双向绑定，数组数据更新后，页面自然不会再显示已完成的任务
				this.items = this.items.filter(item => !item.completed);
			},
			// 进入编辑状态，当前点击的任务项item赋值currentItem，用于页面判断显示.editing
			toEdit(item){
				this.currentItem = item;
			},
			// 取消编辑
			cancelEdit(){
				// 给currentItem赋值null,用于移除.editing样式的判断
				this.currentItem = null;
			},
			// 完成编辑。通过回车键、失去焦点触发
			finishEdit(item, index, event){
				const content = event.target.value.trim();
				if(!content){ //如果内容为空，则进行删除任务项操作
					this.removeItem(index); //移除当前任务项
					return; //退出
				}
				item.content = content; //给当前任务项赋新值
				this.currentItem = null; //移除.editing样式，退出编辑状态
			}
		},
		// 监听器
		watch: {
			// 一旦items的数据发生变化，就会触发里面的方法
			items: {
				deep: true, //监听对象内部值的变化，要在选项参数中指定deep:true
				handler: function(newItems, oldItems){
					// 本地进行存储
					itemStorage.save(newItems);
					console.log( 'localstorage存储的任务数据: ', JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
				}
			}
		},
		// 自定义局部指令。用于编辑输入框
		directives: {
			// 定义时不要在前面加v-,引用指令时要加上v-
			'todo-focus': {
				update(el, binding){  //每当指令的值更新后，会触发此函数
					if(binding.value){
						el.focus();
					}
				}
			}
		}

	})

	// 当路由hash值改变后，会自动调用此函数
	window.onhashchange = function(){
		// console.log('hash改变了', window.location.hash);
		// 获取点击的路由hash值，从第三个字符开始截取，即去掉"#/"
		// 若为空，则返回'all'，否则返回点击的hash值
		const hash = window.location.hash.substr(2) || 'all';
		console.log('当前hash值为: ', hash);

		//状态一旦改变，将hash赋值给filterStatus
		// 当计算属性filterItems感知到filterStatus改变后，就会重新过滤
		// 当filterItems重新过滤出目标数据后，则自动同步更新到视图中
		app.filterStatus = hash;
	}
	// 第一次访问页面时，调用一次让状态生效
	window.onhashchange();

})(Vue);
