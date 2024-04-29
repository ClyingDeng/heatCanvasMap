// 带聚合功能的热力图
const defaultConfig = {
  defaultContainer: null,
  defaultRadius: 40,
  defaultRenderer: 'canvas2d',
  defaultGradient: {
    0.25: 'rgb(0,0,255)',
    0.55: 'rgb(0,255,0)',
    0.85: 'yellow',
    1.0: 'rgb(255,0,0)'
  },
  defaultMaxOpacity: 1,
  defaultMinOpacity: 0,
  defaultBlur: 0.85,
  defaultXField: 'x',
  defaultYField: 'y',
  defaultValueField: 'value'
}
// mergeOptions
function mergeConfig(defaultConfig, config) {
  const newConfig = {}
  let map = new Map()
  for (const key in config) {
    if (Object.hasOwnProperty.call(config, key)) {
      let name = ('default' + key).toLowerCase()
      if (map.get(name)) return
      map.set(name, config[key])
    }
  }
  for (const key in defaultConfig) {
    let name = key.toLowerCase()
    if (map.get(name)) {
      newConfig[key] = map.get(name)
    } else newConfig[key] = defaultConfig[key]
  }

  return newConfig
}
class EventEmitter {
  constructor() {
    this.events = {}
  }
  on(eventName, cb, scope) {
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }
    this.events[eventName].push(function (data) {
      return cb.call(scope, data)
    })
  }
  emit(eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach((cb) => {
        cb(data)
      })
    }
  }
}

let HeatMapCanvas = (() => {
  function HeatMapCanvas(config) {
    this._coordinator = new EventEmitter()
    this.container = config.container // 容器
    this.config = mergeConfig(defaultConfig, config) // 配置整合

    this._render = new canvasRender(this.config)
    // 订阅renderAll
    this._coordinator.on('renderAll', this._render.renderAll, this._render) // 使用时可以获取到当前scope指向的具体的this
  }
  HeatMapCanvas.prototype = {
    setData(data) {
      // 触发
      this._coordinator.emit('renderAll', data)
    }
  }
  return HeatMapCanvas
})()
;(() => {
  window.HeatMapCanvas = HeatMapCanvas
})()

let canvasRender = (function Canvas2dRendererClosure(config) {
  let _getPointTemplate = (radius, blur) => {
    let tplCanvas = document.createElement('canvas')
    let tplCtx = tplCanvas.getContext('2d')
    tplCanvas.width = tplCanvas.height = radius * 2
    let x = radius
    let y = radius
    // 径向渐变的点
    let gradient = tplCtx.createRadialGradient(x, y, radius * blur, x, y, radius)
    gradient.addColorStop(0, 'rgba(0,0,0,1)')
    gradient.addColorStop(1, 'rgba(0,0,0,0)')
    tplCtx.fillStyle = gradient
    tplCtx.fillRect(0, 0, 2 * radius, 2 * radius)

    return tplCanvas
  }
  // 画canvas
  function canvasRender(config) {
    this.config = config
    // 最后生成的canvas内容
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.canvas.className = 'heatmap-canvas'
    // 初始点状canvas 灰度点
    this.shadowCanvas = document.createElement('canvas')
    this.shadowCtx = this.shadowCanvas.getContext('2d')
    this.shadowCanvas.className = 'shadow-canvas'

    // 根据容器设置宽高
    let container = config.defaultContainer
    let computed =
      {
        width: container.offsetWidth || container.width,
        height: container.offsetHeight || container.height
      } || {}
    this._width = this.canvas.width = this.shadowCanvas.width = computed.width
    this._height = this.canvas.height = this.shadowCanvas.height = computed.height
    this._opacity = (config.opacity || 0) * 255
    this._maxOpacity = (config.maxOpacity || config.defaultMaxOpacity) * 255
    this._minOpacity = (config.minOpacity || config.defaultMinOpacity) * 255
  }
  canvasRender.prototype = {
    getCanvas() {
      return this.canvas
    },
    // 获取灰度canvas
    getShadowCanvas() {
      return this.shadowCanvas
    },
    _clear() {
      // 清除重新绘制
      this.ctx.clearRect(0, 0, this._width, this._height)
      this.shadowCtx.clearRect(0, 0, this._width, this._height)
    },
    // 数据处理
    handleData(data) {
      let renderData = []
      let min = data.min
      let max = data.max
      let dataCopy = data.data

      return {
        min: min,
        max: max,
        data: renderData
      }
    },
    // 画点
    _drawAlpha(conf) {
      let min = (this._min = conf.min)
      let max = (this._max = conf.max)
      let datas = conf.data || []
      let width = this._width
      let height = this._height
      let gridSize = 10
      let xNum = Math.floor(width / gridSize)
      let yNum = Math.floor(height / gridSize)
      let gridsLen = xNum * yNum
      console.log(xNum, yNum, datas.length)
      // let data = gridsLen > datas.length ? datas : grids
      if (gridsLen > datas.length) {
        data = datas
      } else {
        let mapbox = this._heatmapPoly(datas, gridSize)
        let grids = this._getPointXY(mapbox) // 转换获取对应每个网格的中心位置
        data = grids
      }
      let dataLen = data.length
      let radius = this.config.defaultRadius
      let blur = 1 - this.config.defaultBlur // blur越小越模糊
      // 把每个格子看成一个点去渲染
      while (dataLen--) {
        let tpl = null
        let point = data[dataLen]
        let x = point[this.config.defaultXField]
        let y = point[this.config.defaultYField]
        tpl = _getPointTemplate(radius, blur) // 灰度点
        // 设置每个点的模糊度
        let value = Math.min(point[this.config.defaultValueField], max) // 超出最大取最大
        let tplAlpha = (value - min) / (max - min)
        this.shadowCtx.globalAlpha = tplAlpha < 0.01 ? 0.01 : tplAlpha
        // 画到shadowCanvas上
        let rectX = x - radius
        let rectY = y - radius
        this.shadowCtx.drawImage(tpl, rectX, rectY)
      }
    },
    // 容器网格
    _contentPoly(gridSize = 10) {
      let mapBox = []
      let width = this._width
      let height = this._height
      let xNum = Math.floor(width / gridSize) + 1
      let yNum = Math.floor(height / gridSize) + 1
      for (let i = 0; i < xNum; i++) {
        let row = []
        for (let j = 0; j < yNum; j++) {
          row.push({
            x1: j * gridSize,
            y1: i * gridSize,
            x2: (j + 1) * gridSize,
            y2: (i + 1) * gridSize,
            count: 0
          })
        }
        mapBox.push(row)
      }
      return mapBox
    },
    // 每个点落到对应的网格中
    _heatmapPoly(datas, gridSize = 10) {
      let mapBox = this._contentPoly(gridSize)
      let max = this._max
      let len = datas.length
      while (len--) {
        let point = datas[len]
        let x = point[this.config.defaultXField]
        let y = point[this.config.defaultYField]
        let count = point.count
        // 找到该点所属的网格
        let gridX = Math.floor(x / gridSize)
        let gridY = Math.floor(y / gridSize)
        // 将点的 count 值加到对应的网格中
        if (count) mapBox[gridX][gridY].count += count
        // 如果该网格的 count 值超过了最大值 max，则将该网格的 count 置为 max
        if (mapBox[gridX][gridY].count > max) {
          mapBox[gridX][gridY].count = max
        }
      }
      return mapBox
    },
    _getPointXY(grid) {
      let points = []
      grid.forEach((row) => {
        row.forEach((cell) => {
          var x = (cell.x1 + cell.x2) / 2
          var y = (cell.y1 + cell.y2) / 2
          points.push({
            [this.config.defaultXField]: x,
            [this.config.defaultYField]: y,
            count: cell.count
          })
        })
      })

      return points
    },
    // 判断点是否在网格中
    _findGridInfo(point, interval = 5) {
      let width = this._width
      let height = this._height
      let xNum = Math.floor(width / interval) + 1
      let yNum = Math.floor(height / interval) + 1

      console.log(point)
    },
    // 生成一个256px的彩带 获取像素点集合
    _getColorPalette() {
      let gradientConfig = this.config.defaultGradient
      let paletteCanvas = document.createElement('canvas')
      let paletteCtx = paletteCanvas.getContext('2d')
      paletteCanvas.width = 256
      paletteCanvas.height = 1
      let gradient = paletteCtx.createLinearGradient(0, 0, 256, 1)
      for (let key in gradientConfig) {
        gradient.addColorStop(key, gradientConfig[key])
      }
      paletteCtx.fillStyle = gradient
      paletteCtx.fillRect(0, 0, 256, 1)

      return paletteCtx.getImageData(0, 0, 256, 1).data
    },
    _colorResize() {
      let width = this._width
      let height = this._height
      let opacity = this._opacity
      let maxOpacity = this._maxOpacity
      let minOpacity = this._minOpacity
      let img = this.shadowCtx.getImageData(0, 0, width, height)
      let imgData = img.data // 我们画的点的像素集合
      let palette = this._getColorPalette() // 彩带的像素集合
      let len = imgData.length
      for (var i = 3; i < len; i += 4) {
        let alpha = imgData[i] //取第一个像素的透明度
        let offset = alpha * 4
        if (!offset) {
          continue
        }
        // 透明度设置
        let finalAlpha
        if (opacity > 0) {
          finalAlpha = opacity
        } else {
          if (alpha < maxOpacity) {
            if (alpha < minOpacity) {
              finalAlpha = minOpacity
            } else {
              finalAlpha = alpha
            }
          } else {
            finalAlpha = maxOpacity
          }
        }

        imgData[i - 3] = palette[offset]
        imgData[i - 2] = palette[offset + 1]
        imgData[i - 1] = palette[offset + 2]
        imgData[i] = finalAlpha
      }
      img.data = imgData

      this.ctx.putImageData(img, 0, 0)
    },
    renderAll(data) {
      // this  本身
      // 全部渲染
      this._clear()
      if (data.data.length > 0) {
        this._drawAlpha(data) // 重新画灰度点
        this._colorResize() // 重新配置颜色
      }
    }
  }
  return canvasRender
})()
