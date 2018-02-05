(function (window, document, Array) {
  'use strict';
  // Old browser compatibility
  if (typeof Array.prototype.forEach !== 'function') {
    Array.prototype.forEach = function (callback) {
      var iterator;
      for (iterator = 0; iterator < this.length; iterator++) {
        callback.apply(this, [this[iterator], iterator, this]);
      }
    };
  }

  var searchbar = document.getElementById('search');
  var searching = function () {
    var elements    = document.querySelectorAll('.demo-cards');
    var searchTerm  = searchbar.value;
    Array.prototype.forEach.call(elements, function (card) {
      var searchTermContent = card.innerText || card.textContent;
      if (searchTermContent.toLowerCase().trim().indexOf(searchTerm.toLowerCase().trim()) > -1) {
        card.classList.remove('is-invisible');
      } else {
        card.classList.add('is-invisible');
      }
    });
  };

  var filtering = function (filteringTerm) {
    var elements    = document.querySelectorAll('.demo-cards');
    Array.prototype.forEach.call(elements, function (card) {
      var filteringTermContent = card.getAttribute('data-export').toLowerCase().split('|');
      if (filteringTermContent.indexOf(filteringTerm) >= 0) {
        card.classList.remove('is-invisible');
      } else {
        card.classList.add('is-invisible');
      }
    });
  };

  var keyword, badge;
  var searchTerms = document.querySelectorAll('.mdl-action--no-form button.mdl-js-button');
  Array.prototype.forEach.call(searchTerms, function (itemSearchTerm) {
    badge = 0;
    keyword = itemSearchTerm.innerText || itemSearchTerm.textContent;
    itemSearchTerm.addEventListener('click', function (button) {
      var keywordContent   = this.innerText || this.textContent;
      filtering(keywordContent.toLowerCase().trim());
    });
    var elements    = document.querySelectorAll('.demo-cards');
    Array.prototype.forEach.call(elements, function (card) {
      var cardTags = card.getAttribute('data-export').toLowerCase().split('|');
      if (cardTags.indexOf(keyword.toLowerCase().trim()) >= 0) {
        badge++;
      }
    });
    itemSearchTerm.querySelector('span').setAttribute('data-badge', badge);
  });

  searchbar.addEventListener('input', searching);
  if (window.location.hash) {
    // Get hash without # character
    searchbar.value = decodeURI(window.location.hash.substring(1));
    searching();
  }
}(window, document, Array));
