import request from './request'

class Controller {
  #tableName = ''
  #controllerUrl = ''
  #headers = {}
  constructor(name, baseUrl, headers) {
    if (name.startsWith('/')) {
      name = name.substr(1)
    }
    this.#headers = headers ?? {}
    this.#tableName = name
    this.#controllerUrl = new URL(name, baseUrl).href

  }
  get headers() {
    return this.#headers
  }
  get controllerUrl() {
    return this.#controllerUrl
  }
  /**
   * id可以是一个id，或者为空，或者一个查询
   * @param {*} id
   */
  async get(id) {
    let url = `${this.controllerUrl}`
    let data = null
    if (typeof id == 'object') {
      data = id
    } else if (id != null) {
      url = `${this.controllerUrl}/${id}`
    }

    return request.get(url, data, this.headers)
  }
  /**
   * 新增
   * @param {*} item
   */
  async post(item) {
    return request.post(this.controllerUrl, item, this.headers)
  }

  /**
   * 更新全部
   * @param {*} id
   * @param {*} item
   */
  async put(id, item) {
    if (item == undefined) {
      throw new Error('参数数量不对')
    }
    return request.put(`${this.controllerUrl}/${id}`, item, this.headers)
  }

  /**
   * 更新部分
   * @param {*} id
   * @param {*} item
   */
  async patch(id, item) {
    if (item == undefined) {
      throw new Error('参数数量不对')
    }
    return request.patch(`${this.controllerUrl}/${id}`, item, this.headers)
  }

  /**
   * id可以是一个id，或者一个数组，或者一个查询
   * @param {*} id
   */
  async delete(id) {
    let url = `${this.controllerUrl}`
    let data = null
    if (id instanceof Array) {
      url = `${this.controllerUrl}/${id.join(',')}`
    } else if (typeof id == 'object') {
      data = id
    } else {
      url = `${this.controllerUrl}/${id}`
    }

    return request.delete(url, data, this.headers)
  }
  add = this.post
  update = this.put
  modify = this.patch
  del = this.delete
}
const handler = {
  get(target, property, receiver) {
    if (property in target) {
      return target[property]
    }
    let match = /^(?<action>get|add|post|update|put|patch|modify|del|delete)(?<name>\w+)/i.exec(
      property
    )
    if (match) {
      let [first, ...rest] = match.groups.name
      let name = [first.toLowerCase(), ...rest].join('')
      let controller = new Controller(name, target.controllerUrl + '/', target.headers)
      return controller[match.groups.action].bind(controller)
    }


    return new Proxy(new Controller(property, target.controllerUrl + '/', target.headers), handler)
  }
}
const createController = (name, baseUrl, headers) => {
  return new Proxy(new Controller(name, baseUrl, headers), handler)
}

export default {
  create: createController
}
