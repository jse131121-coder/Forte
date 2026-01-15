/* ===== 기본 데이터 ===== */
const LS = localStorage;
let state = {
  me: null,
  room: null
};

function load(key, def){ return JSON.parse(LS.getItem(key)||JSON.stringify(def)) }
function save(key, val){ LS.setItem(key, JSON.stringify(val)) }

let accounts = load("accounts", [
  {id:"Forte",pw:"01024773752",name:"Forte",role:"admin",img:""}
]);
let posts = load("posts", []);
let rooms = load("rooms", [
  {id:Date.now(),name:"Forte Chat",msgs:[]}
]);

/* ===== 로그인 ===== */
loginBtn.onclick=()=>{
  const id=loginId.value.trim(), pw=loginPw.value.trim();
  const acc=accounts.find(a=>a.id===id&&a.pw===pw);
  if(!acc) return alert("로그인 실패");
  state.me=acc;
  loginModal.classList.add("hidden");
  app.classList.remove("hidden");
  renderAll();
};

/* ===== 네비 ===== */
function go(id){
  document.querySelectorAll("section").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if(id==="chat" && state.room) renderChat();
}

/* ===== 커뮤니티 ===== */
postBtn.onclick=()=>{
  if(!postText.value.trim())return;
  posts.unshift({
    id:Date.now(),
    text:postText.value,
    author:state.me.id,
    pin:false
  });
  postText.value="";
  save("posts",posts);
  renderPosts();
};

function renderPosts(){
  postList.innerHTML="";
  posts
   .sort((a,b)=>b.pin-a.pin)
   .forEach(p=>{
    const div=document.createElement("div");
    div.className="card";
    div.innerHTML=`
      <b>${p.author}${p.pin?" 📌":""}</b>
      <p>${p.text}</p>
      ${state.me.role==="admin"?
      `<button onclick="editPost(${p.id})">수정</button>
       <button onclick="delPost(${p.id})">삭제</button>
       <button onclick="pinPost(${p.id})">고정</button>`:""}
    `;
    postList.appendChild(div);
   });
}
function delPost(id){posts=posts.filter(p=>p.id!==id);save("posts",posts);renderPosts()}
function pinPost(id){posts.forEach(p=>p.pin=p.id===id?!p.pin:p.pin);save("posts",posts);renderPosts()}
function editPost(id){
  const p=posts.find(p=>p.id===id);
  const t=prompt("수정",p.text);
  if(t!==null){p.text=t;save("posts",posts);renderPosts()}
}

/* ===== 채팅방 ===== */
createRoomBtn.onclick=()=>{
  if(state.me.role!=="admin")return;
  const n=prompt("채팅방 이름");
  if(!n)return;
  rooms.push({id:Date.now(),name:n,msgs:[]});
  save("rooms",rooms);renderRooms();
};

function renderRooms(){
  roomList.innerHTML="";
  rooms.forEach(r=>{
    const d=document.createElement("div");
    d.className="card";
    d.textContent=r.name;
    d.onclick=()=>{state.room=r;go("chat")};
    roomList.appendChild(d);
  });
}

/* ===== 채팅 ===== */
sendChatBtn.onclick=sendChat;
chatInput.onkeydown=e=>{if(e.ctrlKey&&e.key==="Enter")sendChat()};

function sendChat(){
  if(!chatInput.value.trim())return;
  state.room.msgs.push({
    id:Date.now(),
    text:chatInput.value,
    user:state.me.id,
    time:new Date().toLocaleDateString()
  });
  chatInput.value="";
  save("rooms",rooms);
  renderChat();
}

function renderChat(){
  chatTitle.innerHTML=`
    <b>${state.room.name}</b>
    ${state.me.role==="admin"?`<button onclick="renameRoom()">이름변경</button>`:""}
  `;
  chatBox.innerHTML="";
  let lastDate="";
  state.room.msgs.forEach(m=>{
    if(m.time!==lastDate){
      const dl=document.createElement("div");
      dl.className="dateLine";
      dl.textContent=m.time;
      chatBox.appendChild(dl);
      lastDate=m.time;
    }
    const div=document.createElement("div");
    div.className="msg "+(m.user===state.me.id?"me":"other");
    div.textContent=m.text;
    if(state.me.role==="admin"){
      div.onclick=()=>{
        if(confirm("삭제?")){
          state.room.msgs=state.room.msgs.filter(x=>x.id!==m.id);
          save("rooms",rooms);renderChat();
        }
      };
    }
    chatBox.appendChild(div);
  });
}

function renameRoom(){
  const n=prompt("새 이름",state.room.name);
  if(n){state.room.name=n;save("rooms",rooms);renderRooms();renderChat()}
}

/* ===== 프로필 / 계정 ===== */
saveProfile.onclick=()=>{
  state.me.name=profileName.value;
  const f=profileImg.files[0];
  if(f){
    const r=new FileReader();
    r.onload=()=>{state.me.img=r.result;save("accounts",accounts)};
    r.readAsDataURL(f);
  }else save("accounts",accounts);
  alert("저장됨");
};

addAccountBtn.onclick=()=>{
  if(state.me.role!=="admin")return;
  const id=prompt("ID"), pw=prompt("PW");
  if(id&&pw){
    accounts.push({id,pw,name:id,role:"admin",img:""});
    save("accounts",accounts);
  }
};

/* ===== 렌더 ===== */
function renderAll(){
  profileName.value=state.me.name;
  renderPosts();
  renderRooms();
}
