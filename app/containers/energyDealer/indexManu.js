/**
 *开通功能列表
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import Http from '../../utils/http';
import DMCUtil from '../../utils/DMCUtil'
import PropTypes from 'prop-types';
import './style/index.scss';
import DealerTree from '../../components/common/dealerTree';
import { Form, Row, Col, Input, Button, Table, Icon, Divider, Select } from 'antd';
import {SERVER_BASE_PATH} from '../../global.config'
const { Column, ColumnGroup } = Table;
const FormItem = Form.Item;

const title = '查看丰云能量';

const apis = [
  { "id": "search", "url": "energy/history/webSearch" },
];

const Authorization = DMCUtil.getJWTFromCookie()
Http.setDomainUrl(SERVER_BASE_PATH);

Http.setMutiApi(apis);
Http.setRequestHeader(Authorization)

const data = [{}];

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

const Option = Select.Option;

const columns = [
  {
    title: '销售店',
    dataIndex: 'dealerName',
    key: 'dealerName',
  },
  {
    title: '用户名',
    dataIndex: 'userName',
    key: 'userName',
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    key: 'phone',
  },
  {
    title: '丰云能量',
    dataIndex: 'energy',
    key: 'energy',
  },
]



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
      expand: false,
      dataList: [],
      total: 0,
      pagination: {
        size: 'small',
        showSizeChanger: true,
        onShowSizeChange: (current, size) => {

        },

      },
      loading: false,
      query: {
        "isDealer": 1,
        "isValid": 1,
        "limit": 10,
        "page": 1,
      }

    }

  };

  reset() {
    this.props.form.resetFields();
    this.setState({
      query: {
        "isDealer": 1,
        "isValid": 1,
        "limit": 10,
        "page": 1,
      }
    })
  }

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



  handleTableChange = (pagination, filters, sorter) => {

    const pager = { ...this.state.pagination };
    const query = Object.assign({}, this.state.query)
    pager.current = pagination.current;

    query['limit'] = pager.pageSize;
    query['page'] = pager.current;

    this.setState({
      pagination: pager,
      query,
    },()=>{
      this.selectData();
    });

  }


  selectData() {
    const _this = this;
    // 获取列表
    Http.post('search', this.state.query, (dataList) => {
      const pagination = { ...this.state.pagination };
      pagination.total = dataList['pageDate']['total'] || 0;
      if (dataList && dataList['pageDate']['rows']) {
        _this.setState({
          dataList: dataList['pageDate']['rows'],
          total: dataList['totalEnergy'] || 0,
          pagination
        })
      }
    })



  }

  componentWillMount() {

  }


  componentDidMount() {
    this.created();
    this.selectData();

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



  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={'wrap'} style={{ 'padding': '12px' }}>
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={title} />
        </Helmet>
        <Form layout={'inline'} className={'ant-search-form'}>
          <Row gutter={24}>
            <Col span={8}>
              <FormItem {...formItemLayout} label={`销售店`} style={{ width: '100%' }}>
                {getFieldDecorator(`dealerCode`)(
                  <DealerTree selected={(v) => { this.setState({ query: Object.assign(this.state.query, { dealerCode: v.value }) }) }} />
                )}
              </FormItem>
            </Col>

            <Col span={8}>
              <FormItem {...formItemLayout} label={`用户名`} style={{ width: '100%' }}>
                {getFieldDecorator(`userName`)(
                  <Input placeholder="请输入用户名" onChange={(e) => { this.setState({ query: Object.assign(this.state.query, { userName: e.target.value }) }) }} />
                )}
              </FormItem>
            </Col>


            <Col span={8}>
              <FormItem {...formItemLayout} label={`手机号`} style={{ width: '100%' }}>
                {getFieldDecorator(`phone`)(
                  <Input placeholder="请输入手机号" onChange={(e) => { this.setState({ query: Object.assign(this.state.query, { phone: e.target.value }) }) }} />
                )}
              </FormItem>
            </Col>

          </Row>
          <Row>
            <Col span={24} style={{ textAlign: 'right', margin: '12px 0' }}>
              <Button type="primary" htmlType="submit" onClick={this.selectData.bind(this)}>查询</Button>
              {/* <Button style={{ marginLeft: 8 }} onClick={this.handleReset} onClick={this.reset.bind(this)}>重置</Button> */}
            </Col>
          </Row>
        </Form>

        <div className={'aggregate'}>
          <i className={'iconfont'}>&#xe608;</i>
          <span>已发放丰云能量：</span>
          <span>{this.state.total}</span>
        </div>

        <Table columns={columns}
          bordered
          rowKey={record => record.uid}
          dataSource={this.state.dataList}
          pagination={this.state.pagination}
          // loading={this.state.loading}
          loading={false}
          onChange={this.handleTableChange} />

      </div>
    );
  };

}
const OpenWithForm = Form.create()(Open);


export default OpenWithForm;
