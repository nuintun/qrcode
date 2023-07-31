!function(){"use strict";function e(e){return 0|e+(e<0?-.5:.5)}function t(e){return e-=e>>1&1431655765,((e=(858993459&e)+(e>>2&858993459))+(e>>4)&252645135)*16843009>>24}function n(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:e.length,r=0;for(let i=t;i<n;i++)r+=e[i];return r}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class r{#e;#t;#n;#r;constructor(e,t,n){let r=Math.ceil(e/32),i=r*t;if(this.#e=e,this.#t=t,this.#n=r,n instanceof Int32Array){if(n.length!==i)throw Error(`matrix bits capacity mismatch: ${i}`);this.#r=n}else this.#r=new Int32Array(i)}#i(e,t){return t*this.#n+(0|e/32)}get width(){return this.#e}get height(){return this.#t}set(e,t){let n=this.#i(e,t);this.#r[n]|=1<<(31&e)}get(e,t){let n=this.#i(e,t);return this.#r[n]>>>(31&e)&1}flip(e,t){if(null!=e&&null!=t){let n=this.#i(e,t);this.#r[n]^=1<<(31&e)}else{let e=this.#r,{length:t}=e;for(let n=0;n<t;n++)e[n]=~e[n]}}clone(){return new r(this.#e,this.#t,new Int32Array(this.#r))}setRegion(e,t,n,r){let i=this.#r,s=e+n,o=t+r,w=this.#n;for(let n=t;n<o;n++){let t=n*w;for(let n=e;n<s;n++)i[t+(0|n/32)]|=1<<(31&n)}}}function i(e){let t=e>>3;return 7&e&&t++,t}function s(e,t){return e<2?2:Math.min(e,t)}function o(e,t){return(e<<=3)>t?t:e}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class w{#s;#o;constructor(e,t){this.#s=e,this.#o=t}get x(){return this.#s}get y(){return this.#o}}function l(e,t){return Math.sqrt(a(e,t))}function a(e,t){let n=e.x-t.x,r=e.y-t.y;return n*n+r*r}function f(e,t,n){let{x:r,y:i}=e,{x:s,y:o}=t,{x:w,y:l}=n;return Math.abs(r*(o-l)+s*(l-i)+w*(i-o))/2}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class u{#w;#l;constructor(e,t){this.#w=e,this.#l=t}sample(e,t){let n=this.#w,i=n.width,s=this.#l,o=n.height,w=new r(e,t);for(let r=0;r<t;r++)for(let t=0;t<e;t++){let[e,l]=s.mapping(t+.5,r+.5),a=0|e,f=0|l;a>=0&&f>=0&&a<i&&f<o&&n.get(a,f)&&w.set(t,r)}return w}}class h extends w{#a;#e;#t;#f;#u;#h=1;#c;#d;static noise(e){return e.#a}static width(e){return e.#e}static height(e){return e.#t}static combined(e){return e.#h}static rect(e){return e.#f}constructor(e,t,n,r,i,s){super(t,n);let{modules:o}=e,w=r/2,l=i/2,a=r/o,f=i/o,u=a/2,h=f/2,c=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e){let{ratios:t}=e;return t[0|t.length/2]/2}(e),d=(a+f)/2;this.#a=s,this.#e=r,this.#t=i,this.#c=e,this.#u=d,this.#f=[t-w+u,n-l+h,t+w-u,n+l-h],this.#d=d*c}get moduleSize(){return this.#u}equals(e,t,n,r){let{modules:i}=this.#c,s=this.#d;if(Math.abs(e-this.x)<=s&&Math.abs(t-this.y)<=s){let e=this.#u,t=Math.abs((n+r)/i/2-e);if(t<=1||t<=e)return!0}return!1}combine(e,t,n,r,i){let s=this.#h,o=s+1,w=(this.x*s+e)/o,l=(this.y*s+t)/o,a=(this.#a*s+i)/o,f=(this.#e*s+n)/o,u=(this.#t*s+r)/o,c=new h(this.#c,w,l,f,u,a);return c.#h=o,c}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class c{#g;#m;constructor(e,t){this.#g=e,this.#m=t}get count(){return this.#g}get numDataCodewords(){return this.#m}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class d{#b;#y;#p;#x;#I;constructor(e,...t){let n=0,r=0;for(let{count:e,numDataCodewords:i}of t)n+=e,r+=i*e;let i=e*n;this.#b=t,this.#p=i,this.#x=r,this.#I=e,this.#y=r+i}get ecBlocks(){return this.#b}get numTotalCodewords(){return this.#y}get numTotalECCodewords(){return this.#p}get numTotalDataCodewords(){return this.#x}get numECCodewordsPerBlock(){return this.#I}}let g=[31892,34236,39577,42195,48118,51042,55367,58893,63784,68472,70749,76311,79154,84390,87683,92361,96236,102084,102881,110507,110734,117786,119615,126325,127568,133589,136944,141498,145311,150283,152622,158308,161089,167017];class m{#z;#S;#b;#C;constructor(e,t,...n){this.#S=e,this.#b=n,this.#z=17+4*e,this.#C=t}get size(){return this.#z}get version(){return this.#S}get alignmentPatterns(){return this.#C}getECBlocks(e){let{level:t}=e;return this.#b[t]}}let b=[new m(1,[],new d(7,new c(1,19)),new d(10,new c(1,16)),new d(13,new c(1,13)),new d(17,new c(1,9))),new m(2,[6,18],new d(10,new c(1,34)),new d(16,new c(1,28)),new d(22,new c(1,22)),new d(28,new c(1,16))),new m(3,[6,22],new d(15,new c(1,55)),new d(26,new c(1,44)),new d(18,new c(2,17)),new d(22,new c(2,13))),new m(4,[6,26],new d(20,new c(1,80)),new d(18,new c(2,32)),new d(26,new c(2,24)),new d(16,new c(4,9))),new m(5,[6,30],new d(26,new c(1,108)),new d(24,new c(2,43)),new d(18,new c(2,15),new c(2,16)),new d(22,new c(2,11),new c(2,12))),new m(6,[6,34],new d(18,new c(2,68)),new d(16,new c(4,27)),new d(24,new c(4,19)),new d(28,new c(4,15))),new m(7,[6,22,38],new d(20,new c(2,78)),new d(18,new c(4,31)),new d(18,new c(2,14),new c(4,15)),new d(26,new c(4,13),new c(1,14))),new m(8,[6,24,42],new d(24,new c(2,97)),new d(22,new c(2,38),new c(2,39)),new d(22,new c(4,18),new c(2,19)),new d(26,new c(4,14),new c(2,15))),new m(9,[6,26,46],new d(30,new c(2,116)),new d(22,new c(3,36),new c(2,37)),new d(20,new c(4,16),new c(4,17)),new d(24,new c(4,12),new c(4,13))),new m(10,[6,28,50],new d(18,new c(2,68),new c(2,69)),new d(26,new c(4,43),new c(1,44)),new d(24,new c(6,19),new c(2,20)),new d(28,new c(6,15),new c(2,16))),new m(11,[6,30,54],new d(20,new c(4,81)),new d(30,new c(1,50),new c(4,51)),new d(28,new c(4,22),new c(4,23)),new d(24,new c(3,12),new c(8,13))),new m(12,[6,32,58],new d(24,new c(2,92),new c(2,93)),new d(22,new c(6,36),new c(2,37)),new d(26,new c(4,20),new c(6,21)),new d(28,new c(7,14),new c(4,15))),new m(13,[6,34,62],new d(26,new c(4,107)),new d(22,new c(8,37),new c(1,38)),new d(24,new c(8,20),new c(4,21)),new d(22,new c(12,11),new c(4,12))),new m(14,[6,26,46,66],new d(30,new c(3,115),new c(1,116)),new d(24,new c(4,40),new c(5,41)),new d(20,new c(11,16),new c(5,17)),new d(24,new c(11,12),new c(5,13))),new m(15,[6,26,48,70],new d(22,new c(5,87),new c(1,88)),new d(24,new c(5,41),new c(5,42)),new d(30,new c(5,24),new c(7,25)),new d(24,new c(11,12),new c(7,13))),new m(16,[6,26,50,74],new d(24,new c(5,98),new c(1,99)),new d(28,new c(7,45),new c(3,46)),new d(24,new c(15,19),new c(2,20)),new d(30,new c(3,15),new c(13,16))),new m(17,[6,30,54,78],new d(28,new c(1,107),new c(5,108)),new d(28,new c(10,46),new c(1,47)),new d(28,new c(1,22),new c(15,23)),new d(28,new c(2,14),new c(17,15))),new m(18,[6,30,56,82],new d(30,new c(5,120),new c(1,121)),new d(26,new c(9,43),new c(4,44)),new d(28,new c(17,22),new c(1,23)),new d(28,new c(2,14),new c(19,15))),new m(19,[6,30,58,86],new d(28,new c(3,113),new c(4,114)),new d(26,new c(3,44),new c(11,45)),new d(26,new c(17,21),new c(4,22)),new d(26,new c(9,13),new c(16,14))),new m(20,[6,34,62,90],new d(28,new c(3,107),new c(5,108)),new d(26,new c(3,41),new c(13,42)),new d(30,new c(15,24),new c(5,25)),new d(28,new c(15,15),new c(10,16))),new m(21,[6,28,50,72,94],new d(28,new c(4,116),new c(4,117)),new d(26,new c(17,42)),new d(28,new c(17,22),new c(6,23)),new d(30,new c(19,16),new c(6,17))),new m(22,[6,26,50,74,98],new d(28,new c(2,111),new c(7,112)),new d(28,new c(17,46)),new d(30,new c(7,24),new c(16,25)),new d(24,new c(34,13))),new m(23,[6,30,54,78,102],new d(30,new c(4,121),new c(5,122)),new d(28,new c(4,47),new c(14,48)),new d(30,new c(11,24),new c(14,25)),new d(30,new c(16,15),new c(14,16))),new m(24,[6,28,54,80,106],new d(30,new c(6,117),new c(4,118)),new d(28,new c(6,45),new c(14,46)),new d(30,new c(11,24),new c(16,25)),new d(30,new c(30,16),new c(2,17))),new m(25,[6,32,58,84,110],new d(26,new c(8,106),new c(4,107)),new d(28,new c(8,47),new c(13,48)),new d(30,new c(7,24),new c(22,25)),new d(30,new c(22,15),new c(13,16))),new m(26,[6,30,58,86,114],new d(28,new c(10,114),new c(2,115)),new d(28,new c(19,46),new c(4,47)),new d(28,new c(28,22),new c(6,23)),new d(30,new c(33,16),new c(4,17))),new m(27,[6,34,62,90,118],new d(30,new c(8,122),new c(4,123)),new d(28,new c(22,45),new c(3,46)),new d(30,new c(8,23),new c(26,24)),new d(30,new c(12,15),new c(28,16))),new m(28,[6,26,50,74,98,122],new d(30,new c(3,117),new c(10,118)),new d(28,new c(3,45),new c(23,46)),new d(30,new c(4,24),new c(31,25)),new d(30,new c(11,15),new c(31,16))),new m(29,[6,30,54,78,102,126],new d(30,new c(7,116),new c(7,117)),new d(28,new c(21,45),new c(7,46)),new d(30,new c(1,23),new c(37,24)),new d(30,new c(19,15),new c(26,16))),new m(30,[6,26,52,78,104,130],new d(30,new c(5,115),new c(10,116)),new d(28,new c(19,47),new c(10,48)),new d(30,new c(15,24),new c(25,25)),new d(30,new c(23,15),new c(25,16))),new m(31,[6,30,56,82,108,134],new d(30,new c(13,115),new c(3,116)),new d(28,new c(2,46),new c(29,47)),new d(30,new c(42,24),new c(1,25)),new d(30,new c(23,15),new c(28,16))),new m(32,[6,34,60,86,112,138],new d(30,new c(17,115)),new d(28,new c(10,46),new c(23,47)),new d(30,new c(10,24),new c(35,25)),new d(30,new c(19,15),new c(35,16))),new m(33,[6,30,58,86,114,142],new d(30,new c(17,115),new c(1,116)),new d(28,new c(14,46),new c(21,47)),new d(30,new c(29,24),new c(19,25)),new d(30,new c(11,15),new c(46,16))),new m(34,[6,34,62,90,118,146],new d(30,new c(13,115),new c(6,116)),new d(28,new c(14,46),new c(23,47)),new d(30,new c(44,24),new c(7,25)),new d(30,new c(59,16),new c(1,17))),new m(35,[6,30,54,78,102,126,150],new d(30,new c(12,121),new c(7,122)),new d(28,new c(12,47),new c(26,48)),new d(30,new c(39,24),new c(14,25)),new d(30,new c(22,15),new c(41,16))),new m(36,[6,24,50,76,102,128,154],new d(30,new c(6,121),new c(14,122)),new d(28,new c(6,47),new c(34,48)),new d(30,new c(46,24),new c(10,25)),new d(30,new c(2,15),new c(64,16))),new m(37,[6,28,54,80,106,132,158],new d(30,new c(17,122),new c(4,123)),new d(28,new c(29,46),new c(14,47)),new d(30,new c(49,24),new c(10,25)),new d(30,new c(24,15),new c(46,16))),new m(38,[6,32,58,84,110,136,162],new d(30,new c(4,122),new c(18,123)),new d(28,new c(13,46),new c(32,47)),new d(30,new c(48,24),new c(14,25)),new d(30,new c(42,15),new c(32,16))),new m(39,[6,26,54,82,110,138,166],new d(30,new c(20,117),new c(4,118)),new d(28,new c(40,47),new c(7,48)),new d(30,new c(43,24),new c(22,25)),new d(30,new c(10,15),new c(67,16))),new m(40,[6,30,58,86,114,142,170],new d(30,new c(19,118),new c(6,119)),new d(28,new c(18,47),new c(31,48)),new d(30,new c(34,24),new c(34,25)),new d(30,new c(20,15),new c(61,16)))];/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class y{#E;#A;#v;#k;#M;#O;constructor(e,t){let n=0|t.x,r=0|t.y,i=0|e.x,s=0|e.y,o=Math.abs(r-s)>Math.abs(n-i);o&&([i,s,n,r]=[s,i,r,n]);let l=i<n?1:-1;this.#k=o,this.#v=n+l,this.#E=new w(n,r),this.#A=new w(i,s),this.#M=[l,s<r?1:-1],this.#O=[Math.abs(n-i),Math.abs(r-s)]}*points(){let e=this.#v,t=this.#k,{y:n}=this.#E,[r,i]=this.#M,[s,o]=this.#O,{x:w,y:l}=this.#A,a=0|-s/2;for(let f=w,u=l;f!==e;f+=r)if(yield[t?u:f,t?f:u],(a+=o)>0){if(u===n)break;u+=i,a-=s}}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function p(e,t,n){let r=0,{width:i,height:s}=e,o=(t.x+n.x)/2,a=(t.y+n.y)/2,f=new w(o,a),u=new y(t,f).points();for(let[n,o]of u){if(n<0||o<0||n>=i||o>=s){if(2===r)return l(t,new w(n,o));break}if(1===r==(1===e.get(n,o))){if(2===r)return l(t,new w(n,o));r++}}return NaN}function x(e,t,n){let r=p(e,t,n);if(Number.isNaN(r))return NaN;let{x:i,y:s}=n,{x:o,y:l}=t,a=p(e,t,new w(o-(i-o),l-(s-l)));return Number.isNaN(a)?NaN:r+a-1}function I(e,t,n){let r=new w(0|t.x,0|t.y),i=new w(0|n.x,0|n.y),s=x(e,r,i),o=x(e,i,r);return Number.isNaN(s)?o/7:Number.isNaN(o)?s/7:(s+o)/14}function z(e,t){var n,r,i,s;let o=Math.max((n=h.width(e))>(r=h.width(t))?n/r:r/n,(i=h.height(e))>(s=h.height(t))?i/s:s/i);return o*o}class S{#T;#z;#w;#N;#u;#_;#R;static area(e){let[t,n,r]=e.#_,i=S.bottomRight(e);if(null==e.#T){let s=f(t,n,i),o=f(i,r,t);e.#T=s+o}return e.#T}static moduleSizes(e){if(null==e.#R){let t=e.#w,[n,r,i]=e.#_;e.#R=[I(t,n,r),I(t,n,i)]}return e.#R}static size(t){if(null==t.#z){let n=S.moduleSize(t);t.#z=function(t,n){let[r,i,s]=t,o=l(r,i),w=l(r,s),a=e((o+w)/n/2)+7;switch(3&a){case 0:return a+1;case 2:return a-1;case 3:return Math.min(a+2,177)}return a}(t.#_,n)}return t.#z}static moduleSize(e){return null==e.#u&&(e.#u=n(S.moduleSizes(e))/2),e.#u}static contains(e,t){let n=S.area(e),[r,i,s]=e.#_,o=S.bottomRight(e),w=f(r,i,t),l=f(i,o,t),a=f(o,s,t),u=f(s,r,t);return w+l+a+u-n<1}static bottomRight(e){return null==e.#N&&(e.#N=function(e){let[t,n,r]=e,{x:i,y:s}=t,o=n.x+r.x-i,l=n.y+r.y-s;return new w(o,l)}(e.#_)),e.#N}constructor(e,t){this.#w=e,this.#_=function(e){let t,n,r;let[i,s,o]=e,w=a(i,s)*z(i,s),l=a(i,o)*z(i,o),f=a(s,o)*z(s,o);return f>=w&&f>=l?[t,r,n]=e:l>=f&&l>=w?[r,t,n]=e:[r,n,t]=e,0>function(e,t,n){let{x:r,y:i}=t;return(n.x-r)*(e.y-i)-(n.y-i)*(e.x-r)}(r,t,n)&&([r,n]=[n,r]),[t,n,r]}(t)}get topLeft(){return this.#_[0]}get topRight(){return this.#_[1]}get bottomLeft(){return this.#_[2]}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class C{#w;#D;#P;#l;constructor(e,t,n,r){let i=new u(e,t),s=S.size(n);this.#w=e,this.#l=t,this.#P=n,this.#D=r,this.#w=i.sample(s,s)}get matrix(){return this.#w}get finder(){return this.#P}get alignment(){return this.#D}get size(){return S.size(this.#P)}get moduleSize(){return S.moduleSize(this.#P)}mapping(e,t){return[e,t]=this.#l.mapping(e,t),new w(e,t)}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class E{#B;#U;#L;#F;#Z;#H;#$;#j;#q;constructor(e,t,n,r,i,s,o,w,l){this.#B=e,this.#U=r,this.#L=o,this.#F=t,this.#Z=i,this.#H=w,this.#$=n,this.#j=s,this.#q=l}buildAdjoint(){let e=this.#B,t=this.#U,n=this.#L,r=this.#F,i=this.#Z,s=this.#H,o=this.#$,w=this.#j,l=this.#q;return new E(i*l-s*w,s*o-r*l,r*w-i*o,n*w-t*l,e*l-n*o,t*o-e*w,t*s-n*i,n*r-e*s,e*i-t*r)}times(e){let t=this.#B,n=this.#U,r=this.#L,i=this.#F,s=this.#Z,o=this.#H,w=this.#$,l=this.#j,a=this.#q,f=e.#B,u=e.#U,h=e.#L,c=e.#F,d=e.#Z,g=e.#H,m=e.#$,b=e.#j,y=e.#q;return new E(t*f+i*u+w*h,t*c+i*d+w*g,t*m+i*b+w*y,n*f+s*u+l*h,n*c+s*d+l*g,n*m+s*b+l*y,r*f+o*u+a*h,r*c+o*d+a*g,r*m+o*b+a*y)}mapping(e,t){let n=this.#B,r=this.#U,i=this.#L,s=this.#F,o=this.#Z,w=this.#H,l=this.#$,a=this.#j,f=this.#q,u=i*e+w*t+f;return[(n*e+s*t+l)/u,(r*e+o*t+a)/u]}}function A(e,t,n,r,i,s,o,w){let l=e-n+i-o,a=t-r+s-w;if(0===l&&0===a)return new E(n-e,i-n,e,r-t,s-r,t,0,0,1);{let f=n-i,u=o-i,h=r-s,c=w-s,d=f*c-u*h,g=(l*c-u*a)/d,m=(f*a-l*h)/d;return new E(n-e+g*n,o-e+m*o,e,r-t+g*r,w-t+m*w,t,g,m,1)}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function v(e,t){let n,r,i,s;let{x:o,y:w}=e.topLeft,{x:l,y:a}=e.topRight,{x:f,y:u}=e.bottomLeft,h=S.size(e)-3.5;return null!=t?(n=t.x,r=t.y,s=i=h-3):(n=l+f-o,r=a+u-w,i=h,s=h),function(e,t,n,r,i,s,o,w,l,a,f,u,h,c,d,g){let m=A(3.5,3.5,n,3.5,i,s,3.5,w).buildAdjoint(),b=A(l,a,f,u,h,c,d,g);return b.times(m)}(0,0,h,0,i,s,0,h,o,w,l,a,n,r,f,u)}function k(e,t){let[n,,r]=h.rect(e);return t>0?r:t<0?n:e.x}function M(e,t){let[,n,,r]=h.rect(e);return t>0?r:t<0?n:e.y}function O(e,t,n,r){let{x:i,y:s}=t,{x:o,y:l}=e,{x:a,y:f}=n,u=a>i?1:a<i?-1:0,h=f>s?1:f<s?-1:0,c=k(t,u),d=M(t,h),g=k(e,u),m=M(e,h);return 0===u||0===h?[new w(g,m),new w(c,d)]:(r?u===h:u!==h)?[new w(o,m),new w(i,d)]:[new w(g,l),new w(c,s)]}function T(e,t,n,r){let i=r+8,s=new y(t,n).points(),o=1,w=e.get(0|t.x,0|t.y);for(let[t,n]of s){let r=e.get(t,n);if(r!==w&&(o++,w=r,o>i))return!1}return o>=r-14-Math.max(2,(r-17)/4)}function N(e,t,n){let{topLeft:r,topRight:i,bottomLeft:s}=t,[o,w]=n?O(r,s,i,!0):O(r,i,s);return T(e,o,w,S.size(t))}function _(e,t,n,r){let[i,s]=t.mapping(r?6.5:7.5,r?7.5:6.5),[o,l]=t.mapping(r?6.5:n-7.5,r?n-7.5:6.5);return T(e,new w(i,s),new w(o,l),n)}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class R{#G;#c;constructor(e){this.#c=e,this.#G=n(e)}get modules(){return this.#G}get ratios(){return this.#c}}let D=new R([1,1,3,1,1]),P=new R([1,1,1,1,1]),B=new R([1,1,1]);function U(e,t){let{length:n}=e,r=n-1;for(let t=0;t<r;t++)e[t]=e[t+1];e[r]=t}function L(e,t,n,r,i){let s=-1,o=t|=0,w=n|=0,l=[0,0,0,0,0],{width:a,height:f}=e,u=i?-1:1,h=()=>{o+=s,w-=s*u},c=()=>e.get(o,w);for(;o>=0&&w>=0&&w<f&&c();)h(),l[2]++;for(;o>=0&&w>=0&&w<f&&!c();)h(),l[1]++;for(;o>=0&&w>=0&&w<f&&l[0]<r&&c();)h(),l[0]++;for(o=t+(s=1),w=n-s*u;o<a&&w>=0&&w<f&&c();)h(),l[2]++;for(;o<a&&w>=0&&w<f&&!c();)h(),l[3]++;for(;o<a&&w>=0&&w<f&&l[4]<r&&c();)h(),l[4]++;return l}function F(e,t){let r=[],i=0|e.length/2;for(let t=0;t<=i;t++){let s=i+t+1;r.push(n(e,i-t,s)/2+n(e,s))}return t-(2*r[0]+n(r,1))/(i+2)}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let Z=Math.PI/180,H=40*Z,$=140*Z;function j(e,t,n,r,i,s){let[o,w]=function(e,t,n,r,i){t|=0,n|=0;let s=i?n:t,o=[0,0,0,0,0],w=i?e.height:e.width,l=()=>i?e.get(t,s):e.get(s,n);for(;s>=0&&l();)s--,o[2]++;for(;s>=0&&!l();)s--,o[1]++;for(;s>=0&&o[0]<r&&l();)s--,o[0]++;for(s=(i?n:t)+1;s<w&&l();)s++,o[2]++;for(;s<w&&!l();)s++,o[3]++;for(;s<w&&o[4]<r&&l();)s++,o[4]++;return[o,s]}(e,t,n,r,s);return[G(o,i)?F(o,w):NaN,o]}function q(e,t,n){return e>t&&([e,t]=[t,e]),t-e<=t*n}function G(e,t){let{ratios:n,modules:r}=t,{length:i}=e,s=function(e){let t=0;for(let n of e){if(0===n)return NaN;t+=n}return t}(e);if(s>=r){let t=s/r,o=.625*t+.5;for(let r=0;r<i;r++){let i=n[r],s=e[r],w=Math.abs(s-t*i);if(w>o)return!1}return!0}return!1}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class J{#J;#w;#c;#_=[];constructor(e,t,n){this.#w=e,this.#c=t,this.#J=n}get matrix(){return this.#w}get patterns(){return this.#_}match(e,t,r,i){let s=this.#w,o=this.#c,w=F(r,e),[l,a]=j(s,w,t,i,o,!0);if(l>=0){let e;if([w,e]=j(s,w,l,i,o),w>=0){let t=L(s,w,l,i),r=L(s,w,l,i,!0);if(this.#J?G(t,o)&&G(r,o):G(t,o)||G(r,o)){let i=function(e){for(var t=arguments.length,r=Array(t>1?t-1:0),i=1;i<t;i++)r[i-1]=arguments[i];let s=0,o=0,{length:w}=r,l=[];for(let t of r){let[r,i]=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t){let{ratios:r,modules:i}=t,s=0,{length:o}=r,w=n(e),l=w/i;for(let t=0;t<o;t++)s+=Math.abs(e[t]-r[t]*l);return[s/w,l]}(t,e);s+=r,l.push(i)}let a=n(l),f=a/w;for(let e of l)o+=Math.abs(e-f);return s+o/a}(o,e,a,t,r),s=n(e),f=n(a),u=this.#_,{length:c}=u,d=!1;for(let e=0;e<c;e++){let t=u[e];if(t.equals(w,l,s,f)){d=!0,u[e]=t.combine(w,l,s,f,i);break}}d||u.push(new h(o,w,l,s,f,i))}}}}}class K extends J{constructor(e,t){super(e,D,t)}*groups(){let t=this.patterns.filter(e=>h.combined(e)>=3&&1.5>=h.noise(e)),{length:n}=t;if(3===n){let e=new S(this.matrix,t),n=S.size(e);n>=21&&n<=177&&(yield e)}else if(n>3){let r=n-2,i=n-1,s=new Map;for(let o=0;o<r;o++){let r=t[o],w=r.moduleSize;if(!s.has(r))for(let a=o+1;a<i;a++){let i=t[a],o=i.moduleSize;if(s.has(r))break;if(!s.has(i)&&q(w,o,.5))for(let f=a+1;f<n;f++){let n=t[f],a=n.moduleSize;if(s.has(r)||s.has(i))break;if(!q(w,a,.5)||!q(o,a,.5))continue;let{matrix:u}=this,c=new S(u,[r,i,n]),d=function(e){let{topLeft:t,topRight:n,bottomLeft:r}=e,{x:i,y:s}=t,o=n.x-i,w=n.y-s,l=r.x-i,a=r.y-s;return Math.acos((o*l+w*a)/Math.sqrt((o*o+w*w)*(l*l+a*a)))}(c);if(d>=H&&d<=$){let[o,w]=S.moduleSizes(c);if(o>=1&&w>=1){let{topLeft:a,topRight:f,bottomLeft:d}=c,g=l(a,f),m=l(a,d),b=e(g/o),y=e(m/w);if(4>=Math.abs(b-y)){let e=S.size(c);e>=21&&e<=177&&!/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t,n){let r=0,{topLeft:i,topRight:s,bottomLeft:o}=e;for(let w of t)if(w!==i&&w!==s&&w!==o){let t;if(n.has(w)&&(t=S.contains(e,w))||1>h.noise(w)&&(null==t?S.contains(e,w):t)&&++r>3)return!0}return!1}(c,t,s)&&(N(u,c)||N(u,c,!0))&&(yield c)&&(s.set(r,!0),s.set(i,!0),s.set(n,!0))}}}}}}}}find(e,t,n,r){let{matrix:i}=this,s=e+n,o=t+r,w=(e,t,n,r,i,s)=>{U(n,r),U(i,s),1===i[0]&&0===i[1]&&1===i[2]&&0===i[3]&&1===i[4]&&G(n,D)&&this.match(e,t,n,n[2])};for(let n=t;n<o;n++){let t=e;for(;t<s&&!i.get(t,n);)t++;let r=0,o=i.get(t,n),l=[0,0,0,0,0],a=[-1,-1,-1,-1,-1];for(;t<s;){let e=i.get(t,n);e===o?r++:(w(t,n,l,r,a,o),r=1,o=e),t++}w(t,n,l,r,a,o)}}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class Q extends J{constructor(e,t){super(e,P,t)}filter(e,t){let n=this.patterns.filter(e=>2.5>=h.noise(e)&&q(e.moduleSize,t,.5));n.length>1&&n.sort((n,r)=>{let i=h.noise(n),s=h.noise(r),o=Math.abs(n.moduleSize-t),w=Math.abs(r.moduleSize-t),a=(l(n,e)+o)*i,f=(l(r,e)+w)*s;return a-f});let r=n.slice(0,2);return r.push(e),r}find(e,t,n,r){let{matrix:i}=this,s=e+n,o=t+r,w=(e,t,n,r,i,s)=>{U(n,r),U(i,s),0===i[0]&&1===i[1]&&0===i[2]&&G(n,B)&&this.match(e,t,n,n[1])};for(let n=t;n<o;n++){let t=e;for(;t<s&&!i.get(t,n);)t++;let r=0,o=i.get(t,n),l=[0,0,0],a=[-1,-1,-1];for(;t<s;){let e=i.get(t,n);e===o?r++:(w(t,n,l,r,a,o),r=1,o=e),t++}w(t,n,l,r,a,o)}}}class V{#K;constructor(e={}){this.#K=e}*detect(e){let{strict:t}=this.#K,{width:n,height:r}=e,i=new K(e,t);i.find(0,0,n,r);let s=i.groups(),o=s.next();for(;!o.done;){let n=!1,r=o.value,i=S.size(r);if(i>=25){let s=function(e,t,n){let r=S.size(t),i=Math.min(20,0|r/4),s=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e){let{x:t,y:n}=e.topLeft,r=S.size(e),i=1-3/(r-7),s=S.bottomRight(e),[o,w]=S.moduleSizes(e),l=t+(s.x-t)*i,a=n+(s.y-n)*i;return new h(P,l,a,5*o,5*w,0)}(t),o=new Q(e,n),w=S.moduleSize(t),{x:l,y:a}=s,f=Math.ceil(w*i),u=0|Math.max(0,a-f),c=0|Math.max(0,l-f),d=0|Math.min(e.width-1,l+f),g=0|Math.min(e.height-1,a+f);return o.find(c,u,d-c,g-u),o.filter(s,w)}(e,r,t);for(let t of s){let s=v(r,t);if(_(e,s,i)&&_(e,s,i,!0)&&(n=yield new C(e,s,r,t)))break}}else{let t=v(r);_(e,t,i)&&_(e,t,i,!0)&&(n=yield new C(e,t,r))}o=s.next(n)}}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class Y{#Q;#V;#Y;#S;#W;#X;constructor(e,t,{mask:n,level:r},i,s){this.#Q=n,this.#V=r,this.#Y=s,this.#S=t,this.#X=e,this.#W=i}get mask(){return this.#Q}get level(){return this.#V.name}get version(){return this.#S.version}get mirror(){return this.#Y}get content(){return this.#X.content}get corrected(){return this.#W}get symbology(){return this.#X.symbology}get fnc1(){return this.#X.fnc1}get codewords(){return this.#X.codewords}get structured(){return this.#X.structured}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class W{#ee;#et;#en;constructor(e){this.#ee=e,this.#et=0,this.#en=0}get bitOffset(){return this.#et}get byteOffset(){return this.#en}read(e){let t=0,n=this.#et,r=this.#en,i=this.#ee;if(n>0){let s=8-n,o=Math.min(e,s),w=s-o;e-=o,n+=o,t=(i[r]&255>>8-o<<w)>>w,8===n&&(r++,n=0)}if(e>0){for(;e>=8;)e-=8,t=t<<8|255&i[r++];if(e>0){let s=8-e;n+=e,t=t<<e|(i[r]&255>>s<<s)>>s}}return this.#et=n,this.#en=r,t}available(){return 8*(this.#ee.length-this.#en)-this.#et}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let X=new Map;class ee{#r;#er;static TERMINATOR=new ee([0,0,0],0);static NUMERIC=new ee([10,12,14],1);static ALPHANUMERIC=new ee([9,11,13],2);static STRUCTURED_APPEND=new ee([0,0,0],3);static BYTE=new ee([8,16,16],4);static ECI=new ee([0,0,0],7);static KANJI=new ee([8,10,12],8);static FNC1_FIRST_POSITION=new ee([0,0,0],5);static FNC1_SECOND_POSITION=new ee([0,0,0],9);static HANZI=new ee([8,10,12],13);constructor(e,t){this.#r=t,this.#er=new Int32Array(e),X.set(t,this)}get bits(){return this.#r}getCharacterCountBits(e){let{version:t}=e;return this.#er[t<=9?0:t<=26?1:2]}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let et=new Map;class en{#ei;#es;static CP437=new en("cp437",0,2);static ISO_8859_1=new en("iso-8859-1",1,3);static ISO_8859_2=new en("iso-8859-2",4);static ISO_8859_3=new en("iso-8859-3",5);static ISO_8859_4=new en("iso-8859-4",6);static ISO_8859_5=new en("iso-8859-5",7);static ISO_8859_6=new en("iso-8859-6",8);static ISO_8859_7=new en("iso-8859-7",9);static ISO_8859_8=new en("iso-8859-8",10);static ISO_8859_9=new en("iso-8859-9",11);static ISO_8859_10=new en("iso-8859-10",12);static ISO_8859_11=new en("iso-8859-11",13);static ISO_8859_13=new en("iso-8859-13",15);static ISO_8859_14=new en("iso-8859-14",16);static ISO_8859_15=new en("iso-8859-15",17);static ISO_8859_16=new en("iso-8859-16",18);static SJIS=new en("sjis",20);static CP1250=new en("cp1250",21);static CP1251=new en("cp1251",22);static CP1252=new en("cp1252",23);static CP1256=new en("cp1256",24);static UTF_16BE=new en("utf-16be",25);static UTF_8=new en("utf-8",26);static ASCII=new en("ascii",27,170);static BIG5=new en("big5",28);static GB18030=new en("gb18030",29);static EUC_KR=new en("euc-kr",30);constructor(e,...t){for(let n of(this.#ei=e,this.#es=t,t))et.set(n,this)}get label(){return this.#ei}get values(){return this.#es}}function er(e,t){return new TextDecoder(t.label).decode(e)}let ei="0123456789",es=`${ei}ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:`;function eo(e){return e.replace(/%+/g,e=>{let t=1&e.length;return e=e.replace(/%%/g,"%"),t?e.replace(/%$/,"\x1d"):e})}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let ew=new Map;class el{#eo;#r;#V;static L=new el("L",0,1);static M=new el("M",1,0);static Q=new el("Q",2,3);static H=new el("H",3,2);constructor(e,t,n){this.#r=n,this.#eo=e,this.#V=t,ew.set(n,this)}get bits(){return this.#r}get name(){return this.#eo}get level(){return this.#V}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let ea=[[21522,0],[20773,1],[24188,2],[23371,3],[17913,4],[16590,5],[20375,6],[19104,7],[30660,8],[29427,9],[32170,10],[30877,11],[26159,12],[25368,13],[27713,14],[26998,15],[5769,16],[5054,17],[7399,18],[6608,19],[1890,20],[597,21],[3340,22],[2107,23],[13663,24],[12392,25],[16177,26],[14854,27],[9396,28],[8579,29],[11994,30],[11245,31]];class ef{#Q;#V;constructor(e){this.#Q=7&e,this.#V=function(e){let t=ew.get(e);if(null!=t)return t;throw Error("illegal error correction bits")}(e>>3&3)}get mask(){return this.#Q}get level(){return this.#V}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function eu(e,t,n,r){return e.get(t,n)?r<<1|1:r<<1}class eh{#z;#w;constructor(e){let{width:t,height:n}=e;this.#w=e.clone(),this.#z=Math.min(t,n)}readVersion(){let e=this.#z,n=0|(e-17)/4;if(n<1)throw Error("");if(n>=1&&n<=6)return b[n-1];let r=0,i=0,s=e-11,o=this.#w;for(let t=5;t>=0;t--)for(let n=e-9;n>=s;n--)r=eu(o,n,t,r);for(let t=5;t>=0;t--)for(let n=e-9;n>=s;n--)i=eu(o,t,n,i);let w=function(e,n){let r=32,i=0,{length:s}=g;for(let o=0;o<s;o++){let s=g[o];if(e===s||n===s)return b[o+6];let w=t(e^s);w<r&&(r=w,i=o+7),e!==n&&(w=t(n^s))<r&&(r=w,i=o+7)}if(r<=3&&i>=7)return b[i-1];throw Error("unable to decode version")}(r,i);if(w.size>e)throw Error("");return w}readFormatInfo(){let e=0,n=0,r=this.#w,i=this.#z,s=i-7;for(let t=0;t<=8;t++)6!==t&&(e=eu(r,t,8,e));for(let t=7;t>=0;t--)6!==t&&(e=eu(r,8,t,e));for(let e=i-1;e>=s;e--)n=eu(r,8,e,n);for(let e=i-8;e<i;e++)n=eu(r,e,8,n);return function(e,n){let r=32,i=0;for(let[s,o]of ea){if(e===s||n===s)return new ef(o);let w=t(e^s);w<r&&(r=w,i=o),e!==n&&(w=t(n^s))<r&&(r=w,i=o)}if(r<=3)return new ef(i);throw Error("unable to decode format information")}(e,n)}readCodewords(e,t){let n=0,i=0,s=0,o=!0,w=this.#z,l=this.#w,a=e.getECBlocks(t),f=function(e){let{size:t,version:n,alignmentPatterns:i}=e,{length:s}=i,o=new r(t,t),w=s-1;o.setRegion(0,0,9,9),o.setRegion(t-8,0,8,9),o.setRegion(0,t-8,9,8);for(let e=0;e<s;e++){let t=i[e]-2;for(let n=0;n<s;n++)(0!==e||0!==n&&n!==w)&&(e!==w||0!==n)&&o.setRegion(i[n]-2,t,5,5)}return o.setRegion(6,9,1,t-17),o.setRegion(9,6,t-17,1),n>6&&(o.setRegion(t-11,0,3,6),o.setRegion(0,t-11,6,3)),o}(e),u=new Uint8Array(a.numTotalCodewords);for(let e=w-1;e>0;e-=2){6===e&&e--;for(let t=0;t<w;t++){let r=o?w-1-t:t;for(let t=0;t<2;t++){let o=e-t;f.get(o,r)||(n++,s<<=1,l.get(o,r)&&(s|=1),8!==n||(u[i++]=s,n=0,s=0))}}o=!o}if(i!==a.numTotalCodewords)throw Error("byteOffset !== ecBlocks.numTotalCodewords");return u}unmask(e){let t=this.#z,n=this.#w;for(let r=0;r<t;r++)for(let i=0;i<t;i++)(function(e,t,n){let r,i;switch(e){case 0:i=n+t&1;break;case 1:i=1&n;break;case 2:i=t%3;break;case 3:i=(n+t)%3;break;case 4:i=(0|n/2)+(0|t/3)&1;break;case 5:i=(1&(r=n*t))+r%3;break;case 6:i=(1&(r=n*t))+r%3&1;break;case 7:i=n*t%3+(n+t&1)&1;break;default:throw Error(`illegal mask: ${e}`)}return 0===i})(e,i,r)&&n.flip(i,r)}remask(e){this.unmask(e)}mirror(){let e=this.#z,t=this.#w;for(let n=0;n<e;n++)for(let r=n+1;r<e;r++)t.get(n,r)!==t.get(r,n)&&(t.flip(n,r),t.flip(r,n))}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class ec{#ew;#m;constructor(e,t){this.#ew=e,this.#m=t}get codewords(){return this.#ew}get numDataCodewords(){return this.#m}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class ed{#el;#ea;constructor(e,t){let{length:n}=t;if(n<=0)throw Error("polynomial coefficients cannot empty");if(this.#el=e,n>1&&0===t[0]){let e=1;for(;e<n&&0===t[e];)e++;if(e===n)this.#ea=new Int32Array([0]);else{let r=new Int32Array(n-e);r.set(t.subarray(e)),this.#ea=r}}else this.#ea=t}get coefficients(){return this.#ea}isZero(){return 0===this.#ea[0]}getDegree(){return this.#ea.length-1}getCoefficient(e){let t=this.#ea;return t[t.length-1-e]}evaluate(e){let t;if(0===e)return this.getCoefficient(0);let n=this.#ea;if(1===e){for(let e of(t=0,n))t^=e;return t}[t]=n;let r=this.#el,{length:i}=n;for(let s=1;s<i;s++)t=r.multiply(e,t)^n[s];return t}multiply(e){let t=this.#el,n=this.#ea,{length:r}=n;if(e instanceof ed){if(this.isZero()||e.isZero())return t.zero;let i=e.#ea,s=i.length,o=new Int32Array(r+s-1);for(let e=0;e<r;e++){let r=n[e];for(let n=0;n<s;n++)o[e+n]^=t.multiply(r,i[n])}return new ed(t,o)}if(0===e)return t.zero;if(1===e)return this;let i=new Int32Array(r);for(let s=0;s<r;s++)i[s]=t.multiply(n[s],e);return new ed(t,i)}multiplyByMonomial(e,t){let n=this.#el;if(0===t)return n.zero;let r=this.#ea,{length:i}=r,s=new Int32Array(i+e);for(let e=0;e<i;e++)s[e]=n.multiply(r[e],t);return new ed(n,s)}addOrSubtract(e){if(this.isZero())return e;if(e.isZero())return this;let t=e.#ea,n=t.length,r=this.#ea,i=r.length;n<i&&([n,i]=[i,n],[t,r]=[r,t]);let s=n-i,o=new Int32Array(n);o.set(t.subarray(0,s));for(let e=s;e<n;e++)o[e]=r[e-s]^t[e];return new ed(this.#el,o)}divide(e){let t=this.#el,n=t.zero,r=this,i=e.getCoefficient(e.getDegree()),s=t.invert(i);for(;r.getDegree()>=e.getDegree()&&!r.isZero();){let i=r.getDegree(),o=i-e.getDegree(),w=t.multiply(r.getCoefficient(i),s),l=e.multiplyByMonomial(o,w),a=t.buildPolynomial(o,w);n=n.addOrSubtract(a),r=r.addOrSubtract(l)}return[n,r]}}let eg=new /**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class{#z;#ef;#eu;#eh;#ec;#ed;constructor(e,t,n){let r=1,i=new Int32Array(t);for(let n=0;n<t;n++)i[n]=r,(r*=2)>=t&&(r^=e,r&=t-1);let s=new Int32Array(t);for(let e=0,n=t-1;e<n;e++)s[i[e]]=e;this.#z=t,this.#ec=i,this.#ed=s,this.#eh=n,this.#ef=new ed(this,new Int32Array([1])),this.#eu=new ed(this,new Int32Array([0]))}get size(){return this.#z}get one(){return this.#ef}get zero(){return this.#eu}get generator(){return this.#eh}exp(e){return this.#ec[e]}log(e){return this.#ed[e]}invert(e){return this.#ec[this.#z-this.#ed[e]-1]}multiply(e,t){if(0===e||0===t)return 0;let n=this.#ed;return this.#ec[(n[e]+n[t])%(this.#z-1)]}buildPolynomial(e,t){if(0===t)return this.#eu;let n=new Int32Array(e+1);return n[0]=t,new ed(this,n)}}(285,256,0);class em{#el;constructor(e=eg){this.#el=e}decode(e,t){let n=!0,r=this.#el,{generator:i}=r,s=new ed(r,e),o=new Int32Array(t);for(let e=0;e<t;e++){let w=s.evaluate(r.exp(e+i));o[t-1-e]=w,0!==w&&(n=!1)}if(!n){let n=new ed(r,o),[i,s]=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t,n,r){t.getDegree()<n.getDegree()&&([t,n]=[n,t]);let i=n,s=e.one,o=t,w=e.zero;for(;2*i.getDegree()>=r;){let t=w,n=o;if(w=s,(o=i).isZero())throw Error("remainder last was zero");i=n;let r=e.zero,l=i.getDegree(),a=o.getDegree(),f=o.getCoefficient(a),u=e.invert(f);for(;l>=a&&!i.isZero();){let t=i.getDegree()-a,n=e.multiply(i.getCoefficient(l),u);r=r.addOrSubtract(e.buildPolynomial(t,n)),l=(i=i.addOrSubtract(o.multiplyByMonomial(t,n))).getDegree()}if(s=r.multiply(w).addOrSubtract(t),l>=a)throw Error("division algorithm failed to reduce polynomial")}let l=s.getCoefficient(0);if(0===l)throw Error("sigma tilde(0) was zero");let a=e.invert(l),f=s.multiply(a),u=i.multiply(a);return[f,u]}(r,r.buildPolynomial(t,1),n,t),w=function(e,t){let n=t.getDegree();if(1===n)return new Int32Array([t.getCoefficient(1)]);let r=0,{size:i}=e,s=new Int32Array(n);for(let o=1;o<i&&r<n;o++)0===t.evaluate(o)&&(s[r++]=e.invert(o));if(r!==n)throw Error("error locator degree does not match number of roots");return s}(r,i),l=function(e,t,n){let{length:r}=n,i=new Int32Array(r);for(let s=0;s<r;s++){let o=1,w=e.invert(n[s]);for(let t=0;t<r;t++)if(s!==t){let r=e.multiply(n[t],w),i=(1&r)==0?1|r:-2&r;o=e.multiply(o,i)}i[s]=e.multiply(t.evaluate(w),e.invert(o)),0!==e.generator&&(i[s]=e.multiply(i[s],w))}return i}(r,s,w),a=w.length,f=e.length;for(let t=0;t<a;t++){let n=f-1-r.log(w[t]);if(n<0)throw Error("bad error location");e[n]=e[n]^l[t]}return a}return 0}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function eb(e,t,n){let{mask:r,level:i}=n,s=0,o=0;e.unmask(r);let w=t.getECBlocks(i),l=e.readCodewords(t,i),a=function(e,t,n){let{ecBlocks:r,numTotalCodewords:i,numECCodewordsPerBlock:s}=t.getECBlocks(n);if(e.length!==i)throw Error("failed to get data blocks");let o=[];for(let{count:e,numDataCodewords:t}of r)for(let n=0;n<e;n++){let e=s+t;o.push(new ec(new Uint8Array(e),t))}let{length:w}=o,l=w-1,a=o[0].codewords.length;for(;l>=0;){let e=o[l].codewords.length;if(e===a)break;l--}l++;let f=0,u=a-s;for(let t=0;t<u;t++)for(let n=0;n<w;n++)o[n].codewords[t]=e[f++];for(let t=l;t<w;t++)o[t].codewords[u]=e[f++];let h=o[0].codewords.length;for(let t=u;t<h;t++)for(let n=0;n<w;n++){let r=n<l?t:t+1;o[n].codewords[r]=e[f++]}return o}(l,t,i),f=new Uint8Array(w.numTotalDataCodewords);for(let{codewords:e,numDataCodewords:t}of a){let[n,r]=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t){let n=new Int32Array(e),r=e.length-t,i=new em().decode(n,r);return[n,i]}(e,t);f.set(n.subarray(0,t),s),o+=r,s+=t}return[f,o]}class ey{#eg;constructor({decode:e=er}={}){this.#eg=e}decode(e){let t,n,r,i=0,s=!1,o=new eh(e);try{t=o.readVersion(),r=o.readFormatInfo(),[n,i]=eb(o,t,r)}catch{null!=r&&o.remask(r.mask),o.mirror(),s=!0,t=o.readVersion(),r=o.readFormatInfo(),[n,i]=eb(o,t,r)}return new Y(function(e,t,n,r){let i,s,{}=n,o="",w=-1,l=!1,a=!1,f=!1,u=!1,h=new W(e);do switch(i=4>h.available()?ee.TERMINATOR:function(e){let t=X.get(e);if(null!=t)return t;throw Error("illegal mode bits")}(h.read(4))){case ee.TERMINATOR:break;case ee.FNC1_FIRST_POSITION:l=!0;break;case ee.FNC1_SECOND_POSITION:a=!0,w=h.read(8);break;case ee.STRUCTURED_APPEND:if(16>h.available())throw Error("illegal structured append");u={index:h.read(4),count:h.read(4)+1,parity:h.read(8)};break;case ee.ECI:s=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e){let t=e.read(8);if((128&t)==0)return 127&t;if((192&t)==128){let n=e.read(8);return(63&t)<<8|n}if((224&t)==192){let n=e.read(16);return(31&t)<<16|n}throw Error("")}(h);break;default:if(i===ee.HANZI){let e=h.read(4);if(1!==e)throw Error("illegal hanzi subset")}let c=h.read(i.getCharacterCountBits(t));switch(i){case ee.ALPHANUMERIC:o+=function(e,t,n){let r="";for(;t>1;){if(11>e.available())throw Error("");let n=e.read(11);r+=es.charAt(n/45)+es.charAt(n%45),t-=2}if(1==t){if(6>e.available())throw Error("");r+=es.charAt(e.read(6))}return n?eo(r):r}(h,c,l||a);break;case ee.BYTE:o+=function(e,t,n,r,i){if(e.available()<8*t)throw Error("");let s=new Uint8Array(t),o=null!=i?function(e){let t=et.get(e);if(t)return t;throw Error("illegal charset value")}(i):en.ISO_8859_1;for(let n=0;n<t;n++)s[n]=e.read(8);let w=n(s,o);return r?eo(w):w}(h,c,r,l||a,s);break;case ee.HANZI:o+=function(e,t){if(e.available()<13*t)throw Error("");let n=0,r=new Uint8Array(2*t);for(;t>0;){let i=e.read(13),s=i/96<<8|i%96;s<2560?s+=41377:s+=42657,r[n]=s>>8&255,r[n+1]=255&s,t--,n+=2}return new TextDecoder("gb2312").decode(r)}(h,c);break;case ee.KANJI:o+=function(e,t){if(e.available()<13*t)throw Error("");let n=0,r=new Uint8Array(2*t);for(;t>0;){let i=e.read(13),s=i/192<<8|i%192;s<7936?s+=33088:s+=49472,r[n]=s>>8&255,r[n+1]=255&s,t--,n+=2}return new TextDecoder("shift-jis").decode(r)}(h,c);break;case ee.NUMERIC:o+=function(e,t){let n="";for(;t>=3;){if(10>e.available())throw Error("");let r=e.read(10);if(r>=1e3)throw Error("");n+=ei.charAt(r/100)+ei.charAt(r/10%10)+ei.charAt(r%10),t-=3}if(2===t){if(7>e.available())throw Error("illegal numeric");let t=e.read(7);if(t>=100)throw Error("illegal numeric codeword");n+=ei.charAt(t/10)+ei.charAt(t%10)}else if(1===t){if(4>e.available())throw Error("illegal numeric");let t=e.read(4);if(t>=10)throw Error("illegal numeric codeword");n+=ei.charAt(t)}return n}(h,c);break;default:throw Error("")}}while(i!==ee.TERMINATOR);return l?f=["GS1"]:a&&(f=["AIM",w]),{content:o,codewords:e,structured:u,symbology:`]Q${null!=s?l?4:a?6:2:l?3:a?5:1}`,fnc1:f}}(n,t,r,this.#eg),t,r,i,s)}}function ep(e,t,n,r,i){let{x:s,y:o}=t,{x:w,y:l}=n;e.save(),e.lineWidth=r,e.strokeStyle=i,e.beginPath(),e.moveTo(s,o),e.lineTo(w,l),e.stroke(),e.restore()}function ex(e,t,n,r){let{x:i,y:s}=t;e.save(),e.fillStyle=r,e.beginPath(),e.arc(i,s,.6*n,0,2*Math.PI),e.fill(),e.restore()}self.addEventListener("message",async e=>{let{data:t}=e,{image:n}=t,{width:w,height:l}=n,a=new OffscreenCanvas(w,l),f=a.getContext("2d");f.drawImage(n,0,0);let u=function(e){let{data:t,width:n,height:r}=e,i=new Uint8Array(n*r);for(let e=0;e<r;e++){let r=e*n;for(let e=0;e<n;e++){let n=r+e,s=4*n,o=t[s],w=t[s+1],l=t[s+2];i[r+e]=.299*o+.587*w+.114*l}}return i}(f.getImageData(0,0,w,l)),h=function(e,t,n){if(e.length!==t*n)throw Error("luminances length must be equals to width * height");return t<40||n<40?function(e,t,n){let i=new r(t,n),s=new Int32Array(32);for(let r=1;r<5;r++){let i=0|4*t/5,o=(0|n*r/5)*t;for(let n=0|t/5;n<i;n++){let t=e[o+n];s[t>>3]++}}let o=function(e){let t=0,n=0,r=0,{length:i}=e;for(let s=0;s<i;s++)e[s]>n&&(t=s,n=e[s]),e[s]>r&&(r=e[s]);let s=0,o=0;for(let n=0;n<i;n++){let r=n-t,i=e[n]*r*r;i>o&&(s=n,o=i)}if(t>s&&([t,s]=[s,t]),s-t<=2)return -1;let w=-1,l=s-1;for(let n=s-1;n>t;n--){let i=n-t,o=i*i*(s-n)*(r-e[n]);o>w&&(l=n,w=o)}return l<<3}(s);if(o>0)for(let r=0;r<n;r++){let n=r*t;for(let s=0;s<t;s++){let t=e[n+s];t<o&&i.set(s,r)}}return i}(e,t,n):function(e,t,n){let w=t-8,l=n-8,a=i(t),f=i(n),u=new r(t,n),h=function(e,t,n){let r=[],s=t-8,w=n-8,l=i(t),a=i(n);for(let n=0;n<a;n++){r[n]=new Int32Array(l);let i=o(n,w);for(let w=0;w<l;w++){let l=0,a=0,f=255,u=o(w,s);for(let n=0,r=i*t+u;n<8;n++,r+=t){for(let t=0;t<8;t++){let n=e[r+t];l+=n,n<f&&(f=n),n>a&&(a=n)}if(a-f>24)for(n++,r+=t;n<8;n++,r+=t)for(let t=0;t<8;t++)l+=e[r+t]}let h=l>>6;if(a-f<=24&&(h=f/2,n>0&&w>0)){let e=(r[n-1][w]+2*r[n][w-1]+r[n-1][w-1])/4;f<e&&(h=e)}r[n][w]=h}}return r}(e,t,n);for(let n=0;n<f;n++){let r=s(n,f-3),i=o(n,l);for(let n=0;n<a;n++){let l=0,f=s(n,a-3),c=o(n,w);for(let e=-2;e<=2;e++){let t=h[r+e];l+=t[f-2]+t[f-1]+t[f]+t[f+1]+t[f+2]}let d=l/25;for(let n=0,r=i*t+c;n<8;n++,r+=t)for(let t=0;t<8;t++)e[r+t]<=d&&u.set(c+t,i+n)}}return u}(e,t,n)}(u,w,l);t.invert&&h.flip();let c=new V({strict:t.strict}),d=c.detect(h),g=[],m=new ey,b=d.next();for(;!b.done;){let e=!1,t=b.value;try{let n=m.decode(t.matrix),{size:r,finder:i,alignment:s}=t,o=t.mapping(0,0),w=t.mapping(r,0),l=t.mapping(0,r),a=t.mapping(r,r);ep(f,o,w,1,"#00ff00"),ep(f,w,a,1,"#00ff00"),ep(f,a,l,1,"#00ff00"),ep(f,l,o,1,"#00ff00");let u=t.mapping(6.5,6.5),h=t.mapping(r-6.5,6.5),c=t.mapping(6.5,r-6.5);ep(f,u,h,1,"#00ff00"),ep(f,u,c,1,"#00ff00");let{topLeft:d,topRight:b,bottomLeft:y}=i;ep(f,d,b,1,"#ff0000"),ep(f,d,y,1,"#ff0000"),ex(f,d,d.moduleSize,"#ff0000"),ex(f,b,b.moduleSize,"#00ff00"),ex(f,y,y.moduleSize,"#0000ff"),s&&ex(f,s,s.moduleSize,"#ff00ff"),g.push(n.content),e=!0}catch(e){}b=d.next(e)}g.length>0?a.convertToBlob().then(e=>{let t={type:"ok",data:{contents:g,image:URL.createObjectURL(e)}};self.postMessage(t)},()=>{self.postMessage({type:"error",data:"生成预览图失败"})}):self.postMessage({type:"error",data:"未发现二维码"})})}();