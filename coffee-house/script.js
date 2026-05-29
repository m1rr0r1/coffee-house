// 🍹 DOM Elements
const main = document.querySelector("main");
const header = document.querySelector("header");
const cart_button = document.querySelector(".cart_button");
const burger_menu_cart_button = document.querySelector(".burger_menu_cart_button");
const drink = document.querySelector(".drink");
const slider = document.querySelector(".slider");
const three_lines = document.querySelector(".three-lines");
const loader = document.querySelector(".loader");
const left_button = document.querySelector(".arrow-left");
const right_button = document.querySelector(".arrow-right");
const menu_link = document.querySelector(".menu_link");
const links = document.querySelectorAll(".link");
const bars = document.querySelector(".fa-bars");
const cross = document.querySelector(".fa-xmark");
const burger_menu = document.querySelector(".burger-menu");
const burger_menu_links = document.querySelectorAll(".burger_menu_link");
const button = document.querySelector(".home button");
const add_cart = document.querySelector(".add_cart");
const close = document.querySelector(".close");
const backdrop = document.querySelector(".backdrop");
const modal = document.querySelector(".modal");
const modal_photo = document.querySelector(".modal_photo");
const modal_name = document.querySelector(".modal .name");
const modal_description = document.querySelector(".modal .description");
const sizes_block = document.querySelector(".sizes_block");
const additives_block = document.querySelector(".additives_block");
var ProductCategory;
(function (ProductCategory) {
    ProductCategory["COFFEE"] = "coffee";
    ProductCategory["TEA"] = "tea";
    ProductCategory["DESSERT"] = "dessert";
})(ProductCategory || (ProductCategory = {}));
// 🥤 Media Sources (arrays of image URLs)
const productImages = {
    [ProductCategory.COFFEE]: [],
    [ProductCategory.TEA]: [],
    [ProductCategory.DESSERT]: [],
};
const drinks = [];
const drinks_names = [];
const drinks_info = [];
const drink_prices = [];
var PageView;
(function (PageView) {
    PageView["HOME"] = "home";
    PageView["MENU"] = "menu";
    PageView["CART"] = "cart";
    PageView["LOGIN"] = "login";
    PageView["REGISTER"] = "register";
})(PageView || (PageView = {}));
var SizeKey;
(function (SizeKey) {
    SizeKey["SMALL"] = "s";
    SizeKey["MEDIUM"] = "m";
    SizeKey["LARGE"] = "l";
    SizeKey["EXTRA_LARGE"] = "xl";
    SizeKey["EXTRA_EXTRA_LARGE"] = "xxl";
})(SizeKey || (SizeKey = {}));
var AdditiveIndex;
(function (AdditiveIndex) {
    AdditiveIndex[AdditiveIndex["FIRST"] = 0] = "FIRST";
    AdditiveIndex[AdditiveIndex["SECOND"] = 1] = "SECOND";
    AdditiveIndex[AdditiveIndex["THIRD"] = 2] = "THIRD";
})(AdditiveIndex || (AdditiveIndex = {}));
var SlideDirection;
(function (SlideDirection) {
    SlideDirection["LEFT"] = "left";
    SlideDirection["RIGHT"] = "right";
})(SlideDirection || (SlideDirection = {}));
var lineState;
(function (lineState) {
    lineState["ACTIVE"] = "active";
    lineState["PAUSED"] = "paused";
    lineState["RESUME"] = "resume";
})(lineState || (lineState = {}));
var DisplayState;
(function (DisplayState) {
    DisplayState["SHOW"] = "flex";
    DisplayState["HIDE"] = "none";
})(DisplayState || (DisplayState = {}));
var LoaderText;
(function (LoaderText) {
    LoaderText["LOADING"] = "Loading...";
    LoaderText["ERROR"] = "Something went wrong. Please, refresh the page";
})(LoaderText || (LoaderText = {}));
// ⚙️ State and Data Variables
let current = 0; // current index for slideshow
let startX = 0; // touch start X coordinate
let endX = 0; // touch end X coordinate
let count = 0;
let cartTotalPrice = 0;
let totalDiscount = 0;
let data = []; // fetched product data (type `any` for now)
let fullData = [];
let filteredData = [];
let dataFavorites = [];
let product;
let blocks = []; // some collection of blocks in UI (usage not shown here)
let productsExpanded = false;
let isTransitioning = false;
let isOpen = false;
let current_product = {
    adds: [],
    totalPrice: 0,
    addsTypes: [],
    size: SizeKey.SMALL,
    productSize: "",
    index: 0,
    id: "1",
    type: ProductCategory.COFFEE,
    quantity: 1,
};
const current_products = [];
// 🔁 Constants & Timer Variables
const INTERVAL = 3000;
const lines = [".first_line", ".second_line", ".third_line"];
let timer = null;
let startedAt = 0;
let remaining = INTERVAL;
// Utility functions
const isHome = () => main.classList.contains(PageView.HOME);
const isLoggedIn = () => localStorage.getItem("jwt") !== null;
// Backup of the original main children nodes (to reset DOM if needed)
const backup = Array.from(main.childNodes);
// 🛒 GENERIC API FETCHER
async function apiFetch(endpoint) {
    const response = await fetch(endpoint);
    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
}
// API REQUESTS
async function getFavorites() {
    try {
        loader.style.display = DisplayState.SHOW;
        slider.style.display = DisplayState.HIDE;
        three_lines.style.display = DisplayState.HIDE;
        const result = await apiFetch("https://6kt29kkeub.execute-api.eu-central-1.amazonaws.com/products/favorites");
        dataFavorites = result.data;
        loader.style.display = DisplayState.HIDE;
        slider.style.display = DisplayState.SHOW;
        three_lines.style.display = DisplayState.SHOW;
        drinks.push(...dataFavorites.map((product) => `images/slider_${product.id}.png`));
        drinks_names.push(...dataFavorites.map((p) => p.name));
        drinks_info.push(...dataFavorites.map((p) => p.description));
        drink_prices.push(...dataFavorites.map((p) => `$${p.price}`));
        render();
    }
    catch (error) {
        console.log("Error fetching data:", error);
        loader.textContent = LoaderText.ERROR;
    }
}
async function getProducts() {
    const loader = document.createElement("div");
    loader.className = "second-loader";
    loader.textContent = LoaderText.LOADING;
    main.appendChild(loader);
    console.log("[getProducts] Starting fetch");
    try {
        const result = await apiFetch("https://6kt29kkeub.execute-api.eu-central-1.amazonaws.com/products");
        fullData = result.data;
        data = result.data;
        result.data.forEach((product) => {
            const ext = product.category === ProductCategory.COFFEE ? "jpg" : "png";
            const imagePath = `images/${product.id}.${ext}`;
            productImages[product.category].push(imagePath);
        });
        return true;
    }
    catch (error) {
        main.classList.remove(...Object.values(PageView));
        main.classList.add(PageView.MENU);
        main.innerHTML = "";
        const h1 = document.createElement("h1");
        h1.innerHTML = `Behind each of our cups <br />
	              hides an <span>amazing surprise</span>`;
        const errorDiv = document.createElement("div");
        errorDiv.className = "fetch-error";
        errorDiv.textContent = "Something went wrong. Please, refresh the page";
        main.appendChild(h1);
        main.appendChild(errorDiv);
        console.log("Error fetching data:", error);
        return false;
    }
    finally {
        if (main.contains(loader)) {
            main.removeChild(loader);
        }
    }
}
async function getProduct(id) {
    const loader = document.createElement("div");
    loader.textContent = LoaderText.LOADING;
    loader.style.fontSize = "100px";
    backdrop.appendChild(loader);
    try {
        const result = await apiFetch(`https://6kt29kkeub.execute-api.eu-central-1.amazonaws.com/products/${id}`);
        backdrop.removeChild(loader);
        return result.data;
    }
    catch (error) {
        backdrop.removeChild(loader);
        backdrop.style.display = DisplayState.HIDE;
        document.body.classList.remove("modal-open");
        console.log("Error fetching data:", error);
        alert("Something went wrong. Please, try again");
        return null;
    }
}
function createImage() {
    const img = document.createElement("img");
    img.src = drinks[current];
    img.alt = `coffee-slider-${current}`;
    img.oncontextmenu = (e) => {
        e.preventDefault();
        return false;
    };
    img.draggable = false;
    drink.appendChild(img);
}
function createDrinkName() {
    const drink_name = document.createElement("h3");
    drink_name.textContent = drinks_names[current];
    drink_name.className = "drink-name";
    drink.appendChild(drink_name);
}
function createDrinkInfo() {
    const drink_info = document.createElement("p");
    drink_info.textContent = drinks_info[current];
    drink_info.className = "drink-info";
    drink.appendChild(drink_info);
}
function createDrinkPrice() {
    const drink_price = document.createElement("p");
    drink_price.textContent = drink_prices[current];
    drink_price.className = "price";
    drink.appendChild(drink_price);
}
function changeActive() {
    if (lines.length < 3)
        return;
    lines.forEach((sel) => {
        const el = document.querySelector(sel);
        if (el) {
            el.classList.remove(...Object.values(lineState));
        }
    });
    const activeLine = document.querySelector(lines[current]);
    if (activeLine)
        activeLine.classList.add(lineState.ACTIVE);
}
function changeCoffee(isInterval, direction = SlideDirection.LEFT) {
    if (isInterval) {
        current = current > 0 ? current - 1 : 2;
    }
    render();
    playCycle(direction);
}
function playCycle(direction = SlideDirection.LEFT) {
    drink.style.animation = "none";
    void drink.offsetWidth; // force reflow
    const base = "slideInHoldOut 3000ms ease-in-out";
    const dir = direction === SlideDirection.RIGHT ? "reverse" : "normal";
    drink.style.animation = `${base} ${dir} forwards`;
}
function render() {
    if (!isHome())
        return;
    drink.innerHTML = "";
    createImage();
    createDrinkName();
    createDrinkInfo();
    createDrinkPrice();
    changeActive();
}
function tick() {
    if (!isHome()) {
        schedule(INTERVAL);
        return;
    }
    changeCoffee(true, SlideDirection.LEFT);
    remaining = INTERVAL;
    schedule(INTERVAL);
}
function schedule(delay = remaining) {
    if (timer)
        clearTimeout(timer);
    remaining = delay;
    startedAt = performance.now();
    timer = window.setTimeout(tick, delay);
}
function pause() {
    if (!timer)
        return;
    clearTimeout(timer);
    timer = null;
    const elapsed = performance.now() - startedAt;
    remaining = Math.max(0, remaining - elapsed);
    drink.style.animationPlayState = "paused";
    const activeLine = document.querySelector(lines[current]);
    if (activeLine) {
        activeLine.classList.remove(lineState.RESUME);
        activeLine.classList.add(lineState.PAUSED);
    }
}
function resume() {
    if (timer)
        return;
    drink.style.animationPlayState = "running";
    const activeLine = document.querySelector(lines[current]);
    if (activeLine) {
        activeLine.classList.remove(lineState.PAUSED);
        activeLine.classList.add(lineState.RESUME);
    }
    schedule(remaining || INTERVAL);
}
// Initial schedule on next animation frames
requestAnimationFrame(() => requestAnimationFrame(() => schedule(INTERVAL)));
drink.addEventListener("pointerenter", pause);
["pointerleave", "pointercancel"].forEach((ev) => drink.addEventListener(ev, resume));
drink.addEventListener("animationend", (e) => {
    if (e.animationName === "slideInHoldOut") {
        drink.style.transform = "none";
    }
});
left_button.addEventListener("click", () => {
    pause();
    current = current > 0 ? current - 1 : 2;
    changeCoffee(false, SlideDirection.LEFT);
    remaining = INTERVAL;
    resume();
});
right_button.addEventListener("click", () => {
    pause();
    current = current < 2 ? current + 1 : 0;
    changeCoffee(false, SlideDirection.RIGHT);
    remaining = INTERVAL;
    resume();
});
slider.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    endX = startX;
});
slider.addEventListener("touchmove", (e) => {
    endX = e.touches[0].clientX;
});
slider.addEventListener("touchend", () => {
    const deltaX = endX - startX;
    const minSwipeDistance = 50;
    if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX < 0) {
            left_button.click();
        }
        else {
            right_button.click();
        }
    }
    startX = 0;
    endX = 0;
});
button.addEventListener("click", () => menu_link.click());
menu_link.addEventListener("click", async (e) => {
    const target = e.currentTarget;
    target.classList.add("disable_cursor");
    menu_link.style.borderBottom = "2px solid #403f3d";
    cart_button.classList.remove("disable_cursor");
    cart_button.style.borderBottom = "";
    updateCartButtonVisibility(PageView.MENU);
    cross.click();
    if (data.length === 0) {
        const success = await getProducts();
        if (!success)
            return;
    }
    const h1 = document.createElement("h1");
    const buttons = document.createElement("div");
    const content = document.createElement("div");
    const load_more_button = document.createElement("div");
    h1.innerHTML = `Behind each of our cups <br />
	              hides an <span>amazing surprise</span>`;
    buttons.innerHTML = `
		<div class="button coffee">
		  <img src="assets/coffee.png" alt="" />
		  <p>Coffee</p>
		</div>
		<div class="button tea">
		  <img src="assets/tea.png" alt="" />
		  <p>Tea</p>
		</div>
		<div class="button dessert">
		  <img src="assets/dessert.png" alt="" />
		  <p>Dessert</p>
		</div>`;
    load_more_button.innerHTML = `<i class="fa-solid fa-rotate-right"></i>`;
    main.classList.remove(...Object.values(PageView));
    main.classList.add(PageView.MENU);
    buttons.classList.add("buttons");
    content.classList.add("content");
    load_more_button.classList.add("load-button");
    main.innerHTML = "";
    main.appendChild(h1);
    main.appendChild(buttons);
    main.appendChild(content);
    main.appendChild(load_more_button);
    // Function to render products of a specific category
    async function renderCategory(category) {
        const buttonsEls = buttons.querySelectorAll(".button");
        buttonsEls.forEach((btn) => btn.classList.remove("disable_cursor"));
        const activeButton = buttons.querySelector(`.${category}`);
        activeButton.classList.add("disable_cursor");
        content.innerHTML = "";
        current_product.type = category;
        filteredData = fullData.filter((el) => el.category === category);
        const srcMap = {
            coffee: productImages.coffee,
            tea: productImages.tea,
            dessert: productImages.dessert,
        };
        const sources = srcMap[category];
        filteredData.forEach((item, i) => {
            const img = document.createElement("img");
            const name = document.createElement("h3");
            const description = document.createElement("p");
            const block = document.createElement("div");
            const info_block = document.createElement("div");
            const price = document.createElement("p");
            const discountPrice = document.createElement("p");
            const prices_block = document.createElement("div");
            block.classList.add("block");
            info_block.classList.add("info_block");
            price.classList.add("price");
            discountPrice.classList.add("discount_price");
            prices_block.classList.add("prices_block");
            name.textContent = item.name;
            description.textContent = item.description;
            price.textContent = `$${item.price}`;
            discountPrice.textContent = `$${item.discountPrice}`;
            img.src = sources[i];
            img.alt = `${category}-${i}`;
            block.appendChild(img);
            info_block.appendChild(name);
            info_block.appendChild(description);
            info_block.appendChild(prices_block);
            if (isLoggedIn() && item.discountPrice !== null) {
                price.style.textDecoration = "line-through";
                price.style.opacity = "0.5";
                prices_block.appendChild(discountPrice);
            }
            prices_block.appendChild(price);
            block.appendChild(info_block);
            content.appendChild(block);
        });
        content.dispatchEvent(new Event("contentchange"));
    }
    buttons.querySelectorAll(".button").forEach((btn) => {
        btn.addEventListener("click", () => {
            buttons.querySelectorAll(".button").forEach((b) => {
                b.classList.remove("clicked");
            });
            btn.classList.add("clicked");
        });
    });
    // Coffee button
    buttons.querySelector(".coffee")?.addEventListener("click", () => {
        renderCategory(ProductCategory.COFFEE);
    });
    // Tea button
    buttons.querySelector(".tea")?.addEventListener("click", () => {
        renderCategory(ProductCategory.TEA);
    });
    // Dessert button
    buttons.querySelector(".dessert")?.addEventListener("click", () => {
        renderCategory(ProductCategory.DESSERT);
    });
    // Handling content change event
    content.addEventListener("contentchange", () => {
        blocks = Array.from(document.querySelectorAll(".block"));
        productsExpanded = false;
        handleResponsiveDisplay();
        blocks.forEach((block, i) => {
            block.addEventListener("click", async () => {
                const img = block.querySelector("img");
                if (!img)
                    return;
                current_product = {
                    adds: [],
                    totalPrice: 0,
                    addsTypes: [],
                    size: SizeKey.SMALL,
                    productSize: "",
                    index: i,
                    id: img.src.split("/").pop()?.split(".")[0] || "",
                    type: current_product.type, // Preserve the current category
                    quantity: 1,
                };
                modal_photo.src = img.src;
                modal_photo.alt = `modal-photo-${i}`;
                current_product.id =
                    modal_photo.src.split("/").pop()?.split(".")[0] || "";
                document.body.classList.add("modal-open");
                backdrop.style.display = "block";
                product = await getProduct(current_product.id);
                if (!product) {
                    console.log("error");
                    return;
                }
                modal.style.display = "flex";
                modal_name.textContent = product.name;
                modal_description.textContent = product.description;
                current_product.index = i;
                createSizes();
                createAdditives();
                current_product.productSize = product.sizes[current_product.size].size;
                updateTotal();
            });
        });
    });
    // Initial load coffee category
    buttons.querySelector(".coffee")?.click();
    const createAdditives = () => {
        const divs = ["first", "second", "third"];
        const p1s = ["additive_one", "additive_two", "additive_three"];
        const p2s = ["first_additive", "second_additive", "third_additive"];
        additives_block.innerHTML = "";
        product?.additives.forEach((additive, i) => {
            const div = document.createElement("div");
            const p1 = document.createElement("p");
            const p2 = document.createElement("p");
            const tooltip = document.createElement("div");
            div.className = divs[i] ?? "";
            p1.className = p1s[i] ?? "";
            p2.classList = p2s[i] ?? "";
            p1.textContent = (i + 1).toString();
            p2.textContent = additive.name;
            tooltip.className = "tooltip";
            if (isLoggedIn() && additive.discountPrice !== undefined) {
                tooltip.innerHTML = `<s>$${parseFloat(additive.price).toFixed(2)}</s> $${parseFloat(additive.discountPrice).toFixed(2)}`;
            }
            else {
                tooltip.innerHTML = `$${parseFloat(additive.price).toFixed(2)}`;
            }
            div.addEventListener("click", () => {
                div.classList.toggle("modal_button_active");
                additiveFilter(i, additive.name);
                updateTotal();
            });
            div.appendChild(p1);
            div.appendChild(p2);
            div.appendChild(tooltip);
            additives_block.appendChild(div);
        });
    };
    const createSizes = () => {
        const divs = {
            s: "small",
            m: "medium",
            l: "large",
            xl: "extra_large",
            xxl: "extra_extra_large",
        };
        const p1s = [
            SizeKey.SMALL,
            SizeKey.MEDIUM,
            SizeKey.LARGE,
            SizeKey.EXTRA_LARGE,
            SizeKey.EXTRA_EXTRA_LARGE,
        ];
        const sizeDivs = [];
        sizes_block.innerHTML = "";
        p1s.forEach((key) => {
            const size = product?.sizes?.[key];
            if (!size)
                return;
            const div = document.createElement("div");
            const p1 = document.createElement("p");
            const p2 = document.createElement("p");
            const tooltip = document.createElement("div");
            div.className = divs[key] ?? "";
            p1.textContent = key.toUpperCase() ?? "";
            p2.textContent = size.size;
            p1.className = key;
            p2.className = `size_${key}`;
            tooltip.className = "tooltip";
            if (isLoggedIn() && size.discountPrice !== undefined) {
                tooltip.innerHTML = `<s>$${parseFloat(size.price).toFixed(2)}</s> $${parseFloat(size.discountPrice).toFixed(2)}`;
            }
            else {
                tooltip.innerHTML = `$${parseFloat(size.price).toFixed(2)}`;
            }
            div.appendChild(p1);
            div.appendChild(p2);
            div.appendChild(tooltip);
            sizes_block.appendChild(div);
            sizeDivs.push(div);
            div.addEventListener("click", () => {
                sizeDivs.forEach((b) => b.classList.remove("modal_button_active"));
                div.classList.add("modal_button_active");
                current_product.size = key;
                current_product.productSize = size.size;
                updateTotal();
            });
        });
        sizeDivs[0]?.classList.add("modal_button_active");
        current_product.size = SizeKey.SMALL;
    };
    const rotate_arrow = load_more_button.querySelector(".fa-rotate-right");
    let rotation = 0;
    rotate_arrow?.addEventListener("click", () => {
        rotation += 360;
        if (rotate_arrow) {
            rotate_arrow.style.transform = `rotate(${rotation}deg)`;
            rotate_arrow.style.transition = `.5s`;
        }
        setTimeout(loadAllProducts, 500);
    });
    rotate_arrow?.addEventListener("transitionend", () => {
        load_more_button.style.display = "none";
    });
    function handleResponsiveDisplay() {
        const rotateArrow = load_more_button.querySelector(".fa-rotate-right");
        const notDesktop = window.innerWidth <= 768;
        const products = content.querySelectorAll(".block");
        products.forEach((p) => p.classList.remove("hidden"));
        if (notDesktop && products.length > 4 && !productsExpanded) {
            products.forEach((p, i) => {
                if (i >= 4)
                    p.classList.add("hidden");
            });
            load_more_button.style.display = "block";
        }
        else {
            load_more_button.style.display = "none";
        }
        if (rotateArrow)
            rotateArrow.style.transition = "none";
    }
    function loadAllProducts() {
        const hiddenProducts = content.querySelectorAll(".block.hidden");
        hiddenProducts.forEach((p) => p.classList.remove("hidden"));
        productsExpanded = true;
    }
    window.addEventListener("resize", handleResponsiveDisplay);
});
links.forEach((link, i) => {
    link.addEventListener("click", () => {
        if (i !== 4) {
            if (i === 0)
                cross.click();
            menu_link.style.borderBottom = "";
            menu_link.classList.remove("disable_cursor");
            cart_button.style.display = "none";
            burger_menu_cart_button.style.display = "none";
            cart_button.style.borderBottom = "";
            cart_button.classList.remove("disable_cursor");
            main.classList.remove(...Object.values(PageView));
            main.classList.add(PageView.HOME);
            main.replaceChildren(...backup);
            document.querySelector("video").play();
            remaining = INTERVAL;
            render();
            schedule(INTERVAL);
        }
    });
});
burger_menu_links.forEach((link, i) => {
    link.addEventListener("click", () => {
        if (i === 4) {
            menu_link.click();
        }
        else if (i !== 3) {
            cross.click();
            menu_link.classList.remove("disable_cursor");
            cart_button.style.borderBottom = "";
            cart_button.classList.remove("disable_cursor");
            cart_button.style.display = "none";
            burger_menu_cart_button.style.display = "none";
            main.classList.remove(...Object.values(PageView));
            main.classList.add(PageView.HOME);
            main.replaceChildren(...backup);
            document.querySelector("video").play();
            remaining = INTERVAL;
            render();
            schedule(INTERVAL);
        }
        else {
            cross.click();
        }
    });
});
window.matchMedia("(min-width: 768px)").addEventListener("change", (e) => {
    if (e.matches) {
        burger_menu.classList.remove("is-open");
        header.classList.remove("menu-open");
        burger_menu.style.display = "none";
        isOpen = false;
        isTransitioning = false;
    }
});
bars.addEventListener("click", openMenu);
cross.addEventListener("click", closeMenu);
function openMenu() {
    if (isOpen || isTransitioning)
        return;
    isTransitioning = true;
    burger_menu.style.display = "block";
    // Trigger reflow to enable transition
    burger_menu.getBoundingClientRect();
    burger_menu.classList.add("is-open");
    header.classList.add("menu-open");
    const onEnd = (e) => {
        if (e.propertyName === "transform") {
            isTransitioning = false;
            isOpen = true;
            burger_menu.removeEventListener("transitionend", onEnd);
        }
    };
    burger_menu.addEventListener("transitionend", onEnd);
}
function closeMenu() {
    if (!isOpen || isTransitioning)
        return;
    isTransitioning = true;
    burger_menu.classList.remove("is-open");
    header.classList.remove("menu-open");
    const onEnd = (e) => {
        if (e.propertyName === "transform") {
            burger_menu.style.display = "none";
            isTransitioning = false;
            isOpen = false;
            burger_menu.removeEventListener("transitionend", onEnd);
        }
    };
    burger_menu.addEventListener("transitionend", onEnd);
}
const updateTotal = () => {
    // Calculate original price (non-discounted)
    const sizeOriginalPrice = parseFloat(product?.sizes?.[current_product.size]?.price ?? "0");
    const additivesOriginalPrice = current_product.adds.reduce((sum, i) => sum + parseFloat(product?.additives?.[i]?.price ?? "0"), 0);
    const originalTotal = sizeOriginalPrice + additivesOriginalPrice;
    // Calculate discounted price (if logged in and discounts are available)
    const sizeDiscountPrice = isLoggedIn()
        ? parseFloat(product?.sizes?.[current_product.size]?.discountPrice ??
            product?.sizes?.[current_product.size]?.price ??
            "0")
        : sizeOriginalPrice;
    const additivesDiscountPrice = isLoggedIn()
        ? current_product.adds.reduce((sum, i) => sum +
            parseFloat(product?.additives?.[i]?.discountPrice ??
                product?.additives?.[i]?.price ??
                "0"), 0)
        : additivesOriginalPrice;
    const discountedTotal = sizeDiscountPrice + additivesDiscountPrice;
    // Update the modal's total price display
    const totalOriginalPriceEl = document.querySelector(".modal .total_original_price");
    const totalDiscountedPriceEl = document.querySelector(".modal .total_discounted_price");
    if (isLoggedIn() && discountedTotal < originalTotal) {
        // Show both original (strikethrough) and discounted prices
        totalOriginalPriceEl.textContent = `$${originalTotal.toFixed(2)}`;
        totalDiscountedPriceEl.textContent = `$${discountedTotal.toFixed(2)}`;
        totalOriginalPriceEl.style.display = "inline";
    }
    else {
        // Show only the original price (no discount available or not logged in)
        totalOriginalPriceEl.textContent = "";
        totalOriginalPriceEl.style.display = "none";
        totalDiscountedPriceEl.textContent = `$${originalTotal.toFixed(2)}`;
    }
    // Update current_product totalPrice (reflects the price the user will pay)
    current_product.totalPrice = discountedTotal;
};
const additiveFilter = (num, additiveName) => {
    if (current_product.adds.includes(num)) {
        current_product.adds = current_product.adds.filter((additive) => additive !== num);
        current_product.addsTypes = current_product.addsTypes.filter((additive) => additive !== additiveName);
    }
    else {
        current_product.adds.push(num);
        current_product.addsTypes.push(additiveName);
    }
};
backdrop.addEventListener("click", () => close.click());
close.addEventListener("click", () => {
    document.body.classList.remove("modal-open");
    backdrop.style.display = "none";
    modal.style.display = "none";
    [
        document.querySelector(".modal .small"),
        document.querySelector(".modal .medium"),
        document.querySelector(".modal .large"),
        document.querySelector(".modal .first_additive"),
        document.querySelector(".modal .second_additive"),
        document.querySelector(".modal .third_additive"),
    ].forEach((btn) => {
        btn?.classList.remove("modal_button_active");
    });
    current_product = {
        adds: [],
        totalPrice: 0,
        addsTypes: [],
        size: SizeKey.SMALL,
        productSize: "",
        index: 0,
        id: "",
        type: current_product.type,
        quantity: 1,
    };
    current_product.adds = [];
    product = null;
});
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") {
        close.click();
    }
});
add_cart.addEventListener("click", () => {
    addToCart();
});
const addToCart = () => {
    const stored = localStorage.getItem("cartCount");
    count = stored !== null ? parseInt(stored) : 0;
    const storedCart = localStorage.getItem("cart");
    const cart = storedCart ? JSON.parse(storedCart) : [];
    if (product) {
        cart.push(product);
        current_products.push({ ...current_product, quantity: 1 });
        localStorage.setItem("cart", JSON.stringify(cart));
        localStorage.setItem("current_products", JSON.stringify(current_products));
    }
    count++;
    localStorage.setItem("cartCount", count.toString());
    updateCartButtonVisibility();
    close.click();
};
const updateCartButtonVisibility = (view = "") => {
    const cart = JSON.parse(localStorage.getItem("cart") ?? "[]");
    cart_button.style.display =
        isLoggedIn() ||
            cart.length > 0 ||
            (main.classList.contains(PageView.CART) && !view)
            ? "inline"
            : "none";
    burger_menu_cart_button.style.display =
        isLoggedIn() ||
            cart.length > 0 ||
            (main.classList.contains(PageView.CART) && !view)
            ? "inline"
            : "none";
    updateCartNumber();
};
const updateCartNumber = () => {
    const cart_number = document.querySelectorAll(".cart_number");
    const cart_total_discount = document.querySelectorAll(".total_discount");
    count = parseInt(localStorage.getItem("cartCount") || "0");
    cart_number.forEach((number) => (number.textContent = count > 0 ? count.toString() : ""));
    cart_total_discount.forEach((discount) => (discount.textContent =
        totalDiscount > 0 ? `$${totalDiscount.toFixed(2)}` : ""));
};
const updateCart = () => {
    const cart_products = document.querySelector(".cart_products");
    const cart_total_price = document.querySelector(".cart_price");
    const confirm_order = document.querySelector(".confirm_order");
    cart_products.innerHTML = "";
    const cart = localStorage.getItem("cart");
    let totalCartPrice = 0;
    let totalCartOriginalPrice = 0;
    totalDiscount = 0;
    if (cart) {
        const cartProducts = JSON.parse(cart);
        cartProducts.forEach((product, i) => {
            const trash = document.createElement("i");
            const productInfo = document.createElement("div");
            const productRow = document.createElement("div");
            const img = document.createElement("img");
            const product_name = document.createElement("p");
            const product_price = document.createElement("p");
            const prices_block = document.createElement("div");
            const original_price = document.createElement("p");
            const discount_price = document.createElement("p");
            trash.classList.add("fa-solid", "fa-trash");
            productInfo.className = "product_info";
            productRow.className = "product_row";
            product_name.className = "product_name";
            product_price.className = "product_price";
            prices_block.className = "prices_block";
            original_price.className = "original_price";
            discount_price.className = "discount_price";
            img.src =
                product.category === ProductCategory.COFFEE
                    ? `images/${product.id}.jpg `
                    : `images/${product.id}.png`;
            img.alt = `cart-product-${i}`;
            product_name.textContent = product.name;
            const productCustomization = current_products[i] || {
                adds: [],
                totalPrice: parseFloat(product.price || "0"),
                addsTypes: [],
                size: SizeKey.SMALL,
                productSize: product.sizes?.s?.size || "Small",
                index: i,
                id: product.id.toString(),
                type: product.category,
                quantity: 1,
            };
            // Calculate original and discounted prices for the product
            const sizeOriginalPrice = parseFloat(product.sizes[productCustomization.size].price || "0");
            const sizeDiscountPrice = isLoggedIn()
                ? parseFloat(product.sizes[productCustomization.size]?.discountPrice ||
                    product.sizes[productCustomization.size]?.price ||
                    "0")
                : sizeOriginalPrice;
            const additivesOriginalPrice = productCustomization.adds.reduce((sum, addIndex) => sum + parseFloat(product.additives[addIndex]?.price || "0"), 0);
            const additivesDiscountPrice = isLoggedIn()
                ? productCustomization.adds.reduce((sum, addIndex) => sum +
                    parseFloat(product.additives[addIndex]?.discountPrice ||
                        product.additives[addIndex]?.price ||
                        "0"), 0)
                : additivesOriginalPrice;
            const productOriginalPrice = sizeOriginalPrice + additivesOriginalPrice;
            const productDiscountPrice = sizeDiscountPrice + additivesDiscountPrice;
            totalCartOriginalPrice += productOriginalPrice;
            totalCartPrice += productDiscountPrice;
            totalDiscount = totalCartOriginalPrice - totalCartPrice;
            // Display prices
            original_price.textContent = `$${productOriginalPrice.toFixed(2)}`;
            discount_price.textContent = `$${productDiscountPrice.toFixed(2)}`;
            if (isLoggedIn() && productDiscountPrice < productOriginalPrice) {
                original_price.style.textDecoration = "line-through";
                original_price.style.opacity = "0.5";
                prices_block.appendChild(original_price);
                prices_block.appendChild(discount_price);
            }
            else {
                prices_block.appendChild(discount_price); // Only show the original price if no discount
            }
            trash.addEventListener("click", () => {
                cartProducts.splice(i, 1);
                current_products.splice(i, 1);
                localStorage.setItem("cart", JSON.stringify(cartProducts));
                localStorage.setItem("current_products", JSON.stringify(current_products));
                let count = parseInt(localStorage.getItem("cartCount") || "0");
                count = Math.max(0, count - 1);
                localStorage.setItem("cartCount", count.toString());
                updateCartButtonVisibility();
                updateCart();
            });
            const product_info_div = document.createElement("div");
            product_info_div.className = "product_info_div";
            const product_type = document.createElement("div");
            product_type.className = "product_type";
            const sizeSpan = document.createElement("span");
            sizeSpan.textContent = productCustomization.productSize;
            sizeSpan.className = "product_size";
            const spans = [sizeSpan];
            productCustomization.addsTypes.forEach((addType) => {
                const addSpan = document.createElement("span");
                addSpan.className = "product_additive";
                addSpan.textContent = addType;
                spans.push(addSpan);
            });
            spans.forEach((span, i) => {
                if (i < spans.length - 1) {
                    span.textContent += ",";
                }
                product_type.appendChild(span);
            });
            productInfo.appendChild(trash);
            productInfo.appendChild(img);
            product_info_div.appendChild(product_name);
            product_info_div.appendChild(product_type);
            productInfo.appendChild(product_info_div);
            productRow.appendChild(productInfo);
            productRow.appendChild(prices_block);
            cart_products?.appendChild(productRow);
        });
        // Update total price display
        if (isLoggedIn() && totalCartPrice < totalCartOriginalPrice) {
            cart_total_price.innerHTML = `<p class="total_original_price">$${totalCartOriginalPrice.toFixed(2)}</p> <p>$${totalCartPrice.toFixed(2)}</p>`;
        }
        else {
            cart_total_price.textContent = `$${totalCartPrice.toFixed(2)}`;
        }
        if (cartProducts.length > 0 && isLoggedIn()) {
            if (!confirm_order) {
                // Create Confirm button if it doesn't exist
                const newConfirmOrder = document.createElement("div");
                const orderConfirmResponse = document.createElement("p");
                newConfirmOrder.textContent = "Confirm";
                newConfirmOrder.className = "confirm_order";
                orderConfirmResponse.className = "confirm_order_response";
                main.appendChild(newConfirmOrder);
                main.appendChild(orderConfirmResponse);
            }
        }
        else {
            // Remove Confirm button if it exists
            if (confirm_order) {
                confirm_order.remove();
            }
        }
    }
    else {
        // Cart is empty, remove Confirm button if it exists
        if (confirm_order) {
            confirm_order.remove();
        }
    }
    cartTotalPrice = totalCartPrice;
    updateCartButtonVisibility();
};
burger_menu_cart_button.addEventListener("click", () => cart_button.click());
cart_button.addEventListener("click", async () => {
    main.classList.remove(...Object.values(PageView));
    main.classList.add(PageView.CART);
    cart_button.classList.add("disable_cursor");
    menu_link.classList.remove("disable_cursor");
    cart_button.style.borderBottom = "2px solid #403f3d";
    menu_link.style.borderBottom = "";
    updateCartButtonVisibility();
    main.innerHTML = "";
    const h1 = document.createElement("h1");
    h1.textContent = "Cart";
    h1.className = "cart";
    const div = document.createElement("div");
    const div2 = document.createElement("div");
    const p1 = document.createElement("p");
    const p2 = document.createElement("p");
    p1.textContent = "Total:";
    p2.textContent = "$0.00";
    p1.className = "cart_total";
    p2.className = "cart_price";
    div.className = "cart_total_price";
    div2.className = "cart_products";
    div.appendChild(p1);
    div.appendChild(p2);
    const sign_in = document.createElement("div");
    sign_in.textContent = "Sign In";
    sign_in.className = "sign_in";
    const registration = document.createElement("div");
    registration.textContent = "Registration";
    registration.className = "registration";
    const buttons = document.createElement("div");
    buttons.className = "cart_buttons";
    main.appendChild(h1);
    main.appendChild(div2);
    main.appendChild(div);
    if (isLoggedIn()) {
        const jwtToken = localStorage.getItem("jwt");
        try {
            const response = await fetch("https://6kt29kkeub.execute-api.eu-central-1.amazonaws.com/auth/profile", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Profile fetch failed:", errorData.message || response.statusText);
                if (response.status === 401) {
                    localStorage.removeItem("jwt");
                    updateCartButtonVisibility();
                }
                return;
            }
            const profileData = await response.json();
            localStorage.setItem("userData", JSON.stringify(profileData.data));
            console.log("Profile loaded:", profileData.data);
        }
        catch (error) {
            console.log("Network error", error);
        }
        const div3 = document.createElement("div");
        const div4 = document.createElement("div");
        const p3 = document.createElement("p");
        const p4 = document.createElement("p");
        const p5 = document.createElement("p");
        const p6 = document.createElement("p");
        p3.textContent = "Address:";
        p5.textContent = "Pay by:";
        const userData = localStorage.getItem("userData");
        if (userData) {
            const parsedData = JSON.parse(userData);
            p4.textContent = `${parsedData.city}, ${parsedData.street}, ${parsedData.houseNumber}`;
            p6.textContent = parsedData.paymentMethod;
        }
        div3.className = "address";
        div4.className = "pay_by";
        div3.appendChild(p3);
        div3.appendChild(p4);
        div4.appendChild(p5);
        div4.appendChild(p6);
        main.appendChild(div3);
        main.appendChild(div4);
    }
    else {
        buttons.appendChild(sign_in);
        buttons.appendChild(registration);
        main.appendChild(buttons);
    }
    updateCart(); // render products in cart
});
document.addEventListener("click", (e) => {
    const target = e.target;
    if (target.classList.contains("sign_in")) {
        main.classList.remove(...Object.values(PageView));
        main.classList.add(PageView.LOGIN);
        cart_button.style.borderBottom = "";
        cart_button.classList.remove("disable_cursor");
        updateCartButtonVisibility();
        main.innerHTML = `
			<h1>Sign In</h1>
			<label class="label_login">
				Login
				<input class="input_login" type="text" placeholder="Enter login">
				<i class="fa-solid fa-circle-exclamation error_icon"></i>
			</label>
			<p class="login_error"></p>
			<label class="label_password">
				Password
				<input class="input_password" type="password" placeholder="Enter password">
				<i class="fa-solid fa-circle-exclamation error_icon"></i>
			</label>
			<p class="password_error"></p>
			<p class="auth_error"></p>
			<div class="login_button disabled" style="cursor: not-allowed;">Sign In</div>
		`;
        // DOM elements
        const input_login = main.querySelector(".input_login");
        const input_password = main.querySelector(".input_password");
        const login_error = main.querySelector(".login_error");
        const password_error = main.querySelector(".password_error");
        const auth_error = main.querySelector(".auth_error");
        const login_icon = main.querySelector(".label_login .error_icon");
        const password_icon = main.querySelector(".label_password .error_icon");
        const sign_in = main.querySelector(".login_button");
        let isLoginValid = false;
        let isPasswordValid = false;
        const validateLogin = (value) => {
            const startsWithLetter = /^[a-zA-Z]/.test(value);
            const onlyLetters = /^[a-zA-Z]+$/.test(value);
            return value.length >= 3 && startsWithLetter && onlyLetters;
        };
        const validatePassword = (value) => {
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
            return value.length >= 6 && hasSpecialChar;
        };
        const updateButtonState = () => {
            sign_in.classList.toggle("disabled", !(isLoginValid && isPasswordValid));
            sign_in.style.cursor =
                isLoginValid && isPasswordValid ? "pointer" : "not-allowed";
        };
        const setInputError = (input, error, icon, message) => {
            input.style.border = "1px solid red";
            icon.style.display = "inline-block";
            error.textContent = message;
        };
        const clearInputError = (input, error, icon) => {
            input.style.border = "";
            icon.style.display = "none";
            error.textContent = "";
        };
        input_login.addEventListener("blur", () => {
            const value = input_login.value.trim();
            if (!value) {
                setInputError(input_login, login_error, login_icon, "Login is required");
                isLoginValid = false;
            }
            else if (!validateLogin(value)) {
                setInputError(input_login, login_error, login_icon, "Login must be 3+ characters, start with a letter, and contain only English letters");
                isLoginValid = false;
            }
            else {
                clearInputError(input_login, login_error, login_icon);
                isLoginValid = true;
            }
            updateButtonState();
        });
        input_login.addEventListener("focus", () => {
            clearInputError(input_login, login_error, login_icon);
            auth_error.textContent = "";
        });
        input_password.addEventListener("blur", () => {
            const value = input_password.value.trim();
            if (!value) {
                setInputError(input_password, password_error, password_icon, "Password is required");
                isPasswordValid = false;
            }
            else if (!validatePassword(value)) {
                setInputError(input_password, password_error, password_icon, "Password must be 6+ characters and include at least 1 special character");
                isPasswordValid = false;
            }
            else {
                clearInputError(input_password, password_error, password_icon);
                isPasswordValid = true;
            }
            updateButtonState();
        });
        input_password.addEventListener("focus", () => {
            clearInputError(input_password, password_error, password_icon);
            auth_error.textContent = "";
        });
        // Initialize button state
        sign_in.classList.add("disabled");
        sign_in.style.cursor = "not-allowed";
        // Sign In button click handler
        sign_in.addEventListener("click", async () => {
            if (!isLoginValid || !isPasswordValid)
                return;
            auth_error.textContent = "";
            sign_in.textContent = "Signing In...";
            try {
                const response = await fetch("https://6kt29kkeub.execute-api.eu-central-1.amazonaws.com/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        login: input_login.value.trim(),
                        password: input_password.value.trim(),
                    }),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Authentication failed");
                }
                const data = await response.json();
                const access_token = data.data.access_token;
                localStorage.setItem("jwt", access_token);
                updateCartButtonVisibility();
                setTimeout(() => menu_link.click(), 500);
            }
            catch (error) {
                console.log(error);
                auth_error.textContent = "Incorrect login or password";
                auth_error.style.color = "red";
            }
            finally {
                sign_in.textContent = "Sign In";
            }
        });
    }
    else if (target.classList.contains("registration")) {
        const cities = ["New York", "Los Angeles", "Chicago"];
        const streets = {
            "New York": [
                "Broadway",
                "Fifth Avenue",
                "Wall Street",
                "Park Avenue",
                "Madison Avenue",
                "Times Square",
                "Lexington Avenue",
                "Seventh Avenue",
                "Columbus Avenue",
                "Amsterdam Avenue",
            ],
            "Los Angeles": [
                "Hollywood Boulevard",
                "Sunset Boulevard",
                "Wilshire Boulevard",
                "Rodeo Drive",
                "Melrose Avenue",
                "Venice Boulevard",
                "Santa Monica Boulevard",
                "Beverly Drive",
                "La Brea Avenue",
                "Vine Street",
            ],
            Chicago: [
                "Michigan Avenue",
                "State Street",
                "Wabash Avenue",
                "Lake Shore Drive",
                "Clark Street",
                "Dearborn Street",
                "LaSalle Street",
                "Randolph Street",
                "Washington Street",
                "Madison Street",
            ],
        };
        main.classList.remove(...Object.values(PageView));
        main.classList.add(PageView.REGISTER);
        cart_button.style.borderBottom = "";
        cart_button.classList.remove("disable_cursor");
        updateCartButtonVisibility();
        main.innerHTML = `
	<h1>Registration</h1>
	<label class="label_login">
		Login
		<input class="input_login" type="text" placeholder="Enter login">
		<i class="fa-solid fa-circle-exclamation error_icon"></i>
		<p class="login_error"></p>
	</label>
	<label class="label_password">
		Password
		<input class="input_password" type="password" placeholder="Enter password">
		<i class="fa-solid fa-circle-exclamation error_icon"></i>
		<p class="password_error"></p>
	</label>
	<label class="label_confirm_password">
		Confirm Password
		<input class="input_confirm_password" type="password" placeholder="Confirm password">
		<i class="fa-solid fa-circle-exclamation error_icon"></i>
		<p class="confirm_password_error"></p>
	</label>
	<label class="label_city">
		City
		<select class="input_city">
			<option value="" disabled selected>Select a city</option>
			${cities.map((city) => `<option value="${city}">${city}</option>`).join("")}
		</select>
		<i class="fa-solid fa-circle-exclamation error_icon"></i>
		<p class="city_error"></p>
	</label>
	<label class="label_street">
		Street
		<select class="input_street">
			<option value="" disabled selected>Select a street</option>
		</select>
		<i class="fa-solid fa-circle-exclamation error_icon"></i>
		<p class="street_error"></p>
	</label>
	<label class="label_house_number">
		House Number
		<input class="input_house_number" type="text" placeholder="Enter house number" inputmode="numeric">
		<i class="fa-solid fa-circle-exclamation error_icon"></i>
		<p class="house_number_error"></p>
	</label>
	<div class="pay_by">
		<p>Pay by</p>
		<div class="payment_options">
			<label class="radio-option">
				<input type="radio" name="payment" value="cash" checked>
				Cash
			</label>
			<label class="radio-option">
				<input type="radio" name="payment" value="card">
				Card
			</label>
		</div>
	</div>
	<p class="register_error"></p>
	<div class="registration_button disabled" style="cursor: not-allowed;">Register</div>
`;
        // DOM elements
        const input_login = main.querySelector(".input_login");
        const input_password = main.querySelector(".input_password");
        const input_confirm_password = main.querySelector(".input_confirm_password");
        const select_city = main.querySelector(".input_city");
        const select_street = main.querySelector(".input_street");
        const input_house_number = main.querySelector(".input_house_number");
        const input_cash = main.querySelector('input[name="payment"][value="cash"]');
        const login_error = main.querySelector(".login_error");
        const password_error = main.querySelector(".password_error");
        const confirm_password_error = main.querySelector(".confirm_password_error");
        const city_error = main.querySelector(".city_error");
        const street_error = main.querySelector(".street_error");
        const house_number_error = main.querySelector(".house_number_error");
        const register_error = main.querySelector(".register_error");
        const register = main.querySelector(".registration_button");
        const login_icon = main.querySelector(".label_login .error_icon");
        const password_icon = main.querySelector(".label_password .error_icon");
        const confirm_password_icon = main.querySelector(".label_confirm_password .error_icon");
        const city_icon = main.querySelector(".label_city .error_icon");
        const street_icon = main.querySelector(".label_street .error_icon");
        const house_number_icon = main.querySelector(".label_house_number .error_icon");
        // Validation state
        let isLoginValid = false;
        let isPasswordValid = false;
        let isConfirmPasswordValid = false;
        let isCityValid = false;
        let isStreetValid = false;
        let isHouseNumberValid = false;
        // Validation Functions
        const validateLogin = (value) => {
            const startsWithLetter = /^[a-zA-Z]/.test(value);
            const onlyLetters = /^[a-zA-Z]+$/.test(value);
            return value.length >= 3 && startsWithLetter && onlyLetters;
        };
        const validatePassword = (value) => {
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
            return value.length >= 6 && hasSpecialChar;
        };
        const validateConfirmPassword = (password, confirm) => {
            return password === confirm && validatePassword(confirm);
        };
        const validateCity = (value) => {
            return cities.includes(value);
        };
        const validateStreet = (value, city) => {
            return city in streets ? streets[city].includes(value) : false;
        };
        const validateHouseNumber = (value) => {
            const trimmedValue = value.trim();
            if (!trimmedValue)
                return false;
            if (!/^\d+$/.test(trimmedValue))
                return false; // Must be digits only
            const num = parseInt(trimmedValue, 10);
            return !isNaN(num) && num > 1;
        };
        // Update Button State
        const updateButtonState = () => {
            const isValid = isLoginValid &&
                isPasswordValid &&
                isConfirmPasswordValid &&
                isCityValid &&
                isStreetValid &&
                isHouseNumberValid;
            register.classList.toggle("disabled", !isValid);
            register.style.cursor = isValid ? "pointer" : "not-allowed";
        };
        // Handle Input Styling and Error Messages
        const setInputError = (input, error, icon, message) => {
            input.style.border = "1px solid red";
            icon.style.display = "inline-block";
            error.textContent = message;
            input.setAttribute("aria-invalid", "true");
            input.setAttribute("aria-describedby", error.className);
            icon.setAttribute("aria-hidden", "true");
        };
        const clearInputError = (input, error, icon) => {
            input.style.border = "";
            icon.style.display = "none";
            error.textContent = "";
            input.removeAttribute("aria-invalid");
            input.removeAttribute("aria-describedby");
        };
        // Input Event Listeners
        input_login.addEventListener("blur", () => {
            const value = input_login.value.trim();
            if (!value) {
                setInputError(input_login, login_error, login_icon, "Login is required");
                isLoginValid = false;
            }
            else if (!validateLogin(value)) {
                setInputError(input_login, login_error, login_icon, "Login must be 3+ characters, start with a letter, and contain only English letters");
                isLoginValid = false;
            }
            else {
                clearInputError(input_login, login_error, login_icon);
                isLoginValid = true;
            }
            updateButtonState();
        });
        input_login.addEventListener("focus", () => {
            clearInputError(input_login, login_error, login_icon);
            register_error.textContent = "";
        });
        input_password.addEventListener("blur", () => {
            const value = input_password.value.trim();
            if (!value) {
                setInputError(input_password, password_error, password_icon, "Password is required");
                isPasswordValid = false;
            }
            else if (!validatePassword(value)) {
                setInputError(input_password, password_error, password_icon, "Password must be 6+ characters and include at least 1 special character");
                isPasswordValid = false;
            }
            else {
                clearInputError(input_password, password_error, password_icon);
                isPasswordValid = true;
            }
            // Re-validate confirm password if it exists
            if (input_confirm_password.value) {
                input_confirm_password.dispatchEvent(new Event("blur"));
            }
            updateButtonState();
        });
        input_password.addEventListener("focus", () => {
            clearInputError(input_password, password_error, password_icon);
            register_error.textContent = "";
        });
        input_confirm_password.addEventListener("blur", () => {
            const value = input_confirm_password.value.trim();
            const password = input_password.value.trim();
            if (!value) {
                setInputError(input_confirm_password, confirm_password_error, confirm_password_icon, "Confirm Password is required");
                isConfirmPasswordValid = false;
            }
            else if (!validateConfirmPassword(password, value)) {
                setInputError(input_confirm_password, confirm_password_error, confirm_password_icon, "Passwords must match and meet requirements");
                isConfirmPasswordValid = false;
            }
            else {
                clearInputError(input_confirm_password, confirm_password_error, confirm_password_icon);
                isConfirmPasswordValid = true;
            }
            updateButtonState();
        });
        input_confirm_password.addEventListener("focus", () => {
            clearInputError(input_confirm_password, confirm_password_error, confirm_password_icon);
            register_error.textContent = "";
        });
        const validateCityOnInteraction = () => {
            const value = select_city.value;
            if (!validateCity(value)) {
                setInputError(select_city, city_error, city_icon, "City is required");
                isCityValid = false;
            }
            else {
                clearInputError(select_city, city_error, city_icon);
                isCityValid = true;
            }
            updateButtonState();
        };
        select_city.addEventListener("change", () => {
            validateCityOnInteraction();
            select_street.innerHTML = `
		<option value="" disabled selected>Select a street</option>
		${select_city.value in streets
                ? streets[select_city.value]
                    .map((street) => `<option value="${street}">${street}</option>`)
                    .join("")
                : ""}
	`;
            isStreetValid = false;
            select_street.dispatchEvent(new Event("change"));
        });
        select_city.addEventListener("blur", validateCityOnInteraction);
        select_city.addEventListener("focus", () => {
            clearInputError(select_city, city_error, city_icon);
            register_error.textContent = "";
        });
        const validateStreetOnInteraction = () => {
            const value = select_street.value;
            const city = select_city.value;
            if (!validateStreet(value, city)) {
                setInputError(select_street, street_error, street_icon, "Street is required");
                isStreetValid = false;
            }
            else {
                clearInputError(select_street, street_error, street_icon);
                isStreetValid = true;
            }
            updateButtonState();
        };
        select_street.addEventListener("change", validateStreetOnInteraction);
        select_street.addEventListener("blur", validateStreetOnInteraction);
        select_street.addEventListener("focus", () => {
            clearInputError(select_street, street_error, street_icon);
            register_error.textContent = "";
        });
        input_house_number.addEventListener("blur", () => {
            const value = input_house_number.value.trim();
            if (!value) {
                setInputError(input_house_number, house_number_error, house_number_icon, "House number is required");
                isHouseNumberValid = false;
            }
            else if (!validateHouseNumber(value)) {
                setInputError(input_house_number, house_number_error, house_number_icon, "House number must be a whole number greater than 1");
                isHouseNumberValid = false;
            }
            else {
                clearInputError(input_house_number, house_number_error, house_number_icon);
                isHouseNumberValid = true;
            }
            updateButtonState();
        });
        input_house_number.addEventListener("focus", () => {
            clearInputError(input_house_number, house_number_error, house_number_icon);
            register_error.textContent = "";
        });
        // Register Button Click Handler
        register.addEventListener("click", async () => {
            if (!isLoginValid ||
                !isPasswordValid ||
                !isConfirmPasswordValid ||
                !isCityValid ||
                !isStreetValid ||
                !isHouseNumberValid) {
                return;
            }
            register_error.textContent = "";
            register.textContent = "Registering...";
            try {
                const paymentMethod = input_cash.checked ? "cash" : "card";
                const houseNumberValue = parseInt(input_house_number.value.trim(), 10);
                const response = await fetch("https://6kt29kkeub.execute-api.eu-central-1.amazonaws.com/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        login: input_login.value.trim(),
                        password: input_password.value.trim(),
                        confirmPassword: input_confirm_password.value.trim(),
                        city: select_city.value,
                        street: select_street.value,
                        houseNumber: houseNumberValue,
                        paymentMethod,
                    }),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Registration failed");
                }
                register_error.textContent = "Registration was succesful!";
                register_error.style.color = "green";
                setTimeout(() => menu_link.click(), 500);
            }
            catch (error) {
                let errorMessage = "Registration failed";
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
                else if (typeof error === "object" &&
                    error !== null &&
                    "message" in error) {
                    errorMessage = error.message;
                }
                register_error.textContent = errorMessage;
                register_error.style.color = "red";
            }
            finally {
                register.textContent = "Register";
            }
        });
    }
    else if (target.classList.contains("confirm_order")) {
        const order_confirm_response = document.querySelector(".confirm_order_response");
        const cart_total_products = {
            items: [],
            totalPrice: 0,
        };
        current_products.forEach((product) => {
            cart_total_products.items.push({
                productId: parseInt(product.id),
                size: product.size,
                additives: product.addsTypes,
                quantity: 1,
            });
        });
        cart_total_products.totalPrice = cartTotalPrice;
        const postOrder = async () => {
            try {
                const response = await fetch("https://6kt29kkeub.execute-api.eu-central-1.amazonaws.com/orders/confirm", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(cart_total_products),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Order failed");
                }
                order_confirm_response.textContent =
                    "Thank you for your order! Our manager will contact you shortly.";
                order_confirm_response.style.color = "#403f3d";
            }
            catch (error) {
                let errorMessage = "Order failed";
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
                else if (typeof error === "object" &&
                    error !== null &&
                    "message" in error) {
                    errorMessage = error.message;
                }
                alert("Something went wrong. Please, try again");
                order_confirm_response.textContent = errorMessage;
                order_confirm_response.style.color = "red";
            }
        };
        postOrder();
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const storedCurrentProducts = localStorage.getItem("current_products");
    if (storedCurrentProducts) {
        current_products.splice(0, current_products.length, ...JSON.parse(storedCurrentProducts));
    }
    // updateCartButtonVisibility();
    getFavorites(); //initial
});
export {};
//# sourceMappingURL=script.js.map
