import React from 'react';
import moment from 'moment';
import {
    Form, Select, InputNumber, Switch, Radio, DatePicker, Table,
    Slider, Button, Upload, Icon, Rate, Input, Checkbox, Popconfirm, message,
    Row, Col, Modal,
} from 'antd';
import Http from '../../../utils/http';
import RichText from '../../../components/RichText/RichText';
import '../style/PublishDetail.scss';
// import Hotspot from '../../../components/common/SetHotspot'
import Tag from '../../tag/TagComp';
import DMCUtil from '../../../utils/DMCUtil'
import {SERVER_BASE_PATH,UPLOAD_IMAGE_PATH} from '../../../global.config'



const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const RangePicker = DatePicker.RangePicker;
const { TextArea } = Input;

let newState = {}, title = '', currentImgs = [];
const dateFormat = 'YYYY/MM/DD';

const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 18 },
};

message.config({
    top: 400,
    duration: 2,
})

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

const apis = [
    { "id": "uploadimage", "url": "cmyManage/sys/uploadFile" },
    { "id": "getCourseInfo", "url": "community/course/web/getCourseInfo/id" },
    { "id": "getTopicInfo", "url": "community/topic/web/getTopicInfo/id" },
    { "id": "insertComment", "url": "community/comment/insertComment", 'format': false },
    { "id": "queryCommentList", "url": "community/comment/queryCommentList" },
    { "id": "accusationList", "url": "community/accusation/searchPage" },
    { "id": "getTopDetail", "url": "community/topic/web/getTopicInfo/id" },
    { "id": "addTopItem", "url": "community/item/web/addItem" },
    { "id": "getTopItemInfo", "url": "community/item/app/getItemInfo/id" },
    { "id": "addRecommend", "url": "cmyManage/recommend/web/addRecommend" },
    { "id": "delRecommend", "url": "cmyManage/recommend/web/delRecommend" },
    { "id": "getTagList", "url": "cmyManage/tag/getTagList" },
    { "id": "addOrUpdateHotspot", "url": "cmyManage/hotspot/web/addOrUpdateHotspot", 'format': false },
    { "id": "delHotspot", "url": "cmyManage/hotspot/web/delHotspot" },
    { "id": "findHotspotWeb", "url": "cmyManage/hotspot/web/findHotspotWeb" },
];


const Authorization = DMCUtil.getJWTFromCookie()
Http.setDomainUrl(SERVER_BASE_PATH);

Http.setMutiApi(apis);
Http.setRequestHeader(Authorization)

class Tree extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            info: {},
            title: '',
            getCourseInfo: {
                courseImages: []
            },
            topicShow: false,
            editTopicShow: false,
            getTopicInfo: {},
            itemShow: false,
            getItemInfo: {
                itemImages: []
            },
            visible: false,
            criticism: false,
            currentRecord: {
                commentContent: ""
            },
            selectRrecordShow: false,
            recordData: [],
            selectReportShow: false,
            reportData: [],
            fileList: [],
            tagList: [],
            eidTopItem: {
                itemText: '',
                topicLabel: '',
                itemType: 0,
                // itemImages: 'https://carapptest.gtmc.com.cn/fs01/20180307/ee31e626eafb860ab06464dbf699dd49.jpg'
                itemImages: ''
            },
            eidTopItemImgs: [],
            setHotsShow: false,
            selectRepordData: {
                businessId: '',
                businessType: '',
                commentTime: '',
                commenterName: '',
            },
            setHotShow: false,
            hotFileList: [],
            hotEditData: {
                businessId: '',
                businessPic: '',
                businessTitle: '',
                businessType: 1001,
                endTime: '',
                startTime: '',
                hotOrder: 1
            },
            tagShow: false,
        }
    }



    handleChange(value) {
        const _this = this;
        this.state.tagList.map((item, index) => {
            if (item.value === value) {
                _this.setState({
                    eidTopItem: Object.assign(_this.state.eidTopItem, { topicLabel: item.label })
                })
            }
        })
    }

    noteEdit() {
        this.props.ok(!1);
        this.setState({
            visible: false,
        })
    }

    noteCancel() {
        this.props.ok(!1);
        this.setState({
            visible: false,
        })
    }
    writeComments() {
        const _this = this;
        const currentRecord = Object.assign({}, this.state.currentRecord);
        const query = {
            "businessId": currentRecord.id,
            "businessType": currentRecord.bizType || 1006,
            "commentContent": currentRecord.commentContent,
            "userType": 2
        }

        currentRecord['commentContent'] = "";
        this.setState({ criticism: false }, () => {
            Http.post('insertComment', query, (res) => {
                if (res) {
                    message.success('评论成功！');
                    _this.setState({ currentRecord })
                } else {
                    message.error('评论失败！')
                }
            })
        })
    }

    selectRrecord() {
        const _this = this;
        const current = Object.assign({}, this.state.currentRecord)
        let query = { ...this.state.selectRepordData };
        query['businessId'] = current.id
        query['businessType'] = current.bizType || 1006
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

    selectReport() {
        debugger
        const _this = this;
        const current = Object.assign({}, this.state.currentRecord)
        const query = {
            "businessId": current.id,
            "businessType": current.bizType || 1006,
            "limit": 999,
            "page": 1
        }
        this.setState({ selectReportShow: true }, () => {
            Http.post('accusationList', query, (res) => {
                if (res) {
                    _this.setState({ reportData: res.rows })
                }

            })
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

    partakeTopic() {
        const _this = this;
        let query = Object.assign({}, this.state.eidTopItem);
        if (this.verification(query)) {
            message.error('请填写完整！');
            return !1;
        }
        // query.dealerCode = "00000";
        query.topicId = this.state.getTopicInfo.id;
        query.topicTitle = this.state.getTopicInfo.topicTitle;
        Http.post('addTopItem', query, (res) => {
            _this.props.form.resetFields();
            _this.setState({
                editTopicShow: false,
                fileList: [],
                eidTopItemImgs: [],
                eidTopItem: {
                    itemText: '',
                    topicLabel: '',
                    itemType: 0,
                    itemImages: ''
                }
            })
        })
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
        } else if (status === 'error') {
            return message.error('图片文件服务器上传错误！');
        }
        this.setState({ hotFileList: fileList })
    }
    onHotDateChange = (dateAsMoment, dateAsStr) => {
        newState = { startTime: dateAsStr[0], endTime: dateAsStr[1] };
        let { hotEditData } = { ...this.state }
        hotEditData['startTime'] = dateAsStr[0];
        hotEditData['endTime'] = dateAsStr[1];
        this.setState({ hotEditData })
    }

    addEveRecommend(isAdd) {
        const _this = this;
        const { id, showRecommend } = this.state.currentRecord;
        const query = {
            // dealerCode: "00000",
            businessId: this.state.currentRecord.id,
            businessType: Number(this.props.data.bizType),
        }

        let changeObj = {
            currentRecord: Object.assign({}, _this.state.currentRecord, { showRecommend: !isAdd })
        };

        if (this.props.data.bizType == '1001') { // 话题
            changeObj['getTopicInfo'] = Object.assign({}, _this.state.getTopicInfo, { showRecommend: !isAdd })
        } else if (this.props.data.bizType == '1002') { // 动态
            changeObj['getCourseInfo'] = Object.assign({}, _this.state.getCourseInfo, { showRecommend: !isAdd })
        }


        if (isAdd) {
            Http.post('delRecommend', query, (res) => {
                _this.props.updateList({ id, isRe: false });
                _this.setState(changeObj)
                message.success('取消推荐成功！');
            })
        } else {
            Http.post('addRecommend', query, (res) => {
                _this.props.updateList({ id, isRe: true });
                _this.setState(changeObj)
                message.success('推荐成功！');
                _this.props.form.resetFields();
            })
        }
    }





    addEveHotspot() {
        const _this = this;
        const getTopicInfo = { ...this.state.getTopicInfo };
        getTopicInfo['showHot'] = true;
        const hotEditData = { ...this.state.hotEditData };
        for (let k in hotEditData) {
            if (typeof hotEditData[k] === 'string' && !hotEditData[k].length) {
                return message.error('请填写完整！')
            }
        }

        Http.post('addOrUpdateHotspot', hotEditData, (res) => {
            const hotEditData = {
                businessId: '',
                businessPic: '',
                businessTitle: '',
                businessType: 1001,
                endTime: '',
                startTime: '',
                hotOrder: 1
            }
            if (res) {
                if (res.data == 1) {
                    _this.setState({ getTopicInfo, hotEditData, hotFileList: [], setHotShow: false })
                    message.success('设置热点成功！');
                    _this.props.form.resetFields();
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


    rmEveHotspot() {
        const _this = this;
        const getTopicInfo = { ...this.state.getTopicInfo };
        const currentRecord = { ...this.state.currentRecord };
        const query = {
            businessId: this.state.currentRecord.id,
            businessType: Number(this.props.data.bizType),
        }
        getTopicInfo['showHot'] = false;
        const hotEditData = {
            businessId: '',
            businessPic: '',
            businessTitle: '',
            businessType: 1001,
            endTime: '',
            startTime: '',
            hotOrder: 1
        }
        Http.post('delHotspot', query, (res) => {
            _this.setState({ getTopicInfo, hotEditData, hotFileList: [], setHotShow: false })
            message.success('取消热点成功！');
        })
    }


    handleUploadPreview = (file) => {
        this.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true,
        });
    }
    handleUploadChange = (info) => {
        debugger;
        const { fileList } = info;
        const status = info.file.status;

        if (status === 'done') {
            currentImgs = [];
            fileList.map((item, index) => {
                const path = item['response']['data'];
                path ? currentImgs.push(path) : message.error('图片文件服务器上传错误！');
            })

            this.setState({
                eidTopItemImgs: Object.assign([], currentImgs),
                eidTopItem: { ...this.state.eidTopItem, ...{ itemImages: currentImgs.join(',') } }
            }, () => {
            })

        } else if (status === 'error') {
            return message.error('图片文件服务器上传错误！');
        }
        this.setState({ fileList });
    };

    removeImg(value) {
        let arr = Object.assign([], this.state.eidTopItemImgs);
        arr.forEach((item, index) => {
            if (item === value) {
                arr.splice(index, 1);
            }
        });
        currentImgs = [...arr];
        let eidTopItem = Object.assign({}, this.state.eidTopItem);
        eidTopItem.itemImages = arr.join(',');
        this.setState({
            eidTopItemImgs: arr,
            eidTopItem
        })
    }
    normFile = (e) => {
        console.log('Upload event:', e);
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    }

    onReportDateChange = (dateAsMoment, dateAsStr) => {
        let selectRepordData = Object.assign({}, this.state.selectRepordData)
        selectRepordData['commentTime'] = dateAsStr;
        this.setState({ selectRepordData })
    }

    changeType(v) {
        const eidTopItem = Object.assign({}, this.state.eidTopItem);
        if (v) {
            eidTopItem["bigText"] = ''
            eidTopItem["itemSummary"] = ''
            delete eidTopItem['itemText']
        } else {
            eidTopItem["itemType"] = ''
            delete eidTopItem['bigText']
            delete eidTopItem['itemSummary']
        }
        eidTopItem["itemType"] = v;
        this.setState({ eidTopItem });
    }

    componentDidMount() {
        // const query = {
        //     "businessType": 1001,
        //     "dealerCode": "00000",
        //     "businessId": 11
        // }
        // // Http.post('delHotspot', query, (res) => {
        // Http.post('addOrUpdateHotspot', query, (res) => {
        //     message.success('热点成功！');
        // })
    }
    getTag() {
        //获取标签下拉列表
        Http.get('getTagList', { businessType: 1001 }, (callback) => {
            this.setState({ tagList: callback })
            console.log('tagList--->', callback)
        })
    }
    componentWillReceiveProps(nextProps) {
        const _this = this;
        const bizType = nextProps.data.bizType
        if (nextProps.show) {
            let title = ''
            if (nextProps.data.bizType == '1002') {      // 动态
                title = "动态详情";
                Http.get("getCourseInfo", { id: nextProps.data.id }, (info) => {
                    let data = info
                    data.courseImages = data.courseImages ? data.courseImages.split(',') : [];

                    info ? _this.setState({ visible: true, getCourseInfo: Object.assign({bizType}, data), currentRecord: Object.assign({bizType}, data) }) : '';
                })
            } else if (nextProps.data.bizType == '1001') {    // 话题
                title = "话题详情";
                //获取标签下拉列表
                this.getTag()

                let hotFileList = [], hotEditData = { ...this.state.hotEditData }


                Http.get('getTopDetail', { id: nextProps.data.id }, (res) => {

                    if (res.showHot) {
                        Http.post('findHotspotWeb', { businessId: res.id, businessType: 1001 }, (result) => {
                            if (result && result.length) {
                                hotEditData['businessPic'] = result[0].businessPic;
                                hotEditData['businessTitle'] = result[0].businessTitle;
                                hotEditData['businessId'] = result[0].businessId;
                                hotEditData['endTime'] = moment(result[0].endTime).format('YYYY-MM-DD');
                                hotEditData['startTime'] = moment(result[0].startTime).format('YYYY-MM-DD');
                                hotEditData['hotOrder'] = result[0].hotOrder || 1;
                                hotEditData['id'] = result[0].id;

                                let titleImage = result[0].businessPic;
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
                            }

                        })
                    } else {
                        hotEditData['businessPic'] = res.topicImages;
                        hotEditData['businessTitle'] = res.topicTitle;
                        hotEditData['businessId'] = res.id;
                        let titleImage = res.topicImages.split(',');
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
                    }

                    this.setState({
                        visible: true,
                        getTopicInfo: Object.assign({}, res),
                        currentRecord: Object.assign({bizType}, res),
                        hotEditData,
                        hotFileList
                    })
                })

            } else if (nextProps.data.bizType == '1006') {    // 话题跟帖
                title = "话题跟帖详情";
                Http.get('getTopItemInfo', { id: nextProps.data.id }, (res) => {
                    let data = res
                    data.itemImages = data.itemImages ? data.itemImages.split(',') : [];
                    _this.setState({ visible: true, getItemInfo: Object.assign({bizType}, data), currentRecord: Object.assign({bizType}, data) })
                })
            }
            this.setState({ title });

        }
    }

    jump = (url) => {
        history.push(url);
    }

    render() {
        const { getFieldDecorator, getFieldValue, setFieldsValue } = this.props.form;
        const { previewVisible, previewImage, fileList, currentRecord, hotEditData } = this.state;
        const uploadUrl = UPLOAD_IMAGE_PATH;
        const uploadButton = (
            <div>
                <Icon type="plus" />
                <div className="ant-upload-text">添加</div>
            </div>
        );

        // 动态详情
        const getCourseInfo = <Form>
            <div style={{ marginTop: '-24px' }}>
                <Popconfirm
                    placement="bottom"
                    title={this.state.getCourseInfo.showRecommend ? "确定取消推荐 ?" : "确定推荐 ?"}
                    onConfirm={(e) => { this.addEveRecommend(this.state.getCourseInfo.showRecommend) }}
                    onCancel={(e) => { message.error('操作取消！'); }}
                    okText="确定"
                    cancelText="取消">
                    {this.state.getCourseInfo.showRecommend
                        ? <Button type="danger" style={{ marginRight: '3px' }}>取消推荐</Button>
                        : <Button type="primary" style={{ marginRight: '3px' }}>推荐</Button>}
                </Popconfirm>
                <Button type="primary" style={{ marginRight: '3px' }} onClick={() => { this.setState({ criticism: true, currentRecord: Object.assign({}, this.state.getCourseInfo) }) }}>评论</Button>
                <Button type="primary" style={{ marginRight: '3px' }} onClick={this.selectRrecord.bind(this)}>查看评论</Button>
                <Button type="primary" style={{ marginRight: '3px' }} onClick={this.selectReport.bind(this)}>查看举报</Button>
            </div>
            <FormItem
                {...formItemLayout}
                style={{ marginBottom: 0 }}
                label="类 型"

            >
                {this.state.getCourseInfo.type}
            </FormItem>
            <FormItem
                {...formItemLayout}
                style={{ marginBottom: 0 }}
                label="发布人"

            >
                {this.state.getCourseInfo.userName}
            </FormItem>
            <FormItem
                {...formItemLayout}
                style={{ marginBottom: 0 }}
                label="动态标签"

            >
                {this.state.getCourseInfo.courseLabel}
            </FormItem>

            <FormItem
                {...formItemLayout}
                style={{ marginBottom: 0 }}
                label={"动态图片"}

            >
                {this.state.getCourseInfo.courseImages.map((item, index) => {
                    return (
                        <img style={{ width: '140px', margin: '0 10px 10px 0' }} src={item} />
                    )
                })}
            </FormItem>
            <FormItem
                {...formItemLayout}
                style={{ marginBottom: 0 }}
                label="正文"

            >
                {this.state.getCourseInfo.courseType
                    ? <div className={'cont'} dangerouslySetInnerHTML={{ __html: this.state.getCourseInfo.bigText }} ></div>
                    : <TextArea disabled={true} defaultValue={this.state.getCourseInfo.courseText} placeholder="" autosize={{ minRows: 2, maxRows: 6 }} />}
            </FormItem>
        </Form>

        // 话题详情
        const getTopicInfo = <Form>
            <div style={{ marginTop: '-24px' }}>
                <Popconfirm
                    placement="bottom"
                    title={this.state.getTopicInfo.showRecommend ? "确定取消推荐 ?" : "确定推荐 ?"}
                    onConfirm={(e) => { this.addEveRecommend(this.state.getTopicInfo.showRecommend) }}
                    onCancel={(e) => { message.error('操作取消！'); }}
                    okText="确定"
                    cancelText="取消">
                    {this.state.getTopicInfo.showRecommend
                        ? <Button type="danger" style={{ marginRight: '3px' }}>取消推荐</Button>
                        : <Button type="primary" style={{ marginRight: '3px' }}>推荐</Button>}
                </Popconfirm>

                {this.state.getTopicInfo.showHot
                    ? <Button type="primary" style={{ marginRight: '3px' }} onClick={() => { this.setState({ setHotShow: true }) }}>编辑热点</Button>
                    : <Button type="primary" style={{ marginRight: '3px' }} onClick={() => { this.setState({ setHotShow: true }) }}>设置热点</Button>}

                <Button type="primary" style={{ marginRight: '3px' }} onClick={() => { this.setState({ editTopicShow: true }); this.props.form.resetFields(); }}>参与话题</Button>
                <Button type="primary" style={{ marginRight: '3px' }} onClick={this.selectReport.bind(this)}>查看举报</Button>
            </div>
            <FormItem
                {...formItemLayout}
                style={{ marginBottom: 0 }}
                label="类 型"

            >
                {this.state.getTopicInfo.type}
            </FormItem>
            <FormItem
                {...formItemLayout}
                style={{ marginBottom: 0 }}
                label="发布人"

            >
                {this.state.getTopicInfo.dealerName}
            </FormItem>
            <FormItem
                {...formItemLayout}
                style={{ marginBottom: 0 }}
                label="手机号"

            >
                {this.state.getTopicInfo.telephone}
            </FormItem>
            <FormItem
                {...formItemLayout}
                style={{ marginBottom: 0 }}
                label="话题标签"

            >
                {this.state.getTopicInfo.topicLabel}
            </FormItem>
            <FormItem
                {...formItemLayout}
                style={{ marginBottom: 0 }}
                label="话题标题"

            >
                {this.state.getTopicInfo.topicTitle}
            </FormItem>
            <FormItem
                {...formItemLayout}
                style={{ marginBottom: 0 }}
                label="话题图片"
            >
                <img style={{ width: '140px', margin: '0 10px 10px 0' }} src={this.state.getTopicInfo.topicImages} />

            </FormItem>
            <FormItem
                {...formItemLayout}
                style={{ marginBottom: 0 }}
                label="正文"
            >
                <div className={'cont'} dangerouslySetInnerHTML={{ __html: this.state.getTopicInfo.topicText }} ></div>
                {/* <TextArea disabled={true} defaultValue={this.state.getTopicInfo.topicText} placeholder="" autosize={{ minRows: 2, maxRows: 6 }} /> */}
            </FormItem>
        </Form>

        // 话题跟帖详情
        const getItemInfo = <Form>
            <div style={{ marginTop: '-24px' }}>
                <Button type="primary" style={{ marginRight: '3px' }} onClick={() => { this.setState({ criticism: true, currentRecord: Object.assign({}, this.state.getItemInfo) }) }}>评论</Button>
                <Button type="primary" style={{ marginRight: '3px' }} onClick={this.selectRrecord.bind(this)}>查看评论</Button>
                <Button type="primary" style={{ marginRight: '3px' }} onClick={this.selectReport.bind(this)}>查看举报</Button>
            </div>
            <FormItem
                {...formItemLayout}
                style={{ marginBottom: 0 }}
                label="类 型"

            >
                {this.state.getItemInfo.type}
            </FormItem>
            <FormItem
                {...formItemLayout}
                style={{ marginBottom: 0 }}
                label="发布人"

            >
                {this.state.getItemInfo.userName}
            </FormItem>
            <FormItem
                {...formItemLayout}
                style={{ marginBottom: 0 }}
                label="手机号"

            >
                {this.state.getItemInfo.phone}
            </FormItem>
            <FormItem
                {...formItemLayout}
                style={{ marginBottom: 0 }}
                label="话题标签"
            >
                {this.state.getItemInfo.topicLabel}
            </FormItem>
            <FormItem
                {...formItemLayout}
                style={{ marginBottom: 0 }}
                label="话题标题"

            >
                {this.state.getItemInfo.topicTitle}
            </FormItem>
            <FormItem
                {...formItemLayout}
                style={{ marginBottom: 0 }}
                label="话题图片"
            >
                {this.state.getItemInfo.itemImages.map((item, index) => {
                    return (
                        <img style={{ width: '140px', margin: '0 10px 10px 0' }} src={item} />
                    )
                })}
            </FormItem>
            <FormItem
                {...formItemLayout}
                style={{ marginBottom: 0 }}
                label="正文"
            >
                {this.state.getItemInfo.itemType
                    ? <div className={'cont'} dangerouslySetInnerHTML={{ __html: this.state.getItemInfo.bigText }} ></div>
                    : <TextArea disabled={true} defaultValue={this.state.getItemInfo.itemText} placeholder="" autosize={{ minRows: 2, maxRows: 6 }} />}

            </FormItem>
        </Form>




        return (
            <Modal
                width={700}
                title={this.state.title}
                visible={this.state.visible}
                onOk={this.noteEdit.bind(this)}
                onCancel={this.noteCancel.bind(this)} >
                {this.props.data.bizType == '1001' ? getTopicInfo : ''}
                {this.props.data.bizType == '1002' ? getCourseInfo : ''}
                {this.props.data.bizType == '1006' ? getItemInfo : ''}

                {/* 三级弹窗---写评论 */}
                <Modal
                    title={'写评论'}
                    visible={this.state.criticism}
                    onOk={() => { this.writeComments() }}
                    onCancel={() => { this.setState({ criticism: false }) }}>
                    <TextArea
                        value={this.state.currentRecord['commentContent']}
                        placeholder="说点什么……"
                        onChange={(e) => { this.setState({ currentRecord: Object.assign({}, this.state.currentRecord, { commentContent: e.target.value }) }) }}
                        autosize={{ minRows: 2, maxRows: 6 }} />
                </Modal>
                {/* 三级弹窗---查看评论 */}
                <Modal
                    title={'查看评论'}
                    width={780}
                    visible={this.state.selectRrecordShow}
                    onOk={() => { this.setState({ selectRrecordShow: false }) }}
                    onCancel={() => { this.setState({ selectRrecordShow: false }) }}>
                    <Form>
                        <FormItem>
                            <Row gutter={24}>
                                <Col span={10}>
                                    <FormItem {...formItemLayout} className={'ant-form-item'} label={`评论人`} style={{ width: '100%' }}>
                                        <Input onChange={e => { this.setState({ selectRepordData: { ...this.state.selectRepordData, commenterName: e.target.value } }) }} />
                                    </FormItem>
                                </Col>
                                <Col span={10}>
                                    <FormItem {...formItemLayout} className={'ant-form-item'} label={`评论时间`} style={{ width: '100%' }}>
                                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" onChange={this.onReportDateChange.bind(this)} />
                                    </FormItem>
                                </Col>

                            </Row>
                            <Row gutter={24} style={{ textAlign: 'right' }}>
                                <Button type="primary" htmlType="button" icon="search" onClick={this.selectRrecord.bind(this)}>查询</Button>
                            </Row>
                        </FormItem>
                    </Form>
                    <Table bordered columns={recordColumns} dataSource={this.state.recordData} />
                </Modal>

                {/* 三级弹窗---查看举报 */}
                <Modal
                    width={780}
                    title={'查看举报'}
                    visible={this.state.selectReportShow}
                    onOk={() => { this.setState({ selectReportShow: false }) }}
                    onCancel={() => { this.setState({ selectReportShow: false }) }}>
                    <Table bordered columns={reportColumns} dataSource={this.state.reportData} />
                </Modal>

                {/* <Hotspot
                    params={this.state.hotEditData}
                    form={this.props.form} /> */}
                {/* 三级弹窗---设置热点 */}
                {this.state.setHotShow
                    ? <Modal
                        title={currentRecord.showHot ? '编辑热点' : "设置热点"}
                        width={700}
                        visible={this.state.setHotShow}
                        onOk={() => { this.addEveHotspot() }}
                        cancelText={currentRecord.showHot ? '取消热点' : '取消'}
                        onCancel={() => { this.setState({ setHotShow: false }) }}>
                        <Row gutter={24} style={{ textAlign: 'right' }}>
                            {currentRecord.showHot
                                ? <Button type="primary" htmlType="button" onClick={this.rmEveHotspot.bind(this)}>取消热点</Button>
                                : ''}
                        </Row>
                        <Form>
                            <FormItem
                                {...formItemLayout}
                                label="热点标题"
                            >
                                {currentRecord.topicTitle}
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
                                </Upload><span style={{ color: 'red' }}>* 请设置图片宽高比例 680:250(像素)</span>
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="热点时间"
                            >
                                {getFieldDecorator('range-picker', {
                                    initialValue: [this.state.hotEditData['startTime'].length ? moment(this.state.hotEditData['startTime']) : null, this.state.hotEditData['endTime'].length ? moment(this.state.hotEditData['endTime']) : null],
                                    rules: [{ type: 'array', required: true, message: '请选择时间！' }],
                                })(
                                    <RangePicker style={{ width: '100%' }} onChange={this.onHotDateChange.bind(this)} />
                                )}
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="显示序号"
                            >
                                <InputNumber width={80} defaultValue={this.state.hotEditData.hotOrder} onChange={v => { this.setState({ hotEditData: Object.assign({}, this.state.hotEditData, { hotOrder: v }) }) }} min={0} max={9} />
                                <span style={{ color: 'red' }}> * 默认显示当前热点次序</span>
                            </FormItem>
                        </Form>
                    </Modal>
                    : ''}


                {/* 三级弹窗---参与话题跟帖 */}
                {this.state.editTopicShow
                    ? <Modal
                        width={800}
                        title={'参与话题跟帖'}
                        visible={this.state.editTopicShow}
                        onOk={() => { this.partakeTopic() }}
                        onCancel={() => { this.setState({ editTopicShow: false }) }}>
                        <Form>
                            <FormItem
                                {...formItemLayout}
                                style={{ marginBottom: 0 }}
                                label="发布人"
                            >
                                {this.state.getTopicInfo.dealerName}
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                style={{ marginBottom: 0 }}
                                label="话题标签"
                            >
                                {this.state.getTopicInfo.topicLabel}
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                style={{ marginBottom: 0 }}
                                label="话题标题"
                            >
                                {this.state.getTopicInfo.topicTitle}
                            </FormItem>

                            <FormItem
                                {...formItemLayout}
                                label="跟帖类型"
                            >
                                <Select placeholder="请选择"
                                    defaultValue={0}
                                    onChange={this.changeType.bind(this)}>
                                    <Option value={0}>图文模式</Option>
                                    <Option value={1}>图文穿插模式</Option>
                                </Select>
                            </FormItem>

                            <FormItem
                                {...formItemLayout}
                                label="话题标签"
                            >

                                <Row gutter={12}>
                                    <Col span={16}>
                                        {getFieldDecorator('topicLabel', {
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
                                label="主题图片"
                            >
                                <Upload
                                    action={uploadUrl}
                                    listType="picture-card"
                                    multiple={true}
                                    supportServerRender={true}
                                    fileList={fileList}
                                    onPreview={this.handleUploadPreview}
                                    onChange={this.handleUploadChange}
                                    onRemove={(obj) => { this.removeImg.bind(this, obj.response.data) }}
                                >
                                    {fileList.length >= 8 ? null : uploadButton}
                                </Upload><span style={{ color: 'red' }}>* 请设置图片宽高比例 290:180(像素)</span>
                            </FormItem>

                            {this.state['eidTopItem']['itemType']
                                ? <FormItem
                                    {...formItemLayout}
                                    label="内容摘要"
                                >
                                    {getFieldDecorator('itemSummary', {
                                        rules: [
                                            { required: true, message: '请输入内容摘要!' },
                                        ],
                                    })(
                                        <TextArea rows={4} onChange={v => { this.setState({ eidTopItem: Object.assign({}, this.state.eidTopItem, { itemSummary: v.target.value }) }) }} />
                                    )}

                                </FormItem>
                                : ''}

                            <FormItem
                                {...formItemLayout}
                                label="正文"
                            >
                                {this.state['eidTopItem']['itemType']
                                    ? getFieldDecorator('bigText', {
                                        rules: [
                                            { required: true, message: '请输入正文!' },
                                        ],
                                    })(
                                        <RichText
                                            // richOpt={{ uploadImageUrl: "//carapptest.gtmc.com.cn/appweb/cmyManage/sys/uploadFile" }}
                                            richOpt={{ uploadUrl }}
                                            defaultValue={this.state.eidTopItem.bigText}
                                            result={this.state.eidTopItem.bigText}
                                            onChange={(bigText) => { this.setState({ eidTopItem: Object.assign(this.state.eidTopItem, { bigText }) }) }}>
                                        </RichText>
                                    )
                                    : getFieldDecorator('itemText', {
                                        rules: [
                                            { required: true, message: '请输入正文!' },
                                        ],
                                    })(
                                        <TextArea rows={4} onChange={v => { this.setState({ eidTopItem: Object.assign({}, this.state.eidTopItem, { itemText: v.target.value }) }) }} />
                                    )}
                            </FormItem>
                        </Form>
                    </Modal>
                    : ""}


                <Modal
                    width={800}
                    visible={this.state.tagShow}
                    onCancel={() => { this.getTag(); this.setState({ tagShow: false }) }}
                    onOk={() => { this.getTag(); this.setState({ tagShow: false }) }}
                >
                    <Tag businessType={this.props.data.bizType} />
                </Modal>
            </Modal>


        );
    }
}


export default Tree;