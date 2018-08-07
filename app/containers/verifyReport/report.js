/**
 *审核列表
 */

import React from 'react';
import Http from '../../utils/http';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import DMCUtil from '../../utils/DMCUtil';
import './style/comments.scss';
import {SERVER_BASE_PATH} from '../../global.config';
import moment from 'moment';
import { Form, Row, Col, Input, Button, Table, Icon, Divider,Select, DatePicker } from 'antd';

const { Column, ColumnGroup } = Table;
const FormItem = Form.Item;
const { TextArea } = Input;
const Option = Select.Option;
const title = '审核列表';

const apis = [ 
  { "id": "searchPage", "url": "community/accusation/searchPage" }
];

const Authorization = DMCUtil.getJWTFromCookie();
Http.setDomainUrl(SERVER_BASE_PATH);

Http.setMutiApi(apis);
Http.setRequestHeader(Authorization)

class report extends React.Component {
  constructor(props) {
      super(props);  
      this.state = {
        columns:[{
            width: 80,
            title: '举报人',
            dataIndex: 'accuserName',
          }, {
            width: 120,
            title: '举报人手机号',
            dataIndex: 'accuserPhone',
          }, {
            width: 100,
            title: '举报内容',
            dataIndex: 'accusationContent',
          },{
            title: '举报说明',
            dataIndex: 'detailExplain',
          }, {
            width: 160,
            title: '举报时间',
            dataIndex: 'accusationDate',
          }],
          searchPage:{
            rows: [  
            ]
          },
          formValue:{
            limit:10,
            page:1,
            queryType:1,
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
            formValue:Object.assign(this.state.formValue,mat)
        })
        const code={
            limit: this.state.formValue['limit'],
            page: this.state.formValue['page'],
            queryType: this.state.formValue['queryType']
        }
        Http.post('searchPage',Object.assign(code,mat),result=>{
            result.rows.forEach((item,index) => {
              let time={
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
                <Col>
                    <div style={{float:'left'}}>
                        <FormItem label={`举报时间`}
                            labelCol={{ span: 6 }}
                            wrapperCol={{ span: 18 }}
                            style={{ width: 350 }}
                            >
                           <DatePicker
                            style={{ width: 190 }}
                            showTime={{ format: 'HH:mm' }}
                            format="YYYY-MM-DD"
                            placeholder={'请选择'}
                            onChange={(value, dateString) => {this.setState({formValue:Object.assign(this.state.formValue,{accusationDate:dateString})});}}
                            />
                    </FormItem>
                    <FormItem label={`举报内容`}
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        style={{ width: 350 }}
                        >
                        <Select
                        showSearch
                        placeholder=""
                        optionFilterProp="children"
                        onChange={v=>{this.setState({formValue:Object.assign(this.state.formValue,{contentType:v})})}}
                        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                        style={{width:190}}
                        >
                        <Option value={"SV"}>色情低俗</Option>
                        <Option value={"RD"}>谣言诈骗</Option>
                        <Option value={"PO"}>政治</Option>
                        <Option value={"TO"}>侵权</Option>
                        <Option value={"OT"}>其他</Option>
                </Select>
              </FormItem>
                    </div>
                    <div style={{float:'right'}}>
                        <Button type="primary" onClick={this.back.bind(this)}>返回</Button>
                    </div>
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
      window.history.go(-1);
    }
    check(){
        Http.post('searchPage',this.state.formValue,result=>{
            this.setState({
                searchPage:result
            })
       })
    }
    alfer(page){
        const _that=this;
       this.setState({
        formValue:Object.assign(this.state.formValue,{limit:page.pageSize,
            page:page.current}),
          pagination:Object.assign(this.state.pagination,{pageSize:page.pageSize,
              page:page.current})
       },()=>{
        Http.post('searchPage',_that.state.formValue,result=>{
              result.rows.forEach((item,index) => {
                let time={
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
const OpenWithForm = Form.create()(report);

export default OpenWithForm;
