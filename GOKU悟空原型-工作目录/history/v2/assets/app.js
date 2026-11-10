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
    load: function () {
      try { return JSON.parse(localStorage.getItem(LS)) || null; } catch (e) { return null; }
    },
    save: function (s) { localStorage.setItem(LS, JSON.stringify(s)); }
  };
  var st = store.load();

  /* SECTION: toast */
  var tmr;
  function toast(msg) {
    var t = $("toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(tmr); tmr = setTimeout(function () { t.classList.remove("show"); }, 2600);
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
    b.addEventListener("click", function () { showView(b.dataset.goto); });
  });
  $("navLogin").addEventListener("click", function () { showView("console"); });
  $("navReg").addEventListener("click", function () { showView("console"); registerDemo(); });

  /* SECTION: home rendering */
  function srcClass(tone) { return { blue: "src-blue", green: "src-green", purple: "src-purple", amber: "src-amber" }[tone] || "src-blue"; }
  (function renderHome() {
    var html = D.models.map(function (m) {
      var g = D.groups.filter(function (x) { return x.id === m.groups[0]; })[0];
      return '<div class="chip"><b>' + m.name + '</b><span>' + m.desc + '</span>' +
        '<span class="src ' + srcClass(g.tone) + '">' + g.source.split(" ·")[0] + " · " + m.vendor + "</span></div>";
    }).join("");
    $("homeModels").innerHTML = html;
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
        '</ul><button class="btn ' + (p.hot ? "btn-primary" : "btn-ghost") + '" data-plan="' + p.name + '">选择' + p.name + "</button></div>";
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

  function renderAll() { renderGroupTabs(); renderPrices(); fillModelSelect($("calcModel"), false); fillModelSelect($("callModel"), true); calcCost(); if (st) renderConsole(); }

  /* SECTION: console state */
  function defaultState() {
    return {
      user: "dev@goku.demo", balance: 0, spend: 0, calls: 0,
      keys: [],
      logs: D.seedLogs.map(function (l) { return { t: l.t, model: l.model, group: l.group, io: l.tin + " / " + l.tout, cost: l.cost, up: l.up }; })
    };
  }
  function registerDemo() {
    st = defaultState(); st.balance = 8.8;
    store.save(st); renderConsole();
    toast("注册成功（模拟）：赠送 ¥8.8 体验额度已到账");
  }

  /* SECTION: console render */
  function renderConsole() {
    if (!st) { $("loginPane").classList.remove("hidden"); $("dashPane").classList.add("hidden"); return; }
    $("loginPane").classList.add("hidden"); $("dashPane").classList.remove("hidden");
    $("whoami").textContent = st.user;
    $("balance").textContent = yuan(st.balance);
    $("stSpend").textContent = yuan(st.spend);
    $("stCalls").textContent = st.calls;
    $("stKeys").textContent = st.keys.filter(function (k) { return !k.off; }).length;
    $("stRatio").textContent = curGroup().ratio + "×";

    /* keys */
    var tb = $("keyTable").querySelector("tbody");
    $("keyEmpty").style.display = st.keys.length ? "none" : "block";
    tb.innerHTML = st.keys.map(function (k, i) {
      return '<tr class="key-row"><td><b>' + k.name + '</b></td><td><span class="mono">' + k.key.slice(0, 11) + "…" +
        '</span> <button class="btn btn-ghost btn-sm" data-copy="' + i + '" style="padding:3px 9px">复制</button></td>' +
        '<td><a href="#" data-quota="' + i + '" style="color:var(--amber)">' + (k.quota === null ? "不限（点击设置）" : "¥" + k.quota) + "</a></td>" +
        '<td><button class="del" data-del="' + i + '">删除</button></td></tr>';
    }).join("");
    document.querySelectorAll("[data-quota]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault();
        var k = st.keys[+b.dataset.quota];
        var v = prompt("为该密钥设置额度上限（元），留空或 0 表示不限", k.quota === null ? "" : k.quota);
        if (v === null) return;
        var n = parseFloat(v);
        k.quota = (!n || n <= 0) ? null : n;
        store.save(st); renderConsole(); toast(k.quota === null ? "已设为不限额" : "额度上限已设为 ¥" + k.quota);
      });
    });
    document.querySelectorAll("[data-copy]").forEach(function (b) {
      b.addEventListener("click", function () { copy(st.keys[+b.dataset.copy].key, "密钥已复制到剪贴板"); });
    });
    document.querySelectorAll("[data-del]").forEach(function (b) {
      b.addEventListener("click", function () {
        st.keys.splice(+b.dataset.del, 1); store.save(st); renderConsole(); toast("密钥已删除");
      });
    });

    /* logs */
    var ltb = $("logTable").querySelector("tbody");
    $("logEmpty").style.display = st.logs.length ? "none" : "block";
    ltb.innerHTML = st.logs.slice(0, 20).map(function (l) {
      var cls = l.up.indexOf("国产") >= 0 ? "src-green" : l.up.indexOf("云厂商") >= 0 ? "src-purple" : "src-blue";
      return "<tr><td>" + l.t + '</td><td><b>' + l.model + "</td><td>" + l.group + "</td><td>" + l.io +
        "</td><td>" + yuan4(l.cost) + '</td><td><span class="upstream-tag ' + cls + '">' + l.up + "</span></td></tr>";
    }).join("");

    renderChart();
  }

  function renderChart() {
    var bars = D.seedSpend.map(function (v, i) { return { d: "周" + "一二三四五六"[i], v: v }; });
    bars.push({ d: "今天·真实", v: st ? st.spend : 0 });
    var max = Math.max(1, bars.map(function (b) { return b.v; }).reduce(function (a, c) { return Math.max(a, c); }, 0));
    $("spendChart").innerHTML = bars.map(function (b) {
      var h = Math.max(2, Math.round((b.v / max) * 108));
      return '<div class="col"><div class="bar-v" style="height:' + h + 'px"></div><span>' + b.d + "</span><span>" + yuan(b.v) + "</span></div>";
    }).join("");
  }

  /* SECTION: console actions */
  $("btnLogin").addEventListener("click", function () {
    st = st || defaultState();
    if (!st.user) st.user = $("loginUser").value || "dev@goku.demo";
    store.save(st); renderConsole(); toast("登录成功（本地模拟）");
  });
  $("lnkReg").addEventListener("click", function (e) { e.preventDefault(); registerDemo(); });

  $("btnGenKey").addEventListener("click", function () {
    var n = st.keys.length + 1;
    var hex = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 8);
    st.keys.push({ name: "密钥-" + ("00" + n).slice(-3), key: "sk-goku-" + hex, quota: null });
    store.save(st); renderConsole(); toast("已生成密钥（演示值，正式版本由服务端签发）");
  });

  $("btnCall").addEventListener("click", function () {
    if (!st) return;
    var m = D.models.filter(function (x) { return x.id === $("callModel").value; })[0];
    if (!m) { toast("当前分组没有可调用模型，请切换分组"); return; }
    var g = curGroup(), ratio = g.ratio;
    var tin = Math.max(0, parseInt($("callIn").value || 0, 10));
    var tout = Math.max(0, parseInt($("callOut").value || 0, 10));
    var cost = (tin / 1e6) * m.input * ratio + (tout / 1e6) * m.output * ratio;
    if (cost > st.balance) { toast("余额不足：本次需 " + yuan4(cost) + "，请先充值"); return; }
    st.balance -= cost; st.spend += cost; st.calls += 1;
    var up = g.id === "cn" ? "国产官方 API · 已备案" : g.id === "cloud" ? "云厂商托管通道" : g.id === "trial" ? "体验池 · 共享额度" : "官转 · " + m.vendor + " 直连";
    var now = new Date();
    var ts = (now.getMonth() + 1) + "-" + now.getDate() + " " + ("0" + now.getHours()).slice(-2) + ":" + ("0" + now.getMinutes()).slice(-2);
    st.logs.unshift({ t: ts, model: m.name, group: g.name, io: tin + " / " + tout, cost: cost, up: up });
    store.save(st); renderConsole();
    toast("调用完成（模拟）：扣费 " + yuan4(cost) + " · 上游已写入日志");
  });

  /* SECTION: recharge modal */
  var amt = 50, payName = "支付宝";
  $("btnRecharge").addEventListener("click", function () {
    $("amtRow").innerHTML = [10, 50, 100, 500].map(function (a) {
      return '<button data-amt="' + a + '" class="' + (a === amt ? "on" : "") + '">¥' + a + "</button>";
    }).join("");
    $("payOptRow").innerHTML = D.payments.map(function (p) {
      return '<button data-pay="' + p.name + '" class="' + (p.name === payName ? "on" : "") + '">' + p.name + "</button>";
    }).join("");
    document.querySelectorAll("[data-amt]").forEach(function (b) {
      b.addEventListener("click", function () { amt = +b.dataset.amt; renderSel(); });
    });
    function renderSel() {
      document.querySelectorAll("[data-amt]").forEach(function (b) { b.classList.toggle("on", +b.dataset.amt === amt); });
      document.querySelectorAll("[data-pay]").forEach(function (b) { b.classList.toggle("on", b.dataset.pay === payName); });
    }
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
    var rows = [["时间", "模型", "分组", "输入/输出token", "费用(元)", "上游来源"]].concat(
      st.logs.map(function (l) { return [l.t, l.model, l.group, l.io, l.cost.toFixed(4), l.up]; }));
    var csv = "\uFEFF" + rows.map(function (r) { return r.join(","); }).join("\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "GOKU悟空调用账单.csv"; a.click(); URL.revokeObjectURL(a.href);
    toast("账单已导出（含每条真实上游）");
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
  renderConsole();
})();
