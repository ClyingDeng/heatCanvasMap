<template>
  <!-- <div id="containerDIV"></div> -->
  <div id="container"></div>
</template>
<script lang="js" name="Home">
export default {
  name: 'Home',
  components: {},
  data() {
    return {
      heatmapCanvas: null,
      mapBounds: null,
      latlngs: [
        {
          lng: 116.404,
          lat: 39.915,
          count: 80
        },
        {
          lng: 117.3348329641738,
          lat: 39.262690333,
          count: 30
        }
      ],
      map: null,
      canvas: null,
      points: [],
      heatmapInstance: null,
      radius: 20 // 圆点
    }
  },
  computed: {
    // pointsBounds() {
    //   let mapData = []
    //   let r = this.map.getBounds()
    //   console.log(r)
    //   if (r.equals(this.mapBounds)) return
    //   this.mapBounds = r
    //   let n = this.latlngs.length
    //   while (n--) {
    //     let f = this.latlngs[n]
    //     if (!r.containsPoint(f)) {
    //       continue
    //     } // 超出可是范围的不画
    //     let point = this.map.pointToOverlayPixel({
    //       lng: this.latlngs[n].lng,
    //       lat: this.latlngs[n].lat,
    //       radius: this.radius
    //     })
    //     // 需要渲染的点
    //     mapData.push({ lng: point.x, lat: point.y, count: this.latlngs[n].count })
    //   }
    //   return mapData
    // }
  },
  watch: {
    // 监听地图变化
    // mapWatch: {
    //   handler() {
    //     if (!this.map) return
    //     let mapData = []
    //     let r = this.map.getBounds()
    //     console.log(r)
    //     if (r.equals(this.mapBounds)) return
    //     this.mapBounds = r
    //     let n = this.latlngs.length
    //     while (n--) {
    //       let f = this.latlngs[n]
    //       if (!r.containsPoint(f)) {
    //         continue
    //       } // 超出可是范围的不画
    //       let point = this.map.pointToOverlayPixel({
    //         lng: this.latlngs[n].lng,
    //         lat: this.latlngs[n].lat,
    //         radius: this.radius
    //       })
    //       // 需要渲染的点
    //       mapData.push({ lng: point.x, lat: point.y, count: this.latlngs[n].count })
    //     }
    //     this.pointsBounds = mapData
    //   },
    //   immediate: true,
    //   deep: true
    // }
  },
  mounted() {
    this.map = new BMapGL.Map('container')
    let point = new BMapGL.Point(116.404, 39.915)
    this.map.centerAndZoom(point, 8)
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
    this.pointsBounds()
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

    // 监听地图缩放事件
    this.map.addEventListener('zoomend', () => {
      this.pointsBounds()
    })
    // // 监听地图拖拽事件
    this.map.addEventListener('dragend', () => {
      this.pointsBounds()
    })
  },
  methods: {
    // 仅绘制区域内的点
    pointsBounds() {
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
      console.log(mapData)
      this.points = mapData
    }
  }
}
</script>

<style scoped>
#container {
  height: 600px;
  width: 600px;
}
</style>
