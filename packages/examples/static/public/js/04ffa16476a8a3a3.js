!function(){"use strict";var e;function t(e){return 0|e+(e<0?-.5:.5)}function n(e){return e-=e>>1&1431655765,((e=(858993459&e)+(e>>2&858993459))+(e>>4)&252645135)*16843009>>24}function r(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:e.length,r=0;for(let i=t;i<n;i++)r+=e[i];return r}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class i{#e;#t;#n;#r;constructor(e,t,n){let r=Math.ceil(e/32),i=r*t;if(this.#e=e,this.#t=t,this.#n=r,n instanceof Int32Array){if(n.length!==i)throw Error(`matrix bits capacity mismatch: ${i}`);this.#r=n}else this.#r=new Int32Array(i)}#i(e,t){return t*this.#n+(0|e/32)}get width(){return this.#e}get height(){return this.#t}set(e,t){let n=this.#i(e,t);this.#r[n]|=1<<(31&e)}get(e,t){let n=this.#i(e,t);return this.#r[n]>>>(31&e)&1}flip(e,t){if(null!=e&&null!=t){let n=this.#i(e,t);this.#r[n]^=1<<(31&e)}else{let e=this.#r,{length:t}=e;for(let n=0;n<t;n++)e[n]=~e[n]}}clone(){return new i(this.#e,this.#t,new Int32Array(this.#r))}setRegion(e,t,n,r){let i=this.#r,s=e+n,o=t+r,l=this.#n;for(let n=t;n<o;n++){let t=n*l;for(let n=e;n<s;n++)i[t+(0|n/32)]|=1<<(31&n)}}}function s(e){let t=e>>3;return 7&e&&t++,t}function o(e,t){return e<2?2:Math.min(e,t)}function l(e,t){return(e<<=3)>t?t:e}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class w{#s;#o;constructor(e,t){this.#s=e,this.#o=t}get x(){return this.#s}get y(){return this.#o}}function a(e,t){return Math.sqrt(u(e,t))}function u(e,t){let n=e.x-t.x,r=e.y-t.y;return n*n+r*r}function h(e,t,n){let{x:r,y:i}=e,{x:s,y:o}=t,{x:l,y:w}=n;return Math.abs(r*(o-w)+s*(w-i)+l*(i-o))/2}class f extends w{#l;#e;#t;#w;#a;#u=1;#h;#f;static noise(e){return e.#l}static width(e){return e.#e}static height(e){return e.#t}static combined(e){return e.#u}static rect(e){return e.#w}static equals(e,t,n,r,i){let{modules:s}=e.#h,o=e.#f;if(Math.abs(t-e.x)<=o&&Math.abs(n-e.y)<=o){let t=e.#a,n=Math.abs((r+i)/s/2-t);if(n<=1||n<=t)return!0}return!1}static combine(e,t,n,r,i,s){let o=e.#u,l=o+1,w=(e.x*o+t)/l,a=(e.y*o+n)/l,u=(e.#l*o+s)/l,h=(e.#e*o+r)/l,c=(e.#t*o+i)/l,d=new f(e.#h,w,a,h,c,u);return d.#u=l,d}constructor(e,t,n,r,i,s){super(t,n);let{modules:o}=e,l=r/2,w=i/2,a=r/o,u=i/o,h=a/2,f=u/2,c=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e){let{ratios:t}=e;return t[0|t.length/2]/2}(e),d=(a+u)/2;this.#l=s,this.#e=r,this.#t=i,this.#h=e,this.#a=d,this.#w=[t-l+h,n-w+f,t+l-h,n+w-f],this.#f=d*c}get moduleSize(){return this.#a}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class c{#c;#d;constructor(e,t){this.#c=e,this.#d=t}sample(e,t){let n=this.#c,r=n.width,s=this.#d,o=n.height,l=new i(e,t);for(let i=0;i<t;i++)for(let t=0;t<e;t++){let[e,w]=s.mapping(t+.5,i+.5),a=0|e,u=0|w;a>=0&&u>=0&&a<r&&u<o&&n.get(a,u)&&l.set(t,i)}return l}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class d{#g;#m;constructor(e,t){this.#g=e,this.#m=t}get count(){return this.#g}get numDataCodewords(){return this.#m}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class g{#b;#y;#p;#x;#I;constructor(e,...t){let n=0,r=0;for(let{count:e,numDataCodewords:i}of t)n+=e,r+=i*e;let i=e*n;this.#b=t,this.#p=i,this.#x=r,this.#I=e,this.#y=r+i}get ecBlocks(){return this.#b}get numTotalCodewords(){return this.#y}get numTotalECCodewords(){return this.#p}get numTotalDataCodewords(){return this.#x}get numECCodewordsPerBlock(){return this.#I}}let m=[31892,34236,39577,42195,48118,51042,55367,58893,63784,68472,70749,76311,79154,84390,87683,92361,96236,102084,102881,110507,110734,117786,119615,126325,127568,133589,136944,141498,145311,150283,152622,158308,161089,167017];class b{#z;#C;#b;#E;constructor(e,t,...n){this.#C=e,this.#b=n,this.#z=17+4*e,this.#E=t}get size(){return this.#z}get version(){return this.#C}get alignmentPatterns(){return this.#E}getECBlocks(e){let{level:t}=e;return this.#b[t]}}let y=[new b(1,[],new g(7,new d(1,19)),new g(10,new d(1,16)),new g(13,new d(1,13)),new g(17,new d(1,9))),new b(2,[6,18],new g(10,new d(1,34)),new g(16,new d(1,28)),new g(22,new d(1,22)),new g(28,new d(1,16))),new b(3,[6,22],new g(15,new d(1,55)),new g(26,new d(1,44)),new g(18,new d(2,17)),new g(22,new d(2,13))),new b(4,[6,26],new g(20,new d(1,80)),new g(18,new d(2,32)),new g(26,new d(2,24)),new g(16,new d(4,9))),new b(5,[6,30],new g(26,new d(1,108)),new g(24,new d(2,43)),new g(18,new d(2,15),new d(2,16)),new g(22,new d(2,11),new d(2,12))),new b(6,[6,34],new g(18,new d(2,68)),new g(16,new d(4,27)),new g(24,new d(4,19)),new g(28,new d(4,15))),new b(7,[6,22,38],new g(20,new d(2,78)),new g(18,new d(4,31)),new g(18,new d(2,14),new d(4,15)),new g(26,new d(4,13),new d(1,14))),new b(8,[6,24,42],new g(24,new d(2,97)),new g(22,new d(2,38),new d(2,39)),new g(22,new d(4,18),new d(2,19)),new g(26,new d(4,14),new d(2,15))),new b(9,[6,26,46],new g(30,new d(2,116)),new g(22,new d(3,36),new d(2,37)),new g(20,new d(4,16),new d(4,17)),new g(24,new d(4,12),new d(4,13))),new b(10,[6,28,50],new g(18,new d(2,68),new d(2,69)),new g(26,new d(4,43),new d(1,44)),new g(24,new d(6,19),new d(2,20)),new g(28,new d(6,15),new d(2,16))),new b(11,[6,30,54],new g(20,new d(4,81)),new g(30,new d(1,50),new d(4,51)),new g(28,new d(4,22),new d(4,23)),new g(24,new d(3,12),new d(8,13))),new b(12,[6,32,58],new g(24,new d(2,92),new d(2,93)),new g(22,new d(6,36),new d(2,37)),new g(26,new d(4,20),new d(6,21)),new g(28,new d(7,14),new d(4,15))),new b(13,[6,34,62],new g(26,new d(4,107)),new g(22,new d(8,37),new d(1,38)),new g(24,new d(8,20),new d(4,21)),new g(22,new d(12,11),new d(4,12))),new b(14,[6,26,46,66],new g(30,new d(3,115),new d(1,116)),new g(24,new d(4,40),new d(5,41)),new g(20,new d(11,16),new d(5,17)),new g(24,new d(11,12),new d(5,13))),new b(15,[6,26,48,70],new g(22,new d(5,87),new d(1,88)),new g(24,new d(5,41),new d(5,42)),new g(30,new d(5,24),new d(7,25)),new g(24,new d(11,12),new d(7,13))),new b(16,[6,26,50,74],new g(24,new d(5,98),new d(1,99)),new g(28,new d(7,45),new d(3,46)),new g(24,new d(15,19),new d(2,20)),new g(30,new d(3,15),new d(13,16))),new b(17,[6,30,54,78],new g(28,new d(1,107),new d(5,108)),new g(28,new d(10,46),new d(1,47)),new g(28,new d(1,22),new d(15,23)),new g(28,new d(2,14),new d(17,15))),new b(18,[6,30,56,82],new g(30,new d(5,120),new d(1,121)),new g(26,new d(9,43),new d(4,44)),new g(28,new d(17,22),new d(1,23)),new g(28,new d(2,14),new d(19,15))),new b(19,[6,30,58,86],new g(28,new d(3,113),new d(4,114)),new g(26,new d(3,44),new d(11,45)),new g(26,new d(17,21),new d(4,22)),new g(26,new d(9,13),new d(16,14))),new b(20,[6,34,62,90],new g(28,new d(3,107),new d(5,108)),new g(26,new d(3,41),new d(13,42)),new g(30,new d(15,24),new d(5,25)),new g(28,new d(15,15),new d(10,16))),new b(21,[6,28,50,72,94],new g(28,new d(4,116),new d(4,117)),new g(26,new d(17,42)),new g(28,new d(17,22),new d(6,23)),new g(30,new d(19,16),new d(6,17))),new b(22,[6,26,50,74,98],new g(28,new d(2,111),new d(7,112)),new g(28,new d(17,46)),new g(30,new d(7,24),new d(16,25)),new g(24,new d(34,13))),new b(23,[6,30,54,78,102],new g(30,new d(4,121),new d(5,122)),new g(28,new d(4,47),new d(14,48)),new g(30,new d(11,24),new d(14,25)),new g(30,new d(16,15),new d(14,16))),new b(24,[6,28,54,80,106],new g(30,new d(6,117),new d(4,118)),new g(28,new d(6,45),new d(14,46)),new g(30,new d(11,24),new d(16,25)),new g(30,new d(30,16),new d(2,17))),new b(25,[6,32,58,84,110],new g(26,new d(8,106),new d(4,107)),new g(28,new d(8,47),new d(13,48)),new g(30,new d(7,24),new d(22,25)),new g(30,new d(22,15),new d(13,16))),new b(26,[6,30,58,86,114],new g(28,new d(10,114),new d(2,115)),new g(28,new d(19,46),new d(4,47)),new g(28,new d(28,22),new d(6,23)),new g(30,new d(33,16),new d(4,17))),new b(27,[6,34,62,90,118],new g(30,new d(8,122),new d(4,123)),new g(28,new d(22,45),new d(3,46)),new g(30,new d(8,23),new d(26,24)),new g(30,new d(12,15),new d(28,16))),new b(28,[6,26,50,74,98,122],new g(30,new d(3,117),new d(10,118)),new g(28,new d(3,45),new d(23,46)),new g(30,new d(4,24),new d(31,25)),new g(30,new d(11,15),new d(31,16))),new b(29,[6,30,54,78,102,126],new g(30,new d(7,116),new d(7,117)),new g(28,new d(21,45),new d(7,46)),new g(30,new d(1,23),new d(37,24)),new g(30,new d(19,15),new d(26,16))),new b(30,[6,26,52,78,104,130],new g(30,new d(5,115),new d(10,116)),new g(28,new d(19,47),new d(10,48)),new g(30,new d(15,24),new d(25,25)),new g(30,new d(23,15),new d(25,16))),new b(31,[6,30,56,82,108,134],new g(30,new d(13,115),new d(3,116)),new g(28,new d(2,46),new d(29,47)),new g(30,new d(42,24),new d(1,25)),new g(30,new d(23,15),new d(28,16))),new b(32,[6,34,60,86,112,138],new g(30,new d(17,115)),new g(28,new d(10,46),new d(23,47)),new g(30,new d(10,24),new d(35,25)),new g(30,new d(19,15),new d(35,16))),new b(33,[6,30,58,86,114,142],new g(30,new d(17,115),new d(1,116)),new g(28,new d(14,46),new d(21,47)),new g(30,new d(29,24),new d(19,25)),new g(30,new d(11,15),new d(46,16))),new b(34,[6,34,62,90,118,146],new g(30,new d(13,115),new d(6,116)),new g(28,new d(14,46),new d(23,47)),new g(30,new d(44,24),new d(7,25)),new g(30,new d(59,16),new d(1,17))),new b(35,[6,30,54,78,102,126,150],new g(30,new d(12,121),new d(7,122)),new g(28,new d(12,47),new d(26,48)),new g(30,new d(39,24),new d(14,25)),new g(30,new d(22,15),new d(41,16))),new b(36,[6,24,50,76,102,128,154],new g(30,new d(6,121),new d(14,122)),new g(28,new d(6,47),new d(34,48)),new g(30,new d(46,24),new d(10,25)),new g(30,new d(2,15),new d(64,16))),new b(37,[6,28,54,80,106,132,158],new g(30,new d(17,122),new d(4,123)),new g(28,new d(29,46),new d(14,47)),new g(30,new d(49,24),new d(10,25)),new g(30,new d(24,15),new d(46,16))),new b(38,[6,32,58,84,110,136,162],new g(30,new d(4,122),new d(18,123)),new g(28,new d(13,46),new d(32,47)),new g(30,new d(48,24),new d(14,25)),new g(30,new d(42,15),new d(32,16))),new b(39,[6,26,54,82,110,138,166],new g(30,new d(20,117),new d(4,118)),new g(28,new d(40,47),new d(7,48)),new g(30,new d(43,24),new d(22,25)),new g(30,new d(10,15),new d(67,16))),new b(40,[6,30,58,86,114,142,170],new g(30,new d(19,118),new d(6,119)),new g(28,new d(18,47),new d(31,48)),new g(30,new d(34,24),new d(34,25)),new g(30,new d(20,15),new d(61,16)))];/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class p{#S;#v;#A;#O;#k;#M;constructor(e,t){let n=0|t.x,r=0|t.y,i=0|e.x,s=0|e.y,o=Math.abs(r-s)>Math.abs(n-i);o&&([i,s,n,r]=[s,i,r,n]);let l=i<n?1:-1;this.#O=o,this.#A=n+l,this.#S=new w(n,r),this.#v=new w(i,s),this.#k=[l,s<r?1:-1],this.#M=[Math.abs(n-i),Math.abs(r-s)]}*points(){let e=this.#A,t=this.#O,{y:n}=this.#S,[r,i]=this.#k,[s,o]=this.#M,{x:l,y:w}=this.#v,a=0|-s/2;for(let u=l,h=w;u!==e;u+=r)if(yield[t?h:u,t?u:h],(a+=o)>0){if(h===n)break;h+=i,a-=s}}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function x(e,t,n){let r=0,{width:i,height:s}=e,o=new w((t.x+n.x)/2,(t.y+n.y)/2);for(let[n,l]of new p(t,o).points()){if(n<0||l<0||n>=i||l>=s){if(2===r)return a(t,new w(n,l));break}if(1===r==(1===e.get(n,l))){if(2===r)return a(t,new w(n,l));r++}}return NaN}function I(e,t,n){let r=x(e,t,n);if(Number.isNaN(r))return NaN;let{x:i,y:s}=n,{x:o,y:l}=t,a=x(e,t,new w(o-(i-o),l-(s-l)));return Number.isNaN(a)?NaN:r+a-1}function z(e,t,n){let r=new w(0|t.x,0|t.y),i=new w(0|n.x,0|n.y),s=I(e,r,i),o=I(e,i,r);return Number.isNaN(s)?o/7:Number.isNaN(o)?s/7:(s+o)/14}function C(e,t){var n,r,i,s;let o=Math.max((n=f.width(e))>(r=f.width(t))?n/r:r/n,(i=f.height(e))>(s=f.height(t))?i/s:s/i);return o*o}class E{#T;#z;#c;#_;#a;#N;#R;static moduleSizes(e){if(null==e.#R){let t=e.#c,[n,r,i]=e.#N;e.#R=[z(t,n,r),z(t,n,i)]}return e.#R}static size(n){if(null==n.#z){let r=e.moduleSize(n);n.#z=function(e,n){let[r,i,s]=e,o=t((a(r,i)+a(r,s))/n/2)+7;switch(3&o){case 0:return o+1;case 2:return o-1;case 3:return Math.min(o+2,177)}return o}(n.#N,r)}return n.#z}static moduleSize(t){return null==t.#a&&(t.#a=r(e.moduleSizes(t))/2),t.#a}static contains(t,n){let r=t.#D(),[i,s,o]=t.#N,l=e.bottomRight(t),w=h(i,s,n);return w+h(s,l,n)+h(l,o,n)+h(o,i,n)-r<1}static bottomRight(e){return null==e.#_&&(e.#_=function(e){let[t,n,r]=e,{x:i,y:s}=t;return new w(n.x+r.x-i,n.y+r.y-s)}(e.#N)),e.#_}constructor(e,t){this.#c=e,this.#N=function(e){let t,n,r;let[i,s,o]=e,l=u(i,s)*C(i,s),w=u(i,o)*C(i,o),a=u(s,o)*C(s,o);return a>=l&&a>=w?[t,r,n]=e:w>=a&&w>=l?[r,t,n]=e:[r,n,t]=e,0>function(e,t,n){let{x:r,y:i}=t;return(n.x-r)*(e.y-i)-(n.y-i)*(e.x-r)}(r,t,n)&&([r,n]=[n,r]),[t,n,r]}(t)}get topLeft(){return this.#N[0]}get topRight(){return this.#N[1]}get bottomLeft(){return this.#N[2]}#D(){let[t,n,r]=this.#N,i=e.bottomRight(this);if(null==this.#T){let e=h(t,n,i),s=h(i,r,t);this.#T=e+s}return this.#T}}e=E;/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class S{#c;#B;#P;#d;constructor(e,t,n,r){let i=new c(e,t),s=E.size(n);this.#c=e,this.#d=t,this.#P=n,this.#B=r,this.#c=i.sample(s,s)}get matrix(){return this.#c}get finder(){return this.#P}get alignment(){return this.#B}get size(){return E.size(this.#P)}get moduleSize(){return E.moduleSize(this.#P)}mapping(e,t){return[e,t]=this.#d.mapping(e,t),new w(e,t)}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class v{#U;#F;#L;#Z;#H;#j;#$;#q;#G;constructor(e,t,n,r,i,s,o,l,w){this.#U=e,this.#F=r,this.#L=o,this.#Z=t,this.#H=i,this.#j=l,this.#$=n,this.#q=s,this.#G=w}inverse(){let e=this.#U,t=this.#F,n=this.#L,r=this.#Z,i=this.#H,s=this.#j,o=this.#$,l=this.#q,w=this.#G;return new v(i*w-s*l,s*o-r*w,r*l-i*o,n*l-t*w,e*w-n*o,t*o-e*l,t*s-n*i,n*r-e*s,e*i-t*r)}times(e){let t=this.#U,n=this.#F,r=this.#L,i=this.#Z,s=this.#H,o=this.#j,l=this.#$,w=this.#q,a=this.#G,u=e.#U,h=e.#F,f=e.#L,c=e.#Z,d=e.#H,g=e.#j,m=e.#$,b=e.#q,y=e.#G;return new v(t*u+i*h+l*f,t*c+i*d+l*g,t*m+i*b+l*y,n*u+s*h+w*f,n*c+s*d+w*g,n*m+s*b+w*y,r*u+o*h+a*f,r*c+o*d+a*g,r*m+o*b+a*y)}mapping(e,t){let n=this.#U,r=this.#F,i=this.#L,s=this.#Z,o=this.#H,l=this.#j,w=this.#$,a=this.#q,u=i*e+l*t+this.#G;return[(n*e+s*t+w)/u,(r*e+o*t+a)/u]}}function A(e,t,n,r,i,s,o,l){let w=e-n+i-o,a=t-r+s-l;if(0===w&&0===a)return new v(n-e,i-n,e,r-t,s-r,t,0,0,1);{let u=n-i,h=o-i,f=r-s,c=l-s,d=u*c-h*f,g=(w*c-h*a)/d,m=(u*a-w*f)/d;return new v(n-e+g*n,o-e+m*o,e,r-t+g*r,l-t+m*l,t,g,m,1)}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function O(e,t){let n,r,i,s;let{x:o,y:l}=e.topLeft,{x:w,y:a}=e.topRight,{x:u,y:h}=e.bottomLeft,f=E.size(e)-3.5;return null!=t?(n=t.x,r=t.y,s=i=f-3):(n=w+u-o,r=a+h-l,i=f,s=f),function(e,t,n,r,i,s,o,l,w,a,u,h,f,c,d,g){let m=A(3.5,3.5,n,3.5,i,s,3.5,l).inverse();return A(w,a,u,h,f,c,d,g).times(m)}(0,0,f,0,i,s,0,f,o,l,w,a,n,r,u,h)}function k(e,t){let[n,,r]=f.rect(e);return t>0?r:t<0?n:e.x}function M(e,t){let[,n,,r]=f.rect(e);return t>0?r:t<0?n:e.y}function T(e,t,n,r){let{x:i,y:s}=t,{x:o,y:l}=e,{x:a,y:u}=n,h=a>i?1:a<i?-1:0,f=u>s?1:u<s?-1:0,c=k(t,h),d=M(t,f),g=k(e,h),m=M(e,f);return 0===h||0===f?[new w(g,m),new w(c,d)]:(r?h===f:h!==f)?[new w(o,m),new w(i,d)]:[new w(g,l),new w(c,s)]}function _(e,t,n,r){let i=r+8,s=new p(t,n).points(),o=1,l=e.get(0|t.x,0|t.y);for(let[t,n]of s){let r=e.get(t,n);if(r!==l&&(o++,l=r,o>i))return!1}return o>=r-14-Math.max(2,(r-17)/4)}function N(e,t,n){let{topLeft:r,topRight:i,bottomLeft:s}=t,[o,l]=n?T(r,s,i,!0):T(r,i,s);return _(e,o,l,E.size(t))}function R(e,t,n,r){let[i,s]=t.mapping(r?6.5:7.5,r?7.5:6.5),[o,l]=t.mapping(r?6.5:n-7.5,r?n-7.5:6.5);return _(e,new w(i,s),new w(o,l),n)}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class D{#V;#h;constructor(e){this.#h=e,this.#V=r(e)}get modules(){return this.#V}get ratios(){return this.#h}}let B=new D([1,1,3,1,1]),P=new D([1,1,1,1,1]),U=new D([1,1,1]);function F(e,t){let{length:n}=e,r=n-1;for(let t=0;t<r;t++)e[t]=e[t+1];e[r]=t}function L(e,t,n,r,i){let s=-1,o=t|=0,l=n|=0,w=[0,0,0,0,0],{width:a,height:u}=e,h=i?-1:1,f=()=>{o+=s,l-=s*h},c=()=>e.get(o,l);for(;o>=0&&l>=0&&l<u&&c();)f(),w[2]++;for(;o>=0&&l>=0&&l<u&&!c();)f(),w[1]++;for(;o>=0&&l>=0&&l<u&&w[0]<r&&c();)f(),w[0]++;for(o=t+(s=1),l=n-s*h;o<a&&l>=0&&l<u&&c();)f(),w[2]++;for(;o<a&&l>=0&&l<u&&!c();)f(),w[3]++;for(;o<a&&l>=0&&l<u&&w[4]<r&&c();)f(),w[4]++;return w}function Z(e,t){let n=[],i=0|e.length/2;for(let t=0;t<=i;t++){let s=i+t+1;n.push(r(e,i-t,s)/2+r(e,s))}return t-(2*n[0]+r(n,1))/(i+2)}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let H=Math.PI/180,j=40*H,$=140*H;function q(e,t,n,r,i,s){let[o,l]=function(e,t,n,r,i){t|=0,n|=0;let s=i?n:t,o=[0,0,0,0,0],l=i?e.height:e.width,w=()=>i?e.get(t,s):e.get(s,n);for(;s>=0&&w();)s--,o[2]++;for(;s>=0&&!w();)s--,o[1]++;for(;s>=0&&o[0]<r&&w();)s--,o[0]++;for(s=(i?n:t)+1;s<l&&w();)s++,o[2]++;for(;s<l&&!w();)s++,o[3]++;for(;s<l&&o[4]<r&&w();)s++,o[4]++;return[o,s]}(e,t,n,r,s);return[V(o,i)?Z(o,l):NaN,o]}function G(e,t,n){return e>t&&([e,t]=[t,e]),t-e<=t*n}function V(e,t){let{ratios:n,modules:r}=t,{length:i}=e,s=function(e){let t=0;for(let n of e){if(0===n)return NaN;t+=n}return t}(e);if(s>=r){let t=s/r,o=.625*t+.5;for(let r=0;r<i;r++){let i=n[r];if(Math.abs(e[r]-t*i)>o)return!1}return!0}return!1}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class Y{#Y;#c;#h;#N=[];constructor(e,t,n){this.#c=e,this.#h=t,this.#Y=n}get matrix(){return this.#c}get patterns(){return this.#N}match(e,t,n,i){let s=this.#c,o=this.#h,l=Z(n,e),[w,a]=q(s,l,t,i,o,!0);if(w>=0){let e;if([l,e]=q(s,l,w,i,o),l>=0){let t=L(s,l,w,i),n=L(s,l,w,i,!0);if(this.#Y?V(t,o)&&V(n,o):V(t,o)||V(n,o)){let i=function(e){for(var t=arguments.length,n=Array(t>1?t-1:0),i=1;i<t;i++)n[i-1]=arguments[i];let s=0,o=0,{length:l}=n,w=[];for(let t of n){let[n,i]=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t){let{ratios:n,modules:i}=t,s=0,{length:o}=n,l=r(e),w=l/i;for(let t=0;t<o;t++)s+=Math.abs(e[t]-n[t]*w);return[s/l,w]}(t,e);s+=n,w.push(i)}let a=r(w),u=a/l;for(let e of w)o+=Math.abs(e-u);return s+o/a}(o,e,a,t,n),s=r(e),u=r(a),h=this.#N,{length:c}=h,d=!1;for(let e=0;e<c;e++){let t=h[e];if(f.equals(t,l,w,s,u)){d=!0,h[e]=f.combine(t,l,w,s,u,i);break}}d||h.push(new f(o,l,w,s,u,i))}}}}}class J extends Y{constructor(e,t){super(e,B,t)}*groups(){let e=this.patterns.filter(e=>f.combined(e)>=3&&1.5>=f.noise(e)),{length:n}=e;if(3===n){let t=new E(this.matrix,e),n=E.size(t);n>=21&&n<=177&&(yield t)}else if(n>3){let r=n-2,i=n-1,s=new Map;for(let o=0;o<r;o++){let r=e[o],l=r.moduleSize;if(!s.has(r))for(let w=o+1;w<i;w++){let i=e[w],o=i.moduleSize;if(s.has(r))break;if(!s.has(i)&&G(l,o,.5))for(let u=w+1;u<n;u++){let n=e[u],w=n.moduleSize;if(s.has(r)||s.has(i))break;if(!G(l,w,.5)||!G(o,w,.5))continue;let{matrix:h}=this,c=new E(h,[r,i,n]),d=function(e){let{topLeft:t,topRight:n,bottomLeft:r}=e,{x:i,y:s}=t,o=n.x-i,l=n.y-s,w=r.x-i,a=r.y-s;return Math.acos((o*w+l*a)/Math.sqrt((o*o+l*l)*(w*w+a*a)))}(c);if(d>=j&&d<=$){let[o,l]=E.moduleSizes(c);if(o>=1&&l>=1){let{topLeft:w,topRight:u,bottomLeft:d}=c,g=a(w,u),m=a(w,d);if(4>=Math.abs(t(g/o)-t(m/l))){let t=E.size(c);t>=21&&t<=177&&!/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t,n){let r=0,{topLeft:i,topRight:s,bottomLeft:o}=e;for(let l of t)if(l!==i&&l!==s&&l!==o){let t;if(n.has(l)&&(t=E.contains(e,l))||1>f.noise(l)&&(null==t?E.contains(e,l):t)&&++r>3)return!0}return!1}(c,e,s)&&(N(h,c)||N(h,c,!0))&&(yield c)&&(s.set(r,!0),s.set(i,!0),s.set(n,!0))}}}}}}}}find(e,t,n,r){let{matrix:i}=this,s=e+n,o=t+r,l=(e,t,n,r,i,s)=>{F(n,r),F(i,s),1===i[0]&&0===i[1]&&1===i[2]&&0===i[3]&&1===i[4]&&V(n,B)&&this.match(e,t,n,n[2])};for(let n=t;n<o;n++){let t=e;for(;t<s&&!i.get(t,n);)t++;let r=0,o=i.get(t,n),w=[0,0,0,0,0],a=[-1,-1,-1,-1,-1];for(;t<s;){let e=i.get(t,n);e===o?r++:(l(t,n,w,r,a,o),r=1,o=e),t++}l(t,n,w,r,a,o)}}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class K extends Y{constructor(e,t){super(e,P,t)}filter(e,t){let n=this.patterns.filter(e=>2.5>=f.noise(e)&&G(e.moduleSize,t,.5));n.length>1&&n.sort((n,r)=>{let i=f.noise(n),s=f.noise(r),o=Math.abs(n.moduleSize-t),l=Math.abs(r.moduleSize-t);return(a(n,e)+o)*i-(a(r,e)+l)*s});let r=n.slice(0,2);return r.push(e),r}find(e,t,n,r){let{matrix:i}=this,s=e+n,o=t+r,l=(e,t,n,r,i,s)=>{F(n,r),F(i,s),0===i[0]&&1===i[1]&&0===i[2]&&V(n,U)&&this.match(e,t,n,n[1])};for(let n=t;n<o;n++){let t=e;for(;t<s&&!i.get(t,n);)t++;let r=0,o=i.get(t,n),w=[0,0,0],a=[-1,-1,-1];for(;t<s;){let e=i.get(t,n);e===o?r++:(l(t,n,w,r,a,o),r=1,o=e),t++}l(t,n,w,r,a,o)}}}class Q{#J;constructor(e={}){this.#J=e}*detect(e){let{strict:t}=this.#J,{width:n,height:r}=e,i=new J(e,t);i.find(0,0,n,r);let s=i.groups(),o=s.next();for(;!o.done;){let n=!1,r=o.value,i=E.size(r);if(i>=25)for(let s of function(e,t,n){let r=E.size(t),i=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e){let{x:t,y:n}=e.topLeft,r=1-3/(E.size(e)-7),i=E.bottomRight(e),[s,o]=E.moduleSizes(e);return new f(P,t+(i.x-t)*r,n+(i.y-n)*r,5*s,5*o,0)}(t),s=new K(e,n),o=E.moduleSize(t),{x:l,y:w}=i,a=Math.ceil(o*Math.min(20,0|r/4)),u=0|Math.max(0,w-a),h=0|Math.max(0,l-a),c=0|Math.min(e.width-1,l+a),d=0|Math.min(e.height-1,w+a);return s.find(h,u,c-h,d-u),s.filter(i,o)}(e,r,t)){let t=O(r,s);if(R(e,t,i)&&R(e,t,i,!0)&&(n=yield new S(e,t,r,s)))break}else{let t=O(r);R(e,t,i)&&R(e,t,i,!0)&&(n=yield new S(e,t,r))}o=s.next(n)}}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class W{#K;#Q;#W;#C;#X;#ee;constructor(e,t,{mask:n,level:r},i,s){this.#K=n,this.#Q=r,this.#W=s,this.#C=t,this.#ee=e,this.#X=i}get mask(){return this.#K}get level(){return this.#Q.name}get version(){return this.#C.version}get mirror(){return this.#W}get content(){return this.#ee.content}get corrected(){return this.#X}get symbology(){return this.#ee.symbology}get fnc1(){return this.#ee.fnc1}get codewords(){return this.#ee.codewords}get structured(){return this.#ee.structured}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class X{#et;#en;#er;constructor(e){this.#et=e,this.#en=0,this.#er=0}get bitOffset(){return this.#en}get byteOffset(){return this.#er}read(e){let t=0,n=this.#en,r=this.#er,i=this.#et;if(n>0){let s=8-n,o=Math.min(e,s),l=s-o;e-=o,n+=o,t=(i[r]&255>>8-o<<l)>>l,8===n&&(r++,n=0)}if(e>0){for(;e>=8;)e-=8,t=t<<8|255&i[r++];if(e>0){let s=8-e;n+=e,t=t<<e|(i[r]&255>>s<<s)>>s}}return this.#en=n,this.#er=r,t}available(){return 8*(this.#et.length-this.#er)-this.#en}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let ee=new Map;class et{#r;#ei;static TERMINATOR=new et([0,0,0],0);static NUMERIC=new et([10,12,14],1);static ALPHANUMERIC=new et([9,11,13],2);static STRUCTURED_APPEND=new et([0,0,0],3);static BYTE=new et([8,16,16],4);static ECI=new et([0,0,0],7);static KANJI=new et([8,10,12],8);static FNC1_FIRST_POSITION=new et([0,0,0],5);static FNC1_SECOND_POSITION=new et([0,0,0],9);static HANZI=new et([8,10,12],13);constructor(e,t){this.#r=t,this.#ei=new Int32Array(e),ee.set(t,this)}get bits(){return this.#r}getCharacterCountBits(e){let t,{version:n}=e;return t=n<=9?0:n<=26?1:2,this.#ei[t]}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let en=new Map;class er{#es;#eo;static CP437=new er("cp437",2,0);static ISO_8859_1=new er("iso-8859-1",3,1);static ISO_8859_2=new er("iso-8859-2",4);static ISO_8859_3=new er("iso-8859-3",5);static ISO_8859_4=new er("iso-8859-4",6);static ISO_8859_5=new er("iso-8859-5",7);static ISO_8859_6=new er("iso-8859-6",8);static ISO_8859_7=new er("iso-8859-7",9);static ISO_8859_8=new er("iso-8859-8",10);static ISO_8859_9=new er("iso-8859-9",11);static ISO_8859_10=new er("iso-8859-10",12);static ISO_8859_11=new er("iso-8859-11",13);static ISO_8859_13=new er("iso-8859-13",15);static ISO_8859_14=new er("iso-8859-14",16);static ISO_8859_15=new er("iso-8859-15",17);static ISO_8859_16=new er("iso-8859-16",18);static SHIFT_JIS=new er("shift-jis",20);static CP1250=new er("cp1250",21);static CP1251=new er("cp1251",22);static CP1252=new er("cp1252",23);static CP1256=new er("cp1256",24);static UTF_16BE=new er("utf-16be",25);static UTF_8=new er("utf-8",26);static ASCII=new er("ascii",27);static BIG5=new er("big5",28);static GB2312=new er("gb2312",29);static EUC_KR=new er("euc-kr",30);static GB18030=new er("gb18030",32);static UTF_16LE=new er("utf-16le",33);static UTF_32BE=new er("utf-32be",34);static UTF_32LE=new er("utf-32le",35);static ISO_646_INV=new er("iso-646-inv",170);static BINARY=new er("binary",899);constructor(e,...t){for(let n of(this.#es=e,this.#eo=Object.freeze(t),t))en.set(n,this)}get label(){return this.#es}get values(){return this.#eo}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function ei(e){let t=0,n=new Map;for(let r of e)n.set(r,t++);return n}function es(e){for(var t=arguments.length,n=Array(t>1?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];let i=[],s=[],o=new Map,l=new TextDecoder(e,{fatal:!0});for(let[e,t]of n)for(let n=e;n<=t;n++)i.push(n>>8,255&n),s.push(n);let{length:w}=s,a=l.decode(new Uint8Array(i));for(let e=0;e<w;e++){let t=a.charAt(e);o.has(t)||o.set(t,s[e])}return o}function eo(e,t,n){let r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:256,i=n.length-1,s=[];for(let o=e;o<t;){for(let e=0;e<i;e+=2)s.push([o+n[e],o+n[e+1]]);o+=r}return s}es("gb2312",[41377,41470],[41649,41698],[41701,41710],[41713,41724],[41889,41982],[42145,42227],[42401,42486],[42657,42680],[42689,42712],[42913,42945],[42961,42993],[43169,43194],[43205,43241],[43428,43503],...eo(45217,55038,[0,93]),[55201,55289],...eo(55457,63486,[0,93])),es("shift-jis",[33088,33150],[33152,33196],[33208,33215],[33224,33230],[33242,33256],[33264,33271],[33276,33276],[33359,33368],[33376,33401],[33409,33434],[33439,33521],[33600,33662],[33664,33686],[33695,33718],[33727,33750],[33856,33888],[33904,33918],[33920,33937],[33951,33982],[34975,35068],...eo(35136,38908,[0,62,64,188]),[38976,39026],[39071,39164],...eo(39232,40956,[0,62,64,188]),...eo(57408,59900,[0,62,64,188]),[59968,60030],[60032,60068]);let el="0123456789";ei(el);let ew=`${el}ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:`;function ea(e){return e.replace(/%+/g,e=>{let t=1&e.length;return e=e.replace(/%%/g,"%"),t?e.replace(/%$/,"\x1d"):e})}ei(ew);/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let eu=new Map;class eh{#el;#r;#Q;static L=new eh("L",0,1);static M=new eh("M",1,0);static Q=new eh("Q",2,3);static H=new eh("H",3,2);constructor(e,t,n){this.#r=n,this.#el=e,this.#Q=t,eu.set(n,this)}get bits(){return this.#r}get name(){return this.#el}get level(){return this.#Q}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let ef=[[21522,0],[20773,1],[24188,2],[23371,3],[17913,4],[16590,5],[20375,6],[19104,7],[30660,8],[29427,9],[32170,10],[30877,11],[26159,12],[25368,13],[27713,14],[26998,15],[5769,16],[5054,17],[7399,18],[6608,19],[1890,20],[597,21],[3340,22],[2107,23],[13663,24],[12392,25],[16177,26],[14854,27],[9396,28],[8579,29],[11994,30],[11245,31]];class ec{#K;#Q;constructor(e){this.#K=7&e,this.#Q=function(e){let t=eu.get(e);if(null!=t)return t;throw Error("illegal error correction bits")}(e>>3&3)}get mask(){return this.#K}get level(){return this.#Q}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function ed(e,t,n,r){return e.get(t,n)?r<<1|1:r<<1}class eg{#z;#c;constructor(e){let{width:t,height:n}=e;this.#c=e.clone(),this.#z=Math.min(t,n)}readVersion(){let e=this.#z,t=0|(e-17)/4;if(t<1)throw Error("illegal version");if(t<=6)return y[t-1];let r=0,i=0,s=e-11,o=this.#c;for(let t=5;t>=0;t--)for(let n=e-9;n>=s;n--)r=ed(o,n,t,r);for(let t=5;t>=0;t--)for(let n=e-9;n>=s;n--)i=ed(o,t,n,i);let l=function(e,t){let r=32,i=0,{length:s}=m;for(let o=0;o<s;o++){let s=m[o];if(e===s||t===s)return y[o+6];let l=n(e^s);l<r&&(r=l,i=o+7),e!==t&&(l=n(t^s))<r&&(r=l,i=o+7)}if(r<=3&&i>=7)return y[i-1];throw Error("unable to decode version")}(r,i);if(l.size>e)throw Error("matrix size too small for version");return l}readFormatInfo(){let e=0,t=0,r=this.#c,i=this.#z,s=i-7;for(let t=0;t<=8;t++)6!==t&&(e=ed(r,t,8,e));for(let t=7;t>=0;t--)6!==t&&(e=ed(r,8,t,e));for(let e=i-1;e>=s;e--)t=ed(r,8,e,t);for(let e=i-8;e<i;e++)t=ed(r,e,8,t);return function(e,t){let r=32,i=0;for(let[s,o]of ef){if(e===s||t===s)return new ec(o);let l=n(e^s);l<r&&(r=l,i=o),e!==t&&(l=n(t^s))<r&&(r=l,i=o)}if(r<=3)return new ec(i);throw Error("unable to decode format information")}(e,t)}readCodewords(e,t){let n=0,r=0,s=0,o=!0,l=this.#z,w=this.#c,a=e.getECBlocks(t),u=function(e){let{size:t,version:n,alignmentPatterns:r}=e,{length:s}=r,o=new i(t,t),l=s-1;o.setRegion(0,0,9,9),o.setRegion(t-8,0,8,9),o.setRegion(0,t-8,9,8);for(let e=0;e<s;e++){let t=r[e]-2;for(let n=0;n<s;n++)(0!==e||0!==n&&n!==l)&&(e!==l||0!==n)&&o.setRegion(r[n]-2,t,5,5)}return o.setRegion(6,9,1,t-17),o.setRegion(9,6,t-17,1),n>6&&(o.setRegion(t-11,0,3,6),o.setRegion(0,t-11,6,3)),o}(e),h=new Uint8Array(a.numTotalCodewords);for(let e=l-1;e>0;e-=2){6===e&&e--;for(let t=0;t<l;t++){let i=o?l-1-t:t;for(let t=0;t<2;t++){let o=e-t;u.get(o,i)||(n++,s<<=1,w.get(o,i)&&(s|=1),8!==n||(h[r++]=s,n=0,s=0))}}o=!o}if(r!==a.numTotalCodewords)throw Error("illegal codewords length");return h}unmask(e){let t=this.#z,n=this.#c;for(let r=0;r<t;r++)for(let i=0;i<t;i++)(function(e,t,n){let r,i;switch(e){case 0:i=n+t&1;break;case 1:i=1&n;break;case 2:i=t%3;break;case 3:i=(n+t)%3;break;case 4:i=(0|n/2)+(0|t/3)&1;break;case 5:i=(1&(r=n*t))+r%3;break;case 6:i=(1&(r=n*t))+r%3&1;break;case 7:i=n*t%3+(n+t&1)&1;break;default:throw Error(`illegal mask: ${e}`)}return 0===i})(e,i,r)&&n.flip(i,r)}remask(e){this.unmask(e)}mirror(){let e=this.#z,t=this.#c;for(let n=0;n<e;n++)for(let r=n+1;r<e;r++)t.get(n,r)!==t.get(r,n)&&(t.flip(n,r),t.flip(r,n))}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class em{#ew;#m;constructor(e,t){this.#ew=e,this.#m=t}get codewords(){return this.#ew}get numDataCodewords(){return this.#m}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class eb{#ea;#eu;constructor(e,t){let{length:n}=t;if(n<=0)throw Error("polynomial coefficients cannot empty");if(this.#ea=e,n>1&&0===t[0]){let e=1;for(;e<n&&0===t[e];)e++;if(e===n)this.#eu=new Int32Array([0]);else{let r=new Int32Array(n-e);r.set(t.subarray(e)),this.#eu=r}}else this.#eu=t}get coefficients(){return this.#eu}isZero(){return 0===this.#eu[0]}getDegree(){return this.#eu.length-1}getCoefficient(e){let t=this.#eu;return t[t.length-1-e]}evaluate(e){let t;if(0===e)return this.getCoefficient(0);let n=this.#eu;if(1===e){for(let e of(t=0,n))t^=e;return t}[t]=n;let r=this.#ea,{length:i}=n;for(let s=1;s<i;s++)t=r.multiply(e,t)^n[s];return t}multiply(e){let t=this.#ea,n=this.#eu,{length:r}=n;if(e instanceof eb){if(this.isZero()||e.isZero())return t.zero;let i=e.#eu,s=i.length,o=new Int32Array(r+s-1);for(let e=0;e<r;e++){let r=n[e];for(let n=0;n<s;n++)o[e+n]^=t.multiply(r,i[n])}return new eb(t,o)}if(0===e)return t.zero;if(1===e)return this;let i=new Int32Array(r);for(let s=0;s<r;s++)i[s]=t.multiply(n[s],e);return new eb(t,i)}multiplyByMonomial(e,t){let n=this.#ea;if(0===t)return n.zero;let r=this.#eu,{length:i}=r,s=new Int32Array(i+e);for(let e=0;e<i;e++)s[e]=n.multiply(r[e],t);return new eb(n,s)}addOrSubtract(e){if(this.isZero())return e;if(e.isZero())return this;let t=e.#eu,n=t.length,r=this.#eu,i=r.length;n<i&&([n,i]=[i,n],[t,r]=[r,t]);let s=n-i,o=new Int32Array(n);o.set(t.subarray(0,s));for(let e=s;e<n;e++)o[e]=r[e-s]^t[e];return new eb(this.#ea,o)}divide(e){let t=this.#ea,n=t.zero,r=this,i=e.getCoefficient(e.getDegree()),s=t.invert(i);for(;r.getDegree()>=e.getDegree()&&!r.isZero();){let i=r.getDegree(),o=i-e.getDegree(),l=t.multiply(r.getCoefficient(i),s),w=e.multiplyByMonomial(o,l),a=t.buildPolynomial(o,l);n=n.addOrSubtract(a),r=r.addOrSubtract(w)}return[n,r]}}let ey=new /**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class{#z;#eh;#ef;#ec;#ed;#eg;constructor(e,t,n){let r=1,i=new Int32Array(t);for(let n=0;n<t;n++)i[n]=r,(r*=2)>=t&&(r^=e,r&=t-1);let s=new Int32Array(t);for(let e=0,n=t-1;e<n;e++)s[i[e]]=e;this.#z=t,this.#ed=i,this.#eg=s,this.#ec=n,this.#eh=new eb(this,new Int32Array([1])),this.#ef=new eb(this,new Int32Array([0]))}get size(){return this.#z}get one(){return this.#eh}get zero(){return this.#ef}get generator(){return this.#ec}exp(e){return this.#ed[e]}log(e){return this.#eg[e]}invert(e){return this.#ed[this.#z-this.#eg[e]-1]}multiply(e,t){if(0===e||0===t)return 0;let n=this.#eg;return this.#ed[(n[e]+n[t])%(this.#z-1)]}buildPolynomial(e,t){if(0===t)return this.#ef;let n=new Int32Array(e+1);return n[0]=t,new eb(this,n)}}(285,256,0);class ep{#ea;constructor(e=ey){this.#ea=e}decode(e,t){let n=!0,r=this.#ea,{generator:i}=r,s=new eb(r,e),o=new Int32Array(t);for(let e=0;e<t;e++){let l=s.evaluate(r.exp(e+i));o[t-1-e]=l,0!==l&&(n=!1)}if(!n){let n=new eb(r,o),[i,s]=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t,n,r){t.getDegree()<n.getDegree()&&([t,n]=[n,t]);let i=n,s=e.one,o=t,l=e.zero;for(;2*i.getDegree()>=r;){let t=l,n=o;if(l=s,(o=i).isZero())throw Error("remainder last was zero");i=n;let r=e.zero,w=i.getDegree(),a=o.getDegree(),u=o.getCoefficient(a),h=e.invert(u);for(;w>=a&&!i.isZero();){let t=i.getDegree()-a,n=e.multiply(i.getCoefficient(w),h);r=r.addOrSubtract(e.buildPolynomial(t,n)),w=(i=i.addOrSubtract(o.multiplyByMonomial(t,n))).getDegree()}if(s=r.multiply(l).addOrSubtract(t),w>=a)throw Error("division algorithm failed to reduce polynomial")}let w=s.getCoefficient(0);if(0===w)throw Error("sigma tilde(0) was zero");let a=e.invert(w);return[s.multiply(a),i.multiply(a)]}(r,r.buildPolynomial(t,1),n,t),l=function(e,t){let n=t.getDegree();if(1===n)return new Int32Array([t.getCoefficient(1)]);let r=0,{size:i}=e,s=new Int32Array(n);for(let o=1;o<i&&r<n;o++)0===t.evaluate(o)&&(s[r++]=e.invert(o));if(r!==n)throw Error("error locator degree does not match number of roots");return s}(r,i),w=function(e,t,n){let{length:r}=n,i=new Int32Array(r);for(let s=0;s<r;s++){let o=1,l=e.invert(n[s]);for(let t=0;t<r;t++)if(s!==t){let r=e.multiply(n[t],l),i=(1&r)==0?1|r:-2&r;o=e.multiply(o,i)}i[s]=e.multiply(t.evaluate(l),e.invert(o)),0!==e.generator&&(i[s]=e.multiply(i[s],l))}return i}(r,s,l),a=l.length,u=e.length;for(let t=0;t<a;t++){let n=u-1-r.log(l[t]);if(n<0)throw Error("bad error location");e[n]=e[n]^w[t]}return a}return 0}}function ex(e,t){switch(t){case er.BINARY:case er.UTF_32BE:case er.UTF_32LE:throw Error(`built-in decode not support charset: ${t.label}`);default:return new TextDecoder(t.label).decode(e)}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function eI(e,t,n){let{mask:r,level:i}=n,s=0,o=0;e.unmask(r);let l=t.getECBlocks(i),w=function(e,t,n){let{ecBlocks:r,numTotalCodewords:i,numECCodewordsPerBlock:s}=t.getECBlocks(n);if(e.length!==i)throw Error("failed to get data blocks");let o=[];for(let{count:e,numDataCodewords:t}of r)for(let n=0;n<e;n++){let e=s+t;o.push(new em(new Uint8Array(e),t))}let{length:l}=o,w=l-1,a=o[0].codewords.length;for(;w>=0&&o[w].codewords.length!==a;)w--;w++;let u=0,h=a-s;for(let t=0;t<h;t++)for(let n=0;n<l;n++)o[n].codewords[t]=e[u++];for(let t=w;t<l;t++)o[t].codewords[h]=e[u++];let f=o[0].codewords.length;for(let t=h;t<f;t++)for(let n=0;n<l;n++){let r=n<w?t:t+1;o[n].codewords[r]=e[u++]}return o}(e.readCodewords(t,i),t,i),a=new Uint8Array(l.numTotalDataCodewords);for(let{codewords:e,numDataCodewords:t}of w){let[n,r]=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t){let n=new Int32Array(e),r=e.length-t,i=new ep().decode(n,r);return[n,i]}(e,t);a.set(n.subarray(0,t),s),o+=r,s+=t}return[a,o]}class ez{#em;constructor({decode:e=ex}={}){this.#em=e}decode(e){let t,n,r,i=0,s=!1,o=new eg(e);try{t=o.readVersion(),r=o.readFormatInfo(),[n,i]=eI(o,t,r)}catch{null!=r&&o.remask(r.mask),o.mirror(),s=!0,t=o.readVersion(),r=o.readFormatInfo(),[n,i]=eI(o,t,r)}return new W(function(e,t,n){let r,i,s,o="",l=-1,w=!1,a=!1,u=!1,h=!1,f=new X(e);do switch(i=4>f.available()?et.TERMINATOR:function(e){let t=ee.get(e);if(null!=t)return t;throw Error("illegal mode bits")}(f.read(4))){case et.TERMINATOR:break;case et.FNC1_FIRST_POSITION:w=!0;break;case et.FNC1_SECOND_POSITION:a=!0,l=f.read(8);break;case et.STRUCTURED_APPEND:if(16>f.available())throw Error("illegal structured append");h=Object.freeze({index:f.read(4),count:f.read(4)+1,parity:f.read(8)});break;case et.ECI:s=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e){let t=e.read(8);if((128&t)==0)return 127&t;if((192&t)==128)return(63&t)<<8|e.read(8);if((224&t)==192)return(31&t)<<16|e.read(16);throw Error("illegal extended channel interpretation value")}(f);break;default:if(i===et.HANZI&&1!==f.read(4))throw Error("illegal hanzi subset");let c=f.read(i.getCharacterCountBits(t));switch(i){case et.ALPHANUMERIC:o+=function(e,t,n){let r="";for(;t>1;){if(11>e.available())throw Error("illegal bits length");let n=e.read(11);r+=ew.charAt(n/45)+ew.charAt(n%45),t-=2}if(1===t){if(6>e.available())throw Error("illegal bits length");r+=ew.charAt(e.read(6))}return n?ea(r):r}(f,c,w||a);break;case et.BYTE:o+=function(e,t,n,r,i){if(e.available()<8*t)throw Error("illegal bits length");let s=new Uint8Array(t),o=null!=i?function(e){let t=en.get(e);if(t)return t;throw Error("illegal charset value")}(i):er.ISO_8859_1;for(let n=0;n<t;n++)s[n]=e.read(8);let l=n(s,o);return r?ea(l):l}(f,c,n,w||a,s);break;case et.HANZI:o+=function(e,t){if(e.available()<13*t)throw Error("illegal bits length");let n=0,r=new Uint8Array(2*t);for(;t>0;){let i=e.read(13),s=i/96<<8|i%96;s<2560?s+=41377:s+=42657,r[n]=s>>8&255,r[n+1]=255&s,t--,n+=2}return new TextDecoder("gb2312").decode(r)}(f,c);break;case et.KANJI:o+=function(e,t){if(e.available()<13*t)throw Error("illegal bits length");let n=0,r=new Uint8Array(2*t);for(;t>0;){let i=e.read(13),s=i/192<<8|i%192;s<7936?s+=33088:s+=49472,r[n]=s>>8&255,r[n+1]=255&s,t--,n+=2}return new TextDecoder("shift-jis").decode(r)}(f,c);break;case et.NUMERIC:o+=function(e,t){let n="";for(;t>=3;){if(10>e.available())throw Error("illegal bits length");let r=e.read(10);if(r>=1e3)throw Error("illegal numeric codeword");n+=el.charAt(r/100)+el.charAt(r/10%10)+el.charAt(r%10),t-=3}if(2===t){if(7>e.available())throw Error("illegal bits length");let t=e.read(7);if(t>=100)throw Error("illegal numeric codeword");n+=el.charAt(t/10)+el.charAt(t%10)}else if(1===t){if(4>e.available())throw Error("illegal bits length");let t=e.read(4);if(t>=10)throw Error("illegal numeric codeword");n+=el.charAt(t)}return n}(f,c);break;default:throw Error("illegal mode")}}while(i!==et.TERMINATOR);return w?u=Object.freeze(["GS1"]):a&&(u=Object.freeze(["AIM",l])),r=null!=s?w?4:a?6:2:w?3:a?5:1,{content:o,codewords:e,structured:h,symbology:`]Q${r}`,fnc1:u}}(n,t,this.#em),t,r,i,s)}}function eC(e){return{x:e.x,y:e.y}}function eE(e){return{x:e.x,y:e.y,moduleSize:e.moduleSize}}self.addEventListener("message",async e=>{let{data:t}=e,{uid:n,image:r}=t,{width:w,height:a}=r,u=new OffscreenCanvas(w,a).getContext("2d");u.drawImage(r,0,0);let h=function(e,t,n){if(e.length!==t*n)throw Error("luminances length must be equals to width * height");return t<40||n<40?function(e,t,n){let r=new i(t,n),s=new Int32Array(32);for(let r=1;r<5;r++){let i=0|4*t/5,o=(0|n*r/5)*t;for(let n=0|t/5;n<i;n++){let t=e[o+n];s[t>>3]++}}let o=function(e){let t=0,n=0,r=0,{length:i}=e;for(let s=0;s<i;s++)e[s]>n&&(t=s,n=e[s]),e[s]>r&&(r=e[s]);let s=0,o=0;for(let n=0;n<i;n++){let r=n-t,i=e[n]*r*r;i>o&&(s=n,o=i)}if(t>s&&([t,s]=[s,t]),s-t<=2)return -1;let l=-1,w=s-1;for(let n=s-1;n>t;n--){let i=n-t,o=i*i*(s-n)*(r-e[n]);o>l&&(w=n,l=o)}return w<<3}(s);if(o>0)for(let i=0;i<n;i++){let n=i*t;for(let s=0;s<t;s++)e[n+s]<o&&r.set(s,i)}return r}(e,t,n):function(e,t,n){let r=t-8,w=n-8,a=s(t),u=s(n),h=new i(t,n),f=function(e,t,n){let r=[],i=t-8,o=n-8,w=s(t),a=s(n);for(let n=0;n<a;n++){r[n]=new Int32Array(w);let s=l(n,o);for(let o=0;o<w;o++){let w=0,a=0,u=255,h=l(o,i);for(let n=0,r=s*t+h;n<8;n++,r+=t){for(let t=0;t<8;t++){let n=e[r+t];w+=n,n<u&&(u=n),n>a&&(a=n)}if(a-u>24)for(n++,r+=t;n<8;n++,r+=t)for(let t=0;t<8;t++)w+=e[r+t]}let f=w>>6;if(a-u<=24&&(f=u/2,n>0&&o>0)){let e=(r[n-1][o]+2*r[n][o-1]+r[n-1][o-1])/4;u<e&&(f=e)}r[n][o]=f}}return r}(e,t,n);for(let n=0;n<u;n++){let i=o(n,u-3),s=l(n,w);for(let n=0;n<a;n++){let w=0,u=o(n,a-3),c=l(n,r);for(let e=-2;e<=2;e++){let t=f[i+e];w+=t[u-2]+t[u-1]+t[u]+t[u+1]+t[u+2]}let d=w/25;for(let n=0,r=s*t+c;n<8;n++,r+=t)for(let t=0;t<8;t++)e[r+t]<=d&&h.set(c+t,s+n)}}return h}(e,t,n)}(function(e){let{data:t,width:n,height:r}=e,i=new Uint8Array(n*r);for(let e=0;e<r;e++){let r=e*n;for(let e=0;e<n;e++){let n=4*(r+e),s=t[n],o=t[n+1],l=t[n+2];i[r+e]=306*s+601*o+117*l+512>>10}}return i}(u.getImageData(0,0,w,a)),w,a);t.invert&&h.flip();let f=new Q({strict:t.strict}).detect(h),c=[],d=new ez,g=f.next();for(;!g.done;){let e=!1,t=g.value;try{let{size:n,finder:r,alignment:i}=t,s=d.decode(t.matrix),{topLeft:o,topRight:l,bottomLeft:w}=r,a=t.mapping(0,0),u=t.mapping(n,0),h=t.mapping(n,n),f=t.mapping(0,n),g=t.mapping(6.5,6.5),m=t.mapping(n-6.5,6.5),b=t.mapping(6.5,n-6.5);c.push({fnc1:s.fnc1,mask:s.mask,level:s.level,mirror:s.mirror,content:s.content,version:s.version,corrected:s.corrected,symbology:s.symbology,structured:s.structured,alignment:i?eE(i):null,finder:[eE(o),eE(l),eE(w)],timing:[eC(g),eC(m),eC(b)],corners:[eC(a),eC(u),eC(h),eC(f)]}),e=!0}catch{}g=f.next(e)}c.length>0?self.postMessage({type:"ok",payload:{uid:n,image:r,items:c}},[r]):self.postMessage({type:"error",message:"未发现二维码"})})}();