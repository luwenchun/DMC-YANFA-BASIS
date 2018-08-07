/**
 *开通功能列表
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import Http from '../../utils/http';
import DMCUtil from '../../utils/DMCUtil'
import PropTypes from 'prop-types';
import './style/energy.conf.scss';
import { Form, Row, Col, Input, Button, Table, Icon, Divider, Select, Modal } from 'antd';

const { Column, ColumnGroup } = Table;
const FormItem = Form.Item;

const title = '设置丰云能量';

const apis = [
  { "id": "search", "url": "energy/rule/search" },
  { "id": "update", "url": "energy/rule/update" },
];

const Authorization = DMCUtil.getJWTFromCookie()
Http.setDomainUrl(DMCUtil.SERVER_BASE_PATH);

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
      currentEdit: {
      },
      formVal: {
        frequency: '',
        energyType: '',
        energy: '',
        limitCycle: '',
        limit: '',
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
  getDataList() {
    const _this = this;
    Http.get('search', (dataList) => {
      _this.setState({ dataList });
    })
  }


  // 编辑规则
  ruleEdit() {
    let cycleType;
    const _this = this;
    const { formVal, dataList } = Object.assign({}, this.state);
    if (formVal.limitCycle === '每日') {
      cycleType = "D"
    } else if (formVal.limitCycle === '每周') {
      cycleType = "W"
    } else if (formVal.limitCycle === '每月') {
      cycleType = "M"
    } else if (formVal.limitCycle === '每年') {
      cycleType = "Y"
    } else {
      cycleType = formVal.limitCycle
    }
    const parmas = {
      "cycleType": cycleType,
      "energy": formVal.energyType + formVal.energy,
      "frequency": Number(formVal.frequency),
      "id": formVal.id,
      "toplimit": Number(formVal.limit)
    }

    this.setState({
      visible: false,
      currentEdit: {},
      formVal: {
        frequency: '',
        energyType: '',
        energy: '',
        limitCycle: '',
        limit: '',
      }
    });

    let setLimit = '';
    if (formVal.limitCycle === 'D') {
      setLimit = "每日"
    } else if (formVal.limitCycle === 'W') {
      setLimit = "每周"
    } else if (formVal.limitCycle === 'M') {
      setLimit = "每月"
    } else if (formVal.limitCycle === 'Y') {
      setLimit = "每年"
    }else{
      setLimit = formVal.limitCycle
    }

    // 更新列表数据
    dataList.forEach((item, index) => {
      if (item.id == formVal.id) {
        item['energy'] = parmas['energy'];
        item['frequency'] = parmas['frequency'];
        item['limit'] = setLimit + parmas['toplimit'] + '次';
      }
    })
    debugger;
    Http.post('update', parmas, (result) => {
      _this.state({ dataList })
      debugger;
    })

  }


  ruleCancel() {
    this.setState({
      visible: false,
      currentEdit: {},
      formVal: {
        frequency: '',
        energyType: '',
        energy: '',
        limitCycle: '',
        limit: '',
      }
    })
  }


  columnEdit(record) {
    this.setState({
      visible: true,
      currentEdit: record,
      formVal: Object.assign({}, {
        frequency: record.frequency ? record.frequency : '',
        energyType: record.energy ? record.energy.slice(0, 1) : '',
        energy: record.energy ? record.energy.slice(1, record.energy.length) : '',
        limitCycle: record.limit ? record.limit.slice(0, 2) : '',
        limit: record.limit ? record.limit.slice(2, record.limit.length - 1) : '',
        id: record.id,
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



  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return (
      <div className={'wrap'} style={{ 'padding': '12px' }}>
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={title} />
        </Helmet>
        <Table dataSource={this.state.dataList} bordered>
          <Column
            title="动 作"
            dataIndex="actionName"
            key="actionName"
          />
          <Column
            title="数值(整数)"
            dataIndex="frequency"
            key="frequency"
          />
          <Column
            title="单位"
            dataIndex="unit"
            key="unit"
          />
          <Column
            title="获得丰云能量"
            dataIndex="energy"
            key="energy"
          />
          <Column
            title="上 限"
            dataIndex="limit"
            key="limit"
          />
          <Column
            title="触发条件"
            dataIndex="triggerCondition"
            key="triggerCondition"
          />
          <Column
            title="操作"
            key="action"
            render={(text, record) => (
              <span>
                <a href="javascript:void(0);" onClick={this.columnEdit.bind(this, record)}>编辑</a>
              </span>
            )}
          />
        </Table>


        <Modal title="丰云能量规则编辑"
          visible={this.state.visible}
          onOk={this.ruleEdit.bind(this)}
          onCancel={this.ruleCancel.bind(this)} >
          <Form>
            <FormItem
              style={{ marginBottom: '10px' }}
              {...formItemLayout}
              label={`动 作:`}>
              <span className="ant-form-text">{this.state.currentEdit.actionName}</span>
            </FormItem>

            <FormItem
              style={{ marginBottom: '10px' }}
              {...formItemLayout}
              label={`数值(整数):`}>
              <Input style={{ width: 60 }}
                size="small"
                placeholder={this.state.currentEdit.frequency}
                onChange={(e) => { this.setState({ formVal: Object.assign({}, this.state.formVal, { frequency: e.target.value }) }) }}
                maxLength="2" />
              <span className="ant-form-text"> 次</span>
            </FormItem>

            <FormItem
              style={{ marginBottom: '10px' }}
              {...formItemLayout}
              label={`获得丰云能量:`}>
              <Select
                size="small"
                style={{ width: 40 }}
                placeholder={this.state.currentEdit.energy ? this.state.currentEdit.energy.slice(0, 1) : ''}
                onChange={(v) => { this.setState({ formVal: Object.assign({}, this.state.formVal, { energyType: v }) }) }}
              >
                <Option value="+">+</Option>
                <Option value="-">-</Option>
              </Select>
              <Input style={{ width: 60 }}
                size="small"
                placeholder={this.state.currentEdit.energy ? this.state.currentEdit.energy.slice(1, this.state.currentEdit.energy.length) : ''}
                onChange={(e) => { this.setState({ formVal: Object.assign({}, this.state.formVal, { energy: e.target.value }) }) }}
                maxLength="5" />
              <p style={{ color: "red", marginBottom: 0, lineHeight: '20px' }}>注:【+】表示发放能量值</p>
              <p style={{ color: "red", marginBottom: 0, lineHeight: '20px', paddingLeft: '20px' }}>【-】表示扣减能量值</p>
            </FormItem>


            <FormItem
              style={{ marginBottom: '10px' }}
              {...formItemLayout}
              label={`上 限:`}>
              <Select
                style={{ width: 80 }}
                placeholder={this.state.currentEdit.limit ? this.state.currentEdit.limit.slice(0, 2) : ''}
                onChange={(v) => { this.setState({ formVal: Object.assign({}, this.state.formVal, { limitCycle: v }) }) }}
              >
                <Option value="D">每日</Option>
                <Option value="W">每周</Option>
                <Option value="M">每月</Option>
                <Option value="Y">每年</Option>
              </Select>
              <Input style={{ width: 60 }}
                placeholder={this.state.currentEdit.limit ? this.state.currentEdit.limit.slice(2, this.state.currentEdit.limit.length - 1) : ''}
                onChange={(e) => { this.setState({ formVal: Object.assign({}, this.state.formVal, { limit: e.target.value }) }) }}
                maxLength="5" />
              <span className="ant-form-text"> 次</span>
            </FormItem>

            <FormItem
              style={{ marginBottom: '10px' }}
              {...formItemLayout}
              label={`触发条件:`}>
              <span className="ant-form-text">{this.state.currentEdit.triggerCondition}</span>
            </FormItem>

          </Form>
        </Modal>


      </div>
    );
  };

}
const OpenWithForm = Form.create()(Open);


export default OpenWithForm;
