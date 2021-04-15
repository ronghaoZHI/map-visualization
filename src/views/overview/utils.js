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
export const getLineMaterial = (color = '#6166F9') => {
  const lineMaterial = new THREE.LineBasicMaterial({
    color, // 线的颜色
    transparent: true,
    linewidth: 1,
    opacity: .8,
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
  map地图数据 data_map3d #6166F9
	采集数据 data_capture  #4BA0FA
	三维数据 data_3d  #F4BB28
 */
export const themeColor = {
  'data_map3d': '#6166F9',
  'data_capture': '#4BA0FA',
  'data_3d': '#F4BB28',
}
export const sceneTypes = Object.keys(themeColor);
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