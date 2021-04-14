/* eslint-disable */
import {
  china_geojson
} from '@/assets/data/china';

import {
  allProvince_geojson
} from '@/assets/data/province';

import OutLine from './Outline';

import {
  getMeshPhongMaterial,
  getPolygonsByFeatures,
  getLineMaterial as _glm,
  getFeaturesByCode,
  sceneTypes,
  themeColor,
  directlyCity,
} from './utils';

let THREE = window.THREE;
let maptalks = window.maptalks;

let aisaImageLayer;
let map;

/*
动画执行/交互流程

1. 初始化亚洲影像底图、初始化 中国地图 mesh  初始化视角为 [121.46920219897208, 38.56130082568782]
2. 开始从 map数据 => 采集数据 => 三维数据 开始轮播

3. map数据类型（切换颜色主题 拉取服务端 城市列表 城市覆盖率 总采集面积数据）：

3.1 添加 按照城市code 排序后的城市列表中的 第一个城市的 marker ，定时3s 切换到改城市的省份， 添加省份 mesh 并有加高度动效， 
3.2 轮播该 省份的 所有城市，并且右侧边城市列表向上滚动，marker 也相应移动到某城市位置，3s 切换下一个城市，
3.3 如果该省份 城市切换完毕，则切到全国视角，并且添加下一个省份的城市列表中第一个城市 marker，
3.4 重复 3.2

4.5 所有省份的所有城市列表轮播结束后 
    => 切换到采集数据类型（切换颜色主题 拉取服务端数据） 重复 3.1-3.4 
    => 切换到三维数据类型（切换颜色主题 拉取服务端数据） 重复 3.1-3.4 
    => map数据类型 无限循环
*/

// 
let threeLayer;
let willChangeScene = false; // 切换数据类型标记 切换主题色
let curType = sceneTypes[0]; // 当前场景类型 // 三大数据类型
// 用于切换 china mesh color
let chinaMeshColor = {
  black: 'rgb(22,28,36)',
  gray: 'rgb(22,28,36)'
}
let china_mesh, china_outLine_mesh;
let material = getMeshPhongMaterial(chinaMeshColor.black);
let getlineMaterial = (curType) => _glm(themeColor[curType]);

// let hlj_features = [allProvince_geojson.features.find(v => v.properties.adcode == 230000)];
// let hlj_polygon = getPolygonsByFeatures(hlj_features);

// 场景中维护一个全局 marker 即可
let city_marker = new maptalks.ui.UIMarker([0, 0], {
  'content': '<div class="city_marker"><div class="left"><span class="icon"></span><span class="circle1"></span><span class="circle2"></span></div><div class="right">北京市</div></div>'
});
city_marker.updateMarkerText = updateMarkerText;
let marker_dom; // 用于更改marker css样式
/*
// 更新文本
city_marker.updateMarkerText('北京市'); 
// 更新位置
const coord = new maptalks.Coordinate(129.91348207022463, 46.546407664890); 
city_marker.setCoordinates(coord);
*/ 

// 初始化一次
export const initChinaMap = (dom) => {
  map = window.map = new maptalks.Map(dom, {
    center: [121.46920219897208, 38.56130082568782], // 初始化视角
    zoom: 4.54,
    bearing: 0,
    pitch: 0,
    // centerCross: true,
    doubleClickZoom: false,
    baseLayer: new maptalks.ImageLayer('images-fuzzy', [{
      url: '/imgs/aisa-fuzzy.jpg', // maptlak 加载的图片资源需要路径位于项目根目录
      extent: [52.379081, 1.413587, 177.711112, 61.273828]
    }]),
  });

  aisaImageLayer = new maptalks.ImageLayer('images-asia', [{
      url: '/imgs/aisa.jpg',
      extent: [52.379081, 1.413587, 177.711112, 61.273828],
      opacity: 1
    }]
  );

  map.addLayer(aisaImageLayer);
  aisaImageLayer.setOpacity(.9);
  
  city_marker.addTo(map).show();

  setTimeout(() => {
    marker_dom = document.querySelector('.city_marker');
    console.log('marker_dom', marker_dom);
  }, 0); 
  initChinaLayer();
}
// 初始化一次 添加 china_mesh  china_outLine_mesh
function initChinaLayer() {
  // the ThreeLayer to draw buildings
  threeLayer = new maptalks.ThreeLayer('t1', {
    forceRenderOnMoving: true,
    forceRenderOnRotating: true
  });

  var meshs = [];

  threeLayer.prepareToDraw = function(gl, scene, camera) {
    // 
    const light = new THREE.DirectionalLight('0xffffff');
    light.position.set(0, -10, 10).normalize();
    light.castShadow = true;
    scene.add(light);
    camera.add(new THREE.PointLight('#fff', 0.5));

    // 构建 china mesh // 添加一次  后面效果根据全局的 mesh对象 更改材质即可
    let china_features = china_geojson.features;
    const polygons_china = getPolygonsByFeatures(china_features);
    china_mesh = threeLayer.toExtrudePolygons(polygons_china, {
      interactive: false,
      topColor: '#fff'
    }, material);
    meshs.push(china_mesh);

    // china ouline mesh  // 添加一次  后面效果根据全局的 mesh对象 更改材质即可
    const lineMaterial = getlineMaterial(curType)
    china_outLine_mesh = new OutLine(china_mesh, {
      interactive: false
    }, lineMaterial, threeLayer);
    meshs.push(china_outLine_mesh);
    
    // 
    threeLayer.addMesh(meshs);
    // animation();
  };
  threeLayer.addTo(map);
  threeLayer.config('animation', true);
}

// 根据城市code/pos  => 获取省份code => geojson => province_mesh  province_outLine_mesh
export const addProvinceLayer = async ({ adcode, cityName }) => {
  let meshs = [];
  const features = getFeaturesByCode(adcode, cityName);

  let polygons_province = features.map(f => {
    const polygon = maptalks.GeoJSON.toGeometry(f);
    polygon.setProperties({
        height: 40000,
    });
    return polygon;
  });

  const province_mesh = threeLayer.toExtrudePolygons(polygons_province, { interactive: false, altitude: 100,topColor: '#fff' }, material);
  const province_outLine_mesh = new OutLine(province_mesh, { interactive: false, altitude: 100 }, lineMaterial, threeLayer );

  meshs.push(province_mesh);
  meshs.push(province_outLine_mesh);

  threeLayer.add(meshs);
}

/*
	cityList 所有城市列表信息 

	from|to：{
		camera 相机信息
		marker 标注信息 label:string postion:geoPoint
		type  国家级别 or 省份级别  china province
		color 边界颜色信息
		code 区域码 用于查询 服务端数据，更新vue-data // 根据 cityList 和 code 变化可判断出切换为下一个城市还是省份
	}
*/
// const getCityListBtServer = async () => {}
// 三种数据类型 循环切换， 分别对应三种主题色
export const changeScene = (cityList, to, from) => {
  const len = cityList.length;
  if(to.adcode == cityList[len-1].adcode) {
    willChangeScene = true;
  } else {
    willChangeScene = false;
  }
  
  // changeTheme(cityList, to, from)

}

// 
// 省份边界高亮 、 市区边界设置透明度 、 其他省份边界设置透明度
export const updateCamera = (cityList, to, from, callback) => {

  // if() {
  // 	change2China(cityList, to)
  // }

}

// 
export const province2China = (cityList, to) => {

}
// 
export const china2Province = (cityList, to) => {

}
// 
export const province2Province = (cityList, to) => {

}

// 
export const changeTheme = (from, to) => {

}

function updateMarkerText(cityName) {
  const res = this.getContent().replace(/([\s\S]+<div class="right">)([\s\S]+)(<\/div><\/div>)/, (s, s1, s2, s3) => {
      // console.log(s, s1, s2. s3)
      return s1 + cityName + s3;
  });
  this.setContent(res);
}