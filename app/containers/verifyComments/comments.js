/**
 *审核列表
 */

import React from 'react';
import Http from '../../utils/http';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import './style/comments.scss';
import DMCUtil from '../../utils/DMCUtil';
import {SERVER_BASE_PATH} from '../../global.config';
import { Form, Row, Col, Input, Button, Table, Icon, Divider, Alert, message } from 'antd';
import { setTimeout } from 'timers';

const { Column, ColumnGroup } = Table;
const FormItem = Form.Item;
const { TextArea } = Input;

const title = '审核列表';

const apis = [
  { "id": "exchangeComment", "url": "cmyManage/review/exchangeComment" },
  { "id": "getReviewsBizCount", "url": "cmyManage/review/getReviewsBizCount" },
  { "id": "getItemInfo", "url": "community/item/web/getItemInfo/id" },
  { "id": "toUpdateComment", "url": "cmyManage/review/toUpdateComment" },
  { "id": "toUpdateCourseAndItem", "url": "cmyManage/review/toUpdateCourseAndItem" }
];
message.config({
  top: 400,
  duration: 2,
});
const Authorization = DMCUtil.getJWTFromCookie();
Http.setDomainUrl(SERVER_BASE_PATH);

Http.setMutiApi(apis);
Http.setRequestHeader(Authorization)

class comment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [{
        title: '异常',
        dataIndex: 'exception',
        render: (text, record) => <div>
          {record['exception'] ? record['exception'] : ''}
        </div>
      }, {
        title: '评论人',
        dataIndex: 'commenterName',
      }, {
        title: '手机号',
        dataIndex: 'phone',
      }, {
        title: '评论内容',
        dataIndex: 'commentContent',
      }, {
        title: '评论时间',
        dataIndex: 'commentDate',
      }, {
        title: '点赞数',
        dataIndex: 'praiseCount',
      }, {
        title: '状态',
        dataIndex: 'status',
        render: (text, record) => <div>
          <span style={record['status'] == 0 ? {} : { display: 'none' }}>未审核</span>
          <span style={record['status'] == 2 ? {} : { display: 'none' }}>通过</span>
          <span style={record['status'] == 1 ? {} : { display: 'none' }}>不通过 </span>
        </div>
      }, {
        title: '操作',
        dataIndex: 'age',
        render: (text, record) => <div className={'though'}>
          <span style={record['status'] == 2 ? { display: 'none' } : {}} onClick={this.agree.bind(this, record)}>通过</span>
          <span style={record['status'] == 1 ? { display: 'none' } : {}} onClick={this.noagree.bind(this, record)}>不通过</span>
        </div>
      }],
      blow: {
        display: 'block'
      },
      branchs: {
        yshCount: 0,
        wshCount: 0
      },
      pagination: {
        size: 'small',
        showSizeChanger: true,
        defaultCurrent: 1,
        pageSize: 10
      },
      getItemInfo: {},
      imgs: [],
      exchangeComment: {
        total: 1,
        rows: []
      },
      formValue: {
        limit: 10,
        page: 1
      },
      mats: { display: 'inline-block' },
      agrees: { display: 'none' },
      noagrees: { display: 'inline-block' },
      a1: false,
      a2: false
    }
  };

  componentDidMount() {
    this.created();
    const _that = this;
    let mat = JSON.parse(localStorage.getItem('verify-code'));
    let staus = JSON.parse(localStorage.getItem('verify-Status'));
    this.setState({
      staus: staus
    })
    if (staus['reviewStatus'] == 0 || staus['reviewStatus'] == 1) {
      _that.setState({
        blow: { display: 'none' },
        agrees: { display: 'inline-block' },
        noagrees: { display: 'none' }
      })
    }
    const webDetail = {
      id: mat['businessId']
    }
    // const aa={
    //     businessId:1,
    //     businessType:1002
    // }
    this.setState({
      formValue: Object.assign(this.state.formValue, mat)
    })
    Http.post('exchangeComment', mat, result => {
      result.rows.forEach((item, index) => {
        let time = {
          key: index
        }
        result.rows[index] = Object.assign(result.rows[index], time)
      });
      this.setState({
        exchangeComment: result,
        pagination: Object.assign(this.state.pagination, { total: result['total'] })
      })

    })

    Http.get('getReviewsBizCount', mat, result => {
      this.setState({
        branchs: Object.assign(this.state.branchs, result)
      })
    })
    Http.get('getItemInfo', webDetail, result => {

      this.setState({
        getItemInfo: result
      }, () => {
        if (result['itemImages']) {
          if (result['itemImages'] && result['itemImages'].split(",")) {
            _that.setState({
              imgs: result['itemImages'].split(",")
            })
          }
        }
      })
    })
  }

  state = {
    selectedRowKeys: [], // Check here to configure the default column
  };
  onSelectChange = (selectedRowKeys) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    this.setState({ selectedRowKeys });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { selectedRowKeys } = this.state;
    const data = [];
    for (let i = 0; i < 46; i++) {
      data.push({
        key: i,
        name: `Edward King ${i}`,
        age: 32,
        address: `London, Park Lane no. ${i}`,
      });
    }
    return (
      <div className={'wrap'} style={{ 'padding': '12px' }}>
        <Row justify="end" type="flex">
          <Col className={'ipot'}>
            <Button type="primary" onClick={this.ones.bind(this, '/verify/report')}>查看举报</Button>
            <Button type="primary" onClick={this.one.bind(this, '/verify/through')}>查看审核履历</Button>
            <Button type="primary" onClick={this.two.bind(this, 2)} style={this.state.agrees} disabled={this.state.a2}>通过</Button>
            <Button type="primary" onClick={this.two.bind(this, 1)} style={this.state.noagrees} disabled={this.state.a1}>不通过</Button>
            <Button type="primary" onClick={this.back.bind(this)}>返回</Button>
          </Col>
        </Row>
        <Row gutter={24} className={'all'}>
          <Col className={'alls'}>
            <ul>
              <li><span>审核类型</span>：{this.state.getItemInfo['type']}</li>
              <li><span>发布人</span>：{this.state.getItemInfo['userName']}</li>
              <li><span>手机号</span>：{this.state.getItemInfo['phone']}</li>
              <li><span>话题标签</span>：{this.state.getItemInfo['topicLabel']}</li>
              <li><span>话题标题</span>：{this.state.getItemInfo['topicTitle']}</li>
              <li><span style={{ float: 'left', marginRight: '10px' }}>跟帖图片：</span>
                {
                  this.state.imgs.map((item, index) => {
                    return (
                      <span key={index} style={{ float: 'left', marginRight: '10px', width: '100px', height: '100px' }}><img src={item} /></span>
                    )
                  })
                }
              </li>
            </ul>
          </Col>

          <Col>
            <div>
              正文：
              <div className={'imgWidth'} dangerouslySetInnerHTML={{__html:this.state.getItemInfo['itemText']}}></div>
                         {/* <TextArea rows={4} value={this.state.getItemInfo['itemText']} disabled style={{ color: 'black' }} /> */}
            </div>
          </Col>
        </Row>
        <Row gutter={24} style={this.state.blow}>
          <Col>
            <div className={'tableContent'}>
              <div className={'tabTit'}>
                <span>已审核评论：{this.state.branchs['yshCount']}条</span>
                <span>未审核评论：<i style={{ fontStyle: 'normal', color: 'red' }}>{this.state.branchs['wshCount']}条</i></span>
              </div>
            </div>
          </Col>
          <Col span={24}>
            <Table bordered dataSource={this.state.exchangeComment['rows']} columns={this.state.columns} pagination={this.state.pagination} onChange={this.alfer} />
          </Col>

        </Row>

      </div>
    );
  };
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
      Http.post('exchangeComment', this.state.formValue, result => {
        result.rows.forEach((item, index) => {
          let time = {
            key: index
          }
          result.rows[index] = Object.assign(result.rows[index], time)
        });
        this.setState({
          exchangeComment: result,
          pagination: Object.assign(this.state.pagination, { total: result['total'] })
        })

      })
    });

  }
  one(a) {
    let staus = JSON.parse(localStorage.getItem('verify-Status'));
    let b = '';
    if (staus['serviceType'] == 1006) {
      b = '/verify/throughtopic';
    } else if (staus['serviceType'] == 1002) {
      b = '/verify/throughment';
    } else {
      b = '/verify/through';
    }
    this.props.history.push(b);

  }
  ones(a) {
    this.props.history.push(a);
  }
  two(a) {
    let mat = JSON.parse(localStorage.getItem('verify-code'));
    const code = {
      businessId: mat['businessId'],
      businessType: mat['businessType'],
      reviewStatus: a,
      dealerCode: this.state.getItemInfo['dealerCode'],
      phone: this.state.getItemInfo['phone']

    }
    Http.post('toUpdateCourseAndItem', code, result => {
      if (result['rows'][0]['updateBizSize'] == 1) {
        message.success('请求通过！');
        if (a == 1) {
          this.setState({
            a1: true
          })
        } else if (a == 2) {

          this.setState({
            a2: true
          })

        }

      } else {
        message.success('请求失败！');
      }
    })
  }
  back() {
    this.props.history.push('/verify');
  }
  agree(record) {
    const _that = this;
    let mat = JSON.parse(localStorage.getItem('verify-code'));
    const code = {
      businessId: mat['businessId'],
      businessType: mat['businessType'],
      commentId: record['commentId'],
      commentIds: record['commentIds'],
      commenterName: record['commenterName'],
      dealerCode: record['dealerCode'],
      dealerName: record['dealerName'],
      phone: record['phone'],
      status: 2
    }
    Http.post('toUpdateComment', code, result => {
      let mat = JSON.parse(localStorage.getItem('verify-code'));
      if (result['rows'][0]['updateCommentSize'] == 1) {
        message.success('请求通过！');
        Http.post('exchangeComment', mat, result => {
          result.rows.forEach((item, index) => {
            let time = {
              key: index
            }
            result.rows[index] = Object.assign(result.rows[index], time)
          });
          this.setState({
            exchangeComment: result
          })
        })
      } else {
        message.error('请求失败！');
      }
    })
    Http.get('getReviewsBizCount', mat, result => {
      this.setState({
        branchs: Object.assign(this.state.branchs, result)
      })
    })
  }
  noagree(record) {
    let mat = JSON.parse(localStorage.getItem('verify-code'));
    const code = {
      businessId: mat['businessId'],
      businessType: mat['businessType'],
      commentId: record['commentId'],
      commentIds: record['commentIds'],
      commenterName: record['commenterName'],
      dealerCode: record['dealerCode'],
      dealerName: record['dealerName'],
      phone: record['phone'],
      status: 1
    }
    Http.post('toUpdateComment', code, result => {
      let mat = JSON.parse(localStorage.getItem('verify-code'));
      if (result['rows'][0]['updateCommentSize'] == 1) {
        message.success('请求不通过！');
        Http.post('exchangeComment', mat, result => {
          result.rows.forEach((item, index) => {
            let time = {
              key: index
            }
            result.rows[index] = Object.assign(result.rows[index], time)
          });
          this.setState({
            exchangeComment: result
          })
        })
      } else {
        message.error('请求失败！');
      }
    })
    Http.get('getReviewsBizCount', mat, result => {
      this.setState({
        branchs: Object.assign(this.state.branchs, result)
      })
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
}
const OpenWithForm = Form.create()(comment);

export default OpenWithForm;
