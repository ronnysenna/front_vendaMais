import { getProtectedSession } from "@/lib/get-protected-session"
import { ChartBar, Package2, QrCode, Users } from "lucide-react"

export default async function Dashboard() {
  const session = await getProtectedSession()

  return (
    <div className="container-fluid py-4">
      {/* Cabeçalho */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
        <h1 className="h3 mb-0 fw-bold">Dashboard</h1>
        <p className="text-muted mb-0 fw-medium">Bem-vindo, {session.user.name}</p>
      </div>

      {/* Cards de Resumo */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 hover-scale">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-primary-soft p-3 rounded-3 me-3">
                  <Package2 className="text-primary" size={24} />
                </div>
                <h6 className="card-title text-primary mb-0">Total de Produtos</h6>
              </div>
              <h3 className="mb-0 fw-bold">0</h3>
              <small className="text-muted">Produtos cadastrados</small>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 hover-scale">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-success-soft p-3 rounded-3 me-3">
                  <ChartBar className="text-success" size={24} />
                </div>
                <h6 className="card-title text-success mb-0">Vendas do Mês</h6>
              </div>
              <h3 className="mb-0 fw-bold">0</h3>
              <small className="text-muted">Vendas realizadas</small>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 hover-scale">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-info-soft p-3 rounded-3 me-3">
                  <QrCode className="text-info" size={24} />
                </div>
                <h6 className="card-title text-info mb-0">QR Codes</h6>
              </div>
              <h3 className="mb-0 fw-bold">0</h3>
              <small className="text-muted">QR Codes gerados</small>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card h-100 hover-scale">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-warning-soft p-3 rounded-3 me-3">
                  <Users className="text-warning" size={24} />
                </div>
                <h6 className="card-title text-warning mb-0">Clientes</h6>
              </div>
              <h3 className="mb-0 fw-bold">0</h3>
              <small className="text-muted">Clientes cadastrados</small>
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
                <h5 className="card-title mb-0">Vendas nos Últimos Meses</h5>
                <select className="form-select form-select-sm w-auto">
                  <option>Últimos 30 dias</option>
                  <option>Últimos 90 dias</option>
                  <option>Este ano</option>
                </select>
              </div>
              <div className="bg-light rounded-3 p-4 text-center">
                <p className="text-muted mb-0">Gráfico de vendas será implementado aqui</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title mb-0">Produtos Mais Vendidos</h5>
                <select className="form-select form-select-sm w-auto">
                  <option>Top 5</option>
                  <option>Top 10</option>
                  <option>Todos</option>
                </select>
              </div>
              <div className="bg-light rounded-3 p-4 text-center">
                <p className="text-muted mb-0">Gráfico de produtos será implementado aqui</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
