// ─────────────────────────────────────────────
// PLACEHOLDER URL CONSTANTS — replace before going live
// ─────────────────────────────────────────────
const ASSESSMENT_PAYMENT_URL = "https://your-payment-link-here.com/assessment-100";
const SCHEDULING_URL = "https://your-scheduling-link-here.com/executive-assessment-call";
// ─────────────────────────────────────────────

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

  // ── Assessment payment button ──────────────────────────────────────────────
  document.querySelectorAll(".js-assessment-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      window.open(ASSESSMENT_PAYMENT_URL, "_blank", "noopener,noreferrer");
    });
  });

  // ── Scheduling button ─────────────────────────────────────────────────────
  document.querySelectorAll(".js-schedule-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      window.open(SCHEDULING_URL, "_blank", "noopener,noreferrer");
    });
  });

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
      fullName:      fullName,
      email:         email,
      phone:         phone || null,
      currentWeight: currentWt,
      goalWeight:    goalWt,
      biggestObstacle: obstacle,
      willingToFollow: willing,
      submittedAt:   new Date().toISOString(),
    };

    // ── Console log (dev / integration placeholder) ──────────────────────
    console.log("[Mectofitness APEX] Application submission payload:", payload);

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

    showSuccess();
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

  function showSuccess() {
    form.style.display = "none";
    var success = document.getElementById("form-success");
    if (success) success.style.display = "block";
  }
});
