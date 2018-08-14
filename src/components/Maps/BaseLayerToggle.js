import React, { Component } from 'react';
import L from '../../common/leaflet.extends.js';

import st from './BaseLayerToggle.less';

class BaseLayerToggle extends Component {
  baseLayers = {
    vec: {
      name: '地图',
      type: 'vec',
      layer: L.layerGroup([
        L.tileLayer.TDTJX({ type: 'vec' }),
        L.tileLayer.TDTJX({ type: 'vec_anno' }),
      ]),
    },
    img: {
      type: 'img',
      name: '影像',
      layer: L.layerGroup([
        L.tileLayer.TDTJX({ type: 'img' }),
        L.tileLayer.TDTJX({ type: 'img_anno' }),
      ]),
    },
  };

  changeLayer(type) {
    let ac = 'active';
    let { map } = this.props;
    $(this.root)
      .find('.' + type)
      .removeClass(ac)
      .siblings()
      .addClass(ac);

    if (type === 'vec') {
      this.baseLayers.img.layer.remove();
      this.baseLayers.vec.layer.addTo(map);
    } else {
      this.baseLayers.vec.layer.remove();
      this.baseLayers.img.layer.addTo(map);
    }
  }

  componentDidMount() {
    let { type } = this.props;
    type = type || 'vec';

    let zhis = this;
    $(this.root)
      .find('>div')
      .on('click', function() {
        let type = $(this).data('type');
        zhis.changeLayer(type);
      });

    this.changeLayer(type);
  }

  getUI() {
    let cmp = [];
    for (let i in this.baseLayers) {
      let e = this.baseLayers[i];
      cmp.push(
        <div className={e.type} data-type={e.type}>
          <div>{e.name}</div>
        </div>
      );
    }
    return cmp;
  }

  render() {
    let { className } = this.props;

    return (
      <div
        ref={e => (this.root = e)}
        className={st.BaseLayerToggle + ' ' + (className ? className : '')}
      >
        {this.getUI()}
      </div>
    );
  }
}

export default BaseLayerToggle;
