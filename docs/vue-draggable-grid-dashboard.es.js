import { defineComponent as J, computed as C, ref as m, onMounted as K, nextTick as Q, onBeforeUnmount as Z, createElementBlock as X, openBlock as E, createElementVNode as w, normalizeStyle as S, Fragment as A, renderList as G, normalizeClass as T, withModifiers as W, renderSlot as ee, toDisplayString as te } from "vue";
const ie = { class: "dg-container" }, ne = ["id", "onMousedown"], oe = ["onMousedown"], se = { class: "dg-actions" }, ae = /* @__PURE__ */ J({
  __name: "DraggableGrid",
  props: {
    modelValue: { type: Array, required: !0 },
    gridXCount: { type: Number, default: 12 },
    gridYCount: { type: Number, default: 9 },
    gridGap: { type: Number, default: 10 },
    minWidth: { type: Number, default: 2 },
    minHeight: { type: Number, default: 2 },
    defaultSize: { type: Object, default: () => ({ width: 3, height: 3 }) },
    addText: { type: String, default: "New Card" }
  },
  emits: ["update:modelValue", "add", "change", "delete"],
  setup(x, { emit: M }) {
    const a = x, y = M, l = C({
      get: () => a.modelValue,
      set: (n) => y("update:modelValue", n)
    }), z = m(50), c = m(50), Y = C(() => a.gridXCount), g = m(a.gridYCount), d = C(() => a.gridGap), v = m(null), _ = () => {
      if (!v.value) return;
      const n = v.value.offsetWidth - 32, o = v.value.offsetHeight - 32;
      if (n <= 0 || o <= 0) {
        setTimeout(_, 100);
        return;
      }
      const e = n - (Y.value - 1) * d.value, i = o - (g.value - 1) * d.value;
      z.value = Math.max(60, Math.floor(e / Y.value)), c.value = Math.max(60, Math.floor(i / g.value));
    }, h = m({ state: !1, index: null }), p = m({ state: !1, index: null }), q = () => {
      y("add");
    }, H = (n, o, e, i, t, r) => !t.some((s) => s.id === r.id ? !1 : n < s.position.gridX + s.size.width && n + e > s.position.gridX && o < s.position.gridY + s.size.height && o + i > s.position.gridY), k = () => {
      const n = l.value.map((e, i) => ({ ...e, index: i })).sort((e, i) => e.position.gridY - i.position.gridY || e.position.gridX - i.position.gridX), o = [];
      n.forEach((e) => {
        let i = e.position.gridX, t = e.position.gridY;
        if (H(i, t, e.size.width, e.size.height, o, e))
          for (; t > 0 && H(i, t - 1, e.size.width, e.size.height, o, e); )
            t -= 1;
        else
          for (; !H(i, t, e.size.width, e.size.height, o, e); )
            t += 1;
        l.value[e.index].position.gridY !== t && (l.value[e.index].position.gridY = t, t + e.size.height > g.value && (g.value = t + e.size.height), y("change", l.value[e.index], e.index)), o.push(e);
      });
    }, u = m(null), L = m({ x: 0, y: 0 }), P = (n, o, e) => {
      if (!v.value) return;
      h.value.state = !0, h.value.index = e;
      const i = document.querySelector(`#dg_${o.id}`), t = v.value.querySelector(".dg-grid");
      u.value = i.cloneNode(!0), u.value.classList.add("cloned"), u.value.classList.remove("isDragging"), L.value = { x: n.clientX - i.offsetLeft, y: n.clientY - i.offsetTop }, t.appendChild(u.value), u.value.style.left = `${i.offsetLeft}px`, u.value.style.top = `${i.offsetTop}px`;
      const r = (f) => B(f, e), s = () => F(r, s);
      document.addEventListener("mousemove", r), document.addEventListener("mouseup", s), n.preventDefault();
    }, R = (n, o) => {
      const e = Y.value - o.size.width, i = g.value - o.size.height, t = { ...n };
      return t.gridX < 0 ? t.gridX = 0 : t.gridX > e && (t.gridX = e), t.gridY < 0 ? t.gridY = 0 : t.gridY > i && (t.gridY = i), t;
    }, V = (n, o, e) => {
      const i = (t, r, s) => t * (r === 1 ? z.value : c.value) + (s ? t : t - 1) * d.value;
      return n.x < i(e.position.gridX + e.size.width, 1) && n.x + i(o.size.width, 1) > i(e.position.gridX, 1, !0) && n.y < i(e.position.gridY + 1, 2) && n.y + c.value > i(e.position.gridY, 2, !0);
    }, B = (n, o) => {
      if (!h.value.state) return;
      n.preventDefault();
      const e = n.clientX - L.value.x, i = n.clientY - L.value.y;
      u.value.style.left = `${e}px`, u.value.style.top = `${i}px`;
      const t = l.value[o], r = R({ gridX: Math.round(e / (z.value + d.value)), gridY: Math.floor(i / (c.value + d.value)) }, t);
      l.value.forEach((s, f) => {
        o !== f && V({ x: e, y: i }, t, s) && (s.position = { gridX: s.position.gridX, gridY: s.position.gridY + 1 });
      }), t.position = r, k();
    }, F = (n, o) => {
      h.value.state = !1, h.value.index = null, v.value.querySelector(".dg-grid").removeChild(u.value), u.value = null, document.removeEventListener("mousemove", n), document.removeEventListener("mouseup", o);
    }, I = (n, o, e) => {
      p.value.state = !0, p.value.index = e;
      const i = n.clientX, t = n.clientY, r = l.value[e].size.width, s = l.value[e].size.height, f = (b) => j(b, e, r, s, i, t), D = () => U(f, D);
      document.addEventListener("mousemove", f), document.addEventListener("mouseup", D);
    }, O = (n, o) => {
      const e = Y.value - o.position.gridX, i = g.value - o.position.gridY, t = { ...n };
      return t.width > e && (t.width = e), t.height > i && (g.value = o.position.gridY + t.height), t.width < a.minWidth && (t.width = a.minWidth), t.height < a.minHeight && (t.height = a.minHeight), t;
    }, j = (n, o, e, i, t, r) => {
      if (!p.value.state) return;
      n.preventDefault();
      const s = n.clientX - t, f = n.clientY - r, D = Math.max(a.minWidth, e + Math.round(s / (z.value + d.value))), b = Math.max(a.minHeight, i + Math.round(f / (c.value + d.value))), N = l.value[o];
      N.size = O({ width: D, height: b }, N), k();
    }, U = (n, o) => {
      p.value.state = !1, p.value.index = null, document.removeEventListener("mousemove", n), document.removeEventListener("mouseup", o);
    }, $ = () => _();
    return K(() => {
      v.value = document.querySelector(".dg-container"), v.value && Q(() => {
        _(), window.addEventListener("resize", $);
      });
    }), Z(() => {
      window.removeEventListener("resize", $);
    }), (n, o) => (E(), X("div", ie, [
      w("div", {
        class: "dg-grid",
        style: S({ gap: d.value + "px" })
      }, [
        (E(!0), X(A, null, G(Y.value * g.value, (e) => (E(), X("div", {
          key: e,
          class: T(["dg-cell", { "dg-cell-visible": h.value.state || p.value.state }]),
          style: S({
            flex: `0 0 ${z.value}px`,
            height: `${c.value}px`
          })
        }, null, 6))), 128)),
        (E(!0), X(A, null, G(l.value, (e, i) => (E(), X("div", {
          key: e.id,
          class: T(["dg-item", {
            isResizing: p.value.index === i,
            isDragging: h.value.index === i
          }]),
          id: "dg_" + e.id,
          style: S({
            width: `${e.size.width * z.value + (e.size.width - 1) * d.value}px`,
            height: `${e.size.height * c.value + (e.size.height - 1) * d.value}px`,
            left: e.position.gridX * (z.value + d.value) + "px",
            top: e.position.gridY * (c.value + d.value) + "px",
            zIndex: h.value.index === i || p.value.index === i ? 3 : 2
          }),
          onMousedown: W((t) => P(t, e, i), ["stop"])
        }, [
          o[1] || (o[1] = w("div", { class: "dg-move-icon" }, null, -1)),
          w("div", {
            class: "dg-resizer",
            onMousedown: W((t) => I(t, e, i), ["stop"])
          }, null, 40, oe),
          w("div", {
            class: "dg-card",
            onMousedown: o[0] || (o[0] = W(() => {
            }, ["stop"]))
          }, [
            ee(n.$slots, "card", {
              item: e,
              index: i
            }, void 0, !0)
          ], 32)
        ], 46, ne))), 128))
      ], 4),
      w("div", se, [
        w("button", {
          class: "dg-btn",
          onClick: q
        }, te(x.addText), 1)
      ])
    ]));
  }
}), le = (x, M) => {
  const a = x.__vccOpts || x;
  for (const [y, l] of M)
    a[y] = l;
  return a;
}, de = /* @__PURE__ */ le(ae, [["__scopeId", "data-v-ff75ed7d"]]), ue = {
  install(x) {
    x.component("DraggableGrid", de);
  }
};
export {
  de as DraggableGrid,
  ue as default
};
