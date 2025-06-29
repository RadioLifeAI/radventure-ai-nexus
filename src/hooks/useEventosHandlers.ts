
import { useNavigate } from "react-router-dom";

export function useEventosHandlers() {
  const navigate = useNavigate();

  const handleEnterEvent = (eventId: string) => {
    navigate(`/app/evento/${eventId}`);
  };

  return {
    handleEnterEvent
  };
}
