import { Component } from 'react';
import { Icon, Input, Button, Checkbox } from 'antd';
import st from './LocateMapTmp.less';
import { tk } from '../../common/leaflet.extends';
import icons from './icons.js';
import { getUser } from '../../utils/login';

const { locateRed, locateBlue, touchIcon } = icons;

class LocateMap2 extends Component {
  constructor(ps) {
    super(ps);
    let user = getUser();
    this.defaultCenter = user.centerAndZoom || {
      zoom: 12,
      center: [30.75, 120.75],
    };
  }

  state = {
    sqOn: true,
    showCDPanel: false,
    rows: [],
  };

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

  getBeforeButtons() {
    return this.getToolbar(this.props.beforeBtns);
  }

  getAfterButtons() {
    return this.getToolbar(this.props.afterBtns);
  }

  changeLayer(type) {
    let ac = 'active';
    let map = this.map;
    $(this.layerToggle)
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

  getToolbar(cfg) {
    return cfg
      ? cfg.map(i => {
        return (
          <span key={i.id} onClick={e => i.onClick(e, i, this)}>
            <span className={`iconfont ${i.icon}`} />
            {i.name}
          </span>
        );
      })
      : null;
  }

  toggleSQLayer(on) {
    if (!this.sqLayer) {
      this.sqLayer = L.esri.dynamicMapLayer({
        url: 'http://10.22.233.99:6080/arcgis/rest/services/201812SQMJYZBM/MapServer',
      });
    }

    if (on) {
      this.sqLayer.addTo(this.map);
    } else {
      this.sqLayer.remove();
    }
  }

  initMap() {
    let map = L.map(this.mapDom, {
      ...this.defaultCenter,
      attributionControl: false,
      zoomControl: false,
      crs: L.CRS.EPSG4490,
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
        position: 'topright',
      })
      .addTo(map);

    this.map = map;

    this.initBaseMap();
    this.initMapTools();

    let { sqOn } = this.state;
    this.toggleSQLayer(sqOn);
  }

  initBaseMap() {
    let { baseLayerType } = this.props;
    let type = baseLayerType;
    type = type || 'vec';

    let self = this;
    $(this.layerToggle)
      .find('>div')
      .on('click', function () {
        let type = $(this).data('type');
        self.changeLayer(type);
      });

    this.changeLayer(type);
  }

  initMapTools() {
    let map = this.map;
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
      icon: touchIcon,
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
      icon: touchIcon,
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

    let msCoordinates = new L.Draw.Marker(map, { icon: locateBlue });
    msCoordinates.on(L.Draw.Event.CREATED, e => {
      this.clearCoordinatesLayer();
      var { layer } = e;
      this.coordinatesLayer = layer;

      var latlngs = layer.getLatLng();
      let { lat, lng } = latlngs;

      this.coordinatesLayer
        .bindPopup(
          `<div class='coordinatestooltip'><input type="text" value="[${lng.toFixed(
            6
          )},${lat.toFixed(6)}]"/></div>`
        )
        .addTo(this.map)
        .openPopup();
    });
    this.msCoordinates = msCoordinates;
  }

  locate() {
    let { lat, lng } = this;
    if (lat && lng) {
      this.clearLocateLayer();
      let pnt = [lat, lng];
      this.locateLayer = L.marker(pnt, { icon: locateRed }).addTo(this.map);
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
    let { onMapClear } = this.props;
    onMapClear && onMapClear(this);
  }

  getLayerToggle() {
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

  search(e) {
    if (e) {
      e = e.trim();
      // $.post(
      //   baseUrl + '/POI/GetPOIPosition',
      //   { pageSize: 50, pageNum: 1, name: e },
      //   e => {
      //     let er = e.ErrorMessage;
      //     if (er) {
      //       alert(er);
      //     } else {
      //       let data = e.Data.Data;
      //       this.setState({ rows: data });
      //     }
      //   },
      //   'json'
      // );
      this.getPOIs({ keyword: e });
    }
  }

  getPOIs({ keyword, level, bound, count, start }) {
    bound =
      bound ||
      "120.62984295278005,30.659035585372795,120.8385209784187,30.840278537796838";
    let url = `http://api.tianditu.gov.cn/search?postStr={"keyWord":"${keyword}","level":"${level ||
      16}","mapBound":"${bound}","bound":"${bound}","queryType":"2","count":"${count ||
      50}","start":"${start || 0}"}&type=query&tk=${tk}`;

    $.get(
      url,
      null,
      e => {
        let rows = (e.pois || []).map(x => {
          if (x.lonlat) {
            let ss = x.lonlat.split(" ");
            let lat = parseFloat(ss[1]),
              lng = parseFloat(ss[0]);
            x.lat = lat;
            x.lng = lng;
            x.point = [lng, lat];
            x.point1 = [lat, lng];
          }
          return x;
        });
        this.setState({ rows });
      },
      'json'
    );
  }

  componentDidMount() {
    this.initMap();
    let { onMapReady } = this.props;
    onMapReady && onMapReady(this);
  }

  locatePOI(i) {
    if (this.poi) this.poi.remove();
    this.poi = L.marker(i.point1)
      .bindPopup(
        `<div class="ct-popup"><div>${i.name}</div><div><input type="text" value="[${i.lng},${
        i.lat
        }]"/></div></div>`
      )
      // .bindTooltip(i.NAME, { permanent: true, direction: 'top', offset: [0, -15] })
      .addTo(this.map);
    this.map.setView(i.point1, 18);
    this.poi.openPopup();
  }

  render() {
    let { showCDPanel, rows, sqOn } = this.state;

    return (
      <div className={st.locatemaptmp}>
        <div className={st.search}>
          <Input.Search
            placeholder="请输入关键字"
            onSearch={value => this.search(value)}
            style={{ width: 260 }}
          />
          {rows && rows.length ? (
            <div className={st.results}>
              {rows.map(i => {
                return <div onClick={e => this.locatePOI(i)}>{i.name}</div>;
              })}
            </div>
          ) : null}
        </div>
        <div className={st.layers}>
          <Checkbox
            checked={sqOn}
            onChange={e => {
              let on = e.target.checked;
              this.setState({ sqOn: on });
              this.toggleSQLayer(on);
            }}
          >
            社区
          </Checkbox>
        </div>
        <div ref={e => (this.mapDom = e)} className={st.map} />
        <div ref={e => (this.toolbar = e)} className={st.toolbar}>
          {this.getBeforeButtons()}
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
          {this.getAfterButtons()}
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
        <div ref={e => (this.layerToggle = e)} className={st.layerptoggle}>
          {this.getLayerToggle()}
        </div>
      </div>
    );
  }
}

export default LocateMap2;
