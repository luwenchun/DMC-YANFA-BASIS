
import React from 'react';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { Switch, Route } from 'react-router-dom';
import HomePage from 'containers/HomePage/Loadable';
import FeaturePage from 'containers/FeaturePage/Loadable';
import NotFoundPage from 'containers/NotFoundPage/Loadable';
import TagPage from 'containers/tag/Loadable';
import Keyword from 'containers/keyword/Loadable';
import Keywordxsd from 'containers/keywordxsd/Loadable';
import Verify from 'containers/verify/Loadable';
import VerifyNews from 'containers/verifyNews/Loadable';
import VerifyActivity from 'containers/verifyActivity/Loadable';
import VerifyReport from 'containers/VerifyReport/Loadable';
import VerifyTrends from 'containers/VerifyTrends/Loadable';
import VerifyComment from 'containers/VerifyComments/Loadable';
import VerifyThroughtopic from 'containers/VerifyThroughtopic/Loadable';
import VerifyThroughment from 'containers/VerifyThroughment/Loadable';
import VerifyThrough from 'containers/VerifyThrough/Loadable';
import EnergyConf from 'containers/energyConf/Loadable';
import EnergyDealer from 'containers/energyDealer/Loadable';
import EnergyManu from 'containers/energyManu/Loadable';
import DynamicEditDealer from 'containers/dynamicEditDealer/Loadable';
import DynamicEditManu from 'containers/dynamicEditManu/Loadable';
import NoteDealer from 'containers/noteDealer/Loadable';
import NoteManu from 'containers/noteManu/Loadable';
import TopicEditDealer from 'containers/topicEditDealer/Loadable';
import TopicEditManu from 'containers/topicEditManu/Loadable';
import Stick from 'containers/stick/Loadable';
import InfoDealer from 'containers/infoDealer/Loadable';
import InfoManu from 'containers/infoManu/Loadable';
import ActEditDealer from 'containers/actEditDealer/Loadable';
import ActEditManu from 'containers/actEditManu/Loadable';
import ActDetailEditManu from 'containers/actDetailEditManu/Loadable';
import ActDetailEditDealer from 'containers/actDetailEditDealer/Loadable';
import NewsEditDealer from 'containers/newsEditDealer/Loadable';
import NewsEditManu from 'containers/newsEditManu/Loadable';
import NewsDetailEditDealer from 'containers/newsDetailEditDealer/Loadable';
import NewsDetailEditManu from 'containers/newsDetailEditManu/Loadable';
import CheckInDealer from 'containers/checkinDealer/Loadable';
import CheckInManu from 'containers/checkinManu/Loadable';
import Header from 'components/Header';
import Footer from 'components/Footer';
import Sidebar from 'components/Sidebar';
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

// const visible = location.host === 'localhost:3000';
const visible = false;

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
        {/* <Header /> */}
        {visible
          ? <Sidebar history={this.props.history} />
          : ""}

        <Switch>
          <Route exact path="/" component={HomePage} />
          {/* 资讯标签 */}
          <Route path="/saicui/tag" component={TagPage} />
          {/* 关键字 */}
          <Route path="/saicui/keyword" component={Keyword} />
          <Route path="/saicui/keywordxsd" component={Keywordxsd} />
          <Route path="/saicui/verify/through" component={VerifyThrough} />
          <Route path="/saicui/verify/throughment" component={VerifyThroughment} />
          <Route path="/saicui/verify/throughtopic" component={VerifyThroughtopic} />
          <Route path="/saicui/verify/comments" component={VerifyComment} />
          <Route path="/saicui/verify/trends" component={VerifyTrends} />
          <Route path="/saicui/verify/report" component={VerifyReport} />
          <Route path="/saicui/verify/activity" component={VerifyActivity} />
          <Route path="/saicui/verify/news" component={VerifyNews} />
          {/* 审核 */}
          <Route path="/saicui/verify" component={Verify} />
          <Route path="/saicui/energyConf" component={EnergyConf} />
          <Route path="/saicui/energyDealer" component={EnergyDealer} />
          <Route path="/saicui/energyManu" component={EnergyManu} />
          <Route path="/saicui/dynamic/editDealer" component={DynamicEditDealer} />
          <Route path="/saicui/dynamic/editManu" component={DynamicEditManu} />
          {/* 查看话题动态 */}
          <Route path="/saicui/noteDealer" component={NoteDealer} />
          <Route path="/saicui/noteManu" component={NoteManu} />
          {/* 发布话题 */}
          <Route path="/saicui/topic/editDealer" component={TopicEditDealer} />
          <Route path="/saicui/topic/editManu" component={TopicEditManu} />
          <Route path="/saicui/stick" component={Stick} />
          {/* 查看新闻资讯 */}
          <Route path="/saicui/infoDealer" component={InfoDealer} />
          <Route path="/saicui/infoManu" component={InfoManu} />
          {/* 发布动态 */}
          <Route path="/saicui/act/editDealer" component={ActEditDealer} />
          <Route path="/saicui/act/editManu" component={ActEditManu} />
          <Route path="/saicui/act/detailEditManu" component={ActDetailEditManu} />
          <Route path="/saicui/act/detailEditDealer" component={ActDetailEditDealer} />
          {/* 发布新闻 */}
          <Route path="/saicui/news/editDealer" component={NewsEditDealer} />
          <Route path="/saicui/news/editManu" component={NewsEditManu} />
          <Route path="/saicui/news/detailEditDealer" component={NewsDetailEditDealer} />
          <Route path="/saicui/news/detailEditManu" component={NewsDetailEditManu} />
          {/* 签到管理 */}
          <Route path="/saicui/checkinDealer" component={CheckInDealer} />
          <Route path="/saicui/checkinManu" component={CheckInManu} />
          <Route path="" component={NotFoundPage} />
        </Switch>

        {/* <Footer /> */}
      </AppWrapper>
    );
  // }
}
