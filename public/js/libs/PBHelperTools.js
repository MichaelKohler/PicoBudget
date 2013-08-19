"use strict";

  var PBHelperTools = {

    // TRANSACTIONS
    // ===================
    toggleTransactionNavigationTabs: function pb_toggleTransactionNavigationTabs() {
      $('#new').hide();
      $('#transfer').hide();
      $('#tags').hide();
      $('#overviewlink').addClass('active');

      $('#overviewlink').click(function (e) {
        e.preventDefault();
        $('#new').hide();
        $('#newlink').removeClass('active');
        $('#transfer').hide();
        $('#transferlink').removeClass('active');
        $('#tags').hide();
        $('#tagslink').removeClass('active');
        $('#overview').show();
        $('#overviewlink').addClass('active');
      });
      $('#newlink').click(function (e) {
        e.preventDefault();
        $('#overview').hide();
        $('#overviewlink').removeClass('active');
        $('#transfer').hide();
        $('#transferlink').removeClass('active');
        $('#tags').hide();
        $('#tagslink').removeClass('active');
        $('#new').show();
        $('#newlink').addClass('active');
      });
      $('#transferlink').click(function (e) {
        e.preventDefault();
        $('#overview').hide();
        $('#overviewlink').removeClass('active');
        $('#new').hide();
        $('#newlink').removeClass('active');
        $('#tags').hide();
        $('#tagslink').removeClass('active');
        $('#transfer').show();
        $('#transferlink').addClass('active');
      });
      $('#tagslink').click(function (e) {
        e.preventDefault();
        $('#overview').hide();
        $('#overviewlink').removeClass('active');
        $('#transfer').hide();
        $('#transferlink').removeClass('active');
        $('#new').hide();
        $('#newlink').removeClass('active');
        $('#tags').show();
        $('#tagslink').addClass('active');
      });
    },

    validateAddTransaction: function pb_validateTransaction() {
      var state = true;

      if ($('#transNameInput').val() ===  '') {
        $('#cg-name').addClass('has-error');
        state = false;
      } else {
        $('#cg-name').removeClass('has-error');
      }

      if ($('#transAmountInput').val() ===  '' || isNaN($('#transAmountInput').val())) {
        $('#cg-transamount').addClass('has-error');
        state = false;
      } else {
        $('#cg-transamount').removeClass('has-error');
      }

      if (!state) {
        $('#fillInAllInfo').removeClass('hidden');
      }

      return state;
    },

    validateAddTransfer: function pb_validateAddTransfer() {
      // validate add transfer form
      var state = true;

      if ($('#transferAmountInput').val() ===  '' || isNaN($('#transferAmountInput').val())) {
        $('#cg-transferamount').addClass('has-error');
        state = false;
      } else {
        $('#cg-transferamount').removeClass('has-error');
      }

      return state;
    },

    validateAddTag: function pb_validateAddTag() {
      // validate add tag form
      var state = true;

      if ($('#tagNameInput').val() ===  '') {
        $('#cg-tagName').addClass('has-error');
        state = false;
      } else {
        $('#cg-tagName').removeClass('has-error');
      }

      return state;
    },

    // ACCOUNTS
    // ===================
    toggleAccountNavigationTabs: function pb_toggleAccountNavigationTabs() {
      $('#new').addClass('hidden');
      $('#overviewlink').addClass('active');

      $('#overviewlink').click(function (e) {
        e.preventDefault();
        $('#new').addClass('hidden');
        $('#newlink').removeClass('active');
        $('#overviewlink').addClass('active');
        $('#overview').removeClass('hidden');
        $('#overviewlink').addClass('active');
      });
      $('#newlink').click(function (e) {
        e.preventDefault();
        $('#overview').addClass('hidden');
        $('#overviewlink').removeClass('active');
        $('#new').removeClass('hidden');
        $('#newlink').addClass('active');
      });
    },

    toggleAccountMode: function pb_toggleAccountMode() {
      // EDIT MODE
      if ($.getUrlVar('editAccount') === 'true') {
        $('#accounttable').addClass('hidden');
        $('#hiddenOldName').val($.getUrlVar('n'));
        $('#editNameInput').val($.getUrlVar('n'));
        $('#editInitBalanceInput').val($.getUrlVar('b'));
      }
      else {
        $('#editaccounttitle').addClass('hidden');
        $('#editaccountform').addClass('hidden');
      }

      // DELETE MODE
      if ($.getUrlVar('deleteAccount') === 'true') {
        $('#accounttable').addClass('hidden');
        $('#deleteNameInput').val($.getUrlVar('n'));
      }
      else {
        $('#deleteaccounttitle').addClass('hidden');
        $('#deleteaccountform').addClass('hidden');
      }
    },

    validateAddAccount: function pb_validateAddAccount() {
      // validate add account form
      var state = true;

      if ($('#nameInput').val() ===  '') {
        $('#cg-name').addClass('has-error');
        state = false;
      } else {
        $('#cg-name').removeClass('has-error');
      }

      if ($('#initBalanceInput').val() ===  '' || isNaN($('#initBalanceInput').val())) {
        $('#cg-initialbalance').addClass('has-error');
        state = false;
      } else {
        $('#cg-initialbalance').removeClass('has-error');
      }

      if (!state) {
        $('#fillInAllInfo').removeClass('hidden'); // not all info entered -> show error
      }

      return state;
    },

    validateEditAccount: function pb_validateEditAccount() {
      var state = true;

      if ($('#editNameInput').val() ===  '') {
        $('#cg-editname').addClass('has-error');
        state = false;
      } else {
        $('#cg-editname').removeClass('has-error');
      }

      if ($('#editInitBalanceInput').val() ===  '' || isNaN($('#editInitBalanceInput').val())) {
        $('#cg-editinitialbalance').addClass('has-error');
        state = false;
      } else {
        $('#cg-editinitialbalance').removeClass('has-error');
      }

      if (!state) {
        $('#fillInAllInfo').removeClass('hidden'); // not all info entered -> show error
      }

      return state;
    },

    validateDeleteAccount: function pb_validateDeleteAccount() {
      // validate delete account form
      var state = true;

      if ($('#deleteNameInput').val() ===  '') {
        $('#cg-deletename').addClass('has-error');
        state = false;
      } else {
        $('#cg-deletename').removeClass('has-error');
      }

      return state;
    },

    // LOGIN / REGISTRATION
    // ===================
    validateLogin: function pb_validateLogin() {
      var state = true;

      if ($('#emailInput').val() === '') {
        $('#cg-email').addClass('has-error');
        state = false;
      } else {
        $('#cg-email').removeClass('has-error');
      }

      if ($('#passwordInput').val() === '') {
        $('#cg-password').addClass('has-error');
        state = false;
      } else {
        $('#cg-password').removeClass('has-error');
      }

      if (!state) {
        $('#fillInAllInfo').removeClass('hidden');
      }

      return state;
    },

    validateRegistration: function pb_validateRegistration() {
      var state = true;

      if ($('#emailInputReg').val() === '') {
        $('#cg-email-reg').addClass('has-error');
        state = false;
      } else {
        $('#cg-email-reg').removeClass('has-error');
      }

      if ($('#passwordInputReg').val() === '' || $('#passwordInputReg').val() !== $('#passwordConfirmInputReg').val()) {
        state = false;
        $('#passwordsDidntMatch').removeClass('hidden');
        $('#cg-password-reg').addClass('has-error');
        $('#cg-passwordconfirm-reg').addClass('has-error');
      } else {
        $('#cg-password-reg').removeClass('has-error');
        $('#cg-passwordconfirm-reg').removeClass('has-error');
      }

      if (!state) {
        $('#fillInAllInfo').removeClass('hidden');
      }

      return state;
    },

    validateForgotPassword: function pb_validateForgotPassword() {
      var state = true;

      if ($('#emailInput').val() === '') {
        $('#cg-email').addClass('has-error');
        state = false;
      } else {
        $('#cg-email').removeClass('has-error');
      }

      return state;
    },

    validateNewPassword: function pb_validateNewPassword() {
      var state = true;

      if ($('#passwordInput').val() === '' || $('#passwordInput').val() !== $('#confirmPasswordInput').val()) {
        state = false;
        $('#cg-password').addClass('has-error');
        $('#cg-confirmpassword').addClass('has-error');
      } else {
        $('#cg-password').removeClass('has-error');
        $('#cg-confirmpassword').removeClass('has-error');
      }

      return state;
    },

    // SETTINGS
    // ===================
    validateSettings: function pb_validateSettings() {
      var state = true;

      if ($('#newPasswordInput').val() !== '' && $('#oldPasswordInput').val() !== '' &&
          $('#confirmNewPasswordInput').val() !== '') {
        $('#fillInAllInfo').addClass('hidden');

        if ($('#newPasswordInput').val() === $('#confirmNewPasswordInput').val()) {
          $('#passwordsDidntMatch').addClass('hidden');
        }
        else {
          // the new passwords didn't match
          state = false;
          $('#passwordsDidntMatch').removeClass('hidden');
          $('#newPasswordInput').addClass('has-error');
          $('#confirmNewPasswordInput').addClass('has-error');
        }
      }
      else if ($('#newPasswordInput').val() !== '' && ($('#oldPasswordInput').val() === '' ||
        $('#confirmNewPasswordInput').val() === '')) { // new password is set, but not all info provided
        state = false;
        $('#cg-oldpassword').addClass('has-error');
        $('#cg-confirmnewpassword').addClass('has-error');
        $('#fillInAllInfo').removeClass('hidden');
      }

      return state;
    },

    // FIREFOX OS
    initInstall: function pb_initInstallation() {
      var installbutton = document.getElementById('installbutton');
      if (installbutton && window.navigator.mozApps) {
        installbutton.addEventListener('click', function() {
          installbutton.innerHTML = 'Installing..';
          var manifestUrl = 'http://localhost:1337/webapp/manifest.webapp';
          var request = window.navigator.mozApps.install(manifestUrl);
          request.onsuccess = function () {
            installbutton.parentNode.removeChild(installbutton);
          };
          request.onerror = function () {
            installbutton.innerHTML = 'Install failed ' + this.error.name;
          };
        });
      }
      else {
        installbutton.parentNode.removeChild(installbutton);
      }
    },

    // BUDGET
    toggleBudgetNavigationTabs: function pb_toggleBudgetNavigationTabs() {
      $('#spending').addClass('hidden');
      $('#earning').addClass('hidden');
      $('#overviewlink').addClass('active');

      $('#overviewlink').click(function (e) {
        e.preventDefault();
        $('#spending').addClass('hidden');
        $('#earning').addClass('hidden');
        $('#overview').removeClass('hidden');
        $('#earnniglink').removeClass('active');
        $('#spendinglink').removeClass('active');
        $('#overviewlink').addClass('active');
      });
      $('#earninglink').click(function (e) {
        e.preventDefault();
        $('#spending').addClass('hidden');
        $('#overview').addClass('hidden');
        $('#earning').removeClass('hidden');
        $('#overviewlink').removeClass('active');
        $('#spendinglink').removeClass('active');
        $('#earnniglink').addClass('active');
      });
      $('#spendinglink').click(function (e) {
        e.preventDefault();
        $('#earning').addClass('hidden');
        $('#overview').addClass('hidden');
        $('#spending').removeClass('hidden');
        $('#overviewlink').removeClass('active');
        $('#earnniglink').removeClass('active');
        $('#spendinglink').addClass('active');
      });
    }
  };
