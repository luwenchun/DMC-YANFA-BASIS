/**
 *编辑活动
 */

import React from 'react';
import QRCode from 'qrcode';
import moment from 'moment';
import Http from '../../../utils/http';
import PropTypes from 'prop-types';
import history from '../../../utils/history';
 import '../style/act.edit.scss';
import {
  Form, Select, InputNumber, Switch, Radio, DatePicker, Slider, Button, Upload, Icon, Rate, Input, Checkbox, Popconfirm,
  Row, Col, Modal, message, Table
} from 'antd';
import RichText from '../../../components/RichText/RichText';
import QRcode from '../../../components/common/QRCode';
import {SERVER_BASE_PATH,UPLOAD_IMAGE_PATH} from '../../../global.config'
import DMCUtil from '../../../utils/DMCUtil'

const dateFormat = 'YYYY/MM/DD';
const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const RangePicker = DatePicker.RangePicker;
let uuid = 1, isRequest = false;
const apis = [
  { "id": "initApplyContent", "url": "community/activity/initApplyContent" },
  { "id": "uploadFile", "url": "cmyManage/sys/uploadFile" },
  { "id": "getTagList", "url": "cmyManage/tag/getTagList" },
  { "id": "getCouponList", "url": "community/activity/getCouponList" },
  { "id": "activityHandle", "url": "community/activity/handle", "format": false },
  { "id": "previewReady", "url": "template/preview/ready" },
  { "id": "addRecommend", "url": "cmyManage/recommend/web/addRecommend" },
  { "id": "delRecommend", "url": "cmyManage/recommend/web/delRecommend" },
  { "id": "addOrUpdateHotspot", "url": "cmyManage/hotspot/web/addOrUpdateHotspot", 'format': false },
  { "id": "delHotspot", "url": "cmyManage/hotspot/web/delHotspot" },
  { "id": "findHotspotWeb", "url": "cmyManage/hotspot/web/findHotspotWeb" },
  { "id": "accusationList", "url": "community/accusation/searchPage" },
  { "id": "queryCommentList", "url": "community/comment/queryCommentList" },
  { "id": "queryPartakeInfoPage", "url": "community/activity/queryPartakeInfoPage" },
  { "id": "modifyCount", "url": "community/activity/modifyCount" },
];

Http.setDomainUrl(SERVER_BASE_PATH);

Http.setMutiApi(apis);
const Authorization = DMCUtil.getJWTFromCookie()
Http.setRequestHeader(Authorization)

message.config({
  top: 400,
  duration: 2,
})

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 13 },
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

const recordColumns = [
  {
    title: '评论人',
    dataIndex: 'commenterName',
    key: 'commenterName',
  }, {
    title: '手机号',
    dataIndex: 'phone',
    key: 'phone',
  }, {
    title: '评论内容',
    dataIndex: 'commentContent',
    key: 'commentContent',
  }, {
    title: '点赞数',
    dataIndex: 'praiseCount',
    key: 'praiseCount',
  }, {
    title: '评论时间',
    dataIndex: 'commentTime',
    key: 'commentTime',
  }
];

const signUpColumns = [
  {
    title: '报名人',
    dataIndex: 'userName',
    key: 'userName',
  }, {
    title: '手机号',
    dataIndex: 'phone',
    key: 'phone',
  }, {
    title: '报名时间',
    dataIndex: 'partakeDate',
    key: 'partakeDate',
  }
];

const reportColumns = [
  {
    title: '举报人',
    dataIndex: 'accuserName',
    key: 'accuserName',
  }, {
    title: '手机号',
    dataIndex: 'accuserPhone',
    key: 'accuserPhone',
  }, {
    title: '举报内容',
    dataIndex: 'accusationContent',
    key: 'accusationContent',
  }, {
    title: '举报说明',
    dataIndex: 'detailExplain',
    key: 'detailExplain',
  }, {
    title: '举报时间',
    dataIndex: 'accusationDate',
    key: 'accusationDate',
  }
];



/**
 * 空方法
 */
function noop() { }

//不优雅的暂存编辑时要填充的数据😊
let tempFormFieldValues = {};

const actTyps = { 1001: 'purchase', 1002: 'enter', 1003: 'normal' }

let initCount = 0

class ActDetailEditComp extends React.Component {

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
    
    let fileList = [], titleImage = props.formFieldValues.titleImage;
    titleImage = titleImage.split(',');
    titleImage.forEach((item, index) => {
      let suffix = item.split('.');
      suffix = suffix[suffix.length - 1];
      fileList.push({
        uid: index + 1,
        name: `图片${index + 1}.${suffix}`,
        status: 'done',
        url: item,
      })
    })



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
      previewPhonesAsArray: props.formFieldValues.previewPhones ? props.formFieldValues.previewPhones.split(',') : [],
      previewImage: '',
      // previewUrl: 'https://carapptest.gtmc.com.cn/fs01/20180302/72307a2776fd0f512c65e2ff7b61c9ac.jpg',
      fileList,
      formFieldValues: { ...props.formFieldValues, applyContent: {}, modifCont: 0 },
      editDiff: {
        editType: 'add',
        activityType: 'normal'
      },
      QRcodeShow: false,
      previewUrl: '',
      isInitApplyContent: false,
      isDetail:props.query.handle === 'detail',
      isDisabled: props.query.handle === 'detail' && props.formFieldValues.status != 1001,
      selectRrecordShow: false,
      selectReportShow: false,
      recordData: [],
      selectRepordData: {
        businessId: props.query.businessId,
        businessType: props.query.businessType,
        commentTime: '',
        commenterName: '',
      },

      selectAccData: {
        businessId: props.query.businessId,
        businessType: props.query.businessType,
        accusationDate: '',
        contentType: '',
        limit: 10,
        page: 1,
      },

      signUpShow: false,
      reportData: [],
      signUpData: [],
      selectData: {
        activityId: props.query.businessId,
        limit: 10,
        page: 1,
        partakeDate: '',
        phone: '',
        userName: '',
      },
      setHotShow: false,
      hotFileList: fileList,
      hotEditData: {
        businessId: props.query.businessId,
        businessPic: props.formFieldValues.titleImage,
        businessTitle: props.formFieldValues.activityTitle,
        businessType: props.query.businessType,
        endTime: props.formFieldValues.endDate,
        startTime: props.formFieldValues.startDate,
        hotOrder: 1
      },

    }

    this.onContentTypeChange = this.onContentTypeChange.bind(this);
    this.onEnteredContentChange = this.onEnteredContentChange.bind(this);
    this.handlePreview = this.handlePreview.bind(this);
    this.onPreviewPhoneChange = this.onPreviewPhoneChange.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onActivityDateChange = this.onActivityDateChange.bind(this);
    this.onHotDateChange = this.onHotDateChange.bind(this);
    this.onActivityTypeChange = this.onActivityTypeChange.bind(this);
    this.onCouponChange = this.onCouponChange.bind(this);
    this.onCountModifyChange = this.onCountModifyChange.bind(this);
    this.onAccDateChange = this.onAccDateChange.bind(this);
    

  };



  componentWillMount() {
    const _this = this;
    //获取标签下拉列表
    Http.get('getTagList', { businessType: this.props.query.businessType }, (callback) => {
      this.setState({ tagList: callback })
      console.log('tagList--->', callback)
    })

    //获取优惠券下拉列表
    Http.get('getCouponList', { businessType: this.props.query.businessType }, (callback) => {
      this.setState({ couponList: callback })
      console.log('couponList--->', callback)
    })

    //获取报名内容下拉列表
    Http.get('initApplyContent', { activityId: this.props.formFieldValues.id }, (callback) => {
      if (!callback) return !1;
      let applyContent = {}
      callback['personInfo'].forEach((item, index) => {
        if (item['others']['checked']) {
          applyContent[item['value']] = 1
        }
      })
      callback['carInfo'].forEach((item, index) => {
        if (item['others']['checked']) {
          applyContent[item['value']] = 1
        }
      })

      this.setState({
        enteredList: {
          personInfo: callback['personInfo'],
          carInfo: callback['carInfo'],
          alternativeInfo: callback['alternativeInfo'],
        },
        formFieldValues: { ...this.state.formFieldValues, applyContent },
        isInitApplyContent: true
      }, () => {
        this.onActivityTypeChange('activityType', this.state.formFieldValues['activityType'])
      })
      console.log('enteredList--->', callback)
    })

    const params = {
      businessId: this.props.formFieldValues.id,
      businessType: 1003
    }
    if (this.props.formFieldValues.isHot) {
      Http.post('findHotspotWeb', params, (res) => {
        debugger;
        if (res && res.length) {
          const hotEditData = {
            businessId: res[0].businessId,
            businessPic: res[0].businessPic,
            businessTitle: res[0].businessTitle,
            businessType: 1003,
            endTime: moment(res[0].endTime).format('YYYY-MM-DD'),
            startTime: moment(res[0].startTime).format('YYYY-MM-DD'),
            id: res[0].id,
            hotOrder: res[0].hotOrder || 1
          }
          console.log(hotEditData['startTime'])
          console.log(hotEditData['endTime'])
          let hotFileList = [], titleImage = res[0].businessPic;
          titleImage = titleImage.split(',');
          titleImage.forEach((item, index) => {
            let suffix = item.split('.');
            suffix = suffix[suffix.length - 1];
            hotFileList.push({
              uid: index + 1,
              name: `图片${index + 1}.${suffix}`,
              status: 'done',
              url: item,
            })
          })
          _this.setState({ hotEditData, hotFileList });
        }
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log('nextProps===', nextProps)
    //编辑时只初始化一次
    if (initCount > 0) return !1
    const { formFieldValues } = Object.assign({}, nextProps);
    // this.setState({ formFieldValues })
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
        imgURLAsArr.push(item['response']['data'])
      })
      this.setState({
        formFieldValues: { ...this.state.formFieldValues, ...{ titleImage: imgURLAsArr.join(',') } }
      }, () => {
      })
    }
    this.setState({ fileList })
  }

  hotUploadChange = (info) => {
    const { fileList } = info
    const status = info.file.status
    let imgURLAsArr = []

    if (status === 'done') {
      fileList.map((item, index) => {
        imgURLAsArr.push(item['response']['data'])
      })
      this.setState({
        hotEditData: { ...this.state.hotEditData, ...{ businessPic: imgURLAsArr.join(',') } }
      }, () => {
      })
    }
    this.setState({ hotFileList: fileList })
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
        label="报名内容"
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
                  <Col key={index} span={5}><Checkbox name={_value} key={index + ''} checked={applyContent[_value] ? true : false} value={_value} onChange={onEnteredContentChange}>{_label}</Checkbox></Col>
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
                  <Col key={index} span={5}><Checkbox name={_value} key={index + ''} checked={applyContent[_value] ? true : false} value={_value} onChange={onEnteredContentChange}>{_label}</Checkbox></Col>
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
                  <Col key={index} span={6} offset={index === 0 ? 0 : 1}><Input size='small' name={_value} defaultValue={_label} placeholder={'备选' + (index + 1)} key={index + ''} onChange={onEnteredContentChange} /></Col>
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
    const { tagList, formFieldValues, isDisabled } = this.state
    return (
      <FormItem
        {...formItemLayout}
        label="活动标签"
      >

        <Row gutter={12}>
          <Col span={16}>
            {getFieldDecorator('tag', {
              initialValue: formFieldValues['tagId'],
              rules: [
                { required: false, message: '请选择活动标签！' },
              ],
            })(
              <Select disabled={isDisabled} placeholder="请选择" onChange={onInputChange.bind(this, 'tagId')}>
                {
                  tagList.map((item, index) => {
                    return (<Option value={item['value']} key={index}>{item['label']}</Option>)
                  })
                }

              </Select>
            )}
          </Col>
          <Col span={8}>
            <Button disabled={isDisabled} icon="tag" style={{ width: '100%' }} onClick={this.jump.bind(this, '../tag')}>设置</Button>
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
      couponLimit: selectedAsObj['others']['countLimit'],
      couponLabel: selectedAsObj['label'],
      couponNo: selectedAsObj['value'],
    }

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
    const { couponList, formFieldValues, editDiff, isDisabled } = this.state
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
              <Select disabled={isDisabled} placeholder="请选择" onChange={onCouponChange.bind(this)}>
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
    console.log('field====', field, 'event----', event)
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
    if (event.target.value === 1) {
      delete formFieldValues['thirdPartLink']
    } else {
      delete formFieldValues['activityContent']
    }

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

  onHotDateChange = (dateAsMoment, dateAsStr) => {
    const newState = { startTime: dateAsStr[0], endTime: dateAsStr[1] };
    this.setState({
      hotEditData: { ...this.state.hotEditData, ...newState }
    })
  }




  /**
   * @description 点击预览按钮触发，todo先保存，后通过链接生成二维码
   * 
   */
  handlePreview = () => {
    if (isRequest) return !1;
    isRequest = true;
    const _this = this;
    const query = {
      businessType: this.props.query.businessType,
      businessId: this.props.formFieldValues.id
    }
    Http.get('previewReady', query, (res) => {
      isRequest = false;
      if (res) {
        this.setState({
          QRcodeShow: true,
          previewUrl: res.previewUrl
        })
      }
    })

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
   * @description 保存与发布触发
   * DRAFT(1001, "草稿"),
   * DELETED(1002, "已删除"),
   * UNSTART(1003, "未开始"),
   * EFFECTIVE(1004, "有效"),
   * FULL(1005, "已满额"),
   * EXPIRED(1006, "已过期");
   */
  handleSubmit = (btnType) => {
    if (isRequest) return !1;
    isRequest = true;
    const statusMap = { save: 1001, pub: 1004 }
    const tempStatus = { status: statusMap[btnType] }
    this.setState({
      formFieldValues: { ...this.state.formFieldValues, ...tempStatus }
    }, () => {
      let formFieldValues = { ...this.state.formFieldValues }
      for (let k in formFieldValues) {
        if (!formFieldValues[k]) {
          delete formFieldValues[k];
        }
      }

      if (!formFieldValues["startDateStr"]) {
        formFieldValues["startDateStr"] = formFieldValues["startDate"]
      }
      if (!formFieldValues["endDateStr"]) {
        formFieldValues["endDateStr"] = formFieldValues["endDate"]
      }
      delete formFieldValues["startDate"]
      delete formFieldValues["endDate"]
      delete formFieldValues["dealerCode"]
      delete formFieldValues["dealerName"]


      Http.post('activityHandle', formFieldValues, (callback) => {
        isRequest = false
        console.log('submit-callback=====', callback)
        if (callback['success']) {
          message.success('操作成功')
          history.push('../infoDealer');
        } else {
          message.error(`${callback['errMsg']}，请重试！`)
        }
      })
    })

  }

  addEveRecommend(isAdd) {
    if (isRequest) return !1;
    isRequest = true;
    const _this = this;
    const formFieldValues = { ...this.state.formFieldValues };

    const query = {
      businessId: this.props.formFieldValues.id,
      businessType: this.props.query.businessType
    }
    formFieldValues['isRecommend'] = Number(!isAdd);
    if (isAdd) {
      Http.post('delRecommend', query, (res) => {
        isRequest = false;
        _this.setState({ formFieldValues })
        message.success('取消推荐成功！');
      })
    } else {
      Http.post('addRecommend', query, (res) => {
        isRequest = false;
        _this.setState({ formFieldValues, hotEditData, hotFileList: [], setHotShow: false })
        message.success('推荐成功！');
      })
    }
  }

  rmEveHotspot() {
    const _this = this;
    const formFieldValues = { ...this.state.formFieldValues };
    const query = {
      businessId: this.props.formFieldValues.id,
      businessType: this.props.query.businessType
    }

    formFieldValues['isHot'] = false;
    Http.post('delHotspot', query, (res) => {
      _this.setState({ formFieldValues, setHotShow: false })
      message.success('取消热点成功！');
    })
  }

  addEveHotspot() {
    const _this = this;
    const formFieldValues = { ...this.state.formFieldValues };
    formFieldValues['isHot'] = true;
    const hotEditData = { ...this.state.hotEditData };
    for (let k in hotEditData) {
      if (k !== 'businessTitle'&&typeof hotEditData[k] === 'string' && !hotEditData[k].length) {
        return message.error('请填写完整！')
      }
    }

    Http.post('addOrUpdateHotspot', hotEditData, (res) => {
      if (res) {
        if (res.data == 1) {
          _this.setState({ formFieldValues, setHotShow: false })
          message.success('设置热点成功！');
        } else if (res.data == 0) {
          message.error('设置热点失败！');
        } else if (res.data == 3) {
          message.error('设置热点次数上限！');
        } else {
          message.error('系统错误！');
        }
      }
    })

  }

  selectPartakeInfo() {
    const _this = this;
    let query = { ...this.state.selectData };
    for (let k in query) {
      if (typeof query[k] === 'string' && !query[k].length) {
        delete query[k]
      }
    }
    Http.post('queryPartakeInfoPage', query, (res) => {
      isRequest = false;
      if (res) {
        _this.setState({ signUpData: res.rows })
      }
    })
  }

  selectRepordList() {
    const _this = this;
    let query = { ...this.state.selectRepordData };
    for (let k in query) {
      if (typeof query[k] === 'string' && !query[k].length) {
        delete query[k]
      }
    }
    this.setState({ selectRrecordShow: true }, () => {
      Http.get('queryCommentList', query, (res) => {
        if (res) {
          _this.setState({ recordData: res.rows })
        }

      })
    })
  }


  selectAll(type) {
    const _this = this;
    let formFieldValues = { ...this.state.formFieldValues }

    let query = { ...this.state.selectData };
    for (let k in query) {
      if (typeof query[k] === 'string' && !query[k].length) {
        delete query[k]
      }
    }
    if (type === 'signUp') {
      this.setState({ signUpShow: true }, () => {
        this.selectPartakeInfo();
      })

    } else if (type === 'report') {
      this.setState({ selectReportShow: true }, () => {
        Http.post('accusationList', query, (res) => {
          if (res) {
            _this.setState({ reportData: res.rows })
          }

        })
      })

    } else if (type === 'comment') {
      this.selectRepordList();
    }
  }

  setApplicants() {
    if (isRequest) return !1;
    isRequest = true;
    const { activityType, couponActual, applyActual } = this.state.formFieldValues;
    const query = {
      activityId: this.props.query.businessId,
      count: this.state.formFieldValues['modifCont']
    }
    if (activityType == 1001) query['count'] = couponActual || 0;
    if (activityType == 1002) query['count'] = applyActual || 0;
    if (activityType == null) query['count'] = 0;
    let Url = Http.getApi("modifyCount");
    Url = Url.split('?')[0];
    Url += `?activityId=${this.props.query.businessId}&count=${query['count']}`
    Http.setApi('modifyCount', Url, undefined, false);
    Http.post('modifyCount', query, (res) => {
      isRequest = false;
      if (res.resultCode == 200) {
        message.success('修改上限人数成功！')
      } else {
        message.error(res.errMsg)
      }
    })
  }

  /**
 * 选择发布时间时触发
 */
  onPublishDateChange = (dateAsMoment, dateAsStr) => {
    let selectData = Object.assign({}, this.state.selectData)
    selectData['partakeDate'] = dateAsStr;
    this.setState({ selectData })
  }

  onReportDateChange = (dateAsMoment, dateAsStr) => {
    let selectRepordData = Object.assign({}, this.state.selectRepordData)
    selectRepordData['commentTime'] = dateAsStr;
    this.setState({ selectRepordData })
  }

  onAccDateChange = (dateAsMoment, dateAsStr) => {
    let selectAccData = Object.assign({}, this.state.selectAccData)
    selectAccData['accusationDate'] = dateAsStr;
    this.setState({ selectAccData })
  }

  handleAccSearch = () => {
    const params = { ...this.state.selectAccData }

    Http.post('accusationList', params, (res) => {
      if (res) {
        this.setState({ reportData: res.rows })
      }

    })
  }

  render() {
    const { onContentTypeChange, handlePreview, onPreviewPhoneChange, onInputChange, onActivityDateChange, onActivityTypeChange, onRichChange, handleSubmit, selectAll, onHotDateChange } = this
    const { getFieldDecorator, getFieldValue, setFieldsValue } = this.props.form
    const { previewVisible, previewImage, fileList, formFieldValues, richOpt, editDiff, previewPhonesAsArray, isInitApplyContent, isDisabled, hotEditData } = this.state
    const { activityType } = editDiff
    const { contentType } = formFieldValues

    console.log("hotEditData====", hotEditData)
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
              {getFieldDecorator(`names[${k}]`, {
                initialValue: previewPhonesAsArray[k],
                validateTrigger: ['onChange', 'onBlur'],
                rules: [{
                  required: true,
                  message: "请填写手机号！",
                }],
              })(
                <Input placeholder="手机号" style={{ width: '100%', }} onChange={onPreviewPhoneChange.bind(this, k)} />
              )}
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
        <Row gutter={12} style={{ textAlign: 'right', paddingBottom: 20 }}>

          {formFieldValues['status'] != 1001
            ? <Popconfirm
              placement="bottom"
              title={formFieldValues.isRecommend ? "确定取消推荐 ?" : "确定推荐 ?"}
              onConfirm={(e) => { this.addEveRecommend(formFieldValues.isRecommend) }}
              onCancel={(e) => { message.error('操作取消！'); }}
              okText="确定"
              cancelText="取消">
              {formFieldValues.isRecommend
                ? <Button type="danger" style={{ marginLeft: 8 }}>取消推荐</Button>
                : <Button type="primary" style={{ marginLeft: 8 }}>推荐</Button>}
            </Popconfirm>
            : ''}

          {formFieldValues['status'] != 1001 && formFieldValues['activityType'] === 1002
            ? <Button type="primary" htmlType="button" icon="edit" style={{ marginLeft: 8 }} onClick={this.setApplicants.bind(this)}>修改报名人数</Button>
            : ''}

          {formFieldValues['status'] != 1001 && formFieldValues['activityType'] === 1001
            ? <Button type="primary" htmlType="button" icon="edit" style={{ marginLeft: 8 }} onClick={this.setApplicants.bind(this)}>修改已抢券</Button>
            : ''}



          {isDisabled||this.state.isDetail ? '' : <Button type="primary" htmlType="button" style={{ marginLeft: 8 }} icon="save" onClick={handleSubmit.bind(this, 'save')}>保存</Button>}
          {formFieldValues['status'] != 1001||this.state.isDetail
            ? (formFieldValues.isHot
              ? <Button type="primary" icon="edit" style={{ marginLeft: 8 }} onClick={() => { this.setState({ setHotShow: true }) }}>编辑热点</Button>
              : <Button type="primary" icon="edit" style={{ marginLeft: 8 }} onClick={() => { this.setState({ setHotShow: true }) }}>设置热点</Button>)
            : <Button type="primary" htmlType="button" icon="export" style={{ marginLeft: 8 }} onClick={handleSubmit.bind(this, 'pub')}>发布</Button>}


          {isDisabled && formFieldValues['activityType'] === 1002 ? <Button type="primary" htmlType="button" style={{ marginLeft: 8 }} icon="search" onClick={selectAll.bind(this, 'signUp')}>查看报名</Button> : ''}
          {isDisabled ? <Button type="primary" htmlType="button" style={{ marginLeft: 8 }} icon="search" onClick={selectAll.bind(this, 'report')}>查看举报</Button> : ''}
          {isDisabled ? <Button type="primary" htmlType="button" style={{ marginLeft: 8 }} icon="search" onClick={selectAll.bind(this, 'comment')}>查看评论</Button> : ''}

          <Button type="default" htmlType="button" icon="search" style={{ marginLeft: 8 }} onClick={handlePreview}>预览</Button>
          <Button type="primary" htmlType="button" style={{ marginLeft: 8 }} onClick={() => { history.push('../infoDealer') }}>返回</Button>



        </Row>

        <Form>
          <FormItem
            {...formItemLayout}
            label="活动类型"
          >
            {getFieldDecorator('select', {
              initialValue: formFieldValues['activityType'],
              rules: [
                { required: true, message: '请选择活动类型！' },
              ],
            })(
              <Select disabled={isDisabled} placeholder="请选择" onChange={onActivityTypeChange.bind(this, 'activityType')}>
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
              initialValue: formFieldValues['activityTitle'],
              rules: [{ required: false, message: '请填写活动标题！' }],
            })(
              <Input disabled={isDisabled} onChange={onInputChange.bind(this, 'activityTitle')} />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="活动时间"
          >
            {getFieldDecorator('range-picker', {
              initialValue: [moment(formFieldValues['startDate'], dateFormat), moment(formFieldValues['endDate'], dateFormat)],
              rules: [{ type: 'array', required: true, message: '请选择时间！' }],
            })(
              <RangePicker disabled={isDisabled} style={{ width: '100%' }} onChange={onActivityDateChange} />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="主题图片"
          >
            {/* {getFieldDecorator('upload', {
              valuePropName: 'fileList',
              getValueFromEvent: this.normFile,
            })( */}
            <Upload
              action={uploadUrl}
              listType="picture-card"
              multiple={true}
              fileList={fileList}
              disabled={isDisabled}
              supportServerRender={true}
              onPreview={this.handleUploadPreview}
              onChange={this.handleUploadChange}
            >
              {fileList.length >= 1 ? null : uploadButton}
            </Upload><span style={{ color: 'red' }}>* 请设置图片宽高比例 680:320(像素)</span>
            {/* )} */}
          </FormItem>
          {activityType === 'enter' ? <FormItem
            {...formItemLayout}
            label="已参加人数"
          >
            {getFieldDecorator('modifCont', { initialValue: formFieldValues['applyActual'] ? formFieldValues['applyActual'] : 0 })(
              <InputNumber onChange={onInputChange.bind(this, 'applyActual')} min={0} max={9999} />
            )}
            <span style={{ verticalAlign: 'middle' }}>人</span>
            <div style={{ color: 'red', display: 'inline-block', verticalAlign: 'middle', paddingLeft: '20px' }}>
              <p style={{ margin: 0, lineHeight: "16px" }}>报名上限人数：{formFieldValues['applyLimit'] ? formFieldValues['applyLimit'] : 0}</p>
              <p style={{ margin: 0, lineHeight: "16px" }}>不填写或0表示人数不限</p>
            </div>
          </FormItem> : null}

          {formFieldValues['activityType'] == 1001 && formFieldValues['status'] != 1001 ?
            <FormItem
              {...formItemLayout}
              label="已抢优惠券"
            >
              {getFieldDecorator('modifCont', { initialValue: formFieldValues['couponActual'] ? formFieldValues['couponActual'] : 0 })(
                <InputNumber onChange={onInputChange.bind(this, 'couponActual')} min={0} max={65535} />
              )}
              <div style={{ color: 'red', display: 'inline-block', verticalAlign: 'middle' }}>
                <p style={{ margin: 0, lineHeight: "16px" }}>优惠券名称：{formFieldValues['couponLabel'] ? formFieldValues['couponLabel'] : 0}</p>
                <p style={{ margin: 0, lineHeight: "16px" }}>优惠券数量：{formFieldValues['couponLimit'] ? formFieldValues['couponLimit'] : 0}</p>
              </div>
            </FormItem>
            : null}


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
            <Input defaultValue={formFieldValues.thirdPartLink} name="thirdPartLink" placeholder="请输入链接地址" onChange={onInputChange.bind(this, 'thirdPartLink')} />
          </FormItem>

          <div>
            {/* <div dangerouslySetInnerHTML={{ __html: this.genQRCodeWithUrl() }}></div> */}
          </div>
        </Form>


        <Modal visible={previewVisible} footer={null} onCancel={this.handleUploadCancel}>
          <img alt="image" style={{ width: '100%' }} src={previewImage} />
        </Modal>



        <Modal
          title={'查看报名'}
          width={700}
          visible={this.state.signUpShow}
          onOk={() => { this.setState({ signUpShow: false }) }}
          onCancel={() => { this.setState({ signUpShow: false }) }}>
          <Form>
            <FormItem>
              <Row gutter={24}>
                <Col span={10}>
                  <FormItem {...formItemLayout} className='ant-form-item' label={`报名人`} style={{ width: '100%' }}>
                    <Input onChange={e => { this.setState({ selectData: { ...this.state.selectData, userName: e.target.value } }) }} />
                  </FormItem>
                </Col>
                <Col span={10}>
                  <FormItem {...formItemLayout} className='ant-form-item' label={`报名时间`} style={{ width: '100%' }}>
                    <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" onChange={this.onPublishDateChange.bind(this)} />
                  </FormItem>
                </Col>

              </Row>
              <Row gutter={24} style={{ textAlign: 'right' }}>
                <Button type="primary" htmlType="button" icon="search" onClick={this.selectPartakeInfo.bind(this)}>查询</Button>
              </Row>
            </FormItem>
          </Form>
          <Table bordered columns={signUpColumns} dataSource={this.state.signUpData} />
        </Modal>

        <Modal
          title={'查看评论'}
          width={700}
          visible={this.state.selectRrecordShow}
          onOk={() => { this.setState({ selectRrecordShow: false }) }}
          onCancel={() => { this.setState({ selectRrecordShow: false }) }}>
          <Form>
            <FormItem>
              <Row gutter={24}>
                <Col span={10}>
                  <FormItem {...formItemLayout} className='ant-form-item' label={`评论人`} style={{ width: '100%' }}>
                    <Input onChange={e => { this.setState({ selectRepordData: { ...this.state.selectRepordData, commenterName: e.target.value } }) }} />
                  </FormItem>
                </Col>
                <Col span={10}>
                  <FormItem {...formItemLayout} className='ant-form-item' label={`评论时间`} style={{ width: '100%' }}>
                    <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" onChange={this.onReportDateChange.bind(this)} />
                  </FormItem>
                </Col>
                <Col span={4}>
                  <Button type="primary" htmlType="button" icon="search" onClick={this.selectRepordList.bind(this)}>查询</Button>
                </Col>

              </Row>
            </FormItem>
          </Form>
          <Table bordered columns={recordColumns} dataSource={this.state.recordData} />
        </Modal>


        <Modal
          title={'查看举报'}
          width={700}
          visible={this.state.selectReportShow}
          onOk={() => { this.setState({ selectReportShow: false }) }}
          onCancel={() => { this.setState({ selectReportShow: false }) }}>

          <Form>
            <FormItem>
              <Row gutter={24}>
                <Col span={10}>
                  <FormItem {...formItemLayout} className='ant-form-item' label={`举报内容`} style={{ width: '100%' }}>
                    <Select placeholder="请选择" onChange={v => { this.setState({ selectAccData: { ...this.state.selectAccData, contentType: v } }) }} >
                      <Option value={null}>全部</Option>
                      <Option value={'SV'}>色情低俗</Option>
                      <Option value={'RD'}>谣言诈骗</Option>
                      <Option value={'PO'}>政治</Option>
                      <Option value={'TO'}>侵权</Option>
                      <Option value={'OT'}>其他</Option>

                    </Select>
                  </FormItem>
                </Col>
                <Col span={10}>
                  <FormItem {...formItemLayout} className='ant-form-item' label={`举报时间`} style={{ width: '100%' }}>
                    <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" onChange={this.onAccDateChange.bind(this)} />
                  </FormItem>
                </Col>
                <Col span={4}>
                  <Button type="primary" htmlType="button" icon="search" onClick={this.handleAccSearch.bind(this)}>查询</Button>
                </Col>

              </Row>
            </FormItem>
          </Form>

          <Table columns={reportColumns} dataSource={this.state.reportData} />
        </Modal>

        <Modal
          title={formFieldValues.isHot ? '编辑热点' : "设置热点"}
          width={700}
          visible={this.state.setHotShow}
          onOk={() => { this.addEveHotspot() }}
          cancelText={'取消'}
          onCancel={() => { this.setState({ setHotShow: false }) }}>
          <Row gutter={24} style={{ textAlign: 'right' }}>
            {formFieldValues.isHot
              ? <Button type="primary" htmlType="button" onClick={this.rmEveHotspot.bind(this)}>取消热点</Button>
              : ''}
          </Row>
          <Form>
            <FormItem
              {...formItemLayout}
              label="热点标题"
            >
              {formFieldValues.activityTitle}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="热点图片"
            >
              <Upload
                action={uploadUrl}
                listType="picture-card"
                multiple={true}
                fileList={this.state.hotFileList}
                supportServerRender={true}
                onPreview={this.handleUploadPreview}
                onChange={this.hotUploadChange}
              >
                {this.state.hotFileList.length >= 1 ? null : uploadButton}
              </Upload><span style={{ color: 'red' }}>* 请设置图片宽高比例 2.4 : 1</span>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="热点时间"
            >
              {getFieldDecorator('range-picker', {
                initialValue: [moment(hotEditData['startTime']), moment(hotEditData['endTime'])],
                rules: [{ type: 'array', required: true, message: '请选择时间！' }],
              })(
                <RangePicker style={{ width: '100%' }} onChange={onHotDateChange} />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="显示序号"
            >
              <InputNumber width={80} defaultValue={hotEditData.hotOrder} onChange={v => { this.setState({ hotEditData: Object.assign({}, this.state.hotEditData, { hotOrder: v }) }) }} min={0} max={99} />
              <span style={{ color: 'red' }}> * 默认显示当前热点次序</span>
            </FormItem>
          </Form>
        </Modal>


        {/* 二维码预览 */}
        <QRcode show={this.state.QRcodeShow} URL={this.state.previewUrl} OK={() => { this.setState({ QRcodeShow: false }) }} />
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
})(ActDetailEditComp);

export default ActEditWithForm;