# react-social-kr

[![npm version](https://badge.fury.io/js/react-social-kr.svg)](https://badge.fury.io/js/react-social-kr)

> Simple [React](http://facebook.github.io/react/index.html) components for
> social (Facebook, Google, VKontakte, Pinterest ...) buttons and counts.
> Plus, Korean SNS supports (Naver Blog, KaKao Talk, KaKao Story ...)

> Original Source from [react-social](https://github.com/olahol/react-social). Thanks to Ola Holmström and all contributors.

## Install

```bash
npm install react-social-kr --save
```

## Example

```javascript
import { FacebookButton, FacebookCount } from "react-social-kr";

@connect(
  (state, ownProps) => ({
    pathname: ownProps.location.pathname
  }), {})
class App extends Component {
  render {
    const { pathname } = this.props;

    return (
      <FacebookButton pathname={pathname} appId={appId}>
        <FacebookCount pathname={pathname} />
        {" Share " + pathname}
      </FacebookButton>
    );
  }
}
```

## Count  API

**WARNING: `GooglePlusCount`, `TwitterCount` and `PocketCount` uses the
[donreach API](http://donreach.com/social-share-count) which has a limit
of 1000 request per day, if you have an alternative please do not hesitate
to make a PR**

- FacebookCount
- TwitterCount
- GooglePlusCount
- PinterestCount
- LinkedInCount
- RedditCount
- VKontakteCount
- TumblrCount
- PocketCount

### Props

##### element

Change the element the component renders into, default is `span`.

##### pathname

The pathname you want to get the count of, default is `window.location`.

##### token

- FacebookButton

Optional access token.

##### onCount

Callback for when the count is updated. Callback takes one argument `count`.

### Methods

##### getCount()

Return the social count.

## Button API

-  FacebookButton
-  TwitterButton
-  GooglePlusButton
-  PinterestButton
-  LinkedInButton
-  RedditButton
-  VKontakteButton
-  EmailButton
-  XingButton
-  TumblrButton
-  PocketButton
-  NaverBlogButton
-  KaKaoStoryButton
-  KaKaoTalkButton

### Props

##### element

Change the element the component renders into, default is `button`.

##### pathname

The pathname you want to share, default is `window.location`.

##### target

The target you want to open, default is `_blank`.

##### windowOptions

Pass options to `window.open`.

##### message

- TwitterButton
- FacebookButton
- XingButton
- TumblrButton
- PocketButton
- PinterestButton (required)
- KaKaoTalkButton

A message that's prepended before the url.

##### title

- VKButton
- RedditButton
- LinkedInButton

Title of your shared content.

##### media

- PinterestButton (required)
- FacebookButton (optional)

Url of an image.

##### appId

- FacebookButton (required)

Facebook app id.

##### sharer

- FacebookButton

Facebook has 2 different share dialogs. By default we're showing Feed
Dialog which has more options, but supports only sharing to user's
feed. You can set `sharer` option to `true` and we'll show Share Dialog
where user can choose between their feed and also pages they have
access to.

##### jsKey

- KaKaoTalkButton (required)

KaKaoTalk JavaScript api key.

## Styles

There are no styles included, the components pass all their props down
to their element like `className` and `style` so you can easily style
them yourself.

## Notice

* When rendered server side counts will be 0 since they depend on JSONP.
* `GooglePlusCount`, `TwitterCount` and `PocketCount` uses the donreach API which has a limit of 1000 requests per day.

## Contributors

* Ola Holmström (@olahol)
* Alexandr Sugak (@AlexSugak)
* Jon Principe (@jprincipe)
* Jean-Baptiste Quenot (@jbq)
* Kurt Weiberth (@kweiberth)
* Bartek Gruszka (@bartekgruszka)
* Josh Owens (@queso)
* Maxime Mezrahi (@maxs15)
* Arvin Tehrani (@arvinkx)
* Dennis Stücken (@dstuecken)
* Jonas (@jonashaefele)
* River Kanies (@riverKanies)
* Pavel Linkesch (@orthes)
* Vincent (@vkammerer)
* Alexey Balmasov (@balmasich)
* Amitom (@Amitom)
* Ryan Nevius (@rnevius)
* David Lakata (@dlakata)
* Roman Kosovichev (@roma-so)
* Igor Pnev (@exdeniz)


---

MIT Licensed

[npm-image]: https://img.shields.io/npm/v/react-social.svg?style=flat-square
[npm-url]: https://npmjs.org/package/react-social
[downloads-image]: http://img.shields.io/npm/dm/react-social.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/react-social
[travis-image]: https://img.shields.io/travis/olahol/react-social/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/olahol/react-social
[dep-image]: https://david-dm.org/olahol/react-social/peer-status.svg?style=flat-square
[dep-url]: https://david-dm.org/olahol/react-social
