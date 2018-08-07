/**
 *编辑活动
 */

import React from 'react';
import QRCode from 'qrcode';
import Http from '../../../utils/http';
import history from '../../../utils/history';
import PropTypes from 'prop-types';
import '../style/news.edit.scss';
import DMCUtil from '../../../utils/DMCUtil'
import { SERVER_BASE_PATH, UPLOAD_IMAGE_PATH } from '../../../global.config';
import {
    Form, Select, InputNumber, Switch, Radio,
    Slider, Button, Upload, Icon, Rate, Input, Checkbox,
    Row, Col, Modal, message, TreeSelect
} from 'antd';
import RichText from '../../../components/RichText/RichText';
import Preview from '../../../components/Preview/index';

const TreeNode = TreeSelect.TreeNode;
const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const orderChildren = [];

message.config({
    top: 400,
    duration: 2,
})
for (let i = 1; i <= 99; i++) {
    orderChildren.push(<Option value={i} key={i}>{i}</Option>)
}

let uuid = 0;
const apis = [
    { "id": "insertNews", "url": "community/news/insertNews", "format": false },
    { "id": "updateNews", "url": "community/news/updateNews", "format": false },
    { "id": "updateNews", "url": "community/news/updateNews", "format": false },
    { "id": "orderInfoByOrderId", "url": "online/api/v1/orderInfoByOrderId","format": false }  
];
  

const Authorization = DMCUtil.getJWTFromCookie()
Http.setDomainUrl("http://47.96.175.206:9030/");
Http.setMutiApi(apis);

let initValidates = {
    isContentValidate: true,
    isThirdPartLinkValidate: true,
    isUploadValidate: true,
}
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

        this.state = {
            richOpt: { UPLOAD_IMAGE_PATH },
            tagList: [],
            previewVisible: false,
            previewPhonesAsArray: [],
            previewImage: '',
            previewUrl: 'http://localhost:9900/fed/admin/device-support',
            fileList: [],
            formFieldValues: {
                "contentType": 0,
                "status": 0,
                "title": "",
                "titleImage": "",
                "isShow": 1,
                "isFullpush": 0,
                "newsSummary": '',
                "userId": null,
                "content": "",
                "DEALERCODE":"",
                "CONSULTANTID":""
                
                
            },
            findOfficialUser:[],
            hasValidate: { ...initValidates },
            editDiff: {
                editType: 'add'
            },
            isSave: false,
            isRequest: false,
            drShow: false,
            issuedShow:false,
            next: false,
            messageShow: false,
            message: "",
        }

        this.onContentTypeChange = this.onContentTypeChange.bind(this);
        this.handlePreview = this.handlePreview.bind(this);
        this.onPreviewPhoneChange = this.onPreviewPhoneChange.bind(this);
        this.onInputChange = this.onInputChange.bind(this);

    };



    componentWillMount() {
      const {data}={...this.props}

      const parmas={
        "orderId":data["ORDER_ID"] 
      }
      Http.get("orderInfoByOrderId", parmas, (res) => {
//  debugger
        if (res) {
          this.setState({ findOfficialUser: res.data })
          console.log(res)
          console.log("初始化请求数据",this.state)
        }
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
        let imgURLAsArr = ""

        if (status === 'done') {

            console.log('fileupload-done====', fileList)
            fileList.map((item, index) => {
                console.info('item===', item['response']['data'])
                imgURLAsArr = item['response']['data']

            })


            this.setState({
                formFieldValues: { ...this.state.formFieldValues, ...{ titleImage: imgURLAsArr } }
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

    jump = (url) => {
        this.props.history.push(url);
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
        if (event.target.value === 1) { //图文
            delete formFieldValues['thirdPartLink']
        } else if (event.target.value === 2) { // 第三方
            delete formFieldValues['thirdPartLink']
            delete formFieldValues['content']
        } else if (event.target.value === 3) { // 图片
            delete formFieldValues['thirdPartLink']
            delete formFieldValues['content']
        } else if (event.target.value === 4) { // 视频
            delete formFieldValues['thirdPartLink']
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

        this.setState({ drShow: true })


        // if (!this.state.isSave) {
        //   message.error('请先保存！')
        // }
        // this.genQRCodeWithUrl()
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
     * 清楚自定义验证的错误信息
     */
    clearErrorMsg = () => {
        setTimeout(() => {
            this.setState({
                hasValidate: { ...this.state.hasValidate, ...{ isThirdPartLinkValidate: true, isContentValidate: true, isUploadValidate: true } }
            })
        }, 2000)
    }

    /**
     * @description 检查富文本，第三方链接及上传图片是否填写完整
     */
    checkVaildate = () => {
        const { formFieldValues } = this.state
        const { contentType } = formFieldValues
        let result = true

        for (let k in formFieldValues) {
            if (typeof formFieldValues[k] === 'string' && !formFieldValues[k].length) {
                if (k === 'content') {
                    result = formFieldValues[k].replace(/<[^>]+>/g, "").length
                } else {
                    result = false
                }
            }
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
    cancelMsg() {
        this.setState({ messageShow: false });
        // return this.props.cancel(false);
    }

    confirmMsg() {
        const { btnType } = { ...this.state }
        const _this = this;
        if (this.state.isRequest) return !1;
        const { validateFieldsAndScroll } = this.props.form
        const statusMap = { save: 1001, pub: 1004 }
        const tempStatus = { status: statusMap[btnType || 'save'] }

        this.setState({
            formFieldValues: { ...this.state.formFieldValues, ...tempStatus },
            isSave: btnType === 'save' ? true : this.state.isSave,
            isRequest: true
        }, () => {
            console.log(JSON.stringify(this.state.formFieldValues))
            Http.post('insertNews', { ...this.state.formFieldValues }, (callback) => {
                console.log('submit-callback=====', callback)
                if (callback['success']) {
                    message.success('操作成功')
                    // history.go(0);
                    _this.setState({ messageShow: false });
                    _this.props.cancel();
                    _this.props.refurbish();
                } else if (callback && callback['status']) {
                    location.href = callback['location'] + "?_t=" + (new Date()).getMilliseconds();
                } else {
                    message.error(`${callback['errMsg']}，请重试！`)
                    this.setState({ isRequest: false })
                }
            })
        })
    }

    handleSubmit = (btnType) => {
        if (!this.checkVaildate()) return message.error('请填写完整！');
        if (btnType == 'pub') {
            const message = '发布后用户将直接读到发布内容，是否确认发布？';
            this.setState({ message, messageShow: true, btnType })
        } else {
            // debugger;
            this.confirmMsg();
        }

    }

  handleSubmitss = () => {
    const findOfficialUser = this.state.findOfficialUser;  
    console.log(23555523)
    console.log(findOfficialUser)
}
    goBack() {
        let { formFieldValues } = { ...this.state };
        formFieldValues['contentType'] = 0;
        formFieldValues['content'] = "";
        formFieldValues['thirdPartLink'] = "";
        // formFieldValues['sort'] = "";
        formFieldValues['isShow'] = 1;
        formFieldValues['isFullpush'] = 0;

        this.setState({
            next: false,
            formFieldValues: { ...formFieldValues },
            fileList: []
        })
    }

    cotrlPreview() {
        const v = { ...this.state.formFieldValues };
        const check = v.contentType == 1 && v.userId && v.title.length && v.content && v.content.length && v.titleImage.length;
        if (check) {
            this.setState({ drShow: true })
        } else {
            message.error(`请选择图文模式,并填写完整后再预览！`)
        }
    }

    cotrlNext() {
        const { contentType, title, userId } = { ...this.state.formFieldValues }
        // if (!title.length) return message.error('请填写标题！');
        // if (!userId) return message.error('请选择发布号！');
        if (!contentType) return message.error('请选择资讯模板！');
        this.setState({ next: contentType ? true : false })

        // this.setState
    }

    render() {
        const { onContentTypeChange, handlePreview, onPreviewPhoneChange, onInputChange, onRichChange, handleSubmit,handleSubmitss } = this
        const { getFieldDecorator, getFieldValue, setFieldsValue } = this.props.form
        const { previewVisible, previewImage, fileList, formFieldValues, richOpt, editDiff, hasValidate, next} = this.state
        const { findOfficialUser } = { ...this.state }
        const { data } = { ...this.state }
        console.info('render-hasValidate---->', hasValidate.isContentValidate)
        console.info('异步数据',findOfficialUser )
// debugger
        const { contentType } = formFieldValues

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
        console.log('keys===', keys)

        // 图片模板
        const ImgTemplate = (
            <div>
                {keys.map((k, index) => {
                    return (
                        <FormItem
                            {...formItemRichText}
                            key={k}
                        >
                            <Row gutter={24} style={{ border: '1px solid #ccc', padding: '5px 0', borderRadius: '5px',position:'relative' }}>
                                <Col span={19}>
                                
                                    {getFieldDecorator(`names[${k}]`)(
                                        <TextArea maxLength={30} autosize={{ minRows: 4, maxRows: 4 }} placeholder="图片描述" style={{ width: '100%', }} onChange={onPreviewPhoneChange.bind(this, k)} />
                                    )}
                                </Col>
                                <Col span={5} style={{ position: 'absolute' ,right:'5px', bottom:'5px'}}>
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
                })}
                <FormItem {...formItemRichText}>
                    <Button type="dashed" onClick={this.addMobile} style={{ width: '100%' }}>
                        <Icon type="plus" /> 点击添加
                </Button>
                </FormItem>
            </div>
        )


        return (
            <div className='wrap' style={{ 'padding': '12px' }}>
                <Form>
                    <FormItem style={{ marginLeft: 8 }} 
                        {...formItemLayout}
                        label="订单编号"
                    >
                    {console.log(findOfficialUser)}
                        <div>{findOfficialUser.ORDERID}</div>  
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="订单状态"
                    >
                        <div>{findOfficialUser.STATUS}</div>                        
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="销售店"
                    >
                        <div>{findOfficialUser.DEALERCODE}</div>                        
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="销售顾问"
                    >
                        <div>{findOfficialUser.CONSULTANTID}</div>                        
                    </FormItem>                   
                    <FormItem
                        {...formItemLayout}
                        label="客户姓名"
                    >
                        <div>{findOfficialUser.NAME}</div>                        
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="手机号"
                    >
                        <div>{findOfficialUser.PHONE}</div>                        
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="身份证号"
                    >
                        <div>{findOfficialUser.IDENTITYCARD}</div>                        
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="城市"
                    >
                        <div>{findOfficialUser.REGIONCODE}</div>                        
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="联系地址"
                    >
                        <div>{findOfficialUser.ADDRESS}</div>                        
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="车型"
                    >
                        <div>{findOfficialUser.MODELTYPE}</div>                        
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="指导售价"
                    >
                        <div>{findOfficialUser.SUGGESTEDRETAILPRICE}</div>                        
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="优惠金额"
                    >
                        <div>{findOfficialUser.SUGGESTEDRETAILPRICE-findOfficialUser.ACTUALPRICE}</div>                        
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="实际车款"
                    >
                        <div>{findOfficialUser.ACTUALPRICE}</div>                        
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="代办费用"
                    >
                        <div>{findOfficialUser.HELPFREE}</div>                        
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="保险费用"
                    >
                        <div>{findOfficialUser.INSURANCEFREE}</div>                        
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="精品费用"
                    >
                        <div>{findOfficialUser.THEGOODSFREE}</div>                        
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="其他费用"
                    >
                        <div>{findOfficialUser.OTHERFREE}</div>                        
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="订单总金额"
                    >
                        <div>{findOfficialUser.SUMFREE}</div>                        
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="定金"
                    >
                        <div>{findOfficialUser.DOWNPAYMENT}</div>                        
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="余款"
                    >
                        <div>{findOfficialUser.THEBLANCE}</div>                        
                    </FormItem>

                    {/* 富文本 */}
                    {next && contentType === 1
                        ? <FormItem {...formItemRichText}>
                            <RichText
                                richOpt={richOpt}
                                defaultValue={formFieldValues.content}
                                result={formFieldValues.content}
                                onChange={onRichChange.bind(this)}>
                            </RichText>
                            <div style={{ color: '#f5222d', display: hasValidate['isContentValidate'] ? 'none' : 'block' }}>请填写富文本！</div>
                        </FormItem>
                        : ""
                    }


                    {/* 第三方模块 */}
                    {next && contentType === 2
                        ? <FormItem {...formItemLink} >
                            <Input name="thirdPartLink" placeholder="请输入链接地址" onChange={onInputChange.bind(this, 'thirdPartLink')} />
                            <div style={{ color: '#f5222d', display: hasValidate['isThirdPartLinkValidate'] ? 'none' : 'block' }}>请填写第三方链接！</div>
                        </FormItem>
                        : ""
                    }


                    {/* 图片模板 */}
                    {next && contentType == 3
                        ? ImgTemplate
                        : ''}

       
                    <div style={{ textAlign: "right" }}>
                        <Button type="default" disabled={this.state.isRequest} htmlType="button" style={{ marginLeft: 8, float: "left", display: next ? 'inline-block' : 'none' }} onClick={this.goBack.bind(this)}>上一步</Button>
                        <Button type="default" disabled={this.state.isRequest} htmlType="button" style={{ marginLeft: 8, display: next ? 'inline-block' : 'none' }} onClick={() => { this.props.onMsg() }}>取消</Button>
                        <Button type="primary" disabled={this.state.isRequest} htmlType="button" icon="save" style={{ marginLeft: 8, display: next ? 'inline-block' : 'none' }} onClick={handleSubmit.bind(this, 'save')}>保存</Button>
                        <Button type="default" disabled={this.state.isRequest} htmlType="button" icon="search" style={{ marginLeft: 8, display: next ? 'inline-block' : 'none' }} onClick={this.cotrlPreview.bind(this)}>预览</Button>
                        <Button type="primary" disabled={this.state.isRequest} htmlType="button" icon="export" style={{ marginLeft: 8, display: next ? 'inline-block' : 'none' }} onClick={handleSubmit.bind(this, 'pub')}>发布</Button>
                        <Button type="default" disabled={this.state.isRequest} htmlType="button" style={{ marginLeft: 8, display: !next ? 'inline-block' : 'none' }} onClick={() => { this.props.cancel(false) }}>取消</Button>
                        <Button type="primary" disabled={this.state.isRequest} htmlType="button" style={{ marginLeft: 8, display: !next ? 'inline-block' : 'none' }} onClick={this.cotrlNext.bind(this)}>下一步</Button>
                        <Button type="primary" htmlType="button" onClick={() => { this.setState({ issuedShow: true }) }}>下发</Button>
                        
                    </div>
                </Form>
               
                 {/* 下发 */}
        {this.state.issuedShow
          ? <Modal
            title="销售订单下发"
            width={800}
            maskClosable={false}
            form={this.props.form}
            style={{ zIndex: 999 }}
            visible={this.state.issuedShow}
            onCancel={() => { this.setState({ issuedShow: false }) }}
            // onOk={() => { this.setState({ issuedShow: false }) }}
            onOk={handleSubmitss.bind(this, 'deletess',findOfficialUser)}
            // footer={null}
          >
          <Form layout={'inline'} className='ant-search-form'>
              <FormItem {...formItemLayout} label={`销售店`} style={{ width: '100%' }}>
             
                <Select value={formFieldValues.DEALERCODE} onChange={onInputChange.bind(this, 'DEALERCODE')} >
                  <Option value={""}>全部</Option>
                  <Option value={1}>EV10</Option>
                  <Option value={2}>EV20</Option>
                </Select>
              </FormItem>
              <FormItem {...formItemLayout} label={`销售顾问`} style={{ width: '100%' }}>
                <Select value={formFieldValues.CONSULTANTID} onChange={onInputChange.bind(this, 'CONSULTANTID')} >
                  <Option value={""}>全部</Option>
                  <Option value={1}>EV10</Option>
                  <Option value={2}>EV20</Option>
                </Select>
              </FormItem>
          </Form>
          </Modal>
          : ""
        }

                {this.state.drShow
                    ? <Modal
                        title={'预览'}
                        width={600}
                        visible={this.state.drShow}
                        onCancel={() => { this.setState({ drShow: false }) }}
                        onOk={() => { this.setState({ drShow: false }) }}
                        footer={null}
                    >
                        <Preview data={this.state.formFieldValues} />
                    </Modal>
                    : ""
                }

                {this.state.messageShow
                    ? <Modal
                        title={'提示'}
                        width={300}
                        style={{ top: '350px' }}
                        maskClosable={false}
                        visible={this.state.messageShow}
                        onCancel={this.cancelMsg.bind(this)}
                        onOk={this.confirmMsg.bind(this)}
                    >
                        {this.state.message}
                    </Modal>
                    : ""}







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