"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[6521],{6521:(P,l,r)=>{r.r(l),r.d(l,{ion_input_password_toggle:()=>e});var i=r(4261),d=r(4929),c=r(333),u=r(3992),p=r(9483);const e=(()=>{let a=class{constructor(o){(0,i.r)(this,o),this.togglePasswordVisibility=()=>{const{inputElRef:n}=this;n&&(n.type="text"===n.type?"password":"text")},this.color=void 0,this.showIcon=void 0,this.hideIcon=void 0,this.type="password"}onTypeChange(o){"text"===o||"password"===o||(0,d.p)(`ion-input-password-toggle only supports inputs of type "text" or "password". Input of type "${o}" is not compatible.`,this.el)}connectedCallback(){const{el:o}=this,n=this.inputElRef=o.closest("ion-input");n?this.type=n.type:(0,d.p)("No ancestor ion-input found for ion-input-password-toggle. This component must be slotted inside of an ion-input.",o)}disconnectedCallback(){this.inputElRef=null}render(){var o,n;const{color:f,type:b}=this,g=(0,p.b)(this),E=null!==(o=this.showIcon)&&void 0!==o?o:u.x,I=null!==(n=this.hideIcon)&&void 0!==n?n:u.y,y="text"===b;return(0,i.h)(i.f,{key:"d9811e25bfeb2aa197352bb9be852e9e420739d5",class:(0,c.c)(f,{[g]:!0})},(0,i.h)("ion-button",{key:"1eaea1442b248fb2b8d61538b27274e647a07804",mode:g,color:f,fill:"clear",shape:"round","aria-checked":y?"true":"false","aria-label":"show password",role:"switch",type:"button",onPointerDown:w=>{w.preventDefault()},onClick:this.togglePasswordVisibility},(0,i.h)("ion-icon",{key:"9c88de8f4631d9bde222ce2edf6950d639e04773",slot:"icon-only","aria-hidden":"true",icon:y?I:E})))}get el(){return(0,i.i)(this)}static get watchers(){return{type:["onTypeChange"]}}};return a.style={ios:"",md:""},a})()},333:(P,l,r)=>{r.d(l,{c:()=>c,g:()=>p,h:()=>d,o:()=>h});var i=r(467);const d=(s,t)=>null!==t.closest(s),c=(s,t)=>"string"==typeof s&&s.length>0?Object.assign({"ion-color":!0,[`ion-color-${s}`]:!0},t):t,p=s=>{const t={};return(s=>void 0!==s?(Array.isArray(s)?s:s.split(" ")).filter(e=>null!=e).map(e=>e.trim()).filter(e=>""!==e):[])(s).forEach(e=>t[e]=!0),t},_=/^[a-z][a-z0-9+\-.]*:/,h=function(){var s=(0,i.A)(function*(t,e,a,o){if(null!=t&&"#"!==t[0]&&!_.test(t)){const n=document.querySelector("ion-router");if(n)return null!=e&&e.preventDefault(),n.push(t,a,o)}return!1});return function(e,a,o,n){return s.apply(this,arguments)}}()}}]);