/**
 *咨询管理-发布活动页面
 */

import React from 'react';
import Http from '../../utils/http';
import DMCUtil from '../../utils/DMCUtil'
import {SERVER_BASE_PATH,UPLOAD_IMAGE_PATH} from '../../global.config'
import PropTypes from 'prop-types';
import history from '../../utils/history';
import './style/note.scss';
import QRcode from '../../components/common/QRCode';
import Tag from '../tag/TagComp';
import {
  Form, Select, InputNumber, Switch, Radio, DatePicker,
  Slider, Button, Upload, Icon, Rate, Input, Checkbox,
  Row, Col, Modal, message
} from 'antd';
import RichText from '../../components/RichText/RichText';
import index from 'antd/lib/dropdown';
const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const RangePicker = DatePicker.RangePicker;
const { TextArea } = Input;

message.config({
  top: 400,
  duration: 2,
})

const title = '发布动态';
let uuid = 0;
const apis = [
  { "id": "demoList", "url": "demo/list" },
  { "id": "uploadimage", "url": "cmyManage/sys/uploadFile" },
  { "id": "getTagList", "url": "cmyManage/tag/getTagList" },
  { "id": "addCourse", "url": "community/course/web/addCourse" },
  { "id": "previewReady", "url": "template/preview/ready" },

];

const Authorization = DMCUtil.getJWTFromCookie()
Http.setDomainUrl(SERVER_BASE_PATH);

Http.setMutiApi(apis);
Http.setRequestHeader(Authorization)

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 18,
      offset: 4,
    },
    sm: {
      span: 18,
      offset: 4,
    },
    md: {
      span: 18,
      offset: 4,
    },

  },
};

class ActEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      previewVisible: false,
      previewImage: '',
      // fileList: [{
      //   uid: -1,
      //   name: 'xxx.png',
      //   status: 'done',
      //   url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
      // }],
      formValue: {
        "courseImages": "",
        "courseLabel": "",
        "courseText": "",
        "courseType": 0,
        // "dealerCode": "00000"
      },
      tagList: [],
      fileList: [],
      QRcodeShow: false,
      tagShow: false,
      isRequest: false,
    }

  };

  componentWillMount() {
    this.getTag();
  }

  getTag() {
    //获取标签下拉列表
    Http.get('getTagList', { businessType: 1002 }, (callback) => {
      this.setState({ tagList: callback })
      console.log('tagList--->', callback)
    })
  }
  onChange = (checkedValues) => {
    console.log('checked = ', checkedValues);
  }

  normFile = (e) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  }
  handleUploadCancel = () => this.setState({ previewVisible: false })
  handleUploadChange = (info) => {
    debugger;
    const { fileList } = info;
    const status = info.file.status;
    let imgURLAsArr = [];

    if (status === 'done') {
      fileList.map((item, index) => {
        const path = item['response']['data'];
        path ? imgURLAsArr.push(path) : message.error('图片文件服务器上传错误！');
      })

      this.setState({
        formValue: { ...this.state.formValue, ...{ courseImages: imgURLAsArr.join(',') } }
      }, () => {
      })

    } else if (status === 'error') {
      return message.error('图片文件服务器上传错误！');
    }
    this.setState({ fileList });
  };

  removeImg(value) {
    let arr = Object.assign([], this.state.formValue.courseImages);
    arr.map((item, index) => {
      if (item === value) {
        arr.splice(index, 1);
      }
    })
  }
  handleUploadPreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }
  componentDidMount() {
  }



  handleChange(value) {
    const _this = this;
    this.state.tagList.map((item, index) => {
      if (item.value === value) {
        _this.setState({
          formValue: Object.assign(this.state.formValue, { courseLabel: item.label })
        })
      }
    })
  }

  /**
   * 验证是否提交空
   * @param {Object} obj 
   */
  verification(obj) {
    let result = false
    for (let k in obj) {
      if (typeof obj[k] === 'string' && !obj[k].length) {
        result = true;
        break;
      }
    }
    return result;
  }

  confirm(type) {   // 保存、预览、发布
    if (this.state.isRequest) return !1;
    this.setState({ isRequest: true }, () => {
      let query = Object.assign({}, this.state.formValue);
      if (this.verification(query)) {
        this.setState({ isRequest: false })
        message.error('请填写完整！');
      } else if (type === 'export') {
        Http.post("addCourse", query, (res) => {
          window.location.href = window.location.origin + '/fed/admin/noteManu';
          this.setState({ isRequest: false })
        })
      } else if (type === 'search') {
        this.setState({ QRcodeShow: true, isRequest: false })
      }
    });
  }

  jump = (url) => {
    history.push(url);
  }

  changeType(v) {
    const formValue = Object.assign({}, this.state.formValue);
    if (v) {
      formValue["courseSummary"] = '';
      formValue["bigText"] = '';
      delete formValue['courseText']
    } else {
      formValue["courseText"] = '';
      delete formValue['bigText']
      delete formValue['courseSummary']
    }
    formValue["courseType"] = v;
    this.setState({ formValue })
  }

  render() {
    const { getFieldDecorator, getFieldValue, setFieldsValue } = this.props.form;
    const { previewVisible, previewImage, fileList } = this.state;
    const rangeConfig = {
      rules: [{ type: 'array', required: true, message: '请选择时间！' }],
    };
    // const uploadUrl = Http.getApi('uploadimage');
    const uploadUrl = UPLOAD_IMAGE_PATH;

    //setFieldsValue({fileList})
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">添加</div>
      </div>
    );

    return (
      <div className={'wrap'} style={{ 'padding': '12px' }}>
        <Form onSubmit={this.handleSubmit}>
          <FormItem
            {...formItemLayout}
            label="动态类型"
          >
            <Select placeholder="请选择"
              value={this.state['formValue']['courseType']}
              onChange={this.changeType.bind(this)}>
              <Option value={0}>图文模式</Option>
              <Option value={1}>图文穿插模式</Option>
            </Select>
          </FormItem>

          <FormItem
            {...formItemLayout}
            label="动态标签"
          >
            <Row gutter={12}>
              <Col span={16}>
                {getFieldDecorator('courseLabel', {
                  rules: [
                    { required: true, message: '请选择活动标签！' },
                  ],
                })(
                  <Select placeholder="请选择" onChange={this.handleChange.bind(this)}>
                    {this.state.tagList.map((item, index) => {
                      return (
                        <Option value={item.value} key={index}>{item.label}</Option>
                      )
                    })}
                  </Select>
                )}
              </Col>
              <Col span={8}>
                <Button icon="tag" style={{ width: '100%' }} onClick={() => this.setState({ tagShow: true })}>设置</Button>
              </Col>
            </Row>

          </FormItem>

          <FormItem
            {...formItemLayout}
            label={<span className={'filling'}>主题图片</span>}
          >
            {getFieldDecorator('upload', {
              valuePropName: 'fileList',
              getValueFromEvent: this.normFile,
            })(
              <Upload
                action={uploadUrl}
                listType="picture-card"
                multiple={true}
                supportServerRender={true}
                onPreview={this.handleUploadPreview}
                onChange={this.handleUploadChange}
                onRemove={(obj) => { this.removeImg.bind(this, obj.response.data) }}
              >
                {fileList.length >= 3 ? null : uploadButton}
              </Upload>
            )}
          </FormItem>


          {this.state['formValue']['courseType']
            ? <FormItem
              {...formItemLayout}
              label="内容摘要"
            >
              {getFieldDecorator('courseSummary', {
                rules: [
                  { required: true, message: '请输入内容摘要!' },
                ],
              })(
                <TextArea rows={4} onChange={v => { this.setState({ formValue: Object.assign(this.state.formValue, { courseSummary: v.target.value }) }) }} />
              )}
            </FormItem>
            : ''}

          <FormItem
            {...formItemLayout}
            label="动态正文"
          >

            {this.state['formValue']['courseType']
              ? getFieldDecorator('bigText', {
                rules: [
                  { required: true, message: '请输入动态正文!' },
                ],
              })(
                <RichText
                  richOpt={{ uploadUrl }}
                  defaultValue={this.state.formValue.bigText}
                  result={this.state.formValue.bigText}
                  onChange={(bigText) => { this.setState({ formValue: Object.assign(this.state.formValue, { bigText }) }) }}>
                </RichText>
              )
              : getFieldDecorator('courseText', {
                rules: [
                  { required: true, message: '请输入动态正文!' },
                ],
              })(
                <TextArea rows={4} onChange={v => { this.setState({ formValue: Object.assign(this.state.formValue, { courseText: v.target.value }) }) }} />
              )}

          </FormItem>

          <FormItem {...tailFormItemLayout}>
            {/* <Button type="primary" htmlType="button" icon="save" onClick={this.confirm.bind(this, 'save')}>保存</Button> */}
            {/* <Button type="default" htmlType="button" disabled={this.state.isRequest} icon="search" onClick={this.confirm.bind(this, 'search')}>预览</Button> */}
            <Button type="primary" htmlType="button" disabled={this.state.isRequest} icon="export" style={{ marginLeft: 20 }} onClick={this.confirm.bind(this, 'export')}>发布</Button>
          </FormItem>
        </Form>
        <Modal visible={previewVisible} footer={null} onCancel={this.handleUploadCancel}>
          <img alt="image" style={{ width: '100%' }} src={previewImage} />
        </Modal>

        <Modal
          width={800}
          visible={this.state.tagShow}
          onCancel={() => { this.getTag(); this.setState({ tagShow: false }) }}
          onOk={() => { this.getTag(); this.setState({ tagShow: false }) }}
        >
          <Tag businessType={1002} />
        </Modal>

        {/* 二维码预览 */}
        {/* <QRcode show={this.state.QRcodeShow} URL="" OK={() => { this.setState({ QRcodeShow: false }) }} /> */}
      </div>
    );
  };

}
const ActEditWithForm = Form.create()(ActEdit);

export default ActEditWithForm;
