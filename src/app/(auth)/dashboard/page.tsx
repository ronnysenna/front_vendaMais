import { getProtectedSession } from "@/lib/get-protected-session";
import { ChartBar, Package2, QrCode, Users } from "lucide-react";

export default async function Dashboard() {
  const session = await getProtectedSession();

  return (
    <div className="container-fluid py-4">
      {/* Cabeçalho */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4 p-3 bg-white rounded-4 shadow-sm">
        <div>
          <h1 className="h3 mb-1 fw-bold gradient-number">Dashboard</h1>
          <p className="text-muted mb-0">
            Visualize suas métricas em tempo real
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
                  <Package2 className="text-primary" size={24} />
                </div>
                <h6 className="card-title text-primary mb-0 fw-semibold">
                  Total de Produtos
                </h6>
              </div>
              <h3 className="mb-0 gradient-number display-6">0</h3>
              <small className="text-muted fw-medium">
                Produtos cadastrados
              </small>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 card-status-success">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-glass p-3 rounded-4 me-3">
                  <ChartBar className="text-success" size={24} />
                </div>
                <h6 className="card-title text-success mb-0 fw-semibold">
                  Vendas do Mês
                </h6>
              </div>
              <h3 className="mb-0 gradient-number display-6">0</h3>
              <small className="text-muted fw-medium">Vendas realizadas</small>
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
                  QR Codes
                </h6>
              </div>
              <h3 className="mb-0 gradient-number display-6">0</h3>
              <small className="text-muted fw-medium">QR Codes gerados</small>
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
              <h3 className="mb-0 gradient-number display-6">0</h3>
              <small className="text-muted fw-medium">
                Clientes cadastrados
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos (placeholders) */}
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title mb-0 fw-bold">
                  Vendas nos Últimos Meses
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
                    Gráfico de vendas será implementado aqui
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
                  Produtos Mais Vendidos
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
                    Gráfico de produtos será implementado aqui
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
