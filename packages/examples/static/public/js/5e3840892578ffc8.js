!function(){"use strict";function e(e){return 0|e+(e<0?-.5:.5)}function t(e){return e-=e>>1&1431655765,((e=(858993459&e)+(e>>2&858993459))+(e>>4)&252645135)*16843009>>24}function n(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:e.length,r=0;for(let i=t;i<n;i++)r+=e[i];return r}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class r{#e;#t;#n;#r;constructor(e,t,n){let r=Math.ceil(e/32),i=r*t;if(this.#e=e,this.#t=t,this.#n=r,n instanceof Int32Array){if(n.length!==i)throw Error(`matrix bits capacity mismatch: ${i}`);this.#r=n}else this.#r=new Int32Array(i)}#i(e,t){return t*this.#n+(0|e/32)}get width(){return this.#e}get height(){return this.#t}set(e,t){let n=this.#i(e,t);this.#r[n]|=1<<(31&e)}get(e,t){let n=this.#i(e,t);return this.#r[n]>>>(31&e)&1}flip(e,t){if(null!=e&&null!=t){let n=this.#i(e,t);this.#r[n]^=1<<(31&e)}else{let e=this.#r,{length:t}=e;for(let n=0;n<t;n++)e[n]=~e[n]}}clone(){return new r(this.#e,this.#t,new Int32Array(this.#r))}setRegion(e,t,n,r){let i=this.#r,s=e+n,o=t+r,l=this.#n;for(let n=t;n<o;n++){let t=n*l;for(let n=e;n<s;n++)i[t+(0|n/32)]|=1<<(31&n)}}}function i(e){let t=e>>3;return 7&e&&t++,t}function s(e,t){return e<2?2:Math.min(e,t)}function o(e,t){return(e<<=3)>t?t:e}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class l{#s;#o;constructor(e,t){this.#s=e,this.#o=t}get x(){return this.#s}get y(){return this.#o}}function w(e,t){return Math.sqrt(a(e,t))}function a(e,t){let n=e.x-t.x,r=e.y-t.y;return n*n+r*r}function u(e,t,n){let{x:r,y:i}=e,{x:s,y:o}=t,{x:l,y:w}=n;return Math.abs(r*(o-w)+s*(w-i)+l*(i-o))/2}class f extends l{#l;#e;#t;#w;#a;#u=1;#f;#h;static noise(e){return e.#l}static width(e){return e.#e}static height(e){return e.#t}static combined(e){return e.#u}static rect(e){return e.#w}static equals(e,t,n,r,i){let{modules:s}=e.#f,o=e.#h;if(Math.abs(t-e.x)<=o&&Math.abs(n-e.y)<=o){let t=e.#a,n=Math.abs((r+i)/s/2-t);if(n<=1||n<=t)return!0}return!1}static combine(e,t,n,r,i,s){let o=e.#u,l=o+1,w=(e.x*o+t)/l,a=(e.y*o+n)/l,u=(e.#l*o+s)/l,h=(e.#e*o+r)/l,c=(e.#t*o+i)/l,d=new f(e.#f,w,a,h,c,u);return d.#u=l,d}constructor(e,t,n,r,i,s){super(t,n);let{modules:o}=e,l=r/2,w=i/2,a=r/o,u=i/o,f=a/2,h=u/2,c=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e){let{ratios:t}=e;return t[0|t.length/2]/2}(e),d=(a+u)/2;this.#l=s,this.#e=r,this.#t=i,this.#f=e,this.#a=d,this.#w=[t-l+f,n-w+h,t+l-f,n+w-h],this.#h=d*c}get moduleSize(){return this.#a}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class h{#c;#d;constructor(e,t){this.#c=e,this.#d=t}sample(e,t){let n=this.#c,i=n.width,s=this.#d,o=n.height,l=new r(e,t);for(let r=0;r<t;r++)for(let t=0;t<e;t++){let[e,w]=s.mapping(t+.5,r+.5),a=0|e,u=0|w;a>=0&&u>=0&&a<i&&u<o&&n.get(a,u)&&l.set(t,r)}return l}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class c{#g;#m;constructor(e,t){this.#g=e,this.#m=t}get count(){return this.#g}get numDataCodewords(){return this.#m}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class d{#b;#y;#p;#x;#I;constructor(e,...t){let n=0,r=0;for(let{count:e,numDataCodewords:i}of t)n+=e,r+=i*e;let i=e*n;this.#b=t,this.#p=i,this.#x=r,this.#I=e,this.#y=r+i}get ecBlocks(){return this.#b}get numTotalCodewords(){return this.#y}get numTotalECCodewords(){return this.#p}get numTotalDataCodewords(){return this.#x}get numECCodewordsPerBlock(){return this.#I}}let g=[31892,34236,39577,42195,48118,51042,55367,58893,63784,68472,70749,76311,79154,84390,87683,92361,96236,102084,102881,110507,110734,117786,119615,126325,127568,133589,136944,141498,145311,150283,152622,158308,161089,167017];class m{#z;#C;#b;#E;constructor(e,t,...n){this.#C=e,this.#b=n,this.#z=17+4*e,this.#E=t}get size(){return this.#z}get version(){return this.#C}get alignmentPatterns(){return this.#E}getECBlocks(e){let{level:t}=e;return this.#b[t]}}let b=[new m(1,[],new d(7,new c(1,19)),new d(10,new c(1,16)),new d(13,new c(1,13)),new d(17,new c(1,9))),new m(2,[6,18],new d(10,new c(1,34)),new d(16,new c(1,28)),new d(22,new c(1,22)),new d(28,new c(1,16))),new m(3,[6,22],new d(15,new c(1,55)),new d(26,new c(1,44)),new d(18,new c(2,17)),new d(22,new c(2,13))),new m(4,[6,26],new d(20,new c(1,80)),new d(18,new c(2,32)),new d(26,new c(2,24)),new d(16,new c(4,9))),new m(5,[6,30],new d(26,new c(1,108)),new d(24,new c(2,43)),new d(18,new c(2,15),new c(2,16)),new d(22,new c(2,11),new c(2,12))),new m(6,[6,34],new d(18,new c(2,68)),new d(16,new c(4,27)),new d(24,new c(4,19)),new d(28,new c(4,15))),new m(7,[6,22,38],new d(20,new c(2,78)),new d(18,new c(4,31)),new d(18,new c(2,14),new c(4,15)),new d(26,new c(4,13),new c(1,14))),new m(8,[6,24,42],new d(24,new c(2,97)),new d(22,new c(2,38),new c(2,39)),new d(22,new c(4,18),new c(2,19)),new d(26,new c(4,14),new c(2,15))),new m(9,[6,26,46],new d(30,new c(2,116)),new d(22,new c(3,36),new c(2,37)),new d(20,new c(4,16),new c(4,17)),new d(24,new c(4,12),new c(4,13))),new m(10,[6,28,50],new d(18,new c(2,68),new c(2,69)),new d(26,new c(4,43),new c(1,44)),new d(24,new c(6,19),new c(2,20)),new d(28,new c(6,15),new c(2,16))),new m(11,[6,30,54],new d(20,new c(4,81)),new d(30,new c(1,50),new c(4,51)),new d(28,new c(4,22),new c(4,23)),new d(24,new c(3,12),new c(8,13))),new m(12,[6,32,58],new d(24,new c(2,92),new c(2,93)),new d(22,new c(6,36),new c(2,37)),new d(26,new c(4,20),new c(6,21)),new d(28,new c(7,14),new c(4,15))),new m(13,[6,34,62],new d(26,new c(4,107)),new d(22,new c(8,37),new c(1,38)),new d(24,new c(8,20),new c(4,21)),new d(22,new c(12,11),new c(4,12))),new m(14,[6,26,46,66],new d(30,new c(3,115),new c(1,116)),new d(24,new c(4,40),new c(5,41)),new d(20,new c(11,16),new c(5,17)),new d(24,new c(11,12),new c(5,13))),new m(15,[6,26,48,70],new d(22,new c(5,87),new c(1,88)),new d(24,new c(5,41),new c(5,42)),new d(30,new c(5,24),new c(7,25)),new d(24,new c(11,12),new c(7,13))),new m(16,[6,26,50,74],new d(24,new c(5,98),new c(1,99)),new d(28,new c(7,45),new c(3,46)),new d(24,new c(15,19),new c(2,20)),new d(30,new c(3,15),new c(13,16))),new m(17,[6,30,54,78],new d(28,new c(1,107),new c(5,108)),new d(28,new c(10,46),new c(1,47)),new d(28,new c(1,22),new c(15,23)),new d(28,new c(2,14),new c(17,15))),new m(18,[6,30,56,82],new d(30,new c(5,120),new c(1,121)),new d(26,new c(9,43),new c(4,44)),new d(28,new c(17,22),new c(1,23)),new d(28,new c(2,14),new c(19,15))),new m(19,[6,30,58,86],new d(28,new c(3,113),new c(4,114)),new d(26,new c(3,44),new c(11,45)),new d(26,new c(17,21),new c(4,22)),new d(26,new c(9,13),new c(16,14))),new m(20,[6,34,62,90],new d(28,new c(3,107),new c(5,108)),new d(26,new c(3,41),new c(13,42)),new d(30,new c(15,24),new c(5,25)),new d(28,new c(15,15),new c(10,16))),new m(21,[6,28,50,72,94],new d(28,new c(4,116),new c(4,117)),new d(26,new c(17,42)),new d(28,new c(17,22),new c(6,23)),new d(30,new c(19,16),new c(6,17))),new m(22,[6,26,50,74,98],new d(28,new c(2,111),new c(7,112)),new d(28,new c(17,46)),new d(30,new c(7,24),new c(16,25)),new d(24,new c(34,13))),new m(23,[6,30,54,78,102],new d(30,new c(4,121),new c(5,122)),new d(28,new c(4,47),new c(14,48)),new d(30,new c(11,24),new c(14,25)),new d(30,new c(16,15),new c(14,16))),new m(24,[6,28,54,80,106],new d(30,new c(6,117),new c(4,118)),new d(28,new c(6,45),new c(14,46)),new d(30,new c(11,24),new c(16,25)),new d(30,new c(30,16),new c(2,17))),new m(25,[6,32,58,84,110],new d(26,new c(8,106),new c(4,107)),new d(28,new c(8,47),new c(13,48)),new d(30,new c(7,24),new c(22,25)),new d(30,new c(22,15),new c(13,16))),new m(26,[6,30,58,86,114],new d(28,new c(10,114),new c(2,115)),new d(28,new c(19,46),new c(4,47)),new d(28,new c(28,22),new c(6,23)),new d(30,new c(33,16),new c(4,17))),new m(27,[6,34,62,90,118],new d(30,new c(8,122),new c(4,123)),new d(28,new c(22,45),new c(3,46)),new d(30,new c(8,23),new c(26,24)),new d(30,new c(12,15),new c(28,16))),new m(28,[6,26,50,74,98,122],new d(30,new c(3,117),new c(10,118)),new d(28,new c(3,45),new c(23,46)),new d(30,new c(4,24),new c(31,25)),new d(30,new c(11,15),new c(31,16))),new m(29,[6,30,54,78,102,126],new d(30,new c(7,116),new c(7,117)),new d(28,new c(21,45),new c(7,46)),new d(30,new c(1,23),new c(37,24)),new d(30,new c(19,15),new c(26,16))),new m(30,[6,26,52,78,104,130],new d(30,new c(5,115),new c(10,116)),new d(28,new c(19,47),new c(10,48)),new d(30,new c(15,24),new c(25,25)),new d(30,new c(23,15),new c(25,16))),new m(31,[6,30,56,82,108,134],new d(30,new c(13,115),new c(3,116)),new d(28,new c(2,46),new c(29,47)),new d(30,new c(42,24),new c(1,25)),new d(30,new c(23,15),new c(28,16))),new m(32,[6,34,60,86,112,138],new d(30,new c(17,115)),new d(28,new c(10,46),new c(23,47)),new d(30,new c(10,24),new c(35,25)),new d(30,new c(19,15),new c(35,16))),new m(33,[6,30,58,86,114,142],new d(30,new c(17,115),new c(1,116)),new d(28,new c(14,46),new c(21,47)),new d(30,new c(29,24),new c(19,25)),new d(30,new c(11,15),new c(46,16))),new m(34,[6,34,62,90,118,146],new d(30,new c(13,115),new c(6,116)),new d(28,new c(14,46),new c(23,47)),new d(30,new c(44,24),new c(7,25)),new d(30,new c(59,16),new c(1,17))),new m(35,[6,30,54,78,102,126,150],new d(30,new c(12,121),new c(7,122)),new d(28,new c(12,47),new c(26,48)),new d(30,new c(39,24),new c(14,25)),new d(30,new c(22,15),new c(41,16))),new m(36,[6,24,50,76,102,128,154],new d(30,new c(6,121),new c(14,122)),new d(28,new c(6,47),new c(34,48)),new d(30,new c(46,24),new c(10,25)),new d(30,new c(2,15),new c(64,16))),new m(37,[6,28,54,80,106,132,158],new d(30,new c(17,122),new c(4,123)),new d(28,new c(29,46),new c(14,47)),new d(30,new c(49,24),new c(10,25)),new d(30,new c(24,15),new c(46,16))),new m(38,[6,32,58,84,110,136,162],new d(30,new c(4,122),new c(18,123)),new d(28,new c(13,46),new c(32,47)),new d(30,new c(48,24),new c(14,25)),new d(30,new c(42,15),new c(32,16))),new m(39,[6,26,54,82,110,138,166],new d(30,new c(20,117),new c(4,118)),new d(28,new c(40,47),new c(7,48)),new d(30,new c(43,24),new c(22,25)),new d(30,new c(10,15),new c(67,16))),new m(40,[6,30,58,86,114,142,170],new d(30,new c(19,118),new c(6,119)),new d(28,new c(18,47),new c(31,48)),new d(30,new c(34,24),new c(34,25)),new d(30,new c(20,15),new c(61,16)))];/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class y{#S;#v;#A;#O;#k;#M;constructor(e,t){let n=0|t.x,r=0|t.y,i=0|e.x,s=0|e.y,o=Math.abs(r-s)>Math.abs(n-i);o&&([i,s,n,r]=[s,i,r,n]);let w=i<n?1:-1;this.#O=o,this.#A=n+w,this.#S=new l(n,r),this.#v=new l(i,s),this.#k=[w,s<r?1:-1],this.#M=[Math.abs(n-i),Math.abs(r-s)]}*points(){let e=this.#A,t=this.#O,{y:n}=this.#S,[r,i]=this.#k,[s,o]=this.#M,{x:l,y:w}=this.#v,a=0|-s/2;for(let u=l,f=w;u!==e;u+=r)if(yield[t?f:u,t?u:f],(a+=o)>0){if(f===n)break;f+=i,a-=s}}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function p(e,t,n){let r=0,{width:i,height:s}=e,o=new l((t.x+n.x)/2,(t.y+n.y)/2);for(let[n,a]of new y(t,o).points()){if(n<0||a<0||n>=i||a>=s){if(2===r)return w(t,new l(n,a));break}if(1===r==(1===e.get(n,a))){if(2===r)return w(t,new l(n,a));r++}}return NaN}function x(e,t,n){let r=p(e,t,n);if(Number.isNaN(r))return NaN;let{x:i,y:s}=n,{x:o,y:w}=t,a=p(e,t,new l(o-(i-o),w-(s-w)));return Number.isNaN(a)?NaN:r+a-1}function I(e,t,n){let r=new l(0|t.x,0|t.y),i=new l(0|n.x,0|n.y),s=x(e,r,i),o=x(e,i,r);return Number.isNaN(s)?o/7:Number.isNaN(o)?s/7:(s+o)/14}function z(e,t){var n,r,i,s;let o=Math.max((n=f.width(e))>(r=f.width(t))?n/r:r/n,(i=f.height(e))>(s=f.height(t))?i/s:s/i);return o*o}class C{#T;#z;#c;#_;#a;#N;#R;static #D(e){let[t,n,r]=e.#N,i=C.bottomRight(e);if(null==e.#T){let s=u(t,n,i),o=u(i,r,t);e.#T=s+o}return e.#T}static moduleSizes(e){if(null==e.#R){let t=e.#c,[n,r,i]=e.#N;e.#R=[I(t,n,r),I(t,n,i)]}return e.#R}static size(t){if(null==t.#z){let n=C.moduleSize(t);t.#z=function(t,n){let[r,i,s]=t,o=e((w(r,i)+w(r,s))/n/2)+7;switch(3&o){case 0:return o+1;case 2:return o-1;case 3:return Math.min(o+2,177)}return o}(t.#N,n)}return t.#z}static moduleSize(e){return null==e.#a&&(e.#a=n(C.moduleSizes(e))/2),e.#a}static contains(e,t){let n=C.#D(e),[r,i,s]=e.#N,o=C.bottomRight(e),l=u(r,i,t);return l+u(i,o,t)+u(o,s,t)+u(s,r,t)-n<1}static bottomRight(e){return null==e.#_&&(e.#_=function(e){let[t,n,r]=e,{x:i,y:s}=t;return new l(n.x+r.x-i,n.y+r.y-s)}(e.#N)),e.#_}constructor(e,t){this.#c=e,this.#N=function(e){let t,n,r;let[i,s,o]=e,l=a(i,s)*z(i,s),w=a(i,o)*z(i,o),u=a(s,o)*z(s,o);return u>=l&&u>=w?[t,r,n]=e:w>=u&&w>=l?[r,t,n]=e:[r,n,t]=e,0>function(e,t,n){let{x:r,y:i}=t;return(n.x-r)*(e.y-i)-(n.y-i)*(e.x-r)}(r,t,n)&&([r,n]=[n,r]),[t,n,r]}(t)}get topLeft(){return this.#N[0]}get topRight(){return this.#N[1]}get bottomLeft(){return this.#N[2]}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class E{#c;#B;#P;#d;constructor(e,t,n,r){let i=new h(e,t),s=C.size(n);this.#c=e,this.#d=t,this.#P=n,this.#B=r,this.#c=i.sample(s,s)}get matrix(){return this.#c}get finder(){return this.#P}get alignment(){return this.#B}get size(){return C.size(this.#P)}get moduleSize(){return C.moduleSize(this.#P)}mapping(e,t){return[e,t]=this.#d.mapping(e,t),new l(e,t)}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class S{#U;#F;#L;#Z;#H;#j;#$;#q;#G;constructor(e,t,n,r,i,s,o,l,w){this.#U=e,this.#F=r,this.#L=o,this.#Z=t,this.#H=i,this.#j=l,this.#$=n,this.#q=s,this.#G=w}inverse(){let e=this.#U,t=this.#F,n=this.#L,r=this.#Z,i=this.#H,s=this.#j,o=this.#$,l=this.#q,w=this.#G;return new S(i*w-s*l,s*o-r*w,r*l-i*o,n*l-t*w,e*w-n*o,t*o-e*l,t*s-n*i,n*r-e*s,e*i-t*r)}times(e){let t=this.#U,n=this.#F,r=this.#L,i=this.#Z,s=this.#H,o=this.#j,l=this.#$,w=this.#q,a=this.#G,u=e.#U,f=e.#F,h=e.#L,c=e.#Z,d=e.#H,g=e.#j,m=e.#$,b=e.#q,y=e.#G;return new S(t*u+i*f+l*h,t*c+i*d+l*g,t*m+i*b+l*y,n*u+s*f+w*h,n*c+s*d+w*g,n*m+s*b+w*y,r*u+o*f+a*h,r*c+o*d+a*g,r*m+o*b+a*y)}mapping(e,t){let n=this.#U,r=this.#F,i=this.#L,s=this.#Z,o=this.#H,l=this.#j,w=this.#$,a=this.#q,u=i*e+l*t+this.#G;return[(n*e+s*t+w)/u,(r*e+o*t+a)/u]}}function v(e,t,n,r,i,s,o,l){let w=e-n+i-o,a=t-r+s-l;if(0===w&&0===a)return new S(n-e,i-n,e,r-t,s-r,t,0,0,1);{let u=n-i,f=o-i,h=r-s,c=l-s,d=u*c-f*h,g=(w*c-f*a)/d,m=(u*a-w*h)/d;return new S(n-e+g*n,o-e+m*o,e,r-t+g*r,l-t+m*l,t,g,m,1)}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function A(e,t){let n,r,i,s;let{x:o,y:l}=e.topLeft,{x:w,y:a}=e.topRight,{x:u,y:f}=e.bottomLeft,h=C.size(e)-3.5;return null!=t?(n=t.x,r=t.y,s=i=h-3):(n=w+u-o,r=a+f-l,i=h,s=h),function(e,t,n,r,i,s,o,l,w,a,u,f,h,c,d,g){let m=v(3.5,3.5,n,3.5,i,s,3.5,l).inverse();return v(w,a,u,f,h,c,d,g).times(m)}(0,0,h,0,i,s,0,h,o,l,w,a,n,r,u,f)}function O(e,t){let[n,,r]=f.rect(e);return t>0?r:t<0?n:e.x}function k(e,t){let[,n,,r]=f.rect(e);return t>0?r:t<0?n:e.y}function M(e,t,n,r){let{x:i,y:s}=t,{x:o,y:w}=e,{x:a,y:u}=n,f=a>i?1:a<i?-1:0,h=u>s?1:u<s?-1:0,c=O(t,f),d=k(t,h),g=O(e,f),m=k(e,h);return 0===f||0===h?[new l(g,m),new l(c,d)]:(r?f===h:f!==h)?[new l(o,m),new l(i,d)]:[new l(g,w),new l(c,s)]}function T(e,t,n,r){let i=r+8,s=new y(t,n).points(),o=1,l=e.get(0|t.x,0|t.y);for(let[t,n]of s){let r=e.get(t,n);if(r!==l&&(o++,l=r,o>i))return!1}return o>=r-14-Math.max(2,(r-17)/4)}function _(e,t,n){let{topLeft:r,topRight:i,bottomLeft:s}=t,[o,l]=n?M(r,s,i,!0):M(r,i,s);return T(e,o,l,C.size(t))}function N(e,t,n,r){let[i,s]=t.mapping(r?6.5:7.5,r?7.5:6.5),[o,w]=t.mapping(r?6.5:n-7.5,r?n-7.5:6.5);return T(e,new l(i,s),new l(o,w),n)}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class R{#V;#f;constructor(e){this.#f=e,this.#V=n(e)}get modules(){return this.#V}get ratios(){return this.#f}}let D=new R([1,1,3,1,1]),B=new R([1,1,1,1,1]),P=new R([1,1,1]);function U(e,t){let{length:n}=e,r=n-1;for(let t=0;t<r;t++)e[t]=e[t+1];e[r]=t}function F(e,t,n,r,i){let s=-1,o=t|=0,l=n|=0,w=[0,0,0,0,0],{width:a,height:u}=e,f=i?-1:1,h=()=>{o+=s,l-=s*f},c=()=>e.get(o,l);for(;o>=0&&l>=0&&l<u&&c();)h(),w[2]++;for(;o>=0&&l>=0&&l<u&&!c();)h(),w[1]++;for(;o>=0&&l>=0&&l<u&&w[0]<r&&c();)h(),w[0]++;for(o=t+(s=1),l=n-s*f;o<a&&l>=0&&l<u&&c();)h(),w[2]++;for(;o<a&&l>=0&&l<u&&!c();)h(),w[3]++;for(;o<a&&l>=0&&l<u&&w[4]<r&&c();)h(),w[4]++;return w}function L(e,t){let r=[],i=0|e.length/2;for(let t=0;t<=i;t++){let s=i+t+1;r.push(n(e,i-t,s)/2+n(e,s))}return t-(2*r[0]+n(r,1))/(i+2)}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let Z=Math.PI/180,H=40*Z,j=140*Z;function $(e,t,n,r,i,s){let[o,l]=function(e,t,n,r,i){t|=0,n|=0;let s=i?n:t,o=[0,0,0,0,0],l=i?e.height:e.width,w=()=>i?e.get(t,s):e.get(s,n);for(;s>=0&&w();)s--,o[2]++;for(;s>=0&&!w();)s--,o[1]++;for(;s>=0&&o[0]<r&&w();)s--,o[0]++;for(s=(i?n:t)+1;s<l&&w();)s++,o[2]++;for(;s<l&&!w();)s++,o[3]++;for(;s<l&&o[4]<r&&w();)s++,o[4]++;return[o,s]}(e,t,n,r,s);return[G(o,i)?L(o,l):NaN,o]}function q(e,t,n){return e>t&&([e,t]=[t,e]),t-e<=t*n}function G(e,t){let{ratios:n,modules:r}=t,{length:i}=e,s=function(e){let t=0;for(let n of e){if(0===n)return NaN;t+=n}return t}(e);if(s>=r){let t=s/r,o=.625*t+.5;for(let r=0;r<i;r++){let i=n[r];if(Math.abs(e[r]-t*i)>o)return!1}return!0}return!1}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class V{#Y;#c;#f;#N=[];constructor(e,t,n){this.#c=e,this.#f=t,this.#Y=n}get matrix(){return this.#c}get patterns(){return this.#N}match(e,t,r,i){let s=this.#c,o=this.#f,l=L(r,e),[w,a]=$(s,l,t,i,o,!0);if(w>=0){let e;if([l,e]=$(s,l,w,i,o),l>=0){let t=F(s,l,w,i),r=F(s,l,w,i,!0);if(this.#Y?G(t,o)&&G(r,o):G(t,o)||G(r,o)){let i=function(e){for(var t=arguments.length,r=Array(t>1?t-1:0),i=1;i<t;i++)r[i-1]=arguments[i];let s=0,o=0,{length:l}=r,w=[];for(let t of r){let[r,i]=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t){let{ratios:r,modules:i}=t,s=0,{length:o}=r,l=n(e),w=l/i;for(let t=0;t<o;t++)s+=Math.abs(e[t]-r[t]*w);return[s/l,w]}(t,e);s+=r,w.push(i)}let a=n(w),u=a/l;for(let e of w)o+=Math.abs(e-u);return s+o/a}(o,e,a,t,r),s=n(e),u=n(a),h=this.#N,{length:c}=h,d=!1;for(let e=0;e<c;e++){let t=h[e];if(f.equals(t,l,w,s,u)){d=!0,h[e]=f.combine(t,l,w,s,u,i);break}}d||h.push(new f(o,l,w,s,u,i))}}}}}class Y extends V{constructor(e,t){super(e,D,t)}*groups(){let t=this.patterns.filter(e=>f.combined(e)>=3&&1.5>=f.noise(e)),{length:n}=t;if(3===n){let e=new C(this.matrix,t),n=C.size(e);n>=21&&n<=177&&(yield e)}else if(n>3){let r=n-2,i=n-1,s=new Map;for(let o=0;o<r;o++){let r=t[o],l=r.moduleSize;if(!s.has(r))for(let a=o+1;a<i;a++){let i=t[a],o=i.moduleSize;if(s.has(r))break;if(!s.has(i)&&q(l,o,.5))for(let u=a+1;u<n;u++){let n=t[u],a=n.moduleSize;if(s.has(r)||s.has(i))break;if(!q(l,a,.5)||!q(o,a,.5))continue;let{matrix:h}=this,c=new C(h,[r,i,n]),d=function(e){let{topLeft:t,topRight:n,bottomLeft:r}=e,{x:i,y:s}=t,o=n.x-i,l=n.y-s,w=r.x-i,a=r.y-s;return Math.acos((o*w+l*a)/Math.sqrt((o*o+l*l)*(w*w+a*a)))}(c);if(d>=H&&d<=j){let[o,l]=C.moduleSizes(c);if(o>=1&&l>=1){let{topLeft:a,topRight:u,bottomLeft:d}=c,g=w(a,u),m=w(a,d);if(4>=Math.abs(e(g/o)-e(m/l))){let e=C.size(c);e>=21&&e<=177&&!/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t,n){let r=0,{topLeft:i,topRight:s,bottomLeft:o}=e;for(let l of t)if(l!==i&&l!==s&&l!==o){let t;if(n.has(l)&&(t=C.contains(e,l))||1>f.noise(l)&&(null==t?C.contains(e,l):t)&&++r>3)return!0}return!1}(c,t,s)&&(_(h,c)||_(h,c,!0))&&(yield c)&&(s.set(r,!0),s.set(i,!0),s.set(n,!0))}}}}}}}}find(e,t,n,r){let{matrix:i}=this,s=e+n,o=t+r,l=(e,t,n,r,i,s)=>{U(n,r),U(i,s),1===i[0]&&0===i[1]&&1===i[2]&&0===i[3]&&1===i[4]&&G(n,D)&&this.match(e,t,n,n[2])};for(let n=t;n<o;n++){let t=e;for(;t<s&&!i.get(t,n);)t++;let r=0,o=i.get(t,n),w=[0,0,0,0,0],a=[-1,-1,-1,-1,-1];for(;t<s;){let e=i.get(t,n);e===o?r++:(l(t,n,w,r,a,o),r=1,o=e),t++}l(t,n,w,r,a,o)}}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class J extends V{constructor(e,t){super(e,B,t)}filter(e,t){let n=this.patterns.filter(e=>2.5>=f.noise(e)&&q(e.moduleSize,t,.5));n.length>1&&n.sort((n,r)=>{let i=f.noise(n),s=f.noise(r),o=Math.abs(n.moduleSize-t),l=Math.abs(r.moduleSize-t);return(w(n,e)+o)*i-(w(r,e)+l)*s});let r=n.slice(0,2);return r.push(e),r}find(e,t,n,r){let{matrix:i}=this,s=e+n,o=t+r,l=(e,t,n,r,i,s)=>{U(n,r),U(i,s),0===i[0]&&1===i[1]&&0===i[2]&&G(n,P)&&this.match(e,t,n,n[1])};for(let n=t;n<o;n++){let t=e;for(;t<s&&!i.get(t,n);)t++;let r=0,o=i.get(t,n),w=[0,0,0],a=[-1,-1,-1];for(;t<s;){let e=i.get(t,n);e===o?r++:(l(t,n,w,r,a,o),r=1,o=e),t++}l(t,n,w,r,a,o)}}}class K{#J;constructor(e={}){this.#J=e}*detect(e){let{strict:t}=this.#J,{width:n,height:r}=e,i=new Y(e,t);i.find(0,0,n,r);let s=i.groups(),o=s.next();for(;!o.done;){let n=!1,r=o.value,i=C.size(r);if(i>=25)for(let s of function(e,t,n){let r=C.size(t),i=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e){let{x:t,y:n}=e.topLeft,r=1-3/(C.size(e)-7),i=C.bottomRight(e),[s,o]=C.moduleSizes(e);return new f(B,t+(i.x-t)*r,n+(i.y-n)*r,5*s,5*o,0)}(t),s=new J(e,n),o=C.moduleSize(t),{x:l,y:w}=i,a=Math.ceil(o*Math.min(20,0|r/4)),u=0|Math.max(0,w-a),h=0|Math.max(0,l-a),c=0|Math.min(e.width-1,l+a),d=0|Math.min(e.height-1,w+a);return s.find(h,u,c-h,d-u),s.filter(i,o)}(e,r,t)){let t=A(r,s);if(N(e,t,i)&&N(e,t,i,!0)&&(n=yield new E(e,t,r,s)))break}else{let t=A(r);N(e,t,i)&&N(e,t,i,!0)&&(n=yield new E(e,t,r))}o=s.next(n)}}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class Q{#K;#Q;#W;#C;#X;#ee;constructor(e,t,{mask:n,level:r},i,s){this.#K=n,this.#Q=r,this.#W=s,this.#C=t,this.#ee=e,this.#X=i}get mask(){return this.#K}get level(){return this.#Q.name}get version(){return this.#C.version}get mirror(){return this.#W}get content(){return this.#ee.content}get corrected(){return this.#X}get symbology(){return this.#ee.symbology}get fnc1(){return this.#ee.fnc1}get codewords(){return this.#ee.codewords}get structured(){return this.#ee.structured}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class W{#et;#en;#er;constructor(e){this.#et=e,this.#en=0,this.#er=0}get bitOffset(){return this.#en}get byteOffset(){return this.#er}read(e){let t=0,n=this.#en,r=this.#er,i=this.#et;if(n>0){let s=8-n,o=Math.min(e,s),l=s-o;e-=o,n+=o,t=(i[r]&255>>8-o<<l)>>l,8===n&&(r++,n=0)}if(e>0){for(;e>=8;)e-=8,t=t<<8|255&i[r++];if(e>0){let s=8-e;n+=e,t=t<<e|(i[r]&255>>s<<s)>>s}}return this.#en=n,this.#er=r,t}available(){return 8*(this.#et.length-this.#er)-this.#en}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let X=new Map;class ee{#r;#ei;static TERMINATOR=new ee([0,0,0],0);static NUMERIC=new ee([10,12,14],1);static ALPHANUMERIC=new ee([9,11,13],2);static STRUCTURED_APPEND=new ee([0,0,0],3);static BYTE=new ee([8,16,16],4);static ECI=new ee([0,0,0],7);static KANJI=new ee([8,10,12],8);static FNC1_FIRST_POSITION=new ee([0,0,0],5);static FNC1_SECOND_POSITION=new ee([0,0,0],9);static HANZI=new ee([8,10,12],13);constructor(e,t){this.#r=t,this.#ei=new Int32Array(e),X.set(t,this)}get bits(){return this.#r}getCharacterCountBits(e){let t,{version:n}=e;return t=n<=9?0:n<=26?1:2,this.#ei[t]}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let et=new Map;class en{#es;#eo;static CP437=new en("cp437",2,0);static ISO_8859_1=new en("iso-8859-1",3,1);static ISO_8859_2=new en("iso-8859-2",4);static ISO_8859_3=new en("iso-8859-3",5);static ISO_8859_4=new en("iso-8859-4",6);static ISO_8859_5=new en("iso-8859-5",7);static ISO_8859_6=new en("iso-8859-6",8);static ISO_8859_7=new en("iso-8859-7",9);static ISO_8859_8=new en("iso-8859-8",10);static ISO_8859_9=new en("iso-8859-9",11);static ISO_8859_10=new en("iso-8859-10",12);static ISO_8859_11=new en("iso-8859-11",13);static ISO_8859_13=new en("iso-8859-13",15);static ISO_8859_14=new en("iso-8859-14",16);static ISO_8859_15=new en("iso-8859-15",17);static ISO_8859_16=new en("iso-8859-16",18);static SHIFT_JIS=new en("shift-jis",20);static CP1250=new en("cp1250",21);static CP1251=new en("cp1251",22);static CP1252=new en("cp1252",23);static CP1256=new en("cp1256",24);static UTF_16BE=new en("utf-16be",25);static UTF_8=new en("utf-8",26);static ASCII=new en("ascii",27);static BIG5=new en("big5",28);static GB2312=new en("gb2312",29);static EUC_KR=new en("euc-kr",30);static GB18030=new en("gb18030",32);static UTF_16LE=new en("utf-16le",33);static UTF_32BE=new en("utf-32be",34);static UTF_32LE=new en("utf-32le",35);static ISO_646_INV=new en("iso-646-inv",170);static BINARY=new en("binary",899);constructor(e,...t){for(let n of(this.#es=e,this.#eo=Object.freeze(t),t))et.set(n,this)}get label(){return this.#es}get values(){return this.#eo}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function er(e){let t=0,n=new Map;for(let r of e)n.set(r,t++);return n}function ei(e){for(var t=arguments.length,n=Array(t>1?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];let i=[],s=[],o=new Map,l=new TextDecoder(e,{fatal:!0});for(let[e,t]of n)for(let n=e;n<=t;n++)i.push(n>>8,255&n),s.push(n);let{length:w}=s,a=l.decode(new Uint8Array(i));for(let e=0;e<w;e++){let t=a.charAt(e);o.has(t)||o.set(t,s[e])}return o}function es(e,t,n){let r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:256,i=n.length-1,s=[];for(let o=e;o<t;){for(let e=0;e<i;e+=2)s.push([o+n[e],o+n[e+1]]);o+=r}return s}ei("gb2312",[41377,41470],[41649,41698],[41701,41710],[41713,41724],[41889,41982],[42145,42227],[42401,42486],[42657,42680],[42689,42712],[42913,42945],[42961,42993],[43169,43194],[43205,43241],[43428,43503],...es(45217,55038,[0,93]),[55201,55289],...es(55457,63486,[0,93])),ei("shift-jis",[33088,33150],[33152,33196],[33208,33215],[33224,33230],[33242,33256],[33264,33271],[33276,33276],[33359,33368],[33376,33401],[33409,33434],[33439,33521],[33600,33662],[33664,33686],[33695,33718],[33727,33750],[33856,33888],[33904,33918],[33920,33937],[33951,33982],[34975,35068],...es(35136,38908,[0,62,64,188]),[38976,39026],[39071,39164],...es(39232,40956,[0,62,64,188]),...es(57408,59900,[0,62,64,188]),[59968,60030],[60032,60068]);let eo="0123456789";er(eo);let el=`${eo}ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:`;function ew(e){return e.replace(/%+/g,e=>{let t=1&e.length;return e=e.replace(/%%/g,"%"),t?e.replace(/%$/,"\x1d"):e})}er(el);/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let ea=new Map;class eu{#el;#r;#Q;static L=new eu("L",0,1);static M=new eu("M",1,0);static Q=new eu("Q",2,3);static H=new eu("H",3,2);constructor(e,t,n){this.#r=n,this.#el=e,this.#Q=t,ea.set(n,this)}get bits(){return this.#r}get name(){return this.#el}get level(){return this.#Q}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let ef=[[21522,0],[20773,1],[24188,2],[23371,3],[17913,4],[16590,5],[20375,6],[19104,7],[30660,8],[29427,9],[32170,10],[30877,11],[26159,12],[25368,13],[27713,14],[26998,15],[5769,16],[5054,17],[7399,18],[6608,19],[1890,20],[597,21],[3340,22],[2107,23],[13663,24],[12392,25],[16177,26],[14854,27],[9396,28],[8579,29],[11994,30],[11245,31]];class eh{#K;#Q;constructor(e){this.#K=7&e,this.#Q=function(e){let t=ea.get(e);if(null!=t)return t;throw Error("illegal error correction bits")}(e>>3&3)}get mask(){return this.#K}get level(){return this.#Q}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function ec(e,t,n,r){return e.get(t,n)?r<<1|1:r<<1}class ed{#z;#c;constructor(e){let{width:t,height:n}=e;this.#c=e.clone(),this.#z=Math.min(t,n)}readVersion(){let e=this.#z,n=0|(e-17)/4;if(n<1)throw Error("illegal version");if(n<=6)return b[n-1];let r=0,i=0,s=e-11,o=this.#c;for(let t=5;t>=0;t--)for(let n=e-9;n>=s;n--)r=ec(o,n,t,r);for(let t=5;t>=0;t--)for(let n=e-9;n>=s;n--)i=ec(o,t,n,i);let l=function(e,n){let r=32,i=0,{length:s}=g;for(let o=0;o<s;o++){let s=g[o];if(e===s||n===s)return b[o+6];let l=t(e^s);l<r&&(r=l,i=o+7),e!==n&&(l=t(n^s))<r&&(r=l,i=o+7)}if(r<=3&&i>=7)return b[i-1];throw Error("unable to decode version")}(r,i);if(l.size>e)throw Error("matrix size too small for version");return l}readFormatInfo(){let e=0,n=0,r=this.#c,i=this.#z,s=i-7;for(let t=0;t<=8;t++)6!==t&&(e=ec(r,t,8,e));for(let t=7;t>=0;t--)6!==t&&(e=ec(r,8,t,e));for(let e=i-1;e>=s;e--)n=ec(r,8,e,n);for(let e=i-8;e<i;e++)n=ec(r,e,8,n);return function(e,n){let r=32,i=0;for(let[s,o]of ef){if(e===s||n===s)return new eh(o);let l=t(e^s);l<r&&(r=l,i=o),e!==n&&(l=t(n^s))<r&&(r=l,i=o)}if(r<=3)return new eh(i);throw Error("unable to decode format information")}(e,n)}readCodewords(e,t){let n=0,i=0,s=0,o=!0,l=this.#z,w=this.#c,a=e.getECBlocks(t),u=function(e){let{size:t,version:n,alignmentPatterns:i}=e,{length:s}=i,o=new r(t,t),l=s-1;o.setRegion(0,0,9,9),o.setRegion(t-8,0,8,9),o.setRegion(0,t-8,9,8);for(let e=0;e<s;e++){let t=i[e]-2;for(let n=0;n<s;n++)(0!==e||0!==n&&n!==l)&&(e!==l||0!==n)&&o.setRegion(i[n]-2,t,5,5)}return o.setRegion(6,9,1,t-17),o.setRegion(9,6,t-17,1),n>6&&(o.setRegion(t-11,0,3,6),o.setRegion(0,t-11,6,3)),o}(e),f=new Uint8Array(a.numTotalCodewords);for(let e=l-1;e>0;e-=2){6===e&&e--;for(let t=0;t<l;t++){let r=o?l-1-t:t;for(let t=0;t<2;t++){let o=e-t;u.get(o,r)||(n++,s<<=1,w.get(o,r)&&(s|=1),8!==n||(f[i++]=s,n=0,s=0))}}o=!o}if(i!==a.numTotalCodewords)throw Error("illegal codewords length");return f}unmask(e){let t=this.#z,n=this.#c;for(let r=0;r<t;r++)for(let i=0;i<t;i++)(function(e,t,n){let r,i;switch(e){case 0:i=n+t&1;break;case 1:i=1&n;break;case 2:i=t%3;break;case 3:i=(n+t)%3;break;case 4:i=(0|n/2)+(0|t/3)&1;break;case 5:i=(1&(r=n*t))+r%3;break;case 6:i=(1&(r=n*t))+r%3&1;break;case 7:i=n*t%3+(n+t&1)&1;break;default:throw Error(`illegal mask: ${e}`)}return 0===i})(e,i,r)&&n.flip(i,r)}remask(e){this.unmask(e)}mirror(){let e=this.#z,t=this.#c;for(let n=0;n<e;n++)for(let r=n+1;r<e;r++)t.get(n,r)!==t.get(r,n)&&(t.flip(n,r),t.flip(r,n))}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class eg{#ew;#m;constructor(e,t){this.#ew=e,this.#m=t}get codewords(){return this.#ew}get numDataCodewords(){return this.#m}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class em{#ea;#eu;constructor(e,t){let{length:n}=t;if(n<=0)throw Error("polynomial coefficients cannot empty");if(this.#ea=e,n>1&&0===t[0]){let e=1;for(;e<n&&0===t[e];)e++;if(e===n)this.#eu=new Int32Array([0]);else{let r=new Int32Array(n-e);r.set(t.subarray(e)),this.#eu=r}}else this.#eu=t}get coefficients(){return this.#eu}isZero(){return 0===this.#eu[0]}getDegree(){return this.#eu.length-1}getCoefficient(e){let t=this.#eu;return t[t.length-1-e]}evaluate(e){let t;if(0===e)return this.getCoefficient(0);let n=this.#eu;if(1===e){for(let e of(t=0,n))t^=e;return t}[t]=n;let r=this.#ea,{length:i}=n;for(let s=1;s<i;s++)t=r.multiply(e,t)^n[s];return t}multiply(e){let t=this.#ea,n=this.#eu,{length:r}=n;if(e instanceof em){if(this.isZero()||e.isZero())return t.zero;let i=e.#eu,s=i.length,o=new Int32Array(r+s-1);for(let e=0;e<r;e++){let r=n[e];for(let n=0;n<s;n++)o[e+n]^=t.multiply(r,i[n])}return new em(t,o)}if(0===e)return t.zero;if(1===e)return this;let i=new Int32Array(r);for(let s=0;s<r;s++)i[s]=t.multiply(n[s],e);return new em(t,i)}multiplyByMonomial(e,t){let n=this.#ea;if(0===t)return n.zero;let r=this.#eu,{length:i}=r,s=new Int32Array(i+e);for(let e=0;e<i;e++)s[e]=n.multiply(r[e],t);return new em(n,s)}addOrSubtract(e){if(this.isZero())return e;if(e.isZero())return this;let t=e.#eu,n=t.length,r=this.#eu,i=r.length;n<i&&([n,i]=[i,n],[t,r]=[r,t]);let s=n-i,o=new Int32Array(n);o.set(t.subarray(0,s));for(let e=s;e<n;e++)o[e]=r[e-s]^t[e];return new em(this.#ea,o)}divide(e){let t=this.#ea,n=t.zero,r=this,i=e.getCoefficient(e.getDegree()),s=t.invert(i);for(;r.getDegree()>=e.getDegree()&&!r.isZero();){let i=r.getDegree(),o=i-e.getDegree(),l=t.multiply(r.getCoefficient(i),s),w=e.multiplyByMonomial(o,l),a=t.buildPolynomial(o,l);n=n.addOrSubtract(a),r=r.addOrSubtract(w)}return[n,r]}}let eb=new /**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class{#z;#ef;#eh;#ec;#ed;#eg;constructor(e,t,n){let r=1,i=new Int32Array(t);for(let n=0;n<t;n++)i[n]=r,(r*=2)>=t&&(r^=e,r&=t-1);let s=new Int32Array(t);for(let e=0,n=t-1;e<n;e++)s[i[e]]=e;this.#z=t,this.#ed=i,this.#eg=s,this.#ec=n,this.#ef=new em(this,new Int32Array([1])),this.#eh=new em(this,new Int32Array([0]))}get size(){return this.#z}get one(){return this.#ef}get zero(){return this.#eh}get generator(){return this.#ec}exp(e){return this.#ed[e]}log(e){return this.#eg[e]}invert(e){return this.#ed[this.#z-this.#eg[e]-1]}multiply(e,t){if(0===e||0===t)return 0;let n=this.#eg;return this.#ed[(n[e]+n[t])%(this.#z-1)]}buildPolynomial(e,t){if(0===t)return this.#eh;let n=new Int32Array(e+1);return n[0]=t,new em(this,n)}}(285,256,0);class ey{#ea;constructor(e=eb){this.#ea=e}decode(e,t){let n=!0,r=this.#ea,{generator:i}=r,s=new em(r,e),o=new Int32Array(t);for(let e=0;e<t;e++){let l=s.evaluate(r.exp(e+i));o[t-1-e]=l,0!==l&&(n=!1)}if(!n){let n=new em(r,o),[i,s]=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t,n,r){t.getDegree()<n.getDegree()&&([t,n]=[n,t]);let i=n,s=e.one,o=t,l=e.zero;for(;2*i.getDegree()>=r;){let t=l,n=o;if(l=s,(o=i).isZero())throw Error("remainder last was zero");i=n;let r=e.zero,w=i.getDegree(),a=o.getDegree(),u=o.getCoefficient(a),f=e.invert(u);for(;w>=a&&!i.isZero();){let t=i.getDegree()-a,n=e.multiply(i.getCoefficient(w),f);r=r.addOrSubtract(e.buildPolynomial(t,n)),w=(i=i.addOrSubtract(o.multiplyByMonomial(t,n))).getDegree()}if(s=r.multiply(l).addOrSubtract(t),w>=a)throw Error("division algorithm failed to reduce polynomial")}let w=s.getCoefficient(0);if(0===w)throw Error("sigma tilde(0) was zero");let a=e.invert(w);return[s.multiply(a),i.multiply(a)]}(r,r.buildPolynomial(t,1),n,t),l=function(e,t){let n=t.getDegree();if(1===n)return new Int32Array([t.getCoefficient(1)]);let r=0,{size:i}=e,s=new Int32Array(n);for(let o=1;o<i&&r<n;o++)0===t.evaluate(o)&&(s[r++]=e.invert(o));if(r!==n)throw Error("error locator degree does not match number of roots");return s}(r,i),w=function(e,t,n){let{length:r}=n,i=new Int32Array(r);for(let s=0;s<r;s++){let o=1,l=e.invert(n[s]);for(let t=0;t<r;t++)if(s!==t){let r=e.multiply(n[t],l),i=(1&r)==0?1|r:-2&r;o=e.multiply(o,i)}i[s]=e.multiply(t.evaluate(l),e.invert(o)),0!==e.generator&&(i[s]=e.multiply(i[s],l))}return i}(r,s,l),a=l.length,u=e.length;for(let t=0;t<a;t++){let n=u-1-r.log(l[t]);if(n<0)throw Error("bad error location");e[n]=e[n]^w[t]}return a}return 0}}function ep(e,t){switch(t){case en.BINARY:case en.UTF_32BE:case en.UTF_32LE:throw Error(`built-in decode not support charset: ${t.label}`);default:return new TextDecoder(t.label).decode(e)}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function ex(e,t,n){let{mask:r,level:i}=n,s=0,o=0;e.unmask(r);let l=t.getECBlocks(i),w=function(e,t,n){let{ecBlocks:r,numTotalCodewords:i,numECCodewordsPerBlock:s}=t.getECBlocks(n);if(e.length!==i)throw Error("failed to get data blocks");let o=[];for(let{count:e,numDataCodewords:t}of r)for(let n=0;n<e;n++){let e=s+t;o.push(new eg(new Uint8Array(e),t))}let{length:l}=o,w=l-1,a=o[0].codewords.length;for(;w>=0&&o[w].codewords.length!==a;)w--;w++;let u=0,f=a-s;for(let t=0;t<f;t++)for(let n=0;n<l;n++)o[n].codewords[t]=e[u++];for(let t=w;t<l;t++)o[t].codewords[f]=e[u++];let h=o[0].codewords.length;for(let t=f;t<h;t++)for(let n=0;n<l;n++){let r=n<w?t:t+1;o[n].codewords[r]=e[u++]}return o}(e.readCodewords(t,i),t,i),a=new Uint8Array(l.numTotalDataCodewords);for(let{codewords:e,numDataCodewords:t}of w){let[n,r]=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t){let n=new Int32Array(e),r=e.length-t,i=new ey().decode(n,r);return[n,i]}(e,t);a.set(n.subarray(0,t),s),o+=r,s+=t}return[a,o]}class eI{#em;constructor({decode:e=ep}={}){this.#em=e}decode(e){let t,n,r,i=0,s=!1,o=new ed(e);try{t=o.readVersion(),r=o.readFormatInfo(),[n,i]=ex(o,t,r)}catch{null!=r&&o.remask(r.mask),o.mirror(),s=!0,t=o.readVersion(),r=o.readFormatInfo(),[n,i]=ex(o,t,r)}return new Q(function(e,t,n){let r,i,s,o="",l=-1,w=!1,a=!1,u=!1,f=!1,h=new W(e);do switch(i=4>h.available()?ee.TERMINATOR:function(e){let t=X.get(e);if(null!=t)return t;throw Error("illegal mode bits")}(h.read(4))){case ee.TERMINATOR:break;case ee.FNC1_FIRST_POSITION:w=!0;break;case ee.FNC1_SECOND_POSITION:a=!0,l=h.read(8);break;case ee.STRUCTURED_APPEND:if(16>h.available())throw Error("illegal structured append");f=Object.freeze({index:h.read(4),count:h.read(4)+1,parity:h.read(8)});break;case ee.ECI:s=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e){let t=e.read(8);if((128&t)==0)return 127&t;if((192&t)==128)return(63&t)<<8|e.read(8);if((224&t)==192)return(31&t)<<16|e.read(16);throw Error("illegal extended channel interpretation value")}(h);break;default:if(i===ee.HANZI&&1!==h.read(4))throw Error("illegal hanzi subset");let c=h.read(i.getCharacterCountBits(t));switch(i){case ee.ALPHANUMERIC:o+=function(e,t,n){let r="";for(;t>1;){if(11>e.available())throw Error("illegal bits length");let n=e.read(11);r+=el.charAt(n/45)+el.charAt(n%45),t-=2}if(1===t){if(6>e.available())throw Error("illegal bits length");r+=el.charAt(e.read(6))}return n?ew(r):r}(h,c,w||a);break;case ee.BYTE:o+=function(e,t,n,r,i){if(e.available()<8*t)throw Error("illegal bits length");let s=new Uint8Array(t),o=null!=i?function(e){let t=et.get(e);if(t)return t;throw Error("illegal charset value")}(i):en.ISO_8859_1;for(let n=0;n<t;n++)s[n]=e.read(8);let l=n(s,o);return r?ew(l):l}(h,c,n,w||a,s);break;case ee.HANZI:o+=function(e,t){if(e.available()<13*t)throw Error("illegal bits length");let n=0,r=new Uint8Array(2*t);for(;t>0;){let i=e.read(13),s=i/96<<8|i%96;s<2560?s+=41377:s+=42657,r[n]=s>>8&255,r[n+1]=255&s,t--,n+=2}return new TextDecoder("gb2312").decode(r)}(h,c);break;case ee.KANJI:o+=function(e,t){if(e.available()<13*t)throw Error("illegal bits length");let n=0,r=new Uint8Array(2*t);for(;t>0;){let i=e.read(13),s=i/192<<8|i%192;s<7936?s+=33088:s+=49472,r[n]=s>>8&255,r[n+1]=255&s,t--,n+=2}return new TextDecoder("shift-jis").decode(r)}(h,c);break;case ee.NUMERIC:o+=function(e,t){let n="";for(;t>=3;){if(10>e.available())throw Error("illegal bits length");let r=e.read(10);if(r>=1e3)throw Error("illegal numeric codeword");n+=eo.charAt(r/100)+eo.charAt(r/10%10)+eo.charAt(r%10),t-=3}if(2===t){if(7>e.available())throw Error("illegal bits length");let t=e.read(7);if(t>=100)throw Error("illegal numeric codeword");n+=eo.charAt(t/10)+eo.charAt(t%10)}else if(1===t){if(4>e.available())throw Error("illegal bits length");let t=e.read(4);if(t>=10)throw Error("illegal numeric codeword");n+=eo.charAt(t)}return n}(h,c);break;default:throw Error("illegal mode")}}while(i!==ee.TERMINATOR);return w?u=Object.freeze(["GS1"]):a&&(u=Object.freeze(["AIM",l])),r=null!=s?w?4:a?6:2:w?3:a?5:1,{content:o,codewords:e,structured:f,symbology:`]Q${r}`,fnc1:u}}(n,t,this.#em),t,r,i,s)}}function ez(e){return{x:e.x,y:e.y}}function eC(e){return{x:e.x,y:e.y,moduleSize:e.moduleSize}}self.addEventListener("message",async e=>{let{data:t}=e,{uid:n,image:l}=t,{width:w,height:a}=l,u=new OffscreenCanvas(w,a).getContext("2d");u.drawImage(l,0,0);let f=function(e,t,n){if(e.length!==t*n)throw Error("luminances length must be equals to width * height");return t<40||n<40?function(e,t,n){let i=new r(t,n),s=new Int32Array(32);for(let r=1;r<5;r++){let i=0|4*t/5,o=(0|n*r/5)*t;for(let n=0|t/5;n<i;n++){let t=e[o+n];s[t>>3]++}}let o=function(e){let t=0,n=0,r=0,{length:i}=e;for(let s=0;s<i;s++)e[s]>n&&(t=s,n=e[s]),e[s]>r&&(r=e[s]);let s=0,o=0;for(let n=0;n<i;n++){let r=n-t,i=e[n]*r*r;i>o&&(s=n,o=i)}if(t>s&&([t,s]=[s,t]),s-t<=2)return -1;let l=-1,w=s-1;for(let n=s-1;n>t;n--){let i=n-t,o=i*i*(s-n)*(r-e[n]);o>l&&(w=n,l=o)}return w<<3}(s);if(o>0)for(let r=0;r<n;r++){let n=r*t;for(let s=0;s<t;s++)e[n+s]<o&&i.set(s,r)}return i}(e,t,n):function(e,t,n){let l=t-8,w=n-8,a=i(t),u=i(n),f=new r(t,n),h=function(e,t,n){let r=[],s=t-8,l=n-8,w=i(t),a=i(n);for(let n=0;n<a;n++){r[n]=new Int32Array(w);let i=o(n,l);for(let l=0;l<w;l++){let w=0,a=0,u=255,f=o(l,s);for(let n=0,r=i*t+f;n<8;n++,r+=t){for(let t=0;t<8;t++){let n=e[r+t];w+=n,n<u&&(u=n),n>a&&(a=n)}if(a-u>24)for(n++,r+=t;n<8;n++,r+=t)for(let t=0;t<8;t++)w+=e[r+t]}let h=w>>6;if(a-u<=24&&(h=u/2,n>0&&l>0)){let e=(r[n-1][l]+2*r[n][l-1]+r[n-1][l-1])/4;u<e&&(h=e)}r[n][l]=h}}return r}(e,t,n);for(let n=0;n<u;n++){let r=s(n,u-3),i=o(n,w);for(let n=0;n<a;n++){let w=0,u=s(n,a-3),c=o(n,l);for(let e=-2;e<=2;e++){let t=h[r+e];w+=t[u-2]+t[u-1]+t[u]+t[u+1]+t[u+2]}let d=w/25;for(let n=0,r=i*t+c;n<8;n++,r+=t)for(let t=0;t<8;t++)e[r+t]<=d&&f.set(c+t,i+n)}}return f}(e,t,n)}(function(e){let{data:t,width:n,height:r}=e,i=new Uint8Array(n*r);for(let e=0;e<r;e++){let r=e*n;for(let e=0;e<n;e++){let n=4*(r+e),s=t[n],o=t[n+1],l=t[n+2];i[r+e]=306*s+601*o+117*l+512>>10}}return i}(u.getImageData(0,0,w,a)),w,a);t.invert&&f.flip();let h=new K({strict:t.strict}).detect(f),c=[],d=new eI,g=h.next();for(;!g.done;){let e=!1,t=g.value;try{let{size:n,finder:r,alignment:i}=t,s=d.decode(t.matrix),{topLeft:o,topRight:l,bottomLeft:w}=r,a=t.mapping(0,0),u=t.mapping(n,0),f=t.mapping(n,n),h=t.mapping(0,n),g=t.mapping(6.5,6.5),m=t.mapping(n-6.5,6.5),b=t.mapping(6.5,n-6.5);c.push({fnc1:s.fnc1,mask:s.mask,level:s.level,mirror:s.mirror,content:s.content,version:s.version,corrected:s.corrected,symbology:s.symbology,structured:s.structured,alignment:i?eC(i):null,finder:[eC(o),eC(l),eC(w)],timing:[ez(g),ez(m),ez(b)],corners:[ez(a),ez(u),ez(f),ez(h)]}),e=!0}catch{}g=h.next(e)}c.length>0?self.postMessage({type:"ok",payload:{uid:n,image:l,items:c}},[l]):self.postMessage({type:"error",message:"未发现二维码"})})}();