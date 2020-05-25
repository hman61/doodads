! function (t) {
    var e = {};

    function i(r) {
        if (e[r]) return e[r].exports;
        var s = e[r] = {
            i: r,
            l: !1,
            exports: {}
        };
        return t[r].call(s.exports, s, s.exports, i), s.l = !0, s.exports
    }
    i.m = t, i.c = e, i.d = function (t, e, r) {
        i.o(t, e) || Object.defineProperty(t, e, {
            enumerable: !0,
            get: r
        })
    }, i.r = function (t) {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, {
            value: "Module"
        }), Object.defineProperty(t, "__esModule", {
            value: !0
        })
    }, i.t = function (t, e) {
        if (1 & e && (t = i(t)), 8 & e) return t;
        if (4 & e && "object" == typeof t && t && t.__esModule) return t;
        var r = Object.create(null);
        if (i.r(r), Object.defineProperty(r, "default", {
                enumerable: !0,
                value: t
            }), 2 & e && "string" != typeof t)
            for (var s in t) i.d(r, s, function (e) {
                return t[e]
            }.bind(null, s));
        return r
    }, i.n = function (t) {
        var e = t && t.__esModule ? function () {
            return t.default
        } : function () {
            return t
        };
        return i.d(e, "a", e), e
    }, i.o = function (t, e) {
        return Object.prototype.hasOwnProperty.call(t, e)
    }, i.p = "", i(i.s = 0)
}([function (t, e, r) {
    "use strict";
    r.r(e), r.d(e, "default", (function () {
        return a
    }));
    var s = {
        instance: {},
        counter: {},
        getNextID: t => (void 0 === s.counter[t] && (s.counter[t] = -1), t + "_" + ++s.counter[t])
    };
    class a extends HTMLElement {
        static get version() {
            return "v0.9.16"
        }
        constructor(t = 100) {
            super(), a.debug = location.href.includes("#debug") || !1, this.debug = a.debug, this.initialTime = (new Date).getTime(), this.PAGE_SIZE = t, !this.template && this.getAttribute("template") && (this.template = this.template || this.getAttribute("template")), this.filteredData = {}, this.visibleColumns = [], this.place = [], this.scrollPos = 0, this.debug && console.log(a.$Config.NAME + " " + a.version)
        }
        getParent() {
            let t = this.shadow.host;
            for (; t.parentNode;) {
                if (t.parentNode.host) return t.parentNode.host;
                t = t.parentNode
            }
            return null
        }
        static get $Config() {
            return {
                TEMPLATE_EXT: ".html",
                COMPONENT_DIR: "/components",
                NAME: "Doo.ui",
                TYPE: {
                    DEFAULT: 0,
                    ENUM: 1,
                    DEEP: 2,
                    COMPUTED: 3
                },
                MATCH: {
                    ANY: -1,
                    STARTS_WITH: 0,
                    EXACT: 1
                },
                DELIMITER: {
                    BEG: "{{",
                    END: "}}"
                },
                DOCUMENT: "document",
                SHADOW: "shadow",
                FLEX_BODY: ".fbody"
            }
        }
        static get $Computed() {
            return {
                doo123: t => t.instance.insertDoo123(t.name, t.props),
                currentItem: t => t.item.address,
                $0: t => t.item[t.props[0]],
                $1: t => t.item[t.props[1]],
                $2: t => t.item[t.props[2]],
                greyShade: t => ["light-grey", "grey", "dark-grey", "black"][t.i % 4],
                fraction: t => ["", "whole", "half", "third", "quarter", "fifth"][t.arr.length],
                toUpperCase: t => t.getValue().toUpperCase(),
                toLowerCase: t => t.getValue().toLowerCase(),
                substring: t => t.getValue().substring(t.$1, t.$2),
                length: t => t.arr.length,
                found: t => t.instance.getCurrentData(t.$1).length,
                count: t => t.instance.data[t.$1].length,
                recCountByDataSetKey: t => t.klass[t.dataSetKey].length,
                i: t => t.i,
                row: t => t.i + 1,
                $id: t => "_$" + t.i,
                n: t => t.i + 1,
                ts: () => (new Date).getTime(),
                pluralize: t => t.arr.length > 1 ? "s" : "",
                nbsp: () => "&nbsp;",
                zeroOne: t => t.i % 2,
                lorem: t => {
                    let e = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
                    if (!isNaN(t.$1)) {
                        let i = Math.min(t.$1, 6);
                        for (let t = 1; t < i; t++) e += " Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                    }
                    return e
                }
            }
        }
        highlight(t) {
            let e = this.filterKey && this.filterKey.toLowerCase();
            if (!e || !t) return t;
            let i = new RegExp(e, "ig");
            return t.toString().replace(/&amp\;/gi, "&").replace(i, t => `<b class="doo-find">${t}</b>`)
        }
        static get observedAttributes() {
            return ["doo-refresh", "key", "doo-foreach", "orientation", "doo-dao", "doo-db-update", "doo-db", "page-size", "debug"]
        }
        static xAttr() {
            return ["src", "selected", "checked", "disabled", "readonly"]
        }
        static dynamic(t, e, i) {
            return a.$Config.DELIMITER.BEG + t[i] + a.$Config.DELIMITER.END
        }
        async attributeChangedCallback(t, e, i) {
            i.length > 0 && e !== i && ("doo-db-update" === t || "doo-refresh" === t ? await this.render() : "page-size" === t ? this.PAGE_SIZE = i : "debug" === t && (a.debug = !0))
        }
        static async insertComponent(t, e, i = ".") {
            let r = (t = t.trim()).toLowerCase(),
                s = document.createElement("div");
            s.innerHTML = `<doo-${t} template="${i}/templates/${r}${a.$Config.TEMPLATE_EXT}?${a.$Computed.ts()}"></doo-${t}>`, document.querySelector("" + e).innerHTML = s.innerHTML
        }
        async connectedCallback() {
            let t = this.getAttribute("context") || a.$Config.SHADOW;
            if (this.shadow = t === a.$Config.SHADOW ? this.attachShadow({
                    mode: "open"
                }) : document, this.id || this.getParent() || (this.id = s.getNextID(this.constructor.name)), s.instance[this.id] || (s.instance[this.id] = this), "function" == typeof this.init && await this.init(), this.debug) {
                let t = this.constructor.name.toLowerCase();
                console.log(`Custom tag added: <doo-${t} />`)
            }
            let e, i = document.querySelectorAll("doo-datastore");
            for (let t = 0, r = i.length; t < r; t++) {
                e = i[t].querySelectorAll("DATA");
                for (let t = 0, i = e.length; t < i; t++) {
                    let i = await this.getDataObj(e[t].getAttribute("data-fetch")),
                        r = e[t].getAttribute("data-name");
                    a.DAO.setData(r, i, this.constructor.name)
                }
                i[t].innerHTML = ""
            }
            await this.render(), this.scrollTarget && (this.scrollElem = this.shadow.firstElementChild.querySelector(this.scrollTarget)), this.ready = !0
        }
        static define(t) {
            customElements.define("doo-" + t.name.toLowerCase(), t)
        }
        getFilteredData(t) {
            return this.filteredData[t]
        }
        async setTemplate(t, e) {
            let i = 0 === t.indexOf("<template") ? t : "";
            return i = this.firstElementChild && this.firstElementChild.getElementsByTagName("template").length > 0 ? this.firstElementChild.getElementsByTagName("template")[0].outerHTML : await this.getTemplateURI(t, e), i
        }
        async getTemplateURI(t) {
            let e;
            return e = 0 === t.indexOf("#") ? await document.querySelector(t).outerHTML : await a.fetchURL(t), e
        }
        dooParse(t) {
            let e = t.cloneNode(!0);
            e.removeAttribute("for-each"), e.removeAttribute("dynamic");
            let i = e.outerHTML.replace(/\t/g, "").replace(/\n/g, ""),
                r = i;
            a.xAttr().forEach(t => {
                i = i.replace(new RegExp(" " + t + '="{{(.+)}}"', "g"), " doo-" + t + '="{{$1}}"')
            });
            let s = r === i;
            void 0 === window[this.constructor.name] && (window[this.constructor.name] = []);
            let l = window[this.constructor.name].length;
            i = i.split('="self.').join('="' + this.constructor.name + "[" + l + "].");
            let n, o = i.split(a.$Config.DELIMITER.END),
                h = [],
                d = o.length;
            for (let t = 0; t < d; t++) n = o[t].split(a.$Config.DELIMITER.BEG), h.push(n[0]), h.push(this.getPropertyType(n[1]));
            return {
                templateArray: h,
                xHtml: s
            }
        }
        getPropertyType(t) {
            if (void 0 === t) return new a.FieldType("", void 0, this.constructor, this);
            t = t.trim();
            let e = a.$Config.TYPE.DEFAULT;
            t.indexOf("(") > -1 ? e = a.$Config.TYPE.COMPUTED : t.indexOf(".") > 0 ? e = a.$Config.TYPE.DEEP : isNaN(t) || (e = a.$Config.TYPE.ENUM);
            let i = new a.FieldType(t, e, this.constructor, this);
            return this.visibleColumns.push(t), i.parentElem = this.parentElement, i
        }
        setItemValue(t, e, i) {
            let r = e.split(".");
            for (var s = 0; s < r.length - 1; s++) t = t[r[s]] = {};
            t[r[r.length - 1]] = i
        }
        getItemValue(t, e) {
            if ("function" == typeof e) return this.highlight(this[e](t));
            let i = t;
            try {
                e.split(".").forEach(t => i = i[t])
            } catch (t) {
                console.log("Property not found", e, JSON.stringify(i))
            }
            return this.highlight(i)
        }
        renderNode(t, e, i, r = 0, s = this.PAGE_SIZE) {
            let l = (i = Array.isArray(i) ? i : [i]).length,
                n = r + s;
            n > l && (n = l);
            let o = [];
            for (let e = r; e < n; e++)
                for (let r = 0, s = t.length; r < s; r += 2) {
                    o.push(t[r]);
                    let s = t[r + 1];
                    switch (s.type) {
                        case a.$Config.TYPE.DEFAULT:
                        case a.$Config.TYPE.DEEP:
                            o.push(this.getItemValue(i[e], s.fld));
                            break;
                        case a.$Config.TYPE.ENUM:
                            this.filterKey ? o.push(i[e]) : o.push(this.highlight(i[e]));
                            break;
                        case a.$Config.TYPE.COMPUTED:
                            let t = new a.DataItem(i[e], e, i);
                            t.fld = s.fld, t.func = s.func, t.$1 = s.$1, t.$2 = s.$2, t.$3 = s.$3, t.instance = s.instance, o.push(s.func(t));
                            break;
                        case void 0:
                            o.push("")
                    }
                }
            if (e) return o.join(""); {
                let t = o.join("");
                return a.xAttr().forEach(e => {
                    "checked" !== e && "disabled" !== e || (t = t.replace(new RegExp(" doo-" + e + '="false"', "g"), " ").replace(new RegExp(" doo-" + e + '="0"', "g"), " ")), t = t.replace(new RegExp(" doo-" + e + "=", "g"), " " + e + "=").replace(new RegExp(" " + e + '=""', "g"), " ")
                }), t
            }
        }
        getLevel(t) {
            let e = 0;
            t.getAttribute("dynamic");
            for (; t.parentElement;) t = t.parentElement, e++;
            return e
        }
        clearDataFilter(t) {
            this.filteredData[t] = void 0
        }
        setDataFilter(t, e) {
            let i = this.filterKey && this.filterKey.toLowerCase(),
                r = this.data[t].slice(),
                s = this;
            e ? r = r.filter(e) : i && (i = String(i), r = r.filter(t => s.visibleColumns.some(e => String(s.getItemValue(t, e)).toLowerCase().indexOf(i) > -1))), this.filteredData[t] = r.slice(0, this.page_size)
        }
        async getDataObj(t, e) {
            let i, s;
            if (0 === (t = t.trim()).indexOf("http") || t.indexOf(".json") > 0) return i = await a.fetchURL(t), JSON.parse(i);
            if (t.indexOf(".js") > 0) return i = await r(1)("" + t), i.default;
            if (0 === t.indexOf("..") || "this.parent.data" === t) {
                return this.getParent().data
            }
            if (t.indexOf("..") > 0) {
                let e = t.replace("[", "").replace("]", "").split(".."),
                    i = [],
                    r = isNaN(e[0]),
                    s = parseInt(r ? e[0].charCodeAt(0) : e[0]),
                    a = parseInt(r ? e[1].charCodeAt(0) : e[1]);
                for (let t = s; t <= a; t++) i.push(r ? String.fromCharCode(t) : t);
                return i.splice(0)
            }
            if (0 === t.indexOf("[")) {
                let e = t.replace("[", "").replace("]", "").split(",");
                return e.forEach(t => t.trim()), e
            }
            return t.indexOf("window.") > -1 ? (s = t.split(".")[1].trim(), window[s]) : t.indexOf("const.") > -1 ? (s = t.split(".")[1].trim(), s) : 0 === t.indexOf("this.") ? (s = t.split(".")[1], this[s]) : (console.log("WARNING" + t + " datasource not scooped properly"), t)
        }
        async initDataNodes(t) {
            let e, i, r = t.content.querySelectorAll("[data-src]"),
                s = r.length,
                l = 0,
                n = [];
            for (l = 0; l < s; l++) {
                let t = r[l].getAttribute("for-each").trim(),
                    e = r[l].getAttribute("data-src").trim();
                e && (i = "Doo.DAO" === e ? a.DAO.getData(t) : await this.getDataObj(e, r[l]), this.data[t] = Array.isArray(i) ? i : i[t]), 0 === e.indexOf("this.parent") && (r[l].useParent = !0), r[l].removeAttribute("data-src"), r[l].level = this.getLevel(r[l]), n.push(r[l])
            }
            for (n.sort((t, e) => t.level === e.level ? 0 : t.level > e.level ? 1 : -1).reverse(), l = 0; l < s; l++) {
                let t = n[l].getAttribute("dynamic");
                e = "|STYLE|LINK|".indexOf(`|${n[l].tagName}|`) > -1 ? n[l] : "xdummy" === r[l].getAttribute("for-each") || n[l].parentElement && "|UL|TBODY|THEAD|TFOOT|TR|SELECT|".indexOf(`|${n[l].parentElement.tagName}|`) > -1 ? n[l].parentElement : document.createElement("data"), e.dataKey = n[l].getAttribute("for-each");
                let i = this.dooParse(n[l]);
                e.templateArray = i.templateArray, e.xHtml = i.xHtml, e.name = l, e.level = this.getLevel(n[l]), e.useParent = n[l].useParent, e.noRepeat = n[l].hasAttribute("data-norepeat"), t && (e.isDynamic = !0), "DATA" !== e.tagName && "STYLE" !== e.tagName && "LINK" !== e.tagName || (n[l].parentElement ? n[l].parentElement.replaceChild(e, n[l]) : (console.log("Warning: Templates should only have one childnode"), n[l].appendChild(e))), this.place.push(e)
            }
            return this.place
        }
        async prepareTemplate(t = null) {
            this.debug && console.log("Template:", this.template);
            let e = await this.setTemplate(this.template),
                i = document.createElement("div");
            i.innerHTML = e, i.querySelector("template") && (i.innerHTML = i.querySelector("template") ? e : `<template><center><pre>The template you are trying to import does not have a &lt;template&gt tag</pre><div style="color:red">${argTpl}</div></enter></template>`);
            let r = i.querySelector("template").cloneNode(!0);
            r.removeAttribute("id"), this.templateNode = document.createElement("template");
            let s = this.getAttribute("data-dispatch") || "undefined";
            if (this.templateNode.innerHTML = r.innerHTML.replace(/\${dataDispatch\}/g, s), !this.shadow && this.getAttribute("css")) {
                let t = this.getAttribute("css").split(","),
                    e = t.length;
                for (let i = 0; i < e; i++) {
                    let e = document.createElement("link");
                    e.href = t[i], e.rel = "stylesheet", this.templateNode.content.firstElementChild.parentNode.insertBefore(e, this.templateNode.content.firstElementChild)
                }
            }
            this.templateElem = this.templateNode.content;
            let a = this.templateElem.querySelectorAll("style");
            a && a.length > 0 && this.templateElem.appendChild(a[0]), 0 === this.place.length && (await this.initDataNodes(this.templateNode), this.getAttribute("style") && this.templateNode.setAttribute("style", this.getAttribute("style")))
        }
        async setContext() {
            window[this.constructor.name] || (window[this.constructor.name] = []), window[this.constructor.name].push(this), this.childNodes.length > 0 && this.getElementsByTagName("template") && this.getElementsByTagName("template").length > 0 && this.removeChild(this.getElementsByTagName("template").item(0));
            let t = this.getAttribute("context") || a.$Config.SHADOW;
            if (t === a.$Config.SHADOW) this.shadow.host.style.visibility = "hidden", this.shadow.appendChild(this.templateElem), this.componentContainer = this.shadow.host;
            else if (t === a.$Config.DOCUMENT) {
                this.style.visibility = "hidden";
                let t = this.parentElement.replaceChild(this.templateElem, this);
                this.componentContainer = t
            }
            let e = navigator.userAgent.toUpperCase().includes("FIREFOX") ? 20 : 10;
            if (this.scrollTarget) {
                this.setAttribute("doo-id", this.id);
                let t = 0,
                    i = setInterval(() => {
                        t++, (t > 50 || this.scrollElem && "flex" === this.getStyle(this.scrollElem.firstElementChild.firstElementChild, "display")) && (clearInterval(i), this.setScrollHeight(), this.componentContainer.style.visibility = "visible")
                    }, e)
            } else this.componentContainer.style.visibility = "visible";
            this.ready = !0
        }
        async setScrollHeight() {
            this.scrollTarget && (this.scrollElem = this.shadow.firstElementChild.querySelector(this.scrollTarget), this.data[this.defaultDataSet].length > this.PAGE_SIZE && this.addScrollWatcher())
        }
        getCurrentData(t) {
            return this.getFilteredData(t) ? this.getFilteredData(t) : this.data[t]
        }
        async render(t = null, e = 0, i = null) {
            if (!this.template) return void console.log(this.name + " has no template defined");
            this.templateNode || this.ready || await this.prepareTemplate(t);
            let r = this.debug ? (new Date).getTime() : null;
            for (let r = 0, s = this.place.length; r < s; r++) {
                if (t && t !== this.place[r].dataKey) continue;
                if (0 === e && "STYLE" !== this.place[r].tagName) {
                    let t = "dummy" === this.place[r].getAttribute("for-each") ? -1 : 0;
                    this.place[r].setAttribute("page", t)
                }
                if (this.place[r].isDynamic) continue;
                let s = this.getCurrentData(this.place[r].dataKey);
                this.getFilteredData(this.place[r].dataKey) ? this.getFilteredData(this.place[r].dataKey) : this.data[this.place[r].dataKey];
                let a = this.place[r].noRepeat ? 1 : this.PAGE_SIZE;
                if (null === i)
                    if (e > 0 && t === this.defaultDataSet) {
                        let t = this.scrollElem.querySelector('data[page="' + e + '"]');
                        if (t) 0 === t.innerHTML.length && (t.innerHTML = this.renderNode(this.place[r].templateArray, this.place[r].templateArray.xHtml, s, e * this.PAGE_SIZE, a)), this.lastInsertedElem = t;
                        else {
                            let t = document.createElement("data");
                            t.setAttribute("page", e), t.innerHTML = this.renderNode(this.place[r].templateArray, this.place[r].templateArray.xHtml, s, e * this.PAGE_SIZE, a), !this.lastInsertedElem || e > this.lastPage ? this.place[r].parentElement.appendChild(t) : this.lastInsertedElem.insertAdjacentElement("beforebegin", t), this.lastInsertedElem = t
                        }
                        this.lastInsertedElem.style.top = e * this.blockHeight + "px", this.lastInsertedElem.style.position = "absolute"
                    } else this.place[r].useParent ? this.place[r].innerHTML = this.renderNode(this.place[r].templateArray, this.place[r].templateArray.xHtml, s, parseInt(this.getAttribute("key")), 1) : this.place[r].innerHTML = this.renderNode(this.place[r].templateArray, this.place[r].templateArray.xHtml, s, e * this.PAGE_SIZE, a);
                else this.place[r].append(this.renderNode(this.place[r].templateArray, this.place[r].templateArray.xHtml, s, i, 1));
                t === this.defaultDataSet && (this.lastPage = e)
            }
            if (this.ready || this.setContext(), this.debug && !this.getAttribute("title") && this.setAttribute("title", this.id + ":init() " + ((new Date).getTime() - this.initialTime) + "ms"), this.debug) {
                let t = (new Date).getTime() - r + "ms";
                this.setAttribute("doo-render-time", t), this.setAttribute("title", this.getAttribute("title") + "|" + t)
            }
            return e
        }
        static async fetchURL(t) {
            return new Promise((e, i) => {
                const r = new XMLHttpRequest;
                r.open("GET", t), r.onload = () => e(r.responseText), r.onerror = () => i(r.statusText), r.send()
            })
        }
        setHttpRequest(t, e) {
            let i = this,
                r = new XMLHttpRequest;
            r.onload = function () {
                e(this.responseText, i)
            }, r.open("GET", t, !0), r.send()
        }
        hasScroll(t) {
            return "auto" === this.getStyle(t, "overflow-y") || "scroll" === this.getStyle(t, "overflow-y")
        }
        getStyle(t, e, i = null) {
            return t.currentStyle ? t.currentStyle[e] : window.getComputedStyle(t, i).getPropertyValue(e)
        }
        async sortBy(t, e) {
            this.lastPage = null;
            let i, r = t.getAttribute("sort-dir") || 1;
            if (a.util.sortBy(this.getCurrentData(this.defaultDataSet), e, r), [...t.parentElement.querySelectorAll(".doo-sort")].forEach(t => {
                    t.classList.remove("dir_1", "dir_-1")
                }), t.classList.add(-1 * parseInt(r) == 1 ? "dir_-1" : "dir_1"), t.setAttribute("sort-dir", -1 * r), this.scrollElem && (i = this.scrollElem.querySelectorAll("[page]"), i && (i[0].innerHTML = "")), this.lastInsertedElem = null, this.rendering = !0, await this.render(this.defaultDataSet, 0), this.rendering = !1, this.container && (this.container.scrollTop = 0), i && i.length > 0)
                for (let t = i.length - 1; t > 0; t--) i[t].remove()
        }
        clearChildren(t) {
            let e = this.scrollElem.querySelectorAll("[page]");
            for (let i = e.length - 1; i > 0; i--) t && t.find(t => t === parseInt(e[i].getAttribute("page"))) || e[i].remove()
        }
        async setScrollContainerHeight() {
            this.scrollElem.style.height = this.rowHeight * (this.data[this.defaultDataSet].length - 1) + "px"
        }
        async windowWatcher() {
            document.body.setAttribute("doo-height", window.offsetHeight)
        }
        async addScrollWatcher() {
            if (this.scrollTarget && (this.scrollElem = this.shadow.firstElementChild.querySelector(this.scrollTarget), this.scrollElem && this.data[this.defaultDataSet].length > this.PAGE_SIZE)) {
                this.scrollElem.style.position = "relative", this.container = this.scrollElem.parentElement, this.rowHeight = this.scrollElem.offsetHeight / this.PAGE_SIZE, this.setScrollContainerHeight(), this.blockHeight = this.PAGE_SIZE * this.rowHeight;
                let t = !1;
                for (; this.blockHeight < this.container.offsetHeight;) this.PAGE_SIZE = 2 * this.PAGE_SIZE, this.blockHeight = this.PAGE_SIZE * this.rowHeight, t = !0;
                t && await this.render(this.defaultDataSet, this.lastPage || 0), this.lastScrollPos = 0, this.container.addEventListener("scroll", this.scrollWatcher.bind(this))
            }
        }
        async scrollWatcher() {
            if (!this.rendering) {
                this.rendering = !0;
                let t = parseInt(this.container.scrollTop / this.blockHeight),
                    e = parseInt((t * this.blockHeight + this.blockHeight) / this.blockHeight),
                    i = this.container.scrollTop > this.lastScrollPos ? 1 : 0,
                    r = this.scrollElem.querySelector('data[page="' + t + '"]'),
                    s = this.scrollElem.querySelector('data[page="' + e + '"]');
                !r || e > t ? (s || this.render(this.defaultDataSet, e), this.currentPage = this.render(this.defaultDataSet, t)) : t != this.currentPage && (this.currentPage = this.render(this.defaultDataSet, t));
                let a = 1 === i ? [t - 1, t, e] : [t, t + 1];
                this.clearChildren(a), this.lastScrollPos = this.container.scrollTop, this.rendering = !1
            }
        }
    }
    a.DAO = {
        dataSet: {},
        setData: function (t, e, i = null) {
            if (this.dataSet[t] = e, a.debug && i) {
                if (!localStorage.getItem("Doo")) {
                    let t = {};
                    localStorage.setItem("Doo", JSON.stringify(t))
                }
                const e = JSON.parse(localStorage.getItem("Doo"));
                e[i + "_" + t] = this.dataSet[t], localStorage.setItem("Doo", JSON.stringify(e))
            }
        },
        getData: function (t) {
            return this.dataSet[t] || (this.dataSet[t] = []), this.dataSet[t]
        },
        prepend: function (t, e) {
            this.append(t, e, !0)
        },
        append: async function (t, e, i = null) {
            0 === this.getData(t).length ? this.dataSet[t] = e : Array.isArray(e) ? this.dataSet[t] = i ? e.concat(a.DAO.getData(t)) : a.DAO.getData(t).concat(e) : this.dataSet[t] = i ? a.DAO.getData(t).splice(0, 0, e) : a.DAO.getData(t).push(e), this.refresh(t)
        },
        update: function (t, e, i) {
            this.data(t).splice(i, 1, e)
        },
        refresh: function (t, e = document) {
            const i = e.querySelectorAll("[data-dispatch='" + t + "']"),
                r = i.length;
            for (let t = 0; t < r; t++) i.item(t).render()
        },
        csvToJson: function (t) {
            let e = t.split("\n"),
                i = [];
            if (void 0 !== e) {
                let t = e.length,
                    r = e[0].replace(/\r/g, "").split(","),
                    s = r.length;
                if (e.length > 1) {
                    let a = new RegExp('(,)(?=(?:[^"]|"[^"]*")*$)', "g");
                    for (let l = 1; l < t - 1; l++) {
                        let t = {},
                            n = (e[l].replace(a, "|^|") + "|^|").split("|^|");
                        for (let e = 0; e < s; e++) t[r[e]] = n[e] ? n[e].replace(/"/g, "").trim() : "";
                        i.push(t)
                    }
                }
            }
            return i
        }
    }, a.util = {
        sortBy: (t, e, i) => {
            if (t.length < 1) return;
            const r = {
                getValue: (t, e) => {
                    for (var i = e.split("."), r = t, s = 0; s < i.length; s++) r = r[i[s]];
                    return r
                },
                getDataType: function (t, e) {
                    if ("object" == typeof t) return "byFunc";
                    var i = r.getValue(e[0], t);
                    if (i && i.toString().indexOf("/") > 0 && new Date(i) && !isNaN(new Date(i).getTime())) return "byDate";
                    for (var s = 0; s < e.length; s++)
                        if (isNaN(r.getValue(e[s], t))) return "byString";
                    return "byNumber"
                },
                byFunc: function (t, e, s, a) {
                    var l = s[a].cmd,
                        n = l.call(this, -1 === s[a].dir ? e : t, s[a].param, i),
                        o = l.call(this, -1 === s[a].dir ? t : e, s[a].param, i);
                    return n < o ? -1 : n > o ? 1 : void 0 !== s[a + 1] ? r[s[a + 1].type](t, e, s, a + 1) : t.$_id - e.$_id
                },
                byDate: function (t, e, i, s) {
                    var l = i[s].fld.replace(a.$Config.DELIMITER.BEG, "").replace(a.$Config.DELIMITER.END, ""),
                        n = r.getValue(-1 === i[s].dir ? e : t, l),
                        o = r.getValue(-1 === i[s].dir ? t : e, l);
                    return n.getTime || o.getTime || (n = new Date(n), o = new Date(o)), (n = n.getTime()) < (o = o.getTime()) ? -1 : n > o ? 1 : void 0 !== i[s + 1] ? r[i[s + 1].type](t, e, i, s + 1) : t.$_id - e.$_id
                },
                byString: function (t, e, i, s) {
                    var l = i[s].fld.replace(a.$Config.DELIMITER.BEG, "").replace(a.$Config.DELIMITER.END, ""),
                        n = r.getValue(-1 === i[s].dir ? e : t, l).toUpperCase(),
                        o = r.getValue(-1 === i[s].dir ? t : e, l).toUpperCase();
                    return n < o ? -1 : n > o ? 1 : void 0 !== i[s + 1] ? r[i[s + 1].type](t, e, i, s + 1) : t.$_id - e.$_id
                },
                byNumber: function (t, e, i, s) {
                    var l = i[s].fld.replace(a.$Config.DELIMITER.BEG, "").replace(a.$Config.DELIMITER.END, ""),
                        n = Number(r.getValue(-1 === i[s].dir ? e : t, l)),
                        o = Number(r.getValue(-1 === i[s].dir ? t : e, l));
                    return n < o ? -1 : n > o ? 1 : void 0 !== i[s + 1] ? r[i[s + 1].type](t, e, i, s + 1) : t.$_id - e.$_id
                }
            };
            var s = [];
            if ("string" == typeof e && (e = [e = e.replace("{{", "").replace("}}", ""), i || 1]), e)
                for (var l = 0; l < e.length; l += 2) s.push({
                    fld: e[l],
                    dir: Number(e[l + 1] || 1),
                    type: r.getDataType(e[l], t)
                });
            if (t.length > 0 && void 0 === typeof t[0].$_id) {
                Timer.start("makeids");
                for (let e = 0, i = t.length; e < i; e++) t[e].$_id = Number(e);
                Timer.stop("makeids", !0)
            }
            t.sort((function (t, e) {
                return r[s[0].type](t, e, s, 0)
            }))
        },
        curTop: (t, e) => {
            let i = 0;
            if (t.offsetParent)
                for (; t && (i += t.offsetTop, !e || "absolute" !== (void 0).getStyle(t, "position"));) t = t.offsetParent;
            else t.y && (i += t.y);
            return i
        }
    }, a.FieldType = class {
        constructor(t, e, i, r) {
            this._fld = t, this.type = e, this.klass = i, this.instance = r, this._func = void 0, this._parentElem = void 0, this.$1 = void 0, this.$2 = void 0, this.$3 = void 0, this.type === a.$Config.TYPE.COMPUTED && this.createComputed()
        }
        set fld(t) {
            this._fld = t
        }
        set parentElem(t) {
            this._parentElem = t
        }
        set func(t) {
            this._func = t
        }
        get fld() {
            return this._fld
        }
        get func() {
            return this._func
        }
        createComputed() {
            let t = this.fld.split("("),
                e = t[0].split(".").reverse(),
                i = e[0];
            Reflect.ownKeys(this.klass).filter(t => t === i).length > 0 ? (this.func = this.klass[i], a.$Computed[i] && console.log("WARNING:", "Overwriting a Doo base Doo.$Computed method is not recommended")) : a.$Computed[i] && (this.func = a.$Computed[i]), this.fld = e.length > 1 ? e[1] : void 0, "function" != typeof this.func && (console.log("static " + func + "() is not a defined on the Doo base class nor as a static member function"), type = void 0);
            let r = t[1].replace(")", "");
            if (r && r.length > 0) {
                r = r.split(",");
                for (let t = 0, e = r.length; t < e; t++) this["$" + (t + 1)] = r[t].replace(/\'/g, "").replace(/"/g, "")
            }
        }
    }, a.DataItem = class {
        constructor(t, e, i) {
            this.item = t, this.i = e, this.arr = i, this._dataSetKey = "", this._fld = "", this._args = [], this._searchable = !0
        }
        set dataSetKey(t) {
            this._dataSetKey = t
        }
        set fld(t) {
            this._fld = t
        }
        set args(t) {
            this._args = t
        }
        set filterKey(t) {
            this._filterKey = t
        }
        set searchAble(t) {
            this._searchAble = new Boolean(t)
        }
        get fld() {
            return this._fld
        }
        get length() {
            return this.arr.length
        }
        get filterKey() {
            return this._filterKey
        }
        isSearchable() {
            return this.searchable
        }
        getValue() {
            return this.item[this.fld]
        }
        toString() {
            return JSON.stringify(this.item)
        }
    }, a.define(class extends a {
        constructor() {
            super(), this.data = {}
        }
        async connectedCallback() {
            this.data[this.getAttribute("data-name")] = await this.getDataObj(this.getAttribute("data-fetch")), this.template = this.getAttribute("template"), super.connectedCallback()
        }
    }), a.EMPTY_ROW = function () {
        return new a.DataItem(item[0], i, [""])
    }, window.Doo || (window.Doo = a)
}, function (t, e, i) {
    var r = {
        "./doo.ui": 0,
        "./doo.ui.js": 0
    };

    function s(t) {
        return Promise.resolve().then((function () {
            if (!i.o(r, t)) {
                var e = new Error("Cannot find module '" + t + "'");
                throw e.code = "MODULE_NOT_FOUND", e
            }
            return i(r[t])
        }))
    }
    s.keys = function () {
        return Object.keys(r)
    }, s.id = 1, t.exports = s
}]);