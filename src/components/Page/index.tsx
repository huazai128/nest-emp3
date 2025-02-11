import React, { useEffect } from 'react';
import Styles from './style.scss';
import classNames from 'classnames';
import { getWxConfig } from '@src/utils/wxConfig';

interface PageProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

/**
 * 页面组件
 * @param {React.ReactNode} children - 页面内容
 * @param {string} title - 页面标题
 * @param {string} className - 页面类名
 * @returns {React.ReactNode} 页面组件
 *
 */
const Page = ({ children, title, className }: PageProps) => {
  useEffect(() => {
    document.title = title || '';
    getWxConfig();
  }, [title]);
  return <div className={classNames(Styles.page, className)}>{children}</div>;
};

export default Page;
