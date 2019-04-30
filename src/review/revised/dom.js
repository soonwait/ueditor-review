var utils = UE.utils;
var domUtils = UE.dom.domUtils;


/**
 * 当前按键是否输入字符
 * @param {KeyboardEvent} evt 
 * 
 * @returns {boolean}
 */
var __isChar = function (evt) {
  var keyCode = evt.keyCode || evt.which;

  var isChar =
    (keyCode > 47 && keyCode < 58) || // number keys
    // keyCode === 32 || keyCode === 13 || // spacebar & return key(s) (if you want to allow carriage returns)
    (keyCode > 64 && keyCode < 91) || // letter keys
    (keyCode > 95 && keyCode < 112) || // numpad keys
    (keyCode > 185 && keyCode < 193) || // ;=,-./` (in order)
    (keyCode > 218 && keyCode < 223) ||   // [\]' (in order)
    // maybe 输入法，处理一下特殊符号
    (evt.key === 'Process' &&
      ['Backslash', 'BracketRight', 'BracketLeft', 'Quote', 'Semicolon', 'Slash', 'Period', 'Comma', 'Equal', 'Minus',
        'Digit0', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Backquote',
        'Numpad0', 'Numpad1', 'Numpad2', 'Numpad3', 'Numpad4', 'Numpad5', 'Numpad6', 'Numpad7', 'Numpad8', 'Numpad9', 'NumpadDecimal',
        'NumpadDivide', 'NumpadMultiply', 'NumpadSubtract', 'NumpadAdd'].indexOf(evt.code) >= 0);
  return isChar && !evt.ctrlKey && !evt.altKey && !evt.metaKey;// && !evt.shiftKey;
};

//Returns true if it is a DOM node
var __isNode = function (o) {
  return (
    typeof Node === "object" ? o instanceof Node :
      o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string"
  );
};

//Returns true if it is a DOM element    
var __isElement = function (o) {
  return (
    typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
      o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
  );
};

var __now = function () {
  return new Date().toISOString().substring(0, 16).replace('T', ' ');
};


var __createIns = function (doc, childs, user, datetime) {
  var ins = domUtils.createElement(doc, 'ins', {
    cite: user,
    datetime: datetime || __now()
  });
  Array.isArray(childs) ? Array.prototype.forEach.call(childs, ins.appendChild)
    : dom.isNode(childs) && ins.appendChild(childs);
  return ins;
};

var __isIns = function (node) {
  return node && node.nodeType === 1 && node.tagName.toLowerCase() === 'ins' && node;
}

var __createLBR = function (doc) {
  var lbr = domUtils.createElement(doc, 'span', { 'class': 'br' });
  // lbr.appendChild(doc.createTextNode(domUtils.fillChar));
  lbr.appendChild(doc.createElement('br'));
  return lbr;
};

var __isLBR = function (node) {
  return (__isIns(node) && __isLBR(node.firstChild)) ||
    (node && node.nodeType === 1 && node.tagName.toLowerCase() === 'span' && domUtils.hasClass(node, 'br'));
};

var __isEmptyNode = function (node) {
  return domUtils.isEmptyNode(node) || (node && node.firstChild && __isLBR(node.firstChild));
};

var __fillNode = function (doc, node) {
  if (domUtils.isEmptyNode(node)) domUtils.fillNode(doc, node);
  else node.insertBefore(doc.createTextNode(domUtils.fillChar), node.firstChild);
};

var __fillEmptyNodes = function (doc) {
  utils.each(domUtils.getElementsByTagName(doc, 'p'), function (node) {
    if (__isEmptyNode(node)) __fillNode(doc, node);
  });
};

var dom = {
  isChar: __isChar,
  isNode: __isNode,
  isElement: __isElement,
  isIns: __isIns,
  isLBR: __isLBR,
  createIns: __createIns,
  createLBR: __createLBR,
  now: __now,
  fillEmptyNodes: __fillEmptyNodes
};


module.exports = dom;