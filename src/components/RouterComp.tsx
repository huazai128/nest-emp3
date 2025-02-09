import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

interface RouteItem {
  path: string;
  element: React.LazyExoticComponent<any>;
}

interface RouterCompProps {
  routes: RouteItem[];
}
/**
 * 路由组件
 *
 * 使用示例:
 * ```tsx
 * import { lazy } from 'react';
 * import RouterComp from '@/components/RouterComp';
 *
 * const routes = [
 *   {
 *     path: '/',
 *     element: lazy(() => import('@/pages/home'))
 *   },
 *   {
 *     path: '/about',
 *     element: lazy(() => import('@/pages/about'))
 *   }
 * ];
 *
 * function App() {
 *   return <RouterComp routes={routes} />;
 * }
 * ```
 */
const RouterComp: React.FC<RouterCompProps> = ({ routes }) => {
  return (
    <BrowserRouter>
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <Suspense fallback={<div>加载中...</div>}>
                <route.element />
              </Suspense>
            }
          />
        ))}
      </Routes>
    </BrowserRouter>
  );
};

export default RouterComp;
