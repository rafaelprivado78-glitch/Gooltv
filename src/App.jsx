import { useState, useEffect } from "react";

function App() {

const [jogos, setJogos] = useState([]);

useEffect(() => {

fetch("https://api.football-data.org/v4/matches",{
headers:{
"X-Auth-Token":"bd91c2292cc4479187eadddc25f14789"
}
})
.then(res => res.json())
.then(data => {
setJogos(data.matches);
});

}, []);

return (

<div style={{background:"#0f172a",color:"white",padding:"20px"}}>

<h1>⚽ GoolTV - Jogos de Hoje</h1>

{jogos.slice(0,15).map((jogo,i)=>(

<div key={i} style={{
background:"#1e293b",
margin:"10px",
padding:"10px",
borderRadius:"10px"
}}>

<h3>
{jogo.homeTeam.name} vs {jogo.awayTeam.name}
</h3>

<p>Status: {jogo.status}</p>

<button
onClick={()=>window.open(
`https://www.youtube.com/results?search_query=${jogo.homeTeam.name}+vs+${jogo.awayTeam.name}+ao+vivo`
)}
style={{
padding:"8px",
background:"red",
border:"none",
color:"white",
borderRadius:"5px"
}}
>

Assistir

</button>

</div>

))}

</div>

);

}

export default App;
