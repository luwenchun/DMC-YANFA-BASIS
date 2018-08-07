/**
 *编辑活动
 */

import React from 'react';
import QRcode from '../../../components/common/QRCode';
import Http from '../../../utils/http';
import PropTypes from 'prop-types';
import history from '../../../utils/history';
import '../style/news.edit.scss';
import DMCUtil from '../../../utils/DMCUtil'
import {SERVER_BASE_PATH,UPLOAD_IMAGE_PATH} from '../../../global.config';
import {
  Form, Select, InputNumber, Switch, Radio,
  Slider, Button, Upload, Icon, Rate, Input, Checkbox, DatePicker,
  Row, Col, Modal, message, Popconfirm, Table,
} from 'antd';
import RichText from '../../../components/RichText/RichText';
const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
let uuid = 0;
const apis = [
  { "id": "uploadFile", "url": "//carapptest.gtmc.com.cn/appweb/cmyManage/sys/uploadFile" },
  { "id": "getTagList", "url": "cmyManage/tag/getTagList" },
  { "id": "insertNews", "url": "community/news/insertNews", "format": false },
  { "id": "updateNews", "url": "community/news/updateNews", "format": false },
  { "id": "addRecommend", "url": "cmyManage/recommend/web/addRecommend" },
  { "id": "delRecommend", "url": "cmyManage/recommend/web/delRecommend" },
  { "id": "previewReady", "url": "template/preview/ready" },
  { "id": "queryCommentList", "url": "community/comment/queryCommentList" },
  { "id": "accusationList", "url": "community/accusation/searchPage" },
  { "id": "queryPartakeInfoPage", "url": "community/activity/queryPartakeInfoPage" },
];

const Authorization = DMCUtil.getJWTFromCookie()
Http.setDomainUrl(SERVER_BASE_PATH);
Http.setMutiApi(apis);


const uploadImageUrl = UPLOAD_IMAGE_PATH
message.config({
  top: 400,
  duration: 2,
})

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 12 },
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
  },{
    title: '点赞数',
    dataIndex: 'praiseCount',
    key: 'praiseCount',
  }, {
    title: '评论时间',
    dataIndex: 'commentTime',
    key: 'commentTime',
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


let initCount = 0

class NewsEdit extends React.Component {

  static propTypes = {
    editType: PropTypes.string,
    formFieldValues: PropTypes.object,
  }

  static defaultProps = {
    formFieldValues: {},
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

    console.log(props.query)

    this.state = {
      isDetail: props.query.handle === 'detail',
      isEdit: props.query.handle === 'edit',
      isDisabled: props.query.handle === 'detail' && props.formFieldValues.status != 1001,
      richOpt: { UPLOAD_IMAGE_PATH },
      tagList: [],
      previewVisible: false,
      previewPhonesAsArray: [...(props.formFieldValues.previewPhone === null?[]:props.formFieldValues.previewPhone.split(','))],
      previewImage: '',
      previewUrl: 'http://localhost:9900/fed/admin/device-support',
      fileList,
      formFieldValues: {...props.formFieldValues},
      hasValidate:{
        isContentValidate:true,
        isThirdPartLinkValidate:true,
        isUploadValidate:true,
      },
      editDiff: {
        editType: 'add'
      },
      QRcodeShow: false,
      selectRrecordShow: false,
      recordData: [],
      reportData: [],
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

    }

    this.onContentTypeChange = this.onContentTypeChange.bind(this);
    this.handlePreview = this.handlePreview.bind(this);
    this.onPreviewPhoneChange = this.onPreviewPhoneChange.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onAccDateChange = this.onAccDateChange.bind(this);
    

  };



  componentWillMount() {
    //获取标签下拉列表
    Http.get('getTagList', { dealerCode: '00000', businessType: 1004 }, (callback) => {
      this.setState({ tagList: callback })
      console.log('tagList--->', callback)
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
    if(this.state.isEdit){
      this.setState({
        formFieldValues:{...this.state.formFieldValues,labelId:this.state.formFieldValues.tagId,labelName:this.state.formFieldValues.tagName}
      })
    }
    //this.addMobile()
  }

  selectAll(type) {
    const _this = this;
    let formFieldValues = { ...this.state.formFieldValues }
    const query = {
      "businessId": this.props.query.businessId,
      "businessType": this.props.query.businessType,
      "limit": 999,
      "page": 1
    }
    if(type === 'report') {
      this.setState({ selectReportShow: true }, () => {
        Http.post('accusationList', query, (res) => {
          if (res) {
            _this.setState({ reportData: res.rows })
          }

        })
      })

    } else if (type === 'comment') {

      this.setState({ selectRrecordShow: true }, () => {
        Http.get('queryCommentList', query, (res) => {
          if (res) {
            _this.setState({ recordData: res.rows })
          }

        })
      })
    }
  }

  init = () => {

    const { formFieldValues } = this.props
    const editDiff = {}

    editDiff['editType'] = Object.hasOwnProperty.call(formFieldValues, 'id') ? 'mod' : 'add'

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
      const newState = { previewPhone: this.state.previewPhonesAsArray.join(',') }
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

      console.log('fileupload-done====', fileList)
      fileList.map((item, index) => {
        console.info('item===', item['response']['data'])
        imgURLAsArr.push(item['response']['data'])

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


  genTagDropdown = () => {
    const { onInputChange } = this
    const { getFieldDecorator } = this.props.form
    const { tagList,formFieldValues,isDisabled } = this.state
    return (
      <FormItem
        {...formItemLayout}
        label="资讯标签"
      >

        <Row gutter={12}>
          <Col span={16}>
            {getFieldDecorator('tagId', {

              rules: [
                { required: true, message: '请选择活动标签！' },
              ],
            })(
              <Select disabled={isDisabled} placeholder="请选择" onChange={onInputChange.bind(this, 'labelId')}>
                {
                  tagList.map((item, index) => {
                    return (<Option value={item['value']} key={index}>{item['label']}</Option>)
                  })
                }

              </Select>
            )}
          </Col>
          <Col span={8}>
            <Button icon="tag" style={{ width: '100%' }} onClick={this.jump.bind(this, '../tag')}>设置</Button>
          </Col>
        </Row>

      </FormItem>
    )
  }

  jump = (url) => {
    history.push(url);
  }

  addEveRecommend(isAdd) {
    const _this = this;
    debugger;
    const formFieldValues = { ...this.state.formFieldValues };

    const query = {
      businessId: this.props.formFieldValues.id,
      businessType: this.props.query.businessType
    }
    formFieldValues['isRecommend'] = Number(!isAdd);
    if (isAdd) {
      Http.post('delRecommend', query, (res) => {
        _this.setState({ formFieldValues })
        message.success('取消推荐成功！');
      })
    } else {
      Http.post('addRecommend', query, (res) => {
        _this.setState({ formFieldValues })
        message.success('推荐成功！');
      })
    }
  }


  /**
   * 普通输入框，下拉框的值处理
   */
  onInputChange = (field, event, obj) => {
    const isSelectTarget = !Object.hasOwnProperty.call(event, 'target')
    const value = isSelectTarget ? event : event.target.value
    const tempState = {}
    tempState[field] = value
    if (field === 'labelId') {
      tempState['labelName'] = obj.props.children
    }

    this.setState({
      formFieldValues: { ...this.state.formFieldValues, ...tempState }
    }, () => {
      console.log('onInputChange.formFieldValues=====', this.state.formFieldValues)
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
      delete formFieldValues['content']
    }

    this.setState({
      formFieldValues: { ...formFieldValues, ...{ contentType } }
    }, () => {
      console.log('onContentTypeChange---->', this.state.formFieldValues)
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
      const newState = { previewPhone: this.state.previewPhonesAsArray.join(',') }
      this.setState({
        formFieldValues: { ...this.state.formFieldValues, ...newState }
      }, () => {
        console.log('this.state.formFieldValues====', this.state.formFieldValues)
      })
    })

  }

  /**
   * @description 点击预览按钮触发，todo先保存，后通过链接生成二维码
   * 
   */
  handlePreview = () => {
    const _this = this;
    const query = {
      businessType: this.props.query.businessType,
      businessId: this.props.formFieldValues.id
    }
    Http.get('previewReady', query, (res) => {
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
      formFieldValues: { ...this.state.formFieldValues, ...{ content: activityContent } }
    }, () => {
      console.log('onRichChange.formFieldValues===', this.state.formFieldValues)
    })

  }


  /**
   * @description 检查富文本，第三方链接及上传图片是否填写完整
   */
  checkVaildate = () => {
    const { formFieldValues } = this.state
    const { contentType } = formFieldValues
    let result = true
    if(contentType === 1){
      
      if(Object.hasOwnProperty.call(formFieldValues,'content')&&formFieldValues['content'].length>8){
        console.info('content------>',formFieldValues['content'].length,'-----formFieldValues---',formFieldValues['content'].length>8)
        this.setState({
          
          hasValidate:{isContentValidate:true,isThirdPartLinkValidate:true}
        },()=>{
          console.info('contentValidate------>',this.state.hasValidate)
        })
      }else{
        result = false
        this.setState({
          hasValidate:{isContentValidate:false,isThirdPartLinkValidate:true}
        },()=>{
          console.info('contentVaildate--error---->',this.state.hasValidate)
        })
      }
    }else{
      if(Object.hasOwnProperty.call(formFieldValues,'thirdPartLink')&&formFieldValues['thirdPartLink'].length>0){

        this.setState({
          hasValidate:{isContentValidate:true,isThirdPartLinkValidate:true}
        },()=>{
          console.info('thirdPartLinkValidate-pass----->',this.state.hasValidate)
        })
      }else{
        result = false
        this.setState({
          hasValidate:{isContentValidate:true,isThirdPartLinkValidate:false}
        },()=>{
          console.info('thirdPartLinkValidate--error---->',this.state.hasValidate)
        })
      }
    }

    if(formFieldValues['titleImage'].length > 0){
      this.setState({
        hasValidate:{isUploadValidate:true}
      },()=>{
        console.info('uploadValidate--pass---->',this.state.hasValidate)
      })
    }else{
      result = false
      this.setState({
        hasValidate:{isUploadValidate:false}
      },()=>{
        console.info('uploadValidate--error---->',this.state.hasValidate)
      })
    }
    
    return result

    
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
    const statusMap = { save: 1001, pub: 1004 }
    const tempStatus = { status: statusMap[btnType] }
    if(!this.checkVaildate()) return
    validateFieldsAndScroll((errors, values) => {
      if (errors) {
        console.log('===errors===', errors, '==values==', values)
        return
      }

    this.setState({
      formFieldValues: { ...this.state.formFieldValues, ...tempStatus }
    }, () => {
      const isNotAdd = this.state.isDetail||this.state.isEdit
      Http.post(isNotAdd?'updateNews':'insertNews', { ...this.state.formFieldValues }, (callback) => {
        console.log('submit-callback=====', callback)
        if (callback['success']) {
          message.success('操作成功')
          history.push('../infoDealer');
        } else {
          message.error(`${callback['errMsg']}，请重试！`)
        }
      })
    })
  })

  }

  onReportDateChange = (dateAsMoment, dateAsStr) => {
    let selectRepordData = Object.assign({}, this.state.selectRepordData)
    selectRepordData['commentTime'] = dateAsStr;
    this.setState({ selectRepordData })
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

  onAccDateChange = (dateAsMoment, dateAsStr) => {
    let selectAccData = Object.assign({}, this.state.selectAccData)
    selectAccData['accusationDate'] = dateAsStr;
    this.setState({ selectAccData })
  }

  handleAccSearch = () => {
    const params = {...this.state.selectAccData}

    Http.post('accusationList', params, (res) => {
      if (res) {
        this.setState({ reportData: res.rows })
      }

    })
  }



  render() {
    const { onContentTypeChange, handlePreview, onPreviewPhoneChange, onInputChange, onRichChange, handleSubmit, selectAll } = this
    const { getFieldDecorator, getFieldValue, setFieldsValue } = this.props.form
    const { previewVisible, previewImage, fileList, formFieldValues, richOpt, editDiff,previewPhonesAsArray,isDisabled,isDetail,hasValidate } = this.state


    const { contentType } = formFieldValues


    const uploadUrl = Http.getApi('uploadFile');
    const genArrayByLen = (len)=>{
      let result = []
      for(let i=0;i<len;i++){
        result.push(i)
      }
      return result
    }
    //setFieldsValue({fileList})
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">添加</div>
      </div>
    );
    getFieldDecorator('keys', { initialValue: previewPhonesAsArray.length ===0?[0]:genArrayByLen(previewPhonesAsArray.length) });
    const keys = getFieldValue('keys');
    console.log('previewPhonesAsArray===', previewPhonesAsArray)
    const formItems = keys.map((k, index) => {
      console.log('---k-----',k)
      return (

        <FormItem
          {...formItemLayoutWithOutLabel}
          key={`preview${k}`}
        >
          <Row gutter={12}>
            <Col span={16}>
              {getFieldDecorator(`names[${k}]`, {
                initialValue: previewPhonesAsArray[k],
              })(
                <Input disabled={isDisabled} key={`phone${k}`} placeholder="手机号" style={{ width: '100%', }} onChange={onPreviewPhoneChange.bind(this, k)} />
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

{formFieldValues['status'] != 1001?<Popconfirm
  placement="bottom"
  title={formFieldValues.isRecommend ? "确定取消推荐 ?" : "确定推荐 ?"}
  onConfirm={(e) => { this.addEveRecommend(formFieldValues.isRecommend) }}
  onCancel={(e) => { message.error('操作取消！'); }}
  okText="确定"
  cancelText="取消">
  {formFieldValues.isRecommend
    ? <Button type="danger" style={{ marginLeft: 8 }}>取消推荐</Button>
    : <Button type="primary" style={{ marginLeft: 8 }}>推荐</Button>}
</Popconfirm>:null}


{isDisabled||this.state.isDetail ? '' : <Button type="primary" htmlType="button" style={{ marginLeft: 8 }} icon="save" onClick={handleSubmit.bind(this, 'save')}>保存</Button>}
{formFieldValues['status'] != 1001||this.state.isDetail
  ? ''
  : <Button type="primary" htmlType="button" icon="export" style={{ marginLeft: 8 }} onClick={handleSubmit.bind(this, 'pub')}>发布</Button>}

{isDisabled ? <Button type="primary" htmlType="button" style={{ marginLeft: 8 }} icon="search" onClick={selectAll.bind(this, 'report')}>查看举报</Button> : ''}
{isDisabled ? <Button type="primary" htmlType="button" style={{ marginLeft: 8 }} icon="search" onClick={selectAll.bind(this, 'comment')}>查看评论</Button> : ''}

<Button type="default" htmlType="button" icon="search" style={{ marginLeft: 8 }} onClick={handlePreview}>预览</Button>
<Button type="primary" htmlType="button" style={{ marginLeft: 8 }} onClick={() => { history.push('../infoDealer') }}>返回</Button>



</Row>

        <Form>
          <FormItem
            {...formItemLayout}
            label="资讯标题"
          >
            {getFieldDecorator('title', {
              rules: [{ required: true, message: '请正确填写！'}],
            })(
              <Input disabled={isDisabled} onChange={onInputChange.bind(this, 'title')} />
            )}
          </FormItem>

          {this.genTagDropdown()}


          <FormItem
            {...formItemLayout}
            label={<span className="required">主题图片</span>}
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
                supportServerRender={true}
                onPreview={this.handleUploadPreview}
                onChange={this.handleUploadChange}
              >
                {fileList.length >= 1 ? null : uploadButton}
              </Upload>
              <span style={{ color: 'red' }}>* 请设置图片宽高比例 290:180(像素)</span>
              <div style={{color:'#f5222d',display:hasValidate['isUploadValidate']?'none':'block'}}>请添加主题图片！</div>
            {/* )} */}
          </FormItem>


          <FormItem
            {...formItemLayout}
            label="可预览手机号"
          >
            {formItems}
            {
              isDetail?null:<Button type="dashed" onClick={this.addMobile} style={{ width: '100%' }}>
              <Icon type="plus" /> 点击添加
            </Button>
            }
          </FormItem>

          <FormItem
            {...formItemLayout}
            label="内容概要"
          >
            {getFieldDecorator('newsSummary', {
              rules: [{ required: false}],
            })(
              <TextArea disabled={isDisabled} autosize={{ minRows: 4, maxRows: 4 }} onChange={onInputChange.bind(this, 'newsSummary')} />
            )}
          </FormItem>

          <FormItem
            {...formItemLayout}
            label={<span className="required">资讯内容</span>}
          >
            <div>
              <Radio style={{display:isDetail&&contentType === 2?'none':'inline-block'}} name="contentType" value={1} checked={contentType === 1 ? true : false} onChange={onContentTypeChange}>图文</Radio>
              <Radio style={{display:isDetail&&contentType === 1?'none':'inline-block'}} name="contentType" value={2} checked={contentType === 2 ? true : false} onChange={onContentTypeChange}>第三方模块</Radio>
            </div>

          </FormItem>


          <FormItem style={{ display: contentType === 1 ? 'block' : 'none' }}
            {...formItemRichText}
          >
            <RichText richOpt={richOpt} defaultValue={formFieldValues.content} result={formFieldValues.content} onChange={onRichChange.bind(this)}></RichText>
            <div style={{color:'#f5222d',display:hasValidate['isContentValidate']?'none':'block'}}>请填写富文本！</div>
          </FormItem>

          <FormItem style={{ display: contentType === 2 ? 'block' : 'none' }}
            {...formItemLink}
          >
          {getFieldDecorator('thirdPartLink', {

            })(
            <Input name="thirdPartLink" placeholder="请输入链接地址" onChange={onInputChange.bind(this, 'thirdPartLink')} />
            
            )}
            <div style={{color:'#f5222d',display:hasValidate['isThirdPartLinkValidate']?'none':'block'}}>请填写第三方链接！</div>
            
            </FormItem>

          {/* <FormItem {...tailFormItemLayout}>
            <Button type="primary" htmlType="button" icon="save" onClick={handleSubmit.bind(this, 'save')}>保存</Button>
            <Button type="default" htmlType="button" icon="search" style={{ marginLeft: 8 }} onClick={handlePreview}>预览</Button>
            <Button type="primary" htmlType="button" icon="export" style={{ marginLeft: 8 }} onClick={handleSubmit.bind(this, 'pub')}>发布</Button>
          </FormItem> */}
        </Form>

        <Modal visible={previewVisible} footer={null} onCancel={this.handleUploadCancel}>
          <img alt="uploadimage" style={{ width: '100%' }} src={previewImage} />
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

          <Table columns={recordColumns} dataSource={this.state.recordData} />
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
                    <Select placeholder="请选择" onChange={v => { this.setState({ selectAccData: { ...this.state.selectAccData, contentType: v} }) }} >
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


        {/* 二维码预览 */}
        <QRcode show={this.state.QRcodeShow} URL={this.state.previewUrl} OK={() => { this.setState({ QRcodeShow: false }) }} />

      </div>
    );
  };

}

/**
 * init初始化form表单😭
 */
const NewsEditWithForm = Form.create({
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
})(NewsEdit);

export default NewsEditWithForm;