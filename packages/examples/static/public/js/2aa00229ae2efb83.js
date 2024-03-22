!function(){"use strict";var e,t,n,r,i,s={6577:function(e,t,n){/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let r=new Map;class i{#e;#t;static CP437=new i("cp437",2,0);static ISO_8859_1=new i("iso-8859-1",3,1);static ISO_8859_2=new i("iso-8859-2",4);static ISO_8859_3=new i("iso-8859-3",5);static ISO_8859_4=new i("iso-8859-4",6);static ISO_8859_5=new i("iso-8859-5",7);static ISO_8859_6=new i("iso-8859-6",8);static ISO_8859_7=new i("iso-8859-7",9);static ISO_8859_8=new i("iso-8859-8",10);static ISO_8859_9=new i("iso-8859-9",11);static ISO_8859_10=new i("iso-8859-10",12);static ISO_8859_11=new i("iso-8859-11",13);static ISO_8859_13=new i("iso-8859-13",15);static ISO_8859_14=new i("iso-8859-14",16);static ISO_8859_15=new i("iso-8859-15",17);static ISO_8859_16=new i("iso-8859-16",18);static SHIFT_JIS=new i("shift-jis",20);static CP1250=new i("cp1250",21);static CP1251=new i("cp1251",22);static CP1252=new i("cp1252",23);static CP1256=new i("cp1256",24);static UTF_16BE=new i("utf-16be",25);static UTF_8=new i("utf-8",26);static ASCII=new i("ascii",27);static BIG5=new i("big5",28);static GB2312=new i("gb2312",29);static EUC_KR=new i("euc-kr",30);static GBK=new i("gbk",31);static GB18030=new i("gb18030",32);static UTF_16LE=new i("utf-16le",33);static UTF_32BE=new i("utf-32be",34);static UTF_32LE=new i("utf-32le",35);static ISO_646_INV=new i("iso-646-inv",170);static BINARY=new i("binary",899);constructor(e,...t){for(let n of(this.#e=e,this.#t=Object.freeze(t),t))if(n>=0&&n<=999999&&Number.isInteger(n))r.set(n,this);else throw Error("illegal extended channel interpretation value")}get label(){return this.#e}get values(){return this.#t}}function s(e){return 0|e+(e<0?-.5:.5)}function o(e,t){let n=e.at(t);return null!=n?n:""}function l(e){return e-=e>>1&1431655765,((e=(858993459&e)+(e>>2&858993459))+(e>>4)&252645135)*16843009>>24}function w(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:e.length,r=0;for(let i=t;i<n;i++)r+=e[i];return r}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class a{#n;#r;#i;#s;constructor(e,t,n){let r=Math.ceil(e/32),i=r*t;if(this.#n=e,this.#r=t,this.#i=r,n instanceof Int32Array){if(n.length!==i)throw Error(`matrix bits capacity mismatch: ${i}`);this.#s=n}else this.#s=new Int32Array(i)}#o(e,t){return t*this.#i+(0|e/32)}get width(){return this.#n}get height(){return this.#r}set(e,t){let n=this.#o(e,t);this.#s[n]|=1<<(31&e)}get(e,t){let n=this.#o(e,t);return this.#s[n]>>>(31&e)&1}flip(e,t){if(null!=e&&null!=t){let n=this.#o(e,t);this.#s[n]^=1<<(31&e)}else{let e=this.#s,{length:t}=e;for(let n=0;n<t;n++)e[n]=~e[n]}}clone(){return new a(this.#n,this.#r,new Int32Array(this.#s))}setRegion(e,t,n,r){let i=this.#s,s=e+n,o=t+r,l=this.#i;for(let n=t;n<o;n++){let t=n*l;for(let n=e;n<s;n++)i[t+(0|n/32)]|=1<<(31&n)}}}function u(e){let t=e>>3;return 7&e&&t++,t}function f(e,t){return e<2?2:Math.min(e,t)}function c(e,t){return(e<<=3)>t?t:e}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class h{#l;#w;constructor(e,t){this.#l=e,this.#w=t}get x(){return this.#l}get y(){return this.#w}}function d(e,t){return Math.sqrt(g(e,t))}function g(e,t){let n=e.x-t.x,r=e.y-t.y;return n*n+r*r}function m(e,t,n){let{x:r,y:i}=e,{x:s,y:o}=t,{x:l,y:w}=n;return Math.abs(r*(o-w)+s*(w-i)+l*(i-o))/2}class b extends h{#a;#n;#r;#u;#f;#c=1;#h;#d;static noise(e){return e.#a}static width(e){return e.#n}static height(e){return e.#r}static combined(e){return e.#c}static rect(e){return e.#u}static equals(e,t,n,r,i){let{modules:s}=e.#h,o=e.#d;if(Math.abs(t-e.x)<=o&&Math.abs(n-e.y)<=o){let t=e.#f,n=Math.abs((r+i)/s/2-t);if(n<=1||n<=t)return!0}return!1}static combine(e,t,n,r,i,s){let o=e.#c,l=o+1,w=(e.x*o+t)/l,a=(e.y*o+n)/l,u=(e.#a*o+s)/l,f=(e.#n*o+r)/l,c=(e.#r*o+i)/l,h=new b(e.#h,w,a,f,c,u);return h.#c=l,h}constructor(e,t,n,r,i,s){super(t,n);let{modules:o}=e,l=r/2,w=i/2,a=r/o,u=i/o,f=a/2,c=u/2,h=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e){let{ratios:t}=e;return t[0|t.length/2]/2}(e),d=(a+u)/2;this.#a=s,this.#n=r,this.#r=i,this.#h=e,this.#f=d,this.#u=[t-l+f,n-w+c,t+l-f,n+w-c],this.#d=d*h}get moduleSize(){return this.#f}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class p{#g;#m;constructor(e,t){this.#g=e,this.#m=t}sample(e,t){let n=this.#g,r=n.width,i=this.#m,s=n.height,o=new a(e,t);for(let l=0;l<t;l++)for(let t=0;t<e;t++){let[e,w]=i.mapping(t+.5,l+.5),a=0|e,u=0|w;a>=0&&u>=0&&a<r&&u<s&&n.get(a,u)&&o.set(t,l)}return o}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class y{#b;#p;constructor(e,t){this.#b=e,this.#p=t}get count(){return this.#b}get numDataCodewords(){return this.#p}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class x{#y;#x;#v;#I;#z;constructor(e,...t){let n=0,r=0;for(let{count:e,numDataCodewords:i}of t)n+=e,r+=i*e;let i=e*n;this.#y=t,this.#v=i,this.#I=r,this.#z=e,this.#x=r+i}get ecBlocks(){return this.#y}get numTotalCodewords(){return this.#x}get numTotalECCodewords(){return this.#v}get numTotalDataCodewords(){return this.#I}get numECCodewordsPerBlock(){return this.#z}}let v=[31892,34236,39577,42195,48118,51042,55367,58893,63784,68472,70749,76311,79154,84390,87683,92361,96236,102084,102881,110507,110734,117786,119615,126325,127568,133589,136944,141498,145311,150283,152622,158308,161089,167017];class I{#C;#S;#y;#E;constructor(e,t,...n){this.#S=e,this.#y=n,this.#C=17+4*e,this.#E=t}get size(){return this.#C}get version(){return this.#S}get alignmentPatterns(){return this.#E}getECBlocks(e){let{level:t}=e;return this.#y[t]}}let z=[new I(1,[],new x(7,new y(1,19)),new x(10,new y(1,16)),new x(13,new y(1,13)),new x(17,new y(1,9))),new I(2,[6,18],new x(10,new y(1,34)),new x(16,new y(1,28)),new x(22,new y(1,22)),new x(28,new y(1,16))),new I(3,[6,22],new x(15,new y(1,55)),new x(26,new y(1,44)),new x(18,new y(2,17)),new x(22,new y(2,13))),new I(4,[6,26],new x(20,new y(1,80)),new x(18,new y(2,32)),new x(26,new y(2,24)),new x(16,new y(4,9))),new I(5,[6,30],new x(26,new y(1,108)),new x(24,new y(2,43)),new x(18,new y(2,15),new y(2,16)),new x(22,new y(2,11),new y(2,12))),new I(6,[6,34],new x(18,new y(2,68)),new x(16,new y(4,27)),new x(24,new y(4,19)),new x(28,new y(4,15))),new I(7,[6,22,38],new x(20,new y(2,78)),new x(18,new y(4,31)),new x(18,new y(2,14),new y(4,15)),new x(26,new y(4,13),new y(1,14))),new I(8,[6,24,42],new x(24,new y(2,97)),new x(22,new y(2,38),new y(2,39)),new x(22,new y(4,18),new y(2,19)),new x(26,new y(4,14),new y(2,15))),new I(9,[6,26,46],new x(30,new y(2,116)),new x(22,new y(3,36),new y(2,37)),new x(20,new y(4,16),new y(4,17)),new x(24,new y(4,12),new y(4,13))),new I(10,[6,28,50],new x(18,new y(2,68),new y(2,69)),new x(26,new y(4,43),new y(1,44)),new x(24,new y(6,19),new y(2,20)),new x(28,new y(6,15),new y(2,16))),new I(11,[6,30,54],new x(20,new y(4,81)),new x(30,new y(1,50),new y(4,51)),new x(28,new y(4,22),new y(4,23)),new x(24,new y(3,12),new y(8,13))),new I(12,[6,32,58],new x(24,new y(2,92),new y(2,93)),new x(22,new y(6,36),new y(2,37)),new x(26,new y(4,20),new y(6,21)),new x(28,new y(7,14),new y(4,15))),new I(13,[6,34,62],new x(26,new y(4,107)),new x(22,new y(8,37),new y(1,38)),new x(24,new y(8,20),new y(4,21)),new x(22,new y(12,11),new y(4,12))),new I(14,[6,26,46,66],new x(30,new y(3,115),new y(1,116)),new x(24,new y(4,40),new y(5,41)),new x(20,new y(11,16),new y(5,17)),new x(24,new y(11,12),new y(5,13))),new I(15,[6,26,48,70],new x(22,new y(5,87),new y(1,88)),new x(24,new y(5,41),new y(5,42)),new x(30,new y(5,24),new y(7,25)),new x(24,new y(11,12),new y(7,13))),new I(16,[6,26,50,74],new x(24,new y(5,98),new y(1,99)),new x(28,new y(7,45),new y(3,46)),new x(24,new y(15,19),new y(2,20)),new x(30,new y(3,15),new y(13,16))),new I(17,[6,30,54,78],new x(28,new y(1,107),new y(5,108)),new x(28,new y(10,46),new y(1,47)),new x(28,new y(1,22),new y(15,23)),new x(28,new y(2,14),new y(17,15))),new I(18,[6,30,56,82],new x(30,new y(5,120),new y(1,121)),new x(26,new y(9,43),new y(4,44)),new x(28,new y(17,22),new y(1,23)),new x(28,new y(2,14),new y(19,15))),new I(19,[6,30,58,86],new x(28,new y(3,113),new y(4,114)),new x(26,new y(3,44),new y(11,45)),new x(26,new y(17,21),new y(4,22)),new x(26,new y(9,13),new y(16,14))),new I(20,[6,34,62,90],new x(28,new y(3,107),new y(5,108)),new x(26,new y(3,41),new y(13,42)),new x(30,new y(15,24),new y(5,25)),new x(28,new y(15,15),new y(10,16))),new I(21,[6,28,50,72,94],new x(28,new y(4,116),new y(4,117)),new x(26,new y(17,42)),new x(28,new y(17,22),new y(6,23)),new x(30,new y(19,16),new y(6,17))),new I(22,[6,26,50,74,98],new x(28,new y(2,111),new y(7,112)),new x(28,new y(17,46)),new x(30,new y(7,24),new y(16,25)),new x(24,new y(34,13))),new I(23,[6,30,54,78,102],new x(30,new y(4,121),new y(5,122)),new x(28,new y(4,47),new y(14,48)),new x(30,new y(11,24),new y(14,25)),new x(30,new y(16,15),new y(14,16))),new I(24,[6,28,54,80,106],new x(30,new y(6,117),new y(4,118)),new x(28,new y(6,45),new y(14,46)),new x(30,new y(11,24),new y(16,25)),new x(30,new y(30,16),new y(2,17))),new I(25,[6,32,58,84,110],new x(26,new y(8,106),new y(4,107)),new x(28,new y(8,47),new y(13,48)),new x(30,new y(7,24),new y(22,25)),new x(30,new y(22,15),new y(13,16))),new I(26,[6,30,58,86,114],new x(28,new y(10,114),new y(2,115)),new x(28,new y(19,46),new y(4,47)),new x(28,new y(28,22),new y(6,23)),new x(30,new y(33,16),new y(4,17))),new I(27,[6,34,62,90,118],new x(30,new y(8,122),new y(4,123)),new x(28,new y(22,45),new y(3,46)),new x(30,new y(8,23),new y(26,24)),new x(30,new y(12,15),new y(28,16))),new I(28,[6,26,50,74,98,122],new x(30,new y(3,117),new y(10,118)),new x(28,new y(3,45),new y(23,46)),new x(30,new y(4,24),new y(31,25)),new x(30,new y(11,15),new y(31,16))),new I(29,[6,30,54,78,102,126],new x(30,new y(7,116),new y(7,117)),new x(28,new y(21,45),new y(7,46)),new x(30,new y(1,23),new y(37,24)),new x(30,new y(19,15),new y(26,16))),new I(30,[6,26,52,78,104,130],new x(30,new y(5,115),new y(10,116)),new x(28,new y(19,47),new y(10,48)),new x(30,new y(15,24),new y(25,25)),new x(30,new y(23,15),new y(25,16))),new I(31,[6,30,56,82,108,134],new x(30,new y(13,115),new y(3,116)),new x(28,new y(2,46),new y(29,47)),new x(30,new y(42,24),new y(1,25)),new x(30,new y(23,15),new y(28,16))),new I(32,[6,34,60,86,112,138],new x(30,new y(17,115)),new x(28,new y(10,46),new y(23,47)),new x(30,new y(10,24),new y(35,25)),new x(30,new y(19,15),new y(35,16))),new I(33,[6,30,58,86,114,142],new x(30,new y(17,115),new y(1,116)),new x(28,new y(14,46),new y(21,47)),new x(30,new y(29,24),new y(19,25)),new x(30,new y(11,15),new y(46,16))),new I(34,[6,34,62,90,118,146],new x(30,new y(13,115),new y(6,116)),new x(28,new y(14,46),new y(23,47)),new x(30,new y(44,24),new y(7,25)),new x(30,new y(59,16),new y(1,17))),new I(35,[6,30,54,78,102,126,150],new x(30,new y(12,121),new y(7,122)),new x(28,new y(12,47),new y(26,48)),new x(30,new y(39,24),new y(14,25)),new x(30,new y(22,15),new y(41,16))),new I(36,[6,24,50,76,102,128,154],new x(30,new y(6,121),new y(14,122)),new x(28,new y(6,47),new y(34,48)),new x(30,new y(46,24),new y(10,25)),new x(30,new y(2,15),new y(64,16))),new I(37,[6,28,54,80,106,132,158],new x(30,new y(17,122),new y(4,123)),new x(28,new y(29,46),new y(14,47)),new x(30,new y(49,24),new y(10,25)),new x(30,new y(24,15),new y(46,16))),new I(38,[6,32,58,84,110,136,162],new x(30,new y(4,122),new y(18,123)),new x(28,new y(13,46),new y(32,47)),new x(30,new y(48,24),new y(14,25)),new x(30,new y(42,15),new y(32,16))),new I(39,[6,26,54,82,110,138,166],new x(30,new y(20,117),new y(4,118)),new x(28,new y(40,47),new y(7,48)),new x(30,new y(43,24),new y(22,25)),new x(30,new y(10,15),new y(67,16))),new I(40,[6,30,58,86,114,142,170],new x(30,new y(19,118),new y(6,119)),new x(28,new y(18,47),new y(31,48)),new x(30,new y(34,24),new y(34,25)),new x(30,new y(20,15),new y(61,16)))];/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class C{#O;#k;#M;#_;#T;#A;constructor(e,t){let n=0|t.x,r=0|t.y,i=0|e.x,s=0|e.y,o=Math.abs(r-s)>Math.abs(n-i);o&&([i,s,n,r]=[s,i,r,n]);let l=i<n?1:-1;this.#_=o,this.#M=n+l,this.#O=new h(n,r),this.#k=new h(i,s),this.#T=[l,s<r?1:-1],this.#A=[Math.abs(n-i),Math.abs(r-s)]}*points(){let e=this.#M,t=this.#_,{y:n}=this.#O,[r,i]=this.#T,[s,o]=this.#A,{x:l,y:w}=this.#k,a=0|-s/2;for(let u=l,f=w;u!==e;u+=r)if(yield[t?f:u,t?u:f],(a+=o)>0){if(f===n)break;f+=i,a-=s}}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function S(e,t,n){let r=0,{width:i,height:s}=e,o=new h((t.x+n.x)/2,(t.y+n.y)/2);for(let[n,l]of new C(t,o).points()){if(n<0||l<0||n>=i||l>=s){if(2===r)return d(t,new h(n,l));break}if(1===r==(1===e.get(n,l))){if(2===r)return d(t,new h(n,l));r++}}return NaN}function E(e,t,n){let r=S(e,t,n);if(Number.isNaN(r))return NaN;let{x:i,y:s}=n,{x:o,y:l}=t,w=S(e,t,new h(o-(i-o),l-(s-l)));return Number.isNaN(w)?NaN:r+w-1}function O(e,t,n){let r=new h(0|t.x,0|t.y),i=new h(0|n.x,0|n.y),s=E(e,r,i),o=E(e,i,r);return Number.isNaN(s)?o/7:Number.isNaN(o)?s/7:(s+o)/14}function k(e,t){var n,r,i,s;let o=Math.max((n=b.width(e))>(r=b.width(t))?n/r:r/n,(i=b.height(e))>(s=b.height(t))?i/s:s/i);return o*o}class M{#N;#C;#g;#R;#f;#D;#P;static moduleSizes(e){if(null==e.#P){let t=e.#g,[n,r,i]=e.#D;e.#P=[O(t,n,r),O(t,n,i)]}return e.#P}static size(e){if(null==e.#C){let t=eE.moduleSize(e);e.#C=function(e,t){let[n,r,i]=e,o=s((d(n,r)+d(n,i))/t/2)+7;switch(3&o){case 0:return o+1;case 2:return o-1;case 3:return Math.min(o+2,177)}return o}(e.#D,t)}return e.#C}static moduleSize(e){return null==e.#f&&(e.#f=w(eE.moduleSizes(e))/2),e.#f}static contains(e,t){let n=e.#B(),[r,i,s]=e.#D,o=eE.bottomRight(e),l=m(r,i,t);return l+m(i,o,t)+m(o,s,t)+m(s,r,t)-n<1}static bottomRight(e){return null==e.#R&&(e.#R=function(e){let[t,n,r]=e,{x:i,y:s}=t;return new h(n.x+r.x-i,n.y+r.y-s)}(e.#D)),e.#R}constructor(e,t){this.#g=e,this.#D=function(e){let t,n,r;let[i,s,o]=e,l=g(i,s)*k(i,s),w=g(i,o)*k(i,o),a=g(s,o)*k(s,o);return a>=l&&a>=w?[t,r,n]=e:w>=a&&w>=l?[r,t,n]=e:[r,n,t]=e,0>function(e,t,n){let{x:r,y:i}=t;return(n.x-r)*(e.y-i)-(n.y-i)*(e.x-r)}(r,t,n)&&([r,n]=[n,r]),[t,n,r]}(t)}get topLeft(){return this.#D[0]}get topRight(){return this.#D[1]}get bottomLeft(){return this.#D[2]}#B(){let[e,t,n]=this.#D,r=eE.bottomRight(this);if(null==this.#N){let i=m(e,t,r),s=m(r,n,e);this.#N=i+s}return this.#N}}eE=M;/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class _{#g;#U;#F;#m;constructor(e,t,n,r){let i=new p(e,t),s=M.size(n);this.#g=e,this.#m=t,this.#F=n,this.#U=r,this.#g=i.sample(s,s)}get matrix(){return this.#g}get finder(){return this.#F}get alignment(){return this.#U}get size(){return M.size(this.#F)}get moduleSize(){return M.moduleSize(this.#F)}mapping(e,t){return[e,t]=this.#m.mapping(e,t),new h(e,t)}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class T{#j;#L;#Z;#H;#$;#q;#G;#K;#V;constructor(e,t,n,r,i,s,o,l,w){this.#j=e,this.#L=r,this.#Z=o,this.#H=t,this.#$=i,this.#q=l,this.#G=n,this.#K=s,this.#V=w}inverse(){let e=this.#j,t=this.#L,n=this.#Z,r=this.#H,i=this.#$,s=this.#q,o=this.#G,l=this.#K,w=this.#V;return new T(i*w-s*l,s*o-r*w,r*l-i*o,n*l-t*w,e*w-n*o,t*o-e*l,t*s-n*i,n*r-e*s,e*i-t*r)}times(e){let t=this.#j,n=this.#L,r=this.#Z,i=this.#H,s=this.#$,o=this.#q,l=this.#G,w=this.#K,a=this.#V,u=e.#j,f=e.#L,c=e.#Z,h=e.#H,d=e.#$,g=e.#q,m=e.#G,b=e.#K,p=e.#V;return new T(t*u+i*f+l*c,t*h+i*d+l*g,t*m+i*b+l*p,n*u+s*f+w*c,n*h+s*d+w*g,n*m+s*b+w*p,r*u+o*f+a*c,r*h+o*d+a*g,r*m+o*b+a*p)}mapping(e,t){let n=this.#j,r=this.#L,i=this.#Z,s=this.#H,o=this.#$,l=this.#q,w=this.#G,a=this.#K,u=i*e+l*t+this.#V;return[(n*e+s*t+w)/u,(r*e+o*t+a)/u]}}function A(e,t,n,r,i,s,o,l){let w=e-n+i-o,a=t-r+s-l;if(0===w&&0===a)return new T(n-e,i-n,e,r-t,s-r,t,0,0,1);{let u=n-i,f=o-i,c=r-s,h=l-s,d=u*h-f*c,g=(w*h-f*a)/d,m=(u*a-w*c)/d;return new T(n-e+g*n,o-e+m*o,e,r-t+g*r,l-t+m*l,t,g,m,1)}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function N(e,t){let n,r,i,s;let{x:o,y:l}=e.topLeft,{x:w,y:a}=e.topRight,{x:u,y:f}=e.bottomLeft,c=M.size(e)-3.5;return null!=t?(n=t.x,r=t.y,s=i=c-3):(n=w+u-o,r=a+f-l,i=c,s=c),function(e,t,n,r,i,s,o,l,w,a,u,f,c,h,d,g){let m=A(3.5,3.5,n,3.5,i,s,3.5,l).inverse();return A(w,a,u,f,c,h,d,g).times(m)}(0,0,c,0,i,s,0,c,o,l,w,a,n,r,u,f)}function R(e,t){let[n,,r]=b.rect(e);return t>0?r:t<0?n:e.x}function D(e,t){let[,n,,r]=b.rect(e);return t>0?r:t<0?n:e.y}function P(e,t,n,r){let{x:i,y:s}=t,{x:o,y:l}=e,{x:w,y:a}=n,u=w>i?1:w<i?-1:0,f=a>s?1:a<s?-1:0,c=R(t,u),d=D(t,f),g=R(e,u),m=D(e,f);return 0===u||0===f?[new h(g,m),new h(c,d)]:(r?u===f:u!==f)?[new h(o,m),new h(i,d)]:[new h(g,l),new h(c,s)]}function B(e,t,n,r){let i=r+8,s=new C(t,n).points(),o=1,l=e.get(0|t.x,0|t.y);for(let[t,n]of s){let r=e.get(t,n);if(r!==l&&(o++,l=r,o>i))return!1}return o>=r-14-Math.max(2,(r-17)/4)}function U(e,t,n){let{topLeft:r,topRight:i,bottomLeft:s}=t,[o,l]=n?P(r,s,i,!0):P(r,i,s);return B(e,o,l,M.size(t))}function F(e,t,n,r){let[i,s]=t.mapping(r?6.5:7.5,r?7.5:6.5),[o,l]=t.mapping(r?6.5:n-7.5,r?n-7.5:6.5);return B(e,new h(i,s),new h(o,l),n)}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class j{#J;#h;constructor(e){this.#h=e,this.#J=w(e)}get modules(){return this.#J}get ratios(){return this.#h}}let L=new j([1,1,3,1,1]),Z=new j([1,1,1,1,1]),H=new j([1,1,1]);function $(e,t){let{length:n}=e,r=n-1;for(let t=0;t<r;t++)e[t]=e[t+1];e[r]=t}function q(e,t,n,r,i){let s=-1,o=t|=0,l=n|=0,w=[0,0,0,0,0],{width:a,height:u}=e,f=i?-1:1,c=()=>{o+=s,l-=s*f},h=()=>e.get(o,l);for(;o>=0&&l>=0&&l<u&&h();)c(),w[2]++;for(;o>=0&&l>=0&&l<u&&!h();)c(),w[1]++;for(;o>=0&&l>=0&&l<u&&w[0]<r&&h();)c(),w[0]++;for(o=t+(s=1),l=n-s*f;o<a&&l>=0&&l<u&&h();)c(),w[2]++;for(;o<a&&l>=0&&l<u&&!h();)c(),w[3]++;for(;o<a&&l>=0&&l<u&&w[4]<r&&h();)c(),w[4]++;return w}function G(e,t){let n=[],r=0|e.length/2;for(let t=0;t<=r;t++){let i=r+t+1;n.push(w(e,r-t,i)/2+w(e,i))}return t-(2*n[0]+w(n,1))/(r+2)}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let K=Math.PI/180,V=40*K,J=140*K;function Q(e,t,n,r,i,s){let[o,l]=function(e,t,n,r,i){t|=0,n|=0;let s=i?n:t,o=[0,0,0,0,0],l=i?e.height:e.width,w=()=>i?e.get(t,s):e.get(s,n);for(;s>=0&&w();)s--,o[2]++;for(;s>=0&&!w();)s--,o[1]++;for(;s>=0&&o[0]<r&&w();)s--,o[0]++;for(s=(i?n:t)+1;s<l&&w();)s++,o[2]++;for(;s<l&&!w();)s++,o[3]++;for(;s<l&&o[4]<r&&w();)s++,o[4]++;return[o,s]}(e,t,n,r,s);return[W(o,i)?G(o,l):NaN,o]}function Y(e,t,n){return e>t&&([e,t]=[t,e]),t-e<=t*n}function W(e,t){let{ratios:n,modules:r}=t,{length:i}=e,s=function(e){let t=0;for(let n of e){if(0===n)return NaN;t+=n}return t}(e);if(s>=r){let t=s/r,o=.625*t+.5;for(let r=0;r<i;r++){let i=n[r];if(Math.abs(e[r]-t*i)>o)return!1}return!0}return!1}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class X{#Q;#g;#h;#D=[];constructor(e,t,n){this.#g=e,this.#h=t,this.#Q=n}get matrix(){return this.#g}get patterns(){return this.#D}match(e,t,n,r){let i=this.#g,s=this.#h,o=G(n,e),[l,a]=Q(i,o,t,r,s,!0);if(l>=0){let e;if([o,e]=Q(i,o,l,r,s),o>=0){let t=q(i,o,l,r),n=q(i,o,l,r,!0);if(this.#Q?W(t,s)&&W(n,s):W(t,s)||W(n,s)){let r=function(e){for(var t=arguments.length,n=Array(t>1?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];let i=0,s=0,{length:o}=n,l=[];for(let t of n){let[n,r]=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t){let{ratios:n,modules:r}=t,i=0,{length:s}=n,o=w(e),l=o/r;for(let t=0;t<s;t++)i+=Math.abs(e[t]-n[t]*l);return[i/o,l]}(t,e);i+=n,l.push(r)}let a=w(l),u=a/o;for(let e of l)s+=Math.abs(e-u);return i+s/a}(s,e,a,t,n),i=w(e),u=w(a),f=this.#D,{length:c}=f,h=!1;for(let e=0;e<c;e++){let t=f[e];if(b.equals(t,o,l,i,u)){h=!0,f[e]=b.combine(t,o,l,i,u,r);break}}h||f.push(new b(s,o,l,i,u,r))}}}}}class ee extends X{constructor(e,t){super(e,L,t)}*groups(){let e=this.patterns.filter(e=>b.combined(e)>=3&&1.5>=b.noise(e)),{length:t}=e;if(3===t){let t=new M(this.matrix,e),n=M.size(t);n>=21&&n<=177&&(yield t)}else if(t>3){let n=t-2,r=t-1,i=new Map;for(let o=0;o<n;o++){let n=e[o],l=n.moduleSize;if(!i.has(n))for(let w=o+1;w<r;w++){let r=e[w],o=r.moduleSize;if(i.has(n))break;if(!i.has(r)&&Y(l,o,.5))for(let a=w+1;a<t;a++){let t=e[a],w=t.moduleSize;if(i.has(n)||i.has(r))break;if(!Y(l,w,.5)||!Y(o,w,.5))continue;let{matrix:u}=this,f=new M(u,[n,r,t]),c=function(e){let{topLeft:t,topRight:n,bottomLeft:r}=e,{x:i,y:s}=t,o=n.x-i,l=n.y-s,w=r.x-i,a=r.y-s;return Math.acos((o*w+l*a)/Math.sqrt((o*o+l*l)*(w*w+a*a)))}(f);if(c>=V&&c<=J){let[o,l]=M.moduleSizes(f);if(o>=1&&l>=1){let{topLeft:w,topRight:a,bottomLeft:c}=f,h=d(w,a),g=d(w,c);if(4>=Math.abs(s(h/o)-s(g/l))){let s=M.size(f);s>=21&&s<=177&&!/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t,n){let r=0,{topLeft:i,topRight:s,bottomLeft:o}=e;for(let l of t)if(l!==i&&l!==s&&l!==o){let t;if(n.has(l)&&(t=M.contains(e,l))||1>b.noise(l)&&(null==t?M.contains(e,l):t)&&++r>3)return!0}return!1}(f,e,i)&&(U(u,f)||U(u,f,!0))&&(yield f)&&(i.set(n,!0),i.set(r,!0),i.set(t,!0))}}}}}}}}find(e,t,n,r){let{matrix:i}=this,s=e+n,o=t+r,l=(e,t,n,r,i,s)=>{$(n,r),$(i,s),1===i[0]&&0===i[1]&&1===i[2]&&0===i[3]&&1===i[4]&&W(n,L)&&this.match(e,t,n,n[2])};for(let n=t;n<o;n++){let t=e;for(;t<s&&!i.get(t,n);)t++;let r=0,o=i.get(t,n),w=[0,0,0,0,0],a=[-1,-1,-1,-1,-1];for(;t<s;){let e=i.get(t,n);e===o?r++:(l(t,n,w,r,a,o),r=1,o=e),t++}l(t,n,w,r,a,o)}}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class et extends X{constructor(e,t){super(e,Z,t)}filter(e,t){let n=this.patterns.filter(e=>2.5>=b.noise(e)&&Y(e.moduleSize,t,.5));n.length>1&&n.sort((n,r)=>{let i=b.noise(n),s=b.noise(r),o=Math.abs(n.moduleSize-t),l=Math.abs(r.moduleSize-t);return(d(n,e)+o)*i-(d(r,e)+l)*s});let r=n.slice(0,2);return r.push(e),r}find(e,t,n,r){let{matrix:i}=this,s=e+n,o=t+r,l=(e,t,n,r,i,s)=>{$(n,r),$(i,s),0===i[0]&&1===i[1]&&0===i[2]&&W(n,H)&&this.match(e,t,n,n[1])};for(let n=t;n<o;n++){let t=e;for(;t<s&&!i.get(t,n);)t++;let r=0,o=i.get(t,n),w=[0,0,0],a=[-1,-1,-1];for(;t<s;){let e=i.get(t,n);e===o?r++:(l(t,n,w,r,a,o),r=1,o=e),t++}l(t,n,w,r,a,o)}}}class en{#Y;constructor(e={}){this.#Y=e}*detect(e){let{strict:t}=this.#Y,{width:n,height:r}=e,i=new ee(e,t);i.find(0,0,n,r);let s=i.groups(),o=s.next();for(;!o.done;){let n=!1,r=o.value,i=M.size(r);if(i>=25)for(let s of function(e,t,n){let r=M.size(t),i=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e){let{x:t,y:n}=e.topLeft,r=1-3/(M.size(e)-7),i=M.bottomRight(e),[s,o]=M.moduleSizes(e);return new b(Z,t+(i.x-t)*r,n+(i.y-n)*r,5*s,5*o,0)}(t),s=new et(e,n),o=M.moduleSize(t),{x:l,y:w}=i,a=Math.ceil(o*Math.min(20,0|r/4)),u=0|Math.max(0,w-a),f=0|Math.max(0,l-a),c=0|Math.min(e.width-1,l+a),h=0|Math.min(e.height-1,w+a);return s.find(f,u,c-f,h-u),s.filter(i,o)}(e,r,t)){let t=N(r,s);if(F(e,t,i)&&F(e,t,i,!0)&&(n=yield new _(e,t,r,s)))break}else{let t=N(r);F(e,t,i)&&F(e,t,i,!0)&&(n=yield new _(e,t,r))}o=s.next(n)}}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class er{#W;#X;#ee;#S;#et;#en;constructor(e,t,{mask:n,level:r},i,s){this.#W=n,this.#X=r,this.#ee=s,this.#S=t,this.#en=e,this.#et=i}get mask(){return this.#W}get level(){return this.#X.name}get version(){return this.#S.version}get mirror(){return this.#ee}get content(){return this.#en.content}get corrected(){return this.#et}get symbology(){return this.#en.symbology}get fnc1(){return this.#en.fnc1}get codewords(){return this.#en.codewords}get structured(){return this.#en.structured}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class ei{#er;#ei;#es;constructor(e){this.#er=e,this.#ei=0,this.#es=0}get bitOffset(){return this.#ei}get byteOffset(){return this.#es}read(e){let t=0,n=this.#ei,r=this.#es,i=this.#er;if(n>0){let s=8-n,o=Math.min(e,s),l=s-o;e-=o,n+=o,t=(i[r]&255>>8-o<<l)>>l,8===n&&(r++,n=0)}if(e>0){for(;e>=8;)e-=8,t=t<<8|255&i[r++];if(e>0){let s=8-e;n+=e,t=t<<e|(i[r]&255>>s<<s)>>s}}return this.#ei=n,this.#es=r,t}available(){return 8*(this.#er.length-this.#es)-this.#ei}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let es=new Map;class eo{#s;#eo;static TERMINATOR=new eo([0,0,0],0);static NUMERIC=new eo([10,12,14],1);static ALPHANUMERIC=new eo([9,11,13],2);static STRUCTURED_APPEND=new eo([0,0,0],3);static BYTE=new eo([8,16,16],4);static ECI=new eo([0,0,0],7);static KANJI=new eo([8,10,12],8);static FNC1_FIRST_POSITION=new eo([0,0,0],5);static FNC1_SECOND_POSITION=new eo([0,0,0],9);static HANZI=new eo([8,10,12],13);constructor(e,t){this.#s=t,this.#eo=new Int32Array(e),es.set(t,this)}get bits(){return this.#s}getCharacterCountBits(e){let t,{version:n}=e;return t=n<=9?0:n<=26?1:2,this.#eo[t]}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function el(e){let t=0,n=new Map;for(let r of e)n.set(r,t++);return n}function ew(e){for(var t=arguments.length,n=Array(t>1?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];let i=[],s=[],l=new Map,w=new TextDecoder(e,{fatal:!0});for(let[e,t]of n)for(let n=e;n<=t;n++)i.push(n>>8&255,255&n),s.push(n);let{length:a}=s,u=w.decode(new Uint8Array(i));for(let e=0;e<a;e++){let t=o(u,e);l.has(t)||l.set(t,s[e])}return l}function ea(e,t,n){let r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:256,i=n.length-1,s=[];for(let o=e;o<t;){for(let e=0;e<i;e+=2)s.push([o+n[e],o+n[e+1]]);o+=r}return s}ew("gb2312",[41377,41470],[41649,41698],[41701,41710],[41713,41724],[41889,41982],[42145,42227],[42401,42486],[42657,42680],[42689,42712],[42913,42945],[42961,42993],[43169,43194],[43205,43241],[43428,43503],...ea(45217,55038,[0,93]),[55201,55289],...ea(55457,63486,[0,93])),ew("shift-jis",[33088,33150],[33152,33196],[33208,33215],[33224,33230],[33242,33256],[33264,33271],[33276,33276],[33359,33368],[33376,33401],[33409,33434],[33439,33521],[33600,33662],[33664,33686],[33695,33718],[33727,33750],[33856,33888],[33904,33918],[33920,33937],[33951,33982],[34975,35068],...ea(35136,38908,[0,62,64,188]),[38976,39026],[39071,39164],...ea(39232,40956,[0,62,64,188]),...ea(57408,59900,[0,62,64,188]),[59968,60030],[60032,60068]);let eu="0123456789";el(eu);let ef=`${eu}ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:`;function ec(e){return e.replace(/%+/g,e=>{let t=1&e.length;return e=e.replace(/%%/g,"%"),t?e.replace(/%$/,"\x1d"):e})}el(ef);/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let eh=new Map;class ed{#el;#s;#X;static L=new ed("L",0,1);static M=new ed("M",1,0);static Q=new ed("Q",2,3);static H=new ed("H",3,2);constructor(e,t,n){this.#s=n,this.#el=e,this.#X=t,eh.set(n,this)}get bits(){return this.#s}get name(){return this.#el}get level(){return this.#X}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let eg=[[21522,0],[20773,1],[24188,2],[23371,3],[17913,4],[16590,5],[20375,6],[19104,7],[30660,8],[29427,9],[32170,10],[30877,11],[26159,12],[25368,13],[27713,14],[26998,15],[5769,16],[5054,17],[7399,18],[6608,19],[1890,20],[597,21],[3340,22],[2107,23],[13663,24],[12392,25],[16177,26],[14854,27],[9396,28],[8579,29],[11994,30],[11245,31]];class em{#W;#X;constructor(e){this.#W=7&e,this.#X=function(e){let t=eh.get(e);if(null!=t)return t;throw Error("illegal error correction bits")}(e>>3&3)}get mask(){return this.#W}get level(){return this.#X}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function eb(e,t,n,r){return e.get(t,n)?r<<1|1:r<<1}class ep{#C;#g;constructor(e){let{width:t,height:n}=e;this.#g=e.clone(),this.#C=Math.min(t,n)}readVersion(){let e=this.#C,t=0|(e-17)/4;if(t<1)throw Error("illegal version");if(t<=6)return z[t-1];let n=0,r=0,i=e-11,s=this.#g;for(let t=5;t>=0;t--)for(let r=e-9;r>=i;r--)n=eb(s,r,t,n);for(let t=5;t>=0;t--)for(let n=e-9;n>=i;n--)r=eb(s,t,n,r);let o=function(e,t){let n=32,r=0,{length:i}=v;for(let s=0;s<i;s++){let i=v[s];if(e===i||t===i)return z[s+6];let o=l(e^i);o<n&&(n=o,r=s+7),e!==t&&(o=l(t^i))<n&&(n=o,r=s+7)}if(n<=3&&r>=7)return z[r-1];throw Error("unable to decode version")}(n,r);if(o.size>e)throw Error("matrix size too small for version");return o}readFormatInfo(){let e=0,t=0,n=this.#g,r=this.#C,i=r-7;for(let t=0;t<=8;t++)6!==t&&(e=eb(n,t,8,e));for(let t=7;t>=0;t--)6!==t&&(e=eb(n,8,t,e));for(let e=r-1;e>=i;e--)t=eb(n,8,e,t);for(let e=r-8;e<r;e++)t=eb(n,e,8,t);return function(e,t){let n=32,r=0;for(let[i,s]of eg){if(e===i||t===i)return new em(s);let o=l(e^i);o<n&&(n=o,r=s),e!==t&&(o=l(t^i))<n&&(n=o,r=s)}if(n<=3)return new em(r);throw Error("unable to decode format information")}(e,t)}readCodewords(e,t){let n=0,r=0,i=0,s=!0,o=this.#C,l=this.#g,w=e.getECBlocks(t),u=function(e){let{size:t,version:n,alignmentPatterns:r}=e,{length:i}=r,s=new a(t,t),o=i-1;s.setRegion(0,0,9,9),s.setRegion(t-8,0,8,9),s.setRegion(0,t-8,9,8);for(let e=0;e<i;e++){let t=r[e]-2;for(let n=0;n<i;n++)(0!==e||0!==n&&n!==o)&&(e!==o||0!==n)&&s.setRegion(r[n]-2,t,5,5)}return s.setRegion(6,9,1,t-17),s.setRegion(9,6,t-17,1),n>6&&(s.setRegion(t-11,0,3,6),s.setRegion(0,t-11,6,3)),s}(e),f=new Uint8Array(w.numTotalCodewords);for(let e=o-1;e>0;e-=2){6===e&&e--;for(let t=0;t<o;t++){let w=s?o-1-t:t;for(let t=0;t<2;t++){let s=e-t;u.get(s,w)||(n++,i<<=1,l.get(s,w)&&(i|=1),8!==n||(f[r++]=i,n=0,i=0))}}s=!s}if(r!==w.numTotalCodewords)throw Error("illegal codewords length");return f}unmask(e){let t=this.#C,n=this.#g;for(let r=0;r<t;r++)for(let i=0;i<t;i++)(function(e,t,n){let r,i;switch(e){case 0:i=n+t&1;break;case 1:i=1&n;break;case 2:i=t%3;break;case 3:i=(n+t)%3;break;case 4:i=(0|n/2)+(0|t/3)&1;break;case 5:i=(1&(r=n*t))+r%3;break;case 6:i=(1&(r=n*t))+r%3&1;break;case 7:i=n*t%3+(n+t&1)&1;break;default:throw Error(`illegal mask: ${e}`)}return 0===i})(e,i,r)&&n.flip(i,r)}remask(e){this.unmask(e)}mirror(){let e=this.#C,t=this.#g;for(let n=0;n<e;n++)for(let r=n+1;r<e;r++)t.get(n,r)!==t.get(r,n)&&(t.flip(n,r),t.flip(r,n))}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class ey{#ew;#p;constructor(e,t){this.#ew=e,this.#p=t}get codewords(){return this.#ew}get numDataCodewords(){return this.#p}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class ex{#ea;#eu;constructor(e,t){let{length:n}=t;if(n<=0)throw Error("polynomial coefficients cannot empty");if(this.#ea=e,n>1&&0===t[0]){let e=1;for(;e<n&&0===t[e];)e++;if(e===n)this.#eu=new Int32Array([0]);else{let r=new Int32Array(n-e);r.set(t.subarray(e)),this.#eu=r}}else this.#eu=t}get coefficients(){return this.#eu}isZero(){return 0===this.#eu[0]}getDegree(){return this.#eu.length-1}getCoefficient(e){let t=this.#eu;return t[t.length-1-e]}evaluate(e){let t;if(0===e)return this.getCoefficient(0);let n=this.#eu;if(1===e){for(let e of(t=0,n))t^=e;return t}[t]=n;let r=this.#ea,{length:i}=n;for(let s=1;s<i;s++)t=r.multiply(e,t)^n[s];return t}multiply(e){let t=this.#ea,n=this.#eu,{length:r}=n;if(e instanceof ex){if(this.isZero()||e.isZero())return t.zero;let i=e.#eu,s=i.length,o=new Int32Array(r+s-1);for(let e=0;e<r;e++){let r=n[e];for(let n=0;n<s;n++)o[e+n]^=t.multiply(r,i[n])}return new ex(t,o)}if(0===e)return t.zero;if(1===e)return this;let i=new Int32Array(r);for(let s=0;s<r;s++)i[s]=t.multiply(n[s],e);return new ex(t,i)}multiplyByMonomial(e,t){let n=this.#ea;if(0===t)return n.zero;let r=this.#eu,{length:i}=r,s=new Int32Array(i+e);for(let e=0;e<i;e++)s[e]=n.multiply(r[e],t);return new ex(n,s)}addOrSubtract(e){if(this.isZero())return e;if(e.isZero())return this;let t=e.#eu,n=t.length,r=this.#eu,i=r.length;n<i&&([n,i]=[i,n],[t,r]=[r,t]);let s=n-i,o=new Int32Array(n);o.set(t.subarray(0,s));for(let e=s;e<n;e++)o[e]=r[e-s]^t[e];return new ex(this.#ea,o)}divide(e){let t=this.#ea,n=t.zero,r=this,i=e.getCoefficient(e.getDegree()),s=t.invert(i);for(;r.getDegree()>=e.getDegree()&&!r.isZero();){let i=r.getDegree(),o=i-e.getDegree(),l=t.multiply(r.getCoefficient(i),s),w=e.multiplyByMonomial(o,l),a=t.buildPolynomial(o,l);n=n.addOrSubtract(a),r=r.addOrSubtract(w)}return[n,r]}}let ev=new /**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class{#C;#ef;#ec;#eh;#ed;#eg;constructor(e,t,n){let r=1,i=new Int32Array(t);for(let n=0;n<t;n++)i[n]=r,(r*=2)>=t&&(r^=e,r&=t-1);let s=new Int32Array(t);for(let e=0,n=t-1;e<n;e++)s[i[e]]=e;this.#C=t,this.#ed=i,this.#eg=s,this.#eh=n,this.#ef=new ex(this,new Int32Array([1])),this.#ec=new ex(this,new Int32Array([0]))}get size(){return this.#C}get one(){return this.#ef}get zero(){return this.#ec}get generator(){return this.#eh}exp(e){return this.#ed[e]}log(e){return this.#eg[e]}invert(e){return this.#ed[this.#C-this.#eg[e]-1]}multiply(e,t){if(0===e||0===t)return 0;let n=this.#eg;return this.#ed[(n[e]+n[t])%(this.#C-1)]}buildPolynomial(e,t){if(0===t)return this.#ec;let n=new Int32Array(e+1);return n[0]=t,new ex(this,n)}}(285,256,0);class eI{#ea;constructor(e=ev){this.#ea=e}decode(e,t){let n=!0,r=this.#ea,{generator:i}=r,s=new ex(r,e),o=new Int32Array(t);for(let e=0;e<t;e++){let l=s.evaluate(r.exp(e+i));o[t-1-e]=l,0!==l&&(n=!1)}if(!n){let n=new ex(r,o),[i,s]=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t,n,r){t.getDegree()<n.getDegree()&&([t,n]=[n,t]);let i=n,s=e.one,o=t,l=e.zero;for(;2*i.getDegree()>=r;){let t=l,n=o;if(l=s,(o=i).isZero())throw Error("remainder last was zero");i=n;let r=e.zero,w=i.getDegree(),a=o.getDegree(),u=o.getCoefficient(a),f=e.invert(u);for(;w>=a&&!i.isZero();){let t=i.getDegree()-a,n=e.multiply(i.getCoefficient(w),f);r=r.addOrSubtract(e.buildPolynomial(t,n)),w=(i=i.addOrSubtract(o.multiplyByMonomial(t,n))).getDegree()}if(s=r.multiply(l).addOrSubtract(t),w>=a)throw Error("division algorithm failed to reduce polynomial")}let w=s.getCoefficient(0);if(0===w)throw Error("sigma tilde(0) was zero");let a=e.invert(w);return[s.multiply(a),i.multiply(a)]}(r,r.buildPolynomial(t,1),n,t),l=function(e,t){let n=t.getDegree();if(1===n)return new Int32Array([t.getCoefficient(1)]);let r=0,{size:i}=e,s=new Int32Array(n);for(let o=1;o<i&&r<n;o++)0===t.evaluate(o)&&(s[r++]=e.invert(o));if(r!==n)throw Error("error locator degree does not match number of roots");return s}(r,i),w=function(e,t,n){let{length:r}=n,i=new Int32Array(r);for(let s=0;s<r;s++){let o=1,l=e.invert(n[s]);for(let t=0;t<r;t++)if(s!==t){let r=e.multiply(n[t],l),i=(1&r)==0?1|r:-2&r;o=e.multiply(o,i)}i[s]=e.multiply(t.evaluate(l),e.invert(o)),0!==e.generator&&(i[s]=e.multiply(i[s],l))}return i}(r,s,l),a=l.length,u=e.length;for(let t=0;t<a;t++){let n=u-1-r.log(l[t]);if(n<0)throw Error("bad error location");e[n]=e[n]^w[t]}return a}return 0}}function ez(e,t){try{return new TextDecoder(t.label).decode(e)}catch{throw Error(`built-in decode not support charset: ${t.label}`)}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function eC(e,t,n){let{mask:r,level:i}=n,s=0,o=0;e.unmask(r);let l=t.getECBlocks(i),w=function(e,t,n){let{ecBlocks:r,numTotalCodewords:i,numECCodewordsPerBlock:s}=t.getECBlocks(n);if(e.length!==i)throw Error("failed to get data blocks");let o=[];for(let{count:e,numDataCodewords:t}of r)for(let n=0;n<e;n++){let e=s+t;o.push(new ey(new Uint8Array(e),t))}let{length:l}=o,w=l-1,a=o[0].codewords.length;for(;w>=0&&o[w].codewords.length!==a;)w--;w++;let u=0,f=a-s;for(let t=0;t<f;t++)for(let n=0;n<l;n++)o[n].codewords[t]=e[u++];for(let t=w;t<l;t++)o[t].codewords[f]=e[u++];let c=o[0].codewords.length;for(let t=f;t<c;t++)for(let n=0;n<l;n++){let r=n<w?t:t+1;o[n].codewords[r]=e[u++]}return o}(e.readCodewords(t,i),t,i),a=new Uint8Array(l.numTotalDataCodewords);for(let{codewords:e,numDataCodewords:t}of w){let[n,r]=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t){let n=new Int32Array(e),r=e.length-t,i=new eI().decode(n,r);return[n,i]}(e,t);a.set(n.subarray(0,t),s),o+=r,s+=t}return[a,o]}class eS{#em;constructor({decode:e=ez}={}){this.#em=e}decode(e){let t,n,s,l=0,w=!1,a=new ep(e);try{t=a.readVersion(),s=a.readFormatInfo(),[n,l]=eC(a,t,s)}catch{null!=s&&a.remask(s.mask),a.mirror(),w=!0,t=a.readVersion(),s=a.readFormatInfo(),[n,l]=eC(a,t,s)}return new er(function(e,t,n){let s,l,w,a="",u=-1,f=!1,c=!1,h=!1,d=!1,g=new ei(e);do switch(l=4>g.available()?eo.TERMINATOR:function(e){let t=es.get(e);if(null!=t)return t;throw Error("illegal mode bits")}(g.read(4))){case eo.TERMINATOR:break;case eo.FNC1_FIRST_POSITION:f=!0;break;case eo.FNC1_SECOND_POSITION:c=!0,u=g.read(8);break;case eo.STRUCTURED_APPEND:if(16>g.available())throw Error("illegal structured append");d=Object.freeze({index:g.read(4),count:g.read(4)+1,parity:g.read(8)});break;case eo.ECI:w=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.1
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e){let t=e.read(8);if((128&t)==0)return 127&t;if((192&t)==128)return(63&t)<<8|e.read(8);if((224&t)==192)return(31&t)<<16|e.read(16);throw Error("illegal extended channel interpretation value")}(g);break;default:if(l===eo.HANZI&&1!==g.read(4))throw Error("illegal hanzi subset");let m=g.read(l.getCharacterCountBits(t));switch(l){case eo.ALPHANUMERIC:a+=function(e,t,n){let r="";for(;t>1;){if(11>e.available())throw Error("illegal bits length");let n=e.read(11);r+=o(ef,n/45)+o(ef,n%45),t-=2}if(1===t){if(6>e.available())throw Error("illegal bits length");r+=o(ef,e.read(6))}return n?ec(r):r}(g,m,f||c);break;case eo.BYTE:a+=function(e,t,n,s,o){if(e.available()<8*t)throw Error("illegal bits length");let l=new Uint8Array(t),w=null!=o?function(e){let t=r.get(e);if(t)return t;throw Error("illegal charset value")}(o):i.ISO_8859_1;for(let n=0;n<t;n++)l[n]=e.read(8);let a=n(l,w);return s?ec(a):a}(g,m,n,f||c,w);break;case eo.HANZI:a+=function(e,t){if(e.available()<13*t)throw Error("illegal bits length");let n=0,r=new Uint8Array(2*t);for(;t>0;){let i=e.read(13),s=i/96<<8|i%96;s<2560?s+=41377:s+=42657,r[n]=s>>8&255,r[n+1]=255&s,t--,n+=2}return new TextDecoder("gb2312").decode(r)}(g,m);break;case eo.KANJI:a+=function(e,t){if(e.available()<13*t)throw Error("illegal bits length");let n=0,r=new Uint8Array(2*t);for(;t>0;){let i=e.read(13),s=i/192<<8|i%192;s<7936?s+=33088:s+=49472,r[n]=s>>8&255,r[n+1]=255&s,t--,n+=2}return new TextDecoder("shift-jis").decode(r)}(g,m);break;case eo.NUMERIC:a+=function(e,t){let n="";for(;t>=3;){if(10>e.available())throw Error("illegal bits length");let r=e.read(10);if(r>=1e3)throw Error("illegal numeric codeword");n+=o(eu,r/100)+o(eu,r/10%10)+o(eu,r%10),t-=3}if(2===t){if(7>e.available())throw Error("illegal bits length");let t=e.read(7);if(t>=100)throw Error("illegal numeric codeword");n+=o(eu,t/10)+o(eu,t%10)}else if(1===t){if(4>e.available())throw Error("illegal bits length");let t=e.read(4);if(t>=10)throw Error("illegal numeric codeword");n+=o(eu,t)}return n}(g,m);break;default:throw Error("illegal mode")}}while(l!==eo.TERMINATOR);return f?h=Object.freeze(["GS1"]):c&&(h=Object.freeze(["AIM",u])),s=null!=w?f?4:c?6:2:f?3:c?5:1,{content:a,codewords:e,structured:d,symbology:`]Q${s}`,fnc1:h}}(n,t,this.#em),t,s,l,w)}}var eE,eO=n(6275),ek=n.n(eO);function eM(e){return{x:e.x,y:e.y}}function e_(e){return{x:e.x,y:e.y,moduleSize:e.moduleSize}}function eT(e,t){let n=null;t===i.ISO_8859_1&&(n=ek().detect(e)),null==n&&(n=t.label);try{return new TextDecoder(n).decode(e)}catch(t){return new TextDecoder("utf-8").decode(e)}}self.addEventListener("message",async e=>{let{data:t}=e,{uid:n,image:r}=t,{width:i,height:s}=r,o=new OffscreenCanvas(i,s).getContext("2d");o.drawImage(r,0,0);let l=function(e,t,n){if(e.length!==t*n)throw Error("luminances length must be equals to width * height");return t<40||n<40?function(e,t,n){let r=new a(t,n),i=new Int32Array(32);for(let r=1;r<5;r++){let s=0|4*t/5,o=(0|n*r/5)*t;for(let n=0|t/5;n<s;n++){let t=e[o+n];i[t>>3]++}}let s=function(e){let t=0,n=0,r=0,{length:i}=e;for(let s=0;s<i;s++)e[s]>n&&(t=s,n=e[s]),e[s]>r&&(r=e[s]);let s=0,o=0;for(let n=0;n<i;n++){let r=n-t,i=e[n]*r*r;i>o&&(s=n,o=i)}if(t>s&&([t,s]=[s,t]),s-t<=2)return -1;let l=-1,w=s-1;for(let n=s-1;n>t;n--){let i=n-t,o=i*i*(s-n)*(r-e[n]);o>l&&(w=n,l=o)}return w<<3}(i);if(s>0)for(let i=0;i<n;i++){let n=i*t;for(let o=0;o<t;o++)e[n+o]<s&&r.set(o,i)}return r}(e,t,n):function(e,t,n){let r=t-8,i=n-8,s=u(t),o=u(n),l=new a(t,n),w=function(e,t,n){let r=[],i=t-8,s=n-8,o=u(t),l=u(n);for(let n=0;n<l;n++){r[n]=new Int32Array(o);let l=c(n,s);for(let s=0;s<o;s++){let o=0,w=0,a=255,u=c(s,i);for(let n=0,r=l*t+u;n<8;n++,r+=t){for(let t=0;t<8;t++){let n=e[r+t];o+=n,n<a&&(a=n),n>w&&(w=n)}if(w-a>24)for(n++,r+=t;n<8;n++,r+=t)for(let t=0;t<8;t++)o+=e[r+t]}let f=o>>6;if(w-a<=24&&(f=a/2,n>0&&s>0)){let e=(r[n-1][s]+2*r[n][s-1]+r[n-1][s-1])/4;a<e&&(f=e)}r[n][s]=f}}return r}(e,t,n);for(let n=0;n<o;n++){let a=f(n,o-3),u=c(n,i);for(let n=0;n<s;n++){let i=0,o=f(n,s-3),h=c(n,r);for(let e=-2;e<=2;e++){let t=w[a+e];i+=t[o-2]+t[o-1]+t[o]+t[o+1]+t[o+2]}let d=i/25;for(let n=0,r=u*t+h;n<8;n++,r+=t)for(let t=0;t<8;t++)e[r+t]<=d&&l.set(h+t,u+n)}}return l}(e,t,n)}(function(e){let{data:t,width:n,height:r}=e,i=new Uint8Array(n*r);for(let e=0;e<r;e++){let r=e*n;for(let e=0;e<n;e++){let n=4*(r+e),s=t[n],o=t[n+1],l=t[n+2];i[r+e]=306*s+601*o+117*l+512>>10}}return i}(o.getImageData(0,0,i,s)),i,s);t.invert&&l.flip();let w=new en({strict:t.strict}).detect(l),h=[],d=new eS({decode:eT}),g=w.next();for(;!g.done;){let e=!1,t=g.value;try{let{size:n,finder:r,alignment:i}=t,s=d.decode(t.matrix),{topLeft:o,topRight:l,bottomLeft:w}=r,a=t.mapping(0,0),u=t.mapping(n,0),f=t.mapping(n,n),c=t.mapping(0,n),g=t.mapping(6.5,6.5),m=t.mapping(n-6.5,6.5),b=t.mapping(6.5,n-6.5);h.push({fnc1:s.fnc1,mask:s.mask,level:s.level,mirror:s.mirror,content:s.content,version:s.version,corrected:s.corrected,symbology:s.symbology,structured:s.structured,alignment:i?e_(i):null,finder:[e_(o),e_(l),e_(w)],timing:[eM(g),eM(m),eM(b)],corners:[eM(a),eM(u),eM(f),eM(c)]}),e=!0}catch{}g=w.next(e)}h.length>0?self.postMessage({type:"ok",payload:{uid:n,image:r,items:h}},[r]):self.postMessage({type:"error",message:"未发现二维码"})})}},o={};function l(e){var t=o[e];if(void 0!==t)return t.exports;var n=o[e]={exports:{}};return s[e].call(n.exports,n,n.exports,l),n.exports}l.m=s,l.x=function(){var e=l.O(void 0,[275],function(){return l(6577)});return l.O(e)},e=[],l.O=function(t,n,r,i){if(n){i=i||0;for(var s=e.length;s>0&&e[s-1][2]>i;s--)e[s]=e[s-1];e[s]=[n,r,i];return}for(var o=1/0,s=0;s<e.length;s++){for(var n=e[s][0],r=e[s][1],i=e[s][2],w=!0,a=0;a<n.length;a++)o>=i&&Object.keys(l.O).every(function(e){return l.O[e](n[a])})?n.splice(a--,1):(w=!1,i<o&&(o=i));if(w){e.splice(s--,1);var u=r();void 0!==u&&(t=u)}}return t},l.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return l.d(t,{a:t}),t},l.d=function(e,t){for(var n in t)l.o(t,n)&&!l.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},l.f={},l.e=function(e){return Promise.all(Object.keys(l.f).reduce(function(t,n){return l.f[n](e,t),t},[]))},l.u=function(e){return"js/b6c2a8b2d2b1f233.js"},l.miniCssF=function(e){},l.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},l.p="/qrcode/packages/examples/static/public/",t={958:1},l.f.i=function(e,n){t[e]||importScripts(l.p+l.u(e))},r=(n=self.webpackChunk=self.webpackChunk||[]).push.bind(n),n.push=function(e){var n=e[0],i=e[1],s=e[2];for(var o in i)l.o(i,o)&&(l.m[o]=i[o]);for(s&&s(l);n.length;)t[n.pop()]=1;r(e)},i=l.x,l.x=function(){return l.e(275).then(i)},l.x()}();