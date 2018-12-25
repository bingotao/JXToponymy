import { Component } from 'react';
import { Button } from 'antd';
import Authorized, {
  getEditComponent,
  getDisabledComponent,
  DisableComponent,
  RedirectToLogin,
} from '../../utils/Authorized4';

class Test extends Component {
  render() {
    // console.log(this.props);
    return (
      <Authorized c_id="1">
        <div>navs 1</div>
        <Authorized>
          <div>part A</div>
          <div>part B</div>
          <div>part C</div>
        </Authorized>
        <Authorized c_id="1.1">
          <div>navs 1.1</div>
          <div>
            <Authorized c_id="1.1.1">
              <div>1.1.1</div>
            </Authorized>
            <Authorized c_id="1.1.2">
              <div>1.1.2</div>
            </Authorized>
            <Authorized>
              <div>1.1.2</div>
            </Authorized>
          </div>
        </Authorized>
      </Authorized>
    );
  }
}

export default Test;
