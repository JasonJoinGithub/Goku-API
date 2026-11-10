/* SECTION: app - GOKU悟空原型交互逻辑（数据保存在当前浏览器 localStorage） */
(function () {
  "use strict";
  var D = window.XS_DATA;
  var $ = function (id) { return document.getElementById(id); };
  var LS = "goku_state_v1";

  /* SECTION: global state */
  var group = "official"; // 当前选中分组，定价页与控制台共享
  function curGroup() { return D.groups.filter(function (g) { return g.id === group; })[0]; }
  function yuan(n) { return "¥" + n.toFixed(2); }
  function yuan4(n) { return "¥" + n.toFixed(4); }

  var store = {
    load: function () { try { return JSON.parse(localStorage.getItem(LS)) || null; } catch (e) { return null; } },
    save: function (s) { localStorage.setItem(LS, JSON.stringify(s)); },
    upgrade: function (s) {
      /* 兼容 v2 旧数据结构：补齐 v3 工作区/密钥安全字段 */
      if (s && !s.ws) {
        var d = defaultState();
        s.keys = d.keys; s.ws = d.ws; s.wsSpend = d.wsSpend;
        s.activeWs = "全部"; s.keyFilter = "all";
        (s.logs || []).forEach(function (l) { if (!l.ws) { l.ws = d.ws[0].name; l.key = l.key || d.keys[0].name; } });
      }
      return s;
    }
  };
  var st = store.upgrade(store.load());

  /* SECTION: toast */
  var tmr;
  function toast(msg) {
    var t = $("toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(tmr); tmr = setTimeout(function () { t.classList.remove("show"); }, 2800);
  }

  /* SECTION: view switch */
  function showView(v) {
    ["home", "pricing", "console"].forEach(function (x) {
      $("view" + x.charAt(0).toUpperCase() + x.slice(1)).classList.toggle("hidden", x !== v);
    });
    document.querySelectorAll("#navLinks button").forEach(function (b) {
      b.classList.toggle("on", b.dataset.view === v);
    });
    if (v === "console") renderConsole();
    window.scrollTo(0, 0);
  }
  document.querySelectorAll("#navLinks button").forEach(function (b) {
    b.addEventListener("click", function () { showView(b.dataset.view); });
  });
  document.querySelectorAll("[data-goto]").forEach(function (b) {
    b.addEventListener("click", function (e) { e.preventDefault(); showView(b.dataset.goto); });
  });
  $("navLogin").addEventListener("click", function () { showView("console"); });
  $("navReg").addEventListener("click", function () { showView("console"); registerDemo(); });

  /* SECTION: home rendering */
  function srcClass(tone) { return { blue: "src-blue", green: "src-green", purple: "src-purple", amber: "src-amber" }[tone] || "src-blue"; }
  (function renderHome() {
    $("homeModels").innerHTML = D.models.map(function (m) {
      var g = D.groups.filter(function (x) { return x.id === m.groups[0]; })[0];
      return '<div class="chip"><b>' + m.name + '</b><span>' + m.desc + '</span>' +
        '<span class="src ' + srcClass(g.tone) + '">' + g.source.split(" ·")[0] + " · " + m.vendor + "</span></div>";
    }).join("");
    $("trustGrid").innerHTML = D.trust.map(function (t) {
      return '<div class="card trust-card"><span class="ic">' + t.icon + '</span><h3>' + t.title + '</h3><p>' + t.body + "</p></div>";
    }).join("");
    $("payRow").innerHTML = D.payments.map(function (p) { return '<span class="pay">' + p.name + "</span>"; }).join("");
  })();

  /* SECTION: pricing - group tabs */
  function renderGroupTabs() {
    $("groupTabs").innerHTML = D.groups.map(function (g) {
      return '<button data-g="' + g.id + '" class="' + (g.id === group ? "on" : "") + '">' + g.name + "</button>";
    }).join("");
    document.querySelectorAll("#groupTabs button").forEach(function (b) {
      b.addEventListener("click", function () { group = b.dataset.g; renderAll(); });
    });
    var g = curGroup();
    $("groupNote").innerHTML = "当前查看分组：<b>" + g.name + "</b>，倍率为：<b>" + g.ratio +
      "</b>　" + g.source + "　" + g.desc;
  }

  /* SECTION: pricing - model cards */
  function renderPrices() {
    var g = curGroup();
    var list = D.models.filter(function (m) { return m.groups.indexOf(group) >= 0; });
    if (!list.length) { $("priceGrid").innerHTML = '<div class="empty" style="grid-column:1/-1">该分组暂未上架模型，请切换其他分组</div>'; return; }
    $("priceGrid").innerHTML = list.map(function (m) {
      var prices = m.kind === "video"
        ? '<span>' + m.perUnit + "</span>"
        : '<span><i>输入</i> <em>' + yuan4(m.input * g.ratio) + "</em> / 1M Tokens</span>" +
          '<span><i>补全</i> <em>' + yuan4(m.output * g.ratio) + "</em> / 1M Tokens</span>" +
          (m.cached ? '<span><i>缓存命中</i> <em>' + yuan4(m.cached * g.ratio) + "</em> / 1M</span>" : "");
      var tag = m.kind === "video" ? "" :
        '<div class="grp-tag">基准价 输入' + yuan4(m.input) + " × 倍率 " + g.ratio + " · 计费类型：按量计费</div>";
      return '<div class="mcard"><div class="top"><b>' + m.name + '</b><span class="kind">' + D.kindLabel[m.kind] +
        '</span><span class="vendor">' + m.vendor + '</span></div><div class="desc">' + m.desc +
        '</div><div class="prices">' + prices + "</div>" + tag + "</div>";
    }).join("");
  }

  /* SECTION: pricing - plans */
  (function renderPlans() {
    $("planGrid").innerHTML = D.plans.map(function (p) {
      return '<div class="plan' + (p.hot ? ' hot"><span class="hot-tag">最受欢迎</span' : "><") + "h3>" + p.name +
        '</h3><div class="price">¥' + p.price + (p.price ? '<small>' + p.unit + "</small>" : "") +
        '</div><div class="quota">' + p.quota + '</div><ul>' +
        p.feats.map(function (f) { return "<li>" + f + "</li>"; }).join("") +
        '</ul><button class="btn ' + (p.hot ? "btn-primary" : "btn-line") + '" data-plan="' + p.name + '">选择' + p.name + "</button></div>";
    }).join("");
    document.querySelectorAll("[data-plan]").forEach(function (b) {
      b.addEventListener("click", function () { toast("原型演示：已选择「" + b.dataset.plan + "」，正式版本将跳转支付"); });
    });
  })();

  /* SECTION: calculator */
  function fillModelSelect(sel, withGroupOnly) {
    sel.innerHTML = D.models.filter(function (m) { return m.kind !== "video"; })
      .filter(function (m) { return !withGroupOnly || m.groups.indexOf(group) >= 0; })
      .map(function (m) { return '<option value="' + m.id + '">' + m.name + "</option>"; }).join("");
  }
  function calcCost() {
    var m = D.models.filter(function (x) { return x.id === $("calcModel").value; })[0];
    if (!m) return;
    var g = curGroup(), ratio = g.ratio;
    var ci = (parseInt($("calcIn").value || 0, 10) / 1e6) * m.input * ratio;
    var co = (parseInt($("calcOut").value || 0, 10) / 1e6) * m.output * ratio;
    $("calcCost").textContent = yuan4(ci + co);
    $("calcCi").textContent = yuan4(ci);
    $("calcCo").textContent = yuan4(co);
  }
  /* SECTION: calculator events */
  ["calcModel", "calcIn", "calcOut"].forEach(function (id) {
    $(id).addEventListener("input", calcCost);
    $(id).addEventListener("change", calcCost);
  });

  /* SECTION: console state */
  function defaultState() {
    return {
      user: "dev@goku.demo", balance: 0, spend: 0, calls: 0,
      keys: JSON.parse(JSON.stringify(D.seedKeys)),
      logs: JSON.parse(JSON.stringify(D.seedLogs)),
      ws: JSON.parse(JSON.stringify(D.seedWorkspaces)),
      wsSpend: { "生产环境": { day: 0.0294, month: 213.7 }, "数据不出域": { day: 0.0215, month: 88.2 }, "开发测试": { day: 0.0145, month: 12.4 } },
      activeWs: "全部", keyFilter: "all", actDim: "model"
    };
  }
  function registerDemo() {
    st = defaultState(); st.balance = 8.8;
    store.save(st); renderConsole();
    toast("注册成功（模拟）：赠送 ¥8.8 体验额度已到账");
  }

  /* SECTION: workspace helpers */
  function findWs(name) { return st.ws.filter(function (w) { return w.name === name; })[0]; }
  function wsLogs(name) { return st.logs.filter(function (l) { return name === "全部" || l.ws === name; }); }
  function riskOf(k) {
    if (k.status === "off") return { txt: "已停用", cls: "src-blue" };
    if (k.idleDays > 30) return { txt: "闲置 " + k.idleDays + " 天", cls: "src-amber" };
    if (k.limit && k.used / k.limit >= 0.8) return { txt: "接近限额", cls: "src-purple" };
    if (!k.limit) return { txt: "未设限额", cls: "src-amber" };
    return { txt: "正常", cls: "src-green" };
  }

  /* SECTION: console render */
  function renderConsole() {
    if (!st) { $("loginPane").classList.remove("hidden"); $("dashPane").classList.add("hidden"); return; }
    $("loginPane").classList.add("hidden"); $("dashPane").classList.remove("hidden");
    $("whoami").textContent = st.user;
    $("balance").textContent = yuan(st.balance);
    $("wsPicker").innerHTML = ["全部"].concat(st.ws.map(function (w) { return w.name; }))
      .map(function (n) { return '<option' + (n === st.activeWs ? " selected" : "") + ">" + n + "</option>"; }).join("");

    var lg = wsLogs(st.activeWs);
    $("stSpend").textContent = yuan(st.activeWs === "全部" ? st.spend : lg.reduce(function (a, l) { return a + l.cost; }, 0));
    $("stCalls").textContent = lg.length;
    $("stKeys").textContent = st.keys.filter(function (k) { return k.status !== "off" && (st.activeWs === "全部" || k.ws === st.activeWs); }).length;
    var ch = lg.length ? Math.round(lg.reduce(function (a, l) { return a + (l.cache || 0); }, 0) / lg.length) : 0;
    $("stCache").textContent = ch + "%";

    renderWs(); renderKeys(); renderAct(); renderChart(); renderLogTable(lg);
    $("callWs").innerHTML = st.ws.map(function (w) { return "<option>" + w.name + "</option>"; }).join("");
    if (st.activeWs !== "全部") $("callWs").value = st.activeWs;
  }

  /* SECTION: workspace panel */
  function renderWs() {
    $("wsList").innerHTML = st.ws.map(function (w) {
      var s = st.wsSpend[w.name] || { day: 0, month: 0 };
      var pd = Math.min(100, Math.round(s.day / w.dayLimit * 100));
      var pm = Math.min(100, Math.round(s.month / w.monthLimit * 100));
      function bar(label, pct, val) {
        return '<div style="font-size:11.5px;color:var(--faint)">' + label + " " + val +
          '<div class="bar" style="height:6px;background:rgba(0,0,0,.06);border-radius:99px;overflow:hidden;margin-top:3px">' +
          '<i style="display:block;height:100%;width:' + pct + '%;background:' + (pct >= 90 ? "#d70015" : "var(--acc)") + '"></i></div></div>';
      }
      return '<div class="ws-card"><b>' + w.name + '</b><span style="font-size:12px;color:var(--sub)">' + w.desc +
        '</span>' + bar("今日", pd, yuan(s.day) + " / " + yuan(w.dayLimit)) + bar("本月", pm, yuan(s.month) + " / " + yuan(w.monthLimit)) + "</div>";
    }).join("");
  }
  $("wsPicker").addEventListener("change", function () { st.activeWs = $("wsPicker").value; renderConsole(); });
  $("btnAddWs").addEventListener("click", function () {
    var name = $("wsName").value.trim();
    var day = parseFloat($("wsDay").value), mon = parseFloat($("wsMonth").value);
    if (!name) { toast("请先填写工作区名称"); return; }
    if (findWs(name)) { toast("工作区名称已存在"); return; }
    if (!(day > 0 && mon > day)) { toast("预算需为数字，且月限额必须大于日限额"); return; }
    st.ws.push({ name: name, desc: "自定义工作区", dayLimit: day, monthLimit: mon });
    st.wsSpend[name] = { day: 0, month: 0 };
    $("wsName").value = ""; $("wsDay").value = ""; $("wsMonth").value = "";
    store.save(st); renderConsole(); toast("工作区「" + name + "」已创建，预算护栏已生效");
  });

  /* SECTION: key safety */
  function renderKeys() {
    document.querySelectorAll("#keyFilt button").forEach(function (b) {
      b.classList.toggle("on", b.dataset.kf === st.keyFilter);
    });
    var list = st.keys.filter(function (k) {
      if (st.activeWs !== "全部" && k.ws !== st.activeWs) return false;
      if (st.keyFilter === "risk") { var r = riskOf(k); return r.txt !== "正常"; }
      if (st.keyFilter === "idle") return k.idleDays > 30;
      return true;
    });
    $("keyEmpty").style.display = list.length ? "none" : "block";
    var tb = $("keyTable").querySelector("tbody");
    tb.innerHTML = list.map(function (k) {
      var i = st.keys.indexOf(k), r = riskOf(k);
      return '<tr class="key-row"><td><b>' + k.name + '</b><br><span style="font-size:11px;color:var(--faint)">' + k.ws +
        '</span></td><td><span class="mono">' + k.key.slice(0, 13) + "…</span> <button class=\"btn btn-ghost btn-sm\" data-copy=\"" + i + '" style="padding:2px 8px;color:var(--acc)">复制</button></td>' +
        "<td>" + (k.limit ? yuan(k.used) + " / " + yuan(k.limit) : yuan(k.used) + " / 不限") + "</td>" +
        '<td><span class="badge ' + r.cls + '">' + r.txt + "</span></td>" +
        '<td><button class="btn btn-ghost btn-sm" data-toggle="' + i + '" style="padding:2px 8px;color:var(--acc)">' + (k.status === "off" ? "启用" : "停用") +
        '</button> <button class="del" data-del="' + i + '">归档</button></td></tr>';
    }).join("");
    document.querySelectorAll("[data-copy]").forEach(function (b) {
      b.addEventListener("click", function () { copy(st.keys[+b.dataset.copy].key, "密钥已复制到剪贴板"); });
    });
    document.querySelectorAll("[data-toggle]").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = st.keys[+b.dataset.toggle];
        k.status = k.status === "off" ? "on" : "off";
        store.save(st); renderConsole(); toast(k.status === "off" ? "密钥已停用，携带该密钥的请求将被 401 拒绝" : "密钥已重新启用");
      });
    });
    document.querySelectorAll("[data-del]").forEach(function (b) {
      b.addEventListener("click", function () {
        st.keys.splice(+b.dataset.del, 1); store.save(st); renderConsole(); toast("密钥已归档（可随时新建替代）");
      });
    });
  }
  document.querySelectorAll("#keyFilt button").forEach(function (b) {
    b.addEventListener("click", function () { st.keyFilter = b.dataset.kf; renderConsole(); });
  });

  /* SECTION: activity panel（OpenRouter 借鉴：花费/Token/缓存/延迟 × 模型/密钥/工作区 下钻） */
  var actMetric = "cost";
  function renderAct() {
    document.querySelectorAll("#actMetrics button").forEach(function (b) {
      b.classList.toggle("on", b.dataset.m === actMetric);
    });
    var dim = $("actDim").value;
    var lg = wsLogs(st.activeWs);
    var agg = {};
    lg.forEach(function (l) {
      var k = l.model;
      if (dim === "key") k = l.key || "未标注密钥";
      if (dim === "ws") k = l.ws;
      if (!agg[k]) agg[k] = { cost: 0, tok: 0, cache: 0, lat: 0, n: 0 };
      var io = (l.io || "0 / 0").split(" / ");
      agg[k].cost += l.cost; agg[k].tok += (parseInt(io[0], 10) || 0) + (parseInt(io[1], 10) || 0);
      agg[k].cache += l.cache || 0; agg[k].lat += l.lat || 0; agg[k].n += 1;
    });
    var rows = Object.keys(agg).map(function (k) {
      var a = agg[k];
      var val, num;
      if (actMetric === "cost") { val = yuan4(a.cost); num = a.cost; }
      else if (actMetric === "tok") { val = (a.tok / 1000).toFixed(1) + "k"; num = a.tok; }
      else if (actMetric === "cache") { val = (a.n ? Math.round(a.cache / a.n) : 0) + "%"; num = a.cache / (a.n || 1); }
      else { val = (a.n ? (a.lat / a.n).toFixed(1) : 0) + "s"; num = a.lat / (a.n || 1); }
      return { k: k, val: val, num: num };
    }).sort(function (a, b) { return b.num - a.num; }).slice(0, 8);
    var max = rows.length ? Math.max.apply(null, rows.map(function (r) { return r.num; })) : 1;
    $("actBars").innerHTML = rows.length ? rows.map(function (r) {
      return '<div class="act-row"><span class="lb" title="' + r.k + '">' + r.k + '</span><div class="bar"><i style="width:' +
        Math.max(2, Math.round(r.num / max * 100)) + '%"></i></div><b class="vl">' + r.val + "</b></div>";
    }).join("") : '<div class="empty">该范围内暂无调用数据，先到下方发起一次模拟调用</div>';
  }
  $("actDim").addEventListener("change", function () { renderAct(); });
  document.querySelectorAll("#actMetrics button").forEach(function (b) {
    b.addEventListener("click", function () { actMetric = b.dataset.m; renderAct(); });
  });
  $("btnSaveChart").addEventListener("click", function () {
    toast("图表配置已保存（原型演示）：正式版将固定到 Activity 首页");
  });

  /* SECTION: simulate call（含预算护栏 403 与密钥停用 401） */
  $("btnCall").addEventListener("click", function () {
    if (!st) return;
    var m = D.models.filter(function (x) { return x.id === $("callModel").value; })[0];
    if (!m) { toast("当前分组没有可调用模型，请切换分组"); return; }
    var w = findWs($("callWs").value);
    if (!w) { toast("请先创建工作区"); return; }
    var k = st.keys.filter(function (x) { return x.ws === w.name && x.status !== "off"; })[0];
    if (!k) { toast("401：工作区「" + w.name + "」下没有可用密钥（已全部停用或归档）"); return; }
    var s = st.wsSpend[w.name] || (st.wsSpend[w.name] = { day: 0, month: 0 });
    var g = curGroup(), ratio = g.ratio;
    var tin = Math.max(0, parseInt($("callIn").value || 0, 10));
    var tout = Math.max(0, parseInt($("callOut").value || 0, 10));
    var cost = (tin / 1e6) * m.input * ratio + (tout / 1e6) * m.output * ratio;
    if (s.day + cost > w.dayLimit || s.month + cost > w.monthLimit) {
      toast("403 预算护栏拦截：「" + w.name + "」超出" + (s.day + cost > w.dayLimit ? "日" : "月") + "限额，请求未转发上游、未扣费");
      return;
    }
    if (k.limit && k.used + cost > k.limit) { toast("403：密钥「" + k.name + "」个人限额已满，请求被拦截"); return; }
    if (cost > st.balance) { toast("余额不足：本次需 " + yuan4(cost) + "，请先充值"); return; }
    st.balance -= cost; st.spend += cost; st.calls += 1;
    s.day += cost; s.month += cost; k.used += cost; k.idleDays = 0;
    var up = g.id === "cn" ? "国产官方 API · 已备案" : g.id === "cloud" ? "云厂商托管通道" : g.id === "trial" ? "体验池 · 共享额度" : "官转 · " + m.vendor + " 直连";
    var now = new Date();
    var ts = (now.getMonth() + 1) + "-" + now.getDate() + " " + ("0" + now.getHours()).slice(-2) + ":" + ("0" + now.getMinutes()).slice(-2);
    st.logs.unshift({ t: ts, model: m.name, group: g.name, ws: w.name, key: k.name, io: tin + " / " + tout, cost: cost, cache: Math.floor(15 + Math.random() * 70), lat: +(1 + Math.random() * 3).toFixed(1), up: up });
    store.save(st); renderConsole();
    toast("调用完成（模拟）：扣费 " + yuan4(cost) + " · 上游与缓存/延迟已写入 Activity");
  });

  /* SECTION: keys table old header removed - gen key */
  $("btnGenKey").addEventListener("click", function () {
    var n = st.keys.length + 1;
    var hex = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 8);
    var wname = $("callWs").value || st.ws[0].name;
    st.keys.push({ name: "密钥-" + ("00" + n).slice(-3), key: "sk-goku-" + hex, ws: wname, limit: null, used: 0, status: "on", idleDays: 0 });
    store.save(st); renderConsole(); toast("已在「" + wname + "」下生成密钥（演示值，正式版由服务端签发）");
  });

  /* SECTION: usage chart */
  function renderChart() {
    var bars = D.seedSpend.map(function (v, i) { return { d: "周" + "一二三四五六"[i], v: v }; });
    bars.push({ d: "今天·真实", v: st.spend });
    var max = Math.max.apply(null, bars.map(function (b) { return b.v; }).concat([1]));
    $("spendChart").innerHTML = bars.map(function (b) {
      var h = Math.max(2, Math.round((b.v / max) * 108));
      return '<div class="col"><div class="bar-v" style="height:' + h + 'px"></div><span>' + b.d + "</span><span>" + yuan(b.v) + "</span></div>";
    }).join("");
  }

  function renderLogTable(lg) {
    $("logEmpty").style.display = lg.length ? "none" : "block";
    var ltb = $("logTable").querySelector("tbody");
    ltb.innerHTML = lg.slice(0, 15).map(function (l) {
      var cls = l.up.indexOf("国产") >= 0 ? "src-green" : l.up.indexOf("云厂商") >= 0 ? "src-purple" : "src-blue";
      return "<tr><td>" + l.t + '</td><td><b>' + l.model + "</b></td><td>" + l.ws + "</td><td>" + (l.key || "-") +
        "</td><td>" + (l.io || ((l.tin || 0) + " / " + (l.tout || 0))) + "</td><td>" + yuan4(l.cost) +
        "</td><td>" + (l.cache || 0) + '%</td><td>' + (l.lat || "-") + 's</td><td><span class="upstream-tag ' + cls + '">' + l.up + "</span></td></tr>";
    }).join("");
  }

  /* SECTION: console actions */
  $("btnLogin").addEventListener("click", function () {
    st = st || defaultState();
    if (!st.user) st.user = $("loginUser").value || "dev@goku.demo";
    store.save(st); renderConsole(); toast("登录成功（本地模拟）");
  });
  $("lnkReg").addEventListener("click", function (e) { e.preventDefault(); registerDemo(); });

  /* SECTION: recharge modal */
  var amt = 50, payName = "支付宝";
  $("btnRecharge").addEventListener("click", function () {
    $("amtRow").innerHTML = [10, 50, 100, 500].map(function (a) {
      return '<button data-amt="' + a + '" class="' + (a === amt ? "on" : "") + '">¥' + a + "</button>";
    }).join("");
    $("payOptRow").innerHTML = D.payments.map(function (p) {
      return '<button data-pay="' + p.name + '" class="' + (p.name === payName ? "on" : "") + '">' + p.name + "</button>";
    }).join("");
    function renderSel() {
      document.querySelectorAll("[data-amt]").forEach(function (b) { b.classList.toggle("on", +b.dataset.amt === amt); });
      document.querySelectorAll("[data-pay]").forEach(function (b) { b.classList.toggle("on", b.dataset.pay === payName); });
    }
    document.querySelectorAll("[data-amt]").forEach(function (b) {
      b.addEventListener("click", function () { amt = +b.dataset.amt; renderSel(); });
    });
    document.querySelectorAll("[data-pay]").forEach(function (b) {
      b.addEventListener("click", function () { payName = b.dataset.pay; renderSel(); });
    });
    $("modal").classList.remove("hidden");
  });
  $("btnPayCancel").addEventListener("click", function () { $("modal").classList.add("hidden"); });
  $("btnPayOk").addEventListener("click", function () {
    st.balance += amt; store.save(st); renderConsole();
    $("modal").classList.add("hidden");
    toast("模拟支付成功：¥" + amt + " 额度已通过「" + payName + "」到账");
  });

  /* SECTION: export & misc */
  $("btnExport").addEventListener("click", function () {
    var rows = [["时间", "模型", "工作区", "密钥", "输入/输出token", "费用(元)", "缓存命中%", "延迟s", "上游来源"]].concat(
      wsLogs(st.activeWs).map(function (l) {
        return [l.t, l.model, l.ws, l.key || "", l.io || (l.tin + " / " + l.tout), l.cost.toFixed(4), l.cache || 0, l.lat || "", l.up];
      }));
    var csv = "\uFEFF" + rows.map(function (r) { return r.join(","); }).join("\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "GOKU悟空调用账单.csv"; a.click(); URL.revokeObjectURL(a.href);
    toast("账单已导出（含工作区、密钥与每条真实上游）");
  });
  $("btnLogout").addEventListener("click", function () { st.user = ""; store.save(st); renderConsole(); toast("已退出，本地数据仍保留"); });
  $("btnReset").addEventListener("click", function () { localStorage.removeItem(LS); st = null; renderConsole(); toast("演示数据已清空"); });

  function copy(text, msg) {
    if (navigator.clipboard) { navigator.clipboard.writeText(text).then(function () { toast(msg); }, function () { toast(text); }); }
    else toast(text);
  }

  /* SECTION: init */
  fillModelSelect($("calcModel"), false);
  renderAll();
  function renderAll() {
    renderGroupTabs(); renderPrices(); fillModelSelect($("calcModel"), false); fillModelSelect($("callModel"), true); calcCost();
    if (st) renderConsole();
  }
  renderConsole();
})();
