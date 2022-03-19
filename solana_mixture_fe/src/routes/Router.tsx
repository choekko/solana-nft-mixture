import { Outlet, useRoutes } from 'react-router-dom';
import Main from '../pages/Main';
import Layout from '../components/Layout';
import Purchase from '../pages/Purchase';
import Log from '../pages/Log';
import Compose from '../pages/Compose';
import Decompose from 'pages/Decompose';
import Contact from 'pages/Contact';

const Router = () => {
  return useRoutes([
    {
      path: '/',
      element: (
        <Layout>
          <Outlet />
        </Layout>
      ),
      children: [
        { path: '', element: <Main /> },
        { path: 'purchase', element: <Purchase /> },
        { path: 'compose', element: <Compose /> },
        { path: 'decompose', element: <Decompose /> },
        { path: 'log', element: <Log /> },
        { path: 'contact', element: <Contact /> },
      ],
    },
  ]);
};

export default Router;
