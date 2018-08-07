/**
 * act.detailEditManu
 */
import Loadable from 'react-loadable';

import LoadingIndicator from 'components/LoadingIndicator';

export default Loadable({
  loader: () => import('./act.detailEditManu'),
  loading: LoadingIndicator,
});
