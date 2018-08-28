import React, { Component } from 'react';
import st from './LocateMap.less';
import L from '../../common/leaflet.extends.js';

import Toolbar from './Toolbar.js';
import BaseLayerToggle from './BaseLayerToggle.js';
import icons from './icons.js';

const locateIcon = icons['icon-weizhi21'];

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
        center: center,
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
    });
    // 将定位图标添加到地图上
    if (x && y) {
      this.locateLayer = L.marker(center, { icon: locateIcon }).addTo(map);
    }

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

    this.locatePen = new L.Draw.Marker(map, { icon: locateIcon });

    this.locatePen.on(L.Draw.Event.CREATED, e => {
      this.clearlocateLayer();
      var { layer } = e;
      this.locateLayer = layer;
      layer.addTo(this.map);
    });
  }

  clearlocateLayer() {
    if (this.locateLayer) {
      this.locateLayer.remove();
    }
  }

  componentDidMount() {
    this.initMap();
    this.setState({ mapReady: true });
  }

  render() {
    let { mapReady } = this.state;
    return (
      <div className={st.LocateMap}>
        {mapReady ? (
          <Toolbar
            beforeTools={[
              {
                name: '门牌定位',
                icon: 'icon-dingwei',
                style: {},
                className: '',
                onClick: ((e, tb) => {
                  tb.disableMSTools();
                  if (this.locatePen._enabled) {
                    this.locatePen.disable();
                  } else {
                    this.locatePen.enable();
                  }
                }).bind(this),
              },
              {
                name: '保存定位',
                icon: 'icon-save',
                style: {},
                className: '',
                onClick: ((e, tb) => {
                  if (this.props.onSaveLocate) {
                    let { lat, lng } = this.locateLayer.getLatLng();
                    this.props.onSaveLocate(lat, lng);
                  }
                }).bind(this),
              },
            ]}
            map={this.map}
            className={st.toolbar}
          />
        ) : null}

        {mapReady ? <BaseLayerToggle map={this.map} type="vec" /> : null}
        <div ref={e => (this.mapDom = e)} className={st.map} />
      </div>
    );
  }
}

export default LocateMap;
