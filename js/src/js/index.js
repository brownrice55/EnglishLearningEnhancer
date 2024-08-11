(function() {
  'use strict';

  const Activation = function() {
    this.initialize.apply(this, arguments);
  };

  Activation.prototype.initialize = function() {
    this.section = document.querySelectorAll('section');
    this.pageData = localStorage.getItem('pageData') || '';
  };

  Activation.prototype.selectPage = function() {
    if(this.pageData) {
      const pageNameArray = ['speedreading', 'typing', 'dictation'];
      for(let cnt=0,len=pageNameArray.length;cnt<len;++cnt) {
        if(this.pageData==pageNameArray[cnt]) {
          let pageElms = document.querySelector('.js-' + pageNameArray[cnt]);
          pageElms[cnt].classList.remove('disp--none');  
        }  
      }
    }
    else { //initial
      let initialPageElm = document.querySelector('.js-registration');
      initialPageElm.classList.remove('disp--none');
    }
  };

  Activation.prototype.setEvent = function() {
    for(let cnt=0,len=this.section.length;cnt<len;++cnt) {
      this.section[cnt].classList.add('disp--none');
    }
    this.selectPage();
  };

  Activation.prototype.run = function() {
    this.setEvent();
  };

  const DataManagement = function() {
    this.initialize.apply(this, arguments);
  };

  DataManagement.prototype.initialize = function() {
    this.saveBtnElm = document.querySelector('.js-save');
    this.listElm = document.querySelector('.js-list');
    this.sentencesData = new Map();
    let sentencesData = localStorage.getItem('sentencesData');
    if(sentencesData!=='undefined') {
      const sentencesDataJson = JSON.parse(sentencesData);
      this.sentencesData = new Map(sentencesDataJson);
    }
    this.showList();
  };

  DataManagement.prototype.showList = function() {
    let showList = '';
    this.sentencesData.forEach((value, key) => {
      showList += '<li data-index="' + key + '">' + value.en + '</li>';
    });
    this.listElm.innerHTML = showList;
  };

  DataManagement.prototype.saveData = function(aEn, aJp, aPath, aNum) {
    this.sentencesData.set((this.sentencesData.size+1), { en:aEn, jp:aJp, path:aPath, num:aNum});
    localStorage.setItem('sentencesData', JSON.stringify([...this.sentencesData]));
    this.showList();
  };

  DataManagement.prototype.setEvent = function() {
    let that = this;
    this.saveBtnElm.addEventListener('click', function() {
      let inputElms = document.querySelectorAll('.js-input');
      for(let cnt=0,len=inputElms.length-1;cnt<len;++cnt) {
        if(!inputElms[cnt].value) {
          return;
        }
      }
      let numArray = inputElms[0].value.split('');
      that.saveData(inputElms[0].value, inputElms[1].value, inputElms[2].value, numArray.length);
      for(let cnt=0,len=inputElms.length;cnt<len;++cnt) {
        inputElms[cnt].value = '';
      }
    });
  };

  DataManagement.prototype.run = function() {
    this.setEvent();
  };

  window.addEventListener('DOMContentLoaded', function() {
    let activation = new Activation();
    activation.run();

    let dataManagement = new DataManagement();
    dataManagement.run();
  });

}());