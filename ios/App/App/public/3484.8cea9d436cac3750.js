"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[3484],{3484:(q,b,g)=>{g.r(b),g.d(b,{ProductEditPageModule:()=>$});var P,k=g(177),c=g(9417),a=g(4742),E=g(9192),f=g(467),y=g(7691),m=g(4843),O=new Uint8Array(16);function S(){if(!P&&!(P=typeof crypto<"u"&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto)||typeof msCrypto<"u"&&"function"==typeof msCrypto.getRandomValues&&msCrypto.getRandomValues.bind(msCrypto)))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return P(O)}const A=/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;for(var u=[],I=0;I<256;++I)u.push((I+256).toString(16).substr(1));const L=function G(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,d=(u[t[n+0]]+u[t[n+1]]+u[t[n+2]]+u[t[n+3]]+"-"+u[t[n+4]]+u[t[n+5]]+"-"+u[t[n+6]]+u[t[n+7]]+"-"+u[t[n+8]]+u[t[n+9]]+"-"+u[t[n+10]]+u[t[n+11]]+u[t[n+12]]+u[t[n+13]]+u[t[n+14]]+u[t[n+15]]).toLowerCase();if(!function j(t){return"string"==typeof t&&A.test(t)}(d))throw TypeError("Stringified UUID is invalid");return d},_=function R(t,n,d){var o=(t=t||{}).random||(t.rng||S)();if(o[6]=15&o[6]|64,o[8]=63&o[8]|128,n){d=d||0;for(var i=0;i<16;++i)n[d+i]=o[i];return n}return L(o)};var e=g(4438),N=g(636);function x(t,n){1&t&&(e.j41(0,"ion-text",17),e.EFF(1," El nombre es requerido. "),e.k0s())}function W(t,n){1&t&&(e.j41(0,"ion-text",17),e.EFF(1," La descripci\xf3n es requerida. "),e.k0s())}function T(t,n){1&t&&(e.j41(0,"ion-text",17),e.EFF(1," El precio es requerido y debe ser mayor a 0. "),e.k0s())}function w(t,n){1&t&&(e.j41(0,"ion-text",17),e.EFF(1," El stock es requerido y debe ser mayor a 0. "),e.k0s())}function Q(t,n){if(1&t&&(e.j41(0,"ion-select-option",18),e.EFF(1),e.k0s()),2&t){const d=n.$implicit;e.Y8G("value",d),e.R7$(),e.JRh(d)}}function z(t,n){if(1&t&&(e.j41(0,"ion-item")(1,"ion-label"),e.EFF(2,"Imagen Actual"),e.k0s(),e.nrm(3,"ion-img",19),e.k0s()),2&t){const d=e.XpG();e.R7$(3),e.Y8G("src",d.productImage)}}function D(t,n){if(1&t){const d=e.RV6();e.j41(0,"ion-button",20),e.bIt("click",function(){e.eBV(d);const i=e.XpG();return e.Njj(i.deleteImage())}),e.EFF(1,"Eliminar Imagen"),e.k0s()}}function V(t,n){if(1&t){const d=e.RV6();e.j41(0,"ion-grid",21)(1,"ion-row")(2,"ion-col")(3,"ion-item")(4,"ion-label"),e.EFF(5,"Peso (kg)"),e.k0s(),e.nrm(6,"ion-input",22),e.k0s()(),e.j41(7,"ion-col")(8,"ion-item")(9,"ion-label"),e.EFF(10,"Precio"),e.k0s(),e.nrm(11,"ion-input",23),e.k0s()(),e.j41(12,"ion-col")(13,"ion-item")(14,"ion-label"),e.EFF(15,"Stock"),e.k0s(),e.nrm(16,"ion-input",6),e.k0s()(),e.j41(17,"ion-col",24)(18,"ion-button",25),e.bIt("click",function(){const i=e.eBV(d).index,r=e.XpG();return e.Njj(r.removeWeightOption(i))}),e.EFF(19,"Eliminar"),e.k0s()()()()}2&t&&e.Y8G("formGroupName",n.index)}const Y=[{path:"",component:(()=>{var t;class n{constructor(o,i,r,s){var l;this.formBuilder=o,this.router=i,this.productService=r,this.alertController=s,this.productImage=null,this.categories=["perro","gato","aves"],this.productForm=this.formBuilder.group({nombre:["",c.k0.required],descripcion:["",c.k0.required],precio:["",[c.k0.required,c.k0.min(1)]],stock:["",[c.k0.required,c.k0.min(1)]],categoria:["",c.k0.required],imagen:[null],weightOptions:this.formBuilder.array([])});const p=this.router.getCurrentNavigation();null!=p&&null!==(l=p.extras)&&void 0!==l&&null!==(l=l.state)&&void 0!==l&&l.product&&(this.product=p.extras.state.product)}ngOnInit(){this.product?(this.productForm.patchValue({nombre:this.product.nombre,descripcion:this.product.descripcion,precio:this.product.precio,stock:this.product.stock,categoria:this.product.categoria.toLowerCase(),imagen:this.product.imagen}),this.product.imagen&&(this.productImage=this.product.imagen),this.loadWeightOptions()):console.error("No se encontraron datos del producto en el estado de navegaci\xf3n")}compareWith(o,i){return o===i}loadWeightOptions(){var o=this;return(0,f.A)(function*(){var i;if(null!==(i=o.product)&&void 0!==i&&i.id)try{let r=[];if(r=yield o.productService.getWeightOptionsByProductIdSQLite(o.product.id),console.log("Opciones de peso obtenidas de SQLite:",r),0===r.length&&navigator.onLine&&(console.log("No se encontraron opciones de peso en SQLite, cargando desde la API..."),r=yield(0,m._)(o.productService.getWeightOptionsByProductIdAPI(o.product.id)),console.log("Opciones de peso obtenidas de la API:",r),r.length>0)){for(const s of r)s.producto_id=o.product.id,yield o.productService.addWeightOptionSQLite(s);console.log("Opciones de peso sincronizadas en SQLite para uso offline.")}r.length>0?o.setWeightOptions(r):console.warn("No se encontraron opciones de peso ni en SQLite ni en la API.")}catch(r){console.error("Error al cargar las opciones de peso:",r)}})()}setWeightOptions(o){const i=this.productForm.get("weightOptions");i.clear(),o.forEach(r=>{const s=this.formBuilder.group({id:[r.id],size:[r.size,c.k0.required],price:[r.price,[c.k0.required,c.k0.min(0)]],stock:[r.stock,[c.k0.required,c.k0.min(0)]]});i.push(s)})}addWeightOption(){const o=this.productForm.get("weightOptions"),i=this.formBuilder.group({size:["",c.k0.required],price:[0,[c.k0.required,c.k0.min(0)]],stock:[0,[c.k0.required,c.k0.min(0)]]});o.push(i)}removeWeightOption(o){const i=this.productForm.get("weightOptions"),r=i.at(o).value;r.id&&this.deleteWeightOption(r.id),i.removeAt(o)}selectImage(){var o=this;return(0,f.A)(function*(){try{const i=yield y.i7.getPhoto({quality:90,allowEditing:!1,resultType:y.LK.Uri,source:y.ru.Prompt});o.productImage=i.webPath,console.log("URL de la imagen seleccionada:",o.productImage)}catch(i){console.error("Error al capturar imagen:",i)}})()}deleteImage(){var o=this;return(0,f.A)(function*(){if(o.productImage=null,o.productForm.patchValue({imagen:""}),o.product){o.product.imagen="";try{if(yield o.productService.updateProductSQLite(o.product),console.log("Imagen eliminada y actualizada en SQLite."),navigator.onLine)try{yield(0,m._)(o.productService.updateProductAPI(o.product)),console.log("Imagen eliminada de la API y actualizada en SQLite.")}catch(i){console.error("Error al eliminar la imagen en la API:",i)}else console.log("Sin conexi\xf3n. La imagen se eliminar\xe1 de la API en la pr\xf3xima sincronizaci\xf3n.")}catch(i){console.error("Error al eliminar la imagen en SQLite:",i)}}})()}saveChanges(){var o=this;return(0,f.A)(function*(){if(o.productForm.valid){var i,r,s;const l={id:null!==(i=null===(r=o.product)||void 0===r?void 0:r.id)&&void 0!==i?i:_(),nombre:o.productForm.value.nombre,descripcion:o.productForm.value.descripcion,precio:o.productForm.value.precio,stock:o.productForm.value.stock,categoria:o.productForm.value.categoria,imagen:null===o.productImage?"":o.productImage||(null===(s=o.product)||void 0===s?void 0:s.imagen)},p=o.productForm.value.weightOptions.map(h=>({...h,id:h.id||_(),producto_id:l.id}));try{if(yield o.productService.isApiAvailable()){const F=yield(0,m._)(o.productService.updateProductAPI(l));if(F&&F.id){console.log("Producto sincronizado con la API:",F);const U=yield(0,m._)(o.productService.getWeightOptionsByProductIdAPI(F.id));for(const v of p)U.some(M=>M.id===v.id)?(yield(0,m._)(o.productService.updateWeightOptionAPI(v)),console.log("Opci\xf3n de peso actualizada en la API:",v)):(yield(0,m._)(o.productService.addWeightOptionAPI(v)),console.log("Opci\xf3n de peso a\xf1adida a la API:",v))}}else console.log("API no disponible, guardando en SQLite como respaldo."),yield o.saveToSQLite(l,p);yield(yield o.alertController.create({header:"\xc9xito",message:"Producto y opciones de peso actualizados correctamente.",buttons:["OK"]})).present(),o.router.navigate(["/productos/product-list"])}catch(h){console.error("Error en la sincronizaci\xf3n con la API. Guardando en SQLite:",h),yield o.saveToSQLite(l,p)}}else console.log("Formulario inv\xe1lido")})()}saveToSQLite(o,i){var r=this;return(0,f.A)(function*(){try{var s;yield r.productService.updateProductSQLite(o),yield r.productService.clearWeightOptionsSQLite(null!==(s=o.id)&&void 0!==s?s:"");for(const l of i)l.id=l.id||_(),yield r.productService.addWeightOptionSQLite(l);console.log("Producto y opciones de peso actualizados en SQLite como respaldo:",o,i)}catch(l){console.error("Error al guardar en SQLite:",l)}})()}deleteWeightOption(o){var i=this;return(0,f.A)(function*(){try{yield i.productService.deleteWeightOptionSQLite(o),console.log(`Opci\xf3n de peso con ID ${o} eliminada de SQLite`),navigator.onLine?(yield(0,m._)(i.productService.deleteWeightOptionAPI(o)),console.log(`Opci\xf3n de peso con ID ${o} eliminada de la API`)):console.log("No hay conexi\xf3n a la red, no se puede eliminar de la API")}catch(r){console.error("Error al eliminar la opci\xf3n de peso:",r)}})()}get weightOptionsControls(){return this.productForm.get("weightOptions").controls}cancelChanges(){this.router.navigate(["/productos/product-list"])}}return(t=n).\u0275fac=function(o){return new(o||t)(e.rXU(c.ok),e.rXU(E.Ix),e.rXU(N.b),e.rXU(a.hG))},t.\u0275cmp=e.VBU({type:t,selectors:[["app-product-edit"]],decls:49,vars:12,consts:[[3,"formGroup"],["position","stacked"],["formControlName","nombre"],["color","danger",4,"ngIf"],["formControlName","descripcion"],["formControlName","precio","type","number"],["formControlName","stock","type","number"],["formControlName","categoria",3,"compareWith"],[3,"value",4,"ngFor","ngForOf"],[4,"ngIf"],["expand","full",3,"click"],["expand","full","color","danger",3,"click",4,"ngIf"],["formArrayName","weightOptions"],[3,"formGroupName",4,"ngFor","ngForOf"],["expand","block",3,"click"],["expand","full",3,"click","disabled"],["expand","full","color","light",3,"click"],["color","danger"],[3,"value"],[1,"product-image",3,"src"],["expand","full","color","danger",3,"click"],[3,"formGroupName"],["formControlName","size","type","number"],["formControlName","price","type","number"],["size","auto"],["color","danger",3,"click"]],template:function(o,i){if(1&o&&(e.j41(0,"ion-header")(1,"ion-toolbar")(2,"ion-title"),e.EFF(3),e.k0s()()(),e.j41(4,"ion-content")(5,"form",0)(6,"ion-item")(7,"ion-label",1),e.EFF(8,"Nombre"),e.k0s(),e.nrm(9,"ion-input",2),e.k0s(),e.DNE(10,x,2,0,"ion-text",3),e.j41(11,"ion-item")(12,"ion-label",1),e.EFF(13,"Descripci\xf3n"),e.k0s(),e.nrm(14,"ion-textarea",4),e.k0s(),e.DNE(15,W,2,0,"ion-text",3),e.j41(16,"ion-item")(17,"ion-label",1),e.EFF(18,"Precio Base"),e.k0s(),e.nrm(19,"ion-input",5),e.k0s(),e.DNE(20,T,2,0,"ion-text",3),e.j41(21,"ion-item")(22,"ion-label",1),e.EFF(23,"Stock Inicial"),e.k0s(),e.nrm(24,"ion-input",6),e.k0s(),e.DNE(25,w,2,0,"ion-text",3),e.j41(26,"ion-item")(27,"ion-label",1),e.EFF(28,"Categor\xeda"),e.k0s(),e.j41(29,"ion-select",7),e.DNE(30,Q,2,2,"ion-select-option",8),e.k0s()(),e.DNE(31,z,4,1,"ion-item",9),e.j41(32,"ion-item")(33,"ion-button",10),e.bIt("click",function(){return i.selectImage()}),e.EFF(34,"Cambiar Imagen"),e.k0s(),e.DNE(35,D,2,0,"ion-button",11),e.k0s(),e.j41(36,"ion-card")(37,"ion-card-header")(38,"ion-card-title"),e.EFF(39,"Opciones de Peso"),e.k0s()(),e.j41(40,"ion-card-content")(41,"div",12),e.DNE(42,V,20,1,"ion-grid",13),e.k0s(),e.j41(43,"ion-button",14),e.bIt("click",function(){return i.addWeightOption()}),e.EFF(44,"A\xf1adir Opci\xf3n de Peso"),e.k0s()()(),e.j41(45,"ion-button",15),e.bIt("click",function(){return i.saveChanges()}),e.EFF(46,"Guardar Cambios"),e.k0s(),e.j41(47,"ion-button",16),e.bIt("click",function(){return i.cancelChanges()}),e.EFF(48,"Volver"),e.k0s()()()),2&o){let r,s,l,p;e.R7$(3),e.JRh(i.product?"Editar Producto":"Agregar Producto"),e.R7$(2),e.Y8G("formGroup",i.productForm),e.R7$(5),e.Y8G("ngIf",(null==(r=i.productForm.get("nombre"))?null:r.invalid)&&(null==(r=i.productForm.get("nombre"))?null:r.touched)),e.R7$(5),e.Y8G("ngIf",(null==(s=i.productForm.get("descripcion"))?null:s.invalid)&&(null==(s=i.productForm.get("descripcion"))?null:s.touched)),e.R7$(5),e.Y8G("ngIf",(null==(l=i.productForm.get("precio"))?null:l.invalid)&&(null==(l=i.productForm.get("precio"))?null:l.touched)),e.R7$(5),e.Y8G("ngIf",(null==(p=i.productForm.get("stock"))?null:p.invalid)&&(null==(p=i.productForm.get("stock"))?null:p.touched)),e.R7$(4),e.Y8G("compareWith",i.compareWith),e.R7$(),e.Y8G("ngForOf",i.categories),e.R7$(),e.Y8G("ngIf",i.productImage),e.R7$(4),e.Y8G("ngIf",i.productImage),e.R7$(7),e.Y8G("ngForOf",i.weightOptionsControls),e.R7$(3),e.Y8G("disabled",!i.productForm.valid)}},dependencies:[k.Sq,k.bT,c.qT,c.BC,c.cb,c.j4,c.JD,c.$R,c.v8,a.Jm,a.b_,a.I9,a.ME,a.tN,a.hU,a.W9,a.lO,a.eU,a.KW,a.$w,a.uz,a.he,a.ln,a.Nm,a.Ip,a.IO,a.nc,a.BC,a.ai,a.su,a.Je,a.Gw]}),n})()}];let B=(()=>{var t;class n{}return(t=n).\u0275fac=function(o){return new(o||t)},t.\u0275mod=e.$C({type:t}),t.\u0275inj=e.G2t({imports:[E.iI.forChild(Y),E.iI]}),n})(),$=(()=>{var t;class n{}return(t=n).\u0275fac=function(o){return new(o||t)},t.\u0275mod=e.$C({type:t}),t.\u0275inj=e.G2t({imports:[k.MD,c.YN,c.X1,a.bv,B]}),n})()}}]);