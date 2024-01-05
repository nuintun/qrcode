!function(){"use strict";/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let e=new Map;class t{#e;#t;static TERMINATOR=new t([0,0,0],0);static NUMERIC=new t([10,12,14],1);static ALPHANUMERIC=new t([9,11,13],2);static STRUCTURED_APPEND=new t([0,0,0],3);static BYTE=new t([8,16,16],4);static ECI=new t([0,0,0],7);static KANJI=new t([8,10,12],8);static FNC1_FIRST_POSITION=new t([0,0,0],5);static FNC1_SECOND_POSITION=new t([0,0,0],9);static HANZI=new t([8,10,12],13);constructor(t,n){this.#e=n,this.#t=new Int32Array(t),e.set(n,this)}get bits(){return this.#e}getCharacterCountBits({version:e}){return this.#t[e<=9?0:e<=26?1:2]}}function n(e){return 32-Math.clz32(e)}function r(e,t){let r=n(t);for(e<<=r-1;n(e)>=r;)e^=t<<n(e)-r;return e}function w(e){return new Int32Array(Math.ceil(e/32))}class i{#n;#e;constructor(e=0){this.#n=e,this.#e=w(e)}#r(e){let t=this.#e;if(e>32*t.length){let n=w(Math.ceil(e/.75));n.set(t),this.#e=n}this.#n=e}get length(){return this.#n}get byteLength(){return Math.ceil(this.#n/8)}set(e){this.#e[0|e/32]|=1<<(31&e)}get(e){return this.#e[0|e/32]>>>(31&e)&1}xor(e){let t=this.#e,n=e.#e,r=Math.min(this.#n,e.#n);for(let e=0;e<r;e++)t[e]^=n[e]}append(e,t=1){let n=this.#n;if(e instanceof i){t=e.#n,this.#r(n+t);for(let r=0;r<t;r++)e.get(r)&&this.set(n),n++}else{this.#r(n+t);for(let r=t-1;r>=0;r--)e>>>r&1&&this.set(n),n++}}toUint8Array(e,t,n,r){for(let w=0;w<r;w++){let r=0;for(let t=0;t<8;t++)this.get(e++)&&(r|=1<<7-t);t[n+w]=r}}clear(){this.#e.fill(0)}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let s=new Map;class o{#w;#i;static CP437=new o("cp437",0,2);static ISO_8859_1=new o("iso-8859-1",1,3);static ISO_8859_2=new o("iso-8859-2",4);static ISO_8859_3=new o("iso-8859-3",5);static ISO_8859_4=new o("iso-8859-4",6);static ISO_8859_5=new o("iso-8859-5",7);static ISO_8859_6=new o("iso-8859-6",8);static ISO_8859_7=new o("iso-8859-7",9);static ISO_8859_8=new o("iso-8859-8",10);static ISO_8859_9=new o("iso-8859-9",11);static ISO_8859_10=new o("iso-8859-10",12);static ISO_8859_11=new o("iso-8859-11",13);static ISO_8859_13=new o("iso-8859-13",15);static ISO_8859_14=new o("iso-8859-14",16);static ISO_8859_15=new o("iso-8859-15",17);static ISO_8859_16=new o("iso-8859-16",18);static SJIS=new o("sjis",20);static CP1250=new o("cp1250",21);static CP1251=new o("cp1251",22);static CP1252=new o("cp1252",23);static CP1256=new o("cp1256",24);static UTF_16BE=new o("utf-16be",25);static UTF_8=new o("utf-8",26);static ASCII=new o("ascii",27,170);static BIG5=new o("big5",28);static GB18030=new o("gb18030",29);static EUC_KR=new o("euc-kr",30);constructor(e,...t){for(let n of(this.#w=e,this.#i=t,t))s.set(n,this)}get label(){return this.#w}get values(){return this.#i}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function l(e){if(!e)throw Error("segment content should be at least 1 character")}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function a(e,t){let n=[];for(let r of e){let e=r.charCodeAt(0);n.push(e>t?63:e)}return new Uint8Array(n)}function c(e,t){switch(t){case o.ASCII:return a(e,127);case o.ISO_8859_1:return a(e,255);case o.UTF_8:return new TextEncoder().encode(e);default:throw Error("built-in encode only support ascii, utf-8 and iso-8859-1 charset")}}let h="0123456789",u=`${h}ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:`;function f(e){let t=0,n=new Map;for(let r of e)n.set(r,t++);return n}function g(e,...t){let n=[],r=[],w=new Map,i=new TextDecoder(e,{fatal:!0});for(let[e,w]of t)for(let t=e;t<=w;t++)n.push(t>>8,255&t),r.push(t);let{length:s}=r,o=i.decode(new Uint8Array(n));for(let e=0;e<s;e++){let t=o.charAt(e);w.has(t)||w.set(t,r[e])}return w}function d(e,t,n,r=256){let w=n.length-1,i=[];for(let s=e;s<t;){for(let e=0;e<w;e+=2)i.push([s+n[e],s+n[e+1]]);s+=r}return i}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let p=f(h);function b(e){let t=p.get(e);if(null!=t)return t;throw Error(`illegal numeric character: ${e}`)}class y{#s;constructor(e){l(e),this.#s=e}get mode(){return t.NUMERIC}get content(){return this.#s}encode(){let e=new i,t=this.#s,{length:n}=t;for(let r=0;r<n;){let w=b(t.charAt(r));if(r+2<n){let n=b(t.charAt(r+1)),i=b(t.charAt(r+2));e.append(100*w+10*n+i,10),r+=3}else if(r+1<n){let n=b(t.charAt(r+1));e.append(10*w+n,7),r+=2}else e.append(w,4),r++}return e}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let I=f(u);function m(e){let t=I.get(e);if(null!=t)return t;throw Error(`illegal alphanumeric character: ${e}`)}class C{#s;constructor(e){l(e),this.#s=e}get mode(){return t.ALPHANUMERIC}get content(){return this.#s}encode(){let e=new i,t=this.#s,{length:n}=t;for(let r=0;r<n;){let w=m(t.charAt(r));if(r+1<n){let n=m(t.charAt(r+1));e.append(45*w+n,11),r+=2}else e.append(w,6),r++}return e}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let A=g("gb2312",[41377,41470],[41649,41698],[41701,41710],[41713,41724],[41889,41982],[42145,42227],[42401,42486],[42657,42680],[42689,42712],[42913,42945],[42961,42993],[43169,43194],[43205,43241],[43428,43503],...d(45217,55038,[0,93]),[55201,55289],...d(55457,63486,[0,93]));class _{#s;constructor(e){l(e),this.#s=e}get mode(){return t.HANZI}get content(){return this.#s}encode(){let e=new i;for(let t of this.#s){let n=function(e){let t=A.get(e);return null!=t?t:-1}(t);if(n>=41377&&n<=43774)n-=41377;else if(n>=45217&&n<=64254)n-=42657;else throw Error(`illegal hanzi character: ${t}`);n=(n>>8)*96+(255&n),e.append(n,13)}return e}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let E=g("shift-jis",[33088,33150],[33152,33196],[33208,33215],[33224,33230],[33242,33256],[33264,33271],[33276,33276],[33359,33368],[33376,33401],[33409,33434],[33439,33521],[33600,33662],[33664,33686],[33695,33718],[33727,33750],[33856,33888],[33904,33918],[33920,33937],[33951,33982],[34975,35068],...d(35136,38908,[0,62,64,188]),[38976,39026],[39071,39164],...d(39232,40956,[0,62,64,188]),...d(57408,59900,[0,62,64,188]),[59968,60030],[60032,60068]);class B{#s;constructor(e){l(e),this.#s=e}get mode(){return t.KANJI}get content(){return this.#s}encode(){let e=new i;for(let t of this.#s){let n=function(e){let t=E.get(e);return null!=t?t:-1}(t);if(n>=33088&&n<=40956)n-=33088;else if(n>=57408&&n<=60351)n-=49472;else throw Error(`illegal kanji character: ${t}`);n=(n>>8)*192+(255&n),e.append(n,13)}return e}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class S{#s;#o;constructor(e,t=o.ISO_8859_1){l(e),function(e){if(!(e instanceof o))throw Error("illegal charset")}(t),this.#s=e,this.#o=t}get mode(){return t.BYTE}get content(){return this.#s}get charset(){return this.#o}encode(e){let t=new i;for(let n of e(this.#s,this.#o))t.append(n,8);return t}}function T(e,t,n){return 1===e.get(t,n)}function M(e,t){let n=0,{size:r}=e;for(let w=0;w<r;w++){let i=-1,s=0;for(let o=0;o<r;o++){let r=t?e.get(w,o):e.get(o,w);r===i?s++:(s>=5&&(n+=3+(s-5)),i=r,s=1)}s>=5&&(n+=3+(s-5))}return n}function z(e,t,n,r,w){if(n<0||r>e.size)return!1;for(let i=n;i<r;i++)if(w?T(e,t,i):T(e,i,t))return!1;return!0}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class O{#l;#a;constructor(e,t){this.#l=e,this.#a=t}get count(){return this.#l}get numDataCodewords(){return this.#a}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class v{#c;#h;#u;#f;#g;constructor(e,...t){let n=0,r=0;for(let{count:e,numDataCodewords:w}of t)n+=e,r+=w*e;let w=e*n;this.#c=t,this.#u=w,this.#f=r,this.#g=e,this.#h=r+w}get ecBlocks(){return this.#c}get numTotalCodewords(){return this.#h}get numTotalECCodewords(){return this.#u}get numTotalDataCodewords(){return this.#f}get numECCodewordsPerBlock(){return this.#g}}class k{#d;#p;#c;#b;constructor(e,t,...n){this.#p=e,this.#c=n,this.#d=17+4*e,this.#b=t}get size(){return this.#d}get version(){return this.#p}get alignmentPatterns(){return this.#b}getECBlocks({level:e}){return this.#c[e]}}let N=[new k(1,[],new v(7,new O(1,19)),new v(10,new O(1,16)),new v(13,new O(1,13)),new v(17,new O(1,9))),new k(2,[6,18],new v(10,new O(1,34)),new v(16,new O(1,28)),new v(22,new O(1,22)),new v(28,new O(1,16))),new k(3,[6,22],new v(15,new O(1,55)),new v(26,new O(1,44)),new v(18,new O(2,17)),new v(22,new O(2,13))),new k(4,[6,26],new v(20,new O(1,80)),new v(18,new O(2,32)),new v(26,new O(2,24)),new v(16,new O(4,9))),new k(5,[6,30],new v(26,new O(1,108)),new v(24,new O(2,43)),new v(18,new O(2,15),new O(2,16)),new v(22,new O(2,11),new O(2,12))),new k(6,[6,34],new v(18,new O(2,68)),new v(16,new O(4,27)),new v(24,new O(4,19)),new v(28,new O(4,15))),new k(7,[6,22,38],new v(20,new O(2,78)),new v(18,new O(4,31)),new v(18,new O(2,14),new O(4,15)),new v(26,new O(4,13),new O(1,14))),new k(8,[6,24,42],new v(24,new O(2,97)),new v(22,new O(2,38),new O(2,39)),new v(22,new O(4,18),new O(2,19)),new v(26,new O(4,14),new O(2,15))),new k(9,[6,26,46],new v(30,new O(2,116)),new v(22,new O(3,36),new O(2,37)),new v(20,new O(4,16),new O(4,17)),new v(24,new O(4,12),new O(4,13))),new k(10,[6,28,50],new v(18,new O(2,68),new O(2,69)),new v(26,new O(4,43),new O(1,44)),new v(24,new O(6,19),new O(2,20)),new v(28,new O(6,15),new O(2,16))),new k(11,[6,30,54],new v(20,new O(4,81)),new v(30,new O(1,50),new O(4,51)),new v(28,new O(4,22),new O(4,23)),new v(24,new O(3,12),new O(8,13))),new k(12,[6,32,58],new v(24,new O(2,92),new O(2,93)),new v(22,new O(6,36),new O(2,37)),new v(26,new O(4,20),new O(6,21)),new v(28,new O(7,14),new O(4,15))),new k(13,[6,34,62],new v(26,new O(4,107)),new v(22,new O(8,37),new O(1,38)),new v(24,new O(8,20),new O(4,21)),new v(22,new O(12,11),new O(4,12))),new k(14,[6,26,46,66],new v(30,new O(3,115),new O(1,116)),new v(24,new O(4,40),new O(5,41)),new v(20,new O(11,16),new O(5,17)),new v(24,new O(11,12),new O(5,13))),new k(15,[6,26,48,70],new v(22,new O(5,87),new O(1,88)),new v(24,new O(5,41),new O(5,42)),new v(30,new O(5,24),new O(7,25)),new v(24,new O(11,12),new O(7,13))),new k(16,[6,26,50,74],new v(24,new O(5,98),new O(1,99)),new v(28,new O(7,45),new O(3,46)),new v(24,new O(15,19),new O(2,20)),new v(30,new O(3,15),new O(13,16))),new k(17,[6,30,54,78],new v(28,new O(1,107),new O(5,108)),new v(28,new O(10,46),new O(1,47)),new v(28,new O(1,22),new O(15,23)),new v(28,new O(2,14),new O(17,15))),new k(18,[6,30,56,82],new v(30,new O(5,120),new O(1,121)),new v(26,new O(9,43),new O(4,44)),new v(28,new O(17,22),new O(1,23)),new v(28,new O(2,14),new O(19,15))),new k(19,[6,30,58,86],new v(28,new O(3,113),new O(4,114)),new v(26,new O(3,44),new O(11,45)),new v(26,new O(17,21),new O(4,22)),new v(26,new O(9,13),new O(16,14))),new k(20,[6,34,62,90],new v(28,new O(3,107),new O(5,108)),new v(26,new O(3,41),new O(13,42)),new v(30,new O(15,24),new O(5,25)),new v(28,new O(15,15),new O(10,16))),new k(21,[6,28,50,72,94],new v(28,new O(4,116),new O(4,117)),new v(26,new O(17,42)),new v(28,new O(17,22),new O(6,23)),new v(30,new O(19,16),new O(6,17))),new k(22,[6,26,50,74,98],new v(28,new O(2,111),new O(7,112)),new v(28,new O(17,46)),new v(30,new O(7,24),new O(16,25)),new v(24,new O(34,13))),new k(23,[6,30,54,78,102],new v(30,new O(4,121),new O(5,122)),new v(28,new O(4,47),new O(14,48)),new v(30,new O(11,24),new O(14,25)),new v(30,new O(16,15),new O(14,16))),new k(24,[6,28,54,80,106],new v(30,new O(6,117),new O(4,118)),new v(28,new O(6,45),new O(14,46)),new v(30,new O(11,24),new O(16,25)),new v(30,new O(30,16),new O(2,17))),new k(25,[6,32,58,84,110],new v(26,new O(8,106),new O(4,107)),new v(28,new O(8,47),new O(13,48)),new v(30,new O(7,24),new O(22,25)),new v(30,new O(22,15),new O(13,16))),new k(26,[6,30,58,86,114],new v(28,new O(10,114),new O(2,115)),new v(28,new O(19,46),new O(4,47)),new v(28,new O(28,22),new O(6,23)),new v(30,new O(33,16),new O(4,17))),new k(27,[6,34,62,90,118],new v(30,new O(8,122),new O(4,123)),new v(28,new O(22,45),new O(3,46)),new v(30,new O(8,23),new O(26,24)),new v(30,new O(12,15),new O(28,16))),new k(28,[6,26,50,74,98,122],new v(30,new O(3,117),new O(10,118)),new v(28,new O(3,45),new O(23,46)),new v(30,new O(4,24),new O(31,25)),new v(30,new O(11,15),new O(31,16))),new k(29,[6,30,54,78,102,126],new v(30,new O(7,116),new O(7,117)),new v(28,new O(21,45),new O(7,46)),new v(30,new O(1,23),new O(37,24)),new v(30,new O(19,15),new O(26,16))),new k(30,[6,26,52,78,104,130],new v(30,new O(5,115),new O(10,116)),new v(28,new O(19,47),new O(10,48)),new v(30,new O(15,24),new O(25,25)),new v(30,new O(23,15),new O(25,16))),new k(31,[6,30,56,82,108,134],new v(30,new O(13,115),new O(3,116)),new v(28,new O(2,46),new O(29,47)),new v(30,new O(42,24),new O(1,25)),new v(30,new O(23,15),new O(28,16))),new k(32,[6,34,60,86,112,138],new v(30,new O(17,115)),new v(28,new O(10,46),new O(23,47)),new v(30,new O(10,24),new O(35,25)),new v(30,new O(19,15),new O(35,16))),new k(33,[6,30,58,86,114,142],new v(30,new O(17,115),new O(1,116)),new v(28,new O(14,46),new O(21,47)),new v(30,new O(29,24),new O(19,25)),new v(30,new O(11,15),new O(46,16))),new k(34,[6,34,62,90,118,146],new v(30,new O(13,115),new O(6,116)),new v(28,new O(14,46),new O(23,47)),new v(30,new O(44,24),new O(7,25)),new v(30,new O(59,16),new O(1,17))),new k(35,[6,30,54,78,102,126,150],new v(30,new O(12,121),new O(7,122)),new v(28,new O(12,47),new O(26,48)),new v(30,new O(39,24),new O(14,25)),new v(30,new O(22,15),new O(41,16))),new k(36,[6,24,50,76,102,128,154],new v(30,new O(6,121),new O(14,122)),new v(28,new O(6,47),new O(34,48)),new v(30,new O(46,24),new O(10,25)),new v(30,new O(2,15),new O(64,16))),new k(37,[6,28,54,80,106,132,158],new v(30,new O(17,122),new O(4,123)),new v(28,new O(29,46),new O(14,47)),new v(30,new O(49,24),new O(10,25)),new v(30,new O(24,15),new O(46,16))),new k(38,[6,32,58,84,110,136,162],new v(30,new O(4,122),new O(18,123)),new v(28,new O(13,46),new O(32,47)),new v(30,new O(48,24),new O(14,25)),new v(30,new O(42,15),new O(32,16))),new k(39,[6,26,54,82,110,138,166],new v(30,new O(20,117),new O(4,118)),new v(28,new O(40,47),new O(7,48)),new v(30,new O(43,24),new O(22,25)),new v(30,new O(10,15),new O(67,16))),new k(40,[6,30,58,86,114,142,170],new v(30,new O(19,118),new O(6,119)),new v(28,new O(18,47),new O(31,48)),new v(30,new O(34,24),new O(34,25)),new v(30,new O(20,15),new O(61,16)))],D=[[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]],x=[[1,1,1,1,1,1,1],[1,0,0,0,0,0,1],[1,0,1,1,1,0,1],[1,0,1,1,1,0,1],[1,0,1,1,1,0,1],[1,0,0,0,0,0,1],[1,1,1,1,1,1,1]],P=[[1,1,1,1,1],[1,0,0,0,1],[1,0,1,0,1],[1,0,0,0,1],[1,1,1,1,1]];function U(e,t,n){return -1===e.get(t,n)}function L(e,t,n){for(let r=0;r<7;r++){let w=x[r];for(let i=0;i<7;i++)e.set(t+i,n+r,w[i])}}function R(e,t,n){for(let r=0;r<8;r++)e.set(t+r,n,0)}function $(e,t,n){for(let r=0;r<7;r++)e.set(t,n+r,0)}function Z(e,t,n,w,s){e.clear(-1),function(e){let{size:t}=e;L(e,0,0),L(e,t-7,0),L(e,0,t-7),R(e,0,7),R(e,t-8,7),R(e,0,t-8),$(e,7,0),$(e,t-7-1,0),$(e,7,t-7)}(e),function(e){e.set(8,e.size-8,1)}(e),function(e,{version:t}){if(t>=2){let{alignmentPatterns:n}=N[t-1],{length:r}=n;for(let t=0;t<r;t++){let w=n[t];for(let t=0;t<r;t++){let r=n[t];U(e,r,w)&&function(e,t,n){for(let r=0;r<5;r++){let w=P[r];for(let i=0;i<5;i++)e.set(t+i,n+r,w[i])}}(e,r-2,w-2)}}}}(e,n),function(e){let t=e.size-8;for(let n=8;n<t;n++){let t=n+1&1;U(e,n,6)&&e.set(n,6,t)}for(let n=8;n<t;n++){let t=n+1&1;U(e,6,n)&&e.set(6,n,t)}}(e),function(e,t,n){let w=new i;!function(e,t,n){let w=t.bits<<3|n;e.append(w,5);let s=r(w,1335);e.append(s,10);let o=new i;o.append(21522,15),e.xor(o)}(w,t,n);let{size:s}=e,{length:o}=w;for(let t=0;t<o;t++){let[n,r]=D[t],i=w.get(o-1-t);e.set(n,r,i),t<8?e.set(s-t-1,8,i):e.set(8,s-7+(t-8),i)}}(e,w,s),function(e,{version:t}){if(t>=7){let n=new i;!function(e,t){e.append(t,6);let n=r(t,7973);e.append(n,12)}(n,t);let w=17,{size:s}=e;for(let t=0;t<6;t++)for(let r=0;r<3;r++){let i=n.get(w--);e.set(t,s-11+r,i),e.set(s-11+r,t,i)}}}(e,n),function(e,t,n){let r=0,{size:w}=e,{length:i}=t;for(let s=w-1;s>=1;s-=2){6===s&&(s=5);for(let o=0;o<w;o++)for(let l=0;l<2;l++){let a=s-l,c=(s+1&2)==0?w-1-o:o;if(U(e,a,c)){let w=0;r<i&&(w=t.get(r++)),function(e,t,n){let r,w;switch(e){case 0:w=n+t&1;break;case 1:w=1&n;break;case 2:w=t%3;break;case 3:w=(n+t)%3;break;case 4:w=(0|n/2)+(0|t/3)&1;break;case 5:w=(1&(r=n*t))+r%3;break;case 6:w=(1&(r=n*t))+r%3&1;break;case 7:w=n*t%3+(n+t&1)&1;break;default:throw Error(`illegal mask: ${e}`)}return 0===w}(n,a,c)&&(w^=1),e.set(a,c,w)}}}}(e,t,s)}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class F{#y;#I;constructor(e,t){this.#y=t,this.#I=e}get ecCodewords(){return this.#y}get dataCodewords(){return this.#I}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class H{#m;#C;constructor(e,t){let{length:n}=t;if(n<=0)throw Error("polynomial coefficients cannot empty");if(this.#m=e,n>1&&0===t[0]){let e=1;for(;e<n&&0===t[e];)e++;if(e===n)this.#C=new Int32Array([0]);else{let r=new Int32Array(n-e);r.set(t.subarray(e)),this.#C=r}}else this.#C=t}get coefficients(){return this.#C}isZero(){return 0===this.#C[0]}getDegree(){return this.#C.length-1}getCoefficient(e){let t=this.#C;return t[t.length-1-e]}evaluate(e){let t;if(0===e)return this.getCoefficient(0);let n=this.#C;if(1===e){for(let e of(t=0,n))t^=e;return t}[t]=n;let r=this.#m,{length:w}=n;for(let i=1;i<w;i++)t=r.multiply(e,t)^n[i];return t}multiply(e){let t=this.#m,n=this.#C,{length:r}=n;if(e instanceof H){if(this.isZero()||e.isZero())return t.zero;let w=e.#C,i=w.length,s=new Int32Array(r+i-1);for(let e=0;e<r;e++){let r=n[e];for(let n=0;n<i;n++)s[e+n]^=t.multiply(r,w[n])}return new H(t,s)}if(0===e)return t.zero;if(1===e)return this;let w=new Int32Array(r);for(let i=0;i<r;i++)w[i]=t.multiply(n[i],e);return new H(t,w)}multiplyByMonomial(e,t){let n=this.#m;if(0===t)return n.zero;let r=this.#C,{length:w}=r,i=new Int32Array(w+e);for(let e=0;e<w;e++)i[e]=n.multiply(r[e],t);return new H(n,i)}addOrSubtract(e){if(this.isZero())return e;if(e.isZero())return this;let t=e.#C,n=t.length,r=this.#C,w=r.length;n<w&&([n,w]=[w,n],[t,r]=[r,t]);let i=n-w,s=new Int32Array(n);s.set(t.subarray(0,i));for(let e=i;e<n;e++)s[e]=r[e-i]^t[e];return new H(this.#m,s)}divide(e){let t=this.#m,n=t.zero,r=this,w=e.getCoefficient(e.getDegree()),i=t.invert(w);for(;r.getDegree()>=e.getDegree()&&!r.isZero();){let w=r.getDegree(),s=w-e.getDegree(),o=t.multiply(r.getCoefficient(w),i),l=e.multiplyByMonomial(s,o),a=t.buildPolynomial(s,o);n=n.addOrSubtract(a),r=r.addOrSubtract(l)}return[n,r]}}let G=new /**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class{#d;#A;#_;#E;#B;#S;constructor(e,t,n){let r=1,w=new Int32Array(t);for(let n=0;n<t;n++)w[n]=r,(r*=2)>=t&&(r^=e,r&=t-1);let i=new Int32Array(t);for(let e=0,n=t-1;e<n;e++)i[w[e]]=e;this.#d=t,this.#B=w,this.#S=i,this.#E=n,this.#A=new H(this,new Int32Array([1])),this.#_=new H(this,new Int32Array([0]))}get size(){return this.#d}get one(){return this.#A}get zero(){return this.#_}get generator(){return this.#E}exp(e){return this.#B[e]}log(e){return this.#S[e]}invert(e){return this.#B[this.#d-this.#S[e]-1]}multiply(e,t){if(0===e||0===t)return 0;let n=this.#S;return this.#B[(n[e]+n[t])%(this.#d-1)]}buildPolynomial(e,t){if(0===t)return this.#_;let n=new Int32Array(e+1);return n[0]=t,new H(this,n)}}(285,256,0);class K{#m;#T;constructor(e=G){this.#m=e,this.#T=[new H(e,new Int32Array([1]))]}encode(e,t){let n=e.length-t,r=new Int32Array(n),w=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t,n){let{length:r}=t;if(n>=r){let{generator:w}=e,i=t[r-1];for(let s=r;s<=n;s++){let n=new Int32Array([1,e.exp(s-1+w)]),r=i.multiply(new H(e,n));t.push(r),i=r}}return t[n]}(this.#m,this.#T,t);r.set(e.subarray(0,n));let[,i]=new H(this.#m,r).multiplyByMonomial(t,1).divide(w),{coefficients:s}=i,o=n+(t-s.length);e.fill(0,n,o),e.set(s,o)}}function j(e){return e.mode===t.BYTE}function J(e,t){e.append(t.bits,4)}function Q(e,t,n){return t.getECBlocks(n).numTotalDataCodewords>=Math.ceil(e/8)}function Y(e,t){for(let n of N)if(Q(e,n,t))return n;throw Error("data too big for all versions")}function V(e,t){let n=0;for(let{mode:r,head:w,data:i}of e)n+=w.length+r.getCharacterCountBits(t)+i.length;return n}class X{#M;#z;#e;#O;#d;#v;#k;constructor(e){let t=1<<e;this.#M=t,this.#z=t+1,this.#O=e,this.reset()}get bof(){return this.#M}get eof(){return this.#z}get bits(){return this.#e}get depth(){return this.#O}reset(){let e=this.#O+1;this.#e=e,this.#d=1<<e,this.#k=new Map,this.#v=this.#z+1}add(e,t){let n=this.#v;if(n>4095)return!1;this.#k.set(e<<8|t,n++);let r=this.#e,w=this.#d;return n>w&&(w=1<<++r),this.#e=r,this.#d=w,this.#v=n,!0}get(e,t){return this.#k.get(e<<8|t)}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class q{#e=0;#N;#D=0;#x=[];constructor(e){this.#N=e}write(e){let t=this.#e,n=this.#D|e<<t;t+=this.#N.bits;let r=this.#x;for(;t>=8;)r.push(255&n),n>>=8,t-=8;this.#e=t,this.#D=n}pipe(e){let t=this.#x;this.#e>0&&t.push(this.#D),e.writeByte(this.#N.depth);let{length:n}=t;for(let r=0;r<n;){let w=n-r;w>=255?(e.writeByte(255),e.writeBytes(t,r,255),r+=255):(e.writeByte(w),e.writeBytes(t,r,w),r=n)}e.writeByte(0)}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class W{#x=[];get bytes(){return this.#x}writeByte(e){this.#x.push(255&e)}writeInt16(e){this.#x.push(255&e,e>>8&255)}writeBytes(e,t=0,n=e.length){let r=this.#x;for(let w=0;w<n;w++)r.push(255&e[t+w])}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let{fromCharCode:ee}=String;function et(e){if((e&=63)>=0){if(e<26)return 65+e;if(e<52)return 97+(e-26);if(e<62)return 48+(e-52);if(62===e)return 43;else if(63===e)return 47}throw Error(`illegal char: ${ee(e)}`)}class en{#e=0;#D=0;#n=0;#P=new W;get bytes(){return this.#P.bytes}write(e){let t=this.#e+8,n=this.#P,r=this.#D<<8|255&e;for(;t>=6;)n.writeByte(et(r>>>t-6)),t-=6;this.#n++,this.#e=t,this.#D=r}close(){let e=this.#e,t=this.#P;e>0&&(t.writeByte(et(this.#D<<6-e)),this.#e=0,this.#D=0);let n=this.#n;if(n%3!=0){let e=3-n%3;for(let n=0;n<e;n++)t.writeByte(61)}}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class er{#U;#L;#R;#$;#Z=[];constructor(e,t,{foreground:n=[0,0,0],background:r=[255,255,255]}={}){this.#U=e,this.#L=t,this.#R=n,this.#$=r}#F(){let e=this.#U,t=this.#L,n=new W,r=this.#$,w=this.#R;return n.writeBytes([71,73,70,56,57,97]),n.writeInt16(e),n.writeInt16(t),n.writeBytes([128,0,0]),n.writeBytes([r[0],r[1],r[2]]),n.writeBytes([w[0],w[1],w[2]]),n.writeByte(44),n.writeInt16(0),n.writeInt16(0),n.writeInt16(e),n.writeInt16(t),n.writeByte(0),!/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t,n){let r=new X(2),w=new q(r);if(w.write(r.bof),e.length>0){let t=e[0],{length:n}=e;for(let i=1;i<n;i++){let n=e[i],s=r.get(t,n);null!=s?t=s:(w.write(t),r.add(t,n)||(w.write(r.bof),r.reset()),t=n)}w.write(t)}w.write(r.eof),w.pipe(n)}(this.#Z,0,n),n.writeByte(59),n.bytes}set(e,t,n){this.#Z[t*this.#U+e]=n}toDataURL(){let e=this.#F(),t=new en;for(let n of e)t.write(n);t.close();let n=t.bytes,r="data:image/gif;base64,";for(let e of n)r+=ee(e);return r}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class ew{#H;#G;#p;#K;constructor(e,t,n,r){this.#H=r,this.#G=n,this.#K=e,this.#p=t}get size(){return this.#K.size}get mask(){return this.#H}get level(){return this.#G.name}get version(){return this.#p.version}get(e,t){let{size:n}=this.#K;if(e>=n||t>=n)throw Error(`illegal coordinate: [${e}, ${t}]`);return this.#K.get(e,t)}toDataURL(e=2,{margin:t=4*e,...n}={}){e=Math.max(1,e>>0),t=Math.max(0,t>>0);let r=this.#K,w=r.size,i=e*w+2*t,s=new er(i,i,n),o=i-t;for(let n=0;n<i;n++)for(let w=0;w<i;w++)if(w>=t&&w<o&&n>=t&&n<o){let i=0|(w-t)/e,o=0|(n-t)/e;s.set(w,n,r.get(i,o))}else s.set(w,n,0);return s.toDataURL()}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let ei=new Map;class es{#j;#e;#G;static L=new es("L",0,1);static M=new es("M",1,0);static Q=new es("Q",2,3);static H=new es("H",3,2);constructor(e,t,n){this.#e=n,this.#j=e,this.#G=t,ei.set(n,this)}get bits(){return this.#e}get name(){return this.#j}get level(){return this.#G}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class eo{#d;#x;constructor(e){this.#d=e,this.#x=new Int8Array(e*e)}get size(){return this.#d}set(e,t,n){this.#x[t*this.#d+e]=n}get(e,t){return this.#x[t*this.#d+e]}clear(e){this.#x.fill(e)}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class el{#J;#G;#F;#p;constructor({hints:e={},level:t="L",version:n="Auto",encode:r=c}={}){!function(e){let{fnc1:t}=e;if(null!=t){let[e]=t;if("GS1"!==e&&"AIM"!==e)throw Error("illegal fn1 hint");if("AIM"===e){let[,e]=t;if(e<0||e>255||!Number.isInteger(e))throw Error("illegal fn1 application indicator")}}}(e),function(e){if(0>["L","M","Q","H"].indexOf(e))throw Error("illegal error correction level")}(t),function(e){if("Auto"!==e&&(e<1||e>40||!Number.isInteger(e)))throw Error("illegal version")}(n),this.#J=e,this.#F=r,this.#p=n,this.#G=es[t]}encode(...e){let n;let r=this.#G,w=this.#F,{fnc1:s}=this.#J,l=this.#p,a=[],c=!1,[h]=o.ISO_8859_1.values;for(let n of e){let{mode:e}=n,r=new i,o=j(n),l=o?n.encode(w):n.encode(),u=o?l.byteLength:n.content.length;h=function(e,n,r){if(j(n)){let[w]=n.charset.values;if(w!==r)return e.append(t.ECI.bits,4),w<128?e.append(w,8):w<16384?(e.append(2,2),e.append(w,14)):(e.append(6,3),e.append(w,21)),w}return r}(r,n,h),null==s||c||(c=!0,function(e,n){let[r,w]=n;switch(r){case"GS1":J(e,t.FNC1_FIRST_POSITION);break;case"AIM":J(e,t.FNC1_SECOND_POSITION),e.append(w,8)}}(r,s)),J(r,e),n.mode===t.HANZI&&r.append(1,4),a.push({mode:e,head:r,data:l,length:u})}if("Auto"===l)n=function(e,t){let n=Y(V(e,N[0]),t);return Y(V(e,n),t)}(a,r);else if(!Q(V(a,n=N[l-1]),n,r))throw Error("data too big for requested version");let u=new i;for(let{mode:e,head:t,data:r,length:w}of a)u.append(t),function(e,t,n,r){e.append(r,t.getCharacterCountBits(n))}(u,e,n,w),u.append(r);let f=n.getECBlocks(r);!function(e,t){let n=8*t;for(let t=0;t<4&&e.length<n;t++)e.append(0);let r=7&e.length;if(r>0)for(let t=r;t<8;t++)e.append(0);let w=t-e.byteLength;for(let t=0;t<w;t++)e.append(1&t?17:236,8)}(u,f.numTotalDataCodewords);let g=new eo(n.size),d=function(e,{ecBlocks:t,numECCodewordsPerBlock:n}){let r=0,w=0,s=0,o=[];for(let{count:i,numDataCodewords:l}of t)for(let t=0;t<i;t++){let t=new Uint8Array(l);e.toUint8Array(8*s,t,0,l);let i=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 4.0.0
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t){let n=e.length,r=new Int32Array(n+t);return r.set(e),new K().encode(r,t),new Uint8Array(r.subarray(n))}(t,n);o.push(new F(t,i)),s+=l,r=Math.max(r,i.length),w=Math.max(w,l)}let l=new i;for(let e=0;e<w;e++)for(let{dataCodewords:t}of o)e<t.length&&l.append(t[e],8);for(let e=0;e<r;e++)for(let{ecCodewords:t}of o)e<t.length&&l.append(t[e],8);return l}(u,f),p=function(e,t,n,r){let w=-1,i=Number.MAX_VALUE;for(let o=0;o<8;o++){var s;Z(e,t,n,r,o);let l=M(s=e)+M(s,!0)+function(e){let t=0,n=e.size-1;for(let r=0;r<n;r++)for(let w=0;w<n;w++){let n=e.get(w,r);n===e.get(w+1,r)&&n===e.get(w,r+1)&&n===e.get(w+1,r+1)&&(t+=3)}return t}(s)+function(e){let t=0,{size:n}=e;for(let r=0;r<n;r++)for(let w=0;w<n;w++)w+6<n&&T(e,w,r)&&!T(e,w+1,r)&&T(e,w+2,r)&&T(e,w+3,r)&&T(e,w+4,r)&&!T(e,w+5,r)&&T(e,w+6,r)&&(z(e,r,w-4,w)||z(e,r,w+7,w+11))&&t++,r+6<n&&T(e,w,r)&&!T(e,w,r+1)&&T(e,w,r+2)&&T(e,w,r+3)&&T(e,w,r+4)&&!T(e,w,r+5)&&T(e,w,r+6)&&(z(e,w,r-4,r,!0)||z(e,w,r+7,r+11,!0))&&t++;return 40*t}(s)+function(e){let t=0,{size:n}=e;for(let r=0;r<n;r++)for(let w=0;w<n;w++)T(e,w,r)&&t++;let r=n*n;return(0|10*Math.abs(2*t-r)/r)*10}(s);l<i&&(w=o,i=l)}return w}(g,d,n,r);return Z(g,d,n,r,p),new ew(g,n,r,p)}}function ea(e){let t=parseInt(`0x${e.slice(1,7)}`);return[t>>16&255,t>>8&255,255&t]}self.addEventListener("message",({data:e})=>{let{level:t,version:n}=e,r=new el({level:t,version:n,hints:function({fnc1:e,aimIndicator:t}){switch(e){case"GS1":return{fnc1:["GS1"]};case"AIM":return{fnc1:["AIM",+t]}}}(e)});try{let t=r.encode(function({mode:e,content:t,charset:n}){switch(e){case"Auto":if(/^\d+$/.test(t))return new y(t);if(/^[0-9A-Z$%*+-./: ]+$/.test(t))return new C(t);let r=new _(t);try{return r.encode(),r}catch{}let w=new B(t);try{return w.encode(),w}catch{}return new S(t,o[n]);case"Hanzi":return new _(t);case"Kanji":return new B(t);case"Numeric":return new y(t);case"Alphanumeric":return new C(t);default:return new S(t,o[n])}}(e)),{moduleSize:n,quietZone:w,background:i,foreground:s}=e,l={type:"ok",payload:t.toDataURL(n,{margin:w,background:ea(i),foreground:ea(s)})};self.postMessage(l)}catch(t){let e={type:"error",message:t.message};self.postMessage(e)}})}();