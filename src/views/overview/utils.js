let THREE = window.THREE;
let maptalks = window.maptalks
// 
export const getMeshPhongMaterial = (color) => {
  const material = new THREE.MeshPhongMaterial({
    // map: texture,
    transparent: true,
    color,
  });

  material.vertexColors = THREE.VertexColors;
  return material;
}

// 
export const getLineMaterial = ({color = '#7172FF', opacity}) => {
  const lineMaterial = new THREE.LineBasicMaterial({
    color, // 线的颜色
    transparent: true,
    linewidth: 10,
    opacity,
    depthTest: true,
  });
  //解决z-flighting
  lineMaterial.polygonOffset = true;
  lineMaterial.depthTest = true;
  lineMaterial.polygonOffsetFactor = 1;
  lineMaterial.polygonOffsetUnits = 1.0;

  return lineMaterial;
}

// 
export const getPolygonsByFeatures = (features, height = 10) => {
  const polygons = features.map(f => {
    const polygon = maptalks.GeoJSON.toGeometry(f);
    polygon.setProperties({
      height,
    });
    return polygon;
  });
  return polygons;
}

/**
  map地图数据 data_map3d #7172FF
	采集数据 data_capture  #1980FF
	三维数据 data_3d  #F4BB28
 */
export const themeColor = {
  'data_map3d': '#7172FF',
  'data_capture': '#1980FF',
  'data_3d': '#F4BB28',
};
export const themeTitle = [
  'map地图',
  '数据采集',
  '三维数据'
]
export const progressColor = [
  {
    stopColor: '#7172FF',
    startColor: '#B360FF'
  }, {
    stopColor: '#1980FF',
    startColor: '#03CCA4'
  }, {
    stopColor: '#F4BB28',
    startColor: '#FF6F00'
  }
];

export const sceneTypes = Object.keys(themeColor).map((v, i) => {
  return {
    dataType: v,
    id: i == 0 ?
      '13' : 
      i == 1 ? 
      '1' : '12',
  }
});
// 
export const directlyCity = ['北京市', '天津市', '上海市', '重庆市'];
// 
import {
  allProvince_geojson
} from '@/assets/data/province';

export const getFeaturesByCode = (adcode, name) => 
  [allProvince_geojson.features.find(v => 
    (v.properties.adcode == adcode || v.properties.name == name)
  )];
//
export const sleep = (time) => {
  return new Promise(res => {
    setTimeout(res, time);
  });
};

import { getCityCount, getCityList } from '../../api/index';

export const getAllCityList = async () => {
  const len = sceneTypes.length;
  const cityLists = sceneTypes.map(v => getCityList({ dataType: v.id }));
  const cityCounts = sceneTypes.map(v => getCityCount({ dataType: v.id }));
  let res = [];
  let result = [];
  try {
    res = await Promise.all([...cityLists, ...cityCounts]);

    result = res.slice(0, len).map((v) => {
      return {
        data: v.data,
      }
    });
    result = res.slice(len).map((v, i) => {
      return {
        data: result[i].data ,
        ...v.data,
        dataType: sceneTypes[i].dataType
      }
    });
    result = result.map(v => {
      v.data = v.data.map(item => {
        return {
          ...item,
          geojosn: getFeaturesByCode(item.parentCode == 100000 ? item.areaCode : item.parentCode)[0]
        }
      });

      return v;
    })
  } catch (error) {
    console.error(error);   
  }

  console.log(result);
  return Promise.resolve(result);
}