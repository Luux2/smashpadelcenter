import {FC} from "react";
import Tournament from "../../../types/Tournament.ts";
import LoadingSpinner from "../../misc/LoadingSpinner.tsx";
import { format } from "date-fns";
import {registerLocale} from "react-datepicker";
import {da} from "date-fns/locale";
registerLocale("da", da);

type TournamentSelectorProps = {
  tournaments: Tournament[];
  selectedTournament: Tournament | null;
  loading: boolean;
  onSelect: (tournament: Tournament) => void;
};

const TournamentSelector: FC<TournamentSelectorProps> = ({
  tournaments,
  selectedTournament,
  loading,
  onSelect,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingTournaments = tournaments.filter(
    (tournament) => new Date(tournament.endDate) >= today
  );

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-3">Vælg turnering</h2>
      {loading ? (
        <div className="flex items-center text-gray-500">
          <LoadingSpinner />
          Indlæser turneringer...
        </div>
      ) : upcomingTournaments.length === 0 ? (
        <p className="text-gray-500">Ingen kommende turneringer tilgængelige.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingTournaments.map((tournament) => (
            <div
              key={tournament.eventId}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedTournament?.eventId === tournament.eventId
                  ? "border-cyan-500"
                  : "hover:bg-gray-600"
              }`}
              onClick={() => onSelect(tournament)}
            >
              <h3 className="font-bold">{tournament.eventName}</h3>
              <p className="text-gray-400">
                {tournament.club}, {tournament.city}
              </p>
              <p className="text-gray-400">
                {format(new Date(tournament.startDate), "dd. MMMM yyyy", {locale: da})}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TournamentSelector;
