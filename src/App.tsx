import React, {useEffect, useState} from 'react';
import './App.css';
import axios from "axios";

interface Team {
  id: string
  full_name: string
}
// awkward naming of Player/PlayerBoxScore; also used by content.raptorsrepublic.com
interface Player {
  id: string
  player: PlayerBoxScore
}
interface PlayerBoxScore {
  first_initial_and_last_name: string
}

interface Lineup {
  PG: Player[]
  PF: Player[]
  SF: Player[]
  C: Player[]
  SG: Player[]
}

function App() {

  const [teams, setTeams] = useState<Team[]>([]);
  const [teamLineup, setTeamLineup] = useState<Lineup | undefined>(undefined);
  const [opponentTeamLineup, setOpponentLineup] = useState<Lineup | undefined>(undefined);

  useEffect(() => {
    axios.post('https://espnapi.raptorsrepublic.com/teams').then((r) => {
      setTeams(r.data)
    })
  }, [])

  const loadPreview = (e: any) => {
    axios.get('https://espnapi.raptorsrepublic.com/nba/upcoming-probable-lineup/' + e.target.value).then((r) => {
      setTeamLineup(r.data[0])
      setOpponentLineup(r.data[1])
    })
  }
  const displayTeamData = (lineup: Lineup) => {
    return <div id={"lineup"}>
      <div>
      PF: {lineup.PF.map((p: Player) => p.player.first_initial_and_last_name).join(", ")}<br/>
      SF: {lineup.SF.map((p: Player) => p.player.first_initial_and_last_name).join(", ")}<br/>
      C: {lineup.C.map((p: Player) => p.player.first_initial_and_last_name).join(", ")}<br/>
      PG: {lineup.PG.map((p: Player) => p.player.first_initial_and_last_name).join(", ")}<br/>
      SG: {lineup.SG.map((p: Player) => p.player.first_initial_and_last_name).join(", ")}<br/>
      </div>
    </div>
  }

  return (
    <div className="App">
      <select onChange={loadPreview}>
        <option key={"default"}>Select a team buddy</option>

      {teams && teams.map(t => (
          <option key={t.id} value={t.id}>{t.full_name}</option>
      ))}
      </select>
      <div>
        {teamLineup && displayTeamData(teamLineup)}
        <hr/>
        {opponentTeamLineup && displayTeamData(opponentTeamLineup)}
      </div>
    </div>
  );
}

export default App;
