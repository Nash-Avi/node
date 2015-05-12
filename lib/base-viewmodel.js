var merge = require('merge');

function BaseViewModel(req, customData) {
  this.messages = {
    success: null,
    error: null,
    info: null
  }

  if(req.session && req.session.successMessage) {
    this.messages.success = req.session.successMessage;
    delete req.session.successMessage;
  }

  merge(this, customData);
}

module.exports = BaseViewModel;
