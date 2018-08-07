/**
 *编辑活动
 */

import React from 'react';
import QRCode from 'qrcode';
import Http from '../../../utils/http';
import PropTypes from 'prop-types';
import {UPLOAD_IMAGE_PATH,SERVER_BASE_PATH} from '../../../global.config';
import history from '../../../utils/history';
import '../style/act.edit.scss';
import {
  Form, Select, InputNumber, Switch, Radio, DatePicker,
  Slider, Button, Upload, Icon, Rate, Input, Checkbox,
  Row, Col, Modal, message,
} from 'antd';
import RichText from '../../../components/RichText/RichText';
import QRcode from '../../../components/common/QRCode';
import Tag from '../../tag/TagComp';
import DMCUtil from '../../../utils/DMCUtil'
const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const RangePicker = DatePicker.RangePicker;
let uuid = 0;
const apis = [
  { "id": "initApplyContent", "url": "community/activity/initApplyContent" },
  { "id": "uploadFile", "url": "cmyManage/sys/uploadFile" },
  { "id": "getTagList", "url": "cmyManage/tag/getTagList" },
  { "id": "getCouponList", "url": "community/activity/getCouponList" },
  { "id": "activityHandle", "url": "community/activity/handle", "format": false },
  { "id": "previewReady", "url": "template/preview/ready" },
];

const Authorization = DMCUtil.getJWTFromCookie()

Http.setDomainUrl(SERVER_BASE_PATH);

Http.setMutiApi(apis);
Http.setRequestHeader(Authorization)
message.config({
  top: 400,
  duration: 2,
})

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 12 },
};

const checkboxLayout = {
  labelCol: { span: 6 },
  wrapperCol: {
    xs: {
      span: 18,
    },
    sm: {
      span: 18,
    },
    md: {
      span: 18,
    },

  }
};

const formItemLink = {
  wrapperCol: {
    xs: {
      span: 12,
      offset: 6,
    },
    sm: {
      span: 12,
      offset: 6,
    },
    md: {
      span: 12,
      offset: 6,
    },

  }
};

const formItemRichText = {
  wrapperCol: {
    xs: {
      span: 18,
      offset: 6,
    },
    sm: {
      span: 18,
      offset: 6,
    },
    md: {
      span: 18,
      offset: 6,
    },

  }
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 12,
      offset: 6,
    },
    sm: {
      span: 12,
      offset: 6,
    },
    md: {
      span: 12,
      offset: 6,
    },

  },
};

const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 24, offset: 0 },
  },
};

/**
 * 空方法
 */
function noop() { }

//不优雅的暂存编辑时要填充的数据😊
let tempFormFieldValues = {};

const actTyps = { 1001: 'purchase', 1002: 'enter', 1003: 'normal' }

let initCount = 0

class ActEdit extends React.Component {

  static propTypes = {
    activityType: PropTypes.number,
    editType: PropTypes.string,
    formFieldValues: PropTypes.object,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
  }

  static defaultProps = {
    formFieldValues: {},
    onConfirm: noop,
    onCancel: noop,
  }

  constructor(props) {
    super(props);

    this.state = {
      richOpt: { UPLOAD_IMAGE_PATH },
      tagList: [],
      couponList: [],
      enteredList: {
        personInfo: [],
        carInfo: [],
        alternativeInfo: [],
      },
      previewVisible: false,
      previewPhonesAsArray: [],
      previewImage: '',
      fileList: [],
      formFieldValues: {
        "activityContent": "",
        "activityTitle": "",
        "activityType": 1003,
        "applyContent": {},
        "contentType": 1,
        "endDateStr": "",
        // "previewPhones": "",
        "startDateStr": "",
        "status": 0,
        "tagId": "",
        "tagName": "",
        "titleImage": ""
      },
      editDiff: {
        editType: 'add',
        activityType: 'normal'
      },
      QRcodeShow: false,
      previewUrl: '',
      isSave: false,
      tagShow: false,
      isRequest: false,

    }

    this.onContentTypeChange = this.onContentTypeChange.bind(this);
    this.onEnteredContentChange = this.onEnteredContentChange.bind(this);
    this.handlePreview = this.handlePreview.bind(this);
    this.onPreviewPhoneChange = this.onPreviewPhoneChange.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onActivityDateChange = this.onActivityDateChange.bind(this);
    this.onActivityTypeChange = this.onActivityTypeChange.bind(this);
    this.onCouponChange = this.onCouponChange.bind(this);
    this.onCountModifyChange = this.onCountModifyChange.bind(this);

  };


  getTag() {
    Http.get('getTagList', { businessType: 1003 }, (callback) => {
      this.setState({ tagList: callback })
      console.log('tagList--->', callback)
    })
  }
  componentWillMount() {
    //获取标签下拉列表
    this.getTag()

    //获取优惠券下拉列表
    Http.get('getCouponList', { businessType: 1003 }, (callback) => {
      this.setState({ couponList: callback })
      console.log('couponList--->', callback)
    })

    //获取报名内容下拉列表
    Http.get('initApplyContent', { activityId: 0 }, (callback) => {
      this.setState({
        enteredList: {
          personInfo: callback['personInfo'],
          carInfo: callback['carInfo'],
          alternativeInfo: callback['alternativeInfo'],
        }
      })
      console.log('enteredList--->', callback)
    })




  }

  componentWillReceiveProps(nextProps) {
    console.log('nextProps===', nextProps)
    //编辑时只初始化一次
    if (initCount > 0) return !1
    const { formFieldValues } = nextProps

    if (Object.hasOwnProperty.call(formFieldValues, 'id') && formFieldValues['id'] !== null) {
      ++initCount
      this.init()
    }

  }

  componentDidMount() {
    this.addMobile()
  }

  init = () => {

    const { formFieldValues } = this.props
    const editDiff = {}
    const type = formFieldValues['activityType']

    editDiff['editType'] = Object.hasOwnProperty.call(formFieldValues, 'id') ? 'mod' : 'add'
    switch (type) {
      case 1003:
        editDiff['activityType'] = 'normal'
      case 1002:
        editDiff['activityType'] = 'enter'
      case 1001:
        editDiff['activityType'] = 'purchase'
      default:
        editDiff['activityType'] = 'normal'
    }

    this.setState({ editDiff })

  }

  removeMobile = (k) => {
    const { form } = this.props;
    const keys = form.getFieldValue('keys');
    if (keys.length === 1) {
      return;
    }


    const prevPhonesAsArray = [...this.state.previewPhonesAsArray]
    prevPhonesAsArray.splice(k, 1)

    this.setState({
      previewPhonesAsArray: [...prevPhonesAsArray]
    }, () => {
      console.log('removeMobile.index====', k, '===removeMobile.previewPhonesAsArray====', this.state.previewPhonesAsArray)
      const newState = { previewPhones: this.state.previewPhonesAsArray.join(',') }
      this.setState({
        formFieldValues: { ...this.state.formFieldValues, ...newState }
      }, () => {
        console.log('this.state.formFieldValues====', this.state.formFieldValues)
      })
    })


    form.setFieldsValue({
      keys: keys.filter(key => key !== k),
    });
  }

  addMobile = () => {

    const { form } = this.props;
    const keys = form.getFieldValue('keys');
    const nextKeys = keys.concat(uuid);
    uuid++;

    form.setFieldsValue({
      keys: nextKeys,
    });
  }

  normFile = (e) => {
    // console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  }
  handleUploadCancel = () => this.setState({ previewVisible: false })
  handleUploadChange = (info) => {
    const { fileList } = info
    const status = info.file.status
    let imgURLAsArr = []

    if (status === 'done') {
      fileList.map((item, index) => {
        const path = item['response']['data'];
        path ? imgURLAsArr.push(path) : message.error('图片文件服务器上传错误！');

      })


      this.setState({
        formFieldValues: { ...this.state.formFieldValues, ...{ titleImage: imgURLAsArr.join(',') } }
      }, () => {
        console.log('handleUploadChange===', this.state.formFieldValues)
      })

    }


    this.setState({ fileList })


  }

  handleUploadPreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }

  onConfirm = () => {
    const { props, state } = this
    const { getFieldsValue, resetFields, validateFieldsAndScroll } = props.form
    const currentFieldValues = getFieldsValue()
    validateFieldsAndScroll((errors, values) => {
      if (errors) {
        console.log('===errors===', errors, '==values==', values)
        return
      }
      currentFieldValues['statusDesc'] = currentFieldValues['status'] === 1 ? '启用' : '停用'
      props.onConfirm({ ...tempFormFieldValues, ...currentFieldValues })

      //props.onConfirm(currentFieldValues)
      resetFields()

    })



  }

  onCancel = () => {
    const { props } = this
    props.onCancel();
  }

  genEnteredContent = () => {
    const { onEnteredContentChange } = this
    const { getFieldDecorator } = this.props.form
    const { enteredList, formFieldValues, editDiff } = this.state
    const { applyContent } = formFieldValues
    const { personInfo, carInfo, alternativeInfo } = enteredList
    const { activityType } = editDiff
    return (
      activityType === 'enter' ? <FormItem
        {...checkboxLayout}
        label={<span className='required'>报名内容</span>}
      >

        <div>
          <Row>
            <Col span={24} style={{ paddingBottom: '5px' }}>
              个人信息
                        </Col>
            {
              personInfo.map((item, index) => {
                const _value = item['value']
                const _label = item['label']
                return (
                  <Col key={index} span={5}><Checkbox name={_value} key={index + ''} checked={applyContent[_value] === 1 ? true : false} value={_value} onChange={onEnteredContentChange}>{_label}</Checkbox></Col>
                )
              })
            }

          </Row>
          <Row>
            <Col span={24} style={{ paddingTop: '5px', paddingBottom: '5px' }}>
              车辆信息
                        </Col>
            {
              carInfo.map((item, index) => {
                const _value = item['value']
                const _label = item['label']
                return (
                  <Col key={index} span={5}><Checkbox name={_value} key={index + ''} checked={applyContent[_value] === 1 ? true : false} value={_value} onChange={onEnteredContentChange}>{_label}</Checkbox></Col>
                )
              })
            }

          </Row>
          <Row>
            <Col span={24} style={{ paddingTop: '5px', paddingBottom: '5px' }}>
              备选信息
                        </Col>
            {
              alternativeInfo.map((item, index) => {
                const _value = item['value']
                const _label = item['label']
                return (
                  <Col key={index} span={6} offset={index === 0 ? 0 : 1}><Input size='small' name={_value} placeholder={'备选' + (index + 1)} key={index + ''} onChange={onEnteredContentChange} /></Col>
                )
              })
            }

          </Row>
        </div>

      </FormItem> : null
    )
  }

  genTagDropdown = () => {
    const { onInputChange } = this
    const { getFieldDecorator } = this.props.form
    const { tagList } = this.state
    return (
      <FormItem
        {...formItemLayout}
        label="活动标签"
      >

        <Row gutter={12}>
          <Col span={16}>
            {getFieldDecorator('tag', {
              rules: [
                { required: false, message: '请选择活动标签！' },
              ],
            })(
              <Select placeholder="请选择" onChange={onInputChange.bind(this, 'tagId')}>
                {
                  tagList.map((item, index) => {
                    return (<Option value={item['value']} key={index}>{item['label']}</Option>)
                  })
                }

              </Select>
            )}
          </Col>
          <Col span={8}>
            <Button icon="tag" style={{ width: '100%' }} onClick={() => this.setState({ tagShow: true })}>设置</Button>
          </Col>
        </Row>

      </FormItem>
    )
  }

  jump = (url) => {
    history.push(url);
  }

  onCouponChange = (event) => {

    const selectedAsObj = this.state['couponList'].filter((item, index) => {
      return item['value'] === event
    })[0]
    console.log(selectedAsObj);

    const tempState = {
      couponLimit: selectedAsObj['others']['couponLimit'],
      couponLabel: selectedAsObj['label'],
      couponNo: selectedAsObj['value'],
    }
    debugger;
    this.setState({
      formFieldValues: { ...this.state.formFieldValues, ...tempState }
    }, () => {
      console.log('onCouponChange.formFieldValues=====', this.state.formFieldValues)
    })

  }

  onCountModifyChange = (limitNum, event) => {
    console.log('limitNum===', limitNum, 'event====', event)
    const targetVal = event

    const currentVal = targetVal >= limitNum ? limitNum : targetVal
    const tempState = { countModify: currentVal }

    this.setState({
      formFieldValues: { ...this.state.formFieldValues, ...tempState }
    }, () => {
      console.log('onCountModifyChange.formFieldValues=====', this.state.formFieldValues)
    })
  }

  genCouponDropdown = () => {
    const { onCouponChange, onCountModifyChange } = this
    const { getFieldDecorator } = this.props.form
    const { couponList, formFieldValues, editDiff } = this.state
    const { couponLimit } = formFieldValues
    const { activityType, editType } = editDiff
    return (
      activityType === 'purchase' ? <FormItem
        {...formItemLayout}
        label="优惠券"
      >

        <Row gutter={12}>
          <Col span={16}>
            {getFieldDecorator('coupon', {
              rules: [
                { required: true, message: '请选择优惠券！' },
              ],
            })(
              <Select placeholder="请选择" onChange={onCouponChange.bind(this)}>
                {
                  couponList.map((item, index) => {
                    return (<Option value={item['value']} key={index}>{item['label']}</Option>)
                  })
                }

              </Select>
            )}
          </Col>
          <Col span={8}>
            {getFieldDecorator('input-number2')(
              <InputNumber disabled={activityType === 'purchase' && editType === 'add'} style={{ width: '100%' }} placeholder="已抢数量" onChange={onCountModifyChange.bind(this, couponLimit)} min={0} max={couponLimit === 0 ? 0 : couponLimit} />
            )}
          </Col>
        </Row>

      </FormItem> : null
    )
  }

  /**
   * 普通输入框，下拉框的值处理
   */
  onInputChange = (field, event, obj) => {

    const isSelectTarget = !Object.hasOwnProperty.call(event, 'target')
    const value = isSelectTarget ? event : event.target.value
    const tempState = {}
    if (field === 'tagId') {
      tempState['tagName'] = obj.props.children
    }
    tempState[field] = value


    this.setState({
      formFieldValues: { ...this.state.formFieldValues, ...tempState }
    }, () => {
      console.log('onInputChange.formFieldValues=====', this.state.formFieldValues)
    })



  }

  /**
   * @description 活动类型变化时触发，并显示／隐藏表单不同字段
   */
  onActivityTypeChange = (field, event) => {
    const tempState = {}
    tempState[field] = event

    const editDiffTemp = { activityType: actTyps[event] }

    this.setState({
      editDiff: { ...this.state.editDiff, ...editDiffTemp }
    }, () => {
      console.log('editDiff===', this.state.editDiff)
    })

    this.setState({
      formFieldValues: { ...this.state.formFieldValues, ...tempState }
    }, () => {
      console.log('onActivityTypeChange.formFieldValues=====', this.state.formFieldValues)
    })
  }

  /**
   * @description 活动内容radio切换时触发
   */
  onContentTypeChange = (event) => {
    console.log('onContentTypeChange---->', event)
    const contentType = event.target.value
    const { formFieldValues } = this.state
    // if (event.target.value === 1) {
    //   formFieldValues['activityContent'] = ''
    //   delete formFieldValues['thirdPartLink']
    // } else {
    //   formFieldValues['thirdPartLink'] = ''
    //   delete formFieldValues['activityContent']
    // }
    // debugger;
    this.setState({
      formFieldValues: { ...formFieldValues, ...{ contentType } }
    }, () => {
      console.log('onContentTypeChange---->', this.state.formFieldValues)
    })
  }

  /**
 * @description 活动报名内容选择或输入变化时触发
 */
  onEnteredContentChange = (event) => {
    console.log('onEnteredContentChange---->', event)

    const target = event.target
    const targetType = target.type
    const targetName = target.name
    const isCheckbox = targetType === 'checkbox' ? true : false
    const value = isCheckbox ? (target.checked ? 1 : 0) : target.value

    const { formFieldValues } = this.state
    const { applyContent } = formFieldValues

    const newState = {}
    newState[targetName] = value
    const newFormFieldValues = { ...formFieldValues, ...{ applyContent: { ...applyContent, ...newState } } }
    this.setState({
      formFieldValues: { ...newFormFieldValues }
    }, () => {
      console.log('updated-applyContent----->', this.state.formFieldValues)
    })
  }

  /**
   * @description 可预览手机号变化时触发
   */
  onPreviewPhoneChange = (index = 0, event) => {
    const target = event.target
    const currentValue = target.value
    const prevPhonesAsArray = [...this.state.previewPhonesAsArray]

    prevPhonesAsArray[index] = currentValue
    this.setState({
      previewPhonesAsArray: [...prevPhonesAsArray]
    }, () => {
      console.log('onPreviewPhoneChange.index====', index, '===onPreviewPhoneChange.previewPhonesAsArray====', this.state.previewPhonesAsArray)
      const newState = { previewPhones: this.state.previewPhonesAsArray.join(',') }
      this.setState({
        formFieldValues: { ...this.state.formFieldValues, ...newState }
      }, () => {
        console.log('this.state.formFieldValues====', this.state.formFieldValues)
      })
    })

  }

  onActivityDateChange = (dateAsMoment, dateAsStr) => {
    const newState = { startDateStr: dateAsStr[0], endDateStr: dateAsStr[1] };
    this.setState({
      formFieldValues: { ...this.state.formFieldValues, ...newState }
    }, () => {
      console.log('onActivityDateChange.formFieldValues====', this.state.formFieldValues)
    })
  }


  /**
   * @description 通过URL生成二维码
   */
  genQRCodeWithUrl = () => {
    return (async () => {
      let str = await QRCode.toString('http://www.baidu.com')
      return str
    })()

  }

  /**
   * @description 点击预览按钮触发，todo先保存，后通过链接生成二维码
   * 
   */
  handlePreview = () => {
    const { previewPhones } = this.state.formFieldValues;
    if (this.isRequest) return !1;
    if (!previewPhones || (previewPhones && previewPhones.length < 11)) {
      this.setState({ isRequest: false });
      return message.error('请输入预览手机号后保存再预览！')
    }

    if(!this.state.isSave){
      return message.error('请保存后再预览！')
    }

    this.setState({ isRequest: true });
    const query = {
      businessType: 1003,
      businessId: ''
    }
    if (this.state.isSave) {
      Http.get('previewReady', query, (res) => {
        this.setState({ isRequest: false });
        if (res) {
          this.setState({
            QRcodeShow: true,
            previewUrl: res.previewUrl
          })
        }
      })

    } else {
      message.error('请先保存后再预览!')
    }

  }

  /**
   * @description 富文本编辑时触发
   */

  onRichChange = (activityContent) => {

    this.setState({
      formFieldValues: { ...this.state.formFieldValues, ...{ activityContent } }
    }, () => {
      console.log('onRichChange.formFieldValues===', this.state.formFieldValues)
    })

  }

  /**
  * 验证是否提交空
  * @param {Object} obj 
  */
  verification() {
    let result = false;
    const { activityType } = this.state.editDiff;
    const obj = { ...this.state.formFieldValues };
    if (obj['contentType'] == 1) {
      delete obj['thirdPartLink']
    } else {
      delete obj['activityContent']
    }
    this.setState({ formFieldValues: obj })
    for (let k in obj) {
      if (typeof obj[k] === 'string' && !obj[k].length) {
        if(k === 'activityTitle' || k === 'tagId' || k === 'tagName'){ continue }
        result = true;
        message.error('请填写完整！')
        break;
      } else if (activityType === "enter" && Object.prototype.toString.call(obj[k]) === "[object Object]") {
        let isPass = true;
        if (!Object.getOwnPropertyNames(obj[k]).length) {
          result = true;
          message.error('报名内容不能不选哦！')
          break;
        } else {
          for (let key in obj[k]) {
            if (obj[k][key]) {
              isPass = false
              break;
            }
          }
          if (isPass) {
            result = true;
            message.error('报名内容不能不选哦！')
            break;
          }
        }
      }

    }
    return result;
  }

  /**
   * @description 保存与发布触发
   * DRAFT(1001, "草稿"),
   * DELETED(1002, "已删除"),
   * UNSTART(1003, "未开始"),
   * EFFECTIVE(1004, "有效"),
   * FULL(1005, "已满额"),
   * EXPIRED(1006, "已过期");
   */
  handleSubmit = (btnType) => {
    const { validateFieldsAndScroll } = this.props.form
    if (this.isRequest) return !1;
    if (this.verification()) return !1;
    validateFieldsAndScroll((errors, values) => {
      if (errors) {
        console.log('===errors===', errors, '==values==', values)
        return
      }
      const _this = this;
      const statusMap = { save: 1001, pub: 1004 }
      const tempStatus = { status: statusMap[btnType] }
      this.setState({
        isRequest: true,
        formFieldValues: { ...this.state.formFieldValues, ...tempStatus },
        isSave: btnType === 'save' ? true : this.state.isSave
      }, () => {
        Http.post('activityHandle', { ...this.state.formFieldValues }, (callback) => {
          if (callback['success']) {
            message.success('操作成功')
            history.push('../infoDealer');
          } else {
            message.error(`${callback['errMsg']}，请重试！`)
            this.setState({ isRequest: false });
          }
        })
      })

    })



  }




  render() {
    const { onContentTypeChange, handlePreview, onPreviewPhoneChange, onInputChange, onActivityDateChange, onActivityTypeChange, onRichChange, handleSubmit } = this
    const { getFieldDecorator, getFieldValue, setFieldsValue } = this.props.form
    const { previewVisible, previewImage, fileList, formFieldValues, richOpt, editDiff } = this.state
    const { activityType } = editDiff


    const { contentType } = formFieldValues

    const rangeConfig = {
      rules: [{ type: 'array', required: true, message: '请选择时间！' }],
    };
    const uploadUrl = UPLOAD_IMAGE_PATH;
    //setFieldsValue({fileList})
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">添加</div>
      </div>
    );
    getFieldDecorator('keys', { initialValue: [0] });
    const keys = getFieldValue('keys');
    const formItems = keys.map((k, index) => {
      return (

        <FormItem
          {...formItemLayoutWithOutLabel}
          key={k}
        >
          <Row gutter={12}>
            <Col span={16}>
              <Input placeholder="手机号" style={{ width: '100%', }} onChange={onPreviewPhoneChange.bind(this, k)} />
            </Col>
            <Col span={8}>
              {keys.length > 0 ? (

                <Button style={{ width: '100%' }}
                  icon='delete'
                  disabled={index === 0}
                  onClick={() => this.removeMobile(k)}
                >移除</Button>

              ) : null}
            </Col>
          </Row>
        </FormItem>
      );
    });

    return (
      <div className='wrap' style={{ 'padding': '12px' }}>
        <Form>
          <FormItem
            {...formItemLayout}
            label="活动类型"
          >
            {getFieldDecorator('select', {
              initialValue: 1003,
              rules: [
                { required: true, message: '请选择活动类型！' },
              ],
            })(
              <Select placeholder="请选择" onChange={onActivityTypeChange.bind(this, 'activityType')}>
                <Option value={1003}>普通活动</Option>
                <Option value={1001}>抢购活动</Option>
                <Option value={1002}>报名活动</Option>

              </Select>
            )}
          </FormItem>

          {this.genTagDropdown()}
          {this.genCouponDropdown()}
          <FormItem
            {...formItemLayout}
            label="活动标题"
          >
            {getFieldDecorator('title', {
              rules: [{ required: false, message: '请正确填写！' }],
            })(
              <Input onChange={onInputChange.bind(this, 'activityTitle')} />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="活动时间"
          >
            {getFieldDecorator('range-picker', rangeConfig)(
              <RangePicker style={{ width: '100%' }} onChange={onActivityDateChange} />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="主题图片"
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
              >
                {fileList.length >= 1 ? null : uploadButton}
              </Upload>
            )}<span style={{ color: 'red' }}>* 请设置图片宽高比例 680:320(像素)</span>
          </FormItem>
          {activityType === 'enter' ? <FormItem
            {...formItemLayout}
            label="报名人数上限"
          >
            {getFieldDecorator('applyLimit', { initialValue: 0 })(
              <InputNumber onChange={onInputChange.bind(this, 'applyLimit')} min={0} max={65535} />
            )}
            <span className="ant-form-text">不填写或0表示人数不限</span>
          </FormItem> : null}


          {/* 报名内容 */}
          {this.genEnteredContent()}



          <FormItem
            {...formItemLayout}
            label="可预览手机号"
          >
            {formItems}
            <Button type="dashed" onClick={this.addMobile} style={{ width: '100%' }}>
              <Icon type="plus" /> 点击添加
              </Button>
          </FormItem>

          <FormItem
            {...formItemLayout}
            label="活动内容"
          >
            <div>
              <Radio name="contentType" value={1} checked={contentType === 1 ? true : false} onChange={onContentTypeChange}>图文</Radio>
              <Radio name="contentType" value={2} checked={contentType === 2 ? true : false} onChange={onContentTypeChange}>第三方模块</Radio>
            </div>

          </FormItem>


          <FormItem style={{ display: contentType === 1 ? 'block' : 'none' }}
            {...formItemRichText}
          >
            <RichText richOpt={richOpt} defaultValue={formFieldValues.activityContent} result={formFieldValues.activityContent} onChange={onRichChange.bind(this)}></RichText>
          </FormItem>

          <FormItem style={{ display: contentType === 2 ? 'block' : 'none' }}
            {...formItemLink}
          >
            <Input name="thirdPartLink" value={formFieldValues['thirdPartLink']} placeholder="请输入链接地址" onChange={onInputChange.bind(this, 'thirdPartLink')} />
          </FormItem>

          <div>
            {/* <div dangerouslySetInnerHTML={{ __html: this.genQRCodeWithUrl() }}></div> */}
          </div>




          <FormItem {...tailFormItemLayout}>
            <Button type="primary" htmlType="button" disabled={this.state.isRequest} icon="save" onClick={handleSubmit.bind(this, 'save')}>保存</Button>
            <Button type="default" htmlType="button" disabled={this.state.isRequest} icon="search" style={{ marginLeft: 8 }} onClick={handlePreview}>预览</Button>
            <Button type="primary" htmlType="button" disabled={this.state.isRequest} icon="export" style={{ marginLeft: 8 }} onClick={handleSubmit.bind(this, 'pub')}>发布</Button>
          </FormItem>
        </Form>

        <Modal visible={previewVisible} footer={null} onCancel={this.handleUploadCancel}>
          <img alt="image" style={{ width: '100%' }} src={previewImage} />
        </Modal>

        {/* 二维码预览 */}
        <QRcode show={this.state.QRcodeShow} URL={this.state.previewUrl} OK={() => { this.setState({ QRcodeShow: false }) }} />

        <Modal
          width={800}
          visible={this.state.tagShow}
          onCancel={() => { this.getTag(); this.setState({ tagShow: false }) }}
          onOk={() => { this.getTag(); this.setState({ tagShow: false }) }}
        >
          <Tag businessType={1003} />
        </Modal>
      </div>
    );
  };

}

/**
 * init初始化form表单😭
 */
const ActEditWithForm = Form.create({
  mapPropsToFields(props) {

    return (() => {
      let fields = {}
      let { formFieldValues } = props
      for (let field in formFieldValues) {
        fields[field] = Form.createFormField({
          value: formFieldValues[field]
        })
      }

      return fields
    })()

  },
})(ActEdit);

export default ActEditWithForm;