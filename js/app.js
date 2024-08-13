(() => {
    "use strict";
    const modules_flsModules = {};
    function isWebp() {
        function testWebP(callback) {
            let webP = new Image;
            webP.onload = webP.onerror = function() {
                callback(webP.height == 2);
            };
            webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
        }
        testWebP((function(support) {
            let className = support === true ? "webp" : "no-webp";
            document.documentElement.classList.add(className);
        }));
    }
    function getHash() {
        if (location.hash) return location.hash.replace("#", "");
    }
    let bodyLockStatus = true;
    let bodyUnlock = (delay = 500) => {
        let body = document.querySelector("body");
        if (bodyLockStatus) {
            let lock_padding = document.querySelectorAll("[data-lp]");
            setTimeout((() => {
                for (let index = 0; index < lock_padding.length; index++) {
                    const el = lock_padding[index];
                    el.style.paddingRight = "0px";
                }
                body.style.paddingRight = "0px";
                document.documentElement.classList.remove("lock");
            }), delay);
            bodyLockStatus = false;
            setTimeout((function() {
                bodyLockStatus = true;
            }), delay);
        }
    };
    let bodyLock = (delay = 500) => {
        let body = document.querySelector("body");
        if (bodyLockStatus) {
            let lock_padding = document.querySelectorAll("[data-lp]");
            for (let index = 0; index < lock_padding.length; index++) {
                const el = lock_padding[index];
                el.style.paddingRight = window.innerWidth - document.querySelector(".wrapper").offsetWidth + "px";
            }
            body.style.paddingRight = window.innerWidth - document.querySelector(".wrapper").offsetWidth + "px";
            document.documentElement.classList.add("lock");
            bodyLockStatus = false;
            setTimeout((function() {
                bodyLockStatus = true;
            }), delay);
        }
    };
    function menuClose() {
        bodyUnlock();
        document.documentElement.classList.remove("menu-open");
    }
    function functions_FLS(message) {
        setTimeout((() => {
            if (window.FLS) console.log(message);
        }), 0);
    }
    function uniqArray(array) {
        return array.filter((function(item, index, self) {
            return self.indexOf(item) === index;
        }));
    }
    class Popup {
        constructor(options) {
            let config = {
                logging: true,
                init: true,
                attributeOpenButton: "data-popup",
                attributeCloseButton: "data-close",
                fixElementSelector: "[data-lp]",
                youtubeAttribute: "data-popup-youtube",
                youtubePlaceAttribute: "data-popup-youtube-place",
                setAutoplayYoutube: true,
                classes: {
                    popup: "popup",
                    popupContent: "popup__content",
                    popupActive: "popup_show",
                    bodyActive: "popup-show"
                },
                focusCatch: true,
                closeEsc: true,
                bodyLock: true,
                hashSettings: {
                    location: true,
                    goHash: true
                },
                on: {
                    beforeOpen: function() {},
                    afterOpen: function() {},
                    beforeClose: function() {},
                    afterClose: function() {}
                }
            };
            this.youTubeCode;
            this.isOpen = false;
            this.targetOpen = {
                selector: false,
                element: false
            };
            this.previousOpen = {
                selector: false,
                element: false
            };
            this.lastClosed = {
                selector: false,
                element: false
            };
            this._dataValue = false;
            this.hash = false;
            this._reopen = false;
            this._selectorOpen = false;
            this.lastFocusEl = false;
            this._focusEl = [ "a[href]", 'input:not([disabled]):not([type="hidden"]):not([aria-hidden])', "button:not([disabled]):not([aria-hidden])", "select:not([disabled]):not([aria-hidden])", "textarea:not([disabled]):not([aria-hidden])", "area[href]", "iframe", "object", "embed", "[contenteditable]", '[tabindex]:not([tabindex^="-"])' ];
            this.options = {
                ...config,
                ...options,
                classes: {
                    ...config.classes,
                    ...options?.classes
                },
                hashSettings: {
                    ...config.hashSettings,
                    ...options?.hashSettings
                },
                on: {
                    ...config.on,
                    ...options?.on
                }
            };
            this.bodyLock = false;
            this.options.init ? this.initPopups() : null;
        }
        initPopups() {
            this.popupLogging(`Проснулся`);
            this.eventsPopup();
        }
        eventsPopup() {
            document.addEventListener("click", function(e) {
                const buttonOpen = e.target.closest(`[${this.options.attributeOpenButton}]`);
                if (buttonOpen) {
                    e.preventDefault();
                    this._dataValue = buttonOpen.getAttribute(this.options.attributeOpenButton) ? buttonOpen.getAttribute(this.options.attributeOpenButton) : "error";
                    this.youTubeCode = buttonOpen.getAttribute(this.options.youtubeAttribute) ? buttonOpen.getAttribute(this.options.youtubeAttribute) : null;
                    if (this._dataValue !== "error") {
                        if (!this.isOpen) this.lastFocusEl = buttonOpen;
                        this.targetOpen.selector = `${this._dataValue}`;
                        this._selectorOpen = true;
                        this.open();
                        return;
                    } else this.popupLogging(`Ой ой, не заполнен атрибут у ${buttonOpen.classList}`);
                    return;
                }
                const buttonClose = e.target.closest(`[${this.options.attributeCloseButton}]`);
                if (buttonClose || !e.target.closest(`.${this.options.classes.popupContent}`) && this.isOpen) {
                    e.preventDefault();
                    this.close();
                    return;
                }
            }.bind(this));
            document.addEventListener("keydown", function(e) {
                if (this.options.closeEsc && e.which == 27 && e.code === "Escape" && this.isOpen) {
                    e.preventDefault();
                    this.close();
                    return;
                }
                if (this.options.focusCatch && e.which == 9 && this.isOpen) {
                    this._focusCatch(e);
                    return;
                }
            }.bind(this));
            if (this.options.hashSettings.goHash) {
                window.addEventListener("hashchange", function() {
                    if (window.location.hash) this._openToHash(); else this.close(this.targetOpen.selector);
                }.bind(this));
                window.addEventListener("load", function() {
                    if (window.location.hash) this._openToHash();
                }.bind(this));
            }
        }
        open(selectorValue) {
            if (bodyLockStatus) {
                this.bodyLock = document.documentElement.classList.contains("lock") && !this.isOpen ? true : false;
                if (selectorValue && typeof selectorValue === "string" && selectorValue.trim() !== "") {
                    this.targetOpen.selector = selectorValue;
                    this._selectorOpen = true;
                }
                if (this.isOpen) {
                    this._reopen = true;
                    this.close();
                }
                if (!this._selectorOpen) this.targetOpen.selector = this.lastClosed.selector;
                if (!this._reopen) this.previousActiveElement = document.activeElement;
                this.targetOpen.element = document.querySelector(this.targetOpen.selector);
                if (this.targetOpen.element) {
                    if (this.youTubeCode) {
                        const codeVideo = this.youTubeCode;
                        const urlVideo = `https://www.youtube.com/embed/${codeVideo}?rel=0&showinfo=0&autoplay=1`;
                        const iframe = document.createElement("iframe");
                        iframe.setAttribute("allowfullscreen", "");
                        const autoplay = this.options.setAutoplayYoutube ? "autoplay;" : "";
                        iframe.setAttribute("allow", `${autoplay}; encrypted-media`);
                        iframe.setAttribute("src", urlVideo);
                        if (!this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) {
                            this.targetOpen.element.querySelector(".popup__text").setAttribute(`${this.options.youtubePlaceAttribute}`, "");
                        }
                        this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).appendChild(iframe);
                    }
                    if (this.options.hashSettings.location) {
                        this._getHash();
                        this._setHash();
                    }
                    this.options.on.beforeOpen(this);
                    document.dispatchEvent(new CustomEvent("beforePopupOpen", {
                        detail: {
                            popup: this
                        }
                    }));
                    this.targetOpen.element.classList.add(this.options.classes.popupActive);
                    document.documentElement.classList.add(this.options.classes.bodyActive);
                    if (!this._reopen) !this.bodyLock ? bodyLock() : null; else this._reopen = false;
                    this.targetOpen.element.setAttribute("aria-hidden", "false");
                    this.previousOpen.selector = this.targetOpen.selector;
                    this.previousOpen.element = this.targetOpen.element;
                    this._selectorOpen = false;
                    this.isOpen = true;
                    setTimeout((() => {
                        this._focusTrap();
                    }), 50);
                    this.options.on.afterOpen(this);
                    document.dispatchEvent(new CustomEvent("afterPopupOpen", {
                        detail: {
                            popup: this
                        }
                    }));
                    this.popupLogging(`Открыл попап`);
                } else this.popupLogging(`Ой ой, такого попапа нет.Проверьте корректность ввода. `);
            }
        }
        close(selectorValue) {
            if (selectorValue && typeof selectorValue === "string" && selectorValue.trim() !== "") this.previousOpen.selector = selectorValue;
            if (!this.isOpen || !bodyLockStatus) return;
            this.options.on.beforeClose(this);
            document.dispatchEvent(new CustomEvent("beforePopupClose", {
                detail: {
                    popup: this
                }
            }));
            if (this.youTubeCode) if (this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).innerHTML = "";
            this.previousOpen.element.classList.remove(this.options.classes.popupActive);
            this.previousOpen.element.setAttribute("aria-hidden", "true");
            if (!this._reopen) {
                document.documentElement.classList.remove(this.options.classes.bodyActive);
                !this.bodyLock ? bodyUnlock() : null;
                this.isOpen = false;
            }
            this._removeHash();
            if (this._selectorOpen) {
                this.lastClosed.selector = this.previousOpen.selector;
                this.lastClosed.element = this.previousOpen.element;
            }
            this.options.on.afterClose(this);
            document.dispatchEvent(new CustomEvent("afterPopupClose", {
                detail: {
                    popup: this
                }
            }));
            setTimeout((() => {
                this._focusTrap();
            }), 50);
            this.popupLogging(`Закрыл попап`);
        }
        _getHash() {
            if (this.options.hashSettings.location) this.hash = this.targetOpen.selector.includes("#") ? this.targetOpen.selector : this.targetOpen.selector.replace(".", "#");
        }
        _openToHash() {
            let classInHash = document.querySelector(`.${window.location.hash.replace("#", "")}`) ? `.${window.location.hash.replace("#", "")}` : document.querySelector(`${window.location.hash}`) ? `${window.location.hash}` : null;
            const buttons = document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash}"]`) ? document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash}"]`) : document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash.replace(".", "#")}"]`);
            if (buttons && classInHash) this.open(classInHash);
        }
        _setHash() {
            history.pushState("", "", this.hash);
        }
        _removeHash() {
            history.pushState("", "", window.location.href.split("#")[0]);
        }
        _focusCatch(e) {
            const focusable = this.targetOpen.element.querySelectorAll(this._focusEl);
            const focusArray = Array.prototype.slice.call(focusable);
            const focusedIndex = focusArray.indexOf(document.activeElement);
            if (e.shiftKey && focusedIndex === 0) {
                focusArray[focusArray.length - 1].focus();
                e.preventDefault();
            }
            if (!e.shiftKey && focusedIndex === focusArray.length - 1) {
                focusArray[0].focus();
                e.preventDefault();
            }
        }
        _focusTrap() {
            const focusable = this.previousOpen.element.querySelectorAll(this._focusEl);
            if (!this.isOpen && this.lastFocusEl) this.lastFocusEl.focus(); else focusable[0].focus();
        }
        popupLogging(message) {
            this.options.logging ? functions_FLS(`[Попапос]: ${message}`) : null;
        }
    }
    modules_flsModules.popup = new Popup({});
    let gotoblock_gotoBlock = (targetBlock, noHeader = false, speed = 500, offsetTop = 0) => {
        const targetBlockElement = document.querySelector(targetBlock);
        if (targetBlockElement) {
            let headerItem = "";
            let headerItemHeight = 0;
            if (noHeader) {
                headerItem = "header.header";
                headerItemHeight = document.querySelector(headerItem).offsetHeight;
            }
            let options = {
                speedAsDuration: true,
                speed,
                header: headerItem,
                offset: offsetTop,
                easing: "easeOutQuad"
            };
            document.documentElement.classList.contains("menu-open") ? menuClose() : null;
            if (typeof SmoothScroll !== "undefined") (new SmoothScroll).animateScroll(targetBlockElement, "", options); else {
                let targetBlockElementPosition = targetBlockElement.getBoundingClientRect().top + scrollY;
                targetBlockElementPosition = headerItemHeight ? targetBlockElementPosition - headerItemHeight : targetBlockElementPosition;
                targetBlockElementPosition = offsetTop ? targetBlockElementPosition - offsetTop : targetBlockElementPosition;
                window.scrollTo({
                    top: targetBlockElementPosition,
                    behavior: "smooth"
                });
            }
            functions_FLS(`[gotoBlock]: Юхуу...едем к ${targetBlock}`);
        } else functions_FLS(`[gotoBlock]: Ой ой..Такого блока нет на странице: ${targetBlock}`);
    };
    function formFieldsInit(options = {
        viewPass: false
    }) {
        const formFields = document.querySelectorAll("input[placeholder],textarea[placeholder]");
        if (formFields.length) formFields.forEach((formField => {
            if (!formField.hasAttribute("data-placeholder-nohide")) formField.dataset.placeholder = formField.placeholder;
        }));
        document.body.addEventListener("focusin", (function(e) {
            const targetElement = e.target;
            if (targetElement.tagName === "INPUT" || targetElement.tagName === "TEXTAREA") {
                if (targetElement.dataset.placeholder) targetElement.placeholder = "";
                if (!targetElement.hasAttribute("data-no-focus-classes")) {
                    targetElement.classList.add("_form-focus");
                    targetElement.parentElement.classList.add("_form-focus");
                }
                formValidate.removeError(targetElement);
            }
        }));
        document.body.addEventListener("focusout", (function(e) {
            const targetElement = e.target;
            if (targetElement.tagName === "INPUT" || targetElement.tagName === "TEXTAREA") {
                if (targetElement.dataset.placeholder) targetElement.placeholder = targetElement.dataset.placeholder;
                if (!targetElement.hasAttribute("data-no-focus-classes")) {
                    targetElement.classList.remove("_form-focus");
                    targetElement.parentElement.classList.remove("_form-focus");
                }
                if (targetElement.hasAttribute("data-validate")) formValidate.validateInput(targetElement);
            }
        }));
        if (options.viewPass) document.addEventListener("click", (function(e) {
            let targetElement = e.target;
            if (targetElement.closest('[class*="__viewpass"]')) {
                let inputType = targetElement.classList.contains("_viewpass-active") ? "password" : "text";
                targetElement.parentElement.querySelector("input").setAttribute("type", inputType);
                targetElement.classList.toggle("_viewpass-active");
            }
        }));
    }
    let formValidate = {
        getErrors(form) {
            let error = 0;
            let formRequiredItems = form.querySelectorAll("*[data-required]");
            if (formRequiredItems.length) formRequiredItems.forEach((formRequiredItem => {
                if ((formRequiredItem.offsetParent !== null || formRequiredItem.tagName === "SELECT") && !formRequiredItem.disabled) error += this.validateInput(formRequiredItem);
            }));
            return error;
        },
        validateInput(formRequiredItem) {
            let error = 0;
            if (formRequiredItem.dataset.required === "email") {
                formRequiredItem.value = formRequiredItem.value.replace(" ", "");
                if (this.emailTest(formRequiredItem)) {
                    this.addError(formRequiredItem);
                    error++;
                } else this.removeError(formRequiredItem);
            } else if (formRequiredItem.type === "checkbox" && !formRequiredItem.checked) {
                this.addError(formRequiredItem);
                error++;
            } else if (!formRequiredItem.value.trim()) {
                this.addError(formRequiredItem);
                error++;
            } else this.removeError(formRequiredItem);
            return error;
        },
        addError(formRequiredItem) {
            formRequiredItem.classList.add("_form-error");
            formRequiredItem.parentElement.classList.add("_form-error");
            let inputError = formRequiredItem.parentElement.querySelector(".form__error");
            if (inputError) formRequiredItem.parentElement.removeChild(inputError);
            if (formRequiredItem.dataset.error) formRequiredItem.parentElement.insertAdjacentHTML("beforeend", `<div class="form__error">${formRequiredItem.dataset.error}</div>`);
        },
        removeError(formRequiredItem) {
            formRequiredItem.classList.remove("_form-error");
            formRequiredItem.parentElement.classList.remove("_form-error");
            if (formRequiredItem.parentElement.querySelector(".form__error")) formRequiredItem.parentElement.removeChild(formRequiredItem.parentElement.querySelector(".form__error"));
        },
        formClean(form) {
            form.reset();
            setTimeout((() => {
                let inputs = form.querySelectorAll("input,textarea");
                for (let index = 0; index < inputs.length; index++) {
                    const el = inputs[index];
                    el.parentElement.classList.remove("_form-focus");
                    el.classList.remove("_form-focus");
                    formValidate.removeError(el);
                }
                let checkboxes = form.querySelectorAll(".checkbox__input");
                if (checkboxes.length > 0) for (let index = 0; index < checkboxes.length; index++) {
                    const checkbox = checkboxes[index];
                    checkbox.checked = false;
                }
                if (modules_flsModules.select) {
                    let selects = form.querySelectorAll(".select");
                    if (selects.length) for (let index = 0; index < selects.length; index++) {
                        const select = selects[index].querySelector("select");
                        modules_flsModules.select.selectBuild(select);
                    }
                }
            }), 0);
        },
        emailTest(formRequiredItem) {
            return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(formRequiredItem.value);
        }
    };
    function ssr_window_esm_isObject(obj) {
        return obj !== null && typeof obj === "object" && "constructor" in obj && obj.constructor === Object;
    }
    function extend(target, src) {
        if (target === void 0) target = {};
        if (src === void 0) src = {};
        Object.keys(src).forEach((key => {
            if (typeof target[key] === "undefined") target[key] = src[key]; else if (ssr_window_esm_isObject(src[key]) && ssr_window_esm_isObject(target[key]) && Object.keys(src[key]).length > 0) extend(target[key], src[key]);
        }));
    }
    const ssrDocument = {
        body: {},
        addEventListener() {},
        removeEventListener() {},
        activeElement: {
            blur() {},
            nodeName: ""
        },
        querySelector() {
            return null;
        },
        querySelectorAll() {
            return [];
        },
        getElementById() {
            return null;
        },
        createEvent() {
            return {
                initEvent() {}
            };
        },
        createElement() {
            return {
                children: [],
                childNodes: [],
                style: {},
                setAttribute() {},
                getElementsByTagName() {
                    return [];
                }
            };
        },
        createElementNS() {
            return {};
        },
        importNode() {
            return null;
        },
        location: {
            hash: "",
            host: "",
            hostname: "",
            href: "",
            origin: "",
            pathname: "",
            protocol: "",
            search: ""
        }
    };
    function ssr_window_esm_getDocument() {
        const doc = typeof document !== "undefined" ? document : {};
        extend(doc, ssrDocument);
        return doc;
    }
    const ssrWindow = {
        document: ssrDocument,
        navigator: {
            userAgent: ""
        },
        location: {
            hash: "",
            host: "",
            hostname: "",
            href: "",
            origin: "",
            pathname: "",
            protocol: "",
            search: ""
        },
        history: {
            replaceState() {},
            pushState() {},
            go() {},
            back() {}
        },
        CustomEvent: function CustomEvent() {
            return this;
        },
        addEventListener() {},
        removeEventListener() {},
        getComputedStyle() {
            return {
                getPropertyValue() {
                    return "";
                }
            };
        },
        Image() {},
        Date() {},
        screen: {},
        setTimeout() {},
        clearTimeout() {},
        matchMedia() {
            return {};
        },
        requestAnimationFrame(callback) {
            if (typeof setTimeout === "undefined") {
                callback();
                return null;
            }
            return setTimeout(callback, 0);
        },
        cancelAnimationFrame(id) {
            if (typeof setTimeout === "undefined") return;
            clearTimeout(id);
        }
    };
    function ssr_window_esm_getWindow() {
        const win = typeof window !== "undefined" ? window : {};
        extend(win, ssrWindow);
        return win;
    }
    function utils_classesToTokens(classes) {
        if (classes === void 0) classes = "";
        return classes.trim().split(" ").filter((c => !!c.trim()));
    }
    function deleteProps(obj) {
        const object = obj;
        Object.keys(object).forEach((key => {
            try {
                object[key] = null;
            } catch (e) {}
            try {
                delete object[key];
            } catch (e) {}
        }));
    }
    function utils_nextTick(callback, delay) {
        if (delay === void 0) delay = 0;
        return setTimeout(callback, delay);
    }
    function now() {
        return Date.now();
    }
    function utils_getComputedStyle(el) {
        const window = ssr_window_esm_getWindow();
        let style;
        if (window.getComputedStyle) style = window.getComputedStyle(el, null);
        if (!style && el.currentStyle) style = el.currentStyle;
        if (!style) style = el.style;
        return style;
    }
    function utils_getTranslate(el, axis) {
        if (axis === void 0) axis = "x";
        const window = ssr_window_esm_getWindow();
        let matrix;
        let curTransform;
        let transformMatrix;
        const curStyle = utils_getComputedStyle(el);
        if (window.WebKitCSSMatrix) {
            curTransform = curStyle.transform || curStyle.webkitTransform;
            if (curTransform.split(",").length > 6) curTransform = curTransform.split(", ").map((a => a.replace(",", "."))).join(", ");
            transformMatrix = new window.WebKitCSSMatrix(curTransform === "none" ? "" : curTransform);
        } else {
            transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue("transform").replace("translate(", "matrix(1, 0, 0, 1,");
            matrix = transformMatrix.toString().split(",");
        }
        if (axis === "x") if (window.WebKitCSSMatrix) curTransform = transformMatrix.m41; else if (matrix.length === 16) curTransform = parseFloat(matrix[12]); else curTransform = parseFloat(matrix[4]);
        if (axis === "y") if (window.WebKitCSSMatrix) curTransform = transformMatrix.m42; else if (matrix.length === 16) curTransform = parseFloat(matrix[13]); else curTransform = parseFloat(matrix[5]);
        return curTransform || 0;
    }
    function utils_isObject(o) {
        return typeof o === "object" && o !== null && o.constructor && Object.prototype.toString.call(o).slice(8, -1) === "Object";
    }
    function isNode(node) {
        if (typeof window !== "undefined" && typeof window.HTMLElement !== "undefined") return node instanceof HTMLElement;
        return node && (node.nodeType === 1 || node.nodeType === 11);
    }
    function utils_extend() {
        const to = Object(arguments.length <= 0 ? void 0 : arguments[0]);
        const noExtend = [ "__proto__", "constructor", "prototype" ];
        for (let i = 1; i < arguments.length; i += 1) {
            const nextSource = i < 0 || arguments.length <= i ? void 0 : arguments[i];
            if (nextSource !== void 0 && nextSource !== null && !isNode(nextSource)) {
                const keysArray = Object.keys(Object(nextSource)).filter((key => noExtend.indexOf(key) < 0));
                for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
                    const nextKey = keysArray[nextIndex];
                    const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== void 0 && desc.enumerable) if (utils_isObject(to[nextKey]) && utils_isObject(nextSource[nextKey])) if (nextSource[nextKey].__swiper__) to[nextKey] = nextSource[nextKey]; else utils_extend(to[nextKey], nextSource[nextKey]); else if (!utils_isObject(to[nextKey]) && utils_isObject(nextSource[nextKey])) {
                        to[nextKey] = {};
                        if (nextSource[nextKey].__swiper__) to[nextKey] = nextSource[nextKey]; else utils_extend(to[nextKey], nextSource[nextKey]);
                    } else to[nextKey] = nextSource[nextKey];
                }
            }
        }
        return to;
    }
    function utils_setCSSProperty(el, varName, varValue) {
        el.style.setProperty(varName, varValue);
    }
    function animateCSSModeScroll(_ref) {
        let {swiper, targetPosition, side} = _ref;
        const window = ssr_window_esm_getWindow();
        const startPosition = -swiper.translate;
        let startTime = null;
        let time;
        const duration = swiper.params.speed;
        swiper.wrapperEl.style.scrollSnapType = "none";
        window.cancelAnimationFrame(swiper.cssModeFrameID);
        const dir = targetPosition > startPosition ? "next" : "prev";
        const isOutOfBound = (current, target) => dir === "next" && current >= target || dir === "prev" && current <= target;
        const animate = () => {
            time = (new Date).getTime();
            if (startTime === null) startTime = time;
            const progress = Math.max(Math.min((time - startTime) / duration, 1), 0);
            const easeProgress = .5 - Math.cos(progress * Math.PI) / 2;
            let currentPosition = startPosition + easeProgress * (targetPosition - startPosition);
            if (isOutOfBound(currentPosition, targetPosition)) currentPosition = targetPosition;
            swiper.wrapperEl.scrollTo({
                [side]: currentPosition
            });
            if (isOutOfBound(currentPosition, targetPosition)) {
                swiper.wrapperEl.style.overflow = "hidden";
                swiper.wrapperEl.style.scrollSnapType = "";
                setTimeout((() => {
                    swiper.wrapperEl.style.overflow = "";
                    swiper.wrapperEl.scrollTo({
                        [side]: currentPosition
                    });
                }));
                window.cancelAnimationFrame(swiper.cssModeFrameID);
                return;
            }
            swiper.cssModeFrameID = window.requestAnimationFrame(animate);
        };
        animate();
    }
    function utils_elementChildren(element, selector) {
        if (selector === void 0) selector = "";
        const children = [ ...element.children ];
        if (element instanceof HTMLSlotElement) children.push(...element.assignedElements());
        if (!selector) return children;
        return children.filter((el => el.matches(selector)));
    }
    function elementIsChildOf(el, parent) {
        const isChild = parent.contains(el);
        if (!isChild && parent instanceof HTMLSlotElement) {
            const children = [ ...element.assignedElements() ];
            return children.includes(el);
        }
        return isChild;
    }
    function showWarning(text) {
        try {
            console.warn(text);
            return;
        } catch (err) {}
    }
    function utils_createElement(tag, classes) {
        if (classes === void 0) classes = [];
        const el = document.createElement(tag);
        el.classList.add(...Array.isArray(classes) ? classes : utils_classesToTokens(classes));
        return el;
    }
    function elementPrevAll(el, selector) {
        const prevEls = [];
        while (el.previousElementSibling) {
            const prev = el.previousElementSibling;
            if (selector) {
                if (prev.matches(selector)) prevEls.push(prev);
            } else prevEls.push(prev);
            el = prev;
        }
        return prevEls;
    }
    function elementNextAll(el, selector) {
        const nextEls = [];
        while (el.nextElementSibling) {
            const next = el.nextElementSibling;
            if (selector) {
                if (next.matches(selector)) nextEls.push(next);
            } else nextEls.push(next);
            el = next;
        }
        return nextEls;
    }
    function elementStyle(el, prop) {
        const window = ssr_window_esm_getWindow();
        return window.getComputedStyle(el, null).getPropertyValue(prop);
    }
    function utils_elementIndex(el) {
        let child = el;
        let i;
        if (child) {
            i = 0;
            while ((child = child.previousSibling) !== null) if (child.nodeType === 1) i += 1;
            return i;
        }
        return;
    }
    function utils_elementParents(el, selector) {
        const parents = [];
        let parent = el.parentElement;
        while (parent) {
            if (selector) {
                if (parent.matches(selector)) parents.push(parent);
            } else parents.push(parent);
            parent = parent.parentElement;
        }
        return parents;
    }
    function utils_elementTransitionEnd(el, callback) {
        function fireCallBack(e) {
            if (e.target !== el) return;
            callback.call(el, e);
            el.removeEventListener("transitionend", fireCallBack);
        }
        if (callback) el.addEventListener("transitionend", fireCallBack);
    }
    function elementOuterSize(el, size, includeMargins) {
        const window = ssr_window_esm_getWindow();
        if (includeMargins) return el[size === "width" ? "offsetWidth" : "offsetHeight"] + parseFloat(window.getComputedStyle(el, null).getPropertyValue(size === "width" ? "margin-right" : "margin-top")) + parseFloat(window.getComputedStyle(el, null).getPropertyValue(size === "width" ? "margin-left" : "margin-bottom"));
        return el.offsetWidth;
    }
    function utils_makeElementsArray(el) {
        return (Array.isArray(el) ? el : [ el ]).filter((e => !!e));
    }
    let support;
    function calcSupport() {
        const window = ssr_window_esm_getWindow();
        const document = ssr_window_esm_getDocument();
        return {
            smoothScroll: document.documentElement && document.documentElement.style && "scrollBehavior" in document.documentElement.style,
            touch: !!("ontouchstart" in window || window.DocumentTouch && document instanceof window.DocumentTouch)
        };
    }
    function getSupport() {
        if (!support) support = calcSupport();
        return support;
    }
    let deviceCached;
    function calcDevice(_temp) {
        let {userAgent} = _temp === void 0 ? {} : _temp;
        const support = getSupport();
        const window = ssr_window_esm_getWindow();
        const platform = window.navigator.platform;
        const ua = userAgent || window.navigator.userAgent;
        const device = {
            ios: false,
            android: false
        };
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
        let ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
        const ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
        const iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
        const windows = platform === "Win32";
        let macos = platform === "MacIntel";
        const iPadScreens = [ "1024x1366", "1366x1024", "834x1194", "1194x834", "834x1112", "1112x834", "768x1024", "1024x768", "820x1180", "1180x820", "810x1080", "1080x810" ];
        if (!ipad && macos && support.touch && iPadScreens.indexOf(`${screenWidth}x${screenHeight}`) >= 0) {
            ipad = ua.match(/(Version)\/([\d.]+)/);
            if (!ipad) ipad = [ 0, 1, "13_0_0" ];
            macos = false;
        }
        if (android && !windows) {
            device.os = "android";
            device.android = true;
        }
        if (ipad || iphone || ipod) {
            device.os = "ios";
            device.ios = true;
        }
        return device;
    }
    function getDevice(overrides) {
        if (overrides === void 0) overrides = {};
        if (!deviceCached) deviceCached = calcDevice(overrides);
        return deviceCached;
    }
    let browser;
    function calcBrowser() {
        const window = ssr_window_esm_getWindow();
        const device = getDevice();
        let needPerspectiveFix = false;
        function isSafari() {
            const ua = window.navigator.userAgent.toLowerCase();
            return ua.indexOf("safari") >= 0 && ua.indexOf("chrome") < 0 && ua.indexOf("android") < 0;
        }
        if (isSafari()) {
            const ua = String(window.navigator.userAgent);
            if (ua.includes("Version/")) {
                const [major, minor] = ua.split("Version/")[1].split(" ")[0].split(".").map((num => Number(num)));
                needPerspectiveFix = major < 16 || major === 16 && minor < 2;
            }
        }
        const isWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(window.navigator.userAgent);
        const isSafariBrowser = isSafari();
        const need3dFix = isSafariBrowser || isWebView && device.ios;
        return {
            isSafari: needPerspectiveFix || isSafariBrowser,
            needPerspectiveFix,
            need3dFix,
            isWebView
        };
    }
    function getBrowser() {
        if (!browser) browser = calcBrowser();
        return browser;
    }
    function Resize(_ref) {
        let {swiper, on, emit} = _ref;
        const window = ssr_window_esm_getWindow();
        let observer = null;
        let animationFrame = null;
        const resizeHandler = () => {
            if (!swiper || swiper.destroyed || !swiper.initialized) return;
            emit("beforeResize");
            emit("resize");
        };
        const createObserver = () => {
            if (!swiper || swiper.destroyed || !swiper.initialized) return;
            observer = new ResizeObserver((entries => {
                animationFrame = window.requestAnimationFrame((() => {
                    const {width, height} = swiper;
                    let newWidth = width;
                    let newHeight = height;
                    entries.forEach((_ref2 => {
                        let {contentBoxSize, contentRect, target} = _ref2;
                        if (target && target !== swiper.el) return;
                        newWidth = contentRect ? contentRect.width : (contentBoxSize[0] || contentBoxSize).inlineSize;
                        newHeight = contentRect ? contentRect.height : (contentBoxSize[0] || contentBoxSize).blockSize;
                    }));
                    if (newWidth !== width || newHeight !== height) resizeHandler();
                }));
            }));
            observer.observe(swiper.el);
        };
        const removeObserver = () => {
            if (animationFrame) window.cancelAnimationFrame(animationFrame);
            if (observer && observer.unobserve && swiper.el) {
                observer.unobserve(swiper.el);
                observer = null;
            }
        };
        const orientationChangeHandler = () => {
            if (!swiper || swiper.destroyed || !swiper.initialized) return;
            emit("orientationchange");
        };
        on("init", (() => {
            if (swiper.params.resizeObserver && typeof window.ResizeObserver !== "undefined") {
                createObserver();
                return;
            }
            window.addEventListener("resize", resizeHandler);
            window.addEventListener("orientationchange", orientationChangeHandler);
        }));
        on("destroy", (() => {
            removeObserver();
            window.removeEventListener("resize", resizeHandler);
            window.removeEventListener("orientationchange", orientationChangeHandler);
        }));
    }
    function Observer(_ref) {
        let {swiper, extendParams, on, emit} = _ref;
        const observers = [];
        const window = ssr_window_esm_getWindow();
        const attach = function(target, options) {
            if (options === void 0) options = {};
            const ObserverFunc = window.MutationObserver || window.WebkitMutationObserver;
            const observer = new ObserverFunc((mutations => {
                if (swiper.__preventObserver__) return;
                if (mutations.length === 1) {
                    emit("observerUpdate", mutations[0]);
                    return;
                }
                const observerUpdate = function observerUpdate() {
                    emit("observerUpdate", mutations[0]);
                };
                if (window.requestAnimationFrame) window.requestAnimationFrame(observerUpdate); else window.setTimeout(observerUpdate, 0);
            }));
            observer.observe(target, {
                attributes: typeof options.attributes === "undefined" ? true : options.attributes,
                childList: swiper.isElement || (typeof options.childList === "undefined" ? true : options).childList,
                characterData: typeof options.characterData === "undefined" ? true : options.characterData
            });
            observers.push(observer);
        };
        const init = () => {
            if (!swiper.params.observer) return;
            if (swiper.params.observeParents) {
                const containerParents = utils_elementParents(swiper.hostEl);
                for (let i = 0; i < containerParents.length; i += 1) attach(containerParents[i]);
            }
            attach(swiper.hostEl, {
                childList: swiper.params.observeSlideChildren
            });
            attach(swiper.wrapperEl, {
                attributes: false
            });
        };
        const destroy = () => {
            observers.forEach((observer => {
                observer.disconnect();
            }));
            observers.splice(0, observers.length);
        };
        extendParams({
            observer: false,
            observeParents: false,
            observeSlideChildren: false
        });
        on("init", init);
        on("destroy", destroy);
    }
    var eventsEmitter = {
        on(events, handler, priority) {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (typeof handler !== "function") return self;
            const method = priority ? "unshift" : "push";
            events.split(" ").forEach((event => {
                if (!self.eventsListeners[event]) self.eventsListeners[event] = [];
                self.eventsListeners[event][method](handler);
            }));
            return self;
        },
        once(events, handler, priority) {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (typeof handler !== "function") return self;
            function onceHandler() {
                self.off(events, onceHandler);
                if (onceHandler.__emitterProxy) delete onceHandler.__emitterProxy;
                for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
                handler.apply(self, args);
            }
            onceHandler.__emitterProxy = handler;
            return self.on(events, onceHandler, priority);
        },
        onAny(handler, priority) {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (typeof handler !== "function") return self;
            const method = priority ? "unshift" : "push";
            if (self.eventsAnyListeners.indexOf(handler) < 0) self.eventsAnyListeners[method](handler);
            return self;
        },
        offAny(handler) {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (!self.eventsAnyListeners) return self;
            const index = self.eventsAnyListeners.indexOf(handler);
            if (index >= 0) self.eventsAnyListeners.splice(index, 1);
            return self;
        },
        off(events, handler) {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (!self.eventsListeners) return self;
            events.split(" ").forEach((event => {
                if (typeof handler === "undefined") self.eventsListeners[event] = []; else if (self.eventsListeners[event]) self.eventsListeners[event].forEach(((eventHandler, index) => {
                    if (eventHandler === handler || eventHandler.__emitterProxy && eventHandler.__emitterProxy === handler) self.eventsListeners[event].splice(index, 1);
                }));
            }));
            return self;
        },
        emit() {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (!self.eventsListeners) return self;
            let events;
            let data;
            let context;
            for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) args[_key2] = arguments[_key2];
            if (typeof args[0] === "string" || Array.isArray(args[0])) {
                events = args[0];
                data = args.slice(1, args.length);
                context = self;
            } else {
                events = args[0].events;
                data = args[0].data;
                context = args[0].context || self;
            }
            data.unshift(context);
            const eventsArray = Array.isArray(events) ? events : events.split(" ");
            eventsArray.forEach((event => {
                if (self.eventsAnyListeners && self.eventsAnyListeners.length) self.eventsAnyListeners.forEach((eventHandler => {
                    eventHandler.apply(context, [ event, ...data ]);
                }));
                if (self.eventsListeners && self.eventsListeners[event]) self.eventsListeners[event].forEach((eventHandler => {
                    eventHandler.apply(context, data);
                }));
            }));
            return self;
        }
    };
    function updateSize() {
        const swiper = this;
        let width;
        let height;
        const el = swiper.el;
        if (typeof swiper.params.width !== "undefined" && swiper.params.width !== null) width = swiper.params.width; else width = el.clientWidth;
        if (typeof swiper.params.height !== "undefined" && swiper.params.height !== null) height = swiper.params.height; else height = el.clientHeight;
        if (width === 0 && swiper.isHorizontal() || height === 0 && swiper.isVertical()) return;
        width = width - parseInt(elementStyle(el, "padding-left") || 0, 10) - parseInt(elementStyle(el, "padding-right") || 0, 10);
        height = height - parseInt(elementStyle(el, "padding-top") || 0, 10) - parseInt(elementStyle(el, "padding-bottom") || 0, 10);
        if (Number.isNaN(width)) width = 0;
        if (Number.isNaN(height)) height = 0;
        Object.assign(swiper, {
            width,
            height,
            size: swiper.isHorizontal() ? width : height
        });
    }
    function updateSlides() {
        const swiper = this;
        function getDirectionPropertyValue(node, label) {
            return parseFloat(node.getPropertyValue(swiper.getDirectionLabel(label)) || 0);
        }
        const params = swiper.params;
        const {wrapperEl, slidesEl, size: swiperSize, rtlTranslate: rtl, wrongRTL} = swiper;
        const isVirtual = swiper.virtual && params.virtual.enabled;
        const previousSlidesLength = isVirtual ? swiper.virtual.slides.length : swiper.slides.length;
        const slides = utils_elementChildren(slidesEl, `.${swiper.params.slideClass}, swiper-slide`);
        const slidesLength = isVirtual ? swiper.virtual.slides.length : slides.length;
        let snapGrid = [];
        const slidesGrid = [];
        const slidesSizesGrid = [];
        let offsetBefore = params.slidesOffsetBefore;
        if (typeof offsetBefore === "function") offsetBefore = params.slidesOffsetBefore.call(swiper);
        let offsetAfter = params.slidesOffsetAfter;
        if (typeof offsetAfter === "function") offsetAfter = params.slidesOffsetAfter.call(swiper);
        const previousSnapGridLength = swiper.snapGrid.length;
        const previousSlidesGridLength = swiper.slidesGrid.length;
        let spaceBetween = params.spaceBetween;
        let slidePosition = -offsetBefore;
        let prevSlideSize = 0;
        let index = 0;
        if (typeof swiperSize === "undefined") return;
        if (typeof spaceBetween === "string" && spaceBetween.indexOf("%") >= 0) spaceBetween = parseFloat(spaceBetween.replace("%", "")) / 100 * swiperSize; else if (typeof spaceBetween === "string") spaceBetween = parseFloat(spaceBetween);
        swiper.virtualSize = -spaceBetween;
        slides.forEach((slideEl => {
            if (rtl) slideEl.style.marginLeft = ""; else slideEl.style.marginRight = "";
            slideEl.style.marginBottom = "";
            slideEl.style.marginTop = "";
        }));
        if (params.centeredSlides && params.cssMode) {
            utils_setCSSProperty(wrapperEl, "--swiper-centered-offset-before", "");
            utils_setCSSProperty(wrapperEl, "--swiper-centered-offset-after", "");
        }
        const gridEnabled = params.grid && params.grid.rows > 1 && swiper.grid;
        if (gridEnabled) swiper.grid.initSlides(slides); else if (swiper.grid) swiper.grid.unsetSlides();
        let slideSize;
        const shouldResetSlideSize = params.slidesPerView === "auto" && params.breakpoints && Object.keys(params.breakpoints).filter((key => typeof params.breakpoints[key].slidesPerView !== "undefined")).length > 0;
        for (let i = 0; i < slidesLength; i += 1) {
            slideSize = 0;
            let slide;
            if (slides[i]) slide = slides[i];
            if (gridEnabled) swiper.grid.updateSlide(i, slide, slides);
            if (slides[i] && elementStyle(slide, "display") === "none") continue;
            if (params.slidesPerView === "auto") {
                if (shouldResetSlideSize) slides[i].style[swiper.getDirectionLabel("width")] = ``;
                const slideStyles = getComputedStyle(slide);
                const currentTransform = slide.style.transform;
                const currentWebKitTransform = slide.style.webkitTransform;
                if (currentTransform) slide.style.transform = "none";
                if (currentWebKitTransform) slide.style.webkitTransform = "none";
                if (params.roundLengths) slideSize = swiper.isHorizontal() ? elementOuterSize(slide, "width", true) : elementOuterSize(slide, "height", true); else {
                    const width = getDirectionPropertyValue(slideStyles, "width");
                    const paddingLeft = getDirectionPropertyValue(slideStyles, "padding-left");
                    const paddingRight = getDirectionPropertyValue(slideStyles, "padding-right");
                    const marginLeft = getDirectionPropertyValue(slideStyles, "margin-left");
                    const marginRight = getDirectionPropertyValue(slideStyles, "margin-right");
                    const boxSizing = slideStyles.getPropertyValue("box-sizing");
                    if (boxSizing && boxSizing === "border-box") slideSize = width + marginLeft + marginRight; else {
                        const {clientWidth, offsetWidth} = slide;
                        slideSize = width + paddingLeft + paddingRight + marginLeft + marginRight + (offsetWidth - clientWidth);
                    }
                }
                if (currentTransform) slide.style.transform = currentTransform;
                if (currentWebKitTransform) slide.style.webkitTransform = currentWebKitTransform;
                if (params.roundLengths) slideSize = Math.floor(slideSize);
            } else {
                slideSize = (swiperSize - (params.slidesPerView - 1) * spaceBetween) / params.slidesPerView;
                if (params.roundLengths) slideSize = Math.floor(slideSize);
                if (slides[i]) slides[i].style[swiper.getDirectionLabel("width")] = `${slideSize}px`;
            }
            if (slides[i]) slides[i].swiperSlideSize = slideSize;
            slidesSizesGrid.push(slideSize);
            if (params.centeredSlides) {
                slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
                if (prevSlideSize === 0 && i !== 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
                if (i === 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
                if (Math.abs(slidePosition) < 1 / 1e3) slidePosition = 0;
                if (params.roundLengths) slidePosition = Math.floor(slidePosition);
                if (index % params.slidesPerGroup === 0) snapGrid.push(slidePosition);
                slidesGrid.push(slidePosition);
            } else {
                if (params.roundLengths) slidePosition = Math.floor(slidePosition);
                if ((index - Math.min(swiper.params.slidesPerGroupSkip, index)) % swiper.params.slidesPerGroup === 0) snapGrid.push(slidePosition);
                slidesGrid.push(slidePosition);
                slidePosition = slidePosition + slideSize + spaceBetween;
            }
            swiper.virtualSize += slideSize + spaceBetween;
            prevSlideSize = slideSize;
            index += 1;
        }
        swiper.virtualSize = Math.max(swiper.virtualSize, swiperSize) + offsetAfter;
        if (rtl && wrongRTL && (params.effect === "slide" || params.effect === "coverflow")) wrapperEl.style.width = `${swiper.virtualSize + spaceBetween}px`;
        if (params.setWrapperSize) wrapperEl.style[swiper.getDirectionLabel("width")] = `${swiper.virtualSize + spaceBetween}px`;
        if (gridEnabled) swiper.grid.updateWrapperSize(slideSize, snapGrid);
        if (!params.centeredSlides) {
            const newSlidesGrid = [];
            for (let i = 0; i < snapGrid.length; i += 1) {
                let slidesGridItem = snapGrid[i];
                if (params.roundLengths) slidesGridItem = Math.floor(slidesGridItem);
                if (snapGrid[i] <= swiper.virtualSize - swiperSize) newSlidesGrid.push(slidesGridItem);
            }
            snapGrid = newSlidesGrid;
            if (Math.floor(swiper.virtualSize - swiperSize) - Math.floor(snapGrid[snapGrid.length - 1]) > 1) snapGrid.push(swiper.virtualSize - swiperSize);
        }
        if (isVirtual && params.loop) {
            const size = slidesSizesGrid[0] + spaceBetween;
            if (params.slidesPerGroup > 1) {
                const groups = Math.ceil((swiper.virtual.slidesBefore + swiper.virtual.slidesAfter) / params.slidesPerGroup);
                const groupSize = size * params.slidesPerGroup;
                for (let i = 0; i < groups; i += 1) snapGrid.push(snapGrid[snapGrid.length - 1] + groupSize);
            }
            for (let i = 0; i < swiper.virtual.slidesBefore + swiper.virtual.slidesAfter; i += 1) {
                if (params.slidesPerGroup === 1) snapGrid.push(snapGrid[snapGrid.length - 1] + size);
                slidesGrid.push(slidesGrid[slidesGrid.length - 1] + size);
                swiper.virtualSize += size;
            }
        }
        if (snapGrid.length === 0) snapGrid = [ 0 ];
        if (spaceBetween !== 0) {
            const key = swiper.isHorizontal() && rtl ? "marginLeft" : swiper.getDirectionLabel("marginRight");
            slides.filter(((_, slideIndex) => {
                if (!params.cssMode || params.loop) return true;
                if (slideIndex === slides.length - 1) return false;
                return true;
            })).forEach((slideEl => {
                slideEl.style[key] = `${spaceBetween}px`;
            }));
        }
        if (params.centeredSlides && params.centeredSlidesBounds) {
            let allSlidesSize = 0;
            slidesSizesGrid.forEach((slideSizeValue => {
                allSlidesSize += slideSizeValue + (spaceBetween || 0);
            }));
            allSlidesSize -= spaceBetween;
            const maxSnap = allSlidesSize - swiperSize;
            snapGrid = snapGrid.map((snap => {
                if (snap <= 0) return -offsetBefore;
                if (snap > maxSnap) return maxSnap + offsetAfter;
                return snap;
            }));
        }
        if (params.centerInsufficientSlides) {
            let allSlidesSize = 0;
            slidesSizesGrid.forEach((slideSizeValue => {
                allSlidesSize += slideSizeValue + (spaceBetween || 0);
            }));
            allSlidesSize -= spaceBetween;
            const offsetSize = (params.slidesOffsetBefore || 0) + (params.slidesOffsetAfter || 0);
            if (allSlidesSize + offsetSize < swiperSize) {
                const allSlidesOffset = (swiperSize - allSlidesSize - offsetSize) / 2;
                snapGrid.forEach(((snap, snapIndex) => {
                    snapGrid[snapIndex] = snap - allSlidesOffset;
                }));
                slidesGrid.forEach(((snap, snapIndex) => {
                    slidesGrid[snapIndex] = snap + allSlidesOffset;
                }));
            }
        }
        Object.assign(swiper, {
            slides,
            snapGrid,
            slidesGrid,
            slidesSizesGrid
        });
        if (params.centeredSlides && params.cssMode && !params.centeredSlidesBounds) {
            utils_setCSSProperty(wrapperEl, "--swiper-centered-offset-before", `${-snapGrid[0]}px`);
            utils_setCSSProperty(wrapperEl, "--swiper-centered-offset-after", `${swiper.size / 2 - slidesSizesGrid[slidesSizesGrid.length - 1] / 2}px`);
            const addToSnapGrid = -swiper.snapGrid[0];
            const addToSlidesGrid = -swiper.slidesGrid[0];
            swiper.snapGrid = swiper.snapGrid.map((v => v + addToSnapGrid));
            swiper.slidesGrid = swiper.slidesGrid.map((v => v + addToSlidesGrid));
        }
        if (slidesLength !== previousSlidesLength) swiper.emit("slidesLengthChange");
        if (snapGrid.length !== previousSnapGridLength) {
            if (swiper.params.watchOverflow) swiper.checkOverflow();
            swiper.emit("snapGridLengthChange");
        }
        if (slidesGrid.length !== previousSlidesGridLength) swiper.emit("slidesGridLengthChange");
        if (params.watchSlidesProgress) swiper.updateSlidesOffset();
        swiper.emit("slidesUpdated");
        if (!isVirtual && !params.cssMode && (params.effect === "slide" || params.effect === "fade")) {
            const backFaceHiddenClass = `${params.containerModifierClass}backface-hidden`;
            const hasClassBackfaceClassAdded = swiper.el.classList.contains(backFaceHiddenClass);
            if (slidesLength <= params.maxBackfaceHiddenSlides) {
                if (!hasClassBackfaceClassAdded) swiper.el.classList.add(backFaceHiddenClass);
            } else if (hasClassBackfaceClassAdded) swiper.el.classList.remove(backFaceHiddenClass);
        }
    }
    function updateAutoHeight(speed) {
        const swiper = this;
        const activeSlides = [];
        const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
        let newHeight = 0;
        let i;
        if (typeof speed === "number") swiper.setTransition(speed); else if (speed === true) swiper.setTransition(swiper.params.speed);
        const getSlideByIndex = index => {
            if (isVirtual) return swiper.slides[swiper.getSlideIndexByData(index)];
            return swiper.slides[index];
        };
        if (swiper.params.slidesPerView !== "auto" && swiper.params.slidesPerView > 1) if (swiper.params.centeredSlides) (swiper.visibleSlides || []).forEach((slide => {
            activeSlides.push(slide);
        })); else for (i = 0; i < Math.ceil(swiper.params.slidesPerView); i += 1) {
            const index = swiper.activeIndex + i;
            if (index > swiper.slides.length && !isVirtual) break;
            activeSlides.push(getSlideByIndex(index));
        } else activeSlides.push(getSlideByIndex(swiper.activeIndex));
        for (i = 0; i < activeSlides.length; i += 1) if (typeof activeSlides[i] !== "undefined") {
            const height = activeSlides[i].offsetHeight;
            newHeight = height > newHeight ? height : newHeight;
        }
        if (newHeight || newHeight === 0) swiper.wrapperEl.style.height = `${newHeight}px`;
    }
    function updateSlidesOffset() {
        const swiper = this;
        const slides = swiper.slides;
        const minusOffset = swiper.isElement ? swiper.isHorizontal() ? swiper.wrapperEl.offsetLeft : swiper.wrapperEl.offsetTop : 0;
        for (let i = 0; i < slides.length; i += 1) slides[i].swiperSlideOffset = (swiper.isHorizontal() ? slides[i].offsetLeft : slides[i].offsetTop) - minusOffset - swiper.cssOverflowAdjustment();
    }
    const toggleSlideClasses$1 = (slideEl, condition, className) => {
        if (condition && !slideEl.classList.contains(className)) slideEl.classList.add(className); else if (!condition && slideEl.classList.contains(className)) slideEl.classList.remove(className);
    };
    function updateSlidesProgress(translate) {
        if (translate === void 0) translate = this && this.translate || 0;
        const swiper = this;
        const params = swiper.params;
        const {slides, rtlTranslate: rtl, snapGrid} = swiper;
        if (slides.length === 0) return;
        if (typeof slides[0].swiperSlideOffset === "undefined") swiper.updateSlidesOffset();
        let offsetCenter = -translate;
        if (rtl) offsetCenter = translate;
        swiper.visibleSlidesIndexes = [];
        swiper.visibleSlides = [];
        let spaceBetween = params.spaceBetween;
        if (typeof spaceBetween === "string" && spaceBetween.indexOf("%") >= 0) spaceBetween = parseFloat(spaceBetween.replace("%", "")) / 100 * swiper.size; else if (typeof spaceBetween === "string") spaceBetween = parseFloat(spaceBetween);
        for (let i = 0; i < slides.length; i += 1) {
            const slide = slides[i];
            let slideOffset = slide.swiperSlideOffset;
            if (params.cssMode && params.centeredSlides) slideOffset -= slides[0].swiperSlideOffset;
            const slideProgress = (offsetCenter + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide.swiperSlideSize + spaceBetween);
            const originalSlideProgress = (offsetCenter - snapGrid[0] + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide.swiperSlideSize + spaceBetween);
            const slideBefore = -(offsetCenter - slideOffset);
            const slideAfter = slideBefore + swiper.slidesSizesGrid[i];
            const isFullyVisible = slideBefore >= 0 && slideBefore <= swiper.size - swiper.slidesSizesGrid[i];
            const isVisible = slideBefore >= 0 && slideBefore < swiper.size - 1 || slideAfter > 1 && slideAfter <= swiper.size || slideBefore <= 0 && slideAfter >= swiper.size;
            if (isVisible) {
                swiper.visibleSlides.push(slide);
                swiper.visibleSlidesIndexes.push(i);
            }
            toggleSlideClasses$1(slide, isVisible, params.slideVisibleClass);
            toggleSlideClasses$1(slide, isFullyVisible, params.slideFullyVisibleClass);
            slide.progress = rtl ? -slideProgress : slideProgress;
            slide.originalProgress = rtl ? -originalSlideProgress : originalSlideProgress;
        }
    }
    function updateProgress(translate) {
        const swiper = this;
        if (typeof translate === "undefined") {
            const multiplier = swiper.rtlTranslate ? -1 : 1;
            translate = swiper && swiper.translate && swiper.translate * multiplier || 0;
        }
        const params = swiper.params;
        const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
        let {progress, isBeginning, isEnd, progressLoop} = swiper;
        const wasBeginning = isBeginning;
        const wasEnd = isEnd;
        if (translatesDiff === 0) {
            progress = 0;
            isBeginning = true;
            isEnd = true;
        } else {
            progress = (translate - swiper.minTranslate()) / translatesDiff;
            const isBeginningRounded = Math.abs(translate - swiper.minTranslate()) < 1;
            const isEndRounded = Math.abs(translate - swiper.maxTranslate()) < 1;
            isBeginning = isBeginningRounded || progress <= 0;
            isEnd = isEndRounded || progress >= 1;
            if (isBeginningRounded) progress = 0;
            if (isEndRounded) progress = 1;
        }
        if (params.loop) {
            const firstSlideIndex = swiper.getSlideIndexByData(0);
            const lastSlideIndex = swiper.getSlideIndexByData(swiper.slides.length - 1);
            const firstSlideTranslate = swiper.slidesGrid[firstSlideIndex];
            const lastSlideTranslate = swiper.slidesGrid[lastSlideIndex];
            const translateMax = swiper.slidesGrid[swiper.slidesGrid.length - 1];
            const translateAbs = Math.abs(translate);
            if (translateAbs >= firstSlideTranslate) progressLoop = (translateAbs - firstSlideTranslate) / translateMax; else progressLoop = (translateAbs + translateMax - lastSlideTranslate) / translateMax;
            if (progressLoop > 1) progressLoop -= 1;
        }
        Object.assign(swiper, {
            progress,
            progressLoop,
            isBeginning,
            isEnd
        });
        if (params.watchSlidesProgress || params.centeredSlides && params.autoHeight) swiper.updateSlidesProgress(translate);
        if (isBeginning && !wasBeginning) swiper.emit("reachBeginning toEdge");
        if (isEnd && !wasEnd) swiper.emit("reachEnd toEdge");
        if (wasBeginning && !isBeginning || wasEnd && !isEnd) swiper.emit("fromEdge");
        swiper.emit("progress", progress);
    }
    const toggleSlideClasses = (slideEl, condition, className) => {
        if (condition && !slideEl.classList.contains(className)) slideEl.classList.add(className); else if (!condition && slideEl.classList.contains(className)) slideEl.classList.remove(className);
    };
    function updateSlidesClasses() {
        const swiper = this;
        const {slides, params, slidesEl, activeIndex} = swiper;
        const isVirtual = swiper.virtual && params.virtual.enabled;
        const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
        const getFilteredSlide = selector => utils_elementChildren(slidesEl, `.${params.slideClass}${selector}, swiper-slide${selector}`)[0];
        let activeSlide;
        let prevSlide;
        let nextSlide;
        if (isVirtual) if (params.loop) {
            let slideIndex = activeIndex - swiper.virtual.slidesBefore;
            if (slideIndex < 0) slideIndex = swiper.virtual.slides.length + slideIndex;
            if (slideIndex >= swiper.virtual.slides.length) slideIndex -= swiper.virtual.slides.length;
            activeSlide = getFilteredSlide(`[data-swiper-slide-index="${slideIndex}"]`);
        } else activeSlide = getFilteredSlide(`[data-swiper-slide-index="${activeIndex}"]`); else if (gridEnabled) {
            activeSlide = slides.filter((slideEl => slideEl.column === activeIndex))[0];
            nextSlide = slides.filter((slideEl => slideEl.column === activeIndex + 1))[0];
            prevSlide = slides.filter((slideEl => slideEl.column === activeIndex - 1))[0];
        } else activeSlide = slides[activeIndex];
        if (activeSlide) if (!gridEnabled) {
            nextSlide = elementNextAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
            if (params.loop && !nextSlide) nextSlide = slides[0];
            prevSlide = elementPrevAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
            if (params.loop && !prevSlide === 0) prevSlide = slides[slides.length - 1];
        }
        slides.forEach((slideEl => {
            toggleSlideClasses(slideEl, slideEl === activeSlide, params.slideActiveClass);
            toggleSlideClasses(slideEl, slideEl === nextSlide, params.slideNextClass);
            toggleSlideClasses(slideEl, slideEl === prevSlide, params.slidePrevClass);
        }));
        swiper.emitSlidesClasses();
    }
    const processLazyPreloader = (swiper, imageEl) => {
        if (!swiper || swiper.destroyed || !swiper.params) return;
        const slideSelector = () => swiper.isElement ? `swiper-slide` : `.${swiper.params.slideClass}`;
        const slideEl = imageEl.closest(slideSelector());
        if (slideEl) {
            let lazyEl = slideEl.querySelector(`.${swiper.params.lazyPreloaderClass}`);
            if (!lazyEl && swiper.isElement) if (slideEl.shadowRoot) lazyEl = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`); else requestAnimationFrame((() => {
                if (slideEl.shadowRoot) {
                    lazyEl = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`);
                    if (lazyEl) lazyEl.remove();
                }
            }));
            if (lazyEl) lazyEl.remove();
        }
    };
    const unlazy = (swiper, index) => {
        if (!swiper.slides[index]) return;
        const imageEl = swiper.slides[index].querySelector('[loading="lazy"]');
        if (imageEl) imageEl.removeAttribute("loading");
    };
    const preload = swiper => {
        if (!swiper || swiper.destroyed || !swiper.params) return;
        let amount = swiper.params.lazyPreloadPrevNext;
        const len = swiper.slides.length;
        if (!len || !amount || amount < 0) return;
        amount = Math.min(amount, len);
        const slidesPerView = swiper.params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : Math.ceil(swiper.params.slidesPerView);
        const activeIndex = swiper.activeIndex;
        if (swiper.params.grid && swiper.params.grid.rows > 1) {
            const activeColumn = activeIndex;
            const preloadColumns = [ activeColumn - amount ];
            preloadColumns.push(...Array.from({
                length: amount
            }).map(((_, i) => activeColumn + slidesPerView + i)));
            swiper.slides.forEach(((slideEl, i) => {
                if (preloadColumns.includes(slideEl.column)) unlazy(swiper, i);
            }));
            return;
        }
        const slideIndexLastInView = activeIndex + slidesPerView - 1;
        if (swiper.params.rewind || swiper.params.loop) for (let i = activeIndex - amount; i <= slideIndexLastInView + amount; i += 1) {
            const realIndex = (i % len + len) % len;
            if (realIndex < activeIndex || realIndex > slideIndexLastInView) unlazy(swiper, realIndex);
        } else for (let i = Math.max(activeIndex - amount, 0); i <= Math.min(slideIndexLastInView + amount, len - 1); i += 1) if (i !== activeIndex && (i > slideIndexLastInView || i < activeIndex)) unlazy(swiper, i);
    };
    function getActiveIndexByTranslate(swiper) {
        const {slidesGrid, params} = swiper;
        const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
        let activeIndex;
        for (let i = 0; i < slidesGrid.length; i += 1) if (typeof slidesGrid[i + 1] !== "undefined") {
            if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1] - (slidesGrid[i + 1] - slidesGrid[i]) / 2) activeIndex = i; else if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1]) activeIndex = i + 1;
        } else if (translate >= slidesGrid[i]) activeIndex = i;
        if (params.normalizeSlideIndex) if (activeIndex < 0 || typeof activeIndex === "undefined") activeIndex = 0;
        return activeIndex;
    }
    function updateActiveIndex(newActiveIndex) {
        const swiper = this;
        const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
        const {snapGrid, params, activeIndex: previousIndex, realIndex: previousRealIndex, snapIndex: previousSnapIndex} = swiper;
        let activeIndex = newActiveIndex;
        let snapIndex;
        const getVirtualRealIndex = aIndex => {
            let realIndex = aIndex - swiper.virtual.slidesBefore;
            if (realIndex < 0) realIndex = swiper.virtual.slides.length + realIndex;
            if (realIndex >= swiper.virtual.slides.length) realIndex -= swiper.virtual.slides.length;
            return realIndex;
        };
        if (typeof activeIndex === "undefined") activeIndex = getActiveIndexByTranslate(swiper);
        if (snapGrid.indexOf(translate) >= 0) snapIndex = snapGrid.indexOf(translate); else {
            const skip = Math.min(params.slidesPerGroupSkip, activeIndex);
            snapIndex = skip + Math.floor((activeIndex - skip) / params.slidesPerGroup);
        }
        if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;
        if (activeIndex === previousIndex && !swiper.params.loop) {
            if (snapIndex !== previousSnapIndex) {
                swiper.snapIndex = snapIndex;
                swiper.emit("snapIndexChange");
            }
            return;
        }
        if (activeIndex === previousIndex && swiper.params.loop && swiper.virtual && swiper.params.virtual.enabled) {
            swiper.realIndex = getVirtualRealIndex(activeIndex);
            return;
        }
        const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
        let realIndex;
        if (swiper.virtual && params.virtual.enabled && params.loop) realIndex = getVirtualRealIndex(activeIndex); else if (gridEnabled) {
            const firstSlideInColumn = swiper.slides.filter((slideEl => slideEl.column === activeIndex))[0];
            let activeSlideIndex = parseInt(firstSlideInColumn.getAttribute("data-swiper-slide-index"), 10);
            if (Number.isNaN(activeSlideIndex)) activeSlideIndex = Math.max(swiper.slides.indexOf(firstSlideInColumn), 0);
            realIndex = Math.floor(activeSlideIndex / params.grid.rows);
        } else if (swiper.slides[activeIndex]) {
            const slideIndex = swiper.slides[activeIndex].getAttribute("data-swiper-slide-index");
            if (slideIndex) realIndex = parseInt(slideIndex, 10); else realIndex = activeIndex;
        } else realIndex = activeIndex;
        Object.assign(swiper, {
            previousSnapIndex,
            snapIndex,
            previousRealIndex,
            realIndex,
            previousIndex,
            activeIndex
        });
        if (swiper.initialized) preload(swiper);
        swiper.emit("activeIndexChange");
        swiper.emit("snapIndexChange");
        if (swiper.initialized || swiper.params.runCallbacksOnInit) {
            if (previousRealIndex !== realIndex) swiper.emit("realIndexChange");
            swiper.emit("slideChange");
        }
    }
    function updateClickedSlide(el, path) {
        const swiper = this;
        const params = swiper.params;
        let slide = el.closest(`.${params.slideClass}, swiper-slide`);
        if (!slide && swiper.isElement && path && path.length > 1 && path.includes(el)) [ ...path.slice(path.indexOf(el) + 1, path.length) ].forEach((pathEl => {
            if (!slide && pathEl.matches && pathEl.matches(`.${params.slideClass}, swiper-slide`)) slide = pathEl;
        }));
        let slideFound = false;
        let slideIndex;
        if (slide) for (let i = 0; i < swiper.slides.length; i += 1) if (swiper.slides[i] === slide) {
            slideFound = true;
            slideIndex = i;
            break;
        }
        if (slide && slideFound) {
            swiper.clickedSlide = slide;
            if (swiper.virtual && swiper.params.virtual.enabled) swiper.clickedIndex = parseInt(slide.getAttribute("data-swiper-slide-index"), 10); else swiper.clickedIndex = slideIndex;
        } else {
            swiper.clickedSlide = void 0;
            swiper.clickedIndex = void 0;
            return;
        }
        if (params.slideToClickedSlide && swiper.clickedIndex !== void 0 && swiper.clickedIndex !== swiper.activeIndex) swiper.slideToClickedSlide();
    }
    var update = {
        updateSize,
        updateSlides,
        updateAutoHeight,
        updateSlidesOffset,
        updateSlidesProgress,
        updateProgress,
        updateSlidesClasses,
        updateActiveIndex,
        updateClickedSlide
    };
    function getSwiperTranslate(axis) {
        if (axis === void 0) axis = this.isHorizontal() ? "x" : "y";
        const swiper = this;
        const {params, rtlTranslate: rtl, translate, wrapperEl} = swiper;
        if (params.virtualTranslate) return rtl ? -translate : translate;
        if (params.cssMode) return translate;
        let currentTranslate = utils_getTranslate(wrapperEl, axis);
        currentTranslate += swiper.cssOverflowAdjustment();
        if (rtl) currentTranslate = -currentTranslate;
        return currentTranslate || 0;
    }
    function setTranslate(translate, byController) {
        const swiper = this;
        const {rtlTranslate: rtl, params, wrapperEl, progress} = swiper;
        let x = 0;
        let y = 0;
        const z = 0;
        if (swiper.isHorizontal()) x = rtl ? -translate : translate; else y = translate;
        if (params.roundLengths) {
            x = Math.floor(x);
            y = Math.floor(y);
        }
        swiper.previousTranslate = swiper.translate;
        swiper.translate = swiper.isHorizontal() ? x : y;
        if (params.cssMode) wrapperEl[swiper.isHorizontal() ? "scrollLeft" : "scrollTop"] = swiper.isHorizontal() ? -x : -y; else if (!params.virtualTranslate) {
            if (swiper.isHorizontal()) x -= swiper.cssOverflowAdjustment(); else y -= swiper.cssOverflowAdjustment();
            wrapperEl.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
        }
        let newProgress;
        const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
        if (translatesDiff === 0) newProgress = 0; else newProgress = (translate - swiper.minTranslate()) / translatesDiff;
        if (newProgress !== progress) swiper.updateProgress(translate);
        swiper.emit("setTranslate", swiper.translate, byController);
    }
    function minTranslate() {
        return -this.snapGrid[0];
    }
    function maxTranslate() {
        return -this.snapGrid[this.snapGrid.length - 1];
    }
    function translateTo(translate, speed, runCallbacks, translateBounds, internal) {
        if (translate === void 0) translate = 0;
        if (speed === void 0) speed = this.params.speed;
        if (runCallbacks === void 0) runCallbacks = true;
        if (translateBounds === void 0) translateBounds = true;
        const swiper = this;
        const {params, wrapperEl} = swiper;
        if (swiper.animating && params.preventInteractionOnTransition) return false;
        const minTranslate = swiper.minTranslate();
        const maxTranslate = swiper.maxTranslate();
        let newTranslate;
        if (translateBounds && translate > minTranslate) newTranslate = minTranslate; else if (translateBounds && translate < maxTranslate) newTranslate = maxTranslate; else newTranslate = translate;
        swiper.updateProgress(newTranslate);
        if (params.cssMode) {
            const isH = swiper.isHorizontal();
            if (speed === 0) wrapperEl[isH ? "scrollLeft" : "scrollTop"] = -newTranslate; else {
                if (!swiper.support.smoothScroll) {
                    animateCSSModeScroll({
                        swiper,
                        targetPosition: -newTranslate,
                        side: isH ? "left" : "top"
                    });
                    return true;
                }
                wrapperEl.scrollTo({
                    [isH ? "left" : "top"]: -newTranslate,
                    behavior: "smooth"
                });
            }
            return true;
        }
        if (speed === 0) {
            swiper.setTransition(0);
            swiper.setTranslate(newTranslate);
            if (runCallbacks) {
                swiper.emit("beforeTransitionStart", speed, internal);
                swiper.emit("transitionEnd");
            }
        } else {
            swiper.setTransition(speed);
            swiper.setTranslate(newTranslate);
            if (runCallbacks) {
                swiper.emit("beforeTransitionStart", speed, internal);
                swiper.emit("transitionStart");
            }
            if (!swiper.animating) {
                swiper.animating = true;
                if (!swiper.onTranslateToWrapperTransitionEnd) swiper.onTranslateToWrapperTransitionEnd = function transitionEnd(e) {
                    if (!swiper || swiper.destroyed) return;
                    if (e.target !== this) return;
                    swiper.wrapperEl.removeEventListener("transitionend", swiper.onTranslateToWrapperTransitionEnd);
                    swiper.onTranslateToWrapperTransitionEnd = null;
                    delete swiper.onTranslateToWrapperTransitionEnd;
                    swiper.animating = false;
                    if (runCallbacks) swiper.emit("transitionEnd");
                };
                swiper.wrapperEl.addEventListener("transitionend", swiper.onTranslateToWrapperTransitionEnd);
            }
        }
        return true;
    }
    var translate = {
        getTranslate: getSwiperTranslate,
        setTranslate,
        minTranslate,
        maxTranslate,
        translateTo
    };
    function setTransition(duration, byController) {
        const swiper = this;
        if (!swiper.params.cssMode) {
            swiper.wrapperEl.style.transitionDuration = `${duration}ms`;
            swiper.wrapperEl.style.transitionDelay = duration === 0 ? `0ms` : "";
        }
        swiper.emit("setTransition", duration, byController);
    }
    function transitionEmit(_ref) {
        let {swiper, runCallbacks, direction, step} = _ref;
        const {activeIndex, previousIndex} = swiper;
        let dir = direction;
        if (!dir) if (activeIndex > previousIndex) dir = "next"; else if (activeIndex < previousIndex) dir = "prev"; else dir = "reset";
        swiper.emit(`transition${step}`);
        if (runCallbacks && activeIndex !== previousIndex) {
            if (dir === "reset") {
                swiper.emit(`slideResetTransition${step}`);
                return;
            }
            swiper.emit(`slideChangeTransition${step}`);
            if (dir === "next") swiper.emit(`slideNextTransition${step}`); else swiper.emit(`slidePrevTransition${step}`);
        }
    }
    function transitionStart(runCallbacks, direction) {
        if (runCallbacks === void 0) runCallbacks = true;
        const swiper = this;
        const {params} = swiper;
        if (params.cssMode) return;
        if (params.autoHeight) swiper.updateAutoHeight();
        transitionEmit({
            swiper,
            runCallbacks,
            direction,
            step: "Start"
        });
    }
    function transitionEnd(runCallbacks, direction) {
        if (runCallbacks === void 0) runCallbacks = true;
        const swiper = this;
        const {params} = swiper;
        swiper.animating = false;
        if (params.cssMode) return;
        swiper.setTransition(0);
        transitionEmit({
            swiper,
            runCallbacks,
            direction,
            step: "End"
        });
    }
    var transition = {
        setTransition,
        transitionStart,
        transitionEnd
    };
    function slideTo(index, speed, runCallbacks, internal, initial) {
        if (index === void 0) index = 0;
        if (runCallbacks === void 0) runCallbacks = true;
        if (typeof index === "string") index = parseInt(index, 10);
        const swiper = this;
        let slideIndex = index;
        if (slideIndex < 0) slideIndex = 0;
        const {params, snapGrid, slidesGrid, previousIndex, activeIndex, rtlTranslate: rtl, wrapperEl, enabled} = swiper;
        if (!enabled && !internal && !initial || swiper.destroyed || swiper.animating && params.preventInteractionOnTransition) return false;
        if (typeof speed === "undefined") speed = swiper.params.speed;
        const skip = Math.min(swiper.params.slidesPerGroupSkip, slideIndex);
        let snapIndex = skip + Math.floor((slideIndex - skip) / swiper.params.slidesPerGroup);
        if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;
        const translate = -snapGrid[snapIndex];
        if (params.normalizeSlideIndex) for (let i = 0; i < slidesGrid.length; i += 1) {
            const normalizedTranslate = -Math.floor(translate * 100);
            const normalizedGrid = Math.floor(slidesGrid[i] * 100);
            const normalizedGridNext = Math.floor(slidesGrid[i + 1] * 100);
            if (typeof slidesGrid[i + 1] !== "undefined") {
                if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext - (normalizedGridNext - normalizedGrid) / 2) slideIndex = i; else if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext) slideIndex = i + 1;
            } else if (normalizedTranslate >= normalizedGrid) slideIndex = i;
        }
        if (swiper.initialized && slideIndex !== activeIndex) {
            if (!swiper.allowSlideNext && (rtl ? translate > swiper.translate && translate > swiper.minTranslate() : translate < swiper.translate && translate < swiper.minTranslate())) return false;
            if (!swiper.allowSlidePrev && translate > swiper.translate && translate > swiper.maxTranslate()) if ((activeIndex || 0) !== slideIndex) return false;
        }
        if (slideIndex !== (previousIndex || 0) && runCallbacks) swiper.emit("beforeSlideChangeStart");
        swiper.updateProgress(translate);
        let direction;
        if (slideIndex > activeIndex) direction = "next"; else if (slideIndex < activeIndex) direction = "prev"; else direction = "reset";
        if (rtl && -translate === swiper.translate || !rtl && translate === swiper.translate) {
            swiper.updateActiveIndex(slideIndex);
            if (params.autoHeight) swiper.updateAutoHeight();
            swiper.updateSlidesClasses();
            if (params.effect !== "slide") swiper.setTranslate(translate);
            if (direction !== "reset") {
                swiper.transitionStart(runCallbacks, direction);
                swiper.transitionEnd(runCallbacks, direction);
            }
            return false;
        }
        if (params.cssMode) {
            const isH = swiper.isHorizontal();
            const t = rtl ? translate : -translate;
            if (speed === 0) {
                const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
                if (isVirtual) {
                    swiper.wrapperEl.style.scrollSnapType = "none";
                    swiper._immediateVirtual = true;
                }
                if (isVirtual && !swiper._cssModeVirtualInitialSet && swiper.params.initialSlide > 0) {
                    swiper._cssModeVirtualInitialSet = true;
                    requestAnimationFrame((() => {
                        wrapperEl[isH ? "scrollLeft" : "scrollTop"] = t;
                    }));
                } else wrapperEl[isH ? "scrollLeft" : "scrollTop"] = t;
                if (isVirtual) requestAnimationFrame((() => {
                    swiper.wrapperEl.style.scrollSnapType = "";
                    swiper._immediateVirtual = false;
                }));
            } else {
                if (!swiper.support.smoothScroll) {
                    animateCSSModeScroll({
                        swiper,
                        targetPosition: t,
                        side: isH ? "left" : "top"
                    });
                    return true;
                }
                wrapperEl.scrollTo({
                    [isH ? "left" : "top"]: t,
                    behavior: "smooth"
                });
            }
            return true;
        }
        swiper.setTransition(speed);
        swiper.setTranslate(translate);
        swiper.updateActiveIndex(slideIndex);
        swiper.updateSlidesClasses();
        swiper.emit("beforeTransitionStart", speed, internal);
        swiper.transitionStart(runCallbacks, direction);
        if (speed === 0) swiper.transitionEnd(runCallbacks, direction); else if (!swiper.animating) {
            swiper.animating = true;
            if (!swiper.onSlideToWrapperTransitionEnd) swiper.onSlideToWrapperTransitionEnd = function transitionEnd(e) {
                if (!swiper || swiper.destroyed) return;
                if (e.target !== this) return;
                swiper.wrapperEl.removeEventListener("transitionend", swiper.onSlideToWrapperTransitionEnd);
                swiper.onSlideToWrapperTransitionEnd = null;
                delete swiper.onSlideToWrapperTransitionEnd;
                swiper.transitionEnd(runCallbacks, direction);
            };
            swiper.wrapperEl.addEventListener("transitionend", swiper.onSlideToWrapperTransitionEnd);
        }
        return true;
    }
    function slideToLoop(index, speed, runCallbacks, internal) {
        if (index === void 0) index = 0;
        if (runCallbacks === void 0) runCallbacks = true;
        if (typeof index === "string") {
            const indexAsNumber = parseInt(index, 10);
            index = indexAsNumber;
        }
        const swiper = this;
        if (swiper.destroyed) return;
        if (typeof speed === "undefined") speed = swiper.params.speed;
        const gridEnabled = swiper.grid && swiper.params.grid && swiper.params.grid.rows > 1;
        let newIndex = index;
        if (swiper.params.loop) if (swiper.virtual && swiper.params.virtual.enabled) newIndex += swiper.virtual.slidesBefore; else {
            let targetSlideIndex;
            if (gridEnabled) {
                const slideIndex = newIndex * swiper.params.grid.rows;
                targetSlideIndex = swiper.slides.filter((slideEl => slideEl.getAttribute("data-swiper-slide-index") * 1 === slideIndex))[0].column;
            } else targetSlideIndex = swiper.getSlideIndexByData(newIndex);
            const cols = gridEnabled ? Math.ceil(swiper.slides.length / swiper.params.grid.rows) : swiper.slides.length;
            const {centeredSlides} = swiper.params;
            let slidesPerView = swiper.params.slidesPerView;
            if (slidesPerView === "auto") slidesPerView = swiper.slidesPerViewDynamic(); else {
                slidesPerView = Math.ceil(parseFloat(swiper.params.slidesPerView, 10));
                if (centeredSlides && slidesPerView % 2 === 0) slidesPerView += 1;
            }
            let needLoopFix = cols - targetSlideIndex < slidesPerView;
            if (centeredSlides) needLoopFix = needLoopFix || targetSlideIndex < Math.ceil(slidesPerView / 2);
            if (internal && centeredSlides && swiper.params.slidesPerView !== "auto" && !gridEnabled) needLoopFix = false;
            if (needLoopFix) {
                const direction = centeredSlides ? targetSlideIndex < swiper.activeIndex ? "prev" : "next" : targetSlideIndex - swiper.activeIndex - 1 < swiper.params.slidesPerView ? "next" : "prev";
                swiper.loopFix({
                    direction,
                    slideTo: true,
                    activeSlideIndex: direction === "next" ? targetSlideIndex + 1 : targetSlideIndex - cols + 1,
                    slideRealIndex: direction === "next" ? swiper.realIndex : void 0
                });
            }
            if (gridEnabled) {
                const slideIndex = newIndex * swiper.params.grid.rows;
                newIndex = swiper.slides.filter((slideEl => slideEl.getAttribute("data-swiper-slide-index") * 1 === slideIndex))[0].column;
            } else newIndex = swiper.getSlideIndexByData(newIndex);
        }
        requestAnimationFrame((() => {
            swiper.slideTo(newIndex, speed, runCallbacks, internal);
        }));
        return swiper;
    }
    function slideNext(speed, runCallbacks, internal) {
        if (runCallbacks === void 0) runCallbacks = true;
        const swiper = this;
        const {enabled, params, animating} = swiper;
        if (!enabled || swiper.destroyed) return swiper;
        if (typeof speed === "undefined") speed = swiper.params.speed;
        let perGroup = params.slidesPerGroup;
        if (params.slidesPerView === "auto" && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) perGroup = Math.max(swiper.slidesPerViewDynamic("current", true), 1);
        const increment = swiper.activeIndex < params.slidesPerGroupSkip ? 1 : perGroup;
        const isVirtual = swiper.virtual && params.virtual.enabled;
        if (params.loop) {
            if (animating && !isVirtual && params.loopPreventsSliding) return false;
            swiper.loopFix({
                direction: "next"
            });
            swiper._clientLeft = swiper.wrapperEl.clientLeft;
            if (swiper.activeIndex === swiper.slides.length - 1 && params.cssMode) {
                requestAnimationFrame((() => {
                    swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
                }));
                return true;
            }
        }
        if (params.rewind && swiper.isEnd) return swiper.slideTo(0, speed, runCallbacks, internal);
        return swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
    }
    function slidePrev(speed, runCallbacks, internal) {
        if (runCallbacks === void 0) runCallbacks = true;
        const swiper = this;
        const {params, snapGrid, slidesGrid, rtlTranslate, enabled, animating} = swiper;
        if (!enabled || swiper.destroyed) return swiper;
        if (typeof speed === "undefined") speed = swiper.params.speed;
        const isVirtual = swiper.virtual && params.virtual.enabled;
        if (params.loop) {
            if (animating && !isVirtual && params.loopPreventsSliding) return false;
            swiper.loopFix({
                direction: "prev"
            });
            swiper._clientLeft = swiper.wrapperEl.clientLeft;
        }
        const translate = rtlTranslate ? swiper.translate : -swiper.translate;
        function normalize(val) {
            if (val < 0) return -Math.floor(Math.abs(val));
            return Math.floor(val);
        }
        const normalizedTranslate = normalize(translate);
        const normalizedSnapGrid = snapGrid.map((val => normalize(val)));
        let prevSnap = snapGrid[normalizedSnapGrid.indexOf(normalizedTranslate) - 1];
        if (typeof prevSnap === "undefined" && params.cssMode) {
            let prevSnapIndex;
            snapGrid.forEach(((snap, snapIndex) => {
                if (normalizedTranslate >= snap) prevSnapIndex = snapIndex;
            }));
            if (typeof prevSnapIndex !== "undefined") prevSnap = snapGrid[prevSnapIndex > 0 ? prevSnapIndex - 1 : prevSnapIndex];
        }
        let prevIndex = 0;
        if (typeof prevSnap !== "undefined") {
            prevIndex = slidesGrid.indexOf(prevSnap);
            if (prevIndex < 0) prevIndex = swiper.activeIndex - 1;
            if (params.slidesPerView === "auto" && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
                prevIndex = prevIndex - swiper.slidesPerViewDynamic("previous", true) + 1;
                prevIndex = Math.max(prevIndex, 0);
            }
        }
        if (params.rewind && swiper.isBeginning) {
            const lastIndex = swiper.params.virtual && swiper.params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1;
            return swiper.slideTo(lastIndex, speed, runCallbacks, internal);
        } else if (params.loop && swiper.activeIndex === 0 && params.cssMode) {
            requestAnimationFrame((() => {
                swiper.slideTo(prevIndex, speed, runCallbacks, internal);
            }));
            return true;
        }
        return swiper.slideTo(prevIndex, speed, runCallbacks, internal);
    }
    function slideReset(speed, runCallbacks, internal) {
        if (runCallbacks === void 0) runCallbacks = true;
        const swiper = this;
        if (swiper.destroyed) return;
        if (typeof speed === "undefined") speed = swiper.params.speed;
        return swiper.slideTo(swiper.activeIndex, speed, runCallbacks, internal);
    }
    function slideToClosest(speed, runCallbacks, internal, threshold) {
        if (runCallbacks === void 0) runCallbacks = true;
        if (threshold === void 0) threshold = .5;
        const swiper = this;
        if (swiper.destroyed) return;
        if (typeof speed === "undefined") speed = swiper.params.speed;
        let index = swiper.activeIndex;
        const skip = Math.min(swiper.params.slidesPerGroupSkip, index);
        const snapIndex = skip + Math.floor((index - skip) / swiper.params.slidesPerGroup);
        const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
        if (translate >= swiper.snapGrid[snapIndex]) {
            const currentSnap = swiper.snapGrid[snapIndex];
            const nextSnap = swiper.snapGrid[snapIndex + 1];
            if (translate - currentSnap > (nextSnap - currentSnap) * threshold) index += swiper.params.slidesPerGroup;
        } else {
            const prevSnap = swiper.snapGrid[snapIndex - 1];
            const currentSnap = swiper.snapGrid[snapIndex];
            if (translate - prevSnap <= (currentSnap - prevSnap) * threshold) index -= swiper.params.slidesPerGroup;
        }
        index = Math.max(index, 0);
        index = Math.min(index, swiper.slidesGrid.length - 1);
        return swiper.slideTo(index, speed, runCallbacks, internal);
    }
    function slideToClickedSlide() {
        const swiper = this;
        if (swiper.destroyed) return;
        const {params, slidesEl} = swiper;
        const slidesPerView = params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : params.slidesPerView;
        let slideToIndex = swiper.clickedIndex;
        let realIndex;
        const slideSelector = swiper.isElement ? `swiper-slide` : `.${params.slideClass}`;
        if (params.loop) {
            if (swiper.animating) return;
            realIndex = parseInt(swiper.clickedSlide.getAttribute("data-swiper-slide-index"), 10);
            if (params.centeredSlides) if (slideToIndex < swiper.loopedSlides - slidesPerView / 2 || slideToIndex > swiper.slides.length - swiper.loopedSlides + slidesPerView / 2) {
                swiper.loopFix();
                slideToIndex = swiper.getSlideIndex(utils_elementChildren(slidesEl, `${slideSelector}[data-swiper-slide-index="${realIndex}"]`)[0]);
                utils_nextTick((() => {
                    swiper.slideTo(slideToIndex);
                }));
            } else swiper.slideTo(slideToIndex); else if (slideToIndex > swiper.slides.length - slidesPerView) {
                swiper.loopFix();
                slideToIndex = swiper.getSlideIndex(utils_elementChildren(slidesEl, `${slideSelector}[data-swiper-slide-index="${realIndex}"]`)[0]);
                utils_nextTick((() => {
                    swiper.slideTo(slideToIndex);
                }));
            } else swiper.slideTo(slideToIndex);
        } else swiper.slideTo(slideToIndex);
    }
    var slide = {
        slideTo,
        slideToLoop,
        slideNext,
        slidePrev,
        slideReset,
        slideToClosest,
        slideToClickedSlide
    };
    function loopCreate(slideRealIndex) {
        const swiper = this;
        const {params, slidesEl} = swiper;
        if (!params.loop || swiper.virtual && swiper.params.virtual.enabled) return;
        const initSlides = () => {
            const slides = utils_elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
            slides.forEach(((el, index) => {
                el.setAttribute("data-swiper-slide-index", index);
            }));
        };
        const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
        const slidesPerGroup = params.slidesPerGroup * (gridEnabled ? params.grid.rows : 1);
        const shouldFillGroup = swiper.slides.length % slidesPerGroup !== 0;
        const shouldFillGrid = gridEnabled && swiper.slides.length % params.grid.rows !== 0;
        const addBlankSlides = amountOfSlides => {
            for (let i = 0; i < amountOfSlides; i += 1) {
                const slideEl = swiper.isElement ? utils_createElement("swiper-slide", [ params.slideBlankClass ]) : utils_createElement("div", [ params.slideClass, params.slideBlankClass ]);
                swiper.slidesEl.append(slideEl);
            }
        };
        if (shouldFillGroup) {
            if (params.loopAddBlankSlides) {
                const slidesToAdd = slidesPerGroup - swiper.slides.length % slidesPerGroup;
                addBlankSlides(slidesToAdd);
                swiper.recalcSlides();
                swiper.updateSlides();
            } else showWarning("Swiper Loop Warning: The number of slides is not even to slidesPerGroup, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");
            initSlides();
        } else if (shouldFillGrid) {
            if (params.loopAddBlankSlides) {
                const slidesToAdd = params.grid.rows - swiper.slides.length % params.grid.rows;
                addBlankSlides(slidesToAdd);
                swiper.recalcSlides();
                swiper.updateSlides();
            } else showWarning("Swiper Loop Warning: The number of slides is not even to grid.rows, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");
            initSlides();
        } else initSlides();
        swiper.loopFix({
            slideRealIndex,
            direction: params.centeredSlides ? void 0 : "next"
        });
    }
    function loopFix(_temp) {
        let {slideRealIndex, slideTo = true, direction, setTranslate, activeSlideIndex, byController, byMousewheel} = _temp === void 0 ? {} : _temp;
        const swiper = this;
        if (!swiper.params.loop) return;
        swiper.emit("beforeLoopFix");
        const {slides, allowSlidePrev, allowSlideNext, slidesEl, params} = swiper;
        const {centeredSlides} = params;
        swiper.allowSlidePrev = true;
        swiper.allowSlideNext = true;
        if (swiper.virtual && params.virtual.enabled) {
            if (slideTo) if (!params.centeredSlides && swiper.snapIndex === 0) swiper.slideTo(swiper.virtual.slides.length, 0, false, true); else if (params.centeredSlides && swiper.snapIndex < params.slidesPerView) swiper.slideTo(swiper.virtual.slides.length + swiper.snapIndex, 0, false, true); else if (swiper.snapIndex === swiper.snapGrid.length - 1) swiper.slideTo(swiper.virtual.slidesBefore, 0, false, true);
            swiper.allowSlidePrev = allowSlidePrev;
            swiper.allowSlideNext = allowSlideNext;
            swiper.emit("loopFix");
            return;
        }
        let slidesPerView = params.slidesPerView;
        if (slidesPerView === "auto") slidesPerView = swiper.slidesPerViewDynamic(); else {
            slidesPerView = Math.ceil(parseFloat(params.slidesPerView, 10));
            if (centeredSlides && slidesPerView % 2 === 0) slidesPerView += 1;
        }
        const slidesPerGroup = params.slidesPerGroupAuto ? slidesPerView : params.slidesPerGroup;
        let loopedSlides = slidesPerGroup;
        if (loopedSlides % slidesPerGroup !== 0) loopedSlides += slidesPerGroup - loopedSlides % slidesPerGroup;
        loopedSlides += params.loopAdditionalSlides;
        swiper.loopedSlides = loopedSlides;
        const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
        if (slides.length < slidesPerView + loopedSlides) showWarning("Swiper Loop Warning: The number of slides is not enough for loop mode, it will be disabled and not function properly. You need to add more slides (or make duplicates) or lower the values of slidesPerView and slidesPerGroup parameters"); else if (gridEnabled && params.grid.fill === "row") showWarning("Swiper Loop Warning: Loop mode is not compatible with grid.fill = `row`");
        const prependSlidesIndexes = [];
        const appendSlidesIndexes = [];
        let activeIndex = swiper.activeIndex;
        if (typeof activeSlideIndex === "undefined") activeSlideIndex = swiper.getSlideIndex(slides.filter((el => el.classList.contains(params.slideActiveClass)))[0]); else activeIndex = activeSlideIndex;
        const isNext = direction === "next" || !direction;
        const isPrev = direction === "prev" || !direction;
        let slidesPrepended = 0;
        let slidesAppended = 0;
        const cols = gridEnabled ? Math.ceil(slides.length / params.grid.rows) : slides.length;
        const activeColIndex = gridEnabled ? slides[activeSlideIndex].column : activeSlideIndex;
        const activeColIndexWithShift = activeColIndex + (centeredSlides && typeof setTranslate === "undefined" ? -slidesPerView / 2 + .5 : 0);
        if (activeColIndexWithShift < loopedSlides) {
            slidesPrepended = Math.max(loopedSlides - activeColIndexWithShift, slidesPerGroup);
            for (let i = 0; i < loopedSlides - activeColIndexWithShift; i += 1) {
                const index = i - Math.floor(i / cols) * cols;
                if (gridEnabled) {
                    const colIndexToPrepend = cols - index - 1;
                    for (let i = slides.length - 1; i >= 0; i -= 1) if (slides[i].column === colIndexToPrepend) prependSlidesIndexes.push(i);
                } else prependSlidesIndexes.push(cols - index - 1);
            }
        } else if (activeColIndexWithShift + slidesPerView > cols - loopedSlides) {
            slidesAppended = Math.max(activeColIndexWithShift - (cols - loopedSlides * 2), slidesPerGroup);
            for (let i = 0; i < slidesAppended; i += 1) {
                const index = i - Math.floor(i / cols) * cols;
                if (gridEnabled) slides.forEach(((slide, slideIndex) => {
                    if (slide.column === index) appendSlidesIndexes.push(slideIndex);
                })); else appendSlidesIndexes.push(index);
            }
        }
        swiper.__preventObserver__ = true;
        requestAnimationFrame((() => {
            swiper.__preventObserver__ = false;
        }));
        if (isPrev) prependSlidesIndexes.forEach((index => {
            slides[index].swiperLoopMoveDOM = true;
            slidesEl.prepend(slides[index]);
            slides[index].swiperLoopMoveDOM = false;
        }));
        if (isNext) appendSlidesIndexes.forEach((index => {
            slides[index].swiperLoopMoveDOM = true;
            slidesEl.append(slides[index]);
            slides[index].swiperLoopMoveDOM = false;
        }));
        swiper.recalcSlides();
        if (params.slidesPerView === "auto") swiper.updateSlides(); else if (gridEnabled && (prependSlidesIndexes.length > 0 && isPrev || appendSlidesIndexes.length > 0 && isNext)) swiper.slides.forEach(((slide, slideIndex) => {
            swiper.grid.updateSlide(slideIndex, slide, swiper.slides);
        }));
        if (params.watchSlidesProgress) swiper.updateSlidesOffset();
        if (slideTo) if (prependSlidesIndexes.length > 0 && isPrev) {
            if (typeof slideRealIndex === "undefined") {
                const currentSlideTranslate = swiper.slidesGrid[activeIndex];
                const newSlideTranslate = swiper.slidesGrid[activeIndex + slidesPrepended];
                const diff = newSlideTranslate - currentSlideTranslate;
                if (byMousewheel) swiper.setTranslate(swiper.translate - diff); else {
                    swiper.slideTo(activeIndex + Math.ceil(slidesPrepended), 0, false, true);
                    if (setTranslate) {
                        swiper.touchEventsData.startTranslate = swiper.touchEventsData.startTranslate - diff;
                        swiper.touchEventsData.currentTranslate = swiper.touchEventsData.currentTranslate - diff;
                    }
                }
            } else if (setTranslate) {
                const shift = gridEnabled ? prependSlidesIndexes.length / params.grid.rows : prependSlidesIndexes.length;
                swiper.slideTo(swiper.activeIndex + shift, 0, false, true);
                swiper.touchEventsData.currentTranslate = swiper.translate;
            }
        } else if (appendSlidesIndexes.length > 0 && isNext) if (typeof slideRealIndex === "undefined") {
            const currentSlideTranslate = swiper.slidesGrid[activeIndex];
            const newSlideTranslate = swiper.slidesGrid[activeIndex - slidesAppended];
            const diff = newSlideTranslate - currentSlideTranslate;
            if (byMousewheel) swiper.setTranslate(swiper.translate - diff); else {
                swiper.slideTo(activeIndex - slidesAppended, 0, false, true);
                if (setTranslate) {
                    swiper.touchEventsData.startTranslate = swiper.touchEventsData.startTranslate - diff;
                    swiper.touchEventsData.currentTranslate = swiper.touchEventsData.currentTranslate - diff;
                }
            }
        } else {
            const shift = gridEnabled ? appendSlidesIndexes.length / params.grid.rows : appendSlidesIndexes.length;
            swiper.slideTo(swiper.activeIndex - shift, 0, false, true);
        }
        swiper.allowSlidePrev = allowSlidePrev;
        swiper.allowSlideNext = allowSlideNext;
        if (swiper.controller && swiper.controller.control && !byController) {
            const loopParams = {
                slideRealIndex,
                direction,
                setTranslate,
                activeSlideIndex,
                byController: true
            };
            if (Array.isArray(swiper.controller.control)) swiper.controller.control.forEach((c => {
                if (!c.destroyed && c.params.loop) c.loopFix({
                    ...loopParams,
                    slideTo: c.params.slidesPerView === params.slidesPerView ? slideTo : false
                });
            })); else if (swiper.controller.control instanceof swiper.constructor && swiper.controller.control.params.loop) swiper.controller.control.loopFix({
                ...loopParams,
                slideTo: swiper.controller.control.params.slidesPerView === params.slidesPerView ? slideTo : false
            });
        }
        swiper.emit("loopFix");
    }
    function loopDestroy() {
        const swiper = this;
        const {params, slidesEl} = swiper;
        if (!params.loop || swiper.virtual && swiper.params.virtual.enabled) return;
        swiper.recalcSlides();
        const newSlidesOrder = [];
        swiper.slides.forEach((slideEl => {
            const index = typeof slideEl.swiperSlideIndex === "undefined" ? slideEl.getAttribute("data-swiper-slide-index") * 1 : slideEl.swiperSlideIndex;
            newSlidesOrder[index] = slideEl;
        }));
        swiper.slides.forEach((slideEl => {
            slideEl.removeAttribute("data-swiper-slide-index");
        }));
        newSlidesOrder.forEach((slideEl => {
            slidesEl.append(slideEl);
        }));
        swiper.recalcSlides();
        swiper.slideTo(swiper.realIndex, 0);
    }
    var loop = {
        loopCreate,
        loopFix,
        loopDestroy
    };
    function setGrabCursor(moving) {
        const swiper = this;
        if (!swiper.params.simulateTouch || swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) return;
        const el = swiper.params.touchEventsTarget === "container" ? swiper.el : swiper.wrapperEl;
        if (swiper.isElement) swiper.__preventObserver__ = true;
        el.style.cursor = "move";
        el.style.cursor = moving ? "grabbing" : "grab";
        if (swiper.isElement) requestAnimationFrame((() => {
            swiper.__preventObserver__ = false;
        }));
    }
    function unsetGrabCursor() {
        const swiper = this;
        if (swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) return;
        if (swiper.isElement) swiper.__preventObserver__ = true;
        swiper[swiper.params.touchEventsTarget === "container" ? "el" : "wrapperEl"].style.cursor = "";
        if (swiper.isElement) requestAnimationFrame((() => {
            swiper.__preventObserver__ = false;
        }));
    }
    var grabCursor = {
        setGrabCursor,
        unsetGrabCursor
    };
    function closestElement(selector, base) {
        if (base === void 0) base = this;
        function __closestFrom(el) {
            if (!el || el === ssr_window_esm_getDocument() || el === ssr_window_esm_getWindow()) return null;
            if (el.assignedSlot) el = el.assignedSlot;
            const found = el.closest(selector);
            if (!found && !el.getRootNode) return null;
            return found || __closestFrom(el.getRootNode().host);
        }
        return __closestFrom(base);
    }
    function preventEdgeSwipe(swiper, event, startX) {
        const window = ssr_window_esm_getWindow();
        const {params} = swiper;
        const edgeSwipeDetection = params.edgeSwipeDetection;
        const edgeSwipeThreshold = params.edgeSwipeThreshold;
        if (edgeSwipeDetection && (startX <= edgeSwipeThreshold || startX >= window.innerWidth - edgeSwipeThreshold)) {
            if (edgeSwipeDetection === "prevent") {
                event.preventDefault();
                return true;
            }
            return false;
        }
        return true;
    }
    function onTouchStart(event) {
        const swiper = this;
        const document = ssr_window_esm_getDocument();
        let e = event;
        if (e.originalEvent) e = e.originalEvent;
        const data = swiper.touchEventsData;
        if (e.type === "pointerdown") {
            if (data.pointerId !== null && data.pointerId !== e.pointerId) return;
            data.pointerId = e.pointerId;
        } else if (e.type === "touchstart" && e.targetTouches.length === 1) data.touchId = e.targetTouches[0].identifier;
        if (e.type === "touchstart") {
            preventEdgeSwipe(swiper, e, e.targetTouches[0].pageX);
            return;
        }
        const {params, touches, enabled} = swiper;
        if (!enabled) return;
        if (!params.simulateTouch && e.pointerType === "mouse") return;
        if (swiper.animating && params.preventInteractionOnTransition) return;
        if (!swiper.animating && params.cssMode && params.loop) swiper.loopFix();
        let targetEl = e.target;
        if (params.touchEventsTarget === "wrapper") if (!elementIsChildOf(targetEl, swiper.wrapperEl)) return;
        if ("which" in e && e.which === 3) return;
        if ("button" in e && e.button > 0) return;
        if (data.isTouched && data.isMoved) return;
        const swipingClassHasValue = !!params.noSwipingClass && params.noSwipingClass !== "";
        const eventPath = e.composedPath ? e.composedPath() : e.path;
        if (swipingClassHasValue && e.target && e.target.shadowRoot && eventPath) targetEl = eventPath[0];
        const noSwipingSelector = params.noSwipingSelector ? params.noSwipingSelector : `.${params.noSwipingClass}`;
        const isTargetShadow = !!(e.target && e.target.shadowRoot);
        if (params.noSwiping && (isTargetShadow ? closestElement(noSwipingSelector, targetEl) : targetEl.closest(noSwipingSelector))) {
            swiper.allowClick = true;
            return;
        }
        if (params.swipeHandler) if (!targetEl.closest(params.swipeHandler)) return;
        touches.currentX = e.pageX;
        touches.currentY = e.pageY;
        const startX = touches.currentX;
        const startY = touches.currentY;
        if (!preventEdgeSwipe(swiper, e, startX)) return;
        Object.assign(data, {
            isTouched: true,
            isMoved: false,
            allowTouchCallbacks: true,
            isScrolling: void 0,
            startMoving: void 0
        });
        touches.startX = startX;
        touches.startY = startY;
        data.touchStartTime = now();
        swiper.allowClick = true;
        swiper.updateSize();
        swiper.swipeDirection = void 0;
        if (params.threshold > 0) data.allowThresholdMove = false;
        let preventDefault = true;
        if (targetEl.matches(data.focusableElements)) {
            preventDefault = false;
            if (targetEl.nodeName === "SELECT") data.isTouched = false;
        }
        if (document.activeElement && document.activeElement.matches(data.focusableElements) && document.activeElement !== targetEl) document.activeElement.blur();
        const shouldPreventDefault = preventDefault && swiper.allowTouchMove && params.touchStartPreventDefault;
        if ((params.touchStartForcePreventDefault || shouldPreventDefault) && !targetEl.isContentEditable) e.preventDefault();
        if (params.freeMode && params.freeMode.enabled && swiper.freeMode && swiper.animating && !params.cssMode) swiper.freeMode.onTouchStart();
        swiper.emit("touchStart", e);
    }
    function onTouchMove(event) {
        const document = ssr_window_esm_getDocument();
        const swiper = this;
        const data = swiper.touchEventsData;
        const {params, touches, rtlTranslate: rtl, enabled} = swiper;
        if (!enabled) return;
        if (!params.simulateTouch && event.pointerType === "mouse") return;
        let e = event;
        if (e.originalEvent) e = e.originalEvent;
        if (e.type === "pointermove") {
            if (data.touchId !== null) return;
            const id = e.pointerId;
            if (id !== data.pointerId) return;
        }
        let targetTouch;
        if (e.type === "touchmove") {
            targetTouch = [ ...e.changedTouches ].filter((t => t.identifier === data.touchId))[0];
            if (!targetTouch || targetTouch.identifier !== data.touchId) return;
        } else targetTouch = e;
        if (!data.isTouched) {
            if (data.startMoving && data.isScrolling) swiper.emit("touchMoveOpposite", e);
            return;
        }
        const pageX = targetTouch.pageX;
        const pageY = targetTouch.pageY;
        if (e.preventedByNestedSwiper) {
            touches.startX = pageX;
            touches.startY = pageY;
            return;
        }
        if (!swiper.allowTouchMove) {
            if (!e.target.matches(data.focusableElements)) swiper.allowClick = false;
            if (data.isTouched) {
                Object.assign(touches, {
                    startX: pageX,
                    startY: pageY,
                    currentX: pageX,
                    currentY: pageY
                });
                data.touchStartTime = now();
            }
            return;
        }
        if (params.touchReleaseOnEdges && !params.loop) if (swiper.isVertical()) {
            if (pageY < touches.startY && swiper.translate <= swiper.maxTranslate() || pageY > touches.startY && swiper.translate >= swiper.minTranslate()) {
                data.isTouched = false;
                data.isMoved = false;
                return;
            }
        } else if (pageX < touches.startX && swiper.translate <= swiper.maxTranslate() || pageX > touches.startX && swiper.translate >= swiper.minTranslate()) return;
        if (document.activeElement) if (e.target === document.activeElement && e.target.matches(data.focusableElements)) {
            data.isMoved = true;
            swiper.allowClick = false;
            return;
        }
        if (data.allowTouchCallbacks) swiper.emit("touchMove", e);
        touches.previousX = touches.currentX;
        touches.previousY = touches.currentY;
        touches.currentX = pageX;
        touches.currentY = pageY;
        const diffX = touches.currentX - touches.startX;
        const diffY = touches.currentY - touches.startY;
        if (swiper.params.threshold && Math.sqrt(diffX ** 2 + diffY ** 2) < swiper.params.threshold) return;
        if (typeof data.isScrolling === "undefined") {
            let touchAngle;
            if (swiper.isHorizontal() && touches.currentY === touches.startY || swiper.isVertical() && touches.currentX === touches.startX) data.isScrolling = false; else if (diffX * diffX + diffY * diffY >= 25) {
                touchAngle = Math.atan2(Math.abs(diffY), Math.abs(diffX)) * 180 / Math.PI;
                data.isScrolling = swiper.isHorizontal() ? touchAngle > params.touchAngle : 90 - touchAngle > params.touchAngle;
            }
        }
        if (data.isScrolling) swiper.emit("touchMoveOpposite", e);
        if (typeof data.startMoving === "undefined") if (touches.currentX !== touches.startX || touches.currentY !== touches.startY) data.startMoving = true;
        if (data.isScrolling || e.type === "touchmove" && data.preventTouchMoveFromPointerMove) {
            data.isTouched = false;
            return;
        }
        if (!data.startMoving) return;
        swiper.allowClick = false;
        if (!params.cssMode && e.cancelable) e.preventDefault();
        if (params.touchMoveStopPropagation && !params.nested) e.stopPropagation();
        let diff = swiper.isHorizontal() ? diffX : diffY;
        let touchesDiff = swiper.isHorizontal() ? touches.currentX - touches.previousX : touches.currentY - touches.previousY;
        if (params.oneWayMovement) {
            diff = Math.abs(diff) * (rtl ? 1 : -1);
            touchesDiff = Math.abs(touchesDiff) * (rtl ? 1 : -1);
        }
        touches.diff = diff;
        diff *= params.touchRatio;
        if (rtl) {
            diff = -diff;
            touchesDiff = -touchesDiff;
        }
        const prevTouchesDirection = swiper.touchesDirection;
        swiper.swipeDirection = diff > 0 ? "prev" : "next";
        swiper.touchesDirection = touchesDiff > 0 ? "prev" : "next";
        const isLoop = swiper.params.loop && !params.cssMode;
        const allowLoopFix = swiper.touchesDirection === "next" && swiper.allowSlideNext || swiper.touchesDirection === "prev" && swiper.allowSlidePrev;
        if (!data.isMoved) {
            if (isLoop && allowLoopFix) swiper.loopFix({
                direction: swiper.swipeDirection
            });
            data.startTranslate = swiper.getTranslate();
            swiper.setTransition(0);
            if (swiper.animating) {
                const evt = new window.CustomEvent("transitionend", {
                    bubbles: true,
                    cancelable: true,
                    detail: {
                        bySwiperTouchMove: true
                    }
                });
                swiper.wrapperEl.dispatchEvent(evt);
            }
            data.allowMomentumBounce = false;
            if (params.grabCursor && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) swiper.setGrabCursor(true);
            swiper.emit("sliderFirstMove", e);
        }
        let loopFixed;
        (new Date).getTime();
        if (data.isMoved && data.allowThresholdMove && prevTouchesDirection !== swiper.touchesDirection && isLoop && allowLoopFix && Math.abs(diff) >= 1) {
            Object.assign(touches, {
                startX: pageX,
                startY: pageY,
                currentX: pageX,
                currentY: pageY,
                startTranslate: data.currentTranslate
            });
            data.loopSwapReset = true;
            data.startTranslate = data.currentTranslate;
            return;
        }
        swiper.emit("sliderMove", e);
        data.isMoved = true;
        data.currentTranslate = diff + data.startTranslate;
        let disableParentSwiper = true;
        let resistanceRatio = params.resistanceRatio;
        if (params.touchReleaseOnEdges) resistanceRatio = 0;
        if (diff > 0) {
            if (isLoop && allowLoopFix && !loopFixed && data.allowThresholdMove && data.currentTranslate > (params.centeredSlides ? swiper.minTranslate() - swiper.slidesSizesGrid[swiper.activeIndex + 1] : swiper.minTranslate())) swiper.loopFix({
                direction: "prev",
                setTranslate: true,
                activeSlideIndex: 0
            });
            if (data.currentTranslate > swiper.minTranslate()) {
                disableParentSwiper = false;
                if (params.resistance) data.currentTranslate = swiper.minTranslate() - 1 + (-swiper.minTranslate() + data.startTranslate + diff) ** resistanceRatio;
            }
        } else if (diff < 0) {
            if (isLoop && allowLoopFix && !loopFixed && data.allowThresholdMove && data.currentTranslate < (params.centeredSlides ? swiper.maxTranslate() + swiper.slidesSizesGrid[swiper.slidesSizesGrid.length - 1] : swiper.maxTranslate())) swiper.loopFix({
                direction: "next",
                setTranslate: true,
                activeSlideIndex: swiper.slides.length - (params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : Math.ceil(parseFloat(params.slidesPerView, 10)))
            });
            if (data.currentTranslate < swiper.maxTranslate()) {
                disableParentSwiper = false;
                if (params.resistance) data.currentTranslate = swiper.maxTranslate() + 1 - (swiper.maxTranslate() - data.startTranslate - diff) ** resistanceRatio;
            }
        }
        if (disableParentSwiper) e.preventedByNestedSwiper = true;
        if (!swiper.allowSlideNext && swiper.swipeDirection === "next" && data.currentTranslate < data.startTranslate) data.currentTranslate = data.startTranslate;
        if (!swiper.allowSlidePrev && swiper.swipeDirection === "prev" && data.currentTranslate > data.startTranslate) data.currentTranslate = data.startTranslate;
        if (!swiper.allowSlidePrev && !swiper.allowSlideNext) data.currentTranslate = data.startTranslate;
        if (params.threshold > 0) if (Math.abs(diff) > params.threshold || data.allowThresholdMove) {
            if (!data.allowThresholdMove) {
                data.allowThresholdMove = true;
                touches.startX = touches.currentX;
                touches.startY = touches.currentY;
                data.currentTranslate = data.startTranslate;
                touches.diff = swiper.isHorizontal() ? touches.currentX - touches.startX : touches.currentY - touches.startY;
                return;
            }
        } else {
            data.currentTranslate = data.startTranslate;
            return;
        }
        if (!params.followFinger || params.cssMode) return;
        if (params.freeMode && params.freeMode.enabled && swiper.freeMode || params.watchSlidesProgress) {
            swiper.updateActiveIndex();
            swiper.updateSlidesClasses();
        }
        if (params.freeMode && params.freeMode.enabled && swiper.freeMode) swiper.freeMode.onTouchMove();
        swiper.updateProgress(data.currentTranslate);
        swiper.setTranslate(data.currentTranslate);
    }
    function onTouchEnd(event) {
        const swiper = this;
        const data = swiper.touchEventsData;
        let e = event;
        if (e.originalEvent) e = e.originalEvent;
        let targetTouch;
        const isTouchEvent = e.type === "touchend" || e.type === "touchcancel";
        if (!isTouchEvent) {
            if (data.touchId !== null) return;
            if (e.pointerId !== data.pointerId) return;
            targetTouch = e;
        } else {
            targetTouch = [ ...e.changedTouches ].filter((t => t.identifier === data.touchId))[0];
            if (!targetTouch || targetTouch.identifier !== data.touchId) return;
        }
        if ([ "pointercancel", "pointerout", "pointerleave", "contextmenu" ].includes(e.type)) {
            const proceed = [ "pointercancel", "contextmenu" ].includes(e.type) && (swiper.browser.isSafari || swiper.browser.isWebView);
            if (!proceed) return;
        }
        data.pointerId = null;
        data.touchId = null;
        const {params, touches, rtlTranslate: rtl, slidesGrid, enabled} = swiper;
        if (!enabled) return;
        if (!params.simulateTouch && e.pointerType === "mouse") return;
        if (data.allowTouchCallbacks) swiper.emit("touchEnd", e);
        data.allowTouchCallbacks = false;
        if (!data.isTouched) {
            if (data.isMoved && params.grabCursor) swiper.setGrabCursor(false);
            data.isMoved = false;
            data.startMoving = false;
            return;
        }
        if (params.grabCursor && data.isMoved && data.isTouched && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) swiper.setGrabCursor(false);
        const touchEndTime = now();
        const timeDiff = touchEndTime - data.touchStartTime;
        if (swiper.allowClick) {
            const pathTree = e.path || e.composedPath && e.composedPath();
            swiper.updateClickedSlide(pathTree && pathTree[0] || e.target, pathTree);
            swiper.emit("tap click", e);
            if (timeDiff < 300 && touchEndTime - data.lastClickTime < 300) swiper.emit("doubleTap doubleClick", e);
        }
        data.lastClickTime = now();
        utils_nextTick((() => {
            if (!swiper.destroyed) swiper.allowClick = true;
        }));
        if (!data.isTouched || !data.isMoved || !swiper.swipeDirection || touches.diff === 0 && !data.loopSwapReset || data.currentTranslate === data.startTranslate && !data.loopSwapReset) {
            data.isTouched = false;
            data.isMoved = false;
            data.startMoving = false;
            return;
        }
        data.isTouched = false;
        data.isMoved = false;
        data.startMoving = false;
        let currentPos;
        if (params.followFinger) currentPos = rtl ? swiper.translate : -swiper.translate; else currentPos = -data.currentTranslate;
        if (params.cssMode) return;
        if (params.freeMode && params.freeMode.enabled) {
            swiper.freeMode.onTouchEnd({
                currentPos
            });
            return;
        }
        const swipeToLast = currentPos >= -swiper.maxTranslate() && !swiper.params.loop;
        let stopIndex = 0;
        let groupSize = swiper.slidesSizesGrid[0];
        for (let i = 0; i < slidesGrid.length; i += i < params.slidesPerGroupSkip ? 1 : params.slidesPerGroup) {
            const increment = i < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
            if (typeof slidesGrid[i + increment] !== "undefined") {
                if (swipeToLast || currentPos >= slidesGrid[i] && currentPos < slidesGrid[i + increment]) {
                    stopIndex = i;
                    groupSize = slidesGrid[i + increment] - slidesGrid[i];
                }
            } else if (swipeToLast || currentPos >= slidesGrid[i]) {
                stopIndex = i;
                groupSize = slidesGrid[slidesGrid.length - 1] - slidesGrid[slidesGrid.length - 2];
            }
        }
        let rewindFirstIndex = null;
        let rewindLastIndex = null;
        if (params.rewind) if (swiper.isBeginning) rewindLastIndex = params.virtual && params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1; else if (swiper.isEnd) rewindFirstIndex = 0;
        const ratio = (currentPos - slidesGrid[stopIndex]) / groupSize;
        const increment = stopIndex < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
        if (timeDiff > params.longSwipesMs) {
            if (!params.longSwipes) {
                swiper.slideTo(swiper.activeIndex);
                return;
            }
            if (swiper.swipeDirection === "next") if (ratio >= params.longSwipesRatio) swiper.slideTo(params.rewind && swiper.isEnd ? rewindFirstIndex : stopIndex + increment); else swiper.slideTo(stopIndex);
            if (swiper.swipeDirection === "prev") if (ratio > 1 - params.longSwipesRatio) swiper.slideTo(stopIndex + increment); else if (rewindLastIndex !== null && ratio < 0 && Math.abs(ratio) > params.longSwipesRatio) swiper.slideTo(rewindLastIndex); else swiper.slideTo(stopIndex);
        } else {
            if (!params.shortSwipes) {
                swiper.slideTo(swiper.activeIndex);
                return;
            }
            const isNavButtonTarget = swiper.navigation && (e.target === swiper.navigation.nextEl || e.target === swiper.navigation.prevEl);
            if (!isNavButtonTarget) {
                if (swiper.swipeDirection === "next") swiper.slideTo(rewindFirstIndex !== null ? rewindFirstIndex : stopIndex + increment);
                if (swiper.swipeDirection === "prev") swiper.slideTo(rewindLastIndex !== null ? rewindLastIndex : stopIndex);
            } else if (e.target === swiper.navigation.nextEl) swiper.slideTo(stopIndex + increment); else swiper.slideTo(stopIndex);
        }
    }
    function onResize() {
        const swiper = this;
        const {params, el} = swiper;
        if (el && el.offsetWidth === 0) return;
        if (params.breakpoints) swiper.setBreakpoint();
        const {allowSlideNext, allowSlidePrev, snapGrid} = swiper;
        const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
        swiper.allowSlideNext = true;
        swiper.allowSlidePrev = true;
        swiper.updateSize();
        swiper.updateSlides();
        swiper.updateSlidesClasses();
        const isVirtualLoop = isVirtual && params.loop;
        if ((params.slidesPerView === "auto" || params.slidesPerView > 1) && swiper.isEnd && !swiper.isBeginning && !swiper.params.centeredSlides && !isVirtualLoop) swiper.slideTo(swiper.slides.length - 1, 0, false, true); else if (swiper.params.loop && !isVirtual) swiper.slideToLoop(swiper.realIndex, 0, false, true); else swiper.slideTo(swiper.activeIndex, 0, false, true);
        if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
            clearTimeout(swiper.autoplay.resizeTimeout);
            swiper.autoplay.resizeTimeout = setTimeout((() => {
                if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) swiper.autoplay.resume();
            }), 500);
        }
        swiper.allowSlidePrev = allowSlidePrev;
        swiper.allowSlideNext = allowSlideNext;
        if (swiper.params.watchOverflow && snapGrid !== swiper.snapGrid) swiper.checkOverflow();
    }
    function onClick(e) {
        const swiper = this;
        if (!swiper.enabled) return;
        if (!swiper.allowClick) {
            if (swiper.params.preventClicks) e.preventDefault();
            if (swiper.params.preventClicksPropagation && swiper.animating) {
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        }
    }
    function onScroll() {
        const swiper = this;
        const {wrapperEl, rtlTranslate, enabled} = swiper;
        if (!enabled) return;
        swiper.previousTranslate = swiper.translate;
        if (swiper.isHorizontal()) swiper.translate = -wrapperEl.scrollLeft; else swiper.translate = -wrapperEl.scrollTop;
        if (swiper.translate === 0) swiper.translate = 0;
        swiper.updateActiveIndex();
        swiper.updateSlidesClasses();
        let newProgress;
        const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
        if (translatesDiff === 0) newProgress = 0; else newProgress = (swiper.translate - swiper.minTranslate()) / translatesDiff;
        if (newProgress !== swiper.progress) swiper.updateProgress(rtlTranslate ? -swiper.translate : swiper.translate);
        swiper.emit("setTranslate", swiper.translate, false);
    }
    function onLoad(e) {
        const swiper = this;
        processLazyPreloader(swiper, e.target);
        if (swiper.params.cssMode || swiper.params.slidesPerView !== "auto" && !swiper.params.autoHeight) return;
        swiper.update();
    }
    function onDocumentTouchStart() {
        const swiper = this;
        if (swiper.documentTouchHandlerProceeded) return;
        swiper.documentTouchHandlerProceeded = true;
        if (swiper.params.touchReleaseOnEdges) swiper.el.style.touchAction = "auto";
    }
    const events = (swiper, method) => {
        const document = ssr_window_esm_getDocument();
        const {params, el, wrapperEl, device} = swiper;
        const capture = !!params.nested;
        const domMethod = method === "on" ? "addEventListener" : "removeEventListener";
        const swiperMethod = method;
        if (!el || typeof el === "string") return;
        document[domMethod]("touchstart", swiper.onDocumentTouchStart, {
            passive: false,
            capture
        });
        el[domMethod]("touchstart", swiper.onTouchStart, {
            passive: false
        });
        el[domMethod]("pointerdown", swiper.onTouchStart, {
            passive: false
        });
        document[domMethod]("touchmove", swiper.onTouchMove, {
            passive: false,
            capture
        });
        document[domMethod]("pointermove", swiper.onTouchMove, {
            passive: false,
            capture
        });
        document[domMethod]("touchend", swiper.onTouchEnd, {
            passive: true
        });
        document[domMethod]("pointerup", swiper.onTouchEnd, {
            passive: true
        });
        document[domMethod]("pointercancel", swiper.onTouchEnd, {
            passive: true
        });
        document[domMethod]("touchcancel", swiper.onTouchEnd, {
            passive: true
        });
        document[domMethod]("pointerout", swiper.onTouchEnd, {
            passive: true
        });
        document[domMethod]("pointerleave", swiper.onTouchEnd, {
            passive: true
        });
        document[domMethod]("contextmenu", swiper.onTouchEnd, {
            passive: true
        });
        if (params.preventClicks || params.preventClicksPropagation) el[domMethod]("click", swiper.onClick, true);
        if (params.cssMode) wrapperEl[domMethod]("scroll", swiper.onScroll);
        if (params.updateOnWindowResize) swiper[swiperMethod](device.ios || device.android ? "resize orientationchange observerUpdate" : "resize observerUpdate", onResize, true); else swiper[swiperMethod]("observerUpdate", onResize, true);
        el[domMethod]("load", swiper.onLoad, {
            capture: true
        });
    };
    function attachEvents() {
        const swiper = this;
        const {params} = swiper;
        swiper.onTouchStart = onTouchStart.bind(swiper);
        swiper.onTouchMove = onTouchMove.bind(swiper);
        swiper.onTouchEnd = onTouchEnd.bind(swiper);
        swiper.onDocumentTouchStart = onDocumentTouchStart.bind(swiper);
        if (params.cssMode) swiper.onScroll = onScroll.bind(swiper);
        swiper.onClick = onClick.bind(swiper);
        swiper.onLoad = onLoad.bind(swiper);
        events(swiper, "on");
    }
    function detachEvents() {
        const swiper = this;
        events(swiper, "off");
    }
    var events$1 = {
        attachEvents,
        detachEvents
    };
    const isGridEnabled = (swiper, params) => swiper.grid && params.grid && params.grid.rows > 1;
    function setBreakpoint() {
        const swiper = this;
        const {realIndex, initialized, params, el} = swiper;
        const breakpoints = params.breakpoints;
        if (!breakpoints || breakpoints && Object.keys(breakpoints).length === 0) return;
        const breakpoint = swiper.getBreakpoint(breakpoints, swiper.params.breakpointsBase, swiper.el);
        if (!breakpoint || swiper.currentBreakpoint === breakpoint) return;
        const breakpointOnlyParams = breakpoint in breakpoints ? breakpoints[breakpoint] : void 0;
        const breakpointParams = breakpointOnlyParams || swiper.originalParams;
        const wasMultiRow = isGridEnabled(swiper, params);
        const isMultiRow = isGridEnabled(swiper, breakpointParams);
        const wasGrabCursor = swiper.params.grabCursor;
        const isGrabCursor = breakpointParams.grabCursor;
        const wasEnabled = params.enabled;
        if (wasMultiRow && !isMultiRow) {
            el.classList.remove(`${params.containerModifierClass}grid`, `${params.containerModifierClass}grid-column`);
            swiper.emitContainerClasses();
        } else if (!wasMultiRow && isMultiRow) {
            el.classList.add(`${params.containerModifierClass}grid`);
            if (breakpointParams.grid.fill && breakpointParams.grid.fill === "column" || !breakpointParams.grid.fill && params.grid.fill === "column") el.classList.add(`${params.containerModifierClass}grid-column`);
            swiper.emitContainerClasses();
        }
        if (wasGrabCursor && !isGrabCursor) swiper.unsetGrabCursor(); else if (!wasGrabCursor && isGrabCursor) swiper.setGrabCursor();
        [ "navigation", "pagination", "scrollbar" ].forEach((prop => {
            if (typeof breakpointParams[prop] === "undefined") return;
            const wasModuleEnabled = params[prop] && params[prop].enabled;
            const isModuleEnabled = breakpointParams[prop] && breakpointParams[prop].enabled;
            if (wasModuleEnabled && !isModuleEnabled) swiper[prop].disable();
            if (!wasModuleEnabled && isModuleEnabled) swiper[prop].enable();
        }));
        const directionChanged = breakpointParams.direction && breakpointParams.direction !== params.direction;
        const needsReLoop = params.loop && (breakpointParams.slidesPerView !== params.slidesPerView || directionChanged);
        const wasLoop = params.loop;
        if (directionChanged && initialized) swiper.changeDirection();
        utils_extend(swiper.params, breakpointParams);
        const isEnabled = swiper.params.enabled;
        const hasLoop = swiper.params.loop;
        Object.assign(swiper, {
            allowTouchMove: swiper.params.allowTouchMove,
            allowSlideNext: swiper.params.allowSlideNext,
            allowSlidePrev: swiper.params.allowSlidePrev
        });
        if (wasEnabled && !isEnabled) swiper.disable(); else if (!wasEnabled && isEnabled) swiper.enable();
        swiper.currentBreakpoint = breakpoint;
        swiper.emit("_beforeBreakpoint", breakpointParams);
        if (initialized) if (needsReLoop) {
            swiper.loopDestroy();
            swiper.loopCreate(realIndex);
            swiper.updateSlides();
        } else if (!wasLoop && hasLoop) {
            swiper.loopCreate(realIndex);
            swiper.updateSlides();
        } else if (wasLoop && !hasLoop) swiper.loopDestroy();
        swiper.emit("breakpoint", breakpointParams);
    }
    function getBreakpoint(breakpoints, base, containerEl) {
        if (base === void 0) base = "window";
        if (!breakpoints || base === "container" && !containerEl) return;
        let breakpoint = false;
        const window = ssr_window_esm_getWindow();
        const currentHeight = base === "window" ? window.innerHeight : containerEl.clientHeight;
        const points = Object.keys(breakpoints).map((point => {
            if (typeof point === "string" && point.indexOf("@") === 0) {
                const minRatio = parseFloat(point.substr(1));
                const value = currentHeight * minRatio;
                return {
                    value,
                    point
                };
            }
            return {
                value: point,
                point
            };
        }));
        points.sort(((a, b) => parseInt(a.value, 10) - parseInt(b.value, 10)));
        for (let i = 0; i < points.length; i += 1) {
            const {point, value} = points[i];
            if (base === "window") {
                if (window.matchMedia(`(min-width: ${value}px)`).matches) breakpoint = point;
            } else if (value <= containerEl.clientWidth) breakpoint = point;
        }
        return breakpoint || "max";
    }
    var breakpoints = {
        setBreakpoint,
        getBreakpoint
    };
    function prepareClasses(entries, prefix) {
        const resultClasses = [];
        entries.forEach((item => {
            if (typeof item === "object") Object.keys(item).forEach((classNames => {
                if (item[classNames]) resultClasses.push(prefix + classNames);
            })); else if (typeof item === "string") resultClasses.push(prefix + item);
        }));
        return resultClasses;
    }
    function addClasses() {
        const swiper = this;
        const {classNames, params, rtl, el, device} = swiper;
        const suffixes = prepareClasses([ "initialized", params.direction, {
            "free-mode": swiper.params.freeMode && params.freeMode.enabled
        }, {
            autoheight: params.autoHeight
        }, {
            rtl
        }, {
            grid: params.grid && params.grid.rows > 1
        }, {
            "grid-column": params.grid && params.grid.rows > 1 && params.grid.fill === "column"
        }, {
            android: device.android
        }, {
            ios: device.ios
        }, {
            "css-mode": params.cssMode
        }, {
            centered: params.cssMode && params.centeredSlides
        }, {
            "watch-progress": params.watchSlidesProgress
        } ], params.containerModifierClass);
        classNames.push(...suffixes);
        el.classList.add(...classNames);
        swiper.emitContainerClasses();
    }
    function swiper_core_removeClasses() {
        const swiper = this;
        const {el, classNames} = swiper;
        if (!el || typeof el === "string") return;
        el.classList.remove(...classNames);
        swiper.emitContainerClasses();
    }
    var classes = {
        addClasses,
        removeClasses: swiper_core_removeClasses
    };
    function checkOverflow() {
        const swiper = this;
        const {isLocked: wasLocked, params} = swiper;
        const {slidesOffsetBefore} = params;
        if (slidesOffsetBefore) {
            const lastSlideIndex = swiper.slides.length - 1;
            const lastSlideRightEdge = swiper.slidesGrid[lastSlideIndex] + swiper.slidesSizesGrid[lastSlideIndex] + slidesOffsetBefore * 2;
            swiper.isLocked = swiper.size > lastSlideRightEdge;
        } else swiper.isLocked = swiper.snapGrid.length === 1;
        if (params.allowSlideNext === true) swiper.allowSlideNext = !swiper.isLocked;
        if (params.allowSlidePrev === true) swiper.allowSlidePrev = !swiper.isLocked;
        if (wasLocked && wasLocked !== swiper.isLocked) swiper.isEnd = false;
        if (wasLocked !== swiper.isLocked) swiper.emit(swiper.isLocked ? "lock" : "unlock");
    }
    var checkOverflow$1 = {
        checkOverflow
    };
    var defaults = {
        init: true,
        direction: "horizontal",
        oneWayMovement: false,
        swiperElementNodeName: "SWIPER-CONTAINER",
        touchEventsTarget: "wrapper",
        initialSlide: 0,
        speed: 300,
        cssMode: false,
        updateOnWindowResize: true,
        resizeObserver: true,
        nested: false,
        createElements: false,
        eventsPrefix: "swiper",
        enabled: true,
        focusableElements: "input, select, option, textarea, button, video, label",
        width: null,
        height: null,
        preventInteractionOnTransition: false,
        userAgent: null,
        url: null,
        edgeSwipeDetection: false,
        edgeSwipeThreshold: 20,
        autoHeight: false,
        setWrapperSize: false,
        virtualTranslate: false,
        effect: "slide",
        breakpoints: void 0,
        breakpointsBase: "window",
        spaceBetween: 0,
        slidesPerView: 1,
        slidesPerGroup: 1,
        slidesPerGroupSkip: 0,
        slidesPerGroupAuto: false,
        centeredSlides: false,
        centeredSlidesBounds: false,
        slidesOffsetBefore: 0,
        slidesOffsetAfter: 0,
        normalizeSlideIndex: true,
        centerInsufficientSlides: false,
        watchOverflow: true,
        roundLengths: false,
        touchRatio: 1,
        touchAngle: 45,
        simulateTouch: true,
        shortSwipes: true,
        longSwipes: true,
        longSwipesRatio: .5,
        longSwipesMs: 300,
        followFinger: true,
        allowTouchMove: true,
        threshold: 5,
        touchMoveStopPropagation: false,
        touchStartPreventDefault: true,
        touchStartForcePreventDefault: false,
        touchReleaseOnEdges: false,
        uniqueNavElements: true,
        resistance: true,
        resistanceRatio: .85,
        watchSlidesProgress: false,
        grabCursor: false,
        preventClicks: true,
        preventClicksPropagation: true,
        slideToClickedSlide: false,
        loop: false,
        loopAddBlankSlides: true,
        loopAdditionalSlides: 0,
        loopPreventsSliding: true,
        rewind: false,
        allowSlidePrev: true,
        allowSlideNext: true,
        swipeHandler: null,
        noSwiping: true,
        noSwipingClass: "swiper-no-swiping",
        noSwipingSelector: null,
        passiveListeners: true,
        maxBackfaceHiddenSlides: 10,
        containerModifierClass: "swiper-",
        slideClass: "swiper-slide",
        slideBlankClass: "swiper-slide-blank",
        slideActiveClass: "swiper-slide-active",
        slideVisibleClass: "swiper-slide-visible",
        slideFullyVisibleClass: "swiper-slide-fully-visible",
        slideNextClass: "swiper-slide-next",
        slidePrevClass: "swiper-slide-prev",
        wrapperClass: "swiper-wrapper",
        lazyPreloaderClass: "swiper-lazy-preloader",
        lazyPreloadPrevNext: 0,
        runCallbacksOnInit: true,
        _emitClasses: false
    };
    function moduleExtendParams(params, allModulesParams) {
        return function extendParams(obj) {
            if (obj === void 0) obj = {};
            const moduleParamName = Object.keys(obj)[0];
            const moduleParams = obj[moduleParamName];
            if (typeof moduleParams !== "object" || moduleParams === null) {
                utils_extend(allModulesParams, obj);
                return;
            }
            if (params[moduleParamName] === true) params[moduleParamName] = {
                enabled: true
            };
            if (moduleParamName === "navigation" && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].prevEl && !params[moduleParamName].nextEl) params[moduleParamName].auto = true;
            if ([ "pagination", "scrollbar" ].indexOf(moduleParamName) >= 0 && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].el) params[moduleParamName].auto = true;
            if (!(moduleParamName in params && "enabled" in moduleParams)) {
                utils_extend(allModulesParams, obj);
                return;
            }
            if (typeof params[moduleParamName] === "object" && !("enabled" in params[moduleParamName])) params[moduleParamName].enabled = true;
            if (!params[moduleParamName]) params[moduleParamName] = {
                enabled: false
            };
            utils_extend(allModulesParams, obj);
        };
    }
    const prototypes = {
        eventsEmitter,
        update,
        translate,
        transition,
        slide,
        loop,
        grabCursor,
        events: events$1,
        breakpoints,
        checkOverflow: checkOverflow$1,
        classes
    };
    const extendedDefaults = {};
    class swiper_core_Swiper {
        constructor() {
            let el;
            let params;
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
            if (args.length === 1 && args[0].constructor && Object.prototype.toString.call(args[0]).slice(8, -1) === "Object") params = args[0]; else [el, params] = args;
            if (!params) params = {};
            params = utils_extend({}, params);
            if (el && !params.el) params.el = el;
            const document = ssr_window_esm_getDocument();
            if (params.el && typeof params.el === "string" && document.querySelectorAll(params.el).length > 1) {
                const swipers = [];
                document.querySelectorAll(params.el).forEach((containerEl => {
                    const newParams = utils_extend({}, params, {
                        el: containerEl
                    });
                    swipers.push(new swiper_core_Swiper(newParams));
                }));
                return swipers;
            }
            const swiper = this;
            swiper.__swiper__ = true;
            swiper.support = getSupport();
            swiper.device = getDevice({
                userAgent: params.userAgent
            });
            swiper.browser = getBrowser();
            swiper.eventsListeners = {};
            swiper.eventsAnyListeners = [];
            swiper.modules = [ ...swiper.__modules__ ];
            if (params.modules && Array.isArray(params.modules)) swiper.modules.push(...params.modules);
            const allModulesParams = {};
            swiper.modules.forEach((mod => {
                mod({
                    params,
                    swiper,
                    extendParams: moduleExtendParams(params, allModulesParams),
                    on: swiper.on.bind(swiper),
                    once: swiper.once.bind(swiper),
                    off: swiper.off.bind(swiper),
                    emit: swiper.emit.bind(swiper)
                });
            }));
            const swiperParams = utils_extend({}, defaults, allModulesParams);
            swiper.params = utils_extend({}, swiperParams, extendedDefaults, params);
            swiper.originalParams = utils_extend({}, swiper.params);
            swiper.passedParams = utils_extend({}, params);
            if (swiper.params && swiper.params.on) Object.keys(swiper.params.on).forEach((eventName => {
                swiper.on(eventName, swiper.params.on[eventName]);
            }));
            if (swiper.params && swiper.params.onAny) swiper.onAny(swiper.params.onAny);
            Object.assign(swiper, {
                enabled: swiper.params.enabled,
                el,
                classNames: [],
                slides: [],
                slidesGrid: [],
                snapGrid: [],
                slidesSizesGrid: [],
                isHorizontal() {
                    return swiper.params.direction === "horizontal";
                },
                isVertical() {
                    return swiper.params.direction === "vertical";
                },
                activeIndex: 0,
                realIndex: 0,
                isBeginning: true,
                isEnd: false,
                translate: 0,
                previousTranslate: 0,
                progress: 0,
                velocity: 0,
                animating: false,
                cssOverflowAdjustment() {
                    return Math.trunc(this.translate / 2 ** 23) * 2 ** 23;
                },
                allowSlideNext: swiper.params.allowSlideNext,
                allowSlidePrev: swiper.params.allowSlidePrev,
                touchEventsData: {
                    isTouched: void 0,
                    isMoved: void 0,
                    allowTouchCallbacks: void 0,
                    touchStartTime: void 0,
                    isScrolling: void 0,
                    currentTranslate: void 0,
                    startTranslate: void 0,
                    allowThresholdMove: void 0,
                    focusableElements: swiper.params.focusableElements,
                    lastClickTime: 0,
                    clickTimeout: void 0,
                    velocities: [],
                    allowMomentumBounce: void 0,
                    startMoving: void 0,
                    pointerId: null,
                    touchId: null
                },
                allowClick: true,
                allowTouchMove: swiper.params.allowTouchMove,
                touches: {
                    startX: 0,
                    startY: 0,
                    currentX: 0,
                    currentY: 0,
                    diff: 0
                },
                imagesToLoad: [],
                imagesLoaded: 0
            });
            swiper.emit("_swiper");
            if (swiper.params.init) swiper.init();
            return swiper;
        }
        getDirectionLabel(property) {
            if (this.isHorizontal()) return property;
            return {
                width: "height",
                "margin-top": "margin-left",
                "margin-bottom ": "margin-right",
                "margin-left": "margin-top",
                "margin-right": "margin-bottom",
                "padding-left": "padding-top",
                "padding-right": "padding-bottom",
                marginRight: "marginBottom"
            }[property];
        }
        getSlideIndex(slideEl) {
            const {slidesEl, params} = this;
            const slides = utils_elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
            const firstSlideIndex = utils_elementIndex(slides[0]);
            return utils_elementIndex(slideEl) - firstSlideIndex;
        }
        getSlideIndexByData(index) {
            return this.getSlideIndex(this.slides.filter((slideEl => slideEl.getAttribute("data-swiper-slide-index") * 1 === index))[0]);
        }
        recalcSlides() {
            const swiper = this;
            const {slidesEl, params} = swiper;
            swiper.slides = utils_elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
        }
        enable() {
            const swiper = this;
            if (swiper.enabled) return;
            swiper.enabled = true;
            if (swiper.params.grabCursor) swiper.setGrabCursor();
            swiper.emit("enable");
        }
        disable() {
            const swiper = this;
            if (!swiper.enabled) return;
            swiper.enabled = false;
            if (swiper.params.grabCursor) swiper.unsetGrabCursor();
            swiper.emit("disable");
        }
        setProgress(progress, speed) {
            const swiper = this;
            progress = Math.min(Math.max(progress, 0), 1);
            const min = swiper.minTranslate();
            const max = swiper.maxTranslate();
            const current = (max - min) * progress + min;
            swiper.translateTo(current, typeof speed === "undefined" ? 0 : speed);
            swiper.updateActiveIndex();
            swiper.updateSlidesClasses();
        }
        emitContainerClasses() {
            const swiper = this;
            if (!swiper.params._emitClasses || !swiper.el) return;
            const cls = swiper.el.className.split(" ").filter((className => className.indexOf("swiper") === 0 || className.indexOf(swiper.params.containerModifierClass) === 0));
            swiper.emit("_containerClasses", cls.join(" "));
        }
        getSlideClasses(slideEl) {
            const swiper = this;
            if (swiper.destroyed) return "";
            return slideEl.className.split(" ").filter((className => className.indexOf("swiper-slide") === 0 || className.indexOf(swiper.params.slideClass) === 0)).join(" ");
        }
        emitSlidesClasses() {
            const swiper = this;
            if (!swiper.params._emitClasses || !swiper.el) return;
            const updates = [];
            swiper.slides.forEach((slideEl => {
                const classNames = swiper.getSlideClasses(slideEl);
                updates.push({
                    slideEl,
                    classNames
                });
                swiper.emit("_slideClass", slideEl, classNames);
            }));
            swiper.emit("_slideClasses", updates);
        }
        slidesPerViewDynamic(view, exact) {
            if (view === void 0) view = "current";
            if (exact === void 0) exact = false;
            const swiper = this;
            const {params, slides, slidesGrid, slidesSizesGrid, size: swiperSize, activeIndex} = swiper;
            let spv = 1;
            if (typeof params.slidesPerView === "number") return params.slidesPerView;
            if (params.centeredSlides) {
                let slideSize = slides[activeIndex] ? Math.ceil(slides[activeIndex].swiperSlideSize) : 0;
                let breakLoop;
                for (let i = activeIndex + 1; i < slides.length; i += 1) if (slides[i] && !breakLoop) {
                    slideSize += Math.ceil(slides[i].swiperSlideSize);
                    spv += 1;
                    if (slideSize > swiperSize) breakLoop = true;
                }
                for (let i = activeIndex - 1; i >= 0; i -= 1) if (slides[i] && !breakLoop) {
                    slideSize += slides[i].swiperSlideSize;
                    spv += 1;
                    if (slideSize > swiperSize) breakLoop = true;
                }
            } else if (view === "current") for (let i = activeIndex + 1; i < slides.length; i += 1) {
                const slideInView = exact ? slidesGrid[i] + slidesSizesGrid[i] - slidesGrid[activeIndex] < swiperSize : slidesGrid[i] - slidesGrid[activeIndex] < swiperSize;
                if (slideInView) spv += 1;
            } else for (let i = activeIndex - 1; i >= 0; i -= 1) {
                const slideInView = slidesGrid[activeIndex] - slidesGrid[i] < swiperSize;
                if (slideInView) spv += 1;
            }
            return spv;
        }
        update() {
            const swiper = this;
            if (!swiper || swiper.destroyed) return;
            const {snapGrid, params} = swiper;
            if (params.breakpoints) swiper.setBreakpoint();
            [ ...swiper.el.querySelectorAll('[loading="lazy"]') ].forEach((imageEl => {
                if (imageEl.complete) processLazyPreloader(swiper, imageEl);
            }));
            swiper.updateSize();
            swiper.updateSlides();
            swiper.updateProgress();
            swiper.updateSlidesClasses();
            function setTranslate() {
                const translateValue = swiper.rtlTranslate ? swiper.translate * -1 : swiper.translate;
                const newTranslate = Math.min(Math.max(translateValue, swiper.maxTranslate()), swiper.minTranslate());
                swiper.setTranslate(newTranslate);
                swiper.updateActiveIndex();
                swiper.updateSlidesClasses();
            }
            let translated;
            if (params.freeMode && params.freeMode.enabled && !params.cssMode) {
                setTranslate();
                if (params.autoHeight) swiper.updateAutoHeight();
            } else {
                if ((params.slidesPerView === "auto" || params.slidesPerView > 1) && swiper.isEnd && !params.centeredSlides) {
                    const slides = swiper.virtual && params.virtual.enabled ? swiper.virtual.slides : swiper.slides;
                    translated = swiper.slideTo(slides.length - 1, 0, false, true);
                } else translated = swiper.slideTo(swiper.activeIndex, 0, false, true);
                if (!translated) setTranslate();
            }
            if (params.watchOverflow && snapGrid !== swiper.snapGrid) swiper.checkOverflow();
            swiper.emit("update");
        }
        changeDirection(newDirection, needUpdate) {
            if (needUpdate === void 0) needUpdate = true;
            const swiper = this;
            const currentDirection = swiper.params.direction;
            if (!newDirection) newDirection = currentDirection === "horizontal" ? "vertical" : "horizontal";
            if (newDirection === currentDirection || newDirection !== "horizontal" && newDirection !== "vertical") return swiper;
            swiper.el.classList.remove(`${swiper.params.containerModifierClass}${currentDirection}`);
            swiper.el.classList.add(`${swiper.params.containerModifierClass}${newDirection}`);
            swiper.emitContainerClasses();
            swiper.params.direction = newDirection;
            swiper.slides.forEach((slideEl => {
                if (newDirection === "vertical") slideEl.style.width = ""; else slideEl.style.height = "";
            }));
            swiper.emit("changeDirection");
            if (needUpdate) swiper.update();
            return swiper;
        }
        changeLanguageDirection(direction) {
            const swiper = this;
            if (swiper.rtl && direction === "rtl" || !swiper.rtl && direction === "ltr") return;
            swiper.rtl = direction === "rtl";
            swiper.rtlTranslate = swiper.params.direction === "horizontal" && swiper.rtl;
            if (swiper.rtl) {
                swiper.el.classList.add(`${swiper.params.containerModifierClass}rtl`);
                swiper.el.dir = "rtl";
            } else {
                swiper.el.classList.remove(`${swiper.params.containerModifierClass}rtl`);
                swiper.el.dir = "ltr";
            }
            swiper.update();
        }
        mount(element) {
            const swiper = this;
            if (swiper.mounted) return true;
            let el = element || swiper.params.el;
            if (typeof el === "string") el = document.querySelector(el);
            if (!el) return false;
            el.swiper = swiper;
            if (el.parentNode && el.parentNode.host && el.parentNode.host.nodeName === swiper.params.swiperElementNodeName.toUpperCase()) swiper.isElement = true;
            const getWrapperSelector = () => `.${(swiper.params.wrapperClass || "").trim().split(" ").join(".")}`;
            const getWrapper = () => {
                if (el && el.shadowRoot && el.shadowRoot.querySelector) {
                    const res = el.shadowRoot.querySelector(getWrapperSelector());
                    return res;
                }
                return utils_elementChildren(el, getWrapperSelector())[0];
            };
            let wrapperEl = getWrapper();
            if (!wrapperEl && swiper.params.createElements) {
                wrapperEl = utils_createElement("div", swiper.params.wrapperClass);
                el.append(wrapperEl);
                utils_elementChildren(el, `.${swiper.params.slideClass}`).forEach((slideEl => {
                    wrapperEl.append(slideEl);
                }));
            }
            Object.assign(swiper, {
                el,
                wrapperEl,
                slidesEl: swiper.isElement && !el.parentNode.host.slideSlots ? el.parentNode.host : wrapperEl,
                hostEl: swiper.isElement ? el.parentNode.host : el,
                mounted: true,
                rtl: el.dir.toLowerCase() === "rtl" || elementStyle(el, "direction") === "rtl",
                rtlTranslate: swiper.params.direction === "horizontal" && (el.dir.toLowerCase() === "rtl" || elementStyle(el, "direction") === "rtl"),
                wrongRTL: elementStyle(wrapperEl, "display") === "-webkit-box"
            });
            return true;
        }
        init(el) {
            const swiper = this;
            if (swiper.initialized) return swiper;
            const mounted = swiper.mount(el);
            if (mounted === false) return swiper;
            swiper.emit("beforeInit");
            if (swiper.params.breakpoints) swiper.setBreakpoint();
            swiper.addClasses();
            swiper.updateSize();
            swiper.updateSlides();
            if (swiper.params.watchOverflow) swiper.checkOverflow();
            if (swiper.params.grabCursor && swiper.enabled) swiper.setGrabCursor();
            if (swiper.params.loop && swiper.virtual && swiper.params.virtual.enabled) swiper.slideTo(swiper.params.initialSlide + swiper.virtual.slidesBefore, 0, swiper.params.runCallbacksOnInit, false, true); else swiper.slideTo(swiper.params.initialSlide, 0, swiper.params.runCallbacksOnInit, false, true);
            if (swiper.params.loop) swiper.loopCreate();
            swiper.attachEvents();
            const lazyElements = [ ...swiper.el.querySelectorAll('[loading="lazy"]') ];
            if (swiper.isElement) lazyElements.push(...swiper.hostEl.querySelectorAll('[loading="lazy"]'));
            lazyElements.forEach((imageEl => {
                if (imageEl.complete) processLazyPreloader(swiper, imageEl); else imageEl.addEventListener("load", (e => {
                    processLazyPreloader(swiper, e.target);
                }));
            }));
            preload(swiper);
            swiper.initialized = true;
            preload(swiper);
            swiper.emit("init");
            swiper.emit("afterInit");
            return swiper;
        }
        destroy(deleteInstance, cleanStyles) {
            if (deleteInstance === void 0) deleteInstance = true;
            if (cleanStyles === void 0) cleanStyles = true;
            const swiper = this;
            const {params, el, wrapperEl, slides} = swiper;
            if (typeof swiper.params === "undefined" || swiper.destroyed) return null;
            swiper.emit("beforeDestroy");
            swiper.initialized = false;
            swiper.detachEvents();
            if (params.loop) swiper.loopDestroy();
            if (cleanStyles) {
                swiper.removeClasses();
                if (el && typeof el !== "string") el.removeAttribute("style");
                if (wrapperEl) wrapperEl.removeAttribute("style");
                if (slides && slides.length) slides.forEach((slideEl => {
                    slideEl.classList.remove(params.slideVisibleClass, params.slideFullyVisibleClass, params.slideActiveClass, params.slideNextClass, params.slidePrevClass);
                    slideEl.removeAttribute("style");
                    slideEl.removeAttribute("data-swiper-slide-index");
                }));
            }
            swiper.emit("destroy");
            Object.keys(swiper.eventsListeners).forEach((eventName => {
                swiper.off(eventName);
            }));
            if (deleteInstance !== false) {
                if (swiper.el && typeof swiper.el !== "string") swiper.el.swiper = null;
                deleteProps(swiper);
            }
            swiper.destroyed = true;
            return null;
        }
        static extendDefaults(newDefaults) {
            utils_extend(extendedDefaults, newDefaults);
        }
        static get extendedDefaults() {
            return extendedDefaults;
        }
        static get defaults() {
            return defaults;
        }
        static installModule(mod) {
            if (!swiper_core_Swiper.prototype.__modules__) swiper_core_Swiper.prototype.__modules__ = [];
            const modules = swiper_core_Swiper.prototype.__modules__;
            if (typeof mod === "function" && modules.indexOf(mod) < 0) modules.push(mod);
        }
        static use(module) {
            if (Array.isArray(module)) {
                module.forEach((m => swiper_core_Swiper.installModule(m)));
                return swiper_core_Swiper;
            }
            swiper_core_Swiper.installModule(module);
            return swiper_core_Swiper;
        }
    }
    Object.keys(prototypes).forEach((prototypeGroup => {
        Object.keys(prototypes[prototypeGroup]).forEach((protoMethod => {
            swiper_core_Swiper.prototype[protoMethod] = prototypes[prototypeGroup][protoMethod];
        }));
    }));
    swiper_core_Swiper.use([ Resize, Observer ]);
    function Mousewheel(_ref) {
        let {swiper, extendParams, on, emit} = _ref;
        const window = ssr_window_esm_getWindow();
        extendParams({
            mousewheel: {
                enabled: false,
                releaseOnEdges: false,
                invert: false,
                forceToAxis: false,
                sensitivity: 1,
                eventsTarget: "container",
                thresholdDelta: null,
                thresholdTime: null,
                noMousewheelClass: "swiper-no-mousewheel"
            }
        });
        swiper.mousewheel = {
            enabled: false
        };
        let timeout;
        let lastScrollTime = now();
        let lastEventBeforeSnap;
        const recentWheelEvents = [];
        function normalize(e) {
            const PIXEL_STEP = 10;
            const LINE_HEIGHT = 40;
            const PAGE_HEIGHT = 800;
            let sX = 0;
            let sY = 0;
            let pX = 0;
            let pY = 0;
            if ("detail" in e) sY = e.detail;
            if ("wheelDelta" in e) sY = -e.wheelDelta / 120;
            if ("wheelDeltaY" in e) sY = -e.wheelDeltaY / 120;
            if ("wheelDeltaX" in e) sX = -e.wheelDeltaX / 120;
            if ("axis" in e && e.axis === e.HORIZONTAL_AXIS) {
                sX = sY;
                sY = 0;
            }
            pX = sX * PIXEL_STEP;
            pY = sY * PIXEL_STEP;
            if ("deltaY" in e) pY = e.deltaY;
            if ("deltaX" in e) pX = e.deltaX;
            if (e.shiftKey && !pX) {
                pX = pY;
                pY = 0;
            }
            if ((pX || pY) && e.deltaMode) if (e.deltaMode === 1) {
                pX *= LINE_HEIGHT;
                pY *= LINE_HEIGHT;
            } else {
                pX *= PAGE_HEIGHT;
                pY *= PAGE_HEIGHT;
            }
            if (pX && !sX) sX = pX < 1 ? -1 : 1;
            if (pY && !sY) sY = pY < 1 ? -1 : 1;
            return {
                spinX: sX,
                spinY: sY,
                pixelX: pX,
                pixelY: pY
            };
        }
        function handleMouseEnter() {
            if (!swiper.enabled) return;
            swiper.mouseEntered = true;
        }
        function handleMouseLeave() {
            if (!swiper.enabled) return;
            swiper.mouseEntered = false;
        }
        function animateSlider(newEvent) {
            if (swiper.params.mousewheel.thresholdDelta && newEvent.delta < swiper.params.mousewheel.thresholdDelta) return false;
            if (swiper.params.mousewheel.thresholdTime && now() - lastScrollTime < swiper.params.mousewheel.thresholdTime) return false;
            if (newEvent.delta >= 6 && now() - lastScrollTime < 60) return true;
            if (newEvent.direction < 0) {
                if ((!swiper.isEnd || swiper.params.loop) && !swiper.animating) {
                    swiper.slideNext();
                    emit("scroll", newEvent.raw);
                }
            } else if ((!swiper.isBeginning || swiper.params.loop) && !swiper.animating) {
                swiper.slidePrev();
                emit("scroll", newEvent.raw);
            }
            lastScrollTime = (new window.Date).getTime();
            return false;
        }
        function releaseScroll(newEvent) {
            const params = swiper.params.mousewheel;
            if (newEvent.direction < 0) {
                if (swiper.isEnd && !swiper.params.loop && params.releaseOnEdges) return true;
            } else if (swiper.isBeginning && !swiper.params.loop && params.releaseOnEdges) return true;
            return false;
        }
        function handle(event) {
            let e = event;
            let disableParentSwiper = true;
            if (!swiper.enabled) return;
            if (event.target.closest(`.${swiper.params.mousewheel.noMousewheelClass}`)) return;
            const params = swiper.params.mousewheel;
            if (swiper.params.cssMode) e.preventDefault();
            let targetEl = swiper.el;
            if (swiper.params.mousewheel.eventsTarget !== "container") targetEl = document.querySelector(swiper.params.mousewheel.eventsTarget);
            const targetElContainsTarget = targetEl && targetEl.contains(e.target);
            if (!swiper.mouseEntered && !targetElContainsTarget && !params.releaseOnEdges) return true;
            if (e.originalEvent) e = e.originalEvent;
            let delta = 0;
            const rtlFactor = swiper.rtlTranslate ? -1 : 1;
            const data = normalize(e);
            if (params.forceToAxis) if (swiper.isHorizontal()) if (Math.abs(data.pixelX) > Math.abs(data.pixelY)) delta = -data.pixelX * rtlFactor; else return true; else if (Math.abs(data.pixelY) > Math.abs(data.pixelX)) delta = -data.pixelY; else return true; else delta = Math.abs(data.pixelX) > Math.abs(data.pixelY) ? -data.pixelX * rtlFactor : -data.pixelY;
            if (delta === 0) return true;
            if (params.invert) delta = -delta;
            let positions = swiper.getTranslate() + delta * params.sensitivity;
            if (positions >= swiper.minTranslate()) positions = swiper.minTranslate();
            if (positions <= swiper.maxTranslate()) positions = swiper.maxTranslate();
            disableParentSwiper = swiper.params.loop ? true : !(positions === swiper.minTranslate() || positions === swiper.maxTranslate());
            if (disableParentSwiper && swiper.params.nested) e.stopPropagation();
            if (!swiper.params.freeMode || !swiper.params.freeMode.enabled) {
                const newEvent = {
                    time: now(),
                    delta: Math.abs(delta),
                    direction: Math.sign(delta),
                    raw: event
                };
                if (recentWheelEvents.length >= 2) recentWheelEvents.shift();
                const prevEvent = recentWheelEvents.length ? recentWheelEvents[recentWheelEvents.length - 1] : void 0;
                recentWheelEvents.push(newEvent);
                if (prevEvent) {
                    if (newEvent.direction !== prevEvent.direction || newEvent.delta > prevEvent.delta || newEvent.time > prevEvent.time + 150) animateSlider(newEvent);
                } else animateSlider(newEvent);
                if (releaseScroll(newEvent)) return true;
            } else {
                const newEvent = {
                    time: now(),
                    delta: Math.abs(delta),
                    direction: Math.sign(delta)
                };
                const ignoreWheelEvents = lastEventBeforeSnap && newEvent.time < lastEventBeforeSnap.time + 500 && newEvent.delta <= lastEventBeforeSnap.delta && newEvent.direction === lastEventBeforeSnap.direction;
                if (!ignoreWheelEvents) {
                    lastEventBeforeSnap = void 0;
                    let position = swiper.getTranslate() + delta * params.sensitivity;
                    const wasBeginning = swiper.isBeginning;
                    const wasEnd = swiper.isEnd;
                    if (position >= swiper.minTranslate()) position = swiper.minTranslate();
                    if (position <= swiper.maxTranslate()) position = swiper.maxTranslate();
                    swiper.setTransition(0);
                    swiper.setTranslate(position);
                    swiper.updateProgress();
                    swiper.updateActiveIndex();
                    swiper.updateSlidesClasses();
                    if (!wasBeginning && swiper.isBeginning || !wasEnd && swiper.isEnd) swiper.updateSlidesClasses();
                    if (swiper.params.loop) swiper.loopFix({
                        direction: newEvent.direction < 0 ? "next" : "prev",
                        byMousewheel: true
                    });
                    if (swiper.params.freeMode.sticky) {
                        clearTimeout(timeout);
                        timeout = void 0;
                        if (recentWheelEvents.length >= 15) recentWheelEvents.shift();
                        const prevEvent = recentWheelEvents.length ? recentWheelEvents[recentWheelEvents.length - 1] : void 0;
                        const firstEvent = recentWheelEvents[0];
                        recentWheelEvents.push(newEvent);
                        if (prevEvent && (newEvent.delta > prevEvent.delta || newEvent.direction !== prevEvent.direction)) recentWheelEvents.splice(0); else if (recentWheelEvents.length >= 15 && newEvent.time - firstEvent.time < 500 && firstEvent.delta - newEvent.delta >= 1 && newEvent.delta <= 6) {
                            const snapToThreshold = delta > 0 ? .8 : .2;
                            lastEventBeforeSnap = newEvent;
                            recentWheelEvents.splice(0);
                            timeout = utils_nextTick((() => {
                                swiper.slideToClosest(swiper.params.speed, true, void 0, snapToThreshold);
                            }), 0);
                        }
                        if (!timeout) timeout = utils_nextTick((() => {
                            const snapToThreshold = .5;
                            lastEventBeforeSnap = newEvent;
                            recentWheelEvents.splice(0);
                            swiper.slideToClosest(swiper.params.speed, true, void 0, snapToThreshold);
                        }), 500);
                    }
                    if (!ignoreWheelEvents) emit("scroll", e);
                    if (swiper.params.autoplay && swiper.params.autoplayDisableOnInteraction) swiper.autoplay.stop();
                    if (params.releaseOnEdges && (position === swiper.minTranslate() || position === swiper.maxTranslate())) return true;
                }
            }
            if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
            return false;
        }
        function events(method) {
            let targetEl = swiper.el;
            if (swiper.params.mousewheel.eventsTarget !== "container") targetEl = document.querySelector(swiper.params.mousewheel.eventsTarget);
            targetEl[method]("mouseenter", handleMouseEnter);
            targetEl[method]("mouseleave", handleMouseLeave);
            targetEl[method]("wheel", handle);
        }
        function enable() {
            if (swiper.params.cssMode) {
                swiper.wrapperEl.removeEventListener("wheel", handle);
                return true;
            }
            if (swiper.mousewheel.enabled) return false;
            events("addEventListener");
            swiper.mousewheel.enabled = true;
            return true;
        }
        function disable() {
            if (swiper.params.cssMode) {
                swiper.wrapperEl.addEventListener(event, handle);
                return true;
            }
            if (!swiper.mousewheel.enabled) return false;
            events("removeEventListener");
            swiper.mousewheel.enabled = false;
            return true;
        }
        on("init", (() => {
            if (!swiper.params.mousewheel.enabled && swiper.params.cssMode) disable();
            if (swiper.params.mousewheel.enabled) enable();
        }));
        on("destroy", (() => {
            if (swiper.params.cssMode) enable();
            if (swiper.mousewheel.enabled) disable();
        }));
        Object.assign(swiper.mousewheel, {
            enable,
            disable
        });
    }
    function create_element_if_not_defined_createElementIfNotDefined(swiper, originalParams, params, checkProps) {
        if (swiper.params.createElements) Object.keys(checkProps).forEach((key => {
            if (!params[key] && params.auto === true) {
                let element = utils_elementChildren(swiper.el, `.${checkProps[key]}`)[0];
                if (!element) {
                    element = utils_createElement("div", checkProps[key]);
                    element.className = checkProps[key];
                    swiper.el.append(element);
                }
                params[key] = element;
                originalParams[key] = element;
            }
        }));
        return params;
    }
    function Navigation(_ref) {
        let {swiper, extendParams, on, emit} = _ref;
        extendParams({
            navigation: {
                nextEl: null,
                prevEl: null,
                hideOnClick: false,
                disabledClass: "swiper-button-disabled",
                hiddenClass: "swiper-button-hidden",
                lockClass: "swiper-button-lock",
                navigationDisabledClass: "swiper-navigation-disabled"
            }
        });
        swiper.navigation = {
            nextEl: null,
            prevEl: null
        };
        function getEl(el) {
            let res;
            if (el && typeof el === "string" && swiper.isElement) {
                res = swiper.el.querySelector(el);
                if (res) return res;
            }
            if (el) {
                if (typeof el === "string") res = [ ...document.querySelectorAll(el) ];
                if (swiper.params.uniqueNavElements && typeof el === "string" && res && res.length > 1 && swiper.el.querySelectorAll(el).length === 1) res = swiper.el.querySelector(el); else if (res && res.length === 1) res = res[0];
            }
            if (el && !res) return el;
            return res;
        }
        function toggleEl(el, disabled) {
            const params = swiper.params.navigation;
            el = utils_makeElementsArray(el);
            el.forEach((subEl => {
                if (subEl) {
                    subEl.classList[disabled ? "add" : "remove"](...params.disabledClass.split(" "));
                    if (subEl.tagName === "BUTTON") subEl.disabled = disabled;
                    if (swiper.params.watchOverflow && swiper.enabled) subEl.classList[swiper.isLocked ? "add" : "remove"](params.lockClass);
                }
            }));
        }
        function update() {
            const {nextEl, prevEl} = swiper.navigation;
            if (swiper.params.loop) {
                toggleEl(prevEl, false);
                toggleEl(nextEl, false);
                return;
            }
            toggleEl(prevEl, swiper.isBeginning && !swiper.params.rewind);
            toggleEl(nextEl, swiper.isEnd && !swiper.params.rewind);
        }
        function onPrevClick(e) {
            e.preventDefault();
            if (swiper.isBeginning && !swiper.params.loop && !swiper.params.rewind) return;
            swiper.slidePrev();
            emit("navigationPrev");
        }
        function onNextClick(e) {
            e.preventDefault();
            if (swiper.isEnd && !swiper.params.loop && !swiper.params.rewind) return;
            swiper.slideNext();
            emit("navigationNext");
        }
        function init() {
            const params = swiper.params.navigation;
            swiper.params.navigation = create_element_if_not_defined_createElementIfNotDefined(swiper, swiper.originalParams.navigation, swiper.params.navigation, {
                nextEl: "swiper-button-next",
                prevEl: "swiper-button-prev"
            });
            if (!(params.nextEl || params.prevEl)) return;
            let nextEl = getEl(params.nextEl);
            let prevEl = getEl(params.prevEl);
            Object.assign(swiper.navigation, {
                nextEl,
                prevEl
            });
            nextEl = utils_makeElementsArray(nextEl);
            prevEl = utils_makeElementsArray(prevEl);
            const initButton = (el, dir) => {
                if (el) el.addEventListener("click", dir === "next" ? onNextClick : onPrevClick);
                if (!swiper.enabled && el) el.classList.add(...params.lockClass.split(" "));
            };
            nextEl.forEach((el => initButton(el, "next")));
            prevEl.forEach((el => initButton(el, "prev")));
        }
        function destroy() {
            let {nextEl, prevEl} = swiper.navigation;
            nextEl = utils_makeElementsArray(nextEl);
            prevEl = utils_makeElementsArray(prevEl);
            const destroyButton = (el, dir) => {
                el.removeEventListener("click", dir === "next" ? onNextClick : onPrevClick);
                el.classList.remove(...swiper.params.navigation.disabledClass.split(" "));
            };
            nextEl.forEach((el => destroyButton(el, "next")));
            prevEl.forEach((el => destroyButton(el, "prev")));
        }
        on("init", (() => {
            if (swiper.params.navigation.enabled === false) disable(); else {
                init();
                update();
            }
        }));
        on("toEdge fromEdge lock unlock", (() => {
            update();
        }));
        on("destroy", (() => {
            destroy();
        }));
        on("enable disable", (() => {
            let {nextEl, prevEl} = swiper.navigation;
            nextEl = utils_makeElementsArray(nextEl);
            prevEl = utils_makeElementsArray(prevEl);
            if (swiper.enabled) {
                update();
                return;
            }
            [ ...nextEl, ...prevEl ].filter((el => !!el)).forEach((el => el.classList.add(swiper.params.navigation.lockClass)));
        }));
        on("click", ((_s, e) => {
            let {nextEl, prevEl} = swiper.navigation;
            nextEl = utils_makeElementsArray(nextEl);
            prevEl = utils_makeElementsArray(prevEl);
            const targetEl = e.target;
            let targetIsButton = prevEl.includes(targetEl) || nextEl.includes(targetEl);
            if (swiper.isElement && !targetIsButton) {
                const path = e.path || e.composedPath && e.composedPath();
                if (path) targetIsButton = path.find((pathEl => nextEl.includes(pathEl) || prevEl.includes(pathEl)));
            }
            if (swiper.params.navigation.hideOnClick && !targetIsButton) {
                if (swiper.pagination && swiper.params.pagination && swiper.params.pagination.clickable && (swiper.pagination.el === targetEl || swiper.pagination.el.contains(targetEl))) return;
                let isHidden;
                if (nextEl.length) isHidden = nextEl[0].classList.contains(swiper.params.navigation.hiddenClass); else if (prevEl.length) isHidden = prevEl[0].classList.contains(swiper.params.navigation.hiddenClass);
                if (isHidden === true) emit("navigationShow"); else emit("navigationHide");
                [ ...nextEl, ...prevEl ].filter((el => !!el)).forEach((el => el.classList.toggle(swiper.params.navigation.hiddenClass)));
            }
        }));
        const enable = () => {
            swiper.el.classList.remove(...swiper.params.navigation.navigationDisabledClass.split(" "));
            init();
            update();
        };
        const disable = () => {
            swiper.el.classList.add(...swiper.params.navigation.navigationDisabledClass.split(" "));
            destroy();
        };
        Object.assign(swiper.navigation, {
            enable,
            disable,
            update,
            init,
            destroy
        });
    }
    function classes_to_selector_classesToSelector(classes) {
        if (classes === void 0) classes = "";
        return `.${classes.trim().replace(/([\.:!+\/])/g, "\\$1").replace(/ /g, ".")}`;
    }
    function Pagination(_ref) {
        let {swiper, extendParams, on, emit} = _ref;
        const pfx = "swiper-pagination";
        extendParams({
            pagination: {
                el: null,
                bulletElement: "span",
                clickable: false,
                hideOnClick: false,
                renderBullet: null,
                renderProgressbar: null,
                renderFraction: null,
                renderCustom: null,
                progressbarOpposite: false,
                type: "bullets",
                dynamicBullets: false,
                dynamicMainBullets: 1,
                formatFractionCurrent: number => number,
                formatFractionTotal: number => number,
                bulletClass: `${pfx}-bullet`,
                bulletActiveClass: `${pfx}-bullet-active`,
                modifierClass: `${pfx}-`,
                currentClass: `${pfx}-current`,
                totalClass: `${pfx}-total`,
                hiddenClass: `${pfx}-hidden`,
                progressbarFillClass: `${pfx}-progressbar-fill`,
                progressbarOppositeClass: `${pfx}-progressbar-opposite`,
                clickableClass: `${pfx}-clickable`,
                lockClass: `${pfx}-lock`,
                horizontalClass: `${pfx}-horizontal`,
                verticalClass: `${pfx}-vertical`,
                paginationDisabledClass: `${pfx}-disabled`
            }
        });
        swiper.pagination = {
            el: null,
            bullets: []
        };
        let bulletSize;
        let dynamicBulletIndex = 0;
        function isPaginationDisabled() {
            return !swiper.params.pagination.el || !swiper.pagination.el || Array.isArray(swiper.pagination.el) && swiper.pagination.el.length === 0;
        }
        function setSideBullets(bulletEl, position) {
            const {bulletActiveClass} = swiper.params.pagination;
            if (!bulletEl) return;
            bulletEl = bulletEl[`${position === "prev" ? "previous" : "next"}ElementSibling`];
            if (bulletEl) {
                bulletEl.classList.add(`${bulletActiveClass}-${position}`);
                bulletEl = bulletEl[`${position === "prev" ? "previous" : "next"}ElementSibling`];
                if (bulletEl) bulletEl.classList.add(`${bulletActiveClass}-${position}-${position}`);
            }
        }
        function onBulletClick(e) {
            const bulletEl = e.target.closest(classes_to_selector_classesToSelector(swiper.params.pagination.bulletClass));
            if (!bulletEl) return;
            e.preventDefault();
            const index = utils_elementIndex(bulletEl) * swiper.params.slidesPerGroup;
            if (swiper.params.loop) {
                if (swiper.realIndex === index) return;
                swiper.slideToLoop(index);
            } else swiper.slideTo(index);
        }
        function update() {
            const rtl = swiper.rtl;
            const params = swiper.params.pagination;
            if (isPaginationDisabled()) return;
            let el = swiper.pagination.el;
            el = utils_makeElementsArray(el);
            let current;
            let previousIndex;
            const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.slides.length;
            const total = swiper.params.loop ? Math.ceil(slidesLength / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
            if (swiper.params.loop) {
                previousIndex = swiper.previousRealIndex || 0;
                current = swiper.params.slidesPerGroup > 1 ? Math.floor(swiper.realIndex / swiper.params.slidesPerGroup) : swiper.realIndex;
            } else if (typeof swiper.snapIndex !== "undefined") {
                current = swiper.snapIndex;
                previousIndex = swiper.previousSnapIndex;
            } else {
                previousIndex = swiper.previousIndex || 0;
                current = swiper.activeIndex || 0;
            }
            if (params.type === "bullets" && swiper.pagination.bullets && swiper.pagination.bullets.length > 0) {
                const bullets = swiper.pagination.bullets;
                let firstIndex;
                let lastIndex;
                let midIndex;
                if (params.dynamicBullets) {
                    bulletSize = elementOuterSize(bullets[0], swiper.isHorizontal() ? "width" : "height", true);
                    el.forEach((subEl => {
                        subEl.style[swiper.isHorizontal() ? "width" : "height"] = `${bulletSize * (params.dynamicMainBullets + 4)}px`;
                    }));
                    if (params.dynamicMainBullets > 1 && previousIndex !== void 0) {
                        dynamicBulletIndex += current - (previousIndex || 0);
                        if (dynamicBulletIndex > params.dynamicMainBullets - 1) dynamicBulletIndex = params.dynamicMainBullets - 1; else if (dynamicBulletIndex < 0) dynamicBulletIndex = 0;
                    }
                    firstIndex = Math.max(current - dynamicBulletIndex, 0);
                    lastIndex = firstIndex + (Math.min(bullets.length, params.dynamicMainBullets) - 1);
                    midIndex = (lastIndex + firstIndex) / 2;
                }
                bullets.forEach((bulletEl => {
                    const classesToRemove = [ ...[ "", "-next", "-next-next", "-prev", "-prev-prev", "-main" ].map((suffix => `${params.bulletActiveClass}${suffix}`)) ].map((s => typeof s === "string" && s.includes(" ") ? s.split(" ") : s)).flat();
                    bulletEl.classList.remove(...classesToRemove);
                }));
                if (el.length > 1) bullets.forEach((bullet => {
                    const bulletIndex = utils_elementIndex(bullet);
                    if (bulletIndex === current) bullet.classList.add(...params.bulletActiveClass.split(" ")); else if (swiper.isElement) bullet.setAttribute("part", "bullet");
                    if (params.dynamicBullets) {
                        if (bulletIndex >= firstIndex && bulletIndex <= lastIndex) bullet.classList.add(...`${params.bulletActiveClass}-main`.split(" "));
                        if (bulletIndex === firstIndex) setSideBullets(bullet, "prev");
                        if (bulletIndex === lastIndex) setSideBullets(bullet, "next");
                    }
                })); else {
                    const bullet = bullets[current];
                    if (bullet) bullet.classList.add(...params.bulletActiveClass.split(" "));
                    if (swiper.isElement) bullets.forEach(((bulletEl, bulletIndex) => {
                        bulletEl.setAttribute("part", bulletIndex === current ? "bullet-active" : "bullet");
                    }));
                    if (params.dynamicBullets) {
                        const firstDisplayedBullet = bullets[firstIndex];
                        const lastDisplayedBullet = bullets[lastIndex];
                        for (let i = firstIndex; i <= lastIndex; i += 1) if (bullets[i]) bullets[i].classList.add(...`${params.bulletActiveClass}-main`.split(" "));
                        setSideBullets(firstDisplayedBullet, "prev");
                        setSideBullets(lastDisplayedBullet, "next");
                    }
                }
                if (params.dynamicBullets) {
                    const dynamicBulletsLength = Math.min(bullets.length, params.dynamicMainBullets + 4);
                    const bulletsOffset = (bulletSize * dynamicBulletsLength - bulletSize) / 2 - midIndex * bulletSize;
                    const offsetProp = rtl ? "right" : "left";
                    bullets.forEach((bullet => {
                        bullet.style[swiper.isHorizontal() ? offsetProp : "top"] = `${bulletsOffset}px`;
                    }));
                }
            }
            el.forEach(((subEl, subElIndex) => {
                if (params.type === "fraction") {
                    subEl.querySelectorAll(classes_to_selector_classesToSelector(params.currentClass)).forEach((fractionEl => {
                        fractionEl.textContent = params.formatFractionCurrent(current + 1);
                    }));
                    subEl.querySelectorAll(classes_to_selector_classesToSelector(params.totalClass)).forEach((totalEl => {
                        totalEl.textContent = params.formatFractionTotal(total);
                    }));
                }
                if (params.type === "progressbar") {
                    let progressbarDirection;
                    if (params.progressbarOpposite) progressbarDirection = swiper.isHorizontal() ? "vertical" : "horizontal"; else progressbarDirection = swiper.isHorizontal() ? "horizontal" : "vertical";
                    const scale = (current + 1) / total;
                    let scaleX = 1;
                    let scaleY = 1;
                    if (progressbarDirection === "horizontal") scaleX = scale; else scaleY = scale;
                    subEl.querySelectorAll(classes_to_selector_classesToSelector(params.progressbarFillClass)).forEach((progressEl => {
                        progressEl.style.transform = `translate3d(0,0,0) scaleX(${scaleX}) scaleY(${scaleY})`;
                        progressEl.style.transitionDuration = `${swiper.params.speed}ms`;
                    }));
                }
                if (params.type === "custom" && params.renderCustom) {
                    subEl.innerHTML = params.renderCustom(swiper, current + 1, total);
                    if (subElIndex === 0) emit("paginationRender", subEl);
                } else {
                    if (subElIndex === 0) emit("paginationRender", subEl);
                    emit("paginationUpdate", subEl);
                }
                if (swiper.params.watchOverflow && swiper.enabled) subEl.classList[swiper.isLocked ? "add" : "remove"](params.lockClass);
            }));
        }
        function render() {
            const params = swiper.params.pagination;
            if (isPaginationDisabled()) return;
            const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.grid && swiper.params.grid.rows > 1 ? swiper.slides.length / Math.ceil(swiper.params.grid.rows) : swiper.slides.length;
            let el = swiper.pagination.el;
            el = utils_makeElementsArray(el);
            let paginationHTML = "";
            if (params.type === "bullets") {
                let numberOfBullets = swiper.params.loop ? Math.ceil(slidesLength / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
                if (swiper.params.freeMode && swiper.params.freeMode.enabled && numberOfBullets > slidesLength) numberOfBullets = slidesLength;
                for (let i = 0; i < numberOfBullets; i += 1) if (params.renderBullet) paginationHTML += params.renderBullet.call(swiper, i, params.bulletClass); else paginationHTML += `<${params.bulletElement} ${swiper.isElement ? 'part="bullet"' : ""} class="${params.bulletClass}"></${params.bulletElement}>`;
            }
            if (params.type === "fraction") if (params.renderFraction) paginationHTML = params.renderFraction.call(swiper, params.currentClass, params.totalClass); else paginationHTML = `<span class="${params.currentClass}"></span>` + " / " + `<span class="${params.totalClass}"></span>`;
            if (params.type === "progressbar") if (params.renderProgressbar) paginationHTML = params.renderProgressbar.call(swiper, params.progressbarFillClass); else paginationHTML = `<span class="${params.progressbarFillClass}"></span>`;
            swiper.pagination.bullets = [];
            el.forEach((subEl => {
                if (params.type !== "custom") subEl.innerHTML = paginationHTML || "";
                if (params.type === "bullets") swiper.pagination.bullets.push(...subEl.querySelectorAll(classes_to_selector_classesToSelector(params.bulletClass)));
            }));
            if (params.type !== "custom") emit("paginationRender", el[0]);
        }
        function init() {
            swiper.params.pagination = create_element_if_not_defined_createElementIfNotDefined(swiper, swiper.originalParams.pagination, swiper.params.pagination, {
                el: "swiper-pagination"
            });
            const params = swiper.params.pagination;
            if (!params.el) return;
            let el;
            if (typeof params.el === "string" && swiper.isElement) el = swiper.el.querySelector(params.el);
            if (!el && typeof params.el === "string") el = [ ...document.querySelectorAll(params.el) ];
            if (!el) el = params.el;
            if (!el || el.length === 0) return;
            if (swiper.params.uniqueNavElements && typeof params.el === "string" && Array.isArray(el) && el.length > 1) {
                el = [ ...swiper.el.querySelectorAll(params.el) ];
                if (el.length > 1) el = el.filter((subEl => {
                    if (utils_elementParents(subEl, ".swiper")[0] !== swiper.el) return false;
                    return true;
                }))[0];
            }
            if (Array.isArray(el) && el.length === 1) el = el[0];
            Object.assign(swiper.pagination, {
                el
            });
            el = utils_makeElementsArray(el);
            el.forEach((subEl => {
                if (params.type === "bullets" && params.clickable) subEl.classList.add(...(params.clickableClass || "").split(" "));
                subEl.classList.add(params.modifierClass + params.type);
                subEl.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
                if (params.type === "bullets" && params.dynamicBullets) {
                    subEl.classList.add(`${params.modifierClass}${params.type}-dynamic`);
                    dynamicBulletIndex = 0;
                    if (params.dynamicMainBullets < 1) params.dynamicMainBullets = 1;
                }
                if (params.type === "progressbar" && params.progressbarOpposite) subEl.classList.add(params.progressbarOppositeClass);
                if (params.clickable) subEl.addEventListener("click", onBulletClick);
                if (!swiper.enabled) subEl.classList.add(params.lockClass);
            }));
        }
        function destroy() {
            const params = swiper.params.pagination;
            if (isPaginationDisabled()) return;
            let el = swiper.pagination.el;
            if (el) {
                el = utils_makeElementsArray(el);
                el.forEach((subEl => {
                    subEl.classList.remove(params.hiddenClass);
                    subEl.classList.remove(params.modifierClass + params.type);
                    subEl.classList.remove(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
                    if (params.clickable) {
                        subEl.classList.remove(...(params.clickableClass || "").split(" "));
                        subEl.removeEventListener("click", onBulletClick);
                    }
                }));
            }
            if (swiper.pagination.bullets) swiper.pagination.bullets.forEach((subEl => subEl.classList.remove(...params.bulletActiveClass.split(" "))));
        }
        on("changeDirection", (() => {
            if (!swiper.pagination || !swiper.pagination.el) return;
            const params = swiper.params.pagination;
            let {el} = swiper.pagination;
            el = utils_makeElementsArray(el);
            el.forEach((subEl => {
                subEl.classList.remove(params.horizontalClass, params.verticalClass);
                subEl.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
            }));
        }));
        on("init", (() => {
            if (swiper.params.pagination.enabled === false) disable(); else {
                init();
                render();
                update();
            }
        }));
        on("activeIndexChange", (() => {
            if (typeof swiper.snapIndex === "undefined") update();
        }));
        on("snapIndexChange", (() => {
            update();
        }));
        on("snapGridLengthChange", (() => {
            render();
            update();
        }));
        on("destroy", (() => {
            destroy();
        }));
        on("enable disable", (() => {
            let {el} = swiper.pagination;
            if (el) {
                el = utils_makeElementsArray(el);
                el.forEach((subEl => subEl.classList[swiper.enabled ? "remove" : "add"](swiper.params.pagination.lockClass)));
            }
        }));
        on("lock unlock", (() => {
            update();
        }));
        on("click", ((_s, e) => {
            const targetEl = e.target;
            const el = utils_makeElementsArray(swiper.pagination.el);
            if (swiper.params.pagination.el && swiper.params.pagination.hideOnClick && el && el.length > 0 && !targetEl.classList.contains(swiper.params.pagination.bulletClass)) {
                if (swiper.navigation && (swiper.navigation.nextEl && targetEl === swiper.navigation.nextEl || swiper.navigation.prevEl && targetEl === swiper.navigation.prevEl)) return;
                const isHidden = el[0].classList.contains(swiper.params.pagination.hiddenClass);
                if (isHidden === true) emit("paginationShow"); else emit("paginationHide");
                el.forEach((subEl => subEl.classList.toggle(swiper.params.pagination.hiddenClass)));
            }
        }));
        const enable = () => {
            swiper.el.classList.remove(swiper.params.pagination.paginationDisabledClass);
            let {el} = swiper.pagination;
            if (el) {
                el = utils_makeElementsArray(el);
                el.forEach((subEl => subEl.classList.remove(swiper.params.pagination.paginationDisabledClass)));
            }
            init();
            render();
            update();
        };
        const disable = () => {
            swiper.el.classList.add(swiper.params.pagination.paginationDisabledClass);
            let {el} = swiper.pagination;
            if (el) {
                el = utils_makeElementsArray(el);
                el.forEach((subEl => subEl.classList.add(swiper.params.pagination.paginationDisabledClass)));
            }
            destroy();
        };
        Object.assign(swiper.pagination, {
            enable,
            disable,
            render,
            update,
            init,
            destroy
        });
    }
    function freeMode(_ref) {
        let {swiper, extendParams, emit, once} = _ref;
        extendParams({
            freeMode: {
                enabled: false,
                momentum: true,
                momentumRatio: 1,
                momentumBounce: true,
                momentumBounceRatio: 1,
                momentumVelocityRatio: 1,
                sticky: false,
                minimumVelocity: .02
            }
        });
        function onTouchStart() {
            if (swiper.params.cssMode) return;
            const translate = swiper.getTranslate();
            swiper.setTranslate(translate);
            swiper.setTransition(0);
            swiper.touchEventsData.velocities.length = 0;
            swiper.freeMode.onTouchEnd({
                currentPos: swiper.rtl ? swiper.translate : -swiper.translate
            });
        }
        function onTouchMove() {
            if (swiper.params.cssMode) return;
            const {touchEventsData: data, touches} = swiper;
            if (data.velocities.length === 0) data.velocities.push({
                position: touches[swiper.isHorizontal() ? "startX" : "startY"],
                time: data.touchStartTime
            });
            data.velocities.push({
                position: touches[swiper.isHorizontal() ? "currentX" : "currentY"],
                time: now()
            });
        }
        function onTouchEnd(_ref2) {
            let {currentPos} = _ref2;
            if (swiper.params.cssMode) return;
            const {params, wrapperEl, rtlTranslate: rtl, snapGrid, touchEventsData: data} = swiper;
            const touchEndTime = now();
            const timeDiff = touchEndTime - data.touchStartTime;
            if (currentPos < -swiper.minTranslate()) {
                swiper.slideTo(swiper.activeIndex);
                return;
            }
            if (currentPos > -swiper.maxTranslate()) {
                if (swiper.slides.length < snapGrid.length) swiper.slideTo(snapGrid.length - 1); else swiper.slideTo(swiper.slides.length - 1);
                return;
            }
            if (params.freeMode.momentum) {
                if (data.velocities.length > 1) {
                    const lastMoveEvent = data.velocities.pop();
                    const velocityEvent = data.velocities.pop();
                    const distance = lastMoveEvent.position - velocityEvent.position;
                    const time = lastMoveEvent.time - velocityEvent.time;
                    swiper.velocity = distance / time;
                    swiper.velocity /= 2;
                    if (Math.abs(swiper.velocity) < params.freeMode.minimumVelocity) swiper.velocity = 0;
                    if (time > 150 || now() - lastMoveEvent.time > 300) swiper.velocity = 0;
                } else swiper.velocity = 0;
                swiper.velocity *= params.freeMode.momentumVelocityRatio;
                data.velocities.length = 0;
                let momentumDuration = 1e3 * params.freeMode.momentumRatio;
                const momentumDistance = swiper.velocity * momentumDuration;
                let newPosition = swiper.translate + momentumDistance;
                if (rtl) newPosition = -newPosition;
                let doBounce = false;
                let afterBouncePosition;
                const bounceAmount = Math.abs(swiper.velocity) * 20 * params.freeMode.momentumBounceRatio;
                let needsLoopFix;
                if (newPosition < swiper.maxTranslate()) {
                    if (params.freeMode.momentumBounce) {
                        if (newPosition + swiper.maxTranslate() < -bounceAmount) newPosition = swiper.maxTranslate() - bounceAmount;
                        afterBouncePosition = swiper.maxTranslate();
                        doBounce = true;
                        data.allowMomentumBounce = true;
                    } else newPosition = swiper.maxTranslate();
                    if (params.loop && params.centeredSlides) needsLoopFix = true;
                } else if (newPosition > swiper.minTranslate()) {
                    if (params.freeMode.momentumBounce) {
                        if (newPosition - swiper.minTranslate() > bounceAmount) newPosition = swiper.minTranslate() + bounceAmount;
                        afterBouncePosition = swiper.minTranslate();
                        doBounce = true;
                        data.allowMomentumBounce = true;
                    } else newPosition = swiper.minTranslate();
                    if (params.loop && params.centeredSlides) needsLoopFix = true;
                } else if (params.freeMode.sticky) {
                    let nextSlide;
                    for (let j = 0; j < snapGrid.length; j += 1) if (snapGrid[j] > -newPosition) {
                        nextSlide = j;
                        break;
                    }
                    if (Math.abs(snapGrid[nextSlide] - newPosition) < Math.abs(snapGrid[nextSlide - 1] - newPosition) || swiper.swipeDirection === "next") newPosition = snapGrid[nextSlide]; else newPosition = snapGrid[nextSlide - 1];
                    newPosition = -newPosition;
                }
                if (needsLoopFix) once("transitionEnd", (() => {
                    swiper.loopFix();
                }));
                if (swiper.velocity !== 0) {
                    if (rtl) momentumDuration = Math.abs((-newPosition - swiper.translate) / swiper.velocity); else momentumDuration = Math.abs((newPosition - swiper.translate) / swiper.velocity);
                    if (params.freeMode.sticky) {
                        const moveDistance = Math.abs((rtl ? -newPosition : newPosition) - swiper.translate);
                        const currentSlideSize = swiper.slidesSizesGrid[swiper.activeIndex];
                        if (moveDistance < currentSlideSize) momentumDuration = params.speed; else if (moveDistance < 2 * currentSlideSize) momentumDuration = params.speed * 1.5; else momentumDuration = params.speed * 2.5;
                    }
                } else if (params.freeMode.sticky) {
                    swiper.slideToClosest();
                    return;
                }
                if (params.freeMode.momentumBounce && doBounce) {
                    swiper.updateProgress(afterBouncePosition);
                    swiper.setTransition(momentumDuration);
                    swiper.setTranslate(newPosition);
                    swiper.transitionStart(true, swiper.swipeDirection);
                    swiper.animating = true;
                    utils_elementTransitionEnd(wrapperEl, (() => {
                        if (!swiper || swiper.destroyed || !data.allowMomentumBounce) return;
                        emit("momentumBounce");
                        swiper.setTransition(params.speed);
                        setTimeout((() => {
                            swiper.setTranslate(afterBouncePosition);
                            utils_elementTransitionEnd(wrapperEl, (() => {
                                if (!swiper || swiper.destroyed) return;
                                swiper.transitionEnd();
                            }));
                        }), 0);
                    }));
                } else if (swiper.velocity) {
                    emit("_freeModeNoMomentumRelease");
                    swiper.updateProgress(newPosition);
                    swiper.setTransition(momentumDuration);
                    swiper.setTranslate(newPosition);
                    swiper.transitionStart(true, swiper.swipeDirection);
                    if (!swiper.animating) {
                        swiper.animating = true;
                        utils_elementTransitionEnd(wrapperEl, (() => {
                            if (!swiper || swiper.destroyed) return;
                            swiper.transitionEnd();
                        }));
                    }
                } else swiper.updateProgress(newPosition);
                swiper.updateActiveIndex();
                swiper.updateSlidesClasses();
            } else if (params.freeMode.sticky) {
                swiper.slideToClosest();
                return;
            } else if (params.freeMode) emit("_freeModeNoMomentumRelease");
            if (!params.freeMode.momentum || timeDiff >= params.longSwipesMs) {
                emit("_freeModeStaticRelease");
                swiper.updateProgress();
                swiper.updateActiveIndex();
                swiper.updateSlidesClasses();
            }
        }
        Object.assign(swiper, {
            freeMode: {
                onTouchStart,
                onTouchMove,
                onTouchEnd
            }
        });
    }
    function initSliders() {
        if (document.querySelector(".card-slider")) {
            new swiper_core_Swiper(".card-slider", {
                modules: [ Navigation, Mousewheel, freeMode, Pagination ],
                observer: true,
                observeParents: true,
                spaceBetween: 12,
                autoHeight: true,
                speed: 800,
                freeMode: true,
                mousewheel: {
                    sensitivity: 1
                },
                navigation: {
                    prevEl: ".swiper-button-prev",
                    nextEl: ".swiper-button-next"
                },
                pagination: {
                    el: ".swiper-pagination",
                    type: "fraction",
                    renderFraction: function(currentClass, totalClass) {
                        return '<span class="' + currentClass + '"></span>' + " / " + '<span class="' + totalClass + '"></span>';
                    },
                    formatFractionCurrent: function(number) {
                        return number < 10 ? "0" + number : number;
                    },
                    formatFractionTotal: function(number) {
                        return number < 10 ? "0" + number : number;
                    }
                },
                breakpoints: {
                    320: {
                        slidesPerView: 1,
                        spaceBetween: 10,
                        direction: "horizontal",
                        loop: false,
                        freeMode: false
                    },
                    992: {
                        slidesPerView: 4,
                        spaceBetween: 12,
                        direction: "vertical",
                        loop: true
                    }
                }
            });
        }
    }
    window.addEventListener("load", (function(e) {
        initSliders();
    }));
    class ScrollWatcher {
        constructor(props) {
            let defaultConfig = {
                logging: true
            };
            this.config = Object.assign(defaultConfig, props);
            this.observer;
            !document.documentElement.classList.contains("watcher") ? this.scrollWatcherRun() : null;
        }
        scrollWatcherUpdate() {
            this.scrollWatcherRun();
        }
        scrollWatcherRun() {
            document.documentElement.classList.add("watcher");
            this.scrollWatcherConstructor(document.querySelectorAll("[data-watch]"));
        }
        scrollWatcherConstructor(items) {
            if (items.length) {
                this.scrollWatcherLogging(`Проснулся, слежу за объектами (${items.length})...`);
                let uniqParams = uniqArray(Array.from(items).map((function(item) {
                    return `${item.dataset.watchRoot ? item.dataset.watchRoot : null}|${item.dataset.watchMargin ? item.dataset.watchMargin : "0px"}|${item.dataset.watchThreshold ? item.dataset.watchThreshold : 0}`;
                })));
                uniqParams.forEach((uniqParam => {
                    let uniqParamArray = uniqParam.split("|");
                    let paramsWatch = {
                        root: uniqParamArray[0],
                        margin: uniqParamArray[1],
                        threshold: uniqParamArray[2]
                    };
                    let groupItems = Array.from(items).filter((function(item) {
                        let watchRoot = item.dataset.watchRoot ? item.dataset.watchRoot : null;
                        let watchMargin = item.dataset.watchMargin ? item.dataset.watchMargin : "0px";
                        let watchThreshold = item.dataset.watchThreshold ? item.dataset.watchThreshold : 0;
                        if (String(watchRoot) === paramsWatch.root && String(watchMargin) === paramsWatch.margin && String(watchThreshold) === paramsWatch.threshold) return item;
                    }));
                    let configWatcher = this.getScrollWatcherConfig(paramsWatch);
                    this.scrollWatcherInit(groupItems, configWatcher);
                }));
            } else this.scrollWatcherLogging("Сплю, нет объектов для слежения. ZzzZZzz");
        }
        getScrollWatcherConfig(paramsWatch) {
            let configWatcher = {};
            if (document.querySelector(paramsWatch.root)) configWatcher.root = document.querySelector(paramsWatch.root); else if (paramsWatch.root !== "null") this.scrollWatcherLogging(`Эмм... родительского объекта ${paramsWatch.root} нет на странице`);
            configWatcher.rootMargin = paramsWatch.margin;
            if (paramsWatch.margin.indexOf("px") < 0 && paramsWatch.margin.indexOf("%") < 0) {
                this.scrollWatcherLogging(`Ой ой, настройку data-watch-margin нужно задавать в PX или %`);
                return;
            }
            if (paramsWatch.threshold === "prx") {
                paramsWatch.threshold = [];
                for (let i = 0; i <= 1; i += .005) paramsWatch.threshold.push(i);
            } else paramsWatch.threshold = paramsWatch.threshold.split(",");
            configWatcher.threshold = paramsWatch.threshold;
            return configWatcher;
        }
        scrollWatcherCreate(configWatcher) {
            this.observer = new IntersectionObserver(((entries, observer) => {
                entries.forEach((entry => {
                    this.scrollWatcherCallback(entry, observer);
                }));
            }), configWatcher);
        }
        scrollWatcherInit(items, configWatcher) {
            this.scrollWatcherCreate(configWatcher);
            items.forEach((item => this.observer.observe(item)));
        }
        scrollWatcherIntersecting(entry, targetElement) {
            if (entry.isIntersecting) {
                !targetElement.classList.contains("_watcher-view") ? targetElement.classList.add("_watcher-view") : null;
                this.scrollWatcherLogging(`Я вижу ${targetElement.classList}, добавил класс _watcher-view`);
            } else {
                targetElement.classList.contains("_watcher-view") ? targetElement.classList.remove("_watcher-view") : null;
                this.scrollWatcherLogging(`Я не вижу ${targetElement.classList}, убрал класс _watcher-view`);
            }
        }
        scrollWatcherOff(targetElement, observer) {
            observer.unobserve(targetElement);
            this.scrollWatcherLogging(`Я перестал следить за ${targetElement.classList}`);
        }
        scrollWatcherLogging(message) {
            this.config.logging ? functions_FLS(`[Наблюдатель]: ${message}`) : null;
        }
        scrollWatcherCallback(entry, observer) {
            const targetElement = entry.target;
            this.scrollWatcherIntersecting(entry, targetElement);
            targetElement.hasAttribute("data-watch-once") && entry.isIntersecting ? this.scrollWatcherOff(targetElement, observer) : null;
            document.dispatchEvent(new CustomEvent("watcherCallback", {
                detail: {
                    entry
                }
            }));
        }
    }
    modules_flsModules.watcher = new ScrollWatcher({});
    let addWindowScrollEvent = false;
    function pageNavigation() {
        document.addEventListener("click", pageNavigationAction);
        document.addEventListener("watcherCallback", pageNavigationAction);
        function pageNavigationAction(e) {
            if (e.type === "click") {
                const targetElement = e.target;
                if (targetElement.closest("[data-goto]")) {
                    const gotoLink = targetElement.closest("[data-goto]");
                    const gotoLinkSelector = gotoLink.dataset.goto ? gotoLink.dataset.goto : "";
                    const noHeader = gotoLink.hasAttribute("data-goto-header") ? true : false;
                    const gotoSpeed = gotoLink.dataset.gotoSpeed ? gotoLink.dataset.gotoSpeed : 500;
                    const offsetTop = gotoLink.dataset.gotoTop ? parseInt(gotoLink.dataset.gotoTop) : 0;
                    gotoblock_gotoBlock(gotoLinkSelector, noHeader, gotoSpeed, offsetTop);
                    e.preventDefault();
                }
            } else if (e.type === "watcherCallback" && e.detail) {
                const entry = e.detail.entry;
                const targetElement = entry.target;
                if (targetElement.dataset.watch === "navigator") {
                    document.querySelector(`[data-goto]._navigator-active`);
                    let navigatorCurrentItem;
                    if (targetElement.id && document.querySelector(`[data-goto="#${targetElement.id}"]`)) navigatorCurrentItem = document.querySelector(`[data-goto="#${targetElement.id}"]`); else if (targetElement.classList.length) for (let index = 0; index < targetElement.classList.length; index++) {
                        const element = targetElement.classList[index];
                        if (document.querySelector(`[data-goto=".${element}"]`)) {
                            navigatorCurrentItem = document.querySelector(`[data-goto=".${element}"]`);
                            break;
                        }
                    }
                    if (entry.isIntersecting) navigatorCurrentItem ? navigatorCurrentItem.classList.add("_navigator-active") : null; else navigatorCurrentItem ? navigatorCurrentItem.classList.remove("_navigator-active") : null;
                }
            }
        }
        if (getHash()) {
            let goToHash;
            if (document.querySelector(`#${getHash()}`)) goToHash = `#${getHash()}`; else if (document.querySelector(`.${getHash()}`)) goToHash = `.${getHash()}`;
            goToHash ? gotoblock_gotoBlock(goToHash, true, 500, 20) : null;
        }
    }
    setTimeout((() => {
        if (addWindowScrollEvent) {
            let windowScroll = new Event("windowScroll");
            window.addEventListener("scroll", (function(e) {
                document.dispatchEvent(windowScroll);
            }));
        }
    }), 0);
    function DynamicAdapt(type) {
        this.type = type;
    }
    DynamicAdapt.prototype.init = function() {
        const _this = this;
        this.оbjects = [];
        this.daClassname = "_dynamic_adapt_";
        this.nodes = document.querySelectorAll("[data-da]");
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            const data = node.dataset.da.trim();
            const dataArray = data.split(",");
            const оbject = {};
            оbject.element = node;
            оbject.parent = node.parentNode;
            оbject.destination = document.querySelector(dataArray[0].trim());
            оbject.breakpoint = dataArray[1] ? dataArray[1].trim() : "767";
            оbject.place = dataArray[2] ? dataArray[2].trim() : "last";
            оbject.index = this.indexInParent(оbject.parent, оbject.element);
            this.оbjects.push(оbject);
        }
        this.arraySort(this.оbjects);
        this.mediaQueries = Array.prototype.map.call(this.оbjects, (function(item) {
            return "(" + this.type + "-width: " + item.breakpoint + "px)," + item.breakpoint;
        }), this);
        this.mediaQueries = Array.prototype.filter.call(this.mediaQueries, (function(item, index, self) {
            return Array.prototype.indexOf.call(self, item) === index;
        }));
        for (let i = 0; i < this.mediaQueries.length; i++) {
            const media = this.mediaQueries[i];
            const mediaSplit = String.prototype.split.call(media, ",");
            const matchMedia = window.matchMedia(mediaSplit[0]);
            const mediaBreakpoint = mediaSplit[1];
            const оbjectsFilter = Array.prototype.filter.call(this.оbjects, (function(item) {
                return item.breakpoint === mediaBreakpoint;
            }));
            matchMedia.addListener((function() {
                _this.mediaHandler(matchMedia, оbjectsFilter);
            }));
            this.mediaHandler(matchMedia, оbjectsFilter);
        }
    };
    DynamicAdapt.prototype.mediaHandler = function(matchMedia, оbjects) {
        if (matchMedia.matches) for (let i = 0; i < оbjects.length; i++) {
            const оbject = оbjects[i];
            оbject.index = this.indexInParent(оbject.parent, оbject.element);
            this.moveTo(оbject.place, оbject.element, оbject.destination);
        } else for (let i = оbjects.length - 1; i >= 0; i--) {
            const оbject = оbjects[i];
            if (оbject.element.classList.contains(this.daClassname)) this.moveBack(оbject.parent, оbject.element, оbject.index);
        }
    };
    DynamicAdapt.prototype.moveTo = function(place, element, destination) {
        element.classList.add(this.daClassname);
        if (place === "last" || place >= destination.children.length) {
            destination.insertAdjacentElement("beforeend", element);
            return;
        }
        if (place === "first") {
            destination.insertAdjacentElement("afterbegin", element);
            return;
        }
        destination.children[place].insertAdjacentElement("beforebegin", element);
    };
    DynamicAdapt.prototype.moveBack = function(parent, element, index) {
        element.classList.remove(this.daClassname);
        if (parent.children[index] !== void 0) parent.children[index].insertAdjacentElement("beforebegin", element); else parent.insertAdjacentElement("beforeend", element);
    };
    DynamicAdapt.prototype.indexInParent = function(parent, element) {
        const array = Array.prototype.slice.call(parent.children);
        return Array.prototype.indexOf.call(array, element);
    };
    DynamicAdapt.prototype.arraySort = function(arr) {
        if (this.type === "min") Array.prototype.sort.call(arr, (function(a, b) {
            if (a.breakpoint === b.breakpoint) {
                if (a.place === b.place) return 0;
                if (a.place === "first" || b.place === "last") return -1;
                if (a.place === "last" || b.place === "first") return 1;
                return a.place - b.place;
            }
            return a.breakpoint - b.breakpoint;
        })); else {
            Array.prototype.sort.call(arr, (function(a, b) {
                if (a.breakpoint === b.breakpoint) {
                    if (a.place === b.place) return 0;
                    if (a.place === "first" || b.place === "last") return 1;
                    if (a.place === "last" || b.place === "first") return -1;
                    return b.place - a.place;
                }
                return b.breakpoint - a.breakpoint;
            }));
            return;
        }
    };
    const da = new DynamicAdapt("max");
    da.init();
    (() => {
        var t = {
            5861: (t, e, n) => {
                var i = n(3921);
                t.exports = i;
            },
            3740: (t, e, n) => {
                var i = n(5823);
                t.exports = i;
            },
            909: (t, e, n) => {
                var i = n(6575);
                t.exports = i;
            },
            5354: (t, e, n) => {
                n(7327);
                var i = n(2649);
                t.exports = i("Array", "filter");
            },
            817: (t, e, n) => {
                n(9554);
                var i = n(2649);
                t.exports = i("Array", "forEach");
            },
            3462: (t, e, n) => {
                n(6699);
                var i = n(2649);
                t.exports = i("Array", "includes");
            },
            6139: (t, e, n) => {
                n(7037);
            },
            7528: (t, e, n) => {
                n(4978);
            },
            4577: (t, e, n) => {
                n(9059);
            },
            7037: (t, e, n) => {
                var i = n(5861);
                t.exports = i;
            },
            4978: (t, e, n) => {
                var i = n(3740);
                t.exports = i;
            },
            9059: (t, e, n) => {
                var i = n(909);
                t.exports = i;
            },
            9662: (t, e, n) => {
                var i = n(614), o = n(6330), r = TypeError;
                t.exports = function(t) {
                    if (i(t)) return t;
                    throw r(o(t) + " is not a function");
                };
            },
            1223: (t, e, n) => {
                var i = n(5112), o = n(30), r = n(3070).f, a = i("unscopables"), s = Array.prototype;
                null == s[a] && r(s, a, {
                    configurable: !0,
                    value: o(null)
                }), t.exports = function(t) {
                    s[a][t] = !0;
                };
            },
            9670: (t, e, n) => {
                var i = n(111), o = String, r = TypeError;
                t.exports = function(t) {
                    if (i(t)) return t;
                    throw r(o(t) + " is not an object");
                };
            },
            8533: (t, e, n) => {
                "use strict";
                var i = n(2092).forEach, o = n(9341)("forEach");
                t.exports = o ? [].forEach : function(t) {
                    return i(this, t, arguments.length > 1 ? arguments[1] : void 0);
                };
            },
            1318: (t, e, n) => {
                var i = n(5656), o = n(1400), r = n(6244), a = function(t) {
                    return function(e, n, a) {
                        var s, c = i(e), u = r(c), l = o(a, u);
                        if (t && n != n) {
                            for (;u > l; ) if ((s = c[l++]) != s) return !0;
                        } else for (;u > l; l++) if ((t || l in c) && c[l] === n) return t || l || 0;
                        return !t && -1;
                    };
                };
                t.exports = {
                    includes: a(!0),
                    indexOf: a(!1)
                };
            },
            2092: (t, e, n) => {
                var i = n(9974), o = n(1702), r = n(8361), a = n(7908), s = n(6244), c = n(5417), u = o([].push), l = function(t) {
                    var e = 1 == t, n = 2 == t, o = 3 == t, l = 4 == t, d = 6 == t, h = 7 == t, f = 5 == t || d;
                    return function(p, m, v, g) {
                        for (var y, b, w = a(p), x = r(w), I = i(m, v), O = s(x), k = 0, E = g || c, S = e ? E(p, O) : n || h ? E(p, 0) : void 0; O > k; k++) if ((f || k in x) && (b = I(y = x[k], k, w), 
                        t)) if (e) S[k] = b; else if (b) switch (t) {
                          case 3:
                            return !0;

                          case 5:
                            return y;

                          case 6:
                            return k;

                          case 2:
                            u(S, y);
                        } else switch (t) {
                          case 4:
                            return !1;

                          case 7:
                            u(S, y);
                        }
                        return d ? -1 : o || l ? l : S;
                    };
                };
                t.exports = {
                    forEach: l(0),
                    map: l(1),
                    filter: l(2),
                    some: l(3),
                    every: l(4),
                    find: l(5),
                    findIndex: l(6),
                    filterReject: l(7)
                };
            },
            1194: (t, e, n) => {
                var i = n(7293), o = n(5112), r = n(7392), a = o("species");
                t.exports = function(t) {
                    return r >= 51 || !i((function() {
                        var e = [];
                        return (e.constructor = {})[a] = function() {
                            return {
                                foo: 1
                            };
                        }, 1 !== e[t](Boolean).foo;
                    }));
                };
            },
            9341: (t, e, n) => {
                "use strict";
                var i = n(7293);
                t.exports = function(t, e) {
                    var n = [][t];
                    return !!n && i((function() {
                        n.call(null, e || function() {
                            return 1;
                        }, 1);
                    }));
                };
            },
            7475: (t, e, n) => {
                var i = n(3157), o = n(4411), r = n(111), a = n(5112)("species"), s = Array;
                t.exports = function(t) {
                    var e;
                    return i(t) && (e = t.constructor, (o(e) && (e === s || i(e.prototype)) || r(e) && null === (e = e[a])) && (e = void 0)), 
                    void 0 === e ? s : e;
                };
            },
            5417: (t, e, n) => {
                var i = n(7475);
                t.exports = function(t, e) {
                    return new (i(t))(0 === e ? 0 : e);
                };
            },
            4326: (t, e, n) => {
                var i = n(1702), o = i({}.toString), r = i("".slice);
                t.exports = function(t) {
                    return r(o(t), 8, -1);
                };
            },
            648: (t, e, n) => {
                var i = n(1694), o = n(614), r = n(4326), a = n(5112)("toStringTag"), s = Object, c = "Arguments" == r(function() {
                    return arguments;
                }());
                t.exports = i ? r : function(t) {
                    var e, n, i;
                    return void 0 === t ? "Undefined" : null === t ? "Null" : "string" == typeof (n = function(t, e) {
                        try {
                            return t[e];
                        } catch (t) {}
                    }(e = s(t), a)) ? n : c ? r(e) : "Object" == (i = r(e)) && o(e.callee) ? "Arguments" : i;
                };
            },
            9920: (t, e, n) => {
                var i = n(2597), o = n(3887), r = n(1236), a = n(3070);
                t.exports = function(t, e, n) {
                    for (var s = o(e), c = a.f, u = r.f, l = 0; l < s.length; l++) {
                        var d = s[l];
                        i(t, d) || n && i(n, d) || c(t, d, u(e, d));
                    }
                };
            },
            8880: (t, e, n) => {
                var i = n(9781), o = n(3070), r = n(9114);
                t.exports = i ? function(t, e, n) {
                    return o.f(t, e, r(1, n));
                } : function(t, e, n) {
                    return t[e] = n, t;
                };
            },
            9114: t => {
                t.exports = function(t, e) {
                    return {
                        enumerable: !(1 & t),
                        configurable: !(2 & t),
                        writable: !(4 & t),
                        value: e
                    };
                };
            },
            8052: (t, e, n) => {
                var i = n(614), o = n(3070), r = n(6339), a = n(3072);
                t.exports = function(t, e, n, s) {
                    s || (s = {});
                    var c = s.enumerable, u = void 0 !== s.name ? s.name : e;
                    if (i(n) && r(n, u, s), s.global) c ? t[e] = n : a(e, n); else {
                        try {
                            s.unsafe ? t[e] && (c = !0) : delete t[e];
                        } catch (t) {}
                        c ? t[e] = n : o.f(t, e, {
                            value: n,
                            enumerable: !1,
                            configurable: !s.nonConfigurable,
                            writable: !s.nonWritable
                        });
                    }
                    return t;
                };
            },
            3072: (t, e, n) => {
                var i = n(7854), o = Object.defineProperty;
                t.exports = function(t, e) {
                    try {
                        o(i, t, {
                            value: e,
                            configurable: !0,
                            writable: !0
                        });
                    } catch (n) {
                        i[t] = e;
                    }
                    return e;
                };
            },
            9781: (t, e, n) => {
                var i = n(7293);
                t.exports = !i((function() {
                    return 7 != Object.defineProperty({}, 1, {
                        get: function() {
                            return 7;
                        }
                    })[1];
                }));
            },
            4154: t => {
                var e = "object" == typeof document && document.all, n = void 0 === e && void 0 !== e;
                t.exports = {
                    all: e,
                    IS_HTMLDDA: n
                };
            },
            317: (t, e, n) => {
                var i = n(7854), o = n(111), r = i.document, a = o(r) && o(r.createElement);
                t.exports = function(t) {
                    return a ? r.createElement(t) : {};
                };
            },
            8113: t => {
                t.exports = "undefined" != typeof navigator && String(navigator.userAgent) || "";
            },
            7392: (t, e, n) => {
                var i, o, r = n(7854), a = n(8113), s = r.process, c = r.Deno, u = s && s.versions || c && c.version, l = u && u.v8;
                l && (o = (i = l.split("."))[0] > 0 && i[0] < 4 ? 1 : +(i[0] + i[1])), !o && a && (!(i = a.match(/Edge\/(\d+)/)) || i[1] >= 74) && (i = a.match(/Chrome\/(\d+)/)) && (o = +i[1]), 
                t.exports = o;
            },
            2649: (t, e, n) => {
                var i = n(7854), o = n(1702);
                t.exports = function(t, e) {
                    return o(i[t].prototype[e]);
                };
            },
            748: t => {
                t.exports = [ "constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf" ];
            },
            2109: (t, e, n) => {
                var i = n(7854), o = n(1236).f, r = n(8880), a = n(8052), s = n(3072), c = n(9920), u = n(4705);
                t.exports = function(t, e) {
                    var n, l, d, h, f, p = t.target, m = t.global, v = t.stat;
                    if (n = m ? i : v ? i[p] || s(p, {}) : (i[p] || {}).prototype) for (l in e) {
                        if (h = e[l], d = t.dontCallGetSet ? (f = o(n, l)) && f.value : n[l], !u(m ? l : p + (v ? "." : "#") + l, t.forced) && void 0 !== d) {
                            if (typeof h == typeof d) continue;
                            c(h, d);
                        }
                        (t.sham || d && d.sham) && r(h, "sham", !0), a(n, l, h, t);
                    }
                };
            },
            7293: t => {
                t.exports = function(t) {
                    try {
                        return !!t();
                    } catch (t) {
                        return !0;
                    }
                };
            },
            9974: (t, e, n) => {
                var i = n(1470), o = n(9662), r = n(4374), a = i(i.bind);
                t.exports = function(t, e) {
                    return o(t), void 0 === e ? t : r ? a(t, e) : function() {
                        return t.apply(e, arguments);
                    };
                };
            },
            4374: (t, e, n) => {
                var i = n(7293);
                t.exports = !i((function() {
                    var t = function() {}.bind();
                    return "function" != typeof t || t.hasOwnProperty("prototype");
                }));
            },
            6916: (t, e, n) => {
                var i = n(4374), o = Function.prototype.call;
                t.exports = i ? o.bind(o) : function() {
                    return o.apply(o, arguments);
                };
            },
            6530: (t, e, n) => {
                var i = n(9781), o = n(2597), r = Function.prototype, a = i && Object.getOwnPropertyDescriptor, s = o(r, "name"), c = s && "something" === function() {}.name, u = s && (!i || i && a(r, "name").configurable);
                t.exports = {
                    EXISTS: s,
                    PROPER: c,
                    CONFIGURABLE: u
                };
            },
            1470: (t, e, n) => {
                var i = n(4326), o = n(1702);
                t.exports = function(t) {
                    if ("Function" === i(t)) return o(t);
                };
            },
            1702: (t, e, n) => {
                var i = n(4374), o = Function.prototype, r = o.call, a = i && o.bind.bind(r, r);
                t.exports = i ? a : function(t) {
                    return function() {
                        return r.apply(t, arguments);
                    };
                };
            },
            5005: (t, e, n) => {
                var i = n(7854), o = n(614);
                t.exports = function(t, e) {
                    return arguments.length < 2 ? (n = i[t], o(n) ? n : void 0) : i[t] && i[t][e];
                    var n;
                };
            },
            8173: (t, e, n) => {
                var i = n(9662), o = n(8554);
                t.exports = function(t, e) {
                    var n = t[e];
                    return o(n) ? void 0 : i(n);
                };
            },
            7854: (t, e, n) => {
                var i = function(t) {
                    return t && t.Math == Math && t;
                };
                t.exports = i("object" == typeof globalThis && globalThis) || i("object" == typeof window && window) || i("object" == typeof self && self) || i("object" == typeof n.g && n.g) || function() {
                    return this;
                }() || Function("return this")();
            },
            2597: (t, e, n) => {
                var i = n(1702), o = n(7908), r = i({}.hasOwnProperty);
                t.exports = Object.hasOwn || function(t, e) {
                    return r(o(t), e);
                };
            },
            3501: t => {
                t.exports = {};
            },
            490: (t, e, n) => {
                var i = n(5005);
                t.exports = i("document", "documentElement");
            },
            4664: (t, e, n) => {
                var i = n(9781), o = n(7293), r = n(317);
                t.exports = !i && !o((function() {
                    return 7 != Object.defineProperty(r("div"), "a", {
                        get: function() {
                            return 7;
                        }
                    }).a;
                }));
            },
            8361: (t, e, n) => {
                var i = n(1702), o = n(7293), r = n(4326), a = Object, s = i("".split);
                t.exports = o((function() {
                    return !a("z").propertyIsEnumerable(0);
                })) ? function(t) {
                    return "String" == r(t) ? s(t, "") : a(t);
                } : a;
            },
            2788: (t, e, n) => {
                var i = n(1702), o = n(614), r = n(5465), a = i(Function.toString);
                o(r.inspectSource) || (r.inspectSource = function(t) {
                    return a(t);
                }), t.exports = r.inspectSource;
            },
            9909: (t, e, n) => {
                var i, o, r, a = n(4811), s = n(7854), c = n(111), u = n(8880), l = n(2597), d = n(5465), h = n(6200), f = n(3501), p = "Object already initialized", m = s.TypeError, v = s.WeakMap;
                if (a || d.state) {
                    var g = d.state || (d.state = new v);
                    g.get = g.get, g.has = g.has, g.set = g.set, i = function(t, e) {
                        if (g.has(t)) throw m(p);
                        return e.facade = t, g.set(t, e), e;
                    }, o = function(t) {
                        return g.get(t) || {};
                    }, r = function(t) {
                        return g.has(t);
                    };
                } else {
                    var y = h("state");
                    f[y] = !0, i = function(t, e) {
                        if (l(t, y)) throw m(p);
                        return e.facade = t, u(t, y, e), e;
                    }, o = function(t) {
                        return l(t, y) ? t[y] : {};
                    }, r = function(t) {
                        return l(t, y);
                    };
                }
                t.exports = {
                    set: i,
                    get: o,
                    has: r,
                    enforce: function(t) {
                        return r(t) ? o(t) : i(t, {});
                    },
                    getterFor: function(t) {
                        return function(e) {
                            var n;
                            if (!c(e) || (n = o(e)).type !== t) throw m("Incompatible receiver, " + t + " required");
                            return n;
                        };
                    }
                };
            },
            3157: (t, e, n) => {
                var i = n(4326);
                t.exports = Array.isArray || function(t) {
                    return "Array" == i(t);
                };
            },
            614: (t, e, n) => {
                var i = n(4154), o = i.all;
                t.exports = i.IS_HTMLDDA ? function(t) {
                    return "function" == typeof t || t === o;
                } : function(t) {
                    return "function" == typeof t;
                };
            },
            4411: (t, e, n) => {
                var i = n(1702), o = n(7293), r = n(614), a = n(648), s = n(5005), c = n(2788), u = function() {}, l = [], d = s("Reflect", "construct"), h = /^\s*(?:class|function)\b/, f = i(h.exec), p = !h.exec(u), m = function(t) {
                    if (!r(t)) return !1;
                    try {
                        return d(u, l, t), !0;
                    } catch (t) {
                        return !1;
                    }
                }, v = function(t) {
                    if (!r(t)) return !1;
                    switch (a(t)) {
                      case "AsyncFunction":
                      case "GeneratorFunction":
                      case "AsyncGeneratorFunction":
                        return !1;
                    }
                    try {
                        return p || !!f(h, c(t));
                    } catch (t) {
                        return !0;
                    }
                };
                v.sham = !0, t.exports = !d || o((function() {
                    var t;
                    return m(m.call) || !m(Object) || !m((function() {
                        t = !0;
                    })) || t;
                })) ? v : m;
            },
            4705: (t, e, n) => {
                var i = n(7293), o = n(614), r = /#|\.prototype\./, a = function(t, e) {
                    var n = c[s(t)];
                    return n == l || n != u && (o(e) ? i(e) : !!e);
                }, s = a.normalize = function(t) {
                    return String(t).replace(r, ".").toLowerCase();
                }, c = a.data = {}, u = a.NATIVE = "N", l = a.POLYFILL = "P";
                t.exports = a;
            },
            8554: t => {
                t.exports = function(t) {
                    return null == t;
                };
            },
            111: (t, e, n) => {
                var i = n(614), o = n(4154), r = o.all;
                t.exports = o.IS_HTMLDDA ? function(t) {
                    return "object" == typeof t ? null !== t : i(t) || t === r;
                } : function(t) {
                    return "object" == typeof t ? null !== t : i(t);
                };
            },
            1913: t => {
                t.exports = !1;
            },
            2190: (t, e, n) => {
                var i = n(5005), o = n(614), r = n(7976), a = n(3307), s = Object;
                t.exports = a ? function(t) {
                    return "symbol" == typeof t;
                } : function(t) {
                    var e = i("Symbol");
                    return o(e) && r(e.prototype, s(t));
                };
            },
            6244: (t, e, n) => {
                var i = n(7466);
                t.exports = function(t) {
                    return i(t.length);
                };
            },
            6339: (t, e, n) => {
                var i = n(1702), o = n(7293), r = n(614), a = n(2597), s = n(9781), c = n(6530).CONFIGURABLE, u = n(2788), l = n(9909), d = l.enforce, h = l.get, f = String, p = Object.defineProperty, m = i("".slice), v = i("".replace), g = i([].join), y = s && !o((function() {
                    return 8 !== p((function() {}), "length", {
                        value: 8
                    }).length;
                })), b = String(String).split("String"), w = t.exports = function(t, e, n) {
                    "Symbol(" === m(f(e), 0, 7) && (e = "[" + v(f(e), /^Symbol\(([^)]*)\)/, "$1") + "]"), 
                    n && n.getter && (e = "get " + e), n && n.setter && (e = "set " + e), (!a(t, "name") || c && t.name !== e) && (s ? p(t, "name", {
                        value: e,
                        configurable: !0
                    }) : t.name = e), y && n && a(n, "arity") && t.length !== n.arity && p(t, "length", {
                        value: n.arity
                    });
                    try {
                        n && a(n, "constructor") && n.constructor ? s && p(t, "prototype", {
                            writable: !1
                        }) : t.prototype && (t.prototype = void 0);
                    } catch (t) {}
                    var i = d(t);
                    return a(i, "source") || (i.source = g(b, "string" == typeof e ? e : "")), t;
                };
                Function.prototype.toString = w((function() {
                    return r(this) && h(this).source || u(this);
                }), "toString");
            },
            4758: t => {
                var e = Math.ceil, n = Math.floor;
                t.exports = Math.trunc || function(t) {
                    var i = +t;
                    return (i > 0 ? n : e)(i);
                };
            },
            30: (t, e, n) => {
                var i, o = n(9670), r = n(6048), a = n(748), s = n(3501), c = n(490), u = n(317), l = n(6200), d = "prototype", h = "script", f = l("IE_PROTO"), p = function() {}, m = function(t) {
                    return "<" + h + ">" + t + "</" + h + ">";
                }, v = function(t) {
                    t.write(m("")), t.close();
                    var e = t.parentWindow.Object;
                    return t = null, e;
                }, g = function() {
                    try {
                        i = new ActiveXObject("htmlfile");
                    } catch (t) {}
                    var t, e, n;
                    g = "undefined" != typeof document ? document.domain && i ? v(i) : (e = u("iframe"), 
                    n = "java" + h + ":", e.style.display = "none", c.appendChild(e), e.src = String(n), 
                    (t = e.contentWindow.document).open(), t.write(m("document.F=Object")), t.close(), 
                    t.F) : v(i);
                    for (var o = a.length; o--; ) delete g[d][a[o]];
                    return g();
                };
                s[f] = !0, t.exports = Object.create || function(t, e) {
                    var n;
                    return null !== t ? (p[d] = o(t), n = new p, p[d] = null, n[f] = t) : n = g(), void 0 === e ? n : r.f(n, e);
                };
            },
            6048: (t, e, n) => {
                var i = n(9781), o = n(3353), r = n(3070), a = n(9670), s = n(5656), c = n(1956);
                e.f = i && !o ? Object.defineProperties : function(t, e) {
                    a(t);
                    for (var n, i = s(e), o = c(e), u = o.length, l = 0; u > l; ) r.f(t, n = o[l++], i[n]);
                    return t;
                };
            },
            3070: (t, e, n) => {
                var i = n(9781), o = n(4664), r = n(3353), a = n(9670), s = n(4948), c = TypeError, u = Object.defineProperty, l = Object.getOwnPropertyDescriptor, d = "enumerable", h = "configurable", f = "writable";
                e.f = i ? r ? function(t, e, n) {
                    if (a(t), e = s(e), a(n), "function" == typeof t && "prototype" === e && "value" in n && f in n && !n[f]) {
                        var i = l(t, e);
                        i && i[f] && (t[e] = n.value, n = {
                            configurable: h in n ? n[h] : i[h],
                            enumerable: d in n ? n[d] : i[d],
                            writable: !1
                        });
                    }
                    return u(t, e, n);
                } : u : function(t, e, n) {
                    if (a(t), e = s(e), a(n), o) try {
                        return u(t, e, n);
                    } catch (t) {}
                    if ("get" in n || "set" in n) throw c("Accessors not supported");
                    return "value" in n && (t[e] = n.value), t;
                };
            },
            1236: (t, e, n) => {
                var i = n(9781), o = n(6916), r = n(5296), a = n(9114), s = n(5656), c = n(4948), u = n(2597), l = n(4664), d = Object.getOwnPropertyDescriptor;
                e.f = i ? d : function(t, e) {
                    if (t = s(t), e = c(e), l) try {
                        return d(t, e);
                    } catch (t) {}
                    if (u(t, e)) return a(!o(r.f, t, e), t[e]);
                };
            },
            8006: (t, e, n) => {
                var i = n(6324), o = n(748).concat("length", "prototype");
                e.f = Object.getOwnPropertyNames || function(t) {
                    return i(t, o);
                };
            },
            5181: (t, e) => {
                e.f = Object.getOwnPropertySymbols;
            },
            7976: (t, e, n) => {
                var i = n(1702);
                t.exports = i({}.isPrototypeOf);
            },
            6324: (t, e, n) => {
                var i = n(1702), o = n(2597), r = n(5656), a = n(1318).indexOf, s = n(3501), c = i([].push);
                t.exports = function(t, e) {
                    var n, i = r(t), u = 0, l = [];
                    for (n in i) !o(s, n) && o(i, n) && c(l, n);
                    for (;e.length > u; ) o(i, n = e[u++]) && (~a(l, n) || c(l, n));
                    return l;
                };
            },
            1956: (t, e, n) => {
                var i = n(6324), o = n(748);
                t.exports = Object.keys || function(t) {
                    return i(t, o);
                };
            },
            5296: (t, e) => {
                "use strict";
                var n = {}.propertyIsEnumerable, i = Object.getOwnPropertyDescriptor, o = i && !n.call({
                    1: 2
                }, 1);
                e.f = o ? function(t) {
                    var e = i(this, t);
                    return !!e && e.enumerable;
                } : n;
            },
            2140: (t, e, n) => {
                var i = n(6916), o = n(614), r = n(111), a = TypeError;
                t.exports = function(t, e) {
                    var n, s;
                    if ("string" === e && o(n = t.toString) && !r(s = i(n, t))) return s;
                    if (o(n = t.valueOf) && !r(s = i(n, t))) return s;
                    if ("string" !== e && o(n = t.toString) && !r(s = i(n, t))) return s;
                    throw a("Can't convert object to primitive value");
                };
            },
            3887: (t, e, n) => {
                var i = n(5005), o = n(1702), r = n(8006), a = n(5181), s = n(9670), c = o([].concat);
                t.exports = i("Reflect", "ownKeys") || function(t) {
                    var e = r.f(s(t)), n = a.f;
                    return n ? c(e, n(t)) : e;
                };
            },
            4488: (t, e, n) => {
                var i = n(8554), o = TypeError;
                t.exports = function(t) {
                    if (i(t)) throw o("Can't call method on " + t);
                    return t;
                };
            },
            6200: (t, e, n) => {
                var i = n(2309), o = n(9711), r = i("keys");
                t.exports = function(t) {
                    return r[t] || (r[t] = o(t));
                };
            },
            5465: (t, e, n) => {
                var i = n(7854), o = n(3072), r = "__core-js_shared__", a = i[r] || o(r, {});
                t.exports = a;
            },
            2309: (t, e, n) => {
                var i = n(1913), o = n(5465);
                (t.exports = function(t, e) {
                    return o[t] || (o[t] = void 0 !== e ? e : {});
                })("versions", []).push({
                    version: "3.30.0",
                    mode: i ? "pure" : "global",
                    copyright: "© 2014-2023 Denis Pushkarev (zloirock.ru)",
                    license: "https://github.com/zloirock/core-js/blob/v3.30.0/LICENSE",
                    source: "https://github.com/zloirock/core-js"
                });
            },
            6293: (t, e, n) => {
                var i = n(7392), o = n(7293);
                t.exports = !!Object.getOwnPropertySymbols && !o((function() {
                    var t = Symbol();
                    return !String(t) || !(Object(t) instanceof Symbol) || !Symbol.sham && i && i < 41;
                }));
            },
            1400: (t, e, n) => {
                var i = n(9303), o = Math.max, r = Math.min;
                t.exports = function(t, e) {
                    var n = i(t);
                    return n < 0 ? o(n + e, 0) : r(n, e);
                };
            },
            5656: (t, e, n) => {
                var i = n(8361), o = n(4488);
                t.exports = function(t) {
                    return i(o(t));
                };
            },
            9303: (t, e, n) => {
                var i = n(4758);
                t.exports = function(t) {
                    var e = +t;
                    return e != e || 0 === e ? 0 : i(e);
                };
            },
            7466: (t, e, n) => {
                var i = n(9303), o = Math.min;
                t.exports = function(t) {
                    return t > 0 ? o(i(t), 9007199254740991) : 0;
                };
            },
            7908: (t, e, n) => {
                var i = n(4488), o = Object;
                t.exports = function(t) {
                    return o(i(t));
                };
            },
            7593: (t, e, n) => {
                var i = n(6916), o = n(111), r = n(2190), a = n(8173), s = n(2140), c = n(5112), u = TypeError, l = c("toPrimitive");
                t.exports = function(t, e) {
                    if (!o(t) || r(t)) return t;
                    var n, c = a(t, l);
                    if (c) {
                        if (void 0 === e && (e = "default"), n = i(c, t, e), !o(n) || r(n)) return n;
                        throw u("Can't convert object to primitive value");
                    }
                    return void 0 === e && (e = "number"), s(t, e);
                };
            },
            4948: (t, e, n) => {
                var i = n(7593), o = n(2190);
                t.exports = function(t) {
                    var e = i(t, "string");
                    return o(e) ? e : e + "";
                };
            },
            1694: (t, e, n) => {
                var i = {};
                i[n(5112)("toStringTag")] = "z", t.exports = "[object z]" === String(i);
            },
            6330: t => {
                var e = String;
                t.exports = function(t) {
                    try {
                        return e(t);
                    } catch (t) {
                        return "Object";
                    }
                };
            },
            9711: (t, e, n) => {
                var i = n(1702), o = 0, r = Math.random(), a = i(1..toString);
                t.exports = function(t) {
                    return "Symbol(" + (void 0 === t ? "" : t) + ")_" + a(++o + r, 36);
                };
            },
            3307: (t, e, n) => {
                var i = n(6293);
                t.exports = i && !Symbol.sham && "symbol" == typeof Symbol.iterator;
            },
            3353: (t, e, n) => {
                var i = n(9781), o = n(7293);
                t.exports = i && o((function() {
                    return 42 != Object.defineProperty((function() {}), "prototype", {
                        value: 42,
                        writable: !1
                    }).prototype;
                }));
            },
            4811: (t, e, n) => {
                var i = n(7854), o = n(614), r = i.WeakMap;
                t.exports = o(r) && /native code/.test(String(r));
            },
            5112: (t, e, n) => {
                var i = n(7854), o = n(2309), r = n(2597), a = n(9711), s = n(6293), c = n(3307), u = i.Symbol, l = o("wks"), d = c ? u.for || u : u && u.withoutSetter || a;
                t.exports = function(t) {
                    return r(l, t) || (l[t] = s && r(u, t) ? u[t] : d("Symbol." + t)), l[t];
                };
            },
            7327: (t, e, n) => {
                "use strict";
                var i = n(2109), o = n(2092).filter;
                i({
                    target: "Array",
                    proto: !0,
                    forced: !n(1194)("filter")
                }, {
                    filter: function(t) {
                        return o(this, t, arguments.length > 1 ? arguments[1] : void 0);
                    }
                });
            },
            9554: (t, e, n) => {
                "use strict";
                var i = n(2109), o = n(8533);
                i({
                    target: "Array",
                    proto: !0,
                    forced: [].forEach != o
                }, {
                    forEach: o
                });
            },
            6699: (t, e, n) => {
                "use strict";
                var i = n(2109), o = n(1318).includes, r = n(7293), a = n(1223);
                i({
                    target: "Array",
                    proto: !0,
                    forced: r((function() {
                        return !Array(1).includes();
                    }))
                }, {
                    includes: function(t) {
                        return o(this, t, arguments.length > 1 ? arguments[1] : void 0);
                    }
                }), a("includes");
            },
            3921: (t, e, n) => {
                var i = n(5354);
                t.exports = i;
            },
            5823: (t, e, n) => {
                var i = n(817);
                t.exports = i;
            },
            6575: (t, e, n) => {
                var i = n(3462);
                t.exports = i;
            },
            850: (t, e, n) => {
                (t.exports = n(3645)(!1)).push([ t.id, ".cloudimage-360-hotspot-link-icon {\n  width: 42px;\n  height: 42px;\n  background: rgba(12, 109, 199, 0.2);\n  border: 1px solid rgba(255, 255, 255, 0.2);\n  border-radius: 50%;\n  box-sizing: border-box;\n  transition: opacity 600ms ease-in-out;\n  cursor: auto;\n}\n\n.cloudimage-360-hotspot-link-icon::before {\n  content: '';\n  position: absolute;\n  width: 16px;\n  height: 16px;\n  background-image: url('https://scaleflex.cloudimg.io/v7/plugins/js-cloudimage-360-view/assets/img/link-hotspot.svg');\n  background-color: #0C6DC7;\n  background-repeat: no-repeat;\n  background-size: 9px;\n  background-position: center;\n  left: 50%;\n  top: 50%;\n  transform: translate(-50%, -50%);\n  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.25);\n  border-radius: 50%;\n\tanimation: pulse 2s infinite;\n  cursor: auto;\n}\n\n.cloudimage-360-hotspot-custom-icon {\n  width: 42px;\n  height: 42px;\n  background: #76AD0133;\n  border: 1px solid #FFFFFF33;\n  border-radius: 50%;\n  box-sizing: border-box;\n  transition: opacity 300ms ease-in-out;\n  cursor: auto;\n}\n\n.cloudimage-360-hotspot-custom-icon::before {\n  content: '';\n  position: absolute;\n  width: 16px;\n  height: 16px;\n  background-image: url('https://scaleflex.cloudimg.io/v7/plugins/js-cloudimage-360-view/assets/img/plus.svg');\n  background-color: #76AD01;\n  background-repeat: no-repeat;\n  background-size: 9px;\n  background-position: center;\n  left: 50%;\n  top: 50%;\n  transform: translate(-50%, -50%);\n  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.25);\n  border-radius: 50%;\n\tanimation: pulse 2s infinite;\n  cursor: auto;\n}\n\n.cloudimage-360-hotspot-popup {\n  visibility: hidden;\n  opacity: 0;\n  background-color: #FFFFFF;\n  padding: 6px;\n  border-radius: 2px;\n  box-shadow: 0px 4px 4px 0px #00000040;\n  z-index: 999;\n}\n\n.cloudimage-360-hotspot-popup[data-show] {\n  visibility: visible;\n  opacity: 1;\n}\n\n.cloudimage-360-popup-arrow,\n.cloudimage-360-popup-arrow::before {\n  position: absolute;\n  width: 8px;\n  height: 8px;\n  background: inherit;\n  cursor: 'auto';\n}\n\n.cloudimage-360-popup-arrow {\n  visibility: hidden;\n}\n\n.cloudimage-360-popup-arrow::before {\n  visibility: visible;\n  content: '';\n  transform: rotate(45deg);\n}\n\n.cloudimage-360-hotspot-popup[data-popper-placement^='top']\n  > .cloudimage-360-popup-arrow {\n  bottom: -4px;\n}\n\n.cloudimage-360-hotspot-popup[data-popper-placement^='bottom']\n  > .cloudimage-360-popup-arrow {\n  top: -4px;\n}\n\n.cloudimage-360-hotspot-popup[data-popper-placement^='left']\n  > .cloudimage-360-popup-arrow {\n  right: -4px;\n}\n\n.cloudimage-360-hotspot-popup[data-popper-placement^='right']\n  > .cloudimage-360-popup-arrow {\n  left: -4px;\n}\n\n.cloudimage-360-modal-wrapper {\n  max-width: 222px;\n}\n\n.cloudimage-360-images-carousel-wrapper {\n  margin: 0 auto;\n}\n\n.cloudimage-360-images-carousel {\n  background-color: #f5f4f4;\n  border-radius: 2px;\n}\n\n.cloudimage-360-images-carousel .cloudimage-360-carousel-image {\n  display: none;\n  object-fit: contain;\n  min-height: 187px;\n  max-width: 100%;\n  max-height: 100%;\n}\n\n.cloudimage-360-images-carousel .cloudimage-360-carousel-image.active-image {\n  display: block;\n  animation-name: fade-active-image;\n  animation-duration: 1.5s;\n}\n\n.cloudimage-360-carousel-dots {\n  display: flex;\n  column-gap: 6px;\n  justify-content: center;\n  flex-wrap: wrap;\n  margin: 5px auto;\n  row-gap: 3px;\n  padding: 0 6px;\n  width: 50%;\n}\n\n.cloudimage-360-carousel-dot {\n  width: 6px;\n  height: 6px;\n  background-color: #C9D0DE;\n  border-radius: 50%;\n  cursor: pointer;\n  transition: background-color 0.6s ease;\n  border: 0;\n  padding: 0;\n}\n\n.cloudimage-360-carousel-dot.active-dot {\n  background-color: #76AD01;\n}\n\n.cloudimage-360-carousel-dot:focus,\n.cloudimage-360-carousel-dot:focus-visible {\n  border: 0;\n  outline: 0;\n}\n\n.cloudimage-360-modal-title {\n  font-size: 12px;\n  font-weight: 700;\n  line-height: 16px;\n  margin: 4px 0;\n}\n\n.cloudimage-360-modal-description {\n  font-size: 10px;\n  font-weight: 400;\n  line-height: 16px;\n  margin: 4px 0;\n}\n\n.cloudimage-360-modal-more-details {\n  color: #76AD01;\n  background-color: #ECFAE6;\n  font-size: 10px;\n  line-height: 16px;\n  font-weight: 400;\n  padding: 4px 8px;\n  transition: background-color 200ms ease-in-out;\n  border-radius: 2px;\n  text-decoration: none;\n}\n\n.cloudimage-360-modal-more-details:hover {\n  color: #76AD01;\n  background-color: #e1f5d8;\n}\n\n@keyframes pulse {\n\t0% {\n\t\tbox-shadow: 0 0 0 0 rgba(99, 99, 99, 0.7);\n\t}\n\n\t70% {\n\t\tbox-shadow: 0 0 0 10px rgba(99, 99, 99, 0);\n\t}\n\n\t100% {\n\t\tbox-shadow: 0 0 0 0 rgba(99, 99, 99, 0);\n\t}\n}\n\n@keyframes fade-active-image {\n  from { opacity: 0.7 }\n  to { opacity: 1 }\n}", "" ]);
            },
            1860: (t, e, n) => {
                (t.exports = n(3645)(!1)).push([ t.id, ".cloudimage-360-icons-container {\n  position: absolute;\n  display: flex;\n  top: 5px;\n  right: 5px;\n  width: 30px;\n  height: 95%;\n  flex-direction: column;\n  align-items: center;\n  z-index: 101;\n}\n\n.cloudimage-360-magnifier-icon {\n  width: 25px;\n  height: 25px;\n  margin-bottom: 5px;\n  cursor: pointer;\n  background: url('https://scaleflex.cloudimg.io/v7/filerobot/js-cloudimage-360-view/loupe.svg') 50% 50% / cover no-repeat;\n}\n\n.cloudimage-360-fullscreen-icon {\n  width: 25px;\n  height: 25px;\n  margin-bottom: 5px;\n  cursor: pointer;\n  background: url('https://scaleflex.cloudimg.io/v7/filerobot/js-cloudimage-360-view/full_screen.svg') 50% 50% / cover no-repeat;\n}\n\n.cloudimage-360-reset-zoom-icon {\n  display: none;\n  width: 30px;\n  height: 30px;\n  margin-top: auto;\n  cursor: pointer;\n  background: url('https://scaleflex.cloudimg.io/v7/filerobot/js-cloudimage-360-view/ic-resize.svg?vh=248986') 50% 50% / cover no-repeat;\n}\n\n.cloudimage-360-close-fullscreen-icon {\n  width: 25px;\n  height: 25px;\n  cursor: pointer;\n  background: url('https://scaleflex.cloudimg.io/v7/filerobot/js-cloudimage-360-view/cross.svg') 50% 50% / cover no-repeat;\n}\n\n.cloudimage-360-loader {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  width: 0%;\n  height: 8px;\n  background-color: rgb(165, 175, 184);\n  z-index: 100;\n}\n\n.cloudimage-360-box-shadow {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  z-index: 99;\n}\n\n.cloudimage-360-view-360-icon {\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  width: 100px;\n  height: 100px;\n  margin: auto;\n  background-color: rgba(255, 255, 255, 0.8);\n  border-radius: 50%;\n  box-shadow: rgba(255, 255, 255, 0.5) 0px 0px 4px;\n  transition: 0.5s all;\n  color: rgb(80, 80, 80);\n  text-align: center;\n  line-height: 100px;\n  z-index: 2;\n}\n\n.cloudimage-360-view-360-circle {\n  position: absolute;\n  left: 0;\n  right: 0;\n  width: 80%;\n  height: auto;\n  margin: auto;\n  pointer-events: none;\n  user-select: none;\n  transition: 0.5s all;\n  z-index: 2;\n}\n\n.cloudimage-360-fullscreen-modal {\n  position: fixed;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  width: 100%;\n  height: 100%;\n  z-index: 999;\n  background-color: #FFF;\n}\n\n.cloudimage-360-img-magnifier-glass {\n  background-color: #FFF;\n  background-repeat: no-repeat;\n  position: absolute;\n  border: 3px solid #000;\n  border-radius: 50%;\n  cursor: wait;\n  line-height: 200px;\n  text-align: center;\n  z-index: 1000;\n  width: 250px;\n  height: 250px;\n  top: -75px;\n  right: -85px;\n}\n\n.cloudimage-360 .cloudimage-360-left,\n.cloudimage-360 .cloudimage-360-right {\n  padding: 8px;\n  background: rgb(244, 244, 244);\n  border: none;\n  border-radius: 4px;\n}\n\n.cloudimage-360 .cloudimage-360-left:focus,\n.cloudimage-360 .cloudimage-360-right:focus {\n  outline: none;\n}\n\n.cloudimage-360 .cloudimage-360-left {\n  display: none;\n  position: absolute;\n  z-index: 100;\n  top: calc(50% - 15px);\n  left: 20px;\n}\n\n.cloudimage-360 .cloudimage-360-right {\n  display: none;\n  position: absolute;\n  z-index: 100;\n  top: calc(50% - 15px);\n  right: 20px;\n}\n\n.cloudimage-360 .cloudimage-360-left:before,\n.cloudimage-360 .cloudimage-360-right:before {\n  content: '';\n  display: block;\n  width: 30px;\n  height: 30px;\n  background: 50% 50% / cover no-repeat;\n}\n\n.cloudimage-360 .cloudimage-360-left:before {\n  background-image: url('https://cdn.scaleflex.it/plugins/js-cloudimage-360-view/assets/img/arrow-left.svg');\n}\n\n.cloudimage-360 .cloudimage-360-right:before {\n  background-image: url('https://cdn.scaleflex.it/plugins/js-cloudimage-360-view/assets/img/arrow-right.svg');\n}\n\n.cloudimage-360 .cloudimage-360-left.not-active,\n.cloudimage-360 .cloudimage-360-right.not-active {\n  opacity: 0.4;\n  cursor: default;\n  pointer-events: none;\n}\n\n.cloudimage-360 .cloudimage-360-top,\n.cloudimage-360 .cloudimage-360-bottom {\n  padding: 8px;\n  background: rgb(244, 244, 244);\n  border: none;\n  border-radius: 4px;\n}\n\n.cloudimage-360 .cloudimage-360-top:focus,\n.cloudimage-360 .cloudimage-360-bottom:focus {\n  outline: none;\n}\n\n.cloudimage-360 .cloudimage-360-top {\n  display: none;\n  position: absolute;\n  z-index: 100;\n  left: calc(50% - 15px);\n  top: 20px;\n  transform: rotate(90deg);\n}\n\n.cloudimage-360 .cloudimage-360-bottom {\n  display: none;\n  position: absolute;\n  z-index: 100;\n  left: calc(50% - 15px);\n  bottom: 20px;\n  transform: rotate(90deg);\n}\n\n.cloudimage-360 .cloudimage-360-top:before,\n.cloudimage-360 .cloudimage-360-bottom:before {\n  content: '';\n  display: block;\n  width: 30px;\n  height: 30px;\n  background: 50% 50% / cover no-repeat;\n}\n\n.cloudimage-360 .cloudimage-360-top:before {\n  background-image: url('https://cdn.scaleflex.it/plugins/js-cloudimage-360-view/assets/img/arrow-left.svg');\n}\n\n.cloudimage-360 .cloudimage-360-bottom:before {\n  background-image: url('https://cdn.scaleflex.it/plugins/js-cloudimage-360-view/assets/img/arrow-right.svg');\n}\n\n.cloudimage-360 .cloudimage-360-top.not-active,\n.cloudimage-360 .cloudimage-360-bottom.not-active {\n  opacity: 0.4;\n  cursor: default;\n}", "" ]);
            },
            3645: t => {
                "use strict";
                t.exports = function(t) {
                    var e = [];
                    return e.toString = function() {
                        return this.map((function(e) {
                            var n = function(t, e) {
                                var n, i = t[1] || "", o = t[3];
                                if (!o) return i;
                                if (e && "function" == typeof btoa) {
                                    var r = (n = o, "/*# sourceMappingURL=data:application/json;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(n)))) + " */"), a = o.sources.map((function(t) {
                                        return "/*# sourceURL=" + o.sourceRoot + t + " */";
                                    }));
                                    return [ i ].concat(a).concat([ r ]).join("\n");
                                }
                                return [ i ].join("\n");
                            }(e, t);
                            return e[2] ? "@media " + e[2] + "{" + n + "}" : n;
                        })).join("");
                    }, e.i = function(t, n) {
                        "string" == typeof t && (t = [ [ null, t, "" ] ]);
                        for (var i = {}, o = 0; o < this.length; o++) {
                            var r = this[o][0];
                            null != r && (i[r] = !0);
                        }
                        for (o = 0; o < t.length; o++) {
                            var a = t[o];
                            null != a[0] && i[a[0]] || (n && !a[2] ? a[2] = n : n && (a[2] = "(" + a[2] + ") and (" + n + ")"), 
                            e.push(a));
                        }
                    }, e;
                };
            },
            3379: t => {
                "use strict";
                var e = [];
                function n(t) {
                    for (var n = -1, i = 0; i < e.length; i++) if (e[i].identifier === t) {
                        n = i;
                        break;
                    }
                    return n;
                }
                function i(t, i) {
                    for (var r = {}, a = [], s = 0; s < t.length; s++) {
                        var c = t[s], u = i.base ? c[0] + i.base : c[0], l = r[u] || 0, d = "".concat(u, " ").concat(l);
                        r[u] = l + 1;
                        var h = n(d), f = {
                            css: c[1],
                            media: c[2],
                            sourceMap: c[3],
                            supports: c[4],
                            layer: c[5]
                        };
                        if (-1 !== h) e[h].references++, e[h].updater(f); else {
                            var p = o(f, i);
                            i.byIndex = s, e.splice(s, 0, {
                                identifier: d,
                                updater: p,
                                references: 1
                            });
                        }
                        a.push(d);
                    }
                    return a;
                }
                function o(t, e) {
                    var n = e.domAPI(e);
                    return n.update(t), function(e) {
                        if (e) {
                            if (e.css === t.css && e.media === t.media && e.sourceMap === t.sourceMap && e.supports === t.supports && e.layer === t.layer) return;
                            n.update(t = e);
                        } else n.remove();
                    };
                }
                t.exports = function(t, o) {
                    var r = i(t = t || [], o = o || {});
                    return function(t) {
                        t = t || [];
                        for (var a = 0; a < r.length; a++) {
                            var s = n(r[a]);
                            e[s].references--;
                        }
                        for (var c = i(t, o), u = 0; u < r.length; u++) {
                            var l = n(r[u]);
                            0 === e[l].references && (e[l].updater(), e.splice(l, 1));
                        }
                        r = c;
                    };
                };
            },
            569: t => {
                "use strict";
                var e = {};
                t.exports = function(t, n) {
                    var i = function(t) {
                        if (void 0 === e[t]) {
                            var n = document.querySelector(t);
                            if (window.HTMLIFrameElement && n instanceof window.HTMLIFrameElement) try {
                                n = n.contentDocument.head;
                            } catch (t) {
                                n = null;
                            }
                            e[t] = n;
                        }
                        return e[t];
                    }(t);
                    if (!i) throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
                    i.appendChild(n);
                };
            },
            9216: t => {
                "use strict";
                t.exports = function(t) {
                    var e = document.createElement("style");
                    return t.setAttributes(e, t.attributes), t.insert(e, t.options), e;
                };
            },
            3565: (t, e, n) => {
                "use strict";
                t.exports = function(t) {
                    var e = n.nc;
                    e && t.setAttribute("nonce", e);
                };
            },
            7795: t => {
                "use strict";
                t.exports = function(t) {
                    if ("undefined" == typeof document) return {
                        update: function() {},
                        remove: function() {}
                    };
                    var e = t.insertStyleElement(t);
                    return {
                        update: function(n) {
                            !function(t, e, n) {
                                var i = "";
                                n.supports && (i += "@supports (".concat(n.supports, ") {")), n.media && (i += "@media ".concat(n.media, " {"));
                                var o = void 0 !== n.layer;
                                o && (i += "@layer".concat(n.layer.length > 0 ? " ".concat(n.layer) : "", " {")), 
                                i += n.css, o && (i += "}"), n.media && (i += "}"), n.supports && (i += "}");
                                var r = n.sourceMap;
                                r && "undefined" != typeof btoa && (i += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(r)))), " */")), 
                                e.styleTagTransform(i, t, e.options);
                            }(e, t, n);
                        },
                        remove: function() {
                            !function(t) {
                                if (null === t.parentNode) return !1;
                                t.parentNode.removeChild(t);
                            }(e);
                        }
                    };
                };
            },
            4589: t => {
                "use strict";
                t.exports = function(t, e) {
                    if (e.styleSheet) e.styleSheet.cssText = t; else {
                        for (;e.firstChild; ) e.removeChild(e.firstChild);
                        e.appendChild(document.createTextNode(t));
                    }
                };
            },
            7061: (t, e, n) => {
                var i = n(8698).default;
                function o() {
                    "use strict";
                    t.exports = o = function() {
                        return e;
                    }, t.exports.__esModule = !0, t.exports.default = t.exports;
                    var e = {}, n = Object.prototype, r = n.hasOwnProperty, a = Object.defineProperty || function(t, e, n) {
                        t[e] = n.value;
                    }, s = "function" == typeof Symbol ? Symbol : {}, c = s.iterator || "@@iterator", u = s.asyncIterator || "@@asyncIterator", l = s.toStringTag || "@@toStringTag";
                    function d(t, e, n) {
                        return Object.defineProperty(t, e, {
                            value: n,
                            enumerable: !0,
                            configurable: !0,
                            writable: !0
                        }), t[e];
                    }
                    try {
                        d({}, "");
                    } catch (t) {
                        d = function(t, e, n) {
                            return t[e] = n;
                        };
                    }
                    function h(t, e, n, i) {
                        var o = e && e.prototype instanceof m ? e : m, r = Object.create(o.prototype), s = new j(i || []);
                        return a(r, "_invoke", {
                            value: k(t, n, s)
                        }), r;
                    }
                    function f(t, e, n) {
                        try {
                            return {
                                type: "normal",
                                arg: t.call(e, n)
                            };
                        } catch (t) {
                            return {
                                type: "throw",
                                arg: t
                            };
                        }
                    }
                    e.wrap = h;
                    var p = {};
                    function m() {}
                    function v() {}
                    function g() {}
                    var y = {};
                    d(y, c, (function() {
                        return this;
                    }));
                    var b = Object.getPrototypeOf, w = b && b(b(L([])));
                    w && w !== n && r.call(w, c) && (y = w);
                    var x = g.prototype = m.prototype = Object.create(y);
                    function I(t) {
                        [ "next", "throw", "return" ].forEach((function(e) {
                            d(t, e, (function(t) {
                                return this._invoke(e, t);
                            }));
                        }));
                    }
                    function O(t, e) {
                        function n(o, a, s, c) {
                            var u = f(t[o], t, a);
                            if ("throw" !== u.type) {
                                var l = u.arg, d = l.value;
                                return d && "object" == i(d) && r.call(d, "__await") ? e.resolve(d.__await).then((function(t) {
                                    n("next", t, s, c);
                                }), (function(t) {
                                    n("throw", t, s, c);
                                })) : e.resolve(d).then((function(t) {
                                    l.value = t, s(l);
                                }), (function(t) {
                                    return n("throw", t, s, c);
                                }));
                            }
                            c(u.arg);
                        }
                        var o;
                        a(this, "_invoke", {
                            value: function(t, i) {
                                function r() {
                                    return new e((function(e, o) {
                                        n(t, i, e, o);
                                    }));
                                }
                                return o = o ? o.then(r, r) : r();
                            }
                        });
                    }
                    function k(t, e, n) {
                        var i = "suspendedStart";
                        return function(o, r) {
                            if ("executing" === i) throw new Error("Generator is already running");
                            if ("completed" === i) {
                                if ("throw" === o) throw r;
                                return {
                                    value: void 0,
                                    done: !0
                                };
                            }
                            for (n.method = o, n.arg = r; ;) {
                                var a = n.delegate;
                                if (a) {
                                    var s = E(a, n);
                                    if (s) {
                                        if (s === p) continue;
                                        return s;
                                    }
                                }
                                if ("next" === n.method) n.sent = n._sent = n.arg; else if ("throw" === n.method) {
                                    if ("suspendedStart" === i) throw i = "completed", n.arg;
                                    n.dispatchException(n.arg);
                                } else "return" === n.method && n.abrupt("return", n.arg);
                                i = "executing";
                                var c = f(t, e, n);
                                if ("normal" === c.type) {
                                    if (i = n.done ? "completed" : "suspendedYield", c.arg === p) continue;
                                    return {
                                        value: c.arg,
                                        done: n.done
                                    };
                                }
                                "throw" === c.type && (i = "completed", n.method = "throw", n.arg = c.arg);
                            }
                        };
                    }
                    function E(t, e) {
                        var n = e.method, i = t.iterator[n];
                        if (void 0 === i) return e.delegate = null, "throw" === n && t.iterator.return && (e.method = "return", 
                        e.arg = void 0, E(t, e), "throw" === e.method) || "return" !== n && (e.method = "throw", 
                        e.arg = new TypeError("The iterator does not provide a '" + n + "' method")), p;
                        var o = f(i, t.iterator, e.arg);
                        if ("throw" === o.type) return e.method = "throw", e.arg = o.arg, e.delegate = null, 
                        p;
                        var r = o.arg;
                        return r ? r.done ? (e[t.resultName] = r.value, e.next = t.nextLoc, "return" !== e.method && (e.method = "next", 
                        e.arg = void 0), e.delegate = null, p) : r : (e.method = "throw", e.arg = new TypeError("iterator result is not an object"), 
                        e.delegate = null, p);
                    }
                    function S(t) {
                        var e = {
                            tryLoc: t[0]
                        };
                        1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), 
                        this.tryEntries.push(e);
                    }
                    function C(t) {
                        var e = t.completion || {};
                        e.type = "normal", delete e.arg, t.completion = e;
                    }
                    function j(t) {
                        this.tryEntries = [ {
                            tryLoc: "root"
                        } ], t.forEach(S, this), this.reset(!0);
                    }
                    function L(t) {
                        if (t) {
                            var e = t[c];
                            if (e) return e.call(t);
                            if ("function" == typeof t.next) return t;
                            if (!isNaN(t.length)) {
                                var n = -1, i = function e() {
                                    for (;++n < t.length; ) if (r.call(t, n)) return e.value = t[n], e.done = !1, e;
                                    return e.value = void 0, e.done = !0, e;
                                };
                                return i.next = i;
                            }
                        }
                        return {
                            next: A
                        };
                    }
                    function A() {
                        return {
                            value: void 0,
                            done: !0
                        };
                    }
                    return v.prototype = g, a(x, "constructor", {
                        value: g,
                        configurable: !0
                    }), a(g, "constructor", {
                        value: v,
                        configurable: !0
                    }), v.displayName = d(g, l, "GeneratorFunction"), e.isGeneratorFunction = function(t) {
                        var e = "function" == typeof t && t.constructor;
                        return !!e && (e === v || "GeneratorFunction" === (e.displayName || e.name));
                    }, e.mark = function(t) {
                        return Object.setPrototypeOf ? Object.setPrototypeOf(t, g) : (t.__proto__ = g, d(t, l, "GeneratorFunction")), 
                        t.prototype = Object.create(x), t;
                    }, e.awrap = function(t) {
                        return {
                            __await: t
                        };
                    }, I(O.prototype), d(O.prototype, u, (function() {
                        return this;
                    })), e.AsyncIterator = O, e.async = function(t, n, i, o, r) {
                        void 0 === r && (r = Promise);
                        var a = new O(h(t, n, i, o), r);
                        return e.isGeneratorFunction(n) ? a : a.next().then((function(t) {
                            return t.done ? t.value : a.next();
                        }));
                    }, I(x), d(x, l, "Generator"), d(x, c, (function() {
                        return this;
                    })), d(x, "toString", (function() {
                        return "[object Generator]";
                    })), e.keys = function(t) {
                        var e = Object(t), n = [];
                        for (var i in e) n.push(i);
                        return n.reverse(), function t() {
                            for (;n.length; ) {
                                var i = n.pop();
                                if (i in e) return t.value = i, t.done = !1, t;
                            }
                            return t.done = !0, t;
                        };
                    }, e.values = L, j.prototype = {
                        constructor: j,
                        reset: function(t) {
                            if (this.prev = 0, this.next = 0, this.sent = this._sent = void 0, this.done = !1, 
                            this.delegate = null, this.method = "next", this.arg = void 0, this.tryEntries.forEach(C), 
                            !t) for (var e in this) "t" === e.charAt(0) && r.call(this, e) && !isNaN(+e.slice(1)) && (this[e] = void 0);
                        },
                        stop: function() {
                            this.done = !0;
                            var t = this.tryEntries[0].completion;
                            if ("throw" === t.type) throw t.arg;
                            return this.rval;
                        },
                        dispatchException: function(t) {
                            if (this.done) throw t;
                            var e = this;
                            function n(n, i) {
                                return a.type = "throw", a.arg = t, e.next = n, i && (e.method = "next", e.arg = void 0), 
                                !!i;
                            }
                            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                                var o = this.tryEntries[i], a = o.completion;
                                if ("root" === o.tryLoc) return n("end");
                                if (o.tryLoc <= this.prev) {
                                    var s = r.call(o, "catchLoc"), c = r.call(o, "finallyLoc");
                                    if (s && c) {
                                        if (this.prev < o.catchLoc) return n(o.catchLoc, !0);
                                        if (this.prev < o.finallyLoc) return n(o.finallyLoc);
                                    } else if (s) {
                                        if (this.prev < o.catchLoc) return n(o.catchLoc, !0);
                                    } else {
                                        if (!c) throw new Error("try statement without catch or finally");
                                        if (this.prev < o.finallyLoc) return n(o.finallyLoc);
                                    }
                                }
                            }
                        },
                        abrupt: function(t, e) {
                            for (var n = this.tryEntries.length - 1; n >= 0; --n) {
                                var i = this.tryEntries[n];
                                if (i.tryLoc <= this.prev && r.call(i, "finallyLoc") && this.prev < i.finallyLoc) {
                                    var o = i;
                                    break;
                                }
                            }
                            o && ("break" === t || "continue" === t) && o.tryLoc <= e && e <= o.finallyLoc && (o = null);
                            var a = o ? o.completion : {};
                            return a.type = t, a.arg = e, o ? (this.method = "next", this.next = o.finallyLoc, 
                            p) : this.complete(a);
                        },
                        complete: function(t, e) {
                            if ("throw" === t.type) throw t.arg;
                            return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, 
                            this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), 
                            p;
                        },
                        finish: function(t) {
                            for (var e = this.tryEntries.length - 1; e >= 0; --e) {
                                var n = this.tryEntries[e];
                                if (n.finallyLoc === t) return this.complete(n.completion, n.afterLoc), C(n), p;
                            }
                        },
                        catch: function(t) {
                            for (var e = this.tryEntries.length - 1; e >= 0; --e) {
                                var n = this.tryEntries[e];
                                if (n.tryLoc === t) {
                                    var i = n.completion;
                                    if ("throw" === i.type) {
                                        var o = i.arg;
                                        C(n);
                                    }
                                    return o;
                                }
                            }
                            throw new Error("illegal catch attempt");
                        },
                        delegateYield: function(t, e, n) {
                            return this.delegate = {
                                iterator: L(t),
                                resultName: e,
                                nextLoc: n
                            }, "next" === this.method && (this.arg = void 0), p;
                        }
                    }, e;
                }
                t.exports = o, t.exports.__esModule = !0, t.exports.default = t.exports;
            },
            8698: t => {
                function e(n) {
                    return t.exports = e = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
                        return typeof t;
                    } : function(t) {
                        return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
                    }, t.exports.__esModule = !0, t.exports.default = t.exports, e(n);
                }
                t.exports = e, t.exports.__esModule = !0, t.exports.default = t.exports;
            },
            4687: (t, e, n) => {
                var i = n(7061)();
                t.exports = i;
                try {
                    regeneratorRuntime = i;
                } catch (t) {
                    "object" == typeof globalThis ? globalThis.regeneratorRuntime = i : Function("r", "regeneratorRuntime = r")(i);
                }
            }
        }, e = {};
        function n(i) {
            var o = e[i];
            if (void 0 !== o) return o.exports;
            var r = e[i] = {
                id: i,
                exports: {}
            };
            return t[i](r, r.exports, n), r.exports;
        }
        n.n = t => {
            var e = t && t.__esModule ? () => t.default : () => t;
            return n.d(e, {
                a: e
            }), e;
        }, n.d = (t, e) => {
            for (var i in e) n.o(e, i) && !n.o(t, i) && Object.defineProperty(t, i, {
                enumerable: !0,
                get: e[i]
            });
        }, n.g = function() {
            if ("object" == typeof globalThis) return globalThis;
            try {
                return this || new Function("return this")();
            } catch (t) {
                if ("object" == typeof window) return window;
            }
        }(), n.o = (t, e) => Object.prototype.hasOwnProperty.call(t, e), n.nc = void 0, 
        (() => {
            "use strict";
            function t(e) {
                return t = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
                    return typeof t;
                } : function(t) {
                    return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
                }, t(e);
            }
            function e(e) {
                var n = function(e) {
                    if ("object" !== t(e) || null === e) return e;
                    var i = e[Symbol.toPrimitive];
                    if (void 0 !== i) {
                        var o = i.call(e, "string");
                        if ("object" !== t(o)) return o;
                        throw new TypeError("@@toPrimitive must return a primitive value.");
                    }
                    return String(e);
                }(e);
                return "symbol" === t(n) ? n : String(n);
            }
            function i(t, n, i) {
                return (n = e(n)) in t ? Object.defineProperty(t, n, {
                    value: i,
                    enumerable: !0,
                    configurable: !0,
                    writable: !0
                }) : t[n] = i, t;
            }
            function o(t, n) {
                for (var i = 0; i < n.length; i++) {
                    var o = n[i];
                    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), 
                    Object.defineProperty(t, e(o.key), o);
                }
            }
            n(7528), n(6139), n(4577);
            var r = "spin-y", a = "spin-xy", s = "spin-yx", c = "x-axis", u = "y-axis", l = "center", d = function(t) {
                return {
                    folder: f(t, "folder") || f(t, "data-folder") || "/",
                    apiVersion: f(t, "api-version") || f(t, "data-api-version") || f(t, "apiVersion") || f(t, "data-apiVersion") || "v7",
                    filenameX: f(t, "filename") || f(t, "data-filename") || f(t, "filename-x") || f(t, "data-filename-x") || "image-{index}.jpg",
                    filenameY: f(t, "filename-y") || f(t, "data-filename-y") || "image-y-{index}.jpg",
                    imageListX: f(t, "image-list-x") || f(t, "data-image-list-x") || null,
                    imageListY: f(t, "image-list-y") || f(t, "data-image-list-y") || null,
                    indexZeroBase: parseInt(f(t, "index-zero-base") || f(t, "data-index-zero-base") || 0, 10),
                    amountX: parseInt(f(t, "amount") || f(t, "data-amount") || f(t, "amount-x") || f(t, "data-amount-x") || 36, 10),
                    amountY: parseInt(f(t, "amount-y") || f(t, "data-amount-y") || 0, 10),
                    speed: parseInt(f(t, "speed") || f(t, "data-speed") || 80, 10),
                    dragSpeed: parseInt(f(t, "drag-speed") || f(t, "data-drag-speed") || 150, 10),
                    keys: h(t, "keys"),
                    keysReverse: h(t, "keys-reverse"),
                    boxShadow: f(t, "box-shadow") || f(t, "data-box-shadow"),
                    autoplay: h(t, "autoplay"),
                    autoplayBehavior: f(t, "autoplay-behavior") || f(t, "data-autoplay-behavior") || "spin-x",
                    playOnce: h(t, "play-once"),
                    autoplayReverse: h(t, "autoplay-reverse"),
                    pointerZoom: parseFloat(f(t, "pointer-zoom") || f(t, "data-pointer-zoom") || 0, 10),
                    bottomCircle: h(t, "bottom-circle"),
                    disableDrag: h(t, "disable-drag"),
                    fullscreen: h(t, "fullscreen") || h(t, "full-screen"),
                    magnifier: (null !== f(t, "magnifier") || null !== f(t, "data-magnifier")) && parseFloat(f(t, "magnifier") || f(t, "data-magnifier"), 10),
                    bottomCircleOffset: parseInt(f(t, "bottom-circle-offset") || f(t, "data-bottom-circle-offset") || 5, 10),
                    ciToken: f(t, "responsive") || f(t, "data-responsive"),
                    ciFilters: f(t, "filters") || f(t, "data-filters"),
                    ciTransformation: f(t, "transformation") || f(t, "data-transformation"),
                    lazyload: h(t, "lazyload"),
                    lazySelector: f(t, "lazyload-selector") || f(t, "data-lazyload-selector") || "lazyload",
                    spinReverse: h(t, "spin-reverse"),
                    controlReverse: h(t, "control-reverse"),
                    stopAtEdges: h(t, "stop-at-edges"),
                    hide360Logo: h(t, "hide-360-logo"),
                    logoSrc: f(t, "logo-src") || "https://scaleflex.cloudimg.io/v7/filerobot/js-cloudimage-360-view/360_view.svg",
                    ratio: f(t, "ratio") || f(t, "data-ratio"),
                    imageInfo: f(t, "info") || f(t, "data-info") || h(t, "info"),
                    requestResponsiveImages: h(t, "request-responsive-images")
                };
            }, h = function(t, e) {
                var n = f(t, e), i = f(t, "data-".concat(e));
                return null !== n && "false" !== n || null !== i && "false" !== i;
            }, f = function(t, e) {
                return t.getAttribute(e);
            }, p = function(t, e) {
                t.style.background = "rgba(255,255,255,0.8) url('".concat(e, "') 50% 50% / contain no-repeat");
            }, m = n(3379), v = n.n(m), g = n(7795), y = n.n(g), b = n(569), w = n.n(b), x = n(3565), I = n.n(x), O = n(9216), k = n.n(O), E = n(4589), S = n.n(E), C = n(1860), j = n.n(C), L = {};
            L.styleTagTransform = S(), L.setAttributes = I(), L.insert = w().bind(null, "head"), 
            L.domAPI = y(), L.insertStyleElement = k(), v()(j(), L), j() && j().locals && j().locals;
            var A = n(850), P = n.n(A), D = {};
            D.styleTagTransform = S(), D.setAttributes = I(), D.insert = w().bind(null, "head"), 
            D.domAPI = y(), D.insertStyleElement = k(), v()(P(), D), P() && P().locals && P().locals;
            var Y = [ "folder", "filenameX", "filenameY", "apiVersion", "imageListX", "imageListY", "indexZeroBase", "lazySelector", "keys", "stopAtEdges", "disableDrag", "controlReverse", "disableDrag" ], T = [ !1, 0, null, void 0, "false", "0", "null", "undefined" ], R = function(t, e) {
                var n, i, o, r = t.container, a = t.folder, s = t.apiVersion, c = t.filename, u = void 0 === c ? "" : c, l = t.ciParams || {}, d = l.ciToken, h = l.ciFilters, f = l.ciTransformation, p = "".concat(a).concat(u);
                if (d) {
                    var m = r.offsetWidth, v = -1 === T.indexOf(s) ? s : null, g = v ? "".concat(v, "/") : "", y = (n = ((o = m) <= 25 ? "25" : o <= 50 ? "50" : (100 * Math.ceil(o / 100)).toString()).toString().split("x"), 
                    i = [], [].forEach.call(n, (function(t) {
                        i.push(t * Math.round(window.devicePixelRatio || 1));
                    })), i.join("x")), b = -1 !== new URL(p).origin.indexOf("cloudimg") ? p : "https://".concat(d, ".cloudimg.io/").concat(g).concat(p);
                    p = "".concat(b, "?").concat(f || "".concat(e ? "" : "width=".concat(y), " ")).concat(h ? "&f=".concat(h) : "");
                }
                return p;
            }, X = function(t, e) {
                var n = new Image;
                n.src = t;
                var i = function() {
                    return e(n);
                };
                n.onload = i, n.onerror = i;
            }, M = function t(e, n) {
                var i = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 0, o = e[i];
                i > e.length - 1 || X(o, (function(o) {
                    var r = i + 1;
                    n(o, i), t(e, n, r);
                }));
            };
            function F(t, e) {
                (null == e || e > t.length) && (e = t.length);
                for (var n = 0, i = new Array(e); n < e; n++) i[n] = t[n];
                return i;
            }
            function z(t, e) {
                if (t) {
                    if ("string" == typeof t) return F(t, e);
                    var n = Object.prototype.toString.call(t).slice(8, -1);
                    return "Object" === n && t.constructor && (n = t.constructor.name), "Map" === n || "Set" === n ? Array.from(t) : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? F(t, e) : void 0;
                }
            }
            var N = /width=\d+|w=\d+|h=\d+|&width=\d+|&w=\d+|&h=\d+|func=\w+|\?$/g, V = /\?&/g, B = function(t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
                return (t += "").length >= e ? t : new Array(e - t.length + 1).join("0") + t;
            }, _ = function(t, e, n) {
                var i, o = e || {}, r = o.amount, a = o.indexZeroBase;
                return (i = new Array(r), function(t) {
                    if (Array.isArray(t)) return F(t);
                }(i) || function(t) {
                    if ("undefined" != typeof Symbol && null != t[Symbol.iterator] || null != t["@@iterator"]) return Array.from(t);
                }(i) || z(i) || function() {
                    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
                }()).map((function(e, i) {
                    var o = B(i + 1, a), r = t.replace("{index}", o);
                    return n ? r.replace(N, "").replace(V, "?") : r;
                }));
            };
            function W(t, e) {
                var n = Object.keys(t);
                if (Object.getOwnPropertySymbols) {
                    var i = Object.getOwnPropertySymbols(t);
                    e && (i = i.filter((function(e) {
                        return Object.getOwnPropertyDescriptor(t, e).enumerable;
                    }))), n.push.apply(n, i);
                }
                return n;
            }
            var H = function(t, e, n) {
                var o = e.folder;
                return t.map((function(t) {
                    var r = function(t) {
                        for (var e = 1; e < arguments.length; e++) {
                            var n = null != arguments[e] ? arguments[e] : {};
                            e % 2 ? W(Object(n), !0).forEach((function(e) {
                                i(t, e, n[e]);
                            })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : W(Object(n)).forEach((function(e) {
                                Object.defineProperty(t, e, Object.getOwnPropertyDescriptor(n, e));
                            }));
                        }
                        return t;
                    }({}, e);
                    return r.folder = /(http(s?)):\/\//gi.test(t) ? "" : o, r.filename = t, R(r, n);
                }));
            }, q = function(t, e, n) {
                var i = (t || {}).imageList, o = [];
                if (i) try {
                    var r = JSON.parse(i);
                    o = H(r, t);
                } catch (t) {
                    console.error("Wrong format in image-list attribute: ".concat(t.message));
                } else o = _(e, t);
                M(o, n);
            };
            function U(t, e, n, i, o, r, a) {
                try {
                    var s = t[r](a), c = s.value;
                } catch (t) {
                    return void n(t);
                }
                s.done ? e(c) : Promise.resolve(c).then(i, o);
            }
            function Z(t) {
                return function() {
                    var e = this, n = arguments;
                    return new Promise((function(i, o) {
                        var r = t.apply(e, n);
                        function a(t) {
                            U(r, i, o, a, s, "next", t);
                        }
                        function s(t) {
                            U(r, i, o, a, s, "throw", t);
                        }
                        a(void 0);
                    }));
                };
            }
            var G = n(4687), J = n.n(G), $ = function() {
                var t = Z(J().mark((function t(e, n) {
                    return J().wrap((function(t) {
                        for (;;) switch (t.prev = t.next) {
                          case 0:
                            return t.next = 2, Promise.all(e.map(function() {
                                var t = Z(J().mark((function t(e, n) {
                                    return J().wrap((function(t) {
                                        for (;;) switch (t.prev = t.next) {
                                          case 0:
                                            return t.next = 2, X(e, n);

                                          case 2:
                                          case "end":
                                            return t.stop();
                                        }
                                    }), t);
                                })));
                                return function(e, n) {
                                    return t.apply(this, arguments);
                                };
                            }()));

                          case 2:
                          case "end":
                            return t.stop();
                        }
                    }), t);
                })));
                return function(e, n) {
                    return t.apply(this, arguments);
                };
            }(), K = function(t, e, n) {
                var i = (t || {}).imageList, o = [];
                if (i) try {
                    var r = JSON.parse(i);
                    o = H(r, t, !0);
                } catch (t) {
                    console.error("Wrong format in image-list attribute: ".concat(t.message));
                } else o = _(e, t, !0);
                $(o, n);
            };
            function Q(t, e) {
                var n = Object.keys(t);
                if (Object.getOwnPropertySymbols) {
                    var i = Object.getOwnPropertySymbols(t);
                    e && (i = i.filter((function(e) {
                        return Object.getOwnPropertyDescriptor(t, e).enumerable;
                    }))), n.push.apply(n, i);
                }
                return n;
            }
            var tt = function(t, e, n) {
                var o, r = e || {}, a = r.imageList, s = r.lazySelector, c = r.innerBox;
                if (a) try {
                    o = function(t, e) {
                        var n = e.folder, o = t[0], r = function(t) {
                            for (var e = 1; e < arguments.length; e++) {
                                var n = null != arguments[e] ? arguments[e] : {};
                                e % 2 ? Q(Object(n), !0).forEach((function(e) {
                                    i(t, e, n[e]);
                                })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Q(Object(n)).forEach((function(e) {
                                    Object.defineProperty(t, e, Object.getOwnPropertyDescriptor(n, e));
                                }));
                            }
                            return t;
                        }({}, e);
                        return r.folder = /(http(s?)):\/\//gi.test(o) ? "" : n, r.filename = o, R(r);
                    }(JSON.parse(a), e);
                } catch (t) {
                    console.error("Wrong format in image-list attribute: ".concat(t.message));
                } else o = function(t, e) {
                    var n = (e || {}).indexZeroBase, i = B(1, n);
                    return t.replace("{index}", i);
                }(t, e);
                var u = new Image;
                u.setAttribute("data-src", o), u.style.position = "absolute", u.style.top = 0, u.style.left = 0, 
                u.style.width = "100%", u.style.maxWidth = "100%", u.style.maxHeight = "100%", s && (u.className = s), 
                c.appendChild(u), n && (u.onload = function() {
                    return n(u);
                });
            }, et = function(t, e, n, i) {
                var o = arguments.length > 4 && void 0 !== arguments[4] ? arguments[4] : 1, r = n / i, a = t / e, s = t * o, c = e * o;
                return r > a ? c = s / r : s = c * r, {
                    width: s,
                    height: c,
                    offsetX: (t - s) * (arguments.length > 5 && void 0 !== arguments[5] ? arguments[5] : .5),
                    offsetY: (e - c) * (arguments.length > 6 && void 0 !== arguments[6] ? arguments[6] : .5)
                };
            }, nt = function(t, e, n) {
                var i, o, r = e.container, a = e.w, s = e.h, c = e.zoom, u = e.bw, l = e.offsetX, d = e.offsetY, h = function() {
                    var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : window.event, e = 0, n = 0, i = (arguments.length > 1 ? arguments[1] : void 0).getBoundingClientRect();
                    return e = t.pageX - i.left, n = t.pageY - i.top, {
                        x: e -= window.pageXOffset,
                        y: n -= window.pageYOffset
                    };
                }(t, r);
                i = h.x, o = h.y, i > r.offsetWidth - a / c && (i = r.offsetWidth - a / c), i < a / c && (i = a / c), 
                o > r.offsetHeight - s / c && (o = r.offsetHeight - s / c), o < s / c && (o = s / c), 
                n.style.left = "".concat(i - a, "px"), n.style.top = "".concat(o - s, "px");
                var f = (i - l) * c - a + u, p = (o - d) * c - s + u;
                n.style.backgroundPosition = "-".concat(f, "px -").concat(p, "px");
            }, it = function(t, e, n) {
                var i = t / 150 * (36 / e) * 25 * (Math.max(n, 600) / 1500) || 1;
                return Math.floor(i);
            }, ot = function(t, e) {
                var n = t || {};
                n.classList ? n.classList.add(e) : n.className += " ".concat(e);
            }, rt = function(t, e) {
                t.classList ? t.classList.remove(e) : t.className = t.className.replace(new RegExp("(^|\\b)".concat(e.split(" ").join("|"), "(\\b|$)"), "gi"), " ");
            }, at = function(t, e, n, i, o) {
                var r = l;
                if (t) return o;
                var a = Math.abs(n.x - i.x), s = Math.abs(n.y - i.y);
                return a > 10 && (r = c), s > 10 && e && (r = u), r;
            }, st = function(t, e, n) {
                return Math.floor((t - e) / n) || 1;
            }, ct = function(t) {
                var e = document.createElement("div");
                return e.className = "cloudimage-360-icons-container", t.appendChild(e), e;
            }, ut = function(t, e) {
                var n = document.createElement("div");
                return n.className = "cloudimage-360-box-shadow", n.style.boxShadow = t, e.appendChild(n), 
                n;
            }, lt = function(t) {
                var e = document.createElement("div");
                return e.className = "cloudimage-360-loader", t.appendChild(e), e;
            }, dt = function(t, e) {
                if (t && e) try {
                    t.removeChild(e);
                } catch (t) {}
            }, ht = function(t, e, n) {
                for (var i = new Array(e).length - 1; i > -1; i--) {
                    var o, r = null === (o = t[i]) || void 0 === o ? void 0 : o[n];
                    if (r) return r;
                }
                return "0%";
            }, ft = function(t) {
                var e = "[data-hotspot-icon-id=".concat(t, "]");
                return document.querySelector(e);
            }, pt = function(t) {
                t.style.visibility = "hidden", t.style.opacity = 0;
            }, mt = function(t, e) {
                var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 0, i = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : 0, o = arguments.length > 4 && void 0 !== arguments[4] ? arguments[4] : "x-axis";
                e.forEach((function(e) {
                    var r = e.positions, a = e.initialDimensions, s = e.orientation, c = e.variant.anchorId, u = function(t) {
                        switch (t.toLowerCase()) {
                          case "x-axis":
                          default:
                            return "x";

                          case "y-axis":
                            return "y";
                        }
                    }(o), l = "x" === s ? n : i, d = function(t) {
                        return t.reduce((function(e, n, i) {
                            var o = !(null == n || !n.xCoord), r = !(null == n || !n.yCoord);
                            return o || (n.xCoord = ht(t, i, "xCoord")), r || (n.yCoord = ht(t, i, "yCoord")), 
                            e.push(n), e;
                        }), []);
                    }(r), h = d.find((function(t) {
                        return t.imageIndex === l;
                    })), f = ft(c);
                    if (h && u === s) {
                        var p = h.xCoord, m = void 0 === p ? 0 : p, v = h.yCoord;
                        !function(t, e, n, i, o) {
                            n.style.visibility = "visible", n.style.opacity = 1, n.style.zIndex = 100, n.style.left = "".concat(-n.offsetWidth / 2, "px"), 
                            n.style.top = "".concat(-n.offsetHeight / 2, "px");
                            var r = t.offsetWidth / e[0], a = t.offsetHeight / e[1], s = "".concat(r * i, "px"), c = "".concat(a * o, "px");
                            n.style.transform = "translate3d(".concat(s, ", ").concat(c, ", 0)");
                        }(t, a, f, m, void 0 === v ? 0 : v);
                    } else pt(f);
                }));
            };
            function vt(t) {
                if (null == t) return window;
                if ("[object Window]" !== t.toString()) {
                    var e = t.ownerDocument;
                    return e && e.defaultView || window;
                }
                return t;
            }
            function gt(t) {
                return t instanceof vt(t).Element || t instanceof Element;
            }
            function yt(t) {
                return t instanceof vt(t).HTMLElement || t instanceof HTMLElement;
            }
            function bt(t) {
                return "undefined" != typeof ShadowRoot && (t instanceof vt(t).ShadowRoot || t instanceof ShadowRoot);
            }
            var wt = Math.max, xt = Math.min, It = Math.round;
            function Ot() {
                var t = navigator.userAgentData;
                return null != t && t.brands && Array.isArray(t.brands) ? t.brands.map((function(t) {
                    return t.brand + "/" + t.version;
                })).join(" ") : navigator.userAgent;
            }
            function kt() {
                return !/^((?!chrome|android).)*safari/i.test(Ot());
            }
            function Et(t, e, n) {
                void 0 === e && (e = !1), void 0 === n && (n = !1);
                var i = t.getBoundingClientRect(), o = 1, r = 1;
                e && yt(t) && (o = t.offsetWidth > 0 && It(i.width) / t.offsetWidth || 1, r = t.offsetHeight > 0 && It(i.height) / t.offsetHeight || 1);
                var a = (gt(t) ? vt(t) : window).visualViewport, s = !kt() && n, c = (i.left + (s && a ? a.offsetLeft : 0)) / o, u = (i.top + (s && a ? a.offsetTop : 0)) / r, l = i.width / o, d = i.height / r;
                return {
                    width: l,
                    height: d,
                    top: u,
                    right: c + l,
                    bottom: u + d,
                    left: c,
                    x: c,
                    y: u
                };
            }
            function St(t) {
                var e = vt(t);
                return {
                    scrollLeft: e.pageXOffset,
                    scrollTop: e.pageYOffset
                };
            }
            function Ct(t) {
                return t ? (t.nodeName || "").toLowerCase() : null;
            }
            function jt(t) {
                return ((gt(t) ? t.ownerDocument : t.document) || window.document).documentElement;
            }
            function Lt(t) {
                return Et(jt(t)).left + St(t).scrollLeft;
            }
            function At(t) {
                return vt(t).getComputedStyle(t);
            }
            function Pt(t) {
                var e = At(t), n = e.overflow, i = e.overflowX, o = e.overflowY;
                return /auto|scroll|overlay|hidden/.test(n + o + i);
            }
            function Dt(t, e, n) {
                void 0 === n && (n = !1);
                var i, o, r = yt(e), a = yt(e) && function(t) {
                    var e = t.getBoundingClientRect(), n = It(e.width) / t.offsetWidth || 1, i = It(e.height) / t.offsetHeight || 1;
                    return 1 !== n || 1 !== i;
                }(e), s = jt(e), c = Et(t, a, n), u = {
                    scrollLeft: 0,
                    scrollTop: 0
                }, l = {
                    x: 0,
                    y: 0
                };
                return (r || !r && !n) && (("body" !== Ct(e) || Pt(s)) && (u = (i = e) !== vt(i) && yt(i) ? {
                    scrollLeft: (o = i).scrollLeft,
                    scrollTop: o.scrollTop
                } : St(i)), yt(e) ? ((l = Et(e, !0)).x += e.clientLeft, l.y += e.clientTop) : s && (l.x = Lt(s))), 
                {
                    x: c.left + u.scrollLeft - l.x,
                    y: c.top + u.scrollTop - l.y,
                    width: c.width,
                    height: c.height
                };
            }
            function Yt(t) {
                var e = Et(t), n = t.offsetWidth, i = t.offsetHeight;
                return Math.abs(e.width - n) <= 1 && (n = e.width), Math.abs(e.height - i) <= 1 && (i = e.height), 
                {
                    x: t.offsetLeft,
                    y: t.offsetTop,
                    width: n,
                    height: i
                };
            }
            function Tt(t) {
                return "html" === Ct(t) ? t : t.assignedSlot || t.parentNode || (bt(t) ? t.host : null) || jt(t);
            }
            function Rt(t) {
                return [ "html", "body", "#document" ].indexOf(Ct(t)) >= 0 ? t.ownerDocument.body : yt(t) && Pt(t) ? t : Rt(Tt(t));
            }
            function Xt(t, e) {
                var n;
                void 0 === e && (e = []);
                var i = Rt(t), o = i === (null == (n = t.ownerDocument) ? void 0 : n.body), r = vt(i), a = o ? [ r ].concat(r.visualViewport || [], Pt(i) ? i : []) : i, s = e.concat(a);
                return o ? s : s.concat(Xt(Tt(a)));
            }
            function Mt(t) {
                return [ "table", "td", "th" ].indexOf(Ct(t)) >= 0;
            }
            function Ft(t) {
                return yt(t) && "fixed" !== At(t).position ? t.offsetParent : null;
            }
            function zt(t) {
                for (var e = vt(t), n = Ft(t); n && Mt(n) && "static" === At(n).position; ) n = Ft(n);
                return n && ("html" === Ct(n) || "body" === Ct(n) && "static" === At(n).position) ? e : n || function(t) {
                    var e = /firefox/i.test(Ot());
                    if (/Trident/i.test(Ot()) && yt(t) && "fixed" === At(t).position) return null;
                    var n = Tt(t);
                    for (bt(n) && (n = n.host); yt(n) && [ "html", "body" ].indexOf(Ct(n)) < 0; ) {
                        var i = At(n);
                        if ("none" !== i.transform || "none" !== i.perspective || "paint" === i.contain || -1 !== [ "transform", "perspective" ].indexOf(i.willChange) || e && "filter" === i.willChange || e && i.filter && "none" !== i.filter) return n;
                        n = n.parentNode;
                    }
                    return null;
                }(t) || e;
            }
            var Nt = "top", Vt = "bottom", Bt = "right", _t = "left", Wt = "auto", Ht = [ Nt, Vt, Bt, _t ], qt = "start", Ut = "end", Zt = "viewport", Gt = "popper", Jt = Ht.reduce((function(t, e) {
                return t.concat([ e + "-" + qt, e + "-" + Ut ]);
            }), []), $t = [].concat(Ht, [ Wt ]).reduce((function(t, e) {
                return t.concat([ e, e + "-" + qt, e + "-" + Ut ]);
            }), []), Kt = [ "beforeRead", "read", "afterRead", "beforeMain", "main", "afterMain", "beforeWrite", "write", "afterWrite" ];
            function Qt(t) {
                var e = new Map, n = new Set, i = [];
                function o(t) {
                    n.add(t.name), [].concat(t.requires || [], t.requiresIfExists || []).forEach((function(t) {
                        if (!n.has(t)) {
                            var i = e.get(t);
                            i && o(i);
                        }
                    })), i.push(t);
                }
                return t.forEach((function(t) {
                    e.set(t.name, t);
                })), t.forEach((function(t) {
                    n.has(t.name) || o(t);
                })), i;
            }
            var te = {
                placement: "bottom",
                modifiers: [],
                strategy: "absolute"
            };
            function ee() {
                for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) e[n] = arguments[n];
                return !e.some((function(t) {
                    return !(t && "function" == typeof t.getBoundingClientRect);
                }));
            }
            function ne(t) {
                void 0 === t && (t = {});
                var e = t, n = e.defaultModifiers, i = void 0 === n ? [] : n, o = e.defaultOptions, r = void 0 === o ? te : o;
                return function(t, e, n) {
                    void 0 === n && (n = r);
                    var o, a, s = {
                        placement: "bottom",
                        orderedModifiers: [],
                        options: Object.assign({}, te, r),
                        modifiersData: {},
                        elements: {
                            reference: t,
                            popper: e
                        },
                        attributes: {},
                        styles: {}
                    }, c = [], u = !1, l = {
                        state: s,
                        setOptions: function(n) {
                            var o = "function" == typeof n ? n(s.options) : n;
                            d(), s.options = Object.assign({}, r, s.options, o), s.scrollParents = {
                                reference: gt(t) ? Xt(t) : t.contextElement ? Xt(t.contextElement) : [],
                                popper: Xt(e)
                            };
                            var a, u, h = function(t) {
                                var e = Qt(t);
                                return Kt.reduce((function(t, n) {
                                    return t.concat(e.filter((function(t) {
                                        return t.phase === n;
                                    })));
                                }), []);
                            }((a = [].concat(i, s.options.modifiers), u = a.reduce((function(t, e) {
                                var n = t[e.name];
                                return t[e.name] = n ? Object.assign({}, n, e, {
                                    options: Object.assign({}, n.options, e.options),
                                    data: Object.assign({}, n.data, e.data)
                                }) : e, t;
                            }), {}), Object.keys(u).map((function(t) {
                                return u[t];
                            }))));
                            return s.orderedModifiers = h.filter((function(t) {
                                return t.enabled;
                            })), s.orderedModifiers.forEach((function(t) {
                                var e = t.name, n = t.options, i = void 0 === n ? {} : n, o = t.effect;
                                if ("function" == typeof o) {
                                    var r = o({
                                        state: s,
                                        name: e,
                                        instance: l,
                                        options: i
                                    });
                                    c.push(r || function() {});
                                }
                            })), l.update();
                        },
                        forceUpdate: function() {
                            if (!u) {
                                var t = s.elements, e = t.reference, n = t.popper;
                                if (ee(e, n)) {
                                    s.rects = {
                                        reference: Dt(e, zt(n), "fixed" === s.options.strategy),
                                        popper: Yt(n)
                                    }, s.reset = !1, s.placement = s.options.placement, s.orderedModifiers.forEach((function(t) {
                                        return s.modifiersData[t.name] = Object.assign({}, t.data);
                                    }));
                                    for (var i = 0; i < s.orderedModifiers.length; i++) if (!0 !== s.reset) {
                                        var o = s.orderedModifiers[i], r = o.fn, a = o.options, c = void 0 === a ? {} : a, d = o.name;
                                        "function" == typeof r && (s = r({
                                            state: s,
                                            options: c,
                                            name: d,
                                            instance: l
                                        }) || s);
                                    } else s.reset = !1, i = -1;
                                }
                            }
                        },
                        update: (o = function() {
                            return new Promise((function(t) {
                                l.forceUpdate(), t(s);
                            }));
                        }, function() {
                            return a || (a = new Promise((function(t) {
                                Promise.resolve().then((function() {
                                    a = void 0, t(o());
                                }));
                            }))), a;
                        }),
                        destroy: function() {
                            d(), u = !0;
                        }
                    };
                    if (!ee(t, e)) return l;
                    function d() {
                        c.forEach((function(t) {
                            return t();
                        })), c = [];
                    }
                    return l.setOptions(n).then((function(t) {
                        !u && n.onFirstUpdate && n.onFirstUpdate(t);
                    })), l;
                };
            }
            var ie = {
                passive: !0
            };
            const oe = {
                name: "eventListeners",
                enabled: !0,
                phase: "write",
                fn: function() {},
                effect: function(t) {
                    var e = t.state, n = t.instance, i = t.options, o = i.scroll, r = void 0 === o || o, a = i.resize, s = void 0 === a || a, c = vt(e.elements.popper), u = [].concat(e.scrollParents.reference, e.scrollParents.popper);
                    return r && u.forEach((function(t) {
                        t.addEventListener("scroll", n.update, ie);
                    })), s && c.addEventListener("resize", n.update, ie), function() {
                        r && u.forEach((function(t) {
                            t.removeEventListener("scroll", n.update, ie);
                        })), s && c.removeEventListener("resize", n.update, ie);
                    };
                },
                data: {}
            };
            function re(t) {
                return t.split("-")[0];
            }
            function ae(t) {
                return t.split("-")[1];
            }
            function se(t) {
                return [ "top", "bottom" ].indexOf(t) >= 0 ? "x" : "y";
            }
            function ce(t) {
                var e, n = t.reference, i = t.element, o = t.placement, r = o ? re(o) : null, a = o ? ae(o) : null, s = n.x + n.width / 2 - i.width / 2, c = n.y + n.height / 2 - i.height / 2;
                switch (r) {
                  case Nt:
                    e = {
                        x: s,
                        y: n.y - i.height
                    };
                    break;

                  case Vt:
                    e = {
                        x: s,
                        y: n.y + n.height
                    };
                    break;

                  case Bt:
                    e = {
                        x: n.x + n.width,
                        y: c
                    };
                    break;

                  case _t:
                    e = {
                        x: n.x - i.width,
                        y: c
                    };
                    break;

                  default:
                    e = {
                        x: n.x,
                        y: n.y
                    };
                }
                var u = r ? se(r) : null;
                if (null != u) {
                    var l = "y" === u ? "height" : "width";
                    switch (a) {
                      case qt:
                        e[u] = e[u] - (n[l] / 2 - i[l] / 2);
                        break;

                      case Ut:
                        e[u] = e[u] + (n[l] / 2 - i[l] / 2);
                    }
                }
                return e;
            }
            var ue = {
                top: "auto",
                right: "auto",
                bottom: "auto",
                left: "auto"
            };
            function le(t) {
                var e, n = t.popper, i = t.popperRect, o = t.placement, r = t.variation, a = t.offsets, s = t.position, c = t.gpuAcceleration, u = t.adaptive, l = t.roundOffsets, d = t.isFixed, h = a.x, f = void 0 === h ? 0 : h, p = a.y, m = void 0 === p ? 0 : p, v = "function" == typeof l ? l({
                    x: f,
                    y: m
                }) : {
                    x: f,
                    y: m
                };
                f = v.x, m = v.y;
                var g = a.hasOwnProperty("x"), y = a.hasOwnProperty("y"), b = _t, w = Nt, x = window;
                if (u) {
                    var I = zt(n), O = "clientHeight", k = "clientWidth";
                    I === vt(n) && "static" !== At(I = jt(n)).position && "absolute" === s && (O = "scrollHeight", 
                    k = "scrollWidth"), (o === Nt || (o === _t || o === Bt) && r === Ut) && (w = Vt, 
                    m -= (d && I === x && x.visualViewport ? x.visualViewport.height : I[O]) - i.height, 
                    m *= c ? 1 : -1), o !== _t && (o !== Nt && o !== Vt || r !== Ut) || (b = Bt, f -= (d && I === x && x.visualViewport ? x.visualViewport.width : I[k]) - i.width, 
                    f *= c ? 1 : -1);
                }
                var E, S = Object.assign({
                    position: s
                }, u && ue), C = !0 === l ? function(t, e) {
                    var n = t.x, i = t.y, o = e.devicePixelRatio || 1;
                    return {
                        x: It(n * o) / o || 0,
                        y: It(i * o) / o || 0
                    };
                }({
                    x: f,
                    y: m
                }, vt(n)) : {
                    x: f,
                    y: m
                };
                return f = C.x, m = C.y, c ? Object.assign({}, S, ((E = {})[w] = y ? "0" : "", E[b] = g ? "0" : "", 
                E.transform = (x.devicePixelRatio || 1) <= 1 ? "translate(" + f + "px, " + m + "px)" : "translate3d(" + f + "px, " + m + "px, 0)", 
                E)) : Object.assign({}, S, ((e = {})[w] = y ? m + "px" : "", e[b] = g ? f + "px" : "", 
                e.transform = "", e));
            }
            const de = {
                name: "computeStyles",
                enabled: !0,
                phase: "beforeWrite",
                fn: function(t) {
                    var e = t.state, n = t.options, i = n.gpuAcceleration, o = void 0 === i || i, r = n.adaptive, a = void 0 === r || r, s = n.roundOffsets, c = void 0 === s || s, u = {
                        placement: re(e.placement),
                        variation: ae(e.placement),
                        popper: e.elements.popper,
                        popperRect: e.rects.popper,
                        gpuAcceleration: o,
                        isFixed: "fixed" === e.options.strategy
                    };
                    null != e.modifiersData.popperOffsets && (e.styles.popper = Object.assign({}, e.styles.popper, le(Object.assign({}, u, {
                        offsets: e.modifiersData.popperOffsets,
                        position: e.options.strategy,
                        adaptive: a,
                        roundOffsets: c
                    })))), null != e.modifiersData.arrow && (e.styles.arrow = Object.assign({}, e.styles.arrow, le(Object.assign({}, u, {
                        offsets: e.modifiersData.arrow,
                        position: "absolute",
                        adaptive: !1,
                        roundOffsets: c
                    })))), e.attributes.popper = Object.assign({}, e.attributes.popper, {
                        "data-popper-placement": e.placement
                    });
                },
                data: {}
            }, he = {
                name: "applyStyles",
                enabled: !0,
                phase: "write",
                fn: function(t) {
                    var e = t.state;
                    Object.keys(e.elements).forEach((function(t) {
                        var n = e.styles[t] || {}, i = e.attributes[t] || {}, o = e.elements[t];
                        yt(o) && Ct(o) && (Object.assign(o.style, n), Object.keys(i).forEach((function(t) {
                            var e = i[t];
                            !1 === e ? o.removeAttribute(t) : o.setAttribute(t, !0 === e ? "" : e);
                        })));
                    }));
                },
                effect: function(t) {
                    var e = t.state, n = {
                        popper: {
                            position: e.options.strategy,
                            left: "0",
                            top: "0",
                            margin: "0"
                        },
                        arrow: {
                            position: "absolute"
                        },
                        reference: {}
                    };
                    return Object.assign(e.elements.popper.style, n.popper), e.styles = n, e.elements.arrow && Object.assign(e.elements.arrow.style, n.arrow), 
                    function() {
                        Object.keys(e.elements).forEach((function(t) {
                            var i = e.elements[t], o = e.attributes[t] || {}, r = Object.keys(e.styles.hasOwnProperty(t) ? e.styles[t] : n[t]).reduce((function(t, e) {
                                return t[e] = "", t;
                            }), {});
                            yt(i) && Ct(i) && (Object.assign(i.style, r), Object.keys(o).forEach((function(t) {
                                i.removeAttribute(t);
                            })));
                        }));
                    };
                },
                requires: [ "computeStyles" ]
            }, fe = {
                name: "offset",
                enabled: !0,
                phase: "main",
                requires: [ "popperOffsets" ],
                fn: function(t) {
                    var e = t.state, n = t.options, i = t.name, o = n.offset, r = void 0 === o ? [ 0, 0 ] : o, a = $t.reduce((function(t, n) {
                        return t[n] = function(t, e, n) {
                            var i = re(t), o = [ _t, Nt ].indexOf(i) >= 0 ? -1 : 1, r = "function" == typeof n ? n(Object.assign({}, e, {
                                placement: t
                            })) : n, a = r[0], s = r[1];
                            return a = a || 0, s = (s || 0) * o, [ _t, Bt ].indexOf(i) >= 0 ? {
                                x: s,
                                y: a
                            } : {
                                x: a,
                                y: s
                            };
                        }(n, e.rects, r), t;
                    }), {}), s = a[e.placement], c = s.x, u = s.y;
                    null != e.modifiersData.popperOffsets && (e.modifiersData.popperOffsets.x += c, 
                    e.modifiersData.popperOffsets.y += u), e.modifiersData[i] = a;
                }
            };
            var pe = {
                left: "right",
                right: "left",
                bottom: "top",
                top: "bottom"
            };
            function me(t) {
                return t.replace(/left|right|bottom|top/g, (function(t) {
                    return pe[t];
                }));
            }
            var ve = {
                start: "end",
                end: "start"
            };
            function ge(t) {
                return t.replace(/start|end/g, (function(t) {
                    return ve[t];
                }));
            }
            function ye(t, e) {
                var n = e.getRootNode && e.getRootNode();
                if (t.contains(e)) return !0;
                if (n && bt(n)) {
                    var i = e;
                    do {
                        if (i && t.isSameNode(i)) return !0;
                        i = i.parentNode || i.host;
                    } while (i);
                }
                return !1;
            }
            function be(t) {
                return Object.assign({}, t, {
                    left: t.x,
                    top: t.y,
                    right: t.x + t.width,
                    bottom: t.y + t.height
                });
            }
            function we(t, e, n) {
                return e === Zt ? be(function(t, e) {
                    var n = vt(t), i = jt(t), o = n.visualViewport, r = i.clientWidth, a = i.clientHeight, s = 0, c = 0;
                    if (o) {
                        r = o.width, a = o.height;
                        var u = kt();
                        (u || !u && "fixed" === e) && (s = o.offsetLeft, c = o.offsetTop);
                    }
                    return {
                        width: r,
                        height: a,
                        x: s + Lt(t),
                        y: c
                    };
                }(t, n)) : gt(e) ? function(t, e) {
                    var n = Et(t, !1, "fixed" === e);
                    return n.top = n.top + t.clientTop, n.left = n.left + t.clientLeft, n.bottom = n.top + t.clientHeight, 
                    n.right = n.left + t.clientWidth, n.width = t.clientWidth, n.height = t.clientHeight, 
                    n.x = n.left, n.y = n.top, n;
                }(e, n) : be(function(t) {
                    var e, n = jt(t), i = St(t), o = null == (e = t.ownerDocument) ? void 0 : e.body, r = wt(n.scrollWidth, n.clientWidth, o ? o.scrollWidth : 0, o ? o.clientWidth : 0), a = wt(n.scrollHeight, n.clientHeight, o ? o.scrollHeight : 0, o ? o.clientHeight : 0), s = -i.scrollLeft + Lt(t), c = -i.scrollTop;
                    return "rtl" === At(o || n).direction && (s += wt(n.clientWidth, o ? o.clientWidth : 0) - r), 
                    {
                        width: r,
                        height: a,
                        x: s,
                        y: c
                    };
                }(jt(t)));
            }
            function xe(t) {
                return Object.assign({}, {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                }, t);
            }
            function Ie(t, e) {
                return e.reduce((function(e, n) {
                    return e[n] = t, e;
                }), {});
            }
            function Oe(t, e) {
                void 0 === e && (e = {});
                var n = e, i = n.placement, o = void 0 === i ? t.placement : i, r = n.strategy, a = void 0 === r ? t.strategy : r, s = n.boundary, c = void 0 === s ? "clippingParents" : s, u = n.rootBoundary, l = void 0 === u ? Zt : u, d = n.elementContext, h = void 0 === d ? Gt : d, f = n.altBoundary, p = void 0 !== f && f, m = n.padding, v = void 0 === m ? 0 : m, g = xe("number" != typeof v ? v : Ie(v, Ht)), y = h === Gt ? "reference" : Gt, b = t.rects.popper, w = t.elements[p ? y : h], x = function(t, e, n, i) {
                    var o = "clippingParents" === e ? function(t) {
                        var e = Xt(Tt(t)), n = [ "absolute", "fixed" ].indexOf(At(t).position) >= 0 && yt(t) ? zt(t) : t;
                        return gt(n) ? e.filter((function(t) {
                            return gt(t) && ye(t, n) && "body" !== Ct(t);
                        })) : [];
                    }(t) : [].concat(e), r = [].concat(o, [ n ]), a = r[0], s = r.reduce((function(e, n) {
                        var o = we(t, n, i);
                        return e.top = wt(o.top, e.top), e.right = xt(o.right, e.right), e.bottom = xt(o.bottom, e.bottom), 
                        e.left = wt(o.left, e.left), e;
                    }), we(t, a, i));
                    return s.width = s.right - s.left, s.height = s.bottom - s.top, s.x = s.left, s.y = s.top, 
                    s;
                }(gt(w) ? w : w.contextElement || jt(t.elements.popper), c, l, a), I = Et(t.elements.reference), O = ce({
                    reference: I,
                    element: b,
                    strategy: "absolute",
                    placement: o
                }), k = be(Object.assign({}, b, O)), E = h === Gt ? k : I, S = {
                    top: x.top - E.top + g.top,
                    bottom: E.bottom - x.bottom + g.bottom,
                    left: x.left - E.left + g.left,
                    right: E.right - x.right + g.right
                }, C = t.modifiersData.offset;
                if (h === Gt && C) {
                    var j = C[o];
                    Object.keys(S).forEach((function(t) {
                        var e = [ Bt, Vt ].indexOf(t) >= 0 ? 1 : -1, n = [ Nt, Vt ].indexOf(t) >= 0 ? "y" : "x";
                        S[t] += j[n] * e;
                    }));
                }
                return S;
            }
            const ke = {
                name: "flip",
                enabled: !0,
                phase: "main",
                fn: function(t) {
                    var e = t.state, n = t.options, i = t.name;
                    if (!e.modifiersData[i]._skip) {
                        for (var o = n.mainAxis, r = void 0 === o || o, a = n.altAxis, s = void 0 === a || a, c = n.fallbackPlacements, u = n.padding, l = n.boundary, d = n.rootBoundary, h = n.altBoundary, f = n.flipVariations, p = void 0 === f || f, m = n.allowedAutoPlacements, v = e.options.placement, g = re(v), y = c || (g !== v && p ? function(t) {
                            if (re(t) === Wt) return [];
                            var e = me(t);
                            return [ ge(t), e, ge(e) ];
                        }(v) : [ me(v) ]), b = [ v ].concat(y).reduce((function(t, n) {
                            return t.concat(re(n) === Wt ? function(t, e) {
                                void 0 === e && (e = {});
                                var n = e, i = n.placement, o = n.boundary, r = n.rootBoundary, a = n.padding, s = n.flipVariations, c = n.allowedAutoPlacements, u = void 0 === c ? $t : c, l = ae(i), d = l ? s ? Jt : Jt.filter((function(t) {
                                    return ae(t) === l;
                                })) : Ht, h = d.filter((function(t) {
                                    return u.indexOf(t) >= 0;
                                }));
                                0 === h.length && (h = d);
                                var f = h.reduce((function(e, n) {
                                    return e[n] = Oe(t, {
                                        placement: n,
                                        boundary: o,
                                        rootBoundary: r,
                                        padding: a
                                    })[re(n)], e;
                                }), {});
                                return Object.keys(f).sort((function(t, e) {
                                    return f[t] - f[e];
                                }));
                            }(e, {
                                placement: n,
                                boundary: l,
                                rootBoundary: d,
                                padding: u,
                                flipVariations: p,
                                allowedAutoPlacements: m
                            }) : n);
                        }), []), w = e.rects.reference, x = e.rects.popper, I = new Map, O = !0, k = b[0], E = 0; E < b.length; E++) {
                            var S = b[E], C = re(S), j = ae(S) === qt, L = [ Nt, Vt ].indexOf(C) >= 0, A = L ? "width" : "height", P = Oe(e, {
                                placement: S,
                                boundary: l,
                                rootBoundary: d,
                                altBoundary: h,
                                padding: u
                            }), D = L ? j ? Bt : _t : j ? Vt : Nt;
                            w[A] > x[A] && (D = me(D));
                            var Y = me(D), T = [];
                            if (r && T.push(P[C] <= 0), s && T.push(P[D] <= 0, P[Y] <= 0), T.every((function(t) {
                                return t;
                            }))) {
                                k = S, O = !1;
                                break;
                            }
                            I.set(S, T);
                        }
                        if (O) for (var R = function(t) {
                            var e = b.find((function(e) {
                                var n = I.get(e);
                                if (n) return n.slice(0, t).every((function(t) {
                                    return t;
                                }));
                            }));
                            if (e) return k = e, "break";
                        }, X = p ? 3 : 1; X > 0 && "break" !== R(X); X--) ;
                        e.placement !== k && (e.modifiersData[i]._skip = !0, e.placement = k, e.reset = !0);
                    }
                },
                requiresIfExists: [ "offset" ],
                data: {
                    _skip: !1
                }
            };
            function Ee(t, e, n) {
                return wt(t, xt(e, n));
            }
            const Se = {
                name: "preventOverflow",
                enabled: !0,
                phase: "main",
                fn: function(t) {
                    var e = t.state, n = t.options, i = t.name, o = n.mainAxis, r = void 0 === o || o, a = n.altAxis, s = void 0 !== a && a, c = n.boundary, u = n.rootBoundary, l = n.altBoundary, d = n.padding, h = n.tether, f = void 0 === h || h, p = n.tetherOffset, m = void 0 === p ? 0 : p, v = Oe(e, {
                        boundary: c,
                        rootBoundary: u,
                        padding: d,
                        altBoundary: l
                    }), g = re(e.placement), y = ae(e.placement), b = !y, w = se(g), x = "x" === w ? "y" : "x", I = e.modifiersData.popperOffsets, O = e.rects.reference, k = e.rects.popper, E = "function" == typeof m ? m(Object.assign({}, e.rects, {
                        placement: e.placement
                    })) : m, S = "number" == typeof E ? {
                        mainAxis: E,
                        altAxis: E
                    } : Object.assign({
                        mainAxis: 0,
                        altAxis: 0
                    }, E), C = e.modifiersData.offset ? e.modifiersData.offset[e.placement] : null, j = {
                        x: 0,
                        y: 0
                    };
                    if (I) {
                        if (r) {
                            var L, A = "y" === w ? Nt : _t, P = "y" === w ? Vt : Bt, D = "y" === w ? "height" : "width", Y = I[w], T = Y + v[A], R = Y - v[P], X = f ? -k[D] / 2 : 0, M = y === qt ? O[D] : k[D], F = y === qt ? -k[D] : -O[D], z = e.elements.arrow, N = f && z ? Yt(z) : {
                                width: 0,
                                height: 0
                            }, V = e.modifiersData["arrow#persistent"] ? e.modifiersData["arrow#persistent"].padding : {
                                top: 0,
                                right: 0,
                                bottom: 0,
                                left: 0
                            }, B = V[A], _ = V[P], W = Ee(0, O[D], N[D]), H = b ? O[D] / 2 - X - W - B - S.mainAxis : M - W - B - S.mainAxis, q = b ? -O[D] / 2 + X + W + _ + S.mainAxis : F + W + _ + S.mainAxis, U = e.elements.arrow && zt(e.elements.arrow), Z = U ? "y" === w ? U.clientTop || 0 : U.clientLeft || 0 : 0, G = null != (L = null == C ? void 0 : C[w]) ? L : 0, J = Y + q - G, $ = Ee(f ? xt(T, Y + H - G - Z) : T, Y, f ? wt(R, J) : R);
                            I[w] = $, j[w] = $ - Y;
                        }
                        if (s) {
                            var K, Q = "x" === w ? Nt : _t, tt = "x" === w ? Vt : Bt, et = I[x], nt = "y" === x ? "height" : "width", it = et + v[Q], ot = et - v[tt], rt = -1 !== [ Nt, _t ].indexOf(g), at = null != (K = null == C ? void 0 : C[x]) ? K : 0, st = rt ? it : et - O[nt] - k[nt] - at + S.altAxis, ct = rt ? et + O[nt] + k[nt] - at - S.altAxis : ot, ut = f && rt ? function(t, e, n) {
                                var i = Ee(t, e, n);
                                return i > n ? n : i;
                            }(st, et, ct) : Ee(f ? st : it, et, f ? ct : ot);
                            I[x] = ut, j[x] = ut - et;
                        }
                        e.modifiersData[i] = j;
                    }
                },
                requiresIfExists: [ "offset" ]
            }, Ce = {
                name: "arrow",
                enabled: !0,
                phase: "main",
                fn: function(t) {
                    var e, n = t.state, i = t.name, o = t.options, r = n.elements.arrow, a = n.modifiersData.popperOffsets, s = re(n.placement), c = se(s), u = [ _t, Bt ].indexOf(s) >= 0 ? "height" : "width";
                    if (r && a) {
                        var l = function(t, e) {
                            return xe("number" != typeof (t = "function" == typeof t ? t(Object.assign({}, e.rects, {
                                placement: e.placement
                            })) : t) ? t : Ie(t, Ht));
                        }(o.padding, n), d = Yt(r), h = "y" === c ? Nt : _t, f = "y" === c ? Vt : Bt, p = n.rects.reference[u] + n.rects.reference[c] - a[c] - n.rects.popper[u], m = a[c] - n.rects.reference[c], v = zt(r), g = v ? "y" === c ? v.clientHeight || 0 : v.clientWidth || 0 : 0, y = p / 2 - m / 2, b = l[h], w = g - d[u] - l[f], x = g / 2 - d[u] / 2 + y, I = Ee(b, x, w), O = c;
                        n.modifiersData[i] = ((e = {})[O] = I, e.centerOffset = I - x, e);
                    }
                },
                effect: function(t) {
                    var e = t.state, n = t.options.element, i = void 0 === n ? "[data-popper-arrow]" : n;
                    null != i && ("string" != typeof i || (i = e.elements.popper.querySelector(i))) && ye(e.elements.popper, i) && (e.elements.arrow = i);
                },
                requires: [ "popperOffsets" ],
                requiresIfExists: [ "preventOverflow" ]
            };
            function je(t, e, n) {
                return void 0 === n && (n = {
                    x: 0,
                    y: 0
                }), {
                    top: t.top - e.height - n.y,
                    right: t.right - e.width + n.x,
                    bottom: t.bottom - e.height + n.y,
                    left: t.left - e.width - n.x
                };
            }
            function Le(t) {
                return [ Nt, Bt, Vt, _t ].some((function(e) {
                    return t[e] >= 0;
                }));
            }
            var Ae = ne({
                defaultModifiers: [ oe, {
                    name: "popperOffsets",
                    enabled: !0,
                    phase: "read",
                    fn: function(t) {
                        var e = t.state, n = t.name;
                        e.modifiersData[n] = ce({
                            reference: e.rects.reference,
                            element: e.rects.popper,
                            strategy: "absolute",
                            placement: e.placement
                        });
                    },
                    data: {}
                }, de, he, fe, ke, Se, Ce, {
                    name: "hide",
                    enabled: !0,
                    phase: "main",
                    requiresIfExists: [ "preventOverflow" ],
                    fn: function(t) {
                        var e = t.state, n = t.name, i = e.rects.reference, o = e.rects.popper, r = e.modifiersData.preventOverflow, a = Oe(e, {
                            elementContext: "reference"
                        }), s = Oe(e, {
                            altBoundary: !0
                        }), c = je(a, i), u = je(s, o, r), l = Le(c), d = Le(u);
                        e.modifiersData[n] = {
                            referenceClippingOffsets: c,
                            popperEscapeOffsets: u,
                            isReferenceHidden: l,
                            hasPopperEscaped: d
                        }, e.attributes.popper = Object.assign({}, e.attributes.popper, {
                            "data-popper-reference-hidden": l,
                            "data-popper-escaped": d
                        });
                    }
                } ]
            }), Pe = function(t, e) {
                e || (t.removeAttribute("data-show"), t.removeAttribute("data-cloudimage-360-show"));
            };
            var De = function(t, e, n) {
                var i, o, r = t.images, a = t.title, s = t.description, c = t.moreDetailsUrl, u = t.moreDetailsTitle, l = void 0 === u ? "Read more" : u, d = document.createElement("div");
                if (d.className = "cloudimage-360-modal-wrapper", r) {
                    var h = document.createElement("div"), f = (i = function(t, e, n) {
                        var i = document.createElement("div"), o = document.createElement("div");
                        return i.className = "cloudimage-360-images-carousel", i.style.maxWidth = "".concat(n.offsetWidth, "px"), 
                        o.className = "cloudimage-360-carousel-dots", t.forEach((function(t, n) {
                            var r = function(t, e) {
                                var n = document.createElement("img");
                                return n.className = "cloudimage-360-carousel-image", n.setAttribute("src", t.src || ""), 
                                n.setAttribute("alt", t.alt || "more-info"), e || (n.setAttribute("data-active-image", ""), 
                                n.className += " active-image"), n;
                            }(t, n), a = function(t, e, n) {
                                var i = document.createElement("button");
                                return i.className = "cloudimage-360-carousel-dot", i.onclick = function() {
                                    return function(t, e, n) {
                                        var i = n.querySelector("[data-active-dot]"), o = n.querySelector("[data-active-image]");
                                        i.classList.remove("active-dot"), i.removeAttribute("data-active-dot"), o.classList.remove("active-image"), 
                                        o.removeAttribute("data-active-image"), t.className += " active-image", t.setAttribute("data-active-image", ""), 
                                        e.className += " active-dot", e.setAttribute("data-active-dot", "");
                                    }(t, i, n);
                                }, e || (i.className += " active-dot", i.setAttribute("data-active-dot", "")), i;
                            }(r, n, e);
                            o.appendChild(a), i.appendChild(r);
                        })), [ i, o ];
                    }(r, n, e), o = 2, function(t) {
                        if (Array.isArray(t)) return t;
                    }(i) || function(t, e) {
                        var n = null == t ? null : "undefined" != typeof Symbol && t[Symbol.iterator] || t["@@iterator"];
                        if (null != n) {
                            var i, o, r, a, s = [], c = !0, u = !1;
                            try {
                                if (r = (n = n.call(t)).next, 0 === e) {
                                    if (Object(n) !== n) return;
                                    c = !1;
                                } else for (;!(c = (i = r.call(n)).done) && (s.push(i.value), s.length !== e); c = !0) ;
                            } catch (t) {
                                u = !0, o = t;
                            } finally {
                                try {
                                    if (!c && null != n.return && (a = n.return(), Object(a) !== a)) return;
                                } finally {
                                    if (u) throw o;
                                }
                            }
                            return s;
                        }
                    }(i, o) || z(i, o) || function() {
                        throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
                    }()), p = f[0], m = f[1];
                    h.appendChild(p), r.length > 1 && h.appendChild(m), d.appendChild(h), h.className = "cloudimage-360-images-carousel-wrapper";
                }
                if (a) {
                    var v = function(t) {
                        var e = document.createElement("h4");
                        return e.innerText = t, e.className = "cloudimage-360-modal-title", e;
                    }(a);
                    d.appendChild(v);
                }
                if (s) {
                    var g = function(t) {
                        var e = document.createElement("p");
                        return e.innerText = t, e.className = "cloudimage-360-modal-description", e;
                    }(s);
                    d.appendChild(g);
                }
                if (c) {
                    var y = function(t, e) {
                        var n = document.createElement("a");
                        return n.href = t, n.innerText = e, n.className = "cloudimage-360-modal-more-details", 
                        n.target = "_blank", n;
                    }(c, l);
                    d.appendChild(y);
                }
                n.appendChild(d);
            }, Ye = function(e, n) {
                n.forEach((function(n) {
                    var i = n.popupProps, o = function(e, n, i) {
                        var o, r = n.variant, a = i.popupSelector, s = i.arrow, c = r.url, u = r.images, l = r.title, d = r.anchorId, h = r.description, f = r.moreDetailsUrl, p = document.createElement("div");
                        if (p.className = "cloudimage-360-hotspot-popup ".concat(a), p.setAttribute("data-hotspot-popup-id", d), 
                        p.setAttribute("data-cloudimage-360-hotspot", ""), p.style.minHeight = 16, p.style.minWidth = 16, 
                        p.style.cursor = "default", p.onclick = function(t) {
                            return t.stopPropagation();
                        }, "object" === t(r) && u || h || f || l && !c) De(r, e, p); else if (c) {
                            var m = function(t) {
                                var e = t.url, n = t.title, i = t.newTab, o = document.createElement("a");
                                return o.href = e, o.innerText = n, i && (o.target = "_blank"), o;
                            }(r);
                            p.appendChild(m);
                        } else if ("string" == typeof r) try {
                            var v = (o = r, document.querySelector("[".concat("data-cloudimage-360-hotspots", "=").concat(o, "]"))), g = v.cloneNode(!0);
                            p.appendChild(g), v.parentNode.removeChild(v);
                        } catch (t) {
                            console.error("Cloudimage-360: Element with anchorId '".concat(d, "' not exist in the DOM"));
                        }
                        if (s) {
                            var y = function() {
                                var t = document.createElement("div");
                                return t.setAttribute("data-popper-arrow", ""), t.setAttribute("data-cloudimage-360-hotspot", ""), 
                                t.className = "cloudimage-360-popup-arrow", t;
                            }();
                            p.appendChild(y);
                        }
                        return e.appendChild(p), p;
                    }(e, n, i), r = function(t, e, n) {
                        var i = e.placement, o = e.offset, r = document.createElement("div"), a = Ae(r, t);
                        return a.setOptions({
                            placement: i,
                            modifiers: [ {
                                name: "offset",
                                options: {
                                    offset: o
                                }
                            }, {
                                name: "preventOverflow",
                                options: {
                                    boundary: n
                                }
                            } ]
                        }), a;
                    }(o, i, e), a = function(t, e, n, i) {
                        var o, r = e.indicatorSelector, a = e.variant, s = a.url, c = a.anchorId, u = e.popupProps.open, l = void 0 !== u && u, d = document.createElement("div");
                        return d.style.position = "absolute", d.className = "cloudimage-360-hotspot-".concat(s ? "link" : "custom", "-icon ").concat(r), 
                        d.setAttribute("data-hotspot-icon-id", c), d.setAttribute("data-cloudimage-360-hotspot", ""), 
                        d.onclick = function(t) {
                            return t.stopPropagation();
                        }, [ "mouseenter", "touchstart", "focus" ].forEach((function(t) {
                            d.addEventListener(t, (function() {
                                return function(t, e) {
                                    t.setAttribute("data-show", ""), t.setAttribute("data-cloudimage-360-show", ""), 
                                    e.update();
                                }(n, i);
                            }));
                        })), l || [ "mouseleave", "blur" ].forEach((function(t) {
                            d.addEventListener(t, (function() {
                                return setTimeout((function() {
                                    return Pe(n, o);
                                }), 160);
                            }));
                        })), n.addEventListener("mouseenter", (function() {
                            o = !0;
                        })), n.addEventListener("mouseleave", (function() {
                            o = !1, !l && Pe(n, o);
                        })), pt(d), t.appendChild(d), d;
                    }(e, n, o, r);
                    r.state.elements.reference = a, r.update();
                }));
            };
            function Te(t, e) {
                var n = Object.keys(t);
                if (Object.getOwnPropertySymbols) {
                    var i = Object.getOwnPropertySymbols(t);
                    e && (i = i.filter((function(e) {
                        return Object.getOwnPropertyDescriptor(t, e).enumerable;
                    }))), n.push.apply(n, i);
                }
                return n;
            }
            function Re(t) {
                for (var e = 1; e < arguments.length; e++) {
                    var n = null != arguments[e] ? arguments[e] : {};
                    e % 2 ? Te(Object(n), !0).forEach((function(e) {
                        i(t, e, n[e]);
                    })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Te(Object(n)).forEach((function(e) {
                        Object.defineProperty(t, e, Object.getOwnPropertyDescriptor(n, e));
                    }));
                }
                return t;
            }
            var Xe = function(t) {
                return t.map((function(t) {
                    var e = t.variant, n = void 0 === e ? {} : e, i = t.positions, o = void 0 === i ? [] : i, r = t.indicatorSelector, a = void 0 === r ? "" : r, s = t.popupProps, c = void 0 === s ? {} : s, u = t.orientation, l = void 0 === u ? "x" : u, d = t.initialDimensions, h = void 0 === d ? [ 500, 500 ] : d;
                    !function(t) {
                        var e = t.variant, n = void 0 === e ? {} : e, i = n.url, o = n.title, r = n.anchorId, a = n.images, s = n.description, c = n.moreDetailsUrl;
                        i && !o && console.error("Cloudimage-360: Hotspot config with variant link must have title for the link"), 
                        o || i || r || a || s || c || console.error("Cloudimage-360: Hotspot config with custom variant must provide anchorId");
                    }(t);
                    var f = function(t) {
                        var e = t.popupSelector, n = void 0 === e ? "" : e, i = t.arrow, o = void 0 === i || i, r = t.offset, a = void 0 === r ? [ 0, 10 ] : r, s = t.placement, c = void 0 === s ? "auto" : s, u = t.open;
                        return {
                            popupSelector: n,
                            arrow: o,
                            offset: a,
                            placement: c,
                            open: void 0 !== u && u
                        };
                    }(c), p = null == n ? void 0 : n.anchorId;
                    if (!p) {
                        var m = Math.floor(1e4 * Math.random());
                        p = "cloudimage-360-".concat(m);
                    }
                    return {
                        variant: Re(Re({}, n), {}, {
                            anchorId: p
                        }),
                        popupProps: f,
                        positions: o,
                        indicatorSelector: a,
                        initialDimensions: h,
                        orientation: l.toLowerCase()
                    };
                }));
            }, Me = function() {
                return !!document.querySelectorAll("[data-cloudimage-360-show]").length;
            }, Fe = function(t, e, n) {
                e && h(e.target, "data-cloudimage-360-hotspot") || t.forEach((function(t) {
                    var e = t.variant.anchorId;
                    ft(e).style.pointerEvents = n ? "none" : "all";
                }));
            };
            function ze(t, e) {
                var n = Object.keys(t);
                if (Object.getOwnPropertySymbols) {
                    var i = Object.getOwnPropertySymbols(t);
                    e && (i = i.filter((function(e) {
                        return Object.getOwnPropertyDescriptor(t, e).enumerable;
                    }))), n.push.apply(n, i);
                }
                return n;
            }
            function Ne(t) {
                for (var e = 1; e < arguments.length; e++) {
                    var n = null != arguments[e] ? arguments[e] : {};
                    e % 2 ? ze(Object(n), !0).forEach((function(e) {
                        i(t, e, n[e]);
                    })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : ze(Object(n)).forEach((function(e) {
                        Object.defineProperty(t, e, Object.getOwnPropertyDescriptor(n, e));
                    }));
                }
                return t;
            }
            var Ve = function() {
                function e(t, n, i) {
                    !function(t, e) {
                        if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
                    }(this, e), this.container = t, this.movementStart = {
                        x: 0,
                        y: 0
                    }, this.isStartSpin = !1, this.movingDirection = l, this.isClicked = !1, this.loadedImagesX = 0, 
                    this.loadedImagesY = 0, this.imagesLoaded = !1, this.reversed = !1, this.fullscreenView = !!n, 
                    this.imagesX = [], this.imagesY = [], this.originalImagesX = [], this.originalImagesY = [], 
                    this.resizedImagesX = [], this.resizedImagesY = [], this.devicePixelRatio = Math.round(window.devicePixelRatio || 1), 
                    this.isMobile = !(!("ontouchstart" in window) && !navigator.msMaxTouchPoints), this.id = t.id, 
                    this.hotspotsConfigs = i && Xe(i), this.isMagnifyOpen = !1, this.isDragged = !1, 
                    this.startPointerZoom = !1, this.zoomIntensity = 0, this.mouseTracked = !1, this.intialPositions = {
                        x: 0,
                        y: 0
                    }, this.pointerCurrentPosition = {
                        x: 0,
                        y: 0
                    }, this.isStartedLoadOriginalImages = !1, this.init(t);
                }
                var n, i;
                return n = e, i = [ {
                    key: "isReady",
                    value: function() {
                        var t = this.amountX + this.amountY;
                        return this.imagesX.length + this.imagesY.length === t;
                    }
                }, {
                    key: "mouseDown",
                    value: function(t) {
                        if (this.imagesLoaded) {
                            var e = Me(), n = t.pageX, i = t.pageY;
                            this.hideInitialIcons(), (this.autoplay || this.loopTimeoutId) && (this.stop(), 
                            this.autoplay = !1, this.isZoomReady = !0), this.intialPositions = {
                                x: n,
                                y: i
                            }, this.movementStart = {
                                x: n,
                                y: i
                            }, this.isClicked = !0, this.isDragged = !1, this.hotspotsConfigs && Fe(this.hotspotsConfigs, t, !0), 
                            e && (this.isClicked = !1), this.hotspotsConfigs && mt(this.container, this.hotspotsConfigs, this.activeImageX, this.activeImageY, this.movingDirection);
                        }
                    }
                }, {
                    key: "mouseUp",
                    value: function() {
                        var t = this;
                        this.imagesLoaded && this.isClicked && (this.movementStart = {
                            x: 0,
                            y: 0
                        }, this.isStartSpin = !1, this.isClicked = !1, this.bottomCircle && !this.mouseTracked && this.show360ViewCircleIcon(), 
                        this.hotspotsConfigs && Fe(this.hotspotsConfigs), this.pointerZoom && !this.fullscreenView ? (setTimeout((function() {
                            t.isZoomReady = !0;
                        }), 50), this.mouseTracked ? this.container.style.cursor = "zoom-out" : this.container.style.cursor = "zoom-in") : this.container.style.cursor = "grab");
                    }
                }, {
                    key: "mouseClick",
                    value: function(t) {
                        this.pointerZoom && !this.fullscreenView && (this.setCursorPosition(t), this.hideInitialIcons(), 
                        this.isStartedLoadOriginalImages || this.isDragged || !this.isZoomReady || this.prepareOriginalImages(t), 
                        this.isAllOriginalImagesLoaded && !this.isDragged && this.isZoomReady && this.togglePointerZoom(t));
                    }
                }, {
                    key: "mouseMove",
                    value: function(t) {
                        if (this.imagesLoaded) {
                            var e = t.pageX, n = t.pageY;
                            if (this.mouseTracked && (this.setCursorPosition(t), this.isClicked || this.update()), 
                            this.isClicked) {
                                var i = {
                                    x: e,
                                    y: n
                                };
                                this.container.style.cursor = "grabbing", this.isDragged = !0, this.movingDirection = at(this.isStartSpin, this.allowSpinY, this.intialPositions, i, this.movingDirection), 
                                this.onMoveHandler(t);
                            }
                        }
                    }
                }, {
                    key: "mouseLeave",
                    value: function() {
                        this.imagesLoaded && (this.pointerZoom && this.mouseTracked && this.togglePointerZoom(), 
                        this.isMagnifyOpen && this.closeMagnifier());
                    }
                }, {
                    key: "togglePointerZoom",
                    value: function() {
                        var t, e = this;
                        if ((this.autoplay || this.loopTimeoutId) && (this.stop(), this.autoplay = !1), 
                        this.mouseTracked) {
                            var n = (t = this.pointerZoom, Array.from(Array(20)).reduce((function(e, n, i) {
                                var o = +((i - 1 < 0 ? t : e[i - 1]) - (t - 1) / 20).toFixed(2);
                                return (e || []).push(o), e;
                            }), []));
                            this.container.style.cursor = "zoom-in", n.forEach((function(t, i) {
                                setTimeout((function() {
                                    e.zoomIntensity = t, e.update(), i === n.length - 1 && (e.mouseTracked = !1, e.update());
                                }), 200 * (e.pointerZoom - t));
                            }));
                        } else {
                            this.bottomCircle && this.hide360ViewCircleIcon();
                            var i = function(t) {
                                return Array.from(Array(20)).reduce((function(e, n, i) {
                                    var o = +((i - 1 < 0 ? 1 : e[i - 1]) + (t - 1) / 20).toFixed(2);
                                    return (e || []).push(o), e;
                                }), []);
                            }(this.pointerZoom);
                            this.hotspotsConfigs && (document.querySelectorAll("[data-hotspot-icon-id]") || []).forEach((function(t) {
                                pt(t);
                            })), i.forEach((function(t) {
                                setTimeout((function() {
                                    e.zoomIntensity = t, e.update();
                                }), 200 * t);
                            })), this.mouseTracked = !0, this.container.style.cursor = "zoom-out";
                        }
                    }
                }, {
                    key: "onOriginalImageLoad",
                    value: function(t, e, n, i) {
                        t === u ? this.originalImagesY[i] = n : this.originalImagesX[i] = n;
                        var o = this.originalImagesX.filter((function(t) {
                            return t;
                        })), r = this.originalImagesY.filter((function(t) {
                            return t;
                        })), a = this.amountX + this.amountY, s = o.length + r.length, c = o.length + r.length === this.amountX + this.amountY, l = Math.round(s / a * 100);
                        this.updatePercentageInLoader(l), c && (this.removeLoader(), this.togglePointerZoom(e), 
                        this.mouseTracked = !0, this.isAllOriginalImagesLoaded = !0);
                    }
                }, {
                    key: "prepareOriginalImages",
                    value: function(t) {
                        var e = R(this.srcXConfig);
                        if (this.isStartedLoadOriginalImages = !0, this.loader = lt(this.innerBox), this.container.style.cursor = "wait", 
                        K(this.srcXConfig, e, this.onOriginalImageLoad.bind(this, c, t)), this.allowSpinY) {
                            var n = R(this.srcYConfig);
                            K(this.srcYConfig, n, this.onOriginalImageLoad.bind(this, u, t));
                        }
                    }
                }, {
                    key: "touchStart",
                    value: function(t) {
                        if (this.imagesLoaded) {
                            var e = Me();
                            this.hideInitialIcons(), (this.autoplay || this.loopTimeoutId) && (this.stop(), 
                            this.autoplay = !1), this.intialPositions = {
                                x: t.touches[0].clientX,
                                y: t.touches[0].clientY
                            }, this.movementStart = {
                                x: t.touches[0].clientX,
                                y: t.touches[0].clientY
                            }, this.isClicked = !0, e && (this.isClicked = !1);
                        }
                    }
                }, {
                    key: "touchEnd",
                    value: function() {
                        this.imagesLoaded && (this.bottomCircle && this.show360ViewCircleIcon(), this.movementStart = {
                            x: 0,
                            y: 0
                        }, this.isStartSpin = !1, this.isClicked = !1);
                    }
                }, {
                    key: "touchMove",
                    value: function(t) {
                        if (this.isClicked && this.imagesLoaded) {
                            t.cancelable && this.allowSpinY && t.preventDefault();
                            var e = {
                                x: t.touches[0].clientX,
                                y: t.touches[0].clientY
                            };
                            this.movingDirection = at(this.isStartSpin, this.allowSpinY, this.intialPositions, e, this.movingDirection), 
                            this.onMoveHandler(t);
                        }
                    }
                }, {
                    key: "keyDownGeneral",
                    value: function(t) {
                        this.imagesLoaded && (this.glass && this.closeMagnifier(), 27 === t.keyCode && this.mouseTracked && this.togglePointerZoom());
                    }
                }, {
                    key: "hideInitialIcons",
                    value: function() {
                        this.glass && this.closeMagnifier(), this.view360Icon && this.remove360ViewIcon();
                    }
                }, {
                    key: "setCursorPosition",
                    value: function(t) {
                        this.mousePositions = {
                            x: t.clientX,
                            y: t.clientY
                        };
                    }
                }, {
                    key: "getCursorPositionInCanvas",
                    value: function() {
                        var t = this.canvas.getBoundingClientRect();
                        return this.pointerCurrentPosition = {
                            x: this.mousePositions.x - t.left,
                            y: this.mousePositions.y - t.top
                        }, this.pointerCurrentPosition;
                    }
                }, {
                    key: "keyDown",
                    value: function(t) {
                        this.imagesLoaded && (this.glass && this.closeMagnifier(), 37 === t.keyCode && (this.keysReverse ? this.left() : this.right(), 
                        this.onSpin()), 39 === t.keyCode && (this.keysReverse ? this.right() : this.left(), 
                        this.onSpin()), this.allowSpinY && (t.preventDefault(), 38 === t.keyCode && (this.keysReverse ? this.top() : this.bottom(), 
                        this.onSpin()), 40 === t.keyCode && (this.keysReverse ? this.bottom() : this.top(), 
                        this.onSpin())));
                    }
                }, {
                    key: "onSpin",
                    value: function() {
                        this.bottomCircle && this.hide360ViewCircleIcon(), this.view360Icon && this.remove360ViewIcon(), 
                        (this.autoplay || this.loopTimeoutId) && (this.stop(), this.autoplay = !1);
                    }
                }, {
                    key: "keyUp",
                    value: function(t) {
                        this.imagesLoaded && -1 !== [ 37, 39 ].indexOf(t.keyCode) && this.onFinishSpin();
                    }
                }, {
                    key: "onFinishSpin",
                    value: function() {
                        this.bottomCircle && this.show360ViewCircleIcon();
                    }
                }, {
                    key: "moveActiveIndexUp",
                    value: function(t) {
                        var e = this.controlReverse ? !this.spinReverse : this.spinReverse;
                        this.stopAtEdges ? this.activeImageX + t >= this.amountX ? (this.activeImageX = this.amountX, 
                        (e ? this.leftElem : this.rightElem) && ot(e ? this.leftElem : this.rightElem, "not-active")) : (this.activeImageX += t, 
                        this.rightElem && rt(this.rightElem, "not-active"), this.leftElem && rt(this.leftElem, "not-active")) : (this.activeImageX = (this.activeImageX + t) % this.amountX || this.amountX, 
                        this.activeImageX === this.amountX && this.allowSpinY && (this.spinY = !0));
                    }
                }, {
                    key: "moveActiveIndexDown",
                    value: function(t) {
                        var e = this.controlReverse ? !this.spinReverse : this.spinReverse;
                        this.stopAtEdges ? this.activeImageX - t <= 1 ? (this.activeImageX = 1, (e ? this.rightElem : this.leftElem) && ot(e ? this.rightElem : this.leftElem, "not-active")) : (this.activeImageX -= t, 
                        this.leftElem && rt(this.leftElem, "not-active"), this.rightElem && rt(this.rightElem, "not-active")) : this.activeImageX - t < 1 ? (this.activeImageX = this.amountX + (this.activeImageX - t), 
                        this.spinY = !0) : this.activeImageX -= t;
                    }
                }, {
                    key: "moveActiveYIndexUp",
                    value: function(t) {
                        var e = this.controlReverse ? !this.spinReverse : this.spinReverse;
                        this.stopAtEdges ? this.activeImageY + t >= this.amountY ? (this.activeImageY = this.amountY, 
                        (e ? this.bottomElem : this.topElem) && ot(e ? this.bottomElem : this.topElem, "not-active")) : (this.activeImageY += t, 
                        this.topElem && rt(this.topElem, "not-active"), this.bottomElem && rt(this.bottomElem, "not-active")) : (this.activeImageY = (this.activeImageY + t) % this.amountY || this.amountY, 
                        this.activeImageY === this.amountY && (this.spinY = !1));
                    }
                }, {
                    key: "moveActiveYIndexDown",
                    value: function(t) {
                        var e = this.controlReverse ? !this.spinReverse : this.spinReverse;
                        this.stopAtEdges ? this.activeImageY - t <= 1 ? (this.activeImageY = 1, (e ? this.topElem : this.bottomElem) && ot(e ? this.topElem : this.bottomElem, "not-active")) : (this.activeImageY -= t, 
                        this.bottomElem && rt(this.bottomElem, "not-active"), this.topElem && rt(this.topElem, "not-active")) : this.activeImageY - t < 1 ? (this.activeImageY = this.amountY + (this.activeImageY - t), 
                        this.spinY = !1) : this.activeImageY -= t;
                    }
                }, {
                    key: "moveRight",
                    value: function(t) {
                        var e = st(t, this.movementStart.x, this.speedFactor);
                        this.spinReverse ? this.moveActiveIndexDown(e) : this.moveActiveIndexUp(e), this.movementStart.x = t, 
                        this.activeImageY = 1, this.update();
                    }
                }, {
                    key: "moveLeft",
                    value: function(t) {
                        var e = st(this.movementStart.x, t, this.speedFactor);
                        this.spinReverse ? this.moveActiveIndexUp(e) : this.moveActiveIndexDown(e), this.activeImageY = 1, 
                        this.movementStart.x = t, this.update();
                    }
                }, {
                    key: "moveTop",
                    value: function(t) {
                        var e = st(this.movementStart.y, t, this.speedFactor);
                        this.spinReverse ? this.moveActiveYIndexUp(e) : this.moveActiveYIndexDown(e), this.activeImageX = 1, 
                        this.movementStart.y = t, this.update();
                    }
                }, {
                    key: "moveBottom",
                    value: function(t) {
                        var e = st(t, this.movementStart.y, this.speedFactor);
                        this.spinReverse ? this.moveActiveYIndexDown(e) : this.moveActiveYIndexUp(e), this.activeImageX = 1, 
                        this.movementStart.y = t, this.update();
                    }
                }, {
                    key: "onMoveHandler",
                    value: function(t) {
                        var e = this.isMobile ? t.touches[0].clientX : t.pageX, n = this.isMobile ? t.touches[0].clientY : t.pageY, i = e - this.movementStart.x >= this.speedFactor, o = this.movementStart.x - e >= this.speedFactor, r = this.movementStart.y - n >= this.speedFactor, a = n - this.movementStart.y >= this.speedFactor;
                        this.bottomCircle && this.hide360ViewCircleIcon(), i && this.movingDirection === c ? (this.moveRight(e), 
                        this.isStartSpin = !0) : o && this.movingDirection === c ? (this.moveLeft(e), this.isStartSpin = !0) : r && this.movingDirection === u ? (this.moveTop(n), 
                        this.isStartSpin = !0) : a && this.movingDirection === u && (this.moveBottom(n), 
                        this.isStartSpin = !0);
                    }
                }, {
                    key: "left",
                    value: function() {
                        this.movingDirection = c, this.activeImageY = this.reversed ? this.amountY : 1, 
                        this.moveActiveIndexDown(1), this.update();
                    }
                }, {
                    key: "right",
                    value: function() {
                        this.movingDirection = c, this.activeImageY = this.reversed ? this.amountY : 1, 
                        this.moveActiveIndexUp(1), this.update();
                    }
                }, {
                    key: "top",
                    value: function() {
                        this.movingDirection = u, this.activeImageX = this.reversed ? this.amountX : 1, 
                        this.moveActiveYIndexUp(1), this.update();
                    }
                }, {
                    key: "bottom",
                    value: function() {
                        this.movingDirection = u, this.activeImageX = this.reversed ? this.amountX : 1, 
                        this.moveActiveYIndexDown(1), this.update();
                    }
                }, {
                    key: "loop",
                    value: function(t) {
                        var e = {
                            left: this.left.bind(this),
                            right: this.right.bind(this),
                            top: this.top.bind(this),
                            bottom: this.bottom.bind(this)
                        };
                        !function(t, e, n, i) {
                            var o = i.bottom, c = i.top, u = i.left, l = i.right;
                            switch (t) {
                              case r:
                                n ? o() : c();
                                break;

                              case a:
                              case s:
                                e ? n ? o() : c() : n ? u() : l();
                                break;

                              default:
                                n ? u() : l();
                            }
                        }(this.autoplayBehavior, this.spinY, t, e);
                    }
                }, {
                    key: "updateContainerAndCanvasSize",
                    value: function(e) {
                        var n = function(e, n) {
                            try {
                                var i = e.width / e.height;
                                if ("number" == typeof n && (i = n), n && "object" === t(n)) {
                                    var o = Object.keys(n).sort((function(t, e) {
                                        return t - e;
                                    })).find((function(t) {
                                        return window.innerWidth <= parseInt(t, 10);
                                    }));
                                    o && (i = n[o]);
                                }
                                return i;
                            } catch (t) {
                                return 1;
                            }
                        }(e, this.ratio);
                        if (this.fullscreenView) return this.container.width = window.innerWidth * this.devicePixelRatio, 
                        this.container.style.width = window.innerWidth + "px", this.container.height = window.innerHeight * this.devicePixelRatio, 
                        this.container.style.height = window.innerHeight + "px", this.container.style.maxWidth = "unset", 
                        this.canvas.width = window.innerWidth * this.devicePixelRatio, this.canvas.style.width = window.innerWidth + "px", 
                        this.canvas.height = window.innerHeight * this.devicePixelRatio, void (this.canvas.style.height = window.innerHeight + "px");
                        this.canvas.width = this.container.offsetWidth * this.devicePixelRatio, this.canvas.style.width = this.container.offsetWidth + "px", 
                        this.canvas.height = this.container.offsetWidth / n * this.devicePixelRatio, this.canvas.style.height = this.container.offsetWidth / n + "px";
                    }
                }, {
                    key: "onResizedImageLoad",
                    value: function(t, e, n) {
                        t === u ? this.resizedImagesY[n] = e : this.resizedImagesX[n] = e, this.resizedImagesX.length + this.resizedImagesY.length === this.amountX + this.amountY && (this.imagesX = this.resizedImagesX, 
                        this.imagesY = this.resizedImagesY, this.update());
                    }
                }, {
                    key: "showImageInfo",
                    value: function(t) {
                        t.font = "".concat(this.fullscreenView ? 28 : 14, "px serif"), t.fillStyle = "white" === this.info ? "#FFF" : "#000";
                        var e = "image-dimension: ".concat(this.container.offsetWidth, "x").concat(this.container.offsetHeight, "px"), n = [ "active-index-x: " + this.activeImageX, "active-index-y: " + this.activeImageY ].join(" | ");
                        t.fillText(e, 20, this.container.offsetHeight - 35), t.fillText(n, 20, this.container.offsetHeight - 10);
                    }
                }, {
                    key: "requestResizedImages",
                    value: function() {
                        if (this.isReady()) {
                            var t = this.ciParams.ciToken, e = this.imagesX[0];
                            if (this.update(), t && this.requestResponsiveImages && !(this.container.offsetWidth < 1.5 * e.width)) {
                                this.speedFactor = it(this.dragSpeed, this.amountX, this.container.offsetWidth);
                                var n = R(this.srcXConfig);
                                if (q(this.srcXConfig, n, this.onResizedImageLoad.bind(this, c)), this.allowSpinY) {
                                    var i = R(this.srcYConfig);
                                    q(this.srcYConfig, i, this.onResizedImageLoad.bind(this, u));
                                }
                            }
                        }
                    }
                }, {
                    key: "update",
                    value: function() {
                        var t = this.imagesX[this.activeImageX - 1];
                        if (this.movingDirection === u && (t = this.imagesY[this.activeImageY - 1]), t) {
                            var e = this.canvas.getContext("2d");
                            if (e.scale(this.devicePixelRatio, this.devicePixelRatio), this.updateContainerAndCanvasSize(t), 
                            this.fullscreenView) {
                                var n = et(this.canvas.width, this.canvas.height, t.width, t.height), i = n.width, o = n.height, r = n.offsetX, a = n.offsetY;
                                e.drawImage(t, r, a, i, o);
                            } else this.mouseTracked ? this.updateImageScale(e) : (this.hotspotsConfigs && !this.autoplay && mt(this.container, this.hotspotsConfigs, this.activeImageX, this.activeImageY, this.movingDirection, this.isClicked), 
                            e.drawImage(t, 0, 0, this.canvas.width, this.canvas.height));
                            this.info && this.showImageInfo(e);
                        }
                    }
                }, {
                    key: "updateImageScale",
                    value: function(t) {
                        var e = this.originalImagesX[this.activeImageX - 1];
                        this.movingDirection === u && (e = this.originalImagesY[this.activeImageY - 1]);
                        var n = this.getCursorPositionInCanvas(), i = this.canvas.width, o = this.canvas.height, r = this.canvas.width * this.zoomIntensity, a = this.canvas.height * this.zoomIntensity, s = 0 - n.x / i * (r - this.canvas.width), c = 0 - n.y / o * (a - this.canvas.height);
                        t.drawImage(e, s, c, r, a);
                    }
                }, {
                    key: "updatePercentageInLoader",
                    value: function(t) {
                        this.loader && (this.loader.style.width = t + "%"), this.view360Icon && (this.view360Icon.innerText = t + "%");
                    }
                }, {
                    key: "onFirstImageLoaded",
                    value: function(t) {
                        this.add360ViewIcon();
                        var e = this.canvas.getContext("2d");
                        if (e.scale(this.devicePixelRatio, this.devicePixelRatio), this.updateContainerAndCanvasSize(t), 
                        this.fullscreenView) {
                            var n = et(this.canvas.width, this.canvas.height, t.width, t.height), i = n.offsetX, o = n.offsetY, r = n.width, a = n.height;
                            this.offset = {
                                x: i,
                                y: o
                            }, this.addCloseFullscreenView(), e.drawImage(t, i, o, r, a);
                        } else e.drawImage(t, 0, 0, this.canvas.width, this.canvas.height);
                        this.info && this.showImageInfo(e), this.magnifier && this.addMagnifier(), this.boxShadow && !this.fullscreenView && (this.boxShadowEl = ut(this.boxShadow, this.innerBox)), 
                        this.bottomCircle && !this.fullscreenView && this.add360ViewCircleIcon(), this.fullscreen && !this.fullscreenView && this.addFullscreenIcon();
                    }
                }, {
                    key: "onAllImagesLoaded",
                    value: function() {
                        if (this.removeLoader(), this.imagesLoaded = !0, this.autoplay && this.pointerZoom ? this.container.style.cursor = "zoom-in" : this.container.style.cursor = "grab", 
                        this.speedFactor = it(this.dragSpeed, this.amountX, this.container.offsetWidth), 
                        this.autoplay && this.play(), this.disableDrag && (this.container.style.cursor = "default"), 
                        this.view360Icon) {
                            if (this.hide360Logo) return this.remove360ViewIcon();
                            this.view360Icon.innerText = "", this.logoSrc && p(this.view360Icon, this.logoSrc);
                        }
                        this.initControls();
                    }
                }, {
                    key: "magnify",
                    value: function(t) {
                        var e = this;
                        t.stopPropagation(), this.mouseTracked && this.togglePointerZoom();
                        var n, i, o, r, a, s, c, l, d = (n = this.movingDirection, i = this.imagesX, o = this.imagesY, 
                        r = this.activeImageX, a = this.activeImageY, s = new Image, c = i.map((function(t) {
                            return t.src.replace(N, "").replace(V, "?");
                        })), l = o.map((function(t) {
                            return t.src.replace(N, "").replace(V, "?");
                        })), s.src = c[r - 1], n === u && (s.src = l[a - 1]), s);
                        this.isMagnifyOpen = !0, d.onload = function() {
                            e.glass && (e.glass.style.cursor = "none");
                        }, this.glass = document.createElement("div"), this.container.style.overflow = "hidden", 
                        function(t, e, n, i, o) {
                            var r = e || {}, a = r.x, s = void 0 === a ? 0 : a, c = r.y, u = void 0 === c ? 0 : c, l = (t.offsetWidth - 2 * s) * o, d = (t.offsetHeight - 2 * u) * o;
                            i.setAttribute("class", "cloudimage-360-img-magnifier-glass"), t.prepend(i), i.style.backgroundImage = "url('".concat(n.src, "')"), 
                            i.style.backgroundSize = "".concat(l, "px ").concat(d, "px");
                            var h = {
                                container: t,
                                w: i.offsetWidth / 2,
                                h: i.offsetHeight / 2,
                                zoom: o,
                                bw: 3,
                                offsetX: s,
                                offsetY: u
                            }, f = function(t) {
                                nt(t, h, i);
                            }, p = function(t) {
                                nt(t, h, i);
                            };
                            i.addEventListener("mousemove", f), t.addEventListener("mousemove", f), i.addEventListener("touchmove", p, {
                                passive: !0
                            }), t.addEventListener("touchmove", p, {
                                passive: !0
                            });
                        }(this.container, this.offset, d, this.glass, this.magnifier || 3);
                    }
                }, {
                    key: "closeMagnifier",
                    value: function() {
                        this.glass && (this.container.style.overflow = "visible", this.container.removeChild(this.glass), 
                        this.glass = null, this.isMagnifyOpen = !1);
                    }
                }, {
                    key: "openFullscreenModal",
                    value: function(t) {
                        t.stopPropagation(), this.mouseTracked && this.togglePointerZoom(), new e(function(t) {
                            var e = document.createElement("div");
                            e.className = "cloudimage-360-fullscreen-modal";
                            var n = t.cloneNode();
                            return n.style.height = "100%", n.style.maxHeight = "100%", e.appendChild(n), window.document.body.style.overflow = "hidden", 
                            window.document.body.appendChild(e), n;
                        }(this.container), !0, this.hotspotsConfigs);
                    }
                }, {
                    key: "setFullscreenEvents",
                    value: function(t, e) {
                        if ("click" === e.type) return this.closeFullscreenModal(e);
                        "Escape" === e.key && this.container.parentNode.parentNode === document.body && this.closeFullscreenModalOnEsc(e);
                    }
                }, {
                    key: "closeFullscreenModalOnEsc",
                    value: function(t) {
                        this.closeFullscreenModal(t);
                    }
                }, {
                    key: "play",
                    value: function() {
                        var t = this;
                        this.bottomCircle && this.hide360ViewCircleIcon(), this.remove360ViewIcon(), this.loopTimeoutId = window.setInterval((function() {
                            t.loop(t.reversed);
                            var e = function(t, e, n, i, o, s) {
                                switch (t) {
                                  case a:
                                  case r:
                                    return !!(s ? 1 === n : n === o);

                                  default:
                                    return !!(s ? 1 === e : e === i);
                                }
                            }(t.autoplayBehavior, t.activeImageX, t.activeImageY, t.amountX, t.amountY, t.reversed);
                            t.playOnce && e && (window.clearTimeout(t.loopTimeoutId), t.autoplay = !1, t.hotspotsConfigs && mt(t.container, t.hotspotsConfigs, t.activeImageX, t.activeImageY, t.movingDirection, t.isClicked));
                        }), this.autoplaySpeed);
                    }
                }, {
                    key: "stop",
                    value: function() {
                        this.bottomCircle && this.show360ViewCircleIcon(), window.clearTimeout(this.loopTimeoutId);
                    }
                }, {
                    key: "updateView",
                    value: function(t, n, i) {
                        var o, r, a = this, s = this.container, c = d(s);
                        if (o = this, r = c, Object.keys(r).reduce((function(t, e) {
                            var n = o[e] !== r[e];
                            return -1 !== Y.indexOf(e) && n && (t = !0), t;
                        }), !1) || t) {
                            var u = this.container, l = n.findIndex((function(t) {
                                return t.id === a.container.id;
                            }));
                            return s.removeChild(this.innerBox), (s = s.cloneNode(!0)).className = s.className.replace(" initialized", ""), 
                            u.parentNode.replaceChild(s, u), n.splice(l, 1, new e(s));
                        }
                        s.style.position = "relative", s.style.width = "100%", s.style.cursor = "default", 
                        s.setAttribute("draggable", "false"), this.stop(), this.init(s, !0, i);
                    }
                }, {
                    key: "destroy",
                    value: function() {
                        this.stop();
                        var t = this.container, e = t.cloneNode(!0), n = e.querySelector(".cloudimage-360-inner-box");
                        e.className = e.className.replace(" initialized", ""), e.style.position = "relative", 
                        e.style.width = "100%", e.style.cursor = "default", e.setAttribute("draggable", "false"), 
                        e.style.minHeight = "auto", e.removeChild(n), t.parentNode.replaceChild(e, t);
                    }
                }, {
                    key: "addCloseFullscreenView",
                    value: function(t) {
                        var e = function() {
                            var t = document.createElement("div");
                            return t.className = "cloudimage-360-close-fullscreen-icon", t;
                        }();
                        e.onclick = this.setFullscreenEvents.bind(this, t), window.onkeyup = this.setFullscreenEvents.bind(this, t), 
                        this.iconsContainer.appendChild(e);
                    }
                }, {
                    key: "add360ViewIcon",
                    value: function() {
                        var t;
                        this.view360Icon = ((t = document.createElement("div")).className = "cloudimage-360-view-360-icon", 
                        t.innerText = "0%", t), this.innerBox.appendChild(this.view360Icon);
                    }
                }, {
                    key: "addFullscreenIcon",
                    value: function() {
                        var t;
                        this.fullscreenIcon = ((t = document.createElement("div")).className = "cloudimage-360-fullscreen-icon", 
                        t), this.fullscreenIcon.onclick = this.openFullscreenModal.bind(this), this.iconsContainer.appendChild(this.fullscreenIcon);
                    }
                }, {
                    key: "showFullscreenIcon",
                    value: function() {
                        this.fullscreenIcon && (this.fullscreenIcon.style.display = "block", this.fullscreenIcon.style.pointerEvents = "auto");
                    }
                }, {
                    key: "hideFullscreenIcon",
                    value: function() {
                        this.fullscreenIcon && (this.fullscreenIcon.style.display = "none", this.fullscreenIcon.style.pointerEvents = "none");
                    }
                }, {
                    key: "addMagnifier",
                    value: function() {
                        var t;
                        this.magnifierIcon = ((t = document.createElement("div")).className = "cloudimage-360-magnifier-icon", 
                        t), this.magnifierIcon.onclick = this.magnify.bind(this), this.iconsContainer.appendChild(this.magnifierIcon);
                    }
                }, {
                    key: "enableMagnifierIcon",
                    value: function() {
                        this.magnifierIcon && (this.magnifierIcon.style.display = "block", this.magnifierIcon.style.pointerEvents = "auto");
                    }
                }, {
                    key: "disableMagnifierIcon",
                    value: function() {
                        this.magnifierIcon && (this.magnifierIcon.style.display = "none", this.magnifierIcon.style.pointerEvents = "none");
                    }
                }, {
                    key: "closeFullscreenModal",
                    value: function(t) {
                        t.stopPropagation(), document.body.removeChild(this.container.parentNode), window.document.body.style.overflow = "visible";
                    }
                }, {
                    key: "add360ViewCircleIcon",
                    value: function() {
                        var t, e;
                        this.view360CircleIcon = (t = this.bottomCircleOffset, (e = new Image).src = "https://scaleflex.cloudimg.io/v7/plugins/js-cloudimage-360-view/assets/img/360.svg", 
                        e.style.bottom = "".concat(t, "%"), e.className = "cloudimage-360-view-360-circle", 
                        e), this.innerBox.appendChild(this.view360CircleIcon);
                    }
                }, {
                    key: "show360ViewCircleIcon",
                    value: function() {
                        this.view360CircleIcon && (this.view360CircleIcon.style.opacity = "1");
                    }
                }, {
                    key: "hide360ViewCircleIcon",
                    value: function() {
                        this.view360CircleIcon && (this.view360CircleIcon.style.opacity = "0");
                    }
                }, {
                    key: "remove360ViewCircleIcon",
                    value: function() {
                        this.view360CircleIcon && (this.innerBox.removeChild(this.view360CircleIcon), this.view360CircleIcon = null);
                    }
                }, {
                    key: "removeLoader",
                    value: function() {
                        this.loader && (this.innerBox.removeChild(this.loader), this.loader = null);
                    }
                }, {
                    key: "remove360ViewIcon",
                    value: function() {
                        if (this.view360Icon) try {
                            this.innerBox.removeChild(this.view360Icon), this.view360Icon = null;
                        } catch (t) {}
                    }
                }, {
                    key: "initControls",
                    value: function() {
                        var t = this, e = function(t, e) {
                            var n = t.container, i = t.spinReverse, o = t.stopAtEdges, r = e.onRightStart, a = e.onLeftStart, s = e.onTopStart, c = e.onBottomStart, u = e.onEventEnd, l = {}, d = t.controlReverse ? !i : i, h = n.querySelectorAll(".cloudimage-360-left, .cloudimage-360-prev")[0], f = n.querySelectorAll(".cloudimage-360-right, .cloudimage-360-next")[0], p = n.querySelector(".cloudimage-360-top"), m = n.querySelector(".cloudimage-360-bottom");
                            return h && (h.style.display = "block", h.addEventListener("mousedown", d ? r : a), 
                            h.addEventListener("touchstart", d ? r : a, {
                                passive: !0
                            }), h.addEventListener("mouseup", u), h.addEventListener("touchend", u), l.left = h), 
                            f && (f.style.display = "block", f.addEventListener("mousedown", d ? a : r), f.addEventListener("touchstart", d ? a : r, {
                                passive: !0
                            }), f.addEventListener("mouseup", u), f.addEventListener("touchend", u), l.right = f), 
                            p && (p.style.display = "block", p.addEventListener("mousedown", d ? c : s), p.addEventListener("touchstart", d ? c : s), 
                            p.addEventListener("mouseup", u), p.addEventListener("touchend", u), l.top = p), 
                            m && (m.style.display = "block", m.addEventListener("mousedown", d ? s : c), m.addEventListener("touchstart", d ? s : c), 
                            m.addEventListener("mouseup", u), m.addEventListener("touchend", u), l.bottom = m), 
                            (d ? f : h) && o && (ot(d ? f : h, "not-active"), ot(d ? p : m, "not-active")), 
                            l;
                        }({
                            container: this.container,
                            controlReverse: this.controlReverse,
                            spinReverse: this.spinReverse,
                            stopAtEdges: this.stopAtEdges
                        }, {
                            onLeftStart: function(e) {
                                e.stopPropagation(), t.onSpin(), t.left(), t.loopTimeoutId = window.setInterval(t.left.bind(t), t.autoplaySpeed);
                            },
                            onRightStart: function(e) {
                                e.stopPropagation(), t.onSpin(), t.right(), t.loopTimeoutId = window.setInterval(t.right.bind(t), t.autoplaySpeed);
                            },
                            onTopStart: function(e) {
                                e.stopPropagation(), t.onSpin(), t.top(), t.loopTimeoutId = window.setInterval(t.top.bind(t), t.autoplaySpeed);
                            },
                            onBottomStart: function(e) {
                                e.stopPropagation(), t.onSpin(), t.bottom(), t.loopTimeoutId = window.setInterval(t.bottom.bind(t), t.autoplaySpeed);
                            },
                            onEventEnd: function() {
                                t.onFinishSpin(), window.clearTimeout(t.loopTimeoutId);
                            }
                        });
                        this.topElem = e.top, this.bottomElem = e.bottom, this.leftElem = e.left, this.rightElem = e.right;
                    }
                }, {
                    key: "attachEvents",
                    value: function(t, e, n) {
                        window.addEventListener("resize", this.requestResizedImages.bind(this)), t && !this.disableDrag && (this.container.addEventListener("click", this.mouseClick.bind(this)), 
                        this.container.addEventListener("mousedown", this.mouseDown.bind(this)), this.container.addEventListener("mousemove", this.mouseMove.bind(this)), 
                        this.container.addEventListener("mouseleave", this.mouseLeave.bind(this)), document.addEventListener("mouseup", this.mouseUp.bind(this))), 
                        e && !this.disableDrag && (this.container.addEventListener("touchstart", this.touchStart.bind(this), {
                            passive: !0
                        }), this.container.addEventListener("touchend", this.touchEnd.bind(this)), this.container.addEventListener("touchmove", this.touchMove.bind(this))), 
                        n && (document.addEventListener("keydown", this.keyDown.bind(this)), document.addEventListener("keyup", this.keyUp.bind(this))), 
                        document.addEventListener("keydown", this.keyDownGeneral.bind(this));
                    }
                }, {
                    key: "init",
                    value: function(t) {
                        var e, n, i = this, o = arguments.length > 1 && void 0 !== arguments[1] && arguments[1], r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null, a = d(t), l = a.folder, h = a.apiVersion, f = a.filenameX, m = a.filenameY, v = a.imageListX, g = a.imageListY, y = a.indexZeroBase, b = a.amountX, w = a.amountY, x = a.draggable, I = void 0 === x || x, O = a.swipeable, k = void 0 === O || O, E = a.keys, S = a.keysReverse, C = a.bottomCircle, j = a.bottomCircleOffset, L = a.boxShadow, A = a.autoplay, P = a.autoplayBehavior, D = a.playOnce, Y = a.speed, T = a.autoplayReverse, X = a.disableDrag, M = void 0 === X || X, F = a.fullscreen, z = a.magnifier, N = a.ciToken, V = a.ciFilters, B = a.ciTransformation, _ = a.lazyload, W = a.lazySelector, H = a.spinReverse, U = a.dragSpeed, Z = a.stopAtEdges, G = a.controlReverse, J = a.hide360Logo, $ = a.logoSrc, K = a.pointerZoom, Q = a.ratio, et = a.imageInfo, nt = void 0 === et ? "black" : et, it = a.requestResponsiveImages, ot = {
                            ciToken: N,
                            ciFilters: V,
                            ciTransformation: B
                        };
                        if (this.folder = l, this.apiVersion = h, this.filenameX = f, this.filenameY = m, 
                        this.imageListX = v, this.imageListY = g, this.indexZeroBase = y, this.amountX = v ? JSON.parse(v).length : b, 
                        this.amountY = g ? JSON.parse(g).length : w, this.allowSpinY = !!this.amountY, this.activeImageX = T ? this.amountX : 1, 
                        this.activeImageY = T ? this.amountY : 1, this.spinY = P === s, this.bottomCircle = C, 
                        this.bottomCircleOffset = j, this.boxShadow = L, this.autoplay = A, this.autoplayBehavior = P, 
                        this.playOnce = D, this.speed = Y, this.reversed = T, this.disableDrag = M, this.fullscreen = F, 
                        this.magnifier = !this.isMobile && z > 1 ? Math.min(z, 5) : 0, this.lazySelector = W, 
                        this.spinReverse = H, this.controlReverse = G, this.dragSpeed = Math.max(U, 50), 
                        this.autoplaySpeed = 36 * this.speed / this.amountX, this.stopAtEdges = Z, this.hide360Logo = J, 
                        this.logoSrc = $, this.ciParams = ot, this.apiVersion = h, this.pointerZoom = K > 1 ? Math.min(K, 3) : 0, 
                        this.keysReverse = S, this.info = nt, this.keys = E, this.ratio = Q && JSON.parse(Q), 
                        this.requestResponsiveImages = it, o) return dt(this.innerBox, this.iconsContainer), 
                        dt(this.innerBox, this.boxShadowEl), dt(this.innerBox, this.view360Icon), this.remove360ViewCircleIcon(), 
                        this.iconsContainer = ct(this.innerBox), this.hide360Logo || this.lazyload || !this.logoSrc || (this.add360ViewIcon(), 
                        p(this.view360Icon, this.logoSrc)), this.magnifier && this.addMagnifier(), this.bottomCircle && !this.fullscreenView && this.add360ViewCircleIcon(), 
                        this.fullscreen && !this.fullscreenView && this.addFullscreenIcon(), this.boxShadow && !this.fullscreenView && (this.boxShadowEl = ut(this.boxShadow, this.innerBox)), 
                        r && !this.fullscreenView && (this.hotspotsConfigs = Xe(r), Ye(t, this.hotspotsConfigs)), 
                        this.onAllImagesLoaded();
                        this.innerBox = function(t) {
                            var e = document.createElement("div");
                            return e.className = "cloudimage-360-inner-box", t.appendChild(e), e;
                        }(this.container), this.iconsContainer = ct(this.innerBox), this.canvas = (e = this.innerBox, 
                        (n = document.createElement("canvas")).style.width = "100%", n.style.fontSize = "0", 
                        e.appendChild(n), n), this.loader = lt(this.innerBox), this.hotspotsConfigs && !this.fullscreenView && Ye(t, this.hotspotsConfigs), 
                        function(t) {
                            t.style.position = "relative", t.style.width = "100%", t.style.cursor = "wait", 
                            t.setAttribute("draggable", "false"), t.className = "".concat(t.className, " initialized");
                        }(this.container), this.srcXConfig = {
                            folder: l,
                            filename: f,
                            imageList: v,
                            container: t,
                            innerBox: this.innerBox,
                            apiVersion: h,
                            ciParams: ot,
                            lazySelector: W,
                            amount: this.amountX,
                            indexZeroBase: y,
                            fullscreen: this.fullscreenView
                        }, this.srcYConfig = Ne(Ne({}, this.srcXConfig), {}, {
                            filename: m,
                            orientation: u,
                            imageList: g,
                            amount: this.amountY
                        });
                        var rt = R(this.srcXConfig), at = function(t, e, n) {
                            t === c ? i.imagesX[n] = e : i.imagesY[n] = e;
                            var o = i.amountX + i.amountY, r = i.imagesX.length + i.imagesY.length, a = !n && t !== u, s = Math.round(r / o * 100);
                            i.updatePercentageInLoader(s), a ? i.onFirstImageLoaded(e) : i.autoplay && i.moveRight(n), 
                            i.isReady() && i.onAllImagesLoaded();
                        }, st = function() {
                            if (q(i.srcXConfig, rt, at.bind(i, c)), i.allowSpinY) {
                                var t = R(i.srcYConfig);
                                q(i.srcYConfig, t, at.bind(i, u));
                            }
                        };
                        _ ? tt(rt, this.srcXConfig, (function(t) {
                            i.innerBox.removeChild(t), st();
                        })) : st(), this.attachEvents(I, k, E);
                    }
                } ], i && o(n.prototype, i), Object.defineProperty(n, "prototype", {
                    writable: !1
                }), e;
            }();
            const Be = Ve;
            function _e() {
                var t = [], e = document.querySelectorAll(".cloudimage-360:not(.initialized)");
                [].slice.call(e).forEach((function(e) {
                    var n = function(t) {
                        if (!t.id) {
                            var e = Math.floor(1e4 * Math.random()), n = "cloudimage-360-view-".concat(e);
                            t.id = n;
                        }
                        return t;
                    }(e);
                    h(n, "hotspots") || t.push(new Be(n));
                })), window.CI360._viewers = t;
            }
            function We() {
                var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : null, e = arguments.length > 1 && void 0 !== arguments[1] && arguments[1], n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null;
                if (t) {
                    var i = window.CI360._viewers.filter((function(e) {
                        return e.id === t;
                    }))[0];
                    if (n) {
                        var o = document.querySelectorAll(".cloudimage-360"), r = Array.from(o).find((function(e) {
                            return e.id === t;
                        }));
                        r.setAttribute("data-hotspots", !0);
                    }
                    i.updateView(e, window.CI360._viewers, n);
                } else window.CI360._viewers.forEach((function(t) {
                    t.updateView(e, window.CI360._viewers);
                }));
            }
            function He() {
                return !(window.CI360._viewers && window.CI360._viewers.length > 0);
            }
            window.CI360 = window.CI360 || {}, window.CI360.init = _e, window.CI360.destroy = function() {
                He() || (window.CI360._viewers.forEach((function(t) {
                    t.destroy();
                })), window.CI360._viewers = []);
            }, window.CI360.getActiveIndexByID = function(t, e) {
                if (!He()) {
                    var n = window.CI360._viewers.filter((function(e) {
                        return e.id === t;
                    }))[0];
                    return "y" === e ? n && n.activeImageY - 1 : n && n.activeImageX - 1;
                }
            }, window.CI360.update = We, window.CI360.add = function(t) {
                var e = Array.from(document.querySelectorAll(".cloudimage-360:not(.initialized)"));
                if (e.length && t) {
                    var n = e.filter((function(e) {
                        return e.id === t;
                    }))[0];
                    n && window.CI360._viewers.push(new Be(n));
                }
            }, window.CI360.addHotspots = function(t, e) {
                var n = document.querySelectorAll(".cloudimage-360:not(.initialized)");
                if (Array.from(n).find((function(e) {
                    return e.id === t;
                }))) return container.setAttribute("data-hotspots", !0), window.CI360._viewers.push(new Be(container, !1, e));
                We(t, !1, e);
            }, window.CI360.notInitOnLoad || _e();
        })();
    })();
    document.addEventListener("DOMContentLoaded", (function() {
        if (typeof Fancybox !== "undefined") Fancybox.bind('[data-fancybox="gallery"]', {
            Thumbs: false
        });
    }));
    document.addEventListener("DOMContentLoaded", (function() {
        const closeButton = document.querySelector(".bottom-main__close");
        if (closeButton) closeButton.addEventListener("click", (function() {
            const popup = this.closest(".bottom-main__body");
            if (popup) popup.classList.add("_main-close");
        }));
    }));
    document.addEventListener("DOMContentLoaded", (() => {
        const footer = document.querySelector(".footer");
        const fixedFooter = document.querySelector("._active-fixed-footer");
        if (footer && fixedFooter) {
            const offset = -48;
            window.addEventListener("scroll", (() => {
                const footerRect = footer.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                if (footerRect.top <= windowHeight + offset) {
                    fixedFooter.classList.remove("_active-fixed-footer");
                    fixedFooter.style.position = "relative";
                } else {
                    fixedFooter.classList.add("_active-fixed-footer");
                    fixedFooter.style.position = "fixed";
                }
            }));
        }
    }));
    document.addEventListener("DOMContentLoaded", (function() {
        const mainSlider = document.getElementById("main-slider");
        if (mainSlider) {
            mainSlider.addEventListener("click", updateBodyClass);
            mainSlider.addEventListener("touchend", updateBodyClass);
        }
        function updateBodyClass() {
            const activeIndex = window.CI360.getActiveIndexByID("main-slider", "horizontal");
            if (activeIndex >= 47 && activeIndex <= 95) {
                document.body.classList.add("_active-r1s-main");
                document.body.classList.remove("_active-r1t-main");
            } else {
                document.body.classList.add("_active-r1t-main");
                document.body.classList.remove("_active-r1s-main");
            }
        }
    }));
    document.addEventListener("DOMContentLoaded", (function() {
        const scrollUpBtn = document.getElementById("scroll-up");
        window.addEventListener("scroll", (function() {
            if (window.scrollY > 300) scrollUpBtn.classList.add("show"); else scrollUpBtn.classList.remove("show");
        }));
        scrollUpBtn.addEventListener("click", (function() {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }));
    }));
    document.addEventListener("DOMContentLoaded", (function() {
        const cursor = document.getElementById("customCursor");
        const cloudImageBox = document.querySelector(".cloudimage-360-inner-box");
        if (cloudImageBox) {
            document.addEventListener("mousemove", (function(e) {
                const windowWidth = window.innerWidth;
                const cursorWidth = cursor.offsetWidth;
                let x = e.pageX;
                let y = e.pageY;
                if (x + cursorWidth > windowWidth) x = windowWidth - cursorWidth;
                if (x < 0) x = 0;
                if (y < 0) y = 0;
                cursor.style.left = x + "px";
                cursor.style.top = y + "px";
            }));
            cloudImageBox.addEventListener("mouseenter", (function() {
                cursor.style.display = "flex";
                cursor.style.opacity = "1";
            }));
            cloudImageBox.addEventListener("mouseleave", (function() {
                cursor.style.opacity = "0";
            }));
            document.addEventListener("mousemove", (function(e) {
                if (!cloudImageBox.contains(e.target)) cursor.style.opacity = "0";
            }));
        }
    }));
    function loadYouTubeAPI(callback) {
        var tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        window.onYouTubeIframeAPIReady = callback;
    }
    function initializeYouTubePlayer() {
        var player;
        function onPlayerReady(event) {
            const observer = new IntersectionObserver((entries => {
                entries.forEach((entry => {
                    if (entry.isIntersecting) {
                        player.playVideo();
                        observer.unobserve(document.getElementById("ytplayer"));
                    }
                }));
            }), {
                threshold: 1
            });
            observer.observe(document.getElementById("ytplayer"));
            document.getElementById("hideButton").addEventListener("click", (function() {
                if (player.isMuted()) player.unMute();
                player.playVideo();
                this.style.display = "none";
            }));
        }
        function onPlayerStateChange(event) {
            if (event.data === YT.PlayerState.PLAYING) document.getElementById("hideButton").style.display = "none";
        }
        player = new YT.Player("ytplayer", {
            height: "360",
            width: "640",
            videoId: "Rte9dMhJHE4",
            playerVars: {
                autoplay: 0,
                mute: 1,
                hl: "en",
                controls: 1,
                rel: 0,
                showinfo: 0,
                modestbranding: 1,
                enablejsapi: 1
            },
            events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange
            }
        });
    }
    loadYouTubeAPI(initializeYouTubePlayer);
    window.onload = function() {
        function checkElements(selector, buttonId) {
            const box = document.querySelectorAll(selector);
            const btn = document.getElementById(buttonId);
            return box.length > 0 && btn !== null;
        }
        function mainLogic(selector, buttonId) {
            const box = document.querySelectorAll(selector);
            const btn = document.getElementById(buttonId);
            for (let i = 4; i < box.length; i++) box[i].style.display = "none";
            let countD = 4;
            btn.addEventListener("click", (function() {
                const box = document.querySelectorAll(selector);
                if (countD < box.length) {
                    for (let i = countD; i < countD + 4 && i < box.length; i++) box[i].style.display = "block";
                    countD += 4;
                    if (countD >= box.length) btn.style.display = "none";
                } else btn.style.display = "none";
            }));
        }
        if (checkElements(".card-product__block_01", "product-button-01")) mainLogic(".card-product__block_01", "product-button-01");
        if (checkElements(".card-product__block_02", "product-button-02")) mainLogic(".card-product__block_02", "product-button-02");
        if (checkElements(".card-product__block_03", "product-button-03")) mainLogic(".card-product__block_03", "product-button-03");
    };
    window["FLS"] = true;
    isWebp();
    formFieldsInit({
        viewPass: false
    });
    pageNavigation();
})();