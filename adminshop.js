async function render() {
  if ((location.hash || "") === "#/logout") {
    await petavuData.auth.signOut();
    location.hash = "#/login";
  }
  const user = await petavuData.auth.user();
  if (!user) {
    petavuShell(
      "ورود کنترل بازرگانی",
      `<a href="${PETAVU_ENV.origins.website}">سایت</a>`,
      `<form id="f"><input name="email" type="email" required dir="ltr" placeholder="ایمیل"><input name="password" type="password" required placeholder="رمز"><button class="btn">ورود</button><p id="m"></p></form>`
    );
    qs("#f").onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const { error } = await petavuData.auth.signIn(String(fd.get("email")), String(fd.get("password")));
      qs("#m").innerHTML = error ? `<span class="err">${error.message}</span>` : "";
      if (!error) render();
    };
    return;
  }
  const me = await petavuData.profile.me();
  if (!me || !["admin", "shop_admin"].includes(me.role)) {
    petavuShell("دسترسی نیست", `<a href="#/logout">خروج</a>`, "<p>فقط مدیر بازرگانی.</p>");
    return;
  }
  const { data } = await petavuData.products.all();
  const rows = (data || [])
    .map((p) => `<tr><td>${p.name}</td><td>${p.businesses?.name || ""}</td><td>${money(p.price_irr)}</td><td>${p.published ? "بله" : "خیر"}</td></tr>`)
    .join("");
  petavuShell(
    "کنترل بازرگانی",
    `<a href="#/logout">خروج</a>`,
    `<p class="muted">نسخهٔ ۱: مشاهدهٔ کاتالوگ. موجودی و سفارش بعداً.</p>
     <table><thead><tr><th>کالا</th><th>کسب‌وکار</th><th>قیمت</th><th>انتشار</th></tr></thead><tbody>${rows}</tbody></table>`
  );
}
window.addEventListener("hashchange", render);
render();
