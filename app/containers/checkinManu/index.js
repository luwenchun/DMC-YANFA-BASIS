/**
 *开通功能列表
 */

import React from 'react';
//import Layout from '../../components/Layout';
import Http from '../../utils/http';
import PropTypes from 'prop-types';
//import withStyles from 'isomorphic-style-loader/lib/withStyles';
import './style/index.scss';
import DMCUtil from '../../utils/DMCUtil'
import { Form, Row, Col, Input, Button, Table, Icon, Divider, Select } from 'antd';
import { Helmet } from 'react-helmet';
const { Column, ColumnGroup } = Table;
const FormItem = Form.Item;

const title = '签到管理';

const apis = [
  { "id": "demoList", "url": "demo/list" },
];

const Authorization = DMCUtil.getJWTFromCookie()
Http.setDomainUrl(DMCUtil.SERVER_BASE_PATH);

Http.setMutiApi(apis);
Http.setRequestHeader({ Authorization });

const data = [{
  key: '1',
  lastName: 'Brown',
  age: 32,
  address: 'New York No. 1',
}, {
  key: '2',
  lastName: 'Green',
  age: 42,
  address: 'London No. 1',
}, {
  key: '3',
  lastName: 'Black',
  age: 32,
  address: 'Sidney No. 1',
}];


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
      expand: false,
      dataList: [],
      pagination: {
        size: 'small',
        showSizeChanger: true,
        onShowSizeChange: (current, size) => {

        },

      },
      loading: false,
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

    this.setState({ loading: true });

    Http.get('demoList', params, callback => {
      const pagination = { ...this.state.pagination };
      pagination.total = callback['total'] || 0;
      this.setState({
        loading: false,
        dataList: callback['list'],
        pagination
      })

    })


  }





  componentDidMount() {
    // this.created();
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



  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={'wrap'} style={{ 'padding': '12px' }}>
      <Helmet>
          <title>{title}</title>
          <meta name="description" content={title} />
      </Helmet>
        <Form layout={'inline'}>
          <Row gutter={24}>

            <Col span={12}>
              <FormItem label={`销售店`}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}>
                <Select
                  showSearch
                  style={{ width: 200 }}
                  placeholder="Select a person"
                  optionFilterProp="children"
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  <Option value="jack">Jack</Option>
                  <Option value="lucy">Lucy</Option>
                  <Option value="tom">Tom</Option>
                </Select>

              </FormItem>
            </Col>

            <Col span={12} style={{ textAlign: 'right' }}>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>重置</Button>
            </Col>

          </Row>
        </Form>
        <Table dataSource={data} bordered>
          <Column
            title="ID"
            dataIndex="key"
            key="key"
          />
          <Column
            title="活动时间"
            dataIndex="lastName"
            key="lastName"
          />
          <Column
            title="销售店"
            dataIndex="age"
            key="age"
          />
          <Column
            title="签到方式"
            dataIndex="address"
            key="address"
          />
          <Column
            title="获得丰云能量"
            dataIndex="age"
            key="age"
          />
          <Column
            title="是否发放优惠券"
            dataIndex="address"
            key="address"
          />
          <Column
            title="优惠券名称"
            dataIndex="address"
            key="address"
          />
          <Column
            title="优化券类型"
            dataIndex="address"
            key="address"
          />
        </Table>


      </div>
    );
  };

}
const OpenWithForm = Form.create()(Open);

// const OpenComp = withStyles(s)(OpenWithForm);

// function action({ path, query, hash }) {

//   return {
//     chunks: ['checkin.index'],
//     title,
//     component: (
//       <Layout hide={true}>
//         <OpenComp />
//       </Layout>
//     ),
//   };
// }

export default OpenWithForm;;
