import React from 'react';
// import HouseDoorplate from './HouseDoorplate.js';
// import RoadDoorplate from './RoadDoorplate.js';
// import VillageDoorplate from './VillageDoorplate.js';
import Authorized from '../../../utils/Authorized4';
import { NavTag, CurrentTag } from '../../../common/Navs/NavTab';
import st from './ToponymySearch.less';

const ToponymySearch = () => {
  let [currentTag, changeTag] = CurrentTag({initTag:"Settlement"});
  const getContent = () => {
    switch (currentTag) {
      case 'Settlement':
        return <Authorized>{/* <RoadDoorplate /> */}</Authorized>;
      case 'Building':
        return <Authorized>{/* <VillageDoorplate /> */}</Authorized>;
      case 'Road':
        return <Authorized>{/* <VillageDoorplate /> */}</Authorized>;
      case 'Bridge':
        return <Authorized>{/* <VillageDoorplate /> */}</Authorized>;
      default:
        return <Authorized>{/* <HouseDoorplate /> */}</Authorized>;
    }
  };

  return (
    <div className={st.DoorplateSearch}>
      <div className={st.navs}>
        <NavTag Current={currentTag} Type="Settlement" TypeName="居民点" onClick={changeTag} />
        <NavTag Current={currentTag} Type="Building" TypeName="建筑物" onClick={changeTag} />
        <NavTag Current={currentTag} Type="Road" TypeName="道路街巷" onClick={changeTag} />
        <NavTag Current={currentTag} Type="Bridge" TypeName="桥梁" onClick={changeTag} />
      </div>
      <div className={st.content}>{getContent()}</div>
    </div>
  );
};

export default ToponymySearch;
