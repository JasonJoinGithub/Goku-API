/* SECTION: data - 平台示例数据（价格均为示例值，非实时报价） */
window.XS_DATA = {
  brand: { name: "星枢 AI 网关", en: "XingShu Gateway", slogan: "一把密钥，畅用全球模型" },

  /* SECTION: groups - 分组即"收银窗口"：不同分组走不同上游、倍率不同、价格不同 */
  groups: [
    { id: "official", name: "官方直连分组", ratio: 1.0, source: "官转 · 企业账号直连上游官方 API", desc: "价格贴近官方原价，每笔账单可审计", tone: "blue" },
    { id: "cn", name: "国产合规模型分组", ratio: 0.85, source: "国产备案模型官方 API / 本地智算中心", desc: "数据不出境，支持发票与算力券抵扣", tone: "green" },
    { id: "cloud", name: "云厂商托管分组", ratio: 1.15, source: "Azure / Bedrock / Vertex 协议接入", desc: "SLA 保障，高峰期优先调度", tone: "purple" },
    { id: "trial", name: "体验分组", ratio: 0.6, source: "限量试用池（高峰时段限速）", desc: "新用户赠送额度专用", tone: "amber" }
  ],

  /* SECTION: models - 模型目录；prices 为每 100 万 token 人民币示例价 */
  models: [
    { id: "claude-opus", name: "Claude Opus 4.7", vendor: "Anthropic", kind: "chat", input: 36.75, output: 183.75, cached: 7.35, groups: ["official", "cloud"], desc: "旗舰推理与复杂编程" },
    { id: "claude-sonnet", name: "Claude Sonnet 4.6", vendor: "Anthropic", kind: "chat", input: 5.5, output: 27.5, cached: 0.55, groups: ["official", "cloud", "trial"], desc: "均衡全能，编程首选" },
    { id: "claude-haiku", name: "Claude Haiku 4.5", vendor: "Anthropic", kind: "chat", input: 1.43, output: 7.15, cached: 0.14, groups: ["official", "trial"], desc: "极速响应、低成本" },
    { id: "gpt5", name: "GPT-5", vendor: "OpenAI", kind: "chat", input: 6.9, output: 55.2, cached: 0.69, groups: ["official", "cloud"], desc: "通用旗舰多模态" },
    { id: "gpt41", name: "GPT-4.1", vendor: "OpenAI", kind: "chat", input: 1.38, output: 5.52, cached: 0.28, groups: ["official", "trial"], desc: "稳定高性能通用模型" },
    { id: "codex", name: "GPT-5.3-Codex", vendor: "OpenAI", kind: "code", input: 0.525, output: 4.2, cached: 0.053, groups: ["cloud"], desc: "编程代理专用" },
    { id: "deepseek", name: "DeepSeek V4-Pro", vendor: "DeepSeek", kind: "chat", input: 3.0, output: 6.0, cached: 0.025, groups: ["cn"], desc: "代码与深度推理，国产备案" },
    { id: "deepseek-flash", name: "DeepSeek V4-Flash", vendor: "DeepSeek", kind: "chat", input: 1.0, output: 2.0, cached: 0.02, groups: ["cn", "trial"], desc: "高频批量处理，国产备案" },
    { id: "qwen", name: "Qwen3-Max", vendor: "阿里通义", kind: "chat", input: 2.5, output: 10.0, cached: 0.5, groups: ["cn"], desc: "中文原生，国产备案" },
    { id: "glm", name: "GLM-5.2", vendor: "智谱AI", kind: "chat", input: 8.0, output: 28.0, cached: 2.0, groups: ["cn"], desc: "长文本复杂推理，国产备案" },
    { id: "kimi", name: "Kimi K3", vendor: "月之暗面", kind: "chat", input: 4.0, output: 16.0, cached: 0.8, groups: ["cn"], desc: "超长上下文，国产备案" },
    { id: "doubao", name: "豆包 Seed-2.0-Pro", vendor: "字节火山", kind: "chat", input: 3.2, output: 16.0, cached: 0.8, groups: ["cn"], desc: "多模态企业场景，国产备案" },
    { id: "gpt-image", name: "GPT-Image 2", vendor: "OpenAI", kind: "image", input: 27.6, output: 110.4, groups: ["official", "cloud"], desc: "图像生成（按 token 计）" },
    { id: "seedance", name: "Seedance 视频", vendor: "字节火山", kind: "video", input: 0, output: 0, perUnit: "约 ¥0.35 / 秒（示例）", groups: ["cn"], desc: "视频生成，按秒计费" }
  ],

  kindLabel: { chat: "对话", code: "编程", image: "图像", video: "视频" },

  /* SECTION: plans - 订阅三档（示例价） */
  plans: [
    { name: "体验版", price: 0, quota: "注册赠 ¥8.8 额度", feats: ["体验分组（限速）", "全部国产合规模型", "社区支持"], hot: false },
    { name: "开发者版", price: 99, unit: "/月", quota: "含 ¥120 调用额度", feats: ["官方直连 + 国产合规双分组", "倍率公开账单可导出", "工单支持 2h 响应", "额度月结不清零滚动 30 天"], hot: true },
    { name: "团队版", price: 499, unit: "/月", quota: "含 ¥700 调用额度", feats: ["云厂商托管分组优先调度", "99.9% SLA 协议", "专属采购：可申请算力券抵扣", "发票与对账单，子密钥限额"], hot: false }
  ],

  /* SECTION: pay - 支付方式（演示） */
  payments: [
    { name: "支付宝", tone: "blue" }, { name: "微信支付", tone: "green" },
    { name: "Stripe", tone: "purple" }, { name: "USDT (TRC20)", tone: "amber" },
    { name: "PayPal", tone: "cyan" }
  ],

  /* SECTION: trust - 差异化承诺（基于本会话竞品调研结论设计） */
  trust: [
    { title: "每笔账单公开真实上游", body: "调用日志逐条标注请求最终去了官转 / 云厂商 / 国产官方哪条通道。行业评测发现部分中转站存在模型掉包，我们把可验证性做成默认功能。", icon: "🔍" },
    { title: "分组与倍率全透明", body: "同模型在不同分组的价格、倍率、限速规则全部公示在价目页，不用先充值再发现自己是高价分组。", icon: "📊" },
    { title: "国产合规模型专区", body: "已备案国产模型独立分组，数据不出境、可开发票、支持本地算力与政府算力券抵扣，政企项目可直接采购。", icon: "🛡️" },
    { title: "资金与用量兜底", body: "充值余额与运营资金隔离，未消耗额度 7 天可退；配额上限 + 熔断，团队账单绝不失控。", icon: "💰" }
  ],

  /* SECTION: seed - 演示用量种子（近 6 天花费，单位元） */
  seedSpend: [3.2, 0, 5.8, 1.4, 0, 7.6],
  seedLogs: [
    { t: "10-28 21:14", model: "Claude Sonnet 4.6", group: "官方直连分组", tin: 1800, tout: 640, cost: 0.0263, up: "官转 · Anthropic 直连" },
    { t: "10-28 20:41", model: "DeepSeek V4-Pro", group: "国产合规模型分组", tin: 4200, tout: 1500, cost: 0.0215, up: "国产官方 API · 已备案" },
    { t: "10-27 15:02", model: "GPT-4.1", group: "官方直连分组", tin: 900, tout: 320, cost: 0.0031, up: "官转 · OpenAI 直连" }
  ]
};
