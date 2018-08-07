/**
 *推荐置顶列表
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import Http from '../../utils/http';
import PropTypes from 'prop-types';
import DMCUtil from '../../utils/DMCUtil';
import './style/index.scss';
import moment from 'moment';
import DealerTree from '../../components/common/dealerTree';
import { Form, Row, Col, Input, Button, Table, Icon, Divider, Select, DatePicker, Popconfirm, message, Modal } from 'antd';

const { Column, ColumnGroup } = Table;
const FormItem = Form.Item;
const { RangePicker, MonthPicker, } = DatePicker;

const title = '置顶';

const apis = [
  { "id": "findSerTopInfoList", "url": "cmyManage/top/api/findSerTopInfoList" },
  { "id": "addOrUpdateTjZd", "url": "cmyManage/top/api/addOrUpdateTjZd" },
  { "id": "delTopById", "url": "cmyManage/top/api/delTopById" },
  { "id": "findTopOrderList", "url": "cmyManage/top/api/findTopOrderList" },
  { "id": "updateTopOrderById", "url": "cmyManage/top/api/updateTopOrderById" }
];

const Authorization = DMCUtil.getJWTFromCookie()
Http.setDomainUrl(DMCUtil.SERVER_BASE_PATH);

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
        defaultCurrent:1,
        pageSize:10
      },
      findSerTopInfoList:{},
      findTopOrderList:[],
      topOrder:'',
      pagination: {
        size: 'small',
        showSizeChanger: true,
        defaultCurrent:1,
        pageSize:10
      },
      gain:[],
      loading: false,
      visible: false,
      visible1: false,
      formValue:{
        limit: 10,
        page: 1
     },
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
    Http.post('findSerTopInfoList', this.state.formValue, result => {
      result.rows.forEach((item,index) => {
        let time={
           times:moment(item['pubDate']).format('YYYY-MM-DD HH:mm:ss'),
           times1:moment(item['topDate']).format('YYYY-MM-DD HH:mm:ss'),
           key:index
        }
        result.rows[index]=Object.assign(result.rows[index],time)
        item['title'] = item['title'] && item['title'].length > 12 ? item['title'].slice(0, 12)+'……' : item['title'];
      });
           this.setState({
            findSerTopInfoList:result,
            pagination:Object.assign(this.state.pagination,{total:result['total']})
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
  handleOk = (e) => {
    this.setState({
      visible3: false
    });
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
            <Col span={8}>
              <FormItem label={`销售店`}
                {...formItemLayout}
                style={{ width: '100%' }}
              >
                <DealerTree selected={(v) => { this.setState({ formValue: Object.assign(this.state.formValue, { dealerCode: v.value }) }) }} />

              </FormItem>
            </Col>

            <Col span={8}>
              <FormItem label={`标 题`}
                {...formItemLayout}
                style={{ width: '100%' }}>
                {getFieldDecorator(`field-1`)(
                  <Input placeholder=""  onChange={v => {this.setState({formValue:Object.assign(this.state.formValue,{businessTitle:v.target.value})});}}                  
                  />
                )}
              </FormItem>
            </Col>

            <Col span={8}>
              <FormItem label={`是否置顶`}
                {...formItemLayout}
                style={{ width: '100%' }}>
                <Select
                  showSearch
                  placeholder="全部"
                  optionFilterProp="children"
                  onChange={v => {this.setState({formValue:Object.assign(this.state.formValue,{isTop:v})});}}                  
                  onFocus={() => { }}
                  onBlur={() => { }}
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                 <Option value={''}>全部</Option>
                  <Option value={1}>是</Option>
                  <Option value={0}>否</Option>
                </Select>
              </FormItem>
            </Col>

            <Col span={8}>
              <FormItem label={`所属模块`}
                {...formItemLayout}
                style={{ width: '100%' }}>
                <Select
                  showSearch
                  placeholder="全部"
                  optionFilterProp="children"
                  onChange={v => {this.setState({formValue:Object.assign(this.state.formValue,{thePlate:v})});}}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  defaultValue={1}
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  <Option value={''}>全部</Option>
                  <Option value={1}>推荐</Option>
                  <Option value={2}>资讯</Option>
                  <Option value={3}>车圈</Option>
                </Select>
              </FormItem>
            </Col>

            <Col span={8}>
              <FormItem label={`发布时间`}
                {...formItemLayout}
                style={{ width: '100%' }}>
                 <DatePicker
                 style={{ width: '100%' }}
                 showTime={{ format: 'HH:mm' }}
                 format="YYYY-MM-DD HH:mm"
                 placeholder={'请选择'}
                 onChange={(value, dateString) => {this.setState({formValue:Object.assign(this.state.formValue,{publistDate:new Date(dateString).getTime()})});}}
                 onOk={(value) => { console.log('onOk: ', value); }}
               />
              </FormItem>
            </Col>

          </Row>
          <Row>
            <Col span={24} style={{ textAlign: 'right', marginBottom:"12px"}}>
              <Button type="primary" htmlType="submit" onClick={this.query.bind(this)}>查询</Button>
              {/* <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>重置</Button> */}
            </Col>
          </Row>
        </Form>
        <Table dataSource={this.state.findSerTopInfoList['rows']} bordered pagination={this.state.pagination} onChange={this.alfer.bind(this)} scroll={{ x: 1400 }}>
          <Column
            title="销售店"
            dataIndex="dealerName"
            key="dealerName"
          />
          <Column
            title="所属模块"
            dataIndex="thePlate"
            key="thePlate1"
          />
          <Column
            title="标题"
            dataIndex="title"
            key="title1"
          />
          <Column
            title="标签"
            dataIndex="label"
            key="label1"
          />
          <Column
            title="类型"
            dataIndex="businessType"
            key="businessType1"
            render={(text, record) => (
              <div>
                   <span>{record['businessType']==1001?'话题':''}{record['businessType']==1002?'动态':''}{record['businessType']==1003?'活动':''}{record['businessType']==1004?'新闻资讯':''}</span>
              </div>
            )}
          />

          <Column
            title="发布时间"
            dataIndex="times"
            key="times"
          />
          <Column
            title="是否置顶"
            dataIndex="isTop"
            key="isTop1"
            render={(text, record) => (
              <div>
                   <span style={record['isTop']==1?{}:{display:'none'}}>是</span>
                   <span style={record['isTop']==0?{}:{display:'none'}}>否</span>
                   <span style={record['isTop']==null?{}:{display:'none'}}>否</span>
              </div>
            )}
          />
          <Column
            title="置顶显示次序"
            dataIndex="topOrder"
            key="topOrder1"
          />
          <Column
            title="置顶时间"
            dataIndex="topDate"
            key="topDate"
          />
          <Column
            title="操作"
            key="zxx"
            fixed="right"
            render={(text, record) => (
              <span>
                <a href="javascript:void(0);" onClick={this.revise.bind(this,record)} style={record['isTop']==(0||null)?{display:'none',marginRight:'10px'}:{marginRight:'10px'}}>修改置顶</a>
                <Popconfirm title="确认要置顶此项 ?" onConfirm={this.ordertop.bind(this,record)} onCancel={(e) => { message.error('操作取消！'); }} okText="确定" cancelText="取消" style={record['isTop']==1?{display:'none'}:{}}>
                  <a href="javascript:void(0);" style={record['isTop']==1?{display:'none'}:{}}>置顶</a>
                </Popconfirm>
                
                <Popconfirm title="确认取消置顶 ?" onConfirm={this.orderlast.bind(this,record)} onCancel={(e) => { message.error('操作取消！'); }} okText="确定" cancelText="取消">
                  <a href="javascript:void(0);" style={record['isTop']==(0||null)?{display:'none'}:{}}>取消置顶</a>
                </Popconfirm>
              </span>
            )}
          />
        </Table>

        <Modal title="修改置顶"
          visible={this.state.visible}
          onOk={v=>{this.setState({visible1:true})}}
          onCancel={()=>{this.setState({visible: false})}}
        >
          <span style={{color:'red',display:'block'}}>原置顶显示次序：{this.state.orderBy}</span>
          <span>请重新选择置顶顺序：</span>
          <Select
            showSearch
            style={{ width: 180 }}
            placeholder=""
            defaultValue={this.state.orderBy}
            optionFilterProp="children"
            onChange={this.handleChanges.bind(this)}
           
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          >
            {
              this.state.gain.map((item,index)=>{
                  return(
                    <Option value={item} key={index}>{item}</Option>
                  )
              })
            }
          </Select>
          <span style={{ color: "#d1d1d1" }}> ( 默认显示当前置顶次序 ) </span>
        </Modal>
        <Modal
          title="Basic Modal"
          visible={this.state.visible1}
          onOk={this.hideModals.bind(this)}
          onCancel={v=>{this.setState({visible1:false})}}
        >
          <p>确认要交换置顶显示次序</p>
          
        </Modal>
        
      </div>
    );
  };
  handleChanges(event){
    //  console.log(typeof event)
     this.setState({
      topOrder:event
     })
  }
  hideModals(){      
    const code={
      businessId:this.state.id,
      thePlate:this.state.thePlate,
      businessType:this.state.businessType,
      topOrder:this.state.topOrder?parseInt(this.state.topOrder):''
    }
    Http.post('updateTopOrderById',code,result=>{
      if(result==1){
        message.success('修改置顶次序成功！');
        Http.post('findSerTopInfoList',this.state.formValue,result=>{
          result.rows.forEach((item,index) => {
            let time={
               times:moment(item['pubDate']).format('YYYY-MM-DD HH:mm:ss'),
               times1:moment(item['topDate']).format('YYYY-MM-DD HH:mm:ss'),
               key:index
            }
            result.rows[index]=Object.assign(result.rows[index],time)
            item['title'] = item['title'] && item['title'].length > 12 ? item['title'].slice(0, 12)+'……' : item['title'];
          });
               this.setState({
                findSerTopInfoList:result,
                pagination:Object.assign(this.state.pagination,{total:result['total']})
               })
        })
      }else{
        message.success('修改置顶次序失败！');
      }
      
    })
    this.setState({
      visible:false,
      visible1:false
    })
  }
revise(record){
  this.setState({ visible: true,orderBy:record['topOrder'],id:record['id'],businessType:record['businessType']});
  let plate='';
  switch (record['thePlate']){
    case '推荐':
    plate=1;
    break;
    case '资讯':
    plate=2;
    break;
    case '车圈':
    plate=3;
    break;
  }
  this.setState({
    thePlate:plate
  })
  const code={
    thePlate:plate
  }
  // if(record['topOrder']){
  //   for (var i = 0; i < this.state.gain.length;i++) {
  //     if (this.state.gain[i]==5){
  //          this.state.gain.splice(i,1)
  //            this.setState({
  //             gain:this.state.gain
  //            })
  //        } 
  //     }
  //     };
      Http.post('findTopOrderList',code,result=>{
          this.setState({
            gain:result.split(',')
          })
      })
  }
  

 alfer(page){
  this.setState({
    formValue:Object.assign(this.state.formValue,{limit:page.pageSize,
      page:page.current}),
    pagination:Object.assign(this.state.pagination,{pageSize:page.pageSize,
        page:page.current})
   },()=>{
    Http.post('findSerTopInfoList',this.state.formValue,result=>{
      result.rows.forEach((item,index) => {
        let time={
           times:moment(item['pubDate']).format('YYYY-MM-DD HH:mm:ss'),
           times1:moment(item['topDate']).format('YYYY-MM-DD HH:mm:ss'),
           key:index
        }
        result.rows[index]=Object.assign(result.rows[index],time)
        item['title'] = item['title'] && item['title'].length > 12 ? item['title'].slice(0, 12)+'……' : item['title'];
      });
           this.setState({
            findSerTopInfoList:result,
            pagination:Object.assign(this.state.pagination,{total:result['total']})
           })
    })
   });
 }
  ordertop(record){
    
    let plate='';
    
    switch (record['thePlate']){
      case '推荐':
      plate=1;
      break;
      case '资讯':
      plate=2;
      break;
      case '车圈':
      plate=3;
      break;

    }
     
    const code={
      businessId: record['id'],   
      businessType: record['businessType'], 
      isTop: 1,
      thePlate:plate,
    }
    
    Http.post('addOrUpdateTjZd',code, result => {
         if(result==1){
            message.success('置顶成功！');
            Http.post('findSerTopInfoList', this.state.formValue, result => {
              result.rows.forEach((item,index) => {
                let time={
                  times:moment(item['pubDate']).format('YYYY-MM-DD HH:mm:ss'),
                  times1:moment(item['topDate']).format('YYYY-MM-DD HH:mm:ss'),
                  key:index
                }
                result.rows[index]=Object.assign(result.rows[index],time)
                item['title'] = item['title'] && item['title'].length > 12 ? item['title'].slice(0, 12)+'……' : item['title'];
              });
                  this.setState({
                    findSerTopInfoList:result,
                    pagination:Object.assign(this.state.pagination,{total:result['total']})
                  })
            })
         }else if(result==5){
            message.success('置顶已满！');
            Http.post('findSerTopInfoList', this.state.formValue, result => {
              result.rows.forEach((item,index) => {
                let time={
                  times:moment(item['pubDate']).format('YYYY-MM-DD HH:mm:ss'),
                  times1:moment(item['topDate']).format('YYYY-MM-DD HH:mm:ss'),
                  key:index
                }
                result.rows[index]=Object.assign(result.rows[index],time)
                item['title'] = item['title'] && item['title'].length > 12 ? item['title'].slice(0, 12)+'……' : item['title'];
              });
                  this.setState({
                    findSerTopInfoList:result,
                    pagination:Object.assign(this.state.pagination,{total:result['total']})
                  })
            })
         }
    })
    
    
    
  }
  orderlast(record){
    //let Type='';
    let plate='';
    // switch (record['businessType']){
    //   case '话题':
    //   Type=1001;
    //   break;
    //   case '动态':
    //   Type=1002;
    //   break;
    //   case '活动':
    //   Type=1003;
    //   break;
    //   case '新闻资讯':
    //   Type=1004;
    //   break;

    // }
    switch (record['thePlate']){
      case '推荐':
      plate=1;
      break;
      case '资讯':
      plate=2;
      break;
      case '车圈':
      plate=3;
      break;

    }
     
    const code={
      businessId: record['id'],   
      businessType: record['businessType'], 
      isTop: 0,
      thePlate:plate,
    }
    
    Http.post('delTopById',code, result => {
         if(result==1){
            message.success('取消置顶成功！');
            Http.post('findSerTopInfoList', this.state.formValue, result => {
              result.rows.forEach((item,index) => {
                let time={
                  times:moment(item['pubDate']).format('YYYY-MM-DD HH:mm:ss'),
                  times1:moment(item['topDate']).format('YYYY-MM-DD HH:mm:ss'),
                  key:index
                }
                result.rows[index]=Object.assign(result.rows[index],time)
                item['title'] = item['title'] && item['title'].length > 12 ? item['title'].slice(0, 12)+'……' : item['title'];
              });
                  this.setState({
                    findSerTopInfoList:result,
                    pagination:Object.assign(this.state.pagination,{total:result['total']})
                  })
            })
         }
    })
  }
  /**
   * 选择发布时间时触发
   */
  onPublishDateChange = (dateAsMoment, dateAsStr) => {
    this.setState({
      params: { ...this.state.params, ...{ publistDate: dateAsMoment } }
    }, () => {
      console.log('onPublishDateChange.params====', this.state.params)
    })
  }

  
  query() {
    Http.post('findSerTopInfoList',this.state.formValue,result=>{
      result.rows.forEach((item,index) => {
        let time={
           times:moment(item['pubDate']).format('YYYY-MM-DD HH:mm:ss'),
           times1:moment(item['topDate']).format('YYYY-MM-DD HH:mm:ss'),
           key:index
        }
        result.rows[index]=Object.assign(result.rows[index],time)
        item['title'] = item['title'] && item['title'].length > 12 ? item['title'].slice(0, 12)+'……' : item['title'];
      });
           this.setState({
            findSerTopInfoList:result,
            pagination:Object.assign(this.state.pagination,{total:result['total']})
           })
    })
    // const code={
    //   businessId: 1004,
    //   businessType: 0,
    // }
    // Http.post('findSerTopInfoList', code, result => {
      
    //       })

  }
}
const OpenWithForm = Form.create()(Open);


export default OpenWithForm;
