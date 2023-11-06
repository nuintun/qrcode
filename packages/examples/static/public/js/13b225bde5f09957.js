!function(){"use strict";function e(e){return 0|e+(e<0?-.5:.5)}function t(e){return e-=e>>1&1431655765,((e=(858993459&e)+(e>>2&858993459))+(e>>4)&252645135)*16843009>>24}function n(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:e.length,r=0;for(let i=t;i<n;i++)r+=e[i];return r}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class r{#e;#t;#n;#r;constructor(e,t,n){let r=Math.ceil(e/32),i=r*t;if(this.#e=e,this.#t=t,this.#n=r,n instanceof Int32Array){if(n.length!==i)throw Error(`matrix bits capacity mismatch: ${i}`);this.#r=n}else this.#r=new Int32Array(i)}#i(e,t){return t*this.#n+(0|e/32)}get width(){return this.#e}get height(){return this.#t}set(e,t){let n=this.#i(e,t);this.#r[n]|=1<<(31&e)}get(e,t){let n=this.#i(e,t);return this.#r[n]>>>(31&e)&1}flip(e,t){if(null!=e&&null!=t){let n=this.#i(e,t);this.#r[n]^=1<<(31&e)}else{let e=this.#r,{length:t}=e;for(let n=0;n<t;n++)e[n]=~e[n]}}clone(){return new r(this.#e,this.#t,new Int32Array(this.#r))}setRegion(e,t,n,r){let i=this.#r,s=e+n,l=t+r,o=this.#n;for(let n=t;n<l;n++){let t=n*o;for(let n=e;n<s;n++)i[t+(0|n/32)]|=1<<(31&n)}}}function i(e){let t=e>>3;return 7&e&&t++,t}function s(e,t){return e<2?2:Math.min(e,t)}function l(e,t){return(e<<=3)>t?t:e}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class o{#s;#l;constructor(e,t){this.#s=e,this.#l=t}get x(){return this.#s}get y(){return this.#l}}function w(e,t){return Math.sqrt(a(e,t))}function a(e,t){let n=e.x-t.x,r=e.y-t.y;return n*n+r*r}function u(e,t,n){let{x:r,y:i}=e,{x:s,y:l}=t,{x:o,y:w}=n;return Math.abs(r*(l-w)+s*(w-i)+o*(i-l))/2}class h extends o{#o;#e;#t;#w;#a;#u=1;#h;#f;static noise(e){return e.#o}static width(e){return e.#e}static height(e){return e.#t}static combined(e){return e.#u}static rect(e){return e.#w}static equals(e,t,n,r,i){let{modules:s}=e.#h,l=e.#f;if(Math.abs(t-e.x)<=l&&Math.abs(n-e.y)<=l){let t=e.#a,n=Math.abs((r+i)/s/2-t);if(n<=1||n<=t)return!0}return!1}static combine(e,t,n,r,i,s){let l=e.#u,o=l+1,w=(e.x*l+t)/o,a=(e.y*l+n)/o,u=(e.#o*l+s)/o,f=(e.#e*l+r)/o,c=(e.#t*l+i)/o,d=new h(e.#h,w,a,f,c,u);return d.#u=o,d}constructor(e,t,n,r,i,s){super(t,n);let{modules:l}=e,o=r/2,w=i/2,a=r/l,u=i/l,h=a/2,f=u/2,c=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e){let{ratios:t}=e;return t[0|t.length/2]/2}(e),d=(a+u)/2;this.#o=s,this.#e=r,this.#t=i,this.#h=e,this.#a=d,this.#w=[t-o+h,n-w+f,t+o-h,n+w-f],this.#f=d*c}get moduleSize(){return this.#a}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class f{#c;#d;constructor(e,t){this.#c=e,this.#d=t}sample(e,t){let n=this.#c,i=n.width,s=this.#d,l=n.height,o=new r(e,t);for(let r=0;r<t;r++)for(let t=0;t<e;t++){let[e,w]=s.mapping(t+.5,r+.5),a=0|e,u=0|w;a>=0&&u>=0&&a<i&&u<l&&n.get(a,u)&&o.set(t,r)}return o}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class c{#g;#m;constructor(e,t){this.#g=e,this.#m=t}get count(){return this.#g}get numDataCodewords(){return this.#m}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class d{#b;#y;#p;#x;#z;constructor(e,...t){let n=0,r=0;for(let{count:e,numDataCodewords:i}of t)n+=e,r+=i*e;let i=e*n;this.#b=t,this.#p=i,this.#x=r,this.#z=e,this.#y=r+i}get ecBlocks(){return this.#b}get numTotalCodewords(){return this.#y}get numTotalECCodewords(){return this.#p}get numTotalDataCodewords(){return this.#x}get numECCodewordsPerBlock(){return this.#z}}let g=[31892,34236,39577,42195,48118,51042,55367,58893,63784,68472,70749,76311,79154,84390,87683,92361,96236,102084,102881,110507,110734,117786,119615,126325,127568,133589,136944,141498,145311,150283,152622,158308,161089,167017];class m{#I;#C;#b;#S;constructor(e,t,...n){this.#C=e,this.#b=n,this.#I=17+4*e,this.#S=t}get size(){return this.#I}get version(){return this.#C}get alignmentPatterns(){return this.#S}getECBlocks(e){let{level:t}=e;return this.#b[t]}}let b=[new m(1,[],new d(7,new c(1,19)),new d(10,new c(1,16)),new d(13,new c(1,13)),new d(17,new c(1,9))),new m(2,[6,18],new d(10,new c(1,34)),new d(16,new c(1,28)),new d(22,new c(1,22)),new d(28,new c(1,16))),new m(3,[6,22],new d(15,new c(1,55)),new d(26,new c(1,44)),new d(18,new c(2,17)),new d(22,new c(2,13))),new m(4,[6,26],new d(20,new c(1,80)),new d(18,new c(2,32)),new d(26,new c(2,24)),new d(16,new c(4,9))),new m(5,[6,30],new d(26,new c(1,108)),new d(24,new c(2,43)),new d(18,new c(2,15),new c(2,16)),new d(22,new c(2,11),new c(2,12))),new m(6,[6,34],new d(18,new c(2,68)),new d(16,new c(4,27)),new d(24,new c(4,19)),new d(28,new c(4,15))),new m(7,[6,22,38],new d(20,new c(2,78)),new d(18,new c(4,31)),new d(18,new c(2,14),new c(4,15)),new d(26,new c(4,13),new c(1,14))),new m(8,[6,24,42],new d(24,new c(2,97)),new d(22,new c(2,38),new c(2,39)),new d(22,new c(4,18),new c(2,19)),new d(26,new c(4,14),new c(2,15))),new m(9,[6,26,46],new d(30,new c(2,116)),new d(22,new c(3,36),new c(2,37)),new d(20,new c(4,16),new c(4,17)),new d(24,new c(4,12),new c(4,13))),new m(10,[6,28,50],new d(18,new c(2,68),new c(2,69)),new d(26,new c(4,43),new c(1,44)),new d(24,new c(6,19),new c(2,20)),new d(28,new c(6,15),new c(2,16))),new m(11,[6,30,54],new d(20,new c(4,81)),new d(30,new c(1,50),new c(4,51)),new d(28,new c(4,22),new c(4,23)),new d(24,new c(3,12),new c(8,13))),new m(12,[6,32,58],new d(24,new c(2,92),new c(2,93)),new d(22,new c(6,36),new c(2,37)),new d(26,new c(4,20),new c(6,21)),new d(28,new c(7,14),new c(4,15))),new m(13,[6,34,62],new d(26,new c(4,107)),new d(22,new c(8,37),new c(1,38)),new d(24,new c(8,20),new c(4,21)),new d(22,new c(12,11),new c(4,12))),new m(14,[6,26,46,66],new d(30,new c(3,115),new c(1,116)),new d(24,new c(4,40),new c(5,41)),new d(20,new c(11,16),new c(5,17)),new d(24,new c(11,12),new c(5,13))),new m(15,[6,26,48,70],new d(22,new c(5,87),new c(1,88)),new d(24,new c(5,41),new c(5,42)),new d(30,new c(5,24),new c(7,25)),new d(24,new c(11,12),new c(7,13))),new m(16,[6,26,50,74],new d(24,new c(5,98),new c(1,99)),new d(28,new c(7,45),new c(3,46)),new d(24,new c(15,19),new c(2,20)),new d(30,new c(3,15),new c(13,16))),new m(17,[6,30,54,78],new d(28,new c(1,107),new c(5,108)),new d(28,new c(10,46),new c(1,47)),new d(28,new c(1,22),new c(15,23)),new d(28,new c(2,14),new c(17,15))),new m(18,[6,30,56,82],new d(30,new c(5,120),new c(1,121)),new d(26,new c(9,43),new c(4,44)),new d(28,new c(17,22),new c(1,23)),new d(28,new c(2,14),new c(19,15))),new m(19,[6,30,58,86],new d(28,new c(3,113),new c(4,114)),new d(26,new c(3,44),new c(11,45)),new d(26,new c(17,21),new c(4,22)),new d(26,new c(9,13),new c(16,14))),new m(20,[6,34,62,90],new d(28,new c(3,107),new c(5,108)),new d(26,new c(3,41),new c(13,42)),new d(30,new c(15,24),new c(5,25)),new d(28,new c(15,15),new c(10,16))),new m(21,[6,28,50,72,94],new d(28,new c(4,116),new c(4,117)),new d(26,new c(17,42)),new d(28,new c(17,22),new c(6,23)),new d(30,new c(19,16),new c(6,17))),new m(22,[6,26,50,74,98],new d(28,new c(2,111),new c(7,112)),new d(28,new c(17,46)),new d(30,new c(7,24),new c(16,25)),new d(24,new c(34,13))),new m(23,[6,30,54,78,102],new d(30,new c(4,121),new c(5,122)),new d(28,new c(4,47),new c(14,48)),new d(30,new c(11,24),new c(14,25)),new d(30,new c(16,15),new c(14,16))),new m(24,[6,28,54,80,106],new d(30,new c(6,117),new c(4,118)),new d(28,new c(6,45),new c(14,46)),new d(30,new c(11,24),new c(16,25)),new d(30,new c(30,16),new c(2,17))),new m(25,[6,32,58,84,110],new d(26,new c(8,106),new c(4,107)),new d(28,new c(8,47),new c(13,48)),new d(30,new c(7,24),new c(22,25)),new d(30,new c(22,15),new c(13,16))),new m(26,[6,30,58,86,114],new d(28,new c(10,114),new c(2,115)),new d(28,new c(19,46),new c(4,47)),new d(28,new c(28,22),new c(6,23)),new d(30,new c(33,16),new c(4,17))),new m(27,[6,34,62,90,118],new d(30,new c(8,122),new c(4,123)),new d(28,new c(22,45),new c(3,46)),new d(30,new c(8,23),new c(26,24)),new d(30,new c(12,15),new c(28,16))),new m(28,[6,26,50,74,98,122],new d(30,new c(3,117),new c(10,118)),new d(28,new c(3,45),new c(23,46)),new d(30,new c(4,24),new c(31,25)),new d(30,new c(11,15),new c(31,16))),new m(29,[6,30,54,78,102,126],new d(30,new c(7,116),new c(7,117)),new d(28,new c(21,45),new c(7,46)),new d(30,new c(1,23),new c(37,24)),new d(30,new c(19,15),new c(26,16))),new m(30,[6,26,52,78,104,130],new d(30,new c(5,115),new c(10,116)),new d(28,new c(19,47),new c(10,48)),new d(30,new c(15,24),new c(25,25)),new d(30,new c(23,15),new c(25,16))),new m(31,[6,30,56,82,108,134],new d(30,new c(13,115),new c(3,116)),new d(28,new c(2,46),new c(29,47)),new d(30,new c(42,24),new c(1,25)),new d(30,new c(23,15),new c(28,16))),new m(32,[6,34,60,86,112,138],new d(30,new c(17,115)),new d(28,new c(10,46),new c(23,47)),new d(30,new c(10,24),new c(35,25)),new d(30,new c(19,15),new c(35,16))),new m(33,[6,30,58,86,114,142],new d(30,new c(17,115),new c(1,116)),new d(28,new c(14,46),new c(21,47)),new d(30,new c(29,24),new c(19,25)),new d(30,new c(11,15),new c(46,16))),new m(34,[6,34,62,90,118,146],new d(30,new c(13,115),new c(6,116)),new d(28,new c(14,46),new c(23,47)),new d(30,new c(44,24),new c(7,25)),new d(30,new c(59,16),new c(1,17))),new m(35,[6,30,54,78,102,126,150],new d(30,new c(12,121),new c(7,122)),new d(28,new c(12,47),new c(26,48)),new d(30,new c(39,24),new c(14,25)),new d(30,new c(22,15),new c(41,16))),new m(36,[6,24,50,76,102,128,154],new d(30,new c(6,121),new c(14,122)),new d(28,new c(6,47),new c(34,48)),new d(30,new c(46,24),new c(10,25)),new d(30,new c(2,15),new c(64,16))),new m(37,[6,28,54,80,106,132,158],new d(30,new c(17,122),new c(4,123)),new d(28,new c(29,46),new c(14,47)),new d(30,new c(49,24),new c(10,25)),new d(30,new c(24,15),new c(46,16))),new m(38,[6,32,58,84,110,136,162],new d(30,new c(4,122),new c(18,123)),new d(28,new c(13,46),new c(32,47)),new d(30,new c(48,24),new c(14,25)),new d(30,new c(42,15),new c(32,16))),new m(39,[6,26,54,82,110,138,166],new d(30,new c(20,117),new c(4,118)),new d(28,new c(40,47),new c(7,48)),new d(30,new c(43,24),new c(22,25)),new d(30,new c(10,15),new c(67,16))),new m(40,[6,30,58,86,114,142,170],new d(30,new c(19,118),new c(6,119)),new d(28,new c(18,47),new c(31,48)),new d(30,new c(34,24),new c(34,25)),new d(30,new c(20,15),new c(61,16)))];/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class y{#E;#A;#v;#k;#O;#M;constructor(e,t){let n=0|t.x,r=0|t.y,i=0|e.x,s=0|e.y,l=Math.abs(r-s)>Math.abs(n-i);l&&([i,s,n,r]=[s,i,r,n]);let w=i<n?1:-1;this.#k=l,this.#v=n+w,this.#E=new o(n,r),this.#A=new o(i,s),this.#O=[w,s<r?1:-1],this.#M=[Math.abs(n-i),Math.abs(r-s)]}*points(){let e=this.#v,t=this.#k,{y:n}=this.#E,[r,i]=this.#O,[s,l]=this.#M,{x:o,y:w}=this.#A,a=0|-s/2;for(let u=o,h=w;u!==e;u+=r)if(yield[t?h:u,t?u:h],(a+=l)>0){if(h===n)break;h+=i,a-=s}}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function p(e,t,n){let r=0,{width:i,height:s}=e,l=(t.x+n.x)/2,a=(t.y+n.y)/2,u=new o(l,a),h=new y(t,u).points();for(let[n,l]of h){if(n<0||l<0||n>=i||l>=s){if(2===r)return w(t,new o(n,l));break}if(1===r==(1===e.get(n,l))){if(2===r)return w(t,new o(n,l));r++}}return NaN}function x(e,t,n){let r=p(e,t,n);if(Number.isNaN(r))return NaN;let{x:i,y:s}=n,{x:l,y:w}=t,a=p(e,t,new o(l-(i-l),w-(s-w)));return Number.isNaN(a)?NaN:r+a-1}function z(e,t,n){let r=new o(0|t.x,0|t.y),i=new o(0|n.x,0|n.y),s=x(e,r,i),l=x(e,i,r);return Number.isNaN(s)?l/7:Number.isNaN(l)?s/7:(s+l)/14}function I(e,t){var n,r,i,s;let l=Math.max((n=h.width(e))>(r=h.width(t))?n/r:r/n,(i=h.height(e))>(s=h.height(t))?i/s:s/i);return l*l}class C{#N;#I;#c;#T;#a;#_;#R;static area(e){let[t,n,r]=e.#_,i=C.bottomRight(e);if(null==e.#N){let s=u(t,n,i),l=u(i,r,t);e.#N=s+l}return e.#N}static moduleSizes(e){if(null==e.#R){let t=e.#c,[n,r,i]=e.#_;e.#R=[z(t,n,r),z(t,n,i)]}return e.#R}static size(t){if(null==t.#I){let n=C.moduleSize(t);t.#I=function(t,n){let[r,i,s]=t,l=w(r,i),o=w(r,s),a=e((l+o)/n/2)+7;switch(3&a){case 0:return a+1;case 2:return a-1;case 3:return Math.min(a+2,177)}return a}(t.#_,n)}return t.#I}static moduleSize(e){return null==e.#a&&(e.#a=n(C.moduleSizes(e))/2),e.#a}static contains(e,t){let n=C.area(e),[r,i,s]=e.#_,l=C.bottomRight(e),o=u(r,i,t),w=u(i,l,t),a=u(l,s,t),h=u(s,r,t);return o+w+a+h-n<1}static bottomRight(e){return null==e.#T&&(e.#T=function(e){let[t,n,r]=e,{x:i,y:s}=t,l=n.x+r.x-i,w=n.y+r.y-s;return new o(l,w)}(e.#_)),e.#T}constructor(e,t){this.#c=e,this.#_=function(e){let t,n,r;let[i,s,l]=e,o=a(i,s)*I(i,s),w=a(i,l)*I(i,l),u=a(s,l)*I(s,l);return u>=o&&u>=w?[t,r,n]=e:w>=u&&w>=o?[r,t,n]=e:[r,n,t]=e,0>function(e,t,n){let{x:r,y:i}=t;return(n.x-r)*(e.y-i)-(n.y-i)*(e.x-r)}(r,t,n)&&([r,n]=[n,r]),[t,n,r]}(t)}get topLeft(){return this.#_[0]}get topRight(){return this.#_[1]}get bottomLeft(){return this.#_[2]}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class S{#c;#D;#P;#d;constructor(e,t,n,r){let i=new f(e,t),s=C.size(n);this.#c=e,this.#d=t,this.#P=n,this.#D=r,this.#c=i.sample(s,s)}get matrix(){return this.#c}get finder(){return this.#P}get alignment(){return this.#D}get size(){return C.size(this.#P)}get moduleSize(){return C.moduleSize(this.#P)}mapping(e,t){return[e,t]=this.#d.mapping(e,t),new o(e,t)}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class E{#B;#U;#F;#Z;#L;#H;#j;#$;#q;constructor(e,t,n,r,i,s,l,o,w){this.#B=e,this.#U=r,this.#F=l,this.#Z=t,this.#L=i,this.#H=o,this.#j=n,this.#$=s,this.#q=w}buildAdjoint(){let e=this.#B,t=this.#U,n=this.#F,r=this.#Z,i=this.#L,s=this.#H,l=this.#j,o=this.#$,w=this.#q;return new E(i*w-s*o,s*l-r*w,r*o-i*l,n*o-t*w,e*w-n*l,t*l-e*o,t*s-n*i,n*r-e*s,e*i-t*r)}times(e){let t=this.#B,n=this.#U,r=this.#F,i=this.#Z,s=this.#L,l=this.#H,o=this.#j,w=this.#$,a=this.#q,u=e.#B,h=e.#U,f=e.#F,c=e.#Z,d=e.#L,g=e.#H,m=e.#j,b=e.#$,y=e.#q;return new E(t*u+i*h+o*f,t*c+i*d+o*g,t*m+i*b+o*y,n*u+s*h+w*f,n*c+s*d+w*g,n*m+s*b+w*y,r*u+l*h+a*f,r*c+l*d+a*g,r*m+l*b+a*y)}mapping(e,t){let n=this.#B,r=this.#U,i=this.#F,s=this.#Z,l=this.#L,o=this.#H,w=this.#j,a=this.#$,u=this.#q,h=i*e+o*t+u;return[(n*e+s*t+w)/h,(r*e+l*t+a)/h]}}function A(e,t,n,r,i,s,l,o){let w=e-n+i-l,a=t-r+s-o;if(0===w&&0===a)return new E(n-e,i-n,e,r-t,s-r,t,0,0,1);{let u=n-i,h=l-i,f=r-s,c=o-s,d=u*c-h*f,g=(w*c-h*a)/d,m=(u*a-w*f)/d;return new E(n-e+g*n,l-e+m*l,e,r-t+g*r,o-t+m*o,t,g,m,1)}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function v(e,t){let n,r,i,s;let{x:l,y:o}=e.topLeft,{x:w,y:a}=e.topRight,{x:u,y:h}=e.bottomLeft,f=C.size(e)-3.5;return null!=t?(n=t.x,r=t.y,s=i=f-3):(n=w+u-l,r=a+h-o,i=f,s=f),function(e,t,n,r,i,s,l,o,w,a,u,h,f,c,d,g){let m=A(3.5,3.5,n,3.5,i,s,3.5,o).buildAdjoint(),b=A(w,a,u,h,f,c,d,g);return b.times(m)}(0,0,f,0,i,s,0,f,l,o,w,a,n,r,u,h)}function k(e,t){let[n,,r]=h.rect(e);return t>0?r:t<0?n:e.x}function O(e,t){let[,n,,r]=h.rect(e);return t>0?r:t<0?n:e.y}function M(e,t,n,r){let{x:i,y:s}=t,{x:l,y:w}=e,{x:a,y:u}=n,h=a>i?1:a<i?-1:0,f=u>s?1:u<s?-1:0,c=k(t,h),d=O(t,f),g=k(e,h),m=O(e,f);return 0===h||0===f?[new o(g,m),new o(c,d)]:(r?h===f:h!==f)?[new o(l,m),new o(i,d)]:[new o(g,w),new o(c,s)]}function N(e,t,n,r){let i=r+8,s=new y(t,n).points(),l=1,o=e.get(0|t.x,0|t.y);for(let[t,n]of s){let r=e.get(t,n);if(r!==o&&(l++,o=r,l>i))return!1}return l>=r-14-Math.max(2,(r-17)/4)}function T(e,t,n){let{topLeft:r,topRight:i,bottomLeft:s}=t,[l,o]=n?M(r,s,i,!0):M(r,i,s);return N(e,l,o,C.size(t))}function _(e,t,n,r){let[i,s]=t.mapping(r?6.5:7.5,r?7.5:6.5),[l,w]=t.mapping(r?6.5:n-7.5,r?n-7.5:6.5);return N(e,new o(i,s),new o(l,w),n)}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class R{#G;#h;constructor(e){this.#h=e,this.#G=n(e)}get modules(){return this.#G}get ratios(){return this.#h}}let D=new R([1,1,3,1,1]),P=new R([1,1,1,1,1]),B=new R([1,1,1]);function U(e,t){let{length:n}=e,r=n-1;for(let t=0;t<r;t++)e[t]=e[t+1];e[r]=t}function F(e,t,n,r,i){let s=-1,l=t|=0,o=n|=0,w=[0,0,0,0,0],{width:a,height:u}=e,h=i?-1:1,f=()=>{l+=s,o-=s*h},c=()=>e.get(l,o);for(;l>=0&&o>=0&&o<u&&c();)f(),w[2]++;for(;l>=0&&o>=0&&o<u&&!c();)f(),w[1]++;for(;l>=0&&o>=0&&o<u&&w[0]<r&&c();)f(),w[0]++;for(l=t+(s=1),o=n-s*h;l<a&&o>=0&&o<u&&c();)f(),w[2]++;for(;l<a&&o>=0&&o<u&&!c();)f(),w[3]++;for(;l<a&&o>=0&&o<u&&w[4]<r&&c();)f(),w[4]++;return w}function Z(e,t){let r=[],i=0|e.length/2;for(let t=0;t<=i;t++){let s=i+t+1;r.push(n(e,i-t,s)/2+n(e,s))}return t-(2*r[0]+n(r,1))/(i+2)}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let L=Math.PI/180,H=40*L,j=140*L;function $(e,t,n,r,i,s){let[l,o]=function(e,t,n,r,i){t|=0,n|=0;let s=i?n:t,l=[0,0,0,0,0],o=i?e.height:e.width,w=()=>i?e.get(t,s):e.get(s,n);for(;s>=0&&w();)s--,l[2]++;for(;s>=0&&!w();)s--,l[1]++;for(;s>=0&&l[0]<r&&w();)s--,l[0]++;for(s=(i?n:t)+1;s<o&&w();)s++,l[2]++;for(;s<o&&!w();)s++,l[3]++;for(;s<o&&l[4]<r&&w();)s++,l[4]++;return[l,s]}(e,t,n,r,s);return[G(l,i)?Z(l,o):NaN,l]}function q(e,t,n){return e>t&&([e,t]=[t,e]),t-e<=t*n}function G(e,t){let{ratios:n,modules:r}=t,{length:i}=e,s=function(e){let t=0;for(let n of e){if(0===n)return NaN;t+=n}return t}(e);if(s>=r){let t=s/r,l=.625*t+.5;for(let r=0;r<i;r++){let i=n[r],s=e[r],o=Math.abs(s-t*i);if(o>l)return!1}return!0}return!1}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class J{#J;#c;#h;#_=[];constructor(e,t,n){this.#c=e,this.#h=t,this.#J=n}get matrix(){return this.#c}get patterns(){return this.#_}match(e,t,r,i){let s=this.#c,l=this.#h,o=Z(r,e),[w,a]=$(s,o,t,i,l,!0);if(w>=0){let e;if([o,e]=$(s,o,w,i,l),o>=0){let t=F(s,o,w,i),r=F(s,o,w,i,!0);if(this.#J?G(t,l)&&G(r,l):G(t,l)||G(r,l)){let i=function(e){for(var t=arguments.length,r=Array(t>1?t-1:0),i=1;i<t;i++)r[i-1]=arguments[i];let s=0,l=0,{length:o}=r,w=[];for(let t of r){let[r,i]=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t){let{ratios:r,modules:i}=t,s=0,{length:l}=r,o=n(e),w=o/i;for(let t=0;t<l;t++)s+=Math.abs(e[t]-r[t]*w);return[s/o,w]}(t,e);s+=r,w.push(i)}let a=n(w),u=a/o;for(let e of w)l+=Math.abs(e-u);return s+l/a}(l,e,a,t,r),s=n(e),u=n(a),f=this.#_,{length:c}=f,d=!1;for(let e=0;e<c;e++){let t=f[e];if(h.equals(t,o,w,s,u)){d=!0,f[e]=h.combine(t,o,w,s,u,i);break}}d||f.push(new h(l,o,w,s,u,i))}}}}}class K extends J{constructor(e,t){super(e,D,t)}*groups(){let t=this.patterns.filter(e=>h.combined(e)>=3&&1.5>=h.noise(e)),{length:n}=t;if(3===n){let e=new C(this.matrix,t),n=C.size(e);n>=21&&n<=177&&(yield e)}else if(n>3){let r=n-2,i=n-1,s=new Map;for(let l=0;l<r;l++){let r=t[l],o=r.moduleSize;if(!s.has(r))for(let a=l+1;a<i;a++){let i=t[a],l=i.moduleSize;if(s.has(r))break;if(!s.has(i)&&q(o,l,.5))for(let u=a+1;u<n;u++){let n=t[u],a=n.moduleSize;if(s.has(r)||s.has(i))break;if(!q(o,a,.5)||!q(l,a,.5))continue;let{matrix:f}=this,c=new C(f,[r,i,n]),d=function(e){let{topLeft:t,topRight:n,bottomLeft:r}=e,{x:i,y:s}=t,l=n.x-i,o=n.y-s,w=r.x-i,a=r.y-s;return Math.acos((l*w+o*a)/Math.sqrt((l*l+o*o)*(w*w+a*a)))}(c);if(d>=H&&d<=j){let[l,o]=C.moduleSizes(c);if(l>=1&&o>=1){let{topLeft:a,topRight:u,bottomLeft:d}=c,g=w(a,u),m=w(a,d),b=e(g/l),y=e(m/o);if(4>=Math.abs(b-y)){let e=C.size(c);e>=21&&e<=177&&!/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t,n){let r=0,{topLeft:i,topRight:s,bottomLeft:l}=e;for(let o of t)if(o!==i&&o!==s&&o!==l){let t;if(n.has(o)&&(t=C.contains(e,o))||1>h.noise(o)&&(null==t?C.contains(e,o):t)&&++r>3)return!0}return!1}(c,t,s)&&(T(f,c)||T(f,c,!0))&&(yield c)&&(s.set(r,!0),s.set(i,!0),s.set(n,!0))}}}}}}}}find(e,t,n,r){let{matrix:i}=this,s=e+n,l=t+r,o=(e,t,n,r,i,s)=>{U(n,r),U(i,s),1===i[0]&&0===i[1]&&1===i[2]&&0===i[3]&&1===i[4]&&G(n,D)&&this.match(e,t,n,n[2])};for(let n=t;n<l;n++){let t=e;for(;t<s&&!i.get(t,n);)t++;let r=0,l=i.get(t,n),w=[0,0,0,0,0],a=[-1,-1,-1,-1,-1];for(;t<s;){let e=i.get(t,n);e===l?r++:(o(t,n,w,r,a,l),r=1,l=e),t++}o(t,n,w,r,a,l)}}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class Q extends J{constructor(e,t){super(e,P,t)}filter(e,t){let n=this.patterns.filter(e=>2.5>=h.noise(e)&&q(e.moduleSize,t,.5));n.length>1&&n.sort((n,r)=>{let i=h.noise(n),s=h.noise(r),l=Math.abs(n.moduleSize-t),o=Math.abs(r.moduleSize-t),a=(w(n,e)+l)*i,u=(w(r,e)+o)*s;return a-u});let r=n.slice(0,2);return r.push(e),r}find(e,t,n,r){let{matrix:i}=this,s=e+n,l=t+r,o=(e,t,n,r,i,s)=>{U(n,r),U(i,s),0===i[0]&&1===i[1]&&0===i[2]&&G(n,B)&&this.match(e,t,n,n[1])};for(let n=t;n<l;n++){let t=e;for(;t<s&&!i.get(t,n);)t++;let r=0,l=i.get(t,n),w=[0,0,0],a=[-1,-1,-1];for(;t<s;){let e=i.get(t,n);e===l?r++:(o(t,n,w,r,a,l),r=1,l=e),t++}o(t,n,w,r,a,l)}}}class V{#K;constructor(e={}){this.#K=e}*detect(e){let{strict:t}=this.#K,{width:n,height:r}=e,i=new K(e,t);i.find(0,0,n,r);let s=i.groups(),l=s.next();for(;!l.done;){let n=!1,r=l.value,i=C.size(r);if(i>=25){let s=function(e,t,n){let r=C.size(t),i=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e){let{x:t,y:n}=e.topLeft,r=C.size(e),i=1-3/(r-7),s=C.bottomRight(e),[l,o]=C.moduleSizes(e),w=t+(s.x-t)*i,a=n+(s.y-n)*i;return new h(P,w,a,5*l,5*o,0)}(t),s=new Q(e,n),l=C.moduleSize(t),{x:o,y:w}=i,a=Math.ceil(l*Math.min(20,0|r/4)),u=0|Math.max(0,w-a),f=0|Math.max(0,o-a),c=0|Math.min(e.width-1,o+a),d=0|Math.min(e.height-1,w+a);return s.find(f,u,c-f,d-u),s.filter(i,l)}(e,r,t);for(let t of s){let s=v(r,t);if(_(e,s,i)&&_(e,s,i,!0)&&(n=yield new S(e,s,r,t)))break}}else{let t=v(r);_(e,t,i)&&_(e,t,i,!0)&&(n=yield new S(e,t,r))}l=s.next(n)}}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class Y{#Q;#V;#Y;#C;#W;#X;constructor(e,t,{mask:n,level:r},i,s){this.#Q=n,this.#V=r,this.#Y=s,this.#C=t,this.#X=e,this.#W=i}get mask(){return this.#Q}get level(){return this.#V.name}get version(){return this.#C.version}get mirror(){return this.#Y}get content(){return this.#X.content}get corrected(){return this.#W}get symbology(){return this.#X.symbology}get fnc1(){return this.#X.fnc1}get codewords(){return this.#X.codewords}get structured(){return this.#X.structured}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class W{#ee;#et;#en;constructor(e){this.#ee=e,this.#et=0,this.#en=0}get bitOffset(){return this.#et}get byteOffset(){return this.#en}read(e){let t=0,n=this.#et,r=this.#en,i=this.#ee;if(n>0){let s=8-n,l=Math.min(e,s),o=s-l;e-=l,n+=l,t=(i[r]&255>>8-l<<o)>>o,8===n&&(r++,n=0)}if(e>0){for(;e>=8;)e-=8,t=t<<8|255&i[r++];if(e>0){let s=8-e;n+=e,t=t<<e|(i[r]&255>>s<<s)>>s}}return this.#et=n,this.#en=r,t}available(){return 8*(this.#ee.length-this.#en)-this.#et}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let X=new Map;class ee{#r;#er;static TERMINATOR=new ee([0,0,0],0);static NUMERIC=new ee([10,12,14],1);static ALPHANUMERIC=new ee([9,11,13],2);static STRUCTURED_APPEND=new ee([0,0,0],3);static BYTE=new ee([8,16,16],4);static ECI=new ee([0,0,0],7);static KANJI=new ee([8,10,12],8);static FNC1_FIRST_POSITION=new ee([0,0,0],5);static FNC1_SECOND_POSITION=new ee([0,0,0],9);static HANZI=new ee([8,10,12],13);constructor(e,t){this.#r=t,this.#er=new Int32Array(e),X.set(t,this)}get bits(){return this.#r}getCharacterCountBits(e){let{version:t}=e;return this.#er[t<=9?0:t<=26?1:2]}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let et=new Map;class en{#ei;#es;static CP437=new en("cp437",0,2);static ISO_8859_1=new en("iso-8859-1",1,3);static ISO_8859_2=new en("iso-8859-2",4);static ISO_8859_3=new en("iso-8859-3",5);static ISO_8859_4=new en("iso-8859-4",6);static ISO_8859_5=new en("iso-8859-5",7);static ISO_8859_6=new en("iso-8859-6",8);static ISO_8859_7=new en("iso-8859-7",9);static ISO_8859_8=new en("iso-8859-8",10);static ISO_8859_9=new en("iso-8859-9",11);static ISO_8859_10=new en("iso-8859-10",12);static ISO_8859_11=new en("iso-8859-11",13);static ISO_8859_13=new en("iso-8859-13",15);static ISO_8859_14=new en("iso-8859-14",16);static ISO_8859_15=new en("iso-8859-15",17);static ISO_8859_16=new en("iso-8859-16",18);static SJIS=new en("sjis",20);static CP1250=new en("cp1250",21);static CP1251=new en("cp1251",22);static CP1252=new en("cp1252",23);static CP1256=new en("cp1256",24);static UTF_16BE=new en("utf-16be",25);static UTF_8=new en("utf-8",26);static ASCII=new en("ascii",27,170);static BIG5=new en("big5",28);static GB18030=new en("gb18030",29);static EUC_KR=new en("euc-kr",30);constructor(e,...t){for(let n of(this.#ei=e,this.#es=t,t))et.set(n,this)}get label(){return this.#ei}get values(){return this.#es}}function er(e,t){return new TextDecoder(t.label).decode(e)}let ei="0123456789",es=`${ei}ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:`;function el(e){return e.replace(/%+/g,e=>{let t=1&e.length;return e=e.replace(/%%/g,"%"),t?e.replace(/%$/,"\x1d"):e})}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let eo=new Map;class ew{#el;#r;#V;static L=new ew("L",0,1);static M=new ew("M",1,0);static Q=new ew("Q",2,3);static H=new ew("H",3,2);constructor(e,t,n){this.#r=n,this.#el=e,this.#V=t,eo.set(n,this)}get bits(){return this.#r}get name(){return this.#el}get level(){return this.#V}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let ea=[[21522,0],[20773,1],[24188,2],[23371,3],[17913,4],[16590,5],[20375,6],[19104,7],[30660,8],[29427,9],[32170,10],[30877,11],[26159,12],[25368,13],[27713,14],[26998,15],[5769,16],[5054,17],[7399,18],[6608,19],[1890,20],[597,21],[3340,22],[2107,23],[13663,24],[12392,25],[16177,26],[14854,27],[9396,28],[8579,29],[11994,30],[11245,31]];class eu{#Q;#V;constructor(e){this.#Q=7&e,this.#V=function(e){let t=eo.get(e);if(null!=t)return t;throw Error("illegal error correction bits")}(e>>3&3)}get mask(){return this.#Q}get level(){return this.#V}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function eh(e,t,n,r){return e.get(t,n)?r<<1|1:r<<1}class ef{#I;#c;constructor(e){let{width:t,height:n}=e;this.#c=e.clone(),this.#I=Math.min(t,n)}readVersion(){let e=this.#I,n=0|(e-17)/4;if(n<1)throw Error("illegal version");if(n<=6)return b[n-1];let r=0,i=0,s=e-11,l=this.#c;for(let t=5;t>=0;t--)for(let n=e-9;n>=s;n--)r=eh(l,n,t,r);for(let t=5;t>=0;t--)for(let n=e-9;n>=s;n--)i=eh(l,t,n,i);let o=function(e,n){let r=32,i=0,{length:s}=g;for(let l=0;l<s;l++){let s=g[l];if(e===s||n===s)return b[l+6];let o=t(e^s);o<r&&(r=o,i=l+7),e!==n&&(o=t(n^s))<r&&(r=o,i=l+7)}if(r<=3&&i>=7)return b[i-1];throw Error("unable to decode version")}(r,i);if(o.size>e)throw Error("matrix size too small for version");return o}readFormatInfo(){let e=0,n=0,r=this.#c,i=this.#I,s=i-7;for(let t=0;t<=8;t++)6!==t&&(e=eh(r,t,8,e));for(let t=7;t>=0;t--)6!==t&&(e=eh(r,8,t,e));for(let e=i-1;e>=s;e--)n=eh(r,8,e,n);for(let e=i-8;e<i;e++)n=eh(r,e,8,n);return function(e,n){let r=32,i=0;for(let[s,l]of ea){if(e===s||n===s)return new eu(l);let o=t(e^s);o<r&&(r=o,i=l),e!==n&&(o=t(n^s))<r&&(r=o,i=l)}if(r<=3)return new eu(i);throw Error("unable to decode format information")}(e,n)}readCodewords(e,t){let n=0,i=0,s=0,l=!0,o=this.#I,w=this.#c,a=e.getECBlocks(t),u=function(e){let{size:t,version:n,alignmentPatterns:i}=e,{length:s}=i,l=new r(t,t),o=s-1;l.setRegion(0,0,9,9),l.setRegion(t-8,0,8,9),l.setRegion(0,t-8,9,8);for(let e=0;e<s;e++){let t=i[e]-2;for(let n=0;n<s;n++)(0!==e||0!==n&&n!==o)&&(e!==o||0!==n)&&l.setRegion(i[n]-2,t,5,5)}return l.setRegion(6,9,1,t-17),l.setRegion(9,6,t-17,1),n>6&&(l.setRegion(t-11,0,3,6),l.setRegion(0,t-11,6,3)),l}(e),h=new Uint8Array(a.numTotalCodewords);for(let e=o-1;e>0;e-=2){6===e&&e--;for(let t=0;t<o;t++){let r=l?o-1-t:t;for(let t=0;t<2;t++){let l=e-t;u.get(l,r)||(n++,s<<=1,w.get(l,r)&&(s|=1),8!==n||(h[i++]=s,n=0,s=0))}}l=!l}if(i!==a.numTotalCodewords)throw Error("illegal codewords length");return h}unmask(e){let t=this.#I,n=this.#c;for(let r=0;r<t;r++)for(let i=0;i<t;i++)(function(e,t,n){let r,i;switch(e){case 0:i=n+t&1;break;case 1:i=1&n;break;case 2:i=t%3;break;case 3:i=(n+t)%3;break;case 4:i=(0|n/2)+(0|t/3)&1;break;case 5:i=(1&(r=n*t))+r%3;break;case 6:i=(1&(r=n*t))+r%3&1;break;case 7:i=n*t%3+(n+t&1)&1;break;default:throw Error(`illegal mask: ${e}`)}return 0===i})(e,i,r)&&n.flip(i,r)}remask(e){this.unmask(e)}mirror(){let e=this.#I,t=this.#c;for(let n=0;n<e;n++)for(let r=n+1;r<e;r++)t.get(n,r)!==t.get(r,n)&&(t.flip(n,r),t.flip(r,n))}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class ec{#eo;#m;constructor(e,t){this.#eo=e,this.#m=t}get codewords(){return this.#eo}get numDataCodewords(){return this.#m}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class ed{#ew;#ea;constructor(e,t){let{length:n}=t;if(n<=0)throw Error("polynomial coefficients cannot empty");if(this.#ew=e,n>1&&0===t[0]){let e=1;for(;e<n&&0===t[e];)e++;if(e===n)this.#ea=new Int32Array([0]);else{let r=new Int32Array(n-e);r.set(t.subarray(e)),this.#ea=r}}else this.#ea=t}get coefficients(){return this.#ea}isZero(){return 0===this.#ea[0]}getDegree(){return this.#ea.length-1}getCoefficient(e){let t=this.#ea;return t[t.length-1-e]}evaluate(e){let t;if(0===e)return this.getCoefficient(0);let n=this.#ea;if(1===e){for(let e of(t=0,n))t^=e;return t}[t]=n;let r=this.#ew,{length:i}=n;for(let s=1;s<i;s++)t=r.multiply(e,t)^n[s];return t}multiply(e){let t=this.#ew,n=this.#ea,{length:r}=n;if(e instanceof ed){if(this.isZero()||e.isZero())return t.zero;let i=e.#ea,s=i.length,l=new Int32Array(r+s-1);for(let e=0;e<r;e++){let r=n[e];for(let n=0;n<s;n++)l[e+n]^=t.multiply(r,i[n])}return new ed(t,l)}if(0===e)return t.zero;if(1===e)return this;let i=new Int32Array(r);for(let s=0;s<r;s++)i[s]=t.multiply(n[s],e);return new ed(t,i)}multiplyByMonomial(e,t){let n=this.#ew;if(0===t)return n.zero;let r=this.#ea,{length:i}=r,s=new Int32Array(i+e);for(let e=0;e<i;e++)s[e]=n.multiply(r[e],t);return new ed(n,s)}addOrSubtract(e){if(this.isZero())return e;if(e.isZero())return this;let t=e.#ea,n=t.length,r=this.#ea,i=r.length;n<i&&([n,i]=[i,n],[t,r]=[r,t]);let s=n-i,l=new Int32Array(n);l.set(t.subarray(0,s));for(let e=s;e<n;e++)l[e]=r[e-s]^t[e];return new ed(this.#ew,l)}divide(e){let t=this.#ew,n=t.zero,r=this,i=e.getCoefficient(e.getDegree()),s=t.invert(i);for(;r.getDegree()>=e.getDegree()&&!r.isZero();){let i=r.getDegree(),l=i-e.getDegree(),o=t.multiply(r.getCoefficient(i),s),w=e.multiplyByMonomial(l,o),a=t.buildPolynomial(l,o);n=n.addOrSubtract(a),r=r.addOrSubtract(w)}return[n,r]}}let eg=new /**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class{#I;#eu;#eh;#ef;#ec;#ed;constructor(e,t,n){let r=1,i=new Int32Array(t);for(let n=0;n<t;n++)i[n]=r,(r*=2)>=t&&(r^=e,r&=t-1);let s=new Int32Array(t);for(let e=0,n=t-1;e<n;e++)s[i[e]]=e;this.#I=t,this.#ec=i,this.#ed=s,this.#ef=n,this.#eu=new ed(this,new Int32Array([1])),this.#eh=new ed(this,new Int32Array([0]))}get size(){return this.#I}get one(){return this.#eu}get zero(){return this.#eh}get generator(){return this.#ef}exp(e){return this.#ec[e]}log(e){return this.#ed[e]}invert(e){return this.#ec[this.#I-this.#ed[e]-1]}multiply(e,t){if(0===e||0===t)return 0;let n=this.#ed;return this.#ec[(n[e]+n[t])%(this.#I-1)]}buildPolynomial(e,t){if(0===t)return this.#eh;let n=new Int32Array(e+1);return n[0]=t,new ed(this,n)}}(285,256,0);class em{#ew;constructor(e=eg){this.#ew=e}decode(e,t){let n=!0,r=this.#ew,{generator:i}=r,s=new ed(r,e),l=new Int32Array(t);for(let e=0;e<t;e++){let o=s.evaluate(r.exp(e+i));l[t-1-e]=o,0!==o&&(n=!1)}if(!n){let n=new ed(r,l),[i,s]=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t,n,r){t.getDegree()<n.getDegree()&&([t,n]=[n,t]);let i=n,s=e.one,l=t,o=e.zero;for(;2*i.getDegree()>=r;){let t=o,n=l;if(o=s,(l=i).isZero())throw Error("remainder last was zero");i=n;let r=e.zero,w=i.getDegree(),a=l.getDegree(),u=l.getCoefficient(a),h=e.invert(u);for(;w>=a&&!i.isZero();){let t=i.getDegree()-a,n=e.multiply(i.getCoefficient(w),h);r=r.addOrSubtract(e.buildPolynomial(t,n)),w=(i=i.addOrSubtract(l.multiplyByMonomial(t,n))).getDegree()}if(s=r.multiply(o).addOrSubtract(t),w>=a)throw Error("division algorithm failed to reduce polynomial")}let w=s.getCoefficient(0);if(0===w)throw Error("sigma tilde(0) was zero");let a=e.invert(w),u=s.multiply(a),h=i.multiply(a);return[u,h]}(r,r.buildPolynomial(t,1),n,t),o=function(e,t){let n=t.getDegree();if(1===n)return new Int32Array([t.getCoefficient(1)]);let r=0,{size:i}=e,s=new Int32Array(n);for(let l=1;l<i&&r<n;l++)0===t.evaluate(l)&&(s[r++]=e.invert(l));if(r!==n)throw Error("error locator degree does not match number of roots");return s}(r,i),w=function(e,t,n){let{length:r}=n,i=new Int32Array(r);for(let s=0;s<r;s++){let l=1,o=e.invert(n[s]);for(let t=0;t<r;t++)if(s!==t){let r=e.multiply(n[t],o),i=(1&r)==0?1|r:-2&r;l=e.multiply(l,i)}i[s]=e.multiply(t.evaluate(o),e.invert(l)),0!==e.generator&&(i[s]=e.multiply(i[s],o))}return i}(r,s,o),a=o.length,u=e.length;for(let t=0;t<a;t++){let n=u-1-r.log(o[t]);if(n<0)throw Error("bad error location");e[n]=e[n]^w[t]}return a}return 0}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function eb(e,t,n){let{mask:r,level:i}=n,s=0,l=0;e.unmask(r);let o=t.getECBlocks(i),w=e.readCodewords(t,i),a=function(e,t,n){let{ecBlocks:r,numTotalCodewords:i,numECCodewordsPerBlock:s}=t.getECBlocks(n);if(e.length!==i)throw Error("failed to get data blocks");let l=[];for(let{count:e,numDataCodewords:t}of r)for(let n=0;n<e;n++){let e=s+t;l.push(new ec(new Uint8Array(e),t))}let{length:o}=l,w=o-1,a=l[0].codewords.length;for(;w>=0;){let e=l[w].codewords.length;if(e===a)break;w--}w++;let u=0,h=a-s;for(let t=0;t<h;t++)for(let n=0;n<o;n++)l[n].codewords[t]=e[u++];for(let t=w;t<o;t++)l[t].codewords[h]=e[u++];let f=l[0].codewords.length;for(let t=h;t<f;t++)for(let n=0;n<o;n++){let r=n<w?t:t+1;l[n].codewords[r]=e[u++]}return l}(w,t,i),u=new Uint8Array(o.numTotalDataCodewords);for(let{codewords:e,numDataCodewords:t}of a){let[n,r]=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t){let n=new Int32Array(e),r=e.length-t,i=new em().decode(n,r);return[n,i]}(e,t);u.set(n.subarray(0,t),s),l+=r,s+=t}return[u,l]}class ey{#eg;constructor({decode:e=er}={}){this.#eg=e}decode(e){let t,n,r,i=0,s=!1,l=new ef(e);try{t=l.readVersion(),r=l.readFormatInfo(),[n,i]=eb(l,t,r)}catch{null!=r&&l.remask(r.mask),l.mirror(),s=!0,t=l.readVersion(),r=l.readFormatInfo(),[n,i]=eb(l,t,r)}return new Y(function(e,t,n,r){let i,s,l,{}=n,o="",w=-1,a=!1,u=!1,h=!1,f=!1,c=new W(e);do switch(s=4>c.available()?ee.TERMINATOR:function(e){let t=X.get(e);if(null!=t)return t;throw Error("illegal mode bits")}(c.read(4))){case ee.TERMINATOR:break;case ee.FNC1_FIRST_POSITION:a=!0;break;case ee.FNC1_SECOND_POSITION:u=!0,w=c.read(8);break;case ee.STRUCTURED_APPEND:if(16>c.available())throw Error("illegal structured append");f=Object.freeze({index:c.read(4),parity:c.read(8),count:c.read(4)+1});break;case ee.ECI:l=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e){let t=e.read(8);if((128&t)==0)return 127&t;if((192&t)==128){let n=e.read(8);return(63&t)<<8|n}if((224&t)==192){let n=e.read(16);return(31&t)<<16|n}throw Error("illegal eci value")}(c);break;default:if(s===ee.HANZI){let e=c.read(4);if(1!==e)throw Error("illegal hanzi subset")}let d=c.read(s.getCharacterCountBits(t));switch(s){case ee.ALPHANUMERIC:o+=function(e,t,n){let r="";for(;t>1;){if(11>e.available())throw Error("illegal bits length");let n=e.read(11);r+=es.charAt(n/45)+es.charAt(n%45),t-=2}if(1===t){if(6>e.available())throw Error("illegal bits length");r+=es.charAt(e.read(6))}return n?el(r):r}(c,d,a||u);break;case ee.BYTE:o+=function(e,t,n,r,i){if(e.available()<8*t)throw Error("illegal bits length");let s=new Uint8Array(t),l=null!=i?function(e){let t=et.get(e);if(t)return t;throw Error("illegal charset value")}(i):en.ISO_8859_1;for(let n=0;n<t;n++)s[n]=e.read(8);let o=n(s,l);return r?el(o):o}(c,d,r,a||u,l);break;case ee.HANZI:o+=function(e,t){if(e.available()<13*t)throw Error("illegal bits length");let n=0,r=new Uint8Array(2*t);for(;t>0;){let i=e.read(13),s=i/96<<8|i%96;s<2560?s+=41377:s+=42657,r[n]=s>>8&255,r[n+1]=255&s,t--,n+=2}return new TextDecoder("gb2312").decode(r)}(c,d);break;case ee.KANJI:o+=function(e,t){if(e.available()<13*t)throw Error("illegal bits length");let n=0,r=new Uint8Array(2*t);for(;t>0;){let i=e.read(13),s=i/192<<8|i%192;s<7936?s+=33088:s+=49472,r[n]=s>>8&255,r[n+1]=255&s,t--,n+=2}return new TextDecoder("shift-jis").decode(r)}(c,d);break;case ee.NUMERIC:o+=function(e,t){let n="";for(;t>=3;){if(10>e.available())throw Error("illegal bits length");let r=e.read(10);if(r>=1e3)throw Error("illegal numeric codeword");n+=ei.charAt(r/100)+ei.charAt(r/10%10)+ei.charAt(r%10),t-=3}if(2===t){if(7>e.available())throw Error("illegal bits length");let t=e.read(7);if(t>=100)throw Error("illegal numeric codeword");n+=ei.charAt(t/10)+ei.charAt(t%10)}else if(1===t){if(4>e.available())throw Error("illegal bits length");let t=e.read(4);if(t>=10)throw Error("illegal numeric codeword");n+=ei.charAt(t)}return n}(c,d);break;default:throw Error("")}}while(s!==ee.TERMINATOR);return a?h=Object.freeze(["GS1"]):u&&(h=Object.freeze(["AIM",w])),i=null!=l?a?4:u?6:2:a?3:u?5:1,{content:o,codewords:e,structured:f,symbology:`]Q${i}`,fnc1:h}}(n,t,r,this.#eg),t,r,i,s)}}function ep(e){return{x:e.x,y:e.y}}function ex(e){return{x:e.x,y:e.y,moduleSize:e.moduleSize}}self.addEventListener("message",async e=>{let{data:t}=e,{uid:n,image:o}=t,{width:w,height:a}=o,u=new OffscreenCanvas(w,a),h=u.getContext("2d");h.drawImage(o,0,0);let f=function(e){let{data:t,width:n,height:r}=e,i=new Uint8Array(n*r);for(let e=0;e<r;e++){let r=e*n;for(let e=0;e<n;e++){let n=r+e,s=4*n,l=t[s],o=t[s+1],w=t[s+2];i[r+e]=306*l+601*o+117*w+512>>10}}return i}(h.getImageData(0,0,w,a)),c=function(e,t,n){if(e.length!==t*n)throw Error("luminances length must be equals to width * height");return t<40||n<40?function(e,t,n){let i=new r(t,n),s=new Int32Array(32);for(let r=1;r<5;r++){let i=0|4*t/5,l=(0|n*r/5)*t;for(let n=0|t/5;n<i;n++){let t=e[l+n];s[t>>3]++}}let l=function(e){let t=0,n=0,r=0,{length:i}=e;for(let s=0;s<i;s++)e[s]>n&&(t=s,n=e[s]),e[s]>r&&(r=e[s]);let s=0,l=0;for(let n=0;n<i;n++){let r=n-t,i=e[n]*r*r;i>l&&(s=n,l=i)}if(t>s&&([t,s]=[s,t]),s-t<=2)return -1;let o=-1,w=s-1;for(let n=s-1;n>t;n--){let i=n-t,l=i*i*(s-n)*(r-e[n]);l>o&&(w=n,o=l)}return w<<3}(s);if(l>0)for(let r=0;r<n;r++){let n=r*t;for(let s=0;s<t;s++){let t=e[n+s];t<l&&i.set(s,r)}}return i}(e,t,n):function(e,t,n){let o=t-8,w=n-8,a=i(t),u=i(n),h=new r(t,n),f=function(e,t,n){let r=[],s=t-8,o=n-8,w=i(t),a=i(n);for(let n=0;n<a;n++){r[n]=new Int32Array(w);let i=l(n,o);for(let o=0;o<w;o++){let w=0,a=0,u=255,h=l(o,s);for(let n=0,r=i*t+h;n<8;n++,r+=t){for(let t=0;t<8;t++){let n=e[r+t];w+=n,n<u&&(u=n),n>a&&(a=n)}if(a-u>24)for(n++,r+=t;n<8;n++,r+=t)for(let t=0;t<8;t++)w+=e[r+t]}let f=w>>6;if(a-u<=24&&(f=u/2,n>0&&o>0)){let e=(r[n-1][o]+2*r[n][o-1]+r[n-1][o-1])/4;u<e&&(f=e)}r[n][o]=f}}return r}(e,t,n);for(let n=0;n<u;n++){let r=s(n,u-3),i=l(n,w);for(let n=0;n<a;n++){let w=0,u=s(n,a-3),c=l(n,o);for(let e=-2;e<=2;e++){let t=f[r+e];w+=t[u-2]+t[u-1]+t[u]+t[u+1]+t[u+2]}let d=w/25;for(let n=0,r=i*t+c;n<8;n++,r+=t)for(let t=0;t<8;t++)e[r+t]<=d&&h.set(c+t,i+n)}}return h}(e,t,n)}(f,w,a);t.invert&&c.flip();let d=new V({strict:t.strict}),g=d.detect(c),m=[],b=new ey,y=g.next();for(;!y.done;){let e=!1,t=y.value;try{let{size:n,finder:r,alignment:i}=t,s=b.decode(t.matrix),{topLeft:l,topRight:o,bottomLeft:w}=r,a=t.mapping(0,0),u=t.mapping(n,0),h=t.mapping(n,n),f=t.mapping(0,n),c=t.mapping(6.5,6.5),d=t.mapping(n-6.5,6.5),g=t.mapping(6.5,n-6.5);m.push({content:s.content,alignment:i?ex(i):null,finder:[ex(l),ex(o),ex(w)],timing:[ep(c),ep(d),ep(g)],corners:[ep(a),ep(u),ep(h),ep(f)]}),e=!0}catch{}y=g.next(e)}m.length>0?self.postMessage({type:"ok",payload:{uid:n,image:o,items:m}},[o]):self.postMessage({type:"error",message:"未发现二维码"})})}();