var dom = require('./dom');
var domUtils = UE.dom.domUtils;
var utils = UE.utils;

function Revised(me) {
  var ANONYMOUS = 'anonymous';
  var __defaultOpt = {
    user: ANONYMOUS,
    users: {}
  };
  utils.extend(me.options.review, __defaultOpt, true);

  var __user = me.options.review.user;





  var __enter = function (evt) {
    domUtils.preventDefault(evt);

    me.fireEvent('saveScene');
    var rng = me.selection.getRange();
    var ins = dom.createIns(me.document, dom.createLBR(me.document), __user);
    rng.insertNode(ins);
    var p = domUtils.findParentByTagName(ins, 'P');
    ins = domUtils.breakParent(ins, p);
    var pprev = ins.previousSibling, pnext = ins.nextSibling;
    pprev.appendChild(ins);
    // if (domUtils.isEmptyNode(pnext)) {
    //   pnext.appendChild(me.document.createElement('BR'));
    // }
    // else if (__isLBR(pnext.firstChild)) {
    //   pnext.insertBefore(me.document.createTextNode(domUtils.fillChar), pnext.firstChild);
    // }
    // if (__isLBR(pprev.firstChild)) {
    //   pprev.insertBefore(me.document.createTextNode(domUtils.fillChar), pprev.firstChild);
    // }
    dom.fillEmptyNodes(me.document);

    rng.setStart(pnext.firstChild, 0).shrinkBoundary(true).setCursor(false, true);
    console.log(rng.createAddress());

    me.fireEvent('saveScene');
  };


  var __backspace = function(evt) {
    setTimeout(function(){
      dom.fillEmptyNodes(me.document);

    }, 200);
  };









  var __keydown = function (evt) {
    console.log('revised keydown', evt)
    var keyCode = evt.keyCode || evt.which;
    if (dom.isChar(evt)) {
      __char(evt);
    }
    else if (keyCode === 13) {
      __enter(evt);
    }
    else if (keyCode === 32) {
      __space(evt);
    }
    else if (keyCode === 8) {
      __backspace(evt);
    }
    else if (keyCode === 46) {
      __delete(evt);
    }
    else if (evt.ctrlKey && (keyCode === 66 || keyCode === 73 || keyCode === 85)) {
      // TODO 暂时屏蔽 ctrl+b ctrl+i ctrl+u
      domUtils.preventDefault(evt);
    }
  };

  var __compStart = function (evt) {

  };

  var __compEnd = function (evt) {

  };

  var __input = function (evt) {

  };

  var __copy = function (evt) {

  };

  var __cut = function (evt) {

  };

  var __paste = function (evt) {

  };


  this.isReviewEnabled = function () {
    return me && me.options && me.options.review && me.options.review.enable;
  };
  this.setReviewEnabled = function (enable) {
    if (me && me.options && me.options.review) {
      me.options.review.enable = enable;
      me.fireEvent('reviewEnableChanged', enable);
    }
  };


  var setupListeners = function () {
    me.body.addEventListener('keydown', __keydown, false);
    me.body.addEventListener('compositionstart', __compStart, false);
    me.body.addEventListener('compositionend', __compEnd, false);
    me.body.addEventListener('beforeinput', __input, false);
    me.body.addEventListener('copy', __copy, false);
    me.body.addEventListener('cut', __cut, false);
    me.body.addEventListener('paste', __paste, false);
    me.addListener('afterscencerestore', function () {
      dom.fillEmptyNodes(me.document);
    });
  };

  var removeListeners = function () {
    me.body.addEventListener('keydown', __keydown, false);
    me.body.addEventListener('compositionstart', __compStart, false);
    me.body.addEventListener('compositionend', __compEnd, false);
    me.body.addEventListener('beforeinput', __input, false);
    me.body.addEventListener('copy', __copy, false);
    me.body.addEventListener('cut', __cut, false);
    me.body.addEventListener('paste', __paste, false);
  };

  var rev = this;
  me.addListener('reviewEnableChanged', function (name, enable) {
    (enable ? setupListeners() : removeListeners());
  });
  me.addListener('ready', function () {
    (rev.isReviewEnabled() ? setupListeners() : removeListeners());
  });
}

var __cache = {};
/**
 * @returns {Revised}
 */
Revised.get = function (me) {
  return __cache[me.uid] || (__cache[me.uid] = new Revised(me));
};


/**
 * 工具条样式
 */
var CSS_REVIEW_TOOLBAR = '\
\
.edui-default .edui-toolbar .edui-button.edui-for-review-track-changes .edui-icon {\n\
  background: center/contain no-repeat url(./track-changes.svg) transparent;\n\
}\n\
span[br]:before {\n\
  content: \'\\21B5\';\n\
}\n\
\
';
/**
 * 标签样式
 */
var CSS_REVIEW_BASE = `
del,ins {
  position: relative;
}
del:hover:before,
ins:hover:before {
  position: fixed;
  left: 2px;
  bottom: 1px;
  background-color: rgba(0,0,0,0.6);
  color: white;
  padding: 3px 6px;
  font-size: xx-small;
}
del:hover:before {
  content: attr(cite)" 删除于 "attr(datetime);
}
ins:hover:before {
  content: attr(cite)" 添加于 "attr(datetime);
}
span.br:before {
  content: '\\21B5';
}
`;
/**
 * 硬编码覆盖UE的默认行为
 */
+function HARD_FIXED_UEDITOR_CONFIG() {
  // TODO
  UE.toolbars = [['FullScreen', 'undo', 'redo']];
  // TODO
  UE.plugins['font'] = function () { }
  UE.plugins['enterkey'] = function () { }
  UE.utils.extend(window.UEDITOR_CONFIG.whitList, {
    ins: ['cite', 'datetime'],
    del: ['cite', 'datetime'],
    span: ['contenteditable', 'class', 'style']
  }, false);
  // 工具条在当前`document`，不在`me.document`
  UE.utils.cssRule('review-track-buttons', CSS_REVIEW_TOOLBAR, document);
}();

/**
 * 插件
 */
UE.plugin.register('review', function () {
  var me = this;

  var setupStyles = function () {
    var review = UE.utils.extend(me.options.review, { users: {} }, true);
    var css = CSS_REVIEW_BASE + Array.prototype.map.call(Object.keys(review.users), function (userId) {
      var user = review.users[userId];
      return `ins[cite="${userId}"],\ndel[cite="${userId}"] {\n  color: ${user.color};\n}`;
    }).join('\n');
    UE.utils.cssRule('review-styles', css, me.document);
  };

  return {
    bindEvents: {
      'ready': function () {
        setupStyles();
        Revised.get(me);
      }
    },
    //  outputRule: function(root){
    //  },
    //  inputRule:function(root){
    //  },
    //  commands:{
    //      'anchor':{
    //          execCommand:function (cmd, name) {
    //          }
    //      }
    //  }
  }
});


/**
 * 修订按钮
 */
UE.registerUI('review-track-changes', function (editor, name) {
  var me = editor,
    rev = Revised.get(me),
    title = function (name) {
      switch (name) {
        case 'review-track-changes':
          return me.options.lang === "zh-cn" ? "修订" : "Track Changes";
      }
    },
    btn = new UE.ui.Button({
      name: name,
      title: title(name),
      cssRules: '',//'background-position: -500px 0;',
      onclick: function () {
        rev.setReviewEnabled(!rev.isReviewEnabled());
      }
    });
  editor.addListener('reviewEnableChanged ready', function () {
    btn.setDisabled(false);
    btn.setChecked(rev.isReviewEnabled());
  });
  return btn;
});

/**
 * 标记下拉框
 */
UE.registerUI('review-track-markup', function (editor, uiName) {
  var renderLabelHtml = function () {
    //这个是希望每个条目的字体是不同的
    return '<div class="edui-label %%-label" style="line-height:2;font-size:12px;">' + (this.label || '') + '</div>';
  };
  var items = [{
    label: '显示所有痕迹',
    value: 'All Markup',
    renderLabelHtml: renderLabelHtml
  }, {
    label: '不显示痕迹',
    value: 'No Markup',
    renderLabelHtml: renderLabelHtml
  }];
  // Object.keys(editor.options.review.users).forEach(userId => {
  //     var user = editor.options.review.users[userId];
  //     items.splice(items.length - 1, 0, {
  //         label: `${userId}的修改痕迹`,
  //         value: 'show_' + userId,
  //         renderLabelHtml: renderLabelHtml
  //     });
  // });

  combox = new UE.ui.Combox({
    editor: editor,
    items: items,
    onselect: function (t, index) {
      // editor.execCommand(uiName, this.items[index].value);
      // var val = this.items[index].value;
      // var rev = REV.getInstance(editor);
      // if (val === 'showAll') {
      //     rev.setRevisedVisible(true);
      // }
      // else if (val.startsWith('show_')) {
      //     var user = val.substring(5);
      //     rev.setRevisedVisible(user);
      // }
      // else {
      //     rev.setRevisedVisible(false);
      // }
    },
    title: '是否显示修改痕迹',
    initValue: 'All Markup'
  });
  return combox;
});

