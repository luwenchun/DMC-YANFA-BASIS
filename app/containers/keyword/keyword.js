/**
 *敏感词汇维护
 */

import React from 'react';
import Layout from '../../components/Layout';
import Http from '../../utils/http';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './style/keyword.scss';
import { Form, Row, Col, Input, Button, Table, Icon, Divider } from 'antd';

const { Column, ColumnGroup } = Table;
const FormItem = Form.Item;

const title = '敏感词汇维护';

const apis = [
  {"id":"demoList","url":"demo/list"},
];

Http.setDomainUrl("/fed/admin/api/");

Http.setMutiApi(apis);

const columns = [
  {
    title: '用户编号',
    dataIndex: 'uid',
    sorter: true,
    width: '10%',
    key: 'uid',
  }, 
  {
    title: '用户名',
    dataIndex: 'userName',
    sorter: true,
    width: '10%',
    key: 'userName',
  }, 
  {
    title: '性别',
    dataIndex: 'sex',
    key: 'sex',
    width: '8%',
    filters: [
      { text: '先生', value: 'male' },
      { text: '女士', value: 'female' },
    ]
  }, 
  {
    title: '手机号',
    dataIndex: 'userPhone',
    width: '12%',
    key: 'userPhone',
  },
  {
    title: '车牌号',
    dataIndex: 'licenseNo',
    width: '10%',
    key: 'licenseNo',
  },
  {
    title: '数据更新时间',
    dataIndex: 'applyTime',
    width: '15%',
    key: 'applyTime',
  },  
  // {
  //   title: '地址',
  //   dataIndex: 'address',
  //   key: 'address',
  // },
  {
    title: '操作',
    key: 'operation',

    render: (text, record) => (
      <span>
        <a href="#">修改</a>
        <Divider type="vertical" />
        <a href="#">删除</a>
        <Divider type="vertical" />
        <a href="#" className="ant-dropdown-link">
          更多 <Icon type="down" />
        </a>
      </span>
    ),
  },
];

const rowSelection = {
  type: 'checkbox',
  onChange: (selectedRowKeys, selectedRows) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  },
  getCheckboxProps: record => ({
    disabled: record.name === 'Disabled User',
  }),
//   selections: [{
//     key: 'delete-all',
//     text: '批量删除',
//     onSelect: () => {
//       console.log('批量删除')
//     },
//   },
// ],
};


class Keyword extends React.Component {
  constructor(props) {
      super(props);
      
      this.state = {
        expand: false,
        dataList:[],
        pagination:{
          size:'small',
          showSizeChanger:true,
          onShowSizeChange:(current,size)=>{

          },
        },
        loading: false,
      }
  
    };

     getDataList = (params = {}) => {
        console.log('params::',params);
        
        this.setState({loading:true});

        Http.get('demoList',params,callback=>{
          const pagination = { ...this.state.pagination };
          pagination.total = callback['total']||0;
          this.setState({
            loading: false,
            dataList: callback['list'],
            pagination
          })

        })


     }



    handleTableChange = (pagination, filters, sorter) => {
      
      const pager = { ...this.state.pagination };

      pager.current = pagination.current;

      this.setState({
        pagination: pager,
      });

      this.getDataList({
        pageSize: pagination.pageSize,
        pageNum: pagination.current,
        sortField: sorter.field,
        orderBy: sorter.order,
        ...filters,
      });


    }


    componentDidMount() {
      
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
                <Input placeholder="placeholder"/>
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
        <div className={s['wrap']} style={{'padding':'12px'}}>
          <Form layout={'inline'}>
              <Row gutter={24}>
              
                <Col span={8}>
                  <FormItem label={`用户编号`}>
                    {getFieldDecorator(`field-1`)(
                      <Input />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={`用户名`}>
                    {getFieldDecorator(`field-1`)(
                      <Input />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={`性别`}>
                    {getFieldDecorator(`field-1`)(
                      <Input />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={`手机号`}>
                    {getFieldDecorator(`field-1`)(
                      <Input />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label={`更新时间`}>
                    {getFieldDecorator(`field-1`)(
                      <Input />
                    )}
                  </FormItem>
                </Col>

              </Row>
              <Row>
                <Col span={24} style={{ textAlign: 'right' }}>
                  <Button type="primary" htmlType="submit">查询</Button>
                  <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
                    重置
                  </Button>
                  <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>
                    更多 <Icon type={this.state.expand ? 'up' : 'down'} />
                  </a>
                </Col>
              </Row>
            </Form>

            <Table columns={columns} 
                size="small"
                rowKey={record => record.uid}
                dataSource={this.state.dataList}
                pagination={this.state.pagination}
                loading={this.state.loading}
                onChange={this.handleTableChange}
                rowSelection={rowSelection}
                
            />
        </div>
      );
    };
 
}
const KeywordWithForm = Form.create()(Keyword);

const KeywordComp=withStyles(s)(KeywordWithForm);

function action({path, query, hash}) {
  
  return {
    chunks: ['keyword.index'],
    title,
    component: (
      <Layout hide={true}>
        <CheckinComp />
      </Layout>
    ),
  };
}

export default action;
