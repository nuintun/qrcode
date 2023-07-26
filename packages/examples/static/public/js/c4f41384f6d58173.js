"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[179],{7284:function(e,t,n){var r=n(9980),w=n(2363),i=n(8492);/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let s=new Map;class o{#e;#t;static TERMINATOR=new o([0,0,0],0);static NUMERIC=new o([10,12,14],1);static ALPHANUMERIC=new o([9,11,13],2);static STRUCTURED_APPEND=new o([0,0,0],3);static BYTE=new o([8,16,16],4);static ECI=new o([0,0,0],7);static KANJI=new o([8,10,12],8);static FNC1_FIRST_POSITION=new o([0,0,0],5);static FNC1_SECOND_POSITION=new o([0,0,0],9);static HANZI=new o([8,10,12],13);constructor(e,t){this.#e=t,this.#t=new Int32Array(e),s.set(t,this)}get bits(){return this.#e}getCharacterCountBits(e){let{version:t}=e;return this.#t[t<=9?0:t<=26?1:2]}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class l{#n;#r;constructor(e,t){this.#n=e,this.#r=t}get count(){return this.#n}get numDataCodewords(){return this.#r}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class a{#w;#i;#s;#o;#l;constructor(e,...t){let n=0,r=0;for(let{count:e,numDataCodewords:w}of t)n+=e,r+=w*e;let w=e*n;this.#w=t,this.#s=w,this.#o=r,this.#l=e,this.#i=r+w}get ecBlocks(){return this.#w}get numTotalCodewords(){return this.#i}get numTotalECCodewords(){return this.#s}get numTotalDataCodewords(){return this.#o}get numECCodewordsPerBlock(){return this.#l}}class h{#a;#h;#w;#c;constructor(e,t,...n){this.#h=e,this.#w=n,this.#a=17+4*e,this.#c=t}get size(){return this.#a}get version(){return this.#h}get alignmentPatterns(){return this.#c}getECBlocks(e){let{level:t}=e;return this.#w[t]}}let c=[new h(1,[],new a(7,new l(1,19)),new a(10,new l(1,16)),new a(13,new l(1,13)),new a(17,new l(1,9))),new h(2,[6,18],new a(10,new l(1,34)),new a(16,new l(1,28)),new a(22,new l(1,22)),new a(28,new l(1,16))),new h(3,[6,22],new a(15,new l(1,55)),new a(26,new l(1,44)),new a(18,new l(2,17)),new a(22,new l(2,13))),new h(4,[6,26],new a(20,new l(1,80)),new a(18,new l(2,32)),new a(26,new l(2,24)),new a(16,new l(4,9))),new h(5,[6,30],new a(26,new l(1,108)),new a(24,new l(2,43)),new a(18,new l(2,15),new l(2,16)),new a(22,new l(2,11),new l(2,12))),new h(6,[6,34],new a(18,new l(2,68)),new a(16,new l(4,27)),new a(24,new l(4,19)),new a(28,new l(4,15))),new h(7,[6,22,38],new a(20,new l(2,78)),new a(18,new l(4,31)),new a(18,new l(2,14),new l(4,15)),new a(26,new l(4,13),new l(1,14))),new h(8,[6,24,42],new a(24,new l(2,97)),new a(22,new l(2,38),new l(2,39)),new a(22,new l(4,18),new l(2,19)),new a(26,new l(4,14),new l(2,15))),new h(9,[6,26,46],new a(30,new l(2,116)),new a(22,new l(3,36),new l(2,37)),new a(20,new l(4,16),new l(4,17)),new a(24,new l(4,12),new l(4,13))),new h(10,[6,28,50],new a(18,new l(2,68),new l(2,69)),new a(26,new l(4,43),new l(1,44)),new a(24,new l(6,19),new l(2,20)),new a(28,new l(6,15),new l(2,16))),new h(11,[6,30,54],new a(20,new l(4,81)),new a(30,new l(1,50),new l(4,51)),new a(28,new l(4,22),new l(4,23)),new a(24,new l(3,12),new l(8,13))),new h(12,[6,32,58],new a(24,new l(2,92),new l(2,93)),new a(22,new l(6,36),new l(2,37)),new a(26,new l(4,20),new l(6,21)),new a(28,new l(7,14),new l(4,15))),new h(13,[6,34,62],new a(26,new l(4,107)),new a(22,new l(8,37),new l(1,38)),new a(24,new l(8,20),new l(4,21)),new a(22,new l(12,11),new l(4,12))),new h(14,[6,26,46,66],new a(30,new l(3,115),new l(1,116)),new a(24,new l(4,40),new l(5,41)),new a(20,new l(11,16),new l(5,17)),new a(24,new l(11,12),new l(5,13))),new h(15,[6,26,48,70],new a(22,new l(5,87),new l(1,88)),new a(24,new l(5,41),new l(5,42)),new a(30,new l(5,24),new l(7,25)),new a(24,new l(11,12),new l(7,13))),new h(16,[6,26,50,74],new a(24,new l(5,98),new l(1,99)),new a(28,new l(7,45),new l(3,46)),new a(24,new l(15,19),new l(2,20)),new a(30,new l(3,15),new l(13,16))),new h(17,[6,30,54,78],new a(28,new l(1,107),new l(5,108)),new a(28,new l(10,46),new l(1,47)),new a(28,new l(1,22),new l(15,23)),new a(28,new l(2,14),new l(17,15))),new h(18,[6,30,56,82],new a(30,new l(5,120),new l(1,121)),new a(26,new l(9,43),new l(4,44)),new a(28,new l(17,22),new l(1,23)),new a(28,new l(2,14),new l(19,15))),new h(19,[6,30,58,86],new a(28,new l(3,113),new l(4,114)),new a(26,new l(3,44),new l(11,45)),new a(26,new l(17,21),new l(4,22)),new a(26,new l(9,13),new l(16,14))),new h(20,[6,34,62,90],new a(28,new l(3,107),new l(5,108)),new a(26,new l(3,41),new l(13,42)),new a(30,new l(15,24),new l(5,25)),new a(28,new l(15,15),new l(10,16))),new h(21,[6,28,50,72,94],new a(28,new l(4,116),new l(4,117)),new a(26,new l(17,42)),new a(28,new l(17,22),new l(6,23)),new a(30,new l(19,16),new l(6,17))),new h(22,[6,26,50,74,98],new a(28,new l(2,111),new l(7,112)),new a(28,new l(17,46)),new a(30,new l(7,24),new l(16,25)),new a(24,new l(34,13))),new h(23,[6,30,54,78,102],new a(30,new l(4,121),new l(5,122)),new a(28,new l(4,47),new l(14,48)),new a(30,new l(11,24),new l(14,25)),new a(30,new l(16,15),new l(14,16))),new h(24,[6,28,54,80,106],new a(30,new l(6,117),new l(4,118)),new a(28,new l(6,45),new l(14,46)),new a(30,new l(11,24),new l(16,25)),new a(30,new l(30,16),new l(2,17))),new h(25,[6,32,58,84,110],new a(26,new l(8,106),new l(4,107)),new a(28,new l(8,47),new l(13,48)),new a(30,new l(7,24),new l(22,25)),new a(30,new l(22,15),new l(13,16))),new h(26,[6,30,58,86,114],new a(28,new l(10,114),new l(2,115)),new a(28,new l(19,46),new l(4,47)),new a(28,new l(28,22),new l(6,23)),new a(30,new l(33,16),new l(4,17))),new h(27,[6,34,62,90,118],new a(30,new l(8,122),new l(4,123)),new a(28,new l(22,45),new l(3,46)),new a(30,new l(8,23),new l(26,24)),new a(30,new l(12,15),new l(28,16))),new h(28,[6,26,50,74,98,122],new a(30,new l(3,117),new l(10,118)),new a(28,new l(3,45),new l(23,46)),new a(30,new l(4,24),new l(31,25)),new a(30,new l(11,15),new l(31,16))),new h(29,[6,30,54,78,102,126],new a(30,new l(7,116),new l(7,117)),new a(28,new l(21,45),new l(7,46)),new a(30,new l(1,23),new l(37,24)),new a(30,new l(19,15),new l(26,16))),new h(30,[6,26,52,78,104,130],new a(30,new l(5,115),new l(10,116)),new a(28,new l(19,47),new l(10,48)),new a(30,new l(15,24),new l(25,25)),new a(30,new l(23,15),new l(25,16))),new h(31,[6,30,56,82,108,134],new a(30,new l(13,115),new l(3,116)),new a(28,new l(2,46),new l(29,47)),new a(30,new l(42,24),new l(1,25)),new a(30,new l(23,15),new l(28,16))),new h(32,[6,34,60,86,112,138],new a(30,new l(17,115)),new a(28,new l(10,46),new l(23,47)),new a(30,new l(10,24),new l(35,25)),new a(30,new l(19,15),new l(35,16))),new h(33,[6,30,58,86,114,142],new a(30,new l(17,115),new l(1,116)),new a(28,new l(14,46),new l(21,47)),new a(30,new l(29,24),new l(19,25)),new a(30,new l(11,15),new l(46,16))),new h(34,[6,34,62,90,118,146],new a(30,new l(13,115),new l(6,116)),new a(28,new l(14,46),new l(23,47)),new a(30,new l(44,24),new l(7,25)),new a(30,new l(59,16),new l(1,17))),new h(35,[6,30,54,78,102,126,150],new a(30,new l(12,121),new l(7,122)),new a(28,new l(12,47),new l(26,48)),new a(30,new l(39,24),new l(14,25)),new a(30,new l(22,15),new l(41,16))),new h(36,[6,24,50,76,102,128,154],new a(30,new l(6,121),new l(14,122)),new a(28,new l(6,47),new l(34,48)),new a(30,new l(46,24),new l(10,25)),new a(30,new l(2,15),new l(64,16))),new h(37,[6,28,54,80,106,132,158],new a(30,new l(17,122),new l(4,123)),new a(28,new l(29,46),new l(14,47)),new a(30,new l(49,24),new l(10,25)),new a(30,new l(24,15),new l(46,16))),new h(38,[6,32,58,84,110,136,162],new a(30,new l(4,122),new l(18,123)),new a(28,new l(13,46),new l(32,47)),new a(30,new l(48,24),new l(14,25)),new a(30,new l(42,15),new l(32,16))),new h(39,[6,26,54,82,110,138,166],new a(30,new l(20,117),new l(4,118)),new a(28,new l(40,47),new l(7,48)),new a(30,new l(43,24),new l(22,25)),new a(30,new l(10,15),new l(67,16))),new h(40,[6,30,58,86,114,142,170],new a(30,new l(19,118),new l(6,119)),new a(28,new l(18,47),new l(31,48)),new a(30,new l(34,24),new l(34,25)),new a(30,new l(20,15),new l(61,16)))];function u(e){return 32-Math.clz32(e)}function f(e,t){let n=u(t);for(e<<=n-1;u(e)>=n;)e^=t<<u(e)-n;return e}function d(e,t,n){return 1===e.get(t,n)}function g(e,t){let n=0,{size:r}=e;for(let w=0;w<r;w++){let i=-1,s=0;for(let o=0;o<r;o++){let r=t?e.get(w,o):e.get(o,w);r===i?s++:(s>=5&&(n+=3+(s-5)),i=r,s=1)}s>=5&&(n+=3+(s-5))}return n}function p(e,t,n,r,w){if(n<0||r>e.size)return!1;for(let i=n;i<r;i++)if(w?d(e,t,i):d(e,i,t))return!1;return!0}function b(e){return new Int32Array(Math.ceil(e/32))}class y{#u;#e;constructor(e=0){this.#u=e,this.#e=b(e)}#f(e){let t=this.#e;if(e>32*t.length){let n=b(Math.ceil(e/.75));n.set(t),this.#e=n}this.#u=e}get length(){return this.#u}get byteLength(){return Math.ceil(this.#u/8)}set(e){this.#e[0|e/32]|=1<<(31&e)}get(e){return this.#e[0|e/32]>>>(31&e)&1}xor(e){let t=this.#e,n=e.#e,r=Math.min(this.#u,e.#u);for(let e=0;e<r;e++)t[e]^=n[e]}append(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1,n=this.#u;if(e instanceof y){t=e.#u,this.#f(n+t);for(let r=0;r<t;r++)e.get(r)&&this.set(n),n++}else{this.#f(n+t);for(let r=t-1;r>=0;r--)e>>>r&1&&this.set(n),n++}}toUint8Array(e,t,n,r){for(let w=0;w<r;w++){let r=0;for(let t=0;t<8;t++)this.get(e++)&&(r|=1<<7-t);t[n+w]=r}}clear(){this.#e.fill(0)}}let m=[[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]],I=[[1,1,1,1,1,1,1],[1,0,0,0,0,0,1],[1,0,1,1,1,0,1],[1,0,1,1,1,0,1],[1,0,1,1,1,0,1],[1,0,0,0,0,0,1],[1,1,1,1,1,1,1]],C=[[1,1,1,1,1],[1,0,0,0,1],[1,0,1,0,1],[1,0,0,0,1],[1,1,1,1,1]];function _(e,t,n){return -1===e.get(t,n)}function v(e,t,n){for(let r=0;r<7;r++){let w=I[r];for(let i=0;i<7;i++)e.set(t+i,n+r,w[i])}}function A(e,t,n){for(let r=0;r<8;r++)e.set(t+r,n,0)}function B(e,t,n){for(let r=0;r<7;r++)e.set(t,n+r,0)}function S(e,t,n,r,w){e.clear(-1),function(e){let{size:t}=e;v(e,0,0),v(e,t-7,0),v(e,0,t-7),A(e,0,7),A(e,t-8,7),A(e,0,t-8),B(e,7,0),B(e,t-7-1,0),B(e,7,t-7)}(e),function(e){e.set(8,e.size-8,1)}(e),function(e,t){let{version:n}=t;if(n>=2){let{alignmentPatterns:t}=c[n-1],{length:r}=t;for(let n=0;n<r;n++){let w=t[n];for(let n=0;n<r;n++){let r=t[n];_(e,r,w)&&function(e,t,n){for(let r=0;r<5;r++){let w=C[r];for(let i=0;i<5;i++)e.set(t+i,n+r,w[i])}}(e,r-2,w-2)}}}}(e,n),function(e){let t=e.size-8;for(let n=8;n<t;n++){let t=n+1&1;_(e,n,6)&&e.set(n,6,t)}for(let n=8;n<t;n++){let t=n+1&1;_(e,6,n)&&e.set(6,n,t)}}(e),function(e,t,n){let r=new y;!function(e,t,n){let r=t.bits<<3|n;e.append(r,5);let w=f(r,1335);e.append(w,10);let i=new y;i.append(21522,15),e.xor(i)}(r,t,n);let{size:w}=e,{length:i}=r;for(let t=0;t<i;t++){let[n,s]=m[t],o=r.get(i-1-t);e.set(n,s,o),t<8?e.set(w-t-1,8,o):e.set(8,w-7+(t-8),o)}}(e,r,w),function(e,t){let{version:n}=t;if(n>=7){let t=new y;!function(e,t){e.append(t,6);let n=f(t,7973);e.append(n,12)}(t,n);let r=17,{size:w}=e;for(let n=0;n<6;n++)for(let i=0;i<3;i++){let s=t.get(r--);e.set(n,w-11+i,s),e.set(w-11+i,n,s)}}}(e,n),function(e,t,n){let r=0,{size:w}=e,{length:i}=t;for(let s=w-1;s>=1;s-=2){6===s&&(s=5);for(let o=0;o<w;o++)for(let l=0;l<2;l++){let a=s-l,h=(s+1&2)==0,c=h?w-1-o:o;if(_(e,a,c)){let w=0;r<i&&(w=t.get(r++)),function(e,t,n){let r,w;switch(e){case 0:w=n+t&1;break;case 1:w=1&n;break;case 2:w=t%3;break;case 3:w=(n+t)%3;break;case 4:w=(0|n/2)+(0|t/3)&1;break;case 5:w=(1&(r=n*t))+r%3;break;case 6:w=(1&(r=n*t))+r%3&1;break;case 7:w=n*t%3+(n+t&1)&1;break;default:throw Error(`illegal mask: ${e}`)}return 0===w}(n,a,c)&&(w^=1),e.set(a,c,w)}}}}(e,t,w)}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class E{#d;#g;constructor(e,t){this.#d=t,this.#g=e}get ecCodewords(){return this.#d}get dataCodewords(){return this.#g}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class T{#p;#b;constructor(e,t){let{length:n}=t;if(n<=0)throw Error("polynomial coefficients cannot empty");if(this.#p=e,n>1&&0===t[0]){let e=1;for(;e<n&&0===t[e];)e++;if(e===n)this.#b=new Int32Array([0]);else{let r=new Int32Array(n-e);r.set(t.subarray(e)),this.#b=r}}else this.#b=t}get coefficients(){return this.#b}isZero(){return 0===this.#b[0]}getDegree(){return this.#b.length-1}getCoefficient(e){let t=this.#b;return t[t.length-1-e]}evaluate(e){let t;if(0===e)return this.getCoefficient(0);let n=this.#b;if(1===e){for(let e of(t=0,n))t^=e;return t}[t]=n;let r=this.#p,{length:w}=n;for(let i=1;i<w;i++)t=r.multiply(e,t)^n[i];return t}multiply(e){let t=this.#p,n=this.#b,{length:r}=n;if(e instanceof T){if(this.isZero()||e.isZero())return t.zero;let w=e.#b,i=w.length,s=new Int32Array(r+i-1);for(let e=0;e<r;e++){let r=n[e];for(let n=0;n<i;n++)s[e+n]^=t.multiply(r,w[n])}return new T(t,s)}if(0===e)return t.zero;if(1===e)return this;let w=new Int32Array(r);for(let i=0;i<r;i++)w[i]=t.multiply(n[i],e);return new T(t,w)}multiplyByMonomial(e,t){let n=this.#p;if(0===t)return n.zero;let r=this.#b,{length:w}=r,i=new Int32Array(w+e);for(let e=0;e<w;e++)i[e]=n.multiply(r[e],t);return new T(n,i)}addOrSubtract(e){if(this.isZero())return e;if(e.isZero())return this;let t=e.#b,n=t.length,r=this.#b,w=r.length;n<w&&([n,w]=[w,n],[t,r]=[r,t]);let i=n-w,s=new Int32Array(n);s.set(t.subarray(0,i));for(let e=i;e<n;e++)s[e]=r[e-i]^t[e];return new T(this.#p,s)}divide(e){let t=this.#p,n=t.zero,r=this,w=e.getCoefficient(e.getDegree()),i=t.invert(w);for(;r.getDegree()>=e.getDegree()&&!r.isZero();){let w=r.getDegree(),s=w-e.getDegree(),o=t.multiply(r.getCoefficient(w),i),l=e.multiplyByMonomial(s,o),a=t.buildPolynomial(s,o);n=n.addOrSubtract(a),r=r.addOrSubtract(l)}return[n,r]}}let k=new /**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class{#a;#y;#m;#I;#C;#_;constructor(e,t,n){let r=1,w=new Int32Array(t);for(let n=0;n<t;n++)w[n]=r,(r*=2)>=t&&(r^=e,r&=t-1);let i=new Int32Array(t);for(let e=0,n=t-1;e<n;e++)i[w[e]]=e;this.#a=t,this.#C=w,this.#_=i,this.#I=n,this.#y=new T(this,new Int32Array([1])),this.#m=new T(this,new Int32Array([0]))}get size(){return this.#a}get one(){return this.#y}get zero(){return this.#m}get generator(){return this.#I}exp(e){return this.#C[e]}log(e){return this.#_[e]}invert(e){return this.#C[this.#a-this.#_[e]-1]}multiply(e,t){if(0===e||0===t)return 0;let n=this.#_;return this.#C[(n[e]+n[t])%(this.#a-1)]}buildPolynomial(e,t){if(0===t)return this.#m;let n=new Int32Array(e+1);return n[0]=t,new T(this,n)}}(285,256,0);class O{#p;#v;constructor(e=k){this.#p=e,this.#v=[new T(e,new Int32Array([1]))]}encode(e,t){let n=e.length-t,r=new Int32Array(n),w=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t,n){let{length:r}=t;if(n>=r){let{generator:w}=e,i=t[r-1];for(let s=r;s<=n;s++){let n=new Int32Array([1,e.exp(s-1+w)]),r=i.multiply(new T(e,n));t.push(r),i=r}}return t[n]}(this.#p,this.#v,t);r.set(e.subarray(0,n));let i=new T(this.#p,r),s=i.multiplyByMonomial(t,1),[,o]=s.divide(w),{coefficients:l}=o,a=t-l.length,h=n+a;e.fill(0,n,h),e.set(l,h)}}function x(e){return e.mode===o.BYTE}function z(e,t){e.append(t.bits,4)}function M(e,t,n){let r=t.getECBlocks(n);return r.numTotalDataCodewords>=Math.ceil(e/8)}function D(e,t){for(let n of c)if(M(e,n,t))return n;throw Error("data too big for all versions")}function P(e,t){let n=0;for(let{mode:r,head:w,data:i}of e)n+=w.length+r.getCharacterCountBits(t)+i.length;return n}class N{#A;#B;#e;#S;#a;#E;#T;constructor(e){let t=1<<e;this.#A=t,this.#B=t+1,this.#S=e,this.reset()}get bof(){return this.#A}get eof(){return this.#B}get bits(){return this.#e}get depth(){return this.#S}reset(){let e=this.#S+1;this.#e=e,this.#a=1<<e,this.#T=new Map,this.#E=this.#B+1}add(e,t){let n=this.#E;if(n>4095)return!1;this.#T.set(e<<8|t,n++);let r=this.#e,w=this.#a;return n>w&&(w=1<<++r),this.#e=r,this.#a=w,this.#E=n,!0}get(e,t){return this.#T.get(e<<8|t)}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class U{#e=0;#k;#O=0;#x=[];constructor(e){this.#k=e}write(e){let t=this.#e,n=this.#O|e<<t;t+=this.#k.bits;let r=this.#x;for(;t>=8;)r.push(255&n),n>>=8,t-=8;this.#e=t,this.#O=n}pipe(e){let t=this.#x;this.#e>0&&t.push(this.#O),e.writeByte(this.#k.depth);let{length:n}=t;for(let r=0;r<n;){let w=n-r;w>=255?(e.writeByte(255),e.writeBytes(t,r,255),r+=255):(e.writeByte(w),e.writeBytes(t,r,w),r=n)}e.writeByte(0)}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class Z{#x=[];get bytes(){return this.#x}writeByte(e){this.#x.push(255&e)}writeInt16(e){this.#x.push(255&e,e>>8&255)}writeBytes(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:e.length,r=this.#x;for(let w=0;w<n;w++)r.push(255&e[t+w])}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let{fromCharCode:L}=String;function R(e){if((e&=63)>=0){if(e<26)return 65+e;if(e<52)return 97+(e-26);if(e<62)return 48+(e-52);if(62===e)return 43;else if(63===e)return 47}throw Error(`illegal char: ${L(e)}`)}class j{#e=0;#O=0;#u=0;#z=new Z;get bytes(){return this.#z.bytes}write(e){let t=this.#e+8,n=this.#z,r=this.#O<<8|255&e;for(;t>=6;)n.writeByte(R(r>>>t-6)),t-=6;this.#u++,this.#e=t,this.#O=r}close(){let e=this.#e,t=this.#z;e>0&&(t.writeByte(R(this.#O<<6-e)),this.#e=0,this.#O=0);let n=this.#u;if(n%3!=0){let e=3-n%3;for(let n=0;n<e;n++)t.writeByte(61)}}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class F{#M;#D;#P;#N;#U=[];constructor(e,t,{foreground:n=[0,0,0],background:r=[255,255,255]}={}){this.#M=e,this.#D=t,this.#P=n,this.#N=r}#Z(){let e=this.#M,t=this.#D,n=new Z,r=this.#N,w=this.#P;return n.writeBytes([71,73,70,56,57,97]),n.writeInt16(e),n.writeInt16(t),n.writeBytes([128,0,0]),n.writeBytes([r[0],r[1],r[2]]),n.writeBytes([w[0],w[1],w[2]]),n.writeByte(44),n.writeInt16(0),n.writeInt16(0),n.writeInt16(e),n.writeInt16(t),n.writeByte(0),!/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t,n){let r=new N(2),w=new U(r);if(w.write(r.bof),e.length>0){let t=e[0],{length:n}=e;for(let i=1;i<n;i++){let n=e[i],s=r.get(t,n);null!=s?t=s:(w.write(t),r.add(t,n)||(w.write(r.bof),r.reset()),t=n)}w.write(t)}w.write(r.eof),w.pipe(n)}(this.#U,0,n),n.writeByte(59),n.bytes}set(e,t,n){this.#U[t*this.#M+e]=n}toDataURL(){let e=this.#Z(),t=new j;for(let n of e)t.write(n);t.close();let n=t.bytes,r="data:image/gif;base64,";for(let e of n)r+=L(e);return r}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class H{#L;#R;#h;#j;constructor(e,t,n,r){this.#L=r,this.#R=n,this.#j=e,this.#h=t}get mask(){return this.#L}get level(){return this.#R.name}get version(){return this.#h.version}get matrix(){return this.#j}toDataURL(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:2,{margin:t=4*e,...n}=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};e=Math.max(1,e>>0),t=Math.max(0,t>>0);let r=this.#j,w=r.size,i=e*w+2*t,s=new F(i,i,n),o=i-t;for(let n=0;n<i;n++)for(let w=0;w<i;w++)if(w>=t&&w<o&&n>=t&&n<o){let i=0|(w-t)/e,o=0|(n-t)/e;s.set(w,n,r.get(i,o))}else s.set(w,n,0);return s.toDataURL()}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let G=new Map;class Q{#F;#H;static CP437=new Q("cp437",0,2);static ISO_8859_1=new Q("iso-8859-1",1,3);static ISO_8859_2=new Q("iso-8859-2",4);static ISO_8859_3=new Q("iso-8859-3",5);static ISO_8859_4=new Q("iso-8859-4",6);static ISO_8859_5=new Q("iso-8859-5",7);static ISO_8859_6=new Q("iso-8859-6",8);static ISO_8859_7=new Q("iso-8859-7",9);static ISO_8859_8=new Q("iso-8859-8",10);static ISO_8859_9=new Q("iso-8859-9",11);static ISO_8859_10=new Q("iso-8859-10",12);static ISO_8859_11=new Q("iso-8859-11",13);static ISO_8859_13=new Q("iso-8859-13",15);static ISO_8859_14=new Q("iso-8859-14",16);static ISO_8859_15=new Q("iso-8859-15",17);static ISO_8859_16=new Q("iso-8859-16",18);static SJIS=new Q("sjis",20);static CP1250=new Q("cp1250",21);static CP1251=new Q("cp1251",22);static CP1252=new Q("cp1252",23);static CP1256=new Q("cp1256",24);static UTF_16BE=new Q("utf-16be",25);static UTF_8=new Q("utf-8",26);static ASCII=new Q("ascii",27,170);static BIG5=new Q("big5",28);static GB18030=new Q("gb18030",29);static EUC_KR=new Q("euc-kr",30);constructor(e,...t){for(let n of(this.#F=e,this.#H=t,t))G.set(n,this)}get label(){return this.#F}get values(){return this.#H}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let $=new Map;class q{#G;#e;#R;static L=new q("L",0,1);static M=new q("M",1,0);static Q=new q("Q",2,3);static H=new q("H",3,2);constructor(e,t,n){this.#e=n,this.#G=e,this.#R=t,$.set(n,this)}get bits(){return this.#e}get name(){return this.#G}get level(){return this.#R}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class J{#a;#x;constructor(e){this.#a=e,this.#x=new Int8Array(e*e)}get size(){return this.#a}set(e,t,n){this.#x[t*this.#a+e]=n}get(e,t){return this.#x[t*this.#a+e]}clear(e){this.#x.fill(e)}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function K(e,t){let n=[];for(let r of e){let e=r.charCodeAt(0);n.push(e>t?63:e)}return new Uint8Array(n)}function V(e,t){switch(t){case Q.ASCII:return K(e,127);case Q.ISO_8859_1:return K(e,255);case Q.UTF_8:return new TextEncoder().encode(e);default:throw Error("built-in encode only support ascii, utf-8 and iso-8859-1 charset")}}function Y(e,t,n){let r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:256,w=n.length-1,i=[];for(let s=e;s<t;){for(let e=0;e<w;e+=2)i.push([s+n[e],s+n[e+1]]);s+=r}return i}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */class X{#Q;#R;#Z;#h;constructor({hints:e={},level:t="L",version:n="auto",encode:r=V}={}){!function(e){let{fnc1:t}=e;if(null!=t){let[e]=t;if("GS1"!==e&&"AIM"!==e)throw Error("illegal fn1 hint");if("AIM"===e){let[,e]=t;if(e<0||e>255||!Number.isInteger(e))throw Error("illegal fn1 application indicator")}}}(e),function(e){if(0>["L","M","Q","H"].indexOf(e))throw Error("illegal error correction level")}(t),function(e){if("auto"!==e&&(e<1||e>40||!Number.isInteger(e)))throw Error('version must be "auto" or an integer in [1 - 40]')}(n),this.#Q=e,this.#Z=r,this.#h=n,this.#R=q[t]}encode(){let e;for(var t=arguments.length,n=Array(t),r=0;r<t;r++)n[r]=arguments[r];let w=this.#R,i=this.#Z,{fnc1:s}=this.#Q,l=this.#h,a=[],h=!1,[u]=Q.ISO_8859_1.values;for(let e of n){let{mode:t}=e,n=new y,r=x(e),w=r?e.encode(i):e.encode(),l=r?w.byteLength:e.content.length;u=function(e,t,n){if(x(t)){let[r]=t.charset.values;if(r!==n)return e.append(o.ECI.bits,4),r<128?e.append(r,8):r<16384?(e.append(2,2),e.append(r,14)):(e.append(6,3),e.append(r,21)),r}return n}(n,e,u),null==s||h||(h=!0,function(e,t){let[n,r]=t;switch(n){case"GS1":z(e,o.FNC1_FIRST_POSITION);break;case"AIM":z(e,o.FNC1_SECOND_POSITION),e.append(r,8)}}(n,s)),z(n,t),e.mode===o.HANZI&&n.append(1,4),a.push({mode:t,head:n,data:w,length:l})}if("auto"===l)e=function(e,t){let n=P(e,c[0]),r=D(n,t),w=P(e,r);return D(w,t)}(a,w);else{e=c[l-1];let t=P(a,e);if(!M(t,e,w))throw Error("data too big for requested version")}let f=new y;for(let{mode:t,head:n,data:r,length:w}of a)f.append(n),function(e,t,n,r){e.append(r,t.getCharacterCountBits(n))}(f,t,e,w),f.append(r);let b=e.getECBlocks(w);!function(e,t){let n=8*t;for(let t=0;t<4&&e.length<n;t++)e.append(0);let r=7&e.length;if(r>0)for(let t=r;t<8;t++)e.append(0);let w=t-e.byteLength;for(let t=0;t<w;t++)e.append(1&t?17:236,8)}(f,b.numTotalDataCodewords);let m=new J(e.size),I=function(e,t){let{ecBlocks:n,numECCodewordsPerBlock:r}=t,w=0,i=0,s=0,o=[];for(let{count:t,numDataCodewords:l}of n)for(let n=0;n<t;n++){let t=new Uint8Array(l);e.toUint8Array(8*s,t,0,l);let n=/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e,t){let n=e.length,r=new Int32Array(n+t);return r.set(e),new O().encode(r,t),new Uint8Array(r.subarray(n))}(t,r);o.push(new E(t,n)),s+=l,w=Math.max(w,n.length),i=Math.max(i,l)}let l=new y;for(let e=0;e<i;e++)for(let{dataCodewords:t}of o)e<t.length&&l.append(t[e],8);for(let e=0;e<w;e++)for(let{ecCodewords:t}of o)e<t.length&&l.append(t[e],8);return l}(f,b),C=function(e,t,n,r){let w=-1,i=Number.MAX_VALUE;for(let o=0;o<8;o++){var s;S(e,t,n,r,o);let l=g(s=e)+g(s,!0)+function(e){let t=0,n=e.size-1;for(let r=0;r<n;r++)for(let w=0;w<n;w++){let n=e.get(w,r);n===e.get(w+1,r)&&n===e.get(w,r+1)&&n===e.get(w+1,r+1)&&(t+=3)}return t}(s)+function(e){let t=0,{size:n}=e;for(let r=0;r<n;r++)for(let w=0;w<n;w++)w+6<n&&d(e,w,r)&&!d(e,w+1,r)&&d(e,w+2,r)&&d(e,w+3,r)&&d(e,w+4,r)&&!d(e,w+5,r)&&d(e,w+6,r)&&(p(e,r,w-4,w)||p(e,r,w+7,w+11))&&t++,r+6<n&&d(e,w,r)&&!d(e,w,r+1)&&d(e,w,r+2)&&d(e,w,r+3)&&d(e,w,r+4)&&!d(e,w,r+5)&&d(e,w,r+6)&&(p(e,w,r-4,r,!0)||p(e,w,r+7,r+11,!0))&&t++;return 40*t}(s)+function(e){let t=0,{size:n}=e;for(let r=0;r<n;r++)for(let w=0;w<n;w++)d(e,w,r)&&t++;let r=n*n,w=0|10*Math.abs(2*t-r)/r;return 10*w}(s);l<i&&(w=o,i=l)}return w}(m,I,e,w);return S(m,I,e,w,C),new H(m,e,w,C)}}/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */let W=function(e){for(var t=arguments.length,n=Array(t>1?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];let w=[],i=[],s=new Map,o=new TextDecoder(e,{fatal:!0});for(let[e,t]of n)for(let n=e;n<=t;n++)w.push(n>>8,255&n),i.push(n);let{length:l}=i,a=o.decode(new Uint8Array(w));for(let e=0;e<l;e++){let t=a.charAt(e);s.has(t)||s.set(t,i[e])}return s}("gb2312",[41377,41470],[41649,41698],[41701,41710],[41713,41724],[41889,41982],[42145,42227],[42401,42486],[42657,42680],[42689,42712],[42913,42945],[42961,42993],[43169,43194],[43205,43241],[43428,43503],...Y(45217,55038,[0,93]),[55201,55289],...Y(55457,63486,[0,93]));class ee{#$;constructor(e){!/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */function(e){if(!e)throw Error("segment content should be at least 1 character")}(e),this.#$=e}get mode(){return o.HANZI}get content(){return this.#$}encode(){let e=new y,t=this.#$;for(let n of t){let t=function(e){let t=W.get(e);return null!=t?t:-1}(n);if(t>=41377&&t<=43774)t-=41377;else if(t>=45217&&t<=64254)t-=42657;else throw Error(`illegal hanzi character: ${n}`);t=(t>>8)*96+(255&t),e.append(t,13)}return e}}var et=n(6832),en=n(3270),er=n(1445),ew=n(438),ei=n(4365),es=n(4535),eo=n(6735);let{useToken:el}=en.default,ea=(0,w.memo)(function(e){let{error:t,resetErrorBoundary:n}=e;return(0,r.jsx)(er.ZP,{status:"error",title:"页面错误",extra:(0,r.jsx)(ew.ZP,{type:"primary",onClick:n,children:"重试页面"}),subTitle:"抱歉，发生错误，无法渲染页面，请联系系统管理员或者重试页面！"})}),eh=(0,w.memo)(function(){let{token:e}=el(),{colorBgContainer:t}=e,n=(0,w.useMemo)(()=>{let e=new X({level:"H"}),t=e.encode(new ee("你好啊"));return t.toDataURL(4)},[]);return(0,r.jsx)(ei.Z,{className:"ui-app",style:{backgroundColor:t},message:{maxCount:3},children:(0,r.jsx)(et.SV,{FallbackComponent:ea,children:(0,r.jsx)(w.Suspense,{fallback:"loading",children:(0,r.jsx)(es.Z,{src:n,alt:"qrcode"})})})})});var ec=(0,w.memo)(function(){return(0,r.jsx)(eo.ZP,{locale:i.Z,children:(0,r.jsx)(eh,{})})}),eu=n(417);let ef=document.getElementById("app"),ed=(0,eu.s)(ef);ed.render((0,r.jsx)(ec,{}))}},function(e){e.O(0,[4],function(){return e(e.s=7284)}),e.O()}]);