// ==UserScript==
// @name         DeepSeek设置持久化
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  持久化DeepSeek网页版的模式和智能搜索设置
// @author       ACaiCat
// @match        https://chat.deepseek.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
  "use strict";

  window.getDeepSeekState = function () {
    return {
      mode: GM_getValue("deepseek_mode", "unknown"),
      search: GM_getValue("deepseek_search", false),
    };
  };

  const storedMode = GM_getValue("deepseek_mode", null);
  const storedSearch = GM_getValue("deepseek_search", null);

  if (storedMode) {
    console.log("上次保存的模式:", storedMode);
  }
  if (storedSearch !== null) {
    console.log("上次保存的搜索状态:", storedSearch ? "已开启" : "已关闭");
  }

  function restoreState() {
    if (storedMode) {
      const targetRadio = document.querySelector(
        `div[role="radio"][data-model-type="${storedMode}"]`,
      );
      targetRadio.click();
      console.log("已自动还原模式:", storedMode);
    }

    if (storedSearch !== null) {
      const searchBtn = Array.from(
        document.querySelectorAll(".ds-toggle-button"),
      ).find((btn) => btn.textContent.includes("智能搜索"));
      const isCurrentlyActive = searchBtn.classList.contains(
        "ds-toggle-button--selected",
      );
      if (isCurrentlyActive !== storedSearch) {
        searchBtn.click();
        console.log("已自动还原搜索状态:", storedSearch ? "已开启" : "已关闭");
      }
    }
    registerClickListener();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(restoreState, 500);
    });
  } else {
    setTimeout(restoreState, 500);
  }

  function registerClickListener() {
    document.addEventListener("click", function (event) {
      const el = event.target;

      matchSmartSearch(event, el);
      matchMode(event, el);
    });
  }

  function matchMode(event, el) {
    const group = el.closest('div[role="radiogroup"]');
    if (!group) return;

    const radios = group.querySelectorAll('div[role="radio"]');

    for (const radio of radios) {
      const rect = radio.getBoundingClientRect();
      if (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      ) {
        const modelType = radio.getAttribute("data-model-type");

        if (modelType === "default") {
          console.log("快速模式已开启");
          GM_setValue("deepseek_mode", "default");
        } else if (modelType === "expert") {
          console.log("专家模式已开启");
          GM_setValue("deepseek_mode", "expert");
        }
        break;
      }
    }
  }

  function matchSmartSearch(event, el) {
    const btn = el.closest(".ds-toggle-button");
    if (!btn) return;

    if (!btn.textContent.includes("智能搜索")) return;
    const isActive = btn.classList.contains("ds-toggle-button--selected");

    GM_setValue("deepseek_search", isActive);
    console.log("智能搜索状态:", isActive ? "已开启" : "已关闭");
  }
})();
