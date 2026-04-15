document.querySelectorAll("input").forEach((el) => {
  el.addEventListener("focus", () => {
    setTimeout(() => {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 350);
  });
});

function buildCategoryPath(linkName, pageLevel, pageName) {
  console.log(pageName, "PG NM");
  const isExplore = pageName.includes("explore");

  // Save per level
  if (pageLevel === "level_1") {
    sessionStorage.setItem(
      "cat_l1",
      linkName === "activity" ? "Esplora" : linkName,
    );
    sessionStorage.removeItem("cat_l2");
    sessionStorage.removeItem("cat_l3");
  }

  if (pageLevel === "level_2") {
    sessionStorage.setItem("cat_l2", linkName);
    sessionStorage.removeItem("cat_l3");
  }

  if (pageLevel === "level_3") {
    sessionStorage.setItem("cat_l3", linkName);
  }

  const l1 = sessionStorage.getItem("cat_l1") || "";
  const l2 = sessionStorage.getItem("cat_l2") || "";
  const l3 = sessionStorage.getItem("cat_l3") || "";

  // Build path
  if (isExplore) {
    return [l1, l2, l3].filter(Boolean).join(" - ");
  } else {
    return [l1, l2].filter(Boolean).join(" - ");
  }
}

function shouldHitAPI(pageName, pageLevel) {
  const isExplore = pageName.includes("explore");

  if (isExplore) {
    return pageLevel === "level_3" || pageLevel === "level_4";
  } else {
    return pageLevel === "level_2" || pageLevel === "level_3";
  }
}

// ================= HELPER: SID CONTROL =================
function shouldSendSid(updateTarget) {
  if (updateTarget !== "category1") return false;

  // Prevent sending sid multiple times
  if (sessionStorage.getItem("sid_sent") === "1") return false;

  const sid = sessionStorage.getItem("active_child_id");
  return !!sid;
}

// ================= STATUS OBSERVER =================
(function () {
  console.log("CHECKKKK");

  let statusSent = false;
  const pagePath = window.location.pathname || "";
  const isTransportColoringActivity = pagePath.includes(
    "tetun/activities/50_transport_art_design_1/activity.html",
  );
  // const isActivity188 = pagePath.includes("activity_188/activity.html");
  // const isActivity185 = pagePath.includes("activity_185/activity.html");

  function sendStatus(status) {
    if (statusSent) return;
    statusSent = true;
    console.log(status);
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No auth token found in localStorage!");
      return;
    }

    fetch("https://phpvib.mooo.com/track-activity.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
      keepalive: true,
    })
      .then((r) => r.json())
      .then((d) => console.log(`✅ STATUS UPDATED (${status})`, d))
      .catch((e) => console.error("❌ STATUS ERROR", e));
  }

  // ====================================================
  // ✅ NEXT ARROW CLICK → HIDDEN → COMPLETED
  // ====================================================
  function observeNextArrowHidden() {
    const isactivity_33_7 = pagePath.includes("activity_33_7/activity.html");
    const isactivity_33_1 = pagePath.includes("activity_33_1/activity.html");
    const observer = new MutationObserver(() => {
      const nextImg = Array.from(document.images).find((img) =>
        img.src.includes("images/next_arrow.png"),
      );

      if (!nextImg || isactivity_33_7 || isactivity_33_1) return;

      const nextBtn = document.getElementById("divBtnNext");
      if (!nextBtn) return;

      const style = window.getComputedStyle(nextBtn);
      console.log(style, "STYLE", style.display);

      if (style.display === "none") {
        console.log("✅ next_arrow.png became hidden (APK-safe) → COMPLETED");
        sendStatus("completed");
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });
  }

  // function observeWBNextHidden() {
  //   const observer = new MutationObserver(() => {
  //     const wbNext = document.getElementById("divBtnWBNext");
  //     if (!wbNext) return;
  //     const style = window.getComputedStyle(wbNext);

  //     if (style.display === "none") {
  //       console.log("✅ divBtnWBNext hidden → COMPLETED");
  //       sendStatus("completed");
  //       observer.disconnect();
  //     }
  //   });

  //   observer.observe(document.body, {
  //     childList: true,
  //     subtree: true,
  //     attributes: true,
  //     attributeFilter: ["style", "class"],
  //   });
  // }

  function observeGameState() {
    const correctPanel = document.getElementById("divCorrectTextPanel");

    const observer = new MutationObserver(() => {
      /* ✅ COMPLETED CHECK */
      if (correctPanel) {
        const style = window.getComputedStyle(correctPanel);
        if (style.display === "block") {
          console.log("✅ divCorrectTextPanel visible → COMPLETED");
          sendStatus("completed");
          observer.disconnect();
          return;
        }
      }

      /* ❌ LOSS / LOOS CHECK / tick */
      const bodyText = document.body.innerText.toLowerCase();
      if (
        bodyText.includes("loss") ||
        bodyText.includes("loos") ||
        document
          .querySelector('img[src*="tick.png"]')
          ?.closest("#divRightMarkPanel").style.display === "block"
      ) {
        console.log("❌ Loss detected → FAILED");
        sendStatus("completed");
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });
  }

  function areAllTransportPartsPainted() {
    const parts = document.querySelectorAll("img[name='imgObjectPart']");
    if (!parts.length) return false;

    for (const img of parts) {
      const src = img.getAttribute("src") || img.src || "";
      // On initial load many parts are uninitialized (empty src); treat as incomplete.
      if (!src || !src.trim()) return false;
      if (src.includes("/default/")) return false;
    }
    return true;
  }

  function observeTransportAllPainted() {
    const observer = new MutationObserver(() => {
      if (areAllTransportPartsPainted()) {
        console.log("All 4 transport images fully painted -> COMPLETED");
        sendStatus("completed");
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class", "src"],
    });

    // Handle case where page restores previously completed state.
    if (areAllTransportPartsPainted()) {
      sendStatus("completed");
      observer.disconnect();
    }
  }

  // function isActivity188FullyComplete() {
  //   if (typeof window.checkAllSlidesComplete === "function") {
  //     try {
  //       return !!window.checkAllSlidesComplete();
  //     } catch (e) {
  //       console.error("checkAllSlidesComplete failed:", e);
  //     }
  //   }

  //   const drags = document.querySelectorAll("div[id^='divDrag_']");
  //   if (!drags.length) return false;

  //   for (const drag of drags) {
  //     const style = window.getComputedStyle(drag);
  //     if (style.display !== "none") return false;
  //   }
  //   return true;
  // }

  // function observeActivity188Completion() {
  //   let pollId = null;

  //   const stopWatching = () => {
  //     if (pollId) {
  //       clearInterval(pollId);
  //       pollId = null;
  //     }
  //     observer.disconnect();
  //   };

  //   const observer = new MutationObserver(() => {
  //     if (isActivity188FullyComplete()) {
  //       console.log("Activity 188 all subactivities complete -> COMPLETED");
  //       sendStatus("completed");
  //       stopWatching();
  //     }
  //   });

  //   observer.observe(document.body, {
  //     childList: true,
  //     subtree: true,
  //     attributes: true,
  //     attributeFilter: ["style", "class"],
  //   });

  //   // Fallback: ensure completion is detected even if no matching mutation fires.
  //   pollId = setInterval(() => {
  //     if (isActivity188FullyComplete()) {
  //       console.log("Activity 188 completion detected by polling -> COMPLETED");
  //       sendStatus("completed");
  //       stopWatching();
  //     }
  //   }, 1000);

  //   if (isActivity188FullyComplete()) {
  //     sendStatus("completed");
  //     stopWatching();
  //   }
  // }

  // function isActivity185FullyComplete() {
  //   if (typeof window.checkAllSlidesComplete === "function") {
  //     try {
  //       return !!window.checkAllSlidesComplete();
  //     } catch (e) {
  //       console.error("checkAllSlidesComplete failed:", e);
  //     }
  //   }

  //   const drags = document.querySelectorAll("div[id^='divDrag_']");
  //   if (!drags.length) return false;

  //   for (const drag of drags) {
  //     const style = window.getComputedStyle(drag);
  //     if (style.display !== "none") return false;
  //   }
  //   return true;
  // }

  // function observeActivity185Completion() {
  //   let pollId = null;

  //   const stopWatching = () => {
  //     if (pollId) {
  //       clearInterval(pollId);
  //       pollId = null;
  //     }
  //     observer.disconnect();
  //   };

  //   const observer = new MutationObserver(() => {
  //     if (isActivity185FullyComplete()) {
  //       console.log("Activity 185 all subactivities complete -> COMPLETED");
  //       sendStatus("completed");
  //       stopWatching();
  //     }
  //   });

  //   observer.observe(document.body, {
  //     childList: true,
  //     subtree: true,
  //     attributes: true,
  //     attributeFilter: ["style", "class"],
  //   });

  //   pollId = setInterval(() => {
  //     if (isActivity185FullyComplete()) {
  //       console.log("Activity 185 completion detected by polling -> COMPLETED");
  //       sendStatus("completed");
  //       stopWatching();
  //     }
  //   }, 1000);

  //   if (isActivity185FullyComplete()) {
  //     sendStatus("completed");
  //     stopWatching();
  //   }
  // }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      if (isTransportColoringActivity) {
        observeTransportAllPainted();
      }
      // else if (isActivity185) {
      //   observeActivity185Completion();
      // } else if (isActivity188) {
      //   observeActivity188Completion();
      // }
      else {
        observeGameState();
        observeNextArrowHidden();
        //observeWBNextHidden();
      }
    });
  } else {
    if (isTransportColoringActivity) {
      observeTransportAllPainted();
    }
    // else if (isActivity185) {
    //   observeActivity185Completion();
    // } else if (isActivity188) {
    //   observeActivity188Completion();
    // }
    else {
      observeGameState();
      observeNextArrowHidden();
      //observeWBNextHidden();
    }
  }
})();

// ================= CORE FETCH =================
async function trackClick(data) {
  console.log(data, "DFDD");
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ No token in localStorage");
      return;
    }

    const res = await fetch("https://phpvib.mooo.com/track-activity.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
      keepalive: true,
    });

    const text = await res.text();
    console.log("RAW RESPONSE:", text);

    try {
      const json = JSON.parse(text);
      console.log("PARSED RESPONSE:", json);
    } catch (e) {
      console.error("JSON PARSE ERROR:", e);
    }
  } catch (err) {
    console.error("FETCH ERROR:", err);
  }
}

// ================= CLICK TRACKER =================
(function () {
  document.addEventListener("click", function (e) {
    console.log("IN CLICK LISTENER");
    // ❌ EXCLUDE BACK ARROW IMAGE CLICKS (ACTIVITY SCREEN)
    const backArrow = e.target.closest("img[src*='images/back_arrow.png']");
    if (backArrow) {
      console.log("⛔ Back arrow click ignored");
      return;
    }

    let el =
      e.target.closest("[name='divLink']") || e.target.closest("[onclick]");
    console.log(el, "ELLLELLL");
    const pageUrl = window.location.pathname;
    const isActivityPage = pageUrl.includes("tetun/activities");

    if (!el && !isActivityPage) return;
    // if (!el && isActivityPage) {
    //   el = e.target.closest("div") || e.target.closest("td") || e.target;
    // }
    else if (!el && isActivityPage) {
      console.log("⛔ Ignoring random activity click");
      return;
    }
    if (!el) return;

    // ---------- PAGE LEVEL ----------
    const pageName = pageUrl.split("/").pop();
    console.log(pageName, "PAGGGEE");
    let pageLevel = null;

    if (pageName.includes("level_1")) pageLevel = "level_1";
    else if (pageName.includes("level_2")) pageLevel = "level_2";
    else if (pageName.includes("level_3")) pageLevel = "level_3";
    else if (pageName.includes("level_4")) pageLevel = "level_4";

    // ---------- EXTRACT TEXT ----------
    let linkName = "";

    if (el.innerText) {
      linkName = el.innerText.trim();
      if (linkName.length > 100) {
        const lines = linkName
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        if (lines.length) linkName = lines[0];
      }
    }
    if (!linkName) {
      const imageNumber = el.id.split("_")[1];

      const imageDiv = document.getElementById("divImage_" + imageNumber);

      const textDiv = imageDiv?.nextElementSibling;
      const titleEl = document.getElementById("divTextAndImageCombination");
      if (textDiv) linkName = textDiv.innerText.trim();
      else if (titleEl) linkName = titleEl.innerText.trim();
    }

    if (!linkName) linkName = "activity";
    linkName = linkName.replace(/\s+/g, " ").substring(0, 200);

    // ---------- DECIDE UPDATE TARGET ----------
    let updateTarget = null;

    if (pageName.includes("explore")) {
      if (["level_1", "level_2", "level_3"].includes(pageLevel)) {
        updateTarget = "category1";
      } else if (pageLevel === "level_4") {
        updateTarget = "activity_name";
      }
    } else {
      if (pageLevel === "level_1" || pageLevel === "level_2") {
        updateTarget = "category1";
      } else if (pageLevel === "level_3") {
        updateTarget = "activity_name";
      }
    }

    if (!updateTarget) return;
    if (updateTarget === "category1" && !linkName.trim()) {
      console.log("⛔ Empty category1 ignored");
      return;
    }

    // ---------- BUILD PAYLOAD ----------
    let finalLink = linkName;

    // Only for category1 → build hierarchy
    if (updateTarget === "category1") {
      finalLink = buildCategoryPath(linkName, pageLevel, pageName);
    }

    const payload = {
      link: finalLink,
      page: pageName,
      updateTarget,
      pageLevel,
      status: null,
    };

    // 🔥 SEND SID ONLY ON FIRST CATEGORY1
    const sid = sessionStorage.getItem("active_child_id");
    if (sid) {
      payload.sid = sid;
    }
    sessionStorage.setItem("sid_sent", "1");
    console.log("🧒 SID SENT:", payload.sid);

    console.log("📌 TRACKING PAYLOAD:", payload);

    // 🚀 CONTROL API HIT
    if (shouldHitAPI(pageName, pageLevel)) {
      console.log("✅ API HIT ALLOWED");
      trackClick(payload);
    } else {
      console.log("⛔ API HIT SKIPPED for", pageLevel);
    }

    setTimeout(() => {
      if (e.target.href) {
        window.location.href = e.target.href;
      }
    }, 150);
  });
})();
