// ==UserScript==
// @name         XHR还原+请求日志（油猴版）
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  还原被篡改的XHR方法，记录请求/响应日志，兼容文档分离场景
// @author       You
// @match        https://atoms.dev/chat/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';
  console.log("script loaded")

  function sendToServer(data) {
    GM_xmlhttpRequest({
      method: "POST",
      url: "http://localhost:3000/collect",
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify(data)
    });
  }



  function detectSentryXHRProxy() {
    // 1. 从 iframe 获取【绝对干净】的原生 XHR 方法（不受当前页面污染）
    const getNativeMethod = (method) => {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      // 注意：必须等 DOM 就绪才能 append，所以这里用异步
      return new Promise((resolve) => {
        const runInIframe = () => {
          document.body.appendChild(iframe);
          const native = iframe.contentWindow.XMLHttpRequest.prototype[method];
          document.body.removeChild(iframe);
          resolve(native);
        };
        if (document.body) runInIframe();
        else
          document.addEventListener('DOMContentLoaded', runInIframe);
      });
    };

    // 2. 对比当前页面方法 vs 原生方法的引用
    Promise.all([
      getNativeMethod('open'),
      getNativeMethod('send')
    ]).then(([nativeOpen, nativeSend]) => {
      const currentOpen = XMLHttpRequest.prototype.open;
      const currentSend = XMLHttpRequest.prototype.send;

      const isOpenProxied = currentOpen !== nativeOpen;
      const isSendProxied = currentSend !== nativeSend;
      if (isOpenProxied) {
        console.warn('⚠️ 检测到页面可能被 Sentry 等工具劫持了 XHR open 方法！');
        console.log("尝试还原 open 方法");
        let once = true;
        XMLHttpRequest.prototype.open = function (method, url, ...args) {
          if (once) {
            console.log("还原成功");
            once = false;
          }

          this.addEventListener('load', () => {
            if (url.includes('/api/v1/files')) {
              console.log("请求完成");
              console.log("响应状态:", this.status);
              // blob 类型的响应需要特殊处理
              if (this.responseType === 'blob') {
                console.log("响应是 Blob 类型");
                // 这里可以直接使用 this.response 操作 Blob 对象
                // 例如：this.response.text().then(text => console.log(text));
                this.response.text().then(text => {
                  console.log(text)
                  sendToServer({
                    method: method,
                    url: url,
                    status: this.status,
                    response: text
                  });
                });
              } else {
                console.log("响应文本:", this.responseText);
                sendToServer({
                  method: method,
                  url: url,
                  status: this.status,
                  response: this.responseText
                });
              }
            }
          });

          return nativeOpen.apply(this, arguments);
        };
      }
    });
  }

  detectSentryXHRProxy();
})();