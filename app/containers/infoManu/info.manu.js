/**
 *咨询管理列表
 */

import React from 'react';
import Http from '../../utils/http';
import PropTypes from 'prop-types';
import moment from 'moment';
import DealerTree from '../../components/common/dealerTree';
import './style/info.scss';
import { Form, Row, Col, Input, Select, DatePicker, TimePicker, Button, Table, Icon, Divider, Menu, Dropdown, Popconfirm, } from 'antd';
import history from '../../utils/history';
import Store from 'store';
import DMCUtil from '../../utils/DMCUtil'
import QRcode from '../../components/common/QRCode';

import {SERVER_BASE_PATH} from '../../global.config'

const { Column, ColumnGroup } = Table;
const FormItem = Form.Item;
const Option = Select.Option;
const MonthPicker = DatePicker.MonthPicker;
const RangePicker = DatePicker.RangePicker;

const title = '资讯管理';


const apis = [
  { "id": "demoList", "url": "demo/list" },
  { "id": "infoList", "url": "community/infoWeb/page" },
  { "id": "ActivityDelete", "url": "community/activity/delete" },
  { "id": "NewsUpdateNews", "url": "community/news/updateNews" },
  { "id": "deleteNews", "url": "community/news/web/deleteNews" },
  { "id": "previewReady", "url": "template/preview/ready" },
];

Http.setDomainUrl(SERVER_BASE_PATH);

Http.setMutiApi(apis);
const Authorization = DMCUtil.getJWTFromCookie()
Http.setRequestHeader(Authorization)

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },

    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },

    sm: { span: 16 },
  },
};


class Info extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expand: false,
      columns: [
        {
          title: '类型',
          dataIndex: 'type',
          width: 120,
          key: 'type',
          fixed: 'left',
        },
        {
          title: '发布方',
          dataIndex: 'dealerName',
          width: 220,
          key: 'dealerName',
          fixed: 'left',
        },
        {
          title: '标题',
          dataIndex: 'title',
          width: 200,
          key: 'title',
        },
        {
          title: '热点活动',
          dataIndex: 'isHot',
          width: 120,
          key: 'isHot',
        },
        {
          title: '活动开始时间',
          dataIndex: 'startDate',
          width: 200,
          key: 'startDate',
        },
        {
          title: '活动结束时间',
          dataIndex: 'endDate',
          width: 200,
          key: 'endDate',
        },
        {
          title: '发布时间',
          dataIndex: 'publishDate',
          width: 200,
          key: 'publishDate',
        },
        {
          title: '报名数',
          dataIndex: 'applyActual',
          width: 120,
          key: 'applyActual',
        },
        {
          title: '优惠券发放数量',
          dataIndex: 'couponLimit',
          width: 120,
          key: 'couponLimit',
        },
        {
          title: '实际已抢数量',
          dataIndex: 'couponActual',
          width: 120,
          key: 'couponActual',
        },
        {
          title: '虚拟已抢数量',
          dataIndex: 'couponModify',
          width: 120,
          key: 'couponModify',
        },
        {
          title: '实际剩余数量',
          dataIndex: 'actualRemainder',
          width: 120,
          key: 'actualRemainder',
        },
        {
          title: '虚拟剩余数量',
          dataIndex: 'modifyRemainder',
          width: 120,
          key: 'modifyRemainder',
        },
        {
          title: '点赞数',
          dataIndex: 'praiseNumber',
          width: 120,
          key: 'praiseNumber',
        },
        {
          title: '评论数',
          dataIndex: 'commentNumber',
          width: 120,
          key: 'commentNumber',
        },
        {
          title: '分享数',
          dataIndex: 'shareNumber',
          width: 120,
          key: 'shareNumber',
        },
        {
          title: '状态',
          dataIndex: 'statusDes',
          width: 100,
          key: 'statusDes',
        },
        {
          title: '是否置顶',
          dataIndex: 'isTop',
          width: 200,
          key: 'isTop',
        },
        {
          title: '置顶次序',
          dataIndex: 'topOrder',
          width: 200,
          key: 'topOrder',
        },
        {
          title: '置顶时间',
          dataIndex: 'topDate',
          width: 200,
          key: 'topDate',
        },
        {
          title: '热点显示状态',
          dataIndex: 'hotState',
          width: 200,
          key: 'hotState',
        },
        {
          title: '操作',
          key: 'operation',
          fixed: 'right',
          width: 180,
          render: (text, record) => {
            const { onAction } = this
            return (
              <span>
                <a href="javascript:void(0)" onClick={onAction.bind(this, 'detail', record)}>详情</a>
                <span style={{ display: record.dealerCode === '00000' ? 'inline-block' : 'none' }}>
                  {record['status'] != 1002
                    ? <Divider type="vertical" />
                    : ""}
                  {record['status'] != 1002
                    ? <a href="javascript:void(0)" onClick={onAction.bind(this, 'preview', record)}>预览</a>
                    : ""}
                  {record['status'] == 1001
                    ? <Divider type="vertical" />
                    : ""}
                  {record['status'] == 1001
                    ? <a href="javascript:void(0)" onClick={onAction.bind(this, 'edit', record)}>编辑</a>
                    : ""}
                  {record['status'] != 1002
                    ? <Divider type="vertical" />
                    : ""}
                  {record['status'] != 1002
                    ? <Popconfirm title="确定删除吗？" okText="是" cancelText="否" onConfirm={onAction.bind(this, 'delete', record)}>
                      <a href="javascript:void(0)">删除</a>
                    </Popconfirm>
                    : ""}
                </span>
              </span>
            )

          },
        },
      ],
      dataList: [],
      pagination: {
        size: 'small',
        showSizeChanger: true,
        onShowSizeChange: (current, size) => {
          console.log('ddd', current)
          console.log('aaaaa', size)
        },

      },
      formFieldValues: {
        "activityType": "",
        "businessType": "",
        "limit": 10,
        "page": 1,
        "publishDate": null,
        "status": "",
        "title": ""
      },
      selectedDate: '',
      selectedRowKeys: [],
      loading: false,
      QRcodeShow: false,
      previewUrl: '',
    }

  };

  goto = (url) => {
    console.log('history===', url, history)
    history.push(url);
  }

  getDataList = (param = {}) => {
    const params = { ...this.state.formFieldValues, ...param }
    for (let k in params) {
      if (typeof params[k] === 'string' && !params[k].length) {
        delete params[k]
      }
    }

    this.setState({ loading: true });
    Http.post('infoList', params, callback => {
      const pagination = { ...this.state.pagination };
      pagination.total = callback['total'] || 0;
      let dataList = callback['rows'];
      dataList.forEach((item, index) => {
        item.title = item.title && item.title.length > 12 ? item.title.slice(0, 12) + '……' : item.title;
      })
      this.setState({
        loading: false,
        dataList,
        pagination
      })
    })


  }



  handleTableChange = (pagination, filters, sorter) => {

    const pager = { ...this.state.pagination, ...pagination };
    const formFieldValues = { ...{}, ...this.state.formFieldValues }
    pager.current = pagination.current;

    formFieldValues['limit'] = pager.pageSize;
    formFieldValues['page'] = pager.current;
    formFieldValues['publishDate'] = this.state.selectedDate;
    this.setState({
      pagination: pager,
      formFieldValues
    }, () => {
      this.getDataList();
    });
  }


  componentDidMount() {

    this.getDataList();

  }

  /**
   * 普通输入框，下拉框的值处理
   */
  onInputChange = (field, event) => {

    const isSelectTarget = !Object.hasOwnProperty.call(event, 'target')
    const value = isSelectTarget ? event : event.target.value
    const tempState = {}
    tempState[field] = value


    this.setState({
      formFieldValues: { ...this.state.formFieldValues, ...tempState }
    }, () => {
      console.log('onInputChange.formFieldValues=====', this.state.formFieldValues)
    })



  }

  handleSearch = () => {
    const { selectedDate, formFieldValues } = this.state
    const params = { ...formFieldValues }
    params['publishDate'] = selectedDate

    this.getDataList(params);
  }

  handleReset = () => {

    this.setState({
      selectedDate: null
    })
    this.setState({
      formFieldValues: { ...this.state.formFieldValues }
    }, () => {
      console.log('reset.formFieldValues=====', this.state.formFieldValues)
    })
    this.handleSearch()
  }

  handlePreview = (record) => {
    const _this = this;
    const query = {
      businessType: record.businessType,
      businessId: record.businessId
    }
    Http.get('previewReady', query, (res) => {
      if (res) {
        _this.setState({
          QRcodeShow: true,
          previewUrl: res.previewUrl
        })
      }
    })


  }

  handleDelete = (record) => {
    let dataList = Object.assign([], this.state.dataList);
    const _this = this;
    dataList.forEach((item, index) => {
      if (record.businessId === item.businessId) {
        dataList.splice(index, 1)
      }
    })

    let Url = Http.getApi("ActivityDelete");
    Url = Url.split('?')[0];
    Url += `?activityId=${record.businessId}`
    Http.setApi('ActivityDelete', Url, undefined, false);

    // 1004 新闻资讯
    // 1003 报名活动
    record.businessType == 1003
      ? Http.post("ActivityDelete", { activityId: record.businessId }, (res) => {
        _this.setState({ dataList })
      })
      : (record.status === 1001
        ? Http.post('NewsUpdateNews', { status: 1002, id: record.businessId }, (res) => {
          _this.setState({ dataList })
        })
        : Http.post("deleteNews", { status: 1002, id: record.businessId }, (res) => {
          _this.setState({ dataList })
        }))
  }

  handleEdit = (record) => {
    const url = `?businessType=${record['businessType']}&businessId=${record['businessId']}&handle=edit`;
    if (record['businessType'] == 1003) {
      history.push('./act/detailEditManu' + url)
    } else if (record['businessType'] == 1004) {
      history.push('./news/detailEditManu' + url)
    }
  }

  handleDetail(record) {
    const url = `?businessType=${record['businessType']}&businessId=${record['businessId']}&handle=detail`;
    if (record['businessType'] == 1003) {
      history.push('./act/detailEditManu' + url)
    } else if (record['businessType'] == 1004) {
      history.push('./news/detailEditManu' + url)
    }
  }

  /**
   * 销售店选择时触发
   */
  onDealerCodeChange = (v) => {
    this.setState({
      formFieldValues: { ...this.state.formFieldValues, ...{ dealerCode: v['value'] } }
    }, () => {
      console.log('onDealerCodeChange====', this.state.formFieldValues)
    })
  }

  /**
   * 选择发布时间时触发
   */
  onPublishDateChange = (dateAsMoment, dateAsStr) => {
    this.setState({
      selectedDate: dateAsStr
    })
    this.setState({
      formFieldValues: { ...this.state.formFieldValues, ...{ publishDate: dateAsMoment } }
    }, () => {
      console.log('onPublishDateChange.formFieldValues====', this.state.formFieldValues)
    })
  }

  /**
   * 内容太多，跳转新增界面😂
   */
  handleAdd = ({ item, key, keyPath }) => {
    let pathMap = { 1: './act/edit', 2: './news/edit' }
    this.goto(pathMap[key]);
  }

  /**
   * 列表页面操作分发方法
   */
  onAction = (type, record) => {
    const { handleReset, handleSearch, handlePreview, handleEdit, handleDelete, handleDetail } = this;
    console.log('onAction---->', type)
    switch (type) {
      case 'search':
        handleSearch()
        break;
      case 'reset':
        handleReset()
        break;
      case 'preview':
        handlePreview(record)
        break;
      case 'edit':
        handleEdit(record)
        break;
      case 'detail':
        handleDetail(record)
        break;
      case 'delete':
        handleDelete(record)
        break;
      default:
        break;
    }
  }


  render() {
    const { onDealerCodeChange, onInputChange, onPublishDateChange, onAction, handleAdd } = this
    const { getFieldDecorator } = this.props.form;
    const { dataList, columns, formFieldValues } = this.state
    const menu = (
      <Menu onClick={handleAdd.bind(this)}>
        <Menu.Item key="1">发布新闻</Menu.Item>
        <Menu.Item key="2">发布活动</Menu.Item>
      </Menu>
    );
    return (
      <div className="wrap" style={{ 'padding': '5px' }}>
        <Form layout={'inline'} className="ant-search-form">
          <Row gutter={24}>
            <Col span={6}>
              <FormItem {...formItemLayout} label={`销售店`} style={{ width: '100%' }}>

                <DealerTree value={formFieldValues.dealerCode} selected={onDealerCodeChange.bind(this)} />

              </FormItem>
            </Col>

            <Col span={6}>
              <FormItem {...formItemLayout} label={`标题`} style={{ width: '100%' }}>

                <Input value={formFieldValues.title} onChange={onInputChange.bind(this, 'title')} />

              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={`状态`} style={{ width: '100%' }}>

                <Select value={formFieldValues.status} onChange={onInputChange.bind(this, 'status')} >
                  <Option value={""}>全部</Option>
                  <Option value={1001}>草稿</Option>
                  <Option value={1002}>已删除</Option>
                  <Option value={1003}>未开始</Option>
                  <Option value={1004}>有效</Option>
                  <Option value={1005}>已满额</Option>
                  <Option value={1006}>已过期</Option>
                </Select>

              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={`类型`} style={{ width: '100%' }}>

                <Select value={formFieldValues.businessType} onChange={onInputChange.bind(this, 'businessType')}>

                  <Option value={""}>全部</Option>
                  <Option value={1004}>新闻资讯</Option>
                  <Option value={1003}>活动</Option>
                </Select>

              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} className="ant-form-item" label={`活动类型`} style={{ width: '100%' }}>

                <Select value={formFieldValues.activityType} onChange={onInputChange.bind(this, 'activityType')}>
                  <Option value={""}>全部</Option>
                  <Option value={1003}>普通活动</Option>
                  <Option value={1002}>报名活动</Option>
                  <Option value={1001}>抢购活动</Option>
                </Select>

              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={`发布时间`} style={{ width: '100%' }}>

                <DatePicker value={formFieldValues.publishDate} placeholder="" style={{ width: '100%' }} format="YYYY-MM-DD" onChange={onPublishDateChange.bind(this)} />

              </FormItem>
            </Col>

            <Col span={6}>
              <FormItem {...formItemLayout} className="ant-form-item" label={`是否置顶`} style={{ width: '100%' }}>

                <Select value={formFieldValues.isTop} onChange={onInputChange.bind(this, 'isTop')}>
                  <Option value={""}>全部</Option>
                  <Option value={1}>是</Option>
                  <Option value={0}>否</Option>
                </Select>

              </FormItem>
            </Col>

          </Row>
          <Row>
            <Col span={24} style={{ textAlign: 'right', paddingTop: '5px' }}>
              <Button type="primary" htmlType="button" icon="search" onClick={onAction.bind(this, 'search')}>查询</Button>
              {/* <Button style={{ marginLeft: 8 }} onClick={onAction.bind(this, 'reset')}>重置</Button> */}
              {/* <Dropdown overlay={menu}>
                <Button style={{ marginLeft: 8 }} type="primary" htmlType="button" icon="plus">
                  新增<Icon type="down" /></Button>
              </Dropdown> */}

            </Col>
          </Row>
        </Form>

        <Table columns={columns}
          size="small"
          rowKey={record => Math.random(4) + 'uuid'}
          dataSource={this.state.dataList}
          pagination={this.state.pagination}
          loading={this.state.loading}
          onChange={this.handleTableChange}
          scroll={{ x: 3500 }}
        />

        {/* 二维码预览 */}
        <QRcode show={this.state.QRcodeShow} URL={this.state.previewUrl} OK={() => { this.setState({ QRcodeShow: false }) }} />
      </div>
    );
  };

}
const InfoWithForm = Form.create()(Info);


export default InfoWithForm;
