(this["webpackJsonprulekeeper-manager-website"]=this["webpackJsonprulekeeper-manager-website"]||[]).push([[0],{24:function(e,t,n){"use strict";(function(e){var r=n(9),o=n(10),c=n(12),i=n(11),s=n(0),a=n(2),u=n(37),l=function(t){Object(c.a)(s,t);var n=Object(i.a)(s);function s(t){var o;Object(r.a)(this,s),(o=n.call(this)).state={purpose:null,data:[],origin:null};var c=t.location;if(c){var i=c.search;if(i){var a=u.parse(i,{ignoreQueryPrefix:!0}),l=JSON.parse(e.from(a.data,"base64").toString()),h=e.from(a.origin,"base64").toString();o.state={data:l.data,purpose:l.purpose,url:h}}}return o}return Object(o.a)(s,[{key:"sendConsent",value:function(e,t,n){fetch("".concat("https://localhost:3031","/consent/set-consent?purpose=").concat(t),{method:"POST",headers:{"Content-Type":"application/json"}}).then((function(e){window.location.replace(n)}),(function(e){console.log(e)}))}},{key:"render",value:function(){var e=this,t=this.state,n=t.data,r=t.purpose,o=t.url;return Object(a.jsxs)("div",{children:[Object(a.jsx)("h1",{children:"Webus Cookie Consent"}),Object(a.jsx)("h3",{children:"This operation requires your consent."}),Object(a.jsxs)("p",{children:["This operation requires you to share your data: ",Object(a.jsx)("b",{children:n})," for the purpose of ",Object(a.jsx)("b",{children:r}),"."]}),Object(a.jsxs)("p",{children:["To find out more, read our ",Object(a.jsx)("b",{children:"Privacy Policy"}),"."]}),Object(a.jsx)("button",{onClick:function(t){return e.sendConsent(t,r,o)},children:"Submit"})]})}}]),s}(s.Component);t.a=l}).call(this,n(32).Buffer)},47:function(e,t){},57:function(e,t,n){"use strict";n.r(t);var r=n(0),o=n(23),c=n.n(o),i=n(9),s=n(10),a=n(12),u=n(11),l=n(25),h=n(1),j=n(24),b=n(2),p=function(e){Object(a.a)(n,e);var t=Object(u.a)(n);function n(){return Object(i.a)(this,n),t.apply(this,arguments)}return Object(s.a)(n,[{key:"render",value:function(){return Object(b.jsxs)(l.a,{children:[Object(b.jsx)("h1",{children:" RuleKeeper Manager Service "}),Object(b.jsxs)(h.d,{children:[Object(b.jsx)(h.b,{path:"/consent",component:j.a}),Object(b.jsx)(h.a,{from:"*",to:"/"})]})]})}}]),n}(r.Component),d=p,f=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,58)).then((function(t){var n=t.getCLS,r=t.getFID,o=t.getFCP,c=t.getLCP,i=t.getTTFB;n(e),r(e),o(e),c(e),i(e)}))};n(53).config(),c.a.render(Object(b.jsx)(d,{}),document.getElementById("root")),f()}},[[57,1,2]]]);
//# sourceMappingURL=main.237d33a7.chunk.js.map