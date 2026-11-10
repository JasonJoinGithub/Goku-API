---
title: "GOKU 项目资产索引"
type: "索引"
topic: "Token与AI网关"
created: 2026-10-30
imported: 2026-11-02
source: "/Users/TGW/Documents/qwen-agent/paRoIKgyDw/default/项目资产索引-GOKU悟空网站与调研文档.md"
tags:
  - 项目/GOKU
  - 索引/资产
---

# 项目资产索引（2026-10-30 整理）

本次"卖 token / AI 网关平台"研究的全部产出，双击即可打开。

## 一、调研文档（2 份）

| 文档 | 内容 | 路径 |
|---|---|---|
| 天域平台复刻指南 | 天域站点拆解、New API/One API 开源底座选型、七步部署实操、成本表、合规风险清单 | /Users/TGW/Documents/qwen-agent/paRoIKgyDw/default/天域平台复刻指南.md |
| 卖Token生意-商业逻辑与可操作路径 | 五种上游货源对照表（价格倍率×法律风险）、三档利润江湖算账、2026 监管时间线、四条解法路线（首推国产模型合规分销）、郑州算力券机会、零成本人肉中转验证方案 | /Users/TGW/Documents/qwen-agent/paRoIKgyDw/default/卖Token生意-商业逻辑与可操作路径.md |

## 二、GOKU悟空平台原型（3 个版本，逐版快照永久保留）

| 版本 | 风格与功能 | 打开路径 |
|---|---|---|
| v1 星枢深色版 | 深色科技风；首版完整功能：分组透明定价、Token 计算器、订阅三档、控制台全流程（登录/充值/密钥/模拟调用/上游日志/CSV 导出） | /Users/TGW/Documents/qwen-agent/paRoIKgyDw/default/ai-gateway-platform-20261029T155321962Z/history/v1/delivery/星枢AI网关平台原型.html |
| v2 GOKU苹果风 | 品牌改 GOKU悟空；视觉整体切换 apple.com 风格（浅色、大标题、毛玻璃导航、蓝胶囊按钮）；功能同 v1 | /Users/TGW/Documents/qwen-agent/paRoIKgyDw/default/ai-gateway-platform-20261029T155321962Z/history/v2/delivery/星枢AI网关平台原型.html |
| **v3 三家功能合并（当前推荐）** | 在 v2 基础上合并 OpenRouter 独有优势：Workspaces 工作区 + 日/月预算护栏（403 拦截）、密钥安全页（风险/闲置筛选、停用 401、归档）、Activity 四维下钻（花费/Token/缓存/延迟 × 模型/密钥/工作区）；保留天域分组倍率透明 + CCVibe 价目卡与订阅 | /Users/TGW/Documents/qwen-agent/paRoIKgyDw/default/ai-gateway-platform-20261029T155321962Z/history/v3/delivery/星枢AI网关平台原型.html |

> 说明：三个"delivery"文件均为自包含单文件（样式、脚本、数据全在内），拷到任何电脑双击即可用。项目当前工作版（可继续迭代的源文件）位于项目根目录 ai-gateway-platform-20261029T155321962Z/ 下，版本台账在同目录 history/MANIFEST.md。

## 三、v3 推荐体验路径（5 分钟走完全功能）

1. 首页看英雄区与"四项承诺" → 2. 定价页切换分组，看同一模型倍率变化 + 用 Token 计算器算一次账 → 3. 点"免费注册"（赠 ¥8.8）→ 4. 控制台：先充值 ¥50，选"生产密钥"发起一笔大额调用（输入填 90000000）→ 看 **403 预算护栏拦截** → 5. 改小额正常调用 → 切 Activity 看缓存/延迟维度 → 6. 停用密钥再调用 → 看 401 → 7. 导出 CSV 账单（每条含真实上游）。

## 四、外部参考（本轮研究引用过的关键来源）

- 腾讯云文章《AI API Token 转售业务完全指南》（2026-04-02，注意其作者身份与立场，"为什么能便宜"一节与 2026 年 5-9 月监管事实有出入）：https://cloud.tencent.com/developer/article/2649558
- OpenRouter Workspaces/Activity/预算护栏文档：https://openrouter.ai/docs/guides/features/workspaces
- New API 部署文档：https://www.newapi.ai/en/docs
- 36氪《身价13亿美元的OpenRouter，国内学不了？》《倒卖Token暴利终结，AI中转站还剩几种活法？》

---

> [!info] 收录信息
> 原始文件：`/Users/TGW/Documents/qwen-agent/paRoIKgyDw/default/项目资产索引-GOKU悟空网站与调研文档.md`
> 原始时间：2026-10-30　·　入库时间：2026-11-02
> 主题：Token与AI网关　·　类型：索引
> 标签：`#项目/GOKU` `#索引/资产`

## 相关

- [[GOKU-交接文档]]
- [[腾讯云-Token转售指南-存档]]
