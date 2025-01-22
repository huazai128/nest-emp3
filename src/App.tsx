import './App.css';
import React, { useLayoutEffect } from 'react';
const App = () => {
  // const wechatLoginUrl = window.INIT_DATA?.wechatLoginUrl;
  const openId = window.INIT_DATA?.openId;
  useLayoutEffect(() => {
    if (openId) {
      new WxLogin({
        self_redirect: true,
        id: 'loginContainer',
        appid: openId,
        scope: 'snsapi_login',
        redirect_uri: '',
        state: 'wxLogin',
        style: '',
        href: '',
        fast_login: 1,
      });
    }
  }, [openId]);

  return (
    <div className="content">
      <h1>EMP with React</h1>
      <p>Start building wonderful things with EMP撒大声地.</p>
      <div className="wx-login">
        <p>请使用微信扫码登录</p>
        <div id="loginContainer" className="loginBody"></div>
      </div>
    </div>
  );
};

export default App;
