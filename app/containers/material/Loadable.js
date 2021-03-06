/**
 * news.editManu
 */
import Loadable from 'react-loadable';

import LoadingIndicator from 'components/LoadingIndicator';

export default Loadable({
  loader: () => import('./news.material'),
  loading: LoadingIndicator,
});
