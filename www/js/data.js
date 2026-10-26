/* Sample data for the FoodieNoms prototype.
   Vendors and listings are simulated, as the TBS brief allows ("simulated vendors and sample food listings").
   Replace `img: null` with a real photo path (e.g. "assets/food/croissant.jpg") to show photos. */
window.FN = window.FN || {};

(function () {
  // The prototype runs on a fixed demo clock so pickup windows always make sense during a demo.
  const now = new Date();
  now.setHours(16, 40, 0, 0);
  const day = (offset, h = 12, m = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };

  FN.DEMO_NOW = now.toISOString();
  FN.CO2_PER_MEAL_KG = 1.2; // estimate from the TBS draft; confirm the source with TBS
  FN.CATEGORIES = ["Bakery", "Café", "Dessert", "Meals", "Drinks", "Others"];
  FN.PRICE_BANDS = [
    { id: "lt5", label: "Under RM5", min: 0, max: 4.999 },
    { id: "5to10", label: "RM5–RM10", min: 5, max: 10 },
    { id: "gt10", label: "RM10+", min: 10.001, max: 9999 }
  ];
  FN.CAMPUSES = ["Taylor’s University · Lakeside", "Sunway University", "Monash University Malaysia"];

  FN.seed = function () {
    return {
      version: 3,
      users: [
        { id: "u1", role: "student", name: "FoodieLover123", email: "foodielover123@sd.taylors.edu.my", phone: "+60 11-2233 4455", campus: FN.CAMPUSES[0] },
        { id: "u2", role: "vendor", vendorId: "v1", name: "Loaf & Latte", email: "hello@loafandlatte.my" }
      ],
      vendors: [
        { id: "v1", name: "Loaf & Latte", cat: "Bakery", ratingBase: 4.4, ratingCount: 45, area: "Syopz Mall, Lakeside Campus", walk: 5, opens: "08:00", closes: "17:30", phone: "+60 12-345 6789", email: "hello@loafandlatte.my", accepting: true, img: null, rescued: 126, recovered: 612 },
        { id: "v2", name: "Alice Signature Cafe", cat: "Dessert", ratingBase: 4.9, ratingCount: 20, area: "Lakeside Campus, Block D", walk: 1, opens: "09:00", closes: "18:00", phone: "+60 3-5629 1100", email: "alice@signaturecafe.my", accepting: true, img: null },
        { id: "v3", name: "Maru Coffee", cat: "Café", ratingBase: 4.8, ratingCount: 92, area: "Syopz Mall, Lakeside Campus", walk: 6, opens: "08:00", closes: "21:00", phone: "+60 12-880 2211", email: "hi@marucoffee.my", accepting: true, img: null },
        { id: "v4", name: "G&G Cafe", cat: "Meals", ratingBase: 4.1, ratingCount: 10, area: "Lakeside Campus, Block E", walk: 3, opens: "10:00", closes: "17:00", phone: "+60 17-332 9087", email: "ggcafe@gmail.com", accepting: true, img: null },
        { id: "v5", name: "Bread Story", cat: "Bakery", ratingBase: 4.5, ratingCount: 31, area: "SS15, Subang Jaya", walk: 12, opens: "07:30", closes: "21:30", phone: "+60 3-5612 7788", email: "ss15@breadstory.my", accepting: true, img: null },
        { id: "v6", name: "Kopi Corner", cat: "Café", ratingBase: 4.2, ratingCount: 18, area: "Sunway Pyramid, LG2", walk: 15, opens: "07:00", closes: "19:00", phone: "+60 11-6655 2020", email: "kopicorner@mail.my", accepting: true, img: null }
      ],
      listings: [
        { id: "l1", vendorId: "v1", name: "Croissant", cat: "Bakery", orig: 10, price: 5, qty: 4, left: 1, from: "16:30", to: "17:30", visible: true, desc: "All-butter croissant baked this morning. Flaky outside, soft inside.", img: null },
        { id: "l2", vendorId: "v1", name: "Cinnamon Roll", cat: "Bakery", orig: 9.5, price: 4.75, qty: 6, left: 1, from: "16:30", to: "17:30", visible: true, desc: "Soft swirl with cinnamon sugar and a light vanilla glaze. Best eaten today.", img: null },
        { id: "l3", vendorId: "v1", name: "Sausage Roll", cat: "Bakery", orig: 15, price: 7.5, qty: 3, left: 2, from: "16:30", to: "17:30", visible: true, desc: "Chicken sausage wrapped in puff pastry. Reheat for 5 minutes at home.", img: null },
        { id: "l4", vendorId: "v1", name: "Ham Sandwich", cat: "Meals", orig: 11, price: 5.5, qty: 2, left: 1, from: "16:30", to: "17:30", visible: true, desc: "Turkey ham, cheddar and lettuce on sourdough. Made at noon, kept chilled.", img: null },
        { id: "l5", vendorId: "v1", name: "Banana Bread Slice", cat: "Bakery", orig: 8, price: 4, qty: 4, left: 3, from: "16:30", to: "17:30", visible: true, desc: "Moist banana bread with walnuts. Two thick slices per portion.", img: null },
        { id: "l6", vendorId: "v2", name: "Tiramisu Cup", cat: "Dessert", orig: 14, price: 9.8, qty: 3, left: 2, from: "17:00", to: "18:00", visible: true, desc: "Coffee-soaked sponge with mascarpone cream. Keep refrigerated.", img: null },
        { id: "l7", vendorId: "v2", name: "Basque Cheesecake Slice", cat: "Dessert", orig: 16, price: 11.2, qty: 2, left: 1, from: "17:00", to: "18:00", visible: true, desc: "Burnt-top cheesecake, creamy centre. One generous slice.", img: null },
        { id: "l8", vendorId: "v3", name: "Croissant", cat: "Bakery", orig: 8, price: 6.4, qty: 4, left: 2, from: "19:30", to: "21:00", visible: true, desc: "Plain butter croissant from this afternoon's batch.", img: null },
        { id: "l9", vendorId: "v3", name: "Almond Danish", cat: "Bakery", orig: 9.5, price: 7.6, qty: 2, left: 1, from: "19:30", to: "21:00", visible: true, desc: "Danish pastry with almond cream and toasted flakes.", img: null },
        { id: "l10", vendorId: "v3", name: "Iced Latte", cat: "Drinks", orig: 12, price: 9.6, qty: 3, left: 2, from: "19:30", to: "21:00", visible: true, desc: "Double-shot iced latte. Ordered fresh at pickup from surplus beans and milk.", img: null },
        { id: "l11", vendorId: "v3", name: "Banana Muffin", cat: "Bakery", orig: 7, price: 5.6, qty: 3, left: 2, from: "19:30", to: "21:00", visible: true, desc: "Banana muffin with a crunchy sugar top.", img: null },
        { id: "l12", vendorId: "v4", name: "Chicken Rice Box", cat: "Meals", orig: 12, price: 6, qty: 4, left: 2, from: "16:30", to: "17:00", visible: true, desc: "Roasted chicken rice with chilli and soup. Cooked at lunch.", img: null },
        { id: "l13", vendorId: "v4", name: "Nasi Lemak", cat: "Meals", orig: 10, price: 5, qty: 3, left: 1, from: "16:30", to: "17:00", visible: true, desc: "Coconut rice, sambal, egg, anchovies and peanuts.", img: null },
        { id: "l14", vendorId: "v5", name: "Sourdough Loaf", cat: "Bakery", orig: 18, price: 10.8, qty: 3, left: 2, from: "20:00", to: "21:30", visible: true, desc: "Country sourdough baked this morning. Slices well for tomorrow's toast.", img: null },
        { id: "l15", vendorId: "v5", name: "Kaya Bun", cat: "Bakery", orig: 4, price: 2.4, qty: 6, left: 4, from: "20:00", to: "21:30", visible: true, desc: "Soft bun filled with pandan kaya.", img: null },
        { id: "l16", vendorId: "v5", name: "Garlic Bread", cat: "Bakery", orig: 6, price: 3.6, qty: 4, left: 3, from: "20:00", to: "21:30", visible: true, desc: "Garlic butter baguette, ready to warm in the oven.", img: null },
        { id: "l17", vendorId: "v5", name: "Pandan Swiss Roll", cat: "Dessert", orig: 5, price: 3, qty: 3, left: 2, from: "20:00", to: "21:30", visible: true, desc: "Two slices of pandan sponge roll with cream.", img: null },
        { id: "l18", vendorId: "v6", name: "Kaya Toast Set", cat: "Café", orig: 8, price: 5.6, qty: 3, left: 2, from: "18:00", to: "19:00", visible: true, desc: "Kaya butter toast with two soft-boiled eggs.", img: null },
        { id: "l19", vendorId: "v6", name: "Kopi O", cat: "Drinks", orig: 4, price: 2.8, qty: 5, left: 3, from: "18:00", to: "19:00", visible: true, desc: "Traditional black coffee, hot or iced.", img: null },
        { id: "l20", vendorId: "v6", name: "Curry Puff", cat: "Others", orig: 3, price: 2.1, qty: 6, left: 4, from: "18:00", to: "19:00", visible: true, desc: "Potato and chicken curry puff.", img: null }
      ],
      orders: [
        { id: "FN-2481", userId: "u1", student: "FoodieLover123", vendorId: "v1", items: [{ listingId: "l2", name: "Cinnamon Roll", qty: 1, price: 4.75, orig: 9.5 }], slot: "17:00", status: "paid", code: "4821", method: "E-wallet", createdAt: day(0, 16, 32), rated: false },
        { id: "FN-2484", userId: "u7", student: "Aina R.", vendorId: "v1", items: [{ listingId: "l1", name: "Croissant", qty: 2, price: 5, orig: 10 }], slot: "17:15", status: "paid", code: "3307", method: "Online banking", createdAt: day(0, 16, 35), rated: false },
        { id: "FN-2486", userId: "u8", student: "Daniel T.", vendorId: "v1", items: [{ listingId: "l3", name: "Sausage Roll", qty: 1, price: 7.5, orig: 15 }], slot: "17:15", status: "paid", code: "9154", method: "Card", createdAt: day(0, 16, 37), rated: false },
        { id: "FN-2470", userId: "u9", student: "Mei Ling", vendorId: "v1", items: [{ listingId: "l2", name: "Cinnamon Roll", qty: 2, price: 4.75, orig: 9.5 }], slot: "16:30", status: "collected", code: "5512", method: "E-wallet", createdAt: day(0, 16, 10), rated: false },
        { id: "FN-2390", userId: "u1", student: "FoodieLover123", vendorId: "v3", items: [{ listingId: "l8", name: "Croissant", qty: 2, price: 6.4, orig: 8 }], slot: "20:30", status: "collected", code: "1180", method: "E-wallet", createdAt: day(-4, 20, 2), rated: false },
        { id: "FN-2311", userId: "u1", student: "FoodieLover123", vendorId: "v4", items: [{ listingId: "l12", name: "Chicken Rice Box", qty: 1, price: 6, orig: 12 }], slot: "16:30", status: "collected", code: "7702", method: "Online banking", createdAt: day(-7, 16, 5), rated: true },
        { id: "FN-2290", userId: "u1", student: "FoodieLover123", vendorId: "v2", items: [{ listingId: "l6", name: "Tiramisu Cup", qty: 1, price: 9.8, orig: 14 }], slot: "17:30", status: "cancelled", code: "6630", method: "E-wallet", createdAt: day(-10, 17, 1), rated: false },
        { id: "FN-2245", userId: "u1", student: "FoodieLover123", vendorId: "v5", items: [{ listingId: "l15", name: "Kaya Bun", qty: 3, price: 2.4, orig: 4 }], slot: "20:45", status: "collected", code: "4409", method: "Card", createdAt: day(-12, 20, 20), rated: false },
        { id: "FN-2201", userId: "u1", student: "FoodieLover123", vendorId: "v1", items: [{ listingId: "l1", name: "Croissant", qty: 1, price: 5, orig: 10 }], slot: "17:00", status: "collected", code: "8113", method: "E-wallet", createdAt: day(-15, 16, 50), rated: true },
        { id: "FN-2160", userId: "u1", student: "FoodieLover123", vendorId: "v6", items: [{ listingId: "l18", name: "Kaya Toast Set", qty: 1, price: 5.6, orig: 8 }], slot: "18:15", status: "collected", code: "2004", method: "E-wallet", createdAt: day(-19, 18, 0), rated: false },
        { id: "FN-1988", userId: "u1", student: "FoodieLover123", vendorId: "v3", items: [{ listingId: "l11", name: "Banana Muffin", qty: 2, price: 5.6, orig: 7 }], slot: "20:00", status: "collected", code: "3360", method: "Card", createdAt: day(-41, 19, 50), rated: false },
        { id: "FN-1850", userId: "u1", student: "FoodieLover123", vendorId: "v5", items: [{ listingId: "l14", name: "Sourdough Loaf", qty: 1, price: 10.8, orig: 18 }], slot: "21:00", status: "collected", code: "9013", method: "E-wallet", createdAt: day(-70, 20, 40), rated: false }
      ],
      reviews: [
        { id: "r1", vendorId: "v1", author: "Aina R.", stars: 5, text: "Croissants were still flaky at 5pm. Pickup took under a minute.", tags: ["Food quality", "Quick pickup"], createdAt: day(-2), reply: "" },
        { id: "r2", vendorId: "v1", author: "Daniel T.", stars: 4, text: "Great value. Sausage roll was a bit cold but tasty.", tags: ["Good value"], createdAt: day(-5), reply: "Thanks Daniel! We now keep rolls in the warmer until pickup." },
        { id: "r3", vendorId: "v1", author: "Mei Ling", stars: 5, text: "Staff had my order ready when I arrived. Will come back!", tags: ["Friendly staff"], createdAt: day(-8), reply: "" },
        { id: "r4", vendorId: "v3", author: "Jessica", stars: 5, text: "Iced latte was made fresh. Feels like a secret menu.", tags: ["Fresh"], createdAt: day(-3), reply: "" },
        { id: "r5", vendorId: "v2", author: "Xing Yi", stars: 5, text: "Tiramisu cup at 30% off is a steal.", tags: ["Good value"], createdAt: day(-6), reply: "" },
        { id: "r6", vendorId: "v4", author: "Irfan", stars: 4, text: "Generous chicken rice portion, sambal is spicy.", tags: ["Food quality"], createdAt: day(-9), reply: "" },
        { id: "r7", vendorId: "v5", author: "Priya", stars: 5, text: "Sourdough was perfect toasted the next morning.", tags: ["Fresh"], createdAt: day(-4), reply: "" },
        { id: "r8", vendorId: "v6", author: "Hafiz", stars: 4, text: "Kopi O hits the spot. Toast was slightly cold.", tags: ["Good value"], createdAt: day(-11), reply: "" }
      ],
      notifications: [
        { id: "n1", to: "u1", kind: "deal", icon: "tag", title: "New deal at Maru Coffee", body: "4 pastries just listed at 20% off, 6 min walk away.", at: day(0, 16, 30), read: false, link: "vendor/v3" },
        { id: "n2", to: "u1", kind: "order", icon: "check", title: "Payment confirmed", body: "Order #FN-2481 · RM4.75 (test mode).", at: day(0, 16, 32), read: false, link: "order/FN-2481" },
        { id: "n3", to: "u1", kind: "review", icon: "star", title: "How was Maru Coffee?", body: "Rate your pickup to help other students.", at: day(-4, 21, 0), read: true, link: "review/FN-2390" },
        { id: "n4", to: "u1", kind: "deal", icon: "heart", title: "Saved shop update", body: "Alice Signature Cafe listed 2 desserts.", at: day(-5, 17, 2), read: true, link: "vendor/v2" },
        { id: "n5", to: "v1", kind: "order", icon: "receipt", title: "New reservation", body: "FoodieLover123 reserved 1 × Cinnamon Roll for 5:00 pm.", at: day(0, 16, 32), read: false, link: "v/reservations" },
        { id: "n6", to: "v1", kind: "order", icon: "wallet", title: "Payment received (test)", body: "RM4.75 for order #FN-2481.", at: day(0, 16, 32), read: false, link: "v/reservations" },
        { id: "n7", to: "v1", kind: "alert", icon: "alert", title: "Listing ending soon", body: "Ham Sandwich closes in 50 min with 1 portion left.", at: day(0, 16, 40), read: false, link: "v/listings" },
        { id: "n8", to: "v1", kind: "review", icon: "star", title: "New 5-star review", body: "Aina R. reviewed your croissants.", at: day(-2, 18, 0), read: true, link: "v/reviews" }
      ],
      saved: ["v1", "v2", "v3"],
      settings: { notifOrders: true, notifDeals: true, notifSaved: true, notifReminder: false, savedAlerts: true },
      leaderboard: [
        { name: "Xing Yi", meals: 20 }, { name: "Jessica", meals: 18 }, { name: "Irisssss", meals: 15 },
        { name: "Hafiz", meals: 13 }, { name: "Priya", meals: 12 }, { name: "Aina R.", meals: 11 },
        { name: "Daniel T.", meals: 10 }, { name: "Mei Ling", meals: 9 }
      ]
    };
  };
})();
