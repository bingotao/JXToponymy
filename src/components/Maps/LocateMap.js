import React, { Component } from 'react';
import st from './LocateMap.less';
import L from '../../common/leaflet.extends.js';

import Toolbar from './Toolbar.js';

class LocateMap extends Component {
  state = {
    mapReady: false,
  };

  initMap() {
    let { x, y } = this.props;
    let opts = null,
      center = null;
    if (x && y) {
      center = [y, x];
      opts = {
        center: [y, x],
        zoom: 18,
      };
    } else {
      opts = {
        center: [30.75, 120.75],
        zoom: 13,
      };
    }

    let map = L.map(this.mapDom, {
      ...opts,
      attributionControl: false,
      zoomControl: false,
      crs: L.CRS.EPSG4490,
      layers: [L.tileLayer.TDTJX({ type: 'vec' }), L.tileLayer.TDTJX({ type: 'vec_anno' })],
    });

    L.control
      .scale({
        position: 'bottomleft',
        imperial: false,
      })
      .addTo(map);
    L.control
      .zoom({
        zoomInTitle: '放大',
        zoomOutTitle: '缩小',
        position: 'bottomright',
      })
      .addTo(map);

    this.map = map;
  }

  componentDidMount() {
    this.initMap();
    this.setState({ mapReady: true });
  }

  render() {
    let { mapReady } = this.state;
    return (
      <div className={st.LocateMap}>
        {mapReady ? <Toolbar map={this.map} className={st.toolbar} /> : null}
        <div ref={e => (this.mapDom = e)} className={st.map} />
      </div>
    );
  }
}

export default LocateMap;
