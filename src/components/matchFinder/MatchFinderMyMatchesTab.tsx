import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { PadelMatch } from "../../types/PadelMatch";
import communityApi from "../../services/makkerborsService";
import LoadingSpinner from "../misc/LoadingSpinner";
import { format } from "date-fns";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { registerLocale } from "react-datepicker";
import { da } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";
registerLocale("da", da);

export const MatchFinderMyMatchesTab = () => {
  const navigate = useNavigate();
  const { username } = useUser();

  const [matches, setMatches] = useState<PadelMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        if (username) {
          // Use getMatchesByUser to directly fetch user-specific matches from the server
          const data = await communityApi.getMatchesByUser(username);
          setMatches(data);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching matches:", err);
        setError("Failed to load matches");
        setLoading(false);
      }
    };
    fetchMatches().then();
  }, [username]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const safeFormatDate = (dateString: string, formatString: string): string => {
    try {
      const utcDate = new Date(dateString);
      const zoned = toZonedTime(utcDate, "UTC");

      return format(zoned, formatString, { locale: da });
    } catch {
      return "Ugyldig dato";
    }
  };

  return (
    <>
      <Helmet>
        <title>Tilmeldt</title>
      </Helmet>

      <div className="text-sm">
        {matches.map((match) => (
          <div
            onClick={() => navigate(`/makkerbørs/${match.id}`)}
            key={match.id}
            className="border p-4 rounded-lg space-y-1.5 hover:bg-gray-700 mb-5"
          >
            <div className="flex justify-between">
              <h1 className="font-semibold">
                {safeFormatDate(
                  match.matchDateTime,
                  "EEEE | dd. MMMM | HH:mm"
                ).toUpperCase()}{" "}
                - {match.endTime}
              </h1>
              <h1 className="bg-red-500 text-white rounded-full px-1.5 py-0.5 text-xs animate-pulse">
                {match.joinRequests.length}
              </h1>
            </div>

            <div className="flex justify-between border-b border-gray-600">
              <p>{match.location}</p>
              <p>Herre</p>
            </div>
            <div className="flex justify-between">
              <p>Niveau {match.level}</p>

              <div className="flex">
                {[
                  ...Array(
                    match.participants.length +
                      match.reservedSpots.length +
                      match.joinRequests.length
                  ),
                ].map((_, i) => (
                  <UserCircleIcon
                    key={`participant-${i}`}
                    className="h-5 text-cyan-500"
                  />
                ))}

                {[
                  ...Array(
                    match.totalSpots -
                      (match.participants.length +
                        match.reservedSpots.length +
                        match.joinRequests.length)
                  ),
                ].map((_, i) => (
                  <UserCircleIcon
                    key={`empty-${i}`}
                    className="h-5 text-gray-500"
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-500">Oprettet af {match.username}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default MatchFinderMyMatchesTab;
