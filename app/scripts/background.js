'use strict';

// Enable chromereload by uncommenting this line:
// import './lib/livereload';

const _ = require('lodash');
const Croudia = require('croudia');
const parse = require('url-parse');
const consumerKey = require('./consumerKey.js');

(() => {
  class Background {
    constructor() {
      this.hookTabIds = [];
      this.croudia = new Croudia(Object.assign({
        access_token: localStorage.getItem('access_token'),
        refresh_token: localStorage.getItem('refresh_token')
      }, consumerKey));
      this.croudia.setTokenChangeListener(this.handleTokenChangeListener);

      chrome.tabs.onUpdated.addListener((tabid, info, tab) => {
        if (this.hookTabIds.includes(tabid) && info.status === 'loading') {
          let url = parse(tab.url, true);
          if (_.has(url, ['query', 'code'])) {
            this.croudia.login(tab.url, err => {
              if (err) {
                console.log(err);
              } else {
                this.croudia.verifyCredentials((err, data) => {
                  if (err) {
                    console.log(err);
                  } else {
                    localStorage.setItem('user_name', data.name);
                    localStorage.setItem('user_icon', data.profile_image_url_https);
                  }
                });
                chrome.tabs.remove(tabid, () => {
                  this.hookTabIds = [];
                });
              }
            });
          }
        }
      });
    }

    loginCroudia() {
      let authorizeUrl = this.croudia.getAuthorizeUrl();
      chrome.tabs.create ({
        url: authorizeUrl
      }, obj => {
        this.hookTabIds.push(obj.id);
      });
    }

    logoutCroudia() {
      localStorage.clear();
    }

    isLogin() {
      return !!localStorage.getItem('access_token');
    }

    getUserData() {
      return {
        name: localStorage.getItem('user_name'),
        icon: localStorage.getItem('user_icon')
      };
    }

    handleTokenChangeListener({access_token, refresh_token}) {
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
    }

    whisper(text) {
      return new Promise((resolve, reject) => {
        if (this.isLogin()) {
          this.croudia.updateStatus(text, (err, data) => {
            if (err) {
              reject(err);
              console.log(err);
            } else {
              resolve(data);
            }
          });
        }
      })
    }
  }
  window.bg = new Background();
})();
