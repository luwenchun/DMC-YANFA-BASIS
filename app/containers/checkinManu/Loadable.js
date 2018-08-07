/**
 * tag.index
 */
import Loadable from 'react-loadable';

import LoadingIndicator from 'components/LoadingIndicator';

export default Loadable({
  loader: () => import('./checkin.manu'),
  loading: LoadingIndicator,
});
