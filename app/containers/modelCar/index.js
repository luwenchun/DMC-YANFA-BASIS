
import React from 'react';
import { Helmet } from 'react-helmet';
import './style/index.scss';

const title = '钣金喷漆';

var startX, startY;


class ModelCar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visual: {
                bcg: [
                    require('./images/A_0.png'),
                    require('./images/A_1.png'),
                    require('./images/A_2.png'),
                    require('./images/A_3.png'),
                ],
                parts: [],
                curIndex: 0,
            }

        }
    };


    touchStart = (e) => {
        e.preventDefault();
        startX = e.changedTouches[0].pageX;
        startY = e.changedTouches[0].pageY;
    }

    slide = (e) => {
        e.preventDefault();
        const moveEndX = e.changedTouches[0].pageX;
        const moveEndY = e.changedTouches[0].pageY;
        const X = moveEndX - startX;
        const Y = moveEndY - startY;

        if (Math.abs(X) > Math.abs(Y) && (X < -120)) {   // 向右滑动
            const { visual } = { ...this.state };
            visual.curIndex = ++visual.curIndex > 3 ? 0 : visual.curIndex;
            this.setState({ visual });
        }
        else if (Math.abs(X) > Math.abs(Y) && (X > 120)) {       // 向左滑动
            const { visual } = { ...this.state };
            visual.curIndex = --visual.curIndex < 0 ? 3 : visual.curIndex;
            this.setState({ visual });
        }

    }

    render() {
        const { visual } = { ...this.state }
        return (
            <div className='model_car'>
                <Helmet>
                    <title>{title}</title>
                    <meta name="description" content={title} />
                </Helmet>
                <div className='MC_tit'
                    onTouchStart={this.touchStart}
                    onTouchEnd={this.slide}>
                    {/* onTouchMove={this.slide}> */}

                    {visual.bcg.map((item, index) => (
                        <div
                            key={index}
                            className='MC_pagination'
                            style={{
                                display: visual.curIndex === index ? 'block' : 'none',
                                backgroundImage: "URL(" + item + ")"
                            }}>

                            
                        </div>
                    ))}
                </div>
                <div className='MC_cont'></div>
                <div id='inp'></div>
            </div>
        );
    };

}

//获得角度
function getAngle(angx, angy) {
    return Math.atan2(angy, angx) * 180 / Math.PI;
};

//根据起点终点返回方向 1向上 2向下 3向左 4向右 0未滑动
function getDirection(startx, starty, endx, endy) {
    var angx = endx - startx;
    var angy = endy - starty;
    var result = 0;

    //如果滑动距离太短
    if (Math.abs(angx) < 2 && Math.abs(angy) < 2) {
        return result;
    }

    var angle = getAngle(angx, angy);
    if (angle >= -135 && angle <= -45) {
        result = 1;
    } else if (angle > 45 && angle < 135) {
        result = 2;
    } else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
        result = 3;
    } else if (angle >= -45 && angle <= 45) {
        result = 4;
    }

    return result;
}


export default ModelCar;

