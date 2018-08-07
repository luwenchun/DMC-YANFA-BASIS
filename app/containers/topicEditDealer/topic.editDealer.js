/**
 *咨询管理-发布话题页面
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import Http from '../../utils/http';
import DMCUtil from '../../utils/DMCUtil'
import { SERVER_BASE_PATH, UPLOAD_IMAGE_PATH } from '../../global.config'
import PropTypes from 'prop-types';
// import history from '../../utils/history';
import './style/note.scss';
import Tag from '../tag/TagComp';
import {
  Form, Select, InputNumber, Switch, Radio, DatePicker,
  Slider, Button, Upload, Icon, Rate, Input, Checkbox, message,
  Row, Col, Modal,
} from 'antd';
import RichText from '../../components/RichText/RichText';
const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const RangePicker = DatePicker.RangePicker;

const title = '发布话题';
let uuid = 0;
const apis = [
  { "id": "demoList", "url": "demo/list" },
  { "id": "uploadimage", "url": "cmyManage/sys/uploadFile" },
  { "id": "addTopic", "url": "community/topic/addTopic" },
  { "id": "getTagList", "url": "cmyManage/tag/getTagList" },
];

message.config({
  top: 400,
  duration: 2,
})
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
      span: 12,
      offset: 4,
    },
    sm: {
      span: 12,
      offset: 4,
    },
    md: {
      span: 12,
      offset: 4,
    },

  },
};

const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 24, offset: 0 },
  },
};

class ActEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      previewVisible: false,
      previewImage: '',
      fileList: [
        //   {
        //   uid: -1,
        //   name: 'xxx.png',
        //   status: 'done',
        //   url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
        // }
      ],
      formFieldValues: {
        // "dealerCode": "00000",
        "topicImages": "",
        "topicLabel": "",
        "topicText": "",
        "topicTitle": ""
      },
      tagList: [],
      tagShow: false,
      isRequest: false,
    }

  };

  componentWillMount() {
    this.getTag()
  }

  getTag() {
    //获取标签下拉列表
    Http.get('getTagList', { businessType: 1001 }, (callback) => {
      this.setState({ tagList: callback })
      console.log('tagList--->', callback)
    })
  }

  onChange = (checkedValues) => {
    console.log('checked = ', checkedValues);
  }

  removeMobile = (k) => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('keys');
    // We need at least one passenger
    if (keys.length === 1) {
      return;
    }

    // can use data-binding to set
    form.setFieldsValue({
      keys: keys.filter(key => key !== k),
    });
  }

  addMobile = () => {
    console.log('form====', form)
    const { form } = this.props;
    const keys = form.getFieldValue('keys');
    const nextKeys = keys.concat(uuid);
    uuid++;

    form.setFieldsValue({
      keys: nextKeys,
    });
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
    const { fileList } = info;
    const status = info.file.status;
    let imgURLAsArr = [];

    if (status === 'done') {
      fileList.map((item, index) => {
        const path = item['response']['data'];
        path ? imgURLAsArr.push(path) : message.error('图片文件服务器上传错误！');
      })
      this.setState({
        formFieldValues: { ...this.state.formFieldValues, ...{ topicImages: imgURLAsArr.join(',') } }
      }, () => {
        console.log('handleUploadChange===', this.state.formFieldValues)
      })

    } else if (status === 'error') {
      return message.error('图片文件服务器上传错误！');
    }
    this.setState({ fileList });
  };
  handleUploadPreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }
  componentDidMount() {
    this.addMobile();
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


  publish(type) {  //  保存、预览、发布
    if (this.state.isRequest) return !1;
    this.setState({ isRequest: true }, () => {
      const formFieldValues = Object.assign({}, this.state.formFieldValues);
      if (this.verification(formFieldValues)) {
        this.setState({ isRequest: false });
        message.error('请填写完整！');
      } else if (type === 'export') {
        Http.post('addTopic', formFieldValues, (result) => {
          window.location.href = window.location.origin + '/fed/admin/noteDealer?type=1001';
          message.success('发布成功！');
          this.setState({ isRequest: false });
        })
      } else if (type === 'search') {

      }
    })



  }

  handleChange(value) {
    const _this = this;
    this.state.tagList.map((item, index) => {
      if (item.value === value) {
        _this.setState({
          formFieldValues: Object.assign(this.state.formFieldValues, { topicLabel: item.label })
        })
      }
    })
  }

  jump = (url) => {
    this.props.history.push(url);
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
    getFieldDecorator('keys', { initialValue: [] });
    const keys = getFieldValue('keys');

    return (
      <div className={'wrap'} style={{ 'padding': '12px' }}>
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={title} />
        </Helmet>
        <Form onSubmit={this.handleSubmit}>

          <FormItem
            {...formItemLayout}
            label="话题标题"
          >
            {getFieldDecorator('title', {
              rules: [{ required: true, message: '请填写话题标题！' }],
            })(
              <Input onChange={(e) => { this.setState({ formFieldValues: Object.assign(this.state.formFieldValues, { topicTitle: e.target.value }) }) }} />
            )}
          </FormItem>

          <FormItem
            {...formItemLayout}
            label="话题标签"
          >

            <Row gutter={12}>
              <Col span={16}>
                {getFieldDecorator('tag', {
                  rules: [
                    { required: true, message: '请选择话题标签！' },
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
            label={<span className={'filling'}>背景图片</span>}
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
                onRemove={() => { this.setState({ formFieldValues: Object.assign(this.state.formFieldValues, { topicImages: '' }) }) }}
              >
                {fileList.length >= 1 ? null : uploadButton}
              </Upload>
            )}<span style={{ color: 'red' }}>* 请设置图片宽高比例 680:320(像素)</span>
          </FormItem>


          <FormItem
            {...formItemLayout}
            label="话题内容"
          >
            {getFieldDecorator('topicText', {
              rules: [
                { required: true, message: '请输入话题内容!' },
              ],
            })(
              <RichText
                richOpt={{ uploadUrl }}
                defaultValue={this.state.formFieldValues.topicText}
                result={this.state.formFieldValues.topicText}
                onChange={(topicText) => { this.setState({ formFieldValues: Object.assign(this.state.formFieldValues, { topicText }) }) }}>
              </RichText>
            )}

          </FormItem>


          <FormItem {...tailFormItemLayout}>
            {/* <Button type="primary" htmlType="button" icon="save" onClick={this.publish.bind(this, 'save')}>保存</Button> */}
            {/* <Button type="default" htmlType="button" disabled={this.state.isRequest} icon="search" onClick={this.publish.bind(this, 'search')}>预览</Button> */}
            <Button type="primary" htmlType="button" disabled={this.state.isRequest} icon="export" style={{ marginLeft: 20 }} onClick={this.publish.bind(this, 'export')}>发布</Button>
          </FormItem>
        </Form>

        <Modal visible={previewVisible} footer={null} onCancel={this.handleUploadCancel}>
          <img alt="image" style={{ width: '100%' }} src={previewImage} />
        </Modal >

        <Modal
          width={800}
          visible={this.state.tagShow}
          onCancel={() => { this.getTag(); this.setState({ tagShow: false }) }}
          onOk={() => { this.getTag(); this.setState({ tagShow: false }) }}
        >
          <Tag businessType={1001} />
        </Modal>



      </div>
    );
  };

}
const ActEditWithForm = Form.create()(ActEdit);

export default ActEditWithForm;
