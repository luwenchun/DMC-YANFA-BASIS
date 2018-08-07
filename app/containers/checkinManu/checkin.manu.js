/**
 *签到管理-经销商
 */

import React from 'react';
import Http from '../../utils/http';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import DealerTree from '../../components/common/dealerTree';
import {SERVER_BASE_PATH} from '../../global.config';
import DMCUtil from '../../utils/DMCUtil'
import './style/checkin.scss';
import { Form, Switch, Row, Col, Input, Select, Button, Table, Icon, Divider, message, Modal, DatePicker, } from 'antd';
import DelearEdit from './components/DelearEdit'
const { Column, ColumnGroup } = Table;
const { TextArea } = Input;
const FormItem = Form.Item;
const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;


const title = '签到管理-厂商';

const apis = [
  {"id":"findSignRulePage","url":"sign/signRule/web/findSignRulePage"},
  { "id": "getCouponList", "url": "community/activity/getCouponList" },
  {"id":"addOrUpdateSignRule","url":"sign/signRule/web/addOrUpdateSignRule","format":false},
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
  "dealerCode": null,
  "limit": 10,
  "orderName": null,
  "orderType": null,
  "page": 1,
}
let pageStartIndex = 1
let pageSize = 10

class CheckinWithManu extends React.Component {
  constructor(props) {
      super(props);
      // const Authorization = props.currentAuthorization
      // Http.setRequestHeader(Authorization)
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
        
        ],
        dataList:[],
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
        loading: false,
      }

  
    };


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
  
    

    onSelectChange = (selectedRowKeys) => {
      console.log('selectedRowKeys changed: ', selectedRowKeys);
      this.setState({ selectedRowKeys });
    }


    setFormFieldValues = (formFieldValues = {}) => {
      this.setState({formFieldValues:{...updateDto,...formFieldValues}})
    }

    /**
   * 销售店选择时触发
   */
  onDealerCodeChange = (v) => {
    this.setState({
      formFieldValues: { ...this.state.formFieldValues, ...{ dealerCode: v['value'] } }
    }, () => {
      console.log('onDealerCodeChange====', this.state.formFieldValues)
    })
  }



 
  render() {
    const { onDealerCodeChange } =  this
    const { getFieldDecorator } = this.props.form;
    const { selectedRowKeys,columns,formFieldValues } = this.state;

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      hideDefaultSelections: true,
      onSelection: this.onSelection,
    }

      return (
        <div className={'wrap'} style={{'padding':'5px'}}>
          <Form layout={'inline'} className={'ant-search-form'}>
              <Row gutter={24}>
            
                <Col span={10}>

                  <FormItem style={{width:'100%'}}
                    {...{
                      labelCol: {
                        xs: { span: 24 },
                        md: {span: 4},
                        sm: { span: 4 },
                      },
                      wrapperCol: {
                        xs: { span: 24 },
                        md: {span: 14 },
                        sm: { span: 20 },
                      },
                    }}
                    label="销售店"
                  >
                      <DealerTree value={formFieldValues.dealerCode} selected={onDealerCodeChange.bind(this)} />

                  </FormItem>

                </Col>

               

                <Col span={3} offset={11}>
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


        </div>
      );
    };
 
}
const OpenWithForm = Form.create()(CheckinWithManu);

// const CheckinWithManuFormComp=withStyles(s)(CheckinWithManuForm);

// function action({ path, query, hash, Authorization }) {

//   const currentAuthorization = DMCUtil.getCurrent(Authorization)
//   return {
//     chunks: ['checkin.manu'],
//     title,
//     component: (
//       <Layout hide={true}>
//         <CheckinWithManuFormComp currentAuthorization={currentAuthorization} />
//       </Layout>
//     ),
//   };
// }

export default OpenWithForm;
