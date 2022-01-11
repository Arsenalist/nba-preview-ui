import React, { useEffect, useRef, useState} from 'react';
import './App.css';
import axios from "axios";
const stringHash = require("string-hash");

interface ResponsePayload {
  team: TeamPreview,
  opponent: TeamPreview,
  odds: GameOdds
}

interface GameOdds {
  home_team: String,
  away_team: String,
  home_spread: String,
  away_spread: String,
  home_moneyline: String,
  away_moneyline: String,
  over_under: String
}

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
  lineup_by_position: Lineup,
  previous_results: GameResult[]
}

interface GameResult {
  opponent: string,
  opponent_logo_link: string,
  result: string,
  score: string,
  box_score_link: string
}

function App() {

  const [teams, setTeams] = useState<Team[]>([]);
  const [teamLineup, setTeamLineup] = useState<TeamPreview | undefined>(undefined);
  const [odds, setOdds] = useState<GameOdds | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [opponentTeamLineup, setOpponentLineup] = useState<TeamPreview | undefined>(undefined);
  const resultsRef = useRef(null);

  useEffect(() => {
    axios.post('https://espnapi.raptorsrepublic.com/teams').then((r) => {
      setTeams(r.data)
    })
  }, [])

  function injuryShowMore(e: any, hash: string) {
    const elem = document.getElementById("desc-" + hash);
    if (elem) { elem.style.display = '';}
    const elemButton = document.getElementById("btn-" + hash);
    if (elemButton) { elemButton.style.display = 'none';}
    e.preventDefault(); return false;
  }

  const loadPreview = (e: any) => {
    setLoading(true);
    setMessage("");
    axios.get<ResponsePayload>('https://espnapi.raptorsrepublic.com/nba/upcoming-probable-lineup/' + e.target.value).then((r) => {
      setLoading(false);
      setTeamLineup(r.data.team)
      setOpponentLineup(r.data.opponent)
      setOdds(r.data.odds)
    }).catch((r) => {
      setLoading(false);
      setMessage("There was a problem. Perhaps one of the teams is currently playing a game? Please report this incident.");
    })
  }

  const copyToClipboard = () => {
    if (resultsRef.current) {
      navigator.clipboard.writeText((resultsRef.current as any).innerHTML);
    }
  }

  const displayOdds = (odds: GameOdds) => {
    return         <div>
      <h3>Betting Lines</h3>
      <table className={"odds"}>
        <tr>
          <th>
            {odds?.away_team}
          </th>
          <th></th>
          <th>
            {odds?.home_team}
          </th>

        </tr>
        <tbody>
        <tr>
          <td>{odds?.away_spread}</td>
          <td>Spread</td>
          <td>{odds?.home_spread}</td>
        </tr>
        <tr>
          <td>{odds?.away_moneyline}</td>
          <td>Money Line</td>
          <td>{odds?.home_moneyline}</td>
        </tr>
        <tr>
          <td colSpan={3}>
            <div>Over/Under</div>
            <div>{odds?.over_under}</div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

  }

  const displayTeamData = (teamPreview: TeamPreview) => {
    const lineup = teamPreview.lineup_by_position;
    const injury_report = teamPreview.injury_report;
    const previous_results = teamPreview.previous_results;
    return <div id={"lineup"}>
      <h3>{teamPreview.injury_report.team_name} Results, Lineups & Injuries</h3>
      <div>
        <h4>Previous Results</h4>
        {previous_results && previous_results.map(result => (
            <div className={"previous-result"}>
              <span className={"opponent"}>{result.opponent}</span>
              <span className={"result"}> <span className={`result-indicator-${result.result}`}>{result.result}</span> <a href={result.box_score_link}>{result.score}</a></span>
            </div>
        ))}
      </div>

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
                <span className={"injury-name"}>{pi.name}, {pi.position}</span> - <span className={"injury-status"}>{pi.status}</span> {pi.description && <a data-hash={stringHash(pi.name)} id={`btn-${stringHash(pi.name)}`} href={"#"} onClick={e => injuryShowMore(e, stringHash(pi.name))} className={"injury-more-link"}>more</a> }
                {pi.description && <span style={{display: "none"}} id={`desc-${stringHash(pi.name)}`} className={"injury-description"}>{pi.description}</span>}
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
      {loading && <div>Hold up, doing a lot of gymnastics in the background...</div>}
      {message && <div>{message}</div>}
      {teamLineup && opponentTeamLineup && <button className={"copy-to-clipboard"} onClick={copyToClipboard}>Copy to Clipboard</button>}
      <div ref={resultsRef}>
        <div id={"team"}>
          {teamLineup && displayTeamData(teamLineup)}
        </div>
        <div id={"opponent"}>
          {opponentTeamLineup && displayTeamData(opponentTeamLineup)}
        </div>
        {odds && displayOdds(odds)}
      </div>
    </div>
  );
}

export default App;
