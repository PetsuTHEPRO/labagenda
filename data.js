(function(){
const DB_KEY="labagenda_data_v2";
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const write=value=>localStorage.setItem(DB_KEY,JSON.stringify(value));
const date=n=>new Date(Date.now()+n*86400000).toISOString().slice(0,10);
const seeds=[
 {id:"booking-student-1",date:date(0),start:"14:00",end:"16:00",title:"Projeto de pesquisa",owner:"João Silva",ownerId:"stu-joao",role:"STUDENT",institutional:false,status:"Confirmado"},
 {id:"booking-student-2",date:date(1),start:"09:00",end:"11:00",title:"Monitoria de programação",owner:"Ana Beatriz",ownerId:"stu-ana",role:"STUDENT",institutional:false,status:"Confirmado"},
 {id:"booking-student-3",date:date(2),start:"10:00",end:"12:00",title:"Atividade orientada",owner:"Marina Costa",ownerId:"stu-marina",role:"STUDENT",institutional:false,status:"Confirmado"},
 {id:"booking-coord-1",date:date(0),start:"08:00",end:"10:00",title:"Reserva para aula prática",owner:"Carlos Mendes",ownerId:"coord-carlos",role:"COORDINATOR",institutional:true,status:"Confirmado"},
 {id:"booking-super-1",date:date(0),start:"10:00",end:"12:00",title:"Manutenção preventiva",owner:"Fernanda Oliveira",ownerId:"sup-fernanda",role:"SUPERVISOR",institutional:true,status:"Confirmado"}
];
const key=b=>[b.date,b.start,b.end,b.owner].join("|");
function normalize(b){const owner=b.owner==="Você"?"João Silva":b.owner,role=b.role==="COORDENAÇÃO"?"COORDINATOR":b.role||"STUDENT";return {...b,id:b.id||`booking-${Date.now()}`,owner,ownerId:b.ownerId||(owner==="João Silva"?"stu-joao":owner==="Carlos Mendes"?"coord-carlos":owner==="Fernanda Oliveira"?"sup-fernanda":""),role,institutional:role!=="STUDENT",status:b.status||"Confirmado"}}
function migrate(){const legacy=[...read("labagenda_bookings",[]),...read("labagenda_coord_bookings",[]),...read("labagenda_super_bookings",[])],all=[...seeds,...legacy].map(normalize);return [...new Map(all.map(b=>[key(b),b])).values()]}
let db=read(DB_KEY,null);if(!db||!Array.isArray(db.bookings)){db={version:2,bookings:migrate()};write(db)}
const persist=()=>write(db);
window.LabData={bookings:{list(){return db.bookings},create(input){const item=normalize({...input,id:input.id||`booking-${Date.now()}`});db.bookings.push(item);persist();return item},remove(id,ownerId){const size=db.bookings.length;db.bookings=db.bookings.filter(x=>String(x.id)!==String(id)||(ownerId&&x.ownerId!==ownerId));if(size!==db.bookings.length)persist();return size!==db.bookings.length},hasConflict({date,start,end,ignoreId}){return db.bookings.some(x=>String(x.id)!==String(ignoreId)&&x.date===date&&start<x.end&&end>x.start)}}};
})();
