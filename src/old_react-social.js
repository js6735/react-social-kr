'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function factory() {
  var _arguments = arguments,
      _this = this;

  var isBrowser = function isBrowser() {
    return !(typeof document === 'undefined' || typeof window === 'undefined');
  };
  // const isMobile = () => {
  //   return (navigator.userAgent.match('CriOS') || navigator.userAgent.match(/mobile/i));
  // };

  var getLocation = function getLocation(pathname) {
    if (isBrowser()) {
      var path = window.location.protocol + '//' + (window.location.host || window.location.hostname) + pathname;
      return path;
    }
    return '';
  };

  var spread = function spread(obj, omit) {
    var clone = Object.assign({}, obj);

    omit.forEach(function (key) {
      delete clone[key];
    });

    return clone;
  };

  var jsonp = function jsonp(url, cb) {
    var called = false;
    var now = new Date();
    var id = now + '_' + Math.floor(Math.random() * 1000);

    var script = document.createElement('script');
    var callback = 'jsonp_' + id;
    var query = url.replace('@', callback);

    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', query);
    document.body.appendChild(script);

    setTimeout(function () {
      if (!called) {
        called = true;
        if (typeof cb === 'function') cb(new Error('jsonp timeout'));
      }
    }, 10000);

    window[callback] = function () {
      var args = Array.prototype.slice.call(_arguments, 0);
      args.unshift(null);
      if (!called) {
        called = true;
        if (typeof cb === 'function') cb.apply(_this, args);
      }
    };
  };

  /* Caputre VKontake callbacks */
  var vkCallbacks = {};

  var hookVKCallback = function hookVKCallback() {
    if (!isBrowser()) {
      return true;
    }

    if (!window.VK) {
      window.VK = {};
    }

    if (!window.VK.Share) {
      window.VK.Share = {};
    }

    var oldCount = window.VK.Share.count;

    window.VK.Share.count = function (index, count) {
      if (typeof vkCallbacks[index] === 'function') {
        return vkCallbacks[index](count);
      }

      if (typeof oldCount === 'function') {
        oldCount(index, count);
      }
    };
  };

  var captureVKCallback = function captureVKCallback(index, cb) {
    vkCallbacks[index] = cb;
  };

  hookVKCallback();

  var exports = {};

  var Count = {
    displayName: 'Count',
    propTypes: {
      element: _propTypes2.default.string,
      pathname: _propTypes2.default.string,
      getLocation: _propTypes2.default.func,
      token: _propTypes2.default.string
    },
    getDefaultProps: function getDefaultProps() {
      return {
        element: 'span',
        pathname: '',
        getLocation: getLocation,
        onCount: function onCount() {},
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
      var _this2 = this;

      if (this.props.getLocation(this.props.pathname) !== nextProps.url) {
        this.setState({
          count: 0
        }, function () {
          _this2.updateCount();
        });
      }
    },
    componentDidUpdate: function componentDidUpdate() {
      this.props.onCount(this.state.count);
    },
    updateCount: function updateCount() {
      var _this3 = this;

      if (!isBrowser()) {
        return true;
      }

      if (typeof this.fetchCount === 'function') {
        return this.fetchCount(function (count) {
          _this3.setState({ count: count });
        });
      }

      var url = this.constructUrl();

      jsonp(url, function (err, data) {
        if (err) {
          console.warn('react-social: jsonp timeout for url ' + url);
          return _this3.setState({ count: 0 });
        }

        _this3.setState({
          count: _this3.extractCount(data)
        });
      });
    },
    getCount: function getCount() {
      return this.state.count;
    },
    render: function render() {
      return _react2.default.createElement(this.props.element, spread(this.props, ['element', 'pathname', 'getLocation', 'onCount', 'token']), this.state.count);
    }
  };

  var Button = {
    displayName: 'Button',
    propTypes: {
      element: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func]),
      pathname: _propTypes2.default.string,
      getLocation: _propTypes2.default.func,
      media: _propTypes2.default.string,
      message: _propTypes2.default.string,
      onClick: _propTypes2.default.func,
      target: _propTypes2.default.string,
      windowOptions: _propTypes2.default.array,
      _open: _propTypes2.default.bool,
      sharer: _propTypes2.default.bool
    },
    getDefaultProps: function getDefaultProps() {
      return {
        element: 'a',
        pathname: '',
        getLocation: getLocation,
        media: '',
        message: '',
        onClick: function onClick() {},
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
      var url = this.constructUrl();
      var target = this.props.target;
      var options = this.props.windowOptions.join(',');
      this.props.onClick(evt, url, target);
      if (isBrowser() && url && this.props._open) {
        window.open(url, target, options);
      }
    },
    render: function render() {
      if (this.state.isNotRender) return null;

      var other = spread(this.props, ['onClick', 'element', 'pathname', 'getLocation', '_open', 'message', 'appId', 'sharer', 'media', 'windowOptions', 'jsKey']);

      return _react2.default.createElement(this.props.element, Object.assign({ onClick: this.click }, other));
    }
  };

  var DefaultBlankTarget = {
    getDefaultProps: function getDefaultProps() {
      return { target: '_blank' };
    }
  };

  /* Counts */
  exports.FacebookCount = (0, _createReactClass2.default)({
    displayName: 'FacebookCount',
    propTypes: {
      pathname: _propTypes2.default.string,
      getLocation: _propTypes2.default.func
    },
    mixins: [Count],
    constructUrl: function constructUrl() {
      var url = '';
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

  exports.TwitterCount = (0, _createReactClass2.default)({
    displayName: 'TwitterCount',
    propTypes: {
      pathname: _propTypes2.default.string,
      getLocation: _propTypes2.default.func
    },
    mixins: [Count],
    constructUrl: function constructUrl() {
      return 'https://count.donreach.com/?callback=@&url=' + encodeURIComponent(this.props.getLocation(this.props.pathname)) + '&providers=all';
    },
    extractCount: function extractCount(data) {
      return data.shares.twitter || 0;
    }
  });

  exports.GooglePlusCount = (0, _createReactClass2.default)({
    displayName: 'GooglePlusCount',
    propTypes: {
      pathname: _propTypes2.default.string,
      getLocation: _propTypes2.default.func
    },
    mixins: [Count],
    constructUrl: function constructUrl() {
      return 'https://count.donreach.com/?callback=@&url=' + encodeURIComponent(this.props.getLocation(this.props.pathname)) + '&providers=google';
    },
    extractCount: function extractCount(data) {
      return data.shares.google || 0;
    }
  });

  exports.PinterestCount = (0, _createReactClass2.default)({
    displayName: 'PinterestCount',
    propTypes: {
      pathname: _propTypes2.default.string,
      getLocation: _propTypes2.default.func
    },
    mixins: [Count],
    constructUrl: function constructUrl() {
      return 'https://api.pinterest.com/v1/urls/count.json?callback=@&url=' + encodeURIComponent(this.props.getLocation(this.props.pathname));
    },
    extractCount: function extractCount(data) {
      return data.count || 0;
    }
  });

  exports.LinkedInCount = (0, _createReactClass2.default)({
    displayName: 'LinkedInCount',
    propTypes: {
      pathname: _propTypes2.default.string,
      getLocation: _propTypes2.default.func
    },
    mixins: [Count],
    constructUrl: function constructUrl() {
      return 'https://www.linkedin.com/countserv/count/share?url=' + encodeURIComponent(this.props.getLocation(this.props.pathname)) + '&callback=@&format=jsonp';
    },
    extractCount: function extractCount(data) {
      return data.count || 0;
    }
  });

  exports.RedditCount = (0, _createReactClass2.default)({
    displayName: 'RedditCount',
    propTypes: {
      pathname: _propTypes2.default.string,
      getLocation: _propTypes2.default.func
    },
    mixins: [Count],
    constructUrl: function constructUrl() {
      return 'https://www.reddit.com/api/info.json?jsonp=@&url=' + encodeURIComponent(this.props.getLocation(this.props.pathname));
    },
    extractCount: function extractCount(data) {
      var count = 0;
      var chs = data.data.children;

      for (var idx = 0; idx < chs.length; idx++) {
        count += chs[idx].data.score;
      }

      return count;
    }
  });

  exports.VKontakteCount = (0, _createReactClass2.default)({
    displayName: 'VKontakteCount',
    propTypes: {
      pathname: _propTypes2.default.string,
      getLocation: _propTypes2.default.func
    },
    mixins: [Count],
    fetchCount: function fetchCount(cb) {
      var index = Math.floor(Math.random() * 10000);
      var url = 'https://vkontakte.ru/share.php?act=count&index=' + index + '&url=' + encodeURIComponent(this.props.getLocation(this.props.pathname));
      captureVKCallback(index, cb);
      jsonp(url);
    }
  });

  exports.TumblrCount = (0, _createReactClass2.default)({
    displayName: 'TumblrCount',
    propTypes: {
      pathname: _propTypes2.default.string,
      getLocation: _propTypes2.default.func
    },
    mixins: [Count],
    constructUrl: function constructUrl() {
      return 'http://api.tumblr.com/v2/share/stats?url=' + encodeURIComponent(this.props.getLocation(this.props.pathname)) + '&callback=@';
    },
    extractCount: function extractCount(data) {
      return data.response.note_count || 0;
    }
  });

  exports.PocketCount = (0, _createReactClass2.default)({
    displayName: 'PocketCount',
    propTypes: {
      pathname: _propTypes2.default.string,
      getLocation: _propTypes2.default.func
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
  exports.FacebookButton = (0, _createReactClass2.default)({
    displayName: 'FacebookButton',
    propTypes: {
      appId: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]).isRequired,
      pathname: _propTypes2.default.string,
      getLocation: _propTypes2.default.func,
      sharer: _propTypes2.default.bool,
      message: _propTypes2.default.string
    },
    mixins: [Button, DefaultBlankTarget],
    constructUrl: function constructUrl() {
      if (this.props.sharer) {
        return 'https://www.facebook.com/dialog/share?' + 'app_id=' + encodeURIComponent(this.props.appId) + '&display=popup&caption=' + encodeURIComponent(this.props.message) + '&href=' + encodeURIComponent(this.props.getLocation(this.props.pathname)) + '&redirect_uri=' + encodeURIComponent('https://www.facebook.com/');
      }

      return 'https://www.facebook.com/dialog/feed?' + 'app_id=' + encodeURIComponent(this.props.appId) + '&display=popup&caption=' + encodeURIComponent(this.props.message) + '&link=' + encodeURIComponent(this.props.getLocation(this.props.pathname)) + '&picture=' + encodeURIComponent(this.props.media) + '&redirect_uri=' + encodeURIComponent('https://www.facebook.com/');
    }
  });

  exports.TwitterButton = (0, _createReactClass2.default)({
    displayName: 'TwitterButton',
    propTypes: {
      pathname: _propTypes2.default.string,
      getLocation: _propTypes2.default.func,
      message: _propTypes2.default.string
    },
    mixins: [Button, DefaultBlankTarget],
    constructUrl: function constructUrl() {
      var msg = this.props.message === '' ? this.props.getLocation(this.props.pathname) : this.props.message + ' ' + this.props.getLocation(this.props.pathname);
      return 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(msg);
    }
  });

  exports.EmailButton = (0, _createReactClass2.default)({
    displayName: 'EmailButton',
    propTypes: {
      pathname: _propTypes2.default.string,
      getLocation: _propTypes2.default.func,
      message: _propTypes2.default.string
    },
    mixins: [Button],
    constructUrl: function constructUrl() {
      return 'mailto:?subject=' + encodeURIComponent(this.props.message) + '&body=' + encodeURIComponent(this.props.getLocation(this.props.pathname));
    }
  });

  exports.PinterestButton = (0, _createReactClass2.default)({
    displayName: 'PinterestButton',
    propTypes: {
      pathname: _propTypes2.default.string,
      getLocation: _propTypes2.default.func,
      media: _propTypes2.default.string.isRequired,
      message: _propTypes2.default.string.isRequired
    },
    mixins: [Button, DefaultBlankTarget],
    constructUrl: function constructUrl() {
      var url = 'https://pinterest.com/pin/create/button/?url=' + encodeURIComponent(this.props.getLocation(this.props.pathname)) + '&media=' + encodeURIComponent(this.props.media) + '&description=' + encodeURIComponent(this.props.message);
      return url;
    }
  });

  exports.VKontakteButton = (0, _createReactClass2.default)({
    displayName: 'VKontakteButton',
    propTypes: {
      pathname: _propTypes2.default.string,
      getLocation: _propTypes2.default.func
    },
    mixins: [Button, DefaultBlankTarget],
    constructUrl: function constructUrl() {
      return 'http://vk.com/share.php?url=' + encodeURIComponent(this.props.getLocation(this.props.pathname)) + '&title=' + encodeURIComponent(this.props.title) + '&description=' + encodeURIComponent(this.props.message);
    }
  });

  exports.GooglePlusButton = (0, _createReactClass2.default)({
    displayName: 'GooglePlusButton',
    propTypes: {
      pathname: _propTypes2.default.string,
      getLocation: _propTypes2.default.func
    },
    mixins: [Button, DefaultBlankTarget],
    constructUrl: function constructUrl() {
      return 'https://plus.google.com/share?url=' + encodeURIComponent(this.props.getLocation(this.props.pathname));
    }
  });

  exports.RedditButton = (0, _createReactClass2.default)({
    displayName: 'RedditButton',
    propTypes: {
      pathname: _propTypes2.default.string,
      getLocation: _propTypes2.default.func
    },
    mixins: [Button, DefaultBlankTarget],
    constructUrl: function constructUrl() {
      return 'https://www.reddit.com/submit?url=' + encodeURIComponent(this.props.getLocation(this.props.pathname)) + '&title=' + encodeURIComponent(this.props.title);
    }
  });

  exports.LinkedInButton = (0, _createReactClass2.default)({
    displayName: 'LinkedInButton',
    propTypes: {
      pathname: _propTypes2.default.string,
      getLocation: _propTypes2.default.func
    },
    mixins: [Button, DefaultBlankTarget],
    constructUrl: function constructUrl() {
      return 'https://www.linkedin.com/shareArticle?url=' + encodeURIComponent(this.props.getLocation(this.props.pathname)) + '&title=' + encodeURIComponent(this.props.title);
    }
  });

  exports.XingButton = (0, _createReactClass2.default)({
    displayName: 'XingButton',
    propTypes: {
      pathname: _propTypes2.default.string,
      getLocation: _propTypes2.default.func,
      message: _propTypes2.default.string
    },
    mixins: [Button, DefaultBlankTarget],
    constructUrl: function constructUrl() {
      return 'https://www.xing.com/app/user?op=share;url=' + encodeURIComponent(this.props.getLocation(this.props.pathname)) + ';title=' + encodeURIComponent(this.props.message);
    }
  });

  exports.TumblrButton = (0, _createReactClass2.default)({
    displayName: 'TumblrButton',
    propTypes: {
      pathname: _propTypes2.default.string,
      getLocation: _propTypes2.default.func,
      message: _propTypes2.default.string
    },
    mixins: [Button, DefaultBlankTarget],
    constructUrl: function constructUrl() {
      return 'https://www.tumblr.com/widgets/share/tool?posttype=link&title=' + encodeURIComponent(this.props.message) + '&content=' + encodeURIComponent(this.props.getLocation(this.props.pathname)) + '&canonicalUrl=' + encodeURIComponent(this.props.getLocation(this.props.pathname)) + '&shareSource=tumblr_share_button';
    }
  });

  exports.PocketButton = (0, _createReactClass2.default)({
    displayName: 'PocketButton',
    propTypes: {
      pathname: _propTypes2.default.string,
      getLocation: _propTypes2.default.func,
      message: _propTypes2.default.string
    },
    mixins: [Button, DefaultBlankTarget],
    constructUrl: function constructUrl() {
      return 'https://getpocket.com/save?url=' + encodeURIComponent(this.props.getLocation(this.props.pathname)) + '&title=' + encodeURIComponent(this.props.message);
    }
  });

  exports.NaverBlogButton = (0, _createReactClass2.default)({
    displayName: 'NaverBlogButton',
    propTypes: {
      pathname: _propTypes2.default.string,
      getLocation: _propTypes2.default.func
    },
    mixins: [Button, DefaultBlankTarget],
    constructUrl: function constructUrl() {
      return 'http://blog.naver.com/openapi/share?url=' + encodeURIComponent(this.props.getLocation(this.props.pathname));
    }
  });

  exports.KaKaoStoryButton = (0, _createReactClass2.default)({
    displayName: 'KaKaoStoryButton',
    propTypes: {
      pathname: _propTypes2.default.string,
      getLocation: _propTypes2.default.func
    },
    mixins: [Button, DefaultBlankTarget],
    constructUrl: function constructUrl() {
      return 'https://story.kakao.com/share?url=' + encodeURIComponent(this.props.getLocation(this.props.pathname));
    }
  });

  exports.KaKaoTalkButton = (0, _createReactClass2.default)({
    displayName: 'KaKaoTalkButton',
    propTypes: {
      pathname: _propTypes2.default.string,
      getLocation: _propTypes2.default.func,
      message: _propTypes2.default.string,
      media: _propTypes2.default.string,
      id: _propTypes2.default.string,
      jsKey: _propTypes2.default.string
    },
    // componentWillMount() {
    //   if (!isMobile()) this.setState({ isNotRender: true });
    // },
    componentDidMount: function componentDidMount() {
      // if (!isBrowser() || !isMobile()) return true;

      if (!document.getElementById('KakaoJSSDK')) {
        var scriptKakaoJS = document.createElement('script');
        scriptKakaoJS.id = 'KakaoJSSDK';
        scriptKakaoJS.src = '//developers.kakao.com/sdk/js/kakao.min.js';
        document.body.appendChild(scriptKakaoJS);
      }

      var _props = this.props,
          jsKey = _props.jsKey,
          id = _props.id,
          message = _props.message,
          pathname = _props.pathname;
      /* eslint-disable */

      var jsCode = '\n        function KaKaoInit() {\n          Kakao.cleanup();\n          Kakao.init(\'' + jsKey + '\');\n          console.log(\'Kakao button initial\');\n          console.log(Kakao);\n          ' + (this.props.media ? '\n            Kakao.Link.createDefaultButton({\n              container: \'#' + id + '\',\n              objectType: \'feed\',\n              content: {\n                title: \'' + message + '\',\n                imageUrl: \'' + this.props.media + '\',\n                link: {\n                  mobileWebUrl: \'' + this.props.getLocation(pathname) + '\',\n                  webUrl: \'' + this.props.getLocation(pathname) + '\'\n                }\n              }\n            });\n          ' : '\n            Kakao.Link.createDefaultButton({\n              container: \'#' + id + '\',\n              objectType: \'text\',\n              text: \'' + message + '\',\n              link: {\n                mobileWebUrl: \'' + this.props.getLocation(pathname) + '\',\n                webUrl: \'' + this.props.getLocation(pathname) + '\'\n              }\n            });\n          ') + '\n        }\n\n        (function checkKakao() {\n          if (typeof Kakao === \'undefined\') { setTimeout(checkKakao, 500); }\n          else { KaKaoInit(); }\n        })();\n      ';
      /* eslint-enable */

      if (!document.getElementById('KakaoScript')) {
        var scriptKakaoInit = document.createElement('script');
        scriptKakaoInit.id = 'KakaoScript';
        scriptKakaoInit.setAttribute('type', 'text/javascript');
        scriptKakaoInit.text = jsCode;
        document.body.appendChild(scriptKakaoInit);
      }
    },
    componentWillUnmount: function componentWillUnmount() {
      if (document.getElementById('KakaoScript')) {
        document.body.removeChild(document.getElementById('KakaoScript'));
      }
      if (document.getElementById('KakaoJSSDK')) {
        document.body.removeChild(document.getElementById('KakaoJSSDK'));
      }
    },

    mixins: [Button, DefaultBlankTarget],
    constructUrl: function constructUrl() {
      return null;
    }
  });

  return exports;
}

module.exports = factory();
