/**
 *咨询管理-发布活动页面
 */

import React from 'react';
import Http from '../../utils/http';
import PropTypes from 'prop-types';
import ActEdit from './components/ActEditManu';
import history from '../../utils/history';
import './style/info.scss';
import {
  Form, Select, InputNumber, Switch, Radio, DatePicker,
  Slider, Button, Upload, Icon, Rate, Input, Checkbox,
  Row, Col, Modal,
} from 'antd';
import RichText from '../../components/RichText/RichText';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const RangePicker = DatePicker.RangePicker;
import DMCUtil from '../../utils/DMCUtil'
import {SERVER_BASE_PATH} from '../../global.config'

const title = '发布活动';
let uuid = 0;
const apis = [
  {"id":"activityDetail","url":"community/activity/detail"},
];

Http.setDomainUrl(SERVER_BASE_PATH);

Http.setMutiApi(apis);
const Authorization = DMCUtil.getJWTFromCookie()
Http.setRequestHeader(Authorization)

const activityDto = {
  "activityContent": "string",
  "activityTitle": "2018广丰优惠活动",
  "activityType": 1003,
  "activityUrl": "http://localhost:9900/fed/admin/device-support",
  "applyContent": {},
  "contentType": 1,
  "couponLimit": 0,
  "applyLimit":0,
  "countModify": 0,
  "couponLabel": "string",
  "couponNo": "string",
  "dealerCode": "DEC100100",
  "dealerName": "string",
  "endDateStr": "2018-12-30",
  "previewPhones": "15800362921",
  "startDateStr": "2018-01-01",
  "status": 0,
  "tagId": 11,
  "tagName": "分享",
  "thirdPartLink": "https://www.fanyou365.com",
  "titleImage": ""
}

class ActEditPage extends React.Component {
  constructor(props) {
      super(props);

      //1001:抢购活动,1002:报名活动,1003:普通活动
      this.state = {
        formFieldValues:{...activityDto},
      }
  
    };


    componentDidMount() {
     this.setState({
      formFieldValues:{...this.state.formFieldValues,...{id:null}}
     })
    }

 
  render() {
    const { state } = this
    const { formFieldValues } = state

      return (
        <div className='wrap' style={{'padding':'12px'}}>
          <ActEdit formFieldValues={formFieldValues} />
        </div>
      );
    };
 
}
const ActEditPageWithForm = Form.create()(ActEditPage);

export default ActEditPageWithForm;
