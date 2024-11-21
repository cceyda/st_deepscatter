import { Bool, Dictionary, Float32, Int16, Int32, Int64, Int8, RecordBatch, Table, Type, Uint8, Utf8, Vector, makeData, makeVector, tableFromIPC, vectorFromArray } from "apache-arrow";
var xhtml = "http://www.w3.org/1999/xhtml";
const namespaces = {
  svg: "http://www.w3.org/2000/svg",
  xhtml,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function namespace(name) {
  var prefix = name += "", i = prefix.indexOf(":");
  if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns")
    name = name.slice(i + 1);
  return namespaces.hasOwnProperty(prefix) ? { space: namespaces[prefix], local: name } : name;
}
function creatorInherit(name) {
  return function() {
    var document2 = this.ownerDocument, uri = this.namespaceURI;
    return uri === xhtml && document2.documentElement.namespaceURI === xhtml ? document2.createElement(name) : document2.createElementNS(uri, name);
  };
}
function creatorFixed(fullname) {
  return function() {
    return this.ownerDocument.createElementNS(fullname.space, fullname.local);
  };
}
function creator(name) {
  var fullname = namespace(name);
  return (fullname.local ? creatorFixed : creatorInherit)(fullname);
}
function none() {
}
function selector(selector2) {
  return selector2 == null ? none : function() {
    return this.querySelector(selector2);
  };
}
function selection_select(select2) {
  if (typeof select2 !== "function")
    select2 = selector(select2);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select2.call(node, node.__data__, i, group))) {
        if ("__data__" in node)
          subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
      }
    }
  }
  return new Selection$1(subgroups, this._parents);
}
function array(x) {
  return x == null ? [] : Array.isArray(x) ? x : Array.from(x);
}
function empty() {
  return [];
}
function selectorAll(selector2) {
  return selector2 == null ? empty : function() {
    return this.querySelectorAll(selector2);
  };
}
function arrayAll(select2) {
  return function() {
    return array(select2.apply(this, arguments));
  };
}
function selection_selectAll(select2) {
  if (typeof select2 === "function")
    select2 = arrayAll(select2);
  else
    select2 = selectorAll(select2);
  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        subgroups.push(select2.call(node, node.__data__, i, group));
        parents.push(node);
      }
    }
  }
  return new Selection$1(subgroups, parents);
}
function matcher(selector2) {
  return function() {
    return this.matches(selector2);
  };
}
function childMatcher(selector2) {
  return function(node) {
    return node.matches(selector2);
  };
}
var find = Array.prototype.find;
function childFind(match) {
  return function() {
    return find.call(this.children, match);
  };
}
function childFirst() {
  return this.firstElementChild;
}
function selection_selectChild(match) {
  return this.select(match == null ? childFirst : childFind(typeof match === "function" ? match : childMatcher(match)));
}
var filter = Array.prototype.filter;
function children$1() {
  return Array.from(this.children);
}
function childrenFilter(match) {
  return function() {
    return filter.call(this.children, match);
  };
}
function selection_selectChildren(match) {
  return this.selectAll(match == null ? children$1 : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
}
function selection_filter(match) {
  if (typeof match !== "function")
    match = matcher(match);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }
  return new Selection$1(subgroups, this._parents);
}
function sparse(update) {
  return new Array(update.length);
}
function selection_enter() {
  return new Selection$1(this._enter || this._groups.map(sparse), this._parents);
}
function EnterNode(parent, datum2) {
  this.ownerDocument = parent.ownerDocument;
  this.namespaceURI = parent.namespaceURI;
  this._next = null;
  this._parent = parent;
  this.__data__ = datum2;
}
EnterNode.prototype = {
  constructor: EnterNode,
  appendChild: function(child) {
    return this._parent.insertBefore(child, this._next);
  },
  insertBefore: function(child, next) {
    return this._parent.insertBefore(child, next);
  },
  querySelector: function(selector2) {
    return this._parent.querySelector(selector2);
  },
  querySelectorAll: function(selector2) {
    return this._parent.querySelectorAll(selector2);
  }
};
function constant$3(x) {
  return function() {
    return x;
  };
}
function bindIndex(parent, group, enter, update, exit, data) {
  var i = 0, node, groupLength = group.length, dataLength = data.length;
  for (; i < dataLength; ++i) {
    if (node = group[i]) {
      node.__data__ = data[i];
      update[i] = node;
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (; i < groupLength; ++i) {
    if (node = group[i]) {
      exit[i] = node;
    }
  }
}
function bindKey(parent, group, enter, update, exit, data, key) {
  var i, node, nodeByKeyValue = /* @__PURE__ */ new Map(), groupLength = group.length, dataLength = data.length, keyValues = new Array(groupLength), keyValue;
  for (i = 0; i < groupLength; ++i) {
    if (node = group[i]) {
      keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
      if (nodeByKeyValue.has(keyValue)) {
        exit[i] = node;
      } else {
        nodeByKeyValue.set(keyValue, node);
      }
    }
  }
  for (i = 0; i < dataLength; ++i) {
    keyValue = key.call(parent, data[i], i, data) + "";
    if (node = nodeByKeyValue.get(keyValue)) {
      update[i] = node;
      node.__data__ = data[i];
      nodeByKeyValue.delete(keyValue);
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (i = 0; i < groupLength; ++i) {
    if ((node = group[i]) && nodeByKeyValue.get(keyValues[i]) === node) {
      exit[i] = node;
    }
  }
}
function datum(node) {
  return node.__data__;
}
function selection_data(value, key) {
  if (!arguments.length)
    return Array.from(this, datum);
  var bind = key ? bindKey : bindIndex, parents = this._parents, groups = this._groups;
  if (typeof value !== "function")
    value = constant$3(value);
  for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
    var parent = parents[j], group = groups[j], groupLength = group.length, data = arraylike(value.call(parent, parent && parent.__data__, j, parents)), dataLength = data.length, enterGroup = enter[j] = new Array(dataLength), updateGroup = update[j] = new Array(dataLength), exitGroup = exit[j] = new Array(groupLength);
    bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);
    for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
      if (previous = enterGroup[i0]) {
        if (i0 >= i1)
          i1 = i0 + 1;
        while (!(next = updateGroup[i1]) && ++i1 < dataLength)
          ;
        previous._next = next || null;
      }
    }
  }
  update = new Selection$1(update, parents);
  update._enter = enter;
  update._exit = exit;
  return update;
}
function arraylike(data) {
  return typeof data === "object" && "length" in data ? data : Array.from(data);
}
function selection_exit() {
  return new Selection$1(this._exit || this._groups.map(sparse), this._parents);
}
function selection_join(onenter, onupdate, onexit) {
  var enter = this.enter(), update = this, exit = this.exit();
  if (typeof onenter === "function") {
    enter = onenter(enter);
    if (enter)
      enter = enter.selection();
  } else {
    enter = enter.append(onenter + "");
  }
  if (onupdate != null) {
    update = onupdate(update);
    if (update)
      update = update.selection();
  }
  if (onexit == null)
    exit.remove();
  else
    onexit(exit);
  return enter && update ? enter.merge(update).order() : update;
}
function selection_merge(context2) {
  var selection2 = context2.selection ? context2.selection() : context2;
  for (var groups0 = this._groups, groups1 = selection2._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge2 = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge2[i] = node;
      }
    }
  }
  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }
  return new Selection$1(merges, this._parents);
}
function selection_order() {
  for (var groups = this._groups, j = -1, m = groups.length; ++j < m; ) {
    for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0; ) {
      if (node = group[i]) {
        if (next && node.compareDocumentPosition(next) ^ 4)
          next.parentNode.insertBefore(node, next);
        next = node;
      }
    }
  }
  return this;
}
function selection_sort(compare) {
  if (!compare)
    compare = ascending$1;
  function compareNode(a, b) {
    return a && b ? compare(a.__data__, b.__data__) : !a - !b;
  }
  for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        sortgroup[i] = node;
      }
    }
    sortgroup.sort(compareNode);
  }
  return new Selection$1(sortgroups, this._parents).order();
}
function ascending$1(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}
function selection_call() {
  var callback = arguments[0];
  arguments[0] = this;
  callback.apply(null, arguments);
  return this;
}
function selection_nodes() {
  return Array.from(this);
}
function selection_node() {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
      var node = group[i];
      if (node)
        return node;
    }
  }
  return null;
}
function selection_size() {
  let size = 0;
  for (const node of this)
    ++size;
  return size;
}
function selection_empty() {
  return !this.node();
}
function selection_each(callback) {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i])
        callback.call(node, node.__data__, i, group);
    }
  }
  return this;
}
function attrRemove$1(name) {
  return function() {
    this.removeAttribute(name);
  };
}
function attrRemoveNS$1(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant$1(name, value) {
  return function() {
    this.setAttribute(name, value);
  };
}
function attrConstantNS$1(fullname, value) {
  return function() {
    this.setAttributeNS(fullname.space, fullname.local, value);
  };
}
function attrFunction$1(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null)
      this.removeAttribute(name);
    else
      this.setAttribute(name, v);
  };
}
function attrFunctionNS$1(fullname, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null)
      this.removeAttributeNS(fullname.space, fullname.local);
    else
      this.setAttributeNS(fullname.space, fullname.local, v);
  };
}
function selection_attr(name, value) {
  var fullname = namespace(name);
  if (arguments.length < 2) {
    var node = this.node();
    return fullname.local ? node.getAttributeNS(fullname.space, fullname.local) : node.getAttribute(fullname);
  }
  return this.each((value == null ? fullname.local ? attrRemoveNS$1 : attrRemove$1 : typeof value === "function" ? fullname.local ? attrFunctionNS$1 : attrFunction$1 : fullname.local ? attrConstantNS$1 : attrConstant$1)(fullname, value));
}
function defaultView(node) {
  return node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView;
}
function styleRemove$1(name) {
  return function() {
    this.style.removeProperty(name);
  };
}
function styleConstant$1(name, value, priority) {
  return function() {
    this.style.setProperty(name, value, priority);
  };
}
function styleFunction$1(name, value, priority) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null)
      this.style.removeProperty(name);
    else
      this.style.setProperty(name, v, priority);
  };
}
function selection_style(name, value, priority) {
  return arguments.length > 1 ? this.each((value == null ? styleRemove$1 : typeof value === "function" ? styleFunction$1 : styleConstant$1)(name, value, priority == null ? "" : priority)) : styleValue(this.node(), name);
}
function styleValue(node, name) {
  return node.style.getPropertyValue(name) || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
}
function propertyRemove(name) {
  return function() {
    delete this[name];
  };
}
function propertyConstant(name, value) {
  return function() {
    this[name] = value;
  };
}
function propertyFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null)
      delete this[name];
    else
      this[name] = v;
  };
}
function selection_property(name, value) {
  return arguments.length > 1 ? this.each((value == null ? propertyRemove : typeof value === "function" ? propertyFunction : propertyConstant)(name, value)) : this.node()[name];
}
function classArray(string) {
  return string.trim().split(/^|\s+/);
}
function classList(node) {
  return node.classList || new ClassList(node);
}
function ClassList(node) {
  this._node = node;
  this._names = classArray(node.getAttribute("class") || "");
}
ClassList.prototype = {
  add: function(name) {
    var i = this._names.indexOf(name);
    if (i < 0) {
      this._names.push(name);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  remove: function(name) {
    var i = this._names.indexOf(name);
    if (i >= 0) {
      this._names.splice(i, 1);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  contains: function(name) {
    return this._names.indexOf(name) >= 0;
  }
};
function classedAdd(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n)
    list.add(names[i]);
}
function classedRemove(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n)
    list.remove(names[i]);
}
function classedTrue(names) {
  return function() {
    classedAdd(this, names);
  };
}
function classedFalse(names) {
  return function() {
    classedRemove(this, names);
  };
}
function classedFunction(names, value) {
  return function() {
    (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
  };
}
function selection_classed(name, value) {
  var names = classArray(name + "");
  if (arguments.length < 2) {
    var list = classList(this.node()), i = -1, n = names.length;
    while (++i < n)
      if (!list.contains(names[i]))
        return false;
    return true;
  }
  return this.each((typeof value === "function" ? classedFunction : value ? classedTrue : classedFalse)(names, value));
}
function textRemove() {
  this.textContent = "";
}
function textConstant$1(value) {
  return function() {
    this.textContent = value;
  };
}
function textFunction$1(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.textContent = v == null ? "" : v;
  };
}
function selection_text(value) {
  return arguments.length ? this.each(value == null ? textRemove : (typeof value === "function" ? textFunction$1 : textConstant$1)(value)) : this.node().textContent;
}
function htmlRemove() {
  this.innerHTML = "";
}
function htmlConstant(value) {
  return function() {
    this.innerHTML = value;
  };
}
function htmlFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.innerHTML = v == null ? "" : v;
  };
}
function selection_html(value) {
  return arguments.length ? this.each(value == null ? htmlRemove : (typeof value === "function" ? htmlFunction : htmlConstant)(value)) : this.node().innerHTML;
}
function raise() {
  if (this.nextSibling)
    this.parentNode.appendChild(this);
}
function selection_raise() {
  return this.each(raise);
}
function lower() {
  if (this.previousSibling)
    this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function selection_lower() {
  return this.each(lower);
}
function selection_append(name) {
  var create2 = typeof name === "function" ? name : creator(name);
  return this.select(function() {
    return this.appendChild(create2.apply(this, arguments));
  });
}
function constantNull() {
  return null;
}
function selection_insert(name, before) {
  var create2 = typeof name === "function" ? name : creator(name), select2 = before == null ? constantNull : typeof before === "function" ? before : selector(before);
  return this.select(function() {
    return this.insertBefore(create2.apply(this, arguments), select2.apply(this, arguments) || null);
  });
}
function remove() {
  var parent = this.parentNode;
  if (parent)
    parent.removeChild(this);
}
function selection_remove() {
  return this.each(remove);
}
function selection_cloneShallow() {
  var clone = this.cloneNode(false), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function selection_cloneDeep() {
  var clone = this.cloneNode(true), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function selection_clone(deep) {
  return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
}
function selection_datum(value) {
  return arguments.length ? this.property("__data__", value) : this.node().__data__;
}
function contextListener(listener) {
  return function(event) {
    listener.call(this, event, this.__data__);
  };
}
function parseTypenames$1(typenames) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0)
      name = t.slice(i + 1), t = t.slice(0, i);
    return { type: t, name };
  });
}
function onRemove(typename) {
  return function() {
    var on = this.__on;
    if (!on)
      return;
    for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
      if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
      } else {
        on[++i] = o;
      }
    }
    if (++i)
      on.length = i;
    else
      delete this.__on;
  };
}
function onAdd(typename, value, options) {
  return function() {
    var on = this.__on, o, listener = contextListener(value);
    if (on)
      for (var j = 0, m = on.length; j < m; ++j) {
        if ((o = on[j]).type === typename.type && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
          this.addEventListener(o.type, o.listener = listener, o.options = options);
          o.value = value;
          return;
        }
      }
    this.addEventListener(typename.type, listener, options);
    o = { type: typename.type, name: typename.name, value, listener, options };
    if (!on)
      this.__on = [o];
    else
      on.push(o);
  };
}
function selection_on(typename, value, options) {
  var typenames = parseTypenames$1(typename + ""), i, n = typenames.length, t;
  if (arguments.length < 2) {
    var on = this.node().__on;
    if (on)
      for (var j = 0, m = on.length, o; j < m; ++j) {
        for (i = 0, o = on[j]; i < n; ++i) {
          if ((t = typenames[i]).type === o.type && t.name === o.name) {
            return o.value;
          }
        }
      }
    return;
  }
  on = value ? onAdd : onRemove;
  for (i = 0; i < n; ++i)
    this.each(on(typenames[i], value, options));
  return this;
}
function dispatchEvent(node, type, params) {
  var window2 = defaultView(node), event = window2.CustomEvent;
  if (typeof event === "function") {
    event = new event(type, params);
  } else {
    event = window2.document.createEvent("Event");
    if (params)
      event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
    else
      event.initEvent(type, false, false);
  }
  node.dispatchEvent(event);
}
function dispatchConstant(type, params) {
  return function() {
    return dispatchEvent(this, type, params);
  };
}
function dispatchFunction(type, params) {
  return function() {
    return dispatchEvent(this, type, params.apply(this, arguments));
  };
}
function selection_dispatch(type, params) {
  return this.each((typeof params === "function" ? dispatchFunction : dispatchConstant)(type, params));
}
function* selection_iterator() {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i])
        yield node;
    }
  }
}
var root = [null];
function Selection$1(groups, parents) {
  this._groups = groups;
  this._parents = parents;
}
function selection() {
  return new Selection$1([[document.documentElement]], root);
}
function selection_selection() {
  return this;
}
Selection$1.prototype = selection.prototype = {
  constructor: Selection$1,
  select: selection_select,
  selectAll: selection_selectAll,
  selectChild: selection_selectChild,
  selectChildren: selection_selectChildren,
  filter: selection_filter,
  data: selection_data,
  enter: selection_enter,
  exit: selection_exit,
  join: selection_join,
  merge: selection_merge,
  selection: selection_selection,
  order: selection_order,
  sort: selection_sort,
  call: selection_call,
  nodes: selection_nodes,
  node: selection_node,
  size: selection_size,
  empty: selection_empty,
  each: selection_each,
  attr: selection_attr,
  style: selection_style,
  property: selection_property,
  classed: selection_classed,
  text: selection_text,
  html: selection_html,
  raise: selection_raise,
  lower: selection_lower,
  append: selection_append,
  insert: selection_insert,
  remove: selection_remove,
  clone: selection_clone,
  datum: selection_datum,
  on: selection_on,
  dispatch: selection_dispatch,
  [Symbol.iterator]: selection_iterator
};
function select(selector2) {
  return typeof selector2 === "string" ? new Selection$1([[document.querySelector(selector2)]], [document.documentElement]) : new Selection$1([[selector2]], root);
}
function sourceEvent(event) {
  let sourceEvent2;
  while (sourceEvent2 = event.sourceEvent)
    event = sourceEvent2;
  return event;
}
function pointer(event, node) {
  event = sourceEvent(event);
  if (node === void 0)
    node = event.currentTarget;
  if (node) {
    var svg = node.ownerSVGElement || node;
    if (svg.createSVGPoint) {
      var point = svg.createSVGPoint();
      point.x = event.clientX, point.y = event.clientY;
      point = point.matrixTransform(node.getScreenCTM().inverse());
      return [point.x, point.y];
    }
    if (node.getBoundingClientRect) {
      var rect = node.getBoundingClientRect();
      return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
    }
  }
  return [event.pageX, event.pageY];
}
function ascending(a, b) {
  return a == null || b == null ? NaN : a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}
function descending(a, b) {
  return a == null || b == null ? NaN : b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
}
function bisector(f) {
  let compare1, compare2, delta;
  if (f.length !== 2) {
    compare1 = ascending;
    compare2 = (d, x) => ascending(f(d), x);
    delta = (d, x) => f(d) - x;
  } else {
    compare1 = f === ascending || f === descending ? f : zero$1;
    compare2 = f;
    delta = f;
  }
  function left(a, x, lo = 0, hi = a.length) {
    if (lo < hi) {
      if (compare1(x, x) !== 0)
        return hi;
      do {
        const mid = lo + hi >>> 1;
        if (compare2(a[mid], x) < 0)
          lo = mid + 1;
        else
          hi = mid;
      } while (lo < hi);
    }
    return lo;
  }
  function right(a, x, lo = 0, hi = a.length) {
    if (lo < hi) {
      if (compare1(x, x) !== 0)
        return hi;
      do {
        const mid = lo + hi >>> 1;
        if (compare2(a[mid], x) <= 0)
          lo = mid + 1;
        else
          hi = mid;
      } while (lo < hi);
    }
    return lo;
  }
  function center(a, x, lo = 0, hi = a.length) {
    const i = left(a, x, lo, hi - 1);
    return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
  }
  return { left, center, right };
}
function zero$1() {
  return 0;
}
function number$1(x) {
  return x === null ? NaN : +x;
}
const ascendingBisect = bisector(ascending);
const bisectRight = ascendingBisect.right;
const bisectLeft = ascendingBisect.left;
bisector(number$1).center;
function extent(values, valueof) {
  let min2;
  let max2;
  if (valueof === void 0) {
    for (const value of values) {
      if (value != null) {
        if (min2 === void 0) {
          if (value >= value)
            min2 = max2 = value;
        } else {
          if (min2 > value)
            min2 = value;
          if (max2 < value)
            max2 = value;
        }
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null) {
        if (min2 === void 0) {
          if (value >= value)
            min2 = max2 = value;
        } else {
          if (min2 > value)
            min2 = value;
          if (max2 < value)
            max2 = value;
        }
      }
    }
  }
  return [min2, max2];
}
class Adder {
  constructor() {
    this._partials = new Float64Array(32);
    this._n = 0;
  }
  add(x) {
    const p = this._partials;
    let i = 0;
    for (let j = 0; j < this._n && j < 32; j++) {
      const y = p[j], hi = x + y, lo = Math.abs(x) < Math.abs(y) ? x - (hi - y) : y - (hi - x);
      if (lo)
        p[i++] = lo;
      x = hi;
    }
    p[i] = x;
    this._n = i + 1;
    return this;
  }
  valueOf() {
    const p = this._partials;
    let n = this._n, x, y, lo, hi = 0;
    if (n > 0) {
      hi = p[--n];
      while (n > 0) {
        x = hi;
        y = p[--n];
        hi = x + y;
        lo = y - (hi - x);
        if (lo)
          break;
      }
      if (n > 0 && (lo < 0 && p[n - 1] < 0 || lo > 0 && p[n - 1] > 0)) {
        y = lo * 2;
        x = hi + y;
        if (y == x - hi)
          hi = x;
      }
    }
    return hi;
  }
}
class InternMap extends Map {
  constructor(entries, key = keyof) {
    super();
    Object.defineProperties(this, { _intern: { value: /* @__PURE__ */ new Map() }, _key: { value: key } });
    if (entries != null)
      for (const [key2, value] of entries)
        this.set(key2, value);
  }
  get(key) {
    return super.get(intern_get(this, key));
  }
  has(key) {
    return super.has(intern_get(this, key));
  }
  set(key, value) {
    return super.set(intern_set(this, key), value);
  }
  delete(key) {
    return super.delete(intern_delete(this, key));
  }
}
function intern_get({ _intern, _key }, value) {
  const key = _key(value);
  return _intern.has(key) ? _intern.get(key) : value;
}
function intern_set({ _intern, _key }, value) {
  const key = _key(value);
  if (_intern.has(key))
    return _intern.get(key);
  _intern.set(key, value);
  return value;
}
function intern_delete({ _intern, _key }, value) {
  const key = _key(value);
  if (_intern.has(key)) {
    value = _intern.get(value);
    _intern.delete(key);
  }
  return value;
}
function keyof(value) {
  return value !== null && typeof value === "object" ? value.valueOf() : value;
}
const e10 = Math.sqrt(50), e5 = Math.sqrt(10), e2 = Math.sqrt(2);
function tickSpec(start2, stop, count) {
  const step = (stop - start2) / Math.max(0, count), power = Math.floor(Math.log10(step)), error = step / Math.pow(10, power), factor = error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1;
  let i1, i2, inc2;
  if (power < 0) {
    inc2 = Math.pow(10, -power) / factor;
    i1 = Math.round(start2 * inc2);
    i2 = Math.round(stop * inc2);
    if (i1 / inc2 < start2)
      ++i1;
    if (i2 / inc2 > stop)
      --i2;
    inc2 = -inc2;
  } else {
    inc2 = Math.pow(10, power) * factor;
    i1 = Math.round(start2 / inc2);
    i2 = Math.round(stop / inc2);
    if (i1 * inc2 < start2)
      ++i1;
    if (i2 * inc2 > stop)
      --i2;
  }
  if (i2 < i1 && 0.5 <= count && count < 2)
    return tickSpec(start2, stop, count * 2);
  return [i1, i2, inc2];
}
function ticks(start2, stop, count) {
  stop = +stop, start2 = +start2, count = +count;
  if (!(count > 0))
    return [];
  if (start2 === stop)
    return [start2];
  const reverse = stop < start2, [i1, i2, inc2] = reverse ? tickSpec(stop, start2, count) : tickSpec(start2, stop, count);
  if (!(i2 >= i1))
    return [];
  const n = i2 - i1 + 1, ticks2 = new Array(n);
  if (reverse) {
    if (inc2 < 0)
      for (let i = 0; i < n; ++i)
        ticks2[i] = (i2 - i) / -inc2;
    else
      for (let i = 0; i < n; ++i)
        ticks2[i] = (i2 - i) * inc2;
  } else {
    if (inc2 < 0)
      for (let i = 0; i < n; ++i)
        ticks2[i] = (i1 + i) / -inc2;
    else
      for (let i = 0; i < n; ++i)
        ticks2[i] = (i1 + i) * inc2;
  }
  return ticks2;
}
function tickIncrement(start2, stop, count) {
  stop = +stop, start2 = +start2, count = +count;
  return tickSpec(start2, stop, count)[2];
}
function tickStep(start2, stop, count) {
  stop = +stop, start2 = +start2, count = +count;
  const reverse = stop < start2, inc2 = reverse ? tickIncrement(stop, start2, count) : tickIncrement(start2, stop, count);
  return (reverse ? -1 : 1) * (inc2 < 0 ? 1 / -inc2 : inc2);
}
function max(values, valueof) {
  let max2;
  if (valueof === void 0) {
    for (const value of values) {
      if (value != null && (max2 < value || max2 === void 0 && value >= value)) {
        max2 = value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && (max2 < value || max2 === void 0 && value >= value)) {
        max2 = value;
      }
    }
  }
  return max2;
}
function min(values, valueof) {
  let min2;
  if (valueof === void 0) {
    for (const value of values) {
      if (value != null && (min2 > value || min2 === void 0 && value >= value)) {
        min2 = value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && (min2 > value || min2 === void 0 && value >= value)) {
        min2 = value;
      }
    }
  }
  return min2;
}
function mean(values, valueof) {
  let count = 0;
  let sum2 = 0;
  if (valueof === void 0) {
    for (let value of values) {
      if (value != null && (value = +value) >= value) {
        ++count, sum2 += value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
        ++count, sum2 += value;
      }
    }
  }
  if (count)
    return sum2 / count;
}
function* flatten(arrays) {
  for (const array2 of arrays) {
    yield* array2;
  }
}
function merge(arrays) {
  return Array.from(flatten(arrays));
}
function range(start2, stop, step) {
  start2 = +start2, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start2, start2 = 0, 1) : n < 3 ? 1 : +step;
  var i = -1, n = Math.max(0, Math.ceil((stop - start2) / step)) | 0, range2 = new Array(n);
  while (++i < n) {
    range2[i] = start2 + i * step;
  }
  return range2;
}
function shuffler(random) {
  return function shuffle(array2, i0 = 0, i1 = array2.length) {
    let m = i1 - (i0 = +i0);
    while (m) {
      const i = random() * m-- | 0, t = array2[m + i0];
      array2[m + i0] = array2[i + i0];
      array2[i + i0] = t;
    }
    return array2;
  };
}
function sum(values, valueof) {
  let sum2 = 0;
  if (valueof === void 0) {
    for (let value of values) {
      if (value = +value) {
        sum2 += value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if (value = +valueof(value, ++index, values)) {
        sum2 += value;
      }
    }
  }
  return sum2;
}
var epsilon = 1e-6;
var pi = Math.PI;
var tau = pi * 2;
var degrees$2 = 180 / pi;
var radians$1 = pi / 180;
var abs = Math.abs;
var cos = Math.cos;
var sin = Math.sin;
var sqrt$1 = Math.sqrt;
function noop$1() {
}
function streamGeometry(geometry, stream) {
  if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
    streamGeometryType[geometry.type](geometry, stream);
  }
}
var streamObjectType = {
  Feature: function(object2, stream) {
    streamGeometry(object2.geometry, stream);
  },
  FeatureCollection: function(object2, stream) {
    var features = object2.features, i = -1, n = features.length;
    while (++i < n)
      streamGeometry(features[i].geometry, stream);
  }
};
var streamGeometryType = {
  Sphere: function(object2, stream) {
    stream.sphere();
  },
  Point: function(object2, stream) {
    object2 = object2.coordinates;
    stream.point(object2[0], object2[1], object2[2]);
  },
  MultiPoint: function(object2, stream) {
    var coordinates = object2.coordinates, i = -1, n = coordinates.length;
    while (++i < n)
      object2 = coordinates[i], stream.point(object2[0], object2[1], object2[2]);
  },
  LineString: function(object2, stream) {
    streamLine(object2.coordinates, stream, 0);
  },
  MultiLineString: function(object2, stream) {
    var coordinates = object2.coordinates, i = -1, n = coordinates.length;
    while (++i < n)
      streamLine(coordinates[i], stream, 0);
  },
  Polygon: function(object2, stream) {
    streamPolygon(object2.coordinates, stream);
  },
  MultiPolygon: function(object2, stream) {
    var coordinates = object2.coordinates, i = -1, n = coordinates.length;
    while (++i < n)
      streamPolygon(coordinates[i], stream);
  },
  GeometryCollection: function(object2, stream) {
    var geometries = object2.geometries, i = -1, n = geometries.length;
    while (++i < n)
      streamGeometry(geometries[i], stream);
  }
};
function streamLine(coordinates, stream, closed) {
  var i = -1, n = coordinates.length - closed, coordinate;
  stream.lineStart();
  while (++i < n)
    coordinate = coordinates[i], stream.point(coordinate[0], coordinate[1], coordinate[2]);
  stream.lineEnd();
}
function streamPolygon(coordinates, stream) {
  var i = -1, n = coordinates.length;
  stream.polygonStart();
  while (++i < n)
    streamLine(coordinates[i], stream, 1);
  stream.polygonEnd();
}
function geoStream(object2, stream) {
  if (object2 && streamObjectType.hasOwnProperty(object2.type)) {
    streamObjectType[object2.type](object2, stream);
  } else {
    streamGeometry(object2, stream);
  }
}
function clipBuffer() {
  var lines = [], line;
  return {
    point: function(x, y, m) {
      line.push([x, y, m]);
    },
    lineStart: function() {
      lines.push(line = []);
    },
    lineEnd: noop$1,
    rejoin: function() {
      if (lines.length > 1)
        lines.push(lines.pop().concat(lines.shift()));
    },
    result: function() {
      var result = lines;
      lines = [];
      line = null;
      return result;
    }
  };
}
function pointEqual(a, b) {
  return abs(a[0] - b[0]) < epsilon && abs(a[1] - b[1]) < epsilon;
}
function Intersection(point, points, other, entry) {
  this.x = point;
  this.z = points;
  this.o = other;
  this.e = entry;
  this.v = false;
  this.n = this.p = null;
}
function clipRejoin(segments, compareIntersection, startInside, interpolate2, stream) {
  var subject = [], clip = [], i, n;
  segments.forEach(function(segment) {
    if ((n2 = segment.length - 1) <= 0)
      return;
    var n2, p0 = segment[0], p1 = segment[n2], x;
    if (pointEqual(p0, p1)) {
      if (!p0[2] && !p1[2]) {
        stream.lineStart();
        for (i = 0; i < n2; ++i)
          stream.point((p0 = segment[i])[0], p0[1]);
        stream.lineEnd();
        return;
      }
      p1[0] += 2 * epsilon;
    }
    subject.push(x = new Intersection(p0, segment, null, true));
    clip.push(x.o = new Intersection(p0, null, x, false));
    subject.push(x = new Intersection(p1, segment, null, false));
    clip.push(x.o = new Intersection(p1, null, x, true));
  });
  if (!subject.length)
    return;
  clip.sort(compareIntersection);
  link(subject);
  link(clip);
  for (i = 0, n = clip.length; i < n; ++i) {
    clip[i].e = startInside = !startInside;
  }
  var start2 = subject[0], points, point;
  while (1) {
    var current = start2, isSubject = true;
    while (current.v)
      if ((current = current.n) === start2)
        return;
    points = current.z;
    stream.lineStart();
    do {
      current.v = current.o.v = true;
      if (current.e) {
        if (isSubject) {
          for (i = 0, n = points.length; i < n; ++i)
            stream.point((point = points[i])[0], point[1]);
        } else {
          interpolate2(current.x, current.n.x, 1, stream);
        }
        current = current.n;
      } else {
        if (isSubject) {
          points = current.p.z;
          for (i = points.length - 1; i >= 0; --i)
            stream.point((point = points[i])[0], point[1]);
        } else {
          interpolate2(current.x, current.p.x, -1, stream);
        }
        current = current.p;
      }
      current = current.o;
      points = current.z;
      isSubject = !isSubject;
    } while (!current.v);
    stream.lineEnd();
  }
}
function link(array2) {
  if (!(n = array2.length))
    return;
  var n, i = 0, a = array2[0], b;
  while (++i < n) {
    a.n = b = array2[i];
    b.p = a;
    a = b;
  }
  a.n = b = array2[0];
  b.p = a;
}
function clipLine(a, b, x02, y02, x12, y12) {
  var ax = a[0], ay = a[1], bx = b[0], by = b[1], t0 = 0, t1 = 1, dx = bx - ax, dy = by - ay, r;
  r = x02 - ax;
  if (!dx && r > 0)
    return;
  r /= dx;
  if (dx < 0) {
    if (r < t0)
      return;
    if (r < t1)
      t1 = r;
  } else if (dx > 0) {
    if (r > t1)
      return;
    if (r > t0)
      t0 = r;
  }
  r = x12 - ax;
  if (!dx && r < 0)
    return;
  r /= dx;
  if (dx < 0) {
    if (r > t1)
      return;
    if (r > t0)
      t0 = r;
  } else if (dx > 0) {
    if (r < t0)
      return;
    if (r < t1)
      t1 = r;
  }
  r = y02 - ay;
  if (!dy && r > 0)
    return;
  r /= dy;
  if (dy < 0) {
    if (r < t0)
      return;
    if (r < t1)
      t1 = r;
  } else if (dy > 0) {
    if (r > t1)
      return;
    if (r > t0)
      t0 = r;
  }
  r = y12 - ay;
  if (!dy && r < 0)
    return;
  r /= dy;
  if (dy < 0) {
    if (r > t1)
      return;
    if (r > t0)
      t0 = r;
  } else if (dy > 0) {
    if (r < t0)
      return;
    if (r < t1)
      t1 = r;
  }
  if (t0 > 0)
    a[0] = ax + t0 * dx, a[1] = ay + t0 * dy;
  if (t1 < 1)
    b[0] = ax + t1 * dx, b[1] = ay + t1 * dy;
  return true;
}
var clipMax = 1e9, clipMin = -clipMax;
function clipRectangle(x02, y02, x12, y12) {
  function visible(x, y) {
    return x02 <= x && x <= x12 && y02 <= y && y <= y12;
  }
  function interpolate2(from, to, direction, stream) {
    var a = 0, a1 = 0;
    if (from == null || (a = corner(from, direction)) !== (a1 = corner(to, direction)) || comparePoint(from, to) < 0 ^ direction > 0) {
      do
        stream.point(a === 0 || a === 3 ? x02 : x12, a > 1 ? y12 : y02);
      while ((a = (a + direction + 4) % 4) !== a1);
    } else {
      stream.point(to[0], to[1]);
    }
  }
  function corner(p, direction) {
    return abs(p[0] - x02) < epsilon ? direction > 0 ? 0 : 3 : abs(p[0] - x12) < epsilon ? direction > 0 ? 2 : 1 : abs(p[1] - y02) < epsilon ? direction > 0 ? 1 : 0 : direction > 0 ? 3 : 2;
  }
  function compareIntersection(a, b) {
    return comparePoint(a.x, b.x);
  }
  function comparePoint(a, b) {
    var ca = corner(a, 1), cb = corner(b, 1);
    return ca !== cb ? ca - cb : ca === 0 ? b[1] - a[1] : ca === 1 ? a[0] - b[0] : ca === 2 ? a[1] - b[1] : b[0] - a[0];
  }
  return function(stream) {
    var activeStream = stream, bufferStream = clipBuffer(), segments, polygon, ring, x__, y__, v__, x_, y_, v_, first, clean;
    var clipStream = {
      point,
      lineStart,
      lineEnd,
      polygonStart,
      polygonEnd
    };
    function point(x, y) {
      if (visible(x, y))
        activeStream.point(x, y);
    }
    function polygonInside() {
      var winding = 0;
      for (var i = 0, n = polygon.length; i < n; ++i) {
        for (var ring2 = polygon[i], j = 1, m = ring2.length, point2 = ring2[0], a0, a1, b0 = point2[0], b1 = point2[1]; j < m; ++j) {
          a0 = b0, a1 = b1, point2 = ring2[j], b0 = point2[0], b1 = point2[1];
          if (a1 <= y12) {
            if (b1 > y12 && (b0 - a0) * (y12 - a1) > (b1 - a1) * (x02 - a0))
              ++winding;
          } else {
            if (b1 <= y12 && (b0 - a0) * (y12 - a1) < (b1 - a1) * (x02 - a0))
              --winding;
          }
        }
      }
      return winding;
    }
    function polygonStart() {
      activeStream = bufferStream, segments = [], polygon = [], clean = true;
    }
    function polygonEnd() {
      var startInside = polygonInside(), cleanInside = clean && startInside, visible2 = (segments = merge(segments)).length;
      if (cleanInside || visible2) {
        stream.polygonStart();
        if (cleanInside) {
          stream.lineStart();
          interpolate2(null, null, 1, stream);
          stream.lineEnd();
        }
        if (visible2) {
          clipRejoin(segments, compareIntersection, startInside, interpolate2, stream);
        }
        stream.polygonEnd();
      }
      activeStream = stream, segments = polygon = ring = null;
    }
    function lineStart() {
      clipStream.point = linePoint;
      if (polygon)
        polygon.push(ring = []);
      first = true;
      v_ = false;
      x_ = y_ = NaN;
    }
    function lineEnd() {
      if (segments) {
        linePoint(x__, y__);
        if (v__ && v_)
          bufferStream.rejoin();
        segments.push(bufferStream.result());
      }
      clipStream.point = point;
      if (v_)
        activeStream.lineEnd();
    }
    function linePoint(x, y) {
      var v = visible(x, y);
      if (polygon)
        ring.push([x, y]);
      if (first) {
        x__ = x, y__ = y, v__ = v;
        first = false;
        if (v) {
          activeStream.lineStart();
          activeStream.point(x, y);
        }
      } else {
        if (v && v_)
          activeStream.point(x, y);
        else {
          var a = [x_ = Math.max(clipMin, Math.min(clipMax, x_)), y_ = Math.max(clipMin, Math.min(clipMax, y_))], b = [x = Math.max(clipMin, Math.min(clipMax, x)), y = Math.max(clipMin, Math.min(clipMax, y))];
          if (clipLine(a, b, x02, y02, x12, y12)) {
            if (!v_) {
              activeStream.lineStart();
              activeStream.point(a[0], a[1]);
            }
            activeStream.point(b[0], b[1]);
            if (!v)
              activeStream.lineEnd();
            clean = false;
          } else if (v) {
            activeStream.lineStart();
            activeStream.point(x, y);
            clean = false;
          }
        }
      }
      x_ = x, y_ = y, v_ = v;
    }
    return clipStream;
  };
}
const identity$5 = (x) => x;
var areaSum = new Adder(), areaRingSum = new Adder(), x00$2, y00$2, x0$3, y0$3;
var areaStream = {
  point: noop$1,
  lineStart: noop$1,
  lineEnd: noop$1,
  polygonStart: function() {
    areaStream.lineStart = areaRingStart;
    areaStream.lineEnd = areaRingEnd;
  },
  polygonEnd: function() {
    areaStream.lineStart = areaStream.lineEnd = areaStream.point = noop$1;
    areaSum.add(abs(areaRingSum));
    areaRingSum = new Adder();
  },
  result: function() {
    var area2 = areaSum / 2;
    areaSum = new Adder();
    return area2;
  }
};
function areaRingStart() {
  areaStream.point = areaPointFirst;
}
function areaPointFirst(x, y) {
  areaStream.point = areaPoint;
  x00$2 = x0$3 = x, y00$2 = y0$3 = y;
}
function areaPoint(x, y) {
  areaRingSum.add(y0$3 * x - x0$3 * y);
  x0$3 = x, y0$3 = y;
}
function areaRingEnd() {
  areaPoint(x00$2, y00$2);
}
const pathArea = areaStream;
var x0$2 = Infinity, y0$2 = x0$2, x1 = -x0$2, y1 = x1;
var boundsStream = {
  point: boundsPoint,
  lineStart: noop$1,
  lineEnd: noop$1,
  polygonStart: noop$1,
  polygonEnd: noop$1,
  result: function() {
    var bounds = [[x0$2, y0$2], [x1, y1]];
    x1 = y1 = -(y0$2 = x0$2 = Infinity);
    return bounds;
  }
};
function boundsPoint(x, y) {
  if (x < x0$2)
    x0$2 = x;
  if (x > x1)
    x1 = x;
  if (y < y0$2)
    y0$2 = y;
  if (y > y1)
    y1 = y;
}
const boundsStream$1 = boundsStream;
var X0$1 = 0, Y0$1 = 0, Z0 = 0, X1 = 0, Y1 = 0, Z1 = 0, X2 = 0, Y2 = 0, Z2 = 0, x00$1, y00$1, x0$1, y0$1;
var centroidStream = {
  point: centroidPoint,
  lineStart: centroidLineStart,
  lineEnd: centroidLineEnd,
  polygonStart: function() {
    centroidStream.lineStart = centroidRingStart;
    centroidStream.lineEnd = centroidRingEnd;
  },
  polygonEnd: function() {
    centroidStream.point = centroidPoint;
    centroidStream.lineStart = centroidLineStart;
    centroidStream.lineEnd = centroidLineEnd;
  },
  result: function() {
    var centroid = Z2 ? [X2 / Z2, Y2 / Z2] : Z1 ? [X1 / Z1, Y1 / Z1] : Z0 ? [X0$1 / Z0, Y0$1 / Z0] : [NaN, NaN];
    X0$1 = Y0$1 = Z0 = X1 = Y1 = Z1 = X2 = Y2 = Z2 = 0;
    return centroid;
  }
};
function centroidPoint(x, y) {
  X0$1 += x;
  Y0$1 += y;
  ++Z0;
}
function centroidLineStart() {
  centroidStream.point = centroidPointFirstLine;
}
function centroidPointFirstLine(x, y) {
  centroidStream.point = centroidPointLine;
  centroidPoint(x0$1 = x, y0$1 = y);
}
function centroidPointLine(x, y) {
  var dx = x - x0$1, dy = y - y0$1, z = sqrt$1(dx * dx + dy * dy);
  X1 += z * (x0$1 + x) / 2;
  Y1 += z * (y0$1 + y) / 2;
  Z1 += z;
  centroidPoint(x0$1 = x, y0$1 = y);
}
function centroidLineEnd() {
  centroidStream.point = centroidPoint;
}
function centroidRingStart() {
  centroidStream.point = centroidPointFirstRing;
}
function centroidRingEnd() {
  centroidPointRing(x00$1, y00$1);
}
function centroidPointFirstRing(x, y) {
  centroidStream.point = centroidPointRing;
  centroidPoint(x00$1 = x0$1 = x, y00$1 = y0$1 = y);
}
function centroidPointRing(x, y) {
  var dx = x - x0$1, dy = y - y0$1, z = sqrt$1(dx * dx + dy * dy);
  X1 += z * (x0$1 + x) / 2;
  Y1 += z * (y0$1 + y) / 2;
  Z1 += z;
  z = y0$1 * x - x0$1 * y;
  X2 += z * (x0$1 + x);
  Y2 += z * (y0$1 + y);
  Z2 += z * 3;
  centroidPoint(x0$1 = x, y0$1 = y);
}
const pathCentroid = centroidStream;
function PathContext(context2) {
  this._context = context2;
}
PathContext.prototype = {
  _radius: 4.5,
  pointRadius: function(_) {
    return this._radius = _, this;
  },
  polygonStart: function() {
    this._line = 0;
  },
  polygonEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line === 0)
      this._context.closePath();
    this._point = NaN;
  },
  point: function(x, y) {
    switch (this._point) {
      case 0: {
        this._context.moveTo(x, y);
        this._point = 1;
        break;
      }
      case 1: {
        this._context.lineTo(x, y);
        break;
      }
      default: {
        this._context.moveTo(x + this._radius, y);
        this._context.arc(x, y, this._radius, 0, tau);
        break;
      }
    }
  },
  result: noop$1
};
var lengthSum = new Adder(), lengthRing, x00, y00, x0, y0;
var lengthStream = {
  point: noop$1,
  lineStart: function() {
    lengthStream.point = lengthPointFirst;
  },
  lineEnd: function() {
    if (lengthRing)
      lengthPoint(x00, y00);
    lengthStream.point = noop$1;
  },
  polygonStart: function() {
    lengthRing = true;
  },
  polygonEnd: function() {
    lengthRing = null;
  },
  result: function() {
    var length = +lengthSum;
    lengthSum = new Adder();
    return length;
  }
};
function lengthPointFirst(x, y) {
  lengthStream.point = lengthPoint;
  x00 = x0 = x, y00 = y0 = y;
}
function lengthPoint(x, y) {
  x0 -= x, y0 -= y;
  lengthSum.add(sqrt$1(x0 * x0 + y0 * y0));
  x0 = x, y0 = y;
}
const pathMeasure = lengthStream;
let cacheDigits, cacheAppend, cacheRadius, cacheCircle;
class PathString {
  constructor(digits) {
    this._append = digits == null ? append : appendRound(digits);
    this._radius = 4.5;
    this._ = "";
  }
  pointRadius(_) {
    this._radius = +_;
    return this;
  }
  polygonStart() {
    this._line = 0;
  }
  polygonEnd() {
    this._line = NaN;
  }
  lineStart() {
    this._point = 0;
  }
  lineEnd() {
    if (this._line === 0)
      this._ += "Z";
    this._point = NaN;
  }
  point(x, y) {
    switch (this._point) {
      case 0: {
        this._append`M${x},${y}`;
        this._point = 1;
        break;
      }
      case 1: {
        this._append`L${x},${y}`;
        break;
      }
      default: {
        this._append`M${x},${y}`;
        if (this._radius !== cacheRadius || this._append !== cacheAppend) {
          const r = this._radius;
          const s = this._;
          this._ = "";
          this._append`m0,${r}a${r},${r} 0 1,1 0,${-2 * r}a${r},${r} 0 1,1 0,${2 * r}z`;
          cacheRadius = r;
          cacheAppend = this._append;
          cacheCircle = this._;
          this._ = s;
        }
        this._ += cacheCircle;
        break;
      }
    }
  }
  result() {
    const result = this._;
    this._ = "";
    return result.length ? result : null;
  }
}
function append(strings) {
  let i = 1;
  this._ += strings[0];
  for (const j = strings.length; i < j; ++i) {
    this._ += arguments[i] + strings[i];
  }
}
function appendRound(digits) {
  const d = Math.floor(digits);
  if (!(d >= 0))
    throw new RangeError(`invalid digits: ${digits}`);
  if (d > 15)
    return append;
  if (d !== cacheDigits) {
    const k = 10 ** d;
    cacheDigits = d;
    cacheAppend = function append2(strings) {
      let i = 1;
      this._ += strings[0];
      for (const j = strings.length; i < j; ++i) {
        this._ += Math.round(arguments[i] * k) / k + strings[i];
      }
    };
  }
  return cacheAppend;
}
function geoPath(projection, context2) {
  let digits = 3, pointRadius = 4.5, projectionStream, contextStream;
  function path(object2) {
    if (object2) {
      if (typeof pointRadius === "function")
        contextStream.pointRadius(+pointRadius.apply(this, arguments));
      geoStream(object2, projectionStream(contextStream));
    }
    return contextStream.result();
  }
  path.area = function(object2) {
    geoStream(object2, projectionStream(pathArea));
    return pathArea.result();
  };
  path.measure = function(object2) {
    geoStream(object2, projectionStream(pathMeasure));
    return pathMeasure.result();
  };
  path.bounds = function(object2) {
    geoStream(object2, projectionStream(boundsStream$1));
    return boundsStream$1.result();
  };
  path.centroid = function(object2) {
    geoStream(object2, projectionStream(pathCentroid));
    return pathCentroid.result();
  };
  path.projection = function(_) {
    if (!arguments.length)
      return projection;
    projectionStream = _ == null ? (projection = null, identity$5) : (projection = _).stream;
    return path;
  };
  path.context = function(_) {
    if (!arguments.length)
      return context2;
    contextStream = _ == null ? (context2 = null, new PathString(digits)) : new PathContext(context2 = _);
    if (typeof pointRadius !== "function")
      contextStream.pointRadius(pointRadius);
    return path;
  };
  path.pointRadius = function(_) {
    if (!arguments.length)
      return pointRadius;
    pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
    return path;
  };
  path.digits = function(_) {
    if (!arguments.length)
      return digits;
    if (_ == null)
      digits = null;
    else {
      const d = Math.floor(_);
      if (!(d >= 0))
        throw new RangeError(`invalid digits: ${_}`);
      digits = d;
    }
    if (context2 === null)
      contextStream = new PathString(digits);
    return path;
  };
  return path.projection(projection).digits(digits).context(context2);
}
function transformer$2(methods) {
  return function(stream) {
    var s = new TransformStream();
    for (var key in methods)
      s[key] = methods[key];
    s.stream = stream;
    return s;
  };
}
function TransformStream() {
}
TransformStream.prototype = {
  constructor: TransformStream,
  point: function(x, y) {
    this.stream.point(x, y);
  },
  sphere: function() {
    this.stream.sphere();
  },
  lineStart: function() {
    this.stream.lineStart();
  },
  lineEnd: function() {
    this.stream.lineEnd();
  },
  polygonStart: function() {
    this.stream.polygonStart();
  },
  polygonEnd: function() {
    this.stream.polygonEnd();
  }
};
function fit(projection, fitBounds, object2) {
  var clip = projection.clipExtent && projection.clipExtent();
  projection.scale(150).translate([0, 0]);
  if (clip != null)
    projection.clipExtent(null);
  geoStream(object2, projection.stream(boundsStream$1));
  fitBounds(boundsStream$1.result());
  if (clip != null)
    projection.clipExtent(clip);
  return projection;
}
function fitExtent(projection, extent2, object2) {
  return fit(projection, function(b) {
    var w = extent2[1][0] - extent2[0][0], h = extent2[1][1] - extent2[0][1], k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1])), x = +extent2[0][0] + (w - k * (b[1][0] + b[0][0])) / 2, y = +extent2[0][1] + (h - k * (b[1][1] + b[0][1])) / 2;
    projection.scale(150 * k).translate([x, y]);
  }, object2);
}
function fitSize(projection, size, object2) {
  return fitExtent(projection, [[0, 0], size], object2);
}
function fitWidth(projection, width, object2) {
  return fit(projection, function(b) {
    var w = +width, k = w / (b[1][0] - b[0][0]), x = (w - k * (b[1][0] + b[0][0])) / 2, y = -k * b[0][1];
    projection.scale(150 * k).translate([x, y]);
  }, object2);
}
function fitHeight(projection, height, object2) {
  return fit(projection, function(b) {
    var h = +height, k = h / (b[1][1] - b[0][1]), x = -k * b[0][0], y = (h - k * (b[1][1] + b[0][1])) / 2;
    projection.scale(150 * k).translate([x, y]);
  }, object2);
}
function geoIdentity() {
  var k = 1, tx = 0, ty = 0, sx = 1, sy = 1, alpha = 0, ca, sa, x02 = null, y02, x12, y12, kx = 1, ky = 1, transform = transformer$2({
    point: function(x, y) {
      var p = projection([x, y]);
      this.stream.point(p[0], p[1]);
    }
  }), postclip = identity$5, cache, cacheStream;
  function reset() {
    kx = k * sx;
    ky = k * sy;
    cache = cacheStream = null;
    return projection;
  }
  function projection(p) {
    var x = p[0] * kx, y = p[1] * ky;
    if (alpha) {
      var t = y * ca - x * sa;
      x = x * ca + y * sa;
      y = t;
    }
    return [x + tx, y + ty];
  }
  projection.invert = function(p) {
    var x = p[0] - tx, y = p[1] - ty;
    if (alpha) {
      var t = y * ca + x * sa;
      x = x * ca - y * sa;
      y = t;
    }
    return [x / kx, y / ky];
  };
  projection.stream = function(stream) {
    return cache && cacheStream === stream ? cache : cache = transform(postclip(cacheStream = stream));
  };
  projection.postclip = function(_) {
    return arguments.length ? (postclip = _, x02 = y02 = x12 = y12 = null, reset()) : postclip;
  };
  projection.clipExtent = function(_) {
    return arguments.length ? (postclip = _ == null ? (x02 = y02 = x12 = y12 = null, identity$5) : clipRectangle(x02 = +_[0][0], y02 = +_[0][1], x12 = +_[1][0], y12 = +_[1][1]), reset()) : x02 == null ? null : [[x02, y02], [x12, y12]];
  };
  projection.scale = function(_) {
    return arguments.length ? (k = +_, reset()) : k;
  };
  projection.translate = function(_) {
    return arguments.length ? (tx = +_[0], ty = +_[1], reset()) : [tx, ty];
  };
  projection.angle = function(_) {
    return arguments.length ? (alpha = _ % 360 * radians$1, sa = sin(alpha), ca = cos(alpha), reset()) : alpha * degrees$2;
  };
  projection.reflectX = function(_) {
    return arguments.length ? (sx = _ ? -1 : 1, reset()) : sx < 0;
  };
  projection.reflectY = function(_) {
    return arguments.length ? (sy = _ ? -1 : 1, reset()) : sy < 0;
  };
  projection.fitExtent = function(extent2, object2) {
    return fitExtent(projection, extent2, object2);
  };
  projection.fitSize = function(size, object2) {
    return fitSize(projection, size, object2);
  };
  projection.fitWidth = function(width, object2) {
    return fitWidth(projection, width, object2);
  };
  projection.fitHeight = function(height, object2) {
    return fitHeight(projection, height, object2);
  };
  return projection;
}
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var lodash_mergeExports = {};
var lodash_merge = {
  get exports() {
    return lodash_mergeExports;
  },
  set exports(v) {
    lodash_mergeExports = v;
  }
};
(function(module, exports) {
  var LARGE_ARRAY_SIZE = 200;
  var HASH_UNDEFINED = "__lodash_hash_undefined__";
  var HOT_COUNT = 800, HOT_SPAN = 16;
  var MAX_SAFE_INTEGER = 9007199254740991;
  var argsTag = "[object Arguments]", arrayTag = "[object Array]", asyncTag = "[object AsyncFunction]", boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", mapTag = "[object Map]", numberTag = "[object Number]", nullTag = "[object Null]", objectTag = "[object Object]", proxyTag = "[object Proxy]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", undefinedTag = "[object Undefined]", weakMapTag = "[object WeakMap]";
  var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
  var reIsHostCtor = /^\[object .+?Constructor\]$/;
  var reIsUint = /^(?:0|[1-9]\d*)$/;
  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
  var freeGlobal = typeof commonjsGlobal == "object" && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
  var freeSelf = typeof self == "object" && self && self.Object === Object && self;
  var root2 = freeGlobal || freeSelf || Function("return this")();
  var freeExports = exports && !exports.nodeType && exports;
  var freeModule = freeExports && true && module && !module.nodeType && module;
  var moduleExports = freeModule && freeModule.exports === freeExports;
  var freeProcess = moduleExports && freeGlobal.process;
  var nodeUtil = function() {
    try {
      var types = freeModule && freeModule.require && freeModule.require("util").types;
      if (types) {
        return types;
      }
      return freeProcess && freeProcess.binding && freeProcess.binding("util");
    } catch (e) {
    }
  }();
  var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
  function apply(func, thisArg, args) {
    switch (args.length) {
      case 0:
        return func.call(thisArg);
      case 1:
        return func.call(thisArg, args[0]);
      case 2:
        return func.call(thisArg, args[0], args[1]);
      case 3:
        return func.call(thisArg, args[0], args[1], args[2]);
    }
    return func.apply(thisArg, args);
  }
  function baseTimes(n, iteratee) {
    var index = -1, result = Array(n);
    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }
  function baseUnary(func) {
    return function(value) {
      return func(value);
    };
  }
  function getValue(object2, key) {
    return object2 == null ? void 0 : object2[key];
  }
  function overArg(func, transform) {
    return function(arg) {
      return func(transform(arg));
    };
  }
  var arrayProto = Array.prototype, funcProto = Function.prototype, objectProto = Object.prototype;
  var coreJsData = root2["__core-js_shared__"];
  var funcToString = funcProto.toString;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var maskSrcKey = function() {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
    return uid ? "Symbol(src)_1." + uid : "";
  }();
  var nativeObjectToString = objectProto.toString;
  var objectCtorString = funcToString.call(Object);
  var reIsNative = RegExp(
    "^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
  );
  var Buffer = moduleExports ? root2.Buffer : void 0, Symbol2 = root2.Symbol, Uint8Array2 = root2.Uint8Array, allocUnsafe = Buffer ? Buffer.allocUnsafe : void 0, getPrototype = overArg(Object.getPrototypeOf, Object), objectCreate = Object.create, propertyIsEnumerable = objectProto.propertyIsEnumerable, splice = arrayProto.splice, symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
  var defineProperty = function() {
    try {
      var func = getNative(Object, "defineProperty");
      func({}, "", {});
      return func;
    } catch (e) {
    }
  }();
  var nativeIsBuffer = Buffer ? Buffer.isBuffer : void 0, nativeMax = Math.max, nativeNow = Date.now;
  var Map2 = getNative(root2, "Map"), nativeCreate = getNative(Object, "create");
  var baseCreate = function() {
    function object2() {
    }
    return function(proto) {
      if (!isObject(proto)) {
        return {};
      }
      if (objectCreate) {
        return objectCreate(proto);
      }
      object2.prototype = proto;
      var result = new object2();
      object2.prototype = void 0;
      return result;
    };
  }();
  function Hash(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  function hashClear() {
    this.__data__ = nativeCreate ? nativeCreate(null) : {};
    this.size = 0;
  }
  function hashDelete(key) {
    var result = this.has(key) && delete this.__data__[key];
    this.size -= result ? 1 : 0;
    return result;
  }
  function hashGet(key) {
    var data = this.__data__;
    if (nativeCreate) {
      var result = data[key];
      return result === HASH_UNDEFINED ? void 0 : result;
    }
    return hasOwnProperty.call(data, key) ? data[key] : void 0;
  }
  function hashHas(key) {
    var data = this.__data__;
    return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
  }
  function hashSet(key, value) {
    var data = this.__data__;
    this.size += this.has(key) ? 0 : 1;
    data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
    return this;
  }
  Hash.prototype.clear = hashClear;
  Hash.prototype["delete"] = hashDelete;
  Hash.prototype.get = hashGet;
  Hash.prototype.has = hashHas;
  Hash.prototype.set = hashSet;
  function ListCache(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  function listCacheClear() {
    this.__data__ = [];
    this.size = 0;
  }
  function listCacheDelete(key) {
    var data = this.__data__, index = assocIndexOf(data, key);
    if (index < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index, 1);
    }
    --this.size;
    return true;
  }
  function listCacheGet(key) {
    var data = this.__data__, index = assocIndexOf(data, key);
    return index < 0 ? void 0 : data[index][1];
  }
  function listCacheHas(key) {
    return assocIndexOf(this.__data__, key) > -1;
  }
  function listCacheSet(key, value) {
    var data = this.__data__, index = assocIndexOf(data, key);
    if (index < 0) {
      ++this.size;
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }
    return this;
  }
  ListCache.prototype.clear = listCacheClear;
  ListCache.prototype["delete"] = listCacheDelete;
  ListCache.prototype.get = listCacheGet;
  ListCache.prototype.has = listCacheHas;
  ListCache.prototype.set = listCacheSet;
  function MapCache(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  function mapCacheClear() {
    this.size = 0;
    this.__data__ = {
      "hash": new Hash(),
      "map": new (Map2 || ListCache)(),
      "string": new Hash()
    };
  }
  function mapCacheDelete(key) {
    var result = getMapData(this, key)["delete"](key);
    this.size -= result ? 1 : 0;
    return result;
  }
  function mapCacheGet(key) {
    return getMapData(this, key).get(key);
  }
  function mapCacheHas(key) {
    return getMapData(this, key).has(key);
  }
  function mapCacheSet(key, value) {
    var data = getMapData(this, key), size = data.size;
    data.set(key, value);
    this.size += data.size == size ? 0 : 1;
    return this;
  }
  MapCache.prototype.clear = mapCacheClear;
  MapCache.prototype["delete"] = mapCacheDelete;
  MapCache.prototype.get = mapCacheGet;
  MapCache.prototype.has = mapCacheHas;
  MapCache.prototype.set = mapCacheSet;
  function Stack(entries) {
    var data = this.__data__ = new ListCache(entries);
    this.size = data.size;
  }
  function stackClear() {
    this.__data__ = new ListCache();
    this.size = 0;
  }
  function stackDelete(key) {
    var data = this.__data__, result = data["delete"](key);
    this.size = data.size;
    return result;
  }
  function stackGet(key) {
    return this.__data__.get(key);
  }
  function stackHas(key) {
    return this.__data__.has(key);
  }
  function stackSet(key, value) {
    var data = this.__data__;
    if (data instanceof ListCache) {
      var pairs = data.__data__;
      if (!Map2 || pairs.length < LARGE_ARRAY_SIZE - 1) {
        pairs.push([key, value]);
        this.size = ++data.size;
        return this;
      }
      data = this.__data__ = new MapCache(pairs);
    }
    data.set(key, value);
    this.size = data.size;
    return this;
  }
  Stack.prototype.clear = stackClear;
  Stack.prototype["delete"] = stackDelete;
  Stack.prototype.get = stackGet;
  Stack.prototype.has = stackHas;
  Stack.prototype.set = stackSet;
  function arrayLikeKeys(value, inherited) {
    var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
    for (var key in value) {
      if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
      (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
      isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
      isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
      isIndex(key, length)))) {
        result.push(key);
      }
    }
    return result;
  }
  function assignMergeValue(object2, key, value) {
    if (value !== void 0 && !eq(object2[key], value) || value === void 0 && !(key in object2)) {
      baseAssignValue(object2, key, value);
    }
  }
  function assignValue(object2, key, value) {
    var objValue = object2[key];
    if (!(hasOwnProperty.call(object2, key) && eq(objValue, value)) || value === void 0 && !(key in object2)) {
      baseAssignValue(object2, key, value);
    }
  }
  function assocIndexOf(array2, key) {
    var length = array2.length;
    while (length--) {
      if (eq(array2[length][0], key)) {
        return length;
      }
    }
    return -1;
  }
  function baseAssignValue(object2, key, value) {
    if (key == "__proto__" && defineProperty) {
      defineProperty(object2, key, {
        "configurable": true,
        "enumerable": true,
        "value": value,
        "writable": true
      });
    } else {
      object2[key] = value;
    }
  }
  var baseFor = createBaseFor();
  function baseGetTag(value) {
    if (value == null) {
      return value === void 0 ? undefinedTag : nullTag;
    }
    return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
  }
  function baseIsArguments(value) {
    return isObjectLike(value) && baseGetTag(value) == argsTag;
  }
  function baseIsNative(value) {
    if (!isObject(value) || isMasked(value)) {
      return false;
    }
    var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
  }
  function baseIsTypedArray(value) {
    return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
  }
  function baseKeysIn(object2) {
    if (!isObject(object2)) {
      return nativeKeysIn(object2);
    }
    var isProto = isPrototype(object2), result = [];
    for (var key in object2) {
      if (!(key == "constructor" && (isProto || !hasOwnProperty.call(object2, key)))) {
        result.push(key);
      }
    }
    return result;
  }
  function baseMerge(object2, source, srcIndex, customizer, stack) {
    if (object2 === source) {
      return;
    }
    baseFor(source, function(srcValue, key) {
      stack || (stack = new Stack());
      if (isObject(srcValue)) {
        baseMergeDeep(object2, source, key, srcIndex, baseMerge, customizer, stack);
      } else {
        var newValue = customizer ? customizer(safeGet(object2, key), srcValue, key + "", object2, source, stack) : void 0;
        if (newValue === void 0) {
          newValue = srcValue;
        }
        assignMergeValue(object2, key, newValue);
      }
    }, keysIn);
  }
  function baseMergeDeep(object2, source, key, srcIndex, mergeFunc, customizer, stack) {
    var objValue = safeGet(object2, key), srcValue = safeGet(source, key), stacked = stack.get(srcValue);
    if (stacked) {
      assignMergeValue(object2, key, stacked);
      return;
    }
    var newValue = customizer ? customizer(objValue, srcValue, key + "", object2, source, stack) : void 0;
    var isCommon = newValue === void 0;
    if (isCommon) {
      var isArr = isArray(srcValue), isBuff = !isArr && isBuffer(srcValue), isTyped = !isArr && !isBuff && isTypedArray(srcValue);
      newValue = srcValue;
      if (isArr || isBuff || isTyped) {
        if (isArray(objValue)) {
          newValue = objValue;
        } else if (isArrayLikeObject(objValue)) {
          newValue = copyArray(objValue);
        } else if (isBuff) {
          isCommon = false;
          newValue = cloneBuffer(srcValue, true);
        } else if (isTyped) {
          isCommon = false;
          newValue = cloneTypedArray(srcValue, true);
        } else {
          newValue = [];
        }
      } else if (isPlainObject(srcValue) || isArguments(srcValue)) {
        newValue = objValue;
        if (isArguments(objValue)) {
          newValue = toPlainObject(objValue);
        } else if (!isObject(objValue) || isFunction(objValue)) {
          newValue = initCloneObject(srcValue);
        }
      } else {
        isCommon = false;
      }
    }
    if (isCommon) {
      stack.set(srcValue, newValue);
      mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
      stack["delete"](srcValue);
    }
    assignMergeValue(object2, key, newValue);
  }
  function baseRest(func, start2) {
    return setToString(overRest(func, start2, identity2), func + "");
  }
  var baseSetToString = !defineProperty ? identity2 : function(func, string) {
    return defineProperty(func, "toString", {
      "configurable": true,
      "enumerable": false,
      "value": constant2(string),
      "writable": true
    });
  };
  function cloneBuffer(buffer, isDeep) {
    if (isDeep) {
      return buffer.slice();
    }
    var length = buffer.length, result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
    buffer.copy(result);
    return result;
  }
  function cloneArrayBuffer(arrayBuffer) {
    var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
    new Uint8Array2(result).set(new Uint8Array2(arrayBuffer));
    return result;
  }
  function cloneTypedArray(typedArray, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
    return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
  }
  function copyArray(source, array2) {
    var index = -1, length = source.length;
    array2 || (array2 = Array(length));
    while (++index < length) {
      array2[index] = source[index];
    }
    return array2;
  }
  function copyObject(source, props, object2, customizer) {
    var isNew = !object2;
    object2 || (object2 = {});
    var index = -1, length = props.length;
    while (++index < length) {
      var key = props[index];
      var newValue = customizer ? customizer(object2[key], source[key], key, object2, source) : void 0;
      if (newValue === void 0) {
        newValue = source[key];
      }
      if (isNew) {
        baseAssignValue(object2, key, newValue);
      } else {
        assignValue(object2, key, newValue);
      }
    }
    return object2;
  }
  function createAssigner(assigner) {
    return baseRest(function(object2, sources) {
      var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : void 0, guard = length > 2 ? sources[2] : void 0;
      customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, customizer) : void 0;
      if (guard && isIterateeCall(sources[0], sources[1], guard)) {
        customizer = length < 3 ? void 0 : customizer;
        length = 1;
      }
      object2 = Object(object2);
      while (++index < length) {
        var source = sources[index];
        if (source) {
          assigner(object2, source, index, customizer);
        }
      }
      return object2;
    });
  }
  function createBaseFor(fromRight) {
    return function(object2, iteratee, keysFunc) {
      var index = -1, iterable = Object(object2), props = keysFunc(object2), length = props.length;
      while (length--) {
        var key = props[fromRight ? length : ++index];
        if (iteratee(iterable[key], key, iterable) === false) {
          break;
        }
      }
      return object2;
    };
  }
  function getMapData(map2, key) {
    var data = map2.__data__;
    return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
  }
  function getNative(object2, key) {
    var value = getValue(object2, key);
    return baseIsNative(value) ? value : void 0;
  }
  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
    try {
      value[symToStringTag] = void 0;
      var unmasked = true;
    } catch (e) {
    }
    var result = nativeObjectToString.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag] = tag;
      } else {
        delete value[symToStringTag];
      }
    }
    return result;
  }
  function initCloneObject(object2) {
    return typeof object2.constructor == "function" && !isPrototype(object2) ? baseCreate(getPrototype(object2)) : {};
  }
  function isIndex(value, length) {
    var type = typeof value;
    length = length == null ? MAX_SAFE_INTEGER : length;
    return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
  }
  function isIterateeCall(value, index, object2) {
    if (!isObject(object2)) {
      return false;
    }
    var type = typeof index;
    if (type == "number" ? isArrayLike(object2) && isIndex(index, object2.length) : type == "string" && index in object2) {
      return eq(object2[index], value);
    }
    return false;
  }
  function isKeyable(value) {
    var type = typeof value;
    return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
  }
  function isMasked(func) {
    return !!maskSrcKey && maskSrcKey in func;
  }
  function isPrototype(value) {
    var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
    return value === proto;
  }
  function nativeKeysIn(object2) {
    var result = [];
    if (object2 != null) {
      for (var key in Object(object2)) {
        result.push(key);
      }
    }
    return result;
  }
  function objectToString(value) {
    return nativeObjectToString.call(value);
  }
  function overRest(func, start2, transform) {
    start2 = nativeMax(start2 === void 0 ? func.length - 1 : start2, 0);
    return function() {
      var args = arguments, index = -1, length = nativeMax(args.length - start2, 0), array2 = Array(length);
      while (++index < length) {
        array2[index] = args[start2 + index];
      }
      index = -1;
      var otherArgs = Array(start2 + 1);
      while (++index < start2) {
        otherArgs[index] = args[index];
      }
      otherArgs[start2] = transform(array2);
      return apply(func, this, otherArgs);
    };
  }
  function safeGet(object2, key) {
    if (key === "constructor" && typeof object2[key] === "function") {
      return;
    }
    if (key == "__proto__") {
      return;
    }
    return object2[key];
  }
  var setToString = shortOut(baseSetToString);
  function shortOut(func) {
    var count = 0, lastCalled = 0;
    return function() {
      var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
      lastCalled = stamp;
      if (remaining > 0) {
        if (++count >= HOT_COUNT) {
          return arguments[0];
        }
      } else {
        count = 0;
      }
      return func.apply(void 0, arguments);
    };
  }
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {
      }
      try {
        return func + "";
      } catch (e) {
      }
    }
    return "";
  }
  function eq(value, other) {
    return value === other || value !== value && other !== other;
  }
  var isArguments = baseIsArguments(function() {
    return arguments;
  }()) ? baseIsArguments : function(value) {
    return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
  };
  var isArray = Array.isArray;
  function isArrayLike(value) {
    return value != null && isLength(value.length) && !isFunction(value);
  }
  function isArrayLikeObject(value) {
    return isObjectLike(value) && isArrayLike(value);
  }
  var isBuffer = nativeIsBuffer || stubFalse;
  function isFunction(value) {
    if (!isObject(value)) {
      return false;
    }
    var tag = baseGetTag(value);
    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
  }
  function isLength(value) {
    return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  }
  function isObject(value) {
    var type = typeof value;
    return value != null && (type == "object" || type == "function");
  }
  function isObjectLike(value) {
    return value != null && typeof value == "object";
  }
  function isPlainObject(value) {
    if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
      return false;
    }
    var proto = getPrototype(value);
    if (proto === null) {
      return true;
    }
    var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
    return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
  }
  var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
  function toPlainObject(value) {
    return copyObject(value, keysIn(value));
  }
  function keysIn(object2) {
    return isArrayLike(object2) ? arrayLikeKeys(object2, true) : baseKeysIn(object2);
  }
  var merge2 = createAssigner(function(object2, source, srcIndex) {
    baseMerge(object2, source, srcIndex);
  });
  function constant2(value) {
    return function() {
      return value;
    };
  }
  function identity2(value) {
    return value;
  }
  function stubFalse() {
    return false;
  }
  module.exports = merge2;
})(lodash_merge, lodash_mergeExports);
var frame = 0, timeout$1 = 0, interval = 0, pokeDelay = 1e3, taskHead, taskTail, clockLast = 0, clockNow = 0, clockSkew = 0, clock = typeof performance === "object" && performance.now ? performance : Date, setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) {
  setTimeout(f, 17);
};
function now() {
  return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
}
function clearNow() {
  clockNow = 0;
}
function Timer() {
  this._call = this._time = this._next = null;
}
Timer.prototype = timer.prototype = {
  constructor: Timer,
  restart: function(callback, delay, time) {
    if (typeof callback !== "function")
      throw new TypeError("callback is not a function");
    time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
    if (!this._next && taskTail !== this) {
      if (taskTail)
        taskTail._next = this;
      else
        taskHead = this;
      taskTail = this;
    }
    this._call = callback;
    this._time = time;
    sleep();
  },
  stop: function() {
    if (this._call) {
      this._call = null;
      this._time = Infinity;
      sleep();
    }
  }
};
function timer(callback, delay, time) {
  var t = new Timer();
  t.restart(callback, delay, time);
  return t;
}
function timerFlush() {
  now();
  ++frame;
  var t = taskHead, e;
  while (t) {
    if ((e = clockNow - t._time) >= 0)
      t._call.call(void 0, e);
    t = t._next;
  }
  --frame;
}
function wake() {
  clockNow = (clockLast = clock.now()) + clockSkew;
  frame = timeout$1 = 0;
  try {
    timerFlush();
  } finally {
    frame = 0;
    nap();
    clockNow = 0;
  }
}
function poke() {
  var now2 = clock.now(), delay = now2 - clockLast;
  if (delay > pokeDelay)
    clockSkew -= delay, clockLast = now2;
}
function nap() {
  var t0, t1 = taskHead, t2, time = Infinity;
  while (t1) {
    if (t1._call) {
      if (time > t1._time)
        time = t1._time;
      t0 = t1, t1 = t1._next;
    } else {
      t2 = t1._next, t1._next = null;
      t1 = t0 ? t0._next = t2 : taskHead = t2;
    }
  }
  taskTail = t0;
  sleep(time);
}
function sleep(time) {
  if (frame)
    return;
  if (timeout$1)
    timeout$1 = clearTimeout(timeout$1);
  var delay = time - clockNow;
  if (delay > 24) {
    if (time < Infinity)
      timeout$1 = setTimeout(wake, time - clock.now() - clockSkew);
    if (interval)
      interval = clearInterval(interval);
  } else {
    if (!interval)
      clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
    frame = 1, setFrame(wake);
  }
}
function timeout(callback, delay, time) {
  var t = new Timer();
  delay = delay == null ? 0 : +delay;
  t.restart((elapsed) => {
    t.stop();
    callback(elapsed + delay);
  }, delay, time);
  return t;
}
var noop = { value: () => {
} };
function dispatch() {
  for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
    if (!(t = arguments[i] + "") || t in _ || /[\s.]/.test(t))
      throw new Error("illegal type: " + t);
    _[t] = [];
  }
  return new Dispatch(_);
}
function Dispatch(_) {
  this._ = _;
}
function parseTypenames(typenames, types) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0)
      name = t.slice(i + 1), t = t.slice(0, i);
    if (t && !types.hasOwnProperty(t))
      throw new Error("unknown type: " + t);
    return { type: t, name };
  });
}
Dispatch.prototype = dispatch.prototype = {
  constructor: Dispatch,
  on: function(typename, callback) {
    var _ = this._, T = parseTypenames(typename + "", _), t, i = -1, n = T.length;
    if (arguments.length < 2) {
      while (++i < n)
        if ((t = (typename = T[i]).type) && (t = get$1(_[t], typename.name)))
          return t;
      return;
    }
    if (callback != null && typeof callback !== "function")
      throw new Error("invalid callback: " + callback);
    while (++i < n) {
      if (t = (typename = T[i]).type)
        _[t] = set$1(_[t], typename.name, callback);
      else if (callback == null)
        for (t in _)
          _[t] = set$1(_[t], typename.name, null);
    }
    return this;
  },
  copy: function() {
    var copy2 = {}, _ = this._;
    for (var t in _)
      copy2[t] = _[t].slice();
    return new Dispatch(copy2);
  },
  call: function(type, that) {
    if ((n = arguments.length - 2) > 0)
      for (var args = new Array(n), i = 0, n, t; i < n; ++i)
        args[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(type))
      throw new Error("unknown type: " + type);
    for (t = this._[type], i = 0, n = t.length; i < n; ++i)
      t[i].value.apply(that, args);
  },
  apply: function(type, that, args) {
    if (!this._.hasOwnProperty(type))
      throw new Error("unknown type: " + type);
    for (var t = this._[type], i = 0, n = t.length; i < n; ++i)
      t[i].value.apply(that, args);
  }
};
function get$1(type, name) {
  for (var i = 0, n = type.length, c2; i < n; ++i) {
    if ((c2 = type[i]).name === name) {
      return c2.value;
    }
  }
}
function set$1(type, name, callback) {
  for (var i = 0, n = type.length; i < n; ++i) {
    if (type[i].name === name) {
      type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
      break;
    }
  }
  if (callback != null)
    type.push({ name, value: callback });
  return type;
}
const nonpassive = { passive: false };
const nonpassivecapture = { capture: true, passive: false };
function nopropagation$1(event) {
  event.stopImmediatePropagation();
}
function noevent$1(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}
function dragDisable(view) {
  var root2 = view.document.documentElement, selection2 = select(view).on("dragstart.drag", noevent$1, nonpassivecapture);
  if ("onselectstart" in root2) {
    selection2.on("selectstart.drag", noevent$1, nonpassivecapture);
  } else {
    root2.__noselect = root2.style.MozUserSelect;
    root2.style.MozUserSelect = "none";
  }
}
function yesdrag(view, noclick) {
  var root2 = view.document.documentElement, selection2 = select(view).on("dragstart.drag", null);
  if (noclick) {
    selection2.on("click.drag", noevent$1, nonpassivecapture);
    setTimeout(function() {
      selection2.on("click.drag", null);
    }, 0);
  }
  if ("onselectstart" in root2) {
    selection2.on("selectstart.drag", null);
  } else {
    root2.style.MozUserSelect = root2.__noselect;
    delete root2.__noselect;
  }
}
const constant$2 = (x) => () => x;
function DragEvent(type, {
  sourceEvent: sourceEvent2,
  subject,
  target,
  identifier,
  active,
  x,
  y,
  dx,
  dy,
  dispatch: dispatch2
}) {
  Object.defineProperties(this, {
    type: { value: type, enumerable: true, configurable: true },
    sourceEvent: { value: sourceEvent2, enumerable: true, configurable: true },
    subject: { value: subject, enumerable: true, configurable: true },
    target: { value: target, enumerable: true, configurable: true },
    identifier: { value: identifier, enumerable: true, configurable: true },
    active: { value: active, enumerable: true, configurable: true },
    x: { value: x, enumerable: true, configurable: true },
    y: { value: y, enumerable: true, configurable: true },
    dx: { value: dx, enumerable: true, configurable: true },
    dy: { value: dy, enumerable: true, configurable: true },
    _: { value: dispatch2 }
  });
}
DragEvent.prototype.on = function() {
  var value = this._.on.apply(this._, arguments);
  return value === this._ ? this : value;
};
function defaultFilter$1(event) {
  return !event.ctrlKey && !event.button;
}
function defaultContainer() {
  return this.parentNode;
}
function defaultSubject(event, d) {
  return d == null ? { x: event.x, y: event.y } : d;
}
function defaultTouchable$1() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function drag() {
  var filter2 = defaultFilter$1, container = defaultContainer, subject = defaultSubject, touchable = defaultTouchable$1, gestures = {}, listeners = dispatch("start", "drag", "end"), active = 0, mousedownx, mousedowny, mousemoving, touchending, clickDistance2 = 0;
  function drag2(selection2) {
    selection2.on("mousedown.drag", mousedowned).filter(touchable).on("touchstart.drag", touchstarted).on("touchmove.drag", touchmoved, nonpassive).on("touchend.drag touchcancel.drag", touchended).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  function mousedowned(event, d) {
    if (touchending || !filter2.call(this, event, d))
      return;
    var gesture = beforestart(this, container.call(this, event, d), event, d, "mouse");
    if (!gesture)
      return;
    select(event.view).on("mousemove.drag", mousemoved, nonpassivecapture).on("mouseup.drag", mouseupped, nonpassivecapture);
    dragDisable(event.view);
    nopropagation$1(event);
    mousemoving = false;
    mousedownx = event.clientX;
    mousedowny = event.clientY;
    gesture("start", event);
  }
  function mousemoved(event) {
    noevent$1(event);
    if (!mousemoving) {
      var dx = event.clientX - mousedownx, dy = event.clientY - mousedowny;
      mousemoving = dx * dx + dy * dy > clickDistance2;
    }
    gestures.mouse("drag", event);
  }
  function mouseupped(event) {
    select(event.view).on("mousemove.drag mouseup.drag", null);
    yesdrag(event.view, mousemoving);
    noevent$1(event);
    gestures.mouse("end", event);
  }
  function touchstarted(event, d) {
    if (!filter2.call(this, event, d))
      return;
    var touches = event.changedTouches, c2 = container.call(this, event, d), n = touches.length, i, gesture;
    for (i = 0; i < n; ++i) {
      if (gesture = beforestart(this, c2, event, d, touches[i].identifier, touches[i])) {
        nopropagation$1(event);
        gesture("start", event, touches[i]);
      }
    }
  }
  function touchmoved(event) {
    var touches = event.changedTouches, n = touches.length, i, gesture;
    for (i = 0; i < n; ++i) {
      if (gesture = gestures[touches[i].identifier]) {
        noevent$1(event);
        gesture("drag", event, touches[i]);
      }
    }
  }
  function touchended(event) {
    var touches = event.changedTouches, n = touches.length, i, gesture;
    if (touchending)
      clearTimeout(touchending);
    touchending = setTimeout(function() {
      touchending = null;
    }, 500);
    for (i = 0; i < n; ++i) {
      if (gesture = gestures[touches[i].identifier]) {
        nopropagation$1(event);
        gesture("end", event, touches[i]);
      }
    }
  }
  function beforestart(that, container2, event, d, identifier, touch) {
    var dispatch2 = listeners.copy(), p = pointer(touch || event, container2), dx, dy, s;
    if ((s = subject.call(that, new DragEvent("beforestart", {
      sourceEvent: event,
      target: drag2,
      identifier,
      active,
      x: p[0],
      y: p[1],
      dx: 0,
      dy: 0,
      dispatch: dispatch2
    }), d)) == null)
      return;
    dx = s.x - p[0] || 0;
    dy = s.y - p[1] || 0;
    return function gesture(type, event2, touch2) {
      var p0 = p, n;
      switch (type) {
        case "start":
          gestures[identifier] = gesture, n = active++;
          break;
        case "end":
          delete gestures[identifier], --active;
        case "drag":
          p = pointer(touch2 || event2, container2), n = active;
          break;
      }
      dispatch2.call(
        type,
        that,
        new DragEvent(type, {
          sourceEvent: event2,
          subject: s,
          target: drag2,
          identifier,
          active: n,
          x: p[0] + dx,
          y: p[1] + dy,
          dx: p[0] - p0[0],
          dy: p[1] - p0[1],
          dispatch: dispatch2
        }),
        d
      );
    };
  }
  drag2.filter = function(_) {
    return arguments.length ? (filter2 = typeof _ === "function" ? _ : constant$2(!!_), drag2) : filter2;
  };
  drag2.container = function(_) {
    return arguments.length ? (container = typeof _ === "function" ? _ : constant$2(_), drag2) : container;
  };
  drag2.subject = function(_) {
    return arguments.length ? (subject = typeof _ === "function" ? _ : constant$2(_), drag2) : subject;
  };
  drag2.touchable = function(_) {
    return arguments.length ? (touchable = typeof _ === "function" ? _ : constant$2(!!_), drag2) : touchable;
  };
  drag2.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? drag2 : value;
  };
  drag2.clickDistance = function(_) {
    return arguments.length ? (clickDistance2 = (_ = +_) * _, drag2) : Math.sqrt(clickDistance2);
  };
  return drag2;
}
function define(constructor, factory, prototype) {
  constructor.prototype = factory.prototype = prototype;
  prototype.constructor = constructor;
}
function extend(parent, definition) {
  var prototype = Object.create(parent.prototype);
  for (var key in definition)
    prototype[key] = definition[key];
  return prototype;
}
function Color$1() {
}
var darker = 0.7;
var brighter = 1 / darker;
var reI = "\\s*([+-]?\\d+)\\s*", reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", reHex = /^#([0-9a-f]{3,8})$/, reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`), reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`), reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`), reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`), reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`), reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);
var named = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
define(Color$1, color, {
  copy(channels) {
    return Object.assign(new this.constructor(), this, channels);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: color_formatHex,
  // Deprecated! Use color.formatHex.
  formatHex: color_formatHex,
  formatHex8: color_formatHex8,
  formatHsl: color_formatHsl,
  formatRgb: color_formatRgb,
  toString: color_formatRgb
});
function color_formatHex() {
  return this.rgb().formatHex();
}
function color_formatHex8() {
  return this.rgb().formatHex8();
}
function color_formatHsl() {
  return hslConvert(this).formatHsl();
}
function color_formatRgb() {
  return this.rgb().formatRgb();
}
function color(format2) {
  var m, l;
  format2 = (format2 + "").trim().toLowerCase();
  return (m = reHex.exec(format2)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) : l === 3 ? new Rgb(m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, (m & 15) << 4 | m & 15, 1) : l === 8 ? rgba(m >> 24 & 255, m >> 16 & 255, m >> 8 & 255, (m & 255) / 255) : l === 4 ? rgba(m >> 12 & 15 | m >> 8 & 240, m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, ((m & 15) << 4 | m & 15) / 255) : null) : (m = reRgbInteger.exec(format2)) ? new Rgb(m[1], m[2], m[3], 1) : (m = reRgbPercent.exec(format2)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) : (m = reRgbaInteger.exec(format2)) ? rgba(m[1], m[2], m[3], m[4]) : (m = reRgbaPercent.exec(format2)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) : (m = reHslPercent.exec(format2)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) : (m = reHslaPercent.exec(format2)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) : named.hasOwnProperty(format2) ? rgbn(named[format2]) : format2 === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
}
function rgbn(n) {
  return new Rgb(n >> 16 & 255, n >> 8 & 255, n & 255, 1);
}
function rgba(r, g, b, a) {
  if (a <= 0)
    r = g = b = NaN;
  return new Rgb(r, g, b, a);
}
function rgbConvert(o) {
  if (!(o instanceof Color$1))
    o = color(o);
  if (!o)
    return new Rgb();
  o = o.rgb();
  return new Rgb(o.r, o.g, o.b, o.opacity);
}
function rgb(r, g, b, opacity) {
  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
}
function Rgb(r, g, b, opacity) {
  this.r = +r;
  this.g = +g;
  this.b = +b;
  this.opacity = +opacity;
}
define(Rgb, rgb, extend(Color$1, {
  brighter(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  darker(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && (-0.5 <= this.g && this.g < 255.5) && (-0.5 <= this.b && this.b < 255.5) && (0 <= this.opacity && this.opacity <= 1);
  },
  hex: rgb_formatHex,
  // Deprecated! Use color.formatHex.
  formatHex: rgb_formatHex,
  formatHex8: rgb_formatHex8,
  formatRgb: rgb_formatRgb,
  toString: rgb_formatRgb
}));
function rgb_formatHex() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
}
function rgb_formatHex8() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function rgb_formatRgb() {
  const a = clampa(this.opacity);
  return `${a === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ")" : `, ${a})`}`;
}
function clampa(opacity) {
  return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
}
function clampi(value) {
  return Math.max(0, Math.min(255, Math.round(value) || 0));
}
function hex(value) {
  value = clampi(value);
  return (value < 16 ? "0" : "") + value.toString(16);
}
function hsla(h, s, l, a) {
  if (a <= 0)
    h = s = l = NaN;
  else if (l <= 0 || l >= 1)
    h = s = NaN;
  else if (s <= 0)
    h = NaN;
  return new Hsl(h, s, l, a);
}
function hslConvert(o) {
  if (o instanceof Hsl)
    return new Hsl(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Color$1))
    o = color(o);
  if (!o)
    return new Hsl();
  if (o instanceof Hsl)
    return o;
  o = o.rgb();
  var r = o.r / 255, g = o.g / 255, b = o.b / 255, min2 = Math.min(r, g, b), max2 = Math.max(r, g, b), h = NaN, s = max2 - min2, l = (max2 + min2) / 2;
  if (s) {
    if (r === max2)
      h = (g - b) / s + (g < b) * 6;
    else if (g === max2)
      h = (b - r) / s + 2;
    else
      h = (r - g) / s + 4;
    s /= l < 0.5 ? max2 + min2 : 2 - max2 - min2;
    h *= 60;
  } else {
    s = l > 0 && l < 1 ? 0 : h;
  }
  return new Hsl(h, s, l, o.opacity);
}
function hsl(h, s, l, opacity) {
  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
}
function Hsl(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}
define(Hsl, hsl, extend(Color$1, {
  brighter(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  darker(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  rgb() {
    var h = this.h % 360 + (this.h < 0) * 360, s = isNaN(h) || isNaN(this.s) ? 0 : this.s, l = this.l, m2 = l + (l < 0.5 ? l : 1 - l) * s, m1 = 2 * l - m2;
    return new Rgb(
      hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
      hsl2rgb(h, m1, m2),
      hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
      this.opacity
    );
  },
  clamp() {
    return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && (0 <= this.l && this.l <= 1) && (0 <= this.opacity && this.opacity <= 1);
  },
  formatHsl() {
    const a = clampa(this.opacity);
    return `${a === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
  }
}));
function clamph(value) {
  value = (value || 0) % 360;
  return value < 0 ? value + 360 : value;
}
function clampt(value) {
  return Math.max(0, Math.min(1, value || 0));
}
function hsl2rgb(h, m1, m2) {
  return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
}
const radians = Math.PI / 180;
const degrees$1 = 180 / Math.PI;
var A = -0.14861, B = 1.78277, C = -0.29227, D = -0.90649, E = 1.97294, ED = E * D, EB = E * B, BC_DA = B * C - D * A;
function cubehelixConvert(o) {
  if (o instanceof Cubehelix)
    return new Cubehelix(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Rgb))
    o = rgbConvert(o);
  var r = o.r / 255, g = o.g / 255, b = o.b / 255, l = (BC_DA * b + ED * r - EB * g) / (BC_DA + ED - EB), bl = b - l, k = (E * (g - l) - C * bl) / D, s = Math.sqrt(k * k + bl * bl) / (E * l * (1 - l)), h = s ? Math.atan2(k, bl) * degrees$1 - 120 : NaN;
  return new Cubehelix(h < 0 ? h + 360 : h, s, l, o.opacity);
}
function cubehelix$2(h, s, l, opacity) {
  return arguments.length === 1 ? cubehelixConvert(h) : new Cubehelix(h, s, l, opacity == null ? 1 : opacity);
}
function Cubehelix(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}
define(Cubehelix, cubehelix$2, extend(Color$1, {
  brighter(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
  },
  darker(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
  },
  rgb() {
    var h = isNaN(this.h) ? 0 : (this.h + 120) * radians, l = +this.l, a = isNaN(this.s) ? 0 : this.s * l * (1 - l), cosh2 = Math.cos(h), sinh2 = Math.sin(h);
    return new Rgb(
      255 * (l + a * (A * cosh2 + B * sinh2)),
      255 * (l + a * (C * cosh2 + D * sinh2)),
      255 * (l + a * (E * cosh2)),
      this.opacity
    );
  }
}));
function basis(t1, v0, v1, v2, v3) {
  var t2 = t1 * t1, t3 = t2 * t1;
  return ((1 - 3 * t1 + 3 * t2 - t3) * v0 + (4 - 6 * t2 + 3 * t3) * v1 + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2 + t3 * v3) / 6;
}
function basis$1(values) {
  var n = values.length - 1;
  return function(t) {
    var i = t <= 0 ? t = 0 : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n), v1 = values[i], v2 = values[i + 1], v0 = i > 0 ? values[i - 1] : 2 * v1 - v2, v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
    return basis((t - i / n) * n, v0, v1, v2, v3);
  };
}
const constant$1 = (x) => () => x;
function linear$1(a, d) {
  return function(t) {
    return a + t * d;
  };
}
function exponential(a, b, y) {
  return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
    return Math.pow(a + t * b, y);
  };
}
function hue(a, b) {
  var d = b - a;
  return d ? linear$1(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant$1(isNaN(a) ? b : a);
}
function gamma(y) {
  return (y = +y) === 1 ? nogamma : function(a, b) {
    return b - a ? exponential(a, b, y) : constant$1(isNaN(a) ? b : a);
  };
}
function nogamma(a, b) {
  var d = b - a;
  return d ? linear$1(a, d) : constant$1(isNaN(a) ? b : a);
}
const interpolateRgb = function rgbGamma(y) {
  var color2 = gamma(y);
  function rgb$1(start2, end) {
    var r = color2((start2 = rgb(start2)).r, (end = rgb(end)).r), g = color2(start2.g, end.g), b = color2(start2.b, end.b), opacity = nogamma(start2.opacity, end.opacity);
    return function(t) {
      start2.r = r(t);
      start2.g = g(t);
      start2.b = b(t);
      start2.opacity = opacity(t);
      return start2 + "";
    };
  }
  rgb$1.gamma = rgbGamma;
  return rgb$1;
}(1);
function rgbSpline(spline) {
  return function(colors2) {
    var n = colors2.length, r = new Array(n), g = new Array(n), b = new Array(n), i, color2;
    for (i = 0; i < n; ++i) {
      color2 = rgb(colors2[i]);
      r[i] = color2.r || 0;
      g[i] = color2.g || 0;
      b[i] = color2.b || 0;
    }
    r = spline(r);
    g = spline(g);
    b = spline(b);
    color2.opacity = 1;
    return function(t) {
      color2.r = r(t);
      color2.g = g(t);
      color2.b = b(t);
      return color2 + "";
    };
  };
}
var rgbBasis = rgbSpline(basis$1);
function numberArray(a, b) {
  if (!b)
    b = [];
  var n = a ? Math.min(b.length, a.length) : 0, c2 = b.slice(), i;
  return function(t) {
    for (i = 0; i < n; ++i)
      c2[i] = a[i] * (1 - t) + b[i] * t;
    return c2;
  };
}
function isNumberArray(x) {
  return ArrayBuffer.isView(x) && !(x instanceof DataView);
}
function genericArray(a, b) {
  var nb = b ? b.length : 0, na = a ? Math.min(nb, a.length) : 0, x = new Array(na), c2 = new Array(nb), i;
  for (i = 0; i < na; ++i)
    x[i] = interpolate$1(a[i], b[i]);
  for (; i < nb; ++i)
    c2[i] = b[i];
  return function(t) {
    for (i = 0; i < na; ++i)
      c2[i] = x[i](t);
    return c2;
  };
}
function date(a, b) {
  var d = new Date();
  return a = +a, b = +b, function(t) {
    return d.setTime(a * (1 - t) + b * t), d;
  };
}
function interpolateNumber(a, b) {
  return a = +a, b = +b, function(t) {
    return a * (1 - t) + b * t;
  };
}
function object(a, b) {
  var i = {}, c2 = {}, k;
  if (a === null || typeof a !== "object")
    a = {};
  if (b === null || typeof b !== "object")
    b = {};
  for (k in b) {
    if (k in a) {
      i[k] = interpolate$1(a[k], b[k]);
    } else {
      c2[k] = b[k];
    }
  }
  return function(t) {
    for (k in i)
      c2[k] = i[k](t);
    return c2;
  };
}
var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, reB = new RegExp(reA.source, "g");
function zero(b) {
  return function() {
    return b;
  };
}
function one(b) {
  return function(t) {
    return b(t) + "";
  };
}
function interpolateString(a, b) {
  var bi = reA.lastIndex = reB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
  a = a + "", b = b + "";
  while ((am = reA.exec(a)) && (bm = reB.exec(b))) {
    if ((bs = bm.index) > bi) {
      bs = b.slice(bi, bs);
      if (s[i])
        s[i] += bs;
      else
        s[++i] = bs;
    }
    if ((am = am[0]) === (bm = bm[0])) {
      if (s[i])
        s[i] += bm;
      else
        s[++i] = bm;
    } else {
      s[++i] = null;
      q.push({ i, x: interpolateNumber(am, bm) });
    }
    bi = reB.lastIndex;
  }
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s[i])
      s[i] += bs;
    else
      s[++i] = bs;
  }
  return s.length < 2 ? q[0] ? one(q[0].x) : zero(b) : (b = q.length, function(t) {
    for (var i2 = 0, o; i2 < b; ++i2)
      s[(o = q[i2]).i] = o.x(t);
    return s.join("");
  });
}
function interpolate$1(a, b) {
  var t = typeof b, c2;
  return b == null || t === "boolean" ? constant$1(b) : (t === "number" ? interpolateNumber : t === "string" ? (c2 = color(b)) ? (b = c2, interpolateRgb) : interpolateString : b instanceof color ? interpolateRgb : b instanceof Date ? date : isNumberArray(b) ? numberArray : Array.isArray(b) ? genericArray : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object : interpolateNumber)(a, b);
}
function interpolateRound(a, b) {
  return a = +a, b = +b, function(t) {
    return Math.round(a * (1 - t) + b * t);
  };
}
var degrees = 180 / Math.PI;
var identity$4 = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function decompose(a, b, c2, d, e, f) {
  var scaleX, scaleY, skewX;
  if (scaleX = Math.sqrt(a * a + b * b))
    a /= scaleX, b /= scaleX;
  if (skewX = a * c2 + b * d)
    c2 -= a * skewX, d -= b * skewX;
  if (scaleY = Math.sqrt(c2 * c2 + d * d))
    c2 /= scaleY, d /= scaleY, skewX /= scaleY;
  if (a * d < b * c2)
    a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
  return {
    translateX: e,
    translateY: f,
    rotate: Math.atan2(b, a) * degrees,
    skewX: Math.atan(skewX) * degrees,
    scaleX,
    scaleY
  };
}
var svgNode;
function parseCss(value) {
  const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
  return m.isIdentity ? identity$4 : decompose(m.a, m.b, m.c, m.d, m.e, m.f);
}
function parseSvg(value) {
  if (value == null)
    return identity$4;
  if (!svgNode)
    svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svgNode.setAttribute("transform", value);
  if (!(value = svgNode.transform.baseVal.consolidate()))
    return identity$4;
  value = value.matrix;
  return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
}
function interpolateTransform(parse, pxComma, pxParen, degParen) {
  function pop(s) {
    return s.length ? s.pop() + " " : "";
  }
  function translate(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push("translate(", null, pxComma, null, pxParen);
      q.push({ i: i - 4, x: interpolateNumber(xa, xb) }, { i: i - 2, x: interpolateNumber(ya, yb) });
    } else if (xb || yb) {
      s.push("translate(" + xb + pxComma + yb + pxParen);
    }
  }
  function rotate(a, b, s, q) {
    if (a !== b) {
      if (a - b > 180)
        b += 360;
      else if (b - a > 180)
        a += 360;
      q.push({ i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: interpolateNumber(a, b) });
    } else if (b) {
      s.push(pop(s) + "rotate(" + b + degParen);
    }
  }
  function skewX(a, b, s, q) {
    if (a !== b) {
      q.push({ i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: interpolateNumber(a, b) });
    } else if (b) {
      s.push(pop(s) + "skewX(" + b + degParen);
    }
  }
  function scale(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push(pop(s) + "scale(", null, ",", null, ")");
      q.push({ i: i - 4, x: interpolateNumber(xa, xb) }, { i: i - 2, x: interpolateNumber(ya, yb) });
    } else if (xb !== 1 || yb !== 1) {
      s.push(pop(s) + "scale(" + xb + "," + yb + ")");
    }
  }
  return function(a, b) {
    var s = [], q = [];
    a = parse(a), b = parse(b);
    translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
    rotate(a.rotate, b.rotate, s, q);
    skewX(a.skewX, b.skewX, s, q);
    scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
    a = b = null;
    return function(t) {
      var i = -1, n = q.length, o;
      while (++i < n)
        s[(o = q[i]).i] = o.x(t);
      return s.join("");
    };
  };
}
var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");
var epsilon2 = 1e-12;
function cosh(x) {
  return ((x = Math.exp(x)) + 1 / x) / 2;
}
function sinh(x) {
  return ((x = Math.exp(x)) - 1 / x) / 2;
}
function tanh(x) {
  return ((x = Math.exp(2 * x)) - 1) / (x + 1);
}
const interpolateZoom = function zoomRho(rho, rho2, rho4) {
  function zoom2(p0, p1) {
    var ux0 = p0[0], uy0 = p0[1], w0 = p0[2], ux1 = p1[0], uy1 = p1[1], w1 = p1[2], dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy, i, S;
    if (d2 < epsilon2) {
      S = Math.log(w1 / w0) / rho;
      i = function(t) {
        return [
          ux0 + t * dx,
          uy0 + t * dy,
          w0 * Math.exp(rho * t * S)
        ];
      };
    } else {
      var d1 = Math.sqrt(d2), b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1), b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1), r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
      S = (r1 - r0) / rho;
      i = function(t) {
        var s = t * S, coshr0 = cosh(r0), u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
        return [
          ux0 + u * dx,
          uy0 + u * dy,
          w0 * coshr0 / cosh(rho * s + r0)
        ];
      };
    }
    i.duration = S * 1e3 * rho / Math.SQRT2;
    return i;
  }
  zoom2.rho = function(_) {
    var _1 = Math.max(1e-3, +_), _2 = _1 * _1, _4 = _2 * _2;
    return zoomRho(_1, _2, _4);
  };
  return zoom2;
}(Math.SQRT2, 2, 4);
function cubehelix$1(hue2) {
  return function cubehelixGamma(y) {
    y = +y;
    function cubehelix2(start2, end) {
      var h = hue2((start2 = cubehelix$2(start2)).h, (end = cubehelix$2(end)).h), s = nogamma(start2.s, end.s), l = nogamma(start2.l, end.l), opacity = nogamma(start2.opacity, end.opacity);
      return function(t) {
        start2.h = h(t);
        start2.s = s(t);
        start2.l = l(Math.pow(t, y));
        start2.opacity = opacity(t);
        return start2 + "";
      };
    }
    cubehelix2.gamma = cubehelixGamma;
    return cubehelix2;
  }(1);
}
cubehelix$1(hue);
var cubehelixLong = cubehelix$1(nogamma);
var emptyOn = dispatch("start", "end", "cancel", "interrupt");
var emptyTween = [];
var CREATED = 0;
var SCHEDULED = 1;
var STARTING = 2;
var STARTED = 3;
var RUNNING = 4;
var ENDING = 5;
var ENDED = 6;
function schedule(node, name, id2, index, group, timing) {
  var schedules = node.__transition;
  if (!schedules)
    node.__transition = {};
  else if (id2 in schedules)
    return;
  create(node, id2, {
    name,
    index,
    // For context during callback.
    group,
    // For context during callback.
    on: emptyOn,
    tween: emptyTween,
    time: timing.time,
    delay: timing.delay,
    duration: timing.duration,
    ease: timing.ease,
    timer: null,
    state: CREATED
  });
}
function init(node, id2) {
  var schedule2 = get(node, id2);
  if (schedule2.state > CREATED)
    throw new Error("too late; already scheduled");
  return schedule2;
}
function set(node, id2) {
  var schedule2 = get(node, id2);
  if (schedule2.state > STARTED)
    throw new Error("too late; already running");
  return schedule2;
}
function get(node, id2) {
  var schedule2 = node.__transition;
  if (!schedule2 || !(schedule2 = schedule2[id2]))
    throw new Error("transition not found");
  return schedule2;
}
function create(node, id2, self2) {
  var schedules = node.__transition, tween;
  schedules[id2] = self2;
  self2.timer = timer(schedule2, 0, self2.time);
  function schedule2(elapsed) {
    self2.state = SCHEDULED;
    self2.timer.restart(start2, self2.delay, self2.time);
    if (self2.delay <= elapsed)
      start2(elapsed - self2.delay);
  }
  function start2(elapsed) {
    var i, j, n, o;
    if (self2.state !== SCHEDULED)
      return stop();
    for (i in schedules) {
      o = schedules[i];
      if (o.name !== self2.name)
        continue;
      if (o.state === STARTED)
        return timeout(start2);
      if (o.state === RUNNING) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("interrupt", node, node.__data__, o.index, o.group);
        delete schedules[i];
      } else if (+i < id2) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("cancel", node, node.__data__, o.index, o.group);
        delete schedules[i];
      }
    }
    timeout(function() {
      if (self2.state === STARTED) {
        self2.state = RUNNING;
        self2.timer.restart(tick, self2.delay, self2.time);
        tick(elapsed);
      }
    });
    self2.state = STARTING;
    self2.on.call("start", node, node.__data__, self2.index, self2.group);
    if (self2.state !== STARTING)
      return;
    self2.state = STARTED;
    tween = new Array(n = self2.tween.length);
    for (i = 0, j = -1; i < n; ++i) {
      if (o = self2.tween[i].value.call(node, node.__data__, self2.index, self2.group)) {
        tween[++j] = o;
      }
    }
    tween.length = j + 1;
  }
  function tick(elapsed) {
    var t = elapsed < self2.duration ? self2.ease.call(null, elapsed / self2.duration) : (self2.timer.restart(stop), self2.state = ENDING, 1), i = -1, n = tween.length;
    while (++i < n) {
      tween[i].call(node, t);
    }
    if (self2.state === ENDING) {
      self2.on.call("end", node, node.__data__, self2.index, self2.group);
      stop();
    }
  }
  function stop() {
    self2.state = ENDED;
    self2.timer.stop();
    delete schedules[id2];
    for (var i in schedules)
      return;
    delete node.__transition;
  }
}
function interrupt(node, name) {
  var schedules = node.__transition, schedule2, active, empty2 = true, i;
  if (!schedules)
    return;
  name = name == null ? null : name + "";
  for (i in schedules) {
    if ((schedule2 = schedules[i]).name !== name) {
      empty2 = false;
      continue;
    }
    active = schedule2.state > STARTING && schedule2.state < ENDING;
    schedule2.state = ENDED;
    schedule2.timer.stop();
    schedule2.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule2.index, schedule2.group);
    delete schedules[i];
  }
  if (empty2)
    delete node.__transition;
}
function selection_interrupt(name) {
  return this.each(function() {
    interrupt(this, name);
  });
}
function tweenRemove(id2, name) {
  var tween0, tween1;
  return function() {
    var schedule2 = set(this, id2), tween = schedule2.tween;
    if (tween !== tween0) {
      tween1 = tween0 = tween;
      for (var i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1 = tween1.slice();
          tween1.splice(i, 1);
          break;
        }
      }
    }
    schedule2.tween = tween1;
  };
}
function tweenFunction(id2, name, value) {
  var tween0, tween1;
  if (typeof value !== "function")
    throw new Error();
  return function() {
    var schedule2 = set(this, id2), tween = schedule2.tween;
    if (tween !== tween0) {
      tween1 = (tween0 = tween).slice();
      for (var t = { name, value }, i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1[i] = t;
          break;
        }
      }
      if (i === n)
        tween1.push(t);
    }
    schedule2.tween = tween1;
  };
}
function transition_tween(name, value) {
  var id2 = this._id;
  name += "";
  if (arguments.length < 2) {
    var tween = get(this.node(), id2).tween;
    for (var i = 0, n = tween.length, t; i < n; ++i) {
      if ((t = tween[i]).name === name) {
        return t.value;
      }
    }
    return null;
  }
  return this.each((value == null ? tweenRemove : tweenFunction)(id2, name, value));
}
function tweenValue(transition, name, value) {
  var id2 = transition._id;
  transition.each(function() {
    var schedule2 = set(this, id2);
    (schedule2.value || (schedule2.value = {}))[name] = value.apply(this, arguments);
  });
  return function(node) {
    return get(node, id2).value[name];
  };
}
function interpolate(a, b) {
  var c2;
  return (typeof b === "number" ? interpolateNumber : b instanceof color ? interpolateRgb : (c2 = color(b)) ? (b = c2, interpolateRgb) : interpolateString)(a, b);
}
function attrRemove(name) {
  return function() {
    this.removeAttribute(name);
  };
}
function attrRemoveNS(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant(name, interpolate2, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = this.getAttribute(name);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate2(string00 = string0, value1);
  };
}
function attrConstantNS(fullname, interpolate2, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = this.getAttributeNS(fullname.space, fullname.local);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate2(string00 = string0, value1);
  };
}
function attrFunction(name, interpolate2, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null)
      return void this.removeAttribute(name);
    string0 = this.getAttribute(name);
    string1 = value1 + "";
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate2(string00 = string0, value1));
  };
}
function attrFunctionNS(fullname, interpolate2, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null)
      return void this.removeAttributeNS(fullname.space, fullname.local);
    string0 = this.getAttributeNS(fullname.space, fullname.local);
    string1 = value1 + "";
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate2(string00 = string0, value1));
  };
}
function transition_attr(name, value) {
  var fullname = namespace(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate;
  return this.attrTween(name, typeof value === "function" ? (fullname.local ? attrFunctionNS : attrFunction)(fullname, i, tweenValue(this, "attr." + name, value)) : value == null ? (fullname.local ? attrRemoveNS : attrRemove)(fullname) : (fullname.local ? attrConstantNS : attrConstant)(fullname, i, value));
}
function attrInterpolate(name, i) {
  return function(t) {
    this.setAttribute(name, i.call(this, t));
  };
}
function attrInterpolateNS(fullname, i) {
  return function(t) {
    this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
  };
}
function attrTweenNS(fullname, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0)
      t0 = (i0 = i) && attrInterpolateNS(fullname, i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function attrTween(name, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0)
      t0 = (i0 = i) && attrInterpolate(name, i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function transition_attrTween(name, value) {
  var key = "attr." + name;
  if (arguments.length < 2)
    return (key = this.tween(key)) && key._value;
  if (value == null)
    return this.tween(key, null);
  if (typeof value !== "function")
    throw new Error();
  var fullname = namespace(name);
  return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
}
function delayFunction(id2, value) {
  return function() {
    init(this, id2).delay = +value.apply(this, arguments);
  };
}
function delayConstant(id2, value) {
  return value = +value, function() {
    init(this, id2).delay = value;
  };
}
function transition_delay(value) {
  var id2 = this._id;
  return arguments.length ? this.each((typeof value === "function" ? delayFunction : delayConstant)(id2, value)) : get(this.node(), id2).delay;
}
function durationFunction(id2, value) {
  return function() {
    set(this, id2).duration = +value.apply(this, arguments);
  };
}
function durationConstant(id2, value) {
  return value = +value, function() {
    set(this, id2).duration = value;
  };
}
function transition_duration(value) {
  var id2 = this._id;
  return arguments.length ? this.each((typeof value === "function" ? durationFunction : durationConstant)(id2, value)) : get(this.node(), id2).duration;
}
function easeConstant(id2, value) {
  if (typeof value !== "function")
    throw new Error();
  return function() {
    set(this, id2).ease = value;
  };
}
function transition_ease(value) {
  var id2 = this._id;
  return arguments.length ? this.each(easeConstant(id2, value)) : get(this.node(), id2).ease;
}
function easeVarying(id2, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (typeof v !== "function")
      throw new Error();
    set(this, id2).ease = v;
  };
}
function transition_easeVarying(value) {
  if (typeof value !== "function")
    throw new Error();
  return this.each(easeVarying(this._id, value));
}
function transition_filter(match) {
  if (typeof match !== "function")
    match = matcher(match);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }
  return new Transition(subgroups, this._parents, this._name, this._id);
}
function transition_merge(transition) {
  if (transition._id !== this._id)
    throw new Error();
  for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge2 = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge2[i] = node;
      }
    }
  }
  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }
  return new Transition(merges, this._parents, this._name, this._id);
}
function start(name) {
  return (name + "").trim().split(/^|\s+/).every(function(t) {
    var i = t.indexOf(".");
    if (i >= 0)
      t = t.slice(0, i);
    return !t || t === "start";
  });
}
function onFunction(id2, name, listener) {
  var on0, on1, sit = start(name) ? init : set;
  return function() {
    var schedule2 = sit(this, id2), on = schedule2.on;
    if (on !== on0)
      (on1 = (on0 = on).copy()).on(name, listener);
    schedule2.on = on1;
  };
}
function transition_on(name, listener) {
  var id2 = this._id;
  return arguments.length < 2 ? get(this.node(), id2).on.on(name) : this.each(onFunction(id2, name, listener));
}
function removeFunction(id2) {
  return function() {
    var parent = this.parentNode;
    for (var i in this.__transition)
      if (+i !== id2)
        return;
    if (parent)
      parent.removeChild(this);
  };
}
function transition_remove() {
  return this.on("end.remove", removeFunction(this._id));
}
function transition_select(select2) {
  var name = this._name, id2 = this._id;
  if (typeof select2 !== "function")
    select2 = selector(select2);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select2.call(node, node.__data__, i, group))) {
        if ("__data__" in node)
          subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
        schedule(subgroup[i], name, id2, i, subgroup, get(node, id2));
      }
    }
  }
  return new Transition(subgroups, this._parents, name, id2);
}
function transition_selectAll(select2) {
  var name = this._name, id2 = this._id;
  if (typeof select2 !== "function")
    select2 = selectorAll(select2);
  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        for (var children2 = select2.call(node, node.__data__, i, group), child, inherit2 = get(node, id2), k = 0, l = children2.length; k < l; ++k) {
          if (child = children2[k]) {
            schedule(child, name, id2, k, children2, inherit2);
          }
        }
        subgroups.push(children2);
        parents.push(node);
      }
    }
  }
  return new Transition(subgroups, parents, name, id2);
}
var Selection = selection.prototype.constructor;
function transition_selection() {
  return new Selection(this._groups, this._parents);
}
function styleNull(name, interpolate2) {
  var string00, string10, interpolate0;
  return function() {
    var string0 = styleValue(this, name), string1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : interpolate0 = interpolate2(string00 = string0, string10 = string1);
  };
}
function styleRemove(name) {
  return function() {
    this.style.removeProperty(name);
  };
}
function styleConstant(name, interpolate2, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = styleValue(this, name);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate2(string00 = string0, value1);
  };
}
function styleFunction(name, interpolate2, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0 = styleValue(this, name), value1 = value(this), string1 = value1 + "";
    if (value1 == null)
      string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate2(string00 = string0, value1));
  };
}
function styleMaybeRemove(id2, name) {
  var on0, on1, listener0, key = "style." + name, event = "end." + key, remove2;
  return function() {
    var schedule2 = set(this, id2), on = schedule2.on, listener = schedule2.value[key] == null ? remove2 || (remove2 = styleRemove(name)) : void 0;
    if (on !== on0 || listener0 !== listener)
      (on1 = (on0 = on).copy()).on(event, listener0 = listener);
    schedule2.on = on1;
  };
}
function transition_style(name, value, priority) {
  var i = (name += "") === "transform" ? interpolateTransformCss : interpolate;
  return value == null ? this.styleTween(name, styleNull(name, i)).on("end.style." + name, styleRemove(name)) : typeof value === "function" ? this.styleTween(name, styleFunction(name, i, tweenValue(this, "style." + name, value))).each(styleMaybeRemove(this._id, name)) : this.styleTween(name, styleConstant(name, i, value), priority).on("end.style." + name, null);
}
function styleInterpolate(name, i, priority) {
  return function(t) {
    this.style.setProperty(name, i.call(this, t), priority);
  };
}
function styleTween(name, value, priority) {
  var t, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0)
      t = (i0 = i) && styleInterpolate(name, i, priority);
    return t;
  }
  tween._value = value;
  return tween;
}
function transition_styleTween(name, value, priority) {
  var key = "style." + (name += "");
  if (arguments.length < 2)
    return (key = this.tween(key)) && key._value;
  if (value == null)
    return this.tween(key, null);
  if (typeof value !== "function")
    throw new Error();
  return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
}
function textConstant(value) {
  return function() {
    this.textContent = value;
  };
}
function textFunction(value) {
  return function() {
    var value1 = value(this);
    this.textContent = value1 == null ? "" : value1;
  };
}
function transition_text(value) {
  return this.tween("text", typeof value === "function" ? textFunction(tweenValue(this, "text", value)) : textConstant(value == null ? "" : value + ""));
}
function textInterpolate(i) {
  return function(t) {
    this.textContent = i.call(this, t);
  };
}
function textTween(value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0)
      t0 = (i0 = i) && textInterpolate(i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function transition_textTween(value) {
  var key = "text";
  if (arguments.length < 1)
    return (key = this.tween(key)) && key._value;
  if (value == null)
    return this.tween(key, null);
  if (typeof value !== "function")
    throw new Error();
  return this.tween(key, textTween(value));
}
function transition_transition() {
  var name = this._name, id0 = this._id, id1 = newId();
  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        var inherit2 = get(node, id0);
        schedule(node, name, id1, i, group, {
          time: inherit2.time + inherit2.delay + inherit2.duration,
          delay: 0,
          duration: inherit2.duration,
          ease: inherit2.ease
        });
      }
    }
  }
  return new Transition(groups, this._parents, name, id1);
}
function transition_end() {
  var on0, on1, that = this, id2 = that._id, size = that.size();
  return new Promise(function(resolve, reject) {
    var cancel = { value: reject }, end = { value: function() {
      if (--size === 0)
        resolve();
    } };
    that.each(function() {
      var schedule2 = set(this, id2), on = schedule2.on;
      if (on !== on0) {
        on1 = (on0 = on).copy();
        on1._.cancel.push(cancel);
        on1._.interrupt.push(cancel);
        on1._.end.push(end);
      }
      schedule2.on = on1;
    });
    if (size === 0)
      resolve();
  });
}
var id = 0;
function Transition(groups, parents, name, id2) {
  this._groups = groups;
  this._parents = parents;
  this._name = name;
  this._id = id2;
}
function newId() {
  return ++id;
}
var selection_prototype = selection.prototype;
Transition.prototype = {
  constructor: Transition,
  select: transition_select,
  selectAll: transition_selectAll,
  selectChild: selection_prototype.selectChild,
  selectChildren: selection_prototype.selectChildren,
  filter: transition_filter,
  merge: transition_merge,
  selection: transition_selection,
  transition: transition_transition,
  call: selection_prototype.call,
  nodes: selection_prototype.nodes,
  node: selection_prototype.node,
  size: selection_prototype.size,
  empty: selection_prototype.empty,
  each: selection_prototype.each,
  on: transition_on,
  attr: transition_attr,
  attrTween: transition_attrTween,
  style: transition_style,
  styleTween: transition_styleTween,
  text: transition_text,
  textTween: transition_textTween,
  remove: transition_remove,
  tween: transition_tween,
  delay: transition_delay,
  duration: transition_duration,
  ease: transition_ease,
  easeVarying: transition_easeVarying,
  end: transition_end,
  [Symbol.iterator]: selection_prototype[Symbol.iterator]
};
function cubicInOut(t) {
  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}
var defaultTiming = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: cubicInOut
};
function inherit(node, id2) {
  var timing;
  while (!(timing = node.__transition) || !(timing = timing[id2])) {
    if (!(node = node.parentNode)) {
      throw new Error(`transition ${id2} not found`);
    }
  }
  return timing;
}
function selection_transition(name) {
  var id2, timing;
  if (name instanceof Transition) {
    id2 = name._id, name = name._name;
  } else {
    id2 = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
  }
  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        schedule(node, name, id2, i, group, timing || inherit(node, id2));
      }
    }
  }
  return new Transition(groups, this._parents, name, id2);
}
selection.prototype.interrupt = selection_interrupt;
selection.prototype.transition = selection_transition;
const constant = (x) => () => x;
function ZoomEvent(type, {
  sourceEvent: sourceEvent2,
  target,
  transform,
  dispatch: dispatch2
}) {
  Object.defineProperties(this, {
    type: { value: type, enumerable: true, configurable: true },
    sourceEvent: { value: sourceEvent2, enumerable: true, configurable: true },
    target: { value: target, enumerable: true, configurable: true },
    transform: { value: transform, enumerable: true, configurable: true },
    _: { value: dispatch2 }
  });
}
function Transform(k, x, y) {
  this.k = k;
  this.x = x;
  this.y = y;
}
Transform.prototype = {
  constructor: Transform,
  scale: function(k) {
    return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
  },
  translate: function(x, y) {
    return x === 0 & y === 0 ? this : new Transform(this.k, this.x + this.k * x, this.y + this.k * y);
  },
  apply: function(point) {
    return [point[0] * this.k + this.x, point[1] * this.k + this.y];
  },
  applyX: function(x) {
    return x * this.k + this.x;
  },
  applyY: function(y) {
    return y * this.k + this.y;
  },
  invert: function(location) {
    return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
  },
  invertX: function(x) {
    return (x - this.x) / this.k;
  },
  invertY: function(y) {
    return (y - this.y) / this.k;
  },
  rescaleX: function(x) {
    return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
  },
  rescaleY: function(y) {
    return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};
var identity$3 = new Transform(1, 0, 0);
Transform.prototype;
function nopropagation(event) {
  event.stopImmediatePropagation();
}
function noevent(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}
function defaultFilter(event) {
  return (!event.ctrlKey || event.type === "wheel") && !event.button;
}
function defaultExtent() {
  var e = this;
  if (e instanceof SVGElement) {
    e = e.ownerSVGElement || e;
    if (e.hasAttribute("viewBox")) {
      e = e.viewBox.baseVal;
      return [[e.x, e.y], [e.x + e.width, e.y + e.height]];
    }
    return [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]];
  }
  return [[0, 0], [e.clientWidth, e.clientHeight]];
}
function defaultTransform() {
  return this.__zoom || identity$3;
}
function defaultWheelDelta(event) {
  return -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 2e-3) * (event.ctrlKey ? 10 : 1);
}
function defaultTouchable() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function defaultConstrain(transform, extent2, translateExtent) {
  var dx0 = transform.invertX(extent2[0][0]) - translateExtent[0][0], dx1 = transform.invertX(extent2[1][0]) - translateExtent[1][0], dy0 = transform.invertY(extent2[0][1]) - translateExtent[0][1], dy1 = transform.invertY(extent2[1][1]) - translateExtent[1][1];
  return transform.translate(
    dx1 > dx0 ? (dx0 + dx1) / 2 : Math.min(0, dx0) || Math.max(0, dx1),
    dy1 > dy0 ? (dy0 + dy1) / 2 : Math.min(0, dy0) || Math.max(0, dy1)
  );
}
function zoom() {
  var filter2 = defaultFilter, extent2 = defaultExtent, constrain = defaultConstrain, wheelDelta = defaultWheelDelta, touchable = defaultTouchable, scaleExtent = [0, Infinity], translateExtent = [[-Infinity, -Infinity], [Infinity, Infinity]], duration = 250, interpolate2 = interpolateZoom, listeners = dispatch("start", "zoom", "end"), touchstarting, touchfirst, touchending, touchDelay = 500, wheelDelay = 150, clickDistance2 = 0, tapDistance = 10;
  function zoom2(selection2) {
    selection2.property("__zoom", defaultTransform).on("wheel.zoom", wheeled, { passive: false }).on("mousedown.zoom", mousedowned).on("dblclick.zoom", dblclicked).filter(touchable).on("touchstart.zoom", touchstarted).on("touchmove.zoom", touchmoved).on("touchend.zoom touchcancel.zoom", touchended).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  zoom2.transform = function(collection, transform, point, event) {
    var selection2 = collection.selection ? collection.selection() : collection;
    selection2.property("__zoom", defaultTransform);
    if (collection !== selection2) {
      schedule2(collection, transform, point, event);
    } else {
      selection2.interrupt().each(function() {
        gesture(this, arguments).event(event).start().zoom(null, typeof transform === "function" ? transform.apply(this, arguments) : transform).end();
      });
    }
  };
  zoom2.scaleBy = function(selection2, k, p, event) {
    zoom2.scaleTo(selection2, function() {
      var k0 = this.__zoom.k, k1 = typeof k === "function" ? k.apply(this, arguments) : k;
      return k0 * k1;
    }, p, event);
  };
  zoom2.scaleTo = function(selection2, k, p, event) {
    zoom2.transform(selection2, function() {
      var e = extent2.apply(this, arguments), t0 = this.__zoom, p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p, p1 = t0.invert(p0), k1 = typeof k === "function" ? k.apply(this, arguments) : k;
      return constrain(translate(scale(t0, k1), p0, p1), e, translateExtent);
    }, p, event);
  };
  zoom2.translateBy = function(selection2, x, y, event) {
    zoom2.transform(selection2, function() {
      return constrain(this.__zoom.translate(
        typeof x === "function" ? x.apply(this, arguments) : x,
        typeof y === "function" ? y.apply(this, arguments) : y
      ), extent2.apply(this, arguments), translateExtent);
    }, null, event);
  };
  zoom2.translateTo = function(selection2, x, y, p, event) {
    zoom2.transform(selection2, function() {
      var e = extent2.apply(this, arguments), t = this.__zoom, p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p;
      return constrain(identity$3.translate(p0[0], p0[1]).scale(t.k).translate(
        typeof x === "function" ? -x.apply(this, arguments) : -x,
        typeof y === "function" ? -y.apply(this, arguments) : -y
      ), e, translateExtent);
    }, p, event);
  };
  function scale(transform, k) {
    k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], k));
    return k === transform.k ? transform : new Transform(k, transform.x, transform.y);
  }
  function translate(transform, p0, p1) {
    var x = p0[0] - p1[0] * transform.k, y = p0[1] - p1[1] * transform.k;
    return x === transform.x && y === transform.y ? transform : new Transform(transform.k, x, y);
  }
  function centroid(extent3) {
    return [(+extent3[0][0] + +extent3[1][0]) / 2, (+extent3[0][1] + +extent3[1][1]) / 2];
  }
  function schedule2(transition, transform, point, event) {
    transition.on("start.zoom", function() {
      gesture(this, arguments).event(event).start();
    }).on("interrupt.zoom end.zoom", function() {
      gesture(this, arguments).event(event).end();
    }).tween("zoom", function() {
      var that = this, args = arguments, g = gesture(that, args).event(event), e = extent2.apply(that, args), p = point == null ? centroid(e) : typeof point === "function" ? point.apply(that, args) : point, w = Math.max(e[1][0] - e[0][0], e[1][1] - e[0][1]), a = that.__zoom, b = typeof transform === "function" ? transform.apply(that, args) : transform, i = interpolate2(a.invert(p).concat(w / a.k), b.invert(p).concat(w / b.k));
      return function(t) {
        if (t === 1)
          t = b;
        else {
          var l = i(t), k = w / l[2];
          t = new Transform(k, p[0] - l[0] * k, p[1] - l[1] * k);
        }
        g.zoom(null, t);
      };
    });
  }
  function gesture(that, args, clean) {
    return !clean && that.__zooming || new Gesture(that, args);
  }
  function Gesture(that, args) {
    this.that = that;
    this.args = args;
    this.active = 0;
    this.sourceEvent = null;
    this.extent = extent2.apply(that, args);
    this.taps = 0;
  }
  Gesture.prototype = {
    event: function(event) {
      if (event)
        this.sourceEvent = event;
      return this;
    },
    start: function() {
      if (++this.active === 1) {
        this.that.__zooming = this;
        this.emit("start");
      }
      return this;
    },
    zoom: function(key, transform) {
      if (this.mouse && key !== "mouse")
        this.mouse[1] = transform.invert(this.mouse[0]);
      if (this.touch0 && key !== "touch")
        this.touch0[1] = transform.invert(this.touch0[0]);
      if (this.touch1 && key !== "touch")
        this.touch1[1] = transform.invert(this.touch1[0]);
      this.that.__zoom = transform;
      this.emit("zoom");
      return this;
    },
    end: function() {
      if (--this.active === 0) {
        delete this.that.__zooming;
        this.emit("end");
      }
      return this;
    },
    emit: function(type) {
      var d = select(this.that).datum();
      listeners.call(
        type,
        this.that,
        new ZoomEvent(type, {
          sourceEvent: this.sourceEvent,
          target: zoom2,
          type,
          transform: this.that.__zoom,
          dispatch: listeners
        }),
        d
      );
    }
  };
  function wheeled(event, ...args) {
    if (!filter2.apply(this, arguments))
      return;
    var g = gesture(this, args).event(event), t = this.__zoom, k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], t.k * Math.pow(2, wheelDelta.apply(this, arguments)))), p = pointer(event);
    if (g.wheel) {
      if (g.mouse[0][0] !== p[0] || g.mouse[0][1] !== p[1]) {
        g.mouse[1] = t.invert(g.mouse[0] = p);
      }
      clearTimeout(g.wheel);
    } else if (t.k === k)
      return;
    else {
      g.mouse = [p, t.invert(p)];
      interrupt(this);
      g.start();
    }
    noevent(event);
    g.wheel = setTimeout(wheelidled, wheelDelay);
    g.zoom("mouse", constrain(translate(scale(t, k), g.mouse[0], g.mouse[1]), g.extent, translateExtent));
    function wheelidled() {
      g.wheel = null;
      g.end();
    }
  }
  function mousedowned(event, ...args) {
    if (touchending || !filter2.apply(this, arguments))
      return;
    var currentTarget = event.currentTarget, g = gesture(this, args, true).event(event), v = select(event.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true), p = pointer(event, currentTarget), x02 = event.clientX, y02 = event.clientY;
    dragDisable(event.view);
    nopropagation(event);
    g.mouse = [p, this.__zoom.invert(p)];
    interrupt(this);
    g.start();
    function mousemoved(event2) {
      noevent(event2);
      if (!g.moved) {
        var dx = event2.clientX - x02, dy = event2.clientY - y02;
        g.moved = dx * dx + dy * dy > clickDistance2;
      }
      g.event(event2).zoom("mouse", constrain(translate(g.that.__zoom, g.mouse[0] = pointer(event2, currentTarget), g.mouse[1]), g.extent, translateExtent));
    }
    function mouseupped(event2) {
      v.on("mousemove.zoom mouseup.zoom", null);
      yesdrag(event2.view, g.moved);
      noevent(event2);
      g.event(event2).end();
    }
  }
  function dblclicked(event, ...args) {
    if (!filter2.apply(this, arguments))
      return;
    var t0 = this.__zoom, p0 = pointer(event.changedTouches ? event.changedTouches[0] : event, this), p1 = t0.invert(p0), k1 = t0.k * (event.shiftKey ? 0.5 : 2), t1 = constrain(translate(scale(t0, k1), p0, p1), extent2.apply(this, args), translateExtent);
    noevent(event);
    if (duration > 0)
      select(this).transition().duration(duration).call(schedule2, t1, p0, event);
    else
      select(this).call(zoom2.transform, t1, p0, event);
  }
  function touchstarted(event, ...args) {
    if (!filter2.apply(this, arguments))
      return;
    var touches = event.touches, n = touches.length, g = gesture(this, args, event.changedTouches.length === n).event(event), started, i, t, p;
    nopropagation(event);
    for (i = 0; i < n; ++i) {
      t = touches[i], p = pointer(t, this);
      p = [p, this.__zoom.invert(p), t.identifier];
      if (!g.touch0)
        g.touch0 = p, started = true, g.taps = 1 + !!touchstarting;
      else if (!g.touch1 && g.touch0[2] !== p[2])
        g.touch1 = p, g.taps = 0;
    }
    if (touchstarting)
      touchstarting = clearTimeout(touchstarting);
    if (started) {
      if (g.taps < 2)
        touchfirst = p[0], touchstarting = setTimeout(function() {
          touchstarting = null;
        }, touchDelay);
      interrupt(this);
      g.start();
    }
  }
  function touchmoved(event, ...args) {
    if (!this.__zooming)
      return;
    var g = gesture(this, args).event(event), touches = event.changedTouches, n = touches.length, i, t, p, l;
    noevent(event);
    for (i = 0; i < n; ++i) {
      t = touches[i], p = pointer(t, this);
      if (g.touch0 && g.touch0[2] === t.identifier)
        g.touch0[0] = p;
      else if (g.touch1 && g.touch1[2] === t.identifier)
        g.touch1[0] = p;
    }
    t = g.that.__zoom;
    if (g.touch1) {
      var p0 = g.touch0[0], l0 = g.touch0[1], p1 = g.touch1[0], l1 = g.touch1[1], dp = (dp = p1[0] - p0[0]) * dp + (dp = p1[1] - p0[1]) * dp, dl = (dl = l1[0] - l0[0]) * dl + (dl = l1[1] - l0[1]) * dl;
      t = scale(t, Math.sqrt(dp / dl));
      p = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
      l = [(l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2];
    } else if (g.touch0)
      p = g.touch0[0], l = g.touch0[1];
    else
      return;
    g.zoom("touch", constrain(translate(t, p, l), g.extent, translateExtent));
  }
  function touchended(event, ...args) {
    if (!this.__zooming)
      return;
    var g = gesture(this, args).event(event), touches = event.changedTouches, n = touches.length, i, t;
    nopropagation(event);
    if (touchending)
      clearTimeout(touchending);
    touchending = setTimeout(function() {
      touchending = null;
    }, touchDelay);
    for (i = 0; i < n; ++i) {
      t = touches[i];
      if (g.touch0 && g.touch0[2] === t.identifier)
        delete g.touch0;
      else if (g.touch1 && g.touch1[2] === t.identifier)
        delete g.touch1;
    }
    if (g.touch1 && !g.touch0)
      g.touch0 = g.touch1, delete g.touch1;
    if (g.touch0)
      g.touch0[1] = this.__zoom.invert(g.touch0[0]);
    else {
      g.end();
      if (g.taps === 2) {
        t = pointer(t, this);
        if (Math.hypot(touchfirst[0] - t[0], touchfirst[1] - t[1]) < tapDistance) {
          var p = select(this).on("dblclick.zoom");
          if (p)
            p.apply(this, arguments);
        }
      }
    }
  }
  zoom2.wheelDelta = function(_) {
    return arguments.length ? (wheelDelta = typeof _ === "function" ? _ : constant(+_), zoom2) : wheelDelta;
  };
  zoom2.filter = function(_) {
    return arguments.length ? (filter2 = typeof _ === "function" ? _ : constant(!!_), zoom2) : filter2;
  };
  zoom2.touchable = function(_) {
    return arguments.length ? (touchable = typeof _ === "function" ? _ : constant(!!_), zoom2) : touchable;
  };
  zoom2.extent = function(_) {
    return arguments.length ? (extent2 = typeof _ === "function" ? _ : constant([[+_[0][0], +_[0][1]], [+_[1][0], +_[1][1]]]), zoom2) : extent2;
  };
  zoom2.scaleExtent = function(_) {
    return arguments.length ? (scaleExtent[0] = +_[0], scaleExtent[1] = +_[1], zoom2) : [scaleExtent[0], scaleExtent[1]];
  };
  zoom2.translateExtent = function(_) {
    return arguments.length ? (translateExtent[0][0] = +_[0][0], translateExtent[1][0] = +_[1][0], translateExtent[0][1] = +_[0][1], translateExtent[1][1] = +_[1][1], zoom2) : [[translateExtent[0][0], translateExtent[0][1]], [translateExtent[1][0], translateExtent[1][1]]];
  };
  zoom2.constrain = function(_) {
    return arguments.length ? (constrain = _, zoom2) : constrain;
  };
  zoom2.duration = function(_) {
    return arguments.length ? (duration = +_, zoom2) : duration;
  };
  zoom2.interpolate = function(_) {
    return arguments.length ? (interpolate2 = _, zoom2) : interpolate2;
  };
  zoom2.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? zoom2 : value;
  };
  zoom2.clickDistance = function(_) {
    return arguments.length ? (clickDistance2 = (_ = +_) * _, zoom2) : Math.sqrt(clickDistance2);
  };
  zoom2.tapDistance = function(_) {
    return arguments.length ? (tapDistance = +_, zoom2) : tapDistance;
  };
  return zoom2;
}
function initRange(domain, range2) {
  switch (arguments.length) {
    case 0:
      break;
    case 1:
      this.range(domain);
      break;
    default:
      this.range(range2).domain(domain);
      break;
  }
  return this;
}
function initInterpolator(domain, interpolator) {
  switch (arguments.length) {
    case 0:
      break;
    case 1: {
      if (typeof domain === "function")
        this.interpolator(domain);
      else
        this.range(domain);
      break;
    }
    default: {
      this.domain(domain);
      if (typeof interpolator === "function")
        this.interpolator(interpolator);
      else
        this.range(interpolator);
      break;
    }
  }
  return this;
}
const implicit = Symbol("implicit");
function ordinal() {
  var index = new InternMap(), domain = [], range2 = [], unknown = implicit;
  function scale(d) {
    let i = index.get(d);
    if (i === void 0) {
      if (unknown !== implicit)
        return unknown;
      index.set(d, i = domain.push(d) - 1);
    }
    return range2[i % range2.length];
  }
  scale.domain = function(_) {
    if (!arguments.length)
      return domain.slice();
    domain = [], index = new InternMap();
    for (const value of _) {
      if (index.has(value))
        continue;
      index.set(value, domain.push(value) - 1);
    }
    return scale;
  };
  scale.range = function(_) {
    return arguments.length ? (range2 = Array.from(_), scale) : range2.slice();
  };
  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };
  scale.copy = function() {
    return ordinal(domain, range2).unknown(unknown);
  };
  initRange.apply(scale, arguments);
  return scale;
}
function constants(x) {
  return function() {
    return x;
  };
}
function number(x) {
  return +x;
}
var unit = [0, 1];
function identity$2(x) {
  return x;
}
function normalize(a, b) {
  return (b -= a = +a) ? function(x) {
    return (x - a) / b;
  } : constants(isNaN(b) ? NaN : 0.5);
}
function clamper(a, b) {
  var t;
  if (a > b)
    t = a, a = b, b = t;
  return function(x) {
    return Math.max(a, Math.min(b, x));
  };
}
function bimap(domain, range2, interpolate2) {
  var d0 = domain[0], d1 = domain[1], r0 = range2[0], r1 = range2[1];
  if (d1 < d0)
    d0 = normalize(d1, d0), r0 = interpolate2(r1, r0);
  else
    d0 = normalize(d0, d1), r0 = interpolate2(r0, r1);
  return function(x) {
    return r0(d0(x));
  };
}
function polymap(domain, range2, interpolate2) {
  var j = Math.min(domain.length, range2.length) - 1, d = new Array(j), r = new Array(j), i = -1;
  if (domain[j] < domain[0]) {
    domain = domain.slice().reverse();
    range2 = range2.slice().reverse();
  }
  while (++i < j) {
    d[i] = normalize(domain[i], domain[i + 1]);
    r[i] = interpolate2(range2[i], range2[i + 1]);
  }
  return function(x) {
    var i2 = bisectRight(domain, x, 1, j) - 1;
    return r[i2](d[i2](x));
  };
}
function copy$1(source, target) {
  return target.domain(source.domain()).range(source.range()).interpolate(source.interpolate()).clamp(source.clamp()).unknown(source.unknown());
}
function transformer$1() {
  var domain = unit, range2 = unit, interpolate2 = interpolate$1, transform, untransform, unknown, clamp = identity$2, piecewise, output, input;
  function rescale() {
    var n = Math.min(domain.length, range2.length);
    if (clamp !== identity$2)
      clamp = clamper(domain[0], domain[n - 1]);
    piecewise = n > 2 ? polymap : bimap;
    output = input = null;
    return scale;
  }
  function scale(x) {
    return x == null || isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range2, interpolate2)))(transform(clamp(x)));
  }
  scale.invert = function(y) {
    return clamp(untransform((input || (input = piecewise(range2, domain.map(transform), interpolateNumber)))(y)));
  };
  scale.domain = function(_) {
    return arguments.length ? (domain = Array.from(_, number), rescale()) : domain.slice();
  };
  scale.range = function(_) {
    return arguments.length ? (range2 = Array.from(_), rescale()) : range2.slice();
  };
  scale.rangeRound = function(_) {
    return range2 = Array.from(_), interpolate2 = interpolateRound, rescale();
  };
  scale.clamp = function(_) {
    return arguments.length ? (clamp = _ ? true : identity$2, rescale()) : clamp !== identity$2;
  };
  scale.interpolate = function(_) {
    return arguments.length ? (interpolate2 = _, rescale()) : interpolate2;
  };
  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };
  return function(t, u) {
    transform = t, untransform = u;
    return rescale();
  };
}
function continuous() {
  return transformer$1()(identity$2, identity$2);
}
function formatDecimal(x) {
  return Math.abs(x = Math.round(x)) >= 1e21 ? x.toLocaleString("en").replace(/,/g, "") : x.toString(10);
}
function formatDecimalParts(x, p) {
  if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0)
    return null;
  var i, coefficient = x.slice(0, i);
  return [
    coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
    +x.slice(i + 1)
  ];
}
function exponent(x) {
  return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
}
function formatGroup(grouping, thousands) {
  return function(value, width) {
    var i = value.length, t = [], j = 0, g = grouping[0], length = 0;
    while (i > 0 && g > 0) {
      if (length + g + 1 > width)
        g = Math.max(1, width - length);
      t.push(value.substring(i -= g, i + g));
      if ((length += g + 1) > width)
        break;
      g = grouping[j = (j + 1) % grouping.length];
    }
    return t.reverse().join(thousands);
  };
}
function formatNumerals(numerals) {
  return function(value) {
    return value.replace(/[0-9]/g, function(i) {
      return numerals[+i];
    });
  };
}
var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
function formatSpecifier(specifier) {
  if (!(match = re.exec(specifier)))
    throw new Error("invalid format: " + specifier);
  var match;
  return new FormatSpecifier({
    fill: match[1],
    align: match[2],
    sign: match[3],
    symbol: match[4],
    zero: match[5],
    width: match[6],
    comma: match[7],
    precision: match[8] && match[8].slice(1),
    trim: match[9],
    type: match[10]
  });
}
formatSpecifier.prototype = FormatSpecifier.prototype;
function FormatSpecifier(specifier) {
  this.fill = specifier.fill === void 0 ? " " : specifier.fill + "";
  this.align = specifier.align === void 0 ? ">" : specifier.align + "";
  this.sign = specifier.sign === void 0 ? "-" : specifier.sign + "";
  this.symbol = specifier.symbol === void 0 ? "" : specifier.symbol + "";
  this.zero = !!specifier.zero;
  this.width = specifier.width === void 0 ? void 0 : +specifier.width;
  this.comma = !!specifier.comma;
  this.precision = specifier.precision === void 0 ? void 0 : +specifier.precision;
  this.trim = !!specifier.trim;
  this.type = specifier.type === void 0 ? "" : specifier.type + "";
}
FormatSpecifier.prototype.toString = function() {
  return this.fill + this.align + this.sign + this.symbol + (this.zero ? "0" : "") + (this.width === void 0 ? "" : Math.max(1, this.width | 0)) + (this.comma ? "," : "") + (this.precision === void 0 ? "" : "." + Math.max(0, this.precision | 0)) + (this.trim ? "~" : "") + this.type;
};
function formatTrim(s) {
  out:
    for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
      switch (s[i]) {
        case ".":
          i0 = i1 = i;
          break;
        case "0":
          if (i0 === 0)
            i0 = i;
          i1 = i;
          break;
        default:
          if (!+s[i])
            break out;
          if (i0 > 0)
            i0 = 0;
          break;
      }
    }
  return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
}
var prefixExponent;
function formatPrefixAuto(x, p) {
  var d = formatDecimalParts(x, p);
  if (!d)
    return x + "";
  var coefficient = d[0], exponent2 = d[1], i = exponent2 - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent2 / 3))) * 3) + 1, n = coefficient.length;
  return i === n ? coefficient : i > n ? coefficient + new Array(i - n + 1).join("0") : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i) : "0." + new Array(1 - i).join("0") + formatDecimalParts(x, Math.max(0, p + i - 1))[0];
}
function formatRounded(x, p) {
  var d = formatDecimalParts(x, p);
  if (!d)
    return x + "";
  var coefficient = d[0], exponent2 = d[1];
  return exponent2 < 0 ? "0." + new Array(-exponent2).join("0") + coefficient : coefficient.length > exponent2 + 1 ? coefficient.slice(0, exponent2 + 1) + "." + coefficient.slice(exponent2 + 1) : coefficient + new Array(exponent2 - coefficient.length + 2).join("0");
}
const formatTypes = {
  "%": (x, p) => (x * 100).toFixed(p),
  "b": (x) => Math.round(x).toString(2),
  "c": (x) => x + "",
  "d": formatDecimal,
  "e": (x, p) => x.toExponential(p),
  "f": (x, p) => x.toFixed(p),
  "g": (x, p) => x.toPrecision(p),
  "o": (x) => Math.round(x).toString(8),
  "p": (x, p) => formatRounded(x * 100, p),
  "r": formatRounded,
  "s": formatPrefixAuto,
  "X": (x) => Math.round(x).toString(16).toUpperCase(),
  "x": (x) => Math.round(x).toString(16)
};
function identity$1(x) {
  return x;
}
var map = Array.prototype.map, prefixes = ["y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y"];
function formatLocale(locale2) {
  var group = locale2.grouping === void 0 || locale2.thousands === void 0 ? identity$1 : formatGroup(map.call(locale2.grouping, Number), locale2.thousands + ""), currencyPrefix = locale2.currency === void 0 ? "" : locale2.currency[0] + "", currencySuffix = locale2.currency === void 0 ? "" : locale2.currency[1] + "", decimal = locale2.decimal === void 0 ? "." : locale2.decimal + "", numerals = locale2.numerals === void 0 ? identity$1 : formatNumerals(map.call(locale2.numerals, String)), percent = locale2.percent === void 0 ? "%" : locale2.percent + "", minus = locale2.minus === void 0 ? "−" : locale2.minus + "", nan = locale2.nan === void 0 ? "NaN" : locale2.nan + "";
  function newFormat(specifier) {
    specifier = formatSpecifier(specifier);
    var fill = specifier.fill, align = specifier.align, sign = specifier.sign, symbol = specifier.symbol, zero2 = specifier.zero, width = specifier.width, comma = specifier.comma, precision = specifier.precision, trim = specifier.trim, type = specifier.type;
    if (type === "n")
      comma = true, type = "g";
    else if (!formatTypes[type])
      precision === void 0 && (precision = 12), trim = true, type = "g";
    if (zero2 || fill === "0" && align === "=")
      zero2 = true, fill = "0", align = "=";
    var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "", suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";
    var formatType = formatTypes[type], maybeSuffix = /[defgprs%]/.test(type);
    precision = precision === void 0 ? 6 : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision)) : Math.max(0, Math.min(20, precision));
    function format2(value) {
      var valuePrefix = prefix, valueSuffix = suffix, i, n, c2;
      if (type === "c") {
        valueSuffix = formatType(value) + valueSuffix;
        value = "";
      } else {
        value = +value;
        var valueNegative = value < 0 || 1 / value < 0;
        value = isNaN(value) ? nan : formatType(Math.abs(value), precision);
        if (trim)
          value = formatTrim(value);
        if (valueNegative && +value === 0 && sign !== "+")
          valueNegative = false;
        valuePrefix = (valueNegative ? sign === "(" ? sign : minus : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
        valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");
        if (maybeSuffix) {
          i = -1, n = value.length;
          while (++i < n) {
            if (c2 = value.charCodeAt(i), 48 > c2 || c2 > 57) {
              valueSuffix = (c2 === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
              value = value.slice(0, i);
              break;
            }
          }
        }
      }
      if (comma && !zero2)
        value = group(value, Infinity);
      var length = valuePrefix.length + value.length + valueSuffix.length, padding = length < width ? new Array(width - length + 1).join(fill) : "";
      if (comma && zero2)
        value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";
      switch (align) {
        case "<":
          value = valuePrefix + value + valueSuffix + padding;
          break;
        case "=":
          value = valuePrefix + padding + value + valueSuffix;
          break;
        case "^":
          value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length);
          break;
        default:
          value = padding + valuePrefix + value + valueSuffix;
          break;
      }
      return numerals(value);
    }
    format2.toString = function() {
      return specifier + "";
    };
    return format2;
  }
  function formatPrefix2(specifier, value) {
    var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)), e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3, k = Math.pow(10, -e), prefix = prefixes[8 + e / 3];
    return function(value2) {
      return f(k * value2) + prefix;
    };
  }
  return {
    format: newFormat,
    formatPrefix: formatPrefix2
  };
}
var locale;
var format;
var formatPrefix;
defaultLocale({
  thousands: ",",
  grouping: [3],
  currency: ["$", ""]
});
function defaultLocale(definition) {
  locale = formatLocale(definition);
  format = locale.format;
  formatPrefix = locale.formatPrefix;
  return locale;
}
function precisionFixed(step) {
  return Math.max(0, -exponent(Math.abs(step)));
}
function precisionPrefix(step, value) {
  return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
}
function precisionRound(step, max2) {
  step = Math.abs(step), max2 = Math.abs(max2) - step;
  return Math.max(0, exponent(max2) - exponent(step)) + 1;
}
function tickFormat(start2, stop, count, specifier) {
  var step = tickStep(start2, stop, count), precision;
  specifier = formatSpecifier(specifier == null ? ",f" : specifier);
  switch (specifier.type) {
    case "s": {
      var value = Math.max(Math.abs(start2), Math.abs(stop));
      if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value)))
        specifier.precision = precision;
      return formatPrefix(specifier, value);
    }
    case "":
    case "e":
    case "g":
    case "p":
    case "r": {
      if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start2), Math.abs(stop)))))
        specifier.precision = precision - (specifier.type === "e");
      break;
    }
    case "f":
    case "%": {
      if (specifier.precision == null && !isNaN(precision = precisionFixed(step)))
        specifier.precision = precision - (specifier.type === "%") * 2;
      break;
    }
  }
  return format(specifier);
}
function linearish(scale) {
  var domain = scale.domain;
  scale.ticks = function(count) {
    var d = domain();
    return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
  };
  scale.tickFormat = function(count, specifier) {
    var d = domain();
    return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
  };
  scale.nice = function(count) {
    if (count == null)
      count = 10;
    var d = domain();
    var i0 = 0;
    var i1 = d.length - 1;
    var start2 = d[i0];
    var stop = d[i1];
    var prestep;
    var step;
    var maxIter = 10;
    if (stop < start2) {
      step = start2, start2 = stop, stop = step;
      step = i0, i0 = i1, i1 = step;
    }
    while (maxIter-- > 0) {
      step = tickIncrement(start2, stop, count);
      if (step === prestep) {
        d[i0] = start2;
        d[i1] = stop;
        return domain(d);
      } else if (step > 0) {
        start2 = Math.floor(start2 / step) * step;
        stop = Math.ceil(stop / step) * step;
      } else if (step < 0) {
        start2 = Math.ceil(start2 * step) / step;
        stop = Math.floor(stop * step) / step;
      } else {
        break;
      }
      prestep = step;
    }
    return scale;
  };
  return scale;
}
function linear() {
  var scale = continuous();
  scale.copy = function() {
    return copy$1(scale, linear());
  };
  initRange.apply(scale, arguments);
  return linearish(scale);
}
function identity(domain) {
  var unknown;
  function scale(x) {
    return x == null || isNaN(x = +x) ? unknown : x;
  }
  scale.invert = scale;
  scale.domain = scale.range = function(_) {
    return arguments.length ? (domain = Array.from(_, number), scale) : domain.slice();
  };
  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };
  scale.copy = function() {
    return identity(domain).unknown(unknown);
  };
  domain = arguments.length ? Array.from(domain, number) : [0, 1];
  return linearish(scale);
}
function nice(domain, interval2) {
  domain = domain.slice();
  var i0 = 0, i1 = domain.length - 1, x02 = domain[i0], x12 = domain[i1], t;
  if (x12 < x02) {
    t = i0, i0 = i1, i1 = t;
    t = x02, x02 = x12, x12 = t;
  }
  domain[i0] = interval2.floor(x02);
  domain[i1] = interval2.ceil(x12);
  return domain;
}
function transformLog(x) {
  return Math.log(x);
}
function transformExp(x) {
  return Math.exp(x);
}
function transformLogn(x) {
  return -Math.log(-x);
}
function transformExpn(x) {
  return -Math.exp(-x);
}
function pow10(x) {
  return isFinite(x) ? +("1e" + x) : x < 0 ? 0 : x;
}
function powp(base) {
  return base === 10 ? pow10 : base === Math.E ? Math.exp : (x) => Math.pow(base, x);
}
function logp(base) {
  return base === Math.E ? Math.log : base === 10 && Math.log10 || base === 2 && Math.log2 || (base = Math.log(base), (x) => Math.log(x) / base);
}
function reflect(f) {
  return (x, k) => -f(-x, k);
}
function loggish(transform) {
  const scale = transform(transformLog, transformExp);
  const domain = scale.domain;
  let base = 10;
  let logs;
  let pows;
  function rescale() {
    logs = logp(base), pows = powp(base);
    if (domain()[0] < 0) {
      logs = reflect(logs), pows = reflect(pows);
      transform(transformLogn, transformExpn);
    } else {
      transform(transformLog, transformExp);
    }
    return scale;
  }
  scale.base = function(_) {
    return arguments.length ? (base = +_, rescale()) : base;
  };
  scale.domain = function(_) {
    return arguments.length ? (domain(_), rescale()) : domain();
  };
  scale.ticks = (count) => {
    const d = domain();
    let u = d[0];
    let v = d[d.length - 1];
    const r = v < u;
    if (r)
      [u, v] = [v, u];
    let i = logs(u);
    let j = logs(v);
    let k;
    let t;
    const n = count == null ? 10 : +count;
    let z = [];
    if (!(base % 1) && j - i < n) {
      i = Math.floor(i), j = Math.ceil(j);
      if (u > 0)
        for (; i <= j; ++i) {
          for (k = 1; k < base; ++k) {
            t = i < 0 ? k / pows(-i) : k * pows(i);
            if (t < u)
              continue;
            if (t > v)
              break;
            z.push(t);
          }
        }
      else
        for (; i <= j; ++i) {
          for (k = base - 1; k >= 1; --k) {
            t = i > 0 ? k / pows(-i) : k * pows(i);
            if (t < u)
              continue;
            if (t > v)
              break;
            z.push(t);
          }
        }
      if (z.length * 2 < n)
        z = ticks(u, v, n);
    } else {
      z = ticks(i, j, Math.min(j - i, n)).map(pows);
    }
    return r ? z.reverse() : z;
  };
  scale.tickFormat = (count, specifier) => {
    if (count == null)
      count = 10;
    if (specifier == null)
      specifier = base === 10 ? "s" : ",";
    if (typeof specifier !== "function") {
      if (!(base % 1) && (specifier = formatSpecifier(specifier)).precision == null)
        specifier.trim = true;
      specifier = format(specifier);
    }
    if (count === Infinity)
      return specifier;
    const k = Math.max(1, base * count / scale.ticks().length);
    return (d) => {
      let i = d / pows(Math.round(logs(d)));
      if (i * base < base - 0.5)
        i *= base;
      return i <= k ? specifier(d) : "";
    };
  };
  scale.nice = () => {
    return domain(nice(domain(), {
      floor: (x) => pows(Math.floor(logs(x))),
      ceil: (x) => pows(Math.ceil(logs(x)))
    }));
  };
  return scale;
}
function log() {
  const scale = loggish(transformer$1()).domain([1, 10]);
  scale.copy = () => copy$1(scale, log()).base(scale.base());
  initRange.apply(scale, arguments);
  return scale;
}
function transformPow(exponent2) {
  return function(x) {
    return x < 0 ? -Math.pow(-x, exponent2) : Math.pow(x, exponent2);
  };
}
function transformSqrt(x) {
  return x < 0 ? -Math.sqrt(-x) : Math.sqrt(x);
}
function transformSquare(x) {
  return x < 0 ? -x * x : x * x;
}
function powish(transform) {
  var scale = transform(identity$2, identity$2), exponent2 = 1;
  function rescale() {
    return exponent2 === 1 ? transform(identity$2, identity$2) : exponent2 === 0.5 ? transform(transformSqrt, transformSquare) : transform(transformPow(exponent2), transformPow(1 / exponent2));
  }
  scale.exponent = function(_) {
    return arguments.length ? (exponent2 = +_, rescale()) : exponent2;
  };
  return linearish(scale);
}
function pow() {
  var scale = powish(transformer$1());
  scale.copy = function() {
    return copy$1(scale, pow()).exponent(scale.exponent());
  };
  initRange.apply(scale, arguments);
  return scale;
}
function sqrt() {
  return pow.apply(null, arguments).exponent(0.5);
}
function transformer() {
  var x02 = 0, x12 = 1, t0, t1, k10, transform, interpolator = identity$2, clamp = false, unknown;
  function scale(x) {
    return x == null || isNaN(x = +x) ? unknown : interpolator(k10 === 0 ? 0.5 : (x = (transform(x) - t0) * k10, clamp ? Math.max(0, Math.min(1, x)) : x));
  }
  scale.domain = function(_) {
    return arguments.length ? ([x02, x12] = _, t0 = transform(x02 = +x02), t1 = transform(x12 = +x12), k10 = t0 === t1 ? 0 : 1 / (t1 - t0), scale) : [x02, x12];
  };
  scale.clamp = function(_) {
    return arguments.length ? (clamp = !!_, scale) : clamp;
  };
  scale.interpolator = function(_) {
    return arguments.length ? (interpolator = _, scale) : interpolator;
  };
  function range2(interpolate2) {
    return function(_) {
      var r0, r1;
      return arguments.length ? ([r0, r1] = _, interpolator = interpolate2(r0, r1), scale) : [interpolator(0), interpolator(1)];
    };
  }
  scale.range = range2(interpolate$1);
  scale.rangeRound = range2(interpolateRound);
  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };
  return function(t) {
    transform = t, t0 = t(x02), t1 = t(x12), k10 = t0 === t1 ? 0 : 1 / (t1 - t0);
    return scale;
  };
}
function copy(source, target) {
  return target.domain(source.domain()).interpolator(source.interpolator()).clamp(source.clamp()).unknown(source.unknown());
}
function sequential() {
  var scale = linearish(transformer()(identity$2));
  scale.copy = function() {
    return copy(scale, sequential());
  };
  return initInterpolator.apply(scale, arguments);
}
function sequentialLog() {
  var scale = loggish(transformer()).domain([1, 10]);
  scale.copy = function() {
    return copy(scale, sequentialLog()).base(scale.base());
  };
  return initInterpolator.apply(scale, arguments);
}
function sequentialPow() {
  var scale = powish(transformer());
  scale.copy = function() {
    return copy(scale, sequentialPow()).exponent(scale.exponent());
  };
  return initInterpolator.apply(scale, arguments);
}
class Zoom {
  constructor(selector2, prefs, plot) {
    this.prefs = prefs;
    this.svg_element_selection = select(selector2);
    this.width = +this.svg_element_selection.attr("width");
    this.height = +this.svg_element_selection.attr("height");
    this.renderers = /* @__PURE__ */ new Map();
    this.scatterplot = plot;
    this.renderers = /* @__PURE__ */ new Map();
  }
  attach_tiles(tiles) {
    this.tileSet = tiles;
    this.tileSet._zoom = this;
    return this;
  }
  attach_renderer(key, renderer) {
    this.renderers.set(key, renderer);
    renderer.bind_zoom(this);
    renderer.zoom.initialize_zoom();
    return this;
  }
  zoom_to(k, x, y, duration = 4e3) {
    const scales2 = this.scales();
    const { svg_element_selection: canvas, zoomer, width, height } = this;
    const t = identity$3.translate(width / 2, height / 2).scale(k).translate(-scales2.x(x), -scales2.y(y));
    canvas.transition().duration(duration).call(zoomer.transform, t);
  }
  html_annotation(points) {
    const div = this.svg_element_selection.node().parentNode.parentNode;
    let opacity = 0.75;
    if (this.scatterplot.prefs.tooltip_opacity !== void 0) {
      opacity = this.scatterplot.prefs.tooltip_opacity;
    }
    const els = select(div).selectAll("div.tooltip").data(points).join(
      (enter) => enter.append("div").attr("class", "tooltip").style("top", 0).style("left", 0).style("position", "absolute").style("z-index", 100).style("border-radius", "8px").style("padding", "10px").style("background", "ivory").style("opacity", opacity),
      (update) => update.html((d) => this.scatterplot.tooltip_html(d.data, this.scatterplot)),
      (exit) => exit.call((e) => e.remove())
    );
    els.html((d) => this.scatterplot.tooltip_html(d.data, this)).style("transform", (d) => {
      const t = `translate(${+d.x + d.dx}px, ${+d.y + d.dy}px)`;
      return t;
    });
  }
  zoom_to_bbox(corners, duration = 4e3, buffer = 1.111) {
    const scales2 = this.scales();
    let [x02, x12] = corners.x.map(scales2.x);
    const [y02, y12] = corners.y.map(scales2.y);
    if (this.scatterplot.prefs.zoom_align === "right") {
      const aspect_ratio = this.width / this.height;
      const data_aspect_ratio = (x12 - x02) / (y12 - y02);
      if (data_aspect_ratio < aspect_ratio) {
        const extension = data_aspect_ratio / aspect_ratio;
        console.log(extension, { x0: x02 });
        x02 = x02 - (x12 - x02) * extension;
      }
    }
    const { svg_element_selection: canvas, zoomer, width, height } = this;
    const t = identity$3.translate(width / 2, height / 2).scale(1 / buffer / Math.max((x12 - x02) / width, (y12 - y02) / height)).translate(-(x02 + x12) / 2, -(y02 + y12) / 2);
    canvas.transition().duration(duration).call(zoomer.transform, t);
  }
  initialize_zoom() {
    const { width, height, svg_element_selection: canvas } = this;
    this.transform = identity$3;
    const zoomer = zoom().scaleExtent([1 / 3, 1e5]).extent([
      [0, 0],
      [width, height]
    ]).on("zoom", (event) => {
      var _a, _b, _c;
      try {
        document.getElementById("tooltipcircle").remove();
      } catch (error) {
      }
      this.transform = event.transform;
      this.restart_timer(10 * 1e3);
      (_b = (_a = this.scatterplot).on_zoom) == null ? void 0 : _b.call(_a, event.transform);
      (_c = event == null ? void 0 : event.sourceEvent) == null ? void 0 : _c.stopPropagation();
    });
    canvas.call(zoomer);
    this.add_mouseover();
    this.zoomer = zoomer;
  }
  set_highlit_points(data) {
    const { x_, y_ } = this.scales();
    const xdim = this.scatterplot.dim("x");
    const ydim = this.scatterplot.dim("y");
    this.scatterplot.highlit_point_change(data);
    const annotations = data.map((d) => ({
      x: x_(xdim.apply(d)),
      y: y_(ydim.apply(d)),
      data: d,
      dx: 0,
      dy: 30
    }));
    this.html_annotation(annotations);
    const sel = this.svg_element_selection.select("#mousepoints");
    sel.selectAll("circle.label").data(data, (d_) => d_.ix).join(
      (enter) => enter.append("circle").attr("id", "tooltipcircle").attr("class", "label").attr("stroke", "#110022").attr("r", 12).attr("fill", (dd) => this.scatterplot.dim("color").apply(dd)).attr("cx", (datum2) => x_(xdim.apply(datum2))).attr("cy", (datum2) => y_(ydim.apply(datum2))),
      (update) => update.attr("fill", (dd) => this.scatterplot.dim("color").apply(dd)),
      (exit) => exit.call((e) => {
        e.remove();
      })
    ).on("click", (ev, dd) => {
      this.scatterplot.click_function(dd, this.scatterplot);
    });
  }
  set_highlit_point(point) {
    this.set_highlit_points([point]);
  }
  add_mouseover() {
    let last_fired = 0;
    const renderer = this.renderers.get(
      "regl"
    );
    this.svg_element_selection.on("mousemove", (event) => {
      if (Date.now() - last_fired < 75) {
        return;
      }
      last_fired = Date.now();
      const p = renderer.color_pick(event.offsetX, event.offsetY);
      if (p === null) {
        this.set_highlit_points([]);
      } else {
        this.set_highlit_points([p]);
      }
    });
  }
  current_corners() {
    const { width, height } = this;
    const scales2 = this.scales();
    if (scales2 === void 0) {
      return;
    }
    const { x_, y_ } = scales2;
    return {
      x: [x_.invert(0), x_.invert(width)],
      y: [y_.invert(0), y_.invert(height)]
    };
  }
  current_center() {
    const { x, y } = this.current_corners();
    return [(x[0] + x[1]) / 2, (y[0] + y[1]) / 2];
  }
  restart_timer(run_at_least = 1e4) {
    let stop_at = Date.now() + run_at_least;
    if (this._timer) {
      if (this._timer.stop_at > stop_at) {
        stop_at = this._timer.stop_at;
      }
      this._timer.stop();
    }
    const t = timer(this.tick.bind(this));
    this._timer = t;
    this._timer.stop_at = stop_at;
    return this._timer;
  }
  data(dataset) {
    if (dataset === void 0) {
      return this.tileSet;
    }
    this.tileSet = dataset;
    return this;
  }
  scales(equal_units = true) {
    if (this._scales) {
      this._scales.x_ = this.transform.rescaleX(this._scales.x);
      this._scales.y_ = this.transform.rescaleY(this._scales.y);
      return this._scales;
    }
    const { width, height } = this;
    if (this.tileSet === void 0) {
      throw new Error("Error--scales created before tileSet present.");
    }
    const { extent: extent2 } = this.tileSet;
    const scales2 = {};
    if (extent2 === void 0) {
      throw new Error("Error--scales created before extent present.");
    }
    const scale_dat = {};
    for (const [name, dim] of [
      ["x", width],
      ["y", height]
    ]) {
      const limits = extent2[name];
      const size_range = limits[1] - limits[0];
      scale_dat[name] = {
        limits,
        size_range,
        pixels_per_unit: dim / size_range
      };
    }
    const data_aspect_ratio = scale_dat.x.pixels_per_unit / scale_dat.y.pixels_per_unit;
    let x_buffer_size = 0;
    let y_buffer_size = 0;
    let x_target_size = width;
    let y_target_size = height;
    if (data_aspect_ratio > 1) {
      x_target_size = width / data_aspect_ratio;
      x_buffer_size = (width - x_target_size) / 2;
    } else {
      y_target_size = height * data_aspect_ratio;
      y_buffer_size = (height - y_target_size) / 2;
    }
    scales2.x = linear().domain(scale_dat.x.limits).range([x_buffer_size, width - x_buffer_size]);
    scales2.y = linear().domain(scale_dat.y.limits).range([y_buffer_size, height - y_buffer_size]);
    scales2.x_ = this.transform.rescaleX(scales2.x);
    scales2.y_ = this.transform.rescaleY(scales2.y);
    this._scales = scales2;
    return scales2;
  }
  webgl_scale(flatten2 = true) {
    const { x, y } = this.scales();
    const transform = window_transform(x, y).flat();
    return transform;
  }
  tick(force = false) {
    this._start = this._start || Date.now();
    if (force !== true && this._timer && //@ts-ignore
    this._timer.stop_at <= Date.now()) {
      this._timer.stop();
    }
  }
}
function window_transform(x_scale, y_scale) {
  function gap(array2) {
    return array2[1] - array2[0];
  }
  const x_mid = mean(x_scale.domain());
  const y_mid = mean(y_scale.domain());
  const xmulti = gap(x_scale.range()) / gap(x_scale.domain());
  const ymulti = gap(y_scale.range()) / gap(y_scale.domain());
  const m1 = [
    // transform by the scale;
    [xmulti, 0, -xmulti * x_mid + mean(x_scale.range())],
    [0, ymulti, -ymulti * y_mid + mean(y_scale.range())],
    [0, 0, 1]
  ];
  return m1;
}
var reglExports = {};
var regl = {
  get exports() {
    return reglExports;
  },
  set exports(v) {
    reglExports = v;
  }
};
(function(module, exports) {
  (function(global2, factory) {
    module.exports = factory();
  })(commonjsGlobal, function() {
    var isTypedArray = function(x) {
      return x instanceof Uint8Array || x instanceof Uint16Array || x instanceof Uint32Array || x instanceof Int8Array || x instanceof Int16Array || x instanceof Int32Array || x instanceof Float32Array || x instanceof Float64Array || x instanceof Uint8ClampedArray;
    };
    var extend2 = function(base, opts) {
      var keys = Object.keys(opts);
      for (var i = 0; i < keys.length; ++i) {
        base[keys[i]] = opts[keys[i]];
      }
      return base;
    };
    var endl = "\n";
    function decodeB64(str) {
      if (typeof atob !== "undefined") {
        return atob(str);
      }
      return "base64:" + str;
    }
    function raise2(message) {
      var error = new Error("(regl) " + message);
      console.error(error);
      throw error;
    }
    function check(pred, message) {
      if (!pred) {
        raise2(message);
      }
    }
    function encolon(message) {
      if (message) {
        return ": " + message;
      }
      return "";
    }
    function checkParameter(param, possibilities, message) {
      if (!(param in possibilities)) {
        raise2("unknown parameter (" + param + ")" + encolon(message) + ". possible values: " + Object.keys(possibilities).join());
      }
    }
    function checkIsTypedArray(data, message) {
      if (!isTypedArray(data)) {
        raise2(
          "invalid parameter type" + encolon(message) + ". must be a typed array"
        );
      }
    }
    function standardTypeEh(value, type) {
      switch (type) {
        case "number":
          return typeof value === "number";
        case "object":
          return typeof value === "object";
        case "string":
          return typeof value === "string";
        case "boolean":
          return typeof value === "boolean";
        case "function":
          return typeof value === "function";
        case "undefined":
          return typeof value === "undefined";
        case "symbol":
          return typeof value === "symbol";
      }
    }
    function checkTypeOf(value, type, message) {
      if (!standardTypeEh(value, type)) {
        raise2(
          "invalid parameter type" + encolon(message) + ". expected " + type + ", got " + typeof value
        );
      }
    }
    function checkNonNegativeInt(value, message) {
      if (!(value >= 0 && (value | 0) === value)) {
        raise2("invalid parameter type, (" + value + ")" + encolon(message) + ". must be a nonnegative integer");
      }
    }
    function checkOneOf(value, list, message) {
      if (list.indexOf(value) < 0) {
        raise2("invalid value" + encolon(message) + ". must be one of: " + list);
      }
    }
    var constructorKeys = [
      "gl",
      "canvas",
      "container",
      "attributes",
      "pixelRatio",
      "extensions",
      "optionalExtensions",
      "profile",
      "onDone"
    ];
    function checkConstructor(obj) {
      Object.keys(obj).forEach(function(key) {
        if (constructorKeys.indexOf(key) < 0) {
          raise2('invalid regl constructor argument "' + key + '". must be one of ' + constructorKeys);
        }
      });
    }
    function leftPad(str, n) {
      str = str + "";
      while (str.length < n) {
        str = " " + str;
      }
      return str;
    }
    function ShaderFile() {
      this.name = "unknown";
      this.lines = [];
      this.index = {};
      this.hasErrors = false;
    }
    function ShaderLine(number2, line2) {
      this.number = number2;
      this.line = line2;
      this.errors = [];
    }
    function ShaderError(fileNumber, lineNumber, message) {
      this.file = fileNumber;
      this.line = lineNumber;
      this.message = message;
    }
    function guessCommand() {
      var error = new Error();
      var stack = (error.stack || error).toString();
      var pat = /compileProcedure.*\n\s*at.*\((.*)\)/.exec(stack);
      if (pat) {
        return pat[1];
      }
      var pat2 = /compileProcedure.*\n\s*at\s+(.*)(\n|$)/.exec(stack);
      if (pat2) {
        return pat2[1];
      }
      return "unknown";
    }
    function guessCallSite() {
      var error = new Error();
      var stack = (error.stack || error).toString();
      var pat = /at REGLCommand.*\n\s+at.*\((.*)\)/.exec(stack);
      if (pat) {
        return pat[1];
      }
      var pat2 = /at REGLCommand.*\n\s+at\s+(.*)\n/.exec(stack);
      if (pat2) {
        return pat2[1];
      }
      return "unknown";
    }
    function parseSource(source, command) {
      var lines2 = source.split("\n");
      var lineNumber = 1;
      var fileNumber = 0;
      var files = {
        unknown: new ShaderFile(),
        0: new ShaderFile()
      };
      files.unknown.name = files[0].name = command || guessCommand();
      files.unknown.lines.push(new ShaderLine(0, ""));
      for (var i = 0; i < lines2.length; ++i) {
        var line2 = lines2[i];
        var parts = /^\s*#\s*(\w+)\s+(.+)\s*$/.exec(line2);
        if (parts) {
          switch (parts[1]) {
            case "line":
              var lineNumberInfo = /(\d+)(\s+\d+)?/.exec(parts[2]);
              if (lineNumberInfo) {
                lineNumber = lineNumberInfo[1] | 0;
                if (lineNumberInfo[2]) {
                  fileNumber = lineNumberInfo[2] | 0;
                  if (!(fileNumber in files)) {
                    files[fileNumber] = new ShaderFile();
                  }
                }
              }
              break;
            case "define":
              var nameInfo = /SHADER_NAME(_B64)?\s+(.*)$/.exec(parts[2]);
              if (nameInfo) {
                files[fileNumber].name = nameInfo[1] ? decodeB64(nameInfo[2]) : nameInfo[2];
              }
              break;
          }
        }
        files[fileNumber].lines.push(new ShaderLine(lineNumber++, line2));
      }
      Object.keys(files).forEach(function(fileNumber2) {
        var file = files[fileNumber2];
        file.lines.forEach(function(line3) {
          file.index[line3.number] = line3;
        });
      });
      return files;
    }
    function parseErrorLog(errLog) {
      var result = [];
      errLog.split("\n").forEach(function(errMsg) {
        if (errMsg.length < 5) {
          return;
        }
        var parts = /^ERROR:\s+(\d+):(\d+):\s*(.*)$/.exec(errMsg);
        if (parts) {
          result.push(new ShaderError(
            parts[1] | 0,
            parts[2] | 0,
            parts[3].trim()
          ));
        } else if (errMsg.length > 0) {
          result.push(new ShaderError("unknown", 0, errMsg));
        }
      });
      return result;
    }
    function annotateFiles(files, errors) {
      errors.forEach(function(error) {
        var file = files[error.file];
        if (file) {
          var line2 = file.index[error.line];
          if (line2) {
            line2.errors.push(error);
            file.hasErrors = true;
            return;
          }
        }
        files.unknown.hasErrors = true;
        files.unknown.lines[0].errors.push(error);
      });
    }
    function checkShaderError(gl, shader, source, type, command) {
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        var errLog = gl.getShaderInfoLog(shader);
        var typeName = type === gl.FRAGMENT_SHADER ? "fragment" : "vertex";
        checkCommandType(source, "string", typeName + " shader source must be a string", command);
        var files = parseSource(source, command);
        var errors = parseErrorLog(errLog);
        annotateFiles(files, errors);
        Object.keys(files).forEach(function(fileNumber) {
          var file = files[fileNumber];
          if (!file.hasErrors) {
            return;
          }
          var strings = [""];
          var styles = [""];
          function push(str, style) {
            strings.push(str);
            styles.push(style || "");
          }
          push("file number " + fileNumber + ": " + file.name + "\n", "color:red;text-decoration:underline;font-weight:bold");
          file.lines.forEach(function(line2) {
            if (line2.errors.length > 0) {
              push(leftPad(line2.number, 4) + "|  ", "background-color:yellow; font-weight:bold");
              push(line2.line + endl, "color:red; background-color:yellow; font-weight:bold");
              var offset = 0;
              line2.errors.forEach(function(error) {
                var message = error.message;
                var token = /^\s*'(.*)'\s*:\s*(.*)$/.exec(message);
                if (token) {
                  var tokenPat = token[1];
                  message = token[2];
                  switch (tokenPat) {
                    case "assign":
                      tokenPat = "=";
                      break;
                  }
                  offset = Math.max(line2.line.indexOf(tokenPat, offset), 0);
                } else {
                  offset = 0;
                }
                push(leftPad("| ", 6));
                push(leftPad("^^^", offset + 3) + endl, "font-weight:bold");
                push(leftPad("| ", 6));
                push(message + endl, "font-weight:bold");
              });
              push(leftPad("| ", 6) + endl);
            } else {
              push(leftPad(line2.number, 4) + "|  ");
              push(line2.line + endl, "color:red");
            }
          });
          if (typeof document !== "undefined" && !window.chrome) {
            styles[0] = strings.join("%c");
            console.log.apply(console, styles);
          } else {
            console.log(strings.join(""));
          }
        });
        check.raise("Error compiling " + typeName + " shader, " + files[0].name);
      }
    }
    function checkLinkError(gl, program, fragShader, vertShader, command) {
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        var errLog = gl.getProgramInfoLog(program);
        var fragParse = parseSource(fragShader, command);
        var vertParse = parseSource(vertShader, command);
        var header = 'Error linking program with vertex shader, "' + vertParse[0].name + '", and fragment shader "' + fragParse[0].name + '"';
        if (typeof document !== "undefined") {
          console.log(
            "%c" + header + endl + "%c" + errLog,
            "color:red;text-decoration:underline;font-weight:bold",
            "color:red"
          );
        } else {
          console.log(header + endl + errLog);
        }
        check.raise(header);
      }
    }
    function saveCommandRef(object2) {
      object2._commandRef = guessCommand();
    }
    function saveDrawCommandInfo(opts, uniforms, attributes, stringStore) {
      saveCommandRef(opts);
      function id2(str) {
        if (str) {
          return stringStore.id(str);
        }
        return 0;
      }
      opts._fragId = id2(opts.static.frag);
      opts._vertId = id2(opts.static.vert);
      function addProps(dict, set2) {
        Object.keys(set2).forEach(function(u) {
          dict[stringStore.id(u)] = true;
        });
      }
      var uniformSet = opts._uniformSet = {};
      addProps(uniformSet, uniforms.static);
      addProps(uniformSet, uniforms.dynamic);
      var attributeSet = opts._attributeSet = {};
      addProps(attributeSet, attributes.static);
      addProps(attributeSet, attributes.dynamic);
      opts._hasCount = "count" in opts.static || "count" in opts.dynamic || "elements" in opts.static || "elements" in opts.dynamic;
    }
    function commandRaise(message, command) {
      var callSite = guessCallSite();
      raise2(message + " in command " + (command || guessCommand()) + (callSite === "unknown" ? "" : " called from " + callSite));
    }
    function checkCommand(pred, message, command) {
      if (!pred) {
        commandRaise(message, command || guessCommand());
      }
    }
    function checkParameterCommand(param, possibilities, message, command) {
      if (!(param in possibilities)) {
        commandRaise(
          "unknown parameter (" + param + ")" + encolon(message) + ". possible values: " + Object.keys(possibilities).join(),
          command || guessCommand()
        );
      }
    }
    function checkCommandType(value, type, message, command) {
      if (!standardTypeEh(value, type)) {
        commandRaise(
          "invalid parameter type" + encolon(message) + ". expected " + type + ", got " + typeof value,
          command || guessCommand()
        );
      }
    }
    function checkOptional(block) {
      block();
    }
    function checkFramebufferFormat(attachment, texFormats, rbFormats) {
      if (attachment.texture) {
        checkOneOf(
          attachment.texture._texture.internalformat,
          texFormats,
          "unsupported texture format for attachment"
        );
      } else {
        checkOneOf(
          attachment.renderbuffer._renderbuffer.format,
          rbFormats,
          "unsupported renderbuffer format for attachment"
        );
      }
    }
    var GL_CLAMP_TO_EDGE = 33071;
    var GL_NEAREST = 9728;
    var GL_NEAREST_MIPMAP_NEAREST = 9984;
    var GL_LINEAR_MIPMAP_NEAREST = 9985;
    var GL_NEAREST_MIPMAP_LINEAR = 9986;
    var GL_LINEAR_MIPMAP_LINEAR = 9987;
    var GL_BYTE = 5120;
    var GL_UNSIGNED_BYTE = 5121;
    var GL_SHORT = 5122;
    var GL_UNSIGNED_SHORT = 5123;
    var GL_INT = 5124;
    var GL_UNSIGNED_INT = 5125;
    var GL_FLOAT = 5126;
    var GL_UNSIGNED_SHORT_4_4_4_4 = 32819;
    var GL_UNSIGNED_SHORT_5_5_5_1 = 32820;
    var GL_UNSIGNED_SHORT_5_6_5 = 33635;
    var GL_UNSIGNED_INT_24_8_WEBGL = 34042;
    var GL_HALF_FLOAT_OES = 36193;
    var TYPE_SIZE = {};
    TYPE_SIZE[GL_BYTE] = TYPE_SIZE[GL_UNSIGNED_BYTE] = 1;
    TYPE_SIZE[GL_SHORT] = TYPE_SIZE[GL_UNSIGNED_SHORT] = TYPE_SIZE[GL_HALF_FLOAT_OES] = TYPE_SIZE[GL_UNSIGNED_SHORT_5_6_5] = TYPE_SIZE[GL_UNSIGNED_SHORT_4_4_4_4] = TYPE_SIZE[GL_UNSIGNED_SHORT_5_5_5_1] = 2;
    TYPE_SIZE[GL_INT] = TYPE_SIZE[GL_UNSIGNED_INT] = TYPE_SIZE[GL_FLOAT] = TYPE_SIZE[GL_UNSIGNED_INT_24_8_WEBGL] = 4;
    function pixelSize(type, channels) {
      if (type === GL_UNSIGNED_SHORT_5_5_5_1 || type === GL_UNSIGNED_SHORT_4_4_4_4 || type === GL_UNSIGNED_SHORT_5_6_5) {
        return 2;
      } else if (type === GL_UNSIGNED_INT_24_8_WEBGL) {
        return 4;
      } else {
        return TYPE_SIZE[type] * channels;
      }
    }
    function isPow2(v) {
      return !(v & v - 1) && !!v;
    }
    function checkTexture2D(info, mipData, limits) {
      var i;
      var w = mipData.width;
      var h = mipData.height;
      var c2 = mipData.channels;
      check(
        w > 0 && w <= limits.maxTextureSize && h > 0 && h <= limits.maxTextureSize,
        "invalid texture shape"
      );
      if (info.wrapS !== GL_CLAMP_TO_EDGE || info.wrapT !== GL_CLAMP_TO_EDGE) {
        check(
          isPow2(w) && isPow2(h),
          "incompatible wrap mode for texture, both width and height must be power of 2"
        );
      }
      if (mipData.mipmask === 1) {
        if (w !== 1 && h !== 1) {
          check(
            info.minFilter !== GL_NEAREST_MIPMAP_NEAREST && info.minFilter !== GL_NEAREST_MIPMAP_LINEAR && info.minFilter !== GL_LINEAR_MIPMAP_NEAREST && info.minFilter !== GL_LINEAR_MIPMAP_LINEAR,
            "min filter requires mipmap"
          );
        }
      } else {
        check(
          isPow2(w) && isPow2(h),
          "texture must be a square power of 2 to support mipmapping"
        );
        check(
          mipData.mipmask === (w << 1) - 1,
          "missing or incomplete mipmap data"
        );
      }
      if (mipData.type === GL_FLOAT) {
        if (limits.extensions.indexOf("oes_texture_float_linear") < 0) {
          check(
            info.minFilter === GL_NEAREST && info.magFilter === GL_NEAREST,
            "filter not supported, must enable oes_texture_float_linear"
          );
        }
        check(
          !info.genMipmaps,
          "mipmap generation not supported with float textures"
        );
      }
      var mipimages = mipData.images;
      for (i = 0; i < 16; ++i) {
        if (mipimages[i]) {
          var mw = w >> i;
          var mh = h >> i;
          check(mipData.mipmask & 1 << i, "missing mipmap data");
          var img = mipimages[i];
          check(
            img.width === mw && img.height === mh,
            "invalid shape for mip images"
          );
          check(
            img.format === mipData.format && img.internalformat === mipData.internalformat && img.type === mipData.type,
            "incompatible type for mip image"
          );
          if (img.compressed)
            ;
          else if (img.data) {
            var rowSize = Math.ceil(pixelSize(img.type, c2) * mw / img.unpackAlignment) * img.unpackAlignment;
            check(
              img.data.byteLength === rowSize * mh,
              "invalid data for image, buffer size is inconsistent with image format"
            );
          } else if (img.element)
            ;
          else if (img.copy)
            ;
        } else if (!info.genMipmaps) {
          check((mipData.mipmask & 1 << i) === 0, "extra mipmap data");
        }
      }
      if (mipData.compressed) {
        check(
          !info.genMipmaps,
          "mipmap generation for compressed images not supported"
        );
      }
    }
    function checkTextureCube(texture, info, faces, limits) {
      var w = texture.width;
      var h = texture.height;
      var c2 = texture.channels;
      check(
        w > 0 && w <= limits.maxTextureSize && h > 0 && h <= limits.maxTextureSize,
        "invalid texture shape"
      );
      check(
        w === h,
        "cube map must be square"
      );
      check(
        info.wrapS === GL_CLAMP_TO_EDGE && info.wrapT === GL_CLAMP_TO_EDGE,
        "wrap mode not supported by cube map"
      );
      for (var i = 0; i < faces.length; ++i) {
        var face = faces[i];
        check(
          face.width === w && face.height === h,
          "inconsistent cube map face shape"
        );
        if (info.genMipmaps) {
          check(
            !face.compressed,
            "can not generate mipmap for compressed textures"
          );
          check(
            face.mipmask === 1,
            "can not specify mipmaps and generate mipmaps"
          );
        }
        var mipmaps = face.images;
        for (var j = 0; j < 16; ++j) {
          var img = mipmaps[j];
          if (img) {
            var mw = w >> j;
            var mh = h >> j;
            check(face.mipmask & 1 << j, "missing mipmap data");
            check(
              img.width === mw && img.height === mh,
              "invalid shape for mip images"
            );
            check(
              img.format === texture.format && img.internalformat === texture.internalformat && img.type === texture.type,
              "incompatible type for mip image"
            );
            if (img.compressed)
              ;
            else if (img.data) {
              check(
                img.data.byteLength === mw * mh * Math.max(pixelSize(img.type, c2), img.unpackAlignment),
                "invalid data for image, buffer size is inconsistent with image format"
              );
            } else if (img.element)
              ;
            else if (img.copy)
              ;
          }
        }
      }
    }
    var check$1 = extend2(check, {
      optional: checkOptional,
      raise: raise2,
      commandRaise,
      command: checkCommand,
      parameter: checkParameter,
      commandParameter: checkParameterCommand,
      constructor: checkConstructor,
      type: checkTypeOf,
      commandType: checkCommandType,
      isTypedArray: checkIsTypedArray,
      nni: checkNonNegativeInt,
      oneOf: checkOneOf,
      shaderError: checkShaderError,
      linkError: checkLinkError,
      callSite: guessCallSite,
      saveCommandRef,
      saveDrawInfo: saveDrawCommandInfo,
      framebufferFormat: checkFramebufferFormat,
      guessCommand,
      texture2D: checkTexture2D,
      textureCube: checkTextureCube
    });
    var VARIABLE_COUNTER = 0;
    var DYN_FUNC = 0;
    var DYN_CONSTANT = 5;
    var DYN_ARRAY = 6;
    function DynamicVariable(type, data) {
      this.id = VARIABLE_COUNTER++;
      this.type = type;
      this.data = data;
    }
    function escapeStr(str) {
      return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    }
    function splitParts(str) {
      if (str.length === 0) {
        return [];
      }
      var firstChar = str.charAt(0);
      var lastChar = str.charAt(str.length - 1);
      if (str.length > 1 && firstChar === lastChar && (firstChar === '"' || firstChar === "'")) {
        return ['"' + escapeStr(str.substr(1, str.length - 2)) + '"'];
      }
      var parts = /\[(false|true|null|\d+|'[^']*'|"[^"]*")\]/.exec(str);
      if (parts) {
        return splitParts(str.substr(0, parts.index)).concat(splitParts(parts[1])).concat(splitParts(str.substr(parts.index + parts[0].length)));
      }
      var subparts = str.split(".");
      if (subparts.length === 1) {
        return ['"' + escapeStr(str) + '"'];
      }
      var result = [];
      for (var i = 0; i < subparts.length; ++i) {
        result = result.concat(splitParts(subparts[i]));
      }
      return result;
    }
    function toAccessorString(str) {
      return "[" + splitParts(str).join("][") + "]";
    }
    function defineDynamic(type, data) {
      return new DynamicVariable(type, toAccessorString(data + ""));
    }
    function isDynamic(x) {
      return typeof x === "function" && !x._reglType || x instanceof DynamicVariable;
    }
    function unbox(x, path) {
      if (typeof x === "function") {
        return new DynamicVariable(DYN_FUNC, x);
      } else if (typeof x === "number" || typeof x === "boolean") {
        return new DynamicVariable(DYN_CONSTANT, x);
      } else if (Array.isArray(x)) {
        return new DynamicVariable(DYN_ARRAY, x.map(function(y, i) {
          return unbox(y, path + "[" + i + "]");
        }));
      } else if (x instanceof DynamicVariable) {
        return x;
      }
      check$1(false, "invalid option type in uniform " + path);
    }
    var dynamic = {
      DynamicVariable,
      define: defineDynamic,
      isDynamic,
      unbox,
      accessor: toAccessorString
    };
    var raf = {
      next: typeof requestAnimationFrame === "function" ? function(cb) {
        return requestAnimationFrame(cb);
      } : function(cb) {
        return setTimeout(cb, 16);
      },
      cancel: typeof cancelAnimationFrame === "function" ? function(raf2) {
        return cancelAnimationFrame(raf2);
      } : clearTimeout
    };
    var clock2 = typeof performance !== "undefined" && performance.now ? function() {
      return performance.now();
    } : function() {
      return +new Date();
    };
    function createStringStore() {
      var stringIds = { "": 0 };
      var stringValues = [""];
      return {
        id: function(str) {
          var result = stringIds[str];
          if (result) {
            return result;
          }
          result = stringIds[str] = stringValues.length;
          stringValues.push(str);
          return result;
        },
        str: function(id2) {
          return stringValues[id2];
        }
      };
    }
    function createCanvas(element, onDone, pixelRatio) {
      var canvas = document.createElement("canvas");
      extend2(canvas.style, {
        border: 0,
        margin: 0,
        padding: 0,
        top: 0,
        left: 0,
        width: "100%",
        height: "100%"
      });
      element.appendChild(canvas);
      if (element === document.body) {
        canvas.style.position = "absolute";
        extend2(element.style, {
          margin: 0,
          padding: 0
        });
      }
      function resize() {
        var w = window.innerWidth;
        var h = window.innerHeight;
        if (element !== document.body) {
          var bounds = canvas.getBoundingClientRect();
          w = bounds.right - bounds.left;
          h = bounds.bottom - bounds.top;
        }
        canvas.width = pixelRatio * w;
        canvas.height = pixelRatio * h;
      }
      var resizeObserver;
      if (element !== document.body && typeof ResizeObserver === "function") {
        resizeObserver = new ResizeObserver(function() {
          setTimeout(resize);
        });
        resizeObserver.observe(element);
      } else {
        window.addEventListener("resize", resize, false);
      }
      function onDestroy() {
        if (resizeObserver) {
          resizeObserver.disconnect();
        } else {
          window.removeEventListener("resize", resize);
        }
        element.removeChild(canvas);
      }
      resize();
      return {
        canvas,
        onDestroy
      };
    }
    function createContext(canvas, contextAttributes) {
      function get2(name) {
        try {
          return canvas.getContext(name, contextAttributes);
        } catch (e) {
          return null;
        }
      }
      return get2("webgl") || get2("experimental-webgl") || get2("webgl-experimental");
    }
    function isHTMLElement(obj) {
      return typeof obj.nodeName === "string" && typeof obj.appendChild === "function" && typeof obj.getBoundingClientRect === "function";
    }
    function isWebGLContext(obj) {
      return typeof obj.drawArrays === "function" || typeof obj.drawElements === "function";
    }
    function parseExtensions(input) {
      if (typeof input === "string") {
        return input.split();
      }
      check$1(Array.isArray(input), "invalid extension array");
      return input;
    }
    function getElement(desc) {
      if (typeof desc === "string") {
        check$1(typeof document !== "undefined", "not supported outside of DOM");
        return document.querySelector(desc);
      }
      return desc;
    }
    function parseArgs(args_) {
      var args = args_ || {};
      var element, container, canvas, gl;
      var contextAttributes = {};
      var extensions = [];
      var optionalExtensions = [];
      var pixelRatio = typeof window === "undefined" ? 1 : window.devicePixelRatio;
      var profile = false;
      var onDone = function(err) {
        if (err) {
          check$1.raise(err);
        }
      };
      var onDestroy = function() {
      };
      if (typeof args === "string") {
        check$1(
          typeof document !== "undefined",
          "selector queries only supported in DOM enviroments"
        );
        element = document.querySelector(args);
        check$1(element, "invalid query string for element");
      } else if (typeof args === "object") {
        if (isHTMLElement(args)) {
          element = args;
        } else if (isWebGLContext(args)) {
          gl = args;
          canvas = gl.canvas;
        } else {
          check$1.constructor(args);
          if ("gl" in args) {
            gl = args.gl;
          } else if ("canvas" in args) {
            canvas = getElement(args.canvas);
          } else if ("container" in args) {
            container = getElement(args.container);
          }
          if ("attributes" in args) {
            contextAttributes = args.attributes;
            check$1.type(contextAttributes, "object", "invalid context attributes");
          }
          if ("extensions" in args) {
            extensions = parseExtensions(args.extensions);
          }
          if ("optionalExtensions" in args) {
            optionalExtensions = parseExtensions(args.optionalExtensions);
          }
          if ("onDone" in args) {
            check$1.type(
              args.onDone,
              "function",
              "invalid or missing onDone callback"
            );
            onDone = args.onDone;
          }
          if ("profile" in args) {
            profile = !!args.profile;
          }
          if ("pixelRatio" in args) {
            pixelRatio = +args.pixelRatio;
            check$1(pixelRatio > 0, "invalid pixel ratio");
          }
        }
      } else {
        check$1.raise("invalid arguments to regl");
      }
      if (element) {
        if (element.nodeName.toLowerCase() === "canvas") {
          canvas = element;
        } else {
          container = element;
        }
      }
      if (!gl) {
        if (!canvas) {
          check$1(
            typeof document !== "undefined",
            "must manually specify webgl context outside of DOM environments"
          );
          var result = createCanvas(container || document.body, onDone, pixelRatio);
          if (!result) {
            return null;
          }
          canvas = result.canvas;
          onDestroy = result.onDestroy;
        }
        if (contextAttributes.premultipliedAlpha === void 0)
          contextAttributes.premultipliedAlpha = true;
        gl = createContext(canvas, contextAttributes);
      }
      if (!gl) {
        onDestroy();
        onDone("webgl not supported, try upgrading your browser or graphics drivers http://get.webgl.org");
        return null;
      }
      return {
        gl,
        canvas,
        container,
        extensions,
        optionalExtensions,
        pixelRatio,
        profile,
        onDone,
        onDestroy
      };
    }
    function createExtensionCache(gl, config) {
      var extensions = {};
      function tryLoadExtension(name_) {
        check$1.type(name_, "string", "extension name must be string");
        var name2 = name_.toLowerCase();
        var ext;
        try {
          ext = extensions[name2] = gl.getExtension(name2);
        } catch (e) {
        }
        return !!ext;
      }
      for (var i = 0; i < config.extensions.length; ++i) {
        var name = config.extensions[i];
        if (!tryLoadExtension(name)) {
          config.onDestroy();
          config.onDone('"' + name + '" extension is not supported by the current WebGL context, try upgrading your system or a different browser');
          return null;
        }
      }
      config.optionalExtensions.forEach(tryLoadExtension);
      return {
        extensions,
        restore: function() {
          Object.keys(extensions).forEach(function(name2) {
            if (extensions[name2] && !tryLoadExtension(name2)) {
              throw new Error("(regl): error restoring extension " + name2);
            }
          });
        }
      };
    }
    function loop(n, f) {
      var result = Array(n);
      for (var i = 0; i < n; ++i) {
        result[i] = f(i);
      }
      return result;
    }
    var GL_BYTE$1 = 5120;
    var GL_UNSIGNED_BYTE$2 = 5121;
    var GL_SHORT$1 = 5122;
    var GL_UNSIGNED_SHORT$1 = 5123;
    var GL_INT$1 = 5124;
    var GL_UNSIGNED_INT$1 = 5125;
    var GL_FLOAT$2 = 5126;
    function nextPow16(v) {
      for (var i = 16; i <= 1 << 28; i *= 16) {
        if (v <= i) {
          return i;
        }
      }
      return 0;
    }
    function log2(v) {
      var r, shift;
      r = (v > 65535) << 4;
      v >>>= r;
      shift = (v > 255) << 3;
      v >>>= shift;
      r |= shift;
      shift = (v > 15) << 2;
      v >>>= shift;
      r |= shift;
      shift = (v > 3) << 1;
      v >>>= shift;
      r |= shift;
      return r | v >> 1;
    }
    function createPool() {
      var bufferPool = loop(8, function() {
        return [];
      });
      function alloc(n) {
        var sz = nextPow16(n);
        var bin = bufferPool[log2(sz) >> 2];
        if (bin.length > 0) {
          return bin.pop();
        }
        return new ArrayBuffer(sz);
      }
      function free(buf) {
        bufferPool[log2(buf.byteLength) >> 2].push(buf);
      }
      function allocType(type, n) {
        var result = null;
        switch (type) {
          case GL_BYTE$1:
            result = new Int8Array(alloc(n), 0, n);
            break;
          case GL_UNSIGNED_BYTE$2:
            result = new Uint8Array(alloc(n), 0, n);
            break;
          case GL_SHORT$1:
            result = new Int16Array(alloc(2 * n), 0, n);
            break;
          case GL_UNSIGNED_SHORT$1:
            result = new Uint16Array(alloc(2 * n), 0, n);
            break;
          case GL_INT$1:
            result = new Int32Array(alloc(4 * n), 0, n);
            break;
          case GL_UNSIGNED_INT$1:
            result = new Uint32Array(alloc(4 * n), 0, n);
            break;
          case GL_FLOAT$2:
            result = new Float32Array(alloc(4 * n), 0, n);
            break;
          default:
            return null;
        }
        if (result.length !== n) {
          return result.subarray(0, n);
        }
        return result;
      }
      function freeType(array2) {
        free(array2.buffer);
      }
      return {
        alloc,
        free,
        allocType,
        freeType
      };
    }
    var pool = createPool();
    pool.zero = createPool();
    var GL_SUBPIXEL_BITS = 3408;
    var GL_RED_BITS = 3410;
    var GL_GREEN_BITS = 3411;
    var GL_BLUE_BITS = 3412;
    var GL_ALPHA_BITS = 3413;
    var GL_DEPTH_BITS = 3414;
    var GL_STENCIL_BITS = 3415;
    var GL_ALIASED_POINT_SIZE_RANGE = 33901;
    var GL_ALIASED_LINE_WIDTH_RANGE = 33902;
    var GL_MAX_TEXTURE_SIZE = 3379;
    var GL_MAX_VIEWPORT_DIMS = 3386;
    var GL_MAX_VERTEX_ATTRIBS = 34921;
    var GL_MAX_VERTEX_UNIFORM_VECTORS = 36347;
    var GL_MAX_VARYING_VECTORS = 36348;
    var GL_MAX_COMBINED_TEXTURE_IMAGE_UNITS = 35661;
    var GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS = 35660;
    var GL_MAX_TEXTURE_IMAGE_UNITS = 34930;
    var GL_MAX_FRAGMENT_UNIFORM_VECTORS = 36349;
    var GL_MAX_CUBE_MAP_TEXTURE_SIZE = 34076;
    var GL_MAX_RENDERBUFFER_SIZE = 34024;
    var GL_VENDOR = 7936;
    var GL_RENDERER = 7937;
    var GL_VERSION = 7938;
    var GL_SHADING_LANGUAGE_VERSION = 35724;
    var GL_MAX_TEXTURE_MAX_ANISOTROPY_EXT = 34047;
    var GL_MAX_COLOR_ATTACHMENTS_WEBGL = 36063;
    var GL_MAX_DRAW_BUFFERS_WEBGL = 34852;
    var GL_TEXTURE_2D = 3553;
    var GL_TEXTURE_CUBE_MAP = 34067;
    var GL_TEXTURE_CUBE_MAP_POSITIVE_X = 34069;
    var GL_TEXTURE0 = 33984;
    var GL_RGBA = 6408;
    var GL_FLOAT$1 = 5126;
    var GL_UNSIGNED_BYTE$1 = 5121;
    var GL_FRAMEBUFFER = 36160;
    var GL_FRAMEBUFFER_COMPLETE = 36053;
    var GL_COLOR_ATTACHMENT0 = 36064;
    var GL_COLOR_BUFFER_BIT$1 = 16384;
    var wrapLimits = function(gl, extensions) {
      var maxAnisotropic = 1;
      if (extensions.ext_texture_filter_anisotropic) {
        maxAnisotropic = gl.getParameter(GL_MAX_TEXTURE_MAX_ANISOTROPY_EXT);
      }
      var maxDrawbuffers = 1;
      var maxColorAttachments = 1;
      if (extensions.webgl_draw_buffers) {
        maxDrawbuffers = gl.getParameter(GL_MAX_DRAW_BUFFERS_WEBGL);
        maxColorAttachments = gl.getParameter(GL_MAX_COLOR_ATTACHMENTS_WEBGL);
      }
      var readFloat = !!extensions.oes_texture_float;
      if (readFloat) {
        var readFloatTexture = gl.createTexture();
        gl.bindTexture(GL_TEXTURE_2D, readFloatTexture);
        gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, 1, 1, 0, GL_RGBA, GL_FLOAT$1, null);
        var fbo = gl.createFramebuffer();
        gl.bindFramebuffer(GL_FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, readFloatTexture, 0);
        gl.bindTexture(GL_TEXTURE_2D, null);
        if (gl.checkFramebufferStatus(GL_FRAMEBUFFER) !== GL_FRAMEBUFFER_COMPLETE)
          readFloat = false;
        else {
          gl.viewport(0, 0, 1, 1);
          gl.clearColor(1, 0, 0, 1);
          gl.clear(GL_COLOR_BUFFER_BIT$1);
          var pixels = pool.allocType(GL_FLOAT$1, 4);
          gl.readPixels(0, 0, 1, 1, GL_RGBA, GL_FLOAT$1, pixels);
          if (gl.getError())
            readFloat = false;
          else {
            gl.deleteFramebuffer(fbo);
            gl.deleteTexture(readFloatTexture);
            readFloat = pixels[0] === 1;
          }
          pool.freeType(pixels);
        }
      }
      var isIE = typeof navigator !== "undefined" && (/MSIE/.test(navigator.userAgent) || /Trident\//.test(navigator.appVersion) || /Edge/.test(navigator.userAgent));
      var npotTextureCube = true;
      if (!isIE) {
        var cubeTexture = gl.createTexture();
        var data = pool.allocType(GL_UNSIGNED_BYTE$1, 36);
        gl.activeTexture(GL_TEXTURE0);
        gl.bindTexture(GL_TEXTURE_CUBE_MAP, cubeTexture);
        gl.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X, 0, GL_RGBA, 3, 3, 0, GL_RGBA, GL_UNSIGNED_BYTE$1, data);
        pool.freeType(data);
        gl.bindTexture(GL_TEXTURE_CUBE_MAP, null);
        gl.deleteTexture(cubeTexture);
        npotTextureCube = !gl.getError();
      }
      return {
        // drawing buffer bit depth
        colorBits: [
          gl.getParameter(GL_RED_BITS),
          gl.getParameter(GL_GREEN_BITS),
          gl.getParameter(GL_BLUE_BITS),
          gl.getParameter(GL_ALPHA_BITS)
        ],
        depthBits: gl.getParameter(GL_DEPTH_BITS),
        stencilBits: gl.getParameter(GL_STENCIL_BITS),
        subpixelBits: gl.getParameter(GL_SUBPIXEL_BITS),
        // supported extensions
        extensions: Object.keys(extensions).filter(function(ext) {
          return !!extensions[ext];
        }),
        // max aniso samples
        maxAnisotropic,
        // max draw buffers
        maxDrawbuffers,
        maxColorAttachments,
        // point and line size ranges
        pointSizeDims: gl.getParameter(GL_ALIASED_POINT_SIZE_RANGE),
        lineWidthDims: gl.getParameter(GL_ALIASED_LINE_WIDTH_RANGE),
        maxViewportDims: gl.getParameter(GL_MAX_VIEWPORT_DIMS),
        maxCombinedTextureUnits: gl.getParameter(GL_MAX_COMBINED_TEXTURE_IMAGE_UNITS),
        maxCubeMapSize: gl.getParameter(GL_MAX_CUBE_MAP_TEXTURE_SIZE),
        maxRenderbufferSize: gl.getParameter(GL_MAX_RENDERBUFFER_SIZE),
        maxTextureUnits: gl.getParameter(GL_MAX_TEXTURE_IMAGE_UNITS),
        maxTextureSize: gl.getParameter(GL_MAX_TEXTURE_SIZE),
        maxAttributes: gl.getParameter(GL_MAX_VERTEX_ATTRIBS),
        maxVertexUniforms: gl.getParameter(GL_MAX_VERTEX_UNIFORM_VECTORS),
        maxVertexTextureUnits: gl.getParameter(GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS),
        maxVaryingVectors: gl.getParameter(GL_MAX_VARYING_VECTORS),
        maxFragmentUniforms: gl.getParameter(GL_MAX_FRAGMENT_UNIFORM_VECTORS),
        // vendor info
        glsl: gl.getParameter(GL_SHADING_LANGUAGE_VERSION),
        renderer: gl.getParameter(GL_RENDERER),
        vendor: gl.getParameter(GL_VENDOR),
        version: gl.getParameter(GL_VERSION),
        // quirks
        readFloat,
        npotTextureCube
      };
    };
    function isNDArrayLike(obj) {
      return !!obj && typeof obj === "object" && Array.isArray(obj.shape) && Array.isArray(obj.stride) && typeof obj.offset === "number" && obj.shape.length === obj.stride.length && (Array.isArray(obj.data) || isTypedArray(obj.data));
    }
    var values = function(obj) {
      return Object.keys(obj).map(function(key) {
        return obj[key];
      });
    };
    var flattenUtils = {
      shape: arrayShape$1,
      flatten: flattenArray
    };
    function flatten1D(array2, nx, out) {
      for (var i = 0; i < nx; ++i) {
        out[i] = array2[i];
      }
    }
    function flatten2D(array2, nx, ny, out) {
      var ptr = 0;
      for (var i = 0; i < nx; ++i) {
        var row = array2[i];
        for (var j = 0; j < ny; ++j) {
          out[ptr++] = row[j];
        }
      }
    }
    function flatten3D(array2, nx, ny, nz, out, ptr_) {
      var ptr = ptr_;
      for (var i = 0; i < nx; ++i) {
        var row = array2[i];
        for (var j = 0; j < ny; ++j) {
          var col = row[j];
          for (var k = 0; k < nz; ++k) {
            out[ptr++] = col[k];
          }
        }
      }
    }
    function flattenRec(array2, shape, level, out, ptr) {
      var stride = 1;
      for (var i = level + 1; i < shape.length; ++i) {
        stride *= shape[i];
      }
      var n = shape[level];
      if (shape.length - level === 4) {
        var nx = shape[level + 1];
        var ny = shape[level + 2];
        var nz = shape[level + 3];
        for (i = 0; i < n; ++i) {
          flatten3D(array2[i], nx, ny, nz, out, ptr);
          ptr += stride;
        }
      } else {
        for (i = 0; i < n; ++i) {
          flattenRec(array2[i], shape, level + 1, out, ptr);
          ptr += stride;
        }
      }
    }
    function flattenArray(array2, shape, type, out_) {
      var sz = 1;
      if (shape.length) {
        for (var i = 0; i < shape.length; ++i) {
          sz *= shape[i];
        }
      } else {
        sz = 0;
      }
      var out = out_ || pool.allocType(type, sz);
      switch (shape.length) {
        case 0:
          break;
        case 1:
          flatten1D(array2, shape[0], out);
          break;
        case 2:
          flatten2D(array2, shape[0], shape[1], out);
          break;
        case 3:
          flatten3D(array2, shape[0], shape[1], shape[2], out, 0);
          break;
        default:
          flattenRec(array2, shape, 0, out, 0);
      }
      return out;
    }
    function arrayShape$1(array_) {
      var shape = [];
      for (var array2 = array_; array2.length; array2 = array2[0]) {
        shape.push(array2.length);
      }
      return shape;
    }
    var arrayTypes = {
      "[object Int8Array]": 5120,
      "[object Int16Array]": 5122,
      "[object Int32Array]": 5124,
      "[object Uint8Array]": 5121,
      "[object Uint8ClampedArray]": 5121,
      "[object Uint16Array]": 5123,
      "[object Uint32Array]": 5125,
      "[object Float32Array]": 5126,
      "[object Float64Array]": 5121,
      "[object ArrayBuffer]": 5121
    };
    var int8 = 5120;
    var int16 = 5122;
    var int32 = 5124;
    var uint8 = 5121;
    var uint16 = 5123;
    var uint32 = 5125;
    var float = 5126;
    var float32 = 5126;
    var glTypes = {
      int8,
      int16,
      int32,
      uint8,
      uint16,
      uint32,
      float,
      float32
    };
    var dynamic$1 = 35048;
    var stream = 35040;
    var usageTypes = {
      dynamic: dynamic$1,
      stream,
      "static": 35044
    };
    var arrayFlatten = flattenUtils.flatten;
    var arrayShape = flattenUtils.shape;
    var GL_STATIC_DRAW = 35044;
    var GL_STREAM_DRAW = 35040;
    var GL_UNSIGNED_BYTE$3 = 5121;
    var GL_FLOAT$3 = 5126;
    var DTYPES_SIZES = [];
    DTYPES_SIZES[5120] = 1;
    DTYPES_SIZES[5122] = 2;
    DTYPES_SIZES[5124] = 4;
    DTYPES_SIZES[5121] = 1;
    DTYPES_SIZES[5123] = 2;
    DTYPES_SIZES[5125] = 4;
    DTYPES_SIZES[5126] = 4;
    function typedArrayCode(data) {
      return arrayTypes[Object.prototype.toString.call(data)] | 0;
    }
    function copyArray(out, inp) {
      for (var i = 0; i < inp.length; ++i) {
        out[i] = inp[i];
      }
    }
    function transpose(result, data, shapeX, shapeY, strideX, strideY, offset) {
      var ptr = 0;
      for (var i = 0; i < shapeX; ++i) {
        for (var j = 0; j < shapeY; ++j) {
          result[ptr++] = data[strideX * i + strideY * j + offset];
        }
      }
    }
    function wrapBufferState(gl, stats2, config, destroyBuffer) {
      var bufferCount = 0;
      var bufferSet = {};
      function REGLBuffer(type) {
        this.id = bufferCount++;
        this.buffer = gl.createBuffer();
        this.type = type;
        this.usage = GL_STATIC_DRAW;
        this.byteLength = 0;
        this.dimension = 1;
        this.dtype = GL_UNSIGNED_BYTE$3;
        this.persistentData = null;
        if (config.profile) {
          this.stats = { size: 0 };
        }
      }
      REGLBuffer.prototype.bind = function() {
        gl.bindBuffer(this.type, this.buffer);
      };
      REGLBuffer.prototype.destroy = function() {
        destroy(this);
      };
      var streamPool = [];
      function createStream(type, data) {
        var buffer = streamPool.pop();
        if (!buffer) {
          buffer = new REGLBuffer(type);
        }
        buffer.bind();
        initBufferFromData(buffer, data, GL_STREAM_DRAW, 0, 1, false);
        return buffer;
      }
      function destroyStream(stream$$1) {
        streamPool.push(stream$$1);
      }
      function initBufferFromTypedArray(buffer, data, usage) {
        buffer.byteLength = data.byteLength;
        gl.bufferData(buffer.type, data, usage);
      }
      function initBufferFromData(buffer, data, usage, dtype, dimension, persist) {
        var shape;
        buffer.usage = usage;
        if (Array.isArray(data)) {
          buffer.dtype = dtype || GL_FLOAT$3;
          if (data.length > 0) {
            var flatData;
            if (Array.isArray(data[0])) {
              shape = arrayShape(data);
              var dim = 1;
              for (var i = 1; i < shape.length; ++i) {
                dim *= shape[i];
              }
              buffer.dimension = dim;
              flatData = arrayFlatten(data, shape, buffer.dtype);
              initBufferFromTypedArray(buffer, flatData, usage);
              if (persist) {
                buffer.persistentData = flatData;
              } else {
                pool.freeType(flatData);
              }
            } else if (typeof data[0] === "number") {
              buffer.dimension = dimension;
              var typedData = pool.allocType(buffer.dtype, data.length);
              copyArray(typedData, data);
              initBufferFromTypedArray(buffer, typedData, usage);
              if (persist) {
                buffer.persistentData = typedData;
              } else {
                pool.freeType(typedData);
              }
            } else if (isTypedArray(data[0])) {
              buffer.dimension = data[0].length;
              buffer.dtype = dtype || typedArrayCode(data[0]) || GL_FLOAT$3;
              flatData = arrayFlatten(
                data,
                [data.length, data[0].length],
                buffer.dtype
              );
              initBufferFromTypedArray(buffer, flatData, usage);
              if (persist) {
                buffer.persistentData = flatData;
              } else {
                pool.freeType(flatData);
              }
            } else {
              check$1.raise("invalid buffer data");
            }
          }
        } else if (isTypedArray(data)) {
          buffer.dtype = dtype || typedArrayCode(data);
          buffer.dimension = dimension;
          initBufferFromTypedArray(buffer, data, usage);
          if (persist) {
            buffer.persistentData = new Uint8Array(new Uint8Array(data.buffer));
          }
        } else if (isNDArrayLike(data)) {
          shape = data.shape;
          var stride = data.stride;
          var offset = data.offset;
          var shapeX = 0;
          var shapeY = 0;
          var strideX = 0;
          var strideY = 0;
          if (shape.length === 1) {
            shapeX = shape[0];
            shapeY = 1;
            strideX = stride[0];
            strideY = 0;
          } else if (shape.length === 2) {
            shapeX = shape[0];
            shapeY = shape[1];
            strideX = stride[0];
            strideY = stride[1];
          } else {
            check$1.raise("invalid shape");
          }
          buffer.dtype = dtype || typedArrayCode(data.data) || GL_FLOAT$3;
          buffer.dimension = shapeY;
          var transposeData2 = pool.allocType(buffer.dtype, shapeX * shapeY);
          transpose(
            transposeData2,
            data.data,
            shapeX,
            shapeY,
            strideX,
            strideY,
            offset
          );
          initBufferFromTypedArray(buffer, transposeData2, usage);
          if (persist) {
            buffer.persistentData = transposeData2;
          } else {
            pool.freeType(transposeData2);
          }
        } else if (data instanceof ArrayBuffer) {
          buffer.dtype = GL_UNSIGNED_BYTE$3;
          buffer.dimension = dimension;
          initBufferFromTypedArray(buffer, data, usage);
          if (persist) {
            buffer.persistentData = new Uint8Array(new Uint8Array(data));
          }
        } else {
          check$1.raise("invalid buffer data");
        }
      }
      function destroy(buffer) {
        stats2.bufferCount--;
        destroyBuffer(buffer);
        var handle = buffer.buffer;
        check$1(handle, "buffer must not be deleted already");
        gl.deleteBuffer(handle);
        buffer.buffer = null;
        delete bufferSet[buffer.id];
      }
      function createBuffer(options, type, deferInit, persistent) {
        stats2.bufferCount++;
        var buffer = new REGLBuffer(type);
        bufferSet[buffer.id] = buffer;
        function reglBuffer(options2) {
          var usage = GL_STATIC_DRAW;
          var data = null;
          var byteLength = 0;
          var dtype = 0;
          var dimension = 1;
          if (Array.isArray(options2) || isTypedArray(options2) || isNDArrayLike(options2) || options2 instanceof ArrayBuffer) {
            data = options2;
          } else if (typeof options2 === "number") {
            byteLength = options2 | 0;
          } else if (options2) {
            check$1.type(
              options2,
              "object",
              "buffer arguments must be an object, a number or an array"
            );
            if ("data" in options2) {
              check$1(
                data === null || Array.isArray(data) || isTypedArray(data) || isNDArrayLike(data),
                "invalid data for buffer"
              );
              data = options2.data;
            }
            if ("usage" in options2) {
              check$1.parameter(options2.usage, usageTypes, "invalid buffer usage");
              usage = usageTypes[options2.usage];
            }
            if ("type" in options2) {
              check$1.parameter(options2.type, glTypes, "invalid buffer type");
              dtype = glTypes[options2.type];
            }
            if ("dimension" in options2) {
              check$1.type(options2.dimension, "number", "invalid dimension");
              dimension = options2.dimension | 0;
            }
            if ("length" in options2) {
              check$1.nni(byteLength, "buffer length must be a nonnegative integer");
              byteLength = options2.length | 0;
            }
          }
          buffer.bind();
          if (!data) {
            if (byteLength)
              gl.bufferData(buffer.type, byteLength, usage);
            buffer.dtype = dtype || GL_UNSIGNED_BYTE$3;
            buffer.usage = usage;
            buffer.dimension = dimension;
            buffer.byteLength = byteLength;
          } else {
            initBufferFromData(buffer, data, usage, dtype, dimension, persistent);
          }
          if (config.profile) {
            buffer.stats.size = buffer.byteLength * DTYPES_SIZES[buffer.dtype];
          }
          return reglBuffer;
        }
        function setSubData(data, offset) {
          check$1(
            offset + data.byteLength <= buffer.byteLength,
            "invalid buffer subdata call, buffer is too small.  Can't write data of size " + data.byteLength + " starting from offset " + offset + " to a buffer of size " + buffer.byteLength
          );
          gl.bufferSubData(buffer.type, offset, data);
        }
        function subdata(data, offset_) {
          var offset = (offset_ || 0) | 0;
          var shape;
          buffer.bind();
          if (isTypedArray(data) || data instanceof ArrayBuffer) {
            setSubData(data, offset);
          } else if (Array.isArray(data)) {
            if (data.length > 0) {
              if (typeof data[0] === "number") {
                var converted = pool.allocType(buffer.dtype, data.length);
                copyArray(converted, data);
                setSubData(converted, offset);
                pool.freeType(converted);
              } else if (Array.isArray(data[0]) || isTypedArray(data[0])) {
                shape = arrayShape(data);
                var flatData = arrayFlatten(data, shape, buffer.dtype);
                setSubData(flatData, offset);
                pool.freeType(flatData);
              } else {
                check$1.raise("invalid buffer data");
              }
            }
          } else if (isNDArrayLike(data)) {
            shape = data.shape;
            var stride = data.stride;
            var shapeX = 0;
            var shapeY = 0;
            var strideX = 0;
            var strideY = 0;
            if (shape.length === 1) {
              shapeX = shape[0];
              shapeY = 1;
              strideX = stride[0];
              strideY = 0;
            } else if (shape.length === 2) {
              shapeX = shape[0];
              shapeY = shape[1];
              strideX = stride[0];
              strideY = stride[1];
            } else {
              check$1.raise("invalid shape");
            }
            var dtype = Array.isArray(data.data) ? buffer.dtype : typedArrayCode(data.data);
            var transposeData2 = pool.allocType(dtype, shapeX * shapeY);
            transpose(
              transposeData2,
              data.data,
              shapeX,
              shapeY,
              strideX,
              strideY,
              data.offset
            );
            setSubData(transposeData2, offset);
            pool.freeType(transposeData2);
          } else {
            check$1.raise("invalid data for buffer subdata");
          }
          return reglBuffer;
        }
        if (!deferInit) {
          reglBuffer(options);
        }
        reglBuffer._reglType = "buffer";
        reglBuffer._buffer = buffer;
        reglBuffer.subdata = subdata;
        if (config.profile) {
          reglBuffer.stats = buffer.stats;
        }
        reglBuffer.destroy = function() {
          destroy(buffer);
        };
        return reglBuffer;
      }
      function restoreBuffers() {
        values(bufferSet).forEach(function(buffer) {
          buffer.buffer = gl.createBuffer();
          gl.bindBuffer(buffer.type, buffer.buffer);
          gl.bufferData(
            buffer.type,
            buffer.persistentData || buffer.byteLength,
            buffer.usage
          );
        });
      }
      if (config.profile) {
        stats2.getTotalBufferSize = function() {
          var total = 0;
          Object.keys(bufferSet).forEach(function(key) {
            total += bufferSet[key].stats.size;
          });
          return total;
        };
      }
      return {
        create: createBuffer,
        createStream,
        destroyStream,
        clear: function() {
          values(bufferSet).forEach(destroy);
          streamPool.forEach(destroy);
        },
        getBuffer: function(wrapper) {
          if (wrapper && wrapper._buffer instanceof REGLBuffer) {
            return wrapper._buffer;
          }
          return null;
        },
        restore: restoreBuffers,
        _initBuffer: initBufferFromData
      };
    }
    var points = 0;
    var point = 0;
    var lines = 1;
    var line = 1;
    var triangles = 4;
    var triangle = 4;
    var primTypes = {
      points,
      point,
      lines,
      line,
      triangles,
      triangle,
      "line loop": 2,
      "line strip": 3,
      "triangle strip": 5,
      "triangle fan": 6
    };
    var GL_POINTS = 0;
    var GL_LINES = 1;
    var GL_TRIANGLES = 4;
    var GL_BYTE$2 = 5120;
    var GL_UNSIGNED_BYTE$4 = 5121;
    var GL_SHORT$2 = 5122;
    var GL_UNSIGNED_SHORT$2 = 5123;
    var GL_INT$2 = 5124;
    var GL_UNSIGNED_INT$2 = 5125;
    var GL_ELEMENT_ARRAY_BUFFER = 34963;
    var GL_STREAM_DRAW$1 = 35040;
    var GL_STATIC_DRAW$1 = 35044;
    function wrapElementsState(gl, extensions, bufferState, stats2) {
      var elementSet = {};
      var elementCount = 0;
      var elementTypes = {
        "uint8": GL_UNSIGNED_BYTE$4,
        "uint16": GL_UNSIGNED_SHORT$2
      };
      if (extensions.oes_element_index_uint) {
        elementTypes.uint32 = GL_UNSIGNED_INT$2;
      }
      function REGLElementBuffer(buffer) {
        this.id = elementCount++;
        elementSet[this.id] = this;
        this.buffer = buffer;
        this.primType = GL_TRIANGLES;
        this.vertCount = 0;
        this.type = 0;
      }
      REGLElementBuffer.prototype.bind = function() {
        this.buffer.bind();
      };
      var bufferPool = [];
      function createElementStream(data) {
        var result = bufferPool.pop();
        if (!result) {
          result = new REGLElementBuffer(bufferState.create(
            null,
            GL_ELEMENT_ARRAY_BUFFER,
            true,
            false
          )._buffer);
        }
        initElements(result, data, GL_STREAM_DRAW$1, -1, -1, 0, 0);
        return result;
      }
      function destroyElementStream(elements) {
        bufferPool.push(elements);
      }
      function initElements(elements, data, usage, prim, count, byteLength, type) {
        elements.buffer.bind();
        var dtype;
        if (data) {
          var predictedType = type;
          if (!type && (!isTypedArray(data) || isNDArrayLike(data) && !isTypedArray(data.data))) {
            predictedType = extensions.oes_element_index_uint ? GL_UNSIGNED_INT$2 : GL_UNSIGNED_SHORT$2;
          }
          bufferState._initBuffer(
            elements.buffer,
            data,
            usage,
            predictedType,
            3
          );
        } else {
          gl.bufferData(GL_ELEMENT_ARRAY_BUFFER, byteLength, usage);
          elements.buffer.dtype = dtype || GL_UNSIGNED_BYTE$4;
          elements.buffer.usage = usage;
          elements.buffer.dimension = 3;
          elements.buffer.byteLength = byteLength;
        }
        dtype = type;
        if (!type) {
          switch (elements.buffer.dtype) {
            case GL_UNSIGNED_BYTE$4:
            case GL_BYTE$2:
              dtype = GL_UNSIGNED_BYTE$4;
              break;
            case GL_UNSIGNED_SHORT$2:
            case GL_SHORT$2:
              dtype = GL_UNSIGNED_SHORT$2;
              break;
            case GL_UNSIGNED_INT$2:
            case GL_INT$2:
              dtype = GL_UNSIGNED_INT$2;
              break;
            default:
              check$1.raise("unsupported type for element array");
          }
          elements.buffer.dtype = dtype;
        }
        elements.type = dtype;
        check$1(
          dtype !== GL_UNSIGNED_INT$2 || !!extensions.oes_element_index_uint,
          "32 bit element buffers not supported, enable oes_element_index_uint first"
        );
        var vertCount = count;
        if (vertCount < 0) {
          vertCount = elements.buffer.byteLength;
          if (dtype === GL_UNSIGNED_SHORT$2) {
            vertCount >>= 1;
          } else if (dtype === GL_UNSIGNED_INT$2) {
            vertCount >>= 2;
          }
        }
        elements.vertCount = vertCount;
        var primType = prim;
        if (prim < 0) {
          primType = GL_TRIANGLES;
          var dimension = elements.buffer.dimension;
          if (dimension === 1)
            primType = GL_POINTS;
          if (dimension === 2)
            primType = GL_LINES;
          if (dimension === 3)
            primType = GL_TRIANGLES;
        }
        elements.primType = primType;
      }
      function destroyElements(elements) {
        stats2.elementsCount--;
        check$1(elements.buffer !== null, "must not double destroy elements");
        delete elementSet[elements.id];
        elements.buffer.destroy();
        elements.buffer = null;
      }
      function createElements(options, persistent) {
        var buffer = bufferState.create(null, GL_ELEMENT_ARRAY_BUFFER, true);
        var elements = new REGLElementBuffer(buffer._buffer);
        stats2.elementsCount++;
        function reglElements(options2) {
          if (!options2) {
            buffer();
            elements.primType = GL_TRIANGLES;
            elements.vertCount = 0;
            elements.type = GL_UNSIGNED_BYTE$4;
          } else if (typeof options2 === "number") {
            buffer(options2);
            elements.primType = GL_TRIANGLES;
            elements.vertCount = options2 | 0;
            elements.type = GL_UNSIGNED_BYTE$4;
          } else {
            var data = null;
            var usage = GL_STATIC_DRAW$1;
            var primType = -1;
            var vertCount = -1;
            var byteLength = 0;
            var dtype = 0;
            if (Array.isArray(options2) || isTypedArray(options2) || isNDArrayLike(options2)) {
              data = options2;
            } else {
              check$1.type(options2, "object", "invalid arguments for elements");
              if ("data" in options2) {
                data = options2.data;
                check$1(
                  Array.isArray(data) || isTypedArray(data) || isNDArrayLike(data),
                  "invalid data for element buffer"
                );
              }
              if ("usage" in options2) {
                check$1.parameter(
                  options2.usage,
                  usageTypes,
                  "invalid element buffer usage"
                );
                usage = usageTypes[options2.usage];
              }
              if ("primitive" in options2) {
                check$1.parameter(
                  options2.primitive,
                  primTypes,
                  "invalid element buffer primitive"
                );
                primType = primTypes[options2.primitive];
              }
              if ("count" in options2) {
                check$1(
                  typeof options2.count === "number" && options2.count >= 0,
                  "invalid vertex count for elements"
                );
                vertCount = options2.count | 0;
              }
              if ("type" in options2) {
                check$1.parameter(
                  options2.type,
                  elementTypes,
                  "invalid buffer type"
                );
                dtype = elementTypes[options2.type];
              }
              if ("length" in options2) {
                byteLength = options2.length | 0;
              } else {
                byteLength = vertCount;
                if (dtype === GL_UNSIGNED_SHORT$2 || dtype === GL_SHORT$2) {
                  byteLength *= 2;
                } else if (dtype === GL_UNSIGNED_INT$2 || dtype === GL_INT$2) {
                  byteLength *= 4;
                }
              }
            }
            initElements(
              elements,
              data,
              usage,
              primType,
              vertCount,
              byteLength,
              dtype
            );
          }
          return reglElements;
        }
        reglElements(options);
        reglElements._reglType = "elements";
        reglElements._elements = elements;
        reglElements.subdata = function(data, offset) {
          buffer.subdata(data, offset);
          return reglElements;
        };
        reglElements.destroy = function() {
          destroyElements(elements);
        };
        return reglElements;
      }
      return {
        create: createElements,
        createStream: createElementStream,
        destroyStream: destroyElementStream,
        getElements: function(elements) {
          if (typeof elements === "function" && elements._elements instanceof REGLElementBuffer) {
            return elements._elements;
          }
          return null;
        },
        clear: function() {
          values(elementSet).forEach(destroyElements);
        }
      };
    }
    var FLOAT = new Float32Array(1);
    var INT = new Uint32Array(FLOAT.buffer);
    var GL_UNSIGNED_SHORT$4 = 5123;
    function convertToHalfFloat(array2) {
      var ushorts = pool.allocType(GL_UNSIGNED_SHORT$4, array2.length);
      for (var i = 0; i < array2.length; ++i) {
        if (isNaN(array2[i])) {
          ushorts[i] = 65535;
        } else if (array2[i] === Infinity) {
          ushorts[i] = 31744;
        } else if (array2[i] === -Infinity) {
          ushorts[i] = 64512;
        } else {
          FLOAT[0] = array2[i];
          var x = INT[0];
          var sgn = x >>> 31 << 15;
          var exp = (x << 1 >>> 24) - 127;
          var frac = x >> 13 & (1 << 10) - 1;
          if (exp < -24) {
            ushorts[i] = sgn;
          } else if (exp < -14) {
            var s = -14 - exp;
            ushorts[i] = sgn + (frac + (1 << 10) >> s);
          } else if (exp > 15) {
            ushorts[i] = sgn + 31744;
          } else {
            ushorts[i] = sgn + (exp + 15 << 10) + frac;
          }
        }
      }
      return ushorts;
    }
    function isArrayLike(s) {
      return Array.isArray(s) || isTypedArray(s);
    }
    var isPow2$1 = function(v) {
      return !(v & v - 1) && !!v;
    };
    var GL_COMPRESSED_TEXTURE_FORMATS = 34467;
    var GL_TEXTURE_2D$1 = 3553;
    var GL_TEXTURE_CUBE_MAP$1 = 34067;
    var GL_TEXTURE_CUBE_MAP_POSITIVE_X$1 = 34069;
    var GL_RGBA$1 = 6408;
    var GL_ALPHA = 6406;
    var GL_RGB = 6407;
    var GL_LUMINANCE = 6409;
    var GL_LUMINANCE_ALPHA = 6410;
    var GL_RGBA4 = 32854;
    var GL_RGB5_A1 = 32855;
    var GL_RGB565 = 36194;
    var GL_UNSIGNED_SHORT_4_4_4_4$1 = 32819;
    var GL_UNSIGNED_SHORT_5_5_5_1$1 = 32820;
    var GL_UNSIGNED_SHORT_5_6_5$1 = 33635;
    var GL_UNSIGNED_INT_24_8_WEBGL$1 = 34042;
    var GL_DEPTH_COMPONENT = 6402;
    var GL_DEPTH_STENCIL = 34041;
    var GL_SRGB_EXT = 35904;
    var GL_SRGB_ALPHA_EXT = 35906;
    var GL_HALF_FLOAT_OES$1 = 36193;
    var GL_COMPRESSED_RGB_S3TC_DXT1_EXT = 33776;
    var GL_COMPRESSED_RGBA_S3TC_DXT1_EXT = 33777;
    var GL_COMPRESSED_RGBA_S3TC_DXT3_EXT = 33778;
    var GL_COMPRESSED_RGBA_S3TC_DXT5_EXT = 33779;
    var GL_COMPRESSED_RGB_ATC_WEBGL = 35986;
    var GL_COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL = 35987;
    var GL_COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL = 34798;
    var GL_COMPRESSED_RGB_PVRTC_4BPPV1_IMG = 35840;
    var GL_COMPRESSED_RGB_PVRTC_2BPPV1_IMG = 35841;
    var GL_COMPRESSED_RGBA_PVRTC_4BPPV1_IMG = 35842;
    var GL_COMPRESSED_RGBA_PVRTC_2BPPV1_IMG = 35843;
    var GL_COMPRESSED_RGB_ETC1_WEBGL = 36196;
    var GL_UNSIGNED_BYTE$5 = 5121;
    var GL_UNSIGNED_SHORT$3 = 5123;
    var GL_UNSIGNED_INT$3 = 5125;
    var GL_FLOAT$4 = 5126;
    var GL_TEXTURE_WRAP_S = 10242;
    var GL_TEXTURE_WRAP_T = 10243;
    var GL_REPEAT = 10497;
    var GL_CLAMP_TO_EDGE$1 = 33071;
    var GL_MIRRORED_REPEAT = 33648;
    var GL_TEXTURE_MAG_FILTER = 10240;
    var GL_TEXTURE_MIN_FILTER = 10241;
    var GL_NEAREST$1 = 9728;
    var GL_LINEAR = 9729;
    var GL_NEAREST_MIPMAP_NEAREST$1 = 9984;
    var GL_LINEAR_MIPMAP_NEAREST$1 = 9985;
    var GL_NEAREST_MIPMAP_LINEAR$1 = 9986;
    var GL_LINEAR_MIPMAP_LINEAR$1 = 9987;
    var GL_GENERATE_MIPMAP_HINT = 33170;
    var GL_DONT_CARE = 4352;
    var GL_FASTEST = 4353;
    var GL_NICEST = 4354;
    var GL_TEXTURE_MAX_ANISOTROPY_EXT = 34046;
    var GL_UNPACK_ALIGNMENT = 3317;
    var GL_UNPACK_FLIP_Y_WEBGL = 37440;
    var GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL = 37441;
    var GL_UNPACK_COLORSPACE_CONVERSION_WEBGL = 37443;
    var GL_BROWSER_DEFAULT_WEBGL = 37444;
    var GL_TEXTURE0$1 = 33984;
    var MIPMAP_FILTERS = [
      GL_NEAREST_MIPMAP_NEAREST$1,
      GL_NEAREST_MIPMAP_LINEAR$1,
      GL_LINEAR_MIPMAP_NEAREST$1,
      GL_LINEAR_MIPMAP_LINEAR$1
    ];
    var CHANNELS_FORMAT = [
      0,
      GL_LUMINANCE,
      GL_LUMINANCE_ALPHA,
      GL_RGB,
      GL_RGBA$1
    ];
    var FORMAT_CHANNELS = {};
    FORMAT_CHANNELS[GL_LUMINANCE] = FORMAT_CHANNELS[GL_ALPHA] = FORMAT_CHANNELS[GL_DEPTH_COMPONENT] = 1;
    FORMAT_CHANNELS[GL_DEPTH_STENCIL] = FORMAT_CHANNELS[GL_LUMINANCE_ALPHA] = 2;
    FORMAT_CHANNELS[GL_RGB] = FORMAT_CHANNELS[GL_SRGB_EXT] = 3;
    FORMAT_CHANNELS[GL_RGBA$1] = FORMAT_CHANNELS[GL_SRGB_ALPHA_EXT] = 4;
    function objectName(str) {
      return "[object " + str + "]";
    }
    var CANVAS_CLASS = objectName("HTMLCanvasElement");
    var OFFSCREENCANVAS_CLASS = objectName("OffscreenCanvas");
    var CONTEXT2D_CLASS = objectName("CanvasRenderingContext2D");
    var BITMAP_CLASS = objectName("ImageBitmap");
    var IMAGE_CLASS = objectName("HTMLImageElement");
    var VIDEO_CLASS = objectName("HTMLVideoElement");
    var PIXEL_CLASSES = Object.keys(arrayTypes).concat([
      CANVAS_CLASS,
      OFFSCREENCANVAS_CLASS,
      CONTEXT2D_CLASS,
      BITMAP_CLASS,
      IMAGE_CLASS,
      VIDEO_CLASS
    ]);
    var TYPE_SIZES = [];
    TYPE_SIZES[GL_UNSIGNED_BYTE$5] = 1;
    TYPE_SIZES[GL_FLOAT$4] = 4;
    TYPE_SIZES[GL_HALF_FLOAT_OES$1] = 2;
    TYPE_SIZES[GL_UNSIGNED_SHORT$3] = 2;
    TYPE_SIZES[GL_UNSIGNED_INT$3] = 4;
    var FORMAT_SIZES_SPECIAL = [];
    FORMAT_SIZES_SPECIAL[GL_RGBA4] = 2;
    FORMAT_SIZES_SPECIAL[GL_RGB5_A1] = 2;
    FORMAT_SIZES_SPECIAL[GL_RGB565] = 2;
    FORMAT_SIZES_SPECIAL[GL_DEPTH_STENCIL] = 4;
    FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGB_S3TC_DXT1_EXT] = 0.5;
    FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGBA_S3TC_DXT1_EXT] = 0.5;
    FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGBA_S3TC_DXT3_EXT] = 1;
    FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGBA_S3TC_DXT5_EXT] = 1;
    FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGB_ATC_WEBGL] = 0.5;
    FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL] = 1;
    FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL] = 1;
    FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGB_PVRTC_4BPPV1_IMG] = 0.5;
    FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGB_PVRTC_2BPPV1_IMG] = 0.25;
    FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGBA_PVRTC_4BPPV1_IMG] = 0.5;
    FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGBA_PVRTC_2BPPV1_IMG] = 0.25;
    FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGB_ETC1_WEBGL] = 0.5;
    function isNumericArray(arr) {
      return Array.isArray(arr) && (arr.length === 0 || typeof arr[0] === "number");
    }
    function isRectArray(arr) {
      if (!Array.isArray(arr)) {
        return false;
      }
      var width = arr.length;
      if (width === 0 || !isArrayLike(arr[0])) {
        return false;
      }
      return true;
    }
    function classString(x) {
      return Object.prototype.toString.call(x);
    }
    function isCanvasElement(object2) {
      return classString(object2) === CANVAS_CLASS;
    }
    function isOffscreenCanvas(object2) {
      return classString(object2) === OFFSCREENCANVAS_CLASS;
    }
    function isContext2D(object2) {
      return classString(object2) === CONTEXT2D_CLASS;
    }
    function isBitmap(object2) {
      return classString(object2) === BITMAP_CLASS;
    }
    function isImageElement(object2) {
      return classString(object2) === IMAGE_CLASS;
    }
    function isVideoElement(object2) {
      return classString(object2) === VIDEO_CLASS;
    }
    function isPixelData(object2) {
      if (!object2) {
        return false;
      }
      var className = classString(object2);
      if (PIXEL_CLASSES.indexOf(className) >= 0) {
        return true;
      }
      return isNumericArray(object2) || isRectArray(object2) || isNDArrayLike(object2);
    }
    function typedArrayCode$1(data) {
      return arrayTypes[Object.prototype.toString.call(data)] | 0;
    }
    function convertData(result, data) {
      var n = data.length;
      switch (result.type) {
        case GL_UNSIGNED_BYTE$5:
        case GL_UNSIGNED_SHORT$3:
        case GL_UNSIGNED_INT$3:
        case GL_FLOAT$4:
          var converted = pool.allocType(result.type, n);
          converted.set(data);
          result.data = converted;
          break;
        case GL_HALF_FLOAT_OES$1:
          result.data = convertToHalfFloat(data);
          break;
        default:
          check$1.raise("unsupported texture type, must specify a typed array");
      }
    }
    function preConvert(image, n) {
      return pool.allocType(
        image.type === GL_HALF_FLOAT_OES$1 ? GL_FLOAT$4 : image.type,
        n
      );
    }
    function postConvert(image, data) {
      if (image.type === GL_HALF_FLOAT_OES$1) {
        image.data = convertToHalfFloat(data);
        pool.freeType(data);
      } else {
        image.data = data;
      }
    }
    function transposeData(image, array2, strideX, strideY, strideC, offset) {
      var w = image.width;
      var h = image.height;
      var c2 = image.channels;
      var n = w * h * c2;
      var data = preConvert(image, n);
      var p = 0;
      for (var i = 0; i < h; ++i) {
        for (var j = 0; j < w; ++j) {
          for (var k = 0; k < c2; ++k) {
            data[p++] = array2[strideX * j + strideY * i + strideC * k + offset];
          }
        }
      }
      postConvert(image, data);
    }
    function getTextureSize(format2, type, width, height, isMipmap, isCube) {
      var s;
      if (typeof FORMAT_SIZES_SPECIAL[format2] !== "undefined") {
        s = FORMAT_SIZES_SPECIAL[format2];
      } else {
        s = FORMAT_CHANNELS[format2] * TYPE_SIZES[type];
      }
      if (isCube) {
        s *= 6;
      }
      if (isMipmap) {
        var total = 0;
        var w = width;
        while (w >= 1) {
          total += s * w * w;
          w /= 2;
        }
        return total;
      } else {
        return s * width * height;
      }
    }
    function createTextureSet(gl, extensions, limits, reglPoll, contextState, stats2, config) {
      var mipmapHint = {
        "don't care": GL_DONT_CARE,
        "dont care": GL_DONT_CARE,
        "nice": GL_NICEST,
        "fast": GL_FASTEST
      };
      var wrapModes = {
        "repeat": GL_REPEAT,
        "clamp": GL_CLAMP_TO_EDGE$1,
        "mirror": GL_MIRRORED_REPEAT
      };
      var magFilters = {
        "nearest": GL_NEAREST$1,
        "linear": GL_LINEAR
      };
      var minFilters = extend2({
        "mipmap": GL_LINEAR_MIPMAP_LINEAR$1,
        "nearest mipmap nearest": GL_NEAREST_MIPMAP_NEAREST$1,
        "linear mipmap nearest": GL_LINEAR_MIPMAP_NEAREST$1,
        "nearest mipmap linear": GL_NEAREST_MIPMAP_LINEAR$1,
        "linear mipmap linear": GL_LINEAR_MIPMAP_LINEAR$1
      }, magFilters);
      var colorSpace = {
        "none": 0,
        "browser": GL_BROWSER_DEFAULT_WEBGL
      };
      var textureTypes = {
        "uint8": GL_UNSIGNED_BYTE$5,
        "rgba4": GL_UNSIGNED_SHORT_4_4_4_4$1,
        "rgb565": GL_UNSIGNED_SHORT_5_6_5$1,
        "rgb5 a1": GL_UNSIGNED_SHORT_5_5_5_1$1
      };
      var textureFormats = {
        "alpha": GL_ALPHA,
        "luminance": GL_LUMINANCE,
        "luminance alpha": GL_LUMINANCE_ALPHA,
        "rgb": GL_RGB,
        "rgba": GL_RGBA$1,
        "rgba4": GL_RGBA4,
        "rgb5 a1": GL_RGB5_A1,
        "rgb565": GL_RGB565
      };
      var compressedTextureFormats = {};
      if (extensions.ext_srgb) {
        textureFormats.srgb = GL_SRGB_EXT;
        textureFormats.srgba = GL_SRGB_ALPHA_EXT;
      }
      if (extensions.oes_texture_float) {
        textureTypes.float32 = textureTypes.float = GL_FLOAT$4;
      }
      if (extensions.oes_texture_half_float) {
        textureTypes["float16"] = textureTypes["half float"] = GL_HALF_FLOAT_OES$1;
      }
      if (extensions.webgl_depth_texture) {
        extend2(textureFormats, {
          "depth": GL_DEPTH_COMPONENT,
          "depth stencil": GL_DEPTH_STENCIL
        });
        extend2(textureTypes, {
          "uint16": GL_UNSIGNED_SHORT$3,
          "uint32": GL_UNSIGNED_INT$3,
          "depth stencil": GL_UNSIGNED_INT_24_8_WEBGL$1
        });
      }
      if (extensions.webgl_compressed_texture_s3tc) {
        extend2(compressedTextureFormats, {
          "rgb s3tc dxt1": GL_COMPRESSED_RGB_S3TC_DXT1_EXT,
          "rgba s3tc dxt1": GL_COMPRESSED_RGBA_S3TC_DXT1_EXT,
          "rgba s3tc dxt3": GL_COMPRESSED_RGBA_S3TC_DXT3_EXT,
          "rgba s3tc dxt5": GL_COMPRESSED_RGBA_S3TC_DXT5_EXT
        });
      }
      if (extensions.webgl_compressed_texture_atc) {
        extend2(compressedTextureFormats, {
          "rgb atc": GL_COMPRESSED_RGB_ATC_WEBGL,
          "rgba atc explicit alpha": GL_COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL,
          "rgba atc interpolated alpha": GL_COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL
        });
      }
      if (extensions.webgl_compressed_texture_pvrtc) {
        extend2(compressedTextureFormats, {
          "rgb pvrtc 4bppv1": GL_COMPRESSED_RGB_PVRTC_4BPPV1_IMG,
          "rgb pvrtc 2bppv1": GL_COMPRESSED_RGB_PVRTC_2BPPV1_IMG,
          "rgba pvrtc 4bppv1": GL_COMPRESSED_RGBA_PVRTC_4BPPV1_IMG,
          "rgba pvrtc 2bppv1": GL_COMPRESSED_RGBA_PVRTC_2BPPV1_IMG
        });
      }
      if (extensions.webgl_compressed_texture_etc1) {
        compressedTextureFormats["rgb etc1"] = GL_COMPRESSED_RGB_ETC1_WEBGL;
      }
      var supportedCompressedFormats = Array.prototype.slice.call(
        gl.getParameter(GL_COMPRESSED_TEXTURE_FORMATS)
      );
      Object.keys(compressedTextureFormats).forEach(function(name) {
        var format2 = compressedTextureFormats[name];
        if (supportedCompressedFormats.indexOf(format2) >= 0) {
          textureFormats[name] = format2;
        }
      });
      var supportedFormats = Object.keys(textureFormats);
      limits.textureFormats = supportedFormats;
      var textureFormatsInvert = [];
      Object.keys(textureFormats).forEach(function(key) {
        var val = textureFormats[key];
        textureFormatsInvert[val] = key;
      });
      var textureTypesInvert = [];
      Object.keys(textureTypes).forEach(function(key) {
        var val = textureTypes[key];
        textureTypesInvert[val] = key;
      });
      var magFiltersInvert = [];
      Object.keys(magFilters).forEach(function(key) {
        var val = magFilters[key];
        magFiltersInvert[val] = key;
      });
      var minFiltersInvert = [];
      Object.keys(minFilters).forEach(function(key) {
        var val = minFilters[key];
        minFiltersInvert[val] = key;
      });
      var wrapModesInvert = [];
      Object.keys(wrapModes).forEach(function(key) {
        var val = wrapModes[key];
        wrapModesInvert[val] = key;
      });
      var colorFormats = supportedFormats.reduce(function(color2, key) {
        var glenum = textureFormats[key];
        if (glenum === GL_LUMINANCE || glenum === GL_ALPHA || glenum === GL_LUMINANCE || glenum === GL_LUMINANCE_ALPHA || glenum === GL_DEPTH_COMPONENT || glenum === GL_DEPTH_STENCIL || extensions.ext_srgb && (glenum === GL_SRGB_EXT || glenum === GL_SRGB_ALPHA_EXT)) {
          color2[glenum] = glenum;
        } else if (glenum === GL_RGB5_A1 || key.indexOf("rgba") >= 0) {
          color2[glenum] = GL_RGBA$1;
        } else {
          color2[glenum] = GL_RGB;
        }
        return color2;
      }, {});
      function TexFlags() {
        this.internalformat = GL_RGBA$1;
        this.format = GL_RGBA$1;
        this.type = GL_UNSIGNED_BYTE$5;
        this.compressed = false;
        this.premultiplyAlpha = false;
        this.flipY = false;
        this.unpackAlignment = 1;
        this.colorSpace = GL_BROWSER_DEFAULT_WEBGL;
        this.width = 0;
        this.height = 0;
        this.channels = 0;
      }
      function copyFlags(result, other) {
        result.internalformat = other.internalformat;
        result.format = other.format;
        result.type = other.type;
        result.compressed = other.compressed;
        result.premultiplyAlpha = other.premultiplyAlpha;
        result.flipY = other.flipY;
        result.unpackAlignment = other.unpackAlignment;
        result.colorSpace = other.colorSpace;
        result.width = other.width;
        result.height = other.height;
        result.channels = other.channels;
      }
      function parseFlags(flags, options) {
        if (typeof options !== "object" || !options) {
          return;
        }
        if ("premultiplyAlpha" in options) {
          check$1.type(
            options.premultiplyAlpha,
            "boolean",
            "invalid premultiplyAlpha"
          );
          flags.premultiplyAlpha = options.premultiplyAlpha;
        }
        if ("flipY" in options) {
          check$1.type(
            options.flipY,
            "boolean",
            "invalid texture flip"
          );
          flags.flipY = options.flipY;
        }
        if ("alignment" in options) {
          check$1.oneOf(
            options.alignment,
            [1, 2, 4, 8],
            "invalid texture unpack alignment"
          );
          flags.unpackAlignment = options.alignment;
        }
        if ("colorSpace" in options) {
          check$1.parameter(
            options.colorSpace,
            colorSpace,
            "invalid colorSpace"
          );
          flags.colorSpace = colorSpace[options.colorSpace];
        }
        if ("type" in options) {
          var type = options.type;
          check$1(
            extensions.oes_texture_float || !(type === "float" || type === "float32"),
            "you must enable the OES_texture_float extension in order to use floating point textures."
          );
          check$1(
            extensions.oes_texture_half_float || !(type === "half float" || type === "float16"),
            "you must enable the OES_texture_half_float extension in order to use 16-bit floating point textures."
          );
          check$1(
            extensions.webgl_depth_texture || !(type === "uint16" || type === "uint32" || type === "depth stencil"),
            "you must enable the WEBGL_depth_texture extension in order to use depth/stencil textures."
          );
          check$1.parameter(
            type,
            textureTypes,
            "invalid texture type"
          );
          flags.type = textureTypes[type];
        }
        var w = flags.width;
        var h = flags.height;
        var c2 = flags.channels;
        var hasChannels = false;
        if ("shape" in options) {
          check$1(
            Array.isArray(options.shape) && options.shape.length >= 2,
            "shape must be an array"
          );
          w = options.shape[0];
          h = options.shape[1];
          if (options.shape.length === 3) {
            c2 = options.shape[2];
            check$1(c2 > 0 && c2 <= 4, "invalid number of channels");
            hasChannels = true;
          }
          check$1(w >= 0 && w <= limits.maxTextureSize, "invalid width");
          check$1(h >= 0 && h <= limits.maxTextureSize, "invalid height");
        } else {
          if ("radius" in options) {
            w = h = options.radius;
            check$1(w >= 0 && w <= limits.maxTextureSize, "invalid radius");
          }
          if ("width" in options) {
            w = options.width;
            check$1(w >= 0 && w <= limits.maxTextureSize, "invalid width");
          }
          if ("height" in options) {
            h = options.height;
            check$1(h >= 0 && h <= limits.maxTextureSize, "invalid height");
          }
          if ("channels" in options) {
            c2 = options.channels;
            check$1(c2 > 0 && c2 <= 4, "invalid number of channels");
            hasChannels = true;
          }
        }
        flags.width = w | 0;
        flags.height = h | 0;
        flags.channels = c2 | 0;
        var hasFormat = false;
        if ("format" in options) {
          var formatStr = options.format;
          check$1(
            extensions.webgl_depth_texture || !(formatStr === "depth" || formatStr === "depth stencil"),
            "you must enable the WEBGL_depth_texture extension in order to use depth/stencil textures."
          );
          check$1.parameter(
            formatStr,
            textureFormats,
            "invalid texture format"
          );
          var internalformat = flags.internalformat = textureFormats[formatStr];
          flags.format = colorFormats[internalformat];
          if (formatStr in textureTypes) {
            if (!("type" in options)) {
              flags.type = textureTypes[formatStr];
            }
          }
          if (formatStr in compressedTextureFormats) {
            flags.compressed = true;
          }
          hasFormat = true;
        }
        if (!hasChannels && hasFormat) {
          flags.channels = FORMAT_CHANNELS[flags.format];
        } else if (hasChannels && !hasFormat) {
          if (flags.channels !== CHANNELS_FORMAT[flags.format]) {
            flags.format = flags.internalformat = CHANNELS_FORMAT[flags.channels];
          }
        } else if (hasFormat && hasChannels) {
          check$1(
            flags.channels === FORMAT_CHANNELS[flags.format],
            "number of channels inconsistent with specified format"
          );
        }
      }
      function setFlags(flags) {
        gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, flags.flipY);
        gl.pixelStorei(GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, flags.premultiplyAlpha);
        gl.pixelStorei(GL_UNPACK_COLORSPACE_CONVERSION_WEBGL, flags.colorSpace);
        gl.pixelStorei(GL_UNPACK_ALIGNMENT, flags.unpackAlignment);
      }
      function TexImage() {
        TexFlags.call(this);
        this.xOffset = 0;
        this.yOffset = 0;
        this.data = null;
        this.needsFree = false;
        this.element = null;
        this.needsCopy = false;
      }
      function parseImage(image, options) {
        var data = null;
        if (isPixelData(options)) {
          data = options;
        } else if (options) {
          check$1.type(options, "object", "invalid pixel data type");
          parseFlags(image, options);
          if ("x" in options) {
            image.xOffset = options.x | 0;
          }
          if ("y" in options) {
            image.yOffset = options.y | 0;
          }
          if (isPixelData(options.data)) {
            data = options.data;
          }
        }
        check$1(
          !image.compressed || data instanceof Uint8Array,
          "compressed texture data must be stored in a uint8array"
        );
        if (options.copy) {
          check$1(!data, "can not specify copy and data field for the same texture");
          var viewW = contextState.viewportWidth;
          var viewH = contextState.viewportHeight;
          image.width = image.width || viewW - image.xOffset;
          image.height = image.height || viewH - image.yOffset;
          image.needsCopy = true;
          check$1(
            image.xOffset >= 0 && image.xOffset < viewW && image.yOffset >= 0 && image.yOffset < viewH && image.width > 0 && image.width <= viewW && image.height > 0 && image.height <= viewH,
            "copy texture read out of bounds"
          );
        } else if (!data) {
          image.width = image.width || 1;
          image.height = image.height || 1;
          image.channels = image.channels || 4;
        } else if (isTypedArray(data)) {
          image.channels = image.channels || 4;
          image.data = data;
          if (!("type" in options) && image.type === GL_UNSIGNED_BYTE$5) {
            image.type = typedArrayCode$1(data);
          }
        } else if (isNumericArray(data)) {
          image.channels = image.channels || 4;
          convertData(image, data);
          image.alignment = 1;
          image.needsFree = true;
        } else if (isNDArrayLike(data)) {
          var array2 = data.data;
          if (!Array.isArray(array2) && image.type === GL_UNSIGNED_BYTE$5) {
            image.type = typedArrayCode$1(array2);
          }
          var shape = data.shape;
          var stride = data.stride;
          var shapeX, shapeY, shapeC, strideX, strideY, strideC;
          if (shape.length === 3) {
            shapeC = shape[2];
            strideC = stride[2];
          } else {
            check$1(shape.length === 2, "invalid ndarray pixel data, must be 2 or 3D");
            shapeC = 1;
            strideC = 1;
          }
          shapeX = shape[0];
          shapeY = shape[1];
          strideX = stride[0];
          strideY = stride[1];
          image.alignment = 1;
          image.width = shapeX;
          image.height = shapeY;
          image.channels = shapeC;
          image.format = image.internalformat = CHANNELS_FORMAT[shapeC];
          image.needsFree = true;
          transposeData(image, array2, strideX, strideY, strideC, data.offset);
        } else if (isCanvasElement(data) || isOffscreenCanvas(data) || isContext2D(data)) {
          if (isCanvasElement(data) || isOffscreenCanvas(data)) {
            image.element = data;
          } else {
            image.element = data.canvas;
          }
          image.width = image.element.width;
          image.height = image.element.height;
          image.channels = 4;
        } else if (isBitmap(data)) {
          image.element = data;
          image.width = data.width;
          image.height = data.height;
          image.channels = 4;
        } else if (isImageElement(data)) {
          image.element = data;
          image.width = data.naturalWidth;
          image.height = data.naturalHeight;
          image.channels = 4;
        } else if (isVideoElement(data)) {
          image.element = data;
          image.width = data.videoWidth;
          image.height = data.videoHeight;
          image.channels = 4;
        } else if (isRectArray(data)) {
          var w = image.width || data[0].length;
          var h = image.height || data.length;
          var c2 = image.channels;
          if (isArrayLike(data[0][0])) {
            c2 = c2 || data[0][0].length;
          } else {
            c2 = c2 || 1;
          }
          var arrayShape2 = flattenUtils.shape(data);
          var n = 1;
          for (var dd = 0; dd < arrayShape2.length; ++dd) {
            n *= arrayShape2[dd];
          }
          var allocData = preConvert(image, n);
          flattenUtils.flatten(data, arrayShape2, "", allocData);
          postConvert(image, allocData);
          image.alignment = 1;
          image.width = w;
          image.height = h;
          image.channels = c2;
          image.format = image.internalformat = CHANNELS_FORMAT[c2];
          image.needsFree = true;
        }
        if (image.type === GL_FLOAT$4) {
          check$1(
            limits.extensions.indexOf("oes_texture_float") >= 0,
            "oes_texture_float extension not enabled"
          );
        } else if (image.type === GL_HALF_FLOAT_OES$1) {
          check$1(
            limits.extensions.indexOf("oes_texture_half_float") >= 0,
            "oes_texture_half_float extension not enabled"
          );
        }
      }
      function setImage(info, target, miplevel) {
        var element = info.element;
        var data = info.data;
        var internalformat = info.internalformat;
        var format2 = info.format;
        var type = info.type;
        var width = info.width;
        var height = info.height;
        setFlags(info);
        if (element) {
          gl.texImage2D(target, miplevel, format2, format2, type, element);
        } else if (info.compressed) {
          gl.compressedTexImage2D(target, miplevel, internalformat, width, height, 0, data);
        } else if (info.needsCopy) {
          reglPoll();
          gl.copyTexImage2D(
            target,
            miplevel,
            format2,
            info.xOffset,
            info.yOffset,
            width,
            height,
            0
          );
        } else {
          gl.texImage2D(target, miplevel, format2, width, height, 0, format2, type, data || null);
        }
      }
      function setSubImage(info, target, x, y, miplevel) {
        var element = info.element;
        var data = info.data;
        var internalformat = info.internalformat;
        var format2 = info.format;
        var type = info.type;
        var width = info.width;
        var height = info.height;
        setFlags(info);
        if (element) {
          gl.texSubImage2D(
            target,
            miplevel,
            x,
            y,
            format2,
            type,
            element
          );
        } else if (info.compressed) {
          gl.compressedTexSubImage2D(
            target,
            miplevel,
            x,
            y,
            internalformat,
            width,
            height,
            data
          );
        } else if (info.needsCopy) {
          reglPoll();
          gl.copyTexSubImage2D(
            target,
            miplevel,
            x,
            y,
            info.xOffset,
            info.yOffset,
            width,
            height
          );
        } else {
          gl.texSubImage2D(
            target,
            miplevel,
            x,
            y,
            width,
            height,
            format2,
            type,
            data
          );
        }
      }
      var imagePool = [];
      function allocImage() {
        return imagePool.pop() || new TexImage();
      }
      function freeImage(image) {
        if (image.needsFree) {
          pool.freeType(image.data);
        }
        TexImage.call(image);
        imagePool.push(image);
      }
      function MipMap() {
        TexFlags.call(this);
        this.genMipmaps = false;
        this.mipmapHint = GL_DONT_CARE;
        this.mipmask = 0;
        this.images = Array(16);
      }
      function parseMipMapFromShape(mipmap, width, height) {
        var img = mipmap.images[0] = allocImage();
        mipmap.mipmask = 1;
        img.width = mipmap.width = width;
        img.height = mipmap.height = height;
        img.channels = mipmap.channels = 4;
      }
      function parseMipMapFromObject(mipmap, options) {
        var imgData = null;
        if (isPixelData(options)) {
          imgData = mipmap.images[0] = allocImage();
          copyFlags(imgData, mipmap);
          parseImage(imgData, options);
          mipmap.mipmask = 1;
        } else {
          parseFlags(mipmap, options);
          if (Array.isArray(options.mipmap)) {
            var mipData = options.mipmap;
            for (var i = 0; i < mipData.length; ++i) {
              imgData = mipmap.images[i] = allocImage();
              copyFlags(imgData, mipmap);
              imgData.width >>= i;
              imgData.height >>= i;
              parseImage(imgData, mipData[i]);
              mipmap.mipmask |= 1 << i;
            }
          } else {
            imgData = mipmap.images[0] = allocImage();
            copyFlags(imgData, mipmap);
            parseImage(imgData, options);
            mipmap.mipmask = 1;
          }
        }
        copyFlags(mipmap, mipmap.images[0]);
        if (mipmap.compressed && (mipmap.internalformat === GL_COMPRESSED_RGB_S3TC_DXT1_EXT || mipmap.internalformat === GL_COMPRESSED_RGBA_S3TC_DXT1_EXT || mipmap.internalformat === GL_COMPRESSED_RGBA_S3TC_DXT3_EXT || mipmap.internalformat === GL_COMPRESSED_RGBA_S3TC_DXT5_EXT)) {
          check$1(
            mipmap.width % 4 === 0 && mipmap.height % 4 === 0,
            "for compressed texture formats, mipmap level 0 must have width and height that are a multiple of 4"
          );
        }
      }
      function setMipMap(mipmap, target) {
        var images = mipmap.images;
        for (var i = 0; i < images.length; ++i) {
          if (!images[i]) {
            return;
          }
          setImage(images[i], target, i);
        }
      }
      var mipPool = [];
      function allocMipMap() {
        var result = mipPool.pop() || new MipMap();
        TexFlags.call(result);
        result.mipmask = 0;
        for (var i = 0; i < 16; ++i) {
          result.images[i] = null;
        }
        return result;
      }
      function freeMipMap(mipmap) {
        var images = mipmap.images;
        for (var i = 0; i < images.length; ++i) {
          if (images[i]) {
            freeImage(images[i]);
          }
          images[i] = null;
        }
        mipPool.push(mipmap);
      }
      function TexInfo() {
        this.minFilter = GL_NEAREST$1;
        this.magFilter = GL_NEAREST$1;
        this.wrapS = GL_CLAMP_TO_EDGE$1;
        this.wrapT = GL_CLAMP_TO_EDGE$1;
        this.anisotropic = 1;
        this.genMipmaps = false;
        this.mipmapHint = GL_DONT_CARE;
      }
      function parseTexInfo(info, options) {
        if ("min" in options) {
          var minFilter = options.min;
          check$1.parameter(minFilter, minFilters);
          info.minFilter = minFilters[minFilter];
          if (MIPMAP_FILTERS.indexOf(info.minFilter) >= 0 && !("faces" in options)) {
            info.genMipmaps = true;
          }
        }
        if ("mag" in options) {
          var magFilter = options.mag;
          check$1.parameter(magFilter, magFilters);
          info.magFilter = magFilters[magFilter];
        }
        var wrapS = info.wrapS;
        var wrapT = info.wrapT;
        if ("wrap" in options) {
          var wrap = options.wrap;
          if (typeof wrap === "string") {
            check$1.parameter(wrap, wrapModes);
            wrapS = wrapT = wrapModes[wrap];
          } else if (Array.isArray(wrap)) {
            check$1.parameter(wrap[0], wrapModes);
            check$1.parameter(wrap[1], wrapModes);
            wrapS = wrapModes[wrap[0]];
            wrapT = wrapModes[wrap[1]];
          }
        } else {
          if ("wrapS" in options) {
            var optWrapS = options.wrapS;
            check$1.parameter(optWrapS, wrapModes);
            wrapS = wrapModes[optWrapS];
          }
          if ("wrapT" in options) {
            var optWrapT = options.wrapT;
            check$1.parameter(optWrapT, wrapModes);
            wrapT = wrapModes[optWrapT];
          }
        }
        info.wrapS = wrapS;
        info.wrapT = wrapT;
        if ("anisotropic" in options) {
          var anisotropic = options.anisotropic;
          check$1(
            typeof anisotropic === "number" && anisotropic >= 1 && anisotropic <= limits.maxAnisotropic,
            "aniso samples must be between 1 and "
          );
          info.anisotropic = options.anisotropic;
        }
        if ("mipmap" in options) {
          var hasMipMap = false;
          switch (typeof options.mipmap) {
            case "string":
              check$1.parameter(
                options.mipmap,
                mipmapHint,
                "invalid mipmap hint"
              );
              info.mipmapHint = mipmapHint[options.mipmap];
              info.genMipmaps = true;
              hasMipMap = true;
              break;
            case "boolean":
              hasMipMap = info.genMipmaps = options.mipmap;
              break;
            case "object":
              check$1(Array.isArray(options.mipmap), "invalid mipmap type");
              info.genMipmaps = false;
              hasMipMap = true;
              break;
            default:
              check$1.raise("invalid mipmap type");
          }
          if (hasMipMap && !("min" in options)) {
            info.minFilter = GL_NEAREST_MIPMAP_NEAREST$1;
          }
        }
      }
      function setTexInfo(info, target) {
        gl.texParameteri(target, GL_TEXTURE_MIN_FILTER, info.minFilter);
        gl.texParameteri(target, GL_TEXTURE_MAG_FILTER, info.magFilter);
        gl.texParameteri(target, GL_TEXTURE_WRAP_S, info.wrapS);
        gl.texParameteri(target, GL_TEXTURE_WRAP_T, info.wrapT);
        if (extensions.ext_texture_filter_anisotropic) {
          gl.texParameteri(target, GL_TEXTURE_MAX_ANISOTROPY_EXT, info.anisotropic);
        }
        if (info.genMipmaps) {
          gl.hint(GL_GENERATE_MIPMAP_HINT, info.mipmapHint);
          gl.generateMipmap(target);
        }
      }
      var textureCount = 0;
      var textureSet = {};
      var numTexUnits = limits.maxTextureUnits;
      var textureUnits = Array(numTexUnits).map(function() {
        return null;
      });
      function REGLTexture(target) {
        TexFlags.call(this);
        this.mipmask = 0;
        this.internalformat = GL_RGBA$1;
        this.id = textureCount++;
        this.refCount = 1;
        this.target = target;
        this.texture = gl.createTexture();
        this.unit = -1;
        this.bindCount = 0;
        this.texInfo = new TexInfo();
        if (config.profile) {
          this.stats = { size: 0 };
        }
      }
      function tempBind(texture) {
        gl.activeTexture(GL_TEXTURE0$1);
        gl.bindTexture(texture.target, texture.texture);
      }
      function tempRestore() {
        var prev = textureUnits[0];
        if (prev) {
          gl.bindTexture(prev.target, prev.texture);
        } else {
          gl.bindTexture(GL_TEXTURE_2D$1, null);
        }
      }
      function destroy(texture) {
        var handle = texture.texture;
        check$1(handle, "must not double destroy texture");
        var unit2 = texture.unit;
        var target = texture.target;
        if (unit2 >= 0) {
          gl.activeTexture(GL_TEXTURE0$1 + unit2);
          gl.bindTexture(target, null);
          textureUnits[unit2] = null;
        }
        gl.deleteTexture(handle);
        texture.texture = null;
        texture.params = null;
        texture.pixels = null;
        texture.refCount = 0;
        delete textureSet[texture.id];
        stats2.textureCount--;
      }
      extend2(REGLTexture.prototype, {
        bind: function() {
          var texture = this;
          texture.bindCount += 1;
          var unit2 = texture.unit;
          if (unit2 < 0) {
            for (var i = 0; i < numTexUnits; ++i) {
              var other = textureUnits[i];
              if (other) {
                if (other.bindCount > 0) {
                  continue;
                }
                other.unit = -1;
              }
              textureUnits[i] = texture;
              unit2 = i;
              break;
            }
            if (unit2 >= numTexUnits) {
              check$1.raise("insufficient number of texture units");
            }
            if (config.profile && stats2.maxTextureUnits < unit2 + 1) {
              stats2.maxTextureUnits = unit2 + 1;
            }
            texture.unit = unit2;
            gl.activeTexture(GL_TEXTURE0$1 + unit2);
            gl.bindTexture(texture.target, texture.texture);
          }
          return unit2;
        },
        unbind: function() {
          this.bindCount -= 1;
        },
        decRef: function() {
          if (--this.refCount <= 0) {
            destroy(this);
          }
        }
      });
      function createTexture2D(a, b) {
        var texture = new REGLTexture(GL_TEXTURE_2D$1);
        textureSet[texture.id] = texture;
        stats2.textureCount++;
        function reglTexture2D(a2, b2) {
          var texInfo = texture.texInfo;
          TexInfo.call(texInfo);
          var mipData = allocMipMap();
          if (typeof a2 === "number") {
            if (typeof b2 === "number") {
              parseMipMapFromShape(mipData, a2 | 0, b2 | 0);
            } else {
              parseMipMapFromShape(mipData, a2 | 0, a2 | 0);
            }
          } else if (a2) {
            check$1.type(a2, "object", "invalid arguments to regl.texture");
            parseTexInfo(texInfo, a2);
            parseMipMapFromObject(mipData, a2);
          } else {
            parseMipMapFromShape(mipData, 1, 1);
          }
          if (texInfo.genMipmaps) {
            mipData.mipmask = (mipData.width << 1) - 1;
          }
          texture.mipmask = mipData.mipmask;
          copyFlags(texture, mipData);
          check$1.texture2D(texInfo, mipData, limits);
          texture.internalformat = mipData.internalformat;
          reglTexture2D.width = mipData.width;
          reglTexture2D.height = mipData.height;
          tempBind(texture);
          setMipMap(mipData, GL_TEXTURE_2D$1);
          setTexInfo(texInfo, GL_TEXTURE_2D$1);
          tempRestore();
          freeMipMap(mipData);
          if (config.profile) {
            texture.stats.size = getTextureSize(
              texture.internalformat,
              texture.type,
              mipData.width,
              mipData.height,
              texInfo.genMipmaps,
              false
            );
          }
          reglTexture2D.format = textureFormatsInvert[texture.internalformat];
          reglTexture2D.type = textureTypesInvert[texture.type];
          reglTexture2D.mag = magFiltersInvert[texInfo.magFilter];
          reglTexture2D.min = minFiltersInvert[texInfo.minFilter];
          reglTexture2D.wrapS = wrapModesInvert[texInfo.wrapS];
          reglTexture2D.wrapT = wrapModesInvert[texInfo.wrapT];
          return reglTexture2D;
        }
        function subimage(image, x_, y_, level_) {
          check$1(!!image, "must specify image data");
          var x = x_ | 0;
          var y = y_ | 0;
          var level = level_ | 0;
          var imageData = allocImage();
          copyFlags(imageData, texture);
          imageData.width = 0;
          imageData.height = 0;
          parseImage(imageData, image);
          imageData.width = imageData.width || (texture.width >> level) - x;
          imageData.height = imageData.height || (texture.height >> level) - y;
          check$1(
            texture.type === imageData.type && texture.format === imageData.format && texture.internalformat === imageData.internalformat,
            "incompatible format for texture.subimage"
          );
          check$1(
            x >= 0 && y >= 0 && x + imageData.width <= texture.width && y + imageData.height <= texture.height,
            "texture.subimage write out of bounds"
          );
          check$1(
            texture.mipmask & 1 << level,
            "missing mipmap data"
          );
          check$1(
            imageData.data || imageData.element || imageData.needsCopy,
            "missing image data"
          );
          tempBind(texture);
          setSubImage(imageData, GL_TEXTURE_2D$1, x, y, level);
          tempRestore();
          freeImage(imageData);
          return reglTexture2D;
        }
        function resize(w_, h_) {
          var w = w_ | 0;
          var h = h_ | 0 || w;
          if (w === texture.width && h === texture.height) {
            return reglTexture2D;
          }
          reglTexture2D.width = texture.width = w;
          reglTexture2D.height = texture.height = h;
          tempBind(texture);
          for (var i = 0; texture.mipmask >> i; ++i) {
            var _w = w >> i;
            var _h = h >> i;
            if (!_w || !_h)
              break;
            gl.texImage2D(
              GL_TEXTURE_2D$1,
              i,
              texture.format,
              _w,
              _h,
              0,
              texture.format,
              texture.type,
              null
            );
          }
          tempRestore();
          if (config.profile) {
            texture.stats.size = getTextureSize(
              texture.internalformat,
              texture.type,
              w,
              h,
              false,
              false
            );
          }
          return reglTexture2D;
        }
        reglTexture2D(a, b);
        reglTexture2D.subimage = subimage;
        reglTexture2D.resize = resize;
        reglTexture2D._reglType = "texture2d";
        reglTexture2D._texture = texture;
        if (config.profile) {
          reglTexture2D.stats = texture.stats;
        }
        reglTexture2D.destroy = function() {
          texture.decRef();
        };
        return reglTexture2D;
      }
      function createTextureCube(a0, a1, a2, a3, a4, a5) {
        var texture = new REGLTexture(GL_TEXTURE_CUBE_MAP$1);
        textureSet[texture.id] = texture;
        stats2.cubeCount++;
        var faces = new Array(6);
        function reglTextureCube(a02, a12, a22, a32, a42, a52) {
          var i;
          var texInfo = texture.texInfo;
          TexInfo.call(texInfo);
          for (i = 0; i < 6; ++i) {
            faces[i] = allocMipMap();
          }
          if (typeof a02 === "number" || !a02) {
            var s = a02 | 0 || 1;
            for (i = 0; i < 6; ++i) {
              parseMipMapFromShape(faces[i], s, s);
            }
          } else if (typeof a02 === "object") {
            if (a12) {
              parseMipMapFromObject(faces[0], a02);
              parseMipMapFromObject(faces[1], a12);
              parseMipMapFromObject(faces[2], a22);
              parseMipMapFromObject(faces[3], a32);
              parseMipMapFromObject(faces[4], a42);
              parseMipMapFromObject(faces[5], a52);
            } else {
              parseTexInfo(texInfo, a02);
              parseFlags(texture, a02);
              if ("faces" in a02) {
                var faceInput = a02.faces;
                check$1(
                  Array.isArray(faceInput) && faceInput.length === 6,
                  "cube faces must be a length 6 array"
                );
                for (i = 0; i < 6; ++i) {
                  check$1(
                    typeof faceInput[i] === "object" && !!faceInput[i],
                    "invalid input for cube map face"
                  );
                  copyFlags(faces[i], texture);
                  parseMipMapFromObject(faces[i], faceInput[i]);
                }
              } else {
                for (i = 0; i < 6; ++i) {
                  parseMipMapFromObject(faces[i], a02);
                }
              }
            }
          } else {
            check$1.raise("invalid arguments to cube map");
          }
          copyFlags(texture, faces[0]);
          check$1.optional(function() {
            if (!limits.npotTextureCube) {
              check$1(isPow2$1(texture.width) && isPow2$1(texture.height), "your browser does not support non power or two texture dimensions");
            }
          });
          if (texInfo.genMipmaps) {
            texture.mipmask = (faces[0].width << 1) - 1;
          } else {
            texture.mipmask = faces[0].mipmask;
          }
          check$1.textureCube(texture, texInfo, faces, limits);
          texture.internalformat = faces[0].internalformat;
          reglTextureCube.width = faces[0].width;
          reglTextureCube.height = faces[0].height;
          tempBind(texture);
          for (i = 0; i < 6; ++i) {
            setMipMap(faces[i], GL_TEXTURE_CUBE_MAP_POSITIVE_X$1 + i);
          }
          setTexInfo(texInfo, GL_TEXTURE_CUBE_MAP$1);
          tempRestore();
          if (config.profile) {
            texture.stats.size = getTextureSize(
              texture.internalformat,
              texture.type,
              reglTextureCube.width,
              reglTextureCube.height,
              texInfo.genMipmaps,
              true
            );
          }
          reglTextureCube.format = textureFormatsInvert[texture.internalformat];
          reglTextureCube.type = textureTypesInvert[texture.type];
          reglTextureCube.mag = magFiltersInvert[texInfo.magFilter];
          reglTextureCube.min = minFiltersInvert[texInfo.minFilter];
          reglTextureCube.wrapS = wrapModesInvert[texInfo.wrapS];
          reglTextureCube.wrapT = wrapModesInvert[texInfo.wrapT];
          for (i = 0; i < 6; ++i) {
            freeMipMap(faces[i]);
          }
          return reglTextureCube;
        }
        function subimage(face, image, x_, y_, level_) {
          check$1(!!image, "must specify image data");
          check$1(typeof face === "number" && face === (face | 0) && face >= 0 && face < 6, "invalid face");
          var x = x_ | 0;
          var y = y_ | 0;
          var level = level_ | 0;
          var imageData = allocImage();
          copyFlags(imageData, texture);
          imageData.width = 0;
          imageData.height = 0;
          parseImage(imageData, image);
          imageData.width = imageData.width || (texture.width >> level) - x;
          imageData.height = imageData.height || (texture.height >> level) - y;
          check$1(
            texture.type === imageData.type && texture.format === imageData.format && texture.internalformat === imageData.internalformat,
            "incompatible format for texture.subimage"
          );
          check$1(
            x >= 0 && y >= 0 && x + imageData.width <= texture.width && y + imageData.height <= texture.height,
            "texture.subimage write out of bounds"
          );
          check$1(
            texture.mipmask & 1 << level,
            "missing mipmap data"
          );
          check$1(
            imageData.data || imageData.element || imageData.needsCopy,
            "missing image data"
          );
          tempBind(texture);
          setSubImage(imageData, GL_TEXTURE_CUBE_MAP_POSITIVE_X$1 + face, x, y, level);
          tempRestore();
          freeImage(imageData);
          return reglTextureCube;
        }
        function resize(radius_) {
          var radius = radius_ | 0;
          if (radius === texture.width) {
            return;
          }
          reglTextureCube.width = texture.width = radius;
          reglTextureCube.height = texture.height = radius;
          tempBind(texture);
          for (var i = 0; i < 6; ++i) {
            for (var j = 0; texture.mipmask >> j; ++j) {
              gl.texImage2D(
                GL_TEXTURE_CUBE_MAP_POSITIVE_X$1 + i,
                j,
                texture.format,
                radius >> j,
                radius >> j,
                0,
                texture.format,
                texture.type,
                null
              );
            }
          }
          tempRestore();
          if (config.profile) {
            texture.stats.size = getTextureSize(
              texture.internalformat,
              texture.type,
              reglTextureCube.width,
              reglTextureCube.height,
              false,
              true
            );
          }
          return reglTextureCube;
        }
        reglTextureCube(a0, a1, a2, a3, a4, a5);
        reglTextureCube.subimage = subimage;
        reglTextureCube.resize = resize;
        reglTextureCube._reglType = "textureCube";
        reglTextureCube._texture = texture;
        if (config.profile) {
          reglTextureCube.stats = texture.stats;
        }
        reglTextureCube.destroy = function() {
          texture.decRef();
        };
        return reglTextureCube;
      }
      function destroyTextures() {
        for (var i = 0; i < numTexUnits; ++i) {
          gl.activeTexture(GL_TEXTURE0$1 + i);
          gl.bindTexture(GL_TEXTURE_2D$1, null);
          textureUnits[i] = null;
        }
        values(textureSet).forEach(destroy);
        stats2.cubeCount = 0;
        stats2.textureCount = 0;
      }
      if (config.profile) {
        stats2.getTotalTextureSize = function() {
          var total = 0;
          Object.keys(textureSet).forEach(function(key) {
            total += textureSet[key].stats.size;
          });
          return total;
        };
      }
      function restoreTextures() {
        for (var i = 0; i < numTexUnits; ++i) {
          var tex = textureUnits[i];
          if (tex) {
            tex.bindCount = 0;
            tex.unit = -1;
            textureUnits[i] = null;
          }
        }
        values(textureSet).forEach(function(texture) {
          texture.texture = gl.createTexture();
          gl.bindTexture(texture.target, texture.texture);
          for (var i2 = 0; i2 < 32; ++i2) {
            if ((texture.mipmask & 1 << i2) === 0) {
              continue;
            }
            if (texture.target === GL_TEXTURE_2D$1) {
              gl.texImage2D(
                GL_TEXTURE_2D$1,
                i2,
                texture.internalformat,
                texture.width >> i2,
                texture.height >> i2,
                0,
                texture.internalformat,
                texture.type,
                null
              );
            } else {
              for (var j = 0; j < 6; ++j) {
                gl.texImage2D(
                  GL_TEXTURE_CUBE_MAP_POSITIVE_X$1 + j,
                  i2,
                  texture.internalformat,
                  texture.width >> i2,
                  texture.height >> i2,
                  0,
                  texture.internalformat,
                  texture.type,
                  null
                );
              }
            }
          }
          setTexInfo(texture.texInfo, texture.target);
        });
      }
      function refreshTextures() {
        for (var i = 0; i < numTexUnits; ++i) {
          var tex = textureUnits[i];
          if (tex) {
            tex.bindCount = 0;
            tex.unit = -1;
            textureUnits[i] = null;
          }
          gl.activeTexture(GL_TEXTURE0$1 + i);
          gl.bindTexture(GL_TEXTURE_2D$1, null);
          gl.bindTexture(GL_TEXTURE_CUBE_MAP$1, null);
        }
      }
      return {
        create2D: createTexture2D,
        createCube: createTextureCube,
        clear: destroyTextures,
        getTexture: function(wrapper) {
          return null;
        },
        restore: restoreTextures,
        refresh: refreshTextures
      };
    }
    var GL_RENDERBUFFER = 36161;
    var GL_RGBA4$1 = 32854;
    var GL_RGB5_A1$1 = 32855;
    var GL_RGB565$1 = 36194;
    var GL_DEPTH_COMPONENT16 = 33189;
    var GL_STENCIL_INDEX8 = 36168;
    var GL_DEPTH_STENCIL$1 = 34041;
    var GL_SRGB8_ALPHA8_EXT = 35907;
    var GL_RGBA32F_EXT = 34836;
    var GL_RGBA16F_EXT = 34842;
    var GL_RGB16F_EXT = 34843;
    var FORMAT_SIZES = [];
    FORMAT_SIZES[GL_RGBA4$1] = 2;
    FORMAT_SIZES[GL_RGB5_A1$1] = 2;
    FORMAT_SIZES[GL_RGB565$1] = 2;
    FORMAT_SIZES[GL_DEPTH_COMPONENT16] = 2;
    FORMAT_SIZES[GL_STENCIL_INDEX8] = 1;
    FORMAT_SIZES[GL_DEPTH_STENCIL$1] = 4;
    FORMAT_SIZES[GL_SRGB8_ALPHA8_EXT] = 4;
    FORMAT_SIZES[GL_RGBA32F_EXT] = 16;
    FORMAT_SIZES[GL_RGBA16F_EXT] = 8;
    FORMAT_SIZES[GL_RGB16F_EXT] = 6;
    function getRenderbufferSize(format2, width, height) {
      return FORMAT_SIZES[format2] * width * height;
    }
    var wrapRenderbuffers = function(gl, extensions, limits, stats2, config) {
      var formatTypes2 = {
        "rgba4": GL_RGBA4$1,
        "rgb565": GL_RGB565$1,
        "rgb5 a1": GL_RGB5_A1$1,
        "depth": GL_DEPTH_COMPONENT16,
        "stencil": GL_STENCIL_INDEX8,
        "depth stencil": GL_DEPTH_STENCIL$1
      };
      if (extensions.ext_srgb) {
        formatTypes2["srgba"] = GL_SRGB8_ALPHA8_EXT;
      }
      if (extensions.ext_color_buffer_half_float) {
        formatTypes2["rgba16f"] = GL_RGBA16F_EXT;
        formatTypes2["rgb16f"] = GL_RGB16F_EXT;
      }
      if (extensions.webgl_color_buffer_float) {
        formatTypes2["rgba32f"] = GL_RGBA32F_EXT;
      }
      var formatTypesInvert = [];
      Object.keys(formatTypes2).forEach(function(key) {
        var val = formatTypes2[key];
        formatTypesInvert[val] = key;
      });
      var renderbufferCount = 0;
      var renderbufferSet = {};
      function REGLRenderbuffer(renderbuffer) {
        this.id = renderbufferCount++;
        this.refCount = 1;
        this.renderbuffer = renderbuffer;
        this.format = GL_RGBA4$1;
        this.width = 0;
        this.height = 0;
        if (config.profile) {
          this.stats = { size: 0 };
        }
      }
      REGLRenderbuffer.prototype.decRef = function() {
        if (--this.refCount <= 0) {
          destroy(this);
        }
      };
      function destroy(rb) {
        var handle = rb.renderbuffer;
        check$1(handle, "must not double destroy renderbuffer");
        gl.bindRenderbuffer(GL_RENDERBUFFER, null);
        gl.deleteRenderbuffer(handle);
        rb.renderbuffer = null;
        rb.refCount = 0;
        delete renderbufferSet[rb.id];
        stats2.renderbufferCount--;
      }
      function createRenderbuffer(a, b) {
        var renderbuffer = new REGLRenderbuffer(gl.createRenderbuffer());
        renderbufferSet[renderbuffer.id] = renderbuffer;
        stats2.renderbufferCount++;
        function reglRenderbuffer(a2, b2) {
          var w = 0;
          var h = 0;
          var format2 = GL_RGBA4$1;
          if (typeof a2 === "object" && a2) {
            var options = a2;
            if ("shape" in options) {
              var shape = options.shape;
              check$1(
                Array.isArray(shape) && shape.length >= 2,
                "invalid renderbuffer shape"
              );
              w = shape[0] | 0;
              h = shape[1] | 0;
            } else {
              if ("radius" in options) {
                w = h = options.radius | 0;
              }
              if ("width" in options) {
                w = options.width | 0;
              }
              if ("height" in options) {
                h = options.height | 0;
              }
            }
            if ("format" in options) {
              check$1.parameter(
                options.format,
                formatTypes2,
                "invalid renderbuffer format"
              );
              format2 = formatTypes2[options.format];
            }
          } else if (typeof a2 === "number") {
            w = a2 | 0;
            if (typeof b2 === "number") {
              h = b2 | 0;
            } else {
              h = w;
            }
          } else if (!a2) {
            w = h = 1;
          } else {
            check$1.raise("invalid arguments to renderbuffer constructor");
          }
          check$1(
            w > 0 && h > 0 && w <= limits.maxRenderbufferSize && h <= limits.maxRenderbufferSize,
            "invalid renderbuffer size"
          );
          if (w === renderbuffer.width && h === renderbuffer.height && format2 === renderbuffer.format) {
            return;
          }
          reglRenderbuffer.width = renderbuffer.width = w;
          reglRenderbuffer.height = renderbuffer.height = h;
          renderbuffer.format = format2;
          gl.bindRenderbuffer(GL_RENDERBUFFER, renderbuffer.renderbuffer);
          gl.renderbufferStorage(GL_RENDERBUFFER, format2, w, h);
          check$1(
            gl.getError() === 0,
            "invalid render buffer format"
          );
          if (config.profile) {
            renderbuffer.stats.size = getRenderbufferSize(renderbuffer.format, renderbuffer.width, renderbuffer.height);
          }
          reglRenderbuffer.format = formatTypesInvert[renderbuffer.format];
          return reglRenderbuffer;
        }
        function resize(w_, h_) {
          var w = w_ | 0;
          var h = h_ | 0 || w;
          if (w === renderbuffer.width && h === renderbuffer.height) {
            return reglRenderbuffer;
          }
          check$1(
            w > 0 && h > 0 && w <= limits.maxRenderbufferSize && h <= limits.maxRenderbufferSize,
            "invalid renderbuffer size"
          );
          reglRenderbuffer.width = renderbuffer.width = w;
          reglRenderbuffer.height = renderbuffer.height = h;
          gl.bindRenderbuffer(GL_RENDERBUFFER, renderbuffer.renderbuffer);
          gl.renderbufferStorage(GL_RENDERBUFFER, renderbuffer.format, w, h);
          check$1(
            gl.getError() === 0,
            "invalid render buffer format"
          );
          if (config.profile) {
            renderbuffer.stats.size = getRenderbufferSize(
              renderbuffer.format,
              renderbuffer.width,
              renderbuffer.height
            );
          }
          return reglRenderbuffer;
        }
        reglRenderbuffer(a, b);
        reglRenderbuffer.resize = resize;
        reglRenderbuffer._reglType = "renderbuffer";
        reglRenderbuffer._renderbuffer = renderbuffer;
        if (config.profile) {
          reglRenderbuffer.stats = renderbuffer.stats;
        }
        reglRenderbuffer.destroy = function() {
          renderbuffer.decRef();
        };
        return reglRenderbuffer;
      }
      if (config.profile) {
        stats2.getTotalRenderbufferSize = function() {
          var total = 0;
          Object.keys(renderbufferSet).forEach(function(key) {
            total += renderbufferSet[key].stats.size;
          });
          return total;
        };
      }
      function restoreRenderbuffers() {
        values(renderbufferSet).forEach(function(rb) {
          rb.renderbuffer = gl.createRenderbuffer();
          gl.bindRenderbuffer(GL_RENDERBUFFER, rb.renderbuffer);
          gl.renderbufferStorage(GL_RENDERBUFFER, rb.format, rb.width, rb.height);
        });
        gl.bindRenderbuffer(GL_RENDERBUFFER, null);
      }
      return {
        create: createRenderbuffer,
        clear: function() {
          values(renderbufferSet).forEach(destroy);
        },
        restore: restoreRenderbuffers
      };
    };
    var GL_FRAMEBUFFER$1 = 36160;
    var GL_RENDERBUFFER$1 = 36161;
    var GL_TEXTURE_2D$2 = 3553;
    var GL_TEXTURE_CUBE_MAP_POSITIVE_X$2 = 34069;
    var GL_COLOR_ATTACHMENT0$1 = 36064;
    var GL_DEPTH_ATTACHMENT = 36096;
    var GL_STENCIL_ATTACHMENT = 36128;
    var GL_DEPTH_STENCIL_ATTACHMENT = 33306;
    var GL_FRAMEBUFFER_COMPLETE$1 = 36053;
    var GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT = 36054;
    var GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 36055;
    var GL_FRAMEBUFFER_INCOMPLETE_DIMENSIONS = 36057;
    var GL_FRAMEBUFFER_UNSUPPORTED = 36061;
    var GL_HALF_FLOAT_OES$2 = 36193;
    var GL_UNSIGNED_BYTE$6 = 5121;
    var GL_FLOAT$5 = 5126;
    var GL_RGB$1 = 6407;
    var GL_RGBA$2 = 6408;
    var GL_DEPTH_COMPONENT$1 = 6402;
    var colorTextureFormatEnums = [
      GL_RGB$1,
      GL_RGBA$2
    ];
    var textureFormatChannels = [];
    textureFormatChannels[GL_RGBA$2] = 4;
    textureFormatChannels[GL_RGB$1] = 3;
    var textureTypeSizes = [];
    textureTypeSizes[GL_UNSIGNED_BYTE$6] = 1;
    textureTypeSizes[GL_FLOAT$5] = 4;
    textureTypeSizes[GL_HALF_FLOAT_OES$2] = 2;
    var GL_RGBA4$2 = 32854;
    var GL_RGB5_A1$2 = 32855;
    var GL_RGB565$2 = 36194;
    var GL_DEPTH_COMPONENT16$1 = 33189;
    var GL_STENCIL_INDEX8$1 = 36168;
    var GL_DEPTH_STENCIL$2 = 34041;
    var GL_SRGB8_ALPHA8_EXT$1 = 35907;
    var GL_RGBA32F_EXT$1 = 34836;
    var GL_RGBA16F_EXT$1 = 34842;
    var GL_RGB16F_EXT$1 = 34843;
    var colorRenderbufferFormatEnums = [
      GL_RGBA4$2,
      GL_RGB5_A1$2,
      GL_RGB565$2,
      GL_SRGB8_ALPHA8_EXT$1,
      GL_RGBA16F_EXT$1,
      GL_RGB16F_EXT$1,
      GL_RGBA32F_EXT$1
    ];
    var statusCode = {};
    statusCode[GL_FRAMEBUFFER_COMPLETE$1] = "complete";
    statusCode[GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT] = "incomplete attachment";
    statusCode[GL_FRAMEBUFFER_INCOMPLETE_DIMENSIONS] = "incomplete dimensions";
    statusCode[GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT] = "incomplete, missing attachment";
    statusCode[GL_FRAMEBUFFER_UNSUPPORTED] = "unsupported";
    function wrapFBOState(gl, extensions, limits, textureState, renderbufferState, stats2) {
      var framebufferState = {
        cur: null,
        next: null,
        dirty: false,
        setFBO: null
      };
      var colorTextureFormats = ["rgba"];
      var colorRenderbufferFormats = ["rgba4", "rgb565", "rgb5 a1"];
      if (extensions.ext_srgb) {
        colorRenderbufferFormats.push("srgba");
      }
      if (extensions.ext_color_buffer_half_float) {
        colorRenderbufferFormats.push("rgba16f", "rgb16f");
      }
      if (extensions.webgl_color_buffer_float) {
        colorRenderbufferFormats.push("rgba32f");
      }
      var colorTypes = ["uint8"];
      if (extensions.oes_texture_half_float) {
        colorTypes.push("half float", "float16");
      }
      if (extensions.oes_texture_float) {
        colorTypes.push("float", "float32");
      }
      function FramebufferAttachment(target, texture, renderbuffer) {
        this.target = target;
        this.texture = texture;
        this.renderbuffer = renderbuffer;
        var w = 0;
        var h = 0;
        if (texture) {
          w = texture.width;
          h = texture.height;
        } else if (renderbuffer) {
          w = renderbuffer.width;
          h = renderbuffer.height;
        }
        this.width = w;
        this.height = h;
      }
      function decRef(attachment) {
        if (attachment) {
          if (attachment.texture) {
            attachment.texture._texture.decRef();
          }
          if (attachment.renderbuffer) {
            attachment.renderbuffer._renderbuffer.decRef();
          }
        }
      }
      function incRefAndCheckShape(attachment, width, height) {
        if (!attachment) {
          return;
        }
        if (attachment.texture) {
          var texture = attachment.texture._texture;
          var tw = Math.max(1, texture.width);
          var th = Math.max(1, texture.height);
          check$1(
            tw === width && th === height,
            "inconsistent width/height for supplied texture"
          );
          texture.refCount += 1;
        } else {
          var renderbuffer = attachment.renderbuffer._renderbuffer;
          check$1(
            renderbuffer.width === width && renderbuffer.height === height,
            "inconsistent width/height for renderbuffer"
          );
          renderbuffer.refCount += 1;
        }
      }
      function attach(location, attachment) {
        if (attachment) {
          if (attachment.texture) {
            gl.framebufferTexture2D(
              GL_FRAMEBUFFER$1,
              location,
              attachment.target,
              attachment.texture._texture.texture,
              0
            );
          } else {
            gl.framebufferRenderbuffer(
              GL_FRAMEBUFFER$1,
              location,
              GL_RENDERBUFFER$1,
              attachment.renderbuffer._renderbuffer.renderbuffer
            );
          }
        }
      }
      function parseAttachment(attachment) {
        var target = GL_TEXTURE_2D$2;
        var texture = null;
        var renderbuffer = null;
        var data = attachment;
        if (typeof attachment === "object") {
          data = attachment.data;
          if ("target" in attachment) {
            target = attachment.target | 0;
          }
        }
        check$1.type(data, "function", "invalid attachment data");
        var type = data._reglType;
        if (type === "texture2d") {
          texture = data;
          check$1(target === GL_TEXTURE_2D$2);
        } else if (type === "textureCube") {
          texture = data;
          check$1(
            target >= GL_TEXTURE_CUBE_MAP_POSITIVE_X$2 && target < GL_TEXTURE_CUBE_MAP_POSITIVE_X$2 + 6,
            "invalid cube map target"
          );
        } else if (type === "renderbuffer") {
          renderbuffer = data;
          target = GL_RENDERBUFFER$1;
        } else {
          check$1.raise("invalid regl object for attachment");
        }
        return new FramebufferAttachment(target, texture, renderbuffer);
      }
      function allocAttachment(width, height, isTexture, format2, type) {
        if (isTexture) {
          var texture = textureState.create2D({
            width,
            height,
            format: format2,
            type
          });
          texture._texture.refCount = 0;
          return new FramebufferAttachment(GL_TEXTURE_2D$2, texture, null);
        } else {
          var rb = renderbufferState.create({
            width,
            height,
            format: format2
          });
          rb._renderbuffer.refCount = 0;
          return new FramebufferAttachment(GL_RENDERBUFFER$1, null, rb);
        }
      }
      function unwrapAttachment(attachment) {
        return attachment && (attachment.texture || attachment.renderbuffer);
      }
      function resizeAttachment(attachment, w, h) {
        if (attachment) {
          if (attachment.texture) {
            attachment.texture.resize(w, h);
          } else if (attachment.renderbuffer) {
            attachment.renderbuffer.resize(w, h);
          }
          attachment.width = w;
          attachment.height = h;
        }
      }
      var framebufferCount = 0;
      var framebufferSet = {};
      function REGLFramebuffer() {
        this.id = framebufferCount++;
        framebufferSet[this.id] = this;
        this.framebuffer = gl.createFramebuffer();
        this.width = 0;
        this.height = 0;
        this.colorAttachments = [];
        this.depthAttachment = null;
        this.stencilAttachment = null;
        this.depthStencilAttachment = null;
      }
      function decFBORefs(framebuffer) {
        framebuffer.colorAttachments.forEach(decRef);
        decRef(framebuffer.depthAttachment);
        decRef(framebuffer.stencilAttachment);
        decRef(framebuffer.depthStencilAttachment);
      }
      function destroy(framebuffer) {
        var handle = framebuffer.framebuffer;
        check$1(handle, "must not double destroy framebuffer");
        gl.deleteFramebuffer(handle);
        framebuffer.framebuffer = null;
        stats2.framebufferCount--;
        delete framebufferSet[framebuffer.id];
      }
      function updateFramebuffer(framebuffer) {
        var i;
        gl.bindFramebuffer(GL_FRAMEBUFFER$1, framebuffer.framebuffer);
        var colorAttachments = framebuffer.colorAttachments;
        for (i = 0; i < colorAttachments.length; ++i) {
          attach(GL_COLOR_ATTACHMENT0$1 + i, colorAttachments[i]);
        }
        for (i = colorAttachments.length; i < limits.maxColorAttachments; ++i) {
          gl.framebufferTexture2D(
            GL_FRAMEBUFFER$1,
            GL_COLOR_ATTACHMENT0$1 + i,
            GL_TEXTURE_2D$2,
            null,
            0
          );
        }
        gl.framebufferTexture2D(
          GL_FRAMEBUFFER$1,
          GL_DEPTH_STENCIL_ATTACHMENT,
          GL_TEXTURE_2D$2,
          null,
          0
        );
        gl.framebufferTexture2D(
          GL_FRAMEBUFFER$1,
          GL_DEPTH_ATTACHMENT,
          GL_TEXTURE_2D$2,
          null,
          0
        );
        gl.framebufferTexture2D(
          GL_FRAMEBUFFER$1,
          GL_STENCIL_ATTACHMENT,
          GL_TEXTURE_2D$2,
          null,
          0
        );
        attach(GL_DEPTH_ATTACHMENT, framebuffer.depthAttachment);
        attach(GL_STENCIL_ATTACHMENT, framebuffer.stencilAttachment);
        attach(GL_DEPTH_STENCIL_ATTACHMENT, framebuffer.depthStencilAttachment);
        var status = gl.checkFramebufferStatus(GL_FRAMEBUFFER$1);
        if (!gl.isContextLost() && status !== GL_FRAMEBUFFER_COMPLETE$1) {
          check$1.raise("framebuffer configuration not supported, status = " + statusCode[status]);
        }
        gl.bindFramebuffer(GL_FRAMEBUFFER$1, framebufferState.next ? framebufferState.next.framebuffer : null);
        framebufferState.cur = framebufferState.next;
        gl.getError();
      }
      function createFBO(a0, a1) {
        var framebuffer = new REGLFramebuffer();
        stats2.framebufferCount++;
        function reglFramebuffer(a, b) {
          var i;
          check$1(
            framebufferState.next !== framebuffer,
            "can not update framebuffer which is currently in use"
          );
          var width = 0;
          var height = 0;
          var needsDepth = true;
          var needsStencil = true;
          var colorBuffer = null;
          var colorTexture = true;
          var colorFormat = "rgba";
          var colorType = "uint8";
          var colorCount = 1;
          var depthBuffer = null;
          var stencilBuffer = null;
          var depthStencilBuffer = null;
          var depthStencilTexture = false;
          if (typeof a === "number") {
            width = a | 0;
            height = b | 0 || width;
          } else if (!a) {
            width = height = 1;
          } else {
            check$1.type(a, "object", "invalid arguments for framebuffer");
            var options = a;
            if ("shape" in options) {
              var shape = options.shape;
              check$1(
                Array.isArray(shape) && shape.length >= 2,
                "invalid shape for framebuffer"
              );
              width = shape[0];
              height = shape[1];
            } else {
              if ("radius" in options) {
                width = height = options.radius;
              }
              if ("width" in options) {
                width = options.width;
              }
              if ("height" in options) {
                height = options.height;
              }
            }
            if ("color" in options || "colors" in options) {
              colorBuffer = options.color || options.colors;
              if (Array.isArray(colorBuffer)) {
                check$1(
                  colorBuffer.length === 1 || extensions.webgl_draw_buffers,
                  "multiple render targets not supported"
                );
              }
            }
            if (!colorBuffer) {
              if ("colorCount" in options) {
                colorCount = options.colorCount | 0;
                check$1(colorCount > 0, "invalid color buffer count");
              }
              if ("colorTexture" in options) {
                colorTexture = !!options.colorTexture;
                colorFormat = "rgba4";
              }
              if ("colorType" in options) {
                colorType = options.colorType;
                if (!colorTexture) {
                  if (colorType === "half float" || colorType === "float16") {
                    check$1(
                      extensions.ext_color_buffer_half_float,
                      "you must enable EXT_color_buffer_half_float to use 16-bit render buffers"
                    );
                    colorFormat = "rgba16f";
                  } else if (colorType === "float" || colorType === "float32") {
                    check$1(
                      extensions.webgl_color_buffer_float,
                      "you must enable WEBGL_color_buffer_float in order to use 32-bit floating point renderbuffers"
                    );
                    colorFormat = "rgba32f";
                  }
                } else {
                  check$1(
                    extensions.oes_texture_float || !(colorType === "float" || colorType === "float32"),
                    "you must enable OES_texture_float in order to use floating point framebuffer objects"
                  );
                  check$1(
                    extensions.oes_texture_half_float || !(colorType === "half float" || colorType === "float16"),
                    "you must enable OES_texture_half_float in order to use 16-bit floating point framebuffer objects"
                  );
                }
                check$1.oneOf(colorType, colorTypes, "invalid color type");
              }
              if ("colorFormat" in options) {
                colorFormat = options.colorFormat;
                if (colorTextureFormats.indexOf(colorFormat) >= 0) {
                  colorTexture = true;
                } else if (colorRenderbufferFormats.indexOf(colorFormat) >= 0) {
                  colorTexture = false;
                } else {
                  check$1.optional(function() {
                    if (colorTexture) {
                      check$1.oneOf(
                        options.colorFormat,
                        colorTextureFormats,
                        "invalid color format for texture"
                      );
                    } else {
                      check$1.oneOf(
                        options.colorFormat,
                        colorRenderbufferFormats,
                        "invalid color format for renderbuffer"
                      );
                    }
                  });
                }
              }
            }
            if ("depthTexture" in options || "depthStencilTexture" in options) {
              depthStencilTexture = !!(options.depthTexture || options.depthStencilTexture);
              check$1(
                !depthStencilTexture || extensions.webgl_depth_texture,
                "webgl_depth_texture extension not supported"
              );
            }
            if ("depth" in options) {
              if (typeof options.depth === "boolean") {
                needsDepth = options.depth;
              } else {
                depthBuffer = options.depth;
                needsStencil = false;
              }
            }
            if ("stencil" in options) {
              if (typeof options.stencil === "boolean") {
                needsStencil = options.stencil;
              } else {
                stencilBuffer = options.stencil;
                needsDepth = false;
              }
            }
            if ("depthStencil" in options) {
              if (typeof options.depthStencil === "boolean") {
                needsDepth = needsStencil = options.depthStencil;
              } else {
                depthStencilBuffer = options.depthStencil;
                needsDepth = false;
                needsStencil = false;
              }
            }
          }
          var colorAttachments = null;
          var depthAttachment = null;
          var stencilAttachment = null;
          var depthStencilAttachment = null;
          if (Array.isArray(colorBuffer)) {
            colorAttachments = colorBuffer.map(parseAttachment);
          } else if (colorBuffer) {
            colorAttachments = [parseAttachment(colorBuffer)];
          } else {
            colorAttachments = new Array(colorCount);
            for (i = 0; i < colorCount; ++i) {
              colorAttachments[i] = allocAttachment(
                width,
                height,
                colorTexture,
                colorFormat,
                colorType
              );
            }
          }
          check$1(
            extensions.webgl_draw_buffers || colorAttachments.length <= 1,
            "you must enable the WEBGL_draw_buffers extension in order to use multiple color buffers."
          );
          check$1(
            colorAttachments.length <= limits.maxColorAttachments,
            "too many color attachments, not supported"
          );
          width = width || colorAttachments[0].width;
          height = height || colorAttachments[0].height;
          if (depthBuffer) {
            depthAttachment = parseAttachment(depthBuffer);
          } else if (needsDepth && !needsStencil) {
            depthAttachment = allocAttachment(
              width,
              height,
              depthStencilTexture,
              "depth",
              "uint32"
            );
          }
          if (stencilBuffer) {
            stencilAttachment = parseAttachment(stencilBuffer);
          } else if (needsStencil && !needsDepth) {
            stencilAttachment = allocAttachment(
              width,
              height,
              false,
              "stencil",
              "uint8"
            );
          }
          if (depthStencilBuffer) {
            depthStencilAttachment = parseAttachment(depthStencilBuffer);
          } else if (!depthBuffer && !stencilBuffer && needsStencil && needsDepth) {
            depthStencilAttachment = allocAttachment(
              width,
              height,
              depthStencilTexture,
              "depth stencil",
              "depth stencil"
            );
          }
          check$1(
            !!depthBuffer + !!stencilBuffer + !!depthStencilBuffer <= 1,
            "invalid framebuffer configuration, can specify exactly one depth/stencil attachment"
          );
          var commonColorAttachmentSize = null;
          for (i = 0; i < colorAttachments.length; ++i) {
            incRefAndCheckShape(colorAttachments[i], width, height);
            check$1(
              !colorAttachments[i] || colorAttachments[i].texture && colorTextureFormatEnums.indexOf(colorAttachments[i].texture._texture.format) >= 0 || colorAttachments[i].renderbuffer && colorRenderbufferFormatEnums.indexOf(colorAttachments[i].renderbuffer._renderbuffer.format) >= 0,
              "framebuffer color attachment " + i + " is invalid"
            );
            if (colorAttachments[i] && colorAttachments[i].texture) {
              var colorAttachmentSize = textureFormatChannels[colorAttachments[i].texture._texture.format] * textureTypeSizes[colorAttachments[i].texture._texture.type];
              if (commonColorAttachmentSize === null) {
                commonColorAttachmentSize = colorAttachmentSize;
              } else {
                check$1(
                  commonColorAttachmentSize === colorAttachmentSize,
                  "all color attachments much have the same number of bits per pixel."
                );
              }
            }
          }
          incRefAndCheckShape(depthAttachment, width, height);
          check$1(
            !depthAttachment || depthAttachment.texture && depthAttachment.texture._texture.format === GL_DEPTH_COMPONENT$1 || depthAttachment.renderbuffer && depthAttachment.renderbuffer._renderbuffer.format === GL_DEPTH_COMPONENT16$1,
            "invalid depth attachment for framebuffer object"
          );
          incRefAndCheckShape(stencilAttachment, width, height);
          check$1(
            !stencilAttachment || stencilAttachment.renderbuffer && stencilAttachment.renderbuffer._renderbuffer.format === GL_STENCIL_INDEX8$1,
            "invalid stencil attachment for framebuffer object"
          );
          incRefAndCheckShape(depthStencilAttachment, width, height);
          check$1(
            !depthStencilAttachment || depthStencilAttachment.texture && depthStencilAttachment.texture._texture.format === GL_DEPTH_STENCIL$2 || depthStencilAttachment.renderbuffer && depthStencilAttachment.renderbuffer._renderbuffer.format === GL_DEPTH_STENCIL$2,
            "invalid depth-stencil attachment for framebuffer object"
          );
          decFBORefs(framebuffer);
          framebuffer.width = width;
          framebuffer.height = height;
          framebuffer.colorAttachments = colorAttachments;
          framebuffer.depthAttachment = depthAttachment;
          framebuffer.stencilAttachment = stencilAttachment;
          framebuffer.depthStencilAttachment = depthStencilAttachment;
          reglFramebuffer.color = colorAttachments.map(unwrapAttachment);
          reglFramebuffer.depth = unwrapAttachment(depthAttachment);
          reglFramebuffer.stencil = unwrapAttachment(stencilAttachment);
          reglFramebuffer.depthStencil = unwrapAttachment(depthStencilAttachment);
          reglFramebuffer.width = framebuffer.width;
          reglFramebuffer.height = framebuffer.height;
          updateFramebuffer(framebuffer);
          return reglFramebuffer;
        }
        function resize(w_, h_) {
          check$1(
            framebufferState.next !== framebuffer,
            "can not resize a framebuffer which is currently in use"
          );
          var w = Math.max(w_ | 0, 1);
          var h = Math.max(h_ | 0 || w, 1);
          if (w === framebuffer.width && h === framebuffer.height) {
            return reglFramebuffer;
          }
          var colorAttachments = framebuffer.colorAttachments;
          for (var i = 0; i < colorAttachments.length; ++i) {
            resizeAttachment(colorAttachments[i], w, h);
          }
          resizeAttachment(framebuffer.depthAttachment, w, h);
          resizeAttachment(framebuffer.stencilAttachment, w, h);
          resizeAttachment(framebuffer.depthStencilAttachment, w, h);
          framebuffer.width = reglFramebuffer.width = w;
          framebuffer.height = reglFramebuffer.height = h;
          updateFramebuffer(framebuffer);
          return reglFramebuffer;
        }
        reglFramebuffer(a0, a1);
        return extend2(reglFramebuffer, {
          resize,
          _reglType: "framebuffer",
          _framebuffer: framebuffer,
          destroy: function() {
            destroy(framebuffer);
            decFBORefs(framebuffer);
          },
          use: function(block) {
            framebufferState.setFBO({
              framebuffer: reglFramebuffer
            }, block);
          }
        });
      }
      function createCubeFBO(options) {
        var faces = Array(6);
        function reglFramebufferCube(a) {
          var i;
          check$1(
            faces.indexOf(framebufferState.next) < 0,
            "can not update framebuffer which is currently in use"
          );
          var params = {
            color: null
          };
          var radius = 0;
          var colorBuffer = null;
          var colorFormat = "rgba";
          var colorType = "uint8";
          var colorCount = 1;
          if (typeof a === "number") {
            radius = a | 0;
          } else if (!a) {
            radius = 1;
          } else {
            check$1.type(a, "object", "invalid arguments for framebuffer");
            var options2 = a;
            if ("shape" in options2) {
              var shape = options2.shape;
              check$1(
                Array.isArray(shape) && shape.length >= 2,
                "invalid shape for framebuffer"
              );
              check$1(
                shape[0] === shape[1],
                "cube framebuffer must be square"
              );
              radius = shape[0];
            } else {
              if ("radius" in options2) {
                radius = options2.radius | 0;
              }
              if ("width" in options2) {
                radius = options2.width | 0;
                if ("height" in options2) {
                  check$1(options2.height === radius, "must be square");
                }
              } else if ("height" in options2) {
                radius = options2.height | 0;
              }
            }
            if ("color" in options2 || "colors" in options2) {
              colorBuffer = options2.color || options2.colors;
              if (Array.isArray(colorBuffer)) {
                check$1(
                  colorBuffer.length === 1 || extensions.webgl_draw_buffers,
                  "multiple render targets not supported"
                );
              }
            }
            if (!colorBuffer) {
              if ("colorCount" in options2) {
                colorCount = options2.colorCount | 0;
                check$1(colorCount > 0, "invalid color buffer count");
              }
              if ("colorType" in options2) {
                check$1.oneOf(
                  options2.colorType,
                  colorTypes,
                  "invalid color type"
                );
                colorType = options2.colorType;
              }
              if ("colorFormat" in options2) {
                colorFormat = options2.colorFormat;
                check$1.oneOf(
                  options2.colorFormat,
                  colorTextureFormats,
                  "invalid color format for texture"
                );
              }
            }
            if ("depth" in options2) {
              params.depth = options2.depth;
            }
            if ("stencil" in options2) {
              params.stencil = options2.stencil;
            }
            if ("depthStencil" in options2) {
              params.depthStencil = options2.depthStencil;
            }
          }
          var colorCubes;
          if (colorBuffer) {
            if (Array.isArray(colorBuffer)) {
              colorCubes = [];
              for (i = 0; i < colorBuffer.length; ++i) {
                colorCubes[i] = colorBuffer[i];
              }
            } else {
              colorCubes = [colorBuffer];
            }
          } else {
            colorCubes = Array(colorCount);
            var cubeMapParams = {
              radius,
              format: colorFormat,
              type: colorType
            };
            for (i = 0; i < colorCount; ++i) {
              colorCubes[i] = textureState.createCube(cubeMapParams);
            }
          }
          params.color = Array(colorCubes.length);
          for (i = 0; i < colorCubes.length; ++i) {
            var cube = colorCubes[i];
            check$1(
              typeof cube === "function" && cube._reglType === "textureCube",
              "invalid cube map"
            );
            radius = radius || cube.width;
            check$1(
              cube.width === radius && cube.height === radius,
              "invalid cube map shape"
            );
            params.color[i] = {
              target: GL_TEXTURE_CUBE_MAP_POSITIVE_X$2,
              data: colorCubes[i]
            };
          }
          for (i = 0; i < 6; ++i) {
            for (var j = 0; j < colorCubes.length; ++j) {
              params.color[j].target = GL_TEXTURE_CUBE_MAP_POSITIVE_X$2 + i;
            }
            if (i > 0) {
              params.depth = faces[0].depth;
              params.stencil = faces[0].stencil;
              params.depthStencil = faces[0].depthStencil;
            }
            if (faces[i]) {
              faces[i](params);
            } else {
              faces[i] = createFBO(params);
            }
          }
          return extend2(reglFramebufferCube, {
            width: radius,
            height: radius,
            color: colorCubes
          });
        }
        function resize(radius_) {
          var i;
          var radius = radius_ | 0;
          check$1(
            radius > 0 && radius <= limits.maxCubeMapSize,
            "invalid radius for cube fbo"
          );
          if (radius === reglFramebufferCube.width) {
            return reglFramebufferCube;
          }
          var colors2 = reglFramebufferCube.color;
          for (i = 0; i < colors2.length; ++i) {
            colors2[i].resize(radius);
          }
          for (i = 0; i < 6; ++i) {
            faces[i].resize(radius);
          }
          reglFramebufferCube.width = reglFramebufferCube.height = radius;
          return reglFramebufferCube;
        }
        reglFramebufferCube(options);
        return extend2(reglFramebufferCube, {
          faces,
          resize,
          _reglType: "framebufferCube",
          destroy: function() {
            faces.forEach(function(f) {
              f.destroy();
            });
          }
        });
      }
      function restoreFramebuffers() {
        framebufferState.cur = null;
        framebufferState.next = null;
        framebufferState.dirty = true;
        values(framebufferSet).forEach(function(fb) {
          fb.framebuffer = gl.createFramebuffer();
          updateFramebuffer(fb);
        });
      }
      return extend2(framebufferState, {
        getFramebuffer: function(object2) {
          if (typeof object2 === "function" && object2._reglType === "framebuffer") {
            var fbo = object2._framebuffer;
            if (fbo instanceof REGLFramebuffer) {
              return fbo;
            }
          }
          return null;
        },
        create: createFBO,
        createCube: createCubeFBO,
        clear: function() {
          values(framebufferSet).forEach(destroy);
        },
        restore: restoreFramebuffers
      });
    }
    var GL_FLOAT$6 = 5126;
    var GL_ARRAY_BUFFER$1 = 34962;
    var GL_ELEMENT_ARRAY_BUFFER$1 = 34963;
    var VAO_OPTIONS = [
      "attributes",
      "elements",
      "offset",
      "count",
      "primitive",
      "instances"
    ];
    function AttributeRecord() {
      this.state = 0;
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.w = 0;
      this.buffer = null;
      this.size = 0;
      this.normalized = false;
      this.type = GL_FLOAT$6;
      this.offset = 0;
      this.stride = 0;
      this.divisor = 0;
    }
    function wrapAttributeState(gl, extensions, limits, stats2, bufferState, elementState, drawState) {
      var NUM_ATTRIBUTES = limits.maxAttributes;
      var attributeBindings = new Array(NUM_ATTRIBUTES);
      for (var i = 0; i < NUM_ATTRIBUTES; ++i) {
        attributeBindings[i] = new AttributeRecord();
      }
      var vaoCount = 0;
      var vaoSet = {};
      var state = {
        Record: AttributeRecord,
        scope: {},
        state: attributeBindings,
        currentVAO: null,
        targetVAO: null,
        restore: extVAO() ? restoreVAO : function() {
        },
        createVAO,
        getVAO,
        destroyBuffer,
        setVAO: extVAO() ? setVAOEXT : setVAOEmulated,
        clear: extVAO() ? destroyVAOEXT : function() {
        }
      };
      function destroyBuffer(buffer) {
        for (var i2 = 0; i2 < attributeBindings.length; ++i2) {
          var record = attributeBindings[i2];
          if (record.buffer === buffer) {
            gl.disableVertexAttribArray(i2);
            record.buffer = null;
          }
        }
      }
      function extVAO() {
        return extensions.oes_vertex_array_object;
      }
      function extInstanced() {
        return extensions.angle_instanced_arrays;
      }
      function getVAO(vao) {
        if (typeof vao === "function" && vao._vao) {
          return vao._vao;
        }
        return null;
      }
      function setVAOEXT(vao) {
        if (vao === state.currentVAO) {
          return;
        }
        var ext = extVAO();
        if (vao) {
          ext.bindVertexArrayOES(vao.vao);
        } else {
          ext.bindVertexArrayOES(null);
        }
        state.currentVAO = vao;
      }
      function setVAOEmulated(vao) {
        if (vao === state.currentVAO) {
          return;
        }
        if (vao) {
          vao.bindAttrs();
        } else {
          var exti = extInstanced();
          for (var i2 = 0; i2 < attributeBindings.length; ++i2) {
            var binding = attributeBindings[i2];
            if (binding.buffer) {
              gl.enableVertexAttribArray(i2);
              binding.buffer.bind();
              gl.vertexAttribPointer(i2, binding.size, binding.type, binding.normalized, binding.stride, binding.offfset);
              if (exti && binding.divisor) {
                exti.vertexAttribDivisorANGLE(i2, binding.divisor);
              }
            } else {
              gl.disableVertexAttribArray(i2);
              gl.vertexAttrib4f(i2, binding.x, binding.y, binding.z, binding.w);
            }
          }
          if (drawState.elements) {
            gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER$1, drawState.elements.buffer.buffer);
          } else {
            gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER$1, null);
          }
        }
        state.currentVAO = vao;
      }
      function destroyVAOEXT() {
        values(vaoSet).forEach(function(vao) {
          vao.destroy();
        });
      }
      function REGLVAO() {
        this.id = ++vaoCount;
        this.attributes = [];
        this.elements = null;
        this.ownsElements = false;
        this.count = 0;
        this.offset = 0;
        this.instances = -1;
        this.primitive = 4;
        var extension = extVAO();
        if (extension) {
          this.vao = extension.createVertexArrayOES();
        } else {
          this.vao = null;
        }
        vaoSet[this.id] = this;
        this.buffers = [];
      }
      REGLVAO.prototype.bindAttrs = function() {
        var exti = extInstanced();
        var attributes = this.attributes;
        for (var i2 = 0; i2 < attributes.length; ++i2) {
          var attr = attributes[i2];
          if (attr.buffer) {
            gl.enableVertexAttribArray(i2);
            gl.bindBuffer(GL_ARRAY_BUFFER$1, attr.buffer.buffer);
            gl.vertexAttribPointer(i2, attr.size, attr.type, attr.normalized, attr.stride, attr.offset);
            if (exti && attr.divisor) {
              exti.vertexAttribDivisorANGLE(i2, attr.divisor);
            }
          } else {
            gl.disableVertexAttribArray(i2);
            gl.vertexAttrib4f(i2, attr.x, attr.y, attr.z, attr.w);
          }
        }
        for (var j = attributes.length; j < NUM_ATTRIBUTES; ++j) {
          gl.disableVertexAttribArray(j);
        }
        var elements = elementState.getElements(this.elements);
        if (elements) {
          gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER$1, elements.buffer.buffer);
        } else {
          gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER$1, null);
        }
      };
      REGLVAO.prototype.refresh = function() {
        var ext = extVAO();
        if (ext) {
          ext.bindVertexArrayOES(this.vao);
          this.bindAttrs();
          state.currentVAO = null;
          ext.bindVertexArrayOES(null);
        }
      };
      REGLVAO.prototype.destroy = function() {
        if (this.vao) {
          var extension = extVAO();
          if (this === state.currentVAO) {
            state.currentVAO = null;
            extension.bindVertexArrayOES(null);
          }
          extension.deleteVertexArrayOES(this.vao);
          this.vao = null;
        }
        if (this.ownsElements) {
          this.elements.destroy();
          this.elements = null;
          this.ownsElements = false;
        }
        if (vaoSet[this.id]) {
          delete vaoSet[this.id];
          stats2.vaoCount -= 1;
        }
      };
      function restoreVAO() {
        var ext = extVAO();
        if (ext) {
          values(vaoSet).forEach(function(vao) {
            vao.refresh();
          });
        }
      }
      function createVAO(_attr) {
        var vao = new REGLVAO();
        stats2.vaoCount += 1;
        function updateVAO(options) {
          var attributes;
          if (Array.isArray(options)) {
            attributes = options;
            if (vao.elements && vao.ownsElements) {
              vao.elements.destroy();
            }
            vao.elements = null;
            vao.ownsElements = false;
            vao.offset = 0;
            vao.count = 0;
            vao.instances = -1;
            vao.primitive = 4;
          } else {
            check$1(typeof options === "object", "invalid arguments for create vao");
            check$1("attributes" in options, "must specify attributes for vao");
            if (options.elements) {
              var elements = options.elements;
              if (vao.ownsElements) {
                if (typeof elements === "function" && elements._reglType === "elements") {
                  vao.elements.destroy();
                  vao.ownsElements = false;
                } else {
                  vao.elements(elements);
                  vao.ownsElements = false;
                }
              } else if (elementState.getElements(options.elements)) {
                vao.elements = options.elements;
                vao.ownsElements = false;
              } else {
                vao.elements = elementState.create(options.elements);
                vao.ownsElements = true;
              }
            } else {
              vao.elements = null;
              vao.ownsElements = false;
            }
            attributes = options.attributes;
            vao.offset = 0;
            vao.count = -1;
            vao.instances = -1;
            vao.primitive = 4;
            if (vao.elements) {
              vao.count = vao.elements._elements.vertCount;
              vao.primitive = vao.elements._elements.primType;
            }
            if ("offset" in options) {
              vao.offset = options.offset | 0;
            }
            if ("count" in options) {
              vao.count = options.count | 0;
            }
            if ("instances" in options) {
              vao.instances = options.instances | 0;
            }
            if ("primitive" in options) {
              check$1(options.primitive in primTypes, "bad primitive type: " + options.primitive);
              vao.primitive = primTypes[options.primitive];
            }
            check$1.optional(() => {
              var keys = Object.keys(options);
              for (var i3 = 0; i3 < keys.length; ++i3) {
                check$1(VAO_OPTIONS.indexOf(keys[i3]) >= 0, 'invalid option for vao: "' + keys[i3] + '" valid options are ' + VAO_OPTIONS);
              }
            });
            check$1(Array.isArray(attributes), "attributes must be an array");
          }
          check$1(attributes.length < NUM_ATTRIBUTES, "too many attributes");
          check$1(attributes.length > 0, "must specify at least one attribute");
          var bufUpdated = {};
          var nattributes = vao.attributes;
          nattributes.length = attributes.length;
          for (var i2 = 0; i2 < attributes.length; ++i2) {
            var spec = attributes[i2];
            var rec = nattributes[i2] = new AttributeRecord();
            var data = spec.data || spec;
            if (Array.isArray(data) || isTypedArray(data) || isNDArrayLike(data)) {
              var buf;
              if (vao.buffers[i2]) {
                buf = vao.buffers[i2];
                if (isTypedArray(data) && buf._buffer.byteLength >= data.byteLength) {
                  buf.subdata(data);
                } else {
                  buf.destroy();
                  vao.buffers[i2] = null;
                }
              }
              if (!vao.buffers[i2]) {
                buf = vao.buffers[i2] = bufferState.create(spec, GL_ARRAY_BUFFER$1, false, true);
              }
              rec.buffer = bufferState.getBuffer(buf);
              rec.size = rec.buffer.dimension | 0;
              rec.normalized = false;
              rec.type = rec.buffer.dtype;
              rec.offset = 0;
              rec.stride = 0;
              rec.divisor = 0;
              rec.state = 1;
              bufUpdated[i2] = 1;
            } else if (bufferState.getBuffer(spec)) {
              rec.buffer = bufferState.getBuffer(spec);
              rec.size = rec.buffer.dimension | 0;
              rec.normalized = false;
              rec.type = rec.buffer.dtype;
              rec.offset = 0;
              rec.stride = 0;
              rec.divisor = 0;
              rec.state = 1;
            } else if (bufferState.getBuffer(spec.buffer)) {
              rec.buffer = bufferState.getBuffer(spec.buffer);
              rec.size = (+spec.size || rec.buffer.dimension) | 0;
              rec.normalized = !!spec.normalized || false;
              if ("type" in spec) {
                check$1.parameter(spec.type, glTypes, "invalid buffer type");
                rec.type = glTypes[spec.type];
              } else {
                rec.type = rec.buffer.dtype;
              }
              rec.offset = (spec.offset || 0) | 0;
              rec.stride = (spec.stride || 0) | 0;
              rec.divisor = (spec.divisor || 0) | 0;
              rec.state = 1;
              check$1(rec.size >= 1 && rec.size <= 4, "size must be between 1 and 4");
              check$1(rec.offset >= 0, "invalid offset");
              check$1(rec.stride >= 0 && rec.stride <= 255, "stride must be between 0 and 255");
              check$1(rec.divisor >= 0, "divisor must be positive");
              check$1(!rec.divisor || !!extensions.angle_instanced_arrays, "ANGLE_instanced_arrays must be enabled to use divisor");
            } else if ("x" in spec) {
              check$1(i2 > 0, "first attribute must not be a constant");
              rec.x = +spec.x || 0;
              rec.y = +spec.y || 0;
              rec.z = +spec.z || 0;
              rec.w = +spec.w || 0;
              rec.state = 2;
            } else {
              check$1(false, "invalid attribute spec for location " + i2);
            }
          }
          for (var j = 0; j < vao.buffers.length; ++j) {
            if (!bufUpdated[j] && vao.buffers[j]) {
              vao.buffers[j].destroy();
              vao.buffers[j] = null;
            }
          }
          vao.refresh();
          return updateVAO;
        }
        updateVAO.destroy = function() {
          for (var j = 0; j < vao.buffers.length; ++j) {
            if (vao.buffers[j]) {
              vao.buffers[j].destroy();
            }
          }
          vao.buffers.length = 0;
          if (vao.ownsElements) {
            vao.elements.destroy();
            vao.elements = null;
            vao.ownsElements = false;
          }
          vao.destroy();
        };
        updateVAO._vao = vao;
        updateVAO._reglType = "vao";
        return updateVAO(_attr);
      }
      return state;
    }
    var GL_FRAGMENT_SHADER = 35632;
    var GL_VERTEX_SHADER = 35633;
    var GL_ACTIVE_UNIFORMS = 35718;
    var GL_ACTIVE_ATTRIBUTES = 35721;
    function wrapShaderState(gl, stringStore, stats2, config) {
      var fragShaders = {};
      var vertShaders = {};
      function ActiveInfo(name, id2, location, info) {
        this.name = name;
        this.id = id2;
        this.location = location;
        this.info = info;
      }
      function insertActiveInfo(list, info) {
        for (var i = 0; i < list.length; ++i) {
          if (list[i].id === info.id) {
            list[i].location = info.location;
            return;
          }
        }
        list.push(info);
      }
      function getShader(type, id2, command) {
        var cache = type === GL_FRAGMENT_SHADER ? fragShaders : vertShaders;
        var shader = cache[id2];
        if (!shader) {
          var source = stringStore.str(id2);
          shader = gl.createShader(type);
          gl.shaderSource(shader, source);
          gl.compileShader(shader);
          check$1.shaderError(gl, shader, source, type, command);
          cache[id2] = shader;
        }
        return shader;
      }
      var programCache = {};
      var programList = [];
      var PROGRAM_COUNTER = 0;
      function REGLProgram(fragId, vertId) {
        this.id = PROGRAM_COUNTER++;
        this.fragId = fragId;
        this.vertId = vertId;
        this.program = null;
        this.uniforms = [];
        this.attributes = [];
        this.refCount = 1;
        if (config.profile) {
          this.stats = {
            uniformsCount: 0,
            attributesCount: 0
          };
        }
      }
      function linkProgram(desc, command, attributeLocations) {
        var i, info;
        var fragShader = getShader(GL_FRAGMENT_SHADER, desc.fragId);
        var vertShader = getShader(GL_VERTEX_SHADER, desc.vertId);
        var program = desc.program = gl.createProgram();
        gl.attachShader(program, fragShader);
        gl.attachShader(program, vertShader);
        if (attributeLocations) {
          for (i = 0; i < attributeLocations.length; ++i) {
            var binding = attributeLocations[i];
            gl.bindAttribLocation(program, binding[0], binding[1]);
          }
        }
        gl.linkProgram(program);
        check$1.linkError(
          gl,
          program,
          stringStore.str(desc.fragId),
          stringStore.str(desc.vertId),
          command
        );
        var numUniforms = gl.getProgramParameter(program, GL_ACTIVE_UNIFORMS);
        if (config.profile) {
          desc.stats.uniformsCount = numUniforms;
        }
        var uniforms = desc.uniforms;
        for (i = 0; i < numUniforms; ++i) {
          info = gl.getActiveUniform(program, i);
          if (info) {
            if (info.size > 1) {
              for (var j = 0; j < info.size; ++j) {
                var name = info.name.replace("[0]", "[" + j + "]");
                insertActiveInfo(uniforms, new ActiveInfo(
                  name,
                  stringStore.id(name),
                  gl.getUniformLocation(program, name),
                  info
                ));
              }
            }
            var uniName = info.name;
            if (info.size > 1) {
              uniName = uniName.replace("[0]", "");
            }
            insertActiveInfo(uniforms, new ActiveInfo(
              uniName,
              stringStore.id(uniName),
              gl.getUniformLocation(program, uniName),
              info
            ));
          }
        }
        var numAttributes = gl.getProgramParameter(program, GL_ACTIVE_ATTRIBUTES);
        if (config.profile) {
          desc.stats.attributesCount = numAttributes;
        }
        var attributes = desc.attributes;
        for (i = 0; i < numAttributes; ++i) {
          info = gl.getActiveAttrib(program, i);
          if (info) {
            insertActiveInfo(attributes, new ActiveInfo(
              info.name,
              stringStore.id(info.name),
              gl.getAttribLocation(program, info.name),
              info
            ));
          }
        }
      }
      if (config.profile) {
        stats2.getMaxUniformsCount = function() {
          var m = 0;
          programList.forEach(function(desc) {
            if (desc.stats.uniformsCount > m) {
              m = desc.stats.uniformsCount;
            }
          });
          return m;
        };
        stats2.getMaxAttributesCount = function() {
          var m = 0;
          programList.forEach(function(desc) {
            if (desc.stats.attributesCount > m) {
              m = desc.stats.attributesCount;
            }
          });
          return m;
        };
      }
      function restoreShaders() {
        fragShaders = {};
        vertShaders = {};
        for (var i = 0; i < programList.length; ++i) {
          linkProgram(programList[i], null, programList[i].attributes.map(function(info) {
            return [info.location, info.name];
          }));
        }
      }
      return {
        clear: function() {
          var deleteShader = gl.deleteShader.bind(gl);
          values(fragShaders).forEach(deleteShader);
          fragShaders = {};
          values(vertShaders).forEach(deleteShader);
          vertShaders = {};
          programList.forEach(function(desc) {
            gl.deleteProgram(desc.program);
          });
          programList.length = 0;
          programCache = {};
          stats2.shaderCount = 0;
        },
        program: function(vertId, fragId, command, attribLocations) {
          check$1.command(vertId >= 0, "missing vertex shader", command);
          check$1.command(fragId >= 0, "missing fragment shader", command);
          var cache = programCache[fragId];
          if (!cache) {
            cache = programCache[fragId] = {};
          }
          var prevProgram = cache[vertId];
          if (prevProgram) {
            prevProgram.refCount++;
            if (!attribLocations) {
              return prevProgram;
            }
          }
          var program = new REGLProgram(fragId, vertId);
          stats2.shaderCount++;
          linkProgram(program, command, attribLocations);
          if (!prevProgram) {
            cache[vertId] = program;
          }
          programList.push(program);
          return extend2(program, {
            destroy: function() {
              program.refCount--;
              if (program.refCount <= 0) {
                gl.deleteProgram(program.program);
                var idx = programList.indexOf(program);
                programList.splice(idx, 1);
                stats2.shaderCount--;
              }
              if (cache[program.vertId].refCount <= 0) {
                gl.deleteShader(vertShaders[program.vertId]);
                delete vertShaders[program.vertId];
                delete programCache[program.fragId][program.vertId];
              }
              if (!Object.keys(programCache[program.fragId]).length) {
                gl.deleteShader(fragShaders[program.fragId]);
                delete fragShaders[program.fragId];
                delete programCache[program.fragId];
              }
            }
          });
        },
        restore: restoreShaders,
        shader: getShader,
        frag: -1,
        vert: -1
      };
    }
    var GL_RGBA$3 = 6408;
    var GL_UNSIGNED_BYTE$7 = 5121;
    var GL_PACK_ALIGNMENT = 3333;
    var GL_FLOAT$7 = 5126;
    function wrapReadPixels(gl, framebufferState, reglPoll, context2, glAttributes, extensions, limits) {
      function readPixelsImpl(input) {
        var type;
        if (framebufferState.next === null) {
          check$1(
            glAttributes.preserveDrawingBuffer,
            'you must create a webgl context with "preserveDrawingBuffer":true in order to read pixels from the drawing buffer'
          );
          type = GL_UNSIGNED_BYTE$7;
        } else {
          check$1(
            framebufferState.next.colorAttachments[0].texture !== null,
            "You cannot read from a renderbuffer"
          );
          type = framebufferState.next.colorAttachments[0].texture._texture.type;
          check$1.optional(function() {
            if (extensions.oes_texture_float) {
              check$1(
                type === GL_UNSIGNED_BYTE$7 || type === GL_FLOAT$7,
                "Reading from a framebuffer is only allowed for the types 'uint8' and 'float'"
              );
              if (type === GL_FLOAT$7) {
                check$1(limits.readFloat, "Reading 'float' values is not permitted in your browser. For a fallback, please see: https://www.npmjs.com/package/glsl-read-float");
              }
            } else {
              check$1(
                type === GL_UNSIGNED_BYTE$7,
                "Reading from a framebuffer is only allowed for the type 'uint8'"
              );
            }
          });
        }
        var x = 0;
        var y = 0;
        var width = context2.framebufferWidth;
        var height = context2.framebufferHeight;
        var data = null;
        if (isTypedArray(input)) {
          data = input;
        } else if (input) {
          check$1.type(input, "object", "invalid arguments to regl.read()");
          x = input.x | 0;
          y = input.y | 0;
          check$1(
            x >= 0 && x < context2.framebufferWidth,
            "invalid x offset for regl.read"
          );
          check$1(
            y >= 0 && y < context2.framebufferHeight,
            "invalid y offset for regl.read"
          );
          width = (input.width || context2.framebufferWidth - x) | 0;
          height = (input.height || context2.framebufferHeight - y) | 0;
          data = input.data || null;
        }
        if (data) {
          if (type === GL_UNSIGNED_BYTE$7) {
            check$1(
              data instanceof Uint8Array,
              "buffer must be 'Uint8Array' when reading from a framebuffer of type 'uint8'"
            );
          } else if (type === GL_FLOAT$7) {
            check$1(
              data instanceof Float32Array,
              "buffer must be 'Float32Array' when reading from a framebuffer of type 'float'"
            );
          }
        }
        check$1(
          width > 0 && width + x <= context2.framebufferWidth,
          "invalid width for read pixels"
        );
        check$1(
          height > 0 && height + y <= context2.framebufferHeight,
          "invalid height for read pixels"
        );
        reglPoll();
        var size = width * height * 4;
        if (!data) {
          if (type === GL_UNSIGNED_BYTE$7) {
            data = new Uint8Array(size);
          } else if (type === GL_FLOAT$7) {
            data = data || new Float32Array(size);
          }
        }
        check$1.isTypedArray(data, "data buffer for regl.read() must be a typedarray");
        check$1(data.byteLength >= size, "data buffer for regl.read() too small");
        gl.pixelStorei(GL_PACK_ALIGNMENT, 4);
        gl.readPixels(
          x,
          y,
          width,
          height,
          GL_RGBA$3,
          type,
          data
        );
        return data;
      }
      function readPixelsFBO(options) {
        var result;
        framebufferState.setFBO({
          framebuffer: options.framebuffer
        }, function() {
          result = readPixelsImpl(options);
        });
        return result;
      }
      function readPixels(options) {
        if (!options || !("framebuffer" in options)) {
          return readPixelsImpl(options);
        } else {
          return readPixelsFBO(options);
        }
      }
      return readPixels;
    }
    function slice(x) {
      return Array.prototype.slice.call(x);
    }
    function join(x) {
      return slice(x).join("");
    }
    function createEnvironment() {
      var varCounter = 0;
      var linkedNames = [];
      var linkedValues = [];
      function link2(value) {
        for (var i = 0; i < linkedValues.length; ++i) {
          if (linkedValues[i] === value) {
            return linkedNames[i];
          }
        }
        var name = "g" + varCounter++;
        linkedNames.push(name);
        linkedValues.push(value);
        return name;
      }
      function block() {
        var code = [];
        function push() {
          code.push.apply(code, slice(arguments));
        }
        var vars = [];
        function def() {
          var name = "v" + varCounter++;
          vars.push(name);
          if (arguments.length > 0) {
            code.push(name, "=");
            code.push.apply(code, slice(arguments));
            code.push(";");
          }
          return name;
        }
        return extend2(push, {
          def,
          toString: function() {
            return join([
              vars.length > 0 ? "var " + vars.join(",") + ";" : "",
              join(code)
            ]);
          }
        });
      }
      function scope() {
        var entry = block();
        var exit = block();
        var entryToString = entry.toString;
        var exitToString = exit.toString;
        function save(object2, prop) {
          exit(object2, prop, "=", entry.def(object2, prop), ";");
        }
        return extend2(function() {
          entry.apply(entry, slice(arguments));
        }, {
          def: entry.def,
          entry,
          exit,
          save,
          set: function(object2, prop, value) {
            save(object2, prop);
            entry(object2, prop, "=", value, ";");
          },
          toString: function() {
            return entryToString() + exitToString();
          }
        });
      }
      function conditional() {
        var pred = join(arguments);
        var thenBlock = scope();
        var elseBlock = scope();
        var thenToString = thenBlock.toString;
        var elseToString = elseBlock.toString;
        return extend2(thenBlock, {
          then: function() {
            thenBlock.apply(thenBlock, slice(arguments));
            return this;
          },
          else: function() {
            elseBlock.apply(elseBlock, slice(arguments));
            return this;
          },
          toString: function() {
            var elseClause = elseToString();
            if (elseClause) {
              elseClause = "else{" + elseClause + "}";
            }
            return join([
              "if(",
              pred,
              "){",
              thenToString(),
              "}",
              elseClause
            ]);
          }
        });
      }
      var globalBlock = block();
      var procedures = {};
      function proc(name, count) {
        var args = [];
        function arg() {
          var name2 = "a" + args.length;
          args.push(name2);
          return name2;
        }
        count = count || 0;
        for (var i = 0; i < count; ++i) {
          arg();
        }
        var body = scope();
        var bodyToString = body.toString;
        var result = procedures[name] = extend2(body, {
          arg,
          toString: function() {
            return join([
              "function(",
              args.join(),
              "){",
              bodyToString(),
              "}"
            ]);
          }
        });
        return result;
      }
      function compile() {
        var code = [
          '"use strict";',
          globalBlock,
          "return {"
        ];
        Object.keys(procedures).forEach(function(name) {
          code.push('"', name, '":', procedures[name].toString(), ",");
        });
        code.push("}");
        var src = join(code).replace(/;/g, ";\n").replace(/}/g, "}\n").replace(/{/g, "{\n");
        var proc2 = Function.apply(null, linkedNames.concat(src));
        return proc2.apply(null, linkedValues);
      }
      return {
        global: globalBlock,
        link: link2,
        block,
        proc,
        scope,
        cond: conditional,
        compile
      };
    }
    var CUTE_COMPONENTS = "xyzw".split("");
    var GL_UNSIGNED_BYTE$8 = 5121;
    var ATTRIB_STATE_POINTER = 1;
    var ATTRIB_STATE_CONSTANT = 2;
    var DYN_FUNC$1 = 0;
    var DYN_PROP$1 = 1;
    var DYN_CONTEXT$1 = 2;
    var DYN_STATE$1 = 3;
    var DYN_THUNK = 4;
    var DYN_CONSTANT$1 = 5;
    var DYN_ARRAY$1 = 6;
    var S_DITHER = "dither";
    var S_BLEND_ENABLE = "blend.enable";
    var S_BLEND_COLOR = "blend.color";
    var S_BLEND_EQUATION = "blend.equation";
    var S_BLEND_FUNC = "blend.func";
    var S_DEPTH_ENABLE = "depth.enable";
    var S_DEPTH_FUNC = "depth.func";
    var S_DEPTH_RANGE = "depth.range";
    var S_DEPTH_MASK = "depth.mask";
    var S_COLOR_MASK = "colorMask";
    var S_CULL_ENABLE = "cull.enable";
    var S_CULL_FACE = "cull.face";
    var S_FRONT_FACE = "frontFace";
    var S_LINE_WIDTH = "lineWidth";
    var S_POLYGON_OFFSET_ENABLE = "polygonOffset.enable";
    var S_POLYGON_OFFSET_OFFSET = "polygonOffset.offset";
    var S_SAMPLE_ALPHA = "sample.alpha";
    var S_SAMPLE_ENABLE = "sample.enable";
    var S_SAMPLE_COVERAGE = "sample.coverage";
    var S_STENCIL_ENABLE = "stencil.enable";
    var S_STENCIL_MASK = "stencil.mask";
    var S_STENCIL_FUNC = "stencil.func";
    var S_STENCIL_OPFRONT = "stencil.opFront";
    var S_STENCIL_OPBACK = "stencil.opBack";
    var S_SCISSOR_ENABLE = "scissor.enable";
    var S_SCISSOR_BOX = "scissor.box";
    var S_VIEWPORT = "viewport";
    var S_PROFILE = "profile";
    var S_FRAMEBUFFER = "framebuffer";
    var S_VERT = "vert";
    var S_FRAG = "frag";
    var S_ELEMENTS = "elements";
    var S_PRIMITIVE = "primitive";
    var S_COUNT = "count";
    var S_OFFSET = "offset";
    var S_INSTANCES = "instances";
    var S_VAO = "vao";
    var SUFFIX_WIDTH = "Width";
    var SUFFIX_HEIGHT = "Height";
    var S_FRAMEBUFFER_WIDTH = S_FRAMEBUFFER + SUFFIX_WIDTH;
    var S_FRAMEBUFFER_HEIGHT = S_FRAMEBUFFER + SUFFIX_HEIGHT;
    var S_VIEWPORT_WIDTH = S_VIEWPORT + SUFFIX_WIDTH;
    var S_VIEWPORT_HEIGHT = S_VIEWPORT + SUFFIX_HEIGHT;
    var S_DRAWINGBUFFER = "drawingBuffer";
    var S_DRAWINGBUFFER_WIDTH = S_DRAWINGBUFFER + SUFFIX_WIDTH;
    var S_DRAWINGBUFFER_HEIGHT = S_DRAWINGBUFFER + SUFFIX_HEIGHT;
    var NESTED_OPTIONS = [
      S_BLEND_FUNC,
      S_BLEND_EQUATION,
      S_STENCIL_FUNC,
      S_STENCIL_OPFRONT,
      S_STENCIL_OPBACK,
      S_SAMPLE_COVERAGE,
      S_VIEWPORT,
      S_SCISSOR_BOX,
      S_POLYGON_OFFSET_OFFSET
    ];
    var GL_ARRAY_BUFFER$2 = 34962;
    var GL_ELEMENT_ARRAY_BUFFER$2 = 34963;
    var GL_FRAGMENT_SHADER$1 = 35632;
    var GL_VERTEX_SHADER$1 = 35633;
    var GL_TEXTURE_2D$3 = 3553;
    var GL_TEXTURE_CUBE_MAP$2 = 34067;
    var GL_CULL_FACE = 2884;
    var GL_BLEND = 3042;
    var GL_DITHER = 3024;
    var GL_STENCIL_TEST = 2960;
    var GL_DEPTH_TEST = 2929;
    var GL_SCISSOR_TEST = 3089;
    var GL_POLYGON_OFFSET_FILL = 32823;
    var GL_SAMPLE_ALPHA_TO_COVERAGE = 32926;
    var GL_SAMPLE_COVERAGE = 32928;
    var GL_FLOAT$8 = 5126;
    var GL_FLOAT_VEC2 = 35664;
    var GL_FLOAT_VEC3 = 35665;
    var GL_FLOAT_VEC4 = 35666;
    var GL_INT$3 = 5124;
    var GL_INT_VEC2 = 35667;
    var GL_INT_VEC3 = 35668;
    var GL_INT_VEC4 = 35669;
    var GL_BOOL = 35670;
    var GL_BOOL_VEC2 = 35671;
    var GL_BOOL_VEC3 = 35672;
    var GL_BOOL_VEC4 = 35673;
    var GL_FLOAT_MAT2 = 35674;
    var GL_FLOAT_MAT3 = 35675;
    var GL_FLOAT_MAT4 = 35676;
    var GL_SAMPLER_2D = 35678;
    var GL_SAMPLER_CUBE = 35680;
    var GL_TRIANGLES$1 = 4;
    var GL_FRONT = 1028;
    var GL_BACK = 1029;
    var GL_CW = 2304;
    var GL_CCW = 2305;
    var GL_MIN_EXT = 32775;
    var GL_MAX_EXT = 32776;
    var GL_ALWAYS = 519;
    var GL_KEEP = 7680;
    var GL_ZERO = 0;
    var GL_ONE = 1;
    var GL_FUNC_ADD = 32774;
    var GL_LESS = 513;
    var GL_FRAMEBUFFER$2 = 36160;
    var GL_COLOR_ATTACHMENT0$2 = 36064;
    var blendFuncs = {
      "0": 0,
      "1": 1,
      "zero": 0,
      "one": 1,
      "src color": 768,
      "one minus src color": 769,
      "src alpha": 770,
      "one minus src alpha": 771,
      "dst color": 774,
      "one minus dst color": 775,
      "dst alpha": 772,
      "one minus dst alpha": 773,
      "constant color": 32769,
      "one minus constant color": 32770,
      "constant alpha": 32771,
      "one minus constant alpha": 32772,
      "src alpha saturate": 776
    };
    var invalidBlendCombinations = [
      "constant color, constant alpha",
      "one minus constant color, constant alpha",
      "constant color, one minus constant alpha",
      "one minus constant color, one minus constant alpha",
      "constant alpha, constant color",
      "constant alpha, one minus constant color",
      "one minus constant alpha, constant color",
      "one minus constant alpha, one minus constant color"
    ];
    var compareFuncs = {
      "never": 512,
      "less": 513,
      "<": 513,
      "equal": 514,
      "=": 514,
      "==": 514,
      "===": 514,
      "lequal": 515,
      "<=": 515,
      "greater": 516,
      ">": 516,
      "notequal": 517,
      "!=": 517,
      "!==": 517,
      "gequal": 518,
      ">=": 518,
      "always": 519
    };
    var stencilOps = {
      "0": 0,
      "zero": 0,
      "keep": 7680,
      "replace": 7681,
      "increment": 7682,
      "decrement": 7683,
      "increment wrap": 34055,
      "decrement wrap": 34056,
      "invert": 5386
    };
    var shaderType = {
      "frag": GL_FRAGMENT_SHADER$1,
      "vert": GL_VERTEX_SHADER$1
    };
    var orientationType = {
      "cw": GL_CW,
      "ccw": GL_CCW
    };
    function isBufferArgs(x) {
      return Array.isArray(x) || isTypedArray(x) || isNDArrayLike(x);
    }
    function sortState(state) {
      return state.sort(function(a, b) {
        if (a === S_VIEWPORT) {
          return -1;
        } else if (b === S_VIEWPORT) {
          return 1;
        }
        return a < b ? -1 : 1;
      });
    }
    function Declaration(thisDep, contextDep, propDep, append2) {
      this.thisDep = thisDep;
      this.contextDep = contextDep;
      this.propDep = propDep;
      this.append = append2;
    }
    function isStatic(decl) {
      return decl && !(decl.thisDep || decl.contextDep || decl.propDep);
    }
    function createStaticDecl(append2) {
      return new Declaration(false, false, false, append2);
    }
    function createDynamicDecl(dyn, append2) {
      var type = dyn.type;
      if (type === DYN_FUNC$1) {
        var numArgs = dyn.data.length;
        return new Declaration(
          true,
          numArgs >= 1,
          numArgs >= 2,
          append2
        );
      } else if (type === DYN_THUNK) {
        var data = dyn.data;
        return new Declaration(
          data.thisDep,
          data.contextDep,
          data.propDep,
          append2
        );
      } else if (type === DYN_CONSTANT$1) {
        return new Declaration(
          false,
          false,
          false,
          append2
        );
      } else if (type === DYN_ARRAY$1) {
        var thisDep = false;
        var contextDep = false;
        var propDep = false;
        for (var i = 0; i < dyn.data.length; ++i) {
          var subDyn = dyn.data[i];
          if (subDyn.type === DYN_PROP$1) {
            propDep = true;
          } else if (subDyn.type === DYN_CONTEXT$1) {
            contextDep = true;
          } else if (subDyn.type === DYN_STATE$1) {
            thisDep = true;
          } else if (subDyn.type === DYN_FUNC$1) {
            thisDep = true;
            var subArgs = subDyn.data;
            if (subArgs >= 1) {
              contextDep = true;
            }
            if (subArgs >= 2) {
              propDep = true;
            }
          } else if (subDyn.type === DYN_THUNK) {
            thisDep = thisDep || subDyn.data.thisDep;
            contextDep = contextDep || subDyn.data.contextDep;
            propDep = propDep || subDyn.data.propDep;
          }
        }
        return new Declaration(
          thisDep,
          contextDep,
          propDep,
          append2
        );
      } else {
        return new Declaration(
          type === DYN_STATE$1,
          type === DYN_CONTEXT$1,
          type === DYN_PROP$1,
          append2
        );
      }
    }
    var SCOPE_DECL = new Declaration(false, false, false, function() {
    });
    function reglCore(gl, stringStore, extensions, limits, bufferState, elementState, textureState, framebufferState, uniformState, attributeState, shaderState, drawState, contextState, timer2, config) {
      var AttributeRecord2 = attributeState.Record;
      var blendEquations = {
        "add": 32774,
        "subtract": 32778,
        "reverse subtract": 32779
      };
      if (extensions.ext_blend_minmax) {
        blendEquations.min = GL_MIN_EXT;
        blendEquations.max = GL_MAX_EXT;
      }
      var extInstancing = extensions.angle_instanced_arrays;
      var extDrawBuffers = extensions.webgl_draw_buffers;
      var extVertexArrays = extensions.oes_vertex_array_object;
      var currentState = {
        dirty: true,
        profile: config.profile
      };
      var nextState = {};
      var GL_STATE_NAMES = [];
      var GL_FLAGS = {};
      var GL_VARIABLES = {};
      function propName(name) {
        return name.replace(".", "_");
      }
      function stateFlag(sname, cap, init2) {
        var name = propName(sname);
        GL_STATE_NAMES.push(sname);
        nextState[name] = currentState[name] = !!init2;
        GL_FLAGS[name] = cap;
      }
      function stateVariable(sname, func, init2) {
        var name = propName(sname);
        GL_STATE_NAMES.push(sname);
        if (Array.isArray(init2)) {
          currentState[name] = init2.slice();
          nextState[name] = init2.slice();
        } else {
          currentState[name] = nextState[name] = init2;
        }
        GL_VARIABLES[name] = func;
      }
      stateFlag(S_DITHER, GL_DITHER);
      stateFlag(S_BLEND_ENABLE, GL_BLEND);
      stateVariable(S_BLEND_COLOR, "blendColor", [0, 0, 0, 0]);
      stateVariable(
        S_BLEND_EQUATION,
        "blendEquationSeparate",
        [GL_FUNC_ADD, GL_FUNC_ADD]
      );
      stateVariable(
        S_BLEND_FUNC,
        "blendFuncSeparate",
        [GL_ONE, GL_ZERO, GL_ONE, GL_ZERO]
      );
      stateFlag(S_DEPTH_ENABLE, GL_DEPTH_TEST, true);
      stateVariable(S_DEPTH_FUNC, "depthFunc", GL_LESS);
      stateVariable(S_DEPTH_RANGE, "depthRange", [0, 1]);
      stateVariable(S_DEPTH_MASK, "depthMask", true);
      stateVariable(S_COLOR_MASK, S_COLOR_MASK, [true, true, true, true]);
      stateFlag(S_CULL_ENABLE, GL_CULL_FACE);
      stateVariable(S_CULL_FACE, "cullFace", GL_BACK);
      stateVariable(S_FRONT_FACE, S_FRONT_FACE, GL_CCW);
      stateVariable(S_LINE_WIDTH, S_LINE_WIDTH, 1);
      stateFlag(S_POLYGON_OFFSET_ENABLE, GL_POLYGON_OFFSET_FILL);
      stateVariable(S_POLYGON_OFFSET_OFFSET, "polygonOffset", [0, 0]);
      stateFlag(S_SAMPLE_ALPHA, GL_SAMPLE_ALPHA_TO_COVERAGE);
      stateFlag(S_SAMPLE_ENABLE, GL_SAMPLE_COVERAGE);
      stateVariable(S_SAMPLE_COVERAGE, "sampleCoverage", [1, false]);
      stateFlag(S_STENCIL_ENABLE, GL_STENCIL_TEST);
      stateVariable(S_STENCIL_MASK, "stencilMask", -1);
      stateVariable(S_STENCIL_FUNC, "stencilFunc", [GL_ALWAYS, 0, -1]);
      stateVariable(
        S_STENCIL_OPFRONT,
        "stencilOpSeparate",
        [GL_FRONT, GL_KEEP, GL_KEEP, GL_KEEP]
      );
      stateVariable(
        S_STENCIL_OPBACK,
        "stencilOpSeparate",
        [GL_BACK, GL_KEEP, GL_KEEP, GL_KEEP]
      );
      stateFlag(S_SCISSOR_ENABLE, GL_SCISSOR_TEST);
      stateVariable(
        S_SCISSOR_BOX,
        "scissor",
        [0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight]
      );
      stateVariable(
        S_VIEWPORT,
        S_VIEWPORT,
        [0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight]
      );
      var sharedState = {
        gl,
        context: contextState,
        strings: stringStore,
        next: nextState,
        current: currentState,
        draw: drawState,
        elements: elementState,
        buffer: bufferState,
        shader: shaderState,
        attributes: attributeState.state,
        vao: attributeState,
        uniforms: uniformState,
        framebuffer: framebufferState,
        extensions,
        timer: timer2,
        isBufferArgs
      };
      var sharedConstants = {
        primTypes,
        compareFuncs,
        blendFuncs,
        blendEquations,
        stencilOps,
        glTypes,
        orientationType
      };
      check$1.optional(function() {
        sharedState.isArrayLike = isArrayLike;
      });
      if (extDrawBuffers) {
        sharedConstants.backBuffer = [GL_BACK];
        sharedConstants.drawBuffer = loop(limits.maxDrawbuffers, function(i) {
          if (i === 0) {
            return [0];
          }
          return loop(i, function(j) {
            return GL_COLOR_ATTACHMENT0$2 + j;
          });
        });
      }
      var drawCallCounter = 0;
      function createREGLEnvironment() {
        var env = createEnvironment();
        var link2 = env.link;
        var global2 = env.global;
        env.id = drawCallCounter++;
        env.batchId = "0";
        var SHARED = link2(sharedState);
        var shared = env.shared = {
          props: "a0"
        };
        Object.keys(sharedState).forEach(function(prop) {
          shared[prop] = global2.def(SHARED, ".", prop);
        });
        check$1.optional(function() {
          env.CHECK = link2(check$1);
          env.commandStr = check$1.guessCommand();
          env.command = link2(env.commandStr);
          env.assert = function(block, pred, message) {
            block(
              "if(!(",
              pred,
              "))",
              this.CHECK,
              ".commandRaise(",
              link2(message),
              ",",
              this.command,
              ");"
            );
          };
          sharedConstants.invalidBlendCombinations = invalidBlendCombinations;
        });
        var nextVars = env.next = {};
        var currentVars = env.current = {};
        Object.keys(GL_VARIABLES).forEach(function(variable) {
          if (Array.isArray(currentState[variable])) {
            nextVars[variable] = global2.def(shared.next, ".", variable);
            currentVars[variable] = global2.def(shared.current, ".", variable);
          }
        });
        var constants2 = env.constants = {};
        Object.keys(sharedConstants).forEach(function(name) {
          constants2[name] = global2.def(JSON.stringify(sharedConstants[name]));
        });
        env.invoke = function(block, x) {
          switch (x.type) {
            case DYN_FUNC$1:
              var argList = [
                "this",
                shared.context,
                shared.props,
                env.batchId
              ];
              return block.def(
                link2(x.data),
                ".call(",
                argList.slice(0, Math.max(x.data.length + 1, 4)),
                ")"
              );
            case DYN_PROP$1:
              return block.def(shared.props, x.data);
            case DYN_CONTEXT$1:
              return block.def(shared.context, x.data);
            case DYN_STATE$1:
              return block.def("this", x.data);
            case DYN_THUNK:
              x.data.append(env, block);
              return x.data.ref;
            case DYN_CONSTANT$1:
              return x.data.toString();
            case DYN_ARRAY$1:
              return x.data.map(function(y) {
                return env.invoke(block, y);
              });
          }
        };
        env.attribCache = {};
        var scopeAttribs = {};
        env.scopeAttrib = function(name) {
          var id2 = stringStore.id(name);
          if (id2 in scopeAttribs) {
            return scopeAttribs[id2];
          }
          var binding = attributeState.scope[id2];
          if (!binding) {
            binding = attributeState.scope[id2] = new AttributeRecord2();
          }
          var result = scopeAttribs[id2] = link2(binding);
          return result;
        };
        return env;
      }
      function parseProfile(options) {
        var staticOptions = options.static;
        var dynamicOptions = options.dynamic;
        var profileEnable;
        if (S_PROFILE in staticOptions) {
          var value = !!staticOptions[S_PROFILE];
          profileEnable = createStaticDecl(function(env, scope) {
            return value;
          });
          profileEnable.enable = value;
        } else if (S_PROFILE in dynamicOptions) {
          var dyn = dynamicOptions[S_PROFILE];
          profileEnable = createDynamicDecl(dyn, function(env, scope) {
            return env.invoke(scope, dyn);
          });
        }
        return profileEnable;
      }
      function parseFramebuffer(options, env) {
        var staticOptions = options.static;
        var dynamicOptions = options.dynamic;
        if (S_FRAMEBUFFER in staticOptions) {
          var framebuffer = staticOptions[S_FRAMEBUFFER];
          if (framebuffer) {
            framebuffer = framebufferState.getFramebuffer(framebuffer);
            check$1.command(framebuffer, "invalid framebuffer object");
            return createStaticDecl(function(env2, block) {
              var FRAMEBUFFER = env2.link(framebuffer);
              var shared = env2.shared;
              block.set(
                shared.framebuffer,
                ".next",
                FRAMEBUFFER
              );
              var CONTEXT = shared.context;
              block.set(
                CONTEXT,
                "." + S_FRAMEBUFFER_WIDTH,
                FRAMEBUFFER + ".width"
              );
              block.set(
                CONTEXT,
                "." + S_FRAMEBUFFER_HEIGHT,
                FRAMEBUFFER + ".height"
              );
              return FRAMEBUFFER;
            });
          } else {
            return createStaticDecl(function(env2, scope) {
              var shared = env2.shared;
              scope.set(
                shared.framebuffer,
                ".next",
                "null"
              );
              var CONTEXT = shared.context;
              scope.set(
                CONTEXT,
                "." + S_FRAMEBUFFER_WIDTH,
                CONTEXT + "." + S_DRAWINGBUFFER_WIDTH
              );
              scope.set(
                CONTEXT,
                "." + S_FRAMEBUFFER_HEIGHT,
                CONTEXT + "." + S_DRAWINGBUFFER_HEIGHT
              );
              return "null";
            });
          }
        } else if (S_FRAMEBUFFER in dynamicOptions) {
          var dyn = dynamicOptions[S_FRAMEBUFFER];
          return createDynamicDecl(dyn, function(env2, scope) {
            var FRAMEBUFFER_FUNC = env2.invoke(scope, dyn);
            var shared = env2.shared;
            var FRAMEBUFFER_STATE = shared.framebuffer;
            var FRAMEBUFFER = scope.def(
              FRAMEBUFFER_STATE,
              ".getFramebuffer(",
              FRAMEBUFFER_FUNC,
              ")"
            );
            check$1.optional(function() {
              env2.assert(
                scope,
                "!" + FRAMEBUFFER_FUNC + "||" + FRAMEBUFFER,
                "invalid framebuffer object"
              );
            });
            scope.set(
              FRAMEBUFFER_STATE,
              ".next",
              FRAMEBUFFER
            );
            var CONTEXT = shared.context;
            scope.set(
              CONTEXT,
              "." + S_FRAMEBUFFER_WIDTH,
              FRAMEBUFFER + "?" + FRAMEBUFFER + ".width:" + CONTEXT + "." + S_DRAWINGBUFFER_WIDTH
            );
            scope.set(
              CONTEXT,
              "." + S_FRAMEBUFFER_HEIGHT,
              FRAMEBUFFER + "?" + FRAMEBUFFER + ".height:" + CONTEXT + "." + S_DRAWINGBUFFER_HEIGHT
            );
            return FRAMEBUFFER;
          });
        } else {
          return null;
        }
      }
      function parseViewportScissor(options, framebuffer, env) {
        var staticOptions = options.static;
        var dynamicOptions = options.dynamic;
        function parseBox(param) {
          if (param in staticOptions) {
            var box = staticOptions[param];
            check$1.commandType(box, "object", "invalid " + param, env.commandStr);
            var isStatic2 = true;
            var x = box.x | 0;
            var y = box.y | 0;
            var w, h;
            if ("width" in box) {
              w = box.width | 0;
              check$1.command(w >= 0, "invalid " + param, env.commandStr);
            } else {
              isStatic2 = false;
            }
            if ("height" in box) {
              h = box.height | 0;
              check$1.command(h >= 0, "invalid " + param, env.commandStr);
            } else {
              isStatic2 = false;
            }
            return new Declaration(
              !isStatic2 && framebuffer && framebuffer.thisDep,
              !isStatic2 && framebuffer && framebuffer.contextDep,
              !isStatic2 && framebuffer && framebuffer.propDep,
              function(env2, scope) {
                var CONTEXT = env2.shared.context;
                var BOX_W = w;
                if (!("width" in box)) {
                  BOX_W = scope.def(CONTEXT, ".", S_FRAMEBUFFER_WIDTH, "-", x);
                }
                var BOX_H = h;
                if (!("height" in box)) {
                  BOX_H = scope.def(CONTEXT, ".", S_FRAMEBUFFER_HEIGHT, "-", y);
                }
                return [x, y, BOX_W, BOX_H];
              }
            );
          } else if (param in dynamicOptions) {
            var dynBox = dynamicOptions[param];
            var result = createDynamicDecl(dynBox, function(env2, scope) {
              var BOX = env2.invoke(scope, dynBox);
              check$1.optional(function() {
                env2.assert(
                  scope,
                  BOX + "&&typeof " + BOX + '==="object"',
                  "invalid " + param
                );
              });
              var CONTEXT = env2.shared.context;
              var BOX_X = scope.def(BOX, ".x|0");
              var BOX_Y = scope.def(BOX, ".y|0");
              var BOX_W = scope.def(
                '"width" in ',
                BOX,
                "?",
                BOX,
                ".width|0:",
                "(",
                CONTEXT,
                ".",
                S_FRAMEBUFFER_WIDTH,
                "-",
                BOX_X,
                ")"
              );
              var BOX_H = scope.def(
                '"height" in ',
                BOX,
                "?",
                BOX,
                ".height|0:",
                "(",
                CONTEXT,
                ".",
                S_FRAMEBUFFER_HEIGHT,
                "-",
                BOX_Y,
                ")"
              );
              check$1.optional(function() {
                env2.assert(
                  scope,
                  BOX_W + ">=0&&" + BOX_H + ">=0",
                  "invalid " + param
                );
              });
              return [BOX_X, BOX_Y, BOX_W, BOX_H];
            });
            if (framebuffer) {
              result.thisDep = result.thisDep || framebuffer.thisDep;
              result.contextDep = result.contextDep || framebuffer.contextDep;
              result.propDep = result.propDep || framebuffer.propDep;
            }
            return result;
          } else if (framebuffer) {
            return new Declaration(
              framebuffer.thisDep,
              framebuffer.contextDep,
              framebuffer.propDep,
              function(env2, scope) {
                var CONTEXT = env2.shared.context;
                return [
                  0,
                  0,
                  scope.def(CONTEXT, ".", S_FRAMEBUFFER_WIDTH),
                  scope.def(CONTEXT, ".", S_FRAMEBUFFER_HEIGHT)
                ];
              }
            );
          } else {
            return null;
          }
        }
        var viewport = parseBox(S_VIEWPORT);
        if (viewport) {
          var prevViewport = viewport;
          viewport = new Declaration(
            viewport.thisDep,
            viewport.contextDep,
            viewport.propDep,
            function(env2, scope) {
              var VIEWPORT = prevViewport.append(env2, scope);
              var CONTEXT = env2.shared.context;
              scope.set(
                CONTEXT,
                "." + S_VIEWPORT_WIDTH,
                VIEWPORT[2]
              );
              scope.set(
                CONTEXT,
                "." + S_VIEWPORT_HEIGHT,
                VIEWPORT[3]
              );
              return VIEWPORT;
            }
          );
        }
        return {
          viewport,
          scissor_box: parseBox(S_SCISSOR_BOX)
        };
      }
      function parseAttribLocations(options, attributes) {
        var staticOptions = options.static;
        var staticProgram = typeof staticOptions[S_FRAG] === "string" && typeof staticOptions[S_VERT] === "string";
        if (staticProgram) {
          if (Object.keys(attributes.dynamic).length > 0) {
            return null;
          }
          var staticAttributes = attributes.static;
          var sAttributes = Object.keys(staticAttributes);
          if (sAttributes.length > 0 && typeof staticAttributes[sAttributes[0]] === "number") {
            var bindings = [];
            for (var i = 0; i < sAttributes.length; ++i) {
              check$1(typeof staticAttributes[sAttributes[i]] === "number", "must specify all vertex attribute locations when using vaos");
              bindings.push([staticAttributes[sAttributes[i]] | 0, sAttributes[i]]);
            }
            return bindings;
          }
        }
        return null;
      }
      function parseProgram(options, env, attribLocations) {
        var staticOptions = options.static;
        var dynamicOptions = options.dynamic;
        function parseShader(name) {
          if (name in staticOptions) {
            var id2 = stringStore.id(staticOptions[name]);
            check$1.optional(function() {
              shaderState.shader(shaderType[name], id2, check$1.guessCommand());
            });
            var result = createStaticDecl(function() {
              return id2;
            });
            result.id = id2;
            return result;
          } else if (name in dynamicOptions) {
            var dyn = dynamicOptions[name];
            return createDynamicDecl(dyn, function(env2, scope) {
              var str = env2.invoke(scope, dyn);
              var id3 = scope.def(env2.shared.strings, ".id(", str, ")");
              check$1.optional(function() {
                scope(
                  env2.shared.shader,
                  ".shader(",
                  shaderType[name],
                  ",",
                  id3,
                  ",",
                  env2.command,
                  ");"
                );
              });
              return id3;
            });
          }
          return null;
        }
        var frag = parseShader(S_FRAG);
        var vert = parseShader(S_VERT);
        var program = null;
        var progVar;
        if (isStatic(frag) && isStatic(vert)) {
          program = shaderState.program(vert.id, frag.id, null, attribLocations);
          progVar = createStaticDecl(function(env2, scope) {
            return env2.link(program);
          });
        } else {
          progVar = new Declaration(
            frag && frag.thisDep || vert && vert.thisDep,
            frag && frag.contextDep || vert && vert.contextDep,
            frag && frag.propDep || vert && vert.propDep,
            function(env2, scope) {
              var SHADER_STATE = env2.shared.shader;
              var fragId;
              if (frag) {
                fragId = frag.append(env2, scope);
              } else {
                fragId = scope.def(SHADER_STATE, ".", S_FRAG);
              }
              var vertId;
              if (vert) {
                vertId = vert.append(env2, scope);
              } else {
                vertId = scope.def(SHADER_STATE, ".", S_VERT);
              }
              var progDef = SHADER_STATE + ".program(" + vertId + "," + fragId;
              check$1.optional(function() {
                progDef += "," + env2.command;
              });
              return scope.def(progDef + ")");
            }
          );
        }
        return {
          frag,
          vert,
          progVar,
          program
        };
      }
      function parseDraw(options, env) {
        var staticOptions = options.static;
        var dynamicOptions = options.dynamic;
        var staticDraw = {};
        var vaoActive = false;
        function parseVAO() {
          if (S_VAO in staticOptions) {
            var vao2 = staticOptions[S_VAO];
            if (vao2 !== null && attributeState.getVAO(vao2) === null) {
              vao2 = attributeState.createVAO(vao2);
            }
            vaoActive = true;
            staticDraw.vao = vao2;
            return createStaticDecl(function(env2) {
              var vaoRef = attributeState.getVAO(vao2);
              if (vaoRef) {
                return env2.link(vaoRef);
              } else {
                return "null";
              }
            });
          } else if (S_VAO in dynamicOptions) {
            vaoActive = true;
            var dyn = dynamicOptions[S_VAO];
            return createDynamicDecl(dyn, function(env2, scope) {
              var vaoRef = env2.invoke(scope, dyn);
              return scope.def(env2.shared.vao + ".getVAO(" + vaoRef + ")");
            });
          }
          return null;
        }
        var vao = parseVAO();
        var elementsActive = false;
        function parseElements() {
          if (S_ELEMENTS in staticOptions) {
            var elements2 = staticOptions[S_ELEMENTS];
            staticDraw.elements = elements2;
            if (isBufferArgs(elements2)) {
              var e = staticDraw.elements = elementState.create(elements2, true);
              elements2 = elementState.getElements(e);
              elementsActive = true;
            } else if (elements2) {
              elements2 = elementState.getElements(elements2);
              elementsActive = true;
              check$1.command(elements2, "invalid elements", env.commandStr);
            }
            var result = createStaticDecl(function(env2, scope) {
              if (elements2) {
                var result2 = env2.link(elements2);
                env2.ELEMENTS = result2;
                return result2;
              }
              env2.ELEMENTS = null;
              return null;
            });
            result.value = elements2;
            return result;
          } else if (S_ELEMENTS in dynamicOptions) {
            elementsActive = true;
            var dyn = dynamicOptions[S_ELEMENTS];
            return createDynamicDecl(dyn, function(env2, scope) {
              var shared = env2.shared;
              var IS_BUFFER_ARGS = shared.isBufferArgs;
              var ELEMENT_STATE = shared.elements;
              var elementDefn = env2.invoke(scope, dyn);
              var elements3 = scope.def("null");
              var elementStream = scope.def(IS_BUFFER_ARGS, "(", elementDefn, ")");
              var ifte = env2.cond(elementStream).then(elements3, "=", ELEMENT_STATE, ".createStream(", elementDefn, ");").else(elements3, "=", ELEMENT_STATE, ".getElements(", elementDefn, ");");
              check$1.optional(function() {
                env2.assert(
                  ifte.else,
                  "!" + elementDefn + "||" + elements3,
                  "invalid elements"
                );
              });
              scope.entry(ifte);
              scope.exit(
                env2.cond(elementStream).then(ELEMENT_STATE, ".destroyStream(", elements3, ");")
              );
              env2.ELEMENTS = elements3;
              return elements3;
            });
          } else if (vaoActive) {
            return new Declaration(
              vao.thisDep,
              vao.contextDep,
              vao.propDep,
              function(env2, scope) {
                return scope.def(env2.shared.vao + ".currentVAO?" + env2.shared.elements + ".getElements(" + env2.shared.vao + ".currentVAO.elements):null");
              }
            );
          }
          return null;
        }
        var elements = parseElements();
        function parsePrimitive() {
          if (S_PRIMITIVE in staticOptions) {
            var primitive2 = staticOptions[S_PRIMITIVE];
            staticDraw.primitive = primitive2;
            check$1.commandParameter(primitive2, primTypes, "invalid primitve", env.commandStr);
            return createStaticDecl(function(env2, scope) {
              return primTypes[primitive2];
            });
          } else if (S_PRIMITIVE in dynamicOptions) {
            var dynPrimitive = dynamicOptions[S_PRIMITIVE];
            return createDynamicDecl(dynPrimitive, function(env2, scope) {
              var PRIM_TYPES = env2.constants.primTypes;
              var prim = env2.invoke(scope, dynPrimitive);
              check$1.optional(function() {
                env2.assert(
                  scope,
                  prim + " in " + PRIM_TYPES,
                  "invalid primitive, must be one of " + Object.keys(primTypes)
                );
              });
              return scope.def(PRIM_TYPES, "[", prim, "]");
            });
          } else if (elementsActive) {
            if (isStatic(elements)) {
              if (elements.value) {
                return createStaticDecl(function(env2, scope) {
                  return scope.def(env2.ELEMENTS, ".primType");
                });
              } else {
                return createStaticDecl(function() {
                  return GL_TRIANGLES$1;
                });
              }
            } else {
              return new Declaration(
                elements.thisDep,
                elements.contextDep,
                elements.propDep,
                function(env2, scope) {
                  var elements2 = env2.ELEMENTS;
                  return scope.def(elements2, "?", elements2, ".primType:", GL_TRIANGLES$1);
                }
              );
            }
          } else if (vaoActive) {
            return new Declaration(
              vao.thisDep,
              vao.contextDep,
              vao.propDep,
              function(env2, scope) {
                return scope.def(env2.shared.vao + ".currentVAO?" + env2.shared.vao + ".currentVAO.primitive:" + GL_TRIANGLES$1);
              }
            );
          }
          return null;
        }
        function parseParam(param, isOffset) {
          if (param in staticOptions) {
            var value = staticOptions[param] | 0;
            if (isOffset) {
              staticDraw.offset = value;
            } else {
              staticDraw.instances = value;
            }
            check$1.command(!isOffset || value >= 0, "invalid " + param, env.commandStr);
            return createStaticDecl(function(env2, scope) {
              if (isOffset) {
                env2.OFFSET = value;
              }
              return value;
            });
          } else if (param in dynamicOptions) {
            var dynValue = dynamicOptions[param];
            return createDynamicDecl(dynValue, function(env2, scope) {
              var result = env2.invoke(scope, dynValue);
              if (isOffset) {
                env2.OFFSET = result;
                check$1.optional(function() {
                  env2.assert(
                    scope,
                    result + ">=0",
                    "invalid " + param
                  );
                });
              }
              return result;
            });
          } else if (isOffset) {
            if (elementsActive) {
              return createStaticDecl(function(env2, scope) {
                env2.OFFSET = 0;
                return 0;
              });
            } else if (vaoActive) {
              return new Declaration(
                vao.thisDep,
                vao.contextDep,
                vao.propDep,
                function(env2, scope) {
                  return scope.def(env2.shared.vao + ".currentVAO?" + env2.shared.vao + ".currentVAO.offset:0");
                }
              );
            }
          } else if (vaoActive) {
            return new Declaration(
              vao.thisDep,
              vao.contextDep,
              vao.propDep,
              function(env2, scope) {
                return scope.def(env2.shared.vao + ".currentVAO?" + env2.shared.vao + ".currentVAO.instances:-1");
              }
            );
          }
          return null;
        }
        var OFFSET = parseParam(S_OFFSET, true);
        function parseVertCount() {
          if (S_COUNT in staticOptions) {
            var count2 = staticOptions[S_COUNT] | 0;
            staticDraw.count = count2;
            check$1.command(
              typeof count2 === "number" && count2 >= 0,
              "invalid vertex count",
              env.commandStr
            );
            return createStaticDecl(function() {
              return count2;
            });
          } else if (S_COUNT in dynamicOptions) {
            var dynCount = dynamicOptions[S_COUNT];
            return createDynamicDecl(dynCount, function(env2, scope) {
              var result2 = env2.invoke(scope, dynCount);
              check$1.optional(function() {
                env2.assert(
                  scope,
                  "typeof " + result2 + '==="number"&&' + result2 + ">=0&&" + result2 + "===(" + result2 + "|0)",
                  "invalid vertex count"
                );
              });
              return result2;
            });
          } else if (elementsActive) {
            if (isStatic(elements)) {
              if (elements) {
                if (OFFSET) {
                  return new Declaration(
                    OFFSET.thisDep,
                    OFFSET.contextDep,
                    OFFSET.propDep,
                    function(env2, scope) {
                      var result2 = scope.def(
                        env2.ELEMENTS,
                        ".vertCount-",
                        env2.OFFSET
                      );
                      check$1.optional(function() {
                        env2.assert(
                          scope,
                          result2 + ">=0",
                          "invalid vertex offset/element buffer too small"
                        );
                      });
                      return result2;
                    }
                  );
                } else {
                  return createStaticDecl(function(env2, scope) {
                    return scope.def(env2.ELEMENTS, ".vertCount");
                  });
                }
              } else {
                var result = createStaticDecl(function() {
                  return -1;
                });
                check$1.optional(function() {
                  result.MISSING = true;
                });
                return result;
              }
            } else {
              var variable = new Declaration(
                elements.thisDep || OFFSET.thisDep,
                elements.contextDep || OFFSET.contextDep,
                elements.propDep || OFFSET.propDep,
                function(env2, scope) {
                  var elements2 = env2.ELEMENTS;
                  if (env2.OFFSET) {
                    return scope.def(
                      elements2,
                      "?",
                      elements2,
                      ".vertCount-",
                      env2.OFFSET,
                      ":-1"
                    );
                  }
                  return scope.def(elements2, "?", elements2, ".vertCount:-1");
                }
              );
              check$1.optional(function() {
                variable.DYNAMIC = true;
              });
              return variable;
            }
          } else if (vaoActive) {
            var countVariable = new Declaration(
              vao.thisDep,
              vao.contextDep,
              vao.propDep,
              function(env2, scope) {
                return scope.def(env2.shared.vao, ".currentVAO?", env2.shared.vao, ".currentVAO.count:-1");
              }
            );
            return countVariable;
          }
          return null;
        }
        var primitive = parsePrimitive();
        var count = parseVertCount();
        var instances = parseParam(S_INSTANCES, false);
        return {
          elements,
          primitive,
          count,
          instances,
          offset: OFFSET,
          vao,
          vaoActive,
          elementsActive,
          // static draw props
          static: staticDraw
        };
      }
      function parseGLState(options, env) {
        var staticOptions = options.static;
        var dynamicOptions = options.dynamic;
        var STATE = {};
        GL_STATE_NAMES.forEach(function(prop) {
          var param = propName(prop);
          function parseParam(parseStatic, parseDynamic) {
            if (prop in staticOptions) {
              var value = parseStatic(staticOptions[prop]);
              STATE[param] = createStaticDecl(function() {
                return value;
              });
            } else if (prop in dynamicOptions) {
              var dyn = dynamicOptions[prop];
              STATE[param] = createDynamicDecl(dyn, function(env2, scope) {
                return parseDynamic(env2, scope, env2.invoke(scope, dyn));
              });
            }
          }
          switch (prop) {
            case S_CULL_ENABLE:
            case S_BLEND_ENABLE:
            case S_DITHER:
            case S_STENCIL_ENABLE:
            case S_DEPTH_ENABLE:
            case S_SCISSOR_ENABLE:
            case S_POLYGON_OFFSET_ENABLE:
            case S_SAMPLE_ALPHA:
            case S_SAMPLE_ENABLE:
            case S_DEPTH_MASK:
              return parseParam(
                function(value) {
                  check$1.commandType(value, "boolean", prop, env.commandStr);
                  return value;
                },
                function(env2, scope, value) {
                  check$1.optional(function() {
                    env2.assert(
                      scope,
                      "typeof " + value + '==="boolean"',
                      "invalid flag " + prop,
                      env2.commandStr
                    );
                  });
                  return value;
                }
              );
            case S_DEPTH_FUNC:
              return parseParam(
                function(value) {
                  check$1.commandParameter(value, compareFuncs, "invalid " + prop, env.commandStr);
                  return compareFuncs[value];
                },
                function(env2, scope, value) {
                  var COMPARE_FUNCS = env2.constants.compareFuncs;
                  check$1.optional(function() {
                    env2.assert(
                      scope,
                      value + " in " + COMPARE_FUNCS,
                      "invalid " + prop + ", must be one of " + Object.keys(compareFuncs)
                    );
                  });
                  return scope.def(COMPARE_FUNCS, "[", value, "]");
                }
              );
            case S_DEPTH_RANGE:
              return parseParam(
                function(value) {
                  check$1.command(
                    isArrayLike(value) && value.length === 2 && typeof value[0] === "number" && typeof value[1] === "number" && value[0] <= value[1],
                    "depth range is 2d array",
                    env.commandStr
                  );
                  return value;
                },
                function(env2, scope, value) {
                  check$1.optional(function() {
                    env2.assert(
                      scope,
                      env2.shared.isArrayLike + "(" + value + ")&&" + value + ".length===2&&typeof " + value + '[0]==="number"&&typeof ' + value + '[1]==="number"&&' + value + "[0]<=" + value + "[1]",
                      "depth range must be a 2d array"
                    );
                  });
                  var Z_NEAR = scope.def("+", value, "[0]");
                  var Z_FAR = scope.def("+", value, "[1]");
                  return [Z_NEAR, Z_FAR];
                }
              );
            case S_BLEND_FUNC:
              return parseParam(
                function(value) {
                  check$1.commandType(value, "object", "blend.func", env.commandStr);
                  var srcRGB = "srcRGB" in value ? value.srcRGB : value.src;
                  var srcAlpha = "srcAlpha" in value ? value.srcAlpha : value.src;
                  var dstRGB = "dstRGB" in value ? value.dstRGB : value.dst;
                  var dstAlpha = "dstAlpha" in value ? value.dstAlpha : value.dst;
                  check$1.commandParameter(srcRGB, blendFuncs, param + ".srcRGB", env.commandStr);
                  check$1.commandParameter(srcAlpha, blendFuncs, param + ".srcAlpha", env.commandStr);
                  check$1.commandParameter(dstRGB, blendFuncs, param + ".dstRGB", env.commandStr);
                  check$1.commandParameter(dstAlpha, blendFuncs, param + ".dstAlpha", env.commandStr);
                  check$1.command(
                    invalidBlendCombinations.indexOf(srcRGB + ", " + dstRGB) === -1,
                    "unallowed blending combination (srcRGB, dstRGB) = (" + srcRGB + ", " + dstRGB + ")",
                    env.commandStr
                  );
                  return [
                    blendFuncs[srcRGB],
                    blendFuncs[dstRGB],
                    blendFuncs[srcAlpha],
                    blendFuncs[dstAlpha]
                  ];
                },
                function(env2, scope, value) {
                  var BLEND_FUNCS = env2.constants.blendFuncs;
                  check$1.optional(function() {
                    env2.assert(
                      scope,
                      value + "&&typeof " + value + '==="object"',
                      "invalid blend func, must be an object"
                    );
                  });
                  function read(prefix, suffix) {
                    var func = scope.def(
                      '"',
                      prefix,
                      suffix,
                      '" in ',
                      value,
                      "?",
                      value,
                      ".",
                      prefix,
                      suffix,
                      ":",
                      value,
                      ".",
                      prefix
                    );
                    check$1.optional(function() {
                      env2.assert(
                        scope,
                        func + " in " + BLEND_FUNCS,
                        "invalid " + prop + "." + prefix + suffix + ", must be one of " + Object.keys(blendFuncs)
                      );
                    });
                    return func;
                  }
                  var srcRGB = read("src", "RGB");
                  var dstRGB = read("dst", "RGB");
                  check$1.optional(function() {
                    var INVALID_BLEND_COMBINATIONS = env2.constants.invalidBlendCombinations;
                    env2.assert(
                      scope,
                      INVALID_BLEND_COMBINATIONS + ".indexOf(" + srcRGB + '+", "+' + dstRGB + ") === -1 ",
                      "unallowed blending combination for (srcRGB, dstRGB)"
                    );
                  });
                  var SRC_RGB = scope.def(BLEND_FUNCS, "[", srcRGB, "]");
                  var SRC_ALPHA = scope.def(BLEND_FUNCS, "[", read("src", "Alpha"), "]");
                  var DST_RGB = scope.def(BLEND_FUNCS, "[", dstRGB, "]");
                  var DST_ALPHA = scope.def(BLEND_FUNCS, "[", read("dst", "Alpha"), "]");
                  return [SRC_RGB, DST_RGB, SRC_ALPHA, DST_ALPHA];
                }
              );
            case S_BLEND_EQUATION:
              return parseParam(
                function(value) {
                  if (typeof value === "string") {
                    check$1.commandParameter(value, blendEquations, "invalid " + prop, env.commandStr);
                    return [
                      blendEquations[value],
                      blendEquations[value]
                    ];
                  } else if (typeof value === "object") {
                    check$1.commandParameter(
                      value.rgb,
                      blendEquations,
                      prop + ".rgb",
                      env.commandStr
                    );
                    check$1.commandParameter(
                      value.alpha,
                      blendEquations,
                      prop + ".alpha",
                      env.commandStr
                    );
                    return [
                      blendEquations[value.rgb],
                      blendEquations[value.alpha]
                    ];
                  } else {
                    check$1.commandRaise("invalid blend.equation", env.commandStr);
                  }
                },
                function(env2, scope, value) {
                  var BLEND_EQUATIONS = env2.constants.blendEquations;
                  var RGB = scope.def();
                  var ALPHA = scope.def();
                  var ifte = env2.cond("typeof ", value, '==="string"');
                  check$1.optional(function() {
                    function checkProp(block, name, value2) {
                      env2.assert(
                        block,
                        value2 + " in " + BLEND_EQUATIONS,
                        "invalid " + name + ", must be one of " + Object.keys(blendEquations)
                      );
                    }
                    checkProp(ifte.then, prop, value);
                    env2.assert(
                      ifte.else,
                      value + "&&typeof " + value + '==="object"',
                      "invalid " + prop
                    );
                    checkProp(ifte.else, prop + ".rgb", value + ".rgb");
                    checkProp(ifte.else, prop + ".alpha", value + ".alpha");
                  });
                  ifte.then(
                    RGB,
                    "=",
                    ALPHA,
                    "=",
                    BLEND_EQUATIONS,
                    "[",
                    value,
                    "];"
                  );
                  ifte.else(
                    RGB,
                    "=",
                    BLEND_EQUATIONS,
                    "[",
                    value,
                    ".rgb];",
                    ALPHA,
                    "=",
                    BLEND_EQUATIONS,
                    "[",
                    value,
                    ".alpha];"
                  );
                  scope(ifte);
                  return [RGB, ALPHA];
                }
              );
            case S_BLEND_COLOR:
              return parseParam(
                function(value) {
                  check$1.command(
                    isArrayLike(value) && value.length === 4,
                    "blend.color must be a 4d array",
                    env.commandStr
                  );
                  return loop(4, function(i) {
                    return +value[i];
                  });
                },
                function(env2, scope, value) {
                  check$1.optional(function() {
                    env2.assert(
                      scope,
                      env2.shared.isArrayLike + "(" + value + ")&&" + value + ".length===4",
                      "blend.color must be a 4d array"
                    );
                  });
                  return loop(4, function(i) {
                    return scope.def("+", value, "[", i, "]");
                  });
                }
              );
            case S_STENCIL_MASK:
              return parseParam(
                function(value) {
                  check$1.commandType(value, "number", param, env.commandStr);
                  return value | 0;
                },
                function(env2, scope, value) {
                  check$1.optional(function() {
                    env2.assert(
                      scope,
                      "typeof " + value + '==="number"',
                      "invalid stencil.mask"
                    );
                  });
                  return scope.def(value, "|0");
                }
              );
            case S_STENCIL_FUNC:
              return parseParam(
                function(value) {
                  check$1.commandType(value, "object", param, env.commandStr);
                  var cmp = value.cmp || "keep";
                  var ref = value.ref || 0;
                  var mask = "mask" in value ? value.mask : -1;
                  check$1.commandParameter(cmp, compareFuncs, prop + ".cmp", env.commandStr);
                  check$1.commandType(ref, "number", prop + ".ref", env.commandStr);
                  check$1.commandType(mask, "number", prop + ".mask", env.commandStr);
                  return [
                    compareFuncs[cmp],
                    ref,
                    mask
                  ];
                },
                function(env2, scope, value) {
                  var COMPARE_FUNCS = env2.constants.compareFuncs;
                  check$1.optional(function() {
                    function assert() {
                      env2.assert(
                        scope,
                        Array.prototype.join.call(arguments, ""),
                        "invalid stencil.func"
                      );
                    }
                    assert(value + "&&typeof ", value, '==="object"');
                    assert(
                      '!("cmp" in ',
                      value,
                      ")||(",
                      value,
                      ".cmp in ",
                      COMPARE_FUNCS,
                      ")"
                    );
                  });
                  var cmp = scope.def(
                    '"cmp" in ',
                    value,
                    "?",
                    COMPARE_FUNCS,
                    "[",
                    value,
                    ".cmp]",
                    ":",
                    GL_KEEP
                  );
                  var ref = scope.def(value, ".ref|0");
                  var mask = scope.def(
                    '"mask" in ',
                    value,
                    "?",
                    value,
                    ".mask|0:-1"
                  );
                  return [cmp, ref, mask];
                }
              );
            case S_STENCIL_OPFRONT:
            case S_STENCIL_OPBACK:
              return parseParam(
                function(value) {
                  check$1.commandType(value, "object", param, env.commandStr);
                  var fail = value.fail || "keep";
                  var zfail = value.zfail || "keep";
                  var zpass = value.zpass || "keep";
                  check$1.commandParameter(fail, stencilOps, prop + ".fail", env.commandStr);
                  check$1.commandParameter(zfail, stencilOps, prop + ".zfail", env.commandStr);
                  check$1.commandParameter(zpass, stencilOps, prop + ".zpass", env.commandStr);
                  return [
                    prop === S_STENCIL_OPBACK ? GL_BACK : GL_FRONT,
                    stencilOps[fail],
                    stencilOps[zfail],
                    stencilOps[zpass]
                  ];
                },
                function(env2, scope, value) {
                  var STENCIL_OPS = env2.constants.stencilOps;
                  check$1.optional(function() {
                    env2.assert(
                      scope,
                      value + "&&typeof " + value + '==="object"',
                      "invalid " + prop
                    );
                  });
                  function read(name) {
                    check$1.optional(function() {
                      env2.assert(
                        scope,
                        '!("' + name + '" in ' + value + ")||(" + value + "." + name + " in " + STENCIL_OPS + ")",
                        "invalid " + prop + "." + name + ", must be one of " + Object.keys(stencilOps)
                      );
                    });
                    return scope.def(
                      '"',
                      name,
                      '" in ',
                      value,
                      "?",
                      STENCIL_OPS,
                      "[",
                      value,
                      ".",
                      name,
                      "]:",
                      GL_KEEP
                    );
                  }
                  return [
                    prop === S_STENCIL_OPBACK ? GL_BACK : GL_FRONT,
                    read("fail"),
                    read("zfail"),
                    read("zpass")
                  ];
                }
              );
            case S_POLYGON_OFFSET_OFFSET:
              return parseParam(
                function(value) {
                  check$1.commandType(value, "object", param, env.commandStr);
                  var factor = value.factor | 0;
                  var units = value.units | 0;
                  check$1.commandType(factor, "number", param + ".factor", env.commandStr);
                  check$1.commandType(units, "number", param + ".units", env.commandStr);
                  return [factor, units];
                },
                function(env2, scope, value) {
                  check$1.optional(function() {
                    env2.assert(
                      scope,
                      value + "&&typeof " + value + '==="object"',
                      "invalid " + prop
                    );
                  });
                  var FACTOR = scope.def(value, ".factor|0");
                  var UNITS = scope.def(value, ".units|0");
                  return [FACTOR, UNITS];
                }
              );
            case S_CULL_FACE:
              return parseParam(
                function(value) {
                  var face = 0;
                  if (value === "front") {
                    face = GL_FRONT;
                  } else if (value === "back") {
                    face = GL_BACK;
                  }
                  check$1.command(!!face, param, env.commandStr);
                  return face;
                },
                function(env2, scope, value) {
                  check$1.optional(function() {
                    env2.assert(
                      scope,
                      value + '==="front"||' + value + '==="back"',
                      "invalid cull.face"
                    );
                  });
                  return scope.def(value, '==="front"?', GL_FRONT, ":", GL_BACK);
                }
              );
            case S_LINE_WIDTH:
              return parseParam(
                function(value) {
                  check$1.command(
                    typeof value === "number" && value >= limits.lineWidthDims[0] && value <= limits.lineWidthDims[1],
                    "invalid line width, must be a positive number between " + limits.lineWidthDims[0] + " and " + limits.lineWidthDims[1],
                    env.commandStr
                  );
                  return value;
                },
                function(env2, scope, value) {
                  check$1.optional(function() {
                    env2.assert(
                      scope,
                      "typeof " + value + '==="number"&&' + value + ">=" + limits.lineWidthDims[0] + "&&" + value + "<=" + limits.lineWidthDims[1],
                      "invalid line width"
                    );
                  });
                  return value;
                }
              );
            case S_FRONT_FACE:
              return parseParam(
                function(value) {
                  check$1.commandParameter(value, orientationType, param, env.commandStr);
                  return orientationType[value];
                },
                function(env2, scope, value) {
                  check$1.optional(function() {
                    env2.assert(
                      scope,
                      value + '==="cw"||' + value + '==="ccw"',
                      "invalid frontFace, must be one of cw,ccw"
                    );
                  });
                  return scope.def(value + '==="cw"?' + GL_CW + ":" + GL_CCW);
                }
              );
            case S_COLOR_MASK:
              return parseParam(
                function(value) {
                  check$1.command(
                    isArrayLike(value) && value.length === 4,
                    "color.mask must be length 4 array",
                    env.commandStr
                  );
                  return value.map(function(v) {
                    return !!v;
                  });
                },
                function(env2, scope, value) {
                  check$1.optional(function() {
                    env2.assert(
                      scope,
                      env2.shared.isArrayLike + "(" + value + ")&&" + value + ".length===4",
                      "invalid color.mask"
                    );
                  });
                  return loop(4, function(i) {
                    return "!!" + value + "[" + i + "]";
                  });
                }
              );
            case S_SAMPLE_COVERAGE:
              return parseParam(
                function(value) {
                  check$1.command(typeof value === "object" && value, param, env.commandStr);
                  var sampleValue = "value" in value ? value.value : 1;
                  var sampleInvert = !!value.invert;
                  check$1.command(
                    typeof sampleValue === "number" && sampleValue >= 0 && sampleValue <= 1,
                    "sample.coverage.value must be a number between 0 and 1",
                    env.commandStr
                  );
                  return [sampleValue, sampleInvert];
                },
                function(env2, scope, value) {
                  check$1.optional(function() {
                    env2.assert(
                      scope,
                      value + "&&typeof " + value + '==="object"',
                      "invalid sample.coverage"
                    );
                  });
                  var VALUE = scope.def(
                    '"value" in ',
                    value,
                    "?+",
                    value,
                    ".value:1"
                  );
                  var INVERT = scope.def("!!", value, ".invert");
                  return [VALUE, INVERT];
                }
              );
          }
        });
        return STATE;
      }
      function parseUniforms(uniforms, env) {
        var staticUniforms = uniforms.static;
        var dynamicUniforms = uniforms.dynamic;
        var UNIFORMS = {};
        Object.keys(staticUniforms).forEach(function(name) {
          var value = staticUniforms[name];
          var result;
          if (typeof value === "number" || typeof value === "boolean") {
            result = createStaticDecl(function() {
              return value;
            });
          } else if (typeof value === "function") {
            var reglType = value._reglType;
            if (reglType === "texture2d" || reglType === "textureCube") {
              result = createStaticDecl(function(env2) {
                return env2.link(value);
              });
            } else if (reglType === "framebuffer" || reglType === "framebufferCube") {
              check$1.command(
                value.color.length > 0,
                'missing color attachment for framebuffer sent to uniform "' + name + '"',
                env.commandStr
              );
              result = createStaticDecl(function(env2) {
                return env2.link(value.color[0]);
              });
            } else {
              check$1.commandRaise('invalid data for uniform "' + name + '"', env.commandStr);
            }
          } else if (isArrayLike(value)) {
            result = createStaticDecl(function(env2) {
              var ITEM = env2.global.def(
                "[",
                loop(value.length, function(i) {
                  check$1.command(
                    typeof value[i] === "number" || typeof value[i] === "boolean",
                    "invalid uniform " + name,
                    env2.commandStr
                  );
                  return value[i];
                }),
                "]"
              );
              return ITEM;
            });
          } else {
            check$1.commandRaise('invalid or missing data for uniform "' + name + '"', env.commandStr);
          }
          result.value = value;
          UNIFORMS[name] = result;
        });
        Object.keys(dynamicUniforms).forEach(function(key) {
          var dyn = dynamicUniforms[key];
          UNIFORMS[key] = createDynamicDecl(dyn, function(env2, scope) {
            return env2.invoke(scope, dyn);
          });
        });
        return UNIFORMS;
      }
      function parseAttributes(attributes, env) {
        var staticAttributes = attributes.static;
        var dynamicAttributes = attributes.dynamic;
        var attributeDefs = {};
        Object.keys(staticAttributes).forEach(function(attribute) {
          var value = staticAttributes[attribute];
          var id2 = stringStore.id(attribute);
          var record = new AttributeRecord2();
          if (isBufferArgs(value)) {
            record.state = ATTRIB_STATE_POINTER;
            record.buffer = bufferState.getBuffer(
              bufferState.create(value, GL_ARRAY_BUFFER$2, false, true)
            );
            record.type = 0;
          } else {
            var buffer = bufferState.getBuffer(value);
            if (buffer) {
              record.state = ATTRIB_STATE_POINTER;
              record.buffer = buffer;
              record.type = 0;
            } else {
              check$1.command(
                typeof value === "object" && value,
                "invalid data for attribute " + attribute,
                env.commandStr
              );
              if ("constant" in value) {
                var constant2 = value.constant;
                record.buffer = "null";
                record.state = ATTRIB_STATE_CONSTANT;
                if (typeof constant2 === "number") {
                  record.x = constant2;
                } else {
                  check$1.command(
                    isArrayLike(constant2) && constant2.length > 0 && constant2.length <= 4,
                    "invalid constant for attribute " + attribute,
                    env.commandStr
                  );
                  CUTE_COMPONENTS.forEach(function(c2, i) {
                    if (i < constant2.length) {
                      record[c2] = constant2[i];
                    }
                  });
                }
              } else {
                if (isBufferArgs(value.buffer)) {
                  buffer = bufferState.getBuffer(
                    bufferState.create(value.buffer, GL_ARRAY_BUFFER$2, false, true)
                  );
                } else {
                  buffer = bufferState.getBuffer(value.buffer);
                }
                check$1.command(!!buffer, 'missing buffer for attribute "' + attribute + '"', env.commandStr);
                var offset = value.offset | 0;
                check$1.command(
                  offset >= 0,
                  'invalid offset for attribute "' + attribute + '"',
                  env.commandStr
                );
                var stride = value.stride | 0;
                check$1.command(
                  stride >= 0 && stride < 256,
                  'invalid stride for attribute "' + attribute + '", must be integer betweeen [0, 255]',
                  env.commandStr
                );
                var size = value.size | 0;
                check$1.command(
                  !("size" in value) || size > 0 && size <= 4,
                  'invalid size for attribute "' + attribute + '", must be 1,2,3,4',
                  env.commandStr
                );
                var normalized = !!value.normalized;
                var type = 0;
                if ("type" in value) {
                  check$1.commandParameter(
                    value.type,
                    glTypes,
                    "invalid type for attribute " + attribute,
                    env.commandStr
                  );
                  type = glTypes[value.type];
                }
                var divisor = value.divisor | 0;
                check$1.optional(function() {
                  if ("divisor" in value) {
                    check$1.command(
                      divisor === 0 || extInstancing,
                      'cannot specify divisor for attribute "' + attribute + '", instancing not supported',
                      env.commandStr
                    );
                    check$1.command(
                      divisor >= 0,
                      'invalid divisor for attribute "' + attribute + '"',
                      env.commandStr
                    );
                  }
                  var command = env.commandStr;
                  var VALID_KEYS = [
                    "buffer",
                    "offset",
                    "divisor",
                    "normalized",
                    "type",
                    "size",
                    "stride"
                  ];
                  Object.keys(value).forEach(function(prop) {
                    check$1.command(
                      VALID_KEYS.indexOf(prop) >= 0,
                      'unknown parameter "' + prop + '" for attribute pointer "' + attribute + '" (valid parameters are ' + VALID_KEYS + ")",
                      command
                    );
                  });
                });
                record.buffer = buffer;
                record.state = ATTRIB_STATE_POINTER;
                record.size = size;
                record.normalized = normalized;
                record.type = type || buffer.dtype;
                record.offset = offset;
                record.stride = stride;
                record.divisor = divisor;
              }
            }
          }
          attributeDefs[attribute] = createStaticDecl(function(env2, scope) {
            var cache = env2.attribCache;
            if (id2 in cache) {
              return cache[id2];
            }
            var result = {
              isStream: false
            };
            Object.keys(record).forEach(function(key) {
              result[key] = record[key];
            });
            if (record.buffer) {
              result.buffer = env2.link(record.buffer);
              result.type = result.type || result.buffer + ".dtype";
            }
            cache[id2] = result;
            return result;
          });
        });
        Object.keys(dynamicAttributes).forEach(function(attribute) {
          var dyn = dynamicAttributes[attribute];
          function appendAttributeCode(env2, block) {
            var VALUE = env2.invoke(block, dyn);
            var shared = env2.shared;
            var constants2 = env2.constants;
            var IS_BUFFER_ARGS = shared.isBufferArgs;
            var BUFFER_STATE = shared.buffer;
            check$1.optional(function() {
              env2.assert(
                block,
                VALUE + "&&(typeof " + VALUE + '==="object"||typeof ' + VALUE + '==="function")&&(' + IS_BUFFER_ARGS + "(" + VALUE + ")||" + BUFFER_STATE + ".getBuffer(" + VALUE + ")||" + BUFFER_STATE + ".getBuffer(" + VALUE + ".buffer)||" + IS_BUFFER_ARGS + "(" + VALUE + '.buffer)||("constant" in ' + VALUE + "&&(typeof " + VALUE + '.constant==="number"||' + shared.isArrayLike + "(" + VALUE + ".constant))))",
                'invalid dynamic attribute "' + attribute + '"'
              );
            });
            var result = {
              isStream: block.def(false)
            };
            var defaultRecord = new AttributeRecord2();
            defaultRecord.state = ATTRIB_STATE_POINTER;
            Object.keys(defaultRecord).forEach(function(key) {
              result[key] = block.def("" + defaultRecord[key]);
            });
            var BUFFER = result.buffer;
            var TYPE = result.type;
            block(
              "if(",
              IS_BUFFER_ARGS,
              "(",
              VALUE,
              ")){",
              result.isStream,
              "=true;",
              BUFFER,
              "=",
              BUFFER_STATE,
              ".createStream(",
              GL_ARRAY_BUFFER$2,
              ",",
              VALUE,
              ");",
              TYPE,
              "=",
              BUFFER,
              ".dtype;",
              "}else{",
              BUFFER,
              "=",
              BUFFER_STATE,
              ".getBuffer(",
              VALUE,
              ");",
              "if(",
              BUFFER,
              "){",
              TYPE,
              "=",
              BUFFER,
              ".dtype;",
              '}else if("constant" in ',
              VALUE,
              "){",
              result.state,
              "=",
              ATTRIB_STATE_CONSTANT,
              ";",
              "if(typeof " + VALUE + '.constant === "number"){',
              result[CUTE_COMPONENTS[0]],
              "=",
              VALUE,
              ".constant;",
              CUTE_COMPONENTS.slice(1).map(function(n) {
                return result[n];
              }).join("="),
              "=0;",
              "}else{",
              CUTE_COMPONENTS.map(function(name, i) {
                return result[name] + "=" + VALUE + ".constant.length>" + i + "?" + VALUE + ".constant[" + i + "]:0;";
              }).join(""),
              "}}else{",
              "if(",
              IS_BUFFER_ARGS,
              "(",
              VALUE,
              ".buffer)){",
              BUFFER,
              "=",
              BUFFER_STATE,
              ".createStream(",
              GL_ARRAY_BUFFER$2,
              ",",
              VALUE,
              ".buffer);",
              "}else{",
              BUFFER,
              "=",
              BUFFER_STATE,
              ".getBuffer(",
              VALUE,
              ".buffer);",
              "}",
              TYPE,
              '="type" in ',
              VALUE,
              "?",
              constants2.glTypes,
              "[",
              VALUE,
              ".type]:",
              BUFFER,
              ".dtype;",
              result.normalized,
              "=!!",
              VALUE,
              ".normalized;"
            );
            function emitReadRecord(name) {
              block(result[name], "=", VALUE, ".", name, "|0;");
            }
            emitReadRecord("size");
            emitReadRecord("offset");
            emitReadRecord("stride");
            emitReadRecord("divisor");
            block("}}");
            block.exit(
              "if(",
              result.isStream,
              "){",
              BUFFER_STATE,
              ".destroyStream(",
              BUFFER,
              ");",
              "}"
            );
            return result;
          }
          attributeDefs[attribute] = createDynamicDecl(dyn, appendAttributeCode);
        });
        return attributeDefs;
      }
      function parseContext(context2) {
        var staticContext = context2.static;
        var dynamicContext = context2.dynamic;
        var result = {};
        Object.keys(staticContext).forEach(function(name) {
          var value = staticContext[name];
          result[name] = createStaticDecl(function(env, scope) {
            if (typeof value === "number" || typeof value === "boolean") {
              return "" + value;
            } else {
              return env.link(value);
            }
          });
        });
        Object.keys(dynamicContext).forEach(function(name) {
          var dyn = dynamicContext[name];
          result[name] = createDynamicDecl(dyn, function(env, scope) {
            return env.invoke(scope, dyn);
          });
        });
        return result;
      }
      function parseArguments(options, attributes, uniforms, context2, env) {
        var staticOptions = options.static;
        var dynamicOptions = options.dynamic;
        check$1.optional(function() {
          var KEY_NAMES = [
            S_FRAMEBUFFER,
            S_VERT,
            S_FRAG,
            S_ELEMENTS,
            S_PRIMITIVE,
            S_OFFSET,
            S_COUNT,
            S_INSTANCES,
            S_PROFILE,
            S_VAO
          ].concat(GL_STATE_NAMES);
          function checkKeys(dict) {
            Object.keys(dict).forEach(function(key) {
              check$1.command(
                KEY_NAMES.indexOf(key) >= 0,
                'unknown parameter "' + key + '"',
                env.commandStr
              );
            });
          }
          checkKeys(staticOptions);
          checkKeys(dynamicOptions);
        });
        var attribLocations = parseAttribLocations(options, attributes);
        var framebuffer = parseFramebuffer(options);
        var viewportAndScissor = parseViewportScissor(options, framebuffer, env);
        var draw = parseDraw(options, env);
        var state = parseGLState(options, env);
        var shader = parseProgram(options, env, attribLocations);
        function copyBox(name) {
          var defn = viewportAndScissor[name];
          if (defn) {
            state[name] = defn;
          }
        }
        copyBox(S_VIEWPORT);
        copyBox(propName(S_SCISSOR_BOX));
        var dirty = Object.keys(state).length > 0;
        var result = {
          framebuffer,
          draw,
          shader,
          state,
          dirty,
          scopeVAO: null,
          drawVAO: null,
          useVAO: false,
          attributes: {}
        };
        result.profile = parseProfile(options);
        result.uniforms = parseUniforms(uniforms, env);
        result.drawVAO = result.scopeVAO = draw.vao;
        if (!result.drawVAO && shader.program && !attribLocations && extensions.angle_instanced_arrays && draw.static.elements) {
          var useVAO = true;
          var staticBindings = shader.program.attributes.map(function(attr) {
            var binding = attributes.static[attr];
            useVAO = useVAO && !!binding;
            return binding;
          });
          if (useVAO && staticBindings.length > 0) {
            var vao = attributeState.getVAO(attributeState.createVAO({
              attributes: staticBindings,
              elements: draw.static.elements
            }));
            result.drawVAO = new Declaration(null, null, null, function(env2, scope) {
              return env2.link(vao);
            });
            result.useVAO = true;
          }
        }
        if (attribLocations) {
          result.useVAO = true;
        } else {
          result.attributes = parseAttributes(attributes, env);
        }
        result.context = parseContext(context2);
        return result;
      }
      function emitContext(env, scope, context2) {
        var shared = env.shared;
        var CONTEXT = shared.context;
        var contextEnter = env.scope();
        Object.keys(context2).forEach(function(name) {
          scope.save(CONTEXT, "." + name);
          var defn = context2[name];
          var value = defn.append(env, scope);
          if (Array.isArray(value)) {
            contextEnter(CONTEXT, ".", name, "=[", value.join(), "];");
          } else {
            contextEnter(CONTEXT, ".", name, "=", value, ";");
          }
        });
        scope(contextEnter);
      }
      function emitPollFramebuffer(env, scope, framebuffer, skipCheck) {
        var shared = env.shared;
        var GL = shared.gl;
        var FRAMEBUFFER_STATE = shared.framebuffer;
        var EXT_DRAW_BUFFERS;
        if (extDrawBuffers) {
          EXT_DRAW_BUFFERS = scope.def(shared.extensions, ".webgl_draw_buffers");
        }
        var constants2 = env.constants;
        var DRAW_BUFFERS = constants2.drawBuffer;
        var BACK_BUFFER = constants2.backBuffer;
        var NEXT;
        if (framebuffer) {
          NEXT = framebuffer.append(env, scope);
        } else {
          NEXT = scope.def(FRAMEBUFFER_STATE, ".next");
        }
        if (!skipCheck) {
          scope("if(", NEXT, "!==", FRAMEBUFFER_STATE, ".cur){");
        }
        scope(
          "if(",
          NEXT,
          "){",
          GL,
          ".bindFramebuffer(",
          GL_FRAMEBUFFER$2,
          ",",
          NEXT,
          ".framebuffer);"
        );
        if (extDrawBuffers) {
          scope(
            EXT_DRAW_BUFFERS,
            ".drawBuffersWEBGL(",
            DRAW_BUFFERS,
            "[",
            NEXT,
            ".colorAttachments.length]);"
          );
        }
        scope(
          "}else{",
          GL,
          ".bindFramebuffer(",
          GL_FRAMEBUFFER$2,
          ",null);"
        );
        if (extDrawBuffers) {
          scope(EXT_DRAW_BUFFERS, ".drawBuffersWEBGL(", BACK_BUFFER, ");");
        }
        scope(
          "}",
          FRAMEBUFFER_STATE,
          ".cur=",
          NEXT,
          ";"
        );
        if (!skipCheck) {
          scope("}");
        }
      }
      function emitPollState(env, scope, args) {
        var shared = env.shared;
        var GL = shared.gl;
        var CURRENT_VARS = env.current;
        var NEXT_VARS = env.next;
        var CURRENT_STATE = shared.current;
        var NEXT_STATE = shared.next;
        var block = env.cond(CURRENT_STATE, ".dirty");
        GL_STATE_NAMES.forEach(function(prop) {
          var param = propName(prop);
          if (param in args.state) {
            return;
          }
          var NEXT, CURRENT;
          if (param in NEXT_VARS) {
            NEXT = NEXT_VARS[param];
            CURRENT = CURRENT_VARS[param];
            var parts = loop(currentState[param].length, function(i) {
              return block.def(NEXT, "[", i, "]");
            });
            block(env.cond(parts.map(function(p, i) {
              return p + "!==" + CURRENT + "[" + i + "]";
            }).join("||")).then(
              GL,
              ".",
              GL_VARIABLES[param],
              "(",
              parts,
              ");",
              parts.map(function(p, i) {
                return CURRENT + "[" + i + "]=" + p;
              }).join(";"),
              ";"
            ));
          } else {
            NEXT = block.def(NEXT_STATE, ".", param);
            var ifte = env.cond(NEXT, "!==", CURRENT_STATE, ".", param);
            block(ifte);
            if (param in GL_FLAGS) {
              ifte(
                env.cond(NEXT).then(GL, ".enable(", GL_FLAGS[param], ");").else(GL, ".disable(", GL_FLAGS[param], ");"),
                CURRENT_STATE,
                ".",
                param,
                "=",
                NEXT,
                ";"
              );
            } else {
              ifte(
                GL,
                ".",
                GL_VARIABLES[param],
                "(",
                NEXT,
                ");",
                CURRENT_STATE,
                ".",
                param,
                "=",
                NEXT,
                ";"
              );
            }
          }
        });
        if (Object.keys(args.state).length === 0) {
          block(CURRENT_STATE, ".dirty=false;");
        }
        scope(block);
      }
      function emitSetOptions(env, scope, options, filter2) {
        var shared = env.shared;
        var CURRENT_VARS = env.current;
        var CURRENT_STATE = shared.current;
        var GL = shared.gl;
        sortState(Object.keys(options)).forEach(function(param) {
          var defn = options[param];
          if (filter2 && !filter2(defn)) {
            return;
          }
          var variable = defn.append(env, scope);
          if (GL_FLAGS[param]) {
            var flag = GL_FLAGS[param];
            if (isStatic(defn)) {
              if (variable) {
                scope(GL, ".enable(", flag, ");");
              } else {
                scope(GL, ".disable(", flag, ");");
              }
            } else {
              scope(env.cond(variable).then(GL, ".enable(", flag, ");").else(GL, ".disable(", flag, ");"));
            }
            scope(CURRENT_STATE, ".", param, "=", variable, ";");
          } else if (isArrayLike(variable)) {
            var CURRENT = CURRENT_VARS[param];
            scope(
              GL,
              ".",
              GL_VARIABLES[param],
              "(",
              variable,
              ");",
              variable.map(function(v, i) {
                return CURRENT + "[" + i + "]=" + v;
              }).join(";"),
              ";"
            );
          } else {
            scope(
              GL,
              ".",
              GL_VARIABLES[param],
              "(",
              variable,
              ");",
              CURRENT_STATE,
              ".",
              param,
              "=",
              variable,
              ";"
            );
          }
        });
      }
      function injectExtensions(env, scope) {
        if (extInstancing) {
          env.instancing = scope.def(
            env.shared.extensions,
            ".angle_instanced_arrays"
          );
        }
      }
      function emitProfile(env, scope, args, useScope, incrementCounter) {
        var shared = env.shared;
        var STATS = env.stats;
        var CURRENT_STATE = shared.current;
        var TIMER = shared.timer;
        var profileArg = args.profile;
        function perfCounter() {
          if (typeof performance === "undefined") {
            return "Date.now()";
          } else {
            return "performance.now()";
          }
        }
        var CPU_START, QUERY_COUNTER;
        function emitProfileStart(block) {
          CPU_START = scope.def();
          block(CPU_START, "=", perfCounter(), ";");
          if (typeof incrementCounter === "string") {
            block(STATS, ".count+=", incrementCounter, ";");
          } else {
            block(STATS, ".count++;");
          }
          if (timer2) {
            if (useScope) {
              QUERY_COUNTER = scope.def();
              block(QUERY_COUNTER, "=", TIMER, ".getNumPendingQueries();");
            } else {
              block(TIMER, ".beginQuery(", STATS, ");");
            }
          }
        }
        function emitProfileEnd(block) {
          block(STATS, ".cpuTime+=", perfCounter(), "-", CPU_START, ";");
          if (timer2) {
            if (useScope) {
              block(
                TIMER,
                ".pushScopeStats(",
                QUERY_COUNTER,
                ",",
                TIMER,
                ".getNumPendingQueries(),",
                STATS,
                ");"
              );
            } else {
              block(TIMER, ".endQuery();");
            }
          }
        }
        function scopeProfile(value) {
          var prev = scope.def(CURRENT_STATE, ".profile");
          scope(CURRENT_STATE, ".profile=", value, ";");
          scope.exit(CURRENT_STATE, ".profile=", prev, ";");
        }
        var USE_PROFILE;
        if (profileArg) {
          if (isStatic(profileArg)) {
            if (profileArg.enable) {
              emitProfileStart(scope);
              emitProfileEnd(scope.exit);
              scopeProfile("true");
            } else {
              scopeProfile("false");
            }
            return;
          }
          USE_PROFILE = profileArg.append(env, scope);
          scopeProfile(USE_PROFILE);
        } else {
          USE_PROFILE = scope.def(CURRENT_STATE, ".profile");
        }
        var start2 = env.block();
        emitProfileStart(start2);
        scope("if(", USE_PROFILE, "){", start2, "}");
        var end = env.block();
        emitProfileEnd(end);
        scope.exit("if(", USE_PROFILE, "){", end, "}");
      }
      function emitAttributes(env, scope, args, attributes, filter2) {
        var shared = env.shared;
        function typeLength(x) {
          switch (x) {
            case GL_FLOAT_VEC2:
            case GL_INT_VEC2:
            case GL_BOOL_VEC2:
              return 2;
            case GL_FLOAT_VEC3:
            case GL_INT_VEC3:
            case GL_BOOL_VEC3:
              return 3;
            case GL_FLOAT_VEC4:
            case GL_INT_VEC4:
            case GL_BOOL_VEC4:
              return 4;
            default:
              return 1;
          }
        }
        function emitBindAttribute(ATTRIBUTE, size, record) {
          var GL = shared.gl;
          var LOCATION = scope.def(ATTRIBUTE, ".location");
          var BINDING = scope.def(shared.attributes, "[", LOCATION, "]");
          var STATE = record.state;
          var BUFFER = record.buffer;
          var CONST_COMPONENTS = [
            record.x,
            record.y,
            record.z,
            record.w
          ];
          var COMMON_KEYS = [
            "buffer",
            "normalized",
            "offset",
            "stride"
          ];
          function emitBuffer() {
            scope(
              "if(!",
              BINDING,
              ".buffer){",
              GL,
              ".enableVertexAttribArray(",
              LOCATION,
              ");}"
            );
            var TYPE = record.type;
            var SIZE;
            if (!record.size) {
              SIZE = size;
            } else {
              SIZE = scope.def(record.size, "||", size);
            }
            scope(
              "if(",
              BINDING,
              ".type!==",
              TYPE,
              "||",
              BINDING,
              ".size!==",
              SIZE,
              "||",
              COMMON_KEYS.map(function(key) {
                return BINDING + "." + key + "!==" + record[key];
              }).join("||"),
              "){",
              GL,
              ".bindBuffer(",
              GL_ARRAY_BUFFER$2,
              ",",
              BUFFER,
              ".buffer);",
              GL,
              ".vertexAttribPointer(",
              [
                LOCATION,
                SIZE,
                TYPE,
                record.normalized,
                record.stride,
                record.offset
              ],
              ");",
              BINDING,
              ".type=",
              TYPE,
              ";",
              BINDING,
              ".size=",
              SIZE,
              ";",
              COMMON_KEYS.map(function(key) {
                return BINDING + "." + key + "=" + record[key] + ";";
              }).join(""),
              "}"
            );
            if (extInstancing) {
              var DIVISOR = record.divisor;
              scope(
                "if(",
                BINDING,
                ".divisor!==",
                DIVISOR,
                "){",
                env.instancing,
                ".vertexAttribDivisorANGLE(",
                [LOCATION, DIVISOR],
                ");",
                BINDING,
                ".divisor=",
                DIVISOR,
                ";}"
              );
            }
          }
          function emitConstant() {
            scope(
              "if(",
              BINDING,
              ".buffer){",
              GL,
              ".disableVertexAttribArray(",
              LOCATION,
              ");",
              BINDING,
              ".buffer=null;",
              "}if(",
              CUTE_COMPONENTS.map(function(c2, i) {
                return BINDING + "." + c2 + "!==" + CONST_COMPONENTS[i];
              }).join("||"),
              "){",
              GL,
              ".vertexAttrib4f(",
              LOCATION,
              ",",
              CONST_COMPONENTS,
              ");",
              CUTE_COMPONENTS.map(function(c2, i) {
                return BINDING + "." + c2 + "=" + CONST_COMPONENTS[i] + ";";
              }).join(""),
              "}"
            );
          }
          if (STATE === ATTRIB_STATE_POINTER) {
            emitBuffer();
          } else if (STATE === ATTRIB_STATE_CONSTANT) {
            emitConstant();
          } else {
            scope("if(", STATE, "===", ATTRIB_STATE_POINTER, "){");
            emitBuffer();
            scope("}else{");
            emitConstant();
            scope("}");
          }
        }
        attributes.forEach(function(attribute) {
          var name = attribute.name;
          var arg = args.attributes[name];
          var record;
          if (arg) {
            if (!filter2(arg)) {
              return;
            }
            record = arg.append(env, scope);
          } else {
            if (!filter2(SCOPE_DECL)) {
              return;
            }
            var scopeAttrib = env.scopeAttrib(name);
            check$1.optional(function() {
              env.assert(
                scope,
                scopeAttrib + ".state",
                "missing attribute " + name
              );
            });
            record = {};
            Object.keys(new AttributeRecord2()).forEach(function(key) {
              record[key] = scope.def(scopeAttrib, ".", key);
            });
          }
          emitBindAttribute(
            env.link(attribute),
            typeLength(attribute.info.type),
            record
          );
        });
      }
      function emitUniforms(env, scope, args, uniforms, filter2, isBatchInnerLoop) {
        var shared = env.shared;
        var GL = shared.gl;
        var definedArrUniforms = {};
        var infix;
        for (var i = 0; i < uniforms.length; ++i) {
          var uniform = uniforms[i];
          var name = uniform.name;
          var type = uniform.info.type;
          var size = uniform.info.size;
          var arg = args.uniforms[name];
          if (size > 1) {
            if (!arg) {
              continue;
            }
            var arrUniformName = name.replace("[0]", "");
            if (definedArrUniforms[arrUniformName]) {
              continue;
            }
            definedArrUniforms[arrUniformName] = 1;
          }
          var UNIFORM = env.link(uniform);
          var LOCATION = UNIFORM + ".location";
          var VALUE;
          if (arg) {
            if (!filter2(arg)) {
              continue;
            }
            if (isStatic(arg)) {
              var value = arg.value;
              check$1.command(
                value !== null && typeof value !== "undefined",
                'missing uniform "' + name + '"',
                env.commandStr
              );
              if (type === GL_SAMPLER_2D || type === GL_SAMPLER_CUBE) {
                check$1.command(
                  typeof value === "function" && (type === GL_SAMPLER_2D && (value._reglType === "texture2d" || value._reglType === "framebuffer") || type === GL_SAMPLER_CUBE && (value._reglType === "textureCube" || value._reglType === "framebufferCube")),
                  "invalid texture for uniform " + name,
                  env.commandStr
                );
                var TEX_VALUE = env.link(value._texture || value.color[0]._texture);
                scope(GL, ".uniform1i(", LOCATION, ",", TEX_VALUE + ".bind());");
                scope.exit(TEX_VALUE, ".unbind();");
              } else if (type === GL_FLOAT_MAT2 || type === GL_FLOAT_MAT3 || type === GL_FLOAT_MAT4) {
                check$1.optional(function() {
                  check$1.command(
                    isArrayLike(value),
                    "invalid matrix for uniform " + name,
                    env.commandStr
                  );
                  check$1.command(
                    type === GL_FLOAT_MAT2 && value.length === 4 || type === GL_FLOAT_MAT3 && value.length === 9 || type === GL_FLOAT_MAT4 && value.length === 16,
                    "invalid length for matrix uniform " + name,
                    env.commandStr
                  );
                });
                var MAT_VALUE = env.global.def("new Float32Array([" + Array.prototype.slice.call(value) + "])");
                var dim = 2;
                if (type === GL_FLOAT_MAT3) {
                  dim = 3;
                } else if (type === GL_FLOAT_MAT4) {
                  dim = 4;
                }
                scope(
                  GL,
                  ".uniformMatrix",
                  dim,
                  "fv(",
                  LOCATION,
                  ",false,",
                  MAT_VALUE,
                  ");"
                );
              } else {
                switch (type) {
                  case GL_FLOAT$8:
                    if (size === 1) {
                      check$1.commandType(value, "number", "uniform " + name, env.commandStr);
                    } else {
                      check$1.command(
                        isArrayLike(value) && value.length === size,
                        "uniform " + name,
                        env.commandStr
                      );
                    }
                    infix = "1f";
                    break;
                  case GL_FLOAT_VEC2:
                    check$1.command(
                      isArrayLike(value) && (value.length && value.length % 2 === 0 && value.length <= size * 2),
                      "uniform " + name,
                      env.commandStr
                    );
                    infix = "2f";
                    break;
                  case GL_FLOAT_VEC3:
                    check$1.command(
                      isArrayLike(value) && (value.length && value.length % 3 === 0 && value.length <= size * 3),
                      "uniform " + name,
                      env.commandStr
                    );
                    infix = "3f";
                    break;
                  case GL_FLOAT_VEC4:
                    check$1.command(
                      isArrayLike(value) && (value.length && value.length % 4 === 0 && value.length <= size * 4),
                      "uniform " + name,
                      env.commandStr
                    );
                    infix = "4f";
                    break;
                  case GL_BOOL:
                    if (size === 1) {
                      check$1.commandType(value, "boolean", "uniform " + name, env.commandStr);
                    } else {
                      check$1.command(
                        isArrayLike(value) && value.length === size,
                        "uniform " + name,
                        env.commandStr
                      );
                    }
                    infix = "1i";
                    break;
                  case GL_INT$3:
                    if (size === 1) {
                      check$1.commandType(value, "number", "uniform " + name, env.commandStr);
                    } else {
                      check$1.command(
                        isArrayLike(value) && value.length === size,
                        "uniform " + name,
                        env.commandStr
                      );
                    }
                    infix = "1i";
                    break;
                  case GL_BOOL_VEC2:
                    check$1.command(
                      isArrayLike(value) && (value.length && value.length % 2 === 0 && value.length <= size * 2),
                      "uniform " + name,
                      env.commandStr
                    );
                    infix = "2i";
                    break;
                  case GL_INT_VEC2:
                    check$1.command(
                      isArrayLike(value) && (value.length && value.length % 2 === 0 && value.length <= size * 2),
                      "uniform " + name,
                      env.commandStr
                    );
                    infix = "2i";
                    break;
                  case GL_BOOL_VEC3:
                    check$1.command(
                      isArrayLike(value) && (value.length && value.length % 3 === 0 && value.length <= size * 3),
                      "uniform " + name,
                      env.commandStr
                    );
                    infix = "3i";
                    break;
                  case GL_INT_VEC3:
                    check$1.command(
                      isArrayLike(value) && (value.length && value.length % 3 === 0 && value.length <= size * 3),
                      "uniform " + name,
                      env.commandStr
                    );
                    infix = "3i";
                    break;
                  case GL_BOOL_VEC4:
                    check$1.command(
                      isArrayLike(value) && (value.length && value.length % 4 === 0 && value.length <= size * 4),
                      "uniform " + name,
                      env.commandStr
                    );
                    infix = "4i";
                    break;
                  case GL_INT_VEC4:
                    check$1.command(
                      isArrayLike(value) && (value.length && value.length % 4 === 0 && value.length <= size * 4),
                      "uniform " + name,
                      env.commandStr
                    );
                    infix = "4i";
                    break;
                }
                if (size > 1) {
                  infix += "v";
                  value = env.global.def("[" + Array.prototype.slice.call(value) + "]");
                } else {
                  value = isArrayLike(value) ? Array.prototype.slice.call(value) : value;
                }
                scope(
                  GL,
                  ".uniform",
                  infix,
                  "(",
                  LOCATION,
                  ",",
                  value,
                  ");"
                );
              }
              continue;
            } else {
              VALUE = arg.append(env, scope);
            }
          } else {
            if (!filter2(SCOPE_DECL)) {
              continue;
            }
            VALUE = scope.def(shared.uniforms, "[", stringStore.id(name), "]");
          }
          if (type === GL_SAMPLER_2D) {
            check$1(!Array.isArray(VALUE), "must specify a scalar prop for textures");
            scope(
              "if(",
              VALUE,
              "&&",
              VALUE,
              '._reglType==="framebuffer"){',
              VALUE,
              "=",
              VALUE,
              ".color[0];",
              "}"
            );
          } else if (type === GL_SAMPLER_CUBE) {
            check$1(!Array.isArray(VALUE), "must specify a scalar prop for cube maps");
            scope(
              "if(",
              VALUE,
              "&&",
              VALUE,
              '._reglType==="framebufferCube"){',
              VALUE,
              "=",
              VALUE,
              ".color[0];",
              "}"
            );
          }
          check$1.optional(function() {
            function emitCheck(pred, message) {
              env.assert(
                scope,
                pred,
                'bad data or missing for uniform "' + name + '".  ' + message
              );
            }
            function checkType(type2, size2) {
              if (size2 === 1) {
                check$1(!Array.isArray(VALUE), "must not specify an array type for uniform");
              }
              emitCheck(
                "Array.isArray(" + VALUE + ") && typeof " + VALUE + '[0]===" ' + type2 + '" || typeof ' + VALUE + '==="' + type2 + '"',
                "invalid type, expected " + type2
              );
            }
            function checkVector(n, type2, size2) {
              if (Array.isArray(VALUE)) {
                check$1(VALUE.length && VALUE.length % n === 0 && VALUE.length <= n * size2, "must have length of " + (size2 === 1 ? "" : "n * ") + n);
              } else {
                emitCheck(
                  shared.isArrayLike + "(" + VALUE + ")&&" + VALUE + ".length && " + VALUE + ".length % " + n + " === 0 && " + VALUE + ".length<=" + n * size2,
                  "invalid vector, should have length of " + (size2 === 1 ? "" : "n * ") + n,
                  env.commandStr
                );
              }
            }
            function checkTexture(target) {
              check$1(!Array.isArray(VALUE), "must not specify a value type");
              emitCheck(
                "typeof " + VALUE + '==="function"&&' + VALUE + '._reglType==="texture' + (target === GL_TEXTURE_2D$3 ? "2d" : "Cube") + '"',
                "invalid texture type",
                env.commandStr
              );
            }
            switch (type) {
              case GL_INT$3:
                checkType("number", size);
                break;
              case GL_INT_VEC2:
                checkVector(2, "number", size);
                break;
              case GL_INT_VEC3:
                checkVector(3, "number", size);
                break;
              case GL_INT_VEC4:
                checkVector(4, "number", size);
                break;
              case GL_FLOAT$8:
                checkType("number", size);
                break;
              case GL_FLOAT_VEC2:
                checkVector(2, "number", size);
                break;
              case GL_FLOAT_VEC3:
                checkVector(3, "number", size);
                break;
              case GL_FLOAT_VEC4:
                checkVector(4, "number", size);
                break;
              case GL_BOOL:
                checkType("boolean", size);
                break;
              case GL_BOOL_VEC2:
                checkVector(2, "boolean", size);
                break;
              case GL_BOOL_VEC3:
                checkVector(3, "boolean", size);
                break;
              case GL_BOOL_VEC4:
                checkVector(4, "boolean", size);
                break;
              case GL_FLOAT_MAT2:
                checkVector(4, "number", size);
                break;
              case GL_FLOAT_MAT3:
                checkVector(9, "number", size);
                break;
              case GL_FLOAT_MAT4:
                checkVector(16, "number", size);
                break;
              case GL_SAMPLER_2D:
                checkTexture(GL_TEXTURE_2D$3);
                break;
              case GL_SAMPLER_CUBE:
                checkTexture(GL_TEXTURE_CUBE_MAP$2);
                break;
            }
          });
          var unroll = 1;
          switch (type) {
            case GL_SAMPLER_2D:
            case GL_SAMPLER_CUBE:
              var TEX = scope.def(VALUE, "._texture");
              scope(GL, ".uniform1i(", LOCATION, ",", TEX, ".bind());");
              scope.exit(TEX, ".unbind();");
              continue;
            case GL_INT$3:
            case GL_BOOL:
              infix = "1i";
              break;
            case GL_INT_VEC2:
            case GL_BOOL_VEC2:
              infix = "2i";
              unroll = 2;
              break;
            case GL_INT_VEC3:
            case GL_BOOL_VEC3:
              infix = "3i";
              unroll = 3;
              break;
            case GL_INT_VEC4:
            case GL_BOOL_VEC4:
              infix = "4i";
              unroll = 4;
              break;
            case GL_FLOAT$8:
              infix = "1f";
              break;
            case GL_FLOAT_VEC2:
              infix = "2f";
              unroll = 2;
              break;
            case GL_FLOAT_VEC3:
              infix = "3f";
              unroll = 3;
              break;
            case GL_FLOAT_VEC4:
              infix = "4f";
              unroll = 4;
              break;
            case GL_FLOAT_MAT2:
              infix = "Matrix2fv";
              break;
            case GL_FLOAT_MAT3:
              infix = "Matrix3fv";
              break;
            case GL_FLOAT_MAT4:
              infix = "Matrix4fv";
              break;
          }
          if (infix.indexOf("Matrix") === -1 && size > 1) {
            infix += "v";
            unroll = 1;
          }
          if (infix.charAt(0) === "M") {
            scope(GL, ".uniform", infix, "(", LOCATION, ",");
            var matSize = Math.pow(type - GL_FLOAT_MAT2 + 2, 2);
            var STORAGE = env.global.def("new Float32Array(", matSize, ")");
            if (Array.isArray(VALUE)) {
              scope(
                "false,(",
                loop(matSize, function(i2) {
                  return STORAGE + "[" + i2 + "]=" + VALUE[i2];
                }),
                ",",
                STORAGE,
                ")"
              );
            } else {
              scope(
                "false,(Array.isArray(",
                VALUE,
                ")||",
                VALUE,
                " instanceof Float32Array)?",
                VALUE,
                ":(",
                loop(matSize, function(i2) {
                  return STORAGE + "[" + i2 + "]=" + VALUE + "[" + i2 + "]";
                }),
                ",",
                STORAGE,
                ")"
              );
            }
            scope(");");
          } else if (unroll > 1) {
            var prev = [];
            var cur = [];
            for (var j = 0; j < unroll; ++j) {
              if (Array.isArray(VALUE)) {
                cur.push(VALUE[j]);
              } else {
                cur.push(scope.def(VALUE + "[" + j + "]"));
              }
              if (isBatchInnerLoop) {
                prev.push(scope.def());
              }
            }
            if (isBatchInnerLoop) {
              scope("if(!", env.batchId, "||", prev.map(function(p, i2) {
                return p + "!==" + cur[i2];
              }).join("||"), "){", prev.map(function(p, i2) {
                return p + "=" + cur[i2] + ";";
              }).join(""));
            }
            scope(GL, ".uniform", infix, "(", LOCATION, ",", cur.join(","), ");");
            if (isBatchInnerLoop) {
              scope("}");
            }
          } else {
            check$1(!Array.isArray(VALUE), "uniform value must not be an array");
            if (isBatchInnerLoop) {
              var prevS = scope.def();
              scope(
                "if(!",
                env.batchId,
                "||",
                prevS,
                "!==",
                VALUE,
                "){",
                prevS,
                "=",
                VALUE,
                ";"
              );
            }
            scope(GL, ".uniform", infix, "(", LOCATION, ",", VALUE, ");");
            if (isBatchInnerLoop) {
              scope("}");
            }
          }
        }
      }
      function emitDraw(env, outer, inner, args) {
        var shared = env.shared;
        var GL = shared.gl;
        var DRAW_STATE = shared.draw;
        var drawOptions = args.draw;
        function emitElements() {
          var defn = drawOptions.elements;
          var ELEMENTS2;
          var scope = outer;
          if (defn) {
            if (defn.contextDep && args.contextDynamic || defn.propDep) {
              scope = inner;
            }
            ELEMENTS2 = defn.append(env, scope);
            if (drawOptions.elementsActive) {
              scope(
                "if(" + ELEMENTS2 + ")" + GL + ".bindBuffer(" + GL_ELEMENT_ARRAY_BUFFER$2 + "," + ELEMENTS2 + ".buffer.buffer);"
              );
            }
          } else {
            ELEMENTS2 = scope.def();
            scope(
              ELEMENTS2,
              "=",
              DRAW_STATE,
              ".",
              S_ELEMENTS,
              ";",
              "if(",
              ELEMENTS2,
              "){",
              GL,
              ".bindBuffer(",
              GL_ELEMENT_ARRAY_BUFFER$2,
              ",",
              ELEMENTS2,
              ".buffer.buffer);}",
              "else if(",
              shared.vao,
              ".currentVAO){",
              ELEMENTS2,
              "=",
              env.shared.elements + ".getElements(" + shared.vao,
              ".currentVAO.elements);",
              !extVertexArrays ? "if(" + ELEMENTS2 + ")" + GL + ".bindBuffer(" + GL_ELEMENT_ARRAY_BUFFER$2 + "," + ELEMENTS2 + ".buffer.buffer);" : "",
              "}"
            );
          }
          return ELEMENTS2;
        }
        function emitCount() {
          var defn = drawOptions.count;
          var COUNT2;
          var scope = outer;
          if (defn) {
            if (defn.contextDep && args.contextDynamic || defn.propDep) {
              scope = inner;
            }
            COUNT2 = defn.append(env, scope);
            check$1.optional(function() {
              if (defn.MISSING) {
                env.assert(outer, "false", "missing vertex count");
              }
              if (defn.DYNAMIC) {
                env.assert(scope, COUNT2 + ">=0", "missing vertex count");
              }
            });
          } else {
            COUNT2 = scope.def(DRAW_STATE, ".", S_COUNT);
            check$1.optional(function() {
              env.assert(scope, COUNT2 + ">=0", "missing vertex count");
            });
          }
          return COUNT2;
        }
        var ELEMENTS = emitElements();
        function emitValue(name) {
          var defn = drawOptions[name];
          if (defn) {
            if (defn.contextDep && args.contextDynamic || defn.propDep) {
              return defn.append(env, inner);
            } else {
              return defn.append(env, outer);
            }
          } else {
            return outer.def(DRAW_STATE, ".", name);
          }
        }
        var PRIMITIVE = emitValue(S_PRIMITIVE);
        var OFFSET = emitValue(S_OFFSET);
        var COUNT = emitCount();
        if (typeof COUNT === "number") {
          if (COUNT === 0) {
            return;
          }
        } else {
          inner("if(", COUNT, "){");
          inner.exit("}");
        }
        var INSTANCES, EXT_INSTANCING;
        if (extInstancing) {
          INSTANCES = emitValue(S_INSTANCES);
          EXT_INSTANCING = env.instancing;
        }
        var ELEMENT_TYPE = ELEMENTS + ".type";
        var elementsStatic = drawOptions.elements && isStatic(drawOptions.elements) && !drawOptions.vaoActive;
        function emitInstancing() {
          function drawElements() {
            inner(EXT_INSTANCING, ".drawElementsInstancedANGLE(", [
              PRIMITIVE,
              COUNT,
              ELEMENT_TYPE,
              OFFSET + "<<((" + ELEMENT_TYPE + "-" + GL_UNSIGNED_BYTE$8 + ")>>1)",
              INSTANCES
            ], ");");
          }
          function drawArrays() {
            inner(
              EXT_INSTANCING,
              ".drawArraysInstancedANGLE(",
              [PRIMITIVE, OFFSET, COUNT, INSTANCES],
              ");"
            );
          }
          if (ELEMENTS && ELEMENTS !== "null") {
            if (!elementsStatic) {
              inner("if(", ELEMENTS, "){");
              drawElements();
              inner("}else{");
              drawArrays();
              inner("}");
            } else {
              drawElements();
            }
          } else {
            drawArrays();
          }
        }
        function emitRegular() {
          function drawElements() {
            inner(GL + ".drawElements(" + [
              PRIMITIVE,
              COUNT,
              ELEMENT_TYPE,
              OFFSET + "<<((" + ELEMENT_TYPE + "-" + GL_UNSIGNED_BYTE$8 + ")>>1)"
            ] + ");");
          }
          function drawArrays() {
            inner(GL + ".drawArrays(" + [PRIMITIVE, OFFSET, COUNT] + ");");
          }
          if (ELEMENTS && ELEMENTS !== "null") {
            if (!elementsStatic) {
              inner("if(", ELEMENTS, "){");
              drawElements();
              inner("}else{");
              drawArrays();
              inner("}");
            } else {
              drawElements();
            }
          } else {
            drawArrays();
          }
        }
        if (extInstancing && (typeof INSTANCES !== "number" || INSTANCES >= 0)) {
          if (typeof INSTANCES === "string") {
            inner("if(", INSTANCES, ">0){");
            emitInstancing();
            inner("}else if(", INSTANCES, "<0){");
            emitRegular();
            inner("}");
          } else {
            emitInstancing();
          }
        } else {
          emitRegular();
        }
      }
      function createBody(emitBody, parentEnv, args, program, count) {
        var env = createREGLEnvironment();
        var scope = env.proc("body", count);
        check$1.optional(function() {
          env.commandStr = parentEnv.commandStr;
          env.command = env.link(parentEnv.commandStr);
        });
        if (extInstancing) {
          env.instancing = scope.def(
            env.shared.extensions,
            ".angle_instanced_arrays"
          );
        }
        emitBody(env, scope, args, program);
        return env.compile().body;
      }
      function emitDrawBody(env, draw, args, program) {
        injectExtensions(env, draw);
        if (args.useVAO) {
          if (args.drawVAO) {
            draw(env.shared.vao, ".setVAO(", args.drawVAO.append(env, draw), ");");
          } else {
            draw(env.shared.vao, ".setVAO(", env.shared.vao, ".targetVAO);");
          }
        } else {
          draw(env.shared.vao, ".setVAO(null);");
          emitAttributes(env, draw, args, program.attributes, function() {
            return true;
          });
        }
        emitUniforms(env, draw, args, program.uniforms, function() {
          return true;
        }, false);
        emitDraw(env, draw, draw, args);
      }
      function emitDrawProc(env, args) {
        var draw = env.proc("draw", 1);
        injectExtensions(env, draw);
        emitContext(env, draw, args.context);
        emitPollFramebuffer(env, draw, args.framebuffer);
        emitPollState(env, draw, args);
        emitSetOptions(env, draw, args.state);
        emitProfile(env, draw, args, false, true);
        var program = args.shader.progVar.append(env, draw);
        draw(env.shared.gl, ".useProgram(", program, ".program);");
        if (args.shader.program) {
          emitDrawBody(env, draw, args, args.shader.program);
        } else {
          draw(env.shared.vao, ".setVAO(null);");
          var drawCache = env.global.def("{}");
          var PROG_ID = draw.def(program, ".id");
          var CACHED_PROC = draw.def(drawCache, "[", PROG_ID, "]");
          draw(
            env.cond(CACHED_PROC).then(CACHED_PROC, ".call(this,a0);").else(
              CACHED_PROC,
              "=",
              drawCache,
              "[",
              PROG_ID,
              "]=",
              env.link(function(program2) {
                return createBody(emitDrawBody, env, args, program2, 1);
              }),
              "(",
              program,
              ");",
              CACHED_PROC,
              ".call(this,a0);"
            )
          );
        }
        if (Object.keys(args.state).length > 0) {
          draw(env.shared.current, ".dirty=true;");
        }
        if (env.shared.vao) {
          draw(env.shared.vao, ".setVAO(null);");
        }
      }
      function emitBatchDynamicShaderBody(env, scope, args, program) {
        env.batchId = "a1";
        injectExtensions(env, scope);
        function all() {
          return true;
        }
        emitAttributes(env, scope, args, program.attributes, all);
        emitUniforms(env, scope, args, program.uniforms, all, false);
        emitDraw(env, scope, scope, args);
      }
      function emitBatchBody(env, scope, args, program) {
        injectExtensions(env, scope);
        var contextDynamic = args.contextDep;
        var BATCH_ID = scope.def();
        var PROP_LIST = "a0";
        var NUM_PROPS = "a1";
        var PROPS = scope.def();
        env.shared.props = PROPS;
        env.batchId = BATCH_ID;
        var outer = env.scope();
        var inner = env.scope();
        scope(
          outer.entry,
          "for(",
          BATCH_ID,
          "=0;",
          BATCH_ID,
          "<",
          NUM_PROPS,
          ";++",
          BATCH_ID,
          "){",
          PROPS,
          "=",
          PROP_LIST,
          "[",
          BATCH_ID,
          "];",
          inner,
          "}",
          outer.exit
        );
        function isInnerDefn(defn) {
          return defn.contextDep && contextDynamic || defn.propDep;
        }
        function isOuterDefn(defn) {
          return !isInnerDefn(defn);
        }
        if (args.needsContext) {
          emitContext(env, inner, args.context);
        }
        if (args.needsFramebuffer) {
          emitPollFramebuffer(env, inner, args.framebuffer);
        }
        emitSetOptions(env, inner, args.state, isInnerDefn);
        if (args.profile && isInnerDefn(args.profile)) {
          emitProfile(env, inner, args, false, true);
        }
        if (!program) {
          var progCache = env.global.def("{}");
          var PROGRAM = args.shader.progVar.append(env, inner);
          var PROG_ID = inner.def(PROGRAM, ".id");
          var CACHED_PROC = inner.def(progCache, "[", PROG_ID, "]");
          inner(
            env.shared.gl,
            ".useProgram(",
            PROGRAM,
            ".program);",
            "if(!",
            CACHED_PROC,
            "){",
            CACHED_PROC,
            "=",
            progCache,
            "[",
            PROG_ID,
            "]=",
            env.link(function(program2) {
              return createBody(
                emitBatchDynamicShaderBody,
                env,
                args,
                program2,
                2
              );
            }),
            "(",
            PROGRAM,
            ");}",
            CACHED_PROC,
            ".call(this,a0[",
            BATCH_ID,
            "],",
            BATCH_ID,
            ");"
          );
        } else {
          if (args.useVAO) {
            if (args.drawVAO) {
              if (isInnerDefn(args.drawVAO)) {
                inner(env.shared.vao, ".setVAO(", args.drawVAO.append(env, inner), ");");
              } else {
                outer(env.shared.vao, ".setVAO(", args.drawVAO.append(env, outer), ");");
              }
            } else {
              outer(env.shared.vao, ".setVAO(", env.shared.vao, ".targetVAO);");
            }
          } else {
            outer(env.shared.vao, ".setVAO(null);");
            emitAttributes(env, outer, args, program.attributes, isOuterDefn);
            emitAttributes(env, inner, args, program.attributes, isInnerDefn);
          }
          emitUniforms(env, outer, args, program.uniforms, isOuterDefn, false);
          emitUniforms(env, inner, args, program.uniforms, isInnerDefn, true);
          emitDraw(env, outer, inner, args);
        }
      }
      function emitBatchProc(env, args) {
        var batch = env.proc("batch", 2);
        env.batchId = "0";
        injectExtensions(env, batch);
        var contextDynamic = false;
        var needsContext = true;
        Object.keys(args.context).forEach(function(name) {
          contextDynamic = contextDynamic || args.context[name].propDep;
        });
        if (!contextDynamic) {
          emitContext(env, batch, args.context);
          needsContext = false;
        }
        var framebuffer = args.framebuffer;
        var needsFramebuffer = false;
        if (framebuffer) {
          if (framebuffer.propDep) {
            contextDynamic = needsFramebuffer = true;
          } else if (framebuffer.contextDep && contextDynamic) {
            needsFramebuffer = true;
          }
          if (!needsFramebuffer) {
            emitPollFramebuffer(env, batch, framebuffer);
          }
        } else {
          emitPollFramebuffer(env, batch, null);
        }
        if (args.state.viewport && args.state.viewport.propDep) {
          contextDynamic = true;
        }
        function isInnerDefn(defn) {
          return defn.contextDep && contextDynamic || defn.propDep;
        }
        emitPollState(env, batch, args);
        emitSetOptions(env, batch, args.state, function(defn) {
          return !isInnerDefn(defn);
        });
        if (!args.profile || !isInnerDefn(args.profile)) {
          emitProfile(env, batch, args, false, "a1");
        }
        args.contextDep = contextDynamic;
        args.needsContext = needsContext;
        args.needsFramebuffer = needsFramebuffer;
        var progDefn = args.shader.progVar;
        if (progDefn.contextDep && contextDynamic || progDefn.propDep) {
          emitBatchBody(
            env,
            batch,
            args,
            null
          );
        } else {
          var PROGRAM = progDefn.append(env, batch);
          batch(env.shared.gl, ".useProgram(", PROGRAM, ".program);");
          if (args.shader.program) {
            emitBatchBody(
              env,
              batch,
              args,
              args.shader.program
            );
          } else {
            batch(env.shared.vao, ".setVAO(null);");
            var batchCache = env.global.def("{}");
            var PROG_ID = batch.def(PROGRAM, ".id");
            var CACHED_PROC = batch.def(batchCache, "[", PROG_ID, "]");
            batch(
              env.cond(CACHED_PROC).then(CACHED_PROC, ".call(this,a0,a1);").else(
                CACHED_PROC,
                "=",
                batchCache,
                "[",
                PROG_ID,
                "]=",
                env.link(function(program) {
                  return createBody(emitBatchBody, env, args, program, 2);
                }),
                "(",
                PROGRAM,
                ");",
                CACHED_PROC,
                ".call(this,a0,a1);"
              )
            );
          }
        }
        if (Object.keys(args.state).length > 0) {
          batch(env.shared.current, ".dirty=true;");
        }
        if (env.shared.vao) {
          batch(env.shared.vao, ".setVAO(null);");
        }
      }
      function emitScopeProc(env, args) {
        var scope = env.proc("scope", 3);
        env.batchId = "a2";
        var shared = env.shared;
        var CURRENT_STATE = shared.current;
        emitContext(env, scope, args.context);
        if (args.framebuffer) {
          args.framebuffer.append(env, scope);
        }
        sortState(Object.keys(args.state)).forEach(function(name) {
          var defn = args.state[name];
          var value = defn.append(env, scope);
          if (isArrayLike(value)) {
            value.forEach(function(v, i) {
              scope.set(env.next[name], "[" + i + "]", v);
            });
          } else {
            scope.set(shared.next, "." + name, value);
          }
        });
        emitProfile(env, scope, args, true, true);
        [S_ELEMENTS, S_OFFSET, S_COUNT, S_INSTANCES, S_PRIMITIVE].forEach(
          function(opt) {
            var variable = args.draw[opt];
            if (!variable) {
              return;
            }
            scope.set(shared.draw, "." + opt, "" + variable.append(env, scope));
          }
        );
        Object.keys(args.uniforms).forEach(function(opt) {
          var value = args.uniforms[opt].append(env, scope);
          if (Array.isArray(value)) {
            value = "[" + value.join() + "]";
          }
          scope.set(
            shared.uniforms,
            "[" + stringStore.id(opt) + "]",
            value
          );
        });
        Object.keys(args.attributes).forEach(function(name) {
          var record = args.attributes[name].append(env, scope);
          var scopeAttrib = env.scopeAttrib(name);
          Object.keys(new AttributeRecord2()).forEach(function(prop) {
            scope.set(scopeAttrib, "." + prop, record[prop]);
          });
        });
        if (args.scopeVAO) {
          scope.set(shared.vao, ".targetVAO", args.scopeVAO.append(env, scope));
        }
        function saveShader(name) {
          var shader = args.shader[name];
          if (shader) {
            scope.set(shared.shader, "." + name, shader.append(env, scope));
          }
        }
        saveShader(S_VERT);
        saveShader(S_FRAG);
        if (Object.keys(args.state).length > 0) {
          scope(CURRENT_STATE, ".dirty=true;");
          scope.exit(CURRENT_STATE, ".dirty=true;");
        }
        scope("a1(", env.shared.context, ",a0,", env.batchId, ");");
      }
      function isDynamicObject(object2) {
        if (typeof object2 !== "object" || isArrayLike(object2)) {
          return;
        }
        var props = Object.keys(object2);
        for (var i = 0; i < props.length; ++i) {
          if (dynamic.isDynamic(object2[props[i]])) {
            return true;
          }
        }
        return false;
      }
      function splatObject(env, options, name) {
        var object2 = options.static[name];
        if (!object2 || !isDynamicObject(object2)) {
          return;
        }
        var globals = env.global;
        var keys = Object.keys(object2);
        var thisDep = false;
        var contextDep = false;
        var propDep = false;
        var objectRef = env.global.def("{}");
        keys.forEach(function(key) {
          var value = object2[key];
          if (dynamic.isDynamic(value)) {
            if (typeof value === "function") {
              value = object2[key] = dynamic.unbox(value);
            }
            var deps = createDynamicDecl(value, null);
            thisDep = thisDep || deps.thisDep;
            propDep = propDep || deps.propDep;
            contextDep = contextDep || deps.contextDep;
          } else {
            globals(objectRef, ".", key, "=");
            switch (typeof value) {
              case "number":
                globals(value);
                break;
              case "string":
                globals('"', value, '"');
                break;
              case "object":
                if (Array.isArray(value)) {
                  globals("[", value.join(), "]");
                }
                break;
              default:
                globals(env.link(value));
                break;
            }
            globals(";");
          }
        });
        function appendBlock(env2, block) {
          keys.forEach(function(key) {
            var value = object2[key];
            if (!dynamic.isDynamic(value)) {
              return;
            }
            var ref = env2.invoke(block, value);
            block(objectRef, ".", key, "=", ref, ";");
          });
        }
        options.dynamic[name] = new dynamic.DynamicVariable(DYN_THUNK, {
          thisDep,
          contextDep,
          propDep,
          ref: objectRef,
          append: appendBlock
        });
        delete options.static[name];
      }
      function compileCommand(options, attributes, uniforms, context2, stats2) {
        var env = createREGLEnvironment();
        env.stats = env.link(stats2);
        Object.keys(attributes.static).forEach(function(key) {
          splatObject(env, attributes, key);
        });
        NESTED_OPTIONS.forEach(function(name) {
          splatObject(env, options, name);
        });
        var args = parseArguments(options, attributes, uniforms, context2, env);
        emitDrawProc(env, args);
        emitScopeProc(env, args);
        emitBatchProc(env, args);
        return extend2(env.compile(), {
          destroy: function() {
            args.shader.program.destroy();
          }
        });
      }
      return {
        next: nextState,
        current: currentState,
        procs: function() {
          var env = createREGLEnvironment();
          var poll = env.proc("poll");
          var refresh = env.proc("refresh");
          var common = env.block();
          poll(common);
          refresh(common);
          var shared = env.shared;
          var GL = shared.gl;
          var NEXT_STATE = shared.next;
          var CURRENT_STATE = shared.current;
          common(CURRENT_STATE, ".dirty=false;");
          emitPollFramebuffer(env, poll);
          emitPollFramebuffer(env, refresh, null, true);
          var INSTANCING;
          if (extInstancing) {
            INSTANCING = env.link(extInstancing);
          }
          if (extensions.oes_vertex_array_object) {
            refresh(env.link(extensions.oes_vertex_array_object), ".bindVertexArrayOES(null);");
          }
          for (var i = 0; i < limits.maxAttributes; ++i) {
            var BINDING = refresh.def(shared.attributes, "[", i, "]");
            var ifte = env.cond(BINDING, ".buffer");
            ifte.then(
              GL,
              ".enableVertexAttribArray(",
              i,
              ");",
              GL,
              ".bindBuffer(",
              GL_ARRAY_BUFFER$2,
              ",",
              BINDING,
              ".buffer.buffer);",
              GL,
              ".vertexAttribPointer(",
              i,
              ",",
              BINDING,
              ".size,",
              BINDING,
              ".type,",
              BINDING,
              ".normalized,",
              BINDING,
              ".stride,",
              BINDING,
              ".offset);"
            ).else(
              GL,
              ".disableVertexAttribArray(",
              i,
              ");",
              GL,
              ".vertexAttrib4f(",
              i,
              ",",
              BINDING,
              ".x,",
              BINDING,
              ".y,",
              BINDING,
              ".z,",
              BINDING,
              ".w);",
              BINDING,
              ".buffer=null;"
            );
            refresh(ifte);
            if (extInstancing) {
              refresh(
                INSTANCING,
                ".vertexAttribDivisorANGLE(",
                i,
                ",",
                BINDING,
                ".divisor);"
              );
            }
          }
          refresh(
            env.shared.vao,
            ".currentVAO=null;",
            env.shared.vao,
            ".setVAO(",
            env.shared.vao,
            ".targetVAO);"
          );
          Object.keys(GL_FLAGS).forEach(function(flag) {
            var cap = GL_FLAGS[flag];
            var NEXT = common.def(NEXT_STATE, ".", flag);
            var block = env.block();
            block(
              "if(",
              NEXT,
              "){",
              GL,
              ".enable(",
              cap,
              ")}else{",
              GL,
              ".disable(",
              cap,
              ")}",
              CURRENT_STATE,
              ".",
              flag,
              "=",
              NEXT,
              ";"
            );
            refresh(block);
            poll(
              "if(",
              NEXT,
              "!==",
              CURRENT_STATE,
              ".",
              flag,
              "){",
              block,
              "}"
            );
          });
          Object.keys(GL_VARIABLES).forEach(function(name) {
            var func = GL_VARIABLES[name];
            var init2 = currentState[name];
            var NEXT, CURRENT;
            var block = env.block();
            block(GL, ".", func, "(");
            if (isArrayLike(init2)) {
              var n = init2.length;
              NEXT = env.global.def(NEXT_STATE, ".", name);
              CURRENT = env.global.def(CURRENT_STATE, ".", name);
              block(
                loop(n, function(i2) {
                  return NEXT + "[" + i2 + "]";
                }),
                ");",
                loop(n, function(i2) {
                  return CURRENT + "[" + i2 + "]=" + NEXT + "[" + i2 + "];";
                }).join("")
              );
              poll(
                "if(",
                loop(n, function(i2) {
                  return NEXT + "[" + i2 + "]!==" + CURRENT + "[" + i2 + "]";
                }).join("||"),
                "){",
                block,
                "}"
              );
            } else {
              NEXT = common.def(NEXT_STATE, ".", name);
              CURRENT = common.def(CURRENT_STATE, ".", name);
              block(
                NEXT,
                ");",
                CURRENT_STATE,
                ".",
                name,
                "=",
                NEXT,
                ";"
              );
              poll(
                "if(",
                NEXT,
                "!==",
                CURRENT,
                "){",
                block,
                "}"
              );
            }
            refresh(block);
          });
          return env.compile();
        }(),
        compile: compileCommand
      };
    }
    function stats() {
      return {
        vaoCount: 0,
        bufferCount: 0,
        elementsCount: 0,
        framebufferCount: 0,
        shaderCount: 0,
        textureCount: 0,
        cubeCount: 0,
        renderbufferCount: 0,
        maxTextureUnits: 0
      };
    }
    var GL_QUERY_RESULT_EXT = 34918;
    var GL_QUERY_RESULT_AVAILABLE_EXT = 34919;
    var GL_TIME_ELAPSED_EXT = 35007;
    var createTimer = function(gl, extensions) {
      if (!extensions.ext_disjoint_timer_query) {
        return null;
      }
      var queryPool = [];
      function allocQuery() {
        return queryPool.pop() || extensions.ext_disjoint_timer_query.createQueryEXT();
      }
      function freeQuery(query) {
        queryPool.push(query);
      }
      var pendingQueries = [];
      function beginQuery(stats2) {
        var query = allocQuery();
        extensions.ext_disjoint_timer_query.beginQueryEXT(GL_TIME_ELAPSED_EXT, query);
        pendingQueries.push(query);
        pushScopeStats(pendingQueries.length - 1, pendingQueries.length, stats2);
      }
      function endQuery() {
        extensions.ext_disjoint_timer_query.endQueryEXT(GL_TIME_ELAPSED_EXT);
      }
      function PendingStats() {
        this.startQueryIndex = -1;
        this.endQueryIndex = -1;
        this.sum = 0;
        this.stats = null;
      }
      var pendingStatsPool = [];
      function allocPendingStats() {
        return pendingStatsPool.pop() || new PendingStats();
      }
      function freePendingStats(pendingStats2) {
        pendingStatsPool.push(pendingStats2);
      }
      var pendingStats = [];
      function pushScopeStats(start2, end, stats2) {
        var ps = allocPendingStats();
        ps.startQueryIndex = start2;
        ps.endQueryIndex = end;
        ps.sum = 0;
        ps.stats = stats2;
        pendingStats.push(ps);
      }
      var timeSum = [];
      var queryPtr = [];
      function update() {
        var ptr, i;
        var n = pendingQueries.length;
        if (n === 0) {
          return;
        }
        queryPtr.length = Math.max(queryPtr.length, n + 1);
        timeSum.length = Math.max(timeSum.length, n + 1);
        timeSum[0] = 0;
        queryPtr[0] = 0;
        var queryTime = 0;
        ptr = 0;
        for (i = 0; i < pendingQueries.length; ++i) {
          var query = pendingQueries[i];
          if (extensions.ext_disjoint_timer_query.getQueryObjectEXT(query, GL_QUERY_RESULT_AVAILABLE_EXT)) {
            queryTime += extensions.ext_disjoint_timer_query.getQueryObjectEXT(query, GL_QUERY_RESULT_EXT);
            freeQuery(query);
          } else {
            pendingQueries[ptr++] = query;
          }
          timeSum[i + 1] = queryTime;
          queryPtr[i + 1] = ptr;
        }
        pendingQueries.length = ptr;
        ptr = 0;
        for (i = 0; i < pendingStats.length; ++i) {
          var stats2 = pendingStats[i];
          var start2 = stats2.startQueryIndex;
          var end = stats2.endQueryIndex;
          stats2.sum += timeSum[end] - timeSum[start2];
          var startPtr = queryPtr[start2];
          var endPtr = queryPtr[end];
          if (endPtr === startPtr) {
            stats2.stats.gpuTime += stats2.sum / 1e6;
            freePendingStats(stats2);
          } else {
            stats2.startQueryIndex = startPtr;
            stats2.endQueryIndex = endPtr;
            pendingStats[ptr++] = stats2;
          }
        }
        pendingStats.length = ptr;
      }
      return {
        beginQuery,
        endQuery,
        pushScopeStats,
        update,
        getNumPendingQueries: function() {
          return pendingQueries.length;
        },
        clear: function() {
          queryPool.push.apply(queryPool, pendingQueries);
          for (var i = 0; i < queryPool.length; i++) {
            extensions.ext_disjoint_timer_query.deleteQueryEXT(queryPool[i]);
          }
          pendingQueries.length = 0;
          queryPool.length = 0;
        },
        restore: function() {
          pendingQueries.length = 0;
          queryPool.length = 0;
        }
      };
    };
    var GL_COLOR_BUFFER_BIT = 16384;
    var GL_DEPTH_BUFFER_BIT = 256;
    var GL_STENCIL_BUFFER_BIT = 1024;
    var GL_ARRAY_BUFFER = 34962;
    var CONTEXT_LOST_EVENT = "webglcontextlost";
    var CONTEXT_RESTORED_EVENT = "webglcontextrestored";
    var DYN_PROP = 1;
    var DYN_CONTEXT = 2;
    var DYN_STATE = 3;
    function find2(haystack, needle) {
      for (var i = 0; i < haystack.length; ++i) {
        if (haystack[i] === needle) {
          return i;
        }
      }
      return -1;
    }
    function wrapREGL(args) {
      var config = parseArgs(args);
      if (!config) {
        return null;
      }
      var gl = config.gl;
      var glAttributes = gl.getContextAttributes();
      var contextLost = gl.isContextLost();
      var extensionState = createExtensionCache(gl, config);
      if (!extensionState) {
        return null;
      }
      var stringStore = createStringStore();
      var stats$$1 = stats();
      var extensions = extensionState.extensions;
      var timer2 = createTimer(gl, extensions);
      var START_TIME = clock2();
      var WIDTH = gl.drawingBufferWidth;
      var HEIGHT = gl.drawingBufferHeight;
      var contextState = {
        tick: 0,
        time: 0,
        viewportWidth: WIDTH,
        viewportHeight: HEIGHT,
        framebufferWidth: WIDTH,
        framebufferHeight: HEIGHT,
        drawingBufferWidth: WIDTH,
        drawingBufferHeight: HEIGHT,
        pixelRatio: config.pixelRatio
      };
      var uniformState = {};
      var drawState = {
        elements: null,
        primitive: 4,
        // GL_TRIANGLES
        count: -1,
        offset: 0,
        instances: -1
      };
      var limits = wrapLimits(gl, extensions);
      var bufferState = wrapBufferState(
        gl,
        stats$$1,
        config,
        destroyBuffer
      );
      var elementState = wrapElementsState(gl, extensions, bufferState, stats$$1);
      var attributeState = wrapAttributeState(
        gl,
        extensions,
        limits,
        stats$$1,
        bufferState,
        elementState,
        drawState
      );
      function destroyBuffer(buffer) {
        return attributeState.destroyBuffer(buffer);
      }
      var shaderState = wrapShaderState(gl, stringStore, stats$$1, config);
      var textureState = createTextureSet(
        gl,
        extensions,
        limits,
        function() {
          core.procs.poll();
        },
        contextState,
        stats$$1,
        config
      );
      var renderbufferState = wrapRenderbuffers(gl, extensions, limits, stats$$1, config);
      var framebufferState = wrapFBOState(
        gl,
        extensions,
        limits,
        textureState,
        renderbufferState,
        stats$$1
      );
      var core = reglCore(
        gl,
        stringStore,
        extensions,
        limits,
        bufferState,
        elementState,
        textureState,
        framebufferState,
        uniformState,
        attributeState,
        shaderState,
        drawState,
        contextState,
        timer2,
        config
      );
      var readPixels = wrapReadPixels(
        gl,
        framebufferState,
        core.procs.poll,
        contextState,
        glAttributes,
        extensions,
        limits
      );
      var nextState = core.next;
      var canvas = gl.canvas;
      var rafCallbacks = [];
      var lossCallbacks = [];
      var restoreCallbacks = [];
      var destroyCallbacks = [config.onDestroy];
      var activeRAF = null;
      function handleRAF() {
        if (rafCallbacks.length === 0) {
          if (timer2) {
            timer2.update();
          }
          activeRAF = null;
          return;
        }
        activeRAF = raf.next(handleRAF);
        poll();
        for (var i = rafCallbacks.length - 1; i >= 0; --i) {
          var cb = rafCallbacks[i];
          if (cb) {
            cb(contextState, null, 0);
          }
        }
        gl.flush();
        if (timer2) {
          timer2.update();
        }
      }
      function startRAF() {
        if (!activeRAF && rafCallbacks.length > 0) {
          activeRAF = raf.next(handleRAF);
        }
      }
      function stopRAF() {
        if (activeRAF) {
          raf.cancel(handleRAF);
          activeRAF = null;
        }
      }
      function handleContextLoss(event) {
        event.preventDefault();
        contextLost = true;
        stopRAF();
        lossCallbacks.forEach(function(cb) {
          cb();
        });
      }
      function handleContextRestored(event) {
        gl.getError();
        contextLost = false;
        extensionState.restore();
        shaderState.restore();
        bufferState.restore();
        textureState.restore();
        renderbufferState.restore();
        framebufferState.restore();
        attributeState.restore();
        if (timer2) {
          timer2.restore();
        }
        core.procs.refresh();
        startRAF();
        restoreCallbacks.forEach(function(cb) {
          cb();
        });
      }
      if (canvas) {
        canvas.addEventListener(CONTEXT_LOST_EVENT, handleContextLoss, false);
        canvas.addEventListener(CONTEXT_RESTORED_EVENT, handleContextRestored, false);
      }
      function destroy() {
        rafCallbacks.length = 0;
        stopRAF();
        if (canvas) {
          canvas.removeEventListener(CONTEXT_LOST_EVENT, handleContextLoss);
          canvas.removeEventListener(CONTEXT_RESTORED_EVENT, handleContextRestored);
        }
        shaderState.clear();
        framebufferState.clear();
        renderbufferState.clear();
        attributeState.clear();
        textureState.clear();
        elementState.clear();
        bufferState.clear();
        if (timer2) {
          timer2.clear();
        }
        destroyCallbacks.forEach(function(cb) {
          cb();
        });
      }
      function compileProcedure(options) {
        check$1(!!options, "invalid args to regl({...})");
        check$1.type(options, "object", "invalid args to regl({...})");
        function flattenNestedOptions(options2) {
          var result = extend2({}, options2);
          delete result.uniforms;
          delete result.attributes;
          delete result.context;
          delete result.vao;
          if ("stencil" in result && result.stencil.op) {
            result.stencil.opBack = result.stencil.opFront = result.stencil.op;
            delete result.stencil.op;
          }
          function merge2(name) {
            if (name in result) {
              var child = result[name];
              delete result[name];
              Object.keys(child).forEach(function(prop) {
                result[name + "." + prop] = child[prop];
              });
            }
          }
          merge2("blend");
          merge2("depth");
          merge2("cull");
          merge2("stencil");
          merge2("polygonOffset");
          merge2("scissor");
          merge2("sample");
          if ("vao" in options2) {
            result.vao = options2.vao;
          }
          return result;
        }
        function separateDynamic(object2, useArrays) {
          var staticItems = {};
          var dynamicItems = {};
          Object.keys(object2).forEach(function(option) {
            var value = object2[option];
            if (dynamic.isDynamic(value)) {
              dynamicItems[option] = dynamic.unbox(value, option);
              return;
            } else if (useArrays && Array.isArray(value)) {
              for (var i = 0; i < value.length; ++i) {
                if (dynamic.isDynamic(value[i])) {
                  dynamicItems[option] = dynamic.unbox(value, option);
                  return;
                }
              }
            }
            staticItems[option] = value;
          });
          return {
            dynamic: dynamicItems,
            static: staticItems
          };
        }
        var context2 = separateDynamic(options.context || {}, true);
        var uniforms = separateDynamic(options.uniforms || {}, true);
        var attributes = separateDynamic(options.attributes || {}, false);
        var opts = separateDynamic(flattenNestedOptions(options), false);
        var stats$$12 = {
          gpuTime: 0,
          cpuTime: 0,
          count: 0
        };
        var compiled = core.compile(opts, attributes, uniforms, context2, stats$$12);
        var draw = compiled.draw;
        var batch = compiled.batch;
        var scope = compiled.scope;
        var EMPTY_ARRAY = [];
        function reserve(count) {
          while (EMPTY_ARRAY.length < count) {
            EMPTY_ARRAY.push(null);
          }
          return EMPTY_ARRAY;
        }
        function REGLCommand(args2, body) {
          var i;
          if (contextLost) {
            check$1.raise("context lost");
          }
          if (typeof args2 === "function") {
            return scope.call(this, null, args2, 0);
          } else if (typeof body === "function") {
            if (typeof args2 === "number") {
              for (i = 0; i < args2; ++i) {
                scope.call(this, null, body, i);
              }
            } else if (Array.isArray(args2)) {
              for (i = 0; i < args2.length; ++i) {
                scope.call(this, args2[i], body, i);
              }
            } else {
              return scope.call(this, args2, body, 0);
            }
          } else if (typeof args2 === "number") {
            if (args2 > 0) {
              return batch.call(this, reserve(args2 | 0), args2 | 0);
            }
          } else if (Array.isArray(args2)) {
            if (args2.length) {
              return batch.call(this, args2, args2.length);
            }
          } else {
            return draw.call(this, args2);
          }
        }
        return extend2(REGLCommand, {
          stats: stats$$12,
          destroy: function() {
            compiled.destroy();
          }
        });
      }
      var setFBO = framebufferState.setFBO = compileProcedure({
        framebuffer: dynamic.define.call(null, DYN_PROP, "framebuffer")
      });
      function clearImpl(_, options) {
        var clearFlags = 0;
        core.procs.poll();
        var c2 = options.color;
        if (c2) {
          gl.clearColor(+c2[0] || 0, +c2[1] || 0, +c2[2] || 0, +c2[3] || 0);
          clearFlags |= GL_COLOR_BUFFER_BIT;
        }
        if ("depth" in options) {
          gl.clearDepth(+options.depth);
          clearFlags |= GL_DEPTH_BUFFER_BIT;
        }
        if ("stencil" in options) {
          gl.clearStencil(options.stencil | 0);
          clearFlags |= GL_STENCIL_BUFFER_BIT;
        }
        check$1(!!clearFlags, "called regl.clear with no buffer specified");
        gl.clear(clearFlags);
      }
      function clear(options) {
        check$1(
          typeof options === "object" && options,
          "regl.clear() takes an object as input"
        );
        if ("framebuffer" in options) {
          if (options.framebuffer && options.framebuffer_reglType === "framebufferCube") {
            for (var i = 0; i < 6; ++i) {
              setFBO(extend2({
                framebuffer: options.framebuffer.faces[i]
              }, options), clearImpl);
            }
          } else {
            setFBO(options, clearImpl);
          }
        } else {
          clearImpl(null, options);
        }
      }
      function frame2(cb) {
        check$1.type(cb, "function", "regl.frame() callback must be a function");
        rafCallbacks.push(cb);
        function cancel() {
          var i = find2(rafCallbacks, cb);
          check$1(i >= 0, "cannot cancel a frame twice");
          function pendingCancel() {
            var index = find2(rafCallbacks, pendingCancel);
            rafCallbacks[index] = rafCallbacks[rafCallbacks.length - 1];
            rafCallbacks.length -= 1;
            if (rafCallbacks.length <= 0) {
              stopRAF();
            }
          }
          rafCallbacks[i] = pendingCancel;
        }
        startRAF();
        return {
          cancel
        };
      }
      function pollViewport() {
        var viewport = nextState.viewport;
        var scissorBox = nextState.scissor_box;
        viewport[0] = viewport[1] = scissorBox[0] = scissorBox[1] = 0;
        contextState.viewportWidth = contextState.framebufferWidth = contextState.drawingBufferWidth = viewport[2] = scissorBox[2] = gl.drawingBufferWidth;
        contextState.viewportHeight = contextState.framebufferHeight = contextState.drawingBufferHeight = viewport[3] = scissorBox[3] = gl.drawingBufferHeight;
      }
      function poll() {
        contextState.tick += 1;
        contextState.time = now2();
        pollViewport();
        core.procs.poll();
      }
      function refresh() {
        textureState.refresh();
        pollViewport();
        core.procs.refresh();
        if (timer2) {
          timer2.update();
        }
      }
      function now2() {
        return (clock2() - START_TIME) / 1e3;
      }
      refresh();
      function addListener(event, callback) {
        check$1.type(callback, "function", "listener callback must be a function");
        var callbacks;
        switch (event) {
          case "frame":
            return frame2(callback);
          case "lost":
            callbacks = lossCallbacks;
            break;
          case "restore":
            callbacks = restoreCallbacks;
            break;
          case "destroy":
            callbacks = destroyCallbacks;
            break;
          default:
            check$1.raise("invalid event, must be one of frame,lost,restore,destroy");
        }
        callbacks.push(callback);
        return {
          cancel: function() {
            for (var i = 0; i < callbacks.length; ++i) {
              if (callbacks[i] === callback) {
                callbacks[i] = callbacks[callbacks.length - 1];
                callbacks.pop();
                return;
              }
            }
          }
        };
      }
      var regl2 = extend2(compileProcedure, {
        // Clear current FBO
        clear,
        // Short cuts for dynamic variables
        prop: dynamic.define.bind(null, DYN_PROP),
        context: dynamic.define.bind(null, DYN_CONTEXT),
        this: dynamic.define.bind(null, DYN_STATE),
        // executes an empty draw command
        draw: compileProcedure({}),
        // Resources
        buffer: function(options) {
          return bufferState.create(options, GL_ARRAY_BUFFER, false, false);
        },
        elements: function(options) {
          return elementState.create(options, false);
        },
        texture: textureState.create2D,
        cube: textureState.createCube,
        renderbuffer: renderbufferState.create,
        framebuffer: framebufferState.create,
        framebufferCube: framebufferState.createCube,
        vao: attributeState.createVAO,
        // Expose context attributes
        attributes: glAttributes,
        // Frame rendering
        frame: frame2,
        on: addListener,
        // System limits
        limits,
        hasExtension: function(name) {
          return limits.extensions.indexOf(name.toLowerCase()) >= 0;
        },
        // Read pixels
        read: readPixels,
        // Destroy regl and all associated resources
        destroy,
        // Direct GL state manipulation
        _gl: gl,
        _refresh: refresh,
        poll: function() {
          poll();
          if (timer2) {
            timer2.update();
          }
        },
        // Current time
        now: now2,
        // regl Statistics Information
        stats: stats$$1
      });
      config.onDone(null, regl2);
      return regl2;
    }
    return wrapREGL;
  });
})(regl);
var glslReadFloat = decodeFloat;
var UINT8_VIEW = new Uint8Array(4);
var FLOAT_VIEW = new Float32Array(UINT8_VIEW.buffer);
function decodeFloat(x, y, z, w) {
  UINT8_VIEW[0] = w;
  UINT8_VIEW[1] = z;
  UINT8_VIEW[2] = y;
  UINT8_VIEW[3] = x;
  return FLOAT_VIEW[0];
}
class PlotSetting {
  constructor(start2, transform = "arithmetic") {
    this.transform = "arithmetic";
    this.transform = transform;
    this.start = start2;
    this.value = start2;
    this.target = start2;
  }
  update(value, duration) {
    if (duration === 0) {
      this.value = value;
      if (this.timer !== void 0) {
        this.timer.stop();
      }
      return;
    }
    this.start = this.value;
    this.target = value;
    this.start_timer(duration);
  }
  start_timer(duration) {
    if (this.timer !== void 0) {
      this.timer.stop();
    }
    const timer_object = timer((elapsed) => {
      const t = elapsed / duration;
      if (t >= 1) {
        this.value = this.target;
        timer_object.stop();
        return;
      }
      const w1 = 1 - t;
      const w2 = t;
      this.value = this.transform === "geometric" ? this.start ** w1 * this.target ** w2 : this.start * w1 + this.target * w2;
    });
    this.timer = timer_object;
  }
}
class RenderProps {
  constructor() {
    this.maxPoints = new PlotSetting(1e4, "geometric");
    this.pointSize = new PlotSetting(1, "geometric");
    this.targetOpacity = new PlotSetting(50);
    this.foregroundOpacity = new PlotSetting(1);
    this.backgroundOpacity = new PlotSetting(0.5);
    this.foregroundSize = new PlotSetting(1, "geometric");
    this.backgroundSize = new PlotSetting(1, "geometric");
  }
  apply_prefs(prefs) {
    const { duration } = prefs;
    this.maxPoints.update(prefs.max_points, duration);
    this.targetOpacity.update(prefs.alpha, duration);
    this.pointSize.update(prefs.point_size, duration);
    this.foregroundOpacity.update(
      prefs.background_options.opacity[1],
      duration
    );
    this.backgroundOpacity.update(
      prefs.background_options.opacity[0],
      duration
    );
    this.foregroundSize.update(prefs.background_options.size[1], duration);
    this.backgroundSize.update(prefs.background_options.size[0], duration);
  }
  get max_points() {
    return this.maxPoints.value;
  }
  get alpha() {
    return this.targetOpacity.value;
  }
  get point_size() {
    return this.pointSize.value;
  }
  get foreground_opacity() {
    return this.foregroundOpacity.value;
  }
  get background_opacity() {
    return this.backgroundOpacity.value;
  }
  get foreground_size() {
    return this.foregroundSize.value;
  }
  get background_size() {
    return this.backgroundSize.value;
  }
}
class Renderer {
  constructor(selector2, tileSet, scatterplot) {
    this._use_scale_to_download_tiles = true;
    this._initializations = [];
    this.render_props = new RenderProps();
    this.scatterplot = scatterplot;
    this.holder = select(selector2);
    this.canvas = select(
      this.holder.node().firstElementChild
    ).node();
    this.dataset = tileSet;
    this.width = +select(this.canvas).attr("width");
    this.height = +select(this.canvas).attr("height");
    this.deferred_functions = [];
    this._use_scale_to_download_tiles = true;
  }
  get discard_share() {
    return 0;
  }
  /**
   * Render prefs are scatterplot prefs, but for a single tile
   * instead of for a whole table.
   */
  get prefs() {
    const p = { ...this.scatterplot.prefs };
    p.arrow_table = void 0;
    p.arrow_buffer = void 0;
    return p;
  }
  get alpha() {
    return this.render_props.alpha;
  }
  get optimal_alpha() {
    var _a, _b, _c, _d;
    const zoom_balance = (_a = this.prefs.zoom_balance) != null ? _a : 1;
    const { alpha, point_size, max_ix, width, discard_share, height } = this;
    const k = (_d = (_c = (_b = this.zoom) == null ? void 0 : _b.transform) == null ? void 0 : _c.k) != null ? _d : 1;
    const target_share = alpha / 100;
    const fraction_of_total_visible = 1 / k ** 2;
    const pixelRatio = window.devicePixelRatio || 1;
    const pixel_area = width * height / pixelRatio;
    const total_intended_points = min([
      max_ix,
      this.dataset.highest_known_ix || 1e10
    ]);
    const total_points = total_intended_points * (1 - discard_share);
    const size_adjust = Math.exp(Math.log(k) * zoom_balance);
    const area_of_point = Math.PI * (size_adjust * point_size / pixelRatio / 2) ** 2;
    const target = target_share * pixel_area / (total_points * fraction_of_total_visible * area_of_point);
    return target < 1 / 255 ? 1 / 255 : target;
  }
  get point_size() {
    return this.render_props.point_size;
  }
  get max_ix() {
    const { prefs } = this;
    const { max_points } = this.render_props;
    if (!this._use_scale_to_download_tiles) {
      return max_points;
    }
    const { k } = this.zoom.transform;
    const point_size_adjust = Math.exp(Math.log(k) * prefs.zoom_balance);
    return max_points * k * k / point_size_adjust / point_size_adjust;
  }
  visible_tiles() {
    const { max_ix } = this;
    const { dataset: tileSet } = this;
    this.aes.dim("x");
    const natural_display = this.aes.dim("x").current.field == "x" && this.aes.dim("y").current.field == "y" && this.aes.dim("x").last.field == "x" && this.aes.dim("y").last.field == "y";
    const all_tiles = natural_display ? tileSet.map((d) => d).filter((tile) => {
      const visible = tile.is_visible(
        max_ix,
        this.zoom.current_corners()
      );
      return visible;
    }) : tileSet.map((d) => d).filter((tile) => tile.min_ix < this.max_ix);
    all_tiles.sort((a, b) => a.min_ix - b.min_ix);
    return all_tiles;
  }
  bind_zoom(zoom2) {
    this.zoom = zoom2;
    return this;
  }
  async initialize() {
  }
}
const gaussian_blur = "precision mediump float;\n#define GLSLIFY 1\n\nvec4 blur13(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {\n  vec4 color = vec4(0.0);\n  vec2 off1 = vec2(1.411764705882353) * direction;\n  vec2 off2 = vec2(3.2941176470588234) * direction;\n  vec2 off3 = vec2(5.176470588235294) * direction;\n  color += texture2D(image, uv) * 0.1964825501511404;\n  color += texture2D(image, uv + (off1 / resolution)) * 0.2969069646728344;\n  color += texture2D(image, uv - (off1 / resolution)) * 0.2969069646728344;\n  color += texture2D(image, uv + (off2 / resolution)) * 0.09447039785044732;\n  color += texture2D(image, uv - (off2 / resolution)) * 0.09447039785044732;\n  color += texture2D(image, uv + (off3 / resolution)) * 0.010381362401148057;\n  color += texture2D(image, uv - (off3 / resolution)) * 0.010381362401148057;\n  return color;\n}\n\nuniform vec2 iResolution;\nuniform sampler2D iChannel0;\nuniform vec2 direction;\n\nvoid main() {\n  vec2 uv = vec2(gl_FragCoord.xy / iResolution.xy);\n  gl_FragColor = blur13(iChannel0, uv, iResolution.xy, direction);\n}\n";
const vertex_shader = `precision mediump float;
#define GLSLIFY 1

uniform float u_zoom_balance;
uniform float u_tile_id;
uniform float u_update_time;
uniform float u_transition_duration;
uniform vec2 u_wrap_colors_after;
// Type of jitter.
uniform float u_jitter;
uniform float u_last_jitter;

// Whether to plot only a single category.
uniform float u_only_color;
uniform float u_grid_mode;

uniform vec3 u_filter_numeric; // An override for simple numeric operations.
uniform vec3 u_last_filter_numeric; // An override for simple numeric operations.

uniform vec3 u_filter2_numeric; // An override for simple numeric operations.
uniform vec3 u_last_filter2_numeric; // An override for simple numeric operations.

uniform vec3 u_foreground_numeric; // An override for simple numeric operations.
uniform vec3 u_last_foreground_numeric; // An override for simple numeric operations.

// Transform from data space to the open window.
uniform mat3 u_window_scale;
uniform mat3 u_last_window_scale;
// Transform from the open window to the d3-zoom.
uniform mat3 u_zoom;

uniform float u_width;
uniform float u_height;
uniform float u_use_glyphset;
varying vec2 letter_pos; // store which letter to use.

uniform float u_maxix;           // The maximum index to plot.
uniform float u_time;            // The current time.
uniform float u_k;               // The d3-scale factor.
uniform float u_color_picker_mode;
uniform float u_base_size;
uniform float u_alpha;
uniform float u_foreground_number; // -1 -- everything is foreground; 0 -- background; 1 -- foreground.
uniform vec4 u_background_rgba;
uniform float u_foreground_alpha;
uniform float u_background_mouseover;
uniform float u_foreground_size;
uniform float u_background_size;

uniform sampler2D u_one_d_aesthetic_map;
uniform sampler2D u_color_aesthetic_map;

// The same set of items for a variety of aesthetics.

// whether to continuously interpolate between
// x0 and x, y0 and y.
uniform float u_position_interpolation_mode;

float a_color;
float a_last_color;

uniform float u_color_buffer_num;
uniform float u_last_color_buffer_num;

uniform vec3 u_color_constant;
uniform vec3 u_last_color_constant;

uniform float u_color_transform;
uniform float u_last_color_transform;
uniform vec2 u_color_domain;
uniform vec2 u_last_color_domain;
uniform float u_last_color_map_position;
uniform float u_color_map_position;

bool a_color_is_constant;
bool a_last_color_is_constant;

/*
python code to generate what follows.
def autogenerate_code():
  ks = ["x", "y", "jitter_radius", "jitter_speed", "size", "filter", "filter2", "x0", "y0", "foreground"]
  times = ["", "last_"]
  print("""
  //  BEGIN AUTOGENERATED. DO NOT EDIT. 
  // ------------------------------------------------    
  """)
  for k in ks:
    for time in times:
      timek = time + k
      print(f"""
  uniform float u_{timek}_buffer_num;
  uniform float u_{timek}_constant;
  uniform float u_{timek}_transform;
  uniform vec2 u_{timek}_domain;
  uniform vec2 u_{timek}_range;
  uniform float u_{timek}_map_position;
  float a_{timek};
  bool a_{timek}_is_constant;
      """)
  for i in range(0, 16):
    print(f"attribute float buffer_{i};")
  for k in ks:
    for time in times:
      timek = time + k
      print(f"""
    if (u_{timek}_buffer_num > -0.5) {{
      a_{timek} = get_buffer(u_{timek}_buffer_num);
      a_{timek}_is_constant = false;
    }} else {{
      a_{timek} = u_{timek}_constant;
      a_{timek}_is_constant = true;
    }}""")
  print("""
//  END AUTOGENERATED. DO NOT EDIT ABOVE. 
// ------------------------------------------------    
  """)

autogenerate_code()
*/

  //  BEGIN AUTOGENERATED. DO NOT EDIT. 
  // ------------------------------------------------    
  

  uniform float u_x_buffer_num;
  uniform float u_x_constant;
  uniform float u_x_transform;
  uniform vec2 u_x_domain;
  uniform vec2 u_x_range;
  uniform float u_x_map_position;
  float a_x;
  bool a_x_is_constant;
      

  uniform float u_last_x_buffer_num;
  uniform float u_last_x_constant;
  uniform float u_last_x_transform;
  uniform vec2 u_last_x_domain;
  uniform vec2 u_last_x_range;
  uniform float u_last_x_map_position;
  float a_last_x;
  bool a_last_x_is_constant;
      

  uniform float u_y_buffer_num;
  uniform float u_y_constant;
  uniform float u_y_transform;
  uniform vec2 u_y_domain;
  uniform vec2 u_y_range;
  uniform float u_y_map_position;
  float a_y;
  bool a_y_is_constant;
      

  uniform float u_last_y_buffer_num;
  uniform float u_last_y_constant;
  uniform float u_last_y_transform;
  uniform vec2 u_last_y_domain;
  uniform vec2 u_last_y_range;
  uniform float u_last_y_map_position;
  float a_last_y;
  bool a_last_y_is_constant;
      

  uniform float u_jitter_radius_buffer_num;
  uniform float u_jitter_radius_constant;
  uniform float u_jitter_radius_transform;
  uniform vec2 u_jitter_radius_domain;
  uniform vec2 u_jitter_radius_range;
  uniform float u_jitter_radius_map_position;
  float a_jitter_radius;
  bool a_jitter_radius_is_constant;
      

  uniform float u_last_jitter_radius_buffer_num;
  uniform float u_last_jitter_radius_constant;
  uniform float u_last_jitter_radius_transform;
  uniform vec2 u_last_jitter_radius_domain;
  uniform vec2 u_last_jitter_radius_range;
  uniform float u_last_jitter_radius_map_position;
  float a_last_jitter_radius;
  bool a_last_jitter_radius_is_constant;
      

  uniform float u_jitter_speed_buffer_num;
  uniform float u_jitter_speed_constant;
  uniform float u_jitter_speed_transform;
  uniform vec2 u_jitter_speed_domain;
  uniform vec2 u_jitter_speed_range;
  uniform float u_jitter_speed_map_position;
  float a_jitter_speed;
  bool a_jitter_speed_is_constant;
      

  uniform float u_last_jitter_speed_buffer_num;
  uniform float u_last_jitter_speed_constant;
  uniform float u_last_jitter_speed_transform;
  uniform vec2 u_last_jitter_speed_domain;
  uniform vec2 u_last_jitter_speed_range;
  uniform float u_last_jitter_speed_map_position;
  float a_last_jitter_speed;
  bool a_last_jitter_speed_is_constant;
      

  uniform float u_size_buffer_num;
  uniform float u_size_constant;
  uniform float u_size_transform;
  uniform vec2 u_size_domain;
  uniform vec2 u_size_range;
  uniform float u_size_map_position;
  float a_size;
  bool a_size_is_constant;
      

  uniform float u_last_size_buffer_num;
  uniform float u_last_size_constant;
  uniform float u_last_size_transform;
  uniform vec2 u_last_size_domain;
  uniform vec2 u_last_size_range;
  uniform float u_last_size_map_position;
  float a_last_size;
  bool a_last_size_is_constant;
      

  uniform float u_filter_buffer_num;
  uniform float u_filter_constant;
  uniform float u_filter_transform;
  uniform vec2 u_filter_domain;
  uniform vec2 u_filter_range;
  uniform float u_filter_map_position;
  float a_filter;
  bool a_filter_is_constant;
      

  uniform float u_last_filter_buffer_num;
  uniform float u_last_filter_constant;
  uniform float u_last_filter_transform;
  uniform vec2 u_last_filter_domain;
  uniform vec2 u_last_filter_range;
  uniform float u_last_filter_map_position;
  float a_last_filter;
  bool a_last_filter_is_constant;
      

  uniform float u_filter2_buffer_num;
  uniform float u_filter2_constant;
  uniform float u_filter2_transform;
  uniform vec2 u_filter2_domain;
  uniform vec2 u_filter2_range;
  uniform float u_filter2_map_position;
  float a_filter2;
  bool a_filter2_is_constant;
      

  uniform float u_last_filter2_buffer_num;
  uniform float u_last_filter2_constant;
  uniform float u_last_filter2_transform;
  uniform vec2 u_last_filter2_domain;
  uniform vec2 u_last_filter2_range;
  uniform float u_last_filter2_map_position;
  float a_last_filter2;
  bool a_last_filter2_is_constant;
      

  uniform float u_x0_buffer_num;
  uniform float u_x0_constant;
  uniform float u_x0_transform;
  uniform vec2 u_x0_domain;
  uniform vec2 u_x0_range;
  uniform float u_x0_map_position;
  float a_x0;
  bool a_x0_is_constant;
      

  uniform float u_last_x0_buffer_num;
  uniform float u_last_x0_constant;
  uniform float u_last_x0_transform;
  uniform vec2 u_last_x0_domain;
  uniform vec2 u_last_x0_range;
  uniform float u_last_x0_map_position;
  float a_last_x0;
  bool a_last_x0_is_constant;
      

  uniform float u_y0_buffer_num;
  uniform float u_y0_constant;
  uniform float u_y0_transform;
  uniform vec2 u_y0_domain;
  uniform vec2 u_y0_range;
  uniform float u_y0_map_position;
  float a_y0;
  bool a_y0_is_constant;
      

  uniform float u_last_y0_buffer_num;
  uniform float u_last_y0_constant;
  uniform float u_last_y0_transform;
  uniform vec2 u_last_y0_domain;
  uniform vec2 u_last_y0_range;
  uniform float u_last_y0_map_position;
  float a_last_y0;
  bool a_last_y0_is_constant;
      

  uniform float u_foreground_buffer_num;
  uniform float u_foreground_constant;
  uniform float u_foreground_transform;
  uniform vec2 u_foreground_domain;
  uniform vec2 u_foreground_range;
  uniform float u_foreground_map_position;
  float a_foreground;
  bool a_foreground_is_constant;
      

  uniform float u_last_foreground_buffer_num;
  uniform float u_last_foreground_constant;
  uniform float u_last_foreground_transform;
  uniform vec2 u_last_foreground_domain;
  uniform vec2 u_last_foreground_range;
  uniform float u_last_foreground_map_position;
  float a_last_foreground;
  bool a_last_foreground_is_constant;
      
attribute float buffer_0;
attribute float buffer_1;
attribute float buffer_2;
attribute float buffer_3;
attribute float buffer_4;
attribute float buffer_5;
attribute float buffer_6;
attribute float buffer_7;
attribute float buffer_8;
attribute float buffer_9;
attribute float buffer_10;
attribute float buffer_11;
attribute float buffer_12;
attribute float buffer_13;
attribute float buffer_14;
attribute float buffer_15;

//  END AUTOGENERATED. DO NOT EDIT ABOVE. 
// ------------------------------------------------    

highp float ix_to_random(in float ix, in float seed) {
  // For high numbers, taking the log avoids coincidence.
  highp float seed2 = log(ix + 2.) + 1.;
  vec2 co = vec2(seed2, seed);
  highp float a = 12.9898;
  highp float b = 78.233;
  highp float c = 43758.5453;
  highp float dt = dot(co.xy, vec2(a, b));
  highp float sn = mod(dt, 3.14);
  return fract(sin(sn) * c);
}

// The fill color.
varying vec4 fill;
varying float point_size;

uniform float u_jitter_radius_lookup;
uniform float u_jitter_radius_lookup_y_constant;
uniform vec2 u_jitter_radius_lookup_x_domain;
uniform vec2 u_jitter_radius_lookup_y_domain;

float point_size_adjust;

// A coordinate to throw away a vertex point.
vec4 discard_me = vec4(100.0, 100.0, 1.0, 1.0);

// Initialized in the main loop
// mat3 from_coord_to_gl;

const float e = 1.618282;
// I've been convinced.
const float tau = 2. * 3.14159265359;

float interpolate_raw(in float x, in float min, in float max) {
  if (x < min) {return 0.;}
  if (x > max) {return 1.;}
  return (x - min)/(max - min);
}

float interpolate(in float x, in float min, in float max) {
  if (max < min) {
    return 1. - interpolate_raw(x, max, min);
  } else {
    return interpolate_raw(x, min, max);
  }
}

/*

The following glsl code was written in python.

buffers = [*range(16)]

def write_buffs(buffs):
    if len(buffs) == 1:
        return[f"return buffer_{buffs[0]}"]
    condition_1 = ["  " + line for line in write_buffs(buffs[:len(buffs)//2])]
    condition_2 = ["" + line for line in write_buffs(buffs[len(buffs)//2:])]

    args = [
        f"if (i < {buffs[len(buffs) // 2 - 1]}.5) {{",
        *condition_1,
        "}",
        *condition_2
    ]
    return args

print("\\n".join(write_buffs(buffers)))
*/

float get_buffer(in float i) {
  //given an index, returns the appropriate buffer.
  if (i < 7.5) {
    if (i < 3.5) {
      if (i < 1.5) {
        if (i < 0.5) {
          return buffer_0;
        }
        return buffer_1;
      }
      if (i < 2.5) {
        return buffer_2;
      }
      return buffer_3;
    }
    if (i < 5.5) {
      if (i < 4.5) {
        return buffer_4;
      }
      return buffer_5;
    }
    if (i < 6.5) {
      return buffer_6;
    }
    return buffer_7;
  }
  if (i < 11.5) {
    if (i < 9.5) {
      if (i < 8.5) {
        return buffer_8;
      }
      return buffer_9;
    }
    if (i < 10.5) {
      return buffer_10;
    }
    return buffer_11;
  }
  if (i < 13.5) {
    if (i < 12.5) {
      return buffer_12;
    }
    return buffer_13;
  }
  if (i < 14.5) {
    return buffer_14;
  }
  return buffer_15;
}

float linstep(in vec2 range, in float x) {
  return interpolate(x, range.x, range.y);
  float scale_size = range.y - range.x;
  float from_left = x - range.x;
  return clamp(from_left / scale_size, 0.0, 1.0);
}

float linscale(in vec2 range, in float x) {
  float scale_size = range.y - range.x;
  float from_left = x - range.x;
  return from_left / scale_size;
}

vec2 box_muller(in float ix, in float seed) {
  // Box-Muller transform gives you two gaussian randoms for two uniforms.
  highp float U = ix_to_random(ix, seed);
  highp float V = ix_to_random(ix, seed + 17.123123);
  return vec2(sqrt(-2. * log(U)) * cos(tau * V),
              sqrt(-2. * log(U)) * sin(tau * V));
}

/*************** END COLOR SCALES *******************************/

float domainify(in vec2 domain, in float transform, in float attr, in float overflow_behavior) {

  // Clamp an attribute into a domain, with an optional log or sqrt transform.
  if (transform == 2.) {
    domain = sqrt(domain);
    attr = sqrt(attr);
  }
  if (transform == 3.) {
    domain = log(domain);
    attr = log(attr);
  }
  if (overflow_behavior == 1.) {
    // clamp
    return linstep(domain, attr);
  }
  if (overflow_behavior == 2.) {
    //wrap

    return fract(linscale(domain, attr));
  }
  return linscale(domain, attr);
}

mat3 pixelspace_to_glspace;

float run_numeric_filter (in float a_filter,
  in float u_filter_op, in float u_filter_param_1,
  in float u_filter_param_2) {
  bool truthy;
  if (u_filter_op < 1.5) {
    truthy = a_filter < u_filter_param_1;
  } else if (u_filter_op < 2.5) {
    truthy = a_filter > u_filter_param_1;
  } else if (u_filter_op < 3.5) {
    truthy = a_filter == u_filter_param_1;
  } else if (u_filter_op < 4.5) {
    truthy = abs(a_filter - u_filter_param_2) < u_filter_param_1;
  }
  if (truthy) {return 1.;} else {return 0.;}
}

float choose_and_run_filter(
  in vec3 u_filter_numeric,
  in float a_filter,
  in float map_location,
  in bool filter_is_constant
  ) {
    if (filter_is_constant) {
      return 1.;
    }
    if (u_filter_numeric.r < 0.5) {
      // Must be on a dictionary. Unreasonable assumption, maybe?
      float frac_filter = linstep(vec2(-0., 4096.), a_filter);
      float map_coords = (map_location + .5) / 32.;
      return texture2D(u_one_d_aesthetic_map, vec2(map_coords, frac_filter)).a;
    } else {
      return run_numeric_filter(a_filter,
        u_filter_numeric.r, u_filter_numeric.g, u_filter_numeric.b);
    }
}

const float tau_0 = 2. * 3.14159265359;

highp float ix_to_random_1540259130(in float ix, in float seed) {
  // For high numbers, taking the log avoids coincidence.
  highp float seed2 = log(ix) + 1.;
  vec2 co = vec2(seed2, seed);
  highp float a = 12.9898;
  highp float b = 78.233;
  highp float c = 43758.5453;
  highp float dt= dot(co.xy ,vec2(a,b));
  highp float sn= mod(dt,3.14);
  return fract(sin(sn) * c);
}

highp vec2 box_muller_1540259130(in float ix, in float seed) {
  // Box-Muller transform gives you two gaussian randoms for two uniforms.
  highp float U = ix_to_random_1540259130(ix, seed);
  highp float V = ix_to_random_1540259130(ix, seed + 17.123123);
  return vec2(
    sqrt(-2.*log(U))*cos(tau_0*V),
    sqrt(-2.*log(U))*sin(tau_0*V)
  );
}

vec2 logarithmic_spiral_jitter_1540259130(
  in float ix, // a random seed.
  in float a, // offset
  in float angle_parameter_1540259130, // angle parameter
  in float randomize_angle_1540259130, // sd radians
  in float max_r_1540259130, // Maximum radius of spiral.
  in float randomize_rotation_max_radians_1540259130, // in standard deviations to the log-multiplier.
  in float randomize_radius_1540259130, // in standard deviation percentage points.
  in float hole, // donut hole size.
  in float speed_0, // webgl units per second.
  in float time_0,// The time, in seconds, to plot at. Generally passed as a uniform or something.
  in float acceleration,
  in float n_spirals_1540259130,
  in float shear,
  in float aspect_ratio_1540259130
  ) {
  // Each point starts at a different place on the spiral.
  vec2 two_gaussians_1540259130 = box_muller_1540259130(ix, 55.1);

  highp float calculated_angle = angle_parameter_1540259130 + two_gaussians_1540259130.x * randomize_angle_1540259130;
  float k = 1. / tan(calculated_angle);
  if (k > 100000.) {
    k = 0.;
  }

  // The length of the segment to be traversed.
  float arc_length =  sqrt((1. + k*k)/k) * (max_r_1540259130 - a);
  float period = arc_length / speed_0;

  // Every point needs to start at a different place along the curve.
  float stagger_time = ix_to_random_1540259130(ix, 3.);

  // How long does a circuit take? Add some random noise.
  float time_period = period * exp(box_muller_1540259130(ix, 0.031).x / 6.);

  // Adjust u_time from the clock to our current spot.
  float varying_time = time_0 + stagger_time * time_period;

  // Adjust that time by raising to a power to set the speed along the curve.
  // Not sure if this is the soundest way to parametrize.
  float relative_time = pow(1. - mod(varying_time, time_period)/time_period, acceleration);

  // Calculate the radius at this time point.
  float radius = max_r_1540259130 * relative_time + a;

  // The angle implied by that radius.
  float theta  = 1./k * log(radius / a);

  /* A different way to calculate radius from the theta. Not used
  float max_theta = 1. / k * log(max_r / a);
  float theta2 = max_theta * relative_time;
  vec2 pos_theta_style = vec2(a * exp(k * theta2), theta2);
  radius = pos_theta_style.x;
  theta = pos_theta_style.y;
  */

  // If multiple spirals, the theta needs to be rotated for which spiral we're in.
  // Choose it based on a new random seed.
  float which_spiral = floor(ix_to_random_1540259130(ix, 13.13) * n_spirals_1540259130);
  float which_spiral_adjust = which_spiral / n_spirals_1540259130 * tau_0;
  theta = theta + which_spiral_adjust;

  // Add some gaussian jitter to the polar coordinates.
  vec2 polar_jitter = box_muller_1540259130(ix, 24.);

  highp float radius_adjust = 1. + polar_jitter.x * randomize_radius_1540259130;
  highp float theta_adjust = polar_jitter.y * randomize_rotation_max_radians_1540259130;

  vec2 shear_adjust = box_muller_1540259130(ix, 59.1) * shear;

  mat3 shear_mat = mat3(
    1., shear_adjust.x, 0.,
    shear_adjust.y, 1., 0.,
    0., 0., 1.);
  // into euclidean space.
  vec3 pos_spiral = vec3(
   cos(theta + theta_adjust)*(radius * radius_adjust + hole),
   sin(theta + theta_adjust)*(radius * radius_adjust + hole),
   0.
  );
  mat3 adjust_to_viewport =
         mat3(
            1./aspect_ratio_1540259130, 0., 0.,
            0., 1., 0.,
            0., 0., 1.);

  pos_spiral = pos_spiral * shear_mat * 
               adjust_to_viewport;
  return pos_spiral.xy;
}

#define FLOAT_MAX  1.70141184e38
#define FLOAT_MIN  1.17549435e-38

lowp vec4 encode_float_1604150559(highp float v) {
  highp float av = abs(v);

  //Handle special cases
  if(av < FLOAT_MIN) {
    return vec4(0.0, 0.0, 0.0, 0.0);
  } else if(v > FLOAT_MAX) {
    return vec4(127.0, 128.0, 0.0, 0.0) / 255.0;
  } else if(v < -FLOAT_MAX) {
    return vec4(255.0, 128.0, 0.0, 0.0) / 255.0;
  }

  highp vec4 c = vec4(0,0,0,0);

  //Compute exponent and mantissa
  highp float e = floor(log2(av));
  highp float m = av * pow(2.0, -e) - 1.0;
  
  //Unpack mantissa
  c[1] = floor(128.0 * m);
  m -= c[1] / 128.0;
  c[2] = floor(32768.0 * m);
  m -= c[2] / 32768.0;
  c[3] = floor(8388608.0 * m);
  
  //Unpack exponent
  highp float ebias = e + 127.0;
  c[0] = floor(ebias / 2.0);
  ebias -= c[0] * 2.0;
  c[1] += floor(ebias) * 128.0; 

  //Unpack sign bit
  c[0] += 128.0 * step(0.0, -v);

  //Scale back to range
  return c / 255.0;
}

#ifndef PI
#define PI 3.141592653589793
#endif

float sineInOut_0(float t) {
  return -0.5 * (cos(PI * t) - 1.0);
}

#ifndef PI
#define PI 3.141592653589793
#endif

vec2 bezier_interpolate(vec2 p1, vec2 p2, float frac, float ix) {
  // Interpolates between two points on a Bezier curve around a jittered middle.
  // Makes animations look cooler.
    vec2 midpoint = box_muller(ix, 3.) * .05 *
         dot(p2 - p1, p2 - p1)
         + p2 / 2. + p1 / 2.;

      return mix(
        mix(p2, midpoint, frac),
        mix(midpoint, p1, frac),
      frac);
}

float sineInOut(float t) {
  return -0.5 * (cos(PI * t) - 1.0);
}

const vec4 decoder = vec4(1./256./256./256., 1. / 256. / 256., 1. / 256., 1.);

float RGBAtoFloat(in vec4 floater) {
  // Scale values up by 256.
  return dot(floater, decoder);
}

float texture_float_lookup(in vec2 domain,
                           in vec2 range,
                           in float transform,
                           in float attr,
                           in float texture_position) {
  if (transform == 4.0) {
    // Literal transforms aren't looked up, just returned as is.
    return attr;
  }
  float inrange = domainify(domain, transform, attr, 1.);
  if (texture_position > 0.5) {
    float y_pos = texture_position / 32. - 0.5 / 32.;
    vec4 encoded = texture2D(u_one_d_aesthetic_map, vec2(y_pos, inrange));
    return encoded.a;
    return RGBAtoFloat(encoded); // unreachable.
  } else {
    return mix(range.x, range.y, inrange);
  }
}

vec2 calculate_position(in vec2 position, in float x_scale_type,
                        in vec2 x_domain, in vec2 x_range, in float y_scale_type,
                        in vec2 y_domain, in vec2 y_range, in mat3 window_scale,
                        in mat3 zoom, in float x_map_position,
                        in float y_map_position
                        ) {
    float x;
    float y;

    if (x_scale_type < 4.0) {
      float x_ = linscale(u_color_domain, a_color);
      x = texture_float_lookup(x_domain, x_range,
        x_scale_type,
        position.x, 0. // ymap position 0 means never use a texture lookup.
        );
    } else {
      x = position.x;
    }

    if (y_scale_type < 4.0) {
      y = texture_float_lookup(y_domain, y_range, y_scale_type,
        position.y, 0. // ymap position 0 means never use a texture lookup.
        );
    } else {
      y = position.y;
    }
    vec3 pos2d = vec3(x, y, 1.0) * window_scale * zoom * pixelspace_to_glspace;
    return pos2d.xy;
}

float cubicInOut(float t) {
  return t < 0.5
    ? 4.0 * t * t * t
    : 1. - 4.0 * pow(1. - t, 3.0);
}

vec4 ixToRGBA(in float ix)  {
  float min = fract(ix / 256.);
  float mid = fract((ix - min) / 256.);
  float high = fract((ix - min - mid * 256.) / (256.) / 256.);
  return vec4(min, mid, high, 1.);
}

vec2 circle_jitter(in float ix, in float aspect_ratio, in float time,
                   in float radius, in float speed) {
  vec2 two_gaussians = box_muller(ix, 12.);

  float stagger_time = two_gaussians.y * tau;

  // How long does a circuit take?

  float units_per_period = radius * tau;
  float units_per_second = speed;
  float seconds_per_period = units_per_period / units_per_second;
  float time_period = seconds_per_period;
  if (time_period > 1e4) {
    return vec2(0., 0.);
  }

  // Adjust time from the clock to our current spot.
  float varying_time = time + stagger_time * time_period;
  // Where are we from 0 to 1 relative to the time period

  float relative_time = 1. - mod(varying_time, time_period) / time_period;

  float theta = relative_time * tau;
  // Problem--should it lie on a disk, or on a circle?
  float r_mult = 1.;//(sqrt(ix_to_random(ix, 7.)));

  return vec2(cos(theta) * r_mult, aspect_ratio * sin(theta) * r_mult) *
         radius;
}

vec2 calculate_jitter(
  in float jitter_type,
  in float ix, // distinguishing index
  in vec2 jitter_radius_domain,
  in vec2 jitter_radius_range,
  in float jitter_radius_transform,
  in float jitter_radius,
  in float jitter_radius_map_position,
  in bool jitter_radius_is_constant,
  in vec2 jitter_speed_domain,
  in vec2 jitter_speed_range,
  in float jitter_speed_transform,
  in float jitter_speed,
  in float jitter_speed_map_position,
  in bool jitter_speed_is_constant
) {

  // Jitter is calculated based on speed, so requires two full maps in.
  if (jitter_type == 0.) {
    // No jitter
    return vec2(0., 0.);
  }

  if (jitter_type == 5.) {
    // Temporal jitter--should be broken out into a separate channel/channels.
    float time_period = 60.;
    float share = 1./4.;
    float offset = ix_to_random(ix, 12.);
    float fractional = fract((offset * time_period + u_time)/time_period);
    if (fractional > share) {
      return vec2(0., 0.);
    }
    float size = 0.5 * (1. - cos(2. * 3.1415926 * min(fractional/share, 1. - fractional/share)));
    size = clamp(size, 0., 1.);
    return vec2(size, 0.);
  }
  float jitter_r;  
  if (jitter_radius_is_constant) {
    jitter_r = jitter_radius;
  } else {
    jitter_r = texture_float_lookup(
    jitter_radius_domain,
    jitter_radius_range,
    jitter_radius_transform,
    jitter_radius,
    0.);
  }
  if (jitter_type == 3.) {
    float r = box_muller(ix, 1.).r * jitter_r;
    r = r * point_size_adjust;
    float theta = ix_to_random(ix, 15.) * tau;
    return vec2(cos(theta) * r, sin(theta) * r * u_width / u_height);
  }

  if (jitter_type == 2.) {
    // uniform in the circle.
    float theta = ix_to_random(ix, 15.) * tau;
    float r = jitter_r * sqrt(ix_to_random(ix, 115.));
    r = r * point_size_adjust;
    return vec2(cos(theta) * r, sin(theta) * r * u_width / u_height);
  }

  /* Jittering that includes motion) */

  float p_jitter_speed =
      texture_float_lookup(jitter_speed_domain,
                          jitter_speed_range,
                          jitter_speed_transform, jitter_speed,
                          jitter_speed_map_position);

  if (jitter_type == 1.) {
    return logarithmic_spiral_jitter_1540259130(
                ix,
                0.005 * jitter_r,                     // a
                1.3302036,                       // angle parameter
                0.005,                                 // angle random
                jitter_r,                             // max radius
                0.03,                                 // random_rotation
                0.06,                                 // random radius
                0.003 * point_size_adjust * jitter_r, // donut.
                .5 * p_jitter_speed * jitter_r / point_size_adjust, // speed
                u_time,                                           // time
                0.8,                                              // acceleration
                2.0,                                              // n_spirals
                .09, //shear
                u_width/u_height         // shear
            );
  }

  if (jitter_type == 4.) {
    // circle
    return circle_jitter(ix, u_width/u_height, u_time, jitter_r, p_jitter_speed);
  }
}

void run_color_fill(in float ease) {
  float alpha = min(u_alpha, 1.0);
  if (u_only_color >= -1.5) {
    if (u_only_color > -.5 && a_color != u_only_color) {
      gl_Position = discard_me;
      return;
    } else {
      // -1 is a special value meaning 'plot everything'.
      fill = vec4(0., 0., 0., 1. / 255.);
      gl_PointSize = 1.;
    }
  } else {
    if (a_color_is_constant) {
      fill = vec4(u_color_constant.rgb, alpha);
    } else {
      float color_pos = (u_color_map_position * -1. - 1.) / 32. + 0.5 / 32.;
      float overflow_behavior = 1.; // means--clamp
      float fractional_color;
      if (u_wrap_colors_after.y > 0.) {
        fractional_color = fract(a_color / u_wrap_colors_after.y);
      } else {
        fractional_color = domainify(u_color_domain, u_color_transform, a_color, overflow_behavior);
      }
      fill = texture2D(u_color_aesthetic_map , vec2(color_pos, fractional_color));
      fill = vec4(fill.rgb, alpha);
    }
    if (ease < 1.) {
      vec4 last_fill;
      if (a_last_color_is_constant) {
        last_fill = vec4(u_last_color_constant.rgb, alpha);
      } else {
        float color_pos = (u_last_color_map_position * -1. - 1.) / 32. + 0.5 / 32.;
        float overflow_behavior = 1.; // means--clamp
        float last_fractional;
        if (u_wrap_colors_after.x > 0.) {
          last_fractional = fract(a_last_color / u_wrap_colors_after.x);
        } else {
          last_fractional = domainify(u_last_color_domain, u_last_color_transform, a_last_color, overflow_behavior);
        }
        last_fill = texture2D(u_color_aesthetic_map , vec2(color_pos, last_fractional));
        last_fill = vec4(last_fill.rgb, alpha);
        // last_fill = vec4(0.8, 0.1, 0.1, 1.0);
      }
      // RGB blending is bad--maybe use https://www.shadertoy.com/view/lsdGzN
      // instead?
      fill = mix(last_fill, fill, ease);
    }
  }
}

vec2 calc_and_interpolate_positions(
  inout vec2 old_position,
  in float u_last_x_transform,
  in vec2 u_last_x_domain,
  in vec2 u_last_x_range,
  in float u_last_y_transform,
  in vec2 u_last_y_domain,
  in vec2 u_last_y_range,
  in mat3 u_last_window_scale,
  in mat3 u_zoom,
  in float u_last_x_map_position,
  in float u_last_y_map_position,
  inout vec2 position,
  in float u_x_transform,
  in vec2 u_x_domain,
  in vec2 u_x_range,
  in float u_y_transform,
  in vec2 u_y_domain,
  in vec2 u_y_range,
  in mat3 u_window_scale,
  in float u_x_map_position,
  in float u_y_map_position,
  in float interpolation,
  in float u_grid_mode, 
  in float ix) {

  old_position = calculate_position(old_position, u_last_x_transform,
    u_last_x_domain, u_last_x_range,
    u_last_y_transform, u_last_y_domain, u_last_y_range,
    u_last_window_scale,
    u_zoom, u_last_x_map_position,      
    u_last_y_map_position);
    
  bool plot_actual_position = u_grid_mode < .5;

  if (plot_actual_position) {
    position = calculate_position(position, 
      u_x_transform,
      u_x_domain, u_x_range,
      u_y_transform, u_y_domain, 
      u_y_range, u_window_scale, u_zoom, 
      u_x_map_position, u_y_map_position);
    float xpos = clamp((1. + position.x) / 2., 0., 1.);
    float randy = ix_to_random(ix, 13.76);
    float delay = xpos + randy * .1;
    delay = delay * 3.;

    float frac = interpolate(
      u_update_time,
      delay,
      u_transition_duration + delay
    );

    frac = sineInOut_0(frac);

    if (frac <= 0.) {
      position = old_position;
    } else if (frac < 1.) {
      frac = fract(frac);
      position = bezier_interpolate(position, old_position, frac, ix);
    }
  } else {
    position.x = -1. + 2. * linscale(u_x_domain, position.x);
    //position.y = -1.0;
    vec2 jitterspec = vec2(
      (ix_to_random(ix, 3.) * a_jitter_radius ) * 2.,
      (ix_to_random(ix, 1.5) * a_jitter_speed ) * 2.
    );
    position = position + jitterspec;
  }
  return position;
}

void main() {
  float debug_mode = 0.;
  float ix = buffer_0;
  float ix_in_tile = buffer_1;
  if (ix > u_maxix) {
    // throw away points that are too low.
    gl_Position = discard_me;
    return;
  }

  if (debug_mode > 1.5) {
    // Debug mode.
    gl_PointSize = 2.;
    gl_Position = vec4(box_muller(ix, 2.).xy * .33, 0., 1.);
    return;
  }

 // Autogenerated below this point

    if (u_x_buffer_num > -0.5) {
      a_x = get_buffer(u_x_buffer_num);
      a_x_is_constant = false;
    } else {
      a_x = u_x_constant;
      a_x_is_constant = true;
    }

    if (u_last_x_buffer_num > -0.5) {
      a_last_x = get_buffer(u_last_x_buffer_num);
      a_last_x_is_constant = false;
    } else {
      a_last_x = u_last_x_constant;
      a_last_x_is_constant = true;
    }

    if (u_y_buffer_num > -0.5) {
      a_y = get_buffer(u_y_buffer_num);
      a_y_is_constant = false;
    } else {
      a_y = u_y_constant;
      a_y_is_constant = true;
    }

    if (u_last_y_buffer_num > -0.5) {
      a_last_y = get_buffer(u_last_y_buffer_num);
      a_last_y_is_constant = false;
    } else {
      a_last_y = u_last_y_constant;
      a_last_y_is_constant = true;
    }

    if (u_jitter_radius_buffer_num > -0.5) {
      a_jitter_radius = get_buffer(u_jitter_radius_buffer_num);
      a_jitter_radius_is_constant = false;
    } else {
      a_jitter_radius = u_jitter_radius_constant;
      a_jitter_radius_is_constant = true;
    }

    if (u_last_jitter_radius_buffer_num > -0.5) {
      a_last_jitter_radius = get_buffer(u_last_jitter_radius_buffer_num);
      a_last_jitter_radius_is_constant = false;
    } else {
      a_last_jitter_radius = u_last_jitter_radius_constant;
      a_last_jitter_radius_is_constant = true;
    }

    if (u_jitter_speed_buffer_num > -0.5) {
      a_jitter_speed = get_buffer(u_jitter_speed_buffer_num);
      a_jitter_speed_is_constant = false;
    } else {
      a_jitter_speed = u_jitter_speed_constant;
      a_jitter_speed_is_constant = true;
    }

    if (u_last_jitter_speed_buffer_num > -0.5) {
      a_last_jitter_speed = get_buffer(u_last_jitter_speed_buffer_num);
      a_last_jitter_speed_is_constant = false;
    } else {
      a_last_jitter_speed = u_last_jitter_speed_constant;
      a_last_jitter_speed_is_constant = true;
    }

    if (u_size_buffer_num > -0.5) {
      a_size = get_buffer(u_size_buffer_num);
      a_size_is_constant = false;
    } else {
      a_size = u_size_constant;
      a_size_is_constant = true;
    }

    if (u_last_size_buffer_num > -0.5) {
      a_last_size = get_buffer(u_last_size_buffer_num);
      a_last_size_is_constant = false;
    } else {
      a_last_size = u_last_size_constant;
      a_last_size_is_constant = true;
    }

    if (u_filter_buffer_num > -0.5) {
      a_filter = get_buffer(u_filter_buffer_num);
      a_filter_is_constant = false;
    } else {
      a_filter = u_filter_constant;
      a_filter_is_constant = true;
    }

    if (u_last_filter_buffer_num > -0.5) {
      a_last_filter = get_buffer(u_last_filter_buffer_num);
      a_last_filter_is_constant = false;
    } else {
      a_last_filter = u_last_filter_constant;
      a_last_filter_is_constant = true;
    }

    if (u_filter2_buffer_num > -0.5) {
      a_filter2 = get_buffer(u_filter2_buffer_num);
      a_filter2_is_constant = false;
    } else {
      a_filter2 = u_filter2_constant;
      a_filter2_is_constant = true;
    }

    if (u_last_filter2_buffer_num > -0.5) {
      a_last_filter2 = get_buffer(u_last_filter2_buffer_num);
      a_last_filter2_is_constant = false;
    } else {
      a_last_filter2 = u_last_filter2_constant;
      a_last_filter2_is_constant = true;
    }

    if (u_x0_buffer_num > -0.5) {
      a_x0 = get_buffer(u_x0_buffer_num);
      a_x0_is_constant = false;
    } else {
      a_x0 = u_x0_constant;
      a_x0_is_constant = true;
    }

    if (u_last_x0_buffer_num > -0.5) {
      a_last_x0 = get_buffer(u_last_x0_buffer_num);
      a_last_x0_is_constant = false;
    } else {
      a_last_x0 = u_last_x0_constant;
      a_last_x0_is_constant = true;
    }

    if (u_y0_buffer_num > -0.5) {
      a_y0 = get_buffer(u_y0_buffer_num);
      a_y0_is_constant = false;
    } else {
      a_y0 = u_y0_constant;
      a_y0_is_constant = true;
    }

    if (u_last_y0_buffer_num > -0.5) {
      a_last_y0 = get_buffer(u_last_y0_buffer_num);
      a_last_y0_is_constant = false;
    } else {
      a_last_y0 = u_last_y0_constant;
      a_last_y0_is_constant = true;
    }

    if (u_foreground_buffer_num > -0.5) {
      a_foreground = get_buffer(u_foreground_buffer_num);
      a_foreground_is_constant = false;
    } else {
      a_foreground = u_foreground_constant;
      a_foreground_is_constant = true;
    }

    if (u_last_foreground_buffer_num > -0.5) {
      a_last_foreground = get_buffer(u_last_foreground_buffer_num);
      a_last_foreground_is_constant = false;
    } else {
      a_last_foreground = u_last_foreground_constant;
      a_last_foreground_is_constant = true;
    }

//  END AUTOGENERATED. DO NOT EDIT ABOVE. 
// ------------------------------------------------    
  gl_PointSize = 1.;

  if (u_color_buffer_num > -0.5) {
    a_color = get_buffer(u_color_buffer_num);
    a_color_is_constant = false;
  } else {
    a_color = ix;
    a_color_is_constant = true;
  }

  if (u_last_color_buffer_num > -0.5) {
    a_last_color = get_buffer(u_last_color_buffer_num);
    a_last_color_is_constant = false;
  } else {
    a_last_color = ix;
    a_last_color_is_constant = true;
  }

  pixelspace_to_glspace = mat3(
      2. / u_width, 0., -1.,
      0., - 2. / u_height, 1.,
      0., 0., 1.
  );

  float interpolation =
    interpolate(u_update_time, 0., u_transition_duration);
    
  float ease = interpolation;

  // I set this sometimes.

  vec2 position = vec2(a_x, a_y);
  vec2 old_position = vec2(a_last_x, a_last_y);

  position = calc_and_interpolate_positions(
    old_position,
    u_last_x_transform,
    u_last_x_domain, u_last_x_range,
    u_last_y_transform,
    u_last_y_domain, u_last_y_range,
    u_last_window_scale,
    u_zoom,
    u_last_x_map_position,
    u_last_y_map_position,
    position,
    u_x_transform,
    u_x_domain, u_x_range,
    u_y_transform,
    u_y_domain, u_y_range,
    u_window_scale,
    u_x_map_position,
    u_y_map_position,
    interpolation,
    u_grid_mode,
    ix
  );

  if (u_x0_buffer_num > 0.) {
    vec2 position0 = vec2(a_x0, a_y0);
    vec2 old_position0 = vec2(a_last_x0, a_last_y0);

    position0 = calc_and_interpolate_positions(
      old_position0,
      u_last_x0_transform,
      u_last_x0_domain, u_last_x0_range,
      u_last_y0_transform,
      u_last_y0_domain, u_last_y0_range,
      u_last_window_scale,
      u_zoom,
      u_last_x0_map_position,
      u_last_y0_map_position,
      position0,
      u_x0_transform,
      u_x0_domain, u_x0_range,
      u_y0_transform,
      u_y0_domain, u_y0_range,
      u_window_scale,
      u_x0_map_position,
      u_y0_map_position,
      interpolation,
      u_grid_mode,
      ix
    );

    if (u_position_interpolation_mode > 0.) {
      float rand2 = ix_to_random(ix, 11.76);

      // If it's a continuous loop, just choose a random point along that loop.
      float rand_offset = fract(u_update_time/u_transition_duration / 10. + rand2);
      position = mix(position0, position, rand_offset);
    }
  }

  bool plot_actual_position = u_grid_mode < .5;

  if (u_position_interpolation_mode > 0.) {
    float rand2 = ix_to_random(ix, 11.76);

    // If it's a continuous loop, just choose a random point along that loop.
    float rand_offset = fract(u_update_time/u_transition_duration + rand2);
    
  }

/*  position = vec2(
    ix_to_random(ix, .1),
    ix_to_random(ix, .2)
  );*/
  /* FILTERING */

  float filter_status = choose_and_run_filter(
    u_filter_numeric,
    a_filter,
    u_filter_map_position,
    a_filter_is_constant
  );

  float last_filter_status = choose_and_run_filter(
    u_last_filter_numeric,
    a_last_filter,
    u_last_filter_map_position,
    a_last_filter_is_constant
  );

  float filter2_status = choose_and_run_filter(
    u_filter2_numeric,
    a_filter2,
    u_filter2_map_position,
    a_filter2_is_constant
  );

  float last_filter2_status = choose_and_run_filter(
    u_last_filter2_numeric,
    a_last_filter2,
    u_last_filter2_map_position,
    a_last_filter2_is_constant
  );

  float foreground_status = choose_and_run_filter(
    u_foreground_numeric,
    a_foreground,
    u_foreground_map_position,
    a_foreground_is_constant
  );

  float last_foreground_status = choose_and_run_filter(
    u_last_foreground_numeric,
    a_last_foreground,
    u_last_foreground_map_position,
    a_last_foreground_is_constant
  );
  float fg_ease = mix(last_foreground_status, foreground_status, ease);
  if (ease < ix_to_random(ix, 1.)) {
    foreground_status = last_foreground_status;
  }

  /*if (a_foreground_is_constant) {
    foreground_status = 1.;
  }*/

  bool was_filtered = last_filter2_status < .5 || last_filter_status < .5;
  bool will_be_filtered = filter2_status < .5 || filter_status < .5;

  bool overall_filter_status = will_be_filtered;

  if (ease < ix_to_random(ix, 1.)) {
    overall_filter_status = was_filtered;
  }

  if (overall_filter_status == true) {
    gl_Position = discard_me;
    return;
  }

  float size_multiplier = texture_float_lookup(
    u_size_domain,
    u_size_range,
    u_size_transform, a_size,
    u_size_map_position);

  float last_size_multiplier = texture_float_lookup(
    u_last_size_domain, u_last_size_range, u_last_size_transform, a_last_size,
    u_last_size_map_position);

  size_multiplier = u_base_size * 
     mix(last_size_multiplier, size_multiplier, ease);
  
  float depth_size_adjust = (1.0 - ix / (u_maxix));

  point_size_adjust = exp(log(u_k) * u_zoom_balance) ;// * depth_size_adjust;
//  point_size_adjust = exp(log(u_k) * u_zoom_balance);
  gl_PointSize = point_size_adjust * size_multiplier;

  if (gl_PointSize <= 5.1) {
    // It's ugly on new macs when it jumps straight from one to two for a bunch of points at once.
    float size_fuzz = exp(ix_to_random(ix, 3.1) * .5 - .25);
    gl_PointSize *= size_fuzz;
  }

  if (gl_PointSize <= 0.01) {
    gl_Position = discard_me;
    return;
  }
  vec2 jitter = vec2(0., 0.);

  if (plot_actual_position && (u_jitter > 0. || u_last_jitter > 0.)) {
    /* JITTER */
    jitter = vec2(ix_to_random(ix, 2. + u_time), ix_to_random(ix, 3. + u_time)) * .01;
    float jitter_radius_fraction;
      jitter = calculate_jitter(
        u_jitter, ix,
        u_jitter_radius_domain,        u_jitter_radius_range,
        u_jitter_radius_transform,        a_jitter_radius,
        u_jitter_radius_map_position,        a_jitter_radius_is_constant,
        u_jitter_speed_domain,
        u_jitter_speed_range,
        u_jitter_speed_transform, a_jitter_speed,
        u_jitter_speed_map_position, a_jitter_speed_is_constant
      );
    vec2 last_jitter;
    if (ease < 1.) {
      last_jitter = calculate_jitter(
        u_last_jitter, ix,
        u_last_jitter_radius_domain,       
        u_last_jitter_radius_range,
        u_last_jitter_radius_transform,        
        a_last_jitter_radius,
        u_last_jitter_radius_map_position,
        a_last_jitter_radius_is_constant,
        u_last_jitter_speed_domain,
        u_last_jitter_speed_range,
        u_last_jitter_speed_transform,
        a_last_jitter_speed,
        u_last_jitter_speed_map_position,
        a_last_jitter_speed_is_constant
      );
      jitter = mix(last_jitter, jitter, ease);
    }
    if (u_jitter == 5.) {
      // temporal jitter: rescale the point from the first dimension
      gl_PointSize *= jitter.x;
      jitter = vec2(0., 0.);
      if (gl_PointSize < 0.05) {
        gl_Position = discard_me;
        return;
      }
    }
    gl_Position = vec4(position + jitter, 0., 1.);
  } else {
    gl_Position = vec4(position + jitter, 0., 1.);
  }  
  if (u_color_picker_mode == 1.) {
    // Add one so the first element is distinguishable.
    fill = encode_float_1604150559(ix + 1.);
  } else if (u_color_picker_mode == 2.) {
    fill = encode_float_1604150559(u_tile_id + 1.);
  } else if (u_color_picker_mode == 3.) {
    fill = encode_float_1604150559(ix_in_tile + 1.);
  } else {
    run_color_fill(ease);
  }

  // Are we in a mode where we need to plot foreground and background?
  if (u_foreground_number > -1.) {
    // In that case, throw away points from the other half of the set.
    if (u_foreground_number != foreground_status) {
      gl_Position = discard_me;
      return;
    }
    if (u_foreground_number == 1.) {
      gl_PointSize *= u_foreground_size;
      fill = vec4(fill.rgb, min(1., fill.a * u_foreground_alpha));
    }
    // If we're in background mode, got to change the points a bit.
    if (u_foreground_number == 0.) { 
      gl_PointSize *= u_background_size;
      // Should the color piker run?
      if (u_color_picker_mode >= 1.) {
        if (u_background_mouseover == 1.) {
          // pass--keep the colors as are.
        } else {
          gl_Position = discard_me;
          return;
        }
      } else {
       float alpha = min(u_alpha * u_background_rgba.a, 1.);
        if (alpha < 1./255.) {
          // Very light alphas must be quantized. Only show an appropriate sample.
          float seed = ix_to_random(ix, 38.6);
          if (alpha * 255. < seed) {
            gl_Position = discard_me;
            return;
          } else {
            alpha = 1. / 255.;
          }
        }
        fill = vec4(u_background_rgba.rgb, alpha);
      }
    }
  }
    
  point_size = gl_PointSize;

/*  if (u_use_glyphset > 0. && point_size > 5.0) {
    float random_letter = floor(64. * ix_to_random(ix, 1.3));
    letter_pos = vec2(
      // start at a number between 0 and 7.
      mod(random_letter, 8.) / 8.,
      floor(random_letter / 8.) / 8.
    );
    gl_PointSize *= 3.0;
  }*/
}
`;
const frag_shader = "#ifdef GL_OES_standard_derivatives\n#extension GL_OES_standard_derivatives : enable\n#endif\n\nprecision mediump float;\n#define GLSLIFY 1\n\nvarying vec4 fill;\nvarying vec2 letter_pos;\nvarying float point_size;\n\nuniform float u_only_color;\nuniform float u_color_picker_mode;\n//uniform float u_use_glyphset;\n//uniform sampler2D u_glyphset;\n\nfloat delta = 0.0, alpha = 1.0;\n\nbool out_of_circle(in vec2 coord) {\n  vec2 cxy = 2.0 * coord - 1.0;\n  float r_sq = dot(cxy, cxy);\n  if (r_sq > 1.03) {return true;}\n  return false;\n}\n\nbool out_of_hollow_circle(in vec2 coord) {\n  vec2 cxy = 2.0 * coord - 1.0;\n  float r_sq = dot(cxy, cxy);\n  if (r_sq > 1.01) {return true;}\n  float distance_from_edge = (1.0 - r_sq) * point_size;\n  if (distance_from_edge > 4.0) {return true;}\n  return false;\n}\n\nbool out_of_triangle(in vec2 coord) {\n  if (coord.y > (2. * abs(coord.x - .5))) {\n    return false;\n  }\n  return true;\n}\n\nvoid main() {\n  if (u_only_color >= -1.5) {\n    gl_FragColor = vec4(0., 0., 0., 1./255.);\n    return;\n  }\n\n  float alpha = fill.a;\n//  if (u_use_glyphset == 0. || point_size < 5.0) {\n    if (out_of_circle(gl_PointCoord)) {\n      discard;\n      return;\n    }\n    vec2 cxy = 2.0 * gl_PointCoord - 1.0;\n    float r = dot(cxy, cxy);\n    #ifdef GL_OES_standard_derivatives\n      delta = fwidth(r);\n      alpha *= (1.0 - smoothstep(1.0 - delta, 1.0 + delta, r));\n    #endif\n/*  } else {\n    vec2 coords = letter_pos + gl_PointCoord/8.;\n//    vec2 coords = vec2(.2, .2);\n    vec4 sprite = texture2D(u_glyphset, coords);\n    alpha *= (sprite.a);  \n//    fill = vec4(1.0, 1.0, 1.0, alpha);  \n    if (alpha <= 0.03) discard;\n  }*/\n  // Pre-blend the alpha channel.\n  if (u_color_picker_mode >= 1.) {\n    // no alpha when color picking; we use all four channels for that.\n    gl_FragColor = fill;\n  } else {\n    gl_FragColor = vec4(fill.rgb * alpha, alpha);\n  }\n\n}\n";
function isOpChannel(input) {
  return input.op !== void 0;
}
function isLambdaChannel(input) {
  return input.lambda !== void 0;
}
function isConstantChannel(input) {
  return input.constant !== void 0;
}
function isURLLabels(labels) {
  return labels !== null && labels.url !== void 0;
}
function isLabelset(labels) {
  return labels !== null && labels.labels !== void 0;
}
var lodashExports = {};
var lodash = {
  get exports() {
    return lodashExports;
  },
  set exports(v) {
    lodashExports = v;
  }
};
/**
 * @license
 * Lodash <https://lodash.com/>
 * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
(function(module, exports) {
  (function() {
    var undefined$1;
    var VERSION = "4.17.21";
    var LARGE_ARRAY_SIZE = 200;
    var CORE_ERROR_TEXT = "Unsupported core-js use. Try https://npms.io/search?q=ponyfill.", FUNC_ERROR_TEXT = "Expected a function", INVALID_TEMPL_VAR_ERROR_TEXT = "Invalid `variable` option passed into `_.template`";
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    var MAX_MEMOIZE_SIZE = 500;
    var PLACEHOLDER = "__lodash_placeholder__";
    var CLONE_DEEP_FLAG = 1, CLONE_FLAT_FLAG = 2, CLONE_SYMBOLS_FLAG = 4;
    var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
    var WRAP_BIND_FLAG = 1, WRAP_BIND_KEY_FLAG = 2, WRAP_CURRY_BOUND_FLAG = 4, WRAP_CURRY_FLAG = 8, WRAP_CURRY_RIGHT_FLAG = 16, WRAP_PARTIAL_FLAG = 32, WRAP_PARTIAL_RIGHT_FLAG = 64, WRAP_ARY_FLAG = 128, WRAP_REARG_FLAG = 256, WRAP_FLIP_FLAG = 512;
    var DEFAULT_TRUNC_LENGTH = 30, DEFAULT_TRUNC_OMISSION = "...";
    var HOT_COUNT = 800, HOT_SPAN = 16;
    var LAZY_FILTER_FLAG = 1, LAZY_MAP_FLAG = 2, LAZY_WHILE_FLAG = 3;
    var INFINITY = 1 / 0, MAX_SAFE_INTEGER = 9007199254740991, MAX_INTEGER = 17976931348623157e292, NAN = 0 / 0;
    var MAX_ARRAY_LENGTH = 4294967295, MAX_ARRAY_INDEX = MAX_ARRAY_LENGTH - 1, HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH >>> 1;
    var wrapFlags = [
      ["ary", WRAP_ARY_FLAG],
      ["bind", WRAP_BIND_FLAG],
      ["bindKey", WRAP_BIND_KEY_FLAG],
      ["curry", WRAP_CURRY_FLAG],
      ["curryRight", WRAP_CURRY_RIGHT_FLAG],
      ["flip", WRAP_FLIP_FLAG],
      ["partial", WRAP_PARTIAL_FLAG],
      ["partialRight", WRAP_PARTIAL_RIGHT_FLAG],
      ["rearg", WRAP_REARG_FLAG]
    ];
    var argsTag = "[object Arguments]", arrayTag = "[object Array]", asyncTag = "[object AsyncFunction]", boolTag = "[object Boolean]", dateTag = "[object Date]", domExcTag = "[object DOMException]", errorTag = "[object Error]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", mapTag = "[object Map]", numberTag = "[object Number]", nullTag = "[object Null]", objectTag = "[object Object]", promiseTag = "[object Promise]", proxyTag = "[object Proxy]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]", undefinedTag = "[object Undefined]", weakMapTag = "[object WeakMap]", weakSetTag = "[object WeakSet]";
    var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
    var reEmptyStringLeading = /\b__p \+= '';/g, reEmptyStringMiddle = /\b(__p \+=) '' \+/g, reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;
    var reEscapedHtml = /&(?:amp|lt|gt|quot|#39);/g, reUnescapedHtml = /[&<>"']/g, reHasEscapedHtml = RegExp(reEscapedHtml.source), reHasUnescapedHtml = RegExp(reUnescapedHtml.source);
    var reEscape = /<%-([\s\S]+?)%>/g, reEvaluate = /<%([\s\S]+?)%>/g, reInterpolate = /<%=([\s\S]+?)%>/g;
    var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/, rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g, reHasRegExpChar = RegExp(reRegExpChar.source);
    var reTrimStart = /^\s+/;
    var reWhitespace = /\s/;
    var reWrapComment = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/, reWrapDetails = /\{\n\/\* \[wrapped with (.+)\] \*/, reSplitDetails = /,? & /;
    var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
    var reForbiddenIdentifierChars = /[()=,{}\[\]\/\s]/;
    var reEscapeChar = /\\(\\)?/g;
    var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;
    var reFlags = /\w*$/;
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
    var reIsBinary = /^0b[01]+$/i;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var reIsOctal = /^0o[0-7]+$/i;
    var reIsUint = /^(?:0|[1-9]\d*)$/;
    var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;
    var reNoMatch = /($^)/;
    var reUnescapedString = /['\n\r\u2028\u2029\\]/g;
    var rsAstralRange = "\\ud800-\\udfff", rsComboMarksRange = "\\u0300-\\u036f", reComboHalfMarksRange = "\\ufe20-\\ufe2f", rsComboSymbolsRange = "\\u20d0-\\u20ff", rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange, rsDingbatRange = "\\u2700-\\u27bf", rsLowerRange = "a-z\\xdf-\\xf6\\xf8-\\xff", rsMathOpRange = "\\xac\\xb1\\xd7\\xf7", rsNonCharRange = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", rsPunctuationRange = "\\u2000-\\u206f", rsSpaceRange = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", rsUpperRange = "A-Z\\xc0-\\xd6\\xd8-\\xde", rsVarRange = "\\ufe0e\\ufe0f", rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;
    var rsApos = "['’]", rsAstral = "[" + rsAstralRange + "]", rsBreak = "[" + rsBreakRange + "]", rsCombo = "[" + rsComboRange + "]", rsDigits = "\\d+", rsDingbat = "[" + rsDingbatRange + "]", rsLower = "[" + rsLowerRange + "]", rsMisc = "[^" + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + "]", rsFitz = "\\ud83c[\\udffb-\\udfff]", rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")", rsNonAstral = "[^" + rsAstralRange + "]", rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}", rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]", rsUpper = "[" + rsUpperRange + "]", rsZWJ = "\\u200d";
    var rsMiscLower = "(?:" + rsLower + "|" + rsMisc + ")", rsMiscUpper = "(?:" + rsUpper + "|" + rsMisc + ")", rsOptContrLower = "(?:" + rsApos + "(?:d|ll|m|re|s|t|ve))?", rsOptContrUpper = "(?:" + rsApos + "(?:D|LL|M|RE|S|T|VE))?", reOptMod = rsModifier + "?", rsOptVar = "[" + rsVarRange + "]?", rsOptJoin = "(?:" + rsZWJ + "(?:" + [rsNonAstral, rsRegional, rsSurrPair].join("|") + ")" + rsOptVar + reOptMod + ")*", rsOrdLower = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", rsOrdUpper = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", rsSeq = rsOptVar + reOptMod + rsOptJoin, rsEmoji = "(?:" + [rsDingbat, rsRegional, rsSurrPair].join("|") + ")" + rsSeq, rsSymbol = "(?:" + [rsNonAstral + rsCombo + "?", rsCombo, rsRegional, rsSurrPair, rsAstral].join("|") + ")";
    var reApos = RegExp(rsApos, "g");
    var reComboMark = RegExp(rsCombo, "g");
    var reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq, "g");
    var reUnicodeWord = RegExp([
      rsUpper + "?" + rsLower + "+" + rsOptContrLower + "(?=" + [rsBreak, rsUpper, "$"].join("|") + ")",
      rsMiscUpper + "+" + rsOptContrUpper + "(?=" + [rsBreak, rsUpper + rsMiscLower, "$"].join("|") + ")",
      rsUpper + "?" + rsMiscLower + "+" + rsOptContrLower,
      rsUpper + "+" + rsOptContrUpper,
      rsOrdUpper,
      rsOrdLower,
      rsDigits,
      rsEmoji
    ].join("|"), "g");
    var reHasUnicode = RegExp("[" + rsZWJ + rsAstralRange + rsComboRange + rsVarRange + "]");
    var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;
    var contextProps = [
      "Array",
      "Buffer",
      "DataView",
      "Date",
      "Error",
      "Float32Array",
      "Float64Array",
      "Function",
      "Int8Array",
      "Int16Array",
      "Int32Array",
      "Map",
      "Math",
      "Object",
      "Promise",
      "RegExp",
      "Set",
      "String",
      "Symbol",
      "TypeError",
      "Uint8Array",
      "Uint8ClampedArray",
      "Uint16Array",
      "Uint32Array",
      "WeakMap",
      "_",
      "clearTimeout",
      "isFinite",
      "parseInt",
      "setTimeout"
    ];
    var templateCounter = -1;
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
    var cloneableTags = {};
    cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[setTag] = cloneableTags[stringTag] = cloneableTags[symbolTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
    cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;
    var deburredLetters = {
      // Latin-1 Supplement block.
      "À": "A",
      "Á": "A",
      "Â": "A",
      "Ã": "A",
      "Ä": "A",
      "Å": "A",
      "à": "a",
      "á": "a",
      "â": "a",
      "ã": "a",
      "ä": "a",
      "å": "a",
      "Ç": "C",
      "ç": "c",
      "Ð": "D",
      "ð": "d",
      "È": "E",
      "É": "E",
      "Ê": "E",
      "Ë": "E",
      "è": "e",
      "é": "e",
      "ê": "e",
      "ë": "e",
      "Ì": "I",
      "Í": "I",
      "Î": "I",
      "Ï": "I",
      "ì": "i",
      "í": "i",
      "î": "i",
      "ï": "i",
      "Ñ": "N",
      "ñ": "n",
      "Ò": "O",
      "Ó": "O",
      "Ô": "O",
      "Õ": "O",
      "Ö": "O",
      "Ø": "O",
      "ò": "o",
      "ó": "o",
      "ô": "o",
      "õ": "o",
      "ö": "o",
      "ø": "o",
      "Ù": "U",
      "Ú": "U",
      "Û": "U",
      "Ü": "U",
      "ù": "u",
      "ú": "u",
      "û": "u",
      "ü": "u",
      "Ý": "Y",
      "ý": "y",
      "ÿ": "y",
      "Æ": "Ae",
      "æ": "ae",
      "Þ": "Th",
      "þ": "th",
      "ß": "ss",
      // Latin Extended-A block.
      "Ā": "A",
      "Ă": "A",
      "Ą": "A",
      "ā": "a",
      "ă": "a",
      "ą": "a",
      "Ć": "C",
      "Ĉ": "C",
      "Ċ": "C",
      "Č": "C",
      "ć": "c",
      "ĉ": "c",
      "ċ": "c",
      "č": "c",
      "Ď": "D",
      "Đ": "D",
      "ď": "d",
      "đ": "d",
      "Ē": "E",
      "Ĕ": "E",
      "Ė": "E",
      "Ę": "E",
      "Ě": "E",
      "ē": "e",
      "ĕ": "e",
      "ė": "e",
      "ę": "e",
      "ě": "e",
      "Ĝ": "G",
      "Ğ": "G",
      "Ġ": "G",
      "Ģ": "G",
      "ĝ": "g",
      "ğ": "g",
      "ġ": "g",
      "ģ": "g",
      "Ĥ": "H",
      "Ħ": "H",
      "ĥ": "h",
      "ħ": "h",
      "Ĩ": "I",
      "Ī": "I",
      "Ĭ": "I",
      "Į": "I",
      "İ": "I",
      "ĩ": "i",
      "ī": "i",
      "ĭ": "i",
      "į": "i",
      "ı": "i",
      "Ĵ": "J",
      "ĵ": "j",
      "Ķ": "K",
      "ķ": "k",
      "ĸ": "k",
      "Ĺ": "L",
      "Ļ": "L",
      "Ľ": "L",
      "Ŀ": "L",
      "Ł": "L",
      "ĺ": "l",
      "ļ": "l",
      "ľ": "l",
      "ŀ": "l",
      "ł": "l",
      "Ń": "N",
      "Ņ": "N",
      "Ň": "N",
      "Ŋ": "N",
      "ń": "n",
      "ņ": "n",
      "ň": "n",
      "ŋ": "n",
      "Ō": "O",
      "Ŏ": "O",
      "Ő": "O",
      "ō": "o",
      "ŏ": "o",
      "ő": "o",
      "Ŕ": "R",
      "Ŗ": "R",
      "Ř": "R",
      "ŕ": "r",
      "ŗ": "r",
      "ř": "r",
      "Ś": "S",
      "Ŝ": "S",
      "Ş": "S",
      "Š": "S",
      "ś": "s",
      "ŝ": "s",
      "ş": "s",
      "š": "s",
      "Ţ": "T",
      "Ť": "T",
      "Ŧ": "T",
      "ţ": "t",
      "ť": "t",
      "ŧ": "t",
      "Ũ": "U",
      "Ū": "U",
      "Ŭ": "U",
      "Ů": "U",
      "Ű": "U",
      "Ų": "U",
      "ũ": "u",
      "ū": "u",
      "ŭ": "u",
      "ů": "u",
      "ű": "u",
      "ų": "u",
      "Ŵ": "W",
      "ŵ": "w",
      "Ŷ": "Y",
      "ŷ": "y",
      "Ÿ": "Y",
      "Ź": "Z",
      "Ż": "Z",
      "Ž": "Z",
      "ź": "z",
      "ż": "z",
      "ž": "z",
      "Ĳ": "IJ",
      "ĳ": "ij",
      "Œ": "Oe",
      "œ": "oe",
      "ŉ": "'n",
      "ſ": "s"
    };
    var htmlEscapes = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    var htmlUnescapes = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#39;": "'"
    };
    var stringEscapes = {
      "\\": "\\",
      "'": "'",
      "\n": "n",
      "\r": "r",
      "\u2028": "u2028",
      "\u2029": "u2029"
    };
    var freeParseFloat = parseFloat, freeParseInt = parseInt;
    var freeGlobal = typeof commonjsGlobal == "object" && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root2 = freeGlobal || freeSelf || Function("return this")();
    var freeExports = exports && !exports.nodeType && exports;
    var freeModule = freeExports && true && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var freeProcess = moduleExports && freeGlobal.process;
    var nodeUtil = function() {
      try {
        var types = freeModule && freeModule.require && freeModule.require("util").types;
        if (types) {
          return types;
        }
        return freeProcess && freeProcess.binding && freeProcess.binding("util");
      } catch (e) {
      }
    }();
    var nodeIsArrayBuffer = nodeUtil && nodeUtil.isArrayBuffer, nodeIsDate = nodeUtil && nodeUtil.isDate, nodeIsMap = nodeUtil && nodeUtil.isMap, nodeIsRegExp = nodeUtil && nodeUtil.isRegExp, nodeIsSet = nodeUtil && nodeUtil.isSet, nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
    function apply(func, thisArg, args) {
      switch (args.length) {
        case 0:
          return func.call(thisArg);
        case 1:
          return func.call(thisArg, args[0]);
        case 2:
          return func.call(thisArg, args[0], args[1]);
        case 3:
          return func.call(thisArg, args[0], args[1], args[2]);
      }
      return func.apply(thisArg, args);
    }
    function arrayAggregator(array2, setter, iteratee, accumulator) {
      var index = -1, length = array2 == null ? 0 : array2.length;
      while (++index < length) {
        var value = array2[index];
        setter(accumulator, value, iteratee(value), array2);
      }
      return accumulator;
    }
    function arrayEach(array2, iteratee) {
      var index = -1, length = array2 == null ? 0 : array2.length;
      while (++index < length) {
        if (iteratee(array2[index], index, array2) === false) {
          break;
        }
      }
      return array2;
    }
    function arrayEachRight(array2, iteratee) {
      var length = array2 == null ? 0 : array2.length;
      while (length--) {
        if (iteratee(array2[length], length, array2) === false) {
          break;
        }
      }
      return array2;
    }
    function arrayEvery(array2, predicate) {
      var index = -1, length = array2 == null ? 0 : array2.length;
      while (++index < length) {
        if (!predicate(array2[index], index, array2)) {
          return false;
        }
      }
      return true;
    }
    function arrayFilter(array2, predicate) {
      var index = -1, length = array2 == null ? 0 : array2.length, resIndex = 0, result = [];
      while (++index < length) {
        var value = array2[index];
        if (predicate(value, index, array2)) {
          result[resIndex++] = value;
        }
      }
      return result;
    }
    function arrayIncludes(array2, value) {
      var length = array2 == null ? 0 : array2.length;
      return !!length && baseIndexOf(array2, value, 0) > -1;
    }
    function arrayIncludesWith(array2, value, comparator) {
      var index = -1, length = array2 == null ? 0 : array2.length;
      while (++index < length) {
        if (comparator(value, array2[index])) {
          return true;
        }
      }
      return false;
    }
    function arrayMap(array2, iteratee) {
      var index = -1, length = array2 == null ? 0 : array2.length, result = Array(length);
      while (++index < length) {
        result[index] = iteratee(array2[index], index, array2);
      }
      return result;
    }
    function arrayPush(array2, values) {
      var index = -1, length = values.length, offset = array2.length;
      while (++index < length) {
        array2[offset + index] = values[index];
      }
      return array2;
    }
    function arrayReduce(array2, iteratee, accumulator, initAccum) {
      var index = -1, length = array2 == null ? 0 : array2.length;
      if (initAccum && length) {
        accumulator = array2[++index];
      }
      while (++index < length) {
        accumulator = iteratee(accumulator, array2[index], index, array2);
      }
      return accumulator;
    }
    function arrayReduceRight(array2, iteratee, accumulator, initAccum) {
      var length = array2 == null ? 0 : array2.length;
      if (initAccum && length) {
        accumulator = array2[--length];
      }
      while (length--) {
        accumulator = iteratee(accumulator, array2[length], length, array2);
      }
      return accumulator;
    }
    function arraySome(array2, predicate) {
      var index = -1, length = array2 == null ? 0 : array2.length;
      while (++index < length) {
        if (predicate(array2[index], index, array2)) {
          return true;
        }
      }
      return false;
    }
    var asciiSize = baseProperty("length");
    function asciiToArray(string) {
      return string.split("");
    }
    function asciiWords(string) {
      return string.match(reAsciiWord) || [];
    }
    function baseFindKey(collection, predicate, eachFunc) {
      var result;
      eachFunc(collection, function(value, key, collection2) {
        if (predicate(value, key, collection2)) {
          result = key;
          return false;
        }
      });
      return result;
    }
    function baseFindIndex(array2, predicate, fromIndex, fromRight) {
      var length = array2.length, index = fromIndex + (fromRight ? 1 : -1);
      while (fromRight ? index-- : ++index < length) {
        if (predicate(array2[index], index, array2)) {
          return index;
        }
      }
      return -1;
    }
    function baseIndexOf(array2, value, fromIndex) {
      return value === value ? strictIndexOf(array2, value, fromIndex) : baseFindIndex(array2, baseIsNaN, fromIndex);
    }
    function baseIndexOfWith(array2, value, fromIndex, comparator) {
      var index = fromIndex - 1, length = array2.length;
      while (++index < length) {
        if (comparator(array2[index], value)) {
          return index;
        }
      }
      return -1;
    }
    function baseIsNaN(value) {
      return value !== value;
    }
    function baseMean(array2, iteratee) {
      var length = array2 == null ? 0 : array2.length;
      return length ? baseSum(array2, iteratee) / length : NAN;
    }
    function baseProperty(key) {
      return function(object2) {
        return object2 == null ? undefined$1 : object2[key];
      };
    }
    function basePropertyOf(object2) {
      return function(key) {
        return object2 == null ? undefined$1 : object2[key];
      };
    }
    function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
      eachFunc(collection, function(value, index, collection2) {
        accumulator = initAccum ? (initAccum = false, value) : iteratee(accumulator, value, index, collection2);
      });
      return accumulator;
    }
    function baseSortBy(array2, comparer) {
      var length = array2.length;
      array2.sort(comparer);
      while (length--) {
        array2[length] = array2[length].value;
      }
      return array2;
    }
    function baseSum(array2, iteratee) {
      var result, index = -1, length = array2.length;
      while (++index < length) {
        var current = iteratee(array2[index]);
        if (current !== undefined$1) {
          result = result === undefined$1 ? current : result + current;
        }
      }
      return result;
    }
    function baseTimes(n, iteratee) {
      var index = -1, result = Array(n);
      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }
    function baseToPairs(object2, props) {
      return arrayMap(props, function(key) {
        return [key, object2[key]];
      });
    }
    function baseTrim(string) {
      return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, "") : string;
    }
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }
    function baseValues(object2, props) {
      return arrayMap(props, function(key) {
        return object2[key];
      });
    }
    function cacheHas(cache, key) {
      return cache.has(key);
    }
    function charsStartIndex(strSymbols, chrSymbols) {
      var index = -1, length = strSymbols.length;
      while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {
      }
      return index;
    }
    function charsEndIndex(strSymbols, chrSymbols) {
      var index = strSymbols.length;
      while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {
      }
      return index;
    }
    function countHolders(array2, placeholder) {
      var length = array2.length, result = 0;
      while (length--) {
        if (array2[length] === placeholder) {
          ++result;
        }
      }
      return result;
    }
    var deburrLetter = basePropertyOf(deburredLetters);
    var escapeHtmlChar = basePropertyOf(htmlEscapes);
    function escapeStringChar(chr) {
      return "\\" + stringEscapes[chr];
    }
    function getValue(object2, key) {
      return object2 == null ? undefined$1 : object2[key];
    }
    function hasUnicode(string) {
      return reHasUnicode.test(string);
    }
    function hasUnicodeWord(string) {
      return reHasUnicodeWord.test(string);
    }
    function iteratorToArray(iterator) {
      var data, result = [];
      while (!(data = iterator.next()).done) {
        result.push(data.value);
      }
      return result;
    }
    function mapToArray(map2) {
      var index = -1, result = Array(map2.size);
      map2.forEach(function(value, key) {
        result[++index] = [key, value];
      });
      return result;
    }
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }
    function replaceHolders(array2, placeholder) {
      var index = -1, length = array2.length, resIndex = 0, result = [];
      while (++index < length) {
        var value = array2[index];
        if (value === placeholder || value === PLACEHOLDER) {
          array2[index] = PLACEHOLDER;
          result[resIndex++] = index;
        }
      }
      return result;
    }
    function setToArray(set2) {
      var index = -1, result = Array(set2.size);
      set2.forEach(function(value) {
        result[++index] = value;
      });
      return result;
    }
    function setToPairs(set2) {
      var index = -1, result = Array(set2.size);
      set2.forEach(function(value) {
        result[++index] = [value, value];
      });
      return result;
    }
    function strictIndexOf(array2, value, fromIndex) {
      var index = fromIndex - 1, length = array2.length;
      while (++index < length) {
        if (array2[index] === value) {
          return index;
        }
      }
      return -1;
    }
    function strictLastIndexOf(array2, value, fromIndex) {
      var index = fromIndex + 1;
      while (index--) {
        if (array2[index] === value) {
          return index;
        }
      }
      return index;
    }
    function stringSize(string) {
      return hasUnicode(string) ? unicodeSize(string) : asciiSize(string);
    }
    function stringToArray(string) {
      return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
    }
    function trimmedEndIndex(string) {
      var index = string.length;
      while (index-- && reWhitespace.test(string.charAt(index))) {
      }
      return index;
    }
    var unescapeHtmlChar = basePropertyOf(htmlUnescapes);
    function unicodeSize(string) {
      var result = reUnicode.lastIndex = 0;
      while (reUnicode.test(string)) {
        ++result;
      }
      return result;
    }
    function unicodeToArray(string) {
      return string.match(reUnicode) || [];
    }
    function unicodeWords(string) {
      return string.match(reUnicodeWord) || [];
    }
    var runInContext = function runInContext2(context2) {
      context2 = context2 == null ? root2 : _.defaults(root2.Object(), context2, _.pick(root2, contextProps));
      var Array2 = context2.Array, Date2 = context2.Date, Error2 = context2.Error, Function2 = context2.Function, Math2 = context2.Math, Object2 = context2.Object, RegExp2 = context2.RegExp, String2 = context2.String, TypeError2 = context2.TypeError;
      var arrayProto = Array2.prototype, funcProto = Function2.prototype, objectProto = Object2.prototype;
      var coreJsData = context2["__core-js_shared__"];
      var funcToString = funcProto.toString;
      var hasOwnProperty = objectProto.hasOwnProperty;
      var idCounter = 0;
      var maskSrcKey = function() {
        var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
        return uid ? "Symbol(src)_1." + uid : "";
      }();
      var nativeObjectToString = objectProto.toString;
      var objectCtorString = funcToString.call(Object2);
      var oldDash = root2._;
      var reIsNative = RegExp2(
        "^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
      );
      var Buffer = moduleExports ? context2.Buffer : undefined$1, Symbol2 = context2.Symbol, Uint8Array2 = context2.Uint8Array, allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined$1, getPrototype = overArg(Object2.getPrototypeOf, Object2), objectCreate = Object2.create, propertyIsEnumerable = objectProto.propertyIsEnumerable, splice = arrayProto.splice, spreadableSymbol = Symbol2 ? Symbol2.isConcatSpreadable : undefined$1, symIterator = Symbol2 ? Symbol2.iterator : undefined$1, symToStringTag = Symbol2 ? Symbol2.toStringTag : undefined$1;
      var defineProperty = function() {
        try {
          var func = getNative(Object2, "defineProperty");
          func({}, "", {});
          return func;
        } catch (e) {
        }
      }();
      var ctxClearTimeout = context2.clearTimeout !== root2.clearTimeout && context2.clearTimeout, ctxNow = Date2 && Date2.now !== root2.Date.now && Date2.now, ctxSetTimeout = context2.setTimeout !== root2.setTimeout && context2.setTimeout;
      var nativeCeil = Math2.ceil, nativeFloor = Math2.floor, nativeGetSymbols = Object2.getOwnPropertySymbols, nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined$1, nativeIsFinite = context2.isFinite, nativeJoin = arrayProto.join, nativeKeys = overArg(Object2.keys, Object2), nativeMax = Math2.max, nativeMin = Math2.min, nativeNow = Date2.now, nativeParseInt = context2.parseInt, nativeRandom = Math2.random, nativeReverse = arrayProto.reverse;
      var DataView2 = getNative(context2, "DataView"), Map2 = getNative(context2, "Map"), Promise2 = getNative(context2, "Promise"), Set4 = getNative(context2, "Set"), WeakMap = getNative(context2, "WeakMap"), nativeCreate = getNative(Object2, "create");
      var metaMap = WeakMap && new WeakMap();
      var realNames = {};
      var dataViewCtorString = toSource(DataView2), mapCtorString = toSource(Map2), promiseCtorString = toSource(Promise2), setCtorString = toSource(Set4), weakMapCtorString = toSource(WeakMap);
      var symbolProto = Symbol2 ? Symbol2.prototype : undefined$1, symbolValueOf = symbolProto ? symbolProto.valueOf : undefined$1, symbolToString = symbolProto ? symbolProto.toString : undefined$1;
      function lodash2(value) {
        if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
          if (value instanceof LodashWrapper) {
            return value;
          }
          if (hasOwnProperty.call(value, "__wrapped__")) {
            return wrapperClone(value);
          }
        }
        return new LodashWrapper(value);
      }
      var baseCreate = function() {
        function object2() {
        }
        return function(proto) {
          if (!isObject(proto)) {
            return {};
          }
          if (objectCreate) {
            return objectCreate(proto);
          }
          object2.prototype = proto;
          var result2 = new object2();
          object2.prototype = undefined$1;
          return result2;
        };
      }();
      function baseLodash() {
      }
      function LodashWrapper(value, chainAll) {
        this.__wrapped__ = value;
        this.__actions__ = [];
        this.__chain__ = !!chainAll;
        this.__index__ = 0;
        this.__values__ = undefined$1;
      }
      lodash2.templateSettings = {
        /**
         * Used to detect `data` property values to be HTML-escaped.
         *
         * @memberOf _.templateSettings
         * @type {RegExp}
         */
        "escape": reEscape,
        /**
         * Used to detect code to be evaluated.
         *
         * @memberOf _.templateSettings
         * @type {RegExp}
         */
        "evaluate": reEvaluate,
        /**
         * Used to detect `data` property values to inject.
         *
         * @memberOf _.templateSettings
         * @type {RegExp}
         */
        "interpolate": reInterpolate,
        /**
         * Used to reference the data object in the template text.
         *
         * @memberOf _.templateSettings
         * @type {string}
         */
        "variable": "",
        /**
         * Used to import variables into the compiled template.
         *
         * @memberOf _.templateSettings
         * @type {Object}
         */
        "imports": {
          /**
           * A reference to the `lodash` function.
           *
           * @memberOf _.templateSettings.imports
           * @type {Function}
           */
          "_": lodash2
        }
      };
      lodash2.prototype = baseLodash.prototype;
      lodash2.prototype.constructor = lodash2;
      LodashWrapper.prototype = baseCreate(baseLodash.prototype);
      LodashWrapper.prototype.constructor = LodashWrapper;
      function LazyWrapper(value) {
        this.__wrapped__ = value;
        this.__actions__ = [];
        this.__dir__ = 1;
        this.__filtered__ = false;
        this.__iteratees__ = [];
        this.__takeCount__ = MAX_ARRAY_LENGTH;
        this.__views__ = [];
      }
      function lazyClone() {
        var result2 = new LazyWrapper(this.__wrapped__);
        result2.__actions__ = copyArray(this.__actions__);
        result2.__dir__ = this.__dir__;
        result2.__filtered__ = this.__filtered__;
        result2.__iteratees__ = copyArray(this.__iteratees__);
        result2.__takeCount__ = this.__takeCount__;
        result2.__views__ = copyArray(this.__views__);
        return result2;
      }
      function lazyReverse() {
        if (this.__filtered__) {
          var result2 = new LazyWrapper(this);
          result2.__dir__ = -1;
          result2.__filtered__ = true;
        } else {
          result2 = this.clone();
          result2.__dir__ *= -1;
        }
        return result2;
      }
      function lazyValue() {
        var array2 = this.__wrapped__.value(), dir = this.__dir__, isArr = isArray(array2), isRight = dir < 0, arrLength = isArr ? array2.length : 0, view = getView(0, arrLength, this.__views__), start2 = view.start, end = view.end, length = end - start2, index = isRight ? end : start2 - 1, iteratees = this.__iteratees__, iterLength = iteratees.length, resIndex = 0, takeCount = nativeMin(length, this.__takeCount__);
        if (!isArr || !isRight && arrLength == length && takeCount == length) {
          return baseWrapperValue(array2, this.__actions__);
        }
        var result2 = [];
        outer:
          while (length-- && resIndex < takeCount) {
            index += dir;
            var iterIndex = -1, value = array2[index];
            while (++iterIndex < iterLength) {
              var data = iteratees[iterIndex], iteratee2 = data.iteratee, type = data.type, computed = iteratee2(value);
              if (type == LAZY_MAP_FLAG) {
                value = computed;
              } else if (!computed) {
                if (type == LAZY_FILTER_FLAG) {
                  continue outer;
                } else {
                  break outer;
                }
              }
            }
            result2[resIndex++] = value;
          }
        return result2;
      }
      LazyWrapper.prototype = baseCreate(baseLodash.prototype);
      LazyWrapper.prototype.constructor = LazyWrapper;
      function Hash(entries) {
        var index = -1, length = entries == null ? 0 : entries.length;
        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }
      function hashClear() {
        this.__data__ = nativeCreate ? nativeCreate(null) : {};
        this.size = 0;
      }
      function hashDelete(key) {
        var result2 = this.has(key) && delete this.__data__[key];
        this.size -= result2 ? 1 : 0;
        return result2;
      }
      function hashGet(key) {
        var data = this.__data__;
        if (nativeCreate) {
          var result2 = data[key];
          return result2 === HASH_UNDEFINED ? undefined$1 : result2;
        }
        return hasOwnProperty.call(data, key) ? data[key] : undefined$1;
      }
      function hashHas(key) {
        var data = this.__data__;
        return nativeCreate ? data[key] !== undefined$1 : hasOwnProperty.call(data, key);
      }
      function hashSet(key, value) {
        var data = this.__data__;
        this.size += this.has(key) ? 0 : 1;
        data[key] = nativeCreate && value === undefined$1 ? HASH_UNDEFINED : value;
        return this;
      }
      Hash.prototype.clear = hashClear;
      Hash.prototype["delete"] = hashDelete;
      Hash.prototype.get = hashGet;
      Hash.prototype.has = hashHas;
      Hash.prototype.set = hashSet;
      function ListCache(entries) {
        var index = -1, length = entries == null ? 0 : entries.length;
        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }
      function listCacheClear() {
        this.__data__ = [];
        this.size = 0;
      }
      function listCacheDelete(key) {
        var data = this.__data__, index = assocIndexOf(data, key);
        if (index < 0) {
          return false;
        }
        var lastIndex = data.length - 1;
        if (index == lastIndex) {
          data.pop();
        } else {
          splice.call(data, index, 1);
        }
        --this.size;
        return true;
      }
      function listCacheGet(key) {
        var data = this.__data__, index = assocIndexOf(data, key);
        return index < 0 ? undefined$1 : data[index][1];
      }
      function listCacheHas(key) {
        return assocIndexOf(this.__data__, key) > -1;
      }
      function listCacheSet(key, value) {
        var data = this.__data__, index = assocIndexOf(data, key);
        if (index < 0) {
          ++this.size;
          data.push([key, value]);
        } else {
          data[index][1] = value;
        }
        return this;
      }
      ListCache.prototype.clear = listCacheClear;
      ListCache.prototype["delete"] = listCacheDelete;
      ListCache.prototype.get = listCacheGet;
      ListCache.prototype.has = listCacheHas;
      ListCache.prototype.set = listCacheSet;
      function MapCache(entries) {
        var index = -1, length = entries == null ? 0 : entries.length;
        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }
      function mapCacheClear() {
        this.size = 0;
        this.__data__ = {
          "hash": new Hash(),
          "map": new (Map2 || ListCache)(),
          "string": new Hash()
        };
      }
      function mapCacheDelete(key) {
        var result2 = getMapData(this, key)["delete"](key);
        this.size -= result2 ? 1 : 0;
        return result2;
      }
      function mapCacheGet(key) {
        return getMapData(this, key).get(key);
      }
      function mapCacheHas(key) {
        return getMapData(this, key).has(key);
      }
      function mapCacheSet(key, value) {
        var data = getMapData(this, key), size2 = data.size;
        data.set(key, value);
        this.size += data.size == size2 ? 0 : 1;
        return this;
      }
      MapCache.prototype.clear = mapCacheClear;
      MapCache.prototype["delete"] = mapCacheDelete;
      MapCache.prototype.get = mapCacheGet;
      MapCache.prototype.has = mapCacheHas;
      MapCache.prototype.set = mapCacheSet;
      function SetCache(values2) {
        var index = -1, length = values2 == null ? 0 : values2.length;
        this.__data__ = new MapCache();
        while (++index < length) {
          this.add(values2[index]);
        }
      }
      function setCacheAdd(value) {
        this.__data__.set(value, HASH_UNDEFINED);
        return this;
      }
      function setCacheHas(value) {
        return this.__data__.has(value);
      }
      SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
      SetCache.prototype.has = setCacheHas;
      function Stack(entries) {
        var data = this.__data__ = new ListCache(entries);
        this.size = data.size;
      }
      function stackClear() {
        this.__data__ = new ListCache();
        this.size = 0;
      }
      function stackDelete(key) {
        var data = this.__data__, result2 = data["delete"](key);
        this.size = data.size;
        return result2;
      }
      function stackGet(key) {
        return this.__data__.get(key);
      }
      function stackHas(key) {
        return this.__data__.has(key);
      }
      function stackSet(key, value) {
        var data = this.__data__;
        if (data instanceof ListCache) {
          var pairs = data.__data__;
          if (!Map2 || pairs.length < LARGE_ARRAY_SIZE - 1) {
            pairs.push([key, value]);
            this.size = ++data.size;
            return this;
          }
          data = this.__data__ = new MapCache(pairs);
        }
        data.set(key, value);
        this.size = data.size;
        return this;
      }
      Stack.prototype.clear = stackClear;
      Stack.prototype["delete"] = stackDelete;
      Stack.prototype.get = stackGet;
      Stack.prototype.has = stackHas;
      Stack.prototype.set = stackSet;
      function arrayLikeKeys(value, inherited) {
        var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result2 = skipIndexes ? baseTimes(value.length, String2) : [], length = result2.length;
        for (var key in value) {
          if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
          (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
          isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
          isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
          isIndex(key, length)))) {
            result2.push(key);
          }
        }
        return result2;
      }
      function arraySample(array2) {
        var length = array2.length;
        return length ? array2[baseRandom(0, length - 1)] : undefined$1;
      }
      function arraySampleSize(array2, n) {
        return shuffleSelf(copyArray(array2), baseClamp(n, 0, array2.length));
      }
      function arrayShuffle(array2) {
        return shuffleSelf(copyArray(array2));
      }
      function assignMergeValue(object2, key, value) {
        if (value !== undefined$1 && !eq(object2[key], value) || value === undefined$1 && !(key in object2)) {
          baseAssignValue(object2, key, value);
        }
      }
      function assignValue(object2, key, value) {
        var objValue = object2[key];
        if (!(hasOwnProperty.call(object2, key) && eq(objValue, value)) || value === undefined$1 && !(key in object2)) {
          baseAssignValue(object2, key, value);
        }
      }
      function assocIndexOf(array2, key) {
        var length = array2.length;
        while (length--) {
          if (eq(array2[length][0], key)) {
            return length;
          }
        }
        return -1;
      }
      function baseAggregator(collection, setter, iteratee2, accumulator) {
        baseEach(collection, function(value, key, collection2) {
          setter(accumulator, value, iteratee2(value), collection2);
        });
        return accumulator;
      }
      function baseAssign(object2, source) {
        return object2 && copyObject(source, keys(source), object2);
      }
      function baseAssignIn(object2, source) {
        return object2 && copyObject(source, keysIn(source), object2);
      }
      function baseAssignValue(object2, key, value) {
        if (key == "__proto__" && defineProperty) {
          defineProperty(object2, key, {
            "configurable": true,
            "enumerable": true,
            "value": value,
            "writable": true
          });
        } else {
          object2[key] = value;
        }
      }
      function baseAt(object2, paths) {
        var index = -1, length = paths.length, result2 = Array2(length), skip = object2 == null;
        while (++index < length) {
          result2[index] = skip ? undefined$1 : get2(object2, paths[index]);
        }
        return result2;
      }
      function baseClamp(number2, lower2, upper) {
        if (number2 === number2) {
          if (upper !== undefined$1) {
            number2 = number2 <= upper ? number2 : upper;
          }
          if (lower2 !== undefined$1) {
            number2 = number2 >= lower2 ? number2 : lower2;
          }
        }
        return number2;
      }
      function baseClone(value, bitmask, customizer, key, object2, stack) {
        var result2, isDeep = bitmask & CLONE_DEEP_FLAG, isFlat = bitmask & CLONE_FLAT_FLAG, isFull = bitmask & CLONE_SYMBOLS_FLAG;
        if (customizer) {
          result2 = object2 ? customizer(value, key, object2, stack) : customizer(value);
        }
        if (result2 !== undefined$1) {
          return result2;
        }
        if (!isObject(value)) {
          return value;
        }
        var isArr = isArray(value);
        if (isArr) {
          result2 = initCloneArray(value);
          if (!isDeep) {
            return copyArray(value, result2);
          }
        } else {
          var tag = getTag(value), isFunc = tag == funcTag || tag == genTag;
          if (isBuffer(value)) {
            return cloneBuffer(value, isDeep);
          }
          if (tag == objectTag || tag == argsTag || isFunc && !object2) {
            result2 = isFlat || isFunc ? {} : initCloneObject(value);
            if (!isDeep) {
              return isFlat ? copySymbolsIn(value, baseAssignIn(result2, value)) : copySymbols(value, baseAssign(result2, value));
            }
          } else {
            if (!cloneableTags[tag]) {
              return object2 ? value : {};
            }
            result2 = initCloneByTag(value, tag, isDeep);
          }
        }
        stack || (stack = new Stack());
        var stacked = stack.get(value);
        if (stacked) {
          return stacked;
        }
        stack.set(value, result2);
        if (isSet(value)) {
          value.forEach(function(subValue) {
            result2.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
          });
        } else if (isMap(value)) {
          value.forEach(function(subValue, key2) {
            result2.set(key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
          });
        }
        var keysFunc = isFull ? isFlat ? getAllKeysIn : getAllKeys : isFlat ? keysIn : keys;
        var props = isArr ? undefined$1 : keysFunc(value);
        arrayEach(props || value, function(subValue, key2) {
          if (props) {
            key2 = subValue;
            subValue = value[key2];
          }
          assignValue(result2, key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
        });
        return result2;
      }
      function baseConforms(source) {
        var props = keys(source);
        return function(object2) {
          return baseConformsTo(object2, source, props);
        };
      }
      function baseConformsTo(object2, source, props) {
        var length = props.length;
        if (object2 == null) {
          return !length;
        }
        object2 = Object2(object2);
        while (length--) {
          var key = props[length], predicate = source[key], value = object2[key];
          if (value === undefined$1 && !(key in object2) || !predicate(value)) {
            return false;
          }
        }
        return true;
      }
      function baseDelay(func, wait, args) {
        if (typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        return setTimeout2(function() {
          func.apply(undefined$1, args);
        }, wait);
      }
      function baseDifference(array2, values2, iteratee2, comparator) {
        var index = -1, includes2 = arrayIncludes, isCommon = true, length = array2.length, result2 = [], valuesLength = values2.length;
        if (!length) {
          return result2;
        }
        if (iteratee2) {
          values2 = arrayMap(values2, baseUnary(iteratee2));
        }
        if (comparator) {
          includes2 = arrayIncludesWith;
          isCommon = false;
        } else if (values2.length >= LARGE_ARRAY_SIZE) {
          includes2 = cacheHas;
          isCommon = false;
          values2 = new SetCache(values2);
        }
        outer:
          while (++index < length) {
            var value = array2[index], computed = iteratee2 == null ? value : iteratee2(value);
            value = comparator || value !== 0 ? value : 0;
            if (isCommon && computed === computed) {
              var valuesIndex = valuesLength;
              while (valuesIndex--) {
                if (values2[valuesIndex] === computed) {
                  continue outer;
                }
              }
              result2.push(value);
            } else if (!includes2(values2, computed, comparator)) {
              result2.push(value);
            }
          }
        return result2;
      }
      var baseEach = createBaseEach(baseForOwn);
      var baseEachRight = createBaseEach(baseForOwnRight, true);
      function baseEvery(collection, predicate) {
        var result2 = true;
        baseEach(collection, function(value, index, collection2) {
          result2 = !!predicate(value, index, collection2);
          return result2;
        });
        return result2;
      }
      function baseExtremum(array2, iteratee2, comparator) {
        var index = -1, length = array2.length;
        while (++index < length) {
          var value = array2[index], current = iteratee2(value);
          if (current != null && (computed === undefined$1 ? current === current && !isSymbol(current) : comparator(current, computed))) {
            var computed = current, result2 = value;
          }
        }
        return result2;
      }
      function baseFill(array2, value, start2, end) {
        var length = array2.length;
        start2 = toInteger(start2);
        if (start2 < 0) {
          start2 = -start2 > length ? 0 : length + start2;
        }
        end = end === undefined$1 || end > length ? length : toInteger(end);
        if (end < 0) {
          end += length;
        }
        end = start2 > end ? 0 : toLength(end);
        while (start2 < end) {
          array2[start2++] = value;
        }
        return array2;
      }
      function baseFilter(collection, predicate) {
        var result2 = [];
        baseEach(collection, function(value, index, collection2) {
          if (predicate(value, index, collection2)) {
            result2.push(value);
          }
        });
        return result2;
      }
      function baseFlatten(array2, depth, predicate, isStrict, result2) {
        var index = -1, length = array2.length;
        predicate || (predicate = isFlattenable);
        result2 || (result2 = []);
        while (++index < length) {
          var value = array2[index];
          if (depth > 0 && predicate(value)) {
            if (depth > 1) {
              baseFlatten(value, depth - 1, predicate, isStrict, result2);
            } else {
              arrayPush(result2, value);
            }
          } else if (!isStrict) {
            result2[result2.length] = value;
          }
        }
        return result2;
      }
      var baseFor = createBaseFor();
      var baseForRight = createBaseFor(true);
      function baseForOwn(object2, iteratee2) {
        return object2 && baseFor(object2, iteratee2, keys);
      }
      function baseForOwnRight(object2, iteratee2) {
        return object2 && baseForRight(object2, iteratee2, keys);
      }
      function baseFunctions(object2, props) {
        return arrayFilter(props, function(key) {
          return isFunction(object2[key]);
        });
      }
      function baseGet(object2, path) {
        path = castPath(path, object2);
        var index = 0, length = path.length;
        while (object2 != null && index < length) {
          object2 = object2[toKey(path[index++])];
        }
        return index && index == length ? object2 : undefined$1;
      }
      function baseGetAllKeys(object2, keysFunc, symbolsFunc) {
        var result2 = keysFunc(object2);
        return isArray(object2) ? result2 : arrayPush(result2, symbolsFunc(object2));
      }
      function baseGetTag(value) {
        if (value == null) {
          return value === undefined$1 ? undefinedTag : nullTag;
        }
        return symToStringTag && symToStringTag in Object2(value) ? getRawTag(value) : objectToString(value);
      }
      function baseGt(value, other) {
        return value > other;
      }
      function baseHas(object2, key) {
        return object2 != null && hasOwnProperty.call(object2, key);
      }
      function baseHasIn(object2, key) {
        return object2 != null && key in Object2(object2);
      }
      function baseInRange(number2, start2, end) {
        return number2 >= nativeMin(start2, end) && number2 < nativeMax(start2, end);
      }
      function baseIntersection(arrays, iteratee2, comparator) {
        var includes2 = comparator ? arrayIncludesWith : arrayIncludes, length = arrays[0].length, othLength = arrays.length, othIndex = othLength, caches = Array2(othLength), maxLength = Infinity, result2 = [];
        while (othIndex--) {
          var array2 = arrays[othIndex];
          if (othIndex && iteratee2) {
            array2 = arrayMap(array2, baseUnary(iteratee2));
          }
          maxLength = nativeMin(array2.length, maxLength);
          caches[othIndex] = !comparator && (iteratee2 || length >= 120 && array2.length >= 120) ? new SetCache(othIndex && array2) : undefined$1;
        }
        array2 = arrays[0];
        var index = -1, seen = caches[0];
        outer:
          while (++index < length && result2.length < maxLength) {
            var value = array2[index], computed = iteratee2 ? iteratee2(value) : value;
            value = comparator || value !== 0 ? value : 0;
            if (!(seen ? cacheHas(seen, computed) : includes2(result2, computed, comparator))) {
              othIndex = othLength;
              while (--othIndex) {
                var cache = caches[othIndex];
                if (!(cache ? cacheHas(cache, computed) : includes2(arrays[othIndex], computed, comparator))) {
                  continue outer;
                }
              }
              if (seen) {
                seen.push(computed);
              }
              result2.push(value);
            }
          }
        return result2;
      }
      function baseInverter(object2, setter, iteratee2, accumulator) {
        baseForOwn(object2, function(value, key, object3) {
          setter(accumulator, iteratee2(value), key, object3);
        });
        return accumulator;
      }
      function baseInvoke(object2, path, args) {
        path = castPath(path, object2);
        object2 = parent(object2, path);
        var func = object2 == null ? object2 : object2[toKey(last(path))];
        return func == null ? undefined$1 : apply(func, object2, args);
      }
      function baseIsArguments(value) {
        return isObjectLike(value) && baseGetTag(value) == argsTag;
      }
      function baseIsArrayBuffer(value) {
        return isObjectLike(value) && baseGetTag(value) == arrayBufferTag;
      }
      function baseIsDate(value) {
        return isObjectLike(value) && baseGetTag(value) == dateTag;
      }
      function baseIsEqual(value, other, bitmask, customizer, stack) {
        if (value === other) {
          return true;
        }
        if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
          return value !== value && other !== other;
        }
        return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
      }
      function baseIsEqualDeep(object2, other, bitmask, customizer, equalFunc, stack) {
        var objIsArr = isArray(object2), othIsArr = isArray(other), objTag = objIsArr ? arrayTag : getTag(object2), othTag = othIsArr ? arrayTag : getTag(other);
        objTag = objTag == argsTag ? objectTag : objTag;
        othTag = othTag == argsTag ? objectTag : othTag;
        var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
        if (isSameTag && isBuffer(object2)) {
          if (!isBuffer(other)) {
            return false;
          }
          objIsArr = true;
          objIsObj = false;
        }
        if (isSameTag && !objIsObj) {
          stack || (stack = new Stack());
          return objIsArr || isTypedArray(object2) ? equalArrays(object2, other, bitmask, customizer, equalFunc, stack) : equalByTag(object2, other, objTag, bitmask, customizer, equalFunc, stack);
        }
        if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
          var objIsWrapped = objIsObj && hasOwnProperty.call(object2, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
          if (objIsWrapped || othIsWrapped) {
            var objUnwrapped = objIsWrapped ? object2.value() : object2, othUnwrapped = othIsWrapped ? other.value() : other;
            stack || (stack = new Stack());
            return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
          }
        }
        if (!isSameTag) {
          return false;
        }
        stack || (stack = new Stack());
        return equalObjects(object2, other, bitmask, customizer, equalFunc, stack);
      }
      function baseIsMap(value) {
        return isObjectLike(value) && getTag(value) == mapTag;
      }
      function baseIsMatch(object2, source, matchData, customizer) {
        var index = matchData.length, length = index, noCustomizer = !customizer;
        if (object2 == null) {
          return !length;
        }
        object2 = Object2(object2);
        while (index--) {
          var data = matchData[index];
          if (noCustomizer && data[2] ? data[1] !== object2[data[0]] : !(data[0] in object2)) {
            return false;
          }
        }
        while (++index < length) {
          data = matchData[index];
          var key = data[0], objValue = object2[key], srcValue = data[1];
          if (noCustomizer && data[2]) {
            if (objValue === undefined$1 && !(key in object2)) {
              return false;
            }
          } else {
            var stack = new Stack();
            if (customizer) {
              var result2 = customizer(objValue, srcValue, key, object2, source, stack);
            }
            if (!(result2 === undefined$1 ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack) : result2)) {
              return false;
            }
          }
        }
        return true;
      }
      function baseIsNative(value) {
        if (!isObject(value) || isMasked(value)) {
          return false;
        }
        var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
        return pattern.test(toSource(value));
      }
      function baseIsRegExp(value) {
        return isObjectLike(value) && baseGetTag(value) == regexpTag;
      }
      function baseIsSet(value) {
        return isObjectLike(value) && getTag(value) == setTag;
      }
      function baseIsTypedArray(value) {
        return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
      }
      function baseIteratee(value) {
        if (typeof value == "function") {
          return value;
        }
        if (value == null) {
          return identity2;
        }
        if (typeof value == "object") {
          return isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
        }
        return property(value);
      }
      function baseKeys(object2) {
        if (!isPrototype(object2)) {
          return nativeKeys(object2);
        }
        var result2 = [];
        for (var key in Object2(object2)) {
          if (hasOwnProperty.call(object2, key) && key != "constructor") {
            result2.push(key);
          }
        }
        return result2;
      }
      function baseKeysIn(object2) {
        if (!isObject(object2)) {
          return nativeKeysIn(object2);
        }
        var isProto = isPrototype(object2), result2 = [];
        for (var key in object2) {
          if (!(key == "constructor" && (isProto || !hasOwnProperty.call(object2, key)))) {
            result2.push(key);
          }
        }
        return result2;
      }
      function baseLt(value, other) {
        return value < other;
      }
      function baseMap(collection, iteratee2) {
        var index = -1, result2 = isArrayLike(collection) ? Array2(collection.length) : [];
        baseEach(collection, function(value, key, collection2) {
          result2[++index] = iteratee2(value, key, collection2);
        });
        return result2;
      }
      function baseMatches(source) {
        var matchData = getMatchData(source);
        if (matchData.length == 1 && matchData[0][2]) {
          return matchesStrictComparable(matchData[0][0], matchData[0][1]);
        }
        return function(object2) {
          return object2 === source || baseIsMatch(object2, source, matchData);
        };
      }
      function baseMatchesProperty(path, srcValue) {
        if (isKey(path) && isStrictComparable(srcValue)) {
          return matchesStrictComparable(toKey(path), srcValue);
        }
        return function(object2) {
          var objValue = get2(object2, path);
          return objValue === undefined$1 && objValue === srcValue ? hasIn(object2, path) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
        };
      }
      function baseMerge(object2, source, srcIndex, customizer, stack) {
        if (object2 === source) {
          return;
        }
        baseFor(source, function(srcValue, key) {
          stack || (stack = new Stack());
          if (isObject(srcValue)) {
            baseMergeDeep(object2, source, key, srcIndex, baseMerge, customizer, stack);
          } else {
            var newValue = customizer ? customizer(safeGet(object2, key), srcValue, key + "", object2, source, stack) : undefined$1;
            if (newValue === undefined$1) {
              newValue = srcValue;
            }
            assignMergeValue(object2, key, newValue);
          }
        }, keysIn);
      }
      function baseMergeDeep(object2, source, key, srcIndex, mergeFunc, customizer, stack) {
        var objValue = safeGet(object2, key), srcValue = safeGet(source, key), stacked = stack.get(srcValue);
        if (stacked) {
          assignMergeValue(object2, key, stacked);
          return;
        }
        var newValue = customizer ? customizer(objValue, srcValue, key + "", object2, source, stack) : undefined$1;
        var isCommon = newValue === undefined$1;
        if (isCommon) {
          var isArr = isArray(srcValue), isBuff = !isArr && isBuffer(srcValue), isTyped = !isArr && !isBuff && isTypedArray(srcValue);
          newValue = srcValue;
          if (isArr || isBuff || isTyped) {
            if (isArray(objValue)) {
              newValue = objValue;
            } else if (isArrayLikeObject(objValue)) {
              newValue = copyArray(objValue);
            } else if (isBuff) {
              isCommon = false;
              newValue = cloneBuffer(srcValue, true);
            } else if (isTyped) {
              isCommon = false;
              newValue = cloneTypedArray(srcValue, true);
            } else {
              newValue = [];
            }
          } else if (isPlainObject(srcValue) || isArguments(srcValue)) {
            newValue = objValue;
            if (isArguments(objValue)) {
              newValue = toPlainObject(objValue);
            } else if (!isObject(objValue) || isFunction(objValue)) {
              newValue = initCloneObject(srcValue);
            }
          } else {
            isCommon = false;
          }
        }
        if (isCommon) {
          stack.set(srcValue, newValue);
          mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
          stack["delete"](srcValue);
        }
        assignMergeValue(object2, key, newValue);
      }
      function baseNth(array2, n) {
        var length = array2.length;
        if (!length) {
          return;
        }
        n += n < 0 ? length : 0;
        return isIndex(n, length) ? array2[n] : undefined$1;
      }
      function baseOrderBy(collection, iteratees, orders) {
        if (iteratees.length) {
          iteratees = arrayMap(iteratees, function(iteratee2) {
            if (isArray(iteratee2)) {
              return function(value) {
                return baseGet(value, iteratee2.length === 1 ? iteratee2[0] : iteratee2);
              };
            }
            return iteratee2;
          });
        } else {
          iteratees = [identity2];
        }
        var index = -1;
        iteratees = arrayMap(iteratees, baseUnary(getIteratee()));
        var result2 = baseMap(collection, function(value, key, collection2) {
          var criteria = arrayMap(iteratees, function(iteratee2) {
            return iteratee2(value);
          });
          return { "criteria": criteria, "index": ++index, "value": value };
        });
        return baseSortBy(result2, function(object2, other) {
          return compareMultiple(object2, other, orders);
        });
      }
      function basePick(object2, paths) {
        return basePickBy(object2, paths, function(value, path) {
          return hasIn(object2, path);
        });
      }
      function basePickBy(object2, paths, predicate) {
        var index = -1, length = paths.length, result2 = {};
        while (++index < length) {
          var path = paths[index], value = baseGet(object2, path);
          if (predicate(value, path)) {
            baseSet(result2, castPath(path, object2), value);
          }
        }
        return result2;
      }
      function basePropertyDeep(path) {
        return function(object2) {
          return baseGet(object2, path);
        };
      }
      function basePullAll(array2, values2, iteratee2, comparator) {
        var indexOf2 = comparator ? baseIndexOfWith : baseIndexOf, index = -1, length = values2.length, seen = array2;
        if (array2 === values2) {
          values2 = copyArray(values2);
        }
        if (iteratee2) {
          seen = arrayMap(array2, baseUnary(iteratee2));
        }
        while (++index < length) {
          var fromIndex = 0, value = values2[index], computed = iteratee2 ? iteratee2(value) : value;
          while ((fromIndex = indexOf2(seen, computed, fromIndex, comparator)) > -1) {
            if (seen !== array2) {
              splice.call(seen, fromIndex, 1);
            }
            splice.call(array2, fromIndex, 1);
          }
        }
        return array2;
      }
      function basePullAt(array2, indexes) {
        var length = array2 ? indexes.length : 0, lastIndex = length - 1;
        while (length--) {
          var index = indexes[length];
          if (length == lastIndex || index !== previous) {
            var previous = index;
            if (isIndex(index)) {
              splice.call(array2, index, 1);
            } else {
              baseUnset(array2, index);
            }
          }
        }
        return array2;
      }
      function baseRandom(lower2, upper) {
        return lower2 + nativeFloor(nativeRandom() * (upper - lower2 + 1));
      }
      function baseRange(start2, end, step, fromRight) {
        var index = -1, length = nativeMax(nativeCeil((end - start2) / (step || 1)), 0), result2 = Array2(length);
        while (length--) {
          result2[fromRight ? length : ++index] = start2;
          start2 += step;
        }
        return result2;
      }
      function baseRepeat(string, n) {
        var result2 = "";
        if (!string || n < 1 || n > MAX_SAFE_INTEGER) {
          return result2;
        }
        do {
          if (n % 2) {
            result2 += string;
          }
          n = nativeFloor(n / 2);
          if (n) {
            string += string;
          }
        } while (n);
        return result2;
      }
      function baseRest(func, start2) {
        return setToString(overRest(func, start2, identity2), func + "");
      }
      function baseSample(collection) {
        return arraySample(values(collection));
      }
      function baseSampleSize(collection, n) {
        var array2 = values(collection);
        return shuffleSelf(array2, baseClamp(n, 0, array2.length));
      }
      function baseSet(object2, path, value, customizer) {
        if (!isObject(object2)) {
          return object2;
        }
        path = castPath(path, object2);
        var index = -1, length = path.length, lastIndex = length - 1, nested = object2;
        while (nested != null && ++index < length) {
          var key = toKey(path[index]), newValue = value;
          if (key === "__proto__" || key === "constructor" || key === "prototype") {
            return object2;
          }
          if (index != lastIndex) {
            var objValue = nested[key];
            newValue = customizer ? customizer(objValue, key, nested) : undefined$1;
            if (newValue === undefined$1) {
              newValue = isObject(objValue) ? objValue : isIndex(path[index + 1]) ? [] : {};
            }
          }
          assignValue(nested, key, newValue);
          nested = nested[key];
        }
        return object2;
      }
      var baseSetData = !metaMap ? identity2 : function(func, data) {
        metaMap.set(func, data);
        return func;
      };
      var baseSetToString = !defineProperty ? identity2 : function(func, string) {
        return defineProperty(func, "toString", {
          "configurable": true,
          "enumerable": false,
          "value": constant2(string),
          "writable": true
        });
      };
      function baseShuffle(collection) {
        return shuffleSelf(values(collection));
      }
      function baseSlice(array2, start2, end) {
        var index = -1, length = array2.length;
        if (start2 < 0) {
          start2 = -start2 > length ? 0 : length + start2;
        }
        end = end > length ? length : end;
        if (end < 0) {
          end += length;
        }
        length = start2 > end ? 0 : end - start2 >>> 0;
        start2 >>>= 0;
        var result2 = Array2(length);
        while (++index < length) {
          result2[index] = array2[index + start2];
        }
        return result2;
      }
      function baseSome(collection, predicate) {
        var result2;
        baseEach(collection, function(value, index, collection2) {
          result2 = predicate(value, index, collection2);
          return !result2;
        });
        return !!result2;
      }
      function baseSortedIndex(array2, value, retHighest) {
        var low = 0, high = array2 == null ? low : array2.length;
        if (typeof value == "number" && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
          while (low < high) {
            var mid = low + high >>> 1, computed = array2[mid];
            if (computed !== null && !isSymbol(computed) && (retHighest ? computed <= value : computed < value)) {
              low = mid + 1;
            } else {
              high = mid;
            }
          }
          return high;
        }
        return baseSortedIndexBy(array2, value, identity2, retHighest);
      }
      function baseSortedIndexBy(array2, value, iteratee2, retHighest) {
        var low = 0, high = array2 == null ? 0 : array2.length;
        if (high === 0) {
          return 0;
        }
        value = iteratee2(value);
        var valIsNaN = value !== value, valIsNull = value === null, valIsSymbol = isSymbol(value), valIsUndefined = value === undefined$1;
        while (low < high) {
          var mid = nativeFloor((low + high) / 2), computed = iteratee2(array2[mid]), othIsDefined = computed !== undefined$1, othIsNull = computed === null, othIsReflexive = computed === computed, othIsSymbol = isSymbol(computed);
          if (valIsNaN) {
            var setLow = retHighest || othIsReflexive;
          } else if (valIsUndefined) {
            setLow = othIsReflexive && (retHighest || othIsDefined);
          } else if (valIsNull) {
            setLow = othIsReflexive && othIsDefined && (retHighest || !othIsNull);
          } else if (valIsSymbol) {
            setLow = othIsReflexive && othIsDefined && !othIsNull && (retHighest || !othIsSymbol);
          } else if (othIsNull || othIsSymbol) {
            setLow = false;
          } else {
            setLow = retHighest ? computed <= value : computed < value;
          }
          if (setLow) {
            low = mid + 1;
          } else {
            high = mid;
          }
        }
        return nativeMin(high, MAX_ARRAY_INDEX);
      }
      function baseSortedUniq(array2, iteratee2) {
        var index = -1, length = array2.length, resIndex = 0, result2 = [];
        while (++index < length) {
          var value = array2[index], computed = iteratee2 ? iteratee2(value) : value;
          if (!index || !eq(computed, seen)) {
            var seen = computed;
            result2[resIndex++] = value === 0 ? 0 : value;
          }
        }
        return result2;
      }
      function baseToNumber(value) {
        if (typeof value == "number") {
          return value;
        }
        if (isSymbol(value)) {
          return NAN;
        }
        return +value;
      }
      function baseToString(value) {
        if (typeof value == "string") {
          return value;
        }
        if (isArray(value)) {
          return arrayMap(value, baseToString) + "";
        }
        if (isSymbol(value)) {
          return symbolToString ? symbolToString.call(value) : "";
        }
        var result2 = value + "";
        return result2 == "0" && 1 / value == -INFINITY ? "-0" : result2;
      }
      function baseUniq(array2, iteratee2, comparator) {
        var index = -1, includes2 = arrayIncludes, length = array2.length, isCommon = true, result2 = [], seen = result2;
        if (comparator) {
          isCommon = false;
          includes2 = arrayIncludesWith;
        } else if (length >= LARGE_ARRAY_SIZE) {
          var set3 = iteratee2 ? null : createSet(array2);
          if (set3) {
            return setToArray(set3);
          }
          isCommon = false;
          includes2 = cacheHas;
          seen = new SetCache();
        } else {
          seen = iteratee2 ? [] : result2;
        }
        outer:
          while (++index < length) {
            var value = array2[index], computed = iteratee2 ? iteratee2(value) : value;
            value = comparator || value !== 0 ? value : 0;
            if (isCommon && computed === computed) {
              var seenIndex = seen.length;
              while (seenIndex--) {
                if (seen[seenIndex] === computed) {
                  continue outer;
                }
              }
              if (iteratee2) {
                seen.push(computed);
              }
              result2.push(value);
            } else if (!includes2(seen, computed, comparator)) {
              if (seen !== result2) {
                seen.push(computed);
              }
              result2.push(value);
            }
          }
        return result2;
      }
      function baseUnset(object2, path) {
        path = castPath(path, object2);
        object2 = parent(object2, path);
        return object2 == null || delete object2[toKey(last(path))];
      }
      function baseUpdate(object2, path, updater, customizer) {
        return baseSet(object2, path, updater(baseGet(object2, path)), customizer);
      }
      function baseWhile(array2, predicate, isDrop, fromRight) {
        var length = array2.length, index = fromRight ? length : -1;
        while ((fromRight ? index-- : ++index < length) && predicate(array2[index], index, array2)) {
        }
        return isDrop ? baseSlice(array2, fromRight ? 0 : index, fromRight ? index + 1 : length) : baseSlice(array2, fromRight ? index + 1 : 0, fromRight ? length : index);
      }
      function baseWrapperValue(value, actions) {
        var result2 = value;
        if (result2 instanceof LazyWrapper) {
          result2 = result2.value();
        }
        return arrayReduce(actions, function(result3, action) {
          return action.func.apply(action.thisArg, arrayPush([result3], action.args));
        }, result2);
      }
      function baseXor(arrays, iteratee2, comparator) {
        var length = arrays.length;
        if (length < 2) {
          return length ? baseUniq(arrays[0]) : [];
        }
        var index = -1, result2 = Array2(length);
        while (++index < length) {
          var array2 = arrays[index], othIndex = -1;
          while (++othIndex < length) {
            if (othIndex != index) {
              result2[index] = baseDifference(result2[index] || array2, arrays[othIndex], iteratee2, comparator);
            }
          }
        }
        return baseUniq(baseFlatten(result2, 1), iteratee2, comparator);
      }
      function baseZipObject(props, values2, assignFunc) {
        var index = -1, length = props.length, valsLength = values2.length, result2 = {};
        while (++index < length) {
          var value = index < valsLength ? values2[index] : undefined$1;
          assignFunc(result2, props[index], value);
        }
        return result2;
      }
      function castArrayLikeObject(value) {
        return isArrayLikeObject(value) ? value : [];
      }
      function castFunction(value) {
        return typeof value == "function" ? value : identity2;
      }
      function castPath(value, object2) {
        if (isArray(value)) {
          return value;
        }
        return isKey(value, object2) ? [value] : stringToPath(toString(value));
      }
      var castRest = baseRest;
      function castSlice(array2, start2, end) {
        var length = array2.length;
        end = end === undefined$1 ? length : end;
        return !start2 && end >= length ? array2 : baseSlice(array2, start2, end);
      }
      var clearTimeout2 = ctxClearTimeout || function(id2) {
        return root2.clearTimeout(id2);
      };
      function cloneBuffer(buffer, isDeep) {
        if (isDeep) {
          return buffer.slice();
        }
        var length = buffer.length, result2 = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
        buffer.copy(result2);
        return result2;
      }
      function cloneArrayBuffer(arrayBuffer) {
        var result2 = new arrayBuffer.constructor(arrayBuffer.byteLength);
        new Uint8Array2(result2).set(new Uint8Array2(arrayBuffer));
        return result2;
      }
      function cloneDataView(dataView, isDeep) {
        var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
        return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
      }
      function cloneRegExp(regexp) {
        var result2 = new regexp.constructor(regexp.source, reFlags.exec(regexp));
        result2.lastIndex = regexp.lastIndex;
        return result2;
      }
      function cloneSymbol(symbol) {
        return symbolValueOf ? Object2(symbolValueOf.call(symbol)) : {};
      }
      function cloneTypedArray(typedArray, isDeep) {
        var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
        return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
      }
      function compareAscending(value, other) {
        if (value !== other) {
          var valIsDefined = value !== undefined$1, valIsNull = value === null, valIsReflexive = value === value, valIsSymbol = isSymbol(value);
          var othIsDefined = other !== undefined$1, othIsNull = other === null, othIsReflexive = other === other, othIsSymbol = isSymbol(other);
          if (!othIsNull && !othIsSymbol && !valIsSymbol && value > other || valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol || valIsNull && othIsDefined && othIsReflexive || !valIsDefined && othIsReflexive || !valIsReflexive) {
            return 1;
          }
          if (!valIsNull && !valIsSymbol && !othIsSymbol && value < other || othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol || othIsNull && valIsDefined && valIsReflexive || !othIsDefined && valIsReflexive || !othIsReflexive) {
            return -1;
          }
        }
        return 0;
      }
      function compareMultiple(object2, other, orders) {
        var index = -1, objCriteria = object2.criteria, othCriteria = other.criteria, length = objCriteria.length, ordersLength = orders.length;
        while (++index < length) {
          var result2 = compareAscending(objCriteria[index], othCriteria[index]);
          if (result2) {
            if (index >= ordersLength) {
              return result2;
            }
            var order = orders[index];
            return result2 * (order == "desc" ? -1 : 1);
          }
        }
        return object2.index - other.index;
      }
      function composeArgs(args, partials, holders, isCurried) {
        var argsIndex = -1, argsLength = args.length, holdersLength = holders.length, leftIndex = -1, leftLength = partials.length, rangeLength = nativeMax(argsLength - holdersLength, 0), result2 = Array2(leftLength + rangeLength), isUncurried = !isCurried;
        while (++leftIndex < leftLength) {
          result2[leftIndex] = partials[leftIndex];
        }
        while (++argsIndex < holdersLength) {
          if (isUncurried || argsIndex < argsLength) {
            result2[holders[argsIndex]] = args[argsIndex];
          }
        }
        while (rangeLength--) {
          result2[leftIndex++] = args[argsIndex++];
        }
        return result2;
      }
      function composeArgsRight(args, partials, holders, isCurried) {
        var argsIndex = -1, argsLength = args.length, holdersIndex = -1, holdersLength = holders.length, rightIndex = -1, rightLength = partials.length, rangeLength = nativeMax(argsLength - holdersLength, 0), result2 = Array2(rangeLength + rightLength), isUncurried = !isCurried;
        while (++argsIndex < rangeLength) {
          result2[argsIndex] = args[argsIndex];
        }
        var offset = argsIndex;
        while (++rightIndex < rightLength) {
          result2[offset + rightIndex] = partials[rightIndex];
        }
        while (++holdersIndex < holdersLength) {
          if (isUncurried || argsIndex < argsLength) {
            result2[offset + holders[holdersIndex]] = args[argsIndex++];
          }
        }
        return result2;
      }
      function copyArray(source, array2) {
        var index = -1, length = source.length;
        array2 || (array2 = Array2(length));
        while (++index < length) {
          array2[index] = source[index];
        }
        return array2;
      }
      function copyObject(source, props, object2, customizer) {
        var isNew = !object2;
        object2 || (object2 = {});
        var index = -1, length = props.length;
        while (++index < length) {
          var key = props[index];
          var newValue = customizer ? customizer(object2[key], source[key], key, object2, source) : undefined$1;
          if (newValue === undefined$1) {
            newValue = source[key];
          }
          if (isNew) {
            baseAssignValue(object2, key, newValue);
          } else {
            assignValue(object2, key, newValue);
          }
        }
        return object2;
      }
      function copySymbols(source, object2) {
        return copyObject(source, getSymbols(source), object2);
      }
      function copySymbolsIn(source, object2) {
        return copyObject(source, getSymbolsIn(source), object2);
      }
      function createAggregator(setter, initializer) {
        return function(collection, iteratee2) {
          var func = isArray(collection) ? arrayAggregator : baseAggregator, accumulator = initializer ? initializer() : {};
          return func(collection, setter, getIteratee(iteratee2, 2), accumulator);
        };
      }
      function createAssigner(assigner) {
        return baseRest(function(object2, sources) {
          var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : undefined$1, guard = length > 2 ? sources[2] : undefined$1;
          customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, customizer) : undefined$1;
          if (guard && isIterateeCall(sources[0], sources[1], guard)) {
            customizer = length < 3 ? undefined$1 : customizer;
            length = 1;
          }
          object2 = Object2(object2);
          while (++index < length) {
            var source = sources[index];
            if (source) {
              assigner(object2, source, index, customizer);
            }
          }
          return object2;
        });
      }
      function createBaseEach(eachFunc, fromRight) {
        return function(collection, iteratee2) {
          if (collection == null) {
            return collection;
          }
          if (!isArrayLike(collection)) {
            return eachFunc(collection, iteratee2);
          }
          var length = collection.length, index = fromRight ? length : -1, iterable = Object2(collection);
          while (fromRight ? index-- : ++index < length) {
            if (iteratee2(iterable[index], index, iterable) === false) {
              break;
            }
          }
          return collection;
        };
      }
      function createBaseFor(fromRight) {
        return function(object2, iteratee2, keysFunc) {
          var index = -1, iterable = Object2(object2), props = keysFunc(object2), length = props.length;
          while (length--) {
            var key = props[fromRight ? length : ++index];
            if (iteratee2(iterable[key], key, iterable) === false) {
              break;
            }
          }
          return object2;
        };
      }
      function createBind(func, bitmask, thisArg) {
        var isBind = bitmask & WRAP_BIND_FLAG, Ctor = createCtor(func);
        function wrapper() {
          var fn = this && this !== root2 && this instanceof wrapper ? Ctor : func;
          return fn.apply(isBind ? thisArg : this, arguments);
        }
        return wrapper;
      }
      function createCaseFirst(methodName) {
        return function(string) {
          string = toString(string);
          var strSymbols = hasUnicode(string) ? stringToArray(string) : undefined$1;
          var chr = strSymbols ? strSymbols[0] : string.charAt(0);
          var trailing = strSymbols ? castSlice(strSymbols, 1).join("") : string.slice(1);
          return chr[methodName]() + trailing;
        };
      }
      function createCompounder(callback) {
        return function(string) {
          return arrayReduce(words(deburr(string).replace(reApos, "")), callback, "");
        };
      }
      function createCtor(Ctor) {
        return function() {
          var args = arguments;
          switch (args.length) {
            case 0:
              return new Ctor();
            case 1:
              return new Ctor(args[0]);
            case 2:
              return new Ctor(args[0], args[1]);
            case 3:
              return new Ctor(args[0], args[1], args[2]);
            case 4:
              return new Ctor(args[0], args[1], args[2], args[3]);
            case 5:
              return new Ctor(args[0], args[1], args[2], args[3], args[4]);
            case 6:
              return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
            case 7:
              return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
          }
          var thisBinding = baseCreate(Ctor.prototype), result2 = Ctor.apply(thisBinding, args);
          return isObject(result2) ? result2 : thisBinding;
        };
      }
      function createCurry(func, bitmask, arity) {
        var Ctor = createCtor(func);
        function wrapper() {
          var length = arguments.length, args = Array2(length), index = length, placeholder = getHolder(wrapper);
          while (index--) {
            args[index] = arguments[index];
          }
          var holders = length < 3 && args[0] !== placeholder && args[length - 1] !== placeholder ? [] : replaceHolders(args, placeholder);
          length -= holders.length;
          if (length < arity) {
            return createRecurry(
              func,
              bitmask,
              createHybrid,
              wrapper.placeholder,
              undefined$1,
              args,
              holders,
              undefined$1,
              undefined$1,
              arity - length
            );
          }
          var fn = this && this !== root2 && this instanceof wrapper ? Ctor : func;
          return apply(fn, this, args);
        }
        return wrapper;
      }
      function createFind(findIndexFunc) {
        return function(collection, predicate, fromIndex) {
          var iterable = Object2(collection);
          if (!isArrayLike(collection)) {
            var iteratee2 = getIteratee(predicate, 3);
            collection = keys(collection);
            predicate = function(key) {
              return iteratee2(iterable[key], key, iterable);
            };
          }
          var index = findIndexFunc(collection, predicate, fromIndex);
          return index > -1 ? iterable[iteratee2 ? collection[index] : index] : undefined$1;
        };
      }
      function createFlow(fromRight) {
        return flatRest(function(funcs) {
          var length = funcs.length, index = length, prereq = LodashWrapper.prototype.thru;
          if (fromRight) {
            funcs.reverse();
          }
          while (index--) {
            var func = funcs[index];
            if (typeof func != "function") {
              throw new TypeError2(FUNC_ERROR_TEXT);
            }
            if (prereq && !wrapper && getFuncName(func) == "wrapper") {
              var wrapper = new LodashWrapper([], true);
            }
          }
          index = wrapper ? index : length;
          while (++index < length) {
            func = funcs[index];
            var funcName = getFuncName(func), data = funcName == "wrapper" ? getData(func) : undefined$1;
            if (data && isLaziable(data[0]) && data[1] == (WRAP_ARY_FLAG | WRAP_CURRY_FLAG | WRAP_PARTIAL_FLAG | WRAP_REARG_FLAG) && !data[4].length && data[9] == 1) {
              wrapper = wrapper[getFuncName(data[0])].apply(wrapper, data[3]);
            } else {
              wrapper = func.length == 1 && isLaziable(func) ? wrapper[funcName]() : wrapper.thru(func);
            }
          }
          return function() {
            var args = arguments, value = args[0];
            if (wrapper && args.length == 1 && isArray(value)) {
              return wrapper.plant(value).value();
            }
            var index2 = 0, result2 = length ? funcs[index2].apply(this, args) : value;
            while (++index2 < length) {
              result2 = funcs[index2].call(this, result2);
            }
            return result2;
          };
        });
      }
      function createHybrid(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary2, arity) {
        var isAry = bitmask & WRAP_ARY_FLAG, isBind = bitmask & WRAP_BIND_FLAG, isBindKey = bitmask & WRAP_BIND_KEY_FLAG, isCurried = bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG), isFlip = bitmask & WRAP_FLIP_FLAG, Ctor = isBindKey ? undefined$1 : createCtor(func);
        function wrapper() {
          var length = arguments.length, args = Array2(length), index = length;
          while (index--) {
            args[index] = arguments[index];
          }
          if (isCurried) {
            var placeholder = getHolder(wrapper), holdersCount = countHolders(args, placeholder);
          }
          if (partials) {
            args = composeArgs(args, partials, holders, isCurried);
          }
          if (partialsRight) {
            args = composeArgsRight(args, partialsRight, holdersRight, isCurried);
          }
          length -= holdersCount;
          if (isCurried && length < arity) {
            var newHolders = replaceHolders(args, placeholder);
            return createRecurry(
              func,
              bitmask,
              createHybrid,
              wrapper.placeholder,
              thisArg,
              args,
              newHolders,
              argPos,
              ary2,
              arity - length
            );
          }
          var thisBinding = isBind ? thisArg : this, fn = isBindKey ? thisBinding[func] : func;
          length = args.length;
          if (argPos) {
            args = reorder(args, argPos);
          } else if (isFlip && length > 1) {
            args.reverse();
          }
          if (isAry && ary2 < length) {
            args.length = ary2;
          }
          if (this && this !== root2 && this instanceof wrapper) {
            fn = Ctor || createCtor(fn);
          }
          return fn.apply(thisBinding, args);
        }
        return wrapper;
      }
      function createInverter(setter, toIteratee) {
        return function(object2, iteratee2) {
          return baseInverter(object2, setter, toIteratee(iteratee2), {});
        };
      }
      function createMathOperation(operator, defaultValue) {
        return function(value, other) {
          var result2;
          if (value === undefined$1 && other === undefined$1) {
            return defaultValue;
          }
          if (value !== undefined$1) {
            result2 = value;
          }
          if (other !== undefined$1) {
            if (result2 === undefined$1) {
              return other;
            }
            if (typeof value == "string" || typeof other == "string") {
              value = baseToString(value);
              other = baseToString(other);
            } else {
              value = baseToNumber(value);
              other = baseToNumber(other);
            }
            result2 = operator(value, other);
          }
          return result2;
        };
      }
      function createOver(arrayFunc) {
        return flatRest(function(iteratees) {
          iteratees = arrayMap(iteratees, baseUnary(getIteratee()));
          return baseRest(function(args) {
            var thisArg = this;
            return arrayFunc(iteratees, function(iteratee2) {
              return apply(iteratee2, thisArg, args);
            });
          });
        });
      }
      function createPadding(length, chars) {
        chars = chars === undefined$1 ? " " : baseToString(chars);
        var charsLength = chars.length;
        if (charsLength < 2) {
          return charsLength ? baseRepeat(chars, length) : chars;
        }
        var result2 = baseRepeat(chars, nativeCeil(length / stringSize(chars)));
        return hasUnicode(chars) ? castSlice(stringToArray(result2), 0, length).join("") : result2.slice(0, length);
      }
      function createPartial(func, bitmask, thisArg, partials) {
        var isBind = bitmask & WRAP_BIND_FLAG, Ctor = createCtor(func);
        function wrapper() {
          var argsIndex = -1, argsLength = arguments.length, leftIndex = -1, leftLength = partials.length, args = Array2(leftLength + argsLength), fn = this && this !== root2 && this instanceof wrapper ? Ctor : func;
          while (++leftIndex < leftLength) {
            args[leftIndex] = partials[leftIndex];
          }
          while (argsLength--) {
            args[leftIndex++] = arguments[++argsIndex];
          }
          return apply(fn, isBind ? thisArg : this, args);
        }
        return wrapper;
      }
      function createRange(fromRight) {
        return function(start2, end, step) {
          if (step && typeof step != "number" && isIterateeCall(start2, end, step)) {
            end = step = undefined$1;
          }
          start2 = toFinite(start2);
          if (end === undefined$1) {
            end = start2;
            start2 = 0;
          } else {
            end = toFinite(end);
          }
          step = step === undefined$1 ? start2 < end ? 1 : -1 : toFinite(step);
          return baseRange(start2, end, step, fromRight);
        };
      }
      function createRelationalOperation(operator) {
        return function(value, other) {
          if (!(typeof value == "string" && typeof other == "string")) {
            value = toNumber(value);
            other = toNumber(other);
          }
          return operator(value, other);
        };
      }
      function createRecurry(func, bitmask, wrapFunc, placeholder, thisArg, partials, holders, argPos, ary2, arity) {
        var isCurry = bitmask & WRAP_CURRY_FLAG, newHolders = isCurry ? holders : undefined$1, newHoldersRight = isCurry ? undefined$1 : holders, newPartials = isCurry ? partials : undefined$1, newPartialsRight = isCurry ? undefined$1 : partials;
        bitmask |= isCurry ? WRAP_PARTIAL_FLAG : WRAP_PARTIAL_RIGHT_FLAG;
        bitmask &= ~(isCurry ? WRAP_PARTIAL_RIGHT_FLAG : WRAP_PARTIAL_FLAG);
        if (!(bitmask & WRAP_CURRY_BOUND_FLAG)) {
          bitmask &= ~(WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG);
        }
        var newData = [
          func,
          bitmask,
          thisArg,
          newPartials,
          newHolders,
          newPartialsRight,
          newHoldersRight,
          argPos,
          ary2,
          arity
        ];
        var result2 = wrapFunc.apply(undefined$1, newData);
        if (isLaziable(func)) {
          setData(result2, newData);
        }
        result2.placeholder = placeholder;
        return setWrapToString(result2, func, bitmask);
      }
      function createRound(methodName) {
        var func = Math2[methodName];
        return function(number2, precision) {
          number2 = toNumber(number2);
          precision = precision == null ? 0 : nativeMin(toInteger(precision), 292);
          if (precision && nativeIsFinite(number2)) {
            var pair = (toString(number2) + "e").split("e"), value = func(pair[0] + "e" + (+pair[1] + precision));
            pair = (toString(value) + "e").split("e");
            return +(pair[0] + "e" + (+pair[1] - precision));
          }
          return func(number2);
        };
      }
      var createSet = !(Set4 && 1 / setToArray(new Set4([, -0]))[1] == INFINITY) ? noop2 : function(values2) {
        return new Set4(values2);
      };
      function createToPairs(keysFunc) {
        return function(object2) {
          var tag = getTag(object2);
          if (tag == mapTag) {
            return mapToArray(object2);
          }
          if (tag == setTag) {
            return setToPairs(object2);
          }
          return baseToPairs(object2, keysFunc(object2));
        };
      }
      function createWrap(func, bitmask, thisArg, partials, holders, argPos, ary2, arity) {
        var isBindKey = bitmask & WRAP_BIND_KEY_FLAG;
        if (!isBindKey && typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        var length = partials ? partials.length : 0;
        if (!length) {
          bitmask &= ~(WRAP_PARTIAL_FLAG | WRAP_PARTIAL_RIGHT_FLAG);
          partials = holders = undefined$1;
        }
        ary2 = ary2 === undefined$1 ? ary2 : nativeMax(toInteger(ary2), 0);
        arity = arity === undefined$1 ? arity : toInteger(arity);
        length -= holders ? holders.length : 0;
        if (bitmask & WRAP_PARTIAL_RIGHT_FLAG) {
          var partialsRight = partials, holdersRight = holders;
          partials = holders = undefined$1;
        }
        var data = isBindKey ? undefined$1 : getData(func);
        var newData = [
          func,
          bitmask,
          thisArg,
          partials,
          holders,
          partialsRight,
          holdersRight,
          argPos,
          ary2,
          arity
        ];
        if (data) {
          mergeData(newData, data);
        }
        func = newData[0];
        bitmask = newData[1];
        thisArg = newData[2];
        partials = newData[3];
        holders = newData[4];
        arity = newData[9] = newData[9] === undefined$1 ? isBindKey ? 0 : func.length : nativeMax(newData[9] - length, 0);
        if (!arity && bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG)) {
          bitmask &= ~(WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG);
        }
        if (!bitmask || bitmask == WRAP_BIND_FLAG) {
          var result2 = createBind(func, bitmask, thisArg);
        } else if (bitmask == WRAP_CURRY_FLAG || bitmask == WRAP_CURRY_RIGHT_FLAG) {
          result2 = createCurry(func, bitmask, arity);
        } else if ((bitmask == WRAP_PARTIAL_FLAG || bitmask == (WRAP_BIND_FLAG | WRAP_PARTIAL_FLAG)) && !holders.length) {
          result2 = createPartial(func, bitmask, thisArg, partials);
        } else {
          result2 = createHybrid.apply(undefined$1, newData);
        }
        var setter = data ? baseSetData : setData;
        return setWrapToString(setter(result2, newData), func, bitmask);
      }
      function customDefaultsAssignIn(objValue, srcValue, key, object2) {
        if (objValue === undefined$1 || eq(objValue, objectProto[key]) && !hasOwnProperty.call(object2, key)) {
          return srcValue;
        }
        return objValue;
      }
      function customDefaultsMerge(objValue, srcValue, key, object2, source, stack) {
        if (isObject(objValue) && isObject(srcValue)) {
          stack.set(srcValue, objValue);
          baseMerge(objValue, srcValue, undefined$1, customDefaultsMerge, stack);
          stack["delete"](srcValue);
        }
        return objValue;
      }
      function customOmitClone(value) {
        return isPlainObject(value) ? undefined$1 : value;
      }
      function equalArrays(array2, other, bitmask, customizer, equalFunc, stack) {
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array2.length, othLength = other.length;
        if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
          return false;
        }
        var arrStacked = stack.get(array2);
        var othStacked = stack.get(other);
        if (arrStacked && othStacked) {
          return arrStacked == other && othStacked == array2;
        }
        var index = -1, result2 = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : undefined$1;
        stack.set(array2, other);
        stack.set(other, array2);
        while (++index < arrLength) {
          var arrValue = array2[index], othValue = other[index];
          if (customizer) {
            var compared = isPartial ? customizer(othValue, arrValue, index, other, array2, stack) : customizer(arrValue, othValue, index, array2, other, stack);
          }
          if (compared !== undefined$1) {
            if (compared) {
              continue;
            }
            result2 = false;
            break;
          }
          if (seen) {
            if (!arraySome(other, function(othValue2, othIndex) {
              if (!cacheHas(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
                return seen.push(othIndex);
              }
            })) {
              result2 = false;
              break;
            }
          } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
            result2 = false;
            break;
          }
        }
        stack["delete"](array2);
        stack["delete"](other);
        return result2;
      }
      function equalByTag(object2, other, tag, bitmask, customizer, equalFunc, stack) {
        switch (tag) {
          case dataViewTag:
            if (object2.byteLength != other.byteLength || object2.byteOffset != other.byteOffset) {
              return false;
            }
            object2 = object2.buffer;
            other = other.buffer;
          case arrayBufferTag:
            if (object2.byteLength != other.byteLength || !equalFunc(new Uint8Array2(object2), new Uint8Array2(other))) {
              return false;
            }
            return true;
          case boolTag:
          case dateTag:
          case numberTag:
            return eq(+object2, +other);
          case errorTag:
            return object2.name == other.name && object2.message == other.message;
          case regexpTag:
          case stringTag:
            return object2 == other + "";
          case mapTag:
            var convert = mapToArray;
          case setTag:
            var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
            convert || (convert = setToArray);
            if (object2.size != other.size && !isPartial) {
              return false;
            }
            var stacked = stack.get(object2);
            if (stacked) {
              return stacked == other;
            }
            bitmask |= COMPARE_UNORDERED_FLAG;
            stack.set(object2, other);
            var result2 = equalArrays(convert(object2), convert(other), bitmask, customizer, equalFunc, stack);
            stack["delete"](object2);
            return result2;
          case symbolTag:
            if (symbolValueOf) {
              return symbolValueOf.call(object2) == symbolValueOf.call(other);
            }
        }
        return false;
      }
      function equalObjects(object2, other, bitmask, customizer, equalFunc, stack) {
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG, objProps = getAllKeys(object2), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
        if (objLength != othLength && !isPartial) {
          return false;
        }
        var index = objLength;
        while (index--) {
          var key = objProps[index];
          if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
            return false;
          }
        }
        var objStacked = stack.get(object2);
        var othStacked = stack.get(other);
        if (objStacked && othStacked) {
          return objStacked == other && othStacked == object2;
        }
        var result2 = true;
        stack.set(object2, other);
        stack.set(other, object2);
        var skipCtor = isPartial;
        while (++index < objLength) {
          key = objProps[index];
          var objValue = object2[key], othValue = other[key];
          if (customizer) {
            var compared = isPartial ? customizer(othValue, objValue, key, other, object2, stack) : customizer(objValue, othValue, key, object2, other, stack);
          }
          if (!(compared === undefined$1 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
            result2 = false;
            break;
          }
          skipCtor || (skipCtor = key == "constructor");
        }
        if (result2 && !skipCtor) {
          var objCtor = object2.constructor, othCtor = other.constructor;
          if (objCtor != othCtor && ("constructor" in object2 && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
            result2 = false;
          }
        }
        stack["delete"](object2);
        stack["delete"](other);
        return result2;
      }
      function flatRest(func) {
        return setToString(overRest(func, undefined$1, flatten2), func + "");
      }
      function getAllKeys(object2) {
        return baseGetAllKeys(object2, keys, getSymbols);
      }
      function getAllKeysIn(object2) {
        return baseGetAllKeys(object2, keysIn, getSymbolsIn);
      }
      var getData = !metaMap ? noop2 : function(func) {
        return metaMap.get(func);
      };
      function getFuncName(func) {
        var result2 = func.name + "", array2 = realNames[result2], length = hasOwnProperty.call(realNames, result2) ? array2.length : 0;
        while (length--) {
          var data = array2[length], otherFunc = data.func;
          if (otherFunc == null || otherFunc == func) {
            return data.name;
          }
        }
        return result2;
      }
      function getHolder(func) {
        var object2 = hasOwnProperty.call(lodash2, "placeholder") ? lodash2 : func;
        return object2.placeholder;
      }
      function getIteratee() {
        var result2 = lodash2.iteratee || iteratee;
        result2 = result2 === iteratee ? baseIteratee : result2;
        return arguments.length ? result2(arguments[0], arguments[1]) : result2;
      }
      function getMapData(map3, key) {
        var data = map3.__data__;
        return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
      }
      function getMatchData(object2) {
        var result2 = keys(object2), length = result2.length;
        while (length--) {
          var key = result2[length], value = object2[key];
          result2[length] = [key, value, isStrictComparable(value)];
        }
        return result2;
      }
      function getNative(object2, key) {
        var value = getValue(object2, key);
        return baseIsNative(value) ? value : undefined$1;
      }
      function getRawTag(value) {
        var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
        try {
          value[symToStringTag] = undefined$1;
          var unmasked = true;
        } catch (e) {
        }
        var result2 = nativeObjectToString.call(value);
        if (unmasked) {
          if (isOwn) {
            value[symToStringTag] = tag;
          } else {
            delete value[symToStringTag];
          }
        }
        return result2;
      }
      var getSymbols = !nativeGetSymbols ? stubArray : function(object2) {
        if (object2 == null) {
          return [];
        }
        object2 = Object2(object2);
        return arrayFilter(nativeGetSymbols(object2), function(symbol) {
          return propertyIsEnumerable.call(object2, symbol);
        });
      };
      var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object2) {
        var result2 = [];
        while (object2) {
          arrayPush(result2, getSymbols(object2));
          object2 = getPrototype(object2);
        }
        return result2;
      };
      var getTag = baseGetTag;
      if (DataView2 && getTag(new DataView2(new ArrayBuffer(1))) != dataViewTag || Map2 && getTag(new Map2()) != mapTag || Promise2 && getTag(Promise2.resolve()) != promiseTag || Set4 && getTag(new Set4()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) {
        getTag = function(value) {
          var result2 = baseGetTag(value), Ctor = result2 == objectTag ? value.constructor : undefined$1, ctorString = Ctor ? toSource(Ctor) : "";
          if (ctorString) {
            switch (ctorString) {
              case dataViewCtorString:
                return dataViewTag;
              case mapCtorString:
                return mapTag;
              case promiseCtorString:
                return promiseTag;
              case setCtorString:
                return setTag;
              case weakMapCtorString:
                return weakMapTag;
            }
          }
          return result2;
        };
      }
      function getView(start2, end, transforms) {
        var index = -1, length = transforms.length;
        while (++index < length) {
          var data = transforms[index], size2 = data.size;
          switch (data.type) {
            case "drop":
              start2 += size2;
              break;
            case "dropRight":
              end -= size2;
              break;
            case "take":
              end = nativeMin(end, start2 + size2);
              break;
            case "takeRight":
              start2 = nativeMax(start2, end - size2);
              break;
          }
        }
        return { "start": start2, "end": end };
      }
      function getWrapDetails(source) {
        var match = source.match(reWrapDetails);
        return match ? match[1].split(reSplitDetails) : [];
      }
      function hasPath(object2, path, hasFunc) {
        path = castPath(path, object2);
        var index = -1, length = path.length, result2 = false;
        while (++index < length) {
          var key = toKey(path[index]);
          if (!(result2 = object2 != null && hasFunc(object2, key))) {
            break;
          }
          object2 = object2[key];
        }
        if (result2 || ++index != length) {
          return result2;
        }
        length = object2 == null ? 0 : object2.length;
        return !!length && isLength(length) && isIndex(key, length) && (isArray(object2) || isArguments(object2));
      }
      function initCloneArray(array2) {
        var length = array2.length, result2 = new array2.constructor(length);
        if (length && typeof array2[0] == "string" && hasOwnProperty.call(array2, "index")) {
          result2.index = array2.index;
          result2.input = array2.input;
        }
        return result2;
      }
      function initCloneObject(object2) {
        return typeof object2.constructor == "function" && !isPrototype(object2) ? baseCreate(getPrototype(object2)) : {};
      }
      function initCloneByTag(object2, tag, isDeep) {
        var Ctor = object2.constructor;
        switch (tag) {
          case arrayBufferTag:
            return cloneArrayBuffer(object2);
          case boolTag:
          case dateTag:
            return new Ctor(+object2);
          case dataViewTag:
            return cloneDataView(object2, isDeep);
          case float32Tag:
          case float64Tag:
          case int8Tag:
          case int16Tag:
          case int32Tag:
          case uint8Tag:
          case uint8ClampedTag:
          case uint16Tag:
          case uint32Tag:
            return cloneTypedArray(object2, isDeep);
          case mapTag:
            return new Ctor();
          case numberTag:
          case stringTag:
            return new Ctor(object2);
          case regexpTag:
            return cloneRegExp(object2);
          case setTag:
            return new Ctor();
          case symbolTag:
            return cloneSymbol(object2);
        }
      }
      function insertWrapDetails(source, details) {
        var length = details.length;
        if (!length) {
          return source;
        }
        var lastIndex = length - 1;
        details[lastIndex] = (length > 1 ? "& " : "") + details[lastIndex];
        details = details.join(length > 2 ? ", " : " ");
        return source.replace(reWrapComment, "{\n/* [wrapped with " + details + "] */\n");
      }
      function isFlattenable(value) {
        return isArray(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
      }
      function isIndex(value, length) {
        var type = typeof value;
        length = length == null ? MAX_SAFE_INTEGER : length;
        return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
      }
      function isIterateeCall(value, index, object2) {
        if (!isObject(object2)) {
          return false;
        }
        var type = typeof index;
        if (type == "number" ? isArrayLike(object2) && isIndex(index, object2.length) : type == "string" && index in object2) {
          return eq(object2[index], value);
        }
        return false;
      }
      function isKey(value, object2) {
        if (isArray(value)) {
          return false;
        }
        var type = typeof value;
        if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
          return true;
        }
        return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object2 != null && value in Object2(object2);
      }
      function isKeyable(value) {
        var type = typeof value;
        return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
      }
      function isLaziable(func) {
        var funcName = getFuncName(func), other = lodash2[funcName];
        if (typeof other != "function" || !(funcName in LazyWrapper.prototype)) {
          return false;
        }
        if (func === other) {
          return true;
        }
        var data = getData(other);
        return !!data && func === data[0];
      }
      function isMasked(func) {
        return !!maskSrcKey && maskSrcKey in func;
      }
      var isMaskable = coreJsData ? isFunction : stubFalse;
      function isPrototype(value) {
        var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
        return value === proto;
      }
      function isStrictComparable(value) {
        return value === value && !isObject(value);
      }
      function matchesStrictComparable(key, srcValue) {
        return function(object2) {
          if (object2 == null) {
            return false;
          }
          return object2[key] === srcValue && (srcValue !== undefined$1 || key in Object2(object2));
        };
      }
      function memoizeCapped(func) {
        var result2 = memoize(func, function(key) {
          if (cache.size === MAX_MEMOIZE_SIZE) {
            cache.clear();
          }
          return key;
        });
        var cache = result2.cache;
        return result2;
      }
      function mergeData(data, source) {
        var bitmask = data[1], srcBitmask = source[1], newBitmask = bitmask | srcBitmask, isCommon = newBitmask < (WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG | WRAP_ARY_FLAG);
        var isCombo = srcBitmask == WRAP_ARY_FLAG && bitmask == WRAP_CURRY_FLAG || srcBitmask == WRAP_ARY_FLAG && bitmask == WRAP_REARG_FLAG && data[7].length <= source[8] || srcBitmask == (WRAP_ARY_FLAG | WRAP_REARG_FLAG) && source[7].length <= source[8] && bitmask == WRAP_CURRY_FLAG;
        if (!(isCommon || isCombo)) {
          return data;
        }
        if (srcBitmask & WRAP_BIND_FLAG) {
          data[2] = source[2];
          newBitmask |= bitmask & WRAP_BIND_FLAG ? 0 : WRAP_CURRY_BOUND_FLAG;
        }
        var value = source[3];
        if (value) {
          var partials = data[3];
          data[3] = partials ? composeArgs(partials, value, source[4]) : value;
          data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : source[4];
        }
        value = source[5];
        if (value) {
          partials = data[5];
          data[5] = partials ? composeArgsRight(partials, value, source[6]) : value;
          data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : source[6];
        }
        value = source[7];
        if (value) {
          data[7] = value;
        }
        if (srcBitmask & WRAP_ARY_FLAG) {
          data[8] = data[8] == null ? source[8] : nativeMin(data[8], source[8]);
        }
        if (data[9] == null) {
          data[9] = source[9];
        }
        data[0] = source[0];
        data[1] = newBitmask;
        return data;
      }
      function nativeKeysIn(object2) {
        var result2 = [];
        if (object2 != null) {
          for (var key in Object2(object2)) {
            result2.push(key);
          }
        }
        return result2;
      }
      function objectToString(value) {
        return nativeObjectToString.call(value);
      }
      function overRest(func, start2, transform2) {
        start2 = nativeMax(start2 === undefined$1 ? func.length - 1 : start2, 0);
        return function() {
          var args = arguments, index = -1, length = nativeMax(args.length - start2, 0), array2 = Array2(length);
          while (++index < length) {
            array2[index] = args[start2 + index];
          }
          index = -1;
          var otherArgs = Array2(start2 + 1);
          while (++index < start2) {
            otherArgs[index] = args[index];
          }
          otherArgs[start2] = transform2(array2);
          return apply(func, this, otherArgs);
        };
      }
      function parent(object2, path) {
        return path.length < 2 ? object2 : baseGet(object2, baseSlice(path, 0, -1));
      }
      function reorder(array2, indexes) {
        var arrLength = array2.length, length = nativeMin(indexes.length, arrLength), oldArray = copyArray(array2);
        while (length--) {
          var index = indexes[length];
          array2[length] = isIndex(index, arrLength) ? oldArray[index] : undefined$1;
        }
        return array2;
      }
      function safeGet(object2, key) {
        if (key === "constructor" && typeof object2[key] === "function") {
          return;
        }
        if (key == "__proto__") {
          return;
        }
        return object2[key];
      }
      var setData = shortOut(baseSetData);
      var setTimeout2 = ctxSetTimeout || function(func, wait) {
        return root2.setTimeout(func, wait);
      };
      var setToString = shortOut(baseSetToString);
      function setWrapToString(wrapper, reference, bitmask) {
        var source = reference + "";
        return setToString(wrapper, insertWrapDetails(source, updateWrapDetails(getWrapDetails(source), bitmask)));
      }
      function shortOut(func) {
        var count = 0, lastCalled = 0;
        return function() {
          var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
          lastCalled = stamp;
          if (remaining > 0) {
            if (++count >= HOT_COUNT) {
              return arguments[0];
            }
          } else {
            count = 0;
          }
          return func.apply(undefined$1, arguments);
        };
      }
      function shuffleSelf(array2, size2) {
        var index = -1, length = array2.length, lastIndex = length - 1;
        size2 = size2 === undefined$1 ? length : size2;
        while (++index < size2) {
          var rand = baseRandom(index, lastIndex), value = array2[rand];
          array2[rand] = array2[index];
          array2[index] = value;
        }
        array2.length = size2;
        return array2;
      }
      var stringToPath = memoizeCapped(function(string) {
        var result2 = [];
        if (string.charCodeAt(0) === 46) {
          result2.push("");
        }
        string.replace(rePropName, function(match, number2, quote, subString) {
          result2.push(quote ? subString.replace(reEscapeChar, "$1") : number2 || match);
        });
        return result2;
      });
      function toKey(value) {
        if (typeof value == "string" || isSymbol(value)) {
          return value;
        }
        var result2 = value + "";
        return result2 == "0" && 1 / value == -INFINITY ? "-0" : result2;
      }
      function toSource(func) {
        if (func != null) {
          try {
            return funcToString.call(func);
          } catch (e) {
          }
          try {
            return func + "";
          } catch (e) {
          }
        }
        return "";
      }
      function updateWrapDetails(details, bitmask) {
        arrayEach(wrapFlags, function(pair) {
          var value = "_." + pair[0];
          if (bitmask & pair[1] && !arrayIncludes(details, value)) {
            details.push(value);
          }
        });
        return details.sort();
      }
      function wrapperClone(wrapper) {
        if (wrapper instanceof LazyWrapper) {
          return wrapper.clone();
        }
        var result2 = new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__);
        result2.__actions__ = copyArray(wrapper.__actions__);
        result2.__index__ = wrapper.__index__;
        result2.__values__ = wrapper.__values__;
        return result2;
      }
      function chunk(array2, size2, guard) {
        if (guard ? isIterateeCall(array2, size2, guard) : size2 === undefined$1) {
          size2 = 1;
        } else {
          size2 = nativeMax(toInteger(size2), 0);
        }
        var length = array2 == null ? 0 : array2.length;
        if (!length || size2 < 1) {
          return [];
        }
        var index = 0, resIndex = 0, result2 = Array2(nativeCeil(length / size2));
        while (index < length) {
          result2[resIndex++] = baseSlice(array2, index, index += size2);
        }
        return result2;
      }
      function compact(array2) {
        var index = -1, length = array2 == null ? 0 : array2.length, resIndex = 0, result2 = [];
        while (++index < length) {
          var value = array2[index];
          if (value) {
            result2[resIndex++] = value;
          }
        }
        return result2;
      }
      function concat() {
        var length = arguments.length;
        if (!length) {
          return [];
        }
        var args = Array2(length - 1), array2 = arguments[0], index = length;
        while (index--) {
          args[index - 1] = arguments[index];
        }
        return arrayPush(isArray(array2) ? copyArray(array2) : [array2], baseFlatten(args, 1));
      }
      var difference = baseRest(function(array2, values2) {
        return isArrayLikeObject(array2) ? baseDifference(array2, baseFlatten(values2, 1, isArrayLikeObject, true)) : [];
      });
      var differenceBy = baseRest(function(array2, values2) {
        var iteratee2 = last(values2);
        if (isArrayLikeObject(iteratee2)) {
          iteratee2 = undefined$1;
        }
        return isArrayLikeObject(array2) ? baseDifference(array2, baseFlatten(values2, 1, isArrayLikeObject, true), getIteratee(iteratee2, 2)) : [];
      });
      var differenceWith = baseRest(function(array2, values2) {
        var comparator = last(values2);
        if (isArrayLikeObject(comparator)) {
          comparator = undefined$1;
        }
        return isArrayLikeObject(array2) ? baseDifference(array2, baseFlatten(values2, 1, isArrayLikeObject, true), undefined$1, comparator) : [];
      });
      function drop(array2, n, guard) {
        var length = array2 == null ? 0 : array2.length;
        if (!length) {
          return [];
        }
        n = guard || n === undefined$1 ? 1 : toInteger(n);
        return baseSlice(array2, n < 0 ? 0 : n, length);
      }
      function dropRight(array2, n, guard) {
        var length = array2 == null ? 0 : array2.length;
        if (!length) {
          return [];
        }
        n = guard || n === undefined$1 ? 1 : toInteger(n);
        n = length - n;
        return baseSlice(array2, 0, n < 0 ? 0 : n);
      }
      function dropRightWhile(array2, predicate) {
        return array2 && array2.length ? baseWhile(array2, getIteratee(predicate, 3), true, true) : [];
      }
      function dropWhile(array2, predicate) {
        return array2 && array2.length ? baseWhile(array2, getIteratee(predicate, 3), true) : [];
      }
      function fill(array2, value, start2, end) {
        var length = array2 == null ? 0 : array2.length;
        if (!length) {
          return [];
        }
        if (start2 && typeof start2 != "number" && isIterateeCall(array2, value, start2)) {
          start2 = 0;
          end = length;
        }
        return baseFill(array2, value, start2, end);
      }
      function findIndex(array2, predicate, fromIndex) {
        var length = array2 == null ? 0 : array2.length;
        if (!length) {
          return -1;
        }
        var index = fromIndex == null ? 0 : toInteger(fromIndex);
        if (index < 0) {
          index = nativeMax(length + index, 0);
        }
        return baseFindIndex(array2, getIteratee(predicate, 3), index);
      }
      function findLastIndex(array2, predicate, fromIndex) {
        var length = array2 == null ? 0 : array2.length;
        if (!length) {
          return -1;
        }
        var index = length - 1;
        if (fromIndex !== undefined$1) {
          index = toInteger(fromIndex);
          index = fromIndex < 0 ? nativeMax(length + index, 0) : nativeMin(index, length - 1);
        }
        return baseFindIndex(array2, getIteratee(predicate, 3), index, true);
      }
      function flatten2(array2) {
        var length = array2 == null ? 0 : array2.length;
        return length ? baseFlatten(array2, 1) : [];
      }
      function flattenDeep(array2) {
        var length = array2 == null ? 0 : array2.length;
        return length ? baseFlatten(array2, INFINITY) : [];
      }
      function flattenDepth(array2, depth) {
        var length = array2 == null ? 0 : array2.length;
        if (!length) {
          return [];
        }
        depth = depth === undefined$1 ? 1 : toInteger(depth);
        return baseFlatten(array2, depth);
      }
      function fromPairs(pairs) {
        var index = -1, length = pairs == null ? 0 : pairs.length, result2 = {};
        while (++index < length) {
          var pair = pairs[index];
          result2[pair[0]] = pair[1];
        }
        return result2;
      }
      function head(array2) {
        return array2 && array2.length ? array2[0] : undefined$1;
      }
      function indexOf(array2, value, fromIndex) {
        var length = array2 == null ? 0 : array2.length;
        if (!length) {
          return -1;
        }
        var index = fromIndex == null ? 0 : toInteger(fromIndex);
        if (index < 0) {
          index = nativeMax(length + index, 0);
        }
        return baseIndexOf(array2, value, index);
      }
      function initial(array2) {
        var length = array2 == null ? 0 : array2.length;
        return length ? baseSlice(array2, 0, -1) : [];
      }
      var intersection = baseRest(function(arrays) {
        var mapped = arrayMap(arrays, castArrayLikeObject);
        return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped) : [];
      });
      var intersectionBy = baseRest(function(arrays) {
        var iteratee2 = last(arrays), mapped = arrayMap(arrays, castArrayLikeObject);
        if (iteratee2 === last(mapped)) {
          iteratee2 = undefined$1;
        } else {
          mapped.pop();
        }
        return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped, getIteratee(iteratee2, 2)) : [];
      });
      var intersectionWith = baseRest(function(arrays) {
        var comparator = last(arrays), mapped = arrayMap(arrays, castArrayLikeObject);
        comparator = typeof comparator == "function" ? comparator : undefined$1;
        if (comparator) {
          mapped.pop();
        }
        return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped, undefined$1, comparator) : [];
      });
      function join(array2, separator) {
        return array2 == null ? "" : nativeJoin.call(array2, separator);
      }
      function last(array2) {
        var length = array2 == null ? 0 : array2.length;
        return length ? array2[length - 1] : undefined$1;
      }
      function lastIndexOf(array2, value, fromIndex) {
        var length = array2 == null ? 0 : array2.length;
        if (!length) {
          return -1;
        }
        var index = length;
        if (fromIndex !== undefined$1) {
          index = toInteger(fromIndex);
          index = index < 0 ? nativeMax(length + index, 0) : nativeMin(index, length - 1);
        }
        return value === value ? strictLastIndexOf(array2, value, index) : baseFindIndex(array2, baseIsNaN, index, true);
      }
      function nth(array2, n) {
        return array2 && array2.length ? baseNth(array2, toInteger(n)) : undefined$1;
      }
      var pull = baseRest(pullAll);
      function pullAll(array2, values2) {
        return array2 && array2.length && values2 && values2.length ? basePullAll(array2, values2) : array2;
      }
      function pullAllBy(array2, values2, iteratee2) {
        return array2 && array2.length && values2 && values2.length ? basePullAll(array2, values2, getIteratee(iteratee2, 2)) : array2;
      }
      function pullAllWith(array2, values2, comparator) {
        return array2 && array2.length && values2 && values2.length ? basePullAll(array2, values2, undefined$1, comparator) : array2;
      }
      var pullAt = flatRest(function(array2, indexes) {
        var length = array2 == null ? 0 : array2.length, result2 = baseAt(array2, indexes);
        basePullAt(array2, arrayMap(indexes, function(index) {
          return isIndex(index, length) ? +index : index;
        }).sort(compareAscending));
        return result2;
      });
      function remove2(array2, predicate) {
        var result2 = [];
        if (!(array2 && array2.length)) {
          return result2;
        }
        var index = -1, indexes = [], length = array2.length;
        predicate = getIteratee(predicate, 3);
        while (++index < length) {
          var value = array2[index];
          if (predicate(value, index, array2)) {
            result2.push(value);
            indexes.push(index);
          }
        }
        basePullAt(array2, indexes);
        return result2;
      }
      function reverse(array2) {
        return array2 == null ? array2 : nativeReverse.call(array2);
      }
      function slice(array2, start2, end) {
        var length = array2 == null ? 0 : array2.length;
        if (!length) {
          return [];
        }
        if (end && typeof end != "number" && isIterateeCall(array2, start2, end)) {
          start2 = 0;
          end = length;
        } else {
          start2 = start2 == null ? 0 : toInteger(start2);
          end = end === undefined$1 ? length : toInteger(end);
        }
        return baseSlice(array2, start2, end);
      }
      function sortedIndex(array2, value) {
        return baseSortedIndex(array2, value);
      }
      function sortedIndexBy(array2, value, iteratee2) {
        return baseSortedIndexBy(array2, value, getIteratee(iteratee2, 2));
      }
      function sortedIndexOf(array2, value) {
        var length = array2 == null ? 0 : array2.length;
        if (length) {
          var index = baseSortedIndex(array2, value);
          if (index < length && eq(array2[index], value)) {
            return index;
          }
        }
        return -1;
      }
      function sortedLastIndex(array2, value) {
        return baseSortedIndex(array2, value, true);
      }
      function sortedLastIndexBy(array2, value, iteratee2) {
        return baseSortedIndexBy(array2, value, getIteratee(iteratee2, 2), true);
      }
      function sortedLastIndexOf(array2, value) {
        var length = array2 == null ? 0 : array2.length;
        if (length) {
          var index = baseSortedIndex(array2, value, true) - 1;
          if (eq(array2[index], value)) {
            return index;
          }
        }
        return -1;
      }
      function sortedUniq(array2) {
        return array2 && array2.length ? baseSortedUniq(array2) : [];
      }
      function sortedUniqBy(array2, iteratee2) {
        return array2 && array2.length ? baseSortedUniq(array2, getIteratee(iteratee2, 2)) : [];
      }
      function tail(array2) {
        var length = array2 == null ? 0 : array2.length;
        return length ? baseSlice(array2, 1, length) : [];
      }
      function take(array2, n, guard) {
        if (!(array2 && array2.length)) {
          return [];
        }
        n = guard || n === undefined$1 ? 1 : toInteger(n);
        return baseSlice(array2, 0, n < 0 ? 0 : n);
      }
      function takeRight(array2, n, guard) {
        var length = array2 == null ? 0 : array2.length;
        if (!length) {
          return [];
        }
        n = guard || n === undefined$1 ? 1 : toInteger(n);
        n = length - n;
        return baseSlice(array2, n < 0 ? 0 : n, length);
      }
      function takeRightWhile(array2, predicate) {
        return array2 && array2.length ? baseWhile(array2, getIteratee(predicate, 3), false, true) : [];
      }
      function takeWhile(array2, predicate) {
        return array2 && array2.length ? baseWhile(array2, getIteratee(predicate, 3)) : [];
      }
      var union = baseRest(function(arrays) {
        return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true));
      });
      var unionBy = baseRest(function(arrays) {
        var iteratee2 = last(arrays);
        if (isArrayLikeObject(iteratee2)) {
          iteratee2 = undefined$1;
        }
        return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), getIteratee(iteratee2, 2));
      });
      var unionWith = baseRest(function(arrays) {
        var comparator = last(arrays);
        comparator = typeof comparator == "function" ? comparator : undefined$1;
        return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), undefined$1, comparator);
      });
      function uniq(array2) {
        return array2 && array2.length ? baseUniq(array2) : [];
      }
      function uniqBy(array2, iteratee2) {
        return array2 && array2.length ? baseUniq(array2, getIteratee(iteratee2, 2)) : [];
      }
      function uniqWith(array2, comparator) {
        comparator = typeof comparator == "function" ? comparator : undefined$1;
        return array2 && array2.length ? baseUniq(array2, undefined$1, comparator) : [];
      }
      function unzip(array2) {
        if (!(array2 && array2.length)) {
          return [];
        }
        var length = 0;
        array2 = arrayFilter(array2, function(group) {
          if (isArrayLikeObject(group)) {
            length = nativeMax(group.length, length);
            return true;
          }
        });
        return baseTimes(length, function(index) {
          return arrayMap(array2, baseProperty(index));
        });
      }
      function unzipWith(array2, iteratee2) {
        if (!(array2 && array2.length)) {
          return [];
        }
        var result2 = unzip(array2);
        if (iteratee2 == null) {
          return result2;
        }
        return arrayMap(result2, function(group) {
          return apply(iteratee2, undefined$1, group);
        });
      }
      var without = baseRest(function(array2, values2) {
        return isArrayLikeObject(array2) ? baseDifference(array2, values2) : [];
      });
      var xor = baseRest(function(arrays) {
        return baseXor(arrayFilter(arrays, isArrayLikeObject));
      });
      var xorBy = baseRest(function(arrays) {
        var iteratee2 = last(arrays);
        if (isArrayLikeObject(iteratee2)) {
          iteratee2 = undefined$1;
        }
        return baseXor(arrayFilter(arrays, isArrayLikeObject), getIteratee(iteratee2, 2));
      });
      var xorWith = baseRest(function(arrays) {
        var comparator = last(arrays);
        comparator = typeof comparator == "function" ? comparator : undefined$1;
        return baseXor(arrayFilter(arrays, isArrayLikeObject), undefined$1, comparator);
      });
      var zip = baseRest(unzip);
      function zipObject(props, values2) {
        return baseZipObject(props || [], values2 || [], assignValue);
      }
      function zipObjectDeep(props, values2) {
        return baseZipObject(props || [], values2 || [], baseSet);
      }
      var zipWith = baseRest(function(arrays) {
        var length = arrays.length, iteratee2 = length > 1 ? arrays[length - 1] : undefined$1;
        iteratee2 = typeof iteratee2 == "function" ? (arrays.pop(), iteratee2) : undefined$1;
        return unzipWith(arrays, iteratee2);
      });
      function chain(value) {
        var result2 = lodash2(value);
        result2.__chain__ = true;
        return result2;
      }
      function tap(value, interceptor) {
        interceptor(value);
        return value;
      }
      function thru(value, interceptor) {
        return interceptor(value);
      }
      var wrapperAt = flatRest(function(paths) {
        var length = paths.length, start2 = length ? paths[0] : 0, value = this.__wrapped__, interceptor = function(object2) {
          return baseAt(object2, paths);
        };
        if (length > 1 || this.__actions__.length || !(value instanceof LazyWrapper) || !isIndex(start2)) {
          return this.thru(interceptor);
        }
        value = value.slice(start2, +start2 + (length ? 1 : 0));
        value.__actions__.push({
          "func": thru,
          "args": [interceptor],
          "thisArg": undefined$1
        });
        return new LodashWrapper(value, this.__chain__).thru(function(array2) {
          if (length && !array2.length) {
            array2.push(undefined$1);
          }
          return array2;
        });
      });
      function wrapperChain() {
        return chain(this);
      }
      function wrapperCommit() {
        return new LodashWrapper(this.value(), this.__chain__);
      }
      function wrapperNext() {
        if (this.__values__ === undefined$1) {
          this.__values__ = toArray(this.value());
        }
        var done = this.__index__ >= this.__values__.length, value = done ? undefined$1 : this.__values__[this.__index__++];
        return { "done": done, "value": value };
      }
      function wrapperToIterator() {
        return this;
      }
      function wrapperPlant(value) {
        var result2, parent2 = this;
        while (parent2 instanceof baseLodash) {
          var clone2 = wrapperClone(parent2);
          clone2.__index__ = 0;
          clone2.__values__ = undefined$1;
          if (result2) {
            previous.__wrapped__ = clone2;
          } else {
            result2 = clone2;
          }
          var previous = clone2;
          parent2 = parent2.__wrapped__;
        }
        previous.__wrapped__ = value;
        return result2;
      }
      function wrapperReverse() {
        var value = this.__wrapped__;
        if (value instanceof LazyWrapper) {
          var wrapped = value;
          if (this.__actions__.length) {
            wrapped = new LazyWrapper(this);
          }
          wrapped = wrapped.reverse();
          wrapped.__actions__.push({
            "func": thru,
            "args": [reverse],
            "thisArg": undefined$1
          });
          return new LodashWrapper(wrapped, this.__chain__);
        }
        return this.thru(reverse);
      }
      function wrapperValue() {
        return baseWrapperValue(this.__wrapped__, this.__actions__);
      }
      var countBy = createAggregator(function(result2, value, key) {
        if (hasOwnProperty.call(result2, key)) {
          ++result2[key];
        } else {
          baseAssignValue(result2, key, 1);
        }
      });
      function every(collection, predicate, guard) {
        var func = isArray(collection) ? arrayEvery : baseEvery;
        if (guard && isIterateeCall(collection, predicate, guard)) {
          predicate = undefined$1;
        }
        return func(collection, getIteratee(predicate, 3));
      }
      function filter2(collection, predicate) {
        var func = isArray(collection) ? arrayFilter : baseFilter;
        return func(collection, getIteratee(predicate, 3));
      }
      var find2 = createFind(findIndex);
      var findLast = createFind(findLastIndex);
      function flatMap(collection, iteratee2) {
        return baseFlatten(map2(collection, iteratee2), 1);
      }
      function flatMapDeep(collection, iteratee2) {
        return baseFlatten(map2(collection, iteratee2), INFINITY);
      }
      function flatMapDepth(collection, iteratee2, depth) {
        depth = depth === undefined$1 ? 1 : toInteger(depth);
        return baseFlatten(map2(collection, iteratee2), depth);
      }
      function forEach(collection, iteratee2) {
        var func = isArray(collection) ? arrayEach : baseEach;
        return func(collection, getIteratee(iteratee2, 3));
      }
      function forEachRight(collection, iteratee2) {
        var func = isArray(collection) ? arrayEachRight : baseEachRight;
        return func(collection, getIteratee(iteratee2, 3));
      }
      var groupBy = createAggregator(function(result2, value, key) {
        if (hasOwnProperty.call(result2, key)) {
          result2[key].push(value);
        } else {
          baseAssignValue(result2, key, [value]);
        }
      });
      function includes(collection, value, fromIndex, guard) {
        collection = isArrayLike(collection) ? collection : values(collection);
        fromIndex = fromIndex && !guard ? toInteger(fromIndex) : 0;
        var length = collection.length;
        if (fromIndex < 0) {
          fromIndex = nativeMax(length + fromIndex, 0);
        }
        return isString(collection) ? fromIndex <= length && collection.indexOf(value, fromIndex) > -1 : !!length && baseIndexOf(collection, value, fromIndex) > -1;
      }
      var invokeMap = baseRest(function(collection, path, args) {
        var index = -1, isFunc = typeof path == "function", result2 = isArrayLike(collection) ? Array2(collection.length) : [];
        baseEach(collection, function(value) {
          result2[++index] = isFunc ? apply(path, value, args) : baseInvoke(value, path, args);
        });
        return result2;
      });
      var keyBy = createAggregator(function(result2, value, key) {
        baseAssignValue(result2, key, value);
      });
      function map2(collection, iteratee2) {
        var func = isArray(collection) ? arrayMap : baseMap;
        return func(collection, getIteratee(iteratee2, 3));
      }
      function orderBy(collection, iteratees, orders, guard) {
        if (collection == null) {
          return [];
        }
        if (!isArray(iteratees)) {
          iteratees = iteratees == null ? [] : [iteratees];
        }
        orders = guard ? undefined$1 : orders;
        if (!isArray(orders)) {
          orders = orders == null ? [] : [orders];
        }
        return baseOrderBy(collection, iteratees, orders);
      }
      var partition = createAggregator(function(result2, value, key) {
        result2[key ? 0 : 1].push(value);
      }, function() {
        return [[], []];
      });
      function reduce(collection, iteratee2, accumulator) {
        var func = isArray(collection) ? arrayReduce : baseReduce, initAccum = arguments.length < 3;
        return func(collection, getIteratee(iteratee2, 4), accumulator, initAccum, baseEach);
      }
      function reduceRight(collection, iteratee2, accumulator) {
        var func = isArray(collection) ? arrayReduceRight : baseReduce, initAccum = arguments.length < 3;
        return func(collection, getIteratee(iteratee2, 4), accumulator, initAccum, baseEachRight);
      }
      function reject(collection, predicate) {
        var func = isArray(collection) ? arrayFilter : baseFilter;
        return func(collection, negate(getIteratee(predicate, 3)));
      }
      function sample(collection) {
        var func = isArray(collection) ? arraySample : baseSample;
        return func(collection);
      }
      function sampleSize(collection, n, guard) {
        if (guard ? isIterateeCall(collection, n, guard) : n === undefined$1) {
          n = 1;
        } else {
          n = toInteger(n);
        }
        var func = isArray(collection) ? arraySampleSize : baseSampleSize;
        return func(collection, n);
      }
      function shuffle(collection) {
        var func = isArray(collection) ? arrayShuffle : baseShuffle;
        return func(collection);
      }
      function size(collection) {
        if (collection == null) {
          return 0;
        }
        if (isArrayLike(collection)) {
          return isString(collection) ? stringSize(collection) : collection.length;
        }
        var tag = getTag(collection);
        if (tag == mapTag || tag == setTag) {
          return collection.size;
        }
        return baseKeys(collection).length;
      }
      function some(collection, predicate, guard) {
        var func = isArray(collection) ? arraySome : baseSome;
        if (guard && isIterateeCall(collection, predicate, guard)) {
          predicate = undefined$1;
        }
        return func(collection, getIteratee(predicate, 3));
      }
      var sortBy = baseRest(function(collection, iteratees) {
        if (collection == null) {
          return [];
        }
        var length = iteratees.length;
        if (length > 1 && isIterateeCall(collection, iteratees[0], iteratees[1])) {
          iteratees = [];
        } else if (length > 2 && isIterateeCall(iteratees[0], iteratees[1], iteratees[2])) {
          iteratees = [iteratees[0]];
        }
        return baseOrderBy(collection, baseFlatten(iteratees, 1), []);
      });
      var now2 = ctxNow || function() {
        return root2.Date.now();
      };
      function after(n, func) {
        if (typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        n = toInteger(n);
        return function() {
          if (--n < 1) {
            return func.apply(this, arguments);
          }
        };
      }
      function ary(func, n, guard) {
        n = guard ? undefined$1 : n;
        n = func && n == null ? func.length : n;
        return createWrap(func, WRAP_ARY_FLAG, undefined$1, undefined$1, undefined$1, undefined$1, n);
      }
      function before(n, func) {
        var result2;
        if (typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        n = toInteger(n);
        return function() {
          if (--n > 0) {
            result2 = func.apply(this, arguments);
          }
          if (n <= 1) {
            func = undefined$1;
          }
          return result2;
        };
      }
      var bind = baseRest(function(func, thisArg, partials) {
        var bitmask = WRAP_BIND_FLAG;
        if (partials.length) {
          var holders = replaceHolders(partials, getHolder(bind));
          bitmask |= WRAP_PARTIAL_FLAG;
        }
        return createWrap(func, bitmask, thisArg, partials, holders);
      });
      var bindKey2 = baseRest(function(object2, key, partials) {
        var bitmask = WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG;
        if (partials.length) {
          var holders = replaceHolders(partials, getHolder(bindKey2));
          bitmask |= WRAP_PARTIAL_FLAG;
        }
        return createWrap(key, bitmask, object2, partials, holders);
      });
      function curry(func, arity, guard) {
        arity = guard ? undefined$1 : arity;
        var result2 = createWrap(func, WRAP_CURRY_FLAG, undefined$1, undefined$1, undefined$1, undefined$1, undefined$1, arity);
        result2.placeholder = curry.placeholder;
        return result2;
      }
      function curryRight(func, arity, guard) {
        arity = guard ? undefined$1 : arity;
        var result2 = createWrap(func, WRAP_CURRY_RIGHT_FLAG, undefined$1, undefined$1, undefined$1, undefined$1, undefined$1, arity);
        result2.placeholder = curryRight.placeholder;
        return result2;
      }
      function debounce(func, wait, options) {
        var lastArgs, lastThis, maxWait, result2, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
        if (typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        wait = toNumber(wait) || 0;
        if (isObject(options)) {
          leading = !!options.leading;
          maxing = "maxWait" in options;
          maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
          trailing = "trailing" in options ? !!options.trailing : trailing;
        }
        function invokeFunc(time) {
          var args = lastArgs, thisArg = lastThis;
          lastArgs = lastThis = undefined$1;
          lastInvokeTime = time;
          result2 = func.apply(thisArg, args);
          return result2;
        }
        function leadingEdge(time) {
          lastInvokeTime = time;
          timerId = setTimeout2(timerExpired, wait);
          return leading ? invokeFunc(time) : result2;
        }
        function remainingWait(time) {
          var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, timeWaiting = wait - timeSinceLastCall;
          return maxing ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
        }
        function shouldInvoke(time) {
          var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
          return lastCallTime === undefined$1 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
        }
        function timerExpired() {
          var time = now2();
          if (shouldInvoke(time)) {
            return trailingEdge(time);
          }
          timerId = setTimeout2(timerExpired, remainingWait(time));
        }
        function trailingEdge(time) {
          timerId = undefined$1;
          if (trailing && lastArgs) {
            return invokeFunc(time);
          }
          lastArgs = lastThis = undefined$1;
          return result2;
        }
        function cancel() {
          if (timerId !== undefined$1) {
            clearTimeout2(timerId);
          }
          lastInvokeTime = 0;
          lastArgs = lastCallTime = lastThis = timerId = undefined$1;
        }
        function flush() {
          return timerId === undefined$1 ? result2 : trailingEdge(now2());
        }
        function debounced() {
          var time = now2(), isInvoking = shouldInvoke(time);
          lastArgs = arguments;
          lastThis = this;
          lastCallTime = time;
          if (isInvoking) {
            if (timerId === undefined$1) {
              return leadingEdge(lastCallTime);
            }
            if (maxing) {
              clearTimeout2(timerId);
              timerId = setTimeout2(timerExpired, wait);
              return invokeFunc(lastCallTime);
            }
          }
          if (timerId === undefined$1) {
            timerId = setTimeout2(timerExpired, wait);
          }
          return result2;
        }
        debounced.cancel = cancel;
        debounced.flush = flush;
        return debounced;
      }
      var defer = baseRest(function(func, args) {
        return baseDelay(func, 1, args);
      });
      var delay = baseRest(function(func, wait, args) {
        return baseDelay(func, toNumber(wait) || 0, args);
      });
      function flip(func) {
        return createWrap(func, WRAP_FLIP_FLAG);
      }
      function memoize(func, resolver) {
        if (typeof func != "function" || resolver != null && typeof resolver != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        var memoized = function() {
          var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
          if (cache.has(key)) {
            return cache.get(key);
          }
          var result2 = func.apply(this, args);
          memoized.cache = cache.set(key, result2) || cache;
          return result2;
        };
        memoized.cache = new (memoize.Cache || MapCache)();
        return memoized;
      }
      memoize.Cache = MapCache;
      function negate(predicate) {
        if (typeof predicate != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        return function() {
          var args = arguments;
          switch (args.length) {
            case 0:
              return !predicate.call(this);
            case 1:
              return !predicate.call(this, args[0]);
            case 2:
              return !predicate.call(this, args[0], args[1]);
            case 3:
              return !predicate.call(this, args[0], args[1], args[2]);
          }
          return !predicate.apply(this, args);
        };
      }
      function once(func) {
        return before(2, func);
      }
      var overArgs = castRest(function(func, transforms) {
        transforms = transforms.length == 1 && isArray(transforms[0]) ? arrayMap(transforms[0], baseUnary(getIteratee())) : arrayMap(baseFlatten(transforms, 1), baseUnary(getIteratee()));
        var funcsLength = transforms.length;
        return baseRest(function(args) {
          var index = -1, length = nativeMin(args.length, funcsLength);
          while (++index < length) {
            args[index] = transforms[index].call(this, args[index]);
          }
          return apply(func, this, args);
        });
      });
      var partial = baseRest(function(func, partials) {
        var holders = replaceHolders(partials, getHolder(partial));
        return createWrap(func, WRAP_PARTIAL_FLAG, undefined$1, partials, holders);
      });
      var partialRight = baseRest(function(func, partials) {
        var holders = replaceHolders(partials, getHolder(partialRight));
        return createWrap(func, WRAP_PARTIAL_RIGHT_FLAG, undefined$1, partials, holders);
      });
      var rearg = flatRest(function(func, indexes) {
        return createWrap(func, WRAP_REARG_FLAG, undefined$1, undefined$1, undefined$1, indexes);
      });
      function rest(func, start2) {
        if (typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        start2 = start2 === undefined$1 ? start2 : toInteger(start2);
        return baseRest(func, start2);
      }
      function spread(func, start2) {
        if (typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        start2 = start2 == null ? 0 : nativeMax(toInteger(start2), 0);
        return baseRest(function(args) {
          var array2 = args[start2], otherArgs = castSlice(args, 0, start2);
          if (array2) {
            arrayPush(otherArgs, array2);
          }
          return apply(func, this, otherArgs);
        });
      }
      function throttle(func, wait, options) {
        var leading = true, trailing = true;
        if (typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        if (isObject(options)) {
          leading = "leading" in options ? !!options.leading : leading;
          trailing = "trailing" in options ? !!options.trailing : trailing;
        }
        return debounce(func, wait, {
          "leading": leading,
          "maxWait": wait,
          "trailing": trailing
        });
      }
      function unary(func) {
        return ary(func, 1);
      }
      function wrap(value, wrapper) {
        return partial(castFunction(wrapper), value);
      }
      function castArray() {
        if (!arguments.length) {
          return [];
        }
        var value = arguments[0];
        return isArray(value) ? value : [value];
      }
      function clone(value) {
        return baseClone(value, CLONE_SYMBOLS_FLAG);
      }
      function cloneWith(value, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        return baseClone(value, CLONE_SYMBOLS_FLAG, customizer);
      }
      function cloneDeep(value) {
        return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
      }
      function cloneDeepWith(value, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG, customizer);
      }
      function conformsTo(object2, source) {
        return source == null || baseConformsTo(object2, source, keys(source));
      }
      function eq(value, other) {
        return value === other || value !== value && other !== other;
      }
      var gt = createRelationalOperation(baseGt);
      var gte = createRelationalOperation(function(value, other) {
        return value >= other;
      });
      var isArguments = baseIsArguments(function() {
        return arguments;
      }()) ? baseIsArguments : function(value) {
        return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
      };
      var isArray = Array2.isArray;
      var isArrayBuffer = nodeIsArrayBuffer ? baseUnary(nodeIsArrayBuffer) : baseIsArrayBuffer;
      function isArrayLike(value) {
        return value != null && isLength(value.length) && !isFunction(value);
      }
      function isArrayLikeObject(value) {
        return isObjectLike(value) && isArrayLike(value);
      }
      function isBoolean(value) {
        return value === true || value === false || isObjectLike(value) && baseGetTag(value) == boolTag;
      }
      var isBuffer = nativeIsBuffer || stubFalse;
      var isDate = nodeIsDate ? baseUnary(nodeIsDate) : baseIsDate;
      function isElement(value) {
        return isObjectLike(value) && value.nodeType === 1 && !isPlainObject(value);
      }
      function isEmpty(value) {
        if (value == null) {
          return true;
        }
        if (isArrayLike(value) && (isArray(value) || typeof value == "string" || typeof value.splice == "function" || isBuffer(value) || isTypedArray(value) || isArguments(value))) {
          return !value.length;
        }
        var tag = getTag(value);
        if (tag == mapTag || tag == setTag) {
          return !value.size;
        }
        if (isPrototype(value)) {
          return !baseKeys(value).length;
        }
        for (var key in value) {
          if (hasOwnProperty.call(value, key)) {
            return false;
          }
        }
        return true;
      }
      function isEqual(value, other) {
        return baseIsEqual(value, other);
      }
      function isEqualWith(value, other, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        var result2 = customizer ? customizer(value, other) : undefined$1;
        return result2 === undefined$1 ? baseIsEqual(value, other, undefined$1, customizer) : !!result2;
      }
      function isError(value) {
        if (!isObjectLike(value)) {
          return false;
        }
        var tag = baseGetTag(value);
        return tag == errorTag || tag == domExcTag || typeof value.message == "string" && typeof value.name == "string" && !isPlainObject(value);
      }
      function isFinite2(value) {
        return typeof value == "number" && nativeIsFinite(value);
      }
      function isFunction(value) {
        if (!isObject(value)) {
          return false;
        }
        var tag = baseGetTag(value);
        return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
      }
      function isInteger(value) {
        return typeof value == "number" && value == toInteger(value);
      }
      function isLength(value) {
        return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
      }
      function isObject(value) {
        var type = typeof value;
        return value != null && (type == "object" || type == "function");
      }
      function isObjectLike(value) {
        return value != null && typeof value == "object";
      }
      var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;
      function isMatch(object2, source) {
        return object2 === source || baseIsMatch(object2, source, getMatchData(source));
      }
      function isMatchWith(object2, source, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        return baseIsMatch(object2, source, getMatchData(source), customizer);
      }
      function isNaN2(value) {
        return isNumber(value) && value != +value;
      }
      function isNative(value) {
        if (isMaskable(value)) {
          throw new Error2(CORE_ERROR_TEXT);
        }
        return baseIsNative(value);
      }
      function isNull(value) {
        return value === null;
      }
      function isNil(value) {
        return value == null;
      }
      function isNumber(value) {
        return typeof value == "number" || isObjectLike(value) && baseGetTag(value) == numberTag;
      }
      function isPlainObject(value) {
        if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
          return false;
        }
        var proto = getPrototype(value);
        if (proto === null) {
          return true;
        }
        var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
        return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
      }
      var isRegExp = nodeIsRegExp ? baseUnary(nodeIsRegExp) : baseIsRegExp;
      function isSafeInteger(value) {
        return isInteger(value) && value >= -MAX_SAFE_INTEGER && value <= MAX_SAFE_INTEGER;
      }
      var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;
      function isString(value) {
        return typeof value == "string" || !isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag;
      }
      function isSymbol(value) {
        return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag;
      }
      var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
      function isUndefined(value) {
        return value === undefined$1;
      }
      function isWeakMap(value) {
        return isObjectLike(value) && getTag(value) == weakMapTag;
      }
      function isWeakSet(value) {
        return isObjectLike(value) && baseGetTag(value) == weakSetTag;
      }
      var lt = createRelationalOperation(baseLt);
      var lte = createRelationalOperation(function(value, other) {
        return value <= other;
      });
      function toArray(value) {
        if (!value) {
          return [];
        }
        if (isArrayLike(value)) {
          return isString(value) ? stringToArray(value) : copyArray(value);
        }
        if (symIterator && value[symIterator]) {
          return iteratorToArray(value[symIterator]());
        }
        var tag = getTag(value), func = tag == mapTag ? mapToArray : tag == setTag ? setToArray : values;
        return func(value);
      }
      function toFinite(value) {
        if (!value) {
          return value === 0 ? value : 0;
        }
        value = toNumber(value);
        if (value === INFINITY || value === -INFINITY) {
          var sign = value < 0 ? -1 : 1;
          return sign * MAX_INTEGER;
        }
        return value === value ? value : 0;
      }
      function toInteger(value) {
        var result2 = toFinite(value), remainder = result2 % 1;
        return result2 === result2 ? remainder ? result2 - remainder : result2 : 0;
      }
      function toLength(value) {
        return value ? baseClamp(toInteger(value), 0, MAX_ARRAY_LENGTH) : 0;
      }
      function toNumber(value) {
        if (typeof value == "number") {
          return value;
        }
        if (isSymbol(value)) {
          return NAN;
        }
        if (isObject(value)) {
          var other = typeof value.valueOf == "function" ? value.valueOf() : value;
          value = isObject(other) ? other + "" : other;
        }
        if (typeof value != "string") {
          return value === 0 ? value : +value;
        }
        value = baseTrim(value);
        var isBinary = reIsBinary.test(value);
        return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
      }
      function toPlainObject(value) {
        return copyObject(value, keysIn(value));
      }
      function toSafeInteger(value) {
        return value ? baseClamp(toInteger(value), -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER) : value === 0 ? value : 0;
      }
      function toString(value) {
        return value == null ? "" : baseToString(value);
      }
      var assign = createAssigner(function(object2, source) {
        if (isPrototype(source) || isArrayLike(source)) {
          copyObject(source, keys(source), object2);
          return;
        }
        for (var key in source) {
          if (hasOwnProperty.call(source, key)) {
            assignValue(object2, key, source[key]);
          }
        }
      });
      var assignIn = createAssigner(function(object2, source) {
        copyObject(source, keysIn(source), object2);
      });
      var assignInWith = createAssigner(function(object2, source, srcIndex, customizer) {
        copyObject(source, keysIn(source), object2, customizer);
      });
      var assignWith = createAssigner(function(object2, source, srcIndex, customizer) {
        copyObject(source, keys(source), object2, customizer);
      });
      var at = flatRest(baseAt);
      function create2(prototype, properties) {
        var result2 = baseCreate(prototype);
        return properties == null ? result2 : baseAssign(result2, properties);
      }
      var defaults = baseRest(function(object2, sources) {
        object2 = Object2(object2);
        var index = -1;
        var length = sources.length;
        var guard = length > 2 ? sources[2] : undefined$1;
        if (guard && isIterateeCall(sources[0], sources[1], guard)) {
          length = 1;
        }
        while (++index < length) {
          var source = sources[index];
          var props = keysIn(source);
          var propsIndex = -1;
          var propsLength = props.length;
          while (++propsIndex < propsLength) {
            var key = props[propsIndex];
            var value = object2[key];
            if (value === undefined$1 || eq(value, objectProto[key]) && !hasOwnProperty.call(object2, key)) {
              object2[key] = source[key];
            }
          }
        }
        return object2;
      });
      var defaultsDeep = baseRest(function(args) {
        args.push(undefined$1, customDefaultsMerge);
        return apply(mergeWith, undefined$1, args);
      });
      function findKey(object2, predicate) {
        return baseFindKey(object2, getIteratee(predicate, 3), baseForOwn);
      }
      function findLastKey(object2, predicate) {
        return baseFindKey(object2, getIteratee(predicate, 3), baseForOwnRight);
      }
      function forIn(object2, iteratee2) {
        return object2 == null ? object2 : baseFor(object2, getIteratee(iteratee2, 3), keysIn);
      }
      function forInRight(object2, iteratee2) {
        return object2 == null ? object2 : baseForRight(object2, getIteratee(iteratee2, 3), keysIn);
      }
      function forOwn(object2, iteratee2) {
        return object2 && baseForOwn(object2, getIteratee(iteratee2, 3));
      }
      function forOwnRight(object2, iteratee2) {
        return object2 && baseForOwnRight(object2, getIteratee(iteratee2, 3));
      }
      function functions(object2) {
        return object2 == null ? [] : baseFunctions(object2, keys(object2));
      }
      function functionsIn(object2) {
        return object2 == null ? [] : baseFunctions(object2, keysIn(object2));
      }
      function get2(object2, path, defaultValue) {
        var result2 = object2 == null ? undefined$1 : baseGet(object2, path);
        return result2 === undefined$1 ? defaultValue : result2;
      }
      function has(object2, path) {
        return object2 != null && hasPath(object2, path, baseHas);
      }
      function hasIn(object2, path) {
        return object2 != null && hasPath(object2, path, baseHasIn);
      }
      var invert = createInverter(function(result2, value, key) {
        if (value != null && typeof value.toString != "function") {
          value = nativeObjectToString.call(value);
        }
        result2[value] = key;
      }, constant2(identity2));
      var invertBy = createInverter(function(result2, value, key) {
        if (value != null && typeof value.toString != "function") {
          value = nativeObjectToString.call(value);
        }
        if (hasOwnProperty.call(result2, value)) {
          result2[value].push(key);
        } else {
          result2[value] = [key];
        }
      }, getIteratee);
      var invoke = baseRest(baseInvoke);
      function keys(object2) {
        return isArrayLike(object2) ? arrayLikeKeys(object2) : baseKeys(object2);
      }
      function keysIn(object2) {
        return isArrayLike(object2) ? arrayLikeKeys(object2, true) : baseKeysIn(object2);
      }
      function mapKeys(object2, iteratee2) {
        var result2 = {};
        iteratee2 = getIteratee(iteratee2, 3);
        baseForOwn(object2, function(value, key, object3) {
          baseAssignValue(result2, iteratee2(value, key, object3), value);
        });
        return result2;
      }
      function mapValues(object2, iteratee2) {
        var result2 = {};
        iteratee2 = getIteratee(iteratee2, 3);
        baseForOwn(object2, function(value, key, object3) {
          baseAssignValue(result2, key, iteratee2(value, key, object3));
        });
        return result2;
      }
      var merge2 = createAssigner(function(object2, source, srcIndex) {
        baseMerge(object2, source, srcIndex);
      });
      var mergeWith = createAssigner(function(object2, source, srcIndex, customizer) {
        baseMerge(object2, source, srcIndex, customizer);
      });
      var omit = flatRest(function(object2, paths) {
        var result2 = {};
        if (object2 == null) {
          return result2;
        }
        var isDeep = false;
        paths = arrayMap(paths, function(path) {
          path = castPath(path, object2);
          isDeep || (isDeep = path.length > 1);
          return path;
        });
        copyObject(object2, getAllKeysIn(object2), result2);
        if (isDeep) {
          result2 = baseClone(result2, CLONE_DEEP_FLAG | CLONE_FLAT_FLAG | CLONE_SYMBOLS_FLAG, customOmitClone);
        }
        var length = paths.length;
        while (length--) {
          baseUnset(result2, paths[length]);
        }
        return result2;
      });
      function omitBy(object2, predicate) {
        return pickBy(object2, negate(getIteratee(predicate)));
      }
      var pick = flatRest(function(object2, paths) {
        return object2 == null ? {} : basePick(object2, paths);
      });
      function pickBy(object2, predicate) {
        if (object2 == null) {
          return {};
        }
        var props = arrayMap(getAllKeysIn(object2), function(prop) {
          return [prop];
        });
        predicate = getIteratee(predicate);
        return basePickBy(object2, props, function(value, path) {
          return predicate(value, path[0]);
        });
      }
      function result(object2, path, defaultValue) {
        path = castPath(path, object2);
        var index = -1, length = path.length;
        if (!length) {
          length = 1;
          object2 = undefined$1;
        }
        while (++index < length) {
          var value = object2 == null ? undefined$1 : object2[toKey(path[index])];
          if (value === undefined$1) {
            index = length;
            value = defaultValue;
          }
          object2 = isFunction(value) ? value.call(object2) : value;
        }
        return object2;
      }
      function set2(object2, path, value) {
        return object2 == null ? object2 : baseSet(object2, path, value);
      }
      function setWith(object2, path, value, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        return object2 == null ? object2 : baseSet(object2, path, value, customizer);
      }
      var toPairs = createToPairs(keys);
      var toPairsIn = createToPairs(keysIn);
      function transform(object2, iteratee2, accumulator) {
        var isArr = isArray(object2), isArrLike = isArr || isBuffer(object2) || isTypedArray(object2);
        iteratee2 = getIteratee(iteratee2, 4);
        if (accumulator == null) {
          var Ctor = object2 && object2.constructor;
          if (isArrLike) {
            accumulator = isArr ? new Ctor() : [];
          } else if (isObject(object2)) {
            accumulator = isFunction(Ctor) ? baseCreate(getPrototype(object2)) : {};
          } else {
            accumulator = {};
          }
        }
        (isArrLike ? arrayEach : baseForOwn)(object2, function(value, index, object3) {
          return iteratee2(accumulator, value, index, object3);
        });
        return accumulator;
      }
      function unset(object2, path) {
        return object2 == null ? true : baseUnset(object2, path);
      }
      function update(object2, path, updater) {
        return object2 == null ? object2 : baseUpdate(object2, path, castFunction(updater));
      }
      function updateWith(object2, path, updater, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        return object2 == null ? object2 : baseUpdate(object2, path, castFunction(updater), customizer);
      }
      function values(object2) {
        return object2 == null ? [] : baseValues(object2, keys(object2));
      }
      function valuesIn(object2) {
        return object2 == null ? [] : baseValues(object2, keysIn(object2));
      }
      function clamp(number2, lower2, upper) {
        if (upper === undefined$1) {
          upper = lower2;
          lower2 = undefined$1;
        }
        if (upper !== undefined$1) {
          upper = toNumber(upper);
          upper = upper === upper ? upper : 0;
        }
        if (lower2 !== undefined$1) {
          lower2 = toNumber(lower2);
          lower2 = lower2 === lower2 ? lower2 : 0;
        }
        return baseClamp(toNumber(number2), lower2, upper);
      }
      function inRange(number2, start2, end) {
        start2 = toFinite(start2);
        if (end === undefined$1) {
          end = start2;
          start2 = 0;
        } else {
          end = toFinite(end);
        }
        number2 = toNumber(number2);
        return baseInRange(number2, start2, end);
      }
      function random(lower2, upper, floating) {
        if (floating && typeof floating != "boolean" && isIterateeCall(lower2, upper, floating)) {
          upper = floating = undefined$1;
        }
        if (floating === undefined$1) {
          if (typeof upper == "boolean") {
            floating = upper;
            upper = undefined$1;
          } else if (typeof lower2 == "boolean") {
            floating = lower2;
            lower2 = undefined$1;
          }
        }
        if (lower2 === undefined$1 && upper === undefined$1) {
          lower2 = 0;
          upper = 1;
        } else {
          lower2 = toFinite(lower2);
          if (upper === undefined$1) {
            upper = lower2;
            lower2 = 0;
          } else {
            upper = toFinite(upper);
          }
        }
        if (lower2 > upper) {
          var temp = lower2;
          lower2 = upper;
          upper = temp;
        }
        if (floating || lower2 % 1 || upper % 1) {
          var rand = nativeRandom();
          return nativeMin(lower2 + rand * (upper - lower2 + freeParseFloat("1e-" + ((rand + "").length - 1))), upper);
        }
        return baseRandom(lower2, upper);
      }
      var camelCase = createCompounder(function(result2, word, index) {
        word = word.toLowerCase();
        return result2 + (index ? capitalize(word) : word);
      });
      function capitalize(string) {
        return upperFirst(toString(string).toLowerCase());
      }
      function deburr(string) {
        string = toString(string);
        return string && string.replace(reLatin, deburrLetter).replace(reComboMark, "");
      }
      function endsWith(string, target, position) {
        string = toString(string);
        target = baseToString(target);
        var length = string.length;
        position = position === undefined$1 ? length : baseClamp(toInteger(position), 0, length);
        var end = position;
        position -= target.length;
        return position >= 0 && string.slice(position, end) == target;
      }
      function escape(string) {
        string = toString(string);
        return string && reHasUnescapedHtml.test(string) ? string.replace(reUnescapedHtml, escapeHtmlChar) : string;
      }
      function escapeRegExp(string) {
        string = toString(string);
        return string && reHasRegExpChar.test(string) ? string.replace(reRegExpChar, "\\$&") : string;
      }
      var kebabCase = createCompounder(function(result2, word, index) {
        return result2 + (index ? "-" : "") + word.toLowerCase();
      });
      var lowerCase = createCompounder(function(result2, word, index) {
        return result2 + (index ? " " : "") + word.toLowerCase();
      });
      var lowerFirst = createCaseFirst("toLowerCase");
      function pad(string, length, chars) {
        string = toString(string);
        length = toInteger(length);
        var strLength = length ? stringSize(string) : 0;
        if (!length || strLength >= length) {
          return string;
        }
        var mid = (length - strLength) / 2;
        return createPadding(nativeFloor(mid), chars) + string + createPadding(nativeCeil(mid), chars);
      }
      function padEnd(string, length, chars) {
        string = toString(string);
        length = toInteger(length);
        var strLength = length ? stringSize(string) : 0;
        return length && strLength < length ? string + createPadding(length - strLength, chars) : string;
      }
      function padStart(string, length, chars) {
        string = toString(string);
        length = toInteger(length);
        var strLength = length ? stringSize(string) : 0;
        return length && strLength < length ? createPadding(length - strLength, chars) + string : string;
      }
      function parseInt2(string, radix, guard) {
        if (guard || radix == null) {
          radix = 0;
        } else if (radix) {
          radix = +radix;
        }
        return nativeParseInt(toString(string).replace(reTrimStart, ""), radix || 0);
      }
      function repeat(string, n, guard) {
        if (guard ? isIterateeCall(string, n, guard) : n === undefined$1) {
          n = 1;
        } else {
          n = toInteger(n);
        }
        return baseRepeat(toString(string), n);
      }
      function replace() {
        var args = arguments, string = toString(args[0]);
        return args.length < 3 ? string : string.replace(args[1], args[2]);
      }
      var snakeCase = createCompounder(function(result2, word, index) {
        return result2 + (index ? "_" : "") + word.toLowerCase();
      });
      function split(string, separator, limit) {
        if (limit && typeof limit != "number" && isIterateeCall(string, separator, limit)) {
          separator = limit = undefined$1;
        }
        limit = limit === undefined$1 ? MAX_ARRAY_LENGTH : limit >>> 0;
        if (!limit) {
          return [];
        }
        string = toString(string);
        if (string && (typeof separator == "string" || separator != null && !isRegExp(separator))) {
          separator = baseToString(separator);
          if (!separator && hasUnicode(string)) {
            return castSlice(stringToArray(string), 0, limit);
          }
        }
        return string.split(separator, limit);
      }
      var startCase = createCompounder(function(result2, word, index) {
        return result2 + (index ? " " : "") + upperFirst(word);
      });
      function startsWith(string, target, position) {
        string = toString(string);
        position = position == null ? 0 : baseClamp(toInteger(position), 0, string.length);
        target = baseToString(target);
        return string.slice(position, position + target.length) == target;
      }
      function template(string, options, guard) {
        var settings = lodash2.templateSettings;
        if (guard && isIterateeCall(string, options, guard)) {
          options = undefined$1;
        }
        string = toString(string);
        options = assignInWith({}, options, settings, customDefaultsAssignIn);
        var imports = assignInWith({}, options.imports, settings.imports, customDefaultsAssignIn), importsKeys = keys(imports), importsValues = baseValues(imports, importsKeys);
        var isEscaping, isEvaluating, index = 0, interpolate2 = options.interpolate || reNoMatch, source = "__p += '";
        var reDelimiters = RegExp2(
          (options.escape || reNoMatch).source + "|" + interpolate2.source + "|" + (interpolate2 === reInterpolate ? reEsTemplate : reNoMatch).source + "|" + (options.evaluate || reNoMatch).source + "|$",
          "g"
        );
        var sourceURL = "//# sourceURL=" + (hasOwnProperty.call(options, "sourceURL") ? (options.sourceURL + "").replace(/\s/g, " ") : "lodash.templateSources[" + ++templateCounter + "]") + "\n";
        string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
          interpolateValue || (interpolateValue = esTemplateValue);
          source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);
          if (escapeValue) {
            isEscaping = true;
            source += "' +\n__e(" + escapeValue + ") +\n'";
          }
          if (evaluateValue) {
            isEvaluating = true;
            source += "';\n" + evaluateValue + ";\n__p += '";
          }
          if (interpolateValue) {
            source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
          }
          index = offset + match.length;
          return match;
        });
        source += "';\n";
        var variable = hasOwnProperty.call(options, "variable") && options.variable;
        if (!variable) {
          source = "with (obj) {\n" + source + "\n}\n";
        } else if (reForbiddenIdentifierChars.test(variable)) {
          throw new Error2(INVALID_TEMPL_VAR_ERROR_TEXT);
        }
        source = (isEvaluating ? source.replace(reEmptyStringLeading, "") : source).replace(reEmptyStringMiddle, "$1").replace(reEmptyStringTrailing, "$1;");
        source = "function(" + (variable || "obj") + ") {\n" + (variable ? "" : "obj || (obj = {});\n") + "var __t, __p = ''" + (isEscaping ? ", __e = _.escape" : "") + (isEvaluating ? ", __j = Array.prototype.join;\nfunction print() { __p += __j.call(arguments, '') }\n" : ";\n") + source + "return __p\n}";
        var result2 = attempt(function() {
          return Function2(importsKeys, sourceURL + "return " + source).apply(undefined$1, importsValues);
        });
        result2.source = source;
        if (isError(result2)) {
          throw result2;
        }
        return result2;
      }
      function toLower(value) {
        return toString(value).toLowerCase();
      }
      function toUpper(value) {
        return toString(value).toUpperCase();
      }
      function trim(string, chars, guard) {
        string = toString(string);
        if (string && (guard || chars === undefined$1)) {
          return baseTrim(string);
        }
        if (!string || !(chars = baseToString(chars))) {
          return string;
        }
        var strSymbols = stringToArray(string), chrSymbols = stringToArray(chars), start2 = charsStartIndex(strSymbols, chrSymbols), end = charsEndIndex(strSymbols, chrSymbols) + 1;
        return castSlice(strSymbols, start2, end).join("");
      }
      function trimEnd(string, chars, guard) {
        string = toString(string);
        if (string && (guard || chars === undefined$1)) {
          return string.slice(0, trimmedEndIndex(string) + 1);
        }
        if (!string || !(chars = baseToString(chars))) {
          return string;
        }
        var strSymbols = stringToArray(string), end = charsEndIndex(strSymbols, stringToArray(chars)) + 1;
        return castSlice(strSymbols, 0, end).join("");
      }
      function trimStart(string, chars, guard) {
        string = toString(string);
        if (string && (guard || chars === undefined$1)) {
          return string.replace(reTrimStart, "");
        }
        if (!string || !(chars = baseToString(chars))) {
          return string;
        }
        var strSymbols = stringToArray(string), start2 = charsStartIndex(strSymbols, stringToArray(chars));
        return castSlice(strSymbols, start2).join("");
      }
      function truncate(string, options) {
        var length = DEFAULT_TRUNC_LENGTH, omission = DEFAULT_TRUNC_OMISSION;
        if (isObject(options)) {
          var separator = "separator" in options ? options.separator : separator;
          length = "length" in options ? toInteger(options.length) : length;
          omission = "omission" in options ? baseToString(options.omission) : omission;
        }
        string = toString(string);
        var strLength = string.length;
        if (hasUnicode(string)) {
          var strSymbols = stringToArray(string);
          strLength = strSymbols.length;
        }
        if (length >= strLength) {
          return string;
        }
        var end = length - stringSize(omission);
        if (end < 1) {
          return omission;
        }
        var result2 = strSymbols ? castSlice(strSymbols, 0, end).join("") : string.slice(0, end);
        if (separator === undefined$1) {
          return result2 + omission;
        }
        if (strSymbols) {
          end += result2.length - end;
        }
        if (isRegExp(separator)) {
          if (string.slice(end).search(separator)) {
            var match, substring = result2;
            if (!separator.global) {
              separator = RegExp2(separator.source, toString(reFlags.exec(separator)) + "g");
            }
            separator.lastIndex = 0;
            while (match = separator.exec(substring)) {
              var newEnd = match.index;
            }
            result2 = result2.slice(0, newEnd === undefined$1 ? end : newEnd);
          }
        } else if (string.indexOf(baseToString(separator), end) != end) {
          var index = result2.lastIndexOf(separator);
          if (index > -1) {
            result2 = result2.slice(0, index);
          }
        }
        return result2 + omission;
      }
      function unescape(string) {
        string = toString(string);
        return string && reHasEscapedHtml.test(string) ? string.replace(reEscapedHtml, unescapeHtmlChar) : string;
      }
      var upperCase = createCompounder(function(result2, word, index) {
        return result2 + (index ? " " : "") + word.toUpperCase();
      });
      var upperFirst = createCaseFirst("toUpperCase");
      function words(string, pattern, guard) {
        string = toString(string);
        pattern = guard ? undefined$1 : pattern;
        if (pattern === undefined$1) {
          return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
        }
        return string.match(pattern) || [];
      }
      var attempt = baseRest(function(func, args) {
        try {
          return apply(func, undefined$1, args);
        } catch (e) {
          return isError(e) ? e : new Error2(e);
        }
      });
      var bindAll = flatRest(function(object2, methodNames) {
        arrayEach(methodNames, function(key) {
          key = toKey(key);
          baseAssignValue(object2, key, bind(object2[key], object2));
        });
        return object2;
      });
      function cond(pairs) {
        var length = pairs == null ? 0 : pairs.length, toIteratee = getIteratee();
        pairs = !length ? [] : arrayMap(pairs, function(pair) {
          if (typeof pair[1] != "function") {
            throw new TypeError2(FUNC_ERROR_TEXT);
          }
          return [toIteratee(pair[0]), pair[1]];
        });
        return baseRest(function(args) {
          var index = -1;
          while (++index < length) {
            var pair = pairs[index];
            if (apply(pair[0], this, args)) {
              return apply(pair[1], this, args);
            }
          }
        });
      }
      function conforms(source) {
        return baseConforms(baseClone(source, CLONE_DEEP_FLAG));
      }
      function constant2(value) {
        return function() {
          return value;
        };
      }
      function defaultTo(value, defaultValue) {
        return value == null || value !== value ? defaultValue : value;
      }
      var flow = createFlow();
      var flowRight = createFlow(true);
      function identity2(value) {
        return value;
      }
      function iteratee(func) {
        return baseIteratee(typeof func == "function" ? func : baseClone(func, CLONE_DEEP_FLAG));
      }
      function matches(source) {
        return baseMatches(baseClone(source, CLONE_DEEP_FLAG));
      }
      function matchesProperty(path, srcValue) {
        return baseMatchesProperty(path, baseClone(srcValue, CLONE_DEEP_FLAG));
      }
      var method = baseRest(function(path, args) {
        return function(object2) {
          return baseInvoke(object2, path, args);
        };
      });
      var methodOf = baseRest(function(object2, args) {
        return function(path) {
          return baseInvoke(object2, path, args);
        };
      });
      function mixin(object2, source, options) {
        var props = keys(source), methodNames = baseFunctions(source, props);
        if (options == null && !(isObject(source) && (methodNames.length || !props.length))) {
          options = source;
          source = object2;
          object2 = this;
          methodNames = baseFunctions(source, keys(source));
        }
        var chain2 = !(isObject(options) && "chain" in options) || !!options.chain, isFunc = isFunction(object2);
        arrayEach(methodNames, function(methodName) {
          var func = source[methodName];
          object2[methodName] = func;
          if (isFunc) {
            object2.prototype[methodName] = function() {
              var chainAll = this.__chain__;
              if (chain2 || chainAll) {
                var result2 = object2(this.__wrapped__), actions = result2.__actions__ = copyArray(this.__actions__);
                actions.push({ "func": func, "args": arguments, "thisArg": object2 });
                result2.__chain__ = chainAll;
                return result2;
              }
              return func.apply(object2, arrayPush([this.value()], arguments));
            };
          }
        });
        return object2;
      }
      function noConflict() {
        if (root2._ === this) {
          root2._ = oldDash;
        }
        return this;
      }
      function noop2() {
      }
      function nthArg(n) {
        n = toInteger(n);
        return baseRest(function(args) {
          return baseNth(args, n);
        });
      }
      var over = createOver(arrayMap);
      var overEvery = createOver(arrayEvery);
      var overSome = createOver(arraySome);
      function property(path) {
        return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
      }
      function propertyOf(object2) {
        return function(path) {
          return object2 == null ? undefined$1 : baseGet(object2, path);
        };
      }
      var range2 = createRange();
      var rangeRight = createRange(true);
      function stubArray() {
        return [];
      }
      function stubFalse() {
        return false;
      }
      function stubObject() {
        return {};
      }
      function stubString() {
        return "";
      }
      function stubTrue() {
        return true;
      }
      function times(n, iteratee2) {
        n = toInteger(n);
        if (n < 1 || n > MAX_SAFE_INTEGER) {
          return [];
        }
        var index = MAX_ARRAY_LENGTH, length = nativeMin(n, MAX_ARRAY_LENGTH);
        iteratee2 = getIteratee(iteratee2);
        n -= MAX_ARRAY_LENGTH;
        var result2 = baseTimes(length, iteratee2);
        while (++index < n) {
          iteratee2(index);
        }
        return result2;
      }
      function toPath(value) {
        if (isArray(value)) {
          return arrayMap(value, toKey);
        }
        return isSymbol(value) ? [value] : copyArray(stringToPath(toString(value)));
      }
      function uniqueId(prefix) {
        var id2 = ++idCounter;
        return toString(prefix) + id2;
      }
      var add = createMathOperation(function(augend, addend) {
        return augend + addend;
      }, 0);
      var ceil = createRound("ceil");
      var divide = createMathOperation(function(dividend, divisor) {
        return dividend / divisor;
      }, 1);
      var floor = createRound("floor");
      function max2(array2) {
        return array2 && array2.length ? baseExtremum(array2, identity2, baseGt) : undefined$1;
      }
      function maxBy(array2, iteratee2) {
        return array2 && array2.length ? baseExtremum(array2, getIteratee(iteratee2, 2), baseGt) : undefined$1;
      }
      function mean2(array2) {
        return baseMean(array2, identity2);
      }
      function meanBy(array2, iteratee2) {
        return baseMean(array2, getIteratee(iteratee2, 2));
      }
      function min2(array2) {
        return array2 && array2.length ? baseExtremum(array2, identity2, baseLt) : undefined$1;
      }
      function minBy(array2, iteratee2) {
        return array2 && array2.length ? baseExtremum(array2, getIteratee(iteratee2, 2), baseLt) : undefined$1;
      }
      var multiply = createMathOperation(function(multiplier, multiplicand) {
        return multiplier * multiplicand;
      }, 1);
      var round = createRound("round");
      var subtract = createMathOperation(function(minuend, subtrahend) {
        return minuend - subtrahend;
      }, 0);
      function sum2(array2) {
        return array2 && array2.length ? baseSum(array2, identity2) : 0;
      }
      function sumBy(array2, iteratee2) {
        return array2 && array2.length ? baseSum(array2, getIteratee(iteratee2, 2)) : 0;
      }
      lodash2.after = after;
      lodash2.ary = ary;
      lodash2.assign = assign;
      lodash2.assignIn = assignIn;
      lodash2.assignInWith = assignInWith;
      lodash2.assignWith = assignWith;
      lodash2.at = at;
      lodash2.before = before;
      lodash2.bind = bind;
      lodash2.bindAll = bindAll;
      lodash2.bindKey = bindKey2;
      lodash2.castArray = castArray;
      lodash2.chain = chain;
      lodash2.chunk = chunk;
      lodash2.compact = compact;
      lodash2.concat = concat;
      lodash2.cond = cond;
      lodash2.conforms = conforms;
      lodash2.constant = constant2;
      lodash2.countBy = countBy;
      lodash2.create = create2;
      lodash2.curry = curry;
      lodash2.curryRight = curryRight;
      lodash2.debounce = debounce;
      lodash2.defaults = defaults;
      lodash2.defaultsDeep = defaultsDeep;
      lodash2.defer = defer;
      lodash2.delay = delay;
      lodash2.difference = difference;
      lodash2.differenceBy = differenceBy;
      lodash2.differenceWith = differenceWith;
      lodash2.drop = drop;
      lodash2.dropRight = dropRight;
      lodash2.dropRightWhile = dropRightWhile;
      lodash2.dropWhile = dropWhile;
      lodash2.fill = fill;
      lodash2.filter = filter2;
      lodash2.flatMap = flatMap;
      lodash2.flatMapDeep = flatMapDeep;
      lodash2.flatMapDepth = flatMapDepth;
      lodash2.flatten = flatten2;
      lodash2.flattenDeep = flattenDeep;
      lodash2.flattenDepth = flattenDepth;
      lodash2.flip = flip;
      lodash2.flow = flow;
      lodash2.flowRight = flowRight;
      lodash2.fromPairs = fromPairs;
      lodash2.functions = functions;
      lodash2.functionsIn = functionsIn;
      lodash2.groupBy = groupBy;
      lodash2.initial = initial;
      lodash2.intersection = intersection;
      lodash2.intersectionBy = intersectionBy;
      lodash2.intersectionWith = intersectionWith;
      lodash2.invert = invert;
      lodash2.invertBy = invertBy;
      lodash2.invokeMap = invokeMap;
      lodash2.iteratee = iteratee;
      lodash2.keyBy = keyBy;
      lodash2.keys = keys;
      lodash2.keysIn = keysIn;
      lodash2.map = map2;
      lodash2.mapKeys = mapKeys;
      lodash2.mapValues = mapValues;
      lodash2.matches = matches;
      lodash2.matchesProperty = matchesProperty;
      lodash2.memoize = memoize;
      lodash2.merge = merge2;
      lodash2.mergeWith = mergeWith;
      lodash2.method = method;
      lodash2.methodOf = methodOf;
      lodash2.mixin = mixin;
      lodash2.negate = negate;
      lodash2.nthArg = nthArg;
      lodash2.omit = omit;
      lodash2.omitBy = omitBy;
      lodash2.once = once;
      lodash2.orderBy = orderBy;
      lodash2.over = over;
      lodash2.overArgs = overArgs;
      lodash2.overEvery = overEvery;
      lodash2.overSome = overSome;
      lodash2.partial = partial;
      lodash2.partialRight = partialRight;
      lodash2.partition = partition;
      lodash2.pick = pick;
      lodash2.pickBy = pickBy;
      lodash2.property = property;
      lodash2.propertyOf = propertyOf;
      lodash2.pull = pull;
      lodash2.pullAll = pullAll;
      lodash2.pullAllBy = pullAllBy;
      lodash2.pullAllWith = pullAllWith;
      lodash2.pullAt = pullAt;
      lodash2.range = range2;
      lodash2.rangeRight = rangeRight;
      lodash2.rearg = rearg;
      lodash2.reject = reject;
      lodash2.remove = remove2;
      lodash2.rest = rest;
      lodash2.reverse = reverse;
      lodash2.sampleSize = sampleSize;
      lodash2.set = set2;
      lodash2.setWith = setWith;
      lodash2.shuffle = shuffle;
      lodash2.slice = slice;
      lodash2.sortBy = sortBy;
      lodash2.sortedUniq = sortedUniq;
      lodash2.sortedUniqBy = sortedUniqBy;
      lodash2.split = split;
      lodash2.spread = spread;
      lodash2.tail = tail;
      lodash2.take = take;
      lodash2.takeRight = takeRight;
      lodash2.takeRightWhile = takeRightWhile;
      lodash2.takeWhile = takeWhile;
      lodash2.tap = tap;
      lodash2.throttle = throttle;
      lodash2.thru = thru;
      lodash2.toArray = toArray;
      lodash2.toPairs = toPairs;
      lodash2.toPairsIn = toPairsIn;
      lodash2.toPath = toPath;
      lodash2.toPlainObject = toPlainObject;
      lodash2.transform = transform;
      lodash2.unary = unary;
      lodash2.union = union;
      lodash2.unionBy = unionBy;
      lodash2.unionWith = unionWith;
      lodash2.uniq = uniq;
      lodash2.uniqBy = uniqBy;
      lodash2.uniqWith = uniqWith;
      lodash2.unset = unset;
      lodash2.unzip = unzip;
      lodash2.unzipWith = unzipWith;
      lodash2.update = update;
      lodash2.updateWith = updateWith;
      lodash2.values = values;
      lodash2.valuesIn = valuesIn;
      lodash2.without = without;
      lodash2.words = words;
      lodash2.wrap = wrap;
      lodash2.xor = xor;
      lodash2.xorBy = xorBy;
      lodash2.xorWith = xorWith;
      lodash2.zip = zip;
      lodash2.zipObject = zipObject;
      lodash2.zipObjectDeep = zipObjectDeep;
      lodash2.zipWith = zipWith;
      lodash2.entries = toPairs;
      lodash2.entriesIn = toPairsIn;
      lodash2.extend = assignIn;
      lodash2.extendWith = assignInWith;
      mixin(lodash2, lodash2);
      lodash2.add = add;
      lodash2.attempt = attempt;
      lodash2.camelCase = camelCase;
      lodash2.capitalize = capitalize;
      lodash2.ceil = ceil;
      lodash2.clamp = clamp;
      lodash2.clone = clone;
      lodash2.cloneDeep = cloneDeep;
      lodash2.cloneDeepWith = cloneDeepWith;
      lodash2.cloneWith = cloneWith;
      lodash2.conformsTo = conformsTo;
      lodash2.deburr = deburr;
      lodash2.defaultTo = defaultTo;
      lodash2.divide = divide;
      lodash2.endsWith = endsWith;
      lodash2.eq = eq;
      lodash2.escape = escape;
      lodash2.escapeRegExp = escapeRegExp;
      lodash2.every = every;
      lodash2.find = find2;
      lodash2.findIndex = findIndex;
      lodash2.findKey = findKey;
      lodash2.findLast = findLast;
      lodash2.findLastIndex = findLastIndex;
      lodash2.findLastKey = findLastKey;
      lodash2.floor = floor;
      lodash2.forEach = forEach;
      lodash2.forEachRight = forEachRight;
      lodash2.forIn = forIn;
      lodash2.forInRight = forInRight;
      lodash2.forOwn = forOwn;
      lodash2.forOwnRight = forOwnRight;
      lodash2.get = get2;
      lodash2.gt = gt;
      lodash2.gte = gte;
      lodash2.has = has;
      lodash2.hasIn = hasIn;
      lodash2.head = head;
      lodash2.identity = identity2;
      lodash2.includes = includes;
      lodash2.indexOf = indexOf;
      lodash2.inRange = inRange;
      lodash2.invoke = invoke;
      lodash2.isArguments = isArguments;
      lodash2.isArray = isArray;
      lodash2.isArrayBuffer = isArrayBuffer;
      lodash2.isArrayLike = isArrayLike;
      lodash2.isArrayLikeObject = isArrayLikeObject;
      lodash2.isBoolean = isBoolean;
      lodash2.isBuffer = isBuffer;
      lodash2.isDate = isDate;
      lodash2.isElement = isElement;
      lodash2.isEmpty = isEmpty;
      lodash2.isEqual = isEqual;
      lodash2.isEqualWith = isEqualWith;
      lodash2.isError = isError;
      lodash2.isFinite = isFinite2;
      lodash2.isFunction = isFunction;
      lodash2.isInteger = isInteger;
      lodash2.isLength = isLength;
      lodash2.isMap = isMap;
      lodash2.isMatch = isMatch;
      lodash2.isMatchWith = isMatchWith;
      lodash2.isNaN = isNaN2;
      lodash2.isNative = isNative;
      lodash2.isNil = isNil;
      lodash2.isNull = isNull;
      lodash2.isNumber = isNumber;
      lodash2.isObject = isObject;
      lodash2.isObjectLike = isObjectLike;
      lodash2.isPlainObject = isPlainObject;
      lodash2.isRegExp = isRegExp;
      lodash2.isSafeInteger = isSafeInteger;
      lodash2.isSet = isSet;
      lodash2.isString = isString;
      lodash2.isSymbol = isSymbol;
      lodash2.isTypedArray = isTypedArray;
      lodash2.isUndefined = isUndefined;
      lodash2.isWeakMap = isWeakMap;
      lodash2.isWeakSet = isWeakSet;
      lodash2.join = join;
      lodash2.kebabCase = kebabCase;
      lodash2.last = last;
      lodash2.lastIndexOf = lastIndexOf;
      lodash2.lowerCase = lowerCase;
      lodash2.lowerFirst = lowerFirst;
      lodash2.lt = lt;
      lodash2.lte = lte;
      lodash2.max = max2;
      lodash2.maxBy = maxBy;
      lodash2.mean = mean2;
      lodash2.meanBy = meanBy;
      lodash2.min = min2;
      lodash2.minBy = minBy;
      lodash2.stubArray = stubArray;
      lodash2.stubFalse = stubFalse;
      lodash2.stubObject = stubObject;
      lodash2.stubString = stubString;
      lodash2.stubTrue = stubTrue;
      lodash2.multiply = multiply;
      lodash2.nth = nth;
      lodash2.noConflict = noConflict;
      lodash2.noop = noop2;
      lodash2.now = now2;
      lodash2.pad = pad;
      lodash2.padEnd = padEnd;
      lodash2.padStart = padStart;
      lodash2.parseInt = parseInt2;
      lodash2.random = random;
      lodash2.reduce = reduce;
      lodash2.reduceRight = reduceRight;
      lodash2.repeat = repeat;
      lodash2.replace = replace;
      lodash2.result = result;
      lodash2.round = round;
      lodash2.runInContext = runInContext2;
      lodash2.sample = sample;
      lodash2.size = size;
      lodash2.snakeCase = snakeCase;
      lodash2.some = some;
      lodash2.sortedIndex = sortedIndex;
      lodash2.sortedIndexBy = sortedIndexBy;
      lodash2.sortedIndexOf = sortedIndexOf;
      lodash2.sortedLastIndex = sortedLastIndex;
      lodash2.sortedLastIndexBy = sortedLastIndexBy;
      lodash2.sortedLastIndexOf = sortedLastIndexOf;
      lodash2.startCase = startCase;
      lodash2.startsWith = startsWith;
      lodash2.subtract = subtract;
      lodash2.sum = sum2;
      lodash2.sumBy = sumBy;
      lodash2.template = template;
      lodash2.times = times;
      lodash2.toFinite = toFinite;
      lodash2.toInteger = toInteger;
      lodash2.toLength = toLength;
      lodash2.toLower = toLower;
      lodash2.toNumber = toNumber;
      lodash2.toSafeInteger = toSafeInteger;
      lodash2.toString = toString;
      lodash2.toUpper = toUpper;
      lodash2.trim = trim;
      lodash2.trimEnd = trimEnd;
      lodash2.trimStart = trimStart;
      lodash2.truncate = truncate;
      lodash2.unescape = unescape;
      lodash2.uniqueId = uniqueId;
      lodash2.upperCase = upperCase;
      lodash2.upperFirst = upperFirst;
      lodash2.each = forEach;
      lodash2.eachRight = forEachRight;
      lodash2.first = head;
      mixin(lodash2, function() {
        var source = {};
        baseForOwn(lodash2, function(func, methodName) {
          if (!hasOwnProperty.call(lodash2.prototype, methodName)) {
            source[methodName] = func;
          }
        });
        return source;
      }(), { "chain": false });
      lodash2.VERSION = VERSION;
      arrayEach(["bind", "bindKey", "curry", "curryRight", "partial", "partialRight"], function(methodName) {
        lodash2[methodName].placeholder = lodash2;
      });
      arrayEach(["drop", "take"], function(methodName, index) {
        LazyWrapper.prototype[methodName] = function(n) {
          n = n === undefined$1 ? 1 : nativeMax(toInteger(n), 0);
          var result2 = this.__filtered__ && !index ? new LazyWrapper(this) : this.clone();
          if (result2.__filtered__) {
            result2.__takeCount__ = nativeMin(n, result2.__takeCount__);
          } else {
            result2.__views__.push({
              "size": nativeMin(n, MAX_ARRAY_LENGTH),
              "type": methodName + (result2.__dir__ < 0 ? "Right" : "")
            });
          }
          return result2;
        };
        LazyWrapper.prototype[methodName + "Right"] = function(n) {
          return this.reverse()[methodName](n).reverse();
        };
      });
      arrayEach(["filter", "map", "takeWhile"], function(methodName, index) {
        var type = index + 1, isFilter = type == LAZY_FILTER_FLAG || type == LAZY_WHILE_FLAG;
        LazyWrapper.prototype[methodName] = function(iteratee2) {
          var result2 = this.clone();
          result2.__iteratees__.push({
            "iteratee": getIteratee(iteratee2, 3),
            "type": type
          });
          result2.__filtered__ = result2.__filtered__ || isFilter;
          return result2;
        };
      });
      arrayEach(["head", "last"], function(methodName, index) {
        var takeName = "take" + (index ? "Right" : "");
        LazyWrapper.prototype[methodName] = function() {
          return this[takeName](1).value()[0];
        };
      });
      arrayEach(["initial", "tail"], function(methodName, index) {
        var dropName = "drop" + (index ? "" : "Right");
        LazyWrapper.prototype[methodName] = function() {
          return this.__filtered__ ? new LazyWrapper(this) : this[dropName](1);
        };
      });
      LazyWrapper.prototype.compact = function() {
        return this.filter(identity2);
      };
      LazyWrapper.prototype.find = function(predicate) {
        return this.filter(predicate).head();
      };
      LazyWrapper.prototype.findLast = function(predicate) {
        return this.reverse().find(predicate);
      };
      LazyWrapper.prototype.invokeMap = baseRest(function(path, args) {
        if (typeof path == "function") {
          return new LazyWrapper(this);
        }
        return this.map(function(value) {
          return baseInvoke(value, path, args);
        });
      });
      LazyWrapper.prototype.reject = function(predicate) {
        return this.filter(negate(getIteratee(predicate)));
      };
      LazyWrapper.prototype.slice = function(start2, end) {
        start2 = toInteger(start2);
        var result2 = this;
        if (result2.__filtered__ && (start2 > 0 || end < 0)) {
          return new LazyWrapper(result2);
        }
        if (start2 < 0) {
          result2 = result2.takeRight(-start2);
        } else if (start2) {
          result2 = result2.drop(start2);
        }
        if (end !== undefined$1) {
          end = toInteger(end);
          result2 = end < 0 ? result2.dropRight(-end) : result2.take(end - start2);
        }
        return result2;
      };
      LazyWrapper.prototype.takeRightWhile = function(predicate) {
        return this.reverse().takeWhile(predicate).reverse();
      };
      LazyWrapper.prototype.toArray = function() {
        return this.take(MAX_ARRAY_LENGTH);
      };
      baseForOwn(LazyWrapper.prototype, function(func, methodName) {
        var checkIteratee = /^(?:filter|find|map|reject)|While$/.test(methodName), isTaker = /^(?:head|last)$/.test(methodName), lodashFunc = lodash2[isTaker ? "take" + (methodName == "last" ? "Right" : "") : methodName], retUnwrapped = isTaker || /^find/.test(methodName);
        if (!lodashFunc) {
          return;
        }
        lodash2.prototype[methodName] = function() {
          var value = this.__wrapped__, args = isTaker ? [1] : arguments, isLazy = value instanceof LazyWrapper, iteratee2 = args[0], useLazy = isLazy || isArray(value);
          var interceptor = function(value2) {
            var result3 = lodashFunc.apply(lodash2, arrayPush([value2], args));
            return isTaker && chainAll ? result3[0] : result3;
          };
          if (useLazy && checkIteratee && typeof iteratee2 == "function" && iteratee2.length != 1) {
            isLazy = useLazy = false;
          }
          var chainAll = this.__chain__, isHybrid = !!this.__actions__.length, isUnwrapped = retUnwrapped && !chainAll, onlyLazy = isLazy && !isHybrid;
          if (!retUnwrapped && useLazy) {
            value = onlyLazy ? value : new LazyWrapper(this);
            var result2 = func.apply(value, args);
            result2.__actions__.push({ "func": thru, "args": [interceptor], "thisArg": undefined$1 });
            return new LodashWrapper(result2, chainAll);
          }
          if (isUnwrapped && onlyLazy) {
            return func.apply(this, args);
          }
          result2 = this.thru(interceptor);
          return isUnwrapped ? isTaker ? result2.value()[0] : result2.value() : result2;
        };
      });
      arrayEach(["pop", "push", "shift", "sort", "splice", "unshift"], function(methodName) {
        var func = arrayProto[methodName], chainName = /^(?:push|sort|unshift)$/.test(methodName) ? "tap" : "thru", retUnwrapped = /^(?:pop|shift)$/.test(methodName);
        lodash2.prototype[methodName] = function() {
          var args = arguments;
          if (retUnwrapped && !this.__chain__) {
            var value = this.value();
            return func.apply(isArray(value) ? value : [], args);
          }
          return this[chainName](function(value2) {
            return func.apply(isArray(value2) ? value2 : [], args);
          });
        };
      });
      baseForOwn(LazyWrapper.prototype, function(func, methodName) {
        var lodashFunc = lodash2[methodName];
        if (lodashFunc) {
          var key = lodashFunc.name + "";
          if (!hasOwnProperty.call(realNames, key)) {
            realNames[key] = [];
          }
          realNames[key].push({ "name": methodName, "func": lodashFunc });
        }
      });
      realNames[createHybrid(undefined$1, WRAP_BIND_KEY_FLAG).name] = [{
        "name": "wrapper",
        "func": undefined$1
      }];
      LazyWrapper.prototype.clone = lazyClone;
      LazyWrapper.prototype.reverse = lazyReverse;
      LazyWrapper.prototype.value = lazyValue;
      lodash2.prototype.at = wrapperAt;
      lodash2.prototype.chain = wrapperChain;
      lodash2.prototype.commit = wrapperCommit;
      lodash2.prototype.next = wrapperNext;
      lodash2.prototype.plant = wrapperPlant;
      lodash2.prototype.reverse = wrapperReverse;
      lodash2.prototype.toJSON = lodash2.prototype.valueOf = lodash2.prototype.value = wrapperValue;
      lodash2.prototype.first = lodash2.prototype.head;
      if (symIterator) {
        lodash2.prototype[symIterator] = wrapperToIterator;
      }
      return lodash2;
    };
    var _ = runInContext();
    if (freeModule) {
      (freeModule.exports = _)._ = _;
      freeExports._ = _;
    } else {
      root2._ = _;
    }
  }).call(commonjsGlobal);
})(lodash, lodashExports);
const scales = {
  sqrt,
  log,
  linear,
  literal: identity
};
class Aesthetic {
  constructor(scatterplot, regl2, dataset, aesthetic_map) {
    this._transform = "linear";
    this.field = null;
    this._texture_buffer = null;
    this.partner = null;
    this._textures = {};
    this.current_encoding = null;
    this.aesthetic_map = aesthetic_map;
    if (this.aesthetic_map === void 0) {
      throw new Error("Aesthetic map is undefined");
    }
    this.scatterplot = scatterplot;
    this.regl = regl2;
    this._range = [0, 1];
    this.dataset = dataset;
    this.id = Math.random().toString();
  }
  apply(point) {
    if (this.scale === void 0) {
      return this.default_constant;
    }
    return this.scale(this.value_for(point));
  }
  get transform() {
    if (this._transform)
      return this._transform;
    return this.default_transform;
  }
  set transform(transform) {
    this._transform = transform;
  }
  get scale() {
    if (this._scale) {
      return this._scale;
    }
    if (this.is_dictionary()) {
      throw new Error("Dictionary scales only supported for colors");
    }
    const scale = scales[this.transform]();
    scale.domain(this.domain).range(this.range);
    return this._scale = scale;
  }
  get column() {
    var _a, _b;
    if (this.field === null) {
      throw new Error("Can't retrieve column for aesthetic without a field");
    }
    if ((_b = (_a = this.dataset) == null ? void 0 : _a.root_tile) == null ? void 0 : _b.record_batch) {
      const col = this.dataset.root_tile.record_batch.getChild(this.field);
      if (col === void 0 || col === null) {
        throw new Error("Can't find column " + this.field);
      }
      return col;
    }
    throw new Error("Table is null");
  }
  get default_domain() {
    var _a;
    if (this.field == void 0) {
      return [1, 1];
    }
    if (!this.scatterplot._root._schema) {
      return [1, 1];
    }
    const { column } = this;
    if (!column) {
      return [1, 1];
    }
    if (((_a = column.type) == null ? void 0 : _a.dictionary) !== void 0) {
      return [0, this.aesthetic_map.texture_size];
    }
    this.dataset.domain(this.field);
    return this.dataset.domain(this.field);
  }
  default_data() {
    const def = this.toGLType(this.default_constant);
    return Array(this.aesthetic_map.texture_size).fill(
      def
    );
  }
  get webGLDomain() {
    if (this.is_dictionary()) {
      return [0, 4096];
    }
    return this.domain;
  }
  get domain() {
    if (this._domain === void 0) {
      this._domain = this.default_domain;
    }
    return this._domain || this.default_domain;
  }
  get range() {
    return this._range || this.default_range;
  }
  value_for(point) {
    if (this.field && point[this.field]) {
      return point[this.field];
    }
    return null;
  }
  get map_position() {
    if (this.use_map_on_regl === 0) {
      return 0;
    }
    return this.aesthetic_map.get_position(this.id);
  }
  get texture_buffer() {
    if (this._texture_buffer) {
      return this._texture_buffer;
    }
    this._texture_buffer = new Float32Array(this.aesthetic_map.texture_size);
    this._texture_buffer.set(this.default_data());
    return this._texture_buffer;
  }
  post_to_regl_buffer() {
    this.aesthetic_map.set_one_d(this.id, this.texture_buffer);
  }
  convert_string_encoding(channel) {
    const v = {
      field: channel,
      domain: this.default_domain,
      range: this.default_range
    };
    return v;
  }
  complete_domain(encoding) {
    encoding.domain = encoding.domain || this.default_domain;
    return encoding;
  }
  reset_to_defaults() {
    this._domain = this.default_domain;
    this._range = [0, 1];
    this._transform = void 0;
    this._constant = this.default_constant;
    this.field = null;
    this.current_encoding = null;
    this._scale = void 0;
  }
  update(encoding) {
    var _a;
    if (encoding === void 0) {
      console.warn("Should never be calling update with undefined.");
      return;
    }
    if (encoding === null || encoding === "null") {
      this.current_encoding = null;
      this.reset_to_defaults();
      return;
    }
    this._scale = void 0;
    if (typeof encoding === "string") {
      encoding = this.convert_string_encoding(encoding);
    }
    if (lodashExports.isNumber(encoding)) {
      const x = {
        constant: encoding
      };
      this.current_encoding = x;
      return;
    }
    if (Object.keys(encoding).length === 0) {
      console.warn(
        "Resetting parameters with an empty object is deprecated: use 'null'"
      );
      this.reset_to_defaults();
      return;
    }
    this.current_encoding = encoding;
    if (isConstantChannel(encoding)) {
      return;
    }
    this.field = encoding.field;
    if (isOpChannel(encoding)) {
      return;
    }
    if (isLambdaChannel(encoding)) {
      const { lambda, field } = encoding;
      if (lambda) {
        this.apply_function_for_textures(field, this.domain, lambda);
        this.post_to_regl_buffer();
      }
      return;
    }
    if (encoding["domain"] === void 0) {
      encoding["domain"] = this.default_domain;
    }
    if (encoding["range"]) {
      this._domain = encoding.domain;
      this._range = encoding.range;
    }
    this._transform = (_a = encoding.transform) != null ? _a : void 0;
  }
  encode_for_textures(range2) {
    const { texture_size } = this.aesthetic_map;
    const values = Array(texture_size);
    const scale = scales[this.transform]().range(range2).domain([0, texture_size - 1]);
    for (let i = 0; i < texture_size; i += 1) {
      values[i] = scale(i);
    }
  }
  arrow_column() {
    if (this.field === null) {
      throw new Error("Can't retrieve column for aesthetic without a field");
    }
    const c2 = this.dataset.root_tile.record_batch.getChild(this.field);
    if (c2 === null) {
      throw new Error(`No column ${this.field} on arrow table for aesthetic`);
    }
    return c2;
  }
  is_dictionary() {
    var _a, _b;
    if (this.field === null || this.field === void 0) {
      return false;
    }
    if (((_b = (_a = this.arrow_column()) == null ? void 0 : _a.type) == null ? void 0 : _b.dictionary) !== void 0)
      return true;
    return false;
  }
  get constant() {
    if (this.current_encoding !== null && isConstantChannel(this.current_encoding)) {
      return this.toGLType(this.current_encoding.constant);
    }
    return this.toGLType(this.default_constant);
  }
  get use_map_on_regl() {
    if (this.is_dictionary()) {
      return 1;
    }
    return 0;
  }
  materialize_function(raw_func) {
    const func = typeof raw_func === "string" ? lambda_to_function(parseLambdaString(raw_func)) : raw_func;
    this._func = func;
    return func;
  }
  apply_function_for_textures(field, range$1, raw_func) {
    var _a;
    const { texture_size } = this.aesthetic_map;
    const func = this.materialize_function(raw_func);
    let input = range(texture_size);
    if (field === void 0 || this.dataset.root_tile.record_batch === void 0) {
      if (field === void 0) {
        console.warn("SETTING EMPTY FIELD");
      }
      if (this.dataset.root_tile.record_batch === void 0) {
        console.warn("SETTING EMPTY TABLE");
      }
      this.texture_buffer.set(range(texture_size).map((i) => 1));
      return;
    }
    const { column } = this;
    if (!column) {
      throw new Error(`Column ${field} does not exist on table.`);
    }
    if ((_a = column == null ? void 0 : column.type) == null ? void 0 : _a.dictionary) {
      input.fill("");
      const dvals = column.data[0].dictionary.toArray();
      for (const [i, d] of dvals.entries()) {
        input[i] = d;
      }
    } else {
      input = input.map((d) => this.scale(d));
    }
    const values = input.map((i) => func(i));
    this.texture_buffer.set(values);
  }
}
class OneDAesthetic extends Aesthetic {
  constructor(scatterplot, regl2, dataset, aesthetic_map) {
    super(scatterplot, regl2, dataset, aesthetic_map);
    this.current_encoding = null;
  }
  toGLType(a) {
    return a;
  }
  static get_default_domain() {
    return [0, 1];
  }
  get default_domain() {
    return [0, 1];
  }
}
class Size extends OneDAesthetic {
  constructor() {
    super(...arguments);
    this._constant = 1;
    this.default_constant = 1;
    this.default_transform = "sqrt";
  }
  static get default_constant() {
    return 1.5;
  }
  get default_range() {
    return [0, 1];
  }
}
class PositionalAesthetic extends OneDAesthetic {
  constructor(scatterplot, regl2, tile, map2) {
    super(scatterplot, regl2, tile, map2);
    this.default_range = [-1, 1];
    this.default_constant = 0;
    this.default_transform = "literal";
    this._constant = 0;
    this._transform = "literal";
  }
  get range() {
    if (this._range) {
      return this._range;
    }
    if (this.dataset.extent && this.field && this.dataset.extent[this.field])
      return this.dataset.extent[this.field];
    return this.default_range;
  }
  static get default_constant() {
    return 0;
  }
}
class X extends PositionalAesthetic {
  constructor() {
    super(...arguments);
    this.field = "x";
  }
}
class X0 extends X {
}
class Y extends PositionalAesthetic {
  constructor() {
    super(...arguments);
    this.field = "y";
  }
}
class Y0 extends Y {
}
class BooleanAesthetic extends Aesthetic {
  constructor(scatterplot, regl2, tile, map2) {
    super(scatterplot, regl2, tile, map2);
  }
  toGLType(a) {
    return a ? 1 : 0;
  }
  update(encoding) {
    super.update(encoding);
    if (this.current_encoding !== null && Object.keys(this.current_encoding).length === 0) {
      this.current_encoding = null;
    }
  }
  ops_to_array() {
    const input = this.current_encoding;
    if (input === null)
      return [0, 0, 0];
    if (input === void 0)
      return [0, 0, 0];
    if (!isOpChannel(input)) {
      return [0, 0, 0];
    }
    if (input.op === "within") {
      return [4, input.a, input.b];
    }
    if (input.op === "between") {
      return [4, (input.b - input.a) / 2, (input.b + input.a) / 2];
    }
    const val = [
      // Encoding of op as number.
      [null, "lt", "gt", "eq"].indexOf(input.op),
      input.a,
      0
    ];
    return val;
  }
  apply(point) {
    const channel = this.current_encoding;
    if (channel === null || channel === void 0) {
      return true;
    }
    if (isOpChannel(channel)) {
      return this.apply_op(point, channel);
    }
    if (isConstantChannel(channel)) {
      if (channel.constant === 0) {
        console.warn("Deprecated: pass `true` or `false` to boolean fields, not numbers");
        return false;
      }
      if (channel.constant === 1) {
        console.warn("Deprecated: pass `true` or `false` to boolean fields, not numbers");
        return true;
      }
      return channel.constant;
    }
    if (isLambdaChannel(channel)) {
      if (this._func === void 0) {
        throw new Error(
          "_func should have been bound" + JSON.stringify(this.current_encoding)
        );
      }
      const val = this.value_for(point);
      if (val === null) {
        return false;
      } else {
        return !!this._func(val);
      }
    }
    return true;
  }
  apply_op(point, channel) {
    const { op, a } = channel;
    const p = this.value_for(point);
    if (p === null) {
      return false;
    }
    if (op === "eq") {
      return p == a;
    } else if (op === "gt") {
      return p > a;
    } else if (op === "lt") {
      return p < a;
    } else if (op === "within") {
      return Math.abs(p - channel.b) < a;
    } else if (op === "between") {
      const mid = (channel.a + channel.b) / 2;
      const diff = Math.abs(channel.a - channel.b) / 2;
      return Math.abs(p - mid) < diff;
    }
    return false;
  }
  get default_domain() {
    return [0, 1];
  }
}
class Foreground extends BooleanAesthetic {
  constructor() {
    super(...arguments);
    this.current_encoding = null;
    this._constant = true;
    this.default_constant = true;
    this.default_range = [0, 1];
    this.default_transform = "literal";
  }
  get active() {
    if (this.current_encoding === null || isConstantChannel(this.current_encoding)) {
      return false;
    }
    return true;
  }
}
class Filter extends BooleanAesthetic {
  constructor() {
    super(...arguments);
    this.current_encoding = null;
    this._constant = true;
    this.default_constant = true;
    this.default_transform = "literal";
    this.default_range = [0, 1];
  }
}
class Jitter_speed extends OneDAesthetic {
  constructor() {
    super(...arguments);
    this.default_transform = "linear";
    this.default_range = [0, 1];
    this.default_constant = 0.5;
    this._constant = 0;
  }
}
function encode_jitter_to_int(jitter) {
  if (jitter === "spiral") {
    return 1;
  }
  if (jitter === "uniform") {
    return 2;
  }
  if (jitter === "normal") {
    return 3;
  }
  if (jitter === "circle") {
    return 4;
  }
  if (jitter === "time") {
    return 5;
  }
  return 0;
}
class Jitter_radius extends Aesthetic {
  constructor() {
    super(...arguments);
    this._constant = 0;
    this.jitter_int_formatted = 0;
    this.default_transform = "linear";
    this._method = "None";
  }
  toGLType(a) {
    return a;
  }
  get default_constant() {
    return 0;
  }
  get default_range() {
    return [0, 1];
  }
  get method() {
    var _a, _b;
    return (_b = (_a = this.current_encoding) == null ? void 0 : _a.method) != null ? _b : "None";
  }
  set method(value) {
    this._method = value;
  }
  get jitter_int_format() {
    return encode_jitter_to_int(this.method);
  }
}
function parseLambdaString(lambdastring) {
  let [field, lambda] = lambdastring.split("=>").map((d) => d.trim());
  if (lambda === void 0) {
    throw new Error(`Couldn't parse ${lambdastring} into a function`);
  }
  if (lambda.slice(0, 1) !== "{" && lambda.slice(0, 6) !== "return") {
    lambda = `return ${lambda}`;
  }
  const func = `${field} => ${lambda}`;
  return {
    field,
    lambda: func
  };
}
function lambda_to_function(input) {
  if (typeof input.lambda === "function") {
    throw "Must pass a string to lambda, not a function.";
  }
  const { lambda, field } = input;
  if (field === void 0) {
    throw "Must pass a field to lambda.";
  }
  const cleaned = parseLambdaString(lambda).lambda;
  const [arg, code] = cleaned.split("=>", 2).map((d) => d.trim());
  const func = new Function(arg, code);
  return func;
}
function colors(specifier) {
  var n = specifier.length / 6 | 0, colors2 = new Array(n), i = 0;
  while (i < n)
    colors2[i] = "#" + specifier.slice(i * 6, ++i * 6);
  return colors2;
}
const category10 = colors("1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf");
const Accent = colors("7fc97fbeaed4fdc086ffff99386cb0f0027fbf5b17666666");
const Dark2 = colors("1b9e77d95f027570b3e7298a66a61ee6ab02a6761d666666");
const Paired = colors("a6cee31f78b4b2df8a33a02cfb9a99e31a1cfdbf6fff7f00cab2d66a3d9affff99b15928");
const Pastel1 = colors("fbb4aeb3cde3ccebc5decbe4fed9a6ffffcce5d8bdfddaecf2f2f2");
const Pastel2 = colors("b3e2cdfdcdaccbd5e8f4cae4e6f5c9fff2aef1e2cccccccc");
const Set1 = colors("e41a1c377eb84daf4a984ea3ff7f00ffff33a65628f781bf999999");
const Set2 = colors("66c2a5fc8d628da0cbe78ac3a6d854ffd92fe5c494b3b3b3");
const Set3 = colors("8dd3c7ffffb3bebadafb807280b1d3fdb462b3de69fccde5d9d9d9bc80bdccebc5ffed6f");
const Tableau10 = colors("4e79a7f28e2ce1575976b7b259a14fedc949af7aa1ff9da79c755fbab0ab");
const ramp$1 = (scheme2) => rgbBasis(scheme2[scheme2.length - 1]);
var scheme$q = new Array(3).concat(
  "d8b365f5f5f55ab4ac",
  "a6611adfc27d80cdc1018571",
  "a6611adfc27df5f5f580cdc1018571",
  "8c510ad8b365f6e8c3c7eae55ab4ac01665e",
  "8c510ad8b365f6e8c3f5f5f5c7eae55ab4ac01665e",
  "8c510abf812ddfc27df6e8c3c7eae580cdc135978f01665e",
  "8c510abf812ddfc27df6e8c3f5f5f5c7eae580cdc135978f01665e",
  "5430058c510abf812ddfc27df6e8c3c7eae580cdc135978f01665e003c30",
  "5430058c510abf812ddfc27df6e8c3f5f5f5c7eae580cdc135978f01665e003c30"
).map(colors);
const BrBG = ramp$1(scheme$q);
var scheme$p = new Array(3).concat(
  "af8dc3f7f7f77fbf7b",
  "7b3294c2a5cfa6dba0008837",
  "7b3294c2a5cff7f7f7a6dba0008837",
  "762a83af8dc3e7d4e8d9f0d37fbf7b1b7837",
  "762a83af8dc3e7d4e8f7f7f7d9f0d37fbf7b1b7837",
  "762a839970abc2a5cfe7d4e8d9f0d3a6dba05aae611b7837",
  "762a839970abc2a5cfe7d4e8f7f7f7d9f0d3a6dba05aae611b7837",
  "40004b762a839970abc2a5cfe7d4e8d9f0d3a6dba05aae611b783700441b",
  "40004b762a839970abc2a5cfe7d4e8f7f7f7d9f0d3a6dba05aae611b783700441b"
).map(colors);
const PRGn = ramp$1(scheme$p);
var scheme$o = new Array(3).concat(
  "e9a3c9f7f7f7a1d76a",
  "d01c8bf1b6dab8e1864dac26",
  "d01c8bf1b6daf7f7f7b8e1864dac26",
  "c51b7de9a3c9fde0efe6f5d0a1d76a4d9221",
  "c51b7de9a3c9fde0eff7f7f7e6f5d0a1d76a4d9221",
  "c51b7dde77aef1b6dafde0efe6f5d0b8e1867fbc414d9221",
  "c51b7dde77aef1b6dafde0eff7f7f7e6f5d0b8e1867fbc414d9221",
  "8e0152c51b7dde77aef1b6dafde0efe6f5d0b8e1867fbc414d9221276419",
  "8e0152c51b7dde77aef1b6dafde0eff7f7f7e6f5d0b8e1867fbc414d9221276419"
).map(colors);
const PiYG = ramp$1(scheme$o);
var scheme$n = new Array(3).concat(
  "998ec3f7f7f7f1a340",
  "5e3c99b2abd2fdb863e66101",
  "5e3c99b2abd2f7f7f7fdb863e66101",
  "542788998ec3d8daebfee0b6f1a340b35806",
  "542788998ec3d8daebf7f7f7fee0b6f1a340b35806",
  "5427888073acb2abd2d8daebfee0b6fdb863e08214b35806",
  "5427888073acb2abd2d8daebf7f7f7fee0b6fdb863e08214b35806",
  "2d004b5427888073acb2abd2d8daebfee0b6fdb863e08214b358067f3b08",
  "2d004b5427888073acb2abd2d8daebf7f7f7fee0b6fdb863e08214b358067f3b08"
).map(colors);
const PuOr = ramp$1(scheme$n);
var scheme$m = new Array(3).concat(
  "ef8a62f7f7f767a9cf",
  "ca0020f4a58292c5de0571b0",
  "ca0020f4a582f7f7f792c5de0571b0",
  "b2182bef8a62fddbc7d1e5f067a9cf2166ac",
  "b2182bef8a62fddbc7f7f7f7d1e5f067a9cf2166ac",
  "b2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac",
  "b2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac",
  "67001fb2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac053061",
  "67001fb2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac053061"
).map(colors);
const RdBu = ramp$1(scheme$m);
var scheme$l = new Array(3).concat(
  "ef8a62ffffff999999",
  "ca0020f4a582bababa404040",
  "ca0020f4a582ffffffbababa404040",
  "b2182bef8a62fddbc7e0e0e09999994d4d4d",
  "b2182bef8a62fddbc7ffffffe0e0e09999994d4d4d",
  "b2182bd6604df4a582fddbc7e0e0e0bababa8787874d4d4d",
  "b2182bd6604df4a582fddbc7ffffffe0e0e0bababa8787874d4d4d",
  "67001fb2182bd6604df4a582fddbc7e0e0e0bababa8787874d4d4d1a1a1a",
  "67001fb2182bd6604df4a582fddbc7ffffffe0e0e0bababa8787874d4d4d1a1a1a"
).map(colors);
const RdGy = ramp$1(scheme$l);
var scheme$k = new Array(3).concat(
  "fc8d59ffffbf91bfdb",
  "d7191cfdae61abd9e92c7bb6",
  "d7191cfdae61ffffbfabd9e92c7bb6",
  "d73027fc8d59fee090e0f3f891bfdb4575b4",
  "d73027fc8d59fee090ffffbfe0f3f891bfdb4575b4",
  "d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4",
  "d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4",
  "a50026d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4313695",
  "a50026d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4313695"
).map(colors);
const RdYlBu = ramp$1(scheme$k);
var scheme$j = new Array(3).concat(
  "fc8d59ffffbf91cf60",
  "d7191cfdae61a6d96a1a9641",
  "d7191cfdae61ffffbfa6d96a1a9641",
  "d73027fc8d59fee08bd9ef8b91cf601a9850",
  "d73027fc8d59fee08bffffbfd9ef8b91cf601a9850",
  "d73027f46d43fdae61fee08bd9ef8ba6d96a66bd631a9850",
  "d73027f46d43fdae61fee08bffffbfd9ef8ba6d96a66bd631a9850",
  "a50026d73027f46d43fdae61fee08bd9ef8ba6d96a66bd631a9850006837",
  "a50026d73027f46d43fdae61fee08bffffbfd9ef8ba6d96a66bd631a9850006837"
).map(colors);
const RdYlGn = ramp$1(scheme$j);
var scheme$i = new Array(3).concat(
  "fc8d59ffffbf99d594",
  "d7191cfdae61abdda42b83ba",
  "d7191cfdae61ffffbfabdda42b83ba",
  "d53e4ffc8d59fee08be6f59899d5943288bd",
  "d53e4ffc8d59fee08bffffbfe6f59899d5943288bd",
  "d53e4ff46d43fdae61fee08be6f598abdda466c2a53288bd",
  "d53e4ff46d43fdae61fee08bffffbfe6f598abdda466c2a53288bd",
  "9e0142d53e4ff46d43fdae61fee08be6f598abdda466c2a53288bd5e4fa2",
  "9e0142d53e4ff46d43fdae61fee08bffffbfe6f598abdda466c2a53288bd5e4fa2"
).map(colors);
const Spectral = ramp$1(scheme$i);
var scheme$h = new Array(3).concat(
  "e5f5f999d8c92ca25f",
  "edf8fbb2e2e266c2a4238b45",
  "edf8fbb2e2e266c2a42ca25f006d2c",
  "edf8fbccece699d8c966c2a42ca25f006d2c",
  "edf8fbccece699d8c966c2a441ae76238b45005824",
  "f7fcfde5f5f9ccece699d8c966c2a441ae76238b45005824",
  "f7fcfde5f5f9ccece699d8c966c2a441ae76238b45006d2c00441b"
).map(colors);
const BuGn = ramp$1(scheme$h);
var scheme$g = new Array(3).concat(
  "e0ecf49ebcda8856a7",
  "edf8fbb3cde38c96c688419d",
  "edf8fbb3cde38c96c68856a7810f7c",
  "edf8fbbfd3e69ebcda8c96c68856a7810f7c",
  "edf8fbbfd3e69ebcda8c96c68c6bb188419d6e016b",
  "f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d6e016b",
  "f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d810f7c4d004b"
).map(colors);
const BuPu = ramp$1(scheme$g);
var scheme$f = new Array(3).concat(
  "e0f3dba8ddb543a2ca",
  "f0f9e8bae4bc7bccc42b8cbe",
  "f0f9e8bae4bc7bccc443a2ca0868ac",
  "f0f9e8ccebc5a8ddb57bccc443a2ca0868ac",
  "f0f9e8ccebc5a8ddb57bccc44eb3d32b8cbe08589e",
  "f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe08589e",
  "f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe0868ac084081"
).map(colors);
const GnBu = ramp$1(scheme$f);
var scheme$e = new Array(3).concat(
  "fee8c8fdbb84e34a33",
  "fef0d9fdcc8afc8d59d7301f",
  "fef0d9fdcc8afc8d59e34a33b30000",
  "fef0d9fdd49efdbb84fc8d59e34a33b30000",
  "fef0d9fdd49efdbb84fc8d59ef6548d7301f990000",
  "fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301f990000",
  "fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301fb300007f0000"
).map(colors);
const OrRd = ramp$1(scheme$e);
var scheme$d = new Array(3).concat(
  "ece2f0a6bddb1c9099",
  "f6eff7bdc9e167a9cf02818a",
  "f6eff7bdc9e167a9cf1c9099016c59",
  "f6eff7d0d1e6a6bddb67a9cf1c9099016c59",
  "f6eff7d0d1e6a6bddb67a9cf3690c002818a016450",
  "fff7fbece2f0d0d1e6a6bddb67a9cf3690c002818a016450",
  "fff7fbece2f0d0d1e6a6bddb67a9cf3690c002818a016c59014636"
).map(colors);
const PuBuGn = ramp$1(scheme$d);
var scheme$c = new Array(3).concat(
  "ece7f2a6bddb2b8cbe",
  "f1eef6bdc9e174a9cf0570b0",
  "f1eef6bdc9e174a9cf2b8cbe045a8d",
  "f1eef6d0d1e6a6bddb74a9cf2b8cbe045a8d",
  "f1eef6d0d1e6a6bddb74a9cf3690c00570b0034e7b",
  "fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0034e7b",
  "fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0045a8d023858"
).map(colors);
const PuBu = ramp$1(scheme$c);
var scheme$b = new Array(3).concat(
  "e7e1efc994c7dd1c77",
  "f1eef6d7b5d8df65b0ce1256",
  "f1eef6d7b5d8df65b0dd1c77980043",
  "f1eef6d4b9dac994c7df65b0dd1c77980043",
  "f1eef6d4b9dac994c7df65b0e7298ace125691003f",
  "f7f4f9e7e1efd4b9dac994c7df65b0e7298ace125691003f",
  "f7f4f9e7e1efd4b9dac994c7df65b0e7298ace125698004367001f"
).map(colors);
const PuRd = ramp$1(scheme$b);
var scheme$a = new Array(3).concat(
  "fde0ddfa9fb5c51b8a",
  "feebe2fbb4b9f768a1ae017e",
  "feebe2fbb4b9f768a1c51b8a7a0177",
  "feebe2fcc5c0fa9fb5f768a1c51b8a7a0177",
  "feebe2fcc5c0fa9fb5f768a1dd3497ae017e7a0177",
  "fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a0177",
  "fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a017749006a"
).map(colors);
const RdPu = ramp$1(scheme$a);
var scheme$9 = new Array(3).concat(
  "edf8b17fcdbb2c7fb8",
  "ffffcca1dab441b6c4225ea8",
  "ffffcca1dab441b6c42c7fb8253494",
  "ffffccc7e9b47fcdbb41b6c42c7fb8253494",
  "ffffccc7e9b47fcdbb41b6c41d91c0225ea80c2c84",
  "ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea80c2c84",
  "ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea8253494081d58"
).map(colors);
const YlGnBu = ramp$1(scheme$9);
var scheme$8 = new Array(3).concat(
  "f7fcb9addd8e31a354",
  "ffffccc2e69978c679238443",
  "ffffccc2e69978c67931a354006837",
  "ffffccd9f0a3addd8e78c67931a354006837",
  "ffffccd9f0a3addd8e78c67941ab5d238443005a32",
  "ffffe5f7fcb9d9f0a3addd8e78c67941ab5d238443005a32",
  "ffffe5f7fcb9d9f0a3addd8e78c67941ab5d238443006837004529"
).map(colors);
const YlGn = ramp$1(scheme$8);
var scheme$7 = new Array(3).concat(
  "fff7bcfec44fd95f0e",
  "ffffd4fed98efe9929cc4c02",
  "ffffd4fed98efe9929d95f0e993404",
  "ffffd4fee391fec44ffe9929d95f0e993404",
  "ffffd4fee391fec44ffe9929ec7014cc4c028c2d04",
  "ffffe5fff7bcfee391fec44ffe9929ec7014cc4c028c2d04",
  "ffffe5fff7bcfee391fec44ffe9929ec7014cc4c02993404662506"
).map(colors);
const YlOrBr = ramp$1(scheme$7);
var scheme$6 = new Array(3).concat(
  "ffeda0feb24cf03b20",
  "ffffb2fecc5cfd8d3ce31a1c",
  "ffffb2fecc5cfd8d3cf03b20bd0026",
  "ffffb2fed976feb24cfd8d3cf03b20bd0026",
  "ffffb2fed976feb24cfd8d3cfc4e2ae31a1cb10026",
  "ffffccffeda0fed976feb24cfd8d3cfc4e2ae31a1cb10026",
  "ffffccffeda0fed976feb24cfd8d3cfc4e2ae31a1cbd0026800026"
).map(colors);
const YlOrRd = ramp$1(scheme$6);
var scheme$5 = new Array(3).concat(
  "deebf79ecae13182bd",
  "eff3ffbdd7e76baed62171b5",
  "eff3ffbdd7e76baed63182bd08519c",
  "eff3ffc6dbef9ecae16baed63182bd08519c",
  "eff3ffc6dbef9ecae16baed64292c62171b5084594",
  "f7fbffdeebf7c6dbef9ecae16baed64292c62171b5084594",
  "f7fbffdeebf7c6dbef9ecae16baed64292c62171b508519c08306b"
).map(colors);
const Blues = ramp$1(scheme$5);
var scheme$4 = new Array(3).concat(
  "e5f5e0a1d99b31a354",
  "edf8e9bae4b374c476238b45",
  "edf8e9bae4b374c47631a354006d2c",
  "edf8e9c7e9c0a1d99b74c47631a354006d2c",
  "edf8e9c7e9c0a1d99b74c47641ab5d238b45005a32",
  "f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45005a32",
  "f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45006d2c00441b"
).map(colors);
const Greens = ramp$1(scheme$4);
var scheme$3 = new Array(3).concat(
  "f0f0f0bdbdbd636363",
  "f7f7f7cccccc969696525252",
  "f7f7f7cccccc969696636363252525",
  "f7f7f7d9d9d9bdbdbd969696636363252525",
  "f7f7f7d9d9d9bdbdbd969696737373525252252525",
  "fffffff0f0f0d9d9d9bdbdbd969696737373525252252525",
  "fffffff0f0f0d9d9d9bdbdbd969696737373525252252525000000"
).map(colors);
const Greys = ramp$1(scheme$3);
var scheme$2 = new Array(3).concat(
  "efedf5bcbddc756bb1",
  "f2f0f7cbc9e29e9ac86a51a3",
  "f2f0f7cbc9e29e9ac8756bb154278f",
  "f2f0f7dadaebbcbddc9e9ac8756bb154278f",
  "f2f0f7dadaebbcbddc9e9ac8807dba6a51a34a1486",
  "fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a34a1486",
  "fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a354278f3f007d"
).map(colors);
const Purples = ramp$1(scheme$2);
var scheme$1 = new Array(3).concat(
  "fee0d2fc9272de2d26",
  "fee5d9fcae91fb6a4acb181d",
  "fee5d9fcae91fb6a4ade2d26a50f15",
  "fee5d9fcbba1fc9272fb6a4ade2d26a50f15",
  "fee5d9fcbba1fc9272fb6a4aef3b2ccb181d99000d",
  "fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181d99000d",
  "fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181da50f1567000d"
).map(colors);
const Reds = ramp$1(scheme$1);
var scheme = new Array(3).concat(
  "fee6cefdae6be6550d",
  "feeddefdbe85fd8d3cd94701",
  "feeddefdbe85fd8d3ce6550da63603",
  "feeddefdd0a2fdae6bfd8d3ce6550da63603",
  "feeddefdd0a2fdae6bfd8d3cf16913d948018c2d04",
  "fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d948018c2d04",
  "fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d94801a636037f2704"
).map(colors);
const Oranges = ramp$1(scheme);
function cividis(t) {
  t = Math.max(0, Math.min(1, t));
  return "rgb(" + Math.max(0, Math.min(255, Math.round(-4.54 - t * (35.34 - t * (2381.73 - t * (6402.7 - t * (7024.72 - t * 2710.57))))))) + ", " + Math.max(0, Math.min(255, Math.round(32.49 + t * (170.73 + t * (52.82 - t * (131.46 - t * (176.58 - t * 67.37))))))) + ", " + Math.max(0, Math.min(255, Math.round(81.24 + t * (442.36 - t * (2482.43 - t * (6167.24 - t * (6614.94 - t * 2475.67))))))) + ")";
}
const cubehelix = cubehelixLong(cubehelix$2(300, 0.5, 0), cubehelix$2(-240, 0.5, 1));
var warm = cubehelixLong(cubehelix$2(-100, 0.75, 0.35), cubehelix$2(80, 1.5, 0.8));
var cool = cubehelixLong(cubehelix$2(260, 0.75, 0.35), cubehelix$2(80, 1.5, 0.8));
var c$1 = cubehelix$2();
function rainbow(t) {
  if (t < 0 || t > 1)
    t -= Math.floor(t);
  var ts = Math.abs(t - 0.5);
  c$1.h = 360 * t - 100;
  c$1.s = 1.5 - 1.5 * ts;
  c$1.l = 0.8 - 0.9 * ts;
  return c$1 + "";
}
var c = rgb(), pi_1_3 = Math.PI / 3, pi_2_3 = Math.PI * 2 / 3;
function sinebow(t) {
  var x;
  t = (0.5 - t) * Math.PI;
  c.r = 255 * (x = Math.sin(t)) * x;
  c.g = 255 * (x = Math.sin(t + pi_1_3)) * x;
  c.b = 255 * (x = Math.sin(t + pi_2_3)) * x;
  return c + "";
}
function turbo(t) {
  t = Math.max(0, Math.min(1, t));
  return "rgb(" + Math.max(0, Math.min(255, Math.round(34.61 + t * (1172.33 - t * (10793.56 - t * (33300.12 - t * (38394.49 - t * 14825.05))))))) + ", " + Math.max(0, Math.min(255, Math.round(23.31 + t * (557.33 + t * (1225.33 - t * (3574.96 - t * (1073.77 + t * 707.56))))))) + ", " + Math.max(0, Math.min(255, Math.round(27.2 + t * (3211.1 - t * (15327.97 - t * (27814 - t * (22569.18 - t * 6838.66))))))) + ")";
}
function ramp(range2) {
  var n = range2.length;
  return function(t) {
    return range2[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
  };
}
const viridis = ramp(colors("44015444025645045745055946075a46085c460a5d460b5e470d60470e6147106347116447136548146748166848176948186a481a6c481b6d481c6e481d6f481f70482071482173482374482475482576482677482878482979472a7a472c7a472d7b472e7c472f7d46307e46327e46337f463480453581453781453882443983443a83443b84433d84433e85423f854240864241864142874144874045884046883f47883f48893e49893e4a893e4c8a3d4d8a3d4e8a3c4f8a3c508b3b518b3b528b3a538b3a548c39558c39568c38588c38598c375a8c375b8d365c8d365d8d355e8d355f8d34608d34618d33628d33638d32648e32658e31668e31678e31688e30698e306a8e2f6b8e2f6c8e2e6d8e2e6e8e2e6f8e2d708e2d718e2c718e2c728e2c738e2b748e2b758e2a768e2a778e2a788e29798e297a8e297b8e287c8e287d8e277e8e277f8e27808e26818e26828e26828e25838e25848e25858e24868e24878e23888e23898e238a8d228b8d228c8d228d8d218e8d218f8d21908d21918c20928c20928c20938c1f948c1f958b1f968b1f978b1f988b1f998a1f9a8a1e9b8a1e9c891e9d891f9e891f9f881fa0881fa1881fa1871fa28720a38620a48621a58521a68522a78522a88423a98324aa8325ab8225ac8226ad8127ad8128ae8029af7f2ab07f2cb17e2db27d2eb37c2fb47c31b57b32b67a34b67935b77937b87838b9773aba763bbb753dbc743fbc7340bd7242be7144bf7046c06f48c16e4ac16d4cc26c4ec36b50c46a52c56954c56856c66758c7655ac8645cc8635ec96260ca6063cb5f65cb5e67cc5c69cd5b6ccd5a6ece5870cf5773d05675d05477d1537ad1517cd2507fd34e81d34d84d44b86d54989d5488bd6468ed64590d74393d74195d84098d83e9bd93c9dd93ba0da39a2da37a5db36a8db34aadc32addc30b0dd2fb2dd2db5de2bb8de29bade28bddf26c0df25c2df23c5e021c8e020cae11fcde11dd0e11cd2e21bd5e21ad8e219dae319dde318dfe318e2e418e5e419e7e419eae51aece51befe51cf1e51df4e61ef6e620f8e621fbe723fde725"));
var magma = ramp(colors("00000401000501010601010802010902020b02020d03030f03031204041405041606051806051a07061c08071e0907200a08220b09240c09260d0a290e0b2b100b2d110c2f120d31130d34140e36150e38160f3b180f3d19103f1a10421c10441d11471e114920114b21114e22115024125325125527125829115a2a115c2c115f2d11612f116331116533106734106936106b38106c390f6e3b0f703d0f713f0f72400f74420f75440f764510774710784910784a10794c117a4e117b4f127b51127c52137c54137d56147d57157e59157e5a167e5c167f5d177f5f187f601880621980641a80651a80671b80681c816a1c816b1d816d1d816e1e81701f81721f817320817521817621817822817922827b23827c23827e24828025828125818326818426818627818827818928818b29818c29818e2a81902a81912b81932b80942c80962c80982d80992d809b2e7f9c2e7f9e2f7fa02f7fa1307ea3307ea5317ea6317da8327daa337dab337cad347cae347bb0357bb2357bb3367ab5367ab73779b83779ba3878bc3978bd3977bf3a77c03a76c23b75c43c75c53c74c73d73c83e73ca3e72cc3f71cd4071cf4070d0416fd2426fd3436ed5446dd6456cd8456cd9466bdb476adc4869de4968df4a68e04c67e24d66e34e65e44f64e55064e75263e85362e95462ea5661eb5760ec5860ed5a5fee5b5eef5d5ef05f5ef1605df2625df2645cf3655cf4675cf4695cf56b5cf66c5cf66e5cf7705cf7725cf8745cf8765cf9785df9795df97b5dfa7d5efa7f5efa815ffb835ffb8560fb8761fc8961fc8a62fc8c63fc8e64fc9065fd9266fd9467fd9668fd9869fd9a6afd9b6bfe9d6cfe9f6dfea16efea36ffea571fea772fea973feaa74feac76feae77feb078feb27afeb47bfeb67cfeb77efeb97ffebb81febd82febf84fec185fec287fec488fec68afec88cfeca8dfecc8ffecd90fecf92fed194fed395fed597fed799fed89afdda9cfddc9efddea0fde0a1fde2a3fde3a5fde5a7fde7a9fde9aafdebacfcecaefceeb0fcf0b2fcf2b4fcf4b6fcf6b8fcf7b9fcf9bbfcfbbdfcfdbf"));
var inferno = ramp(colors("00000401000501010601010802010a02020c02020e03021004031204031405041706041907051b08051d09061f0a07220b07240c08260d08290e092b10092d110a30120a32140b34150b37160b39180c3c190c3e1b0c411c0c431e0c451f0c48210c4a230c4c240c4f260c51280b53290b552b0b572d0b592f0a5b310a5c320a5e340a5f3609613809623909633b09643d09653e0966400a67420a68440a68450a69470b6a490b6a4a0c6b4c0c6b4d0d6c4f0d6c510e6c520e6d540f6d550f6d57106e59106e5a116e5c126e5d126e5f136e61136e62146e64156e65156e67166e69166e6a176e6c186e6d186e6f196e71196e721a6e741a6e751b6e771c6d781c6d7a1d6d7c1d6d7d1e6d7f1e6c801f6c82206c84206b85216b87216b88226a8a226a8c23698d23698f24699025689225689326679526679727669827669a28659b29649d29649f2a63a02a63a22b62a32c61a52c60a62d60a82e5fa92e5eab2f5ead305dae305cb0315bb1325ab3325ab43359b63458b73557b93556ba3655bc3754bd3853bf3952c03a51c13a50c33b4fc43c4ec63d4dc73e4cc83f4bca404acb4149cc4248ce4347cf4446d04545d24644d34743d44842d54a41d74b3fd84c3ed94d3dda4e3cdb503bdd513ade5238df5337e05536e15635e25734e35933e45a31e55c30e65d2fe75e2ee8602de9612bea632aeb6429eb6628ec6726ed6925ee6a24ef6c23ef6e21f06f20f1711ff1731df2741cf3761bf37819f47918f57b17f57d15f67e14f68013f78212f78410f8850ff8870ef8890cf98b0bf98c0af98e09fa9008fa9207fa9407fb9606fb9706fb9906fb9b06fb9d07fc9f07fca108fca309fca50afca60cfca80dfcaa0ffcac11fcae12fcb014fcb216fcb418fbb61afbb81dfbba1ffbbc21fbbe23fac026fac228fac42afac62df9c72ff9c932f9cb35f8cd37f8cf3af7d13df7d340f6d543f6d746f5d949f5db4cf4dd4ff4df53f4e156f3e35af3e55df2e661f2e865f2ea69f1ec6df1ed71f1ef75f1f179f2f27df2f482f3f586f3f68af4f88ef5f992f6fa96f8fb9af9fc9dfafda1fcffa4"));
var plasma = ramp(colors("0d088710078813078916078a19068c1b068d1d068e20068f2206902406912605912805922a05932c05942e05952f059631059733059735049837049938049a3a049a3c049b3e049c3f049c41049d43039e44039e46039f48039f4903a04b03a14c02a14e02a25002a25102a35302a35502a45601a45801a45901a55b01a55c01a65e01a66001a66100a76300a76400a76600a76700a86900a86a00a86c00a86e00a86f00a87100a87201a87401a87501a87701a87801a87a02a87b02a87d03a87e03a88004a88104a78305a78405a78606a68707a68808a68a09a58b0aa58d0ba58e0ca48f0da4910ea3920fa39410a29511a19613a19814a099159f9a169f9c179e9d189d9e199da01a9ca11b9ba21d9aa31e9aa51f99a62098a72197a82296aa2395ab2494ac2694ad2793ae2892b02991b12a90b22b8fb32c8eb42e8db52f8cb6308bb7318ab83289ba3388bb3488bc3587bd3786be3885bf3984c03a83c13b82c23c81c33d80c43e7fc5407ec6417dc7427cc8437bc9447aca457acb4679cc4778cc4977cd4a76ce4b75cf4c74d04d73d14e72d24f71d35171d45270d5536fd5546ed6556dd7566cd8576bd9586ada5a6ada5b69db5c68dc5d67dd5e66de5f65de6164df6263e06363e16462e26561e26660e3685fe4695ee56a5de56b5de66c5ce76e5be76f5ae87059e97158e97257ea7457eb7556eb7655ec7754ed7953ed7a52ee7b51ef7c51ef7e50f07f4ff0804ef1814df1834cf2844bf3854bf3874af48849f48948f58b47f58c46f68d45f68f44f79044f79143f79342f89441f89540f9973ff9983ef99a3efa9b3dfa9c3cfa9e3bfb9f3afba139fba238fca338fca537fca636fca835fca934fdab33fdac33fdae32fdaf31fdb130fdb22ffdb42ffdb52efeb72dfeb82cfeba2cfebb2bfebd2afebe2afec029fdc229fdc328fdc527fdc627fdc827fdca26fdcb26fccd25fcce25fcd025fcd225fbd324fbd524fbd724fad824fada24f9dc24f9dd25f8df25f8e125f7e225f7e425f6e626f6e826f5e926f5eb27f4ed27f3ee27f3f027f2f227f1f426f1f525f0f724f0f921"));
const d3Chromatic = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  interpolateBlues: Blues,
  interpolateBrBG: BrBG,
  interpolateBuGn: BuGn,
  interpolateBuPu: BuPu,
  interpolateCividis: cividis,
  interpolateCool: cool,
  interpolateCubehelixDefault: cubehelix,
  interpolateGnBu: GnBu,
  interpolateGreens: Greens,
  interpolateGreys: Greys,
  interpolateInferno: inferno,
  interpolateMagma: magma,
  interpolateOrRd: OrRd,
  interpolateOranges: Oranges,
  interpolatePRGn: PRGn,
  interpolatePiYG: PiYG,
  interpolatePlasma: plasma,
  interpolatePuBu: PuBu,
  interpolatePuBuGn: PuBuGn,
  interpolatePuOr: PuOr,
  interpolatePuRd: PuRd,
  interpolatePurples: Purples,
  interpolateRainbow: rainbow,
  interpolateRdBu: RdBu,
  interpolateRdGy: RdGy,
  interpolateRdPu: RdPu,
  interpolateRdYlBu: RdYlBu,
  interpolateRdYlGn: RdYlGn,
  interpolateReds: Reds,
  interpolateSinebow: sinebow,
  interpolateSpectral: Spectral,
  interpolateTurbo: turbo,
  interpolateViridis: viridis,
  interpolateWarm: warm,
  interpolateYlGn: YlGn,
  interpolateYlGnBu: YlGnBu,
  interpolateYlOrBr: YlOrBr,
  interpolateYlOrRd: YlOrRd,
  schemeAccent: Accent,
  schemeBlues: scheme$5,
  schemeBrBG: scheme$q,
  schemeBuGn: scheme$h,
  schemeBuPu: scheme$g,
  schemeCategory10: category10,
  schemeDark2: Dark2,
  schemeGnBu: scheme$f,
  schemeGreens: scheme$4,
  schemeGreys: scheme$3,
  schemeOrRd: scheme$e,
  schemeOranges: scheme,
  schemePRGn: scheme$p,
  schemePaired: Paired,
  schemePastel1: Pastel1,
  schemePastel2: Pastel2,
  schemePiYG: scheme$o,
  schemePuBu: scheme$c,
  schemePuBuGn: scheme$d,
  schemePuOr: scheme$n,
  schemePuRd: scheme$b,
  schemePurples: scheme$2,
  schemeRdBu: scheme$m,
  schemeRdGy: scheme$l,
  schemeRdPu: scheme$a,
  schemeRdYlBu: scheme$k,
  schemeRdYlGn: scheme$j,
  schemeReds: scheme$1,
  schemeSet1: Set1,
  schemeSet2: Set2,
  schemeSet3: Set3,
  schemeSpectral: scheme$i,
  schemeTableau10: Tableau10,
  schemeYlGn: scheme$8,
  schemeYlGnBu: scheme$9,
  schemeYlOrBr: scheme$7,
  schemeYlOrRd: scheme$6
}, Symbol.toStringTag, { value: "Module" }));
const mul = 1664525;
const inc = 1013904223;
const eps = 1 / 4294967296;
function lcg(seed = Math.random()) {
  let state = (0 <= seed && seed < 1 ? seed / eps : Math.abs(seed)) | 0;
  return () => (state = mul * state + inc | 0, eps * (state >>> 0));
}
const palette_size = 4096;
function materialize_color_interplator(interpolator) {
  const output = new Uint8Array(4 * palette_size);
  range(palette_size).forEach((i) => {
    const p = rgb(interpolator(i / palette_size));
    output.set([p.r, p.g, p.b, 255], i * 4);
  });
  return output;
}
const color_palettes = {
  white: new Uint8Array(4 * palette_size).fill(255)
};
const schemes = {};
function palette_from_color_strings(colors2) {
  const scheme2 = colors2.map((color2) => {
    const col = rgb(color2);
    return [col.r, col.g, col.b, 255];
  });
  const output = new Uint8Array(palette_size * 4);
  const repeat_each = Math.floor(palette_size / colors2.length);
  for (let i = 0; i < colors2.length; i++) {
    for (let j = 0; j < repeat_each && i * repeat_each + j < palette_size; j++) {
      output.set(scheme2[i], (i * repeat_each + j) * 4);
    }
  }
  return output;
}
for (const schemename of [
  "schemeAccent",
  "schemeCategory10",
  "schemeDark2",
  "schemePaired",
  "schemePastel1",
  "schemePastel2",
  "schemeSet1",
  "schemeSet2",
  "schemeSet3",
  "schemeTableau10"
]) {
  const colors2 = d3Chromatic[schemename];
  const name = schemename.replace("scheme", "").toLowerCase();
  color_palettes[name] = palette_from_color_strings(colors2);
  schemes[name] = colors2;
}
for (const interpolator of [
  "interpolateBlues",
  "interpolateBrBG",
  "interpolateBuGn",
  "interpolateBuPu",
  "interpolateCividis",
  "interpolateCool",
  "interpolateCubehelixDefault",
  "interpolateGnBu",
  "interpolateGreens",
  "interpolateGreys",
  "interpolateInferno",
  "interpolateMagma",
  "interpolateOrRd",
  "interpolateOranges",
  "interpolatePRGn",
  "interpolatePiYG",
  "interpolatePlasma",
  "interpolatePuBu",
  "interpolatePuBuGn",
  "interpolatePuOr",
  "interpolatePuRd",
  "interpolatePurples",
  "interpolateRainbow",
  "interpolateRdBu",
  "interpolateRdGy",
  "interpolateRdPu",
  "interpolateRdYlBu",
  "interpolateRdYlGn",
  "interpolateReds",
  "interpolateSinebow",
  "interpolateSpectral",
  "interpolateTurbo",
  "interpolateViridis",
  "interpolateWarm",
  "interpolateYlGn",
  "interpolateYlGnBu",
  "interpolateYlOrBr",
  "interpolateYlOrRd"
]) {
  const name = interpolator.replace("interpolate", "").toLowerCase();
  const v = d3Chromatic[interpolator];
  color_palettes[name] = materialize_color_interplator(v);
  if (name === "rainbow") {
    const shuffle = shuffler(lcg(1));
    color_palettes.shufbow = shuffle(color_palettes[name]);
  }
}
function okabe() {
  const okabe_palette = [
    "#E69F00",
    "#CC79A7",
    "#56B4E9",
    "#009E73",
    "#0072B2",
    "#D55E00",
    "#F0E442"
  ];
  color_palettes.okabe = palette_from_color_strings(okabe_palette);
  schemes["okabe"] = okabe_palette;
}
okabe();
class Color extends Aesthetic {
  constructor() {
    super(...arguments);
    this._constant = "#CC5500";
    this.texture_type = "uint8";
    this.default_constant = "#CC5500";
    this.default_transform = "linear";
    this.current_encoding = null;
  }
  get default_range() {
    return [0, 1];
  }
  default_data() {
    return color_palettes.viridis;
  }
  get use_map_on_regl() {
    return 1;
  }
  get colorscheme_size() {
    if (this.is_dictionary()) {
      return this.scale.range().length;
    }
    return -1;
  }
  get scale() {
    if (this._scale) {
      return this._scale;
    }
    const range2 = this.range;
    function capitalize(r) {
      if (r === "ylorrd") {
        return "YlOrRd";
      }
      return r.charAt(0).toUpperCase() + r.slice(1);
    }
    if (this.is_dictionary()) {
      const scale = ordinal().domain(this.domain);
      if (typeof range2 === "string" && schemes[range2]) {
        const dictionary = this.column.data[0].dictionary;
        if (dictionary === null) {
          throw new Error("Dictionary is null");
        }
        const keys = dictionary.toArray();
        return this._scale = ordinal().range(schemes[range2]).domain(keys);
      } else {
        return this._scale = scale.range(this.range);
      }
    }
    if (typeof range2 == "string") {
      const interpolator = d3Chromatic["interpolate" + capitalize(range2)];
      if (interpolator !== void 0) {
        if (this.transform === "sqrt") {
          return this._scale = sequentialPow(interpolator).exponent(0.5).domain(this.domain);
        } else if (this.transform === "log") {
          return this._scale = sequentialLog(interpolator).domain(
            this.domain
          );
        } else {
          return this._scale = sequential(interpolator).domain(
            this.domain
          );
        }
      }
    }
  }
  get texture_buffer() {
    if (this._texture_buffer) {
      return this._texture_buffer;
    }
    this._texture_buffer = new Uint8Array(this.aesthetic_map.texture_size * 4);
    this._texture_buffer.set(this.default_data());
    return this._texture_buffer;
  }
  post_to_regl_buffer() {
    this.aesthetic_map.set_color(this.id, this.texture_buffer);
  }
  update(encoding) {
    super.update(encoding);
    this.current_encoding = encoding;
    if (encoding === null) {
      encoding = {
        constant: this.default_constant
      };
    }
    if (!isConstantChannel(encoding)) {
      if (encoding.range && typeof encoding.range[0] === "string") {
        this.encode_for_textures(encoding.range);
        this.post_to_regl_buffer();
      } else if (encoding.range) {
        this.post_to_regl_buffer();
      }
    }
  }
  toGLType(color2) {
    const { r, g, b } = rgb(color2);
    return [r / 255, g / 255, b / 255];
  }
  encode_for_textures(range2) {
    if (Array.isArray(range2)) {
      const key = range2.join("/");
      if (color_palettes[key]) {
        this.texture_buffer.set(color_palettes[key]);
        return;
      } else {
        let palette;
        if (!this.is_dictionary()) {
          palette = palette_from_color_strings(range2);
        } else {
          const data_values = this.column.data[0].dictionary.toArray();
          const dict_values = Object.fromEntries(
            data_values.map((val, i) => [val, i])
          );
          const colors2 = [];
          for (let i = 0; i < this.domain.length; i++) {
            const label = this.domain[i];
            const color2 = range2[i];
            if (dict_values[label] !== void 0) {
              colors2[dict_values[label]] = color2;
            }
          }
          for (let i = 0; i < data_values.length; i++) {
            if (colors2[i] === void 0) {
              colors2[i] = "gray";
            }
          }
          palette = palette_from_color_strings(colors2);
        }
        this.texture_buffer.set(palette);
        return;
      }
    }
    if (color_palettes[range2]) {
      this.texture_buffer.set(color_palettes[range2]);
      return;
    }
    if (range2.length === this.aesthetic_map.texture_size * 4) {
      throw new Error("SETTING FULL RANGE IS DEPRECATED");
    }
    console.error(`request range of ${range2} for color ${this.field} unknown`);
  }
}
const dimensions = {
  size: Size,
  jitter_speed: Jitter_speed,
  jitter_radius: Jitter_radius,
  color: Color,
  filter: Filter,
  filter2: Filter,
  x: X,
  y: Y,
  x0: X0,
  y0: Y0,
  foreground: Foreground
};
class StatefulAesthetic {
  constructor(scatterplot, regl2, dataset, aesthetic_map, Factory) {
    this.needs_transitions = false;
    if (aesthetic_map === void 0) {
      throw new Error("Aesthetic map is undefined.");
    }
    this.scatterplot = scatterplot;
    this.regl = regl2;
    this.dataset = dataset;
    this.aesthetic_map = aesthetic_map;
    this.states = [
      new Factory(
        this.scatterplot,
        this.regl,
        this.dataset,
        this.aesthetic_map
      ),
      new Factory(
        this.scatterplot,
        this.regl,
        this.dataset,
        this.aesthetic_map
      )
    ];
  }
  get current() {
    return this.states[0];
  }
  get last() {
    return this.states[1];
  }
  update(encoding) {
    const stringy = JSON.stringify(encoding);
    if (stringy === JSON.stringify(this.states[0].current_encoding) || encoding === void 0) {
      if (this.needs_transitions) {
        this.states[1].update(this.states[0].current_encoding);
      }
      this.needs_transitions = false;
    } else {
      this.states.reverse();
      this.states[0].update(encoding);
      this.needs_transitions = true;
    }
  }
}
class AestheticSet {
  constructor(scatterplot, regl2, tileSet) {
    this.encoding = {};
    this.scatterplot = scatterplot;
    this.store = {};
    this.regl = regl2;
    this.tileSet = tileSet;
    this.position_interpolation = false;
    this.aesthetic_map = new TextureSet(this.regl);
    return this;
  }
  dim(aesthetic) {
    if (this.store[aesthetic]) {
      return this.store[aesthetic];
    }
    if (!dimensions[aesthetic]) {
      throw new Error(`Unknown aesthetic ${aesthetic}`);
    }
    const Maker = dimensions[aesthetic];
    const p = this.scatterplot;
    const regl2 = this.regl;
    const map2 = this.aesthetic_map;
    const my_dim = new StatefulAesthetic(
      p,
      regl2,
      this.tileSet,
      map2,
      Maker
    );
    this.store[aesthetic] = my_dim;
    return my_dim;
  }
  *[Symbol.iterator]() {
    for (const [k, v] of Object.entries(this.store)) {
      yield [k, v];
    }
  }
  interpret_position(encoding) {
    if (encoding) {
      if (encoding.x0 || encoding.position0) {
        this.position_interpolation = true;
      } else if (encoding.x || encoding.position) {
        this.position_interpolation = false;
      }
      for (const p of ["position", "position0"]) {
        const suffix = p.replace("position", "");
        if (encoding[p]) {
          if (encoding[p] === "literal") {
            encoding[`x${suffix}`] = {
              field: "x",
              transform: "literal"
            };
            encoding[`y${suffix}`] = {
              field: "y",
              transform: "literal"
            };
          } else {
            const field = encoding[p];
            encoding[`x${suffix}`] = {
              field: `${field}.x`,
              transform: "literal"
            };
            encoding[`y${suffix}`] = {
              field: `${field}.y`,
              transform: "literal"
            };
          }
          delete encoding[p];
        }
      }
    }
    delete encoding.position;
    delete encoding.position0;
  }
  apply_encoding(encoding) {
    if (encoding === void 0) {
      encoding = {};
    }
    if (encoding["filter1"] !== void 0) {
      throw new Error('filter1 is not supported; just say "filter"');
    }
    const colorDomain = encoding.color && encoding.color.domain ? encoding.color["domain"] : void 0;
    if (colorDomain && colorDomain.length == 2) {
      if (Math.abs(colorDomain[1] - colorDomain[0] - 4096) < 2) {
        console.warn(`Resetting color encoding from -2047 to 0. The old behavior of requiring negative numbers 
          for dictionary schemes is deprecated. If you're actually trying to encode real numbers here, not a dictionary, change to [-4100, 4100] 
          until a future update.
        `);
        encoding.color["domain"] = [0, 4096];
      }
    }
    this.interpret_position(encoding);
    for (const k of Object.keys(dimensions)) {
      this.dim(k).update(encoding[k]);
    }
  }
}
class TextureSet {
  constructor(regl2, texture_size = 4096) {
    this.id_locs = {};
    this.offsets = {};
    this.texture_size = texture_size;
    this.texture_widths = 32;
    this.regl = regl2;
    this._one_d_position = 1;
    this._color_position = -1;
  }
  get_position(id2) {
    return this.offsets[id2] || 0;
  }
  set_one_d(id2, value) {
    let offset;
    const { offsets } = this;
    if (offsets[id2]) {
      offset = offsets[id2];
    } else {
      offset = this._one_d_position++;
      offsets[id2] = offset;
    }
    this.one_d_texture.subimage(
      {
        data: value,
        width: 1,
        height: this.texture_size
      },
      offset,
      0
    );
  }
  set_color(id2, value) {
    let offset;
    const { offsets } = this;
    if (offsets[id2]) {
      offset = offsets[id2];
    } else {
      offset = this._color_position--;
      offsets[id2] = offset;
    }
    this.color_texture.subimage(
      {
        data: value,
        width: 1,
        height: this.texture_size
      },
      -offset - 1,
      0
    );
  }
  get one_d_texture() {
    if (this._one_d_texture) {
      return this._one_d_texture;
    }
    const texture_type = this.regl.hasExtension("OES_texture_float") ? "float" : this.regl.hasExtension("OES_texture_half_float") ? "half float" : "uint8";
    const format2 = texture_type === "uint8" ? "rgba" : "alpha";
    const params = {
      width: this.texture_widths,
      height: this.texture_size,
      type: texture_type,
      format: format2
    };
    this._one_d_texture = this.regl.texture(params);
    return this._one_d_texture;
  }
  get color_texture() {
    if (this._color_texture) {
      return this._color_texture;
    }
    this._color_texture = this.regl.texture({
      width: this.texture_widths,
      height: this.texture_size,
      type: "uint8",
      format: "rgba"
    });
    return this._color_texture;
  }
}
class ReglRenderer extends Renderer {
  //  public _renderer :  Renderer;
  constructor(selector2, tileSet, scatterplot) {
    super(selector2, tileSet, scatterplot);
    this.buffer_size = 1024 * 1024 * 64;
    this._use_scale_to_download_tiles = true;
    this.fbos = {};
    this.textures = {};
    const c2 = this.canvas;
    if (this.canvas === void 0) {
      throw new Error("No canvas found");
    }
    this.regl = reglExports({
      //      extensions: 'angle_instanced_arrays',
      optionalExtensions: [
        "OES_standard_derivatives",
        "OES_element_index_uint",
        "OES_texture_float",
        "OES_texture_half_float"
      ],
      canvas: c2
    });
    this.tileSet = tileSet;
    this.aes = new AestheticSet(scatterplot, this.regl, tileSet);
    this.initialize_textures();
    this._initializations = [
      // some things that need to be initialized before the renderer is loaded.
      this.tileSet.promise.then(() => {
        this.remake_renderer();
        this._webgl_scale_history = [
          this.default_webgl_scale,
          this.default_webgl_scale
        ];
      })
    ];
    void this.initialize();
    this._buffers = new MultipurposeBufferSet(this.regl, this.buffer_size);
  }
  get buffers() {
    this._buffers = this._buffers || new MultipurposeBufferSet(this.regl, this.buffer_size);
    return this._buffers;
  }
  data(dataset) {
    if (dataset === void 0) {
      return this.tileSet;
    }
    this.tileSet = dataset;
    return this;
  }
  get props() {
    this.allocate_aesthetic_buffers();
    const {
      prefs,
      aes_to_buffer_num,
      buffer_num_to_variable,
      variable_to_buffer_num
    } = this;
    const { transform } = this.zoom;
    const colorScales = this.aes.dim("color");
    const [currentColor, lastColor] = [colorScales.current, colorScales.last];
    const wrap_colors_after = [
      lastColor.colorscheme_size,
      currentColor.colorscheme_size
    ];
    const props = {
      // Copy the aesthetic as a string.
      aes: { encoding: this.aes.encoding },
      colors_as_grid: 0,
      corners: this.zoom.current_corners(),
      zoom_balance: prefs.zoom_balance,
      transform,
      max_ix: this.max_ix,
      point_size: this.point_size,
      alpha: this.optimal_alpha,
      time: Date.now() - this.zoom._start,
      update_time: Date.now() - this.most_recent_restart,
      relative_time: (Date.now() - this.most_recent_restart) / prefs.duration,
      string_index: 0,
      prefs: JSON.parse(JSON.stringify(prefs)),
      color_type: void 0,
      wrap_colors_after,
      start_time: this.most_recent_restart,
      webgl_scale: this._webgl_scale_history[0],
      last_webgl_scale: this._webgl_scale_history[1],
      use_scale_for_tiles: this._use_scale_to_download_tiles,
      grid_mode: 0,
      buffer_num_to_variable,
      aes_to_buffer_num,
      variable_to_buffer_num,
      color_picker_mode: 0,
      // whether to draw as a color picker.
      zoom_matrix: [
        [transform.k, 0, transform.x],
        [0, transform.k, transform.y],
        [0, 0, 1]
      ].flat()
    };
    return JSON.parse(JSON.stringify(props));
  }
  get default_webgl_scale() {
    if (this._default_webgl_scale) {
      return this._default_webgl_scale;
    }
    this._default_webgl_scale = this.zoom.webgl_scale();
    return this._default_webgl_scale;
  }
  render_points(props) {
    const prop_list = [];
    let call_no = 0;
    const needs_background_pass = this.aes.store.foreground.states[0].active || this.aes.store.foreground.states[1].active;
    for (const tile of this.visible_tiles()) {
      tile._buffer_manager = tile._buffer_manager || new TileBufferManager(this.regl, tile, this);
      if (!tile._buffer_manager.ready(props.block_for_buffers)) {
        continue;
      }
      const this_props = {
        manager: tile._buffer_manager,
        number: call_no++,
        foreground: needs_background_pass ? 1 : -1,
        tile_id: tile.numeric_id,
        sprites: this.sprites
      };
      Object.assign(this_props, props);
      prop_list.push(this_props);
      if (needs_background_pass) {
        const background_props = { ...this_props, foreground: 0 };
        prop_list.push(background_props);
      }
    }
    prop_list.sort((a, b) => {
      return (3 + a.foreground) * 1e3 - (3 + b.foreground) * 1e3 + b.number - a.number;
    });
    this._renderer(prop_list);
  }
  /**
   * Actions that run on a single animation tick.
   */
  tick() {
    const { prefs } = this;
    const { regl: regl2, tileSet } = this;
    const { props } = this;
    this.tick_num = this.tick_num || 0;
    this.tick_num++;
    if (this._use_scale_to_download_tiles) {
      tileSet.download_most_needed_tiles(
        this.zoom.current_corners(),
        this.props.max_ix,
        5
      );
    } else {
      tileSet.download_most_needed_tiles(prefs.max_points, this.max_ix, 5);
    }
    regl2.clear({
      color: [0.9, 0.9, 0.93, 0],
      depth: 1
    });
    const start2 = Date.now();
    async function pop_deferred_functions(deferred_functions) {
      while (Date.now() - start2 < 10 && deferred_functions.length > 0) {
        const current = deferred_functions.shift();
        if (current === void 0) {
          continue;
        }
        try {
          await current();
        } catch (error) {
          console.warn(error, current);
        }
      }
    }
    void pop_deferred_functions(this.deferred_functions);
    try {
      this.render_all(props);
    } catch (error) {
      console.warn("ERROR NOTED");
      this.reglframe.cancel();
      throw error;
    }
  }
  single_blur_pass(fbo1, fbo2, direction) {
    const { regl: regl2 } = this;
    fbo2.use(() => {
      regl2.clear({ color: [0, 0, 0, 0] });
      regl2({
        frag: gaussian_blur,
        uniforms: {
          iResolution: ({ viewportWidth, viewportHeight }) => [
            viewportWidth,
            viewportHeight
          ],
          iChannel0: fbo1,
          direction
        },
        /* blend: {
          enable: true,
          func: {
            srcRGB: 'one',
            srcAlpha: 'one',
            dstRGB: 'one minus src alpha',
            dstAlpha: 'one minus src alpha',
          },
        }, */
        vert: `
        precision mediump float;
        attribute vec2 position;
        varying vec2 uv;
        void main() {
          uv = 0.5 * (position + 1.0);
          gl_Position = vec4(position, 0, 1);
        }`,
        attributes: {
          position: [-4, -4, 4, -4, 0, 4]
        },
        depth: { enable: false },
        count: 3
      })();
    });
  }
  blur(fbo1, fbo2, passes = 3) {
    let remaining = passes - 1;
    while (remaining > -1) {
      this.single_blur_pass(fbo1, fbo2, [2 ** remaining, 0]);
      this.single_blur_pass(fbo2, fbo1, [0, 2 ** remaining]);
      remaining -= 1;
    }
  }
  render_all(props) {
    const { regl: regl2 } = this;
    this.fbos.points.use(() => {
      regl2.clear({ color: [0, 0, 0, 0] });
      this.render_points(props);
    });
    regl2.clear({ color: [0, 0, 0, 0] });
    this.fbos.lines.use(() => regl2.clear({ color: [0, 0, 0, 0] }));
    if (this.scatterplot.trimap) {
      this.fbos.lines.use(() => {
        this.scatterplot.trimap.zoom = this.zoom;
        this.scatterplot.trimap.tick("polygon");
      });
    }
    for (const layer of [this.fbos.lines, this.fbos.points]) {
      regl2({
        profile: true,
        blend: {
          enable: true,
          func: {
            srcRGB: "one",
            srcAlpha: "one",
            dstRGB: "one minus src alpha",
            dstAlpha: "one minus src alpha"
          }
        },
        frag: `
        precision mediump float;
        varying vec2 uv;
        uniform sampler2D tex;
        uniform float wRcp, hRcp;
        void main() {
          gl_FragColor = texture2D(tex, uv);
        }
      `,
        vert: `
        precision mediump float;
        attribute vec2 position;
        varying vec2 uv;
        void main() {
          uv = 0.5 * (position + 1.0);
          gl_Position = vec4(position, 0., 1.);
        }
      `,
        attributes: {
          position: this.fill_buffer
        },
        depth: { enable: false },
        count: 3,
        uniforms: {
          tex: () => layer,
          wRcp: ({ viewportWidth }) => 1 / viewportWidth,
          hRcp: ({ viewportHeight }) => 1 / viewportHeight
        }
      })();
    }
  }
  /*
    set_image_data(tile, ix) {
    // Stores a *single* image onto the texture.
      const { regl } = this;
  
      this.initialize_sprites(tile);
  
      //    const { sprites, image_locations } = tile._regl_elements;
      const { current_position } = sprites;
      if (current_position[1] > (4096 - 18 * 2)) {
        console.error(`First spritesheet overflow on ${tile.key}`);
        // Just move back to the beginning. Will cause all sorts of havoc.
        sprites.current_position = [0, 0];
        return;
      }
      if (!tile.table.get(ix)._jpeg) {
  
      }
    }
    */
  /*
    spritesheet_setter(word) {
    // Set if not there.
      let ctx = 0;
      if (!this.spritesheet) {
        const offscreen = create('canvas')
          .attr('width', 4096)
          .attr('width', 4096)
          .style('display', 'none');
  
        ctx = offscreen.node().getContext('2d');
        const font_size = 32;
        ctx.font = `${font_size}px Times New Roman`;
        ctx.fillStyle = 'black';
        ctx.lookups = new Map();
        ctx.position = [0, font_size - font_size / 4.0];
        this.spritesheet = ctx;
      } else {
        ctx = this.spritesheet;
      }
      let [x, y] = ctx.position;
  
      if (ctx.lookups.get(word)) {
        return ctx.lookups.get(word);
      }
      const w_ = ctx.measureText(word).width;
      if (w_ > 4096) {
        return;
      }
      if ((x + w_) > 4096) {
        x = 0;
        y += font_size;
      }
      ctx.fillText(word, x, y);
      lookups.set(word, { x, y, width: w_ });
      // ctx.strokeRect(x, y - font_size, width, font_size)
      x += w_;
      ctx.position = [x, y];
      return lookups.get(word);
    }
    */
  initialize_textures() {
    const { regl: regl2 } = this;
    this.fbos = this.fbos || {};
    this.textures = this.textures || {};
    this.textures.empty_texture = regl2.texture(
      range(128).map((d) => range(128).map((d2) => [0, 0, 0]))
    );
    this.fbos.minicounter = regl2.framebuffer({
      width: 512,
      height: 512,
      depth: false
    });
    this.fbos.lines = regl2.framebuffer({
      // type: 'half float',
      width: this.width,
      height: this.height,
      depth: false
    });
    this.fbos.points = regl2.framebuffer({
      // type: 'half float',
      width: this.width,
      height: this.height,
      depth: false
    });
    this.fbos.ping = regl2.framebuffer({
      width: this.width,
      height: this.height,
      depth: false
    });
    this.fbos.pong = regl2.framebuffer({
      width: this.width,
      height: this.height,
      depth: false
    });
    this.fbos.contour = this.fbos.contour || regl2.framebuffer({
      width: this.width,
      height: this.height,
      depth: false
    });
    this.fbos.colorpicker = this.fbos.colorpicker || regl2.framebuffer({
      width: this.width,
      height: this.height,
      depth: false
    });
    this.fbos.dummy = this.fbos.dummy || regl2.framebuffer({
      width: 1,
      height: 1,
      depth: false
    });
  }
  get_image_texture(url) {
    const { regl: regl2 } = this;
    this.textures = this.textures || {};
    if (this.textures[url]) {
      return this.textures[url];
    }
    const image = new Image();
    image.src = url;
    image.addEventListener("load", () => {
      this.textures[url] = regl2.texture(image);
    });
    return this.textures[url];
  }
  /*
    plot_as_grid(x_field, y_field, buffer = this.fbos.minicounter) {
      const { scatterplot, regl, tileSet } = this.aes;
  
      const saved_aes = this.aes;
  
      if (buffer === undefined) {
      // Mock up dummy syntax to use the main draw buffer.
        buffer = {
          width: this.width,
          height: this.height,
          use: (f) => f(),
        };
      }
  
      const { width, height } = buffer;
  
      this.aes = new AestheticSet(scatterplot, regl, tileSet);
  
      const x_length = map._root.table.getColumn(x_field).data.dictionary.length;
  
      const stride = 1;
  
      let nearest_pow_2 = 1;
      while (nearest_pow_2 < x_length) {
        nearest_pow_2 *= 2;
      }
  
      const encoding = {
        x: {
          field: x_field,
          transform: 'linear',
          domain: [-2047, -2047 + nearest_pow_2],
        },
        y: y_field !== undefined ? {
          field: y_field,
          transform: 'linear',
          domain: [-2047, -2020],
  
        } : { constant: -1 },
        size: 1,
        color: {
          constant: [0, 0, 0],
          transform: 'literal',
        },
        jitter_radius: {
          constant: 1 / 2560, // maps to x jitter
          method: 'uniform', // Means x in radius and y in speed.
        },
  
        jitter_speed: y_field === undefined ? 1 : 1 / 256, // maps to y jitter
      };
      // Twice to overwrite the defaults and avoid interpolation.
      this.aes.apply_encoding(encoding);
      this.aes.apply_encoding(encoding);
      this.aes.x[1] = saved_aes.x[0];
      this.aes.y[1] = saved_aes.y[0];
      this.aes.filter1 = saved_aes.filter1;
      this.aes.filter2 = saved_aes.filter2;
  
      const { props } = this;
      props.block_for_buffers = true;
      props.grid_mode = 1;
  
      const minilist = new Uint8Array(width * height * 4);
  
      buffer.use(() => {
        this.regl.clear({ color: [0, 0, 0, 0] });
        this.render_points(props);
        regl.read({ data: minilist });
      });
      // Then revert back.
      this.aes = saved_aes;
    }
     */
  n_visible(only_color = -1) {
    let { width, height } = this;
    width = Math.floor(width);
    height = Math.floor(height);
    if (this.contour_vals === void 0) {
      this.contour_vals = new Uint8Array(width * height * 4);
    }
    const { props } = this;
    props.only_color = only_color;
    let v;
    this.fbos.contour.use(() => {
      this.regl.clear({ color: [0, 0, 0, 0] });
      this.render_points(props);
      this.regl.read(this.contour_vals);
      v = sum(this.contour_vals);
    });
    return v;
  }
  get integer_buffer() {
    if (this._integer_buffer === void 0) {
      const array2 = new Float32Array(2 ** 16);
      for (let i = 0; i < 2 ** 16; i++) {
        array2[i] = i;
      }
      this._integer_buffer = this.regl.buffer(array2);
    }
    return this._integer_buffer;
  }
  color_pick(x, y) {
    if (y === 0) {
      return null;
    }
    const tile_number = this.color_pick_single(x, y, "tile_id");
    if (tile_number == -1) {
      return null;
    }
    const row_number = this.color_pick_single(x, y, "ix_in_tile");
    if (row_number === -1) {
      return null;
    }
    for (const tile of this.visible_tiles()) {
      if (tile.numeric_id === tile_number) {
        return tile.record_batch.get(row_number);
      }
    }
    return null;
  }
  color_pick_single(x, y, field = "tile_id") {
    const { props, height } = this;
    props.color_picker_mode = ["ix", "tile_id", "ix_in_tile"].indexOf(field) + 1;
    let color_at_point = [0, 0, 0, 0];
    this.fbos.colorpicker.use(() => {
      this.regl.clear({ color: [0, 0, 0, 0] });
      this.render_points(props);
      try {
        color_at_point = this.regl.read({
          x,
          y: height - y,
          width: 1,
          height: 1
        });
      } catch {
        console.warn("Read bad data from", {
          x,
          y,
          height,
          attempted: height - y
        });
      }
    });
    const point_as_float = glslReadFloat(...color_at_point) - 1;
    const point_as_int = Math.round(point_as_float);
    return point_as_int;
  }
  /* blur(fbo) {
    var passes = [];
    var radii = [Math.round(
      Math.max(1, state.bloom.radius * pixelRatio / state.bloom.downsample))];
    for (var radius = nextPow2(radii[0]) / 2; radius >= 1; radius /= 2) {
      radii.push(radius);
    }
    radii.forEach(radius => {
      for (var pass = 0; pass < state.bloom.blur.passes; pass++) {
        passes.push({
          kernel: 13,
          src: bloomFbo[0],
          dst: bloomFbo[1],
          direction: [radius, 0]
        }, {
          kernel: 13,
          src: bloomFbo[1],
          dst: bloomFbo[0],
          direction: [0, radius]
        });
      }
    })
  } */
  get fill_buffer() {
    if (!this._fill_buffer) {
      const { regl: regl2 } = this;
      this._fill_buffer = regl2.buffer({ data: [-4, -4, 4, -4, 0, 4] });
    }
    return this._fill_buffer;
  }
  draw_contour_buffer(field, ix) {
    let { width, height } = this;
    width = Math.floor(width);
    height = Math.floor(height);
    this.contour_vals = this.contour_vals || new Uint8Array(4 * width * height);
    this.contour_alpha_vals = this.contour_alpha_vals || new Uint16Array(width * height);
    const { props } = this;
    props.aes.encoding.color = {
      field
    };
    props.only_color = ix;
    this.fbos.contour.use(() => {
      this.regl.clear({ color: [0, 0, 0, 0] });
      this.render_points(props);
      this.regl.read(this.contour_vals);
    });
    this.blur(this.fbos.contour, this.fbos.ping, 3);
    this.fbos.contour.use(() => {
      this.regl.read(this.contour_vals);
    });
    let i = 0;
    while (i < width * height * 4) {
      this.contour_alpha_vals[i / 4] = this.contour_vals[i + 3] * 255;
      i += 4;
    }
    return this.contour_alpha_vals;
  }
  remake_renderer() {
    const { regl: regl2 } = this;
    const parameters = {
      depth: { enable: false },
      stencil: { enable: false },
      blend: {
        enable(_, { color_picker_mode }) {
          return color_picker_mode < 0.5;
        },
        func: {
          srcRGB: "one",
          srcAlpha: "one",
          dstRGB: "one minus src alpha",
          dstAlpha: "one minus src alpha"
        }
      },
      primitive: "points",
      frag: frag_shader,
      vert: vertex_shader,
      count(_, props) {
        return props.manager.count;
      },
      attributes: {
        //        buffer_0: (_, props) => props.manager.regl_elements.get('ix'),
        //        buffer_1: this.integer_buffer
      },
      // Filled below.
      uniforms: {
        //@ts-ignore
        u_update_time: regl2.prop("update_time"),
        u_transition_duration(_, props) {
          return props.prefs.duration;
        },
        u_only_color(_, props) {
          if (props.only_color !== void 0) {
            return props.only_color;
          }
          return -2;
        },
        u_wrap_colors_after: (_, { wrap_colors_after }) => {
          if (wrap_colors_after === void 0) {
            throw new Error("wrap_colors_after is undefined");
          }
          return wrap_colors_after;
        },
        u_use_glyphset: (_, { prefs }) => prefs.glyph_set ? 1 : 0,
        u_glyphset: (_, { prefs }) => {
          if (prefs.glyph_set) {
            return this.get_image_texture(prefs.glyph_set);
          }
          return this.textures.empty_texture;
        },
        //@ts-ignore
        u_color_picker_mode: regl2.prop("color_picker_mode"),
        u_position_interpolation_mode() {
          if (this.aes.position_interpolation) {
            return 1;
          }
          return 0;
        },
        u_grid_mode: (_, { grid_mode }) => grid_mode,
        //@ts-ignore
        u_colors_as_grid: regl2.prop("colors_as_grid"),
        /*        u_constant_color: () => (this.aes.dim("color").current.constant !== undefined
          ? this.aes.dim("color").current.constant
          : [-1, -1, -1]),
        u_constant_last_color: () => (this.aes.dim("color").last.constant !== undefined
          ? this.aes.dim("color").last.constant
          : [-1, -1, -1]),*/
        u_tile_id: (_, props) => props.tile_id,
        u_width: ({ viewportWidth }) => viewportWidth,
        u_height: ({ viewportHeight }) => viewportHeight,
        u_one_d_aesthetic_map: this.aes.aesthetic_map.one_d_texture,
        u_color_aesthetic_map: this.aes.aesthetic_map.color_texture,
        u_aspect_ratio: ({ viewportWidth, viewportHeight }) => viewportWidth / viewportHeight,
        //@ts-ignore
        u_zoom_balance: regl2.prop("zoom_balance"),
        u_base_size: (_, { point_size }) => point_size,
        u_maxix: (_, { max_ix }) => max_ix,
        u_alpha: (_, { alpha }) => alpha,
        u_foreground_number: (_, { foreground }) => foreground,
        u_foreground_alpha: () => this.render_props.foreground_opacity,
        u_background_rgba: () => {
          const color2 = this.prefs.background_options.color;
          const { r, g, b } = rgb(color2);
          return [
            r / 255,
            g / 255,
            b / 255,
            this.prefs.background_options.opacity[0]
          ];
        },
        u_background_mouseover: () => this.prefs.background_options.mouseover ? 1 : 0,
        u_background_size: () => this.render_props.background_size,
        u_foreground_size: () => this.render_props.foreground_size,
        u_k: (_, props) => {
          return props.transform.k;
        },
        // Allow interpolation between different coordinate systems.
        //@ts-ignore
        u_window_scale: regl2.prop("webgl_scale"),
        //@ts-ignore
        u_last_window_scale: regl2.prop("last_webgl_scale"),
        u_time: ({ time }) => time,
        u_filter_numeric() {
          return this.aes.dim("filter").current.ops_to_array();
        },
        u_last_filter_numeric() {
          return this.aes.dim("filter").last.ops_to_array();
        },
        u_filter2_numeric() {
          return this.aes.dim("filter2").current.ops_to_array();
        },
        u_last_filter2_numeric() {
          return this.aes.dim("filter2").last.ops_to_array();
        },
        u_foreground_numeric() {
          return this.aes.dim("foreground").current.ops_to_array();
        },
        u_last_foreground_numeric() {
          return this.aes.dim("foreground").last.ops_to_array();
        },
        u_jitter: () => this.aes.dim("jitter_radius").current.jitter_int_format,
        u_last_jitter: () => this.aes.dim("jitter_radius").last.jitter_int_format,
        u_zoom(_, props) {
          return props.zoom_matrix;
        }
      }
    };
    for (const i of range(0, 16)) {
      parameters.attributes[`buffer_${i}`] = (_, { manager, buffer_num_to_variable }) => {
        const c2 = manager.regl_elements.get(buffer_num_to_variable[i]);
        return c2 || { constant: 0 };
      };
    }
    for (const k of [
      "x",
      "y",
      "color",
      "jitter_radius",
      "x0",
      "y0",
      "jitter_speed",
      "size",
      "filter",
      "filter2",
      "foreground"
      //      'character',
    ]) {
      for (const time of ["current", "last"]) {
        const temporal = time === "current" ? "" : "last_";
        parameters.uniforms[`u_${temporal}${k}_map_position`] = () => {
          return this.aes.dim(k)[time].map_position;
        };
        parameters.uniforms[`u_${temporal}${k}_buffer_num`] = (_, { aes_to_buffer_num }) => {
          const val = aes_to_buffer_num[`${k}--${time}`];
          if (val === void 0) {
            return -1;
          }
          return val;
        };
        parameters.uniforms[`u_${temporal}${k}_domain`] = () => this.aes.dim(k)[time].webGLDomain;
        parameters.uniforms[`u_${temporal}${k}_range`] = () => this.aes.dim(k)[time].range;
        parameters.uniforms[`u_${temporal}${k}_transform`] = () => {
          const t = this.aes.dim(k)[time].transform;
          if (t === "linear")
            return 1;
          if (t === "sqrt")
            return 2;
          if (t === "log")
            return 3;
          if (t === "literal")
            return 4;
          throw "Invalid transform";
        };
        parameters.uniforms[`u_${temporal}${k}_constant`] = () => {
          return this.aes.dim(k)[time].constant;
        };
      }
    }
    this._renderer = regl2(parameters);
    return this._renderer;
  }
  allocate_aesthetic_buffers() {
    const buffers = [];
    const priorities = [
      // How important is safe interpolation?
      "x",
      "y",
      "color",
      "x0",
      "y0",
      "size",
      "jitter_radius",
      "jitter_speed",
      "filter",
      "filter2",
      "foreground"
    ];
    for (const aesthetic of priorities) {
      const times = ["current", "last"];
      for (const time of times) {
        try {
          if (this.aes.dim(aesthetic)[time].field) {
            buffers.push({
              aesthetic,
              time,
              field: this.aes.dim(aesthetic)[time].field
            });
          }
        } catch (error) {
          this.reglframe = void 0;
          throw error;
        }
      }
    }
    buffers.sort((a, b) => {
      if (a.time < b.time) {
        return -1;
      }
      if (b.time < a.time) {
        return 1;
      }
      return priorities.indexOf(a.aesthetic) - priorities.indexOf(b.aesthetic);
    });
    const aes_to_buffer_num = {};
    const variable_to_buffer_num = {
      ix: 0,
      ix_in_tile: 1
    };
    let num = 1;
    for (const { aesthetic, time, field } of buffers) {
      const k = `${aesthetic}--${time}`;
      if (variable_to_buffer_num[field] !== void 0) {
        aes_to_buffer_num[k] = variable_to_buffer_num[field];
        continue;
      }
      if (num++ < 16) {
        aes_to_buffer_num[k] = num;
        variable_to_buffer_num[field] = num;
        continue;
      } else {
        aes_to_buffer_num[k] = aes_to_buffer_num[`${aesthetic}--current`];
      }
    }
    const buffer_num_to_variable = [...Object.keys(variable_to_buffer_num)];
    this.aes_to_buffer_num = aes_to_buffer_num;
    this.variable_to_buffer_num = variable_to_buffer_num;
    this.buffer_num_to_variable = buffer_num_to_variable;
  }
  get discard_share() {
    return 0;
  }
}
class TileBufferManager {
  constructor(regl2, tile, renderer) {
    this.tile = tile;
    this.regl = regl2;
    this.renderer = renderer;
    this.regl_elements = /* @__PURE__ */ new Map([
      [
        "ix_in_tile",
        {
          offset: 0,
          stride: 4,
          buffer: renderer.integer_buffer,
          byte_size: 4 * 2 ** 16
        }
      ]
    ]);
  }
  /**
   *
   * @param
   * @returns
   */
  ready() {
    const { renderer } = this;
    const needed_dimensions = /* @__PURE__ */ new Set();
    for (const [k, v] of renderer.aes) {
      for (const aesthetic of v.states) {
        if (aesthetic.field) {
          needed_dimensions.add(aesthetic.field);
        }
      }
    }
    for (const key of ["ix", "ix_in_tile", ...needed_dimensions]) {
      if (!this.ready_or_not_here_it_comes(key).ready) {
        return false;
      }
    }
    return true;
  }
  /**
   * Creates a deferred call that will populate the regl buffer
   * when there's some free time.
   *
   * @param key a string representing the requested column; must either exist in the
   * record batch or have a means for creating it asynchronously in 'transformations.'
   * @returns both an instantly available object called 'ready' that says if we're ready
   * to go: and, if the tile is ready, a promise that starts the update going and resolves
   * once it's ready.
   */
  ready_or_not_here_it_comes(key) {
    const { renderer, regl_elements } = this;
    const current = this.regl_elements.get(key);
    if (current === null) {
      return { ready: false, promise: null };
    }
    if (current === void 0) {
      if (!this.tile.ready) {
        return { ready: false, promise: null };
      }
      regl_elements.set(key, null);
      const created = new Promise((resolve) => {
        renderer.deferred_functions.push(async () => {
          await this.create_regl_buffer(key);
          resolve();
        });
      });
      return { ready: false, promise: created };
    }
    return { ready: true, promise: Promise.resolve() };
  }
  /**
   *
   * @param colname the name of the column to release
   *
   * @returns Nothing, not even if the column isn't currently defined.
   */
  release(colname) {
    let current;
    if (current = this.regl_elements.get(colname)) {
      this.renderer.buffers.free_block(current);
    }
  }
  get count() {
    return this.tile.record_batch.numRows;
  }
  async create_buffer_data(key) {
    const { tile } = this;
    if (!tile.ready) {
      throw new Error("Tile table not present.");
    }
    let column = tile.record_batch.getChild(key);
    if (!column) {
      const transformation = tile.dataset.transformations[key];
      if (transformation !== void 0) {
        await tile.apply_transformation(key);
        column = tile.record_batch.getChild(key);
        if (!column) {
          throw new Error(`${key} was not created.`);
        }
      } else {
        const col_names = tile.record_batch.schema.fields.map((d) => d.name);
        throw new Error(
          `Requested ${key} but table only has columns ["${col_names.join(
            '", "'
          )}]"`
        );
      }
    }
    if (column.data.length !== 1) {
      throw new Error(
        `Column ${key} has ${column.data.length} buffers, not 1.`
      );
    }
    if (!column.type || !column.type.typeId) {
      throw new Error(`Column ${key} has no type.`);
    }
    if (!column.type || column.type.typeId !== Type.Float32) {
      const buffer = new Float32Array(tile.record_batch.numRows);
      const source_buffer = column.data[0];
      if (column.type["dictionary"]) {
        for (let i = 0; i < tile.record_batch.numRows; i++) {
          buffer[i] = source_buffer.values[i];
        }
      } else if (column.type.typeId === Type.Bool) {
        for (let i = 0; i < tile.record_batch.numRows; i++) {
          buffer[i] = column.get(i) ? 1 : 0;
        }
      } else if (source_buffer.stride === 2 && column.type.typeId === 10) {
        const copy2 = new Int32Array(source_buffer.values).buffer;
        const view64 = new BigInt64Array(copy2);
        const timetype = column.type.unit;
        const divisor = timetype === 0 ? 1e-3 : timetype === 1 ? 1 : timetype === 2 ? 1e3 : timetype === 3 ? 1e6 : 42;
        if (divisor === 42) {
          throw new Error(`Unknown time type ${timetype}`);
        }
        for (let i = 0; i < tile.record_batch.numRows; i++) {
          buffer[i] = Number(view64[i]) / divisor;
        }
      } else {
        for (let i = 0; i < tile.record_batch.numRows; i++) {
          buffer[i] = Number(source_buffer.values[i]);
        }
      }
      return buffer;
    }
    if (column.data[0].values.constructor === Float64Array) {
      return new Float32Array(column.data[0].values);
    }
    return column.data[0].values;
  }
  async create_regl_buffer(key) {
    const { regl_elements, renderer } = this;
    const data = await this.create_buffer_data(key);
    if (data.constructor !== Float32Array) {
      console.warn(typeof data, data);
      throw new Error("Buffer data must be a Float32Array");
    }
    const item_size = 4;
    const data_length = data.length;
    const buffer_desc = renderer.buffers.allocate_block(data_length, item_size);
    regl_elements.set(key, buffer_desc);
    buffer_desc.buffer.subdata(data, buffer_desc.offset);
  }
}
class MultipurposeBufferSet {
  /**
   *
   * @param regl the Regl context we're using.
   * @param buffer_size The number of bytes on each strip of memory that we'll ask for.
   */
  constructor(regl2, buffer_size) {
    this.freed_buffers = [];
    this.regl = regl2;
    this.buffer_size = buffer_size;
    this.buffers = [];
    this.pointer = 0;
    this.generate_new_buffer();
  }
  generate_new_buffer() {
    if (this.buffers.length && this.buffer_size - this.pointer > 128) {
      this.freed_buffers.push({
        buffer: this.buffers[0],
        offset: this.pointer,
        stride: 4,
        // meaningless here.
        byte_size: this.buffer_size - this.pointer
      });
    }
    this.pointer = 0;
    this.buffers.unshift(
      this.regl.buffer({
        type: "float",
        length: this.buffer_size,
        usage: "dynamic"
      })
    );
  }
  /**
   * Freeing a block means just adding its space back into the list of open blocks.
   * There's no need to actually zero out the memory or anything.
   *
   * @param buff The location of the buffer we're done with.
   */
  free_block(buff) {
    this.freed_buffers.push(buff);
  }
  /**
   *
   * @param items The number of datapoints in the arrow column being allocated
   * @param bytes_per_item The number of bytes per item in the arrow column being allocated
   * @returns
   */
  allocate_block(items, bytes_per_item) {
    const bytes_needed = items * bytes_per_item;
    let i = 0;
    for (const buffer_loc of this.freed_buffers) {
      if (buffer_loc.byte_size === bytes_needed) {
        this.freed_buffers.splice(i, 1);
        return {
          buffer: buffer_loc.buffer,
          offset: buffer_loc.offset,
          stride: bytes_per_item,
          byte_size: bytes_needed
        };
      }
      i += 1;
    }
    if (this.pointer + items * bytes_per_item > this.buffer_size) {
      this.generate_new_buffer();
    }
    const value = {
      // First slot stores the active buffer.
      buffer: this.buffers[0],
      offset: this.pointer,
      stride: bytes_per_item,
      byte_size: items * bytes_per_item
    };
    this.pointer += items * bytes_per_item;
    return value;
  }
}
let tile_identifier = 0;
class Tile {
  constructor(dataset) {
    this.max_ix = -1;
    this._children = [];
    this.transformation_holder = {};
    this.promise = Promise.resolve();
    this.download_state = "Unattempted";
    this.key = String(Math.random());
    this.parent = null;
    this.dataset = dataset;
    this.ready = false;
    if (dataset === void 0) {
      throw new Error("No dataset provided");
    }
    this.numeric_id = tile_identifier++;
  }
  get children() {
    return this._children;
  }
  download() {
    throw new Error("Not implemented");
  }
  delete_column_if_exists(colname) {
    var _a;
    if (this._batch) {
      (_a = this._buffer_manager) == null ? void 0 : _a.release(colname);
      this._batch = add_or_delete_column(this.record_batch, colname, null);
    }
  }
  async get_column(colname) {
    if (this._batch === void 0) {
      await this.promise;
    }
    const existing = this.record_batch.getChild(colname);
    if (existing) {
      return existing;
    }
    if (this.dataset.transformations[colname]) {
      await this.apply_transformation(colname);
      return this.record_batch.getChild(colname);
    }
    throw new Error(`Column ${colname} not found`);
  }
  async apply_transformation(name) {
    if (this.transformation_holder[name] !== void 0) {
      return this.transformation_holder[name];
    }
    const transform = this.dataset.transformations[name];
    if (transform === void 0) {
      throw new Error(`Transformation ${name} is not defined`);
    }
    this.transformation_holder[name] = Promise.resolve(transform(this)).then((transformed) => {
      if (transformed === void 0) {
        throw new Error(`Transformation ${name} failed`);
      }
      this._batch = add_or_delete_column(this.record_batch, name, transformed);
    });
    return this.transformation_holder[name];
  }
  add_column(name, data) {
    this._batch = add_or_delete_column(this.record_batch, name, data);
    return this._batch;
  }
  is_visible(max_ix, viewport_limits) {
    if (this.min_ix === void 0) {
      return false;
    }
    if (this.min_ix > max_ix) {
      return false;
    }
    if (viewport_limits === void 0) {
      return true;
    }
    const c2 = this.extent;
    return !(c2.x[0] > viewport_limits.x[1] || c2.x[1] < viewport_limits.x[0] || c2.y[0] > viewport_limits.y[1] || c2.y[1] < viewport_limits.y[0]);
  }
  *points(bounding, sorted = false) {
    for (const p of this) {
      if (p_in_rect([p.x, p.y], bounding)) {
        yield p;
      }
    }
    if (sorted === false) {
      for (const child of this.children) {
        if (!child.ready) {
          continue;
        }
        if (bounding && !child.is_visible(1e100, bounding)) {
          continue;
        }
        for (const p of child.points(bounding, sorted)) {
          if (p_in_rect([p.x, p.y], bounding)) {
            yield p;
          }
        }
      }
    } else {
      throw new Error("Sorted iteration not supported");
    }
  }
  forEach(callback) {
    for (const p of this.points(void 0, false)) {
      if (p === void 0) {
        continue;
      }
      callback(p);
    }
  }
  set highest_known_ix(val) {
    if (this._highest_known_ix == void 0 || this._highest_known_ix < val) {
      this._highest_known_ix = val;
      if (this.parent) {
        this.parent.highest_known_ix = val;
      }
    }
  }
  get highest_known_ix() {
    return this._highest_known_ix || -1;
  }
  get record_batch() {
    if (this._batch) {
      return this._batch;
    }
    throw new Error("Attempted to access table on tile without table buffer.");
  }
  get min_ix() {
    if (this._min_ix !== void 0) {
      return this._min_ix;
    }
    if (this.parent) {
      return this.parent.max_ix + 1;
    }
    return 0;
  }
  async schema() {
    await this.download();
    await this.promise;
    return this._schema;
  }
  /**
   *
   * @param callback A function (possibly async) to execute before this cell is ready.
   * @returns A promise that includes the callback and all previous promises.
   */
  extend_promise(callback) {
    this.promise = this.promise.then(() => callback());
    return this.promise;
  }
  get _schema() {
    if (this.__schema) {
      return this.__schema;
    }
    const attributes = [];
    for (const field of this.record_batch.schema.fields) {
      const { name, type } = field;
      if ((type == null ? void 0 : type.typeId) == 5) {
        attributes.push({
          name,
          type: "string",
          extent: []
        });
      }
      if (type && type.dictionary) {
        attributes.push({
          name,
          type: "dictionary",
          keys: this.record_batch.getChild(name).data[0].dictionary.toArray(),
          extent: [
            0,
            this.record_batch.getChild(name).data[0].dictionary.length
          ]
        });
      }
      if (type && type.typeId == 8) {
        attributes.push({
          name,
          type: "date",
          extent: extent(this.record_batch.getChild(name).data[0].values)
        });
      }
      if ((type == null ? void 0 : type.typeId) === 10) {
        return [10, 100];
      }
      if (type && type.typeId == 3) {
        attributes.push({
          name,
          type: "float",
          extent: extent(this.record_batch.getChild(name).data[0].values)
        });
      }
    }
    this.__schema = attributes;
    return attributes;
  }
  *yielder() {
    for (const row of this.record_batch) {
      if (row) {
        yield row;
      }
    }
  }
  get extent() {
    if (this._extent) {
      return this._extent;
    }
    return {
      x: [Number.MIN_VALUE, Number.MAX_VALUE],
      y: [Number.MIN_VALUE, Number.MAX_VALUE]
    };
  }
  [Symbol.iterator]() {
    return this.yielder();
  }
  get root_extent() {
    if (this.parent === null) {
      return {
        x: [Number.MIN_VALUE, Number.MAX_VALUE],
        y: [Number.MIN_VALUE, Number.MAX_VALUE]
      };
    }
    return this.parent.root_extent;
  }
}
class QuadTile extends Tile {
  constructor(base_url, key, parent, dataset) {
    super(dataset);
    this._children = [];
    this._already_called = false;
    this.child_locations = [];
    this.url = base_url;
    this.parent = parent;
    this.key = key;
    const [z, x, y] = key.split("/").map((d) => Number.parseInt(d));
    this.codes = [z, x, y];
  }
  get extent() {
    if (this._extent) {
      return this._extent;
    }
    return this.theoretical_extent;
  }
  async download_to_depth(max_ix) {
    await this.download();
    let promises = [];
    if (this.max_ix < max_ix) {
      promises = this.children.map((child) => child.download_to_depth(max_ix));
    }
    await Promise.all(promises);
  }
  async get_arrow(suffix = void 0) {
    let url = `${this.url}/${this.key}.feather`;
    if (suffix) {
      url = url.replace(".feather", `.${suffix}.feather`);
    }
    let tb;
    let buffer;
    if (this.dataset.tileProxy !== void 0) {
      const endpoint = new URL(url).pathname;
      const bytes = await this.dataset.tileProxy.apiCall(
        endpoint,
        "GET",
        null,
        null,
        { octetStreamAsUint8: true }
      );
      tb = tableFromIPC(bytes);
    } else {
      let headers = {};
      if (window.localStorage.getItem("isLoggedIn") === "true") {
        url = url.replace("/public", "");
        const accessToken = localStorage.getItem("access_token");
        headers = {
          Authorization: `Bearer ${accessToken}`
        };
      }
      const request = {
        method: "GET",
        ...headers
      };
      const response = await fetch(url, request);
      buffer = await response.arrayBuffer();
      tb = tableFromIPC(buffer);
    }
    if (tb.batches.length > 1) {
      console.warn(
        `More than one record batch at ${url}; all but first batch will be ignored.`
      );
    }
    const batch = tb.batches[0];
    if (suffix === void 0) {
      this.download_state = "Complete";
      this._batch = tb.batches[0];
    }
    return batch;
  }
  async download() {
    if (this._download !== void 0) {
      return this._download;
    }
    if (this._already_called) {
      throw "Illegally attempting to download twice";
    }
    this._already_called = true;
    this.download_state = "In progress";
    return this._download = this.get_arrow().then((batch) => {
      this.ready = true;
      const metadata = batch.schema.metadata;
      const extent2 = metadata.get("extent");
      if (extent2) {
        this._extent = JSON.parse(extent2);
      }
      const children2 = metadata.get("children");
      if (children2) {
        this.child_locations = JSON.parse(children2);
      }
      const ixes = batch.getChild("ix");
      if (ixes === null) {
        throw "No ix column in table";
      }
      this._min_ix = Number(ixes.get(0));
      this.max_ix = Number(ixes.get(ixes.length - 1));
      if (this._min_ix > this.max_ix) {
        this.max_ix = this._min_ix + 1e5;
        this._min_ix = 0;
      }
      this.highest_known_ix = this.max_ix;
    }).catch((error) => {
      this.download_state = "Failed";
      console.error(`Error: Remote Tile at ${this.url}/${this.key}.feather not found.
        `);
      console.warn(error);
      throw error;
    });
  }
  /**
   * Sometimes it's useful to do operations on batches of tiles. This function
   * defines a grouping of tiles in the same general region to be operated on.
   * In general they will have about 80 elements (16 + 64), but the top level
   * has just 5. (4 + 1). Note a macro tile with the name [2/0/0] does not actually include
   * the tile [2/0/0] itself, but rather the tiles [4/0/0], [4/1/0], [4/0/1], [4/1/1], [5/0/0] etc.
   */
  get macrotile() {
    return macrotile(this.key);
  }
  get macro_siblings() {
    return macrotile_siblings(this.key);
  }
  get children() {
    if (this.download_state !== "Complete") {
      return [];
    }
    const constructor = this.constructor;
    if (this._children.length < this.child_locations.length) {
      for (const key of this.child_locations) {
        const child = new constructor(this.url, key, this, this.dataset);
        this._children.push(child);
      }
    }
    return this._children;
  }
  get theoretical_extent() {
    const base = this.dataset.extent;
    const [z, x, y] = this.codes;
    const x_step = base.x[1] - base.x[0];
    const each_x = x_step / 2 ** z;
    const y_step = base.y[1] - base.y[0];
    const each_y = y_step / 2 ** z;
    return {
      x: [base.x[0] + x * each_x, base.x[0] + (x + 1) * each_x],
      y: [base.y[0] + y * each_y, base.y[0] + (y + 1) * each_y]
    };
  }
}
class ArrowTile extends Tile {
  constructor(table, dataset, batch_num, parent = null) {
    super(dataset);
    this.full_tab = table;
    this._batch = table.batches[batch_num];
    this.download_state = "Complete";
    this.batch_num = batch_num;
    this.codes = [0, parent === null ? -1 : parent.batch_num, batch_num];
    if (this._batch.getChild("ix") === null) {
      console.warn("Manually setting ix");
      const batch = this._batch;
      const array2 = new Float32Array(batch.numRows);
      const seed = this.dataset._ix_seed;
      this.dataset._ix_seed += batch.numRows;
      for (let i = 0; i < batch.numRows; i++) {
        array2[i] = i + seed;
      }
      this._min_ix = seed;
      this._max_ix = seed + batch.numRows;
      this.highest_known_ix = this._max_ix;
      this._batch = add_or_delete_column(this.record_batch, "ix", array2);
    }
    this._extent = {
      x: extent(this._batch.getChild("x")),
      y: extent(this._batch.getChild("y"))
    };
    this.parent = parent;
    const row_last = this._batch.get(this._batch.numRows - 1);
    if (row_last === null) {
      throw "No rows in table";
    }
    this.max_ix = Number(row_last.ix);
    this.highest_known_ix = Number(this.max_ix);
    const row_1 = this._batch.get(0);
    if (row_1 === null) {
      throw "No rows in table";
    }
    this._min_ix = Number(row_1.ix);
    this.highest_known_ix = Number(this.max_ix);
    this.create_children();
    this.ready = true;
  }
  create_children() {
    let ix = this.batch_num * 4;
    while (++ix <= this.batch_num * 4 + 4) {
      if (ix < this.full_tab.batches.length) {
        this._children.push(
          // TODO: fix type
          new ArrowTile(this.full_tab, this.dataset, ix, this)
        );
      }
    }
    for (const child of this._children) {
      for (const dim of ["x", "y"]) {
        this._extent[dim][0] = Math.min(
          this._extent[dim][0],
          child._extent[dim][0]
        );
        this._extent[dim][1] = Math.max(
          this._extent[dim][1],
          child._extent[dim][1]
        );
      }
    }
  }
  download() {
    return Promise.resolve(this._batch);
  }
}
function p_in_rect(p, rect) {
  if (rect === void 0) {
    return true;
  }
  return p[0] < rect.x[1] && p[0] > rect.x[0] && p[1] < rect.y[1] && p[1] > rect.y[0];
}
function macrotile(key, size = 2, parents = 2) {
  let [z, x, y] = key.split("/").map((d) => parseInt(d));
  let moves = 0;
  while (!(moves >= parents && z % size == 0)) {
    x = Math.floor(x / 2);
    y = Math.floor(y / 2);
    z = z - 1;
    moves++;
  }
  return `${z}/${x}/${y}`;
}
function macrotile_siblings(key, size = 2, parents = 2) {
  return macrotile_descendants(macrotile(key, size, parents), size, parents);
}
const descendant_cache = /* @__PURE__ */ new Map();
function macrotile_descendants(macrokey, size = 2, parents = 2) {
  if (descendant_cache.has(macrokey)) {
    return descendant_cache.get(macrokey);
  }
  const parent_tiles = [[macrokey]];
  while (parent_tiles.length < parents) {
    parent_tiles.unshift(parent_tiles[0].map(children).flat());
  }
  const sibling_tiles = [parent_tiles[0].map(children).flat()];
  while (sibling_tiles.length < size) {
    sibling_tiles.unshift(sibling_tiles[0].map(children).flat());
  }
  sibling_tiles.reverse();
  const descendants = sibling_tiles.flat();
  descendant_cache.set(macrokey, descendants);
  return descendants;
}
function children(tile) {
  const [z, x, y] = tile.split("/").map((d) => parseInt(d));
  const children2 = [];
  for (let i = 0; i < 4; i++) {
    children2.push(`${z + 1}/${x * 2 + i % 2}/${y * 2 + Math.floor(i / 2)}`);
  }
  return children2;
}
class Dataset {
  /**
   * @param plot The plot to which this dataset belongs.
   **/
  constructor(plot) {
    this.transformations = {};
    this.extents = {};
    this._ix_seed = 0;
    this.plot = plot;
  }
  /**
   * The highest known point that deepscatter has seen so far. This is used
   * to adjust opacity size.
   */
  get highest_known_ix() {
    return this.root_tile.highest_known_ix;
  }
  /**
   * This allows creation of a new column in your chart.
   * 
   * A few thngs to be aware of: the point function may be run millions of times.
   * For best performance, you should not wrap complicated
   * logic in this: instead, generate any data structures outside the function.
   * 
   * name: the name to identify the new column in the data.
   * pointFunction: a function that runs on a single row of data. It accepts a single
   * argument, the data point to be transformed: technically this is a StructRowProxy
   * on the underlying Arrow frame, but for most purposes you can treat it as a dict.
   * The point is read-only--you cannot change attributes.
   * 
   * For example: suppose you have a ['lat', 'long'] column in your data and want to create a
   * new set of geo coordinates for your data. You can run the following.
   * {
   * const scale = d3.geoMollweide().extent([-20, -20, 20, 20])
   * scatterplot.register_transformation('mollweide_x', datum => {
   *  return scale([datum.long, datum.lat])[0]
   * })
   * scatterplot.register_transformation('mollweide_y', datum => {
   *  return scale([datum.long, datum.lat])[1]
   * })
   * }
   * 
   * Note some constraints: the scale is created *outside* the functions, to avoid the 
   * overhead of instantiating it every time; and the x and y coordinates are created separately
   * with separate function calls, because it's not possible to assign to both x and y simultaneously. 
   */
  register_transformation(name, pointFunction, prerequisites = []) {
    const transform = async (tile) => {
      await Promise.all(prerequisites.map((key) => tile.get_column(key)));
      const returnVal = new Float32Array(tile.record_batch.numRows);
      let i = 0;
      for (const row of tile.record_batch) {
        returnVal[i] = pointFunction(row);
        i++;
      }
      return returnVal;
    };
    this.transformations[name] = transform;
  }
  download_to_depth(max_ix) {
    return Promise.resolve();
  }
  /**
   * Attempts to build an Arrow table from all record batches.
   * If some batches have different transformations applied,
   * this will error
   *
   **/
  get table() {
    return new Table(
      this.map((d) => d).filter((d) => d.ready).map((d) => d.record_batch)
    );
  }
  static from_quadfeather(url, plot) {
    const options = {};
    if (plot.tileProxy) {
      options["tileProxy"] = plot.tileProxy;
    }
    return new QuadtileDataset(url, plot, options);
  }
  /**
   * Generate an ArrowDataset from a single Arrow table.
   *
   * @param table A single Arrow table
   * @param prefs The API Call to use for renering.
   * @param plot The Scatterplot to use.
   * @returns
   */
  static from_arrow_table(table, plot) {
    return new ArrowDataset(table, plot);
  }
  /**
   *
   * @param name The name of the column to check for
   * @returns True if the column exists in the dataset, false otherwise.
   */
  has_column(name) {
    return this.root_tile.record_batch.schema.fields.some((f) => f.name == name) || name in this.transformations;
  }
  delete_column_if_exists(name) {
    this.map((d) => d.delete_column_if_exists(name));
    delete this.transformations[name];
  }
  domain(dimension, max_ix = 1e6) {
    var _a;
    if (this.extents[dimension]) {
      return this.extents[dimension];
    }
    const dim = (_a = this._schema) == null ? void 0 : _a.fields.find((d) => d.name === dimension);
    if (dim !== void 0) {
      let min2 = void 0;
      let max2 = void 0;
      const extent1 = dim.metadata.get("extent");
      if (extent1) {
        [min2, max2] = JSON.parse(extent1);
      }
      const mmin = dim.metadata.get("min");
      if (mmin) {
        min2 = JSON.parse(mmin);
      }
      const mmax = dim.metadata.get("max");
      if (mmax) {
        max2 = JSON.parse(mmax);
      }
      if (dim.type.typeId === 10 && typeof min2 === "string") {
        min2 = Number(new Date(min2));
      }
      if (dim.type.typeId === 10 && typeof max2 === "string") {
        max2 = Number(new Date(max2));
      }
      if (typeof max2 === "string") {
        throw new Error("Failed to parse min-max as numbers");
      }
      if (min2 !== void 0) {
        return this.extents[dimension] = [min2, max2];
      }
    }
    return this.extents[dimension] = extent([
      ...new Vector(
        this.map((d) => d).filter((d) => d.ready).map((d) => d.record_batch.getChild(dimension)).filter((d) => d !== null)
      )
    ]);
  }
  *points(bbox, max_ix = 1e99) {
    const stack = [this.root_tile];
    let current;
    while (current = stack.shift()) {
      if (current.download_state == "Complete" && (bbox === void 0 || current.is_visible(max_ix, bbox))) {
        for (const point of current) {
          if (p_in_rect([point.x, point.y], bbox) && point.ix <= max_ix) {
            yield point;
          }
        }
        stack.push(...current.children);
      }
    }
  }
  /**
   * Map a function against all tiles.
   * It is often useful simply to invoke Dataset.map(d => d) to
   * get a list of all tiles in the dataset at any moment.
   *
   * @param callback A function to apply to each tile.
   * @param after Whether to perform the function in bottom-up order
   * @returns A list of the results of the function in an order determined by 'after.'
   */
  map(callback, after = false) {
    const results = [];
    this.visit((d) => {
      results.push(callback(d));
    }, after);
    return results;
  }
  /**
     * Invoke a function on all tiles in the dataset that have been downloaded.
     * The general architecture here is taken from the
     * d3 quadtree functions. That's why, for example, it doesn't
     * recurse.
  
     * @param callback The function to invoke on each tile.
     * @param after Whether to execute the visit in bottom-up order. Default false.
     * @param filter 
     */
  visit(callback, after = false, filter2 = (x) => true) {
    const stack = [this.root_tile];
    const after_stack = [];
    let current;
    while (current = stack.shift()) {
      if (!after) {
        callback(current);
      } else {
        after_stack.push(current);
      }
      if (!filter2(current)) {
        continue;
      }
      if (current.download_state == "Complete") {
        stack.push(...current.children);
      }
    }
    if (after) {
      while (current = after_stack.pop()) {
        callback(current);
      }
    }
  }
  /**
     * Invoke a function on all tiles in the dataset, downloading those that aren't 
     * here yet..
     * The general architecture here is taken from the
     * d3 quadtree functions. That's why, for example, it doesn't
     * recurse.
  
     * @param callback The function to invoke on each tile.
     * @param after Whether to execute the visit in bottom-up order. Default false.
     * @param filter 
     */
  async visit_full(callback, after = false, starting_tile = null, filter2 = (x) => true, updateFunction) {
    let seen = 0;
    const start2 = starting_tile || this.root_tile;
    await start2.download();
    const total = JSON.parse(start2.record_batch.schema.metadata.get("total_points"));
    async function resolve(tile) {
      await tile.download();
      if (after) {
        await Promise.all(tile.children.map(resolve));
        await callback(tile);
        seen += tile.record_batch.numRows;
        void updateFunction(tile, seen, total);
      } else {
        await callback(tile);
        seen += tile.record_batch.numRows;
        void updateFunction(tile, seen, total);
        await Promise.all(tile.children.map(resolve));
      }
    }
    await resolve(start2);
  }
  async schema() {
    await this.ready;
    if (this._schema) {
      return this._schema;
    }
    this._schema = this.root_tile.record_batch.schema;
    return this.root_tile.record_batch.schema;
  }
  /**
   *
   * @param field_name the name of the column to create
   * @param buffer An Arrow IPC Buffer that deserializes to a table with columns('data' and '_tile')
   */
  add_tiled_column(field_name, buffer) {
    const tb = tableFromIPC(buffer);
    const records = {};
    for (const batch of tb.batches) {
      const data = batch.getChild("data").data[0];
      if (data === null) {
        throw new Error('tiled columns must contain "data" field.');
      }
      const offsets = data.valueOffsets;
      const values = data.children[0];
      for (let i = 0; i < batch.data.length; i++) {
        const tilename = batch.getChild("_tile").get(i);
        records[tilename] = values.values.slice(
          offsets[i],
          offsets[i + 1]
          // Type coercion necessary because Float[]
          // and the backing Float32Array are not recognized as equivalent.
        );
      }
    }
    this.transformations[field_name] = function(tile) {
      const { key } = tile;
      const array2 = records[key];
      return array2;
    };
  }
  add_sparse_identifiers(field_name, ids) {
    this.transformations[field_name] = function(tile) {
      var _a;
      const { key } = tile;
      const length = tile.record_batch.numRows;
      const array2 = new Float32Array(length);
      const sparse_values = (_a = ids.values[key]) != null ? _a : [];
      for (const [ix, value] of Object.entries(sparse_values)) {
        array2[Number.parseInt(ix)] = value;
      }
      return array2;
    };
  }
  /**
   *
   * @param ids A list of ids to get, keyed to the value to set them to.
   * @param field_name The name of the new field to create
   * @param key_field The column in the dataset to match them against.
   */
  add_label_identifiers(ids, field_name, key_field = "_id") {
    if (this.transformations[field_name]) {
      throw new Error(
        `Can't overwrite existing transformation for ${field_name}`
      );
    }
    this.transformations[field_name] = function(tile) {
      return supplement_identifiers(
        tile.record_batch,
        ids,
        field_name,
        key_field
      );
    };
  }
  /**
   * Given an ix, apply a transformation to the point at that index and
   * return the transformed point (not just the transformation, the whole point)
   * As a side-effect, this applies the transformaation to all other
   * points in the same tile.
   *
   * @param transformation The name of the transformation to apply
   * @param ix The index of the point to transform
   */
  async applyTransformationToPoint(transformation, ix) {
    const matches = this.findPointRaw(ix);
    if (matches.length == 0) {
      throw new Error(`No point for ix ${ix}`);
    }
    const [tile, row, mid] = matches[0];
    if (tile.record_batch.getChild(transformation) !== null) {
      return row;
    }
    await tile.apply_transformation(transformation);
    return tile.record_batch.get(mid);
  }
  /**
   *
   * @param ix The index of the point to get.
   * @returns A structRowProxy for the point with the given index.
   */
  findPoint(ix) {
    return this.findPointRaw(ix).map(([, point]) => point);
  }
  /**
   * Finds the points and tiles that match the passed ix
   * @param ix The index of the point to get.
   * @returns A list of [tile, point] pairs that match the index.
   */
  findPointRaw(ix) {
    const matches = [];
    this.visit((tile) => {
      if (!(tile.ready && tile.record_batch && tile.min_ix <= ix && tile.max_ix >= ix)) {
        return;
      }
      const ixcol = tile.record_batch.getChild("ix");
      const mid = bisectLeft(ixcol.toArray(), ix);
      const val = tile.record_batch.get(mid);
      if (val !== null && val.ix === ix) {
        matches.push([tile, val, mid]);
      }
    });
    return matches;
  }
}
class ArrowDataset extends Dataset {
  constructor(table, plot) {
    super(plot);
    this.promise = Promise.resolve();
    this.root_tile = new ArrowTile(table, this, 0);
  }
  get extent() {
    return this.root_tile.extent;
  }
  get ready() {
    return Promise.resolve();
  }
  download_most_needed_tiles(...args) {
    return;
  }
}
class QuadtileDataset extends Dataset {
  constructor(base_url, plot, options = {}) {
    super(plot);
    this._download_queue = /* @__PURE__ */ new Set();
    if (options.tileProxy) {
      this.tileProxy = options.tileProxy;
    }
    this.root_tile = new QuadTile(base_url, "0/0/0", null, this);
    const download = this.root_tile.download();
    this.promise = download.then(
      (d) => {
        const schema = this.root_tile.record_batch.schema;
        if (schema.metadata.has("sidecars")) {
          const cars = schema.metadata.get("sidecars");
          const parsed = JSON.parse(cars);
          for (const [k, v] of Object.entries(parsed)) {
            this.transformations[k] = async function(tile) {
              const batch = await tile.get_arrow(v);
              const column = batch.getChild(k);
              if (column === null) {
                throw new Error(
                  `No column named ${k} in sidecar tile ${batch.schema.fields.map((f) => f.name).join(", ")}`
                );
              }
              return column;
            };
          }
        }
      }
    );
  }
  get ready() {
    return this.root_tile.download();
  }
  get extent() {
    return this.root_tile.extent;
  }
  /**
   * Ensures that all the tiles in a dataset are downloaded that include 
   * datapoints of index less than or equal to max_ix.
   * @param max_ix the depth to download to.
   */
  async download_to_depth(max_ix) {
    await this.root_tile.download_to_depth(max_ix);
  }
  download_most_needed_tiles(bbox, max_ix, queue_length = 4) {
    const queue = this._download_queue;
    if (queue.size >= queue_length) {
      return;
    }
    const scores = [];
    function callback(tile) {
      if (bbox === void 0) {
        return 1 / tile.codes[0];
      }
      if (tile.download_state === "Unattempted") {
        const distance = check_overlap(tile, bbox);
        scores.push([distance, tile, bbox]);
      }
    }
    this.visit(callback);
    scores.sort((a, b) => Number(a[0]) - Number(b[0]));
    while (scores.length > 0 && queue.size < queue_length) {
      const upnext = scores.pop();
      if (upnext === void 0) {
        throw new Error("Ran out of tiles unexpectedly");
      }
      const [distance, tile, _] = upnext;
      if (tile.min_ix && tile.min_ix > max_ix || distance <= 0) {
        continue;
      }
      queue.add(tile.key);
      tile.download().then(() => queue.delete(tile.key)).catch((error) => {
        console.warn("Error on", tile.key);
        queue.delete(tile.key);
        throw error;
      });
    }
  }
  /**
   *
   * @param field_name the name of the column to create
   * @param buffer An Arrow IPC Buffer that deserializes to a table with columns('data' and '_tile')
   */
  add_macrotiled_column(field_name, transformation) {
    const macrotile_tasks = {};
    const records = {};
    async function get_table(tile) {
      const { macrotile: macrotile2 } = tile;
      if (macrotile_tasks[macrotile2] !== void 0) {
        return await macrotile_tasks[macrotile2];
      } else {
        macrotile_tasks[macrotile2] = transformation(tile.macro_siblings).then(
          (buffer) => {
            const tb = tableFromIPC(buffer);
            for (const batch of tb.batches) {
              const data = batch.getChild("data");
              for (let i = 0; i < batch.data.length; i++) {
                const tilename = batch.getChild("_tile").get(i);
                records[tilename] = data.get(i);
              }
            }
            return;
          }
        );
        return macrotile_tasks[macrotile2];
      }
    }
    this.transformations[field_name] = async function(tile) {
      await get_table(tile);
      const array2 = records[tile.key];
      if (array2 instanceof Uint8Array) {
        const v = new Float32Array(array2.length);
        for (let i = 0; i < tile.record_batch.numRows; i++) {
          const byte = array2[i];
          for (let j = 0; j < 8; j++) {
            const bit = byte >> j & 1;
            v[i * 8 + j] = bit;
          }
        }
        return v;
      } else {
        return array2;
      }
    };
  }
}
function area(rect) {
  return (rect.x[1] - rect.x[0]) * (rect.y[1] - rect.y[0]);
}
function check_overlap(tile, bbox) {
  const c2 = tile.extent;
  if (c2.x[0] > bbox.x[1] || c2.x[1] < bbox.x[0] || c2.y[0] > bbox.y[1] || c2.y[1] < bbox.y[0]) {
    return 0;
  }
  const intersection = {
    x: [max([bbox.x[0], c2.x[0]]), min([bbox.x[1], c2.x[1]])],
    y: [max([bbox.y[0], c2.y[0]]), min([bbox.y[1], c2.y[1]])]
  };
  const { x, y } = intersection;
  let disqualify = 0;
  if (x[0] > x[1]) {
    disqualify -= 1;
  }
  if (y[0] > y[1]) {
    disqualify -= 2;
  }
  if (disqualify < 0) {
    return disqualify;
  }
  return area(intersection) / area(bbox);
}
let dval = 4e4;
function add_or_delete_column(batch, field_name, data) {
  const tb = {};
  for (const field of batch.schema.fields) {
    if (field.name === field_name) {
      if (data === null) {
        continue;
      } else {
        throw new Error(`Name ${field.name} already exists, can't add.`);
      }
    }
    const current = batch.getChild(field.name);
    const coldata = current.data[0];
    tb[field.name] = coldata;
  }
  if (data === void 0) {
    throw new Error("Must pass data to bind_column");
  }
  if (data !== null) {
    if (data instanceof Float32Array) {
      tb[field_name] = makeVector({ type: new Float32(), data, length: data.length }).data[0];
    } else if (data instanceof BigInt64Array) {
      tb[field_name] = makeVector({ type: new Int64(), data, length: data.length }).data[0];
    } else if (data instanceof Uint8Array) {
      tb[field_name] = makeVector({ type: new Uint8(), data, length: data.length }).data[0];
    } else if (data.data.length > 0) {
      let newval = data.data[0];
      if (newval.dictionary) {
        const dicto = newval;
        const newv = makeVector({
          data: dicto.values,
          // indexes into the dictionary
          dictionary: dicto.dictionary,
          // keys
          type: new Dictionary(dicto.type.dictionary, dicto.type.indices, dval++)
          // increment the identifier.
        });
        newval = newv.data[0];
      }
      tb[field_name] = newval;
    } else {
      console.warn(`Unknown data format object passed to add or remove columns--treating as Data, but this behavior is deprecated`, data);
      tb[field_name] = data;
    }
  }
  const new_batch = new RecordBatch(tb);
  // for (const [k, v] of batch.schema.metadata) {
  //   new_batch.schema.metadata.set(k, v);
  // }
  for (const oldfield of batch.schema.fields) {
    const newfield = new_batch.schema.fields.find(
      (d) => d.name === oldfield.name
    );
    if (newfield !== void 0) {
      // for (const [k, v] of oldfield.metadata) {
      //   newfield.metadata.set(k, v);
      // }
      console.log("Copying metadata");
    } else if (data !== null) {
      throw new Error("Error!");
    }
  }
  if (data !== null) {
    const this_field = new_batch.schema.fields.find(
      (d) => d.name === field_name
    );
    // this_field == null ? void 0 : this_field.metadata.set(
    //   "created by deepscatter",
    //   new Date().toISOString()
    // );
  }
  return new_batch;
}
function supplement_identifiers(batch, ids, field_name, key_field = "_id") {
  const updatedFloatArray = new Float32Array(batch.numRows);
  const kfield = batch.getChild(key_field);
  if (kfield === null) {
    throw new Error(`Field ${key_field} not found in batch`);
  }
  if (kfield.type.typeId === Type.Int64 || kfield.type.typeId === Type.Uint64) {
    for (let i = 0; i < batch.numRows; i++) {
      const value = ids[String(kfield.get(i))];
      if (value !== void 0) {
        updatedFloatArray[i] = value;
      }
    }
    return updatedFloatArray;
  }
  const hashtab = /* @__PURE__ */ new Set();
  for (const item of Object.keys(ids)) {
    const code = [0, 1, 2, 3].map((i) => item.charCodeAt(i) || "").join("");
    hashtab.add(code);
  }
  const offsets = kfield.data[0].valueOffsets;
  const values = kfield.data[0].values;
  for (let i = 0; i < batch.numRows; i++) {
    const code = values.slice(offsets[i], offsets[i + 1]);
    const shortversion = code.slice(0, 4).join("");
    if (hashtab.has(shortversion)) {
      const stringtime = String.fromCharCode(...code);
      if (ids[stringtime] !== void 0) {
        updatedFloatArray[i] = ids[stringtime];
      }
    }
  }
  return updatedFloatArray;
}
var dist = {};
var quickselectExports = {};
var quickselect = {
  get exports() {
    return quickselectExports;
  },
  set exports(v) {
    quickselectExports = v;
  }
};
(function(module, exports) {
  (function(global2, factory) {
    module.exports = factory();
  })(commonjsGlobal, function() {
    function quickselect2(arr, k, left, right, compare) {
      quickselectStep(arr, k, left || 0, right || arr.length - 1, compare || defaultCompare);
    }
    function quickselectStep(arr, k, left, right, compare) {
      while (right > left) {
        if (right - left > 600) {
          var n = right - left + 1;
          var m = k - left + 1;
          var z = Math.log(n);
          var s = 0.5 * Math.exp(2 * z / 3);
          var sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
          var newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
          var newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
          quickselectStep(arr, k, newLeft, newRight, compare);
        }
        var t = arr[k];
        var i = left;
        var j = right;
        swap(arr, left, k);
        if (compare(arr[right], t) > 0)
          swap(arr, left, right);
        while (i < j) {
          swap(arr, i, j);
          i++;
          j--;
          while (compare(arr[i], t) < 0)
            i++;
          while (compare(arr[j], t) > 0)
            j--;
        }
        if (compare(arr[left], t) === 0)
          swap(arr, left, j);
        else {
          j++;
          swap(arr, j, right);
        }
        if (j <= k)
          left = j + 1;
        if (k <= j)
          right = j - 1;
      }
    }
    function swap(arr, i, j) {
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    function defaultCompare(a, b) {
      return a < b ? -1 : a > b ? 1 : 0;
    }
    return quickselect2;
  });
})(quickselect);
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  var quickselect2 = quickselectExports;
  var nodePool = [];
  var freeNode = function(node) {
    return nodePool.push(node);
  };
  var freeAllNode = function(node) {
    if (node) {
      freeNode(node);
      if (!isLeaf(node)) {
        node.children.forEach(freeAllNode);
      }
    }
  };
  var allowNode = function(children2) {
    var node = nodePool.pop();
    if (node) {
      node.children = children2;
      node.height = 1;
      node.leaf = true;
      node.minX = Infinity;
      node.minY = Infinity;
      node.minZ = Infinity;
      node.maxX = -Infinity;
      node.maxY = -Infinity;
      node.maxZ = -Infinity;
    } else {
      node = {
        children: children2,
        height: 1,
        leaf: true,
        minX: Infinity,
        minY: Infinity,
        minZ: Infinity,
        maxX: -Infinity,
        maxY: -Infinity,
        maxZ: -Infinity
      };
    }
    return node;
  };
  var distNodePool = [];
  var freeDistNode = function(node) {
    return distNodePool.push(node);
  };
  var allowDistNode = function(dist2, node) {
    var heapNode = distNodePool.pop();
    if (heapNode) {
      heapNode.dist = dist2;
      heapNode.node = node;
    } else {
      heapNode = { dist: dist2, node };
    }
    return heapNode;
  };
  var isLeaf = function(node) {
    return node.leaf;
  };
  var isLeafChild = function(node, child) {
    return node.leaf;
  };
  var findItem = function(item, items, equalsFn) {
    if (!equalsFn)
      return items.indexOf(item);
    for (var i = 0; i < items.length; i++) {
      if (equalsFn(item, items[i]))
        return i;
    }
    return -1;
  };
  var calcBBox = function(node) {
    distBBox(node, 0, node.children.length, node);
  };
  var distBBox = function(node, k, p, destNode) {
    var dNode = destNode;
    if (dNode) {
      dNode.minX = Infinity;
      dNode.minY = Infinity;
      dNode.minZ = Infinity;
      dNode.maxX = -Infinity;
      dNode.maxY = -Infinity;
      dNode.maxZ = -Infinity;
    } else {
      dNode = allowNode([]);
    }
    for (var i = k, child = void 0; i < p; i++) {
      child = node.children[i];
      extend2(dNode, child);
    }
    return dNode;
  };
  var extend2 = function(a, b) {
    a.minX = Math.min(a.minX, b.minX);
    a.minY = Math.min(a.minY, b.minY);
    a.minZ = Math.min(a.minZ, b.minZ);
    a.maxX = Math.max(a.maxX, b.maxX);
    a.maxY = Math.max(a.maxY, b.maxY);
    a.maxZ = Math.max(a.maxZ, b.maxZ);
    return a;
  };
  var bboxVolume = function(a) {
    return (a.maxX - a.minX) * (a.maxY - a.minY) * (a.maxZ - a.minZ);
  };
  var bboxMargin = function(a) {
    return a.maxX - a.minX + (a.maxY - a.minY) + (a.maxZ - a.minZ);
  };
  var enlargedVolume = function(a, b) {
    var minX = Math.min(a.minX, b.minX), minY = Math.min(a.minY, b.minY), minZ = Math.min(a.minZ, b.minZ), maxX = Math.max(a.maxX, b.maxX), maxY = Math.max(a.maxY, b.maxY), maxZ = Math.max(a.maxZ, b.maxZ);
    return (maxX - minX) * (maxY - minY) * (maxZ - minZ);
  };
  var intersectionVolume = function(a, b) {
    var minX = Math.max(a.minX, b.minX), minY = Math.max(a.minY, b.minY), minZ = Math.max(a.minZ, b.minZ), maxX = Math.min(a.maxX, b.maxX), maxY = Math.min(a.maxY, b.maxY), maxZ = Math.min(a.maxZ, b.maxZ);
    return Math.max(0, maxX - minX) * Math.max(0, maxY - minY) * Math.max(0, maxZ - minZ);
  };
  var contains = function(a, b) {
    return a.minX <= b.minX && a.minY <= b.minY && a.minZ <= b.minZ && b.maxX <= a.maxX && b.maxY <= a.maxY && b.maxZ <= a.maxZ;
  };
  exports.intersects = function(a, b) {
    return b.minX <= a.maxX && b.minY <= a.maxY && b.minZ <= a.maxZ && b.maxX >= a.minX && b.maxY >= a.minY && b.maxZ >= a.minZ;
  };
  exports.boxRayIntersects = function(box, ox, oy, oz, idx, idy, idz) {
    var tx0 = (box.minX - ox) * idx;
    var tx1 = (box.maxX - ox) * idx;
    var ty0 = (box.minY - oy) * idy;
    var ty1 = (box.maxY - oy) * idy;
    var tz0 = (box.minZ - oz) * idz;
    var tz1 = (box.maxZ - oz) * idz;
    var z0 = Math.min(tz0, tz1);
    var z1 = Math.max(tz0, tz1);
    var y02 = Math.min(ty0, ty1);
    var y12 = Math.max(ty0, ty1);
    var x02 = Math.min(tx0, tx1);
    var x12 = Math.max(tx0, tx1);
    var tmin = Math.max(0, x02, y02, z0);
    var tmax = Math.min(x12, y12, z1);
    return tmax >= tmin ? tmin : Infinity;
  };
  var multiSelect = function(arr, left, right, n, compare) {
    var stack = [left, right];
    var mid;
    while (stack.length) {
      right = stack.pop();
      left = stack.pop();
      if (right - left <= n)
        continue;
      mid = left + Math.ceil((right - left) / n / 2) * n;
      quickselect2(arr, mid, left, right, compare);
      stack.push(left, mid, mid, right);
    }
  };
  var compareMinX = function(a, b) {
    return a.minX - b.minX;
  };
  var compareMinY = function(a, b) {
    return a.minY - b.minY;
  };
  var compareMinZ = function(a, b) {
    return a.minZ - b.minZ;
  };
  var RBush3D = function() {
    function RBush3D2(maxEntries) {
      if (maxEntries === void 0) {
        maxEntries = 16;
      }
      this.maxEntries = Math.max(maxEntries, 8);
      this.minEntries = Math.max(4, Math.ceil(this.maxEntries * 0.4));
      this.clear();
    }
    RBush3D2.alloc = function() {
      return this.pool.pop() || new this();
    };
    RBush3D2.free = function(rbush) {
      rbush.clear();
      this.pool.push(rbush);
    };
    RBush3D2.prototype.search = function(bbox) {
      var node = this.data;
      var result = [];
      if (!exports.intersects(bbox, node))
        return result;
      var nodesToSearch = [];
      while (node) {
        for (var i = 0, len = node.children.length; i < len; i++) {
          var child = node.children[i];
          if (exports.intersects(bbox, child)) {
            if (isLeafChild(node))
              result.push(child);
            else if (contains(bbox, child))
              this._all(child, result);
            else
              nodesToSearch.push(child);
          }
        }
        node = nodesToSearch.pop();
      }
      return result;
    };
    RBush3D2.prototype.collides = function(bbox) {
      var node = this.data;
      if (!exports.intersects(bbox, node))
        return false;
      var nodesToSearch = [];
      while (node) {
        for (var i = 0, len = node.children.length; i < len; i++) {
          var child = node.children[i];
          if (exports.intersects(bbox, child)) {
            if (isLeafChild(node) || contains(bbox, child))
              return true;
            nodesToSearch.push(child);
          }
        }
        node = nodesToSearch.pop();
      }
      return false;
    };
    RBush3D2.prototype.raycastInv = function(ox, oy, oz, idx, idy, idz, maxLen) {
      if (maxLen === void 0) {
        maxLen = Infinity;
      }
      var node = this.data;
      if (idx === Infinity && idy === Infinity && idz === Infinity)
        return allowDistNode(Infinity, void 0);
      if (exports.boxRayIntersects(node, ox, oy, oz, idx, idy, idz) === Infinity)
        return allowDistNode(Infinity, void 0);
      var heap = [allowDistNode(0, node)];
      var swap = function(a, b) {
        var t = heap[a];
        heap[a] = heap[b];
        heap[b] = t;
      };
      var pop = function() {
        var top = heap[0];
        var newLen = heap.length - 1;
        heap[0] = heap[newLen];
        heap.length = newLen;
        var idx2 = 0;
        while (true) {
          var left = idx2 << 1 | 1;
          if (left >= newLen)
            break;
          var right = left + 1;
          if (right < newLen && heap[right].dist < heap[left].dist) {
            left = right;
          }
          if (heap[idx2].dist < heap[left].dist)
            break;
          swap(idx2, left);
          idx2 = left;
        }
        freeDistNode(top);
        return top.node;
      };
      var push = function(dist3, node2) {
        var idx2 = heap.length;
        heap.push(allowDistNode(dist3, node2));
        while (idx2 > 0) {
          var p = idx2 - 1 >> 1;
          if (heap[p].dist <= heap[idx2].dist)
            break;
          swap(idx2, p);
          idx2 = p;
        }
      };
      var dist2 = maxLen;
      var result;
      while (heap.length && heap[0].dist < dist2) {
        node = pop();
        for (var i = 0, len = node.children.length; i < len; i++) {
          var child = node.children[i];
          var d = exports.boxRayIntersects(child, ox, oy, oz, idx, idy, idz);
          if (!isLeafChild(node)) {
            push(d, child);
          } else if (d < dist2) {
            if (d === 0) {
              return allowDistNode(d, child);
            }
            dist2 = d;
            result = child;
          }
        }
      }
      return allowDistNode(dist2 < maxLen ? dist2 : Infinity, result);
    };
    RBush3D2.prototype.raycast = function(ox, oy, oz, dx, dy, dz, maxLen) {
      if (maxLen === void 0) {
        maxLen = Infinity;
      }
      return this.raycastInv(ox, oy, oz, 1 / dx, 1 / dy, 1 / dz, maxLen);
    };
    RBush3D2.prototype.all = function() {
      return this._all(this.data, []);
    };
    RBush3D2.prototype.load = function(data) {
      if (!(data && data.length))
        return this;
      if (data.length < this.minEntries) {
        for (var i = 0, len = data.length; i < len; i++) {
          this.insert(data[i]);
        }
        return this;
      }
      var node = this.build(data.slice(), 0, data.length - 1, 0);
      if (!this.data.children.length) {
        this.data = node;
      } else if (this.data.height === node.height) {
        this.splitRoot(this.data, node);
      } else {
        if (this.data.height < node.height) {
          var tmpNode = this.data;
          this.data = node;
          node = tmpNode;
        }
        this._insert(node, this.data.height - node.height - 1, true);
      }
      return this;
    };
    RBush3D2.prototype.insert = function(item) {
      if (item)
        this._insert(item, this.data.height - 1);
      return this;
    };
    RBush3D2.prototype.clear = function() {
      if (this.data) {
        freeAllNode(this.data);
      }
      this.data = allowNode([]);
      return this;
    };
    RBush3D2.prototype.remove = function(item, equalsFn) {
      if (!item)
        return this;
      var node = this.data;
      var i = 0;
      var goingUp = false;
      var index;
      var parent;
      var path = [];
      var indexes = [];
      while (node || path.length) {
        if (!node) {
          node = path.pop();
          i = indexes.pop();
          parent = path[path.length - 1];
          goingUp = true;
        }
        if (isLeaf(node)) {
          index = findItem(item, node.children, equalsFn);
          if (index !== -1) {
            node.children.splice(index, 1);
            path.push(node);
            this.condense(path);
            return this;
          }
        }
        if (!goingUp && !isLeaf(node) && contains(node, item)) {
          path.push(node);
          indexes.push(i);
          i = 0;
          parent = node;
          node = node.children[0];
        } else if (parent) {
          i++;
          node = parent.children[i];
          goingUp = false;
        } else {
          node = void 0;
        }
      }
      return this;
    };
    RBush3D2.prototype.toJSON = function() {
      return this.data;
    };
    RBush3D2.prototype.fromJSON = function(data) {
      freeAllNode(this.data);
      this.data = data;
      return this;
    };
    RBush3D2.prototype.build = function(items, left, right, height) {
      var N = right - left + 1;
      var M = this.maxEntries;
      var node;
      if (N <= M) {
        node = allowNode(items.slice(left, right + 1));
        calcBBox(node);
        return node;
      }
      if (!height) {
        height = Math.ceil(Math.log(N) / Math.log(M));
        M = Math.ceil(N / Math.pow(M, height - 1));
      }
      node = allowNode([]);
      node.leaf = false;
      node.height = height;
      var N3 = Math.ceil(N / M), N2 = N3 * Math.ceil(Math.pow(M, 2 / 3)), N1 = N3 * Math.ceil(Math.pow(M, 1 / 3));
      multiSelect(items, left, right, N1, compareMinX);
      for (var i = left; i <= right; i += N1) {
        var right2 = Math.min(i + N1 - 1, right);
        multiSelect(items, i, right2, N2, compareMinY);
        for (var j = i; j <= right2; j += N2) {
          var right3 = Math.min(j + N2 - 1, right2);
          multiSelect(items, j, right3, N3, compareMinZ);
          for (var k = j; k <= right3; k += N3) {
            var right4 = Math.min(k + N3 - 1, right3);
            node.children.push(this.build(items, k, right4, height - 1));
          }
        }
      }
      calcBBox(node);
      return node;
    };
    RBush3D2.prototype._all = function(node, result) {
      var nodesToSearch = [];
      while (node) {
        if (isLeaf(node))
          result.push.apply(result, node.children);
        else
          nodesToSearch.push.apply(nodesToSearch, node.children);
        node = nodesToSearch.pop();
      }
      return result;
    };
    RBush3D2.prototype.chooseSubtree = function(bbox, node, level, path) {
      var minVolume;
      var minEnlargement;
      var targetNode;
      while (true) {
        path.push(node);
        if (isLeaf(node) || path.length - 1 === level)
          break;
        minVolume = minEnlargement = Infinity;
        for (var i = 0, len = node.children.length; i < len; i++) {
          var child = node.children[i];
          var volume = bboxVolume(child);
          var enlargement = enlargedVolume(bbox, child) - volume;
          if (enlargement < minEnlargement) {
            minEnlargement = enlargement;
            minVolume = volume < minVolume ? volume : minVolume;
            targetNode = child;
          } else if (enlargement === minEnlargement) {
            if (volume < minVolume) {
              minVolume = volume;
              targetNode = child;
            }
          }
        }
        node = targetNode || node.children[0];
      }
      return node;
    };
    RBush3D2.prototype.split = function(insertPath, level) {
      var node = insertPath[level];
      var M = node.children.length;
      var m = this.minEntries;
      this.chooseSplitAxis(node, m, M);
      var splitIndex = this.chooseSplitIndex(node, m, M);
      var newNode = allowNode(node.children.splice(splitIndex, node.children.length - splitIndex));
      newNode.height = node.height;
      newNode.leaf = node.leaf;
      calcBBox(node);
      calcBBox(newNode);
      if (level)
        insertPath[level - 1].children.push(newNode);
      else
        this.splitRoot(node, newNode);
    };
    RBush3D2.prototype.splitRoot = function(node, newNode) {
      this.data = allowNode([node, newNode]);
      this.data.height = node.height + 1;
      this.data.leaf = false;
      calcBBox(this.data);
    };
    RBush3D2.prototype.chooseSplitIndex = function(node, m, M) {
      var minOverlap = Infinity;
      var minVolume = Infinity;
      var index;
      for (var i = m; i <= M - m; i++) {
        var bbox1 = distBBox(node, 0, i);
        var bbox2 = distBBox(node, i, M);
        var overlap = intersectionVolume(bbox1, bbox2);
        var volume = bboxVolume(bbox1) + bboxVolume(bbox2);
        if (overlap < minOverlap) {
          minOverlap = overlap;
          index = i;
          minVolume = volume < minVolume ? volume : minVolume;
        } else if (overlap === minOverlap) {
          if (volume < minVolume) {
            minVolume = volume;
            index = i;
          }
        }
      }
      return index;
    };
    RBush3D2.prototype.chooseSplitAxis = function(node, m, M) {
      var xMargin = this.allDistMargin(node, m, M, compareMinX);
      var yMargin = this.allDistMargin(node, m, M, compareMinY);
      var zMargin = this.allDistMargin(node, m, M, compareMinZ);
      if (xMargin < yMargin && xMargin < zMargin) {
        node.children.sort(compareMinX);
      } else if (yMargin < xMargin && yMargin < zMargin) {
        node.children.sort(compareMinY);
      }
    };
    RBush3D2.prototype.allDistMargin = function(node, m, M, compare) {
      node.children.sort(compare);
      var leftBBox = distBBox(node, 0, m);
      var rightBBox = distBBox(node, M - m, M);
      var margin = bboxMargin(leftBBox) + bboxMargin(rightBBox);
      for (var i = m; i < M - m; i++) {
        var child = node.children[i];
        extend2(leftBBox, child);
        margin += bboxMargin(leftBBox);
      }
      for (var i = M - m - 1; i >= m; i--) {
        var child = node.children[i];
        extend2(rightBBox, child);
        margin += bboxMargin(rightBBox);
      }
      return margin;
    };
    RBush3D2.prototype.adjustParentBBoxes = function(bbox, path, level) {
      for (var i = level; i >= 0; i--) {
        extend2(path[i], bbox);
      }
    };
    RBush3D2.prototype.condense = function(path) {
      for (var i = path.length - 1, siblings = void 0; i >= 0; i--) {
        if (path[i].children.length === 0) {
          if (i > 0) {
            siblings = path[i - 1].children;
            siblings.splice(siblings.indexOf(path[i]), 1);
            freeNode(path[i]);
          } else {
            this.clear();
          }
        } else {
          calcBBox(path[i]);
        }
      }
    };
    RBush3D2.prototype._insert = function(item, level, isNode) {
      var insertPath = [];
      var node = this.chooseSubtree(item, this.data, level, insertPath);
      node.children.push(item);
      extend2(node, item);
      while (level >= 0) {
        if (insertPath[level].children.length > this.maxEntries) {
          this.split(insertPath, level);
          level--;
        } else
          break;
      }
      this.adjustParentBBoxes(item, insertPath, level);
    };
    RBush3D2.pool = [];
    return RBush3D2;
  }();
  exports.RBush3D = RBush3D;
})(dist);
const handler = drag();
function pixel_ratio(scatterplot) {
  const [px1, px2] = scatterplot._zoom.scales().x.range();
  const [dx1, dx2] = scatterplot._zoom.scales().x.domain();
  const ratio = (px2 - px1) / (dx2 - dx1);
  return ratio;
}
const RECT_DEFAULT_OPACITY = 0;
class LabelMaker extends Renderer {
  /**
   *
   * @param scatterplot
   * @param id_raw
   * @param options
   */
  constructor(scatterplot, id_raw, options = {}) {
    super(scatterplot.div.node(), scatterplot._root, scatterplot);
    this.layers = [];
    this.options = {};
    this.options = options;
    this.canvas = scatterplot.elements[2].selectAll("canvas").node();
    const svg = scatterplot.elements[3].selectAll("svg").node();
    const id2 = id_raw.replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g, "---");
    const labgroup = svg.querySelectorAll(`#${id2}`);
    if (labgroup.length === 0) {
      this.labelgroup = select(svg).select("#labelrects").append("g").attr("id", id2).node();
    } else {
      this.labelgroup = labgroup[1];
    }
    if (this.canvas === void 0) {
      throw new Error("WTF?");
    }
    this.ctx = this.canvas.getContext("2d");
    this.tree = new DepthTree(
      this.ctx,
      pixel_ratio(scatterplot),
      0.5,
      [0.5, 1e6],
      options.margin === void 0 ? 30 : options.margin
    );
    this.bind_zoom(scatterplot._renderer.zoom);
  }
  /**
   * Start rendering a set of labels.
   *
   * @param ticks How many milliseconds until the renderer should be stopped.
   */
  start(ticks2 = 1e9) {
    if (this.timer) {
      this.timer.stop();
    }
    select(this.labelgroup).attr("display", "inline");
    this.timer = timer(() => {
      this.render();
      ticks2 -= 1;
      if (ticks2 <= 0) {
        this.stop();
      }
    });
  }
  delete() {
    select(this.labelgroup).remove();
  }
  /**
   * Stop the rendering of this set.
   */
  stop() {
    if (this.timer) {
      this.timer.stop();
      select(this.labelgroup).attr("display", "none");
      this.ctx.clearRect(0, 0, 4096, 4096);
      this.timer = void 0;
    }
  }
  /**
   *
   * @param featureset A feature collection of labels to display. Currently each feature must be a Point.
   * @param label_key The field in each geojson feature that includes the label for the object.
   * @param size_key The field in each geojson feature that includes the size
   */
  update(featureset, label_key, size_key) {
    var _a;
    this.label_key = label_key;
    for (const feature of featureset.features) {
      const { properties, geometry } = feature;
      if (properties === null) {
        continue;
      }
      if (geometry.type === "Point") {
        const size = (_a = properties[size_key]) != null ? _a : 16;
        let label = "";
        if (properties[label_key] !== void 0 && properties[label_key] !== null) {
          label = properties[label_key];
        }
        const p = {
          x: geometry.coordinates[0] + Math.random() * 0.1,
          y: geometry.coordinates[1] + Math.random() * 0.1,
          text: label,
          height: size,
          properties
        };
        this.tree.insert_point(p);
      }
    }
  }
  render() {
    const context2 = this.ctx;
    const { x_, y_ } = this.zoom.scales();
    const { transform } = this.zoom;
    const { width, height } = this;
    context2.clearRect(0, 0, width, height);
    context2.textAlign = "center";
    context2.textBaseline = "middle";
    context2.globalAlpha = 1;
    const size_adjust = 1;
    const corners = this.zoom.current_corners();
    const overlaps = this.tree.search({
      minX: corners.x[0],
      minY: corners.y[0],
      minZ: transform.k,
      maxX: corners.x[1],
      maxY: corners.y[1],
      maxZ: transform.k
    });
    context2.clearRect(0, 0, 4096, 4096);
    const dim = this.scatterplot.dim("color");
    const bboxes = select(this.labelgroup).selectAll("rect.labelbbox").data(overlaps, (d) => "" + d.minZ + d.minX).join(
      (enter) => enter.append("rect").attr("class", "labellbox").style("opacity", RECT_DEFAULT_OPACITY)
    );
    const Y_BUFFER = 5;
    for (const d of overlaps) {
      const datum2 = d.data;
      const x = x_(datum2.x);
      const y = y_(datum2.y);
      context2.globalAlpha = 1;
      context2.fillStyle = "white";
      let mark_hidden = false;
      for (const filter2 of [
        this.scatterplot.dim("filter"),
        this.scatterplot.dim("filter2")
      ]) {
        if (datum2.properties[filter2.field]) {
          if (!filter2.apply(datum2.properties)) {
            mark_hidden = true;
          }
        }
      }
      if (mark_hidden) {
        datum2.properties.__display = "none";
        continue;
      } else {
        datum2.properties.__display = "inline";
      }
      if (this.options.useColorScale === false || this.options.useColorScale === void 0) {
        context2.shadowColor = "#71797E";
        context2.strokeStyle = "#71797E";
      } else if (datum2.properties[dim.field]) {
        const exists = dim.scale.domain().indexOf(datum2.properties[dim.field]) > -1;
        if (exists) {
          context2.shadowColor = dim.scale(datum2.properties[dim.field]);
          context2.strokeStyle = dim.scale(datum2.properties[dim.field]);
        } else {
          context2.shadowColor = "gray";
          context2.strokeStyle = "gray";
        }
      } else {
        context2.shadowColor = "black";
      }
      let emphasize = 0;
      if (this.hovered === "" + d.minZ + d.minX) {
        emphasize += 2;
      }
      context2.font = `${datum2.height * size_adjust + emphasize}pt verdana`;
      context2.shadowBlur = 12 + emphasize * 3;
      context2.lineWidth = 3 + emphasize;
      context2.strokeText(datum2.text, x, y);
      context2.shadowBlur = 0;
      context2.lineWidth = 4 + emphasize;
      context2.fillStyle = "white";
      context2.fillText(datum2.text, x, y);
    }
    bboxes.attr("class", "labelbbox").attr(
      "x",
      (d) => x_(d.data.x) - d.data.pixel_width * this.tree.pixel_ratio / 2
    ).attr(
      "y",
      (d) => y_(d.data.y) - d.data.pixel_height * this.tree.pixel_ratio / 2 - Y_BUFFER
    ).attr("width", (d) => d.data.pixel_width * this.tree.pixel_ratio).attr("stroke", "red").attr(
      "height",
      (d) => d.data.pixel_height * this.tree.pixel_ratio + Y_BUFFER * 2
    ).attr("display", (d) => {
      return d.data.properties.__display || "inline";
    }).on("mouseover", (event, d) => {
      select(event.target).style("opacity", RECT_DEFAULT_OPACITY);
      this.hovered = "" + d.minZ + d.minX;
      event.stopPropagation();
      return;
    }).on("mousemove", function(event, d) {
      event.stopPropagation();
    }).on("click", (event, d) => {
      this.scatterplot.label_click(d.data, this.scatterplot, this);
    }).on("mouseout", (event, d) => {
      this.hovered = void 0;
      event.stopPropagation();
      return;
    });
    if (this.options.draggable_labels) {
      handler.on("drag", (event, d) => {
        d.data.x = x_.invert(event.x);
        d.data.y = y_.invert(event.y);
      });
      handler.on("end", (event, d) => {
        console.log({ text: d.data.text, x: d.data.x, y: d.data.y });
      });
      bboxes.call(handler);
    }
    context2.shadowColor = "black";
    context2.strokeStyle = "black";
  }
}
let context = null;
function getContext() {
  if (context !== null) {
    return context;
  }
  const canvas = document.createElement("canvas");
  canvas.width = 500;
  canvas.height = 400;
  context = canvas.getContext("2d");
  return context;
}
function measure_text(d, pixel_ratio2, margin) {
  const context2 = getContext();
  context2.font = `${d.height}pt verdana`;
  if (d.text === "") {
    return null;
  }
  const ms = context2.measureText(d.text);
  let {
    actualBoundingBoxLeft,
    actualBoundingBoxRight,
    actualBoundingBoxAscent,
    actualBoundingBoxDescent
  } = ms;
  if (Number.isNaN(actualBoundingBoxLeft) || actualBoundingBoxLeft === void 0) {
    actualBoundingBoxLeft = 0;
    actualBoundingBoxRight = ms.width;
    actualBoundingBoxAscent = d.height;
    actualBoundingBoxDescent = 0;
  }
  return {
    pixel_height: (actualBoundingBoxAscent - actualBoundingBoxDescent) / pixel_ratio2 + margin / pixel_ratio2,
    pixel_width: (actualBoundingBoxRight - actualBoundingBoxLeft) / pixel_ratio2 + margin / pixel_ratio2
  };
}
class DepthTree extends dist.RBush3D {
  /*
  dataSpaceWidth: at zoom level one, how many screen pixels does one x, y unit occupy?
  */
  constructor(context2, pixel_ratio2, scale_factor = 0.5, zoom2 = [0.1, 1e3], margin = 10) {
    super();
    this._accessor = (p) => [p.x, p.y];
    this.scale_factor = scale_factor;
    this.mindepth = zoom2[0];
    this.maxdepth = zoom2[1];
    this.context = context2;
    this.pixel_ratio = pixel_ratio2;
    this.margin = margin;
  }
  /**
   *
   * @param p1 a point
   * @param p2 another point
   * @returns The lowest zoom level at which the two points collide
   */
  max_collision_depth(p1, p2) {
    const [x12, y12] = this._accessor(p1);
    const [x2, y2] = this._accessor(p2);
    const xdiff = Math.abs(x12 - x2);
    const xoverlap = (p1.pixel_width + p2.pixel_width) / 2;
    const width_overlap = xoverlap / xdiff;
    const ydiff = Math.abs(y12 - y2);
    const yoverlap = (p1.pixel_height + p2.pixel_height) / 2;
    const height_overlap = yoverlap / ydiff;
    const max_overlap = Math.min(width_overlap, height_overlap);
    return max_overlap;
  }
  set accessor(f) {
    this._accessor = f;
  }
  get accessor() {
    return this._accessor;
  }
  to3d(point, zoom2 = 1, maxZ) {
    const [x, y] = this.accessor(point);
    const { pixel_height, pixel_width } = point;
    const p = {
      minX: x - pixel_width / zoom2 / 2,
      maxX: x + pixel_width / zoom2 / 2,
      minY: y - pixel_height / zoom2 / 2,
      maxY: y + pixel_height / zoom2 / 2,
      minZ: zoom2,
      maxZ: maxZ || this.maxdepth,
      data: point
    };
    if (Number.isNaN(x) || Number.isNaN(y))
      throw "Missing position" + JSON.stringify(point);
    if (Number.isNaN(pixel_width))
      throw "Missing Aspect Ratio" + JSON.stringify(point);
    return p;
  }
  insert_point(point, mindepth = 1 / 4) {
    if (point.text === void 0 || point.text === "") {
      return;
    }
    let measured;
    if (point["pixel_width"] === void 0) {
      measured = {
        ...point,
        ...measure_text(point, this.pixel_ratio, this.margin)
      };
    } else {
      measured = point;
    }
    const p3d = this.to3d(measured, mindepth, this.maxdepth);
    if (!this.collides(p3d)) {
      if (mindepth <= this.mindepth) {
        this.insert(p3d);
      } else {
        this.insert_point(point, mindepth / 2);
      }
    } else {
      this.insert_after_collisions(p3d);
    }
  }
  insert_after_collisions(p3d) {
    let hidden_until = -1;
    let hidden_by;
    for (const overlapper of this.search(p3d)) {
      const blocked_until = this.max_collision_depth(p3d.data, overlapper.data);
      if (blocked_until > hidden_until) {
        hidden_until = blocked_until;
        hidden_by = overlapper;
      }
    }
    if (hidden_by && hidden_until < this.maxdepth) {
      const hid_data = hidden_by.data;
      const hid_start = hidden_by.minZ;
      const hid_end = hidden_by.maxZ;
      if (hid_start < hidden_until) {
        this.remove(hidden_by);
        const upper_rect = this.to3d(hid_data, hid_start, hidden_until);
        this.insert(upper_rect);
        const lower_rect = this.to3d(hid_data, hidden_until, hid_end);
        this.insert(lower_rect);
      }
      const current_rect = this.to3d(p3d.data, hidden_until, this.maxdepth);
      this.insert(current_rect);
    }
  }
}
function isIdSelectParam(params) {
  return params.ids !== void 0;
}
function isBooleanColumnParam(params) {
  return params.field !== void 0;
}
function isCompositeSelectParam(params) {
  return params.composition !== void 0;
}
function isComposition(elems) {
  if (elems === void 0)
    throw new Error("Undefined composition");
  if (!elems)
    return false;
  if (!elems.length)
    return false;
  const op = elems[0];
  return ["AND", "OR", "XOR", "NOT", "ANY", "ALL"].indexOf(op) == 0;
}
async function extractBitmask(tile, arg) {
  if (isComposition(arg)) {
    return applyCompositeFunctionToTile(tile, arg);
  } else {
    const column = tile.get_column(arg.name);
    return Bitmask.from_arrow(await column);
  }
}
async function applyCompositeFunctionToTile(tile, args) {
  args[0];
  if (args[0] === "NOT") {
    const bitmask = await extractBitmask(tile, args[1]);
    return bitmask.not();
  } else if (isBinarySelectParam(args)) {
    const [op, arg1, arg2] = args;
    const bitmask1 = await extractBitmask(tile, arg1);
    const bitmask2 = await extractBitmask(tile, arg2);
    if (op === "AND") {
      return bitmask1.and(bitmask2);
    } else if (op === "OR") {
      return bitmask1.or(bitmask2);
    } else if (op === "XOR") {
      return bitmask1.xor(bitmask2);
    } else {
      throw new Error("Unknown binary operation");
    }
  } else if (isPluralSelectParam(args)) {
    const op = args[0];
    const bitmasks = await Promise.all(args.slice(1).map((arg) => extractBitmask(tile, arg)));
    const accumulated = bitmasks.slice(1).reduce((previousValue, currentValue) => {
      switch (op) {
        case "ALL":
          return previousValue.and(currentValue);
        case "ANY":
          return previousValue.or(currentValue);
        case "NONE":
          return previousValue.or(currentValue);
      }
    }, bitmasks[0]);
    if (op === "NONE")
      return accumulated.not();
    return accumulated;
  }
  console.error("UNABLE TO PARSE", args);
  throw new Error("UNABLE TO PARSE");
}
function isPluralSelectParam(params) {
  const things = /* @__PURE__ */ new Set(["ANY", "ALL", "NONE"]);
  return things.has(params[0]);
}
function isBinarySelectParam(params) {
  const things = /* @__PURE__ */ new Set(["AND", "OR", "XOR", "NAND"]);
  return things.has(params[0]);
}
function isFunctionSelectParam(params) {
  return params.tileFunction !== void 0;
}
class Bitmask {
  constructor(length, mask) {
    this.length = length;
    this.mask = mask || new Uint8Array(Math.ceil(length / 8));
  }
  static from_arrow(vector) {
    const mask = vector.data[0].values;
    return new Bitmask(vector.length, mask);
  }
  to_arrow() {
    return new Vector([
      makeData({
        type: new Bool(),
        data: this.mask,
        length: this.length
      })
    ]);
  }
  set(i) {
    const byte = Math.floor(i / 8);
    const bit = i % 8;
    this.mask[byte] |= 1 << bit;
  }
  and(other) {
    const result = new Bitmask(this.length);
    for (let i = 0; i < this.mask.length; i++) {
      result.mask[i] = this.mask[i] & other.mask[i];
    }
    return result;
  }
  or(other) {
    const result = new Bitmask(this.length);
    for (let i = 0; i < this.mask.length; i++) {
      result.mask[i] = this.mask[i] | other.mask[i];
    }
    return result;
  }
  xor(other) {
    const result = new Bitmask(this.length);
    for (let i = 0; i < this.mask.length; i++) {
      result.mask[i] = this.mask[i] ^ other.mask[i];
    }
    return result;
  }
  not() {
    const result = new Bitmask(this.length);
    for (let i = 0; i < this.mask.length; i++) {
      result.mask[i] = ~this.mask[i];
    }
    return result;
  }
}
class DataSelection {
  constructor(plot, params) {
    this.match_count = [];
    this.cursor = 0;
    this.complete = false;
    this.selectionSize = 0;
    this.evaluationSetSize = 0;
    this.tiles = [];
    this.composition = null;
    this.events = {};
    this.plot = plot;
    this.dataset = plot.dataset;
    this.name = params.name;
    let markReady = function() {
    };
    this.ready = new Promise((resolve, reject) => {
      markReady = resolve;
    });
    this.composition = null;
    if (isIdSelectParam(params)) {
      this.add_identifier_column(params.name, params.ids, params.idField).then(markReady);
    } else if (isBooleanColumnParam(params)) {
      this.add_boolean_column(params.name, params.field).then(markReady);
    } else if (isFunctionSelectParam(params)) {
      this.add_function_column(params.name, params.tileFunction).then(markReady);
    } else if (isCompositeSelectParam(params)) {
      const { name, composition } = params;
      this.composition = composition;
      this.add_function_column(name, async (tile) => {
        const bitmask = await applyCompositeFunctionToTile(tile, composition);
        return bitmask.to_arrow();
      }).then(markReady);
    }
  }
  /**
   * 
   * @param event an internally dispatched event.
   * @param listener a function to call back. It takes
   * as an argument the `tile` that was just added.
   */
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }
  dispatch(event, args) {
    if (this.events[event]) {
      this.events[event].forEach((listener) => listener(args));
    }
  }
  /**
   * 
   * Ensures that the selection has been evaluated on all
   * tiles loaded in the dataset. This is useful if, for example,
   * your selection represents a search, and you are zoomed in on 
   * one portion of the map; this will immediately execute the search
   * (subject to delays to avoid blocking the main thread) on all tiles
   * that have been fetched even if out of the viewport.
   * 
   * Resolves upon completion.
  */
  applyToAllLoadedTiles() {
    return Promise.all(this.dataset.map((tile) => {
      if (tile.ready) {
        return tile.get_column(this.name);
      }
    })).then(() => {
    });
  }
  /**
   * 
   * Downloads all unloaded tiles in the dataset and applies the 
   * transformation to them. Use with care! For > 10,000,000 point
   * datasets, if called from Europe this may cause the transatlantic fiber-optic internet backbone 
   * cables to melt.
   */
  applyToAllTiles() {
    throw new Error("Method not implemented.");
  }
  /**
   * 
   * A function that combines two selections into a third
   * selection that is the union of the two.
   */
  union(other, name) {
    return new DataSelection(this.plot, {
      name: name || this.name + " union " + other.name,
      composition: ["OR", this, other]
    });
  }
  /**
   * 
   * A function that combines two selections into a third
   * selection that is the intersection of the two. Note--for more complicated
   * queries than simple intersection/union, use the (not yet defined)
   * disjunctive normal form constructor.
   */
  intersection(other, name) {
    return new DataSelection(this.plot, {
      name: name || this.name + " intersection " + other.name,
      composition: ["AND", this, other]
    });
  }
  /**
   * Advances the cursor (the currently selected point) by a given number of rows.
   * steps forward or backward. Wraps from the beginning to the end.
   * 
   * @param by the number of rows to move the cursor by
   * 
   * @returns the selection, for chaining
   */
  moveCursor(by) {
    this.cursor += by;
    if (this.cursor >= this.selectionSize) {
      this.cursor = this.cursor % this.selectionSize;
    }
    if (this.cursor < 0) {
      this.cursor = this.selectionSize + this.cursor;
    }
    return this;
  }
  async removePoints(name, ixes) {
    return this.add_or_remove_points(name, ixes, "remove");
  }
  // Non-editable behavior: 
  // if a single point is added, will also adjust the cursor.
  async addPoints(name, ixes) {
    return this.add_or_remove_points(name, ixes, "add");
  }
  /**
   * Returns all the data points in the selection, limited to 
   * data currently on the screen.
   * 
   * @param fields A list of fields in the data to export.
   */
  async export(fields, format2 = "json") {
    const columns = Object.fromEntries(fields.map((field) => [field, []]));
    for (let row of this) {
      for (let field of fields) {
        columns[field].push(row[field]);
      }
    }
    return columns;
  }
  moveCursorToPoint(point) {
    const ix = point.ix;
    if (point.ix === void 0) {
      throw new Error("Unable to move cursor to point, because it has no `ix` property.");
    }
    let currentOffset = 0;
    let relevantTile = void 0;
    let current_tile_ix = 0;
    let positionInTile;
    for (let match_length of this.match_count) {
      const tile = this.tiles[current_tile_ix];
      if (tile.min_ix < ix && tile.max_ix > ix) {
        const mid = bisectLeft([...tile.record_batch.getChild("ix").data[0].values], point.ix);
        const val = tile.record_batch.get(mid);
        if (val !== null && val.ix === ix) {
          relevantTile = tile;
          positionInTile = mid;
          break;
        }
      }
      current_tile_ix += 1;
      currentOffset += match_length;
    }
    if (relevantTile === void 0 || positionInTile === void 0) {
      return null;
    }
    const column = relevantTile.record_batch.getChild(this.name);
    for (let j = 0; j < positionInTile; j++) {
      if (column.get(j)) {
        currentOffset += 1;
      }
    }
    this.cursor = currentOffset;
  }
  async add_or_remove_points(name, ixes, which) {
    let newCursor = 0;
    let tileOfMatch = void 0;
    const tileFunction = async (tile) => {
      newCursor = -1;
      await this.ready;
      let value = (await tile.get_column(this.name)).toArray();
      const ixcol = tile.record_batch.getChild("ix").data[0].values;
      for (let ix of ixes) {
        const mid = bisectLeft([...ixcol], ix);
        const val = tile.record_batch.get(mid);
        if (val !== null && val.ix === ix) {
          value = new Float32Array(value);
          if (which === "add") {
            value[mid] = 1;
            if (ixes.length === 1) {
              tileOfMatch = tile.key;
              let offset_in_tile = 0;
              for (let i = 0; i < mid; i++) {
                if (value[i] > 0) {
                  offset_in_tile += 1;
                }
              }
              newCursor = offset_in_tile;
            }
          } else {
            value[mid] = 0;
          }
        }
      }
      return value;
    };
    const selection2 = new DataSelection(this.plot, {
      name,
      tileFunction
    });
    selection2.on("tile loaded", () => {
      if (newCursor >= 0) {
        selection2.cursor = newCursor;
        for (let i = 0; i < selection2.tiles.length; i++) {
          const tile = selection2.tiles[i];
          if (tile.key === tileOfMatch) {
            break;
          }
          selection2.cursor += this.match_count[i];
        }
      }
    });
    await selection2.ready;
    for (const tile of this.tiles) {
      await tile.get_column(name);
    }
    return selection2;
  }
  get ordering() {
    throw new Error("Method not implemented.");
  }
  /**
   * 
   * @param name the name for the column to assign in the dataset.
   * @param tileFunction The transformation to apply
   */
  async add_function_column(name, tileFunction) {
    if (this.dataset.has_column(name)) {
      throw new Error(`Column ${name} already exists, can't create`);
    }
    this.plot.dataset.transformations[name] = this.wrapWithSelectionMetadata(tileFunction);
    await this.dataset.root_tile.apply_transformation(name);
  }
  /**
   * 
   * Takes a user-defined supplied transformation and adds some bookkeeping
   * for the various count variables.
   * 
   * @param functionToApply the user-defined transformation
   */
  wrapWithSelectionMetadata(functionToApply) {
    return async (tile) => {
      const array2 = await functionToApply(tile);
      const batch = tile.record_batch;
      let matches = 0;
      for (let i = 0; i < batch.numRows; i++) {
        if (array2["get"] && array2["get"](i) || array2[i]) {
          matches++;
        }
      }
      this.match_count.push(matches);
      this.tiles.push(tile);
      this.selectionSize += matches;
      this.evaluationSetSize += batch.numRows;
      this.dispatch("tile loaded", tile);
      return array2;
    };
  }
  /**
   * The total number of points in the set. At present, always a light wrapper around
   * the total number of points in the dataset.
   */
  get totalSetSize() {
    return this.dataset.highest_known_ix;
  }
  /**
   * 
   * Returns the nth element in the selection. This is a bit tricky because
   * the selection is stored as a list of tiles, each of which has a list of
   * matches. So we have to iterate through the tiles until we find the one
   * that contains the nth match, then iterate through the matches in that
   * tile until we find the nth match.
   * 
   * @param i the index of the row to get
   */
  get(i) {
    if (i === void 0) {
      i = this.cursor;
    }
    if (i > this.selectionSize) {
      throw new Error(`Index ${i} out of bounds for selection of size ${this.selectionSize}`);
    }
    let currentOffset = 0;
    let relevantTile = void 0;
    let current_tile_ix = 0;
    for (let match_length of this.match_count) {
      if (i < currentOffset + match_length) {
        relevantTile = this.tiles[current_tile_ix];
        break;
      }
      current_tile_ix += 1;
      currentOffset += match_length;
    }
    if (relevantTile === void 0) {
      return null;
    }
    const column = relevantTile.record_batch.getChild(this.name);
    const offset = i - currentOffset;
    let ix_in_match = 0;
    for (let j = 0; j < column.length; j++) {
      if (column.get(j)) {
        if (ix_in_match === offset) {
          return relevantTile.record_batch.get(j);
        }
        ix_in_match++;
      }
    }
    throw new Error(`unable to locate point ${i}`);
  }
  // Iterate over the points in raw order.
  *[Symbol.iterator]() {
    for (let tile of this.tiles) {
      const column = tile.record_batch.getChild(this.name);
      for (let i = 0; i < column.length; i++) {
        if (column.get(i)) {
          yield tile.record_batch.get(i);
        }
      }
    }
  }
  async add_identifier_column(name, codes, key_field, options = {}) {
    if (this.dataset.has_column(name)) {
      throw new Error(`Column ${name} already exists, can't create`);
    }
    if (typeof codes[0] === "string") {
      const matcher2 = stringmatcher(key_field, codes);
      this.plot.dataset.transformations[name] = this.wrapWithSelectionMetadata(matcher2);
      await this.dataset.root_tile.apply_transformation(name);
    } else if (typeof codes[0] === "bigint") {
      const matcher2 = bigintmatcher(key_field, codes);
      this.plot.dataset.transformations[name] = this.wrapWithSelectionMetadata(matcher2);
      await this.dataset.root_tile.apply_transformation(name);
    } else {
      console.error("Unable to match type", typeof codes[0]);
    }
    if (options.plot_after) {
      return this.apply_to_foreground({});
    }
  }
  async add_boolean_column(name, field) {
    throw new Error("Method not implemented.");
  }
  apply_to_foreground(params) {
    const field = this.name;
    const background_options = {
      size: [0.5, 10],
      ...params
    };
    return this.plot.plotAPI({
      background_options,
      encoding: {
        foreground: {
          field,
          op: "gt",
          a: 0
        }
      }
    });
  }
}
function bigintmatcher(field, matches) {
  const matchings = new Set(matches);
  return async function(tile) {
    const col = (await tile.get_column(field)).data[0];
    const values = col.values;
    const bitmask = new Bitmask(tile.record_batch.numRows);
    for (let i = 0; i < tile.record_batch.numRows; i++) {
      matchings.has(values[i]) && bitmask.set(i);
    }
    return bitmask.to_arrow();
  };
}
function stringmatcher(field, matches) {
  if (field === void 0) {
    throw new Error("Field must be defined");
  }
  const trie = [];
  function addToTrie(arr) {
    let node = trie;
    for (const byte of arr) {
      if (!node[byte]) {
        node[byte] = [];
      }
      node = node[byte];
    }
    node[256] = [];
  }
  const encoder = new TextEncoder();
  for (const str of matches) {
    const arr = encoder.encode(str);
    addToTrie(arr);
  }
  return async function(tile) {
    const col = (await tile.get_column(field)).data[0];
    const bytes = col.values;
    const offsets = col.valueOffsets;
    const bitmask = new Bitmask(tile.record_batch.numRows);
    function existsInTrie(start2, len) {
      let node = trie;
      for (let i = 0; i < len; i++) {
        const byte = bytes[start2 + i];
        node = node[byte];
        if (!node) {
          return false;
        }
      }
      return node[256] !== void 0;
    }
    for (let o = 0; o < tile.record_batch.numRows; o++) {
      const start2 = offsets[o];
      const end = offsets[o + 1];
      if (existsInTrie(start2, end - start2)) {
        bitmask.set(o);
      }
    }
    return bitmask.to_arrow();
  };
}
let currentDictNumber = 7540;
function dictionaryFromArrays(labels, indices) {
  const labelsArrow = vectorFromArray(labels, new Utf8());
  if (indices === void 0) {
    return (indices2) => createDictionaryWithVector(labelsArrow, indices2);
  }
  return createDictionaryWithVector(labelsArrow, indices);
}
function createDictionaryWithVector(labelsArrow, indices) {
  let t;
  if (indices[Symbol.toStringTag] === `Int8Array`) {
    t = new Int8();
  } else if (indices[Symbol.toStringTag] === `Int16Array`) {
    t = new Int16();
  } else if (indices[Symbol.toStringTag] === `Int32Array`) {
    t = new Int32();
  } else {
    throw new Error(
      "values must be an array of signed integers, 32 bit or smaller."
    );
  }
  const type = new Dictionary(labelsArrow.type, t, currentDictNumber++, false);
  const returnval = makeVector({
    type,
    length: indices.length,
    nullCount: 0,
    data: indices,
    dictionary: labelsArrow
  });
  return returnval;
}
const default_background_options = {
  color: "gray",
  opacity: [0.2, 1],
  size: [0.66, 1],
  mouseover: false
};
const default_API_call = {
  zoom_balance: 0.35,
  // One second transitions
  duration: 1e3,
  // Not many points.
  max_points: 1e3,
  // Encoding defaults are handled by the Aesthetic class.
  encoding: {},
  point_size: 1,
  // base size before aes modifications.
  alpha: 40,
  // Default screen saturation target.
  background_options: default_background_options,
  zoom_align: "center"
};
const base_elements = [
  {
    id: "canvas-2d-background",
    nodetype: "canvas"
  },
  {
    id: "webgl-canvas",
    nodetype: "canvas"
  },
  {
    id: "canvas-2d",
    nodetype: "canvas"
  },
  {
    id: "deepscatter-svg",
    nodetype: "svg"
  }
];
class Scatterplot {
  /**
   * @param selector A DOM selector for the div in which the scatterplot will live.
   * @param width The width of the scatterplot (in pixels)
   * @param height The height of the scatterplot (in pixels)
   */
  constructor(selector2, width, height, options = {}) {
    this.secondary_renderers = {};
    this.selection_history = [];
    this.util = {
      dictionaryFromArrays,
      vectorFromArray
    };
    this.plot_queue = Promise.resolve();
    this.hooks = {};
    this.mark_ready = function() {
    };
    this.bound = false;
    if (selector2 !== void 0) {
      this.bind(selector2, width, height);
    }
    this.width = width;
    this.height = height;
    this.ready = new Promise((resolve, reject) => {
      this.mark_ready = resolve;
    });
    this.click_handler = new ClickFunction(this);
    this.tooltip_handler = new TooltipHTML(this);
    this.label_click_handler = new LabelClick(this);
    this.handle_highlit_point_change = new ChangeToHighlitPointFunction(this);
    if (options.tileProxy) {
      this.tileProxy = options.tileProxy;
    }
    if (options.dataset) {
      void this.load_dataset(options.dataset);
    }
    this.prefs = { ...default_API_call };
  }
  /**
   * @param selector A selector for the root element of the deepscatter; must already exist.
   * @param width Width of the plot, in pixels.
   * @param height Height of the plot, in pixels.
   */
  bind(selector2, width, height) {
    this.div = select(selector2).selectAll("div.deepscatter_container").data([1]).join("div").attr("class", "deepscatter_container").style("position", "absolute");
    if (this.div.empty()) {
      console.error(selector2);
      throw "Must pass a valid div selector";
    }
    this.elements = [];
    for (const d of base_elements) {
      const container = this.div.append("div").attr("id", `container-for-${d.id}`).style("position", "absolute").style("top", 0).style("left", 0).style("pointer-events", d.id === "deepscatter-svg" ? "auto" : "none");
      const el = container.append(d.nodetype).attr("id", d.id).attr("width", width || window.innerWidth).attr("height", height || window.innerHeight);
      if (d.nodetype === "svg") {
        el.append("g").attr("id", "mousepoints");
        el.append("g").attr("id", "labelrects");
      }
      this.elements.push(container);
    }
    this.bound = true;
  }
  /**
   * Creates a new selection from a set of parameters, and immediately applies it to the plot.
   * @param params A set of parameters defining a selection. 
  */
  async select_and_plot(params, duration = this.prefs.duration) {
    const selection2 = await this.select_data(params);
    await selection2.ready;
    await this.plotAPI({
      duration,
      encoding: {
        foreground: {
          field: selection2.name,
          op: "eq",
          a: 1
        }
      }
    });
    return selection2;
  }
  /**
   * 
   * @param params A set of parameters for selecting data based on ids, a boolean column, or a function.
   * @returns A DataSelection object that can be used to extend the selection.
   * 
   * See `select_and_plot` for a method that will select data and plot it.
   */
  async select_data(params) {
    if (params.useNameCache && params.name && this.selection_history.length > 0) {
      const old_version = this.selection_history.find((x) => x.name === params.name);
      if (old_version) {
        this.selection_history = [...this.selection_history.filter((x) => x.name !== params.name), old_version];
        return old_version.selection;
      }
    }
    const selection2 = new DataSelection(this, params);
    this.selection_history.push({
      selection: selection2,
      name: selection2.name,
      flushed: false
    });
    await selection2.ready;
    return selection2;
  }
  /**
   *
   * @param name The name of the new column to be created. If it already exists, this will throw an error in invocation
   * @param codes The codes to be assigned labels. This can be either a list of ids (in which case all ids will have the value 1.0 assigned)
   *   **or** a keyed of values like `{'Rome': 3, 'Vienna': 13}` in which case the numeric values will be used.
   * @param key_field The field in which to look for the identifiers.
   */
  add_identifier_column(name, codes, key_field) {
    const true_codes = Array.isArray(codes) ? Object.fromEntries(codes.map((next) => [next, 1])) : codes;
    this._root.add_label_identifiers(true_codes, name, key_field);
  }
  async add_labels_from_url(url, name, label_key, size_key, options) {
    await this.ready;
    await this._root.promise;
    return fetch(url).then(async (data) => {
      const features = await data.json();
      this.add_labels(features, name, label_key, size_key, options);
    }).catch((error) => {
      console.warn(error);
      console.error("Broken addition of ", name);
    });
  }
  /**
   *
   * @param features A geojson feature collection containing point labels
   * @param name A unique key to associate with this labelset. Labels can be enabled or disabled using this key.
   * @param label_key The text field in which the labels are stored in the geojson object.
   * @param size_key A field in the dataset to associate with the *size* of the labels.
   * @param label_options Additional custom passed to the labeller.
   *
   * Usage:
   *
   * To add a set of labels to your map, create a geojson array of points where
   * the 'properties' field contains a column to use for labels. E.g., each entry might look like
   * this. Each feature will be inserted into a label hierarchy to attempt to avoid inclusion.
   * If the label_key corresponds to the currently active color dimension on your map,
   * the labels will be drawn with appropriately colored outlines: otherwise, they will
   * all have a black outline.
   * **Currently it is necessary that labels be inserted in order**.
   *
   *
   */
  add_labels(features, name, label_key, size_key, options = {}) {
    const labels = new LabelMaker(this, name, options);
    labels.update(features, label_key, size_key);
    this.secondary_renderers[name] = labels;
    this.secondary_renderers[name].start();
  }
  /**
   * An alias to avoid using the underscored method directly.
   */
  get dataset() {
    if (this._root === void 0) {
      throw new Error("No dataset has been loaded");
    }
    return this._root;
  }
  add_api_label(labelset) {
    const geojson = {
      type: "FeatureCollection",
      features: labelset.labels.map((label) => {
        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [label.x, label.y]
          },
          properties: {
            text: label.text,
            size: label.size || void 0
          }
        };
      })
    };
    this.add_labels(
      geojson,
      labelset.name,
      "text",
      "size",
      labelset.options || {}
    );
  }
  async load_dataset(params) {
    if (params.source_url !== void 0) {
      this._root = Dataset.from_quadfeather(params.source_url, this);
    } else if (params.arrow_table !== void 0) {
      this._root = Dataset.from_arrow_table(params.arrow_table, this);
    } else if (params.arrow_buffer !== void 0) {
      const tb = tableFromIPC(params.arrow_buffer);
      this._root = Dataset.from_arrow_table(tb, this);
    } else {
      throw new Error("No source_url or arrow_table specified");
    }
    await this._root.ready;
    return this._root;
  }
  async reinitialize() {
    var _a;
    const { prefs } = this;
    await this._root.ready;
    this._renderer = new ReglRenderer(
      "#container-for-webgl-canvas",
      this._root,
      this
    );
    this._zoom = new Zoom("#deepscatter-svg", this.prefs, this);
    this._zoom.attach_tiles(this._root);
    this._zoom.attach_renderer("regl", this._renderer);
    this._zoom.initialize_zoom();
    const bkgd = select("#container-for-canvas-2d-background").select("canvas");
    const ctx = bkgd.node().getContext("2d");
    ctx.fillStyle = (_a = prefs.background_color) != null ? _a : "rgba(133, 133, 111, .8)";
    ctx.fillRect(0, 0, window.innerWidth * 2, window.innerHeight * 2);
    void this._renderer.initialize();
    void this._root.promise.then(() => this.mark_ready());
    return this.ready;
  }
  /*
  registerBackgroundMap(url) {
    if (!this.geojson) {
      this.geojson = "in progress"
      d3json(url).then(d => {
        const holder = new GeoLines(d, this._renderer.regl)
        this._renderer.geolines = holder
      })
    }
  }
  */
  /*
  registerPolygonMap(definition) {
    const { file, color } = definition;
    if (!this.feather_features) {
      this.feather_features = {};
      this._renderer.geo_polygons = [];
    }
    if (!this.feather_features[file]) {
      this.feather_features[file] = 'in progress';
      const promise = fetch(file)
        .then((response) => response.arrayBuffer())
        .then((response) => {
          const table = Table.from(response);
          const holder = new FeatureHandler(this._renderer.regl, table);
          this._renderer.geo_polygons.push(holder);
        });
    }
  }
  */
  visualize_tiles() {
    const canvas = this.elements[2].selectAll("canvas").node();
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 1e4, 1e4);
    const { x_, y_ } = this._zoom.scales();
    ctx.strokeStyle = "#888888";
    const tiles = this._root.map((t) => t);
    for (const i of range(20)) {
      setTimeout(() => {
        for (const tile of tiles) {
          if (!tile.codes || tile.codes[0] != i) {
            continue;
          }
          if (!tile.extent) {
            continue;
          }
          const [x12, x2] = tile.extent.x.map((x) => x_(x));
          const [y12, y2] = tile.extent.y.map((y) => y_(y));
          const depth = tile.codes[0];
          ctx.lineWidth = 8 / Math.sqrt(depth);
          ctx.globalAlpha = 0.33;
          ctx.strokeRect(x12, y12, x2 - x12, y2 - y12);
          if (tile.download_state !== "Unattempted") {
            ctx.fillRect(x12, y12, x2 - x12, y2 - y12);
          }
          ctx.globalAlpha = 1;
        }
      }, i * 400);
    }
    setTimeout(() => ctx.clearRect(0, 0, 1e4, 1e4), 17 * 400);
  }
  /**
   * Destroy the scatterplot and release all associated resources.
   * This is necessary because removing a deepscatter instance
   * will not de-allocate tables from GPU memory.
   */
  destroy() {
    var _a, _b, _c;
    (_b = (_a = this._renderer) == null ? void 0 : _a.regl) == null ? void 0 : _b.destroy();
    (_c = this.div) == null ? void 0 : _c.node().parentElement.replaceChildren();
  }
  update_prefs(prefs) {
    if (this.prefs.encoding && prefs.encoding) {
      for (const k of Object.keys(this.prefs.encoding)) {
        if (prefs.encoding[k] !== void 0) {
          this.prefs.encoding[k] = prefs.encoding[k];
        }
      }
    }
    lodash_mergeExports(this.prefs, prefs);
  }
  /**
   * Hooks provide a mechanism to run arbitrary code after call of plotAPI has resolved.
   * This is useful for--e.g.--updating a legend only when the plot changes.
   *
   * @param name The name of the hook to add.
   * @param hook A function to run after each plot command.
   */
  add_hook(name, hook, unsafe = false) {
    if (this.hooks[name] !== void 0 && !unsafe) {
      throw new Error(`Hook ${name} already exists`);
    }
    this.hooks[name] = hook;
  }
  remove_hook(name, unsafe = false) {
    if (this.hooks[name] === void 0) {
      if (unsafe) {
        return;
      }
      throw new Error(`Hook ${name} does not exist`);
    }
    delete this.hooks[name];
  }
  stop_labellers() {
    console.log("Stopping labels");
    for (const [k, v] of Object.entries(this.secondary_renderers)) {
      if (v && v["label_key"] !== void 0) {
        this.secondary_renderers[k].stop();
        this.secondary_renderers[k].delete();
        this.secondary_renderers[k] = void 0;
      }
    }
  }
  /**
   *
   *
   * @param dimension The name of the encoding dimension to access
   * information about. E.g. ("color", "x", etc.)
   * @returns
   */
  dim(dimension) {
    return this._renderer.aes.dim(dimension).current;
  }
  set tooltip_html(func) {
    this.tooltip_handler.f = func;
  }
  get tooltip_html() {
    return this.tooltip_handler.f;
  }
  set label_click(func) {
    this.label_click_handler.f = func;
  }
  get label_click() {
    return this.label_click_handler.f.bind(this.label_click_handler);
  }
  set highlit_point_change(func) {
    this.handle_highlit_point_change.f = func;
  }
  get highlit_point_change() {
    return this.handle_highlit_point_change.f.bind(
      this.handle_highlit_point_change
    );
  }
  set click_function(func) {
    this.click_handler.f = func;
  }
  get click_function() {
    return this.click_handler.f;
  }
  /**
   * Plots a set of prefs, and returns a promise that resolves
   * upon the completion of the plot (not including any time for transitions).
   */
  async plotAPI(prefs) {
    if (prefs === void 0) {
      return;
    }
    await this.plot_queue;
    if (prefs) {
      await this.start_transformations(prefs);
    }
    this.plot_queue = this.unsafe_plotAPI(prefs);
    await this.plot_queue;
    for (const [_, hook] of Object.entries(this.hooks)) {
      hook();
    }
    return;
  }
  /**
   * Get a short head start on transformations. This prevents a flicker
   * when a new data field needs to be loaded onto the GPU.
   *
   * @param prefs The API call to prepare.
   * @param delay Delay in milliseconds to give the data to get onto the GPU.
   * 110 ms seems like a decent compromise; barely perceptible to humans as a UI response
   * time, but enough time
   * for three animation ticks to run.
   * @returns A promise that resolves immediately if there's no work to do,
   * or after the delay if there is.
   */
  async start_transformations(prefs, delay = 110) {
    return new Promise((resolve) => {
      if (this.prefs.duration < delay) {
        delay = this.prefs.duration;
      }
      const needed_keys = /* @__PURE__ */ new Set();
      if (!prefs.encoding) {
        resolve();
      }
      for (const [k, v] of Object.entries(prefs.encoding)) {
        if (v && typeof v !== "string" && v["field"] !== void 0) {
          needed_keys.add(v["field"]);
        }
      }
      if (this._renderer) {
        const promises = [];
        const sine_qua_non = [];
        for (const tile of this._renderer.visible_tiles()) {
          const manager = tile._buffer_manager;
          if (manager !== void 0 && manager.ready()) {
            for (const key of needed_keys) {
              const { ready, promise } = manager.ready_or_not_here_it_comes(key);
              if (!ready) {
                if (promise !== null) {
                  promises.push(promise);
                  if (tile.key === "0/0/0") {
                    sine_qua_non.push(promise);
                  }
                }
              }
            }
          }
        }
        if (promises.length === 0) {
          resolve();
        } else {
          const starttime = Date.now();
          void Promise.all(sine_qua_non).then(() => {
            const endtime = Date.now();
            const elapsed = endtime - starttime;
            if (elapsed < delay) {
              setTimeout(() => {
                resolve();
              }, delay - elapsed);
            } else {
              resolve();
            }
          });
        }
      } else {
        resolve();
      }
    });
  }
  /**
   * This is the main plot entry point: it's unsafe to fire multiple
   * times in parallel because the transition state can get all borked up.
   * plotAPI wraps it in an await wrapper.
   *
   * @param prefs An API call.
   */
  async unsafe_plotAPI(prefs) {
    var _a;
    if (prefs === null) {
      return;
    }
    if (prefs.click_function) {
      this.click_function = Function("datum", prefs.click_function);
    }
    if (prefs.tooltip_html) {
      this.tooltip_html = Function("datum", prefs.tooltip_html);
    }
    if (prefs.background_options) {
      if (prefs.background_options.opacity && typeof prefs.background_options.opacity === "number") {
        prefs.background_options.opacity = [
          prefs.background_options.opacity,
          1
        ];
      }
      if (prefs.background_options.size && typeof prefs.background_options.size === "number") {
        prefs.background_options.size = [prefs.background_options.size, 1];
      }
    }
    this.update_prefs(prefs);
    if (this._root === void 0) {
      const { source_url, arrow_table, arrow_buffer } = prefs;
      const dataSpec = { source_url, arrow_table, arrow_buffer };
      if (Object.values(dataSpec).filter((x) => x !== void 0).length !== 1) {
        throw new Error("The initial API call specify exactly one of source_url, arrow_table, or arrow_buffer");
      }
      await this.load_dataset(dataSpec);
    }
    if (prefs.transformations) {
      for (const [k, v] of Object.entries(prefs.transformations)) {
        const func = Function("datum", v);
        if (!this.dataset.transformations[k]) {
          this.dataset.register_transformation(k, func);
        } else {
          console.log("Already", k, v);
        }
      }
    }
    if (this._zoom === void 0) {
      await this.reinitialize();
    }
    if (prefs.basemap_gleofeather) {
      prefs.polygons = [{ file: prefs.basemap_gleofeather }];
    }
    this._renderer.render_props.apply_prefs(this.prefs);
    const { width, height } = this;
    this.update_prefs(prefs);
    if (prefs.zoom !== void 0) {
      if (prefs.zoom === null) {
        this._zoom.zoom_to(1, width / 2, height / 2);
        prefs.zoom = void 0;
      } else if ((_a = prefs.zoom) == null ? void 0 : _a.bbox) {
        this._zoom.zoom_to_bbox(prefs.zoom.bbox, prefs.duration);
      }
    }
    this._renderer.most_recent_restart = Date.now();
    this._renderer.aes.apply_encoding(prefs.encoding);
    if (this._renderer.apply_webgl_scale) {
      this._renderer.apply_webgl_scale(prefs);
    }
    if (this._renderer.reglframe) {
      this._renderer.reglframe.cancel();
      this._renderer.reglframe = void 0;
    }
    this._renderer.reglframe = this._renderer.regl.frame(() => {
      this._renderer.tick("Basic");
    });
    if (prefs.labels !== void 0) {
      if (isURLLabels(prefs.labels)) {
        const { url, label_field, size_field } = prefs.labels;
        const name = prefs.labels.name || url;
        if (!this.secondary_renderers[name]) {
          this.stop_labellers();
          this.add_labels_from_url(url, name, label_field, size_field).catch(
            (error) => {
              console.error("Label addition failed.");
              console.error(error);
            }
          );
        }
      } else if (isLabelset(prefs.labels)) {
        if (!prefs.labels.name) {
          throw new Error("API field `labels` must have a name.");
        }
        this.stop_labellers();
        this.add_api_label(prefs.labels);
      } else if (prefs.labels === null) {
        this.stop_labellers();
      } else {
        throw new Error("API field `labels` format not recognized.");
      }
    }
    this._zoom.restart_timer(6e4);
  }
  get root_batch() {
    if (!this._root) {
      throw new Error("No dataset has been loaded");
    }
    return this.dataset.root_tile.record_batch;
  }
  /**
   * Return the current state of the query. Can be used to save an API
   * call for use programatically.
   */
  get query() {
    const p = JSON.parse(JSON.stringify(this.prefs));
    p.zoom = { bbox: this._renderer.zoom.current_corners() };
    return p;
  }
  drawContours(contours, drawTo) {
    const drawTwo = drawTo || select("body");
    const canvas = drawTwo.select("#canvas-2d");
    const context2 = canvas.node().getContext("2d");
    for (const contour of contours) {
      context2.fillStyle = "rgba(25, 25, 29, 1)";
      context2.fillRect(0, 0, window.innerWidth * 2, window.innerHeight * 2);
      context2.strokeStyle = "#8a0303";
      context2.fillStyle = "rgba(30, 30, 34, 1)";
      context2.lineWidth = max([
        0.45,
        0.25 * Math.exp(Math.log(this._zoom.transform.k / 2))
      ]);
      const path = geoPath(
        geoIdentity().scale(this._zoom.transform.k).translate([this._zoom.transform.x, this._zoom.transform.y]),
        context2
      );
      context2.beginPath(), path(contour), context2.fill();
    }
  }
  sample_points(n = 10) {
    const vals = [];
    for (const p of this._root.points(this._zoom.current_corners())) {
      vals.push({ ...p });
      if (vals.length >= n * 3) {
        break;
      }
    }
    vals.sort((a, b) => Number(a.ix) - Number(b.ix));
    return vals.slice(0, n);
  }
  contours(aes) {
    const data = this._renderer.calculate_contours(aes);
    const { x, y, x_, y_ } = this._zoom.scales();
    function fix_point(p) {
      if (!p) {
        return;
      }
      if (p.coordinates) {
        return fix_point(p.coordinates);
      }
      if (p.length === 0) {
        return;
      }
      if (p[0].length > 0) {
        return p.map(fix_point);
      }
      p[0] = x(x_.invert(p[0]));
      p[1] = y(y_.invert(p[1]));
    }
    fix_point(data);
    this.drawContours(data);
  }
}
Scatterplot.Bitmask = Bitmask;
Scatterplot.ArrowDataset = ArrowDataset;
Scatterplot.QuadtileDataset = QuadtileDataset;
Scatterplot.DataSelection = DataSelection;
class SettableFunction {
  constructor(plot) {
    this.string_rep = "";
    this.plot = plot;
  }
  get f() {
    if (this._f === void 0) {
      return (datum2, plot) => this.default(datum2, plot);
    }
    return this._f;
  }
  set f(f) {
    if (typeof f === "string") {
      if (this.string_rep !== f) {
        this.string_rep = f;
        this._f = Function("datum", "plot", f);
      }
    } else {
      this._f = f;
    }
  }
}
class LabelClick extends SettableFunction {
  default(feature, plot = void 0, labelset = void 0) {
    let filter2;
    if (feature === null) {
      return;
    }
    if (feature.__activated == true) {
      filter2 = null;
      feature.__activated = void 0;
    } else {
      feature.__activated = true;
      filter2 = {
        field: labelset.label_key,
        lambda: `d => d === '${feature.properties[labelset.label_key]}'`
      };
    }
    void this.plot.plotAPI({
      encoding: { filter: filter2 }
    });
  }
}
class ClickFunction extends SettableFunction {
  default(datum2, plot = void 0) {
    console.log({ ...datum2 });
    return;
  }
}
class ChangeToHighlitPointFunction extends SettableFunction {
  default(points, plot = void 0) {
    return;
  }
}
class TooltipHTML extends SettableFunction {
  default(point, plot = void 0) {
    let output = "<dl>";
    const nope = /* @__PURE__ */ new Set([
      "x",
      "y",
      "ix",
      null,
      "tile_key"
    ]);
    for (const [k, v] of point) {
      if (v === null) {
        continue;
      }
      if (nope.has(k)) {
        continue;
      }
      if (v === "") {
        continue;
      }
      output += ` <dt>${String(k)}</dt>
`;
      output += `   <dd>${String(v)}<dd>
`;
    }
    return `${output}</dl>
`;
  }
}
export {
  Scatterplot as default
};
