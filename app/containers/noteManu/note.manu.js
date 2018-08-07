/**
 *话题动态列表
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import moment from 'moment';
import Http from '../../utils/http';
import PropTypes, { object } from 'prop-types';
import DealerTree from '../../components/common/dealerTree';
import PublishDetail from './components/PublishDetailManu';
import DMCUtil from '../../utils/DMCUtil'
import './style/note.scss';
import { Form, Row, Col, Input, Button, Table, Icon, Divider, Select, DatePicker, Modal, Popconfirm, message } from 'antd';


const { Column, ColumnGroup } = Table;
const FormItem = Form.Item;
const Option = Select.Option;
const { RangePicker, MonthPicker, } = DatePicker;

const title = '话题动态列表';

const apis = [
  { "id": "getCarLiveInfo", "url": "cmyManage/cmy/getCarLiveInfo" },
  { "id": "deleteCmyItems", "url": "cmyManage/cmy/deleteCmyItems" },
];

const Authorization = DMCUtil.getJWTFromCookie()
Http.setDomainUrl(DMCUtil.SERVER_BASE_PATH);

Http.setMutiApi(apis);
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


class Note extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        {
          title: '销售店',
          dataIndex: 'dealerName',
          key: 'dealerName',
        },
        {
          title: '标题',
          dataIndex: 'title',
          key: 'title',
        },
        {
          title: '类型',
          dataIndex: 'bizTypeName',
          key: 'bizTypeName',
        },
        {
          title: '话题标签',
          dataIndex: 'label',
          width: '12%',
          key: 'label',
        },
        {
          title: '发布时间',
          dataIndex: 'createDate',
          width: '10%',
          key: 'createDate',
        },
        {
          title: '点赞数',
          dataIndex: 'praiseNumber',
          key: 'praiseNumber',
        },
        {
          title: '评论数',
          dataIndex: 'assessNumber',
          key: 'assessNumber',
        },
        {
          title: '分享数',
          dataIndex: 'shareNumber',
          key: 'shareNumber',
        },

        {
          title: '是否推荐',
          dataIndex: 'isRe',
          key: 'isRe',
        },

        {
          title: '是否置顶',
          dataIndex: 'isTop',
          key: 'isTop',
        },

        {
          title: '修改置顶显示次序',
          dataIndex: 'topOrder',
          key: 'topOrder',
        },

        {
          title: '推荐时间',
          dataIndex: 'reDate',
          key: 'reDate',
        },
        {
          title: '置顶时间',
          dataIndex: 'topDate',
          key: 'topDate',
        },
        {
          title: '操作',
          key: 'operation',
          fixed: 'right',
          width: 110,
          render: (text, record) => (
            <span>
              <a href="javascript:void(0);" onClick={this.columnDetail.bind(this, record)}>详情</a>
              <span style={{ display: record.dealerCode === '00000' ? 'inline-block' : 'none' }}>
                <Divider type="vertical" />
                <Popconfirm
                  placement="bottom"
                  title={"确定删除 ?"}
                  onConfirm={(e) => { this.deleteRecord(record) }}
                  onCancel={(e) => { message.error('操作取消！'); }}
                  okText="确定"
                  cancelText="取消">
                  <a href="javascript:void(0);">删除</a>
                </Popconfirm>
              </span>
            </span>
          ),
        },
      ],
      expand: false,
      dataList: [],
      pagination: {
        size: 'small',
        showSizeChanger: true,
        onShowSizeChange: (current, size) => {
        },

      },
      loading: false,
      visible: false,
      currentColunm: {},
      query: {
        "isRecommend": "",
        "isTop": "",
        "limit": 10,
        "page": 1,
        "type": props.type ? Number(props.type) : 1002
      },
    }

  };


  columnDetail(record) {
    this.setState({
      visible: true,
      currentColunm: record
    })
  }

  deleteRecord(record) {
    let dataList = Object.assign([], this.state.dataList);
    const _this = this;
    const query = {
      bizType: Number(record.bizType),
      id: record.id
    }
    dataList.forEach((item, index) => {
      if (item.id === record.id) {
        dataList.splice(index, 1)
      }
    })

    let Url = Http.getApi("deleteCmyItems");
    Url = Url.split('?')[0];
    Url += `?bizType=${Number(record.bizType)}&id=${record.id}`
    Http.setApi('deleteCmyItems', Url, undefined, false);

    Http.post('deleteCmyItems', query, (res) => {
      if (res) {
        message.success('操作成功！');
        _this.setState({ dataList });
      } else {
        message.error('操作失败!')
      }
    })
  }

  reset() {
    this.props.form.resetFields();
    this.setState({
      query: Object.assign({}, {
        "limit": 10,
        "page": 1,
        "type": 1002
      })
    })
  }


  handleTableChange = (pagination, filters, sorter) => {

    const pager = { ...this.state.pagination };
    const query = Object.assign({}, this.state.query)
    pager.current = pagination.current;

    query['limit'] = pager.pageSize;
    query['page'] = pager.current;

    this.setState({
      pagination: pager,
      query
    }, () => {
      this.selectData();
    });

  }

  componentWillMount() {
    this.selectData();
  }

  componentDidMount() {

  }

  selectData() {
    const query = Object.assign({}, this.state.query)
    for (let k in query) {
      if (typeof query[k] === 'string' && !query[k].length) {
        delete query[k]
      }
    }
    const _this = this;
    Http.post('getCarLiveInfo', query, (result) => {
      let dataList = result.rows
      const pagination = { ...this.state.pagination };
      pagination.total = result['total'] || 0;
      dataList.forEach((item, index) => {
        item.title = item.title && item.title.length > 18 ? item.title.slice(0, 18) + '……' : item.title;
      })
      _this.setState({ loading: false, dataList, pagination });
    })
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

  pickDate(value, dateString) {
    this.setState({
      query: Object.assign({}, this.state.query, { createDate: dateString[0] })
    });

  }

  changeList(obj) {
    let dataList = Object.assign([], this.state.dataList);
    dataList.forEach((item, index) => {
      if (item.id === obj.id) {
        for (let k in obj) {
          if (k != 'id') {
            item[k] = obj[k]
          }
        }
      }
    })

    this.setState({ dataList })
  }

  /**
   * 选择发布时间时触发
   */
  onPublishDateChange = (dateAsMoment, dateAsStr) => {
    this.setState({
      query: { ...this.state.query, ...{ createDate: dateAsStr } }
    }, () => {
      console.log('onPublishDateChange.query====', this.state.query)
    })
  }

  render() {
    const _this = this;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = this.props.form;

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
                <DealerTree selected={(v) => { _this.setState({ query: Object.assign({}, _this.state.query, { dealerCode: v.value }) }) }} />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label={`标 题`} style={{ width: '100%' }}>
                <Input ref={node => this.userNameInput = node} value={this.state.query['title']} onChange={(v) => { this.setState({ query: Object.assign({}, this.state.query, { title: v.target.value }) }) }} />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label={`类 型`} style={{ width: '100%' }}>
                <Select
                  value={this.state['query']['type']}
                  onChange={v => { this.setState({ query: Object.assign({}, this.state.query, { type: v }) }) }}>
                  <Option value={''}>全 部</Option>
                  <Option value={1002}>动 态</Option>
                  <Option value={1001}>话 题</Option>
                  <Option value={1006}>话题跟帖</Option>
                </Select>
              </FormItem>
            </Col>

            <Col span={8}>
              <FormItem {...formItemLayout} label={`是否置顶`} style={{ width: '100%' }}>
                <Select placeholder="请选择"
                  value={this.state['query']['isTop']}
                  onChange={v => { this.setState({ query: Object.assign({}, this.state.query, { isTop: v }) }) }}>
                  <Option value={""}>全部</Option>
                  <Option value={1}>是</Option>
                  <Option value={0}>否</Option>
                </Select>
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem {...formItemLayout} label={`发布时间`} style={{ width: '100%' }}>
                <DatePicker
                  value={this.state.query.createDate && this.state.query.createDate.length ? moment(this.state.query.createDate, "YYYY-MM-DD") : null}
                  placeholder="" style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  onChange={this.onPublishDateChange.bind(this)} />
                {/* <RangePicker
                    showTime={{ format: 'HH:mm' }}
                    format="YYYY-MM-DD HH:mm"
                    placeholder={['Start Time', 'End Time']}
                    onChange={this.pickDate.bind(this)}
                    onOk={(value) => { console.log('onOk: ', value); }}
                  /> */}
              </FormItem>
            </Col>

            <Col span={8}>
              <FormItem {...formItemLayout} label={`是否推荐`} style={{ width: '100%' }}>
                <Select placeholder="请选择"
                  value={this.state['query']['isRecommend']}
                  onChange={v => { this.setState({ query: Object.assign({}, this.state.query, { isRecommend: v }) }) }}>
                  <Option value={""}>全部</Option>
                  <Option value={1}>是</Option>
                  <Option value={0}>否</Option>
                </Select>
              </FormItem>
            </Col>
          </Row>

          <Row>
            <Col span={24} style={{ textAlign: 'right', padding: '12px 0' }}>
              <Button type="primary" htmlType="submit" onClick={this.selectData.bind(this)}>查询</Button>
              {/* <Button style={{ marginLeft: 8 }} onClick={this.reset.bind(this)}>重置</Button> */}
            </Col>
          </Row>
        </Form>

        <Table columns={this.state.columns}
          bordered
          rowKey={record => record.uid}
          dataSource={this.state.dataList}
          pagination={this.state.pagination}
          loading={this.state.loading}
          onChange={this.handleTableChange}
          scroll={{ x: 1800 }} />

        <PublishDetail
          currentAuthorization={this.props.currentAuthorization}
          form={this.props.form}
          show={this.state.visible}
          data={this.state.currentColunm}
          updateList={this.changeList.bind(this)}
          ok={(v) => { this.setState({ visible: false }) }} />

      </div>
    );
  };

}
const NoteWithForm = Form.create()(Note);

export default NoteWithForm;
