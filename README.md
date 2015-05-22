# jQuery-Form-Submit-Plugin

  A simple backend messages handler for HTML forms.
  Requires jQuery and jQuery-ujs libs to be loaded before it.
  Currently this jQuery plugin works in Ruby on Rails environment becouse of the jQuery-ujs lib available in Ruby on Rails.

## Installation

  ```ruby
  //= require jquery
  //= require jquery_ujs
  //= require 'path/to/handle.submit.feedback.js'
  ```

## Description
  The plugin provides `handleSubmitFeedback()` method with `options` as parameter.
  
  `options` keys

    fnPrepareCB: function() { // Specify some special preparation on load }
    fnStatusOkCB: function(response) { // Do stuff when AJAX succeeded with response.status = 'ok' }
    fnStatusNokCB: function(response) { // Do stuff when AJAX succeeded with response.status = 'nok' }
    fnAjaxErrorCB: function(event, data, status, xhr) { // Handle AJAX failure }
    reloadPage: // Boolean flag to reload current page when AJAX succeeded and response.status = 'ok'
    redirect: // Boolean flag to redirect to response.url(by default) when AJAX succeeded and response.status = 'ok'
  
  Callback functions will be called on jQuery object of form.
  Feel free to use `this` in callbacks as form jQuery object reference.


## Preparation
  At first need to make jquery-ujs working on forms by adding data-remote attribute.
  Put your inputs in kind of the form groups and give some CSS class to form groups
  because of backend error messages will be appended to corresponding input form group.

  ```html
    <form action="ACTION" data-remote="true" method="METHOD" role="form"> 

      <div class="FORM-GROUP">
        <label for="input-name">A descriptive description for input</label>
        <input id="input-id" class="awesome-styling" name="input-name" type="text">
      </div>

      <!-- and so on like above -->
    </form>
  ```

## Backend requirements

  Requested action should return JSON object.

  when there are errors to show
  ```javascript
  {
    status: 'nok'
    DATA_KEY: {
      INPUT1_NAME_OR_ID: 'error',
      INPUT2_NAME_OR_ID: ['error', 'another error for this input'],
      ...
    }
  }
  ```
  when everything is ok
  ```javascript
  {
    status: 'ok',
    REDIRECT_URL_KEY: 'some/url', // if need redirection
    ... // data you want to pass to view
  }
  ```

## Configuration

  It's possible to manage response JSON data keys and HTML parts unless you want to use this defaults.

  ```javascript
  // The errors data key name. See `DATA_KEY` in above response example
  $.submitHandler.dataKey: 'errors';
  
  // The key of redirect url in response JSON. See `REDIRECT_URL_KEY` above
  $.submitHandler.redirectURLKey: 'url';
  
  // CSS class of form group. See `FORM-GROUP` above HTML example
  $.submitHandler.formGroup.cssClass: 'form-group';
  
  // Error indicator CSS class of form group
  $.submitHandler.formGroup.errorClass: 'has-error';
  
  // Added label CSS class
  $.submitHandler.formGroup.errorLabelClass: 'error-label';
  ```

  Change this values globally in the begining of your JS file or locally before each plugin use.

## Usage

  After all preparations and desired configuration enjoy forms error handling :)

  ```javascript
  $('an-awesome-form').handleSubmitFeedback({
    fnPrepareCB: function() { // Some useful preparation },
    redirect: true // If you need of course
  });

  $('another-awesome-form').handleSubmitFeedback({
    fnStatusOkCB: function(response) {
      // For example empty form inputs and offer user do add one more item
      this.find('input').val('');
      this.find('button[type=submit]').text('Add another ITEM');
      // `this` will reffer to current form jQuery object
    }
  });

  // If you form is on a popup dialog and need to refresh current page to see added item
  $('form').handleSubmitFeedback({reloadPage: true});
  ```

## Authors

  [Meliq Pilosyan](https://github.com/melopilosyan)
