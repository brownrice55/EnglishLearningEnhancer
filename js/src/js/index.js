(function() {
  'use strict';

  let sentencesDataGlobal = new Map();
  let sentencesDataAllGlobal = new Map();
  let sentencesDataCheckedGlobal = new Map();
  let sentencesData = localStorage.getItem('sentencesData');
  let allOrCheckedData = localStorage.getItem('allOrCheckedData') || 'all';

  if(sentencesData!=='undefined') {
    const sentencesDataJson = JSON.parse(sentencesData);
    sentencesDataAllGlobal = new Map(sentencesDataJson);
    let sentencesDataCheckedGlobalIdCnt = 0;
    sentencesDataAllGlobal.forEach((value, key) => {
      ++sentencesDataCheckedGlobalIdCnt;
      if(value.isChecked) {
        sentencesDataCheckedGlobal.set(sentencesDataCheckedGlobalIdCnt, { en:value.en, slashEn:value.slashEn, jp:value.jp, slashJp:value.slashJp, note:value.note, num:value.num, isChecked:value.isChecked});
      }
    });
    sentencesDataGlobal = (sentencesDataCheckedGlobal.size && (allOrCheckedData=='checked')) ? sentencesDataCheckedGlobal : sentencesDataAllGlobal;
  }

  let pageDataGlobal = localStorage.getItem('pageData') || '';
  let registrationTabDataGlobal = localStorage.getItem('registrationTabData') || 'new';
  const registrationContIndexArray = [[1,0],[0,1]];

  const registrationTabElmGlobal = document.querySelector('.js-registrationTab');
  const registrationTabLiElmsGlobal = registrationTabElmGlobal.querySelectorAll('li');
  const registrationContElmsGlobal = document.querySelectorAll('.js-registrationCont');
  const selectSentencesGrobal = document.querySelector('.js-selectSentences');

  const selectPage = (aPageData) => {
    const section = document.querySelectorAll('section');
    const selectSentences = selectSentencesGrobal;
    for(let cnt=0,len=section.length;cnt<len;++cnt) {
      section[cnt].classList.add('disp--none');
    }
    const pageNameArray = ['speedreading', 'typing', 'writing', 'dictation', 'registration', 'settings'];
    for(let cnt=0,len=pageNameArray.length;cnt<len;++cnt) {
      if(aPageData==pageNameArray[cnt]) {
        let pageElms = document.querySelector('.js-' + pageNameArray[cnt]);
        pageElms.classList.remove('disp--none');  
      }
    }
    if(aPageData=='registration' || aPageData=='settings') {
      selectSentences.parentNode.classList.add('disp--none');
    }
  };

  const getNote = (aCurrentSentenceNoteData, aNeedHint) => {
    if(!aCurrentSentenceNoteData) {
      return '';
    }
    let noteData = '';
    note = '';
    if(aCurrentSentenceNoteData) {
      let currentSentenceDataNoteArray = aCurrentSentenceNoteData.split(',');
      for(let cnt=0,len=currentSentenceDataNoteArray.length;cnt<len;++cnt) {
        if(currentSentenceDataNoteArray[cnt]) {
          note += currentSentenceDataNoteArray[cnt];
          if(currentSentenceDataNoteArray[cnt+1] && cnt) {
            note += '　';
          }
        }
      }
      let hint = (aNeedHint) ? 'ヒント：' : '';
      noteData = '<p class="main__note">' + hint + note + '</p>';
    }
    return noteData;
  };

  const Activation = function() {
    this.initialize.apply(this, arguments);
  };

  Activation.prototype.initialize = function() {
    this.sentencesData = sentencesDataGlobal;
    this.pageData = pageDataGlobal;
    this.headerElm = document.querySelector('.js-header');
    this.navLiElms = document.querySelectorAll('.js-nav li');
    this.registrationElm = document.querySelector('.js-registration');
    this.registrationTabElm = registrationTabElmGlobal;
    this.registrationTabLiElms = registrationTabLiElmsGlobal;
    this.registrationContElms = registrationContElmsGlobal;
    this.registrationTabData = registrationTabDataGlobal;
  };

  Activation.prototype.selectPage = function() {
    if(this.sentencesData.size) {
      this.pageData = (this.pageData) ? this.pageData : 'registration';
      selectPage(this.pageData);
      let cnt = (this.registrationTabData=='new') ? 0 : 1;
      this.registrationContElms[registrationContIndexArray[cnt][0]].classList.add('disp--none');
      this.registrationContElms[registrationContIndexArray[cnt][1]].classList.remove('disp--none');
      this.registrationTabLiElms[registrationContIndexArray[cnt][1]].classList.add('active');
      this.registrationTabLiElms[registrationContIndexArray[cnt][0]].classList.remove('active');
    }
    else { //initial
      const mainElm = document.querySelector('.js-main');
      mainElm.classList.add('main--initial');
      selectPage('registration');
      this.headerElm.classList.add('disp--none');
      this.registrationContElms[0].classList.remove('disp--none');
      this.registrationContElms[1].classList.add('disp--none');
      this.registrationTabElm.classList.add('disp--none');
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
  };

  Activation.prototype.run = function() {
    if(!this.sentencesData.size) {
      this.pageData = '';
    }
    this.selectPage();
    this.setEvent();
  };

  const DataManagement = function() {
    this.initialize.apply(this, arguments);
  };

  DataManagement.prototype.initialize = function() {
    this.saveBtnElm = document.querySelector('.js-save');
    this.cancelBtnElm = document.querySelector('.js-cancel');
    this.listElm = document.querySelector('.js-list');
    this.listTitleElm = document.querySelector('.js-listTitle');
    this.listTitleSpanElm = this.listTitleElm.querySelector('span');
    this.inputElms = document.querySelectorAll('.js-input');
    this.inputAlertElms = document.querySelectorAll('.js-inputAlert');
    this.settingsListElm = document.querySelector('.js-settingsList');
    this.settingsBtnElms = document.querySelectorAll('.js-settingsBtn button');

    this.sentencesData = sentencesDataAllGlobal;
    if(this.sentencesData.size) {
      this.showList();
    }

    this.registrationTabElm = registrationTabElmGlobal;
    this.registrationTabLiElms = registrationTabLiElmsGlobal;
    this.registrationContElms = registrationContElmsGlobal;
    this.registrationTabData = registrationTabDataGlobal;
  };

  DataManagement.prototype.getListData = function() {
    this.listDataRegister = '';
    this.listDataSettingsInitial = '';
    this.listDataSettingsClear = '';
    this.registerCnt = 0;
    let checked = '';
    this.sentencesData.forEach((value, key) => {
      this.listDataRegister += '<li data-index="' + key + '">' + value.en + '</li>';
      ++this.registerCnt;  
      checked = (value.isChecked) ? ' checked' : '';
      this.listDataSettingsInitial += '<li data-index="' + key + '"><label><input type="checkbox"' + checked + '> ' + value.en + '</label></li>';
      this.listDataSettingsClear += '<li data-index="' + key + '"><label><input type="checkbox"> ' + value.en + '</label></li>';
    });
  };

  DataManagement.prototype.showList = function() {
    this.getListData();
    this.listElm.innerHTML = this.listDataRegister;
    this.listTitleSpanElm.innerHTML = this.registerCnt + '件';
    this.listLiElms = document.querySelectorAll('.js-list li');

    this.settingsListElm.innerHTML = this.listDataSettingsInitial;
    this.settingsListInputElms = document.querySelectorAll('.js-settingsList input');
  };

  DataManagement.prototype.saveData = function(aIndex, aSlashEn, aJp, aSlashJp, aNote, aIsChecked) {
    let alertTextType1Array = ['スラッシュ付きの英文', '日本語訳', 'スラッシュ付きの日本語訳'];
    let alertTextType2 = '半角英数記号のみを入力してください。';
    let alertTextType3 = '英文とスラッシュ訳のスラッシュの数を同じにしてください。';
    let requiredLength = this.inputElms.length-2;
    let alertTextDataArray = ['', '', ''];
    let alertClassDataArray = [false, false, false];
    for(let cnt=0;cnt<requiredLength;++cnt) {
      this.inputAlertElms[cnt].innerHTML = '';
      this.inputElms[cnt].classList.remove('inputAlert');
      if(!this.inputElms[cnt].value) {
        alertTextDataArray[cnt] = alertTextType1Array[cnt] + 'を入力してください。';
        alertClassDataArray[cnt] = true;
      }
    }
    if(!(this.inputElms[0].value.match(/^[ -~-\r|\n|\r\n]*$/))) {
      alertTextDataArray[0] += alertTextDataArray[0] ? '<br>' + alertTextType2 : alertTextType2;
      alertClassDataArray[0] = true;
    }
    let inputMatchSlash0 = this.inputElms[0].value.match(/\//g);
    let inputMatchSlash2 = this.inputElms[2].value.match(/\//g);
    if(!(!inputMatchSlash0 && !inputMatchSlash2)) {
      let len0 = (inputMatchSlash0) ? inputMatchSlash0.length : 0;
      let len2 = (inputMatchSlash2) ? inputMatchSlash2.length : 0;
      if(len0!=len2) {
        alertTextDataArray[0] += alertTextDataArray[0] ? '<br>' + alertTextType3 : alertTextType3;
        alertTextDataArray[2] += alertTextDataArray[2] ? '<br>' + alertTextType3 : alertTextType3;
        alertClassDataArray[0] = true;
        alertClassDataArray[2] = true;
      }
    }
    for(let cnt=0,len=alertClassDataArray.length;cnt<len;++cnt) {
      if(alertClassDataArray[cnt]) {
        this.inputAlertElms[cnt].innerHTML = alertTextDataArray[cnt];
        this.inputElms[cnt].classList.add('inputAlert');
      }
    }
    if(alertClassDataArray.includes(true)) {
      return;
    }

    let id = (aIndex=='n') ? this.sentencesData.size+1 : parseInt(aIndex);
    let enSlashString = this.inputElms[0].value.replace(/\ \ /g, ' ');
    let enString = enSlashString.replace(/\ \/\ /g, ' ');
    let enStringArray = enString.split(' ');
    this.sentencesData.set(id, { en:enString, slashEn:enSlashString, jp:aJp, slashJp:aSlashJp, note:aNote, num:enStringArray.length, isChecked:aIsChecked});
    localStorage.setItem('sentencesData', JSON.stringify([...this.sentencesData]));
    localStorage.setItem('registrationTabData', this.registrationTabData);
    window.location.reload(false);
  };

  DataManagement.prototype.setInputElms = function(aInput0, aInput1, aInput2, aInput3, aInput4) {
    this.inputElms[0].value = aInput0;
    this.inputElms[1].value = aInput1;
    this.inputElms[2].value = aInput2;
    this.inputElms[3].value = aInput3;
    this.inputElms[4].value = aInput4;
  };

  DataManagement.prototype.setEvent = function() {
    let that = this;
    this.saveBtnElm.addEventListener('click', function() {
      that.saveData(this.dataset.index, that.inputElms[0].value, that.inputElms[1].value, that.inputElms[2].value, that.inputElms[3].value, that.inputElms[4].value);
    });
    if(!this.sentencesData.size) {
      return;
    }
    this.cancelBtnElm.addEventListener('click', function() {
      that.setInputElms('','','','','');
      that.registrationContElms[0].classList.add('disp--none');
      that.registrationContElms[1].classList.remove('disp--none');
      this.classList.add('disp--none');
    })
    let id = 0;
    let selectedData = new Map();
    for(let cnt=0,len=this.listLiElms.length;cnt<len;++cnt) {
      this.listLiElms[cnt].addEventListener('click', function() {
        that.registrationTabData = 'edit';
        id = this.dataset.index;
        selectedData = that.sentencesData.get(parseInt(id));
        that.setInputElms(selectedData.slashEn, selectedData.jp, selectedData.slashJp, selectedData.note, selectedData.isChecked);
        that.saveBtnElm.dataset.index = id;
        that.saveBtnElm.innerHTML = '上書き保存';
        that.cancelBtnElm.classList.remove('disp--none');
        that.registrationContElms[0].classList.remove('disp--none');
        that.registrationContElms[1].classList.add('disp--none');
      });
    }
    for(let cnt=0,len=this.registrationTabLiElms.length;cnt<len;++cnt) {
      this.registrationTabLiElms[cnt].addEventListener('click', function() {
        that.registrationContElms[registrationContIndexArray[cnt][0]].classList.add('disp--none');
        that.registrationContElms[registrationContIndexArray[cnt][1]].classList.remove('disp--none');
        that.registrationTabLiElms[registrationContIndexArray[cnt][1]].classList.add('active');
        that.registrationTabLiElms[registrationContIndexArray[cnt][0]].classList.remove('active');
        that.registrationTabData = (cnt) ? 'edit' : 'new';
        localStorage.setItem('registrationTabData', that.registrationTabData);
        if(that.registrationTabData=='new') {
          that.setInputElms('','','','','');
        }
      });
    }
    for(let cnt=0,len=this.settingsListInputElms.length;cnt<len;++cnt) {
      this.settingsListInputElms[cnt].addEventListener('click', function() {
        that.settingsBtnElms[0].parentNode.classList.remove('disp--none');
        id = this.parentNode.parentNode.dataset.index;
        selectedData = that.sentencesData.get(parseInt(id));
        that.sentencesData.set(parseInt(id), { en:selectedData.en, slashEn:selectedData.slashEn, jp:selectedData.jp, slashJp:selectedData.slashJp, note:selectedData.note, num:selectedData.num, isChecked:this.checked});
      });
    }
    // clear btn
    this.settingsBtnElms[0].addEventListener('click', function() {
      that.settingsListElm.innerHTML = that.listDataSettingsClear;
      that.settingsListInputElms = document.querySelectorAll('.js-settingsList input');

      let sentencesData = new Map();
      that.sentencesData.forEach((value, key) => {
        sentencesData.set(key, { en:value.en, slashEn:value.slashEn, jp:value.jp, slashJp:value.slashJp, note:value.note, num:value.num, isChecked:false});
      });
      that.sentencesData = sentencesData;
    });
    // settings btn
    this.settingsBtnElms[1].addEventListener('click', function() {
      localStorage.setItem('sentencesData', JSON.stringify([...that.sentencesData]));
    });
  };

  DataManagement.prototype.run = function() {
    this.setEvent();
  };

  const Enhancer = function() {
    this.initialize.apply(this, arguments);
  };

  Enhancer.prototype.initialize = function() {
    this.sentencesData = sentencesDataGlobal;
    this.pageData = pageDataGlobal;
    this.selectSentences = selectSentencesGrobal;
    let selectSentencesOptionIndex = (allOrCheckedData=='all') ? 0 : 1;
    this.selectSentences.options[selectSentencesOptionIndex].selected = true;
    if(!sentencesDataCheckedGlobal.size) {
      this.selectSentences.options[1].remove();
      localStorage.setItem('allOrCheckedData', 'all');
    }

    // speed reading
    this.speedreadingTextElm = document.querySelector('.js-speedreadingText');
    this.speedreadingBtnElm = document.querySelector('.js-speedreadingBtn');
    this.speedreadingCheckBtnElm = document.querySelector('.js-speedreadingCheckBtn');
    this.speedreadingWpmElm = document.querySelector('.js-speedreadingWpm');
    this.speedreadingWpmSelectElm = this.speedreadingWpmElm.querySelector('select');
    this.timeElm = document.querySelector('.js-time');

    this.startTime = 0;
    this.stopTime = 0;
    this.wpm = 0;
    this.selectedWpm = 0;
    this.timeTaken = (Date.now()-this.startTime)/1000;
    this.timerID = 0;
    // speed reading

    // typing
    this.typingTextElm = document.querySelector('.js-typingText');
    this.typingInitialElm = document.querySelector('.js-typingInitial');
    this.typingInitialCheckElm = this.typingInitialElm.querySelector('input');
    this.typingInitialBtnElm = this.typingInitialElm.querySelector('button');
    // typing

    // writing
    this.writingTextElm = document.querySelector('.js-writingText');
    this.writingInputElm = document.querySelector('.js-writingInput');
    this.writingBtnElm = document.querySelector('.js-writingBtn');
    // writing

    // dictation
    this.dictationBtnElms = document.querySelectorAll('.js-dictationBtns button');
    this.dictationBtnElm = this.dictationBtnElms[0];
    this.dictationPauseBtnElm = this.dictationBtnElms[1];
    this.dictationResumeBtnElm = this.dictationBtnElms[2];
    this.dictationResultBtnElm = document.querySelector('.js-dictationResultBtn');
    this.dictationSelectLangElm = document.querySelector('.js-dictationSelectLang');
    this.dictationSelectRateElm = document.querySelector('.js-dictationSelectRate');
    this.dictationInputElm = document.querySelector('.js-dictationInput');
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
      note = (initialSentenceData.note) ? getNote(initialSentenceData.note, true) : '';
      this.writingTextElm.innerHTML = '<p class="main__text">' + initialSentenceData.jp + '</p>';
    }
  };
  
  Enhancer.prototype.dictationDisplayOrNotSelects = function(aOnOff, aSpan) {
    let dictationH3Elms = document.querySelectorAll('.js-dictation h3');
    if(aOnOff) {
      this.selectSentences.parentNode.classList.remove('disp--none');
      this.dictationSelectLangElm.parentNode.classList.remove('disp--none');
      this.dictationSelectRateElm.parentNode.classList.remove('disp--none');
      dictationH3Elms[0].classList.remove('disp--none');
      dictationH3Elms[1].classList.remove('disp--none');
      aSpan.textContent = '-';
    }
    else {
      this.selectSentences.parentNode.classList.add('disp--none');
      this.dictationSelectLangElm.parentNode.classList.add('disp--none');
      this.dictationSelectRateElm.parentNode.classList.add('disp--none');
      dictationH3Elms[0].classList.add('disp--none');
      dictationH3Elms[1].classList.add('disp--none');
      aSpan.textContent = '+';
    }
  };

  Enhancer.prototype.setEvent = function() {
    let that = this;
    let div = document.createElement('div');
    this.currentSentenceData = '';
    let note = '';
    let cnt = 0;

    this.selectSentences.addEventListener('change', function() {
      if(this.value=='toSettings') {
        selectPage('settings');
      }
      else {
        localStorage.setItem('allOrCheckedData', this.value);
        window.location.reload(false);
      }
    });

    if(this.pageData=='speedreading') {
      this.currentSentenceData = this.sentenceDataArray[this.randomIndexArray[0]][1];

      const displayTimeAndWpm = () => {
        this.timeTaken = Date.now() - this.startTime;
        let currentTime = new Date(this.timeTaken + this.stopTime);
        let m = String(currentTime.getMinutes()).padStart(2, '0');
        let s = String(currentTime.getSeconds()).padStart(2, '0');
        let ms = String(currentTime.getMilliseconds()).padStart(3, '0');
        let wpmClass = (this.wpm>=this.selectedWpm) ? '' : ' class="alert"';
        this.wpm = Math.round(this.currentSentenceData.num/(this.timeTaken/1000)*60);
        this.timeElm.innerHTML = m + ':' + s + '.' + ms + '　<span' + wpmClass + '>WPM:' + this.wpm + '</span>';
        this.timerID = setTimeout(displayTimeAndWpm, 30);
      };

      this.speedreadingBtnElm.addEventListener('click', function() {
        if(!cnt) {
          that.speedreadingTextElm.classList.remove('disp--none');
          that.speedreadingWpmElm.classList.add('disp--none');
          that.selectedWpm = that.speedreadingWpmSelectElm.value;
        }
        if(cnt%2) {
          clearTimeout(that.timerID);
          let wpmComment = (that.wpm>=that.selectedWpm) ? '目標達成！': 'もう少し頑張ろう！';
          let indexCnt = ((cnt+1)/2)-1;
          if(that.sentenceDataArray.length == (indexCnt+1)) {
            that.randomIndexArray = that.getRandomIndexArray(that.sentenceDataArray.length);
            cnt = -1;
          }
          that.currentSentenceData = that.sentenceDataArray[that.randomIndexArray[indexCnt]][1];
          that.speedreadingTextElm.innerHTML = '<p class="main__text">' + that.currentSentenceData.en + '</p>';
          note = (that.currentSentenceData.note) ? getNote(that.currentSentenceData.note, false) : '';
          div.innerHTML = '<p class="main__note">' + that.currentSentenceData.slashEn + '<br>' + that.currentSentenceData.slashJp + '</p>' + note + '<p class="main__note">' + that.currentSentenceData.jp + '</p><p class="main__note">単語数：' + that.currentSentenceData.num + '語　かかった時間：' + that.timeTaken + '秒　WPM：' + that.wpm + '（' + wpmComment + '）</p>';
          that.speedreadingTextElm.appendChild(div);
          if(allOrCheckedData=='all') {
            that.speedreadingCheckBtnElm.classList.remove('disp--none');
          }
          that.speedreadingBtnElm.innerHTML = '次の文章';
          that.stopTime = Date.now() - that.startTime;
        }
        else { // start
          that.speedreadingTextElm.innerHTML = '<p class="main__text">' + that.sentenceDataArray[that.randomIndexArray[(cnt/2)]][1].en + '</p>';
          if(allOrCheckedData=='all') {
            that.speedreadingCheckBtnElm.classList.add('disp--none');
          }
          that.speedreadingBtnElm.innerHTML = '読了';
          that.startTime = Date.now();
          that.stopTime = 0;
          displayTimeAndWpm();
        }
        ++cnt;
      });
      this.speedreadingCheckBtnElm.addEventListener('click', function() {
        let id = that.sentenceDataArray[that.randomIndexArray[((cnt-2)/2)]][0];
        let value = that.sentenceDataArray[that.randomIndexArray[((cnt-2)/2)]][1];
        that.sentencesData.set(id, { en:value.en, slashEn:value.slashEn, jp:value.jp, slashJp:value.slashJp, note:value.note, num:value.num, isChecked:true});
        localStorage.setItem('sentencesData', JSON.stringify([...that.sentencesData]));
      });
    }
    else if(this.pageData=='typing') {

      let currentIndex = 0;
      this.currentSentenceData = this.sentenceDataArray[this.randomIndexArray[currentIndex]][1];
      note = getNote(this.currentSentenceData.note, false);
      let len = this.currentSentenceData.en.length;
      
      // slash
      let currentSlashEnArray = this.currentSentenceData.slashEn.split(' / ');
      let currentSlashJpArray = this.currentSentenceData.slashJp.split(' / ');
      let currentNoteArray = this.currentSentenceData.note.split(',');
      let slashSentenceCnt = 0;
      let slashSentenceLen = currentSlashEnArray[0].length;
      // slash

      let isChecked = false;
      this.typingInitialBtnElm.addEventListener('click', function() {
        isChecked = that.typingInitialCheckElm.checked;
        this.parentNode.classList.add('disp--none');
        that.typingTextElm.classList.remove('disp--none');
      });

      const typing = (event) => {
        let keyCode = event.key;
        let slashResult = '';
        const slashSentence = () => {
          if(!slashSentenceCnt || currentSlashEnArray[cnt].charAt(slashSentenceCnt)==keyCode) {
            if(currentSlashEnArray[cnt].charAt(slashSentenceCnt)==keyCode && keyCode!='duplication') {
              ++slashSentenceCnt;
              keyCode = 'duplication';
            }
            slashResult = '<p class="main__text">' + currentSlashEnArray[cnt].substring(slashSentenceCnt, slashSentenceLen) + '<br>';
            slashResult += currentSlashJpArray[cnt] + '</p>';
            note = getNote(currentNoteArray[cnt], false);
            this.typingTextElm.innerHTML = slashResult + note + '<p class="main__note">' + this.currentSentenceData.en + '<br>' + this.currentSentenceData.jp + '</p>';
          }
        };

        const getNextSentence = () => {
          if(this.sentenceDataArray.length==currentIndex+1) {
            this.randomIndexArray = this.getRandomIndexArray(this.sentenceDataArray.length);
            currentIndex = 0;
          }
          else {
            ++currentIndex;
          }
          cnt = 0;
          this.currentSentenceData = this.sentenceDataArray[this.randomIndexArray[currentIndex]][1];
        };

        if(isChecked) {
          slashSentence();
          if(!(slashSentenceLen-slashSentenceCnt)){//next index
            ++cnt;
            slashSentenceCnt = 0;
            if(currentSlashEnArray[cnt]) {
              slashSentenceLen = currentSlashEnArray[cnt].length;
              slashSentence();
            }
            else {
              getNextSentence();
              currentSlashEnArray = this.currentSentenceData.slashEn.split(' / ');
              currentSlashJpArray = this.currentSentenceData.slashJp.split(' / ');
              currentNoteArray = this.currentSentenceData.note.split(',');
              slashSentenceLen = currentSlashEnArray[cnt].length;
              slashSentence();  
            }
          }
        }
        else {
          if(!cnt) {
            note = getNote(this.currentSentenceData.note, false);
            this.typingTextElm.innerHTML = '<p class="main__text">' + this.currentSentenceData.en.substring(cnt, len) + '</p>';
            div.innerHTML = note + '<p class="main__note">' + this.currentSentenceData.jp + '</p>';
            this.typingTextElm.appendChild(div);
          }
          if(this.sentenceDataArray[this.randomIndexArray[currentIndex]][1].en.charAt(cnt)==keyCode) {
            ++cnt;
            if(!(len-cnt)){//next
              getNextSentence();
              len = this.currentSentenceData.en.length;
            }
            note = getNote(this.currentSentenceData.note, false);
            this.typingTextElm.innerHTML = '<p class="main__text">' + this.currentSentenceData.en.substring(cnt, len) + '</p>';
            div.innerHTML = note + '<p class="main__note">' + this.currentSentenceData.jp + '</p>';
            this.typingTextElm.appendChild(div);
          }
          else {//error
            return;
          }
        }
      }
      window.addEventListener('keydown', typing);
    }
    else if(this.pageData=='writing') {
      this.writingBtnElm.addEventListener('click', function() {
        ++cnt;
        if(cnt%2) {//result
          let indexCnt = ((cnt+1)/2)-1;
          that.currentSentenceData = that.sentenceDataArray[that.randomIndexArray[indexCnt]][1];
          that.writingTextElm.innerHTML = '<p class="main__text">' + that.currentSentenceData.jp + '</p>';
          div.innerHTML = '<p class="main__text">' + that.currentSentenceData.en + '</p>';
          that.writingBtnElm.before(div);
          this.innerHTML = '次へ';
          if(that.sentenceDataArray.length == (indexCnt+1)) {
            that.randomIndexArray = that.getRandomIndexArray(that.sentenceDataArray.length);
            cnt = -1;
            that.currentSentenceData = that.sentenceDataArray[that.randomIndexArray[indexCnt]][1];
          }
        }
        else {
          that.currentSentenceData = that.sentenceDataArray[that.randomIndexArray[(cnt/2)]][1];
          note = (that.currentSentenceData.note) ? getNote(that.currentSentenceData.note, true) : '';
          that.writingTextElm.innerHTML = '<p class="main__text">' + that.currentSentenceData.jp + '</p>' + note;
          that.writingInputElm.value = '';
          div.innerHTML = '';
          this.innerHTML = '確認';
        }
      });
    }
    else if(this.pageData=='dictation') {
      this.currentSentenceData = this.sentenceDataArray[this.randomIndexArray[0]][1];
      let audio = new SpeechSynthesisUtterance(this.currentSentenceData.en);

      const that = this;

      let span = document.createElement('span');
      span.className = 'js-dictationSettingsBtn main__settingsBtn disp--none';
      span.textContent = '-';
      let h1Elm = document.querySelector('.js-main h1');
      h1Elm.appendChild(span);

      this.dictationBtnElm.addEventListener('click', function() {
        audio = new SpeechSynthesisUtterance(that.currentSentenceData.en);
        audio.lang = that.dictationSelectLangElm.value;
        audio.rate = that.dictationSelectRateElm.value;

        span.classList.add('disp--none');
        that.dictationDisplayOrNotSelects(0, span);
        that.dictationResultBtnElm.disabled = false;

        speechSynthesis.cancel();
        speechSynthesis.speak(audio);
        this.disabled = true;
        that.dictationPauseBtnElm.disabled = false;
        audio.onend = () => {
          that.dictationBtnElm.disabled = false;
          that.dictationBtnElm.innerHTML = '音声スタート';
          that.dictationPauseBtnElm.disabled = true;
          that.dictationResumeBtnElm.disabled = true;
        };
      });

      this.dictationPauseBtnElm.addEventListener('click', function() {
        speechSynthesis.pause();
        this.disabled = true;
        that.dictationResumeBtnElm.disabled = false;
      });
      
      this.dictationResumeBtnElm.addEventListener('click', function() {
        speechSynthesis.resume();
        this.disabled = true;
        that.dictationPauseBtnElm.disabled = false;
      });

      this.dictationResultBtnElm.addEventListener('click', function() {
        if(cnt%2) {
          if(that.sentenceDataArray.length*2==cnt+1) {
            that.randomIndexArray = that.getRandomIndexArray(that.sentenceDataArray.length);
            cnt = -1;
          }
          that.currentSentenceData = that.sentenceDataArray[that.randomIndexArray[((cnt+1)/2)]][1];
          this.innerHTML = '確認';
          div.remove();
          speechSynthesis.cancel();
          that.dictationBtnElm.disabled = false;
          that.dictationPauseBtnElm.disabled = true;
          that.dictationResumeBtnElm.disabled = true;

          that.dictationInputElm.value = '';
          that.dictationResultBtnElm.disabled = true;

          span.classList.remove('disp--none');
          let isOn = true;
          span.addEventListener('click', function() {
            that.dictationDisplayOrNotSelects(isOn, span);
            isOn = !isOn;
          });
        }
        else {
          div.innerHTML = '<p class="main__note">' + that.currentSentenceData.en + '</p><p class="main__note">' + that.currentSentenceData.jp + '</p>';
          this.before(div);
          this.innerHTML = '次の問題へ';
        }
        ++cnt;
      });
    }
  };

  Enhancer.prototype.run = function() {
    if(this.sentencesData.size) {
      this.showSentence();
      this.setEvent();  
    }
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