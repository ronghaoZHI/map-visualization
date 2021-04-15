/* eslint-disable */
import {
  china_geojson
} from '@/assets/data/china';

import {
  allProvince_geojson
} from '@/assets/data/province';

import OutLine from './Outline';

import {
  getMeshPhongMaterial as _gmpm,
  getPolygonsByFeatures as _gpf,
  getLineMaterial as _glm,
  getFeaturesByCode as _gfc,
  sceneTypes,
  themeColor,
  directlyCity,
  sleep,
} from './utils';

let THREE = window.THREE;
let maptalks = window.maptalks;

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
let threeLayer, map, aisaImageLayer;;
const chinaPos = [121.46920219897208, 38.56130082568782];
let curType = sceneTypes[0]; // 当前场景类型 // 对应三大数据类型
// 用于切换 china mesh color
const chinaMeshColor = {
  black: 'rgb(22,28,36)',
  // gray: 'rgb(22,28,36)'
};
const material = _gmpm(chinaMeshColor.black);
var lineMaterial = _glm(themeColor[curType]);
console.log('lineMaterial', lineMaterial)
let china_mesh, china_outLine_mesh;
let province_mesh, province_outLine_mesh, provinceHeight = 40000;

// 场景中维护一个全局 marker 即可
let city_marker, 
 // 用于更改marker css样式
marker_dom;
initMarker();

// 初始化一次
export const initChinaMap = async (dom, _vue) => {
  map = window.map = new maptalks.Map(dom, {
    center: chinaPos, // 初始化视角
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
  
  initChinaLayer(_vue);

  runMain(_vue);
}

// 主函数 递归调用 无限循环
async function runMain(_vue) {
  // 循环三种数据类型场景
  for(let i = 0; i < sceneTypes.length; i++) {
    //  getCityList()  let { data:cityList } = await getCityListByServer()
    let cityList = allProvince_geojson.features.slice(0, 3);

    curType = sceneTypes[i];
    changeSceneType(_vue, cityList, {
      type: curType, 
      color: themeColor[curType],

    });
    
    // await sleep(3000);
    // continue;

    // 循环城市列表
    let lastCity;
    for(let j = 0; j < cityList.length; j++) {
      await sleep(3000);

      const curCity = cityList[j];
      console.log('curCity', curCity);
      
      if(!lastCity) {
        await china2Province({
          adcode: curCity.properties.adcode,
          name: curCity.properties.name,
          pos: curCity.properties.center,
        })
      } else if(curCity.properties.adcode.toString().substring(0,2) == lastCity.properties.adcode.toString().substring(0,2)) {
        // diff citycode 前两位是否变化判断切换逻辑， 变化则 需要先切换到全国再切换到省份
        await city2city({
          maker: { label: '', position: [] }
        })
      } else {
        await province2China({})
        
        await sleep(3000);

        await china2Province({
          adcode: curCity.properties.adcode,
          name: curCity.properties.name,
          pos: curCity.properties.center,
        })
      }

      lastCity = cityList[j];
    }
  }
  await Promise.resolve();
  runMain(_vue);
}

// 根据城市code/pos  => 获取省份code => geojson => province_mesh  province_outLine_mesh
export const addProvinceLayer = async ({ adcode, name }) => {
  let meshs = [];
  const features = _gfc(adcode, name);

  let polygons_province = features.map(f => {
    const polygon = maptalks.GeoJSON.toGeometry(f);
    polygon.setProperties({
        height: 40000,
    });
    return polygon;
  });

  province_mesh = threeLayer.toExtrudePolygons(polygons_province, { interactive: false, altitude: 1 ,topColor: '#fff' }, material);
  province_outLine_mesh = new OutLine(province_mesh, { interactive: false, altitude: 1 }, lineMaterial, threeLayer );

  meshs.push(province_mesh);
  meshs.push(province_outLine_mesh);

  threeLayer.addMesh(meshs);

  // mesh 突起动画
  {
    let time = 0;
    let timer = setInterval(() => {
      const scale = time / 40;
      province_mesh.getObject3d().scale.z = scale;
      province_outLine_mesh.getObject3d().scale.z = scale;
      if (++time >= 40) { 
        clearInterval(timer);
      };
    }, 50);

    setTimeout(_ => {
      let time = 0;
      let timer = setInterval(() => {
        const scale = 1 - time / 40;
        province_mesh.getObject3d().scale.z = scale;
        province_outLine_mesh.getObject3d().scale.z = scale;
        if (++time >= 40) { 
          clearInterval(timer);
          threeLayer.removeMesh(threeLayer.getMeshes().pop());
          threeLayer.removeMesh(threeLayer.getMeshes().pop());
        };
      }, 50);
    }, 3000);
  }

  return new Promise(res => { setTimeout(res, 2000) });
}

/*
	cityList 所有城市列表信息 
  to：{
		pos 相机信息
		marker: {lable, postion} 标注信息 label:string postion:geoPoint
		color 边界颜色信息
		code 区域码 用于查询 服务端数据，更新vue-data
	}
*/

// 三种数据类型 循环切换， 分别对应三种主题色
export const changeSceneType = (_vue, cityList, to) => {
  console.log(_vue, cityList, to)
  changeTheme(to);
  
  // updateVue(_vue, cityList)  state  _vue
}

// 
export const province2China = async ({}) => {
  await sleep(3000);
  // mesh 渐变下降
  let time = 0;
  let timer = setInterval(() => {
      const step = time / 40;
      province_mesh.setAltitude(-provinceHeight * step);
      province_outLine_mesh.setAltitude(-provinceHeight * step);
      if (++time >= 40) {
          clearInterval(timer);
          threeLayer.removeMesh(province_mesh);
          threeLayer.removeMesh(province_outLine_mesh);
      };
  }, 50);

  return new Promise(res => setTimeout(res, 2000));
}
// 
export const china2Province = async (to) => {
  const { adcode, name } = to;

  await addProvinceLayer({ adcode, name });

  return Promise.resolve();
}
// 
export const city2city = async (to) => {
  const { maker: { label, position } } = to;
  
  updateCityMarker(label, position);

  return Promise.resolve();
}

// 
export const changeTheme = (to) => {
  const { color } = to;
  document.documentElement.style.setProperty('--themeColor', color);

  lineMaterial.color.setStyle(color);
}

// 
function initMarker() {
  city_marker = new maptalks.ui.UIMarker([0, 0], {
    'content': '<div class="city_marker"><div class="left"><span class="icon"></span><span class="circle1"></span><span class="circle2"></span></div><div class="right">北京市</div></div>'
  });
  city_marker.updateMarkerText = function updateMarkerText(cityName) {
    const res = this.getContent().replace(/([\s\S]+<div class="right">)([\s\S]+)(<\/div><\/div>)/, (s, s1, s2, s3) => {
      return s1 + cityName + s3;
    });
    this.setContent(res);
  };
}
// 
function updateCityMarker(label, [lon, lat]) {
  city_marker.updateMarkerText(label); 
    // 更新位置
  const coord = new maptalks.Coordinate(lon, lat); 
  city_marker.setCoordinates(coord);
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
    const polygons_china = _gpf(china_features);
    china_mesh = threeLayer.toExtrudePolygons(polygons_china, {
      interactive: false,
      topColor: '#fff',
      altitude: 1
    }, material);
    meshs.push(china_mesh);

    // china ouline mesh  // 添加一次  后面效果根据全局的 mesh对象 更改材质即可
    china_outLine_mesh = new OutLine(china_mesh, {
      interactive: false,
      altitude: 1
    }, lineMaterial, threeLayer);
    console.log(china_outLine_mesh)
    meshs.push(china_outLine_mesh);
    
    // 
    threeLayer.addMesh(meshs);
    // animation();
  };
  threeLayer.addTo(map);
  threeLayer.config('animation', true);
}