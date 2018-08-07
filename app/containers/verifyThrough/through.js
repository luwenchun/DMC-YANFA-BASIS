/**
 *审核列表
 */

import React from 'react';
import Http from '../../utils/http';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import DMCUtil from '../../utils/DMCUtil';
import {SERVER_BASE_PATH} from '../../global.config';
import './style/comments.scss';
import moment from 'moment';
import { Form, Row, Col, Input, Button, Table, Icon, Divider,Select, DatePicker } from 'antd';

const { Column, ColumnGroup } = Table;
const FormItem = Form.Item;
const { TextArea } = Input;
const Option = Select.Option;
const { RangePicker } = DatePicker;
const title = '审核列表';

const apis = [ 
  { "id": "review", "url": "cmyManage/review/get" }
];

const Authorization = DMCUtil.getJWTFromCookie();
Http.setDomainUrl(SERVER_BASE_PATH);

Http.setMutiApi(apis);
Http.setRequestHeader(Authorization)

class through extends React.Component {
  constructor(props) {
      super(props);   
      this.state = {
        columns:[{
            title: '审核人',
            dataIndex: 'reviewName',
          }, {
            title: '审核人手机号',
            dataIndex: 'reviewPhone',
          }, {
            title: '审核时间',
            dataIndex: 'times',
          },{
            title: '结果',
            dataIndex: 'reviewType',
            render: (text,record) =><div>
                <span style={record['reviewType']==1?{}:{display:'none'}}>不通过</span>
                <span style={record['reviewType']==2?{}:{display:'none'}}>通过 </span>
            </div>
          }],
          searchPage:{
            rows: [
                
            ]
          },
          formValue:{
            limit:10,
            page:1,
            accusationDate:'',
            contentType:'',
          },
          pagination:{
            size: 'small',
            showSizeChanger: true,
            defaultCurrent:1,
            pageSize:10
          },
      }
    };

    componentDidMount() {
        this.created();
        let mat=JSON.parse(localStorage.getItem('verify-code'));
        this.setState({
            formValue:Object.assign(this.state.formValue,{serviceId:mat['businessId'],serviceType:mat['businessType']})
        })
        const code={
            limit: this.state.formValue['limit'],
            page: this.state.formValue['page'],
            
        }
        Http.post('review',this.state.formValue,result=>{
            result.rows.forEach((item,index) => {
                let time={
                   times:moment(item['reviewTime']).format('YYYY-MM-DD HH:mm:ss'),
                   key:index
                }
                result.rows[index]=Object.assign(result.rows[index],time)
              });
                   this.setState({
                    searchPage:result,
                    pagination:Object.assign(this.state.pagination,{total:result['total']})
                   })
          })
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
            <Row>
                
                <Col span={8}>
                       <FormItem label={`审核时间`}
                            labelCol={{ span: 6 }}
                            wrapperCol={{ span: 18 }}
                            style={{ width: 350 }}
                            >
                           <DatePicker
                            style={{ width: 190 }}
                            showTime={{ format: 'HH:mm' }}
                            format="YYYY-MM-DD"
                            placeholder={'请选择'}
                            onChange={(value, dateString) => {this.setState({formValue:Object.assign(this.state.formValue,{createDate:dateString?new Date(dateString).toUTCString():''})});}}
                            />
                        </FormItem>
                </Col>
                <Col span={8}>
                     <FormItem label={`结果`}
                            labelCol={{ span: 6 }}
                            wrapperCol={{ span: 18 }}
                            style={{ width: 350 }}
                            >
                            <Select
                            showSearch
                            placeholder=""
                            optionFilterProp="children"
                            onChange={v=>{this.setState({formValue:Object.assign(this.state.formValue,{reviewType:v})})}}
                            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            style={{width:190}}
                            >
                            <Option value={2}>通过</Option>
                            <Option value={1}>不通过</Option>
                          </Select>
                      </FormItem>
                </Col>
                
                <Col span={8} style={{textAlign:'right'}}>
                    
                        <Button type="primary" onClick={this.back.bind(this)}>返回</Button>
                   
                </Col>
                <Col span={24}>
                     <FormItem label={`审核人`}
                            labelCol={{ span: 6 }}
                            wrapperCol={{ span: 18 }}
                            style={{ width: 350}}
                            >
                            {getFieldDecorator(`field-1`)(
                            <Input placeholder="" onChange={v=>{this.setState({formValue:Object.assign(this.state.formValue,{reviewName:v.target.value})})}} style={{width:190}}/>
                            )}
                      </FormItem>
                </Col>
             </Row>
             <Row type="flex" justify="end">
                <Button type="primary" onClick={this.check.bind(this)}>查询</Button>
             </Row>
             <Row  gutter={24} style={this.state.blow}>
                    <Col span={24}>
                        <Table bordered dataSource={this.state.searchPage['rows']} columns={this.state.columns} pagination={this.state.pagination} onChange={this.alfer.bind(this)}/>
                    </Col>
             </Row> 
             
        </div>
      );
    };
    back(){
      let staus=JSON.parse(localStorage.getItem('verify-Status'));
      let b='';
      if(staus['serviceType']==1006){
          b='/verify/comments';
      }else if(staus['serviceType']==1002){
          b='/verify/trends';
      }else if(staus['serviceType']==1003){
          b='/verify/activity';
      }else if(staus['serviceType']==1004){
          b='/verify/news';
      }
      this.props.history.push(b);
    }
    check(){
        Http.post('review',this.state.formValue,result=>{
            result.rows.forEach((item,index) => {
                let time={
                   times:moment(item['reviewTime']).format('YYYY-MM-DD HH:mm:ss'),
                   key:index
                }
                result.rows[index]=Object.assign(result.rows[index],time)
              });
                   this.setState({
                    searchPage:result,
                    pagination:Object.assign(this.state.pagination,{total:result['total']})
                   })
       })
    }
    alfer(page){
      
    let mat=JSON.parse(localStorage.getItem('verify-code'));
        const _that=this;
       this.setState({
        formValue:Object.assign(this.state.formValue,{limit:page.pageSize,
            page:page.current}),
          pagination:Object.assign(this.state.pagination,{pageSize:page.pageSize,
              page:page.current})
       },()=>{
        const code={
          limit: _that.state.formValue['limit'],
          page: _that.state.formValue['page'],
         
        }
        Http.post('review',Object.assign(code,mat),result=>{
              result.rows.forEach((item,index) => {
                let time={
                  times:moment(item['reviewTime']).format('YYYY-MM-DD HH:mm:ss'),
                  key:index
                }
                result.rows[index]=Object.assign(result.rows[index],time)
      
              });
                   this.setState({
                    searchPage:result,
                    pagination:Object.assign(this.state.pagination,{total:result['total']})
                   })
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
const OpenWithForm = Form.create()(through);

export default OpenWithForm;
