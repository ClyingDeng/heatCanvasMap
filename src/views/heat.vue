<template>
  <!-- 简单热力图 -->
  <div id="container"></div>
</template>
<script lang="js" name="Heat">
export default {
  name: 'Heat',
  components: {},
  data() {
    return {
      heatmapCanvas: null,
      mapBounds: null,
      latlngs: [
        {
          lng: 116.46754429734781, //经度 东西
          lat: 39.9200120606158, // 纬度
          count: 67.08430718281981
        }
        // {
        //   lng: 116.45388932327177,
        //   lat: 39.93922650653802,
        //   count: 87.27049672583702
        // },
        // {
        //   lng: 116.51676961427235,
        //   lat: 39.957355396010655,
        //   count: 65.19401496400552
        // },
        // {
        //   lng: 116.50268151440899,
        //   lat: 40.00267237928021,
        //   count: 49.24838394729958
        // },
        // {
        //   lng: 115.404,
        //   lat: 39.915,
        //   count: 80
        // }
      ],
      map: null,
      canvas: null,
      points: [],
      heatmapInstance: null,
      radius: 20 // 圆点
    }
  },
  mounted() {
    this.latlngs = []
    for (let i = 0; i < 3000; i++) {
      let randomLng = 116.1541 + Math.random() * 0.5
      let randomLat = 39.8125 + Math.random() * 0.2
      this.latlngs.push({
        //地理坐标
        lng: randomLng,
        lat: randomLat,
        count: Math.random() * 100
      })
    }
    this.map = new BMapGL.Map('container')
    let point = new BMapGL.Point(116.404, 39.915)
    this.map.centerAndZoom(point, 13)
    this.map.enableScrollWheelZoom(true)
    this.heatmapCanvas = new window.HeatMapCanvas({
      container: document.getElementById('container'),
      radius: 20,
      blur: 1,
      // 数据点中 x 坐标的属性名称
      xField: 'lng',
      // 数据点中 y 坐标的属性名称
      yField: 'lat',
      // 数据点中 y 坐标的属性名称
      valueField: 'count'
    })
    this.renderMap()
    // 监听地图缩放事件
    this.map.addEventListener('zoomend', () => {
      this.renderMap()
    })
    // // 监听地图拖拽事件
    this.map.addEventListener('dragend', () => {
      this.renderMap()
    })
  },
  methods: {
    renderMap() {
      this.pointsBounds() // 获取数据新位置
      // 设置热力图数据
      this.heatmapCanvas.setData({
        min: 0,
        max: 100,
        data: this.points
      })
      this.canvas = this.heatmapCanvas._render.canvas
      const { sw, ne } = this.map.getBounds()
      var bounds = new BMapGL.Bounds(
        new BMapGL.Point(sw.lng, sw.lat),
        new BMapGL.Point(ne.lng, ne.lat)
      )
      var canvasOverlay = new BMapGL.GroundOverlay(bounds, {
        type: 'canvas',
        url: this.canvas
      })
      this.map.addOverlay(canvasOverlay)
    },
    // 仅绘制区域内的点
    pointsBounds() {
      this.map.clearOverlays()
      let mapData = []
      let r = this.map.getBounds()
      if (r.equals(this.mapBounds)) return
      this.mapBounds = r
      let n = this.latlngs.length
      while (n--) {
        let f = this.latlngs[n]
        if (!r.containsPoint(f)) {
          continue
        } // 超出可是范围的不画
        let point = this.map.pointToOverlayPixel({
          lng: this.latlngs[n].lng,
          lat: this.latlngs[n].lat,
          radius: this.radius
        })
        // 需要渲染的点
        mapData.push({ lng: point.x, lat: point.y, count: this.latlngs[n].count })
      }
      this.points = mapData
    }
  }
}
</script>

<style scoped>
#container {
  height: 600px;
  width: 1200px;
}
</style>
