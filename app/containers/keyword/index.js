/**
 *开通功能列表
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import Http from '../../utils/http';
import PropTypes from 'prop-types';
import './style/index.scss';
import DMCUtil from '../../utils/DMCUtil'
import DealerTree from '../../components/common/dealerTree';
import { Form, Row, Col, Input, Button, Table, Icon, Divider, Select, Popconfirm, message, Modal } from 'antd';

const { Column, ColumnGroup } = Table;
const FormItem = Form.Item;
const { TextArea } = Input;

const title = '维护敏感词汇';
let uuid = 0;
const apis = [
  { "id": "demoList", "url": "demo/list" },
  { "id": "add", "url": "cmyManage/sensitive/words/add" },//添加
  { "id": "update", "url": "cmyManage/sensitive/words/update" },//修改
  { "id": "search", "url": "cmyManage/sensitive/words/search" },   //查询
  { "id": "delWords", "url": "cmyManage/sensitive/words/delWords" }   //删除

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

const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 24, offset: 0 },
  },
};
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 12 },
};

class Keyword extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expand: false,
      dataList: [],
      WordsArry: [],
      search: {
        rows: []
      },
      forValue: {
        limit: 10,
        page: 1
      },
      pagination: {
        size: 'small',
        showSizeChanger: true,
        defaultCurrent: 1,
        pageSize: 10
      },
      dealerCode: '46',
      dealerName: 'wwwg',
      loading: false,
      visible: false,
      visible2: false,
      modalTit: '',
    }
    this.ok = this.ok.bind(this);
  };

  // shouldComponentUpdate() {
  //   return false;
  // }

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

  componentWillMount() {
    this.one();
  }

  componentDidMount() {
    // this.created();
    // this.getDataList();

  }
  one() {
    const _this = this;
    Http.post('search', this.state.forValue, callback => {
      callback.rows.forEach((item, index) => {
        let key = { key: index + 1 };
        callback.rows[index] = Object.assign(callback.rows[index], key)

      });
      _this.setState({
        search: callback,
        pagination: Object.assign(_this.state.pagination, { total: callback.total })
      }, () => {

        console.log(_this.state.search, 11111)
      })
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

  handleReset = () => {
    this.props.form.resetFields();
    const formreact = {
      limit: 10,
      page: 1
    }
    this.setState({
      forValue: formreact
    }, () => {
      Http.post('search', this.state.forValue, callback => {
        callback.rows.forEach((item, index) => {
          let key = { key: index + 1 };
          callback.rows[index] = Object.assign(callback.rows[index], key)

        });
        this.setState({
          search: callback,
          pagination: Object.assign(this.state.pagination, { total: callback.total })
        })
      })
    })

  }

  toggle = () => {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  }

  ok() {

  }

  removeMobile = (k) => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('keys');
    // We need at least one passenger
    if (keys.length === 1) {
      return;
    }

    // can use data-binding to set
    form.setFieldsValue({
      keys: keys.filter(key => key !== k),
    });
  }

  addMobile = () => {
    console.log('form====', form)
    const { form } = this.props;
    const keys = form.getFieldValue('keys');
    const nextKeys = keys.concat(uuid);
    uuid++;

    form.setFieldsValue({
      keys: nextKeys,
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();

    const _that = this;
    this.props.form.validateFields((err, values) => {
      if (values.names) {
        let fag = '';
        values.names.forEach((item, index) => {
          fag += item + '|';
        }
        );
        fag = fag.substring(0, fag.length - 1)
        const params = {
          sensitiveWords: fag
        }
        Http.post('add', params, callback => {
          _that.one();

        })
        setTimeout(V => {
          _that.setState({
            visible: false
          })
        }, 500)
      }
    });

  }
  handleSubmit2 = (e) => {
    e.preventDefault();
    const _that = this;
    this.props.form.validateFields((err, values) => {
      console.log(values)
      if (values.editors) {
        let fag = '';
        values.editors.forEach((item, index) => {
          fag += item + '|';
        }
        );
        fag = fag.substring(0, fag.length - 1)
        const params = {
          id: this.state.records['id'],
          sensitiveWords: fag
        }
        Http.post('update', params, callback => {
          _that.one()
          setTimeout(v => {
            _that.setState({
              visible2: false
            }, () => {
              message.success('编辑成功！');
            })
          })
        })
      }

    })

  }
  resets = () => {
    Http.post('search', this.state.forValue, callback => {
      callback.rows.forEach((item, index) => {
        let key = { key: index + 1 };
        callback.rows[index] = Object.assign(callback.rows[index], key)

      });
      this.setState({
        search: callback,
        pagination: Object.assign(this.state.pagination, { total: callback.total })
      })
    })
  }

  tables = (page) => {
    console.log(page)
  }
  //删除 敏感词
  Confirms = (a) => {
    console.log(this.state.records)
    const params = {
      id: this.state.records['id']
    }
    Http.get('delWords', params, callback => {

      Http.post('search', this.state.forValue, callback => {
        callback.rows.forEach((item, index) => {
          let key = { key: index + 1 };
          callback.rows[index] = Object.assign(callback.rows[index], key)
        });
        this.setState({
          search: callback,
          pagination: Object.assign(this.state.pagination, { total: callback.total })
        }, () => {
          message.success('删除成功！');
        })
      })

    })

  }
  editor = (record) => {
    this.setState({ visible2: true, modalTit: '编辑敏感词汇', records: record })
    // console.log(this.state.record)
    this.setState({
      WordsArry: Object.assign(this.state.WordsArry, record['sensitiveWords'].split('|'))
    })
  }
  handleOk = (a) => {
    console.log(a)
  }
  render() {
    const { getFieldDecorator, getFieldValue, setFieldsValue } = this.props.form;
    console.log(this.state.search)
    getFieldDecorator('keys', { initialValue: [] });
    const keys = getFieldValue('keys');
    const formItems = keys.map((k, index) => {
      return (
        <FormItem
          {...formItemLayoutWithOutLabel}
          key={k}
        >
          <Row gutter={12}>
            <Col span={16}>
              {getFieldDecorator(`names[${k}]`, {
                validateTrigger: ['onChange', 'onBlur'],
                rules: [{
                  required: true,
                  message: "请填写敏感词！",
                }],
              })(
                <Input placeholder="敏感词" style={{ width: '100%', }} maxlength={5} />
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
      <div className={'wrap'} style={{ 'padding': '12px' }}>
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={title} />
        </Helmet>
        <Form layout={'inline'}>
          <Row gutter={24}>
            <Col span={8}>
              <FormItem label={`销售店`}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
                style={{ width: '250px' }}
              >
                <DealerTree selected={(v) => { this.setState(Object.assign(this.state.forValue, { dealerCode: v.value })) }} />
              </FormItem>
            </Col>


          </Row>
          <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Button type="primary" onClick={this.resets}>查询</Button>
              {/* <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>重置</Button> */}
            </Col>
          </Row>
        </Form>

        <Button type="primary" icon="plus-circle-o" onClick={() => { this.setState({ visible: true, modalTit: '新增敏感词汇' }) }} style={{ marginRight: '10px' }}>新增</Button>

        <Table dataSource={this.state.search.rows} bordered pagination={this.state.pagination} onChange={this.tables}>
          <Column
            title="序号"
            dataIndex="key"
            key="key"
          />
          <Column
            title="销售店"
            dataIndex="dealerName"
            key="lastName"
          />
          <Column
            title="敏感词汇"
            dataIndex="sensitiveWords"
            key="age"
          />
          <Column
            title="添加时间"
            dataIndex="createTime"
            key="address"
          />
          <Column
            title="操作"
            key="action"
            render={(text, record) => (
              <span>
                <a href="javascript:void(0);" onClick={this.editor.bind(this, record)}>编辑</a>
                <Divider type="vertical" />
                <Popconfirm title="确认删除 ?" onConfirm={this.Confirms} onCancel={(e) => { message.error('操作取消！'); }} okText="确定" cancelText="取消">
                  <a href="javascript:void(0);" onClick={v => { this.setState({ records: record }) }}>删除</a>
                </Popconfirm>
              </span>
            )}
          />
        </Table>
        <Modal title={this.state.modalTit}
          visible={this.state.visible}
          onOk={() => { }}
          onCancel={() => { this.setState({ visible: false }) }}
          footer={null}
        >
          <Form onSubmit={this.handleSubmit}>
            <FormItem
              {...formItemLayout}
              label={this.state.modalTit === '新增敏感词汇' ? '请添加敏感词汇：' : '请编辑敏感词汇：'}
            >
              {formItems}
              <Button type="dashed" onClick={this.addMobile} style={{ width: '100%' }}>
                <Icon type="plus" /> 点击添加
              </Button>
              <div style={{ textAlign: 'center' }}>
                <Button type="primary" onClick={v => { this.setState({ visible: false }) }} style={{ marginRight: '10px' }}>返回</Button>
                <Button type="primary" htmlType="submit" style={{ marginTop: '30px' }}>提交</Button>
              </div>
            </FormItem>
          </Form>
        </Modal>
        <Modal
          visible={this.state.visible2}
          title="Title"
          onOk={this.handleOk}
          onCancel={() => { this.setState({ visible2: false }) }}
          footer={null}
        >
          <div className={'quik'}>
            <span>
              请编辑敏感词：
            </span>

            <span>
              <Form onSubmit={this.handleSubmit2}>
                {
                  this.state.WordsArry.map((item, index) => {
                    return (
                      <FormItem key={index}>
                        {getFieldDecorator(`editors[${index}]`, {
                          rules: [{ required: true, message: '111111' }],
                          initialValue: item
                        })(
                          <Input placeholder="敏感词" maxlength={5} />
                        )}
                      </FormItem>
                    )
                  })
                }

                {/* {getFieldDecorator('editors')(          
                                 <Input placeholder="敏感词"/>                                
                              )}   */}

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <Button type="primary" onClick={v => { this.setState({ visible2: false }) }} style={{ marginRight: '10px' }}>返回</Button>
                  <Button type="primary" htmlType="submit">
                    提交
                    </Button>
                </div>
              </Form>
            </span>
          </div>



        </Modal>

      </div>
    );
  };

}
const OpenWithForm = Form.create()(Keyword);



export default OpenWithForm;
