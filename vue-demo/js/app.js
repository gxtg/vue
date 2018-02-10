let app = new Vue({
	el: '#app',
	data: {
		msg: 'vue vuex',
		isShow: true
	},
	methods: {
		toggle() {
			this.$data.isShow = !this.$data.isShow
		}
	}
})

