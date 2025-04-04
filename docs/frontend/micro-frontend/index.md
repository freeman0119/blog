# 微前端

## 前言

微前端已经是一个非常成熟的领域了，但开发者不管采用哪个现有方案，在适配成本、样式隔离、运行性能、页面白屏、子应用通信、子应用保活、多应用激活、vite 框架支持、应用共享等用户核心诉求都或存在问题，或无法提供支持。本文提供一种基于 iframe 的全新微前端方案，完善的解决了这些核心诉求。

## 概念

微前端是借鉴了微服务的理念，将一个庞大的应用拆分成多个独立灵活的小型应用，每个应用都可以独立开发，独立运行，独立部署，还可以随意组合，这样就降低了耦合度，从而更加灵活。

## 特性

- **技术栈无关**   主框架不限制接入应用的技术栈，子应用可自主选择技术栈（vue，react，jq，ng 等）
- **独立开发/部署**   各个团队之间仓库独立，单独部署，互不依赖
- **增量升级**   当一个应用庞大之后，技术升级或重构相当麻烦，而微应用具备渐进式升级的特性
- **独立运行时**  微应用之间运行时互不依赖，有独立的状态管理

## 微前端方案

- [Single-spa](https://github.com/single-spa/single-spa)（不推荐）: 最早的微前端框架，这里提一下它的缺点，无通信机制，不支持 Javascript 沙箱，样式冲突，无法预加载。
- [Qiankun](https://github.com/umijs/qiankun): 基于 single-spa，弥补了上述不足，现在主流的微前端方案。
- [Micro App](https://micro-zoe.github.io/Micro-App/): 基于 Web Component 原生组件进行渲染的微前端框架。
- [无界](https://wujie-micro.github.io/doc/)：基于 WebComponent 容器 + iframe 沙箱的微前端框架。
- [EMP](https://emp2.netlify.app/): 基于 Webpack5 Module Federation 搭建的微前端方案，共享模块粒度自由掌控，小到一个单独组件，大到一个完整应用。既实现了组件级别的复用，又实现了微服务的基本功能，总体来说功能很强大，但需要统一使用 webpack5。

## 对比

| 方案           | 核心原理          | 适用场景         | 隔离方式   | 优势                 | 劣势             |
| -------------- | ----------------- | ---------------- | ---------- | -------------------- | ---------------- |
| **Single-SPA** | 生命周期管理      | 适合多个框架共存 | 低         | 轻量、无框架限制     | 共享状态管理复杂 |
| **Qiankun**    | 基于 Single-SPA   | 企业级应用       | 沙箱       | API 简单、状态管理强 | 依赖 Single-SPA  |
| **Micro App**  | Web Components    | Vue3、React18    | Shadow DOM | 性能好、兼容新框架   | 生态较小         |
| **无界**       | iframe + fetch    | SSR 友好         | 高         | 隔离强、支持 SSR     | 新框架、生态小   |
| **EMP**        | Module Federation | 共享模块         | 低         | 组件级共享，性能好   | 仅支持 Webpack 5 |
