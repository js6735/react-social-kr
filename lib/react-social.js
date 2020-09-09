import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';

function factory() {
  const isBrowser = () => {
    return !(typeof document === 'undefined' || typeof window === 'undefined');
  };
  // const isMobile = () => {
  //   return (navigator.userAgent.match('CriOS') || navigator.userAgent.match(/mobile/i));
  // };

  const getLocation = (pathname) => {
    if (isBrowser()) {
      const path = window.location.protocol + '//' + (window.location.host || window.location.hostname) + pathname;
      return path;
    }
    return '';
  };

  const spread = (obj, omit) => {
    const clone = Object.assign({}, obj);

    omit.forEach((key) => {
      delete clone[key];
    });

    return clone;
  };

  const jsonp = (url, cb) => {
    let called = false;
    const now = new Date();
    const id = now + '_' + Math.floor(Math.random() * 1000);

    const script = document.createElement('script');
    const callback = 'jsonp_' + id;
    const query = url.replace('@', callback);

    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', query);
    document.body.appendChild(script);

    setTimeout(() => {
      if (!called) {
        called = true;
        if (typeof cb === 'function') cb(new Error('jsonp timeout'));
      }
    }, 10000);

    window[callback] = () => {
      const args = Array.prototype.slice.call(arguments, 0);
      args.unshift(null);
      if (!called) {
        called = true;
        if (typeof cb === 'function') cb.apply(this, args);
      }
    };
  };


  /* Caputre VKontake callbacks */
  const vkCallbacks = {};

  const hookVKCallback = () => {
    if (!isBrowser()) { return true; }

    if (!window.VK) {
      window.VK = {};
    }

    if (!window.VK.Share) {
      window.VK.Share = {};
    }

    const oldCount = window.VK.Share.count;

    window.VK.Share.count = (index, count) => {
      if (typeof vkCallbacks[index] === 'function') {
        return vkCallbacks[index](count);
      }

      if (typeof oldCount === 'function') {
        oldCount(index, count);
      }
    };
  };

  const captureVKCallback = (index, cb) => {
    vkCallbacks[index] = cb;
  };

  hookVKCallback();

  const exports = {};

  const Count = {
    displayName: 'Count',
    propTypes: {
      element: PropTypes.string,
      pathname: PropTypes.string,
      getLocation: PropTypes.func,
      token: PropTypes.string
    },
    getDefaultProps: function getDefaultProps() {
      return {
        element: 'span',
        pathname: '',
        getLocation,
        onCount: () => { },
        token: ''
      };
    },
    getInitialState: function getInitialState() {
      return {
        count: 0
      };
    },
    componentDidMount: function componentDidMount() {
      this.updateCount();
    },
    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
      if (this.props.getLocation(this.props.pathname) !== nextProps.url) {
        this.setState({
          count: 0
        }, () => {
          this.updateCount();
        });
      }
    },
    componentDidUpdate: function componentDidUpdate() {
      this.props.onCount(this.state.count);
    },
    updateCount: function updateCount() {
      if (!isBrowser()) {
        return true;
      }

      if (typeof this.fetchCount === 'function') {
        return this.fetchCount((count) => {
          this.setState({ count });
        });
      }

      const url = this.constructUrl();

      jsonp(url, (err, data) => {
        if (err) {
          console.warn('react-social: jsonp timeout for url ' + url);
          return this.setState({ count: 0 });
        }

        this.setState({
          count: this.extractCount(data)
        });
      });
    },
    getCount: function getCount() {
      return this.state.count;
    },
    render: function render() {
      return React.createElement(
        this.props.element,
        spread(this.props, ['element', 'pathname', 'getLocation', 'onCount', 'token']),
        this.state.count
      );
    }
  };

  const Button = {
    displayName: 'Button',
    propTypes: {
      element: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func
      ]),
      pathname: PropTypes.string,
      getLocation: PropTypes.func,
      media: PropTypes.string,
      message: PropTypes.string,
      onClick: PropTypes.func,
      target: PropTypes.string,
      windowOptions: PropTypes.array,
      _open: PropTypes.bool,
      sharer: PropTypes.bool
    },
    getDefaultProps: function getDefaultProps() {
      return {
        element: 'a',
        pathname: '',
        getLocation,
        media: '',
        message: '',
        onClick: () => { },
        windowOptions: [],
        _open: true,
        sharer: false
      };
    },
    getInitialState: function getInitialState() {
      return {
        isNotRender: false
      };
    },
    click: function click(evt) {
      const url = this.constructUrl();
      const target = this.props.target;
      const options = this.props.windowOptions.join(',');
      this.props.onClick(evt, url, target);
      if (isBrowser() && url && this.props._open) {
        window.open(url, target, options);
      }
    },
    render: function render() {
      if (this.state.isNotRender) return null;

      const other = spread(this.props, ['onClick', 'element', 'pathname', 'getLocation', '_open', 'message', 'appId', 'sharer', 'media', 'windowOptions', 'jsKey']);

      return React.createElement(
        this.props.element,
        Object.assign({ onClick: this.click }, other)
      );
    }
  };

  const DefaultBlankTarget = {
    getDefaultProps: function getDefaultProps() {
      return { target: '_blank' };
    }
  };

  /* Counts */
  exports.FacebookCount = createReactClass({
    displayName: 'FacebookCount',
    propTypes: {
      pathname: PropTypes.string,
      getLocation: PropTypes.func
    },
    mixins: [Count],
    constructUrl: function constructUrl() {
      let url = '';
      if (!this.props.token) {
        url = 'https://graph.facebook.com/?callback=@&id=' + encodeURIComponent(this.props.getLocation(this.props.pathname));
      } else {
        url = 'https://graph.facebook.com/v2.8/?callback=@&id=' + encodeURIComponent(this.props.getLocation(this.props.pathname)) + '&access_token=' + encodeURIComponent(this.props.token);
      }

      return url;
    },
    extractCount: function extractCount(data) {
      if (!data || !data.share || !data.share.share_count) {
        return 0;
      }

      return data.share.share_count;
    }
  });

  exports.TwitterCount = createReactClass({
    displayName: 'TwitterCount',
    propTypes: {
      pathname: PropTypes.string,
      getLocation: PropTypes.func
    },
    mixins: [Count],
    constructUrl: function constructUrl() {
      return 'https://count.donreach.com/?callback=@&url=' + encodeURIComponent(this.props.getLocation(this.props.pathname)) + '&providers=all';
    },
    extractCount: function extractCount(data) {
      return data.shares.twitter || 0;
    }
  });

  exports.GooglePlusCount = createReactClass({
    displayName: 'GooglePlusCount',
    propTypes: {
      pathname: PropTypes.string,
      getLocation: PropTypes.func
    },
    mixins: [Count],
    constructUrl: function constructUrl() {
      return 'https://count.donreach.com/?callback=@&url=' + encodeURIComponent(this.props.getLocation(this.props.pathname)) + '&providers=google';
    },
    extractCount: function extractCount(data) {
      return data.shares.google || 0;
    }
  });

  exports.PinterestCount = createReactClass({
    displayName: 'PinterestCount',
    propTypes: {
      pathname: PropTypes.string,
      getLocation: PropTypes.func
    },
    mixins: [Count],
    constructUrl: function constructUrl() {
      return 'https://api.pinterest.com/v1/urls/count.json?callback=@&url='
             + encodeURIComponent(this.props.getLocation(this.props.pathname));
    },
    extractCount: function extractCount(data) {
      return data.count || 0;
    }
  });

  exports.LinkedInCount = createReactClass({
    displayName: 'LinkedInCount',
    propTypes: {
      pathname: PropTypes.string,
      getLocation: PropTypes.func
    },
    mixins: [Count],
    constructUrl: function constructUrl() {
      return 'https://www.linkedin.com/countserv/count/share?url=' + encodeURIComponent(this.props.getLocation(this.props.pathname)) + '&callback=@&format=jsonp';
    },
    extractCount: function extractCount(data) {
      return data.count || 0;
    }
  });

  exports.RedditCount = createReactClass({
    displayName: 'RedditCount',
    propTypes: {
      pathname: PropTypes.string,
      getLocation: PropTypes.func
    },
    mixins: [Count],
    constructUrl: function constructUrl() {
      return 'https://www.reddit.com/api/info.json?jsonp=@&url=' + encodeURIComponent(this.props.getLocation(this.props.pathname));
    },
    extractCount: function extractCount(data) {
      let count = 0;
      const chs = data.data.children;

      for (let idx = 0; idx < chs.length; idx++) {
        count += chs[idx].data.score;
      }

      return count;
    }
  });

  exports.VKontakteCount = createReactClass({
    displayName: 'VKontakteCount',
    propTypes: {
      pathname: PropTypes.string,
      getLocation: PropTypes.func
    },
    mixins: [Count],
    fetchCount: function fetchCount(cb) {
      const index = Math.floor(Math.random() * 10000);
      const url = 'https://vkontakte.ru/share.php?act=count&index=' + index + '&url=' + encodeURIComponent(this.props.getLocation(this.props.pathname));
      captureVKCallback(index, cb);
      jsonp(url);
    }
  });

  exports.TumblrCount = createReactClass({
    displayName: 'TumblrCount',
    propTypes: {
      pathname: PropTypes.string,
      getLocation: PropTypes.func
    },
    mixins: [Count],
    constructUrl: function constructUrl() {
      return 'http://api.tumblr.com/v2/share/stats?url='
             + encodeURIComponent(this.props.getLocation(this.props.pathname)) + '&callback=@';
    },
    extractCount: function extractCount(data) {
      return data.response.note_count || 0;
    }
  });

  exports.PocketCount = createReactClass({
    displayName: 'PocketCount',
    propTypes: {
      pathname: PropTypes.string,
      getLocation: PropTypes.func
    },
    mixins: [Count],
    constructUrl: function constructUrl() {
      return 'https://count.donreach.com/?callback=@&url=' + encodeURIComponent(this.props.getLocation(this.props.pathname)) + '&providers=pocket';
    },
    extractCount: function extractCount(data) {
      return data.shares.pocket || 0;
    }
  });

  /* Buttons */
  exports.FacebookButton = createReactClass({
    displayName: 'FacebookButton',
    propTypes: {
      appId: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
      ]).isRequired,
      pathname: PropTypes.string,
      getLocation: PropTypes.func,
      sharer: PropTypes.bool,
      message: PropTypes.string
    },
    mixins: [Button, DefaultBlankTarget],
    constructUrl: function constructUrl() {
      if (this.props.sharer) {
        return 'https://www.facebook.com/dialog/share?'
             + 'app_id=' + encodeURIComponent(this.props.appId)
             + '&display=popup&caption=' + encodeURIComponent(this.props.message)
             + '&href=' + encodeURIComponent(this.props.getLocation(this.props.pathname))
             + '&redirect_uri=' + encodeURIComponent('https://www.facebook.com/');
      }

      return 'https://www.facebook.com/dialog/feed?'
             + 'app_id=' + encodeURIComponent(this.props.appId)
             + '&display=popup&caption=' + encodeURIComponent(this.props.message)
             + '&link=' + encodeURIComponent(this.props.getLocation(this.props.pathname))
             + '&picture=' + encodeURIComponent(this.props.media)
             + '&redirect_uri=' + encodeURIComponent('https://www.facebook.com/');
    }
  });

  exports.TwitterButton = createReactClass({
    displayName: 'TwitterButton',
    propTypes: {
      pathname: PropTypes.string,
      getLocation: PropTypes.func,
      message: PropTypes.string
    },
    mixins: [Button, DefaultBlankTarget],
    constructUrl: function constructUrl() {
      const msg = this.props.message === '' ?
        this.props.getLocation(this.props.pathname) : this.props.message + ' ' + this.props.getLocation(this.props.pathname);
      return 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(msg);
    }
  });

  exports.EmailButton = createReactClass({
    displayName: 'EmailButton',
    propTypes: {
      pathname: PropTypes.string,
      getLocation: PropTypes.func,
      message: PropTypes.string
    },
    mixins: [Button],
    constructUrl: function constructUrl() {
      return 'mailto:?subject=' + encodeURIComponent(this.props.message) + '&body=' + encodeURIComponent(this.props.getLocation(this.props.pathname));
    }
  });

  exports.PinterestButton = createReactClass({
    displayName: 'PinterestButton',
    propTypes: {
      pathname: PropTypes.string,
      getLocation: PropTypes.func,
      media: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired
    },
    mixins: [Button, DefaultBlankTarget],
    constructUrl: function constructUrl() {
      const url = 'https://pinterest.com/pin/create/button/?url='
                + encodeURIComponent(this.props.getLocation(this.props.pathname)) + '&media='
                + encodeURIComponent(this.props.media) + '&description='
                + encodeURIComponent(this.props.message);
      return url;
    }
  });

  exports.VKontakteButton = createReactClass({
    displayName: 'VKontakteButton',
    propTypes: {
      pathname: PropTypes.string,
      getLocation: PropTypes.func
    },
    mixins: [Button, DefaultBlankTarget],
    constructUrl: function constructUrl() {
      return 'http://vk.com/share.php?url=' + encodeURIComponent(this.props.getLocation(this.props.pathname))
        + '&title=' + encodeURIComponent(this.props.title)
        + '&description=' + encodeURIComponent(this.props.message);
    }
  });

  exports.GooglePlusButton = createReactClass({
    displayName: 'GooglePlusButton',
    propTypes: {
      pathname: PropTypes.string,
      getLocation: PropTypes.func
    },
    mixins: [Button, DefaultBlankTarget],
    constructUrl: function constructUrl() {
      return 'https://plus.google.com/share?url=' + encodeURIComponent(this.props.getLocation(this.props.pathname));
    }
  });

  exports.RedditButton = createReactClass({
    displayName: 'RedditButton',
    propTypes: {
      pathname: PropTypes.string,
      getLocation: PropTypes.func
    },
    mixins: [Button, DefaultBlankTarget],
    constructUrl: function constructUrl() {
      return 'https://www.reddit.com/submit?url=' + encodeURIComponent(this.props.getLocation(this.props.pathname))
        + '&title=' + encodeURIComponent(this.props.title);
    }
  });

  exports.LinkedInButton = createReactClass({
    displayName: 'LinkedInButton',
    propTypes: {
      pathname: PropTypes.string,
      getLocation: PropTypes.func
    },
    mixins: [Button, DefaultBlankTarget],
    constructUrl: function constructUrl() {
      return 'https://www.linkedin.com/shareArticle?url=' + encodeURIComponent(this.props.getLocation(this.props.pathname))
        + '&title=' + encodeURIComponent(this.props.title);
    }
  });

  exports.XingButton = createReactClass({
    displayName: 'XingButton',
    propTypes: {
      pathname: PropTypes.string,
      getLocation: PropTypes.func,
      message: PropTypes.string
    },
    mixins: [Button, DefaultBlankTarget],
    constructUrl: function constructUrl() {
      return 'https://www.xing.com/app/user?op=share;url=' + encodeURIComponent(this.props.getLocation(this.props.pathname)) + ';title=' + encodeURIComponent(this.props.message);
    }
  });

  exports.TumblrButton = createReactClass({
    displayName: 'TumblrButton',
    propTypes: {
      pathname: PropTypes.string,
      getLocation: PropTypes.func,
      message: PropTypes.string
    },
    mixins: [Button, DefaultBlankTarget],
    constructUrl: function constructUrl() {
      return 'https://www.tumblr.com/widgets/share/tool?posttype=link&title=' + encodeURIComponent(this.props.message) + '&content=' + encodeURIComponent(this.props.getLocation(this.props.pathname)) + '&canonicalUrl=' + encodeURIComponent(this.props.getLocation(this.props.pathname)) + '&shareSource=tumblr_share_button';
    }
  });

  exports.PocketButton = createReactClass({
    displayName: 'PocketButton',
    propTypes: {
      pathname: PropTypes.string,
      getLocation: PropTypes.func,
      message: PropTypes.string
    },
    mixins: [Button, DefaultBlankTarget],
    constructUrl: function constructUrl() {
      return 'https://getpocket.com/save?url=' + encodeURIComponent(this.props.getLocation(this.props.pathname)) + '&title=' + encodeURIComponent(this.props.message);
    }
  });

  exports.NaverBlogButton = createReactClass({
    displayName: 'NaverBlogButton',
    propTypes: {
      pathname: PropTypes.string,
      getLocation: PropTypes.func
    },
    mixins: [Button, DefaultBlankTarget],
    constructUrl: function constructUrl() {
      return 'http://blog.naver.com/openapi/share?url=' + encodeURIComponent(this.props.getLocation(this.props.pathname));
    }
  });

  exports.KaKaoStoryButton = createReactClass({
    displayName: 'KaKaoStoryButton',
    propTypes: {
      pathname: PropTypes.string,
      getLocation: PropTypes.func
    },
    mixins: [Button, DefaultBlankTarget],
    constructUrl: function constructUrl() {
      return 'https://story.kakao.com/share?url=' + encodeURIComponent(this.props.getLocation(this.props.pathname));
    }
  });

  exports.KaKaoTalkButton = createReactClass({
    displayName: 'KaKaoTalkButton',
    propTypes: {
      pathname: PropTypes.string,
      getLocation: PropTypes.func,
      message: PropTypes.string,
      media: PropTypes.string,
      id: PropTypes.string,
      jsKey: PropTypes.string
    },
    // componentWillMount() {
    //   if (!isMobile()) this.setState({ isNotRender: true });
    // },
     componentDidMount: function componentDidMount() {
      // if (!isBrowser() || !isMobile()) return true;
    },
    
    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
      if (document.getElementById('KakaoScript')) {
        document.body.removeChild(document.getElementById('KakaoScript'));
      }
      if (document.getElementById('KakaoJSSDK')) {
        document.body.removeChild(document.getElementById('KakaoJSSDK'));
      }
      
      if (!document.getElementById('KakaoJSSDK')) {
        const scriptKakaoJS = document.createElement('script');
        scriptKakaoJS.id = 'KakaoJSSDK';
        scriptKakaoJS.src = '//developers.kakao.com/sdk/js/kakao.min.js';
        document.body.appendChild(scriptKakaoJS);
      }

      const { jsKey, id, message, pathname } = this.props;
      /* eslint-disable */
      const jsCode = `
        function KaKaoInit() {
          Kakao.cleanup();
          Kakao.init('` + jsKey + `');
          console.log('Kakao button initial');
          console.log(Kakao);
          ` + (this.props.media ? `
            Kakao.Link.createDefaultButton({
              container: '#` + id + `',
              objectType: 'feed',
              content: {
                title: '` + message + `',
                imageUrl: '` + this.props.media + `',
                link: {
                  mobileWebUrl: '` + this.props.getLocation(pathname) + `',
                  webUrl: '` + this.props.getLocation(pathname) + `'
                }
              }
            });
          ` : `
            Kakao.Link.createDefaultButton({
              container: '#` + id + `',
              objectType: 'text',
              text: '` + message + `',
              link: {
                mobileWebUrl: '` + this.props.getLocation(pathname) + `',
                webUrl: '` + this.props.getLocation(pathname) + `'
              }
            });
          `) +`
        }

        (function checkKakao() {
          if (typeof Kakao === 'undefined') { setTimeout(checkKakao, 500); }
          else { KaKaoInit(); }
        })();
      `;
      /* eslint-enable */
        const scriptKakaoInit = document.createElement('script');
        scriptKakaoInit.id = 'KakaoScript';
        scriptKakaoInit.setAttribute('type', 'text/javascript');
        scriptKakaoInit.text = jsCode;
        document.body.appendChild(scriptKakaoInit);
    },
    componentWillUnmount() {
      if (document.getElementById('KakaoScript')) {
        document.body.removeChild(document.getElementById('KakaoScript'));
      }
      if (document.getElementById('KakaoJSSDK')) {
        document.body.removeChild(document.getElementById('KakaoJSSDK'));
      }
    },
    mixins: [Button, DefaultBlankTarget],
    constructUrl: function constructUrl() { return null; },
  });

  return exports;
}

module.exports = factory();
