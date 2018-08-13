import React, { Component } from 'react';
import { Input, Form, Icon, Row, Col, Button } from 'antd';
import st from './Toolbar.less';

class Toolbar extends Component {
  constructor(ps) {
    super(ps);
    this.map = ps.map;
  }
  lat = 30.75;
  lng = 120.75;
  state = {
    showCDPanel: false,
  };

  icon0 = L.divIcon({
    className: 'div-icon0',
    iconSize: [25, 36],
    iconAnchor: [13, 32],
    popupAnchor: [0, -35],
    tooltipAnchor: [0, -35],
  });

  icon1 = L.divIcon({
    className: 'div-icon1',
    iconSize: [25, 36],
    iconAnchor: [13, 32],
    popupAnchor: [0, -35],
    tooltipAnchor: [0, -35],
  });

  touchIcon = L.divIcon({
    iconSize: [16, 16],
    className: 'ct-touchicon',
  });

  getCoordinatesOn = false;

  initMapTools() {
    let { map } = this.props;
    let touchIcon = touchIcon;
    let msArea = new L.Draw.Polygon(map, {
      showArea: true,
      feet: false,
      // allowIntersection 必须为false才能显示面积
      allowIntersection: false,
      shapeOptions: {
        stroke: true,
        color: 'red',
        weight: 4,
        opacity: 0.5,
        fill: true,
        clickable: true,
      },
      icon: this.touchIcon,
    });

    msArea.on(
      L.Draw.Event.CREATED,
      (e => {
        this.clearMeasureAreaLayer();
        var { layer } = e;
        this.measureAreaLayer = layer;
        var dom = document.createElement('div');
        var latlngs = layer.getLatLngs()[0];
        var area = L.GeometryUtil.geodesicArea(latlngs);
        var text = L.GeometryUtil.readableArea(area, true);

        ReactDOM.render(
          <div>
            总面积：<span>{text}</span>
            <Icon type="close-square-o" onClick={e => this.clearMeasureAreaLayer()} />
          </div>,
          dom
        );

        layer
          .bindTooltip(dom, {
            permanent: true,
            interactive: true,
            direction: 'right',
            className: 'measuretooltip',
          })
          .addTo(this.map)
          .openTooltip(latlngs[0]);
      }).bind(this)
    );
    this.msArea = msArea;

    let msLength = new L.Draw.Polyline(map, {
      shapeOptions: {
        stroke: true,
        color: 'red',
        weight: 4,
        opacity: 0.5,
        fill: false,
        clickable: true,
      },
      icon: this.touchIcon,
    });

    msLength.on(
      L.Draw.Event.CREATED,
      (e => {
        this.clearMeasureLengthLayer();
        var { layer } = e;
        this.measureLengthLayer = layer;

        var dom = document.createElement('div');
        var latlngs = layer.getLatLngs();
        var distance = 0;
        for (let i = 0, j = latlngs.length - 1; i < j; i++) {
          let p1 = latlngs[i],
            p2 = latlngs[i + 1];
          distance += this.map.distance(p1, p2);
        }

        var text = L.GeometryUtil.readableDistance(distance, true, false, false, 2);

        ReactDOM.render(
          <div>
            总长度：<span>{text}</span>
            <Icon type="close-square-o" onClick={e => this.clearMeasureLengthLayer()} />
          </div>,
          dom
        );

        layer
          .bindTooltip(dom, {
            permanent: true,
            interactive: true,
            direction: 'right',
            className: 'measuretooltip',
          })
          .addTo(this.map)
          .openTooltip(latlngs[latlngs.length - 1]);
      }).bind(this)
    );
    this.msLength = msLength;

    let msCoordinates = new L.Draw.Marker(map, { icon: this.icon1 });
    msCoordinates.on(L.Draw.Event.CREATED, e => {
      this.clearCoordinatesLayer();
      var { layer } = e;
      this.coordinatesLayer = layer;

      var latlngs = layer.getLatLng();
      let { lat, lng } = latlngs;

      this.coordinatesLayer
        .bindTooltip(
          `<div class='coordinatestooltip'> ( 经度 : ${lng.toFixed(6)} , 纬度 : ${lat.toFixed(
            6
          )} ) </div>`,
          {
            direction: 'top',
            permanent: true,
            interactive: true,
          }
        )
        .addTo(this.map);
    });
    this.msCoordinates = msCoordinates;
  }

  locate() {
    let { lat, lng } = this;
    if (lat && lng) {
      this.clearLocateLayer();
      let pnt = [lat, lng];
      this.locateLayer = L.marker(pnt, { icon: this.icon0 }).addTo(this.map);
      this.map.setView(pnt);
    }
  }

  clearLocateLayer() {
    if (this.locateLayer) {
      this.locateLayer.remove();
    }
  }

  clearCoordinatesLayer() {
    if (this.coordinatesLayer) {
      this.coordinatesLayer.remove();
    }
  }

  clearMeasureLengthLayer() {
    if (this.measureLengthLayer) {
      this.measureLengthLayer.remove();
    }
  }

  clearMeasureAreaLayer() {
    if (this.measureAreaLayer) {
      this.measureAreaLayer.remove();
    }
  }

  activeMSLength() {
    this.disableMSTools();
    this.msLength.enable();
  }

  activeMSArea() {
    this.disableMSTools();
    this.msArea.enable();
  }

  disableMSTools() {
    this.msArea.disable();
    this.msLength.disable();
    this.msCoordinates.disable();
  }

  activeMSCoordinates() {
    this.disableMSTools();
    this.msCoordinates.enable();
  }

  clearMap() {
    this.clearMeasureAreaLayer();
    this.clearMeasureLengthLayer();
    this.clearCoordinatesLayer();
    this.clearLocateLayer();
    let { onClear } = this.props;
    if (onClear) {
      onClear();
    }
  }

  componentDidMount() {
    let { map } = this.props;
    window.map = map;
    if (map) {
      this.initMapTools();
    }
  }

  render() {
    let { className } = this.props;
    let { showCDPanel } = this.state;
    return (
      <div className={st.Toolbar + ' ' + (className ? className : '')}>
        <span
          onClick={e => {
            if (this.msCoordinates._enabled) {
              this.disableMSTools();
            } else {
              this.activeMSCoordinates();
            }
          }}
        >
          <span className="iconfont icon-zuobiao" />
          获取坐标
        </span>
        <span onClick={e => this.setState({ showCDPanel: !this.state.showCDPanel })}>
          <span className="iconfont icon-location" />
          坐标定位
        </span>
        <span
          onClick={e => {
            if (this.msLength._enabled) {
              this.disableMSTools();
            } else {
              this.activeMSLength();
            }
          }}
        >
          <span className="iconfont icon-changduceliang" />
          测距离
        </span>
        <span
          onClick={e => {
            if (this.msArea._enabled) {
              this.disableMSTools();
            } else {
              this.activeMSArea();
            }
          }}
        >
          <span className="iconfont icon-mianji" />
          测面积
        </span>
        <span
          onClick={e => {
            this.clearMap();
          }}
        >
          <span className="iconfont icon-qingchu" />
          清除
        </span>
        <div className={st.coordinates + (showCDPanel ? ' active' : '')}>
          <Input
            addonBefore="经度"
            defaultValue={this.lng}
            onChange={e => (this.lng = e.target.value)}
            type="number"
            placeholder="经度"
            style={{ width: 140 }}
          />
          &ensp;
          <Input
            addonBefore="维度"
            defaultValue={this.lat}
            onChange={e => (this.lat = e.target.value)}
            type="number"
            placeholder="维度"
            style={{ width: 140 }}
          />
          &emsp;
          <Button onClick={e => this.locate()} type="primary">
            确定
          </Button>
          &ensp;
          <Button onClick={e => this.clearLocateLayer()}>清除</Button>
          &ensp;
          <Icon type="close-circle" onClick={e => this.setState({ showCDPanel: false })} />
        </div>
      </div>
    );
  }
}

export default Toolbar;
