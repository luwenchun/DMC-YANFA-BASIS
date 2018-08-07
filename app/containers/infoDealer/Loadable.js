/**
 * 销售店资讯列表
 */
import Loadable from 'react-loadable';

import LoadingIndicator from 'components/LoadingIndicator';

export default Loadable({
  loader: () => import('./info.dealer'),
  loading: LoadingIndicator,
});
