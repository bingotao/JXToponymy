import { Component } from 'react';
import { Button, Alert } from 'antd';
import { DataGrid, GridColumn } from 'rc-easyui';


import Authorized, {
  getEditComponent,
  getDisabledComponent,
  DisableComponent,
  RedirectToLogin,
} from '../../utils/Authorized4';

//import './Test.less';

class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.getData(),
    };
  }
  getData() {
    return [
      {
        code: 'FI-SW-01',
        name: 'Koi',
        unitcost: 10.0,
        status: 'P',
        listprice: 36.5,
        attr: 'Large',
        itemid: 'EST-1',
      },
      {
        code: 'K9-DL-01',
        name: 'Dalmation',
        unitcost: 12.0,
        status: 'P',
        listprice: 18.5,
        attr: 'Spotted Adult Female',
        itemid: 'EST-10',
      },
      {
        code: 'RP-SN-01',
        name: 'Rattlesnake',
        unitcost: 12.0,
        status: 'P',
        listprice: 38.5,
        attr: 'Venomless',
        itemid: 'EST-11',
      },
      {
        code: 'RP-SN-01',
        name: 'Rattlesnake',
        unitcost: 12.0,
        status: 'P',
        listprice: 26.5,
        attr: 'Rattleless',
        itemid: 'EST-12',
      },
      {
        code: 'RP-LI-02',
        name: 'Iguana',
        unitcost: 12.0,
        status: 'P',
        listprice: 35.5,
        attr: 'Green Adult',
        itemid: 'EST-13',
      },
      {
        code: 'FL-DSH-01',
        name: 'Manx',
        unitcost: 12.0,
        status: 'P',
        listprice: 158.5,
        attr: 'Tailless',
        itemid: 'EST-14',
      },
      {
        code: 'FL-DSH-01',
        name: 'Manx',
        unitcost: 12.0,
        status: 'P',
        listprice: 83.5,
        attr: 'With tail',
        itemid: 'EST-15',
      },
      {
        code: 'FL-DLH-02',
        name: 'Persian',
        unitcost: 12.0,
        status: 'P',
        listprice: 23.5,
        attr: 'Adult Female',
        itemid: 'EST-16',
      },
      {
        code: 'FL-DLH-02',
        name: 'Persian',
        unitcost: 12.0,
        status: 'P',
        listprice: 89.5,
        attr: 'Adult Male',
        itemid: 'EST-17',
      },
      {
        code: 'AV-CB-01',
        name: 'Amazon Parrot',
        unitcost: 92.0,
        status: 'P',
        listprice: 63.5,
        attr: 'Adult Male',
        itemid: 'EST-18',
      },
    ];
  }

  render() {
    // console.log(this.props);
    return (
      <div>
        

        <div style={{ height: 500, width: 800 }}>
          <Alert
            className="topcenter"
            message="Informational Notes"
            description="Additional description and informations about copywriting."
            type="info"
            showIcon
          />
          <Alert
            message="Informational Notes"
            description="Additional description and informations about copywriting."
            type="info"
            showIcon
            banner
          />
          <DataGrid data={this.state.data} style={{ height: '100%' }}>
            <GridColumn field="itemid" title="Item ID" />
            <GridColumn field="name" title="Name" />
            <GridColumn field="listprice" title="List Price" align="right" />
            <GridColumn field="unitcost" title="Unit Cost" align="right" />
            <GridColumn field="attr" title="Attribute" width="30%" />
            <GridColumn field="status" title="Status" align="center" />
          </DataGrid>
        </div>
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
      </div>
    );
  }
}

export default Test;
