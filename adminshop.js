async function render() {
  if ((location.hash || "") === "#/logout") {
    await petavuData.auth.signOut();
    location.hash = "#/login";
  }
  const user = await petavuData.auth.user();
  if (!user) {
    petavuGate({
      lock: true,
      image: "assets/login.jpg",
      kicker: "دروازهٔ کنترل بازرگانی",
      title: "احراز هویت ادارهٔ بازار",
      lead: "این صفحه جدا از میز کار اعضا و جدا از ادارهٔ شبکه است. فقط راهبران بازار با نشانی مستقیم وارد می‌شوند.",
      captionTitle: "سامانهٔ کنترل بازار پتاوو",
      caption: "کالا، تأمین و جریان سفارش میان پت‌شاپ، کلینیک و اصطبل — فرمان بازرگانی در دست شما.",
      form: `<form id="f">
        <label>نام کاربری</label>
        <input name="email" type="email" required dir="ltr" placeholder="ایمیل" autocomplete="username">
        <label>رمز عبور</label>
        <input name="password" type="password" required placeholder="رمز عبور" autocomplete="current-password">
        <button class="btn" type="submit">تأیید هویت و ورود</button>
        <p id="m"></p>
      </form>`,
      extra: `<p class="gate-extra"><a href="${PETAVU_ENV.origins.website}">بازگشت به سایت</a></p>`,
    });
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
