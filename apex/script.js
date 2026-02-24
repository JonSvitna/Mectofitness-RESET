// ─────────────────────────────────────────────
// PLACEHOLDER URL CONSTANTS — replace before going live
// ─────────────────────────────────────────────

// TODO: Replace with your actual Calendly scheduling page URL
// Example: "https://calendly.com/your-name/executive-assessment"
const CALENDLY_URL = "TODO_ADD_CALENDLY_LINK";

// TODO: Payment integration — replace with actual provider link when decided.
// Options: Stripe Payment Link, PayPal, custom checkout, etc.
const ASSESSMENT_PAYMENT_URL = "TODO_ADD_PAYMENT_LINK";

// ─────────────────────────────────────────────

// ── Internal Tracking Utility ─────────────────────────────────────────────
// Logs events to console and queues in localStorage. No external analytics.
const TRACKING_QUEUE_KEY = "mectofitness_apex_events";

function track(eventName, data) {
  var event = {
    event: eventName,
    data: data || {},
    timestamp: new Date().toISOString(),
  };
  console.log("[APEX Track]", eventName, event.data);
  try {
    var queue = JSON.parse(localStorage.getItem(TRACKING_QUEUE_KEY) || "[]");
    queue.push(event);
    if (queue.length > 50) queue = queue.slice(-50); // cap queue size
    localStorage.setItem(TRACKING_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) { /* localStorage unavailable */ }
}

// ── Application localStorage key ──────────────────────────────────────────
const APP_STORAGE_KEY = "mectofitness_apex_application";

// ── Calendly popup helper ──────────────────────────────────────────────────
function openCalendly() {
  if (CALENDLY_URL === "TODO_ADD_CALENDLY_LINK") {
    console.warn("[APEX] Calendly URL not configured. Set the CALENDLY_URL constant in script.js.");
    return;
  }
  if (typeof Calendly !== "undefined" && Calendly.initPopupWidget) {
    Calendly.initPopupWidget({ url: CALENDLY_URL });
  } else {
    // Fallback: open in new tab if Calendly script has not yet loaded
    window.open(CALENDLY_URL, "_blank", "noopener,noreferrer");
  }
}

document.addEventListener("DOMContentLoaded", function () {

  // ── Smooth scroll for nav / CTA anchor links ──────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // ── CTA tracking — Apply buttons ──────────────────────────────────────────
  document.querySelectorAll('a[href="#admission"].btn-primary').forEach(function (btn) {
    btn.addEventListener("click", function () {
      track("CTA_CLICK_APPLY", { label: btn.textContent.trim() });
    });
  });

  // ── CTA tracking — Book / Begin Assessment buttons ────────────────────────
  document.querySelectorAll('a[href="#admission"].btn-secondary').forEach(function (btn) {
    btn.addEventListener("click", function () {
      track("CTA_CLICK_BOOK", { label: btn.textContent.trim() });
    });
  });

  // ── Payment button (TODO — provider not yet decided) ──────────────────────
  document.querySelectorAll(".js-assessment-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      // TODO: Implement payment flow once provider is decided.
      // Options:
      //   - Stripe Payment Link: window.open(ASSESSMENT_PAYMENT_URL, "_blank", "noopener,noreferrer");
      //   - PayPal button embed
      //   - Custom checkout page redirect
      console.log("[APEX] Payment button clicked — integration pending.");
      track("CTA_CLICK_PAYMENT", { label: btn.textContent.trim() });
    });
  });

  // ── Calendly booking buttons ───────────────────────────────────────────────
  document.querySelectorAll(".js-calendly-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      track("CALENDLY_POPUP_OPENED", { source: btn.dataset.source || "admission" });
      openCalendly();
    });
  });

  // ── Restore form from localStorage (edit application) ─────────────────────
  var editLink = document.getElementById("form-edit-link");
  var savedApp = null;
  try {
    savedApp = JSON.parse(localStorage.getItem(APP_STORAGE_KEY));
  } catch (e) { /* ignore parse errors */ }

  if (savedApp && editLink) {
    editLink.style.display = "inline";
    editLink.addEventListener("click", function (e) {
      e.preventDefault();
      var form = document.getElementById("apex-application-form");
      var success = document.getElementById("form-success");
      if (form) {
        populateForm(savedApp);
        form.style.display = "flex";
      }
      if (success) {
        success.style.display = "none";
      }
      if (form) {
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  // ── Application form ──────────────────────────────────────────────────────
  var form = document.getElementById("apex-application-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearErrors();

    var valid = true;

    var fullName    = getValue("field-name");
    var email       = getValue("field-email");
    var phone       = getValue("field-phone");
    var currentWt   = getValue("field-current-weight");
    var goalWt      = getValue("field-goal-weight");
    var obstacle    = getValue("field-obstacle");
    var willing     = getValue("field-willing");

    if (!fullName)  { showError("field-name",           "Full name is required."); valid = false; }
    if (!email)     { showError("field-email",          "Email address is required."); valid = false; }
    else if (!isValidEmail(email)) { showError("field-email", "Enter a valid email address."); valid = false; }
    if (!currentWt) { showError("field-current-weight", "Current weight is required."); valid = false; }
    if (!goalWt)    { showError("field-goal-weight",    "Goal weight is required."); valid = false; }
    if (!obstacle)  { showError("field-obstacle",       "Please describe your biggest obstacle."); valid = false; }
    if (!willing)   { showError("field-willing",        "Please select yes or no."); valid = false; }

    if (!valid) return;

    var payload = {
      fullName:        fullName,
      email:           email,
      phone:           phone || null,
      currentWeight:   currentWt,
      goalWeight:      goalWt,
      biggestObstacle: obstacle,
      willingToFollow: willing,
      submittedAt:     new Date().toISOString(),
    };

    // ── Console log ──────────────────────────────────────────────────────────
    console.log("[Mectofitness APEX] Application submission payload:", payload);

    // ── Persist to localStorage ───────────────────────────────────────────
    try {
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) { /* localStorage unavailable */ }

    // ── Track event ───────────────────────────────────────────────────────
    track("APPLICATION_SUBMIT_SUCCESS", { email: email });

    // TODO: Integrate with backend API — choose one:
    // Option A — Klaviyo:
    //   fetch("https://a.klaviyo.com/client/subscriptions/?company_id=YOUR_KLAVIYO_KEY", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ data: { type: "subscription", attributes: { profile: payload } } }),
    //   });
    //
    // Option B — LeadConnector / GoHighLevel webhook:
    //   fetch("https://services.leadconnectorhq.com/hooks/YOUR_WEBHOOK_ID/webhook-trigger/...", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(payload),
    //   });
    //
    // Option C — Generic webhook (Zapier / Make / n8n):
    //   fetch("https://hooks.zapier.com/hooks/catch/YOUR_HOOK_ID/", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(payload),
    //   });
    // ─────────────────────────────────────────────────────────────────────

    showSuccessAndHighlight();
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  function getValue(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  function showError(fieldId, msg) {
    var field = document.getElementById(fieldId);
    if (!field) return;
    field.classList.add("input-error");
    var err = document.createElement("span");
    err.className = "field-error";
    err.setAttribute("role", "alert");
    err.textContent = msg;
    field.insertAdjacentElement("afterend", err);
  }

  function clearErrors() {
    document.querySelectorAll(".field-error").forEach(function (el) { el.remove(); });
    document.querySelectorAll(".input-error").forEach(function (el) { el.classList.remove("input-error"); });
  }

  function showSuccessAndHighlight() {
    form.style.display = "none";
    var success = document.getElementById("form-success");
    if (success) success.style.display = "block";

    // Auto-scroll to admission section so user sees the booking area
    var admissionSection = document.getElementById("admission");
    if (admissionSection) {
      admissionSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // Visually highlight the booking area for 4 seconds
    var bookingArea = document.getElementById("booking-area");
    if (bookingArea) {
      bookingArea.classList.add("booking-highlight");
      setTimeout(function () {
        bookingArea.classList.remove("booking-highlight");
      }, 4000);
    }
  }

  function populateForm(data) {
    var fields = {
      "field-name":           data.fullName || "",
      "field-email":          data.email || "",
      "field-phone":          data.phone || "",
      "field-current-weight": data.currentWeight || "",
      "field-goal-weight":    data.goalWeight || "",
      "field-obstacle":       data.biggestObstacle || "",
      "field-willing":        data.willingToFollow || "",
    };
    Object.keys(fields).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = fields[id];
    });
  }
});
