import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Divider, Pagination, Input, message, Popconfirm } from 'antd';
import st from './Map.less';
import L from '../../../common/leaflet.extends.js';

const Search = Input.Search;

class Map extends Component {
  constructor(ps) {
    super(ps);
    this.Data = this.props.pointPosition;
    this.MPType = this.props.MPType;//门牌类型 ZZ DL NC
    this.MPState = this.props.MPState;//状态 watch edit search
  }
  state = {
    baseMapType: 'vec',
    isGetCRS: false,
    roadDatas: null,
    pageSize: 10,
    totalCount_road: 0,
    currentPageNum: 1,
    roadID: this.props.pointPosition.RoadID,
    roadName: this.props.pointPosition.RoadName,
    roadNameInput: this.props.pointPosition.RoadName,
  };

  componentDidMount() {
    this.initBaseMaps();
    this.initMap();

    const Data = this.Data;
    if (Data) {
      var dom = document.createElement('div');
      ReactDOM.render(
        <div className={st.popup}>
          <div><span className={st.popuptitle}>标准地址：</span><span className={st.popupcontent}>{Data.StandardAddress}</span></div>
          <Divider />
          <div><span className={st.popuptitle}>产权人：</span><span className={st.popupcontent}>{Data.PropertyOwner}</span></div>
          <Divider />
          <div><span className={st.popuptitle}>申请人：</span><span className={st.popupcontent}>{Data.Applicant}</span></div>
          <Divider />
          <div><span className={st.popuptitle}>编制日期：</span><span className={st.popupcontent}>{Data.CreateTime}</span></div>
        </div>, dom);
      this.pointDom = dom;

      if (Data.Lat != null && Data.Lng != null) {
        let pointLayerGroup = L.layerGroup([], { pane: 'pointlayerspane' }).addTo(this.map);
        this.pointLayerGroup = pointLayerGroup;
        L.marker([Data.Lat, Data.Lng], {
          icon: L.divIcon({
            className: `ct-point-${this.MPType}-divicon`,
            iconSize: [20, 20],
          }),
        }).addTo(pointLayerGroup).bindPopup(dom).openPopup();
        this.map.setView(L.latLng(Data.Lat, Data.Lng), 20);
      }
    }
    if (this.MPState == 'search') {
      if (this.state.roadName) {
        this.SearchRoadByID();
      } else {
        this.SearchRoads(this.state.pageSize, 1);
      }
    }
    let roadLayerGroup = L.layerGroup([], { pane: 'roadlayerspane' }).addTo(this.map);
    this.roadLayerGroup = roadLayerGroup;
  }

  initBaseMaps = () => {
    var vec = L.tileLayer.TDTJX({ type: 'vec' });
    var vec_anno = L.tileLayer.TDTJX({ type: 'vec_anno' });

    var img = L.tileLayer.TDTJX({ type: 'img' });
    var img_anno = L.tileLayer.TDTJX({ type: 'img_anno' });

    var vecGroup = L.layerGroup([vec, vec_anno]);
    var imgGroup = L.layerGroup([img, img_anno]);
    this.baseMaps = {
      // vec: L.tileLayer.tdtgj_vec(),
      // img: L.tileLayer.tdtgj_img(),
      vec: vecGroup,
      img: imgGroup,
    };
  };

  changeBaseMap = (baseMapType) => {
    if (!this.baseMaps) this.initBaseMaps();
    baseMapType = baseMapType || 'vec';
    const oType = baseMapType === 'vec' ? 'img' : 'vec';
    this.baseMaps[oType].remove();
    this.baseMaps[baseMapType].addTo(this.map);
    this.setState({ baseMapType });
  }

  showMeasureResult(layer) {
    var content = this.getMeasureContent(layer);
    var $dom = $('<div class="measure-label">' + content + '<span class="iconfont icon-changyonggoupiaorenshanchu"></span></div>');
    $dom.data('layer', layer).find('.iconfont').click(function () {
      var $this = $(this);
      $this.parent().data('layer').remove();
    });
    this.drawGroup.addLayer(layer);
    var centerMapPoint = layer.getCenter();
    var points = layer.getLatLngs();
    if (layer instanceof L.Polygon) {
      var ring = points[points.length - 1];
      var lastMapPoint = ring[ring.length - 1];
    } else if (layer instanceof L.Polyline) {
      var lastMapPoint = points[points.length - 1];
    } else { return }
    if (content !== null) {
      var tooltip = layer.bindTooltip($dom[0], { direction: 'right', permanent: true, interactive: true });
      tooltip.openTooltip(lastMapPoint);
    }
  }
  getMeasureContent(layer) {
    if (layer instanceof L.Polygon) {
      var latlngs = layer._defaultShape ? layer._defaultShape() : layer.getLatLngs(),
        area = L.GeometryUtil.geodesicArea(latlngs);
      return "面积: " + L.GeometryUtil.readableArea(area, true);
    } else if (layer instanceof L.Polyline) {
      var latlngs = layer._defaultShape ? layer._defaultShape() : layer.getLatLngs(),
        distance = 0;
      if (latlngs.length < 2) {
        return "长度: N/A";
      } else {
        for (var i = 0; i < latlngs.length - 1; i++) {
          distance += latlngs[i].distanceTo(latlngs[i + 1]);
        }
        return "长度: " + L.GeometryUtil.readableDistance(distance, true);
      }
    }
    return null;
  };

  initMap = () => {
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
      crs: L.CRS.EPSG4490,
    }).setView([30.75, 120.75], 14);
    this.map = map;
    this.changeBaseMap(this.state.baseMapType);

    let drawGroup = L.layerGroup([], { pane: 'layerspane' }).addTo(map);
    this.drawGroup = drawGroup;

    /* 绘制 Marker */
    this.drawMarker = new L.Draw.Marker(map, {
      icon: L.divIcon({
        className: `ct-point-${this.MPType}-divicon`,
        iconSize: [20, 20],
      }),
    });

    var cThis = this;
    this.drawMarker.on(L.Draw.Event.CREATED, e => {
      cThis.clearLayers();
      if (!cThis.state.isGetCRS) {
        cThis.pointLayerGroup.clearLayers();
        e.layer.addTo(cThis.pointLayerGroup).bindPopup(cThis.pointDom).openPopup();
      }
      else {
        var dom = document.createElement('div');
        ReactDOM.render(
          <div className={st.popup} style={{ paddingLeft: 20 }}>
            <div><span className={st.popuptitle}>经度：</span><span className={st.popupcontent}>{(e.layer._latlng.lng).toFixed(4)}</span></div>
            <Divider />
            <div><span className={st.popuptitle}>纬度：</span><span className={st.popupcontent}>{(e.layer._latlng.lat).toFixed(4)}</span></div>
          </div>, dom);
        e.layer.addTo(drawGroup).bindPopup(dom).openPopup();
      }
    });

    /* 绘制 Polyline */
    this.drawPolyline = new L.Draw.Polyline(map, {
      icon: new L.DivIcon({
        iconSize: new L.Point(15, 15),
        className: 'line-icon',
      }),
      touchIcon: new L.DivIcon({
        iconSize: new L.Point(15, 15),
        className: 'line-touchicon',
      }),
      shapeOptions: {
        stroke: true,
        color: 'red',
        weight: 4,
        opacity: 0.5,
        fill: false,
        clickable: true,
      },
    });
    this.drawPolyline.on(L.Draw.Event.CREATED, e => {
      cThis.clearLayers();
      cThis.showMeasureResult(e.layer);
    });

    /* 绘制 Polygon */
    this.drawPolygon = new L.Draw.Polygon(map, {
      icon: new L.DivIcon({
        iconSize: new L.Point(15, 15),
        className: 'line-icon',
      }),
      touchIcon: new L.DivIcon({
        iconSize: new L.Point(15, 15),
        className: 'line-touchicon',
      }),
      allowIntersection: false,
      showArea: true,
      showLength: true,
      shapeOptions: {
        stroke: true,
        color: 'red',
        weight: 4,
        opacity: 0.5,
        fill: true,
        fillColor: null,
        fillOpacity: 0.2,
        clickable: true,
      },
    });
    this.drawPolygon.on(L.Draw.Event.CREATED, e => {
      cThis.clearLayers();
      cThis.showMeasureResult(e.layer);
    });

    this.drawTools = {
      marker: this.drawMarker,
      polyline: this.drawPolyline,
      Polygon: this.drawPolygon,
    };
  }

  disableDrawTools = () => {
    for (let i in this.drawTools) {
      this.drawTools[i].disable();
    }
  }

  enableDrawPoint = () => {
    this.disableDrawTools();
    if (!this.state.isGetCRS) {
      this.drawMarker.setOptions({
        icon: L.divIcon({
          className: `ct-point-${this.MPType}-divicon`,
          iconSize: [20, 20],
        }),
      });
    }
    else {
      this.drawMarker.setOptions({
        icon: L.divIcon({
          className: `ct-point-crs-divicon`,
          iconSize: [15, 15],
        }),
      });
    }
    this.drawMarker.enable();
  }

  enableDrawPolyline = () => {
    this.disableDrawTools();
    this.drawPolyline.enable();
  }

  enableDrawPolygon = () => {
    this.disableDrawTools();
    this.drawPolygon.enable();
  }

  clearLayers = () => {
    this.drawGroup.clearLayers();
  }

  getRoadContents = () => {
    this.doms = [];
    if (this.state.roadDatas) {
      this.state.roadDatas.forEach(road => {
        this.doms.push(
          <div key={road.RoadID} className='road' onClick={(e) => {
            this.setState({ roadID: road.RoadID, roadName: road.RoadName });
            $('.content').find('div').removeClass('active');
            $(e.currentTarget).addClass('active');
            this.roadLayerGroup.clearLayers();
            L.geoJSON($.parseJSON(road.RoadGeomStr), {
              style: function (feature) {
                return { color: 'red' };
              },
            }).addTo(this.roadLayerGroup);
            var bbox = $.parseJSON(road.RoadGeomStr).bbox;
            var corner1 = L.latLng(bbox[0], bbox[1]),
              corner2 = L.latLng(bbox[2], bbox[3]);
            this.map.fitBounds([corner1, corner2]);
          }}>
            <div className='roadName'>{road.RoadName}</div>
            <span>市辖区：{road.CountyName}</span>
            <span>镇街道：{road.NeighborhoodsName}</span>
          </div>
        )
      });
    }
    return this.doms;
  }
  SearchRoadByID = () => {
    $.post(
      "http://v/Common/GetRoadByID",
      {
        roadID: this.state.roadID,
      },
      rt => {
        if (rt.ErrorMessage) {
          message.error(rt.ErrorMessage);
        }
        else if (rt.Data) {
          this.setState({ roadDatas: rt.Data, totalCount_road: 1 });
          L.geoJSON($.parseJSON(rt.Data[0].RoadGeomStr), {
            style: function (feature) {
              return { color: 'red' };
            },
          }).addTo(this.roadLayerGroup);
          var bbox = $.parseJSON(rt.Data[0].RoadGeomStr).bbox;
          var corner1 = L.latLng(bbox[0], bbox[1]),
            corner2 = L.latLng(bbox[2], bbox[3]);
          this.map.fitBounds([corner1, corner2]);
        }
      },
      'json'
    )
  }
  SearchRoads = (pSize, pNum) => {
    $.post(
      "http://localhost:52141/Common/GetRoads",
      {
        PageSize: pSize,
        PageNum: pNum,
        Name: this.state.roadNameInput,
      },
      rt => {
        if (rt.ErrorMessage) {
          message.error(rt.ErrorMessage);
        }
        else if (rt.Data) {
          this.setState({ roadDatas: rt.Data.Data, totalCount_road: rt.Data.Count });
        }
      },
      'json'
    )
  }
  render() {
    return (
      <div className={st.mapComponent}>
        <div id='map' className={st.map}></div>
        <div className={st.tool}>
          <span onClick={() => {
            this.disableDrawTools();
            let baseMapType = this.state.baseMapType === 'vec' ? 'img' : 'vec';
            this.changeBaseMap(baseMapType);
          }}>
            <span>{this.state.baseMapType === 'vec' ? '地图' : '影像'}</span>
          </span>
          <Divider type="vertical" />
          <span onClick={() => { this.setState({ isGetCRS: true }, () => { if (this.state.isGetCRS) this.enableDrawPoint() }) }}>
            <span>坐标拾取</span>
          </span>
          <Divider type="vertical" />
          <span onClick={() => this.enableDrawPolyline()}>
            <span>测量长度</span>
          </span>
          <Divider type="vertical" />
          <span onClick={() => this.enableDrawPolygon()}>
            <span>测量面积</span>
          </span>
          <Divider type="vertical" />
          <span onClick={() => { this.disableDrawTools(); this.clearLayers() }}>
            <span>清除图面</span>
          </span>
        </div>
        {
          this.MPState == 'edit' ? (
            <div className={st.locate}>
              <span className="iconfont icon-dingwei1" onClick={() => { this.disableDrawTools(); this.setState({ isGetCRS: false }, () => { if (!this.state.isGetCRS) this.enableDrawPoint() }) }}>
                <span style={{ marginLeft: 5 }} >手动定位</span>
              </span>
              <Divider type="vertical" />
              <Popconfirm
                placement="bottom"
                title={
                  <div>
                    <Input id="input-crs-lng" style={{ marginBottom: 10 }} addonBefore="经度" defaultValue={"120.7514"} />
                    <Input id="input-crs-lat" addonBefore="纬度" defaultValue={"30.7479"} />
                  </div>
                }
                okText="确定"
                cancelText="取消"
                onConfirm={((e) => {
                  this.pointLayerGroup.clearLayers();
                  var lat = parseFloat($('#input-crs-lat')[0].value);
                  var lng = parseFloat($('#input-crs-lng')[0].value);
                  L.marker([lat, lng], {
                    icon: L.divIcon({
                      className: `ct-point-${this.MPType}-divicon`,
                      iconSize: [20, 20],
                    }),
                  }).addTo(this.pointLayerGroup).bindPopup(this.pointDom).openPopup();
                  this.map.setView(L.latLng(lat, lng), 20);
                }).bind(this)}
              >
                <span onClick={() => { this.disableDrawTools(); }} className="iconfont icon-dingwei">
                  <span style={{ marginLeft: 5 }} >经纬度定位</span>
                </span>
              </Popconfirm>
              <Divider type="vertical" />
              <span className="iconfont icon-baocun" onClick={(() => {
                this.disableDrawTools();
                var lat = this.pointLayerGroup.getLayers()[0]._latlng.lat,
                  lng = this.pointLayerGroup.getLayers()[0]._latlng.lng;
                console.log(lat, lng)
              }).bind(this)} >
                <span style={{ marginLeft: 5 }} >保存并关闭</span>
              </span>
            </div>
          ) : null
        }
        {
          this.MPState == 'search' ? (
            <div>
              <div className={st.roadPanel}>
                <div className={st.search}>
                  <Search
                    defaultValue={this.state.roadName}
                    placeholder="请输入道路名称..."
                    onChange={(e) => { this.setState({ roadNameInput: e.target.value, currentPageNum: 1 }, e => { this.SearchRoads(this.state.pageSize, 1) }) }}
                    onSearch={() => { this.setState({ currentPageNum: 1 }, () => { this.SearchRoads(this.state.pageSize, 1) }) }}
                    enterButton
                  />
                </div>
                <div className='content'>
                  {this.getRoadContents()}
                </div>
                <div className={st.pageNation}>
                  <Pagination onChange={(page, pageSize) => { this.setState({ currentPageNum: page }, () => { this.SearchRoads(pageSize, page) }) }}
                    size="small"
                    current={this.state.currentPageNum}
                    total={this.state.totalCount_road}
                    pageSize={this.state.pageSize}
                    showQuickJumper={true}
                    showTotal={(total, range) => `共${total}条`}
                    style={{ float: 'right', margin: 20 }} />
                </div>
              </div>
              <div className={st.save}>
                <span className="iconfont icon-baocun" onClick={() => { console.log(this.state.roadID, this.state.roadName) }} >
                  <span style={{ marginLeft: 5 }} >保存并关闭</span>
                </span>
              </div>
            </div>
          ) : null
        }
      </div>
    );
  }
}
export default Map;