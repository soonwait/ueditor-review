/**
 * 格式化XML字符串，网上扒来的
 * @param {string} xml 
 */
function formatXml(xml) {
  var reg = /(>)\s*(<)(\/*)/g; // updated Mar 30, 2015
  var wsexp = / *(.*) +\n/g;
  var contexp = /(<.+>)(.+\n)/g;
  xml = xml.replace(reg, '$1\n$2$3').replace(wsexp, '$1\n').replace(contexp, '$1\n$2');
  var pad = 0;
  var formatted = '';
  var lines = xml.split('\n');
  var indent = 0;
  var lastType = 'other';
  // 4 types of tags - single, closing, opening, other (text, doctype, comment) - 4*4 = 16 transitions 
  var transitions = {
    'single->single': 0,
    'single->closing': -1,
    'single->opening': 0,
    'single->other': 0,
    'closing->single': 0,
    'closing->closing': -1,
    'closing->opening': 0,
    'closing->other': 0,
    'opening->single': 1,
    'opening->closing': 0,
    'opening->opening': 1,
    'opening->other': 1,
    'other->single': 0,
    'other->closing': -1,
    'other->opening': 0,
    'other->other': 0
  };

  for (var i = 0; i < lines.length; i++) {
    var ln = lines[i];

    // Luca Viggiani 2017-07-03: handle optional <?xml ... ?> declaration
    if (ln.match(/\s*<\?xml/)) {
      formatted += ln + "\n";
      continue;
    }
    // ---

    var single = Boolean(ln.match(/<.+\/>/) || ln.match(/<br>/)); // is this line a single tag? ex. <br />
    var closing = Boolean(ln.match(/<\/.+>/)); // is this a closing tag? ex. </a>
    var opening = Boolean(ln.match(/<[^!].*>/)); // is this even a tag (that's not <!something>)
    var type = single ? 'single' : closing ? 'closing' : opening ? 'opening' : 'other';
    var fromTo = lastType + '->' + type;
    lastType = type;
    var padding = '';

    indent += transitions[fromTo];
    for (var j = 0; j < indent; j++) {
      padding += '  '//'\t';
    }
    if (fromTo == 'opening->closing')
      formatted = formatted.substr(0, formatted.length - 1) + ln + '\n'; // substr removes line break (\n) from prev loop
    else
      formatted += padding + ln + '\n';
  }

  return formatted;
}

/**
 * 自制的innerHTML扩展，将文本节点格式为<text></text>，并显示出转义字符&nbsp;&#8203;&#3000;
 * TODO 还有其他转义字符呢？？？？
 * @param {Element | Text} node 
 */
function getDomFullString(node) {
  var str;
  if(!node) return 'not ready';
  if (!node.firstChild) {
    str = node.nodeType === 3 ? `<text>${
      node.nodeValue
        .replace(/\u00A0/gi, '&nbsp;')
        .replace(/\u200B/gi, '&#8203;')
        .replace(/\u3000/gi, '&#12288;')
      }</text>` : node.outerHTML;
    // 注意：outerHTML里已经包含了属性
  }
  else {
    str = `<${node.tagName.toLowerCase()}>${Array.from(node.childNodes).map(getDomFullString).join('')}</${node.tagName.toLowerCase()}>`;
    if (node.nodeType === 1 && (node.tagName === 'INS' || node.tagName === 'DEL')) {
      // TODO 这里只处理了DEL和INS的属性，其他的没处理呢还
      var t = ['cite', 'datetime'].filter(attr => !!node.getAttribute(attr)).map(attr => `${attr}="${node.getAttribute(attr)}"`).join(' ');
      str = str.replace(/>/, ' ' + t + '>');
    }
  }
  return str;
}

function addSpy() {
  var div = document.getElementById('ue_console');
  if (!div) {
    div = document.createElement('DIV');
    div.id = 'ue_console';
    div.innerHTML = `
      <div style="position:fixed; right: 8px; top: 8px; width:calc(50% - 10px); height: calc(100% - 20px); overflow: hidden scroll; border: 1px solid #d4d4d4; box-shadow: 2px 2px 5px #d3d6da; background-color: #fff; float:left;">
        <div style="border-bottom: 1px solid #d4d4d4; padding: 5px; background-color: #fafafa;">um.childNodes</div>
        <pre style="padding: 0; margin: 0;" id="ue_console_pre"></pre>
      </div>
    `;
    document.body.appendChild(div);
  }
}

addSpy();

UE.plugins["ue-console"] = function () {
  var me = this;

  function getBody() {
    var str = getDomFullString(me.body);
    return str;
    return str.substring(5, str.length - 6);
  }

  function spyHandler() {
    var el = document.getElementById('ue_console_pre')
    el && (el.innerText = formatXml(getBody().split('</p><p').join('</p>\n<p')));
  }
  setInterval(spyHandler, 500)
  // me.addListener('contentChange click', spyHandler);
};