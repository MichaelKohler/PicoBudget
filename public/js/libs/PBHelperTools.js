"use strict";

  var PBHelperTools = {

    addTransactionListeners: function pb_addTransactionListeners() {
      $('#addtransactionform').get(0).addEventListener('onsubmit', function() {
        PBHelperTools.validateAddTransaction();
      });
    },

    toggleTransactionNavigationTabs: function pb_toggleTransactionNavigationTabs() {
      $('#new').hide();
      $('#tags').hide();
      $('#overviewlink').addClass('active');

      $('#overviewlink').click(function (e) {
        e.preventDefault();
        $('#new').hide();
        $('#newlink').removeClass('active');
        $('#tags').hide();
        $('#tagslink').removeClass('active');
        $('#overview').show();
        $('#overviewlink').addClass('active');
      });
      $('#newlink').click(function (e) {
        e.preventDefault();
        $('#overview').hide();
        $('#overviewlink').removeClass('active');
        $('#tags').hide();
        $('#tagslink').removeClass('active');
        $('#new').show();
        $('#newlink').addClass('active');
      });
      $('#tagslink').click(function (e) {
        e.preventDefault();
        $('#overview').hide();
        $('#overviewlink').removeClass('active');
        $('#new').hide();
        $('#newlink').removeClass('active');
        $('#tags').show();
        $('#tagslink').addClass('active');
      });
    },

    validateAddTransaction: function pb_validateTransaction() {
      var state = true;

      if ($('#transNameInput').val() ===  '') {
        $('#cg-name').addClass('error');
        state = false;
      } else {
        $('#cg-name').removeClass('error');
      }

      if ($('#transAmountInput').val() ===  '' || isNaN($('#transAmountInput').val())) {
        $('#cg-transamount').addClass('error');
        state = false;
      } else {
        $('#cg-transamount').removeClass('error');
      }

      if (!state) {
        $('#fillInAllInfo').show();
      }

      return state;
    },

    toggleAccountNavigationTabs: function pb_toggleAccountNavigationTabs() {
      $('#new').hide();
      $('#overviewlink').addClass('active');

      $('#overviewlink').click(function (e) {
        e.preventDefault();
        $('#new').hide();
        $('#newlink').removeClass('active');
        $('#overviewlink').addClass('active');
        $('#overview').show();
        $('#overviewlink').addClass('active');
      });
      $('#newlink').click(function (e) {
        e.preventDefault();
        $('#overview').hide();
        $('#overviewlink').removeClass('active');
        $('#new').show();
        $('#newlink').addClass('active');
      });
    },

    addAccountListeners: function pb_addAccountListeners() {
      document.getElementById('editaccountform').addEventListener('onsubmit', function() {
        PBHelperTools.validateEditAccount();
      });
      document.getElementById('addaccountform').addEventListener('onsubmit', function() {
        PBHelperTools.validateAddAccount();
      });
    },

    toggleAccountMode: function pb_toggleAccountMode() {
      // EDIT MODE
      if ($.getUrlVar('editAccount') === 'true') {
        $('#hiddenOldName').val($.getUrlVar('n'));
        $('#editNameInput').val($.getUrlVar('n'));
        $('#editInitBalanceInput').val($.getUrlVar('b'));
      }

      // DELETE MODE
      if ($.getUrlVar('deleteAccount') === 'true') {
        $('#deleteNameInput').val($.getUrlVar('n'));
      }
    },

    validateAddAccount: function pb_validateAddAccount() {
      // validate add account form
      var state = true;

      if ($('#nameInput').val() ===  '') {
        $('#cg-name').addClass('error');
        state = false;
      } else {
        $('#cg-name').removeClass('error');
      }

      if ($('#initBalanceInput').val() ===  '' || isNaN($('#initBalanceInput').val())) {
        $('#cg-initialbalance').addClass('error');
        state = false;
      } else {
        $('#cg-initialbalance').removeClass('error');
      }

      if (!state) {
        $('#fillInAllInfo').removeClass('hidden'); // not all info entered -> show error
      }

      return state;
    },

    validateEditAccount: function pb_validateEditAccount() {
      var state = true;

      if ($('#editNameInput').val() ===  '') {
        $('#cg-editname').addClass('error');
        state = false;
      } else {
        $('#cg-editname').removeClass('error');
      }

      if ($('#editInitBalanceInput').val() ===  '' || isNaN($('#editInitBalanceInput').val())) {
        $('#cg-editinitialbalance').addClass('error');
        state = false;
      } else {
        $('#cg-editinitialbalance').removeClass('error');
      }

      if (!state) {
        $('#fillInAllInfo').removeClass('hidden'); // not all info entered -> show error
      }

      return state;
    },

    validateLogin: function pb_validateLogin() {
      var state = true;

      if ($('#emailInput').val() === '') {
        $('#cg-email').addClass('error');
        state = false;
      } else {
        $('#cg-email').removeClass('error');
      }

      if ($('#passwordInput').val() === '') {
        $('#cg-password').addClass('error');
        state = false;
      } else {
        $('#cg-password').removeClass('error');
      }

      if (!state) {
        $('#fillInAllInfo').removeClass('hidden');
      }

      return state;
    },

    validateRegistration: function pb_validateRegistration() {
      var state = true;

      if ($('#emailInputReg').val() === '') {
        $('#cg-email-reg').addClass('error');
        state = false;
      } else {
        $('#cg-email-reg').removeClass('error');
      }

      if ($('#passwordInputReg').val() === '' || $('#passwordInputReg').val() !== $('#passwordConfirmInputReg').val()) {
        state = false;
        $('#passwordsDidntMatch').removeClass('hidden');
        $('#cg-password-reg').addClass('error');
        $('#cg-passwordconfirm-reg').addClass('error');
      } else {
        $('#cg-password-reg').removeClass('error');
        $('#cg-passwordconfirm-reg').removeClass('error');
      }

      if (!state) {
        $('#fillInAllInfo').removeClass('hidden');
      }

      return state;
    },

    validateSettings: function pb_validateSettings() {
      var state = true;

      if ($('#newPasswordInput').val() !== '' && $('#oldPasswordInput').val() !== '' &&
          $('#confirmNewPasswordInput').val() !== '') {
        $('#fillInAllInfo').addClass('hidden');
        if ($('#newPasswordInput').val() === $('#confirmNewPasswordInput').val()) {
          $('#passwordsDidntMatch').addClass('hidden');
        }
        else {
          state = false;
          $('#passwordsDidntMatch').removeClass('hidden');
          $('#newPasswordInput').addClass('error');
          $('#confirmNewPasswordInput').addClass('error');
        }
      }

      return state;
    }

  };
