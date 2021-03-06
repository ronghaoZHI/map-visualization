const THREE = window.THREE;
const maptalks = window.maptalks;
const _districtService = new window.AMap.DistrictSearch({
  subdistrict: 1,
  showbiz: false,
  level: 'city',
  // extensions: 'all'
});

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
export const getLineMaterial = ({color = '#7172FF', opacity = 1.0, linewidth = 1}) => {
  const lineMaterial = new THREE.LineBasicMaterial({
    color, // 线的颜色
    transparent: false,
    linewidth,
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
export const getLineMaterial2 = ({color = '#7172FF', opacity = 1.0, linewidth = 3}) => {
  const lineMaterial = new THREE.LineMaterial({
    color, // 线的颜色
    transparent: false,
    linewidth,
    opacity,
    // depthTest: true,
  });
  //解决z-flighting
  // lineMaterial.polygonOffset = true;
  lineMaterial.depthTest = true;
  // lineMaterial.polygonOffsetFactor = 1;
  // lineMaterial.polygonOffsetUnits = 1.0;

  return lineMaterial;
}
//
export const getPolygonsByFeatures = (features, height = 0) => {
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
  'data_map3d': {
    main: '#7172FF',
    outline: '#999CEB',
    inline: '#55589f'
  },
  'data_capture': {
    main: '#4BA0FA',
    outline: '#81b9f4',
    inline: '#48729e'
  },
  'data_3d': {
    main: '#F4BB28',
    outline: '#fbd300',
    inline: '#8a7500'
  },
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
    stopColor: '#4BA0FA',
    startColor: '#03CCA4'
  }, {
    stopColor: '#F4BB28',
    startColor: '#FF6F00'
  }
];
// id 用于服务端查询服务类型标识
export const sceneTypes = [{dataType: 'data_map3d', id:'13'}]
// Object.keys(themeColor).map((v, i) => {
//   return {
//     dataType: v,
//     id: i == 0 ?
//       '13' :
//       i == 1 ?
//       '1' : '12',
//   }
// });
//
export const directlyCity = [
  {
    adcode: '110000',
    name: '北京市',
  }, {
    adcode: '120000',
    name: '天津市',
  }, {
    adcode: '310000',
    nmae: '上海市',
  }, {
    adcode: '500000',
    name: '重庆市',
  }
];
//
import {
  allProvince_geojson
} from '@/assets/data/province1';

export const getFeaturesByCode = (adcode, name) =>
  [allProvince_geojson.features.find(v =>
    (v.properties.adcode == adcode || v.properties.name == name)
  )];
//
export const getAllProvinceFeatures = () =>
  allProvince_geojson.features;
//
export const sleep = (time) => {
  return new Promise(res => {
    setTimeout(res, time);
  });
};

// import { getCityCount, getCityList, getAllDataArea } from '../../api/index';

export const getAllCityList = async () => {
  const len = sceneTypes.length;
  // by api
  // const cityLists = sceneTypes.map(v => getCityList({ dataType: v.id }));
  // const cityCounts = sceneTypes.map(v => getCityCount({ dataType: v.id }));
  // const { data: allDataArea } = await getAllDataArea();
  // by json
  const cityLists = [require('../../api/all-citylist.json')]
  const cityCounts= [{"code":200,"msg":"成功","data":{"count":19,"totalCount":369}}]
  const { data: allDataArea } = require('../../api/all-dataarea.json')
  const areaTotals = [
    allDataArea.publishedMapArea.totalArea,
    allDataArea.originalArea.totalArea,
    allDataArea.outcome3DArea.totalArea,
  ]
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
        areaTotal: areaTotals[i],
        data: result[i].data ,
        ...v.data,
        dataType: sceneTypes[i].dataType
      }
    });
    result = result.map(v => {
      v.data = v.data.map(item => {
        return {
          ...item,
          geojson: getFeaturesByCode(item.parentCode == 100000 ? item.areaCode : item.parentCode)[0]
        }
      });

      return v;
    })
  } catch (error) {
    console.error(error);
  }

  return Promise.resolve(result);
}

export const getCityCenterByCode = async (code) => {
  return new Promise((res, rej) => {
    _districtService.search(code, (status, result) => {
      if(status === 'complete') {
        // console.log(code, result);
        const r = result.districtList[0];
        res([r.center.lng, r.center.lat]);
      } else {
        rej(result);
      }
    });
  });
}

export const getCityFeaturesByCode = async (provinceCode) => {
  const res = await fetch('/data/' + provinceCode + '.json');
  const r = await res.json();
  return r.features;
}
