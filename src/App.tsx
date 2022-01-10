import React, { useEffect, useRef, useState} from 'react';
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
interface PlayerInjury {
  name: string,
  date: string,
  position: string,
  status: string
  description: string
}
interface InjuryReport {
  team_name: string,
  injuries: PlayerInjury[]
}

interface TeamPreview {
  injury_report: InjuryReport,
  lineup_by_position: Lineup
}

function App() {

  const [teams, setTeams] = useState<Team[]>([]);
  const [teamLineup, setTeamLineup] = useState<TeamPreview | undefined>(undefined);
  const [opponentTeamLineup, setOpponentLineup] = useState<TeamPreview | undefined>(undefined);
  const resultsRef = useRef(null);

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

  const copyToClipboard = () => {
    console.log("a")
    console.log(resultsRef.current);
    console.log("b")
    if (resultsRef.current) {
      console.log("b2")
      navigator.clipboard.writeText((resultsRef.current as any).innerHTML);
    }

    console.log("d")
  }

  const displayTeamData = (teamPreview: TeamPreview) => {
    const lineup = teamPreview.lineup_by_position;
    const injury_report = teamPreview.injury_report;
    return <div id={"lineup"}>
      <h3>{teamPreview.injury_report.team_name} Probable Lineups & Injuries</h3>
      <div>
        <h4>Probable Lineup</h4>
        {lineup.PF && <div className={"lineup-player"}><span className={"lineup-position"}>PF:</span> {lineup.PF.map((p: Player) => p.player.first_initial_and_last_name).join(", ")}</div>}
        {lineup.SF && <div className={"lineup-player"}><span className={"lineup-position"}>SF:</span> {lineup.SF.map((p: Player) => p.player.first_initial_and_last_name).join(", ")}</div>}
        {lineup.C &&  <div className={"lineup-player"}><span className={"lineup-position"}>C:</span> {lineup.C.map((p: Player) => p.player.first_initial_and_last_name).join(", ")}</div>}
        {lineup.PG && <div className={"lineup-player"}><span className={"lineup-position"}>PG:</span> {lineup.PG.map((p: Player) => p.player.first_initial_and_last_name).join(", ")}</div>}
        {lineup.SG && <div className={"lineup-player"}><span className={"lineup-position"}>SG:</span> {lineup.SG.map((p: Player) => p.player.first_initial_and_last_name).join(", ")}</div>}
      </div>
      <div>
        <h4>Injuries</h4>
        {injury_report && injury_report.injuries.map(pi => (
            <>
              <div className={"injury-player"}>
                <span className={"injury-name"}>{pi.name}, {pi.position}</span> - <span className={"injury-status"}>{pi.status}</span>
                {pi.description && <span className={"injury-description"}>{pi.description}</span>}
              </div>
            </>
        ))}
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
      {teamLineup && opponentTeamLineup && <button className={"copy-to-clipboard"} onClick={copyToClipboard}>Copy to Clipboard</button>}
      <div ref={resultsRef}>
        <div id={"team"}>
          {teamLineup && displayTeamData(teamLineup)}
        </div>
        <div id={"opponent"}>
          {opponentTeamLineup && displayTeamData(opponentTeamLineup)}
        </div>
      </div>
    </div>
  );
}

export default App;
