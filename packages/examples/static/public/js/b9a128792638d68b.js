!function(){"use strict";/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let e=new Map;class t{#e;#t;static TERMINATOR=new t([0,0,0],0);static NUMERIC=new t([10,12,14],1);static ALPHANUMERIC=new t([9,11,13],2);static STRUCTURED_APPEND=new t([0,0,0],3);static BYTE=new t([8,16,16],4);static ECI=new t([0,0,0],7);static KANJI=new t([8,10,12],8);static FNC1_FIRST_POSITION=new t([0,0,0],5);static FNC1_SECOND_POSITION=new t([0,0,0],9);static HANZI=new t([8,10,12],13);constructor(t,n){this.#e=n,this.#t=new Int32Array(t),e.set(n,this)}get bits(){return this.#e}getCharacterCountBits(e){let t,{version:n}=e;return t=n<=9?0:n<=26?1:2,this.#t[t]}}function n(e){return 32-Math.clz32(e)}function r(e,t){let r=n(t);for(e<<=r-1;n(e)>=r;)e^=t<<n(e)-r;return e}function w(e){return new Int32Array(Math.ceil(e/32))}class i{#n;#e;constructor(e=0){this.#n=e,this.#e=w(e)}#r(e){let t=this.#e;if(e>32*t.length){let n=w(Math.ceil(e/.75));n.set(t),this.#e=n}this.#n=e}get length(){return this.#n}get byteLength(){return Math.ceil(this.#n/8)}set(e){this.#e[0|e/32]|=1<<(31&e)}get(e){return this.#e[0|e/32]>>>(31&e)&1}xor(e){let t=this.#e,n=e.#e,r=Math.min(this.#n,e.#n);for(let e=0;e<r;e++)t[e]^=n[e]}append(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1,n=this.#n;if(e instanceof i){t=e.#n,this.#r(n+t);for(let r=0;r<t;r++)e.get(r)&&this.set(n),n++}else{this.#r(n+t);for(let r=t-1;r>=0;r--)e>>>r&1&&this.set(n),n++}}toUint8Array(e,t,n,r){for(let w=0;w<r;w++){let r=0;for(let t=0;t<8;t++)this.get(e++)&&(r|=1<<7-t);t[n+w]=r}}clear(){this.#e.fill(0)}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let s=new Map;class o{#w;#i;static CP437=new o("cp437",2,0);static ISO_8859_1=new o("iso-8859-1",3,1);static ISO_8859_2=new o("iso-8859-2",4);static ISO_8859_3=new o("iso-8859-3",5);static ISO_8859_4=new o("iso-8859-4",6);static ISO_8859_5=new o("iso-8859-5",7);static ISO_8859_6=new o("iso-8859-6",8);static ISO_8859_7=new o("iso-8859-7",9);static ISO_8859_8=new o("iso-8859-8",10);static ISO_8859_9=new o("iso-8859-9",11);static ISO_8859_10=new o("iso-8859-10",12);static ISO_8859_11=new o("iso-8859-11",13);static ISO_8859_13=new o("iso-8859-13",15);static ISO_8859_14=new o("iso-8859-14",16);static ISO_8859_15=new o("iso-8859-15",17);static ISO_8859_16=new o("iso-8859-16",18);static SHIFT_JIS=new o("shift-jis",20);static CP1250=new o("cp1250",21);static CP1251=new o("cp1251",22);static CP1252=new o("cp1252",23);static CP1256=new o("cp1256",24);static UTF_16BE=new o("utf-16be",25);static UTF_8=new o("utf-8",26);static ASCII=new o("ascii",27);static BIG5=new o("big5",28);static GB2312=new o("gb2312",29);static EUC_KR=new o("euc-kr",30);static GB18030=new o("gb18030",32);static UTF_16LE=new o("utf-16le",33);static UTF_32BE=new o("utf-32be",34);static UTF_32LE=new o("utf-32le",35);static ISO_646_INV=new o("iso-646-inv",170);static BINARY=new o("binary",899);constructor(e,...t){for(let n of(this.#w=e,this.#i=Object.freeze(t),t))if(n>=0&&n<=999999)s.set(n,this);else throw Error("illegal extended channel interpretation value")}get label(){return this.#w}get values(){return this.#i}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function l(e){if(!e)throw Error("segment content should be at least 1 character")}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function a(e){let t=0,n=new Map;for(let r of e)n.set(r,t++);return n}function c(e){for(var t=arguments.length,n=Array(t>1?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];let w=[],i=[],s=new Map,o=new TextDecoder(e,{fatal:!0});for(let[e,t]of n)for(let n=e;n<=t;n++)w.push(n>>8,255&n),i.push(n);let{length:l}=i,a=o.decode(new Uint8Array(w));for(let e=0;e<l;e++){let t=a.charAt(e);s.has(t)||s.set(t,i[e])}return s}function h(e,t,n){let r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:256,w=n.length-1,i=[];for(let s=e;s<t;){for(let e=0;e<w;e+=2)i.push([s+n[e],s+n[e+1]]);s+=r}return i}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let u=c("gb2312",[41377,41470],[41649,41698],[41701,41710],[41713,41724],[41889,41982],[42145,42227],[42401,42486],[42657,42680],[42689,42712],[42913,42945],[42961,42993],[43169,43194],[43205,43241],[43428,43503],...h(45217,55038,[0,93]),[55201,55289],...h(55457,63486,[0,93])),f=c("shift-jis",[33088,33150],[33152,33196],[33208,33215],[33224,33230],[33242,33256],[33264,33271],[33276,33276],[33359,33368],[33376,33401],[33409,33434],[33439,33521],[33600,33662],[33664,33686],[33695,33718],[33727,33750],[33856,33888],[33904,33918],[33920,33937],[33951,33982],[34975,35068],...h(35136,38908,[0,62,64,188]),[38976,39026],[39071,39164],...h(39232,40956,[0,62,64,188]),...h(57408,59900,[0,62,64,188]),[59968,60030],[60032,60068]),g="0123456789",d=a(g),p=a(`${g}ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:`);/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function b(e){let t=d.get(e);if(null!=t)return t;throw Error(`illegal numeric character: ${e}`)}class y{#s;constructor(e){l(e),this.#s=e}get mode(){return t.NUMERIC}get content(){return this.#s}encode(){let e=new i,t=this.#s,{length:n}=t;for(let r=0;r<n;){let w=b(t.charAt(r));if(r+2<n){let n=b(t.charAt(r+1)),i=b(t.charAt(r+2));e.append(100*w+10*n+i,10),r+=3}else if(r+1<n){let n=b(t.charAt(r+1));e.append(10*w+n,7),r+=2}else e.append(w,4),r++}return e}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function I(e){let t=p.get(e);if(null!=t)return t;throw Error(`illegal alphanumeric character: ${e}`)}class m{#s;constructor(e){l(e),this.#s=e}get mode(){return t.ALPHANUMERIC}get content(){return this.#s}encode(){let e=new i,t=this.#s,{length:n}=t;for(let r=0;r<n;){let w=I(t.charAt(r));if(r+1<n){let n=I(t.charAt(r+1));e.append(45*w+n,11),r+=2}else e.append(w,6),r++}return e}}class C{#s;constructor(e){l(e),this.#s=e}get mode(){return t.HANZI}get content(){return this.#s}encode(){let e=new i;for(let t of this.#s){let n=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e){let t=u.get(e);return null!=t?t:NaN}(t);if(n>=41377&&n<=43774)n-=41377;else if(n>=45217&&n<=64254)n-=42657;else throw Error(`illegal hanzi character: ${t}`);n=(n>>8)*96+(255&n),e.append(n,13)}return e}}class A{#s;constructor(e){l(e),this.#s=e}get mode(){return t.KANJI}get content(){return this.#s}encode(){let e=new i;for(let t of this.#s){let n=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e){let t=f.get(e);return null!=t?t:NaN}(t);if(n>=33088&&n<=40956)n-=33088;else if(n>=57408&&n<=60351)n-=49472;else throw Error(`illegal kanji character: ${t}`);n=(n>>8)*192+(255&n),e.append(n,13)}return e}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class _{#s;#o;constructor(e,t=o.ISO_8859_1){l(e),function(e){if(!(e instanceof o))throw Error("illegal charset")}(t),this.#s=e,this.#o=t}get mode(){return t.BYTE}get content(){return this.#s}get charset(){return this.#o}encode(e){let t=new i;for(let n of e(this.#s,this.#o))t.append(n,8);return t}}function E(e,t,n){return 1===e.get(t,n)}function B(e,t){let n=0,{size:r}=e;for(let w=0;w<r;w++){let i=-1,s=0;for(let o=0;o<r;o++){let r=t?e.get(w,o):e.get(o,w);r===i?s++:(s>=5&&(n+=3+(s-5)),i=r,s=1)}s>=5&&(n+=3+(s-5))}return n}function S(e,t,n,r,w){if(n<0||r>e.size)return!1;for(let i=n;i<r;i++)if(w?E(e,t,i):E(e,i,t))return!1;return!0}function v(e){return B(e)+B(e,!0)+function(e){let t=0,n=e.size-1;for(let r=0;r<n;r++)for(let w=0;w<n;w++){let n=e.get(w,r);n===e.get(w+1,r)&&n===e.get(w,r+1)&&n===e.get(w+1,r+1)&&(t+=3)}return t}(e)+function(e){let t=0,{size:n}=e;for(let r=0;r<n;r++)for(let w=0;w<n;w++)w+6<n&&E(e,w,r)&&!E(e,w+1,r)&&E(e,w+2,r)&&E(e,w+3,r)&&E(e,w+4,r)&&!E(e,w+5,r)&&E(e,w+6,r)&&(S(e,r,w-4,w)||S(e,r,w+7,w+11))&&t++,r+6<n&&E(e,w,r)&&!E(e,w,r+1)&&E(e,w,r+2)&&E(e,w,r+3)&&E(e,w,r+4)&&!E(e,w,r+5)&&E(e,w,r+6)&&(S(e,w,r-4,r,!0)||S(e,w,r+7,r+11,!0))&&t++;return 40*t}(e)+function(e){let t=0,{size:n}=e;for(let r=0;r<n;r++)for(let w=0;w<n;w++)E(e,w,r)&&t++;let r=n*n;return(0|10*Math.abs(2*t-r)/r)*10}(e)}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class T{#l;#a;constructor(e){this.#l=e,this.#a=new Int8Array(e*e)}get size(){return this.#l}set(e,t,n){this.#a[t*this.#l+e]=n}get(e,t){return this.#a[t*this.#l+e]}clear(e){this.#a.fill(e)}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class O{#c;#h;constructor(e,t){this.#c=e,this.#h=t}get count(){return this.#c}get numDataCodewords(){return this.#h}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class z{#u;#f;#g;#d;#p;constructor(e,...t){let n=0,r=0;for(let{count:e,numDataCodewords:w}of t)n+=e,r+=w*e;let w=e*n;this.#u=t,this.#g=w,this.#d=r,this.#p=e,this.#f=r+w}get ecBlocks(){return this.#u}get numTotalCodewords(){return this.#f}get numTotalECCodewords(){return this.#g}get numTotalDataCodewords(){return this.#d}get numECCodewordsPerBlock(){return this.#p}}class M{#l;#b;#u;#y;constructor(e,t,...n){this.#b=e,this.#u=n,this.#l=17+4*e,this.#y=t}get size(){return this.#l}get version(){return this.#b}get alignmentPatterns(){return this.#y}getECBlocks(e){let{level:t}=e;return this.#u[t]}}let N=[new M(1,[],new z(7,new O(1,19)),new z(10,new O(1,16)),new z(13,new O(1,13)),new z(17,new O(1,9))),new M(2,[6,18],new z(10,new O(1,34)),new z(16,new O(1,28)),new z(22,new O(1,22)),new z(28,new O(1,16))),new M(3,[6,22],new z(15,new O(1,55)),new z(26,new O(1,44)),new z(18,new O(2,17)),new z(22,new O(2,13))),new M(4,[6,26],new z(20,new O(1,80)),new z(18,new O(2,32)),new z(26,new O(2,24)),new z(16,new O(4,9))),new M(5,[6,30],new z(26,new O(1,108)),new z(24,new O(2,43)),new z(18,new O(2,15),new O(2,16)),new z(22,new O(2,11),new O(2,12))),new M(6,[6,34],new z(18,new O(2,68)),new z(16,new O(4,27)),new z(24,new O(4,19)),new z(28,new O(4,15))),new M(7,[6,22,38],new z(20,new O(2,78)),new z(18,new O(4,31)),new z(18,new O(2,14),new O(4,15)),new z(26,new O(4,13),new O(1,14))),new M(8,[6,24,42],new z(24,new O(2,97)),new z(22,new O(2,38),new O(2,39)),new z(22,new O(4,18),new O(2,19)),new z(26,new O(4,14),new O(2,15))),new M(9,[6,26,46],new z(30,new O(2,116)),new z(22,new O(3,36),new O(2,37)),new z(20,new O(4,16),new O(4,17)),new z(24,new O(4,12),new O(4,13))),new M(10,[6,28,50],new z(18,new O(2,68),new O(2,69)),new z(26,new O(4,43),new O(1,44)),new z(24,new O(6,19),new O(2,20)),new z(28,new O(6,15),new O(2,16))),new M(11,[6,30,54],new z(20,new O(4,81)),new z(30,new O(1,50),new O(4,51)),new z(28,new O(4,22),new O(4,23)),new z(24,new O(3,12),new O(8,13))),new M(12,[6,32,58],new z(24,new O(2,92),new O(2,93)),new z(22,new O(6,36),new O(2,37)),new z(26,new O(4,20),new O(6,21)),new z(28,new O(7,14),new O(4,15))),new M(13,[6,34,62],new z(26,new O(4,107)),new z(22,new O(8,37),new O(1,38)),new z(24,new O(8,20),new O(4,21)),new z(22,new O(12,11),new O(4,12))),new M(14,[6,26,46,66],new z(30,new O(3,115),new O(1,116)),new z(24,new O(4,40),new O(5,41)),new z(20,new O(11,16),new O(5,17)),new z(24,new O(11,12),new O(5,13))),new M(15,[6,26,48,70],new z(22,new O(5,87),new O(1,88)),new z(24,new O(5,41),new O(5,42)),new z(30,new O(5,24),new O(7,25)),new z(24,new O(11,12),new O(7,13))),new M(16,[6,26,50,74],new z(24,new O(5,98),new O(1,99)),new z(28,new O(7,45),new O(3,46)),new z(24,new O(15,19),new O(2,20)),new z(30,new O(3,15),new O(13,16))),new M(17,[6,30,54,78],new z(28,new O(1,107),new O(5,108)),new z(28,new O(10,46),new O(1,47)),new z(28,new O(1,22),new O(15,23)),new z(28,new O(2,14),new O(17,15))),new M(18,[6,30,56,82],new z(30,new O(5,120),new O(1,121)),new z(26,new O(9,43),new O(4,44)),new z(28,new O(17,22),new O(1,23)),new z(28,new O(2,14),new O(19,15))),new M(19,[6,30,58,86],new z(28,new O(3,113),new O(4,114)),new z(26,new O(3,44),new O(11,45)),new z(26,new O(17,21),new O(4,22)),new z(26,new O(9,13),new O(16,14))),new M(20,[6,34,62,90],new z(28,new O(3,107),new O(5,108)),new z(26,new O(3,41),new O(13,42)),new z(30,new O(15,24),new O(5,25)),new z(28,new O(15,15),new O(10,16))),new M(21,[6,28,50,72,94],new z(28,new O(4,116),new O(4,117)),new z(26,new O(17,42)),new z(28,new O(17,22),new O(6,23)),new z(30,new O(19,16),new O(6,17))),new M(22,[6,26,50,74,98],new z(28,new O(2,111),new O(7,112)),new z(28,new O(17,46)),new z(30,new O(7,24),new O(16,25)),new z(24,new O(34,13))),new M(23,[6,30,54,78,102],new z(30,new O(4,121),new O(5,122)),new z(28,new O(4,47),new O(14,48)),new z(30,new O(11,24),new O(14,25)),new z(30,new O(16,15),new O(14,16))),new M(24,[6,28,54,80,106],new z(30,new O(6,117),new O(4,118)),new z(28,new O(6,45),new O(14,46)),new z(30,new O(11,24),new O(16,25)),new z(30,new O(30,16),new O(2,17))),new M(25,[6,32,58,84,110],new z(26,new O(8,106),new O(4,107)),new z(28,new O(8,47),new O(13,48)),new z(30,new O(7,24),new O(22,25)),new z(30,new O(22,15),new O(13,16))),new M(26,[6,30,58,86,114],new z(28,new O(10,114),new O(2,115)),new z(28,new O(19,46),new O(4,47)),new z(28,new O(28,22),new O(6,23)),new z(30,new O(33,16),new O(4,17))),new M(27,[6,34,62,90,118],new z(30,new O(8,122),new O(4,123)),new z(28,new O(22,45),new O(3,46)),new z(30,new O(8,23),new O(26,24)),new z(30,new O(12,15),new O(28,16))),new M(28,[6,26,50,74,98,122],new z(30,new O(3,117),new O(10,118)),new z(28,new O(3,45),new O(23,46)),new z(30,new O(4,24),new O(31,25)),new z(30,new O(11,15),new O(31,16))),new M(29,[6,30,54,78,102,126],new z(30,new O(7,116),new O(7,117)),new z(28,new O(21,45),new O(7,46)),new z(30,new O(1,23),new O(37,24)),new z(30,new O(19,15),new O(26,16))),new M(30,[6,26,52,78,104,130],new z(30,new O(5,115),new O(10,116)),new z(28,new O(19,47),new O(10,48)),new z(30,new O(15,24),new O(25,25)),new z(30,new O(23,15),new O(25,16))),new M(31,[6,30,56,82,108,134],new z(30,new O(13,115),new O(3,116)),new z(28,new O(2,46),new O(29,47)),new z(30,new O(42,24),new O(1,25)),new z(30,new O(23,15),new O(28,16))),new M(32,[6,34,60,86,112,138],new z(30,new O(17,115)),new z(28,new O(10,46),new O(23,47)),new z(30,new O(10,24),new O(35,25)),new z(30,new O(19,15),new O(35,16))),new M(33,[6,30,58,86,114,142],new z(30,new O(17,115),new O(1,116)),new z(28,new O(14,46),new O(21,47)),new z(30,new O(29,24),new O(19,25)),new z(30,new O(11,15),new O(46,16))),new M(34,[6,34,62,90,118,146],new z(30,new O(13,115),new O(6,116)),new z(28,new O(14,46),new O(23,47)),new z(30,new O(44,24),new O(7,25)),new z(30,new O(59,16),new O(1,17))),new M(35,[6,30,54,78,102,126,150],new z(30,new O(12,121),new O(7,122)),new z(28,new O(12,47),new O(26,48)),new z(30,new O(39,24),new O(14,25)),new z(30,new O(22,15),new O(41,16))),new M(36,[6,24,50,76,102,128,154],new z(30,new O(6,121),new O(14,122)),new z(28,new O(6,47),new O(34,48)),new z(30,new O(46,24),new O(10,25)),new z(30,new O(2,15),new O(64,16))),new M(37,[6,28,54,80,106,132,158],new z(30,new O(17,122),new O(4,123)),new z(28,new O(29,46),new O(14,47)),new z(30,new O(49,24),new O(10,25)),new z(30,new O(24,15),new O(46,16))),new M(38,[6,32,58,84,110,136,162],new z(30,new O(4,122),new O(18,123)),new z(28,new O(13,46),new O(32,47)),new z(30,new O(48,24),new O(14,25)),new z(30,new O(42,15),new O(32,16))),new M(39,[6,26,54,82,110,138,166],new z(30,new O(20,117),new O(4,118)),new z(28,new O(40,47),new O(7,48)),new z(30,new O(43,24),new O(22,25)),new z(30,new O(10,15),new O(67,16))),new M(40,[6,30,58,86,114,142,170],new z(30,new O(19,118),new O(6,119)),new z(28,new O(18,47),new O(31,48)),new z(30,new O(34,24),new O(34,25)),new z(30,new O(20,15),new O(61,16)))],k=[[1,1,1,1,1,1,1],[1,0,0,0,0,0,1],[1,0,1,1,1,0,1],[1,0,1,1,1,0,1],[1,0,1,1,1,0,1],[1,0,0,0,0,0,1],[1,1,1,1,1,1,1]],U=[[1,1,1,1,1],[1,0,0,0,1],[1,0,1,0,1],[1,0,0,0,1],[1,1,1,1,1]],D=[[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]];function x(e,t,n){return -1===e.get(t,n)}function P(e,t,n){for(let r=0;r<7;r++){let w=k[r];for(let i=0;i<7;i++)e.set(t+i,n+r,w[i])}}function L(e,t,n){for(let r=0;r<8;r++)e.set(t+r,n,0)}function R(e,t,n){for(let r=0;r<7;r++)e.set(t,n+r,0)}function F(e,t,n,w){let s=new T(t.size);return s.clear(-1),!function(e){let{size:t}=e;P(e,0,0),P(e,t-7,0),P(e,0,t-7),L(e,0,7),L(e,t-8,7),L(e,0,t-8),R(e,7,0),R(e,t-7-1,0),R(e,7,t-7)}(s),function(e,t){let{version:n}=t;if(n>=2){let{alignmentPatterns:t}=N[n-1],{length:r}=t;for(let n=0;n<r;n++){let w=t[n];for(let n=0;n<r;n++){let r=t[n];x(e,r,w)&&function(e,t,n){for(let r=0;r<5;r++){let w=U[r];for(let i=0;i<5;i++)e.set(t+i,n+r,w[i])}}(e,r-2,w-2)}}}}(s,t),function(e){let t=e.size-8;for(let n=8;n<t;n++){let t=n+1&1;x(e,n,6)&&e.set(n,6,t)}for(let n=8;n<t;n++){let t=n+1&1;x(e,6,n)&&e.set(6,n,t)}}(s),!function(e,t,n){let w=new i;!function(e,t,n){let w=t.bits<<3|n;e.append(w,5);let s=r(w,1335);e.append(s,10);let o=new i;o.append(21522,15),e.xor(o)}(w,t,n);let{size:s}=e,{length:o}=w;for(let t=0;t<o;t++){let[n,r]=D[t],i=w.get(o-1-t);e.set(n,r,i),t<8?e.set(s-t-1,8,i):e.set(8,s-7+(t-8),i)}!function(e){e.set(8,e.size-8,1)}(e)}(s,n,w),function(e,t){let{version:n}=t;if(n>=7){let t=new i;!function(e,t){e.append(t,6);let n=r(t,7973);e.append(n,12)}(t,n);let w=17,{size:s}=e;for(let n=0;n<6;n++)for(let r=0;r<3;r++){let i=t.get(w--);e.set(n,s-11+r,i),e.set(s-11+r,n,i)}}}(s,t),function(e,t,n){let r=0,{size:w}=e,{length:i}=t;for(let s=w-1;s>=1;s-=2){6===s&&(s=5);for(let o=0;o<w;o++)for(let l=0;l<2;l++){let a=s-l,c=(s+1&2)==0?w-1-o:o;if(x(e,a,c)){let w=0;r<i&&(w=t.get(r++)),function(e,t,n){let r,w;switch(e){case 0:w=n+t&1;break;case 1:w=1&n;break;case 2:w=t%3;break;case 3:w=(n+t)%3;break;case 4:w=(0|n/2)+(0|t/3)&1;break;case 5:w=(1&(r=n*t))+r%3;break;case 6:w=(1&(r=n*t))+r%3&1;break;case 7:w=n*t%3+(n+t&1)&1;break;default:throw Error(`illegal mask: ${e}`)}return 0===w}(n,a,c)&&(w^=1),e.set(a,c,w)}}}}(s,e,w),s}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class ${#I;#m;constructor(e,t){this.#I=t,this.#m=e}get ecCodewords(){return this.#I}get dataCodewords(){return this.#m}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class H{#C;#A;constructor(e,t){let{length:n}=t;if(n<=0)throw Error("polynomial coefficients cannot empty");if(this.#C=e,n>1&&0===t[0]){let e=1;for(;e<n&&0===t[e];)e++;if(e===n)this.#A=new Int32Array([0]);else{let r=new Int32Array(n-e);r.set(t.subarray(e)),this.#A=r}}else this.#A=t}get coefficients(){return this.#A}isZero(){return 0===this.#A[0]}getDegree(){return this.#A.length-1}getCoefficient(e){let t=this.#A;return t[t.length-1-e]}evaluate(e){let t;if(0===e)return this.getCoefficient(0);let n=this.#A;if(1===e){for(let e of(t=0,n))t^=e;return t}[t]=n;let r=this.#C,{length:w}=n;for(let i=1;i<w;i++)t=r.multiply(e,t)^n[i];return t}multiply(e){let t=this.#C,n=this.#A,{length:r}=n;if(e instanceof H){if(this.isZero()||e.isZero())return t.zero;let w=e.#A,i=w.length,s=new Int32Array(r+i-1);for(let e=0;e<r;e++){let r=n[e];for(let n=0;n<i;n++)s[e+n]^=t.multiply(r,w[n])}return new H(t,s)}if(0===e)return t.zero;if(1===e)return this;let w=new Int32Array(r);for(let i=0;i<r;i++)w[i]=t.multiply(n[i],e);return new H(t,w)}multiplyByMonomial(e,t){let n=this.#C;if(0===t)return n.zero;let r=this.#A,{length:w}=r,i=new Int32Array(w+e);for(let e=0;e<w;e++)i[e]=n.multiply(r[e],t);return new H(n,i)}addOrSubtract(e){if(this.isZero())return e;if(e.isZero())return this;let t=e.#A,n=t.length,r=this.#A,w=r.length;n<w&&([n,w]=[w,n],[t,r]=[r,t]);let i=n-w,s=new Int32Array(n);s.set(t.subarray(0,i));for(let e=i;e<n;e++)s[e]=r[e-i]^t[e];return new H(this.#C,s)}divide(e){let t=this.#C,n=t.zero,r=this,w=e.getCoefficient(e.getDegree()),i=t.invert(w);for(;r.getDegree()>=e.getDegree()&&!r.isZero();){let w=r.getDegree(),s=w-e.getDegree(),o=t.multiply(r.getCoefficient(w),i),l=e.multiplyByMonomial(s,o),a=t.buildPolynomial(s,o);n=n.addOrSubtract(a),r=r.addOrSubtract(l)}return[n,r]}}let Z=new /**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class{#l;#_;#E;#B;#S;#v;constructor(e,t,n){let r=1,w=new Int32Array(t);for(let n=0;n<t;n++)w[n]=r,(r*=2)>=t&&(r^=e,r&=t-1);let i=new Int32Array(t);for(let e=0,n=t-1;e<n;e++)i[w[e]]=e;this.#l=t,this.#S=w,this.#v=i,this.#B=n,this.#_=new H(this,new Int32Array([1])),this.#E=new H(this,new Int32Array([0]))}get size(){return this.#l}get one(){return this.#_}get zero(){return this.#E}get generator(){return this.#B}exp(e){return this.#S[e]}log(e){return this.#v[e]}invert(e){return this.#S[this.#l-this.#v[e]-1]}multiply(e,t){if(0===e||0===t)return 0;let n=this.#v;return this.#S[(n[e]+n[t])%(this.#l-1)]}buildPolynomial(e,t){if(0===t)return this.#E;let n=new Int32Array(e+1);return n[0]=t,new H(this,n)}}(285,256,0);class G{#C;#T;constructor(e=Z){this.#C=e,this.#T=[new H(e,new Int32Array([1]))]}encode(e,t){let n=e.length-t,r=new Int32Array(n),w=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t,n){let{length:r}=t;if(n>=r){let{generator:w}=e,i=t[r-1];for(let s=r;s<=n;s++){let n=new Int32Array([1,e.exp(s-1+w)]),r=i.multiply(new H(e,n));t.push(r),i=r}}return t[n]}(this.#C,this.#T,t);r.set(e.subarray(0,n));let[,i]=new H(this.#C,r).multiplyByMonomial(t,1).divide(w),{coefficients:s}=i,o=n+(t-s.length);e.fill(0,n,o),e.set(s,o)}}function j(e){return e.mode===t.BYTE}function K(e,t){e.append(t.bits,4)}function Y(e,t,n){return t.getECBlocks(n).numTotalDataCodewords>=Math.ceil(e/8)}function J(e,t){for(let n of N)if(Y(e,n,t))return n;throw Error("data too big for all versions")}function Q(e,t){let n=0;for(let{mode:r,head:w,data:i}of e)n+=w.length+r.getCharacterCountBits(t)+i.length;return n}class V{#O;#z;#e;#M;#l;#N;#k;constructor(e){let t=1<<e;this.#O=t,this.#z=t+1,this.#M=e,this.reset()}get bof(){return this.#O}get eof(){return this.#z}get bits(){return this.#e}get depth(){return this.#M}reset(){let e=this.#M+1;this.#e=e,this.#l=1<<e,this.#k=new Map,this.#N=this.#z+1}add(e,t){let n=this.#N;if(n>4095)return!1;this.#k.set(e<<8|t,n++);let r=this.#e,w=this.#l;return n>w&&(w=1<<++r),this.#e=r,this.#l=w,this.#N=n,!0}get(e,t){return this.#k.get(e<<8|t)}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class q{#e=0;#U;#D=0;#a=[];constructor(e){this.#U=e}write(e){let t=this.#e,n=this.#D|e<<t;t+=this.#U.bits;let r=this.#a;for(;t>=8;)r.push(255&n),n>>=8,t-=8;this.#e=t,this.#D=n}pipe(e){let t=this.#a;this.#e>0&&t.push(this.#D),e.writeByte(this.#U.depth);let{length:n}=t;for(let r=0;r<n;){let w=n-r;w>=255?(e.writeByte(255),e.writeBytes(t,r,255),r+=255):(e.writeByte(w),e.writeBytes(t,r,w),r=n)}e.writeByte(0)}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class W{#a=[];get bytes(){return this.#a}writeByte(e){this.#a.push(255&e)}writeInt16(e){this.#a.push(255&e,e>>8&255)}writeBytes(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:e.length,r=this.#a;for(let w=0;w<n;w++)r.push(255&e[t+w])}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let{fromCharCode:X}=String;function ee(e){if((e&=63)>=0){if(e<26)return 65+e;if(e<52)return 97+(e-26);if(e<62)return 48+(e-52);if(62===e)return 43;else if(63===e)return 47}throw Error(`illegal char: ${X(e)}`)}class et{#e=0;#D=0;#n=0;#x=new W;get bytes(){return this.#x.bytes}write(e){let t=this.#e+8,n=this.#x,r=this.#D<<8|255&e;for(;t>=6;)n.writeByte(ee(r>>>t-6)),t-=6;this.#n++,this.#e=t,this.#D=r}close(){let e=this.#e,t=this.#x;e>0&&(t.writeByte(ee(this.#D<<6-e)),this.#e=0,this.#D=0);let n=this.#n;if(n%3!=0){let e=3-n%3;for(let n=0;n<e;n++)t.writeByte(61)}}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class en{#P;#L;#R;#F;#$=[];constructor(e,t,{foreground:n=[0,0,0],background:r=[255,255,255]}={}){this.#P=e,this.#L=t,this.#R=n,this.#F=r}#H(){let e=this.#P,t=this.#L,n=new W,r=this.#F,w=this.#R;return n.writeBytes([71,73,70,56,57,97]),n.writeInt16(e),n.writeInt16(t),n.writeBytes([128,0,0]),n.writeBytes([r[0],r[1],r[2]]),n.writeBytes([w[0],w[1],w[2]]),n.writeByte(44),n.writeInt16(0),n.writeInt16(0),n.writeInt16(e),n.writeInt16(t),n.writeByte(0),!/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t,n){let r=new V(2),w=new q(r);if(w.write(r.bof),e.length>0){let t=e[0],{length:n}=e;for(let i=1;i<n;i++){let n=e[i],s=r.get(t,n);null!=s?t=s:(w.write(t),r.add(t,n)||(w.write(r.bof),r.reset()),t=n)}w.write(t)}w.write(r.eof),w.pipe(n)}(this.#$,0,n),n.writeByte(59),n.bytes}set(e,t,n){this.#$[t*this.#P+e]=n}toDataURL(){let e=this.#H(),t=new et;for(let n of e)t.write(n);t.close();let n=t.bytes,r="data:image/gif;base64,";for(let e of n)r+=X(e);return r}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class er{#Z;#G;#b;#j;constructor(e,t,n,r){this.#Z=r,this.#G=n,this.#j=e,this.#b=t}get size(){return this.#j.size}get mask(){return this.#Z}get level(){return this.#G.name}get version(){return this.#b.version}get(e,t){let{size:n}=this.#j;if(e<0||t<0||e>=n||t>=n)throw Error(`illegal coordinate: [${e}, ${t}]`);return this.#j.get(e,t)}toDataURL(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:2,{margin:t=4*e,...n}=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};e=Math.max(1,e>>0),t=Math.max(0,t>>0);let r=this.#j,w=e*r.size+2*t,i=new en(w,w,n),s=w-t;for(let n=0;n<w;n++)for(let o=0;o<w;o++)if(o>=t&&o<s&&n>=t&&n<s){let w=0|(o-t)/e,s=0|(n-t)/e;i.set(o,n,r.get(w,s))}else i.set(o,n,0);return i.toDataURL()}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let ew=new Map;class ei{#K;#e;#G;static L=new ei("L",0,1);static M=new ei("M",1,0);static Q=new ei("Q",2,3);static H=new ei("H",3,2);constructor(e,t,n){this.#e=n,this.#K=e,this.#G=t,ew.set(n,this)}get bits(){return this.#e}get name(){return this.#K}get level(){return this.#G}}function es(e,t){let n=[];for(let r of e){let e=r.charCodeAt(0);n.push(e>t?63:e)}return new Uint8Array(n)}function eo(e,t){switch(t){case o.GB2312:return(/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e){let t=[];for(let n of e){let e=u.get(n);e=null!=e?e:41919,t.push(e>>8&255,255&e)}return new Uint8Array(t)}(e));case o.ASCII:case o.ISO_646_INV:return es(e,127);case o.ISO_8859_1:return es(e,255);case o.UTF_8:return new TextEncoder().encode(e);default:throw Error(`built-in encode not support charset: ${t.label}`)}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class el{#Y;#G;#H;#b;constructor({hints:e={},level:t="L",version:n="Auto",encode:r=eo}={}){!function(e){let{fnc1:t}=e;if(null!=t){let[e]=t;if("GS1"!==e&&"AIM"!==e)throw Error("illegal fn1 hint");if("AIM"===e){let[,e]=t;if(e<0||e>255||!Number.isInteger(e))throw Error("illegal fn1 application indicator")}}}(e),function(e){if(0>["L","M","Q","H"].indexOf(e))throw Error("illegal error correction level")}(t),function(e){if("Auto"!==e&&(e<1||e>40||!Number.isInteger(e)))throw Error("illegal version")}(n),this.#Y=e,this.#H=r,this.#b=n,this.#G=ei[t]}encode(){let e;for(var n=arguments.length,r=Array(n),w=0;w<n;w++)r[w]=arguments[w];let s=this.#G,l=this.#H,{fnc1:a}=this.#Y,c=this.#b,h=[],u=!1,[f]=o.ISO_8859_1.values;for(let e of r){let{mode:n}=e,r=new i,w=e.encode(l),s=j(e)?w.byteLength:e.content.length;f=function(e,n,r){if(j(n)){let[w]=n.charset.values;if(w!==r)return e.append(t.ECI.bits,4),w<=127?e.append(w,8):w<=16383?e.append(32768|w,16):e.append(12582912|w,24),w}return r}(r,e,f),null==a||u||(u=!0,function(e,n){let[r,w]=n;switch(r){case"GS1":K(e,t.FNC1_FIRST_POSITION);break;case"AIM":K(e,t.FNC1_SECOND_POSITION),e.append(w,8)}}(r,a)),K(r,n),e.mode===t.HANZI&&r.append(1,4),h.push({mode:n,head:r,data:w,length:s})}if("Auto"===c)e=function(e,t){let n=J(Q(e,N[0]),t);return J(Q(e,n),t)}(h,s);else if(!Y(Q(h,e=N[c-1]),e,s))throw Error("data too big for requested version");let g=new i;for(let{mode:t,head:n,data:r,length:w}of h)g.append(n),function(e,t,n,r){e.append(r,t.getCharacterCountBits(n))}(g,t,e,w),g.append(r);let d=e.getECBlocks(s);!function(e,t){let n=8*t;for(let t=0;t<4&&e.length<n;t++)e.append(0);let r=7&e.length;if(r>0)for(let t=r;t<8;t++)e.append(0);let w=t-e.byteLength;for(let t=0;t<w;t++)e.append(1&t?17:236,8)}(g,d.numTotalDataCodewords);let[p,b]=function(e,t,n){let r=0,w=F(e,t,n,0),i=v(w);for(let s=1;s<8;s++){let o=F(e,t,n,s),l=v(o);l<i&&(r=s,w=o,i=l)}return[r,w]}(function(e,t){let{ecBlocks:n,numECCodewordsPerBlock:r}=t,w=0,s=0,o=0,l=[];for(let{count:t,numDataCodewords:i}of n)for(let n=0;n<t;n++){let t=new Uint8Array(i);e.toUint8Array(8*o,t,0,i);let n=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.1.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t){let n=e.length,r=new Int32Array(n+t);return r.set(e),new G().encode(r,t),new Uint8Array(r.subarray(n))}(t,r);l.push(new $(t,n)),o+=i,w=Math.max(w,n.length),s=Math.max(s,i)}let a=new i;for(let e=0;e<s;e++)for(let{dataCodewords:t}of l)e<t.length&&a.append(t[e],8);for(let e=0;e<w;e++)for(let{ecCodewords:t}of l)e<t.length&&a.append(t[e],8);return a}(g,d),e,s);return new er(b,e,s,p)}}function ea(e){let t=parseInt(e.slice(1,7),16);return[t>>16&255,t>>8&255,255&t]}self.addEventListener("message",e=>{let{data:t}=e,{level:n,version:r}=t,w=new el({level:n,version:r,hints:function(e){let{fnc1:t,aimIndicator:n}=e;switch(t){case"GS1":return{fnc1:["GS1"]};case"AIM":return{fnc1:["AIM",+n]}}}(t)});try{let e=w.encode(function(e){let{mode:t,content:n,charset:r}=e;switch(t){case"Auto":if(/^\d+$/.test(n))return new y(n);if(/^[0-9A-Z$%*+-./: ]+$/.test(n))return new m(n);let w=new C(n);try{return w.encode(),w}catch{}let i=new A(n);try{return i.encode(),i}catch{}return new _(n,o[r]);case"Hanzi":return new C(n);case"Kanji":return new A(n);case"Numeric":return new y(n);case"Alphanumeric":return new m(n);default:return new _(n,o[r])}}(t)),{moduleSize:n,quietZone:r,background:i,foreground:s}=t,l={type:"ok",payload:e.toDataURL(n,{margin:r,background:ea(i),foreground:ea(s)})};self.postMessage(l)}catch(t){let e={type:"error",message:t.message};self.postMessage(e)}})}();