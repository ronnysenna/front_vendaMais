import { getProtectedSession } from "@/lib/get-protected-session";
import {
  CalendarCheck,
  CheckCircle,
  Clock,
  QrCode,
  Users,
  Calendar,
  BadgeX,
  Repeat
} from "lucide-react";

export default async function Dashboard() {
  const session = await getProtectedSession();

  return (
    <div className="container-fluid py-4">
      {/* Cabeçalho */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4 p-3 bg-white rounded-4 shadow-sm">
        <div>
          <h1 className="h3 mb-1 fw-bold gradient-number">Dashboard</h1>
          <p className="text-muted mb-0">
            Visualize métricas de agendamentos em tempo real
          </p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="text-end">
            <p className="text-muted mb-1 small">Bem-vindo de volta</p>
            <p className="mb-0 fw-semibold">{session.user.name}</p>
          </div>
          <div className="icon-glass p-2 rounded-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 card-status-primary">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-glass p-3 rounded-4 me-3">
                  <CalendarCheck className="text-primary" size={24} />
                </div>
                <h6 className="card-title text-primary mb-0 fw-semibold">
                  Total de Agendamentos
                </h6>
              </div>
              <h3 className="mb-0 gradient-number display-6">42</h3>
              <small className="text-muted fw-medium">
                Nos últimos 30 dias
              </small>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 card-status-success">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-glass p-3 rounded-4 me-3">
                  <CheckCircle className="text-success" size={24} />
                </div>
                <h6 className="card-title text-success mb-0 fw-semibold">
                  Taxa de Comparecimento
                </h6>
              </div>
              <h3 className="mb-0 gradient-number display-6">87%</h3>
              <small className="text-muted fw-medium">Clientes presentes</small>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 card-status-info">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-glass p-3 rounded-4 me-3">
                  <QrCode className="text-info" size={24} />
                </div>
                <h6 className="card-title text-info mb-0 fw-semibold">
                  Conexões WhatsApp
                </h6>
              </div>
              <h3 className="mb-0 gradient-number display-6">1</h3>
              <small className="text-muted fw-medium">Dispositivos conectados</small>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 card-status-warning">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-glass p-3 rounded-4 me-3">
                  <Users className="text-warning" size={24} />
                </div>
                <h6 className="card-title text-warning mb-0 fw-semibold">
                  Clientes
                </h6>
              </div>
              <h3 className="mb-0 gradient-number display-6">28</h3>
              <small className="text-muted fw-medium">
                Clientes únicos
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos e métricas de agendamento */}
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title mb-0 fw-bold">
                  Agendamentos por Período
                </h5>
                <select className="select-modern">
                  <option>Últimos 30 dias</option>
                  <option>Últimos 90 dias</option>
                  <option>Este ano</option>
                </select>
              </div>
              <div className="chart-placeholder">
                <div className="text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mb-3 text-primary"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                  <p className="text-muted mb-0 fw-medium">
                    Gráfico de agendamentos será implementado aqui
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title mb-0 fw-bold">
                  Serviços Mais Agendados
                </h5>
                <select className="select-modern">
                  <option>Top 5</option>
                  <option>Top 10</option>
                  <option>Todos</option>
                </select>
              </div>
              <div className="chart-placeholder">
                <div className="text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mb-3 text-primary"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m3 15 4-4 4 4 4-4 4 4" />
                  </svg>
                  <p className="text-muted mb-0 fw-medium">
                    Gráfico de serviços será implementado aqui
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas adicionais */}
      <div className="row g-4 mt-2">
        <div className="col-12 col-lg-4">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-glass p-3 rounded-4 me-3">
                  <Clock className="text-primary" size={20} />
                </div>
                <h6 className="card-title mb-0 fw-semibold">Taxa de Ocupação</h6>
              </div>
              <div className="progress mb-3" style={{ height: "10px" }}>
                <div
                  className="progress-bar bg-primary"
                  role="progressbar"
                  style={{ width: "65%" }}
                  aria-valuenow={65}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="small text-muted">Horários ocupados</span>
                <span className="fw-medium gradient-number">65%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-glass p-3 rounded-4 me-3">
                  <BadgeX className="text-danger" size={20} />
                </div>
                <h6 className="card-title mb-0 fw-semibold">Taxa de Cancelamento</h6>
              </div>
              <div className="progress mb-3" style={{ height: "10px" }}>
                <div
                  className="progress-bar bg-danger"
                  role="progressbar"
                  style={{ width: "12%" }}
                  aria-valuenow={12}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="small text-muted">Agendamentos cancelados</span>
                <span className="fw-medium text-danger">12%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-glass p-3 rounded-4 me-3">
                  <Repeat className="text-success" size={20} />
                </div>
                <h6 className="card-title mb-0 fw-semibold">Taxa de Retorno</h6>
              </div>
              <div className="progress mb-3" style={{ height: "10px" }}>
                <div
                  className="progress-bar bg-success"
                  role="progressbar"
                  style={{ width: "58%" }}
                  aria-valuenow={58}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="small text-muted">Clientes recorrentes</span>
                <span className="fw-medium text-success">58%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Próximos agendamentos */}
      <div className="card mt-4">
        <div className="card-body">
          <h5 className="card-title mb-4 fw-bold">Próximos Agendamentos</h5>

          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Serviço</th>
                  <th>Data</th>
                  <th>Hora</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>João Silva</td>
                  <td>Corte de Cabelo</td>
                  <td>09/08/2025</td>
                  <td>10:00</td>
                  <td><span className="badge bg-primary">Agendado</span></td>
                </tr>
                <tr>
                  <td>Maria Oliveira</td>
                  <td>Manicure e Pedicure</td>
                  <td>09/08/2025</td>
                  <td>14:30</td>
                  <td><span className="badge bg-success">Confirmado</span></td>
                </tr>
                <tr>
                  <td>Carlos Mendes</td>
                  <td>Barba</td>
                  <td>10/08/2025</td>
                  <td>11:15</td>
                  <td><span className="badge bg-warning">Pendente</span></td>
                </tr>
                <tr>
                  <td>Ana Sousa</td>
                  <td>Hidratação</td>
                  <td>10/08/2025</td>
                  <td>15:00</td>
                  <td><span className="badge bg-primary">Agendado</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
