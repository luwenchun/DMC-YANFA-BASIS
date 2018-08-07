
import React from 'react';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { Switch, Route } from 'react-router-dom';
import HomePage from 'containers/HomePage/Loadable';
import NotFoundPage from 'containers/NotFoundPage/Loadable';
// import FeaturePage from 'containers/FeaturePage/Loadable';
// import TagPage from 'containers/tag/Loadable';
// import News from 'containers/news/Loadable';
// import Material from 'containers/material/Loadable';
// import MaterialList from 'containers/materialList/Loadable';
// import MassTexting from 'containers/massTexting/Loadable';
// import Header from 'components/Header';
// import Footer from 'components/Footer';
// import Sidebar from 'components/Sidebar';
import SalesOrder from 'containers/salesOrder/Loadable';
import ModelCar from 'containers/modelCar/index';
const AppWrapper = styled.div`
  // max-width: calc(768px + 16px * 2);
  margin: 0 auto;
  width: 100%;
  display: flex;
  min-height: 100%;
  // padding: 0 16px;
  flex-direction: column;
  >div:nth-of-type(2){ margin-left: 240px;}
`;


export default function App() {
  // export default class App extends React.Component {
  // render() {
  return (
    // <AppWrapper history={this.props.history}>
    <AppWrapper>
      <Helmet
        titleTemplate="%s - 社区后台"
        defaultTitle="社区后台"
      >
        <meta name="description" content="社区后台" />
      </Helmet>

      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route path="/gtmc/modelCar" component={ModelCar} />
        {/* 资讯标签 */}
        {/* <Route path="/dearccpc/tag" component={TagPage} />
        <Route path="/dearccpc/news" component={News} />
        <Route path="/dearccpc/materiallist" component={MaterialList} />
        <Route path="/dearccpc/material" component={Material} />
        <Route path="/dearccpc/massTexting" component={MassTexting} /> */}

        {/* 销售订单管理*/}
        <Route path="/dearccpc/salesOrder" component={SalesOrder} />
        <Route path="" component={NotFoundPage} />
      </Switch>

      {/* <Footer /> */}
    </AppWrapper>
  );
  // }
}

