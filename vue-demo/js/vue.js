/*
1. 解析don模板：渲染数据
2. 数据和事件与dom模板绑定：监听数据的变化、监听事件触发
*/

class Vue {
	constructor(option) {
		this.$el = option.el
		this.$data = option.data
		this.$methods = option.methods
		this.textReg = /{{(.+?)}}/g //()的作用主要用于记住里面的匹配项
		this.renderProp = {}
		this.interatorNodes(this.$el)
	}

	// 解析dom
	interatorNodes(node) {
		node = typeof node === 'string' ? document.querySelector(node) : node
		Array.from(node.childNodes, node => {
			this.nodeType(node)
			if (node.childNodes.length) {
				this.interatorNodes(node)
			}
		})
	}

	// 判断node的节点类型
	nodeType(node) {
		if (node.nodeType === 1) {
			this.parserDirective(node)
		}

		if (node.nodeType === 3) {
			this.mustache(node)
		}
	}

	// 模板解析
	mustache(node) {
		let text = node.textContent
		if (this.textReg.test(text)) {
			node.template = text //保留模板
			node.textContent = this.templateRender(text) //先进行第一步所有模板数据的渲染
			this.coupling(text.split(this.textReg)[1], node)
		}
	}

	// 渲染模板
	templateRender(template) {
		return	template.replace(this.textReg, (match, p1) => {
			return this.$data[p1]
		})
	}

	// 绑定dom
	coupling(prop, node) {
		if (this.renderProp[prop] === undefined) {
			this.renderProp[prop] = []
			this.monitorBindingData(prop)
		}
		this.renderProp[prop].push(node)
	}

	// 监听数据变化
	monitorBindingData(prop) {
		let initalization = this.$data[prop]
		let self = this
		Object.defineProperty(this.$data, prop, {
			get() {
				return initalization
			},
			set(value) {
				initalization = value
				self.model2View(prop)
			}
		})
	}

	// 重新渲染数据
	model2View(prop) {
		let renderProp = this.renderProp[prop]
		if (renderProp && renderProp.length) {
			renderProp.forEach( (node, index) => {
				if (node.nodeType === 1) {
					this.parserDirective(node)
				}

				if (node.nodeType === 3) {
					node.textContent = this.templateRender(node.template)
				}
			})
		}
	}


	// 指令解析

	// 解析指令
	parserDirective(node) {
		let directiveMap = this.directiveMap()
		Object.keys(directiveMap).forEach(directive => {
			let directiveAttr = `v-${directive}`
			let prop = node.getAttribute(directiveAttr)
			if (node.hasAttribute(directiveAttr)) {
				directiveMap[directive](node, this.$data[prop])
				this.coupling(prop, node)
			}
		})

		let attrs = node.attributes
		Object.keys(attrs).forEach( attr => {
			let name = attrs[attr].name
			let handler = attrs[attr].value

			if (name.startsWith('v-on')) {
				node.addEventListener(name.split(':')[1], this.$methods[handler].bind(this))
			}
		})
	}

	directiveMap() {
		return {
			show(node, value) {
				node.style.display = value ? '' : 'none'
			},
			if() {

			},
			text() {

			}
		}
	}
}
