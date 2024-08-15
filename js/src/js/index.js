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
      });
    }
    this.settingsElm.addEventListener('click', function() {
      that.pageData = '';
      that.setPageName();
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

  DataManagement.prototype.saveData = function(aIndex, aEn, aJp, aNote, aPath) {
    for(let cnt=0,len=this.inputElms.length-2;cnt<len;++cnt) {
      if(!this.inputElms[cnt].value) {
        return;
      }
    }
    let id = (aIndex=='n') ? this.sentencesData.size+1 : parseInt(aIndex);
    let numArray = this.inputElms[0].value.split(' ');
    this.sentencesData.set(id, { en:aEn, jp:aJp, note:aNote, path:aPath, num:numArray.length});
    localStorage.setItem('sentencesData', JSON.stringify([...this.sentencesData]));
    window.location.reload(false);
  };

  DataManagement.prototype.setEvent = function() {
    let that = this;
    this.saveBtnElm.addEventListener('click', function() {
      that.saveData(this.dataset.index, that.inputElms[0].value, that.inputElms[1].value, that.inputElms[2].value, that.inputElms[3].value);
    });
    let id = 0;
    let selectedData = new Map();
    for(let cnt=0,len=this.listLiElms.length;cnt<len;++cnt) {
      this.listLiElms[cnt].addEventListener('click', function() {
        id = this.dataset.index;
        selectedData = that.sentencesData.get(parseInt(id));
        that.inputElms[0].value = selectedData.en;
        that.inputElms[1].value = selectedData.jp;
        that.inputElms[2].value = selectedData.note;
        that.inputElms[3].value = selectedData.path;
        that.saveBtnElm.dataset.index = id;
        that.saveBtnElm.innerHTML = '上書き保存';
      });
    }
  };

  DataManagement.prototype.run = function() {
    this.setEvent();
  };

  const Speedreading = function() {
    this.initialize.apply(this, arguments);
  };

  Speedreading.prototype.initialize = function() {
    // ** 読み込みを1箇所にしたい 後で
    this.sentencesData = new Map();
    let sentencesData = localStorage.getItem('sentencesData');
    if(sentencesData!=='undefined') {
      const sentencesDataJson = JSON.parse(sentencesData);
      this.sentencesData = new Map(sentencesDataJson);
    }
    // ** 読み込みを1箇所にしたい 後で

    this.speedreadingTextElm = document.querySelector('.js-speedreadingText');
    this.startReadingBtnElm = document.querySelector('.js-startReading');
    this.cnt = 0;

    this.startTime = 0;
    this.wpm = 0;
  };

  Speedreading.prototype.showSentence = function() {
    this.sentenceDataArray = [...this.sentencesData];

    const getRandomIndexArray = (aLength) => {
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

    this.randomIndexArray = getRandomIndexArray(this.sentenceDataArray.length);
    this.speedreadingTextElm.innerHTML = '<p>' + this.sentenceDataArray[this.randomIndexArray[0]][1].en + '</p>';
  };

  Speedreading.prototype.setEvent = function() {
    let that = this;
    let div = document.createElement('div');
    let currentSentenceData = '';
    this.startReadingBtnElm.addEventListener('click', function() {
      if(!that.cnt) {
        that.speedreadingTextElm.classList.remove('disp--none');
      }
      if(that.cnt%2) {
        let timeTaken = (Date.now() - this.startTime)/1000;
        currentSentenceData = that.sentenceDataArray[that.randomIndexArray[0]][1];
        this.wpm = currentSentenceData.num/timeTaken*60;
        let note = (currentSentenceData.note) ? '<p>' + currentSentenceData.note + '</p>' : '';
        div.innerHTML = '<p>' + currentSentenceData.jp + '</p>' + note + '<p>単語数：' + currentSentenceData.num + '語　かかった時間：' + timeTaken + '秒　WPM：' + Math.round(this.wpm) + '</p>';
        that.speedreadingTextElm.appendChild(div);
        that.startReadingBtnElm.innerHTML = '次の文章';
      }
      else {
        that.speedreadingTextElm.innerHTML = '<p>' + that.sentenceDataArray[that.randomIndexArray[that.cnt/2]][1].en + '</p>';
        that.startReadingBtnElm.innerHTML = '読了';
        this.startTime = Date.now();
      }
      ++that.cnt;
    });
  };

  Speedreading.prototype.run = function() {
    this.showSentence();
    this.setEvent();
  };

  window.addEventListener('DOMContentLoaded', function() {
    let activation = new Activation();
    activation.run();

    let dataManagement = new DataManagement();
    dataManagement.run();

    let speedreading = new Speedreading();
    speedreading.run();
  });
}());