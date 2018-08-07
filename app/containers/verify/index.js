/**
 *开通功能列表
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import Http from '../../utils/http';
import PropTypes from 'prop-types';
import './style/index.scss';
import moment from 'moment';
import DMCUtil from '../../utils/DMCUtil'
import {SERVER_BASE_PATH} from '../../global.config'
import DealerTree from '../../components/common/dealerTree';
import { Form, Row, Col, Input, Button, Table, Icon, Divider, Select, DatePicker, Alert, TreeSelect } from 'antd';

const { Column, ColumnGroup } = Table;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;


const title = '审核';

const apis = [
  { "id": "demoList", "url": "demo/list" },
  { "id": "initQuery", "url": "cmyManage/review/initQuery" },
  { "id": "getReviewsCount", "url": "cmyManage/review/getReviewsCount" },
  { "id": "exchangeComment", "url": "cmyManage/review/exchangeComment" }
];
const Authorization = DMCUtil.getJWTFromCookie()
Http.setDomainUrl(SERVER_BASE_PATH);

Http.setMutiApi(apis);
Http.setRequestHeader(Authorization)

const data = [{}];


const Option = Select.Option;

function handleChange(value) {
  console.log(`selected ${value}`);
}

function handleBlur() {
  console.log('blur');
}

function handleFocus() {
  console.log('focus');
}


class Open extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dealerCode: '3',
      expand: false,
      dataList: [],
      initQuery: [],
      formValue: {
        limit: 10,
        page: 1,
        exceptionType: 1,
        reviewStatus: 0,
        commentReviewStatus: 0,
      },
      getReviewsCount: {},
      pagination: {
        size: 'small',
        showSizeChanger: true,
        defaultCurrent: 1,
        pageSize: 10
      },
      loading: false,
      params: {
        limit: 99,
        page: 1,
        reviewStatus: 0,
        commentReviewStatus: 0,
        exceptionType: 1
      }
    }

  };
  createdTag(tagName, href) {
    let tag;
    if (tagName === 'link') {
      tag = document.createElement('link');
      tag.setAttribute('rel', 'stylesheet');
      tag.setAttribute('type', 'text/css');
      tag.setAttribute('href', href);
    } else if (tagName === 'script') {
      tag = document.createElement('script');
      tag.setAttribute('src', href);
    }
    document.head.appendChild(tag);
  }
  created() {
    this.createdTag('link', 'https://unpkg.com/antd@3.0.1/dist/antd.min.css');
  }
  getDataList = (params = {}) => {
    console.log('params::', params);

    // this.setState({ loading: true });

    // // Http.get('demoList', params, callback => {
    // //   const pagination = { ...this.state.pagination };
    // //   pagination.total = callback['total'] || 0;
    // //   this.setState({
    // //     loading: false,
    // //     dataList: callback['list'],
    // //     pagination
    // //   })

    // // })

  }


  componentWillMount() {

    Http.get('getReviewsCount', result => {
      this.setState({
        getReviewsCount: result
      })
    })

    Http.post('initQuery', this.state.params, result => {
      result.rows.forEach((item, index) => {
        let time = {
          times: moment(item['publishTime']).format('YYYY-MM-DD HH:mm:ss')
        }
        item.title = item.title && item.title.length > 16 ? item.title.slice(0, 16) + '……' : item.title;
        result.rows[index] = Object.assign(result.rows[index], time)
      });
      this.setState({
        initQuery: result,
        pagination: Object.assign(this.state.pagination, { total: result['total'] })
      })

    })


  }
  componentDidMount() {
    this.created();
    this.getDataList();

  }

  getFields() {
    const count = this.state.expand ? 10 : 6;
    const { getFieldDecorator } = this.props.form;
    const children = [];
    for (let i = 0; i < 10; i++) {
      children.push(
        <Col span={8} key={i} style={{ display: i < count ? 'block' : 'none' }}>
          <FormItem label={`Field ${i}`}>
            {getFieldDecorator(`field-${i}`)(
              <Input placeholder="placeholder" />
            )}
          </FormItem>
        </Col>
      );
    }
    return children;
  }

  handleSearch = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      console.log('Received values of form: ', values);
    });
  }

  handleReset = () => {
    this.props.form.resetFields();
  }

  toggle = () => {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  }
  //head
  headline = (event) => {

  }
  report = (event) => {

  }
  alfer = (page) => {
    this.setState({
      formValue: Object.assign(this.state.formValue, {
        limit: page.pageSize,
        page: page.current
      }),
      pagination: Object.assign(this.state.pagination, {
        pageSize: page.pageSize,
        page: page.current
      })
    }, () => {
      Http.post('initQuery', this.state.formValue, result => {
        result.rows.forEach((item, index) => {
          let time = {
            times: moment(item['publishTime']).format('YYYY-MM-DD HH:mm:ss'),
            key: index
          }
          item.title = item.title && item.title.length > 16 ? item.title.slice(0, 16) + '……' : item.title;
          result.rows[index] = Object.assign(result.rows[index], time)

        });
        this.setState({
          initQuery: result,
          pagination: Object.assign(this.state.pagination, { total: result['total'] })
        })
      })
    });

  }
  inquiry = () => {
    const code = {
      dealerCode: this.state.dealerCode
    }
    Http.get('getReviewsCount', code, result => {
      this.setState({
        getReviewsCount: result
      })
    })
    Http.post('initQuery', this.state.formValue, result => {
      result.rows.forEach((item, index) => {
        let time = {
          times: moment(item['publishTime']).format('YYYY-MM-DD HH:mm:ss'),
          key: index
        }
        item.title = item.title && item.title.length > 16 ? item.title.slice(0, 16) + '……' : item.title;
        result.rows[index] = Object.assign(result.rows[index], time)
      });
      this.setState({
        initQuery: result,
        pagination: Object.assign(this.state.pagination, { total: result['total'] })
      })
    })
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={'wrap'} style={{ 'padding': '12px' }}>
        <Form>
          <Row gutter={24}>
            <Col span={8}>
              <FormItem label={`标 题`}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                style={{ width: 250 }}
              >
                {getFieldDecorator(`field-1`)(
                  <Input placeholder="请填写" onChange={v => { this.setState({ formValue: Object.assign(this.state.formValue, { title: v.target.value }) }) }} />
                )}
              </FormItem>
            </Col>

            <Col span={8}>
              <FormItem label={`销售店`}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                style={{ width: 250 }}
              >
                <DealerTree selected={(v) => { this.setState({ formValue: Object.assign(this.state.formValue, { dealerCode: v.value }) }) }} />

              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label={`是否举报`}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                style={{ width: 250 }}
              >
                <Select
                  showSearch
                  defaultValue={this.state.formValue.exceptionType}
                  optionFilterProp="children"
                  onChange={v => { this.setState({ formValue: Object.assign(this.state.formValue, { exceptionType: v }) }) }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  <Option value={''}>全部</Option>
                  <Option value={0}>否</Option>
                  <Option value={1}>是</Option>
                </Select>
              </FormItem>
            </Col>

            <Col span={8}>
              <FormItem label={`类 型`}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                style={{ width: 250 }}
              >
                <Select
                  showSearch
                  placeholder="请选择"
                  optionFilterProp="children"
                  onChange={v => { this.setState({ formValue: Object.assign(this.state.formValue, { serviceType: v }) }) }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  <Option value={''}>全部</Option>
                  <Option value={1006}>话题跟帖</Option>
                  <Option value={1004}>新闻资讯</Option>
                  <Option value={1002}>动 态</Option>
                  <Option value={1003}>活 动</Option>
                </Select>
              </FormItem>
            </Col>


            <Col span={8}>
              <FormItem label={`状 态`}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                style={{ width: 250 }}
              >
                <Select
                  showSearch
                  placeholder="请选择"
                  optionFilterProp="children"
                  onChange={v => { this.setState({ formValue: Object.assign(this.state.formValue, { reviewStatus: v }) }) }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  defaultValue={0}
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  <Option value={''}>全部</Option>
                  <Option value={0}>未审核</Option>
                  <Option value={1}>不通过</Option>
                  <Option value={2}>通 过</Option>
                </Select>

              </FormItem>
            </Col>

            <Col span={8}>
              <FormItem label={`评论状态`}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                style={{ width: 250 }}
              >
                <Select
                  showSearch
                  placeholder="请选择"
                  optionFilterProp="children"
                  onChange={v => { this.setState({ formValue: Object.assign(this.state.formValue, { commentReviewStatus: v }) }) }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  defaultValue={0}
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  <Option value={''}>全部</Option>
                  <Option value={0}>未审核</Option>
                  <Option value={1}>已审核</Option>
                </Select>
              </FormItem>
            </Col>

            <Col span={10}>
              <FormItem label={`发表时间`}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                style={{ width: 250 }}
              >
                <DatePicker
                  style={{ width: 190 }}
                  ///showTime={{ format: 'HH:mm' }}
                  format="YYYY-MM-DD"
                  placeholder={'请选择'}
                  onChange={(value, dateString) => { this.setState({ formValue: Object.assign(this.state.formValue, { publishTime: dateString ? moment(dateString).format("YYYY-MM-DD") : '' }) }); }}
                  onOk={(value) => { console.log('onOk: ', value); }}
                />
              </FormItem>
            </Col>

          </Row>
          <Row type="flex" justify="end">
            <Col span={10} style={{ textAlign: 'right' }}>
              <Button type="primary" htmlType="submit" onClick={this.inquiry}>查询</Button>
              {/* <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>重置</Button> */}
            </Col>
          </Row>
          <div className={'annotate'}>
            <Icon type="warning" />
            <div><Alert message={<p>被举报:<span></span></p>} type="warning" /></div>
            <div><Alert message={<p>含有敏感词语:<span></span></p>} type="error" /></div>
          </div>
        </Form>

        <div className={'tableContent'}>
          <div className={'tabTit'}>
            <span>已审核：{this.state.getReviewsCount['yshCount']}条记录</span>
            <span>未审核：{this.state.getReviewsCount['wshCount']}条记录 </span>
          </div>
          <Table dataSource={this.state.initQuery.rows} bordered pagination={this.state.pagination} scroll={{ x: 1200 }} onChange={this.alfer}>
            <Column
              width={70}
              title="序号"
              dataIndex="num"
              key="key"
            />
            <Column
              width={100}
              title="异常"
              dataIndex="exceptionType"
              key="lastName"
              render={(text, record) => (
                <div>
                  <span style={record.exceptionType == '1' ? { background: 'yellow' } : { display: 'none' }} className={'exception'}></span>
                  <span style={record.exceptionType == '2' ? { background: 'red' } : { display: 'none' }} className={'exception'}></span>
                  <span style={record.exceptionType == '3' ? { background: 'red' } : { display: 'none' }} className={'exception'}></span>
                  <span style={record.exceptionType == '3' ? { background: 'yellow' } : { display: 'none' }} className={'exception'}></span>
                </div>
              )}
            />
            <Column
              width={240}
              title="标题"
              dataIndex="title"
              key="title"
            />
            <Column
              title="类型"
              dataIndex="serviceType"
              key="serviceType"
              render={(text, record) => (
                <span>
                  {record.serviceType == 1002 ? '动态' : ''}
                  {record.serviceType == 1003 ? '活动' : ''}
                  {record.serviceType == 1004 ? '新闻资讯' : ''}
                  {record.serviceType == 1005 ? '评论' : ''}
                  {record.serviceType == 1006 ? '话题跟贴' : ''}
                </span>
              )}
            />
            <Column
              width={180}
              title="发表人"
              dataIndex="publishName"
              key="publishName"
            />
            <Column
              width={200}
              title="发表时间"
              dataIndex="times"
              key="times"
            />
            <Column
              title="状态"
              dataIndex="reviewStatus"
              key="reviewStatus"
              render={(text, record) => (
                <span>{record.reviewStatus == 0 ? '未审核' : ''}{record.reviewStatus == 1 ? '不通过' : ''}{record.reviewStatus == 2 ? '通过' : ''}</span>
              )}
            />
            <Column
              title="评论状态"
              dataIndex="commentReviewStatus"
              key="commentReviewStatus"
              render={(text, record) => (
                <span>{record.commentReviewStatus == 0 ? '未审核' : ''}{record.commentReviewStatus == 1 ? '已审核' : ''}</span>
              )}
            />
            <Column
              title="操作"
              key="action"
              fixed="right"
              width={80}
              render={(text, record) => (
                <span>
                  <div style={{ color: '#1890ff', cursor: 'pointer' }} onClick={this.mistake.bind(this, record)}>详情</div>
                </span>
              )}
            />

          </Table>
        </div>

      </div>
    );
  };
  mistake(record) {
    const _that=this;
    const code = {
      businessId: record['serviceId'],
      businessType: record['serviceType']
    }
    const status = {
      reviewStatus: record['reviewStatus'],
      serviceType: record['serviceType']
    }
    localStorage.setItem('verify-code', JSON.stringify(code));
    localStorage.setItem('verify-Status', JSON.stringify(status));

    window.swager = {
      1006: {
        code: '/verify/comments'
      },
      1002: {
        code: '/verify/trends'
      },
      1003: {
        code: '/verify/activity'
      },
      1004: {
        code: '/verify/news'
      },
      action: function(a){
        _that.props.history.push(this[a]['code']);
      }
    }
    swager.action(record['serviceType']);

  }

}
const OpenWithForm = Form.create()(Open);

export default OpenWithForm;
