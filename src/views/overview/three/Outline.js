/* eslint-disable */
const maptalks = window.maptalks;
const THREE = window.THREE;
// import { LineSegments2 } from './LineSegments2';

export default class OutLine extends maptalks.BaseObject {
  constructor(mesh, options, material, layer) {
    options = maptalks.Util.extend({}, {
      altitude: 0
    }, options, {
      layer
    });
    super();
    //Initialize internal configuration
    // https://github.com/maptalks/maptalks.three/blob/1e45f5238f500225ada1deb09b8bab18c1b52cf2/src/BaseObject.js#L135
    this._initOptions(options);

    const edges = new THREE.EdgesGeometry(mesh.getObject3d().geometry, 1);
    const lineS = new THREE.LineSegments(edges, material);

    // const lineS = new LineSegments2(edges, material);
    this._createGroup();
    this.getObject3d().add(lineS);
    //Initialize internal object3d
    // https://github.com/maptalks/maptalks.three/blob/1e45f5238f500225ada1deb09b8bab18c1b52cf2/src/BaseObject.js#L140

    //set object3d position
    this.getObject3d().position.copy(mesh.getObject3d().position);
  }
}