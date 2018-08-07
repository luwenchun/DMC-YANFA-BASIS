/**
 * 
 */
import Loadable from 'react-loadable';

import LoadingIndicator from 'components/LoadingIndicator';

export default Loadable({
  loader: () => import('./activity'),
  loading: LoadingIndicator,
});
