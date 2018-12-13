import { Component } from 'react';
import { Button } from 'antd';
import Authorized, {
  getEditComponent,
  getDisabledComponent,
  DisableComponent,
  RedirectToLogin,
} from '../../utils/Authorized3';

class Test extends Component {

  render() {
    console.log(this.props);
    return (
      <div>
        Test
        {getEditComponent.call(this, <Button type="primary">按钮1</Button>)}
        {getDisabledComponent.call(this, <Button type="primary">按钮2</Button>)}
        <Authorized c_id="t.a" noMatch={null}>
          <Button type="primary">按钮3</Button>
        </Authorized>
        <DisableComponent c_id="t.b" >
          <Button type="primary">按钮4</Button>
        </DisableComponent>
        {/* <Authorized c_id="t.c" noMatch={RedirectToLogin}>
          <Button type="primary">按钮5</Button>
        </Authorized> */}
      </div>
    );
  }
}

export default Test;
