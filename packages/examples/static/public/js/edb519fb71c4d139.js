!function(){"use strict";var e;function t(e){return 0|e+(e<0?-.5:.5)}function n(e,t){let n=e.at(t);return null!=n?n:""}function r(e){return e-=e>>1&1431655765,((e=(858993459&e)+(e>>2&858993459))+(e>>4)&252645135)*16843009>>24}function i(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:e.length,r=0;for(let i=t;i<n;i++)r+=e[i];return r}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class s{#e;#t;#n;#r;constructor(e,t,n){let r=Math.ceil(e/32),i=r*t;if(this.#e=e,this.#t=t,this.#n=r,n instanceof Int32Array){if(n.length!==i)throw Error(`matrix bits capacity mismatch: ${i}`);this.#r=n}else this.#r=new Int32Array(i)}#i(e,t){return t*this.#n+(0|e/32)}get width(){return this.#e}get height(){return this.#t}set(e,t){let n=this.#i(e,t);this.#r[n]|=1<<(31&e)}get(e,t){let n=this.#i(e,t);return this.#r[n]>>>(31&e)&1}flip(e,t){if(null!=e&&null!=t){let n=this.#i(e,t);this.#r[n]^=1<<(31&e)}else{let e=this.#r,{length:t}=e;for(let n=0;n<t;n++)e[n]=~e[n]}}clone(){return new s(this.#e,this.#t,new Int32Array(this.#r))}setRegion(e,t,n,r){let i=this.#r,s=e+n,l=t+r,o=this.#n;for(let n=t;n<l;n++){let t=n*o;for(let n=e;n<s;n++)i[t+(0|n/32)]|=1<<(31&n)}}}function l(e){let t=e>>3;return 7&e&&t++,t}function o(e,t){return e<2?2:Math.min(e,t)}function w(e,t){return(e<<=3)>t?t:e}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class a{#s;#l;constructor(e,t){this.#s=e,this.#l=t}get x(){return this.#s}get y(){return this.#l}}function u(e,t){return Math.sqrt(f(e,t))}function f(e,t){let n=e.x-t.x,r=e.y-t.y;return n*n+r*r}function h(e,t,n){let{x:r,y:i}=e,{x:s,y:l}=t,{x:o,y:w}=n;return Math.abs(r*(l-w)+s*(w-i)+o*(i-l))/2}class c extends a{#o;#e;#t;#w;#a;#u=1;#f;#h;static noise(e){return e.#o}static width(e){return e.#e}static height(e){return e.#t}static combined(e){return e.#u}static rect(e){return e.#w}static equals(e,t,n,r,i){let{modules:s}=e.#f,l=e.#h;if(Math.abs(t-e.x)<=l&&Math.abs(n-e.y)<=l){let t=e.#a,n=Math.abs((r+i)/s/2-t);if(n<=1||n<=t)return!0}return!1}static combine(e,t,n,r,i,s){let l=e.#u,o=l+1,w=(e.x*l+t)/o,a=(e.y*l+n)/o,u=(e.#o*l+s)/o,f=(e.#e*l+r)/o,h=(e.#t*l+i)/o,d=new c(e.#f,w,a,f,h,u);return d.#u=o,d}constructor(e,t,n,r,i,s){super(t,n);let{modules:l}=e,o=r/2,w=i/2,a=r/l,u=i/l,f=a/2,h=u/2,c=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e){let{ratios:t}=e;return t[0|t.length/2]/2}(e),d=(a+u)/2;this.#o=s,this.#e=r,this.#t=i,this.#f=e,this.#a=d,this.#w=[t-o+f,n-w+h,t+o-f,n+w-h],this.#h=d*c}get moduleSize(){return this.#a}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class d{#c;#d;constructor(e,t){this.#c=e,this.#d=t}sample(e,t){let n=this.#c,r=n.width,i=this.#d,l=n.height,o=new s(e,t);for(let s=0;s<t;s++)for(let t=0;t<e;t++){let[e,w]=i.mapping(t+.5,s+.5),a=0|e,u=0|w;a>=0&&u>=0&&a<r&&u<l&&n.get(a,u)&&o.set(t,s)}return o}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class g{#g;#m;constructor(e,t){this.#g=e,this.#m=t}get count(){return this.#g}get numDataCodewords(){return this.#m}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class m{#b;#y;#p;#x;#I;constructor(e,...t){let n=0,r=0;for(let{count:e,numDataCodewords:i}of t)n+=e,r+=i*e;let i=e*n;this.#b=t,this.#p=i,this.#x=r,this.#I=e,this.#y=r+i}get ecBlocks(){return this.#b}get numTotalCodewords(){return this.#y}get numTotalECCodewords(){return this.#p}get numTotalDataCodewords(){return this.#x}get numECCodewordsPerBlock(){return this.#I}}let b=[31892,34236,39577,42195,48118,51042,55367,58893,63784,68472,70749,76311,79154,84390,87683,92361,96236,102084,102881,110507,110734,117786,119615,126325,127568,133589,136944,141498,145311,150283,152622,158308,161089,167017];class y{#z;#E;#b;#C;constructor(e,t,...n){this.#E=e,this.#b=n,this.#z=17+4*e,this.#C=t}get size(){return this.#z}get version(){return this.#E}get alignmentPatterns(){return this.#C}getECBlocks(e){let{level:t}=e;return this.#b[t]}}let p=[new y(1,[],new m(7,new g(1,19)),new m(10,new g(1,16)),new m(13,new g(1,13)),new m(17,new g(1,9))),new y(2,[6,18],new m(10,new g(1,34)),new m(16,new g(1,28)),new m(22,new g(1,22)),new m(28,new g(1,16))),new y(3,[6,22],new m(15,new g(1,55)),new m(26,new g(1,44)),new m(18,new g(2,17)),new m(22,new g(2,13))),new y(4,[6,26],new m(20,new g(1,80)),new m(18,new g(2,32)),new m(26,new g(2,24)),new m(16,new g(4,9))),new y(5,[6,30],new m(26,new g(1,108)),new m(24,new g(2,43)),new m(18,new g(2,15),new g(2,16)),new m(22,new g(2,11),new g(2,12))),new y(6,[6,34],new m(18,new g(2,68)),new m(16,new g(4,27)),new m(24,new g(4,19)),new m(28,new g(4,15))),new y(7,[6,22,38],new m(20,new g(2,78)),new m(18,new g(4,31)),new m(18,new g(2,14),new g(4,15)),new m(26,new g(4,13),new g(1,14))),new y(8,[6,24,42],new m(24,new g(2,97)),new m(22,new g(2,38),new g(2,39)),new m(22,new g(4,18),new g(2,19)),new m(26,new g(4,14),new g(2,15))),new y(9,[6,26,46],new m(30,new g(2,116)),new m(22,new g(3,36),new g(2,37)),new m(20,new g(4,16),new g(4,17)),new m(24,new g(4,12),new g(4,13))),new y(10,[6,28,50],new m(18,new g(2,68),new g(2,69)),new m(26,new g(4,43),new g(1,44)),new m(24,new g(6,19),new g(2,20)),new m(28,new g(6,15),new g(2,16))),new y(11,[6,30,54],new m(20,new g(4,81)),new m(30,new g(1,50),new g(4,51)),new m(28,new g(4,22),new g(4,23)),new m(24,new g(3,12),new g(8,13))),new y(12,[6,32,58],new m(24,new g(2,92),new g(2,93)),new m(22,new g(6,36),new g(2,37)),new m(26,new g(4,20),new g(6,21)),new m(28,new g(7,14),new g(4,15))),new y(13,[6,34,62],new m(26,new g(4,107)),new m(22,new g(8,37),new g(1,38)),new m(24,new g(8,20),new g(4,21)),new m(22,new g(12,11),new g(4,12))),new y(14,[6,26,46,66],new m(30,new g(3,115),new g(1,116)),new m(24,new g(4,40),new g(5,41)),new m(20,new g(11,16),new g(5,17)),new m(24,new g(11,12),new g(5,13))),new y(15,[6,26,48,70],new m(22,new g(5,87),new g(1,88)),new m(24,new g(5,41),new g(5,42)),new m(30,new g(5,24),new g(7,25)),new m(24,new g(11,12),new g(7,13))),new y(16,[6,26,50,74],new m(24,new g(5,98),new g(1,99)),new m(28,new g(7,45),new g(3,46)),new m(24,new g(15,19),new g(2,20)),new m(30,new g(3,15),new g(13,16))),new y(17,[6,30,54,78],new m(28,new g(1,107),new g(5,108)),new m(28,new g(10,46),new g(1,47)),new m(28,new g(1,22),new g(15,23)),new m(28,new g(2,14),new g(17,15))),new y(18,[6,30,56,82],new m(30,new g(5,120),new g(1,121)),new m(26,new g(9,43),new g(4,44)),new m(28,new g(17,22),new g(1,23)),new m(28,new g(2,14),new g(19,15))),new y(19,[6,30,58,86],new m(28,new g(3,113),new g(4,114)),new m(26,new g(3,44),new g(11,45)),new m(26,new g(17,21),new g(4,22)),new m(26,new g(9,13),new g(16,14))),new y(20,[6,34,62,90],new m(28,new g(3,107),new g(5,108)),new m(26,new g(3,41),new g(13,42)),new m(30,new g(15,24),new g(5,25)),new m(28,new g(15,15),new g(10,16))),new y(21,[6,28,50,72,94],new m(28,new g(4,116),new g(4,117)),new m(26,new g(17,42)),new m(28,new g(17,22),new g(6,23)),new m(30,new g(19,16),new g(6,17))),new y(22,[6,26,50,74,98],new m(28,new g(2,111),new g(7,112)),new m(28,new g(17,46)),new m(30,new g(7,24),new g(16,25)),new m(24,new g(34,13))),new y(23,[6,30,54,78,102],new m(30,new g(4,121),new g(5,122)),new m(28,new g(4,47),new g(14,48)),new m(30,new g(11,24),new g(14,25)),new m(30,new g(16,15),new g(14,16))),new y(24,[6,28,54,80,106],new m(30,new g(6,117),new g(4,118)),new m(28,new g(6,45),new g(14,46)),new m(30,new g(11,24),new g(16,25)),new m(30,new g(30,16),new g(2,17))),new y(25,[6,32,58,84,110],new m(26,new g(8,106),new g(4,107)),new m(28,new g(8,47),new g(13,48)),new m(30,new g(7,24),new g(22,25)),new m(30,new g(22,15),new g(13,16))),new y(26,[6,30,58,86,114],new m(28,new g(10,114),new g(2,115)),new m(28,new g(19,46),new g(4,47)),new m(28,new g(28,22),new g(6,23)),new m(30,new g(33,16),new g(4,17))),new y(27,[6,34,62,90,118],new m(30,new g(8,122),new g(4,123)),new m(28,new g(22,45),new g(3,46)),new m(30,new g(8,23),new g(26,24)),new m(30,new g(12,15),new g(28,16))),new y(28,[6,26,50,74,98,122],new m(30,new g(3,117),new g(10,118)),new m(28,new g(3,45),new g(23,46)),new m(30,new g(4,24),new g(31,25)),new m(30,new g(11,15),new g(31,16))),new y(29,[6,30,54,78,102,126],new m(30,new g(7,116),new g(7,117)),new m(28,new g(21,45),new g(7,46)),new m(30,new g(1,23),new g(37,24)),new m(30,new g(19,15),new g(26,16))),new y(30,[6,26,52,78,104,130],new m(30,new g(5,115),new g(10,116)),new m(28,new g(19,47),new g(10,48)),new m(30,new g(15,24),new g(25,25)),new m(30,new g(23,15),new g(25,16))),new y(31,[6,30,56,82,108,134],new m(30,new g(13,115),new g(3,116)),new m(28,new g(2,46),new g(29,47)),new m(30,new g(42,24),new g(1,25)),new m(30,new g(23,15),new g(28,16))),new y(32,[6,34,60,86,112,138],new m(30,new g(17,115)),new m(28,new g(10,46),new g(23,47)),new m(30,new g(10,24),new g(35,25)),new m(30,new g(19,15),new g(35,16))),new y(33,[6,30,58,86,114,142],new m(30,new g(17,115),new g(1,116)),new m(28,new g(14,46),new g(21,47)),new m(30,new g(29,24),new g(19,25)),new m(30,new g(11,15),new g(46,16))),new y(34,[6,34,62,90,118,146],new m(30,new g(13,115),new g(6,116)),new m(28,new g(14,46),new g(23,47)),new m(30,new g(44,24),new g(7,25)),new m(30,new g(59,16),new g(1,17))),new y(35,[6,30,54,78,102,126,150],new m(30,new g(12,121),new g(7,122)),new m(28,new g(12,47),new g(26,48)),new m(30,new g(39,24),new g(14,25)),new m(30,new g(22,15),new g(41,16))),new y(36,[6,24,50,76,102,128,154],new m(30,new g(6,121),new g(14,122)),new m(28,new g(6,47),new g(34,48)),new m(30,new g(46,24),new g(10,25)),new m(30,new g(2,15),new g(64,16))),new y(37,[6,28,54,80,106,132,158],new m(30,new g(17,122),new g(4,123)),new m(28,new g(29,46),new g(14,47)),new m(30,new g(49,24),new g(10,25)),new m(30,new g(24,15),new g(46,16))),new y(38,[6,32,58,84,110,136,162],new m(30,new g(4,122),new g(18,123)),new m(28,new g(13,46),new g(32,47)),new m(30,new g(48,24),new g(14,25)),new m(30,new g(42,15),new g(32,16))),new y(39,[6,26,54,82,110,138,166],new m(30,new g(20,117),new g(4,118)),new m(28,new g(40,47),new g(7,48)),new m(30,new g(43,24),new g(22,25)),new m(30,new g(10,15),new g(67,16))),new y(40,[6,30,58,86,114,142,170],new m(30,new g(19,118),new g(6,119)),new m(28,new g(18,47),new g(31,48)),new m(30,new g(34,24),new g(34,25)),new m(30,new g(20,15),new g(61,16)))];/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class x{#S;#v;#O;#k;#M;#A;constructor(e,t){let n=0|t.x,r=0|t.y,i=0|e.x,s=0|e.y,l=Math.abs(r-s)>Math.abs(n-i);l&&([i,s,n,r]=[s,i,r,n]);let o=i<n?1:-1;this.#k=l,this.#O=n+o,this.#S=new a(n,r),this.#v=new a(i,s),this.#M=[o,s<r?1:-1],this.#A=[Math.abs(n-i),Math.abs(r-s)]}*points(){let e=this.#O,t=this.#k,{y:n}=this.#S,[r,i]=this.#M,[s,l]=this.#A,{x:o,y:w}=this.#v,a=0|-s/2;for(let u=o,f=w;u!==e;u+=r)if(yield[t?f:u,t?u:f],(a+=l)>0){if(f===n)break;f+=i,a-=s}}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function I(e,t,n){let r=0,{width:i,height:s}=e,l=new a((t.x+n.x)/2,(t.y+n.y)/2);for(let[n,o]of new x(t,l).points()){if(n<0||o<0||n>=i||o>=s){if(2===r)return u(t,new a(n,o));break}if(1===r==(1===e.get(n,o))){if(2===r)return u(t,new a(n,o));r++}}return NaN}function z(e,t,n){let r=I(e,t,n);if(Number.isNaN(r))return NaN;let{x:i,y:s}=n,{x:l,y:o}=t,w=I(e,t,new a(l-(i-l),o-(s-o)));return Number.isNaN(w)?NaN:r+w-1}function E(e,t,n){let r=new a(0|t.x,0|t.y),i=new a(0|n.x,0|n.y),s=z(e,r,i),l=z(e,i,r);return Number.isNaN(s)?l/7:Number.isNaN(l)?s/7:(s+l)/14}function C(e,t){var n,r,i,s;let l=Math.max((n=c.width(e))>(r=c.width(t))?n/r:r/n,(i=c.height(e))>(s=c.height(t))?i/s:s/i);return l*l}class S{#T;#z;#c;#_;#a;#N;#R;static moduleSizes(e){if(null==e.#R){let t=e.#c,[n,r,i]=e.#N;e.#R=[E(t,n,r),E(t,n,i)]}return e.#R}static size(n){if(null==n.#z){let r=e.moduleSize(n);n.#z=function(e,n){let[r,i,s]=e,l=t((u(r,i)+u(r,s))/n/2)+7;switch(3&l){case 0:return l+1;case 2:return l-1;case 3:return Math.min(l+2,177)}return l}(n.#N,r)}return n.#z}static moduleSize(t){return null==t.#a&&(t.#a=i(e.moduleSizes(t))/2),t.#a}static contains(t,n){let r=t.#D(),[i,s,l]=t.#N,o=e.bottomRight(t),w=h(i,s,n);return w+h(s,o,n)+h(o,l,n)+h(l,i,n)-r<1}static bottomRight(e){return null==e.#_&&(e.#_=function(e){let[t,n,r]=e,{x:i,y:s}=t;return new a(n.x+r.x-i,n.y+r.y-s)}(e.#N)),e.#_}constructor(e,t){this.#c=e,this.#N=function(e){let t,n,r;let[i,s,l]=e,o=f(i,s)*C(i,s),w=f(i,l)*C(i,l),a=f(s,l)*C(s,l);return a>=o&&a>=w?[t,r,n]=e:w>=a&&w>=o?[r,t,n]=e:[r,n,t]=e,0>function(e,t,n){let{x:r,y:i}=t;return(n.x-r)*(e.y-i)-(n.y-i)*(e.x-r)}(r,t,n)&&([r,n]=[n,r]),[t,n,r]}(t)}get topLeft(){return this.#N[0]}get topRight(){return this.#N[1]}get bottomLeft(){return this.#N[2]}#D(){let[t,n,r]=this.#N,i=e.bottomRight(this);if(null==this.#T){let e=h(t,n,i),s=h(i,r,t);this.#T=e+s}return this.#T}}e=S;/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class v{#c;#B;#P;#d;constructor(e,t,n,r){let i=new d(e,t),s=S.size(n);this.#c=e,this.#d=t,this.#P=n,this.#B=r,this.#c=i.sample(s,s)}get matrix(){return this.#c}get finder(){return this.#P}get alignment(){return this.#B}get size(){return S.size(this.#P)}get moduleSize(){return S.moduleSize(this.#P)}mapping(e,t){return[e,t]=this.#d.mapping(e,t),new a(e,t)}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class O{#U;#F;#L;#Z;#H;#j;#$;#q;#G;constructor(e,t,n,r,i,s,l,o,w){this.#U=e,this.#F=r,this.#L=l,this.#Z=t,this.#H=i,this.#j=o,this.#$=n,this.#q=s,this.#G=w}inverse(){let e=this.#U,t=this.#F,n=this.#L,r=this.#Z,i=this.#H,s=this.#j,l=this.#$,o=this.#q,w=this.#G;return new O(i*w-s*o,s*l-r*w,r*o-i*l,n*o-t*w,e*w-n*l,t*l-e*o,t*s-n*i,n*r-e*s,e*i-t*r)}times(e){let t=this.#U,n=this.#F,r=this.#L,i=this.#Z,s=this.#H,l=this.#j,o=this.#$,w=this.#q,a=this.#G,u=e.#U,f=e.#F,h=e.#L,c=e.#Z,d=e.#H,g=e.#j,m=e.#$,b=e.#q,y=e.#G;return new O(t*u+i*f+o*h,t*c+i*d+o*g,t*m+i*b+o*y,n*u+s*f+w*h,n*c+s*d+w*g,n*m+s*b+w*y,r*u+l*f+a*h,r*c+l*d+a*g,r*m+l*b+a*y)}mapping(e,t){let n=this.#U,r=this.#F,i=this.#L,s=this.#Z,l=this.#H,o=this.#j,w=this.#$,a=this.#q,u=i*e+o*t+this.#G;return[(n*e+s*t+w)/u,(r*e+l*t+a)/u]}}function k(e,t,n,r,i,s,l,o){let w=e-n+i-l,a=t-r+s-o;if(0===w&&0===a)return new O(n-e,i-n,e,r-t,s-r,t,0,0,1);{let u=n-i,f=l-i,h=r-s,c=o-s,d=u*c-f*h,g=(w*c-f*a)/d,m=(u*a-w*h)/d;return new O(n-e+g*n,l-e+m*l,e,r-t+g*r,o-t+m*o,t,g,m,1)}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function M(e,t){let n,r,i,s;let{x:l,y:o}=e.topLeft,{x:w,y:a}=e.topRight,{x:u,y:f}=e.bottomLeft,h=S.size(e)-3.5;return null!=t?(n=t.x,r=t.y,s=i=h-3):(n=w+u-l,r=a+f-o,i=h,s=h),function(e,t,n,r,i,s,l,o,w,a,u,f,h,c,d,g){let m=k(3.5,3.5,n,3.5,i,s,3.5,o).inverse();return k(w,a,u,f,h,c,d,g).times(m)}(0,0,h,0,i,s,0,h,l,o,w,a,n,r,u,f)}function A(e,t){let[n,,r]=c.rect(e);return t>0?r:t<0?n:e.x}function T(e,t){let[,n,,r]=c.rect(e);return t>0?r:t<0?n:e.y}function _(e,t,n,r){let{x:i,y:s}=t,{x:l,y:o}=e,{x:w,y:u}=n,f=w>i?1:w<i?-1:0,h=u>s?1:u<s?-1:0,c=A(t,f),d=T(t,h),g=A(e,f),m=T(e,h);return 0===f||0===h?[new a(g,m),new a(c,d)]:(r?f===h:f!==h)?[new a(l,m),new a(i,d)]:[new a(g,o),new a(c,s)]}function N(e,t,n,r){let i=r+8,s=new x(t,n).points(),l=1,o=e.get(0|t.x,0|t.y);for(let[t,n]of s){let r=e.get(t,n);if(r!==o&&(l++,o=r,l>i))return!1}return l>=r-14-Math.max(2,(r-17)/4)}function R(e,t,n){let{topLeft:r,topRight:i,bottomLeft:s}=t,[l,o]=n?_(r,s,i,!0):_(r,i,s);return N(e,l,o,S.size(t))}function D(e,t,n,r){let[i,s]=t.mapping(r?6.5:7.5,r?7.5:6.5),[l,o]=t.mapping(r?6.5:n-7.5,r?n-7.5:6.5);return N(e,new a(i,s),new a(l,o),n)}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class B{#V;#f;constructor(e){this.#f=e,this.#V=i(e)}get modules(){return this.#V}get ratios(){return this.#f}}let P=new B([1,1,3,1,1]),U=new B([1,1,1,1,1]),F=new B([1,1,1]);function L(e,t){let{length:n}=e,r=n-1;for(let t=0;t<r;t++)e[t]=e[t+1];e[r]=t}function Z(e,t,n,r,i){let s=-1,l=t|=0,o=n|=0,w=[0,0,0,0,0],{width:a,height:u}=e,f=i?-1:1,h=()=>{l+=s,o-=s*f},c=()=>e.get(l,o);for(;l>=0&&o>=0&&o<u&&c();)h(),w[2]++;for(;l>=0&&o>=0&&o<u&&!c();)h(),w[1]++;for(;l>=0&&o>=0&&o<u&&w[0]<r&&c();)h(),w[0]++;for(l=t+(s=1),o=n-s*f;l<a&&o>=0&&o<u&&c();)h(),w[2]++;for(;l<a&&o>=0&&o<u&&!c();)h(),w[3]++;for(;l<a&&o>=0&&o<u&&w[4]<r&&c();)h(),w[4]++;return w}function H(e,t){let n=[],r=0|e.length/2;for(let t=0;t<=r;t++){let s=r+t+1;n.push(i(e,r-t,s)/2+i(e,s))}return t-(2*n[0]+i(n,1))/(r+2)}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let j=Math.PI/180,$=40*j,q=140*j;function G(e,t,n,r,i,s){let[l,o]=function(e,t,n,r,i){t|=0,n|=0;let s=i?n:t,l=[0,0,0,0,0],o=i?e.height:e.width,w=()=>i?e.get(t,s):e.get(s,n);for(;s>=0&&w();)s--,l[2]++;for(;s>=0&&!w();)s--,l[1]++;for(;s>=0&&l[0]<r&&w();)s--,l[0]++;for(s=(i?n:t)+1;s<o&&w();)s++,l[2]++;for(;s<o&&!w();)s++,l[3]++;for(;s<o&&l[4]<r&&w();)s++,l[4]++;return[l,s]}(e,t,n,r,s);return[Y(l,i)?H(l,o):NaN,l]}function V(e,t,n){return e>t&&([e,t]=[t,e]),t-e<=t*n}function Y(e,t){let{ratios:n,modules:r}=t,{length:i}=e,s=function(e){let t=0;for(let n of e){if(0===n)return NaN;t+=n}return t}(e);if(s>=r){let t=s/r,l=.625*t+.5;for(let r=0;r<i;r++){let i=n[r];if(Math.abs(e[r]-t*i)>l)return!1}return!0}return!1}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class J{#Y;#c;#f;#N=[];constructor(e,t,n){this.#c=e,this.#f=t,this.#Y=n}get matrix(){return this.#c}get patterns(){return this.#N}match(e,t,n,r){let s=this.#c,l=this.#f,o=H(n,e),[w,a]=G(s,o,t,r,l,!0);if(w>=0){let e;if([o,e]=G(s,o,w,r,l),o>=0){let t=Z(s,o,w,r),n=Z(s,o,w,r,!0);if(this.#Y?Y(t,l)&&Y(n,l):Y(t,l)||Y(n,l)){let r=function(e){for(var t=arguments.length,n=Array(t>1?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];let s=0,l=0,{length:o}=n,w=[];for(let t of n){let[n,r]=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t){let{ratios:n,modules:r}=t,s=0,{length:l}=n,o=i(e),w=o/r;for(let t=0;t<l;t++)s+=Math.abs(e[t]-n[t]*w);return[s/o,w]}(t,e);s+=n,w.push(r)}let a=i(w),u=a/o;for(let e of w)l+=Math.abs(e-u);return s+l/a}(l,e,a,t,n),s=i(e),u=i(a),f=this.#N,{length:h}=f,d=!1;for(let e=0;e<h;e++){let t=f[e];if(c.equals(t,o,w,s,u)){d=!0,f[e]=c.combine(t,o,w,s,u,r);break}}d||f.push(new c(l,o,w,s,u,r))}}}}}class K extends J{constructor(e,t){super(e,P,t)}*groups(){let e=this.patterns.filter(e=>c.combined(e)>=3&&1.5>=c.noise(e)),{length:n}=e;if(3===n){let t=new S(this.matrix,e),n=S.size(t);n>=21&&n<=177&&(yield t)}else if(n>3){let r=n-2,i=n-1,s=new Map;for(let l=0;l<r;l++){let r=e[l],o=r.moduleSize;if(!s.has(r))for(let w=l+1;w<i;w++){let i=e[w],l=i.moduleSize;if(s.has(r))break;if(!s.has(i)&&V(o,l,.5))for(let a=w+1;a<n;a++){let n=e[a],w=n.moduleSize;if(s.has(r)||s.has(i))break;if(!V(o,w,.5)||!V(l,w,.5))continue;let{matrix:f}=this,h=new S(f,[r,i,n]),d=function(e){let{topLeft:t,topRight:n,bottomLeft:r}=e,{x:i,y:s}=t,l=n.x-i,o=n.y-s,w=r.x-i,a=r.y-s;return Math.acos((l*w+o*a)/Math.sqrt((l*l+o*o)*(w*w+a*a)))}(h);if(d>=$&&d<=q){let[l,o]=S.moduleSizes(h);if(l>=1&&o>=1){let{topLeft:w,topRight:a,bottomLeft:d}=h,g=u(w,a),m=u(w,d);if(4>=Math.abs(t(g/l)-t(m/o))){let t=S.size(h);t>=21&&t<=177&&!/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t,n){let r=0,{topLeft:i,topRight:s,bottomLeft:l}=e;for(let o of t)if(o!==i&&o!==s&&o!==l){let t;if(n.has(o)&&(t=S.contains(e,o))||1>c.noise(o)&&(null==t?S.contains(e,o):t)&&++r>3)return!0}return!1}(h,e,s)&&(R(f,h)||R(f,h,!0))&&(yield h)&&(s.set(r,!0),s.set(i,!0),s.set(n,!0))}}}}}}}}find(e,t,n,r){let{matrix:i}=this,s=e+n,l=t+r,o=(e,t,n,r,i,s)=>{L(n,r),L(i,s),1===i[0]&&0===i[1]&&1===i[2]&&0===i[3]&&1===i[4]&&Y(n,P)&&this.match(e,t,n,n[2])};for(let n=t;n<l;n++){let t=e;for(;t<s&&!i.get(t,n);)t++;let r=0,l=i.get(t,n),w=[0,0,0,0,0],a=[-1,-1,-1,-1,-1];for(;t<s;){let e=i.get(t,n);e===l?r++:(o(t,n,w,r,a,l),r=1,l=e),t++}o(t,n,w,r,a,l)}}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class Q extends J{constructor(e,t){super(e,U,t)}filter(e,t){let n=this.patterns.filter(e=>2.5>=c.noise(e)&&V(e.moduleSize,t,.5));n.length>1&&n.sort((n,r)=>{let i=c.noise(n),s=c.noise(r),l=Math.abs(n.moduleSize-t),o=Math.abs(r.moduleSize-t);return(u(n,e)+l)*i-(u(r,e)+o)*s});let r=n.slice(0,2);return r.push(e),r}find(e,t,n,r){let{matrix:i}=this,s=e+n,l=t+r,o=(e,t,n,r,i,s)=>{L(n,r),L(i,s),0===i[0]&&1===i[1]&&0===i[2]&&Y(n,F)&&this.match(e,t,n,n[1])};for(let n=t;n<l;n++){let t=e;for(;t<s&&!i.get(t,n);)t++;let r=0,l=i.get(t,n),w=[0,0,0],a=[-1,-1,-1];for(;t<s;){let e=i.get(t,n);e===l?r++:(o(t,n,w,r,a,l),r=1,l=e),t++}o(t,n,w,r,a,l)}}}class W{#J;constructor(e={}){this.#J=e}*detect(e){let{strict:t}=this.#J,{width:n,height:r}=e,i=new K(e,t);i.find(0,0,n,r);let s=i.groups(),l=s.next();for(;!l.done;){let n=!1,r=l.value,i=S.size(r);if(i>=25)for(let s of function(e,t,n){let r=S.size(t),i=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e){let{x:t,y:n}=e.topLeft,r=1-3/(S.size(e)-7),i=S.bottomRight(e),[s,l]=S.moduleSizes(e);return new c(U,t+(i.x-t)*r,n+(i.y-n)*r,5*s,5*l,0)}(t),s=new Q(e,n),l=S.moduleSize(t),{x:o,y:w}=i,a=Math.ceil(l*Math.min(20,0|r/4)),u=0|Math.max(0,w-a),f=0|Math.max(0,o-a),h=0|Math.min(e.width-1,o+a),d=0|Math.min(e.height-1,w+a);return s.find(f,u,h-f,d-u),s.filter(i,l)}(e,r,t)){let t=M(r,s);if(D(e,t,i)&&D(e,t,i,!0)&&(n=yield new v(e,t,r,s)))break}else{let t=M(r);D(e,t,i)&&D(e,t,i,!0)&&(n=yield new v(e,t,r))}l=s.next(n)}}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class X{#K;#Q;#W;#E;#X;#ee;constructor(e,t,{mask:n,level:r},i,s){this.#K=n,this.#Q=r,this.#W=s,this.#E=t,this.#ee=e,this.#X=i}get mask(){return this.#K}get level(){return this.#Q.name}get version(){return this.#E.version}get mirror(){return this.#W}get content(){return this.#ee.content}get corrected(){return this.#X}get symbology(){return this.#ee.symbology}get fnc1(){return this.#ee.fnc1}get codewords(){return this.#ee.codewords}get structured(){return this.#ee.structured}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class ee{#et;#en;#er;constructor(e){this.#et=e,this.#en=0,this.#er=0}get bitOffset(){return this.#en}get byteOffset(){return this.#er}read(e){let t=0,n=this.#en,r=this.#er,i=this.#et;if(n>0){let s=8-n,l=Math.min(e,s),o=s-l;e-=l,n+=l,t=(i[r]&255>>8-l<<o)>>o,8===n&&(r++,n=0)}if(e>0){for(;e>=8;)e-=8,t=t<<8|255&i[r++];if(e>0){let s=8-e;n+=e,t=t<<e|(i[r]&255>>s<<s)>>s}}return this.#en=n,this.#er=r,t}available(){return 8*(this.#et.length-this.#er)-this.#en}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let et=new Map;class en{#r;#ei;static TERMINATOR=new en([0,0,0],0);static NUMERIC=new en([10,12,14],1);static ALPHANUMERIC=new en([9,11,13],2);static STRUCTURED_APPEND=new en([0,0,0],3);static BYTE=new en([8,16,16],4);static ECI=new en([0,0,0],7);static KANJI=new en([8,10,12],8);static FNC1_FIRST_POSITION=new en([0,0,0],5);static FNC1_SECOND_POSITION=new en([0,0,0],9);static HANZI=new en([8,10,12],13);constructor(e,t){this.#r=t,this.#ei=new Int32Array(e),et.set(t,this)}get bits(){return this.#r}getCharacterCountBits(e){let t,{version:n}=e;return t=n<=9?0:n<=26?1:2,this.#ei[t]}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let er=new Map;class ei{#es;#el;static CP437=new ei("cp437",2,0);static ISO_8859_1=new ei("iso-8859-1",3,1);static ISO_8859_2=new ei("iso-8859-2",4);static ISO_8859_3=new ei("iso-8859-3",5);static ISO_8859_4=new ei("iso-8859-4",6);static ISO_8859_5=new ei("iso-8859-5",7);static ISO_8859_6=new ei("iso-8859-6",8);static ISO_8859_7=new ei("iso-8859-7",9);static ISO_8859_8=new ei("iso-8859-8",10);static ISO_8859_9=new ei("iso-8859-9",11);static ISO_8859_10=new ei("iso-8859-10",12);static ISO_8859_11=new ei("iso-8859-11",13);static ISO_8859_13=new ei("iso-8859-13",15);static ISO_8859_14=new ei("iso-8859-14",16);static ISO_8859_15=new ei("iso-8859-15",17);static ISO_8859_16=new ei("iso-8859-16",18);static SHIFT_JIS=new ei("shift-jis",20);static CP1250=new ei("cp1250",21);static CP1251=new ei("cp1251",22);static CP1252=new ei("cp1252",23);static CP1256=new ei("cp1256",24);static UTF_16BE=new ei("utf-16be",25);static UTF_8=new ei("utf-8",26);static ASCII=new ei("ascii",27);static BIG5=new ei("big5",28);static GB2312=new ei("gb2312",29);static EUC_KR=new ei("euc-kr",30);static GB18030=new ei("gb18030",32);static UTF_16LE=new ei("utf-16le",33);static UTF_32BE=new ei("utf-32be",34);static UTF_32LE=new ei("utf-32le",35);static ISO_646_INV=new ei("iso-646-inv",170);static BINARY=new ei("binary",899);constructor(e,...t){for(let n of(this.#es=e,this.#el=Object.freeze(t),t))if(n>=0&&n<=999999&&Number.isInteger(n))er.set(n,this);else throw Error("illegal extended channel interpretation value")}get label(){return this.#es}get values(){return this.#el}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function es(e){let t=0,n=new Map;for(let r of e)n.set(r,t++);return n}function el(e){for(var t=arguments.length,r=Array(t>1?t-1:0),i=1;i<t;i++)r[i-1]=arguments[i];let s=[],l=[],o=new Map,w=new TextDecoder(e,{fatal:!0});for(let[e,t]of r)for(let n=e;n<=t;n++)s.push(n>>8,255&n),l.push(n);let{length:a}=l,u=w.decode(new Uint8Array(s));for(let e=0;e<a;e++){let t=n(u,e);o.has(t)||o.set(t,l[e])}return o}function eo(e,t,n){let r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:256,i=n.length-1,s=[];for(let l=e;l<t;){for(let e=0;e<i;e+=2)s.push([l+n[e],l+n[e+1]]);l+=r}return s}el("gb2312",[41377,41470],[41649,41698],[41701,41710],[41713,41724],[41889,41982],[42145,42227],[42401,42486],[42657,42680],[42689,42712],[42913,42945],[42961,42993],[43169,43194],[43205,43241],[43428,43503],...eo(45217,55038,[0,93]),[55201,55289],...eo(55457,63486,[0,93])),el("shift-jis",[33088,33150],[33152,33196],[33208,33215],[33224,33230],[33242,33256],[33264,33271],[33276,33276],[33359,33368],[33376,33401],[33409,33434],[33439,33521],[33600,33662],[33664,33686],[33695,33718],[33727,33750],[33856,33888],[33904,33918],[33920,33937],[33951,33982],[34975,35068],...eo(35136,38908,[0,62,64,188]),[38976,39026],[39071,39164],...eo(39232,40956,[0,62,64,188]),...eo(57408,59900,[0,62,64,188]),[59968,60030],[60032,60068]);let ew="0123456789";es(ew);let ea=`${ew}ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:`;function eu(e){return e.replace(/%+/g,e=>{let t=1&e.length;return e=e.replace(/%%/g,"%"),t?e.replace(/%$/,"\x1d"):e})}es(ea);/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let ef=new Map;class eh{#eo;#r;#Q;static L=new eh("L",0,1);static M=new eh("M",1,0);static Q=new eh("Q",2,3);static H=new eh("H",3,2);constructor(e,t,n){this.#r=n,this.#eo=e,this.#Q=t,ef.set(n,this)}get bits(){return this.#r}get name(){return this.#eo}get level(){return this.#Q}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let ec=[[21522,0],[20773,1],[24188,2],[23371,3],[17913,4],[16590,5],[20375,6],[19104,7],[30660,8],[29427,9],[32170,10],[30877,11],[26159,12],[25368,13],[27713,14],[26998,15],[5769,16],[5054,17],[7399,18],[6608,19],[1890,20],[597,21],[3340,22],[2107,23],[13663,24],[12392,25],[16177,26],[14854,27],[9396,28],[8579,29],[11994,30],[11245,31]];class ed{#K;#Q;constructor(e){this.#K=7&e,this.#Q=function(e){let t=ef.get(e);if(null!=t)return t;throw Error("illegal error correction bits")}(e>>3&3)}get mask(){return this.#K}get level(){return this.#Q}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function eg(e,t,n,r){return e.get(t,n)?r<<1|1:r<<1}class em{#z;#c;constructor(e){let{width:t,height:n}=e;this.#c=e.clone(),this.#z=Math.min(t,n)}readVersion(){let e=this.#z,t=0|(e-17)/4;if(t<1)throw Error("illegal version");if(t<=6)return p[t-1];let n=0,i=0,s=e-11,l=this.#c;for(let t=5;t>=0;t--)for(let r=e-9;r>=s;r--)n=eg(l,r,t,n);for(let t=5;t>=0;t--)for(let n=e-9;n>=s;n--)i=eg(l,t,n,i);let o=function(e,t){let n=32,i=0,{length:s}=b;for(let l=0;l<s;l++){let s=b[l];if(e===s||t===s)return p[l+6];let o=r(e^s);o<n&&(n=o,i=l+7),e!==t&&(o=r(t^s))<n&&(n=o,i=l+7)}if(n<=3&&i>=7)return p[i-1];throw Error("unable to decode version")}(n,i);if(o.size>e)throw Error("matrix size too small for version");return o}readFormatInfo(){let e=0,t=0,n=this.#c,i=this.#z,s=i-7;for(let t=0;t<=8;t++)6!==t&&(e=eg(n,t,8,e));for(let t=7;t>=0;t--)6!==t&&(e=eg(n,8,t,e));for(let e=i-1;e>=s;e--)t=eg(n,8,e,t);for(let e=i-8;e<i;e++)t=eg(n,e,8,t);return function(e,t){let n=32,i=0;for(let[s,l]of ec){if(e===s||t===s)return new ed(l);let o=r(e^s);o<n&&(n=o,i=l),e!==t&&(o=r(t^s))<n&&(n=o,i=l)}if(n<=3)return new ed(i);throw Error("unable to decode format information")}(e,t)}readCodewords(e,t){let n=0,r=0,i=0,l=!0,o=this.#z,w=this.#c,a=e.getECBlocks(t),u=function(e){let{size:t,version:n,alignmentPatterns:r}=e,{length:i}=r,l=new s(t,t),o=i-1;l.setRegion(0,0,9,9),l.setRegion(t-8,0,8,9),l.setRegion(0,t-8,9,8);for(let e=0;e<i;e++){let t=r[e]-2;for(let n=0;n<i;n++)(0!==e||0!==n&&n!==o)&&(e!==o||0!==n)&&l.setRegion(r[n]-2,t,5,5)}return l.setRegion(6,9,1,t-17),l.setRegion(9,6,t-17,1),n>6&&(l.setRegion(t-11,0,3,6),l.setRegion(0,t-11,6,3)),l}(e),f=new Uint8Array(a.numTotalCodewords);for(let e=o-1;e>0;e-=2){6===e&&e--;for(let t=0;t<o;t++){let s=l?o-1-t:t;for(let t=0;t<2;t++){let l=e-t;u.get(l,s)||(n++,i<<=1,w.get(l,s)&&(i|=1),8!==n||(f[r++]=i,n=0,i=0))}}l=!l}if(r!==a.numTotalCodewords)throw Error("illegal codewords length");return f}unmask(e){let t=this.#z,n=this.#c;for(let r=0;r<t;r++)for(let i=0;i<t;i++)(function(e,t,n){let r,i;switch(e){case 0:i=n+t&1;break;case 1:i=1&n;break;case 2:i=t%3;break;case 3:i=(n+t)%3;break;case 4:i=(0|n/2)+(0|t/3)&1;break;case 5:i=(1&(r=n*t))+r%3;break;case 6:i=(1&(r=n*t))+r%3&1;break;case 7:i=n*t%3+(n+t&1)&1;break;default:throw Error(`illegal mask: ${e}`)}return 0===i})(e,i,r)&&n.flip(i,r)}remask(e){this.unmask(e)}mirror(){let e=this.#z,t=this.#c;for(let n=0;n<e;n++)for(let r=n+1;r<e;r++)t.get(n,r)!==t.get(r,n)&&(t.flip(n,r),t.flip(r,n))}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class eb{#ew;#m;constructor(e,t){this.#ew=e,this.#m=t}get codewords(){return this.#ew}get numDataCodewords(){return this.#m}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class ey{#ea;#eu;constructor(e,t){let{length:n}=t;if(n<=0)throw Error("polynomial coefficients cannot empty");if(this.#ea=e,n>1&&0===t[0]){let e=1;for(;e<n&&0===t[e];)e++;if(e===n)this.#eu=new Int32Array([0]);else{let r=new Int32Array(n-e);r.set(t.subarray(e)),this.#eu=r}}else this.#eu=t}get coefficients(){return this.#eu}isZero(){return 0===this.#eu[0]}getDegree(){return this.#eu.length-1}getCoefficient(e){let t=this.#eu;return t[t.length-1-e]}evaluate(e){let t;if(0===e)return this.getCoefficient(0);let n=this.#eu;if(1===e){for(let e of(t=0,n))t^=e;return t}[t]=n;let r=this.#ea,{length:i}=n;for(let s=1;s<i;s++)t=r.multiply(e,t)^n[s];return t}multiply(e){let t=this.#ea,n=this.#eu,{length:r}=n;if(e instanceof ey){if(this.isZero()||e.isZero())return t.zero;let i=e.#eu,s=i.length,l=new Int32Array(r+s-1);for(let e=0;e<r;e++){let r=n[e];for(let n=0;n<s;n++)l[e+n]^=t.multiply(r,i[n])}return new ey(t,l)}if(0===e)return t.zero;if(1===e)return this;let i=new Int32Array(r);for(let s=0;s<r;s++)i[s]=t.multiply(n[s],e);return new ey(t,i)}multiplyByMonomial(e,t){let n=this.#ea;if(0===t)return n.zero;let r=this.#eu,{length:i}=r,s=new Int32Array(i+e);for(let e=0;e<i;e++)s[e]=n.multiply(r[e],t);return new ey(n,s)}addOrSubtract(e){if(this.isZero())return e;if(e.isZero())return this;let t=e.#eu,n=t.length,r=this.#eu,i=r.length;n<i&&([n,i]=[i,n],[t,r]=[r,t]);let s=n-i,l=new Int32Array(n);l.set(t.subarray(0,s));for(let e=s;e<n;e++)l[e]=r[e-s]^t[e];return new ey(this.#ea,l)}divide(e){let t=this.#ea,n=t.zero,r=this,i=e.getCoefficient(e.getDegree()),s=t.invert(i);for(;r.getDegree()>=e.getDegree()&&!r.isZero();){let i=r.getDegree(),l=i-e.getDegree(),o=t.multiply(r.getCoefficient(i),s),w=e.multiplyByMonomial(l,o),a=t.buildPolynomial(l,o);n=n.addOrSubtract(a),r=r.addOrSubtract(w)}return[n,r]}}let ep=new /**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class{#z;#ef;#eh;#ec;#ed;#eg;constructor(e,t,n){let r=1,i=new Int32Array(t);for(let n=0;n<t;n++)i[n]=r,(r*=2)>=t&&(r^=e,r&=t-1);let s=new Int32Array(t);for(let e=0,n=t-1;e<n;e++)s[i[e]]=e;this.#z=t,this.#ed=i,this.#eg=s,this.#ec=n,this.#ef=new ey(this,new Int32Array([1])),this.#eh=new ey(this,new Int32Array([0]))}get size(){return this.#z}get one(){return this.#ef}get zero(){return this.#eh}get generator(){return this.#ec}exp(e){return this.#ed[e]}log(e){return this.#eg[e]}invert(e){return this.#ed[this.#z-this.#eg[e]-1]}multiply(e,t){if(0===e||0===t)return 0;let n=this.#eg;return this.#ed[(n[e]+n[t])%(this.#z-1)]}buildPolynomial(e,t){if(0===t)return this.#eh;let n=new Int32Array(e+1);return n[0]=t,new ey(this,n)}}(285,256,0);class ex{#ea;constructor(e=ep){this.#ea=e}decode(e,t){let n=!0,r=this.#ea,{generator:i}=r,s=new ey(r,e),l=new Int32Array(t);for(let e=0;e<t;e++){let o=s.evaluate(r.exp(e+i));l[t-1-e]=o,0!==o&&(n=!1)}if(!n){let n=new ey(r,l),[i,s]=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t,n,r){t.getDegree()<n.getDegree()&&([t,n]=[n,t]);let i=n,s=e.one,l=t,o=e.zero;for(;2*i.getDegree()>=r;){let t=o,n=l;if(o=s,(l=i).isZero())throw Error("remainder last was zero");i=n;let r=e.zero,w=i.getDegree(),a=l.getDegree(),u=l.getCoefficient(a),f=e.invert(u);for(;w>=a&&!i.isZero();){let t=i.getDegree()-a,n=e.multiply(i.getCoefficient(w),f);r=r.addOrSubtract(e.buildPolynomial(t,n)),w=(i=i.addOrSubtract(l.multiplyByMonomial(t,n))).getDegree()}if(s=r.multiply(o).addOrSubtract(t),w>=a)throw Error("division algorithm failed to reduce polynomial")}let w=s.getCoefficient(0);if(0===w)throw Error("sigma tilde(0) was zero");let a=e.invert(w);return[s.multiply(a),i.multiply(a)]}(r,r.buildPolynomial(t,1),n,t),o=function(e,t){let n=t.getDegree();if(1===n)return new Int32Array([t.getCoefficient(1)]);let r=0,{size:i}=e,s=new Int32Array(n);for(let l=1;l<i&&r<n;l++)0===t.evaluate(l)&&(s[r++]=e.invert(l));if(r!==n)throw Error("error locator degree does not match number of roots");return s}(r,i),w=function(e,t,n){let{length:r}=n,i=new Int32Array(r);for(let s=0;s<r;s++){let l=1,o=e.invert(n[s]);for(let t=0;t<r;t++)if(s!==t){let r=e.multiply(n[t],o),i=(1&r)==0?1|r:-2&r;l=e.multiply(l,i)}i[s]=e.multiply(t.evaluate(o),e.invert(l)),0!==e.generator&&(i[s]=e.multiply(i[s],o))}return i}(r,s,o),a=o.length,u=e.length;for(let t=0;t<a;t++){let n=u-1-r.log(o[t]);if(n<0)throw Error("bad error location");e[n]=e[n]^w[t]}return a}return 0}}function eI(e,t){switch(t){case ei.BINARY:case ei.UTF_32BE:case ei.UTF_32LE:throw Error(`built-in decode not support charset: ${t.label}`);default:return new TextDecoder(t.label).decode(e)}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function ez(e,t,n){let{mask:r,level:i}=n,s=0,l=0;e.unmask(r);let o=t.getECBlocks(i),w=function(e,t,n){let{ecBlocks:r,numTotalCodewords:i,numECCodewordsPerBlock:s}=t.getECBlocks(n);if(e.length!==i)throw Error("failed to get data blocks");let l=[];for(let{count:e,numDataCodewords:t}of r)for(let n=0;n<e;n++){let e=s+t;l.push(new eb(new Uint8Array(e),t))}let{length:o}=l,w=o-1,a=l[0].codewords.length;for(;w>=0&&l[w].codewords.length!==a;)w--;w++;let u=0,f=a-s;for(let t=0;t<f;t++)for(let n=0;n<o;n++)l[n].codewords[t]=e[u++];for(let t=w;t<o;t++)l[t].codewords[f]=e[u++];let h=l[0].codewords.length;for(let t=f;t<h;t++)for(let n=0;n<o;n++){let r=n<w?t:t+1;l[n].codewords[r]=e[u++]}return l}(e.readCodewords(t,i),t,i),a=new Uint8Array(o.numTotalDataCodewords);for(let{codewords:e,numDataCodewords:t}of w){let[n,r]=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t){let n=new Int32Array(e),r=e.length-t,i=new ex().decode(n,r);return[n,i]}(e,t);a.set(n.subarray(0,t),s),l+=r,s+=t}return[a,l]}class eE{#em;constructor({decode:e=eI}={}){this.#em=e}decode(e){let t,r,i,s=0,l=!1,o=new em(e);try{t=o.readVersion(),i=o.readFormatInfo(),[r,s]=ez(o,t,i)}catch{null!=i&&o.remask(i.mask),o.mirror(),l=!0,t=o.readVersion(),i=o.readFormatInfo(),[r,s]=ez(o,t,i)}return new X(function(e,t,r){let i,s,l,o="",w=-1,a=!1,u=!1,f=!1,h=!1,c=new ee(e);do switch(s=4>c.available()?en.TERMINATOR:function(e){let t=et.get(e);if(null!=t)return t;throw Error("illegal mode bits")}(c.read(4))){case en.TERMINATOR:break;case en.FNC1_FIRST_POSITION:a=!0;break;case en.FNC1_SECOND_POSITION:u=!0,w=c.read(8);break;case en.STRUCTURED_APPEND:if(16>c.available())throw Error("illegal structured append");h=Object.freeze({index:c.read(4),count:c.read(4)+1,parity:c.read(8)});break;case en.ECI:l=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e){let t=e.read(8);if((128&t)==0)return 127&t;if((192&t)==128)return(63&t)<<8|e.read(8);if((224&t)==192)return(31&t)<<16|e.read(16);throw Error("illegal extended channel interpretation value")}(c);break;default:if(s===en.HANZI&&1!==c.read(4))throw Error("illegal hanzi subset");let d=c.read(s.getCharacterCountBits(t));switch(s){case en.ALPHANUMERIC:o+=function(e,t,r){let i="";for(;t>1;){if(11>e.available())throw Error("illegal bits length");let r=e.read(11);i+=n(ea,r/45)+n(ea,r%45),t-=2}if(1===t){if(6>e.available())throw Error("illegal bits length");i+=n(ea,e.read(6))}return r?eu(i):i}(c,d,a||u);break;case en.BYTE:o+=function(e,t,n,r,i){if(e.available()<8*t)throw Error("illegal bits length");let s=new Uint8Array(t),l=null!=i?function(e){let t=er.get(e);if(t)return t;throw Error("illegal charset value")}(i):ei.ISO_8859_1;for(let n=0;n<t;n++)s[n]=e.read(8);let o=n(s,l);return r?eu(o):o}(c,d,r,a||u,l);break;case en.HANZI:o+=function(e,t){if(e.available()<13*t)throw Error("illegal bits length");let n=0,r=new Uint8Array(2*t);for(;t>0;){let i=e.read(13),s=i/96<<8|i%96;s<2560?s+=41377:s+=42657,r[n]=s>>8&255,r[n+1]=255&s,t--,n+=2}return new TextDecoder("gb2312").decode(r)}(c,d);break;case en.KANJI:o+=function(e,t){if(e.available()<13*t)throw Error("illegal bits length");let n=0,r=new Uint8Array(2*t);for(;t>0;){let i=e.read(13),s=i/192<<8|i%192;s<7936?s+=33088:s+=49472,r[n]=s>>8&255,r[n+1]=255&s,t--,n+=2}return new TextDecoder("shift-jis").decode(r)}(c,d);break;case en.NUMERIC:o+=function(e,t){let r="";for(;t>=3;){if(10>e.available())throw Error("illegal bits length");let i=e.read(10);if(i>=1e3)throw Error("illegal numeric codeword");r+=n(ew,i/100)+n(ew,i/10%10)+n(ew,i%10),t-=3}if(2===t){if(7>e.available())throw Error("illegal bits length");let t=e.read(7);if(t>=100)throw Error("illegal numeric codeword");r+=n(ew,t/10)+n(ew,t%10)}else if(1===t){if(4>e.available())throw Error("illegal bits length");let t=e.read(4);if(t>=10)throw Error("illegal numeric codeword");r+=n(ew,t)}return r}(c,d);break;default:throw Error("illegal mode")}}while(s!==en.TERMINATOR);return a?f=Object.freeze(["GS1"]):u&&(f=Object.freeze(["AIM",w])),i=null!=l?a?4:u?6:2:a?3:u?5:1,{content:o,codewords:e,structured:h,symbology:`]Q${i}`,fnc1:f}}(r,t,this.#em),t,i,s,l)}}function eC(e){return{x:e.x,y:e.y}}function eS(e){return{x:e.x,y:e.y,moduleSize:e.moduleSize}}self.addEventListener("message",async e=>{let{data:t}=e,{uid:n,image:r}=t,{width:i,height:a}=r,u=new OffscreenCanvas(i,a).getContext("2d");u.drawImage(r,0,0);let f=function(e,t,n){if(e.length!==t*n)throw Error("luminances length must be equals to width * height");return t<40||n<40?function(e,t,n){let r=new s(t,n),i=new Int32Array(32);for(let r=1;r<5;r++){let s=0|4*t/5,l=(0|n*r/5)*t;for(let n=0|t/5;n<s;n++){let t=e[l+n];i[t>>3]++}}let l=function(e){let t=0,n=0,r=0,{length:i}=e;for(let s=0;s<i;s++)e[s]>n&&(t=s,n=e[s]),e[s]>r&&(r=e[s]);let s=0,l=0;for(let n=0;n<i;n++){let r=n-t,i=e[n]*r*r;i>l&&(s=n,l=i)}if(t>s&&([t,s]=[s,t]),s-t<=2)return -1;let o=-1,w=s-1;for(let n=s-1;n>t;n--){let i=n-t,l=i*i*(s-n)*(r-e[n]);l>o&&(w=n,o=l)}return w<<3}(i);if(l>0)for(let i=0;i<n;i++){let n=i*t;for(let s=0;s<t;s++)e[n+s]<l&&r.set(s,i)}return r}(e,t,n):function(e,t,n){let r=t-8,i=n-8,a=l(t),u=l(n),f=new s(t,n),h=function(e,t,n){let r=[],i=t-8,s=n-8,o=l(t),a=l(n);for(let n=0;n<a;n++){r[n]=new Int32Array(o);let l=w(n,s);for(let s=0;s<o;s++){let o=0,a=0,u=255,f=w(s,i);for(let n=0,r=l*t+f;n<8;n++,r+=t){for(let t=0;t<8;t++){let n=e[r+t];o+=n,n<u&&(u=n),n>a&&(a=n)}if(a-u>24)for(n++,r+=t;n<8;n++,r+=t)for(let t=0;t<8;t++)o+=e[r+t]}let h=o>>6;if(a-u<=24&&(h=u/2,n>0&&s>0)){let e=(r[n-1][s]+2*r[n][s-1]+r[n-1][s-1])/4;u<e&&(h=e)}r[n][s]=h}}return r}(e,t,n);for(let n=0;n<u;n++){let s=o(n,u-3),l=w(n,i);for(let n=0;n<a;n++){let i=0,u=o(n,a-3),c=w(n,r);for(let e=-2;e<=2;e++){let t=h[s+e];i+=t[u-2]+t[u-1]+t[u]+t[u+1]+t[u+2]}let d=i/25;for(let n=0,r=l*t+c;n<8;n++,r+=t)for(let t=0;t<8;t++)e[r+t]<=d&&f.set(c+t,l+n)}}return f}(e,t,n)}(function(e){let{data:t,width:n,height:r}=e,i=new Uint8Array(n*r);for(let e=0;e<r;e++){let r=e*n;for(let e=0;e<n;e++){let n=4*(r+e),s=t[n],l=t[n+1],o=t[n+2];i[r+e]=306*s+601*l+117*o+512>>10}}return i}(u.getImageData(0,0,i,a)),i,a);t.invert&&f.flip();let h=new W({strict:t.strict}).detect(f),c=[],d=new eE,g=h.next();for(;!g.done;){let e=!1,t=g.value;try{let{size:n,finder:r,alignment:i}=t,s=d.decode(t.matrix),{topLeft:l,topRight:o,bottomLeft:w}=r,a=t.mapping(0,0),u=t.mapping(n,0),f=t.mapping(n,n),h=t.mapping(0,n),g=t.mapping(6.5,6.5),m=t.mapping(n-6.5,6.5),b=t.mapping(6.5,n-6.5);c.push({fnc1:s.fnc1,mask:s.mask,level:s.level,mirror:s.mirror,content:s.content,version:s.version,corrected:s.corrected,symbology:s.symbology,structured:s.structured,alignment:i?eS(i):null,finder:[eS(l),eS(o),eS(w)],timing:[eC(g),eC(m),eC(b)],corners:[eC(a),eC(u),eC(f),eC(h)]}),e=!0}catch{}g=h.next(e)}c.length>0?self.postMessage({type:"ok",payload:{uid:n,image:r,items:c}},[r]):self.postMessage({type:"error",message:"未发现二维码"})})}();