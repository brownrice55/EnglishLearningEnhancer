(function() {
  'use strict';

  const Activation = function() {
    this.initialize.apply(this, arguments);
  };

  Activation.prototype.initialize = function() {
    this.section = document.querySelectorAll('section');
    this.pageData = localStorage.getItem('pageData') || '';
    this.navLiElms = document.querySelectorAll('.js-nav li');
    this.settingsElm = document.querySelector('.js-settings');
  };

  Activation.prototype.selectPage = function() {
    for(let cnt=0,len=this.section.length;cnt<len;++cnt) {
      this.section[cnt].classList.add('disp--none');
    }
    if(this.pageData) {
      const pageNameArray = ['speedreading', 'typing', 'writing', 'dictation'];
      for(let cnt=0,len=pageNameArray.length;cnt<len;++cnt) {
        if(this.pageData==pageNameArray[cnt]) {
          let pageElms = document.querySelector('.js-' + pageNameArray[cnt]);
          pageElms.classList.remove('disp--none');  
        }  
      }
    }
    else { //initial
      let initialPageElm = document.querySelector('.js-registration');
      initialPageElm.classList.remove('disp--none');
    }
  };

  Activation.prototype.setPageName = function() {
    localStorage.setItem('pageData', this.pageData);
    this.selectPage();
  };

  Activation.prototype.setEvent = function() {
    let that = this;
    for(let cnt=0,len=this.navLiElms.length;cnt<len;++cnt) {
      this.navLiElms[cnt].addEventListener('click', function() {
        that.pageData = this.dataset.page;
        that.setPageName();
        window.location.reload(false);
      });
    }
    this.settingsElm.addEventListener('click', function() {
      that.pageData = '';
      that.setPageName();
      window.location.reload(false);
    });
  };

  Activation.prototype.run = function() {
    this.selectPage();
    this.setEvent();
  };

  const DataManagement = function() {
    this.initialize.apply(this, arguments);
  };

  DataManagement.prototype.initialize = function() {
    this.saveBtnElm = document.querySelector('.js-save');
    this.listElm = document.querySelector('.js-list');
    this.listTitleElm = document.querySelector('.js-listTitle');
    this.inputElms = document.querySelectorAll('.js-input');
    this.listLiElms = document.querySelectorAll('.js-list li');

    // ** 読み込みを1箇所にしたい 後で
    this.sentencesData = new Map();
    let sentencesData = localStorage.getItem('sentencesData');
    if(sentencesData!=='undefined') {
      const sentencesDataJson = JSON.parse(sentencesData);
      this.sentencesData = new Map(sentencesDataJson);
    }
    // ** 読み込みを1箇所にしたい 後で
    this.showList();
  };

  DataManagement.prototype.showList = function() {
    if(this.sentencesData.size) {
      this.listTitleElm.classList.remove('disp--none');
    }
    else {
      this.listTitleElm.classList.add('disp--none');
    }
    let showList = '';
    this.sentencesData.forEach((value, key) => {
      showList += '<li data-index="' + key + '">' + value.en + '</li>';
    });
    this.listElm.innerHTML = showList;
    this.listLiElms = document.querySelectorAll('.js-list li');
  };

  DataManagement.prototype.saveData = function(aIndex, aEn, aJp, aSlash, aNote, aPath) {
    for(let cnt=0,len=this.inputElms.length-2;cnt<len;++cnt) {
      if(!this.inputElms[cnt].value) {
        return;
      }
    }
    let id = (aIndex=='n') ? this.sentencesData.size+1 : parseInt(aIndex);
    let numArray = this.inputElms[0].value.split(' ');
    this.sentencesData.set(id, { en:aEn, jp:aJp, slash:aSlash, note:aNote, path:aPath, num:numArray.length});
    localStorage.setItem('sentencesData', JSON.stringify([...this.sentencesData]));
    window.location.reload(false);
  };

  DataManagement.prototype.setEvent = function() {
    let that = this;
    this.saveBtnElm.addEventListener('click', function() {
      that.saveData(this.dataset.index, that.inputElms[0].value, that.inputElms[1].value, that.inputElms[2].value, that.inputElms[3].value, that.inputElms[4].value);
    });
    let id = 0;
    let selectedData = new Map();
    for(let cnt=0,len=this.listLiElms.length;cnt<len;++cnt) {
      this.listLiElms[cnt].addEventListener('click', function() {
        id = this.dataset.index;
        selectedData = that.sentencesData.get(parseInt(id));
        that.inputElms[0].value = selectedData.en;
        that.inputElms[1].value = selectedData.jp;
        that.inputElms[2].value = selectedData.slash;
        that.inputElms[3].value = selectedData.note;
        that.inputElms[4].value = selectedData.path;
        that.saveBtnElm.dataset.index = id;
        that.saveBtnElm.innerHTML = '上書き保存';
      });
    }
  };

  DataManagement.prototype.run = function() {
    this.setEvent();
  };

  const Enhancer = function() {
    this.initialize.apply(this, arguments);
  };

  Enhancer.prototype.initialize = function() {
    // ** 読み込みを1箇所にしたい 後で
    this.sentencesData = new Map();
    let sentencesData = localStorage.getItem('sentencesData');
    if(sentencesData!=='undefined') {
      const sentencesDataJson = JSON.parse(sentencesData);
      this.sentencesData = new Map(sentencesDataJson);
    }
    this.pageData = localStorage.getItem('pageData') || '';
    // ** 読み込みを1箇所にしたい 後で

    // speed reading
    this.speedreadingTextElm = document.querySelector('.js-speedreadingText');
    this.startReadingBtnElm = document.querySelector('.js-startReading');

    this.startTime = 0;
    this.wpm = 0;
    // speed reading

    // typing
    this.typingTextElm = document.querySelector('.js-typingText');
    // typing

  };

  Enhancer.prototype.getRandomIndexArray = function(aLength) {
    let len = aLength;
    let array = [];
    for(let cnt=0;cnt<len;++cnt) {
      array[cnt] = cnt;
    }
    const getRandomNum = (min, max) => {
      return Math.floor(Math.random()*(max-min)+min);
    }
    for(let cnt=len-1;cnt>0;--cnt) {
      const random = getRandomNum(0, cnt+1);
      [array[cnt],array[random]] = [array[random],array[cnt]];
    }
    return array;
  };

  Enhancer.prototype.showSentence = function() {
    this.sentenceDataArray = [...this.sentencesData];
    this.randomIndexArray = this.getRandomIndexArray(this.sentenceDataArray.length);

    if(this.pageData=='speedreading') {
      this.speedreadingTextElm.innerHTML = '<p class="main__text">' + this.sentenceDataArray[this.randomIndexArray[0]][1].en + '</p>';  
    }
    else if(this.pageData=='typing') {
      this.typingTextElm.innerHTML = '<p>キーボードのキーを押すとスタートします。</p>';
    }
  };

  Enhancer.prototype.setEvent = function() {
    let that = this;
    let div = document.createElement('div');
    let currentIndex = 0;
    let currentSentenceData = '';
    let note = '';
    if(this.pageData=='speedreading') {
      this.startReadingBtnElm.addEventListener('click', function() {
        if(!currentIndex) {
          that.speedreadingTextElm.classList.remove('disp--none');
        }
        if(currentIndex%2) {
          let timeTaken = (Date.now()-this.startTime)/1000;
          currentSentenceData = that.sentenceDataArray[that.randomIndexArray[((currentIndex+1)/2)-1]][1];
          this.wpm = currentSentenceData.num/timeTaken*60;
          that.speedreadingTextElm.innerHTML = '<p class="main__text">' + currentSentenceData.en + '</p>';
          note = (currentSentenceData.note) ? '<p class="main__note">' + currentSentenceData.note + '</p>' : '';
          div.innerHTML = '<p class="main__note">' + currentSentenceData.slash + '</p>' + note + '<p class="main__note">' + currentSentenceData.jp + '</p><p class="main__note">単語数：' + currentSentenceData.num + '語　かかった時間：' + timeTaken + '秒　WPM：' + Math.round(this.wpm) + '</p>';
          that.speedreadingTextElm.appendChild(div);
          that.startReadingBtnElm.innerHTML = '次の文章';
        }
        else {
          that.speedreadingTextElm.innerHTML = '<p class="main__text">' + that.sentenceDataArray[that.randomIndexArray[currentIndex/2]][1].en + '</p>';
          that.startReadingBtnElm.innerHTML = '読了';
          this.startTime = Date.now();
        }
        ++currentIndex;
      });
    }
    else if(this.pageData=='typing') {
      currentSentenceData = this.sentenceDataArray[this.randomIndexArray[currentIndex]][1];
      note = (currentSentenceData.note) ? '<p class="main__note">' + currentSentenceData.note + '</p>' : '';
      let cnt = 0;
      let len = currentSentenceData.en.length;

      const typing = (event) => {
        let keyCode = event.key;
        if(len==len-cnt) {
          that.typingTextElm.innerHTML = '<p class="main__text">' + currentSentenceData.en.substring(cnt, len) + '</p>';
        }
        if(that.sentenceDataArray[that.randomIndexArray[currentIndex]][1].en.charAt(cnt)==keyCode) {
          ++cnt;
          that.typingTextElm.innerHTML = '<p class="main__text">' + currentSentenceData.en.substring(cnt, len) + '</p>';
          if(!(len-cnt)){//next
            ++currentIndex;
            currentSentenceData = that.sentenceDataArray[that.randomIndexArray[currentIndex]][1];
            cnt = 0;
            len = currentSentenceData.en.length;
            that.typingTextElm.innerHTML = '<p class="main__text">' + currentSentenceData.en.substring(cnt, len) + '</p>';
          }
        }
        note = (currentSentenceData.note) ? '<p class="main__note">' + currentSentenceData.note + '</p>' : '';
        div.innerHTML = '<p class="main__note">' + currentSentenceData.slash + '</p>' + note + '<p class="main__note">' + currentSentenceData.jp + '</p>';
        this.typingTextElm.appendChild(div);
      }

      window.addEventListener('keydown', typing);
    }
  };

  Enhancer.prototype.run = function() {
    this.showSentence();
    this.setEvent();
  };

  window.addEventListener('DOMContentLoaded', function() {
    let activation = new Activation();
    activation.run();

    let dataManagement = new DataManagement();
    dataManagement.run();

    let enhancer = new Enhancer();
    enhancer.run();
  });

}());