import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { TeamInfo } from "../../types/LunarTypes.ts";
import TeamListTable from "./misc/TeamListTable.tsx";
import useLeagueTeams from "../../hooks/useLeagueTeams";

export const LunarTeamsTab = () => {
  const navigate = useNavigate();

  // Use custom hook with filter for "Lunar Ligaen - " leagues
  const {
    teams: lunarTeams,
    loading,
    error,
  } = useLeagueTeams((league) => league.name.includes("Lunar Ligaen - "));
    const isLoading = loading || lunarTeams.length === 0;

  const handleRowClick = (team: TeamInfo) => {
    sessionStorage.setItem(`teamName_${team.id}`, team.name);
    navigate(`/holdligaer/${team.id}`);
  };

  return (
    <>
      <Helmet>
        <title>Lunar Ligaen</title>
      </Helmet>

      <div className="sm:mx-20 mx-2">
        {loading ? (
          <div className="text-center py-8">Indlæser hold...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <TeamListTable teams={lunarTeams} onRowClick={handleRowClick} loading={isLoading} />
        )}
      </div>
    </>
  );
};

export default LunarTeamsTab;
