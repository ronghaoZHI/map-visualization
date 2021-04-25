/* eslint-disable */
import _polygonToLine from '@turf/polygon-to-line';
import DateTimeFormat from 'format-date-time';
import {
  china_geojson
} from '@/assets/data/china1';

// import OutLine from './three/Outline';

import {
  getMeshPhongMaterial as _gmpm,
  getAllProvinceFeatures,
  getPolygonsByFeatures as _gpf,
  getLineMaterial as _glm,
  getLineMaterial2 as _glm2,
  getFeaturesByCode as _gfc,
  sceneTypes,
  themeColor,
  directlyCity,
  sleep,
  progressColor as pColor,
  themeTitle as tTitle,
  getAllCityList,
  getCityCenterByCode,
  getCityFeaturesByCode,
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
let progressColor = pColor[0];
let themeTitle = tTitle[0];
const china_outline_width = 2;
const material = _gmpm(chinaMeshColor.black);
// 可设置宽度线 _glm2
const lineMaterial_china_outline = _glm2({
  color: themeColor[curType.dataType].outline,
  opacity: 1,
  linewidth: china_outline_width,
});
const lineMaterial_china_inline = _glm2({
  color: themeColor[curType.dataType].inline,
  opacity: .3,
  linewidth: 1,
});
const lineMaterial_province_inline = _glm2({
  color: themeColor[curType.dataType].inline,
  opacity: .3,
  linewidth: 1,
});
const lineMaterial_province_outline = _glm2({
  color: themeColor[curType.dataType].outline,
  opacity: 1.0,
  linewidth: 2,
});

// 1px线, 不能设置宽度 _glm
const lineMaterial_province = _glm({
  color: themeColor[curType.dataType].outline,
  opacity: 1.0
});
// 
let china_mesh,
  china_outLine_mesh,
  all_province_ouline_mesh = [];
// 
let province_mesh, 
  province_outLine_mesh_top,
  all_province_inline_mesh_top = [],
  province_outLine_mesh_buttom, 
  province_outLine_mesh_height,
  provinceHeight = 30000,
  provinceOutlineMeshHeight = provinceHeight / 110 - 40;

// 场景中维护一个全局 marker 即可
let city_marker,
  // 用于更改marker css样式
  marker_dom,
  history_markers = []; // 存放历史 marker
let showHistoryMaker;
// 高度特殊处理的省份
const spec_citys = [
  '440000', '450000', '460000', 
  '810000', '820000', '710000', 
  '330000', '360000', '450000', 
  '430000', '35000', '530000', 
  '500000', '310000', '420000',
  '520000', '510000',
];
// 
initMarker();

// 初始化一次
export const initChinaMap = async (dom, _vue) => {
  map = window.map = new maptalks.Map(dom, {
    center: chinaPos, // 初始化视角
    zoom: 4.54,
    bearing: 0,
    pitch: 1,
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
  }]);

  map.addLayer(aisaImageLayer);
  aisaImageLayer.setOpacity(.9);

  city_marker.addTo(map).show();

  setTimeout(() => {
    marker_dom = document.querySelector('.city_marker');
    // console.log('marker_dom', marker_dom);
  }, 0);

  initChinaLayer(_vue);

  runMain(_vue);
}

let first = true;
let willchangeScene = false;
// 主函数 递归调用 无限循环
async function runMain(_vue) {
  let allCityList = await getAllCityList();

  // 更新服务端数据 拉取时间
  const fDate = new DateTimeFormat();
  _vue.updateTime = fDate.now('YYYY.MM.DD &nbsp;&nbsp; HH:mm:ss') + '更新';
  // 更新数据量
  _vue.areaTotalList = allCityList.map(v => (+v.areaTotal / 1e6).toFixed(0));

  // 循环三种数据类型场景
  for (let i = 0; i < sceneTypes.length; i++) {
    willchangeScene = true;

    curType = sceneTypes[i];
    progressColor = pColor[i];
    themeTitle = tTitle[i];
    let curCityList = allCityList.find(v => v.dataType === curType.dataType);

    clearHistoryMarkers();
    // 
    if(first) {
      await _initVue(_vue, curCityList);
    }
    // 更新类型
    changeSceneType(_vue, curCityList, {
      type: curType,
      colors: themeColor[curType.dataType],
      progressColor,
      themeTitle,
    });

    if(!first) {
      await sleep(3000);
    }

    // 循环城市列表
    let lastCity;
    let cityList = curCityList.data.slice(0);
    for (let j = 0; j < cityList.length; j++) {
      // debugger
      const curCity = cityList[j];
      // 城市位置
      const location = await getCityCenterByCode(curCity.areaCode);
      // 省会位置 用于相机单位
      const center = curCity.geojson.properties.center;
      // console.log('curCity', curCity, lastCity);
      if (!lastCity) {
        await china2Province(_vue, {
          zoom: curCity.geojson.properties.zoom,
          adcode: curCity.parentCode,
          name: curCity.areaName,
          center: center,
          location: location,
          offset: curCity.geojson.properties.offset,
          offsetH: curCity.geojson.properties.offsetH,
        })
      } else if (
        curCity.parentCode.toString().substring(0, 2) ==
        lastCity.parentCode.toString().substring(0, 2)
      ) {
        // diff citycode 前两位是否变化判断切换逻辑， 变化则 需要先切换到全国再切换到省份
        // debugger
        await sleep(2000);
        await city2city(_vue, {
          maker: {
            name: curCity.areaName,
            location: location,
          }
        });
        // await sleep(3000);
      } else {
        await sleep(1000);
        // 
        await province2China(_vue, {
          adcode: lastCity.geojson.properties.adcode,
        })
        await sleep(2000);
        // 
        await china2Province(_vue, {
          zoom: curCity.geojson.properties.zoom,
          adcode: curCity.parentCode,
          name: curCity.areaName,
          center: center,
          location: location,
          offset: curCity.geojson.properties.offset,
          offsetH: curCity.geojson.properties.offsetH,
        })

        sleep(3000);
      }
      lastCity = cityList[j];

      if (first) {
        first = false;
      }
      if(willchangeScene) {
        willchangeScene = false;
      }
    }
    // 复位
    await sleep(1000);
    await province2China(_vue, {
      adcode: lastCity.geojson.properties.adcode,
    });
    await sleep(500);
  }

  await Promise.resolve();
  runMain(_vue);
}

async function _initVue(_vue, curCityList) {
  _vue.curCityList = curCityList.data.map(v => {
    const area = (+v.totalArea / 1e6);
    return {
      name: v.areaName,
      area: +area.toFixed(2) == 0 ? +area.toFixed(3) : +area.toFixed(2),
    }
  });
  await sleep(3000);
  _vue.showNumber = true;
  await sleep(1500);
  _vue.cityCount = +curCityList.count;
  _vue.cityTotal = +curCityList.totalCount;
  const percent = +(+curCityList.count / +curCityList.totalCount * 100).toFixed(0);
  _vue.completedProgress = percent;
  await sleep(200);
  _vue.resetCityList = true;
  await sleep(2000);
  return Promise.resolve();
}
// 根据城市code/pos  => 获取省份 code => geojson => province_mesh  province_outLine_mesh
export const addProvinceLayer = async ({
  adcode,
  name,
  offsetH
}) => {
  let meshs = [];
  const features = _gfc(adcode, name);

  let polygons_province = features.map(f => {
    const polygon = maptalks.GeoJSON.toGeometry(f);
    polygon.setProperties({
      // height: provinceHeight - (offsetH || 1000),
      height: provinceHeight - (offsetH || 1000),
    });
    return polygon;
  });

  province_mesh = threeLayer.toExtrudePolygons(polygons_province, {
    interactive: false,
    altitude: 10,
    // topColor: '#fff'
  }, material);
  
  // mesh - fatLines
  const geoLines = _polygonToLine(features[0]);
  const lineStrings = maptalks.GeoJSON.toGeometry(geoLines);
  province_outLine_mesh_top = threeLayer.toFatLines(lineStrings, {
    interactive: false,
    altitude: 10,
  }, lineMaterial_province_outline);

  province_outLine_mesh_buttom = threeLayer.toFatLines(lineStrings, {
    interactive: false,
    altitude: 100,
  }, lineMaterial_province_outline);

  province_outLine_mesh_height = threeLayer.toFatLines(lineStrings, {
    interactive: false,
    altitude: 1000,
    mode: 'height',
    bottom: 0,
    top: provinceOutlineMeshHeight,
  }, lineMaterial_province_outline, threeLayer);

  // if(directlyCity.map(v => v.adcode).includes(adcode)) {
  //   all_province_inline_mesh_top = [];
  // }
  all_province_inline_mesh_top = await getAllCityMeshByCode(adcode);
  all_province_inline_mesh_top.forEach(v => meshs.push(v));
  

  // mesh OutLine , lineWidth always 1px
  // province_outLine_mesh = new OutLine(province_mesh, {
  //   interactive: false,
  //   lineWidth: 2,
  // }, lineMaterial_province, threeLayer);

  
  meshs.push(province_mesh);
  meshs.push(province_outLine_mesh_top);
  meshs.push(province_outLine_mesh_buttom);
  meshs.push(province_outLine_mesh_height);

  threeLayer.addMesh(meshs);

  // mesh 突起动画
  {
    let time = 0;
    let timer = setInterval(() => {
      const scale = time / 40;
      // 
      province_mesh.getObject3d().scale.z = scale;
      // province_outLine_mesh.getObject3d().scale.z = scale;
      // 
      if(spec_citys.includes(adcode)) {
        province_outLine_mesh_top.setAltitude(provinceHeight * 1.2 * scale);
        all_province_inline_mesh_top.forEach(v => v.setAltitude(provinceHeight * 1.2 * scale));
      } else {
        province_outLine_mesh_top.setAltitude(provinceHeight * 1.05 * scale);
        all_province_inline_mesh_top.forEach(v => v.setAltitude(provinceHeight * 1.05 * scale));
      }
      // 
      province_outLine_mesh_height.getObject3d().scale.z = scale;

      if (time++ >= 40) {
        clearInterval(timer);
      };
    }, 50);
  }

  await sleep(2000);
  return Promise.resolve();
}

/*
  vue,
	cityList, 所有城市列表信息 
  to：{
		
	},
*/

// 三种数据类型 循环切换， 分别对应三种主题色
export const changeSceneType = async (_vue, curCityList, {
  type,
  colors,
  progressColor,
  themeTitle
}) => {
  // clearHistoryMarker()

  const cityList = curCityList.data;
  // console.log('changeSceneType');

  // update citymarker
  const name = cityList[0].areaName;
  const location = await getCityCenterByCode(cityList[0].parentCode);
  await updateCityMarker(name, location);
  // update css themeColor
  document.documentElement.style.setProperty('--themeColor', colors.main);
  // 
  marker_dom = document.querySelector('.city_marker');
  sceneTypes.forEach(v => marker_dom.classList.remove(v.dataType));
  marker_dom.classList.add(type.dataType);
  // update material color
  lineMaterial_china_outline.color.setStyle(colors.outline);
  lineMaterial_china_inline.color.setStyle(colors.inline);
  lineMaterial_province_inline.color.setStyle(colors.inline);
  lineMaterial_province.color.setStyle(colors.outline);
  lineMaterial_province_outline.color.setStyle(colors.outline);

  // update VuePage
  // 右侧 数据类型滚动、覆盖率比例更新、城市列表更新
  if (!first && willchangeScene) {
    _vue.progressStartColor = progressColor.startColor;
    _vue.progressStopColor = progressColor.stopColor;
    _vue.swiperType.slideNext(1000, false);
  }

  if (!first && willchangeScene) {
    _vue.themeTitle = themeTitle;
    _vue.cityCount = 0;
    _vue.cityTotal = +curCityList.totalCount;
    _vue.completedProgress = 0;

    await sleep(600);
    _vue.cityCount = +curCityList.count;
    _vue.cityTotal = +curCityList.totalCount;
    const percent = +(+curCityList.count / +curCityList.totalCount * 100).toFixed(0);
    _vue.completedProgress = percent;
  }
 
  // 右下角城市渐变
  if(!first && willchangeScene) {
    _vue.cityStyle = _vue.fadeIn;
    await sleep(0);
    _vue.resetCityList = false;
    // 城市列表
    _vue.curCityList = curCityList.data.map(v => {
      const area = (+v.totalArea / 1e6);
      return {
        name: v.areaName,
        area: +area.toFixed(2) == 0 ? +area.toFixed(3) : +area.toFixed(2),
      }
    });
    // 右下角城市渐变
    _vue.cityStyle = _vue.fadeOut;
    await sleep(0);
    _vue.resetCityList = true;
    await sleep(1000);
  }
}
// 
export const province2China = async (_vue, { adcode }) => {
  // console.log('province2China');
  // mesh 渐变下降
  {
    let time = 0;
    let timer = setInterval(() => {
      // 
      const scale = 1 - time / 40;
      province_mesh.getObject3d().scale.z = scale;
      // 
      // province_outLine_mesh.getObject3d().scale.z = scale;
      // 
      if(spec_citys.includes(adcode)) {
        province_outLine_mesh_top.setAltitude(provinceHeight * 1.2 * scale);
        all_province_inline_mesh_top.forEach(v => v.setAltitude(provinceHeight * 1.2 * scale));
      } else {
        province_outLine_mesh_top.setAltitude(provinceHeight * 1.05 * scale);
        all_province_inline_mesh_top.forEach(v => v.setAltitude(provinceHeight * 1.05 * scale));
      }
      // 
      province_outLine_mesh_height.getObject3d().scale.z = scale;

      if (time++ >= 40) {
        clearInterval(timer);
        // threeLayer.removeMesh(province_mesh);
        // threeLayer.removeMesh(province_outLine_mesh_top);
        // threeLayer.removeMesh(province_outLine_mesh_buttom);
        // threeLayer.removeMesh(province_outLine_mesh_height);

        if(threeLayer.getMeshes().length > 6) {
          for (let i = 0; i < 4; i++) {
            const m = threeLayer.getMeshes().pop();
            threeLayer.removeMesh(m);
          }
        }
        all_province_inline_mesh_top.forEach(v => threeLayer.removeMesh(v));
      };
    }, 50);
  };

  await sleep(2000);
  threeLayer.renderScene();
  // 更新图层透明效果
  {
    let time = 0;
    let timer = setInterval(() => {
      aisaImageLayer.setOpacity(time / 10);
      if (++time >= 10) {
        clearInterval(timer);
      }
    }, 100);
  }

  map.animateTo({
    center: chinaPos,
    zoom: 4.54,
    bearing: 0,
    pitch: 1,
  }, {
    duration: 1500
  });
  // marker 变小
  marker_dom = document.querySelector('.city_marker');
  marker_dom.classList.remove('big');
  // 边界呈现
  lineMaterial_china_outline.linewidth = china_outline_width;
  lineMaterial_china_inline.linewidth = 1;
  
  await sleep(1500);
  _vue.showSouthImage = true;
  await sleep(1000);
  
  return Promise.resolve();
}
// 
export const china2Province = async (_vue, {
  zoom,
  adcode,
  name,
  center,
  offset,
  offsetH,
  location
}) => {
  // console.log('china2Province');
  map.animateTo({
    // center: [center[0] + 4, center[1] + 0.7],
    center: [center[0] + (offset ? offset[0] : 4), center[1] + (offset ? offset[1] : 0.7)],
    zoom: zoom || 6.5,
    pitch: 20,
  }, {
    duration: 1500
  });
  // 
  _vue.showSouthImage = false;
  // 边界消失
  setTimeout(() => {
    lineMaterial_china_outline.linewidth = 0;
    lineMaterial_china_inline.linewidth = 0;
  }, 800);
  

  // 更新图层透明效果
  setTimeout(() => {
    let time = 0;
    let timer = setInterval(() => {
      aisaImageLayer.setOpacity( 1 - (time / 10));
      if (++time >= 10) {
        clearInterval(timer);
      }
    }, 100);
  }, 500);
   
  if(!first && !willchangeScene) {
    // 右侧城市 滚动
    _vue.swiperCityList.slideNext(1000, false);
    // 
    await updateCityMarker(name, location);
  }
  // marker 变大
  marker_dom = document.querySelector('.city_marker');
  !marker_dom.classList.contains('big') && marker_dom.classList.add('big');
  // 
  await addProvinceLayer({
    adcode,
    name,
    offsetH
  });
  return Promise.resolve();
}
// 
export const city2city = async (_vue, {
  maker: {
    name,
    location
  }
}) => {
  // console.log('city2city', name, location);
  // 右侧城市 滚动
  await updateCityMarker(name, location);
  // 
  marker_dom = document.querySelector('.city_marker');
  !marker_dom.classList.contains('big') && marker_dom.classList.add('big');
  // 
  _vue.swiperCityList.slideNext(1000, false);
  await sleep(3000);
  return Promise.resolve();
}

// 
function gen_history_marker(center) {
  return new maptalks.ui.UIMarker(center, {
    content: `<div class="history_marker"><span class="circle"></span><span class="circle1"></span><span class="circle2"></span></div>`
  });
}
// 
function initMarker() {
  city_marker = new maptalks.ui.UIMarker([0, 0], {
    'content': '<div class="city_marker"><div class="left"><span class="icon"></span><span class="circle1"></span><span class="circle2"></span></div><div class="right">北京市</div></div>'
  });
  
  city_marker.updateMarkerText = function updateMarkerText(cityName) {
    marker_dom = document.querySelector('.city_marker');
    const res = marker_dom.outerHTML.replace(
      /([\s\S]+<div class="right">)([\s\S]+)(<\/div><\/div>)/, 
      (s, s1,s2, s3) => {
        return s1 + cityName + s3;
      }
    );
    this.setContent(res);
  };
}
// 
async function updateCityMarker(label, [lon, lat]) {
  // debugger
  showHistoryMaker && showHistoryMaker();
  city_marker.updateMarkerText(label);
  // 更新位置
  const coord = new maptalks.Coordinate(lon, lat);
  city_marker.setCoordinates(coord);
  showHistoryMaker = addHistoryMakers(city_marker);
  await sleep(10);

  return Promise.resolve();
}

// 初始化一次 添加 china_mesh  china_outLine_mesh
function initChinaLayer() {
  // the ThreeLayer to draw buildings
  threeLayer = new maptalks.ThreeLayer('t1', {
    forceRenderOnMoving: true,
    forceRenderOnRotating: true,
    forceRenderOnZooming: true,
  });
  // animation();
  const meshs = [];

  threeLayer.prepareToDraw = function(gl, scene, camera) {
    // 
    // const light = new THREE.DirectionalLight(0xffffff);
    // light.position.set(0, -10, 10).normalize();
    // light.castShadow = true;
    // scene.add(light);
    // 
    const light = new THREE.AmbientLight(0xffffff, 1);
    light.position.set(88451.17372643555, 29155.32129677105, 75674.8725946847).normalize();
    scene.add(light);

    // camera.add(new THREE.DirectionalLight(0xffffff, 0.7));
    camera.add(new THREE.PointLight(0xffffff, 0.3));

    // 构建 china mesh // 添加一次  后面效果根据全局的 mesh对象 更改材质即可
    let china_features = china_geojson.features;
    const polygons_china = _gpf(china_features);
    china_mesh = threeLayer.toExtrudePolygons(polygons_china, {
      interactive: false,
      // topColor: '#fff',
      altitude: 1
    }, material);
    meshs.push(china_mesh);

    // china ouline mesh  // 添加一次  后面效果根据全局的 mesh对象 更改材质即可

    const geoLines = _polygonToLine(china_features[0]);
    const lineStrings = maptalks.GeoJSON.toGeometry(geoLines);
    china_outLine_mesh = threeLayer.toFatLines(lineStrings, {
      interactive: false,
    }, lineMaterial_china_outline);
    // 
    all_province_ouline_mesh = getAllProvinceMesh();
    all_province_ouline_mesh.forEach(v => meshs.push(v));
    // 
    meshs.push(china_outLine_mesh);
    threeLayer.addMesh(meshs);
    // debugger
  };
  threeLayer.addTo(map);
  threeLayer.config('animation', true);
}
async function clearHistoryMarkers() {
  history_markers.forEach(v => v.remove());
  history_markers = [];
  showHistoryMaker = null;
  await sleep(0);
  return Promise.resolve();
}
function addHistoryMakers(city_marker) {
  const old = {...city_marker};
  const history_marker = gen_history_marker([old._markerCoord.x, old._markerCoord.y]);
  history_markers.push(history_marker);
  function show() {
    history_marker.addTo(map).show();
  }
  show.history_markers = history_markers;
  return show;
}

function getAllProvinceMesh() {
  return getAllProvinceFeatures().map(v => {
    const geoLines = _polygonToLine(v);
    const lineStrings = maptalks.GeoJSON.toGeometry(geoLines);

    let province_outLine_mesh = threeLayer.toFatLines(lineStrings, {
      interactive: false,
      altitude: 10,
    }, lineMaterial_china_inline);

    return province_outLine_mesh;
  })
}

async function getAllCityMeshByCode(provinceCode) {
  const allCity = await getCityFeaturesByCode(provinceCode);
  return allCity.map(v => {
    const geoLines = _polygonToLine(v);
    const lineStrings = maptalks.GeoJSON.toGeometry(geoLines);

    let province_inline_mesh = threeLayer.toFatLines(lineStrings, {
      interactive: false,
      altitude: 100,
    }, lineMaterial_province_inline);

    return province_inline_mesh;
  })
}