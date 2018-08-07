/**
 *咨询管理-发布新闻页面
 */

import React from 'react';
import Http from '../../utils/http';
import PropTypes from 'prop-types';
import NewsEdit from './components/NewsDetailEditManu';
import history from '../../utils/history';
import './style/news.edit.scss';
import DMCUtil from '../../utils/DMCUtil'
import {SERVER_BASE_PATH} from '../../global.config';
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

const title = '发布新闻';
let uuid = 0;
const apis = [
  { "id": "queryNewsDetail", "url": "community/news/web/getWebNewsDetail" }
];

const Authorization = DMCUtil.getJWTFromCookie()
Http.setDomainUrl(SERVER_BASE_PATH);
Http.setMutiApi(apis);
Http.setRequestHeader(Authorization)
const queryParams = DMCUtil.getMutiQueryValue(['handle', 'businessId', 'businessType'])
const activityDto = {
  "content": "",
  "contentType": 1,
  "dealerCode": "DEC100100",
  "dealerName": "",
  "endDate": "",
  "labelId": 0,
  "labelName": "",
  "newsSummary": "",
  "newsUrl": "",
  "previewPhone": "",
  "startDate": "",
  "status": 0,
  "thirdPartLink": "",
  "title": "",
  "titleImage": ""
}

class NewsEditPage extends React.Component {
  constructor(props) {
    super(props);
    //1001:抢购活动,1002:报名活动,1003:普通活动
    this.state = {
      formFieldValues: { ...activityDto },
    }

  };


  componentDidMount() {
    //  this.setState({
    //   formFieldValues:{...this.state.formFieldValues,...{id:null}}
    //  })
    
    const { handle, businessId, businessType } = queryParams;
    Http.get('queryNewsDetail', {id:Number(businessId)}, (res) => {
      if(res){
        this.setState({
          formFieldValues:res
        })
      }
      
    })
  }


  render() {
    const { state } = this
    const { formFieldValues } = state

    return (
      <div className='wrap' style={{ 'padding': '12px' }}>
        {formFieldValues['id']?<NewsEdit query={queryParams} formFieldValues={formFieldValues} />:null}
      </div>
    );
  };

}
const NewsEditPageWithForm = Form.create()(NewsEditPage);


export default NewsEditPageWithForm;
