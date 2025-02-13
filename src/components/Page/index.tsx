import React, { useEffect } from 'react';
import Styles from './style.scss';
import classNames from 'classnames';
import { getWxConfig, type WxApiList } from '@src/utils/wxConfig';
import globalStore from '@src/stores/GlobalStore';

interface PageProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  jsApiList?: WxApiList;
}

/**
 * 页面组件
 * @param {React.ReactNode} children - 页面内容
 * @param {string} title - 页面标题
 * @param {string} className - 页面类名
 * @returns {React.ReactNode} 页面组件
 *
 */
const Page = ({ children, title, className, jsApiList }: PageProps) => {
  // 使用globalStore().isWx获取状态
  // zustand的useStore hook会自动订阅状态更新
  // 当isWx状态变化时会自动触发组件重新渲染
  const { isWx } = globalStore();

  useEffect(() => {
    document.title = title || '';
    if (isWx) {
      getWxConfig(jsApiList);
    }
  }, [title, isWx, jsApiList]);

  return <div className={classNames(Styles.page, className)}>{children}</div>;
};

export default Page;
