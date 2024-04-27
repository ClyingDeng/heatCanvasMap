<script lang="js">
// import { originData } from '../common/data.js'
// 直接绘制一个canvas 添加到map上
let BMapGL = window.BMapGL

export default {
  name: 'AboutP',
  components: {},
  data() {
    return {
      mapBounds: null,
      latlngs: [
        {
          lng: 116.3348129641733,
          lat: 39.99626962690333,
          count: 50
        },
        {
          lng: 116.3348329641738,
          lat: 39.9926962690333,
          count: 50
        }
      ],
      map: null,
      heatmapInstance: null,
      radius: 20 // 圆点
    }
  },

  mounted() {
    // this.latlngs=originData
    this.map = new BMapGL.Map('container')
    let point = new BMapGL.Point(116.404, 39.915)
    this.map.centerAndZoom(point, 12)
    this.map.enableScrollWheelZoom(true)
    // this.latlngs=[]
    // for (let i = 0; i < 300; i++) {
    //   let randomLng = 116.404 + Math.random() * 0.2;
    //   let randomLat = 39.915 + Math.random() * 0.1;
    //   let point = this.map.pointToOverlayPixel({ lng: randomLng, lat: randomLat,radius: this.radius  })
    //   this.latlngs.push({
    //     //地理坐标
    //     lng: randomLng, lat: randomLat,
    //     count: Math.random() * 100,
    //   });
    // }
    const containerMapDiv = document.getElementById('containerMap')

    // 使用 heatmap.js 创建热力图实例
    this.heatmapInstance = window.h337.create({
      container: containerMapDiv,
      radius: 20,
      blur: 1,
      // 数据点中 x 坐标的属性名称
      xField: 'lng',
      // 数据点中 y 坐标的属性名称
      yField: 'lat',
      // 数据点中 y 坐标的属性名称
      valueField: 'count',
      onExtremaChange(data) {
        // 热力图数据变化
        console.log('data', data)
      }
    })
    this.renderMap()

    // 监听地图缩放事件
    this.map.addEventListener('zoomend', () => {
      this.renderMap()
      // 更新 Canvas
      var newBounds = map.getBounds()
      overlay.setBounds(newBounds)
      overlay.setImageURL(canvas.toDataURL())
    })
    // 监听地图拖拽事件
    this.map.addEventListener('dragend', () => {
      this.renderMap()
    })
  },
  methods: {
    // 设置热力图数据
    heatmapSetData(data) {
      this.heatmapInstance.setData({
        max: 100,
        data: data
      })
      // 返回生成的 canvas 元素
      return this.heatmapInstance._renderer.canvas
    }
  }
}

// 模拟一些热力图数据
// for (let i = 0; i < 10000; i++) {
//   let randomLng = 116.404 + Math.random() * 0.2;
//   let randomLat = 39.915 + Math.random() * 0.1;
//   let point = this.map.pointToOverlayPixel({ lng: randomLng, lat: randomLat,radius: this.radius  })
//   this.latlngs.push({
//     //地理坐标
//     lng: randomLng, lat: randomLat,
//     count: Math.random() * 100,
//   });
// }
// console.log(this.latlngs);
</script>

<template>
  <div>
    <div id="container"></div>
    <div id="containerMap"></div>
    <!-- <div id="myDiv"></div> -->
    <!-- <canvas id="heatmapCanvas" width="600" height="600"></canvas> -->
  </div>
</template>

<style scoped>
#container {
  height: 600px;
  width: 600px;
  position: absolute;
  z-index: 1;
}

#containerMap {
  height: 600px;
  width: 600px;
  position: absolute;
  z-index: -1;
}

#myDiv {
  height: 600px;
  width: 600px;
  position: relative;
}

#heatmapCanvas {
  height: 600px;
  width: 600px;
  border: 1px solid black;
}
</style>
