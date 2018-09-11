import Vue from 'vue';
import Alert from "./component/Alert.vue"


// 2.注册组件，并指定组件的标签，组件的HTML标签为<my-component>
Vue.component('matrix-component',{
	template: '<div style="font-family:微软雅黑;">This is matrix first component</div>'
});

Vue.component(Alert.name, Alert);


// 3.创建一个 Vue 实例或 "ViewModel"
// 它连接 View 与 Model
new Vue({ // eslint-disable-line
	data:{d:1,title:"test"},

	mounted(){

	}
}).$mount('#app');

