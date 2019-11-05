import React, { useState } from 'react';

const NavTag = props => {
  return (
    <div
      className={props.Current === props.Type ? 'active' : null}
      data-target={props.Type}
      onClick={props.onClick}
    >
      {props.TypeName}
    </div>
  );
};

const CurrentTag = props => {
  const [currentTag, setCurrentTag] = useState(props.initTag);
  const changeTag = e => {
    setCurrentTag(e.target.dataset.target);
  };
  return [currentTag, changeTag];
};
export { CurrentTag, NavTag };
