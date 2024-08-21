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
        speechSynthesis.cancel();
      });
    }
    this.settingsElm.addEventListener('click', function() {
      that.pageData = '';
      that.setPageName();
      window.location.reload(false);
      speechSynthesis.cancel();
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

  DataManagement.prototype.saveData = function(aIndex, aEn, aSlashEn, aJp, aSlashJp, aNote, aPath) {
    for(let cnt=0,len=this.inputElms.length-2;cnt<len;++cnt) {
      if(!this.inputElms[cnt].value) {
        return;
      }
    }
    let id = (aIndex=='n') ? this.sentencesData.size+1 : parseInt(aIndex);
    let numArray = this.inputElms[0].value.split(' ');
    this.sentencesData.set(id, { en:aEn, slashEn:aSlashEn, jp:aJp, slashJp:aSlashJp, note:aNote, path:aPath, num:numArray.length});
    localStorage.setItem('sentencesData', JSON.stringify([...this.sentencesData]));
    window.location.reload(false);
  };

  DataManagement.prototype.setEvent = function() {
    let that = this;
    this.saveBtnElm.addEventListener('click', function() {
      that.saveData(this.dataset.index, that.inputElms[0].value, that.inputElms[1].value, that.inputElms[2].value, that.inputElms[3].value, that.inputElms[4].value, that.inputElms[5].value);
    });
    let id = 0;
    let selectedData = new Map();
    for(let cnt=0,len=this.listLiElms.length;cnt<len;++cnt) {
      this.listLiElms[cnt].addEventListener('click', function() {
        id = this.dataset.index;
        selectedData = that.sentencesData.get(parseInt(id));
        that.inputElms[0].value = selectedData.en;
        that.inputElms[1].value = selectedData.slashEn;
        that.inputElms[2].value = selectedData.jp;
        that.inputElms[3].value = selectedData.slashJp;
        that.inputElms[4].value = selectedData.note;
        that.inputElms[5].value = selectedData.path;
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
    this.speedreadingBtnElm = document.querySelector('.js-speedreadingBtn');
    this.speedreadingWpmElm = document.querySelector('.js-speedreadingWpm');
    this.speedreadingWpmSelectElm = this.speedreadingWpmElm.querySelector('select');

    this.startTime = 0;
    this.wpm = 0;
    // speed reading

    // typing
    this.typingTextElm = document.querySelector('.js-typingText');
    // typing

    // writing
    this.writingTextElm = document.querySelector('.js-writingText');
    this.writingInputElm = document.querySelector('.js-writingInput');
    this.writingBtnElm = document.querySelector('.js-writingBtn');
    // writing

    // dictation
    this.dictationBtnElm = document.querySelector('.js-dictationBtn');
    this.dictationResultBtnElm = document.querySelector('.js-dictationResultBtn');
    this.dictationSelectLangElm = document.querySelector('.js-dictationSelectLang');
    this.dictationSelectRateElm = document.querySelector('.js-dictationSelectRate');
    this.dictationSectionElms = document.querySelectorAll('.js-dictationSection');
    this.dictationVideoElm = document.querySelector('.js-dictationVideo');
    // dictation
  };

  Enhancer.prototype.getRandomIndexArray = function(aLength) {
    let len = aLength;
    let array = [];
    for(let cnt=0;cnt<len;++cnt) {
      array[cnt] = cnt;
    }
    for(let cnt=len-1;cnt>0;--cnt) {
      const random = Math.floor(Math.random()*(cnt+1));
      [array[cnt],array[random]] = [array[random],array[cnt]];
    }
    return array;
  };

  Enhancer.prototype.showSentence = function() {
    this.sentenceDataArray = [...this.sentencesData];
    this.randomIndexArray = this.getRandomIndexArray(this.sentenceDataArray.length);
    let initialSentenceData = this.sentenceDataArray[this.randomIndexArray[0]][1];

    if(this.pageData=='speedreading') {
      this.speedreadingTextElm.innerHTML = '<p class="main__text">' + initialSentenceData.en + '</p>';  
    }
    else if(this.pageData=='typing') {
      this.typingTextElm.innerHTML = '<p>英文を訳しながらタイピングしましょう。<br>キーボードのキーを押すとスタートします。</p>';
    }
    else if(this.pageData=='writing') {
      note = (initialSentenceData.note) ? '<p class="main__note">ヒント：' + initialSentenceData.note + '</p>' : '';
      this.writingTextElm.innerHTML = '<p class="main__text">' + initialSentenceData.jp + '</p>';  
    }
    else if(this.pageData=='dictation') {
      this.dictationAudioType = 'path';
      this.dictationSectionElms[0].classList.remove('disp--none');
      this.dictationSectionElms[1].classList.add('disp--none');
      if(initialSentenceData.path) {
        this.dictationVideoElm.innerHTML = '<source src="' + initialSentenceData.path + '" type="video/mp4">';
      }
    }
  };

  Enhancer.prototype.setEvent = function() {
    let that = this;
    let div = document.createElement('div');
    let currentSentenceData = '';
    let note = '';
    let cnt = 0;
    let wpm = 0;
    if(this.pageData=='speedreading') {
      this.speedreadingBtnElm.addEventListener('click', function() {
        if(!cnt) {
          that.speedreadingTextElm.classList.remove('disp--none');
          that.speedreadingWpmElm.classList.add('disp--none');
          wpm = that.speedreadingWpmSelectElm.value;
        }
        if(cnt%2) {
          let timeTaken = (Date.now()-this.startTime)/1000;
          currentSentenceData = that.sentenceDataArray[that.randomIndexArray[((cnt+1)/2)-1]][1];
          this.wpm = currentSentenceData.num/timeTaken*60;
          let wpmComment = (this.wpm>=wpm) ? '目標達成！': 'もう少し頑張ろう！';
          that.speedreadingTextElm.innerHTML = '<p class="main__text">' + currentSentenceData.en + '</p>';
          note = (currentSentenceData.note) ? '<p class="main__note">' + currentSentenceData.note + '</p>' : '';
          div.innerHTML = '<p class="main__note">' + currentSentenceData.slashEn + '<br>' + currentSentenceData.slashJp + '</p>' + note + '<p class="main__note">' + currentSentenceData.jp + '</p><p class="main__note">単語数：' + currentSentenceData.num + '語　かかった時間：' + timeTaken + '秒　WPM：' + Math.round(this.wpm) + '（' + wpmComment + '）</p>';
          that.speedreadingTextElm.appendChild(div);
          that.speedreadingBtnElm.innerHTML = '次の文章';
        }
        else {
          that.speedreadingTextElm.innerHTML = '<p class="main__text">' + that.sentenceDataArray[that.randomIndexArray[(cnt/2)]][1].en + '</p>';
          that.speedreadingBtnElm.innerHTML = '読了';
          this.startTime = Date.now();
        }
        ++cnt;
      });
    }
    else if(this.pageData=='typing') {
      let currentIndex = 0;
      currentSentenceData = this.sentenceDataArray[this.randomIndexArray[currentIndex]][1];
      note = (currentSentenceData.note) ? '<p class="main__note">' + currentSentenceData.note + '</p>' : '';
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
        div.innerHTML = '<p class="main__note">' + currentSentenceData.slashJp + '</p>' + note + '<p class="main__note">' + currentSentenceData.jp + '</p>';
        this.typingTextElm.appendChild(div);
      }
      window.addEventListener('keydown', typing);
    }
    else if(this.pageData=='writing') {
      this.writingBtnElm.addEventListener('click', function() {
        ++cnt;
        if(cnt%2) {//result
          currentSentenceData = that.sentenceDataArray[that.randomIndexArray[((cnt+1)/2)-1]][1];
          that.writingTextElm.innerHTML = '<p class="main__text">' + currentSentenceData.jp + '</p>';
          div.innerHTML = '<p class="main__text">' + currentSentenceData.en + '</p>';
          that.writingBtnElm.before(div);
          this.innerHTML = '次へ';
        }
        else {
          currentSentenceData = that.sentenceDataArray[that.randomIndexArray[(cnt/2)]][1];
          note = (currentSentenceData.note) ? '<p class="main__note">ヒント：' + currentSentenceData.note + '</p>' : '';
          that.writingTextElm.innerHTML = '<p class="main__text">' + currentSentenceData.jp + '</p>' + note;
          that.writingInputElm.value = '';
          div.innerHTML = '';
          this.innerHTML = '確認';
        }
      });
    }
    else if(this.pageData=='dictation') {
      currentSentenceData = this.sentenceDataArray[this.randomIndexArray[0]][1];
      let dictationNavElms = document.querySelectorAll('.js-dictationNav li');
      if(currentSentenceData.path) {
        for(let cnt=0;cnt<2;++cnt) {
          dictationNavElms[cnt].addEventListener('click', function() {
            that.dictationAudioType = event.target.dataset.type;
            if(that.dictationAudioType=='path') {
              that.dictationSectionElms[0].classList.remove('disp--none');
              that.dictationSectionElms[1].classList.add('disp--none');
            }
            else {
              that.dictationSectionElms[0].classList.add('disp--none');
              that.dictationSectionElms[1].classList.remove('disp--none');
            }
          });
        }
      }
      else { //pathがない時はナビを表示しない
        this.dictationSectionElms[0].classList.add('disp--none');
        this.dictationSectionElms[1].classList.remove('disp--none');
        dictationNavElms[0].parentNode.classList.add('disp--none');
      }

      let isPlaying = false;
      let isInitial = true;
      let audio = new SpeechSynthesisUtterance(currentSentenceData.en);
      this.dictationBtnElm.addEventListener('click', function() {
        isPlaying = !isPlaying;
        if(isInitial) {
          isInitial = false;
          this.innerHTML = '一時停止';
          speechSynthesis.cancel();
          audio = new SpeechSynthesisUtterance(currentSentenceData.en);
          audio.lang = that.dictationSelectLangElm.value;
          audio.rate = that.dictationSelectRateElm.value;
          speechSynthesis.speak(audio);
        }
        else {
          if(isPlaying) {
            this.innerHTML = '一時停止';
            speechSynthesis.resume();
          }
          else {
            this.innerHTML = '再開';
            speechSynthesis.pause();
          }
        }
        audio.onend = function() {
          that.dictationBtnElm.innerHTML = '音声スタート';
          isInitial = true;
        };
      });

      this.dictationResultBtnElm.addEventListener('click', function() {
        if(cnt%2) {
          currentSentenceData = that.sentenceDataArray[that.randomIndexArray[cnt]][1];
          this.innerHTML = '確認';
          div.remove();
          isInitial = true;
          speechSynthesis.cancel();
          that.dictationBtnElm.innerHTML = '音声スタート';
          if(currentSentenceData.path) {
            that.dictationVideoElm.innerHTML = '<source src="' + currentSentenceData.path + '" type="video/mp4">';
            if(that.dictationAudioType=='path') {
              that.dictationSectionElms[0].classList.remove('disp--none');
              that.dictationSectionElms[1].classList.add('disp--none');
            }
            else {
              that.dictationSectionElms[0].classList.add('disp--none');
              that.dictationSectionElms[1].classList.remove('disp--none');
            }
            dictationNavElms[0].parentNode.classList.remove('disp--none');
          }
          else {
            that.dictationSectionElms[0].classList.add('disp--none');
            that.dictationSectionElms[1].classList.remove('disp--none');
            dictationNavElms[0].parentNode.classList.add('disp--none');
          }
        }
        else {
          div.innerHTML = '<p class="main__note">' + currentSentenceData.en + '</p><p class="main__note">' + currentSentenceData.jp + '</p>';
          this.before(div);
          this.innerHTML = '次へ';
        }
        ++cnt;
      });
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