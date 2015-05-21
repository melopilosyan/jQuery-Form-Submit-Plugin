/*****************************************************
*
*  jQuery Handle Form Submit Feedback Plugin v1.3.1
*  https://github.com/
*
*  Copyright 2015 Meliq Pilosyan
*  Released as open source
*
* This is a simple backend messages handler for HTML forms.
* It requires jquery and jquery_ujs libs
*****************************************************/

(function ($) { 'use strict';

    if($.submitHandler) {
        throw new Error('Warning: Javascript file is included twice: handle.submit.feedback.js');
    }

    $.submitHandler = {
        // The key in response JSON to handle as response messages.
        // The value should be a key/value object where the key will be the id or name of input
        // and the value is actual message or array of messages concerning with that input.
        // Default: 'errors'
        messagesObjectKey: 'errors',

        // The key of redirect url in response JSON
        redirectURLKey: 'url',

        // Form group is the first div element containing an input in form
        formGroup: {
            // CSS class of form group
            cssClass: 'form-group',
            // Error indicator CSS class of form group
            errorClass: 'has-error',
            // Error indicator CSS class of label
            errorLabelClass: 'error-label'
        }
    };

    // Void function for empty function reference
    function placebo() {}

    function makeCallbacksJqueryFunctions(jquery, options) {
        jquery.fn.prepare = typeof options.fnPrepareCB === 'function' ? options.fnPrepareCB : placebo;
        jquery.fn.onStatusOK = typeof options.fnStatusOkCB === 'function' ? options.fnStatusOkCB : placebo;
        jquery.fn.onStatusNok = typeof options.fnStatusNokCB === 'function' ? options.fnStatusNokCB : placebo;
        jquery.fn.onAjaxError = typeof options.fnAjaxErrorCB === 'function' ? options.fnAjaxErrorCB : ajaxErrorDefault;
    }

    function ajaxErrorDefault() {
        alert("Something went wrong during form submission\nIt would be better to contact with website support team.")
    }

    function addMsgLabel(formGroup, msg, forInput, displayBlock) {
        var style = displayBlock ? 'style="display:block"' : '';
        formGroup.addClass($.submitHandler.formGroup.errorClass).append('<label class="'+$.submitHandler.formGroup.errorLabelClass+'" for="'+forInput+'" '+style+'>'+msg+'</label>')
    }

    function showMessages(formGroup, messages, forInput) {
        if(typeof messages === 'string') {
            addMsgLabel(formGroup, messages, forInput)
        } else if(messages instanceof Array) {
            messages.forEach(function (message) {
                addMsgLabel(formGroup, message, forInput, true)
            })
        }
    }

    function cleanFormGroup(formGroup) {
        if(formGroup.hasClass($.submitHandler.formGroup.errorClass))
            formGroup.removeClass($.submitHandler.formGroup.errorClass).find('.'+$.submitHandler.formGroup.errorLabelClass).remove()
    }

    function cleanFormGroupOnInputInput(input, formGroup) {
        input.on('input paste', function () {
            cleanFormGroup(formGroup)
        })
    }

    function focusInputIf(input, firstInput) {
        if(firstInput) {
            input.select();
            firstInput = false
        }
    }

    function showResponseMessagesOn(form, messages) {
        var inputs = form.find('.'+$.submitHandler.formGroup.cssClass+' input'), firstInput = true;
        $.each(messages, function (inputKey, message) {
            inputs.each(function (i, _input) {
                var input = $(_input), id = input.attr('id');
                if(input.nameInclude(inputKey) || input.attr('id') === inputKey) {
                    var formGroup = input.closest('.'+$.submitHandler.formGroup.cssClass);
                    cleanFormGroup(formGroup);
                    showMessages(formGroup, message, id);
                    cleanFormGroupOnInputInput(input, formGroup);
                    focusInputIf(input, firstInput)
                }
            })
        })
    }

    function checkResponseFormat(response) {
        if(typeof response === 'object' && response.status && response[$.submitHandler.messagesObjectKey]) return true;
        throw new TypeError('AJAX response should be like {status: \'ok/nok\', errors: {INPUT_NAME: \'message to display\', ...}: handleSubmitFeedback');
    }

    // Maybe used during further development to check input name
    $.fn.nameInclude = function (s) {
        var name = this.attr('name');
        return (name ? (name.indexOf('['+s+']') !== -1 || name === s) : false)
    };

    /***
     * The plugin main method to register ajax event handlers on form element.
     *
     * Callback functions will called on jQuery object of form.
     * Feel free to use `this` in callbacks as form jQuery object reference.
     *
     * `options` keys:
     *      fnPrepareCB: function() { // Specify some special preparation on load }
     *      fnStatusOkCB: function(response) { // Calls when AJAX succeeded with response.status = 'ok' }
     *      fnStatusNokCB: function(response) { // Calls when AJAX succeeded with response.status = 'nok' }
     *      fnAjaxErrorCB: function(event, data, status, xhr) { // Calls when AJAX failed }
     *
     *      reloadPage: // Boolean flag to reload current page when AJAX succeeded and response.status = 'ok'
     *      redirect: // Boolean flag to redirect to response.url when AJAX succeeded and response.status = 'ok'. If this flag is set
     *
     * Usage:
     *
     *  $('form').handleSubmitFeedback({
     *      fnPrepareCB: function() { // Prepare form },
     *      reloadPage: true
     *  })
     */
    $.fn.handleSubmitFeedback = function (options) {
        if(this.length == 0) return false;

        var form = this.first();

        makeCallbacksJqueryFunctions($, options);

        // Make form first input focused
        form.find('input').filter(':visible:first').select();

        form.on('ajax:success', function (event, data, status, xhr) {
            checkResponseFormat(data);

            if (data.status === 'ok') {
                if(options.reloadPage === true) window.location = window.location;
                if(options.redirect === true) window.location = data[$.submitHandler.redirectURLKey];
                form.onStatusOK(data);
            } else {
                showResponseMessagesOn(form, data[$.submitHandler.messagesObjectKey]);
                form.onStatusNok(data);
            }
        }).on('ajax:error', function (event, data, status, xhr) {
            form.onAjaxError(event, data, status, xhr)
        }).prepare()
    }
}(jQuery));
