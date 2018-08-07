/**
 *编辑签到-销售店
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Form, Row, Col, Input, Select, Button, Table, Icon, message, InputNumber, } from 'antd';
import Http from '../../../utils/http';
import s from '../style/delear.edit.scss';
const { Column, ColumnGroup } = Table;
const { TextArea } = Input;
const FormItem = Form.Item;
const Option = Select.Option;


const apis = [
    { "id": "getCouponList", "url": "sign/signRule/api/getCouponList" },
  ];
  
  Http.setDomainUrl("/fed/admin/api/");
  
  Http.setMutiApi(apis);

/**
 * 空方法
 */
function noop() {}

const editLayout = {
  labelCol: {
    xs: { span: 24 },
    md: {span: 6},
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    md: {span: 12},
    sm: { span: 12 },
  },
};

//不优雅的暂存编辑时要填充的数据😊
let tempFormFieldValues = {};

class DelearEdit extends React.Component {

    static propTypes = {
        editType:PropTypes.string,
        formFieldValues:PropTypes.object,
        onConfirm:PropTypes.func,
        onCancel:PropTypes.func,
    }

    static defaultProps = {
        formFieldValues: {},
        onConfirm: noop,
        onCancel: noop,
    }

  constructor(props) {
      super(props);
      
      this.state = {
        couponList: [],
        energyLimit:65535,
        formFieldValues:{
            id:null,
            batchLabel:'',
            batchNo:null,
            startDate:null,
            endDate:null,
            days:'',
            energy:0,
            signType:0,
            signDays:0,
        }

      }
      this.onEnergyModifyChange = this.onEnergyModifyChange.bind(this);
  
    };

    componentWillMount(){
        //获取优惠券下拉列表
        Http.get('getCouponList', { dealerCode: '00000', businessType: 1003 }, (callback) => {
            this.setState({ couponList: callback })
            console.log('couponList--->', callback)
        })

    }

    componentWillReceiveProps(nextProps) {
        

    }

    componentDidMount() {
        
    }

    
  /**
   * 能量输入框
   */
  onEnergyModifyChange = (limitNum, event) => {
    console.log('limitNum===', limitNum, 'event====', event)
    const targetVal = event
    let isNumber = typeof targetVal ==='number'&& isFinite(targetVal)
    if(!isNumber) return

    const currentVal = targetVal >= limitNum ? limitNum : targetVal
    const tempState = { energy: currentVal }

    this.setState({
      formFieldValues: { ...this.state.formFieldValues, ...tempState }
    }, () => {
      console.log('onEnergyModifyChange.formFieldValues=====', this.state.formFieldValues)
    })
  }

  onCouponChange = (event) => {

    const selectedAsObj = this.state['couponList'].filter((item, index) => {
      return item['value'] === event
    })[0]
    console.log(selectedAsObj);

    const tempState = {
      batchLabel: event ==undefined?null:selectedAsObj['label'],
      batchNo: event ==undefined?null:selectedAsObj['value'],
    }

    this.setState({
      formFieldValues: { ...this.state.formFieldValues, ...tempState }
    }, () => {
      console.log('onCouponChange.formFieldValues=====', this.state.formFieldValues)
    })

  }

    onConfirm = () => {
        const { props, state } = this
        const { getFieldsValue,validateFieldsAndScroll } = props.form
        const currentFieldValues = getFieldsValue()
        validateFieldsAndScroll((errors,values) => {
            if(errors){
                console.log('===errors===',errors,'==values==',values)
                return
            }
            props.onConfirm({...tempFormFieldValues,...currentFieldValues})
            //props.onConfirm(currentFieldValues)
            //resetFields()
            
        })
        
        

    }

    onCancel = () => {
        const { props } = this
        props.onCancel();
    }

 
  render() {
    const { props,state,onEnergyModifyChange,onCouponChange } = this
    const { energyLimit,couponList } = state
    const { getFieldDecorator } = props.form
    tempFormFieldValues = {...{},...props.formFieldValues}
    

    
    
      return (
        <div className={s['wrap']} style={{'padding':'5px'}}>
          <Form>

            <FormItem
                {...editLayout}
                label="活动时间"
                >
                    <span>{`${tempFormFieldValues['startDate']}至${tempFormFieldValues['endDate']}`}</span>
            </FormItem>
            <FormItem
                {...editLayout}
                label="签到方式"
                >
                    <span>{tempFormFieldValues['days']}</span>
            </FormItem>

            <FormItem
                {...editLayout}
                label="获取丰云能量"
                >
                {getFieldDecorator('energy', { initialValue: 0,rules: [
                    { required: true, message: '请输入能量值' },
                    ], })(
                    <InputNumber style={{width:'100%'}} onChange={onEnergyModifyChange.bind(this, energyLimit)} min={0} max={energyLimit === 0 ? 0 : energyLimit} />
                )}
                </FormItem>

            <FormItem
                {...editLayout}
                label="优惠券"
                >
                {getFieldDecorator('batchNo', {
                    rules: [
                    { required: false, message: '请选择优惠券' },
                    ],
                })(
                    <Select placeholder="请选择优惠券" onChange={onCouponChange.bind(this)} allowClear>
                    {
                        couponList.map((item, index) => {
                            return (<Option value={item['value']} key={index}>{item['label']}</Option>)
                        })
                    }
                    </Select>
                )}
                </FormItem>

                

            </Form>
            <hr className={s['line']} />
            <div className={s['toolbar']}>
                <Button type="default" onClick={this.onCancel}>取消</Button>
                <Button type="primary" style={{marginLeft:'8px'}} htmlType="submit" onClick={this.onConfirm}>确认</Button>
            </div>
        </div>
      );
    };
 
}

/**
 * init初始化form表单😭
 */
const DelearEditWithForm = Form.create({
    mapPropsToFields(props) {

        return (() => {
            let fields = {}
            let {formFieldValues} = props
            for(let field in formFieldValues){
                fields[field] = Form.createFormField({
                    value: formFieldValues[field]
                })
            }

            return fields
        })()
        
      },
})(DelearEdit);

export default withStyles(s)(DelearEditWithForm);

