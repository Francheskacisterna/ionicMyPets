"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[2656],{2656:($,u,l)=>{l.r(u),l.d(u,{AvePageModule:()=>P});var g=l(177),p=l(9417),t=l(4742),m=l(5559),e=l(4438);function v(i,a){if(1&i&&(e.j41(0,"ion-select-option",17),e.EFF(1),e.k0s()),2&i){const o=a.$implicit;e.Y8G("value",o),e.R7$(),e.JRh(o)}}function f(i,a){if(1&i){const o=e.RV6();e.j41(0,"ion-item",24),e.bIt("click",function(){const r=e.eBV(o).$implicit,c=e.XpG().$implicit,s=e.XpG();return e.Njj(s.selectWeight(c,r))}),e.j41(1,"p"),e.EFF(2),e.k0s()()}if(2&i){const o=a.$implicit,n=e.XpG().$implicit,r=e.XpG();e.AVh("selected",r.isSelected(n,o)),e.R7$(2),e.JRh(o.size)}}function A(i,a){if(1&i&&(e.j41(0,"div")(1,"p")(2,"strong"),e.EFF(3,"Precio:"),e.k0s(),e.EFF(4),e.k0s()()),2&i){const o=e.XpG().$implicit;e.R7$(4),e.SpI(" ",o.selectedWeight.price,"")}}function F(i,a){if(1&i&&(e.j41(0,"ion-col",18)(1,"ion-card"),e.nrm(2,"ion-img",19),e.j41(3,"ion-card-header")(4,"ion-card-title"),e.EFF(5),e.k0s()(),e.j41(6,"ion-card-content")(7,"p"),e.EFF(8),e.k0s(),e.j41(9,"ion-list",20),e.DNE(10,f,3,3,"ion-item",21),e.k0s(),e.DNE(11,A,5,1,"div",22),e.j41(12,"ion-button",23),e.EFF(13," Agregar al carrito "),e.k0s()()()()),2&i){const o=a.$implicit;e.R7$(2),e.Y8G("src",o.img),e.R7$(3),e.JRh(o.title),e.R7$(3),e.JRh(o.description),e.R7$(2),e.Y8G("ngForOf",o.weights),e.R7$(),e.Y8G("ngIf",o.selectedWeight)}}const y=[{path:"",component:(()=>{var i;class a{constructor(){this.products=[{img:"assets/images/aves/vitapol-barras-para-inseparables.jpg",title:"Vitapol Barras para Inseparables",description:"Barras de semillas naturales y frutas para inseparables. Proporciona nutrici\xf3n balanceada y diversi\xf3n.",weights:[{size:"100 g",price:"$3.990"},{size:"200 g",price:"$7.990"}],category:"Alimento",subcategory:"Snacks",selectedWeight:null},{img:"assets/images/aves/tropican-mantencion-ninfa.jpg",title:"Tropican Mantenci\xf3n Ninfa",description:"Alimento premium para ninfas, enriquecido con vitaminas y minerales. Ideal para el mantenimiento diario.",weights:[{size:"500 g",price:"$8.990"},{size:"1 kg",price:"$15.990"}],category:"Alimento",subcategory:"Ninfas",selectedWeight:null},{img:"assets/images/aves/tropican-mezcla-crianza-aves.jpg",title:"Tropican Mezcla Crianza Aves",description:"Mezcla especializada para la cr\xeda de aves, rica en nutrientes esenciales para un desarrollo \xf3ptimo.",weights:[{size:"1 kg",price:"$18.990"},{size:"2 kg",price:"$34.990"}],category:"Alimento",subcategory:"Cr\xeda",selectedWeight:null},{img:"assets/images/aves/tropican-high-performance-biscuits-loros.jpg",title:"Tropican High Performance Biscuits Loros",description:"Barras ricas en prote\xednas para loros en crecimiento o altamente activos. Ayuda a mantener el rendimiento f\xedsico.",weights:[{size:"250 g",price:"$10.990"},{size:"500 g",price:"$18.990"}],category:"Alimento",subcategory:"Loros",selectedWeight:null},{img:"assets/images/aves/tropican-mantencion-loros.jpg",title:"Tropican Mantenci\xf3n Loros",description:"Alimento completo para loros, formulado para el mantenimiento diario y balance adecuado de nutrientes.",weights:[{size:"1 kg",price:"$12.990"},{size:"3 kg",price:"$34.990"}],category:"Alimento",subcategory:"Loros",selectedWeight:null},{img:"assets/images/aves/tropican-high-performance.jpg",title:"Tropican High Performance",description:"Alimento alto en energ\xeda para aves reproductoras o en crecimiento. Favorece el desarrollo y la vitalidad.",weights:[{size:"500 g",price:"$9.990"},{size:"1.5 kg",price:"$26.990"}],category:"Alimento",subcategory:"Alto Rendimiento",selectedWeight:null},{img:"assets/images/aves/mazuri-large-bird.jpg",title:"Mazuri Large Bird",description:"Alimento especializado para aves grandes, proporciona todos los nutrientes esenciales para una dieta completa.",weights:[{size:"2 kg",price:"$29.990"},{size:"5 kg",price:"$59.990"}],category:"Alimento",subcategory:"Aves Grandes",selectedWeight:null}],this.filteredProducts=[],this.categories=["Snacks","Ninfas","Cr\xeda","Loros","Alto Rendimiento","Aves Grandes"],this.selectedCategory=""}ngOnInit(){this.filteredProducts=[...this.products]}selectWeight(n,r){n.selectedWeight=r}isSelected(n,r){return n.selectedWeight===r}sortProducts(n){const r=n.detail.value;"price-asc"===r?this.filteredProducts.sort((c,s)=>parseFloat(c.weights[0].price.replace("$","").replace(".",""))-parseFloat(s.weights[0].price.replace("$","").replace(".",""))):"price-desc"===r?this.filteredProducts.sort((c,s)=>{const d=parseFloat(c.weights[0].price.replace("$","").replace(".",""));return parseFloat(s.weights[0].price.replace("$","").replace(".",""))-d}):this.filteredProducts=[...this.products]}filterByCategory(){this.filteredProducts=this.selectedCategory?this.products.filter(n=>n.subcategory===this.selectedCategory):[...this.products]}openFilter(){console.log("Filtrar")}}return(i=a).\u0275fac=function(n){return new(n||i)},i.\u0275cmp=e.VBU({type:i,selectors:[["app-ave"]],decls:34,vars:3,consts:[["color","primary"],["slot","start"],[1,"custom-title"],["slot","end"],["name","search-outline"],["name","location-outline"],["name","cart-outline"],[1,"ion-padding","custom-content"],["href","/home"],["size","6"],["placeholder","Filtrar por Categor\xeda","interface","popover",3,"ngModelChange","ionChange","ngModel"],[3,"value",4,"ngFor","ngForOf"],["placeholder","Ordenar por","interface","popover",3,"ionChange"],["value","most-sold"],["value","price-asc"],["value","price-desc"],["size","12","size-md","6","size-lg","4",4,"ngFor","ngForOf"],[3,"value"],["size","12","size-md","6","size-lg","4"],[1,"fade-in",3,"src"],[1,"custom-list"],[3,"selected","click",4,"ngFor","ngForOf"],[4,"ngIf"],["expand","block","fill","outline","color","secondary",1,"add-to-cart"],[3,"click"]],template:function(n,r){1&n&&(e.j41(0,"ion-header")(1,"ion-toolbar",0)(2,"ion-buttons",1),e.nrm(3,"ion-menu-button"),e.k0s(),e.j41(4,"ion-title",2),e.EFF(5,"Pawsy - Aves"),e.k0s(),e.j41(6,"ion-buttons",3)(7,"ion-button"),e.nrm(8,"ion-icon",4),e.k0s(),e.j41(9,"ion-button"),e.nrm(10,"ion-icon",5),e.k0s(),e.j41(11,"ion-button"),e.nrm(12,"ion-icon",6),e.k0s()()()(),e.j41(13,"ion-content",7)(14,"ion-breadcrumbs")(15,"ion-breadcrumb",8),e.EFF(16,"Inicio"),e.k0s(),e.j41(17,"ion-breadcrumb"),e.EFF(18,"Aves"),e.k0s()(),e.j41(19,"ion-row")(20,"ion-col",9)(21,"ion-select",10),e.mxI("ngModelChange",function(s){return e.DH7(r.selectedCategory,s)||(r.selectedCategory=s),s}),e.bIt("ionChange",function(){return r.filterByCategory()}),e.DNE(22,v,2,2,"ion-select-option",11),e.k0s()(),e.j41(23,"ion-col",9)(24,"ion-select",12),e.bIt("ionChange",function(s){return r.sortProducts(s)}),e.j41(25,"ion-select-option",13),e.EFF(26,"Lo M\xe1s Vendido"),e.k0s(),e.j41(27,"ion-select-option",14),e.EFF(28,"Precio: Menor a Mayor"),e.k0s(),e.j41(29,"ion-select-option",15),e.EFF(30,"Precio: Mayor a Menor"),e.k0s()()()(),e.j41(31,"ion-grid")(32,"ion-row"),e.DNE(33,F,14,5,"ion-col",16),e.k0s()()()),2&n&&(e.R7$(21),e.R50("ngModel",r.selectedCategory),e.R7$(),e.Y8G("ngForOf",r.categories),e.R7$(11),e.Y8G("ngForOf",r.filteredProducts))},dependencies:[g.Sq,g.bT,p.BC,p.vS,t.a6,t.dQ,t.Jm,t.QW,t.b_,t.I9,t.ME,t.tN,t.hU,t.W9,t.lO,t.eU,t.iq,t.KW,t.uz,t.nf,t.MC,t.ln,t.Nm,t.Ip,t.BC,t.ai,t.Je]}),a})()}];let _=(()=>{var i;class a{}return(i=a).\u0275fac=function(n){return new(n||i)},i.\u0275mod=e.$C({type:i}),i.\u0275inj=e.G2t({imports:[m.iI.forChild(y),m.iI]}),a})(),P=(()=>{var i;class a{}return(i=a).\u0275fac=function(n){return new(n||i)},i.\u0275mod=e.$C({type:i}),i.\u0275inj=e.G2t({imports:[g.MD,p.YN,t.bv,_]}),a})()}}]);