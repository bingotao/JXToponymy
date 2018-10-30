import L from '../../common/leaflet.extends.js';
import './icons.less';

let normalIcons = {
  locateRed: L.divIcon({
    className: 'div-icon0',
    iconSize: [25, 36],
    iconAnchor: [13, 32],
    popupAnchor: [0, -35],
    tooltipAnchor: [0, -35],
  }),
  locateBlue: L.divIcon({
    className: 'div-icon1',
    iconSize: [25, 36],
    iconAnchor: [13, 32],
    popupAnchor: [0, -35],
    tooltipAnchor: [0, -35],
  }),
  touchIcon: L.divIcon({
    iconSize: [16, 16],
    className: 'ct-touchicon',
  }),
};

let svgicons = {
  'icon-keyiyidongderendeweizhi': {
    className: 'ct-icon',
    iconSize: [40, 40],
    iconAnchor: [40, 20],
    popupAnchor: [0, -20],
  },
  'icon-weizhi-moren': {
    className: 'ct-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -20],
  },
  'icon-weizhi21': {
    className: 'ct-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 36],
    popupAnchor: [0, -20],
  },
};

let initIcons = () => {
  let icons = {};
  for (let i in svgicons) {
    let icon = svgicons[i];
    let html = `<svg class="icon" aria-hidden="true"><use xlink:href="#${i}"></use></svg>`;

    let nicon = L.divIcon({
      ...icon,
      html: html,
    });
    icons[i] = nicon;
  }
  return {
    ...normalIcons,
    ...icons,
  };
};

let icons = initIcons();

let getDivIcons = () => {
  return {
    mp: L.divIcon({
      iconSize: [42, 40],
      iconAnchor: [20, 18],
      className: 'ct-icon-mp',
    }),
    lp: L.divIcon({
      iconSize: [42, 40],
      iconAnchor: [20, 18],
      className: 'ct-icon-lp',
    }),
  };
};

let divIcons = getDivIcons();
export { getDivIcons, divIcons };
export default icons;
