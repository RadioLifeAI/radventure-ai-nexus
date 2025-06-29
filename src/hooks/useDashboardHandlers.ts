
import { useNavigate } from "react-router-dom";

export function useDashboardHandlers() {
  const navigate = useNavigate();

  const handleCentralCasos = () => {
    navigate('/app/casos');
  };

  const handleCriarJornada = () => {
    navigate('/app/jornada/criar');
  };

  const handleEventos = () => {
    navigate('/app/eventos');
  };

  const handleConquistas = () => {
    navigate('/app/conquistas');
  };

  const handleEnterEvent = (eventId: string) => {
    navigate(`/app/evento/${eventId}`);
  };

  return {
    handleCentralCasos,
    handleCriarJornada,
    handleEventos,
    handleConquistas,
    handleEnterEvent
  };
}
