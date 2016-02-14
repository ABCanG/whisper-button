'use strict';

const $ = require('jquery');

// bootstrap用
window.jQuery = $;

(() => {
  function showLength(text) {
    let len = 372  - text.length;
    $('span#num').html(len).css('color', (len < 0 ? 'red' : 'black'));
  }

  $(() => {
    const {bg} = chrome.extension.getBackgroundPage();

    chrome.tabs.getSelected(null, tab => {
      $('textarea').val(tab.title + ' : ' + tab.url);
      showLength($('textarea').val());
    });

    if (bg.isLogin()) {
      $('.login-item').addClass('hidden');
      const {name, icon} = bg.getUserData();
      $('#user-name').text(name);
      $('#user-icon').attr('src', icon);
    } else {
      $('.logout-item').addClass('hidden');
      $('.message').text('ログイン後に再度開いてください');
      $('.text-box').addClass('hidden');
    }

    $('textarea').keydown(e => {
      showLength($('textarea').val())
      if(e.ctrlKey || e.metaKey) {
        if(e.keyCode == 13) {
          if($('span#num').text() >= 0) {
            $('button').click();
          }
        }
      }
    });

    $('#login-btn').on('click', () => {
      bg.loginCroudia();
    });

    $('#logout-btn').on('click', () => {
      bg.logoutCroudia();
      $('.login-item').removeClass('hidden');
      $('.logout-item').addClass('hidden');
      $('.message').text('ログイン後に再度開いてください');
      $('.text-box').addClass('hidden');
    });

    $('button').on('click', () => {
      let text = $('textarea').val();

      if(text.length <= 0) {
        return;
      }

      bg.whisper(text).then(() => {
        $('.message').text('ささやきました');
        $('.text-box').addClass('hidden');
      }, () => {
        $('.message').text('ささやきに失敗しました');
        $('.text-box').addClass('hidden');
      });
    });
  });
})();
