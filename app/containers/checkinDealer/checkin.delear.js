/**
 *签到管理-经销商
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import Http from '../../utils/http';
import PropTypes from 'prop-types';
import DMCUtil from '../../utils/DMCUtil';
import {SERVER_BASE_PATH} from '../../global.config';
import './style/checkin.scss';
import { Form, Switch, Row, Col, Input, Select, Button, Table, Icon, Divider, message, Modal, DatePicker,Popconfirm } from 'antd';
import DelearEdit from './components/DelearEdit'
const { Column, ColumnGroup } = Table;
const { TextArea } = Input;
const FormItem = Form.Item;
const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;


const title = '签到管理-经销商';

const apis = [
  {"id":"findSignRulePage","url":"sign/signRule/web/findSignRulePage"},
  { "id": "getCouponList", "url": "community/activity/getCouponList" },
  {"id":"addOrUpdateSignRule","url":"sign/signRule/web/addOrUpdateSignRule","format":false},
  {"id":"delSignRuleById","url":"sign/signRule/web/delSignRuleById","format":false},
];

const Authorization = DMCUtil.getJWTFromCookie();
Http.setDomainUrl(SERVER_BASE_PATH);

Http.setMutiApi(apis);
Http.setRequestHeader(Authorization)

let updateDto = {
    "id": null,
    "batchNo": "",
    "endDate": "",
    "energy": 0,
    "days":"",
    "signDays": 0,
    "signType": 0,
    "startDate": ""
  
};

let queryDto = {
  "startDate": null,
  "endDate": null,
  "limit": 10,
  "orderName": null,
  "orderType": null,
  "page": 1,
  "couponStatus": null,
  "isSendCoupon": null,
}

let pageStartIndex = 1
let pageSize = 10
class CheckinWithDelear extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        columns:[
          {
            title: '序号',
            width: 120,
            dataIndex: 'id',
            key: 'id',
            fixed: 'left',
            render: (text, record, index) =>{
              return (
                <span>{(pageStartIndex-1)*pageSize+index+1}</span>
              )
            }
          },
          {
            title: '活动时间',
            width: 260,
            key: 'activityDate',
            dataIndex: 'activityDate',
            fixed: 'left',
          }, 
          {
            title: '销售店',
            dataIndex: 'dealerName',
            width: 200,
            key: 'dealerName',
          }, 
          {
            title: '签到方式',
            dataIndex: 'days',
            width: 120,
            key: 'days',
          }, 
          {
            title: '获得丰云能量',
            dataIndex: 'energy',
            width: 120,
            key: 'energy',
          }, 
          {
            title: '是否发放优惠券',
            dataIndex: 'isSendCoupon',
            width: 120,
            key: 'isSendCoupon',
          }, 
          {
            title: '优惠券名称',
            dataIndex: 'couponName',
            width: 180,
            key: 'couponName',
          }, 
          {
            title: '优惠券类型',
            dataIndex: 'couponType',
            width: 120,
            key: 'couponType',
          }, 
          {
            title: '优惠券状态',
            dataIndex: 'couponStatus',
            width: 120,
            key: 'couponStatus',
          }, 
          {
            title: '活动状态',
            dataIndex: 'status',
            width: 120,
            key: 'status',
          }, 
          {
            title: '操作',
            key: 'operation',
            width: 140,
            fixed: 'right',
        
            render: (text, record) => {
              let isUsed = record['activityStatus'] === 1002
              return (
              
              <span>
                  {isUsed?<Popconfirm title="确定删除吗？" okText="是" cancelText="否" onConfirm={this.handleDelete.bind(this,record)}><a href="javascript:void(0)" style={{'marginLeft':'5px'}}>删除</a></Popconfirm>:<a href="javascript:void(0)" onClick={this.handleEdit.bind(this,record)}>编辑</a>}
              </span>
            )},
          },
        ],
        dataList:[],
        modalTitle:'编辑',
        pagination:{
          size:'small',
          showSizeChanger:true,
          onShowSizeChange:(current,size)=>{

          },

        },
        formFieldValues:{
          startDate:null,
          endDate:null,
          couponStatus:null,
          isSendCoupon:null,
        },
        selectedRowKeys: [],
        modalVisible: false,
        loading: false,
      }

      this.onActivityDateChange = this.onActivityDateChange.bind(this);
  
    };


    onActivityDateChange = (dateAsMoment, dateAsStr) => {
      const newState = { startDate: dateAsStr[0], endDate: dateAsStr[1] };
      this.setState({
        formFieldValues: { ...this.state.formFieldValues, ...newState }
      }, () => {
        console.log('onActivityDateChange.formFieldValues====', this.state.formFieldValues)
      })
    }

    onInputChange = (field, event, obj) => {
      let isSelectTarget = false;

      if(!event){
        isSelectTarget = true
      }else{
        isSelectTarget = !Object.hasOwnProperty.call(event, 'target')
      }
      
      const value = isSelectTarget ? event : event.target.value
      const tempState = {}
      
      tempState[field] = value
  
  
      this.setState({
        formFieldValues: { ...this.state.formFieldValues, ...tempState }
      }, () => {
        console.log('onInputChange.formFieldValues=====', this.state.formFieldValues)
      })
  
  
  
    }

/**
 * 新增／更新签到🌤
 */
 updateCheckin = (currentItem={},fnCallback,isShowMessage=true) => {

  Http.post('addOrUpdateSignRule',currentItem,(callback)=>{
    console.log('updatecallback---->',callback)
    if(callback['success']){
      if(isShowMessage) message.success('操作成功')
      fnCallback&&fnCallback()
    }else{
      message.error(`${callback['errMsg']}，请重试！`)
    }
    
  })
}
    

    /**
     * 👌获取签到列表
     */
     getDataList = (params = {}) => {
        console.log('params::',params);
        
        this.setState({loading:true});

        Http.get('findSignRulePage',params,callback=>{
          const pagination = { ...this.state.pagination };
          pagination.total = callback['total']||0;
          pagination.pageSize = params['limit'];
          this.setState({
            loading: false,
            dataList: callback['rows'],
            pagination
          })

        })


     }



    handleTableChange = (pagination, filters, sorter) => {
      
      const pager = { ...this.state.pagination,...pagination };
      const copyQueryDto = {...{},...queryDto}
      pager.current = pagination.current;

      copyQueryDto['limit'] = pager.pageSize;
      copyQueryDto['page'] = pager.current;
      pageStartIndex = pager.current
      pageSize = pager.pageSize
      console.log(pager)
      
      this.setState({
        pagination: pager,
      });


      this.props.form.validateFields((err, values) => {
        console.log('查询条件: ', values);
        this.getDataList({...copyQueryDto,...values});
      });

      

    }


    componentDidMount() {
      this.updateCheckin({},this.getDataList,false)
      

    }

    handleSearch = (e) => {
      e.preventDefault();
      this.getDataList({...queryDto,...this.state.formFieldValues});
    }
  
    handleReset = () => {
      this.props.form.resetFields();
      this.getDataList(queryDto);
    }


    onSelectChange = (selectedRowKeys) => {
      console.log('selectedRowKeys changed: ', selectedRowKeys);
      this.setState({ selectedRowKeys });
    }

    modalVisible = (modalVisible) => {
      this.setState({modalVisible})
    }


    setModalTitle = (modalTitle) => {
      this.setState({modalTitle})
    }

    setFormFieldValues = (formFieldValues = {}) => {
      this.setState({formFieldValues:{...updateDto,...formFieldValues}})
    }


    handleEdit = (currentItem) => {
      console.log('currentItem===',currentItem)
      this.setModalTitle('编辑')
      this.setFormFieldValues(currentItem)
      this.modalVisible(true)
    }


    handleDelete = (currentItem) => {
      Http.get('delSignRuleById',{id:currentItem['id']},(callback)=>{

        if(callback['data']===1){
          message.success('成功删除！')
          this.getDataList()
        }else{
          message.error(`${callback['errMsg']}，请重试！`)
        }

      })
    }

    onSave = (formFieldValues) => {
      console.log(formFieldValues,'----this---',this.state.formFieldValues)
      const { id,energy,batchNo,endDate } = formFieldValues
      this.updateCheckin({ id,energy,batchNo,endDate },this.getDataList);
      this.modalVisible(false)
    }

    onCancel = () => {
      console.log('===cancel===')
      this.modalVisible(false)
    }

 
  render() {
    const { onActivityDateChange,onInputChange } =  this
    const { getFieldDecorator } = this.props.form;
    const { selectedRowKeys,columns,modalTitle,formFieldValues } = this.state;

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      hideDefaultSelections: true,
      onSelection: this.onSelection,
    }

    const rangeConfig = {
      rules: [{ type: 'array', required: false, message: '请选择时间！' }],
    };

      return (
        <div className={'wrap'} style={{'padding':'5px'}}>
          <Form layout={'inline'} className={'ant-search-form'}>
              <Row gutter={24}>
            
                <Col span={7}>

                  <FormItem style={{width:'100%'}}
                    {...{
                      labelCol: {
                        xs: { span: 24 },
                        md: {span: 14},
                        sm: { span: 14 },
                      },
                      wrapperCol: {
                        xs: { span: 24 },
                        md: {span: 10 },
                        sm: { span: 10 },
                      },
                    }}
                    label="是否发放优惠券"
                  >
                    {getFieldDecorator('isSendCoupon', {
                    
                    })(
                      <Select style={{width:'100%'}} onChange={onInputChange.bind(this,'isSendCoupon')} placeholder="请选择">
                        <Option value={null}>全部</Option>
                        <Option value={1001}>是</Option>
                        <Option value={1002}>否</Option>

                      </Select>
                    )}
                  </FormItem>

                </Col>

                <Col span={6}>
                <FormItem style={{width:'100%'}}
                    {...{
                      labelCol: {
                        xs: { span: 24 },
                        md: {span: 12},
                        sm: { span: 12 },
                      },
                      wrapperCol: {
                        xs: { span: 24 },
                        md: {span: 12 },
                        sm: { span: 12 },
                      },
                    }}
                    label="优惠券状态"
                  >
                    {getFieldDecorator('couponStatus', {
      
                    })(
                      <Select placeholder="请选择" onChange={onInputChange.bind(this,'couponStatus')}>
                        <Option value={null}>全部</Option>
                        <Option value={'S0'}>未生成</Option>
                        <Option value={'S1'}>已生成</Option>
                        <Option value={'S2'}>已终止</Option>
                        <Option value={'S3'}>已过期</Option>

                      </Select>
                    )}
                  </FormItem>
                </Col>

                <Col span={8}>
                <FormItem style={{width:'100%'}}
                    {...{
                      labelCol: {
                        xs: { span: 24 },
                        md: {span: 7},
                        sm: { span: 7 },
                      },
                      wrapperCol: {
                        xs: { span: 24 },
                        md: {span: 17 },
                        sm: { span: 17 },
                      },
                    }}
                    label="活动时间"
                  >
                    {getFieldDecorator('range-picker', rangeConfig)(
                      <RangePicker format={'YYYY-MM'} style={{ width: '100%' }} onChange={onActivityDateChange} />
                    )}
                  </FormItem>
                </Col>

                <Col span={3}>
                  <div style={{marginTop:'3px',float:'right'}}>
                    <Button type="primary" htmlType="button" icon="search" onClick={this.handleSearch}>查询</Button>
                  </div>
                </Col>

              </Row>
              
            </Form>

            <Table columns={columns} 
                // rowSelection={rowSelection}
                size="small"
                rowKey={record => record['id']}
                dataSource={this.state.dataList}
                pagination={this.state.pagination}
                loading={this.state.loading}
                onChange={this.handleTableChange}
                scroll={{x:1620}}
                
            />

              <Modal
                title={`${modalTitle+'签到活动'}`}
                wrapClassName="vertical-center-modal"
                visible={this.state.modalVisible}
                footer={null}
                onCancel={() => this.modalVisible(false)}
                >
                <DelearEdit formFieldValues={formFieldValues} onConfirm={this.onSave} onCancel={this.onCancel}/>

              </Modal>

        </div>
      );
    };
 
}
const OpenWithForm = Form.create()(CheckinWithDelear);

export default OpenWithForm;
