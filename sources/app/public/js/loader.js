(function (page, Validatinator) {
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

  var form,
    fields,
    validatinator,
    fieldsConfig = {},
    validatinatorConfig = {},
    submitButtons = page.querySelectorAll('form button[type=submit]');
  Array.prototype.forEach.call(submitButtons, function (item) {
    form = item;
    // Find the form in parent DOM elements
    while (form.parentNode.nodeName.toLowerCase() !== 'form') {
      form = form.parentNode;
    }
    // Get the form DOM element
    form = form.parentNode;
    if (form) {
      // Get all form fields
      fields = page.querySelectorAll('form[name=' + form.getAttribute('name') + '] input');
      Array.prototype.forEach.call(fields, function (field) {
        // Validate only require fields
        if (field.getAttribute('required')) {
          fieldsConfig[field.getAttribute('name')] = 'required';
        }
      });
      validatinatorConfig[form.getAttribute('name')] = fieldsConfig;
      validatinator = new Validatinator(validatinatorConfig);
      // Bind validator with submit button
      item.addEventListener('click', function () {
        // If the form is valid
        if (validatinator.passes(form.getAttribute('name'))) {
          // Hide the submit button to avoid multiple submissions
          item.style.display = 'none';
          // Display loading text (or loader)
          item.insertAdjacentHTML('afterend', '<div id="p2" class="mdl-spinner mdl-js-spinner is-active"></div>');
        }
      });
    }
  });
}(document, Validatinator));
