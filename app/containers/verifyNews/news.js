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
import { Form, Row, Col, Input, Button, Table, Icon, Divider,Alert,message} from 'antd';
import { setTimeout } from 'timers';

const { Column, ColumnGroup } = Table;
const FormItem = Form.Item;
const { TextArea } = Input;

const title = '审核列表';

const apis = [ 
  { "id": "exchangeComment", "url": "cmyManage/review/exchangeComment" },
  { "id": "getReviewsBizCount", "url": "cmyManage/review/getReviewsBizCount" },
  { "id": "queryNewsDetail", "url": "community/news/queryNewsDetail" },
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

class news extends React.Component {
  constructor(props) {
      super(props); 
      this.state = {
        columns:[{
            title: '异常',
            dataIndex: 'exception',
            render: (text,record) =><div>
              {record['exception']?record['exception']:''}
           </div>
          }, {
            title: '评论人',
            dataIndex: 'commenterName',
          }, {
            title: '手机号',
            dataIndex: 'phone',
          },{
            title: '评论内容',
            dataIndex: 'commentContent',
          }, {
            title: '评论时间',
            dataIndex: 'commentDate',
          }, {
            title: '点赞数',
            dataIndex: 'praiseCount',
          },{
            title: '状态',
            dataIndex: 'status',
            render: (text,record) =><div>
                 <span style={record['status']==0?{}:{display:'none'}}>未审核</span>
                 <span style={record['status']==2?{}:{display:'none'}}>通过</span>
                 <span style={record['status']==1?{}:{display:'none'}}>不通过 </span>
            </div>
          }, {
            title: '操作',
            dataIndex: 'age',
            render: (text,record) => <div className={'though'}>
                <span style={record['status']==2?{display:'none'}:{}} onClick={this.agree.bind(this,record)}>通过</span>
                <span style={record['status']==1?{display:'none'}:{}} onClick={this.noagree.bind(this,record)}>不通过</span>
            </div>
          }],
          blow:{
            display:'block'
          },
          branchs:{
            yshCount: 0,
            wshCount: 0
          },
          pagination: {
            size: 'small',
            showSizeChanger: true,
            defaultCurrent:1,
            pageSize:10
          },
          queryNewsDetail:{},
          exchangeComment:{
            total: 1,
            rows: [
               
            ]
          },
          mats:{display:'inline-block'},
          blow:{display:'block'},
          agrees:{display:'none'},
          noagrees:{display:'inline-block'}
      }
    };
    
    componentDidMount() {
        this.created();
        const _that=this;
        let mat=JSON.parse(localStorage.getItem('verify-code'));
        let staus=JSON.parse(localStorage.getItem('verify-Status'));
        const webDetail={
          id:mat['businessId'],
          phone:'11'
        }
        // const aa={
        //     businessId:1,
        //     businessType:1002
        // }
        if(staus['reviewStatus']==0){
          this.setState({
            blow:{display:'none'},
            agrees:{display:'inline-block'},
            noagrees:{display:'none'}
          })
        }
        Http.post('exchangeComment',mat,result=>{
          result.rows.forEach((item,index) => {
            let time={
               key:index
            }
            result.rows[index]=Object.assign(result.rows[index],time)
          });
          this.setState({
            exchangeComment:result
          })
        })
        Http.get('getReviewsBizCount',mat,result=>{
            this.setState({
              branchs:Object.assign(this.state.branchs,result)
            })
        })
        
        Http.get('queryNewsDetail',webDetail,result=>{
            if(result){
            this.setState({
                queryNewsDetail:result
                })
            }
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
        <div className={'wrap'} style={{'padding':'12px'}}>
            <Row  justify="end"  type="flex">
                <Col className={'ipot'}>
                    <Button type="primary" onClick={this.one.bind(this,'/verify/report')}>查看举报</Button>
                    <Button type="primary" onClick={this.one.bind(this,'/verify/through')}>查看审核履历</Button>
                    {/* <Button type="primary" onClick={this.two.bind(this,2)} style={this.state.agrees}>通过</Button>
                    <Button type="primary" onClick={this.two.bind(this,1)} style={this.state.noagrees}>不通过</Button> */}
                    <Button type="primary" onClick={this.back.bind(this)}>返回</Button>
                </Col>
             </Row>
             <Row  gutter={24}>
                <Col>
                    <ul>
                        <li><span>审核类型</span>：新闻资讯</li>
                        <li><span>活动标题</span>：{this.state.queryNewsDetail['title']}</li>
                        <li><span>发布方</span>：{this.state.queryNewsDetail['dealerName']}</li>
                    </ul>
                </Col>
                
                <Col>
                    <div>
                         正文：
                         <div className={'imgWidth'} dangerouslySetInnerHTML={{__html:this.state.queryNewsDetail['content']}}></div>
                         {/* <TextArea rows={4} value={this.state.queryNewsDetail['content']} disabled style={{color:'black'}}/> */}
                    </div>
                </Col>
                </Row>
                <Row  gutter={24} style={this.state.blow}>
                  <Col>
                      <div className={'tableContent'}>
                          <div className={'tabTit'}>
                              <span>已审核评论：{this.state.branchs['yshCount']}条</span>
                              <span>未审核评论：<i style={{fontStyle:'normal',color:'red'}}>{this.state.branchs['wshCount']}条</i></span>
                          </div>
                      </div>       
                  </Col>
                    <Col span={24}>
                        <Table bordered dataSource={this.state.exchangeComment['rows']} columns={this.state.columns} pagination={this.state.pagination}/>
                    </Col>
                     
             </Row> 
             
        </div>
      );
    };
    one(a){
     this.props.history.push(a);
      
    }
    two(a){
      const code={
          businessId:78,
          businessType:1002,
          reviewStatus:a
      }
      Http.post('toUpdateCourseAndItem',code,result=>{
         if(result['rows'][0]['updateBizSize']==1){
              message.success('请求通过！');
         }else{
              message.success('请求失败！');
         }
      })
    }
    back(){
      this.props.history.push('/verify');
    }
    agree(record){
      console.log(record)
      const _that=this;
      let mat=JSON.parse(localStorage.getItem('verify-code'));
      const code={
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
      Http.post('toUpdateComment',code,result=>{
        let mat=JSON.parse(localStorage.getItem('verify-code'));
        if(result['rows'][0]['updateCommentSize']==1){
          message.success('请求通过！');
          Http.post('exchangeComment',mat,result=>{
            result.rows.forEach((item,index) => {
              let time={
                 key:index
              }
              result.rows[index]=Object.assign(result.rows[index],time)
            });
            this.setState({
              exchangeComment:result
            })
          })
        }else{
          message.error('请求失败！');
        }
      })
    }
    noagree(record){
      let mat=JSON.parse(localStorage.getItem('verify-code'));
      const code={
          businessId: mat['businessId'],
          businessType: mat['businessType'],
          commentId: record['commentId'],
          commentIds: record['commentIds'],
          commenterName: record['commenterName'],
          dealerCode: record['dealerCode'],
          dealerName: record['dealerName'],
          phone: record['phone'],
          status:1
      }
      Http.post('toUpdateComment',code,result=>{
        let mat=JSON.parse(localStorage.getItem('verify-code'));
        if(result['rows'][0]['updateCommentSize']==1){
          message.success('请求不通过！');
          Http.post('exchangeComment',mat,result=>{
            result.rows.forEach((item,index) => {
              let time={
                 key:index
              }
              result.rows[index]=Object.assign(result.rows[index],time)
            });
            this.setState({
              exchangeComment:result
            })
          })
          }else{
            message.error('请求失败！');
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
}
const OpenWithForm = Form.create()(news);

export default OpenWithForm;
