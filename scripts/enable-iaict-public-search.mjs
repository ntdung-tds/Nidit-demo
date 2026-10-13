import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
const root="artifacts/nidit-portal/dist/public/iaict-portal";
const file=join(root,"tim-kiem/index.html");
const entries=JSON.parse(await readFile("scripts/iaict-search-index.json","utf8"));
const engine=(await readFile("scripts/iaict-search-engine.mjs","utf8")).replaceAll("export function", "function");
const css=await readFile("scripts/iaict-search.css","utf8");
const categories=["Tất cả","Công nghệ","Giải pháp","Đào tạo","Dự án","Tri thức","Về Viện"];
let html=await readFile(file,"utf8");
if(html.includes('id="iaict-public-search"'))process.exit(0);
const markup=`<div class="public-search"><form role="search"><label for="site-search">Tìm trong nội dung IAICT</label><div class="public-search-box"><input id="site-search" name="q" type="search" maxlength="120" placeholder="Ví dụ: AI, IoT, Trâm Rừng, đào tạo..." aria-describedby="public-search-help"><button type="submit">Tìm kiếm <span aria-hidden="true">↗</span></button></div><p id="public-search-help">Tìm theo tên, chủ đề hoặc mô tả. Có thể nhập tiếng Việt không dấu.</p></form><div class="public-search-suggestions"><span>Gợi ý:</span>${["AI","IoT","Trâm Rừng","Đào tạo"].map(x=>`<button type="button" data-query="${x}">${x}</button>`).join("")}</div><div class="public-search-filters" role="group" aria-label="Lọc nhóm nội dung">${categories.map(x=>`<button type="button" data-category="${x}" aria-pressed="${x==="Tất cả"}">${x}</button>`).join("")}</div><div class="public-search-status"><p role="status" aria-live="polite"></p><button type="button" data-clear hidden>Xóa tìm kiếm &amp; bộ lọc</button></div><div class="public-search-results"></div><div class="public-search-empty" hidden><h3>Chưa tìm thấy nội dung phù hợp.</h3><p>Thử từ khóa ngắn hơn hoặc chọn “Tất cả”. Bạn cũng có thể xem các nhóm nội dung bên dưới.</p><button type="button" data-clear>Xem tất cả nội dung</button></div><noscript><p>Bật JavaScript để tìm kiếm hoặc sử dụng các liên kết nội dung bên dưới.</p></noscript></div>`;
const start=html.indexOf('<div class="v9-discovery">');if(start<0)throw Error('Search area missing');
const rx=/<div\b[^>]*>|<\/div>/g;rx.lastIndex=start;let depth=0,end=-1,m;
while((m=rx.exec(html))){depth+=m[0].startsWith('</')?-1:1;if(depth===0){end=rx.lastIndex;break;}}
if(end<0)throw Error('Search area not closed');
html=html.slice(0,start)+markup+html.slice(end);
html=html.replace('Trong khi tìm kiếm toàn văn đang được hoàn thiện, trang này đóng vai trò bản đồ khám phá: đi từ nhu cầu đến đúng nhóm nội dung, giải pháp, dự án hoặc chương trình đào tạo.','Tìm sản phẩm, giải pháp, dự án và chương trình đào tạo trong nội dung IAICT đang công khai. Bắt đầu bằng một từ khóa hoặc chọn nhóm chủ đề phù hợp.').replace('Khám phá theo chủ đề ngay cả khi chưa cần gõ từ khóa.','Bạn đang tìm nội dung nào?').replace('Các lối đi dưới đây đưa người dùng trực tiếp đến đúng nhóm nội dung thay vì để một ô tìm kiếm chưa có dữ liệu tạo ra trải nghiệm rỗng.','Tìm nhanh theo tên hoặc mô tả, sau đó lọc kết quả theo nhóm nội dung.');
const script=`<script id="iaict-public-search-script">(() => {
${engine}
const entries=${JSON.stringify(entries)},categories=${JSON.stringify(categories)};
const root=document.querySelector('.public-search'),input=root.querySelector('input'),results=root.querySelector('.public-search-results'),status=root.querySelector('[role=status]'),empty=root.querySelector('.public-search-empty'),clear=root.querySelector('.public-search-status [data-clear]');
let query='',category='Tất cả';
function node(tag,text){const n=document.createElement(tag);n.textContent=text;return n;}
function render(){const found=searchPublicContent(entries,query,category);results.replaceChildren();status.textContent=found.length+' kết quả'+(query?' cho “'+query+'”':' trong nội dung đang công khai');empty.hidden=found.length!==0;clear.hidden=!query&&category==='Tất cả';root.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===category)));
for(const item of found){const article=node('article',''),label=node('span',item.category),heading=node('h3',''),link=node('a',item.title),arrow=node('span','↗');arrow.setAttribute('aria-hidden','true');const [path,anchor]=item.href.split('#');link.href='/Nidit-demo/iaict-portal'+path+(path.endsWith('/')?'':'/')+(anchor?'#'+anchor:'');link.append(arrow);heading.append(link);article.append(label,heading,node('p',item.summary));results.append(article);}}
function search(value,group=category){query=value.trim().slice(0,120);category=group;input.value=query;const url=new URL(location.href);if(query)url.searchParams.set('q',query);else url.searchParams.delete('q');if(category!=='Tất cả')url.searchParams.set('nhom',category);else url.searchParams.delete('nhom');history.pushState(null,'',url);render();}
function sync(){const params=new URLSearchParams(location.search);query=(params.get('q')||'').slice(0,120);const group=params.get('nhom');category=categories.includes(group)?group:'Tất cả';input.value=query;render();}
root.querySelector('form').addEventListener('submit',e=>{e.preventDefault();search(input.value);});root.querySelectorAll('[data-query]').forEach(b=>b.addEventListener('click',()=>search(b.dataset.query,'Tất cả')));root.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>search(query,b.dataset.category)));root.querySelectorAll('[data-clear]').forEach(b=>b.addEventListener('click',()=>{search('','Tất cả');input.focus();}));window.addEventListener('popstate',sync);sync();
})();</script>`;
html=html.replace('</head>',`<style id="iaict-public-search">${css}</style></head>`).replace('</body>',script+'</body>');
await writeFile(file,html);
console.log('IAICT public search enabled: '+entries.length+' entries, Vietnamese normalization and category filters.');
